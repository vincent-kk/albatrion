# commands Specification

## Requirements

- Expose a single active command `inject-docs` plus 7 deprecation stubs
- `inject-docs` flags: `--scope <user|project|local>`, `--dry-run`, `--force`, plus `--help`/`--version` from commander
- When `--scope` is omitted: TTY launches the interactive picker via `renderScopeSelect`, non-TTY prints an error and exits 2
- When `--force` is set with diverged/orphan actions: TTY opens `renderForceConfirm`, non-TTY proceeds silently after emitting the target list to stderr
- Deprecation stubs exit 1, write to stderr, and mention MIGRATION.md

## API Contracts

- `registerInjectCommand(cmd: Command, ctx: InjectCommandContext): void`
  - `InjectCommandContext` = `{ packageName, packageVersion, packageRoot, assetRoot?, renderScopeSelect?, renderForceConfirm? }`
- `registerDeprecatedCommands(cmd: Command): void`

## Last Updated

2026-04-23
