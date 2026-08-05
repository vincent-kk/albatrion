# InjectApp Specification

## Requirements

- `Phase` is a discriminated union keyed by `kind`. The reducer
  transitions between kinds in response to `InjectEvent`s dispatched
  by `useInjectSession`. Unknown events are ignored (returns current
  phase unchanged).
- Phase kinds:
  - `booting` — initial state before any work
  - `resolving` — targets being resolved (optional `targets: string[]`)
  - `scope-select` — Ink `ScopePicker` awaiting user choice; holds a
    `pending: (s: Scope) => void` resolver
  - `planning` — per-target `buildPlan` in progress; `progress` map
    keyed by `packageName`
  - `diff-review` — plans built; user reviews before apply. For
    `--dry-run`, this phase immediately transitions to `summary`.
  - `force-confirm` — divergent/orphan warnings shown; `pending` is the
    promise resolver for user decision
  - `applying` — `asyncPool` running; `progress: { done, total }`
  - `summary` — all done; `reports: InjectReport[]` + `exitCode`
  - `error` — fatal; holds the `Error`
- `InjectEvent` kinds: `resolved`, `scope-selected`, `plan-built`,
  `force-confirm-required`, `force-answer`, `apply-progress`, `done`,
  `fail`.
- Reducer is pure and deterministic. It never reads `Date.now()` or
  process env; any timestamps are passed in via events.
- `InjectApp` component:
  - Uses `usePhase(initialPhase)` to bind the reducer
  - Uses `useInjectSession(props, dispatch)` to drive transitions
  - Renders `<Banner/>`, `<StepTracker/>`, a phase-specific body, and
    `<Footer/>` unconditionally; `<ErrorPanel/>` replaces the body on
    the `error` kind
  - Calls `useExitApp(code)` on `summary`/`error`, which calls
    `useApp().exit()` and surfaces the code for `renderInjectApp`
- `renderInjectApp(input)`:
  - Constructs the initial phase `{ kind: 'booting' }`
  - Calls `ink.render(<InjectApp {...input} onExit={captureCode}/>)`
  - Awaits `waitUntilExit()` then returns the captured exit code
  - Unmounts in a `finally` block to restore the terminal

## API Contracts

- `Phase` — union (see above)
- `InjectEvent` — union (see above)
- `InjectAppProps = RenderInput & { onExit: (code: number) => void }`
- `phaseReducer(phase: Phase, event: InjectEvent): Phase`
- `renderInjectApp(input: RenderInput): Promise<number>`

## Last Updated

2026-04-25 — Initial phase machine + Ink root.
