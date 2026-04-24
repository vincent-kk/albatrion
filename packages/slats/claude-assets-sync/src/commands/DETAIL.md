# commands Specification

## Requirements

- `runCli(argv)` is the sole CLI entry. It reads `--package <name...>`
  from argv, classifies each value, and resolves all targets via the
  dispatcher layer (`runCli/utils/resolvePackage.ts` for single
  packages, `runCli/utils/resolveScopeAlias.ts` for scope aliases).
  The commands layer never accepts pre-resolved metadata.
- Default inject flags: `--scope <user|project>`, `--dry-run`,
  `--force`, `--root`. `--scope` chooses the settings write location;
  it is not an npm scope selector.
- `--package` forms and aggregation rules are specified in
  `runCli/DETAIL.md`. The outer layer trusts the target list produced
  by `runCli/utils/resolveTargets.ts`.
- When `--scope` is omitted: TTY opens `selectScopeAsync`, non-TTY
  prints an error and exits with code 2. The selection runs once,
  regardless of how many targets are being processed.
- When `--force` is set together with diverged or orphan actions: TTY
  opens `confirmForceAsync`; non-TTY emits the target list to stderr
  and proceeds.
- Missing `dist/claude-hashes.json` causes `injectOne` to log a warning
  and return success (treated as a soft skip).
- Single-target vs batch exit policy is documented in `runCli/DETAIL.md`.

## API Contracts

- `runCli(argv: readonly string[] = process.argv): Promise<void>`
  - No second argument. All metadata is resolved from argv.
- `DefaultFlags` (re-exported):
  `{ package?: string[]; scope?: string; dryRun?: boolean; force?: boolean; root?: string }`

## Last Updated

2026-04-24 — drop `RunCliOptions`; `--package` variadic + scope alias.
