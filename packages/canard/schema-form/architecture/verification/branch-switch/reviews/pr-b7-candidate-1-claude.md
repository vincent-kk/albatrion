# B7 독립 검토 — 배열의 kept 아이템 압축 복원

검토 대상은 `branch-switch-b7` worktree의 기준 `0b9337cd9`부터 머리 `fae1785dc`까지입니다. 마지막 커밋 `fae1785dc`는 검증 문서만 바꾸므로 제품 코드는 측정 머리 `2406a34d9`와 같습니다. 지시에 따라 시험·빌드는 실행하지 않았고, 모든 동작 판단은 코드 추적에 근거합니다. 아래 경로는 `packages/canard/schema-form/` 기준이며, `settle/`은 `src/core/engine/settle/`을 뜻합니다.

## 판정

**FAIL** — 압축으로 살아남은 아이템을 옛 참조로 쓰면 원래 색인으로 해석되어 다른 생존 아이템의 보존 값을 덮어씁니다(P1, 코드 추적으로 확인했고 실행하지는 않았습니다). 이 경로를 막는 시험은 없습니다.

## 결함

심각도 표기는 P1 결함, P2 고쳐야 함, P3 사소함입니다.

### 1. [P1] 압축 뒤의 옛 참조 쓰기가 다른 아이템에 떨어집니다

- **위치:** `settle/utils/slots/cloneSlotSubtree.ts:32-39`, `settle/utils/slots/retainExitedSlot.ts:28-35`와 `:56-66`, `settle/utils/detached/DetachedWriteAddress.ts:61-78`, `settle/utils/write/writeFieldNode.ts:92-112`.
- **무엇이 틀렸나:** 압축 경로는 생존 아이템을 새 색인 바인딩으로 옮기지만 원래 원본의 쓰기 주소 칸은 옮기지 않습니다. `cloneSlotSubtree`는 `DetachedWriteAddress.transfer(source, …)`만 호출합니다. 그런데 나감 시점에 살아 있던 아이템과 그 자손에는 칸이 없으므로 transfer는 아무 일도 하지 않습니다. `retainExitedSlot`은 나간 최상위 노드에만 칸을 만들고, 새 칸은 아무도 들고 있지 않은 사적 복제본에만 생깁니다. 그 결과 옛 참조의 쓰기 주소는 `DetachedWriteAddress.read`가 배열의 칸 `/list`에 원래 상대 경로를 붙인 `/list/<원래 색인>/…`가 됩니다. `writeFieldNode`는 닫힌 동안 이 경로를 `writeSlotPath`로 보내고, `writeSlotPath`는 경로만 보고 압축된 overlay에서 같은 색인의 아이템을 찾습니다.
- **실패 장면(추적):** `src/core/surface/__tests__/surface.clearing-array-keep.test.ts`의 첫 사례를 `inactive=false`로 둡니다. 닫기 전에 잡은 `oldKeep`은 `/list/1/keep`이고 값은 12입니다. 닫힌 동안 `oldKeep.setValue(13)`을 호출하면, 압축 색인 1에 있는 원래 3번 아이템의 keep 24가 13으로 바뀝니다. 다시 열면 기대값 `[{keep:13},{keep:24}]` 대신 `[{keep:12},{keep:13}]`가 나옵니다. 버려진 아이템의 옛 참조(예: `/list/0/drop`)도 압축 색인 0의 생존 아이템에 값을 씁니다. 반면 이미 비활성이던 keep은 앞선 나감에서 자기 칸을 얻었으므로 transfer가 동작해 올바르게 옮겨집니다. 기존 시험은 그 경우만 다루므로 이 결함을 드러내지 못합니다.
- **왜 중요한가:** 옛 참조 쓰기는 이 엔진이 시험으로 고정한 계약입니다(`src/core/surface/__tests__/detached.test.ts`의 26C-12와 NODE-044 사례). 디바운스된 입력이 목록이 닫힌 직후 옛 노드에 쓰는 것 같은 현실적인 경로에서, 사용자가 모르게 다른 행의 보존 값이 바뀝니다. 같은 일을 하는 배열 이동 경로는 foreign binding 뒤에 반드시 `rekeySlotWriteAddresses(host)`를 호출합니다(`settle/utils/slots/rekeyArraySlotBindings.ts:43`, `:56`과 `settle/utils/slots/rekeySlotWriteAddresses.ts:17-18`). 압축 경로는 바인딩 방식만 따라 하고 이 단계를 빠뜨렸습니다.
- **고치는 방법:** 아래 수정 명세 1을 따릅니다. 생존 아이템 쪽은 기계적으로 고칠 수 있습니다. 버려진 아이템의 옛 참조 쓰기를 어떻게 처리할지는 결정이 필요합니다.

