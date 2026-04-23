# inject

## Purpose

Inject-flow-specific ink UI. Each file exposes an `…Async()` helper that `program.ts` injects into the commander layer as a render hook.

## Structure

- `index.ts` — barrel (`selectScopeAsync`, `confirmForceAsync`)
- `ScopeSelect.tsx` — `ink-select-input` prompt for `user | project | local`
- `ForceConfirm.tsx` — lists diverged/orphan file names (up to 3) + reuses `shared/Confirm.tsx` for the y/N answer; returns via Promise

## Conventions

- UI entry points return Promises, not callbacks (commander layer awaits them)
- Each render helper calls `render(...).unmount()` to release the TTY after resolving

## Boundaries

### Always do

- Render promise-returning helpers so the commander action can `await` them
- Reuse `primitives/` and `shared/` rather than touching `ink` directly

### Ask first

- Adding a new inject-flow UI surface beyond the scope picker and force confirm

### Never do

- Call `injectDocs` or any `core/` logic from inside a component — compose at `program.ts`
- Read filesystem state from the component tree
