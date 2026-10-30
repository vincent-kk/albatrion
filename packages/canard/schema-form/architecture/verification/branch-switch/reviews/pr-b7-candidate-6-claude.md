# B7 후보 6 delta 검토 — 소멸 표시의 서브트리 전파

검토 범위는 `branch-switch-b7` worktree의 `a20d0c2a0..502a1d4d9`입니다. 이 범위는 시험 커밋 `4976cb952`, 제품 커밋 `7eb383005`, 문서 커밋 `502a1d4d9`로 이루어집니다. 지시에 따라 시험·빌드·typecheck·lint는 실행하지 않았고, 모든 동작 판단은 코드 추적에 근거합니다. 아래 경로는 `packages/canard/schema-form/` 기준이며, `settle/`은 `src/core/engine/settle/`을 뜻합니다. 줄 번호는 `502a1d4d9` 기준입니다. worktree 머리는 그 뒤 `aa0945e8a`로 움직였습니다. 이 커밋은 측정 창 문서와 raw만 더하고 `src`를 바꾸지 않으며, 검토 범위 밖입니다.

## 판정

**조건부 PASS** — 이전 P2는 명세 A대로 고쳐졌고, 버려진 아이템 아래에서 보유 그래프가 아직 닿는 칸이 표시를 놓치는 경로는 더 찾지 못했습니다. 다만 추가된 tuple 이전 시험은 자기가 주장하는 이전 경로에 닿지 않고, 비용 문장 하나가 실제 순회보다 좁게 적혀 있습니다. 이 두 P3를 고치는 것이 조건입니다.

## 이전 결함 상태

**해결됨.** 근거는 코드 추적이며, 작업자의 실패 먼저 기록과 일치합니다.

1. **명세 A — 글자 단위로 같습니다.**
   - `settle/utils/detached/DetachedWriteAddress.ts:58-72`의 TSDoc과 본문은 이전 검토의 명세와 같습니다. `runtime` 매개변수는 빠졌고, `node.runtime`의 WeakMap을 씁니다.
   - `settle/utils/slots/cloneSlotSubtree.ts:71`은 `DetachedWriteAddress.discard(discarded);`입니다. 제품 코드에서 `discard`를 부르는 곳은 이 줄과 `DetachedWriteAddress.ts:69, 71`의 재귀뿐입니다.
   - 장면을 다시 추적했습니다. 재진입 복제(`cloneFromSlot.ts:29`)가 후보 P를 비진입 복제 P′로 옮기고, `cloneSlotSubtree.ts:37, 39`가 P의 칸을 P′와 공유하게 합니다. 지우는 조상이 나가면 압축 계획의 discarded에 R0′가 들어갑니다(`createClearedArrayOverlay.ts:61-62`). 이제 `discard(R0′)`가 70-71행에서 R0′의 비활성 슬롯 P′에 닿아 공유 칸에 표시를 붙입니다. 그래서 P에 쓰면 `read`가 86-87행에서 자기 칸의 표시를 보고, `writeFieldNode.ts:83`이 쓰기를 버립니다.
2. **비용 — 적혀 있습니다.** `settle/DETAIL.md:21`과 `b7-results.md:416`에 비용 문장이 있습니다. 순회가 버리는 시점에만 일어나고 버려진 서브트리 크기에 비례한다는 내용은 맞습니다. 다만 "정책 판단이 이미 방문한 범위"라는 부분은 틀렸습니다(새 결함 P3-2).
3. **실패 먼저 시험 — 장면과 같습니다.**
   - `src/core/surface/__tests__/surface.clearing-array-keep.test.ts:376-420`은 이전 검토의 명세 4번 시험과 같습니다.
   - `raw/b7/fail-first.json`의 `candidate6`에 기록된 받은 값 `[{ p: 5, keep: 2 }]`는 이전 검토가 예측한 실패 이유와 같습니다. 기준 SHA는 `ba0db9a42…`이고, 실행 머리 `a20d0c2a0`은 제품이 같다고 적혀 있습니다. 수정 뒤에는 2통과·9건 필터 제외로 적혀 있으며, 이 파일의 11사례와 맞습니다.
