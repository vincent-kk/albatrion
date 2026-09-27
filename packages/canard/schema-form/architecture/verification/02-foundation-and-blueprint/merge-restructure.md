# Merge Module Restructure Verification

## Scope and source identity

The public `merge` now selects default or option-aware recursion once. Each internal implementation recurses into itself. The wrapper also computes `replaceArrays` once from `options.arrayStrategy`; all option recursion receives that same boolean. Public package import paths and `MergeOptions` remain unchanged.

The owner subsequently directed deferring the release version. Commit `071cc8bf` restores common-utils to `0.15.0` and records the pending minor release in `.changeset/common-utils-merge-policies.md`; the measured implementation is unchanged.

Boundary documents preceded implementation: `4f9958baa` introduced the merge fractal, `c0ea5b69` clarified the independent object/array policies, and `56f74926` recorded the once-per-call array-policy decision. The previous implementation is pinned to `f7eef9ed9`. The final candidate was tested as the working tree on `56f74926ffcd9e91dc3451c66be9af162e50ffe7` and committed as `f09033cf`; the hashes below identify the measured source.

Candidate SHA-256:

| File under common-utils `src/utils/object/merge/` | SHA-256 |
| --- | --- |
| `merge.ts` | `9b16d38e6fd71a9087d1ccb116a55810c23c2d296b7472a77a407e34f18972ff` |
| `utils/mergeDefault.ts` | `75855ca5abe245df2f425e75253304291ef47a71797919f28eb7a2378ea8d02c` |
| `utils/mergeWithOptions.ts` | `1b38549e02311fca60b7adcae4499d0ada2d64bdecd753a7f713f8f8adf4700a` |

## Resulting ownership

Under common-utils `src/utils/object/merge/`, `index.ts` owns named exports, `merge.ts` selects policy, `utils/mergeDefault.ts` and `utils/mergeWithOptions.ts` own self-recursion, and `__tests__/` owns tests, benchmark and loader. The old flat implementation no longer exists. Parent/root exports reach the named entry point. Default recursion differs only by function/callee name; option recursion uses ancestor concrete property primitives. Existing assertions were retained with import/marker edits, plus the new getter case.

The designated benchmark config now includes both `bench/**/*.bench.ts` and `src/**/__tests__/**/*.bench.ts`. The new benchmark and its loader belong to the merge owner. Type declarations exclude `**/__tests__/**`; the package build succeeded and its generated dist inventory contains no verification or loader paths. Generated bundles are not source-commit artifacts.

## Functional and package checks

Before restructuring, the existing two merge suites passed unchanged: 2 files, 22 cases. The option getter regression failed with `expected 6 to be 1` under a temporary restoration of pre-hoist reads, then passed after restoration of the single-read wrapper. The probe was removed. Captured command/result summaries: `/tmp/schema-form-foundation-blueprint/merge-restructure-regression.log`.

Final designated command logs, captured after benchmark relocation:

| Command | Exit | Evidence |
| --- | --- | --- |
| `yarn workspace @winglet/common-utils lint` | 0 | `/tmp/schema-form-foundation-blueprint/merge-restructure-lint.log` |
| `yarn workspace @winglet/common-utils typecheck` | 0 | `/tmp/schema-form-foundation-blueprint/merge-restructure-typecheck.log` |
| `yarn workspace @winglet/common-utils test --run` | 0 | `/tmp/schema-form-foundation-blueprint/merge-restructure-test.log` — 145 files, 1,166 cases |
| `yarn workspace @winglet/common-utils build` | 0 | `/tmp/schema-form-foundation-blueprint/merge-restructure-build.log` — ESM/CJS, declarations, hashes and package typecheck |

The initial benchmark callback returned the merge result, which the installed Vitest `BenchFunction` type rejects. The callbacks were changed to return void and the designated typecheck/build were rerun successfully. No production behavior changed for that correction.

## Performance method

Final fixture: `packages/winglet/common-utils/src/utils/object/merge/__tests__/merge-restructure.bench.ts`.

Designated command, from the repository root:

```sh
yarn workspace @winglet/common-utils bench merge-restructure.bench.ts --outputJson ../../canard/schema-form/architecture/verification/02-foundation-and-blueprint/merge-restructure-final-4.json
```

Each pair runs the exact previous git source and the candidate source in one process, on the same nested-object/array fixture. Both implementations use the same installed TypeScript compiler and module injection path. The loader reads local immutable git objects for the baseline and source files for the candidate; it installs nothing and uses no network. A pre-measurement result check compares both loaded implementations with the package implementation for default, array replacement and array index policies.