### 2. [P2] 계약의 비용 문장과 실제 방문 수가 다릅니다

- **위치:** `settle/utils/slots/createExitSlotOverlay.ts:51-61`, `settle/utils/slots/createExitSlotOverlay/createClearedArrayOverlay.ts:44-75`, `settle/DETAIL.md:23`, `architecture/verification/branch-switch/b7-results.md:11`.
- **무엇이 틀렸나:** 기준 코드에서 후보 소유자가 없는 지움 배열은 상수 overlay를 돌려주고 아이템을 하나도 방문하지 않았습니다. 이제는 keep 자손이 없는 지움 배열도 모든 아이템 서브트리를 끝까지 재귀합니다. 노드마다 `captureAbsentSlotInputs`와 `readSlotExitPolicy`를 부르고, 배열마다 Set 하나·배열 둘·Map 둘을 할당합니다. 계약의 비용 문장은 "아이템 수에 비례한 방문"이지만 실제 방문은 아이템 서브트리의 노드 수에 비례합니다. 예를 들어 아이템 2개와 필드 2개로 된 keep 없는 지움 배열은 `readSlotExitPolicy` 호출이 1회에서 7회로 늘어납니다. 또 배열 자손을 품은 객체 호스트가 나갈 때도 이제 그 배열의 아이템을 방문합니다. 따라서 DETAIL 23행의 "객체 호스트의 overlay 방문 수는 유지한다"는 배열 자손이 없는 객체 호스트에서만 참입니다.
- **왜 중요한가:** `unsetOnInactive: true` 배열은 대부분 keep 자손이 없으므로, 가장 흔한 경우의 나감 비용이 기준보다 커집니다. 호출 수 시험(`settle/__tests__/settle.retained-slot-array-compaction.test.ts:197-249`)은 객체 지움과 지움 없는 배열만 고정합니다. A/B 창의 22행에도 큰 지움 배열 장면이 없어서 이 비용은 측정되지 않았습니다.
- **고치는 방법:** 결정이 필요합니다. (가) 계약과 DETAIL 23행의 비용 문장을 "지움 배열 아이템 서브트리의 노드 수에 비례"로 고칩니다. 같은 행의 "객체 호스트"를 "배열 자손이 없는 객체 호스트"로 좁힙니다. 그리고 keep 없는 지움 배열의 호출 수 행을 시험에 더합니다. (나) 청사진에 "명시 keep 자손 있음"이라는 정적 사실을 더해, keep 없는 템플릿은 기준의 상수 경로로 빠지게 합니다. (나)는 청사진 필드를 더하는 일이라 소유자 승인이 필요합니다.

### 3. [P2] 사적 복제의 실제 범위가 DETAIL 서술보다 넓습니다

- **위치:** `settle/utils/slots/retainExitedSlot.ts:56-66`, `settle/utils/slots/cloneSlotSubtree.ts:85-115`, `settle/DETAIL.md:25`.
- **무엇이 틀렸나:** DETAIL 25행은 "생존 아이템의 실제 원본을 새 색인의 사적 후보 그래프로 복제한다"고 적습니다. 그러나 코드는 `compacted`가 참이면 나간 최상위 노드 전체를 복제합니다. 압축 배열이 지움을 상속받은 객체 O 아래에 있으면, O의 다른 모든 자식과 비활성 슬롯까지 `nodeFactory`로 새로 만듭니다. 생존 아이템 안에서도 keep이 아닌 자손까지 모두 복제됩니다.
- **왜 중요한가:** 필드가 많은 객체 아래에 작은 keep 배열이 하나 있으면, 그 객체가 나갈 때마다 객체 서브트리 크기만큼 노드를 할당합니다. 문서가 이 비용을 말하지 않으므로 다음 독자가 비용을 잘못 추정합니다.
- **고치는 방법:** 최소 수정은 DETAIL 25행의 해당 문장을 다음으로 바꾸는 것입니다. "최종 나감에서 압축 배열을 품은 나간 최상위 원본의 서브트리 전체를 사적 그래프로 복제하고, 압축 배열 아래에는 생존 아이템만 새 색인으로 결합한다. 복제 비용은 나간 최상위 서브트리의 노드 수에 비례한다." 복제를 압축 배열까지의 경로 위 노드로만 줄이는 것은 설계 변경이므로 결정이 필요합니다.

