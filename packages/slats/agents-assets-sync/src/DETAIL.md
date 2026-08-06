# agents-assets-sync Specification

## Requirements

- The engine exposes a single `inject-agents-settings` bin (dispatcher). Consumers declare `agents.assetPath` in `package.json` — or the caller names it with `--asset-path`; the engine injects that tree into the locations each selected agent uses, for one explicitly-named target per invocation or a batch via scope alias.
- Every choice is reachable by flag. A run with `--package`, `--agent`, `--scope` and, where content diverges, `--force --yes`, completes with no prompt at all.
- `--package=<name>` is mandatory. The dispatcher resolves that one package's `package.json` via `createRequire(...).resolve()` and extracts `{ name, version, agents.assetPath }`, taking `--asset-path` in place of the declaration when it is given. A target is therefore reachable only when `createRequire` can see it — its `exports` expose `./package.json`, or its main entry is requireable. This package exposes its own, so the engine is targetable by its own dispatcher despite being ESM-only.
- `--agent=<claude|codex|agents>` accepts repeats and comma-separated values. Omitted, an interactive TTY shows the picker; every other context exits 2. A run selecting both agents produces one plan per pair.
- `--asset=<skills|rules|commands>` narrows the run. A kind left out is absent from the plan, so the run neither reports nor deletes anything belonging to it.
- `--asset-path=<path>` names the asset root relative to each target's package root, for a package that ships assets in a directory like `agents/` or `docs/` without declaring one. It overrides `agents.assetPath` on every target and makes that directory the only source of hashes, so `dist/agents-hashes.json` is neither read nor required. An empty, absolute or `~`-prefixed value exits 2 before any filesystem IO; a path outside the package root or naming no directory exits 2 for a single target and is skipped in a batch.
- Per-entry SHA-256 comparison: copy when missing, skip when equal, warn and require `--force` when different. A codex rule block is compared the same way, by the body between its markers.
- `--force` overwrites diverged content. TTY: the Ink `ConfirmForce` dialog lists diverged and orphan entries first, unless `--yes`. Non-interactive: the list goes to stderr and the run proceeds.
- `--dry-run`: print the plan, no writes.
- `--json` selects a third renderer that writes exactly one JSON document to stdout and diverts every diagnostic to stderr; `--no-interactive` forces the plain render path instead. The document carries `schemaVersion`, `dryRun`, `exitCode`, `errors`, and one `unit` per `(package, agent)` pair holding that unit's destination, plan actions and report. A flag error becomes `errors` with `exitCode: 2` and empty `units`. `errors` also carries notices that did not fail the run — the reason each target was skipped — so `errors` being non-empty does not by itself mean `exitCode` is 2. A failure upstream of the renderer leaves stdout empty and reports through the exit code alone.
- Missing `--scope` or `--agent` outside an interactive TTY: exit 2.
- Missing `--package`, unresolvable package, missing `agents.assetPath` with no `--asset-path`, or an invalid `--agent`/`--asset`/`--asset-path` value: exit 2.
- An asset root that resolves outside its package is refused whichever named it — a declared `agents.assetPath` and `--asset-path` are judged alike, on the resolved location rather than the spelling, so a symlink out of the package is refused too.
- `dist/agents-hashes.json` (schema v1) is generated at build time by `buildHashes`; `previousVersions: {}` is reserved for future use. A run driven by `--asset-path` computes the same document in memory instead, so it needs no build output.
- A declared `agents.assetPath` with no such file falls back to that same in-memory computation, so a package whose build has not run is still injectable. The fallback requires the declared directory to be there: hashing an absent one succeeds with an empty manifest, and an empty manifest makes every already-installed file an orphan that `--force` deletes. With neither present the target is reported and never planned.
- That target is refused the same way one with no `agents.assetPath` is: exit 2 when the run named a single package, a reported skip when it named several or a whole scope. The refusal happens before the renderer is chosen, so the verdict is the run's and does not change with `--json`.
- The version every surface reports — `--version`, the Ink banner and footer, the `--json` document — comes from `utils/version.ts`, generated from `package.json` by `scripts/inject-version.js`. `yarn version:sync` runs the generator, and `build`, `dev` and each `version:major|minor|patch` bump chain through it, so a bump cannot leave the reported version behind.

## API Contracts

- `runCli(argv: string[]): Promise<void>` — CLI entry. Parses flags, resolves targets, branches via `renderOrFallback` to either Ink (`ui.renderInjectApp`) or plain (`renderPlain`). No other programmatic orchestrator is exposed; callers that need headless behaviour compose core primitives directly.
- Core primitives re-exported via `.`: `readHashManifest`, `computeNamespacePrefixes`, `resolveProjectRoot`, `resolveAgentTarget`, `resolveDestinations`, `formatBlockId`, `parseBlocks`, `isValidScope`, `isValidAgent`, `MARKER_PREFIX`, `PROJECT_ANCHORS`, `HASH_MANIFEST_FILENAME`. Full contracts in `core/DETAIL.md`.
- `buildHashes(opts): Promise<{ outPath, fileCount }>` — `./buildHashes` subpath (Node ESM); standalone CLI is `agents-build-hashes`. All four of `packageRoot`, `packageName`, `packageVersion` and `assetPath` are required; the implementation throws without them, and the type declaration says so. Ignores `.omc/**`, `*.log`, `.DS_Store`.

## Subpath Exports

