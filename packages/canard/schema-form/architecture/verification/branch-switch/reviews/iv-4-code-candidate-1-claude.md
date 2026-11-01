# Ⅳ-4 유지 커밋 제품 코드 검토 판정 (`c5cb20f87` 대비 작업 트리)

경로는 `packages/canard/schema-form/src/core/engine/` 기준입니다.

## 판정

**통과입니다.** P1·P2는 0건이고 P3는 4건입니다. 기준 대비 src diff에는 유지 커밋 다섯 개(S5 `9fe7e55ff`, S1a `fd2d91832`, S1b `67641f19d`, S6b `289538f96`, S4 `82c418c6c`)의 변경만 있습니다. 되돌린 일곱 쌍은 src 패치 ID 기준으로 모두 정확한 역변경입니다. 그 일곱 쌍은 첫 S4 `e398e6540`/`4eb0c59c0`, `0c08485e0`/`890b4384c`, `73c24e468`/`74cae6cf3`, `d95116a0a`/`8c9e7d483`, 항목 5 진단 `a0f597054`/`01523d96b`, S2a `87c15da8b`/`56e370242`, S10 `11bd156ad`/`4487a5ac0`입니다. 그래서 S2a·S2b·S10·S8의 흔적은 src에 없습니다. S5는 처음부터 다듬은 형태 하나로만 커밋되어, 첫 형태의 흔적도 없습니다. 다섯 제품 파일은 `node --check`를 오류 없이 통과했습니다. 빌드·시험·lint는 실행하지 않았습니다.

## 커밋별 확인

### S5 — `settle/utils/detached/captureDetachedFieldNodeReads.ts:23-26`
- **의미가 같습니다.** `hasWatch`는 선언 수집이 만나는 모든 `controls.watch`와 `controls.fields[i].controls.watch`에서 켜집니다(`blueprint/buildNodes/utils/declarations/collectSchemaCapabilities.ts:45-55`). 따라서 `hasWatch=false`이면 유효 스키마의 watch 목록은 언제나 비어 있고, watch memo 값은 공유 동결 빈 배열뿐입니다. 기준은 memo를 지운 뒤 빈 결과로 다시 넣었고, 변경은 그대로 둡니다. 떼어진 읽기는 두 경우 모두 같은 `EMPTY_WATCH_VALUES` 참조를 돌려줍니다(`settle/utils/controls/readFieldNodeWatchValues.ts:43-44`).
- **떼어진 노드에 남지 않는 witness는 아무도 읽지 않습니다.** watch memo를 읽는 곳은 `readFieldNodeWatchValues`뿐이고, 떼어진 노드는 witness를 보기 전에 반환합니다.
- **`hasWatch=true`이면 기준과 같은 코드가 그대로 실행됩니다.**
- **상주량은 줄어듭니다.** 나감마다 생기던 host 레코드·witness·memo 항목이 사라집니다.

### S1a — `settle/utils/gates/readProjectedValue.ts:61-68`
- **null-prototype 일반 객체에서 의미가 같습니다.** 조회 하나는 기준의 "자체 키 확인 후 조회"와 같은 값을 돌려줍니다. 값이 `undefined`인 자체 키도 결과가 거짓으로 같습니다. 일반 prototype 객체와 배열 호스트는 기존 helper 경로로 갑니다.
- **사적 Proxy에서도 의미가 같습니다.** `settle/utils/compute/childSelection/utils/createPreparedSelectionStructure.ts:23-40`에는 `get`·`has` 트랩이 없습니다. 대상은 `Object.create(baseline)`이고(`selectChildren.ts:163-165`), baseline은 null-prototype입니다(`prepareStaticHost.ts:103`). 그래서 일반 읽기가 닿는 키가 `getOwnPropertyDescriptor` 트랩이 보고하는 "대상 다음 baseline" 자체 키와 정확히 같습니다. `__proto__`·`constructor`·`toString` 같은 이름도 null 사슬에서는 자체 키만 읽습니다.

### S1b — `settle/utils/gates/flushPendingGateReads.ts:119-127`
- **제품 경로에서는 의미가 같습니다.** 기준과 달라질 수 있는 유일한 경우는 값이 `undefined`인 자체 키입니다. `structure`에 값을 쓰는 지점 13곳은 모두 노드 객체만 쓰고, 제거는 `delete`로만 합니다. 그 지점은 `primeHost.ts:167`, `prepareStaticHost.ts:122`, `selectEntryStep.ts:400`·`:228`, `selectChildren.ts:128`·`:182`, `createStaticEntryReuser.ts:92`, `createPreparedSelectionStructure.ts:22`, `restoreArrayStructure.ts:45`, `cloneSlotSubtree.ts:96`, 그리고 `publishPreparedSelection`의 `Object.assign`입니다. 따라서 그런 키는 생기지 않습니다. 이 불변식은 settle DETAIL에 적혀 있습니다(아래 P3-2).

