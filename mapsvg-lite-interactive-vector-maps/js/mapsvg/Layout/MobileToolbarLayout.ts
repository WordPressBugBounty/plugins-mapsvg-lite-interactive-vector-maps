import { containerLayout, type LayoutBreakpoint } from "./ResponsiveLayout"
import type { LayoutGridWidget } from "./LayoutGridRuntime"

export type MobileToolbarView = "map" | "list"
export type MobileToolbarNode = {
  id: string; type: string; title?: string; children?: string[]; settings?: Record<string, any>
}
export type MobileToolbarSettings = {
  mapContainerId?: string; listContainerId?: string; showFirst?: string; showMapOnClick?: boolean
}
export type MobileToolbarTargets = { mapId: string; listId: string }

/** Match the existing Page ownership contract; a single retained Page owns all nodes. */
export function mobileToolbarPageNodes(nodes: MobileToolbarNode[], pages: Array<{ id: string; rootNodeId?: string; bodyNodeId?: string }>, pageId?: string) {
  if (pages.length <= 1) return nodes
  const page = pages.find(item => item.id === pageId)
  if (!page) return []
  const found = new Set<string>(), pending = [page.rootNodeId, page.bodyNodeId]
  while (pending.length) {
    const id = pending.pop()
    if (!id || found.has(id)) continue
    const node = nodes.find(item => item.id === id)
    if (!node) continue
    found.add(id)
    pending.push(...(node.children ?? []))
  }
  return nodes.filter(node => found.has(node.id))
}

export function slotForNode(nodes: MobileToolbarNode[], id: string): string | undefined {
  const visited = new Set<string>()
  let node = nodes.find(item => item.id === id)
  while (node && !visited.has(node.id)) {
    visited.add(node.id)
    if (node.type === "slot") return node.id
    node = nodes.find(parent => parent.children?.includes(node!.id))
  }
}

export function slotContainsType(nodes: MobileToolbarNode[], slotId: string, type: string, enabledOnly = true): boolean {
  const visited = new Set<string>()
  const walk = (id: string): boolean => {
    if (visited.has(id)) return false
    visited.add(id)
    const node = nodes.find(item => item.id === id)
    if (!node || (enabledOnly && node.settings?.on === false)) return false
    return node.type === type || (node.children ?? []).some(walk)
  }
  return walk(slotId)
}

/** Existing mixed layouts remain readable; authoring must not introduce new conflicts. */
export function mixedMapListSlots(nodes: MobileToolbarNode[]): string[] {
  return nodes.filter(node => node.type === "slot" && slotContainsType(nodes, node.id, "map", false) && slotContainsType(nodes, node.id, "directory", false)).map(node => node.id)
}

export function resolveMobileToolbarTargets(nodes: MobileToolbarNode[], settings: MobileToolbarSettings): { targets?: MobileToolbarTargets; error?: string } {
  const choose = (role: "map" | "directory", explicit?: string): string | undefined => {
    const matches = nodes.filter(node => node.type === "slot" && slotContainsType(nodes, node.id, role))
    if (explicit) return matches.some(node => node.id === explicit) ? explicit : undefined
    return matches.length === 1 ? matches[0].id : undefined
  }
  const mapId = choose("map", settings.mapContainerId)
  const listId = choose("directory", settings.listContainerId)
  if (!mapId || !listId) return { error: "Choose separate containers containing Map and Directory. Auto requires one matching container for each." }
  if (mapId === listId || slotContainsType(nodes, mapId, "directory") || slotContainsType(nodes, listId, "map")) {
    return { error: "Map and Directory must be in separate layout containers." }
  }
  if (nodes.some(node => node.type === "mobileToolbar" && node.settings?.on !== false && [mapId, listId].includes(slotForNode(nodes, node.id) || ""))) {
    return { error: "Place Mobile Toolbar in a separate container so it stays visible in Map and List views." }
  }
  return { targets: { mapId, listId } }
}

export function visibleMobileToolbar(nodes: MobileToolbarNode[], widgets: LayoutGridWidget[], breakpoint: LayoutBreakpoint): MobileToolbarNode | undefined {
  return nodes.find(node => {
    if (node.type !== "mobileToolbar") return false
    const seen = new Set<string>()
    let current: MobileToolbarNode | undefined = node
    while (current && !seen.has(current.id)) {
      seen.add(current.id)
      if (current.settings?.on === false || containerLayout(current, breakpoint).hidden) return false
      if (current.type === "slot") return widgets.some(widget => widget.id === current!.id)
      current = nodes.find(parent => parent.children?.includes(current!.id))
    }
    return false
  })
}

/** Render-only projection; saved nodes and geometry are never changed by visitor clicks. */
export function projectMobileToolbarLayout(nodes: MobileToolbarNode[], widgets: LayoutGridWidget[], breakpoint: LayoutBreakpoint, targets: MobileToolbarTargets) {
  const mapArea = widgets.find(widget => widget.id === targets.mapId)
  if (!mapArea) return null
  const projectedNodes = nodes.map(node => {
    if (![targets.mapId, targets.listId].includes(node.id)) return node
    const settings = node.settings ?? {}
    const presentation = containerLayout(node, breakpoint)
    return { ...node, settings: { ...settings, responsiveLayout: { ...settings.responsiveLayout, [breakpoint]: {
      ...presentation, hidden: false,
      ...(node.id === targets.listId ? { width: { mode: "fill" }, height: { mode: "fill" } } : {}),
    } } } }
  })
  const projectedWidgets = widgets.filter(widget => widget.id !== targets.listId).map(widget => ({ ...widget }))
  projectedWidgets.push({ ...mapArea, id: targets.listId })
  // Close empty grid rows left by the old List position, keeping independent content.
  const occupied = new Set<number>()
  for (const widget of projectedWidgets) {
    if (containerLayout(projectedNodes.find(node => node.id === widget.id), breakpoint).hidden) continue
    for (let row = widget.y; row < widget.y + widget.h; row++) occupied.add(row)
  }
  const rows = [...occupied].sort((a, b) => a - b)
  const before = (line: number) => rows.filter(row => row < line).length
  return {
    nodes: projectedNodes,
    widgets: projectedWidgets.map(widget => ({ ...widget, y: before(widget.y), h: Math.max(1, before(widget.y + widget.h) - before(widget.y)) })),
  }
}

export function renameMobileToolbarTargets(settings: Record<string, any> | undefined, oldId: string, newId: string) {
  if (!settings) return settings
  return { ...settings,
    ...(settings.mapContainerId === oldId ? { mapContainerId: newId } : {}),
    ...(settings.listContainerId === oldId ? { listContainerId: newId } : {}),
  }
}
