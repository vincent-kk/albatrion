# core Specification

## Requirements

- `core/**` is a collection of pure, stateless primitives. No function in this tree writes to `process.stdout`/`process.stderr` except the single `logger.warn` inside `injectDocs/utils/applyAction.ts` for rare unlink failures.
- Scope resolution is deterministic — `resolveProjectRoot` reads only `cwd` and `homedir`. `user` answers with the home directory; `project` returns the nearest ancestor owning any of `.claude`, `AGENTS.md`, `.agents`, `.codex`, `.git`, falling back to `cwd`, and reports `autoLocated` when the answer came from above `cwd`. Anchor existence decides — `AGENTS.md` is a file, and `.git` is a file inside a worktree.
- One project root serves every selected agent, so a run targeting several agents cannot straddle two projects.
- `resolveAgentTarget` maps `(agent, scope)` onto asset locations. claude roots all kinds under `<projectRoot>/.claude`. codex and agents both keep skills in a `skills/` directory, merge rules into an `AGENTS.md`, and report `commands` as unsupported; at `project` scope they are identical (`<projectRoot>/.agents/skills` and `<projectRoot>/AGENTS.md`) and differ only at `user` scope, where codex uses `~/.codex` and agents uses `~/.agents`.
- `resolveDestinations` omits a manifest path whose kind is unknown or filtered out. Absence is the mechanism that stops a kind-filtered run from reporting or deleting anything outside the requested kinds.
- A skill directory whose first segment starts with `.` is rejected with an error — that namespace is the agent's own (Codex ships built-ins under `skills/.system/`).
- Plan building is read-only — `buildPlan` compares source hashes with the destination and returns `InjectPlan`; it never writes.
- A block is judged exactly as a file is: `blockBodyMatches` compares the body between markers against the manifest hash, accepting the one trailing newline `upsertBlock` adds when the source lacks one.
- `warn-diverged` and every orphan seen without `--force` set `requiresForce`. `skip-unsupported` does not.
- Plan application is side-effect only. `applyAction` handles `file` targets; `applyBlockActions` rewrites one shared document per call so concurrent writers cannot drop each other's blocks. Content outside this tool's markers survives byte for byte.
- `partitionActions` makes `warn-diverged` executable only when `force` is granted — that is where the CLI's "--force overwrites" promise is kept.
- Hash computation is deterministic — `hashContent`/`hashFile` use Node's `crypto` module only.
- `readHashManifest` rejects `schemaVersion !== 1` as an explicit error.
- Orphan detection runs only the scans the caller supplied. A block scan considers blocks owned by the named package alone, so another package's or another tool's blocks are never proposed for deletion.

## API Contracts

- `resolveProjectRoot(scope: Scope, cwd?: string): ProjectRootResolution`
- `findNearestAnchorAncestor(start: string): string | null`
- `isValidScope(value: unknown): value is Scope`
- `PROJECT_ANCHORS: readonly ['.claude', 'AGENTS.md', '.agents', '.codex', '.git']`
- `resolveAgentTarget(agent: AgentType, scope: Scope, cwd?: string): AgentTarget`
- `isValidAgent(value: unknown): value is AgentType`
- `splitAssetKind(relPath: string): { kind: AssetKind; rest: string } | null`
- `resolveDestinations(input): { destinations: Map<string, Destination>; orphanScans: OrphanScan[] }`
- `formatBlockId(packageName: string, relPath: string): string`
- `parseBlocks(content: string): ParsedBlock[]`
- `findBlockBody(content: string, blockId: string): string | null`
- `upsertBlock(content: string, blockId: string, body: string): string`
- `removeBlock(content: string, blockId: string): string`
- `blockBodyMatches(body: string, expected: Sha256Hex): boolean`
- `MARKER_PREFIX = 'AGENTS-ASSETS-SYNC'`
- `readHashManifest(packageRoot: string): Promise<HashManifest>`
- `computeNamespacePrefixes(manifest: HashManifest): string[]`
- `buildPlan(input: PlanInput): Promise<InjectPlan>`
- `partitionActions(actions, force): { fileActions: Action[]; blockGroups: Map<string, Action[]> }`
- `applyAction(action: Action, assetRoot: string): Promise<void>`
- `applyBlockActions(fileAbs: string, actions, assetRoot: string): Promise<void>`
- `summarize(plan: InjectPlan, exitCode: 0 | 1 | 2): InjectReport`
- `hashContent(buffer: Buffer | string): Sha256Hex`
- `hashFile(absPath: string): Promise<Sha256Hex | null>`
- `hashEquals(a: Sha256Hex | null, b: Sha256Hex | null): boolean`
- `HASH_MANIFEST_FILENAME = 'agents-hashes.json'`

