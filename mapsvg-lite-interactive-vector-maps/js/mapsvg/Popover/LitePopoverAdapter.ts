import type { NodePayload } from "../Contracts/NodeAdapter"
import { BasePopoverAdapter } from "../Contracts/PopoverAdapter"
import { PopoverController } from "./Popover"
import type { MapSVGMap } from "../Map/Map"

/**
 * Lite adapter that wraps the legacy `PopoverController`.
 * This is the concrete Lite implementation registered in the NodeRegistry.
 *
 * Pro add-ons receive this adapter (via the registry's enhance seam) and wrap
 * it with `PopoverProWrap` to add Handlebars template support.
 */
export class LitePopoverAdapter extends BasePopoverAdapter {
  private controller: PopoverController

  constructor(controller: PopoverController) {
    super()
    this.controller = controller
  }

  open(payload: NodePayload): void {
    // Legacy PopoverController.open() does not take a payload — the map runtime
    // already populates the controller's content before calling open().
    // This seam is intentional: future v9 runtime will pass payload here.
    this.controller.open()
  }

  close(): void {
    this.controller.close()
  }

  destroy(): void {
    this.controller.destroy()
  }

  setPoint(point: { x: number; y: number }): void {
    this.controller.setPoint(point as any)
  }

  adjustPosition(): void {
    this.controller.adjustScreenPosition()
  }

  /** Expose the underlying controller for legacy code that still needs it. */
  getController(): PopoverController {
    return this.controller
  }
}

/**
 * Factory helper — registers the Lite popover factory in the node registry.
 * Called once at map runtime startup.
 */
export function registerLitePopover(
  registry: import("../Contracts/NodeRegistry").NodeRegistry,
  createController: (payload: NodePayload) => PopoverController,
): void {
  registry.register("popover", (payload) => {
    const controller = createController(payload)
    return new LitePopoverAdapter(controller)
  })
}
