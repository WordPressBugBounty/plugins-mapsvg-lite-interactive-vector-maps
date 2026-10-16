export type GoogleMapsSavedViewport = {
  center: { lat: number; lng: number }
  zoom: number
}

/**
 * Google Maps reports 0x0 for a display:none container and then snaps to world zoom.
 */
export function hasVisibleMapSize(width: number, height: number): boolean {
  return width > 0 && height > 0
}

/**
 * Capture center/zoom only while the map is actually laid out.
 * Avoids overwriting a good snapshot with world-zoom values after hide.
 */
export function captureGoogleMapsViewport(
  isVisible: boolean,
  center: { lat: number; lng: number } | null | undefined,
  zoom: number | null | undefined,
): GoogleMapsSavedViewport | null {
  if (!isVisible || !center || typeof zoom !== "number" || !Number.isFinite(zoom) ||
      !Number.isFinite(center.lat) || !Number.isFinite(center.lng)) {
    return null
  }
  return { center: { lat: center.lat, lng: center.lng }, zoom }
}

export function shouldSkipGoogleMapsResize(isVisible: boolean): boolean {
  return !isVisible
}

export function shouldSyncGoogleMapsOverlay(
  initialized: boolean,
  isVisible: boolean,
  needsViewportRestore: boolean,
): boolean {
  return initialized && isVisible && !needsViewportRestore
}
