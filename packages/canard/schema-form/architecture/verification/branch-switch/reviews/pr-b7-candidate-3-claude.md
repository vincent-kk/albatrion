# B7 후보 3 delta 재검토 — 조상 소멸 표시, 소멸 원본 읽기, 도우미 분리, 문서

검토 대상은 `branch-switch-b7` worktree의 `54cae86ca..057dea82d` 차분입니다. 차분은 시험 커밋 `be817365b`, 수정 커밋 `33cec671a`, 문서 커밋 `057dea82d`로 이루어집니다. 지시에 따라 시험·빌드·typecheck·lint는 실행하지 않았고, 모든 동작 판단은 코드 추적에 근거합니다. 아래 경로는 `packages/canard/schema-form/` 기준입니다. `settle/`은 `src/core/engine/settle/`, `blueprint/`는 `src/core/engine/blueprint/`를 뜻합니다.

## 판정

**FAIL** — 이전 P1은 이번에도 일부만 해결되었습니다. 자기 칸을 가진 자손은 이제 조상의 소멸 표시를 존중합니다. 그러나 자기 칸이 없는 자손은 가장 가까운 포착 조상의 칸에서 바로 반환합니다. 그 조상이 버려진 아이템 아래에서 먼저 나간 하위 객체이면, 더 위에 있는 아이템의 소멸 표시를 보지 못하고 같은 색인으로 압축된 생존 아이템에 씁니다(새 결함 1, 코드로 확인했고 끝단 효과는 추적으로 확인했습니다). 나머지 이전 P3 여섯 건은 해결되었거나 기록되었습니다.

## 이전 결함별 상태

1. **[P1] 먼저 나간 자손이 조상의 소멸 표시를 무시함 — 부분 해결(남은 구멍은 새 결함 1).**
   - **해결된 부분:** `settle/utils/detached/DetachedWriteAddress.ts:86-90`은 자기 칸이 있으면 고정 부모 사슬 전체를 훑습니다. 조상 하나라도 소멸 칸이면 소멸 표시가 붙은 사본을 돌려줍니다. 이전 검토의 재현 장면(`/list/0/keep`가 따로 나간 뒤 목록이 지움과 함께 나감)은 `surface.clearing-array-keep.test.ts:234`의 새 시험이 고정하며, 실패 먼저 기록의 받은 값 `[{ keep: 5 }, { keep: 24 }]`은 이전 검토의 추적과 일치합니다.
   - **일반 경우는 깨지지 않습니다:** 생존 아이템 아래에서 따로 나간 자손의 부모 사슬에는 생존 아이템의 옛 노드가 있습니다. 그 노드는 `settle/utils/slots/cloneSlotSubtree.ts:38-39`에서 소멸이 아닌 새 색인 칸을 받습니다. 목록의 옛 노드도 `retainExitedSlot`이 만든 일반 칸입니다. 따라서 루프는 소멸 칸을 찾지 못하고 자기 칸을 그대로 돌려주며, 그 칸은 `cloneSlotSubtree.ts:37`의 transfer로 새 색인을 가리킵니다. 소멸 칸은 `createClearedArrayOverlay.ts:61-62`가 고른 버려진 아이템 원본에만 붙고, 살아 있는 노드에는 붙지 않습니다. 그래서 다른 정상 경로가 잘못 버려지는 경우는 찾지 못했습니다.
   - **남은 부분:** `DetachedWriteAddress.ts:92-101`의 조상 분기는 바뀌지 않았습니다. 새 결함 1에 적었습니다.
