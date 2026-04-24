# commands

## Purpose

Commander action handlers. The only public entry is `runCli(argv)`,
which parses `--package <name...>`, classifies each value as a scope
alias or a package name, resolves every target, and dispatches one
inject pass per resolved consumer through `core/injectDocs`.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — aggregates public exports (`runCli`, `DefaultFlags`)
- `runCli/` — sole CLI surface; parses argv, resolves targets, dispatches

## Boundaries

### Always do

- Route user-facing errors through `process.exit(<code>)` with documented
  exit codes 0 / 1 / 2
- Wrap `startHeartbeat` here; the core layer stays tick-free

### Ask first

- Adding top-level subcommands (`list`, `all`, etc.) — today the CLI is
  intentionally single-action even when multiple targets resolve

### Never do

- Import `@inquirer/prompts` directly; always go through `prompts/`
- Reach into a sub-fractal's internal files; always use its `index.ts`
- Walk `node_modules` or enumerate workspaces outside
  `runCli/utils/resolveScopeAlias.ts`. The scope-alias helper is the
  SOLE workspace-enumeration exception; `runCli/utils/resolvePackage.ts`
  still resolves ONLY one explicitly-named target via Node module
  resolution.
