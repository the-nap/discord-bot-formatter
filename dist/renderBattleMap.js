import { feature } from "topojson-client";
import { geoMercator, geoPath, geoCentroid } from "d3-geo";
import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";

const CACHE_PATH = new URL("./cache/map-geo.json", import.meta.url);
const MAP_CACHE_PATH = new URL("./cache/map-geo-array.json", import.meta.url);

let regionCentroidsCache = null;
let regionPathDCache = null;

const WIDTH = 500;
const HEIGHT = 300;

const MIN_ZOOM = 1.5;
const MAX_ZOOM = 18;
const PADDING = 16; // px

function computeFocusTransform(projection, path, allRegions, regionIds) {
  const selected = regionIds
    .map((id) => allRegions.get(id))
    .filter(Boolean)
    .map((geometry, i) => ({
      type: "Feature",
      id: regionIds[i],
      properties: {},
      geometry,
    }));

  if (!selected.length) {
    return { zoom: 1, tx: WIDTH / 2, ty: HEIGHT / 2 };
  }

  const fc = { type: "FeatureCollection", features: selected };
  const [[x0, y0], [x1, y1]] = path.bounds(fc);

  const boxW = Math.max(1, x1 - x0);
  const boxH = Math.max(1, y1 - y0);

  const zoomX = (WIDTH - 2 * PADDING) / boxW;
  const zoomY = (HEIGHT - 2 * PADDING) / boxH;
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));

  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;

  return { zoom, cx, cy };
}

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
    if (!topology)
        throw new Error("Map topology not found");
    const objectName = topology.objects?.regions
        ? "regions"
        : Object.keys(topology.objects || {})[0];
    if (!objectName)
        throw new Error("No topology objects found");
    const geo = feature(topology, topology.objects[objectName]);
    // Cache GeoJSON to skip TopoJSON conversion next runs
    await writeFile(CACHE_PATH, JSON.stringify(geo), "utf8");
    return geo;
}

function replacer(key, value) {
  if(value instanceof Map) {
    return {
      dataType: 'Map',
      value: Array.from(value.entries()), // or with spread: value: [...value]
    };
  } else {
    return value;
  }
}

function reviver(key, value) {
  if(typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') {
      return new Map(value.value);
    }
  }
  return value;
}

function createCentroidCache(dataMap){
  if(!regionCentroidsCache){
    regionCentroidsCache = new Map();
    for (const[id, geometry] of dataMap.entries()) {
      regionCentroidsCache.set(id, geoCentroid(geometry));
    }
  }
}

function createPathDCache(path, allRegions){
  if (!regionPathDCache) {
    regionPathDCache = new Map()
    for (const [id ,geometry] of allRegions.entries()) {
      const d = path({ type: "Feature", id: id, properties: {}, geometry });
      regionPathDCache.set(id,d);
    }
  }
}

async function getRegionsData(){
  const geoData = await getMapData();
  if (existsSync(MAP_CACHE_PATH)) {
    const cached = await readFile(MAP_CACHE_PATH, "utf8");
    const dataMap = JSON.parse(cached,reviver);
    createCentroidCache(dataMap)
    return { dataMap, geoData };
  }
  const dataMap = new Map();
  for( const entry of geoData.features ){
    dataMap.set(entry.id, entry.geometry)
  }

  createCentroidCache(dataMap);

  await writeFile(MAP_CACHE_PATH, JSON.stringify(dataMap, replacer), "utf8");
  return { dataMap, geoData };
}
  
function getMiddlePoint(ids){
  let result = [0.0, 0.0]
  for( const id of ids ){
    const center = regionCentroidsCache.get(id);
    result[0] += center[0];
    result[1] += center[1];
  }
  result[0] = result[0]/ids.length;
  result[1] = result[1]/ids.length;
  return result;
}

function paint(allRegions, regionIds) {
  let out = "";

  for (const key of allRegions.keys()) {
    const d = regionPathDCache.get(key);
    if (!d) continue;

      let fill;
      if(regionIds[0] === key){
        fill = "#ef4444";
      } else if(regionIds.length > 1 && regionIds[1] === key){
        fill = "#22c55e";
      } else {
        fill = "#1e293b";
      }
    out += `<path d="${d}" fill="${fill}" />`;
  }

  return out;
}

export async function renderBattleMap(regionIds) {
  const { dataMap: allRegions, geoData } = await getRegionsData()

  const middlePoint = getMiddlePoint(regionIds);

  const projection = geoMercator().fitSize([WIDTH, HEIGHT], geoData );
  const path = geoPath(projection);

  createPathDCache(path, allRegions);

  const { zoom, cx, cy } = computeFocusTransform(projection, path, allRegions, regionIds);
  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-cx} ${-cy})`;
   // Keep stroke visually consistent under zoom
  const strokeWidth = (0.6 / zoom).toFixed(4);

  const paths = paint(allRegions, regionIds);

  const openSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#0f172a" />`;
  
  const closeSvg = `</svg>`;

  return `${openSvg}
      <g transform="${transform}" stroke="#94a3b8" stroke-width="${strokeWidth}">
        ${paths}
      </g>
    ${closeSvg}`;
}
