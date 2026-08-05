# InjectApp

## Purpose

Main Ink screen for the inject flow. Owns the top-level `InjectApp` React component that renders each phase, and `renderInjectApp`, which mounts it via `ink.render` and surfaces the final exit code. The `Phase` union lives in `ui/types/` and its reducer in `ui/reducer/`; this fractal consumes both.

## Structure

- `INTENT.md`, `DETAIL.md`, `index.ts`
- `InjectApp.tsx` — eponymous React root; renders by phase
- `utils/type.ts` — `InjectAppProps` (re-exports `Phase`/`InjectEvent`/`RenderInput`)
- `utils/eventSelectors.ts` — phase → view-prop derivations
- `utils/renderInjectApp.tsx` — `ink.render` wrapper → `Promise<number>`

## Boundaries

### Always do

- Surface the exit code through `useExitApp` inside `InjectApp`, not from outside — the reducer only records it on the `summary` phase
- Drive pipeline transitions via `useInjectSession` hook; this fractal only consumes the resulting phase

### Ask first

- Adding a new `Phase` variant — bumps reducer + selectors + component switch, and may invalidate snapshot tests
- Introducing a second Ink root (e.g. `ReportApp`) at this fractal level; prefer a sibling fractal under `ui/`

### Never do

- Write to `process.stdout`/`stderr` directly; all output goes through Ink's virtual DOM
- Hold phase-transition logic here; `ui/reducer/` owns it and must stay framework-free
