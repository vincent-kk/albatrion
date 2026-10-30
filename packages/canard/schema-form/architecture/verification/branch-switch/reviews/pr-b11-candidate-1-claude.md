# B11 independent review — verdict

Reviewed range: `625930c01..c44228ad2` on `fix/schema-form-b11-detached-references` (worktree head is `f3835026b`; its one extra commit adds `tools/b11/window.mjs` and was scanned only for local paths). Static review only: no build, test, typecheck or lint was run because a measurement window may be active. Paths below are relative to `packages/canard/schema-form/`.

**Verdict: CONDITIONAL PASS — P1 0 / P2 5 / P3 13.** Conditions: the five P2 fixes land with their tests, and the pending window gates pass.

## P1

None. Rule 3 is intact, and every value write and array verb on a detached reference is refused before the chain opens.

## P2

**P2-1. A detached write inside an error observer re-opens writes for the rest of that observer callback (confirmed by trace, development only).**
- Where: `src/core/engine/write/utils/report/refuseDetachedWrite.ts:14-28` calls `deliverChainRecords`, whose `src/core/engine/write/utils/report/deliverChainRecords.ts:32,39` sets `reportingErrors = true` and then unconditionally `false`.
- Evidence: `refuseDetachedWrite` runs before `enterFieldNodeChain`, so `assertNotInDelivery` never sees the detached write. When it runs inside `reporter.report` (`reportingErrors` already true), the nested delivery resets the flag to `false`. A later live write in the same `onError` callback then passes `assertNotInDelivery` and commits, which breaks ERROR-029 / WRITE-099. Before B11 the same detached write threw `WriteInObserver` and left the flag set. `reportValidationFailure.ts:17-33` and `observeFieldNodeReports.ts:17-22` already save and restore the flag. Production is unaffected because the warning delivery is skipped there.
- Fix spec: in `deliverChainRecords.ts`, inside the loop, replace `runtime.reportingErrors = true;` with `const previous = runtime.reportingErrors; runtime.reportingErrors = true;`. Replace the `finally` body `runtime.reportingErrors = false;` with `runtime.reportingErrors = previous;`. Add a test to `src/core/engine/write/__tests__/dispatch.observer-write.test.ts`, modeled on the test at lines 12-38:
  - Schema: `{ type: 'object', properties: { open: { type: 'boolean' }, leaf: { type: 'string', controls: { active: '../open' } }, other: { type: 'string' } } }`.
  - Reporter: `hasConsumer: () => true`. In `report(record)`, return early when `record.code === FormWarningCode.DetachedNodeWrite`. Otherwise call `dispatchSetValue(old, 'x')`, then `dispatchSetValue(other, 'blocked')` inside try/catch, pushing the error to `seen`.
  - Steps: mount `{ open: true, leaf: 'a', other: 'b' }`, take `old` = the leaf, set `open` to false, and subscribe a root listener that throws. Assert that `dispatchSetValue(other, 'value')` throws, that `seen[0].code === FormErrorCode.WriteInObserver`, and that `other` reads `'value'`.
- Verify: the new test fails before the change (`seen` is empty and `other` is `'blocked'`) and passes after it. The existing `dispatch.observer-write` and `detached.inert-writes` tests stay green.

**P2-2. `resetSubtree` on a detached reference still affects the live tree (confirmed by trace; pre-existing, but now contradicts the B11 rule "모든 쓰기는 무효다" in `src/core/engine/DETAIL.md:5`).**
- Where: `src/core/engine/write/utils/entry/dispatchResetSubtree.ts:20-27` has no detached guard. `resetFieldNodeSubtree.ts:18` returns only after these lines run.
- Evidence: the entry opens the chain and filters `runtime.batchWrites` by `isDescendantPath(write.node.path, node.path)`. A detached `/group` therefore silently cancels batch-marked writes to the live `/group/x` after re-entry. The entry also adds the detached node to `validationTargets`. Plausibly, in `OnChange` mode this requests a validation run at chain exit (`exitFieldNodeChain.ts:84-101`).
- Fix spec: insert `if (node.detached) return;` as the first statement of `dispatchResetSubtree`. In `src/core/engine/write/DETAIL.md`, append "resetSubtree도 무동작이다." to the bullet that begins "묶음 안에서도 떼어진 참조의 setValue와 배열 동사는". Add a test to `src/core/surface/__tests__/detached.inert-writes.test.ts`:
  - Schema: `{ open: boolean, group: { type: 'object', controls: { active: '../open' }, properties: { x: { type: 'string' } } } }`.
  - Steps: `root.setValue({ open: true, group: { x: 'a' } })`, take `old = root.find('/group')`, close, then open. Run `root.batch(() => { root.find('/group/x')!.setValue('b'); old.resetSubtree(); })`. Expect `root.find('/group/x')!.value` to be `'b'`.
