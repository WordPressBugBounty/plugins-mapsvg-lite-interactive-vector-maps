import {
  getReachableNodeIds,
  type MapSvgNode,
  type NodeType,
  type SceneNode,
} from "./NodesRegistry"
import {
  buildLayoutGridShell,
  pickLayoutGrid,
  type LayoutGridBreakpoint,
  type LayoutGridOptions,
  type LayoutGridWidget,
} from "../Layout/LayoutGridRuntime"

type NodesOptionsLike = {
  layout?: { mountMode?: string }
  nodes?: Array<MapSvgNode> | { length: number; [i: number]: MapSvgNode; get?: (id: string) => MapSvgNode }
  scenes?: Array<SceneNode> | { length: number; [i: number]: SceneNode; get?: (id: string) => SceneNode }
  detailsView?: Record<string, any>
  menu?: Record<string, any>
  filters?: Record<string, any>
}

export function isTreeLayoutMode(options: NodesOptionsLike): boolean {
  return options.layout?.mountMode === "tree"
}

export type ModalMountKind = "main-overlay" | "body" | "custom" | "legacy"

export type ModalMountResolution = {
  kind: ModalMountKind
  /** Legacy container key used by DetailsController (map/fullscreen/custom/…) */
  location: string
  containerId?: string
  modalNode?: MapSvgNode
}

const SLOT_ALIAS: Record<string, string> = {
  main: "map",
  map: "map",
  leftsidebar: "leftSidebar",
  rightsidebar: "rightSidebar",
  header: "header",
  footer: "footer",
}

export const DEFAULT_MAP_CHROME_GRID: LayoutGridOptions = {
  column: 12,
  gap: 8,
  cellHeight: 48,
  grids: {
    desktop: [
      { id: "layers", x: 0, y: 0, w: 3, h: 3 },
      { id: "controls", x: 10, y: 0, w: 2, h: 3 },
    ],
    tablet: [
      { id: "layers", x: 0, y: 0, w: 4, h: 3 },
      { id: "controls", x: 9, y: 0, w: 3, h: 3 },
    ],
    mobile: [
      { id: "layers", x: 0, y: 0, w: 6, h: 2 },
      { id: "controls", x: 8, y: 0, w: 4, h: 2 },
    ],
  },
}

function toNodeArray(nodes: NodesOptionsLike["nodes"]): MapSvgNode[] {
  if (!nodes) return []
  return Array.from(nodes as ArrayLike<MapSvgNode>)
}

function toSceneArray(scenes: NodesOptionsLike["scenes"]): SceneNode[] {
  if (!scenes) return []
  return Array.from(scenes as ArrayLike<SceneNode>)
}

