# record 계약

## Requirements

- 떼어진 참조의 쓰기는 정착·커밋·배달을 만들지 않으며 원래 떼어진 인스턴스의 읽기도 바꾸지 않는다. 쓰기 직후의 보유 슬롯·overlay 원본은 새 값을 가지지만 살아 있는 호스트의 inactiveValues는 직전 커밋 목록을 유지한다. 다음 살아 있는 커밋이 변경된 호스트와 조상의 materialization을 무효화하며, 같은 값·항목 참조와 떼어진 호스트의 고정된 읽기는 보존한다(NODE-044, VALUE-031, WRITE-087).

- 일반 비활성 원본은 호스트의 보유 슬롯·overlay만 소유하며 트리 단위 잠복 저장소·메타데이터·비활성 목록 메모는 두지 않는다. 별표 공표의 기존 wildcard 제외·항목 alias를 보존하는 호환 자료만 별도로 이름 붙여 필요한 폼에 지연 생성한다. 슬롯이 생길 수 없는 호스트는 준비 때 결정하며 반복 쓰기에서 적격 검사·overlay 조회·기능 플래그 읽기를 하지 않는다.

- Detached write-address cells belong to departed occurrences. A fresh active clone has no cell until an actual exit captures its current path and order; an inactive clone keeps the existing transfer and rebind rules. This avoids allocating transient address objects and order arrays for active re-entry without changing old references' write destinations.

- 배열이 나가는 쓰기에서 처음 받은 아이템의 입력 patch는 지연된 packed-array 원본의 일부이며 독립 비활성 잎 항목이 아니다. 선택적 overlay 표식은 이 입력 patch와 나중의 독립 옛 참조 쓰기를 구별해 비활성 열거를 맞춘다. 표식은 실제 overlay에만 붙고 노드의 고정 필드나 공개 계약을 늘리지 않으며 복제·정책 patch에서도 같은 원본 의미를 유지한다.

- A retained occurrence may hold one immutable exit-source patch for caller-supplied descendants that never received a node. Packed-array reads use that exit patch while later host-owned overlays remain separate, so detached descendant writes do not rewrite the packed snapshot. The patch owns source channels only and holds no prior host or history chain.

- 보유 슬롯은 호스트 레코드가 소유하는 선택적 상태 보유 자료이다. "슬롯은 한 번이라도 활성이었던 엔트리에만 생기므로 재귀 템플릿에서도 값 깊이까지만 존재한다"는 설계 Ⅱ의 상한을 따른다. 이름과 청사진 노드가 같은 엔트리를 구별하고 같은 이름의 다른 종류는 별도로 보유한다. 슬롯 값은 떼어진 인스턴스이며 공개 `structure`·`children`에는 넣지 않는다. 노드의 고정 생성자 필드와 공개 surface는 늘리지 않고 슬롯이 필요한 호스트에서만 자료를 할당한다(NODE-043·044·045·060).
- 슬롯의 raw·extras·선언 밖 값은 원래 인스턴스에 남는다. "슬롯 인스턴스는 떼어진 채라 고칠 수 없으므로" 비활성 쓰기는 호스트가 소유한 슬롯별 overlay로 보관한다. 선택과 정착은 record가 실행하지 않는다. 보유 자료의 변경은 이미 떼어진 참조가 보는 읽기 자료와 공유된 가변 상태를 만들지 않는다. 슬롯은 "후보 풀"이며 직전 형상을 출발점으로 재사용하는 기록이 아니다(VALUE-031, SETTLE-044·GOAL-029).
- `unsetOnInactive`가 참인 호스트도 명시 보존 자손이 있으면 슬롯으로 보유한다. 호스트 자신의 raw·extras와 보존 지시가 없는 자손 원본은 overlay의 지움 표식으로 제외하고, 명시 `unsetOnInactive: false` 자손의 원본을 유지한다. 보존할 자손이 하나도 없으면 슬롯을 만들지 않는다. 지움 표식은 원래 떼어진 인스턴스를 변경하지 않으며 재진입 때 없음인 원본에 적용되는 기존 채움 규칙을 유지한다(WRITE-034, NODE-044, 설계 Ⅱ 정책 상속 정정).
- 호스트당 보유 슬롯은 실제 방문한 엔트리 수 M 이하이고 재귀 보유 깊이는 실제 값 깊이 K까지이다. 보유 공간은 슬롯 아래의 실제 원본 서브트리와 overlay에 비례하며, 정적 청사진 전체나 방문하지 않은 재귀 가지를 실체화하지 않는다. load·reset·rebuild는 해당 범위의 슬롯·overlay를 버리고, 배열 위치 이동은 원본 보존·주소 이동 계약을 유지한다. 고정된 읽기 자료의 수명은 옛 참조의 수명에 묶는다(NODE-053·055·060).

- D3b-1의 노드 키 메모는 root runtime의 지연 WeakMap 칸으로 소유한다. 선언 키·derive target ID·객체/배열 안정 형상·호스트 예산·배열 선언 count/result는 트리마다 독립이며 폼 전체 reset과 폐기에서 해제하고 부분 reset에서는 유지한다. 떼어진 쓰기 주소 셀은 재계산 메모가 아닌 상태이므로 같은 runtime을 재사용하는 폼 reset을 포함한 어떤 reset에서도 해제하지 않는다. 살아 있는 옛 참조가 runtime을 계속 소유하여 기존 약한 키 수명을 보존한다. nextTargetId 단조 카운터와 이미 runtime 키인 등록소는 유지한다. 노드 칸은 늘리지 않으며 비용은 실제 사용하는 트리당 최대 일곱 지연 WeakMap이다(SURFACE-065, NODE-044·045).

