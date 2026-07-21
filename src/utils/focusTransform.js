const MIN_ZOOM = 1.5;
const MAX_ZOOM = 18;
const PADDING = 16; // px

export default function computeFocusTransform(allBounds, regionIds, width, height) {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;

  if(!allBounds || Object.keys(allBounds).length === 0)
    return null;
  if(!regionIds || regionIds.length === 0)
    return null;
  
  for (const id of regionIds) {
      const bounds = allBounds[id];
  
      if (!bounds) continue;
  
      x0 = Math.min(x0, bounds[0][0]);
      y0 = Math.min(y0, bounds[0][1]);
  
      x1 = Math.max(x1, bounds[1][0]);
      y1 = Math.max(y1, bounds[1][1]);
  }

  if( Math.max(x0,x1,y0,y1) === Infinity || Math.min(x0,x1,y0,y1) === -Infinity)
    return null;

    const boxW = Math.max(1, x1 - x0);
    const boxH = Math.max(1, y1 - y0);
  
    const zoomX = (width - 2 * PADDING) / boxW;
    const zoomY = (height - 2 * PADDING) / boxH;
    const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));
  
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;

  return { zoom, cx, cy };
}