### 4. [P2] 비어 있는 keep 배열 자손만 있어도 아이템이 살아남습니다

- **위치:** `settle/utils/slots/createExitSlotOverlay.ts:75-79`(지우지 않는 배열은 raw와 상관없이 `hasSource`가 참), 이를 소비하는 `createExitSlotOverlay/createClearedArrayOverlay.ts:60`.
- **무엇이 틀렸나:** 계약은 keep 원본을 "`unsetOnInactive: false`이고 raw가 정의된 노드"로 정의합니다. 그런데 branch 배열은 보통 raw가 undefined이고, 지우지 않는 배열은 아이템이 0개여도 원본이 있다고 판정됩니다. 예를 들어 아이템 스키마에 `tags: { type: 'array', controls: { unsetOnInactive: false } }`가 있으면, 사용자가 tags를 채우지 않았어도 모든 아이템이 `{ tags: [] }`로 살아남습니다. 그러면 재진입 길이가 0이 아니라 원래 아이템 수가 됩니다(추적했고 실행하지는 않았습니다).
- **왜 중요한가:** 배열 길이는 이 계약의 핵심 관측값입니다. 객체 호스트에서는 같은 규칙이 슬롯을 유지할지만 바꾸지만, 배열 호스트에서는 길이를 바꿉니다.
- **고치는 방법:** 결정이 필요합니다. 계약 문장을 따르면, 압축 판정에서 "아이템이 0개인 지우지 않는 배열"은 원본으로 세지 않아야 합니다. 어느 쪽으로 정하든 이 경우를 고정하는 시험을 더합니다.

### 5. [P2] 도우미 배치가 패키지 규칙과 형제 관례를 어깁니다

- **위치:** `settle/utils/slots/createExitSlotOverlay/createClearedArrayOverlay.ts`, `settle/utils/slots/createExitSlotOverlay/createClearedArrayOverlay/materializeKeptSlotOverlay.ts`, 가져오기 `settle/utils/slots/createExitSlotOverlay.ts:7`과 `createClearedArrayOverlay.ts:8`.
- **무엇이 틀렸나:** 패키지 `CLAUDE.md`는 두 가지를 정합니다. 첫째, 함수에서 뽑은 도우미는 형제 옆의 주제 칸에 두고 함수 이름을 딴 디렉터리에 두지 않습니다. 둘째, 한 organ 안의 진입 함수는 모두 파일이거나 모두 디렉터리이며 섞지 않습니다. 이 변경은 `settle/utils` 전체에서 유일한 함수 이름 디렉터리 두 개를 만들고, `slots/` 안에 `createExitSlotOverlay.ts`와 `createExitSlotOverlay/`를 나란히 둡니다. `createExitSlotOverlay`의 기존 도우미(`captureAbsentSlotInputs`, `expirePackedSlotMemos`, `hasSlotOverlaySource`, `readSlotExitPolicy`)는 모두 `slots/`에 평평하게 놓여 있습니다.
- **왜 중요한가:** 저장소 지시는 seiri 규칙보다 우선합니다. 결과 문서의 FCA 스캔은 이것을 잡지 못했으므로 검토에서 잡아야 합니다.
- **고치는 방법:** 아래 수정 명세 2를 따릅니다.

### 6. [P2] 후보 종류와 실제 색인 이동이 함께 있는 경우가 시험되지 않습니다

- **위치:** `settle/__tests__/settle.retained-slot-array-compaction.test.ts:153`, `:188`, `settle/__tests__/settle.retained-slot-array-policy.test.ts:52-56`.
- **무엇이 틀렸나:** 여러 후보 종류를 다루는 시험 세 개는 모두 아이템 하나를 색인 0에 둡니다. 그래서 압축 뒤에도 색인이 바뀌지 않습니다. 따라서 `createClearedArrayOverlay.ts:61-64`가 새 색인의 엔트리(색인마다 선언 결합이 다른 객체)로 후보를 다시 결합하는 경로는, 후보 종류에 대해서는 한 번도 실행되지 않습니다. 옛 참조 쓰기 시험도 없습니다(결함 1).
- **고치는 방법:** 결함 1의 시험과 함께 사례 하나를 더합니다. 후보 종류가 있는 아이템을 색인 2에 두고, 앞의 두 아이템은 keep 없이 두어 그 아이템이 색인 0으로 압축되게 합니다. 단언 대상은 닫힌 동안 `inactiveValues`의 경로 `/list/0/…`, 재진입 값, 후보 전환 뒤의 값입니다.

