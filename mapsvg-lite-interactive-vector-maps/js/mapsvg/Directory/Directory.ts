/** Type-only integration contract; implementation belongs to the Directory module. */
import type { createDirectoryControllerClass } from "../../../paid/features/directory/runtime/Directory"
export type DirectoryController = InstanceType<ReturnType<typeof createDirectoryControllerClass>>
