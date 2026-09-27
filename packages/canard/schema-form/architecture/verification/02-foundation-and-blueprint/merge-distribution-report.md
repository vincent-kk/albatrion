# Native distribution merge comparison

## Scope and correction

This is the public-package performance comparison. It loads the actual built `@winglet/common-utils/object` ESM and CJS entry points using native Node import and require, without Vitest/Vite or a source transpilation loader touching the measured modules.

The earlier source-CJS experiment is retained in [merge-default-investigation.md](./merge-default-investigation.md) as diagnostic history only. Rolldown resolves filter barrel imports to direct leaf imports in the real distribution, so the source-CJS getter regression and its local-alias workaround did not establish a deployment-performance problem or fix. DETAIL correction `af900d5f` preceded removal of all three aliases. Named self-recursion remains; the public wrapper and once-per-call array-policy decision remain unchanged. Both package versions are 0.15.0.

## Build identity

- Baseline source: detached worktree at `85fa44d49d2f4491b0d4e3f1024c5c80fbb0a558`, the pre-options release branch.
- Baseline worktree: `/tmp/albatrion-merge-distribution-20260927/baseline`.
- Candidate: current workspace source after alias removal, with both recursion implementations using local named self-calls.
- Both runtime builds use the same installed Node executable and `node_modules/rolldown/bin/cli.mjs -c`, run from each common-utils package directory. No dependency install, node_modules symlink, package version change or lockfile change is involved.
- The package Rolldown config, shared build factory/utilities and manifest export paths have no change against the baseline. Each build resolves its own source tree and tsconfig aliases.
- These are **runtime-only build commands**, the runtime-output step of the designated package build. They do not claim a baseline full-package type/declaration/assets gate. Full candidate package gates are reported separately.

Runtime build logs: `merge-distribution-baseline-runtime-build.log` and `merge-distribution-candidate-runtime-build.log`.

Both complete runtime artifact trees and manifests were copied under `/tmp/albatrion-merge-distribution-20260927/artifacts/{baseline,candidate}` and made read-only. Every measurement process records SHA-256 for the manifest and all distribution files, and verifies unchanged hashes after measurement. The public manifest exports resolve to `dist/utils/object/index.mjs` and `dist/utils/object/index.cjs` in each snapshot. Build artifacts are not committed.

## Predeclared method

The package script `bench:merge-distribution` invokes a standalone native Node .mjs harness. It uses the already installed tinybench 2.9.0 without adding dependencies. Node/V8, OS/CPU, memory, Rolldown/tinybench versions, artifact entry paths and hashes are recorded in every raw JSON.

The same four fixtures are used: 2 flat keys, 32 flat keys, nested settings with arrays, and a 200-element array. Every timing sample performs 128 merge calls, each with a fresh mutable target. A returned scalar is consumed on every call and accumulated into a checked sink. Both native implementations must produce the same output before a pair is measured, and source immutability is checked. Target construction and result consumption are included equally in both arms.

Each row requests 500 ms warmup, 1,000 ms measurement and at least 100 observations. Eight fresh processes execute AB, BA, BA, AB twice; each process measures both ESM and CJS, with format order alternating and fixture order controlled by a recorded seed. No run is discarded or selected for a favorable result. Per-row timing summary statistics and observation counts are retained; individual callback timing arrays are omitted, as in the earlier Vitest output. The independent inference unit is the process pair.

For each of the eight format/fixture combinations, the summary computes the geometric mean candidate/baseline throughput ratio and a two-sided 95% t interval over eight process-paired log ratios (7 degrees of freedom). A lower bound below 1 remains inconclusive under the predeclared non-regression criterion. It is not converted to owner acceptance of a slowdown.

Run N = 0 through 7 from the repository root, using a new output path:

