import type { MapSVGExtensionHostApi } from "../Extensions/ExtensionHost"
import type {
  NodeAdapter,
  NodeAdapterEnhancer,
  NodeAdapterFactory,
  NodePayload,
  NodeRegistry,
} from "./index"

function extensionHost(): MapSVGExtensionHostApi {
  const host = window.MapSVG?.extensions
  if (!host) {
    throw new Error("[NodeRegistry] Shared MapSVG extension host is not available")
  }
  return host
}

/**
 * Runtime node registry adapter backed by the shared cross-bundle host.
 *
 * Lite and paid bundles never import a private registry singleton from each
 * other. They both register through window.MapSVG.extensions.
 */
class DefaultNodeRegistry implements NodeRegistry {
  register(type: string, factory: NodeAdapterFactory): void {
    extensionHost().register("runtime.node", type, factory)
  }

  enhance(type: string, enhancer: NodeAdapterEnhancer): void {
    extensionHost().enhance("runtime.node", type, enhancer)
  }

  create(type: string, payload: NodePayload): NodeAdapter {
    const host = extensionHost()
    host.seal("runtime.node")
    const factory = host.get<NodeAdapterFactory>("runtime.node", type)
    if (!factory) {
      throw new Error(`[NodeRegistry] No adapter registered for type "${type}"`)
    }
    return factory(payload)
  }

  has(type: string): boolean {
    return extensionHost().has("runtime.node", type)
  }
}

/** Stable adapter; storage lives in the shared window.MapSVG.extensions host. */
export const nodeRegistry: NodeRegistry = new DefaultNodeRegistry()
