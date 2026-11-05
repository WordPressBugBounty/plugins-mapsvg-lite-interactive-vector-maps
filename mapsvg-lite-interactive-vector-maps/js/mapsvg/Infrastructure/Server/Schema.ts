import { mapsvgCore } from "@/Core/Mapsvg"
import { throttle, ucfirst } from "@/Core/Utils"
import { ArrayIndexed } from "../../Core/ArrayIndexed"
import { Events } from "../../Core/Events"
import { isRelationFieldType, SchemaField, SchemaFieldProps } from "./SchemaField"
import { SchemaModel } from "./SchemaModel"

export type HTTPMethod = "POST" | "GET" | "DELETE" | "PUT"

export type ApiEndpoint = {
  method: HTTPMethod
  url: string
  name: ApiEndpointName
}

export type ApiEndpointName =
  | "index"
  | "show"
  | "get"
  | "update"
  | "create"
  | "delete"
  | "clear"
  | string

export type ApiEndpoints = ArrayIndexed<ApiEndpoint>

export type SchemaType = "object" | "post" | "api" | "schema" | "region" | "map"
export interface SchemaOptions {
  id?: number
  type?: SchemaType
  name?: string
  title?: string
  fields?: SchemaFieldProps[]
  apiEndpoints?: ApiEndpoints
  apiBaseUrl?: string
  authorization?: AuthorizationCredentials
  objectNameSingular: string
  objectNamePlural: string
  strict?: boolean
  remote?: boolean
  primaryKeyField?: string
  postType?: string
  regionSupport?: number
  markerSupport?: number
  bindings?: SchemaBindings | null
  zodSettings?: ZodSettings | null
}

export type ZodSettings = {
  version: 1
  jsonSchema: string
  writeValidation?: "off"
  [key: string]: unknown
}

export type SchemaSvgBinding = {
  match: "elementId"
  source: "primaryKey"
}

export type SchemaBindings = {
  svg?: SchemaSvgBinding
}

export enum SchemaEventType {
  UPDATE = "update",
}

const defaultSchemaOptions: Partial<SchemaOptions> = {
  strict: true,
  type: "object",
}

function getDefaultApiEndpoints(type: SchemaType): ApiEndpoint[] {
  if (type === "post" || type === "object") {
    return [
      { url: "/objects/%name%", method: "GET", name: "index" },
      { url: "/objects/%name%/[:id]", method: "GET", name: "show" },
      { url: "/objects/%name%", method: "POST", name: "create" },
      { url: "/objects/%name%/[:id]", method: "PUT", name: "update" },
      { url: "/objects/%name%/[:id]", method: "DELETE", name: "delete" },
      { url: "/objects/%name%/[:id]/import", method: "POST", name: "import" },
      { url: "/objects/%name%", method: "DELETE", name: "clear" },
    ]
  } else if (type === "region") {
    return [
      { url: "/regions/%name%", method: "GET", name: "index" },
      { url: "/regions/%name%/[:id]", method: "GET", name: "show" },
      { url: "/regions/%name%", method: "POST", name: "create" },
      { url: "/regions/%name%/[:id]", method: "PUT", name: "update" },
      { url: "/regions/%name%/[:id]/import", method: "POST", name: "import" },
      { url: "/regions/%name%/[:id]", method: "DELETE", name: "delete" },
    ]
  }
  return []
}

export type AuthorizationCredentials = { type: "Bearer" | "Basic"; token: string }

/**
 * Schema class contains the list of fields with their options for MapSVG database or regions tables
 */