4. **`restoreTransferredSlotSource` — 작업자 주장을 읽기로 확인했습니다.**
   - 이 함수에는 자체 버림 분기가 없습니다. 34행은 `cloneSlotSubtree`를 계획 없이 부르므로, `cloneSlotSubtree.ts:63-77`의 압축 분기는 이 호출에서 실행되지 않습니다.
   - 대신 이전 복제는 목적지 발생의 `inactiveSlots`에 놓입니다(32-35행). 나중에 목적지 행이 버려지면 `DetachedWriteAddress.ts:70-71`의 재귀가 그 복제의 칸에 닿습니다.
   - 배열 이전에서는 `applyArraySlots.ts:160`의 `rekeyArraySlotBindings`가 218행의 `replayMovedSource`보다 먼저 실행됩니다. 그 안의 `rekeySlotWriteAddresses.ts:15-41`이 옮겨진 옛 행의 서브트리 전체에 칸을 줍니다. 그래서 `cloneSlotSubtree.ts:37`의 `transfer`가 그 칸을 이전 복제와 공유하게 하고, 옛 후보 참조도 표시를 받습니다.
   - 이 결론은 읽기로만 확인했습니다. 이 경로를 실행하는 시험은 아직 없습니다(새 결함 P3-1).
5. **`readSourceTree.test.ts` 조정 — 시험이 약해지지 않았습니다.**
   - 이제 `discard`가 `oldTags`에 자기 칸 `{ path: '', order: [], discarded: true }`를 붙입니다(`DetachedWriteAddress.ts:65`). 그래서 이전의 내부 경로 기대값은 더 이상 맞지 않습니다.
   - 소멸 칸의 `path`를 읽는 소비처는 없습니다. `read`를 부르는 곳은 `writeFieldNode.ts:82`와 `readSourceTree.ts:28` 둘뿐이고, 둘 다 표시를 먼저 보고 돌아갑니다(`writeFieldNode.ts:83`, `readSourceTree.ts:29-30`). 따라서 지운 기대값은 동작과 무관한 내부 값이었습니다.
   - 시험의 판별력은 `discarded: true`와 `readSourceTree`가 `[1, 2]`를 돌려준다는 두 기대에 있고, 둘 다 남아 있습니다. 표시가 빠지면 `readSourceTree`가 `/list/0/tags`를 생존 행에 해석해 `[9, 10, 11]`을 돌려주므로 시험이 실패합니다.
   - 새로 더한 `oldTags.path` 기대는 공개 경로가 그대로라는 확인입니다. 거의 언제나 참이지만 해는 없습니다.
6. **문서와 규칙 — 맞습니다.**
   - `settle/DETAIL.md:21`의 명세 문장은 "… moves or discards the original references with their clones." 바로 뒤에 있습니다. 한계 문장은 "an old reference to an occurrence that itself re-entered (excluding inactive candidates carried beneath it)"로 좁혀졌습니다.
   - `b7-results.md:406`의 "후보 6" 절에는 결함 표, 실패 먼저, 관문, 배달 비교, 알려진 한계, 비용 문장이 있습니다.
   - `a20d0c2a0..502a1d4d9`에서 더해진 모든 줄(raw JSON 포함)에서 `/Users/`, `/private/`, `/tmp/`, `/var/folders`, `/home/`, scratchpad, 사용자 이름을 찾았고 하나도 나오지 않았습니다.
   - 더해진 TypeScript 줄에는 `as any`, `as never`, `Array.isArray`, 직접 `Object.prototype.hasOwnProperty`, `@ts-` 지시문이 없습니다. TSDoc은 영어입니다. 도우미 예산 규칙은 함수 파일의 비공개 도우미에 대한 것이고, `discard`는 클래스의 정적 메서드이므로 해당하지 않습니다.
   - 시험의 `import { isArrayNode } from '../utils/guards'`는 같은 surface 프랙탈 안의 파일을 직접 가져오므로 규칙에 맞습니다.

