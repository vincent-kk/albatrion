# commands Specification

## Requirements

- `runCli` is the top-level driver: default action discovers consumers and runs inject; `list` enumerates them; `build-hashes` generates `dist/claude-hashes.json`; `inject-docs` is a legacy alias for default inject.
- Default inject flags: `--package`, `--all`, `--scope <user|project|local>`, `--dry-run`, `--force`, `--root`, `--no-workspaces`.
- `list` flags: `--json`, `--root`.
- `build-hashes [pkgRoot]` writes manifest to `<pkgRoot>/dist/claude-hashes.json` (pkgRoot defaults to cwd).
- When `--scope` is omitted: TTY launches the interactive picker via `selectScopeAsync`, non-TTY prints an error and exits 2.
- When `--force` is set with diverged/orphan actions: TTY opens `confirmForceAsync`, non-TTY proceeds silently after emitting the target list to stderr.
- Multiple consumers discovered without `--package`/`--all`: exit 2 with the available list.
- Deprecation stubs exit 1, write to stderr, and mention MIGRATION.md.

## API Contracts

- `runCli(argv: readonly string[], options?: RunCliOptions): Promise<void>`
  - `RunCliOptions` = `{ version? }`
- `registerInjectCommand(cmd: Command, ctx: InjectCommandContext): void`
  - `InjectCommandContext` = `{ packageName, packageVersion, packageRoot, assetRoot?, renderScopeSelect?, renderForceConfirm? }`
- `registerDeprecatedCommands(cmd: Command): void`
- `listConsumers(opts: ListOptions): Promise<void>` — `ListOptions` = `{ cwd?, json? }`
- `buildHashesCmd(opts: BuildHashesCmdOptions): Promise<void>` — `BuildHashesCmdOptions` = `{ packageRoot }`

## Last Updated

2026-04-24
