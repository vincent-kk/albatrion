# B11 fix round — delta review verdict

Reviewed range: `f3835026b..e08cf7d86` on `fix/schema-form-b11-detached-references` (worktree head `e08cf7d86`, untracked: `b11-results.md`, `raw/b11/`). Static review only: no build, test, typecheck or lint was run, because a measurement window may be active. Red/green evidence comes from `raw/b11/review-fixes/` and was cross-checked by tracing the code. Paths below are relative to `packages/canard/schema-form/`.

**Verdict: PASS — P1 0 / P2 0 / P3 4.** Every P2 fix matches its spec and has a load-bearing test. The six in-scope P3 items are applied, and the P3-3 and P3-4 sentences record unchanged behaviour. The merge is docs-only, and nothing in the range leaks a local path or an attribution line. The four P3 items below are follow-ups and do not block. One of them, P3-D, touches the owner's pending P3-4 decision and should go to the owner with it.

## P1

None.

## P2

None.

## P3 (follow-up)

**P3-A. The P3-7 fix replaced a dropped pre-B11 invariant with a narrower paraphrase (confirmed by diff).**
- Where: `src/core/engine/settle/DETAIL.md:58`.
- Evidence: at base `625930c01` this bullet ended with "주소 셀은 상태 예외로 reset 뒤에도 유지하여 재키된 옛 참조의 쓰기 목적지를 보존한다. 이 초기화는 커밋·배달 순서·public path의 고정 읽기를 바꾸지 않는다(SURFACE-065, NODE-044)." and began with "D3b-1에서". The first B11 commits dropped the device sentence, the unrelated invariant sentence, and the "D3b-1에서" prefix. The fix now ends with "이 초기화는 떼어진 참조의 고정 읽기를 보존한다(SURFACE-065, NODE-044, B11)." That loses the commit and delivery-order invariant and narrows "public path" to detached references. This is the same defect class as round-1 P3-6, where the brief required a verbatim restoration.
- Fix spec: replace line 58 with exactly: `- D3b-1에서 모드 읽기는 공통 engineModes, 변경은 setMode를 거친다. 파생 메모는 실제 모드 변경 때 재생성하며 생성 사실을 잃지 않는다. 라이브 호스트 예산은 runtime의 지연 WeakMap을 쓴다. 폼 전체 reset·폐기는 재계산 가능한 트리 메모만 비우고 부분 reset은 비우지 않는다. 이 초기화는 커밋·배달 순서·public path의 고정 읽기를 바꾸지 않는다(SURFACE-065, NODE-044).`
- Verify: `git diff 625930c01 -- src/core/engine/settle/DETAIL.md` shows that bullet differing from base only by the removed device sentences.

**P3-B. Three TSDoc comments still name the removed address state (confirmed; present since the first B11 commits and missed in round 1).**
- Where: `src/core/engine/utils/cache/clearTreeMemoStores.ts:3` ("…, retaining address state."), `src/core/engine/utils/controls/getCommittedDeclarationKey.ts:7` and `src/core/engine/derive/utils/rules/getDeriveRuleKey.ts:14` ("Root owner of this occurrence memo or retained address state").
- Evidence: at base, `TreeMemoStores` had `detachedWriteAddresses` ("State, retained across every reset…"). B11 deleted the field, and the type now has six memo fields only (`src/core/engine/types/treeMemoStores.ts`). These comments break `seiri_code-comments` §1 and contract rule 5 ("사용처 전부").
- Fix spec: change line 3 of `clearTreeMemoStores.ts` to `/** Drop recomputable stores at a whole-tree lifetime boundary. */`. In the other two files, change the `@param runtime` line to `* @param runtime - Root owner of this occurrence memo`. These are comment-only edits, so product bytes do not change.
- Verify: searching `src` for "address state" outside `__legacy__` finds nothing.

**P3-C. `record/DETAIL.md` still states an absence that the removed device left behind (confirmed; not in the round-1 P3-7 list).**
- Where: `src/core/engine/record/DETAIL.md:11`: "떼어진 참조에는 쓰기 목적지 상태가 없고, 재진입 복제는 과거 수명의 쓰기를 받지 않는다(B11)."
- Evidence: this is the same class as P3-7 ("…는 없다" history in a spec). The other three instances were fixed in `1d52c7699`.
- Fix spec: replace the bullet with `- 떼어진 참조의 쓰기는 무효이며, 재진입 복제는 과거 수명의 쓰기를 받지 않는다(B11).`

