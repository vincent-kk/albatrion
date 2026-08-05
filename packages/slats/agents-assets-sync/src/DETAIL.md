# agents-assets-sync Specification

## Requirements

- The engine exposes a single `inject-agents-settings` bin (dispatcher). Consumers declare `agents.assetPath` in `package.json` — or the caller names it with `--asset-path`; the engine injects that tree into the locations each selected agent uses, for one explicitly-named target per invocation or a batch via scope alias.
- Every choice is reachable by flag. A run with `--package`, `--agent`, `--scope` and, where content diverges, `--force --yes`, completes with no prompt at all.
- `--package=<name>` is mandatory. The dispatcher resolves that one package's `package.json` via `createRequire(...).resolve()` and extracts `{ name, version, agents.assetPath }`, taking `--asset-path` in place of the declaration when it is given.
- `--agent=<claude|codex|agents>` accepts repeats and comma-separated values. Omitted, an interactive TTY shows the picker; every other context exits 2. A run selecting both agents produces one plan per pair.
- `--asset=<skills|rules|commands>` narrows the run. A kind left out is absent from the plan, so the run neither reports nor deletes anything belonging to it.
- `--asset-path=<path>` names the asset root relative to each target's package root, for a package that ships assets in a directory like `agents/` or `docs/` without declaring one. It overrides `agents.assetPath` on every target and makes that directory the only source of hashes, so `dist/agents-hashes.json` is neither read nor required. An empty, absolute or `~`-prefixed value exits 2 before any filesystem IO; a path outside the package root or naming no directory exits 2 for a single target and is skipped in a batch.
- Per-entry SHA-256 comparison: copy when missing, skip when equal, warn and require `--force` when different. A codex rule block is compared the same way, by the body between its markers.
- `--force` overwrites diverged content. TTY: the Ink `ConfirmForce` dialog lists diverged and orphan entries first, unless `--yes`. Non-interactive: the list goes to stderr and the run proceeds.
- `--dry-run`: print the plan, no writes.
- `--json` selects a third renderer that writes exactly one JSON document to stdout and diverts every diagnostic to stderr; `--no-interactive` forces the plain render path instead. The document carries `schemaVersion`, `dryRun`, `exitCode`, `errors`, and one `unit` per `(package, agent)` pair holding that unit's destination, plan actions and report. A flag error becomes `errors` with `exitCode: 2` and empty `units`; a failure upstream of the renderer leaves stdout empty and reports through the exit code alone.
- Missing `--scope` or `--agent` outside an interactive TTY: exit 2.
- Missing `--package`, unresolvable package, missing `agents.assetPath` with no `--asset-path`, or an invalid `--agent`/`--asset`/`--asset-path` value: exit 2.
- `dist/agents-hashes.json` (schema v1) is generated at build time by `buildHashes`; `previousVersions: {}` is reserved for future use. A run driven by `--asset-path` computes the same document in memory instead, so it needs no build output.

## API Contracts

- `runCli(argv: string[]): Promise<void>` — CLI entry. Parses flags, resolves targets, branches via `renderOrFallback` to either Ink (`ui.renderInjectApp`) or plain (`renderPlain`). No other programmatic orchestrator is exposed; callers that need headless behaviour compose core primitives directly.
- Core primitives re-exported via `.`: `readHashManifest`, `computeNamespacePrefixes`, `resolveProjectRoot`, `resolveAgentTarget`, `resolveDestinations`, `formatBlockId`, `parseBlocks`, `isValidScope`, `isValidAgent`, `MARKER_PREFIX`, `PROJECT_ANCHORS`, `HASH_MANIFEST_FILENAME`. Full contracts in `core/DETAIL.md`.
- `buildHashes(opts?): Promise<{ outPath, fileCount }>` — `./buildHashes` subpath (Node ESM); standalone CLI is `agents-build-hashes`. Ignores `.omc/**`, `*.log`, `.DS_Store`.

## Subpath Exports

- `.` — ESM; `runCli` + core primitives + types
- `./buildHashes` — Node ESM; `buildHashes`

## Exported Types