- Verify: the test reads `'a'` before the fix and `'b'` after. Re-run `detached*`, `settle.array-detached-reset-address` and `dispatch.*` tests.

**P2-3. The removed device left two orphaned parameters (confirmed).**
- Where: `src/core/engine/settle/utils/slots/writeSlotPath.ts:21,33,47,93` and `src/core/engine/settle/utils/slots/resolveSlotSource.ts:12,19,31`.
- Evidence: `lineage` ("Old reference's blueprint chain") was supplied only by the deleted detached branches in `writeFieldNode` and `readSourceTree`. Both remaining `writeSlotPath` callers pass `undefined` (`distributeMovedSource.ts:33`, `writeInactiveSource.ts:35`). Both `resolveSlotSource` callers pass three arguments. This breaks contract rule 5 ("사용처 전부") and `seiri_reuse-first` §3, which says to remove what the change orphaned.
- Fix spec:
  - `writeSlotPath.ts`: delete the `@param lineage` line and the `lineage?: readonly BlueprintNode[],` parameter. Line 47 becomes `const selected = depth === names.length - 1 ? target : undefined;`. Lines 92-93 become `const selected = index === names.length - 1 ? target : undefined;`. Reword `@param path` to "Current write address".
  - Remove the `undefined,` seventh argument at `distributeMovedSource.ts:33` and `writeInactiveSource.ts:35`.
  - `resolveSlotSource.ts`: delete the `@param lineage` line and the parameter. Lines 29-31 become `depth === names.length - 1 ? target : source?.structure?.[name]?.blueprintNode`.
- Verify: typecheck, then the `settle.value-model`, `surface.slots-*`, `arrange.retained-*` and `readSourceTree` tests.

**P2-4. The development warning is tested only for `setValue`, not for the six array verbs (confirmed).**
- Where: `src/core/surface/__tests__/detached.inert-writes.test.ts:68-86` is the only test that observes `DETACHED_NODE_WRITE`.
- Evidence: contract 검증 (a) requires the warning code for both `setValue` and the array verbs. Removing `refuseDetachedWrite` from any of `dispatchPush`, `dispatchInsert`, `dispatchPop`, `dispatchRemove`, `dispatchUpdate` or `dispatchClear` keeps every test green, because `arrangeFieldNodeItems.ts:58-61` still makes the verb inert, only silently. That violates `seiri_test-validity` §4: each clause must be load-bearing.
- Fix spec: extend the warning test schema with `list: { type: 'array', items: { type: 'string' }, controls: { active: '../open' } }` and mount `list: ['a']`. Take the old list before closing. After `old.setValue('ignored')`, call `push('z')`, `insert(0, 'z')`, `pop()`, `remove(0)`, `update(0, 'z')` and `clear()` on the old list. Assert that `warning.mock.calls.filter(([code]) => code === FormWarningCode.DetachedNodeWrite)` has length 7, and that the third argument's `path` is `'/leaf'` once and `'/list'` six times.
- Verify: temporarily delete the guard line in `dispatchClear.ts`, see the test fail, then restore the line.

**P2-5. The dist-dependent production test also runs in the `unit` and `verify-unit` projects (confirmed by config and raw logs).**
- Where: `vite.config.ts:63` (unit exclude), `vite.config.ts:157` (verify-unit exclude) and `vite.config.ts:181-184` (production include).
- Evidence: `src/core/surface/__tests__/detached.production.test.ts` spawns Node on `dist/index.mjs`, `dist/index.node.mjs` and `dist/index.cjs`. The unit glob `src/**/*.{spec,test}.ts` picks it up; `raw/b11/unit-final.log:293` and `raw/b11/verify.log:1646` show it ran there. On a checkout without a build it fails with ENOENT. With a stale `dist/` it certifies old bytes, which is the false-pass case in `seiri_test-validity` §2. No other test reads `dist/`.
- Fix spec: in `vite.config.ts`, next to `verifyOnlyTests`, add `/** Built-bundle tests; they run only in the production project after a build. */ const bundleTests = ['src/core/surface/__tests__/detached.production.test.ts'];`. Add `...bundleTests` to the unit `exclude` and the verify-unit `exclude`. Replace the literal production include entry with `...bundleTests`.
- Verify: `yarn workspace @canard/schema-form vitest list --project unit` does not list the file, and `--project production` still does.