- D2-P1의 선택적 `writeEpoch` 숫자는 노드와 트리 runtime의 정착 작업 기록이며 공개 상태나 revision이 아니다. settle이 자격 경로에서만 할당·비교·소비하고 record는 실행하지 않는다. 논리 보유 비용은 자격 경로에 도달한 노드당 8바이트와 트리당 8바이트이며, 실제 객체 확장·정렬 비용은 엔진마다 다르다. class의 고정 필드 순서와 공개 surface에는 추가하지 않는다(TEST-080 D2-P1, NODE-045·060).

- H5b의 bit-only 자격은 공개 dispatch 최외곽 커밋(entryDepth=1), 트리 전체 리스너 없음, revision을 읽은 적 없음, 해당 노드의 기존 pendingDelivery 없음이다. revision()을 한 번이라도 읽으면 그 트리는 이후 영구히 관측 모드이며 payload 생략을 재개하지 않는다. 자격이 없으면 기존 payload와 최초 previous 병합을 그대로 유지한다. 카운터는 관측·payload 유무와 무관하게 동일하게 증가하고 최초 커밋은 빈 deliveries Set을 보장한다(EVENT-006, GOAL-011, NODE-060, TEST-080 D1-H5b).
- 불변 원장 전이 공유는 미구독 bit-only 자격을 만족하는 커밋에서만 허용한다. 같은 이전 원장+mask는 같은 불변 다음 원장을 공유하고 옛 snapshot은 바뀌지 않는다. 약한 전이 메모는 커밋 종료·예외에서 버려 EMPTY를 뿌리로 역사 사슬이 남지 않게 한다. 구독·revision 관측·기존 pending·raw·중첩 진입·정착 밖 파동은 기존 불변 constructor 경로와 횟수를 유지하며 새 Map 작업을 추가하지 않는다. 원장 helper는 record가 소유하고 소비자는 명명 진입점을 거친다. 후보 큐와 그 scratch/context 기록은 추가하지 않는다.

- An optional distribution `preserveLatent` marker identifies a surviving source slot's composed replay during record recreation. Entering candidates prefer their own stored source, and already-stored absent candidate paths are not redistributed from the single composed value. The marker propagates only through that replay and is absent on caller writes, load and reset (NODE-051/NODE-043 supplements, 41C-01, WRITE-036; 394C-01).
- Structural slot application sets `preserveLatent` on distributions backed by retained sources; descendant entry propagates it and child selection reads it. It lasts only for that settlement: normal input distributions replace it, and scratch release clears the distribution map in the entry's `finally` path on success or failure. It is never stored on a node or load snapshot (NODE-051, NODE-045; 394C-01).

- 경로 키 런타임 칸은 명시적인 PathKeyedMap·PathKeyedSet 형으로 선언하고 생성자가 색인을 소유한다. record와 settle의 공통 소유자 core의 보조 형을 소비하여 settle 역의존을 만들지 않는다. native Map·Set의 조회·열거 계약을 유지하고 값은 복제하지 않는다. 메모리 비용은 K개 항목과 경로 깊이 D에 O(KD) 키 참조, 유일한 prefix 문자열·부모 연결·숫자 radix 마디이다(NODE-045, SETTLE-017·047).

- `blueprint < record < {종류 동작, navigation} < validation < derive < settle < dispatch < FieldNode`의 방향을 값 import와 `import type`에 똑같이 적용한다. `record`는 청사진의 선언 형만 소비하며 상위 엔진을 알지 않는다(NODE-016·045, LANDING-084).
- 고정 필드 집합은 모든 종류에 동일하다. 생성자는 선언 순서대로 필드에 대입하고 생성자·필드 초기화식에 노드별 객체·배열·함수 할당을 두지 않는다(NODE-004·010).

## API Contracts

- 결정 62 PR-2b의 선택적 `SettlementScratch.pendingExitPaths`는 호스트 경로 → 자식 경로 → 대기 키 개수의 색인입니다. `pendingExits`와 같은 수명을 가지며 첫 대기 퇴장 때만 지연 생성합니다. 정착 문맥은 같은 Map을 참조하며 scratch 해제는 존재할 때만 비웁니다. 다음 정착은 비워진 컨테이너를 재사용하고 대기 퇴장이 없는 정착에는 새 할당을 만들지 않습니다. record는 이 자료의 형만 소유하고 갱신은 settle이 수행합니다. 공간은 대기 경로 수에 비례하며 노드 고정 필드나 공개 패키지 표면은 늘리지 않습니다.

- 호스트 분배 기록의 선택적 `retainedItemNames`는 배열 호스트 복원 때 후보별 잠복 키가 소유하는 자리 이름이다. 그 자리는 통째 포착 배열에서 자식 입력을 받지 않고 자기 정체 토큰의 원본을 복원한다. 일반 쓰기와 단일 후보 배열에는 이 기록을 추가하지 않는다(390C-01, 391C-01).

