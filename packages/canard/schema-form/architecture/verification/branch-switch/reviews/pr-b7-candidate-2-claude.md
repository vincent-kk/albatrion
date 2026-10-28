# B7 후보 2 delta 재검토 — 압축 뒤 쓰기 주소, keep 선언 플래그, 문서

검토 대상은 `branch-switch-b7` worktree의 `fae1785dc..54cae86ca` 차분입니다. 차분은 시험 커밋 `27f17c412`, 수정 커밋 `d86bf1bdd`, 문서 커밋 `54cae86ca`로 이루어지며, 차분이 건드린 파일도 함께 읽었습니다. 지시에 따라 시험·빌드는 실행하지 않았고, 모든 동작 판단은 코드 추적에 근거합니다. 아래 경로는 `packages/canard/schema-form/` 기준입니다. `settle/`은 `src/core/engine/settle/`, `blueprint/`는 `src/core/engine/blueprint/`를 뜻합니다.

## 판정

**FAIL** — 이전 P1은 일부만 해결되었습니다. 버려진 아이템 아래에서 목록보다 먼저 따로 나간 자손은 자기 쓰기 주소 칸을 가지므로 소멸 표시를 보지 못합니다. 그래서 그 옛 참조의 쓰기가 같은 색인으로 압축된 생존 아이템의 keep 값을 덮어씁니다(새 결함 1, 코드 추적으로 확인했고 실행하지는 않았습니다). 나머지 P2 다섯 건은 해결되었거나 올바르게 반박되었고, 새로 생긴 다른 P1이나 P2는 없습니다.

## 이전 결함별 상태

1. **[P1] 압축 뒤 옛 참조 쓰기 — 부분 해결(남은 구멍은 새 결함 1).**
   - **해결된 부분:** 생존 아이템은 `settle/utils/slots/cloneSlotSubtree.ts:38-39`에서 배열 이동과 같은 "transfer 다음 retain" 순서로 새 색인의 칸을 얻습니다. 40행에서는 그 칸을 사적 복제본과 공유합니다. 칸이 없던 자손의 옛 참조는 `settle/utils/detached/DetachedWriteAddress.ts:86-95`의 조상 탐색으로 생존 아이템의 새 칸을 찾습니다. 버려진 아이템은 `cloneSlotSubtree.ts:71-72`에서 소멸 칸을 받고, `settle/utils/write/writeFieldNode.ts:93`이 그 쓰기를 버립니다.
   - **모든 압축 경로에 적용되는지:** 최상위 배열의 나감, 객체 호스트 아래 배열의 나감, 중첩 압축에서 같은 규칙이 적용됩니다. 이미 비활성인 압축 배열이 다시 나갈 때도 적용됩니다. 생존 아이템의 부모가 압축 계획의 키인 압축 복제본이기 때문입니다. 바깥 배열이 이동하면 `rekeySlotWriteAddresses`가 압축 복제본의 `inactiveSlots`를 따라 생존 아이템의 칸을 옮깁니다. 재진입 복제는 칸을 만들지 않습니다. 재진입 뒤의 옛 참조 쓰기는 경로가 살아 있으면 `hasLivePathKind`가 버리며, 이는 기준선 동작입니다. 닫힌 동안 생존 아이템의 옛 참조에 쓴 값은 재진입 뒤 같은 아이템에 나타납니다(`src/core/surface/__tests__/surface.clearing-array-keep.test.ts:212`).
   - **소멸 칸의 누수:** 칸은 옛 노드를 키로 하는 WeakMap에 있습니다. 압축 계획은 호출마다 새로 만드는 정착 맥락의 필드이므로, 정착 뒤에는 엔진이 버려진 노드를 강하게 참조하지 않습니다. 소멸 표시는 지워지지 않으므로 그 옛 참조는 재진입 뒤에도 쓰지 않으며, 이는 기준선과 충돌하지 않습니다. 되돌리기(`restoreSourceB`, `withdrawDetachedFills`)는 `finalizeExits`의 압축보다 먼저 실행되므로 표시가 남은 채 되돌려지는 경우도 없습니다.
   - **공표에 주는 영향:** 쓰기 주소 칸을 읽는 곳은 `writeFieldNode`와 `readSourceTree`뿐입니다. 따라서 `inactiveValues` 공표는 영향을 받지 않습니다.
   - **생존 아이템이 없는 배열:** 압축 계획이 없으므로(`settle/utils/slots/createClearedArrayOverlay.ts:80`) 소멸 표시도 없고 기준선 동작을 따릅니다. 작업자의 설명과 같습니다. 결정 문구와의 범위 차이는 새 결함 7에 적었습니다.
