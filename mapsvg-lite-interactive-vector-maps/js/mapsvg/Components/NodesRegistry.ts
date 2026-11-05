import { ArrayIndexed } from "../Core/ArrayIndexed"
import { mapContentRoots } from "./MapChildren"

type LayoutGridItem = { id: string; x: number; y: number; w: number; h: number }
type MapOptionsLike = {
  layout?: {
    mountMode?: string
    deletedNodeTypes?: string[]
    grids?: {
      desktop?: Array<LayoutGridItem>
      tablet?: Array<LayoutGridItem>
      mobile?: Array<LayoutGridItem>
    }
  }
  nodes?: unknown
  scenes?: unknown
  detailsView?: Record<string, any>
  popovers?: Record<string, any>
  tooltips?: Record<string, any>
  menu?: Record<string, any>
  filters?: Record<string, any>
  actions?: Record<string, any>
}

export type CoreNodeType =
  | "slot"
  | "frame"
  | "body"
  | "map"
  | "modal"
  | "popover"
  | "tooltip"
  | "directory"
  | "filters"
  | "region"
  | "marker"
  | "layers"
  | "legend"
  | "controls"
  | "mobileToolbar"
  | "view"
  | "core"

// Paid/third-party modules may persist node types unknown to Lite.
// Keep the known literals for autocomplete while allowing opaque types to
// round-trip through Lite without being rewritten or dropped.
export type NodeType = CoreNodeType | (string & {})

export type MapSvgNode = {
  id: string
  type: NodeType
  title: string
  settings: Record<string, unknown>
  styles?: Record<string, unknown>
  template?: string
  css?: string
  js?: Record<string, string>
  children?: string[]
  [key: string]: unknown
}

export type SceneMount = {
  type: "dynamic" | "custom" | (string & {})
  containerId?: string
  [key: string]: unknown
}

export type SceneNode = {
  id: string
  title: string
  /** Primary layout root (usually Main slot). */
  rootNodeId: string
  /** Portal host for fullscreen/body modals — lives in this scene's Layers tree. */
  bodyNodeId: string
  mount: SceneMount
  [key: string]: unknown
}

export type NodeRegistryOptions = {
  nodes: ArrayIndexed<MapSvgNode>
  scenes: ArrayIndexed<SceneNode>
}

const REQUIRED_MAP_CHILDREN: Array<{ id: string; type: NodeType; title: string }> = [
  { id: "region", type: "region", title: "Region" },
  { id: "marker", type: "marker", title: "Marker" },
  { id: "tooltip", type: "tooltip", title: "Tooltip" },
  { id: "popover", type: "popover", title: "Popover" },
  { id: "controls", type: "controls", title: "Controls" },
]