## P3 (follow-up)

1. `src/core/engine/write/utils/chain/isBatchMarking.ts:5-6`: the TSDoc still says a detached write "only fixes the root's latent source". Reword it to say a detached write is refused before marking (`seiri_code-comments` §1).
2. `src/core/engine/settle/utils/write/writeFieldNode.ts:51`: `!node.detached` inside `scalarWrite` is dead after the guard at line 44. Delete it.
3. `src/core/engine/write/utils/entry/dispatchWriteInput.ts:14-17`: late UI input on a detached node now emits a development warning, but the TSDoc says retired input writes are silently discarded. The owner should decide whether input-origin writes warn. Then align the TSDoc and the write DETAIL.
4. Precedence change: `refuseDetachedWrite` runs before `assertFieldNodeWritable`. A detached reference from an adopted-away tree therefore no longer throws `DisposedNodeWrite`. It returns silently with the warning instead. Record this in the write DETAIL with a test, or reorder (owner decision).
5. `src/core/engine/settle/__tests__/settle.zero-survivor-writes.test.ts:46-53,89-95,128-134`: the positive control (the `kept` write calling `writeSlotPath` once) was inverted. Each case now asserts only that a spy was not called, with no public-result assertion. Add the re-entry values (list `[]` or its kept shape, `kept` unchanged), or retire the file; `detached.inert-writes` already covers inertness.
6. `src/app/cache/DETAIL.md:339` dropped three sentences unrelated to the device. Restore "초기화 콜백은 D3b-2 전까지 기존 파생 WeakMap 32개를 다시 만들고 생성 사실 두 개는 보존한다." and "관문·측정 판정은 D3b-1 결과 문서에 기록한다." verbatim. Restore the count sentence as "옮긴 항목은 모드 3개·값 메모 6개·트리 저장소 6개(LAST 개수 메모 포함)이며 총 15개이다." (`TreeMemoStores` now has 6 fields, 7 before).
7. DETAIL lines that describe the removed device's absence, `src/core/engine/DETAIL.md:5` and `src/core/engine/settle/DETAIL.md:21,58` ("쓰기 주소 셀·재키·버림 표시는 없다"), are history in a spec. Keep only the current rule.
8. `src/errors/constants/FormWarningCode.ts:44`: the TSDoc deviates from the sibling form "Class: warning record; when: …". Use "Class: warning record; when: a write is attempted through a detached node reference; the write has no effect."
9. `refuseDetachedWrite.ts:19-26` hand-builds the record. The sibling development warning (`DialectMismatch` in `fieldNodeFactory.ts:171-183`) uses `createFormErrorRecord(true, code, 'warning', () => message, fields)`.
10. The slot-dirty-host block is duplicated at `rekeyArraySlotBindings.ts:61-66` and `applyArraySlots.ts:189-194`. Extract one helper under `utils/slots/`.
11. Formatting churn outside the request: the bulk of the `vite.config.ts` reformat, plus import reorders in `FormWarningCode.ts`, `createClearedArrayOverlay.ts` and `applyArraySlots.ts` (`seiri_reuse-first` §3).
12. The branch base is `625930c01`. Its copy of `architecture/plan/branch-switch/detached-references.md` still describes the withdrawn three-value `find`. Merge or rebase the stage head (`df61df184`) before opening the PR.
13. The intermediate commits are not green individually: `38d23f1a2` adds the member, and the ledger, enum-count and snapshot tests land in `e26859e29`, `38611c210` and `93a717459`. This only affects bisecting.

## Checked and clean

