import { create } from 'zustand'

import {
  createDemoSchema,
  createEmptySchema,
  createField,
  createSection,
  createUniqueFieldName,
  getUsedFieldNames,
  isFieldNameAvailable,
  type AppTab,
  type FieldType,
  type FormField,
  type FormSchema,
  type FormSection,
} from '@/entities/form-schema'
import { createId } from '@/shared/lib/id'

import { applyFieldPatch, type FieldPatch } from './fieldPatch'

export type UpdateFieldResult =
  | { ok: true }
  | { ok: false; error: string }

interface BuilderState {
  schema: FormSchema
  selectedFieldId: string | null
  selectedSectionId: string | null
  activeTab: AppTab
  importError: string | null
  fieldNameError: string | null
  setActiveTab: (tab: AppTab) => void
  selectField: (fieldId: string | null) => void
  selectSection: (sectionId: string | null) => void
  updateFormMeta: (patch: Partial<Pick<FormSchema, 'title' | 'description'>>) => void
  addField: (type: FieldType, sectionId?: string) => void
  updateField: (fieldId: string, patch: FieldPatch) => UpdateFieldResult
  removeField: (fieldId: string) => void
  duplicateField: (fieldId: string) => void
  addSection: () => void
  updateSection: (
    sectionId: string,
    patch: Partial<Pick<FormSection, 'title' | 'description'>>,
  ) => void
  removeSection: (sectionId: string) => void
  reorderFieldsInSection: (sectionId: string, fieldIds: string[]) => void
  moveField: (fieldId: string, targetSectionId: string, targetIndex: number) => void
  replaceSchema: (schema: FormSchema) => void
  resetSchema: () => void
  loadDemoSchema: () => void
  setImportError: (message: string | null) => void
  clearImportError: () => void
  clearFieldNameError: () => void
  generatePerformanceSchema: (fieldCount: 100 | 300 | 500) => void
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  schema: createDemoSchema(),
  selectedFieldId: null,
  selectedSectionId: null,
  activeTab: 'builder',
  importError: null,
  fieldNameError: null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  selectField: (fieldId) =>
    set({
      selectedFieldId: fieldId,
      selectedSectionId: fieldId
        ? (get().schema.fields[fieldId]?.sectionId ?? null)
        : null,
      fieldNameError: null,
    }),

  selectSection: (sectionId) =>
    set({
      selectedSectionId: sectionId,
      selectedFieldId: null,
      fieldNameError: null,
    }),

  updateFormMeta: (patch) =>
    set((state) => ({
      schema: {
        ...state.schema,
        ...patch,
      },
    })),

  addField: (type, sectionId) => {
    const { schema } = get()
    const targetSectionId = sectionId ?? schema.sections[0]?.id
    if (!targetSectionId) return

    const usedNames = getUsedFieldNames(schema)
    const name = createUniqueFieldName(type, usedNames)
    const field = createField(type, targetSectionId, name)

    set((state) => ({
      schema: {
        ...state.schema,
        fields: {
          ...state.schema.fields,
          [field.id]: field,
        },
        sections: state.schema.sections.map((section) =>
          section.id === targetSectionId
            ? { ...section, fieldIds: [...section.fieldIds, field.id] }
            : section,
        ),
      },
      selectedFieldId: field.id,
      selectedSectionId: targetSectionId,
      fieldNameError: null,
    }))
  },

  updateField: (fieldId, patch) => {
    const { schema } = get()
    const current = schema.fields[fieldId]
    if (!current) {
      return { ok: false, error: 'Field not found.' }
    }

    if (patch.name !== undefined) {
      const normalized = patch.name.trim().toLowerCase().replace(/\s+/g, '_')
      if (!normalized) {
        const error = 'Field name cannot be empty.'
        set({ fieldNameError: error })
        return { ok: false, error }
      }

      if (!isFieldNameAvailable(schema, normalized, fieldId)) {
        const error = `Field name "${normalized}" is already used.`
        set({ fieldNameError: error })
        return { ok: false, error }
      }

      patch = { ...patch, name: normalized }
    }

    const nextField = applyFieldPatch(current, patch)

    set((state) => ({
      schema: {
        ...state.schema,
        fields: {
          ...state.schema.fields,
          [fieldId]: nextField,
        },
      },
      fieldNameError: null,
    }))

    return { ok: true }
  },

  removeField: (fieldId) =>
    set((state) => {
      const field = state.schema.fields[fieldId]
      if (!field) return state

      const { [fieldId]: _removed, ...restFields } = state.schema.fields

      return {
        schema: {
          ...state.schema,
          fields: restFields,
          sections: state.schema.sections.map((section) =>
            section.id === field.sectionId
              ? {
                  ...section,
                  fieldIds: section.fieldIds.filter((id) => id !== fieldId),
                }
              : section,
          ),
        },
        selectedFieldId: state.selectedFieldId === fieldId ? null : state.selectedFieldId,
        fieldNameError: state.selectedFieldId === fieldId ? null : state.fieldNameError,
      }
    }),

