# B7 최종 머리 delta 재검토 — 후보 5와 B6 rebase 충돌 해결

검토 대상은 `branch-switch-b7` worktree의 최종 머리 `ba0db9a42`입니다. 이 머리는 B6을 담은 stage 머리 `687c1d924` 위에 rebase되었습니다. 지시에 따라 시험·빌드·typecheck·lint는 실행하지 않았습니다. 모든 동작 판단은 코드 추적에 근거합니다. 아래 경로는 `packages/canard/schema-form/` 기준이며, `settle/`은 `src/core/engine/settle/`을 뜻합니다. 줄 번호는 `ba0db9a42` 기준입니다.

## 판정

**FAIL** — 후보 5 delta와 rebase 충돌 해결은 명세대로이고 B6의 경계를 지킵니다. 그러나 재진입 복제가 새 행으로 옮긴 비활성 후보는 옛 참조를 그대로 둡니다. 그 행이 나중에 버려져도 이 옛 참조는 소멸 표시를 받지 못하고, 쓰기는 그 색인을 차지한 생존 행에 떨어집니다. 이 경로는 DETAIL에 적힌 알려진 한계 문장 밖에 있습니다(새 결함 1, 추적으로 확인했고 실행하지 않았습니다).

## 후보 5 delta

검토 범위는 `941398ea7..ba0db9a42`입니다. 시험·계약 커밋 `87473ec6b`, 제품 커밋 `dd1462e50`, 문서 커밋 `ba0db9a42`로 이루어집니다. `dd1462e50..ba0db9a42`에는 `src` 변경이 없습니다. 따라서 결과 문서의 "최종 검증 제품 B = `dd1462e50`"이라는 기록과 맞습니다.

1. **한 줄 수정 — 명세와 일치.**
   - `settle/utils/slots/cloneSlotSubtree.ts:38`은 명세의 `if (compactions) DetachedWriteAddress.retain(source, address, node.runtime);`와 글자 단위로 같습니다.
   - `compactions`를 넘기는 곳은 `settle/utils/slots/retainExitedSlot.ts:56-64`와 그 재귀뿐입니다. 그 호출은 `result.compacted`가 참일 때만 일어납니다. 이 값이 참이면 `settle/utils/slots/createClearedArrayOverlay.ts:80-86`이 이미 계획을 등록했으므로, 사적 나감 복제에서는 지도가 언제나 정의되어 있습니다.
   - 재진입 복제(`settle/utils/slots/cloneFromSlot.ts:29`)와 종류 이전(`settle/utils/slots/restoreTransferredSlotSource.ts:34`)은 계획을 넘기지 않으므로 동작이 바뀌지 않습니다.
2. **실패 먼저 시험 — 장면과 일치.**
   - `src/core/surface/__tests__/surface.clearing-array-keep.test.ts:315-372`의 스키마, 값, 단계, 기대값은 이전 검토의 명세와 같습니다.
   - 수정 뒤 추적은 다음과 같습니다. 첫 사적 복제에서 원래 행과 `drop`, `keep` 노드가 복제 노드의 칸을 공유합니다. 두 번째 압축의 `discard`(`cloneSlotSubtree.ts:70-71`)는 0번 행 복제의 칸, 곧 원래 0번 행과 공유된 칸에 표시를 붙입니다. 그래서 `drop` 옛 참조는 `settle/utils/detached/DetachedWriteAddress.ts:88-89`의 부모 사슬 검사에서 버려집니다. 1번 행의 칸은 37행의 `transfer`로 색인 0으로 옮겨지고, 공유된 `keep` 칸도 `/section/list/0/keep`으로 옮겨집니다. 그 결과 기대값 `[{ keep: 13, tags: [{ keep: 3 }] }]`가 됩니다.
   - 작업자가 기록한 수정 전 받은 값 `[{ drop: 5, keep: 12, tags: [{ keep: 3 }] }]`는 이전 검토가 첫 행에 대해 예측한 값과 같습니다. 이 값에는 두 번째 행이 없으므로, 사라진 색인 1로 간 13은 재진입에서 행을 만들지 않았습니다. 이로써 이전 검토에서 확인하지 못한 항목 하나가 풀렸습니다.
   - `raw/b7/fail-first.json`의 `candidate5`에는 기준 SHA `941398ea7…`, 시험 이름, 기대값, 받은 값, 수정 후 통과 수, Node 버전이 들어 있습니다. 이 파일의 사례 수는 `it.each` 2건과 `it` 7건을 합한 9건이며, 1실패·8건 제외 기록과 맞습니다.
