# @winglet/json: bug bounty round 6

No new findings in `@winglet/json`. Items in the documents of [round 1](../round-1/winglet-json.md), [round 2](../round-2/winglet-json.md), [round 3](../round-3/winglet-json.md), [round 4](../round-4/winglet-json.md) and [round 5](../round-5/winglet-json.md) are treated as fixed and excluded, together with their decisions and known limits. The main session re-runs every probe: `r6-winglet-data` runs 2 tests, both passing. The cross-package release folder hosted in common-utils runs 56 passing tests, including this package's runtime and declaration surfaces. No regression or watch-list repeat is confirmed.

Probes: [probes/winglet-json/](probes/winglet-json/)

- Copy a folder back to `packages/winglet/json/src/__bounty__/<hunter-id>/` and run `yarn workspace @winglet/json test --run src/__bounty__/<hunter-id>/`. The retained folders are `r6-winglet-data` and the new neighbor files in `r6-rerun-packages`. Release probes and their run command are hosted in [common-utils](winglet-common-utils.md).
- The new package probes pass. The main session's earlier-probe re-run for this package records 342 tests and 19 failures under the default configurations, including the round 4 folders, without an original fixed-input regression. JSON's retained failures are recorded pointer-grammar, array-prefix and inherited-key limits, superseded documentation examples, reference-library diagnostics, depth measurements and the rejected NaN hypothesis. NaN lies outside JSON values; the reference `fast-json-patch` diagnostics do not test this package's correctness.

Root-cause files: none; no finding is confirmed.

## Hypotheses checked and not bugs

- Cross-branch move and copy of reserved-key null-prototype dictionaries, followed by a descendant write, preserve written container prototypes and the original input (`r6-winglet-data/containers.test.ts`).
- Compare/applyPatch and difference/mergePatch preserve reserved and escaped key additions and removals in null-prototype dictionaries (`r6-winglet-data/containers.test.ts`).
- Immutable copy/move through null-prototype containers and repeated or trailing nonnumeric empty-token round trips pass the retained neighbor checks (`r6-rerun-packages/rg3-neighbors.test.ts`).
- Pointer conversion retains its documented numeric, bracket and dot losses; those domains are exclusions rather than new findings.
- Current built targets exist, module-format public names agree, bare and resolved import addresses agree, and supported strict declaration-consumer profiles pass. These are release-surface checks rather than exhaustive behavioral equivalence.
