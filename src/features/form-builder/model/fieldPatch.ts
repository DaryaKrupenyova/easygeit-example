import type { FormField, SelectOption } from '@/entities/form-schema'

/** Shared editable props. Type and id are intentionally excluded. */
export interface FieldPatch {
  name?: string
  label?: string
  description?: string
  required?: boolean
  placeholder?: string
  minLength?: number
  maxLength?: number
  rows?: number
  min?: number
  max?: number
  options?: SelectOption[]
}

function hasKey(patch: FieldPatch, key: keyof FieldPatch): boolean {
  return Object.prototype.hasOwnProperty.call(patch, key)
}

export function applyFieldPatch(current: FormField, patch: FieldPatch): FormField {
  const nextBase = {
    ...current,
    name: hasKey(patch, 'name') && patch.name !== undefined ? patch.name : current.name,
    label: hasKey(patch, 'label') && patch.label !== undefined ? patch.label : current.label,
    description: hasKey(patch, 'description') ? patch.description : current.description,
    required:
      hasKey(patch, 'required') && patch.required !== undefined
        ? patch.required
        : current.required,
    placeholder: hasKey(patch, 'placeholder') ? patch.placeholder : current.placeholder,
  }

  switch (current.type) {
    case 'text':
      return {
        ...nextBase,
        type: 'text',
        minLength: hasKey(patch, 'minLength') ? patch.minLength : current.minLength,
        maxLength: hasKey(patch, 'maxLength') ? patch.maxLength : current.maxLength,
      }
    case 'textarea':
      return {
        ...nextBase,
        type: 'textarea',
        minLength: hasKey(patch, 'minLength') ? patch.minLength : current.minLength,
        maxLength: hasKey(patch, 'maxLength') ? patch.maxLength : current.maxLength,
        rows:
          hasKey(patch, 'rows') && patch.rows !== undefined ? patch.rows : current.rows,
      }
    case 'number':
      return {
        ...nextBase,
        type: 'number',
        min: hasKey(patch, 'min') ? patch.min : current.min,
        max: hasKey(patch, 'max') ? patch.max : current.max,
      }
    case 'select':
      return {
        ...nextBase,
        type: 'select',
        options:
          hasKey(patch, 'options') && patch.options !== undefined
            ? patch.options
            : current.options,
      }
    case 'checkbox':
      return {
        ...nextBase,
        type: 'checkbox',
      }
    case 'date':
      return {
        ...nextBase,
        type: 'date',
      }
  }
}
