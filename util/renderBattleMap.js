import { feature } from "topojson-client";
import { geoMercator, geoPath, geoCentroid } from "d3-geo";
import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";

const CACHE_PATH = new URL("./cache/map-geo.json", import.meta.url);
const MAP_CACHE_PATH = new URL("./cache/map-geo-array.json", import.meta.url);

let regionCentroidsCache = null;
let regionPathDCache = null;
const regionBoundsCache = new Map();

const WIDTH = 500;
const HEIGHT = 300;

const MIN_ZOOM = 1.5;
const MAX_ZOOM = 18;
const PADDING = 16; // px

const data = await getRegionsData()
const projection = geoMercator().fitSize([WIDTH, HEIGHT], data.geoData);
const path = geoPath(projection);

createPathAndBoundsCache(path, data.dataMap);

let basePaths = [...data.dataMap.keys()]
  .map( id => `<path d="${regionPathDCache.get(id)}" fill="#1e293b" />`)
  .join("");

function computeFocusTransform(regionIds) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  
  for (const id of regionIds) {
      const bounds = regionBoundsCache.get(id);
  
      if (!bounds) continue;
  
      x0 = Math.min(x0, bounds[0][0]);
      y0 = Math.min(y0, bounds[0][1]);
  
      x1 = Math.max(x1, bounds[1][0]);
      y1 = Math.max(y1, bounds[1][1]);
  }

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
  console.log(regionCentroidsCache)
  if(!regionCentroidsCache){
    regionCentroidsCache = new Map();
    for (const[id, geometry] of dataMap.entries()) {
      regionCentroidsCache.set(id, geoCentroid(geometry));
    }
  }
}

function createPathAndBoundsCache(path, allRegions){
  if (!regionPathDCache) {
    regionPathDCache = new Map()
    for (const [id ,geometry] of allRegions.entries()) {
      const feature = ({ type: "Feature", id: id, properties: {}, geometry });
      regionPathDCache.set(id, path(feature));
      regionBoundsCache.set(id, path.bounds(feature));
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
  
function paint(regionIds) {
  let out = "";
  out += `<path d="${regionPathDCache.get(regionIds[0])}" fill="#ef4444" />`;
  if(regionIds.length > 1)
    out += `<path d="${regionPathDCache.get(regionIds[1])}" fill="#22c55e" />`;
  return out;
}

export function renderBattleMap(regionIds) {
  const { zoom, cx, cy } = computeFocusTransform(regionIds);
  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-cx} ${-cy})`;
   // Keep stroke visually consistent under zoom
  const strokeWidth = (0.6 / zoom).toFixed(4);


  const openSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#0f172a" />`;
  
  const closeSvg = `</svg>`;

  return `${openSvg}
      <g transform="${transform}" stroke="#94a3b8" stroke-width="${strokeWidth}">
        ${basePaths}
        ${paint(regionIds)}
      </g>
    ${closeSvg}`;
}
