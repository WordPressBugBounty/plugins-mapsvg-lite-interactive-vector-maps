export type LayerSwitch = { id: string | number; title?: string; visible?: boolean }
let instanceId = 0

/** View only: the source Map owns group membership and visibility. */
export class LayersControl {
  readonly element: HTMLDivElement
  readonly label: HTMLDivElement
  readonly listNano: HTMLDivElement
  readonly list: HTMLDivElement
  private id = ++instanceId
  private expanded?: boolean
  private renderedGroups?: string
  private change?: (id: string | number, visible: boolean) => void
  constructor(private document: Document) {
    const create = (className: string) => { const div = document.createElement("div"); div.className = className; return div }
    this.element = create("mapsvg-layers-control")
    this.label = create("mapsvg-layers-label")
    this.label.setAttribute("role", "button"); this.label.tabIndex = 0
    const wrap = create("mapsvg-layers-list-wrap")
    this.listNano = create("mapsvg-layers-scroll"); this.list = create("mapsvg-layers-list")
    this.listNano.append(this.list); wrap.append(this.listNano); this.element.append(this.label, wrap)
    const toggle = () => { this.element.classList.toggle("closed"); this.label.setAttribute("aria-expanded", String(!this.element.classList.contains("closed"))) }
    this.label.addEventListener("click", toggle)
    this.label.addEventListener("keydown", event => { if (["Enter", " "].includes(event.key)) { event.preventDefault(); toggle() } })
  }
  update(options: { label?: string; expanded?: boolean }, groups: LayerSwitch[], change: (id: string | number, visible: boolean) => void): void {
    this.change = change
    if (this.label.textContent !== (options.label || "Layers")) this.label.textContent = options.label || "Layers"
    if (this.expanded !== options.expanded) {
      this.expanded = options.expanded
      this.element.classList.toggle("closed", options.expanded === false)
    }
    this.label.setAttribute("aria-expanded", String(!this.element.classList.contains("closed")))
    const renderedGroups = JSON.stringify(groups.map(group => [group.id, group.title, !!group.visible]))
    if (this.renderedGroups === renderedGroups) {
      // Reflect an external/rejected toggle without replacing focused switches.
      this.list.querySelectorAll<HTMLInputElement>("input").forEach((input, index) => { input.checked = !!groups[index].visible })
      return
    }
    this.renderedGroups = renderedGroups
    this.list.replaceChildren()
    groups.forEach((group, index) => {
      const item = this.document.createElement("div"); item.className = "mapsvg-layers-item"; item.dataset.groupId = String(group.id)
      const input = this.document.createElement("input"); input.type = "checkbox"; input.className = "ios8-switch ios8-switch-sm"
      input.id = `mapsvg-layer-${this.id}-${index}`; input.checked = !!group.visible
      const label = this.document.createElement("label"); label.htmlFor = input.id; label.textContent = group.title || String(group.id)
      input.addEventListener("change", () => this.change?.(group.id, input.checked))
      item.append(input, label); this.list.append(item)
    })
  }
  destroy(): void { this.renderedGroups = undefined; this.change = undefined; this.element.remove(); this.list.replaceChildren() }
}