2. **[P2] keep 없는 지움 배열이 모든 아이템을 방문함 — 해결.**
   - `blueprint/utils/features/markKeepDescendants.ts`는 청사진을 구축할 때 노드마다 선언을 한 번 읽습니다. 선언이 있을 때만 역방향 그래프를 만들어 조상에 표시를 전파합니다.
   - 선언의 분류는 실제 정책 해석과 같습니다. node 범위 선언은 그 노드 자신을 다스립니다(`settle/utils/controls/getControlLayers.ts:54`). fragment 범위 선언과 `controls.fields`는 직접 자식만 다스립니다(`settle/utils/controls/prepareParentControlLayers.ts:38-42`). 따라서 아이템 자손, 아이템 자신, `controls.fields`, 모든 조상, 재귀 간선이 모두 표시됩니다.
   - `settle/utils/slots/createExitSlotOverlay.ts:51-64`의 지름길은 기준 `0b9337cd9`의 상수 overlay와 같은 값을 돌려줍니다. 기준에서는 후보 소유 배열이 일반 경로를 탔지만, 그 경우에도 결과는 슬롯을 남기지 않는 것으로 같습니다.
   - 호출 수 시험(`settle/__tests__/settle.retained-slot-array-compaction.test.ts:324`)은 아이템 7개에서 1회를 고정합니다. `fae1785dc`에서는 1 + 7 × 3 = 22회이므로 실패 먼저 기록과 맞습니다.
   - 재귀 시험이 재귀 간선을 실제로 고정하지 못하는 점은 새 결함 3에 적었습니다.
3. **[P2] 사적 복제 범위와 DETAIL — 해결.** `settle/DETAIL.md:27`은 네 가지를 적고, 모두 코드와 맞습니다. 나간 최상위 서브트리 전체를 복제합니다. 압축 배열 아래에는 생존 아이템만 결합합니다. 복제 비용과 보유 메모리는 노드 수에 비례합니다. `retainedItemNames`를 조회하는 복원 비용은 n의 제곱에 비례합니다.
4. **[P2] 비어 있는 keep 배열 — 올바르게 반박.**
   - `createExitSlotOverlay.ts:89-93`의 원본 판정은 "지우지 않음, 그리고 raw 정의·extras 정의·배열 중 하나"입니다. 명시 `unsetOnInactive: false`인 배열은 `readSlotExitPolicy`가 keep을 돌려주므로 `clear`가 거짓입니다. 그래서 raw가 undefined이고 아이템이 0개여도 원본입니다.
   - 명시 keep이 없는 배열은 지움 배열 아래에서 지움을 상속하므로 51행이나 65행의 배열 분기로 갑니다. 그 분기에서는 생존 아이템이 있을 때만 원본이 됩니다(`hasSource = itemCount !== 0`). 따라서 keep 없는 배열이 아이템을 살리는 결함은 없습니다.
   - 시험(`settle.retained-slot-array-compaction.test.ts:295`)은 재진입 길이 2와 값 `[{}, {}]`를 단언합니다. 이는 "남는 것이 맞다"는 조정자 결정과 일치합니다. 결정 문서의 전제, 곧 빈 배열은 정의된 raw라는 말은 코드상 틀렸고, 작업자의 정정이 맞습니다.
