# record 계약

## Requirements

- `blueprint < record < {종류 동작, navigation} < settle/derive < settle < SchemaNode`의 방향을 값 import와 `import type`에 똑같이 적용합니다. `record`는 청사진의 선언 형만 소비하며 상위 엔진을 알지 않습니다(NODE-016·045).
- 고정 필드 집합은 모든 종류에 동일합니다. 생성자는 선언 순서대로 필드에 대입하고 생성자·필드 초기화식에 노드별 객체·배열·함수 할당을 두지 않습니다(NODE-004·010).

## API Contracts

- 진입점은 `SchemaNodeRecord`, `Behavior`, `UnionSpec`, `SchemaNodeFactory`, `SchemaNodeRuntime`, `SettlementScratch`, `updateSchemaNodeNameAndPath`, `patchSchemaNodeInteractionState`, `shallowPatch`를 이름으로 내보냅니다. 외부 소비자는 레코드의 진입점으로만 들어옵니다(NODE-008·016).
- `SchemaNodeRecord<Self>`의 논리 필드 선언·생성자 대입 순서는 다음과 같습니다: `behavior`, `runtime`, `blueprintNode`, `parent`, `rootNode`, `name`, `escapedName`, `path`, `depth`, `required`, `nullable`, `schemaType`, `structure`, `children`, `itemKey`, `itemCount`, `nextItemKey`, `raw`, `extras`, `active`, `visible`, `readOnly`, `disabled`, `local`, `emit`, `schema`, `state`, `revision`, `detached`. 세 상태 키 필드는 `active` 옆의 고정 배치이며 계산 끝에 최종 형상의 로컬 결합 결과로 씁니다(NODE-002·004·043·046·057, CONTROLS-082, SETTLE-003, 28C-02, 실행 ADR D3).
- `itemKey`는 배열 아이템의 생성 순서 nonce인 숫자이며 아이템이 아니면 `null`이고 공개 멤버로 노출하지 않습니다. 배열 branch 호스트의 `itemCount`는 청사진 없는 꼬리 자리를 포함한 값의 길이이며 그 밖에는 `0`입니다. 호스트의 `nextItemKey`는 새 아이템의 키 계수이고 원본 B 되돌림에서도 감소하지 않습니다. 세 필드는 모든 노드에 같은 고정 칸 세 개의 메모리 비용을 더하며 아이템 목록은 기존 `structure`에 둡니다(NODE-004·045·051·052, GOAL-073, SURFACE-054, 35C-05, 실행 ADR D3).
- 세 상태 키 필드의 메모리 대가는 노드당 고정 칸 세 개이며 `watchValues`는 필드 대신 읽기 메모를 씁니다(NODE-004·045, CONTROLS-032·082, 28C-07).
- 구현 클래스는 같은 자리에서 `rootNode`를 private `root`에 저장하고 getter로 읽으며, 다른 일부 공개 레코드 칸도 `stored*` 필드와 getter·setter로 구현합니다. `parent`·`rootNode`·`structure`의 노드 원소는 `Self`이고 구현은 `SchemaNode` 자기 타입을 사용합니다. `state`는 기존 공용 `NodeStateFlags`를 소비하고, `behavior`·`schemaType`은 수명 동안 같은 참조입니다(NODE-002·004·043·046·057, VALUE-002).
- `raw`·`extras`만 상태입니다. 객체 branch의 `raw`는 비객체 입력일 때만 남고, `extras`는 선언 밖 키를 받은 순서로 보관합니다. 종류별 잠복 잎 값은 해석된 `raw`, 잠복 호스트 값은 자신의 비객체 `raw`와 `extras`를 담은 `HostLatent`입니다(VALUE-002·004, NODE-044). `active`·`visible`·`readOnly`·`disabled`·`local`·`emit`·`schema`와 정합 경고등은 계산값, `revision`은 커밋 원장입니다(CONTROLS-082, SETTLE-003, NODE-004). branch 객체의 `structure`는 현재 형상의 이름→자식 맵이고 `children`은 공개 읽기가 그대로 돌려줄 저장 배열입니다. 형상 밖의 자식을 저장하지 않습니다(VALUE-002, NODE-043, TEST-070).
- `UnionSpec`은 `{ readonly kinds: Exclude<SchemaTypeName, 'null'> | readonly Exclude<SchemaTypeName, 'null'>[]; readonly mask: number; readonly nullable: boolean }`인 읽기 전용 계산 자료입니다. 단일 종류 행도 같은 구조를 쓰고 가상 행은 해석을 하지 않습니다. `Behavior<Self = unknown>`의 칸·순서는 `interpret(input: unknown, spec: UnionSpec): unknown`, `assemble<Node extends Self>(node: SchemaNodeRecord<Node>, children: readonly Node[], recalculated?: readonly Node[], hint?: { incremental: boolean }): unknown`, `project<Node extends Self>(node: SchemaNodeRecord<Node>, local: unknown): unknown`, `finishInput<Node extends Self>(node: SchemaNodeRecord<Node>): string | undefined`, `declareChildren<Node extends Self>(node: SchemaNodeRecord<Node>): readonly BlueprintChildEntry[]`, `arrange<Node extends Self>(node: SchemaNodeRecord<Node>, operation: ArrayOperation): ArrayArrangePlan`, `type: BlueprintNodeKind`, `strategy: 'branch' | 'terminal'`입니다. 행 호출은 레코드의 자기 형에 다형적이므로 표가 가진 행을 새 노드에 할당할 때 형 단언이 필요하지 않습니다. 반환값 `undefined`인 `finishInput`은 쓸 값 없음이고, `declareChildren`은 생성하지 않습니다. `arrange`도 순수 계획만 돌려주며 행은 원본 쓰기·되돌림·자식 확정·통지를 하지 않습니다(NODE-006·014, WRITE-093, 26C-01, 36C-01, 실행 ADR D1).
- `assemble`의 선택 인수 `recalculated`는 호스트 형상이 바뀌지 않은 쓰기에서 이번에 다시 계산한 직계 자식이고, 행은 그 자리만 이전 `local`의 사본에 고쳐 쓸 수 있습니다. 그렇게 한 행은 `hint.incremental`을 참으로 두어 정착이 전체 깊은 비교를 건너뛰게 합니다. 두 인수가 없으면 모든 자리를 다시 만듭니다(NODE-026, SETTLE-042, 44C-01).
- `record`는 다섯 동사를 구분하는 `ArrayOperation`과 branch·terminal을 구분하는 `ArrayArrangePlan` 형을 선언하고 진입점에서 이름으로 내보냅니다. branch 계획은 새 자리마다 이전 자리 색인 또는 생성 값, 무동작 여부, 반환 값의 출처를 담고 terminal 계획은 유효한 동사의 사본 위 새 `raw` 또는 무동작을 나타냅니다. 반환 출처는 `push`의 새 길이, `pop`·`remove`의 직전 커밋 아이템 값, `update`의 쓰기 뒤 아이템 값, `clear`의 `void`를 정착이 확정할 수 있게 구분합니다(SURFACE-005, GOAL-058, 35C-06, 36C-01, 실행 ADR D1).
- `SchemaNodeFactory<Self>`는 `(entry: BlueprintChildEntry | BlueprintNode, parent: Self | null, runtime: SchemaNodeRuntime<Self>): Self`입니다. 트리마다 하나인 구현을 런타임의 `nodeFactory`에 넣어 정착이 종류 구현을 import하지 않고 생성합니다(NODE-008·016·046).
- `SchemaNodeRuntime<Self>`는 `ifPredicates: ReadonlyMap<BlueprintGate, (gateInput: unknown) => boolean>`·`diagnostics`·`nodeFactory`와 트리 전체 자료를 보유합니다. 각 술어는 게이트 입력 하나를 동기적으로 받아 boolean을 돌려주고, 호스트 바퀴·전이 상한은 청사진에서 유도하며 루트 접근은 레코드의 `rootNode`를 사용합니다(TEST-069, 26C-01·04, ERROR-130·204, NODE-004·008·016·044·046, SETTLE-005·041).
- `SchemaNodeDiagnostics.cause`는 `'budget' | 'expression' | 'injectTarget' | 'writeShape' | 'sharedConflict'`를 허용합니다. 가상 노드에 받을 수 없는 자동 쓰기 모양은 `writeShape`로, 동적 주입 대상 없음은 `injectTarget`으로 기록합니다(ERROR-122·132·195·198).
- 폼 속성 `disableAutomaticWrites`와 `unsetOnInactive`는 트리마다 하나인 런타임의 선택 칸입니다. 호출 옵션은 전자를 호출 동안 덮고, 후자는 노드 자신의 정책이 없는 나감에서만 기본값이 됩니다. 폼 바인딩 이전에도 코어가 같은 우선순위를 시험할 수 있도록 보관합니다(WRITE-015·031–040, NODE-045).
- `committedDeclarationIds`는 마지막 커밋에서 살아 있던 각 `(path, kind)` 발생의 활성 선언 ID만 보관합니다. 정착은 현재 호출의 선택을 별도로 모았다가 커밋하고, 나감 판단에서는 직전 커밋의 ID를 읽습니다. 잠복 원본의 이전 선언 정책을 판정할 때까지 항목을 유지합니다(WRITE-032·034, NODE-045).
- `committedRuleValues`는 규칙 템플릿·발생 경로·종류를 키로 하여 `injectTo` 원천 방출 값, `derived` 의존 값 튜플, `unsetValue`·`resetInteraction`·`unsetOnInactive` 식 값을 보관합니다. 던진 `unsetOnInactive` 식은 유지로 기록하고, 커밋은 평가한 발생만 바꾸며 나간 노드의 항목을 지웁니다. 정착 안의 소비 값은 작업 칸에 두고 로드는 범위 안의 커밋 기준을 비웁니다. 비용은 규칙 발생 수에 비례하고 규칙 없는 노드에는 별도 필드를 두지 않습니다(SETTLE-004·028·048, WRITE-031·038, ERROR-122, NODE-004·045, 28C-05).
- `context`는 트리 생성 때 받은 맥락 객체 한 개이며 없으면 `{}`입니다. `@`와 `injectTo`의 `ctx.context` 및 `node.context`는 이 참조를 읽고, 깊이 같은 맥락 갱신은 칸을 바꾸지 않습니다(CONTROLS-080, SURFACE-055, NODE-004·045, 28C-03·08).
- `settlementTrace`는 개발 모드의 선택 칸 하나로 마지막 정착 기록 하나만 보유하고 정착마다 교체합니다. `process.env.NODE_ENV !== 'production'`에서만 진입·라운드별 규칙·결과·예산 초과 마지막 라운드 항목을 만들며 프로덕션은 기록과 칸을 만들지 않습니다. 비용은 개발 모드에서 정착마다 기록 하나의 할당이고 프로덕션에서는 0이며, 노드별 고정 필드와 공개 멤버는 늘리지 않습니다(ERROR-030·159, GOAL-086, NODE-004·045, 28C-01).
- 모든 런타임은 분석된 `blueprint`를 필수로 보유하여 식과 역의존 사전을 같은 연결에서 읽습니다. 독립 레코드·탐색 시험도 작은 실제 청사진으로 런타임을 만듭니다. 재사용 정착 scratch는 중간 라운드에서 나간 노드를 최종 형상까지 보류하여 재진입 시 동일 레코드를 찾습니다. `commitNumber`는 정착 호출마다 하나씩 증가하며 `refreshTargets`는 마지막 비로드 쓰기에서 원본이 바뀐 입력 이외의 경로 집합입니다(SETTLE-005·017, EVENT-071, NODE-045).
- `SchemaNodeRuntime<Self>`의 루트 보유 자료는 `loadSnapshot`(WRITE-085), `latentRaw`(NODE-043·044, WRITE-087), `typeMismatchPaths`(VALUE-030·037), `inactiveValuesMemo`와 항목 재사용 메모(VALUE-029, WRITE-087)입니다. 잠복 원본의 `(절대 path, kind)` 항목은 값, 분류용 청사진 노드, 재귀 발생까지 구별하는 문서 순서 키를 함께 보유합니다. 항목 재사용 메모는 열거 대상의 직전 값·얼린 항목 객체를 보유하여 같은 값의 참조를 유지합니다. 트리당 메모가 잠복 항목 수와 조상 경로 수에 비례해 늘지만 노드 고정 필드·생성자 할당은 늘지 않습니다. 루트는 이 자료를 별도 레코드 필드 없이 자신의 런타임을 통해 보유하며, 런타임 칸을 추가할 때는 `record/` 선언을 먼저 고쳐야 합니다(26C-06, NODE-045).
- 선택적 잠복 변경 표시는 잠복 원본의 쓰기·삭제 뒤 다음 커밋에서 열거 메모를 갱신하도록 합니다. 일반 입력 쓰기는 잠복 집합·값이 같으면 변경 표시를 켜지 않아 열거 전체를 다시 걷지 않습니다. 이 표시는 노드 고정 필드가 아니라 트리 런타임의 작업 상태입니다(SETTLE-047, WRITE-087).
- 선택적 `detachedReads`는 트리당 `WeakMap<object, DetachedSchemaNodeReads>` 하나입니다. 각 이탈 노드의 마지막 커밋 `typeMismatch`·`typeMismatches`·`inactiveValues`·`defaultValue`·`visible`·`readOnly`·`disabled`를 얼린 읽기 묶음으로 보존하며 재진입한 새 노드는 이 묶음을 사용하지 않습니다. 이탈이 없는 트리에는 맵을 할당하지 않고, 이탈 노드당 세 읽기 칸이 늘되 레코드 고정 필드는 늘리지 않습니다(NODE-004·044·045, 26C-06·10, 28C-02).
- `watchValues`는 유효 스키마의 `controls.watch` 경로를 방출 트리에서 읽은 배열이며 커밋 번호로 메모해 같은 커밋 안에서 같은 참조를 돌려줍니다. 트리당 읽기 메모의 비용이 들고 노드 고정 필드는 늘리지 않습니다(CONTROLS-032·080, NODE-045, 28C-07).
- 선택적 `settlementScratch?: SettlementScratch<Self>`는 트리의 노드 형으로 지정된 정착 작업 컨테이너를 첫 쓰기 뒤 재사용합니다. `record`는 형만 선언하고 정착 구현은 가져오지 않습니다. 비용은 트리당 런타임 슬롯 하나와 첫 쓰기 뒤 비운 Set·Map·배열 컨테이너의 상주 메모리이며, 중첩 쓰기 동안에만 별도 컨테이너가 추가됩니다. 노드별 필드·생성자 할당은 늘지 않습니다(NODE-004·010·045, SETTLE-047).
- `SettlementScratch<Self>`는 소멸 노드 집합을 나감 대기와 따로 보관합니다. 자동 쓰기의 배열 구조 기록은 호스트, 직전 순서의 아이템 노드 목록, 직전 `itemCount`, 직전 `extras`를 담고 원본 B에서 거꾸로 재생하며, 재인덱싱으로 바뀐 노드와 자손의 `(previous, current)` 경로 사실도 보관합니다. 이 자료는 정착 작업 칸이고 노드별 고정 칸이 아닙니다(NODE-004·045·051, WRITE-036, EVENT-068, 35C-02·05·09).
- 첫 정착의 구조화 경고는 선택적 `typeMismatchRecords`에 마지막 커밋에서 새로 켜진 `TYPE_MISMATCH` 기록으로 둡니다. `typeMismatchesMemo`는 커밋 번호와 경로별 하위 목록을 묶으며 정착이 커밋마다 다시 채웁니다. 통지·보고기를 소유할 뒤 단계가 기록의 전달을 맡고, 기록의 형은 정착 계약의 `level`, `code`, `path`, `expected`, `received`, `reason`, `candidates?`, `source`를 따릅니다(VALUE-037, 26C-03).
- `updateSchemaNodeNameAndPath<Self extends { path: string; depth: number }>(node: SchemaNodeRecord<Self>, name: string, parent: Self | null): void`는 JSON Pointer 이스케이프를 적용한 `escapedName`·절대 `path`·`depth`를 일관되게 고칩니다. 부모의 `path`·`depth`를 읽으므로 `Self`에 그 두 칸을 요구합니다. 호출자가 영향받은 자손을 같은 함수로 갱신합니다. `patchSchemaNodeInteractionState<Self>(node: SchemaNodeRecord<Self>, patch: Partial<NodeStateFlags>): void`는 `shallowPatch<State extends object>(previous: State, patch: Partial<State>): State`의 결과만 `state`에 반영합니다. 같은 키·값이면 이전 참조를 돌려줍니다(NODE-008, LANDING-082).
- `record`가 `settle`, `SchemaNode`, `dispatch`, `validation`, 앱·플러그인 및 레거시를 가져오는 일은 타입 전용 import까지 금지합니다. 행이나 런타임 칸을 늘릴 때 이 선언을 먼저 고치는 것이 의존 역전의 비용입니다(NODE-016·045, LANDING-159).