- 폼 수준 `globalErrors`는 루트 외부 오류 뒤에 라우팅된 전체 검증 목록을 합친 저장 참조이다. 별도 `routedValidationErrors` 참조는 검증 목록만 보유하며 루트 외부 오류 또는 라우팅 목록이 바뀔 때만 합친 목록을 갱신한다. 외부 오류 맵과 경로 키 인계 맵은 최소 `dataPath` 계약을 사용한다. 읽기는 O(1)이고 두 목록의 병합은 변경당 O(E+V), 추가 상주 비용은 트리당 참조 한 칸이며 노드 고정 필드는 늘리지 않는다(SURFACE-053, VALIDATE-043, 79C-01).

- 노드 레코드는 폐기 표시와 상호작용 초기화 번호를 고정 칸으로 보유한다. 초기값은 각각 거짓과 0이며, 번호는 `revision`의 사건 비트가 아닌 바인딩 전용 읽기로 관찰한다. 상호작용 초기화 번호는 상태 칸 쓰기로 `dirty`·`touched`를 비우는 셋(폼 reset, `clearState`, `controls.resetInteraction`)에서 오르고 비움이 아닌 쓰기에서는 오르지 않는다(REACT-024). 재생성 인계의 폐기에서는 Refresh 번호와 이 번호를 통지 없이 동기로 올린다. 메모리 비용은 노드당 boolean 칸 하나와 number 칸 하나의 고정 슬롯 두 개이며, 판정 identity는 공유 청사진당 함수 참조 두 개를 보유하여 노드별 판정 칸을 추가하지 않는다(REACT-024, WRITE-046·086, 69C-02·04, 실행 ADR D5).
- 런타임이 보유한 청사진 결과는 작성 때 받은 `isAtomic`·`isTerminal`의 identity를 유지한다. 정착의 런타임 병합은 이 두 참조를 그대로 소비하며 레코드가 판정 함수를 다시 만들거나 React를 가져오지 않는다(REACT-003, 69C-04, 실행 ADR D5).

- 정착 도중 공개 상태 쓰기가 전역 계수를 즉시 반영하면, 이미 포착된 `deliveryPreviousState`도 그 쓰기 뒤 상태로 옮긴다. 커밋은 즉시 처리한 증감과 상태 사건을 다시 만들지 않으며 이후 정착 상태 변경만 비교한다. 변경 마스크가 없는 노드에는 기준 칸을 만들지 않는다(EVENT-062·067, 43C-01, 65C-03).
- S2의 배달 작업 기록은 레코드에 있다. `deliveryInitialized`는 첫 커밋 여부, `deliveryChanges`는 계산·형상·키 재부여·상태 쓰기가 포착한 변경 종류이다. 첫 변경에서만 `deliveryPreviousLocal`·`deliveryPreviousEmit`, `deliveryPreviousPath`, `deliveryPreviousChildren`, `deliveryPreviousComputed`(네 상태의 비트 묶음), `deliveryPreviousSchema`, `deliveryPreviousState`에 그 종류의 기준을 보관한다. `deliveryWatchValues`는 정적 watch 선언 대상에만 남기는 감시 기준이다. 생성자는 이전 값 칸을 `undefined`, 변경 마스크를 `0`, 초기화 표시를 `false`로 대입하며 객체를 할당하지 않는다. 11필드 관측 스냅숏 객체는 두지 않는다(NODE-004, VALUE-002, 65C-03).
- 기준 칸·변경 마스크는 작업의 기록이며 공개 읽기와 형상·값·방출 계산에 들어가지 않는다(P3). 커밋은 변경 종류만 최종 값과 비교하여 같은 기준으로 돌아온 A→B→A를 제외하고 비트 개정과 페이로드를 확정한 뒤 기준 칸·변경 마스크를 비운다. 배달 전 여러 커밋이 있으면 각 커밋의 개정은 독립적으로 증가하며 `pendingDelivery.payload.previous`가 마지막 통지 기준을 계속 유지한다. `pendingRevision`은 커밋에서, `pendingDelivery`·`pendingNonSettleDelivery`는 파동 전체 분리 때 비운다. 마지막 통지 기준과 커밋 비교 기준의 수명을 섞지 않는다(EVENT-007·024). 이탈/소멸은 이 작업 기록과 런타임 대상 집합·감시/검증 장부를 제거하고 detached 읽기는 유지한다(63C-02, I5).

- 떼어진 읽기 묶음은 마지막 커밋의 합쳐진 노드 오류 배열도 같은 참조로 보존한다. 살아 있는 오류 맵을 소멸 시 지워도 옛 노드의 `errors`는 바뀌지 않는다. WeakMap 항목당 배열 참조 하나이며 노드별 고정 필드는 늘리지 않는다(NODE-044·045, 35C-09).

- 선택적 `warningKeysByPath`는 데이터 경로의 각 조상→경고 구조 키 역색인이다. `indexFieldNodeWarning`은 경고를 대기 저장소에 넣을 때 이 색인을 함께 갱신하고 삭제 시 두 경고 저장소에서도 지운다. 재인덱싱과 소멸은 영향받은 아이템 접두사의 키만 조회하며 기록 객체는 발생 당시 경로를 보존한다. 비용은 경고 등록/삭제 O(경로 깊이), 메모리 O(경고 수 × 깊이)이고 경고가 없는 트리에는 색인을 만들지 않는다(35C-09, ERROR-017·024, NODE-045).