5. **[P2] 도우미 배치 — 해결.** 두 도우미는 `settle/utils/slots/`의 평평한 파일이 되었습니다. 함수 이름을 딴 디렉터리는 저장소에도 디스크에도 남아 있지 않습니다. 옛 경로는 측정 원자료 `architecture/verification/branch-switch/raw/b7/stage-inputs.json:2258-2259`에만 남아 있습니다. 이는 후보 1의 측정 입력 기록이므로 그대로 두는 것이 맞습니다.
6. **[P2] 후보 종류와 색인 이동 시험 — 해결.** `settle.retained-slot-array-compaction.test.ts:251`은 후보 소유 배열에서 색인 2의 아이템이 색인 0으로 옮겨지는 경우를 다룹니다. 단언 대상은 닫힌 동안의 `inactiveValues` 경로, 재진입 값, 종류 전환 뒤 값입니다. 다만 한 색인에 두 종류가 모두 보존된 채 색인이 옮겨지는 경우는 고정하지 않습니다(확인하지 못한 것 참조).
7. **[P3] 비활성 후보에 활성 나감 입력을 넘김 — 해결.** `createClearedArrayOverlay.ts:58`은 활성 구조의 아이템에만 `context`를 넘깁니다. 이는 객체 경로(`createExitSlotOverlay.ts:97-138`)와 같습니다.
8. **[P3] 실패 먼저 기록의 이름 — 해결.** `passingControls`의 세 이름은 `it.each` 보간 결과를 포함해 실제 시험 제목과 일치합니다. 기준에 대입하지 않은 시험 파일은 `notSubstitutedOnBaseline`에 적혀 있습니다.
9. **[P3] 배달 비교의 공백 — 해결.** 결과 문서 후보 2 절의 결함 표 9행에 알려진 공백으로 적혀 있습니다.
10. **[P3] fixture 가져오기와 제곱 비용 — 해결.** 가져오기는 형제 시험과 같은 별칭으로 바뀌었습니다. 제곱 비용은 DETAIL과 결과 문서의 비용 문장에 적혀 있습니다.

**규칙 점검:** 새 파일은 각각 내보내기가 하나이고, 새 내보내기와 필드에는 영어 TSDoc이 있습니다. `as any`와 `as never`는 차분에 없습니다. 네이티브 `Array.isArray`와 `Object.prototype.hasOwnProperty` 호출, 기계 로컬 경로도 차분에 없습니다. 예외는 새 결함 2(도우미 길이)와 새 결함 4(문서 문구)입니다.

## 새 결함

심각도 표기는 P1 결함, P2 고쳐야 함, P3 사소함입니다.

### 1. [P1, 이전 P1의 잔여] 먼저 나간 자손의 옛 참조는 소멸 표시를 보지 못하고 다른 행에 씁니다

