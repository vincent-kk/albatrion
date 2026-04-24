# runCli

## Purpose

Sole `claude-sync` CLI driver. Receives caller-injected package metadata
(`packageRoot`, `packageName`, `packageVersion`, `assetPath`) and
dispatches a single inject pass through `core/inject`. The library never
walks the filesystem looking for other packages.

## Structure

- `index.ts` — barrel export (`runCli`, `RunCliOptions`, `DefaultFlags`)
- `runCli.ts` — commander root + default action
- `type.ts` — `RunCliOptions`, `DefaultFlags`, `ConsumerPackage`
- `utils/runInject.ts` — default action orchestrator
- `utils/injectOne.ts` — per-target inject with heartbeat + force confirm
- `utils/resolveScopeFlag.ts` — scope flag → prompt fallback

## Boundaries

### Always do

- Terminate every error path with `process.exit(0 | 1 | 2)`
- Wrap long inject runs with `startHeartbeat` here (core stays tick-free)

### Ask first

- Adding subcommands (`list`, `build-hashes`, etc.) — today the CLI is
  intentionally single-action for one caller-owned consumer
- Accepting more than one consumer per invocation

### Never do

- Read `package.json` or walk `node_modules` / yarn workspaces
- Call `@inquirer/prompts` directly; route through `prompts/`
- Import from `core/` internals; always go through `core/index.ts`
