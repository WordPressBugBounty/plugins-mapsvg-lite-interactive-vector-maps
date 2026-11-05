/**
 * Version 1 JSON authoring contract. This is the strict persisted projection of
 * MapOptions, not its hydrated runtime/legacy class shape. Generate its schema
 * with scripts/map-options-contract.mjs; never hand-edit the generated artifact.
 * Dictionary keys below are intentional (templates, SVG IDs and Page overrides).
 */
import type { TypographyOptions } from "../../Core/typography"
import type { RegionDataRules } from "../../Region/dataRules"
import type { MarkerDataRules } from "../../Marker/dataRules"

/** Optional object branches; complete array items retain their native contracts. */
type Settings<T> = { [K in keyof T]?: T[K] extends readonly unknown[] ? T[K] : T[K] extends object ? Settings<T[K]> : T[K] }
type Length = string | number
type BindingRole = "objects" | "regions"
type Spacing = { top?: number; right?: number; bottom?: number; left?: number }
type Shadow = { on?: boolean; value?: number }
type Scalar = string | number | boolean | null

/** Only closed, JSON-only branches are reused from the existing runtime type. */
export interface MapSettingsBase {
  title?: string; source?: string; regionPrefix?: string; disableAll?: boolean; responsive?: boolean
  loadingText?: string; width?: number; height?: number; viewBox?: number[]; lockAspectRatio?: boolean; cursor?: string
  multiSelect?: boolean; colorsIgnore?: boolean; defaultMarkerImage?: string; fitMarkers?: boolean
  fitMarkersOnStart?: boolean; fitSingleMarkerZoom?: number; regionChoroplethField?: string
  labelsMarkers?: { on: boolean }; labelsRegions?: { on: boolean }; clustering?: { on: boolean; maxZoom: number }
  padding?: { top: number; left: number; right: number; bottom: number }; useShadowRoot?: boolean
}

