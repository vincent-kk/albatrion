# B7 후보 4 delta 재검토 — 포착 조상 위의 소멸 표시, 후보 2 기록 복원

검토 대상은 `branch-switch-b7` worktree의 `057dea82d..22f88424a` 차분입니다. 차분은 시험 커밋 `0e7567dba`, 수정 커밋 `8b00444c5`, 문서 커밋 `22f88424a`로 이루어집니다. 지시에 따라 시험·빌드·typecheck·lint는 실행하지 않았고, 모든 동작 판단은 코드 추적에 근거합니다. 아래 경로는 `packages/canard/schema-form/` 기준이며, `settle/`은 `src/core/engine/settle/`을 뜻합니다.

검토 도중 worktree 머리가 `941398ea7`로 rebase되었습니다. `git range-diff`로 세 커밋이 rebase 뒤에도 패치 단위로 같음을 확인했습니다(`991ee870f`, `f32bccfb9`, `941398ea7`). 아래 결론이 기대는 파일은 두 머리에서 같습니다. 그 파일은 `DetachedWriteAddress.ts`, `cloneSlotSubtree.ts`, `createClearedArrayOverlay.ts`, `retainExitedSlot.ts`, `createExitSlotOverlay.ts`, `readSlotExitPolicy.ts`, `readDepartingAncestorPolicy.ts`, `getSlotSource.ts`, `getSlotEntries.ts`입니다. 줄 번호는 `22f88424a` 기준입니다.

## 판정

**FAIL** — 후보 4의 차분은 수정 명세를 글자 그대로 구현했고, 이전 P1과 P3은 해결되었습니다. 그러나 B7이 도입한 사적 나감 복제본은 원래 노드를 복제 노드의 쓰기 칸에 연결하지 않습니다. 그래서 이미 비활성인 목록이 나중에 지우는 조상과 함께 압축되면, 버려진 행의 옛 참조 쓰기가 생존 행에 떨어지고 생존 행의 옛 참조 쓰기는 사라진 옛 색인으로 갑니다(새 결함 1, 추적으로 확인했고 실행하지 않았습니다).

## 이전 결함별 상태

1. **[P1] 조상 분기가 가장 가까운 포착 조상에서 멈춤 — 해결.**
   - `settle/utils/detached/DetachedWriteAddress.ts:92-104`는 명세의 코드와 같습니다. 경로와 순서는 가장 가까운 칸에서 계산하고, 95-97행이 그 위의 부모 사슬 끝까지 소멸 칸을 찾습니다.
   - **일반 경우는 그대로입니다.** 생존 아이템 아래 자기 칸의 분기(86-90행)는 바뀌지 않았습니다. 생존 아이템 아래에서 따로 나간 자손의 하위 노드는 가장 가까운 칸, 곧 옮겨진 자손 칸에서 경로를 얻습니다. 그 위 사슬에는 생존 아이템의 칸과 목록 칸만 있고, 둘 다 소멸 칸이 아닙니다. 소멸 칸은 `settle/utils/slots/cloneSlotSubtree.ts:71-72`에서 버려진 원본에만 붙습니다. 따라서 결과는 후보 3과 같습니다.
   - **읽기와 쓰기는 같은 판단을 합니다.** `settle/utils/slots/readSourceTree.ts:27-30`과 `settle/utils/write/writeFieldNode.ts:91-93`은 같은 `read`를 호출합니다. 그래서 같은 경로에서 소멸 여부가 서로 어긋나지 않습니다.
   - 소멸 칸을 찾기 전까지 조상 깊이만큼 WeakMap 조회가 더해집니다. 이 비용은 결과 문서의 후보 3 비용 문장(298행)에 적혀 있습니다.
2. **새 실패 먼저 시험 — 명세와 일치.** `src/core/surface/__tests__/surface.clearing-array-keep.test.ts:270-313`은 명세의 스키마, 값, 단계, 기대값과 같습니다. `raw/b7/fail-first.json`의 `candidate4`는 기준 `057dea82d`, 시험 이름, 받은 값 `[{ group: { keep: 5 } }, { group: { keep: 24 } }]`을 담습니다. 이 받은 값은 이전 검토의 추적과 같습니다. 1건 실패와 7건 제외는 이 파일의 시험 수 8과 맞습니다.
3. **[P3] 문서 — 해결.**
   - `settle/DETAIL.md:17`의 문장은 명세대로 바뀌었습니다.
   - `architecture/verification/branch-switch/b7-results.md`의 296행과 298행 문장은 명세대로 바뀌었고, 후보 3 결함 표 1행(284행)에 새 시험 이름이 더해졌습니다.
   - 후보 2 절(212-273행)은 `54cae86ca`의 212-270행과 글자 단위로 같습니다. 유일한 차이는 다음 절 앞의 빈 줄 하나입니다. 그 뒤에 후보 3 절(274행)과 후보 4 절(339행)이 차례로 옵니다.