- **위치:** `settle/utils/detached/DetachedWriteAddress.ts:84-85`(자기 칸이 있으면 조상을 보지 않고 바로 반환합니다). `settle/utils/slots/retainExitedSlot.ts:28-35`(나가는 모든 최상위 노드에 칸을 만들며, 호출은 `settle/utils/transition/finalizeExits.ts:96-104`입니다). `settle/utils/slots/cloneSlotSubtree.ts:71-72`(소멸 표시는 버려진 아이템 자신의 칸에만 붙습니다).
- **무엇이 틀렸나:** 아이템 안의 필드가 목록보다 먼저 따로 나가면, 그 필드의 옛 노드는 자기 칸을 얻습니다. Form 기본값에서는 그 필드가 아이템의 `inactiveSlots`에 그대로 보존됩니다. 목록이 지움과 함께 나가 그 아이템이 버려지면, 소멸 표시는 아이템의 칸에만 붙습니다. 필드의 옛 참조를 읽으면 `read`가 자기 칸을 먼저 찾으므로 조상의 소멸 표시를 보지 않습니다. 그래서 쓰기는 옛 경로 `/list/0/keep`으로 `writeSlotPath`에 갑니다. 그 경로는 이제 압축된 색인 0, 곧 원래 1번 생존 아이템을 가리킵니다.
- **실패 장면(추적):**
  1. `surface.clearing-array-keep.test.ts` 첫 시험과 같은 스키마와 값을 씁니다. keep은 `active: '#/show'`이고 `unsetOnInactive: false`입니다.
  2. `/list/0/keep`의 옛 참조를 잡습니다.
  3. `show`를 false로 바꾸고, 이어서 `open`을 false로 바꿉니다.
  4. 잡아 둔 참조에 5를 씁니다. 0번 아이템은 keep raw가 없어 버려졌고, 원래 1번 아이템이 색인 0으로 압축되어 있습니다. 쓰기는 그 생존 아이템의 비활성 keep 원본에 overlay 5로 떨어집니다.
  5. 다시 열고 `show`를 true로 바꾸면 기대값 `[{ keep: 12 }, { keep: 24 }]` 대신 `[{ keep: 5 }, { keep: 24 }]`가 나옵니다.

  이 결과는 조정자 결정과 어긋납니다. 결정은 "버려진 아이템에 대한 쓰기는 그 색인을 차지한 아이템에 적용하지 않는다"입니다. `settle/DETAIL.md:17`의 "or at a descendant of them"과도 어긋납니다. 새 시험 두 건은 자기 칸이 없는 자손(`/list/0/drop`)과 아이템 자신(`/list/2`)만 다루므로 이 경로를 잡지 못합니다.
- **왜 중요한가:** 이미 비활성인 keep은 계약의 주요 변형입니다(첫 시험의 `inactive=true`). 숨겨진 행 필드의 디바운스된 입력이 목록이 닫힌 뒤에 도착하면, 다른 행의 보존 값이 소리 없이 바뀝니다. 이전 P1과 같은 실패입니다.
- **고치는 방법:** 아래 수정 명세 1을 따릅니다.

### 2. [P3, 확인] `hasKeepFields` 도우미가 8줄 예산을 넘습니다

- **위치:** `blueprint/utils/features/readKeepDeclarations.ts:46-58`.
- **무엇이 틀렸나:** 이 도우미의 본문은 11줄입니다. 작업 지시와 `seiri_function-boundaries` 3절의 예산은 도우미마다 8줄 이하입니다.
- **고치는 방법:** 수정 명세 2를 따릅니다.

### 3. [P3, 확인] 재귀 템플릿 시험이 재귀 간선을 고정하지 못합니다

- **위치:** `blueprint/utils/features/__tests__/markKeepDescendants.test.ts:83-92`.
- **무엇이 틀렸나:** 루트에는 keep을 선언한 직접 자식 `keep`이 있습니다. 그래서 루트의 표시는 재귀 간선이 없어도 참이 됩니다. 재귀 간선으로만 참이 되는 값은 `children` 배열 템플릿의 표시인데, 시험은 이 값을 단언하지 않습니다. 기록된 "플래그 계산을 끄고 실패를 확인했다"는 확인은 재귀 처리를 증명하지 못합니다. 코드 자체는 추적상 맞습니다. `collectTemplateParents`가 아이템 간선을 포함하므로 `children`도 표시됩니다.
- **고치는 방법:** 수정 명세 3을 따릅니다.

### 4. [P3, 확인] DETAIL 문구가 현재 명세가 아니거나 과장되어 있습니다

- **위치:** `settle/DETAIL.md:25`의 "overlay 방문 수는 기존과 같고"와 `settle/DETAIL.md:328`의 "각각 기존과 같다"는 변경 전과 비교하는 문구입니다. `blueprint/DETAIL.md:29`의 "graphs without a keep declaration allocate nothing"은 정확하지 않습니다. `readKeepDeclarations`가 템플릿마다 결과 객체 하나를 만들기 때문입니다.
- **고치는 방법:** 수정 명세 4를 따릅니다.