3. **TSDoc — 명세와 일치.** `cloneSlotSubtree.ts:20`의 `@param compactions` 문장은 명세 문장과 같습니다.
4. **DETAIL 범위 한정 — 결정과 일치.** `settle/DETAIL.md:21`에 두 문장이 명세 위치에 들어갔습니다. "A private exit clone links …" 문장은 "nearest captured ancestor's cell." 바로 뒤에, "A cell that the retained graph no longer reaches …" 문장은 "original paths." 바로 뒤에 있습니다.
5. **결과 문서 — 갖춤.**
   - `architecture/verification/branch-switch/b7-results.md:379`의 "후보 5" 절에는 결함 표, 실패 먼저, 관문, 알려진 한계, 비용 문장이 있습니다. 402행의 한계 문장은 명세 문장과 같습니다.
   - 406행의 "최종 후보(rebase)" 절에는 기준 A, rebase 직후 머리, 최종 제품 B, 충돌 파일 목록, 삭제된 literal-star 필드를 되살리지 않았다는 확인, 관문 표, 배달 비교, 미실행 측정 창이 있습니다. 첫머리 문단(3행)은 후보 1의 창을 최종 rebase 검증과 구분하도록 고쳐졌습니다.
6. **기계 로컬 경로 — 없음.** `941398ea7..ba0db9a42`에서 더해진 모든 줄(raw JSON 포함)에서 `/Users/`, `/private/`, `/tmp/`, `/var/folders`, `/home/`, 사용자 이름, scratchpad를 찾았고 하나도 나오지 않았습니다. `gates.json`의 명령 필드는 저장소 기준 `yarn workspace …` 형태입니다.

## rebase 충돌 해결

1. **방법과 결과.** rebase 전 B7 제품 차분(`0b9337cd9..22f88424a`)과 rebase 뒤 차분(`687c1d924..941398ea7`)을 파일별로 비교했습니다. 비교 대상은 문맥을 뺀 `+`·`-` 줄입니다. 두 차분은 같은 32개 파일을 바꿉니다. 그중 31개 파일의 패치는 글자 단위로 같고, `settle/DETAIL.md`만 다릅니다. 지목된 다섯 충돌 파일과, B6과 겹치지만 자동 병합된 `blueprint/DETAIL.md`, `markCandidateDescendants.ts`, `writeFieldNode.ts`가 모두 이 31개 안에 있습니다. `-` 줄이 rebase 전후로 같으므로, B7이 B6의 줄을 되돌린 곳은 없습니다.
2. **`settle/DETAIL.md` — 맞게 해결.** 다른 점은 세 가지입니다.
   - B6이 없앤 "별표 호환 경로" 언급 두 곳이 빠졌습니다. 압축 복원 비용 문장은 "공유 분배 기록"이라고 적습니다.
   - "Last Updated" 줄은 B6의 날짜 줄 위에 B7 설명을 붙였습니다. 이는 파일의 기존 관례를 따릅니다.
   - 19-20행과 26-27행에 빈 줄이 두 줄씩 생겼습니다. 이는 표시에만 영향을 주며 결함이 아닙니다.
