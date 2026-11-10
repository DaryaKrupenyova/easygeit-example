import { z } from 'zod'

import type { FormField, FormSchema } from '@/entities/form-schema'

const INVALID_NUMBER = Symbol('invalid-number')

function parseNumberInput(value: unknown): number | undefined | typeof INVALID_NUMBER {
  if (value === '' || value === null || value === undefined) {
    return undefined
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : INVALID_NUMBER
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed === '') {
      return undefined
    }

    const parsed = Number(trimmed)
    return Number.isFinite(parsed) ? parsed : INVALID_NUMBER
  }

  return INVALID_NUMBER
}

function buildNumberValidator(field: Extract<FormField, { type: 'number' }>): z.ZodType {
  const requiredMessage = `${field.label} is required`
  const invalidMessage = `${field.label} must be a valid number`

  return z.any().transform((value, ctx) => {
    const parsed = parseNumberInput(value)

    if (parsed === INVALID_NUMBER) {
      ctx.addIssue({
        code: 'custom',
        message: invalidMessage,
      })
      return z.NEVER
    }

    if (parsed === undefined) {
      if (field.required) {
        ctx.addIssue({
          code: 'custom',
          message: requiredMessage,
        })
        return z.NEVER
      }

      return undefined
    }

    if (typeof field.min === 'number' && parsed < field.min) {
      ctx.addIssue({
        code: 'custom',
        message: `Minimum value is ${field.min}`,
      })
      return z.NEVER
    }

    if (typeof field.max === 'number' && parsed > field.max) {
      ctx.addIssue({
        code: 'custom',
        message: `Maximum value is ${field.max}`,
      })
      return z.NEVER
    }

    return parsed
  })
}

function buildFieldValidator(field: FormField): z.ZodType {
  switch (field.type) {
    case 'text':
    case 'textarea': {
      let schema = z.string()

      if (field.required) {
        schema = schema.min(1, `${field.label} is required`)
      }

      if (typeof field.minLength === 'number') {
        schema = schema.min(field.minLength, `Minimum ${field.minLength} characters`)
      }

      if (typeof field.maxLength === 'number') {
        schema = schema.max(field.maxLength, `Maximum ${field.maxLength} characters`)
      }

      return field.required ? schema : schema.optional().or(z.literal(''))
    }

    case 'number':
      return buildNumberValidator(field)

    case 'select': {
      const values = field.options.map((option) => option.value)
      if (field.required) {
        return z
          .string()
          .min(1, `${field.label} is required`)
          .refine((value) => values.includes(value), 'Select a valid option')
      }

      return z
        .string()
        .optional()
        .refine(
          (value) => !value || values.includes(value),
          'Select a valid option',
        )
    }

    case 'checkbox': {
      if (field.required) {
        return z.literal(true, {
          error: `${field.label} is required`,
        })
      }

      return z.boolean().optional().default(false)
    }

    case 'date': {
      if (field.required) {
        return z.string().min(1, `${field.label} is required`)
      }

      return z.string().optional().or(z.literal(''))
    }
  }
}

export function buildValidationSchema(schema: FormSchema) {
  const shape: Record<string, z.ZodType> = {}

  for (const field of Object.values(schema.fields)) {
    shape[field.name] = buildFieldValidator(field)
  }

  return z.object(shape)
}

export type FormValues = Record<string, unknown>

export function buildDefaultValues(schema: FormSchema): FormValues {
  const values: FormValues = {}

  for (const field of Object.values(schema.fields)) {
    switch (field.type) {
      case 'checkbox':
        values[field.name] = false
        break
      case 'number':
        values[field.name] = ''
        break
      default:
        values[field.name] = ''
    }
  }

  return values
}