export interface MapOptionsContract extends MapSettingsBase {
  _mapsvgEngine?: 9
  typography?: Settings<TypographyOptions>
  theme?: { name?: string }
  menu?: DirectorySettings
  filters?: FilterSettings
  filtersSchema?: FilterField[]
  templates?: Record<string, TemplateSettings>
  colors?: ColorSettings
  zoom?: ZoomSettings
  /** Drag/pan controls. Does not control mouse wheel zoom; use zoom.mousewheel. */
  scroll?: { on?: boolean; limit?: boolean; background?: boolean; spacebar?: boolean }
  controls?: { zoom?: boolean; zoomReset?: boolean; userLocation?: boolean; previousMap?: boolean; location?: string }
  tooltips?: OverlaySettings
  popovers?: OverlaySettings
  detailsView?: DetailsSettings
  mobileView?: { labelMap?: string; labelList?: string; labelClose?: string; showMapOnClick?: boolean }
  database?: DatabaseSettings
  actions?: ActionSettings
  layout?: LayoutSettings
  nodes?: AuthoringNode[]
  scenes?: AuthoringScene[]
  stateGraph?: AuthoringStateGraph
  regionDataRules?: Settings<RegionDataRules>
  markerDataRules?: Settings<MarkerDataRules>
  regions?: Record<string, RegionSettings>
  groups?: GroupSettings[]
  galleries?: GallerySettings[]
  layersControl?: SwitcherSettings
  floorsControl?: SwitcherSettings
  floors?: FloorSettings[]
  events?: Partial<Record<EventName, string>>
  middlewares?: { request?: string; response?: string; render?: string; mapLoad?: string }
  css?: string
  googleMaps?: GoogleSettings
  /** Retained legacy presentation settings; native tree guards still restrict placement writes. */
  containers?: { leftSidebar?: LegacyContainer; rightSidebar?: LegacyContainer; header?: LegacyContainer; footer?: LegacyContainer }
  regionStatuses?: ContractLegacyRegionStatus[] | Record<string, ContractLegacyRegionStatus>
  regionsDynamicStatus?: { filtered?: string | number; noObjects?: string | number }
  regionsDynamicStatusOrder?: string[]
  statusSyncOn?: boolean
  statusSyncSource?: BindingRole
  statusSyncField?: string
  statusSyncMultiStrategy?: "priority" | "special"
  statusSyncMap?: { value: string; status: string }[]
  choropleth?: ChoroplethSettings
  showPagination?: boolean
}
export interface DirectorySettings {
  on?: boolean; binding?: BindingRole; showPagination?: boolean
  showFirst?: string; showMapOnClick?: boolean; noResultsText?: string
  customContainer?: boolean; width?: Length; minHeight?: Length
  source?: "database" | "regions"; hideOnMobile?: boolean; location?: string; locationMobile?: string
  containerId?: string; position?: string; search?: boolean; searchPlaceholder?: string; searchFallback?: boolean
  filterout?: { field?: string; cond?: string; val?: Scalar }
  categories?: { on?: boolean; groupBy?: string; collapse?: boolean; collapseOther?: boolean; hideEmpty?: boolean }
  sortBy?: string; sortDirection?: "asc" | "desc"
  clickActions?: { region?: string; marker?: string; directoryItem?: { triggerClick?: boolean; showPopover?: boolean; showDetails?: boolean } }
  detailsViewLocation?: string
}
export interface FilterSettings {
  on?: boolean; binding?: BindingRole; source?: "database" | "regions"
  containerId?: string; location?: string; width?: Length; filteredRegionsStatus?: number
  modalLocation?: string; hideOnMobile?: boolean; hide?: boolean; padding?: string | Spacing
  showButtonText?: string; clearButton?: boolean; clearButtonText?: string; searchButton?: boolean; searchButtonText?: string
}
export interface TemplateSettings { html?: string; css?: string; js?: string; type?: "default" | "partial" }
export interface FilterChoice {
  label?: string; value: string | number | boolean; selected?: boolean; default?: boolean; disabled?: boolean
}
export interface FilterField {
  type: "text" | "select" | "search" | "checkbox" | "checkboxes" | "radio" | "distance" | "date" | "datetime" | "number" | "hidden"
  name?: string; id?: string; label?: string; help?: string; placeholder?: string
  parameterName: string; parameterNameShort?: string
  db_type?: string; db_default?: Scalar; value?: Scalar | Scalar[]
  options?: FilterChoice[]; optionsDict?: Record<string, string>; optionsGrouped?: boolean
  multiselect?: boolean; visible?: boolean; readonly?: boolean; protected?: boolean; searchable?: boolean
  searchFallback?: boolean; width?: Length; renamable?: boolean; hiddenOnTable?: boolean
  distanceControl?: "select" | "text"; distanceUnits?: "km" | "mi"; distanceUnitsLabel?: string
  fromLabel?: string; addressField?: boolean; addressFieldPlaceholder?: string; userLocationButton?: boolean
  language?: string; country?: string; searchByZip?: boolean; zipLength?: number
}
export interface ZoomSettings {
  on?: boolean; limit?: [number, number]; delta?: number; buttons?: { on?: boolean; location?: string }
  /** Enable/disable zoom with the mouse wheel. Independent of scroll.on (drag panning). */
  mousewheel?: boolean;
  fingers?: boolean; hideSvg?: boolean; hideSvgZoomLevel?: number
}
export interface OverlaySettings {
  on?: boolean; position?: string; template?: string; centerOn?: boolean; width?: Length
  maxWidth?: Length; minWidth?: Length; maxHeight?: Length; mobileFullscreen?: boolean; resetViewboxOnClose?: boolean
}
export interface DetailsSettings {
  location?: string; width?: Length; mobileFullscreen?: boolean; containerId?: string; margin?: string | number
  autoresize?: boolean; borderRadius?: number; padding?: Spacing; boxShadow?: Shadow
}
export interface DatabaseSettings {
  pagination?: PaginationSettings; loadOnStart?: boolean; noFiltersNoLoad?: boolean
  autoRefetch?: RefetchSettings; regionsAutoRefetch?: RefetchSettings; on?: boolean; table?: string
}
export interface PaginationSettings { on?: boolean; perpage?: number; showIn?: string; prev?: string; next?: string }
export interface RefetchSettings { on?: boolean; value?: number; unit?: "s" | "m" | "h" }
export interface ClickSettings {
  addIdToUrl?: boolean; showDetails?: boolean; showDetailsFor?: "region" | "objects" | "object"
  detailsViewTemplate?: string; detailsViewLocation?: string; filterDirectory?: boolean; loadObjects?: boolean
  showPopover?: boolean; showPopoverFor?: "region" | "objects" | "object"; popoverTemplate?: string
  goToLink?: boolean; linkField?: string; newTab?: boolean; zoom?: boolean; zoomToLevel?: number
  zoomToMarker?: boolean; zoomToMarkerLevel?: number; selectRegion?: boolean; fireRegionOnClick?: boolean
  fireMarkerOnClick?: boolean; showRegionPopover?: boolean; showMarkerPopover?: boolean
  showAnotherMap?: boolean; mapId?: number | string; parentMapId?: number | string
  idField?: string; mapIdField?: string; anotherMapId?: number | string; triggerClick?: boolean
}
export interface EntityActions {
  click?: ClickSettings; touch?: { showPopover?: boolean }
  mouseover?: { showTooltip?: boolean; tooltipTemplate?: string }; mouseout?: { hideTooltip?: boolean }
}
export interface ActionSettings {
  map?: { afterLoad?: { selectRegion?: boolean; selectMarker?: boolean; loadPost?: "objectsRepository" | "regionsRepository" | null | false } }
  region?: EntityActions; marker?: EntityActions
  directoryItem?: { click?: ClickSettings; touch?: ClickSettings; hover?: { centerOnMarker?: boolean }; mouseout?: { centerOnMarker?: boolean } }
}
export interface ColorSettings {
  /** Current uniform Region fill override. Set this for "make regions blue"; preserve background. */
  base?: string;
  /** Fallback only when base is unset AND the SVG has no fill. Changing this cannot replace an existing base override. */
  baseDefault?: string;
  background?: string; hover?: string | number; selected?: string | number; stroke?: string
  directory?: string; directorySearch?: string; detailsView?: string; popover?: string; tooltip?: string
  leftSidebar?: string; rightSidebar?: string; header?: string; footer?: string; modalFilters?: string
  clusters?: string; clustersHover?: string; clustersText?: string; clustersBorders?: string; clustersHoverBorders?: string; clustersHoverText?: string
  markers?: { base?: MarkerPaint; hovered?: MarkerPaint; unhovered?: MarkerPaint; active?: MarkerPaint; inactive?: MarkerPaint }
  status?: Array<string | null> | Record<string, string>
}
export interface MarkerPaint { opacity?: number; saturation?: number }
export interface RegionSettings { selected?: boolean; disabled?: boolean; fill?: string; stroke?: string; style?: RegionStyle }
export interface RegionStyle { fill?: string; stroke?: string; opacity?: number | string; fillOpacity?: number | string; strokeOpacity?: number | string; strokeWidth?: number | string }
export interface ContractLegacyRegionStatus { label?: string; value?: string | number; disabled?: boolean; color?: string }
export interface LegacyContainer { on?: boolean; width?: Length; height?: Length }
export interface GroupSettings { id: string; title?: string; visible?: boolean; objects?: { label?: string; value: string }[] }
export interface FloorSettings { id?: string | number; title?: string; mapId?: number | string; visible?: boolean; objects?: { label?: string; value: string }[] }
export interface SwitcherSettings { on?: boolean; label?: string; maxHeight?: Length; position?: string; expanded?: boolean }
export interface GallerySettings {
  id: string | number; title?: string; type?: "original" | "multi" | "justified" | "single" | "combo" | "slider"
  background?: string; thumb_width?: Length; thumb_height?: Length; thumb_margin?: Length; max_height?: Length
  lightbox?: boolean | number | string; lb_button_show?: boolean | number | string; lb_button_text?: string
}
export interface GoogleSettings {
  on?: boolean; center?: "auto" | { lat: number; lng: number }; zoom?: number; type?: "roadmap" | "satellite" | "hybrid" | "terrain"
  drawingTools?: boolean; geometry?: boolean; minZoom?: number; maxZoom?: number; language?: string
  style?: string; styleJSON?: GoogleStyleRule[]
}
export interface GoogleStyleRule {
  featureType?: string; elementType?: string
  stylers?: { color?: string; hue?: string; lightness?: number; saturation?: number; gamma?: number; invert_lightness?: boolean; visibility?: "on" | "off" | "simplified"; weight?: number }[]
}
export interface ChoroplethSettings {
  on?: boolean; source?: BindingRole; sourceField?: string; sourceFieldSelect?: { on?: boolean; variants?: string[] }
  bubbleMode?: boolean; bubbleSize?: { min?: number; max?: number }; labels?: { low?: string; high?: string }
  min?: number; max?: number | false; colors?: LegacyGradientColors
  coloring?: { mode?: "gradient" | "palette"; noData?: { color?: string; description?: string }
    gradient?: { colors?: LegacyGradientColors; labels?: { low?: string; high?: string }; values?: { min?: number | null; max?: number | null; maxAdjusted?: number | null } }
    palette?: { colors?: { color: string; valueFrom?: number; valueTo?: number; description?: string }[]; outOfRange?: { color?: string; description?: string } }
    legend?: { on?: boolean; layout?: string; container?: string; title?: string; text?: string; description?: string; width?: Length; height?: Length }
  }
}
export interface LegacyGradientColors {
  low?: string; high?: string; noData?: string; lowRGB?: RGBA | null; highRGB?: RGBA | null; diffRGB?: RGBA | null
}
export interface RGBA { r: number; g: number; b: number; a: number }
export type EventName = "afterInit" | "beforeInit" | "zoom" | "afterLoadRegions" | "afterLoadObjects" |
  "beforeLoad.repository" | "afterLoad.repository" | "click.region" | "mouseover.region" | "mouseout.region" |
  "click.marker" | "mouseover.marker" | "mouseout.marker" | "beforeRedraw.popover" | "afterRedraw.popover" |
  "beforeShow.popover" | "afterShow.popover" | "beforeClose.popover" | "afterClose.popover" |
  "beforeRedraw.detailsView" | "afterRedraw.detailsView" | "beforeClose.detailsView" | "afterClose.detailsView" |
  "beforeShow.detailsView" | "afterShow.detailsView" | "beforeRedraw.tooltip" | "afterRedraw.tooltip" |
  "beforeClose.tooltip" | "afterClose.tooltip" | "beforeShow.tooltip" | "afterShow.tooltip" |
  "click.directoryItem" | "mouseover.directoryItem" | "mouseout.directoryItem"