```sh
yarn workspace @winglet/common-utils bench:merge-distribution /tmp/albatrion-merge-distribution-20260927/artifacts/baseline /tmp/albatrion-merge-distribution-20260927/artifacts/candidate N /absolute/new/merge-distribution-N.json
node packages/canard/schema-form/architecture/verification/02-foundation-and-blueprint/summarize-merge-distribution.mjs > packages/canard/schema-form/architecture/verification/02-foundation-and-blueprint/merge-distribution-statistics.json
```

The runner refuses to overwrite an existing output, writes each completed pair immediately, and marks a process complete only after result-consumption and artifact-immutability checks. An incomplete process remains visible rather than silently disappearing.

## Status

The fixed eight-process series is complete. All eight processes completed every pair, passed checksum/output equivalence checks, and retained identical artifact hashes. No samples or runs were discarded. The source-CJS measurements are diagnostic only and are not substituted for these results.

## Native distribution results

Throughput ratios compare the current public wrapper with the pre-options release baseline. Intervals are two-sided 95% Student-t intervals over eight process-paired log ratios (7 degrees of freedom); the displayed change is the geometric mean ratio minus one. Raw per-process distributions, order, checksums, and hashes remain in `merge-distribution-{0..7}.json`; `merge-distribution-statistics.json` contains the unrounded statistics.

| Format | Fixture | Throughput change | Ratio 95% CI | Statistical criterion |
| --- | --- | ---: | --- | --- |
| ESM | small-2-keys | +1.0403% | [0.99548435, 1.02554476] | Inconclusive |
| ESM | medium-32-keys | +2.9597% | [1.00991339, 1.04966431] | Lower bound above 1 |
| ESM | nested-settings-arrays | +1.0320% | [0.98078726, 1.04074293] | Inconclusive |
| ESM | array-200-elements | +0.1243% | [0.99711491, 1.00538758] | Inconclusive |
| CJS | small-2-keys | +1.9587% | [1.00287251, 1.03658086] | Lower bound above 1 |
| CJS | medium-32-keys | +3.9559% | [1.00622046, 1.07400111] | Lower bound above 1 |
| CJS | nested-settings-arrays | +0.8102% | [1.00111144, 1.01514078] | Lower bound above 1 |
| CJS | array-200-elements | -0.0112% | [0.99563116, 1.00416300] | Inconclusive |

Seven point estimates improved; the CJS array point estimate decreased by 0.0112%. Four intervals cross 1, so these observations do not statistically establish non-regression for all rows. The fixed series was not extended to obtain a favorable interval.

### Owner acceptance

On 2026-09-27, the owner accepted the CJS array -0.0112% point estimate and the four inconclusive intervals: **“측정 불확실성으로 수용”**. The performance gate is **owner-accepted** on that basis. This acceptance is not a statistical proof of non-regression.

## Final alias-free package gates

The following designated commands were run after the local filter aliases were removed. Package version remains `0.15.0`; no dependency was installed or changed for this measurement.

| Command | Result | Evidence |
| --- | --- | --- |
| `yarn workspace @winglet/common-utils test --run` | Exit 0; 145 files, 1166 tests passed | `merge-distribution-package-test.log` |
| `yarn workspace @winglet/common-utils lint` | Exit 0 | `merge-distribution-package-lint.log` |
| `yarn workspace @winglet/common-utils typecheck --strict` | Exit 0 | `merge-distribution-package-strict.log` |
| Explicit ESLint of the native `.mjs` harness and helpers | Exit 0; no ignored-file warnings | `merge-distribution-harness-lint.log` |
| `yarn workspace @winglet/common-utils build` | Exit 0; full runtime, declarations, and agent assets build | `merge-distribution-package-build.log` |

The final designated full build reproduced all 382 measured candidate `.mjs`/`.cjs` runtime files byte-for-byte (SHA-256), and no benchmark or snapshot-loader files appeared in `dist`. Baseline preparation used only the runtime Rolldown build; it is not represented as a baseline full package build. Generated build outputs are excluded from commits.
