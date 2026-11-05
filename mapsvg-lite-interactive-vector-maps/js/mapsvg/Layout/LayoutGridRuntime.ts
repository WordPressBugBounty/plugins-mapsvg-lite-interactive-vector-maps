import { viewportLayoutBreakpoint, applyContainerLayout, containerLayout, type ContainerLayout, type LayoutBreakpoint, type ResponsiveContainer } from "./ResponsiveLayout"
export type LayoutGridBreakpoint = "desktop" | "tablet" | "mobile"

export type LayoutGridWidget = {
  id: string
  x: number
  y: number
  w: number
  h: number
}

export type LayoutGridOptions = {
  column?: number
  gap?: number
  cellHeight?: number
  grids?: Partial<Record<LayoutGridBreakpoint, LayoutGridWidget[]>>
}

/** Order managed children without moving already-correct nodes or touching native siblings. */
export function reconcileLayoutChildren(parent: HTMLElement, desired: HTMLElement[]): void {
  const managed = new Set(desired)
  const nextManaged = (element: Element | null): Element | null => {
    while (element && !managed.has(element as HTMLElement)) element = element.nextElementSibling
    return element
  }
  let cursor = nextManaged(parent.firstElementChild)
  for (const child of desired) {
    if (child === cursor) cursor = nextManaged(cursor.nextElementSibling)
    else parent.insertBefore(child, cursor)
  }
}

/** Reuse live cells; retire missing cells only after their content can be reparented. */
export function reconcileLayoutGridShell(existing: HTMLElement | undefined, next: { grid: HTMLElement; slots: Map<string, HTMLElement> }) {
  if (!existing) return { ...next, retired: [] as HTMLElement[] }
  const sync = (target: HTMLElement, source: HTMLElement) => {
    for (const attribute of Array.from(target.attributes)) if (!source.hasAttribute(attribute.name)) target.removeAttribute(attribute.name)
    for (const attribute of Array.from(source.attributes)) if (target.getAttribute(attribute.name) !== attribute.value) target.setAttribute(attribute.name, attribute.value)
  }
  sync(existing, next.grid)
  const previous = new Map(Array.from(existing.children).map(cell => [(cell as HTMLElement).dataset.mapsvgSlot, cell as HTMLElement]))
  const slots = new Map<string, HTMLElement>()
  for (const [id, candidate] of next.slots) {
    const cell = previous.get(id) ?? candidate
    if (cell !== candidate) sync(cell, candidate)
    slots.set(id, cell)
  }
  reconcileLayoutChildren(existing, Array.from(slots.values()))
  return { grid: existing, slots, retired: Array.from(previous).filter(([id]) => !slots.has(id!)).map(([, cell]) => cell) }
}

const SLOT_ID_RE = /^[A-Z][A-Za-z0-9]*$/

function normalizeWidget(raw: unknown): LayoutGridWidget | null {
  if (!raw || typeof raw !== "object") return null
  const item = raw as Record<string, unknown>
  let id = typeof item.id === "string" ? item.id.trim() : ""
  // Older editor seed used "Map"; canonical center slot is "Main".
  if (id === "Map") id = "Main"
  if (!SLOT_ID_RE.test(id)) return null

  const x = Number(item.x)
  const y = Number(item.y)
  const w = Number(item.w)
  const h = Number(item.h)
  if (![x, y, w, h].every((n) => Number.isFinite(n))) return null

  return {
    id,
    x: Math.max(0, Math.floor(x)),
    y: Math.max(0, Math.floor(y)),
    w: Math.max(1, Math.floor(w)),
    h: Math.max(1, Math.floor(h)),
  }
}

export function pickLayoutGrid(
  layout: unknown,
  opts: {
    isPhone: boolean
    isTablet: boolean
    breakpoint?: LayoutGridBreakpoint | null
    viewportWidth?: number
  },
): { column: number; gap: number; cellHeight: number; widgets: LayoutGridWidget[] } | null {
  if (!layout || typeof layout !== "object") return null
  const data = layout as LayoutGridOptions
  const grids = data.grids
  if (!grids || typeof grids !== "object") return null

  const key: LayoutGridBreakpoint =
    opts.breakpoint === "desktop" ||
    opts.breakpoint === "tablet" ||
    opts.breakpoint === "mobile"
      ? opts.breakpoint
      : opts.viewportWidth && opts.viewportWidth > 0
        ? viewportLayoutBreakpoint(opts.viewportWidth)
        : opts.isPhone
        ? "mobile"
        : opts.isTablet
          ? "tablet"
          : "desktop"
  const raw = grids[key]
  if (!Array.isArray(raw)) return null

  const widgets: LayoutGridWidget[] = []
  const ids = new Set<string>()
  for (const item of raw) {
    const w = normalizeWidget(item)
    if (!w || ids.has(w.id)) continue
    ids.add(w.id)
    widgets.push(w)
  }

  return {
    column: Math.max(1, Math.floor(Number(data.column) || 12)),
    // Ignore retained grid gutters without rewriting immutable version snapshots.
    gap: 0,
    cellHeight: Math.max(1, Number(data.cellHeight) || 64),
    widgets,
  }
}

