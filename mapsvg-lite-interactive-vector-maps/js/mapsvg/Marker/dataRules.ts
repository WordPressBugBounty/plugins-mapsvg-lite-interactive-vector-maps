import { regionFieldValues } from "../Region/dataRules"
import { parseBoolean } from "../Core/parseBoolean"

export type MarkerImageRule = { label: string; value: string; image: string }
export type MarkerDataRules = { version: 1; defaultImage: string; on: boolean; field: string; rows: MarkerImageRule[] }

/** Legacy schema settings are read, never changed by an App presentation editor. */
export function readMarkerDataRules(options: any, fields: any[] = []): MarkerDataRules {
  if (options?.markerDataRules?.version === 1) return structuredClone(options.markerDataRules)
  const location = fields.find(field => field.type === "location")
  const field = String(location?.markerField || "object.id").replace(/^Object\./, "object.")
  const path = /^(object|region)\./i.test(field) ? field : `object.${field}`
  const choices = fields.find(item => item.name === path.replace(/^object\./i, ""))?.options || []
  return {
    version: 1, defaultImage: options?.defaultMarkerImage || location?.defaultMarkerPath || "",
    on: parseBoolean(location?.markersByFieldEnabled) === true, field: path,
    rows: Object.entries(location?.markersByField || {}).map(([value, image]) => ({ value, label: String(choices.find((option: any) => String(option.value) === value)?.label ?? value), image: String(image) })),
  }
}

export function markerRuleImage(rules: MarkerDataRules, object: unknown, fallback: string): string {
  if (rules.on) {
    const values = regionFieldValues(object, rules.field)
    const row = rules.rows.find(item => values.includes(String(item.value)))
    if (row?.image) return row.image
  }
  return rules.defaultImage || fallback
}

export function markerImageUrl(image: string, routes: { root: string; uploads: string; resolveAssetUrl?: (url: string) => string }): string {
  // Stored WP-root paths belong to the asset host when the renderer lives on another origin.
  if (image.startsWith("/") && !image.startsWith("//")) {
    if (routes.resolveAssetUrl) {
      try { return routes.resolveAssetUrl(image) } catch { /* Retain ordinary URL resolution below. */ }
    }
    if (/^https?:\/\//i.test(routes.root)) {
      try { return new URL(image, routes.root).href } catch { return image }
    }
  }
  if (/^(?:https?:\/\/|\/)/i.test(image)) return image
  return image.startsWith("uploads/") ? `${routes.uploads}markers/${image.slice(8)}` : `${routes.root}markers/${image || "_pin_default.png"}`
}

export function validateMarkerDataRules(rules: MarkerDataRules): string[] {
  const errors: string[] = [], values = new Set<string>()
  if (!rules.field.trim()) errors.push("Choose a field.")
  rules.rows.forEach((row, index) => {
    if (!row.value.trim()) errors.push(`Row ${index + 1}: enter a value.`)
    if (values.has(row.value)) errors.push(`Row ${index + 1}: duplicate value.`)
    values.add(row.value)
  })
  return errors
}
