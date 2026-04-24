# claude-assets-sync Specification

## Requirements

- The engine exposes a single `inject-claude-settings` bin (dispatcher).
  Consumers declare `claude.assetPath` in `package.json`; the engine
  injects `docs/claude/**` into the user-selected scope (`user` /
  `project`) for exactly one explicitly-named target per invocation.
- `--package=<name>` is mandatory. The dispatcher resolves that one
  package's `package.json` via
  `createRequire(import.meta.url).resolve(`${name}/package.json`)` and
  extracts `{ name, version, claude.assetPath }`.
- Per-file SHA-256 comparison: copy when missing, skip when equal,
  warn + require `--force` when different (Option A: user edit and
  version bump are indistinguishable).
- TTY + `--force`: `@inquirer/prompts.confirm` interactive confirm
  listing up to 3 diverged/orphan paths. Non-TTY + `--force`: print
  the divergent list to stderr and proceed.
- `--dry-run`: print the plan, no writes.
- Non-TTY + missing `--scope`: exit 2 with explicit error.
- Missing `--package`, unresolvable package, or missing
  `claude.assetPath`: exit 2.
- `dist/claude-hashes.json` (schema v1) is generated at build time by
  `buildHashes`; `previousVersions: {}` is reserved for future
  Option A+.

## API Contracts

- `runCli(argv: string[]): Promise<void>` — CLI entry. Parses
  `--package=<name>`, resolves metadata, dispatches a single inject.
- `injectDocs(opts: InjectOptions): Promise<InjectReport>` — headless
  programmatic inject. Caller provides full metadata. Exit codes:
  `0` success / up-to-date / dry-run, `1` runtime error, `2`
  user/config error.
- `buildHashes(opts?): Promise<{ outPath, fileCount }>` — `./buildHashes`
  subpath (Node ESM); standalone CLI is `claude-build-hashes`.
  Ignores `.omc/**`, `*.log`, `.DS_Store`.
- `readHashManifest(packageRoot): Promise<HashManifest>` — read
  `packageRoot/dist/claude-hashes.json`.
- `computeNamespacePrefixes(manifest): string[]` — derive
  `skills/<name>/` prefixes for orphan scoping.
- `resolveScope(scope, cwd?): ScopeResolution`.

## Exported Types

- `InjectOptions`, `InjectReport`
- `HashManifest`, `Scope`, `ScopeResolution`, `AssetType`

## Last Updated

2026-04-24
