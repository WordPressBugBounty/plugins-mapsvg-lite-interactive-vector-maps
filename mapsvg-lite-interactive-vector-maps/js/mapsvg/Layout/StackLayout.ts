import { applyContainerLayout, containerLayout, type ContainerLayout, type LayoutBreakpoint, type ResponsiveContainer } from "./ResponsiveLayout"
import type { LayoutGridWidget } from "./LayoutGridRuntime"

export type FilterLayoutContext = { nodes: ResponsiveContainer[]; widgets: LayoutGridWidget[] }

/** Inline Map chrome opts into normal component hosts only after a geometry edit. */
export function hasComponentGeometry(node: ResponsiveContainer, breakpoint: LayoutBreakpoint): boolean {
  const value = containerLayout(node, breakpoint)
  return !!(value.position || value.anchor || value.width || value.height || value.widthPercent !== undefined || value.heightPercent !== undefined)
}

/** Computed independently for each grid; never persisted into a component profile. */
export function automaticFilterLayoutPadding(node: ResponsiveContainer | undefined, breakpoint: LayoutBreakpoint, context: FilterLayoutContext): number {
  if (!node) return 0
  const byId = new Map(context.nodes.map(item => [item.id, item]))
  const parents = new Map<string, string>()
  for (const item of context.nodes) for (const child of item.children ?? []) parents.set(child, item.id)
  const visible = (item: ResponsiveContainer | undefined) => item && item.settings?.on !== false && !containerLayout(item, breakpoint).hidden
  let current: ResponsiveContainer | undefined = node
  const visited = new Set<string>()
  while (current && !visited.has(current.id)) {
    if (!visible(current)) return 0
    visited.add(current.id)
    if (current.type === "slot") break
    current = byId.get(parents.get(current.id) ?? "")
  }
  if (current?.type !== "slot") return 0
  const widget = context.widgets.find(item => item.id === current!.id)
  if (!widget) return 0
  const hasNeighbour = context.widgets.some(other => other.id !== widget.id && byId.get(other.id)?.type === "slot" && visible(byId.get(other.id)) &&
    other.y < widget.y + widget.h && other.y + other.h > widget.y &&
    (other.x + other.w <= widget.x || other.x >= widget.x + widget.w))
  return hasNeighbour ? 10 : 0
}

/** Authored global CSS remains the fallback for maps created before profile padding. */
export function defaultFilterLayoutPadding(node: ResponsiveContainer | undefined, breakpoint: LayoutBreakpoint, legacyPadding: unknown, context: FilterLayoutContext): string {
  if (!isZeroCssPadding(legacyPadding)) return typeof legacyPadding === "number" ? `${legacyPadding}px` : typeof legacyPadding === "string" ? legacyPadding : ""
  return `${automaticFilterLayoutPadding(node, breakpoint, context)}px`
}

/** Explicit profile values, including 0, always win over the automatic default. */
export function filterLayoutPadding(node: ResponsiveContainer | undefined, breakpoint: LayoutBreakpoint, legacyPadding: unknown, context: FilterLayoutContext): string {
  const padding = containerLayout(node, breakpoint).padding
  return padding !== undefined ? `${padding}px` : defaultFilterLayoutPadding(node, breakpoint, legacyPadding, context)
}

export function isZeroCssPadding(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return true
  if (typeof value === "number") return value === 0
  if (typeof value !== "string") return false
  const parts = value.trim().split(/\s+/)
  return value.trim() === "" || (parts.length <= 4 && parts.every(part => /^[+-]?(?:0+(?:\.0*)?|\.0+)(?:[a-z]+|%)?$/i.test(part)))
}

