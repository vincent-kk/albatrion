# SchemaNode 겉면 계약

## Requirements

- 의존 방향의 마지막은 `record < {behaviors 종류, navigation} < settle < SchemaNode`입니다. 이 fractal만 행 선택과 단일 클래스 생성을 함께 압니다(NODE-016, raw-round17 §3).
- 제품 코드는 내부 구현을 진입점 밖에서 직접 소비하지 않습니다(NODE-016). 경계 예외는 하나입니다: core 시나리오 러너 도우미(`src/core/__tests__/scenarios/utils/`)는 settle 진입 함수가 받는 런타임 레코드 형을 위해 `SchemaNode/SchemaNode.ts`의 클래스 형만 `import type`으로 직접 읽습니다. 진입점은 공개 합집합 형만 내보내므로 시험을 위해 넓히지 않습니다(filid 경계 규칙 §5. 실행 ADR D7에서 벗어남 — 계획 로그 §4).
- PR-2 멤버 표가 클래스 프로토타입과 공개 형의 정확한 목록입니다. 기제가 들어오는 PR에서만 멤버를 더하며 스텁·시험 전용 주입 자리를 두지 않습니다(26C-01, NODE-010).

## API Contracts

- 진입점은 클래스 이름과 겹치는 런타임 생성자를 내보내지 않고 공개 판별 합집합 `SchemaNode` 타입, 종류별 노드 타입, 가드 열, `InferSchemaNode`, 공개 옵션 `SetValueOption`, `schemaNodeFactory`를 이름으로 내보냅니다. `schemaNodeFactory(schema: Blueprint, runtimeSeed: SchemaNodeRuntimeSeed): SchemaNode`는 팩토리가 결합하는 `nodeFactory`·`blueprint` 칸과 정착이 지연 생성하는 `settlementScratch` 칸을 제외한 트리 입력을 받습니다. 트리마다 한 번 완성한 런타임에 실제 생성 함수를 결합합니다. 청사진 `kind`·`strategy`로 `BEHAVIORS[type][strategy]`를 골라 같은 클래스의 인스턴스를 만듭니다(NODE-008·010·045·046, WRITE-015). 빈 생성 함수 스텁을 호출자에게 요구하지 않습니다.
- 아래 표의 `getter`는 필드 또는 계산 메모 읽기이며 `method`는 문장 하나의 위임입니다. 구현 클래스는 `SchemaNodeRecord<SchemaNode>`를 구현하고 위임 메서드에서 `SchemaNode` 자기 타입을 전달합니다. 종류별 생성 표·`InferSchemaNode` overload로 단언 없이 좁힙니다(NODE-046).

| PR-2 멤버 | 종류 | 위임·읽기 대상 | 원장 |
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
| `raw` | getter | 잎의 해석된 원본 또는 객체 branch의 비객체 원본. 평범한 객체 입력은 자식에 분배되어 호스트에는 `undefined` | VALUE-002·004, 26C-01 |
| `extras` | getter | 객체 branch가 받은 선언 밖 키와 값을 삽입 순서로 보관하는 상태 칸 | VALUE-002·004, 26C-01 |
| `value` | getter | 계산된 `local` | VALUE-027 |
| `outputValue` | getter | 계산된 `emit` | VALUE-027·034 |
| `inactiveValues` | getter | 살아 있으면 루트 잠복 원본 메모, 떼어졌으면 마지막 커밋에 동결한 목록 | VALUE-029, WRITE-087, NODE-044 |
| `active` | getter | 최종 형상에 있는가. 정착 중 임시 이탈 뒤 재진입한 노드는 같은 인스턴스로 참이고, 최종 이탈해 떼어진 옛 참조는 다시 들어도 거짓입니다. NODE-044의 마지막 커밋 고정에서 빠지는 살아 있는 트리의 사실 | LANDING-062, 26C-04, 26C-08 |
| `typeMismatch` | getter | 살아 있으면 현재 경고등, 떼어졌으면 마지막 커밋의 경고등 | VALUE-030·037, SURFACE-061, NODE-044 |
| `typeMismatches` | getter | 살아 있으면 하위 경로 목록 메모, 떼어졌으면 마지막 커밋의 목록 | VALUE-030·037, SURFACE-061, NODE-044 |
| `diagnostics` | getter | 떼어진 참조에서도 살아 있는 트리 런타임의 진단을 읽는 NODE-044 예외 | ERROR-131·204, SURFACE-007 |
| `defaultValue` | getter | 살아 있으면 루트 로드 스냅숏, 떼어졌으면 마지막 커밋의 자기 경로 값 | WRITE-085, NODE-044 |
| `find(pointer)` | method | `navigation.find` | NODE-043·046·054 |
| `findNodes(pointer)` | method | `navigation.findNodes` | NODE-043·046·054 |
| `setValue(value, option?)` | method | `settle.writeSchemaNode`의 호출자 전체 교체 또는 `Merge` 부분 쓰기 | NODE-010, WRITE-079·096, 26C-01 |
| `resetSubtree(option?)` | method | `settle.resetSchemaNodeSubtree` | WRITE-085, SETTLE-049 |

