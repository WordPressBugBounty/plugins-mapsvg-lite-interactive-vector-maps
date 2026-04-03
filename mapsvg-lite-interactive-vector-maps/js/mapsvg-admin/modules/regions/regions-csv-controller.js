;(function ($, window, MapSVG) {
  var MapSVGAdminRegionsCsvController = function (container, admin, mapsvg) {
    this.name = "regions-csv"
    this.database = mapsvg.regionsDatabase
    MapSVGAdminController.call(this, container, admin, mapsvg)
  }
  window.MapSVGAdminRegionsCsvController = MapSVGAdminRegionsCsvController
  MapSVG.extend(MapSVGAdminRegionsCsvController, window.MapSVGAdminController)

  /** Converts a PHP ini size string (e.g. "8M", "256K") to bytes. */
  function parsePhpSize(str) {
    if (!str) return Infinity
    var num  = parseInt(str, 10)
    var unit = str.slice(-1).toUpperCase()
    var mult = { K: 1024, M: 1024 * 1024, G: 1024 * 1024 * 1024 }
    return mult[unit] ? num * mult[unit] : num
  }

  MapSVGAdminRegionsCsvController.prototype.setEventHandlers = function () {
    var _this = this

    // Show PHP upload limits under the file input
    var phpIni = window.mapsvgBackendParams && window.mapsvgBackendParams.phpIni
    if (phpIni) {
      _this.view.find("#mapsvg-r-csv-file").after(
        '<small class="form-text text-muted mt-1">Server limit: '
        + phpIni.upload_max_filesize
        + ' per file (post_max_size: '
        + phpIni.post_max_size
        + ')</small>'
      )
    }

    this.view.find("#mapsvg-btn-r-csv-upload").on("click", function () {
      var btn = $("#mapsvg-btn-r-csv-upload")
      var fileInput = $("#mapsvg-r-csv-file")[0]

      if (!fileInput.files[0]) {
        $.growl.error({ title: "", message: "Please choose a file" })
        return
      }

      // Client-side size pre-check
      if (phpIni) {
        var maxBytes = Math.min(parsePhpSize(phpIni.upload_max_filesize), parsePhpSize(phpIni.post_max_size))
        if (fileInput.files[0].size > maxBytes) {
          $.growl.error({
            title: "",
            message: "File is too large (" + (fileInput.files[0].size / 1024 / 1024).toFixed(1) + " MB). "
              + "Your server allows up to " + phpIni.upload_max_filesize + " per upload.",
          })
          return
        }
      }

      btn.buttonLoading(true)

      var schemaName = _this.database.schema.name
      var restRoot = (window.wpApiSettings && window.wpApiSettings.root) || "/wp-json/"
      var nonce = (window.wpApiSettings && window.wpApiSettings.nonce) || (_this.mapsvg && _this.mapsvg.nonce) || ""
      var url = restRoot + "mapsvg/v1/regions/" + schemaName + "/import-csv"

      var formData = new FormData()
      formData.append("csv", fileInput.files[0])

      fetch(url, {
        method: "POST",
        headers: { "X-WP-Nonce": nonce },
        credentials: "same-origin",
        body: formData,
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { ok: res.ok, body: body }
          })
        })
        .then(function (result) {
          btn.buttonLoading(false)

          if (!result.ok) {
            $.growl.error({ title: "", message: result.body.error || "Import failed" })
            return
          }

          var count = result.body.count || 0
          $.growl.notice({ title: "", message: count + " rows imported" })
          _this.database.find()
        })
        .catch(function (err) {
          btn.buttonLoading(false)
          console.error("[CLIENT-027] HTTP error during CSV import — Read more: https://mapsvg.com/docs/errors#CLIENT-027", err)
          $.growl.error({ title: "", message: "Network error during import" })
        })
    })
  }
})(jQuery, window, window.MapSVG)
