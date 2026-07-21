const MIN_ZOOM = 1.5;
const MAX_ZOOM = 18;
const PADDING = 16; // px

export default function computeFocusTransform(regionIds) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  
  for (const id of regionIds) {
      const bounds = mapAndBounds.bounds[id];
  
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