4. **규칙 — 위반 없음.** 새 도우미 함수가 없습니다. `read`의 영어 TSDoc `@returns`는 바뀐 동작과 맞습니다. DETAIL 문장은 현재 명세의 형태입니다. 추가된 줄에 기계 로컬 경로, `as any`, `as never`가 없습니다. 추가된 줄의 "변경 전과" 두 건은 명세가 원문 그대로 복원하라고 한 후보 2 기록 안에 있으므로 결함이 아닙니다.

## 새 결함

심각도 표기는 P1 결함, P2 고쳐야 함, P3 사소함입니다.

### 1. [P2, 추적] 사적 나감 복제본이 원래 노드를 복제 노드의 칸에 연결하지 않아, 나중의 압축이 원래 참조를 옮기지도 버리지도 못합니다

- **위치:** `settle/utils/slots/cloneSlotSubtree.ts:38-39`. 원래 노드에 칸을 연결하는 조건은 "원래 노드의 부모가 이번 나감에서 압축되는 배열"뿐입니다.
- **원인 사슬(코드로 확인):**
  1. `settle/utils/slots/retainExitedSlot.ts:56-66`은 나감 안에 압축되는 배열이 하나라도 있으면 나간 서브트리 전체를 사적으로 복제해 보관합니다. 이 장치는 B7 커밋 `873636403`이 도입했습니다. 그 전에는 원래 노드를 그대로 보관했으므로 이 결함은 B7이 만든 것입니다.
  2. 복제 중 `cloneSlotSubtree.ts:89-119`는 압축되지 않은 배열의 아이템도 복제합니다. 37행의 `transfer`는 원래 노드에 칸이 있을 때만 일하고, 38-39행은 부모가 압축 배열일 때만 원래 노드에 칸을 붙입니다. 그래서 그런 아이템과 그 자손의 원래 노드에는 칸이 없고, 복제 노드만 40행에서 새 칸을 받습니다.
  3. 나중에 조상이 지움과 함께 나가면 `settle/utils/slots/createExitSlotOverlay.ts:119-131`이 이미 비활성인 그 복제본을 다시 판단합니다. 명시 정책이 없는 배열은 `settle/utils/slots/readSlotExitPolicy.ts:18-32`에서 상속값을 쓰고, `cloneSlotSubtree.ts:61-62`는 "명시 정책 없음"을 복제본에 그대로 복사합니다. 첫 나감에서 Form 기본값 false(`settle/utils/transition/readDepartingAncestorPolicy.ts:38`)를 상속해 압축되지 않던 목록이, 이번에는 지우는 조상의 true를 상속해 `createExitSlotOverlay.ts:65-75`에서 압축됩니다.
  4. 그 압축의 소멸 표시(`cloneSlotSubtree.ts:71-72`)와 생존 이동(37-40행)은 복제 노드의 칸에만 닿습니다. 사용자가 가진 원래 행 참조는 `DetachedWriteAddress.ts:92-104`에서 칸이 있는 가장 가까운 조상, 곧 목록의 칸까지 올라갑니다. 그 결과 옛 색인이 붙은 경로를 받고, 사슬에 소멸 칸이 없으므로 쓰기는 버려지지 않습니다.
  5. `settle/utils/slots/writeSlotPath.ts:38-128`은 그 경로 문자열로 압축된 복제본을 내려가, 그 색인을 지금 차지한 생존 행에 씁니다.
