import type { MapSvgNode } from "./NodesRegistry"

export const PRESENTATION_MARGIN_SIDES = ["Left", "Right", "Top", "Bottom"] as const

/** Only these node style leaves can repaint without reconciling tree/controller mounts. */
export function canRepaintNodeStyles(previous: unknown, next: unknown): boolean {
  if (!Array.isArray(previous) || !Array.isArray(next) || previous.length !== next.length) return false
  if (JSON.stringify(previous) === JSON.stringify(next)) return false
  const structure = (node: MapSvgNode) => {
    const copy = { ...node }
    const allowed = ["legend", "layers"].includes(node.type)
      ? ["backgroundColor", ...PRESENTATION_MARGIN_SIDES.map(side => `margin${side}`)]
      : ["slot", "frame"].includes(node.type) ? ["backgroundColor"] : []
    if (allowed.length && node.styles && typeof node.styles === "object" && !Array.isArray(node.styles)) {
      const styles = { ...node.styles }
      for (const key of allowed) delete styles[key]
      if (Object.keys(styles).length) copy.styles = styles
      else delete copy.styles
    }
    return copy
  }
  return previous.every((node, index) => node && next[index] && typeof node.id === "string" &&
    typeof node.type === "string" && node.id === next[index].id && node.type === next[index].type &&
    JSON.stringify(structure(node)) === JSON.stringify(structure(next[index])))
}

/** The surface owns its color; the mounted box owns its outer spacing. */
export function applyMapPresentationStyles(element: HTMLElement, node: MapSvgNode, host?: HTMLElement): void {
  const background = node.styles?.backgroundColor
  element.style.backgroundColor = ""
  if (typeof background === "string") element.style.backgroundColor = background
  element.classList.toggle("mapsvg-presentation-background", typeof background === "string" && background !== "")
  for (const side of PRESENTATION_MARGIN_SIDES) {
    const key = `margin${side}` as "marginLeft" | "marginRight" | "marginTop" | "marginBottom"
    const value = node.styles?.[key]
    element.style[key] = ""
    if (host) host.style[key] = ""
    if (typeof value === "number" && Number.isFinite(value)) (host ?? element).style[key] = `${value}px`
  }
}

/** Consumer-side binding. An invalid explicit source never silently becomes Auto. */
export function mapPresentationSource(nodes: MapSvgNode[], consumer: MapSvgNode): MapSvgNode | undefined {
  const maps = nodes.filter(node => node.type === "map")
  const selected = consumer.settings?.mapNodeId
  return typeof selected === "string" && selected
    ? maps.find(node => node.id === selected)
    : maps.length === 1 ? maps[0] : undefined
}

/** Node overrides own presentation; legacy root options remain the fallback. */
export function layersPresentation(options: Record<string, any>, node?: MapSvgNode): Record<string, any> {
  const next = { ...options }
  for (const key of ["on", "label", "expanded", "position", "maxHeight"]) {
    if (node?.settings?.[key] !== undefined) next[key] = node.settings[key]
  }
  return next
}