## Acceptance Criteria

### record-layout — 고정 배치

- 모든 종류가 `children` 바로 뒤의 `itemKey`·`itemCount`·`nextItemKey`와 `active` 뒤의 `visible`·`readOnly`·`disabled`를 포함한 동일한 순서로 초기화됩니다. 아이템이 아닌 노드의 `itemKey`는 `null`, 배열 branch가 아닌 호스트의 `itemCount`는 `0`, 키 계수는 단조이고, 상태 칸은 `raw`·`extras` 둘뿐이며 `children`은 저장 참조 그대로 읽힙니다(NODE-004·010·045, GOAL-073, CONTROLS-082, VALUE-002, TEST-070, 35C-05).

### record-boundary — 최소 인터페이스

- 런타임의 규칙 값·맥락·개발 모드 기록은 트리 단위 칸이며 파생 구현을 타입으로도 가져오지 않고, 타입 전용 import를 포함한 의존 검사가 순환 0을 보입니다(NODE-004·016·045, 26C-06, 28C-01·03).

## Boundary Exemptions

### `utils/` — 레코드 불변식의 공유 보조

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `shallowPatch`는 뒤 단계의 상태 쓰기와 상호작용 초기화가 함께 소비하지만 레코드의 상태 참조 불변식을 구현하므로 이 fractal에 남깁니다. 외부 소비자는 레코드 진입점의 이름 붙은 수출만 사용합니다(NODE-008, raw-round17 §4).

## Last Updated

2026-10-01
