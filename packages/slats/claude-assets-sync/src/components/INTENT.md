# components

## Purpose

Container fractal holding all ink UI for the inject flow. Groups low-level primitives, generic shared controls, and inject-specific prompts behind a single barrel.

## Structure

- `index.ts` — barrel re-exporting `primitives/`, `shared/`, `inject/`
- `primitives/` — thin ink wrappers (fractal)
- `shared/` — generic ink controls like `Confirm` (fractal)
- `inject/` — inject-flow UI: `ScopeSelect`, `ForceConfirm` (fractal)

## Conventions

- Every sub-directory is a fractal with its own `INTENT.md` and barrel
- Consumers outside this tree import from `components/index.ts`, never from sub-sub files

## Boundaries

### Always do

- Route new inject-flow UI into `inject/`; generic reusable controls into `shared/`; ink API shims into `primitives/`
- Keep UI free of `core/` logic — compose render hooks at `program.ts` instead

### Ask first

- Adding a fourth child fractal (e.g., `status/`, `list/`) — growth should be justified by a new commander command, not by UI restructuring

### Never do

- Mix fractal and non-fractal directories here
- Bypass child barrels (no deep imports from `components/inject/ScopeSelect.js` etc.)
