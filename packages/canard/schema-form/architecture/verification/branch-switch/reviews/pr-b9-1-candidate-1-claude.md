# B9-1 independent review — verdict

Reviewed: `perf/schema-form-b9-1-siblings`, worktree `branch-switch-b9-1`, range `3104b0d9b..48f62530c` (product `81ff757a2` H1, `bd018afc2` H8, `fa4151299` H4, `b8570c9ab` style, `6e585c4d6` required fix; tools/evidence `c014a16f9`, `48f62530c`). Read-only: no build, test, typecheck, lint or window was run. Evidence is git output, source reads and node reads of the committed raw files. Source paths are relative to `packages/canard/schema-form/src/core/engine/` unless stated.

**Verdict: CONDITIONAL PASS — P1 0 / P2 3 / P3 5.** H1, H8 and H4 do what the brief asks on the siblings switch, every ceiling test fails without its change, the static gates and evidence are consistent, and no public surface moves. Conditions: (1) P2-1 fixed, or the order deviation accepted by the owner and the settle DETAIL sentence corrected; (2) P2-2 fixed, or accepted with the DETAIL cost line corrected; (3) P2-3 tests added; (4) the pending window gates pass.

## P1

None. One P1 candidate was traced and cleared: the no-membership clause does not end wheels early. In round 1 the view starts empty (`primeHost` publishes the baseline), so every admitted dynamic child sets `frame.changed` at `settle/utils/compute/childSelection/selectEntryStep.ts:386`, and `publishPreparedSelection` never clears it. Round-1 `changed` therefore matches the old "baseline vs final list" result.

## P2

### P2-1 (confirmed by trace; observable effect plausible) — H8 departure order and arrival names come from `seen`, not from the published structure

- `settle/utils/compute/childSelection/utils/publishPreparedSelection.ts:15` takes `names` from `Object.keys(Object.fromEntries(frame.seen))`, which is selection (authored) order, and stores it as `prepared.dynamicNames` at :28.
- The published structure at :24 is `Object.assign(Object.create(null), view)`. Its dynamic keys follow the view target's creation order: `createPreparedSelectionStructure` copies the previous dynamic names first, then appends arrivals.
- Scenario: dynamic `p` is authored before dynamic `q`, and `p`'s own gate reads `../q`. In round 1, `q` arrives and `p` is rejected because `q` is still absent. In round 2, `p` arrives. The published dynamic order is `[q, p]`, while `dynamicNames` is `[p, q]`. Plan-null hosts like this are newly prepared by H1.
- In the next settlement both depart in round 1. The bounded loop (`settle/utils/dependencies/collectPresenceChangeNames.ts:40`) registers `[p, q]`. The full scan it replaces (:53, formerly in registerPresenceChanges) registers `[q, p]`. The settle DETAIL H8 paragraph says the order equals the full traversal ("전체 형상 순회의 순서와 같다"), and the brief requires the same names in the same order. Registration order drives `changedLog`, the presence-clock stamps per name, and owner and dirty-path insertion order.
- Same root cause, exits: `selectChildren.ts:289` walks `priorDynamicNames` and inserts `pendingExits` as `[p, q]`. The general path these hosts used before H1 walked `Object.keys(prior)` and inserted `[q, p]`.
- Same root cause, phantom name: `selectEntryStep.ts:246` puts a name into `seen` before the recursion-budget return (:279-293), which never sets `next[name]`. That name enters `dynamicNames`, and `collectPresenceChangeNames.ts:46` registers it as an arrival that the full scan would not report. This happens only in a settlement that already recorded a budget failure.
- **Fix spec:**
  1. In `selectChildren.ts`, allocate `const dynamic: Record<string, Self> = Object.create(prepared.baseline)` on the prepared path.
  2. Pass it as a fourth argument `createPreparedSelectionStructure(prepared.baseline, current, prepared.dynamicNames, dynamic)`. The function fills `dynamic` instead of allocating its own target.
  3. Add `readonly preparedDynamic?: Record<string, Self>` to `ChildSelectionFrame` (`selectEntryStep.ts:41`) and set it in the frame literal (`selectChildren.ts:212`).
  4. In `publishPreparedSelection.ts:15`, use `const names = Object.keys(frame.preparedDynamic!)`. This is own keys only and O(K), ordered as integer keys ascending and then insertion order, which is the published dynamic order. Nothing else changes.
  - Verify: in `settle/__tests__/settle.presence-delta.test.ts`, build static `type`, dynamic `p` with `controls.active: '../q === "on"'` authored before dynamic `q` with default `"on"` gated by the branch on `./type`. Make one write enter `q` in round 1 and `p` in round 2. Assert `getHostDerived(root).preparedStaticHost.dynamicNames` equals `Object.keys(root.structure!).filter((name) => name === 'p' || name === 'q')`. It fails on the current head with `[p, q]` against `[q, p]`.

### P2-2 (plausible; not measured) — H4 required subset costs O(changed hosts × all entered nodes)