function slug(input: string): string {
  return String(input || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase()
}

export function getReachableIdsFromOptions(options: NodesOptionsLike): Set<string> {
  return getReachableNodeIds(toNodeArray(options.nodes), toSceneArray(options.scenes))
}

export function findReachableNodesByType(
  options: NodesOptionsLike,
  type: NodeType,
): MapSvgNode[] {
  const reachable = getReachableIdsFromOptions(options)
  return toNodeArray(options.nodes).filter((node) => node.type === type && reachable.has(node.id))
}

export function isNodeTypeReachable(options: NodesOptionsLike, type: NodeType): boolean {
  return findReachableNodesByType(options, type).length > 0
}

export function findParentNode(
  options: NodesOptionsLike,
  childId: string,
): MapSvgNode | undefined {
  return toNodeArray(options.nodes).find((node) =>
    Array.isArray(node.children) ? node.children.includes(childId) : false,
  )
}

/** A lone visible Details node must contribute its height to a page slot. */
export function isSoleVisibleModalInSlot(
  options: NodesOptionsLike,
  modalNode: MapSvgNode | undefined,
): boolean {
  if (!isTreeLayoutMode(options) || !modalNode) return false
  const parent = findParentNode(options, modalNode.id)
  if (parent?.type !== "slot") return false
  const byId = new Map(toNodeArray(options.nodes).map((node) => [node.id, node]))
  const visibleChildren = (parent.children || []).filter((id) => {
    const child = byId.get(id)
    return child && child.settings?.on !== false
  })
  return visibleChildren.length === 1 && visibleChildren[0] === modalNode.id
}

function slotIdToLegacyLocation(slotId: string): string {
  const key = slug(slotId)
  return SLOT_ALIAS[key] || slotId
}

/**
 * Resolve directory mount location from the nodes tree.
 * Returns null when directory is not reachable (do not mount).
 */
export function resolveDirectoryLocation(options: NodesOptionsLike): string | null {
  if (!isTreeLayoutMode(options)) return String(options.menu?.location || "leftSidebar")
  const nodes = findReachableNodesByType(options, "directory")
  if (nodes.length === 0) return null
  const parent = findParentNode(options, nodes[0].id)
  if (!parent) return null
  if (parent.type === "slot") return slotIdToLegacyLocation(parent.id)
  const settings = nodes[0].settings || {}
  if (settings.location === "custom" && typeof settings.containerId === "string") {
    return "custom"
  }
  return "leftSidebar"
}

/**
 * Resolve filters mount location from the nodes tree.
 * Returns null when filters is not reachable (do not mount).
 */
export function resolveFiltersLocation(options: NodesOptionsLike): string | null {
  if (!isTreeLayoutMode(options)) return String(options.filters?.location || "header")
  const nodes = findReachableNodesByType(options, "filters")
  if (nodes.length === 0) return null
  const parent = findParentNode(options, nodes[0].id)
  if (!parent) return null
  if (parent.type === "slot") return slotIdToLegacyLocation(parent.id)
  const settings = nodes[0].settings || {}
  if (settings.location === "custom" && typeof settings.containerId === "string") {
    return "custom"
  }
  return "header"
}

/**
 * Modal under Main/slot → overlay; under body → document.body portal;
 * custom containerId → custom; else legacy detailsView.location.
 */
export function resolveModalMount(
  options: NodesOptionsLike,
  modalNodeId?: string,
): ModalMountResolution {
  if (!isTreeLayoutMode(options)) {
    return {
      kind: "legacy",
      location: String(options.detailsView?.location || "map"),
      containerId: options.detailsView?.containerId,
    }
  }
  const reachableModals = findReachableNodesByType(options, "modal")
  const modalNode = modalNodeId
    ? reachableModals.find((node) => node.id === modalNodeId) ||
      toNodeArray(options.nodes).find((node) => node.id === modalNodeId)
    : reachableModals[0]

  if (!modalNode || !getReachableIdsFromOptions(options).has(modalNode.id)) {
    const legacy = String(options.detailsView?.location || "map")
    return { kind: "legacy", location: legacy, containerId: options.detailsView?.containerId }
  }

  const parent = findParentNode(options, modalNode.id)
  const settings = modalNode.settings || {}
  const containerId =
    typeof settings.containerId === "string"
      ? settings.containerId
      : typeof options.detailsView?.containerId === "string"
        ? options.detailsView.containerId
        : undefined

  if (
    settings.location === "custom" &&
    !settings.placement &&
    containerId
  ) {
    return { kind: "custom", location: "custom", modalNode, containerId }
  }

  if (parent?.type === "body") {
    return { kind: "body", location: "fullscreen", modalNode, containerId }
  }

  if (parent?.type === "slot" || parent?.type === "frame") {
    return { kind: "main-overlay", location: "map", modalNode, containerId }
  }

  const legacy = String(settings.location || options.detailsView?.location || "map")
  return { kind: "legacy", location: legacy, modalNode, containerId }
}

export function ensureDefaultChromeGrid(mapNode: MapSvgNode): void {
  if (!mapNode.settings || typeof mapNode.settings !== "object") {
    mapNode.settings = {}
  }
  const existing = mapNode.settings.chromeGrid
  if (existing && typeof existing === "object") return
  mapNode.settings.chromeGrid = structuredClone
    ? structuredClone(DEFAULT_MAP_CHROME_GRID)
    : JSON.parse(JSON.stringify(DEFAULT_MAP_CHROME_GRID))
}

export function pickMapChromeGrid(
  mapNode: MapSvgNode | undefined,
  opts: { isPhone: boolean; isTablet: boolean; breakpoint?: LayoutGridBreakpoint | null },
): { column: number; gap: number; cellHeight: number; widgets: LayoutGridWidget[] } | null {
  if (!mapNode) return null
  ensureDefaultChromeGrid(mapNode)
  return pickLayoutGrid(mapNode.settings.chromeGrid, opts)
}

export function buildMapChromeShell(
  doc: Document,
  config: { column: number; gap: number; cellHeight: number; widgets: LayoutGridWidget[] },
): { grid: HTMLElement; slots: Map<string, HTMLElement> } {
  const { grid, slots } = buildLayoutGridShell(doc, config)
  grid.className = "mapsvg-map-chrome-grid"
  grid.style.position = "absolute"
  grid.style.inset = "0"
  grid.style.pointerEvents = "none"
  grid.style.zIndex = "20"
  grid.style.width = "100%"
  grid.style.height = "100%"
  for (const cell of slots.values()) {
    cell.classList.add("mapsvg-map-chrome-slot")
    cell.style.pointerEvents = "auto"
    cell.style.position = "relative"
    cell.style.minWidth = "0"
    cell.style.minHeight = "0"
  }
  return { grid, slots }
}
