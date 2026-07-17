;(function ($, window, MapSVG) {
  var MapSVGAdminDatabaseCsvController = function (container, admin, mapsvg) {
    this.collectionType = "objects"
    this.database = mapsvg.objectsRepository
    this.showGeocoding = true
    MapSVGAdminCsvController.call(this, container, admin, mapsvg)
  }
  window.MapSVGAdminDatabaseCsvController = MapSVGAdminDatabaseCsvController
  MapSVG.extend(MapSVGAdminDatabaseCsvController, window.MapSVGAdminCsvController)
})(jQuery, window, window.MapSVG)
