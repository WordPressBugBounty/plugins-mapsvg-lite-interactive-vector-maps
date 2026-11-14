import { GeoPoint, SVGPoint, ScreenPoint } from "../Location/Location"
import { MapSVGMap } from "./Map"
import { GeoViewBox, ViewBox } from "./ViewBox"

class Converter {
  private map: MapSVGMap
  private mapElement: HTMLElement
  private geoViewBox: GeoViewBox
  private defViewBox: ViewBox
  private viewBox: ViewBox
  public mapLonDelta: number
  private mapLatBottomDegree: number
  private worldMapRadius: number
  private worldMapWidth: number
  private googleMapsOn: boolean
  private yShift: number
  private renderFrame?: {
    size: { width: number; height: number }
    projection?: google.maps.MapCanvasProjection
    worldWidth?: number
    points: WeakMap<SVGPoint, { x: number; y: number; pixel: ScreenPoint }>
  }

  constructor(
    map: MapSVGMap,
    // mapElement: HTMLElement,
    // defViewBox: ViewBox,
    // viewBox: ViewBox,
    // geoViewBox?: GeoViewBox,
  ) {
    this.mapElement = map.containers.map
    this.defViewBox = map.svgDefault.viewBox
    this.viewBox = map.viewBox
    this.map = map
    this.yShift = 0
    if (map.geoViewBox) {
      this.setGeoViewBox(map.geoViewBox)
    }
  }

  setYShift(): void {
    if (this.geoViewBox) {
      // Recalibration must measure the raw north edge, not subtract the preceding
      // correction. Map initialization also calls this after the constructor.
      this.yShift = 0
      const topLeftPoint = this.convertGeoToSVG(this.geoViewBox.ne)
      this.yShift = topLeftPoint.y - this.defViewBox.y
    }
  }

  setGeoViewBox(geoViewBox: GeoViewBox): void {
    this.geoViewBox = geoViewBox
    this.mapLonDelta = this.geoViewBox.ne.lng - this.geoViewBox.sw.lng
    this.mapLatBottomDegree = (this.geoViewBox.sw.lat * Math.PI) / 180
    this.worldMapWidth = (this.defViewBox.width / this.mapLonDelta) * 360
    this.worldMapRadius = ((this.defViewBox.width / this.mapLonDelta) * 360) / (2 * Math.PI)
    this.setYShift()
  }

  setGoogleMaps(on: boolean) {
    this.googleMapsOn = on
  }

  /** A synchronous render pass owns its geometry. Never retain it across camera/resize events. */
  withRenderFrame<T>(render: () => T): T {
    if (this.renderFrame) return render()
    const size = this.getViewportSize()
    const projection = this.googleMapsOn && this.map.googleMaps?.overlay?.getProjection()
    const worldWidth = this.googleMapsOn && this.geoViewBox
      ? projection?.getWorldWidth() ?? this.worldMapWidth * size.width / this.viewBox.width
      : undefined
    this.renderFrame = { size, projection: projection || undefined, worldWidth, points: new WeakMap() }
    try {
      return render()
    } finally {
      this.renderFrame = undefined
    }
  }

  getViewportSize(): { width: number; height: number } {
    return this.renderFrame?.size ?? this.map.getMapContainerSize?.() ?? {
      width: this.mapElement.clientWidth,
      height: this.mapElement.clientHeight,
    }
  }

  getScale() {
    const measured = this.getViewportSize().width
    const width = measured > 0 && Number.isFinite(measured) ? measured : this.mapElement.clientWidth
    return width / this.viewBox.width
  }

  /**
   * Converts SVG coordinates to pixel coordinates relative to the map container
   */
  convertSVGToPixel(svgPoint: SVGPoint, referenceX?: number): ScreenPoint {
    referenceX ??= this.getViewportSize().width / 2
    const cached = this.renderFrame?.points.get(svgPoint)
    if (cached && cached.x === svgPoint.x && cached.y === svgPoint.y)
      return new ScreenPoint(this.wrapPixelX(cached.pixel.x, referenceX), cached.pixel.y)
    const projection = this.renderFrame?.projection ??
      (this.googleMapsOn && this.map.googleMaps?.overlay?.getProjection())
    if (projection && this.geoViewBox) {
      const geo = this.convertSVGToGeo(svgPoint, false)
      const point = projection.fromLatLngToContainerPixel({ lat: geo.lat, lng: geo.lng })
      if (point) {
        this.renderFrame?.points.set(svgPoint, { x: svgPoint.x, y: svgPoint.y, pixel: new ScreenPoint(point.x, point.y) })
        return new ScreenPoint(this.wrapPixelX(point.x, referenceX), point.y)
      }
    }
    const scale = this.getScale()
    const pixel = new ScreenPoint((svgPoint.x - this.viewBox.x) * scale, (svgPoint.y - this.viewBox.y) * scale)
    this.renderFrame?.points.set(svgPoint, { x: svgPoint.x, y: svgPoint.y, pixel })
    return new ScreenPoint(
      this.wrapPixelX(pixel.x, referenceX), pixel.y,
    )
  }