- 진입점은 `FieldNodeRecord`, `Behavior`, `UnionSpec`, `FieldNodeRuntime`, `SettlementScratch`, `SettlementFailureCause`, `SettlementBudget`, `SettlementEntryApi`, `updateFieldNodeNameAndPath`, `patchFieldNodeInteractionState`, `shallowPatch`를 이름으로 내보낸다. `FieldNodeFactory`는 내부 생성 함수 형이며 index가 내보내지 않는다. 외부 소비자는 레코드의 진입점으로만 들어온다(NODE-008·016).
- 진입점은 기존 레코드 계약과 함께 `FieldNodeEventType`, `FieldNodeRequestType`, `markFieldNodeEvent`를 이름으로 내보낸다. 두 열거의 비트와 명령 종류는 이 모듈이 소유하고 core와 패키지 진입점이 이름으로 내보낸다. `RequestEmitChange`·`RequestInjection`은 두지 않는다(SURFACE-056·060, EVENT-073, LANDING-067·087·158·170).
- 열거와 공유 빈 원장 상수는 `constants/` 구획에, 계약 형은 목적별 `types/` 구획(레코드·행·런타임)에 두고 진입점이 이름으로 내보낸다. 두 구획은 organ이며 바깥 소비자는 진입점으로만 들어온다.
- `FieldNodeEventType`은 남는 옛 비트의 자리 값을 유지하고 `UpdateJsonSchema`·`UpdateDiagnostics`를 더한다. `FieldNodeRequestType`의 `Focus`·`Select`·`Refresh`·`Remount`는 각각 `RequestFocus`·`RequestSelect`·`RequestRefresh`·`RequestRemount` 비트와 같다. 한 명령 호출은 종류 하나만 받는다(EVENT-043·064·073, SURFACE-057·060).
- 모든 종류의 논리 필드 선언과 생성자 대입 순서는 일치한다. 배달 작업 칸은 `revisionLedger` 뒤와 `detached` 앞에 둔다. 상호작용 상태의 저장 칸은 공개 `state`와 구별하며, 기준값과 개정은 상태가 아니라 작업 기록이다(NODE-004, VALUE-002, 65C-03).
- `itemKey`는 배열 아이템의 생성 순서 nonce인 숫자이며 아이템이 아니면 `null`이고 공개 멤버로 노출하지 않는다. 배열 branch 호스트의 `itemCount`는 청사진 없는 꼬리 자리를 포함한 값의 길이이며 그 밖에는 `0`이다. 호스트의 `nextItemKey`는 새 아이템의 키 계수이고 원본 B 되돌림에서도 감소하지 않는다. 세 필드는 모든 노드에 같은 고정 칸 세 개의 메모리 비용을 더하며 아이템 목록은 기존 `structure`에 둔다(NODE-004·045·051·052, GOAL-073, SURFACE-054, 35C-05, 실행 ADR D3).
- 세 상태 키 필드의 메모리 대가는 노드당 고정 칸 세 개이며 `watchValues`는 필드 대신 읽기 메모를 쓴다(NODE-004·045, CONTROLS-032·082, 28C-07).
- 구현 클래스는 같은 자리에서 `rootNode`를 private `root`에 저장하고 getter로 읽으며, 다른 일부 공개 레코드 칸도 `stored*` 필드와 getter·setter로 구현한다. `parent`·`rootNode`·`structure`의 노드 원소는 `Self`이고 구현은 `FieldNode` 자기 타입을 사용한다. `interactionState`는 기존 공용 `NodeStateFlags`를 소비하며 공개 `state` 게터는 이를 읽고 세터는 `dispatchSetState`로 위임한다. `behavior`·`schemaType`은 수명 동안 같은 참조이다(NODE-002·004·043·046·057, VALUE-002, EVENT-067).
- `raw`·`undeclaredValues`만 상태이다. 객체 branch의 `raw`는 비객체 입력일 때만 남고, `undeclaredValues`는 선언 밖 키를 받은 순서로 보관한다. 종류별 잠복 잎 값은 해석된 `raw`, 잠복 호스트 값은 자신의 비객체 `raw`와 `undeclaredValues`를 담은 `HostLatent`이다(VALUE-002·004, NODE-044). `active`·`visible`·`readOnly`·`disabled`·`local`·`emit`·`schema`와 정합 경고등은 계산값, `revisionLedger`는 비트별 커밋 배달 원장이다. 공유 동결 빈 상수를 생성자에 대입하고 첫 배달 때만 노드의 원장을 할당하므로 노드당 고정 필드 수는 늘지 않는다(CONTROLS-082, SETTLE-003, NODE-004, EVENT-001·007). branch 객체의 `structure`는 현재 형상의 이름→자식 맵이고 `children`은 공개 읽기가 그대로 돌려줄 저장 배열이다. 형상 밖의 자식을 저장하지 않는다(VALUE-002, NODE-043, TEST-070).
- `UnionSpec`은 `{ readonly kinds: Exclude<SchemaTypeName, 'null'> | readonly Exclude<SchemaTypeName, 'null'>[]; readonly mask: number; readonly nullable: boolean }`인 읽기 전용 계산 자료이다. 단일 종류 행도 같은 구조를 쓰고 가상 행은 해석을 하지 않는다. `Behavior<Self = unknown>`의 칸·순서는 `interpret(input: unknown, spec: UnionSpec): unknown`, `assemble<Node extends Self>(node: FieldNodeRecord<Node>, children: readonly Node[], recalculated?: readonly Node[], hint?: { incremental: boolean; append?: number }): unknown`, `project<Node extends Self>(node: FieldNodeRecord<Node>, local: unknown): unknown`, `finishInput<Node extends Self>(node: FieldNodeRecord<Node>): string | undefined`, `declareChildren<Node extends Self>(node: FieldNodeRecord<Node>): readonly BlueprintChildEntry[]`, `arrange<Node extends Self>(node: FieldNodeRecord<Node>, operation: ArrayOperation): ArrayArrangePlan`, `type: BlueprintNodeKind`, `strategy: 'branch' | 'terminal'`이다. 행 호출은 레코드의 자기 형에 다형적이므로 표가 가진 행을 새 노드에 할당할 때 형 단언이 필요하지 않다. 반환값 `undefined`인 `finishInput`은 쓸 값 없음이고, `declareChildren`은 생성하지 않는다. `arrange`도 순수 계획만 돌려주며 행은 원본 쓰기·되돌림·자식 확정·통지를 하지 않는다(NODE-006·014, WRITE-093, 26C-01, 36C-01, 실행 ADR D1).
- `assemble`의 선택 인수 `recalculated`는 호스트 형상이 바뀌지 않은 쓰기에서 이번에 다시 계산한 직계 자식이고, 행은 그 자리만 이전 `local`의 사본에 고쳐 쓸 수 있다. 그렇게 한 행은 `hint.incremental`을 참으로 두어 정착이 전체 깊은 비교를 건너뛰게 한다. 두 인수가 없으면 모든 자리를 다시 만든다(NODE-026, SETTLE-042, 44C-01). 정착은 정적 push의 덧붙임 증명이 유효한 배열 호스트에만 `hint.append`에 이전 아이템 수를 담아 넘기며, 배열 행은 그 한 자리만 이전 `local`의 사본에 채울 수 있다(G8).
- `record`는 여섯 동사(`push`·`pop`·`update`·`remove`·`insert`·`clear`)를 구분하는 `ArrayOperation`과 branch·terminal을 구분하는 `ArrayArrangePlan` 형을 선언하고 진입점에서 이름으로 내보낸다. branch 계획은 새 자리마다 이전 자리 색인 또는 생성 값, 무동작 여부, 반환 값의 출처를 담고 terminal 계획은 유효한 동사의 사본 위 새 `raw` 또는 무동작을 나타낸다. 반환 출처는 `push`·`insert`의 새 길이, `pop`·`remove`의 직전 커밋 아이템 값, `update`의 쓰기 뒤 아이템 값, `clear`의 `void`를 정착이 확정할 수 있게 구분한다(SURFACE-005, GOAL-058, 35C-06, 36C-01, 실행 ADR D1).
- `FieldNodeFactory<Self>`는 `(entry: BlueprintChildEntry | BlueprintNode, parent: Self | null, runtime: FieldNodeRuntime<Self>): Self`이다. 트리마다 하나인 구현을 런타임의 `nodeFactory`에 넣어 정착이 종류 구현을 import하지 않고 생성한다(NODE-008·016·046).
- `FieldNodeRuntime<Self>`는 `diagnostics`·`nodeFactory`와 트리 전체 자료를 보유한다. 시험 전용 술어 표는 없으며 `if` 판정은 주입된 검증기의 동기 가드이다. 호스트 바퀴·전이 상한은 청사진에서 유도하고 루트 접근은 레코드의 `rootNode`를 사용한다(TEST-069 (나), VALIDATE-015·044, 26C-01·04, ERROR-130·204, NODE-004·008·016·044·046, SETTLE-005·041).
- 런타임의 `globalStateCounts`는 현재 형상에서 키마다 참인 `interactionState`를 가진 노드 수, `globalState`는 수가 양수인 키만 `true`로 담은 객체이다. 상태 변화는 바뀐 키를 노드마다 일정 비용으로 세고, 0↔1 경계가 생길 때만 객체를 새로 만들어 루트의 `UpdateGlobalState`를 대기시킨다. 경계가 없으면 객체 참조와 사건을 유지한다. 트리당 키 수에 비례하는 Map 하나와 객체 하나가 상주하고 노드당 칸은 늘지 않는다. 쓰기/커밋마다 변화량 Map을 한 번 만들며 객체 재생성은 살아 있는 키 수에 비례한다(EVENT-062, 43C-01, LANDING-152·153, NODE-045).
- 진입 깊이, 되먹임/`onChange` 예산, 커밋 배달 대상 집합과 정착 밖 사건 대상 집합, 보고기, 검증기·모드, `onChange`·`onStateChange`, 경고 구조 키, 검증 스탬프와 노드 오류 맵, 진입 안에서 바뀐 비루트 외부 오류 노드 집합(`pendingExternalErrorNodes`, 진입 종료나 다음 전달 묶음 전에 루트 목록을 한 번 재구성하고 비움)과 노드별 루트 기여 목록(`externalContributions`, 노드가 마지막으로 루트에 보탠 참조들; 입양 때 넘겨받은 목록으로 채움)은 트리 런타임 칸이다. 열린 오류 수집기 안에서 새 진입이 열리면 `enclosingChain`의 바깥 연결로 오류와 기록의 수집 배열을 스택에 보존하고 종료 때 복원한다. 오류 없는 노드에 별도 오류 필드를 할당하지 않고, 새 슬롯은 이 선언을 먼저 고쳐야 한다(NODE-004·045, 26C-06, EVENT-004·045, ERROR-004·019·024·029, VALIDATE-049).
- `markFieldNodeEvent(node, bit, payload?)`는 같은 노드의 비트를 레코드의 대기 배달에 합치고 런타임 대상 집합에 등록한다. 정착 커밋은 바뀐 값·경로·자식 형상·계산 상태·유효 스키마·상호작용·Refresh 대상과 루트 진단을 표시하고 배달 집합 전체의 해당 `revisionLedger` 비트를 한 번에 올린다. 전달 일정과 리스너 호출은 `write`가 맡는다(EVENT-004·006·007·043·064·066·071, SETTLE-007).
- `FieldNodeDiagnostics.cause`는 `'budget' | 'expression' | 'injectTarget' | 'writeShape' | 'sharedConflict'`를 허용한다. 가상 노드에 받을 수 없는 자동 쓰기 모양은 `writeShape`로, 동적 주입 대상 없음은 `injectTarget`으로 기록한다(ERROR-122·132·195·198).
- 폼 속성 `disableAutomaticWrites`와 `unsetOnInactive`는 트리마다 하나인 런타임의 선택 칸이다. 호출 옵션은 전자를 호출 동안 덮고, 후자는 노드 자신의 정책이 없는 나감에서만 기본값이 된다. 폼 바인딩 이전에도 코어가 같은 우선순위를 시험할 수 있도록 보관한다(WRITE-015·031–040, NODE-045).
- `committedDeclarationIds`는 마지막 커밋에서 살아 있던 각 `(path, kind)` 발생의 활성 선언 ID만 보관한다. 정착은 현재 호출의 선택을 별도로 모았다가 커밋하고, 나감 판단에서는 직전 커밋의 ID를 읽는다. 잠복 원본의 이전 선언 정책을 판정할 때까지 항목을 유지한다(WRITE-032·034, NODE-045).
- `committedRuleValues`는 규칙 템플릿·발생 경로·종류를 키로 하여 `injectTo` 원천 방출 값, `derived` 의존 값 튜플, `unsetValue`·`resetInteraction`·`unsetOnInactive` 식 값을 보관한다. 던진 `unsetOnInactive` 식은 유지로 기록하고, 커밋은 평가한 발생만 바꾸며 나간 노드의 항목을 지운다. 정착 안의 소비 값은 작업 칸에 두고 로드는 범위 안의 커밋 기준을 비운다. 비용은 규칙 발생 수에 비례하고 규칙 없는 노드에는 별도 필드를 두지 않는다(SETTLE-004·028·048, WRITE-031·038, ERROR-122, NODE-004·045, 28C-05).
- `context`는 트리 생성 때 받은 맥락 객체 한 개이며 없으면 `{}`이다. `@`와 `injectTo`의 `ctx.context` 및 `node.context`는 이 참조를 읽고, 깊이 같은 맥락 갱신은 칸을 바꾸지 않는다(CONTROLS-080, SURFACE-055, NODE-004·045, 28C-03·08).
- `settlementTrace`는 개발 모드의 선택 칸 하나로 마지막 정착 기록 하나만 보유하고 정착마다 교체한다. `process.env.NODE_ENV !== 'production'`일 때만 진입·라운드별 규칙·결과·예산 초과 마지막 라운드 항목을 만들며 프로덕션은 기록과 칸을 만들지 않는다. 비용은 개발 모드에서 정착마다 기록 하나의 할당이고 프로덕션에서는 0이며, 노드별 고정 필드와 공개 멤버는 늘리지 않는다(ERROR-030·159, GOAL-086, NODE-004·045, 28C-01).
- 모든 런타임은 분석된 `blueprint`를 필수로 보유하여 식과 역의존 사전을 같은 연결에서 읽는다. 독립 레코드·탐색 시험도 작은 실제 청사진으로 런타임을 만든다. 재사용 정착 scratch는 중간 라운드에서 나간 노드를 최종 형상까지 보류하여 재진입 시 동일 레코드를 찾는다. `commitNumber`는 정착 호출마다 하나씩 증가하며 `refreshTargets`는 마지막 정착의 비로드 쓰기로 원본이 바뀐 경로 중 입력 출처로 쓴 자신을 제외한 집합이다. 하위 트리 로드 중 범위 밖에 쓴 주입 대상도 포함하며, 로드 범위 노드는 별도로 값의 변화와 무관하게 Refresh를 받는다(SETTLE-005·017·049, EVENT-039·071, NODE-045, 72C-01).
- `FieldNodeRuntime<Self>`는 루트의 `loadSnapshot`(WRITE-085), `misfitPaths`와 경로별 불일치 읽기 메모(VALUE-030·037), 변경된 슬롯 호스트 집합을 보유한다. 비활성 원본과 patch는 각 호스트의 `inactiveSlots`·`inactiveSlotOverlays`가 선언 발생별로 소유하며, 원본 인스턴스의 청사진과 호스트 바인딩으로 종류·문서 순서를 구별한다(NODE-043·044, WRITE-087). 비활성 값은 호스트별 첫 읽기에 materialize하고 값이 같으면 항목과 동결 배열의 참조를 재사용한다(VALUE-029). 슬롯 읽기 자료의 공간은 실제 보유 원본과 관측한 호스트에 비례한다. 이름이 정확히 `*`인 선언을 포함한 폼의 공표 호환 자료만 선택적 `literalStarRaw`·`literalStarValuesMemo`와 그 분류·항목 메모에 두며, 일반 폼에는 이 저장소를 만들지 않는다. 런타임 칸을 추가할 때는 `record/` 선언을 먼저 고쳐야 한다(26C-06, NODE-045).
- 슬롯 쓰기·삭제는 호스트의 직전 공표 바인딩을 보존하고 변경 호스트를 런타임의 `slotDirtyHosts`에 모은다. 다음 커밋은 변경 호스트와 살아 있는 조상의 `inactiveValuesDirty`만 세워 첫 읽기에 목록을 갱신하며, 떼어진 참조의 마지막 커밋 읽기와 영향 없는 호스트의 배열 참조는 유지한다. 별표 공표 호환 저장의 변경 표시와 열거 메모는 그 예외 폼에서만 사용한다(SETTLE-047, WRITE-087).
- 선택적 `detachedReads`는 트리당 `WeakMap<object, DetachedFieldNodeReads>` 하나이다. 각 이탈 노드의 마지막 커밋 `misfit`·`misfits`·`defaultValue`·`visible`·`readOnly`·`disabled`와 오류를 얼린 읽기 묶음으로 보존하며 재진입한 새 노드는 이 묶음을 사용하지 않는다. 일반 폼의 `inactiveValues`는 인스턴스가 보유한 불변 슬롯 읽기 자료로 첫 읽기에 계산하므로 나감 때 배열을 만들거나 전역 원본을 포착하지 않는다. 별표 공표 호환 폼만 마지막 공표 배열을 읽기 묶음에 보존한다. 이탈이 없는 트리에는 맵을 할당하지 않으며 레코드 고정 필드는 늘리지 않는다(NODE-004·044·045, 26C-06·10, 28C-02).
- `watchValues`는 유효 스키마의 `controls.watch` 경로를 방출 트리에서 읽은 배열이며 커밋 번호로 메모해 같은 커밋 안에서 같은 참조를 돌려준다. 트리당 읽기 메모의 비용이 들고 노드 고정 필드는 늘리지 않는다(CONTROLS-032·080, NODE-045, 28C-07).
- 선택적 `deliveryWatchIndex`는 트리당 감시 경로→살아 있는 노드의 역색인과 노드→경로 기록을 보유한다. 첫 감시 노드에서만 할당하고 노드가 형상을 떠나거나 유효 감시 경로가 바뀌면 갱신한다. 노드 고정 필드는 늘리지 않는다(NODE-045, EVENT-064, 44C-01).
- 선택적 `deliveredContext`는 배달 표시가 마지막으로 본 맥락 참조이며 `@` 감시 노드는 이 참조가 바뀐 커밋에서만 후보가 된다. 트리당 참조 칸 하나가 든다(NODE-045, 44C-01).
- 선택적 `settlementScratch?: SettlementScratch<Self>`는 트리의 노드 형으로 지정된 정착 작업 컨테이너를 첫 쓰기 뒤 재사용한다. `record`는 형만 선언하고 정착 구현은 가져오지 않는다. 비용은 트리당 런타임 슬롯 하나와 첫 쓰기 뒤 비운 Set·Map·배열 컨테이너의 상주 메모리이며, 중첩 쓰기 동안에만 별도 컨테이너가 추가된다. 노드별 필드·생성자 할당은 늘지 않는다(NODE-004·010·045, SETTLE-047).
- `SettlementScratch<Self>`는 소멸 노드 집합을 나감 대기와 따로 보관한다. 자동 쓰기의 배열 구조 기록은 호스트, 직전 순서의 아이템 노드 목록, 직전 `itemCount`, 직전 `undeclaredValues`를 담고 원본 B에서 거꾸로 재생하며, 재인덱싱으로 바뀐 노드와 자손의 `(previous, current)` 경로 사실도 보관한다. 이 자료는 정착 작업 칸이고 노드별 고정 칸이 아니다(NODE-004·045·051, WRITE-036, EVENT-068, 35C-02·05·09).
- 첫 정착의 구조화 경고는 선택적 `misfitRecords`에 마지막 커밋에서 새로 켜진 `MISFIT` 기록으로 둔다. `misfitsMemo`는 경로별 하위 목록과 그 행을 만든 커밋 번호를 묶으며, 정착은 불일치 집합이 바뀐 정착에서만 다시 만든다(`misfitPaths`의 변경 계수, 메모의 크기나 정체성이 마지막 만듦과 다를 때). 읽는 쪽은 `.paths`만 쓴다(`readFieldNodeMisfits`, `captureDetachedFieldNodeReads`). 통지·보고기를 소유할 뒤 단계가 기록의 전달을 맡고, 기록의 형은 정착 계약의 `level`, `code`, `path`, `expected`, `received`, `reason`, `candidates?`, `source`를 따른다(VALUE-037, 26C-03, 372C-02).
- `updateFieldNodeNameAndPath<Self extends { path: string; depth: number }>(node: FieldNodeRecord<Self>, name: string, parent: Self | null): void`는 JSON Pointer 이스케이프를 적용한 `escapedName`·절대 `path`·`depth`를 일관되게 고친다. 부모의 `path`·`depth`를 읽으므로 `Self`에 그 두 칸을 요구한다. 호출자가 영향받은 자손을 같은 함수로 갱신한다. `patchFieldNodeInteractionState<Self>(node: FieldNodeRecord<Self>, patch: Partial<NodeStateFlags>): void`는 `shallowPatch<State extends object>(previous: State, patch: Partial<State>): State`의 결과만 `interactionState`에 반영한다. 같은 키·값이면 이전 참조를 돌려준다(NODE-008, LANDING-082).
- `record`가 `settle`, `FieldNode`, `write`, `validation`, 앱·플러그인 및 레거시를 가져오는 일은 타입 전용 import까지 금지한다. 행이나 런타임 칸을 늘릴 때 이 선언을 먼저 고치는 것이 의존 역전의 비용이다(NODE-016·045, LANDING-159).