- `Scope`, `ProjectRootResolution`, `AssetType`
- `AgentType`, `AssetKind`, `AgentTarget`, `Destination`, `OrphanScan`
- `HashManifest`, `InjectReport`

## Acceptance Criteria

### AC-JSON — machine-readable output is a single document

- Given `--json`, when the CLI runs, then the entire stdout stream parses as one JSON object with `schemaVersion: 1`.
- Given several agents, then the document holds one `unit` per `(package, agent)` pair, each naming its destination and actions.
- Given an invalid `--agent`, then the document still parses, `exitCode` is 2 and `errors` names the offending value.
- Given an unresolvable `--package`, then stdout is empty and the diagnostic is on stderr.
- Given `--asset-path`, then the unit carries a real plan and no manifest error — a directory source reaches the document by the same path a manifest source does.
- Verified by `__tests__/json.test.ts`.

### AC-CLI-FLAGS — the CLI is drivable without a prompt

- Given `--package`, `--agent` and `--scope`, when the CLI runs on a non-TTY, then it completes without asking anything.
- Given `--agent` is missing on a non-TTY, then the run exits 2.
- Given an unknown `--agent` or `--asset` value, then the run exits 2.
- Verified by `__tests__/cli.test.ts`.

### AC-CLI-ROUTING — each agent receives its own plan

- Given `--agent=claude,codex`, when the CLI runs, then the transcript carries one section per agent.
- Given `--agent=codex` at `project` scope, then rule entries name the `AGENTS.md` they merge into and skill entries name `.agents/skills`.
- Given `--agent=codex --asset=skills`, then no `AGENTS.md` entry appears at all.
- Verified by `__tests__/cli.test.ts`.

### AC-CLI-ASSET-PATH — an undeclared asset tree is still injectable

- Given a package with no `agents.assetPath` and no `dist/agents-hashes.json`, when the run passes `--asset-path`, then the plan lists that directory's files and no manifest diagnostic appears.
- Given the same package without `--asset-path`, then the run still exits 2.
- Given `--asset` and `--asset-path` together, then neither consumes the other's value.
- Given an absolute `--asset-path`, then the run exits 2.
- Given a scope alias and `--asset-path`, then the packages that hold that directory are planned and the rest are skipped — the declaration stops being the filter.
- Verified by `__tests__/cli.test.ts`.

### AC-ASSET-PATH-APPLY — a computed manifest drives applying, not just planning

- Given a first applying run, then every asset under the named directory lands at its destination with the source bytes.
- Given a second run with nothing changed, then it reports up-to-date and rewrites nothing.
- Given a locally edited copy, then the run exits 2 asking for `--force`, and `--force` restores the source bytes and names the overwritten entries on stderr.
- Given an edit to the source directory, then the next run sees it with no build step in between, and the run after `--force` settles to up-to-date.
- Given `--agent=codex`, then the rule merges into `AGENTS.md` as a marker block, re-running is idempotent, and content outside this tool's markers survives byte for byte.
- Verified by `__tests__/assetPathRoundTrip.test.ts`.

## History

- 2026-08-06 — `--asset-path` broke the assumption that `agents.assetPath` is the only way to name an asset root, so that a package shipping assets in `agents/` or `docs/` without declaring them is still injectable. It overrides rather than falls back, and ignores any stored manifest, because a conditional winner would leave the run's actual source unknowable from its output.
- 2026-08-06 — `--json` became a real renderer. It previously forced the plain path while its help text promised structured output, so an agent parsing stdout got a colour-coded transcript. The logger gained a one-way switch to stderr because it wrote diagnostics to stdout, where they would corrupt the document.
- 2026-08-05 — Forked from `@slats/claude-assets-sync` at 0.3.5 and reset to 0.1.0. The consumer key moved from `claude` to `agents` because the contract now serves more than one agent; the original package is frozen rather than migrated, so already-published consumers keep working against it.

## Last Updated

2026-08-06 — Added `--asset-path`, `AC-CLI-ASSET-PATH` and `AC-ASSET-PATH-APPLY`; recorded that the hash manifest is no longer the sole source of source-side hashes, and that an applying round trip — not only a dry run — now holds that claim.