## 새 결함

심각도 표기는 P1 결함, P2 고쳐야 함, P3 사소함입니다.

### P3-1 [확인] 추가된 tuple 이전 시험은 `restoreTransferredSlotSource`에 닿지 않습니다

- **위치:**
  - `src/core/surface/__tests__/surface.clearing-array-keep.test.ts:422-471`
  - `architecture/verification/branch-switch/b7-results.md:422`
  - `architecture/verification/branch-switch/raw/b7/fail-first.json:222-228`
- **원인 사슬(코드로 확인):**
  1. 세 `prefixItems` 행은 색인마다 후보가 하나뿐입니다. 그래서 `blueprint/buildNodes/utils/children/populateNodeChildren.ts:289-292`는 `prefixItemCandidates`를 만들지 않습니다. 행 안에도 같은 이름의 여러 후보가 없으므로, `blueprint/utils/features/markCandidateDescendants.ts:13-20`이 `hasCandidateDescendants`를 켜지 않습니다.
  2. 그러면 `settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:73`의 `candidateMoves`가 거짓입니다. 85-97행의 `moved`도 거짓이므로 115-121행과 218행이 실행되지 않습니다. 115-121행은 옛 행을 `inactiveSlots`로 옮기는 곳이고, 218행은 `replayMovedSource`에서 `restoreTransferredSlotSource`로 가는 입구입니다. `remove(0)`은 tuple 색인이라 `prepareArraySplice.ts:35` 조건에서 splice 경로도 타지 않습니다.
  3. 옛 1번 행은 146행에서 perished가 됩니다. 새 A 행은 128행 `createChildNode`로 만들어지고, 219행 `markWrite`로 원본 값 `{ p: 1 }`을 입력으로만 받습니다. 옛 후보 P는 어느 행으로도 옮겨지지 않습니다. 목록에 `inactiveSlots`가 없으므로 `rekeyArraySlotBindings.ts:28`에서 바로 돌아가고, P의 칸은 `/list/1/p`에 남습니다.
  4. 지움 압축 뒤 생존 행은 색인 0 하나뿐입니다. P에 쓰면 `/list/1/p`로 갑니다. 압축 overlay가 `replace`이므로 `getSlotSource.ts:19-20`이 원본을 돌려주지 않고, `writeSlotPath.ts:101-107`이 원본 없는 색인 1 자리에 patch를 만듭니다. 생존 행에는 닿지 않습니다.
  5. 그래서 이 시험은 수정 전(단일 칸 표시)에도 지금도 통과합니다. 통과 이유는 묵은 색인이 생존 행 범위 밖이라는 것이며, 소멸 표시와 무관합니다. 작업자가 기록한 "수정 전에도 통과"가 이 추적과 맞습니다.
- **왜 고쳐야 하나:**
  - 시험 이름의 "transferred between tuple rows", 결과 문서 422행의 "다른 tuple 청사진에 이전", raw 메모가 모두 이전 경로를 실행했다고 읽힙니다. 행은 새로 만들어졌지만 후보는 이전되지 않았습니다.
  - 조정자가 요청한 `restoreTransferredSlotSource` 덮기는 지금 코드 읽기로만 뒷받침됩니다.
  - 이름의 "drops a write"도 정확하지 않습니다. 쓰기는 버려지지 않고, 생존 범위 밖 색인에 patch로 남습니다.
- **같은 스키마의 다른 형태(추적, 실행하지 않음):** keep 행이 하나 더 있어 생존 행이 둘이면, P의 묵은 경로 `/list/1/p`가 두 번째 생존 행에 닿습니다. 이는 B7 이전부터의 배열 동사 규칙입니다. 그 규칙은 "사라진 행의 참조는 마지막 경로에 쓴다"이며 B7 결함이 아닙니다. 다만 이 시험이 그 경계를 지켜 주지는 않는다는 뜻입니다.
- **심각도:** 제품 동작에는 영향이 없으므로 P3입니다. 그러나 검증 기록이 사실과 다르므로 병합 전에 고쳐야 합니다.

