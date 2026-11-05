/** Persistent, SVG-owned region membership opt-out. */
export const SVG_REGION_EXCLUDE_ATTRIBUTE = "data-mapsvg-region-exclude"

export function canBeSvgRegion(element: Element): boolean {
  return (
    ["path", "polygon", "circle", "ellipse", "rect"].includes(element.localName) &&
    !element.closest("defs")
  )
}
export function isSvgRegionExcluded(element: Element): boolean {
  return /^(true|1)$/i.test((element.getAttribute(SVG_REGION_EXCLUDE_ATTRIBUTE) ?? "").trim())
}
/** The same SVG membership policy is used by the runtime and the authoring XML tree. */
export function isSvgRegionElement(element: Element, regionPrefix = ""): boolean {
  return (
    canBeSvgRegion(element) &&
    !isSvgRegionExcluded(element) &&
    !!element.getAttribute("id") &&
    (!regionPrefix || element.getAttribute("id")!.startsWith(regionPrefix))
  )
}
