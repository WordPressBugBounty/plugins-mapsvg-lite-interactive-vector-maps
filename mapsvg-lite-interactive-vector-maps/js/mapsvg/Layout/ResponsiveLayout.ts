/** Container presentation belongs to a breakpoint; identity and children remain shared. */
export type LayoutBreakpoint = "desktop" | "tablet" | "mobile"
export type ContainerSize = { mode: "auto" | "fill" | "fixed"; value?: number }
export const ABSOLUTE_ANCHORS = ["top-left", "top", "top-right", "left", "center", "right", "bottom-left", "bottom", "bottom-right"] as const
export type AbsoluteAnchor = typeof ABSOLUTE_ANCHORS[number]
export type ContainerLayout = {
  hidden?: boolean
  position?: "relative" | "absolute"
  anchor?: AbsoluteAnchor
  width?: ContainerSize
  height?: ContainerSize
  /** Legacy overlay dimensions relative to the containing Map slot. */
  widthPercent?: number
  heightPercent?: number
  minWidth?: number
  maxWidth?: number
  minWidthPercent?: number
  maxWidthPercent?: number
  minHeight?: number
  maxHeight?: number
  /** Retained percentage cap from legacy Map overlays; pixel maxHeight takes precedence. */
  maxHeightPercent?: number
  padding?: number
  paddingBottom?: number
  gap?: number
  align?: "start" | "center" | "end" | "stretch"
}
export type ResponsiveContainer = { id: string; type?: string; settings?: Record<string, unknown>; children?: string[] }

export function viewportLayoutBreakpoint(width: number): LayoutBreakpoint {
  return width < 768 ? "mobile" : width <= 1024 ? "tablet" : "desktop"
}

export function containerLayout(node: ResponsiveContainer | undefined, breakpoint: LayoutBreakpoint): ContainerLayout {
  const layouts = node?.settings?.responsiveLayout as Partial<Record<LayoutBreakpoint, ContainerLayout>> | undefined
  const profile = layouts?.[breakpoint]
  const raw = profile && typeof profile === "object" ? profile : {}
  const result: ContainerLayout = {}
  if (typeof raw.hidden === "boolean") result.hidden = raw.hidden
  if (raw.position === "relative" || raw.position === "absolute") result.position = raw.position
  if (ABSOLUTE_ANCHORS.includes(raw.anchor as AbsoluteAnchor)) result.anchor = raw.anchor
  for (const axis of ["width", "height"] as const) {
    const size = raw[axis]
    if (size && ["auto", "fill", "fixed"].includes(size.mode)) {
      result[axis] = { mode: size.mode, ...(Number.isFinite(size.value) && Number(size.value) >= 0 ? { value: Number(size.value) } : {}) }
    }
  }
  for (const key of ["minWidth", "maxWidth", "minHeight", "maxHeight", "padding", "paddingBottom", "gap"] as const) {
    if (typeof raw[key] === "number" && Number.isFinite(raw[key]) && raw[key]! >= 0) result[key] = raw[key]
  }
  for (const key of ["widthPercent", "heightPercent", "minWidthPercent", "maxWidthPercent", "maxHeightPercent"] as const) {
    if (typeof raw[key] === "number" && Number.isFinite(raw[key]) && raw[key] >= 0 && raw[key] <= 100) result[key] = raw[key]
  }
  if (raw.align && ["start", "center", "end", "stretch"].includes(raw.align)) result.align = raw.align
  // Resolve defaults at read time so existing tree drafts receive the same spacing.
  if (node?.type === "slot" && node.id === "Header" && result.padding === undefined && result.paddingBottom === undefined) result.paddingBottom = 15
  return result
}

/** Explicit native sizing replaces a retained legacy percentage on that axis. */
export function mergeContainerLayout(current: ContainerLayout, change: ContainerLayout): ContainerLayout {
  const next = { ...current, ...change }
  for (const axis of ["width", "height"] as const) {
    const percent = axis === "width" ? "widthPercent" : "heightPercent"
    if (Object.prototype.hasOwnProperty.call(change, axis) && !Object.prototype.hasOwnProperty.call(change, percent)) delete next[percent]
  }
  if (Object.prototype.hasOwnProperty.call(change, "width")) {
    if (!Object.prototype.hasOwnProperty.call(change, "minWidthPercent")) delete next.minWidthPercent
    if (!Object.prototype.hasOwnProperty.call(change, "maxWidthPercent")) delete next.maxWidthPercent
  }
  for (const key of ["minWidth", "maxWidth"] as const) {
    const percent = key === "minWidth" ? "minWidthPercent" : "maxWidthPercent"
    if (Object.prototype.hasOwnProperty.call(change, key) && !Object.prototype.hasOwnProperty.call(change, percent)) delete next[percent]
  }
  if ((Object.prototype.hasOwnProperty.call(change, "height") || Object.prototype.hasOwnProperty.call(change, "maxHeight")) && !Object.prototype.hasOwnProperty.call(change, "maxHeightPercent")) delete next.maxHeightPercent
  return next
}

/** Apply a complete presentation, clearing properties left by the previous breakpoint. */
export function applyContainerLayout(element: HTMLElement, settings: ContainerLayout, kind: "cell" | "content" | "frame"): void {
  const style = element.style
  style.minWidth = settings.minWidth !== undefined ? `${settings.minWidth}px` : settings.minWidthPercent !== undefined ? `${settings.minWidthPercent}%` : "0px"
  style.minHeight = `${settings.minHeight ?? 0}px`
  style.maxWidth = settings.maxWidth !== undefined ? `${settings.maxWidth}px` : settings.maxWidthPercent !== undefined ? `${settings.maxWidthPercent}%` : ""
  style.maxHeight = settings.maxHeight !== undefined ? `${settings.maxHeight}px`
    : settings.maxHeightPercent !== undefined ? `${settings.maxHeightPercent}%` : ""
  for (const axis of ["width", "height"] as const) {
    const size = settings[axis]
    const percent = settings[axis === "width" ? "widthPercent" : "heightPercent"]
    style[axis] = size?.mode === "fixed" ? `${size.value ?? 0}px`
      : percent !== undefined ? `${percent}%`
      : size?.mode === "auto" ? (axis === "width" ? "fit-content" : "auto")
      : axis === "width" ? "100%" : size?.mode === "fill" ? "100%" : ""
  }
  style.boxSizing = "border-box"
  if (kind !== "cell") {
    style.display = "flex"
    style.flexDirection = "column"
    style.padding = `${settings.padding ?? 0}px`
    if (settings.paddingBottom !== undefined) style.paddingBottom = `${settings.paddingBottom}px`
    style.gap = `${settings.gap ?? 0}px`
    style.alignItems = settings.align === "start" ? "flex-start" : settings.align === "end" ? "flex-end" : settings.align ?? "stretch"
    style.flex = settings.height?.mode === "fill" ? "1 1 0px" : "0 1 auto"
  }
}
