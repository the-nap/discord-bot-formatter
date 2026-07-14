import { feature } from "topojson-client";
import { geoMercator, geoPath, geoCentroid } from "d3-geo";
import { existsSync } from "node:fs";
import { writeFile, readFile } from "node:fs/promises";

const CACHE_PATH = new URL("./cache/map-geo.json", import.meta.url);
const MAP_CACHE_PATH = new URL("./cache/map-geo-array.json", import.meta.url);

let regionCentroidsCache = null;

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

function paint(allRegions, regionIds, path) {
  return Array.from(allRegions.entries())
    .map(([key,value]) => {
      const d = path({ type: "Feature", id: key, properties: {}, geometry: value });
  
      let fill;
      if(regionIds[0] === key){
        fill = "#ef4444";
      } else if(regionIds.length > 1 && regionIds[1] === key){
        fill = "#22c55e";
      } else {
        fill = "#1e293b";
      }

      return `<path d="${d}" fill="${fill}" />`;
    }).join("");
}

export async function renderBattleMap(regionIds) {
  const { dataMap: allRegions, geoData } = await getRegionsData()

  const middlePoint = getMiddlePoint(regionIds);

  const projection = geoMercator().fitSize([WIDTH, HEIGHT], geoData );
  const path = geoPath(projection);

  console.log(middlePoint);
  const [tx, ty] = projection(middlePoint);
  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${FOCUS_ZOOM}) translate(${-tx} ${-ty})`;
   // Keep stroke visually consistent under zoom
  const strokeWidth = (0.6 / FOCUS_ZOOM).toFixed(4);

  const paths = paint(allRegions, regionIds, path);

  const openSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#0f172a" />`;
  
  const closeSvg = `</svg>`;

  return `${openSvg}
      <g transform="${transform}" stroke="#94a3b8" stroke-width="${strokeWidth}">
        ${paths}
      </g>
    ${closeSvg}`;
}