3. **`settle/utils/slots/readSourceTree.ts` — 맞게 해결.** B6의 `appendSegment` import(4행, 80행)와 `isSlotEligible` 조건 제거(27행)가 유지됩니다. B7의 소멸 분기(28-30행)와 `address?.path`(36행)가 그 위에 결합되어 있습니다.
4. **`settle/types/settlement.ts`, `blueprint/types/node.ts`, `settle/arrangeFieldNodeItems/DETAIL.md` — 더하기만 있음.** 각각 `compactedSlotSources` 필드, `hasKeepDescendants` 필드, 요구사항 한 문장을 더합니다. B6의 줄은 그대로입니다.
5. **`settle/utils/slots/writeSlotPath.ts` — B7 변경 없음.** 이 파일은 rebase 전후 어느 쪽에서도 B7 차분에 들어 있지 않습니다. 현재 내용은 B6판 그대로이며, 37-38행이 `getSlotPathNames`를 쓰고 연산자 세그먼트가 있으면 거절합니다. 따라서 "이 파일만 B6 경계로 바뀌었다"는 작업자의 말은 "B7이 B6의 파일에 그대로 기대고 있다"는 뜻으로 읽어야 정확합니다. B7의 쓰기는 `settle/utils/write/writeFieldNode.ts:83`에서 소멸 주소를 먼저 버린 뒤에야 이 파일에 닿습니다. 생존 주소는 B6 문법으로 만든 복제 노드의 `path`에서 오므로 이 파일의 해석과 맞습니다.
6. **literal-star 필드 — 되살아나지 않음.** 최종 `src`에서 `literalStar` 계열 식별자를 찾았고, 제품 코드에는 하나도 없습니다. 유일한 "literal-star" 문자열은 `src/core/engine/DETAIL.md:134`의 B6 제목이며, 이 제목은 `687c1d924`에도 있습니다.
7. **B6 격리 규칙 — 위반 없음.** `687c1d924..ba0db9a42`에서 더해진 `src` 줄에는 다음이 하나도 없습니다.
   - `split(`, `'/'` 또는 `"/"` 리터럴, `Separator`
   - `'*'`·`'..'` 비교, `JSONPointer.`·`$.Wildcard` 계열 비교
   - 빗금이 붙은 템플릿, `escapeSegment`/`unescapeSegment`, `@winglet/json/pointer`
   - `.path +` 연결, `path.slice`, `startsWith(`, `endsWith(`

   `DetachedWriteAddress.ts:100`의 `ancestor.path + node.path.slice(parent.path.length)`는 stage 머리에 이미 있던 줄이며 B7이 더한 것이 아닙니다.
8. **압축 재키와 소멸 사슬 — 그대로 유지.** `DetachedWriteAddress.ts`, `cloneSlotSubtree.ts`, `createClearedArrayOverlay.ts`, `retainExitedSlot.ts`, `writeFieldNode.ts`의 B7 패치는 rebase 전후로 같습니다. 후보 5는 `cloneSlotSubtree.ts:38` 한 줄과 20행 TSDoc만 바꿉니다.
9. **DETAIL은 현재 명세만 적음.** B7이 더한 DETAIL 줄에서 이력 표현("이전", "변경 전", "previously", "used to", 후보·라운드 번호, 별표)을 찾았습니다. 유일한 검색 결과는 `blueprint/DETAIL.md`의 "literal true"였고, 이는 값 `true`를 가리키므로 이력 표현이 아닙니다.

## 새 결함

심각도 표기는 P1 결함, P2 고쳐야 함, P3 사소함입니다.

### 1. [P2, 추적] 재진입 복제가 새 행으로 옮긴 비활성 후보의 옛 참조는 그 행이 버려진 뒤에도 생존 행에 씁니다

- **위치:**
  - `settle/utils/slots/cloneSlotSubtree.ts:70-71`: `discard`는 버려진 발생 자신의 칸에만 표시를 붙입니다.
  - `settle/utils/detached/DetachedWriteAddress.ts:85-90`: 자기 칸이 있는 참조는 자기의 원래 부모 사슬만 거슬러 올라갑니다.
  - `settle/utils/slots/cloneFromSlot.ts:29`와 `cloneSlotSubtree.ts:80-86`: 재진입 복제는 비활성 후보를 비진입 복제로 옮깁니다. 이때 37행의 `transfer`가 그 후보에 이미 있던 칸을 새 행 아래 경로로 옮기고, 39행이 그 칸을 복제와 공유합니다.
- **원인 사슬(코드로 확인):**
  1. 행 R0 아래의 비활성 후보 P가 혼자 나갑니다. 그러면 `retainExitedSlot.ts:28-35`가 P에게 자기 칸을 줍니다. P에는 명시 정책이 없으므로, 나가는 조상이 없는 이 나감에서 Form 기본값 false를 상속합니다(`readSlotExitPolicy.ts:30-32`). 그래서 P는 지워지지 않고 `R0.inactiveSlots`에 남습니다.
  2. 목록이 지우지 않고 나갔다가(상속값 false) 다시 들어옵니다. `cloneFromSlot.ts:29`는 R0를 진입 복제 R0′로 만들며, R0′에는 칸도 연결도 없습니다. 이는 DETAIL이 정한 비용 결정입니다. 같은 복제의 80-86행이 P를 비진입 복제 P′로 옮기고, 37행이 P의 칸을 `R0′/p`로 옮겨 P′와 공유하게 합니다. 이 연결은 `settle/DETAIL.md:23`의 "Recursive inactive clones still transfer and rebind their address cells"가 의도한 것입니다. 그래서 P의 옛 참조는 이후 R0′의 배열 이동을 따라갑니다.
  3. 지우는 조상이 나갑니다. 목록은 이번에는 true를 상속해 압축됩니다. P′는 `createExitSlotOverlay.ts:119-131`에서 상속값 true로 다시 판단되어 지워지고, R0′에는 보존할 원본이 남지 않습니다. 그래서 `createClearedArrayOverlay.ts:61-62`가 R0′를 버립니다. 뒤 행 하나는 keep 값이 있어 색인 0으로 옮겨집니다.
  4. `cloneSlotSubtree.ts:70-71`은 R0′의 칸(새로 만든 칸)에만 표시를 붙입니다. P′가 공유하는 P의 칸에는 표시가 붙지 않습니다.
  5. P에 값을 쓰면 `writeFieldNode.ts:82-84`가 `read(P)`를 부릅니다. P의 자기 칸에는 표시가 없습니다. 부모 사슬은 옛 세대 R0(칸 없음), 원래 목록(표시 없는 옛 칸), `section`(표시 없음) 순입니다. 그래서 읽기는 `/section/list/0/p`를 돌려줍니다. `writeSlotPath.ts`는 이 경로로 압축된 복제본을 내려가 지금 색인 0을 차지한 생존 행의 `p`에 overlay를 씁니다.
