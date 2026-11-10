import { z } from 'zod'

const selectOptionSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
})

const fieldBaseSchema = z.object({
  id: z.string().min(1),
  sectionId: z.string().min(1),
  name: z.string().min(1),
  label: z.string().min(1),
  description: z.string().optional(),
  required: z.boolean(),
  placeholder: z.string().optional(),
})

const textFieldSchema = fieldBaseSchema.extend({
  type: z.literal('text'),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
})

const numberFieldSchema = fieldBaseSchema.extend({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
})

const textareaFieldSchema = fieldBaseSchema.extend({
  type: z.literal('textarea'),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
  rows: z.number().int().positive().optional(),
})

const selectFieldSchema = fieldBaseSchema.extend({
  type: z.literal('select'),
  options: z.array(selectOptionSchema).min(1),
})

const checkboxFieldSchema = fieldBaseSchema.extend({
  type: z.literal('checkbox'),
})

const dateFieldSchema = fieldBaseSchema.extend({
  type: z.literal('date'),
})

export const formFieldSchema = z.discriminatedUnion('type', [
  textFieldSchema,
  numberFieldSchema,
  textareaFieldSchema,
  selectFieldSchema,
  checkboxFieldSchema,
  dateFieldSchema,
])

export const formSectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  fieldIds: z.array(z.string()),
})

export const formSchemaSchema = z
  .object({
    version: z.literal(1),
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    sections: z.array(formSectionSchema).min(1),
    fields: z.record(z.string(), formFieldSchema),
  })
  .superRefine((schema, ctx) => {
    const sectionIds = new Set<string>()

    for (const [index, section] of schema.sections.entries()) {
      if (sectionIds.has(section.id)) {
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate section id "${section.id}"`,
          path: ['sections', index, 'id'],
        })
      }
      sectionIds.add(section.id)
    }

    const referencedFieldIds = new Set<string>()
    const usedNames = new Set<string>()

    for (const [sectionIndex, section] of schema.sections.entries()) {
      const seenInSection = new Set<string>()

      for (const [fieldIndex, fieldId] of section.fieldIds.entries()) {
        if (seenInSection.has(fieldId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Field "${fieldId}" is listed more than once in section "${section.id}"`,
            path: ['sections', sectionIndex, 'fieldIds', fieldIndex],
          })
        }
        seenInSection.add(fieldId)

        if (referencedFieldIds.has(fieldId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Field "${fieldId}" is referenced by more than one section`,
            path: ['sections', sectionIndex, 'fieldIds', fieldIndex],
          })
        }

        referencedFieldIds.add(fieldId)

        const field = schema.fields[fieldId]
        if (!field) {
          ctx.addIssue({
            code: 'custom',
            message: `Section "${section.id}" references missing field "${fieldId}"`,
            path: ['sections', sectionIndex, 'fieldIds', fieldIndex],
          })
          continue
        }

        if (field.sectionId !== section.id) {
          ctx.addIssue({
            code: 'custom',
            message: `Field "${fieldId}" sectionId does not match its parent section`,
            path: ['fields', fieldId, 'sectionId'],
          })
        }

        if (!sectionIds.has(field.sectionId)) {
          ctx.addIssue({
            code: 'custom',
            message: `Field "${fieldId}" points to unknown section "${field.sectionId}"`,
            path: ['fields', fieldId, 'sectionId'],
          })
        }

        if (usedNames.has(field.name)) {
          ctx.addIssue({
            code: 'custom',
            message: `Duplicate field name "${field.name}"`,
            path: ['fields', fieldId, 'name'],
          })
        }
        usedNames.add(field.name)
      }
    }

    for (const fieldId of Object.keys(schema.fields)) {
      if (!referencedFieldIds.has(fieldId)) {
        ctx.addIssue({
          code: 'custom',
          message: `Field "${fieldId}" exists in fields but is not listed in any section`,
          path: ['fields', fieldId],
        })
      }
    }
  })

export type ParsedFormSchema = z.infer<typeof formSchemaSchema>
