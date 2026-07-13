import { feature } from 'topojson-client';
import { geoMercator, geoPath } from 'd3-geo';

export async function renderBattleMap(position) {
  const [lon, lat] = position;

  const res = await fetch('https://api6.warera.io/trpc/map.getMapData');
  if (!res.ok) {
    throw new Error(`Failed to fetch map data: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();

  // tRPC-style responses often nest the payload under `result.data`
  const topology =
    json?.result?.data?.map ??
    json?.result?.data ??
    json?.map;

  if (!topology) {
    throw new Error('Map topology not found in API response');
  }

  // Adjust this if the object name differs in the returned topology
  const geo = feature(topology, topology.objects.regions);

  const width = 500;
  const height = 300;

  const projection = geoMercator()
    .center([lon, lat])
    .scale(30000)
    .translate([width / 2, height / 2]);

  const path = geoPath(projection);

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#0f172a" />
    <g fill="#1e293b" stroke="#94a3b8" stroke-width="0.8">
      ${geo.features.map((f) => `<path d="${path(f)}" />`).join('')}
    </g>
    <circle cx="${projection([lon, lat])[0]}" cy="${projection([lon, lat])[1]}" r="6" fill="#ef4444" />
  </svg>`;

  return svg;
}
