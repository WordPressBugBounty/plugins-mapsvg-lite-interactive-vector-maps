/** Minimal runtime boundary; avoid importing the entire Map dependency graph. */
export interface LoadedApp {
  id: number
  loaded?: boolean
  mapDataPromise?: Promise<unknown>
  useShadowRoot?: boolean
  containers: { map?: HTMLElement; wrapAll?: HTMLElement; root?: HTMLElement }
  options: { previousMapsIds?: Array<number | string>; controls?: { previousMap?: boolean }; loadingText?: string }
  events: { on: (name: string, callback: (...args: any[]) => void) => unknown }
  getActionMapLayoutHost: (nodeId: string) => HTMLElement | undefined
  setControls: (controls: any) => void
  destroy: () => void
}

/** Node IDs are scoped to the source App, never document-wide HTML IDs. */
export type MapLoadTarget = HTMLElement | string | { nodeId: string }
export type AnotherMapAction = { showAnotherMapNodeId?: string; showAnotherMapContainerId?: string }
/** Consumer transport/lifecycle context, never a persisted App option or constructor. */
export interface ChildMapContext {
  extras?: Record<string, unknown>
  onCreated?: (map: LoadedApp) => void
  onDispose?: () => void
}
export type ChildMapContextProvider = (element: HTMLElement, id: number) => ChildMapContext
/** Internal native-module callback; consumers cannot replace this constructor. */
export type CreateChildMap = (element: HTMLElement, id: number, loadingText: string) => LoadedApp

/** Apply optional embed context while native Map.loadMap retains construction/teardown. */
export function createContextualChild<T extends LoadedApp>(
  context: ChildMapContext | undefined,
  construct: (extras?: Record<string, unknown>) => T,
): T {
  let map: T
  try {
    map = construct(context?.extras)
  } catch (error) {
    context?.onDispose?.()
    throw error
  }
  // Ordinary WordPress children keep their original destructor and timing.
  if (!context) return map
  const destroy = map.destroy.bind(map)
  let retired = false
  map.destroy = () => {
    if (retired) return
    retired = true
    try {
      context.onDispose?.()
    } finally {
      // Pending async construction must settle before native DOM/controller teardown.
      if (map.loaded || !map.mapDataPromise) destroy()
      else void map.mapDataPromise.then(destroy, destroy)
    }
  }
  try {
    context.onCreated?.(map)
  } catch (error) {
    map.destroy()
    throw error
  }
  return map
}

export function actionMapTarget(action: AnotherMapAction): MapLoadTarget | undefined {
  return typeof action.showAnotherMapNodeId === "string"
    ? action.showAnotherMapNodeId ? { nodeId: action.showAnotherMapNodeId } : undefined
    : action.showAnotherMapContainerId || undefined
}

export interface ShowAnotherMapModule {
  load: (source: LoadedApp, id: number | string, target: MapLoadTarget | undefined, create: CreateChildMap, existingMaps: LoadedApp[]) => void
  release: (source: LoadedApp) => void
  previous: (source: LoadedApp & { loadMap: (id: number | string) => void }) => void
  action: (source: any, action: AnotherMapAction & { showAnotherMap?: boolean; showAnotherMapField?: string }, region: any, object: any) => boolean
  controls: (source: any, container: HTMLElement) => void
}
