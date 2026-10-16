import { MapsvgClient } from "@/Core/InitGlobals"
import { Mapsvg, MapsvgFrontendParams } from "@/Core/Mapsvg"
import CodeMirror from "codemirror"
import Handlebars from "handlebars/runtime"

declare module "googlemaps"

/**
 * @ignore
 */
export type MapSVGPaths = {
  // WP ajaxurl
  ajaxurl?: string
  // Root folder of MapSVG plugin
  root: string
  // WP Rest API URL
  api: string
  // Stores info which templates are loaded
  templates: Record<string, boolean>
  // Path to maps folder, relative to the root
  maps: string
  // Path to uploads folder
  uploads: string
  // Path to home folder
  home: string
}

// Core initialization exposes Mapsvg first, then installs the full browser client.
// Legacy admin scripts populate countries; touchDevice is an optional legacy flag.
type MapsvgBrowserGlobal = Mapsvg & Partial<MapsvgClient> & {
  countries?: Array<{ label: string; value: string }>
  touchDevice?: boolean
}

declare global {
  interface Window {
    mapsvgAdmin: any
    mapsvgFrontendParams: MapsvgFrontendParams
    MapSVG: MapsvgBrowserGlobal
    Handlebars: typeof Handlebars
    jQuery: JQueryStatic
    wp: any
    mapsvg_paths: MapSVGPaths
    ajaxurl: string
    mapsvg_runtime_vars: {
      nonce: string
      google_maps_api_key: string
    }
    google: google.maps.Map
    mapsvgInitGoogleMap: () => void
    CoreMirror: typeof CodeMirror
    mapsvg: MapsvgBrowserGlobal
    bootstrap: {
      Popover: any
    }
  }

  interface Map<K, V> {
    toArray(): Array<V>
  }
  interface SVGElement {
    getTransformToElement(toElement: SVGGraphicsElement): SVGMatrix
  }
  interface Element {
    remove(): void
  }
}

export {}