  /** Horizontal period in screen pixels; undefined for ordinary SVG/image maps. */
  getWorldWidth(): number | undefined {
    if (!this.googleMapsOn || !this.geoViewBox) return
    const width = this.renderFrame ? this.renderFrame.worldWidth :
      this.map.googleMaps?.overlay?.getProjection()?.getWorldWidth() ?? this.worldMapWidth * this.getScale()
    return width > 0 && Number.isFinite(width) ? width : undefined
  }

  wrapPixelX(x: number, referenceX?: number): number {
    referenceX ??= this.getViewportSize().width / 2
    const width = this.getWorldWidth()
    return width ? x + Math.round((referenceX - x) / width) * width : x
  }
  /**
   * Converts pixel coordinates (relative to map container) to SVG coordinates
   */
  convertPixelToSVG(screenPoint: ScreenPoint): SVGPoint {
    const scale = this.getScale()
    return new SVGPoint(
      screenPoint.x / scale + this.viewBox.x,
      screenPoint.y / scale + this.viewBox.y,
    )
  }

  /**
   * Converts screen size to SVG size
   */
  convertSizePixelToSVG({ width, height }: { width: number; height: number }): {
    width: number
    height: number
  } {
    const scale = this.getScale()
    return {
      width: width / scale,
      height: height / scale,
    }
  }
  /**
   * Converts geo-coordinates (latitude/lognitude) to SVG coordinates
   */
  convertGeoToSVG(geoPoint: GeoPoint): SVGPoint {
    if (!this.geoViewBox) {
      throw new Error("Can't do convertGeoToSVG() - geoViewBox is not provided.")
    }
    let x = (geoPoint.lng - this.geoViewBox.sw.lng) * (this.defViewBox.width / this.mapLonDelta)
    const lat = (geoPoint.lat * Math.PI) / 180
    const mapOffsetY =
      (this.worldMapRadius / 2) *
      Math.log((1 + Math.sin(this.mapLatBottomDegree)) / (1 - Math.sin(this.mapLatBottomDegree)))
    let y =
      this.defViewBox.height -
      ((this.worldMapRadius / 2) * Math.log((1 + Math.sin(lat)) / (1 - Math.sin(lat))) - mapOffsetY)

    x += this.defViewBox.x
    y += this.defViewBox.y

    y -= this.yShift

    return new SVGPoint(x, y)
  }
  /**
   * Converts SVG coordinates to geo-coordinates (latitude/lognitude).
   */
  convertSVGToGeo(svgPoint: SVGPoint, round = true): GeoPoint {
    if (!this.geoViewBox) {
      throw new Error("Can't do convertSVGToGeo() - geoViewBox is not provided.")
    }
    const tx = svgPoint.x - this.defViewBox.x
    const ty = svgPoint.y - this.defViewBox.y + this.yShift

    const mapOffsetY =
      (this.worldMapRadius / 2) *
      Math.log((1 + Math.sin(this.mapLatBottomDegree)) / (1 - Math.sin(this.mapLatBottomDegree)))
    const equatorY = this.defViewBox.height + mapOffsetY
    const a = (equatorY - ty) / this.worldMapRadius
    let lat = (180 / Math.PI) * (2 * Math.atan(Math.exp(a)) - Math.PI / 2)
    let lng = this.geoViewBox.sw.lng + (tx / this.defViewBox.width) * this.mapLonDelta
    if (round) {
      lat = parseFloat(lat.toFixed(6))
      lng = parseFloat(lng.toFixed(6))
    }
    return new GeoPoint(lat, lng)
  }

  convertGoogleBoundsToViewBox(bounds: google.maps.LatLngBounds): ViewBox {
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()

    const swPoint = this.convertGeoToSVG(new GeoPoint(sw.lat(), sw.lng()))
    const nePoint = this.convertGeoToSVG(new GeoPoint(ne.lat(), ne.lng()))

    return new ViewBox(swPoint.x, swPoint.y, nePoint.x - swPoint.x, nePoint.y - swPoint.y)
  }
}

export { Converter }
