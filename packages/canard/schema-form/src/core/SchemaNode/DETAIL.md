# SchemaNode 겉면 계약

## Requirements

- 의존 방향의 마지막은 `record < {behaviors 종류, navigation} < validation < settle/derive < settle < dispatch < SchemaNode`입니다. 이 fractal만 행 선택과 단일 클래스 생성을 함께 압니다. 쓰기·상태·검증·구독은 `dispatch`, 읽기는 `settle`·`validation`·`navigation`의 진입점에 위임합니다(NODE-010·016, LANDING-084).
- 제품 코드는 내부 구현을 진입점 밖에서 직접 소비하지 않습니다(NODE-016). 경계 예외는 하나입니다: core 시나리오 러너 도우미(`src/core/__tests__/scenarios/utils/`)는 settle 진입 함수가 받는 런타임 레코드 형을 위해 `SchemaNode/SchemaNode.ts`의 클래스 형만 `import type`으로 직접 읽습니다. 진입점은 공개 합집합 형만 내보내므로 시험을 위해 넓히지 않습니다(filid 경계 규칙 §5. 실행 ADR D7에서 벗어남 — 계획 로그 §4).
- 아래 멤버 표가 클래스 프로토타입과 공개 형의 정확한 목록입니다. 기제가 들어오는 단계에서 멤버 표·멤버 목록 시험·공개 형을 함께 갱신하며 스텁·시험 전용 주입 자리를 두지 않습니다(26C-01, NODE-010, LANDING-066, 28C-07·08).

## API Contracts

- 진입점은 클래스 이름과 겹치는 런타임 생성자를 내보내지 않고 공개 판별 합집합 `SchemaNode` 타입, 종류별 노드 타입, 가드 열, `InferSchemaNode`, 공개 옵션 `SetValueOption`, `schemaNodeFactory`와 `record`가 소유한 `SchemaNodeEventType`·`SchemaNodeRequestType`을 이름으로 내보냅니다. 두 열거는 07의 소비자 이주까지 새 엔진 표면에만 있으며 옛 `core/types/event.ts`와 별개입니다(SURFACE-056·060, EVENT-073, LANDING-158). `schemaNodeFactory(schema: Blueprint, runtimeSeed: SchemaNodeRuntimeSeed): SchemaNode`는 팩토리가 결합하는 `nodeFactory`·`blueprint` 칸과 정착이 지연 생성하는 `settlementScratch` 칸을 제외한 트리 입력을 받습니다. 트리마다 한 번 완성한 런타임에 실제 생성 함수를 결합합니다. 청사진 `kind`·`strategy`로 `BEHAVIORS[type][strategy]`를 골라 같은 클래스의 인스턴스를 만듭니다(NODE-008·010·045·046, WRITE-015). 빈 생성 함수 스텁을 호출자에게 요구하지 않습니다.
- 아래 표의 `getter`는 필드 또는 계산 메모 읽기이며 `method`는 문장 하나의 위임입니다. 구현 클래스는 `SchemaNodeRecord<SchemaNode>`를 구현하고 위임 메서드에서 `SchemaNode` 자기 타입을 전달합니다. 종류별 생성 표·`InferSchemaNode` overload로 단언 없이 좁힙니다(NODE-046).

