## Purpose

Headless prompt wrappers that replace the legacy ink-based `src/components/inject/`.
Provides `selectScopeAsync` and `confirmForceAsync` over `@inquirer/prompts`.

## Structure

- `selectScope.ts` — scope picker (user / project / local)
- `confirmForce.ts` — Y/N confirmation with diverged/orphan file listing
- `index.ts` — barrel export

## Conventions

- All prompts use `@inquirer/prompts` (`select`, `confirm`) — no ink, no react.
- Color and bold emphasis are applied via `picocolors` directly in the prompt
  message or stderr pre-print (for file lists).
- File-list previews and explanatory preambles are written to stderr so they
  never collide with programmatic stdout.
- Each function returns the typed primitive (`Scope` or `boolean`); no callback
  style, no shared state.

## Boundaries

### Always do
- Keep prompts UI-only: no fs, network, or business logic.
- Use stderr for context previews and stdout only via the prompt library itself.
- Apply picocolors (bold, red, cyan, dim) on any user-critical emission to
  preserve visibility.

### Ask first
- Adding a new prompt: confirm it is called from `src/commands/` and not
  reached from `src/core/**`.
- Switching the prompt backend away from `@inquirer/prompts`: requires
  re-running the Phase 0 bundle-size gate documented in
  `docs/bundle-size-decision.md`.

### Never do
- Import from `src/core/**`.
- Import from `src/components/**` (that tree is @deprecated).
- Swallow exceptions from the prompt library; propagate so callers can handle
  cancellation (`ExitPromptError`).

## Dependencies

- `@inquirer/prompts` (runtime)
- `picocolors` (runtime)
- `../core/scope.js` (type-only import for `Scope`)
