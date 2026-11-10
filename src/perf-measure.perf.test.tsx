import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { writeFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { createField, createSection, type FormSchema } from '@/entities/form-schema'
import { DynamicForm } from '@/features/form-preview/ui/DynamicForm'

function createLargeSchema(fieldCount: number): FormSchema {
  const section = createSection('Perf')
  const fields: FormSchema['fields'] = {}
  const fieldIds: string[] = []

  for (let index = 0; index < fieldCount; index += 1) {
    const field = createField('text', section.id, `field_${index + 1}`)
    field.label = `Field ${index + 1}`
    fields[field.id] = field
    fieldIds.push(field.id)
  }

  section.fieldIds = fieldIds

  return {
    version: 1,
    id: `perf_${fieldCount}`,
    title: `Perf ${fieldCount}`,
    sections: [section],
    fields,
  }
}

function readRenderCounts(): number[] {
  return screen.getAllByTitle('Render count (development only)').map((node) => {
    const match = node.textContent?.match(/renders:\s*(\d+)/)
    return match ? Number(match[1]) : -1
  })
}

describe('performance measurements', () => {
  it('measures mount and isolated typing re-renders for 500 fields', async () => {
    const user = userEvent.setup()
    const schema = createLargeSchema(500)

    const mountStarted = performance.now()
    render(<DynamicForm schema={schema} showRenderCount />)
    const mountMs = performance.now() - mountStarted

    const before = readRenderCounts()
    expect(before).toHaveLength(500)

    const target = screen.getByLabelText('Field 250')
    const neighbor = screen.getByLabelText('Field 251')

    const typeStarted = performance.now()
    await user.type(target, 'abc')
    const typeMs = performance.now() - typeStarted

    const afterFirst = readRenderCounts()
    const deltasFirst = afterFirst.map((value, index) => value - before[index]!)
    const increasedFirst = deltasFirst
      .map((delta, index) => ({ field: index + 1, delta }))
      .filter((item) => item.delta > 0)

    await user.type(neighbor, 'xyz')
    const afterSecond = readRenderCounts()
    const deltasSecond = afterSecond.map((value, index) => value - afterFirst[index]!)
    const increasedSecond = deltasSecond
      .map((delta, index) => ({ field: index + 1, delta }))
      .filter((item) => item.delta > 0)

    expect(target).toHaveValue('abc')
    expect(neighbor).toHaveValue('xyz')

    const report = {
      environment: 'jsdom/vitest',
      mountMs: Number(mountMs.toFixed(1)),
      typeThreeCharsMs: Number(typeMs.toFixed(1)),
      baselineMin: Math.min(...before),
      baselineMax: Math.max(...before),
      afterTypingField250: {
        fieldsWithDelta: increasedFirst.length,
        maxDelta: Math.max(...deltasFirst),
        field250Delta: deltasFirst[249],
        field251Delta: deltasFirst[250],
      },
      afterTypingField251: {
        fieldsWithDelta: increasedSecond.length,
        field250Delta: deltasSecond[249],
        field251Delta: deltasSecond[250],
      },
    }

    writeFileSync('perf-measure-report.json', `${JSON.stringify(report, null, 2)}\n`)
    expect(increasedFirst).toEqual([{ field: 250, delta: expect.any(Number) }])
    expect(increasedSecond).toEqual([{ field: 251, delta: expect.any(Number) }])
  }, 180_000)
})
