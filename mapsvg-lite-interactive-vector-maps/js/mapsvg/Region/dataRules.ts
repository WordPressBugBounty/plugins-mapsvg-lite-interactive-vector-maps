/** Serializable authoring data only. Evaluated appearance never enters Map options. */
export type RulePaint = { color: string; disabled?: boolean }
export type RegionRule = RulePaint & { label: string; value: string; from?: number | null; to?: number | null }
export type RuleException = RulePaint & { on: boolean; label?: string }
export type LegacyRegionStatus = {
  statuses: Record<string, RulePaint>
  priority: Array<"statusSync" | "noObjects" | "filtered">
  dynamic: { filtered?: string; noObjects?: string }
  sync: null | { field: string; source: "regions" | "objects"; multiple: "priority" | "special"; rows: Array<{ value: string; status: string }> }
}
export type RegionDataRules = {
  version: 1
  on: boolean
  field: string
  source: "regions" | "objects"
  mode: "values" | "ranges" | "gradient"
  rows: RegionRule[]
  gradient: { min: number | null; max: number | null; low: string; high: string }
  exceptions: Record<"noData" | "unmatched" | "filtered" | "noObjects" | "multiple", RuleException>
  priority: Array<"filtered" | "noObjects" | "field">
  multiple: "first" | "special"
  legend: { on: boolean; title: string; text?: string; description?: string; layout?: "vertical" | "horizontal"; lowLabel?: string; highLabel?: string }
  /** Migrated v8 status paint stays above Choropleth without changing models or schemas. */
  legacyStatus?: LegacyRegionStatus
  /** Old gradients used SVG Regions only, including their lone-value zero baseline. */
  legacyGradientDomain?: "svg-regions"
}
export type RuleInput = { data: unknown; objects: unknown[]; filtered: boolean; noObjects: boolean; regionFiltered?: boolean }
export type RuleResult = RulePaint & { key: string; gradient?: { low: string; high: string; ratio: number } }

export function defaultRegionDataRules(): RegionDataRules {
  const exception = (): RuleException => ({ on: false, color: "" })
  return {
    version: 1, on: true, field: "region.status", source: "regions", mode: "values", rows: [],
    gradient: { min: null, max: null, low: "#f0f0f0", high: "#2563eb" },
    exceptions: { noData: exception(), unmatched: exception(), filtered: exception(), noObjects: exception(), multiple: exception() },
    priority: ["filtered", "noObjects", "field"], multiple: "first", legend: { on: false, title: "" },
  }
}

/** Detached, complete read projection for retained/partial authoring payloads. */
export function normalizeRegionDataRules(value: Partial<RegionDataRules>): RegionDataRules {
  const defaults = defaultRegionDataRules()
  return {
    ...defaults, ...structuredClone(value),
    rows: Array.isArray(value.rows) ? structuredClone(value.rows) : [],
    gradient: { ...defaults.gradient, ...value.gradient },
    exceptions: Object.fromEntries(Object.entries(defaults.exceptions).map(([key, fallback]) =>
      [key, { ...fallback, ...value.exceptions?.[key as keyof RegionDataRules["exceptions"]] }])) as RegionDataRules["exceptions"],
    priority: Array.isArray(value.priority) ? [...value.priority] : defaults.priority,
    legend: { ...defaults.legend, ...value.legend },
  }
}

