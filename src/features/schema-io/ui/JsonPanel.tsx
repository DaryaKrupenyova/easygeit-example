import { useMemo, useRef } from 'react'

import { useBuilderStore } from '@/features/form-builder/model/store'
import {
  MAX_IMPORT_BYTES,
  downloadSchema,
  readSchemaFile,
  serializeSchema,
} from '@/features/schema-io/lib/schemaIo'
import { Button } from '@/shared/ui/Button'

export function JsonPanel() {
  const schema = useBuilderStore((state) => state.schema)
  const importError = useBuilderStore((state) => state.importError)
  const replaceSchema = useBuilderStore((state) => state.replaceSchema)
  const setImportError = useBuilderStore((state) => state.setImportError)
  const clearImportError = useBuilderStore((state) => state.clearImportError)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const json = useMemo(() => serializeSchema(schema), [schema])

  const handleImport = async (file: File | undefined) => {
    if (!file) return

    const result = await readSchemaFile(file)
    if (!result.ok) {
      setImportError(result.error)
      return
    }

    replaceSchema(result.schema)
  }

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-col gap-4 overflow-auto p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-ink">JSON configuration</h2>
          <p className="mt-1 text-sm text-muted">
            Custom app schema format validated with Zod on import. Max file size:{' '}
            {(MAX_IMPORT_BYTES / (1024 * 1024)).toFixed(0)} MiB.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => downloadSchema(schema)}>Export JSON</Button>
          <Button variant="primary" onClick={() => fileInputRef.current?.click()}>
            Import JSON
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            aria-label="Import form schema JSON file"
            onChange={(event) => {
              void handleImport(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </div>
      </div>

      {importError ? (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-danger-soft px-4 py-3 text-sm text-danger"
        >
          <p>{importError}</p>
          <Button
            size="sm"
            variant="ghost"
            aria-label="Dismiss import error"
            onClick={clearImportError}
          >
            Dismiss
          </Button>
        </div>
      ) : null}

      <pre className="overflow-auto rounded-2xl border border-line bg-slate-950 p-4 text-xs leading-6 text-slate-100 shadow-sm">
        {json}
      </pre>
    </div>
  )
}
