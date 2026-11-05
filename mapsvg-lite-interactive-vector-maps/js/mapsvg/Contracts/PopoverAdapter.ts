import type { NodeAdapter, NodePayload } from "./NodeAdapter"

/**
 * Specific contract for popover adapters.
 * Lite implements `BasePopoverAdapter`; Pro wraps the Lite instance.
 */
export interface PopoverAdapter extends NodeAdapter {
  readonly type: "popover"
  /** Set anchor SVG point without re-opening */
  setPoint(point: { x: number; y: number }): void
  /** Reposition to current anchor (e.g. after map pan/zoom) */
  adjustPosition(): void
}

/**
 * Default Lite popover adapter.
 * Renders title and/or description only.
 * Pro wraps this via `PopoverProWrap` to add Handlebars template support.
 *
 * Subclassing within the Lite package is fine.
 * DO NOT subclass across the package boundary — use the wrap model instead.
 */
export abstract class BasePopoverAdapter implements PopoverAdapter {
  readonly type = "popover" as const

  abstract open(payload: NodePayload): void
  abstract close(): void
  abstract destroy(): void
  abstract setPoint(point: { x: number; y: number }): void
  abstract adjustPosition(): void

  supports(capability: string): boolean {
    // Lite popover supports only basic title/description rendering
    return capability === "title" || capability === "description"
  }
}
