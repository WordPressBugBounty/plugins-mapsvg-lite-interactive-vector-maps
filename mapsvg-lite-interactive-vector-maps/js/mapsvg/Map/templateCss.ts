import type { TemplateEntry } from "./templateEntry"
import { normalizeTemplateEntry } from "./templateEntry"

/**
 * Canonical order for concatenating per-template CSS into one map stylesheet.
 * Later sections win on equal specificity. Unknown keys are appended sorted.
 */
export const TEMPLATE_STYLE_ORDER = [
  "directory",
  "directoryCategoryItem",
  "directoryItem",
  "popoverRegion",
  "popoverMarker",
  "tooltipRegion",
  "tooltipMarker",
  "detailsView",
  "detailsViewRegion",
  "labelMarker",
  "labelRegion",
  "labelLocation",
  "ProductCard",
  "ProductEmbed",
  "post",
  "list",
  "default",
  "title",
  "imageTitle",
  "address",
] as const

export function orderedTemplateNames(templates: Record<string, unknown>): string[] {
  const keys = Object.keys(templates || {})
  const known = TEMPLATE_STYLE_ORDER.filter((name) => keys.includes(name))
  const unknown = keys
    .filter((name) => !(TEMPLATE_STYLE_ORDER as readonly string[]).includes(name))
    .sort()
  return [...known, ...unknown]
}

/**
 * Concatenate non-empty template CSS sections in canonical order.
 * Replaces %id% with mapId (same as map-wide CSS).
 */
export function concatTemplateCss(
  templates: Record<string, TemplateEntry | string | null | undefined>,
  mapId: string | number,
): string {
  const parts: string[] = []
  for (const name of orderedTemplateNames(templates)) {
    const entry = normalizeTemplateEntry(templates[name], name)
    const css = (entry.css || "").trim()
    if (!css) {
      continue
    }
    parts.push(`/* template: ${name} */\n${css}`)
  }
  let css = parts.join("\n\n")
  if (css.indexOf("%id%") !== -1) {
    css = css.replace(/%id%/g, "" + mapId)
  }
  return css
}
