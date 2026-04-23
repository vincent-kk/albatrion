# shared

## Purpose

Generic ink components reused across inject UI flows.

## Structure

- `index.ts` — barrel export
- `Confirm.tsx` — y/n prompt with a default answer; callback-style (`onConfirm: (yes: boolean) => void`)

## Conventions

- Each component is self-contained, no external state
- Callback props — wrap in a `…Async` helper at the point of use if a Promise API is desired

## Boundaries

### Always do

- Build on top of `primitives/`
- Keep components generic enough to be reused outside the inject flow

### Ask first

- Adding any new shared component (growth pressure should first go to `inject/`)

### Never do

- Hard-code inject-specific copy or exit behavior here
- Import from `core/` or `commands/`
