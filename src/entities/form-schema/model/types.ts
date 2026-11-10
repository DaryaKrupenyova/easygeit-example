export const FIELD_TYPES = [
  'text',
  'number',
  'textarea',
  'select',
  'checkbox',
  'date',
] as const

export type FieldType = (typeof FIELD_TYPES)[number]

export type AppTab = 'builder' | 'preview' | 'performance' | 'json'

export interface SelectOption {
  label: string
  value: string
}

interface FieldBase {
  id: string
  sectionId: string
  name: string
  label: string
  description?: string
  required: boolean
  placeholder?: string
}

export interface TextField extends FieldBase {
  type: 'text'
  minLength?: number
  maxLength?: number
}

export interface NumberField extends FieldBase {
  type: 'number'
  min?: number
  max?: number
}

export interface TextareaField extends FieldBase {
  type: 'textarea'
  minLength?: number
  maxLength?: number
  rows?: number
}

export interface SelectField extends FieldBase {
  type: 'select'
  options: SelectOption[]
}

export interface CheckboxField extends FieldBase {
  type: 'checkbox'
}

export interface DateField extends FieldBase {
  type: 'date'
}

export type FormField =
  | TextField
  | NumberField
  | TextareaField
  | SelectField
  | CheckboxField
  | DateField

export interface FormSection {
  id: string
  title: string
  description?: string
  fieldIds: string[]
}

export interface FormSchema {
  version: 1
  id: string
  title: string
  description?: string
  sections: FormSection[]
  fields: Record<string, FormField>
}

export interface FieldTypeMeta {
  type: FieldType
  label: string
  description: string
}
