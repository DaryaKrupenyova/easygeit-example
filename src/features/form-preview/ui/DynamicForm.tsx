import { useMemo, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import type { FormSchema } from '@/entities/form-schema'
import { Button } from '@/shared/ui/Button'

import {
  buildDefaultValues,
  buildValidationSchema,
  type FormValues,
} from '../lib/buildValidationSchema'
import { DynamicField } from './DynamicField'

interface DynamicFormProps {
  schema: FormSchema
  showRenderCount?: boolean
  submitLabel?: string
}

export function DynamicForm({
  schema,
  showRenderCount = false,
  submitLabel = 'Submit',
}: DynamicFormProps) {
  const [submitted, setSubmitted] = useState<FormValues | null>(null)

  const validationSchema = useMemo(() => buildValidationSchema(schema), [schema])
  const defaultValues = useMemo(() => buildDefaultValues(schema), [schema])

  const methods = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues,
    // Validate on submit first; after a failed submit, re-check the edited field on change.
    // Zod object parse for hundreds of simple fields is cheap vs React DOM work.
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    shouldUnregister: false,
    shouldFocusError: true,
  })

  return (
    <FormProvider {...methods}>
      <form
        className="space-y-8"
        onSubmit={methods.handleSubmit((values) => {
          setSubmitted(values)
        })}
        noValidate
      >
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">{schema.title}</h2>
          {schema.description ? (
            <p className="max-w-2xl text-sm leading-6 text-muted">{schema.description}</p>
          ) : null}
        </header>

        {schema.sections.map((section) => (
          <section key={section.id} className="space-y-5" aria-labelledby={`${section.id}-title`}>
            <div className="space-y-1 border-b border-line pb-3">
              <h3 id={`${section.id}-title`} className="text-lg font-semibold text-ink">
                {section.title}
              </h3>
              {section.description ? (
                <p className="text-sm text-muted">{section.description}</p>
              ) : null}
            </div>

            <div className="grid gap-5">
              {section.fieldIds.map((fieldId) => {
                const field = schema.fields[fieldId]
                if (!field) return null

                return (
                  <DynamicField
                    key={field.id}
                    field={field}
                    showRenderCount={showRenderCount}
                  />
                )
              })}
            </div>
          </section>
        ))}

        <div className="flex items-center gap-3">
          <Button type="submit" variant="primary">
            {submitLabel}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              methods.reset(defaultValues)
              setSubmitted(null)
            }}
          >
            Reset
          </Button>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-line bg-slate-50 p-4">
            <p className="mb-2 text-sm font-medium text-ink">Submitted values</p>
            <pre className="overflow-x-auto text-xs leading-5 text-muted">
              {JSON.stringify(submitted, null, 2)}
            </pre>
          </div>
        ) : null}
      </form>
    </FormProvider>
  )
}
