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
let preparedMapCache: any = null;

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

function isValidPoint(point) {
  return (
    Array.isArray(point) &&
    point.length === 2 &&
    Number.isFinite(point[0]) &&
    Number.isFinite(point[1])
  );
}

function findContainingRegionIndex(regions, point) {
  console.log(point);
  if (!isValidPoint(point)) return -1;

  for (const { i, feature, bbox } of regions) {
    if (!pointInBbox(point, bbox)) continue;
    if (geoContains(feature, point)) return i;
  }

  return -1;
}

function pointToSegmentDistanceSq(point, a, b) {
  const px = point[0];
  const py = point[1];
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];

  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  const abLenSq = abx * abx + aby * aby;

  // Degenerate segment
  if (abLenSq === 0) {
    const dx = px - ax;
    const dy = py - ay;
    return dx * dx + dy * dy;
  }

  // Project AP onto AB, clamp to segment [0,1]
  const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / abLenSq));
  const cx = ax + t * abx;
  const cy = ay + t * aby;

  const dx = px - cx;
  const dy = py - cy;
  return dx * dx + dy * dy;
}

function ringDistanceSq(point, ring) {
  if (!Array.isArray(ring) || ring.length < 2) return Number.POSITIVE_INFINITY;

  let minDistance = Number.POSITIVE_INFINITY;

  for (let idx = 0; idx < ring.length - 1; idx++) {
    const a = ring[idx];
    const b = ring[idx + 1];
    if (!isValidPoint(a) || !isValidPoint(b)) continue;

    const d = pointToSegmentDistanceSq(point, a, b);
    if (d < minDistance) minDistance = d;
  }

  return minDistance;
}

function polygonDistanceSq(point, polygonCoords) {
  if (!Array.isArray(polygonCoords)) return Number.POSITIVE_INFINITY;

  let minDistance = Number.POSITIVE_INFINITY;
  for (const ring of polygonCoords) {
    const d = ringDistanceSq(point, ring);
    if (d < minDistance) minDistance = d;
  }
  return minDistance;
}

function featureBorderDistanceSq(feature, point) {
  const type = feature?.geometry?.type;
  const coords = feature?.geometry?.coordinates;

  if (type === 'Polygon') {
    return polygonDistanceSq(point, coords);
  }

  if (type === 'MultiPolygon' && Array.isArray(coords)) {
    let minDistance = Number.POSITIVE_INFINITY;
    for (const polygonCoords of coords) {
      const d = polygonDistanceSq(point, polygonCoords);
      if (d < minDistance) minDistance = d;
    }
    return minDistance;
  }

  return Number.POSITIVE_INFINITY;
}

function findNearestRegionIndex(regions, point) {
  if (!isValidPoint(point)) return -1;

  let nearestIndex = -1;
  let nearestDistance = Number.POSITIVE_INFINITY;

  for (const { i, feature, bbox } of regions) {
    // Optional quick reject: if bbox is invalid, just skip this optimization
    if (bbox && !pointInBbox(point, bbox)) {
      // don't continue here; nearest-border should still consider non-overlapping bboxes
      // because point is outside all regions by design in fallback case.
    }

    const distance = featureBorderDistanceSq(feature, point);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}

function resolveRegionIndex(regions, point) {
  const containingIndex = findContainingRegionIndex(regions, point);
  if (containingIndex !== -1) return containingIndex;
  return findNearestRegionIndex(regions, point);
}

async function prepareMap():Promise<any> {
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

abstract class State {
  protected midPoint;

  constructor(position){
    this.midPoint = position;
  }
  getMidPoint(){
    return this.midPoint;
  }
  abstract findHighlighted(regions);
  abstract paint(regions, highlightedIndex);
}

class Single extends State {

  constructor(positions){
    super(positions[0]);
  }

  findHighlighted(regions) {
    return [resolveRegionIndex(regions, this.midPoint)];
  }

  paint(regions, highlightedIndex){
    const paths = regions
      .map(({ i, d }) => {
        if (!d) return "";
        const fill = i === highlightedIndex[0] ? "#ef4444" : "#1e293b";
        return `<path d="${d}" fill="${fill}" />`;
      })
      .join("");
      return paths;
  }
}

class Double extends State {
  protected defenderPoint;
  protected attackerPoint;

  constructor(positions){
    const [lonDef, latDef] = positions[0];
    const [lonAtt, latAtt] = positions[1];
    const position = [(lonDef + lonAtt) / 2, (latDef + latAtt) / 2];
    super(position);
    this.defenderPoint = positions[0];
    this.attackerPoint = positions[1];
  }

  findHighlighted(regions) {
    return [
      resolveRegionIndex(regions, this.defenderPoint),
      resolveRegionIndex(regions, this.attackerPoint),
    ];
  }

  paint(regions, highlightedIndex){
    const paths = regions
      .map(({ i, d }) => {
        if (!d) return "";
        const fill = 
          i === highlightedIndex[0] ? "#ef4444" : 
          i === highlightedIndex[1] ? "#22c55e":
          "#1e293b";
        return `<path d="${d}" fill="${fill}" />`;
      })
      .join("");
      return paths;
  }
}

export async function renderBattleMap(positions) {
  let state: State;
  if(positions.length > 1){
    state = new Double(positions);
  } else {
    state = new Single(positions);
  }

  const { projection, regions, openSvg, closeSvg } = await prepareMap();
  const battlePoint = state.getMidPoint();

  // 1) Find highlighted region
  const highlightedIndex = state.findHighlighted(regions);

  // 2) Determine focus target (region centroid if available, else raw battle point)
  let targetXY = projection(battlePoint) || [WIDTH / 2, HEIGHT / 2];
  const highlightedTargets = highlightedIndex
    .map((i) => regions[i]?.centroidXY)
    .filter((point) => point && Number.isFinite(point[0]) && Number.isFinite(point[1]));

  if (highlightedTargets.length > 0) {
    const [x, y] = highlightedTargets.reduce(
      ([sumX, sumY], [px, py]) => [sumX + px, sumY + py],
      [0, 0]
    );
    targetXY = [x / highlightedTargets.length, y / highlightedTargets.length];
  }

  // 3) Apply zoom/pan transform at SVG group level (no path recomputation)
  // Move target to center, zoom around center.
  const [tx, ty] = targetXY;
  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${FOCUS_ZOOM}) translate(${-tx} ${-ty})`;

  // Keep stroke visually consistent under zoom
  const strokeWidth = (0.6 / FOCUS_ZOOM).toFixed(4);

  // 4) Paint highlighted region
  const paths = state.paint(regions, highlightedIndex);

  const svg = `${openSvg}
  <g transform="${transform}" stroke="#94a3b8" stroke-width="${strokeWidth}">
    ${paths}
  </g>
${closeSvg}`;

  return svg;
}
