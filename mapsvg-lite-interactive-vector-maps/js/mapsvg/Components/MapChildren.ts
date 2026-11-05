type PlacementNode = { id: string; type: string; children?: string[] }

/** Fixed Map-owned internals, created by defaults/normalization, never by drag/drop. */
export const MAP_INTERNAL_NODE_TYPES = ["region", "marker", "tooltip", "popover", "controls"] as const

export function isMapInternalType(type: string): boolean {
  return (MAP_INTERNAL_NODE_TYPES as readonly string[]).includes(type)
}

/** Nearest movable roots inside Map; a Frame subtree moves as one unit. */
export function mapContentRoots<T extends PlacementNode>(nodes: readonly T[], mapId: string): T[] {
  const byId = new Map(nodes.map(node => [node.id, node]))
  const pending = [...(byId.get(mapId)?.children ?? [])], seen = new Set([mapId]), content: T[] = []
  while (pending.length) {
    const id = pending.shift()!
    if (seen.has(id)) continue
    seen.add(id)
    const node = byId.get(id)
    if (!node) continue
    if (isMapInternalType(node.type)) pending.push(...(node.children ?? []))
    else content.push(node)
  }
  return content
}

/** Includes the candidate container itself; children[] is the placement authority. */
export function isMapOwnedPlacement(nodes: readonly PlacementNode[], nodeId: string): boolean {
  const pending = [nodeId], seen = new Set<string>()
  while (pending.length) {
    const id = pending.pop()!
    if (seen.has(id)) continue
    seen.add(id)
    if (nodes.some(node => node.id === id && node.type === "map")) return true
    for (const node of nodes) if (node.children?.includes(id)) pending.push(node.id)
  }
  return false
}
