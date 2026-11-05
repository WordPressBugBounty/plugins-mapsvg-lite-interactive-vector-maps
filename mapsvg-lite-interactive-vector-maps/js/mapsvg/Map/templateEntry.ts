import { LEGACY_PRODUCT_EMBED_HTML, PRODUCT_EMBED_HTML } from "./productEmbedDefault"

export type TemplateType = "default" | "partial"

// Repair only the exact shipped default; authored templates remain byte-for-byte intact.
function normalizedHtml(html: string, name?: string): string {
  return name === "ProductEmbed" && html === LEGACY_PRODUCT_EMBED_HTML ? PRODUCT_EMBED_HTML : html
}

export type TemplateEntry = {
  html: string
  css: string
  js: string
  type: TemplateType
}

/** Keys that historically were Handlebars partials only. */
export const PARTIAL_TEMPLATE_KEYS = ["directoryItem", "directoryCategoryItem"] as const

export function isPartialTemplateKey(name: string): boolean {
  return (PARTIAL_TEMPLATE_KEYS as readonly string[]).includes(name)
}

/**
 * Normalize legacy string or partial object into TemplateEntry.
 * Does not write to DB — safety net for cache / unmigrated maps.
 */
export function normalizeTemplateEntry(
  value: TemplateEntry | string | null | undefined,
  name?: string,
): TemplateEntry {
  if (value && typeof value === "object" && "html" in value) {
    return {
      html: normalizedHtml(typeof value.html === "string" ? value.html : "", name),
      css: typeof value.css === "string" ? value.css : "",
      js: typeof (value as TemplateEntry).js === "string" ? (value as TemplateEntry).js : "",
      type:
        value.type === "partial" || value.type === "default"
          ? value.type
          : name && isPartialTemplateKey(name)
            ? "partial"
            : "default",
    }
  }

  const html = typeof value === "string" ? value : ""
  return {
    html: normalizedHtml(html, name),
    css: "",
    js: "",
    type: name && isPartialTemplateKey(name) ? "partial" : "default",
  }
}

export function getTemplateHtml(
  value: TemplateEntry | string | null | undefined,
  name?: string,
): string {
  return normalizeTemplateEntry(value, name).html
}

export function toTemplateEntry(
  html: string,
  type: TemplateType = "default",
  css = "",
  js = "",
): TemplateEntry {
  return { html, css, js, type }
}

/**
 * Wrap compiled template HTML so Controller.redraw can find afterRender hooks.
 * display:contents keeps layout/CSS selectors intact.
 */
export function wrapTemplatePartialHtml(name: string, html: string): string {
  const safeName = String(name || "").replace(/"/g, "")
  if (!safeName) {
    return html || ""
  }
  // A custom item template is content; native Directory interactions must not
  // depend on the author remembering the runtime click-target markup.
  const nativeItemHost = name === "directoryItem" && Array.from((html || "").matchAll(/\bclass\s*=\s*(["'])([^"']*)\1/gi))
    .some(match => match[2].split(/\s+/).includes("mapsvg-directory-item"))
  if (name === "directoryItem" && !nativeItemHost) {
    html = '<div id="mapsvg-directory-item-{{toSnakeCase id}}" class="mapsvg-directory-item" data-object-id="{{id}}">' + (html || "") + '</div>'
  }
  return (
    '<div data-mapsvg-partial="' +
    safeName +
    '" style="display:contents">' +
    (html || "") +
    "</div>"
  )
}

/**
 * Rewrite {{>name}} / {{#>name}} to map-scoped {{>name-{mapId}}} so partials
 * from dual registration resolve per map. Skips names already ending with -{mapId}.
 * Raw options.templates html stays unscoped; only compile source is rewritten.
 */
export function rewritePartialRefs(html: string, mapId: string | number): string {
  if (!html) {
    return html
  }
  const suffix = "-" + String(mapId)
  return html.replace(/\{\{(#?>)\s*([A-Za-z_][\w]*)/g, (match, kind: string, name: string) => {
    if (name.endsWith(suffix)) {
      return match
    }
    return "{{" + kind + name + suffix
  })
}
