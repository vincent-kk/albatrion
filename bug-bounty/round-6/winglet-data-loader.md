# @winglet/data-loader: bug bounty round 6

1 new finding in `@winglet/data-loader`, low. Items in the documents of [round 1](../round-1/winglet-data-loader.md), [round 2](../round-2/winglet-data-loader.md), [round 3](../round-3/winglet-data-loader.md), [round 4](../round-4/winglet-data-loader.md) and [round 5](../round-5/winglet-data-loader.md) are treated as fixed and excluded, together with their decisions and known limits. The main session re-runs every probe: `r6-winglet-data` runs 3 tests, of which 2 fail. The cross-package release folder hosted in common-utils runs 56 passing tests and includes this package's runtime and declaration surfaces. No item is a regression or a watch-list repeat.

Probes: [probes/winglet-data-loader/](probes/winglet-data-loader/)

- Copy `r6-winglet-data` back to `packages/winglet/data-loader/src/__bounty__/r6-winglet-data/` and run `yarn workspace @winglet/data-loader test --run src/__bounty__/r6-winglet-data/`. Foreign native values come from `node:vm`.
- Both failing tests establish item 1. The local batch and primed Error control passes. Release probes and their run command are hosted in [common-utils](winglet-common-utils.md).
- The main session also re-runs earlier retained probes for this package: 19 tests and 3 failures under the default configurations, including the round 4 folders, with no original fixed-input regression. This package's remaining failures express recorded per-key Error caching/retry decisions and obsolete documented options, including boolean `cache`, `cacheMap`, `scheduler` and `batch: false`; they do not establish new behavior failures.

Root-cause files: `packages/winglet/data-loader/src/DataLoader.ts`

## 1. A foreign-realm Error returned for a key or supplied to prime resolves as successful data.

- Severity: low. A rare foreign-realm input bypasses the rejection channel and reaches callers as a value. The hunter rates this high; the final rating is low because the input is rare and reference `dataloader` 1.4.0 uses the same `instanceof Error` checks at `index.js:152` and `:271`.
- Affected public API: `DataLoader#load`, batch-loader per-key errors and `DataLoader#prime`.
- Contract violated: `packages/winglet/data-loader/docs/en/SPECIFICATION.md:112` requires an individual Error result to reject its corresponding promise; `packages/winglet/data-loader/src/DETAIL.md:48` requires a primed error to be interpreted as an error. The public `prime` signature accepts Error without a realm restriction.
- Root cause: `packages/winglet/data-loader/src/DataLoader.ts:853` recognizes failed results only with this realm's `instanceof Error`, so `:854` resolves a foreign Error as data. The same check at `:804` sends a foreign primed Error through `Promise.resolve` rather than `Promise.reject`.
- Relation to earlier rounds: the foreign-value class represented by [round 4 common-utils item 11](../round-4/winglet-common-utils.md), in a different package and function.
- Reopens an earlier fix: no. The checks trace to pre-bounty implementation rather than a bounty fix.
- Regression of an earlier fix: no.
- Watch list: no.
- Reproduction: `r6-winglet-data/foreignErrors.test.ts`, "batch foreign errors reject just like local per-key errors" gives `{ status: 'fulfilled', message: 'remote fetch failed' }`, expected `{ status: 'rejected', message: 'remote fetch failed' }`; "primed foreign errors reject just like local primed errors" gives `fulfilled`, expected `rejected`. Local Error controls reject as required.
- Confidence: high; public API from source, with foreign native Errors created through `node:vm`.

## Hypotheses checked and not bugs

- Local native Error results and primed local Errors follow the documented rejection channel.
- Retained scheduling, cache, prime, NaN and open-batch exception probes do not reproduce their original fixed failures. Retrying a cached per-key Error requires `clear(key)` under the recorded decision.
- Current built runtime targets, module-format public names and supported strict declaration-consumer profiles pass the cross-package release checks. No round 5 package changeset is missing: data-loader has no round 5 behavioral change.
