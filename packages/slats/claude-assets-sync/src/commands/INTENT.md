# commands

## Purpose

Commander action handlers. The only public entry is `runCli(argv)`,
which parses `--package=<name>`, resolves that single target's
metadata via the `bin/`-layer resolver, and dispatches a single
inject pass through `core/injectDocs`.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — aggregates public exports (`runCli`, `DefaultFlags`)
- `runCli/` — sole CLI surface; parses argv, resolves one target, dispatches

## Boundaries

### Always do

- Route user-facing errors through `process.exit(<code>)` with documented
  exit codes 0 / 1 / 2
- Wrap `startHeartbeat` here; the core layer stays tick-free

### Ask first

- Adding top-level subcommands (`list`, `all`, etc.) — today the CLI is
  intentionally single-action with one named target per invocation
- Accepting more than one consumer per invocation

### Never do

- Import `@inquirer/prompts` directly; always go through `prompts/`
- Reach into a sub-fractal's internal files; always use its `index.ts`
- Walk `node_modules` or enumerate workspaces looking for sibling
  packages. The `bin/` dispatcher layer is allowed to resolve exactly
  **one** named target's `package.json` via Node module resolution —
  that is the sole, narrow exception.