2. **[P3] `hasKeepFields`가 도우미 예산을 넘음 — 해결.** `blueprint/utils/features/controls/hasKeepFields.ts`는 내보내기 하나와 영어 TSDoc을 가진 파일입니다. 이제 내보낸 함수이므로 도우미 8줄 예산의 대상이 아닙니다. `readKeepDeclarations.ts`에는 내보낸 함수 하나와 인터페이스 하나만 남았고, 쓰이지 않게 된 `isArray`와 `CONTROL_KEY` 가져오기는 지워졌습니다. 패키지 CLAUDE.md의 "함수 이름 디렉터리가 아닌 주제 구획" 규칙과 `seiri_function-boundaries` 4절의 "한 단계 아래" 규칙을 함께 만족합니다. `../isKeepControls`로 올라가는 가져오기는 위쪽 방향이라 허용됩니다.
3. **[P3] 재귀 간선 미고정 — 해결.** `markKeepDescendants.test.ts:92-95`는 `children` 배열 템플릿의 표시를 단언합니다. `markKeepDescendants.ts:19-24`의 전파에서 `children`에 닿는 유일한 역간선은 `collectTemplateParents.ts:16-17`의 아이템 간선입니다. 따라서 그 두 줄을 지우면 이 단언만 실패하고 루트 단언은 통과한다는 작업자 기록(`raw/b7/fail-first.json`의 `recursiveItemEdgeMutation`)은 코드와 맞습니다.
4. **[P3] DETAIL의 과거 비교 문구 — 해결.** `settle/DETAIL.md:25`와 `settle/DETAIL.md:328`은 현재 명세 문장으로 바뀌었습니다. `blueprint/DETAIL.md:29`는 "build no reverse graph"와 템플릿마다 결과 객체 하나를 만든다는 사실을 적습니다. 차분의 추가 줄에서 "previously", "used to", "기존과", "변경 전"은 발견되지 않았습니다. 다만 `settle/DETAIL.md:17`의 "a descendant of them has no effect"는 새 결함 1 때문에 아직 참이 아닙니다.
5. **[P3] `readSourceTree`가 소멸 주소의 경로를 씀 — 해결(새 결함 1의 구멍은 함께 상속).** `settle/utils/slots/readSourceTree.ts:28-30`은 소멸 표시가 있으면 경로 해석을 건너뛰고 그 옛 노드의 고정 원본만 읽습니다. `settle/utils/slots/__tests__/readSourceTree.test.ts`는 후보 종류 전환으로 먼저 나간 아이템 아래 배열을 다룹니다. 이 경우 `tags`에는 자기 칸이 없고, 가장 가까운 포착 조상이 소멸된 아이템이므로 92-101행 분기가 소멸 표시를 돌려줍니다. 기대값 `[1, 2]`와 기준 받은 값 `[]`(생존 아이템의 지워진 배열)은 코드와 맞습니다. 가져오기 형태는 같은 디렉터리의 `cloneFromSlot.test.ts`와 같습니다. 이 함수도 `read`를 쓰므로 새 결함 1의 형태에서는 생존 아이템의 원본을 읽습니다.
6. **[P3] 지워진 채 먼저 나간 자손의 칸 — 기록됨.** `b7-results.md`의 "알려진 한계와 인계" 첫 항목과 결함 표 6행에 적혀 있습니다.
7. **[P3] 생존 아이템이 없는 배열 — 기록됨.** `settle/DETAIL.md:17` 마지막 문장, `b7-results.md:234`, 결함 표 7행에 적혀 있습니다. "알려진 한계와 인계" 목록 자체에는 없지만 같은 절 안에 기록되어 있으므로 요구를 충족합니다.

**규칙 점검:** 새 파일은 각각 내보내기 하나를 가집니다. 새 선언과 바뀐 선언에는 영어 TSDoc이 있습니다. 소스에 과거 문구가 없습니다. 차분에 `as any`, `as never`, 네이티브 `Array.isArray`, `Object.prototype.hasOwnProperty` 호출, 기계 로컬 경로가 없습니다. `hasKeepFields`는 `@winglet/common-utils/filter`의 `isArray`를 씁니다.

**실패 먼저 기록:** `raw/b7/fail-first.json`의 `candidate3.failingNames` 두 이름은 실제 시험 제목과 글자 단위로 일치합니다. `failures` 배열 순서도 이름 순서와 맞습니다. `recursiveItemEdgeMutation.failingName`도 실제 제목과 일치합니다.

## 새 결함

심각도 표기는 P1 결함, P2 고쳐야 함, P3 사소함입니다.

### 1. [P1, 이전 P1의 잔여] 자기 칸이 없는 자손은 가장 가까운 포착 조상에서 멈추고 더 위의 소멸 표시를 보지 못합니다

