# claude-assets-sync Specification

## Requirements

- The engine exposes a single `inject-claude-settings` bin (dispatcher).
  Consumers declare `claude.assetPath` in `package.json`; the engine
  injects `docs/claude/**` into the user-selected scope (`user` /
  `project`) for exactly one explicitly-named target per invocation
  or a batch via scope alias.
- `--package=<name>` is mandatory. The dispatcher resolves that one
  package's `package.json` via
  `createRequire(import.meta.url).resolve(`${name}/package.json`)` and
  extracts `{ name, version, claude.assetPath }`.
- Per-file SHA-256 comparison: copy when missing, skip when equal,
  warn + require `--force` when different.
- TTY + `--force`: Ink `ConfirmForce` dialog listing diverged/orphan
  paths (prompting via `ui/`). Non-TTY + `--force`: print the divergent
  list to stderr and proceed (inline in `renderPlain`).
- `--dry-run`: print the plan, no writes.
- `--json`: force the plain (non-Ink) render path; structured output
  is the same picocolors transcript for now.
- Non-TTY + missing `--scope`: `resolveScopeFlag` exits 2.
- Missing `--package`, unresolvable package, or missing
  `claude.assetPath`: exit 2.
- `dist/claude-hashes.json` (schema v1) is generated at build time by
  `buildHashes`; `previousVersions: {}` is reserved for future
  Option A+.

## API Contracts

- `runCli(argv: string[]): Promise<void>` — CLI entry. Parses flags,
  resolves targets, branches via `renderOrFallback` to either Ink
  (`ui.renderInjectApp`) or plain (`renderPlain`). No other
  programmatic orchestrator is exposed; callers that need headless
  behaviour compose core primitives directly.
- Core primitives (re-exported via `.`):
  - `readHashManifest(packageRoot): Promise<HashManifest>`
  - `computeNamespacePrefixes(manifest): string[]`
  - `resolveScope(scope, cwd?): ScopeResolution`
  - `buildPlan(input): Promise<InjectPlan>`
  - `applyAction(action, assetRoot): Promise<void>`
  - `summarize(plan, exitCode): InjectReport`
  - `isValidScope(x): x is Scope`
- `buildHashes(opts?): Promise<{ outPath, fileCount }>` — `./buildHashes`
  subpath (Node ESM); standalone CLI is `claude-build-hashes`.
  Ignores `.omc/**`, `*.log`, `.DS_Store`.

## Subpath Exports

- `.` — ESM; `runCli` + core primitives + types
- `./buildHashes` — Node ESM; `buildHashes`

## Exported Types

- `HashManifest`, `Scope`, `ScopeResolution`, `AssetType`
- `InjectReport`, `Action`, `InjectPlan`, `PlanInput`
- `Sha256Hex`

## Last Updated

2026-04-25 — Removed `injectDocs` orchestrator; Ink (TTY) and
`renderPlain` (non-TTY/`--json`) both compose core primitives directly.
ESM-only build; `./ui` is internal.