export class Schema {
  id: number
  type: SchemaType
  name: string
  title?: string
  fields?: ArrayIndexed<SchemaField>
  lastChangeTime: number
  events: Events
  apiEndpoints?: ApiEndpoints
  apiBaseUrl: string
  authorization?: AuthorizationCredentials
  objectNameSingular: string
  objectNamePlural: string
  strict: boolean
  remote: boolean
  model: SchemaModel
  primaryKeyField?: string
  postType?: string
  regionSupport?: number
  markerSupport?: number
  bindings?: SchemaBindings | null
  zodSettings?: ZodSettings | null
  constructor(options: SchemaOptions) {
    this.fields = new ArrayIndexed("name")
    this.apiEndpoints = new ArrayIndexed("name")
    const _options = { ...defaultSchemaOptions, ...options }

    const { name, type, ...rest } = _options
    this.setName(name)
    this.setType(type)

    this.build(rest)

    this.lastChangeTime = Date.now()
    this.events = new Events({
      context: this,
      contextName: "schema",
    })
  }

  setAuthorization(credentials: AuthorizationCredentials) {
    this.authorization = credentials
  }

  setApiEndpoints(endpoints: ApiEndpoint[]): ApiEndpoints {
    this.apiEndpoints.clear()
    if (endpoints) {
      this.apiEndpoints.push(...endpoints)
    }
    return this.apiEndpoints
  }

  setApiBaseUrl(url: string): void {
    if (url) {
      this.apiBaseUrl = url.replace(/\/+$/, "")
    }
  }

  setObjectNameSingular(nameSingular: string) {
    this.objectNameSingular = nameSingular
  }

  setObjectNamePlural(namePlural: string) {
    this.objectNamePlural = namePlural
  }

  build(options: Partial<SchemaOptions> & { [key: string]: any }) {
    if (!options) return
    Object.keys(options).forEach((key) => {
      const setter = `set${ucfirst(key)}`
      if (typeof this[setter] === "function") {
        this[setter](options[key])
      }
    })
  }

  setPostType(postType: string) {
    this.postType = postType
  }

  setRegionSupport(value: number | boolean) {
    this.regionSupport = value ? 1 : 0
  }

  setMarkerSupport(value: number | boolean) {
    this.markerSupport = value ? 1 : 0
  }

  static defaultSvgBindings(): SchemaBindings {
    return {
      svg: {
        match: "elementId",
        source: "primaryKey",
      },
    }
  }

