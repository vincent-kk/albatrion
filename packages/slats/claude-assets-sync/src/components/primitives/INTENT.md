# primitives

## Purpose

Thin ink wrappers used as the building blocks for every higher-level inject UI.

## Structure

- `index.ts` — barrel export
- `Box.tsx` — layout container (ink Box passthrough)
- `Text.tsx` — styled text (ink Text passthrough)

## Conventions

- Stay a thin wrapper; no business logic here
- Props types extend ink's originals; re-export the `Props` type alongside the component

## Boundaries

### Always do

- Centralize ink API changes in this module
- Downstream components import Box/Text from here, not from ink directly

### Ask first

- Adding a new primitive component
- Switching the underlying terminal UI library away from ink

### Never do

- Depend on `react-dom`, runtime stores, or any non-ink UI library
- Read from or write to the filesystem / network
