# @winglet/react-utils: bug bounty round 6

1 new finding in `@winglet/react-utils`, low. Items in the documents of [round 1](../round-1/winglet-react-utils.md), [round 2](../round-2/winglet-react-utils.md), [round 3](../round-3/winglet-react-utils.md), [round 4](../round-4/winglet-react-utils.md) and [round 5](../round-5/winglet-react-utils.md) are treated as fixed and excluded, together with their decisions and known limits. The main session re-runs every probe: `r6-style-react-modal` runs 4 tests, of which 2 fail. The cross-package release folder hosted in common-utils runs 56 passing tests and includes this package's runtime and declaration surfaces. No item is a regression or a watch-list repeat.

Probes: [probes/winglet-react-utils/](probes/winglet-react-utils/)

- Copy `r6-style-react-modal` back to `packages/winglet/react-utils/src/__bounty__/r6-style-react-modal/` and run `yarn workspace @winglet/react-utils test --run --config src/__bounty__/r6-style-react-modal/vitest.config.ts src/__bounty__/r6-style-react-modal/hookOwnership.test.tsx`. The source-condition configuration supplies source aliases. The no-cast input type probe runs without emission with `yarn workspace @winglet/react-utils exec tsc -p src/__bounty__/r6-style-react-modal/tsconfig.probe.json`.
- Both failures establish item 1. The timeout-owner teardown control and repeated Activity snapshot-reference control pass; the standalone type probe also passes. Metadata is carried inside an ordinary configuration prop, so the result does not depend on React forwarding symbol-named properties.
- The main session's earlier-probe re-run for this package records 41 tests and 11 failures under the default configurations, including the round 4 folders, without an original fixed-input regression. React-utils' retained failures express documentation decisions about unmount callbacks, Portal reconciliation, component filtering, debounce trailing calls and snapshot publication, obsolete site examples, and the documented React 16.14/17 strict native ECMAScript-module limit. Release probes and their command are hosted in [common-utils](winglet-common-utils.md).

Root-cause files: `packages/winglet/react-utils/src/hooks/useRestProperties.ts`

## 1. useRestProperties returns stale enumerable symbol values and retains symbol properties after deletion.

- Severity: low. Rare but type-admitted symbol-keyed metadata changes are silently omitted from the stabilized configuration object.
- Affected public API: `useRestProperties`, from the root and hook entry.
- Contract violated: `packages/winglet/react-utils/src/hooks/useRestProperties.ts:21` promises shallow comparison of every own enumerable property, and `:54` promises the new object when contents change; `packages/winglet/react-utils/docs/en/SPECIFICATION.md:376` states the same return-value contract. The equal-symbol control at `packages/winglet/react-utils/src/hooks/__tests__/useRestProperties.test.tsx:396` does not exercise changed or removed symbols.
- Root cause: `packages/winglet/react-utils/src/hooks/useRestProperties.ts:63-64` enumerates both inputs with `Object.keys`, omitting symbols; `:70` returns the previous object when string keys remain equal, regardless of symbol additions, changes or deletions.
- Relation to earlier rounds: the incomplete shallow-comparison class of [round 1 react-utils item 2](../round-1/winglet-react-utils.md), with an omitted key rather than an enumerated undefined-key rename.
- Reopens an earlier fix: [round 4 react-utils item 2](../round-4/winglet-react-utils.md), commits `b33cc58aa` and `110d69156`, which rework caching/publication while retaining the existing enumeration restriction.
- Regression of an earlier fix: no. The pre-`b33cc58aa` implementation also uses `Object.keys`, so neither symbol input has an earlier correct result.
- Watch list: no.
- Reproduction: `r6-style-react-modal/hookOwnership.test.tsx`, "R1 a changed enumerable symbol property is returned like a changed string property" returns the old `{ selected: false }` metadata instead of the new `{ selected: true }` by identity. "R2 a removed enumerable symbol property disappears like a removed string property" gives `Object.hasOwn(result.current, metadata) === true`, expected `false`.
- Confidence: high; public API from source in jsdom, with no-cast generic input verified by a passing standalone type check.

## Hypotheses checked and not bugs

- A child cleanup cannot restart the parent's timeout after the timer-owning component unmounts.
- Two Activity hide/reveal cycles retain snapshot-reference identity and publish the final committed value.
- Snapshot references intentionally expose the previous committed value during an update render; current guidance and declarations pass retained checks.
- Strict native ECMAScript-module resolution with React 16.14/17 remains the documented round 5 limit. The supported current installed-type declaration profiles pass; testing the oldest complete React type package remains outside this release review.

## Open leads

- The release review does not install the oldest complete React type package, so the corresponding round 5 compatibility lead remains open; current installed-type profile success does not settle it.
