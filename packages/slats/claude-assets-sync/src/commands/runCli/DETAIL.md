# runCli Specification

## Requirements

- `runCli(argv)` is the sole CLI entry; it reads `--package <name...>`
  from argv and never accepts pre-resolved metadata.
- `--package` accepts three forms:
  - `@<scope>` — enumerate all packages under that npm scope
  - `@<scope>/<name>` — one scoped package
  - `<name>` — one unscoped package
  Any other shape exits with code 2.
- `--package` is variadic: repeated flags and comma-separated values are
  both aggregated into a single target list.
- Inject flags: `--scope <user|project>`, `--dry-run`, `--force`,
  `--root`, `--json`.
- `renderOrFallback` branches: `isTTY && !flags.json` → Ink path; else
  `renderPlain`. Dynamic UI import uses `await import()` (package is
  ESM-only, so no CJS downgrade concern).
- `renderPlain` calls `resolveScopeFlag(flags.scope)` exactly once per
  invocation. Non-TTY missing `--scope` → exit 2.
- Single-target mode: asset-missing package exits 2; per-target
  failure exits with its report code.
- Batch mode (scope alias or multiple resolved consumers): asset-missing
  warns and is skipped; per-target failure continues; post-loop exits 1
  iff any target failed.
- Scope enumeration walks every ancestor `<cwd>/node_modules/@<scope>/*`
  upward to the filesystem root; directory names may diverge from
  declared package names (authoritative = `package.json` `name` field),
  and nearest-wins dedup resolves nested install layouts.
- Scope enumeration is confined to `utils/resolveScopeAlias.ts` — no
  other file in `runCli/**` reads sibling `package.json` files.
- Resolved targets are deduped by `packageName` before rendering.

## API Contracts

- `runCli(argv: readonly string[] = process.argv): Promise<void>`
- `DefaultFlags`:
  - `package?: string[]` (variadic; 0 values → exit 2)
  - `scope?: 'user' | 'project'`
  - `dryRun?: boolean`, `force?: boolean`, `root?: string`,
    `json?: boolean`
- `resolvePackage(name, opts?, originCwd?): Promise<ResolvedMetadata | null>`
  - Two-pass resolution: cwd-rooted require first (catches the host
    project's `node_modules` when invoked via `npx -p`), then
    engine-rooted require as fallback. `originCwd` defaults to
    `process.cwd()` when omitted.
- `resolveScopeAlias(scope, rootCwd): Promise<ResolvedMetadata[]>`
- `resolveTargets(targets, rootCwd): Promise<ResolvedMetadata[]>`
- `toConsumerPackages(metadata): Promise<ConsumerPackage[]>`
- `renderOrFallback(targets, flags, originCwd, env?): Promise<number>`
- `renderPlain(targets, flags, originCwd): Promise<number>`

## Last Updated

2026-04-26 — `resolvePackage` accepts `originCwd` for cwd-first resolve so npx invocations see the host project's node_modules; commander program name derived from argv[1] basename so the bin alias `claude-assets-sync` self-identifies in help output.
