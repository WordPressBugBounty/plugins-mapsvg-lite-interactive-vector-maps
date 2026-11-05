import { parseBoolean } from "../../Core/parseBoolean"
import { BASE_FIELD_DEFAULTS, FORM_FIELD_DEFINITIONS } from "./definitions"
import type { FormFieldData, FormFieldDefinition } from "./types"

const COMMON_BOOLEAN_KEYS = ["visible", "searchable", "readonly", "protected", "renamable"] as const

function cloneOptions(options: unknown): unknown {
  if (!Array.isArray(options)) {
    return options
  }

  return options.map((option) => {
    if (!option || typeof option !== "object") {
      return option
    }

    const cloned = { ...option } as Record<string, any>
    if (Array.isArray(cloned.options)) {
      cloned.options = cloneOptions(cloned.options)
    }
    return cloned
  })
}

function cloneField(field: FormFieldData): FormFieldData {
  return {
    ...field,
    ...(field.options !== undefined ? { options: cloneOptions(field.options) } : {}),
    ...(field.optionsDict && typeof field.optionsDict === "object"
      ? { optionsDict: { ...field.optionsDict } }
      : {}),
  }
}

export function getFormFieldDefinition(type: string): FormFieldDefinition | undefined {
  return FORM_FIELD_DEFINITIONS[type]
}

export function hasFormFieldDefinition(type: string): boolean {
  return getFormFieldDefinition(type) !== undefined
}

export function getFormFieldDefaults(type: string): FormFieldData {
  const definition = getFormFieldDefinition(type)
  return cloneField({
    ...BASE_FIELD_DEFAULTS,
    ...(definition?.defaults ?? {}),
    type,
  })
}

export function normalizeFormField(field: FormFieldData): FormFieldData {
  const definition = getFormFieldDefinition(field.type)
  const normalized = cloneField({
    ...getFormFieldDefaults(field.type),
    ...field,
  })

  COMMON_BOOLEAN_KEYS.forEach((key) => {
    const parsed = parseBoolean(normalized[key])
    if (parsed !== undefined) {
      normalized[key] = parsed
    }
  })

  return definition?.normalize ? definition.normalize(normalized) : normalized
}