### 5. [P3, 추적상 가능] `readSourceTree`가 소멸 주소의 경로를 그대로 씁니다

- **위치:** `settle/utils/slots/readSourceTree.ts:31-36`.
- **무엇이 틀렸나:** 버려진 아이템 아래의 중첩 배열을 옛 참조로 `push`·`remove`·`update`하는 경우입니다. 이때 `arrangeFieldNodeItems`가 이 함수로 현재 원본을 읽습니다. 소멸 주소에는 검사 없이 경로가 쓰입니다. 그 경로는 아이템에 원래 칸이 없었으면 빈 접두사(`''`)이고, 있었으면 옛 색인입니다. 쓰기 자체는 버려지지만, 반환값(길이, 지운 값, 갱신 값)이 그 색인을 차지한 다른 행에서 계산될 수 있습니다. 다른 행에서 계산되는 경우는 버려진 아이템이 원래 칸을 가졌던 경우, 예를 들어 비활성 후보 종류였던 경우에만 생깁니다.
- **고치는 방법:** 수정 명세 5를 따릅니다.

### 6. [P3, 기존 장치의 한계] 생존 아이템에서 지워진 채 나간 자손의 칸은 옛 색인에 남습니다

- **위치:** `settle/utils/slots/cloneSlotSubtree.ts:81-119`(보존된 슬롯과 자식만 칸을 옮깁니다)와 `settle/utils/slots/rekeySlotWriteAddresses.ts:15-42`(배열 이동도 같습니다).
- **무엇이 틀렸나:** Form 수준 `unsetOnInactive: true`처럼 자손이 따로 나갈 때 지워지는 설정에서는, 그 자손이 슬롯으로 보존되지 않습니다. 그래서 그 칸은 어떤 그래프에서도 닿지 않고 옛 경로에 남습니다. 원래 1번 생존 아이템의 그런 자손 옛 참조는 압축 뒤 색인 1, 곧 원래 3번 생존 아이템에 씁니다. 이는 "다른 생존 아이템에 떨어지지 않는다"는 결정과 어긋납니다. 그러나 같은 한계가 기준선의 배열 이동에도 있으므로, 이번 차분이 만든 결함은 아닙니다.
- **고치는 방법:** 결정이 필요합니다. 수정 명세 1은 버려진 아이템 쪽만 막고 이 경우는 막지 않습니다. 이 PR에서 다루지 않는다면 `settle/DETAIL.md:17`에 "보존되지 않은 채 먼저 나간 자손의 칸은 배열 이동과 마찬가지로 옮기지 않는다"를 적어야 합니다.

### 7. [P3, 결정 확인] 생존 아이템이 없는 배열에서는 버려진 아이템의 쓰기가 기준선 경로로 갑니다

- **위치:** `createClearedArrayOverlay.ts:80`(계획은 생존 아이템이 있을 때만 생깁니다)과 `createExitSlotOverlay.ts:51-64`(지름길).
- **무엇이 틀렸나:** 조정자 결정의 문구는 "생존하지 못한 아이템에 대한 쓰기는 효과가 없다"입니다. 그러나 구현은 생존 아이템이 하나 이상인 배열에서만 그 쓰기를 버립니다. keep 선언이 없거나 모든 아이템이 버려진 배열에서는, 옛 참조 쓰기가 기준선대로 그 경로의 잠재 쓰기가 됩니다. 결과 문서에는 이 범위가 적혀 있고, DETAIL 17행도 압축에 한정해 말합니다. 그러므로 코드와 문서는 서로 맞습니다. 결정의 범위가 이것이 맞는지만 조정자가 확인하면 됩니다.

## 수정 명세

### 수정 1 — 조상의 소멸 표시를 자기 칸보다 먼저 존중합니다(새 결함 1)

