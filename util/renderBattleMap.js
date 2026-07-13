import { feature } from "topojson-client";
import { geoMercator, geoPath, geoContains, geoCentroid } from "d3-geo";
import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";

const CACHE_PATH = new URL("./cache/map-geo.json", import.meta.url);

const WIDTH = 500;
const HEIGHT = 300;

// Base map scale at prep time
const BASE_ZOOM_MULTIPLIER = 1;

// Per-render focus zoom
const FOCUS_ZOOM = 10;

// Process-lifetime cache
let preparedMapCache = null;

async function getMapData() {
  if (existsSync(CACHE_PATH)) {
    const cached = await readFile(CACHE_PATH, "utf8");
    return JSON.parse(cached);
  }

  const res = await fetch("https://api6.warera.io/trpc/map.getMapData");
  if (!res.ok) {
    throw new Error(`Failed to fetch map data: ${res.status} ${res.statusText}`);
  }

  const map = await res.json();

  const topology = map?.result?.data?.map ?? map?.result?.data ?? map?.map;
  if (!topology) throw new Error("Map topology not found");

  const objectName = topology.objects?.regions
    ? "regions"
    : Object.keys(topology.objects || {})[0];
  if (!objectName) throw new Error("No topology objects found");

  const geo = feature(topology, topology.objects[objectName]);

  // Cache GeoJSON to skip TopoJSON conversion next runs
  await writeFile(CACHE_PATH, JSON.stringify(geo), "utf8");
  return geo;
}

function pointInBbox([x, y], [[minX, minY], [maxX, maxY]]) {
  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

async function prepareMap() {
  if (preparedMapCache) return preparedMapCache;

  const geo = await getMapData();
  const features = geo.features ?? [];

  // Fixed projection (never recentered per call)
  const projection = geoMercator().fitSize([WIDTH, HEIGHT], geo);

  // Optional base zoom while keeping map fixed
  const fittedScale = projection.scale();
  projection
    .scale(fittedScale * BASE_ZOOM_MULTIPLIER)
    .translate([WIDTH / 2, HEIGHT / 2]);

  const path = geoPath(projection);

  const regions = features.map((featureItem, i) => {
    const d = path(featureItem) || "";

    // lon/lat bbox (used for fast prefilter before geoContains)
    const bbox = geoPath().bounds(featureItem);

    // centroid in lon/lat, then projected to screen coordinates
    const centroidLonLat = geoCentroid(featureItem);
    const centroidXY = projection(centroidLonLat) || [WIDTH / 2, HEIGHT / 2];

    return {
      i,
      feature: featureItem,
      d,
      bbox,
      centroidLonLat,
      centroidXY,
    };
  });

  const openSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#0f172a" />`;
  const closeSvg = `</svg>`;

  preparedMapCache = {
    projection,
    regions,
    openSvg,
    closeSvg,
  };

  return preparedMapCache;
}

export async function renderBattleMap(position) {
  const [lon, lat] = position;

  const { projection, regions, openSvg, closeSvg } = await prepareMap();
  const battlePoint = [lon, lat];

  // 1) Find highlighted region
  let highlightedIndex = -1;
  for (const { i, feature, bbox } of regions) {
    if (!pointInBbox(battlePoint, bbox)) continue;
    if (geoContains(feature, battlePoint)) {
      highlightedIndex = i;
      break;
    }
  }

  // 2) Determine focus target (region centroid if available, else raw battle point)
  let targetXY = projection(battlePoint) || [WIDTH / 2, HEIGHT / 2];
  if (highlightedIndex >= 0) {
    targetXY = regions[highlightedIndex].centroidXY;
  }

  // 3) Apply zoom/pan transform at SVG group level (no path recomputation)
  // Move target to center, zoom around center.
  const [tx, ty] = targetXY;
  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${FOCUS_ZOOM}) translate(${-tx} ${-ty})`;

  // Keep stroke visually consistent under zoom
  const strokeWidth = (0.6 / FOCUS_ZOOM).toFixed(4);

  // 4) Paint highlighted region
  const paths = regions
    .map(({ i, d }) => {
      if (!d) return "";
      const fill = i === highlightedIndex ? "#ef4444" : "#1e293b";
      return `<path d="${d}" fill="${fill}" />`;
    })
    .join("");

  const svg = `${openSvg}
  <g transform="${transform}" stroke="#94a3b8" stroke-width="${strokeWidth}">
    ${paths}
  </g>
${closeSvg}`;

  return svg;
}