### 전제 판정 — S1a·S1b의 `structure` 종류
- **일반 prototype 객체는 factory에서만 들어옵니다.** 초기 factory의 `{}`(`surface/utils/fieldNodeFactory.ts:108`)이고, `selectChildren.ts:174`의 재사용 분기가 이를 그대로 유지할 수 있습니다.
- **나머지 작성 지점은 모두 null-prototype이거나 배열이거나 사적 Proxy입니다.** null-prototype은 `primeHost.ts:64-65`(만든 직후 prototype을 null로 바꿈), `selectChildren.ts:175`, `loadStaticFirstTree.ts:109`, `restoreArrayStructure.ts:43`, `prepareStaticHost.ts:103`, `cloneSlotSubtree.ts:57,78`, `publishPreparedSelection`입니다. 배열은 배열 호스트에서만 생깁니다(`applyArrayTail.ts:151`, `applyArraySplice.ts:134`, `applyArraySlots.ts:217`).
- **이 전제는 정확성을 떠받치지 않습니다.** 새 코드가 prototype을 실행 중에 검사하므로, 일반 prototype 객체가 들어와도 helper 경로로 갑니다. 전제가 정하는 것은 절감이 적용되는 범위뿐입니다. 정확성에 걸리는 예외는 Proxy 하나이며, 위에서 동치를 확인했습니다.

### S6b — `behaviors/objectBehavior/branch/utils/assembleObject.ts:201-235`
- **순서와 멤버십이 같습니다.** `childOrderIndex`는 `getSlotChildIndex`만 만듭니다(`settle/utils/slots/getSlotChildIndex.ts:21-29`). 위치를 오름차순으로 훑어 이름마다 첫 위치를 먼저 넣으므로, 내부 Map의 첫 값이 그 이름의 첫 `childEntries` 위치입니다. 이는 기준 순회가 이름을 처음 만나는 위치와 같습니다. 색인이 없거나 이름이 빠지면 기존 순회로 후퇴합니다(:209-213, :224-235).
- **색인은 낡을 수 없습니다.** `childEntries`는 청사진 작성 중에만 늘어나고(`populateVirtualNodes.ts:171,198`), 작성 뒤에는 바뀌지 않습니다(`blueprint.ts:106`). `prepareSourcePruner`는 색인을 읽기만 합니다.
- **나머지 성질도 유지됩니다.** 정수 이름, preferred, extras, `undefined`, NaN, 같은 값 참조가 기준과 같습니다.

### S4 — `settle/utils/gates/getGateRegistry.ts:69-72, 217-222, 240-265`
- **모든 memo·edge 읽기가 `register(node)` 직후에 있습니다.** `register`는 `byPath.get(node.path).node === node`를 보장하므로, :242의 `!` 단언은 안전합니다.
- **기준의 WeakMap 항목은 실제로 쓰이지 않았습니다.** 같은 노드를 `remove` 뒤 다시 등록할 때(`applyArraySlots.ts:73,250`, `restoreArrayStructure.ts:31`), 경로가 바뀌었을 때, 같은 경로가 교체될 때 모두 기준도 memo를 새로 만들었습니다. 그래서 나감·재진입 뒤의 조회 결과가 같습니다.
- **상주량은 줄어듭니다.** WeakMap 둘이 사라지고, 기존 레코드에 필드 둘이 생깁니다.

## 보호 시험 (읽어서 확인, 실행하지 않음)
- **S5** `settle/__tests__/settle.empty-watch-snapshot.test.ts:27-30,51`: 기준은 `getHostDerived(field)`를 한 번 부르고 memo를 다시 넣으므로 실패합니다. :56-106의 두 사례는 `hasWatch=true` 경로를 고정하는 특성화 시험입니다.
- **S1a** `settle/__tests__/settle.projected-structure-read.test.ts:36`: 기준의 `hasOwnProperty`가 서술자 트랩을 부르므로 실패합니다. prototype 이름, 상속 노드, 배열 구멍 사례는 특성화 시험입니다.
- **S1b** `settle/__tests__/settle.pending-gate-structure-read.test.ts:49`: 같은 이유로 기준에서 실패합니다. undefined를 내는 prototype 이름 노드, 실제 부재, 상속 노드 사례는 특성화 시험입니다.
- **S4** `settle/__tests__/settle.gate-registry-storage.test.ts:25-28`: 기준은 노드 키로 `WeakMap.set`을 두 번 부르므로 실패합니다. :34-60은 교체·제거·재등록 동일성을 고정합니다.
- **S6b** `behaviors/objectBehavior/branch/utils/__tests__/assembleObject.active-order.test.ts:59`: 기준이 휴면 항목 위치를 읽으므로 실패합니다. 첫 등장 순위, 후퇴, preferred·extras·NaN·참조 사례는 기존 동결 oracle(`assembleObjectBaseline`)과 대조합니다.
- 사례 수는 파일당 2~7개로 상한 15 안입니다. `filid:contract` 표지 다섯 개는 모두 DETAIL의 계약 그룹과 일치합니다.