### P3-2 [확인] 비용 문장이 실제 순회 범위보다 좁습니다

- **위치:**
  - `settle/DETAIL.md:21`: "Discard visits only that discarded item's children owned by the item and its inactive slots, adding one WeakMap entry per visited occurrence; those subtrees were already visited by policy evaluation in the same settlement."
  - `b7-results.md:416`: "그 서브트리는 같은 정착의 정책 판단이 이미 방문한 범위입니다."
- **원인:**
  - `settle/utils/slots/createExitSlotOverlay.ts:51-64`는 keep 후손이 없는 지움 배열을 만나면 아이템을 방문하지 않고 바로 돌아갑니다.
  - `discard`는 `DetachedWriteAddress.ts:68-71`에서 그 배열의 `children`과 `inactiveSlots`까지 끝까지 내려갑니다. 그래서 버려진 행 안에 그런 중첩 배열이 있으면, 정책 판단이 보지 않은 아이템도 방문합니다.
  - "visits only … children … and its inactive slots"는 한 단계만 방문한다고 읽힐 수 있지만, 실제 순회는 재귀입니다.
  - 이미 칸이 있는 노드에는 WeakMap 항목이 더해지지 않으므로, "one"보다 "at most one"이 정확합니다.
- **이전 검토의 오류:** 이 문장은 이전 검토의 수정 명세가 준 문장입니다. 이전 검토의 "같은 정착에서 이미 방문한 children과 inactiveSlots만 다시 방문합니다"라는 판단이 이 조기 반환을 놓쳤습니다. 이번에 바로잡습니다.
- **영향:** 정확성에는 영향이 없습니다. 버려진 서브트리 크기에 비례한다는 비용 차수도 같습니다. 그러나 패키지 `CLAUDE.md`는 모든 변경이 속도와 메모리 비용을 적도록 하므로, 적힌 비용은 정확해야 합니다.

## 경로 열거

먼저 구조 논증입니다.

- **노드를 담는 필드.** 보유 그래프에서 노드를 담는 필드는 `structure`, `children`, `inactiveSlots`, `inactiveSlotChildren`, `inactiveSlotBaselines`입니다(`record/types/record.ts:55-67`).
  - `discard`는 `children`(그 발생이 소유한 것만)과 `inactiveSlots`를 따라갑니다.
  - `structure`는 `children`과 같은 노드를 이름으로 담습니다.
  - `inactiveSlotChildren`은 소유 자식의 부분집합입니다(66행 문서).
  - `inactiveSlotBaselines`는 호스트의 다음 커밋까지만 바뀌기 전 원본을 담습니다. 그 원본의 부모는 호스트 자신이므로, 같은 세대에서는 부모 사슬 검사(`DetachedWriteAddress.ts:88-89, 92-97`)가 이를 덮습니다.
- **칸 공유.** 칸은 원본에서 비진입 복제로 이어지는 한 계보 안에서만 공유됩니다. 주소 객체는 `retainExitedSlot.ts:30-33`, `cloneSlotSubtree.ts:33-36`, `rekeySlotWriteAddresses.ts:16`에서 매번 새로 만들어집니다. 복제는 언제나 원본을 대신해 그래프에 들어갑니다(`retainExitedSlot.ts:66`, `cloneFromSlot.ts:35`, `replayTransferredSlotInput.ts:28`). 그래서 한 계보에서 그래프 안에 있는 노드는 하나뿐입니다.
- **따라서:** 표시가 생존 행과 공유된 칸에 붙어 정당한 쓰기를 버리는 일은 없습니다. 반대로, 버려진 아이템 아래에서 그래프가 아직 닿는 칸은 모두 표시됩니다.

