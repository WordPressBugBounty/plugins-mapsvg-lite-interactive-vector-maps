import type { MapSVGMap } from "../Map/Map"
import type { GalleryOptions } from "./gallery-options"

/** Metadata lives in core; rendering and third-party libraries belong to the add-on. */
export interface GalleryController {
  init(): void
  refresh(previous?: GalleryOptions[]): void
  destroy(): void
}
export interface GalleryModule { create(map: MapSVGMap): GalleryController }
export function getGalleryModule(): GalleryModule | undefined {
  return window.MapSVG?.extensions?.get<GalleryModule>("runtime.component", "gallery")
}