1. `src/core/engine/settle/utils/detached/DetachedWriteAddress.ts`의 `read`에서 84-85행

   ```ts
       const own = cells.get(node);
       if (own) return own;
   ```

   을 다음으로 바꿉니다.

   ```ts
       const own = cells.get(node);
       if (own) {
         if (own.discarded) return own;
         for (let parent = node.parent; parent; parent = parent.parent)
           if (cells.get(parent)?.discarded) return { ...own, discarded: true };
         return own;
       }
   ```

2. 같은 메서드의 `@returns`를 다음으로 바꿉니다. "Its cell, an address relative to a captured ancestor, or undefined; marked discarded when the occurrence or any ancestor did not survive a compaction"
3. 안전한 이유는 이렇습니다. 버려진 아이템 아래 노드의 고정된 부모 사슬은 항상 그 아이템의 원래 노드를 지나고, 그 노드의 칸에는 `discard`가 표시를 붙였습니다(`cloneSlotSubtree.ts:71-72`). 생존 아이템과 그 복제본의 사슬에는 버려진 조상이 없습니다. 비용은 분리된 노드의 쓰기와 읽기에서 조상마다 WeakMap 조회 한 번입니다.
4. 검증 시험을 `src/core/surface/__tests__/surface.clearing-array-keep.test.ts` 끝에 더합니다.

   ```ts
   it('drops a write through an already inactive descendant of a discarded item', () => {
     const { root } = makeFieldNodeTree({
       type: 'object',
       properties: {
         open: { type: 'boolean' },
         show: { type: 'boolean' },
         list: {
           type: 'array',
           controls: { active: '#/open', unsetOnInactive: true },
           items: {
             type: 'object',
             properties: {
               drop: { type: 'number' },
               keep: {
                 type: 'number',
                 controls: { active: '#/show', unsetOnInactive: false },
               },
             },
           },
         },
       },
     });
     root.setValue({
       open: true,
       show: true,
       list: [{ drop: 1 }, { drop: 2, keep: 12 }, { drop: 3 }, { keep: 24 }],
     });
     const emptyKeep = root.find('/list/0/keep')!;
     root.find('/show')!.setValue(false);
     root.find('/open')!.setValue(false);
     emptyKeep.setValue(5);
     root.find('/open')!.setValue(true);
     root.find('/show')!.setValue(true);
     expect(root.find('/list')!.value).toEqual([{ keep: 12 }, { keep: 24 }]);
   });
   ```

5. 이 시험은 `54cae86ca`에서 실패해야 합니다. 추적상 값은 `[{ keep: 5 }, { keep: 24 }]`입니다. 수정 뒤에는 통과해야 합니다. 그다음 B7 시험 다섯 파일과 `src/core/surface/__tests__/detached.test.ts`를 실행합니다. 마지막으로 `raw/b7/fail-first.json`과 결과 문서의 결함 1 행에 이 시험 이름을 더합니다.

### 수정 2 — 도우미 분리(새 결함 2)

1. `blueprint/utils/features/readKeepDeclarations.ts:41-58`의 `hasKeepFields`를 새 파일 `src/core/engine/blueprint/utils/features/hasKeepFields.ts`의 `export const hasKeepFields`로 옮깁니다. TSDoc은 그대로 둡니다. 새 파일에는 `isArray`(`@winglet/common-utils/filter`), `CONTROL_KEY`, `SCHEMA_GROUP`, `isKeepControls`를 가져옵니다.
2. `readKeepDeclarations.ts`에 `import { hasKeepFields } from './hasKeepFields';`를 더합니다. 이 파일에서 쓰이지 않게 된 `isArray`와 `CONTROL_KEY` 가져오기는 지웁니다.
3. 검증은 typecheck, lint, `markKeepDescendants.test.ts` 실행입니다.

### 수정 3 — 재귀 간선 단언(새 결함 3)