- **실패 장면(추적, 실행하지 않음):** 수정 명세 1의 시험이 이 장면입니다.
  1. `section`은 `controls: { active: '#/show', unsetOnInactive: true }`입니다. 그 안의 `list`는 `controls: { active: '#/open' }`만 가지고 정책은 상속합니다. 행은 `drop`, 명시 keep인 `keep`, 그리고 명시적 지움 배열 `tags`(아이템의 `keep`은 명시 keep)를 가집니다.
  2. 값은 `list: [{ drop: 1 }, { keep: 12, tags: [{ keep: 3 }] }]`입니다. `/section/list/0/drop`과 `/section/list/1/keep`의 옛 참조를 잡습니다.
  3. `open`을 false로 바꿉니다. 목록은 Form 기본값 false를 상속해 지우지 않습니다. 그러나 1번 행의 `tags`가 압축되므로 목록 전체가 사적으로 복제됩니다. 두 행의 원래 노드에는 칸이 없습니다.
  4. `show`를 false로 바꿉니다. 지우는 `section`이 이미 비활성인 목록 복제본을 다시 판단하고, 이번에는 상속값 true로 압축합니다. 0번 행은 보존할 원본이 없어 버려지고, 소멸 표시는 0번 행의 복제 노드 칸에만 붙습니다. 1번 행은 색인 0으로 옮겨지고, 그 이동도 복제 노드 칸에만 적용됩니다.
  5. 잡아 둔 두 참조에 각각 5와 13을 씁니다. 0번 행의 `drop` 참조는 목록 칸을 거쳐 `/section/list/0/drop`을 받고, 생존 행에 5를 씁니다. 1번 행의 `keep` 참조는 `/section/list/1/keep`을 받아 더는 없는 색인 1에 13을 씁니다.
  6. 다시 열면 기대값 `[{ keep: 13, tags: [{ keep: 3 }] }]` 대신, 첫 행에 `drop: 5`와 `keep: 12`가 나옵니다.
- **같은 원인의 다른 형태:** 목록 자체가 지움 배열이고, 행 안의 상속 정책 배열이 그 안의 명시적 지움 배열 때문에 먼저 사적으로 복제된 경우도 같습니다. 그 경우 행 안 배열이 목록의 지움 나감에서 압축될 때 같은 일이 생깁니다.
- **무엇과 어긋나나:** 조정자 결정은 "버려진 아이템에 대한 쓰기는 그 색인을 차지한 아이템에 적용하지 않는다"입니다. `settle/DETAIL.md:17`도 "never lands on the item that now occupies that index"라고 적습니다. 또한 `writes a survivor old reference to the same survivor after compaction` 시험이 고정한 생존 행 보장과도 어긋납니다.
- **왜 P2로 적었나:** 결과는 이전 두 P1과 같은 조용한 다른 행 쓰기입니다. 다만 필요한 형태가 더 좁습니다. 상속 정책을 쓰는 목록, 그 행 안에 생존 아이템이 있는 명시적 지움 배열, 목록이 먼저 닫힌 뒤 지우는 조상이 닫히는 순서, 그 뒤의 옛 참조 쓰기가 모두 필요합니다. 조정자가 이 형태를 흔하다고 판단하면 P1로 올려야 합니다.
- **고치는 방법:** 수정 명세 1을 따릅니다.

### 2. [P3, 추적] 쓰기 칸이 보유 그래프에서 이미 떨어진 옛 참조는 소멸 표시를 받지 못하는데, DETAIL은 버려진 아이템 전체에 대해 보장합니다

- **형태 A — 지워진 채 먼저 나간 후보:** `retainExitedSlot.ts:28-35`는 정책 판단 전에 칸을 만들고, 51-54행은 보존할 원본이 없으면 슬롯을 지웁니다. 그 후보는 `settle/utils/slots/getSlotEntries.ts:20-34`에 다시 나타나지 않으므로, `createClearedArrayOverlay.ts:61-62`의 소멸 목록에 들어가지 못합니다. 같은 색인의 현재 후보가 버려지고 뒤 행이 그 색인으로 압축되면, 지워진 후보의 옛 참조는 목록 칸을 거쳐 그 생존 행에 씁니다.
- **형태 B — 재진입 전에 잡은 옛 참조:** 재진입 복제(`cloneSlotSubtree.ts:32`, `settle/utils/slots/cloneFromSlot.ts:29`)는 칸을 잇지 않습니다. 이는 DETAIL이 밝힌 의도된 비용 결정입니다. 그 뒤 목록이 다시 닫히며 현재 행이 버려지면, 옛 참조는 이전 칸의 옛 색인으로 씁니다.
- **기록된 한계와의 관계:** 두 형태 모두 이미 기록된 한계(`b7-results.md:329`, `b7-results.md:377`)와 원인이 같고, 기준선의 배열 이동에도 같은 어긋남이 있습니다. 그러나 기록된 한계는 생존 아이템 쪽만 말합니다. 반면 `settle/DETAIL.md:17`은 버려진 아이템에 대한 쓰기가 그 색인의 아이템에 떨어지지 않는다고 적으므로, 이 두 형태에서는 문서가 참이 아닙니다.
- **고치는 방법:** 수정 명세 2로 문서의 범위를 한정합니다. 코드로 막을지는 조정자가 결정할 일입니다.

## 수정 명세

