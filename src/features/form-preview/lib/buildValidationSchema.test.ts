import { describe, expect, it } from 'vitest'

import { createDemoSchema, createField, createSection } from '@/entities/form-schema'

import { buildDefaultValues, buildValidationSchema } from './buildValidationSchema'

describe('buildValidationSchema', () => {
  it('generates validators from configuration', () => {
    const schema = createDemoSchema()
    const validator = buildValidationSchema(schema)

    const invalid = validator.safeParse({
      full_name: '',
      email: '',
      role: '',
      experience_years: '',
      notes: '',
      available_from: '',
      consent: false,
    })

    expect(invalid.success).toBe(false)

    const valid = validator.safeParse({
      full_name: 'Ada Lovelace',
      email: 'ada@example.com',
      role: 'frontend',
      experience_years: 8,
      notes: 'Hello',
      available_from: '2026-01-01',
      consent: true,
    })

    expect(valid.success).toBe(true)
  })

  it('builds default values for every field', () => {
    const section = createSection('Main')
    const text = createField('text', section.id, 'title')
    const checkbox = createField('checkbox', section.id, 'agree')
    section.fieldIds = [text.id, checkbox.id]

    const defaults = buildDefaultValues({
      version: 1,
      id: 'form',
      title: 'Defaults',
      sections: [section],
      fields: {
        [text.id]: text,
        [checkbox.id]: checkbox,
      },
    })

    expect(defaults[text.name]).toBe('')
    expect(defaults[checkbox.name]).toBe(false)
  })

  it('rejects empty required number instead of coercing to 0', () => {
    const section = createSection('S')
    const field = createField('number', section.id, 'age')
    field.label = 'Age'
    field.required = true
    section.fieldIds = [field.id]

    const validator = buildValidationSchema({
      version: 1,
      id: 'f',
      title: 't',
      sections: [section],
      fields: { [field.id]: field },
    })

    const empty = validator.safeParse({ age: '' })
    expect(empty.success).toBe(false)
    if (!empty.success) {
      expect(empty.error.issues[0]?.message).toMatch(/required/i)
    }
  })

  it('accepts optional empty number as undefined and parses string numbers', () => {
    const section = createSection('S')
    const field = createField('number', section.id, 'score')
    field.label = 'Score'
    field.required = false
    if (field.type === 'number') {
      field.min = 0
      field.max = 10
    }
    section.fieldIds = [field.id]

    const validator = buildValidationSchema({
      version: 1,
      id: 'f',
      title: 't',
      sections: [section],
      fields: { [field.id]: field },
    })

    const empty = validator.safeParse({ score: '' })
    expect(empty.success).toBe(true)
    if (empty.success) {
      expect(empty.data.score).toBeUndefined()
    }

    const parsed = validator.safeParse({ score: '7' })
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data.score).toBe(7)
    }

    const invalid = validator.safeParse({ score: 'nope' })
    expect(invalid.success).toBe(false)

    const tooLarge = validator.safeParse({ score: '11' })
    expect(tooLarge.success).toBe(false)
  })
})
