import { hasRuntimeFeature, schemaUsesPostData } from "./productFeatures"
import { Query } from "../Infrastructure/Server/Query"
import { hasBindingFilters, readPageBinding, initialBindingPageId, type BindingRole } from "../Map/pageBindings"
import { withDraftPreview } from "../Map/draftPreviewTransport"
import {
  ApiEndpoint,
  ApiEndpointName,
  HTTPMethod,
  Schema,
  SchemaEventType,
} from "../Infrastructure/Server/Schema"
import { Server } from "../Infrastructure/Server/Server"
import { MapSVGMap } from "../Map/Map"
import { Model } from "../Model/Model"
import { ArrayIndexed } from "./ArrayIndexed"
import { Events } from "./Events"
import { mapsvgCore } from "./Mapsvg"
import { MiddlewareList, MiddlewareType } from "./Middleware"
import { addTrailingSlash, removeLeadingSlash } from "./Utils"
const $ = jQuery

export enum RepositoryEvent {
  AFTER_INIT = "afterInit",
  AFTER_LOAD = "afterLoad",
  FAILED_LOAD = "failedLoad",
  BEFORE_LOAD = "beforeLoad",
  BEFORE_FETCH = "beforeFetch",
  AFTER_FETCH = "afterFetch",
  CHANGE = "change",
  BEFORE_UPDATE = "beforeUpdate",
  AFTER_UPDATE = "afterUpdate",
  BEFORE_CREATE = "beforeCreate",
  AFTER_CREATE = "afterCreate",
  BEFORE_DELETE = "beforeDelete",
  AFTER_DELETE = "afterDelete",
  AFTER_UPDATE_SCHEMA = "afterUpdateSchema",
  AFTER_UPDATE_IMPORT_SETTTINGS = "afterUpdateImportSettings",
}

/** Options for find/reload. silent skips loading UI on the map. */
export type FindOptions = {
  silent?: boolean
  /** First read of a Page/binding, including editor preview. */
  initial?: boolean
  /** Polling/schema refresh must not start a binding waiting for interaction. */
  automatic?: boolean
}

export type MapsvgRequest = {
  sourceRead?: boolean
  bindingRead?: boolean
  schemaOnly?: boolean
  repository: RepositoryInterface<Model>
  action: string
  url: string
  method: HTTPMethod
  headers?: {
    Authorization: string
  }
  data?: Query | Record<string, any>
}
export type MapsvgResponse = {
  data: string | Record<string, any>
}
export type MapsvgCtx = {
  request: MapsvgRequest
  response: MapsvgResponse
  [key: string]: any
}
export interface RepositoryInterface<T extends Model = Model> {
  server: Server
  query: Query
  hasMore: boolean
  className: string

  path: string
  loaded: boolean
  schema?: Schema
  objects: ArrayIndexed<T>
  completeChunks: number

  middlewares: MiddlewareList
  events: Events

  noFiltersNoLoad: boolean

  classType: typeof Model

  setSchema(schema: Schema): void
  getSchema(): Schema

  getLoaded(): ArrayIndexed<T>
  getLoadedAsArray(): ArrayIndexed<T>
  create(object: any): JQueryDeferred<T>
  find(params?: Query | { [key: string]: any }, options?: FindOptions): JQueryDeferred<any>
  findById(id: number | string): JQueryDeferred<T>
  getLoadedObject(id: number | string): T
  update(object: any): JQueryDeferred<T>
  delete(id: string | number): JQueryDeferred<void>

  loadDataFromResponse(data: string | Record<string, any>, ctx: MapsvgCtx): void
  reload(options?: FindOptions): JQueryPromise<any>

  encodeData(params: any): { [key: string]: any }
  defaultResponseMiddleware(data: unknown, ctx: MapsvgCtx): Record<string, unknown>

  onFirstPage(): boolean
  onLastPage(): boolean

  getImportSettings(force?: boolean): JQueryDeferred<any>
  updateImportSettings(fields: Record<string, any>): JQueryDeferred<any>
}

export class Repository<T extends Model = Model> implements RepositoryInterface<T> {
  classType: typeof Model
  name: string
  map?: MapSVGMap
  server: Server
  query: Query
  hasMore: boolean = false
  className: string = ""

