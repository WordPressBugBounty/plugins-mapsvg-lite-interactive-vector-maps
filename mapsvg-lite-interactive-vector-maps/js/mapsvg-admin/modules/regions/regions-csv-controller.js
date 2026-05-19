;(function ($, window, MapSVG) {
  var MapSVGAdminRegionsCsvController = function (container, admin, mapsvg) {
    this.collectionType = "regions"
    this.database = mapsvg.regionsDatabase
    this.showGeocoding = false
    MapSVGAdminCsvController.call(this, container, admin, mapsvg)
  }
  window.MapSVGAdminRegionsCsvController = MapSVGAdminRegionsCsvController
  MapSVG.extend(MapSVGAdminRegionsCsvController, window.MapSVGAdminCsvController)
})(jQuery, window, window.MapSVG)