function slug(input: string): string {
  return String(input || "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toLowerCase()
}

function uniqueId(base: string, used: Set<string>): string {
  const normalized = slug(base) || "node"
  if (!used.has(normalized)) {
    used.add(normalized)
    return normalized
  }
  let i = 2
  while (used.has(`${normalized}-${i}`)) i += 1
  const id = `${normalized}-${i}`
  used.add(id)
  return id
}

function toArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

function buildGridSlotIds(options: MapOptionsLike): string[] {
  const ids = new Set<string>()
  const grids = options?.layout?.grids
  const pushIds = (items?: Array<{ id: string }>) => {
    toArray<{ id: string }>(items).forEach((item) => {
      if (item && typeof item.id === "string" && item.id.trim()) ids.add(item.id.trim())
    })
  }
  pushIds(grids?.desktop)
  pushIds(grids?.tablet)
  pushIds(grids?.mobile)
  if (ids.size === 0) ids.add("Main")
  return Array.from(ids)
}

function defaultSlotSettings(slotId: string): Record<string, unknown> {
  const legacy = {
    leftsidebar: { width: "250px", height: "auto" },
    rightsidebar: { width: "250px", height: "auto" },
    header: { width: "100%", height: "auto" },
    footer: { width: "100%", height: "auto" },
    main: { width: "100%", height: "auto" },
  } as const
  const key = slug(slotId)
  return { ...(legacy[key as keyof typeof legacy] || legacy.main) }
}

function createNode(
  id: string,
  type: NodeType,
  title: string,
  settings: Record<string, unknown> = {},
): MapSvgNode {
  return {
    id,
    type,
    title,
    settings: { ...settings },
    children: [],
  }
}

function ensureChildren(node: MapSvgNode): string[] {
  if (!Array.isArray(node.children)) node.children = []
  return node.children as string[]
}

function addChildUnique(parent: MapSvgNode, childId: string): void {
  const children = ensureChildren(parent)
  if (!children.includes(childId)) children.push(childId)
}

function buildIndex(nodes: Array<MapSvgNode>): Map<string, MapSvgNode> {
  return new Map(nodes.map((node) => [node.id, node]))
}

function normalizeExistingNodes(input: unknown): Array<MapSvgNode> {
  const used = new Set<string>()
  const normalized: Array<MapSvgNode> = []
  toArray<Partial<MapSvgNode> & Record<string, unknown>>(input).forEach((raw) => {
    const rawObject = raw && typeof raw === "object" ? raw : {}
    const type = (raw?.type || "view") as NodeType
    // Preserve original ids (Main vs main). Slugging here created duplicate slots
    // after layout load (orphan `main` + layout `Main`) and hid filters from Layers.
    const rawId = String(raw?.id || raw?.title || type).trim()
    let id = rawId
    if (!id || used.has(id)) {
      id = uniqueId(rawId || type, used)
    } else {
      used.add(id)
    }
    normalized.push({
      ...rawObject,
      id,
      type,
      title: String(raw?.title || raw?.id || type),
      settings:
        raw?.settings && typeof raw.settings === "object"
          ? { ...(raw.settings as Record<string, unknown>) }
          : {},
      styles:
        raw?.styles && typeof raw.styles === "object"
          ? { ...(raw.styles as Record<string, unknown>) }
          : undefined,
      template: typeof raw?.template === "string" ? raw.template : undefined,
      css: typeof raw?.css === "string" ? raw.css : undefined,
      js:
        raw?.js && typeof raw.js === "object"
          ? { ...(raw.js as Record<string, string>) }
          : undefined,
      children: toArray<string>(raw?.children).filter(Boolean),
    })
  })
  return normalized
}

function removeChild(parent: MapSvgNode, childId: string): void {
  parent.children = ensureChildren(parent).filter((id) => id !== childId)
}

function findParentOf(nodes: Array<MapSvgNode>, childId: string): MapSvgNode | undefined {
  return nodes.find((node) => ensureChildren(node).includes(childId))
}

/**
 * Layout grids use canonical casing (`Main`, `LeftSidebar`). Early normalize
 * (before server options) may create slug-case orphans (`main`). Merge orphans
 * into the layout-canonical slot and drop duplicates.
 */
function mergeSlugDuplicateSlots(nodes: Array<MapSvgNode>, canonicalSlotIds: string[]): void {
  const canonicalBySlug = new Map(canonicalSlotIds.map((id) => [slug(id), id]))

  for (const [slotSlug, canonicalId] of canonicalBySlug) {
    const keep = ensureNode(
      nodes,
      canonicalId,
      "slot",
      canonicalId,
      defaultSlotSettings(canonicalId),
    )
    const orphans = nodes.filter(
      (node) => node.type === "slot" && slug(node.id) === slotSlug && node.id !== keep.id,
    )
    for (const orphan of orphans) {
      for (const childId of ensureChildren(orphan)) {
        addChildUnique(keep, childId)
      }
      const orphanIndex = nodes.indexOf(orphan)
      if (orphanIndex >= 0) nodes.splice(orphanIndex, 1)
    }
  }
}

/**
 * Constructor often normalizes before layout grids arrive, so filters/directory
 * fall back onto Main. Once the real target slot exists, finish that one-shot
 * seed (do not touch intentionally detached / Saved nodes with no parent).
 */
function finishInterruptedLocationSeed(
  nodes: Array<MapSvgNode>,
  source: MapOptionsLike & Record<string, any>,
): void {
  const rehome = (
    nodeId: string,
    nodeType: NodeType,
    title: string,
    locationRaw: unknown,
    defaultLocation: string,
  ) => {
    const desired = String(locationRaw || defaultLocation)
    if (!desired || desired === "custom" || desired === "map") return
    const target = nodes.find((node) => node.type === "slot" && slug(node.id) === slug(desired))
    if (!target) return

    let node = nodes.find((item) => item.id === nodeId)
    if (!node) {
      // Not seeded yet (nodes existed for other reasons) — leave to explicit Library add.
      return
    }
    if (node.type !== nodeType) node.type = nodeType
    if (!node.title) node.title = title

    const parent = findParentOf(nodes, node.id)
    if (!parent) return // Saved / detached — do not auto-attach
    if (parent.id === target.id) return
    // Only move off Main bootstrap fallback (or a slug-orphan of Main).
    if (parent.type !== "slot" || slug(parent.id) !== "main") return

    removeChild(parent, node.id)
    addChildUnique(target, node.id)
  }

  if (source.filters && typeof source.filters === "object" && source.filters.on) {
    rehome("filters", "filters", "Filters", source.filters.location, "header")
  }
  if (source.menu && typeof source.menu === "object" && source.menu.on) {
    rehome("directory", "directory", "Directory", source.menu.location, "leftSidebar")
  }
  if (source.detailsView && typeof source.detailsView === "object") {
    rehome("details-modal", "modal", "Details", source.detailsView.location, "map")
  }
}

function sceneOrDefault(
  existingScenes: Array<SceneNode>,
  id: string,
  fallback: SceneNode,
): SceneNode {
  const fromExisting = existingScenes.find((scene) => scene.id === id)
  if (fromExisting) return fromExisting
  return fallback
}

function filterExistingChildren(node: MapSvgNode, validIds: Set<string>): void {
  node.children = toArray<string>(node.children).filter((id) => validIds.has(id))
}

function normalizeSceneMount(mount: unknown): SceneMount {
  const raw = (mount && typeof mount === "object" ? mount : {}) as Record<string, unknown> & {
    type?: string
    containerId?: string
  }
  // Legacy mount.type "body" (old Scene-Modal) → dynamic; body is now scene.bodyNodeId.
  // Any other unknown type is extension-owned and must round-trip unchanged.
  const type: SceneMount["type"] =
    typeof raw.type === "string" && raw.type && raw.type !== "body" ? raw.type : "dynamic"
  return {
    ...raw,
    type,
    containerId: typeof raw.containerId === "string" ? raw.containerId : undefined,
  }
}

function createSceneList(
  mainRootId: string,
  bodyNodeId: string,
  existing: unknown,
): Array<SceneNode> {
  const existingScenes = toArray<Partial<SceneNode> & Record<string, unknown>>(existing)
    .map((scene) => ({
      ...scene,
      id: String(scene?.id || ""),
      title: String(scene?.title || scene?.id || ""),
      rootNodeId: String(scene?.rootNodeId || ""),
      bodyNodeId: String(scene?.bodyNodeId || ""),
      mount: normalizeSceneMount(scene?.mount),
    }))
    .filter((scene) => scene.id)
    // Former Scene-Modal is folded into scene bodyNodeId — drop the extra scene tab.
    .filter((scene) => scene.id !== "scene-modal")

  const scene1 = sceneOrDefault(existingScenes as Array<SceneNode>, "scene-1", {
    id: "scene-1",
    title: "Scene 1",
    rootNodeId: mainRootId,
    bodyNodeId,
    mount: { type: "dynamic" },
  })
  if (!scene1.rootNodeId) scene1.rootNodeId = mainRootId
  if (!scene1.bodyNodeId) scene1.bodyNodeId = bodyNodeId
  // Legacy: scene-1 pointed at Main while body lived only under scene-modal.
  if (scene1.rootNodeId === bodyNodeId) scene1.rootNodeId = mainRootId

  const extra = existingScenes
    .filter((scene) => scene.id !== "scene-1")
    .map((scene) => ({
      ...scene,
      bodyNodeId: scene.bodyNodeId || bodyNodeId,
      rootNodeId: scene.rootNodeId || mainRootId,
      mount: scene.mount || { type: "dynamic" as const },
    }))

  return [scene1, ...extra]
}

function ensureNode(
  nodes: Array<MapSvgNode>,
  id: string,
  type: NodeType,
  title: string,
  settings: Record<string, unknown> = {},
): MapSvgNode {
  let node = nodes.find((item) => item.id === id)
  if (!node) {
    node = createNode(id, type, title, settings)
    nodes.push(node)
  } else {
    node.type = type
    node.title = node.title || title
    node.settings = node.settings && typeof node.settings === "object" ? node.settings : {}
    ensureChildren(node)
  }
  return node
}

export function normalizeNodesOptions(
  options: MapOptionsLike & Record<string, any>,
): NodeRegistryOptions {
  const source = options || ({} as MapOptionsLike & Record<string, any>)
  const hadNodesRegistry = toArray(source.nodes).length > 0
  const nodes = normalizeExistingNodes(source.nodes)
  const slots = buildGridSlotIds(source)

  // Ensure slot nodes from page layout grids.
  slots.forEach((slotId) => {
    ensureNode(nodes, slotId, "slot", slotId, defaultSlotSettings(slotId))
  })
  // Collapse `main` / `leftsidebar` orphans into layout-canonical `Main` / `LeftSidebar`.
  mergeSlugDuplicateSlots(nodes, slots)

  const existingMapSlot = nodes.find(
    (node) => node.type === "slot" && ensureChildren(node).includes("map") && slots.includes(node.id),
  )
  const mainSlotId = slots.find((id) => slug(id) === "main") || existingMapSlot?.id || slots[0] || "Main"
  const mainSlot = ensureNode(
    nodes,
    mainSlotId,
    "slot",
    mainSlotId,
    defaultSlotSettings(mainSlotId),
  )
  const bodyNode = ensureNode(nodes, "body", "body", "Body", {})

  // Keep an existing tree parent when Map is moved like other layout content.
  // An older runtime could append Map back to Main after a drag, leaving two
  // parent references. The explicit placement written by the editor wins.
  const mapNode = nodes.find(node=>node.type==="map") ??
    (source.layout?.deletedNodeTypes?.includes("map") ? undefined : ensureNode(nodes, "map", "map", "Map", {}))
  if(mapNode) {
    const attachedMapParents = nodes.filter((node) => ensureChildren(node).includes(mapNode.id))
    const placement = mapNode.settings?.placement && typeof mapNode.settings.placement === "object"
      ? mapNode.settings.placement as { parentId?: unknown }
      : undefined
    const preferredParentId = typeof placement?.parentId === "string" ? placement.parentId : undefined
    const isValidMapParent = (node: MapSvgNode) => node.type === "slot" || node.type === "frame"
    const mapParent = attachedMapParents.find(
      (node) => node.id === preferredParentId && isValidMapParent(node),
    ) || attachedMapParents.find(isValidMapParent) || mainSlot
    for (const parent of attachedMapParents) {
      if (parent !== mapParent) removeChild(parent, mapNode.id)
    }
    addChildUnique(mapParent, mapNode.id)
    if (source.layout?.mountMode === "tree") {
      mapNode.settings.placement = { ...placement, parentId: mapParent.id }
    }
    if (!mapNode.settings || typeof mapNode.settings !== "object") mapNode.settings = {}
    if (!mapNode.settings.chromeGrid || typeof mapNode.settings.chromeGrid !== "object") {
      mapNode.settings.chromeGrid = {
        column: 12,
        gap: 8,
        cellHeight: 48,
        grids: {
          desktop: [
            ...(source.layout?.mountMode === "tree" ? [] : [{ id: "layers", x: 0, y: 0, w: 3, h: 3 }]),
            { id: "controls", x: 10, y: 0, w: 2, h: 3 },
          ],
          tablet: [
            ...(source.layout?.mountMode === "tree" ? [] : [{ id: "layers", x: 0, y: 0, w: 4, h: 3 }]),
            { id: "controls", x: 9, y: 0, w: 3, h: 3 },
          ],
          mobile: [
            ...(source.layout?.mountMode === "tree" ? [] : [{ id: "layers", x: 0, y: 0, w: 6, h: 2 }]),
            { id: "controls", x: 8, y: 0, w: 4, h: 2 },
          ],
        },
      }
    }

    // Map required locked children.
    REQUIRED_MAP_CHILDREN.forEach((child) => {
      const childId = `${mapNode.id}-${child.id}`
      ensureNode(nodes, childId, child.type, child.title, {})
      addChildUnique(mapNode, childId)
    })

    const placeSiblingOverlay = (node: MapSvgNode) => {
      for (const parent of nodes) removeChild(parent, node.id)
      const siblings = ensureChildren(mapParent)
      siblings.splice(Math.max(0, siblings.indexOf(mapNode.id)), 0, node.id)
      const responsive = node.settings.responsiveLayout && typeof node.settings.responsiveLayout === "object"
        ? node.settings.responsiveLayout as Record<string, any> : {}
      const legacyPosition = node.settings.position ?? (node.type === "layers" ? source.layersControl?.position : undefined)
      const anchor = typeof legacyPosition === "string" && ["top-left", "top-right", "bottom-left", "bottom-right"].includes(legacyPosition)
        ? legacyPosition : node.type === "legend" ? "bottom-left" : "top-left"
      node.settings.placement = { ...((node.settings.placement as object) ?? {}), parentId: mapParent.id }
      node.settings.responsiveLayout = { ...responsive, ...Object.fromEntries(["desktop", "tablet", "mobile"].map(bp => [bp, {
        ...responsive[bp], position: "absolute", anchor: responsive[bp]?.anchor ?? anchor,
        width: responsive[bp]?.width ?? { mode: "auto" }, height: responsive[bp]?.height ?? { mode: "auto" },
      }])) }
    }

    // Only the five fixed internals belong inside tree Map. Move the nearest
    // content root (including a whole Frame subtree) out without losing content.
    if (source.layout?.mountMode === "tree") {
      for (const child of mapContentRoots(nodes, mapNode.id)) placeSiblingOverlay(child)
    }

    // Detached/valid external views stay untouched; non-tree retains inline compatibility.
    for (const type of ["layers", "legend"] as const) {
      const existing = nodes.find(node => node.type === type)
      if (!existing && source.layout?.deletedNodeTypes?.includes(type)) continue
      const node = existing ?? ensureNode(nodes, `${mapNode.id}-${type}`, type, type === "legend" ? "Legend" : "Layers", {})
      if (!existing) {
        if (source.layout?.mountMode === "tree") placeSiblingOverlay(node)
        else addChildUnique(mapNode, node.id)
      }
    }
  }

  // Mobile toolbar is explicit only in the tree layout. NewMapDefaults persists
  // it in a mobile-only MobileFooter. This fallback retains Footer placement
  // for older maps without a toolbar node; it does not retrofit their layout.
  if (source.layout?.mountMode === "tree" && !source.layout.deletedNodeTypes?.includes("mobileToolbar") && !nodes.some((node) => node.type === "mobileToolbar")) {
    const footerSlot = nodes.find(
      (node) => node.type === "slot" && slug(node.id) === "footer",
    ) || mainSlot
    const used = new Set(nodes.map((node) => node.id))
    const toolbarId = used.has("mobile-toolbar") ? uniqueId("mobile-toolbar", used) : "mobile-toolbar"
    const toolbarNode = ensureNode(nodes, toolbarId, "mobileToolbar", "Mobile Toolbar", {
      on: hadNodesRegistry && Boolean(source.menu?.on && source.menu?.hideOnMobile),
      placement: { parentId: footerSlot.id },
    })
    addChildUnique(footerSlot, toolbarNode.id)
  }

  // Legacy location attaches only on first migration (empty nodes registry).
  // Once nodes exist, parent.children is source of truth — do not re-attach.
  if (!hadNodesRegistry) {
    const details = source.detailsView
    if (details && typeof details === "object") {
      const detailsNode = ensureNode(nodes, "details-modal", "modal", "Details", {
        ...(details as Record<string, unknown>),
        template: source.actions?.marker?.click?.detailsViewTemplate || "default",
      })
      const targetSlot = nodes.find(
        (node) => node.type === "slot" && slug(node.id) === slug(String(details.location || "")),
      )
      if (details.location === "fullscreen" || details.location === "custom") {
        addChildUnique(bodyNode, detailsNode.id)
      } else {
        addChildUnique(targetSlot || mainSlot, detailsNode.id)
      }
    }

    if (mapNode && source.popovers && typeof source.popovers === "object") {
      const node = ensureNode(nodes, "map-popover", "popover", "Popover", source.popovers)
      addChildUnique(mapNode, node.id)
    }
    if (mapNode && source.tooltips && typeof source.tooltips === "object") {
      const node = ensureNode(nodes, "map-tooltip", "tooltip", "Tooltip", source.tooltips)
      addChildUnique(mapNode, node.id)
    }
    if (source.menu && typeof source.menu === "object" && source.menu.on) {
      const menuNode = ensureNode(nodes, "directory", "directory", "Directory", source.menu)
      const slotTarget = String(source.menu.location || "leftSidebar")
      const targetSlot = nodes.find(
        (node) => node.type === "slot" && slug(node.id) === slug(slotTarget),
      )
      addChildUnique(targetSlot || mainSlot, menuNode.id)
    }
    if (source.filters && typeof source.filters === "object" && source.filters.on) {
      const filtersNode = ensureNode(nodes, "filters", "filters", "Filters", source.filters)
      const slotTarget = String(source.filters.location || "header")
      const targetSlot = nodes.find(
        (node) => node.type === "slot" && slug(node.id) === slug(slotTarget),
      )
      addChildUnique(targetSlot || mainSlot, filtersNode.id)
    }
  } else if (source.layout?.mountMode !== "tree") {
    // Bootstrap race: first normalize (no layout) parked filters/directory on Main.
    // Finish seed once layout slots exist — still skips Saved (no parent).
    finishInterruptedLocationSeed(nodes, source)
  }

  const validIds = new Set(nodes.map((node) => node.id))
  nodes.forEach((node) => filterExistingChildren(node, validIds))

  const scenes = createSceneList(mainSlot.id, bodyNode.id, source.scenes)
    .map((scene) => {
      // Point scenes at canonical Main if they still reference a merged orphan id.
      if (slug(scene.rootNodeId) === "main") scene.rootNodeId = mainSlot.id
      return scene
    })
    .filter((scene) => validIds.has(scene.rootNodeId) && validIds.has(scene.bodyNodeId))

  const normalized = {
    nodes: new ArrayIndexed<MapSvgNode>("id", nodes, { unique: true }),
    scenes: new ArrayIndexed<SceneNode>("id", scenes, { unique: true }),
  }

  return normalized
}

export function getReachableNodeIds(
  nodes: Array<MapSvgNode>,
  scenes: Array<SceneNode>,
): Set<string> {
  const nodeById = buildIndex(nodes)
  const queue: string[] = []
  scenes.forEach((scene) => {
    if (scene.rootNodeId) queue.push(scene.rootNodeId)
    if (scene.bodyNodeId) queue.push(scene.bodyNodeId)
  })
  // Page slots are siblings of Main in the Layers UI — keep them reachable for directory/filters.
  nodes.forEach((node) => {
    if (node.type === "slot") queue.push(node.id)
  })
  const reachable = new Set<string>()

  while (queue.length > 0) {
    const id = queue.shift()
    if (!id || reachable.has(id)) continue
    const node = nodeById.get(id)
    if (!node) continue
    reachable.add(id)
    toArray<string>(node.children).forEach((childId) => {
      if (!reachable.has(childId)) queue.push(childId)
    })
  }

  return reachable
}

export function buildFrontendNodePayload(
  options: MapOptionsLike & Record<string, any>,
): NodeRegistryOptions {
  const normalized = normalizeNodesOptions(options)
  const reachable = getReachableNodeIds(normalized.nodes, normalized.scenes)
  const nodes = normalized.nodes.filter((node) => reachable.has(node.id))
  nodes.forEach((node) => {
    node.children = toArray<string>(node.children).filter((id) => reachable.has(id))
  })
  return {
    nodes: new ArrayIndexed<MapSvgNode>("id", nodes, { unique: true }),
    scenes: normalized.scenes,
  }
}