  duplicateField: (fieldId) => {
    const { schema } = get()
    const source = schema.fields[fieldId]
    if (!source) return

    const usedNames = getUsedFieldNames(schema)
    const copy: FormField = {
      ...structuredClone(source),
      id: createId('field'),
      name: createUniqueFieldName(`${source.name}_copy`, usedNames),
      label: `${source.label} (copy)`,
    }

    set((state) => ({
      schema: {
        ...state.schema,
        fields: {
          ...state.schema.fields,
          [copy.id]: copy,
        },
        sections: state.schema.sections.map((section) => {
          if (section.id !== source.sectionId) return section
          const index = section.fieldIds.indexOf(fieldId)
          const nextIds = [...section.fieldIds]
          nextIds.splice(index + 1, 0, copy.id)
          return { ...section, fieldIds: nextIds }
        }),
      },
      selectedFieldId: copy.id,
      selectedSectionId: copy.sectionId,
      fieldNameError: null,
    }))
  },

  addSection: () => {
    const section = createSection(`Section ${get().schema.sections.length + 1}`)
    set((state) => ({
      schema: {
        ...state.schema,
        sections: [...state.schema.sections, section],
      },
      selectedSectionId: section.id,
      selectedFieldId: null,
      fieldNameError: null,
    }))
  },

  updateSection: (sectionId, patch) =>
    set((state) => ({
      schema: {
        ...state.schema,
        sections: state.schema.sections.map((section) =>
          section.id === sectionId ? { ...section, ...patch } : section,
        ),
      },
    })),

  removeSection: (sectionId) =>
    set((state) => {
      if (state.schema.sections.length <= 1) return state

      const section = state.schema.sections.find((item) => item.id === sectionId)
      if (!section) return state

      const nextFields = { ...state.schema.fields }
      for (const fieldId of section.fieldIds) {
        delete nextFields[fieldId]
      }

      return {
        schema: {
          ...state.schema,
          sections: state.schema.sections.filter((item) => item.id !== sectionId),
          fields: nextFields,
        },
        selectedSectionId:
          state.selectedSectionId === sectionId ? null : state.selectedSectionId,
        selectedFieldId:
          state.selectedFieldId && section.fieldIds.includes(state.selectedFieldId)
            ? null
            : state.selectedFieldId,
        fieldNameError:
          state.selectedFieldId && section.fieldIds.includes(state.selectedFieldId)
            ? null
            : state.fieldNameError,
      }
    }),

  reorderFieldsInSection: (sectionId, fieldIds) =>
    set((state) => ({
      schema: {
        ...state.schema,
        sections: state.schema.sections.map((section) =>
          section.id === sectionId ? { ...section, fieldIds } : section,
        ),
      },
    })),

  moveField: (fieldId, targetSectionId, targetIndex) =>
    set((state) => {
      const field = state.schema.fields[fieldId]
      if (!field) return state

      const sourceSectionId = field.sectionId
      const nextSections = state.schema.sections.map((section) => ({
        ...section,
        fieldIds: [...section.fieldIds],
      }))

      const sourceSection = nextSections.find((section) => section.id === sourceSectionId)
      const targetSection = nextSections.find((section) => section.id === targetSectionId)
      if (!sourceSection || !targetSection) return state

      const fromIndex = sourceSection.fieldIds.indexOf(fieldId)
      if (fromIndex === -1) return state

      sourceSection.fieldIds.splice(fromIndex, 1)

      const insertIndex =
        sourceSectionId === targetSectionId && fromIndex < targetIndex
          ? targetIndex - 1
          : targetIndex

      targetSection.fieldIds.splice(Math.max(0, insertIndex), 0, fieldId)

      return {
        schema: {
          ...state.schema,
          sections: nextSections,
          fields: {
            ...state.schema.fields,
            [fieldId]: {
              ...field,
              sectionId: targetSectionId,
            },
          },
        },
        selectedFieldId: fieldId,
        selectedSectionId: targetSectionId,
      }
    }),

  replaceSchema: (schema) =>
    set({
      schema,
      selectedFieldId: null,
      selectedSectionId: schema.sections[0]?.id ?? null,
      importError: null,
      fieldNameError: null,
    }),

  resetSchema: () =>
    set({
      schema: createEmptySchema(),
      selectedFieldId: null,
      selectedSectionId: null,
      importError: null,
      fieldNameError: null,
    }),

  loadDemoSchema: () =>
    set({
      schema: createDemoSchema(),
      selectedFieldId: null,
      selectedSectionId: null,
      importError: null,
      fieldNameError: null,
    }),

  setImportError: (message) => set({ importError: message }),
  clearImportError: () => set({ importError: null }),
  clearFieldNameError: () => set({ fieldNameError: null }),

  generatePerformanceSchema: (fieldCount) => {
    const section = createSection('Performance section')
    const fields: Record<string, FormField> = {}
    const fieldIds: string[] = []
    const usedNames = new Set<string>()

    for (let index = 0; index < fieldCount; index += 1) {
      const type: FieldType =
        index % 5 === 0
          ? 'number'
          : index % 5 === 1
            ? 'textarea'
            : index % 5 === 2
              ? 'select'
              : index % 5 === 3
                ? 'checkbox'
                : 'text'

      const name = createUniqueFieldName(`field_${index + 1}`, usedNames)
      usedNames.add(name)

      const field = createField(type, section.id, name)
      field.label = `Field ${index + 1}`
      field.required = index % 7 === 0
      fields[field.id] = field
      fieldIds.push(field.id)
    }

    section.fieldIds = fieldIds

    set({
      schema: {
        version: 1,
        id: createId('form'),
        title: `Performance form (${fieldCount} fields)`,
        description: 'Generated schema for isolated field re-render experiments.',
        sections: [section],
        fields,
      },
      selectedFieldId: null,
      selectedSectionId: section.id,
      activeTab: 'performance',
      fieldNameError: null,
    })
  },
}))
