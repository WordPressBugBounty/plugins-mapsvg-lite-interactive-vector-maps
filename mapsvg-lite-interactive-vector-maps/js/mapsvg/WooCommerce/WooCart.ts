import type { MapSVGMap } from "../Map/Map"
import { inlineSvgUses as inlineSvgUsesInContainer } from "./inlineSvgUses"

type WooCartProps = {
  mapsvg: MapSVGMap
}

/**
 * WooCommerce add-to-cart handling for MapSVG product templates.
 *
 * Loaded on demand (dynamic import) only when the server sets
 * `options.woocommerce` (WooCommerce plugin is active).
 */
export default class WooCartController {
  private mapsvg: MapSVGMap
  private eventDocument: Document

  constructor(props: WooCartProps) {
    this.mapsvg = props.mapsvg
    this.eventDocument = (this.mapsvg as any).eventDocument || document
  }

  /**
   * Delegated fallback handler — catches submits for forms rendered outside
   * a Shadow DOM (bindForms() covers the Shadow DOM case with direct binding).
   */
  init(): void {
    const $ = window.jQuery
    $(this.eventDocument).off(this.eventNamespace())
    $(this.eventDocument).on(
      `submit${this.eventNamespace()}`,
      ".mapsvg-product-cart form.cart",
      (e: JQuery.TriggeredEvent) => this.handleSubmit(e),
    )
  }

  /**
   * Directly binds submit handlers to cart forms inside a rendered container.
   * Needed for details/directory views rendered inside a Shadow DOM, where the
   * delegated document handler never sees the event.
   */
  bindForms(container?: HTMLElement | null): void {
    if (!container) {
      return
    }
    const forms = container.querySelectorAll<HTMLFormElement>(".mapsvg-product-cart form.cart")
    forms.forEach((form) => {
      if (form.dataset.mapsvgWooBound === "1") {
        return
      }
      form.dataset.mapsvgWooBound = "1"
      form.addEventListener("submit", (e) => this.handleSubmit(e))
    })
    inlineSvgUsesInContainer(container, this.eventDocument)
  }

  /** @see inlineSvgUses */
  inlineSvgUses(container?: HTMLElement | null): void {
    inlineSvgUsesInContainer(container, this.eventDocument)
  }

  destroy(): void {
    const $ = window.jQuery
    $(this.eventDocument).off(this.eventNamespace())
  }

  private eventNamespace(): string {
    return `.wooCart.mapsvg-${this.mapsvg.id}`
  }

  private handleSubmit(e: Event | JQuery.TriggeredEvent): void {
    e.preventDefault()

    const $ = window.jQuery
    const $form = $(e.currentTarget as HTMLFormElement)
    const $button = $form.find('[type="submit"], .single_add_to_cart_button').first()
    const buttonValue = $button.val()
    const productIdRaw =
      $form.find('input[name="add-to-cart"]').val() ||
      (typeof buttonValue === "string" || typeof buttonValue === "number" ? buttonValue : "") ||
      $button.data("product_id")
    const quantityRaw = $form.find("input.qty").val()

    const productId = Number(productIdRaw)
    const quantity = Number(quantityRaw || 1)
    if (!productId) {
      return
    }

    const params = (window as any).wc_add_to_cart_params || {}
    const ajaxUrl =
      typeof params.wc_ajax_url === "string"
        ? params.wc_ajax_url.replace("%%endpoint%%", "add_to_cart")
        : "/?wc-ajax=add_to_cart"

    $button.prop("disabled", true).addClass("loading")

    $.ajax({
      type: "POST",
      url: ajaxUrl,
      data: { product_id: productId, quantity: quantity > 0 ? quantity : 1 },
      complete: () => {
        $button.prop("disabled", false).removeClass("loading")
      },
      success: (response: any) => {
        if (response && response.fragments) {
          Object.keys(response.fragments).forEach((selector) => {
            const html = response.fragments[selector]
            $(selector).replaceWith(html)
          })
        }
        $(document.body).trigger("added_to_cart", [
          response?.fragments || {},
          response?.cart_hash || "",
          $button,
        ])
        $(document.body).trigger("wc_fragment_refresh")
      },
    })
  }
}
