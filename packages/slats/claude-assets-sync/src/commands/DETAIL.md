# commands Specification

## Requirements

- `runCli(argv)` is the sole CLI entry. It reads `--package <name...>`
  from argv, classifies each value, and resolves all targets via the
  dispatcher layer (`runCli/utils/resolvePackage.ts` for single
  packages, `runCli/utils/resolveScopeAlias.ts` for scope aliases).
  The commands layer never accepts pre-resolved metadata.
- Default inject flags: `--scope <user|project>`, `--dry-run`,
  `--force`, `--root`, `--json`. `--scope` chooses the settings write
  location; it is not an npm scope selector. `--json` forces the plain
  render path.
- Path selection via `runCli/utils/renderOrFallback.ts`:
  - TTY and no `--json` → dynamic-import `ui/` and call
    `renderInjectApp(input)`
  - Non-TTY or `--json` → call `renderPlain(targets, flags, originCwd)`
- When `--scope` is omitted: TTY opens the Ink `ScopePicker`; non-TTY
  `renderPlain` delegates to `resolveScopeFlag` which exits 2.
- When `--force` is set together with diverged or orphan actions: TTY
  opens the Ink `ConfirmForce` dialog; non-TTY emits the target list
  to stderr and proceeds (inline in `renderPlain`).
- Missing `dist/claude-hashes.json` causes the plain path to warn and
  skip; the Ink path surfaces a failed plan step via `useInjectSession`.
- Single-target vs batch exit policy is documented in `runCli/DETAIL.md`.

## API Contracts

- `runCli(argv: readonly string[] = process.argv): Promise<void>`
  - No second argument. All metadata is resolved from argv.
- `DefaultFlags` (re-exported):
  - `{ package?: string[]; scope?: string; dryRun?: boolean; force?: boolean; root?: string; json?: boolean }`
- `renderOrFallback(targets, flags, originCwd, env?): Promise<number>`
  - `env.isTTY` is injectable for testing; defaults to
    `process.stdout.isTTY`.

## Last Updated

2026-04-25 — Replaced legacy `runInject` + `injectOne` with
`renderPlain`. Ink path unchanged.
