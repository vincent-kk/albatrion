# commands

## Purpose

Commander action handlers. The only public entry is `runCli(argv)`,
which parses `--package <name...>`, classifies each value as a scope
alias or a package name, resolves every target, and dispatches one
inject pass per resolved consumer. TTY invocations render through the
Ink UI layer (`ui/`); non-TTY and `--json` invocations use
`renderPlain` which composes `core/**` primitives directly.

## Structure

- `INTENT.md`, `DETAIL.md`
- `index.ts` — aggregates public exports (`runCli`, `DefaultFlags`)
- `runCli/` — sole CLI surface; parses argv, resolves targets, dispatches

## Boundaries

### Always do

- Route user-facing errors through `process.exit(<code>)` with documented
  exit codes 0 / 1 / 2
- Branch TTY vs plain path exactly once, via
  `runCli/utils/renderOrFallback.ts`

### Ask first

- Adding top-level subcommands (`list`, `all`, etc.) — today the CLI is
  intentionally single-action even when multiple targets resolve

### Never do

- Import from `ui/` statically; only `runCli/utils/renderOrFallback.ts`
  may dynamic-import it
- Reach into a sub-fractal's internal files; always use its `index.ts`
- Walk `node_modules` outside `runCli/utils/resolveScopeAlias.ts`.
  That file is the SOLE `node_modules`-enumeration exception.