**P3-D. The P2-2 guard extends the owner-reserved precedence change to `resetSubtree`, and the guard order now differs from the sibling commands (confirmed by trace; caused by the round-1 fix spec, which said "first statement").**
- Where: `src/core/engine/write/utils/entry/dispatchResetSubtree.ts:20` (`if (node.detached) return;` before `enterFieldNodeChain`, which runs `assertFieldNodeWritable`).
- Evidence: before this round, `resetSubtree` on a detached reference whose form root is disposed threw `DisposedNodeWrite` (`enterFieldNodeChain.ts:18` → `assertFieldNodeWritable.ts:13-18`). It now returns silently, with no warning. Six sibling command entries keep the opposite order, assertion first and then the detached no-op: `dispatchSetState.ts:25-26`, `dispatchSetSubtreeState.ts:26-27`, `dispatchSetExternalErrors.ts:22-23`, `dispatchClearExternalErrors.ts:23-24`, `dispatchClearSubtreeState.ts:22-23` and `dispatchRequest.ts:19-20`. The new write DETAIL sentence for P3-4 (`write/DETAIL.md:6`) lists only setValue and the array verbs. The brief left this precedence question to the owner with "do not change behaviour". The P2-2 behaviour itself, a non-disposed detached reset with no effect, is correct either way.
- Fix spec (documentation only, no product bytes): append this sentence to the bullet at `src/core/engine/write/DETAIL.md:6`: `resetSubtree도 detached 검사가 폐기 검사보다 먼저 적용되어 경고 없이 무동작으로 끝나며, 상태·오류·요청 명령은 폐기 검사를 먼저 적용해 DisposedNodeWrite를 던진다.` Then raise it to the owner together with P3-4. If the owner chooses the sibling order, the code change is `assertFieldNodeWritable(node);` before line 20, imported from `'../../../settle'` as `dispatchSetState` does. It needs a test that `resetSubtree` on a detached reference of a disposed tree throws `DisposedNodeWrite`, and it changes product bytes.

## Checked and clean

1. **P2 fixes and their tests.**
   - P2-1: `deliverChainRecords.ts:32` saves `runtime.reportingErrors` and `:40` restores it in `finally`. The other two setters, `reportValidationFailure.ts:17-33` and `observeFieldNodeReports.ts:17-22`, already save and restore it, so no unconditional reset remains. The test `dispatch.observer-write.test.ts:17-60` is load-bearing. Traced: before the fix, the nested warning delivery cleared the flag, so `dispatchSetValue(other, 'blocked')` entered a chain and its listener threw `Error('listener')`. `p2-1-red.log` fails with "expected Error: listener to be an instance of SchemaFormError", which is the bug's own reason. The DETAIL sentence is at `write/DETAIL.md:8`.
   - P2-2: `dispatchResetSubtree.ts:20` is the first statement. The DETAIL bullet `write/DETAIL.md:61` ends with "resetSubtree도 무동작이다.". The test `detached.inert-writes.test.ts:53-76` is load-bearing on two assertions. Chain exit sets `validationTargets` to undefined (`exitFieldNodeChain.ts:103`), and a batch-marked setValue adds none, so the identity check catches the pre-fix `??= new Set()` at `:28`. `p2-2-red.log` shows "expected Set{…} to be undefined". The `'b'` assertion catches the batch-write filter at `:23-27`. See P3-D for the guard order.
   - P2-3: no `lineage` parameter or argument remains anywhere in `src` or `architecture/plan`. The remaining hits are unrelated: a fixture local, the import-model wording, and two settle DETAIL lines about the current lineage. `writeSlotPath` is now (root, path, target, input, whole, context, automatic, preserveCandidates). Both product callers kept their argument semantics: `distributeMovedSource.ts:25-34` passes (…, context, false, true), and `writeInactiveSource.ts:28` passes (…, context, automatic). The test callers pass five arguments. Ancestor selection is identical, because every caller passed `undefined`.
   - P2-4: `detached.inert-writes.test.ts:10-51` uses `it.each` over push, insert, pop, remove, update and clear, so each verb is its own case. Each case asserts `toHaveBeenCalledExactlyOnceWith(DetachedNodeWrite, any String, { path: '/list' })`, which matches `refuseDetachedWrite.ts:24` exactly, and Vitest 3.2.6 has the matcher. It also asserts the frozen value, the `inactiveValues` identity and the re-entry value. `p2-4-mutations.json` records each single-guard removal failing with "warning called zero times". The results document maps each verb to its entry. There is no `move` verb.
   - P2-5: `vite.config.ts:24-25` defines `bundleTests`. The unit `exclude` (`:66-71`) and the verify-unit `exclude` (`:165`) spread it, and the production `include` (`:189-192`) spreads it in place of the literal. Render, react18 and verify-render include only `renderTests`. The listing logs `list-unit`, `list-verify-unit` and `list-production` are recorded. Unit drops one file (585 → 584) and verify one file (721 → 720), which is consistent.
