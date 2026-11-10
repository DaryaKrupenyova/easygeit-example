import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'

import { createField, createSection, type FormSchema } from '@/entities/form-schema'
import { useBuilderStore } from '@/features/form-builder/model/store'

import { DynamicForm } from './DynamicForm'

function createTwoFieldSchema(): FormSchema {
  const section = createSection('Details')
  const first = createField('text', section.id, 'first_name')
  first.label = 'First name'
  first.required = true

  const second = createField('text', section.id, 'last_name')
  second.label = 'Last name'
  second.required = true

  section.fieldIds = [first.id, second.id]

  return {
    version: 1,
    id: 'form_test',
    title: 'Contact',
    description: 'Test form',
    sections: [section],
    fields: {
      [first.id]: first,
      [second.id]: second,
    },
  }
}

function createNumberSchema(required: boolean): FormSchema {
  const section = createSection('Numbers')
  const age = createField('number', section.id, 'age')
  age.label = 'Age'
  age.required = required
  if (age.type === 'number') {
    age.min = 1
    age.max = 120
  }
  section.fieldIds = [age.id]

  return {
    version: 1,
    id: 'number_form',
    title: 'Age form',
    sections: [section],
    fields: { [age.id]: age },
  }
}

describe('DynamicForm', () => {
  beforeEach(() => {
    useBuilderStore.setState({
      schema: createTwoFieldSchema(),
      selectedFieldId: null,
      selectedSectionId: null,
      activeTab: 'preview',
      importError: null,
      fieldNameError: null,
    })
  })

  it('renders fields from configuration', () => {
    const schema = useBuilderStore.getState().schema
    render(<DynamicForm schema={schema} />)

    expect(screen.getByLabelText(/First name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Last name/i)).toBeInTheDocument()
  })

  it('validates required fields on submit and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    const schema = useBuilderStore.getState().schema
    render(<DynamicForm schema={schema} />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findAllByRole('alert')).not.toHaveLength(0)
    await waitFor(() => {
      expect(screen.getByLabelText(/First name/i)).toHaveFocus()
    })
  })

  it('clears a field error after submit when the value is fixed', async () => {
    const user = userEvent.setup()
    const schema = useBuilderStore.getState().schema
    render(<DynamicForm schema={schema} />)

    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(await screen.findByText(/First name is required/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/First name/i), 'Ada')

    await waitFor(() => {
      expect(screen.queryByText(/First name is required/i)).not.toBeInTheDocument()
    })
  })

  it('keeps neighboring field values when editing one field', async () => {
    const user = userEvent.setup()
    const schema = useBuilderStore.getState().schema
    render(<DynamicForm schema={schema} />)

    const first = screen.getByLabelText(/First name/i)
    const second = screen.getByLabelText(/Last name/i)

    await user.type(first, 'Grace')
    await user.type(second, 'Hopper')
    await user.clear(first)
    await user.type(first, 'Ada')

    expect(first).toHaveValue('Ada')
    expect(second).toHaveValue('Hopper')
  })

  it('shows required error for empty number and accepts numeric string input', async () => {
    const user = userEvent.setup()
    render(<DynamicForm schema={createNumberSchema(true)} />)

    await user.click(screen.getByRole('button', { name: /submit/i }))
    expect(await screen.findByText(/Age is required/i)).toBeInTheDocument()

    await user.type(screen.getByLabelText(/Age/i), '42')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(screen.getByText(/Submitted values/i)).toBeInTheDocument()
    })
    expect(screen.getByText(/"age": 42/)).toBeInTheDocument()
  })
})
