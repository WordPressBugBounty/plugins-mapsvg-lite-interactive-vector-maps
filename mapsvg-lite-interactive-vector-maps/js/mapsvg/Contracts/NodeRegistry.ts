import type { NodeAdapter, NodePayload } from "./NodeAdapter"

/** Factory function that creates a NodeAdapter for a given payload */
export type NodeAdapterFactory = (payload: NodePayload) => NodeAdapter

/**
 * Enhancer function used by Pro add-ons to wrap a Lite adapter.
 * Receives the Lite factory, returns a new factory that wraps the result.
 * This is the single extension seam across the package boundary.
 *
 * @example
 * // In mapsvg-pro bootstrap:
 * registry.enhance("popover", (liteFactory) => (payload) => {
 *   const base = liteFactory(payload)
 *   return new PopoverProWrap(base, payload)
 * })
 */
export type NodeAdapterEnhancer = (liteFactory: NodeAdapterFactory) => NodeAdapterFactory

/**
 * Central registry for node-type adapters.
 * Lite owns all registrations; Pro calls `enhance()` at activation time.
 */
export interface NodeRegistry {
  /** Register a Lite adapter factory for a node type */
  register(type: string, factory: NodeAdapterFactory): void

  /**
   * Wrap an existing factory with paid capabilities.
   * Enhancing an unknown or already-consumed type is a deterministic error.
   */
  enhance(type: string, enhancer: NodeAdapterEnhancer): void

  /** Create an adapter for the given type + payload */
  create(type: string, payload: NodePayload): NodeAdapter

  /** Returns true if a factory is registered for the given type */
  has(type: string): boolean
}
