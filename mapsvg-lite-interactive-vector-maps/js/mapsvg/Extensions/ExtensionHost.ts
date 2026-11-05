export const MAPSVG_EXTENSION_HOST_API_VERSION = 1 as const

export const MAPSVG_EXTENSION_POINTS = [
  "runtime.node",
  "runtime.component",
  "admin.component",
  "admin.node",
  "admin.schema",
  "admin.navigation",
  "admin.panel",
  "admin.style",
] as const

export type MapSVGExtensionPoint = (typeof MAPSVG_EXTENSION_POINTS)[number]

export type MapSVGCapabilityMetadata = Readonly<{
  family?: string
  source?: string
  [key: string]: unknown
}>

export type MapSVGPaidAddonMetadata = Readonly<{
  sku: string
  version: string
  plugin?: string
}>

export type MapSVGExtensionEntry<T = unknown> = Readonly<{
  id: string
  value: T
}>

export type MapSVGExtensionEnhancer<T = unknown> = (current: T) => T

export interface MapSVGExtensionHostApi {
  readonly apiVersion: typeof MAPSVG_EXTENSION_HOST_API_VERSION
  register<T>(point: MapSVGExtensionPoint, id: string, value: T): void
  enhance<T>(point: MapSVGExtensionPoint, id: string, enhancer: MapSVGExtensionEnhancer<T>): void
  get<T>(point: MapSVGExtensionPoint, id: string): T | undefined
  has(point: MapSVGExtensionPoint, id: string): boolean
  list<T>(point: MapSVGExtensionPoint): MapSVGExtensionEntry<T>[]
  seal(point: MapSVGExtensionPoint): void
  isSealed(point: MapSVGExtensionPoint): boolean
  registerCapability(id: string, metadata?: MapSVGCapabilityMetadata): void
  hasCapability(id: string): boolean
  getCapability(id: string): MapSVGCapabilityMetadata | undefined
  listCapabilities(): MapSVGExtensionEntry<MapSVGCapabilityMetadata>[]
  sealCapabilities(): void
  capabilitiesSealed(): boolean
  setActiveAddon(metadata: MapSVGPaidAddonMetadata): void
  getActiveAddon(): MapSVGPaidAddonMetadata | null
}

type Registry = Map<string, unknown>

function assertIdentifier(value: string, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error("[MapSVG extensions] " + label + " must be a non-empty string")
  }
  return value
}

function assertPoint(point: string): asserts point is MapSVGExtensionPoint {
  if (!(MAPSVG_EXTENSION_POINTS as readonly string[]).includes(point)) {
    throw new Error('[MapSVG extensions] Unknown extension point "' + point + '"')
  }
}

function addonEquals(left: MapSVGPaidAddonMetadata, right: MapSVGPaidAddonMetadata): boolean {
  return left.sku === right.sku && left.version === right.version && left.plugin === right.plugin
}

export class MapSVGExtensionHost implements MapSVGExtensionHostApi {
  readonly apiVersion = MAPSVG_EXTENSION_HOST_API_VERSION

  private readonly registries = new Map<MapSVGExtensionPoint, Registry>()
  private readonly sealedPoints = new Set<MapSVGExtensionPoint>()
  private readonly capabilities = new Map<string, MapSVGCapabilityMetadata>()
  private capabilityRegistrySealed = false
  private activeAddon: MapSVGPaidAddonMetadata | null = null

  register<T>(point: MapSVGExtensionPoint, id: string, value: T): void {
    this.assertWritablePoint(point)
    const normalizedId = assertIdentifier(id, "Extension id")
    if (value === undefined || value === null) {
      throw new Error(
        '[MapSVG extensions] Extension "' + normalizedId + '" cannot be null/undefined',
      )
    }

    const registry = this.registry(point)
    if (registry.has(normalizedId)) {
      throw new Error(
        '[MapSVG extensions] Duplicate registration "' + point + ":" + normalizedId + '"',
      )
    }
    registry.set(normalizedId, value)
  }

  enhance<T>(point: MapSVGExtensionPoint, id: string, enhancer: MapSVGExtensionEnhancer<T>): void {
    this.assertWritablePoint(point)
    const normalizedId = assertIdentifier(id, "Extension id")
    if (typeof enhancer !== "function") {
      throw new Error(
        '[MapSVG extensions] Enhancer for "' + point + ":" + normalizedId + '" must be a function',
      )
    }

    const registry = this.registry(point)
    if (!registry.has(normalizedId)) {
      throw new Error(
        '[MapSVG extensions] Cannot enhance missing registration "' +
          point +
          ":" +
          normalizedId +
          '"',
      )
    }

    const enhanced = enhancer(registry.get(normalizedId) as T)
    if (enhanced === undefined || enhanced === null) {
      throw new Error(
        '[MapSVG extensions] Enhancer for "' +
          point +
          ":" +
          normalizedId +
          '" returned null/undefined',
      )
    }
    registry.set(normalizedId, enhanced)
  }