1. `markKeepDescendants.test.ts`의 91행 다음에 아래 단언을 더합니다.

   ```ts
       expect(
         analysis.root.childEntries.find((entry) => entry.name === 'children')!
           .node.hasKeepDescendants,
       ).toBe(true);
   ```

2. 검증: 이 단언은 지금 통과해야 합니다. `collectTemplateParents.ts:16-17`의 아이템 간선 등록을 잠시 지우면 실패해야 하며, 확인한 뒤에는 되돌립니다.

### 수정 4 — 문서 문구(새 결함 4)

1. `settle/DETAIL.md:25`의 "지움 없는 나감과 배열 자손이 없는 객체 호스트의 overlay 방문 수는 기존과 같고,"를 "지움 없는 나감과 배열 자손이 없는 객체 호스트는 압축 경로를 타지 않으므로 아이템 방문이 더해지지 않고,"로 바꿉니다.
2. `settle/DETAIL.md:328`의 "keep 선언이 없는 지움 배열과 객체 지움, 지움 없는 배열의 overlay 방문 수는 각각 기존과 같다."를 "keep 선언이 없는 지움 배열은 아이템 수와 무관하게 배열 하나만 방문하고, 객체 지움과 지움 없는 배열은 압축 경로의 추가 방문이 없다."로 바꿉니다.
3. `blueprint/DETAIL.md:29`의 "allocate nothing"을 "build no reverse graph"로 바꿉니다.

### 수정 5 — 소멸 주소의 읽기(새 결함 5)

1. `settle/utils/slots/readSourceTree.ts`의 분리 분기(27-42행)를 고칩니다. 첫 줄에서 `const address = DetachedWriteAddress.read(node);`를 계산합니다. `address?.discarded`이면 `return readSlotRawTree(node.blueprintNode, node, undefined);`로 그 노드의 고정 값만 읽습니다. 아니면 `resolveSlotSource`에 `address?.path ?? node.path`를 넘깁니다.
2. 검증은 typecheck와 B7 시험 다섯 파일, 그리고 `settle/arrangeFieldNodeItems/__tests__/` 실행입니다.

## 확인하지 못한 것

- 시험, typecheck, lint, build를 실행하지 않았습니다(지시). 새 결함 1, 5, 6의 동작은 코드 추적으로만 확인했습니다. 수정 1의 시험이 첫 실행 증거가 됩니다.
- 작업자가 보고한 실패 먼저 결과와 표적 시험 182파일·1309사례 통과를 재현하지 않았습니다.
- 한 색인에 두 후보 종류가 모두 보존된 채 색인이 옮겨지는 경우는 고정하는 시험이 없고, 추적하지도 않았습니다. 이 경우는 `createClearedArrayOverlay.ts:49-77`의 반복에서 두 종류가 모두 생존하는 경우입니다.
- 생존 아이템이 없는 배열에서 버려진 아이템의 옛 참조 쓰기가 재진입 뒤 행을 되살리는지는 끝까지 추적하지 않았습니다(새 결함 7).
- 재진입 뒤 살아 있는 배열이 다시 재배열되는 경우가 있습니다. 이때 칸이 없던 자손의 옛 참조는 조상 상대 주소이므로 그 이동을 따라가지 않습니다. 객체 호스트에도 있는 기준선 모델이라 이번 범위 밖으로 판단했지만, 실행으로 확인하지는 않았습니다.
- B6 rebase 뒤의 상태는 확인하지 못했습니다. B6이 `writeSlotPath`의 경로 분할을 바꾸므로 새 결함 1의 재현 경로가 달라질 수 있습니다.
- 성능은 측정하지 않았습니다. 일부 청사진 노드에만 선택 필드가 생기는 형상 변화와, 후보와 keep이 함께 있을 때 역방향 그래프를 두 번 만드는 비용이 측정 대상입니다. 이는 측정 실행기의 몫입니다.
