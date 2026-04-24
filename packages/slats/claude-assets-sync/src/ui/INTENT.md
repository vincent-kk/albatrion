# ui

## Purpose

React + Ink UI layer for the TTY path of `inject-claude-settings`.
Exposes `renderInjectApp(input)` which mounts an Ink app that resolves
scope, builds per-target plans, requests force-confirm, applies actions,
and returns a final exit code. The module is reached only through
dynamic `import('./ui/index.js')` from
`commands/runCli/utils/renderOrFallback.ts`; it is not a public
subpath export.

## Structure

- `INTENT.md`, `DETAIL.md`, `index.ts`
- `InjectApp/` — main Ink screen + phase state machine (fractal)
- `components/` — Ink UI primitives (organ)
- `hooks/` — Ink-aware React hooks including pipeline steps (organ)
- `theme/` — colors, icons, layout tokens (organ)
- `types/` — split into `phase`, `event`, `render`, `target` (organ)

## Boundaries

### Always do

- Compose `core/**` primitives directly (`readHashManifest`,
  `resolveScope`, `computeNamespacePrefixes`, `buildPlan`, `asyncPool`,
  `applyAction`, `summarize`) to drive the pipeline
- Batch progress updates via `useInterval` so Ink frame renders stay
  below 20Hz total
- Surface the final exit code through `useExitApp` so `renderInjectApp`
  resolves with a `number`

### Ask first

- Adding a new Ink entry beyond `renderInjectApp` (e.g. a standalone
  report viewer)
- Introducing a global UI store (Zustand/Redux). Per-hook `useReducer`
  is the current pattern.

### Never do

- Write to `process.stdout`/`stderr` directly; all output goes through
  Ink's virtual DOM
- Import from `commands/**`
- Read `package.json` or walk `node_modules`; consume
  `ConsumerPackage[]` provided by the caller