## Exported Types

- `Scope`, `ProjectRootResolution`
- `AgentType`, `AssetKind`, `AgentTarget`, `Destination`, `OrphanScan`
- `ParsedBlock`
- `ActionKind`, `ActionTarget`, `Action`, `InjectPlan`, `PlanInput`
- `HashManifest`, `InjectReport`, `Sha256Hex`

## Acceptance Criteria

### AC-ROOT — one project root for every agent

- Given a directory owning any single anchor, when `project` scope is resolved from a descendant, then that directory is the project root and `autoLocated` is `true`.
- Given no ancestor owns an anchor, when `project` scope is resolved, then the starting directory is the root and `autoLocated` is `false`.
- Verified by `tests/core/scope.test.ts`.

### AC-DEST — each agent's asset locations

- Given `claude`, when destinations are resolved, then skills, rules and commands are files under `<projectRoot>/.claude/<kind>/`.
- Given `codex` or `agents` at `project` scope, then skills are files under `<projectRoot>/.agents/skills/`, rules are blocks in `<projectRoot>/AGENTS.md`, and commands are `unsupported`.
- Given `user` scope, then codex resolves to `~/.codex` and agents to `~/.agents`.
- Given a kind filter, when destinations are resolved, then paths of every other kind are absent and no orphan scan covers them.
- Given a skill namespace starting with `.`, when destinations are resolved, then the call throws.
- Verified by `tests/core/agentTarget.test.ts`.

### AC-BLOCK — a shared AGENTS.md keeps its other owners

- Given a document holding a foreign block and free prose, when this tool upserts and later removes its own block, then the document returns to its original bytes.
- Given an unchanged block, when the plan is rebuilt, then the verdict is `skip-uptodate` and the document is not rewritten.
- Given a hand-edited block, when the plan is rebuilt, then the verdict is `warn-diverged` and `requiresForce` is set.
- Verified by `tests/core/markerBlock.test.ts`, `tests/core/buildPlan.test.ts`, `tests/core/applyActions.test.ts`.

### AC-FORCE — force overwrites what it announces

- Given a diverged entry and no `--force`, when actions are partitioned, then nothing is executable.
- Given the same entry with `--force`, when actions are partitioned and applied, then the destination carries the source content again.
- Verified by `tests/core/applyActions.test.ts`.

## History

- 2026-08-05 — `ActionKind` split from `ActionTarget` so a verdict no longer implies a file. Required because codex keeps rules as blocks inside a shared `AGENTS.md`, which the previous `dstAbs`-per-action shape could not name.
- 2026-08-05 — `resolveScope`/`ScopeResolution` removed in favour of `resolveProjectRoot` plus `resolveAgentTarget`. The old function hardcoded `.claude`, which cannot answer for two agents.
- 2026-08-05 — `agents` added beside `codex`. The two share the project layout; `agents` exists so a tool that reads the vendor-neutral `.agents` home can be targeted without claiming to be Codex.
- 2026-08-05 — `--force` now overwrites diverged content. Previously the CLI announced the overwrite while `applyAction` handled only `copy` and `delete`, so diverged files were silently left alone.

## Last Updated

2026-08-05 — Added `agentTarget` and `markerBlock`; reworked `scope`, `buildPlan` and `injectDocs` for multi-agent destinations.
