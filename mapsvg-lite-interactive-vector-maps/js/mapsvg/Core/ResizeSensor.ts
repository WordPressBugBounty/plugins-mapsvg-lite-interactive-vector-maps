/**
 * Resize sensor.
 * Prefers native ResizeObserver so a container that was display:none / 0×0
 * (tabs, accordions, page-builder panels) still triggers a callback when it
 * becomes visible and gains size. The expand/shrink scroll trick does not
 * fire on that transition.
 * @private
 * @param element
 * @param callback
 * @constructor
 */

export class ResizeSensor {
  element: HTMLElement
  callback: () => void
  expand?: HTMLElement
  shrink?: HTMLElement
  currentWidth: number
  currentHeight: number
  observer?: ResizeObserver

  constructor(element: HTMLElement, callback: () => void) {
    this.element = element
    this.callback = callback

    const size = element.getBoundingClientRect()
    this.currentWidth = size.width
    this.currentHeight = size.height

    if (typeof ResizeObserver !== "undefined") {
      this.observer = new ResizeObserver(this.handleObserverNotification)
      this.observer.observe(element)
      return
    }

    this.initScrollSensor()
  }

  handleObserverNotification = (): void => {
    this.notifyIfSizeChanged()
  }

  initScrollSensor(): void {
    const style = getComputedStyle(this.element)
    let zIndex = parseInt(style.zIndex)
    if (isNaN(zIndex)) {
      zIndex = 0
    }
    zIndex--

    this.expand = document.createElement("div")
    this.expand.style.position = "absolute"
    this.expand.style.left = "0px"
    this.expand.style.top = "0px"
    this.expand.style.right = "0px"
    this.expand.style.bottom = "0px"
    this.expand.style.overflow = "hidden"
    this.expand.style.zIndex = zIndex.toString()
    this.expand.style.visibility = "hidden"

    const expandChild = document.createElement("div")
    expandChild.style.position = "absolute"
    expandChild.style.left = "0px"
    expandChild.style.top = "0px"
    expandChild.style.width = "10000000px"
    expandChild.style.height = "10000000px"
    this.expand.appendChild(expandChild)

    this.shrink = document.createElement("div")
    this.shrink.style.position = "absolute"
    this.shrink.style.left = "0px"
    this.shrink.style.top = "0px"
    this.shrink.style.right = "0px"
    this.shrink.style.bottom = "0px"
    this.shrink.style.overflow = "hidden"
    this.shrink.style.zIndex = zIndex.toString()
    this.shrink.style.visibility = "hidden"

    const shrinkChild = document.createElement("div")
    shrinkChild.style.position = "absolute"
    shrinkChild.style.left = "0px"
    shrinkChild.style.top = "0px"
    shrinkChild.style.width = "200%"
    shrinkChild.style.height = "200%"
    this.shrink.appendChild(shrinkChild)

    this.element.appendChild(this.expand)
    this.element.appendChild(this.shrink)

    this.setScroll()

    this.expand.addEventListener("scroll", this.onScroll)
    this.shrink.addEventListener("scroll", this.onScroll)
  }

  notifyIfSizeChanged(): void {
    const size = this.element.getBoundingClientRect()
    const newWidth = size.width
    const newHeight = size.height

    if (newWidth !== this.currentWidth || newHeight !== this.currentHeight) {
      this.currentWidth = newWidth
      this.currentHeight = newHeight
      this.callback()
    }
  }

  onScroll = (): void => {
    this.notifyIfSizeChanged()
    this.setScroll()
  }

  setScroll(): void {
    if (!this.expand || !this.shrink) {
      return
    }
    this.expand.scrollLeft = 10000000
    this.expand.scrollTop = 10000000
    this.shrink.scrollLeft = 10000000
    this.shrink.scrollTop = 10000000
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect()
      delete this.observer
    }
    this.expand?.remove()
    this.shrink?.remove()
  }
}
