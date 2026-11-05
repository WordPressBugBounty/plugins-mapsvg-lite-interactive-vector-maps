/**
 * Base adapter contract for all node-level display components (popover, tooltip, details, etc.).
 * Every node adapter must implement this interface regardless of tier.
 *
 * The wrap model: Pro packages receive the Lite adapter and produce a new adapter
 * that delegates unchanged methods to the base and overrides only what changes.
 * Pro never extends a Lite class across a package boundary — it wraps a Lite instance.
 */
export interface NodeAdapter {
  /** Unique node-type identifier matching the registry key */
  readonly type: string

  /** Open/show the node for a given map-object payload */
  open(payload: NodePayload): void

  /** Close/hide the node */
  close(): void

  /** Destroy and clean up (remove DOM, listeners) */
  destroy(): void

  /**
   * Feature capability check.
   * Callers should prefer this over instanceof checks.
   * @example adapter.supports("template") // Pro popover with Handlebars
   */
  supports(capability: NodeCapability | string): boolean
}

/** Data passed to `open()` from the map runtime */
export interface NodePayload {
  /** The map object that triggered the open (region, marker, …) */
  objectId: string
  objectType: "region" | "marker" | "object"
  /** Arbitrary field data from the data layer */
  data?: Record<string, unknown>
  /** SVG anchor point (for positioned adapters) */
  svgPoint?: { x: number; y: number }
}

/**
 * Well-known capability tokens.
 * Adapters may also report vendor-prefixed capabilities (e.g. "acme:custom").
 */
export type NodeCapability =
  | "template"    // Handlebars/HTML template body (Pro popover)
  | "gallery"     // Photo gallery tab inside details (Pro)
  | "clustering"  // Marker cluster adapter
  | "external-url" // Click-to-external-URL node
