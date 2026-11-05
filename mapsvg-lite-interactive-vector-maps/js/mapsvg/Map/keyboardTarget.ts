type KeyboardTargetEvent = {
  target?: EventTarget | null
  originalEvent?: Event
  composedPath?: () => EventTarget[]
}

const keyboardControlRoles = new Set([
  "button",
  "checkbox",
  "combobox",
  "listbox",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "scrollbar",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
  "treeitem",
])

function elementFromTarget(target?: EventTarget | null): Element | null {
  const node = target as Node | null | undefined
  if (node?.nodeType === 1) return node as Element
  return node?.parentElement ?? null
}

function isKeyboardControl(target?: EventTarget | null): boolean {
  let element = elementFromTarget(target)
  while (element) {
    if (element.matches("input, textarea, select, button, summary, a[href]")) return true
    if (keyboardControlRoles.has(element.getAttribute("role") ?? "")) return true
    const editable = element.getAttribute("contenteditable")?.toLowerCase()
    if (editable === "" || editable === "true" || editable === "plaintext-only") return true
    // A noneditable island should not inherit an editable ancestor.
    if (editable === "false") return false
    element = element.parentElement
  }
  return false
}

/** Document keyboard events retarget to a shadow host; inspect the actual control first. */
export function isKeyboardControlTarget(event: KeyboardTargetEvent, doc: Document): boolean {
  const original = event.originalEvent ?? event
  const path = original.composedPath?.()
  if (path && isKeyboardControl(path[0])) return true
  if (isKeyboardControl(event.target) || isKeyboardControl(original.target)) return true

  // Also support synthetic/older events without a composed path, including nested shadows.
  let active = doc.activeElement
  while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
  return isKeyboardControl(active)
}
