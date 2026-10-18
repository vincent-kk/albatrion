# Itemless array declaration plan brief — phase one only

Start only after the coordinator dispatch confirms PR #422 and its ledger close are merged. Work in /Users/Vincent/Workspace/albatrion/l3e-direct-ownership, never the parent coordinator workspace. Read package CLAUDE.md and repository rules. This brief requests a plan and proof obligations, not product edits or a PR yet.

Orca rules: run-use 와 코디네이터 명령 금지, check 는 --terminal 로. Do not run run-use or coordinator commands. Use the live-preamble check --terminal and ask commands, no other agents, installs, new fetchers, permission workarounds, or bare git stash. CLIs run standalone without pipes, semicolons, redirects or environment prefixes.

## 0. Baseline

Preserve all raw evidence and verify the workspace is clean apart from authorized ignored task data. Fetch origin feat/schema-form-08-review-and-perf and create perf/schema-form-itemless-declarations from its current tip. Record the exact base, source and dist identities. The coordinator dispatch names the current ledger close. Read the merged mount-breakdown-results.md and its readiness-guard limitation and fair measurement boundary; historical factory-only legacy ratios are invalid and are not targets.

## 1. One inefficiency and the intended invariant

The measured itemless array mount creates zero children but calls getItemEntries N times for N=1000 and8000. Trace src/core/engine/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts and confirm the actual paths, signatures and consumers of getItemEntries and populateNodeChildren. The tentative rule is to return the existing EMPTY declaration result when the immutable effective blueprint proves that item, prefix items, and every corresponding candidate are absent for every nonnegative slot. Every other schema uses the existing path. Prove this condition rather than checking raw jsonSchema.items or only the currently active branch.

The plan must account for oneOf/allOf/then/else/controls contributions, inactive candidates, tuple/additionalItems, gates, union, recursion, terminal mode, explicit defaults, schema defaults and wrong-kind input. Trace every relevant consumer of LAST/ENTRIES memo state before removing its N-cell population. Existing selection, commit, revision, event, children reference, input ownership and source-snapshot behavior remain unchanged. Extras and output/snapshot copies remain O(N); do not predict whole-mount savings from the profile share. No cache, global state, public export or scope expansion.

## 2. Plan before editing

Use seiri:write-plan and its workflow acknowledgement in this worker project. Choose the planning method by the skill precedence and identify its source. Produce a self-contained plan plus .seiri/tasks/<task>/gates.md with meaningful CHECK and literal EXPECT markers. Confirm exact source and verification ownership with the existing INTENT/DETAIL chain; no full Filid scan during ordinary planning. Do not introduce an ADR unless a real structural decision is required, and stop if such a boundary change would exceed this hypothesis.

Resolve the exact eligibility condition, preservation argument, smallest code surface, nearest test/fixture locations, expected code-size tradeoff and fallback matrix. Record uncertain facts as findings and identify their owner; do not hide them as implementation steps. Do not edit product code, tests, INTENT or DETAIL in this planning dispatch. DETAIL changes will be committed before code only after review clears the plan. Preserve the package public surface.

Map acceptance to executable evidence: a new mount guard that fails on the current N-call behavior and passes with an N-independent upper bound on fresh blueprints; complete before/after dist observation comparison for values and key order, all listener event/payload/order and onChange, revision bits and commit order, node/children/extras/snapshot references, latent/inactive/misfit/diagnostic state and caller immutability; unchanged existing test expectations; the four package gates; and a quiet two-round alternating Node/Bun measurement using the corrected completed-value boundary. Include sparse arrays, own undefined, NaN, null/wrong-kind, frozen caller input, nested hosts, subsequent array verbs, Overwrite/Merge and batch, and preserve noneligible paths. Missing observation guards are added in the later implementation PR before the optimization. Tests import internals directly at their proper owner and do not widen entry points.

Every numeric plan claim has a measuring gate. Gates must assert the result and emit their EXPECT marker only on success; a command that merely prints data is insufficient. Respect standalone CLI rules when defining commands. Avoid unrelated coverage or implementation-mirroring tests. State which existing valid evidence can be reused and which evidence the source change invalidates. Account for separate build commits if tracked generated artifacts change.

## 3. Report and stop

Report in complete formal Korean sentences: base, plan/gate paths, planning method, exact proposed eligibility and proof, source/fixture/test surface, consumer findings, expected red/green and comparison evidence, and unresolved decisions. Send worker_done once using live Task/Dispatch IDs and an explicit outcome, then idle. The coordinator commissions independent plan review and authorizes seiri:execute/implement in a new dispatch. Do not optimize, open a PR, merge or start agents during this phase. No co-author, session ID or Claude-Session line in future commits/PRs; owner only Vincent or Vincent Kelvin.
