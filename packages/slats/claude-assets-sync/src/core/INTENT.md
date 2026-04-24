# core

## Purpose

UI-free, stateless primitives for Claude docs injection. Five leaf
fractals (`hash`, `hashManifest`, `scope`, `buildPlan`, `injectDocs`)
compose the pipeline. Both the Ink (`ui/`) and plain (`commands/.../
renderPlain.ts`) renderers consume these primitives directly — no
orchestrator function lives here.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — aggregates public symbols
- `hash/` — SHA-256 content primitives
- `hashManifest/` — `dist/claude-hashes.json` IO + namespace prefixes
- `scope/` — `user | project` → target path resolution
- `buildPlan/` — plan builder (copy / skip / diverged / orphan / delete)
- `injectDocs/` — apply + summarize primitives (no orchestrator)

## Boundaries

### Always do

- Each sub-fractal is reachable only through its `index.ts` barrel
- Propagate exit code through `InjectReport.exitCode` (0 / 1 / 2)

### Ask first

- Adding a new sub-fractal beyond the five above
- Expanding the public API beyond what `commands/` and `ui/` consume

### Never do

- Import from `commands/` or `ui/` anywhere in this tree
- Perform TTY prompts — prompting is a renderer concern
- Re-introduce GitHub fetch, `.sync-meta.json`, or legacy sync state