- **실패 장면(추적, 실행하지 않음):** 수정 명세 A의 시험이 이 장면입니다. 기대값은 `[{ keep: 2 }]`입니다. 추적상 받은 값의 첫 행은 `p: 5`와 `keep: 2`를 함께 가집니다.
- **왜 문서의 한계 밖인가:**
  - `settle/DETAIL.md:21`의 한계는 "A cell that the retained graph no longer reaches, such as an occurrence that exited fully cleared or an old reference whose occurrence has since re-entered"입니다. 그런데 P 자신은 재진입하지 않았고, P의 칸은 보유 그래프가 닿는 칸입니다. P′가 그 칸을 가지고 있고 배열 이동도 그 칸을 옮깁니다.
  - `b7-results.md:402`도 "보유 그래프에서 떨어진 칸"이라고만 적습니다.
  - 따라서 이 형태에서는 같은 21행의 "a write addressed at them, or at a descendant of them, has no effect and never lands on the item that now occupies that index"가 참이 아닙니다.
- **같은 원인의 다른 형태:** `restoreTransferredSlotSource.ts:29-35`도 비활성 후보를 계획 없이 비진입 복제로 새 목적지 발생 아래에 옮깁니다. 이 경로는 다른 블루프린트로 재진입할 때와 서로 다른 tuple 블루프린트 사이에서 배열을 이동할 때 쓰입니다. 그래서 같은 모양이 생깁니다. 복제 단계까지만 추적했습니다.
- **왜 P2로 적었나:** 결과는 이전 P2와 같은 조용한 다른 행 쓰기입니다. 다만 필요한 형태가 더 좁습니다. 다음이 모두 필요합니다.
  - 행 안에 명시 정책이 없는 비활성 후보가 있습니다.
  - 그 후보가 닫힌 채로 목록이 지우지 않고 닫혔다가 다시 열립니다.
  - 그 뒤 지우는 조상이 닫히면서 그 행이 버려지고, 뒤 행 하나가 keep으로 남습니다.
  - 마지막으로 그 후보의 옛 참조에 씁니다.

  분기 전환 양식에서는 행 아래의 비활성 분기 후보가 흔한 슬롯 내용이므로, 조정자가 P1으로 올릴 수 있습니다. 반대로 조정자가 이 형태를 "재진입 전에 잡은 옛 참조"라는 결정된 한계에 넣는다면, 문서만 고치는 P3가 됩니다(수정 명세 B).

### 추가로 확인한 경로 — 결함 아님

- **사적 나감 복제의 계획 지도는 언제나 정의되어 있습니다.** 위 후보 5 delta 1번 항목과 같습니다.
- **같은 색인의 여러 종류는 각각 판단됩니다.** 생존 종류 옆의 버려진 종류도 `createClearedArrayOverlay.ts:61-62`에서 소멸 목록에 들어가 표시를 받습니다.
- **배열 동사와 원본 읽기는 쓰기와 같은 판단을 합니다.** `readSourceTree.ts:28-30`과 `writeFieldNode.ts:83`이 같은 `read`를 씁니다.
- **배열 이동은 같은 행 객체를 유지합니다.** `rekeySlotWriteAddresses.ts`는 행 객체를 바꾸지 않으므로, 비활성 후보의 부모 사슬에 그 행이 남고 소멸 표시도 보입니다.
- **원본 없이 overlay만 있는 항목은 이미 기록된 한계입니다.** `createClearedArrayOverlay.ts:52`가 건너뛰는 이 항목은 "지워진 채 먼저 나간 후보" 형태입니다.
- **생존 아이템 0개인 배열도 이미 기록된 한계입니다.**