  path: string
  loaded: boolean
  schema?: Schema
  objects: ArrayIndexed<T>
  completeChunks: number

  noFiltersNoLoad: boolean

  events: Events
  middlewares: MiddlewareList
  importSettings: Record<string, any> | null
  importSettingsLoaded: boolean
  importSettingsPromise: JQueryDeferred<any> | null

  constructor(schema: Schema, map?: MapSVGMap) {
    this.classType = Model
    this.map = map
    this.server = new Server(mapsvgCore.routes.api)
    this.query = new Query()
    this.objects = new ArrayIndexed("id")
    this.completeChunks = 0
    this.setSchema(schema)
    this.middlewares = new MiddlewareList()
    this.importSettings = null
    this.importSettingsLoaded = false
    this.importSettingsPromise = null
  }

  // TODO:
  // Proxy API to:
  // apiEndpoints: [
  //   { url: "objects/%name%", method: "GET", name: "index" },
  //   { url: "objects/%name%/[:id]", method: "GET", name: "show" },
  //   { url: "objects/%name%", method: "POST", name: "create" },
  //   { url: "objects/%name%/[:id]", method: "PUT", name: "update" },
  //   { url: "objects/%name%/[:id]", method: "DELETE", name: "delete" },
  //   { url: "objects/%name%", method: "DELETE", name: "clear" },
  // ],

  getApiEndpoint(name: string, model?: Partial<Model> | null): ApiEndpoint {
    const endpoint = this.schema.apiEndpoints.get(name)
    if (!endpoint) {
      return null
    }
    const url = endpoint.url.replace(/\[:(\w+)\]/g, (_, key) => {
      return model && model[key] !== undefined ? model[key] : `[:${key}]`
    })
    const base = addTrailingSlash(this.schema.apiBaseUrl || mapsvgCore.routes.api)
    return {
      url: base + removeLeadingSlash(url),
      method: endpoint.method,
      name: endpoint.name,
    }
  }

  init() {
    this.events = new Events({
      context: this,
      contextName: "repository",
      map: this.map,
      parent: this.map?.events,
    })
    this.events.trigger(RepositoryEvent.AFTER_INIT, { repository: this })
  }

  setNoFiltersNoLoad(value: boolean): void {
    this.noFiltersNoLoad = value
  }

  setSchema(schema: Schema | string): void {
    if (schema instanceof Schema) {
      this.schema = schema
      this.schema.events.on(SchemaEventType.UPDATE, () => this.find(undefined, { automatic: true }))
    } else {
      const load = async () => {
        const { useRepository } = await import("@/Core/useRepository")
        const schemaRepo = useRepository("schemas", this.map)

        schemaRepo.find({ filters: { name: schema } }).done((response) => {
          const schema = response.items[0]
          if (!schema) {
            console.error(
              "[CLIENT-026] Schema not found. Read more: https://mapsvg.com/docs/errors#CLIENT-026",
            )
            return
          }
          this.setSchema(schema)
          this.find()
        })
      }
      load()
    }
  }
  getSchema(): Schema {
    return this.schema
  }

  loadDataFromResponse(data: string | Record<string, any>, ctx: MapsvgCtx): void {
    data = this.middlewares.run(MiddlewareType.RESPONSE, [
      data,
      { ...ctx, repository: this, map: this.map },
    ])

    const dataFormatted = this.defaultResponseMiddleware(data, ctx)
    if (!hasRuntimeFeature("data_source_posts") && schemaUsesPostData(dataFormatted.schema ?? this.schema)) {
      dataFormatted.items = []
      dataFormatted.hasMore = false
      dataFormatted.count = 0
      delete dataFormatted[this.schema.objectNameSingular]
    }
    this.objects.clear()

    const keyPlural = this.schema.objectNamePlural

    this.events.trigger(RepositoryEvent.BEFORE_LOAD, { data: dataFormatted, repository: this })

    if ("items" in dataFormatted && typeof dataFormatted.items === "object") {
      dataFormatted.items.forEach((obj) => {
        this.objects.push(obj)
      })
      this.hasMore = dataFormatted.hasMore
      if (ctx?.request?.bindingRead && !ctx.request.sourceRead) {
        if (Number.isInteger(dataFormatted.perpage)) this.query.perpage = dataFormatted.perpage
        if (Number.isInteger(dataFormatted.page)) this.query.page = dataFormatted.page
      }
    } else {
      this.hasMore = false
    }

    this.loaded = true

    this.events.trigger(RepositoryEvent.AFTER_LOAD, { data, repository: this })
  }
  reload(options?: FindOptions): JQueryPromise<any> {
    const request = this.find(undefined, options)
    // Filter changes call reload() without a fail handler. Attach one so a
    // rejected request is not an uncaught promise after FAILED_LOAD fires.
    request.fail(() => undefined)
    return request
  }

