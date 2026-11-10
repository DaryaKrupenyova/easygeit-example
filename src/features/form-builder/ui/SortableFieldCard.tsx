import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import type { FormField } from '@/entities/form-schema'
import { useBuilderStore } from '@/features/form-builder/model/store'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'

interface SortableFieldCardProps {
  field: FormField
}

export function SortableFieldCard({ field }: SortableFieldCardProps) {
  // Boolean selector: unselected cards keep `false` and skip re-render on selection changes.
  const isSelected = useBuilderStore((state) => state.selectedFieldId === field.id)
  const selectField = useBuilderStore((state) => state.selectField)
  const removeField = useBuilderStore((state) => state.removeField)
  const duplicateField = useBuilderStore((state) => state.duplicateField)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
    data: {
      type: 'field',
      sectionId: field.sectionId,
    },
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={cn(
        'rounded-xl border bg-panel p-3 shadow-sm transition-colors',
        isSelected ? 'border-accent ring-2 ring-accent/20' : 'border-line hover:border-line-strong',
        isDragging && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          className="mt-0.5 cursor-grab rounded-md border border-line px-2 py-1 text-xs text-muted active:cursor-grabbing"
          aria-label={`Reorder ${field.label}. Press space to pick up, arrow keys to move, space to drop, escape to cancel.`}
          {...attributes}
          {...listeners}
        >
          ::
        </button>

        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          onClick={() => selectField(field.id)}
          aria-pressed={isSelected}
        >
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted">
              {field.type}
            </span>
            {field.required ? (
              <span className="text-[11px] font-medium text-danger">Required</span>
            ) : null}
          </div>
          <div className="mt-1 text-sm font-semibold text-ink">{field.label}</div>
          <div className="text-xs text-muted">name: {field.name}</div>
        </button>

        <div className="flex shrink-0 gap-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => duplicateField(field.id)}
            aria-label={`Duplicate ${field.label}`}
          >
            Copy
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => removeField(field.id)}
            aria-label={`Delete ${field.label}`}
          >
            Del
          </Button>
        </div>
      </div>
    </div>
  )
}
