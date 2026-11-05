import type { RegionDataRules } from "../Region/dataRules"
import type { NumericDomain } from "../Region/dataRuleDomain"

/** Computed by the source Map. The view never reads a Collection or Query. */
export type LegendModel = {
  title: string
  text?: string
  description?: string
  layout?: "vertical" | "horizontal"
  rows: Array<{ label: string; color: string }>
  gradient?: { low: string; high: string; min: number; max: number; lowLabel?: string; highLabel?: string }
  status?: string
}

export function regionLegendModel(rules: RegionDataRules, domain?: NumericDomain, loading = false): LegendModel | undefined {
  if (!rules.on) return undefined
  const model: LegendModel = { title: rules.legend.title, rows: [], text: rules.legend.text, description: rules.legend.description, layout: rules.legend.layout }
  if (rules.mode === "gradient") {
    if (!domain) model.status = loading ? "Loading range…" : "Range unavailable"
    else model.gradient = { ...rules.gradient, ...domain, lowLabel: rules.legend.lowLabel, highLabel: rules.legend.highLabel }
  } else model.rows = rules.rows.map(item => ({
    label: item.label || (rules.mode === "values" ? item.value : `${item.from ?? "−∞"} – ${item.to ?? "∞"}`), color: item.color,
  }))
  const labels = { noData: "No data", unmatched: "Unmatched / out of range", filtered: "Filtered out", noObjects: "No linked objects", multiple: "Multiple values" }
  for (const key of Object.keys(labels) as Array<keyof typeof labels>) {
    if (rules.exceptions[key]?.on) model.rows.push({ label: rules.exceptions[key].label ?? labels[key], color: rules.exceptions[key].color })
  }
  return model
}

/** One retained, text-safe view. Mounting/visibility belongs to Layout. */
export class Legend {
  readonly element: HTMLDivElement
  private renderedModel?: string
  constructor(private document: Document) {
    this.element = document.createElement("div")
    this.element.className = "mapsvg-data-rules-legend"
  }
  update(model: LegendModel, title = model.title): void {
    const renderedModel = JSON.stringify([model, title])
    if (this.renderedModel === renderedModel) return
    this.renderedModel = renderedModel
    const doc = this.document, legend = this.element
    legend.replaceChildren()
    legend.setAttribute("aria-label", title || "Map legend")
    legend.style.display = model.layout === "vertical" && model.gradient ? "flex" : ""
    legend.style.flexDirection = model.layout === "vertical" && model.gradient ? "column" : ""
    if (title) { const heading = doc.createElement("strong"); heading.textContent = title; legend.append(heading) }
    if (model.text) { const text = doc.createElement("div"); text.textContent = model.text; legend.append(text) }
    if (model.status) { const status = doc.createElement("div"); status.textContent = model.status; legend.append(status) }
    if (model.gradient) {
      const { low, high, min, max } = model.gradient
      const group = doc.createElement("div")
      if (model.layout === "vertical") { group.style.display = "flex"; group.style.gap = "8px"; group.style.flex = "1 1 auto"; group.style.minHeight = "40px" }
      const scale = doc.createElement("div"); scale.className = "mapsvg-data-rules-legend-gradient"
      scale.style.backgroundImage = `linear-gradient(to ${model.layout === "vertical" ? "top" : "right"}, ${low}, ${high})`
      if (model.layout === "vertical") { scale.style.width = "12px"; scale.style.height = "auto"; scale.style.marginTop = "0" }
      const labels = doc.createElement("div"); labels.className = "mapsvg-data-rules-legend-bounds"
      const bounds = [model.gradient.lowLabel ?? min, model.gradient.highLabel ?? max]
      if (model.layout === "vertical") { bounds.reverse(); labels.style.flexDirection = "column" }
      for (const value of bounds) { const label = doc.createElement("span"); label.textContent = String(value); labels.append(label) }
      group.append(scale, labels); legend.append(group)
    }
    for (const item of model.rows) {
      const line = doc.createElement("div"); line.className = "mapsvg-data-rules-legend-row"
      if (model.layout === "horizontal") { line.style.display = "inline-flex"; line.style.marginRight = "8px" }
      const swatch = doc.createElement("span"); swatch.className = "mapsvg-data-rules-legend-swatch"; swatch.style.backgroundColor = item.color
      const label = doc.createElement("span"); label.textContent = item.label
      line.append(swatch, label); legend.append(line)
    }
    if (model.description) { const description = doc.createElement("div"); description.textContent = model.description; legend.append(description) }
  }
  destroy(): void { this.renderedModel = undefined; this.element.remove(); this.element.replaceChildren() }
}
