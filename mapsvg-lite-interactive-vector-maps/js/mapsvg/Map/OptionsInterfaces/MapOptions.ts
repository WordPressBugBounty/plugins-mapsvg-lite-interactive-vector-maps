import type { MapSettingsBase } from "./MapOptionsContract"
import type { TypographyOptions } from "../../Core/typography"
import type { RegionDataRules } from "../../Region/dataRules"
import type { MarkerDataRules } from "../../Marker/dataRules"
import type { GalleryOptions } from "../../Gallery/gallery-options"
import { MiddlewareType } from "@/Core/Middleware"
import { SchemaOptions } from "@/Infrastructure/Server/Schema"
import type { MapSvgNode, SceneNode } from "@/Components/NodesRegistry"
import { ArrayIndexed } from "../../Core/ArrayIndexed"
import { SchemaField } from "../../Infrastructure/Server/SchemaField"
import { GeoPoint } from "../../Location/Location"

// New interface for RegionStatusOptions
export interface RegionStatusOptions {
  label: string
  value: string
  disabled: boolean
  color: string
}

// New type for RegionStatusOptionsCollection
export type RegionStatusOptionsCollection = Record<string, RegionStatusOptions>

/**
 * MapOptions interface is used to control the correct types of map options, passed during the initialization of the map or updating it.
 */
export interface MapOptions extends MapSettingsBase {
  showPagination?: boolean
  typography?: Partial<TypographyOptions>
  theme?: {
    name: string
  }
  id: number
  backend?: boolean // passed from admin
  /** Runtime flag from PHP: WooCommerce plugin is installed and active. */
  woocommerce?: boolean
  db_map_id?: number | string
  // Contents of an SVG file if it was preloaded
  svgData?: string
  regionsDynamicStatus?: {
    filtered?: string | number | undefined
    noObjects?: string | number | undefined
  }
  /** Priority order of the dynamic-status rules (top = highest priority, wins on conflict). */
  regionsDynamicStatusOrder?: string[]
  /** When true, front sets region status from a synced field via statusSyncMap. */
  statusSyncOn?: boolean
  /**
   * Where statusSyncField is read from.
   * "objects" — linked DB objects (default); "regions" — the region row itself.
   */
  statusSyncSource?: "objects" | "regions"
  /** Full field path with type prefix, e.g. "Object.post.meta._stock_status" or "Region.title". */
  statusSyncField?: string
  /**
   * Strategy when several linked objects have different values for statusSyncField.
   * "priority" — first matching statusSyncMap row (top = highest) wins.
   * "special" — use the map entry with value "__multiple__".
   */
  statusSyncMultiStrategy?: "priority" | "special"
  /** Field value → region status id. Empty status = leave region status unchanged. */
  statusSyncMap?: Array<{ value: string; status: string }>
  groups?: ArrayIndexed<GroupOptionsInterface>
  galleries?: GalleryOptions[]
  layersControl?: LayersControlOptionsInterface
  inBackend?: boolean
  menu?: DirectoryOptions
  colors?: ColorsOptions
  /**
   * Zoom
   */
  zoom?: ZoomOptions
  scroll?: ScrollOptions
  tooltips?: TooltipsOptions
  popovers?: PopoversOptions
  regionDataRules?: RegionDataRules
  markerDataRules?: MarkerDataRules
  regionStatuses?: RegionStatusOptionsCollection
  events?: { [key: string]: string }
  middlewares?: { [K in MiddlewareType]: string }
  choropleth?: ChoroplethOptions
  regions?: RegionOptionsCollection
  database?: DatabaseOptions
  googleMaps?: {
    on: boolean
    apiKey: string
    center: GeoPoint
    zoom: number
    drawingTools?: boolean
    geometry?: boolean
    minZoom: number
    language: string
  }
  css?: string
  layout?: {
    /** Suppress legacy automatic Map/Toolbar seeding after explicit deletion. */
    deletedNodeTypes?: string[]
    mountMode?: "tree"
    column?: number
    gap?: number
    cellHeight?: number
    grids?: {
      desktop?: Array<{ id: string; x: number; y: number; w: number; h: number }>
      tablet?: Array<{ id: string; x: number; y: number; w: number; h: number }>
      mobile?: Array<{ id: string; x: number; y: number; w: number; h: number }>
    }
  }
  nodes?: Array<MapSvgNode> | ArrayIndexed<MapSvgNode>
  scenes?: Array<SceneNode> | ArrayIndexed<SceneNode>
  containers?: {
    leftSidebar: { on: boolean; width: string; height: string }
    rightSidebar: { on: boolean; width: string; height: string }
    header: { on: boolean; width: string; height: string }
    footer: { on: boolean; width: string; height: string }
  }
  filters?: FilterOptions
  filtersSchema?: Array<SchemaField>
  detailsView?: {
    location: "leftSidebar" | "rightSidebar" | "header" | "footer" | "custom" | "fullscreen" | "map"
    width: string
    mobileFullscreen: boolean
    containerId: string
    margin: string
    autoresize: boolean
    borderRadius?: number
    padding?: {
      top?: number
      right?: number
      bottom?: number
      left?: number
    }
    boxShadow?: {
      on?: boolean
      value?: number
    }
  }
  mobileView?: {
    [key: string]: any
  }
  templates?: Record<
    string,
    {
      html: string
      css: string
      js: string
      type: "default" | "partial"
    }
  >
  controls?: ControlsOptions
  actions?: {
    region: {
      click: { [key: string]: any }
      touch: { [key: string]: any }
      mouseover: { [key: string]: any; showTooltip: boolean }
      mouseout: { [key: string]: any }
    }
    marker: {
      touch: { [key: string]: any }
      click: { [key: string]: any }
      mouseover: { [key: string]: any; showTooltip: boolean }
      mouseout: { [key: string]: any }
    }
    map: {
      afterLoad: {
        selectRegion: boolean
        selectMarker: boolean
        loadPost: "objectsRepository" | "regionsRepository" | null | false
      }
    }
    directoryItem: {
      touch: { [key: string]: any }
      click: { [key: string]: any }
      hover: { [key: string]: any }
      mouseout: { [key: string]: any }
    }
  }
  svgFileVersion?: number
  data_regions?: any // passed from Admin
  data_objects?: any // passed from Admin
  extension?: any
  markerLastID?: number
  previousMapsIds?: Array<number | string>
}

