import { useBuilderStore } from '@/features/form-builder/model/store'
import { DynamicForm } from '@/features/form-preview/ui/DynamicForm'
import { Button } from '@/shared/ui/Button'

const SIZES = [100, 300, 500] as const

export function PerformanceTest() {
  const schema = useBuilderStore((state) => state.schema)
  const generatePerformanceSchema = useBuilderStore(
    (state) => state.generatePerformanceSchema,
  )
  const fieldCount = Object.keys(schema.fields).length

  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 overflow-auto p-4 md:p-6">
      <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Performance Test</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
          Generate a large form and type into a single field. Each field uses
          React Hook Form&apos;s <code className="rounded bg-slate-100 px-1">useController</code>{' '}
          so updates stay local. Render counters appear in development only —
          compare them yourself; no performance claims are asserted here.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {SIZES.map((size) => (
            <Button
              key={size}
              variant={fieldCount === size ? 'primary' : 'secondary'}
              onClick={() => generatePerformanceSchema(size)}
            >
              Generate {size} fields
            </Button>
          ))}
        </div>

        <p className="mt-3 text-sm text-muted">Current field count: {fieldCount}</p>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm">
        <DynamicForm
          key={`${schema.id}-${fieldCount}`}
          schema={schema}
          showRenderCount
          submitLabel="Validate form"
        />
      </div>
    </div>
  )
}