- 클래스 파일에는 레코드 순서의 저장 필드, 상수 읽기 게터, 한 문장 위임만 둡니다. 정착이 쓰는 공개 레코드 칸은 같은 이름의 게터와 한 문장 저장 세터를 짝지어 프로토타입 이름을 유지합니다. 생성자는 고정 선언 순서의 대입만 하고 필드 초기화식과 생성자에 객체·배열 리터럴·함수·`new`를 두지 않습니다. `type`·`strategy` 분기는 가드 외에는 행에서만 합니다. 공개 인터페이스가 멤버 주석의 정본이고 클래스는 `{@inheritDoc}`로 가리킵니다(NODE-010·049).
- 공개 `SchemaNode`는 `type`으로 판별하는 `StringNode | NumberNode | BooleanNode | NullNode | ObjectNode | ArrayNode | VirtualNode | UnionNode`입니다. `schemaType`은 차례로 `'string'`, `'number' | 'integer'`, `'boolean'`, `'null'`, `'object'`, `'array'`, `'virtual'`, `UnionSchemaType`으로 좁힙니다. `UnionMemberType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'`이고 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`입니다(NODE-057·058).
- `UnionNode`는 `type: 'union'`, `strategy: 'terminal'`, `children: null`이고 `typeMismatch: false`일 때 `value`는 허용 종류의 값·`undefined`·nullable일 때 `null`, `typeMismatch: true`일 때 `value: unknown`인 두 구성원으로 나뉩니다. `typeMismatch`는 `node.type`이 아니라 현재 `schemaType`·유효 목록과 `nullable` 기준이며 `false`는 검증 통과가 아닙니다(NODE-058, VALUE-037, SURFACE-061).
- union 입력의 `FormTypeInputProps`는 `value`에 같은 판별 결과를 보여 주고 `onChange`는 목록 종류의 값과 `undefined`, nullable일 때만 `null`을 받습니다. `typeMismatch: true`의 `value: unknown`을 그대로 `onChange`의 허용 범위로 넓히지 않습니다. `ObjectValue`·`ArrayValue`를 포함한 객체·배열 원본 참조는 변환하지 않습니다(NODE-058, VALUE-037).
- 공개 가드 열은 `isSchemaNode`, `isStringNode`, `isNumberNode`, `isBooleanNode`, `isObjectNode`, `isArrayNode`, `isVirtualNode`, `isUnionNode`, `isBranchNode`, `isTerminalNode`입니다. 첫째는 단일 클래스 `instanceof`, 종류 가드 일곱은 `type`, 마지막 둘은 `strategy`를 봅니다. `isNullNode`는 소비자가 없어 내보내지 않습니다. `isTerminalNode`는 union과 터미널 객체도 좁힙니다(NODE-015·041, raw-round17 §4).
- `InferSchemaNode<Schema>`는 타입 배열의 null을 nullable로 떼고 integer를 종류 판정에서 number로 접어 한 종류면 그 노드, 둘 이상이면 `UnionNode`, null만이면 `NullNode`로 사상합니다. 형 없는 원시 분기는 종류 합집합으로, 전부 인라인 객체·배열인 분기는 각각 `ObjectNode`·`ArrayNode`로, 분기 없는 단일 종류 `const`·`enum`은 그 리터럴 종류로 사상합니다. 정적으로 판정할 수 없는 참조·게이트·복합 연언은 넓은 `SchemaNode`이고 청사진 오류인 모양은 `never`입니다. 오버로드가 생성 결과를 좁히며 단언·`any`를 쓰지 않습니다(NODE-046·058·059, TEST-070).
- 새 타입과 가드는 PR-7 전까지 이 fractal의 `type.ts`와 진입점에만 있습니다. 그때까지 패키지 공개 진입점과 기존 `src/types`는 레거시 엔진을 가리킵니다. PR-2에는 소비자가 있는 바인딩 전용 내부 통로가 없으므로 `finishInput`·입력 출처 쓰기·`setContext`를 미리 내보내지 않습니다. 해당 바인딩이 들어올 때만 이름 붙여 내부 진입점에 내고 패키지 공개 진입점에는 내지 않습니다(NODE-010·050, LANDING-159, execution-adr D5).
- `SetValueOption`은 클래스 멤버가 아니라 공개 옵션 형이며 `Overwrite`, `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites`의 비트 뜻은 settle 계약을 따릅니다(WRITE-015, 26C-01). 후속 PR의 통지·검증·명령, 배열 메서드, 계산 게터는 그 PR에서 세 표면을 함께 갱신합니다(EVENT-063, LANDING-064–066).

## Acceptance Criteria

### surface-members — 정확한 PR-2 겉면

- 멤버 목록 시험은 이 표를 프로토타입의 게터·메서드 이름과 종류까지 대조하고, 나열되지 않은 후속 PR 멤버와 스텁이 없음을 확인합니다. 클래스 파일 한정 린트와 행 칸 순서 시험도 통과합니다(NODE-010, 26C-01).

### surface-types — 판별과 참조

- `tsc --strict`에서 `as`·`any` 없이 종류·union 경고등 판별·`InferSchemaNode`가 좁혀지고 `children`은 저장 배열과 동일한 참조입니다(NODE-046·058, TEST-070).

### surface-detached — 떼어진 참조의 고정 읽기

- 이탈한 자손 전체의 옛 참조는 `active: false`이고 쓰기로 커밋 번호가 바뀌지 않습니다. 마지막 커밋의 `typeMismatch`·`typeMismatches`·`inactiveValues`·`defaultValue`는 이후 트리 변경·새 인스턴스 재진입에도 같습니다. `diagnostics`는 이탈 후에도 살아 있는 트리의 진단을 읽습니다. 같은 `(path, kind)`가 새 인스턴스로 살아 있는 동안 옛 참조의 `setValue`·`Merge`·`resetSubtree`는 오류 없이 아무 효과도 내지 않으며 살아 있는 값과 잠복 원본을 보존합니다. 경로가 다시 이탈하면 두 옛 참조는 같은 잠복 원본을 쓰고 다음 재진입이 그 값을 읽습니다. 이탈 객체의 전체 교체 값은 재진입 시 기존 자손 잠복 원본보다 우선하고, `Merge`는 양쪽이 키 병합 가능한 객체일 때 기존 키를 유지합니다(NODE-043·044, WRITE-079·087, SETTLE-010, ERROR-131, SURFACE-007, 26C-08·12).

## Last Updated

2026-09-30
