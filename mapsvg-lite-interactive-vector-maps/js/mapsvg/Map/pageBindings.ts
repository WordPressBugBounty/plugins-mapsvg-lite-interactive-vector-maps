export type BindingRole = "objects" | "regions"
export type BindingOrder = Array<Record<string, "asc" | "desc">>
export type PageBinding = {
  queryId: string
  /** Explicit size override; null inherits Query.take. Absent retains legacy paging. */
  perPage?: number | null
  params?: Record<string, unknown>
  orderBy?: BindingOrder
  filterout?: Record<string, unknown>
  disableOn: { initialLoad: boolean; emptyFilters: boolean }
  pagination: { on: boolean; perpage: number; showIn: string; next: string; prev: string }
  refetch: { on: boolean; value: number; unit: "s" | "m" | "h" }
}

export function bindingPageSize(binding: PageBinding, queryTake?: number): number {
  if (typeof binding.perPage === "number") return binding.perPage
  if (binding.perPage === null) return queryTake ?? 50
  return binding.pagination.on ? binding.pagination.perpage : queryTake ?? 5000
}

/** Presentation only. Legacy controls retain their original placement until explicitly edited. */
export function showComponentPagination(options: any, component: "map" | "directory", pageId = initialBindingPageId(options)): boolean {
  const explicit = component === "map" ? options?.showPagination : options?.menu?.showPagination
  if (typeof explicit === "boolean") return explicit
  const pagination = readPageBinding(options, componentBindingRole(options, "directory"), pageId).pagination
  return !!pagination.on && pagination.perpage !== 0 && [component, "both"].includes(pagination.showIn)
}

export function initialBindingPageId(options: any): string {
  const pages = options?.scenes ?? []
  const selected = options?.stateGraph?.defaultStateId
  const state = options?.stateGraph?.states?.find((entry: any) => entry.id === selected)
  return state?.sceneId ?? pages.find((page: any) => `scene:${page.id}` === selected)?.id ?? pages[0]?.id ?? "scene-1"
}

/** Read compatible defaults without mutating/dirtying a retained v8 document. */
export function readPageBinding(options: any, role: BindingRole, pageId = initialBindingPageId(options)): PageBinding {
  const page = options?.scenes?.find((entry: any) => entry.id === pageId)
  const saved = page?.dataBindings?.[role] ?? {}
  const builtin = role === "objects" ? "getObjects" : "getRegions"
  const queryId = saved.queryId || builtin
  const ownsMenu = (options?.menu?.source === "regions" ? "regions" : "objects") === role
  const legacyPagination = role === "objects" ? options?.database?.pagination : { on: false }
  const legacyOrder = ownsMenu && queryId === builtin && options?.menu?.sortBy
    ? [{ [options.menu.sortBy]: options.menu.sortDirection === "asc" ? "asc" : "desc" }] as BindingOrder : undefined
  const legacyExclusion = ownsMenu && options?.menu?.filterout?.field
    ? { [options.menu.filterout.field]: options.menu.filterout.val } : undefined
  return {
    ...saved, queryId,
    orderBy: saved.orderBy ?? legacyOrder,
    filterout: saved.filterout ?? legacyExclusion,
    disableOn: {
      initialLoad: role === "objects" && options?.database?.loadOnStart === false,
      emptyFilters: role === "objects" && options?.database?.noFiltersNoLoad === true,
      ...saved.disableOn,
    },
    pagination: { on: false, perpage: 30, showIn: "both", next: "Next", prev: "Prev.", ...legacyPagination, ...saved.pagination },
    refetch: { on: false, value: 5, unit: "s", ...(role === "objects" ? options?.database?.autoRefetch : options?.database?.regionsAutoRefetch), ...saved.refetch },
  }
}

/** Only user/runtime filters count; saved Query predicates and exclusions do not. */
export function hasBindingFilters(query: { filters?: unknown; search?: string }): boolean {
  const hasValue = (value: unknown): boolean => {
    if (value == null) return false
    if (typeof value === "string") return value.trim().length > 0
    if (typeof value === "object") return Object.values(value).some(hasValue)
    return true // Zero and false are valid filter values.
  }
  return !!query.search?.trim() || Object.entries(query.filters ?? {}).some(([key, value]) => key !== "includeOrphans" && hasValue(value))
}

export function componentBindingRole(options: any, component: "directory" | "filters"): BindingRole {
  const settings = options?.[component === "directory" ? "menu" : "filters"]
  return settings?.binding === "regions" || (!settings?.binding && settings?.source === "regions") ? "regions" : "objects"
}

/** Do not serialize empty connection templates inherited from v8 runtime defaults. */
export function removeEmptyLegacySources(options: any): void {
  if (!options?.scenes?.length || options.scenes.some((page: any) =>
    ["objects", "regions"].some(role => !page.dataBindings?.[role]?.queryId
      || ["getObjects", "getRegions"].includes(page.dataBindings[role].queryId)))) return
  const database = options.database
  if (!database) return
  if (database.schemas && Object.values(database.schemas).every((schema: any) => !schema?.name && !schema?.id)) delete database.schemas
  for (const key of ["objectsTableName", "regionsTableName"]) if (!database[key]) delete database[key]
}
