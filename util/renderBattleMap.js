import { feature } from "topojson-client";
import { geoMercator, geoPath } from "d3-geo";

export async function renderBattleMap(position) {
  const [lon, lat] = position;

  const res = await fetch("https://api6.warera.io/trpc/map.getMapData");
  if (!res.ok) {
    throw new Error(`Failed to fetch map data: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  const topology =
    json?.result?.data?.map ??
    json?.result?.data ??
    json?.map;

  if (!topology) {
    throw new Error("Map topology not found in API response");
  }

  // Pick first object if "regions" key differs
  const objectName = topology.objects?.regions
    ? "regions"
    : Object.keys(topology.objects || {})[0];

  if (!objectName) {
    throw new Error("No topology objects found");
  }

  const geo = feature(topology, topology.objects[objectName]);

  const width = 500;
  const height = 300;

  // 1) Fit full map first (stable baseline)
  const projection = geoMercator().fitSize([width, height], geo);

  // 2) Then zoom in around the battle point
  const baseScale = projection.scale();
  const zoomMultiplier = 10; // tweak 4..10
  projection
    .center([lon, lat])
    .scale(baseScale * zoomMultiplier)
    .translate([width / 2, height / 2]);

  const path = geoPath(projection);
  const [cx, cy] = projection([lon, lat]);

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="#0f172a" />
  <g fill="#1e293b" stroke="#94a3b8" stroke-width="0.6">
    ${geo.features
      .map((f) => {
        const d = path(f);
        return d ? `<path d="${d}" />` : "";
      })
      .join("")}
  </g>
  <circle cx="${cx}" cy="${cy}" r="5" fill="#ef4444" />
</svg>`;

  return svg;
}
