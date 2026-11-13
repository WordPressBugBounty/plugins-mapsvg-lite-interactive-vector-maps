/** Product availability is separate from WordPress code-edit permissions.
 * Saved paid configuration is retained on downgrade; consumers gate execution/UI.
 */
export const PAID_MAP_FEATURES = ["gallery", "data_source_posts", "directory", "filters", "javascript", "css", "templates", "csv", "show_another_map", "clustering"] as const
export type MapProductFeature = typeof PAID_MAP_FEATURES[number]
export function productFeatureAvailable(feature: MapProductFeature, plan: string, host?: { hasCapability: (id: string) => boolean }): boolean {
  return !["lite", "mapsvg-lite"].includes(plan) || host?.hasCapability(feature) === true
}
export function hasRuntimeFeature(feature: MapProductFeature): boolean {
  return productFeatureAvailable(feature, "process.env.PLAN", window.MapSVG?.extensions)
}
export function availableFilterFields<T extends { type: string }>(fields: T[], full: boolean): T[] {
  return full ? fields : fields.filter(field => field.type === "distance")
}

/** Replace only editable address fields; keep unavailable fields and their order. */
export function mergeLiteFilterFields<T extends { type: string }>(previous: T[], editable: T[]): T[] {
  const queue = [...editable]
  const merged = previous.flatMap(field => field.type === "distance" ? queue.length ? [queue.shift()!] : [] : [field])
  return [...merged, ...queue]
}

/** Only native WP/CPT sources need this capability; local linked post fields are core-owned. */
export function schemaUsesPostData(schema: { type?: unknown; postType?: unknown; getFields?: () => { type?: unknown }[]; fields?: { type?: unknown }[] } | null | undefined): boolean {
  return !!schema && (schema.type === "post" || !!schema.postType)
}
