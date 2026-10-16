/** Create UI text without interpreting a stored label as HTML. */
export function textElement(tag: string, className: string, text: unknown = ""): HTMLElement {
  const element = document.createElement(tag)
  element.className = className
  element.textContent = text == null ? "" : String(text)
  return element
}
