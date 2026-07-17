import { geoMercator, geoPath } from "d3-geo";
import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { feature } from "topojson-client";

const WIDTH = 500;
const HEIGHT = 300;

const MAP_DATA = new URL("./cache/mapData.json", import.meta.url)

export async function loadMapAndBounds(){
  if( existsSync( MAP_DATA ) ) {
    return JSON.parse( await readFile(MAP_DATA, "utf8") )
  }

  const geojsonData = await getRegionsData();
  const projection = geoMercator().fitSize([WIDTH, HEIGHT], geojsonData);
  const path = geoPath(projection);
  const mapData = buildMapCache(path, geojsonData.features);

  await writeFile(MAP_DATA, JSON.stringify(mapData), "utf8");

  return mapData;
}

function buildMapCache(path, geojsonData){
  const cache = {
    map:"",
    regions: {},
    bounds: {}
  }
  const paths = [];
  for( let element of geojsonData ){
    const d = path(element)
    paths.push(`<path d="${d}" fill="#1e293b" />`);
    cache.bounds[element.id] = path.bounds(element);
    cache.regions[element.id] = d;
  }
  cache.map = paths.join('');
  return cache;
}


//returns geojson data
async function getRegionsData(){
  const geoData = await getMapData();
  return geoData;
}

//fetches topojson
async function getMapData() {
    const res = await fetch("https://api6.warera.io/trpc/map.getMapData");
    if (!res.ok) {
        throw new Error(`Failed to fetch map data: ${res.status} ${res.statusText}`);
    }
    const map = await res.json();
    return topoToGeo(map);
}

//transforms topoJson to geoJson
function topoToGeo(topoData){
    const topology = topoData?.result?.data?.map ?? topoData?.result?.data ?? topoData?.map;
    if (!topology)
        throw new Error("Map topology not found");
    const objectName = topology.objects?.regions
        ? "regions"
        : Object.keys(topology.objects || {})[0];
    if (!objectName)
        throw new Error("No topology objects found");
    return feature(topology, topology.objects[objectName]);
}
