import type { MapSVGMap } from "../Map/Map"
import type { Marker } from "./Marker"
import { ScreenPoint } from "../Location/Location"

/** One transient screen layout. Location, repository and Worker coordinates stay canonical. */
export class MarkerSpread {
  private temporary = new Set<Marker>()
  private lines: SVGSVGElement
  private document: Document
  private entries: { marker: Marker; point: ScreenPoint; offset: ScreenPoint; line: Element }[] = []
  private progress = 0
  private frame?: number
  private disposed = false
  closing = false

  constructor(
    private map: MapSVGMap,
    readonly markers: Marker[],
    referenceX: number,
    private sources: HTMLElement[] = [],
  ) {
    const layer = map.layers.markers
    this.document = layer.ownerDocument
    this.lines = this.document.createElementNS("http://www.w3.org/2000/svg", "svg")
    this.lines.classList.add("mapsvg-marker-spread-lines")
    this.lines.setAttribute("aria-hidden", "true")
    this.lines.setAttribute("focusable", "false")
    layer.append(this.lines)
    const points = markers.map((marker) =>
      map.converter.convertSVGToPixel(marker.svgPoint, referenceX),
    )
    const origin = points[0]
    const width = Math.max(...markers.map((marker) => marker.width))
    const height = Math.max(...markers.map((marker) => marker.height))
    const step = Math.hypot(width, height) + 12
    const radius = Math.max(step, step / (2 * Math.sin(Math.PI / markers.length)))
    const columns = Math.ceil(Math.sqrt(markers.length))
    const positions = markers.map((marker, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / markers.length
      return markers.length <= 8
        ? { x: origin.x + Math.cos(angle) * radius, y: origin.y + Math.sin(angle) * radius }
        : {
            x: origin.x + ((i % columns) - (columns - 1) / 2) * (width + 12),
            y:
              origin.y +
              (Math.floor(i / columns) - (Math.ceil(markers.length / columns) - 1) / 2) *
                (height + 12),
          }
    })
    const left = Math.min(...positions.map((p) => p.x - width / 2))
    const right = Math.max(...positions.map((p) => p.x + width / 2))
    const top = Math.min(...positions.map((p) => p.y - height / 2))
    const bottom = Math.max(...positions.map((p) => p.y + height / 2))
    const dx = Math.max(8 - left, Math.min(0, map.containers.map.clientWidth - 8 - right))
    const dy = Math.max(8 - top, Math.min(0, map.containers.map.clientHeight - 8 - bottom))
    markers.forEach((marker, i) => {
      if (marker.element.parentElement !== layer) {
        this.temporary.add(marker)
        layer.append(marker.element)
        map.markers.push(marker)
      }
      const position = positions[i]
      // Positions describe image centers; the canonical point is the pin tip (or bubble center).
      const offset = new ScreenPoint(
        position.x + dx - points[i].x,
        position.y + dy - points[i].y + (marker.centered ? 0 : marker.height / 2),
      )
      marker.element.classList.add("mapsvg-marker-spread")
      const line = this.document.createElementNS(this.lines.namespaceURI, "line")
      line.setAttribute("x1", String(origin.x))
      line.setAttribute("y1", String(origin.y))
      this.lines.append(line)
      this.entries.push({ marker, point: points[i], offset, line })
    })
    sources.forEach((element) => element.classList.add("mapsvg-marker-spread-source"))
    this.document.addEventListener("pointerdown", this.outside, true)
    this.document.addEventListener("keydown", this.keydown)
    this.paint(0)
    this.animateTo(1)
  }

  private paint(progress: number): void {
    this.progress = progress
    for (const { marker, point, offset, line } of this.entries) {
      marker.screenOffset = new ScreenPoint(offset.x * progress, offset.y * progress)
      marker.adjustScreenPosition()
      line.setAttribute("x2", String(point.x + marker.screenOffset.x))
      line.setAttribute("y2", String(point.y + marker.screenOffset.y))
    }
    this.map.popoverAdjustScreenPosition()
  }

  private cancelFrame(): void {
    if (this.frame !== undefined) this.document.defaultView.cancelAnimationFrame(this.frame)
    this.frame = undefined
  }

  private animateTo(target: number, complete?: () => void): void {
    this.cancelFrame()
    const view = this.document.defaultView
    const from = this.progress
    const duration = 300 * Math.abs(target - from)
    if (
      !duration ||
      !view.requestAnimationFrame ||
      view.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ) {
      this.paint(target)
      complete?.()
      return
    }
    const start = view.performance.now()
    const tick = (now: number) => {
      this.frame = undefined
      if (this.disposed) return
      const elapsed = Math.min(1, Math.max(0, (now - start) / duration))
      this.paint(from + (target - from) * (1 - Math.pow(1 - elapsed, 3)))
      if (elapsed < 1) this.frame = view.requestAnimationFrame(tick)
      else complete?.()
    }
    this.frame = view.requestAnimationFrame(tick)
  }

  /** User dismissal reverses the current motion; camera/data teardown stays synchronous. */
  close(complete: () => void): void {
    if (this.closing || this.disposed) return
    this.closing = true
    this.releaseListeners()
    this.markers.forEach((marker) => marker.element.classList.add("mapsvg-marker-spread-closing"))
    this.animateTo(0, complete)
  }

  private outside = (event: PointerEvent): void => {
    const inside = event.composedPath().some((target) => {
      const element = target as HTMLElement
      return (
        target === this.map.controllers?.popover?.containers.main ||
        this.markers.some(
          (marker) =>
            target === marker.element ||
            (element.parentElement === this.map.layers.markers &&
              element.dataset?.mapsvgCopyOf === marker.id),
        )
      )
    })
    if (!inside) this.map.collapseMarkerSpread(true)
  }

  private keydown = (event: KeyboardEvent): void => {
    if (event.key === "Escape") this.map.collapseMarkerSpread(true)
  }

  private releaseListeners(): void {
    this.document.removeEventListener("pointerdown", this.outside, true)
    this.document.removeEventListener("keydown", this.keydown)
  }

  destroy(): void {
    if (this.disposed) return
    this.disposed = true
    this.cancelFrame()
    this.releaseListeners()
    this.lines.remove()
    this.sources.forEach((element) => element.classList.remove("mapsvg-marker-spread-source"))
    for (const marker of this.markers) {
      marker.screenOffset = undefined
      marker.interactionElement = undefined
      marker.adjustScreenPosition()
      if (this.temporary.has(marker)) {
        marker.detach()
        this.map.markers.delete(marker.id)
      }
    }
    // Commit canonical positions while the spread class still suppresses ordinary CSS transitions.
    // Camera/data teardown must not leave a second, unowned return animation running.
    this.map.layers.markers.getBoundingClientRect()
    this.markers.forEach((marker) =>
      marker.element.classList.remove("mapsvg-marker-spread", "mapsvg-marker-spread-closing"),
    )
    this.map.popoverAdjustScreenPosition()
  }
}