| 멤버 | 종류 | 위임·읽기 대상 | 원장 |
| --- | --- | --- | --- |
| `type` | getter | `behavior.type` | NODE-002 |
| `strategy` | getter | `behavior.strategy` | NODE-002·047 |
| `schemaType` | getter | 레코드의 청사진 고정 칸 | NODE-057·058 |
| `jsonSchema` | getter | 유효 `schema.schema` | BLUEPRINT-041, NODE-058 |
| `required` | getter | 레코드 선언 칸 | NODE-004 |
| `nullable` | getter | 레코드의 청사진 고정 칸 | NODE-057 |
| `depth` | getter | 레코드 깊이 | NODE-004 |
| `isRoot` | getter | 레코드의 부모 유무 | NODE-004 |
| `rootNode` | getter | 레코드의 루트 참조 | NODE-004·044 |
| `parentNode` | getter | 레코드의 부모 참조 | NODE-004·044 |
| `name` | getter | 레코드 이름 | NODE-008 |
| `escapedName` | getter | 레코드 이스케이프 이름 | NODE-008 |
| `path` | getter | 레코드 절대 경로 | NODE-008·054 |
| `children` | getter | 현재 형상의 저장 배열 그대로 | NODE-043, TEST-070 |
| `raw` | getter | 잎·터미널의 해석된 원본 또는 branch 호스트의 잘못된 종류 원본. 객체·배열 입력은 각 자식에 분배되어 branch 호스트에는 저장되지 않음 | VALUE-002·004, NODE-021, 26C-01 |
| `extras` | getter | 객체 branch의 선언 밖 키 또는 배열 branch의 청사진 없는 꼬리 자리 값을 받은 순서로 보관하는 상태 칸 | VALUE-002·004, NODE-052, 26C-01 |
| `value` | getter | 계산된 `local` | VALUE-027 |
| `outputValue` | getter | 계산된 `emit` | VALUE-027·034 |
| `inactiveValues` | getter | 살아 있으면 루트 잠복 원본 메모, 떼어졌으면 마지막 커밋에 동결한 목록 | VALUE-029, WRITE-087, NODE-044 |
| `active` | getter | 최종 형상에 있는가. 정착 중 임시 이탈 뒤 재진입한 노드는 같은 인스턴스로 참이고, 최종 이탈해 떼어진 옛 참조는 다시 들어도 거짓입니다. NODE-044의 마지막 커밋 고정에서 빠지는 살아 있는 트리의 사실 | LANDING-062, 26C-04, 26C-08 |
| `visible` | getter | 레코드 `visible`의 로컬 AND 결과. 떼어지면 마지막 커밋 값으로 고정 | (CONTROLS-022·082, NODE-044, 28C-02) |
| `enabled` | getter | `active && visible`. 살아 있으면 `visible`과 같고 `disabled`와 무관하며 떼어지면 거짓 | (LANDING-066, 26C-08, 28C-02) |
| `readOnly` | getter | 레코드 `readOnly`의 표준·로컬 OR 결과. Form 속성 전체 잠금은 포함하지 않고 떼어지면 고정 | (CONTROLS-023·082, 28C-02) |
| `disabled` | getter | 레코드 `disabled`의 로컬 OR 결과. Form 속성 전체 잠금은 포함하지 않고 떼어지면 고정 | (CONTROLS-023·082, 28C-02) |
| `watchValues` | getter | settle의 `readSchemaNodeWatchValues`가 유효 스키마 `controls.watch` 경로를 방출 트리에서 읽은 배열. 같은 커밋에서는 같은 참조 | (CONTROLS-032·080, LANDING-137, 28C-07) |
| `context` | getter | 트리 런타임 `context` 칸의 같은 참조 | (SURFACE-055, CONTROLS-080, 28C-08) |
| `typeMismatch` | getter | 살아 있으면 현재 경고등, 떼어졌으면 마지막 커밋의 경고등 | VALUE-030·037, SURFACE-061, NODE-044 |
| `typeMismatches` | getter | 살아 있으면 하위 경로 목록 메모, 떼어졌으면 마지막 커밋의 목록 | VALUE-030·037, SURFACE-061, NODE-044 |
| `diagnostics` | getter | 떼어진 참조에서도 살아 있는 트리 런타임의 진단을 읽는 NODE-044 예외 | ERROR-131·204, SURFACE-007 |
| `defaultValue` | getter | 살아 있으면 루트 로드 스냅숏, 떼어졌으면 마지막 커밋의 자기 경로 값 | WRITE-085, NODE-044 |
| `find(pointer)` | method | `navigation.find` | NODE-043·046·054 |
| `findNodes(pointer)` | method | `navigation.findNodes` | NODE-043·046·054 |
| `setValue(value, option?)` | method | `dispatch.dispatchSetValue`가 정착 사슬을 조율 | NODE-010, WRITE-079·096, LANDING-064 |
| `push(value?)` | method | `settle.arrangeSchemaNodeItems`가 `behavior.arrange` 계획을 적용; 동기적으로 새 길이 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `pop()` | method | 같은 구조 진입; 빠진 아이템의 직전 커밋 `value` 또는 `undefined` 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `update(index, value)` | method | 같은 구조 진입; 쓰기 뒤 아이템 `value` 또는 범위 밖이면 `undefined` 반환 | NODE-010·014, SURFACE-005, 35C-06 |
| `remove(index)` | method | 같은 구조 진입; 빠진 아이템의 직전 커밋 `value` 또는 `undefined` 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `clear()` | method | 같은 구조 진입; 동기적으로 `void` 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `resetSubtree(option?)` | method | `dispatch.dispatchResetSubtree` | WRITE-085, SETTLE-049, LANDING-064 |
| `request(kind: SchemaNodeRequestType)` | method | `dispatch.dispatchRequest`; `Focus`·`Select`·`Refresh`·`Remount` 가운데 하나 | EVENT-063·073, SURFACE-058 |
| `subscribe(listener)` | method | `dispatch.subscribeSchemaNode`; 해지 함수 반환 | EVENT-001·011, LANDING-064 |
| `revision(mask?)` | method | `dispatch.readSchemaNodeRevision`; 비트별 배달 원장의 합 | EVENT-001·007, REACT-006 |
| `validate()` | method | `dispatch.dispatchValidate`; 새 판정 Promise 반환 | VALIDATE-049, LANDING-064 |
| `errors` | getter | `validation.readSchemaNodeErrors`; 노드에 배정된 오류 | VALIDATE-043, SURFACE-053 |
| `setExternalErrors(errors)` | method | `dispatch.dispatchSetExternalErrors` | EVENT-045, SURFACE-053 |
| `clearExternalErrors()` | method | `dispatch.dispatchClearExternalErrors` | EVENT-045, SURFACE-053 |
| `state` | getter/setter | 레코드의 `interactionState` 읽기; 쓰기는 `dispatch.dispatchSetState` | EVENT-012·067, NODE-010 |
| `setState(state)` | method | `dispatch.dispatchSetState` | EVENT-012·067, SURFACE-053 |
| `globalState` | getter | 트리 런타임의 키별 참 노드 수에서 유도된 현재 `globalState` 읽기; 떼어진 참조도 같은 런타임을 읽음 | EVENT-062, SURFACE-053, NODE-044, 43C-01 |
| `globalErrors` | getter | 루트의 전체 검증 오류 목록 | VALIDATE-043, SURFACE-053 |
| `setSubtreeState(state)` | method | `dispatch.dispatchSetSubtreeState` | EVENT-067, NODE-010 |
| `clearSubtreeState()` | method | `dispatch.dispatchClearSubtreeState` | EVENT-067, NODE-010 |
| `batch(fn: () => void)` | method | `dispatch.dispatchBatch` | EVENT-013–019·061, SURFACE-008 |

