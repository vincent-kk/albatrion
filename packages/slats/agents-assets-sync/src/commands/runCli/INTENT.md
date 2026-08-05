# runCli

## Purpose

Sole `inject-agents-settings` CLI driver. Parses `--package <name...>`
from argv — each value is a scope alias (`@<scope>`), a scoped package
(`@<scope>/<name>`), or an unscoped package (`<name>`). Resolves every
target, then hands off to exactly one of three renderers.

## Structure

- `index.ts` — barrel export (`runCli`, `DefaultFlags`)
- `runCli.ts` — commander root + default action
- `type.ts` — `DefaultFlags`, `ConsumerPackage`
- `utils/classifyTarget.ts` — pure classifier (scope | package | invalid)
- `utils/resolvePackage.ts` — dispatcher single-target resolve
- `utils/resolveScopeAlias.ts` — scope→packages enumeration (isolated)
- `utils/resolveTargets.ts` — classify/resolve/dedupe orchestrator
- `utils/resolveScopeFlag.ts` — `--scope` validator (+ `parseScopeFlag`)
- `utils/resolveAgentFlag.ts` — `--agent` validator (+ `parseAgentFlag`)
- `utils/resolveAssetFlag.ts` — `--asset` validator (+ `parseAssetFlag`)
- `utils/toConsumerPackages.ts` — `ResolvedMetadata` → `ConsumerPackage`
- `utils/renderOrFallback.ts` — renderer branch + dynamic UI import
- `utils/renderPlain.ts` — non-TTY / `--no-interactive` renderer
- `utils/renderJson.ts` — `--json` single-document renderer

## Conventions

- Each flag validator has two forms: `resolve*Flag` exits 2, `parse*Flag`
  returns the failure as a value — `renderJson` cannot exit mid-document.

## Boundaries

### Always do

- Terminate every error path with `process.exit(0 | 1 | 2)`
- Call `renderOrFallback` exactly once after targets resolve; it owns the
  ordered branch — `--json`, then non-TTY / `--no-interactive`, then Ink

### Ask first

- Adding top-level subcommands — the CLI is intentionally single-action

### Never do

- Walk `node_modules` outside `utils/resolveScopeAlias.ts`
- Import from `ui/` statically; only `utils/renderOrFallback.ts` may
  dynamic-import it
- Import from `core/` internals; always go through `core/index.ts`