### 7. [P3] 이미 비활성인 아이템 후보에 활성 나감 입력을 넘깁니다

- **위치:** `settle/utils/slots/createExitSlotOverlay/createClearedArrayOverlay.ts:52-59`(57행의 `context` 인자).
- **무엇이 틀렸나:** `createExitSlotOverlay`의 `context` 매개변수는 "이미 비활성인 자손에는 생략한다"고 문서화되어 있고, 일반 경로(`createExitSlotOverlay.ts:110-117`)도 그렇게 합니다. 압축 경로는 살아 있는 아이템과 비활성 후보 모두에 `context`를 넘깁니다. 그래서 이미 보존된 비활성 후보의 `retainedSourceOverlay`를 덮어쓰고(`createExitSlotOverlay.ts:59`, `:147`), 그 후보에 대해 `captureAbsentSlotInputs`를 부릅니다. 지금 시험에서는 관측되는 차이가 없지만 문서와 코드가 어긋납니다.
- **고치는 방법:** 57행의 `context,`를 `node.structure?.[entry.name] === child.source ? context : undefined,`로 바꾸고 B7 시험 다섯 파일을 다시 실행합니다.

### 8. [P3] 실패 먼저 기록이 시험 이름과 맞지 않고 일부 시험을 덮지 않습니다

- **위치:** `architecture/verification/branch-switch/raw/b7/fail-first.json`의 `passingControls`, `b7-results.md:15-27`.
- **무엇이 틀렸나:** `passingControls`의 이름 세 개(예: "array without keep descendants has zero items")는 실제 시험 제목("keeps clearing arrays without keep descendants empty on re-entry", "preserves overlay visits for $kind exits with clear=$clear")과 다릅니다. 기준 `0b9337cd9`에 대입한 기록이 없는 시험도 있습니다. 겉면 시험 네 사례, 배열 이동 시험 두 행, 화면 시험이 그렇습니다. 겉면 시험은 중간 구현 `869ab553c`에만 대입했습니다.
- **고치는 방법:** 이름을 실제 시험 제목으로 고칩니다. 나머지 시험의 기준 대입 결과를 더하거나, 대입하지 않았다는 사실을 결과 문서에 적습니다.

### 9. [P3] 전후 배달 비교가 B7을 전혀 관측하지 않습니다

- **위치:** `b7-results.md:33-34`.
- **무엇이 틀렸나:** 계약은 "지움 배열 아래 keep 자손이 있는 장면만 차이가 나며 그 목록을 PR 본문에 적는다"를 요구합니다. 차이가 0건이라는 것은 고정 장치의 72장면에 그런 장면이 하나도 없다는 뜻입니다. 따라서 이 관문은 B7의 동작 변화에 대한 증거가 되지 못합니다.
- **고치는 방법:** 결과 문서와 PR 본문에 "고정 장치에 해당 장면이 없어 차이 목록이 비었다"고 명시합니다.

### 10. [P3] 사소한 점

- `src/core/surface/__tests__/surface.clearing-array-keep.test.ts:3`은 상대 경로로 fixture를 가져옵니다. 같은 디렉터리의 다른 시험 12개는 `@/schema-form/core/__tests__/makeFieldNodeTree` 별칭을 씁니다.
- 재진입할 때 `settle/utils/slots/applySlotOverlay.ts:32-34`와 `settle/utils/input/getChildDistribution.ts:30`이 `retainedItemNames`를 `includes`로 훑습니다. 그래서 생존 아이템이 n개인 압축 배열의 복원 비용은 n의 제곱에 비례합니다. 기존 장치이지만 이제 모든 압축 배열이 이 경로를 탑니다(추적했고 측정하지는 않았습니다).

### 수정 명세

#### 수정 1 — 생존 원본의 쓰기 주소 이전(결함 1)

