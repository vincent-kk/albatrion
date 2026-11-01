# B9-0 tool commits — review verdict

Reviewed range: `4d0fa4a12..33bc6d64f` on `fix/schema-form-b9-0-measurement` (worktree head `33bc6d64f`; untracked: `raw/b9-0/`, a modified `b2-p2-results.md`). Static review only: no build, test, typecheck or lint was run because a measurement window is active. Evidence is git output, file reads, and the untracked `raw/b9-0/inputs.json`, `untimed-load-check.json` and `static-preparation.json` that the worker's own preparation already produced. Paths below are relative to `packages/canard/schema-form/architecture/verification/branch-switch/` unless they start with `src/` or `node_modules/`.

**Verdict: PASS WITH CONDITIONS — P1 0 / P2 3 / P3 4.** No product, manifest or build-config file changes, and the comparative bundle identity is enforced. The legacy yield is outside the timed region and correct for the real guard. The window device matches the 461 rules. The conditions are as follows. P2-1 is a regression: the device move breaks the committed B11 window tool. P2-2 is a gap: timer overhead is neither excluded nor recorded for the pass that carries the new sub-timers. P2-3 is a gap: the row-versus-stage split has no defined computation, and the README's framing does not add up to the 24 µs. P2-2 and P2-3 are summarizer-only fixes. They can land after the window and must land before `b9-0-results.md` is written. P2-1 must land before merge.

## P1

None.

## P2

### P2-1 (confirmed) — the window-device move breaks `tools/b11/window.mjs`

