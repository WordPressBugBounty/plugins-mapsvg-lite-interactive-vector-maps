type Handler = (...args: any[]) => any
type EventTarget = {
  on: (name: string, handler: Handler) => unknown
  off: (name: string, handler: Handler) => unknown
}
type OwnedHandler = { target: EventTarget; name: string; handler: Handler }

/** Configured scripts own only their callbacks, never a runtime's whole event name. */
export class ConfiguredEventHandlers {
  private handlers = new Map<string, OwnedHandler[]>()

  private remove(name: string): void {
    for (const owned of this.handlers.get(name) ?? []) owned.target.off(owned.name, owned.handler)
    this.handlers.delete(name)
  }

  apply(
    sources: Record<string, string | Handler>,
    unique: boolean,
    parse: (source: string) => unknown,
    target: EventTarget,
    directory?: EventTarget,
  ): void {
    for (const [name, source] of Object.entries(sources)) {
      if (source === "") {
        if (unique) this.remove(name)
        continue
      }
      const compiled = typeof source === "string" ? parse(source) : source
      // Keep the last valid live callback while a draft contains a syntax error.
      if (typeof compiled !== "function") continue
      if (unique) this.remove(name)
      const handler = compiled as Handler
      const owned = this.handlers.get(name) ?? []
      target.on(name, handler)
      owned.push({ target, name, handler })
      // directoryItem events are explicitly forwarded by the runtime's action
      // listeners. Registering those on the controller too runs each edit twice.
      if (directory && name.endsWith(".directory")) {
        // Legacy directory setters replace their configured forwarding callback
        // even when Map-level registration is additive. Keep unrelated listeners.
        for (let index = owned.length - 1; index >= 0; index--) {
          const previous = owned[index]
          if (previous.target !== target) {
            previous.target.off(previous.name, previous.handler)
            owned.splice(index, 1)
          }
        }
        const directoryName = name.split(".")[0]
        directory.on(directoryName, handler)
        owned.push({ target: directory, name: directoryName, handler })
      }
      this.handlers.set(name, owned)
    }
  }
}
