/** Container backgrounds do not affect Region rules, markers or repository data. */
export const SURFACE_COLOR_KEYS = new Set([
  "background", "leftSidebar", "rightSidebar", "header", "footer",
  "detailsView", "directory", "directorySearch", "modalFilters", "popover", "tooltip",
])

/** Compare complete snapshots, including keys removed by Scene projection. */
export function onlySurfaceColorChanges(previous: unknown, next: unknown): boolean {
  const before = previous && typeof previous === "object" ? previous as Record<string, unknown> : {}
  const after = next && typeof next === "object" ? next as Record<string, unknown> : {}
  const changed = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter(key => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
  return changed.length > 0 && changed.every(key => SURFACE_COLOR_KEYS.has(key))
}
