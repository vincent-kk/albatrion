# scope

## Purpose

Convert a `user | project` scope token into an absolute target
directory (`targetRoot`) with user-facing metadata. `project` walks up
from `cwd` and reuses the nearest existing `.claude` ancestor.

## Structure

- `index.ts` — barrel export
- `scope.ts` — `resolveScope`, `isValidScope`, `findNearestDotClaudeAncestor` + types
- `utils/isDirectory.ts` — sync stat-based directory check (sole helper)

## Boundaries

### Always do

- Attach `auto-located` marker to the description when reusing an
  ancestor `.claude`
- Keep the module synchronous and deterministic

### Ask first

- Adding a scope token beyond `user | project`
- Changing walk-up policy (e.g., stop at repo root, respect `.git`)

### Never do

- Import from `injectDocs/`, `buildPlan/`, `commands/`, or `ui/`
- Use network or async IO
