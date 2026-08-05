# ui

## Purpose

React + Ink UI layer for the TTY path of `inject-agents-settings`.
Exposes `renderInjectApp(input)` which mounts an Ink app that picks
agents and scope, builds per-target plans, requests force-confirm,
applies actions, and returns a final exit code. Reached only through
dynamic `import('./ui/index.js')` from
`commands/runCli/utils/renderOrFallback.ts`; not a public subpath.

## Structure

- `INTENT.md`, `DETAIL.md`, `index.ts`
- `InjectApp/` — main Ink screen + phase state machine (fractal)
- `components/` — Ink UI primitives (organ)
- `hooks/` — Ink-aware React hooks including pipeline steps (organ)
- `theme/` — colors, icons, layout tokens (organ)
- `types/` — split into `phase`, `event`, `render`, `target` (organ)

## Conventions

- One hook per pipeline step — `useResolveStep`, `usePlanStep`,
  `useForceConfirmStep`, `useApplyStep` — driven by `useInjectSession`.
  Progress is reported per completed action, not on a timer.

## Boundaries

### Always do

- Compose `core/**` primitives directly (`readHashManifest`,
  `computeNamespacePrefixes`, `resolveAgentTarget`, `resolveDestinations`,
  `buildPlan`, `partitionActions`, `applyAction`, `applyBlockActions`,
  `summarize`) plus `asyncPool` to drive the pipeline
- Surface the final exit code through `useExitApp` so `renderInjectApp`
  resolves with a `number`

### Ask first

- Adding a new Ink entry beyond `renderInjectApp`
- Introducing a global UI store; per-hook `useReducer` is the pattern

### Never do

- Write to `process.stdout`/`stderr` directly; all output goes through
  Ink's virtual DOM
- Import from `commands/**`
- Read `package.json` or walk `node_modules`; consume the
  `ConsumerPackage[]` the caller provides