작업자에게 줄 제약을 먼저 적습니다. `yarn`은 Bash 호출 하나에 단독으로 실행합니다. 파이프, `;`, 파일 리디렉션, 환경 변수 접두사를 붙이지 않습니다. 디렉터리는 `cd` 대신 `yarn --cwd <worktree>`로 넘깁니다. 현재 머리는 `941398ea7`이며 `22f88424a`와 패치가 같습니다.

### 수정 1 — 사적 나감 복제본의 원래 노드를 복제 노드의 칸에 연결합니다(새 결함 1)

1. `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts`의 38-39행을 바꿉니다.

   바꾸기 전:

   ```ts
       if (source.parent && compactions?.has(source.parent))
         DetachedWriteAddress.retain(source, address, node.runtime);
   ```

   바꾼 뒤:

   ```ts
       if (compactions) DetachedWriteAddress.retain(source, address, node.runtime);
   ```

   lint의 포매터가 다른 줄 나눔을 요구하면 그 출력을 따릅니다.
2. 같은 파일 20행의 `@param compactions` 설명을 다음 문장으로 바꿉니다. "Exit-only rebinding plans; ordinary entry clones and kind transfers omit them. Every source occurrence of an exit clone shares its clone's detached write address, so a later compaction of the clone also moves or drops the original references"
3. 안전한 이유는 이렇습니다.
   - `compactions`는 `retainExitedSlot.ts:56-65`의 사적 복제와 그 재귀에서만 전달됩니다. `restoreTransferredSlotSource.ts:34`는 전달하지 않으므로 동작이 바뀌지 않습니다.
   - 원래 노드에 이미 칸이 있으면 37행의 `transfer`가 그 칸을 `address`에 연결했으므로, `retain`은 아무것도 바꾸지 않습니다.
   - 칸이 없으면 새 칸 하나를 원래 노드와 복제 노드가 공유합니다. 이 칸은 40행이 원래 만들던 칸과 같은 값이므로 칸 객체 수는 같고, 복제 노드마다 WeakMap 항목이 하나 늘어납니다.
   - 원래 노드의 `read`는 자기 칸 분기(`DetachedWriteAddress.ts:86-90`)로 가며, 지금까지 조상에서 계산하던 것과 같은 경로를 돌려줍니다.
4. 검증 시험을 `src/core/surface/__tests__/surface.clearing-array-keep.test.ts` 끝에 더합니다.

   ```ts
   it('keeps original row references on their rows when an already inactive list compacts under a clearing ancestor', () => {
     const { root } = makeFieldNodeTree({
       type: 'object',
       properties: {
         open: { type: 'boolean' },
         show: { type: 'boolean' },
         section: {
           type: 'object',
           controls: { active: '#/show', unsetOnInactive: true },
           properties: {
             list: {
               type: 'array',
               controls: { active: '#/open' },
               items: {
                 type: 'object',
                 properties: {
                   drop: { type: 'number' },
                   keep: {
                     type: 'number',
                     controls: { unsetOnInactive: false },
                   },
                   tags: {
                     type: 'array',
                     controls: { unsetOnInactive: true },
                     items: {
                       type: 'object',
                       properties: {
                         keep: {
                           type: 'number',
                           controls: { unsetOnInactive: false },
                         },
                       },
                     },
                   },
                 },
               },
             },
           },
         },
       },
     });
     root.setValue({
       open: true,
       show: true,
       section: { list: [{ drop: 1 }, { keep: 12, tags: [{ keep: 3 }] }] },
     });
     const discardedDrop = root.find('/section/list/0/drop')!;
     const survivorKeep = root.find('/section/list/1/keep')!;
     root.find('/open')!.setValue(false);
     root.find('/show')!.setValue(false);
     discardedDrop.setValue(5);
     survivorKeep.setValue(13);
     root.find('/show')!.setValue(true);
     root.find('/open')!.setValue(true);
     expect(root.find('/section/list')!.value).toEqual([
       { keep: 13, tags: [{ keep: 3 }] },
     ]);
   });
   ```