  setBindings(value: SchemaBindings | string | null | undefined) {
    if (value == null || value === "") {
      this.bindings = null
      return
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value)
        this.bindings = parsed && typeof parsed === "object" ? parsed : null
      } catch {
        this.bindings = null
      }
      return
    }
    this.bindings = value
  }

  setZodSettings(value: ZodSettings | string | null | undefined) {
    if (value == null || value === "") {
      this.zodSettings = null
      return
    }

    let parsed: unknown = value
    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value)
      } catch {
        throw new Error("Invalid zodSettings: expected a JSON object.")
      }
    }

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Invalid zodSettings: expected an object.")
    }

    const settings = parsed as Record<string, unknown>
    if (settings.version !== 1) {
      throw new Error("Invalid zodSettings: version must be 1.")
    }
    if (typeof settings.jsonSchema !== "string") {
      throw new Error("Invalid zodSettings: jsonSchema must be a JSON string.")
    }

    let jsonSchema: unknown
    try {
      jsonSchema = JSON.parse(settings.jsonSchema)
    } catch {
      throw new Error("Invalid zodSettings: jsonSchema must contain a JSON Schema object.")
    }
    if (!jsonSchema || typeof jsonSchema !== "object" || Array.isArray(jsonSchema)) {
      throw new Error("Invalid zodSettings: jsonSchema must contain a JSON Schema object.")
    }
    if (settings.writeValidation !== undefined && settings.writeValidation !== "off") {
      throw new Error('Invalid zodSettings: writeValidation may only be "off".')
    }

    this.zodSettings = { ...(settings as ZodSettings) }
  }

  ensureSvgBinding() {
    if (this.hasExplicitSvgBinding()) {
      return
    }
    const bindings = this.bindings && typeof this.bindings === "object" ? { ...this.bindings } : {}
    bindings.svg = Schema.defaultSvgBindings().svg
    this.bindings = bindings
  }

  hasExplicitSvgBinding(): boolean {
    return !!(this.bindings && this.bindings.svg)
  }

  /**
   * Prefer bindings.svg; fall back to type === "region" for legacy schemas.
   */
  hasSvgBinding(): boolean {
    if (this.hasExplicitSvgBinding()) {
      return true
    }
    return this.type === "region"
  }

  setType(val: SchemaType) {
    this.type = val

    const typesWithDefaultApi = ["region", "object", "post"]

    if (typesWithDefaultApi.includes(this.type)) {
      const endpoints = getDefaultApiEndpoints(this.type).map((endpoint) => ({
        ...endpoint,
        url: endpoint.url.replace("%name%", this.name),
      }))
      this.setApiEndpoints(endpoints)
      this.setApiBaseUrl(mapsvgCore.routes.api.replace(/\/+$/, ""))
    }
    if (this.type === "region") {
      this.ensureSvgBinding()
    }
  }

  update(options) {
    this.build(options)
  }

  setRemote(value: boolean) {
    this.remote = value
  }

  setStrict(value: boolean) {
    this.strict = value
  }

  setPrimaryKeyField(name: string) {
    this.primaryKeyField = name
  }

  getPrimaryKeyFieldName(): string {
    if (this.fields && this.fields.length > 0) {
      const idField = this.fields.find((f) => f.type && f.type.toLowerCase() === "id")
      if (idField) {
        return idField.name
      }
    }
    return this.primaryKeyField || "id"
  }

  setId(id: number) {
    this.id = id
  }
  setTitle(title: string) {
    this.title = title
  }
  setName(name: string) {
    this.name = name
  }

  loaded() {
    return this.fields.length !== 0
  }

  setFields(fields: any[]) {
    if (fields) {
      this.fields.clear()

      fields.forEach((fieldParams) => {
        this.fields.push(new SchemaField(fieldParams))
      })
    }
  }

  addField(field: SchemaField | Record<string, unknown>) {
    const fieldFinal = field instanceof SchemaField ? field : new SchemaField(field)
    this.fields.push(fieldFinal)
    throttle(this.events.trigger, 500, this, [SchemaEventType.UPDATE, { schema: this }])
  }

  getFields(): ArrayIndexed<SchemaField> {
    return this.fields
  }

  getFieldNames(): Array<string> {
    return this.fields.map((f) => f.name)
  }
  getField(field) {
    return this.fields.findById(field)
  }
  getFieldByType(type) {
    let f = null
    const matchRelationAlias = isRelationFieldType(type)
    this.fields.forEach(function (field) {
      if (field.type === type) {
        f = field
      } else if (matchRelationAlias && isRelationFieldType(field.type)) {
        f = field
      }
    })
    return f
  }
  getRelationFields() {
    return this.fields.filter((field) => isRelationFieldType(field.type))
  }
  getColumns(filters) {
    filters = filters || {}

    const columns = this.fields

    const needfilters = Object.keys(filters).length !== 0
    let results = []

    if (needfilters) {
      let filterpass
      columns.forEach(function (obj) {
        filterpass = true
        for (const param in filters) {
          filterpass = obj[param] == filters[param]
        }
        filterpass && results.push(obj)
      })
    } else {
      results = columns
    }

    return results
  }

  getData() {
    const data = {
      id: this.id,
      title: this.title,
      name: this.name,
      fields: this.fields,
      type: this.type,
      authorization: this.authorization,
      apiEndpoints: this.apiEndpoints,
      apiBaseUrl: this.apiBaseUrl,
      objectNamePlural: this.objectNamePlural,
      objectNameSingular: this.objectNameSingular,
      remote: this.remote,
      primaryKeyField: this.primaryKeyField,
      postType: this.postType,
      regionSupport: this.regionSupport,
      markerSupport: this.markerSupport,
      bindings: this.bindings,
      zodSettings: this.zodSettings,
    }
    return data
  }
}