### 수정 명세

작업자에게 줄 제약을 먼저 적습니다.

- `yarn`은 Bash 호출 하나에 단독으로 실행합니다. 파이프, `;`, 파일 리디렉션, 환경 변수 접두사를 붙이지 않습니다.
- 디렉터리는 `cd` 대신 `yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7`로 넘깁니다.
- 측정 창이 끝난 뒤에만 실행합니다.

#### 수정 A — 권장, 코드: 소멸 표시를 버려진 서브트리의 모든 보유 발생에 붙입니다

1. `src/core/engine/settle/utils/detached/DetachedWriteAddress.ts`의 58-72행 `discard`를 다음으로 바꿉니다.

   ```ts
     /**
      * Mark an occurrence and every occurrence retained beneath it as having no write destination.
      * @param node - Captured occurrence whose slot did not survive its host's compaction
      * @returns Nothing; later writes through any reference that shares one of these cells, or resolves through one, are dropped
      */
     static discard<Self extends FieldNodeRecord<Self>>(node: Self): void {
       const cells = (node.runtime.detachedWriteAddresses ??= new WeakMap());
       const address = cells.get(node) ?? { path: '', order: [] };
       address.discarded = true;
       cells.set(node, address);
       for (const child of node.children ?? [])
         if (child.parent === node) DetachedWriteAddress.discard(child);
       for (const retained of node.inactiveSlots?.values() ?? [])
         DetachedWriteAddress.discard(retained);
     }
   ```

2. `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:71`의 `DetachedWriteAddress.discard(discarded, node.runtime);`를 `DetachedWriteAddress.discard(discarded);`로 바꿉니다. 다른 제품 호출처와 시험 호출처는 없습니다(확인함).
3. **안전한 이유.**
   - 칸은 발생 계보 하나에 하나입니다. 주소 객체는 `retainExitedSlot.ts:30-33`, `cloneSlotSubtree.ts:33-36`, `rekeySlotWriteAddresses.ts:16`에서 매번 새로 만들어집니다. 그래서 버려진 서브트리 안의 칸이 생존 발생과 공유되는 일은 없습니다.
   - 이 순회는 버려진 아이템에 대해 `createExitSlotOverlay.ts:97-131`이 같은 정착에서 이미 방문한 `children`(`child.parent === node`)과 `inactiveSlots`만 다시 방문합니다. 그래서 비용의 차수는 같고, 버려진 서브트리의 노드마다 WeakMap 항목 하나가 더해집니다.
4. 검증 시험을 `src/core/surface/__tests__/surface.clearing-array-keep.test.ts` 끝에 더합니다.

   ```ts
   it('drops a write through an inactive candidate carried into a re-entered row once that row is discarded', () => {
     const { root } = makeFieldNodeTree({
       type: 'object',
       properties: {
         open: { type: 'boolean' },
         show: { type: 'boolean' },
         flag: { type: 'boolean' },
         section: {
           type: 'object',
           controls: { active: '#/open', unsetOnInactive: true },
           properties: {
             list: {
               type: 'array',
               controls: { active: '#/show' },
               items: {
                 type: 'object',
                 properties: {
                   p: { type: 'number', controls: { active: '#/flag' } },
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
     });
     root.setValue({
       open: true,
       show: true,
       flag: true,
       section: { list: [{ p: 1 }, { keep: 2 }] },
     });
     const carried = root.find('/section/list/0/p')!;
     root.find('/flag')!.setValue(false);
     root.find('/show')!.setValue(false);
     root.find('/show')!.setValue(true);
     root.find('/open')!.setValue(false);
     carried.setValue(5);
     root.find('/open')!.setValue(true);
     root.find('/flag')!.setValue(true);
     expect(root.find('/section/list')!.value).toEqual([{ keep: 2 }]);
   });
   ```