- `settle/utils/commit/utils/getRequiredChildren.ts:27` iterates the whole settlement `context.entered` set for every changed object host that reaches the entered-only branch. `settle/utils/commit/markCommitDeliveries.ts:88` calls it once per host.
- Every primed host carries the UpdateChildren bit, because `settle/utils/compute/primeHost.ts:55-58` (and the general prime) publish the baseline list through `captureFieldNodeChange`. The skip guard at `markCommitDeliveries.ts:80-84` therefore never skips these hosts.
- Scenario: an array of 1,000 initialized object items, each with its own oneOf, switched by one write (for example a caller replace that flips every item's `kind`). That gives K≈1,000 hosts and E≈1,000 entered children, so about 10^6 filter iterations. The replaced loop read Σ children, about 5,000 at 5 children per item. This applies with or without preparation, and no window row has a multi-host switch. The DETAIL cost line ("진입 수에 비례") states only the per-host factor.
- **Fix spec:**
  1. In `markCommitDeliveries.ts`, before `for (const host of context.changedNodes)`, build `const enteredByParent = new Map<Self, Self[]>()` once. Iterate `context.entered` and push each child with a non-null `parent` into its parent's list.
  2. Change `getRequiredChildren(host, entered: ReadonlySet<Self>)` to take `entered: readonly Self[]`, the host's own entering occurrences. Call it with `enteredByParent.get(host) ?? NO_ENTERED`, where `NO_ENTERED` is a module-level frozen empty array. Keep the existing filter.
  3. Also fix P3-5 here: when the list has more than one element, stable-sort it so that integer-like names come first in ascending order and the rest keep entered order. This reproduces `host.children` order.
  4. Update the settle DETAIL cost line to "O(E) once per commit plus the host's own entering children".
  - Verify: add a unit test that calls `getRequiredChildren` for two hosts sharing one map and asserts that each receives only its own children. Rerun `settle.static-commit.test.ts` and `settle.commit-visit-order.test.ts`.

### P2-3 (confirmed gap) — H8 fallbacks and the bounded-equals-full claim are untested

- `settle/__tests__/settle.presence-delta.test.ts` has one case. It asserts only `scans === 0` and the final `local`.
- No test drives a prepared host through raw null, host entered, exited, perished or revived, a witness mismatch (`previous !== witness.structure`), or a deleted preparation. No test compares the bounded names with the full scan.
- The brief asked that each fallback be reachable and tested. Each branch is reachable by code reading (`collectPresenceChangeNames.ts:29-37`), but none is asserted, and P2-1 shows the equivalence is not exact.
- **Fix spec:**
  1. In `settle.presence-delta.test.ts`, import the module namespace and wrap `collectPresenceChangeNames` with `vi.spyOn`.
  2. In the wrapper, compute the reference names with the two original for-in loops over `(previous, host.structure ?? {})`. These are the lines removed from `registerPresenceChanges.ts` at `3104b0d9b`. Then `expect(actual).toEqual(reference)`.
  3. Drive five cases: (a) the 1,000-sibling switch; (b) the p/q multi-round case from P2-1; (c) a nullable object host written to `null` and back; (d) a host exit and re-entry under a parent oneOf; (e) `delete getHostDerived(host).preparedStaticHost` between writes.
  4. Count the wrapper calls that took each fallback, using `context.presenceSelections?.get(host)` and the lifecycle sets, and assert that each count is above 0.
  - The test fails on the current head at case (b).

## P3

- **P3-1 (plausible, latent) — a preparation created inside selectChildren after a general prime snapshots the wrong child list.**
  - `settle/utils/compute/childSelection/utils/prepareStaticHost.ts:136` stores `selectedChildren: node.children`.
  - If primeHost took the general path and the `selectChildren.ts:146` call then passes the witnesses, `node.children` is the static-only list that primeHost published, while `selectedStructure` is `prior`. With unchanged membership, `publishPreparedSelection.ts:20-27` would publish that static-only list as the host's children.
  - No trigger was found. The invalidations are monotone within a settlement, registry removal happens only in `finalizeExits`, and the `mergeEffectiveSchema` memo key is the same for `[]` and the static IDs, so the witnesses are identical at prime and at select.
  - Fix: `selectedChildren: node.structure === prior ? (node.children ?? []) : Object.values(prior)`.
- **P3-2 (plausible) — the selection view can outlive selection on a throw.**
  - `selectChildren.ts:177` publishes the Proxy as `node.structure`.
  - A throw before :241 leaves the Proxy in place, whose set trap rejects baseline names. One example is the verify-mode "Static host witness mismatch" raised by a child host through `computeChild`.
  - `computeNode.ts:331` discards the record but not the view, which contradicts the `publishPreparedSelection` TSDoc ("intermediate views never escape selection").
  - Fix: on the prepared path, wrap `selectChildren.ts:177-241` in try/finally and restore `node.structure = prepared.selectedStructure` when publication did not run.
- **P3-3 (confirmed, rule) — `collectPresenceChangeNames` advances `context.presenceSelections` at :48.** Its name and TSDoc describe a read only, which conflicts with seiri function-boundaries §2 and code-comments §3 (an effect beyond the return value). Fix: add to the TSDoc that it advances the host's settlement witness to the current structure on the bounded path, or rename the function.
- **P3-4 (confirmed, process and doc) — DETAIL edits land in the same commits as their code.**
  - This applies to `81ff757a2`, `bd018afc2`, `fa4151299` and `6e585c4d6`. They are not preceding docs commits as in B12.
  - `48f62530c` replaces the engine DETAIL "Last Updated" contract-basis line (NODE-016·045, LANDING-067·084, 07c 9.1·9.2·9.6, and others) with a one-line summary, which drops the basis record. Fix: restore the basis line under the new date.
- **P3-5 (plausible) — candidate order for entering required children changes.** `getRequiredChildren` now yields `entered` order, while the old loop used `host.children` order. The two differ for integer-like names: authored `b` then `1` gives entered `[b, 1]` but children `[1, b]`. This changes the commit visit order that `settle.commit-visit-order.test.ts` characterizes. The fix is the sort described in P2-2.

## Checked and clean

1. **H1.**
   - Eligibility is unique partition, `gated`, no gated overlays and `staticEntries > 0` (`prepareStaticHost.ts:81-87`). The `if (!plan) return undefined` line is removed, and `alwaysSteps` stays empty without a plan (its only consumer is the table path).
   - The preparation holds the baseline node references, `entries` with the `staticShape` IDs, and `dynamicEntries` as an authored-order filter of `childEntries` (which equals `declareBlueprintChildren`).
   - The prepared prime walks nothing (`primeHost.ts:43-61`). Without a plan, `selectChildren` walks only `prepared.dynamicEntries` (`selectChildren.ts:207-209`). Direct-plan hosts still iterate all steps with an `entries.has` skip, which is unchanged.
   - The verify witness re-check and throw (`prepareStaticHost.ts:76-117`) and the load, distributed, pathChanges, relocated and failures invalidations (:55-65) are unchanged. Discard still happens on failures, path changes and throws (`settle/utils/settlement/finishSettlement.ts:112-113`, `computeNode.ts:331`).
   - The clause at `publishPreparedSelection.ts:16-27` reuses structure and children only when names and identities match. A re-entry clone (new identity), entered or exited entries (names differ), an array rekey (pathChanges and the path witness) and load or reset (`kind === 'load'`) all publish a fresh shape. A revived child keeps its identity and is correctly reused.
   - The Proxy invariants hold: the target is extensible, baseline descriptors are configurable, and `__proto__` is copied as an own key.
   - The test asserts callbacks 0, list comparisons 0, `Object.assign` 0, `Object.values(root.structure)` 0, the same structure and children references, and key order, in both table and verify modes.
2. **H8.**
   - Fallbacks occur when there is no witness, when `witness.structure !== previous`, when the preparation is absent or replaced, when the host was not prepared in this settlement, on raw null, and on entered, exited, perished or revived hosts (`collectPresenceChangeNames.ts:29-37`). The else branch is byte-equivalent to the removed scans.
   - Undeclared keys and extras are not structure keys. The projection-baseline loop is unchanged and costs O(captured baselines).
   - No existing test file changed in the range, and all touched suites pass in `raw/b9-1/static-unit.json.gz` and `static-verify.json.gz`.
3. **H4.**
   - Static IDs are never recorded, because preparation skips static entries.
   - `utils/controls/getStaticDeclarationIds.ts` checks the parent's blueprint, template and path and the baseline identity, then falls back. The priority order is current selection, then static, then committed (`derive/utils/evaluate/getSelectedDeclarationIds.ts:15-19`, `settle/utils/controls/getControlLayers.ts:74-79`), and `readDefault` goes through `getControlLayers`. The returned ID arrays are the same `staticShape` arrays the reuser recorded before, so references are kept.
   - `getRequiredChildren` recomputes all children on first delivery, when the witness is the current schema, or when required identity differs. Because `markCommitDeliveries.ts:359` clears `deliveryPreviousSchema` every commit, the witness basis is the previous commit, so the entered-only branch is correct.
   - `6e585c4d6` makes the one pre-fix failure pass. That failure is in `raw/b9-1/static-unit-before-required-fix.json.gz`: `settle.commit-visit-order` "visits a required-only child…" expected `['', '/b', '/a']` and got `['', '/b']`.
   - Committed-only readers (`commitExitPolicyValues`, `readDepartingAncestorPolicy`, `collectDeriveSourcePaths`, `routeValidationIssues`) still find entries. Static IDs are constants committed at the first general selection, and they are pruned only by array operations, which also invalidate preparation.
4. **Invariants.**
   - Same value keeps the same reference for structure, children and IDs.
   - The delivery corpus has 79 scenes and 429 phases with 0 differences (`raw/b9-1/static-gates.json`).
   - Verify passed 4,702 with 0 failures after one coordinator-authorized rerun; the initial failure was a timing case and is preserved.
   - The declaration hash is `740dc55c…` for both A and B. `src/index.ts` and `package.json` are untouched.
   - The DETAILs state speed and memory cost for H1, H8 and H4, with the exceptions in P2-2 and P3-4.
5. **Tests are load-bearing.**
   - sibling-preparation case 1: `callbacks: 0` fails without H1 (2,004). `comparisons` and `copies` fail without the clause, and both `toBe` checks fail without reuse.
   - sibling-preparation case 2 is a guard for order, `__proto__` and the null prototype on a direct-plan host; it is not failing-first.
   - presence-delta: `scans === 0` fails without H8, because the for-in walks the proxied prior.
   - static-commit 1: `requiredReads === 0` fails without the subset (1,000). `≤ 16` fails at base, where the commit writes about 1,003 keys.
   - static-commit 2: `get` not called fails without the control-layer fallback.
   - static-commit 3 and 4 guard the changed-identity and entering branches.
   - The derive test fails without the derive fallback and asserts the committed fallback after deleting the record.
   - No test is "does not throw" only.
6. **Rules and hygiene.**
   - Each new file has one export and no helpers, with English TSDoc.
   - `hasOwnProperty` comes from winglet. There is no `as any` or `as never`, and `b8570c9ab` removed the only `as`.
   - Tests sit in the settle and derive `__tests__`. The derive test reaches settle through its index, and `getStaticDeclarationIds` sits in the engine organ without importing a child fractal (engine DETAIL).
   - No machine-local path appears in the diff, the gz evidence (which uses `<home>`), the commit messages or the draft PR body. There are no co-author or session trailers, and the author is "Vincent".
7. **Results document.**
   - It names `6e585c4d6` as the product head. Product bytes are identical through `48f62530c`; `src` differs only in three DETAIL "Last Updated" lines.
   - The pilot table matches `raw/b9-1/pilot.json` (spot-checked). It reports the 6 lanes above 1.5, and it states the harness adoption as the coordinator's interpretation, not a measured GC cause.
   - It records the static gates table, delivery 429/0, the declaration hash and the verify-rerun context. It marks the formal window, heap, TEST-073, the TEST-093 re-judgement and the revised estimate as incomplete. The uncommitted working-tree edit adds only window preparation (preflight and smokes).

## Pending gates (window not yet run)

- `switch-siblings-1000` improved outside width (다).
- Stage ledger at 1,000: primeHost, selectChildren, registerPresenceChanges and commitSettlement each below A, recorded in absolute µs.
- `switch-oneOf-80` and `switch-siblings-0` ledger totals inside A's width.
- TEST-073 main 0, and Node heap B median ≤ A max.
- TEST-093 re-judgement, the revised siblings-1000 combined estimate, PR body finalization and push.
- Watch item: a membership-changing publish now goes through the Proxy traps (an O(S) key spread plus a descriptor per key). oneOf-80 has few static entries, so the risk is small there. Compare the selectChildren stage in every row whose switch changes membership under many static siblings.

## Unverified

- No test, build or window was run, by instruction.
- The exact post-change `getCommittedDeclarationKey` count under the `≤ 16` ceiling is not recorded, so it is not shown that the ceiling sits above the current count.
- It is not checked whether existing tests reach any H8 fallback on a prepared host, because no coverage run was done.
- The observable effect of the P2-1 order difference on delivered events is unknown.
- The magnitude of P2-2 is unmeasured.

## Delta 1 — review corrections `48f62530c..88ba096e8`

Reviewed: `550d1dae2` (docs: settle DETAIL H1/H8/H4 corrections and the engine DETAIL basis line), `1f6607031` (docs: test contract groups), `1c329eb22` (product fix and tests), `f4e6cbcc3` (test fixture extraction, a pure move), `88ba096e8` (evidence: window 1 preserved, review-correction gates, retention dry-run device). Read-only while a window ran: no build, test, typecheck or lint. Evidence is git output, source reads and the committed raw logs. Paths are relative to `packages/canard/schema-form/src/core/engine/` unless stated.

**Verdict: CONDITIONAL PASS — P1 0 / P2 0 / P3 3.** Prior P2-1, P2-2 and P2-3 and all five prior P3s are fixed, each with failing-first evidence where a fix changes behavior. The only remaining condition is the inherited one: the window 2 gates on the `1c329eb22` bytes. The three new P3s do not block.

### Prior items

1. **P2-1 fixed (confirmed).**
   - `settle/utils/compute/childSelection/utils/publishPreparedSelection.ts:15` now reads `Object.keys(frame.preparedDynamic!)`. `selectChildren.ts:160-169` allocates `dynamic = Object.create(prepared.baseline)` and passes it as the Proxy target (`utils/createPreparedSelectionStructure.ts:16-38`). The set trap defines on the target and there is no deleteProperty trap, so deletes reach the target too.
   - The `ownKeys` trap returns `{ ...baseline, ...target }`, so the published structure's dynamic subsequence equals `Object.keys(dynamic)`: canonical integer names ascending, then creation order.
   - Phantom names are excluded. The budget return at `selectEntryStep.ts:275-296` follows `seen.set` (:248) but never writes `next`, so the name is never an own key of `dynamic`.
   - Departures and arrivals in `settle/utils/dependencies/collectPresenceChangeNames.ts:41-48` iterate the prior publication's own keys and the current `dynamicNames`. Exits at `selectChildren.ts:297` use the same prior names. The order sentence at `settle/DETAIL.md:44` is now true.
   - Failing-first: `settle.presence-delta.test.ts:50` fails on the pre-fix source with `[p, q]` against `[q, p]` (`architecture/verification/branch-switch/raw/b9-1/review-corrections/presence-before.log.gz`). The spy at `settle/__tests__/helpers/observePresenceChangeNames.ts:56` also compares the following departure write with the full scan.
2. **P2-2 fixed (confirmed).**
   - `settle/utils/commit/markCommitDeliveries.ts:75-82` groups `context.entered` by parent once per call. It is called once per commit (`commitSettlement.ts:84`), and nothing in the host loop mutates `entered`.
   - `settle/utils/commit/utils/getRequiredChildren.ts:27-51` filters only the host's own list. It stable-sorts canonical array-index names first (`>>> 0`, `!== 0xffffffff`, string round trip), so `01` and `4294967295` stay ordinary strings.
   - Cost is O(E) once plus O(e log e) per host, as `settle/DETAIL.md:47` states.
   - `settle.static-commit.test.ts:118` (each host receives only its own list) and `:148` (order) both fail pre-fix (`required-before.log.gz`: the whole Set is passed, and `[b, 10, 2, 01, 4294967295]` is returned).
   - Re-entry order was traced. A child rejected mid-wheel and re-admitted is a new instance appended to `entered` (`selectEntryStep.ts:304-325`). A revived pending child never enters the subset. No order divergence was found.
3. **P2-3 fixed, with one residual gap (P3-A).**
   - Five real-write scenarios in `settle.presence-delta.test.ts` cover the 1,000-sibling switch, multi-round p/q, the nullable null round trip, host exit and re-entry, and a deleted preparation. Each goes through a spy that compares every real collector call with the two original for-in loops. Those loops are byte-equal to `registerPresenceChanges.ts:40-44` at `3104b0d9b`.
   - Which assertion fails without the P2-1 fix: the `dynamicNames` assertion in `:50` (recorded). The other four differential scenarios pass on the pre-fix source (recorded). They are guards, not failing-first tests.
   - `:174` reaches raw null, entered, exited, perished, revived, witness mismatch and missing preparation. The product's else branch runs for each, because the spy's classifier mirrors `collectPresenceChangeNames.ts:30-38`. Its assertions cannot fail when a guard is deleted (P3-A).
4. **Prior P3 items are all applied (confirmed).**
   - P3-1: `prepareStaticHost.ts:136-137`.
   - P3-2: try/finally at `selectChildren.ts:233-250`.
   - Tests: the three cases in `settle.prepared-publication.test.ts` (phantom, throw restore, late preparation) all fail pre-fix (`publication-before.log.gz`).
   - P3-3: the TSDoc effect line at `collectPresenceChangeNames.ts:17`.
   - P3-4: the basis line is restored byte for byte at `DETAIL.md:174`. Both contract commits precede the product commit, and `1c329eb22` touches no DETAIL.
   - P3-5: the sort described in item 2.
   - Moving `node.structure = next` into the try is neutral for the general path. Neither `createStaticEntryReuser` creation, `declareChildren` nor `getDirectChildSelectionPlan` reads `node.structure`. The reuser reads it only inside its closure, during the loop.
   - On a round-1 throw, finally restores `prepared.selectedStructure`, not the baseline that `primeHost.ts:54` published. This matches the prior fix spec and the DETAIL wording "직전 확정 structure". Settlement has no rollback (`settle/utils/write/writeFieldNode.ts:99-131`), and `children` keeps the baseline list after a throw. That is pre-existing throw-state behavior, not a regression.
5. **Surface and gates (confirmed from records).**
   - `src/index.ts` and `package.json` are untouched in the range.
   - `review-corrections/static-gates.json` records 0 declaration differences with SHA `740dc55c…`, the same as the prior round.
   - It records delivery 79 scenes, 429 phases and 0 differences. The candidate bundle hash is new (`7a93f102…` against the prior `b84ae9d0…`), with the same baseline `cd0b65ef…`.
   - It records verify 4,713 passed with 1 todo, unit 3,903, render and react18 766 each, storybook 251, and production 21/21.
   - The new and touched settle suites pass in both the full unit and the verify raw files.
6. **Retention device (confirmed).**
   - `architecture/verification/branch-switch/tools/b4-2/retention.mjs` resolves the row from `buildBranchRows()` plus `buildRows(true)`. The `switch-siblings-1000` row there is the existing siblings fixture (`architecture/verification/design-optimization/tools/helpers/buildRows.mjs:28-34`).
   - The CLI fixes 120 writes and three `measure` snapshots by construction.
   - `tools/b9-1/checkLoad.mjs` runs `helpers/checkRetentionLoad.mjs`, which calls the real CLI with `--expose-gc` and asserts exit 0, the row and 120 writes.
   - `tools/b9-1/window.mjs:40-46` refuses to start without a receipt that has code 0, formal false, the row and the same inputs hash. The README states this.
   - Window 1 is preserved as superseded and used for diagnostics only. Its judgment numbers match the results document.
7. **Production extra environment (confirmed).**
   - `production-extra-env-failed` and `production-extra-env-old-source` record the same two failures: `detached.production.test.ts` with `execFileSync is not a function`, and `blueprint.owned-inline-counts.test.ts` with 117 ≤ 111.
   - `production.json.gz` passes 21/21.
   - No test, expectation, Vite config or product change was made for them in the range.
8. **Hygiene (confirmed).**
   - No commit has a trailer, and the author is "Vincent" with the noreply address.
   - No changed file contains `/Users/`, `/private/`, `/var/folders`, `/tmp/` or a personal name. This includes paced full scans of `window-1/cpu-prechecks.json.gz` (267 MB decompressed) and `window-1/stage-samples.json.gz`. The home directory appears only as `<home>`. See P3-C.

### New findings

- **P3-A (confirmed, test validity) — the fallback-reach test cannot fail when a guard is deleted.**
  - `settle.presence-delta.test.ts:174-226` calls the collector with `previous === structure`, or with a shallow copy at :217. Both the full scan and the bounded path return `[]`.
  - Deleting any one guard term at `collectPresenceChangeNames.ts:33-38` (preparedStaticHosts, raw null, entered, exited, perished, revived) keeps every assertion green. The counts come from the test's own classifier. In the real-write scenarios, :117 and :152 also accept `missing`, so those guards are shadowed there too.
  - Effect: only regression protection is missing. The guards were verified by trace in the prior round.
  - Fix: in `:174`, before each fallback call, run `const previous = Object.assign(Object.create(null), structure); delete previous.kind;` and `context.presenceSelections.set(root, { structure: previous, names: prepared.dynamicNames })`, then call `collectPresenceChangeNames(root, previous, context)`. The full scan then returns `['kind']`, and a bounded result would return `[]`, so the spy's `toEqual` fails when the guard is removed. For the mismatch case, set the witness structure to `structure` and still pass `previous`. Keep the existing `previous === structure` call for `counts.bounded`.
  - Verify after the window: remove each guard term one at a time, confirm that `:174` fails, then restore it.
- **P3-B (confirmed, document) — a stale sentence.** `architecture/verification/branch-switch/b9-1-results.md:108` says the five projects, verify, delivery, declaration, isolation and first-parser gates are "다시 실행 중". The table right after it records them as passed. Fix: replace that clause with "다섯 프로젝트·verify·배달·선언·격리·첫 파서 관문은 아래 표대로 새 머리에서 통과했으며".
- **P3-C (plausible, hygiene) — the window evidence carries the machine's full process table.**
  - `raw/b9-1/window-1/window-end.json` and the CPU precheck records list every process with its command line. That includes OS frameworks, installed applications (1Password, BetterTouchTool, Chrome, Orca), process IDs and the Claude CLI version path.
  - The home directory is redacted, and no secret-shaped argument was found, so the file passes the brief's letter. The earlier `raw/b9-0/window-end.json` is much smaller.
  - This is the owner's call: keep it, or reduce future device output to external process IDs above the threshold. Do not rewrite window 1 evidence without the coordinator.

### Unverified

- No test, build or window was run, by instruction. Failing-first status comes from the committed logs.
- It is not verified that candidate bundle `7a93f102…` was built from `1c329eb22`.
- There is no separate raw record of the six-test rerun after `f4e6cbcc3`. The diff is a pure extraction.
- It is not known whether any real flow reaches the raw-null or lifecycle guards with a valid witness.

## Delta 2 — oneOf-80 protective-gate fix `88ba096e8..048bdab41`

Reviewed: `769917e8a` and `0c5b1be78` (docs: settle DETAIL contract for direct publication, private-target writes and the integer-only sort, plus contract group `settle-b9-oneof-publication-work`), `a3e955b73` (product fix and tests), `048bdab41` (evidence: window 2, window-3-corrections gates, guard-mutation logs, process-record trim, results wording). Read-only while a window ran: no build, test, typecheck or lint. Evidence is git output, source reads and node reads of the committed raw files. Source paths are relative to `packages/canard/schema-form/src/core/engine/`; evidence paths are relative to `packages/canard/schema-form/architecture/verification/branch-switch/`.

**Verdict: CONDITIONAL PASS — P1 0 / P2 0 / P3 2.** The attribution reproduces exactly from the raw window-2 samples. All three fixes remove work on the oneOf-80 path without changing keys, order, values or the reach of the baseline guard. Each count test and each guard removal has a recorded failure, and the static gates ran on the exact `a3e955b73` source tree. The only condition is window 3: the oneOf-80 protective ledger total must land at or below A's maximum while the siblings-1000 gates hold. The two P3s do not block.

### Checked items

1. **Attribution (confirmed by recomputation).**
   - Recomputed from `raw/b9-1/window-2/stage-samples.json.gz`, ledger pass, 3 processes × 100 samples per lane: per-process median of `selfUs`, then the median over processes. Every value equals `stages.json` and `window-3-corrections/attribution.json`.
   - Row total: A median 204.500, A max 204.813, B median 216.417 µs. selectChildren 33.792 → 41.605 (+7.813), markCommitDeliveries 14.626 → 16.792 (+2.166), computeNode 39.668 → 41.167 (+1.498), primeHost 3.042 → 1.708 (−1.333), assembleObject 10.459 → 10.020 (−0.438). Call counts are equal in both lanes for every stage.
   - The three named stages add +11.48 µs against a net stage-median delta of +11.46 µs. No other stage exceeds +0.57 µs (updateOutput +0.563, cloneFromSlot +0.521, everythingElse +0.416).
   - The supplemental pass agrees on the two targeted sources (selectChildren +6.36, markCommitDeliveries +3.88 µs). It does not reproduce the ledger computeNode growth: computeNode self is +0.06 there, and its split-out children add about +0.3. That part is plausibly between-process variance, and no fix targets it.
2. **Fix 1 — direct publication (confirmed equivalent).**
   - `settle/utils/compute/childSelection/utils/publishPreparedSelection.ts:24-28` copies `prepared.baseline` and then `frame.preparedDynamic`, instead of `Object.assign` over the view.
   - The old copy ran the view's `ownKeys` trap (`utils/createPreparedSelectionStructure.ts:26`, `Reflect.ownKeys({ ...baseline, ...target })`), one descriptor trap per key and one get per key. Both copies yield integer names ascending, then baseline strings in baseline order, then dynamic strings in creation order. A name in both would take the dynamic value at the baseline position in both. Every descriptor is an enumerable data property, so neither copy filters differently. `__proto__` is an own data key in both, because neither prototype chain reaches `Object.prototype`.
   - `settle.sibling-preparation` case 2 (order, `__proto__`, null prototype) passes after the fix in unit and verify (`window-3-corrections/unit.json.gz`, `verify.json.gz`).
3. **Fix 2 — writes to the raw target (confirmed equivalent).**
   - `selectChildren.ts:175` and `:228` give the frame `dynamic` as `next`. `node.structure` stays the view during selection (:237), so gates still read through the Proxy, and the view sees each write at once because `dynamic` is its target.
   - What the set trap did (`createPreparedSelectionStructure.ts:27-37`): (a) it threw "Static host baseline mutation" for a baseline name; (b) it defined the name as a configurable, enumerable, writable data property on the target; (c) it returned true. (b) and (c) equal an ordinary assignment on `dynamic`, whose chain is baseline then null, with no setter, no non-writable property and no `__proto__` accessor.
   - (a) is unreachable for internal writes. A prepared host has unique names: `blueprint/utils/features/HostStaticPartition.ts:30-36` marks duplicates ambiguous, and `prepareStaticHost.ts:84-86` then refuses. Internal writes reach only dynamic names: the plain loop walks `prepared.dynamicEntries` (`prepareStaticHost.ts:132-134`), the direct loop skips static names (`selectChildren.ts:147-148`, `:244`), and both table paths `continue` on static names before any write (`gateSelection/selectLiteralTableChildren.ts:70`, `gateSelection/selectPredicateTableChildren.ts:109`). External writes still meet the trap, because the Proxy stays published while selection runs.
   - Reads: `next[name]`, `delete` and the inactive-entry check at `selectChildren.ts:259` behave the same on the target. The only own-key read is `settle/utils/gates/verifyUnvisitedGateStep.ts:31`. It could differ only for a baseline name, and the `continue` above runs first for those. `gateSelection/getTableVisitSteps.ts:31` reads `prepared.dynamicNames`, not `Object.keys(next)`. No code compares `frame.next` by identity.
4. **Fix 3 — integer-only sort (confirmed equivalent).**
   - `settle/utils/commit/utils/getRequiredChildren.ts:35-43` sorts only when some name is a canonical array index. The first-digit pre-check rejects no canonical index, and the remaining test is the comparator's own.
   - With no integer name, every comparison returns 0, and the stable sort leaves the list unchanged. `settle.static-commit.test.ts:148` (integer order) still passes.
5. **Failing-first (confirmed from logs).**
   - `window-3-corrections/oneof-work-before.log.gz` records enumeration 1 and required sort 1, each against 0. It ran an earlier test text with no write assertion.
   - `view-writes-before.log.gz` records writes 3 against 0, with enumeration already 0. That source had fix 1 but not fix 2, so the log isolates fix 2. On `1c329eb22`, the writes go through the view by trace, so the count is 3 there too.
   - `targeted-after.log.gz` records 12 files and 60 tests passing in unit and verify-unit.
   - Guard mutations (`fallback-mutations.json` and eight logs): every single removal exits 1. Seven fail on the differential `['kind']` check. The `prepared?.selectedStructure === structure` removal fails only through a TypeError (P3-E).
   - The logged lines 212, 219, 222, 225 and 228 map in order to the committed 215, 227, 235, 243 and 248. The logs predate the formatting pass, and no mutated source is recorded.
   - Prior P3-A is resolved. `settle.presence-delta.test.ts:200-250` now passes a previous shape without `kind`, so a bounded result would differ from the full scan.
6. **siblings-1000 risk (none by construction).** The membership-changing publish now copies the baseline once, instead of spreading it inside the trap and then running a descriptor trap and a get per key. Writes skip the trap. The sort guard adds one `some` over the host's own entering children. Each path does a subset of the old work, and the membership-unchanged path is untouched.
7. **Gates and records (confirmed).**
   - `window-3-corrections/static-gates.json` names `a3e955b73`. Its source tree `b042d993a…` equals `git rev-parse a3e955b73:packages/canard/schema-form/src`. The head differs only by the formatting of `settle.oneof-publication-work.test.ts`.
   - Delivery: 79 scenes, 429 phases, 0 differences. The candidate hash `c14acfbd…` equals the recorded `index.mjs` build, which closes the Delta 1 bundle-provenance gap.
   - Declarations: 0 differences, SHA `740dc55c…`.
   - Raw project files: unit 3,905 passed with 1 todo, verify 4,715 passed with 1 todo, 0 failed. Render and react18 have 766 each, storybook 251, production 21/21. The new suite passes in unit and verify.
   - Both docs commits precede the product commit, and `a3e955b73` touches no DETAIL. The new DETAIL sentences and the contract group match the code and the test.
8. **Process record and hygiene.**
   - `raw/b9-1/window-1/window-end.json` and `raw/b9-1/window-2/window-end.json` keep only the top 10 names and CPU percentages. `tools/b9-1/window.mjs:207` applies `helpers/compactProcessRows.mjs` to future windows, and `checkTools.mjs` asserts the shape.
   - No window-1 judgment or sample file is in the diff.
   - The CPU precheck records are not trimmed (P3-D).
   - No changed file, decompressed log or raw file contains `/Users/`, `/private/`, `/var/folders`, `/tmp/`, a session line or a personal name. This includes a streamed scan of the 261.6 MB window-2 prechecks.
   - All four commits have author "Vincent" with the noreply address and no trailers.

### New findings

- **P3-D (confirmed, hygiene, owner's call) — the window prechecks still carry the machine's full process table.**
  - `raw/b9-1/window-2/cpu-prechecks.json.gz` is new in this range: 43.8 MB compressed, 261.6 MB decompressed. It keeps about 1,000 precheck observations, each with every row plus the raw `before` and `after` output of `ps -axo pid,ppid,%cpu,time,comm` (`tools/b8/helpers/sampleProcessCpu.mjs:15-19`).
  - That output includes installed application paths: 123,506 `/Applications/` hits, with 1Password, BetterTouchTool and Orca among the names. `raw/b9-1/window-1/cpu-prechecks.json.gz` is unchanged.
  - `comm` records executable paths without arguments, and a scan found no secret-shaped string, so the file meets the brief's letter, as P3-C stated. Still, "process record trimmed in both windows" holds for `window-end.json` only, and window 3 will record the same table again.
  - Fix, if the owner wants it: in `tools/b9-1/helpers/saveEvidence.mjs:19-25`, map each precheck to `{ name, pid, startedAt, quietSince, durationSeconds, requestedDurationMs, heavy, rows: compactProcessRows(check) }`, which drops `before` and `after`. Rewrite stored windows only with coordinator approval.
- **P3-E (confirmed, test validity) — a crash, not an assertion, is what detects the selected-structure guard.**
  - Removing `prepared?.selectedStructure === structure` (`settle/utils/dependencies/collectPresenceChangeNames.ts:32`) fails only in the deleted-preparation case, through a TypeError at :47.
  - No case keeps a preparation whose `selectedStructure` differs from `host.structure`. Replacing the term with `prepared !== undefined` would keep every test green.
  - Fix: in `settle/__tests__/settle.presence-delta.test.ts`, after the preparedStaticHosts case (:243-246), set `derived.preparedStaticHost = { ...prepared, selectedStructure: previous }` and the witness to `{ structure: previous, names: prepared.dynamicNames }`. Expect `['kind']`, then restore `derived.preparedStaticHost = prepared`.
  - Verify: replace the guard term with `prepared !== undefined`, confirm that the new case fails, then restore the term.

### Pending gates and watch item

- Window 3 on the `a3e955b73` bytes must pass the oneOf-80 protective ledger total (B median ≤ A max), the siblings-1000 gates, siblings-0 and heap.
- Watch: the needed reduction is 11.604 µs. If selectChildren and markCommitDeliveries return exactly to A, they recover 9.979 µs, which leaves about 1.6 µs above A max (stage medians do not add exactly). Passing then needs the prepared selectChildren to finish below A, or the computeNode and minor-stage variance to recede. No fix targets computeNode.

### Unverified

- No test, build or window ran, by instruction. Failing-first and mutation status come from the committed logs. The mutated sources are not recorded, and the logs predate the test's formatting pass.
- The time each removed call costs is unmeasured. Only call counts are evidenced.
- The window-1 `cpu-prechecks.json.gz` was not rescanned this round; it is unchanged in the diff.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `048bdab41d5b`, `0c5b1be7897e`, `769917e8a3b4`, `88ba096e8724`, `a3e955b73380`의 필요한 내용은 [본선 보존물](../../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
