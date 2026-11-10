import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { useBuilderStore } from '@/features/form-builder/model/store'
import { Workspace } from '@/widgets/workspace/ui/Workspace'

describe('builder interactions', () => {
  beforeEach(() => {
    useBuilderStore.getState().resetSchema()
    useBuilderStore.getState().setActiveTab('builder')
  })

  it('adds a text field from the palette and edits its settings', async () => {
    const user = userEvent.setup()
    render(<Workspace />)

    await user.click(screen.getByRole('button', { name: /Single-line text input/i }))

    expect(screen.getByText(/name:/i)).toBeInTheDocument()

    const labelInput = screen.getByLabelText(/^Label$/i)
    await user.clear(labelInput)
    await user.type(labelInput, 'Project title')

    const fieldId = Object.keys(useBuilderStore.getState().schema.fields)[0]!
    expect(useBuilderStore.getState().schema.fields[fieldId]?.label).toBe('Project title')
  })

  it('removes a field from the canvas', async () => {
    const user = userEvent.setup()
    useBuilderStore.getState().addField('text')
    render(<Workspace />)

    await user.click(screen.getByRole('button', { name: /Delete/i }))
    expect(Object.keys(useBuilderStore.getState().schema.fields)).toHaveLength(0)
  })
})
