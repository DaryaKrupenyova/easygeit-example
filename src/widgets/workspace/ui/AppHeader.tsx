import type { KeyboardEvent } from 'react'

import type { AppTab } from '@/entities/form-schema'
import { useBuilderStore } from '@/features/form-builder/model/store'
import { downloadSchema } from '@/features/schema-io/lib/schemaIo'
import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/ui/Button'

const TABS: Array<{ id: AppTab; label: string; panelId: string }> = [
  { id: 'builder', label: 'Builder', panelId: 'panel-builder' },
  { id: 'preview', label: 'Preview', panelId: 'panel-preview' },
  { id: 'json', label: 'JSON', panelId: 'panel-json' },
  { id: 'performance', label: 'Performance Test', panelId: 'panel-performance' },
]

export function AppHeader() {
  const activeTab = useBuilderStore((state) => state.activeTab)
  const setActiveTab = useBuilderStore((state) => state.setActiveTab)
  const schema = useBuilderStore((state) => state.schema)
  const resetSchema = useBuilderStore((state) => state.resetSchema)
  const loadDemoSchema = useBuilderStore((state) => state.loadDemoSchema)

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft' && event.key !== 'Home' && event.key !== 'End') {
      return
    }

    event.preventDefault()

    let nextIndex = index
    if (event.key === 'ArrowRight') {
      nextIndex = (index + 1) % TABS.length
    } else if (event.key === 'ArrowLeft') {
      nextIndex = (index - 1 + TABS.length) % TABS.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = TABS.length - 1
    }

    const nextTab = TABS[nextIndex]
    if (!nextTab) return

    setActiveTab(nextTab.id)
    requestAnimationFrame(() => {
      document.getElementById(`tab-${nextTab.id}`)?.focus()
    })
  }

  return (
    <header className="border-b border-line bg-panel/90 backdrop-blur">
      <div className="flex flex-col gap-4 px-4 py-4 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
              Schema Form Builder
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink md:text-2xl">
              Design forms as data
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={loadDemoSchema}>
              Load demo
            </Button>
            <Button size="sm" onClick={resetSchema}>
              New form
            </Button>
            <Button size="sm" variant="primary" onClick={() => downloadSchema(schema)}>
              Export
            </Button>
          </div>
        </div>

        <div
          role="tablist"
          aria-label="Workspace views"
          className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1"
        >
          {TABS.map((tab, index) => {
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls={tab.panelId}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  selected ? 'bg-panel text-ink shadow-sm' : 'text-muted hover:text-ink',
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