/** Side-by-side containers follow an Auto/Fixed Map by default; explicit modes win. */
export function gridContainerLayout(
  node: ResponsiveContainer | undefined,
  breakpoint: LayoutBreakpoint,
  widgets: LayoutGridWidget[],
  nodes: ResponsiveContainer[],
): ContainerLayout {
  const settings = containerLayout(node, breakpoint)
  if (!node || settings.height || settings.heightPercent !== undefined) return settings
  const widget = widgets.find(item => item.id === node.id)
  if (!widget) return settings
  const containsMap = (id: string, visited = new Set<string>()): boolean => {
    if (visited.has(id)) return false
    visited.add(id)
    const current = nodes.find(item => item.id === id)
    if (!current || current.settings?.on === false || containerLayout(current, breakpoint).hidden) return false
    return current.type === "map" || (current.children ?? []).some(child => containsMap(child, visited))
  }
  if (containsMap(node.id)) return settings
  const followsMap = widgets.some(other => other.id !== node.id && other.y === widget.y && other.h === widget.h &&
    (other.x + other.w <= widget.x || widget.x + widget.w <= other.x) &&
    !containerLayout(nodes.find(item => item.id === other.id), breakpoint).hidden &&
    containerLayout(nodes.find(item => item.id === other.id), breakpoint).height?.mode !== "fill" && containsMap(other.id))
  return followsMap ? { ...settings, height: { mode: "fill" } } : settings
}

