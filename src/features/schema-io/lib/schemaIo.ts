import { formSchemaSchema, type FormSchema } from '@/entities/form-schema'

/** Soft limit for local JSON import (1 MiB). */
export const MAX_IMPORT_BYTES = 1_048_576

export function serializeSchema(schema: FormSchema): string {
  return `${JSON.stringify(schema, null, 2)}\n`
}

export function parseSchemaJson(raw: string):
  | { ok: true; schema: FormSchema }
  | { ok: false; error: string } {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, error: 'Invalid JSON: could not parse file contents.' }
  }

  const result = formSchemaSchema.safeParse(parsed)

  if (!result.success) {
    const firstIssue = result.error.issues[0]
    const path = firstIssue?.path.length ? firstIssue.path.join('.') : 'root'
    return {
      ok: false,
      error: firstIssue
        ? `Schema validation failed at "${path}": ${firstIssue.message}`
        : 'Schema validation failed.',
    }
  }

  return { ok: true, schema: result.data }
}

export function downloadSchema(schema: FormSchema, filename = 'form-schema.json') {
  const blob = new Blob([serializeSchema(schema)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function readSchemaFile(file: File) {
  if (file.size > MAX_IMPORT_BYTES) {
    return {
      ok: false as const,
      error: `File is too large (${file.size} bytes). Maximum allowed size is ${MAX_IMPORT_BYTES} bytes (1 MiB).`,
    }
  }

  const raw = await file.text()
  return parseSchemaJson(raw)
}