5. **실패 먼저.** 제품 코드가 `ba0db9a42`인 상태에서 이 시험은 마지막 `toEqual`에서 실패해야 합니다. 받은 값의 첫 행에 `p: 5`가 있어야 합니다. 다른 곳에서 실패하거나 통과하면 시험을 고치지 말고 멈춰서 보고합니다. 다른 곳에서 실패하는 예로는 `find`가 노드를 찾지 못하는 경우나 스키마 오류가 있습니다. 수정 뒤에는 같은 시험이 통과해야 합니다.
6. **문서.**
   - `src/core/engine/settle/DETAIL.md:21`의 "… moves or discards the original references with their clones." 바로 뒤에 다음 문장을 넣습니다: "A discard marks every cell retained beneath the discarded item, including an inactive candidate that a re-entry clone carried into it, so an old reference to that candidate is dropped even though its parent chain predates the re-entry."
   - `architecture/verification/branch-switch/b7-results.md` 끝에 "## 후보 6" 절을 후보 5 절과 같은 구성으로 더합니다. 그 절에 결함 표, 실패 먼저 결과, 관문, 알려진 한계를 적습니다. 비용 문장은 "소멸 표시는 버려진 아이템 서브트리의 노드마다 WeakMap 항목 하나를 더하며, 그 서브트리는 같은 정착의 정책 판단이 이미 방문한 범위입니다."로 적습니다.
   - `raw/b7/fail-first.json`에 기준 SHA `ba0db9a42…`, 새 시험 이름, 기대값, 받은 값을 담은 `candidate6` 항목을 더합니다.
7. **검증 명령.** 각각 단독 Bash 호출로 실행합니다.

   ```sh
   yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7 workspace @canard/schema-form typecheck
   yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7 workspace @canard/schema-form lint
   yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7 workspace @canard/schema-form test --run --project unit src/core/surface/__tests__/surface.clearing-array-keep.test.ts src/core/surface/__tests__/detached.test.ts src/core/engine/settle/utils/slots/ src/core/engine/settle/arrangeFieldNodeItems/ src/core/engine/settle/__tests__/settle.retained-slot src/core/engine/settle/__tests__/settle.array src/core/engine/blueprint/utils/features/ src/__tests__/pointerIsolation.test.ts
   ```

   기본 힙이 부족하면 환경 변수 접두사를 붙이지 말고 보고합니다.

#### 수정 B — 대안, 문서만: 조정자가 코드 범위를 늘리지 않기로 정한 경우

1. `src/core/engine/settle/DETAIL.md:21`의 마지막 문장 "… a write through it uses its last recorded path." 뒤에 다음 문장을 넣습니다: "An old reference to an inactive candidate that a re-entry clone carried into a new occurrence follows that occurrence's array moves but not its discard; after the occurrence is discarded, a write through it uses its last moved path and can land on the survivor that now occupies that index."
2. `architecture/verification/branch-switch/b7-results.md:402` 문단 끝에 다음 문장을 더합니다: "재진입 복제가 새 발생으로 옮긴 비활성 후보의 옛 참조는 그 발생의 배열 이동은 따르지만 소멸 표시는 받지 못하므로, 그 발생이 버려진 뒤에는 마지막으로 옮겨진 경로에 쓰며 그 색인을 차지한 생존 행에 쓸 수 있습니다."
3. 이 경우 제품 코드와 시험은 바꾸지 않습니다.

## 확인하지 못한 것

- 시험, typecheck, lint, build를 실행하지 않았습니다(지시). 새 결함 1은 추적으로만 확인했으며, 수정 A의 시험이 첫 실행 증거가 됩니다.
- 수정 A가 기존 시험을 깨지 않는다는 판단은 추적에 근거합니다. 버려진 아이템 아래로 쓴 값이 어딘가에 남기를 기대하는 기존 시험은 찾지 못했지만, 실행으로 확인하지 않았습니다.
- `restoreTransferredSlotSource.ts` 경로의 같은 형태는 복제 단계까지만 추적했습니다.
- 작업자가 보고한 관문 수치는 재현하지 않았습니다. 여기에는 unit 3,853사례, 다섯 프로젝트 합계, 배달 72장면·430관측점 차이 0건, 공개 `dist/index.d.ts` 해시가 들어갑니다. raw JSON은 기계 로컬 경로와 명령 필드만 검사했습니다.
- B6의 경로 격리 시험을 실행하지 않았습니다. B7이 더한 줄은 그 검사기의 규칙을 덮는 문자열 검색으로만 확인했습니다.
- `DetachedWriteAddress.ts:100`의 접두 연결은 B7 이전부터 있던 코드입니다. B6의 격리 규칙이 이 줄까지 덮으려 했는지는 평가하지 않았습니다.