/** Arrays are traversed at every depth (post meta and taxonomy need not be scalar). */
export function regionFieldValues(data: any, field: string, aliases = true): string[] {
  const path = field.split(".")
  if (/^(region|object)$/i.test(path[0])) path.shift()
  if (!path.length || path.some(key => !key || ["__proto__", "constructor", "prototype"].includes(key))) return []
  const walk = (value: any, index: number): any[] => {
    if (value == null) return []
    if (typeof value.getData === "function") value = value.getData()
    if (Array.isArray(value)) return value.flatMap(item => walk(item, index))
    if (index < path.length) return Object.prototype.hasOwnProperty.call(value, path[index]) ? walk(value[path[index]], index + 1) : []
    if (typeof value === "object") return (aliases ? [value.value, value.slug, value.id, value.term_id, value.name] : [value.value ?? value.slug ?? value.id ?? value.term_id ?? value.name]).filter(v => v != null && v !== "")
    return value === "" ? [] : [value]
  }
  return [...new Set(walk(data, 0).map(String))]
}
export function ruleValues(rules: RegionDataRules, input: RuleInput, aliases = true): string[] {
  return [...new Set((rules.source === "objects" ? input.objects : [input.data]).flatMap(data => regionFieldValues(data, rules.field, aliases)))]
}
export function numericRuleValue(value: unknown): number | undefined {
  if ((typeof value !== "number" && typeof value !== "string") || String(value).trim() === "") return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}
export function regionRuleDomain(rules: RegionDataRules, inputs: RuleInput[]): { min: number; max: number } {
  let min = Infinity, max = -Infinity
  for (const input of inputs) for (const value of ruleValues(rules, input)) {
    const number = numericRuleValue(value)
    if (number !== undefined) { min = Math.min(min, number); max = Math.max(max, number) }
  }
  return { min: rules.gradient.min ?? (min === Infinity ? 0 : min), max: rules.gradient.max ?? (max === -Infinity ? 0 : max) }
}

export function legacySvgGradientDomain(rules: RegionDataRules, inputs: RuleInput[]): { min: number; max: number } {
  const path = rules.field.replace(/^region\./i, "").split(".")
  const values = inputs.flatMap(input => {
    let value: any = input.data
    if (typeof value?.getData === "function") value = value.getData()
    for (const key of path) value = value?.[key]
    // v8's min/max calculation included empty/boolean scalar coercion; missing values were absent.
    if (value == null || !["number", "string", "boolean"].includes(typeof value)) return []
    const number = Number(value)
    return Number.isFinite(number) ? [number] : []
  })
  return { min: rules.gradient.min ?? (values.length === 1 ? 0 : values.length ? Math.min(...values) : 0), max: rules.gradient.max ?? (values.length ? Math.max(...values) : 0) }
}
/** The old resolver collapsed intermediate arrays and used term slug/name aliases. */
function legacyStatusCandidates(data: any, field: string): string[] {
  const path = field.split(".").slice(1)
  if (!path.length || path.some(key => !key || ["__proto__", "constructor", "prototype"].includes(key))) return []
  let value = typeof data?.getData === "function" ? data.getData() : data?.data ?? data
  for (let index = 0; index < path.length; index++) {
    if (value == null) return []
    value = value[path[index]]
    if (index < path.length - 1 && Array.isArray(value)) value = value[0]
  }
  const flatten = (item: any): string[] => {
    if (item == null || item === "") return []
    if (Array.isArray(item)) return item.flatMap(flatten)
    if (typeof item === "object") return [item.slug, item.name].filter(value => value != null && value !== "").map(String)
    return [String(item)]
  }
  return [...new Set(flatten(value))]
}

function legacyStatusPaint(rules: RegionDataRules, input: RuleInput): RulePaint | undefined {
  const legacy = rules.legacyStatus
  if (!legacy || !legacy.statuses || !Array.isArray(legacy.priority)) return undefined
  let status = regionFieldValues(input.data, "region.status")[0]
  for (const rule of legacy.priority) {
    let next: string | undefined
    if (rule === "filtered" && (input.regionFiltered ?? input.filtered)) next = legacy.dynamic?.filtered
    if (rule === "noObjects" && input.objects.length === 0) next = legacy.dynamic?.noObjects
    if (rule === "statusSync" && legacy.sync && Array.isArray(legacy.sync.rows)) {
      const sync = legacy.sync
      const candidates = [...new Set((sync.source === "regions" ? [input.data] : input.objects).flatMap(data => legacyStatusCandidates(data, sync.field)))]
      if (sync.multiple === "special" && candidates.length > 1) next = sync.rows.find(row => row.value === "__multiple__")?.status
      else next = sync.rows.find(row => row.value !== "__multiple__" && candidates.includes(row.value))?.status
    }
    if (next !== undefined && next !== "") {
      // Old Region.setStatus ignored unknown statuses, then stopped the priority loop.
      if (Object.prototype.hasOwnProperty.call(legacy.statuses, next)) status = next
      break
    }
  }
  return status !== undefined && Object.prototype.hasOwnProperty.call(legacy.statuses, status) ? legacy.statuses[status] : undefined
}

