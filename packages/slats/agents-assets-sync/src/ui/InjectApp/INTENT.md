# InjectApp

## Purpose

Main Ink screen for the inject flow. Owns the top-level `InjectApp` React component that renders each phase, and `renderInjectApp`, which mounts it via `ink.render` and surfaces the final exit code. The `Phase` union lives in `ui/types/` and its reducer in `ui/reducer/`; this fractal consumes both.

## Conventions

- useInjectSession이 제공하는 phase를 화면으로 투영하며, 전이 판단은 reducer에 남깁니다.
- 종료 코드는 summary phase에 기록된 결과를 읽어 Ink 컴포넌트 안에서 전달합니다.

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
