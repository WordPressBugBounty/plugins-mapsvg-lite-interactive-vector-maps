export const LEGACY_PRODUCT_EMBED_HTML = `<!--
  ProductEmbed — full WooCommerce / post embed in an iframe.

  Usage as partial:
    {{>ProductEmbed product=objects.0.post}}

  Prefer this for variable, grouped, and external products (or whenever
  product.use_product_embed is true). For a compact card UI use ProductCard
  with Details View + preset "Card".

  Buttons inside the embed are rendered by WooCommerce itself (Add to cart,
  variations, etc.), not by MapSVG template HTML.
-->
{{product}}`

// HTML comments still execute Handlebars: keep the usage example inert.
export const PRODUCT_EMBED_HTML = LEGACY_PRODUCT_EMBED_HTML.replace(
  "{{>ProductEmbed product=objects.0.post}}",
  "[[>ProductEmbed product=objects.0.post]]\n\n  Replace [] symbols in the example with {}.",
)
