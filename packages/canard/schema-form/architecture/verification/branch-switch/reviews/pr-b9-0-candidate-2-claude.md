# B9-0 final review — verdict

Reviewed: `fix/schema-form-b9-0-measurement`, head `55701a08d`, delta `33bc6d64f..55701a08d`, scope `4d0fa4a12..55701a08d`. Read-only: no build, test, lint or window was run. Evidence is git output, file reads, and node arithmetic on the committed raw files (`raw/b9-0/process-samples.json.gz`, `stages.json`, `cost-splits.json`, `row-gap.json`, `static-preparation.json`, `cpu-prechecks.json.gz`) and on `raw/b5/stages.json`. Paths are relative to `packages/canard/schema-form/architecture/verification/branch-switch/` unless stated.

**Verdict: PASS WITH CONDITIONS — P1 0 / P2 1 / P3 4.** All seven tool-review conditions are applied as specified. Scope and the append-only correction are clean. Every headline number the lead listed reproduces from raw. The one P2: the H1 budget and H6 verdicts compare this window's absolute microseconds with design III expectations taken from B5, while this window runs 1.3x to 5.2x slower than B5 on the same stages. Converted to B5 units, both fall below their expected lower bounds. H3 and H5 hold at any factor in that range.

## P1

None.

## P2

### P2-1 (cross-window comparison confirmed; verdict change plausible) — H1 budget and H6 "supported" compare across regimes

