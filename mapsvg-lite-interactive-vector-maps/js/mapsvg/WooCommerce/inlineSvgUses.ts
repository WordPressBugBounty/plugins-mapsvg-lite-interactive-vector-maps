/**
 * Shadow DOM cannot resolve light-DOM sprite IDs via `<use href="#id">`.
 * Clone the referenced `<symbol>` / `<svg>` / `<g>` contents into each parent SVG
 * and remove the `<use>` (theme add-to-cart icons inside `.mapsvg-product-cart`).
 */
export function inlineSvgUses(
  container: ParentNode | null | undefined,
  doc: Document = document,
): void {
  if (!container) {
    return
  }

  const uses = container.querySelectorAll<SVGUseElement>(
    ".mapsvg-product-cart use, form.cart use",
  )
  uses.forEach((useEl) => {
    const href =
      useEl.getAttribute("href") ||
      useEl.getAttributeNS("http://www.w3.org/1999/xlink", "href") ||
      ""
    const hashIndex = href.lastIndexOf("#")
    if (hashIndex === -1) {
      return
    }
    const symbolId = href.slice(hashIndex + 1)
    if (!symbolId) {
      return
    }

    const source = doc.getElementById(symbolId)
    if (!source) {
      return
    }
    const tag = source.tagName.toLowerCase()
    if (tag !== "symbol" && tag !== "svg" && tag !== "g") {
      return
    }

    const parentSvg = useEl.closest("svg")
    if (!parentSvg) {
      return
    }

    if (source.hasAttribute("viewBox") && !parentSvg.hasAttribute("viewBox")) {
      parentSvg.setAttribute("viewBox", source.getAttribute("viewBox")!)
    }

    Array.from(source.childNodes).forEach((node) => {
      parentSvg.appendChild(node.cloneNode(true))
    })
    useEl.remove()
  })
}