## 상주·공개면·NODE·DETAIL·위생
- 새 상주 구조는 없습니다. S6b는 적격 조립마다 임시 순위 배열 하나만 만듭니다.
- 공개 API와 `index.ts`의 변경은 없습니다.
- NODE-044·NODE-064가 걸린 `cloneFromSlot`·`cloneSlotSubtree`·`detached` 처리는 바뀌지 않았습니다.
- settle DETAIL과 objectBehavior DETAIL에 다섯 후보의 비용 문장과 계약 그룹이 모두 있습니다.
- 새 TSDoc은 영어입니다. 파일당 내보내는 함수는 하나입니다. `as any`·`as never`와 기계 경로는 없습니다. 시험의 `as unknown as`는 기존 시험 31개 파일의 관례라 결함으로 보지 않습니다.

## P1
없습니다.

## P2
없습니다.

## P3

**P3-1. S6b의 모듈 간 계약을 시험이 고정하지 않습니다 (확인됨).**
- 근거: `assembleObject.active-order.test.ts:20-26`은 `getSlotChildIndex`의 색인 생성 반복문을 복제해 씁니다. `assembleObject.ts:201`에는 이 색인을 settle이 만든다는 사실도, "내부 Map의 첫 값이 첫 위치"라는 불변식도 적혀 있지 않습니다.
- 실패 시나리오: 나중에 색인 형식이 바뀌어도(예: 템플릿 위치를 다른 순서로 넣음) S6b 시험은 계속 통과하는데, 조립 순서는 조용히 바뀝니다.
- 수정 명세: 시험 fixture에서 색인을 직접 만들지 말고 `getSlotChildIndex(node.blueprintNode, 'alpha', first)`를 한 번 불러 만든 뒤 읽기 계수를 0으로 되돌립니다. 또 `assembleObject.ts:201` 위에 한 줄 주석을 둡니다: "Built by settle getSlotChildIndex; each inner map's first value is the name's first childEntries position." 참고로 `getHostDerived`는 레코드가 없는 청사진 노드에 빈 레코드를 만들 수 있지만, 청사진 노드 수로 제한되어 문제는 아닙니다.

**P3-2. S1b가 기준과 갈리는 유일한 조건을 코드와 시험이 고정하지 않습니다 (확인됨).**
- 근거: 값이 `undefined`인 자체 키를 막는 것은 작성 지점의 불변식뿐입니다. settle DETAIL의 "내부 구조는 실제 노드만 저장"이라는 문장에만 적혀 있고, `flushPendingGateReads.ts:122` 근처와 시험에는 없습니다.
- 수정 명세: :122 위에 한 줄 주석을 둡니다: "structure values are always live nodes, so undefined means absent." 또는 null-prototype 구조의 모든 값이 노드임을 확인하는 특성화 사례 하나를 S1b 시험에 더합니다.

**P3-3. 서식 문제가 있습니다 (확인됨).**
- `readProjectedValue.ts:63`은 83자로, prettier 기본 폭 80을 넘습니다(패키지 `.prettierrc`에 폭 지정이 없음). lint가 prettier를 강제하지 않아 관문에서는 잡히지 않습니다.
- settle DETAIL의 `### settle-pending-structure-read` 앞과 `## Boundary Exemptions` 앞에는 빈 줄이 두 번 겹쳐 있습니다.
- 수정 명세: 그 TypeScript 파일 하나에만 prettier를 적용하고, 겹친 빈 줄을 한 줄로 줄입니다.

**P3-4. S4에 도달할 수 없는 방어 코드가 남았습니다 (확인됨).**
- 근거: `getGateRegistry.ts:260`의 `edges?.values() ?? []`는 `edges`가 이제 항상 정의되어 있어 선택 연결과 대체값이 쓰이지 않습니다.
- 수정 명세: `[...edges.values()]`로 바꿉니다.

## 확인하지 못한 것
- 보호 시험이 실제로 기준에서 실패하고 지금 통과하는지는 실행으로 확인하지 않았습니다. 위 판단은 코드를 읽은 추론입니다.
- typecheck·lint·build 결과는 작업자의 관문에 맡겼습니다.
- `vi.spyOn`으로 모듈 namespace를 가로채는 방식이 이 하네스에서 동작하는지는, 기존 관례가 그렇다는 데 기대었습니다.
