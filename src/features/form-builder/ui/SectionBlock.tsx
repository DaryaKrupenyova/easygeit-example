import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'

import type { FormField, FormSection } from '@/entities/form-schema'
import { useBuilderStore } from '@/features/form-builder/model/store'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'

import { SortableFieldCard } from './SortableFieldCard'

interface SectionBlockProps {
  section: FormSection
  fields: FormField[]
}

export function SectionBlock({ section, fields }: SectionBlockProps) {
  const selectedSectionId = useBuilderStore((state) => state.selectedSectionId)
  const selectSection = useBuilderStore((state) => state.selectSection)
  const updateSection = useBuilderStore((state) => state.updateSection)
  const removeSection = useBuilderStore((state) => state.removeSection)
  const sectionsCount = useBuilderStore((state) => state.schema.sections.length)

  const { setNodeRef, isOver } = useDroppable({
    id: section.id,
    data: {
      type: 'section',
      sectionId: section.id,
    },
  })

  return (
    <section
      className={cn(
        'rounded-2xl border bg-panel/80 p-4 shadow-sm backdrop-blur-sm',
        selectedSectionId === section.id ? 'border-accent' : 'border-line',
        isOver && 'border-accent bg-accent-soft/30',
      )}
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Input
            value={section.title}
            aria-label="Section title"
            onFocus={() => selectSection(section.id)}
            onChange={(event) => updateSection(section.id, { title: event.target.value })}
          />
          <Textarea
            value={section.description ?? ''}
            aria-label="Section description"
            rows={2}
            className="min-h-16"
            onFocus={() => selectSection(section.id)}
            onChange={(event) =>
              updateSection(section.id, { description: event.target.value })
            }
          />
        </div>
        <Button
          variant="danger"
          size="sm"
          disabled={sectionsCount <= 1}
          onClick={() => removeSection(section.id)}
        >
          Remove section
        </Button>
      </div>

      <div ref={setNodeRef} className="min-h-16 space-y-3">
        <SortableContext items={section.fieldIds} strategy={verticalListSortingStrategy}>
          {fields.map((field) => (
            <SortableFieldCard key={field.id} field={field} />
          ))}
        </SortableContext>

        {fields.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted">
            Drop fields here or add them from the left palette.
          </div>
        ) : null}
      </div>
    </section>
  )
}
