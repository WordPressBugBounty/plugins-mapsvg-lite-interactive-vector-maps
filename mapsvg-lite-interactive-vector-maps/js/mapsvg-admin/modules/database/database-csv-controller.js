;(function ($, window, MapSVG) {
  var MapSVGAdminDatabaseCsvController = function (container, admin, mapsvg) {
    this.name = "database-csv"
    this.database = mapsvg.objectsRepository
    MapSVGAdminController.call(this, container, admin, mapsvg)
  }
  window.MapSVGAdminDatabaseCsvController = MapSVGAdminDatabaseCsvController
  MapSVG.extend(MapSVGAdminDatabaseCsvController, window.MapSVGAdminController)

  /** Converts a PHP ini size string (e.g. "8M", "256K") to bytes. */
  function parsePhpSize(str) {
    if (!str) return Infinity
    var num = parseInt(str, 10)
    var unit = str.slice(-1).toUpperCase()
    var mult = { K: 1024, M: 1024 * 1024, G: 1024 * 1024 * 1024 }
    return mult[unit] ? num * mult[unit] : num
  }

  /**
   * Returns a poll interval (ms) for geocoding, scaled to remaining geocoding rows.
   * ~3 s when nearly done, up to 60 s for very large queues.
   */
  function geocodingPollInterval(pending) {
    var min = 2000,
      max = 60000,
      scale = 100000
    return Math.round(min + (Math.log10(Math.max(pending, 1)) / Math.log10(scale)) * (max - min))
  }

  /** localStorage key for a given schema's in-progress import job. */
  function importJobKey(schemaName) {
    return "mapsvg_import_job_" + schemaName
  }

  /** Persist the job token + total so it survives a page reload. */
  function saveImportJob(schemaName, token, total) {
    try {
      localStorage.setItem(importJobKey(schemaName), JSON.stringify({ token: token, total: total }))
    } catch (e) {}
  }

  /** Remove the stored job on completion or failure. */
  function clearImportJob(schemaName) {
    try {
      localStorage.removeItem(importJobKey(schemaName))
    } catch (e) {}
  }

  /** Return the stored job for this schema, or null. */
  function loadImportJob(schemaName) {
    try {
      var raw = localStorage.getItem(importJobKey(schemaName))
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  }

  MapSVGAdminDatabaseCsvController.prototype.setEventHandlers = function () {
    var _this = this

    // Show PHP upload limits under the file input
    var phpIni = window.mapsvgBackendParams && window.mapsvgBackendParams.phpIni
    if (phpIni) {
      _this.view
        .find("#mapsvg-csv-file")
        .after(
          '<small class="form-text text-muted mt-1">Server limit: ' +
            phpIni.upload_max_filesize +
            " per file (post_max_size: " +
            phpIni.post_max_size +
            ")</small>",
        )
    }

    var schemaName = _this.database.schema.name
    var restRoot = (window.wpApiSettings && window.wpApiSettings.root) || "/wp-json/"
    var nonce =
      (window.wpApiSettings && window.wpApiSettings.nonce) ||
      (_this.mapsvg && _this.mapsvg.nonce) ||
      ""

    // ── Paid geocoding toggle — swap the quota description text ──────────────
    _this.view.find("#opt-paid-geocoding").on("change", function () {
      var paid = $(this).is(":checked")
      _this.view.find("#geocoding-quota-free").toggle(!paid)
      _this.view.find("#geocoding-quota-paid").toggle(paid)
    })

    // ── Resume a job that survived a page reload ──────────────────────────────
    var storedJob = loadImportJob(schemaName)
    if (storedJob) {
      $.growl.notice({ title: "", message: "Import was in progress — resuming…" })
      _this.driveImport(restRoot, nonce, schemaName, storedJob.token, storedJob.total, 0, true)
    }

    // ── Upload button ─────────────────────────────────────────────────────────
    this.view.find("#mapsvg-btn-csv-upload").on("click", function () {
      var btn = $("#mapsvg-btn-csv-upload")
      var fileInput = $("#mapsvg-csv-file")[0]

      if (!fileInput.files[0]) {
        $.growl.error({ title: "", message: "Please choose a file" })
        return
      }

      // Client-side size pre-check — avoids a round trip with a cryptic server error
      if (phpIni) {
        var maxBytes = Math.min(
          parsePhpSize(phpIni.upload_max_filesize),
          parsePhpSize(phpIni.post_max_size),
        )
        if (fileInput.files[0].size > maxBytes) {
          $.growl.error({
            title: "",
            message:
              "File is too large (" +
              (fileInput.files[0].size / 1024 / 1024).toFixed(1) +
              " MB). " +
              "Your server allows up to " +
              phpIni.upload_max_filesize +
              " per upload.",
          })
          return
        }
      }

      btn.buttonLoading(true)

      var useGeocoding = $("#use-geocoding").is(":checked")
      var convertLatlngToAddress = useGeocoding && $("#opt-latlng-to-address").is(":checked")
      var convertAddressToLatlng = useGeocoding && $("#opt-address-to-latlng").is(":checked")
      var paidGeocoding = useGeocoding && $("#opt-paid-geocoding").is(":checked")

      var url = restRoot + "mapsvg/v1/objects/" + schemaName + "/import-csv"

      var regionsTableName =
        _this.mapsvg.regionsRepository && _this.mapsvg.regionsRepository.schema
          ? _this.mapsvg.regionsRepository.schema.name
          : ""

      var formData = new FormData()
      formData.append("csv", fileInput.files[0])
      formData.append("convertLatlngToAddress", convertLatlngToAddress ? "1" : "0")
      formData.append("convertAddressToLatlng", convertAddressToLatlng ? "1" : "0")
      formData.append("paidGeocoding", paidGeocoding ? "1" : "0")
      formData.append("regionsTableName", regionsTableName)

      fetch(url, {
        method: "POST",
        headers: { "X-WP-Nonce": nonce },
        credentials: "same-origin",
        body: formData,
      })
        .then(function (res) {
          return res.json().then(function (body) {
            return { status: res.status, body: body }
          })
        })
        .then(function (result) {
          btn.buttonLoading(false)

          if (result.status >= 400) {
            $.growl.error({ title: "", message: result.body.error || "Upload failed" })
            return
          }

          var token = result.body.token
          var total = result.body.total || 0

          // Persist so the job survives a page reload
          saveImportJob(schemaName, token, total)

          $.growl.notice({ title: "", message: "File uploaded. Importing " + total + " rows…" })
          _this.driveImport(restRoot, nonce, schemaName, token, total, 0, true)
        })
        .catch(function (err) {
          btn.buttonLoading(false)
          console.error(
            "[CLIENT-027] HTTP error during CSV import — Read more: https://mapsvg.com/docs/errors#CLIENT-027",
            err,
          )
          $.growl.error({ title: "", message: "Network error during import" })
        })
    })
  }

  /**
   * Drives background CSV import by calling the process endpoint back-to-back
   * until the server reports status === 'complete' or 'failed'.
   *
   * Each server call processes one large chunk (≈50 000 rows). We fire the next
   * call immediately after the previous one returns. WP Cron is also scheduled
   * server-side as a fallback if the tab closes.
   *
   * On page reload the stored token is picked up in setEventHandlers and this
   * function is called again, reconnecting to the in-progress job.
   */
  MapSVGAdminDatabaseCsvController.prototype.driveImport = function (
    restRoot,
    nonce,
    schemaName,
    token,
    total,
    processed,
    isFirstCall,
  ) {
    var _this = this
    var url = restRoot + "mapsvg/v1/objects/" + schemaName + "/import-csv/process"

    // Small delay on the first call only (lets the server finish saving the job).
    var delay = isFirstCall ? 500 : 0

    setTimeout(function () {
      fetch(url, {
        method: "POST",
        headers: {
          "X-WP-Nonce": nonce,
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({ token: token }),
      })
        .then(function (res) {
          return res.json()
        })
        .then(function (body) {
          var newProcessed = body.processed || 0
          var percent = total > 0 ? Math.round((newProcessed / total) * 100) : 0

          if (body.errors && body.errors.length) {
            body.errors.forEach(function (e) {
              $.growl.warning({ title: "Import warning", message: e.message || e })
            })
          }

          if (body.status === "complete") {
            clearImportJob(schemaName)

            var summary = newProcessed + " rows imported"
            if (body.error_count > 0) {
              summary += " (" + body.error_count + " skipped due to errors)"
            }
            $.growl.notice({ title: "", message: summary })

            if (body.geocoding_queued) {
              $.growl.notice({
                title: "",
                message: "Geocoding in progress — this may take a while",
              })
              _this.pollGeocodingQueue(restRoot, nonce, schemaName)
              _this.database.find()
            } else {
              _this.database.find()
            }
            return
          }

          if (body.status === "failed") {
            clearImportJob(schemaName)
            $.growl.error({ title: "", message: body.error || "Import failed" })
            return
          }

          // Job not found (expired transient) — nothing to resume
          if (body.error && body.error.indexOf("not found") !== -1) {
            clearImportJob(schemaName)
            $.growl.error({ title: "", message: "Import job expired. Please re-upload the file." })
            return
          }

          // Still processing — refresh the list so imported rows appear live, then request the next chunk
          $.growl.notice({
            title: "",
            message: "Importing… " + percent + "% (" + newProcessed + " / " + total + ")",
          })
          _this.database.find()
          _this.driveImport(restRoot, nonce, schemaName, token, total, newProcessed, false)
        })
        .catch(function () {
          // Transient network error — retry after 5 s (cron covers the gap anyway)
          setTimeout(function () {
            _this.driveImport(restRoot, nonce, schemaName, token, total, processed, false)
          }, 5000)
        })
    }, delay)
  }

  /**
   * Polls /geocoding/queue with an adaptive interval until pending reaches 0,
   * then refreshes the database list.
   */
  MapSVGAdminDatabaseCsvController.prototype.pollGeocodingQueue = function (
    restRoot,
    nonce,
    schemaName,
  ) {
    var _this = this
    var url = restRoot + "mapsvg/v1/geocoding/queue"

    var poll = function () {
      fetch(url, {
        headers: { "X-WP-Nonce": nonce },
        credentials: "same-origin",
      })
        .then(function (res) {
          return res.json()
        })
        .then(function (body) {
          var queue = body.queue && !Array.isArray(body.queue) ? body.queue : {}
          var pending = queue[schemaName] ? queue[schemaName].pending : 0

          if (pending === 0) {
            $.growl.notice({ title: "", message: "Geocoding complete!" })
            _this.database.find()
          } else {
            $.growl.notice({ title: "", message: "Geocoding: " + pending + " rows remaining…" })
            _this.database.find()
            setTimeout(poll, geocodingPollInterval(pending))
          }
        })
        .catch(function () {
          setTimeout(poll, 10000)
        })
    }

    setTimeout(poll, 2000)
  }
})(jQuery, window, window.MapSVG)
