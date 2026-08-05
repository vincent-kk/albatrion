# ui Specification

## Requirements

- TTY-only UI layer. The caller (`renderOrFallback`) guarantees
  `process.stdout.isTTY` is true before dynamic-importing this module.
- `renderInjectApp(input)` composes `core/**` primitives directly and
  drives an Ink virtual DOM; it MUST NOT write to `process.stdout`/
  `process.stderr` directly.
- The app resolves scope interactively (Ink `ScopePicker`) when
  `input.flags.scope` is absent; otherwise it uses the provided value.
- The app builds plans per target sequentially via `buildPlan`; for
  each target it computes orphan-scoping prefixes via
  `computeNamespacePrefixes`.
- Force-confirm is surfaced through `ConfirmForce`; the underlying
  promise bridge resolves when the user answers or cancels. Cancelling
  yields exit code 2.
- Apply uses `asyncPool(8, plan.actions, applyAction)` and coalesces
  progress via `useInterval` at ~10Hz.
- `--dry-run` skips apply and jumps to summary with exit 0.
- Summary is rendered from `summarize(plan, exitCode)` per target.
- Exit codes: `0` success/up-to-date/dry-run, `1` runtime error,
  `2` user/config cancel or missing asset.

## API Contracts

- `renderInjectApp(input: RenderInput): Promise<number>`
  - `RenderInput`:
    - `targets: readonly ConsumerPackage[]`
    - `flags: DefaultFlags`
    - `originCwd: string`
  - Resolves with the final exit code after Ink unmounts.

## Composed core primitives

- `readHashManifest`, `computeNamespacePrefixes`, `resolveScope`
- `buildPlan`
- `asyncPool` + `applyAction`
- `summarize`

## Re-exported types

- `Phase`, `InjectEvent`, `RenderInput`
- `TargetPlan`, `Warning`, `ApplyProgress`, `PlanStepState`

## Module access

- Internal only. Loaded via `await import('../../../ui/index.js')`
  from `commands/runCli/utils/renderOrFallback.ts`. Not exposed as a
  package subpath.

## Last Updated

2026-04-25 — Subpath removed; types split; injectDocs orchestrator gone.
