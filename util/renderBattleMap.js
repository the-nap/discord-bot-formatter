import { loadMapAndBounds } from './mapLoader.js';
import computeFocusTransform from './focusTransform.js';

const WIDTH = 500;
const HEIGHT = 300;


const mapAndBounds = await loadMapAndBounds();

function paint(regionIds) {
  let out = "";
  out += `<path d="${mapAndBounds.regions[regionIds[0]]}" fill="#ef4444" />`;
  if(regionIds.length > 1)
    out += `<path d="${mapAndBounds.regions[regionIds[1]]}" fill="#22c55e" />`;
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
