# @winglet/json-schema: bug bounty round 6

No new findings in `@winglet/json-schema`. Items in the documents of [round 1](../round-1/winglet-json-schema.md), [round 2](../round-2/winglet-json-schema.md), [round 3](../round-3/winglet-json-schema.md), [round 4](../round-4/winglet-json-schema.md) and [round 5](../round-5/winglet-json-schema.md) are treated as fixed and excluded, together with their decisions and known limits. The main session re-runs every probe: `r6-winglet-data` runs 1 passing test. The cross-package release folder hosted in common-utils runs 56 passing tests, including this package's runtime and declaration surfaces. No regression or watch-list repeat is confirmed.

Probes: [probes/winglet-json-schema/](probes/winglet-json-schema/)

- Copy `r6-winglet-data` back to `packages/winglet/json-schema/src/__bounty__/r6-winglet-data/` and run `yarn workspace @winglet/json-schema test --run src/__bounty__/r6-winglet-data/`. The probe uses source and existing built workspace dependencies. Release probes and their run command are hosted in [common-utils](winglet-common-utils.md).
- The new probe passes. The main session's earlier-probe re-run for this package records 130 tests and 4 failures under the default configurations, including the round 4 folders, without an original fixed-input regression. The four retained round 3 schema failures are diagnostics; the NaN and percent-spelling probes do not create new supported contracts. Earlier product assertions pass.

Root-cause files: none; no finding is confirmed.

## Hypotheses checked and not bugs

- A mutation introducing a null-prototype schema and child dictionary produces identical synchronous and asynchronous descendant traversal and output while preserving caller input (`r6-winglet-data/traversal.test.ts`).
- Default-port spellings behave equivalently through synchronous and asynchronous scanners and resolver paths in retained regression coverage.
- Current built export targets exist, public names agree between module formats, bare and resolved import spellings agree, and supported strict declaration-consumer profiles pass. These checks certify the inspected release surfaces rather than every scanner behavior.
