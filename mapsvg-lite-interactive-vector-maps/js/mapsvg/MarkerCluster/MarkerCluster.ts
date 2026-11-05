/** Compatibility type only. Clusters are instantiated by the optional module. */
export type MarkerCluster = InstanceType<ReturnType<typeof import("../../../paid/features/clustering/runtime/MarkerCluster").createMarkerClusterClass>>
