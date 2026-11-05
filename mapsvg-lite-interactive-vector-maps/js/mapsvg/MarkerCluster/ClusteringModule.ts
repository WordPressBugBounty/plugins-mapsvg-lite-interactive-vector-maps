import type { MapSVGMap } from "../Map/Map"
import type { MapObject, MapObjectType } from "../MapObject/MapObject"
import type { ScreenPoint, SVGPoint } from "../Location/Location"
import type { ViewBox } from "../Map/ViewBox"
import type { WorldCopies } from "../Marker/WorldCopies"
export interface ClusterServices {
  MapObject: typeof MapObject
  MapObjectType: typeof MapObjectType
  ScreenPoint: typeof ScreenPoint
  SVGPoint: typeof SVGPoint
  ViewBox: typeof ViewBox
  WorldCopies: typeof WorldCopies
  MapEventType: { ZOOM: string; RESIZE: string }
}
/** Optional implementation; core retains persisted options and public method names. */
export interface ClusteringModule {
  deleteClusters: (
    this: MapSVGMap,
    services: ClusterServices,
    ...args: Parameters<MapSVGMap["deleteClusters"]>
  ) => ReturnType<MapSVGMap["deleteClusters"]>
  addClustersFromWorker: (
    this: MapSVGMap,
    services: ClusterServices,
    ...args: Parameters<MapSVGMap["addClustersFromWorker"]>
  ) => ReturnType<MapSVGMap["addClustersFromWorker"]>
  startClusterizer: (
    this: MapSVGMap,
    services: ClusterServices,
    ...args: Parameters<MapSVGMap["startClusterizer"]>
  ) => ReturnType<MapSVGMap["startClusterizer"]>
  clusterizeMarkers: (
    this: MapSVGMap,
    services: ClusterServices,
    ...args: Parameters<MapSVGMap["clusterizeMarkers"]>
  ) => ReturnType<MapSVGMap["clusterizeMarkers"]>
  clusterizeOnZoom: (
    this: MapSVGMap,
    services: ClusterServices,
    ...args: Parameters<MapSVGMap["clusterizeOnZoom"]>
  ) => ReturnType<MapSVGMap["clusterizeOnZoom"]>
  markersClusterAdd: (
    this: MapSVGMap,
    services: ClusterServices,
    ...args: Parameters<MapSVGMap["markersClusterAdd"]>
  ) => ReturnType<MapSVGMap["markersClusterAdd"]>
  markerClusterClickHandler: (
    this: MapSVGMap,
    services: ClusterServices,
    ...args: Parameters<MapSVGMap["markerClusterClickHandler"]>
  ) => ReturnType<MapSVGMap["markerClusterClickHandler"]>
  bindEvents: (this: MapSVGMap) => void
  hit: (target: HTMLElement) => import("./MarkerCluster").MarkerCluster | undefined
  setColors: (this: MapSVGMap) => void
  dispose: (this: MapSVGMap) => void
  sync: (this: MapSVGMap, services: ClusterServices) => void
}
