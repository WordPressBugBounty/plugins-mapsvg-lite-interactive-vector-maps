import { textElement } from "@/Core/textElement"
/**
 * FiltersController class adds filters for the database.
 * @param options
 * @constructor
 */
import { ControllerOptions } from "@/Core/Controller.js"
import { BaseEventHandler } from "@/Core/Events.js"
import { DetailsController, DetailsViewOptions } from "../Details/Details.js"
import { FormBuilder } from "../FormBuilder/FormBuilder.js"
import { Query } from "../Infrastructure/Server/Query.js"
import { Schema } from "../Infrastructure/Server/Schema.js"
import "./filters.css"
import { FilterOptions } from "@/Map/OptionsInterfaces/MapOptions.js"
import { parseBoolean, setNestedProperty } from "@/Core/Utils.js"
import { isRelationFieldType } from "@/Infrastructure/Server/SchemaField"
import { filterFormValue, filterQueryValue } from "./filterValue"
const $ = jQuery

export enum FiltersEvent {
  CLICK_SHOW_FILTERS = "click.btnShowFilters",
  CLICK_SEARCH = "click.btnSearch",
}

interface FiltersOptions extends DetailsViewOptions {
  schema: Schema
  hideFilters: boolean
  query: Query
  modal?: boolean
  modalLocation: string
  hideOnMobile: boolean
  showButtonText: string
  clearButton: boolean
  clearButtonText: string
  searchButton: boolean
  searchButtonText: string
  events: ControllerOptions["events"] & {
    [K in FiltersEvent]?: BaseEventHandler
  }
}

export class FiltersController extends DetailsController {
  schema: Schema
  hideFilters: boolean
  query: Query
  modal: boolean
  modalLocation: string
  hideOnMobile: boolean
  hide: boolean
  showButtonText: string
  clearButton: boolean
  clearButtonText: string
  searchButton: boolean
  searchButtonText: string
  formBuilder: FormBuilder

  constructor(options: FiltersOptions) {
    super(options)

    this.name = "filters"
    this.classList = [
      "mapsvg-controller-container",
      "mapsvg-filters-wrap",
      "mapsvg-filters-container",
      "mapsvg-controller-no-padding",
    ]
    this.position = "relative"
    this.closable = false
    this.withToolbar = false

    this.showButtonText = options.showButtonText
    this.clearButton = options.clearButton
    this.clearButtonText = options.clearButtonText
    this.searchButton = options.searchButton
    this.searchButtonText = options.searchButtonText
    this.schema = options.schema
    this.modal = options.modal ?? false
    this.hideFilters = options.hideFilters
    this.query = options.query
  }

  /** Filters belong to their selected Page source, independently of Directory. */
  private isRelationFilter(field: string): boolean {
    const repository = this.map.getComponentBindingRole("filters") === "regions"
      ? this.map.regionsRepository : this.map.objectsRepository
    return isRelationFieldType(repository?.getSchema()?.getField(field)?.type)
  }

  private relationIds(value: any): string[] {
    const table = this.map.regionsRepository.getSchema().name
    if (value && !Array.isArray(value) && Array.isArray(value.region_ids)) {
      if (value.table_name && value.table_name !== table) return []
      value = value.region_ids
    }
    const ids = (Array.isArray(value) ? value : [value]).flatMap(item => {
      if (item && typeof item === "object") {
        if (item.tableName && item.tableName !== table) return []
        item = item.value ?? item.id
      }
      return (typeof item === "string" && item !== "") || (typeof item === "number" && Number.isFinite(item))
        ? [String(item)] : []
    })
    return Array.from(new Set(ids))
  }

