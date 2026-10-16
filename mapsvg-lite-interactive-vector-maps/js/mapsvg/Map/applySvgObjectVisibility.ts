const originalDisplay = new WeakMap<object, string>()

export type SvgVisibilityElement = {
  classList: { toggle: (token: string, force?: boolean) => unknown }
  style?: { display: string }
}

export type SvgVisibilityRoot = {
  querySelector: (selector: string) => SvgVisibilityElement | null
}

/**
 * Apply Visibility List / group visibility to one SVG DOM node.
 *
 * Inkscape often writes `style="display:inline;..."`. That inline display
 * beats `.mapsvg-hidden { display: none }` unless we also set the inline
 * display (CSS uses `!important` as a second line of defense).
 */
export function applySvgObjectVisibility(element: SvgVisibilityElement, visible: boolean): void {
  element.classList.toggle("mapsvg-hidden", !visible)
  if (element.style) {
    if (!visible) {
      if (!originalDisplay.has(element)) originalDisplay.set(element, element.style.display)
      element.style.display = "none"
    } else {
      const display = originalDisplay.get(element) ?? element.style.display
      element.style.display = display === "none" ? "" : display
      originalDisplay.delete(element)
    }
  }
}

/**
 * Hide or show every SVG object listed on Visibility List groups.
 */
export function applyGroupsVisibility(
  svgRoot: SvgVisibilityRoot | null | undefined,
  groups: Array<{ visible?: boolean; objects?: Array<{ value?: string }> }>,
): void {
  if (!svgRoot || !groups) {
    return
  }

  groups.forEach((group) => {
    if (!group.objects || !group.objects.length) {
      return
    }

    group.objects.forEach((obj) => {
      if (!obj.value) {
        return
      }

      // Attribute selectors need quoted-string escaping even for valid SVG IDs.
      const id = obj.value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
      const element = svgRoot.querySelector(`[id="${id}"]`)
      if (element) {
        applySvgObjectVisibility(element, !!group.visible)
      }
    })
  })
}
