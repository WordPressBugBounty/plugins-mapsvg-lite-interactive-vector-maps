import { GOOGLE_MAP_STYLE_PRESETS, type GoogleMapStyle } from "./GoogleMapsPresets"

/** Reject invalid authoring without replacing the last applied/saved styles. */
export function parseGoogleMapStyles(value: unknown): GoogleMapStyle[] {
  const parsed: unknown = typeof value === "string" ? JSON.parse(value) : value
  if (!Array.isArray(parsed) || parsed.some(rule => !rule || typeof rule !== "object" || Array.isArray(rule)
    || !Array.isArray(rule.stylers) || rule.stylers.some((styler: unknown) => !styler || typeof styler !== "object" || Array.isArray(styler)))) {
    throw new Error("Enter a JSON array of Google Maps style rules with a stylers array.")
  }
  return parsed
}

export function resolveGoogleMapStyles(style: unknown, value: unknown): GoogleMapStyle[] {
  if (typeof style === "string" && Object.hasOwn(GOOGLE_MAP_STYLE_PRESETS, style)) {
    // Fresh arrays: a Map/provider must not mutate presets used by another App.
    return JSON.parse(JSON.stringify(GOOGLE_MAP_STYLE_PRESETS[style]))
  }
  try { return parseGoogleMapStyles(value) } catch { return [] }
}

export function googleMapLanguage(value: unknown): string {
  const language = typeof value === "string" ? value.trim() : ""
  return !language || language === "auto" || language.startsWith("Automatic") ? "" : language
}
