import { Controller } from "../Core/Controller"
import { googleMapLanguage, resolveGoogleMapStyles } from "./GoogleMapsOptions"
import { linkedPostRepository } from "./linkedPost"
import { onlySurfaceColorChanges, SURFACE_COLOR_KEYS } from "./surfaceColors"
import type { DirectoryModule } from "../Directory/DirectoryModule"
import { hasRuntimeFeature, availableFilterFields } from "../Core/productFeatures"
import { mobileToolbarPageNodes, projectMobileToolbarLayout, resolveMobileToolbarTargets, slotForNode, visibleMobileToolbar, type MobileToolbarTargets, type MobileToolbarView } from "../Layout/MobileToolbarLayout"
import { viewportLayoutBreakpoint, containerLayout } from "../Layout/ResponsiveLayout"
import { applyContainerBackground } from "../Layout/ContainerStyles"
import { applyStackChildLayout, applyStackContentLayout, filterLayoutPadding, setStackComponentOpen, stackComponentLayout } from "../Layout/StackLayout"
import { TypographyRuntime } from "../Core/TypographyRuntime"
import { DEFAULT_TYPOGRAPHY, type TypographyOptions } from "../Core/typography"
import { readPageBinding, initialBindingPageId, componentBindingRole, showComponentPagination, removeEmptyLegacySources, type BindingRole } from "./pageBindings"
/// <reference types="@types/google.maps" />
// import {} from "googlemaps";
import { createContextualChild } from "./loadAnotherMap"
import type { ShowAnotherMapModule, MapLoadTarget, AnotherMapAction, ChildMapContextProvider } from "./loadAnotherMap"
import { RegionDataRulesRuntime } from "../Region/dataRulesRuntime"
import { Legend } from "../Legend/Legend"
import { LayersControl } from "../Layers/LayersControl"
import { applyMapPresentationStyles, canRepaintNodeStyles, layersPresentation, mapPresentationSource } from "../Components/MapPresentation"
import { normalizeRegionDataRules, type RegionDataRules } from "../Region/dataRules"
import { markerRuleImage, markerImageUrl, type MarkerDataRules } from "../Marker/dataRules"
import { textElement } from "@/Core/textElement"
import tinycolor from "tinycolor2"
import { ArrayIndexed } from "../Core/ArrayIndexed"
import { EventWithData, Events } from "../Core/Events"

import { mapsvgCore } from "@/Core/Mapsvg"
import { ensureIconFontFace } from "@/Core/ensureIconFontFace"
import { ensureLoadingCriticalCss } from "@/Map/mapPreloader"

import {
  MiddlewareHandler,
  MiddlewareHandlers,
  MiddlewareList,
  MiddlewareType,
} from "@/Core/Middleware"
import utils, {
  compareVersions,
  debounce,
  deepMerge,
  env,
  fixColorHash,
  functionFromString,
  getMouseCoords,
  getNestedValue,
  isNumber,
  isPhone,
  isRemoteUrl,
  isTablet,
  sameDomain,
  splitObjectAndField,
  ucfirst,
} from "@/Core/Utils"
import { useRepository } from "@/Core/useRepository"
import { FormElementInterface } from "@/FormBuilder/FormElements"
import { SchemaEventType } from "@/Infrastructure/Server/Schema"
import { MapsvgRequest, Repository, RepositoryEvent } from "../Core/Repository"
import { ResizeSensor } from "../Core/ResizeSensor"
import { DetailsController } from "../Details/Details"
// START directory
import type { DirectoryController } from "../Directory/Directory"
// END
import { FiltersController } from "../Filters/Filters"
import { Query } from "../Infrastructure/Server/Query"
import { Schema } from "../Infrastructure/Server/Schema"
import { SchemaField } from "../Infrastructure/Server/SchemaField"
import { SchemaRepository } from "../Infrastructure/Server/SchemaRepository"
import {
  GeoPoint,
  GeoPointLiteral,
  Location,
  SVGPoint,
  SVGPointLiteral,
  ScreenPoint,
  isGeoPointLiteral,
  isSvgPointLiteral,
} from "../Location/Location"
import { MapObject, MapObjectEvent, MapObjectType } from "../MapObject/MapObject"
import { Marker } from "../Marker/Marker"
import { WorldCopies } from "../Marker/WorldCopies"
import type { MarkerCluster } from "../MarkerCluster/MarkerCluster"
import type { ClusteringModule } from "../MarkerCluster/ClusteringModule"
import { Model } from "../Model/Model"
import { PopoverController } from "../Popover/Popover"
import { Region } from "../Region/Region"
import { isSvgRegionElement } from "../Region/svgRegion"
import { Tooltip } from "../Tooltips/Tooltip"
import { Converter } from "./Converter"
import { ConfiguredEventHandlers } from "./configuredEventHandlers"
import { isKeyboardControlTarget } from "./keyboardTarget"
import {
  GalleryOptionsInterface,
  GroupOptionsInterface,
  LayersControlOptionsInterface,
  MapOptions,
  RegionOptionsCollection,
} from "./OptionsInterfaces/MapOptions"
import { ToolbarController } from "./Toolbar"
import { GeoViewBox, ViewBox } from "./ViewBox"
import {
  clampViewBoxToScrollBoundaries,
  viewBoxForZoomLevel,
} from "./clampViewBoxToScrollBoundaries"
import { DefaultOptions } from "./default-options"
import { concatTemplateCss } from "./templateCss"
import {
  getTemplateHtml,
  normalizeTemplateEntry,
  rewritePartialRefs,
  wrapTemplatePartialHtml,
  type TemplateEntry,
} from "./templateEntry"
import { inlineSvgUses } from "../WooCommerce/inlineSvgUses"
import {
  buildLayoutGridShell,
  mountLayoutSlotHosts,
  reconcileLayoutChildren,
  reconcileLayoutGridShell,
  pickLayoutGrid,
  type LayoutGridBreakpoint,
} from "../Layout/LayoutGridRuntime"
import { normalizeNodesOptions, type MapSvgNode } from "@/Components/NodesRegistry"
import { isMapInternalType, mapContentRoots } from "@/Components/MapChildren"
import {
  buildMapChromeShell,
  findReachableNodesByType,
  isNodeTypeReachable,
  isTreeLayoutMode,
  pickMapChromeGrid,
  resolveDirectoryLocation,
  resolveFiltersLocation,
  resolveModalMount,
  type ModalMountResolution,
} from "@/Components/NodesRuntime"
import { applyGroupsVisibility } from "./applySvgObjectVisibility"
import { getPinchScale } from "./getPinchScale"
import { forwardFirefoxPageScrollKey, lockFirefoxDocumentScroll, shouldResetFirefoxDocumentScroll } from "./firefoxPageScroll"
import {
  captureGoogleMapsViewport,
  hasVisibleMapSize,
  shouldSkipGoogleMapsResize,
  shouldSyncGoogleMapsOverlay,
} from "./googleMapsViewport"
import "./map.css"
import { getGalleryModule, type GalleryController } from "../Gallery/GalleryModule"

const $ = jQuery
let firefoxScrollHandlerId = 0

enum MapEventType {
  AFTER_INIT = "afterInit",
  BEFORE_INIT = "beforeInit",
  ZOOM = "zoom",
  AFTER_CHANGE_BOUNDS = "afterChangeBounds",
  RESIZE = "resize",
}

export type RegionStylesByStatus = {
  [key: string]: { selected: Region["style"]; hover: Region["style"]; default: Region["style"] }
}

export type RegionStylesByStatusOptions = {
  [key: string]: { selected?: Region["style"]; hover?: Region["style"]; default?: Region["style"] }
}

export type ZoomLevel = {
  zoomLevel: number
  viewBox: ViewBox
  _scale: number
}

/**
 * MapSVGMap class. Creates a new map inside of the given HTML container, which is typically a DIV element.
 *
 * The class constructor is available in the global varialbe, as `mapsvg.map`.
 *
 * Example usage:
 *
 * ```js
 * const map = new mapsvg.map("my-container-id", {
 *   id: "my-map",
 *   options: {
 *     source: "/path/to/map.svg",
 *     zoom: {on: true},
 *     scroll: {on: true}
 *   }
 * });
 *
 * // Get map instance by container ID
 * const map = mapsvg.getById("my-map");
 *
 * // Get map instance by index (in the order of creation)
 * const map_1 = mapsvg.get(0) // first map
 * const map_2 = mapsvg.get(1) // second map
 * ```
 */
export class MapSVGMap {
  private legacyApiSchemas: Partial<Record<BindingRole, any>> = {}
  activePageId: string
  private pageBindingKeys: Partial<Record<BindingRole, string>> = {}

  private pageRepositorySchema(role: BindingRole) {
    const legacyApi = this.legacyApiSchemas[role]
    if (legacyApi && ["getObjects", "getRegions"].includes(this.getPageBinding(role).queryId)) return legacyApi
    return { name: `page_binding_${role}`, type: role === "regions" ? "region" : "object",
      objectNameSingular: role === "regions" ? "region" : "object", objectNamePlural: role, fields: [] }
  }

  getPageBinding(role: BindingRole) { return readPageBinding(this.options, role, this.activePageId) }
  getComponentBindingRole(component: "directory" | "filters") { return componentBindingRole(this.options, component) }
  private componentSource(component: "directory" | "filters") { return this.getComponentBindingRole(component) === "regions" ? "regions" : "database" }
  setActivePage(pageId: string): void {
    if (this.activePageId === pageId) return
    if (!this.options.scenes?.some(page => page.id === pageId)) throw new Error("Page not found")
    this.activePageId = pageId
    this.refreshPageBindings()
    if (this.containersCreated) this.refreshTreeLayout()
  }
  setScenes(scenes: MapOptions["scenes"]): void {
    this.options.scenes = scenes
    this.refreshPageBindings()
  }
  refreshPageBindings(): void {
    if (!this.globalQueriesEnabled) return
    let changed = false
    for (const role of ["objects", "regions"] as const) {
      const repository = role === "objects" ? this.objectsRepository : this.regionsRepository
      if (!repository) continue
      const key = JSON.stringify([this.activePageId, this.getPageBinding(role)])
      if (key === this.pageBindingKeys[role]) continue
      changed = true
      this.pageBindingKeys[role] = key
      repository.invalidateReads(true)
      repository.setSchema?.(new Schema(this.pageRepositorySchema(role)))
      repository.query.resetFilters()
      repository.query.page = 1
      if (repository.loaded) { repository.objects.clear(); repository.reload({ initial: true }) }
    }
    if (!changed) return
    this.startDatabaseAutoRefetch()
    this.startRegionsAutoRefetch()
    if (this.controllers?.filters) this.setFilters()
    if (this.controllers?.directory) this.loadDirectory()
    if (this.containersCreated) this.setPagination()
  }

  private regionRulesRuntime = new RegionDataRulesRuntime()
  private legendView?: Legend
  private layersControlView?: LayersControl

  setRegionDataRules(rules?: RegionDataRules): void {
    if (rules) this.options.regionDataRules = normalizeRegionDataRules(deepMerge({}, this.options.regionDataRules, rules))
    else delete this.options.regionDataRules
    this.reloadAllRegionStyles()
    if (this.$gauge?.container) this.$gauge.container.toggle(!rules && !!this.options.choropleth?.on)
  }
  id: number
  setMarkerDataRules(rules?: MarkerDataRules): void {
    if (rules) this.options.markerDataRules = structuredClone(rules)
    else delete this.options.markerDataRules
    this.reloadMarkerImages()
  }
  reloadMarkerImages(): void {
    this.markers?.forEach(marker => {
      if (this.options.markerDataRules && marker.src === this.getMarkerImage(marker.object, marker.location)) return
      marker.setImage(undefined, true)
    })
  }
  version: string
  container: HTMLElement
  markerOptions: Record<string, unknown> = { src: mapsvgCore.routes.root + "markers/pin1_red.png" }
  middlewares: MiddlewareList
  controllerMiddleWare: MiddlewareHandler
  private previousPaddingBottom: number = 0
  converter: Converter
  private _counter: number = 0

  dirtyFields: string[] = []

  regions: ArrayIndexed<Region> = new ArrayIndexed("id")
  objects: ArrayIndexed<Model> = new ArrayIndexed("id")

  regionsRepository: Repository
  objectsRepository: Repository
  filtersRepository: Repository
  schemaRepository: SchemaRepository

  events: Events
  private configuredEventHandlers = new ConfiguredEventHandlers()

  resizeSensor: ResizeSensor

  liveCss: HTMLStyleElement
  templatesCss: HTMLStyleElement

  defaults: MapOptions
  options: MapOptions
  optionsDelta: { [key: string]: any }

  mapIsGeo: boolean
  drawMode: boolean = false
  geoCoordinates: boolean = false
  inBackend: boolean
  highlightedRegions: Array<Region> = []
  editRegions: { on: boolean } = { on: false }
  editMarkers: { on: boolean } = { on: false }
  clickAddsMarker: boolean
  editData: { on: boolean } = { on: false }
  disableLinks: boolean
  markerEditHandler: (location: Location) => void
  regionEditHandler: () => void
  objectClickedBeforeScroll: Region | Marker | MarkerCluster
  highlighted_marker: Marker

  googleMaps?: {
    loaded: boolean
    map: google.maps.Map
    zoomLimit?: boolean
    overlay?: any
    initialized: boolean
    maxZoomService?: google.maps.MaxZoomService
    currentMaxZoom?: number
    savedViewport?: {
      center: google.maps.LatLngLiteral
      zoom: number
    }
    needsViewportRestore?: boolean
  } = {
    loaded: false,
    initialized: false,
    map: null,
    zoomLimit: true,
    maxZoomService: null,
  }

  groups: ArrayIndexed<GroupOptionsInterface> = new ArrayIndexed("id", [], {
    autoId: true,
    unique: true,
  })

  galleries: ArrayIndexed<GalleryOptionsInterface>
  private galleryController?: GalleryController

  /** Lazy-loaded WooCommerce cart controller (only when options.woocommerce). */
  private wooCart?: import("../WooCommerce/WooCart").default
  private wooCartLoading?: Promise<void>

  svgDefault: {
    viewBox?: ViewBox
    geoViewBox?: GeoViewBox
    width?: number
    height?: number
  } = {}

  /**
   *  Current viewBox
   */
  viewBox: ViewBox = new ViewBox()
  /**
   *  Initial viewBox
   **/
  _viewBox: ViewBox = new ViewBox()
  /**
   * Width/height ratio
   */
  whRatio: {
    original: number
    current: number
  }
  /**
   * Geo ViewBiox, containing two geo-points: SW(lat,lng) and NE(lat,lng)
   */
  geoViewBox: GeoViewBox | null

  mapLonDelta: number
  mapLatBottomDegree: number

  /**
   * The list of all zoom levels, with viewBoxes
   */
  zoomLevels: ArrayIndexed<ZoomLevel>
  /**
   * Flag defining whether the map is zooming at the moment
   */
  isZooming: boolean
  touchZoomStart: boolean
  scaleDistStart: number
  scrollStarted: boolean

  isScrolling: boolean = false
  zoomDelta: number = 0
  vbStart: boolean

  /**
   * Current map scale relative to original size
   */
  scale: number = 1
  superScale: number

  private _prevTx: number
  private _prevTy: number
  private _prevScale: number

  /**
   * Scroll coordinates
   */
  scroll: {
    tx?: number
    ty?: number
    vxi?: number
    vyi?: number // initial viewbox when scrollning started
    x?: number
    y?: number // mouse coordinates when scrolling started
    dx?: number
    dy?: number // mouse delta
    vx?: number
    vy?: number // new viewbox x/y
    gx?: number
    gy?: number // for google maps scroll
    touchScrollStart: number
  } = {
    tx: 0,
    ty: 0,
    vxi: 0,
    vyi: 0, // initial viewbox when scrollning started
    x: 0,
    y: 0, // mouse coordinates when scrolling started
    dx: 0,
    dy: 0, // mouse delta
    vx: 0,
    vy: 0, // new viewbox x/y
    gx: 0,
    gy: 0, // for google maps scroll
    touchScrollStart: 0,
  }

  /**
   * Flag defining whether map needs to be downscaled or upscaled to prevent blurring on iOS devices
   */
  iosDownscaleFactor: number = 1

  /**
   * Map containers
   */
  containers: {
    root?: HTMLElement
    shadowRoot?: ShadowRoot
    /**
     * SVG image container
     */
    svg?: SVGSVGElement
    /**
     * SVG sizer
     */
    svgWrapper?: HTMLElement
    /**
     * Map container
     */
    map?: HTMLElement
    /**
     * Parent map container
     */
    mapContainer?: HTMLElement
    /**
     * Google Maps container
     */
    googleMaps?: HTMLElement
    /**
     * Scrolling container
     */
    scrollpane?: HTMLElement
    /**
     * Wrapper of scrolling container
     */
    scrollpaneWrap?: HTMLElement
    /**
     * Wrapper of map container
     */
    wrap?: HTMLElement
    /**
     * Main wrapper for all containers
     */
    wrapAll?: HTMLElement
    /**
     * Container for "Loading map..." message
     */
    loading?: HTMLElement
    /**
     * Directory container
     */
    directory?: HTMLElement
    /**
     * Filters container
     */
    filters?: HTMLElement
    /**
     * Details view container
     */
    detailsView?: HTMLElement
    /**
     * Popover container
     */
    popover?: HTMLElement
    /**
     * Tooltip container
     */
    tooltipRegion?: HTMLElement
    /**
     * Tooltip container
     */
    tooltipMarker?: HTMLElement
    /**
     * Tooltip container
     */
    tooltipCluster?: HTMLElement
    /**
     * Layers container
     */
    layers?: HTMLElement
    toolbar?: HTMLElement
    /**
     * Layers controls container
     */
    layersControl?: HTMLElement
    layersControlLabel?: HTMLElement
    layersControlList?: HTMLElement
    layersControlListNano?: HTMLElement
    pagerMap?: HTMLElement
    pagerDir?: HTMLElement
    leftSidebar?: HTMLElement
    rightSidebar?: HTMLElement
    header?: HTMLElement
    footer?: HTMLElement
    filterTags?: HTMLElement
    filtersModal?: HTMLElement
    clustersCss?: HTMLStyleElement
    clustersHoverCss?: HTMLStyleElement
    markersCss?: HTMLStyleElement
    controls?: HTMLElement
    zoomButtons?: HTMLElement
    /** CSS grid overlay hosting Layers + Controls chrome widgets */
    mapChromeGrid?: HTMLElement
    legend?: {
      title: HTMLElement
      text: HTMLElement
      coloring: HTMLElement
      description: HTMLElement
      container: HTMLElement
    }
    choroplethSourceSelect?: {
      container: HTMLElement
      select: HTMLElement
      options: Array<HTMLElement>
    }
  } = {}
  containersCreated: boolean = false
  private layoutPreviewBreakpoint: LayoutGridBreakpoint | null = null
  eventsBaseInitialized: boolean = false

  /**
   * Map controllers
   *
   * Example:
   * ```js
   * const { popover } = map.controllers
   * popover.show()
   * ```
   */
  controllers: {
    detailsView?: DetailsController
    popover?: PopoverController
    // START directory
    directory?: DirectoryController
    // REPLACE
    // directory?: {[key: string]: any}
    // END
    tooltips?: {
      cluster?: Tooltip
      marker?: Tooltip
      region?: Tooltip
    }
    filters?: FiltersController
    toolbar?: ToolbarController
  } = {}

  /**
   * Handlebars templates (for Details View, Popover, etc.)
   */
  templates: {
    [key: string]: any // returned by Handlebars.compile()
  }
  /**
   * Array of Markers
   *
   * Example:
   * ```js
   * map.markers.forEach(marker => marker.hide())
   * ```
   */
  markers: ArrayIndexed<Marker> = new ArrayIndexed("id", [], { unique: true })
  /**
   * Array of Marker clusters
   */
  markersClusters: ArrayIndexed<MarkerCluster> = new ArrayIndexed("id")
  /**
   * Flag indicating first data load
   */
  firstDataLoad: boolean
  /**
   * Sets of pre-calculated clusters for every zoom level
   */
  clustersFromWorker: Array<MarkerCluster>
  /**
   * An array of selected reion IDs
   */
  selected_id: Array<string> = []
  /**
   * A reference ot currently selected marker
   */
  selected_marker: Marker
  /**
   * Clusterizer worker
   */
  clusterizerWorker: Worker
  /**
   * Reference to a Marker currently edited (dragged)
   */
  editingMarker: Marker

  /**
   * Initial zoom level
   */
  initialZoomLevel: number

  /**
   * Schema for the map filters (set of fields and their parameters)
   */
  filtersSchema?: Schema | undefined

  layers: {
    [key: string]: HTMLElement
  } = {}
  controls: {
    zoom: HTMLElement
    userLocation: HTMLElement
    zoomReset: HTMLElement
    // START show_another_map
    previousMap?: HTMLElement
    // REPLACE
    // previousMap?: {[key: string]: any}
    // END
  }
  formBuilder: any

  tooltip: {
    posOriginal: { [key: string]: string }
    posShifted: { [key: string]: string }
    posShiftedPrev: { [key: string]: string }
    mirror: { [key: string]: number }
  }
  firefoxScroll: {
    insideIframe: boolean
    scrollX: number
    scrollY: number
    lockPageScroll?: boolean
    lockUntil?: number
  }
  private readonly firefoxScrollNamespace = ".mapsvg.firefoxScroll" + ++firefoxScrollHandlerId
  pointerOverMap: boolean = false
  canZoom: boolean
  eventsPreventList: { [key: string]: boolean } = {}
  googleMapsScript: HTMLScriptElement

  fitOnDataLoadDone: boolean
  fitDelta: number
  lastTimeFitWas: number
  userLocation: Location
  userLocationMarker: Marker
  setMarkersByField: boolean
  locationField: SchemaField
  popoverShowingFor: MapObject

  svgFileLastChanged: number

  changedFields: any
  changedSearch: any

  /* This property comes from v5 without any changes */
  $gauge: any

  /**
   * AfterLoad event can be blocked by:
   * 1. Loading Google API JS files
   * 2. Loading filters controller
   * When a blocker is introduced, it increases the number of afterLoadBlockers
   * when mapsvg.finalizeMapLoading is called, it checks if afterLoadBlockers = 0
   */
  afterLoadBlockers: number
  loaded: boolean
  svgFilePromise: Promise<void | Response>
  svgFileLoaded: boolean = false
  svgFileLoadedPromise: Promise<boolean>
  svgFileLoadedResolve: (value: boolean | PromiseLike<boolean>) => void
  mapDataPromise: Promise<void | Response>
  mapDataLoaded: boolean = false
  globalQueriesEnabled: boolean = false
  extras: {
    // Map options can be prefetched on start from an API endpoint
    prefetch?: boolean
    publishedVersionId?: number
    inBackend?: boolean
    resolvePrefetchedOptions?: (savedOptions: MapOptions) => MapOptions | undefined
    /** Runtime-only per-child transport/lifecycle; native code owns construction. */
    getChildMapContext?: ChildMapContextProvider
    [key: string]: any
  }

  private debouncedShowTooltip: (object: Marker | Region | MarkerCluster) => void

  // Touch event handlers for mobile scrolling
  private touchMoveHandler: (e: TouchEvent) => void
  private touchEndHandler: (e: TouchEvent) => void
  private touchActive = false
  private databaseAutoRefetchTimer: ReturnType<typeof setInterval> | null = null
  private regionsAutoRefetchTimer: ReturnType<typeof setInterval> | null = null
  /** Filters afterLoad blocker is currently reserved (must be released exactly once). */
  private filtersAfterLoadBlockerActive = false
  /**
   * Initializes a new instance of the Map class.
   *
   * @param container The ID or HTML element that will contain the map.
   * @param mapParams An object containing map parameters such as ID, options, SVG file last changed timestamp, and version.
   * @param params Additional parameters for the map, including options for prefetching and backend mode.
   */
  private directoryModule(): DirectoryModule | undefined {
    return window.MapSVG?.extensions?.get<DirectoryModule>("runtime.component", "directory")
  }
  private directoryServices() {
    const module = this.directoryModule()
    return { DirectoryController: module?.controller(Controller), utils, deepMerge, isTreeLayoutMode, resolveDirectoryLocation, isPhone, MiddlewareType, hasRuntimeFeature }
  }

  constructor(
    container: string | HTMLElement,
    mapParams: {
      id?: number
      options?: MapOptions
      svgFileLastChanged?: number | string
      version?: string
    },
    params: {
      // Map options can be prefetched on start from an API endpoint
      prefetch?: boolean
      /** Immutable published snapshot selected by this shortcode instance. */
      publishedVersionId?: number
      inBackend?: boolean
      /**
       * Optional admin/editor hook that can replace the saved server options
       * before MapSVG initializes. Used by persistent editor drafts so a draft
       * is restored before events/controllers are created, not patched on top
       * of an already initialized saved map.
       */
      resolvePrefetchedOptions?: (savedOptions: MapOptions) => MapOptions | undefined
      /** Runtime-only per-child transport/lifecycle; never serialized into settings. */
      getChildMapContext?: ChildMapContextProvider
      [key: string]: any
    } = {
      prefetch: true,
      inBackend: false,
    },
  ) {
    if (params) {
      this.extras = params
      this.inBackend = params.inBackend ?? false
    } else {
      this.extras = {}
    }
    if (!mapParams) {
      throw new Error(
        "To create a new map, you need to provide either SVG file URL or map ID and API url.",
      )
    }

    this.container = typeof container === "string" ? document.getElementById(container) : container
    this.id = mapParams.id
    this.svgFileLastChanged =
      typeof mapParams.svgFileLastChanged === "number"
        ? mapParams.svgFileLastChanged
        : Number(mapParams.svgFileLastChanged)
    this.events = new Events({
      context: this,
      contextName: "map",
      map: this,
    })
    this.options = <MapOptions>deepMerge(deepMerge({}, DefaultOptions, this.directoryModule()?.defaults ?? {}), mapParams.options)
    const normalizedNodes = normalizeNodesOptions(this.options as MapOptions & Record<string, any>)
    this.options.nodes = normalizedNodes.nodes
    this.options.scenes = normalizedNodes.scenes
    this.activePageId = initialBindingPageId(this.options)

    this.svgFileLoadedPromise = new Promise<boolean>((resolve, reject) => {
      this.svgFileLoadedResolve = resolve
    })

    this.setLoadingText(mapParams.options ? mapParams.options.loadingText || "" : "")
    ensureLoadingCriticalCss(document.head)
    this.addLoadingMessage()
    this.showLoadingMessage()

    this.middlewares = new MiddlewareList()

    // in constructor (or init):
    this.touchMoveHandler = this.touchMove.bind(this)
    this.touchEndHandler = this.touchEnd.bind(this)

    this.init()
  }

  loadSvgFile(svgFileUrl, svgFileLastChanged = 1): Promise<void | Response> {
    const load = () => fetch(svgFileUrl + "?version=" + (svgFileLastChanged || ""))
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 404) {
            const msg =
              "MapSVG couldn't load SVG file. Please check if the file exists: " +
              this.options.source +
              ". If the file exists, please contact support (this message is showing up only in wp-admin area)."
            throw Object.assign(new Error(msg), { status: response.status })
          } else if (response.status >= 500) {
            throw Object.assign(new Error(`MapSVG: SVG file loading error! status: ${response.status}`), { status: response.status })
          } else {
            throw Object.assign(new Error(`MapSVG: SVG file loading error! status: ${response.status}`), { status: response.status })
          }
        }
        return (await response.text()).trim()
      })
    this.svgFilePromise = Promise.resolve().then(() => this.extras.resolveSvgFile
      ? this.extras.resolveSvgFile(this.options.source, svgFileLastChanged, load)
      : load())
      .then(async (svgFileString) => {
        const parser = new DOMParser()
        const svgData = parser.parseFromString(svgFileString, "image/svg+xml")

        setTimeout(() => {
          this.renderSvgData(svgData)
          this.svgFileLoaded = true
          this.reloadRegions()

          // The initial map loading process is finished, remove the first afterLoad blocker
          this.decrementAfterloadBlockers()

          this.svgFileLoadedResolve(true)
        }, 500)
      })
      .catch((error) => {
        // Editor callers must be able to leave the loading state when an asset is unavailable.
        this.extras.onLoadError?.(error)
        // Handle network or HTTP error
        if (this.inBackend) {
          $.growl.error({ message: error, duration: 60000 })
        } else {
          console.error(
            "[CLIENT-001] MapSVG couldn't load SVG file — Read more: https://mapsvg.com/docs/errors#CLIENT-001",
          )
        }
      })
    return this.svgFilePromise
  }

  /**
   * Initialization. Map rendering happens here. Gets called on map creation.
   * @param {MapOptions} options - Map options
   * @param {HTMLElement} elem
   * @returns {*}
   * @private
   */
  init(): MapSVGMap {
    mapsvgCore.addInstance(this)

    // Set 3 blockers initially:
    // 1. SVG loading, initMap
    this.afterLoadBlockers = 2
    this.loaded = false

    // 2. Regions loading
    // 3. Objects loading
    this.afterLoadBlockers += this.extras.prefetch ? 2 : 0

    // this.setEvents(this.options.events)
    const { filters, ...restOptions } = this.options
    // this.update(restOptions)

    this.setEventHandlers()

    if (!this.id || this.extras.prefetch === false) {
      // Set beforeLoad event and then trigger it, before applying the options
      this.events.trigger(MapEventType.BEFORE_INIT, { options: this.options })

      this.createContainers()
      const svgFileUrl =
        isRemoteUrl(this.options.source) && !sameDomain(this.options.source, mapsvgCore.routes.home)
          ? mapsvgCore.routes.api + `maps/${this.id}/svg`
          : this.urlToRelativePath(this.options.source)
      this.loadSvgFile(svgFileUrl, this.svgFileLastChanged).then(async () => {
        await this.svgFileLoadedPromise
        this.loadMockRegions()
      })
      this.updateOutdatedOptions({
        version: this.version || "1.0.0",
        options: this.options,
      })
        .then(({ version, options }) => {
          this.version = version
          this.initMap(options)
        })
        .catch((error) => {
          console.error(
            "[CLIENT-002] Failed to update options — Read more: https://mapsvg.com/docs/errors#CLIENT-002",
            error,
          )
          // Handle the error, maybe with a fallback or notification
        })
    } else {
      const dataTypes = []

      const withData =
        this.options?.database?.loadOnStart === true || this.inBackend
          ? "objects,regions"
          : "regions"
      // If map options are not specified then fetch them from the server
      // Build the base URL for the map data endpoint
      const baseUrl = mapsvgCore.routes.api + `maps/${this.id}`
      const separator = baseUrl.includes("?") ? "&" : "?"
      const orphanParam = this.inBackend ? "&includeOrphans=1" : ""
      const previewParams = new URLSearchParams(window.location.search)
      const previewQuery = new URLSearchParams()
      if (!this.inBackend && Number(previewParams.get("mapsvg_preview_app")) === this.id) {
        for (const key of ["mapsvg_preview_app", "mapsvg_preview_draft", "mapsvg_preview_nonce"]) {
          const value = previewParams.get(key)
          if (value) previewQuery.set(key, value)
        }
        // WP REST cookie auth requires its own nonce in addition to the user/App-bound preview nonce.
        previewQuery.set("_wpnonce", mapsvgCore.nonce)
      }
      const versionQuery = !this.inBackend && this.extras.publishedVersionId !== undefined ? `&mapsvg_version=${encodeURIComponent(String(this.extras.publishedVersionId))}` : ""
      const url = `${baseUrl}${separator}withData=${withData}${orphanParam}${versionQuery}${previewQuery.size ? "&" + previewQuery.toString() : ""}`
      const editorRead = this.extras.fallbackMapData ? new AbortController() : undefined
      const readTimeout = editorRead ? setTimeout(() => editorRead.abort(), 8000) : undefined
      this.mapDataPromise = (this.extras.fetchMapData ?? fetch)(url, editorRead ? { signal: editorRead.signal } : undefined)
        .then(async (response) => {
          if (!response.ok) {
            // Handle HTTP error
            throw Object.assign(new Error(`HTTP error! status: ${response.status}`), { status: response.status })
          }
          return await response.json()
        })
        .finally(() => { if (readTimeout !== undefined) clearTimeout(readTimeout) })
        .catch(error => {
          if (this.extras.fallbackMapData) return this.extras.fallbackMapData(error)
          throw error
        })
        .then(async (res) => {
          if (res.offlineCached === true) this.extras.offline = true
          const mapData = res.map
          this.globalQueriesEnabled = res.globalQueriesEnabled === true
          this.version = mapData.version
          this.svgFileLastChanged = mapData.svgFileLastChanged

          const resolvedPrefetchedOptions =
            this.extras.resolvePrefetchedOptions?.(mapData.options)

          if (resolvedPrefetchedOptions) {
            // The resolver returns a complete canonical options snapshot.
            // Rebuild from defaults + snapshot so keys removed in the draft do
            // not survive from the saved server object through deep-merge.
            this.options = <MapOptions>deepMerge(
              deepMerge({}, DefaultOptions, this.directoryModule()?.defaults ?? {}),
              resolvedPrefetchedOptions,
            )
          } else {
            deepMerge(this.options, mapData.options)
          }

          // Constructor normalization uses default options before the server
          // responds. Do not mistake those provisional nodes for a saved tree
          // when opening a legacy map with no nodes/scenes in its payload.
          const canonicalPrefetchedOptions =
            resolvedPrefetchedOptions || mapData.options
          if (!Array.isArray(canonicalPrefetchedOptions?.nodes)) this.options.nodes = []
          if (!Array.isArray(canonicalPrefetchedOptions?.scenes)) this.options.scenes = []
          const normalizedNodes = normalizeNodesOptions(this.options as MapOptions & Record<string, any>)
          this.options.nodes = normalizedNodes.nodes
          this.options.scenes = normalizedNodes.scenes
          this.activePageId = initialBindingPageId(this.options)

          // Convert options.regions to an object if it's an array
          if (Array.isArray(this.options.regions)) {
            const regionsObject = {} as RegionOptionsCollection
            this.options.regions.forEach((region, index) => {
              if (typeof index === "string") {
                regionsObject[index] = region
              }
            })
            this.options.regions = regionsObject
          }

          if (Array.isArray(this.options.regionStatuses)) {
            const regionStatusesObject = {} as Record<
              string,
              { label: string; value: string; disabled: boolean; color: string }
            >
            this.options.regionStatuses.forEach((status, index) => {
              regionStatusesObject[index] = status
            })
            this.options.regionStatuses = regionStatusesObject
          }

          // Load SVG File
          this.setRegionPrefix(this.options.regionPrefix || "")
          this.setLoadingText(this.options.loadingText || "")
          // Set beforeLoad event and then trigger it, before applying the options
          if (
            this.events &&
            this.options &&
            this.options.events &&
            this.options.events.beforeInit
          ) {
            this.setEvents({ beforeInit: this.options.events.beforeInit })
          }
          // Set beforeLoad event and then trigger it, before applying the options
          this.events.trigger(MapEventType.BEFORE_INIT, { options: this.options })
          this.createContainers()
          const svgFileUrl =
            isRemoteUrl(this.options.source) &&
            !sameDomain(this.options.source, mapsvgCore.routes.home)
              ? // proxy SVG file loading if it's on another domain
                mapsvgCore.routes.api + `maps/${this.id}/svg` + (versionQuery ? `?${versionQuery.slice(1)}` : "")
              : // otherwise load the file directly
                this.urlToRelativePath(this.options.source)
          this.loadSvgFile(svgFileUrl, this.svgFileLastChanged)

          // Need to await loading viewBox and geoViewBox from SVG file, to be able to add locations from repo.loadDataFromResponse()
          // React can replace a published v8 bootstrap with a v9 draft before
          // pageBindings exists on the response. Keep its API transport schema;
          // pageRepositorySchema selects it only for the retained built-in alias.
          for (const role of ["objects", "regions"] as const) {
            if (res[role]?.schema?.type === "api") this.legacyApiSchemas[role] = res[role].schema
          }
          await this.initMap(this.options)
          if (res.offlineCached === true) this.loadMockRegions()
          // Load Regions. When an editor draft replaced the saved options,
          // the prefetched rows belong to the saved table/schema and must not
          // be injected into repositories created from the draft bindings.
          if (resolvedPrefetchedOptions || res.pageBindings) {
            if (!this.extras.offline && this.id && (this.globalQueriesEnabled || this.options.database.regionsTableName || this.options.database.schemas?.regions?.name)) {
              this.regionsRepository.events.once(RepositoryEvent.AFTER_LOAD, () => {
                this.decrementAfterloadBlockers()
              })
              this.regionsRepository.find(undefined, { initial: true })
            } else {
              this.decrementAfterloadBlockers()
            }
          } else if (!res.regions && this.id && (this.options.database.regionsTableName || this.options.database.schemas?.regions?.name)) {
            this.regionsRepository.events.once(RepositoryEvent.AFTER_LOAD, () => {
              this.decrementAfterloadBlockers()
            })
          } else {
            if (res.regions) {
              this.regionsRepository.events.once(RepositoryEvent.AFTER_LOAD, () => {
                this.decrementAfterloadBlockers()
              })
              const request: MapsvgRequest = {
                repository: this.regionsRepository,
                url: this.regionsRepository.getApiEndpoint("index").url || "",
                action: "index",
                method: "GET",
              }
              const { schema: regSchema, ...regionsRest } = res.regions
              this.regionsRepository.schema.update(regSchema)
              this.regionsRepository.loadDataFromResponse(regionsRest, {
                request,
                response: { data: regionsRest },
              })
            } else {
              this.decrementAfterloadBlockers()
            }
          }

          // Load objects. See Regions above: a resolved draft may point to a
          // different table/schema, so bypass saved prefetched rows.
          if (resolvedPrefetchedOptions || res.pageBindings) {
            if (
              !this.extras.offline && (this.globalQueriesEnabled || this.options.database.objectsTableName || this.options.database.schemas?.objects?.name) &&
              (this.globalQueriesEnabled || this.inBackend || this.options.database.loadOnStart)
            ) {
              this.objectsRepository.events.once(RepositoryEvent.AFTER_LOAD, () => {
                this.decrementAfterloadBlockers()
              })
              this.objectsRepository.find(undefined, { initial: true })
            } else {
              this.decrementAfterloadBlockers()
            }
          } else if (!res.objects && this.id && mapData.options.database.objectsTableName) {
            if (mapData.options.database.loadOnStart) {
              this.objectsRepository.events.once(RepositoryEvent.AFTER_LOAD, () => {
                this.decrementAfterloadBlockers()
              })
            } else {
              this.decrementAfterloadBlockers()
            }
          } else {
            if (res.objects && (this.inBackend || mapData.options.database.loadOnStart)) {
              this.objectsRepository.events.once(RepositoryEvent.AFTER_LOAD, () => {
                this.decrementAfterloadBlockers()
              })
              const request: MapsvgRequest = {
                repository: this.objectsRepository,
                url: this.objectsRepository.getApiEndpoint("index").url || "",
                action: "index",
                method: "GET",
              }
              const { schema: objectsSchema, ...objectsRest } = res.objects
              this.objectsRepository.schema.update(objectsSchema)
              if (this.objectsRepository.schema.type === "api") {
                this.objectsRepository.find()
              } else {
                this.objectsRepository.loadDataFromResponse(objectsRest, {
                  request,
                  response: { data: objectsRest },
                })
              }
            } else {
              this.decrementAfterloadBlockers()
            }
          }
        })
        .catch((error) => {
          this.extras.onLoadError?.(error)
          // Handle network or HTTP error
          console.error(
            "[CLIENT-003] Fetch error — Read more: https://mapsvg.com/docs/errors#CLIENT-003",
            error,
          )
        })
    }

    // Initialize the debounced function
    this.debouncedShowTooltip = debounce((object: Marker | Region | MarkerCluster) => {
      this.showTooltip(object)
    }, 20)

    return this
  }

  async initMap(_options: MapOptions, data?: any) {
    const { data_regions, data_objects, events, middlewares, ...restOptions } = _options
    let options = restOptions

    if (events) {
      this.setEvents(events, true)
    }
    const { mapLoad, ...restMiddlewares } = middlewares
    if (mapLoad) {
      //@ts-expect-error
      this.setMiddlewares({ mapLoad }, true)
    }

    options = this.middlewares.run(MiddlewareType.MAP_LOAD, [options, { map: this }])

    this.regionsRepository = useRepository(this.globalQueriesEnabled ? this.pageRepositorySchema("regions") as any : options.database.schemas.regions, this)
    this.regionsRepository.init()
    // Turn off pagination for Regions:
    this.regionsRepository.query.update({ perpage: 0 })
    // Admin editor: keep orphaned region rows so users can copy data to new SVG IDs.
    if (this.inBackend) {
      this.regionsRepository.query.update({ filters: { includeOrphans: 1 } })
    }

    this.objectsRepository = useRepository(this.globalQueriesEnabled ? this.pageRepositorySchema("objects") as any : options.database.schemas.objects, this)
    this.objectsRepository.init()
    this.objectsRepository.query.update({
      perpage: options.database.pagination.on ? options.database.pagination.perpage : 0,
    })

    //@ts-expect-error
    this.setMiddlewares(restMiddlewares, true)
    this.setRepositoryEvents()

    this.mapDataLoaded = true

    await this.svgFileLoadedPromise

    options = <MapOptions>deepMerge({}, this.svgDefault, options)

    const { viewBox, width, height, responsive, ...restNewOptions } = options

    // Initial Size

    const size = {
      width: Number(width) || this.viewBox.width || this.svgDefault.width,
      height: Number(height) || this.viewBox.height || this.svgDefault.height,
      responsive,
    }
    this.setSvgTagViewBox(this.svgDefault.viewBox)
    this.setSize(size.width, size.height, size.responsive)

    const initialViewBox =
      viewBox && viewBox.length > 0 ? new ViewBox(viewBox) : this.svgDefault.viewBox
    this.setInitialViewBox(initialViewBox)

    this.setWhRatio(initialViewBox.width / initialViewBox.height)
    this.setViewBox(initialViewBox)
    this.initialZoomLevel = this.zoomLevel

    // Set converter
    this.converter = new Converter(this)
    if (this.geoViewBox) {
      this.converter.setGeoViewBox(this.geoViewBox)
    }

    // Apply map options
    this.update(restNewOptions)

    // 4. Google maps API blocker?
    if (!this.extras.offline && this.isGeo() && this.options.googleMaps.on) {
      this.afterLoadBlockers++
    }

    // 5. Filters may block loading too because they load remote HTML templates.
    // Only reserve a blocker when the filters node is reachable (draw rule).
    if (!this.extras.offline && this.filtersShouldBeShown() && isNodeTypeReachable(this.options, "filters")) {
      this.afterLoadBlockers++
      this.filtersAfterLoadBlockerActive = true
    }

    this.setGalleries(this.options.galleries ?? [])

    if (
      this.isGeo() &&
      mapsvgCore.googleMaps.apiKey &&
      (this.inBackend ||
        this.options.googleMaps.on ||
        (this.options.filters.on &&
          this.options.filtersSchema &&
          this.options.filtersSchema.find((f) => f.type === "distance")))
    ) {
      this.loadGoogleMapsAPI(
        () => {
          return 1
        },
        () => {
          return 1
        },
      )
    }

    if (this.options.colors && this.options.colors.background) {
      this.containers.map.style.background = this.options.colors.background
    }
    this.decrementAfterloadBlockers()
  }

  loadMockRegions() {
    const request: MapsvgRequest = {
      repository: this.regionsRepository,
      url: this.regionsRepository.getApiEndpoint("index").url || "",
      action: "index",
      method: "GET",
    }

    const data = {
      items: this.regions.map((region) => ({ id: region.id, title: region.title })),
      schema: {
        fields: [
          { type: "id", name: "id" },
          { type: "text", name: "title" },
        ],
      },
      hasMore: false,
      page: 1,
      perpage: 0,
    }

    this.regionsRepository.loadDataFromResponse(data, {
      request,
      response: { data },
    })
  }

  /**
   * Return relative path part of the URL
   * @param {string} url
   * @returns string
   * @private
   */
  urlToRelativePath(url: string): string {
    if (url.indexOf("//") === 0) url = url.replace(/^\/\/[^/]+/, "").replace("//", "/")
    else url = url.replace(/^.*:\/\/[^/]+/, "").replace("//", "/")
    return url
  }

  /**
   * Sets visiblity switches for groups of SVG objects
   * @private
   */
  setGroups(groups?: GroupOptionsInterface[]): void {
    if (groups) {
      this.groups.clear()
      // Empty the old array
      this.groups.push(...groups)
      this.options.groups = this.groups
    }

    applyGroupsVisibility(this.containers.svg, this.groups)
    if (this.layersControlView) this.setLayersControl()
  }

  /**
   * Returns the list of options for visibility settings in admin.js
   */
  getGroupSelectOptions(): any[] {
    const optionGroups = []
    const options = []
    const options2 = []

    $(this.containers.svg)
      .find("g")
      .each(function (index) {
        const id = $(this)[0].getAttribute("id")
        if (id) {
          const title = $(this)[0].getAttribute("title") || ""
          options.push({ label: title || id, value: id })
        }
      })
    optionGroups.push({ title: "SVG Layers / Groups", options: options })

    $(this.containers.svg)
      .find("path,ellipse,circle,polyline,polygon,rectangle,img,text")
      .each(function (index) {
        const id = $(this)[0].getAttribute("id")
        if (id) {
          const title = $(this)[0].getAttribute("title")
          options2.push({ label: title || id, value: id })
        }
      })
    optionGroups.push({ title: "Other SVG objects", options: options2 })

    return optionGroups
  }

  /**
   * Sets visibility switches
   * @param {object} options - Options
   * @private
   */
  setLayersControl(options?: LayersControlOptionsInterface): void {
    if (options) deepMerge(this.options.layersControl, options)
    const node = this.mapPresentationNode("layers")
    const viewOptions = layersPresentation(this.options.layersControl, node)
    const mount = node && this.mapPresentationMount(node)
    if (!node || !viewOptions.on || !mount) {
      if (this.containers.layersControl) this.containers.layersControl.style.display = "none"
      return
    }
    if (!this.layersControlView) {
      this.layersControlView = new LayersControl(this.eventDocument || this.containers.map.ownerDocument)
      Object.assign(this.containers, {
        layersControl: this.layersControlView.element,
        layersControlLabel: this.layersControlView.label,
        layersControlListNano: this.layersControlView.listNano,
        layersControlList: this.layersControlView.list,
      })
    }
    this.layersControlView.update(viewOptions, Array.from(this.groups || this.options.groups || []), (id, visible) => {
      this.groups.forEach(group => { if (String(group.id) === String(id)) group.visible = visible })
      this.setGroups()
    })
    const element = this.containers.layersControl
    element.style.display = mount.inline ? "block" : "flex"
    // Tree Layout owns size constraints. Legacy chrome limits must not cap its view.
    element.style.maxHeight = mount.inline ? viewOptions.maxHeight || "" : ""
    element.classList.toggle("mapsvg-layers-slotted", !mount.inline)
    element.classList.remove("mapsvg-top-left", "mapsvg-top-right", "mapsvg-bottom-left", "mapsvg-bottom-right")
    if (mount.inline) {
      this.applyMapChromeShell()
      this.mountChromeWidget("layers", element)
      element.dataset.mapsvgNodeId = node.id
      if (!this.getChromeSlot("layers")) element.classList.add("mapsvg-" + viewOptions.position)
    } else {
      element.removeAttribute("data-mapsvg-node-id")
      element.style.position = "relative"
      element.style.left = element.style.right = element.style.top = element.style.bottom = ""
      if (element.parentElement !== mount.host) mount.host.append(element)
    }
    applyMapPresentationStyles(element, node, mount.inline ? undefined : mount.host)
  }

  private mapPresentationNode(type: "legend" | "layers"): MapSvgNode | undefined {
    const nodes = mobileToolbarPageNodes(Array.from(this.options.nodes || []), Array.from(this.options.scenes || []), this.activePageId) as MapSvgNode[]
    const node = findReachableNodesByType(this.options, type).find(item => nodes.some(candidate => candidate.id === item.id))
    if (!node) return undefined
    return mapPresentationSource(nodes, node) ? node : undefined
  }

  private mapPresentationMount(node: MapSvgNode): { host: HTMLElement; inline: boolean } | undefined {
    const tree = isTreeLayoutMode(this.options)
    if (tree && this.containersCreated && !this.activeTreeNodeIds.has(node.id)) return undefined
    const inline = !tree
    const host = inline ? this.containers.map : this.layoutNodeHosts.get(node.id)
    return host ? { host, inline } : undefined
  }

  private syncLegend(): void {
    const model = this.regionRulesRuntime?.legendModel
    const node = this.mapPresentationNode("legend")
    const mount = node && this.mapPresentationMount(node)
    const enabled = node?.settings?.on ?? this.options.regionDataRules?.legend?.on
    if (!model || !node || !mount || !enabled) { this.legendView?.element.remove(); return }
    this.legendView ??= new Legend(this.eventDocument || mount.host.ownerDocument)
    this.legendView.update(model, typeof node.settings?.title === "string" ? node.settings.title : model.title)
    const element = this.legendView.element
    element.classList.toggle("mapsvg-legend-inline", mount.inline)
    if (mount.inline) element.dataset.mapsvgNodeId = node.id
    else element.removeAttribute("data-mapsvg-node-id")
    if (element.parentElement !== mount.host) mount.host.append(element)
    applyMapPresentationStyles(element, node, mount.inline ? undefined : mount.host)
  }

  loadDataObjects(params?: any): JQueryDeferred<any> {
    return this.objectsRepository.find(params)
  }

  /**
   * Loads items from a source defined in settings  to the directory. The source can be "Regions" or "Database".
   */
  loadItemsToDirectory() { return this.directoryModule()?.loadItemsToDirectory.call(this, this.directoryServices()) }

  /**
   * Filter out directory items
   */
  directoryFilterOut(items) { return this.directoryModule()?.directoryFilterOut.call(this, this.directoryServices(), items) ?? items }

  loadDirectory(): void {
    this.directoryModule()?.loadDirectory.call(this, this.directoryServices())
    this.setPagination()
  }

  /**
   * Adds pagination controls to the map and/or directory
   */
  setPagination() {
    this.containers.pagerMap && $(this.containers.pagerMap).empty().remove()
    this.containers.pagerDir && $(this.containers.pagerDir).empty().remove()

    const paginationMap = showComponentPagination(this.options, "map", this.activePageId)
    const paginationDir = showComponentPagination(this.options, "directory", this.activePageId)

    const paginationInDirectoryEnabled =
      paginationDir &&
      this.controllers.directory &&
      (hasRuntimeFeature("directory") && this.options.menu.on)

    const paginationForDirectory = paginationInDirectoryEnabled ? this.getPagination() : null
    if (this.controllers.directory) {
      this.controllers.directory?.setPagination(paginationForDirectory)
    }

    const paginationInMapEnabled = paginationMap
    this.containers.pagerMap = paginationInMapEnabled ? this.getPagination() : null
    if (this.containers.pagerMap) {
      this.containers.map.appendChild(this.containers.pagerMap)
    }
  }
  setShowPagination(on: boolean): void {
    this.options.showPagination = on
    this.setPagination()
  }
  /**
   * Generates HTML with pagination buttons and attaches callback event on button click
   * @param {function} callback - Callback function that should be called on click on a next/prev page button
   */
  getPagination(callback?: () => void): HTMLElement {
    const _this = this
    const repository = this.globalQueriesEnabled && this.getComponentBindingRole("directory") === "regions" ? this.regionsRepository : this.objectsRepository
    const paginationSettings = this.globalQueriesEnabled ? this.getPageBinding(this.getComponentBindingRole("directory")).pagination : this.options.database.pagination
    const perpage = this.globalQueriesEnabled ? repository?.query?.perpage ?? paginationSettings.perpage : paginationSettings.perpage

    // pager && (pager.empty().remove());
    const nav = textElement("nav", "mapsvg-pagination")
    const list = textElement("ul", "pager")
    for (const direction of ["prev", "next"]) {
      const item = textElement("li", "mapsvg-" + direction)
      const options = paginationSettings
      const label =
        direction === "prev"
          ? `← ${options.prev ?? ""} ${perpage}`
          : `${options.next ?? ""} ${perpage} →`
      const link = textElement("a", "", label)
      link.setAttribute("href", "#")
      item.appendChild(link)
      list.appendChild(item)
    }
    nav.appendChild(list)
    const pager = $(nav)

    if (!repository) {
      return pager[0]
    }

    if (repository.onFirstPage() && repository.onLastPage()) {
      pager.hide()
    } else {
      pager.find(".mapsvg-prev").removeClass("disabled")
      pager.find(".mapsvg-first").removeClass("disabled")
      pager.find(".mapsvg-last").removeClass("disabled")
      pager.find(".mapsvg-next").removeClass("disabled")

      repository.onLastPage() &&
        pager.find(".mapsvg-next").addClass("disabled") &&
        pager.find(".mapsvg-last").addClass("disabled")

      repository.onFirstPage() &&
        pager.find(".mapsvg-prev").addClass("disabled") &&
        pager.find(".mapsvg-first").addClass("disabled")
    }

    pager
      .on("click", ".mapsvg-next:not(.disabled)", (e) => {
        e.preventDefault()
        if (repository.onLastPage()) return
        const query = { page: repository.query.page + 1 }
        repository.find(query).done(function () {
          callback && callback()
        })
      })
      .on("click", ".mapsvg-prev:not(.disabled)", function (e) {
        e.preventDefault()
        if (repository.onFirstPage()) return
        const query = { page: repository.query.page - 1 }
        repository.find(query).done(function () {
          callback && callback()
        })
      })
      .on("click", ".mapsvg-first:not(.disabled)", function (e) {
        e.preventDefault()
        if (repository.onFirstPage()) return
        const query = { page: 1 }
        repository.find(query).done(function () {
          callback && callback()
        })
      })
      .on("click", ".mapsvg-last:not(.disabled)", function (e) {
        e.preventDefault()
        if (repository.onLastPage()) return
        const query = { lastpage: true }
        repository.find(query).done(function () {
          callback && callback()
        })
      })

    return pager[0]
  }

  /**
   * Delete all markers
   */
  deleteMarkers() {
    while (this.markers.length) {
      this.markerDelete(this.markers[0])
    }
  }

  /**
   * Delete all clusters from the map
   */
  private clusteringModule(): ClusteringModule | undefined {
    return window.MapSVG?.extensions?.get<ClusteringModule>("runtime.component", "clustering")
  }

  private clusteringServices() {
    return { MapObject, MapObjectType, SVGPoint, ScreenPoint, ViewBox, MapEventType, WorldCopies }
  }

  deleteClusters(): void {
    return this.clusteringModule()?.deleteClusters.call(this, this.clusteringServices())
  }

  /**
   * Add locations by provided set of objects, containing location field with lat/lng coordinates
   * @private
   */
  addLocation(object: Model): void {
    let locationField = this.objectsRepository.getSchema().getFieldByType("location")
    if (!locationField) {
      return
    }
    locationField = locationField.name

    if (locationField) {
      if (this.firstDataLoad) {
        this.setMarkerImagesDependency()
      }

      const location: Location = object[locationField]

      if (location.img && (location.geoPoint || location.svgPoint)) {
        const marker = new Marker({
          location,
          object,
          mapsvg: this,
        })
        this.markerAdd(marker)
      }
    }
  }
  /**
   * Stores a set of markers/clusters for a certain zoom level for later use.
   * This method gets called by a worker thread that calculates markers/clusters for all zoom levels.
   * @param zoomLevel
   * @param clusters
   * @private
   * @ignore
   */
  addClustersFromWorker(clusters): void {
    return this.clusteringModule()?.addClustersFromWorker.call(this, this.clusteringServices(), clusters)
  }
  /**
   * Starts clusterizer worker in a separate thread
   * @private
   */
  async startClusterizer(): Promise<void | boolean> {
    return this.clusteringModule()?.startClusterizer.call(this, this.clusteringServices())
  }
  /**
   * Starts clustering markers on the map
   * @property {boolean} skipFitMarkers - Don't do "fit markers" action. Used to prevent fitting markers
   * on changinh zoom level.
   * @private
   */
  clusterizeMarkers(skipFitMarkers?: boolean): void {
    return this.clusteringModule()?.clusterizeMarkers.call(this, this.clusteringServices(), skipFitMarkers)
  }
  /**
   * Returns URL of the mapsvg.css file
   * @returns {string} URL
   * @private
   */
  getCssUrl(): string {
    return mapsvgCore.routes.root + "css/mapsvg.css"
  }
  /**
   * Checks if the map is geo-calibrated
   * @returns {boolean}
   */
  isGeo(): boolean {
    return this.mapIsGeo
  }

  /**
   * Returns map options.
   * @param {bool} forTemplate - If options should be formatted for use in a template
   * @param {bool} forWeb - If options should be formatted for use in the web
   * @returns {object}
   */
  getOptions(forTemplate: boolean, forWeb: boolean) {
    const options = <MapOptions>deepMerge({}, this.options)

    function clearEmpties(o) {
      for (const k in o) {
        if (!o[k] || typeof o[k] !== "object") {
          continue
        }

        clearEmpties(o[k])
        if (Object.keys(o[k]).length === 0) {
          delete o[k]
        }
      }
    }

    clearEmpties(options.regions)

    deepMerge(options, this.optionsDelta)

    options.viewBox = this._viewBox.toArray()
    if (this.filtersSchema) {
      options.filtersSchema = this.filtersSchema.getFields()
      if (options.filtersSchema.length > 0) {
        options.filtersSchema.forEach((field) => {
          if (field.type === "distance") {
            field.value = ""
          }
        })
      }
    }

    // @ts-ignore - old options field from MapSVG versions <5.x
    delete options.markers

    if (forTemplate) {
      // @ts-ignore - may this needs to be removed?
      options.svgFilename = options.source.split("/").pop()
      // @ts-ignore - may this needs to be removed?
      options.svgFiles = mapsvgCore.svgFiles
    }

    if (forWeb)
      $.each(options, (key, val) => {
        if (JSON.stringify(val) == JSON.stringify(this.defaults[key])) delete options[key]
      })

    if (this.globalQueriesEnabled) removeEmptyLegacySources(options)
    return options
  }

  /** Read effective runtime settings without changing the authoring document. */
  getRuntimeOptions(): Record<string, unknown> {
    return { ...this.getOptions(false, false), viewBox: this.viewBox.toArray() }
  }

  /**
   * Restore delta options, used by MapSVG-Admin
   * @private
   * @ignore
   */
  restoreDeltaOptions(): void {
    this.update(this.optionsDelta)
    this.optionsDelta = {}
  }

  setMiddlewares(
    functions: { [K in MiddlewareType]: string | MiddlewareHandlers[K] },
    unique = false,
  ): void {
    if (!hasRuntimeFeature("javascript")) {
      deepMerge(this.options.middlewares, functions)
      return
    }
    let compiledFunction

    for (const eventName in functions) {
      if (typeof functions[eventName] === "string") {
        compiledFunction =
          functions[eventName] != "" ? functionFromString(<string>functions[eventName]) : null
        if (
          !compiledFunction ||
          compiledFunction.error ||
          compiledFunction instanceof TypeError ||
          compiledFunction instanceof SyntaxError
        ) {
          continue
        }
      } else if (typeof functions[eventName] === "function") {
        compiledFunction = functions[eventName]
      }

      // Set new middleware
      this.setMiddleware(eventName as MiddlewareType, compiledFunction, unique)
    }

    deepMerge(this.options.middlewares, functions)
  }

  setMiddleware<T extends MiddlewareType>(name: T, handler: MiddlewareHandlers[T], unique = false) {
    this.middlewares.add(name, handler, unique)
    switch (name) {
      case MiddlewareType.REQUEST:
      case MiddlewareType.RESPONSE: {
        if (this.objectsRepository) {
          this.objectsRepository.middlewares.add(name, handler, unique)
        }
        if (this.regionsRepository) {
          this.regionsRepository.middlewares.add(name, handler, unique)
        }
        break
      }
      default:
        break
    }
  }

  /**
   * Sets event handlers
   * @param {object} functions Object containing the event handlers: `{eventName: callback, eventName2: callback}`
   */
  setEvents(functions: { [key: string]: string }, unique?: boolean) {
    if (!hasRuntimeFeature("javascript")) {
      deepMerge(this.options.events, functions)
      return
    }
    this.configuredEventHandlers.apply(
      functions,
      unique ?? false,
      functionFromString,
      this.events,
      this.controllers?.directory?.events,
    )
    deepMerge(this.options.events, functions)
  }
  /**
   * Sets map actions that should be performed on Region click. Marker click, etc.
   * @param options
   *
   * @example
   * mapsvg.setActions({
   *   "click.region": {
   *     showPopover: true,
   *     showDetails: false
   *   }
   * })
   */
  setActions(options): void {
    deepMerge(this.options.actions, options)
  }
  /**
   * Sets Details View options
   * @param {object} options - Options
   */
  setDetailsView(options?: { [key: string]: any }) {
    options = options || this.options.detailsView || {}
    deepMerge(this.options.detailsView, options)
    if (this.controllers.detailsView) {
      this.controllers.detailsView.applyDetailsStyles()
      if (options.margin !== undefined || options.width !== undefined) {
        this.controllers.detailsView.setStyles({
          margin: this.options.detailsView.margin,
          width: this.options.detailsView.width,
        })
      }
    }
  }
  /**
   * Sets mobile view options
   * @param options
   */
  setMobileView(options): void {
    deepMerge(this.options.mobileView, options)
    this.controllers.toolbar?.setState(this.options.mobileView)
    if (isTreeLayoutMode(this.options) && this.containersCreated) this.refreshTreeLayout()
  }

  /**
   * Attaches DB Objects to Regions
   * @param object
   */
  attachDataToRegions(object?: Model) {
    const regions = object.getRegionsForTable(this.globalQueriesEnabled ? this.regionsRepository.schema.name : this.options.database.regionsTableName)
    const regionIds = regions.map((region) => region.id)

    this.regions
      .filter((region) => regionIds.includes(region.id))
      .forEach((region) => {
        region.objects.clear()
      })

    this.objectsRepository.getLoaded().forEach((obj, index) => {
      const regions = obj.getRegionsForTable(this.globalQueriesEnabled ? this.regionsRepository.schema.name : this.options.database.regionsTableName)
      if (regions && regions.length) {
        regions.forEach((region) => {
          const r = this.getRegion(region.id)
          if (r) r.objects.push(obj)
        })
      }
    })
  }

  /**
   * Sets templates body.
   * Dual-registers each template as root (compile) and map-scoped partial.
   * Injects concatenated flat template CSS into styleRoot (no auto-scope).
   * @param {object} templates - Key:value pairs of template names and TemplateEntry (or legacy string)
   */
  setTemplates(templates): void {
    this.templates = this.templates || {}
    this.options.templates = this.options.templates || {}

    let directoryNeedsRedraw = false

    for (const name in templates) {
      if (name === undefined) {
        continue
      }
      // Skip already-compiled functions (re-entrant update paths).
      // TemplateEntry objects must still pass through normalizeTemplateEntry.
      if (typeof templates[name] === "function") {
        continue
      }

      const incoming = templates[name]
      const existing = this.options.templates[name]
      let entry: TemplateEntry

      if (typeof incoming === "string") {
        entry = normalizeTemplateEntry(
          {
            ...(typeof existing === "object" && existing ? existing : {}),
            html: incoming,
          } as TemplateEntry,
          name,
        )
      } else if (incoming && typeof incoming === "object") {
        const base =
          typeof existing === "object" && existing
            ? normalizeTemplateEntry(existing, name)
            : normalizeTemplateEntry(undefined, name)
        entry = normalizeTemplateEntry(
          {
            html: incoming.html !== undefined ? incoming.html : base.html,
            css: incoming.css !== undefined ? incoming.css : base.css,
            js: incoming.js !== undefined ? incoming.js : base.js,
            type: incoming.type !== undefined ? incoming.type : base.type,
          },
          name,
        )
      } else {
        entry = normalizeTemplateEntry(existing, name)
      }

      this.options.templates[name] = entry
      const html = wrapTemplatePartialHtml(
        name,
        rewritePartialRefs(entry.html, this.id),
      )

      Handlebars.unregisterPartial(name + "-" + this.id)
      Handlebars.unregisterPartial(name)

      try {
        const compiled = Handlebars.compile(html, { strict: false })
        this.templates[name] = compiled
        Handlebars.registerPartial(name + "-" + this.id, compiled)
      } catch (err) {
        console.error(
          "[CLIENT-005] Handlebars compilation error — Read more: https://mapsvg.com/docs/errors#CLIENT-005",
          err,
        )
        const empty = Handlebars.compile("", { strict: false })
        this.templates[name] = empty
        try {
          Handlebars.registerPartial(name + "-" + this.id, empty)
        } catch (partialErr) {
          console.error(
            "[CLIENT-004] Handlebars template error — Read more: https://mapsvg.com/docs/errors#CLIENT-004",
            partialErr,
          )
        }
      }

      if (name == "directory" || name == "directoryCategoryItem" || name == "directoryItem") {
        directoryNeedsRedraw = true
      }
    }

    this.injectTemplatesCss()

    if (
      directoryNeedsRedraw &&
      this.inBackend &&
      this.controllers &&
      this.controllers.directory
    ) {
      this.controllers.directory.templates.main = this.templates.directory
      this.controllers.directory?.redraw()
    }
  }

  /**
   * Inject per-template CSS as one flat &lt;style data-mapsvg-templates&gt; in styleRoot.
   */
  injectTemplatesCss(): void {
    const css = concatTemplateCss(this.options.templates || {}, this.id)

    if (!this.templatesCss) {
      const style = this.eventDocument.createElement("style")
      style.setAttribute("data-mapsvg-templates", String(this.id))
      this.appendToStyleRoot(style)
      this.templatesCss = style
    }

    this.templatesCss.textContent = css
    this.refreshControllerCustomCss()
  }

  /**
   * Compiled template with map-scoped partial refs (from setTemplates).
   * Falls back to compile + rewrite if missing.
   */
  getCompiledTemplate(name: string) {
    if (this.templates && this.templates[name]) {
      return this.templates[name]
    }
    const html = wrapTemplatePartialHtml(
      name,
      rewritePartialRefs(getTemplateHtml(this.options.templates?.[name], name), this.id),
    )
    try {
      return Handlebars.compile(html, { strict: false })
    } catch (err) {
      console.error(
        "[CLIENT-005] Handlebars compilation error — Read more: https://mapsvg.com/docs/errors#CLIENT-005",
        err,
      )
      return Handlebars.compile("", { strict: false })
    }
  }
  /**
   * Updates map settings.
   * @param {object} options - Map options
   *
   * @example
   * mapsvg.update({
   *   popovers: {on: true},
   *   colors: {
   *     background: "red"
   *   }
   * });
   */
  update(options: Omit<MapOptions, "id">): void {
    if (!options) {
      return
    }
    const { width, height, responsive, ...rest } = options

    for (const key in rest) {
      if (key == "regions") {
        // TODO options.regions for different regions tables (add regionTableName into options)
        for (const id in options.regions) {
          const region = this.getRegion(id)
          region && region.update(options.regions[id])
          this.reloadRegionStyles(region)
          if (region) {
            this.options.regions[id] = { ...this.options.regions[id], ...options.regions[id] }
          }
          if (typeof options.regions[id].disabled !== "undefined") {
            this.deselectRegion(region)
            this.options.regions[id] = this.options.regions[id] || {}
            this.options.regions[id].disabled = region.disabled
          }
        }
      } else {
        const setter = "set" + ucfirst(key)
        if (typeof this[setter] == "function") this[setter](options[key])
        else {
          this.options[key] = options[key]
        }
      }
    }

    if (width || height) {
      const newSize = { width, height, responsive }
      const size = {
        width:
          typeof width !== "undefined"
            ? Number(width)
            : (this.options.width ?? this.svgDefault.width),
        height:
          typeof height !== "undefined"
            ? Number(height)
            : (this.options.height ?? this.svgDefault.height),
        responsive: typeof responsive !== "undefined" ? !!responsive : this.options.responsive,
      }
      this.setSize(size.width, size.height, size.responsive)
    }
  }

  /** App-owned Gallery presets update without restarting the map. */
  setGalleries(galleries: MapOptions["galleries"]): void {
    const previous = this.options.galleries
    const changed = JSON.stringify(this.options.galleries) !== JSON.stringify(galleries ?? [])
    this.options.galleries = galleries ?? []
    if (!this.events) return
    const module = getGalleryModule()
    if (!hasRuntimeFeature("gallery") || !module) {
      this.galleryController?.destroy()
      this.galleryController = undefined
      Handlebars.registerHelper("mapsvg_gallery", () => "")
      return
    }
    if (!this.galleryController) {
      this.galleryController = module.create(this)
      this.galleryController.init()
    }
    if (changed) this.galleryController.refresh(previous)
  }

  getDirtyFields(): { [key: string]: any } {
    return this.getData()
  }
  clearDirtyFields(): void {
    this.dirtyFields = []
  }

  /**
   * Sets map title
   * @param {string} title - Map title
   * @private
   */
  setTitle(title: string): void {
    title && (this.options.title = title)
  }
  /**
   * Adds MapSVG add-ons
   * @param extension
   * @private
   */
  setExtension(extension): void {
    if (extension) {
      this.options.extension = extension
    } else {
      delete this.options.extension
    }
  }
  /**
   * Disables/enables redirection by link on click on a region or marker
   * when "Go to link..." feature is enabled
   * Used to prevent redirection in the map editor.
   * @param {boolean} on - true (enable redirection) of false (disable)
   */
  setDisableLinks(on: boolean): void {
    on = utils.numbers.parseBoolean(on)
    this.disableLinks = on
  }
  /**
   * Updates the loading text message displayed on the map
   * @param {string} message - The text to display while the map is loading
   */
  setLoadingText(message: string): void {
    this.options.loadingText = message
    if (this.containers.loading) {
      const el = $(this.containers.loading).find(".mapsvg-loading-text")[0] as HTMLElement
      if (el) {
        this.applyLoadingText(el, this.options.loadingText)
      }
    }
  }
  /**
   * Enables or disables the lock aspect ratio feature, primarily used in the Map Editor.
   * @param {boolean} onoff - A boolean indicating whether to enable or disable the feature.
   * @private
   */
  setLockAspectRatio(onoff: boolean): void {
    this.options.lockAspectRatio = utils.numbers.parseBoolean(onoff)
  }
  /**
   * Sets callback for marker click. Used in Map Editor to show an object editing window.
   * @private
   */
  setMarkerEditHandler(handler: (location: Location) => void): void {
    this.markerEditHandler = handler
  }
  /**
   * Sets the field that is used for choropleth map
   * @param {string} field - field name
   */
  setChoroplethSourceField(field): void {
    this.options.choropleth.sourceField = field
    this.redrawChoropleth()
  }
  /**
   * Sets callback function that is called on click on a Region.
   * Used in the Map Editor on click on a Region in the "Edit regions" map mode.
   * @param {Function} handler
   */
  setRegionEditHandler(handler: () => void): void {
    this.regionEditHandler = handler
  }
  /**
   * Disables all Regions if "true" is passed.
   * @param {boolean} on
   */
  setDisableAll(on: boolean) {
    on = utils.numbers.parseBoolean(on)
    deepMerge(this.options, { disableAll: on })
    $(this.containers.map).toggleClass("mapsvg-disabled-regions", on)
  }

  /**
   * Disables all Regions if "true" is passed.
   * @param {object} options
   */
  setClustering(options) {
    deepMerge(this.options.clustering, options)
    this.clusteringModule()?.sync.call(this, this.clusteringServices())
  }

  /**
   * Returns color of the Region for choropleth map
   * @returns {string} color
   */
  getChoroplethColor(region: Region) {
    const o = this.options.choropleth
    let color = ""

    if (
      region.data &&
      (region.data[this.options.regionChoroplethField] ||
        region.data[this.options.regionChoroplethField] === 0)
    ) {
      const w =
        o.maxAdjusted === 0
          ? 0
          : (parseFloat(region.data[this.options.regionChoroplethField]) - o.min) / o.maxAdjusted

      const c = {
        r: Math.round(o.colors.diffRGB.r * w + o.colors.lowRGB.r),
        g: Math.round(o.colors.diffRGB.g * w + o.colors.lowRGB.g),
        b: Math.round(o.colors.diffRGB.b * w + o.colors.lowRGB.b),
        a: (o.colors.diffRGB.a * w + o.colors.lowRGB.a).toFixed(2),
      }
      color = "rgba(" + c.r + "," + c.g + "," + c.b + "," + c.a + ")"
    } else {
      color = o.colors.noData
    }

    return color
  }

  /**
   * Returns size of the choropleth bubble
   */
  getBubbleSize(region: Region) {
    let bubbleSize

    if (region.data && region.data[this.options.choropleth.sourceField]) {
      const maxBubbleSize = Number(this.options.choropleth.bubbleSize.max),
        minBubbleSize = Number(this.options.choropleth.bubbleSize.min),
        maxSourceFieldvalue = this.options.choropleth.coloring.gradient.values.max,
        minSourceFieldvalue = this.options.choropleth.coloring.gradient.values.min,
        sourceFieldvalue = parseFloat(region.data[this.options.choropleth.sourceField])

      bubbleSize =
        ((sourceFieldvalue - minSourceFieldvalue) / (maxSourceFieldvalue - minSourceFieldvalue)) *
          (maxBubbleSize - minBubbleSize) +
        minBubbleSize
    } else {
      bubbleSize = false
    }

    return bubbleSize
  }

  getRegionStylesByState(region: Region): null | RegionStylesByStatus {
    if (!region) {
      return null
    }

    if (this.drawMode) {
      return {
        default: {
          selected: {},
          hover: {},
          default: {},
        },
      }
    }

    const statusStyles: RegionStylesByStatus = {}

    // Capture region in the outer scope
    const capturedRegion = region

    const dataRules = this.options.regionDataRules
    const dataResult = dataRules ? this.regionRulesRuntime.results.get(String(region.id)) : undefined

    // Get all available statuses (schema values + presentation keys)
    const statusField = this.regionsRepository.getSchema().getFieldByType("status") || {
      options: [],
    }

    const statusKeys = new Set<string>()
    ;(statusField.options || []).forEach((option) => {
      if (option && option.value != null && option.value !== "") {
        statusKeys.add(String(option.value))
      }
    })
    Object.keys(this.options.regionStatuses || {}).forEach((key) => statusKeys.add(String(key)))
    const statuses = Array.from(statusKeys)
    statuses.push("undefined")
    if (dataRules && region.status != null && !statuses.includes(String(region.status))) statuses.push(String(region.status))

    for (const status of statuses) {
      const styleDefault: Region["style"] = {}
      const styleSelected: Region["style"] = {}
      const styleHover: Region["style"] = {}

      const currentStatus = (statusField.options || []).find(
        (option) => String(option.value) === String(status),
      )
      const presentation =
        (this.options.regionStatuses && this.options.regionStatuses[status]) ||
        (this.options.regionStatuses && this.options.regionStatuses[String(status)])
      const presentationColor =
        (presentation && presentation.color) ||
        (this.options.colors &&
          this.options.colors.status &&
          (this.options.colors.status[status] || this.options.colors.status[String(status)]))

      // Presentation first; schema options color is legacy fallback
      if (!dataRules && presentationColor) {
        styleDefault.fill = presentationColor
      } else if (!dataRules && currentStatus?.color) {
        styleDefault.fill = currentStatus.color
      } else if (!dataRules && this.options.choropleth.on) {
        styleDefault.fill = this.getChoroplethColor(capturedRegion)
      } else if (
        this.options.regions[capturedRegion.id] &&
        this.options.regions[capturedRegion.id].style &&
        this.options.regions[capturedRegion.id].style.fill
      ) {
        styleDefault.fill = this.options.regions[capturedRegion.id].style.fill
      } else if (this.options.colors.base) {
        styleDefault.fill = this.options.colors.base
      } else if (capturedRegion.styleSvg.fill != "none") {
        styleDefault.fill = capturedRegion.styleSvg.fill ?? this.options.colors.baseDefault
      } else {
        styleDefault.fill = "none"
      }

      if (dataResult?.gradient) {
        const { low, high, ratio } = dataResult.gradient
        styleDefault.fill = tinycolor.mix(low, high, ratio * 100).toRgbString()
      } else if (dataResult?.color) styleDefault.fill = dataResult.color

      // Set selected and hover styles
      if (isNumber(this.options.colors.selected)) {
        styleSelected.fill = tinycolor(styleDefault.fill)
          .lighten(parseFloat("" + this.options.colors.selected))
          .toRgbString()
      } else {
        styleSelected.fill = this.options.colors.selected as string
      }

      if (isNumber(this.options.colors.hover)) {
        styleHover.fill = tinycolor(styleDefault.fill)
          .lighten(parseFloat("" + this.options.colors.hover))
          .toRgbString()
      } else {
        styleHover.fill = this.options.colors.hover as string
      }

      // Set stroke
      if (capturedRegion.style.stroke != "none" && this.options.colors.stroke != undefined) {
        styleDefault.stroke = this.options.colors.stroke
      } else {
        styleDefault.stroke = capturedRegion.style.stroke ?? ""
      }

      styleSelected.stroke = styleDefault.stroke
      styleHover.stroke = styleDefault.stroke

      statusStyles[status] = {
        selected: styleSelected,
        hover: styleHover,
        default: styleDefault,
      }
    }

    return statusStyles
  }

  setRegions(options: RegionOptionsCollection) {
    // Update or add new regions based on incoming options
    for (const [id, regionOptions] of Object.entries(options)) {
      if (Array.isArray(regionOptions.style)) {
        console.error(
          "[CLIENT-006] MapSVG: wrong format of region style options. Read more: https://mapsvg.com/docs/errors#CLIENT-006",
        )
        continue
      }
      if (this.options.regions[id]) {
        // Update existing region in options
        Object.assign(this.options.regions[id], regionOptions)
      } else {
        // Add new region to options
        this.options.regions[id] = regionOptions
      }

      // Update region object if it exists
      const region = this.getRegion(id)
      if (region) {
        region.update(this.options.regions[id])
      }
    }
  }
  /**
   * @private
   */
  setRegionStatuses(
    statuses: Record<string, { label: string; value: string; disabled: boolean; color: string }>,
  ): void {
    this.options.regionStatuses = statuses
    const colors = {}
    for (const key in statuses) {
      const s = statuses[key]
      colors[s.value] = s.color && s.color.length ? s.color : null
    }
    this.setColors({ status: colors })
  }

  /**
   * Sync presentation regionStatuses keys/labels from schema status options.
   * Preserves existing color/disabled; does not copy presentation from schema.
   */
  syncRegionStatusesFromSchema(
    options: Array<{ label?: string; value?: string | number; color?: string; disabled?: boolean }>,
  ): void {
    const existing = this.options.regionStatuses || {}
    const next: Record<
      string,
      { label: string; value: string; disabled: boolean; color: string }
    > = {}
    ;(options || []).forEach((opt) => {
      if (opt == null || opt.value === "" || opt.value == null) {
        return
      }
      const key = String(opt.value)
      const prev = existing[key] || existing[opt.value as string] || ({} as any)
      next[key] = {
        label: opt.label != null && opt.label !== "" ? String(opt.label) : prev.label || key,
        value: key,
        color: prev.color != null && prev.color !== "" ? prev.color : opt.color || "",
        disabled:
          typeof prev.disabled === "boolean"
            ? prev.disabled
            : typeof opt.disabled === "boolean"
              ? opt.disabled
              : false,
      }
    })
    this.setRegionStatuses(next)
  }
  /**
   * @deprecated
   * @private
   */
  setColorsIgnore(val): void {
    this.options.colorsIgnore = utils.numbers.parseBoolean(val)
    this.reloadAllRegionStyles()
  }
  /**
   * Sets color settings (background, regions, containers, etc.)
   * @param {object} colors
   *
   * @example
   * mapsvg.setColors({
   *   background: "#EEEEEE",
   *   hover: "10",
   *   selected: "20",
   *   leftSidebar: "#FF2233",
   *   detailsView: "#FFFFFF"
   * });
   */
  setColors(colors?: { [key: string]: string | number | Record<string, unknown> }): void {
    for (const i in colors) {
      if (i === "status") {
        for (const s in colors[i] as object) {
          colors[i][s] = fixColorHash(colors[i][s] as string)
        }
      } else {
        if (typeof colors[i] == "string") {
          colors[i] = fixColorHash(colors[i] as string)
        }
      }
    }

    const surfaceOnly = colors && Object.keys(colors).length > 0 && (
      Object.keys(colors).every(key => SURFACE_COLOR_KEYS.has(key)) ||
      onlySurfaceColorChanges(this.options.colors, { ...this.options.colors, ...colors })
    )
    deepMerge(this.options, { colors: colors })

    if (colors && colors.status) this.options.colors.status = colors.status

    if (this.options.colors.markers) {
      for (const z in this.options.colors.markers) {
        for (const x in this.options.colors.markers[z]) {
          this.options.colors.markers[z][x] = parseInt(this.options.colors.markers[z][x])
        }
      }
    }

    if (this.options.colors.background !== undefined)
      $(this.containers.map).css({ background: this.options.colors.background ?? "" })
    if (this.options.colors.hover) {
      // Typescript compiler thinks isNaN can't accept strings
      // @ts-ignore
      this.options.colors.hover = !isNaN(this.options.colors.hover)
        ? parseInt(this.options.colors.hover + "")
        : this.options.colors.hover
    }
    if (this.options.colors.selected) {
      // Typescript compiler thinks isNaN can't accept strings
      // @ts-ignore
      this.options.colors.selected = !isNaN(this.options.colors.selected)
        ? parseInt(this.options.colors.selected + "")
        : this.options.colors.selected
    }

    $(this.containers.leftSidebar).css({
      "background-color": this.options.colors.leftSidebar,
    })
    $(this.containers.rightSidebar).css({
      "background-color": this.options.colors.rightSidebar,
    })
    $(this.containers.header).css({ "background-color": this.options.colors.header })
    $(this.containers.footer).css({ "background-color": this.options.colors.footer })
    this.applyTreeSlotColors()

    if (this.controllers.detailsView && this.options.colors.detailsView !== undefined) {
      this.controllers.detailsView.setStyles({ backgroundColor: this.options.colors.detailsView })
    }
    if (this.controllers.directory && this.options.colors.directory !== undefined) {
      this.controllers.directory?.setStyles({ backgroundColor: this.options.colors.directory })
    }
    if (this.controllers.filters) {
      this.controllers.filters.setStyles({
        backgroundColor: (this.controllers.filters.modal
          ? "transparent"
          : this.options.colors.directorySearch) || "",
      })
    }

    if (this.controllers.popover && this.options.colors.popover !== undefined)
      this.controllers.popover.setStyles({ backgroundColor: this.options.colors.popover })
    for (const tooltip of Object.values(this.controllers.tooltips || {})) {
      if (tooltip && this.options.colors.tooltip !== undefined)
        tooltip.setStyles({ backgroundColor: this.options.colors.tooltip })
    }

    if ($(this.containers.filtersModal) && this.options.colors.modalFilters !== undefined) {
      $(this.containers.filtersModal).css({
        "background-color": this.options.colors.modalFilters,
      })
    }

    // A palette gesture is a CSS paint, not a Region/Legend or marker-style update.
    if (surfaceOnly) {
      $.each(this.options.colors, (key, color) => {
        if (color === null) delete this.options.colors[key]
      })
      return
    }

    this.clusteringModule()?.setColors.call(this)

    if (!this.containers.markersCss) {
      this.containers.markersCss = this.eventDocument.createElement("style")
      this.appendToStyleRoot(this.containers.markersCss)
    }
    const markerCssText =
      ".mapsvg-with-marker-active .mapsvg-marker {\n" +
      "  opacity: " +
      this.options.colors.markers.inactive.opacity / 100 +
      ";\n" +
      "  -webkit-filter: grayscale(" +
      (100 - this.options.colors.markers.inactive.saturation) +
      "%);\n" +
      "  filter: grayscale(" +
      (100 - this.options.colors.markers.inactive.saturation) +
      "%);\n" +
      "}\n" +
      ".mapsvg-with-marker-active .mapsvg-marker-active {\n" +
      "  opacity: " +
      this.options.colors.markers.active.opacity / 100 +
      ";\n" +
      "  -webkit-filter: grayscale(" +
      (100 - this.options.colors.markers.active.saturation) +
      "%);\n" +
      "  filter: grayscale(" +
      (100 - this.options.colors.markers.active.saturation) +
      "%);\n" +
      "}\n" +
      ".mapsvg-with-marker-hover .mapsvg-marker {\n" +
      "  opacity: " +
      this.options.colors.markers.unhovered.opacity / 100 +
      ";\n" +
      "  -webkit-filter: grayscale(" +
      (100 - this.options.colors.markers.unhovered.saturation) +
      "%);\n" +
      "  filter: grayscale(" +
      (100 - this.options.colors.markers.unhovered.saturation) +
      "%);\n" +
      "}\n" +
      ".mapsvg-with-marker-hover .mapsvg-marker-hover {\n" +
      "  opacity: " +
      this.options.colors.markers.hovered.opacity / 100 +
      ";\n" +
      "  -webkit-filter: grayscale(" +
      (100 - this.options.colors.markers.hovered.saturation) +
      "%);\n" +
      "  filter: grayscale(" +
      (100 - this.options.colors.markers.hovered.saturation) +
      "%);\n" +
      "}\n"
    $(this.containers.markersCss).html(markerCssText)

    $.each(this.options.colors, (key, color) => {
      if (color === null) delete this.options.colors[key]
    })

    this.reloadAllRegionStyles()
  }
  /**
   * Sets tooltips options.
   * @param {object} options
   * @example
   * mapsvg.setTooltips({
   *   on: true,
   *   position: "bottom-left",
   *   maxWidth: "300"
   * })
   */
  setTooltips(options: { on: boolean }): void {
    if (options.on !== undefined) options.on = utils.numbers.parseBoolean(options.on)

    deepMerge(this.options, { tooltips: options })

    if (!isNodeTypeReachable(this.options, "tooltip")) {
      this.options.tooltips.on = false
    }

    this.controllers.tooltips = {}
  }
  /**
   * Sets popover options.
   * @param {object} options
   * @example
   * mapsvg.setPopovers({
   *   on: true,
   *   width: 300, // pixels
   *   maxWidth: 70, // percents of map container
   *   maxHeight: 70, // percents of map container
   *   mobileFullscreen: true
   * });
   */
  setPopovers(options) {
    if (options.on !== undefined) options.on = utils.numbers.parseBoolean(options.on)

    deepMerge(this.options.popovers, options)

    if (!isNodeTypeReachable(this.options, "popover")) {
      this.options.popovers.on = false
    }
  }
  /**
   * Sets region prefix
   * @param {string} prefix
   * @private
   */
  setRegionPrefix(prefix) {
    const changed = this.options.regionPrefix !== prefix
    this.options.regionPrefix = prefix
    if (changed && this.svgFileLoaded && this.containers?.svg) {
      this.deselectAllRegions()
      this.reloadRegions()
      if (this.regionsRepository?.loaded) this.reloadRegionsFull()
    }
  }
  /**
   * Sets initial viewbox
   * @param {array} viewBox - [x,y,width,height]
   * @private
   */
  setInitialViewBox(viewBox: ViewBox) {
    this._viewBox.update(viewBox)
  }
  setWhRatio(ratio: number) {
    this.whRatio = {
      original: this.svgDefault.viewBox.width / this.svgDefault.viewBox.height,
      current: ratio,
    }
  }
  /**
   * Sets viewbox on map start and calculates initial width/height ratio
   * @private
   */
  setSvgTagViewBox(viewBox: ViewBox) {
    this.containers.svg.setAttribute("viewBox", viewBox.toString())

    if (env.getBrowser().safari && !this.useShadowRoot) {
      // const maxSize = 4096 // текущий WebKit порог около 4k
      // const maxDim = Math.max(this.svgDefault.viewBox.width, this.svgDefault.viewBox.height)
      // const factor = Math.ceil(maxDim / maxSize)
      this.containers.svg.style.width = "1000%"
      this.iosDownscaleFactor = 0.1
      // this.containers.svg.style.transform = "scale(.01)"
    } else {
      this.containers.svg.style.width = "auto"
    }

    this.vbStart = true
  }

  /**
   * Sets map viewbox
   * @param {ViewBox} viewBox
   * @param {boolean} adjustGoogleMap
   */
  setViewBox(viewBox?: ViewBox | number[], adjustGoogleMap = true): boolean {
    if (!this.svgFileLoaded) {
      return
    }

    let isZooming = false
    let isMoving = false

    if (viewBox) {
      const next = viewBox instanceof ViewBox ? viewBox : new ViewBox(viewBox)
      isZooming = this.checkIfZoomIsNeeded(next)
      isMoving = next.x !== this.viewBox.x || next.y !== this.viewBox.y
      this.viewBox.update(next)
    }
    // Calculate new padding
    const newPaddingBottom = (this.viewBox.height * 100) / this.viewBox.width

    // Only update padding if the change is significant > 1
    if (Math.abs(newPaddingBottom - this.previousPaddingBottom) > 1) {
      $(this.containers.map).css({
        width: "100%",
        height: "0",
        "padding-bottom": newPaddingBottom + "%",
      })
      this.previousPaddingBottom = newPaddingBottom
    }

    this.whRatio.current = this.viewBox.width / this.viewBox.height

    this.scale = this.getScale()
    const dim: "width" | "height" =
      this.whRatio.current > this.whRatio.original ? "width" : "height"

    // Calculate superScale
    const currentAspectRatio = this.whRatio.current
    const originalAspectRatio = this.whRatio.original
    this.superScale = Math.max(
      currentAspectRatio / originalAspectRatio,
      originalAspectRatio / currentAspectRatio,
    )

    this.scroll.tx = Math.round((this.svgDefault.viewBox.x - this.viewBox.x) * this.scale)
    this.scroll.ty = Math.round((this.svgDefault.viewBox.y - this.viewBox.y) * this.scale)

    // Changing Google Map boundaries will call this method again with adjustGoogleMap=false
    if (this.googleMaps.map && adjustGoogleMap !== false) {
      // We don't know if there are more zoom levels for Google Map
      // So we just zoom-in and then check if zoom has changed.
      // If it's changed then we set the center point
      const googlePrevZoom = this.googleMaps.map.getZoom()

      if (isZooming) {
        this.googleFitCurrentGeoBounds()
      }
      if (googlePrevZoom !== this.googleMaps.map.getZoom() || (isMoving && !isZooming)) {
        this.googleMaps.map.setCenter(this.getCenterGeoPoint())
      }
    } else {
      const scale = this.getRelativeScale()

      // if (isPhone()) {
      //   this.animateTransform(
      //     {
      //       tx: this._prevTx ?? this.scroll.tx,
      //       ty: this._prevTy ?? this.scroll.ty,
      //       scale: this._prevScale ?? this.scale,
      //     },
      //     {
      //       tx: this.scroll.tx,
      //       ty: this.scroll.ty,
      //       scale: scale,
      //     },
      //   )

      //   this._prevTx = this.scroll.tx
      //   this._prevTy = this.scroll.ty
      //   this._prevScale = scale
      // } else {
      this.containers.svg.style.transform = `translate(${this.scroll.tx}px, ${this.scroll.ty}px) scale(${scale * this.iosDownscaleFactor})`
      // }

      // this.containers.svgWrapper.style.transform = `scale(${this.scale})`

      this.events.trigger(MapEventType.AFTER_CHANGE_BOUNDS, {
        center: {
          geoPoint: this.getCenterGeoPoint(),
          svgPoint: this.getCenterSvgPoint(),
        },
        viewBox: this.viewBox,
        zoomLevel: this.zoomLevel,
        scale: this._scale,
      })
    }

    this.movingItemsAdjustScreenPosition()

    if (isZooming) {
      this.adjustStrokes()
      this.throttle(this.toggleSvgLayerOnZoom, 50, this)
      if (hasRuntimeFeature("clustering") && this.options.clustering.on) {
        // Google Maps is calling setViewBox 20-30 times per zoom cycle (400ms)
        // until the animation finishes. So we have to use .throttle to avoid calling
        // the expensive operation multiple times.
        this.throttle(this.clusterizeOnZoom, 400, this)
      } else {
        this.events.trigger(MapEventType.ZOOM)
      }
    }

    return true
  }

  /**
   * Returns lat,lng coordinates of center of the current view
   */
  getCenterGeoPoint(fromZeroLevel: boolean = false, viewBox?: ViewBox): GeoPoint | null {
    if (!this.isGeo()) {
      return null
    }
    if (!this.converter) {
      return new GeoPoint(0, 0)
    } else {
      return this.converter.convertSVGToGeo(this.getCenterSvgPoint(fromZeroLevel, viewBox))
    }
  }

  /**
   * Returns  SVG coordinates of the center of current map position
   */
  getCenterSvgPoint(fromZeroLevel: boolean = false, viewBox?: ViewBox): SVGPoint {
    if (fromZeroLevel) {
      return new SVGPoint(
        this.svgDefault.viewBox.x + this.svgDefault.viewBox.width / 2,
        this.svgDefault.viewBox.y + this.svgDefault.viewBox.height / 2,
      )
    } else if (viewBox) {
      return new SVGPoint(viewBox.x + viewBox.width / 2, viewBox.y + viewBox.height / 2)
    } else {
      return new SVGPoint(
        this.viewBox.x + this.viewBox.width / 2,
        this.viewBox.y + this.viewBox.height / 2,
      )
    }
  }

  getZoomRange(): { min: number; max: number } {
    const range = { min: 0, max: 0 }

    range.min = this.options.zoom.limit[0]
    range.max = this.options.zoom.limit[1]

    return range
  }
  /**
   * Turns on marker animations
   * @private
   */
  enableMovingElementsAnimation(): void {
    $(this.containers.map).removeClass(
      "no-transitions-markers no-transitions-labels no-transitions-bubbles",
    )
  }
  /**
   * Turns off marker animations
   * @private
   */
  disableMovingElementsAnimation(): void {
    $(this.containers.map).addClass(
      "no-transitions-markers no-transitions-labels no-transitions-bubbles",
    )
  }
  /**
   * Event handler that clusterizes markers on zoom
   * @private
   */

  clusterizeOnZoom(): void {
    return this.clusteringModule()?.clusterizeOnZoom.call(this, this.clusteringServices())
  }
  /**
   * Delays method execution.
   * For example, it can be used in search input fields to prevent sending
   * an ajax request on each key press.
   * @param {function} method
   * @param {number} delay
   * @param {object} scope
   * @param {array} params
   * @private
   */
  throttle(method: (params: any) => void, delay: number, scope: any, params?: any): void {
    // @ts-ignore
    clearTimeout(method._tId)
    // @ts-ignore
    method._tId = setTimeout(function () {
      method.apply(scope, params)
    }, delay)
  }
  googleFitCurrentGeoBounds(): void {
    const boundsCurrent = this.getGeoBounds()
    this.googleMaps.map.fitBounds(
      {
        south: boundsCurrent.sw.lat,
        west: boundsCurrent.sw.lng,
        north: boundsCurrent.ne.lat,
        east: boundsCurrent.ne.lng,
      },
      0,
    )
  }
  /**
   * Sets SVG viewBox by Google Maps bounds.
   * Used to overlay SVG map on Google Map.
   */
  setViewBoxByGoogleMapBounds(): void {
    this.setViewBoxByGoogleMapsOverlay()
  }
  /**
   * Whether the map container currently has a non-zero layout size.
   * Google Maps treats a hidden (display:none) container as 0x0 and resets to world zoom.
   */
  isMapContainerVisible(): boolean {
    const map = this.containers.map
    return hasVisibleMapSize(map?.clientWidth ?? 0, map?.clientHeight ?? 0)
  }

  /**
   * Stores the current Google Maps center and zoom so they can be restored
   * after the map is shown again (e.g. mobile Map/List toggle).
   */
  saveGoogleMapsViewport(): void {
    if (!this.googleMaps?.map || this.googleMaps.needsViewportRestore) {
      return
    }
    const captured = captureGoogleMapsViewport(
      this.isMapContainerVisible(),
      this.googleMaps.map.getCenter()?.toJSON(),
      this.googleMaps.map.getZoom(),
    )
    if (captured) {
      this.googleMaps.savedViewport = captured
    }
  }

  /**
   * Restores the last saved Google Maps center and zoom after a resize/show.
   */
  restoreGoogleMapsViewport(): void {
    if (!this.googleMaps?.map || !this.googleMaps.savedViewport) {
      return
    }
    this.googleMaps.map.setCenter(this.googleMaps.savedViewport.center)
    this.googleMaps.map.setZoom(this.googleMaps.savedViewport.zoom)
  }

  /**
   * Redraws the map.
   * Must be called when the map is shown after being hidden.
   */
  redraw(): void {
    this.disableAnimation()
    // if (utils.env.getBrowser().ie) {
    //   $(this.containers.svg).css({ height: this.svgDefault.viewBox.height })
    // }

    if (this.googleMaps.map) {
      if (shouldSkipGoogleMapsResize(this.isMapContainerVisible())) {
        // A 0x0 Google Map resize snaps the camera to world zoom.
        this.googleMaps.needsViewportRestore = true
      } else {
        if (!this.googleMaps.needsViewportRestore) {
          this.saveGoogleMapsViewport()
        }
        // Resize may synchronously emit idle. Freeze capture until restoration is complete.
        this.googleMaps.needsViewportRestore = true
        google.maps.event.trigger(this.googleMaps.map, "resize")
        this.restoreGoogleMapsViewport()
        this.googleMaps.needsViewportRestore = false
        this.setViewBoxByGoogleMapsOverlay()
      }
    } else {
      this.setViewBox(this.viewBox)
    }
    $(this.containers.popover) &&
      $(this.containers.popover).css({
        "max-height":
          (this.options.popovers.maxHeight * $(this.containers.wrap).outerHeight()) / 100 + "px",
      })
    if (this.controllers && this.controllers.directory) {
      this.controllers.directory?.updateTopShift()
      this.controllers.directory?.updateScroll()
    }
    this.movingItemsAdjustScreenPosition()
    this.adjustStrokes()
    if (this.options.choropleth.on && this.options.choropleth.bubbleMode) {
      this.redrawBubbles()
    }
    setTimeout(() => {
      this.enableAnimation()
    }, 400)
  }

  /**
   * Sets map container size.
   * Can accept both or just 1 parameter - width or height. The missing parameter will be calcualted.
   * @param {number} width
   * @param {number} height
   * @param {boolean} responsive
   * @returns {number[]} - [width, height]
   */
  setSize(width: number, height: number, responsive?: boolean): void {
    // Convert strings to numbers
    this.options.width = width
    this.options.height = height
    this.options.responsive =
      responsive != null && responsive != undefined
        ? utils.numbers.parseBoolean(responsive)
        : this.options.responsive

    // Calculate width and height
    if (!this.options.width && !this.options.height) {
      this.options.width = this.svgDefault.width
      this.options.height = this.svgDefault.height
    } else if (!this.options.width && this.options.height) {
      this.options.width = (this.options.height * this.svgDefault.width) / this.svgDefault.height
    } else if (this.options.width && !this.options.height) {
      this.options.height = (this.options.width * this.svgDefault.height) / this.svgDefault.width
    }

    this.scale = this.getScale()

    this.setResponsive(responsive)

    if (this.loaded) {
      this.redraw()
    }
  }
  /**
   * Sets map responsiveness on/off. When map is responsive, it takes the full width of the parent container.
   * @param {bool} on
   */
  setResponsive(on: boolean): void {
    on = on != undefined ? utils.numbers.parseBoolean(on) : this.options.responsive

    // if (on) {
    $(this.containers.wrap).css({
      width: "100%",
      height: "auto",
    })
    // } else {
    //   $(this.containers.wrap).css({
    //     width: this.options.width + "px",
    //     height: this.options.height + "px",
    //   })
    // }
    deepMerge(this.options, { responsive: on })
  }
  /**
   * Sets map scroll options.
   * @param {object} options - scroll options
   * @param {bool} skipEvents - used by Map Editor to prevent re-setting event handlers.
   * @example
   * mapsvg.setScroll({
   *   on: true,
   *   limit: false // limit scroll to map bounds
   * });
   */
  setScroll(options, skipEvents): void {
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))
    options.limit != undefined && (options.limit = utils.numbers.parseBoolean(options.limit))
    deepMerge(this.options, { scroll: options })
    !skipEvents && this.setEventHandlers()
  }
  /**
   * Sets map zoom options.
   * @param {object} options - zoom options
   * @example
   * mapsvg.setZoom({
   *   on: true,
   *   mousewheel: true,
   *   limit: [-5,10], // allow -5 zoom steps back and +20 zoom steps up from initial position.
   * });
   */
  setZoom(options): void {
    options = options || {}
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))
    options.fingers != undefined && (options.fingers = utils.numbers.parseBoolean(options.fingers))
    options.mousewheel != undefined &&
      (options.mousewheel = utils.numbers.parseBoolean(options.mousewheel))

    // delta = 1.2 changed to delta = 2 since introducing Google Maps + smooth zoom
    // options.delta = 2

    // options.delta && (options.delta = parseFloat(options.delta));

    if (options.limit) {
      if (typeof options.limit == "string") options.limit = options.limit.split(";")
      options.limit = [parseInt(options.limit[0]), parseInt(options.limit[1])]
    }

    deepMerge(this.options, { zoom: options })
    $(this.containers.scrollpaneWrap).off("wheel.mapsvg")
    $(this.layers.markers).off("wheel.mapsvg")
    $(this.containers.scrollpaneWrap).off(this.firefoxScrollNamespace)
    $(this.eventDocument).off("scroll" + this.firefoxScrollNamespace)
    if (this.firefoxScroll) this.firefoxScroll.lockPageScroll = false

    if (this.options.zoom.mousewheel) {
      // var lastZoomTime = 0;
      // var zoomTimeDelta = 0;

      if (utils.env.getBrowser().firefox) {
        this.firefoxScroll = {
          insideIframe: false,
          scrollX: 0,
          scrollY: 0,
          lockPageScroll: false,
        }

        $(this.containers.scrollpaneWrap)
          .on("mouseenter" + this.firefoxScrollNamespace, () => {
            this.firefoxScroll.insideIframe = true
            this.firefoxScroll.scrollX = this.eventWindow.scrollX
            this.firefoxScroll.scrollY = this.eventWindow.scrollY
          })
          .on("mouseleave" + this.firefoxScrollNamespace, () => {
            this.firefoxScroll.insideIframe = false
            this.firefoxScroll.lockPageScroll = false
          })

        // Lock the page only for wheel-triggered scrolls (Firefox still
        // scrolls the document while zooming). Keyboard page-scroll keys
        // must not be reset — see handleFirefoxPageScrollKey().
        $(this.eventDocument).on("scroll" + this.firefoxScrollNamespace, () => {
          if (shouldResetFirefoxDocumentScroll(this.firefoxScroll)) {
            this.eventWindow.scrollTo(this.firefoxScroll.scrollX, this.firefoxScroll.scrollY)
          }
        })
      }

      $(this.containers.scrollpaneWrap).on("wheel.mapsvg", (event: JQuery.MouseEventBase) => {
        if (this.firefoxScroll) {
          lockFirefoxDocumentScroll(this.firefoxScroll, this.eventWindow)
        }
        event.preventDefault()
        this.mouseWheelZoom(event)
        // this.throttle(this.mouseWheelZoom, 500, this, [event]);
        return false
      })
      $(this.layers.markers).on("wheel.mapsvg", (event: JQuery.MouseEventBase) => {
        if (this.firefoxScroll) {
          lockFirefoxDocumentScroll(this.firefoxScroll, this.eventWindow)
        }
        event.preventDefault()
        this.mouseWheelZoom(event)
        return false
      })
    }
    this.canZoom = true
  }

  mouseWheelZoom(event: JQuery.MouseEventBase<any, any, any, any>): void {
    event.preventDefault()
    // @ts-ignore - doesn't recognize .deltaY
    const d = Math.sign(-event.originalEvent.deltaY)
    const center = this.getSvgPointAtClick(event.originalEvent)
    d > 0 ? this.zoomIn(center) : this.zoomOut(center)
  }

  /**
   * Sets map control buttons.
   * @param {object} options - control button options
   * @example
   * mapsvg.setControls({
   *   location: 'right',
   *   zoom: true,
   *   zoomReset: true,
   *   userLocation: true,
   *   previousMap: true
   * });
   */
  setControls(options): void {
    options = options || {}
    deepMerge(this.options, { controls: options })
    this.options.controls.zoom = utils.numbers.parseBoolean(this.options.controls.zoom)
    this.options.controls.zoomReset = utils.numbers.parseBoolean(this.options.controls.zoomReset)
    this.options.controls.userLocation = utils.numbers.parseBoolean(
      this.options.controls.userLocation,
    )
    this.options.controls.previousMap = utils.numbers.parseBoolean(
      this.options.controls.previousMap,
    )

    // Draw rule: skip chrome Controls when node is not reachable from scenes.
    if (!isNodeTypeReachable(this.options, "controls")) {
      if (this.containers.controls) {
        $(this.containers.controls).hide()
      }
      return
    }

    const loc = this.options.controls.location || "right"

    if (!this.containers.controls) {
      const buttons = $("<div />").addClass("mapsvg-buttons")

      const zoomGroup = $("<div />").addClass("mapsvg-btn-group").appendTo(buttons)
      const zoomIn = $("<div />").addClass("mapsvg-btn-map mapsvg-in")
      const zoomInIcon =
        '<svg viewBox="0 0 20 20" width="20" height="20" fill-rule="evenodd" version="1.1" id="svg134" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M 9,0 V 9 H 0 v 2 h 9 v 9 h 2 v -9 h 9 V 9 H 11 V 0 Z" /></svg>'
      zoomIn.html(zoomInIcon)

      zoomIn
        .on("touchstart", (e) => {
          if (e.cancelable) {
            e.preventDefault()
          }
          e.stopPropagation()
        })
        .on("touchend click", (e) => {
          if (e.cancelable) {
            e.preventDefault()
          }
          e.stopPropagation()
          this.zoomIn()
        })

      const zoomOut = $("<div />").addClass("mapsvg-btn-map mapsvg-out")
      const zoomOutIcon =
        '<svg viewBox="0 0 20 20" width="20" height="20" fill-rule="evenodd" version="1.1" id="svg134" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="m 0,9 v 2 H 20 V 9 Z" /></svg>'
      zoomOut.html(zoomOutIcon)
      zoomOut
        .on("touchstart", (e) => {
          if (e.cancelable) {
            e.preventDefault()
          }
          e.stopPropagation()
        })
        .on("touchend click", (e) => {
          if (e.cancelable) {
            e.preventDefault()
          }
          e.stopPropagation()
          this.zoomOut()
        })
      zoomGroup.append(zoomIn).append(zoomOut)

      const location = $("<div />").addClass("mapsvg-btn-map mapsvg-btn-location")
      location.on("touchend click", (e) => {
        if (e.cancelable) {
          e.preventDefault()
        }
        e.stopPropagation()
        this.showUserLocation((location) => {
          if (this.options.scroll.on) {
            this.centerOn(location.marker)
          }
        })
      })

      const userLocationIcon =
        '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 447.342 447.342" style="enable-background:new 0 0 447.342 447.342;" xml:space="preserve"><path d="M443.537,3.805c-3.84-3.84-9.686-4.893-14.625-2.613L7.553,195.239c-4.827,2.215-7.807,7.153-7.535,12.459 c0.254,5.305,3.727,9.908,8.762,11.63l129.476,44.289c21.349,7.314,38.125,24.089,45.438,45.438l44.321,129.509 c1.72,5.018,6.325,8.491,11.63,8.762c5.306,0.271,10.244-2.725,12.458-7.535L446.15,18.429 C448.428,13.491,447.377,7.644,443.537,3.805z"/></svg>'
      location.html(userLocationIcon)

      const locationGroup = $("<div />").addClass("mapsvg-btn-group").appendTo(buttons)
      locationGroup.append(location)

      const zoomResetIcon =
        '<svg height="14px" version="1.1" viewBox="0 0 14 14" width="14px" xmlns="http://www.w3.org/2000/svg" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns" xmlns:xlink="http://www.w3.org/1999/xlink"><g fill="none" fill-rule="evenodd" id="Page-1" stroke="none" stroke-width="1"><g fill="#000000" transform="translate(-215.000000, -257.000000)"><g id="fullscreen" transform="translate(215.000000, 257.000000)"><path d="M2,9 L0,9 L0,14 L5,14 L5,12 L2,12 L2,9 L2,9 Z M0,5 L2,5 L2,2 L5,2 L5,0 L0,0 L0,5 L0,5 Z M12,12 L9,12 L9,14 L14,14 L14,9 L12,9 L12,12 L12,12 Z M9,0 L9,2 L12,2 L12,5 L14,5 L14,0 L9,0 L9,0 Z" /></g></g></g></svg>'
      const zoomResetButton = $("<div />")
        .html(zoomResetIcon)
        .addClass("mapsvg-btn-map mapsvg-btn-zoom-reset")
      zoomResetButton.on("touchend click", (e) => {
        if (e.cancelable) {
          e.preventDefault()
        }
        e.stopPropagation()
        this.viewBoxReset("custom")
      })
      const zoomResetGroup = $("<div />").addClass("mapsvg-btn-group").appendTo(buttons)
      zoomResetGroup.append(zoomResetButton)



      this.containers.controls = buttons[0]
      this.controls = {
        zoom: zoomGroup[0],
        userLocation: locationGroup[0],
        zoomReset: zoomResetGroup[0],
      }
    }

    this.applyMapChromeShell()
    if (this.containers.controls) {
      this.mountChromeWidget("controls", this.containers.controls)
      // A prior unreachable update hides the wrapper. Legacy mounts do not
      // project node visibility, so restore it once Controls is reachable again.
      if (!isTreeLayoutMode(this.options)) $(this.containers.controls).show()
    }

    $(this.controls.zoom).toggle(this.options.controls.zoom)
    $(this.controls.userLocation).toggle(this.options.controls.userLocation)
    $(this.controls.zoomReset).toggle(this.options.controls.zoomReset)
    this.anotherMapModule()?.controls(this, this.containers.controls)

    $(this.containers.controls).removeClass("left")
    $(this.containers.controls).removeClass("right")
    // Legacy left/right only when chrome grid cell is missing.
    if (!this.getChromeSlot("controls") && (loc === "right" || loc === "left")) {
      $(this.containers.controls).addClass(loc)
    }
  }

  /**
   * Calculates ViewBox for a specific zoom level on demand
   * @param level - Target zoom level
   * @param baseViewBox - Optional base ViewBox to calculate from (defaults to svgDefault.viewBox)
   * @returns ViewBox for the specified zoom level
   */
  getZoomLevelViewBox(level: number): ViewBox {
    const delta = this.googleMaps.map ? 2 : this.options.zoom.delta
    return new ViewBox(
      viewBoxForZoomLevel(this.getAdjustedSvgDefaultViewBox(), level, delta),
    )
  }
  /**
   * Sets mouse pointer cursor style on hover on regions / markers.
   * @param {string} type - "pointer" or "default"
   */
  setCursor(type): void {
    type = type == "pointer" ? "pointer" : "default"
    this.options.cursor = type
    if (type == "pointer") $(this.containers.map).addClass("mapsvg-cursor-pointer")
    else $(this.containers.map).removeClass("mapsvg-cursor-pointer")
  }
  /**
   * Enables/disables "multiselect" option that allows to select multiple regions.
   * @param {boolean} on
   * @param {boolean} deselect - If true, deselects currently selected Regions
   */
  setMultiSelect(on: boolean, deselect?: boolean) {
    this.options.multiSelect = utils.numbers.parseBoolean(on)
    if (deselect !== false) this.deselectAllRegions()
  }
  /**
   * Sets choropleth map options
   * @param {object} options
   *
   * @example
   * mapsvg.setChoropleth({
   *   on: true,
   *   colors: {
   *     high: "#FF0000",
   *     low: "#00FF00"
   *   }
   *   labels: {
   *     high: "high",
   *     low: "low"
   *   }
   * });
   */
  _new_setChoropleth(options?: any) {
    options = options || this.options.choropleth
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))

    if (
      typeof options.coloring === "undefined" ||
      typeof options.coloring.palette === "undefined" ||
      typeof options.coloring.palette.colors === "undefined"
    ) {
      if (
        typeof options.sourceFieldSelect === "undefined" ||
        typeof options.sourceFieldSelect.variants === "undefined"
      ) {
        deepMerge(this.options.choropleth, options)
      } else {
        this.options.choropleth.sourceFieldSelect.variants = options.sourceFieldSelect.variants
      }
    } else {
      const paletteColorsIndexes = Object.keys(options.coloring.palette.colors)
      if (
        paletteColorsIndexes.length > 1 ||
        (paletteColorsIndexes[0] == "0" &&
          Object.keys(options.coloring.palette.colors[0]).length > 1)
      ) {
        this.options.choropleth.coloring.palette.colors = options.coloring.palette.colors
      } else {
        const paletteColorIndex = Object.keys(options.coloring.palette.colors)[0]
        deepMerge(
          this.options.choropleth.coloring.palette.colors[paletteColorIndex],
          options.coloring.palette.colors[paletteColorIndex],
        )
      }
    }

    this.updateChoroplethMinMax()

    if (
      this.options.choropleth.on &&
      this.options.choropleth.sourceFieldSelect.on &&
      this.options.choropleth.sourceFieldSelect.variants
    ) {
      if (!this.containers.choroplethSourceSelect) {
        const sourceSelectOptions = []
        this.options.choropleth.sourceFieldSelect.variants.forEach((variant) => {
          const option = textElement("option", "", variant) as HTMLOptionElement
          option.value = variant
          option.selected = variant === this.options.choropleth.sourceField
          sourceSelectOptions.push(option)
        })

        this.containers.choroplethSourceSelect = {
          container: $('<div class="mapsvg-choropleth-source-field"></div>')[0],
          select: $(
            '<select id="mapsvg-choropleth-source-field-select" class="mapsvg-select2"></select>',
          )[0],
          options: sourceSelectOptions,
        }

        $(this.containers.choroplethSourceSelect.select).append(
          this.containers.choroplethSourceSelect.options,
        )
        //$(this.containers.choroplethSourceSelect.container).append($(this.containers.choroplethSourceSelect.label));
        $(this.containers.choroplethSourceSelect.container).append(
          $(this.containers.choroplethSourceSelect.select),
        )

        $(this.containers.map).append($(this.containers.choroplethSourceSelect.container))

        $(this.containers.choroplethSourceSelect.select).mselect2()

        //select2 lib bug workaround. Should be on('change'...)
        $(this.containers.choroplethSourceSelect.select)
          .mselect2()
          .on("select2:select select2:unselecting", (e) => {
            if (e.cancelable) {
              e.preventDefault()
            }
            e.stopPropagation()
            this.setChoropleth({ sourceField: $(e.target).mselect2().val() })
          })
      } else {
        $(this.containers.choroplethSourceSelect.select).mselect2("destroy")
        $(this.containers.choroplethSourceSelect.select).find("option").remove()
        this.containers.choroplethSourceSelect.options = []
        this.options.choropleth.sourceFieldSelect.variants.forEach((variant) => {
          const option = textElement("option", "", variant) as HTMLOptionElement
          option.value = variant
          option.selected = variant === this.options.choropleth.sourceField
          this.containers.choroplethSourceSelect.options.push(option)
        })
        $(this.containers.choroplethSourceSelect.select).append(
          this.containers.choroplethSourceSelect.options,
        )
        $(this.containers.choroplethSourceSelect.select).mselect2({ width: "100%" })
      }
    }

    if (
      (!this.options.choropleth.on || !this.options.choropleth.sourceFieldSelect.on) &&
      this.containers.choroplethSourceSelect &&
      $(this.containers.choroplethSourceSelect.container).is(":visible")
    ) {
      $(this.containers.choroplethSourceSelect.container).hide()
    } else if (
      this.options.choropleth.on &&
      this.options.choropleth.sourceFieldSelect.on &&
      this.containers.choroplethSourceSelect &&
      !$(this.containers.choroplethSourceSelect.container).is(":visible")
    ) {
      $(this.containers.choroplethSourceSelect.container).show()
    }

    $(this.containers.map).find(".mapsvg-choropleth-legend").remove()

    if (this.options.choropleth.on && this.options.choropleth.coloring.legend.on) {
      const legend = this.options.choropleth.coloring.legend
      const coloringOptions = this.options.choropleth.coloring
      const mode = coloringOptions.mode === "gradient" ? "gradient" : "palette"
      const coloring = textElement("div", "mapsvg-choropleth-legend-" + mode)
      if (mode === "gradient") {
        coloring.appendChild(
          textElement(
            "div",
            "mapsvg-choropleth-legend-gradient-no-data",
            coloringOptions.noData.description,
          ),
        )
        const colors = textElement("div", "mapsvg-choropleth-legend-gradient-colors")
        for (let chunkIdx = 1; chunkIdx < 5; chunkIdx++) {
          const values = coloringOptions.gradient.values
          colors.appendChild(
            textElement(
              "div",
              "mapsvg-choropleth-legend-gradient-chunk",
              (values.maxAdjusted * chunkIdx) / 5 + values.min,
            ),
          )
        }
        coloring.appendChild(colors)
      } else {
        const addColor = (index: string | number, description: unknown) => {
          const row = textElement("div", "mapsvg-choropleth-legend-palette-color-wrap")
          row.setAttribute("data-idx", String(index))
          row.append(
            textElement("div", "mapsvg-choropleth-legend-palette-color"),
            textElement("div", "mapsvg-choropleth-legend-palette-color-description", description),
          )
          coloring.appendChild(row)
        }
        addColor("no-data", coloringOptions.noData.description)
        addColor("out-of-range", coloringOptions.palette.outOfRange.description)
        const paletteColors = coloringOptions.palette.colors
        paletteColors.forEach((color, idx) => {
          let description = color.description
          if (!description) {
            if (idx === 0 && !color.valueFrom && color.valueFrom !== 0) {
              description =
                legend.layout === "vertical" ? "Less then " + color.valueTo : "< " + color.valueTo
            } else if (idx === paletteColors.length - 1 && !color.valueTo) {
              description =
                legend.layout === "vertical" ? color.valueFrom + " or more" : color.valueFrom + " <"
            } else {
              description = color.valueFrom + " ≤ " + color.valueTo
            }
          }
          addColor(idx, description)
        })
      }
      this.containers.legend = {
        title: textElement("div", "mapsvg-choropleth-legend-title", legend.title),
        text: textElement("div", "mapsvg-choropleth-legend-text", legend.text),
        coloring,
        description: textElement("div", "mapsvg-choropleth-legend-description", legend.description),
        container: textElement(
          "div",
          "mapsvg-choropleth-legend mapsvg-choropleth-legend-" +
            legend.layout +
            " mapsvg-choropleth-legend-container-" +
            legend.container,
        ),
      }
      const elements = this.containers.legend
      elements.container.append(
        elements.title,
        elements.text,
        elements.coloring,
        elements.description,
      )
      this.containers.map.appendChild(elements.container)

      this.setChoroplethLegendCSS()

      this.regionsRepository.events.on(RepositoryEvent.AFTER_UPDATE, () => {
        this.redrawChoropleth()
      })

      this.objectsRepository.events.on(RepositoryEvent.AFTER_UPDATE, () => {
        this.redrawChoropleth()
      })
    }

    if (this.options.choropleth.on && this.options.choropleth.coloring.mode === "gradient") {
      const colors = this.options.choropleth.coloring.gradient.colors
      if (colors) {
        colors.lowRGB = tinycolor(colors.low).toRgb()
        colors.highRGB = tinycolor(colors.high).toRgb()
        colors.diffRGB = {
          r: colors.highRGB.r - colors.lowRGB.r,
          g: colors.highRGB.g - colors.lowRGB.g,
          b: colors.highRGB.b - colors.lowRGB.b,
          a: colors.highRGB.a - colors.lowRGB.a,
        }
        this.containers.legend && this.setChoroplethLegendCSS()
      }
    }

    this.redrawChoropleth()
  }
  /**
   * Redraws choropleth map colors
   * @private
   */
  redrawChoropleth() {
    this.updateChoroplethMinMax()
    this.redrawBubbles()
    this.reloadAllRegionStyles()
  }
  /**
   * Updates min/max values of choropleth fields
   * @private
   */
  updateChoroplethMinMax() {
    if (this.options.choropleth.on) {
      const gradient = this.options.choropleth.coloring.gradient,
        values = []

      gradient.values.min = 0
      gradient.values.max = null

      if (this.options.choropleth.source === "regions") {
        this.regionsRepository.getLoaded().forEach((region) => {
          const choropleth = region.getData()[this.options.choropleth.sourceField]
          if (choropleth) {
            values.push(choropleth)
          }
        })
      } else {
        this.objectsRepository.objects.forEach((object) => {
          const choropleth = object.getData()[this.options.choropleth.sourceField]
          choropleth != undefined && choropleth !== "" && values.push(choropleth)
        })
      }

      if (values.length > 0) {
        gradient.values.min = Math.min.apply(null, values)
        gradient.values.max = Math.max.apply(null, values)
        gradient.values.maxAdjusted = gradient.values.max - gradient.values.min
      }
    }
  }
  /**
   * Sets gradient for choropleth map
   * @private
   */
  setChoroplethLegendCSS(): void {
    const gradient = this.options.choropleth.coloring.gradient,
      legend = this.options.choropleth.coloring.legend,
      noData = this.options.choropleth.coloring.noData,
      outOfRange = this.options.choropleth.coloring.palette.outOfRange

    $(".mapsvg-choropleth-legend").css({
      width: legend.width,
      height: legend.height,
    })

    if (this.options.choropleth.coloring.mode === "gradient") {
      if (legend.layout === "horizontal") {
        // horizontal legend
        $(".mapsvg-choropleth-legend-horizontal .mapsvg-choropleth-legend-gradient-colors").css({
          background:
            "linear-gradient(to right," +
            gradient.colors.low +
            " 1%," +
            gradient.colors.high +
            " 100%)",
        })
      } else {
        // vertical legend
        $(".mapsvg-choropleth-legend-vertical .mapsvg-choropleth-legend-gradient-colors").css({
          background:
            "linear-gradient(to bottom," +
            gradient.colors.low +
            " 1%," +
            gradient.colors.high +
            " 100%)",
        })
      }

      $(".mapsvg-choropleth-legend-gradient-no-data").css({
        "background-color": noData.color,
      })
    } else {
      const paletteColors = this.options.choropleth.coloring.palette.colors

      paletteColors.forEach(function (paletteColor, idx) {
        $(
          '.mapsvg-choropleth-legend-palette-color-wrap[data-idx="' +
            idx +
            '"] .mapsvg-choropleth-legend-palette-color',
        ).css({
          "background-color": paletteColor.color,
        })
      })

      $(
        '.mapsvg-choropleth-legend-palette-color-wrap[data-idx="no-data"] .mapsvg-choropleth-legend-palette-color',
      ).css({
        "background-color": noData.color,
      })

      $(
        '.mapsvg-choropleth-legend-palette-color-wrap[data-idx="out-of-range"] .mapsvg-choropleth-legend-palette-color',
      ).css({
        "background-color": outOfRange.color,
      })
    }
  }

  get useShadowRoot(): boolean {
    return this.options.useShadowRoot || this.inBackend
  }

  /**
   * True when the map container already lives inside a ShadowRoot that this Map
   * did not create (e.g. Gutenberg / host app put the container into a shadow).
   */
  get isInsideForeignShadowRoot(): boolean {
    const node = this.container
    if (!node || typeof node.getRootNode !== "function") {
      return false
    }
    const root = node.getRootNode()
    if (!(root instanceof ShadowRoot)) {
      return false
    }
    // Own shadow after createContainers — not "foreign".
    if (this.containers?.shadowRoot && root === this.containers.shadowRoot) {
      return false
    }
    return true
  }

  /**
   * Whether Map should call attachShadow itself.
   * Skip when already inside a foreign ShadowRoot (avoid nested shadows).
   */
  get shouldCreateShadowRoot(): boolean {
    return this.useShadowRoot && !this.isInsideForeignShadowRoot
  }

  /**
   * Document that owns the map container. Differs from global `document` when
   * MapSVG runs in a parent window but the container lives in an iframe
   * (Gutenberg editor canvas).
   */
  get eventDocument(): Document {
    return this.container?.ownerDocument ?? document
  }

  /**
   * Window that owns the map container (see {@link eventDocument}).
   */
  get eventWindow(): Window & typeof globalThis {
    return (this.eventDocument.defaultView as Window & typeof globalThis) ?? window
  }

  /**
   * Where stylesheets / &lt;style&gt; tags must be injected:
   * own shadowRoot → foreign ShadowRoot (getRootNode) → document.
   */
  get styleRoot(): ShadowRoot | Document {
    if (this.containers?.shadowRoot) {
      return this.containers.shadowRoot
    }
    const node = this.container ?? this.containers?.wrapAll ?? this.containers?.map
    if (node && typeof node.getRootNode === "function") {
      const root = node.getRootNode()
      if (root instanceof ShadowRoot) {
        return root
      }
    }
    return this.eventDocument
  }

  /**
   * Append a &lt;link&gt; / &lt;style&gt; into {@link styleRoot}.
   */
  appendToStyleRoot(node: Node): void {
    const root = this.styleRoot
    if (root instanceof Document) {
      ;(root.head || root.documentElement).appendChild(node)
    } else {
      root.appendChild(node)
    }
  }

  /**
   * Inject core MapSVG + theme stylesheets into {@link styleRoot}.
   */
  private injectMapStylesheets(): void {
    const root = this.styleRoot
    const doc = this.eventDocument
    const injectIntoShadow = root instanceof ShadowRoot

    const hasStylesheet = (dataAttr: string, dataValue: string): boolean => {
      if (!injectIntoShadow) {
        return false
      }
      const links = root.querySelectorAll(`link[${dataAttr}]`)
      for (let i = 0; i < links.length; i++) {
        if (links[i].getAttribute(dataAttr) === dataValue) {
          return true
        }
      }
      return false
    }

    const appendStylesheet = (href: string, dataAttr: string, dataValue: string): void => {
      if (hasStylesheet(dataAttr, dataValue)) {
        return
      }
      const link = doc.createElement("link")
      link.rel = "stylesheet"
      link.href = href
      link.setAttribute(dataAttr, dataValue)
      this.appendToStyleRoot(link)
    }

    if (injectIntoShadow || !mapsvgCore.stylesAddedToBody) {
      for (const style of mapsvgCore.styles) {
        appendStylesheet(style.url + "?ver=" + style.version, "data-mapsvg-css", style.url)
      }
      if (!injectIntoShadow) {
        mapsvgCore.stylesAddedToBody = true
      }
    }

    const themeName = (this.options.theme && this.options.theme.name) || "default"
    appendStylesheet(
      mapsvgCore.routes.root + "themes/" + themeName + "/assets/css/styles.css?ver=" + mapsvgCore.version,
      "data-mapsvg-theme",
      themeName,
    )
  }

  /**
   * Sets custom map CSS.
   * CSS is added as <style>...</style> tag in the page <header>
   * @param {string} css
   * @private
   */
  private typographyResizeTimer?: number
  private typographyResize = () => {
    this.eventWindow.clearTimeout(this.typographyResizeTimer)
    if (this.options.typography?.mode === "theme") this.typographyResizeTimer = this.eventWindow.setTimeout(() => this.setTypography(), 200)
  }
  private typographyRuntime = new TypographyRuntime(() => this.events?.trigger("typographyChanged"))

  getTypographyStatus(): string { return this.typographyRuntime.status }

  mountTypography(element: HTMLElement): void {
    const root = element.getRootNode() as Document | ShadowRoot
    this.typographyRuntime.mount(element, root)
  }

  setTypography(options?: Partial<TypographyOptions>): void {
    this.options.typography = deepMerge(this.options.typography ?? structuredClone(DEFAULT_TYPOGRAPHY), options ?? {})
    if (this.containers?.wrapAll) void this.typographyRuntime.update(this.options.typography, this.eventDocument, this.inBackend, window.mapsvgFrontendParams?.typographyProbeUrl)
  }

  setCss(css?: string): void {
    if (css && css.indexOf("%id%") !== -1) {
      css = css.replace(/%id%/g, "" + this.id)
    }
    if (css !== undefined) this.options.css = css

    if (!this.liveCss) {
      const style = this.eventDocument.createElement("style")
      this.appendToStyleRoot(style)
      this.liveCss = style
    }

    this.liveCss.textContent = this.options.css
    this.refreshControllerCustomCss()
  }

  private refreshControllerCustomCss(): void {
    const views = [...Object.values(this.controllers || {}), ...Object.values(this.controllers?.tooltips || {})]
    for (const controller of new Set(views)) {
      if (controller && "refreshCustomCss" in controller && typeof controller.refreshCustomCss === "function") controller.refreshCustomCss()
    }
  }
  /**
   * Sets the filters schema for the map.
   * The filters schema defines the available filters for the map.
   *
   * @param filtersSchema - An array of filter fields. Each field is an object with the following properties:
   * - `id` (string): The unique identifier of the filter field.
   * - `title` (string): The title of the filter field.
   * - `type` (string): The type of the filter field. Supported types are: "text", "select", "checkbox", "radio", "range".
   * - `options` (object): Additional options for the filter field. The options depend on the filter type.
   *
   * @returns {void}
   */
  setFiltersSchema(filtersSchema?: any[]): void {
    deepMerge(this.options, { filtersSchema: filtersSchema })
    if (!this.filtersSchema) {
      this.filtersSchema = new Schema({
        objectNamePlural: "filters",
        objectNameSingular: "filter",
        fields: this.options.filtersSchema,
      })
    }
    this.filtersSchema.setFields(filtersSchema)
    this.setFilters()
  }
  /**
   * Sets filter options
   * @param {object} options
   * @example
   * mapsvg.setFilters{{
   *   on: true,
   *   location: "leftSidebar"
   * }};
   */
  setFilters(options?: { [key: string]: any }): void {
    options = options || this.options.filters
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))
    options.hide != undefined && (options.hide = utils.numbers.parseBoolean(options.hide))
    deepMerge(this.options, { filters: options })

    // Filter schema not loaded yet, exit early
    if (typeof this.filtersSchema === "undefined") {
      return
    }

    // Draw rule: filters mounts only when reachable in the nodes tree.
    const treeMode = isTreeLayoutMode(this.options)
    const legacyCustom = treeMode && this.hasLegacyCustomTreePlacement("filters")
    const treeHost = treeMode && !legacyCustom ? this.getTreeComponentHost("filters") : null
    const nodeLocation = resolveFiltersLocation(this.options)
    if (nodeLocation === null || (treeMode && !treeHost && !legacyCustom)) {
      this.controllers.filters?.destroy()
      this.controllers.filters = null
      // initMap may still have reserved a filters afterLoad blocker (schema on + unreachable).
      this.releaseFiltersAfterLoadBlocker()
      return
    }
    if (!treeMode && nodeLocation !== "custom") {
      this.options.filters.location = nodeLocation
    }

    const scrollable = false

    if (
      !mapsvgCore.googleMapsApiLoaded &&
      this.options.filters.on &&
      this.filtersSchema &&
      this.filtersSchema.getField("distance")
    ) {
      this.loadGoogleMapsAPI(
        () => {
          return 1
        },
        () => {
          return 1
        },
      )
    }

    if (!treeMode &&
      ["leftSidebar", "rightSidebar", "header", "footer", "custom", "map"].indexOf(
        this.options.filters.location,
      ) === -1
    ) {
      this.options.filters.location = "leftSidebar"
    }

    if (this.options.filters.on) {
      if (this.formBuilder) {
        this.formBuilder.destroy()
      }

      if (!this.containers.filters) {
        this.containers.filters = $('<div class="mapsvg-filters-wrap"></div>')[0]
      } else {
        $(this.containers.filters).empty()
        $(this.containers.filters).show()
      }

      if ($(this.containers.filtersModal)) {
        $(this.containers.filtersModal).css({ width: this.options.filters.width })
      }

      let container: HTMLElement

      if (treeHost) {
        container = treeHost
      } else if (this.options.filters.location === "custom") {
        if ($("#" + this.options.filters.containerId).length) {
          container = $("#" + this.options.filters.containerId)[0]
        } else {
          this.decrementAfterloadBlockers()
          console.error(
            "[CLIENT-007] MapSVG: filter container #" +
              this.options.filters.containerId +
              " does not exist — Read more: https://mapsvg.com/docs/errors#CLIENT-007",
          )
          return
        }
      } else {
        if (isPhone()) {
          container = this.containers.header
          this.setContainers({ header: { on: true } })
        } else {
          const location = isPhone() ? "header" : this.options.filters.location
          if (
            (hasRuntimeFeature("directory") && this.options.menu.on) &&
            this.controllers.directory &&
            this.options.menu.location === this.options.filters.location
          ) {
            container = $(this.controllers.directory?.containers.view).find(
              ".mapsvg-directory-filter-wrap",
            )[0]
            if (!container) {
              return
            }
          } else {
            container = this.containers[location]
          }
        }
      }

      if (this.regionsRepository || this.objectsRepository) {
        this.loadFiltersController(container, false)
      }
    } else {
      this.controllers.filters && this.controllers.filters.destroy()
      this.controllers.filters = null
    }
    if (
      this.controllers.directory &&
      this.options.menu.location === this.options.filters.location
    ) {
      this.controllers.directory?.updateTopShift()
    }
    setTimeout(() => {
      this.updateFiltersState()
    }, 100)
  }
  /**
   * Updates filters in drop-downs. For example, when region is clicked and data is filtered -
   * it selects corresponding region in the drop-down filter
   * @private
   */
  updateFiltersState() {
    if (this.options.filters && this.options.filters.on && this.controllers.filters) {
      this.controllers.filters.update(this.filtersRepository.query)
    }

    this.updateFilterTags()
  }

  private setGlobalDistanceFilter(): void {
    if (
      this.objectsRepository &&
      this.objectsRepository.query.filters &&
      this.objectsRepository.query.filters.distance
    ) {
      if (window && window.mapsvg) {
        window.mapsvg.distanceSearch = this.objectsRepository.query.filters.distance
      }
    } else {
      if (window && window.mapsvg) {
        window.mapsvg.distanceSearch = null
      }
    }
  }

  public seFilterTags() {
    this.containers.filterTags =
      this.containers.filterTags || $('<div class="mapsvg-filter-tags"></div>')[0]
    $(this.containers.filterTags).empty()
    $(this.containers.filterTags).off()
    if (this.options.filters.on) {
      $(this.containers.filterTags).hide()
      return
    } else {
      $(this.containers.filterTags).show()
    }

    if ((hasRuntimeFeature("directory") && this.options.menu.on) && this.controllers.directory) {
      $(this.controllers.directory?.containers.toolbar).append(this.containers.filterTags)
      this.controllers.directory?.updateTopShift()
    } else {
      $(this.containers.map).append(this.containers.filterTags)
      if (this.options.zoom.buttons.on) {
        if (this.options.layersControl.on) {
          if (this.options.layersControl.position == "top-left") {
            $(this.containers.filterTags).css({
              right: 0,
              bottom: 0,
            })
          } else {
            $(this.containers.filterTags).css({
              bottom: 0,
            })
          }
        } else {
          if (this.options.zoom.buttons.location == "left") {
            $(this.containers.filterTags).css({
              right: 0,
            })
          }
        }
      }
    }

    $(this.containers.filterTags).on(
      "click",
      ".mapsvg-filter-delete",
      (e: JQuery.MouseEventBase) => {
        const filterField = $(e.target).data("filter")
        $(e.target).parent().remove()
        const repo =
          this.componentSource("filters") === "regions"
            ? this.regionsRepository
            : this.objectsRepository
        if (filterField === "search") {
          repo.query.setSearch(null)
        } else {
          repo.query.removeFilter(filterField)
        }

        this.deselectAllRegions()
        repo.find()
      },
    )
  }

  private updateFilterTags() {
    this.seFilterTags()
    if (this.options.filters.on) {
      return
    }

    const repo =
      this.componentSource("filters") === "regions" ? this.regionsRepository : this.objectsRepository

    const tags: { label: string; value: string; name: string }[] = []

    if (repo.query.search) {
      tags.push({ label: "", value: repo.query.search, name: "search" })
    }

    const { distance, ...filters } = repo.query.filters
    if (distance && distance.address) {
      tags.push({ label: "", value: distance.address, name: "distance" })
    }

    for (const field_name in filters) {
      const field_value = filters[field_name]
      const filterField = this.filtersSchema?.getField(field_name)
      const repoFieldName = filterField ? filterField.parameterNameShort : field_name
      const repoField = repo.getSchema().getField(repoFieldName)
      if (!repoField) {
        continue
      }
      const fieldFormattedName = filterField ? filterField.label : (repoField.label ?? "")
      let fieldFormattedValue = field_value
      if (repoField.type === "post" && field_value && typeof field_value === "object" && !Array.isArray(field_value)) {
        fieldFormattedValue = field_value.name ?? field_value.ID ?? field_value.id ?? ""
      }

      if (filterField) {
        if (filterField.type === "select") {
          if (filterField.multiselect) {
            fieldFormattedValue = field_value.map((value) => value.label).join(", ")
          } else {
            fieldFormattedValue = filterField.options.find(
              (option) => option.value === field_value,
            ).label
          }
        }
      }

      tags.push({ label: fieldFormattedName, value: fieldFormattedValue, name: field_name })
    }

    this.containers.filterTags.replaceChildren()
    for (const tag of tags) {
      const element = textElement(
        "div",
        "mapsvg-filter-tag",
        `${tag.label ? tag.label + ": " : ""}${tag.value ?? ""}`,
      )
      const remove = textElement("span", "mapsvg-filter-delete", "×")
      remove.setAttribute("data-filter", tag.name)
      element.appendChild(remove)
      this.containers.filterTags.appendChild(element)
    }
  }

  /**
   * Inline critical region-label CSS before mapsvg-bundle.css finishes loading,
   * so label size/position are correct on first paint (esp. in Shadow DOM).
   */
  injectCriticalRegionLabelCss(target: ParentNode): void {
    if (
      target === document.head &&
      document.head.querySelector('style[data-mapsvg-critical="region-labels"]')
    ) {
      return
    }

    const style = document.createElement("style")
    style.setAttribute("data-mapsvg-critical", "region-labels")
    style.textContent = `
.mapsvg-region-label {
  font-size: var(--mapsvg-font-size, 14px);
  padding: 2px 12px;
  border-radius: 15px;
  background: #ffffffbb;
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  font-family: var(--mapsvg-font-family, Helvetica, Arial, sans-serif);
}
.mapsvg-region-label:empty {
  display: none;
}
`.trim()
    target.appendChild(style)
  }

  createContainers() {
    this.containers = {
      ...this.containers,
      map: this.container,
      scrollpane: $('<div class="mapsvg-scrollpane"></div>')[0],
      scrollpaneWrap: $('<div class="mapsvg-scrollpane-wrap"></div>')[0],
      layers: $('<div class="mapsvg-layers-wrap"></div>')[0],
    }

    this.containers.map.appendChild(this.containers.layers)
    this.containers.map.appendChild(this.containers.scrollpaneWrap)
    this.containers.scrollpaneWrap.appendChild(this.containers.scrollpane)

    this.containers.map.classList.add("mapsvg")
    // Repeated shortcode embeds keep independent document/ShadowRoot host IDs.
    const instanceId = this.containers.map.id.startsWith(`mapsvg-${this.id}-`)
      ? this.containers.map.id.slice("mapsvg-".length)
      : String(this.id)

    // this.containers.wrapAll = document.createElement("div")
    // this.containers.wrapAll.classList.add("mapsvg-wrap-all")
    // this.containers.wrapAll.id = "mapsvg-map-" + this.id
    // this.containers.wrapAll.setAttribute("data-map-id", this.id ? this.id.toString() : "")

    // this.containers.wrap = document.createElement("div")
    // this.containers.wrap.classList.add("mapsvg-wrap")

    this.containers.mapContainer = document.createElement("div")
    this.containers.mapContainer.classList.add("mapsvg-map-container")

    this.containers.leftSidebar = document.createElement("div")
    this.containers.leftSidebar.className =
      "mapsvg-sidebar mapsvg-top-container mapsvg-sidebar-left"
    this.containers.rightSidebar = document.createElement("div")
    this.containers.rightSidebar.className =
      "mapsvg-sidebar mapsvg-top-container mapsvg-sidebar-right"

    this.containers.header = document.createElement("div")
    this.containers.header.className = "mapsvg-header mapsvg-top-container"
    this.containers.footer = document.createElement("div")
    this.containers.footer.className = "mapsvg-footer mapsvg-top-container"

    this.containers.wrapAll = $('<div class="mapsvg-wrap-all"></div>')
      .attr("id", "mapsvg-map-" + instanceId)
      .attr("data-map-id", this.id)[0]
    this.containers.wrap = $('<div class="mapsvg-wrap"></div>')[0]
    this.containers.mapContainer = $('<div class="mapsvg-map-container"></div>')[0]
    this.containers.leftSidebar = $(
      '<div class="mapsvg-sidebar mapsvg-top-container mapsvg-sidebar-left"></div>',
    ).hide()[0]
    this.containers.rightSidebar = $(
      '<div class="mapsvg-sidebar mapsvg-top-container mapsvg-sidebar-right"></div>',
    ).hide()[0]
    this.containers.header = $('<div class="mapsvg-header mapsvg-top-container"></div>').hide()[0]
    this.containers.footer = $('<div class="mapsvg-footer mapsvg-top-container"></div>').hide()[0]

    // Assuming this.containers.wrapAll, this.containers.map, etc. are already references to DOM elements

    // Insert this.containers.wrapAll before this.containers.map
    this.containers.map.parentNode.insertBefore(this.containers.wrapAll, this.containers.map)

    // Append this.containers.header, this.containers.wrap, and this.containers.footer to this.containers.wrapAll
    this.containers.wrapAll.appendChild(this.containers.header)
    this.containers.wrapAll.appendChild(this.containers.wrap)
    this.containers.wrapAll.appendChild(this.containers.footer)

    // Append this.containers.map to this.containers.mapContainer
    this.containers.mapContainer.appendChild(this.containers.map)

    // Append this.containers.leftSidebar, this.containers.mapContainer, and this.containers.rightSidebar to this.containers.wrap
    this.containers.wrap.appendChild(this.containers.leftSidebar)
    this.containers.wrap.appendChild(this.containers.mapContainer)
    this.containers.wrap.appendChild(this.containers.rightSidebar)

    this.applyLayoutGridShell()

    if (this.shouldCreateShadowRoot) {
      // Host keeps WP-facing id; map chrome lives inside the shadow.
      this.containers.root = $('<div class="mapsvg-shadow-root"></div>')
        .attr("id", "mapsvg-map-" + instanceId)
        .attr("data-map-id", this.id)[0]

      // open — accessible as host.shadowRoot from outside
      this.containers.shadowRoot = this.containers.root.attachShadow({ mode: "open" })
      this.containers.wrapAll.parentNode.insertBefore(this.containers.root, this.containers.wrapAll)
      this.containers.shadowRoot.appendChild(this.containers.wrapAll)
    }

    // Own shadow, foreign shadow (getRootNode), or document.head
    this.injectMapStylesheets()
    this.mountTypography(this.containers.wrapAll)
    this.setTypography(this.options.typography)
    this.eventWindow.addEventListener("resize", this.typographyResize)

    // @font-face inside Shadow DOM is ignored; register the icon font on the document
    ensureIconFontFace(mapsvgCore.routes.root, mapsvgCore.version)

    const styleHost =
      this.styleRoot instanceof Document
        ? this.styleRoot.head || this.styleRoot.documentElement
        : this.styleRoot
    this.injectCriticalRegionLabelCss(styleHost)
    ensureLoadingCriticalCss(styleHost)

    this.containers.wrapAll.setAttribute("data-mapsvg-theme", this.options.theme.name)

    this.containersCreated = true
    this.ensureTreeBreakpointListener()

    if (!this.resizeSensor) {
      this.resizeSensor = new ResizeSensor(this.containers.map, () => {
        this.throttle(
          () => {
            this.redraw()
            this.events.trigger(MapEventType.RESIZE, {
              viewBox: this.viewBox,
              mapWidth: this.containers.map.clientWidth,
              mapHeight: this.containers.map.clientHeight,
            })
          },
          50,
          this,
        )
      })
    }

    // Legacy maps keep the historical toolbar mount outside the layout grid.
    // Tree-layout maps mount Mobile Toolbar through an explicit component node.
    if (!isTreeLayoutMode(this.options)) {
      this.containers.toolbar = $('<div class="mapsvg-map-toolbar"></div>')[0]
      this.containers.wrapAll.appendChild(this.containers.toolbar)
    }

    this.disableAnimation()
    this.addLayer("markers")
    this.addLayer("labels")
    this.addLayer("bubbles")
    this.addLayer("popovers")
    this.addLayer("scrollpane")
    this.applyTreeInternalVisibility()
  }

  /**
   * Optional grid shell from `options.layout.grids` (desktop/tablet/mobile).
   * Keeps existing container refs and moves them into named slot cells.
   */
  private applyLayoutGridShell(): void {
    const breakpoint = this.getLayoutBreakpoint()
    const selected = pickLayoutGrid(this.options.layout, {
      isPhone: isPhone(),
      isTablet: isTablet(),
      breakpoint,
    })
    if (!selected || !this.containers.wrapAll) return

    const doc = this.eventDocument
    const mobile = this.resolveTreeMobileToolbar(selected.widgets, breakpoint)
    const projection = mobile ? projectMobileToolbarLayout(Array.from(this.options.nodes || []), selected.widgets, breakpoint, mobile.targets) : null
    const treeMode = isTreeLayoutMode(this.options)
    const candidate = buildLayoutGridShell(doc, projection ? { ...selected, widgets: projection.widgets } : selected, {
      rowSizing: "content",
      ...(treeMode ? {
        nodes: (projection?.nodes ?? Array.from(this.options.nodes || [])) as MapSvgNode[],
        breakpoint,
      } : {}),
    })
    const existing = treeMode ? Array.from(this.containers.wrapAll.children).find(child => child.classList.contains("mapsvg-layout-grid")) as HTMLElement | undefined : undefined
    const { grid, slots, retired } = reconcileLayoutGridShell(existing, candidate)

    grid.dataset.mapsvgLayoutBreakpoint = breakpoint

    const slotElements: Record<string, HTMLElement | undefined> = {
      Header: this.containers.header,
      LeftSidebar: this.containers.leftSidebar,
      Main: this.containers.wrap,
      RightSidebar: this.containers.rightSidebar,
      Footer: this.containers.footer,
      // Backward alias while old JSON may still contain Map
      Map: this.containers.wrap,
    }

    if (!treeMode) this.restoreLegacyMapShell()
    this.activeLayoutSlotIds = new Set(slots.keys())
    this.layoutSlotHosts = mountLayoutSlotHosts(
      doc, slots, slotElements, this.layoutSlotHosts, treeMode,
    )

    const toolbar = this.containers.toolbar
    if (!treeMode) this.containers.wrapAll.innerHTML = ""
    if (grid.parentElement !== this.containers.wrapAll) this.containers.wrapAll.appendChild(grid)
    if (toolbar && !treeMode) {
      this.containers.wrapAll.appendChild(toolbar)
    }
    if (treeMode) {
      this.containers.leftSidebar?.remove()
      this.containers.rightSidebar?.remove()
      this.applyTreeSlotColors()
      this.mountTreeLayoutNodes()
      for (const cell of retired) cell.remove()
      if (mobile && projection) {
        const mapCell = slots.get(mobile.targets.mapId)
        const listCell = slots.get(mobile.targets.listId)
        if (mapCell && listCell) {
          // Keep Map in layout as the row-height anchor, preserving camera and controllers.
          mapCell.style.opacity = mobile.view === "list" ? "0" : ""
          mapCell.inert = mobile.view === "list"
          if (mobile.view === "list") mapCell.setAttribute("aria-hidden", "true")
          listCell.style.display = mobile.view === "map" ? "none" : ""
          listCell.style.zIndex = "1"
          grid.dataset.mapsvgMobileView = mobile.view
        }
      }
    }
    this.events.trigger("layoutBreakpointChange", { breakpoint })
  }

  private treeMobileToolbar?: { key: string; targets: MobileToolbarTargets; view: MobileToolbarView }

  private resolveTreeMobileToolbar(widgets: import("../Layout/LayoutGridRuntime").LayoutGridWidget[], breakpoint: LayoutGridBreakpoint) {
    if (!hasRuntimeFeature("directory") || !isTreeLayoutMode(this.options) || this.layoutPreviewBreakpoint || this.options.menu?.on === false) {
      this.treeMobileToolbar = undefined
      return undefined
    }
    const nodes = Array.from(this.options.nodes || []) as MapSvgNode[]
    const pageNodes = mobileToolbarPageNodes(nodes, Array.from(this.options.scenes || []), this.activePageId)
    const toolbar = visibleMobileToolbar(pageNodes, widgets, breakpoint)
    const { targets } = resolveMobileToolbarTargets(pageNodes, this.options.mobileView ?? {})
    if (!toolbar || !targets || !widgets.some(widget => widget.id === targets.mapId) ||
      [targets.mapId, targets.listId].includes(slotForNode(nodes, toolbar.id) || "")) {
      this.treeMobileToolbar = undefined
      return undefined
    }
    const first = this.options.mobileView?.showFirst ?? this.options.menu?.showFirst ?? "map"
    const key = JSON.stringify([this.activePageId, toolbar.id, targets.mapId, targets.listId, breakpoint, first])
    if (this.treeMobileToolbar?.key !== key) this.treeMobileToolbar = { key, targets, view: first === "list" || first === "directory" ? "list" : "map" }
    return this.treeMobileToolbar
  }

  /** Temporary visitor view; does not update App options or trigger draft autosave. */
  setMobileToolbarView(view: MobileToolbarView): void {
    if (!this.treeMobileToolbar || (view !== "map" && view !== "list")) return
    if (this.treeMobileToolbar.view === view) return
    if (view === "list") {
      this.saveGoogleMapsViewport()
      if (this.googleMaps) this.googleMaps.needsViewportRestore = true
    }
    this.treeMobileToolbar.view = view
    this.applyLayoutGridShell()
    this.controllers.toolbar?.setActive(view === "list" ? "menu" : "map")
    if (view === "map") this.redraw()
    this.events.trigger("mobileViewChange", { view })
  }

  private layoutSlotHosts = new Map<string, HTMLElement>()
  private activeLayoutSlotIds = new Set<string>()
  private layoutNodeHosts = new Map<string, HTMLElement>()
  private activeTreeNodeIds = new Set<string>()
  private treeViewportResizeListener?: () => void
  private treeViewportBreakpoint?: LayoutGridBreakpoint

  private restoreLegacyMapShell(): void {
    const { wrap, leftSidebar, mapContainer, rightSidebar } = this.containers
    if (!wrap || !mapContainer) return
    if (mapContainer.parentElement !== wrap) wrap.appendChild(mapContainer)
    if (leftSidebar) wrap.insertBefore(leftSidebar, mapContainer)
    if (rightSidebar) wrap.appendChild(rightSidebar)
  }

  private applyTreeSlotColors(): void {
    if (!isTreeLayoutMode(this.options)) return
    const nodes = Array.from(this.options.nodes || []) as MapSvgNode[]
    for (const [slotId, host] of this.layoutSlotHosts) {
      const node = nodes.find(item => item.id === slotId)
      if (!node) continue
      // Paint the whole grid cell, including empty/fill space; avoid double alpha.
      const cell = host.parentElement?.classList.contains("mapsvg-layout-slot") ? host.parentElement : host
      if (cell !== host) host.style.backgroundColor = ""
      applyContainerBackground(cell, node, this.options.colors)
    }
  }

  /** Route explicit legacy location overrides to visible tree slots when possible. */
  private getLocationContainer(location: string): HTMLElement | undefined {
    if (isTreeLayoutMode(this.options)) {
      const slotId = ({
        header: "Header",
        leftSidebar: "LeftSidebar",
        rightSidebar: "RightSidebar",
        footer: "Footer",
      } as Record<string, string>)[location]
      if (slotId) {
        return this.activeLayoutSlotIds.has(slotId) ? this.layoutSlotHosts.get(slotId) : undefined
      }
    }
    return this.containers[location]
  }
  private readonly onTreeBreakpointChange = () => {
    if (!isTreeLayoutMode(this.options) || this.layoutPreviewBreakpoint || !this.containersCreated) return
    this.applyLayoutGridShell()
    this.setContainers(this.options.containers)
    this.applyMapChromeShell()
    if (this.containers.layersControl) this.mountChromeWidget("layers", this.containers.layersControl)
    if (this.containers.controls) this.mountChromeWidget("controls", this.containers.controls)
    this.refreshTreeControllers()
  }

  private ensureTreeBreakpointListener(): void {
    if (!isTreeLayoutMode(this.options) || this.treeViewportResizeListener) return
    const viewport = this.eventWindow
    this.treeViewportBreakpoint = viewportLayoutBreakpoint(viewport.innerWidth)
    this.treeViewportResizeListener = () => {
      const breakpoint = viewportLayoutBreakpoint(viewport.innerWidth)
      if (breakpoint === this.treeViewportBreakpoint) return
      this.treeViewportBreakpoint = breakpoint
      this.onTreeBreakpointChange()
    }
    viewport.addEventListener("resize", this.treeViewportResizeListener)
  }

  private stopTreeBreakpointListener(): void {
    if (!this.treeViewportResizeListener) return
    this.eventWindow.removeEventListener("resize", this.treeViewportResizeListener)
    this.treeViewportResizeListener = undefined
    this.treeViewportBreakpoint = undefined
  }

  /** Keep actual component DOM attached to stable hosts while grid breakpoints change. */
  private mountTreeLayoutNodes(): void {
    const currentNodes = Array.from(this.options.nodes || []) as MapSvgNode[]
    if (currentNodes.some(node => node.type === "map" && mapContentRoots(currentNodes, node.id).length > 0)) {
      const normalized = normalizeNodesOptions(this.options as MapOptions & Record<string, any>)
      this.options.nodes = normalized.nodes
      this.options.scenes = normalized.scenes
    }
    this.activeTreeNodeIds.clear()
    const breakpoint = this.getLayoutBreakpoint()
    if (this.containers.wrap) {
      this.containers.wrap.style.flexDirection = "column"
      this.containers.wrap.style.width = "100%"
    }
    const nodes = Array.from((this.options.nodes || []) as ArrayLike<MapSvgNode>)
    const byId = new Map(nodes.map((node) => [node.id, node]))
    const visited = new Set<string>()
    const mountedHosts = new Set<string>()
    let mapMounted = false

    const mountChildren = (parent: MapSvgNode, host: HTMLElement, bounded = false) => {
      const children: HTMLElement[] = []
      for (const childId of parent.children || []) {
        const child = byId.get(childId)
        if (!child || visited.has(child.id)) continue
        visited.add(child.id)
        if (child.settings?.on === false || containerLayout(child, breakpoint).hidden) continue
        this.activeTreeNodeIds.add(child.id)

        if (child.type === "map") {
          if (this.containers.mapContainer && this.containers.wrap) {
            this.containers.wrap.dataset.mapsvgNodeId = child.id
            children.push(this.containers.wrap)
            mapMounted = true
            mountChildren(child, this.containers.mapContainer, true)
          }
          continue
        }
        if (isMapInternalType(child.type)) {
          continue // Map-owned features keep their existing canvas/chrome mount points.
        }

        let childHost = this.layoutNodeHosts.get(child.id)
        if (!childHost) {
          childHost = this.eventDocument.createElement("div")
          childHost.className = child.type === "frame" ? "mapsvg-layout-frame" : "mapsvg-layout-component"
          childHost.dataset.mapsvgNodeId = child.id
          this.layoutNodeHosts.set(child.id, childHost)
        }
        const presentation = stackComponentLayout(child, breakpoint, nodes)
        if (child.type === "modal") {
          const details = this.controllers.detailsView
          setStackComponentOpen(childHost, !!details?.opened && details.containers.parent === childHost)
        }
        const childBounded = applyStackChildLayout(childHost, child.type === "filters" ? { ...presentation, padding: 0, paddingBottom: undefined } : presentation, bounded)
        if (child.type === "frame") applyContainerBackground(childHost, child, this.options.colors)
        childHost.style.zIndex = child.type === "modal" ? "30"
          : ["legend", "layers"].includes(child.type) ? "3" : parent.type === "map" ? "21"
          : child.type === "filters" ? "3" : ""
        children.push(childHost)
        mountedHosts.add(child.id)
        if (child.type === "frame") mountChildren(child, childHost, childBounded)
      }
      reconcileLayoutChildren(host, children)
    }

    for (const slotId of this.activeLayoutSlotIds) {
      const node = byId.get(slotId)
      const host = this.layoutSlotHosts.get(slotId)
      if (node?.type === "slot" && host) {
        const settings = containerLayout(node, breakpoint)
        const cell = host.parentElement
        const bounded = cell?.dataset.mapsvgHeightMode === "fixed" || cell?.dataset.mapsvgRowFollower === "true" || settings.maxHeight !== undefined
        // The cell owns dimensions; a bounded content stack distributes the remainder.
        applyStackContentLayout(host, settings, bounded)
        if (cell) {
          cell.style.display = "flex"
          cell.style.flexDirection = "column"
          cell.style.overflow = "visible"
        }
        mountChildren(node, host, bounded)
      }
    }
    for (const [id, host] of this.layoutNodeHosts) if (!mountedHosts.has(id)) host.remove()
    if (!mapMounted) this.containers.wrap?.remove()
    this.applyTreeInternalVisibility()
  }

  private applyTreeInternalVisibility(): void {
    if (!isTreeLayoutMode(this.options)) return
    const region = findReachableNodesByType(this.options, "region")[0]
    const marker = findReachableNodesByType(this.options, "marker")[0]
    this.containers.map?.classList.toggle("mapsvg-hide-region-node", region?.settings?.on === false)
    this.containers.map?.classList.toggle("mapsvg-hide-marker-node", marker?.settings?.on === false)
    if (this.layers.markers) {
      this.layers.markers.style.display = marker?.settings?.on === false ? "none" : ""
    }
  }

  private getTreeComponentHost(type: string): HTMLElement | null {
    for (const node of findReachableNodesByType(this.options, type)) {
      if (!this.activeTreeNodeIds.has(node.id)) continue
      const host = this.layoutNodeHosts.get(node.id)
      if (host) return host
    }
    return null
  }

  private syncMobileToolbar(): void {
    const treeMode = isTreeLayoutMode(this.options)
    if (treeMode && this.containers.wrapAll) {
      $(this.containers.wrapAll).removeClass("mapsvg-hide-map-list-buttons")
    }
    const toolbarNode = treeMode
      ? findReachableNodesByType(this.options, "mobileToolbar")[0]
      : undefined
    const container = treeMode
      ? this.getTreeComponentHost("mobileToolbar")
      : this.containers.toolbar
    const shouldMount = Boolean(
      hasRuntimeFeature("directory") && container &&
      (treeMode
        ? toolbarNode?.settings?.on !== false && Boolean(this.treeMobileToolbar)
        : this.controllers.directory && this.options.menu?.on),
    )

    if (!shouldMount) {
      this.controllers.toolbar?.destroy()
      delete this.controllers.toolbar
      return
    }

    if (
      this.controllers.toolbar &&
      !this.controllers.toolbar.destroyed &&
      this.controllers.toolbar.containers.parent === container
    ) {
      const next = { ...this.options.mobileView, active: this.treeMobileToolbar?.view === "list" ? "menu" : "map" }
      if (Object.entries(next).some(([key, value]) => this.controllers.toolbar.state[key] !== value)) this.controllers.toolbar.setState(next)
      return
    }

    this.createToolbar(container)
  }

  private shouldPlaceDetailsInFlow(
    modalMount: ModalMountResolution,
    treeModalHost: HTMLElement | null,
    locationOverride?: string,
  ): boolean {
    return !!treeModalHost &&
      !locationOverride &&
      modalMount.kind === "main-overlay" &&
      !(isPhone() && this.options.detailsView.mobileFullscreen)
  }

  private hasLegacyCustomTreePlacement(type: string): boolean {
    return findReachableNodesByType(this.options, type).some((node) =>
      node.settings?.location === "custom" &&
      !node.settings?.placement &&
      typeof node.settings?.containerId === "string" &&
      node.settings.containerId !== ""
    )
  }

  /** Paint supported style-only node edits in place; structural changes reconcile mounts. */
  refreshTreeLayout(previousNodes?: unknown): void {
    if (!isTreeLayoutMode(this.options) || !this.containersCreated) return
    if (canRepaintNodeStyles(previousNodes, this.options.nodes)) {
      this.applyTreeSlotColors()
      for (const node of Array.from(this.options.nodes || []) as MapSvgNode[]) {
        const host = this.layoutNodeHosts.get(node.id)
        if (node.type === "frame" && host) applyContainerBackground(host, node, this.options.colors)
      }
      for (const type of ["legend", "layers"] as const) {
        const node = this.mapPresentationNode(type)
        const mount = node && this.mapPresentationMount(node)
        const element = type === "legend" ? this.legendView?.element : this.layersControlView?.element
        if (node && mount && element) applyMapPresentationStyles(element, node, mount.inline ? undefined : mount.host)
      }
      return
    }
    this.applyLayoutGridShell()
    this.setContainers(this.options.containers)
    this.refreshTreeControllers()
  }

  private refreshTreeControllers(): void {
    if (!isTreeLayoutMode(this.options) || !this.mapDataLoaded) return
    const directory = this.controllers.directory
    const directoryHost = this.getTreeComponentHost("directory")
    const customDirectory = this.hasLegacyCustomTreePlacement("directory")
    if ((directory || (this.options.menu.on && (directoryHost || customDirectory))) &&
      (!directory || directory.destroyed || !this.options.menu.on || (!customDirectory && directory.containers.parent !== directoryHost))) {
      this.setMenu(this.options.menu)
    }
    const filters = this.controllers.filters
    const filterHost = this.getTreeComponentHost("filters")
    const customFilters = this.hasLegacyCustomTreePlacement("filters")
    if ((filters || (this.options.filters.on && (filterHost || customFilters))) &&
      (!filters || filters.destroyed || !this.options.filters.on || (!customFilters && filters.containers.parent !== filterHost))) {
      this.setFilters(this.options.filters)
    } else if (filters && filterHost) {
      const node = findReachableNodesByType(this.options, "filters")[0]
      const profile = containerLayout(node, this.getLayoutBreakpoint())
      const styles = {
        padding: filterLayoutPadding(node, this.getLayoutBreakpoint(), this.options.filters.padding, {
          nodes: Array.from(this.options.nodes || []),
          widgets: pickLayoutGrid(this.options.layout, { isPhone: isPhone(), isTablet: isTablet(), breakpoint: this.getLayoutBreakpoint() })?.widgets ?? [],
        }),
        ...(profile.paddingBottom !== undefined ? { paddingBottom: `${profile.paddingBottom}px` } : {}),
      }
      if (filters.styles) delete filters.styles.paddingBottom
      Object.assign(filters.styles ??= {}, styles)
      filters.setStyles(styles)
    }
    this.refreshTreeDetailsPosition()
    this.setLayersControl()
    this.syncLegend()
    this.syncMobileToolbar()
  }

  private refreshTreeDetailsPosition(): void {
    const details = this.controllers.detailsView
    if (!details || details.destroyed) return
    const modal = findReachableNodesByType(this.options, "modal")[0]
    if (modal?.settings?.on === false || containerLayout(modal, this.getLayoutBreakpoint()).hidden) {
      details.close()
      return
    }
    if (details.fullscreen) return
    const modalMount = resolveModalMount(this.options)
    const treeModalHost = this.getTreeComponentHost("modal")
    if (!treeModalHost || details.containers.parent !== treeModalHost) return

    const inFlow = this.shouldPlaceDetailsInFlow(modalMount, treeModalHost)
    const position = inFlow ? "relative" : "absolute"
    if (details.position === position) return

    details.position = position
    details.classList = details.classList.filter((name) =>
      name !== "mapsvg-relative" && name !== "mapsvg-absolute"
    )
    details.classList.push(`mapsvg-${position}`)
    details.containers.main?.classList.toggle("mapsvg-relative", inFlow)
    details.containers.main?.classList.toggle("mapsvg-absolute", !inFlow)
    if (inFlow) {
      const wasScrollable = details.scrollable
      details.scrollable = false
      if (wasScrollable) $(details.containers.contentWrap).nanoScroller({ destroy: true })
      details.containers.contentWrap?.classList.remove("nano")
      details.containers.contentWrap2?.classList.remove("nano-content")
    } else {
      details.scrollable = true
      details.containers.contentWrap?.classList.add("nano")
      details.containers.contentWrap2?.classList.add("nano-content")
      details.updateScroll()
    }
  }

  private mapChromeSlots: Map<string, HTMLElement> = new Map()

  private getChromeSlot(id: string): HTMLElement | undefined {
    return this.mapChromeSlots.get(id)
  }

  /**
   * Map chrome CSS grid (Layers + Controls) from map node settings.chromeGrid.
   * Separate from page layout.grids.
   */
  private applyMapChromeShell(): void {
    if (!this.containers.mapContainer && !this.containers.map) return

    const mapNode =
      (this.options.nodes as any)?.get?.("map") ||
      (Array.isArray(this.options.nodes)
        ? this.options.nodes.find((n: any) => n?.type === "map")
        : undefined)

    const forcedBreakpoint = this.inBackend ? this.layoutPreviewBreakpoint : null
    const selected = pickMapChromeGrid(mapNode, {
      isPhone: isPhone(),
      isTablet: isTablet(),
      breakpoint: isTreeLayoutMode(this.options) ? this.getLayoutBreakpoint() : forcedBreakpoint,
    })
    if (!selected) return

    const host = this.containers.mapContainer || this.containers.map
    if (!host) return

    if (getComputedStyle(host).position === "static") {
      host.style.position = "relative"
    }

    const doc = this.eventDocument || document
    const { grid, slots, retired } = reconcileLayoutGridShell(this.containers.mapChromeGrid, buildMapChromeShell(doc, selected))
    this.containers.mapChromeGrid = grid
    this.mapChromeSlots = slots
    if (grid.parentElement !== host) host.appendChild(grid)
    for (const cell of retired) cell.remove()
  }

  private mountChromeWidget(slotId: string, element: HTMLElement | undefined): void {
    if (!element) return
    if (slotId === "layers") {
      const node = this.mapPresentationNode("layers")
      const mount = node && this.mapPresentationMount(node)
      if (!node || !mount || !layersPresentation(this.options.layersControl, node).on) { element.style.display = "none"; return }
      element.style.display = ""
      if (!mount.inline) {
        element.style.display = "flex"
        element.style.position = "relative"
        element.style.left = element.style.right = element.style.top = element.style.bottom = ""
        if (element.parentElement !== mount.host) mount.host.append(element)
        return
      }
    }
    if (isTreeLayoutMode(this.options) && slotId !== "layers") {
      const node = findReachableNodesByType(this.options, slotId)[0]
      element.style.display = node?.settings?.on === false ? "none" : ""
    }
    const cell = this.getChromeSlot(slotId)
    if (cell) {
      element.style.position = "relative"
      element.style.left = ""
      element.style.right = ""
      element.style.top = ""
      element.style.bottom = ""
      if (element.parentElement !== cell) cell.appendChild(element)
      return
    }
    if (slotId === "layers" && this.containers.mapContainer) {
      const presentation = layersPresentation(this.options.layersControl, this.mapPresentationNode("layers"))
      element.style.position = "absolute"
      element.style.left = hasRuntimeFeature("directory") && this.options.menu?.on && !this.options.menu.customContainer && String(presentation.position).includes("left")
        ? String(this.options.menu.width) : ""
      element.style.right = element.style.top = element.style.bottom = ""
      if (element.parentElement !== this.containers.mapContainer) this.containers.mapContainer.appendChild(element)
    } else if (this.containers.map) {
      if (element.parentElement !== this.containers.map) this.containers.map.appendChild(element)
    }
  }

  /**
   * Applies layout grid options and reflows the live shell immediately.
   */
  setLayout(options: any): void {
    deepMerge(this.options, { layout: options })
    const normalized = normalizeNodesOptions(this.options as MapOptions & Record<string, any>)
    this.options.nodes = normalized.nodes
    this.options.scenes = normalized.scenes
    if (Array.isArray(this.options.layout?.deletedNodeTypes)) {
      this.options.layout.deletedNodeTypes = this.options.layout.deletedNodeTypes.filter(
        type => !normalized.nodes.some(node => node.type === type),
      )
    }
    if (!this.containersCreated) return
    this.ensureTreeBreakpointListener()
    this.applyLayoutGridShell()
    // Re-apply visibility/sizes after moving container nodes into new slots.
    this.setContainers(this.options.containers)
    this.applyMapChromeShell()
    if (this.containers.layersControl) {
      this.mountChromeWidget("layers", this.containers.layersControl)
    }
    if (this.containers.controls) {
      this.mountChromeWidget("controls", this.containers.controls)
    }
    this.refreshTreeControllers()
  }

  /** Page layout follows the owning viewport; Layout authoring can explicitly override it. */
  getLayoutBreakpoint(): LayoutGridBreakpoint {
    if (this.inBackend && this.layoutPreviewBreakpoint) return this.layoutPreviewBreakpoint
    if (isTreeLayoutMode(this.options)) {
      return viewportLayoutBreakpoint(this.eventWindow.innerWidth)
    }
    return isPhone() ? "mobile" : isTablet() ? "tablet" : "desktop"
  }

  setLayoutPreviewBreakpoint(breakpoint?: LayoutGridBreakpoint | null): void {
    const next =
      breakpoint === "desktop" || breakpoint === "tablet" || breakpoint === "mobile"
        ? breakpoint
        : null
    if (this.layoutPreviewBreakpoint === next) return
    this.layoutPreviewBreakpoint = next
    if (!this.containersCreated) return
    this.applyLayoutGridShell()
    this.setContainers(this.options.containers)
    this.applyMapChromeShell()
    if (this.containers.layersControl) {
      this.mountChromeWidget("layers", this.containers.layersControl)
    }
    if (this.containers.controls) {
      this.mountChromeWidget("controls", this.containers.controls)
    }
    this.refreshTreeControllers()
  }

  /**
   * Sets container options: leftSidebar, rightSidebar, header, footer.
   * @param {object} options
   *
   * @example
   * mapsvg.setContainers({
   *   leftSidebar: {
   *     on: true,
   *     width: "300px"
   *   }
   * });
   */
  setContainers(options) {
    const _this = this

    options = options || _this.options.containers || {}

    if (isTreeLayoutMode(this.options)) {
      for (const contName in options) {
        if (options[contName].on !== undefined) {
          options[contName].on = utils.numbers.parseBoolean(options[contName].on)
        }
      }
      deepMerge(this.options, { containers: options })
      this.setDetailsView()
      return
    }

    for (const contName in options) {
      if (options[contName].on !== undefined) {
        options[contName].on = utils.numbers.parseBoolean(options[contName].on)
      }

      if (options[contName].width) {
        if (
          typeof options[contName].width != "string" ||
          (options[contName].width.indexOf("px") === -1 &&
            options[contName].width.indexOf("%") === -1 &&
            options[contName].width !== "auto")
        ) {
          options[contName].width = options[contName].width + "px"
        }
        $(_this.containers[contName]).css({ "flex-basis": options[contName].width })
      }
      if (options[contName].height) {
        if (
          typeof options[contName].height != "string" ||
          (options[contName].height.indexOf("px") === -1 &&
            options[contName].height.indexOf("%") === -1 &&
            options[contName].height !== "auto")
        ) {
          options[contName].height = options[contName].height + "px"
        }
        $(_this.containers[contName]).css({
          "flex-basis": options[contName].height,
          height: options[contName].height,
        })
      }

      deepMerge(_this.options, { containers: options })

      let on = _this.options.containers[contName].on

      if (
        isPhone() &&
        _this.options.menu.hideOnMobile &&
        (_this.options.menu.location === contName || _this.options.menu.location === "custom") &&
        ["leftSidebar", "rightSidebar"].indexOf(contName) !== -1
      ) {
        on = false
      } else if (
        isPhone() &&
        !_this.options.menu.hideOnMobile &&
        _this.options.menu.location === contName &&
        ["leftSidebar", "rightSidebar"].indexOf(contName) !== -1
      ) {
        $(_this.containers.wrapAll).addClass("mapsvg-directory-visible")
      }

      $(_this.containers[contName]).toggle(on)
    }

    _this.setDetailsView()
  }

  createToolbar(container?: HTMLElement) {
    const toolbarContainer = container || this.containers.toolbar
    if (!toolbarContainer) return
    if (this.controllers.toolbar) {
      this.controllers.toolbar.destroy()
    }
    this.controllers.toolbar = new ToolbarController({
      map: this,
      parent: this,
      container: toolbarContainer,
      classList: isTreeLayoutMode(this.options) ? ["mapsvg-toolbar-tree"] : [],
      state: {
        ...this.options.mobileView,
        active: this.treeMobileToolbar?.view === "list" ? "menu" : "map",
      },
      events: {
        click: (event) => {
          const directory = this.controllers.directory
          const { buttonName } = event.data
          if (isTreeLayoutMode(this.options)) {
            this.setMobileToolbarView(buttonName === "menu" ? "list" : "map")
            return
          }
          switch (buttonName) {
            case "map": {
              $(this.containers.mapContainer).show()
              if (directory) {
                $(directory.containers.parent).hide()
                if (isPhone()) directory.updateScroll()
              }
              if (isPhone()) $(this.containers.wrap).css("height", "auto")
              this.redraw()
              break
            }
            case "menu": {
              if (!directory) break
              this.saveGoogleMapsViewport()
              if (this.googleMaps) {
                this.googleMaps.needsViewportRestore = true
              }
              $(this.containers.mapContainer).hide()
              $(directory.containers.parent).show()
              if (
                isPhone() &&
                $(directory.containers.main).height() <
                  parseInt(directory.options.minHeight)
              ) {
                $(this.containers.wrap).css(
                  "height",
                  parseInt(directory.options.minHeight) + "px",
                )
                directory.updateScroll()
              }
              break
            }
            default: {
              break
            }
          }

          directory?.updateTopShift()
        },
      },
    })
    this.controllers.toolbar.init()
  }

  /**
   * Checks if container should be scrollable
   * @param {string} container - mapContainer / leftSidebar / rightSidebar / custom / header / footer
   * @returns {boolean}
   * @private
   */
  shouldBeScrollable(container) {
    const _this = this

    switch (container) {
      case "map":
      case "fullscreen":
      case "leftSidebar":
      case "rightSidebar":
        return true
        break
      case "custom":
        return false
        break
      case "header":
      case "footer":
        if (
          _this.options.containers[container].height &&
          _this.options.containers[container].height !== "auto" &&
          _this.options.containers[container].height !== "100%"
        ) {
          return true
        } else {
          return false
        }
        break
      default:
        return false
        break
    }
  }

  // START directory

  /**
   * Sets directory options.
   * @alias setMenu
   * @param {object} options
   * @returns {*|void}
   *
   * @example
   * mapsvg.setDirectory({
   *   on: true,
   *   container: "leftSidebar"
   * });
   */
  setDirectory(options) {
    return this.setMenu(options)
  }
  /**
   * Sets menu (directory) options
   * @param options
   * @private
   */
  setMenu(options?: { [key: string]: any }) { return this.directoryModule()?.setMenu.call(this, this.directoryServices(), options) }
  // END

  extractField(
    region: Region | null,
    object: Model | Region | null,
    path: string,
    callback: (value: string) => void,
  ) {
    const { object: objectName, field } = splitObjectAndField(path)
    let data: string
    if (!callback) {
      throw new Error("extractField: no callback provided")
    }
    if (objectName && field) {
      if (!["Region", "Object"].includes(objectName)) {
        throw new Error("extractField: Incorrect object type " + objectName)
      }
      const source = objectName == "Region" ? region : object
      const objectFinal = source?.getData()
      data = objectFinal ? getNestedValue(objectFinal, field) : undefined
      return callback(data)
    }
  }

  /**
   * Sets database options.
   * @param {object} options
   * @example
   * mapsvg.setDatabase({
   *   pagination: {on: true, perpage: 30}
   * });
   */
  setDatabase(options?) {
    options = options || this.options.database

    // if (!options.regionsTableName) {
    //   options.regionsTableName = "regions_" + this.id
    // }
    // if (!options.objectsTableName) {
    //   options.objectsTableName = "objects_" + this.id
    // }
    if (options.noFiltersNoLoad && this.objectsRepository) {
      this.objectsRepository.setNoFiltersNoLoad(true)
    }

    if (options.pagination) {
      if (options.pagination.on != undefined) {
        options.pagination.on = utils.numbers.parseBoolean(options.pagination.on)
      }
      if (options.pagination.perpage != undefined) {
        options.pagination.perpage = parseInt(options.pagination.perpage)
      }
    }
    if (options.autoRefetch) {
      if (options.autoRefetch.on != undefined) {
        options.autoRefetch.on = utils.numbers.parseBoolean(options.autoRefetch.on)
      }
      if (options.autoRefetch.value != undefined) {
        options.autoRefetch.value = parseInt(options.autoRefetch.value, 10) || 0
      }
    }
    if (options.regionsAutoRefetch) {
      if (options.regionsAutoRefetch.on != undefined) {
        options.regionsAutoRefetch.on = utils.numbers.parseBoolean(options.regionsAutoRefetch.on)
      }
      if (options.regionsAutoRefetch.value != undefined) {
        options.regionsAutoRefetch.value = parseInt(options.regionsAutoRefetch.value, 10) || 0
      }
    }
    const prevOptions = { ...this.options.database.pagination }
    deepMerge(this.options, { database: options })
    if (options.pagination) {
      if (
        (typeof options.pagination.on !== "undefined" &&
          prevOptions.on !== options.pagination.on) ||
        (typeof options.pagination.perpage !== "undefined" &&
          prevOptions.perpage !== options.pagination.perpage)
      ) {
        const query = new Query({
          perpage: this.options.database.pagination.on
            ? this.options.database.pagination.perpage
            : 0,
        })

        this.options.database.on && this.objectsRepository && this.objectsRepository.find(query)
      } else {
        this.setPagination()
      }
    }
    if (options.autoRefetch && this.loaded) {
      this.startDatabaseAutoRefetch()
    }
    if (options.regionsAutoRefetch && this.loaded) {
      this.startRegionsAutoRefetch()
    }
  }

  /**
   * Interval in ms for database auto-refetch, or null when disabled.
   * Enforces a minimum of 5 seconds.
   */
  private getAutoRefetchMs(opt: { on?: boolean; value?: number; unit?: string } | undefined): number | null {
    if (!opt?.on || !opt.value || opt.value <= 0) {
      return null
    }
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600 }
    const seconds = opt.value * (multipliers[opt.unit] ?? 1)
    return Math.max(seconds, 5) * 1000
  }

  private getDatabaseAutoRefetchMs(): number | null {
    return this.getAutoRefetchMs(this.globalQueriesEnabled ? this.getPageBinding("objects").refetch : this.options.database?.autoRefetch)
  }

  private getRegionsAutoRefetchMs(): number | null {
    return this.getAutoRefetchMs(this.globalQueriesEnabled ? this.getPageBinding("regions").refetch : this.options.database?.regionsAutoRefetch)
  }

  /**
   * Start (or restart) client-side polling that reloads objects from the database.
   * Skipped in the admin backend to avoid constant reloads while editing.
   */
  startDatabaseAutoRefetch(): void {
    this.stopDatabaseAutoRefetch()
    if (this.inBackend) {
      return
    }
    const ms = this.getDatabaseAutoRefetchMs()
    if (!ms || !this.objectsRepository) {
      return
    }
    this.databaseAutoRefetchTimer = setInterval(() => {
      if (this.options.database?.on && this.objectsRepository) {
        void this.objectsRepository.reload({ silent: true, automatic: true })
      }
    }, ms)
  }

  stopDatabaseAutoRefetch(): void {
    if (this.databaseAutoRefetchTimer) {
      clearInterval(this.databaseAutoRefetchTimer)
      this.databaseAutoRefetchTimer = null
    }
  }

  /**
   * Start (or restart) client-side polling that reloads regions.
   * Skipped in the admin backend.
   */
  startRegionsAutoRefetch(): void {
    this.stopRegionsAutoRefetch()
    if (this.inBackend) {
      return
    }
    const ms = this.getRegionsAutoRefetchMs()
    if (!ms || !this.regionsRepository) {
      return
    }
    this.regionsAutoRefetchTimer = setInterval(() => {
      if (this.regionsRepository) {
        void this.regionsRepository.reload({ silent: true, automatic: true })
      }
    }, ms)
  }

  stopRegionsAutoRefetch(): void {
    if (this.regionsAutoRefetchTimer) {
      clearInterval(this.regionsAutoRefetchTimer)
      this.regionsAutoRefetchTimer = null
    }
  }
  updateGoogleMapsMaxZoom(geoPoint: GeoPoint): void {
    this.googleMaps.maxZoomService.getMaxZoomAtLatLng(
      geoPoint,
      (result: google.maps.MaxZoomResult) => {
        if (result.status === "OK") {
          this.googleMaps.currentMaxZoom = result.zoom
        }
      },
    )
  }
  /**
   * Sets Google Map options.
   * @param {object} options
   * @example
   * mapsvg.setGoogleMaps({
   *   on: true,
   *   type: "terrain"
   * });
   *
   * // Get Google Maps instance:
   * var gm = mapsvg.googleMaps.map;
   */
  setGoogleMaps(options?: any) {
    options = options || this.options.googleMaps
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))

    if (!this.googleMaps) {
      this.googleMaps = { loaded: false, initialized: false, map: null, overlay: null }
    }

    deepMerge(this.options, { googleMaps: options })
    // All callers (including partial live patches) use the same complete options.
    options = this.options.googleMaps
    options.styleJSON = resolveGoogleMapStyles(options.style, options.styleJSON)

    // Exit, if map is uncalibrated (incompatible with Google Maps)
    if (this.isGeo() === false) {
      return
    }

    if (this.options.googleMaps.on) {
      if (!mapsvgCore.googleMaps.apiKey) {
        console.error(
          "[CLIENT-009] Google Maps API key is required to enable Google Maps. Read more: https://mapsvg.com/docs/errors#CLIENT-009",
        )
        return
      }
      $(this.containers.map).toggleClass("mapsvg-with-google-map", true)
      if (!mapsvgCore.googleMaps.loaded) {
        this.loadGoogleMapsAPI(
          () => {
            this.setGoogleMaps()
          },
          () => {
            this.setGoogleMaps({ on: false })
          },
        )
      } else {
        if (!this.googleMaps.map) {
          this.containers.googleMaps = $(
            '<div class="mapsvg-layer mapsvg-layer-gm" id="mapsvg-google-maps-' +
              this.id +
              '"></div>',
          ).prependTo(this.containers.map)[0]
          $(this.containers.googleMaps).css({
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            "z-index": "0",
            opacity: 1,
          })
          this.googleMaps.map = new google.maps.Map(this.containers.googleMaps, {
            mapTypeId: options.type,
            fullscreenControl: false,
            keyboardShortcuts: false,
            mapTypeControl: false,
            scaleControl: false,
            scrollwheel: false,
            streetViewControl: false,
            zoomControl: false,
            styles: options.styleJSON,
            tilt: 0,
          })
          let overlay

          const southWest = new google.maps.LatLng(this.geoViewBox.sw.lat, this.geoViewBox.sw.lng)
          const northEast = new google.maps.LatLng(this.geoViewBox.ne.lat, this.geoViewBox.ne.lng)
          const bounds = new google.maps.LatLngBounds(southWest, northEast)

          this.googleMaps.overlay = this.createGoogleMapOverlay(bounds, this.googleMaps.map)

          // if (!this.options.googleMaps.center || !this.options.googleMaps.zoom) {
          this.googleFitCurrentGeoBounds()
          // } else {
          //   this.googleMaps.map.setZoom(this.options.googleMaps.zoom)
          //   this.googleMaps.map.setCenter(this.options.googleMaps.center)
          // }

          this.googleMaps.maxZoomService = new google.maps.MaxZoomService()

          this.googleMaps.map.addListener("idle", () => {
            this.isZooming = false
            this.saveGoogleMapsViewport()
            // this.syncZoomLevelWithGoogle()
          })
          google.maps.event.addListenerOnce(this.googleMaps.map, "idle", () => {
            setTimeout(() => {
              this.googleMaps.initialized = true
              if (!this.options.googleMaps.center || !this.options.googleMaps.zoom) {
                this.options.googleMaps.center = this.googleMaps.map.getCenter().toJSON()
                this.options.googleMaps.zoom = this.googleMaps.map.getZoom()
              }
              this.updateGoogleMapsMaxZoom(this.options.googleMaps.center)
              this.setViewBoxByGoogleMapsOverlay()
              this.throttle(this.toggleSvgLayerOnZoom, 50, this)
              this.events.trigger("afterLoad.googleMaps")
              this.decrementAfterloadBlockers()
              this.finalizeMapLoading()
              $(this.containers.map).addClass("mapsvg-fade-in")
              setTimeout(() => {
                $(this.containers.map).removeClass("mapsvg-google-map-loading")
                $(this.containers.map).removeClass("mapsvg-fade-in")
              }, 1000)
            }, 1)
          })
          this.events.on("boundsChanged.googleMaps", ({ data }) => {
            this.setViewBoxByGoogleMapsOverlay()
          })
        } else {
          this.googleMaps.map.setZoom(this.zoomLevel)
          this.googleMaps.map.setCenter(this.getCenterGeoPoint())
          $(this.containers.googleMaps) && $(this.containers.googleMaps).css({ opacity: 1 })
          if (options.type) {
            this.googleMaps.map.setMapTypeId(options.type)
          }
          this.googleMaps.map.setOptions({ styles: options.styleJSON })
        }
      }
    } else {
      $(this.containers.googleMaps) && $(this.containers.googleMaps).css({ opacity: 0 })
    }
    if (this.converter) {
      this.converter.setGoogleMaps(!!this.options.googleMaps.on && !!this.googleMaps.map)
    }
  }
  createGoogleMapOverlay(bounds, map) {
    class GoogleMapsOverlay extends google.maps.OverlayView {
      bounds_: google.maps.LatLngBounds
      map_: google.maps.Map
      mapsvg: MapSVGMap

      constructor(bounds, googleMapInstance, mapsvg_: MapSVGMap) {
        super()
        // Initialize all properties.
        this.bounds_ = bounds
        this.map_ = googleMapInstance
        this.mapsvg = mapsvg_
        this.setMap(googleMapInstance)

      }

      draw(): void {
        this.mapsvg.events.trigger("boundsChanged.googleMaps", {
          bounds: this.getPixelBounds(),
          map: this.map_,
        })
      }

      getScale(): null | number {
        const projection = this.getProjection()
        if (!projection) return null
        return projection.getWorldWidth() * this.mapsvg.converter.mapLonDelta / 360 /
          this.mapsvg.svgDefault.viewBox.width
      }

      // This single overlay supplies projection/lifecycle only. Marker representations
      // are owned by MapSVG; no geographic rectangle or previous-frame world heuristic.
      onAdd(): void {}
      onRemove(): void {}

      getPixelBounds(): { sw: google.maps.Point; ne: google.maps.Point } {
        const projection = this.getProjection()
        if (!projection) return
        const sw = projection.fromLatLngToContainerPixel(this.bounds_.getSouthWest())
        const ne = projection.fromLatLngToContainerPixel(this.bounds_.getNorthEast())
        if (!sw || !ne) return
        // Project one anchor and use the calibrated longitude span. The independently
        // projected east/west corners can belong to different repeated worlds.
        const width = projection.getWorldWidth() * this.mapsvg.converter.mapLonDelta / 360
        return { sw, ne: new google.maps.Point(sw.x + width, ne.y) }
      }
    }
    return new GoogleMapsOverlay(bounds, map, this)
  }
  /**
   * Loads Google Maps API (js file)
   * @param {function} callback - called on file load
   * @param fail
   * @private
   */
  loadGoogleMapsAPI(callback: () => void, fail: () => void): void {
    // Exit early if the map is incompatible with Google Maps
    if (!this.isGeo()) {
      return
    }
    if (!mapsvgCore.googleMaps.apiKey) {
      console.error(
        "[CLIENT-010] MapSVG: can't load Google API because no API key has been provided. Read more: https://mapsvg.com/docs/errors#CLIENT-010",
      )
      return
    }
    if (window.google !== undefined && google.maps) {
      mapsvgCore.googleMaps.loaded = true
    }

    if (mapsvgCore.googleMaps.loaded) {
      if (typeof callback == "function") {
        callback()
      }
      return
    }
    $(this.containers.map).addClass("mapsvg-google-map-loading")
    mapsvgCore.googleMaps.onLoadCallbacks = mapsvgCore.googleMaps.onLoadCallbacks || []
    if (typeof callback == "function") {
      mapsvgCore.googleMaps.onLoadCallbacks.push(callback)
    }

    if (mapsvgCore.googleMaps.apiIsLoading) {
      return
    }
    mapsvgCore.googleMaps.apiIsLoading = true

    // @ts-ignore
    window.gm_authFailure = () => {
      console.error(
        "[CLIENT-011] MapSVG: Google maps API key is incorrect. Read more: https://mapsvg.com/docs/errors#CLIENT-011",
      )
    }
    this.googleMapsScript = document.createElement("script")
    this.googleMapsScript.async = true
    window.mapsvgInitGoogleMap = () => {
      mapsvgCore.googleMaps.loaded = true
      mapsvgCore.googleMaps.onLoadCallbacks.forEach((_callback) => {
        if (typeof callback == "function") _callback()
      })
    }
    const gmLibraries = []
    if (this.options.googleMaps.drawingTools) {
      gmLibraries.push("drawing")
    }
    if (this.options.googleMaps.geometry) {
      gmLibraries.push("geometry")
    }
    let libraries = ""
    if (gmLibraries.length > 0) {
      libraries = "&libraries=" + gmLibraries.join(",")
    }
    const language = googleMapLanguage(this.options.googleMaps.language)
    this.googleMapsScript.src =
      "https://maps.googleapis.com/maps/api/js?loading=async&callback=mapsvgInitGoogleMap" +
      (language ? "&language=" + encodeURIComponent(language) : "") +
      "&key=" +
      mapsvgCore.googleMaps.apiKey +
      libraries

    try {
      document.head.appendChild(this.googleMapsScript)
    } catch (e) {
      console.error(
        "[CLIENT-012] Google Maps script loading error — Read more: https://mapsvg.com/docs/errors#CLIENT-012",
        e,
      )
      this.decrementAfterloadBlockers()
      this.finalizeMapLoading()
    }
  }
  /**
   * Loads Details View for an object (Region or DB Object)
   * @param {Region|object} obj
   * @param {string} templateName
   *
   * @example
   * var region = mapsvg.getRegion("US-TX");
   * mapsvg.loadDetailsView(region);
   *
   * var object = mapsvg.database.getLoadedObject(12);
   * mapsvg.loadDetailsView(object);
   */
  showDetails(obj: Region | Model, templateName?: string): void {
    this.loadDetailsView(obj, templateName)
  }
  /**
   * @ignore
   */
  loadDetailsView(obj: Region | Model, templateName?: string, locationOverride?: string): void {
    this.detailsRegionId = "type" in obj && obj.isRegion() ? String(obj.id) : undefined
    if (this.controllers.popover) this.controllers.popover.close()
    if (this.controllers.detailsView) this.controllers.detailsView.destroy()

    if (isTreeLayoutMode(this.options)) {
      const modal = findReachableNodesByType(this.options, "modal")[0]
      if (modal?.settings?.on === false || containerLayout(modal, this.getLayoutBreakpoint()).hidden) return
    }

    // Draw rule: no modal node in tree → skip (unless legacy override still requested).
    if (!locationOverride && !isNodeTypeReachable(this.options, "modal")) {
      return
    }

    const modalMount = resolveModalMount(this.options)
    const location =
      (locationOverride && String(locationOverride)) ||
      (modalMount.kind !== "legacy" ? modalMount.location : null) ||
      this.options.detailsView.location ||
      "map"

    const cancelAutoresize =
      location === "fullscreen" ||
      modalMount.kind === "body" ||
      (isPhone() && this.options.detailsView.mobileFullscreen && location !== "custom")

    if ($(this.containers.detailsView) && this.options.colors.detailsView !== undefined) {
      $(this.containers.detailsView).css({
        "background-color": this.options.colors.detailsView,
      })
    }

    let detContainer
    const treeModalHost = isTreeLayoutMode(this.options) && modalMount.kind !== "custom"
      ? this.getTreeComponentHost("modal")
      : null
    if (treeModalHost && !locationOverride && modalMount.kind !== "body") {
      detContainer = treeModalHost
    } else if (locationOverride === "custom" || (location === "custom" && !locationOverride)) {
      const containerId = modalMount.containerId || this.options.detailsView.containerId
      detContainer = $("#" + containerId)[0]
    } else if (modalMount.kind === "body" && !locationOverride) {
      // Scene-Modal / body portal host
      detContainer = this.eventDocument?.body || document.body
    } else if (modalMount.kind === "main-overlay" && !locationOverride) {
      // Modal under Main → overlay inside map wrap
      detContainer = this.containers.wrap || this.containers.map
    } else if (location === "fullscreen") {
      detContainer = this.containers.map
    } else if (location === "custom") {
      detContainer = $("#" + this.options.detailsView.containerId)[0]
    } else {
      detContainer = this.getLocationContainer(location) || this.containers.map
    }

    // START templates
    const template = templateName
      ? this.getCompiledTemplate(templateName)
      : "type" in obj && obj.isRegion()
        ? this.getCompiledTemplate("detailsViewRegion")
        : this.getCompiledTemplate("detailsView")
    // REPLACE
    // const template = templateName
    //   ? this.getCompiledTemplate(templateName)
    //   : "type" in obj && obj.isRegion()
    //     ? this.getCompiledTemplate("detailsViewRegion")
    //     : this.getCompiledTemplate("detailsView")
    // END

    const modalSettings = modalMount.modalNode?.settings || {}
    const detailsInFlow = this.shouldPlaceDetailsInFlow(modalMount, treeModalHost, locationOverride)
    const detailsStyles = {
      backgroundColor: this.options.colors.detailsView,
      margin:
        typeof modalSettings.margin === "string"
          ? modalSettings.margin
          : this.options.detailsView.margin,
      width:
        typeof modalSettings.width === "string"
          ? modalSettings.width
          : this.options.detailsView.width,
    }

    if (treeModalHost && detContainer === treeModalHost) setStackComponentOpen(treeModalHost, true)
    this.controllers.detailsView = new DetailsController({
      map: this,
      parent: this,
      styles: detailsStyles,
      autoresize: cancelAutoresize || treeModalHost && detContainer === treeModalHost
        ? false
        : typeof modalSettings.autoresize === "boolean"
          ? modalSettings.autoresize
          : this.options.detailsView.autoresize,
      container: detContainer,
      template,
      state: obj.getData(),
      scrollable: detailsInFlow ? false : cancelAutoresize || this.shouldBeScrollable(location),
      fullscreen:
        location === "fullscreen" ||
        modalMount.kind === "body" ||
        (isPhone() && this.options.detailsView.mobileFullscreen),
      useShadowRoot:
        this.useShadowRoot &&
        (modalMount.kind === "body" ||
          (isPhone() && this.options.detailsView.mobileFullscreen) ||
          ["custom", "fullscreen"].includes(location)),
      position: detailsInFlow || (!treeModalHost && ["custom", "header", "footer"].includes(location))
        ? "relative"
        : "absolute",
      events: {
        afterShow: (event) => {
          const { controller } = event.data
          if (treeModalHost) setStackComponentOpen(treeModalHost, controller.containers.parent === treeModalHost)
        },
        afterClose: (event) => {
          const { controller } = event.data
          if (treeModalHost) setStackComponentOpen(treeModalHost, false)
          this.deselectAllRegions()
          this.deselectAllMarkers()
          if (this.controllers && this.controllers.directory) {
            this.controllers.directory?.deselectItems()
          }
        },
      },
      middleware: this.middlewares.middlewares.filter((m) => m.name == MiddlewareType.RENDER),
    })
    this.controllers.detailsView.init()
    this.controllers.detailsView.open()
  }

  private detailsRegionId?: string

  /** Refresh an open Region card after live Objects change, retaining its controller/placement. */
  private refreshRegionDetails(): void {
    const controller = this.controllers.detailsView
    if (!this.detailsRegionId || !controller?.opened || controller.destroyed) return
    const region = this.getRegion(this.detailsRegionId)
    if (!region) return
    const data = region.getData()
    // Unchanged polling must retain forms, focus and scroll without rendering again.
    if (JSON.stringify(controller.state) === JSON.stringify(data)) return
    const wrap = controller.containers.contentWrap
    const scrollTop = wrap?.scrollTop
    controller.setState(data, true)
    if (wrap && scrollTop !== undefined) wrap.scrollTop = scrollTop
  }
  /**
   * Loads modal window with filters
   * @private
   */
  loadFiltersModal(): void {
    if (this.options.filters.modalLocation != "custom") {
      if (!this.containers.filtersModal) {
        this.containers.filtersModal = $(
          '<div class="mapsvg-details-container mapsvg-filters-wrap"></div>',
        )[0]
      }
      this.setColors()
      $(this.containers.filtersModal).css({ width: this.options.filters.width })
      if (isPhone()) {
        $("body").append($(this.containers.filtersModal))
        $(this.containers.filtersModal).css({ width: "" })
      } else {
        $(this.getLocationContainer(this.options.filters.modalLocation) || this.containers.map).append(
          $(this.containers.filtersModal),
        )
      }
    } else {
      this.containers.filtersModal = $("#" + this.options.filters.containerId)[0]
      $(this.containers.filtersModal).css({ width: "" })
    }

    this.loadFiltersController(this.containers.filtersModal, true)
  }
  /**
   * Loads filters controller into a provided container
   * @param {HTMLElement} container - Container, jQuery object
   * @param {boolean} modal - If filter should be in a modal window
   */
  loadFiltersController(container: HTMLElement, modal = false): void {
    if (!this.filtersShouldBeShown() || !isNodeTypeReachable(this.options, "filters")) {
      this.controllers.filters?.destroy()
      this.releaseFiltersAfterLoadBlocker()
      return
    }

    let filtersInDirectory: boolean, filtersHide: boolean

    if (isPhone()) {
      filtersInDirectory = true
      filtersHide = this.options.filters.hideOnMobile
    } else {
      filtersInDirectory =
        (hasRuntimeFeature("directory") && this.options.menu.on) &&
        this.controllers.directory &&
        this.options.menu.location === this.options.filters.location
      filtersHide = this.options.filters.hide
    }

    this.filtersRepository =
      this.componentSource("filters") === "regions" ? this.regionsRepository : this.objectsRepository

    if (this.options.filters.searchButton) {
      this.changedFields = null
      this.changedSearch = null
    } else {
      this.changedSearch = () => {
        this.filtersRepository.query.searchFallback =
          this.filtersSchema.getFieldByType("search").searchFallback
        this.throttle(this.filtersRepository.reload, 400, this.filtersRepository)
      }
      this.changedFields = () => {
        this.throttle(this.filtersRepository.reload, 400, this.filtersRepository)
      }
    }
    this.controllers.filters?.destroy()

    const treeFilterNode = !modal && isTreeLayoutMode(this.options) && container === this.getTreeComponentHost("filters")
      ? findReachableNodesByType(this.options, "filters")[0] : undefined
    const filterProfile = treeFilterNode ? containerLayout(treeFilterNode, this.getLayoutBreakpoint()) : {}
    this.controllers.filters = new FiltersController({
      map: this,
      parent: this,
      middleware: this.middlewares.middlewares.filter((m) => m.name === MiddlewareType.RENDER),
      container,
      classList:
        this.options.filters.location === "custom" ? ["mapsvg-filter-container-custom"] : [],
      styles: {
        // The modal wrapper owns its background; alpha must not be painted twice.
        backgroundColor: modal ? "transparent" : this.options.colors.directorySearch,
        // Neutral tree slots do not inherit the legacy Header stacking context.
        // Keep a filter dropdown above a following Directory controller (z-index 2).
        zIndex: isTreeLayoutMode(this.options) ? "3" : "",
        width: $(container).hasClass("mapsvg-map-container") ? this.options.filters.width : "100%",
        padding: treeFilterNode ? filterLayoutPadding(treeFilterNode, this.getLayoutBreakpoint(), this.options.filters.padding, {
          nodes: Array.from(this.options.nodes || []),
          widgets: pickLayoutGrid(this.options.layout, { isPhone: isPhone(), isTablet: isTablet(), breakpoint: this.getLayoutBreakpoint() })?.widgets ?? [],
        }) : this.options.filters.padding,
        ...(treeFilterNode && filterProfile.paddingBottom !== undefined ? { paddingBottom: `${filterProfile.paddingBottom}px` } : {}),
      },
      useShadowRoot: this.useShadowRoot && this.options.filters.location === "custom",
      query: this.filtersRepository?.query,
      schema: hasRuntimeFeature("filters") ? this.filtersSchema : new Schema({
        ...this.filtersSchema.getData(),
        fields: availableFilterFields(this.filtersSchema.getFields(), false),
      }),
      template: '<div class="mapsvg-filters-container"></div>',
      scrollable:
        modal ||
        (!(isTreeLayoutMode(this.options) && container === this.getTreeComponentHost("filters")) &&
        (!filtersInDirectory &&
          ["leftSidebar", "rightSidebar"].indexOf(this.options.filters.location) !== -1)),
      modal,
      modalLocation: this.options.filters.modalLocation,
      hideFilters: this.options.filters.hide,
      hideOnMobile: this.options.filters.hideOnMobile,
      showButtonText: this.options.filters.showButtonText,
      clearButton: this.options.filters.clearButton,
      clearButtonText: this.options.filters.clearButtonText,
      searchButton: this.options.filters.searchButton,
      searchButtonText: this.options.filters.searchButtonText,
      events: {
        afterRedraw: () => {
          filtersInDirectory && this.controllers.directory?.updateTopShift()
        },
        "clear.form": (event) => {
          this.deselectAllRegions()
          this.filtersRepository.find()
        },
        "change.formElement.form": (
          event: EventWithData<{ formElement: FormElementInterface }>,
        ) => {
          const { formElement } = event.data
          if (formElement.type === "search") {
            this.changedSearch && this.changedSearch()
          } else {
            this.changedFields && this.changedFields()
          }
        },
        "click.btnSearch": () => {
          this.filtersRepository.find()
        },
        "afterLoad.form": () => {
          // TODO add resize sensor to directory instead of this:
          this.controllers.directory && this.controllers.directory?.updateTopShift()
          this.releaseFiltersAfterLoadBlocker()
        },
        "click.btnShowFilters": () => {
          this.loadFiltersModal()
        },
      },
    })
    this.controllers.filters.init()
  }

  private filtersShouldBeShown() {
    return (
      this.options.filters.on && Array.isArray(this.options.filtersSchema) &&
      availableFilterFields(this.options.filtersSchema, hasRuntimeFeature("filters")).length > 0
    )
  }

  /**
   * Release the afterLoad blocker reserved for FiltersController. Idempotent.
   */
  private releaseFiltersAfterLoadBlocker(): void {
    if (!this.filtersAfterLoadBlockerActive) return
    this.filtersAfterLoadBlockerActive = false
    this.decrementAfterloadBlockers()
  }

  /**
   * Event handler for text search input
   * @param {string} text
   * @param {boolean} fallback
   * @private
   */
  textSearch(text: string, fallback = false): void {
    const query = new Query({
      filters: { search: text },
      searchFallback: fallback,
    })

    this.filtersRepository.find(query)
  }
  /**
     * Finds a Region by ID
     * @param {string} id - Region ID
     * @returns {Region}

     * @example
     * var region = mapsvg.getRegion("US-TX");
     */
  getRegion(id: string): Region {
    return this.regions.findById(id)
  }
  /**
   * Returns all Regions
   * @returns {Region[]}
   */
  getRegions(): ArrayIndexed<Region> {
    return this.regions
  }
  /**
     * Finds a Marker by ID
     * @param {string} id - Marker ID
     * @returns {Marker}

     * @example
     * var marker = mapsvg.getMarker("marker_12");
     */
  getMarker(id: string): Marker {
    return this.markers.findById(id)
  }
  /**
   * Checks if IDs is unique
   * @param id
   * @returns {bool|string} - true if ID is available, {error: "error text"} if not.
   * @private
   */
  checkId(id: string): { canUse: boolean; error: string } {
    if (this.getRegion(id))
      return { canUse: false, error: "This ID is already being used by a Region" }
    else if (this.markers.findById(id))
      return { canUse: false, error: "This ID is already being used by another Marker" }
    else return { canUse: true, error: "" }
  }
  /**
   * Redraws colors of regions.
   * Used when Region statuses are loaded from the database or when choropleth map is enabled.
   */
  reloadAllRegionStyles(): void {
    this.regionRulesRuntime.prepare(this)
    this.syncLegend()
    this.regions.forEach(this.reloadRegionStyles)
  }

  reloadRegionStyles = (region: Region) => {
    const styles = this.getRegionStylesByState(region)
    if (styles) {
      region.setStylesByState(styles)
    }
  }

  /**
   * Redraws choropleth bubbles.
   */
  redrawBubbles(): void {
    $(this.containers.map).removeClass("bubbles-regions-on bubbles-database-on")

    if (this.options.choropleth.on && this.options.choropleth.bubbleMode) {
      $(this.containers.map).addClass("bubbles-" + this.options.choropleth.source + "-on")
    }

    this.regions.forEach(function (region) {
      region.drawBubble()
    })

    const markersBubbleMode =
      this.options.choropleth.on &&
      this.options.choropleth.source == "database" &&
      this.options.choropleth.bubbleMode
    this.markers.forEach(function (marker) {
      marker.setBubbleMode(markersBubbleMode)
    })
  }
  /**
   * Destroys the map and all related containers.
   * @returns {MapSVGMap}
   */
  destroy(): void {
    this.galleryController?.destroy()
    this.eventWindow.clearTimeout(this.typographyResizeTimer)
    this.eventWindow.removeEventListener("resize", this.typographyResize)
    this.typographyRuntime.destroy()
    this.clusteringModule()?.dispose.call(this)
    const markers = new Set<Marker>(this.markers)
    const location = this.objectsRepository?.getSchema().getFieldByType("location")?.name
    this.objectsRepository?.getLoaded().forEach(object => {
      if (object[location]?.marker) markers.add(object[location].marker)
    })
    if (this.userLocationMarker) markers.add(this.userLocationMarker)
    for (const marker of markers) marker.delete()
    this.googleMaps?.overlay?.setMap(null)
    this.anotherMapModule()?.release(this)
    this.regionRulesRuntime.destroy()
    this.legendView?.destroy()
    this.layersControlView?.destroy()
    this.objectsRepository?.invalidateReads()
    this.regionsRepository?.invalidateReads()
    this.stopTreeBreakpointListener()
    this.stopDatabaseAutoRefetch()
    this.stopRegionsAutoRefetch()

    $(this.eventDocument).off("keydown" + this.firefoxScrollNamespace)
    $(this.eventDocument).off("scroll" + this.firefoxScrollNamespace)
    $(this.containers.map)
      .empty()
      .insertBefore($(this.containers.wrapAll))
      // .attr("style", "")
      .attr("class", "mapsvg")

    this.controllers.popover && this.controllers.popover.close()

    if (this.controllers.detailsView) this.controllers.detailsView.destroy()
    if (this.controllers.directory) this.controllers.directory.destroy()

    $(this.containers.detailsView).remove()
    $(this.containers.popover).remove()
    $(this.containers.tooltipRegion).remove()
    $(this.containers.tooltipCluster).remove()
    $(this.containers.tooltipMarker).remove()

    $(this.containers.wrapAll).remove()
    $(this.containers.filtersModal).remove()
    $(this.containers.filters).remove()
    $(this.containers.map).empty().remove()

    const indexToRemove = mapsvgCore.instances.findIndex((item) => item === this)
    if (indexToRemove !== -1) {
      mapsvgCore.instances.splice(indexToRemove, 1) // Remove 1 element at the found index
    }
  }
  /**
   * @returns {MapSVGMap}
   */
  getData(): {
    id: number
    title: string
    options: MapOptions
    version: string
    svgFileLastChanged: number
  } {
    return {
      id: this.id,
      title: this.options.title,
      options: this.getOptions(false, false),
      version: this.version,
      svgFileLastChanged: this.svgFileLastChanged,
    }
  }
  /**
   * Checks if fitmarkers() action can be performed and does it
   * @private
   */
  mayBeFitMarkers(): void {
    if (!this.lastTimeFitWas) {
      this.lastTimeFitWas = Date.now() - 99999
    }
    this.fitDelta = Date.now() - this.lastTimeFitWas

    const { fitMarkersOnStart, fitMarkers } = this.options
    const needToFitMarkers =
      !this.fitOnDataLoadDone && (this.firstDataLoad ? fitMarkersOnStart : fitMarkers)

    if (this.fitDelta > 1000 && needToFitMarkers) {
      if (this.options.googleMaps.on && !this.googleMaps.map) {
        this.events.on("afterLoad.googleMaps", () => {
          this.fitMarkers()
        })
      } else {
        this.fitMarkers()
      }
      this.fitOnDataLoadDone = true
    }

    this.lastTimeFitWas = Date.now()
  }
  /**
   * Changes maps viewBox to fit loaded markers.
   */
  fitMarkers(): void {
    const dbObjects = this.objectsRepository.getLoaded()

    if (!dbObjects || dbObjects.length === 0) {
      return
    }

    if (this.googleMaps.map) {
      const lats = []
      const lngs = []

      if (dbObjects.length > 1) {
        dbObjects.forEach((object) => {
          if (object.getData().location && object.getData().location.geoPoint) {
            lats.push(object.getData().location.geoPoint.lat)
            lngs.push(object.getData().location.geoPoint.lng)
          }
        })

        // calc the min and max lng and lat
        const minlat = Math.min.apply(null, lats),
          maxlat = Math.max.apply(null, lats)
        const minlng = Math.min.apply(null, lngs),
          maxlng = Math.max.apply(null, lngs)

        const bbox = new google.maps.LatLngBounds(
          { lat: minlat, lng: minlng },
          { lat: maxlat, lng: maxlng },
        )
        this.googleMaps.map.fitBounds(bbox, 0)
      } else {
        if (
          dbObjects[0].getData().location &&
          dbObjects[0].getData().location.geoPoint.lat &&
          dbObjects[0].getData().location.geoPoint.lng
        ) {
          const coords = {
            lat: dbObjects[0].getData().location.geoPoint.lat,
            lng: dbObjects[0].getData().location.geoPoint.lng,
          }
          if (this.googleMaps.map) {
            this.googleMaps.map.setCenter(coords)
            this.googleMaps.map.setZoom(this.options.fitSingleMarkerZoom)
          }
        }
      }
    } else {
      if (hasRuntimeFeature("clustering") && this.options.clustering.on) {
        const arr = []
        this.markersClusters.forEach((c) => {
          arr.push(c)
        })
        this.markers.forEach((m) => {
          arr.push(m)
        })
        this.zoomTo(arr)
        return
      } else {
        this.zoomTo(this.markers)
        return
      }
    }
  }

  setFitSingleMarkerZoom(zoom) {
    this.options.fitSingleMarkerZoom = parseInt(zoom)
  }
  /**
   * Shows user current location
   * Works only under HTTPS connection
   * @param callback Callback to be called when user location is received
   * @returns {void}
   */
  showUserLocation(callback: (location: Location) => void): void {
    this.getUserLocation((geoPoint: GeoPoint) => {
      this.userLocation = null
      this.userLocation = new Location({
        geoPoint: geoPoint,
        img: mapsvgCore.routes.root + "/markers/user-location.svg",
      })
      this.userLocationMarker && this.userLocationMarker.delete()
      this.userLocationMarker = new Marker({
        location: this.userLocation,
        mapsvg: this,
        width: 15,
        height: 15,
      })
      $(this.userLocationMarker.element).addClass("mapsvg-user-location")
      this.userLocationMarker.centered = true
      this.getLayer("markers").append(this.userLocationMarker.element)
      this.userLocationMarker.adjustScreenPosition()
      callback && callback(this.userLocation)
    })
  }
  /**
   * Gets user's current location by using browser's HTML5 geolocation feature.
   * Works only under HTTPS connection!
   * @param callback Callback to be called when user location is received
   * @returns {boolean} - false if geolocation is unavailable, or true if it's available
   */
  getUserLocation(callback: (coordinates: GeoPoint) => void): boolean {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const pos = new GeoPoint(position.coords.latitude, position.coords.longitude)
        callback && callback(pos)
      })
      return true
    } else {
      return false
    }
  }
  /**
   * Fractional CSS-pixel size of the map container.
   * clientWidth/offsetWidth are integers and disagree with Google Maps overlay
   * math on mobile when the container is a subpixel size (e.g. 352.73).
   */
  getMapContainerSize(): { width: number; height: number } {
    const map = this.containers?.map
    if (map && typeof map.getBoundingClientRect === "function") {
      const rect = map.getBoundingClientRect()
      if (rect) {
        return { width: rect.width, height: rect.height }
      }
    }
    return {
      width: map?.clientWidth || map?.offsetWidth || 0,
      height: map?.clientHeight || map?.offsetHeight || 0,
    }
  }

  /**
   * Returns current SVG scale related to screen - map screen pixels to SVG points ratio.
   * Example: if SVG current viewBox width is 600 and the map is shown in a 300px container,
   * the map scale is 0.5 (300/600 = 0.5)
   * @param viewBox - Optional viewBox to calculate scale for
   * @returns {number} Map scale related to screen
   */
  getScale(viewBox?: ViewBox): number {
    const { width } = this.getMapContainerSize()
    const scale2 = width / (viewBox?.width || this.viewBox.width)
    return scale2 || 1
  }

  getAdjustedSvgDefaultViewBox(): ViewBox {
    return this.adjustViewBoxToSize(
      this.svgDefault.viewBox,
      this.options.width,
      this.options.height,
    )
  }

  /**
   * Calculates the relative scale of the map.
   * The relative scale is the ratio of the width of the adjusted SVG default viewBox to the width of the current viewBox.
   * @returns {number} The relative scale of the map.
   */
  getRelativeScale(): number {
    // const defaultViewBox = this.getAdjustedSvgDefaultViewBox()
    // return defaultViewBox.width / this.viewBox.width
    return this.svgDefault.viewBox.width / this.viewBox.width
  }

  /**
   * Get relative map scale from initial zoom level
   */
  get _scale(): number {
    return this.getRelativeScale()
  }

  /**
   * Current map zoom level
   */
  get zoomLevel(): number {
    if (this.googleMaps.map) {
      return this.googleMaps.map.getZoom()
    } else {
      const defaultViewBox = this.getAdjustedSvgDefaultViewBox()
      const _scale = defaultViewBox.width / this.viewBox.width
      return Math.round((Math.log(_scale) / Math.log(this.options.zoom.delta)) * 10) / 10
    }
  }

  /**
   * Returns current viewBox
   * @returns {ViewBox} ViewBox
   */
  getViewBox(): ViewBox {
    return this.viewBox
  }
  setRatio(ratio: number): void {
    const center = this.getCenterSvgPoint()
    let width: number, height: number

    const originalRatio = this.svgDefault.viewBox.width / this.svgDefault.viewBox.height
    if (ratio > originalRatio) {
      width = this.svgDefault.viewBox.height * ratio
      height = this.svgDefault.viewBox.height
    } else {
      width = this.svgDefault.viewBox.width
      height = this.svgDefault.viewBox.width / ratio
    }
    this.viewBoxSetBySize(width, height)
  }

  /**
   * Adjusts the ViewBox dimensions to match a new width/height ratio while maintaining the center point.
   * Used when the container size changes and the ViewBox needs to be adjusted accordingly.
   *
   * @param viewBox - The ViewBox to adjust
   * @param width - New container width
   * @param height - New container height
   *
   * Example:
   * If container changes from 800x600 to 800x400:
   * - New ratio will be 2:1 (wider)
   * - ViewBox width will increase to maintain ratio
   * - Center point stays the same
   */
  private adjustViewBoxToSize(viewBox: ViewBox, width: number, height: number): ViewBox {
    const viewBoxCopy = viewBox.clone()
    // Get current center point
    const centerX = viewBoxCopy.x + viewBoxCopy.width / 2
    const centerY = viewBoxCopy.y + viewBoxCopy.height / 2

    // Calculate new ratio
    const newRatio = width / height
    const currentRatio = viewBoxCopy.width / viewBoxCopy.height

    let newWidth: number
    let newHeight: number

    if (newRatio > currentRatio) {
      // Width needs to increase
      newHeight = viewBoxCopy.height
      newWidth = newHeight * newRatio
    } else {
      // Height needs to increase
      newWidth = viewBoxCopy.width
      newHeight = newWidth / newRatio
    }

    // Calculate new top-left corner to maintain center point
    const newX = centerX - newWidth / 2
    const newY = centerY - newHeight / 2

    // Update the passed viewBox
    viewBoxCopy.update({
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
    })

    return viewBoxCopy
  }

  /**
   * Adjusts the size of the map container and viewBox simultaneously.
   * This method is ideal for scenarios where both the map container and viewBox sizes need to be modified.
   * @param {number} width The desired width for the map container
   * @param {number} height The desired height for the map container
   * @returns {ViewBox} The updated viewBox object
   */
  viewBoxSetBySize(width: number, height: number): ViewBox {
    this.setSize(width, height)

    const viewBoxInitialAdjusted = this.adjustViewBoxToSize(this._viewBox, width, height)
    this.setInitialViewBox(viewBoxInitialAdjusted)

    const currentViewBox = this.adjustViewBoxToSize(this.viewBox, width, height)
    this.setViewBox(currentViewBox)

    this.setSize(width, height)

    return this.viewBox
  }
  /**
   * Returns viewBox for a provided width/height ratio
   * @param ratio
   * @returns {ViewBox} ViewBox
   * @private
   */
  viewBoxGetByRatio(ratio: number): ViewBox {
    const old_ratio = this.svgDefault.viewBox.width / this.svgDefault.viewBox.height

    const vb = this.svgDefault.viewBox.clone()

    if (ratio != old_ratio) {
      if (ratio > old_ratio) {
        vb.width = this.svgDefault.viewBox.height * ratio
        vb.x = this.svgDefault.viewBox.x - (vb.width - this.svgDefault.viewBox.width) / 2
      } else {
        vb.height = this.svgDefault.viewBox.width / ratio
        vb.y = this.svgDefault.viewBox.y - (vb.height - this.svgDefault.viewBox.height) / 2
      }
    }

    return vb
  }
  /**
   * Returns viewBox for a provided width/height
   * @param width
   * @param height
   * @returns {ViewBox} ViewBox
   * @private
   */
  viewBoxGetBySize(width: number, height: number): ViewBox {
    const new_ratio = width / height
    const old_ratio = this.svgDefault.viewBox.width / this.svgDefault.viewBox.height

    const vb = this.svgDefault.viewBox.clone()

    if (new_ratio != old_ratio) {
      if (new_ratio > old_ratio) {
        vb.width = this.svgDefault.viewBox.height * new_ratio
        vb.x = this.svgDefault.viewBox.x - (vb.width - this.svgDefault.viewBox.width) / 2
      } else {
        vb.height = this.svgDefault.viewBox.width / new_ratio
        vb.y = this.svgDefault.viewBox.y - (vb.height - this.svgDefault.viewBox.height) / 2
      }
    }

    return vb
  }
  /**
   * Resets the map zoom and scroll to the initial position.
   * @param {boolean} toInitial - Set to "true" to reset to the initial viewBox that was set by the user;
   * set to "false" to reset to the original SVG viewBox as defined in the SVG file.
   * @returns {ViewBox} The new ViewBox after the reset.
   */
  viewBoxReset(type: "custom" | "initial" | "svg" = "custom"): ViewBox {
    const viewBox = this.getViewBoxByState(type)
    if (this.googleMaps.map) {
      switch (type) {
        case "custom": {
          const bounds = this.getGeoBounds(this._viewBox)
          const latLngBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(bounds.sw),
            new google.maps.LatLng(bounds.ne),
          )
          this.googleMaps.map.fitBounds(latLngBounds, 0)
          break
        }
        case "initial": {
          const bounds = this.getGeoBounds(this.svgDefault.viewBox)
          const latLngBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(bounds.sw),
            new google.maps.LatLng(bounds.ne),
          )
          this.googleMaps.map.fitBounds(latLngBounds, 0)
          break
        }
        default:
          break
      }
      return viewBox
    } else {
      this.setViewBox(viewBox)
      return this.viewBox
    }
  }

  getViewBoxByState(type: "custom" | "initial" | "svg"): ViewBox {
    switch (type) {
      case "custom":
        return this._viewBox
      case "initial": {
        return this.getAdjustedSvgDefaultViewBox()
      }
      case "svg":
        return this.svgDefault.viewBox
      default:
        break
    }
  }

  /**
   * Returns geo-bounds of the map.
   * @returns {number[]} - [leftLon, topLat, rightLon, bottomLat]
   */
  getGeoViewBox(): number[] | null {
    if (!this.isGeo()) {
      return null
    }
    const v = this.viewBox
    const p1 = new SVGPoint(v.x, v.y)
    const p2 = new SVGPoint(v.x + v.width, v.y)
    const p3 = new SVGPoint(v.x, v.y)
    const p4 = new SVGPoint(v.x, v.y + v.height)

    const leftLon = this.converter.convertSVGToGeo(p1).lng
    const rightLon = this.converter.convertSVGToGeo(p2).lng
    const topLat = this.converter.convertSVGToGeo(p3).lat
    const bottomLat = this.converter.convertSVGToGeo(p4).lat

    return [leftLon, topLat, rightLon, bottomLat]
  }

  /**
   * Retrieves the geographical boundaries of the map.
   * @returns {{ sw: GeoPoint; ne: GeoPoint }} - Returns an object with south-west and north-east geographical points.
   */
  getGeoBounds(viewBox?: ViewBox): { sw: GeoPoint; ne: GeoPoint } {
    const v = viewBox ?? this.viewBox
    const p1 = new SVGPoint(v.x, v.y)
    const p2 = new SVGPoint(v.x + v.width, v.y)
    const p3 = new SVGPoint(v.x, v.y)
    const p4 = new SVGPoint(v.x, v.y + v.height)

    const leftLon = this.converter.convertSVGToGeo(p1).lng
    const rightLon = this.converter.convertSVGToGeo(p2).lng
    const topLat = this.converter.convertSVGToGeo(p3).lat
    const bottomLat = this.converter.convertSVGToGeo(p4).lat

    return {
      sw: { lng: leftLon, lat: bottomLat },
      ne: { lng: rightLon, lat: topLat },
    }
  }

  /**
   * @ignore
   */
  private setStrokes() {
    $(this.containers.svg)
      .find("path, polygon, circle, ellipse, rect, line, polyline")
      .each((index, elem) => {
        const width = MapObject.getComputedStyle("stroke-width", elem)
        if (width) {
          $(elem).attr("data-stroke-width", width.replace("px", ""))
        }
      })
  }

  /**
   * Adjusts stroke thickness on zoom change
   * @ignore
   */
  private adjustStrokes(): void {
    $(this.containers.svg)
      .find("path, polygon, circle, ellipse, rect, line, polyline")
      .each((index, elem) => {
        const width = elem.getAttribute("data-stroke-width")
        if (width) {
          $(elem).css("stroke-width", Number(width) / this.scale)
        }
      })
  }
  /**
   * Zooms-in the map
   * @param {SVGPoint} center - if provided, zoom will shift the center point
   */
  zoomIn(center?: SVGPoint): void {
    if (this.requestZoom()) {
      this.zoom(this.zoomLevel + 1, center)
    }
  }
  /**
   * Zooms-out the map
   * @param {SVGPoint} center Center point (optional)
   */
  zoomOut(center?: SVGPoint): void {
    if (this.requestZoom()) {
      this.zoom(this.zoomLevel - 1, center)
    }
  }
  /**
   * Zooms to Region, Marker or array of Markers.
   * @param {String|Region|Marker|Marker[]|MarkersCluster[]} mapObjects - Region ID, Region, Marker, array of Markers, array of MarkerClusters
   * @param {number} zoomToLevel - Zoom level
   *
   * @example
   * var region = mapsvg.getRegion("US-TX");
   * mapsvg.zoomTo(region);
   */
  zoomTo(
    mapObjects: Region | Marker | MarkerCluster | Marker[] | Region[] | MarkerCluster[],
    zoomToLevel?: number,
  ): boolean {
    const zoomTo = Array.isArray(mapObjects) ? mapObjects : [mapObjects]

    if (zoomTo.length > 1 || zoomTo[0].type === MapObjectType.REGION) {
      if (!this.googleMaps?.map) {
        const bbox = this.getGroupBBox(zoomTo)
        return this.fitViewBox(bbox, zoomToLevel)
      } else {
        const bounds = this.getGroupBounds(zoomTo)

        const latLngBounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(bounds.sw),
          new google.maps.LatLng(bounds.ne),
        )
        this.googleMaps.map.fitBounds(latLngBounds, 10)
        if (bounds.ne.lat === bounds.sw.lat && bounds.ne.lng === bounds.sw.lng) {
          this.googleMaps.map.setZoom(zoomToLevel)
        }
      }
    } else {
      // Single Marker / cluster
      if (zoomTo[0].isMarker() || zoomTo[0].isCluster()) {
        return this.zoomToMarkerOrCluster(zoomTo[0], zoomToLevel)
      }
    }
  }

  /**
   * Zooms to a single marker or cluster
   * @private
   */
  zoomToMarkerOrCluster(mapObject: Marker | MarkerCluster, zoomToLevel?: number): boolean {
    if (this.requestZoom()) {
      const zoomLevel = zoomToLevel ?? 1
      const newVewBox = this.getZoomLevelViewBox(zoomLevel)
      const vbNew = new ViewBox(
        mapObject.svgPoint.x - newVewBox.width / 2,
        mapObject.svgPoint.y - newVewBox.height / 2,
        newVewBox.width,
        newVewBox.height,
      )
      this.setViewBox(vbNew)
      return true
    }

    return false
  }

  getGroupBounds(objects: (Region | Marker | MarkerCluster)[]): { sw: GeoPoint; ne: GeoPoint } {
    const lats: number[] = []
    const lngs: number[] = []

    objects.forEach((object) => {
      const bounds = object.getGeoBounds()
      lats.push(bounds.sw.lat, bounds.ne.lat)
      lngs.push(bounds.sw.lng, bounds.ne.lng)
    })

    if (lats.length === 0 || lngs.length === 0) {
      throw new Error("No valid geo points found in the provided objects.")
    }

    // Calculate the min and max latitude and longitude
    const minlat = Math.min(...lats)
    const maxlat = Math.max(...lats)
    const minlng = Math.min(...lngs)
    const maxlng = Math.max(...lngs)

    // Return the southwest and northeast points
    return {
      sw: new GeoPoint(minlat, minlng),
      ne: new GeoPoint(maxlat, maxlng),
    }
  }

  getGroupBBox(
    mapObjects: (Marker | Region | MarkerCluster)[],
    refineByViewbox?: ViewBox,
  ): ViewBox {
    let _bbox, bbox
    const xmax: number[] = []
    const ymax: number[] = []
    const allX: number[] = []
    const allY: number[] = []

    // const skipWidth = mapObjects[0] instanceof Marker || mapObjects[0] instanceof MarkerCluste
    const scale = refineByViewbox ? this.getScale(refineByViewbox) : this.getScale()

    for (let i = 0; i < mapObjects.length; i++) {
      _bbox = mapObjects[i].getBBox(scale)
      // find viewbox that fits _bbox
      // get it's scale
      // redo _bbox = mapObjects[i].getBBox(scale) with the new scale
      allX.push(_bbox.x)
      allY.push(_bbox.y)
      // if (!skipWidth) {
      allX.push(_bbox.x + _bbox.width)
      allY.push(_bbox.y + _bbox.height)
      // }
    }
    const _xmin = Math.min(...allX)
    const _ymin = Math.min(...allY)
    const _xmax = Math.max(...allX)
    const _ymax = Math.max(...allY)

    const width = _xmax - _xmin
    const height = _ymax - _ymin

    const padding = 0
    // const point1 = new ScreenPoint(padding, 0)
    // const point2 = new ScreenPoint(0, 0)
    // padding =
    //   this.converter.convertPixelToSVG(point1).x - this.converter.convertPixelToSVG(point2).x

    const preViewBox = new ViewBox(
      _xmin - padding,
      _ymin - padding,
      width + padding * 2,
      height + padding * 2,
    )
    const newViewBox = this.getViewBoxThatFitsViewBox(preViewBox)

    return !refineByViewbox ? this.getGroupBBox(mapObjects, newViewBox) : preViewBox
  }

  getViewBoxThatFitsViewBox(viewBox: ViewBox, forceZoomLevel?: number): ViewBox {
    if (forceZoomLevel !== undefined) {
      return this.getZoomLevelViewBox(forceZoomLevel)
    }

    // Get the ratio between current viewBox and the target viewBox
    const defaultViewBox = this.getAdjustedSvgDefaultViewBox()

    // Calculate scale for both width and height
    const scaleWidth = defaultViewBox.width / viewBox.width
    const scaleHeight = defaultViewBox.height / viewBox.height

    // Use the smaller scale (means more zooming out) to ensure both dimensions fit
    const scale = Math.min(scaleWidth, scaleHeight)
    const zoomLevel = Math.floor(Math.log(scale) / Math.log(this.options.zoom.delta))

    return this.getZoomLevelViewBox(zoomLevel)
  }

  checkIfZoomIsNeeded(viewBox: ViewBox): boolean {
    return viewBox.width !== this.viewBox.width || viewBox.height !== this.viewBox.height
  }

  requestZoom(): boolean {
    if (!this.canZoom) {
      return false
    } else {
      this.isZooming = true
      this.canZoom = false
      setTimeout(() => {
        this.isZooming = false
        this.canZoom = true
      }, 700)
      return true
    }
  }

  fitViewBox(viewBox: ViewBox, forceZoomLevel?: number | null): boolean {
    const viewBoxFit = this.getViewBoxThatFitsViewBox(viewBox, forceZoomLevel)
    if (this.googleMaps.map) {
      const bounds = this.getGeoBounds(viewBox)
      const latLngBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(bounds.sw),
        new google.maps.LatLng(bounds.ne),
      )
      this.googleMaps.map.fitBounds(latLngBounds, 10)
      return true
    } else {
      // const zoomIsNeeded = this.checkIfZoomIsNeeded(viewBoxFit)
      // if (zoomIsNeeded) {
      //   if (!this.requestZoom()) {
      //     return false
      //   }
      // }
      const newViewBox = new ViewBox(
        viewBox.x - viewBoxFit.width / 2 + viewBox.width / 2,
        viewBox.y - viewBoxFit.height / 2 + viewBox.height / 2,
        viewBoxFit.width,
        viewBoxFit.height,
      )
      this.enableAnimation()
      this.setViewBox(newViewBox)

      return true
    }
  }

  /**
   * Zooms to a single region
   * @param region
   * @param zoomToLevel
   *
   * @private
   */
  zoomToRegion(region: Region, zoomToLevel?: number): boolean {
    this.fitViewBox(region.getBBox(), zoomToLevel)
    return true
  }

  setZoomLevel(zoomLevel: number): void {
    this.zoom(zoomLevel)
  }

  setCenter(point: SVGPoint): SVGPoint
  setCenter(point: GeoPoint): GeoPoint
  setCenter(point: SVGPoint | GeoPoint): SVGPoint | GeoPoint {
    let svgPoint: SVGPoint
    if (point instanceof GeoPoint) {
      if (!this.isGeo()) {
        throw new Error("MapSVG: can't center on a lat,lng point on a non-geo map.")
      }
      svgPoint = this.converter.convertGeoToSVG(point)
    } else {
      svgPoint = point
    }
    this.centerOn(svgPoint)
    return point
  }

  /**
   * Centers map on Region or Marker.
   * @param {Region|Marker} centerOnObject - Region or Marker
   * @param {number} yShift - Vertical shift from center. Used by showPopover method to fit popover in the map container
   */
  centerOn(
    centerOnObject?: Region | Marker | SVGPoint | SVGPointLiteral | GeoPoint | GeoPointLiteral,
    yShift?: number,
  ): ViewBox {
    yShift = yShift ? (yShift + 12) / this.getScale() : 0

    if (!centerOnObject) {
      centerOnObject = this.getCenterSvgPoint(true)
    }

    if (
      centerOnObject instanceof SVGPoint ||
      isSvgPointLiteral(centerOnObject) ||
      centerOnObject instanceof GeoPoint ||
      isGeoPointLiteral(centerOnObject)
    ) {
      const centerOnPoint = isSvgPointLiteral(centerOnObject)
        ? centerOnObject
        : this.converter.convertGeoToSVG(centerOnObject)
      const vb = this.viewBox
      const newViewBox = new ViewBox(
        centerOnPoint.x - vb.width / 2,
        centerOnPoint.y - vb.height / 2 - yShift,
        vb.width,
        vb.height,
      )
      this.setViewBox(newViewBox)
    } else if (this.googleMaps.map) {
      $(this.containers.map).addClass("scrolling")
      const latLng = centerOnObject.getCenterLatLng(yShift)
      this.googleMaps.map.panTo(latLng)
      setTimeout(() => {
        $(this.containers.map).removeClass("scrolling")
      }, 100)
    } else {
      const bbox = centerOnObject.getBBox()
      const vb = this.viewBox
      const newViewBox = new ViewBox(
        bbox.x - vb.width / 2 + bbox.width / 2,
        bbox.y - vb.height / 2 + bbox.height / 2 - yShift,
        vb.width,
        vb.height,
      )
      this.setViewBox(newViewBox)
      return newViewBox
    }
  }
  /**
   * Adjusts the map's zoom level
   * @param {number} zoomLevel - The target zoom level
   * @param {SVGPoint} [center] - Optional: The center point for zooming
   */
  zoom(zoomLevel: number, center?: SVGPoint): void {
    const d = zoomLevel > this.zoomLevel ? 1 : -1

    const zoomIn = d > 0
    const zoomOut = d < 0

    const zoomRange = this.getZoomRange()

    const isInZoomRange = this.zoomLevel >= zoomRange.min && this.zoomLevel <= zoomRange.max

    const goingOutOfZoomRange =
      isInZoomRange &&
      (zoomLevel > zoomRange.max ||
        (zoomLevel < zoomRange.min && zoomLevel < this.initialZoomLevel))

    const outOfRangeAndMovingAway =
      !isInZoomRange &&
      ((zoomIn && zoomLevel > zoomRange.max) || (zoomOut && zoomLevel < zoomRange.min))

    if (goingOutOfZoomRange || outOfRangeAndMovingAway) {
      return
    }

    let shift = []
    const newViewBox = this.googleMaps.map
      ? this.viewBox.clone()
      : this.getZoomLevelViewBox(zoomLevel)

    if (this.googleMaps.map) {
      const scale = Math.pow(2, zoomLevel - this.zoomLevel)
      newViewBox.width /= scale
      newViewBox.height /= scale
    }

    if (center) {
      const widthRatio = this.svgDefault.viewBox.width / newViewBox.width
      const heightRatio = this.svgDefault.viewBox.height / newViewBox.height
      const newScale = Math.min(widthRatio, heightRatio)
      const oldWidthRatio = this.svgDefault.viewBox.width / this.viewBox.width
      const oldHeightRatio = this.svgDefault.viewBox.height / this.viewBox.height
      const oldScale = Math.min(oldWidthRatio, oldHeightRatio)
      const zoomFactor = oldScale / newScale //zoomScaleDelta > 0 ? 1 / (newScale / oldScale) : newScale / oldScale

      newViewBox.x = this.viewBox.x + (center.x - this.viewBox.x) * (1 - zoomFactor)
      newViewBox.y = this.viewBox.y + (center.y - this.viewBox.y) * (1 - zoomFactor)
    } else {
      shift = [
        (this.viewBox.width - newViewBox.width) / 2,
        (this.viewBox.height - newViewBox.height) / 2,
      ]
      newViewBox.x = this.viewBox.x + shift[0]
      newViewBox.y = this.viewBox.y + shift[1]
    }
    this.shiftViewBoxToScrollBoundaries(newViewBox)

    if (this.googleMaps.map) {
      this.googleMaps.map.setZoom(zoomLevel)
      if (center) {
        this.googleMaps.map.setCenter(this.getCenterGeoPoint(false, newViewBox))
      }
    } else {
      this.setViewBox(newViewBox)
    }
  }

  private toggleSvgLayerOnZoom(): void {
    if (
      this.googleMaps.map &&
      this.options.zoom.hideSvg &&
      this.googleMaps.map.getZoom() >= this.options.zoom.hideSvgZoomLevel
    ) {
      if (!$(this.containers.svg).hasClass("mapsvg-invisible")) {
        $(this.containers.svg).animate({ opacity: 0 }, 400, "linear", () => {
          $(this.containers.svg).addClass("mapsvg-invisible")
        })
      }
    } else {
      if ($(this.containers.svg).hasClass("mapsvg-invisible")) {
        $(this.containers.svg).animate({ opacity: 1 }, 400, "linear", () => {
          $(this.containers.svg).removeClass("mapsvg-invisible")
        })
      }
    }
  }

  private shiftViewBoxToScrollBoundaries(newViewBox: ViewBox): ViewBox {
    if (this.options.scroll.limit) {
      clampViewBoxToScrollBoundaries(
        newViewBox,
        this.svgDefault.viewBox,
        this.getAdjustedSvgDefaultViewBox(),
      )
    }
    return newViewBox
  }

  /**
   * Deletes a marker
   * @param {Marker} marker
   */
  markerDelete(marker: Marker): void {
    if (this.editingMarker && this.editingMarker.id == marker.id) {
      this.unsetEditingMarker()
    }

    if (this.markers.findById(marker.id)) {
      this.markers.delete(marker.id)
    }
    marker.delete()
    marker = null

    if (this.markers.length === 0) this.options.markerLastID = 0
  }
  /**
   * Adds a marker cluster
   * @param {MarkerCluster} markersCluster
   */
  markersClusterAdd(markersCluster: MarkerCluster): void {
    return this.clusteringModule()?.markersClusterAdd.call(this, this.clusteringServices(), markersCluster)
  }
  /** Adds a marker to the map.
   * @param {Marker} marker
   *
   * @example
   * let location = new mapsvg.location({
   *   geoPoint: new mapsvg.geoPoint({lat: 55.12, lng: 46.19}),
   *   img: "/path/to/image.png"
   *  });
   *
   * let marker = new mapsvg.marker({
   *   location: location,
   *   mapsvg: mapInstance
   * });
   *
   * // The marker is created but still not added to the map. Let's add it:
   * mapInstance.markerAdd(marker);
   */
  markerAdd(marker): void {
    $(marker.element).hide()
    this.layers.markers.append(marker.element)
    marker.adjustScreenPosition()
    this.markers.push(marker)
    marker.mapped = true

    setTimeout(function () {
      $(marker.element).show()
    }, 100)
  }
  /**
   * Removes marker from the map
   * @param marker
   */
  markerRemove(marker: Marker): void {
    if (this.editingMarker && this.editingMarker.id == marker.id) {
      this.editingMarker = null
      delete this.editingMarker
    }

    if (this.markers.findById(marker.id)) {
      this.markers.findById(marker.id).delete()
      this.markers.delete(marker.id)
      marker = null
    }
    if (this.markers.length === 0) this.options.markerLastID = 0
  }
  /**
   * Generates new Marker ID
   * @ignore
   */
  markerId(): string {
    this.options.markerLastID = this.options.markerLastID + 1
    const id = "marker_" + this.options.markerLastID
    if (this.markers.findById(id)) return this.markerId()
    else return id
  }

  /**
   * Adjust positions of all movable objects (markers, clusters, popovers, labels)
   * @ignore
   */
  movingItemsAdjustScreenPosition() {
    this.markersAdjustScreenPosition()

    this.popoverAdjustScreenPosition()

    this.bubblesRegionsAdjustScreenPosition()

    this.labelsRegionsAdjustScreenPosition()
  }

  /**
   * Move all movable objects (markers, clusters, popovers, labels) by given values
   * @param {number} deltaX
   * @param {number} deltaY
   * @ignore
   */
  movingItemsMoveScreenPositionBy(deltaX, deltaY) {
    this.markersMoveScreenPositionBy(deltaX, deltaY)

    this.popoverMoveScreenPositionBy(deltaX, deltaY)

    this.bubblesRegionsMoveScreenPositionBy(deltaX, deltaY)

    this.labelsRegionsMoveScreenPositionBy(deltaX, deltaY)
  }

  /**
   * Adjusts position of Region Labels
   * @ignore
   */
  labelsRegionsAdjustScreenPosition() {
    if ($(this.containers.map).is(":visible")) {
      this.regions.forEach(function (region) {
        region.adjustLabelScreenPosition()
      })
    }
  }

  /**
   * Adjusts position of Regions bubbles
   * @ignore
   */
  bubblesRegionsAdjustScreenPosition() {
    if ($(this.containers.map).is(":visible")) {
      this.regions.forEach(function (region) {
        region.adjustBubbleScreenPosition()
      })
    }
  }

  /**
   * Move position of Region Labels by given numbers
   *
   * @param {number} deltaX
   * @param {number} deltaY
   */
  labelsRegionsMoveScreenPositionBy(deltaX: number, deltaY: number): void {
    if ($(this.containers.map).is(":visible")) {
      this.regions.forEach(function (region) {
        region.moveLabelScreenPositionBy(deltaX, deltaY)
      })
    }
  }

  /**
   * Move position of Regions bubbles by given numbers
   *
   * @param {number} deltaX
   * @param {number} deltaY
   */
  bubblesRegionsMoveScreenPositionBy(deltaX: number, deltaY: number): void {
    if ($(this.containers.map).is(":visible")) {
      this.regions.forEach((region) => {
        region.moveBubbleScreenPositionBy(deltaX, deltaY)
      })
    }
  }

  /**
   * Adjusts position of Markers and MarkerClusters.
   * This method is called on zoom or when map container is resized.
   */
  markersAdjustScreenPosition(): void {
    this.markers.forEach((marker: Marker) => {
      marker.adjustScreenPosition()
    })
    this.markersClusters.forEach((cluster: MarkerCluster) => {
      cluster.adjustScreenPosition()
    })
    if (this.userLocationMarker) {
      this.userLocationMarker.adjustScreenPosition()
    }
  }

  /**
   * Move Markers and clusters by given numbers.
   *
   * @param {number} deltaX
   * @param {number} deltaY
   */
  markersMoveScreenPositionBy(deltaX: number, deltaY: number): void {
    this.markers.forEach((marker) => {
      marker.moveSrceenPositionBy(deltaX, deltaY)
    })

    this.markersClusters.forEach((cluster: MarkerCluster) => {
      cluster.moveSrceenPositionBy(deltaX, deltaY)
    })

    if (this.userLocationMarker) {
      this.userLocationMarker.moveSrceenPositionBy(deltaX, deltaY)
    }
  }

  /**
   * Sets marker into "edit mode".
   * Used in Map Editor.
   * @param {Marker} marker
   */
  setEditingMarker(marker: Marker): void {
    this.editingMarker = marker
    if (!this.editingMarker.mapped) {
      this.markerAdd(this.editingMarker)
    }
  }
  /**
   * Disables marker "edit mode".
   * Used in Map Editor.
   * @private
   */
  unsetEditingMarker(): void {
    if (this.editingMarker && this.editingMarker.mapped) {
      this.markerRemove(this.editingMarker)
    }
    this.editingMarker = null
  }
  /**
   * Returns marker that is currently in the "edit mode"
   * Used in Map Editor.
   */
  getEditingMarker(): Marker {
    return this.editingMarker
  }
  isLinkClicked(e): boolean {
    const href = e.target?.getAttribute("href") || e.target?.parentElement?.getAttribute("href")

    return !!((e.target && $(e.target).is("a")) || $(e.target).closest("a").length || href)
  }
  // Check if clicked element is a link and handle the redirect
  handleLinkClick(e: JQuery.TriggeredEvent): void {
    if (this.isLinkClicked(e)) {
      const htmlLinkElement = $(e.target).is("a") ? e.target : $(e.target).closest("a")[0]
      const link = $(htmlLinkElement)
      const href = link.attr("href") || link.attr("xlink:href")

      // Check if it's an external link
      if (href && href.startsWith("http")) {
        e.preventDefault() // Prevent default if you want to handle the redirect

        // Check for target="_blank"
        if (link.attr("target") === "_blank") {
          window.open(href, "_blank")
        } else {
          window.location.href = href
        }
      }

      // Optional: handle internal links differently
      if (href && href.startsWith("#")) {
        e.preventDefault()
        // Handle internal navigation
        // ...
      }
    }
  }

  /**
   * Event handler - called when map scroll starts
   * @param e
   * @param {MapSVGMap} mapsvg
   * @returns {boolean}
   */
  scrollStart(e: JQuery.TouchEventBase, mapsvg: MapSVGMap): void {
    if ($(e.target).hasClass("mapsvg-btn-map") || $(e.target).closest(".mapsvg-choropleth").length)
      return

    if (this.editMarkers.on && $(e.target).hasClass("mapsvg-marker")) return

    e.preventDefault()

    $(this.containers.map).addClass("no-transitions")

    const ce =
      e.touches && e.touches[0]
        ? e.touches[0]
        : e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]
          ? e.originalEvent.touches[0]
          : e

    this.scrollStarted = true

    this.scroll = {
      tx: this.scroll.tx || 0,
      ty: this.scroll.ty || 0,
      // initial viewbox when scrollning started
      vxi: this.viewBox.x,
      vyi: this.viewBox.y,
      // mouse coordinates when scrolling started
      x: ce.clientX,
      y: ce.clientY,
      // mouse delta
      dx: 0,
      dy: 0,
      // new viewbox x/y
      vx: 0,
      vy: 0,
      // for google maps scroll
      gx: ce.clientX,
      gy: ce.clientY,
      touchScrollStart: 0,
    }

    if (e.type.indexOf("mouse") === 0) {
      const doc = this.eventDocument
      $(doc).on("mousemove.scroll.mapsvg", (e: JQuery.TouchEventBase) => {
        this.scrollMove(e)
      })
      if (this.options.scroll.spacebar) {
        $(doc).on("keyup.scroll.mapsvg", (e: JQuery.TouchEventBase) => {
          if (e.keyCode == 32) {
            this.scrollEnd(e, mapsvg)
          }
        })
      } else {
        $(doc).on("mouseup.scroll.mapsvg", (e: JQuery.TouchEventBase) => {
          this.scrollEnd(e, mapsvg)
        })
      }
    }
  }
  /**
   * Event handler - called when map scroll moves
   * @param e
   * @private
   */
  scrollMove(e: JQuery.TouchEventBase): void {
    e.preventDefault()

    if (!this.isScrolling) {
      this.isScrolling = true
      // $(this.containers.map).css('pointer-events','none');
      $(this.containers.map).addClass("scrolling")
    }

    const ce =
      e.touches && e.touches[0]
        ? e.touches[0]
        : e.originalEvent && e.originalEvent.touches && e.originalEvent.touches[0]
          ? e.originalEvent.touches[0]
          : e

    this.panBy(this.scroll.gx - ce.clientX, this.scroll.gy - ce.clientY)

    this.scroll.gx = ce.clientX
    this.scroll.gy = ce.clientY

    // delta x/y
    this.scroll.dx = this.scroll.x - ce.clientX
    this.scroll.dy = this.scroll.y - ce.clientY

    // new viewBox x/y
    let vx = this.scroll.vxi + this.scroll.dx / this.scale
    let vy = this.scroll.vyi + this.scroll.dy / this.scale

    // Limit scroll to map boundaries
    if (this.options.scroll.limit) {
      const limited = new ViewBox(vx, vy, this.viewBox.width, this.viewBox.height)
      clampViewBoxToScrollBoundaries(
        limited,
        this.svgDefault.viewBox,
        this.getAdjustedSvgDefaultViewBox(),
      )
      vx = limited.x
      vy = limited.y
    }

    this.scroll.vx = vx
    this.scroll.vy = vy
  }
  /**
   * Event handler - called when map scroll ends
   * @param {JQuery.TriggeredEvent} e
   * @param {MapSVGMap} mapsvg
   * @param {boolean} noClick
   * @returns {boolean}
   * @private
   */
  scrollEnd(e: JQuery.TouchEventBase, mapsvg: MapSVGMap, noClick?: boolean): void {
    setTimeout(() => {
      this.enableAnimation()
      this.scrollStarted = false
      this.isScrolling = false
    }, 100)
    if (this.googleMaps.map && this.googleMaps.overlay) {
      this.googleMaps.overlay.draw()
    }

    $(this.containers.map).removeClass("scrolling")
    const doc = this.eventDocument
    $(doc).off("keyup.scroll.mapsvg")
    $(doc).off("mousemove.scroll.mapsvg")
    $(doc).off("mouseup.scroll.mapsvg")

    // call regionClickHandler if mouse did not move more than 5 pixels
    if (noClick !== true && Math.abs(this.scroll.dx) < 5 && Math.abs(this.scroll.dy) < 5) {
      // Usage in your click handler:
      if (this.isLinkClicked(e)) {
        this.handleLinkClick(e)
        return // Exit the handler after processing the link
      }

      if (this.editMarkers.on) this.clickAddsMarker && this.markerAddClickHandler(e)
      else if (this.objectClickedBeforeScroll)
        if (this.objectClickedBeforeScroll.isMarker()) {
          this.markerClickHandler(e, this.objectClickedBeforeScroll)
        } else if (this.objectClickedBeforeScroll.isRegion()) {
          this.regionClickHandler(e, this.objectClickedBeforeScroll)
        } else if (this.objectClickedBeforeScroll.isCluster()) {
          this.markerClusterClickHandler(e, this.objectClickedBeforeScroll)
        }
    }

    this.viewBox.x = this.scroll.vx || this.viewBox.x
    this.viewBox.y = this.scroll.vy || this.viewBox.y
  }

  setViewBoxByGoogleMapsOverlay(): void {
    if (
      !shouldSyncGoogleMapsOverlay(
        this.googleMaps.initialized,
        this.isMapContainerVisible(),
        !!this.googleMaps.needsViewportRestore,
      )
    ) {
      return
    }

    const bounds = this.googleMaps.overlay.getPixelBounds()
    const scale = this.googleMaps.overlay.getScale()
    if (!scale || !bounds) return

    const { width, height } = this.getMapContainerSize()
    const viewBox = new ViewBox(
      this.svgDefault.viewBox.x - bounds.sw.x / scale,
      this.svgDefault.viewBox.y - bounds.ne.y / scale,
      width / scale,
      height / scale,
    )

    this.setViewBox(viewBox, false)
  }

  /**
   * Shift the map by x,y pixels
   * @param {number} x
   * @param {number} y
   */
  panBy(x: number, y: number): { x: boolean; y: boolean } {
    let tx = this.scroll.tx - x
    let ty = this.scroll.ty - y

    const scrolled = { x: true, y: true }

    if (this.options.scroll.limit) {
      const svg = $(this.containers.svg)[0].getBoundingClientRect()
      const bounds = $(this.containers.map)[0].getBoundingClientRect()
      if ((svg.left - x > bounds.left && x < 0) || (svg.right - x < bounds.right && x > 0)) {
        tx = this.scroll.tx
        scrolled.x = false
      }
      if ((svg.top - y > bounds.top && y < 0) || (svg.bottom - y < bounds.bottom && y > 0)) {
        ty = this.scroll.ty
        scrolled.y = false
      }
    }

    const widthRatio = this.svgDefault.viewBox.width / this.viewBox.width

    // this.containers.scrollpane.style.transform = "translate(" + tx + "px," + ty + "px)"
    this.containers.svg.style.transform =
      "translate(" +
      tx +
      "px, " +
      ty +
      "px) " +
      "scale(" +
      widthRatio * this.iosDownscaleFactor +
      ")"

    this.scroll.tx = tx
    this.scroll.ty = ty

    if (scrolled.x || scrolled.y) {
      const moveX = scrolled.x ? x : 0
      const moveY = scrolled.y ? y : 0

      this.movingItemsMoveScreenPositionBy(moveX, moveY)

      if (this.googleMaps.map) {
        let point = this.googleMaps.map.getCenter()

        const projection = this.googleMaps.overlay.getProjection()

        const pixelpoint = projection.fromLatLngToDivPixel(point)
        pixelpoint.x += moveX
        pixelpoint.y += moveY

        point = projection.fromDivPixelToLatLng(pixelpoint)

        this.googleMaps.map.setCenter(point)
      }
    }

    return scrolled
  }
  /**
   * Save the Region ID that was clicked before starting map scroll.
   * It is used to trigger .regionClickHandler() later if scroll was less than 5px
   */
  setObjectClickedBeforeScroll(object: Region | Marker | MarkerCluster): void {
    this.objectClickedBeforeScroll = object
  }

  /**
   * Event hanlder
   * @param _e
   * @param mapsvg
   * @private
   */
  touchStart(_e: JQuery.TouchEventBase, mapsvg: MapSVGMap): void {
    _e.preventDefault()

    // stop scroll and cancel click event
    if (this.scrollStarted) {
      this.scrollEnd(_e, mapsvg, true)
    }
    const e = _e.originalEvent || _e

    if (this.options.zoom.fingers && e.touches && e.touches.length == 2) {
      // this.touchZoomStartViewBox = this.viewBox;
      // this.touchZoomStartScale =  this.scale;
      this.touchZoomStart = true
      this.scaleDistStart = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY,
      )
    } else if (e.touches && e.touches.length == 1) {
      this.scrollStart(_e, mapsvg)
    }

    // Use addEventListener with passive: false to allow preventDefault on touch events
    const doc = this.eventDocument
    doc.addEventListener("touchmove", this.touchMoveHandler, { passive: false })
    doc.addEventListener("touchend", this.touchEndHandler, { passive: false })
  }
  /**
   * Event hanlder
   * @param {JQuery.TriggeredEvent} _e
   * @param mapsvg
   * @private
   */
  touchMove(_e: JQuery.TouchEventBase, mapsvg: MapSVGMap): void {
    _e.preventDefault()
    const e = _e.originalEvent || _e

    if (this.options.zoom.fingers && e.touches && e.touches.length == 2) {
      const scale = getPinchScale(e, this.scaleDistStart)

      if (scale != 1 && this.canZoom) {
        const d = scale > 1 ? 1 : -1

        const cx =
          e.touches[0].pageX >= e.touches[1].pageX
            ? e.touches[0].pageX -
              (e.touches[0].pageX - e.touches[1].pageX) / 2 -
              $(this.containers.map).offset().left
            : e.touches[1].pageX -
              (e.touches[1].pageX - e.touches[0].pageX) / 2 -
              $(this.containers.map).offset().left
        const cy =
          e.touches[0].pageY >= e.touches[1].pageY
            ? e.touches[0].pageY -
              (e.touches[0].pageY - e.touches[1].pageY) -
              $(this.containers.map).offset().top
            : e.touches[1].pageY -
              (e.touches[1].pageY - e.touches[0].pageY) -
              $(this.containers.map).offset().top

        const center = this.converter.convertPixelToSVG(new ScreenPoint(cx, cy))

        if (d > 0) this.zoomIn(center)
        else this.zoomOut(center)
      }
    } else if (e.touches && e.touches.length == 1) {
      this.scrollMove(_e)
    }
  }
  /**
   * Event hanlder
   * @param _e
   * @param mapsvg
   * @private
   */
  touchEnd(_e: JQuery.TouchEventBase, mapsvg: MapSVGMap): void {
    _e.preventDefault()
    if (this.touchZoomStart) {
      this.touchZoomStart = false
    } else if (this.scrollStarted) {
      this.scrollEnd(_e, mapsvg)
    }

    // Remove the touch event listeners
    const doc = this.eventDocument
    doc.removeEventListener("touchmove", this.touchMoveHandler, false)
    doc.removeEventListener("touchend", this.touchEndHandler, false)
  }
  /**
   * Returns array of IDs of selected Regions
   * @returns {String[]}
   */
  getSelected(): string[] {
    return this.selected_id
  }
  /**
   * Selects a Region
   * @param {Region|string} id - Region or ID
   * @param {bool} skipDirectorySelection
   * @returns {boolean}
   */
  selectRegion(id: string | Region, skipDirectorySelection?: boolean): void {
    let region: Region

    // this.hidePopover();
    if (typeof id == "string") {
      region = this.getRegion(id)
    } else {
      region = id
    }
    if (!region) return

    let ids: Array<string>

    if (this.options.multiSelect && !this.editRegions.on) {
      if (region.selected) {
        this.deselectRegion(region)
        if (!skipDirectorySelection && (hasRuntimeFeature("directory") && this.options.menu.on)) {
          if (this.componentSource("directory") == "database") {
            if (region.objects && region.objects.length) {
              ids = region.objects.map((obj: Model) => {
                return obj.getData().id.toString()
              })
            }
          } else {
            ids = [region.id]
          }
          this.controllers.directory?.deselectItems()
        }

        return
      }
    } else if (this.selected_id.length > 0) {
      this.deselectAllRegions()
      if (!skipDirectorySelection && (hasRuntimeFeature("directory") && this.options.menu.on)) {
        if (this.componentSource("directory") == "database") {
          if (region.objects && region.objects.length) {
            ids = region.objects.map((obj: Model) => {
              return obj.getData().id.toString()
            })
          }
        } else {
          ids = [region.id]
        }
        this.controllers.directory?.deselectItems()
      }
    }

    this.unhighlightRegions()

    // Remove the region from highlightedRegions array if present
    const index = this.highlightedRegions.indexOf(region)
    if (index > -1) {
      region.unhighlight()
      this.highlightedRegions.splice(index, 1)
    }
    this.selected_id.push(region.id)
    region.select()

    const skip = (hasRuntimeFeature("directory") && this.options.actions.region.click.filterDirectory)

    if (
      !skip &&
      !skipDirectorySelection &&
      (hasRuntimeFeature("directory") && this.options.menu.on) &&
      this.controllers &&
      this.controllers.directory
    ) {
      if (this.componentSource("directory") == "database") {
        if (region.objects && region.objects.length) {
          ids = region.objects.map((obj: Model) => {
            return obj.getData().id.toString()
          })
        } else {
          ids = [region.id]
        }
      } else {
        ids = [region.id]
      }
      this.controllers.directory?.selectItems(ids)
    }

    if (
      this.options.actions.region.click.addIdToUrl &&
      !(hasRuntimeFeature("show_another_map") && this.options.actions.region.click.showAnotherMap)
    ) {
      window.location.hash = "/m/r/" + region.id
      // history.replaceState(null, null, region.id);
      // history.replaceState("", document.title, window.location.pathname
      //     + window.location.search + '#m_'+region.id);
    }
  }
  /**
   * Deselects all Regions
   */
  deselectAllRegions(): void {
    $.each(this.selected_id, (index, id) => {
      this.deselectRegion(this.getRegion(id))
    })
  }
  /**
   * Deselects one Region
   * @param {Region} region
   */
  deselectRegion(region: Region): void {
    if (!region) region = this.getRegion(this.selected_id[0])
    if (region) {
      region.deselect()
      const i = $.inArray(region.id, this.selected_id)
      this.selected_id.splice(i, 1)
    }
    if (this.options.actions.region.click.addIdToUrl) {
      if (window.location.hash.indexOf(region.id) !== -1) {
        history.replaceState(null, null, " ")
      }
    }
  }
  /**
   * Highlights an array of Regions (used on mouseover)
   * @param {Region[]} regions
   */
  highlightRegions(regions: Region[]): void {
    regions.forEach((region) => {
      if (region && !region.selected && !region.disabled) {
        this.highlightedRegions.push(region)
        region.highlight()
      }
    })
  }
  /**
   * Unhighlights all Regions  (used on mouseout)
   */
  unhighlightRegions(): void {
    this.highlightedRegions.forEach((region: Region) => {
      if (region && !region.selected && !region.disabled) region.unhighlight()
    })
    this.highlightedRegions = []
  }
  /**
   * Selects a Marker
   * @param {Marker} marker
   */
  selectMarker(marker: Marker): void {
    if (!marker.isMarker()) return

    this.deselectAllMarkers()
    marker.select()
    this.selected_marker = marker

    $(this.layers.markers).addClass("mapsvg-with-marker-active")

    if ((hasRuntimeFeature("directory") && this.options.menu.on) && this.componentSource("directory") == "database") {
      this.controllers.directory?.deselectItems()
      this.controllers.directory?.selectItems(marker.object.getData().id)
    }
  }

  /**
   * Deselects all Markers
   */
  deselectAllMarkers(): void {
    this.selected_marker && this.selected_marker.deselect()
    $(this.layers.markers).removeClass("mapsvg-with-marker-active")
  }

  /**
   * Deselects one Marker
   * @param {Marker} marker
   */
  deselectMarker(marker: Marker): void {
    if (marker) {
      marker.deselect()
    }
  }
  /**
   * Highlight marker
   * @param {Marker} marker
   */
  highlightMarker(marker: Marker): void {
    $(this.layers.markers).addClass("mapsvg-with-marker-hover")
    marker.highlight()
    this.highlighted_marker = marker
  }
  /**
   * Unhighlights all Regions  (used on mouseout)
   */
  unhighlightMarker(): void {
    $(this.layers.markers).removeClass("mapsvg-with-marker-hover")
    this.highlighted_marker && this.highlighted_marker.unhighlight()
  }
  /**
   * Converts mouse pointer coordinates to SVG coordinates
   * @param {object} e - Event object
   * @returns {Array} - [x,y] SVG coordinates
   */
  convertMouseToSVG(e: JQuery.TriggeredEvent): SVGPoint {
    const mc = getMouseCoords(e)
    const x = mc.x - $(this.containers.map).offset().left
    const y = mc.y - $(this.containers.map).offset().top
    const screenPoint = new ScreenPoint(x, y)
    return this.converter.convertPixelToSVG(screenPoint)
  }

  /**
   * For choropleth map: returns color for given number value
   * @param {number} choroplethValue - Number value
   * @returns {{r: number, g: number, b: number, a: number}} - Color values, 0-255.
   */
  pickChoroplethColor(choroplethValue: number): { r: number; g: number; b: number; a: number } {
    const w =
      (choroplethValue - this.options.choropleth.coloring.gradient.values.min) /
      this.options.choropleth.coloring.gradient.values.maxAdjusted
    const rgba = {
      r: Math.round(
        this.options.choropleth.coloring.gradient.colors.diffRGB.r * w +
          this.options.choropleth.coloring.gradient.colors.lowRGB.r,
      ),
      g: Math.round(
        this.options.choropleth.coloring.gradient.colors.diffRGB.g * w +
          this.options.choropleth.coloring.gradient.colors.lowRGB.g,
      ),
      b: Math.round(
        this.options.choropleth.coloring.gradient.colors.diffRGB.b * w +
          this.options.choropleth.coloring.gradient.colors.lowRGB.b,
      ),
      a: Math.round(
        this.options.choropleth.coloring.gradient.colors.diffRGB.a * w +
          this.options.choropleth.coloring.gradient.colors.lowRGB.a,
      ),
    }
    return rgba
  }
  /**
   * Checks if Region should be disabled
   * @param {string} id - Region ID
   * @param {string} svgfill - Region color ("fill" attribute)
   * @returns {boolean} - "true" if Region should be disabled.
   */
  isRegionDisabled(id: string, svgfill: string): boolean {
    if (this.options.regions[id] && (this.options.regions[id].disabled || svgfill == "none")) {
      return true
    } else if (
      (this.options.regions[id] == undefined ||
        utils.numbers.parseBoolean(this.options.regions[id].disabled)) &&
      (this.options.disableAll || svgfill == "none" || id == "labels" || id == "Labels")
    ) {
      return true
    } else {
      return false
    }
  }

  // START show_another_map
  /**
   * Gets map settings from the server
   */
  private anotherMapModule(): ShowAnotherMapModule | undefined {
    return window.MapSVG?.extensions?.get<ShowAnotherMapModule>("runtime.component", "show_another_map")
  }

  runAnotherMapAction(action: AnotherMapAction & { showAnotherMap?: boolean; showAnotherMapField?: string }, region, object): boolean {
    return this.anotherMapModule()?.action(this, action, region, object) ?? false
  }

  loadMap(id: number | string, container?: MapLoadTarget): void {
    if (!hasRuntimeFeature("show_another_map")) return
    const create = (element: HTMLElement, mapId: number, loadingText: string) =>
      createContextualChild(this.extras.getChildMapContext?.(element, mapId), (extras) =>
        new MapSVGMap(element, { id: mapId, options: { id: mapId, loadingText } }, extras))
    this.anotherMapModule()?.load(this, id, container, create, mapsvgCore.instances)

  }

  /** Only visible, mounted structural containers of this App can host a nested App. */
  getActionMapLayoutHost(nodeId: string): HTMLElement | undefined {
    if (!isTreeLayoutMode(this.options)) return undefined
    const node = Array.from(this.options.nodes || []).find(node => node.id === nodeId)
    if (!node || node.settings?.on === false) return undefined
    if (node.type === "slot" && this.activeLayoutSlotIds.has(nodeId)) return this.layoutSlotHosts.get(nodeId)
    if (node.type === "frame" && this.activeTreeNodeIds.has(nodeId)) return this.layoutNodeHosts.get(nodeId)
    return undefined
  }
  // END

  // START show_another_map
  /**
   * Load previous map from the history (MapSVGMap.options.previousMapsIds)
   */
  loadPreviousMap(): void {
    this.anotherMapModule()?.previous(this)
  }
  // END

  markerClusterClickHandler(e: JQuery.TriggeredEvent, markerCluster: MarkerCluster): void {
    return this.clusteringModule()?.markerClusterClickHandler.call(this, this.clusteringServices(), e, markerCluster)
  }
  regionClickHandler(e: JQuery.TriggeredEvent, region: Region): void {
    this.objectClickedBeforeScroll = null
    if (this.eventsPreventList["click"]) return

    if (this.editRegions.on) {
      this.regionEditHandler.call(region)
      return
    }

    const actions = this.options.actions

    if (actions.region.click.zoom) {
      this.zoomTo(
        region,
        typeof actions.region.click.zoomToLevel !== "undefined"
          ? parseInt(actions.region.click.zoomToLevel)
          : undefined,
      )
    }

    if (hasRuntimeFeature("directory") && actions.region.click.filterDirectory && this.options.database.on) {
      const relationField = this.objectsRepository.getSchema().getFieldByType("relation")
      const filterKey = (relationField && relationField.name) || "regions"
      const query = new Query({
        filters: {
          [filterKey]: {
            table_name: this.regionsRepository.getSchema().name,
            region_ids: [region.id],
          },
        },
      })

      this.objectsRepository.query.resetFilters()
      this.setFilterOut()

      this.objectsRepository.find(query).done(() => {
        if (this.controllers.popover) {
          this.controllers.popover.setState(region.getData())
        }
        if (this.controllers.detailsView) {
          this.controllers.detailsView.setState(region.getData())
        }
      })
      this.updateFiltersState()
    }

    if (actions.region.click.showDetails) {
      const template = hasRuntimeFeature("templates") ? undefined : actions.region.click.detailsViewTemplate
      const location = this.options.actions.region.click.detailsViewLocation
      this.loadDetailsView(region, template, location)
    }

    if (actions.region.click.showPopover) {
      const template = this.options.actions.region.click.popoverTemplate
      const delay = actions.region.click.zoom ? 400 : 0
      setTimeout(() => {
        this.showPopover(region, template)
      }, delay)
    } else if (e && e.type.indexOf("touch") !== -1 && actions.region.touch.showPopover) {
      const template = this.options.actions.region.click.popoverTemplate
      const delay = actions.region.click.zoom ? 400 : 0
      setTimeout(() => {
        this.showPopover(region, template)
      }, 400)
    }

    // START links
    if (actions.region.click.goToLink) {
      this.extractField(region, region.objects[0], actions.region.click.linkField, (url) => {
        if (url && !this.disableLinks) {
          if (this.inBackend) {
            alert("Redirect: " + url + "\nLinks are disabled in the preview.")
            return
          }
          if (actions.region.click.newTab) {
            const win = window.open(url, "_blank")
            win.focus()
          } else {
            window.location.href = url
          }
        }
      })
    }
    // END

    if (this.runAnotherMapAction(actions.region.click, region, region.objects[0])) return

    this.selectRegion(region.id)
    this.events.trigger("click.region", e, { region })
  }
  getMarkerFromElement(target: EventTarget): Marker | undefined {
    const element = $(target).closest(".mapsvg-marker")[0] as HTMLElement | undefined
    if (!element) return
    const marker = this.markers.get(element.dataset.mapsvgCopyOf || element.id)
    if (marker) marker.interactionElement = element
    return marker
  }

  markerClickHandler(e: JQuery.TriggeredEvent, marker: Marker): void {
    if (!marker) return
    this.objectClickedBeforeScroll = null
    if (this.eventsPreventList["click"]) return

    const actions = this.options.actions

    this.selectMarker(marker)
    const passingObject = marker.object

    if (actions.marker.click.zoom) {
      this.zoomTo(
        marker,
        typeof actions.marker.click.zoomToLevel !== "undefined"
          ? parseInt(actions.marker.click.zoomToLevel)
          : undefined,
      )
    }

    if (hasRuntimeFeature("directory") && actions.marker.click.filterDirectory && this.options.database.on) {
      const query = new Query({ filters: { id: marker.object.getData().id } })
      this.objectsRepository.find(query)
      this.updateFiltersState()
    }

    if (actions.marker.click.showDetails) {
      const template = hasRuntimeFeature("templates") ? undefined : actions.marker.click.detailsViewTemplate
      const location = this.options.actions.marker.click.detailsViewLocation
      this.loadDetailsView(passingObject, template, location)
    }

    if (actions.marker.click.showPopover) {
      const template = this.options.actions.marker.click.popoverTemplate
      const delay = actions.marker.click.zoom && this.googleMaps.map ? 700 : 0
      setTimeout(() => {
        this.showPopover(passingObject, template)
      }, delay)
    } else if (e && e.type.indexOf("touch") !== -1 && actions.marker.touch.showPopover) {
      const template = this.options.actions.marker.click.popoverTemplate
      const delay = actions.marker.click.zoom && this.googleMaps.map ? 700 : 0
      setTimeout(() => {
        this.showPopover(passingObject, template)
      }, delay)
    }
    // START links
    if (actions.marker.click.goToLink) {
      this.extractField(null, passingObject, actions.marker.click.linkField, (url) => {
        if (url && !this.disableLinks)
          if (this.inBackend) {
            alert("Redirect: " + url + "\nLinks are disabled in the preview.")
            return
          }
        if (actions.marker.click.newTab) {
          const win = window.open(url, "_blank")
          win.focus()
        } else {
          window.location.href = url
        }
      })
    }
    // END
    if (this.runAnotherMapAction(actions.marker.click, null, passingObject)) return

    if (
      this.options.actions.marker.click.addIdToUrl &&
      !(hasRuntimeFeature("show_another_map") && this.options.actions.marker.click.showAnotherMap)
    ) {
      window.location.hash = "/m/db/" + marker.object.getData().id
    }
    this.events.trigger("click.marker", e, { marker })
  }
  /**
   * Checks if file exists by provided URL.
   * @param {string} url
   * @returns {boolean}
   *
   * @private
   */
  fileExists(url: string): boolean {
    if (url.substr(0, 4) == "data") return true
    const http = new XMLHttpRequest()
    http.open("HEAD", url, false)
    http.send()
    return http.status != 404
  }

  /**
   * Hides all markers
   * @private
   */
  hideMarkers(): void {
    this.markers.forEach(function (marker) {
      marker.hide()
    })
    $(this.containers.wrap).addClass("mapsvg-edit-marker-mode")
  }
  /**
   * Hides all markers except one.
   * Used in Map Editor.
   * @param {string} id - ID of the Marker
   * @private
   */
  hideMarkersExceptOne(id: string): void {
    this.markers.forEach(function (marker) {
      if (typeof id === "undefined" || (marker.object && id !== String(marker.id))) {
        marker.hide()
      }
    })

    $(this.containers.wrap).addClass("mapsvg-edit-marker-mode")
  }
  /**
   * Shows all markers after .hideMarkersExceptOne()
   * Used in Map Editor.
   * @private
   */
  showMarkers(): void {
    this.markers.forEach(function (m) {
      m.show()
    })
    this.deselectAllMarkers()
    // $(this.containers.wrap).removeClass('mapsvg-clusters-hidden');
    $(this.containers.wrap).removeClass("mapsvg-edit-marker-mode")
  }
  /**
   * Event handler that creates marker on click on the map.
   * Used in the Map Editor.
   * @param {object} e - Event object
   * @returns {boolean}
   */
  markerAddClickHandler(e: JQuery.TriggeredEvent): void {
    // Don't add marker if marker was clicked
    if ($(e.target).hasClass("mapsvg-marker")) return
    const svgPoint = this.getSvgPointAtClick(e)
    const geoPoint = this.isGeo() ? this.converter.convertSVGToGeo(svgPoint) : null

    if (!$.isNumeric(svgPoint.x) || !$.isNumeric(svgPoint.y)) return

    if (this.editingMarker) {
      if (geoPoint) {
        this.editingMarker.location.setGeoPoint(geoPoint)
      }
      if (svgPoint) {
        this.editingMarker.location.setSvgPoint(svgPoint)
      }
      return
    }
    const location = new Location({
      svgPoint: svgPoint,
      geoPoint: geoPoint,
      img: this.options.defaultMarkerImage,
    })

    const marker = new Marker({
      location: location,
      mapsvg: this,
    })
    this.markerAdd(marker)

    this.markerEditHandler && this.markerEditHandler.call(location, location)
  }

  private getSvgPointAtClick(
    e: JQuery.TriggeredEvent | JQuery.MouseEventBase | MouseEvent,
  ): SVGPoint {
    const mc = getMouseCoords(e)
    const x = mc.x - $(this.containers.map).offset().left
    const y = mc.y - $(this.containers.map).offset().top
    const screenPoint = new ScreenPoint(x, y)
    return this.converter.convertPixelToSVG(screenPoint)
  }

  /**
   * Sets default marker image.
   * Used in Map Editor.
   * @param {string} src - Image URL
   * @private
   */
  setDefaultMarkerImage(src: string): void {
    this.options.defaultMarkerImage = src
  }

  /**
   * Checks and remebers if marker images should be set by a field value
   * @private
   */
  setMarkerImagesDependency(): void {
    this.locationField = this.objectsRepository.schema.getFieldByType("location")
    // @ts-ignore
    if (
      this.locationField &&
      this.locationField.markersByFieldEnabled &&
      this.locationField.markerField &&
      Object.values(this.locationField.markersByField).length > 0
    ) {
      this.setMarkersByField = true
    } else {
      this.setMarkersByField = false
    }
  }

  /**
   * Returns default marker image or marker image by field value if such option is enabled
   * @param {Number|String} fieldValue
   * @returns {String} URL of marker image
   * @private
   */
  getMarkerImage(fieldValueOrObject: any, location?: Location): string {
    if (this.options.markerDataRules) {
      const fallback = this.options.defaultMarkerImage || this.objectsRepository?.getSchema().getFieldByType("location")?.defaultMarkerPath || "_pin_default.png"
      return markerImageUrl(markerRuleImage(this.options.markerDataRules, fieldValueOrObject, fallback), mapsvgCore.routes)
    }
    let fieldValue

    if (this.setMarkersByField) {
      if (typeof fieldValueOrObject === "object") {
        // @ts-ignore
        fieldValue = fieldValueOrObject[this.locationField.markerField]
        if (this.locationField.markerField === "regions") {
          fieldValue = fieldValue[0] && fieldValue[0].id
        } else if (typeof fieldValue === "object" && fieldValue.length) {
          fieldValue = fieldValue[0].value
        }
      } else {
        fieldValue = fieldValueOrObject
      }
      // @ts-ignore
      if (this.locationField.markersByField[fieldValue]) {
        // @ts-ignore
        return this.locationField.markersByField[fieldValue]
      }
    }

    return location && location.imagePath
      ? location.imagePath
      : this.options.defaultMarkerImage
        ? this.options.defaultMarkerImage
        : mapsvgCore.routes.root + "markers/_pin_default.png"
  }

  /**
   * Sets on/off "edit markers" mode
   * @param {bool} on - on/off
   * @param {bool} clickAddsMarker - defines if click on the map should add a marker
   * @private
   */
  setMarkersEditMode(on: boolean, clickAddsMarker: boolean): void {
    this.editMarkers.on = utils.numbers.parseBoolean(on)
    this.clickAddsMarker = this.editMarkers.on
    this.setEventHandlers()
  }

  /**
   * Sets on/off "edit regions" mode
   * Used in Map Editor.
   * @param {bool} on - on/off
   *
   * @private
   */
  setRegionsEditMode(on: boolean): void {
    this.editRegions.on = utils.numbers.parseBoolean(on)
    this.deselectAllRegions()
    this.setEventHandlers()
  }

  /**
   * Enables edit mode (which means that the map is going to be shown in the Map Editor)
   * Used in the Map Editor.
   * @param {bool} on
   * @private
   */
  setEditMode(on: boolean): void {
    this.inBackend = on
  }

  /**
   * Enables "Edit objects" mode
   * Used in the Map Editor.
   * @param {bool} on
   * @private
   */
  setDataEditMode(on: boolean): void {
    this.editData.on = utils.numbers.parseBoolean(on)
    this.deselectAllRegions()
    this.setEventHandlers()
  }

  /**
   * Enables "Edit objects" mode
   * Used in the Map Editor.
   * @param {bool} on
   * @private
   */
  setDrawMode(on: boolean): void {
    this.drawMode = utils.numbers.parseBoolean(on)
    if (this.drawMode) {
      this.regions.forEach((region) => {
        region.setStyle(region.styleSvg)
      })
    } else {
      this.reloadAllRegionStyles()
    }
  }

  /**
   * Downloads SVG file.
   * @private
   */
  download() {
    window.location.href = window.location.origin + this.options.source
  }

  svg() {
    return {
      download: () => {
        // Get the source URL
        const sourceUrl =
          window.location.protocol + "//" + window.location.host + this.options.source

        // Create a temporary anchor element
        const link = document.createElement("a")
        link.href = sourceUrl

        // Extract filename from the source path
        const filename = sourceUrl.split("/").pop() || "download"
        link.download = filename

        // Set target to blank to avoid navigation
        link.target = "_blank"

        // Append to DOM, click, and remove
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      },
      open: () => {
        window.location.href = window.location.origin + this.options.source
      },
    }
  }

  /**
   * Adjusts popover position. User on zoom and when map container is resized.
   *
   */
  popoverAdjustScreenPosition(): void {
    if (this.controllers.popover instanceof PopoverController) {
      this.controllers.popover.adjustScreenPosition()
    }
  }

  /**
   * Moves popover position. User on zoom and when map container is resized.
   *
   * @param {number} deltaX
   * @param {number} deltaY
   */
  popoverMoveScreenPositionBy(deltaX: number, deltaY: number): void {
    if (this.controllers.popover instanceof PopoverController) {
      this.controllers.popover.moveSrceenPositionBy(deltaX, deltaY)
    }
  }

  /**
   * Shows a popover for provided Region or DB Object.
   * @param {Region|object} object - Region or DB Object
   *
   * @example
   * var region = mapsvg.getRegion("US-TX");
   * mapsvg.showPopover(region);
   */
  showPopover(object: Region | Model, templateName?: string): void {
    const mapObject =
      "type" in object && object.isRegion()
        ? object
        : object["location"] && object["location"].marker
          ? object["location"].marker
          : null
    if (!mapObject) return

    let point
    if (mapObject.isMarker()) {
      point = mapObject.svgPoint
    } else {
      point = mapObject.getCenterSVG()
    }

    // START templates
    const template =
      !hasRuntimeFeature("templates") && templateName
        ? this.getCompiledTemplate(templateName)
        : "type" in object && object.isRegion()
          ? this.getCompiledTemplate("popoverRegion")
          : this.getCompiledTemplate("popoverMarker")
    // REPLACE
    // const template = templateName
    //   ? this.getCompiledTemplate(templateName)
    //   : "type" in object && object.isRegion()
    //     ? this.getCompiledTemplate("popoverRegion")
    //     : this.getCompiledTemplate("popoverMarker")
    // END

    if (this.controllers.popover) this.controllers.popover.destroy()
    this.controllers.popover = new PopoverController({
      map: this,
      parent: this,
      container: this.layers.popovers,
      point: point,
      yShift:
        "type" in mapObject && mapObject.isMarker()
          ? mapObject.height
          : mapObject.isRegion() && mapObject.label
            ? mapObject.label.offsetHeight / 2
            : 0,
      template,
      state: object.getData(),
      mapObject: mapObject,
      scrollable: true,
      fullscreen: isPhone() && this.options.popovers.mobileFullscreen,
      useShadowRoot: this.useShadowRoot && isPhone() && this.options.popovers.mobileFullscreen,
      styles: {
        width: this.options.popovers.width + "px",
        backgroundColor: this.options.colors.popover,
        maxWidth: this.options.popovers.maxWidth + "%",
        maxHeight:
          (parseInt(this.options.popovers.maxHeight + "") * $(this.layers.popovers).outerHeight()) /
            100 +
          "px",
      },
      middleware: this.middlewares.middlewares.filter((m) => m.name === MiddlewareType.RENDER),
      events: {
        afterShow: (event) => {
          const { controller } = event.data
          if (this.options.popovers.centerOn) {
            const shift = controller.containers.main.offsetHeight / 2
            if (
              this.options.popovers.centerOn &&
              !(isPhone() && this.options.popovers.mobileFullscreen)
            ) {
              this.centerOn(mapObject, shift)
            }
          }
          this.popoverShowingFor = mapObject
        },
        afterClose: (event) => {
          const { controller } = event.data
          this.options.popovers.resetViewboxOnClose && this.viewBoxReset("custom")
          this.popoverShowingFor = null
          if ("type" in mapObject && mapObject.isRegion()) {
            this.deselectRegion(mapObject)
          } else if ("type" in mapObject && mapObject.isMarker()) {
            this.deselectAllMarkers()
          }
          this.controllers &&
            this.controllers.directory &&
            this.controllers.directory?.deselectItems()
          $("body").off(`mouseup.popover.mapsvg-${this.id} touchend.popover.mapsvg-${this.id}`)
        },
        resize: (event) => {
          const { controller } = event.data
          if (this.options.popovers.centerOn) {
            const shift = controller.containers.main.offsetHeight / 2
            if (
              this.options.popovers.centerOn &&
              !(isPhone() && this.options.popovers.mobileFullscreen)
            ) {
              this.centerOn(mapObject, shift)
            }
          }
        },
      },
    })
    this.controllers.popover.init()
    this.controllers.popover.open()
    setTimeout(() => {
      $("body").on(`mouseup.popover.mapsvg-${this.id} touchend.popover.mapsvg-${this.id}`, (e) => {
        const path =
          typeof e.originalEvent?.composedPath === "function"
            ? e.originalEvent.composedPath()
            : typeof (e as any).composedPath === "function"
              ? (e as any).composedPath()
              : [e.target]
        const hit = (sel: string) =>
          path.some((n) => n instanceof Element && (n.matches(sel) || !!n.closest(sel)))
        if (
          this.isScrolling ||
          hit(".mapsvg-directory") ||
          hit(".mapsvg-popover") ||
          hit(".mapsvg-btn-map") // или classList на узле из path
        )
          return
        this.controllers.popover.close()
      })
    }, 50)
  }

  /**
   * Hides the popover
   */
  hidePopover(): void {
    this.controllers.popover && this.controllers.popover.close()
  }

  /**
   * Event handler that catches clicks outside of the popover and closes the popover.
   * @param {object} e - Event object
   */
  popoverOffHandler(e: JQuery.TriggeredEvent): void {
    if (
      this.isScrolling ||
      $(e.target).closest(".mapsvg-popover").length ||
      $(e.target).hasClass("mapsvg-btn-map")
    )
      return
    // this.controllers.popover && this.controllers.popover.close()
  }

  /**
   * Mouseover event handler for Regions and Markers
   * @param {object} e - Event object
   * @param {Marker|Region} object
   * @private
   */
  mouseOverHandler(e: JQuery.TriggeredEvent, object: Marker | Region | MarkerCluster): void {
    if (this.eventsPreventList["mouseover"]) {
      return
    }

    if (object.isMarker()) {
      if (this.options.actions.marker.mouseover.showTooltip) {
        // START templates
        const template = hasRuntimeFeature("templates") ? undefined : this.options.actions.marker.mouseover.tooltipTemplate
        // REPLACE
        // const template = this.options.actions.marker.mouseover.tooltipTemplate
        // END
        this.showTooltip(object, template)
      }
    }

    if (object.isRegion()) {
      if (this.options.actions.region.mouseover.showTooltip) {
        // START templates
        const template = hasRuntimeFeature("templates") ? undefined : this.options.actions.region.mouseover.tooltipTemplate
        // REPLACE
        // const template = this.options.actions.region.mouseover.tooltipTemplate
        // END
        this.showTooltip(object, template)
      }
    }

    let ids: any[]
    if ((hasRuntimeFeature("directory") && this.options.menu.on) && this.controllers.directory) {
      if (this.componentSource("directory") == "database") {
        if (object.isRegion() && object.objects.length) {
          ids = object.objects.map((obj) => {
            return obj.getData().id
          })
        }
        if (object.isMarker()) {
          ids = object.object ? [object.object.getData().id] : []
        }
      } else {
        if (object.isRegion()) {
          ids = [object.id]
        }
        if (
          object.isMarker() &&
          object.object.getData().regions &&
          object.object.getData().regions.length
        ) {
          ids = object.object.getData().regions.map((obj) => {
            return obj.id
          })
        }
      }
      this.controllers.directory?.highlightItems(ids)
    }

    if (object.isRegion()) {
      if (!object.selected) object.highlight()
      this.events.trigger("mouseover.region", e, { region: object })
    } else {
      this.highlightMarker(<Marker>object)
      this.events.trigger("mouseover.marker", e, { marker: object })
    }
  }

  public showTooltip(object: Marker | Region | MarkerCluster, templateName?: string): void {
    let name, _object
    if (object.isRegion()) {
      name = "region"
      _object = object
    } else if (object.isMarker()) {
      name = "marker"
      _object = object.object
    } else {
      name = "cluster"
      _object = object
    }

    if (_object != null && this.popoverShowingFor !== object) {
      const camelName = `tooltip${ucfirst(name)}`
      if (this.controllers.tooltips[camelName]) {
        this.controllers.tooltips[camelName].destroy()
      }
      const template = templateName
        ? this.getCompiledTemplate(templateName)
        : this.getCompiledTemplate(camelName)
      const tooltip = new Tooltip({
        map: this,
        parent: this,
        middleware: this.middlewares.middlewares.filter((m) => m.name === MiddlewareType.RENDER),
        state: _object.getData(),
        template,
        container: this.containers.map,
        styles: {
          backgroundColor: this.options.colors.tooltip,
          minWidth: this.options.tooltips.minWidth ? this.options.tooltips.minWidth + "px" : "auto",
          maxWidth: this.options.tooltips.maxWidth ? this.options.tooltips.maxWidth + "px" : "auto",
        },
        positionToCursor: this.options.tooltips.position,
      })
      object.tooltip = tooltip
      tooltip.init()
      this.controllers.tooltips[camelName] = tooltip
    }
  }

  /**
   * Mouseout event handler for Regions and Markers
   * @param {object} e - Event object
   * @param {Marker|Region} object
   * @private
   */
  mouseOutHandler(e: JQuery.TriggeredEvent, object: Marker | Region | MarkerCluster): void {
    if (this.eventsPreventList["mouseout"]) {
      return
    }

    if (object.tooltip) {
      object.tooltip.destroy()
      object.tooltip = null
    }

    if (object.isRegion()) {
      object.unhighlight()
      this.events.trigger("mouseout.region", e, { region: object })
    } else {
      this.unhighlightMarker()
      this.events.trigger("mouseout.marker", e, { marker: object })
    }

    let ids: any[]
    if ((hasRuntimeFeature("directory") && this.options.menu.on) && this.controllers.directory) {
      if (this.componentSource("directory") == "database") {
        if (object.isMarker()) {
          const marker = <Marker>object
          ids = marker.object ? [marker.object.getData().id] : []
        }
      }
      this.controllers.directory?.unhighlightItems()
    }
  }

  /**
   * Prevents provided event from being fired
   * @param {string} event - Event name
   * @private
   */
  eventsPrevent(event: string): void {
    this.eventsPreventList[event] = true
  }

  /**
   * Restores event disabled by .eventsPrevent()
   * @param {string} event - Event name
   * @private
   */
  eventsRestore(event: string): void {
    if (event) {
      this.eventsPreventList[event] = false
    } else {
      this.eventsPreventList = {}
    }
  }

  /**
   * Connect object to regions
   * @param {Model} object - Object to connect
   */
  linkObjectToRegions(object: Model): void {
    if (this.regions.length === 0) {
      return
    }
    const regionsInObject = object.getRegionsForTable(this.regionsRepository.schema?.name)
    const regionIds = regionsInObject.map((region) => region.id)

    if (regionIds.length > 0) {
      this.regions
        .filter((region) => regionIds.includes(region.id))
        .forEach((region) => {
          if (!region.objects.get(object.getData().id)) {
            region.objects.push(object)
          }
        })
    }
  }

  addObject(object: Model): void {
    this.addLocation(object)
  }

  objectsLoadedToMapHandler(): void {
    if (this.options.markerDataRules) this.reloadMarkerImages()
    this.mayBeFitMarkers()

    this.loadDirectory()
    if (this.options.labelsMarkers.on) {
      this.setLabelsMarkers()
    }
    // Check if there's a call to "{{objects}}" inside of the labelRegion template
    // and if it's found then reload Region Labels
    if (getTemplateHtml(this.options.templates.labelRegion, "labelRegion").indexOf("{{objects") !== -1) {
      this.setLabelsRegions()
    }
    if (
      this.options.filters.on &&
      this.componentSource("filters") === "database" &&
      this.controllers.filters &&
      this.controllers.filters.hideFilters
    ) {
      this.controllers.filters.setFiltersCounter()
    }
    this.hideLoadingMessage()

    this.updateFiltersState()
    if (this.options.choropleth?.on) {
      this.setChoropleth()
    }

    this.applyRegionsDynamicStatus()

    this.events.trigger("afterLoadObjects", {
      objects: this.objectsRepository.getLoaded(),
    })
  }

  /**
   * Front-only: apply the dynamic-status rules (statusSync / noObjects / filtered) to all regions,
   * honoring the priority order in options.regionsDynamicStatusOrder (top of list wins on conflict).
   * Does not write to the database.
   */
  applyRegionsDynamicStatus(): void {
    if (this.options.regionDataRules) { this.reloadAllRegionStyles(); return }
    if (this.inBackend) {
      return
    }
    const order =
      this.options.regionsDynamicStatusOrder && this.options.regionsDynamicStatusOrder.length
        ? this.options.regionsDynamicStatusOrder
        : ["statusSync", "noObjects", "filtered"]

    this.regions.forEach((region) => {
      for (const rule of order) {
        const status = this.getDynamicStatusForRegion(region, rule)
        if (status !== undefined && status !== null && status !== "") {
          region.setStatus(status)
          break
        }
      }
    })
  }

  /**
   * Returns the status a single dynamic-status rule would assign to a region, or undefined if the
   * rule does not apply. Empty string means "leave unchanged".
   */
  private getDynamicStatusForRegion(
    region: Region,
    rule: string,
  ): string | number | undefined {
    switch (rule) {
      case "filtered":
        return this.getFilteredDynamicStatus(region)
      case "noObjects":
        return this.getNoObjectsDynamicStatus(region)
      case "statusSync":
        return this.getStatusSyncStatus(region)
      default:
        return undefined
    }
  }

  /**
   * Status for a region that is filtered out (not present in the loaded regions set).
   */
  private getFilteredDynamicStatus(region: Region): string | number | undefined {
    if (this.regionsRepository.getLoaded().findById(region.id)) {
      return undefined
    }
    const filteredStatus = this.options.regionsDynamicStatus?.filtered
    if (filteredStatus || filteredStatus === 0) {
      return filteredStatus
    }
    if (
      this.componentSource("directory") === "regions" &&
      this.options.menu.filterout &&
      this.options.menu.filterout.field === "status" &&
      (this.options.menu.filterout.val || this.options.menu.filterout.val === 0)
    ) {
      return this.options.menu.filterout.val
    }
    return undefined
  }

  /**
   * Status for a region that has no linked objects.
   */
  private getNoObjectsDynamicStatus(region: Region): string | number | undefined {
    const noObjects = this.options.regionsDynamicStatus?.noObjects
    if (typeof noObjects === "undefined") {
      return undefined
    }
    return region.objects && region.objects.length === 0 ? noObjects : undefined
  }

  /**
   * Status derived from a field via options.statusSyncField / statusSyncMap.
   * Source: connected objects (default) or the region row itself (statusSyncSource=regions).
   */
  private getStatusSyncStatus(region: Region): string | number | undefined {
    if (!this.options.statusSyncOn) {
      return undefined
    }
    const field = this.options.statusSyncField
    const map = this.options.statusSyncMap
    if (!field || !map || !map.length) {
      return undefined
    }

    const source = this.options.statusSyncSource || "objects"
    const candidates: string[] = []
    const seen: { [key: string]: boolean } = {}

    if (source === "regions") {
      const model = (region as any).getModel ? (region as any).getModel() : (region as any).data
      this.collectMatchCandidates(this.resolveObjectFieldValue(model || region, field)).forEach(
        (c) => {
          if (!seen[c]) {
            seen[c] = true
            candidates.push(c)
          }
        },
      )
    } else {
      if (!region.objects || region.objects.length === 0) {
        return undefined
      }
      region.objects.forEach((object) => {
        this.collectMatchCandidates(this.resolveObjectFieldValue(object, field)).forEach((c) => {
          if (!seen[c]) {
            seen[c] = true
            candidates.push(c)
          }
        })
      })
    }

    if (!candidates.length) {
      return undefined
    }

    const MULTIPLE = "__multiple__"
    const strategy = this.options.statusSyncMultiStrategy || "priority"
    if (strategy === "special" && candidates.length > 1) {
      const special = map.find((m) => String(m.value) === MULTIPLE)
      if (special && special.status !== "" && special.status != null) {
        return special.status
      }
      return undefined
    }

    for (let i = 0; i < map.length; i++) {
      const entry = map[i]
      if (String(entry.value) === MULTIPLE) {
        continue
      }
      if (entry.status === "" || entry.status == null) {
        continue
      }
      if (candidates.indexOf(String(entry.value)) !== -1) {
        return entry.status
      }
    }
    return undefined
  }

  /**
   * Flattens a resolved field value into candidate strings to match against statusSyncMap.
   * Scalars map to themselves; taxonomy terms (objects) contribute their slug and name; arrays
   * (e.g. multiple terms or meta value lists) contribute all of their candidates.
   */
  private collectMatchCandidates(raw: any): string[] {
    if (raw === null || typeof raw === "undefined" || raw === "") {
      return []
    }
    if (Array.isArray(raw)) {
      const out: string[] = []
      raw.forEach((item) => {
        this.collectMatchCandidates(item).forEach((c) => out.push(c))
      })
      return out
    }
    if (typeof raw === "object") {
      const out: string[] = []
      if (raw.slug != null && raw.slug !== "") {
        out.push(String(raw.slug))
      }
      if (raw.name != null && raw.name !== "") {
        out.push(String(raw.name))
      }
      return out
    }
    return [String(raw)]
  }

  /**
   * Resolves a dotted field path (e.g. "Object.post.meta._stock_status") against an object's data.
   * Strips the leading type-prefix segment (as produced by the field picker). Intermediate arrays
   * are collapsed to their first element so traversal can continue; the final node is returned as
   * is (e.g. a meta value list or an array of taxonomy terms).
   */
  private resolveObjectFieldValue(object: Model | Region | any, field: string): any {
    const data =
      object && typeof (object as any).getData === "function"
        ? (object as any).getData()
        : (object as any)?.data != null
          ? (object as any).data
          : (object as any)
    if (!data || !field) {
      return undefined
    }
    const path = field.split(".").slice(1)
    if (!path.length) {
      return undefined
    }
    let current: any = data
    for (let i = 0; i < path.length; i++) {
      if (current == null) {
        return undefined
      }
      current = current[path[i]]
      if (i < path.length - 1 && Array.isArray(current)) {
        current = current[0]
      }
    }
    return current
  }

  setRepositoryEvents() {
    this.eventsBaseInitialized = true

    this.objectsRepository.events.on(
      RepositoryEvent.BEFORE_LOAD,
      (event: EventWithData<{ silent?: boolean }>) => {
        if (!event?.data?.silent) {
          this.showLoadingMessage()
        }
        if (typeof this.firstDataLoad === "undefined") {
          this.firstDataLoad = true
        } else if (this.firstDataLoad === true) {
          this.firstDataLoad = false
        }
      },
    )
    this.objectsRepository.events.on(RepositoryEvent.FAILED_LOAD, () => {
      this.hideLoadingMessage()
      console.error(
        "[CLIENT-014] Could not load objects. Read more: https://mapsvg.com/docs/errors#CLIENT-014",
      )
    })

    this.objectsRepository.events.on(
      RepositoryEvent.AFTER_LOAD,
      (event: EventWithData<{ repository: Repository; data?: unknown }>) => {
        const { repository } = event.data
        const data = event.data.data
        if (data && typeof data === "object" && "schema" in data && data.schema &&
            this.getComponentBindingRole("filters") === "objects") this.setFilters()
        this.locationField = repository.schema.getFieldByType("location")
        this.fitOnDataLoadDone = false
        this.setGlobalDistanceFilter()
        this.deleteMarkers()
        this.deleteClusters()

        this.regions.forEach((region) => {
          region.objects.clear()
        })

        repository.objects.forEach((object) => {
          if (object.getData().regions && object.getData().regions.length > 0) {
            this.linkObjectToRegions(object)
          }
        })

        repository.objects
          .filter((object) => object.getData().location)
          .forEach((object) => this.addObject(object))

        if (hasRuntimeFeature("clustering") && this.options.clustering.on) {
          this.startClusterizer()
        }
        this.reloadRegionsFull()
        this.refreshRegionDetails()
        this.objectsLoadedToMapHandler()
      },
    )

    this.objectsRepository.schema?.events.on(SchemaEventType.UPDATE, () => {
      this.objectsRepository.find(undefined, { automatic: true })
    })
    this.objectsRepository.events.on(
      RepositoryEvent.AFTER_UPDATE,
      (event: EventWithData<{ object: Model; updatedFields: Record<string, unknown> }>) => {
        const { object, updatedFields } = event.data
        if (updatedFields.regions) {
          this.linkObjectToRegions(object)
        }
        this.objectsLoadedToMapHandler()
      },
    )
    this.objectsRepository.events.on(
      RepositoryEvent.AFTER_CREATE,
      (event: EventWithData<{ object: Model }>) => {
        const { object } = event.data
        this.linkObjectToRegions(object)
        this.objectsLoadedToMapHandler()
      },
    )
    this.objectsRepository.events.on(
      RepositoryEvent.AFTER_DELETE,
      (event: EventWithData<{ id: number }>) => {
        const { id } = event.data
        this.regions.forEach((region) => {
          const objectIndex = region.objects.findIndex((object) => object.getData().id === id)
          if (objectIndex !== -1) {
            region.objects.delete(objectIndex)
          }
        })
        this.objectsLoadedToMapHandler()
      },
    )

    this.regionsRepository.events.on(RepositoryEvent.BEFORE_LOAD, () => {
      this.showLoadingMessage()
    })
    this.regionsRepository.events.on(RepositoryEvent.FAILED_LOAD, () => {
      this.hideLoadingMessage()
      console.error(
        "[CLIENT-015] Could not load regions. Read more: https://mapsvg.com/docs/errors#CLIENT-015",
      )
    })
    this.regionsRepository.events.on(RepositoryEvent.AFTER_LOAD, (event) => {
      const data = event.data?.data
      if (data && typeof data === "object" && "schema" in data && data.schema &&
          this.getComponentBindingRole("filters") === "regions") this.setFilters()
      this.hideLoadingMessage()
      this.reloadRegionsFull()
      this.events.trigger("afterLoadRegions", { regions: this.regions })
    })
    this.regionsRepository.events.on(RepositoryEvent.AFTER_UPDATE, () => {
      this.reloadRegionsFull()
    })
    this.regionsRepository.events.on(RepositoryEvent.AFTER_CREATE, () => {
      this.reloadRegionsFull()
    })
    this.regionsRepository.events.on(RepositoryEvent.AFTER_DELETE, () => {
      this.reloadRegionsFull()
    })
  }

  /**
   * Firefox swallows Arrow/Page keys while the pointer is over an SVG region.
   * Forward those keys to the page unless the map is actively consuming them
   * (for example while the user is panning).
   * @private
   */
  setFirefoxPageScrollHandlers(): void {
    $(this.eventDocument).off("keydown" + this.firefoxScrollNamespace)
    if (this.containers?.map) {
      $(this.containers.map).off(this.firefoxScrollNamespace)
    }

    if (!utils.env.getBrowser().firefox || !this.containers?.map) {
      return
    }

    this.pointerOverMap = false
    $(this.containers.map)
      .on("mouseenter" + this.firefoxScrollNamespace, () => {
        this.pointerOverMap = true
      })
      .on("mouseleave" + this.firefoxScrollNamespace, () => {
        this.pointerOverMap = false
      })

    $(this.eventDocument).on("keydown" + this.firefoxScrollNamespace, (e: JQuery.KeyDownEvent) => {
      this.handleFirefoxPageScrollKey(e)
    })
  }

  /**
   * Restores page scrolling for Arrow/Page keys while hovering the map in Firefox.
   * @private
   */
  handleFirefoxPageScrollKey(e: JQuery.KeyDownEvent): void {
    // Document events are retargeted to the React shadow host. Inputs, menus
    // and color-picker sliders must keep their own Arrow/Page key behavior.
    if (isKeyboardControlTarget(e, this.eventDocument)) return
    const forwarded = forwardFirefoxPageScrollKey(
      {
        key: e.key,
        keyCode: e.keyCode,
        which: e.which,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        altKey: e.altKey,
        shiftKey: e.shiftKey,
        target: e.target,
        defaultPrevented: e.isDefaultPrevented() || !!e.originalEvent?.defaultPrevented,
      },
      {
        isFirefox: true,
        pointerOverMap: this.pointerOverMap,
        mapConsumesKey: this.mapConsumesPageScrollKey(),
        firefoxScroll: this.firefoxScroll,
        win: this.eventWindow,
      },
    )

    if (forwarded) {
      e.preventDefault()
    }
  }

  /**
   * Arrow/Page keys are not used for map navigation. They are only blocked
   * while the map is being panned so a drag is not interrupted.
   * @private
   */
  mapConsumesPageScrollKey(): boolean {
    return this.isScrolling
  }

  /**
   * Sets all event handlers
   * @private
   */
  setEventHandlers() {
    const _this = this

    $(_this.containers.map).off(".common.mapsvg")
    $(_this.containers.scrollpane).off(".common.mapsvg")
    $(_this.eventDocument).off(".scroll.mapsvg")
    $(_this.eventDocument).off(".scrollInit.mapsvg")
    this.setFirefoxPageScrollHandlers()
    this.clusteringModule()?.bindEvents.call(this)

    if (_this.editMarkers.on) {
      $(_this.containers.map).on(
        "touchstart.common.mapsvg mousedown.common.mapsvg",
        ".mapsvg-marker",
        (e) => {
          e.originalEvent.preventDefault()
          const marker = this.getMarkerFromElement(e.currentTarget)
          const startCoords = getMouseCoords(e)
          marker.drag(startCoords, _this.scale)

          /*
                marker.drag(startCoords, _this.scale, function() {
                    if (_this.mapIsGeo){
                        var svgPoint = new SVGPoint(this.x + this.width / 2, this.y + (this.height-1));
                        this.geoCoords = _this.converter.convertSVGToGeo(svgPoint);
                    }
                    //_this.markerEditHandler && _this.markerEditHandler.call(this,true);
                },function(){
                    //_this.markerEditHandler && _this.markerEditHandler.call(this);
                });

                 */
        },
      )
    }

    // REGIONS
    if (!_this.editMarkers.on) {
      $(_this.containers.map)
        .on("mouseover.common.mapsvg", ".mapsvg-region", function (e) {
          const id = $(this).attr("id")
          _this.mouseOverHandler.call(_this, e, _this.getRegion(id))
        })
        .on("mouseleave.common.mapsvg", ".mapsvg-region", function (e) {
          const id = $(this).attr("id")
          _this.mouseOutHandler.call(_this, e, _this.getRegion(id))
        })
    }
    if (!this.editRegions.on) {
      $(this.containers.map)
        .on("mouseover.common.mapsvg", ".mapsvg-marker", (e) => {
          this.mouseOverHandler.call(this, e, this.getMarkerFromElement(e.currentTarget))
        })
        .on("mouseleave.common.mapsvg", ".mapsvg-marker", (e) => {
          this.mouseOutHandler.call(this, e, this.getMarkerFromElement(e.currentTarget))
        })
    }

    if (_this.options.scroll.spacebar) {
      const doc = _this.eventDocument
      $(doc).on("keydown.scroll.mapsvg", function (e) {
        if (
          !isKeyboardControlTarget(e, doc) &&
          !_this.isScrolling &&
          e.keyCode == 32
        ) {
          e.preventDefault()
          $(_this.containers.map).addClass("mapsvg-scrollable")
          $(doc)
            .on("mousemove.scrollInit.mapsvg", function (e: JQuery.TouchEventBase) {
              _this.isScrolling = true
              $(doc).off("mousemove.scrollInit.mapsvg")
              _this.scrollStart(e, _this)
            })
            .on("keyup.scroll.mapsvg", function (e: JQuery.TouchEventBase) {
              if (e.keyCode == 32) {
                $(doc).off("mousemove.scrollInit.mapsvg")
                $(_this.containers.map).removeClass("mapsvg-scrollable")
              }
            })
        }
      })
    } else if (!_this.options.scroll.on) {
      if (!_this.editMarkers.on) {
        $(_this.containers.map).on("touchstart.common.mapsvg", ".mapsvg-region", function (e) {
          _this.scroll.touchScrollStart = $(_this.eventWindow).scrollTop()
        })
        $(_this.containers.map).on("touchstart.common.mapsvg", ".mapsvg-marker", function (e) {
          _this.scroll.touchScrollStart = $(_this.eventWindow).scrollTop()
        })

        $(_this.containers.map).on(
          "touchstart.common.mapsvg mousedown.common.mapsvg",
          "svg a",
          function (e: JQuery.TouchEventBase) {
            if (_this.isLinkClicked(e)) {
              //_this.handleLinkClick(e)
              return true // Exit the handler after processing the link
            }
            return true
          },
        )

        $(_this.containers.map).on(
          "touchend.common.mapsvg mouseup.common.mapsvg",
          ".mapsvg-region",
          function (e) {
            if (e.cancelable) {
              e.preventDefault()
            }
            if (
              !_this.scroll.touchScrollStart ||
              _this.scroll.touchScrollStart === $(_this.eventWindow).scrollTop()
            ) {
              _this.regionClickHandler(e, _this.getRegion($(this).attr("id")))
            }
          },
        )
        $(this.containers.map).on(
          "touchend.common.mapsvg mouseup.common.mapsvg",
          ".mapsvg-marker",
          (e) => {
            if (e.cancelable) {
              e.preventDefault()
            }
            if (
              !this.scroll.touchScrollStart ||
              this.scroll.touchScrollStart === $(this.eventWindow).scrollTop()
            ) {
              this.markerClickHandler.call(this, e, this.getMarkerFromElement(e.currentTarget))
            }
          },
        )

        // }
      } else {
        if (_this.clickAddsMarker)
          $(_this.containers.map).on("touchend.common.mapsvg mouseup.common.mapsvg", function (e) {
            // e.stopImmediatePropagation();
            if (e.cancelable) {
              e.preventDefault()
            }
            _this.markerAddClickHandler(e)
          })
      }
    } else {
      $(_this.containers.map).on(
        "click.common.mapsvg touchstart.common.mapsvg",
        "svg a",
        function (e) {
          e.preventDefault()
        },
      )
      $(_this.containers.map).on(
        "touchstart.common.mapsvg mousedown.common.mapsvg",
        function (e: JQuery.TouchEventBase) {
          if (
            $(e.target).hasClass("mapsvg-popover") ||
            $(e.target).closest(".mapsvg-popover").length ||
            $(e.target).hasClass("mapsvg-details-container") ||
            $(e.target).closest(".mapsvg-details-container").length ||
            $(e.target).closest(".mapsvg-popover-container").length ||
            $(e.target).closest(".mapsvg-controller-view").length
          ) {
            // Prevent even dobule firing touchstart+mousedown on clicking popover close button
            if ($(e.target).hasClass("mapsvg-popover-close")) {
              if (e.type == "touchstart") {
                if (e.cancelable) {
                  e.preventDefault()
                }
              }
            }
            return
          }

          if (e.type == "touchstart") {
            if (e.cancelable) {
              e.preventDefault()
            }
          }

          let obj: any

          if (
            e.target &&
            $(e.target).attr("class") &&
            $(e.target).attr("class").indexOf("mapsvg-region") != -1
          ) {
            obj = _this.getRegion($(e.target).attr("id"))
            _this.setObjectClickedBeforeScroll(obj)
          } else if (
            e.target &&
            $(e.target).attr("class") &&
            $(e.target).hasClass("mapsvg-marker")
          ) {
            if (_this.editMarkers.on) {
              return
            }
            obj = _this.getMarkerFromElement(e.target)
            _this.setObjectClickedBeforeScroll(obj)
          } else if (
            e.target && (obj = _this.clusteringModule()?.hit(e.target))
          ) {
            if (_this.editMarkers.on) {
              return
            }
            _this.setObjectClickedBeforeScroll(obj)
          }
          if (e.type == "mousedown") {
            _this.scrollStart(e, _this)
          } else {
            _this.touchStart(e, _this)
          }
        },
      )
    }

    //TODO Vyacheslav - переделать под новый choropleth
    /*
        $(_this.containers.map).on('mouseover.common.mapsvg', '.mapsvg-choropleth-gradient-wrap', function(e){
            let currentSegment = _this.options.choropleth.segments[$(e.target).parents('.mapsvg-choropleth-gradient-wrap').data('idx')];

            if (currentSegment.description){
                _this.showTooltip(currentSegment.description);
            }
        });
        */

    $(_this.containers.map).on(
      "mouseleave.common.mapsvg",
      ".mapsvg-choropleth-gradient-wrap",
      (e) => {
        this.controllers.tooltips.region.close()
      },
    )
  }

  /**
   * Lazy-loads the WooCommerce cart module (only when WooCommerce is active)
   * and binds add-to-cart handlers to forms in the rendered container.
   *
   * The chunk is only downloaded when the server sets `options.woocommerce`.
   */
  bindWooCart(container?: HTMLElement | null): void {
    if (!this.options.woocommerce || !container) {
      return
    }
    this.initWooCart().then(() => this.wooCart && this.wooCart.bindForms(container))
  }

  /**
   * Inlines theme SVG sprite icons inside Woo add-to-cart markup
   * (Shadow DOM cannot resolve light-DOM `#id` references via `<use>`).
   */
  inlineWooSvgUses(container?: HTMLElement | null): void {
    if (!this.options.woocommerce || !container) {
      return
    }
    inlineSvgUses(container, (this as any).eventDocument || document)
  }

  /**
   * True when any map template source mentions add_to_cart_html
   * (controllers often receive a compiled Handlebars fn, not the HTML string).
   */
  templatesUseAddToCartHtml(): boolean {
    const templates = this.options.templates
    if (!templates) {
      return false
    }
    for (const name of Object.keys(templates)) {
      if (getTemplateHtml(templates[name], name).includes("add_to_cart_html")) {
        return true
      }
    }
    return false
  }

  private initWooCart(): Promise<void> {
    if (this.wooCart) {
      return Promise.resolve()
    }
    if (!this.wooCartLoading) {
      this.wooCartLoading = import("../WooCommerce/WooCart").then(({ default: WooCartController }) => {
        this.wooCart = new WooCartController({ mapsvg: this })
        this.wooCart.init()
      })
    }
    return this.wooCartLoading
  }

  setLabelsRegions(options?: any): void {
    options = options || this.options.labelsRegions
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))
    deepMerge(this.options, { labelsRegions: options })

    if (this.options.labelsRegions.on) {
      this.regions.forEach((region) => {
        if (!region.label) {
          region.label = document.createElement("div")
          region.label.className = "mapsvg-region-label"
          region.label.setAttribute("data-region-id", region.id)
          $(this.layers.labels).append(region.label)
        }
        try {
          $(region.label).html(this.templates.labelRegion(region.forTemplate()))
        } catch (err) {
          console.error(
            '[CLIENT-016] MapSVG: Error in the "Region Label" template. Read more: https://mapsvg.com/docs/errors#CLIENT-016',
          )
        }
      })
      this.labelsRegionsAdjustScreenPosition()
    } else {
      this.regions.forEach((region) => {
        if (region.label) {
          $(region.label).remove()
          region.label = null
          delete region.label
        }
      })
    }
  }

  /**
   * Sets Marker labels
   * @param {object} options
   */
  setLabelsMarkers(options?: any): void {
    options = options || this.options.labelsMarkers
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))
    deepMerge(this.options, { labelsMarkers: options })

    if (this.options.labelsMarkers.on) {
      this.markers.forEach((marker: Marker) => {
        try {
          marker.setLabel(this.templates.labelMarker(marker.object.getData()))
        } catch (err) {
          console.error(
            '[CLIENT-017] MapSVG: Error in the "Marker Label" template. Read more: https://mapsvg.com/docs/errors#CLIENT-017',
          )
        }
      })
    } else {
      this.markers.forEach((marker: Marker) => {
        marker.setLabel("")
      })
    }
  }

  /**
   * Adds a layer to the map that may contain some objects.
   * @private
   */
  addLayer(name: string): HTMLElement {
    this.layers[name] = $('<div class="mapsvg-layer mapsvg-layer-' + name + '"></div>')[0]
    this.containers.layers.appendChild(this.layers[name])
    return this.layers[name]
  }

  /**
   * Returns layer by provided name
   * @param name
   */
  getLayer(name: string): HTMLElement {
    return this.layers[name]
  }

  /**
   * Returns Database
   * @example
   * var objects = mapsvg.getDb().getLoaded();
   * var object  = mapsvg.getDb().getLoadedObject(12);
   *
   * // Filter DB by region "US-TX". This automatically triggers markers and directory reloading
   * mapsvg.getDatabase().getAll({filters: {regions: "US-TX"}});
   */
  getDb(): Repository {
    return this.objectsRepository
  }

  /**
   * Returns Regions database
   */
  getDbRegions(): Repository {
    return this.regionsRepository
  }

  /**
   * Adds an SVG object as Region to MapSVG
   * @param {object} svgObject - SVG Object
   * @returns {Region}
   * @private
   */
  regionAdd(
    svgObject:
      | SVGElement
      | SVGPathElement
      | SVGCircleElement
      | SVGEllipseElement
      | SVGRectElement
      | SVGPolygonElement
      | SVGPolylineElement,
  ) {
    const region = new Region({
      element: svgObject,
      mapsvg: this,
      options: this.options.regions[svgObject.id],
      statusOptions: this.options.regionStatuses,
    })
    this.reloadRegionStyles(region)
    region.events.on(
      MapObjectEvent.UPDATE,
      (event: EventWithData<{ region: Region; data: Partial<Region> }>) => {
        const { region, data } = event.data
        const paramsToCheck = ["choroplethValue"]
        if (paramsToCheck.some((param) => param in data)) {
          this.reloadRegionStyles(region)
        }
      },
    )
    this.regions.push(region)
    this.regions.sort(function (a, b) {
      return a.id == b.id ? 0 : +(a.id > b.id) || -1
    })
    return region
  }

  /**
   * Deletes a Region from the map
   * @param {string} id - Region ID
   * @private
   */
  regionDelete(id: string): void {
    if (this.regions.findById(id)) {
      this.regions.findById(id).elem.remove()
      this.regions.delete(id)
    } else if ($("#" + id).length) {
      $("#" + id).remove()
    }
  }
  /**
   * Reloads Regions from SVG file
   */
  reloadRegions(): void {
    // this.regions.forEach(function (r: Region) {
    //     $(r.element).css({ "stroke-width": r.style["stroke-width"] });
    // });
    this.regions.clear()
    $(this.containers.svg).find(".mapsvg-region").removeClass("mapsvg-region")
    $(this.containers.svg).find(".mapsvg-region-disabled").removeClass("mapsvg-region-disabled")
    $(this.containers.svg)
      .find("path, polygon, circle, ellipse, rect")
      .each((index: number, element: HTMLElement) => {
        // @ts-ignore
        const elem = <SVGElement>element
        if ($(elem).closest("defs").length) return
        if (elem.getAttribute("data-stroke-width")) {
          elem.style["stroke-width"] = elem.getAttribute("data-stroke-width")
        }
        if (isSvgRegionElement(elem, this.options.regionPrefix || "")) this.regionAdd(elem)
      })
  }
  /**
   * Reloads Regions data
   */
  reloadRegionsFull(): void {
    this.reloadAllRegionStyles()

    const statuses = this.regionsRepository.getSchema().getFieldByType("status")

    this.regions.forEach((region) => {
      const _region = this.regionsRepository.getLoaded().findById(region.id)

      if (_region) {
        const data = _region?.getData()
        region.setData(_region)
        if (statuses && typeof data.status !== "undefined" && data.status !== null) {
          region.setStatus(data.status)
        }
      } else if (!this.options.regionDataRules) {
        const status = this.getFilteredDynamicStatus(region)
        if (status !== undefined && status !== null && status !== "") {
          region.setStatus(status)
        }
      }
    })

    this.loadDirectory()
    this.setChoropleth()
    this.setLayersControl()
    this.setGroups()
    if (this.options.labelsRegions.on) {
      this.setLabelsRegions()
    }
    if (
      this.options.filters.on &&
      this.componentSource("filters") === "regions" &&
      this.controllers.filters &&
      this.controllers.filters.hideFilters
    ) {
      this.controllers.filters.setFiltersCounter()
    }
    this.updateFiltersState()
    if (this.options.regionDataRules) this.reloadAllRegionStyles()
  }

  /**
   * Updates map options from old version of MapSVG
   * @param options
   * @private
   */
  async updateOutdatedOptions({
    version,
    options,
  }: {
    version: string
    options: MapOptions & Record<string, any>
  }): Promise<{ version: string; options: MapOptions & Record<string, any> }> {
    if (this.version && compareVersions(this.version, mapsvgCore.version) < 0) {
      const migrationClient = await import("@/Core/Migrations/migrate")

      const { options: modifiedOptions, success } = migrationClient.migrate(this.version, options)
      if (success) {
        return {
          version: mapsvgCore.version,
          options: modifiedOptions,
        }
      } else {
        throw Error("Could not update options")
      }
    } else {
      return {
        version,
        options,
      }
    }
  }

  getContainer(name: string): HTMLElement {
    return this.getLocationContainer(name) || this.containers[name]
  }

  private renderSvgData(xmlData) {
    // Default width/height/viewBox from SVG

    // Clean memory
    const svgTag = $(xmlData).find("svg")

    this.containers.svg = svgTag[0]

    if (svgTag.attr("width") && svgTag.attr("height")) {
      this.svgDefault.width = parseFloat(svgTag.attr("width").replace(/px/g, ""))
      this.svgDefault.height = parseFloat(svgTag.attr("height").replace(/px/g, ""))
      this.svgDefault.viewBox = svgTag.attr("viewBox")
        ? new ViewBox(svgTag.attr("viewBox").split(" "))
        : new ViewBox(0, 0, this.svgDefault.width, this.svgDefault.height)
    } else if (svgTag.attr("viewBox")) {
      this.svgDefault.viewBox = new ViewBox(svgTag.attr("viewBox").split(" "))
      this.svgDefault.width = this.svgDefault.viewBox.width
      this.svgDefault.height = this.svgDefault.viewBox.height
    } else {
      const msg =
        "MapSVG couldn't load SVG file. Please check if the file exists: " +
        this.options.source +
        ". If the file exists, please contact support (this message is showing up only in wp-admin area)."
      if (this.inBackend) {
        $.growl.error({ message: msg, duration: 60000 })
      } else {
        console.error(
          "[CLIENT-001] MapSVG couldn't load SVG file — Read more: https://mapsvg.com/docs/errors#CLIENT-001",
        )
      }
      return false
    }

    this.viewBox.update(this.svgDefault.viewBox)

    this.geoViewBox = this.getGeoViewBoxFromSvgTag(this.containers.svg)
    if (this.geoViewBox) {
      this.mapIsGeo = true
      this.geoCoordinates = true
    }

    svgTag.attr("preserveAspectRatio", "xMidYMid meet")
    svgTag.removeAttr("width")
    svgTag.removeAttr("height")
    $(this.containers.scrollpane).append(svgTag)

    // this.containers.svg.style.width = "auto"

    $(this.containers.svg)
      .find("path, polygon, circle, ellipse, rect, line, polyline")
      .each((index, elem) => {
        const width = MapObject.getComputedStyle("stroke-width", elem)
        if (width) {
          $(elem).attr("data-stroke-width", width.replace("px", ""))
        }
      })
  }

  private setFilterOut() { return this.directoryModule()?.setFilterOut.call(this, this.directoryServices()) }

  private getGeoViewBoxFromSvgTag(svgTag: SVGSVGElement): GeoViewBox | null {
    const geo = $(svgTag).attr("mapsvg:geoViewBox") || $(svgTag).attr("mapsvg:geoviewbox")
    if (geo) {
      const geoParts = geo.split(" ").map((p) => parseFloat(p))
      if (geoParts.length == 4) {
        this.mapIsGeo = true
        this.geoCoordinates = true

        const sw = new GeoPoint(geoParts[3], geoParts[0])
        const ne = new GeoPoint(geoParts[1], geoParts[2])
        return new GeoViewBox(sw, ne)
      }
    } else {
      return null
    }
  }

  private svgLoadingFailed(resp: JQueryXHR) {
    if (resp.status == 404) {
      let msg =
        "MapSVG: file not found - " +
        this.options.source +
        "\n\nIf you moved MapSVG from another server please read the following docs page: https://mapsvg.com/docs/installation/moving"
      if (this.inBackend) {
        msg += "\n\nIf you know the correct path for the SVG file, please write it and press OK:"
        const oldSvgPath = this.options.source
        const userSvgPath = prompt(msg, oldSvgPath)
        if (userSvgPath !== null) {
          $.ajax({ url: userSvgPath + "?v=" + this.svgFileLastChanged })
            .fail(function () {
              location.reload()
            })
            .done((xmlData) => {
              this.options.source = userSvgPath
              this.renderSvgData(xmlData)
              const mapsRepo = useRepository("maps", this)
              mapsRepo.update(this)
            })
        } else {
          location.reload()
        }
      } else {
        console.error(
          "[CLIENT-018] " + msg + " — Read more: https://mapsvg.com/docs/errors#CLIENT-018",
        )
      }
    } else {
      const msg = "MapSVG: can't load SVG file for unknown reason. Please contact support."
      if (this.inBackend) {
        alert(msg)
      } else {
        console.error(
          "[CLIENT-019] " + msg + " — Read more: https://mapsvg.com/docs/errors#CLIENT-019",
        )
      }
    }
  }

  /**
   * Renders loading text safely.
   * Plain text uses textContent; limited HTML (from unfiltered_html + wp_kses_post) is
   * inserted after stripping scripts, embeds, and event-handler attributes.
   */
  private applyLoadingText(el: HTMLElement, message: string): void {
    const text = message || ""
    if (!/<[a-z]/i.test(text)) {
      el.textContent = text
      return
    }
    el.textContent = ""
    const template = document.createElement("template")
    template.innerHTML = text
    template.content
      .querySelectorAll("script, iframe, object, embed, link, meta")
      .forEach((node) => node.remove())
    template.content.querySelectorAll("*").forEach((node) => {
      for (const attr of Array.from(node.attributes)) {
        const name = attr.name.toLowerCase()
        const value = attr.value.trim().toLowerCase()
        if (name.startsWith("on") || value.startsWith("javascript:")) {
          node.removeAttribute(attr.name)
        }
      }
    })
    el.appendChild(template.content)
  }

  private addLoadingMessage(): void {
    if (!this.containers) {
      this.containers = {}
    }
    const existing = this.container.querySelector(".mapsvg-loading") as HTMLElement | null
    if (existing) {
      this.containers.loading = existing
      const textEl = existing.querySelector(".mapsvg-loading-text") as HTMLElement | null
      if (textEl) {
        this.applyLoadingText(textEl, this.options.loadingText)
      }
      return
    }

    this.containers.loading = document.createElement("div")
    this.containers.loading.className = "mapsvg-loading"

    const loadingTextBlock = document.createElement("div")
    loadingTextBlock.className = "mapsvg-loading-text"
    this.applyLoadingText(loadingTextBlock, this.options.loadingText)

    const spinner = document.createElement("div")
    spinner.className = "spinner-border spinner-border-sm"

    this.containers.loading.appendChild(spinner)
    this.containers.loading.appendChild(loadingTextBlock)

    this.container.appendChild(this.containers.loading)
  }
  private hideLoadingMessage() {
    $(this.containers.loading).hide()
  }
  private showLoadingMessage() {
    $(this.containers.loading).show()
  }

  private disableAnimation() {
    this.containers.map.classList.add("no-transitions")
  }
  private enableAnimation() {
    this.containers.map.classList.remove("no-transitions")
  }

  private loadExtensions() {
    // Load extension (common things)
    // @ts-ignore
    if (
      this.options.extension &&
      // @ts-ignore
      $().mapSvg.extensions &&
      // @ts-ignore
      $().mapSvg.extensions[_this.options.extension]
    ) {
      // @ts-ignore
      const ext = $().mapSvg.extensions[_this.options.extension]
      ext && ext.common(this)
    }
  }

  /**
   * @ignore
   */
  decrementAfterloadBlockers(): void {
    if (this.afterLoadBlockers > 0) {
      this.afterLoadBlockers--
      if (this.afterLoadBlockers === 0) {
        this.finalizeMapLoading()
      }
    }
  }
  /**
   * Final stage of initialization.
   * Initialization is split into 2 steps because the 1st step contains async ajax request.
   * When the ajax requires is done, the final initialization step is called.
   * @private
   */
  finalizeMapLoading(): void {
    if (this.afterLoadBlockers > 0 || this.loaded) {
      return
    }

    if (!this.inBackend && this.options.actions?.map?.afterLoad?.loadPost) {
      const slug = new URL(window.location.href).pathname.replace(/\/$/, "").split("/").pop()
      const hasPost = (repository) => repository?.getSchema?.()?.getFields?.().some(field => field.type === "post") ?? false
      const repoName = linkedPostRepository(this.options.actions.map.afterLoad.loadPost,
        hasPost(this.objectsRepository), hasPost(this.regionsRepository))
      if (repoName && slug) this[repoName]?.find({ filters: { post: { name: slug } } })
    }

    this.selectObjectsByIdFromUrl()

    this.redraw()

    setTimeout(() => {
      // this.movingItemsAdjustScreenPosition()
      // this.adjustStrokes()
      if (!isTreeLayoutMode(this.options) && isPhone() && (hasRuntimeFeature("directory") && this.options.menu.on) && this.options.menu.hideOnMobile) {
        switch (this.options.menu.showFirst) {
          case "map":
            this.controllers.toolbar?.show("map")
            break
          case "directory":
            this.controllers.toolbar?.show("menu")
            break
          default:
            break
        }
      }
      setTimeout(() => {
        this.hideLoadingMessage()
        $(this.containers.loading).find(".mapsvg-loading-text").hide()
        // this.enableAnimation()
      }, 400)
    }, 100)

    this.loaded = true
    this.startDatabaseAutoRefetch()
    this.startRegionsAutoRefetch()
    this.events.trigger(MapEventType.AFTER_INIT, { mapsvg: this })
  }

  private selectObjectsByIdFromUrl() {
    const match = RegExp("[?&]mapsvg_select=([^&]*)").exec(window.location.search)
    if (match) {
      const select = decodeURIComponent(match[1].replace(/\+/g, " "))
      this.selectRegion(select)
    }

    if (window.location.hash && window.location.hash.indexOf("#/m/") !== -1) {
      let query = window.location.hash.replace("#/m/", "")
      let regionId: string | undefined

      if (
        this.options.actions.map.afterLoad.selectRegion &&
        (query.indexOf("r/") === 0 || (query.indexOf("r/") === -1 && query.indexOf("db/") === -1))
      ) {
        // Handle Region ID in URL
        if (query.indexOf("r/") === 0) {
          query = query.replace("r/", "")
        }
        const region = this.getRegion(query)
        if (region) {
          this.regionClickHandler(null, region)
        }
      } else if (this.options.actions.map.afterLoad.selectMarker && query.indexOf("db/") === 0) {
        // Handle Object ID in URL
        query = query.replace("db/", "")
        const selectMarker = (object) => {
          const marker = this.markers.get(`marker_${object.getData().id}`)
          if (marker) {
            this.markerClickHandler.call(this, null, marker)
          }
        }
        const objectLoaded = this.objectsRepository
          .getLoaded()
          .find((object) => object.getData().id === query)
        if (objectLoaded) {
          selectMarker(objectLoaded)
        } else {
          this.objectsRepository.findById(query, false).done((object) => {
            this.addObject(object)
            this.objectsLoadedToMapHandler()
            selectMarker(object)
          })
        }
      }
    }
  }

  getConverter(): Converter {
    return this.converter
  }

  /**
   * Old choropleth methods
   */

  /**
   * Sets choropleth map options
   * @param {object} options
   *
   * @example
   * mapsvg.setGauge({
   *   on: true,
   *   colors: {
   *     high: "#FF0000",
   *     low: "#00FF00"
   *   }
   *   labels: {
   *     high: "high",
   *     low: "low"
   *   }
   * });
   */
  setChoropleth(options?: any) {
    const _this = this

    options = options || _this.options.choropleth
    options.on != undefined && (options.on = utils.numbers.parseBoolean(options.on))
    deepMerge(_this.options, { choropleth: options })

    let needsRedraw = false

    if (!_this.$gauge) {
      _this.$gauge = {}
      _this.$gauge.gradient = $("<td>&nbsp;</td>").addClass("mapsvg-gauge-gradient")
      _this.setGaugeGradientCSS()
      _this.$gauge.container = $("<div />").addClass("mapsvg-gauge").hide()
      _this.$gauge.table = $("<table />")
      const tr = $("<tr />")
      _this.$gauge.labelLow = $(textElement("td", "", _this.options.choropleth.labels.low))
      _this.$gauge.labelHigh = $(textElement("td", "", _this.options.choropleth.labels.high))
      tr.append(_this.$gauge.labelLow)
      tr.append(_this.$gauge.gradient)
      tr.append(_this.$gauge.labelHigh)
      _this.$gauge.table.append(tr)
      _this.$gauge.container.append(_this.$gauge.table)
      _this.$gauge.container.append(_this.$gauge.table)
      $(_this.containers.map).append(_this.$gauge.container)
    }

    if ((!_this.options.choropleth.on || this.options.regionDataRules) && _this.$gauge.container.is(":visible")) {
      _this.$gauge.container.hide()
      needsRedraw = true
    } else if (_this.options.choropleth.on && !this.options.regionDataRules && !_this.$gauge.container.is(":visible")) {
      _this.$gauge.container.show()
      needsRedraw = true
      this.regionsRepository.events.on(RepositoryEvent.AFTER_UPDATE, this.redrawGauge)
      this.regionsRepository.events.on(RepositoryEvent.AFTER_LOAD, this.redrawGauge)
    }

    if (!this.options.choropleth.on) {
      this.regionsRepository.events.off(RepositoryEvent.AFTER_UPDATE, this.redrawGauge)
      this.regionsRepository.events.off(RepositoryEvent.AFTER_LOAD, this.redrawGauge)
    }

    if (options.colors) {
      _this.options.choropleth.colors.lowRGB = tinycolor(
        _this.options.choropleth.colors.low,
      ).toRgb()
      _this.options.choropleth.colors.highRGB = tinycolor(
        _this.options.choropleth.colors.high,
      ).toRgb()
      _this.options.choropleth.colors.diffRGB = {
        r: _this.options.choropleth.colors.highRGB.r - _this.options.choropleth.colors.lowRGB.r,
        g: _this.options.choropleth.colors.highRGB.g - _this.options.choropleth.colors.lowRGB.g,
        b: _this.options.choropleth.colors.highRGB.b - _this.options.choropleth.colors.lowRGB.b,
        a: _this.options.choropleth.colors.highRGB.a - _this.options.choropleth.colors.lowRGB.a,
      }
      needsRedraw = true
      _this.$gauge && _this.setGaugeGradientCSS()
    }

    if (options.labels) {
      _this.$gauge.labelLow[0].textContent = _this.options.choropleth.labels.low
      _this.$gauge.labelHigh[0].textContent = _this.options.choropleth.labels.high
    }

    needsRedraw && _this.redrawGauge()
  }

  /**
   * Redraws choropleth map colors
   * @private
   */
  redrawGauge = () => {
    const _this = this

    _this.updateGaugeMinMax()
    _this.reloadAllRegionStyles()
  }

  /**
   * Updates min/max values of Region choropleth fields
   * @private
   */
  updateGaugeMinMax() {
    const _this = this

    _this.options.choropleth.min = 0
    _this.options.choropleth.max = false
    const values = []
    _this.regions.forEach(function (r) {
      const gauge = r.data && r.data[_this.options.regionChoroplethField]
      gauge != undefined && values.push(gauge)
    })
    if (values.length > 0) {
      _this.options.choropleth.min = values.length == 1 ? 0 : Math.min.apply(null, values)
      _this.options.choropleth.max = Math.max.apply(null, values)
      _this.options.choropleth.maxAdjusted =
        _this.options.choropleth.max - _this.options.choropleth.min
    }
  }
  /**
   * Sets gradient for choropleth map
   * @private
   */
  setGaugeGradientCSS() {
    const _this = this

    _this.$gauge.gradient.css({
      background:
        "linear-gradient(to right," +
        _this.options.choropleth.colors.low +
        " 1%," +
        _this.options.choropleth.colors.high +
        " 100%)",
      filter:
        'progid:DXImageTransform.Microsoft.gradient( startColorstr="' +
        _this.options.choropleth.colors.low +
        '", endColorstr="' +
        _this.options.choropleth.colors.high +
        '",GradientType=1 )',
    })
  }
  setRegionsDynamicStatus(value: { filtered?: string; noObjects?: string }) {
    deepMerge(this.options.regionsDynamicStatus, value)
    this.reapplyRegionsDynamicStatus()
  }

  setRegionsDynamicStatusOrder(order: string[]): void {
    if (Array.isArray(order) && order.length) {
      this.options.regionsDynamicStatusOrder = order
      this.reapplyRegionsDynamicStatus()
    }
  }

  setStatusSyncOn(on: boolean): void {
    this.options.statusSyncOn = !!on
    this.reapplyRegionsDynamicStatus()
  }

  setStatusSyncField(field: string): void {
    this.options.statusSyncField = field || ""
    this.reapplyRegionsDynamicStatus()
  }

  setStatusSyncMultiStrategy(value: string): void {
    this.options.statusSyncMultiStrategy = value === "special" ? "special" : "priority"
    this.reapplyRegionsDynamicStatus()
  }

  setStatusSyncMap(value: Array<{ value: string; status: string }>): void {
    this.options.statusSyncMap = Array.isArray(value) ? value : []
    this.reapplyRegionsDynamicStatus()
  }

  /**
   * Recomputes region base statuses then re-applies the dynamic-status rules (front-end preview).
   */
  private reapplyRegionsDynamicStatus(): void {
    if (this.regionsRepository.getLoaded().length > 0) {
      this.reloadRegionsFull()
      this.objectsLoadedToMapHandler()
    }
  }
  setSvgFileLastChanged(val: number) {
    this.svgFileLastChanged = val
  }

  /**
   * @ignore
   * @deprecated
   */
  get $map() {
    return $(this.getContainer("map"))
  }

  /**
   * @ignore
   * @deprecated
   */
  get $svg() {
    return $(this.getContainer("svg"))
  }

  /**
   * @ignore
   * @deprecated
   */
  get $popover() {
    return $(this.getContainer("popover"))
  }

  /**
   * @ignore
   * @deprecated
   */
  get $details() {
    return $(this.getContainer("detailsView"))
  }

  /**
   * @ignore
   * @deprecated
   */
  get $directory() {
    return $(this.getContainer("directory"))
  }

  /**
   * @ignore
   * @deprecated
   */
  get database() {
    return this.objectsRepository
  }

  /**
   * @ignore
   * @deprecated
   */
  get regionsDatabase() {
    return this.regionsRepository
  }
}

// if (!window.mapsvg.map) {
//   window.mapsvg.map = MapSVGMap
// }