| 칸이 생기는 방식 | 칸을 가진 노드 | 행이 버려질 때 discard가 닿는 길 | 판정 |
| --- | --- | --- | --- |
| 1. 맨 위 나감: `retainExitedSlot.ts:28-35` | 나가는 맨 위 발생 X만 칸을 받습니다. 그 아래 후손은 X의 칸으로 해석합니다(`DetachedWriteAddress.ts:92-103`). | 버려지는 것은 X 아래 지움 배열의 아이템 D입니다. `discard(D)`가 D와 그 아래 모든 소유 자식·비활성 슬롯에 자기 소멸 칸을 붙입니다. 옛 참조는 자기 칸이나 부모 사슬에서 표시를 봅니다. | 막힘 |
| 1a. 맨 위 나감과 압축 복제: `cloneSlotSubtree.ts:37-39`(계획 있음) | 원본과 복제가 칸을 공유합니다. | 계획의 discarded는 원본 발생이므로 직접 표시됩니다. 생존 원본은 복제와 함께 새 색인으로 옮겨집니다. | 막힘 |
| 1b. 맨 위 나감이 대체 경로이거나 모두 지워짐: `retainExitedSlot.ts:36-40, 51-54` | X는 칸을 받지만 슬롯에서 빠집니다. | 그래프에 없으므로 재귀는 닿지 않습니다. 같은 세대의 부모가 버려지면 부모 사슬로 막히고, 아니면 마지막 경로에 씁니다. | 문서 한계("exited fully cleared") |
| 2. 따로 먼저 나감: 살아 있는 행 R 아래 후보 P(`retainExitedSlot.ts:28, 66`) | P가 자기 칸을 받고 `R.inactiveSlots`에 있습니다. | `discard(R)`의 70-71행이 P에 닿습니다. P의 부모가 R이므로 수정 전에도 부모 사슬로 막혔습니다. | 막힘 |
| 3. 재진입 복제가 P를 옮김: `cloneFromSlot.ts:29`에서 `cloneSlotSubtree.ts:80-86, 37-39` | P와 비진입 복제 P′가 칸을 공유합니다. | `discard(R′)`가 `R′.inactiveSlots`의 P′를 거쳐 공유 칸에 닿습니다. | 막힘(이전 P2, 수정됨, 실패 먼저 증거 있음) |
| 3a. 재진입 복제: P의 자식 Q | Q는 칸이 없고, Q′는 39행에서 새 칸을 받습니다. | Q는 P의 공유 칸으로 해석하므로 그 표시를 봅니다. | 막힘 |
| 3b. 재진입 복제: R의 살아 있던 자식 K(진입 복제, 99-108행) | K′에는 칸이 없고 K와 연결도 없습니다. | 닿지 않습니다. K는 옛 세대 조상의 칸으로 해석합니다. | 문서 한계("occurrence that itself re-entered") |
| 4. 재사용 행의 배열 이동: `applyArraySlots.ts:181`, `rekeyArraySlotBindings.ts:62`에서 `rekeySlotWriteAddresses.ts:15-41` | 행 아래 모든 비활성 발생이 칸을 받거나 옮깁니다. | 행 객체가 그대로이므로 재귀와 부모 사슬 둘 다 닿습니다. | 막힘 |
| 5. 후보가 있는 tuple의 배열 이전: `applyArraySlots.ts:115-121, 160, 218`에서 `restoreTransferredSlotSource.ts:29-35` | rekey가 옛 행 서브트리 전체에 칸을 주고, 이전 복제가 그 칸을 공유합니다. | `discard(새 행)`이 새 행의 `inactiveSlots`에 있는 이전 복제를 거쳐 공유 칸에 닿습니다. | 막힘(읽기로만 확인, 시험 없음) |
| 5a. 같은 이전: 옛 행 자신, 그리고 이전 뒤 새 행에서 다시 살아난 자식 | 옛 행의 칸은 새 행과 연결되지 않습니다. 다시 살아난 자식의 복제는 `cloneFromSlot.ts:35`에서 슬롯을 떠납니다. | 닿지 않습니다. | 일반 규칙("A cell that the retained graph no longer reaches"), 재진입과 같은 꼴 |
| 6. 후보 없는 배열 동사로 행이 사라짐: `applyArraySlots.ts:73, 146` | 후보의 칸은 옛 경로에 남고 옮겨지지 않습니다. | 닿지 않습니다. | 일반 규칙이자 B7 이전부터의 배열 동사 규칙입니다. 추가된 tuple 시험이 실제로 실행하는 경로가 이것입니다. |
| 7. 같은 이름의 후보 종류 전환: K1 나감(`retainExitedSlot.ts:28`), 다른 종류로 이전(`cloneFromSlot.ts:33`) | K1이 자기 칸을 받고 행의 `inactiveSlots`에 있습니다. | K1이 남아 있으면 재귀가 닿습니다. K1이 다른 종류로 소비되었으면 K1의 부모가 행이므로 부모 사슬이 닿습니다. | 막힘(같은 세대) |
| 7a. 재진입으로 옮겨진 후보가 그 뒤 다시 살아나거나, 다른 종류로 소비되거나, 다른 종류 쓰기나 원본 정리로 밀려남: `cloneFromSlot.ts:35`, `writeSlotPath.ts:137-145`, `pruneSlotSources.ts:37, 70` | 공유 칸이 그래프를 떠납니다. 옛 참조의 부모는 옛 세대입니다. | 닿지 않습니다. | 일반 규칙입니다. 괄호 예외는 아직 옮겨진 채 남은 후보에만 적용됩니다. |
| 8. 압축 배열: `createClearedArrayOverlay.ts:61-62, 80-86`에서 `cloneSlotSubtree.ts:63-77` | 생존 원본과 복제는 칸을 공유하고, 버려진 원본은 계획의 discarded에 있습니다. | 계획을 쓰는 복제에서 70-71행이 각 버려진 원본에 닿습니다. 생존 행 안의 중첩 계획은 생존 복제의 재귀(75행)가 씁니다. 버려진 행 안의 중첩 배열은 생존이 없어 계획이 없지만, 재귀가 그 안까지 덮습니다. | 막힘 |
| 8a. 이미 비활성인 배열이 나중에 압축됨(후보 5의 연결) | 첫 압축 복제가 모든 원본을 복제의 칸에 연결했습니다(`cloneSlotSubtree.ts:38`). | 두 번째 압축의 `discard`가 복제와 공유된 칸에 닿습니다. | 막힘 |
| 8b. 원본 없이 overlay만 있는 항목, 또는 replace overlay에 가려진 아이템: `createClearedArrayOverlay.ts:52`, `getSlotSource.ts:19-20` | 옛 칸이 남습니다. | 계획에 들어가지 않으므로 닿지 않습니다. | 문서 한계("exited fully cleared")와 일반 규칙 |
| 8c. 생존 아이템 0개: `createClearedArrayOverlay.ts:80` | 해당 없음 | 계획과 표시가 없습니다. | 문서 한계("zero-survivor arrays") |

