# injectDocs

## Purpose

Apply + summarize primitives for Claude docs injection. Consumed by
both the Ink (`ui/`) and plain (`renderPlain`) renderers. No
orchestrator lives here; callers drive the pipeline themselves.

## Structure

- `index.ts` — barrel export
- `type.ts` — `InjectReport`
- `utils/applyAction.ts` — per-`Action` filesystem mutation
- `utils/summarize.ts` — `InjectPlan` → `InjectReport` aggregation

## Boundaries

### Always do

- Keep `applyAction` focused on one file per call (copy or delete)
- Keep `summarize` pure — no filesystem, no env reads
- Return correct `exitCode` (0 / 1 / 2) on the `InjectReport`

### Ask first

- Adding a new `Action.kind` — callers must be updated in lockstep
- Reintroducing an orchestrator function; both renderers compose
  primitives today

### Never do

- Import from `commands/` or `ui/`
- Re-introduce `printPlan` / `emitCiForceList` — those are renderer
  responsibilities and must live in `commands/` or `ui/`
- Re-introduce `.sync-meta.json` or other legacy sync state
