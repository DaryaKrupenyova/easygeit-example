import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'

import { useBuilderStore } from '@/features/form-builder/model/store'
import { Input } from '@/shared/ui/Input'
import { Textarea } from '@/shared/ui/Textarea'

import { SectionBlock } from './SectionBlock'

export function BuilderCanvas() {
  const schema = useBuilderStore((state) => state.schema)
  const updateFormMeta = useBuilderStore((state) => state.updateFormMeta)
  const moveField = useBuilderStore((state) => state.moveField)
  const reorderFieldsInSection = useBuilderStore((state) => state.reorderFieldsInSection)

  const [activeFieldId, setActiveFieldId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const fieldsBySection = useMemo(() => {
    return schema.sections.map((section) => ({
      section,
      fields: section.fieldIds
        .map((fieldId) => schema.fields[fieldId])
        .filter((field): field is NonNullable<typeof field> => Boolean(field)),
    }))
  }, [schema])

  const findSectionId = (id: string): string | null => {
    if (schema.sections.some((section) => section.id === id)) {
      return id
    }

    return schema.fields[id]?.sectionId ?? null
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveFieldId(String(event.active.id))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveFieldId(null)

    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)

    const sourceSectionId = findSectionId(activeId)
    const targetSectionId = findSectionId(overId)

    if (!sourceSectionId || !targetSectionId) return

    const targetSection = schema.sections.find((section) => section.id === targetSectionId)
    if (!targetSection) return

    if (sourceSectionId === targetSectionId) {
      const oldIndex = targetSection.fieldIds.indexOf(activeId)
      const newIndex =
        overId === targetSectionId
          ? targetSection.fieldIds.length - 1
          : targetSection.fieldIds.indexOf(overId)

      if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return

      const nextIds = [...targetSection.fieldIds]
      nextIds.splice(oldIndex, 1)
      nextIds.splice(newIndex, 0, activeId)
      reorderFieldsInSection(targetSectionId, nextIds)
      return
    }

    const targetIndex =
      overId === targetSectionId
        ? targetSection.fieldIds.length
        : targetSection.fieldIds.indexOf(overId)

    moveField(
      activeId,
      targetSectionId,
      targetIndex === -1 ? targetSection.fieldIds.length : targetIndex,
    )
  }

  const activeField = activeFieldId ? schema.fields[activeFieldId] : null

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4 md:p-6">
      <div className="rounded-2xl border border-line bg-panel p-4 shadow-sm">
        <div className="space-y-3">
          <Input
            value={schema.title}
            aria-label="Form title"
            className="text-lg font-semibold"
            onChange={(event) => updateFormMeta({ title: event.target.value })}
          />
          <Textarea
            value={schema.description ?? ''}
            aria-label="Form description"
            rows={2}
            className="min-h-16"
            onChange={(event) => updateFormMeta({ description: event.target.value })}
          />
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {fieldsBySection.map(({ section, fields }) => (
            <SectionBlock key={section.id} section={section} fields={fields} />
          ))}
        </div>

        <DragOverlay>
          {activeField ? (
            <div className="rounded-xl border border-accent bg-panel px-4 py-3 text-sm font-medium shadow-lg">
              {activeField.label}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