**결론:** 버려진 아이템 아래에서 그래프가 아직 닿는 칸이 표시를 놓치는 경로는 없습니다. 표시를 놓치는 쓰기는 모두 그래프를 떠난 칸을 통한 것이며, `settle/DETAIL.md:21` 마지막 문장의 일반 규칙이 이를 다룹니다. 그 문장의 "such as" 예시는 1b와 3b만 직접 이름 짓고 5a, 6, 7a, 8b는 이름 짓지 않습니다. 그러나 주어가 "A cell that the retained graph no longer reaches"이므로 이들은 범위 안에 있습니다. 예시를 보강하는 것은 선택입니다.

## 수정 명세

작업자에게 줄 제약을 먼저 적습니다.

- `yarn`은 Bash 호출 하나에 단독으로 실행합니다. 파이프, `;`, 파일 리디렉션, 환경 변수 접두사를 붙이지 않습니다.
- 디렉터리는 `cd` 대신 `yarn --cwd <worktree>`로 넘깁니다.
- 측정 창이 끝난 뒤에만 실행합니다.
- 제품 코드(`src`의 시험 아닌 파일)는 바꾸지 않습니다.

### P3-1 수정 A — 권장: 시험이 실제로 이전 경로를 타게 합니다

1. `src/core/surface/__tests__/surface.clearing-array-keep.test.ts:422-471` 시험에서 세 `prefixItems` 행 리터럴 각각을 아래 모양으로 바꿉니다. 세 행은 지금처럼 따로 쓴 리터럴로 둡니다. 한 객체를 세 번 재사용하지 않습니다. 값, 단계, 마지막 기대값 `[{ keep: 2 }]`는 바꾸지 않습니다.

   ```ts
   {
     type: 'object',
     properties: {
       kind: { type: 'string' },
       p: { type: 'number', controls: { active: '#/flag' } },
       keep: { type: 'number', controls: { unsetOnInactive: false } },
     },
     allOf: [
       {
         controls: { active: './kind === "text"' },
         properties: { value: { type: 'string' } },
       },
       {
         controls: { active: './kind === "number"' },
         properties: { value: { type: 'number' } },
       },
     ],
   },
   ```

   이 모양은 `src/core/engine/settle/__tests__/settle.pointer-slot-work.test.ts:34-55`의 `candidateSchema`를 따릅니다. `value` 이름에 후보가 둘이 되므로 행과 목록의 `hasCandidateDescendants`가 켜집니다.

