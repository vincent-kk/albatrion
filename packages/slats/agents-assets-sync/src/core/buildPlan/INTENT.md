# buildPlan

## Purpose

Produce the declarative action list an applier executes. Compares every manifest entry against what is already installed at the destination the caller resolved, and reports content this package installed earlier but no longer ships. Reads the filesystem; writes nothing.

## Structure

- `index.ts` — barrel export
- `buildPlan.ts` — the planner
- `type.ts` — `ActionKind`, `ActionTarget`, `Action`, `InjectPlan`, `PlanInput`
- `utils/readDocument.ts` — per-plan cached reader for shared documents
- `utils/walkFiles.ts` — async recursive file walker (ENOENT-safe)
- `utils/toPosix.ts` — cross-platform forward-slash normalisation
- `__tests__/` — this fractal's verification files

## Conventions

- `ActionKind` and `ActionTarget` are orthogonal: the verdict does not depend on whether content is a file or a block inside a shared document. Consumers switch on `kind` first, then on `target.kind`.
- Depends on sibling fractals `agentTarget/` (`Destination`, `OrphanScan`) and `markerBlock/` (block-body verdict), both through their `index.ts`. Both edges run one way; the graph stays acyclic.

## Boundaries

### Always do

- Emit at most one action per manifest entry, and one per orphan found
- Set `requiresForce` for every `warn-diverged` and every orphan seen without `--force`
- Skip a manifest path that has no destination — absence is the signal that a kind filter excluded it

### Ask first

- Adding an `ActionKind` variant — every renderer and the applier must handle it in lockstep
- Scanning for orphans outside the scans the caller supplied

### Never do

- Execute the plan; planning is read-only, applying belongs to `injectDocs/`
- Import from `injectDocs/`, `commands/`, or `ui/`
