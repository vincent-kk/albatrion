# commands Specification

## Requirements

- `runCli` is the sole CLI entry. It receives the consumer's package
  metadata (`packageRoot`, `packageName`, `packageVersion`, `assetPath`) from
  the caller and never reads `package.json` itself.
- Default inject flags: `--scope <user|project|local>`, `--dry-run`,
  `--force`, `--root`.
- When `--scope` is omitted: TTY opens `selectScopeAsync`, non-TTY prints
  an error and exits with code 2.
- When `--force` is set together with diverged or orphan actions: TTY
  opens `confirmForceAsync`; non-TTY emits the target list to stderr and
  proceeds.
- Missing `dist/claude-hashes.json` causes `injectOne` to log a warning
  and return without exiting.

## API Contracts

- `runCli(argv: readonly string[], options: RunCliOptions): Promise<void>`
  - `RunCliOptions` = `{ packageRoot, packageName, packageVersion, assetPath, version? }`

## Last Updated

2026-04-24