2. **실패 먼저.** 제품이 `ba0db9a42`와 같은 상태에서 이 시험만 실행합니다. 예로는 `a20d0c2a0`에서 만든 임시 worktree에 이 시험 파일만 바꾼 상태가 있습니다.
   - 시험은 마지막 `toEqual`에서 실패해야 하고, 받은 값의 첫 행에 `p: 5`가 있어야 합니다.
   - 예측 근거(추적)는 다음과 같습니다. `candidateMoves`가 참이 되어 옛 1번 행이 `inactiveSlots`로 옮겨집니다. rekey가 P의 칸을 `/list/0/p`로 옮기고, `restoreTransferredSlotSource`가 P′를 새 A 행 아래에 두며 칸을 공유하게 합니다. 압축이 A 행을 버리지만 수정 전의 단일 칸 표시는 P′의 칸에 닿지 않습니다. 그래서 쓰기가 색인 0 생존 행의 patch에 들어갑니다.
   - 시험이 통과하거나 다른 곳에서 실패하면 시험을 고치지 말고 멈춰서 보고합니다. 다른 곳의 예로는 스키마 오류와 `find`가 `null`을 돌려주는 경우가 있습니다.
3. 제품 `7eb383005`(현재 머리)에서 같은 시험이 통과해야 합니다.
4. **기록.**
   - `b7-results.md:422` 문단을 실제 결과로 바꿉니다. 문단에는 "행마다 후보 이름을 두어 `remove(0)`이 옛 행을 다른 tuple 청사진으로 이전하게 했다"는 사실, 수정 전 받은 값, 수정 뒤 통과를 적습니다.
   - `raw/b7/fail-first.json:222-228`의 `additionalCharacterization`을 `failures`와 같은 구성의 실패 기록으로 바꿉니다. 시험 이름, 기대값, 받은 값을 적고 `passedBeforeFix`를 `false`로 둡니다.
5. **검증 명령.** 각각 단독 Bash 호출로 실행합니다.

   ```sh
   yarn --cwd <worktree> workspace @canard/schema-form test --run --project unit src/core/surface/__tests__/surface.clearing-array-keep.test.ts
   yarn --cwd <worktree> workspace @canard/schema-form lint
   ```

### P3-1 수정 B — 대안, 이름과 기록만 바로잡습니다

조정자가 시험 실행 주기를 더하지 않기로 정한 경우에 씁니다.

