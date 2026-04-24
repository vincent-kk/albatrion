# runCli Specification

## Requirements

- `runCli(argv)` is the sole CLI entry; it reads `--package <name...>`
  from argv and never accepts pre-resolved metadata.
- `--package` accepts three forms:
  - `@<scope>` — enumerate all packages under that npm scope
  - `@<scope>/<name>` — one scoped package
  - `<name>` — one unscoped package
  Any other shape (`@`, `@/x`, `foo/bar`, `@scope/`) exits with code 2.
- `--package` is variadic: repeated flags and comma-separated values are
  both aggregated into a single target list.
- Inject flags carry over: `--scope <user|project>`, `--dry-run`,
  `--force`, `--root`. `--scope` behavior is unchanged — it selects
  the settings write location, not an npm scope.
- `resolveScopeFlag` runs exactly once per invocation, outside the
  inject loop, so user interactive selection is not re-prompted per
  package.
- Single-target mode (one resolved consumer): asset-missing package
  exits 2; `injectOne` failure exits with its report code.
- Batch mode (scope alias OR multiple resolved consumers): asset-missing
  package warns and is skipped; `injectOne` failure continues to the
  next; post-loop exits 0 iff every target succeeded, otherwise 1.
- Scope enumeration walks `<monorepo>/packages/<scope>/*`, matching by
  each child's `package.json.name === "@<scope>/*"`. Directory names
  may diverge from package names (e.g. `production-test` →
  `@aileron/production-testbed`); the `name` field is authoritative.
- Scope enumeration is confined to `utils/resolveScopeAlias.ts` — no
  other file in `runCli/**` reads sibling `package.json` files.
- Resolved targets are deduped by `packageName` before injection so that
  `--package @canard @canard/schema-form` processes schema-form once.

## API Contracts

- `runCli(argv: readonly string[] = process.argv): Promise<void>`
- `DefaultFlags`:
  - `package?: string[]` (variadic; 0 values → exit 2)
  - `scope?: 'user' | 'project'`
  - `dryRun?: boolean`, `force?: boolean`, `root?: string`
- `resolvePackage(name, opts?): Promise<ResolvedMetadata | null>`
  - `opts.skipMissingAsset === true` → asset-missing returns `null` with
    a warning; the function never calls `process.exit` in this mode.
  - Default (`false`) preserves v0.3.0 behavior (exit 2 on missing).
- `resolveScopeAlias(scope, rootCwd): Promise<ResolvedMetadata[]>` —
  enumerates `<packagesRoot>/packages/<scope>/*` and calls
  `resolvePackage(name, { skipMissingAsset: true })` for each match.
- `resolveTargets(targets, rootCwd): Promise<ResolvedMetadata[]>` —
  classifies, resolves, and dedupes targets by `packageName`.
- `injectOne(...): Promise<number>` — returns the underlying inject
  report's exit code; never calls `process.exit` itself.

## Last Updated

2026-04-24 — `--package` variadic + scope alias enumeration.
