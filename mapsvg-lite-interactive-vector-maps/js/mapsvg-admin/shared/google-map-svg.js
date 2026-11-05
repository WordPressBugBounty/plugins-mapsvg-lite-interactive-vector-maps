/** Retained Google Map downloader format, shared by the legacy and React admin. */
;(function (scope) {
  function serialize(canvas, bounds) {
    var dataUrl = canvas.toDataURL("image/png")
    var coordinates = [bounds.west, bounds.north, bounds.east, bounds.south]
    if (!canvas.width || !canvas.height || !coordinates.every(Number.isFinite)) {
      throw new Error("The Google Map viewport is not ready to download.")
    }
    if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(dataUrl)) {
      throw new Error("The Google Map screenshot could not be captured.")
    }
    var width = canvas.width * 20
    var height = canvas.height * 20
    return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + "\n" +
      '<svg xmlns:mapsvg="http://mapsvg.com" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
      'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" ' +
      'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" ' +
      'xmlns="http://www.w3.org/2000/svg" version="1.1" width="' + width + '" height="' + height +
      '" mapsvg:geoViewBox="' + coordinates.join(" ") + '">' +
      '<image id="mapsvg-google-map-background" xlink:href="' + dataUrl + '"  x="0" y="0" height="' + height +
      '" width="' + width + '"></image></svg>'
  }
  async function capture(element, map, html2canvas) {
    var bounds = map.getBounds()
    if (!bounds) throw new Error("The Google Map viewport is not ready to download.")
    // Capture geographic calibration at the same instant as the viewport snapshot.
    var coordinates = bounds.toJSON()
    var canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      ignoreElements: function (node) {
        return node.id === "mapsvg-google-map-fullscreen-controls" || node.classList.contains("gmnoprint")
      },
    })
    return serialize(canvas, coordinates)
  }
  scope.MapSVGGoogleMapSvg = { serialize: serialize, capture: capture }
})(window)
