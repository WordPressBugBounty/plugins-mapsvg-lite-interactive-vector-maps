type ContainerNode = { id: string; type?: string; styles?: Record<string, unknown> }
type ContainerColors = Partial<Record<"header" | "footer" | "leftSidebar" | "rightSidebar", unknown>>
const LEGACY_SLOT_COLORS: Record<string, keyof ContainerColors> = {
  Header: "header", LeftSidebar: "leftSidebar", RightSidebar: "rightSidebar", Footer: "footer",
}

/** An explicit empty string clears the legacy color without deleting old data. */
export function containerBackground(node: ContainerNode, colors?: ContainerColors): string {
  if (typeof node.styles?.backgroundColor === "string") return node.styles.backgroundColor
  const legacy = node.type === "slot" ? colors?.[LEGACY_SLOT_COLORS[node.id]] : undefined
  return typeof legacy === "string" ? legacy : ""
}

export function applyContainerBackground(element: HTMLElement, node: ContainerNode, colors?: ContainerColors): void {
  element.style.backgroundColor = ""
  element.style.backgroundColor = containerBackground(node, colors)
}
