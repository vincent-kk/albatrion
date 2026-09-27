# Default merge performance investigation

**Scope correction:** all measurements in this document are source-transpiled CommonJS diagnostics, not distribution-performance evidence. Actual Rolldown ESM/CJS output resolves the filter barrel to direct leaf imports and does not contain the repeated barrel getter represented by this diagnostic loader. Following DETAIL correction `af900d5f`, the three local aliases were removed from production source; named self-recursion remains. The raw diagnostic data and payload copies in `source-cjs-diagnostic/` are retained. The public-package ESM/CJS comparison is recorded separately; the criteria below do not certify deployed performance.

## Read-only findings before remeasurement

The optionless baseline is the release branch before options were added: `origin/1.0.0-beta` resolved to `85fa44d49d2f4491b0d4e3f1024c5c80fbb0a558`. The earlier report used `f7eef9ed9`, an intermediate implementation that already checks options at each recursive call. Its rebased equivalent is `b4083009a207ce028c315c2e77de8353a189663e`, which the new benchmark pins for PR reproducibility. That intermediate revision is useful diagnostically but is not the minimum-performance baseline.

After normalizing the recursive function name and whitespace, the default loop body is identical in the release baseline and current mergeDefault. Both retain the same reserved-key guard, key iteration, source/target reads, array handling and plain-object handling. isArray and isPlainObject source files have no diff against the release baseline.

Source equality of the recursive body does not establish JIT equality. Under the existing TypeScript-to-CommonJS loader:

- The candidate has a public wrapper followed by a separate mergeDefault function. The wrapper has three formal parameters; default recursion has two, as does the release baseline.
- Recursive calls use their own module export binding in both versions. Candidate default recursion lives in its own module; the wrapper accesses that module's export.
- The release baseline imports filter functions through two concrete import objects; the candidate uses one filter-entry import object. The actual imported function identities are shared and unchanged, but the property access sites differ.
- The intermediate f7 implementation has three parameters and an options check inside recursion. Comparing only against it can hide costs relative to the actual pre-options baseline.

The previous final run 4 reports -3.376% throughput, with median 1.250 → 1.292 microseconds and mean 1.355 → 1.403 microseconds. Both central tendency and tails can matter: this is not explained away solely by the slower maximum sample. Run 3's +63.89% throughput, by contrast, has equal medians and a baseline mean of 2.121 microseconds. The four prior rows cannot establish non-regression, and their per-row sample counts are not independent process replicates.

The prior harness correctly equalized source compilation, reused fixture data and allocated fresh mutable targets. Its remaining limits are fixed before-then-after order, one shape, per-call timing near a microsecond, no result consumption, short warmup and no process-level confidence interval. The preserved prior evidence is not overwritten or retroactively labeled passed.

## Prepared comparison

The new owner-local `merge-default-performance.bench.ts` keeps the real baseline and candidate module boundaries and compiler format. No production body or import is rewritten for measurement. A strict local snapshot loader reads each implementation's complete own dependency graph and compiles every module with installed TypeScript to CommonJS. In particular, candidate filter barrel re-export getters are retained; they are not replaced by a synthetic plain object containing function values. Only listed .ts/.tsx/.js files under the package src boundary, relative imports and the package's own source alias are permitted. External packages, builtins, path escapes and workspace symlink escapes are rejected. Nothing is fetched or installed. Sources are hashed as they are loaded.

Primary pair: release baseline public merge versus actual workspace public merge. Diagnostic rows: f7 intermediate public merge and the exact same mergeDefault function instance called by the candidate wrapper. The diagnostics do not replace the primary comparison.

Four fixed shapes cover two flat keys, 32 flat keys, nested settings with arrays, and a 200-element array. Each timed callback performs 128 calls, with a fresh target for every call. It consumes a scalar from each returned result and writes a checked result sink once per batch. Setup, module compilation and output-equivalence checks remain outside timing. Measurements therefore include equal target-factory and scalar-consumer costs, rather than claiming allocation-free merge-only latency.

There are eight predeclared fresh-process repetitions. Even and odd repetitions alternate before/after order; a recorded deterministic seed permutes fixture order. Each row requests at least 500 ms warmup, 1,000 ms measurement and 100 samples. Primary pairs run before the diagnostic block. This is an order-control experiment, not a selection of the most favorable run.

Run command, once the coordinator grants an exclusive CPU window (N = 0 through 7):

```sh
MERGE_BENCH_REPETITION=N yarn workspace @winglet/common-utils bench merge-default-performance.bench.ts --outputJson ../../canard/schema-form/architecture/verification/02-foundation-and-blueprint/merge-default-paired-N.json
```

Each process log records the pinned sources, repetition, seed, batch size, fixture order and sink. Record Node/Vitest/TypeScript versions, CPU/OS and source hashes beside the completed run series. Preserve every process result, including failures or interruptions. Do not rerun until green or remove slow measurements.

## Interpretation planned before execution

- Convert batch throughput to calls per second by multiplying by 128; divide batch latency by 128 for normalized per-call latency.
- Compute each fixture's candidate/baseline throughput ratio within each process, then the mean, variance and two-sided 95% t interval of the eight log ratios. Exponentiation gives the geometric mean ratio and its interval. The independent unit is the process pair, not the individual batch.
- Report all fixture rows and diagnostics. A confidence interval spanning 1 is inconclusive and is not owner acceptance of a slowdown. A lower bound at least 1 supports the requested non-regression under this environment and corpus; it does not establish a universal speed guarantee.
- If the public candidate is slower while direct recursion is competitive, inspect wrapper inlining separately. If both are slower, inspect recursive binding/import access and shape feedback. A separate JIT trace may diagnose optimization/deoptimization, but must not contaminate timed measurements.
- Any production tuning requires the coordinator's design decision first. The wrapper-only dispatch, two independent recursive implementations, once-per-call replaceArrays decision and package version 0.15.0 remain fixed requirements.

