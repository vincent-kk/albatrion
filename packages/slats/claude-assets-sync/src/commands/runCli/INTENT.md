# runCli

## Purpose

Sole `inject-claude-settings` CLI driver. Parses `--package=<name>`
from argv, resolves that one target via
`createRequire(import.meta.url).resolve(`${name}/package.json`)` in
`utils/resolvePackage.ts`, and dispatches a single inject pass
through `core/injectDocs`. Never enumerates sibling packages.

## Structure

- `index.ts` — barrel export (`runCli`, `DefaultFlags`)
- `runCli.ts` — commander root + default action
- `type.ts` — `DefaultFlags`, `ConsumerPackage`
- `utils/resolvePackage.ts` — dispatcher-only single-target resolve
- `utils/runInject.ts` — default action orchestrator
- `utils/injectOne.ts` — per-target inject with heartbeat + force confirm
- `utils/resolveScopeFlag.ts` — scope flag → prompt fallback

## Boundaries

### Always do

- Terminate every error path with `process.exit(0 | 1 | 2)`
- Wrap long inject runs with `startHeartbeat` here (core stays tick-free)

### Ask first

- Adding top-level subcommands — today the CLI is intentionally
  single-action for one explicitly-named target
- Accepting more than one consumer per invocation

### Never do

- Walk `node_modules` or yarn workspaces looking for sibling packages.
  `utils/resolvePackage.ts` resolves ONLY the one name passed via
  `--package`; nothing else.
- Call `@inquirer/prompts` directly; route through `prompts/`
- Import from `core/` internals; always go through `core/index.ts`
