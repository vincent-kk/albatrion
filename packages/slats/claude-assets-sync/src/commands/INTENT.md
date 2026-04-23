# commands

## Purpose

Commander action handlers. The only public entry is `runCli`, which binds
commander flags to the core injection engine. Callers (consumer bin stubs)
own all package metadata — the library does not walk the filesystem.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — aggregates public exports
- `runCli/` — sole CLI surface; accepts caller-injected package metadata

## Boundaries

### Always do

- Route user-facing errors through `process.exit(<code>)` with documented
  exit codes 0 / 1 / 2
- Wrap `startHeartbeat` here; the core layer stays tick-free

### Ask first

- Adding subcommands (`list`, `build-hashes`, etc.) — the current design
  keeps the CLI to a single default action for one caller-owned consumer
- Re-introducing filesystem discovery of other packages

### Never do

- Import `@inquirer/prompts` directly; always go through `prompts/`
- Reach into a sub-fractal's internal files; always use its `index.ts`
- Read `package.json` inside the library — callers pass metadata in
