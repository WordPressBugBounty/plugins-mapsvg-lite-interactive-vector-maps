export type FormFieldData = {
  type: string
  [key: string]: any
}

export type FieldValidationIssue = {
  path?: string
  message: string
}

export type FormFieldNormalizer = (field: FormFieldData) => FormFieldData

export interface FormFieldDefinition {
  type: string
  defaults?: Readonly<Record<string, any>>
  normalize?: FormFieldNormalizer
  validate?: (field: FormFieldData) => FieldValidationIssue[]
}

export type FormFieldDefinitionRegistry = Readonly<Record<string, FormFieldDefinition>>
