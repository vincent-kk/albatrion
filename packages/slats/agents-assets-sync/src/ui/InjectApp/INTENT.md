# InjectApp

## Purpose

Main Ink screen and phase state machine for the inject flow. Owns the
`Phase` union, its reducer, and the top-level `InjectApp` React
component that renders each phase. `renderInjectApp` mounts this
component via `ink.render` and surfaces the final exit code.

## Structure

- `INTENT.md`, `DETAIL.md`, `index.ts`
- `InjectApp.tsx` — eponymous React root; renders by phase
- `utils/type.ts` — `InjectAppProps` (re-exports `Phase`/`InjectEvent`/`RenderInput`)
- `utils/phaseReducer.ts` — pure `(phase, event) => phase` reducer
- `utils/eventSelectors.ts` — phase → view-prop derivations
- `utils/renderInjectApp.tsx` — `ink.render` wrapper → `Promise<number>`

## Boundaries

### Always do

- Keep `phaseReducer` pure — no Ink, no `core/**`, no side effects
- Surface the exit code through `useExitApp` inside `InjectApp`, not
  from outside — the reducer only records it on the `summary` phase
- Drive pipeline transitions via `useInjectSession` hook; this fractal
  only consumes the resulting phase

### Ask first

- Adding a new `Phase` variant — bumps reducer + selectors + component
  switch, and may invalidate snapshot tests
- Introducing a second Ink root (e.g. `ReportApp`) at this fractal
  level; prefer a sibling fractal under `ui/`

### Never do

- Write to `process.stdout`/`stderr` directly; all output goes through
  Ink's virtual DOM
- Import from `components/`, `hooks/`, or `theme/` inside
  `utils/phaseReducer.ts` — the reducer must stay framework-free
