import type { Controller } from "../Core/Controller"
import type { DirectoryController } from "./Directory"
/** Optional implementation, resolved before map initialization. */
export interface DirectoryModule {
 defaults: Record<string, unknown>
 controller(base: typeof Controller): new (...args: any[]) => DirectoryController
 loadItemsToDirectory(this: any, services: any, ...args: any[]): any
 directoryFilterOut(this: any, services: any, ...args: any[]): any
 loadDirectory(this: any, services: any, ...args: any[]): any
 setFilterOut(this: any, services: any, ...args: any[]): any
 setMenu(this: any, services: any, ...args: any[]): any
}
