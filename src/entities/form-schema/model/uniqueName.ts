import type { FormSchema } from './types'

export function getUsedFieldNames(
  schema: FormSchema,
  excludeFieldId?: string,
): Set<string> {
  const used = new Set<string>()

  for (const field of Object.values(schema.fields)) {
    if (excludeFieldId && field.id === excludeFieldId) continue
    used.add(field.name)
  }

  return used
}

export function createUniqueFieldName(base: string, used: Set<string>): string {
  const normalized = base
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  const seed = normalized.length > 0 ? normalized : 'field'

  if (!used.has(seed)) {
    return seed
  }

  let suffix = 2
  while (used.has(`${seed}_${suffix}`)) {
    suffix += 1
  }

  return `${seed}_${suffix}`
}

export function isFieldNameAvailable(
  schema: FormSchema,
  name: string,
  excludeFieldId?: string,
): boolean {
  return !Object.values(schema.fields).some(
    (field) => field.id !== excludeFieldId && field.name === name,
  )
}