1. **Rule 1.** All seven value and array entries (`dispatchSetValue`, `dispatchPush`, `dispatchInsert`, `dispatchPop`, `dispatchRemove`, `dispatchUpdate`, `dispatchClear`) call `refuseDetachedWrite` before `enterFieldNodeChain`. The guard is a plain flag check (`refuseDetachedWrite.ts:14`), and the updater is not evaluated (`detached.inert-writes.test.ts:22-24`). The warning is development-only and uses exactly one new member, `DetachedNodeWrite`. Reporter failures go to `reportOwnerlessError` with `caller=false`, so the warning path does not throw synchronously. `finishInput` is inert through `writeFieldNode.ts:44`. State, error, request and subtree-state entries already carried guards. No `move` verb exists. The production test asserts zero `console.warn` calls across ESM, Node ESM and CJS. Exceptions are P2-1 and P2-2.
2. **Rule 5.** `DetachedWriteAddress.ts`, `hasLivePathKind.ts`, `rekeySlotWriteAddresses.ts` and `discardClearedArrayItems.ts` are deleted, along with `TreeMemoStores.detachedWriteAddresses` and `CompactedSlotSources.discarded`. The grep over `src` and `architecture/plan` finds no import or type. The settle DETAIL write-address paragraph and its known-limit sentences are gone. Kept-item compaction and `hasKeepDescendants` (`createExitSlotOverlay.ts:54`) remain. The compaction public tests keep their compacted shape and change only old-reference write values. The remaining survivors are P2-3 and the `writeSlotPath` `@param path` wording.
3. **Rule 3.** `git diff 625930c01..c44228ad2 -- src/core/engine/navigation src/core/surface/type.ts` is empty. The regression test at `detached.inert-writes.test.ts:88-95` gives `null` for both an inactive declared path and an undeclared path.
4. **Rule 4.** `cloneFromSlot.ts:34-36` already deletes the slot and the overlay, which matches the corrected contract (`df61df184`), so the test pins behaviour rather than failing first. The memory-bound test asserts a new instance, empty slots and overlays, no `/group` in `inactiveValues`, and a count equal to the bound across 64 cycles. No other entry-keyed store retains the old instance: `inactiveSlotChildren` indexes live children, `misfitPaths` holds strings, and the address WeakMap is gone. The results retention row reads 9–9 in both lanes with the old instance unreachable.
5. **Rule 2.** The JSON-path write logic is unchanged, and `injectTo` is untouched. The B7 overlay tests now exercise root and host JSON writes and still assert application at clone. No VALUE-031 ㅁ assertion was weakened.
6. **Tests.** The changed B7 tests assert public values after re-entry, so each would fail if the write were forwarded. None checks only "no throw". No `vi.mock` of jsonPointer was added. The new tests live in the surface fractal and import internals directly. Exceptions are P2-4 and P3-5.
7. **Delivery corpus.** Only the `detached-write` and `detached-write-after-drain` step and its label were removed (`delivery.mjs:384-402,441`). `raw/b11/delivery.json` records 429 phases with 0 differences, and `delivery-before.json` records 491 phases with 0 differences, baseline against baseline.
8. **Documents.** The DETAIL edits land in the same commits as their code (`38d23f1a2`, `e26859e29`). The English and Korean SPECIFICATION files carry the rule and the migration line. `app/cache/DETAIL.md` no longer names the device (see P3-6).
9. **Repository rules.** `refuseDetachedWrite.ts` exports one function. New declarations carry English TSDoc. The diff has no `as any`, `as never` or `ts-ignore`, and neither the diff nor the commit messages contain machine-local paths. Commits carry no co-author or session lines, and the only author name is Vincent Kelvin.
10. **Results document.** It is present but untracked, along with `raw/b11/` and `tools/b11/summarizeSelf.mjs`. It records the five projects plus verify with 0 failures and a declaration diff with exactly one added `FormWarningCode` member, matching the `publicSurface` snapshot. The isolation and parser tests pass 10/10 with 0 full-parser calls. It also has the fail-first summary (3 of 4 tests red before the fix), the corpus counts and the retention row.

## Pending gates

- The window has not run. These rows read 대기 in `b11-results.md`: TEST-073 main regressions 0, the `switch-oneOf-80` and `switch-siblings-0` ledger totals inside A's width, Node heap B median ≤ A max, and the `finalizeExits` / `cloneFromSlot` self deltas (recorded only).
- `b11-results.md`, `raw/b11/` and `tools/b11/summarizeSelf.mjs` must be committed before the PR.
- After the P2 fixes, re-run on the new head: targeted tests, typecheck, lint, the five projects plus verify, and the production project after a fresh build. Product bytes change with P2-1, P2-2 and P2-3, so the window's B input must be rebuilt from the fixed head.

## Unverified

- Nothing was executed. Test outcomes come from the results document and the raw logs, not from a run in this review.
- The validation-run effect in P2-2 is traced but not observed.
- Commit `f3835026b` (`tools/b11/window.mjs`) was not reviewed beyond the local-path scan.
