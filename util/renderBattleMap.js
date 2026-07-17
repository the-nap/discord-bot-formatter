import { loadMapAndBounds } from './mapLoader.js';

const WIDTH = 500;
const HEIGHT = 300;

const MIN_ZOOM = 1.5;
const MAX_ZOOM = 18;
const PADDING = 16; // px

const mapAndBounds = await loadMapAndBounds();

function computeFocusTransform(regionIds) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  
  for (const id of regionIds) {
      console.log("3 " + mapAndBounds);
      const bounds = mapAndBounds.bounds.get(id);
  
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

function paint(regionIds) {
  let out = "";
  console.log(regionIds);
  out += `<path d="${mapAndBounds.bounds.get(regionIds[0])}" fill="#ef4444" />`;
  if(regionIds.length > 1)
    out += `<path d="${mapAndBounds.bounds.get(regionIds[1])}" fill="#22c55e" />`;
  return out;
}

export function renderBattleMap(regionIds) {
  const { zoom, cx, cy } = computeFocusTransform(regionIds);
  const transform = `translate(${WIDTH / 2} ${HEIGHT / 2}) scale(${zoom}) translate(${-cx} ${-cy})`;

  const strokeWidth = (0.6 / zoom).toFixed(4);

  const openSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="100%" height="100%" fill="#0f172a" />`;
  
  const closeSvg = `</svg>`;

  return `${openSvg}
      <g transform="${transform}" stroke="#94a3b8" stroke-width="${strokeWidth}">
        ${mapAndBounds.map}
        ${paint(regionIds)}
      </g>
    ${closeSvg}`;
}
