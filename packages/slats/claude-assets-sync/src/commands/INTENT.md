# commands

## Purpose

Commander action handlers. Binds the top-level `claude-sync` CLI (`runCli`), the per-consumer `inject-docs` legacy factory, the `list` and `build-hashes` subcommands, and the 7 legacy deprecation stubs to the core engine.

## Structure

- `index.ts` — barrel export
- `root.ts` — `runCli(argv, options?)`; top-level commander root, subcommand router, and default-action inject flow (uses `discover()` to locate consumers)
- `inject.ts` — `registerInjectCommand(cmd, ctx)`; legacy per-consumer inject binding used by `program()`
- `list.ts` — `listConsumers({ cwd?, json? })` handler for `claude-sync list` (tabular + `--json`)
- `buildHashesCmd.ts` — thin wrapper around `scripts/buildHashes.mjs` for `claude-sync build-hashes`
- `_deprecated.ts` — registers `sync`/`add`/`list`/`remove`/`status`/`migrate`/`update` as exit-1 stubs pointing at MIGRATION.md

## Conventions

- Each command registers via `register<Name>Command(cmd, ctx)` or a plain async handler taking parsed flags
- Render hooks (`selectScopeAsync`, `confirmForceAsync`) are imported from `../prompts/` — never fabricated inside core
- Commands delegate I/O to `core/`; no direct filesystem or hash logic here

## Boundaries

### Always do

- Route all user-facing errors through `process.exit(<code>)` with the documented exit-code mapping (0/1/2)
- Use `startHeartbeat` at the command layer so `core/` stays tick-free

### Ask first

- Adding a command beyond `inject` (default), `list`, `build-hashes`, and the legacy `inject-docs` alias
- Changing the deprecation stub list or the MIGRATION.md pointer

### Never do

- Reintroduce legacy runtime logic inside `_deprecated.ts`
- Import prompt libraries directly from `core/`; commands pass callbacks into `injectDocs` instead
