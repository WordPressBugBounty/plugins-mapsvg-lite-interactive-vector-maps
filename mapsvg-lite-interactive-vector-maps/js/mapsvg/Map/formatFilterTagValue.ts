export type FilterTagFieldOption = {
  value?: unknown
  label?: string
  id?: string
  title?: string
}

export type FilterTagField = {
  type?: string
  multiselect?: boolean
  options?: FilterTagFieldOption[]
}

export type FormatFilterTagValueOptions = {
  filterField?: FilterTagField | null
  getRegionLabel?: (regionId: string) => string | undefined
}

export type FormatFilterTagChipOptions = FormatFilterTagValueOptions & {
  fieldLabel?: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function findOptionLabel(options: FilterTagFieldOption[] | undefined, value: unknown): string {
  if (!options) {
    return ""
  }

  const option = options.find((item) => {
    if (item.value === value) {
      return true
    }
    if (item.id != null && String(item.id) === String(value)) {
      return true
    }
    return false
  })

  if (!option) {
    return ""
  }

  if (option.label != null && option.label !== "") {
    return String(option.label)
  }
  if (option.title != null && option.title !== "") {
    return String(option.title)
  }
  return ""
}

function resolveRegionLabel(
  regionId: string,
  options: FormatFilterTagValueOptions,
): string {
  const fromMap = options.getRegionLabel?.(regionId)
  if (fromMap) {
    return fromMap
  }

  const fromFilterOptions = findOptionLabel(options.filterField?.options, regionId)
  if (fromFilterOptions) {
    return fromFilterOptions
  }

  return regionId
}

function formatGenericValue(value: unknown): string {
  if (value == null || value === "") {
    return ""
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value)
  }

  if (Array.isArray(value)) {
    return value.map(formatGenericValue).filter(Boolean).join(", ")
  }

  if (isRecord(value)) {
    if (value.label != null && value.label !== "") {
      return String(value.label)
    }
    if (value.title != null && value.title !== "") {
      return String(value.title)
    }
    if (value.value != null) {
      return formatGenericValue(value.value)
    }
    return ""
  }

  return String(value)
}

function formatRegionsValue(fieldValue: unknown, options: FormatFilterTagValueOptions): string {
  if (typeof fieldValue === "string" || typeof fieldValue === "number") {
    return resolveRegionLabel(String(fieldValue), options)
  }

  if (Array.isArray(fieldValue)) {
    return fieldValue
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return resolveRegionLabel(String(item), options)
        }
        if (isRecord(item)) {
          if (item.title != null && item.title !== "") {
            return String(item.title)
          }
          if (item.label != null && item.label !== "") {
            return String(item.label)
          }
          if (item.id != null) {
            return resolveRegionLabel(String(item.id), options)
          }
          if (item.value != null) {
            return resolveRegionLabel(String(item.value), options)
          }
        }
        return ""
      })
      .filter(Boolean)
      .join(", ")
  }

  if (isRecord(fieldValue) && Array.isArray(fieldValue.region_ids)) {
    return fieldValue.region_ids
      .map((id) => resolveRegionLabel(String(id), options))
      .filter(Boolean)
      .join(", ")
  }

  return formatGenericValue(fieldValue)
}

function isRegionsFilterValue(fieldName: string, fieldValue: unknown): boolean {
  if (fieldName === "regions") {
    return true
  }

  return isRecord(fieldValue) && Array.isArray(fieldValue.region_ids)
}

/**
 * Formats a query filter value for the Directory filter-tag chip.
 * Region clicks store `{ table_name, region_ids }`, which must not stringify as `[object Object]`.
 */
export function formatFilterTagValue(
  fieldName: string,
  fieldValue: unknown,
  options: FormatFilterTagValueOptions = {},
): string {
  if (fieldValue == null || fieldValue === "") {
    return ""
  }

  if (isRegionsFilterValue(fieldName, fieldValue)) {
    return formatRegionsValue(fieldValue, options)
  }

  const filterField = options.filterField
  if (filterField?.type === "select") {
    if (filterField.multiselect && Array.isArray(fieldValue)) {
      return fieldValue
        .map((value) => {
          if (isRecord(value) && value.label != null && value.label !== "") {
            return String(value.label)
          }
          return formatGenericValue(value)
        })
        .filter(Boolean)
        .join(", ")
    }

    const optionLabel = findOptionLabel(filterField.options, fieldValue)
    if (optionLabel) {
      return optionLabel
    }
  }

  return formatGenericValue(fieldValue)
}

/**
 * Full Directory filter-tag chip text.
 * Region-click filters omit the field label prefix ("Regions:") and show only titles/ids.
 * Other chip types keep "Label: value".
 */
export function formatFilterTagChipText(
  fieldName: string,
  fieldValue: unknown,
  options: FormatFilterTagChipOptions = {},
): string {
  const value = formatFilterTagValue(fieldName, fieldValue, options)
  if (isRegionsFilterValue(fieldName, fieldValue)) {
    return value
  }

  const fieldLabel = options.fieldLabel ?? ""
  return fieldLabel ? `${fieldLabel}: ${value}` : value
}
