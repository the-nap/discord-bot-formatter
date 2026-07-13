import { feature } from "topojson-client";
import { geoMercator, geoPath, geoContains } from "d3-geo";
import { existsSync } from 'node:fs';
import { writeFile,readFile } from "node:fs/promises";

const CACHE_PATH = new URL("./cache/map-topology.json", import.meta.url);

async function getMapData(){
  if (existsSync(CACHE_PATH)) {
    const cached = await readFile(CACHE_PATH, "utf8");
    return JSON.parse(cached);
  }

  const res = await fetch("https://api6.warera.io/trpc/map.getMapData");
  if (!res.ok) {
    throw new Error(`Failed to fetch map data: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  await writeFile(CACHE_PATH, JSON.stringify(json, null, 2), "utf8");
  return json;
}

export async function renderBattleMap(position) {
  const [lon, lat] = position;

  const map = await getMapData();
  const topology =
    map?.result?.data?.map ??
    map?.result?.data ??
    map?.map;

  if (!topology) {
    throw new Error("Map topology not found");
  }

  const objectName = topology.objects?.regions
    ? "regions"
    : Object.keys(topology.objects || {})[0];

  if (!objectName) {
    throw new Error("No topology objects found");
  }

  const geo = feature(topology, topology.objects[objectName]);
  const features = geo.features ?? [];

  const width = 500;
  const height = 300;

  const projection = geoMercator().fitSize([width, height], geo);

  // zoom around battle point (tune as needed)
  const baseScale = projection.scale();
  const zoomMultiplier = 10;
  projection
    .center([lon, lat])
    .scale(baseScale * zoomMultiplier)
    .translate([width / 2, height / 2]);

  const path = geoPath(projection);

  // Find region containing the battle point
  const battlePoint = [lon, lat];
  const highlighted = features.find((f) => geoContains(f, battlePoint));

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0f172a" />
  <g stroke="#94a3b8" stroke-width="0.6">
    ${features
      .map((f) => {
        const d = path(f);
        if (!d) return "";

        const isHighlighted = highlighted === f;
        const fill = isHighlighted ? "#ef4444" : "#1e293b";
        return `<path d="${d}" fill="${fill}" />`;
      })
      .join("")}
  </g>
</svg>`;

  return svg;
}
