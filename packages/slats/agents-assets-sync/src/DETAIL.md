# agents-assets-sync Specification

## Requirements

- The engine exposes a single `inject-agents-settings` bin (dispatcher). Consumers declare `agents.assetPath` in `package.json`; the engine injects that tree into the locations each selected agent uses, for one explicitly-named target per invocation or a batch via scope alias.
- Every choice is reachable by flag. A run with `--package`, `--agent`, `--scope` and, where content diverges, `--force --yes`, completes with no prompt at all.
- `--package=<name>` is mandatory. The dispatcher resolves that one package's `package.json` via `createRequire(...).resolve()` and extracts `{ name, version, agents.assetPath }`.
- `--agent=<claude|codex|agents>` accepts repeats and comma-separated values. Omitted, an interactive TTY shows the picker; every other context exits 2. A run selecting both agents produces one plan per pair.
- `--asset=<skills|rules|commands>` narrows the run. A kind left out is absent from the plan, so the run neither reports nor deletes anything belonging to it.
- Per-entry SHA-256 comparison: copy when missing, skip when equal, warn and require `--force` when different. A codex rule block is compared the same way, by the body between its markers.
- `--force` overwrites diverged content. TTY: the Ink `ConfirmForce` dialog lists diverged and orphan entries first, unless `--yes`. Non-interactive: the list goes to stderr and the run proceeds.
- `--dry-run`: print the plan, no writes.
- `--json` selects a third renderer that writes exactly one JSON document to stdout and diverts every diagnostic to stderr; `--no-interactive` forces the plain render path instead. The document carries `schemaVersion`, `dryRun`, `exitCode`, `errors`, and one `unit` per `(package, agent)` pair holding that unit's destination, plan actions and report. A flag error becomes `errors` with `exitCode: 2` and empty `units`; a failure upstream of the renderer leaves stdout empty and reports through the exit code alone.
- Missing `--scope` or `--agent` outside an interactive TTY: exit 2.
- Missing `--package`, unresolvable package, missing `agents.assetPath`, or an invalid `--agent`/`--asset` value: exit 2.
- `dist/agents-hashes.json` (schema v1) is generated at build time by `buildHashes`; `previousVersions: {}` is reserved for future use.

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
- Verified by `tests/e2e/json.test.ts`.

### AC-CLI-FLAGS — the CLI is drivable without a prompt

- Given `--package`, `--agent` and `--scope`, when the CLI runs on a non-TTY, then it completes without asking anything.
- Given `--agent` is missing on a non-TTY, then the run exits 2.
- Given an unknown `--agent` or `--asset` value, then the run exits 2.
- Verified by `tests/e2e/cli.test.ts`.

### AC-CLI-ROUTING — each agent receives its own plan

- Given `--agent=claude,codex`, when the CLI runs, then the transcript carries one section per agent.
- Given `--agent=codex` at `project` scope, then rule entries name the `AGENTS.md` they merge into and skill entries name `.agents/skills`.
- Given `--agent=codex --asset=skills`, then no `AGENTS.md` entry appears at all.
- Verified by `tests/e2e/cli.test.ts`.

## History

- 2026-08-06 — `--json` became a real renderer. It previously forced the plain path while its help text promised structured output, so an agent parsing stdout got a colour-coded transcript. The logger gained a one-way switch to stderr because it wrote diagnostics to stdout, where they would corrupt the document.
- 2026-08-05 — Forked from `@slats/claude-assets-sync` at 0.3.5 and reset to 0.1.0. The consumer key moved from `claude` to `agents` because the contract now serves more than one agent; the original package is frozen rather than migrated, so already-published consumers keep working against it.

## Last Updated

2026-08-05 — Added the agent axis: `--agent`, `--asset`, `--yes`, `--no-interactive`; codex support via `.codex/skills` and `AGENTS.md` marker blocks.
