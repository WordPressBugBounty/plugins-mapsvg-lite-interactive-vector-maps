import { readPageBinding } from "../Map/pageBindings"

/** Unfiltered membership, independent of the visible Objects page/filter. */
export class RegionRuleObjectLinks {
  private entry?: { repository: any; context: string; ids?: Set<string>; pending: boolean; dirty: boolean; revision: number }
  private unsubscribe?: () => void

  clear(): void {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.entry = undefined
  }

  get(map: any): Set<string> | undefined {
    const repository = map.objectsRepository
    const regionsTable = map.regionsRepository?.getSchema?.()?.name
    if (!repository?.readSourcePage || !regionsTable) { this.clear(); return undefined }
    const context = JSON.stringify([map.activePageId, readPageBinding(map.options, "objects", map.activePageId), repository.getSchema()?.name, regionsTable])
    if (!this.entry || this.entry.repository !== repository || this.entry.context !== context) {
      this.clear()
      const entry = { repository, context, pending: false, dirty: true, revision: 0, ids: undefined as Set<string> | undefined }
      this.entry = entry
      const changed = () => {
        if (this.entry !== entry) return
        entry.revision++
        entry.pending = false
        entry.dirty = true
        map.reloadAllRegionStyles()
      }
      const events = ["afterLoad", "afterCreate", "afterUpdate", "afterDelete", "afterUpdateSchema"]
      events.forEach(name => repository.events?.on(name, changed))
      this.unsubscribe = () => events.forEach(name => repository.events?.off(name, changed))
    }
    const entry = this.entry
    if (entry.dirty && !entry.pending && !map.extras?.offline) {
      entry.dirty = false
      entry.pending = true
      const revision = ++entry.revision
      const current = () => this.entry === entry && entry.revision === revision
      const schema = repository.getSchema()
      const fields = schema.getFields().filter((field: any) => ["region", "relation"].includes(field.type)).map((field: any) => field.name)
      const primaryKey = schema.primaryKeyField || "id"
      const load = async () => {
        const ids = new Set<string>()
        for (let page = 1; current(); page++) {
          const response = await repository.readSourcePage({ fields, page, perpage: 1000, sort: [{ field: primaryKey, order: "asc" }], filters: {}, filterout: {}, search: "" })
          if (!current()) return
          if (!Array.isArray(response?.items)) throw new Error("Region link source did not return rows")
          for (const row of response.items) {
            const data = row.getData?.() ?? row
            const links = row.getRegionsForTable?.(regionsTable) ?? fields.flatMap((name: string) => data[name] || [])
            for (const link of links) if (link && (!link.tableName || link.tableName === regionsTable) && link.id != null) ids.add(String(link.id))
          }
          if (!response.hasMore) { entry.ids = ids; return }
          if (!response.items.length) throw new Error("Region link pagination did not advance")
        }
      }
      void load().catch(() => undefined).finally(() => {
        if (current()) { entry.pending = false; map.reloadAllRegionStyles() }
      })
    }
    return entry.ids
  }
}