5. **실패 먼저:** 제품 코드가 현재 머리인 상태에서 이 시험은 마지막 `toEqual`에서 실패해야 합니다. 추적상 받은 값의 첫 행에는 `drop: 5`와 `keep: 12`가 있습니다. 다른 곳에서 실패하거나(예를 들어 `find`가 노드를 찾지 못하거나 스키마 오류가 남) 통과하면, 시험을 고치지 말고 멈춰서 보고합니다. 수정 뒤에는 같은 시험이 통과해야 합니다.
6. 문서를 고칩니다.
   - `src/core/engine/settle/DETAIL.md:17`의 "A detached occurrence honors a discard marker anywhere in its parent chain, whether it resolves through its own cell or through the nearest captured ancestor's cell." 바로 뒤에 다음 문장을 넣습니다. "A private exit clone links every source occurrence to its clone's cell, so a later compaction of an already inactive array inside that clone moves or discards the original references with their clones."
   - `architecture/verification/branch-switch/b7-results.md` 끝에 "## 후보 5" 절을 후보 4 절과 같은 구성으로 더합니다. 결함 표에는 새 결함 1과 2를 적고, 실패 먼저 결과, 관문, 알려진 한계를 적습니다. 비용 문장에는 "사적 나감 복제는 복제 노드마다 원래 노드의 WeakMap 항목 하나를 더하며, 칸 객체 수는 같습니다."를 적습니다.
   - `raw/b7/fail-first.json`에 기준 SHA, 새 시험 이름, 받은 값을 담은 `candidate5` 항목을 더합니다.
7. 수정 뒤 검증 명령은 다음과 같습니다. 각각 단독 Bash 호출로 실행합니다.

   ```sh
   yarn --cwd <worktree> workspace @canard/schema-form typecheck
   yarn --cwd <worktree> workspace @canard/schema-form lint
   yarn --cwd <worktree> workspace @canard/schema-form test --run --project unit src/core/surface/__tests__/surface.clearing-array-keep.test.ts src/core/surface/__tests__/detached.test.ts src/core/engine/settle/utils/slots/ src/core/engine/settle/arrangeFieldNodeItems/ src/core/engine/settle/__tests__/settle.retained-slot src/core/engine/settle/__tests__/settle.array src/core/engine/blueprint/utils/features/
   ```

   기본 힙이 부족하면 환경 변수 접두사를 붙이지 말고 보고합니다.

### 수정 2 — 보유 그래프에서 떨어진 칸의 범위를 문서에 적습니다(새 결함 2)

1. `src/core/engine/settle/DETAIL.md:17`의 마지막 문장 "zero-survivor arrays retain latent writes at their original paths." 뒤에 다음 문장을 넣습니다. "A cell that the retained graph no longer reaches, such as an occurrence that exited fully cleared or an old reference whose occurrence has since re-entered, is neither moved nor discarded by a compaction, as with an array move; a write through it uses its last recorded path."
2. 후보 5 절의 "알려진 한계와 인계"에 다음 문장을 적습니다. "지워진 채 먼저 나간 후보나 재진입 전에 잡은 옛 참조처럼 보유 그래프에서 떨어진 칸은, 버려진 색인에서도 소멸 표시를 받지 못하며 압축 뒤 그 색인을 차지한 생존 행에 쓸 수 있습니다. 배열 이동에도 같은 한계가 있습니다."
3. 조정자가 이 두 형태를 코드로 막기로 정하면, 그 설계는 이 명세의 범위 밖입니다. 작업자는 문서를 고치지 말고 멈춰서 보고합니다.

## 확인하지 못한 것

- 시험, typecheck, lint, build를 실행하지 않았습니다(지시). 새 결함 1과 2는 추적으로만 확인했으며, 수정 1의 시험이 첫 실행 증거가 됩니다.
- 새 결함 1에서 생존 행의 13이 사라진 색인 1의 overlay로 남은 뒤, 재진입에서 두 번째 행을 만드는지 버려지는지는 추적하지 못했습니다. 그래서 받은 값은 첫 행만 특정했습니다.
- 값이 없는 0번 행에도 `tags` 노드가 있고 그 압축은 계획을 만들지 않는다고 가정했습니다. 노드가 없어도 결론은 같습니다.
- 수정 1이 기존 분리 참조, 배열 이동, 재진입 시험을 깨지 않는다는 판단은 추적에 근거합니다. 배열 이동의 `rekeySlotWriteAddresses.ts`는 이미 비활성 서브트리의 모든 노드에 칸을 만들므로 충돌하지 않는다고 보았지만 실행으로 확인하지 않았습니다.
- 성능은 측정하지 않았습니다. 수정 1은 사적 나감 복제 노드마다 WeakMap 항목 하나를 더합니다. 측정은 측정 실행기의 몫입니다.
- 작업자가 보고한 실패 먼저 결과, 표적 시험 79파일·523사례 통과, 화면 시험 2파일·4사례 통과를 재현하지 않았습니다.
- rebase판 `941398ea7`에서는 B6의 경로 해석(`getSlotPathNames`)이 `writeSlotPath`에 들어왔습니다. 새 결함 1의 경로에는 예약 토큰이 없으므로 결과가 같다고 보았지만 실행으로 확인하지 않았습니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `0e7567dba5cd`, `8b00444c5e31`의 필요한 내용은 [본선 보존물](../../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
