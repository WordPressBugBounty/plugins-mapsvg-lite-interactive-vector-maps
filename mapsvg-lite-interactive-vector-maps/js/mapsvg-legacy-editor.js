// This page loads a single renderer. Both engines may coexist on public pages.
const ready = () => window.mapsvgLegacyV8?.initialized
if (!ready())
  await new Promise((resolve) =>
    window.addEventListener("mapsvgLegacyV8Initialized", resolve, { once: true }),
  )
window.mapsvg = window.mapsvgLegacyV8
window.MapSVG = window.MapSVGLegacyV8
const params = window.mapsvgBackendParams
let publication = params.legacyVersion
jQuery.ajaxPrefilter((options, original, xhr) => {
  const svg = /\bsvgfile\/update\/?(?:\?|$)/.test(options.url)
  if (
    (!svg && !/\bmaps\/\d+\/?(?:\?|$)/.test(options.url)) ||
    !["POST", "PUT"].includes(options.type?.toUpperCase())
  )
    return
  const separator = options.url.includes("?") ? "&" : "?"
  options.url += `${separator}mapsvg_legacy_version=${publication}${svg ? "&mapsvg_legacy_app=" + params.map.id : ""}`
  xhr.done((data) => {
    if (data?.legacyVersion) publication = data.legacyVersion
  })
})
await import(params.legacyAssetsUrl + "js/mapsvg-admin/core/admin.js")