- **위치:** `settle/utils/detached/DetachedWriteAddress.ts:92-101`. 이 루프는 칸을 가진 첫 조상을 만나면 그 칸의 `discarded`만 보고 바로 반환합니다.
- **왜 그런 칸 배치가 생기나(코드로 확인):**
  - `settle/utils/transition/finalizeExits.ts:33-37`은 나가는 최상위 노드만 `context.exited`에 넣습니다. 그 자손은 41-56행에서 분리 표시만 받습니다.
  - `settle/utils/slots/retainExitedSlot.ts:28-35`는 `context.exited`의 노드에만 칸을 만듭니다. 이 칸은 보존 여부를 판단하기 전에 무조건 만들어집니다.
  - `settle/utils/slots/createClearedArrayOverlay.ts:61-62`는 버려진 아이템 원본만 소멸 목록에 넣습니다. `cloneSlotSubtree.ts:71-72`는 그 목록에만 표시를 붙입니다. 아이템 아래에서 먼저 나간 하위 객체의 칸에는 표시가 붙지 않습니다.
  - `settle/utils/slots/writeSlotPath.ts:38`과 66-127행은 경로 문자열만으로 압축 복제본을 내려갑니다. 그래서 옛 경로는 그 색인을 지금 차지한 생존 아이템에 닿습니다.
- **실패 장면(추적, 실행하지 않음):**
  1. 아이템 스키마를 `{ drop: number, group: { type: 'object', controls: { active: '#/show', unsetOnInactive: false }, properties: { keep: number } } }`로 둡니다. 목록은 `controls: { active: '#/open', unsetOnInactive: true }`입니다.
  2. 값은 `[{ drop: 1 }, { drop: 2, group: { keep: 12 } }, { drop: 3 }, { group: { keep: 24 } }]`입니다.
  3. `/list/0/group/keep`의 옛 참조를 잡습니다.
  4. `show`를 false로 바꿉니다. `group`이 따로 나가며 `/list/0/group` 칸을 받습니다. `keep`은 칸을 받지 않습니다.
  5. `open`을 false로 바꿉니다. 0번 아이템은 kept 원본이 없어 버려지고, 소멸 표시는 0번 아이템의 칸에만 붙습니다. 원래 1번 아이템이 색인 0으로 압축됩니다.
  6. 잡아 둔 참조에 5를 씁니다. `read`는 `keep`의 칸이 없으므로 조상 루프에서 `group`의 일반 칸을 먼저 만나고, 소멸 표시 없는 `/list/0/group/keep`을 돌려줍니다. 쓰기는 생존 아이템의 `group.keep`에 overlay 5로 떨어집니다.
  7. 다시 열고 `show`를 true로 바꾸면, 기대값 `[{ group: { keep: 12 } }, { group: { keep: 24 } }]` 대신 `[{ group: { keep: 5 } }, { group: { keep: 24 } }]`가 나옵니다.
- **같은 원인의 다른 형태:** 아이템 안의 배열이나 후보 종류 객체가 먼저 나간 뒤, 그 안쪽 필드의 옛 참조에 쓰는 경우도 같습니다. 그런 옛 참조로 `push`, `remove`, `update`를 하면, `readSourceTree`(`readSourceTree.ts:28-30`)도 생존 아이템의 원본으로 반환값을 계산합니다.
- **무엇과 어긋나나:** 조정자 결정은 "버려진 아이템에 대한 쓰기는 그 색인을 차지한 아이템에 적용하지 않는다"입니다. `settle/DETAIL.md:17`의 "or at a descendant of them, has no effect"와도 어긋납니다. `b7-results.md:222`의 결함 1 처리와 `b7-results.md:234`도 이 구멍을 다루지 못한 채 해결로 적혀 있습니다.
- **왜 중요한가:** 행 안의 조건부 하위 객체는 흔한 형태입니다. 그 안 필드의 디바운스된 입력이 목록이 닫힌 뒤 도착하면, 다른 행의 보존 값이 소리 없이 바뀝니다. 이전 두 번의 P1과 같은 실패입니다.
- **고치는 방법:** 수정 명세 1을 따릅니다.