Evidence (same row, same stage; B5 `raw/b5/stages.json` E `metrics.<stage>.selfUs` against this window's `stages.json` `rows.<row>.ledger.stages.<stage>.self.medianUs`):

| Quantity | B5 | B9-0 | Factor |
| --- | ---: | ---: | ---: |
| oneOf-80 computeNode self | 33.355 | 109.270 | 3.28 |
| oneOf-80 finalizeExits self | 18.376 | 54.468 | 2.96 |
| siblings-0 / siblings-1000 computeNode self | 13.731 / 304.041 | 71.157 / 402.271 | 5.18 / 1.32 |
| general primeHost+selectChildren slope, µs/sibling | 1.370 | 1.691 | 1.23 |

- Wrapped totals are 3.19x (oneOf-80), 2.67x (payload-12), 5.11x (siblings-0) and 1.30x (siblings-1000) B5's.
- Inside each process the median is 1.22x to 3.29x the minimum on every lane. That includes the frozen 0.16.1 lane: 2.02x on oneOf-80 and 3.29x on siblings-0. B5's oneOf-80 wrapped process medians spanned only 169.7 to 173.8 µs. So the slowdown covers the whole harness and environment. The product head also differs (`ad0be79ba` against `4d0fa4a12`).
- The document knows this. Line 44 and the README's P3-1 sentence say B5 absolute comparisons are cross-harness. Yet the headline (`b9-0-results.md:3`), the H1 cell (`:196`, "지지(원인·예산 규모) … 1245.790µs") and the H6 cell (`:199`, "예상 범위 안") all put in-window µs next to the design III cost-model ranges. PR body line 15 repeats this.
- Converted with the same-row, same-stage factor:
  - H1 budget: 1,245.79 / 1.234 ≈ **1,009 µs**, below the 1,100 lower edge.
  - H6 (mergeEffectiveSchema + selectEffectiveDeclarations): 6.520 net × 0.3052 ≈ **1.99 µs** (raw 2.79), below the expected 3 to 8. It reaches 5.13 to 6.33 only if selectNodeSchema's own self is also removed, and the document itself declines to count that.
- Robust: H3 for siblings (12.386 in-window ≈ 9.4 in B5 units, against 200 to 300 expected) and the H5 misfit index (−0.485). Both hold at any factor from 1.3 to 5.2.
- Failure scenario: the coordinator edits design III with H6 "supported at 3 to 8 µs" and H1 "1,100 to 1,300 confirmed". B9-3 and B9-1 are then judged against promises that, in B5 units, are about 2 µs and about 1.0 ms.

Fix spec (`b9-0-results.md` and the PR body only):
1. Line 3: replace "H1의 차단 조건과 예산 규모는 지지되며," with "H1의 차단 조건은 지지되며, 예산은 이번 창 단위 1,246µs·B5 단위 환산 약 1,009µs로 예상 하한 1,100µs 경계입니다." Replace "H6의 선언 선택·병합 후보 예산은 지지됩니다." with "H6는 비용 위치만 확인되고 크기는 B5 단위 환산 약 2.0~2.8µs로 예상 3~8µs 아래라 미확정입니다."
2. After the timer-cost table (after line 62), add the four-row factor table above, headed "B5 대비 같은 행·같은 단계 배율". Add one sentence after it: "프로세스 안 중앙값은 동결 0.16.1 레인을 포함한 모든 레인에서 최소값의 1.22~3.29배이므로 창 안의 비율·방향은 쓰되 설계 Ⅲ 비용 모델의 µs와 직접 대조하지 않습니다."
3. H1 cell (line 196): replace "지지(원인·예산 규모)" with "지지(원인), 예산은 하한 경계". Append "; B5 단위 환산(일반 경로 primeHost+selectChildren 기울기 1.370/1.691) 약 1,009µs".
4. H6 cell (line 199): replace "지지(후보 예산), 절감량 미검증: 선언 선택+병합의 직접 compute scoped net 6.520µs가 예상 범위 안." with "미확정(위치 확인): 선언 선택+병합 scoped net은 이번 창 6.520µs이고, oneOf-80 computeNode 배율(33.355/109.270) 환산 시 약 1.99µs(raw 2.79µs)로 예상 3~8 아래. selectNodeSchema 자체 self까지 제거될 때만 5.1~6.3µs." Keep the last sentence of the cell.
5. Apply the same H1 and H6 wording to PR body line 15.

Verify: `grep -n "지지" b9-0-results.md` shows H1 only with "원인" and no H6 "지지". Each factor recomputes from the two `stages.json` keys named above.

## P3

- **P3-1 (confirmed). The registerPresenceChanges headline has no spread and no ledger bound.**
  - The document states 377.893 µs to three decimals. Its process medians run from 293 to 400 µs (width 106.8).
  - The supplemental sibling increment (376 µs) exceeds the whole ledger computeNode increment, which is 331.1 µs (402.271 − 71.157). The supplemental reconstruction is 442.6 µs against a ledger value of 402.3.
  - The direction holds: registerPresenceChanges is the computeNode O(S) term on the general path.
  - Fix: after line 81, add "프로세스 중앙값 폭은 293~400µs이며, 같은 창 ledger computeNode 전체의 형제 1,000 증가분이 331.1µs이므로 비교 장부 기준 상한은 약 331µs입니다."
- **P3-2 (plausible). The H3 verdict leaves out part of H3's declared scope.**
  - H3 names computeNode and updateOutput. The verdict sums only computeNode/preserveReferences and computeNode/sameValue, on the design's rows only.
  - On the prepared probe, from oneOf-80 to oneOf-80 with 1,000 siblings, the H3 targets grow. Net per 1,000 siblings: computeNode/sameValue +54.71, updateOutput/sameValue +40.69, computeNode/preserveReferences +10.44. The sum is 105.85.
  - The ledger does not corroborate this. Ledger updateOutput self falls from 22.95 to 17.21, and the ledger computeNode increment (120.6) is below the supplemental computeNode-scoped increments (about 204).
  - Fix: add to the H3 cell and to the probe section: "oneOf 호스트+형제 경로에서는 H3 대상이 형제 1,000당 net 약 106µs 증가(supplemental 전용, ledger 미확인: updateOutput self 22.95→17.21)."
- **P3-3 (confirmed). The H5 verdict covers only finalizeExits.**
  - H5's exit-key identity and its fast path for gate-less leaf registration sit in selectChildren, and this PR did not measure them.
  - The owner of the fixed part is still open: the root residual net is 19.025 µs, so question 2 of the design's open list is narrowed, not closed.
  - The finalizeExits table also leaves out two retainExitedSlot children: getRetainedChildEntry (5.645 raw / 1.722 net) and getControlLayers (2.260 / −1.663).
  - Fix: append to the H5 cell "finalizeExits 부분만 판정; 나감 키 identity·레지스트리 빠른 길은 미측정; 고정분 주인은 미확정". Add the two rows to the table at line 87.
- **P3-4 (confirmed; environment). The environment section does not record the background load.**
  - In each approving 3-second sample, the summed CPU of all sampled processes (the excluded agent included) has median 205.9 %, range 89.2 to 249.6 %.
  - Spotlight (`mds` plus about 15 `mdworker_shared`) accounts for a median of 157.0 % of that. The per-PID 30 % rule passes it by design, so this is not a rule breach.
  - It does not correlate with the within-process spread (Pearson −0.06), so it is not shown to cause the slowdown.
  - Fix: add one row to the environment table: "승인 표본의 외부 합계 CPU 중앙 205.9%(Spotlight 157.0%), 판정선 아님".

## Checked and clean

1. **Tool-review P2-1.**
   - `tools/b11/window.mjs` lines 10, 11 and 74 now point to `../window/`.
   - The spec's grep prints nothing at `55701a08d`.
2. **Tool-review P2-2.**
   - `summarize.mjs` adds `timerCost` per pass exactly as specified: the timed lane, `overheadUs`, `pairsPerWrite`, `perPairUs` and `note`.
   - It adds `overheadEstimateUs` and `selfNetUs` to every stage and scoped entry except `everythingElse`.
   - The README sentence is replaced.
   - The results tables carry self, calls, overhead and net side by side, and H3, H5 and H6 use net values.
   - `checkSummary.mjs` asserts that per-pair cost is finite and positive and that the net identity holds.
3. **Tool-review P2-3.**
   - `rowStageGap` is built per spec for all six rows.
   - The README now states the identity and the `flushQueuedEvents` note.
   - The results document reports 24.020, −15.760 and 39.780.
   - Recomputed from raw: −15.760 = 16.365 − 31.104 + (−1.021). The sign holds under other pairings: per-sample pairing gives −18.365 and process-minimum pairing gives −10.583.
4. **Tool-review P3-1 to P3-4.**
   - The README carries the harness sentence.
   - The `static-preparation.json` write now precedes the asserts.
   - `ledgerEquivalent` follows the spec: ledger-named children are excluded, non-ledger B6 children count inclusive, and new timers count self. It matches `cost-splits.json` within 0.001.
   - The `var/folders` mask is added, and the compressed CPU file contains no such path.
5. **Scope.**
   - Nothing in `4d0fa4a12..55701a08d` touches `src/`, a `package.json`, a lockfile, or a vite or ts config. Every path sits under `architecture/verification/branch-switch/`.
   - `b2-p2-results.md` gains four lines and loses none, appended after the old last line, line 93. Its content matches `static-preparation.json`.
6. **Window integrity.**
   - `tool-hashes.json` lists only `staticPreparation.mjs` (untimed) and `summarize.mjs` as changed after the window. The worker, operation, recorder and bundles are unchanged.
   - The window started at 18:25:01Z, after `33bc6d64f`.
   - All 18 `evidence-hashes.json` entries match their files.
7. **Raw reproduces the headlines.**
   - siblings-1000 registerPresenceChanges: 379.219 raw, 377.893 net.
   - Preserve + sameValue increment: 12.386 net (10.947 raw). The oneOf sum is 0.293.
   - Prepared row slopes: dist minimum 1.213, dist median 1.327, wrapped median 1.266. From 250 to 1,000: 1.285, 1.319 and 1.213.
   - Ledger stage slopes, 0 to 1,000: assembleObject 0.647, primeHost 0.344, selectChildren 0.101.
   - finalizeExits: misfit −0.485, capture 6.389, visit 2.753, retain 9.744, overlay 5.024, residual 19.025.
   - H6 net 6.520 and the H1 stage-slope difference of 1.246 µs/sibling.
8. **Protocol.**
   - 180 records cover 18 row and pass groups of 10 each, all with 20 warm-ups and 100 samples, and `completed` is true.
   - The legacy quality ratio is 1.0331, with row ratios 0.870, 1.175, 1.053, 0.980, 1.092 and 1.013.
   - No rerun; the aborted window at `699cbd733` is kept separately.
9. **Static preparation.**
   - siblings-3: 4 entries, plan null, not prepared, 10 callbacks per write.
   - siblings-1000: 1,001 entries, null, not prepared, 2,004 callbacks.
   - oneOf-80: plan of 242 steps, prepared, 0 callbacks.
   - oneOf-80 with 1,000 siblings: 1,002 entries, plan of 1,242 steps, prepared, 0 callbacks.
   - The callback count fits 2 × (S + 2).
10. **Hygiene.**
    - Commit messages are subject-only, with no co-author or session line. The author is Vincent Kelvin with the noreply address.
    - Added lines contain no `/Users/`, `/private/`, `/tmp/` or `/var/folders` path. Two hits are prose mentions of the mask.
    - The gzip files contain no paths, and the raw files contain no account name or email.
    - The PR body has no machine-local path.

## What the numbers mean for design III staging

**Keep H1.** It stays the lead of B9-1, since its cause is a timing-free fact. Its budget is about 1.0 to 1.25 ms per 1,000 siblings.

**Check B9-1's gates first.** At 1,000 siblings the prepared path still costs primeHost 352.7 µs and selectChildren 197.5 µs (best processes 316.0 and 185.4). B9-1's gates (≤ 50 and ≤ 60 µs) are therefore reachable only through H1's no-membership-Δ clause, which this PR could not exercise. Confirm that the clause applies to the siblings switch before B9-1 is gated.

**Retarget H3 and add an H8.**
- Drop sameValue and `children.every` as the siblings owner; they are worth about 9 to 12 µs.
- Add an H8 that derives presence-change names from the settlement's Δ, in place of registerPresenceChanges' two full key scans and its projection-baseline loop. In-window that is about 0.33 to 0.38 µs per sibling, or about 286 µs per 1,000 in B5 units. That is where design III's 200 to 300 µs H3 budget actually sits.
- Keep a reduced H3 only for oneOf hosts with siblings: about 106 µs per 1,000, supplemental only.

**Trim H5.** Drop the misfit index and the address device. Keep exit-key identity and the registry fast path as unmeasured, and keep the fixed-part owner as an open question.

**Demote H6.** It is about 2 µs in B5 units, so it goes to the tail of B9-3.

**Revise the combined estimate.** The combined expectation for siblings-1000 (250 to 400 µs, slope 0.2 to 0.4) is not supported. It needs H1's Δ clause, H2 (the prepared assembleObject is 0.647 µs per sibling for two calls) and H8 together.

**Fix the harness before B9-1.** Explain or fix this harness's 1.2x to 3.3x median-to-minimum spread, or restate the gates relative to the same window. Absolute gates written in B5 microseconds cannot be judged in this regime.

## Unverified

- No tool was executed: checkTools, checkSummary, ESLint, tsc, smoke and window were not run. The results document's pass claims for these are taken as written.
- The B11 import link was checked by static trace only.
- The cause of the slowdown is not established. Candidates are the `setTimeout(0)` sample yield, the background Spotlight load and the product-head difference.
- The B5-unit conversions assume uniform stretch within a row. Within oneOf-80 the stage factors range from 2.96 to 3.87, which supports that assumption only approximately.
- I did not check whether getRetainedChildEntry and getControlLayers are B6 stage names.