- `.` — ESM; `runCli` + core primitives + types
- `./buildHashes` — Node ESM; `buildHashes`
- `./package.json` — the manifest itself. An ESM-only package is invisible to `createRequire`, and the dispatcher reads every target through it, so gating this subpath would make the engine the one package its own CLI cannot inject.

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
- Given every target skipped, then a document still arrives with `units: []` and `exitCode: 0`, and `errors` carries each skip reason. Resolving nothing is a run that did nothing, and a reader cannot tell that from a crash without a document.
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

### AC-CLI-UNBUILT-MANIFEST — a declared asset tree is injectable before it is built

- Given a package that declares `agents.assetPath` and ships no `dist/agents-hashes.json`, when the run names it with no `--asset-path`, then the declared directory is hashed at run time and the plan lists its files.
- Given the same package with the declared directory absent as well, then no source can answer: the run names that and plans nothing for the target.
- Given that package named alone, then the run exits 2 — with or without `--json`.
- Given it reached through a scope alias alongside a usable package, then the run exits 0 and plans the usable one — with or without `--json`.
- Verified by `__tests__/cli.test.ts`.

### AC-ASSET-PATH-APPLY — a computed manifest drives applying, not just planning

- Given a first applying run, then every asset under the named directory lands at its destination with the source bytes.
- Given a second run with nothing changed, then it reports up-to-date and rewrites nothing.
- Given a locally edited copy, then the run exits 2 asking for `--force`, and `--force` restores the source bytes and names the overwritten entries on stderr.
- Given an edit to the source directory, then the next run sees it with no build step in between, and the run after `--force` settles to up-to-date.
- Given `--agent=codex`, then the rule merges into `AGENTS.md` as a marker block, re-running is idempotent, and content outside this tool's markers survives byte for byte.
- Verified by `__tests__/assetPathRoundTrip.test.ts`.

### AC-VERSION-SYNC — the reported version is the manifest version

- Given the generated `utils/version.ts`, then `VERSION` equals the `version` field of `package.json`.
- Verified by `__tests__/version.test.ts`.

- The end-to-end suites drive the built bin, so `dist/` decides what they test. They refuse to run — naming the reason in the skip — when `dist/` is absent or older than `src/`; a silent skip hides the gap and a stale build reports green for code nobody ran. Verification files are excluded from that comparison, so editing a test does not demand a rebuild.
- Those suites install their own consumer packages under a scratch root. They must not lean on a sibling workspace's `dist/agents-hashes.json`: it is git-ignored and no build of this package produces it, so a fresh checkout would not reproduce the result.

## History

- 2026-08-06 — The verdict for a target that can supply no hashes moved out of the renderers. All three asked the same predicate and then each decided for itself what it meant: plain and Ink dropped the target and finished at 0, `--json` reported 1 — so the same packages produced a different CI outcome depending on an output flag. The decision now happens once, before the renderer is chosen, on the strict / soft-skip split a missing `agents.assetPath` already used. Making the renderers unable to answer beats making them agree: a fourth renderer would otherwise reintroduce the same divergence.
- 2026-08-06 — A declared `agents.assetPath` stopped requiring build output. `--asset-path` had been the only way to reach run-time hashing, so the default path did nothing at all for a package whose `dist/agents-hashes.json` was not built yet — while the very directory it declared sat there ready to hash. The fallback is conditional on that directory existing, and deliberately so: an absent one hashes to an empty manifest, and an empty manifest reclassifies every installed file as an orphan for `--force` to delete.
- 2026-08-06 — `exports` gained `./package.json`. The ESM-only build left the engine unresolvable by `createRequire`, both on `<name>/package.json` and on the bare specifier, so `--package=@slats/agents-assets-sync` exited 2 and this repository's own `.claude/skills` could not be re-synced by the tool that owns them. The old CJS-built package resolved through the main-entry fallback and hid the gap. Exposing the manifest is the one fix that stays inside the boundary: reaching an ESM-only package any other way means walking `node_modules`, which `runCli/INTENT.md` reserves for `resolveScopeAlias.ts`.
- 2026-08-06 — `utils/version.ts` had drifted to `0.1.0` while the manifest already read `0.1.1`. Only `build` and `dev` ran the generator, so a `version:*` bump left the constant behind and every surface reporting it stated the previous release until someone rebuilt. The bump scripts now chain `version:sync`, and `AC-VERSION-SYNC` keeps the two in step whether or not a build ran.
- 2026-08-06 — `--asset-path` broke the assumption that `agents.assetPath` is the only way to name an asset root, so that a package shipping assets in `agents/` or `docs/` without declaring them is still injectable. It overrides rather than falls back, and ignores any stored manifest, because a conditional winner would leave the run's actual source unknowable from its output.
- 2026-08-06 — `--json` became a real renderer. It previously forced the plain path while its help text promised structured output, so an agent parsing stdout got a colour-coded transcript. The logger gained a one-way switch to stderr because it wrote diagnostics to stdout, where they would corrupt the document.
- 2026-08-05 — Migrated from `@slats/claude-assets-sync`, renamed in place at 0.3.5 and reset to 0.1.0. The consumer key moved from `claude` to `agents` because the contract now serves more than one agent, and every consumer in this repository moved with the rename — nothing builds or publishes the old name any more. What stays behind is only what npm already holds: `@canard/schema-form@0.12.0` was published against `@slats/claude-assets-sync@^0.2.0`, so those releases must remain on the registry for consumers that installed them.

## Last Updated

2026-08-06 — Stated that the gate verdict is the run's rather than the renderer's and extended `AC-CLI-UNBUILT-MANIFEST` with the exit codes. Earlier the same day: recorded the run-time hashing fallback for a declared `agents.assetPath` with no built manifest.
