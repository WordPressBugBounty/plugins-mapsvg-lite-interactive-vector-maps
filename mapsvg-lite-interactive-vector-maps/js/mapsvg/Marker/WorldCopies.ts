/** Render-only siblings of one semantic Marker/Cluster. Never added to entity collections. */
export class WorldCopies {
  private copies = new Map<number, HTMLElement>()
  private observer?: MutationObserver
  private x = 0
  private y = 0
  private worldWidth = 0

  constructor(private original: HTMLElement, private associate?: (copy: HTMLElement) => void) {}

  forEach(callback: (element: HTMLElement) => void): void {
    callback(this.original)
    for (const copy of this.copies.values()) callback(copy)
  }

  update(x: number, y: number, worldWidth: number | undefined, viewportWidth: number, viewportHeight: number, width: number, height: number): void {
    this.x = x
    this.y = y
    this.worldWidth = worldWidth ?? 0
    const wanted = new Set<number>()
    if (this.original.parentElement && worldWidth > 0 && Number.isFinite(worldWidth) &&
        y < viewportHeight && y + height > 0) {
      const first = Math.floor((-width - x) / worldWidth) + 1
      const last = Math.ceil((viewportWidth - x) / worldWidth) - 1
      for (let k = first; k <= last; k++) if (k !== 0) wanted.add(k)
    }
    for (const [k, copy] of this.copies) {
      if (!wanted.has(k)) { copy.remove(); this.copies.delete(k) }
    }
    for (const k of wanted) {
      let copy = this.copies.get(k)
      if (!copy) {
        copy = this.original.cloneNode(true) as HTMLElement
        this.copies.set(k, copy)
        this.associate?.(copy)
        this.syncCopy(copy, k, true)
      }
      this.position(copy, k)
      if (copy.parentElement !== this.original.parentElement) this.original.parentElement.append(copy)
    }
    if (this.copies.size && !this.observer) {
      // Only observe entities which actually have additional visible representations.
      const Observer = this.original.ownerDocument.defaultView.MutationObserver
      this.observer = new Observer((mutations) => {
        const children = mutations.some(m => m.target !== this.original || m.type !== "attributes")
        for (const [k, copy] of this.copies) this.syncCopy(copy, k, children)
      })
      this.observer.observe(this.original, { attributes: true, childList: true, characterData: true, subtree: true })
    } else if (!this.copies.size) {
      this.observer?.disconnect()
      this.observer = undefined
    }
  }

  private syncCopy(copy: HTMLElement, k: number, children: boolean): void {
    for (const attr of Array.from(copy.attributes)) copy.removeAttribute(attr.name)
    for (const attr of Array.from(this.original.attributes)) {
      if (attr.name !== "id") copy.setAttribute(attr.name, attr.value)
    }
    copy.dataset.mapsvgCopyOf = this.original.id
    if (children) {
      copy.replaceChildren(...Array.from(this.original.childNodes, child => child.cloneNode(true)))
      // Labels/bubbles can have IDs. A representation must not duplicate document identities.
      copy.querySelectorAll("[id]").forEach(child => child.removeAttribute("id"))
    }
    this.position(copy, k)
  }

  private position(copy: HTMLElement, k: number): void {
    copy.dataset.mapsvgWorldOffset = String(k * this.worldWidth)
    copy.style.transform = `translate(${this.x + k * this.worldWidth}px,${this.y}px)`
  }

  destroy(): void {
    this.observer?.disconnect()
    this.observer = undefined
    for (const copy of this.copies.values()) copy.remove()
    this.copies.clear()
  }
}