- `revisionLedger`의 이름과 비트별 읽기를 유지하면서 배달된 노드의 카운터는 알려진 17개 비트의 조밀한 슬롯에 보관한다. 내부 `FieldNodeRevisionLedger`는 진입점에서 정착·dispatch에 제공하며 비트 접근자는 슬롯을 읽는다. 변경된 원장만 슬롯 사본과 새 원장으로 교체하므로 읽기가 보관한 이전 원장은 바뀌지 않는다. 빈 원장은 공유 동결 상수이며 노드 고정 필드는 늘지 않는다. 노드의 첫 배달은 공유 빈 원장에서 비트를 읽어 복사하지 않고 빈 슬롯에서 시작한다(빈 원장의 비트 읽기는 모두 `undefined`이므로 결과가 같다). 비트별 증가 시점과 `revision(mask)` 합은 리스너와 무관하게 동일하다(EVENT-001·007, 65C-01, I11 step 1).
- 아직 전달하지 않은 배달 항목·비트별 페이로드/options 표와 커밋 비트 항목은 같은 대기열 안에서 갱신한다. dispatch가 파동을 전달하기 전에 표를 분리하므로 이미 리스너에게 건넨 사건·페이로드/options는 다음 표시가 수정하지 않는다. 마지막 정의된 값, 최초 삽입 순서와 개발 모드 페이로드 동결은 유지하며 반복 표시의 객체·표 복사를 없앤다(EVENT-004·006·007·023·024, 65C-01, I11 step 1).
- 계산·상태 변경의 현장 기록은 감시 역색인이 있을 때만 `deliveryAffectedPaths`에 영향 경로를 더한다. 이 경로 작업 집합은 정착 커밋에서 소비/삭제하고 변경 노드의 관측 필드를 다시 읽어 경로 집합을 재구축하지 않는다. 경로 이동 목록과 형상 출입 사실은 그대로 감시 색인 조회에 합류한다. 정적 watch 선언 색인과 affected 조회는 유지한다(65C-02·03, 372C-02).

