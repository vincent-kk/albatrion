# record 계약

## Requirements

- `blueprint < record < {종류 동작, navigation} < settle < SchemaNode`의 방향을 값 import와 `import type`에 똑같이 적용합니다. `record`는 청사진의 선언 형만 소비하며 상위 엔진을 알지 않습니다(NODE-016·045).
- 고정 필드 집합은 모든 종류에 동일합니다. 생성자는 선언 순서대로 필드에 대입하고 생성자·필드 초기화식에 노드별 객체·배열·함수 할당을 두지 않습니다(NODE-004·010).

## API Contracts

- 진입점은 `SchemaNodeRecord`, `Behavior`, `UnionSpec`, `SchemaNodeFactory`, `SchemaNodeRuntime`, `updateSchemaNodeNameAndPath`, `patchSchemaNodeInteractionState`, `shallowPatch`를 이름으로 내보냅니다. 외부 소비자는 레코드의 진입점으로만 들어옵니다(NODE-008·016).
- `SchemaNodeRecord<Self>`의 필드 선언·생성자 대입 순서는 다음과 같습니다. `behavior`, `runtime`, `blueprintNode`, `parent`, `rootNode`, `name`, `escapedName`, `path`, `depth`, `required`, `nullable`, `schemaType`, `structure`, `children`, `raw`, `extras`, `active`, `local`, `emit`, `schema`, `state`, `revision`, `detached`. `parent`·`rootNode`·`structure`의 노드 원소는 `Self`이고 구현에서는 `AnyNode`를 대입합니다. `state`는 기존 공용 `NodeStateFlags`를 소비하고, `behavior`·`schemaType`은 수명 동안 같은 참조입니다(NODE-002·004·043·046·057, VALUE-002).
- `raw`·`extras`만 상태입니다. `active`·`local`·`emit`·`schema`와 정합 경고등은 계산값, `revision`은 커밋 원장입니다. branch 객체의 `structure`는 현재 형상의 이름→자식 맵이고 `children`은 공개 읽기가 그대로 돌려줄 저장 배열입니다. 형상 밖의 자식을 저장하지 않습니다(VALUE-002, NODE-043, TEST-070).
- `UnionSpec`은 `{ readonly kinds: Exclude<SchemaTypeName, 'null'> | readonly Exclude<SchemaTypeName, 'null'>[]; readonly mask: number; readonly nullable: boolean }`인 읽기 전용 계산 자료입니다. 단일 종류 행도 같은 구조를 쓰고 가상 행은 해석을 하지 않습니다. `Behavior<Self = unknown>`의 칸·순서는 `interpret(input: unknown, spec: UnionSpec): unknown`, `assemble(node: SchemaNodeRecord<Self>, children: readonly Self[]): unknown`, `project(node: SchemaNodeRecord<Self>, local: unknown): unknown`, `finishInput(node: SchemaNodeRecord<Self>): string | undefined`, `declareChildren(node: SchemaNodeRecord<Self>): readonly BlueprintChildEntry[]`, `type: BlueprintNodeKind`, `strategy: 'branch' | 'terminal'`입니다. 반환값 `undefined`인 `finishInput`은 쓸 값 없음이고, `declareChildren`은 생성하지 않습니다. 행은 계산만 하고 원본 쓰기·되돌림·자식 확정·통지를 하지 않습니다. 배열 연산 칸은 PR-5에서 계약을 먼저 고친 뒤 넣습니다(NODE-006·014, WRITE-093, 26C-01).
- `SchemaNodeFactory<Self>`는 `(entry: BlueprintChildEntry | BlueprintNode, parent: Self | null, runtime: SchemaNodeRuntime<Self>): Self`입니다. 트리마다 하나인 구현을 런타임의 `nodeFactory`에 넣어 정착이 종류 구현을 import하지 않고 생성합니다(NODE-008·016·046).
- `SchemaNodeRuntime<Self>`의 PR-2 공통 칸은 `ifPredicates: ReadonlyMap<BlueprintGate, (gateInput: unknown) => boolean>`(TEST-069, 26C-04), `diagnostics`(ERROR-130·204), `budgets: { hostWheel: number; transition: number }`(SETTLE-005·011), `nodeFactory`(NODE-008·016·046)입니다. 각 술어는 게이트 입력 하나를 동기적으로 받아 boolean을 돌려줍니다. `entryDepth`는 PR-4에서 추가하며 루트 접근은 레코드의 `rootNode`를 사용합니다(TEST-069, NODE-004·044). 이후 PR의 통지 대기열·검증기·보고기·파생·배열 슬롯은 해당 기제를 들일 때 추가합니다(26C-01, NODE-045).
- 폼 속성 `disableAutomaticWrites`와 `unsetOnInactive`는 트리마다 하나인 런타임의 선택 칸입니다. 호출 옵션은 전자를 호출 동안 덮고, 후자는 노드 자신의 정책이 없는 나감에서만 기본값이 됩니다. 폼 바인딩 이전에도 코어가 같은 우선순위를 시험할 수 있도록 보관합니다(WRITE-015·031–040, NODE-045).
- `committedDeclarationIds`는 마지막 커밋에서 살아 있던 각 `(path, kind)` 발생의 활성 선언 ID만 보관합니다. 정착은 현재 호출의 선택을 별도로 모았다가 커밋하고, 나감 판단에서는 직전 커밋의 ID를 읽습니다. 잠복 원본의 이전 선언 정책을 판정할 때까지 항목을 유지합니다(WRITE-032·034, NODE-045).
- 모든 런타임은 분석된 `blueprint`를 필수로 보유하여 식과 역의존 사전을 같은 연결에서 읽습니다. 독립 레코드·탐색 시험도 작은 실제 청사진으로 런타임을 만듭니다. `commitNumber`는 정착 호출마다 하나씩 증가하며 `refreshTargets`는 마지막 비로드 쓰기에서 원본이 바뀐 입력 이외의 경로 집합입니다(SETTLE-017, EVENT-071, NODE-045).
- `SchemaNodeRuntime<Self>`의 루트 보유 자료 네 칸은 `loadSnapshot`(WRITE-085), `latentRaw`(NODE-043·044, WRITE-087), `typeMismatchPaths`(VALUE-030·037), `inactiveValuesMemo`(VALUE-029, WRITE-087)입니다. 루트는 이 자료를 별도 레코드 필드 없이 자신의 런타임을 통해 보유하며, 런타임 칸을 추가할 때는 `record/` 선언을 먼저 고쳐야 합니다(26C-06, NODE-045).
- 첫 정착의 구조화 경고는 선택적 `typeMismatchRecords`에 마지막 커밋에서 새로 켜진 `TYPE_MISMATCH` 기록으로 둡니다. `typeMismatchesMemo`는 커밋 번호와 경로별 하위 목록을 묶으며 정착이 커밋마다 다시 채웁니다. 통지·보고기를 소유할 뒤 단계가 기록의 전달을 맡고, 기록의 형은 정착 계약의 `level`, `code`, `path`, `expected`, `received`, `reason`, `candidates?`, `source`를 따릅니다(VALUE-037, 26C-03).
- `updateSchemaNodeNameAndPath<Self extends { path: string; depth: number }>(node: SchemaNodeRecord<Self>, name: string, parent: Self | null): void`는 JSON Pointer 이스케이프를 적용한 `escapedName`·절대 `path`·`depth`를 일관되게 고칩니다. 부모의 `path`·`depth`를 읽으므로 `Self`에 그 두 칸을 요구합니다. 호출자가 영향받은 자손을 같은 함수로 갱신합니다. `patchSchemaNodeInteractionState<Self>(node: SchemaNodeRecord<Self>, patch: Partial<NodeStateFlags>): void`는 `shallowPatch<State extends object>(previous: State, patch: Partial<State>): State`의 결과만 `state`에 반영합니다. 같은 키·값이면 이전 참조를 돌려줍니다(NODE-008, LANDING-082).
- `record`가 `settle`, `SchemaNode`, `dispatch`, `validation`, 앱·플러그인 및 레거시를 가져오는 일은 타입 전용 import까지 금지합니다. 행이나 런타임 칸을 늘릴 때 이 선언을 먼저 고치는 것이 의존 역전의 비용입니다(NODE-016·045, LANDING-159).

## Acceptance Criteria

### record-layout — 고정 배치

- 모든 종류가 동일한 필드 순서로 초기화되고, 상태 칸은 `raw`·`extras` 둘뿐이며 `children`은 저장 참조 그대로 읽힙니다(NODE-004·010, VALUE-002, TEST-070).

### record-boundary — 최소 인터페이스

- PR-2 런타임에는 뒤 PR의 주입 자리나 배열 연산 칸이 없고, 타입 전용 import를 포함한 의존 검사가 순환 0을 보입니다(NODE-045·016, 26C-01).

## Boundary Exemptions

### `utils/` — 레코드 불변식의 공유 보조

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `shallowPatch`는 뒤 단계의 상태 쓰기와 상호작용 초기화가 함께 소비하지만 레코드의 상태 참조 불변식을 구현하므로 이 fractal에 남깁니다. 외부 소비자는 레코드 진입점의 이름 붙은 수출만 사용합니다(NODE-008, raw-round17 §4).

## Last Updated

2026-09-30