export function evaluateRegionRules(rules: RegionDataRules, input: RuleInput, domain?: { min: number; max: number }): RuleResult | undefined {
  if (!rules.on) return undefined
  const special = (key: keyof RegionDataRules["exceptions"]): RuleResult | undefined => {
    const paint = rules.exceptions[key]
    return paint?.on ? { ...paint, key } : undefined
  }
  const fieldResult = (): RuleResult | undefined => {
    const values = ruleValues(rules, input)
    if (!values.length) return special("noData")
    if (ruleValues(rules, input, false).length > 1 && rules.multiple === "special") return special("multiple")
    if (rules.mode === "values") {
      const index = rules.rows.findIndex(row => values.includes(String(row.value)))
      return index >= 0 ? { ...rules.rows[index], key: `value:${index}` } : special("unmatched")
    }
    const numbers = values.map(numericRuleValue).filter((n): n is number => n !== undefined)
    if (!numbers.length) return special("noData")
    if (rules.mode === "ranges") {
      const index = rules.rows.findIndex(row => numbers.some(n => (row.from == null || n >= row.from) && (row.to == null || n < row.to)))
      return index >= 0 ? { ...rules.rows[index], key: `range:${index}` } : special("unmatched")
    }
    if (!domain) return undefined
    const value = numbers[0]
    if (value < Math.min(domain.min, domain.max) || value > Math.max(domain.min, domain.max)) return special("unmatched")
    return { key: "gradient", color: "", gradient: { low: rules.gradient.low, high: rules.gradient.high, ratio: domain.max === domain.min ? 0 : (value - domain.min) / (domain.max - domain.min) } }
  }
  let field = fieldResult()
  const legacy = legacyStatusPaint(rules, input)
  if (legacy) field = { ...field, key: field?.key ?? "legacy-status", color: legacy.color || field?.color || "", disabled: legacy.disabled ?? field?.disabled, gradient: legacy.color ? undefined : field?.gradient }
  for (const rule of rules.priority) {
    const result = rule === "field" ? field : input[rule === "filtered" ? "filtered" : "noObjects"] ? special(rule) : undefined
    if (result) {
      if (rule === "field" || !field) return result
      return { ...field, ...result, color: result.color || field.color, disabled: result.disabled ?? field.disabled, gradient: result.color ? undefined : field.gradient }
    }
  }
  return undefined
}

export function validateRegionDataRules(rules: RegionDataRules): string[] {
  const errors: string[] = []
  if (!rules.field.trim()) errors.push("Choose a field.")
  const values = new Set<string>()
  rules.rows.forEach((row, index) => {
    if (rules.mode === "values") {
      if (!String(row.value).trim()) errors.push(`Row ${index + 1}: enter a value.`)
      if (values.has(String(row.value))) errors.push(`Row ${index + 1}: duplicate value.`)
      values.add(String(row.value))
    } else if (rules.mode === "ranges") {
      if ((row.from != null && !Number.isFinite(row.from)) || (row.to != null && !Number.isFinite(row.to)) || (row.from != null && row.to != null && row.from >= row.to)) errors.push(`Row ${index + 1}: From must be less than To.`)
      if (rules.rows.slice(0, index).some(other => (row.from ?? -Infinity) < (other.to ?? Infinity) && (other.from ?? -Infinity) < (row.to ?? Infinity))) errors.push(`Row ${index + 1}: ranges overlap.`)
    }
  })
  if (rules.gradient.min != null && rules.gradient.max != null && rules.gradient.min > rules.gradient.max) errors.push("Minimum must not exceed maximum.")
  if (new Set(rules.priority).size !== 3 || !["field", "filtered", "noObjects"].every(key => rules.priority.includes(key as any))) errors.push("Each priority rule must appear once.")
  return errors
}

