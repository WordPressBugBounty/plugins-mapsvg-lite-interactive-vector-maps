import type { FormFieldData, FormFieldDefinitionRegistry } from "./types"

export const BASE_FIELD_DEFAULTS = Object.freeze({
  db_type: "varchar(255)",
  label: "",
  name: "",
  renamable: true,
  visible: true,
  hiddenOnTable: false,
  searchable: false,
  readonly: false,
  protected: false,
})

const DEFAULT_OPTIONS = Object.freeze([
  Object.freeze({ label: "Option one", name: "option_one", value: 1 }),
  Object.freeze({ label: "Option two", name: "option_two", value: 2 }),
])

function normalizeSelect(field: FormFieldData): FormFieldData {
  const multiselect = normalizeBoolean(field.multiselect) ?? false
  const searchable = normalizeBoolean(field.searchable) ?? false

  return {
    ...field,
    searchable,
    multiselect,
    db_type: multiselect ? "text" : "varchar(255)",
  }
}

function normalizeStatus(field: FormFieldData): FormFieldData {
  return {
    ...field,
    label: field.label || "Status",
    name: "status",
  }
}

function normalizeSearch(field: FormFieldData): FormFieldData {
  return {
    ...field,
    name: "search",
    parameterName: "search",
    parameterNameShort: "search",
    searchFallback: normalizeBoolean(field.searchFallback) ?? false,
    width: field.width || "100%",
  }
}

function normalizeDistance(field: FormFieldData): FormFieldData {
  const options = Array.isArray(field.options)
    ? field.options
        .filter(
          (option) => option && typeof option === "object" && String(option.value ?? "") !== "",
        )
        .map((option) => ({
          ...option,
          default: normalizeBoolean(option.default) ?? false,
        }))
    : []

  if (options.length && !options.some((option) => option.default)) {
    options[0].default = true
  } else {
    let defaultSeen = false
    options.forEach((option) => {
      if (option.default && !defaultSeen) {
        defaultSeen = true
      } else if (option.default) {
        option.default = false
      }
    })
  }

  const normalized: FormFieldData = {
    ...field,
    name: "distance",
    parameterName: "Object.distance",
    parameterNameShort: "distance",
    distanceControl: field.distanceControl || "select",
    distanceUnits: field.distanceUnits || "km",
    distanceUnitsLabel: field.distanceUnitsLabel || "km",
    fromLabel: field.fromLabel || "from",
    placeholder: field.placeholder || field.addressFieldPlaceholder || "Address",
    addressField: field.addressField !== false,
    addressFieldPlaceholder: field.placeholder || field.addressFieldPlaceholder || "Address",
    userLocationButton: normalizeBoolean(field.userLocationButton) ?? false,
    searchByZip: normalizeBoolean(field.searchByZip) ?? false,
    zipLength: Number.parseInt(String(field.zipLength ?? 5), 10) || 5,
    options,
  }

  if (normalized.distanceControl === "none" && options.length) {
    normalized.distanceDefault = options.find((option) => option.default)?.value
  }

  return normalized
}

function normalizeBoolean(value: unknown): boolean | undefined {
  switch (String(value).toLowerCase()) {
    case "on":
    case "true":
    case "1":
    case "yes":
    case "y":
      return true
    case "off":
    case "false":
    case "0":
    case "no":
    case "n":
      return false
    default:
      return undefined
  }
}

export const FORM_FIELD_DEFINITIONS: FormFieldDefinitionRegistry = Object.freeze({
  text: {
    type: "text",
    defaults: { db_type: "varchar(255)" },
  },
  textarea: {
    type: "textarea",
    defaults: { db_type: "text", searchType: "fulltext" },
  },
  checkbox: {
    type: "checkbox",
    defaults: { db_type: "tinyint(1)", showAsSwitch: true },
  },
  checkboxes: {
    type: "checkboxes",
    defaults: { db_type: "text", options: DEFAULT_OPTIONS },
  },
  radio: {
    type: "radio",
    defaults: { options: DEFAULT_OPTIONS },
  },
  select: {
    type: "select",
    defaults: { multiselect: false, options: DEFAULT_OPTIONS },
    normalize: normalizeSelect,
  },
  date: {
    type: "date",
    defaults: { db_type: "varchar(50)" },
  },
  status: {
    type: "status",
    defaults: { label: "Status", name: "status", options: DEFAULT_OPTIONS },
    normalize: normalizeStatus,
  },
  title: {
    type: "title",
    defaults: { db_type: "varchar(255)" },
  },
  colorpicker: {
    type: "colorpicker",
    defaults: { db_type: "varchar(255)" },
  },
  id: {
    type: "id",
  },
  image: {
    type: "image",
    defaults: {
      db_type: "text",
      label: "Images",
      name: "images",
      button_text: "Browse...",
    },
  },
  post: {
    type: "post",
    defaults: {
      db_type: "int(11)",
      label: "WP Post",
      name: "post",
      post_type: "post",
    },
  },
  region: {
    type: "region",
    defaults: {
      db_type: "text",
      label: "Regions",
      name: "regions",
    },
  },
  relation: {
    type: "relation",
    defaults: {
      db_type: "text",
      label: "Regions",
      name: "regions",
    },
  },
  location: {
    type: "location",
    defaults: {
      db_type: "text",
      label: "Location",
      name: "location",
      language: "",
      defaultMarkerPath: "",
      markersByField: {},
      markerField: "",
      markersByFieldEnabled: false,
    },
  },
  search: {
    type: "search",
    defaults: {
      label: "",
      name: "search",
      parameterName: "search",
      parameterNameShort: "search",
      placeholder: "",
      searchFallback: false,
      width: "100%",
    },
    normalize: normalizeSearch,
  },
  distance: {
    type: "distance",
    defaults: {
      label: "Search radius",
      name: "distance",
      parameterName: "Object.distance",
      parameterNameShort: "distance",
      distanceControl: "select",
      distanceUnits: "km",
      distanceUnitsLabel: "km",
      fromLabel: "from",
      placeholder: "Address",
      addressField: true,
      addressFieldPlaceholder: "Address",
      userLocationButton: false,
      language: "",
      country: "",
      searchByZip: false,
      zipLength: 5,
      options: [
        { value: "10", default: true },
        { value: "30", default: false },
        { value: "50", default: false },
        { value: "100", default: false },
      ],
    },
    normalize: normalizeDistance,
  },
})