## Completed measurements

The original candidate completed all eight process repetitions, followed by two predeclared one-process diagnostic variants and eight final repetitions. Source hashes are identical within each eight-process series. No run was discarded or repeated to obtain a favorable number. Result consumption and fixture equivalence checks passed in every process. The exclusive CPU window ended after final repetition 7.

The measured environment resolved to Node v24.20.0, V8 13.6.233.17-node.53, TypeScript 5.9.2 and Vitest 3.2.6 on Darwin 25.6.0 arm64 / Apple M1 Max / 10 CPUs / 64 GiB. The workspace Yarn Node resolution was checked directly after the series. This differs from the older report's Node v26.10.0 environment; do not compare absolute throughput across those separate investigations. Every new primary pair uses the same environment and compiler within its process.

The following ratios are candidate public-wrapper throughput divided by the pre-options release baseline. Positive percentages mean faster. Each interval is the predeclared 95% process-paired interval, not an interval over individual callback samples.

| Fixture | Original candidate ratio [95% CI] | Final ratio [95% CI] | Final change | Predeclared non-regression criterion |
| --- | --- | --- | --- | --- |
| 2 flat keys | 0.62336 [0.60588, 0.64134] | 1.01343 [1.00120, 1.02581] | +1.34% | Supported |
| 32 flat keys | 0.61571 [0.59651, 0.63552] | 1.01231 [1.00242, 1.02229] | +1.23% | Supported |
| Nested settings and arrays | 0.73121 [0.70931, 0.75378] | 1.01541 [0.99563, 1.03558] | +1.54% | Inconclusive; lower bound below 1 |
| 200-element array | 0.59656 [0.58689, 0.60639] | 1.01061 [0.99370, 1.02781] | +1.06% | Inconclusive; lower bound below 1 |

All four final point estimates exceed baseline, but the nested and array intervals still cross 1. The investigation therefore does **not** claim that the full four-fixture non-regression gate has passed, and does not reinterpret uncertainty as owner acceptance of slower behavior.

### Cause isolation and resulting source

The untouched candidate's actual CJS dependency graph reproduces a clear regression, also present when calling its recursion directly. Merely retaining the immutable filter entry-point function values once at module initialization restores the one-process diagnostic ratios to 1.02548 / 1.01583 / 1.01663 / 1.02656 (small / medium / nested / array). This supports repeated barrel getter access as the dominant regression mechanism. The original synthetic function-injection loader could not represent that cost.

Changing both recursions to named function declarations then produces 1.01259 / 1.01588 / 0.99100 / 1.00343 in its separate one-process diagnostic. This short diagnostic does not demonstrate an additional speed benefit from named recursion. The final form follows the root-approved structural contract: each recursion calls its own local function name, filter entry-point imports remain intact, and the public wrapper still decides options and replaceArrays only once. No loop or merge behavior was otherwise changed. DETAIL approval preceded both changes in commit `3bbc5015`.

After the final series, one purpose-only JSDoc line was added to the retained isPlainObject binding at the coordinator's request. Removing exactly that line reproduces the measured SHA-256, confirming there was no other post-measurement source change. This changes the source text hash but not executed code; no benchmark was rerun for that comment. A CommonJS emit inspection confirms one filter export read per retained function at initialization and zero recursive exports-binding calls in either implementation. Package version remains 0.15.0.

### Reproduction and artifacts

```sh
node packages/canard/schema-form/architecture/verification/02-foundation-and-blueprint/summarize-merge-default.mjs > packages/canard/schema-form/architecture/verification/02-foundation-and-blueprint/merge-default-statistics.json
```

- `merge-default-paired-{0..7}.json` and matching logs: original candidate, strict snapshot loader.
- `merge-default-getter-diagnostic.json` and log: filter binding alone.
- `merge-default-named-diagnostic.json` and log: filter binding plus named recursion.
- `merge-default-final-{0..7}.json` and matching logs: final source, unchanged within the series.
- `merge-default-statistics.json`: all per-process ratios, source-graph provenance, log-ratio variance, confidence intervals, diagnostic ratios and environment.
- `summarize-merge-default.mjs`: deterministic summary calculation with fixed sample count and t critical value; fails on missing consumption, changed graph hashes or incomplete data.

The older benchmark's pinned intermediate commit was updated to its reachable rebased equivalent; its historical JSON reports remain unchanged. The old synthetic loader stays with its original benchmark and is not the loader for this investigation.

## Package checks

The existing merge suites pass unchanged: 2 files, 23 cases (`merge-default-regression.log`). After the final series, all designated package checks passed:

| Command | Exit | Evidence |
| --- | --- | --- |
| `yarn workspace @winglet/common-utils test --run` | 0 | `merge-default-package-test.log` — 145 files, 1,166 cases |
| `yarn workspace @winglet/common-utils lint` | 0 | `merge-default-package-lint.log` |
| `yarn workspace @winglet/common-utils typecheck --strict` | 0 | `merge-default-package-strict.log` |
| `yarn workspace @winglet/common-utils build` | 0 | `merge-default-package-build.log` — CJS/ESM, declarations, asset hashes and package typecheck |

Generated build assets are excluded from source commits. No additional performance tuning or measurement was performed after the coordinator accepted this completed investigation for owner review. The nested/array confidence limits remain explicitly unresolved.