export function buildLayoutGridShell(
  doc: Document,
  config: { column: number; gap: number; cellHeight: number; widgets: LayoutGridWidget[] },
  options: { rowSizing?: "fixed" | "content"; nodes?: ResponsiveContainer[]; breakpoint?: LayoutBreakpoint } = {},
): { grid: HTMLElement; slots: Map<string, HTMLElement> } {
  const grid = doc.createElement("div")
  grid.className = "mapsvg-layout-grid"
  grid.style.display = "grid"
  grid.style.gridTemplateColumns = `repeat(${config.column}, minmax(0, 1fr))`
  grid.style.gridAutoRows =
    options.rowSizing === "content" ? "auto" : `${config.cellHeight}px`
  grid.style.alignItems = "stretch"
  grid.style.gap = `${config.gap}px`
  grid.style.width = "100%"

  const slots = new Map<string, HTMLElement>()
  const nodes = options.nodes ?? []
  const breakpoint = options.breakpoint ?? "desktop"
  const visible = config.widgets.filter(widget => !containerLayout(nodes.find(node => node.id === widget.id), breakpoint).hidden)
  // A fixed sidebar in a horizontal row owns its tracks, so an adjacent Fill
  // receives the remaining width instead of leaving the old fractional gutter.
  // Full-row fixed content keeps the page tracks (it can be narrower than App).
  if (options.nodes) {
    const fixedTracks: Array<number | undefined> = Array(config.column).fill(undefined)
    const conflicts = new Set<number>()
    for (const widget of visible) {
      const size = containerLayout(nodes.find(node => node.id === widget.id), breakpoint).width
      const hasNeighbour = visible.some(other => other.id !== widget.id && other.y < widget.y + widget.h && other.y + other.h > widget.y)
      if (size?.mode !== "fixed" || size.value === undefined || widget.w >= config.column || !hasNeighbour) continue
      const trackWidth = Math.max(0, (size.value - config.gap * (widget.w - 1)) / widget.w)
      for (let column = widget.x; column < Math.min(config.column, widget.x + widget.w); column++) {
        if (fixedTracks[column] !== undefined && fixedTracks[column] !== trackWidth) conflicts.add(column)
        fixedTracks[column] = trackWidth
      }
    }
    grid.style.gridTemplateColumns = fixedTracks.map((width, index) => width === undefined || conflicts.has(index) ? "minmax(0, 1fr)" : `minmax(0, ${width}px)`).join(" ")
  }
  for (const original of visible) {
    const widget = { ...original }
    const presentation = gridContainerLayout(nodes.find(node => node.id === widget.id), breakpoint, visible, nodes)
    // Fill may claim adjacent empty columns, but never cross a visible neighbour.
    if (presentation.width?.mode === "fill") {
      const overlapsRow = (other: LayoutGridWidget) => other.id !== widget.id && other.y < widget.y + widget.h && other.y + other.h > widget.y
      const neighbours = visible.filter(overlapsRow)
      const isFill = (other: LayoutGridWidget) => containerLayout(nodes.find(node => node.id === other.id), breakpoint).width?.mode === "fill"
      const left = Math.max(0, ...neighbours.filter(other => other.x + other.w <= original.x)
        .map(other => isFill(other) ? Math.ceil((other.x + other.w + original.x) / 2) : other.x + other.w))
      const right = Math.min(config.column, ...neighbours.filter(other => other.x >= original.x + original.w)
        .map(other => isFill(other) ? Math.ceil((original.x + original.w + other.x) / 2) : other.x))
      widget.x = left
      widget.w = Math.max(original.w, right - left)
    }
    const cell = doc.createElement("div")
    cell.className = "mapsvg-layout-slot"
    cell.dataset.mapsvgSlot = widget.id
    cell.style.gridColumn = `${widget.x + 1} / span ${widget.w}`
    cell.style.gridRow = `${widget.y + 1} / span ${widget.h}`
    if (options.nodes) {
      applyContainerLayout(cell, presentation, "cell")
      if (presentation.maxWidth === undefined && presentation.maxWidthPercent === undefined) cell.style.maxWidth = "100%"
      const mode = presentation.height?.mode ?? "auto"
      cell.dataset.mapsvgHeightMode = mode
      // A Fill cell must not contribute its list's intrinsic height to auto rows.
      // Percentage min-height then stretches it to the row sized by its peers.
      // Unlike size containment, this preserves intrinsic width (Width = Auto).
      const hasDriver = visible.some(other => other.id !== widget.id && other.y === widget.y && other.h === widget.h &&
        gridContainerLayout(nodes.find(node => node.id === other.id), breakpoint, visible, nodes).height?.mode !== "fill")
      if (mode === "fill" && presentation.heightPercent === undefined && (options.rowSizing !== "content" || hasDriver)) {
        cell.dataset.mapsvgRowFollower = "true"
        cell.style.height = "0px"
        const limit = presentation.maxHeight !== undefined ? `min(100%, ${presentation.maxHeight}px)`
          : presentation.maxHeightPercent !== undefined ? `${presentation.maxHeightPercent}%` : "100%"
        cell.style.minHeight = presentation.minHeight === undefined ? limit : `max(${presentation.minHeight}px, ${limit})`
        cell.style.overflow = "auto"
      } else if (mode === "fill" && presentation.heightPercent === undefined) {
        // An all-Fill row has no intrinsic driver: retain content instead of collapsing.
        cell.style.height = "auto"
      } else if (mode === "fixed" || presentation.heightPercent !== undefined || presentation.maxHeight !== undefined || presentation.maxHeightPercent !== undefined) {
        cell.style.overflow = "auto"
      }
    }
    grid.appendChild(cell)
    slots.set(widget.id, cell)
  }

  return { grid, slots }
}

/** Attach page slot hosts without carrying legacy sidebar markup into tree mode. */
export function mountLayoutSlotHosts(
  doc: Document,
  slots: Map<string, HTMLElement>,
  legacyHosts: Record<string, HTMLElement | undefined>,
  cachedHosts: Map<string, HTMLElement>,
  treeMode: boolean,
): Map<string, HTMLElement> {
  const hosts = new Map(cachedHosts)
  for (const [slotId, cell] of slots) {
    let host: HTMLElement | undefined
    if (treeMode) {
      const cached = cachedHosts.get(slotId)
      host = cached?.classList.contains("mapsvg-layout-slot-content") ? cached : undefined
      if (!host) {
        host = doc.createElement("div")
        host.className = "mapsvg-layout-slot-content"
        host.dataset.mapsvgNodeId = slotId
      }
    } else {
      host = legacyHosts[slotId]
    }
    if (!host) continue
    if (host.parentElement !== cell) cell.appendChild(host)
    hosts.set(slotId, host)
  }
  return hosts
}
