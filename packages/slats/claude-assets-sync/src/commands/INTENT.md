# commands

## Purpose

Commander action handlers. Binds the `inject-docs` command and the 7 legacy deprecation stubs to the core engine.

## Structure

- `index.ts` — barrel (registerInjectCommand, registerDeprecatedCommands)
- `inject.ts` — registers the `inject-docs` action, resolves `--scope` via interactive picker or errors in non-TTY
- `_deprecated.ts` — factory that registers `sync`/`add`/`list`/`remove`/`status`/`migrate`/`update` as exit-1 stubs pointing at MIGRATION.md

## Conventions

- Each command registers via `register<Name>Command(cmd, ctx)` taking a `Command` and context
- Context objects carry consumer identity (packageName/version/root) plus optional UI render hooks
- Commands delegate I/O to `core/`; no direct filesystem or hash logic here

## Boundaries

### Always do

- Route all user-facing errors through `process.exit(<code>)` with the documented exit-code mapping (0/1/2)
- Keep render hooks injected rather than imported, so `commands/` stays UI-agnostic

### Ask first

- Adding a command beyond `inject-docs`
- Changing the deprecation stub list or the MIGRATION.md pointer

### Never do

- Reintroduce legacy runtime logic inside `_deprecated.ts`
- Import from `components/` directly — render hooks are provided by `program.ts`