// Node/Page/Scene contracts below are serialized JSON, not hydrated ArrayIndexed instances.
/** Coverage proposal: JSON-only authoring nodes from current native defaults/runtime. */
export type ContractJson = null | boolean | number | string | ContractJson[] | { [key: string]: ContractJson }
export type ContractBreakpoint = 'desktop' | 'tablet' | 'mobile'
export type ContractSize = { mode: 'auto' | 'fill' | 'fixed'; value?: number }
export type ContractContainerLayout = {
  hidden?: boolean; position?: 'relative' | 'absolute';
  anchor?: 'top-left' | 'top' | 'top-right' | 'left' | 'center' | 'right' | 'bottom-left' | 'bottom' | 'bottom-right';
  width?: ContractSize; height?: ContractSize; widthPercent?: number; heightPercent?: number;
  minWidth?: number; maxWidth?: number; minWidthPercent?: number; maxWidthPercent?: number;
  minHeight?: number; maxHeight?: number; maxHeightPercent?: number;
  padding?: number; paddingBottom?: number; gap?: number; align?: 'start' | 'center' | 'end' | 'stretch'
}
export type ContractResponsiveLayout = { desktop?: ContractContainerLayout; tablet?: ContractContainerLayout; mobile?: ContractContainerLayout }
export type ContractGridItem = { id: string; x: number; y: number; w: number; h: number }
export type ContractGrid = { column?: number; gap?: number; cellHeight?: number; grids?: { desktop?: ContractGridItem[]; tablet?: ContractGridItem[]; mobile?: ContractGridItem[] } }
export type ContractCommonNodeSettings = {
  on?: boolean; placement?: { parentId: string }; responsiveLayout?: ContractResponsiveLayout;
  /** Existing NewMapDefaults stores legacy width/height on slots; responsive sizes are preferred. */
  width?: string | number; height?: string | number;
}
export type ContractNodeStyles = { backgroundColor?: string; marginLeft?: number; marginRight?: number; marginTop?: number; marginBottom?: number }
export type ContractNodeBase<T extends string, S> = {
  id: string; type: T; title?: string; children?: string[]; settings?: S | [];
  styles?: ContractNodeStyles; template?: string; css?: string; js?: Record<string, string>
}
export type ContractPlacementNode = ContractNodeBase<'slot' | 'frame' | 'body' | 'core' | 'region' | 'marker' | 'view', ContractCommonNodeSettings>
export type ContractMapNode = ContractNodeBase<'map', ContractCommonNodeSettings & { chromeGrid?: ContractGrid }>
export type ContractDirectoryNode = ContractNodeBase<'directory', ContractCommonNodeSettings & {
  source?: 'regions' | 'database'; binding?: 'objects' | 'regions'; location?: string; containerId?: string;
  sortBy?: string; sortDirection?: 'asc' | 'desc'; showPagination?: boolean; noResultsText?: string;
  showFirst?: 'map' | 'list' | 'directory'; showMapOnClick?: boolean; hideOnMobile?: boolean; minHeight?: string | number;
  categories?: { on?: boolean; groupBy?: string; collapse?: boolean; collapseOther?: boolean; hideEmpty?: boolean }
}>
export type ContractFiltersNode = ContractNodeBase<'filters', ContractCommonNodeSettings & {
  binding?: 'objects' | 'regions'; location?: string; containerId?: string; hide?: boolean; hideOnMobile?: boolean;
  clearButton?: boolean; clearButtonText?: string; searchButton?: boolean; searchButtonText?: string; showButtonText?: string; padding?: string
}>
export type ContractModalNode = ContractNodeBase<'modal', ContractCommonNodeSettings & { location?: string; containerId?: string; template?: string }>
export type ContractPopoverNode = ContractNodeBase<'popover', ContractCommonNodeSettings & {
  position?: string; template?: string; centerOn?: boolean; resetViewboxOnClose?: boolean;
  maxWidth?: string | number; maxHeight?: string | number; mobileFullscreen?: boolean
}>
export type ContractTooltipNode = ContractNodeBase<'tooltip', ContractCommonNodeSettings & { position?: string; template?: string; minWidth?: string | number; maxWidth?: string | number }>
export type ContractLayersNode = ContractNodeBase<'layers', ContractCommonNodeSettings & { mapNodeId?: string; label?: string; expanded?: boolean; position?: string; maxHeight?: string | number }>
export type ContractLegendNode = ContractNodeBase<'legend', ContractCommonNodeSettings & { mapNodeId?: string; title?: string }>
export type ContractControlsNode = ContractNodeBase<'controls', ContractCommonNodeSettings & { location?: string; zoom?: boolean; zoomReset?: boolean; userLocation?: boolean; previousMap?: boolean }>
export type ContractMobileToolbarNode = ContractNodeBase<'mobileToolbar', ContractCommonNodeSettings & { mapContainerId?: string; listContainerId?: string; showFirst?: 'map' | 'list'; showMapOnClick?: boolean; labelMap?: string; labelList?: string; labelClose?: string }>
export type ContractNode = ContractPlacementNode | ContractMapNode | ContractDirectoryNode | ContractFiltersNode | ContractModalNode | ContractPopoverNode | ContractTooltipNode | ContractLayersNode | ContractLegendNode | ContractControlsNode | ContractMobileToolbarNode
export type ContractPageBinding = {
  queryId: string; perPage?: number | null;
  params?: Record<string, ContractJson>; orderBy?: Array<Record<string, 'asc' | 'desc'>>; filterout?: Record<string, ContractJson>;
  disableOn?: { initialLoad?: boolean; emptyFilters?: boolean };
  pagination?: { on?: boolean; perpage?: number; showIn?: string; next?: string; prev?: string };
  refetch?: { on?: boolean; value?: number; unit?: 's' | 'm' | 'h' };
}
export type ContractScene = {
  id: string; title?: string; rootNodeId: string; bodyNodeId: string;
  mount?: { type: 'dynamic' | 'custom'; containerId?: string };
  dataBindings?: { objects?: ContractPageBinding; regions?: ContractPageBinding };
  /** No current concrete theme schema found: omit writes rather than open unknown dictionary. */
}
export type ContractStateChange = { path: string[]; value?: ContractJson; remove?: true }
/** IMPORTANT: changes[].value requires contextual same-contract validation at Dashboard, not just JSON-envelope validation. */
export type ContractStateGraph = {
  version: 1 | 2;
  branches: { id: string; name: string; sceneId: string }[];
  states: { id: string; title: string; sceneId: string; branchId: string; parentId: string | null; changes: ContractStateChange[] }[];
  defaultStateId: string | null;
}
export type LayoutSettings = ContractGrid & { mountMode?: "tree"; deletedNodeTypes?: string[] }
export type AuthoringNode = ContractNode
export type AuthoringScene = ContractScene
export type AuthoringStateGraph = ContractStateGraph
