import { describe, expect, it } from 'vitest'

import { createDemoSchema } from '@/entities/form-schema'

import { MAX_IMPORT_BYTES, parseSchemaJson, readSchemaFile, serializeSchema } from './schemaIo'

describe('schema import/export', () => {
  it('round-trips a valid schema', () => {
    const schema = createDemoSchema()
    const result = parseSchemaJson(serializeSchema(schema))

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.schema.title).toBe(schema.title)
      expect(Object.keys(result.schema.fields)).toHaveLength(
        Object.keys(schema.fields).length,
      )
    }
  })

  it('rejects invalid JSON syntax', () => {
    const result = parseSchemaJson('{not-json')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Invalid JSON/i)
    }
  })

  it('rejects incorrect schema shape', () => {
    const result = parseSchemaJson(
      JSON.stringify({
        version: 1,
        id: 'form_1',
        title: 'Broken',
        sections: [],
        fields: {},
      }),
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Schema validation failed/i)
    }
  })

  it('rejects fields missing from sections', () => {
    const schema = createDemoSchema()
    const broken = {
      ...schema,
      sections: schema.sections.map((section) => ({
        ...section,
        fieldIds: [],
      })),
    }

    const result = parseSchemaJson(JSON.stringify(broken))
    expect(result.ok).toBe(false)
  })

  it('rejects duplicate section ids', () => {
    const demo = createDemoSchema()
    const broken = {
      ...demo,
      sections: [
        { ...demo.sections[0]!, id: 'dup' },
        { id: 'dup', title: 'Other', fieldIds: [] },
      ],
      fields: Object.fromEntries(
        Object.values(demo.fields).map((field) => [
          field.id,
          { ...field, sectionId: 'dup' },
        ]),
      ),
    }
    broken.sections[0]!.fieldIds = Object.keys(broken.fields)
    broken.sections[1]!.fieldIds = []

    const result = parseSchemaJson(JSON.stringify(broken))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Duplicate section id/i)
    }
  })

  it('rejects duplicate field names', () => {
    const demo = createDemoSchema()
    const fieldIds = Object.keys(demo.fields)
    const firstId = fieldIds[0]!
    const secondId = fieldIds[1]!

    const broken = {
      ...demo,
      fields: {
        ...demo.fields,
        [secondId]: {
          ...demo.fields[secondId]!,
          name: demo.fields[firstId]!.name,
        },
      },
    }

    const result = parseSchemaJson(JSON.stringify(broken))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/Duplicate field name/i)
    }
  })

  it('rejects repeated fieldIds inside one section with a clear message', () => {
    const demo = createDemoSchema()
    const fieldId = Object.keys(demo.fields)[0]!
    const broken = {
      ...demo,
      sections: [
        {
          ...demo.sections[0]!,
          fieldIds: [fieldId, fieldId],
        },
      ],
      fields: {
        [fieldId]: demo.fields[fieldId]!,
      },
    }

    const result = parseSchemaJson(JSON.stringify(broken))
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/listed more than once/i)
    }
  })

  it('rejects oversized import files', async () => {
    const big = new File([new Uint8Array(MAX_IMPORT_BYTES + 1)], 'huge.json', {
      type: 'application/json',
    })

    const result = await readSchemaFile(big)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toMatch(/too large/i)
    }
  })
})