/** Shared authoring/runtime defaults for the vertical children of a slot or Frame. */
export function stackComponentLayout(node: ResponsiveContainer, breakpoint: LayoutBreakpoint, nodes: ResponsiveContainer[]): ContainerLayout {
  const settings = containerLayout(node, breakpoint)
  const parent = nodes.find(item => item.children?.includes(node.id))
  const inlinePresentation = parent?.type === "map" && ["legend", "layers"].includes(node.type || "")
  const visibleSiblings = (parent?.children ?? []).filter(id => {
    const sibling = nodes.find(item => item.id === id)
    return sibling && sibling.settings?.on !== false && !containerLayout(sibling, breakpoint).hidden
  })
  return {
    ...settings,
    width: settings.width ?? { mode: inlinePresentation ? "auto" : "fill" },
    height: settings.height ?? { mode: node.type === "directory" ? "fill" : "auto" },
    ...(inlinePresentation && hasComponentGeometry(node, breakpoint) && !settings.anchor
      ? { anchor: node.type === "legend" ? "bottom-left" as const : "top-left" as const } : {}),
    position: settings.position ?? (parent?.type === "map" ||
      (node.type === "modal" && !(parent?.type === "slot" && visibleSiblings.length === 1)) ? "absolute" : "relative"),
  }
}

/** A bounded stack gives Fill children the remainder; Auto stacks keep intrinsic content. */
export function applyStackContentLayout(element: HTMLElement, settings: ContainerLayout, bounded: boolean): void {
  applyContainerLayout(element, { padding: settings.padding, paddingBottom: settings.paddingBottom, gap: settings.gap, align: settings.align }, "content")
  element.dataset.mapsvgStackBounded = String(bounded)
  element.style.flex = bounded ? "1 1 0px" : "0 0 auto"
  element.style.height = bounded ? "100%" : "auto"
}

/** Closed retained controllers release hit testing, scrolling and their flex allocation. */
export function setStackComponentOpen(element: HTMLElement, opened: boolean): void {
  element.dataset.mapsvgComponentOpen = String(opened)
  element.style.display = opened ? "flex" : "none"
}

/** Returns whether this child provides a height constraint for its own children. */
export function applyStackChildLayout(element: HTMLElement, settings: ContainerLayout, parentBounded: boolean): boolean {
  applyContainerLayout(element, settings, "frame")
  const absolute = settings.position === "absolute"
  const anchored = absolute && !!settings.anchor
  // Absolute Fill resolves against its containing block even in an Auto stack.
  // Its 100% height below must expose the same bounded contract to child views.
  const fill = settings.height?.mode === "fill" && settings.heightPercent === undefined && (parentBounded || absolute)
  const bounded = settings.height?.mode === "fixed" || settings.heightPercent !== undefined || settings.maxHeight !== undefined || settings.maxHeightPercent !== undefined || fill || (absolute && !anchored && parentBounded)
  element.dataset.mapsvgPosition = absolute ? "absolute" : "relative"
  element.dataset.mapsvgStackBounded = String(bounded)
  element.style.position = absolute ? "absolute" : "relative"
  element.style.top = element.style.right = element.style.bottom = element.style.left = ""
  element.style.inset = absolute && !anchored ? "0px" : ""
  element.style.transform = ""
  if (anchored) {
    const anchor = settings.anchor!
    const x = anchor.includes("left") ? "left" : anchor.includes("right") ? "right" : "center"
    const y = anchor.includes("top") ? "top" : anchor.includes("bottom") ? "bottom" : "center"
    if (x === "right") element.style.right = "0px"
    else element.style.left = x === "left" ? "0px" : "50%"
    if (y === "bottom") element.style.bottom = "0px"
    else element.style.top = y === "top" ? "0px" : "50%"
    if (x === "center" || y === "center") element.style.transform = `translate(${x === "center" ? "-50%" : "0px"}, ${y === "center" ? "-50%" : "0px"})`
  }
  element.style.flex = fill ? "1 1 0px" : "0 0 auto"
  if (settings.height?.mode !== "fixed" && settings.heightPercent === undefined) element.style.height = absolute && (!anchored || settings.height?.mode === "fill") ? "100%" : fill ? "0px" : "auto"
  if (settings.width?.mode === "auto" && settings.maxWidth === undefined && settings.maxWidthPercent === undefined) element.style.maxWidth = "100%"
  element.style.overflow = bounded ? "auto" : "visible"
  // An empty Details overlay must not intercept the Map before a record is opened.
  element.style.pointerEvents = absolute ? "none" : "auto"
  if (element.dataset.mapsvgComponentOpen === "false") element.style.display = "none"
  return bounded
}