### 2. [P3, 확인] 결과 문서의 후보 2 절이 후보 3 절로 덮어써졌습니다

- **위치:** `architecture/verification/branch-switch/b7-results.md:212-275`.
- **무엇이 틀렸나:** `54cae86ca`의 "## 후보 2" 절(212-270행)이 통째로 지워지고 "## 후보 3"이 그 자리를 차지했습니다. 그래서 첫 검토의 결함 10건 처리 표, 후보 2의 실패 먼저 목록, 후보 2 관문 결과(182파일·1309사례), 결함 4의 확인 메모가 현재 문서에서 사라졌습니다. 이 기록은 git 이력과 `fail-first.json`의 `candidate2`에만 남습니다. 후보 3 절의 첫 문장은 "추가 기록입니다"라고 적어, 실제 차분과 맞지 않습니다.
- **고치는 방법:** 수정 명세 2를 따릅니다.

## 수정 명세

작업자에게 줄 제약을 먼저 적습니다. `yarn`은 Bash 호출 하나에 단독으로 실행해야 합니다. 파이프, `;`, 파일 리디렉션, 환경 변수 접두사(`NODE_OPTIONS=… yarn`)를 붙이지 않습니다. 디렉터리는 `cd` 대신 `yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7`로 넘깁니다.

### 수정 1 — 조상 분기에서도 더 위의 소멸 표시를 존중합니다(새 결함 1)

1. `src/core/engine/settle/utils/detached/DetachedWriteAddress.ts`의 92-101행을 다음으로 바꿉니다.

   ```ts
       for (let parent = node.parent; parent; parent = parent.parent) {
         const ancestor = cells.get(parent);
         if (!ancestor) continue;
         let discarded = ancestor.discarded === true;
         for (let above = parent.parent; above && !discarded; above = above.parent)
           if (cells.get(above)?.discarded) discarded = true;
         const order = getSlotOrder(node.parent, node.name, node.blueprintNode);
         return {
           path: ancestor.path + node.path.slice(parent.path.length),
           order: [...ancestor.order, ...order.slice(ancestor.order.length)],
           ...(discarded ? { discarded: true as const } : undefined),
         };
       }
   ```

   lint의 포매터가 `for` 머리를 여러 줄로 바꾸라고 하면 그 출력대로 따릅니다. 77-78행의 `@returns`는 지금 문장이 이미 맞으므로 그대로 둡니다.
2. 안전한 이유는 이렇습니다. 경로와 순서는 지금처럼 가장 가까운 포착 조상에서 계산합니다. 소멸 여부만 사슬 끝까지 확인합니다. 생존 아이템의 사슬에는 소멸 칸이 없으므로 결과가 바뀌지 않습니다.
3. 검증 시험을 `src/core/surface/__tests__/surface.clearing-array-keep.test.ts` 끝에 더합니다.

   ```ts
   it('drops a write through a descendant of an already inactive object inside a discarded item', () => {
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
               group: {
                 type: 'object',
                 controls: { active: '#/show', unsetOnInactive: false },
                 properties: { keep: { type: 'number' } },
               },
             },
           },
         },
       },
     });
     root.setValue({
       open: true,
       show: true,
       list: [
         { drop: 1 },
         { drop: 2, group: { keep: 12 } },
         { drop: 3 },
         { group: { keep: 24 } },
       ],
     });
     const emptyKeep = root.find('/list/0/group/keep')!;
     root.find('/show')!.setValue(false);
     root.find('/open')!.setValue(false);
     emptyKeep.setValue(5);
     root.find('/open')!.setValue(true);
     root.find('/show')!.setValue(true);
     expect(root.find('/list')!.value).toEqual([
       { group: { keep: 12 } },
       { group: { keep: 24 } },
     ]);
   });
   ```

