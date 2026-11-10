import { beforeEach, describe, expect, it } from 'vitest'

import { useBuilderStore } from './store'

describe('builder store', () => {
  beforeEach(() => {
    useBuilderStore.getState().resetSchema()
  })

  it('adds and removes fields', () => {
    const { addField, removeField } = useBuilderStore.getState()

    addField('text')
    const afterAdd = useBuilderStore.getState()
    const fieldIds = Object.keys(afterAdd.schema.fields)
    expect(fieldIds).toHaveLength(1)

    const fieldId = fieldIds[0]!
    removeField(fieldId)

    expect(Object.keys(useBuilderStore.getState().schema.fields)).toHaveLength(0)
    expect(useBuilderStore.getState().schema.sections[0]?.fieldIds).toEqual([])
  })

  it('updates field settings', () => {
    useBuilderStore.getState().addField('text')
    const fieldId = Object.keys(useBuilderStore.getState().schema.fields)[0]!

    const result = useBuilderStore.getState().updateField(fieldId, {
      label: 'Company name',
      required: true,
      name: 'company_name',
    })

    expect(result.ok).toBe(true)
    const field = useBuilderStore.getState().schema.fields[fieldId]
    expect(field?.label).toBe('Company name')
    expect(field?.required).toBe(true)
    expect(field?.name).toBe('company_name')
  })

  it('duplicates a field next to the source with a unique name', () => {
    useBuilderStore.getState().addField('text')
    useBuilderStore.getState().addField('number')
    const [firstId] = useBuilderStore.getState().schema.sections[0]!.fieldIds

    useBuilderStore.getState().duplicateField(firstId!)
    useBuilderStore.getState().duplicateField(firstId!)

    const fieldIds = useBuilderStore.getState().schema.sections[0]!.fieldIds
    expect(fieldIds).toHaveLength(4)

    const names = Object.values(useBuilderStore.getState().schema.fields).map((field) => field.name)
    expect(new Set(names).size).toBe(names.length)
    expect(useBuilderStore.getState().schema.fields[fieldIds[1]!]?.label).toContain('(copy)')
  })

  it('keeps field names unique across sections', () => {
    useBuilderStore.getState().addSection()
    const [sectionA, sectionB] = useBuilderStore.getState().schema.sections

    useBuilderStore.getState().addField('text', sectionA!.id)
    useBuilderStore.getState().addField('text', sectionB!.id)

    const names = Object.values(useBuilderStore.getState().schema.fields).map((field) => field.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('rejects renaming a field to an existing name', () => {
    useBuilderStore.getState().addField('text')
    useBuilderStore.getState().addField('number')
    const [firstId, secondId] = Object.keys(useBuilderStore.getState().schema.fields)
    const firstName = useBuilderStore.getState().schema.fields[firstId!]!.name

    const result = useBuilderStore.getState().updateField(secondId!, { name: firstName })

    expect(result.ok).toBe(false)
    expect(useBuilderStore.getState().fieldNameError).toMatch(/already used/i)
    expect(useBuilderStore.getState().schema.fields[secondId!]!.name).not.toBe(firstName)
  })

  it('removes a section together with its fields', () => {
    useBuilderStore.getState().addSection()
    const second = useBuilderStore.getState().schema.sections[1]!
    useBuilderStore.getState().addField('text', second.id)
    useBuilderStore.getState().addField('number', second.id)

    expect(Object.keys(useBuilderStore.getState().schema.fields)).toHaveLength(2)

    useBuilderStore.getState().removeSection(second.id)

    expect(useBuilderStore.getState().schema.sections).toHaveLength(1)
    expect(Object.keys(useBuilderStore.getState().schema.fields)).toHaveLength(0)
  })

  it('moves a field between sections and updates sectionId', () => {
    useBuilderStore.getState().addSection()
    const [sectionA, sectionB] = useBuilderStore.getState().schema.sections
    useBuilderStore.getState().addField('text', sectionA!.id)
    const fieldId = Object.keys(useBuilderStore.getState().schema.fields)[0]!

    useBuilderStore.getState().moveField(fieldId, sectionB!.id, 0)

    const state = useBuilderStore.getState()
    expect(state.schema.fields[fieldId]?.sectionId).toBe(sectionB!.id)
    expect(state.schema.sections.find((section) => section.id === sectionA!.id)?.fieldIds).not.toContain(
      fieldId,
    )
    expect(state.schema.sections.find((section) => section.id === sectionB!.id)?.fieldIds).toContain(
      fieldId,
    )
  })
})
