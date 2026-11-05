import { installMapSVGExtensionHost } from "./ExtensionHost"

installMapSVGExtensionHost(window)
window.dispatchEvent(new Event("mapsvgExtensionsReady"))
