import { numericRuleValue, regionFieldValues, type RegionDataRules } from "./dataRules"

export type NumericDomain = { min: number; max: number }
type DomainRepository = {
  getSchema(): any
  getRequest(action: string, params: null, data: Record<string, unknown>): { url: string; data?: any }
  getResponse?(data: any, request: any): { data: any }
  readSourcePage?(query: Record<string, unknown>): Promise<Record<string, any>>
  server: { get(url: string, data?: any): PromiseLike<any> }
  events?: { on(name: string, handler: () => void): unknown; off(name: string, handler: () => void): unknown }
}
const unprefix = (path: string) => path.replace(/^(region|object)\./i, "")

/** An enum's declared choices define its scale even when some choices are unused. */
export function choiceFieldDomain(repository: DomainRepository, path: string): NumericDomain | undefined {
  const fieldPath = unprefix(path), schema = repository.getSchema()
  const field = schema?.getField?.(fieldPath) || schema?.getFields?.().find((item: any) => item.name === fieldPath)
  if (!field || !["select", "radio", "status"].includes(field.type)) return undefined
  let min = Infinity, max = -Infinity
  for (const option of field.options || []) {
    const value = numericRuleValue(option.value)
    if (value !== undefined) { min = Math.min(min, value); max = Math.max(max, value) }
  }
  return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max }
}

/** Read the entire source column, never the live filtered repository/page. */
async function* sourceFieldValues(repository: DomainRepository, path: string, current = () => true): AsyncGenerator<string[]> {
  const field = unprefix(path), root = field.split(".")[0]
  if (!root || field.split(".").some(key => !key || ["__proto__", "constructor", "prototype"].includes(key))) throw new Error("Invalid range field")
  const schema = repository.getSchema()
  const primaryKey = schema?.primaryKeyField || schema?.getFields?.().find((item: any) => item.type === "id")?.name || "id"
  for (let page = 1; current(); page++) {
    const query = { fields: [root], page, perpage: 1000, sort: [{ field: primaryKey, order: "asc" }], filters: schema?.type === "region" ? { includeOrphans: 1 } : {}, filterout: {}, search: "" }
    let response: any
    if (repository.readSourcePage) response = await repository.readSourcePage(query)
    else {
      const request = repository.getRequest("index", null, query)
      const raw = await repository.server.get(request.url, request.data)
      response = repository.getResponse ? repository.getResponse(raw, request).data : raw
    }
    if (!current()) throw new Error("Range request retired")
    const data = typeof response === "string" ? JSON.parse(response) : response
    if (!Array.isArray(data?.items)) throw new Error("Range source did not return rows")
    yield data.items.flatMap((row: any) => regionFieldValues(row, field))
    if (!data.hasMore) return
    if (!data.items.length) throw new Error("Range source pagination did not advance")
  }
  throw new Error("Range request retired")
}

export async function loadFieldDomain(repository: DomainRepository, path: string, current = () => true): Promise<NumericDomain> {
  let min = Infinity, max = -Infinity
  for await (const values of sourceFieldValues(repository, path, current)) for (const item of values) {
    const value = numericRuleValue(item)
    if (value !== undefined) { min = Math.min(min, value); max = Math.max(max, value) }
  }
  return { min: min === Infinity ? 0 : min, max: max === -Infinity ? 0 : max }
}

/** Share source discovery between Region and Marker mapping editors. */
export async function loadRuleFieldOptions(repository: any, path: string, current = () => true): Promise<Array<{ label: string; value: string | number }>> {
  const field = unprefix(path), root = field.split(".")[0], schema = repository.getSchema()
  const definition = schema?.getField?.(root) || schema?.getFields?.().find((item: any) => item.name === root)
  if (!repository.readSourcePage || ["select", "radio", "status", "checkboxes", "region", "relation", "post"].includes(definition?.type)) return repository.getOptionsByField(field)
  const values = new Set<string>()
  for await (const page of sourceFieldValues(repository, field, current)) page.forEach(value => values.add(value))
  return [...values].map(value => ({ value, label: value }))
}

type Entry = { repository: DomainRepository; field: string; schemaName: string; domain?: NumericDomain; pending: boolean; dirty: boolean; version: number; error: boolean; choice: boolean }

/** Per-Map, read-only range cache. No source rows or derived bounds enter App options. */
export class RegionRuleDomainCache {
  private entry?: Entry
  private unsubscribe?: () => void
  status: "ready" | "loading" | "unavailable" = "ready"

  clear(): void {
    this.unsubscribe?.(); this.unsubscribe = undefined
    this.entry = undefined
  }

  get(map: any, rules: RegionDataRules): NumericDomain | undefined {
    const manual = rules.gradient
    if (!rules.on || rules.mode !== "gradient" || (manual.min != null && manual.max != null)) {
      this.clear(); this.status = "ready"
      return { min: manual.min ?? 0, max: manual.max ?? 0 }
    }
    const repository: DomainRepository = rules.source === "objects" ? map.objectsRepository : map.regionsRepository
    if (!repository?.getSchema) { this.clear(); this.status = "unavailable"; return undefined }
    const schemaName = repository.getSchema()?.name || ""
    if (!this.entry || this.entry.repository !== repository || this.entry.field !== rules.field || this.entry.schemaName !== schemaName) {
      this.clear()
      const entry: Entry = { repository, field: rules.field, schemaName, pending: false, dirty: true, version: 0, error: false, choice: false }
      this.entry = entry
      const changed = () => {
        if (this.entry !== entry) return
        entry.version++; entry.pending = false; entry.dirty = true; entry.error = false
        map.reloadAllRegionStyles()
      }
      const events = ["afterLoad", "afterUpdate", "afterCreate", "afterDelete", "afterUpdateSchema"]
      events.forEach(name => repository.events?.on(name, changed))
      this.unsubscribe = () => events.forEach(name => repository.events?.off(name, changed))
    }
    const entry = this.entry
    const choice = choiceFieldDomain(repository, rules.field)
    if (choice) {
      entry.version++; entry.pending = false; entry.domain = choice; entry.choice = true; entry.dirty = false; entry.error = false
    } else {
      if (entry.choice) { entry.domain = undefined; entry.dirty = true; entry.choice = false }
      if (!map.extras?.offline && entry.dirty && !entry.pending) {
        entry.pending = true; entry.dirty = false
        const version = ++entry.version
        const current = () => this.entry === entry && entry.version === version
        void loadFieldDomain(repository, rules.field, current).then(domain => {
          if (current()) { entry.domain = domain; entry.error = false }
        }).catch(() => {
          if (current()) entry.error = true
        }).finally(() => {
          if (current()) { entry.pending = false; map.reloadAllRegionStyles() }
        })
      }
    }
    this.status = entry.pending ? "loading" : entry.error || !entry.domain ? "unavailable" : "ready"
    return entry.domain ? { min: manual.min ?? entry.domain.min, max: manual.max ?? entry.domain.max } : undefined
  }
}