  create(object: Record<string, unknown>): JQueryDeferred<any> {
    const defer = jQuery.Deferred()
    defer.promise()

    const data = {}
    data[this.schema.objectNameSingular] = this.encodeData(object)

    const request = this.getRequest("create", null, data)

    this.events.trigger(RepositoryEvent.BEFORE_CREATE, {
      object: data[this.schema.objectNameSingular],
    })

    this.server
      .post(request.url, request.data)
      .done((_data: string) => {
        const response = this.getResponse(_data, request)
        const object = response.data[this.schema.objectNameSingular]
        if (object) {
          this.objects.push(object)
          this.events.trigger(RepositoryEvent.AFTER_CREATE, { object })
          defer.resolve(object)
        } else {
          defer.reject(response)
        }
      })
      .fail((response) => {
        defer.reject(response)
      })

    return defer
  }

  findById(id: number | string, nocache = false): JQueryDeferred<any> {
    const defer = jQuery.Deferred()
    defer.promise()

    if (schemaUsesPostData(this.schema) && !hasRuntimeFeature("data_source_posts")) return defer.reject({ status: 403, message: "WordPress data sources require a paid add-on." })
    const request = this.getRequest("show", { id })
    let object

    if (!nocache) {
      object = this.objects.findById(id.toString())
    }
    if (!nocache && object) {
      defer.resolve(object)
    } else if (this.usesPageBindingTransport()) {
      this.readSourcePage({ filters: { id }, page: 1, perpage: 1 })
        .then(data => {
          const row = data.items?.find(item => String(item.id) === String(id))
          if (row) defer.resolve(row)
          else defer.reject({ error: "Object is not available in this Query." })
        }).catch(error => defer.reject(error))
    } else {
      this.server
        .get(request.url, request.data)
        .done((_data: string) => {
          const eventData = { data: _data, repository: this }
          const response = this.getResponse(_data, request)
          this.events.trigger(RepositoryEvent.AFTER_LOAD, {
            data: response.data,
            repository: this,
          })
          const object = response.data[this.schema.objectNameSingular]
          if (object) {
            defer.resolve(object)
          } else {
            defer.reject(response)
          }
        })
        .fail((response) => {
          defer.reject(response)
        })
    }

    return defer
  }

  getRequest(
    action: ApiEndpointName,
    urlParams: undefined | null | Record<string, string | number>,
    data = {},
  ): MapsvgRequest {
    const apiEndpoint = this.getApiEndpoint(action, urlParams)
    if (!apiEndpoint) {
      throw new Error(
        `API endpoint ${apiEndpoint} does not exists for repository '${this.schema.objectNamePlural}'`,
      )
    }
    const request: MapsvgRequest = {
      repository: this,
      url: apiEndpoint.url,
      action: apiEndpoint.name,
      method: apiEndpoint.method,
      data,
    }

    request.data = this.middlewares.run(MiddlewareType.REQUEST, [
      request.data,
      { request, repository: this, map: this.map },
    ])
    return request
  }

  getResponse(_data: string, request): MapsvgResponse {
    const response: MapsvgResponse = {
      data: _data,
    }

    response.data = this.middlewares.run(MiddlewareType.RESPONSE, [
      response.data,
      { request, response, repository: this, map: this.map },
    ])

    response.data = this.defaultResponseMiddleware(response.data, { request, response })
    return response
  }

  /** Fetch an adapted page without replacing this repository's live query or rows. */
  async readSourcePage(query: Record<string, any>): Promise<Record<string, any>> {
    const request = { ...this.getRequest("index", null, query), sourceRead: true }
    const { rpcRequest } = this.readTransport(request, request.data)
    const data = await rpcRequest
    return this.getResponse(data, request).data as Record<string, any>
  }