- `tools/b11/window.mjs:10-11` imports `../b8/helpers/sampleProcessCpu.mjs` and `../b8/helpers/waitForQuietProcess.mjs`. `tools/b11/window.mjs:74` preloads `../b8/quietWorkerPreload.mjs`. All three files were renamed to `tools/window/` in `f222cb931`. `git ls-tree 33bc6d64f` confirms that none of them remain under `tools/b8/`.
- B11 (`4d0fa4a12`, #487) added this tool before the B9-0 rebase, and the move only updated the B8 consumers (`tools/b8/window.mjs`, `tools/b8/mountLedger.mjs`).
- Failure scenario: any re-run of the B11 window fails at ESM link time with `ERR_MODULE_NOT_FOUND`, before any check runs. This also contradicts rule 2 of the 461 schedule, under which every window uses the one shared device.

Fix spec:
1. In `tools/b11/window.mjs` line 10, replace `'../b8/helpers/sampleProcessCpu.mjs'` with `'../window/helpers/sampleProcessCpu.mjs'`.
2. In the same file, line 11, replace `'../b8/helpers/waitForQuietProcess.mjs'` with `'../window/helpers/waitForQuietProcess.mjs'`.
3. In the same file, line 74, replace `'../b8/quietWorkerPreload.mjs'` with `'../window/quietWorkerPreload.mjs'`.
4. Commit as `test(schema-form): point the B11 window at the shared pre-check device`.

Verify:
- `git grep -n -E "b8/(helpers/(waitForQuietProcess|sampleProcessCpu)|quietWorkerPreload)" -- packages/canard/schema-form ':!*.json'` prints nothing.
- After the window, from the repository root, `node --input-type=module -e "await import('./packages/canard/schema-form/architecture/verification/branch-switch/tools/b11/window.mjs')"` must fail with the AssertionError "Only root may authorize the single formal window". That error proves the imports linked. Before the fix the same command fails with `ERR_MODULE_NOT_FOUND`.

### P2-2 (confirmed gap, plausible impact) — sub-timer overhead is neither excluded nor recorded in the supplemental and gap passes

- What is fine: self time never double counts. `createRecorder` partitions elapsed time, `worker.mjs:130-142` adds `everythingElse`, and `summarize.mjs:97-107` checks per-sample conservation. Scoped metrics are deltas of the same self values (`worker.mjs:44-54`).
- What is missing: the ledger pass records a paired overhead (`summarize.mjs:145-157`). The supplemental and gap passes record only separate `totals` for their lane and for `unwrapped`. No pass records a per-timer cost.
- The supplemental and gap passes also use `createScopedRecorder` (`worker.mjs:22-63`). Its `enter` scans the whole stack with `baseStageNames.includes` (about 80 names per frame) after `token.start` is taken, so that cost lands in the new sub-timer's self. Its `exit` bookkeeping lands in the parent's self.
- Failure scenario: `sameValue` recurses once per key and element (`src/core/engine/utils/compute/sameValue.ts`), and every recursion level is now a timed call. For about 15 to 20 calls per write at a few tenths of a microsecond per enter and exit pair, the overhead can reach several microseconds. That is the same order as the expected gains in `design-iii.md` (H3 −2 to −5 µs on oneOf-80, H6 −3 to −8 µs). A "confirms H3" or "confirms H6" verdict could then rest on instrumentation cost.

Fix spec (`tools/b9-0/summarize.mjs` only, so it works on the window's existing raw data):
1. Inside the `for (const pass of ['ledger', 'supplemental', 'gap'])` loop, after `byPass[pass]` is assigned, set `const timed = pass === 'ledger' ? 'wrapped' : pass;`.
2. Compute per-process arrays:
   - `overheadUs[i] = median(records[i].samples[timed]) - median(records[i].samples.unwrapped)`.
   - `pairsPerWrite[i] = median(records[i].stages.map((sample) => Object.entries(sample).filter(([name]) => name !== 'everythingElse').reduce((sum, [, metric]) => sum + metric.calls, 0)))`.
   - `perPairUs[i] = overheadUs[i] / pairsPerWrite[i]`.
3. Store `byPass[pass].timerCost = { overheadUs: stats(overheadUs), pairsPerWrite: stats(pairsPerWrite), perPairUs: stats(perPairUs), note: 'average enter/exit cost from the paired same-process unwrapped lane; deeper stacks cost more under the scoped recorder' }`.
4. For every entry in `byPass[pass].stages` and `byPass[pass].scoped` except `everythingElse`, add `overheadEstimateUs = entry.calls.medianUs * byPass[pass].timerCost.perPairUs.medianUs` and `selfNetUs = entry.self.medianUs - overheadEstimateUs`.
5. In `tools/b9-0/README.md`, replace the sentence "결과의 절대 시간에는 계측 오버헤드가 포함됩니다" with a sentence stating that `timerCost` records the paired overhead and the per-pair estimate, and that the H verdicts use `selfNetUs`.
6. The results document reports `selfUs`, `calls`, `overheadEstimateUs` and `selfNetUs` side by side for every computeNode and finalizeExits sub-timer. It bases the H3, H5 and H6 verdicts on `selfNetUs`.

Verify: every row in `raw/b9-0/stages.json` has `timerCost.perPairUs.medianUs` finite and greater than 0 for all three passes, and every non-`everythingElse` stage and scoped entry has `selfNetUs`.

### P2-3 (confirmed gap, plausible misattribution) — the row-versus-stage 24 µs split has no defined computation

- `summarize.mjs` emits ingredients only: the ledger `totals` for dist, unwrapped, wrapped and legacy, `overhead.distMinusUnwrapped`, `overhead.wrappedMinusUnwrapped`, and the gap stats `beforeSettlementUs`, `deliveryUs` and `subscriberWaveUs` (`summarize.mjs:123-131, 145-157`). It computes no gap and no residual. `README.md:33` says the part not explained by delivery, entry and timer overhead is reported as a residual, but gives no formula.
- The 24 µs is B5's row minus B5's stage wrapped total, measured in two harnesses: `b5-results.md:134` gives 106.729 and `b5-results.md:189` gives 82.709 / 72.541. Write entry (`setValue` up to `writeFieldNode`) and delivery (`runDeliveryWaves`, called synchronously from `exitFieldNodeChain`) run inside both totals. They therefore cannot be components of row minus wrapped total.
- Timer overhead has the opposite sign: wrapped is above unwrapped by about 10 µs in B5. Inside one B9-0 process, row minus wrapped equals (dist − unwrapped) − (wrapped − unwrapped) by construction. Entry and delivery only decompose `everythingElse`, the part of the row outside the named ledger stages.
- `subscriberWaveUs` is also not a subset of `deliveryUs`, because `flushQueuedEvents.ts:104` calls `deliverWave` outside `runDeliveryWaves`.
- Failure scenario: a results author sums entry, delivery and overhead into "the 24 µs" and reports the remainder as the residual. That attribution would be wrong in both sign and scope.

Fix spec (`tools/b9-0/summarize.mjs` and `tools/b9-0/README.md`):
1. After `summary.slopes.perLeaf`, add `summary.rowStageGap = {}`. For each `row`, with `L = summary.rows[row.id].ledger`, `G = summary.rows[row.id].gap` and `R` = that row's ledger records, compute:
   - `pairedGapUs = stats(R.map((r) => median(r.samples.dist) - median(r.samples.wrapped)))`.
   - `buildDifferenceUs = L.overhead.distMinusUnwrapped.medianUs`.
   - `timerOverheadUs = L.overhead.wrappedMinusUnwrapped.medianUs`.
   - `inWindowResidualUs = pairedGapUs.medianUs - (buildDifferenceUs - timerOverheadUs)`.
   - `outsideNamedStages = { everythingElseUs: G.stages.everythingElse.self.medianUs, beforeSettlementUs: G.gap.beforeSettlementUs.medianUs, writeFieldNodeSelfUs: G.stages.writeFieldNode?.self.medianUs ?? 0, deliveryInclusiveUs: G.gap.deliveryUs.medianUs, chainExitUntimedUs: G.stages.everythingElse.self.medianUs - G.gap.beforeSettlementUs.medianUs }`.
   - Store `{ rowUs: L.totals.dist.medianUs, stageWrappedUs: L.totals.wrapped.medianUs, pairedGapUs, buildDifferenceUs, timerOverheadUs, inWindowResidualUs, outsideNamedStages }`.
2. In `README.md` §gap, state the identity "row − wrapped = (dist − unwrapped) − (wrapped − unwrapped) + residual". State that entry, `writeFieldNode` self, delivery and the chain exit sit inside both totals, so they split `everythingElse` and not the gap. State that `deliverWave` also runs from `flushQueuedEvents`, so `subscriberWaveUs` is not nested in `deliveryUs`.
3. The results document reports, for `switch-siblings-0`: the B5 gap (106.729 − 82.709, cited from `b5-results.md`), this window's `pairedGapUs`, and their difference as the unattributed cross-harness and cross-window part.

Verify: `raw/b9-0/stages.json` has `rowStageGap` for all six rows, and every number in it is finite.

## P3

- **P3-1 (plausible).** The ledger pass keeps the B6 bundle bytes but not the B4-2 stage harness behind B5's wrapped numbers. `tools/b4-2/stages.mjs:79-90` alternates wrapped and unwrapped with no event-loop turn. B9-0 rotates four lanes, keeps the 0.16.1 engine resident, and yields `setTimeout(0)` before each sample (`worker.mjs:115-121`). The timed code path is identical. Inter-sample state is not: garbage-collection timing and drained microtasks differ. Fix: in `b9-0-results.md`, compute every slope, split and overhead from this window only. Label any comparison with a B5 stage figure as cross-harness. Add one sentence on the harness difference to the README's "B11 뒤 재개" section.
- **P3-2 (confirmed).** `staticPreparation.mjs:55-59` asserts the expected H1 outcome before line 60 writes `static-preparation.json`. A contradicting observation would therefore leave no evidence file. Fix: move line 60, `json(path.join(root, 'static-preparation.json'), { timed: false, records });`, above line 55. Today's run passed, so no data was lost.
- **P3-3 (plausible).** The scoped owner is the nearest B6 supplemental stage (`worker.mjs:32-34`), not the nearest ledger stage. For example, `createExitSlotOverlay` and `markSlotChange` under `retainExitedSlot` are keyed `retainExitedSlot/*`. Reconciling with the ledger figures that `design-iii.md` asks about (computeNode 33.4 µs, finalizeExits about 13.6 µs) therefore needs one more level. Fix (summarizer): per sample, compute `ledgerEquivalent[owner] = stages[owner].selfUs + Σ scoped[owner/X].selfUs + Σ (scoped[owner/X].inclusiveUs − scoped[owner/X].selfUs)` for owners `computeNode` and `finalizeExits`. The last sum runs only over X in B6 `stageNames` that are not in `ledgerNames`. Take the median per process, then `stats()`, and report it next to the ledger self. The difference between the two is the overhead.
- **P3-4 (plausible).** `portable()` (`summarize.mjs:220-232`) masks `{home}/…` and `{scratch}/…`, but not `{tmp}/…` or `{tmp}/…`. Those can appear in the `ps` `comm` column inside `cpu-prechecks`, `quiet-window.json` and `window-end.json`. Fix: add `.replace(/\/(?:private\/)?var\/folders\/[^\n]+/g, '<local-process-path>')` after the `{scratch}/` replacement. Verify: `zgrep -c -E "/(private/)?var/folders/" raw/b9-0/cpu-prechecks.json.gz` prints 0.

## Checked and clean

1. **Scope (lead item 1).** `git diff --stat 4d0fa4a12..33bc6d64f` touches only `architecture/verification/branch-switch/tools/{b8,b9-0,window}/**`: 25 files, 1564 insertions and 5 deletions. It changes nothing under `src/`, no `package.json`, no lockfile, no vite config and no tsconfig. `prepare.mjs:22-26` re-asserts that `src/` is clean against the base, and `verifyBuild.mjs:13-25` asserts identical dist bytes. Note: the second build is compared with a build of HEAD, not of a base checkout. That is equivalent here only because `src/` and the build configuration are untouched.
2. **Legacy yield (lead item 2).**
   - `worker.mjs:118` awaits `yieldBeforeSample()` before `recorder.reset()` (119), `recorder.enabled` (120) and `start` (121). The commit adds only lines 12 and 118, so the timed span 121-124 is byte-identical to before. This matches `design-optimization/tools/helpers/measurePair.mjs:28`.
   - The guard is `MAX_LOOP_COUNT = 100` in `node_modules/@canard/schema-form_0.16.1/dist/index.mjs:2574-2593`, reset through `scheduleMacrotaskSafe`. That function is `setImmediate` on Node (`packages/winglet/common-utils/src/utils/scheduler/scheduleMacrotaskSafe.ts`), and a `setTimeout(0)` turn always passes the check phase.
   - Neither the guard nor the lane bundles change. The fix commit edits only manifest bookkeeping in `buildStages.mjs`, `prepare.mjs:107-110,125` pins version 0.16.1 and its sha256, and `verifyInputs` re-hashes all lane files before and after the window.
   - The smoke ran 120 yielded legacy operations on oneOf-80: `raw/b9-0/untimed-load-check.json` shows `legacy:120/2/2/2/2/2`.
   - The current product's only deferred scheduler is the validation `queueMicrotask` (`src/core/engine/validation/utils/run/requestFieldNodeValidation.ts:30`), and delivery is synchronous. The yield therefore adds no timed work to the current lanes.
3. **Comparative identity (lead item 3).**
   - `instrumentDetails.mjs:27-28` is a no-op for `wrapped`, and `ledgerNames` equals B6's (`checkTools.mjs:12`).
   - The sub-timers enter only `stageNames` (`buildStages.mjs:104`), which the supplemental build uses. `gap` adds three boundary timers to its own bundle, and `diagnostic` adds only a counter.
   - `prepare.mjs:48-61` builds B6's builder on the same source in the same run, then asserts byte identity of `wrapped.mjs` and an equal stage manifest. `raw/b9-0/inputs.json` records `comparativeBundleIdenticalToB6: true` at base `4d0fa4a12` and head `33bc6d64f`.
   - The ledger pass uses the B6 recorder `createSlotRecorder` (`worker.mjs:83-84`).
   - `buildStages.mjs:285-301` requires exactly one site for every supplemental name. It records the B11 removal of `DetachedWriteAddress.retain` as `absentSupplementalStages`.
4. **Probe rows and diagnostic (lead item 4).**
   - The rows are `switch-oneOf-80`, `switch-payload-12`, `switch-siblings-0`, `switch-siblings-1000`, `switch-oneOf-80-siblings-250` and `switch-oneOf-80-siblings-1000` (`rows.mjs`).
   - The oneOf fixture equals the B5 branch-switch fixture for zero siblings (`fixtures.mjs:53-73` against `helpers/buildBranchFixture.mjs`), and `check()` covers every `pad_i`.
   - The slopes are `general`, `prepared250`, `prepared1000`, `prepared250to1000` and `perLeaf`, each per stage, self and inclusive, for the ledger and supplemental passes (`summarize.mjs:166-219`).
   - The diagnostic fields are `staticEntries`, `gated`, `hasGatedOverlays`, `directChildSelectionPlan` (null, 'undefined', or the steps and baseline counts) and `preparedStaticHost`. They are read from the correct keys: the plan on `blueprintNode` (`getDirectChildSelectionPlan.ts:62-66`) and the prepared host on the field node (`prepareStaticHost.ts:41-43`). They are joined by `staticReuserCallbacksPerWrite` over three writes, counted at the single `return (entry) => {` in `createStaticEntryReuser.ts:61`.
   - The fixtures are siblings 3 and 1000, oneOf-80, and oneOf-80 with 1000 siblings. The existing output agrees with the H1 expectation. The siblings rows show plan null, no prepared host, and 10 and 2004 callbacks. The oneOf rows show a plan, a prepared host, and 0 callbacks.
5. **Pre-check device (lead item 6).**
   - `tools/window/helpers/waitForQuietProcess.mjs` samples 3000 ms, applies a 30 % threshold to each external PID, retries every 5000 ms, caps at 120000 ms, and excludes the explicit agent PID. `sampleProcessCpu.mjs:26` excludes the observer.
   - `window.mjs` runs it once before `formal-start.json` (31-42) and before each of the 180 processes (50-52). It records every check and refuses a rerun when `formal-start.json` exists (25-28).
   - The untimed smoke runs one process per bundle across seven bundles. It checks read permission, the plugin hash and load, and all six rows with a clock-free recorder (`checkLoad.mjs`, `smoke.mjs`, `untimedRecorder.mjs`). `window.mjs:21-24` requires it and checks it against the current `inputs.json` hash.
   - The B8 consumers point to `tools/window/`. Internal relative imports keep the same depth, and `parseCpuSample.mjs` exists.
6. **Hygiene (lead item 7).**
   - Both commit messages are subject-only `test(schema-form): …` lines with no co-author, session or attribution line. The author is "Vincent Kelvin" with the GitHub noreply address.
   - The added lines contain no `{home}/`, `{tmp}/`, `{scratch}/` or `{tmp}` path, no home-directory lookup, and no personal name.
   - The worker output fields (`worker.mjs:152-165`) carry no paths. `process-samples.json.gz` is therefore clean even without `portable()`.

## Unverified

- Nothing was executed: no checkTools, smoke, prepare or window.
- The size of the timer overhead in P2-2 is an estimate, not a measurement.
- P2-1 is a static trace. ESM link failure on a missing static import is deterministic, but it was not run.
- Whether the worker's typecheck and lint passed for the tools was not checked.
