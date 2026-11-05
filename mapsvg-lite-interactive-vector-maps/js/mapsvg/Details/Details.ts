/**
 * Details View controller. Large scrollable window with content and "X" close button
 * that can be placed in the map container, header/footer/sidebar or in a custom DIV container outside of the map.
 * @param {object} options
 * @extends Controller
 * @constructor
 */
import { Controller, ControllerOptions } from "../Core/Controller"
import "./details.css"
const $ = jQuery

export interface DetailsViewOptions extends ControllerOptions {
  autoresize?: boolean
}

export class DetailsController extends Controller {
  constructor(options: DetailsViewOptions) {
    super(options)
    this.name = "detailsView"
    this.classList.push("mapsvg-details-container")
    this.closable = true
    this.autoresize = options.autoresize
    this.position = options.position || "absolute"
  }

  viewDidLoad(): void {
    if (this.name === "detailsView") {
      this.applyDetailsStyles()
    }
  }

  /**
   * Applies border-radius, padding, box-shadow from map options.detailsView.
   * Only for the details view controller — not filters or other subclasses.
   */
  applyDetailsStyles(): void {
    if (this.name !== "detailsView") {
      return
    }

    const opts = this.map?.options?.detailsView
    if (!opts || !this.containers.main) {
      return
    }

    const borderRadius =
      opts.borderRadius !== undefined && opts.borderRadius !== null ? Number(opts.borderRadius) : 0
    this.containers.main.style.borderRadius = borderRadius + "px"

    const boxShadow = this.normalizeBoxShadow(opts.boxShadow)
    this.containers.main.style.boxShadow =
      boxShadow.on && boxShadow.value > 0
        ? `0 0 ${boxShadow.value}px rgba(0,0,0,.3)`
        : "none"

    if (this.containers.contentView && opts.padding) {
      const p = opts.padding
      const top = p.top !== undefined && p.top !== null ? Number(p.top) : 15
      const right = p.right !== undefined && p.right !== null ? Number(p.right) : 15
      const bottom = p.bottom !== undefined && p.bottom !== null ? Number(p.bottom) : 15
      const left = p.left !== undefined && p.left !== null ? Number(p.left) : 15
      this.containers.contentView.style.padding = `${top}px ${right}px ${bottom}px ${left}px`
    }

    this.updateTopShift()
  }

  private normalizeBoxShadow(
    boxShadow: { on?: boolean; value?: number } | number | undefined | null,
  ): { on: boolean; value: number } {
    if (boxShadow && typeof boxShadow === "object") {
      return {
        on: !!boxShadow.on,
        value: boxShadow.value !== undefined && boxShadow.value !== null ? Number(boxShadow.value) : 20,
      }
    }
    if (typeof boxShadow === "number") {
      return { on: boxShadow > 0, value: boxShadow > 0 ? boxShadow : 20 }
    }
    return { on: false, value: 20 }
  }

  /**
   * When padding top is 0, pin the nano wrap to top:0; otherwise use toolbar offset.
   */
  updateTopShift(): void {
    if (this.name === "detailsView") {
      const paddingTop = this.map?.options?.detailsView?.padding?.top
      if (Number(paddingTop) === 0) {
        const _this = this
        $(_this.containers.contentWrap).css({ top: "0px" })
        setTimeout(function () {
          $(_this.containers.contentWrap).css({ top: "0px" })
        }, 100)
        setTimeout(function () {
          $(_this.containers.contentWrap).css({ top: "0px" })
        }, 200)
        setTimeout(function () {
          $(_this.containers.contentWrap).css({ top: "0px" })
          _this.updateScroll()
        }, 500)
        return
      }
    }
    super.updateTopShift()
  }
}