  private bindingSchemaRevision?: string
  private initialLoadDeferred = false

  private usesPageBindingTransport(): boolean {
    const role = this.map?.objectsRepository === this ? "objects" : this.map?.regionsRepository === this ? "regions" : null
    if (!role || !this.map?.globalQueriesEnabled) return false
    const binding = readPageBinding(this.map.options, role, this.map.activePageId)
    return !(this.schema?.type === "api" && ["getObjects", "getRegions"].includes(binding.queryId))
  }

  private readTransport(request: MapsvgRequest, query: Record<string, any>, optionsField?: string) {
    const role: BindingRole | null = this.map?.objectsRepository === this ? "objects" : this.map?.regionsRepository === this ? "regions" : null
    if (!role || !this.usesPageBindingTransport()) {
      return { rpcRequest: this.server.get(request.url, request.data) }
    }
    request.bindingRead = true
    const pageId = this.map.activePageId || initialBindingPageId(this.map.options)
    const binding = readPageBinding(this.map.options, role, pageId)
    const page = Math.max(1, Number(query.page) || 1)
    const params: Record<string, unknown> = {
      mapId: Number(this.map.id), pageId, role, page,
      withSchema: request.sourceRead === true || query.withSchema === true || !this.bindingSchemaRevision,
      ...(request.schemaOnly ? { schemaOnly: true } : {}),
      ...(this.bindingSchemaRevision ? { schemaRevision: this.bindingSchemaRevision } : {}),
      ...(optionsField ? { field: optionsField } : {}),
      runtime: { filters: query.filters || {}, search: query.search || "", searchField: query.searchField || "", searchFallback: Boolean(query.searchFallback) },
      ...(this.map.inBackend ? { editorBinding: binding } : {}),
      ...(!this.map.inBackend && this.map.extras.publishedVersionId !== undefined ? { versionId: this.map.extras.publishedVersionId } : {}),
    }
    // Detached domain/facet reads can request their own bounded page without
    // changing the live binding's pagination or current results.
    if (request.sourceRead && this.map.inBackend) params.editorBinding = {
      ...binding, perPage: Math.min(5000, Math.max(1, Number(query.perpage) || 5000)),
      pagination: { ...binding.pagination, on: true, perpage: Math.min(5000, Math.max(1, Number(query.perpage) || 5000)) },
    }
    const rpcUrl = this.server.getUrl("rpc").replace(/\/v1\//, "/v9/").replace(/([?&]rest_route=[^&]*)/, match => match.replace(/%2[Ff]v1%2[Ff]|\/v1\//, "/v9/"))
    const url = !this.map.inBackend ? withDraftPreview(rpcUrl, window.location.search, Number(this.map.id)) : rpcUrl
    const transportRevision = this.readRevision
    const identity = this.bindingIdentity()
    const rpcRequest = jQuery.Deferred((deferred) => {
      const rows: Record<string, any>[] = []
      const ids = new Set<string>()
      let first: any
      const read = (pageNumber: number) => this.server.post(url, {
        query: "getPageBinding", params: { ...params, page: pageNumber,
          ...(first ? { withSchema: false, schemaRevision: first.schemaRevision } : {}) },
      }, "json")
        .done((outcome: any) => {
          if (transportRevision !== this.readRevision || identity !== this.bindingIdentity()) { deferred.reject({ stale: true }); return }
          if (outcome.error) { deferred.reject(outcome.error); return }
          const result = outcome.result
          if (optionsField) { deferred.resolve(result.options); return }
          if (!request.sourceRead && result.page.paginated === false) {
            // Unpaged Regions still use bounded RPC chunks. Publish one complete
            // repository result; never briefly apply a truncated region dataset.
            if (!first && result.page.skip !== 0) { read(1); return }
            first ??= result
            if (result.bindingRevision !== first.bindingRevision || result.schemaRevision !== first.schemaRevision
              || result.count !== first.count || result.page.skip !== rows.length
              || (result.page.hasMore && result.rows.length === 0)) {
              deferred.reject({ code: "query_changed", message: "Region data changed while loading. Please reload." }); return
            }
            for (const row of result.rows) {
              const id = String(row.id)
              if (ids.has(id)) { deferred.reject({ code: "query_changed" }); return }
              ids.add(id); rows.push(row)
            }
            if (result.page.hasMore) { read(pageNumber + 1); return }
            if (rows.length !== result.count) { deferred.reject({ code: "query_changed" }); return }
            deferred.resolve({ items: rows, count: result.count, hasMore: false,
              page: 1, perpage: rows.length, ...(first.schema ? { schema: first.schema } : {}),
              schemaRevision: first.schemaRevision })
            return
          }
          if (first) { deferred.reject({ code: "query_changed" }); return }
          deferred.resolve({ items: result.rows, count: result.count, hasMore: result.page.hasMore,
            page, perpage: result.page.take, ...(result.schema ? { schema: result.schema } : {}),
            ...(result.schemaRevision ? { schemaRevision: result.schemaRevision } : {}) })
        }).fail(error => deferred.reject(error))
      read(page)
    }).promise()
    return { rpcRequest }
  }

  private readRevision = 0
  invalidateReads(resetSchema = false): void {
    this.readRevision++
    if (resetSchema) {
      this.bindingSchemaRevision = undefined
      if (this.usesPageBindingTransport()) this.schema.setFields([])
    }
  }
  private bindingIdentity(): string {
    const map = this.map
    if (!map?.globalQueriesEnabled) return "legacy"
    const role = map.objectsRepository === this ? "objects" : "regions"
    return JSON.stringify([map.activePageId, readPageBinding(map.options, role, map.activePageId)])
  }

  find(query?: Query | { [key: string]: any }, options?: FindOptions): JQueryDeferred<any> {
    const defer = jQuery.Deferred()
    defer.promise()
    const revision = ++this.readRevision
    const bindingIdentity = this.bindingIdentity()

    if (typeof query !== "undefined") {
      this.query.update(query)
    }

    const request = this.getRequest("index", null, this.query)
    if (schemaUsesPostData(this.schema) && !hasRuntimeFeature("data_source_posts")) {
      const response: MapsvgResponse = { data: { items: [], count: 0, hasMore: false } }
      this.loadDataFromResponse(response.data, { request, response })
      return defer.resolve(this.getLoaded())
    }

    if (request.data !== this.query) {
      this.query.update(request.data)
    }

    const silent = !!options?.silent
    const eventData = { query: this.query, repository: this, silent }

    this.events.trigger(RepositoryEvent.BEFORE_LOAD, eventData)

    // Update query if reference was changed
    if (eventData.query !== this.query) {
      if (!(eventData.query instanceof Query)) {
        eventData.query = new Query(eventData.query)
      }
      this.query = eventData.query
    }

    const role = this.map?.objectsRepository === this ? "objects" : "regions"
    const bindingTransport = this.usesPageBindingTransport()
    if (bindingTransport) {
      const binding = readPageBinding(this.map.options, role, this.map.activePageId)
      if (options?.initial) this.initialLoadDeferred = binding.disableOn.initialLoad
      else if (!options?.automatic) this.initialLoadDeferred = false
      if (this.initialLoadDeferred || (binding.disableOn.emptyFilters && !hasBindingFilters(this.query))) {
        // The result schema is needed even while rows are disabled. Once known,
        // filter clears/polling can publish an empty result without another RPC.
        request.schemaOnly = true
        if (this.bindingSchemaRevision) {
          request.bindingRead = true
          const response = { data: { items: [], count: 0, hasMore: false, page: 1 } }
          this.loadDataFromResponse(response.data, { request, response })
          defer.resolve(this.getLoaded())
          return defer
        }
      }
    }
    if (this.noFiltersNoLoad && !bindingTransport && !this.query.hasFilters()) {
      this.objects.clear()
      this.events.trigger(RepositoryEvent.AFTER_LOAD, { data: {}, repository: this, silent })
      defer.resolve(this.getLoaded())
      return defer
    }

    let schemaRequested = false
    if (this.schema.fields.length === 0) {
      this.query.update({ withSchema: true })
      schemaRequested = true
    }

    const { rpcRequest } = this.readTransport(request, this.query)

    rpcRequest
      .done((serverResponse: string) => {
        if (revision !== this.readRevision || bindingIdentity !== this.bindingIdentity()) { defer.reject({ stale: true }); return }
        if (schemaRequested) {
          this.query.update({ withSchema: false })
        }
        const response: MapsvgResponse = { data: serverResponse }
        this.loadDataFromResponse(response.data, { request, response })
        defer.resolve(this.getLoaded())
      })
      .fail((response) => {
        if (revision !== this.readRevision || bindingIdentity !== this.bindingIdentity()) { defer.reject({ stale: true }); return }
        this.events.trigger(RepositoryEvent.FAILED_LOAD, { response, repository: this })
        defer.reject(response)
      })

    return defer
  }

  getLoaded(): ArrayIndexed<T> {
    return this.objects
  }
  getLoadedObject(id: number | string): T {
    return this.objects.findById(id.toString())
  }
  getLoadedAsArray(): ArrayIndexed<T> {
    return this.objects
  }

  update(object: any): JQueryDeferred<T> {
    const defer = jQuery.Deferred()
    defer.promise()

    const data = {}
    const objectUpdatedFields = "getDirtyFields" in object ? object.getDirtyFields() : object
    const objectEncoded = this.encodeData(objectUpdatedFields)
    data[this.schema.objectNameSingular] = objectEncoded

    const request = this.getRequest("update", { id: objectUpdatedFields.id }, data)

    this.events.trigger(RepositoryEvent.BEFORE_UPDATE, {
      object: data[this.schema.objectNameSingular],
    })

    this.server
      .put(request.url, request.data)
      .done((_data: string) => {
        if ("clearDirtyFields" in object) {
          object.clearDirtyFields()
        }

        const response = this.getResponse(_data, request)
        defer.resolve(object)
        this.events.trigger(RepositoryEvent.AFTER_UPDATE, {
          object,
          updatedFields: objectEncoded,
        })
      })
      .fail((response, stat) => {
        defer.reject(response, stat)
      })
    return defer
  }

  delete(id: number): JQueryDeferred<void> {
    const defer = jQuery.Deferred()
    defer.promise()

    const request = this.getRequest("delete", { id })

    this.events.trigger(RepositoryEvent.BEFORE_DELETE, {
      object: { id, ...this.objects.findById(id) },
    })

    this.server
      .delete(request.url)
      .done((data: string) => {
        const response = this.getResponse(data, request)
        this.objects.delete(id.toString())
        this.events.trigger(RepositoryEvent.AFTER_DELETE, { repository: this, object: { id } })
        defer.resolve()
      })
      .fail((data) => {
        defer.reject(data)
      })

    return defer
  }

  clear(): JQueryDeferred<void> {
    const defer = jQuery.Deferred()
    defer.promise()

    const request = this.getRequest("clear", null)

    this.server
      .delete(request.url)
      .done((data: string) => {
        this.objects.clear()
        const response = this.getResponse(data, request)
        this.events.trigger(RepositoryEvent.AFTER_LOAD, { repository: this, data: this.objects })
        defer.resolve()
      })
      .fail((response) => {
        defer.reject(response)
      })

    return defer
  }

  onFirstPage(): boolean {
    return this.query.page === 1
  }

  onLastPage(): boolean {
    return this.hasMore === false
  }

  encodeData(params: any): { [key: string]: any } {
    return params
  }

  defaultResponseMiddleware(data, ctx?): Record<string, any> {
    let dataRaw

    const dataJSON = data

    if (typeof dataJSON === "string") {
      dataRaw = JSON.parse(dataJSON)
    } else {
      dataRaw = { ...dataJSON }
    }

    if ("items" in dataRaw && "hasMore" in dataRaw) {
      const { items, schema, hasMore } = dataRaw
      let rowSchema = this.schema
      if (schema) {
        if (ctx?.request?.bindingRead) {
          rowSchema = new Schema(schema)
          if (!ctx.request.sourceRead) {
            this.setSchema(rowSchema)
            this.bindingSchemaRevision = dataRaw.schemaRevision
          }
        } else if (!ctx?.request?.sourceRead) this.schema.update(schema)
      }
      if (items && Array.isArray(items) && items.length > 0) {
        const testItem = items[0]
        if ("objectNamePlural" in testItem) {
          dataRaw.items = items.map((obj) => new Schema(obj))
        } else {
          dataRaw.items = items.map((obj) => new Model(obj, rowSchema))
        }
      }
    } else {
      if ("schema" in dataRaw) {
        dataRaw.schema = new Schema(dataRaw.schema)
      }
      if (this.schema.objectNameSingular in dataRaw) {
        dataRaw[this.schema.objectNameSingular] = new Model(
          dataRaw[this.schema.objectNameSingular],
          this.schema,
        )
      }
    }

    return dataRaw
  }

  /** Optional module API retained for legacy consumers; no import implementation in core. */
  private importModuleMethod(name: string, args: unknown[]) {
    const module = window.MapSVG?.extensions?.get<Record<string, (...args: any[]) => any>>("runtime.component", "collection-import")
    if (!module?.[name]) throw new Error("Collection Import module is unavailable")
    return module[name].apply(this, args)
  }

  getImportSettings(force = false): JQueryDeferred<any> { return this.importModuleMethod("getImportSettings", [force]) }

  updateImportSettings(fields: Record<string, any>): JQueryDeferred<any> { return this.importModuleMethod("updateImportSettings", [fields]) }

  /**
   * Sends one batch of CSV rows to the server.
   * Chunking and sequencing are handled by the controller (pause/resume on PapaParse parser).
   */
  import(data: { [key: string]: any }, convertLatlngToAddress: boolean, map: MapSVGMap) { return this.importModuleMethod("import", [data, convertLatlngToAddress, map]) }

  /**
   * Tells the server to download a remote CSV and enqueue it as an import job.
   * Returns a jQuery Promise resolving to { token, total } (async job) or { count } (legacy sync).
   */
  importFromUrl(
    csvUrl: string,
    options?: {
      convertLatlngToAddress?: number
      convertAddressToLatLng?: number
      paidGeocoding?: number
    },
  ): JQueryPromise<any> { return this.importModuleMethod("importFromUrl", [csvUrl, options]) }

  /**
   * Processes one chunk of an in-progress import job.
   * Returns a jQuery Promise resolving to { status, processed, total, errors?, error_count?, geocoding_queued? }.
   */
  importCsvProcess(token: string): JQueryPromise<any> { return this.importModuleMethod("importCsvProcess", [token]) }

  formatCSV(data: { [key: string]: any }, map: MapSVGMap) { return this.importModuleMethod("formatCSV", [data, map]) }

  async getOptionsByField(fieldName: string): Promise<any> {
    if (this.map?.globalQueriesEnabled && this.map.inBackend && (this.map.objectsRepository === this || this.map.regionsRepository === this)) {
      const request = this.getRequest("index", null, {})
      const { rpcRequest } = this.readTransport(request, {}, fieldName)
      return await rpcRequest
    }
    const [parentFieldName, ...nestedFields] = fieldName.split(".")
    const schemaField = this.schema.getField(parentFieldName)
    if (!schemaField) {
      return new Promise((resolve) => {
        resolve([])
      })
    }
    switch (schemaField.type) {
      case "region":
      case "relation": {
        const options = schemaField.options
          .sort(function (a, b) {
            if (a.title < b.title) return -1
            if (a.title > b.title) return 1
            return 0
          })
          .map(function (o) {
            return { label: o.title, value: o.id }
          })
        return new Promise((resolve) => {
          resolve(options)
        })
      }
      case "status":
      case "select":
      case "radio":
      case "checkboxes":
        return new Promise((resolve) => {
          resolve(schemaField.options)
        })
      case "post": {
        const postType = schemaField.post_type
        const { useRepository } = await import("@/Core/useRepository")
        const postTypeRepository = useRepository(["postTypes", postType], this.map)

        return postTypeRepository.getOptionsByField(nestedFields.join("."))
      }
      default: {
        if (nestedFields.length > 0) {
          console.error(
            "[CLIENT-028] Nested fields are not supported for this field type: " +
              fieldName +
              ". Read more: https://mapsvg.com/docs/errors#CLIENT-028",
          )
          return new Promise((resolve) => {
            resolve([])
          })
        }
        const request = this.getRequest("distinct", { fieldName: parentFieldName })
        return new Promise((resolve, reject) => {
          this.server
            .get(request.url)
            .done((response) => {
              const data = response.items.map((item) => {
                return {
                  label: item,
                  value: item,
                }
              })
              resolve(data)
            })
            .fail(reject)
        })
      }
    }
  }
}