- 배열 동사 다섯은 클래스에서 종류를 검사하지 않고 정착의 구조 진입 함수에 한 문장으로 위임합니다. 그 함수가 행의 `arrange` 칸을 거쳐 순수 계획을 받아 적용하며 비배열 행은 공유 칸 하나가 `SchemaFormError`를 즉시 던집니다. 메서드는 Promise를 돌려주지 않고, 무동작의 반환은 각 계획의 반환 출처를 따릅니다(NODE-010·014, ERROR-197, GOAL-058, 35C-01·06, 36C-01, 실행 ADR D1·D4).
- 클래스 파일에는 레코드 순서의 저장 필드, 상수 읽기 게터, 한 문장 위임만 둡니다. 정착이 쓰는 공개 레코드 칸은 같은 이름의 게터와 한 문장 저장 세터를 짝지어 프로토타입 이름을 유지합니다. 생성자는 고정 선언 순서의 대입만 하고 필드 초기화식과 생성자에 객체·배열 리터럴·함수·`new`를 두지 않습니다. `type`·`strategy` 분기는 가드 외에는 행에서만 합니다. 공개 인터페이스가 멤버 주석의 정본이고 클래스는 `{@inheritDoc}`로 가리킵니다(NODE-010·049).
- 공개 `SchemaNode`는 `type`으로 판별하는 `StringNode | NumberNode | BooleanNode | NullNode | ObjectNode | ArrayNode | VirtualNode | UnionNode`입니다. `schemaType`은 차례로 `'string'`, `'number' | 'integer'`, `'boolean'`, `'null'`, `'object'`, `'array'`, `'virtual'`, `UnionSchemaType`으로 좁힙니다. `UnionMemberType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'`이고 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`입니다(NODE-057·058).
- 다섯 배열 메서드의 공개 형은 이 합집합의 `ArrayNode` 구성원에만 두고 branch·terminal 두 전략이 같은 서명을 가집니다. `type`으로 좁히지 않은 다른 노드 형에는 메서드가 없으며, 런타임에서 비배열 호출을 시도하면 행의 거부 칸이 처리합니다(NODE-010·014, SURFACE-005, TEST-070, 26C-01, 35C-01).
- `UnionNode`는 `type: 'union'`, `strategy: 'terminal'`, `children: null`이고 `typeMismatch: false`일 때 `value`는 허용 종류의 값·`undefined`·nullable일 때 `null`, `typeMismatch: true`일 때 `value: unknown`인 두 구성원으로 나뉩니다. `typeMismatch`는 `node.type`이 아니라 현재 `schemaType`·유효 목록과 `nullable` 기준이며 `false`는 검증 통과가 아닙니다(NODE-058, VALUE-037, SURFACE-061).
- union 입력의 `FormTypeInputProps`는 `value`에 같은 판별 결과를 보여 주고 `onChange`는 목록 종류의 값과 `undefined`, nullable일 때만 `null`을 받습니다. `typeMismatch: true`의 `value: unknown`을 그대로 `onChange`의 허용 범위로 넓히지 않습니다. `ObjectValue`·`ArrayValue`를 포함한 객체·배열 원본 참조는 변환하지 않습니다(NODE-058, VALUE-037).
- 공개 가드 열은 `isSchemaNode`, `isStringNode`, `isNumberNode`, `isBooleanNode`, `isObjectNode`, `isArrayNode`, `isVirtualNode`, `isUnionNode`, `isBranchNode`, `isTerminalNode`입니다. 첫째는 단일 클래스 `instanceof`, 종류 가드 일곱은 `type`, 마지막 둘은 `strategy`를 봅니다. `isNullNode`는 소비자가 없어 내보내지 않습니다. `isTerminalNode`는 union과 터미널 객체도 좁힙니다(NODE-015·041, raw-round17 §4).
- `InferSchemaNode<Schema>`는 타입 배열의 null을 nullable로 떼고 integer를 종류 판정에서 number로 접어 한 종류면 그 노드, 둘 이상이면 `UnionNode`, null만이면 `NullNode`로 사상합니다. 형 없는 원시 분기는 종류 합집합으로, 전부 인라인 객체·배열인 분기는 각각 `ObjectNode`·`ArrayNode`로, 분기 없는 단일 종류 `const`·`enum`은 그 리터럴 종류로 사상합니다. 정적으로 판정할 수 없는 참조·게이트·복합 연언은 넓은 `SchemaNode`이고 청사진 오류인 모양은 `never`입니다. 오버로드가 생성 결과를 좁히며 단언·`any`를 쓰지 않습니다(NODE-046·058·059, TEST-070).
- 새 타입과 가드는 PR-7 전까지 이 fractal의 `type.ts`와 진입점에만 있고 패키지 공개 진입점과 기존 `src/types`는 레거시 엔진을 가리킵니다(NODE-010·050, LANDING-159). `setContext`는 04에서 `SchemaNode/index.ts`가 이름 붙여 내보내고 `core/index.ts`가 이름으로 다시 내보내며 `src/index.ts`는 내보내지 않습니다(NODE-010, SURFACE-055, 28C-03·08). 이 바인딩 전용 함수는 클래스 멤버가 아니며 맥락 변경 사슬을 `dispatch.dispatchContextChange`에 한 문장으로 위임하고 옵션 비트를 받지 않습니다(NODE-010·016, LANDING-064·084, WRITE-015, 28C-08).
- `SetValueOption`은 클래스 멤버가 아니라 공개 옵션 형이며 `Overwrite`, `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites`의 비트 뜻은 settle 계약을 따릅니다(WRITE-015, 26C-01). 05의 통지·검증 멤버와 06의 배열 메서드는 위 표·공개 형·멤버 목록 시험을 함께 갱신합니다(EVENT-063, LANDING-064·065, 26C-01).

## Acceptance Criteria

### surface-members — 정확한 겉면

- 멤버 목록 시험은 배열 메서드 다섯을 포함한 이 표의 39개 게터·메서드 이름과 종류를 프로토타입 및 공개 형과 대조하고 스텁이 없음을 확인합니다. 클래스 파일 한정 린트와 행 칸 순서 시험도 통과합니다(NODE-010·014, SURFACE-005, 26C-01, LANDING-066, 28C-07·08).

### surface-types — 판별과 참조

- `tsc --strict`에서 `as`·`any` 없이 종류·union 경고등 판별·`InferSchemaNode`가 좁혀지고 배열 메서드는 `ArrayNode`에만 있으며 `children`은 저장 배열과 동일한 참조입니다(NODE-010·014·046·058, TEST-070, 26C-01).

### surface-detached — 떼어진 참조의 고정 읽기

- 이탈한 자손 전체의 옛 참조는 `active: false`·`enabled: false`이고 쓰기로 커밋 번호가 바뀌지 않습니다. 마지막 커밋의 `typeMismatch`·`typeMismatches`·`inactiveValues`·`defaultValue`·`visible`·`readOnly`·`disabled`는 이후 트리 변경·새 인스턴스 재진입에도 같습니다. `diagnostics`는 이탈 후에도 살아 있는 트리의 진단을 읽습니다. 같은 `(path, kind)`가 새 인스턴스로 살아 있는 동안 옛 참조의 `setValue`·`Merge`·`resetSubtree`는 오류 없이 아무 효과도 내지 않으며 살아 있는 값과 잠복 원본을 보존합니다. 경로가 다시 이탈하면 두 옛 참조는 같은 잠복 원본을 쓰고 다음 재진입이 그 값을 읽습니다. 이탈 객체의 전체 교체 값은 재진입 시 기존 자손 잠복 원본보다 우선하고, `Merge`는 양쪽이 키 병합 가능한 객체일 때 기존 키를 유지합니다(NODE-043·044, WRITE-079·087, SETTLE-010, ERROR-131, SURFACE-007, 26C-08·12, 28C-02).

## Boundary Exemptions

### `SchemaNode.ts` — 시나리오 러너의 런타임 레코드 형

- **Consumers**: `**/src/core/__tests__/scenarios/utils/createCoreScenarioAdapter.ts`, `**/src/core/__tests__/scenarios/utils/createObservedCoreScenarioAdapter.ts`, `**/src/core/__tests__/scenarios/utils/executeCoreScenarioStep.ts`
- **Direct import**: `allowed`
- **Reason**: settle 진입 함수가 받는 런타임 레코드 형을 위해 클래스 형만 `import type`으로 읽습니다. 진입점은 공개 합집합 형만 내보내므로 시험을 위해 넓히지 않습니다(NODE-016, 실행 ADR D7에서 벗어남 — 03 계획 로그 §4).

## Last Updated

2026-10-01