export interface PaginationOptions {
  on: boolean
  perpage: number
  showIn: string
  prev: string
  next: string
}

export type AutoRefetchUnit = "s" | "m" | "h"

export interface AutoRefetchOptions {
  on: boolean
  value: number
  unit: AutoRefetchUnit
}

export interface DatabaseOptions {
  pagination: PaginationOptions
  loadOnStart: boolean
  noFiltersNoLoad: boolean
  autoRefetch: AutoRefetchOptions
  regionsAutoRefetch: AutoRefetchOptions
  /** @deprecated v8 source fallback; named Page bindings resolve their Query's source. */
  regionsTableName: string
  /** @deprecated v8 source fallback; named Page bindings resolve their Query's source. */
  objectsTableName: string
  on: boolean
  /** @deprecated Runtime v8 defaults only. Omitted from new Query-bound App documents. */
  schemas: {
    regions: SchemaOptions
    objects: SchemaOptions
  }
}

export interface MapRepositoryOptions {
  pagination: {
    on: boolean
    perpage: number
  }
  schema: SchemaOptions
}

export interface FilterOptions {
  on: boolean
  source: string
  containerId: string
  location: string
  width: string
  filteredRegionsStatus: number
  modalLocation: string
  hideOnMobile: boolean
  hide: boolean
  padding: string
  showButtonText: string
  clearButton: boolean
  clearButtonText: string
  searchButton: boolean
  searchButtonText: string
}

export interface GroupOptionsInterface {
  id: string
  title: string
  objects: Array<{ label: string; value: string }>
  visible: boolean
}
export type GalleryOptionsInterface = GalleryOptions
export interface LayersControlOptionsInterface {
  on: boolean
  label: string
  maxHeight: string
  position: string
  expanded: boolean
}

export interface ControlsOptions {
  zoom: boolean
  zoomReset: boolean
  userLocation: boolean
  location: string
  previousMap: boolean
}

export interface DirectoryOptions {
  showPagination?: boolean
  showFirst: string
  showMapOnClick: boolean
  noResultsText: string
  on: boolean
  customContainer: boolean
  width: string
  source: string
  hideOnMobile: boolean
  location: string
  containerId: string
  position: string
  filterout: {
    field: string
    val: number | string
  }
  categories: {
    on: boolean
    groupBy: string
    collapse: boolean
    collapseOther: boolean
    hideEmpty: boolean
  }
  sortBy: string
  sortDirection: string
  minHeight: string
}

export interface ColorsOptions {
  base?: string
  baseDefault?: string
  background?: string
  hover?: string | number
  selected?: string | number
  stroke?: string
  directory: string
  directorySearch: string
  detailsView: string
  popover: string
  tooltip: string
  status: any
  markers: any
  leftSidebar: string
  rightSidebar: string
  header: string
  footer: string
  modalFilters: string
  clusters: string
  clustersHover: string
  clustersText: string
  clustersBorders: string
  clustersHoverBorders: string
  clustersHoverText: string
}

/**
 * A set of options to control zoom
 */
export interface ZoomOptions {
  on: boolean
  limit: [number, number]
  delta: number
  buttons: {
    on: boolean
    location: string
  }
  mousewheel: boolean
  fingers: boolean
  hideSvg: boolean
  hideSvgZoomLevel: number
}

/**
 * A set of options to control scroll
 */
export interface ScrollOptions {
  on: boolean
  limit: boolean
  background: boolean
  spacebar: boolean
}

export interface TooltipsOptions {
  on: boolean
  position: string
  template: string
  maxWidth: number
  minWidth: number
}

export interface PopoversOptions {
  on: boolean
  position: string
  template: string
  centerOn: boolean
  width: string
  maxWidth: number
  maxHeight: number
  mobileFullscreen: boolean
  resetViewboxOnClose: boolean
}

export interface ChoroplethOptions {
  on?: boolean
  [key: string]: any
  source: string
  sourceField: string
  sourceFieldSelect: {
    on: boolean
    variants: Array<string>
  }
  bubbleMode: boolean
  bubbleSize: {
    min: number
    max: number
  }
  coloring: {
    mode: string
    noData: {
      color: "grey"
      description: "-"
    }
    gradient: {
      colors: {
        low: string
        high: string
        diffRGB: {
          r: number
          g: number
          b: number
          a: number
        }
        lowRGB: {
          r: number
          g: number
          b: number
          a: number
        }
        highRGB: {
          r: number
          g: number
          b: number
          a: number
        }
      }
      labels: {
        low: string
        high: string
      }
      values: {
        min: number
        max: number
        maxAdjusted: number
      }
    }
    palette: {
      colors: Array<{
        color: string
        valueFrom: number
        valueTo: number
        description: string
      }>
      outOfRange: {
        color: "grey"
        description: "-"
      }
    }
    legend: {
      on: boolean
      layout: string
      container: string
      title: string
      text: string
      description: string
      width: string
      height: string
    }
  }
}

export interface RegionOptionsCollection {
  [key: string]: RegionOptions
}

export type RegionOptions = {
  style?: Partial<CSSStyleDeclaration>
  selected?: boolean
  disabled?: boolean
}