## Acceptance Criteria

### record-retained-slots — 호스트 소유와 수명 상한

- 같은 이름의 다른 청사진 노드는 독립 슬롯이고, 슬롯은 공개 형상·상호작용·오류·구독의 재사용 통로가 아니다. 호스트당 슬롯 수는 방문한 엔트리 수 이하이며 반복 왕복이 보유 수를 늘리지 않는다. raw·extras의 overlay가 옛 인스턴스를 바꾸지 않고, 마지막 커밋의 비활성 읽기가 이후 교체·reset·배열 이동과 독립이다. 추가 자료의 실제 호스트별 보유 수와 바이트를 결과에 기록한다.

### record-layout — 고정 배치

- 모든 종류가 `children` 바로 뒤의 `itemKey`·`itemCount`·`nextItemKey`와 `active` 뒤의 `visible`·`readOnly`·`disabled`를 포함한 동일한 순서로 초기화된다. 아이템이 아닌 노드의 `itemKey`는 `null`, 배열 branch가 아닌 호스트의 `itemCount`는 `0`, 키 계수는 단조이고, 상태 칸은 `raw`·`undeclaredValues` 둘뿐이며 `children`은 저장 참조 그대로 읽힌다(NODE-004·010·045, GOAL-073, CONTROLS-082, VALUE-002, TEST-070, 35C-05).

### record-boundary — 최소 인터페이스

- 런타임의 규칙 값·맥락·개발 모드 기록은 트리 단위 칸이며 파생 구현을 타입으로도 가져오지 않고, 타입 전용 import를 포함한 의존 검사가 순환 0을 보이다(NODE-004·016·045, 26C-06, 28C-01·03).

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 형 칸의 형은 이름으로 진입점을 거쳐 behaviors·navigation·validation·derive·settle·write와 노드 겉면에 제공되며, 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

### `utils/` — 레코드 불변식의 공유 보조

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `shallowPatch`는 뒤 단계의 상태 쓰기와 상호작용 초기화가 함께 소비하지만 레코드의 상태 참조 불변식을 구현하므로 이 fractal에 남긴다. 외부 소비자는 레코드 진입점의 이름 붙은 수출만 사용한다(NODE-008, raw-round17 §4).

## Last Updated

2026-10-27. D2-P1 정적 전체 쓰기의 세대 표식·후퇴·verify 그림자와 메모리 비용.
