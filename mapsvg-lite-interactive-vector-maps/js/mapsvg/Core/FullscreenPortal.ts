type OverflowProperty = "overflow" | "overflow-x" | "overflow-y"
type SavedOverflow = { element: HTMLElement; properties: Array<{ name: OverflowProperty; value: string; priority: string }> }
type Lock = { owners: Set<object>; saved: SavedOverflow[]; hadClass: boolean }
const locks = new WeakMap<Document, Lock>()

/** Portal CSS may live in a ShadowRoot; document scroll ownership cannot rely on it. */
export function acquireFullscreenDocument(doc: Document, owner: object): void {
  let lock = locks.get(doc)
  if (!lock) {
    lock = {
      owners: new Set(),
      hadClass: doc.body.classList.contains("mapsvg-modal-fullscreen"),
      saved: [doc.documentElement, doc.body].map(element => ({ element, properties:
        (["overflow", "overflow-x", "overflow-y"] as const).map(name => ({ name, value: element.style.getPropertyValue(name), priority: element.style.getPropertyPriority(name) })),
      })),
    }
    locks.set(doc, lock)
    for (const { element } of lock.saved) element.style.setProperty("overflow", "hidden", "important")
    doc.body.classList.add("mapsvg-modal-fullscreen")
  }
  lock.owners.add(owner)
}

export function releaseFullscreenDocument(doc: Document | undefined, owner: object): void {
  if (!doc) return
  const lock = locks.get(doc)
  if (!lock || !lock.owners.delete(owner) || lock.owners.size) return
  for (const { element, properties } of lock.saved) {
    // Do not overwrite a newer external scroll policy established while open.
    if (element.style.getPropertyValue("overflow") !== "hidden" || element.style.getPropertyPriority("overflow") !== "important") continue
    for (const { name } of properties) element.style.removeProperty(name)
    for (const { name, value, priority } of properties) if (value) element.style.setProperty(name, value, priority)
  }
  if (!lock.hadClass) doc.body.classList.remove("mapsvg-modal-fullscreen")
  locks.delete(doc)
}