Each row requests 300 ms warm-up with at least 100 warm-up iterations, then 1,000 ms measurement with at least 100 iterations. Actual samples are listed below. Three final paired runs were retained without selection. A fourth run proves discovery at the relocated owner-local path. No additional benchmark repetitions were run after that discovery check.

Environment: Node `v26.10.0`, Vitest `3.2.6`, macOS/Darwin `25.6.0`, arm64 Apple M1 Max, 10 CPUs, 64 GiB RAM; measured on 2026-09-27. Explicit GC was not enabled and the harness runs rows sequentially. Per-row samples are timing observations, not independent process replicates. The JSON reports keep summary distributions and counts, while Vitest omits raw sample arrays. No allocation count, statistical significance, absolute speed guarantee or invented pass threshold is claimed.

## Retained preliminary measurements

`merge-restructure-benchmark-loading-mismatch.json` records the first attempt. It loaded the old code through direct TypeScript compilation but the candidate through Vitest's transformed import, producing -38.0% default and -30.2% option throughput. The unchanged option implementation also differed substantially, exposing the loading-path confound. That attempt is preserved and excluded from causal performance interpretation.

After equalizing loading paths and before the array-policy hoist, all three measured runs were retained:

| Run / artifact | Default throughput change | Replace-options throughput change |
| --- | --- | --- |
| `merge-restructure-benchmark.json` | -14.71% | -0.47% |
| `merge-restructure-benchmark-2.json` | -4.47% | -5.10% |
| `merge-restructure-benchmark-3.json` | +5.40% | -3.23% |

These are the earlier candidate, not the final once-per-call array-policy implementation.

## Final observations

Positive throughput change means more calls per second. Median and p99 are microseconds, shown before → after. All `merge-restructure-final-{1,2,3,4}.json` reports are preserved; the first three still name the old benchmark location because relocation occurred afterward.

| Run | Policy | Before ops/s | After ops/s | Change | Median µs | p99 µs | Samples before / after |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | default | 787322 | 794982 | +0.97% | 1.209 → 1.209 | 1.625 → 1.458 | 787322 / 794982 |
| 1 | replace | 1008419 | 1012571 | +0.41% | 0.959 → 0.959 | 1.125 → 1.125 | 1008419 / 1012572 |
| 1 | index | 548221 | 522970 | -4.61% | 1.750 → 1.792 | 2.041 → 2.125 | 548222 / 522971 |
| 2 | default | 783951 | 720096 | -8.15% | 1.250 → 1.291 | 1.584 → 1.750 | 783952 / 720096 |
| 2 | replace | 810116 | 968860 | +19.60% | 1.042 → 1.000 | 3.000 → 1.208 | 810117 / 968861 |
| 2 | index | 518302 | 532798 | +2.80% | 1.875 → 1.792 | 2.375 → 2.209 | 518303 / 532798 |
| 3 | default | 471433 | 772628 | +63.89% | 1.250 → 1.250 | 3.750 → 1.708 | 471433 / 772629 |
| 3 | replace | 983562 | 997581 | +1.43% | 0.959 → 0.959 | 1.333 → 1.125 | 983563 / 997581 |
| 3 | index | 542288 | 553269 | +2.02% | 1.750 → 1.750 | 2.167 → 2.042 | 542288 / 553270 |
| 4 | default | 737915 | 713000 | -3.38% | 1.250 → 1.292 | 3.458 → 1.709 | 737916 / 713001 |
| 4 | replace | 877914 | 986128 | +12.33% | 1.084 → 1.000 | 1.292 → 1.166 | 877914 / 986128 |
| 4 | index | 500583 | 553539 | +10.58% | 1.917 → 1.750 | 2.250 → 2.041 | 500583 / 553540 |

Some rows became slower: default runs 2 and 4, and index run 1. The default run 3 throughput outlier occurs with the same median before and after; average/tail behavior and run-to-run variation are substantial. These observations do not establish consistent acceleration or consistent regression. They do establish the measured distributions for this fixture. The structural property—one public policy decision, internal self-recursion, one arrayStrategy read—is verified directly by source inspection and the getter regression.

## Remaining scope and risks

This covers the merge correction only; blueprint stays preserved and paused. No public helper, dependency installation or generated bundle staging was added. Performance is fixture-specific; slower observations remain visible. PR-wide filid/seiri gates remain the coordinator's seam and were not rerun here.