1. `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts`의 `if (!entering) { … }` 블록(32-39행)을 고칩니다. `DetachedWriteAddress.transfer(source, address, node.runtime);` 바로 다음 줄에 `if (compactions) DetachedWriteAddress.retain(source, address, node.runtime);`를 넣습니다. 이는 `rekeySlotWriteAddresses.ts:17-18`의 "transfer 다음 retain" 순서와 같습니다. 재귀는 모든 자손 복제에 `compactions`를 넘기므로(72행, 82행, 96-103행), 압축 그래프 안의 모든 원래 원본이 새 경로의 칸을 얻고 그 칸을 사적 복제본과 공유합니다.
2. 버려진 아이템의 옛 참조 쓰기는 결정이 필요합니다. (가)는 닫힌 동안 효과가 없게 하는 방법입니다. 이를 위해 `DetachedWriteAddress`에 "소멸" 표식 칸을 두고, `writeFieldNode.ts:92` 뒤에서 일찍 반환해야 합니다. (나)는 원래 색인으로 쓰는 지금 동작을 허용하는 방법이며, 이 경우 다른 행을 덮어씁니다. 검토자는 (가)를 권합니다. 결정이 나기 전에는 작업자가 이 부분을 구현하지 않습니다.
3. 검증: `src/core/surface/__tests__/surface.clearing-array-keep.test.ts`에 사례를 더합니다. 첫 사례와 같은 스키마와 값을 씁니다. 닫기 전에 `const oldKeep = root.find('/list/1/keep')!`를 잡고, `/open`을 false로 바꾼 뒤 `oldKeep.setValue(13)`을 호출하고, 다시 엽니다. 그리고 `expect(root.value.list).toEqual([{ keep: 13 }, { keep: 24 }])`를 단언합니다. 이 사례는 `fae1785dc`에서 실패해야 하고(추적상 `[{keep:12},{keep:13}]`), 수정 뒤에는 통과해야 합니다. 그다음 B7 시험 다섯 파일과 `src/core/surface/__tests__/detached.test.ts`를 실행합니다.

#### 수정 2 — 도우미 배치(결함 5)

1. `git mv`로 `settle/utils/slots/createExitSlotOverlay/createClearedArrayOverlay.ts`를 `settle/utils/slots/createClearedArrayOverlay.ts`로 옮깁니다. `settle/utils/slots/createExitSlotOverlay/createClearedArrayOverlay/materializeKeptSlotOverlay.ts`는 `settle/utils/slots/materializeKeptSlotOverlay.ts`로 옮깁니다. 빈 디렉터리 두 개는 남기지 않습니다.
2. `createExitSlotOverlay.ts:7`의 가져오기를 `./createClearedArrayOverlay`로 바꿉니다.
3. 옮긴 `createClearedArrayOverlay.ts`의 가져오기를 다음처럼 고칩니다. `../../../../blueprint`는 `../../../blueprint`로, `../../../../record`는 `../../../record`로, `../../../types/settlement`는 `../../types/settlement`로 바꿉니다. `../getSlotEntries`, `../getSlotSource`, `../readSlotRawTree`는 각각 `./getSlotEntries`, `./getSlotSource`, `./readSlotRawTree`로 바꿉니다. `./createClearedArrayOverlay/materializeKeptSlotOverlay`는 `./materializeKeptSlotOverlay`로 바꿉니다.
4. 옮긴 `materializeKeptSlotOverlay.ts`의 가져오기를 다음처럼 고칩니다. `../../../../../blueprint`는 `../../../blueprint`로, `../../../../../record`는 `../../../record`로 바꿉니다. `../../getSlotEntries`와 `../../getSlotSource`는 `./getSlotEntries`와 `./getSlotSource`로 바꿉니다.
5. 검증: 저장소의 typecheck와 lint 관문, B7 시험 다섯 파일을 실행합니다.

## 확인한 것

