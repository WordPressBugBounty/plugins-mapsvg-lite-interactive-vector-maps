export type ViewBoxRect = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Clamp a viewBox when "Limit scroll to boundaries" is on.
 *
 * Zoomed-in (viewBox smaller than the SVG): clamp to the raw SVG box so
 * empty space beyond the map cannot be panned into.
 *
 * Min-zoom / letterboxed (viewBox larger than the SVG): clamp against the
 * letterboxed container box from getAdjustedSvgDefaultViewBox(). The old
 * clamp used the raw SVG origin, which pinned x/y to 0,0, jumped the map
 * to the container top-left, and locked pan (Gleap #237720).
 *
 * If the viewBox is larger than the letterboxed box on an axis, skip that
 * axis so the constraint is not inverted.
 */
export function clampViewBoxToScrollBoundaries<T extends ViewBoxRect>(
  viewBox: T,
  svgBounds: ViewBoxRect,
  letterboxedBounds: ViewBoxRect,
): T {
  clampAxis(viewBox, "x", "width", svgBounds, letterboxedBounds)
  clampAxis(viewBox, "y", "height", svgBounds, letterboxedBounds)
  return viewBox
}

/**
 * ViewBox size at a zoom level, centered on the letterboxed default.
 * Do not force x/y to 0,0 — that fights container letterboxing.
 */
export function viewBoxForZoomLevel(
  letterboxedDefault: ViewBoxRect,
  level: number,
  delta: number,
): ViewBoxRect {
  const scale = level >= 0 ? Math.pow(delta, level) : 1 / Math.pow(delta, Math.abs(level))
  const width = letterboxedDefault.width / scale
  const height = letterboxedDefault.height / scale

  return {
    x: letterboxedDefault.x + (letterboxedDefault.width - width) / 2,
    y: letterboxedDefault.y + (letterboxedDefault.height - height) / 2,
    width,
    height,
  }
}

function clampAxis<T extends ViewBoxRect>(
  viewBox: T,
  positionKey: "x" | "y",
  sizeKey: "width" | "height",
  svgBounds: ViewBoxRect,
  letterboxedBounds: ViewBoxRect,
): void {
  const size = viewBox[sizeKey]

  if (size > svgBounds[sizeKey]) {
    if (size > letterboxedBounds[sizeKey]) {
      return
    }
    clampPosition(viewBox, positionKey, sizeKey, letterboxedBounds)
    return
  }

  clampPosition(viewBox, positionKey, sizeKey, svgBounds)
}

function clampPosition<T extends ViewBoxRect>(
  viewBox: T,
  positionKey: "x" | "y",
  sizeKey: "width" | "height",
  bounds: ViewBoxRect,
): void {
  const min = bounds[positionKey]
  const max = bounds[positionKey] + bounds[sizeKey] - viewBox[sizeKey]

  if (viewBox[positionKey] < min) {
    viewBox[positionKey] = min
  } else if (viewBox[positionKey] > max) {
    viewBox[positionKey] = max
  }
}