/** Read-only compatibility projection. Legacy maps keep their runtime until explicitly edited. */
export function readRegionDataRules(options: any, statusOptions: any[] = []): RegionDataRules {
  if (options?.regionDataRules && typeof options.regionDataRules === "object") return normalizeRegionDataRules(options.regionDataRules)
  const rules = defaultRegionDataRules()
  const statuses = options?.regionStatuses || {}
  const rows = new Map<string, RegionRule>()
  statusOptions.forEach(row => { if (row.value != null && row.value !== "") rows.set(String(row.value), { label: String(row.label ?? row.value), value: String(row.value), color: row.color || "", disabled: !!row.disabled }) })
  Object.entries(statuses).forEach(([value, row]: [string, any]) => rows.set(value, { label: String(row.label || value), value, color: row.color || options?.colors?.status?.[value] || "", disabled: !!row.disabled }))
  rules.rows = [...rows.values()]
  const exceptionForStatus = (value: unknown): RuleException => {
    const row = rows.get(String(value))
    return row ? { on: true, color: row.color, disabled: row.disabled } : { on: false, color: "" }
  }
  rules.exceptions.filtered = exceptionForStatus(options?.regionsDynamicStatus?.filtered)
  rules.exceptions.noObjects = exceptionForStatus(options?.regionsDynamicStatus?.noObjects)
  if (options?.regionsDynamicStatusOrder?.length === 3) rules.priority = options.regionsDynamicStatusOrder.map((key: string) => key === "statusSync" ? "field" : key)
  if (options?.statusSyncOn && options.statusSyncField) {
    rules.field = options.statusSyncField
    rules.source = options.statusSyncSource || "objects"
    rules.multiple = options.statusSyncMultiStrategy === "special" ? "special" : "first"
    rules.rows = (options.statusSyncMap || []).filter((row: any) => row.value !== "__multiple__").map((row: any) => ({ ...(rows.get(String(row.status)) || { color: "", disabled: false }), value: String(row.value), label: String(row.value) }))
    const multiple = options.statusSyncMap?.find((row: any) => row.value === "__multiple__")
    if (multiple) rules.exceptions.multiple = exceptionForStatus(multiple.status)
  } else if (options?.choropleth?.on) {
    const c = options.choropleth
    rules.field = `region.${options.regionChoroplethField || c.sourceField || ""}`
    rules.source = c.source === "database" ? "objects" : "regions"
    if (rules.source === "objects") rules.field = rules.field.replace(/^region\./, "object.")
    rules.mode = c.coloring?.mode === "palette" ? "ranges" : "gradient"
    rules.gradient = { min: null, max: null, low: c.colors?.low || c.coloring?.gradient?.colors?.low || rules.gradient.low, high: c.colors?.high || c.coloring?.gradient?.colors?.high || rules.gradient.high }
    rules.rows = rules.mode === "ranges" ? (c.coloring?.palette?.colors || []).map((row: any) => ({ label: row.description || "", value: "", from: numericRuleValue(row.valueFrom) ?? null, to: numericRuleValue(row.valueTo) ?? null, color: row.color || "", disabled: false })) : []
    rules.exceptions.noData = { on: true, color: c.colors?.noData || c.coloring?.noData?.color || "" }
    rules.exceptions.unmatched = { on: !!c.coloring?.palette?.outOfRange?.color, color: c.coloring?.palette?.outOfRange?.color || "" }
    rules.legend = { on: c.coloring?.legend?.on !== false, title: c.coloring?.legend?.title || "" }
  }
  return rules
}