- **지움 없는 나감과 배열 자손이 없는 객체 호스트의 나감:** `activeClear`를 지운 뒤에도 `clear` 값과 overlay 결과는 기준과 같습니다. 새 할당은 반환 객체의 `compacted` 필드뿐입니다. `retainExitedSlot`은 `compacted`가 거짓이면 기존처럼 원래 노드를 슬롯에 둡니다. 호출 수 시험의 3회와 7회는 기준에서도 통과한 대조군입니다(`fail-first.json`).
- **살아 있던 keep:** 아이템은 상속된 지움으로 해석되고, 명시 keep 자손만 원본으로 남아 압축 색인으로 공표됩니다. `collectSlotSourceValues`는 `packedArrayInput` 배열 값 자체는 공표하지 않고, 실체화된 패치의 잎만 공표합니다.
- **이미 비활성이던 keep:** 아이템의 `inactiveSlots` 순회가 그 원본의 마지막 정책(`retainedExitPolicy`)을 읽어 보존하고, 실체화 패치가 원본 raw를 복사합니다. 옛 참조의 고정 읽기와 항목 메모 동일성은 겉면 시험이 단언합니다.
- **스칼라 keep 아이템, 중첩 배열, 반복 나감:** 중첩 배열은 살아 있는 것과 이미 비활성인 것을 모두 확인했습니다. 각 경우를 시험이 공개 관측(`inactiveValues` 경로, 재진입 값, `itemCount`)으로 단언합니다.
- **후보 소유 배열:** `hasSlotCandidateOwner`와 `retainClearedArrayCarriers`는 지워졌고 남은 참조가 없습니다. 정책 시험 네 행이 후보 소유 범위와 상관없이 같은 결과를 단언합니다.
- **keep 없는 배열:** overlay의 `itemCount`가 0이면 `retain`이 거짓이어서 슬롯이 남지 않고 재진입 길이는 0입니다. 중첩된 keep 없는 지움 배열의 overlay에 더해진 `packedArrayInput`과 빈 `children`은 공표와 복원에서 기준과 같은 결과를 냅니다.
- **재진입:** `applySlotOverlay`는 압축 raw를 배열 입력으로 씁니다. `retainedItemNames` 때문에 생존 자리는 raw를 재분배받지 않고 자기 후보 슬롯에서 복원합니다. 따라서 다른 종류의 값이 살아 있는 종류에 입력되지 않습니다.
- **튜플:** `prefixItems`의 각 색인은 별도 청사진 노드입니다. 그래서 배열 이동 시험의 "삽입 뒤 나감" 사례가 foreign binding 경로를 실제로 지나갑니다. 이 구성은 배열 이동의 `rekeyArraySlotBindings`와 같습니다(쓰기 주소 이전만 빠졌습니다, 결함 1).
- **계획 수명:** `compactedSlotSources`는 호출마다 새로 만드는 정착 맥락의 선택 필드입니다. `createExitSlotOverlay`의 유일한 바깥 호출자는 `retainExitedSlot`이므로 고아 계획이 정착 뒤로 남지 않습니다.
- **규칙:** 새 함수 파일은 각각 내보내기가 하나이고, TSDoc의 매개변수와 반환이 채워져 있습니다. `as any`, `as never`, 네이티브 `Array.isArray`나 `Object.prototype.hasOwnProperty` 호출, 역사를 서술하는 주석은 더해지지 않았습니다. settle DETAIL의 "pre-existing inconsistency … owner decision" 문장은 지워졌고, DETAIL은 코드와 같은 커밋에서 바뀌었습니다. 시험 파일은 검증하는 fractal 안에 있습니다(settle, arrangeFieldNodeItems, surface, 패키지 e2e).
- **결과 문서와 원자료:** legacy 품질비 0.999368226은 18행 비율의 중앙값과 같습니다. TEST-073 주판정 회귀 목록은 비어 있습니다. 장부 합계는 `stages.json`과 맞습니다(`switch-oneOf-80`은 A 181.750, 범위 16.937, B 182.626이고 `switch-siblings-0`은 A 89.333, 범위 7.229, B 88.042입니다). Node 힙은 `heaps.json`과 맞습니다(B 중앙값 1443.950, A 최대 1898.019). 다만 A 최대는 첫 표본의 이상값이고 나머지 표본은 1430에서 1452 사이이므로, 이 관문의 여유는 매우 큽니다. 원자료와 결과 문서에 기계 로컬 경로는 없습니다. 공개 겉면 차분은 0바이트입니다. 결과 문서는 격식체이며 관문마다 판정 줄이 있습니다.

## 확인하지 못한 것

- 시험, typecheck, lint, build를 실행하지 않았습니다(지시). 결함 1, 2, 4, 10의 동작은 코드 추적으로만 확인했습니다. 수정 1의 시험이 첫 실행 증거가 됩니다.
- B6 rebase 뒤의 상태는 확인하지 못했습니다. B6이 `writeSlotPath`의 경로 분할과 그 주변을 바꾸므로, 결함 1의 재현 경로와 수정 위치가 달라질 수 있습니다. rebase 뒤의 관문 기록은 아직 없습니다.
- 서로 다른 스키마의 튜플 자리로 값이 압축되는 경우(예: `prefixItems: [string, number]`에서 1번 아이템이 0번으로 이동)의 관측값은 추적하지 않았습니다.
- 같은 쓰기에서 배열을 닫으면서 새 아이템 값을 주면, 인스턴스가 없는 아이템은 keep 선언과 상관없이 버려집니다(`createClearedArrayOverlay.ts:51`). 이것이 객체 호스트와 같은 결과인지는 끝까지 대조하지 못했습니다.
- A/B 창의 원표본 전체와 Storybook 샤드 기록은 표본 검사만 했습니다.