1. 시험 이름을 `keeps a write through a candidate of a perished tuple row off the compacted survivor`로 바꿉니다. 본문은 그대로 둡니다.
2. `b7-results.md:422` 문단을 다음으로 바꿉니다: "추가 시험 `keeps a write through a candidate of a perished tuple row off the compacted survivor`의 tuple에는 후보 이름이 없으므로, `remove(0)`은 옛 행을 이전하지 않고 새로 만듭니다. 옛 후보의 칸은 옛 경로에 남고, 지움 압축 뒤 그 색인에는 생존 행이 없으므로 생존 행에 쓰지 않음을 확인합니다. `restoreTransferredSlotSource`의 이전 복제는 목적지의 비활성 슬롯에 놓이므로 같은 소멸 재귀가 닿지만, 이 경로를 실행하는 시험은 없으며 코드 읽기로만 확인했습니다."
3. `raw/b7/fail-first.json:222-228`을 고칩니다. `name`은 새 이름으로 바꾸고, `"transfersCandidate": false`를 더합니다. `note`는 다음 문장으로 바꿉니다: "The tuple has no multi-candidate slot, so applyArraySlots does not transfer the old row; the candidate keeps its old path, which lies past the only survivor. restoreTransferredSlotSource coverage rests on code reading."

### P3-2 수정 — 비용 문장

1. `src/core/engine/settle/DETAIL.md:21`의 "Discard visits only that discarded item's children owned by the item and its inactive slots, adding one WeakMap entry per visited occurrence; those subtrees were already visited by policy evaluation in the same settlement."를 다음 문장으로 바꿉니다: "Discard walks the discarded item's retained subtree once, following children owned by each occurrence and its inactive slots, and adds at most one WeakMap entry per visited occurrence; it runs only when a compaction discards an item, and its work is bounded by that subtree, which can include items of a nested clearing array without kept descendants that policy evaluation skips."
2. `architecture/verification/branch-switch/b7-results.md:416`의 "그 서브트리는 같은 정착의 정책 판단이 이미 방문한 범위입니다."를 다음 문장으로 바꿉니다: "순회 범위는 버려진 아이템이 보유한 서브트리 전체이며, 정책 판단이 건너뛰는 keep 없는 중첩 지움 배열의 아이템도 포함합니다."
3. 문서만 바뀌므로 lint만 다시 실행합니다(위 명령).

## 확인하지 못한 것

- 시험, typecheck, lint, build를 실행하지 않았습니다(지시). 이전 P2의 해결은 추적과 `raw/b7/fail-first.json`의 `candidate6` 기록에 근거하며, 재현하지 않았습니다.
- 수정 A의 시험 스키마가 실제로 `candidateMoves`를 켜고 예측한 받은 값으로 실패하는지는 실행하지 않았습니다. 특히 tuple 행 안의 `allOf` 후보와 상대 경로 `./kind`가 그대로 빌드되는지가 확인되지 않았습니다. 그래서 명세에 멈춤 조건을 넣었습니다.
- tuple 시험에서 생존 범위 밖 색인 1에 남은 patch가 나중에 행을 추가할 때 드러나는지는 추적하지 않았습니다. 이는 B7 이전부터의 배열 동사 규칙에 속합니다.
- 정착이 소멸 표시 뒤에 되돌려질 수 있는지는 평가하지 않았습니다. WeakMap 표시는 reset 뒤에도 남습니다. 이 성질은 수정 전의 `discard`와 `transfer`도 같았습니다.
- `inactiveSlotBaselines`에 잠시 남는 원본은 부모 사슬 논증으로만 다뤘습니다.
- 작업자가 보고한 관문 수치는 재현하지 않았습니다. 여기에는 unit 3,855사례, 다섯 프로젝트 합계, 보고서 해시, 배달 72장면·430관측점 차이 0건, 공개 `dist/index.d.ts` 해시가 들어갑니다. raw JSON은 기계 로컬 경로만 검사했습니다.
- `aa0945e8a`는 범위 밖입니다. `src` 변경이 없다는 것만 확인했습니다.
