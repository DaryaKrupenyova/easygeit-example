import { FIELD_TYPE_META, type FieldType } from '@/entities/form-schema'
import { useBuilderStore } from '@/features/form-builder/model/store'
import { Button } from '@/shared/ui/Button'

export function FieldPalette() {
  const addField = useBuilderStore((state) => state.addField)
  const addSection = useBuilderStore((state) => state.addSection)
  const selectedSectionId = useBuilderStore((state) => state.selectedSectionId)

  const handleAdd = (type: FieldType) => {
    addField(type, selectedSectionId ?? undefined)
  }

  return (
    <aside className="flex h-full flex-col gap-4 overflow-auto p-4">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-[0.08em] text-muted">
          Field types
        </h2>
        <p className="mt-1 text-sm text-muted">
          Drop into the selected section or append to the first one.
        </p>
      </div>

      <div className="grid gap-2">
        {FIELD_TYPE_META.map((item) => (
          <button
            key={item.type}
            type="button"
            onClick={() => handleAdd(item.type)}
            className="rounded-xl border border-line bg-panel px-3 py-3 text-left transition-colors hover:border-accent hover:bg-accent-soft/40"
          >
            <div className="text-sm font-semibold text-ink">{item.label}</div>
            <div className="mt-0.5 text-xs leading-5 text-muted">{item.description}</div>
          </button>
        ))}
      </div>

      <div className="mt-auto border-t border-line pt-4">
        <Button className="w-full" onClick={addSection}>
          Add section
        </Button>
      </div>
    </aside>
  )
}