2. **In-scope P3 items.**
   - P3-1: `isBatchMarking.ts:5` now reads "A detached write is refused before marking…".
   - P3-2: the `!node.detached` check is gone from `scalarWrite`. The guard at `writeFieldNode.ts:44` returns first.
   - P3-5: each case adds a re-entry assertion, at `:54-56`, `:99-101` and `:141-143`. Each `kept` assertion would fail if a detached write were forwarded.
   - P3-6: `app/cache/DETAIL.md:339` restores the three sentences verbatim and in their base order. The count of 3 + 6 + 6 = 15 matches the six-field `TreeMemoStores`.
   - P3-7: `engine/DETAIL.md:5` and `settle/DETAIL.md:21` keep only the current rule. For `:58`, see P3-A. For `record/DETAIL.md:11`, see P3-C.
   - P3-8: `FormWarningCode.ts:44` is verbatim.
3. **P3-3 and P3-4.** No code changed in `dispatchWriteInput`, `dispatchSetValue` or `refuseDetachedWrite`, and only the `dispatchWriteInput.ts:17` TSDoc was aligned. `write/DETAIL.md:5` records that late UI input on a non-disposed detached node warns. This matches the code: `dispatchWriteInput.ts:24` returns silently only for a disposed node, then `dispatchSetValue` calls `refuseDetachedWrite`. `write/DETAIL.md:6` records the detached-before-disposed precedence for setValue and the array verbs (`dispatchSetValue.ts:26-28`) and the silent input-channel disposal. Each is one sentence.
4. **Merge `d4c7c3096`.** The parents are `1d52c7699` and `df61df184`, with merge base `625930c01`. The first-parent diff touches only `architecture/plan/branch-switch/detached-references.md` and `architecture/reviews/round-462-owner-answers.md`. Both `--cc` and `--remerge-diff` are empty, so there are no conflict resolutions.
5. **Hygiene.** The added lines in the range and all commit messages contain no machine-local path, and no Co-authored-by, Signed-off-by or session line. Every author and committer is "Vincent Kelvin" with the noreply address, and no other personal name appears in the added lines. The committed review copy `architecture/verification/branch-switch/reviews/b11-independent-review.md` is byte-identical to the round-1 verdict and has no local paths. Bonus scan: `b11-results.md`, the plain `raw/b11` files, every `.gz` and the `.xz` archive under `raw/b11` also contain no local paths. `prepare.mjs:49,118` now anchors both baseline assertions to `df61df184…`, and no other tool hardcodes a commit.
6. **Repository rules.** No new product file was added, so the one-export and helper budgets are unaffected. The changed TSDoc is English. The delta has no `as any`, `as never`, `as unknown as`, `ts-ignore`, `ts-expect-error`, `Array.isArray` or direct `hasOwnProperty`. The tests reuse the file's existing `Reflect.get` pattern. Case counts are 11 for `detached.inert-writes` and 6 for `dispatch.observer-write`, both under the 15-case cap.

## Results document (`b11-results.md`, untracked)

- Window 1 is recorded as "수정 전 머리, 대체됨", with A=`625930c01` and B=`9f02d1b4d` (product `e26859e29`). It claims 0 TEST-073 main regressions, quality passed, both ledger totals within A's width, and Node heap B median 1439.35 against A max 1895.96 bytes per node. It is excluded from the final verdict.
- Window 2 is not pending. The document reports one run from 2026-10-28T17:21:59.956Z to 18:00:35.440Z, A=`df61df184`, B=`fd6098929`, verdict 채택, 5/5 gates and 0 main regressions. `raw/b11/window-2/judgement.json` (`adopt: true`) and `inputs.json` (baseline `df61df184…`, candidate `fd6098929…`) agree. `checks.json` matches the final-gate table: unit 3,883, verify 4,693, production 21/21 and isolation 10/10. B's product bytes equal head `e08cf7d86`, whose last commit adds only `architecture/` files.
- Still to do under brief step 7: commit `b11-results.md` and `raw/b11/`, update the PR body, push, and send `worker_done`.

## Unverified

- Nothing was executed. The test outcomes, mutation results and window numbers come from the raw logs, cross-checked by trace only.
- In P3-B, the meaning of "or retained address state" in the two `@param` lines is inferred from the deleted base field and its comment.
- In P3-D, the claim that a detached node's `rootNode` is the disposed form root for a held reference is traced through `assertFieldNodeWritable`, not observed.
