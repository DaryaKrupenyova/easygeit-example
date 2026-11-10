# Schema Form Builder

A small, production-shaped React + TypeScript project that turns a typed JSON configuration into an editable form builder, live preview, and validated runtime form.

Built as a portfolio piece: clear architecture, strict typing, local-only state, and focused tests — without a backend.

## Features

- Visual form builder with field palette, canvas, and settings panel
- Field types: `text`, `number`, `textarea`, `select`, `checkbox`, `date`
- Sections with titles/descriptions; drag-and-drop reorder and cross-section moves (pointer + keyboard)
- Duplicate / delete fields with globally unique `name` values
- Preview tab that renders a real form from the current schema
- Zod-driven validation based on field settings
- JSON tab: view / export / import of the custom schema format (Zod-validated, 1 MiB import limit)
- Performance Test mode that can generate 100 / 300 / 500 fields
- Development-only per-field render counters in Performance Test

## Stack

- React 18
- TypeScript (strict)
- Vite
- React Hook Form + `@hookform/resolvers`
- Zod
- Zustand
- Tailwind CSS
- dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`)
- Vitest + React Testing Library
- Oxlint

## Architecture

Lightweight Feature-Sliced Design without deep nesting:

```text
src/
  main.tsx / App.tsx         # app entry
  entities/form-schema       # domain types, Zod config schema, factories, unique names
  features/
    form-builder             # Zustand store + builder UI (palette, canvas, settings)
    form-preview             # RHF dynamic form + validation builder
    schema-io                # import / export / parse
    performance-test         # large-form demo mode
  shared/                    # UI primitives + helpers
  widgets/workspace          # product shell (header + tab panels)
```

### State ownership

| Concern | Store | Why |
| --- | --- | --- |
| Form structure (fields, sections, selection, active tab) | Zustand | Shared across Builder / JSON / Performance tabs |
| User-entered values in Preview / Performance | React Hook Form | Field-local subscriptions and submit/validation lifecycle |

Values are intentionally **not** mirrored into Zustand.

### Schema format

The JSON format is **application-specific**, not JSON Schema and not XSD. Import always runs through Zod (`formSchemaSchema`), including:

- unique `sections[].id`
- unique field `name` values
- referential integrity between `sections[].fieldIds` and `fields`
- clear errors for repeated `fieldIds` in one section

`id` and `name` are different concepts: `id` is the stable entity key; `name` is the RHF/input key and must be unique across the form.

## Getting started

```bash
npm install
npm run dev
```

Open the printed local URL (Vite default: `http://localhost:5173`).

## Scripts

```bash
npm run dev        # development server
npm run build      # typecheck + production bundle
npm run typecheck  # TypeScript project references check
npm run lint       # Oxlint
npm test           # Vitest once (excludes slow perf harness)
npm run test:perf  # 500-field isolation measurement (jsdom)
npm run test:watch # Vitest watch mode
npm run preview    # preview production build
```

## Testing

Tests cover store mutations (add/remove/duplicate/move/section delete, unique names), schema import validation, numeric Zod rules, RTL flows (required validation, focus on first error, revalidate-after-fix, neighboring value retention).

```bash
npm test
```

## Performance approach

Performance Test is a **demo harness**, not a published benchmark suite.

What it demonstrates:

- Each preview field uses React Hook Form `useController`, so typing in one field updates that field’s subscription
- Validation uses `mode: 'onSubmit'` and `reValidateMode: 'onChange'` (errors clear after the first submit when the edited value becomes valid). Zod object parsing for hundreds of simple fields is cheap compared with DOM work; the goal is to avoid validating on every keystroke *before* submit
- `React.memo` on `DynamicField` only helps when the parent re-renders with stable field props; **isolation while typing comes from RHF subscriptions, not from memo**
- Schema generation lives in Zustand; entered values stay in RHF
- Render counters appear only in `import.meta.env.DEV`

### Measured isolation (jsdom / Vitest)

On a generated form of **500 text fields** (no browser layout/paint):

- Mount ≈ hundreds of ms in jsdom
- Typing three characters into one field increased that field’s render counter only; neighboring counters stayed unchanged
- Neighboring input values were preserved

Treat jsdom timings as relative signals, not production browser metrics. Real-browser FPS/scroll/TTI for 500 fields were not claimed here; there is still **no list virtualization**, so initial mount/DOM size remains the main cost.

## Known limitations

- Field **type cannot be changed** after creation (documented trade-off; recreate the field instead)
- No persistence beyond the current browser session
- No collaboration / multi-user editing
- No conditional visibility rules
- Select options are flat; no option groups
- Performance Test has no virtualization — 500 fields mount the full DOM
- Keyboard DnD is supported via dnd-kit sensors; complex multi-section keyboard flows can still be polished further

## Possible next steps

- Undo/redo for builder actions
- Optional field-type migration UI
- Conditional visibility rules
- LocalStorage autosave
- Virtualized Performance Test list
- Storybook for shared UI primitives
