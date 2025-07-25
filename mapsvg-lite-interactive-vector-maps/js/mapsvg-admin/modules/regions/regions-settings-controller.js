;(function ($, window, MapSVG) {
  var MapSVGAdminRegionsSettingsController = function (container, admin, mapsvg) {
    this.name = "regions-settings"
    this.database = mapsvg.regionsDatabase

    MapSVGAdminController.call(this, container, admin, mapsvg)
  }
  window.MapSVGAdminRegionsSettingsController = MapSVGAdminRegionsSettingsController
  MapSVG.extend(MapSVGAdminRegionsSettingsController, window.MapSVGAdminController)

  MapSVGAdminRegionsSettingsController.prototype.viewLoaded = function () {
    var _this = this
    this.mapsvg.regionsRepository.getSchema().events.on("update", () => this.render())
  }

  MapSVGAdminRegionsSettingsController.prototype.setEventHandlers = function () {
    var _this = this
    this.view.on("click", "#mapsvg-clear-regions-btn", function () {
      if (confirm("Are you sure you want to clear the list of Regions?")) {
        _this.database
          .clear()
          .done(function () {
            $.growl.notice({
              title: "",
              message: "The list of Regions is cleared",
              duration: 700,
            })
          })
          .fail(function () {
            $.growl.error({
              title: "Server error",
              message: "Can't clear the list of regions",
            })
          })
      }
    })
    this.view.on("click", "#mapsvg-set-prefix-btn", function (e) {
      e.preventDefault()
      _this.admin.save().done(function () {
        window.location.reload()
      })
    })
  }

  MapSVGAdminRegionsSettingsController.prototype.getTemplateData = function () {
    var _this = this
    var statusField = _this.mapsvg.regionsRepository.getSchema().getFieldByType("status")
    var options = statusField ? statusField.options : []
    return {
      ..._this.mapsvg.options,
      statuses: options,
    }
  }
})(jQuery, window, window.MapSVG)
