import { memo, useRef } from 'react'
import { useController, useFormContext } from 'react-hook-form'

import type { FormField } from '@/entities/form-schema'
import { FieldError } from '@/shared/ui/FieldError'
import { Input } from '@/shared/ui/Input'
import { Label } from '@/shared/ui/Label'
import { Select } from '@/shared/ui/Select'
import { Textarea } from '@/shared/ui/Textarea'

import { RenderCountBadge } from './RenderCountBadge'

interface DynamicFieldProps {
  field: FormField
  showRenderCount?: boolean
}

function DynamicFieldComponent({ field, showRenderCount = false }: DynamicFieldProps) {
  const { control } = useFormContext()
  const renderCountRef = useRef(0)
  if (showRenderCount) {
    renderCountRef.current += 1
  }

  const {
    field: { value, onChange, onBlur, name, ref },
    fieldState: { error },
  } = useController({
    name: field.name,
    control,
  })

  const errorId = `${field.id}-error`
  const descriptionId = field.description ? `${field.id}-description` : undefined
  const describedBy =
    [descriptionId, error ? errorId : undefined].filter(Boolean).join(' ') || undefined

  return (
    <div className="space-y-1.5">
      {field.type !== 'checkbox' ? (
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor={field.id}>
            {field.label}
            {field.required ? <span className="text-danger"> *</span> : null}
          </Label>
          {showRenderCount ? <RenderCountBadge count={renderCountRef.current} /> : null}
        </div>
      ) : null}

      {field.description && field.type !== 'checkbox' ? (
        <p id={descriptionId} className="text-sm text-muted">
          {field.description}
        </p>
      ) : null}

      {field.type === 'text' || field.type === 'date' ? (
        <Input
          id={field.id}
          type={field.type}
          name={name}
          placeholder={field.placeholder}
          invalid={Boolean(error)}
          required={field.required}
          aria-required={field.required || undefined}
          aria-describedby={describedBy}
          ref={ref}
          onBlur={onBlur}
          onChange={onChange}
          value={String(value ?? '')}
        />
      ) : null}

      {field.type === 'number' ? (
        <Input
          id={field.id}
          type="number"
          name={name}
          placeholder={field.placeholder}
          invalid={Boolean(error)}
          required={field.required}
          aria-required={field.required || undefined}
          min={field.min}
          max={field.max}
          aria-describedby={describedBy}
          ref={ref}
          onBlur={onBlur}
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(event) => {
            onChange(event.target.value === '' ? '' : event.target.value)
          }}
        />
      ) : null}

      {field.type === 'textarea' ? (
        <Textarea
          id={field.id}
          name={name}
          placeholder={field.placeholder}
          rows={field.rows ?? 4}
          invalid={Boolean(error)}
          required={field.required}
          aria-required={field.required || undefined}
          aria-describedby={describedBy}
          ref={ref}
          onBlur={onBlur}
          onChange={onChange}
          value={String(value ?? '')}
        />
      ) : null}

      {field.type === 'select' ? (
        <Select
          id={field.id}
          name={name}
          invalid={Boolean(error)}
          required={field.required}
          aria-required={field.required || undefined}
          aria-describedby={describedBy}
          ref={ref}
          onBlur={onBlur}
          onChange={onChange}
          value={String(value ?? '')}
        >
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      ) : null}

      {field.type === 'checkbox' ? (
        <div className="flex items-start gap-3 rounded-lg border border-line bg-panel px-3 py-3">
          <input
            id={field.id}
            type="checkbox"
            name={name}
            className="mt-0.5 h-4 w-4 rounded border-line text-accent focus:ring-accent"
            checked={Boolean(value)}
            onChange={(event) => onChange(event.target.checked)}
            onBlur={onBlur}
            ref={ref}
            required={field.required}
            aria-required={field.required || undefined}
            aria-describedby={describedBy}
            aria-invalid={Boolean(error) || undefined}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor={field.id} className="font-medium">
                {field.label}
                {field.required ? <span className="text-danger"> *</span> : null}
              </Label>
              {showRenderCount ? <RenderCountBadge count={renderCountRef.current} /> : null}
            </div>
            {field.description ? (
              <p id={descriptionId} className="mt-1 text-sm text-muted">
                {field.description}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      <FieldError id={errorId} message={error?.message} />
    </div>
  )
}

export const DynamicField = memo(DynamicFieldComponent)
