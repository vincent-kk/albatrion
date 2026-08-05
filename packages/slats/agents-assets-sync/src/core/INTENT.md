# core

## Purpose

UI-free, stateless primitives for agent asset injection. Seven
sub-fractals compose the pipeline: locate the project, decide where each
agent keeps things, compare, and apply. Both the Ink (`ui/`) and plain
(`commands/.../renderPlain.ts`) renderers consume these primitives
directly — no orchestrator function lives here.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — aggregates public symbols
- `hash/` — SHA-256 content primitives
- `hashManifest/` — `dist/agents-hashes.json` IO + namespace prefixes
- `scope/` — `user | project` → one agent-neutral project root
- `agentTarget/` — project root → per-agent destinations + orphan scans
- `markerBlock/` — this tool's own blocks inside a shared `AGENTS.md`
- `buildPlan/` — plan builder (copy / skip / diverged / orphan / delete)
- `injectDocs/` — partition + apply + summarize (no orchestrator)

## Conventions

- Dependencies run one way, and every edge crosses a sibling's
  `index.ts`:
  - `hash → hashManifest`, `hash → markerBlock`, `hash → buildPlan`
  - `scope → agentTarget`, `markerBlock → agentTarget`
  - `agentTarget → buildPlan`, `markerBlock → buildPlan`
  - `buildPlan → injectDocs`, `markerBlock → injectDocs`
- `hash/` and `scope/` are the only leaves; the rest build on them. The
  graph stays acyclic.

## Boundaries

### Always do

- Each sub-fractal is reachable only through its `index.ts` barrel
- Propagate exit code through `InjectReport.exitCode` (0 / 1 / 2)

### Ask first

- Adding a sub-fractal, or an agent to `AgentType`
- Expanding the public API beyond what `commands/` and `ui/` consume

### Never do

- Import from `commands/` or `ui/` anywhere in this tree
- Perform TTY prompts — prompting is a renderer concern
- Touch content in a shared document outside this tool's own markers
