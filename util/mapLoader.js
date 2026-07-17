import { geoMercator, geoPath } from "d3-geo";
import { writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { feature } from "topojson-client";

const WIDTH = 500;
const HEIGHT = 300;

const MAP_PATH = new URL("./cache/map.html", import.meta.url)
const BOUNDS_PATH = new URL("./cache/bounds.json", import.meta.url);
const REGIONS_PATH = new URL("./cache/regions.json", import.meta.url);

export async function loadMapAndBounds(){
  if(existsSync( MAP_PATH ) && existsSync( BOUNDS_PATH )){
    const map = await readFile(MAP_PATH, "utf8");
    const bounds = JSON.parse( await readFile(BOUNDS_PATH, "utf8") );
    const regions = JSON.parse( await readFile(REGIONS_PATH, "utf8") );
    return { map, bounds, regions }
  }

  const geojsonData = await getRegionsData();
  const projection = geoMercator().fitSize([WIDTH, HEIGHT], geojsonData);
  const path = geoPath(projection);
  const mapAndBounds = getMapAndBounds(path, geojsonData.features);

  await writeFile(MAP_PATH, mapAndBounds.map, "utf8");
  await writeFile(BOUNDS_PATH, JSON.stringify(mapAndBounds.bounds), "utf8");
  await writeFile(REGIONS_PATH, JSON.stringify(mapAndBounds.regions), "utf8");

  return mapAndBounds;
}

function getMapAndBounds(path, geojsonData){
  const bounds = {};
  const regions = {};
  const paths = [];
  for( let element of geojsonData ){
    paths.push(`<path d="${path(element)}" />`);
    bounds[element.id] = path.bounds(element);
    regions[element.id] = path(element);
  }
  return { map: paths.join(''), bounds, regions }
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
