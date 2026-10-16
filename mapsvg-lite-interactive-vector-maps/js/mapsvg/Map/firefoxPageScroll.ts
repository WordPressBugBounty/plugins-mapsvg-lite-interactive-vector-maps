/**
 * Firefox uses the hovered SVG / overflow:hidden map as the keyboard-scroll
 * target, so Arrow and Page keys do not move the page while the pointer is
 * over a region. These helpers decide when MapSVG should restore that default
 * page-scroll action — and only then.
 *
 * @see https://bugzilla.mozilla.org/show_bug.cgi?id=552412
 */

const PAGE_SCROLL_KEY_NAMES = new Set([
  "PageUp",
  "PageDown",
  "End",
  "Home",
  "ArrowLeft",
  "ArrowUp",
  "ArrowRight",
  "ArrowDown",
])

const ARROW_SCROLL_PX = 40

export function isFirefoxPageScrollKey(event: {
  key?: string
  keyCode?: number
  which?: number
}): boolean {
  if (event.key && PAGE_SCROLL_KEY_NAMES.has(event.key)) {
    return true
  }
  const code = event.keyCode ?? event.which
  return typeof code === "number" && code >= 33 && code <= 40
}

export function isEditableKeyboardTarget(target: EventTarget | null | undefined): boolean {
  if (!target || typeof (target as Node).nodeName !== "string") {
    return false
  }
  const el = target as Node & { isContentEditable?: boolean }
  const tag = el.nodeName.toUpperCase()
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || tag === "OPTION") {
    return true
  }
  return !!el.isContentEditable
}

/** Wheel resets expire even when the pointer never leaves the map. */
export type FirefoxWheelScrollState = {
  insideIframe: boolean
  lockPageScroll?: boolean
  lockUntil?: number
  scrollX: number
  scrollY: number
}

export function lockFirefoxDocumentScroll(
  state: FirefoxWheelScrollState,
  win: { scrollX: number; scrollY: number },
  now = Date.now(),
): void {
  state.lockPageScroll = true
  state.lockUntil = now + 200
  state.scrollX = win.scrollX
  state.scrollY = win.scrollY
}

export function shouldResetFirefoxDocumentScroll(
  state?: Pick<FirefoxWheelScrollState, "insideIframe" | "lockPageScroll" | "lockUntil">,
  now = Date.now(),
): boolean {
  if (!state?.insideIframe || !state.lockPageScroll) return false
  if (state.lockUntil === undefined || now >= state.lockUntil) {
    state.lockPageScroll = false
    return false
  }
  return true
}

export function shouldForwardFirefoxPageScroll(options: {
  isFirefox: boolean
  pointerOverMap: boolean
  mapConsumesKey: boolean
  targetIsEditable: boolean
  hasModifier: boolean
}): boolean {
  return (
    options.isFirefox &&
    options.pointerOverMap &&
    !options.mapConsumesKey &&
    !options.targetIsEditable &&
    !options.hasModifier
  )
}

export function getFirefoxPageScrollDelta(
  event: { key?: string; keyCode?: number; which?: number },
  viewport: { innerWidth: number; innerHeight: number },
): { x: number; y: number } | null {
  if (!isFirefoxPageScrollKey(event)) {
    return null
  }

  const key = event.key
  const code = event.keyCode ?? event.which
  const pageY = Math.max(viewport.innerHeight - ARROW_SCROLL_PX, ARROW_SCROLL_PX)

  if (key === "ArrowUp" || code === 38) {
    return { x: 0, y: -ARROW_SCROLL_PX }
  }
  if (key === "ArrowDown" || code === 40) {
    return { x: 0, y: ARROW_SCROLL_PX }
  }
  if (key === "ArrowLeft" || code === 37) {
    return { x: -ARROW_SCROLL_PX, y: 0 }
  }
  if (key === "ArrowRight" || code === 39) {
    return { x: ARROW_SCROLL_PX, y: 0 }
  }
  if (key === "PageUp" || code === 33) {
    return { x: 0, y: -pageY }
  }
  if (key === "PageDown" || code === 34) {
    return { x: 0, y: pageY }
  }
  if (key === "Home" || code === 36) {
    return { x: 0, y: Number.NEGATIVE_INFINITY }
  }
  if (key === "End" || code === 35) {
    return { x: 0, y: Number.POSITIVE_INFINITY }
  }

  return null
}

export type FirefoxPageScrollWindow = {
  scrollBy: (x: number, y: number) => void
  scrollTo: (x: number, y: number) => void
  scrollX: number
  scrollY: number
  innerWidth: number
  innerHeight: number
  document: { documentElement: { scrollHeight: number; scrollWidth: number } }
}

export function applyFirefoxPageScroll(
  win: Pick<FirefoxPageScrollWindow, "scrollBy" | "scrollTo" | "scrollX" | "scrollY" | "document">,
  delta: { x: number; y: number },
): void {
  const x = Number.isFinite(delta.x)
    ? win.scrollX + delta.x
    : delta.x < 0
      ? 0
      : win.document.documentElement.scrollWidth
  const y = Number.isFinite(delta.y)
    ? win.scrollY + delta.y
    : delta.y < 0
      ? 0
      : win.document.documentElement.scrollHeight

  if (!Number.isFinite(delta.x) || !Number.isFinite(delta.y)) {
    win.scrollTo(x, y)
    return
  }

  win.scrollBy(delta.x, delta.y)
}

export type FirefoxPageScrollKeyEvent = {
  key?: string
  keyCode?: number
  which?: number
  ctrlKey?: boolean
  metaKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
  target?: EventTarget | null
  defaultPrevented?: boolean
}

/**
 * Forward a Firefox page-scroll key to the window. Returns true when the
 * default action was replaced with a document scroll.
 */
export function forwardFirefoxPageScrollKey(
  event: FirefoxPageScrollKeyEvent,
  options: {
    isFirefox: boolean
    pointerOverMap: boolean
    mapConsumesKey: boolean
    firefoxScroll?: { insideIframe: boolean; lockPageScroll?: boolean }
    win: FirefoxPageScrollWindow
  },
): boolean {
  if (event.defaultPrevented || !isFirefoxPageScrollKey(event)) {
    return false
  }

  if (
    !shouldForwardFirefoxPageScroll({
      isFirefox: options.isFirefox,
      pointerOverMap: options.pointerOverMap,
      mapConsumesKey: options.mapConsumesKey,
      targetIsEditable: isEditableKeyboardTarget(event.target),
      hasModifier: !!(event.ctrlKey || event.metaKey || event.altKey || event.shiftKey),
    })
  ) {
    return false
  }

  const delta = getFirefoxPageScrollDelta(event, options.win)
  if (!delta) {
    return false
  }

  if (options.firefoxScroll) {
    options.firefoxScroll.lockPageScroll = false
  }

  applyFirefoxPageScroll(options.win, delta)
  return true
}
