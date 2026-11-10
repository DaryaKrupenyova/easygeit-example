import { createId } from '@/shared/lib/id'

import type { FieldType, FieldTypeMeta, FormField, FormSchema, FormSection } from './types'
import { createUniqueFieldName } from './uniqueName'

export const FIELD_TYPE_META: FieldTypeMeta[] = [
  {
    type: 'text',
    label: 'Text',
    description: 'Single-line text input',
  },
  {
    type: 'number',
    label: 'Number',
    description: 'Numeric value with optional bounds',
  },
  {
    type: 'textarea',
    label: 'Textarea',
    description: 'Multi-line text input',
  },
  {
    type: 'select',
    label: 'Select',
    description: 'Dropdown with custom options',
  },
  {
    type: 'checkbox',
    label: 'Checkbox',
    description: 'Boolean confirmation',
  },
  {
    type: 'date',
    label: 'Date',
    description: 'Calendar date picker',
  },
]

export function createSection(title = 'Untitled section'): FormSection {
  return {
    id: createId('section'),
    title,
    description: '',
    fieldIds: [],
  }
}

export function createField(
  type: FieldType,
  sectionId: string,
  name: string,
): FormField {
  const id = createId('field')
  const base = {
    id,
    sectionId,
    name,
    label: `${type.charAt(0).toUpperCase()}${type.slice(1)} field`,
    description: '',
    required: false,
    placeholder: '',
  }

  switch (type) {
    case 'text':
      return { ...base, type, minLength: undefined, maxLength: undefined }
    case 'number':
      return { ...base, type, min: undefined, max: undefined }
    case 'textarea':
      return {
        ...base,
        type,
        minLength: undefined,
        maxLength: undefined,
        rows: 4,
      }
    case 'select':
      return {
        ...base,
        type,
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ],
      }
    case 'checkbox':
      return { ...base, type, label: 'Accept terms' }
    case 'date':
      return { ...base, type }
  }
}

export function createEmptySchema(): FormSchema {
  const section = createSection('General')

  return {
    version: 1,
    id: createId('form'),
    title: 'Untitled form',
    description: 'Describe what this form collects.',
    sections: [section],
    fields: {},
  }
}

export function createDemoSchema(): FormSchema {
  const section = createSection('Applicant details')
  const usedNames = new Set<string>()

  const nextName = (base: string) => {
    const name = createUniqueFieldName(base, usedNames)
    usedNames.add(name)
    return name
  }

  const name = createField('text', section.id, nextName('full_name'))
  name.label = 'Full name'
  name.required = true
  name.placeholder = 'Jane Doe'

  const email = createField('text', section.id, nextName('email'))
  email.label = 'Email'
  email.required = true
  email.placeholder = 'jane@company.com'

  const role = createField('select', section.id, nextName('role'))
  role.label = 'Preferred role'
  role.required = true
  if (role.type === 'select') {
    role.options = [
      { label: 'Frontend Engineer', value: 'frontend' },
      { label: 'Full-stack Engineer', value: 'fullstack' },
      { label: 'Product Designer', value: 'design' },
    ]
  }

  const experience = createField('number', section.id, nextName('experience_years'))
  experience.label = 'Years of experience'
  if (experience.type === 'number') {
    experience.min = 0
    experience.max = 40
  }

  const notes = createField('textarea', section.id, nextName('notes'))
  notes.label = 'Notes'
  notes.placeholder = 'Anything else we should know?'

  const startDate = createField('date', section.id, nextName('available_from'))
  startDate.label = 'Available from'

  const consent = createField('checkbox', section.id, nextName('consent'))
  consent.label = 'I agree to be contacted'
  consent.required = true

  section.fieldIds = [
    name.id,
    email.id,
    role.id,
    experience.id,
    notes.id,
    startDate.id,
    consent.id,
  ]

  return {
    version: 1,
    id: createId('form'),
    title: 'Job application',
    description: 'A starter schema you can edit, preview, and export.',
    sections: [section],
    fields: {
      [name.id]: name,
      [email.id]: email,
      [role.id]: role,
      [experience.id]: experience,
      [notes.id]: notes,
      [startDate.id]: startDate,
      [consent.id]: consent,
    },
  }
}
