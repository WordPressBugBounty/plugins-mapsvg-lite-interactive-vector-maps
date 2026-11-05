import { evaluateRegionRules, legacySvgGradientDomain, normalizeRegionDataRules, type RuleInput, type RuleResult } from "./dataRules"
import { RegionRuleDomainCache } from "./dataRuleDomain"
import { RegionRuleObjectLinks } from "./dataRuleObjectLinks"
import { regionLegendModel, type LegendModel } from "../Legend/Legend"

/** Per-Map computed presentation. Subcaches own source subscriptions; no DOM or option mutations. */
export class RegionDataRulesRuntime {
  results = new Map<string, RuleResult>()
  legendModel?: LegendModel
  private managed = false
  private domains = new RegionRuleDomainCache()
  private objectLinks = new RegionRuleObjectLinks()
  destroy(): void { this.domains.clear(); this.objectLinks.clear(); this.legendModel = undefined; this.results.clear() }
  prepare(map: any): void {
    this.results.clear()
    const rawRules = map.options?.regionDataRules
    const rules = rawRules && typeof rawRules === "object" ? normalizeRegionDataRules(rawRules) : undefined
    if (!rules || !map.regions || !map.regionsRepository) {
      this.domains.clear()
      this.objectLinks.clear()
      this.legendModel = undefined
      if (!rules && this.managed && map.regions) map.regions.forEach((region: any) => {
        const value = region.data?.getData?.().status ?? region.data?.status
        const status = map.options.regionStatuses?.[value]
        region.setDisabled(!!(map.options.disableAll || map.options.regions?.[region.id]?.disabled || status?.disabled || region.styleSvg?.fill === "none"), true)
      })
      this.managed = false
      return
    }
    this.managed = true
    const linked = rules.on && rules.source === "objects" ? this.objectLinks.get(map) : (this.objectLinks.clear(), undefined)
    const query = map.objectsRepository?.query
    const objectsFiltered = Boolean(query?.search || Object.keys(query?.filters || {}).length)
    // Region.objects is a presentation cache rebuilt by SVG/object lifecycle
    // handlers. Bootstrap and Region refetch can temporarily leave it empty.
    // The bound Objects result owns the currently matching data for these rules.
    const objectsByRegion = map.objectsRepository?.getLoaded ? new Map<string, any[]>() : undefined
    if (objectsByRegion) {
      const table = map.regionsRepository.getSchema?.()?.name ?? map.regionsRepository.schema?.name
      for (const object of Array.from(map.objectsRepository.getLoaded()) as any[]) {
        const links = object.getRegionsForTable?.(table) ?? (object.getData?.() ?? object).regions ?? []
        for (const link of links) {
          if (link.tableName && link.tableName !== table) continue
          const id = String(link.id)
          const list = objectsByRegion.get(id) ?? []
          list.push(object); objectsByRegion.set(id, list)
        }
      }
    }
    const regions: any[] = Array.from(map.regions)
    const inputs = regions.map(region => {
      const model = map.regionsRepository.getLoaded().findById(region.id)
      const objects = objectsByRegion ? objectsByRegion.get(String(region.id)) ?? [] : Array.from(region.objects || [])
      const hasLinks = linked ? linked.has(String(region.id)) : Boolean(objects.length)
      return { data: model || region.data, objects, regionFiltered: !model, filtered: !model || (rules.source === "objects" && objectsFiltered && hasLinks && !objects.length), noObjects: !hasLinks } satisfies RuleInput
    })
    let domain
    if (rules.legacyGradientDomain === "svg-regions" && rules.source === "regions" && rules.mode === "gradient") {
      this.domains.clear(); this.domains.status = "ready"
      domain = legacySvgGradientDomain(rules, inputs)
    } else domain = this.domains.get(map, rules)
    regions.forEach((region, index) => {
      const result = evaluateRegionRules(rules, inputs[index], domain)
      if (result) this.results.set(String(region.id), result)
      const override = map.options.regions?.[region.id]?.disabled
      const disabled = map.options.disableAll || region.id === "labels" || region.id === "Labels" || (result?.disabled ?? override ?? (region.styleSvg?.fill === "none" && !result?.color && !result?.gradient))
      region.setDisabled(!!disabled, true)
    })
    this.legendModel = regionLegendModel(rules, domain, this.domains.status === "loading")
  }
}
