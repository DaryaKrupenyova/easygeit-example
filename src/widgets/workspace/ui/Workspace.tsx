import { useBuilderStore } from '@/features/form-builder/model/store'
import { BuilderCanvas } from '@/features/form-builder/ui/BuilderCanvas'
import { FieldPalette } from '@/features/form-builder/ui/FieldPalette'
import { FieldSettings } from '@/features/form-builder/ui/FieldSettings'
import { DynamicForm } from '@/features/form-preview/ui/DynamicForm'
import { PerformanceTest } from '@/features/performance-test/ui/PerformanceTest'
import { JsonPanel } from '@/features/schema-io/ui/JsonPanel'

import { AppHeader } from './AppHeader'

export function Workspace() {
  const activeTab = useBuilderStore((state) => state.activeTab)
  const schema = useBuilderStore((state) => state.schema)

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      {activeTab === 'builder' ? (
        <div
          id="panel-builder"
          role="tabpanel"
          aria-labelledby="tab-builder"
          className="grid min-h-0 flex-1 lg:grid-cols-[240px_minmax(0,1fr)_300px]"
        >
          <div className="border-b border-line bg-panel/70 lg:border-b-0 lg:border-r">
            <FieldPalette />
          </div>
          <div className="min-h-[50vh] border-b border-line lg:border-b-0">
            <BuilderCanvas />
          </div>
          <div className="bg-panel/70 lg:border-l lg:border-line">
            <FieldSettings />
          </div>
        </div>
      ) : null}

      {activeTab === 'preview' ? (
        <div
          id="panel-preview"
          role="tabpanel"
          aria-labelledby="tab-preview"
          className="mx-auto w-full max-w-3xl flex-1 overflow-auto p-4 md:p-8"
        >
          <div className="rounded-2xl border border-line bg-panel p-5 shadow-sm md:p-8">
            <DynamicForm key={schema.id} schema={schema} />
          </div>
        </div>
      ) : null}

      {activeTab === 'json' ? (
        <div id="panel-json" role="tabpanel" aria-labelledby="tab-json" className="flex-1">
          <JsonPanel />
        </div>
      ) : null}

      {activeTab === 'performance' ? (
        <div
          id="panel-performance"
          role="tabpanel"
          aria-labelledby="tab-performance"
          className="flex-1"
        >
          <PerformanceTest />
        </div>
      ) : null}
    </div>
  )
}
