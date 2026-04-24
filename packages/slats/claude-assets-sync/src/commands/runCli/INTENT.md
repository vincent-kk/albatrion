# runCli

## Purpose

Sole `inject-claude-settings` CLI driver. Parses `--package <name...>`
from argv — each value is a scope alias (`@<scope>`), a scoped package
(`@<scope>/<name>`), or an unscoped package (`<name>`). Resolves every
target and dispatches one inject pass per resolved consumer through
`core/injectDocs`. Workspace enumeration is confined to
`utils/resolveScopeAlias.ts`.

## Structure

- `index.ts` — barrel export (`runCli`, `DefaultFlags`)
- `runCli.ts` — commander root + default action
- `type.ts` — `DefaultFlags`, `ConsumerPackage`
- `utils/classifyTarget.ts` — pure classifier (scope | package | invalid)
- `utils/resolvePackage.ts` — dispatcher single-target resolve
- `utils/resolveScopeAlias.ts` — scope→packages enumeration (isolated)
- `utils/resolveTargets.ts` — classify/resolve/dedupe orchestrator
- `utils/runInject.ts` — default action orchestrator (batch)
- `utils/injectOne.ts` — per-target inject with heartbeat + force confirm
- `utils/resolveScopeFlag.ts` — scope flag → prompt fallback

## Boundaries

### Always do

- Terminate every error path with `process.exit(0 | 1 | 2)`
- Wrap long inject runs with `startHeartbeat` here (core stays tick-free)
- Run `resolveScopeFlag` once per invocation, before the inject loop

### Ask first

- Adding top-level subcommands — the CLI is intentionally single-action
  even when multiple targets resolve

### Never do

- Walk `node_modules` or yarn workspaces outside
  `utils/resolveScopeAlias.ts`. That file is the SOLE enumeration
  exception; `utils/resolvePackage.ts` still resolves ONLY one
  explicitly-named package at a time.
- Call `@inquirer/prompts` directly; route through `prompts/`
- Import from `core/` internals; always go through `core/index.ts`
