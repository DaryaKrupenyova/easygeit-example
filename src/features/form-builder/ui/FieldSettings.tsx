import type { SelectOption } from '@/entities/form-schema'
import { useBuilderStore } from '@/features/form-builder/model/store'
import type { FieldPatch } from '@/features/form-builder/model/fieldPatch'
import { Button } from '@/shared/ui/Button'
import { FieldError } from '@/shared/ui/FieldError'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Textarea } from '@/shared/ui/Textarea'

function updateOption(
  options: SelectOption[],
  index: number,
  patch: Partial<SelectOption>,
): SelectOption[] {
  return options.map((option, optionIndex) =>
    optionIndex === index ? { ...option, ...patch } : option,
  )
}

export function FieldSettings() {
  const selectedFieldId = useBuilderStore((state) => state.selectedFieldId)
  const field = useBuilderStore((state) =>
    state.selectedFieldId ? state.schema.fields[state.selectedFieldId] : null,
  )
  const fieldNameError = useBuilderStore((state) => state.fieldNameError)
  const updateField = useBuilderStore((state) => state.updateField)

  if (!selectedFieldId || !field) {
    return (
      <aside className="flex h-full flex-col p-4" aria-label="Field settings">
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
          Field settings
        </h2>
        <p className="mt-4 text-sm leading-6 text-muted">
          Select a field on the canvas to edit its label, validation, and options.
        </p>
      </aside>
    )
  }

  const patchField = (patch: FieldPatch) => {
    updateField(field.id, patch)
  }

  return (
    <aside className="flex h-full flex-col gap-4 overflow-auto p-4" aria-label="Field settings">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
          Field settings
        </h2>
        <p className="mt-1 text-sm text-muted">
          Type: {field.type} (changing field type is not supported yet)
        </p>
      </div>

      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="field-label">Label</Label>
          <Input
            id="field-label"
            value={field.label}
            onChange={(event) => patchField({ label: event.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="field-name">Name</Label>
          <Input
            id="field-name"
            value={field.name}
            invalid={Boolean(fieldNameError)}
            aria-invalid={Boolean(fieldNameError) || undefined}
            aria-describedby={fieldNameError ? 'field-name-error' : undefined}
            onChange={(event) =>
              patchField({
                name: event.target.value.replace(/\s+/g, '_').toLowerCase(),
              })
            }
          />
          <FieldError id="field-name-error" message={fieldNameError ?? undefined} />
          <p className="text-xs text-muted">Must be unique across the whole form.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="field-description">Description</Label>
          <Textarea
            id="field-description"
            rows={3}
            value={field.description ?? ''}
            onChange={(event) => patchField({ description: event.target.value })}
          />
        </div>

        {field.type !== 'checkbox' ? (
          <div className="space-y-1.5">
            <Label htmlFor="field-placeholder">Placeholder</Label>
            <Input
              id="field-placeholder"
              value={field.placeholder ?? ''}
              onChange={(event) => patchField({ placeholder: event.target.value })}
            />
          </div>
        ) : null}

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-line text-accent"
            checked={field.required}
            onChange={(event) => patchField({ required: event.target.checked })}
          />
          Required field
        </label>

        {(field.type === 'text' || field.type === 'textarea') && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="field-min-length">Min length</Label>
              <Input
                id="field-min-length"
                type="number"
                value={field.minLength ?? ''}
                onChange={(event) =>
                  patchField({
                    minLength:
                      event.target.value === '' ? undefined : Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="field-max-length">Max length</Label>
              <Input
                id="field-max-length"
                type="number"
                value={field.maxLength ?? ''}
                onChange={(event) =>
                  patchField({
                    maxLength:
                      event.target.value === '' ? undefined : Number(event.target.value),
                  })
                }
              />
            </div>
          </div>
        )}

        {field.type === 'textarea' ? (
          <div className="space-y-1.5">
            <Label htmlFor="field-rows">Rows</Label>
            <Input
              id="field-rows"
              type="number"
              min={2}
              value={field.rows ?? 4}
              onChange={(event) =>
                patchField({
                  rows: Number(event.target.value) || 4,
                })
              }
            />
          </div>
        ) : null}

        {field.type === 'number' ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="field-min">Min</Label>
              <Input
                id="field-min"
                type="number"
                value={field.min ?? ''}
                onChange={(event) =>
                  patchField({
                    min: event.target.value === '' ? undefined : Number(event.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="field-max">Max</Label>
              <Input
                id="field-max"
                type="number"
                value={field.max ?? ''}
                onChange={(event) =>
                  patchField({
                    max: event.target.value === '' ? undefined : Number(event.target.value),
                  })
                }
              />
            </div>
          </div>
        ) : null}

        {field.type === 'select' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Options</Label>
              <Button
                size="sm"
                onClick={() =>
                  patchField({
                    options: [
                      ...field.options,
                      {
                        label: `Option ${field.options.length + 1}`,
                        value: `option_${field.options.length + 1}`,
                      },
                    ],
                  })
                }
              >
                Add option
              </Button>
            </div>

            <div className="space-y-2">
              {field.options.map((option, index) => (
                <div
                  key={`${option.value}-${index}`}
                  className="grid grid-cols-[1fr_1fr_auto] gap-2"
                >
                  <Input
                    aria-label={`Option ${index + 1} label`}
                    value={option.label}
                    onChange={(event) =>
                      patchField({
                        options: updateOption(field.options, index, {
                          label: event.target.value,
                        }),
                      })
                    }
                  />
                  <Input
                    aria-label={`Option ${index + 1} value`}
                    value={option.value}
                    onChange={(event) =>
                      patchField({
                        options: updateOption(field.options, index, {
                          value: event.target.value,
                        }),
                      })
                    }
                  />
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={field.options.length <= 1}
                    aria-label={`Remove option ${index + 1}`}
                    onClick={() =>
                      patchField({
                        options: field.options.filter(
                          (_, optionIndex) => optionIndex !== index,
                        ),
                      })
                    }
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