4. 실패 먼저: 제품 코드가 `057dea82d`인 상태에서 이 시험은 마지막 `toEqual`에서 실패해야 합니다. 추적상 받은 값은 `[{ group: { keep: 5 } }, { group: { keep: 24 } }]`입니다. 다른 곳에서 실패하거나(예를 들어 `find`가 노드를 찾지 못함) 통과하면, 시험을 고치지 말고 멈춰서 보고합니다.
5. 문서를 고칩니다.
   - `settle/DETAIL.md:17`의 "An occurrence's own cell honors discard markers throughout its parent chain."를 "A detached occurrence honors a discard marker anywhere in its parent chain, whether it resolves through its own cell or through the nearest captured ancestor's cell."로 바꿉니다.
   - `b7-results.md:234`의 "먼저 나간 자손에게 자기 칸이 있어도 부모 사슬에 소멸 칸이 있으면 쓰기를 버립니다."를 "분리 참조가 자기 칸으로 풀리든 가장 가까운 포착 조상의 칸으로 풀리든, 부모 사슬 어디에든 소멸 칸이 있으면 쓰기를 버립니다."로 바꿉니다.
   - `b7-results.md:236`의 "자기 칸을 가진 분리 참조의 읽기·쓰기는"을 "분리 참조의 읽기·쓰기는"으로 바꿉니다.
   - 결함 표 1행에 새 시험 이름을 더합니다.
   - `raw/b7/fail-first.json`에 기준 `057dea82d`, 새 시험 이름, 받은 값을 담은 다음 후보 항목을 더합니다.
6. 수정 뒤 검증 명령은 다음과 같습니다. 각각 단독 Bash 호출로 실행합니다.

   ```sh
   yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7 workspace @canard/schema-form typecheck
   yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7 workspace @canard/schema-form lint
   yarn --cwd /Users/Vincent/Workspace/albatrion/branch-switch-b7 workspace @canard/schema-form test --run --project unit src/core/surface/__tests__/surface.clearing-array-keep.test.ts src/core/surface/__tests__/detached.test.ts src/core/engine/settle/utils/slots/ src/core/engine/settle/arrangeFieldNodeItems/ src/core/engine/settle/__tests__/settle.retained-slot
   ```

   기본 힙이 부족하면 환경 변수 접두사를 붙이지 말고 보고합니다.

### 수정 2 — 후보 2 기록 복원(새 결함 2)

1. `git show 54cae86ca:packages/canard/schema-form/architecture/verification/branch-switch/b7-results.md`의 212-270행("## 후보 2"부터 그 절의 "### 측정" 표까지)을 현재 문서의 "## 후보 3" 바로 앞에 그대로 넣습니다.
2. 후보 3 절은 그대로 둡니다. 첫 문장의 "추가 기록입니다"는 이렇게 하면 참이 됩니다.
3. 조정자가 최신 후보만 남기기로 이미 정했다면 복원하지 않습니다. 대신 후보 3 절의 첫 문장을 "후보 2 절을 대체하며, 후보 2의 기록은 `54cae86ca`와 `raw/b7/fail-first.json`의 `candidate2`에 있습니다."로 바꿉니다.

## 확인하지 못한 것

- 시험, typecheck, lint, build를 실행하지 않았습니다(지시). 새 결함 1의 끝단 효과는 추적으로만 확인했습니다. 수정 1의 시험이 첫 실행 증거가 됩니다.
- 값이 없는 하위 객체 `group`에도 `root.find('/list/0/group/keep')`가 노드를 돌려준다고 가정했습니다. 이 가정은 기존 시험이 값 없는 잎 `/list/0/keep`을 찾는 형태에서 유추했으며, 실행으로 확인하지 않았습니다.
- 작업자가 보고한 실패 먼저 결과, 재귀 간선 변이 결과, 표적 시험 79파일·522사례 통과, 화면 시험 2파일·4사례 통과를 재현하지 않았습니다.
- 한 색인에 두 후보 종류가 모두 보존된 채 색인이 옮겨지는 경우는 여전히 시험이 없고, 이번에도 추적하지 않았습니다.
- B6 rebase 뒤의 상태는 확인하지 못했습니다. B6이 `writeSlotPath`의 경로 분할을 바꾸므로 재현 경로가 달라질 수 있습니다.
- 성능은 측정하지 않았습니다. 분리 참조의 읽기와 쓰기마다 조상 깊이만큼 WeakMap 조회가 늘어납니다. 측정은 측정 실행기의 몫입니다.
