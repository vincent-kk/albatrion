# runCli

## Purpose

Sole `inject-claude-settings` CLI driver. Parses `--package <name...>`
from argv — each value is a scope alias (`@<scope>`), a scoped package
(`@<scope>/<name>`), or an unscoped package (`<name>`). Resolves every
target and delegates rendering to Ink (`ui/`) on TTY or `renderPlain`
on non-TTY / `--json`. Workspace enumeration is confined to
`utils/resolveScopeAlias.ts`.

## Structure

- `index.ts` — barrel export (`runCli`, `DefaultFlags`)
- `runCli.ts` — commander root + default action
- `type.ts` — `DefaultFlags`, `ConsumerPackage`
- `utils/classifyTarget.ts` — pure classifier (scope | package | invalid)
- `utils/resolvePackage.ts` — dispatcher single-target resolve
- `utils/resolveScopeAlias.ts` — scope→packages enumeration (isolated)
- `utils/resolveTargets.ts` — classify/resolve/dedupe orchestrator
- `utils/resolveScopeFlag.ts` — plain-path scope flag validator
- `utils/toConsumerPackages.ts` — `ResolvedMetadata` → `ConsumerPackage`
- `utils/renderOrFallback.ts` — TTY/plain branch + dynamic UI import
- `utils/renderPlain.ts` — non-TTY / `--json` picocolors renderer

## Boundaries

### Always do

- Terminate every error path with `process.exit(0 | 1 | 2)`
- Call `renderOrFallback` exactly once per invocation after targets
  resolve; it owns the TTY/plain branch

### Ask first

- Adding top-level subcommands — the CLI is intentionally single-action
  even when multiple targets resolve

### Never do

- Walk `node_modules` or yarn workspaces outside
  `utils/resolveScopeAlias.ts`. That file is the SOLE enumeration
  exception.
- Import from `ui/` statically. Only `utils/renderOrFallback.ts` may
  dynamic-import it.
- Import from `core/` internals; always go through `core/index.ts`.
