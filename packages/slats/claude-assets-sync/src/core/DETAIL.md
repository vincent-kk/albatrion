# core Specification

## Requirements

- `core/**` is a collection of pure, stateless primitives. No function
  in this tree writes to `process.stdout`/`process.stderr` except the
  single `logger.warn` inside `injectDocs/utils/applyAction.ts` for
  rare unlink failures.
- Plan building is pure — `buildPlan` reads source hashes + target
  filesystem and returns `InjectPlan`; it never writes files.
- Plan application is side-effect only — `applyAction` copies or
  deletes one file; it never decides policy.
- Summarization is pure — `summarize` collapses a plan into
  `InjectReport` without touching disk.
- Scope resolution is deterministic — `resolveScope` reads only
  `cwd` and `homedir`; `project` auto-reuses the nearest ancestor
  `.claude` and tags the description with `(auto-located)` when it
  does so.
- Hash computation is deterministic — `hashContent`/`hashFile` use
  Node's `crypto` module only.
- `readHashManifest` rejects `schemaVersion !== 1` as an explicit error.
- `buildPlan` orphan detection only walks directories covered by the
  provided `namespacePrefixes` (currently `skills/<name>/`).

## API Contracts

- `readHashManifest(packageRoot: string): Promise<HashManifest>`
- `computeNamespacePrefixes(manifest: HashManifest): string[]`
- `resolveScope(scope: Scope, cwd?: string): ScopeResolution`
- `isValidScope(value: unknown): value is Scope`
- `findNearestDotClaudeAncestor(start: string): string | null`
- `buildPlan(input: PlanInput): Promise<InjectPlan>`
- `applyAction(action: Action, assetRoot: string): Promise<void>`
- `summarize(plan: InjectPlan, exitCode: 0 | 1 | 2): InjectReport`
- `hashContent(buffer: Buffer | string): Sha256Hex`
- `hashFile(absPath: string): Promise<Sha256Hex | null>`
- `hashEquals(a: Sha256Hex | null, b: Sha256Hex | null): boolean`
- `HASH_MANIFEST_FILENAME = 'claude-hashes.json'`

## Exported Types

- `HashManifest`, `Scope`, `ScopeResolution`
- `Action`, `InjectPlan`, `PlanInput`
- `InjectReport`, `Sha256Hex`

## Last Updated

2026-04-25 — Removed `injectDocs(opts)` orchestrator and `isInteractive`.
`core/**` now exposes primitives only; renderers (`ui/` and
`renderPlain`) compose them directly.