  /** Restore the value shape each native control accepts, including first mount. */
  private formData(query: Query): Record<string, any> {
    const data = Object.fromEntries(Object.entries(query.filters || {}).map(([key, value]) => [key, filterFormValue(value)]))
    for (const field of this.schema.getFields()) {
      const parts = (field.parameterName || field.name || "").split(".")
      if (parts.length > 1) parts.shift()
      const name = parts[0] + parts.slice(1).map(part => `[${part}]`).join("")
      if (!this.isRelationFilter(name)) continue
      const ids = this.relationIds(data[name])
      if (isRelationFieldType(field.type) || field.type === "checkboxes") data[name] = ids
      else if (field.type === "select" && parseBoolean(field.multiselect)) {
        data[name] = ids.map(value => ({ value, label: field.options?.find(option => String(option.value) === value)?.label || value }))
      } else data[name] = ids[0] ?? null
    }
    return { ...data, search: query.search }
  }

  viewDidRedraw(): void {
    super.viewDidLoad()

    this.formBuilder && this.formBuilder.destroy()
    this.formBuilder = new FormBuilder({
      container: this.containers.contentView,
      filtersMode: true,
      schema: this.schema,
      modal: this.modal,
      filtersHide: this.hideFilters,
      showButtonText: this.showButtonText,
      clearButton: this.clearButton,
      clearButtonText: this.clearButtonText,
      searchButton: this.searchButton,
      searchButtonText: this.searchButtonText,
      editMode: false,
      mapsvg: this.map,
      data: this.formData(this.query),
      admin: false,
      parent: this,
      events: {
        "change.formElement": (event) => {
          const { formElement, field } = event.data
          let value = event.data.value === undefined ? null : JSON.parse(JSON.stringify(event.data.value))

          if (formElement.type === "search") {
            this.query.page = 1
            this.query.setSearch(value)
          } else {
            const filters: any = {}

            if (value == null || value.length === 0 || (formElement.type === "checkbox" && value === false)) {
              value = null
            }

            if (this.isRelationFilter(field) || isRelationFieldType(formElement.type)) {
              const ids = this.relationIds(value)
              value = ids.length ? { table_name: this.map.regionsRepository.getSchema().name, region_ids: ids } : null
            } else if (
              field === "distance" &&
              (!value?.geoPoint || value.geoPoint.lat == null || value.geoPoint.lng == null)
            ) {
              value = null
            }

            setNestedProperty(filters, field, filterQueryValue(formElement.filterOperator, value))
            this.query.page = 1
            this.query.setFilters(filters)
          }
        },
        clear: (event) => {
          const { formElement, field, value } = event.data
          this.query.page = 1
          this.query.clearFilters()
        },
        afterLoad: (event) => {
          const { formElement, field, value } = event.data
          this.updateScroll()
        },
      },
    })
    this.formBuilder.init()
  }

  reset(): void {
    this.formBuilder && this.formBuilder.reset()
  }

  update(query: Query): void {
    this.formBuilder && this.formBuilder.update(this.formData(query))
  }

  /**
   * Sets filters counter on the "Show filters" button when compact mode is enabled and filters are hidden
   */
  setFiltersCounter(): void {
    if (this.hideFilters) {
      // Don't include "search" filter into counter since it's always outside of the modal
      const filtersCounter = Object.keys(this.query.filters).length

      const filtersCounterString = filtersCounter === 0 ? "" : filtersCounter.toString()
      const button = this.formBuilder?.showFiltersButton?.domElements.main.querySelector("button")
      if (button) {
        button.replaceChildren(
          document.createTextNode(this.showButtonText + " "),
          textElement("b", "", filtersCounterString),
        )
      }
    }
  }

  setEventHandlers(): void {
    super.setEventHandlers()

    const _this = this

    $(this.containers.view).on("click", ".mapsvg-btn-show-filters", function () {
      _this.events.trigger(FiltersEvent.CLICK_SHOW_FILTERS)
    })
    $(this.containers.view).on("click", "#mapsvg-search-container button", function () {
      _this.events.trigger(FiltersEvent.CLICK_SEARCH)
    })
  }
}