  get<T>(point: MapSVGExtensionPoint, id: string): T | undefined {
    assertPoint(point)
    return this.registry(point).get(assertIdentifier(id, "Extension id")) as T | undefined
  }

  has(point: MapSVGExtensionPoint, id: string): boolean {
    assertPoint(point)
    return this.registry(point).has(assertIdentifier(id, "Extension id"))
  }

  list<T>(point: MapSVGExtensionPoint): MapSVGExtensionEntry<T>[] {
    assertPoint(point)
    return [...this.registry(point).entries()].map(([id, value]) => ({
      id,
      value: value as T,
    }))
  }

  seal(point: MapSVGExtensionPoint): void {
    assertPoint(point)
    this.sealedPoints.add(point)
  }

  isSealed(point: MapSVGExtensionPoint): boolean {
    assertPoint(point)
    return this.sealedPoints.has(point)
  }

  registerCapability(id: string, metadata: MapSVGCapabilityMetadata = {}): void {
    if (this.capabilityRegistrySealed) {
      throw new Error("[MapSVG extensions] Capability registry is sealed")
    }
    const normalizedId = assertIdentifier(id, "Capability id")
    if (this.capabilities.has(normalizedId)) {
      throw new Error('[MapSVG extensions] Duplicate capability "' + normalizedId + '"')
    }
    this.capabilities.set(normalizedId, Object.freeze({ ...metadata }))
  }

  hasCapability(id: string): boolean {
    return this.capabilities.has(assertIdentifier(id, "Capability id"))
  }

  getCapability(id: string): MapSVGCapabilityMetadata | undefined {
    return this.capabilities.get(assertIdentifier(id, "Capability id"))
  }

  listCapabilities(): MapSVGExtensionEntry<MapSVGCapabilityMetadata>[] {
    return [...this.capabilities.entries()].map(([id, value]) => ({ id, value }))
  }

  sealCapabilities(): void {
    this.capabilityRegistrySealed = true
  }

  capabilitiesSealed(): boolean {
    return this.capabilityRegistrySealed
  }

  setActiveAddon(metadata: MapSVGPaidAddonMetadata): void {
    const normalized = Object.freeze({
      sku: assertIdentifier(metadata?.sku, "Paid add-on SKU"),
      version: assertIdentifier(metadata?.version, "Paid add-on version"),
      ...(metadata?.plugin
        ? { plugin: assertIdentifier(metadata.plugin, "Paid add-on plugin") }
        : {}),
    })

    if (this.activeAddon) {
      if (addonEquals(this.activeAddon, normalized)) {
        return
      }
      throw new Error(
        '[MapSVG extensions] Paid add-on already active: "' +
          this.activeAddon.sku +
          "@" +
          this.activeAddon.version +
          '"',
      )
    }
    this.activeAddon = normalized
  }

  getActiveAddon(): MapSVGPaidAddonMetadata | null {
    return this.activeAddon
  }

  private registry(point: MapSVGExtensionPoint): Registry {
    let registry = this.registries.get(point)
    if (!registry) {
      registry = new Map()
      this.registries.set(point, registry)
    }
    return registry
  }

  private assertWritablePoint(point: MapSVGExtensionPoint): void {
    assertPoint(point)
    if (this.sealedPoints.has(point)) {
      throw new Error('[MapSVG extensions] Extension point "' + point + '" is sealed')
    }
  }
}

export type MapSVGExtensionGlobal = {
  MapSVG?: {
    extensions?: MapSVGExtensionHostApi
  }
  dispatchEvent?: (event: Event) => boolean
}

export function installMapSVGExtensionHost(target: MapSVGExtensionGlobal): MapSVGExtensionHostApi {
  const namespace = target.MapSVG ?? {}
  const existing = namespace.extensions

  if (existing) {
    if (existing.apiVersion !== MAPSVG_EXTENSION_HOST_API_VERSION) {
      throw new Error(
        "[MapSVG extensions] Incompatible host API version " +
          existing.apiVersion +
          "; expected " +
          MAPSVG_EXTENSION_HOST_API_VERSION,
      )
    }
    return existing
  }

  const host = new MapSVGExtensionHost()
  namespace.extensions = host
  target.MapSVG = namespace
  return host
}
