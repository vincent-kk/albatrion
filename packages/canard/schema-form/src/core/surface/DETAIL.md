# surface 겉면 계약

## Requirements

- `onInactive`의 해제 함수는 반복 호출해도 뒤에 등록한 리스너를 해제하지 않습니다.

- B12 공개 `onInactive(listener): () => void`는 subscribe 옆의 인스턴스 수명 등록 통로입니다. 공통 resolver 인자로 직전 커밋을 읽고 반환값으로 보존값을 정하며 새 재진입 인스턴스에는 재등록합니다.

- 떼어진 참조의 setValue와 배열 동사는 값·overlay·inactiveValues에 효과가 없고 재진입 뒤의 새 인스턴스에도 닿지 않는다. 개발 모드 경고만 낸다. find는 비활성 선언 경로와 미선언 경로 모두 null을 유지한다. 재진입은 슬롯과 overlay를 소비하며 옛 인스턴스를 트리에 보유하지 않는다(B11).

- 이름이 정확히 `*`인 속성도 일반 슬롯 공표·수명·복원·keep 규칙을 따른다. 비활성 주소는 `/%2A` 세그먼트를 쓰며 다른 살아 있는 형제의 wildcard 매치로 숨겨지지 않는다. 떼어진 참조는 자기 마지막 커밋 읽기를 보존하고 공표 항목 참조는 일반 슬롯의 값 재사용 규칙을 따른다.

- 트리 생성은 일반 비활성 원본을 슬롯·overlay로만 구성하며 슬롯 모드 선택이나 원본 그림자 런타임을 만들지 않는다. 공개 멤버·선언은 유지하며 슬롯 자료는 실제 사용하는 호스트에만 지연 할당한다.

- 런타임은 설계 Ⅱ의 "떼어진 참조의 읽기는 마지막 커밋으로 고정되고(NODE-044), 재진입 노드는 새 인스턴스이며, 옛 참조의 구독은 발화하지 않는다"를 유지한다. 슬롯 보유는 내부 원본의 소유 방식이며 공개 멤버·프로토타입·판별 합집합·구독 수명을 바꾸지 않는다. 생성 통로는 새 부모·경로·런타임을 결합하고 복제된 노드의 상호작용·오류·배달 기록을 이어받지 않는다(NODE-043·044·060).
- 슬롯의 raw·extras·선언 밖 값과 보유 자손은 엔진의 복제 재진입 입력이다. 런타임 클래스에는 정착·슬롯 선택 알고리즘을 두지 않는다. 배열 itemKey는 새로 발급하며 중첩 호스트는 엔진이 고정 출발점에서 형상을 다시 고른다. 호스트별 지연 보유 자료 이외에 모든 노드의 생성자 할당이나 공개 읽기의 전체 트리 순회를 추가하지 않는다(SETTLE-044·GOAL-029, NODE-053·055).

- 의존 방향의 마지막은 `record < {behaviors 종류, navigation} < validation < derive < settle < write < surface`이다. 이 fractal만 행 선택과 단일 클래스 생성을 함께 안다. 쓰기·상태·검증·구독은 engine의 write 계약, 읽기는 `settle`·`validation`·`navigation`의 진입점에 위임한다(NODE-010·016, LANDING-084).
- 제품 코드는 내부 구현을 진입점 밖에서 직접 소비하지 않는다(NODE-016). core 시나리오 러너와 engine 시험은 core 소유 시험 fixture의 `FieldNodeRecord` 기반 형을 사용하며 구현 클래스를 직접 가져오지 않는다. 진입점은 공개 합집합 형만 내보내므로 시험을 위해 넓히지 않는다(filid 경계 규칙 §5).
- 아래 멤버 표가 클래스 프로토타입과 공개 형의 정확한 목록이다. 기제가 들어오는 단계에서 멤버 표·멤버 목록 시험·공개 형을 함께 갱신하며 스텁·시험 전용 주입 자리를 두지 않는다(26C-01, NODE-010, LANDING-066, 28C-07·08).

## API Contracts

- H 바인딩은 readFieldNodeRevealBaseline(노드 이력), readFieldNodeRevealPolicy(커밋 값·정책 이력), readFieldNodeRevealVersion, subscribeFieldNodeRevealReleased, commitFieldNodeRevealPolicy를 validation→engine→surface wrapper→core로만 잇는다. src/index·공개 사건·revision은 넓히지 않는다.

- `hasFieldNodeValidationRequest(node)`는 requireRuntimeFieldNode로 공개 노드를 내부 레코드로 좁힌 뒤 engine의 같은 이름 조회를 호출하는 바인딩 전용 통로다. core가 이 래퍼를 명명 재수출하며 src/index와 노드 공개 멤버는 유지한다(IR-6 R2, 코디네이터 승인 msg_7e0a5ed0ffd3).

- BLUEPRINT-052: buildFieldNodeTree accepts an optional caller-owned blueprint cache and forwards it to blueprint without importing app state. Per-tree warning collection and runtime ownership remain unchanged.

- surface의 엔진 참조는 engine/index를 통해서만 도달하며 내부 엔진 파일을 직접 가져오지 않는다(07c 계획 9.2·9.3).
- `fieldNodeFactory`의 수출을 유지하는 이유는 core 수준 시험 기반 도구(makeFieldNodeTree, 시나리오 실행기, createDispatchTree)가 이 생성 통로를 쓰기 때문이다. 제품 소비자는 없으며, 정돈-3에서 시험 도구의 자리와 함께 다시 검토한다.
- `UnionMemberType`·`UnionSchemaType`·`FieldNodeInputProps`는 내부 형이며 surface index가 내보내지 않는다. 자기 index 모양 검증은 부모 core의 시험 구획이 소유하고 surface 내부 시험은 구체 파일을 직접 가져온다.

- 진입점은 클래스 이름과 겹치는 런타임 생성자를 내보내지 않고 공개 판별 합집합 `FieldNode` 타입, 종류별 노드 타입, 가드 열, `InferFieldNode`, 공개 옵션 `SetValueOption`, `fieldNodeFactory`와 `record`가 소유한 `FieldNodeEventType`·`FieldNodeRequestType`을 이름으로 내보낸다. 노드 형·가드와 사건·명령 열거는 패키지 공개 진입점에서도 이름으로 내보낸다(SURFACE-056·060, EVENT-073, LANDING-067·158). `fieldNodeFactory(schema: Blueprint, runtimeSeed: FieldNodeRuntimeSeed, validator?: Validator): FieldNode`는 팩토리가 결합하는 `nodeFactory`·`blueprint` 칸과 정착이 지연 생성하는 `settlementScratch` 칸을 제외한 트리 입력과 선택 검증기를 받는다. 경로 색인 저장소 `misfitPaths`는 시드가 주지 않으면 팩토리가 빈 저장소로 만든다. 일반 비활성 원본·overlay와 읽기 메모는 각 호스트가 필요할 때 소유하며 팩토리는 전역 원본 저장소를 만들지 않는다. 트리마다 한 번 완성한 런타임에 실제 생성 함수를 결합한다. 청사진 `kind`·`strategy`로 `BEHAVIORS[type][strategy]`를 골라 같은 클래스의 인스턴스를 만든다(NODE-008·010·045·046, WRITE-015). 빈 생성 함수 스텁을 호출자에게 요구하지 않는다. 구현은 생성한 루트를 종류와 무관한 공개 공통 모양(`NodeSurface`)과 배열 동사(`push`·`pop`·`update`·`remove`·`clear`)에 묶어 돌려주므로, 클래스와 공개 형의 멤버 이름·시그니처 불일치는 컴파일 오류가 된다. 컴파일 시점 연결은 이 공통 모양 48개 멤버까지이다. 종류별 판별 합집합과 노드를 돌려주거나 받는 자기 참조 6개(`rootNode`·`parentNode`·`children`·`find`·`findNodes`·`visitSubtree`)는 런타임 시험 `surface.test.ts`(DETAIL 표 대조)가 지킨다.
- 아래 표의 `getter`는 필드 또는 계산 메모 읽기이며 `method`는 문장 하나의 위임이다. 구현 클래스는 `FieldNodeRecord<FieldNode>`를 구현하고 위임 메서드에서 `FieldNode` 자기 타입을 전달한다. 종류별 생성 표·`InferFieldNode` overload로 단언 없이 좁힌다(NODE-046).

<!-- prettier-ignore -->
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
| `undeclaredValues` | getter | 객체 branch의 선언 밖 키 또는 배열 branch의 청사진 없는 꼬리 자리 값을 받은 순서로 보관하는 상태 칸 | VALUE-002·004, NODE-052, 26C-01 |
| `value` | getter | 계산된 `local` | VALUE-027 |
| `outputValue` | getter | 계산된 `emit` | VALUE-027·034 |
| `inactiveValues` | getter | 호스트의 보유 슬롯·overlay에서 지연 계산한 동결 목록. 떼어지면 마지막 커밋의 내용과 참조를 유지 | VALUE-029, WRITE-087, NODE-044 |
| `active` | getter | 최종 형상에 있는가. 정착 중 임시 이탈 뒤 재진입한 노드는 같은 인스턴스로 참이고, 최종 이탈해 떼어진 옛 참조는 다시 들어도 거짓이다. NODE-044의 마지막 커밋 고정에서 빠지는 살아 있는 트리의 사실 | LANDING-062, 26C-04, 26C-08 |
| `visible` | getter | 레코드 `visible`의 로컬 AND 결과. 떼어지면 마지막 커밋 값으로 고정 | (CONTROLS-022·082, NODE-044, 28C-02) |
| `enabled` | getter | `active && visible`. 살아 있으면 `visible`과 같고 `disabled`와 무관하며 떼어지면 거짓 | (LANDING-066, 26C-08, 28C-02) |
| `readOnly` | getter | 레코드 `readOnly`의 표준·로컬 OR 결과. Form 속성 전체 잠금은 포함하지 않고 떼어지면 고정 | (CONTROLS-023·082, 28C-02) |
| `disabled` | getter | 레코드 `disabled`의 로컬 OR 결과. Form 속성 전체 잠금은 포함하지 않고 떼어지면 고정 | (CONTROLS-023·082, 28C-02) |
| `watchValues` | getter | settle의 `readFieldNodeWatchValues`가 유효 스키마 `controls.watch` 경로를 방출 트리에서 읽은 배열. 같은 커밋에서는 같은 참조 | (CONTROLS-032·080, LANDING-137, 28C-07) |
| `context` | getter | 트리 런타임 `context` 칸의 같은 참조 | (SURFACE-055, CONTROLS-080, 28C-08) |
| `misfit` | getter | 살아 있으면 현재 경고등, 떼어졌으면 마지막 커밋의 경고등 | VALUE-030·037, SURFACE-061, NODE-044 |
| `misfits` | getter | 살아 있으면 하위 경로 목록 메모, 떼어졌으면 마지막 커밋의 목록 | VALUE-030·037, SURFACE-061, NODE-044 |
| `diagnostics` | getter | 떼어진 참조에서도 살아 있는 트리 런타임의 진단을 읽는 NODE-044 예외 | ERROR-131·204, SURFACE-007 |
| `defaultValue` | getter | 살아 있으면 루트 로드 스냅숏, 떼어졌으면 마지막 커밋의 자기 경로 값 | WRITE-085, NODE-044 |
| `find(pointer)` | method | `navigation.find` | NODE-043·046·054 |
| `findNodes(pointer)` | method | `navigation.findNodes` | NODE-043·046·054 |
| `visitSubtree(visitor)` | method | `dispatch.dispatchVisitSubtree` | SURFACE-062, NODE-020·043 |
| `setValue(value, option?)` | method | `dispatch.dispatchSetValue`가 정착 사슬을 조율 | NODE-010, WRITE-079·096, LANDING-064 |
| `push(value?)` | method | `settle.arrangeFieldNodeItems`가 `behavior.arrange` 계획을 적용; 동기적으로 새 길이 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `pop()` | method | 같은 구조 진입; 빠진 아이템의 직전 커밋 `value` 또는 `undefined` 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `update(index, value)` | method | 같은 구조 진입; 쓰기 뒤 아이템 `value` 또는 범위 밖이면 `undefined` 반환 | NODE-010·014, SURFACE-005, 35C-06 |
| `remove(index)` | method | 같은 구조 진입; 빠진 아이템의 직전 커밋 `value` 또는 `undefined` 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `insert(index, value?)` | method | 같은 구조 진입; 유효 색인 [0, N]에 새 아이템을 끼우고 동기적으로 새 길이 반환, 범위 밖·음수·정수 아닌 색인은 무동작으로 현재 길이 반환 | NODE-010·014·051, SURFACE-005, WRITE-099, 35C-06 |
| `clear()` | method | 같은 구조 진입; 동기적으로 `void` 반환 | NODE-010·014, SURFACE-005, GOAL-058 |
| `resetSubtree(option?)` | method | `dispatch.dispatchResetSubtree` | WRITE-085, SETTLE-049, LANDING-064 |
| `request(kind: FieldNodeRequestType)` | method | `dispatch.dispatchRequest`; `Focus`·`Select`·`Refresh`·`Remount` 가운데 하나 | EVENT-063·073, SURFACE-058 |
| `onInactive(listener)` | method | `dispatch.onInactiveFieldNode`; instance-bound resolver registration | B12 |
| `subscribe(listener)` | method | `dispatch.subscribeFieldNode`; 해지 함수 반환 | EVENT-001·011, LANDING-064 |
| `revision(mask?)` | method | `dispatch.readFieldNodeRevision`; 비트별 배달 원장의 합 | EVENT-001·007, REACT-006 |
| `validate()` | method | `dispatch.dispatchValidate`; 새 판정 Promise 반환 | VALIDATE-049, LANDING-064 |
| `errors` | getter | `validation.readFieldNodeErrors`; 노드에 배정된 오류 | VALIDATE-043, SURFACE-053 |
| `setExternalErrors(errors)` | method | `dispatch.dispatchSetExternalErrors` | EVENT-045, SURFACE-053 |
| `clearExternalErrors()` | method | `dispatch.dispatchClearExternalErrors` | EVENT-045, SURFACE-053 |
| `state` | getter/setter | 레코드의 `interactionState` 읽기; 쓰기는 `dispatch.dispatchSetState` | EVENT-012·067, NODE-010 |
| `setState(state)` | method | `dispatch.dispatchSetState` | EVENT-012·067, SURFACE-053 |
| `globalState` | getter | 트리 런타임의 키별 참 노드 수에서 유도된 현재 `globalState` 읽기; 떼어진 참조도 같은 런타임을 읽음 | EVENT-062, SURFACE-053, NODE-044, 43C-01 |
| `globalErrors` | getter | 루트의 전체 검증 오류 목록 | VALIDATE-043, SURFACE-053 |
| `setSubtreeState(state)` | method | `dispatch.dispatchSetSubtreeState` | EVENT-067, NODE-010 |
| `clearSubtreeState()` | method | `dispatch.dispatchClearSubtreeState` | EVENT-067, NODE-010 |
| `batch(fn: () => void)` | method | `dispatch.dispatchBatch` | EVENT-013–019·061, SURFACE-008 |

- 배열 동사 여섯은 클래스에서 종류를 검사하지 않고 write의 동사별 진입 함수에 한 문장으로 위임한다. 진입 함수는 배치 밖 정착의 동기 결과를 돌려주고 배치 안에서는 앞선 표시를 얹은 원본 배열에 행 계획을 적용하여 Replace로 표시한다. 비배열 오류는 사슬 끝에서 보고하고 던지며 진입 거부는 push·insert에서 현재 길이, 나머지에서 `undefined`이다. 배치 끝 통째 쓰기는 위치로 아이템 키를 잇는다(NODE-010·014, ERROR-197, GOAL-058, 33C-01, 35C-01·06, 36C-01, 62C-01, 실행 ADR D1·D4).
- 클래스 파일에는 레코드 순서의 저장 필드, 상수 읽기 게터, 한 문장 위임만 둔다. 정착이 쓰는 공개 레코드 칸은 같은 이름의 게터와 한 문장 저장 세터를 짝지어 프로토타입 이름을 유지한다. 생성자는 고정 선언 순서의 대입만 하고 필드 초기화식과 생성자에 객체·배열 리터럴·함수·`new`를 두지 않는다. `type`·`strategy` 분기는 가드 외에는 행에서만 한다. 구현한 레코드 인터페이스에 문서가 있는 멤버는 클래스에 주석을 두지 않아 그 문서를 물려받고, 레코드에 없지만 공개 인터페이스(NodeSurface·ArrayNode)에 문서가 있는 공개 멤버는 그 첫 문장을 클래스에 한 줄 요약으로 둔다. 어느 쪽에도 문서가 없는 멤버는 주석을 두지 않는다. 인라인 `{@inheritDoc}`는 쓰지 않는다(NODE-010·049).
- 공개 `FieldNode`는 `type`으로 판별하는 `StringNode | NumberNode | BooleanNode | NullNode | ObjectNode | ArrayNode | VirtualNode | UnionNode`이다. `schemaType`은 차례로 `'string'`, `'number' | 'integer'`, `'boolean'`, `'null'`, `'object'`, `'array'`, `undefined`, `UnionSchemaType`으로 좁힌다. `schemaType`은 JSON 형만 담으며, JSON 형이 없는 virtual 노드는 `undefined`이고 `type`으로 판별한다. virtual 노드의 내부 `jsonSchema.type`은 `'virtual'`이다. `UnionMemberType = 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array'`이고 `UnionSchemaType = readonly [UnionMemberType, UnionMemberType, ...UnionMemberType[]]`이다(NODE-057·058).
- 여섯 배열 메서드의 공개 형은 이 합집합의 `ArrayNode` 구성원에만 두고 branch·terminal 두 전략이 같은 서명을 가진다. `type`으로 좁히지 않은 다른 노드 형에는 메서드가 없으며, 런타임에서 비배열 호출을 시도하면 행의 거부 칸이 처리한다(NODE-010·014, SURFACE-005, TEST-070, 26C-01, 35C-01).
- `UnionNode`는 `type: 'union'`, `strategy: 'terminal'`, `children: null`이고 `misfit: false`일 때 `value`는 허용 종류의 값·`undefined`·nullable일 때 `null`, `misfit: true`일 때 `value: unknown`인 두 구성원으로 나뉜다. `misfit`는 `node.type`이 아니라 현재 `schemaType`·유효 목록과 `nullable` 기준이며 `false`는 검증 통과가 아니다(NODE-058, VALUE-037, SURFACE-061).
- union 입력의 `FieldInputProps`는 `value`에 같은 판별 결과를 보여 주고 `onChange`는 목록 종류의 값과 `undefined`, nullable일 때만 `null`을 받는다. `misfit: true`의 `value: unknown`을 그대로 `onChange`의 허용 범위로 넓히지 않는다. `ObjectValue`·`ArrayValue`를 포함한 객체·배열 원본 참조는 변환하지 않는다(NODE-058, VALUE-037).
- 공개 가드 열은 `isFieldNode`, `isStringNode`, `isNumberNode`, `isBooleanNode`, `isObjectNode`, `isArrayNode`, `isVirtualNode`, `isUnionNode`, `isBranchNode`, `isTerminalNode`이다. 첫째는 단일 클래스 `instanceof`, 종류 가드 일곱은 `type`, 마지막 둘은 `strategy`를 본다. `isNullNode`는 소비자가 없어 내보내지 않는다. `isTerminalNode`는 union과 터미널 객체도 좁힌다(NODE-015·041, raw-round17 §4).
- `InferFieldNode<Schema>`는 타입 배열의 null을 nullable로 떼고 integer를 종류 판정에서 number로 접어 한 종류면 그 노드, 둘 이상이면 `UnionNode`, null만이면 `NullNode`로 사상한다. 형 없는 원시 분기는 종류 합집합으로, 전부 인라인 객체·배열인 분기는 각각 `ObjectNode`·`ArrayNode`로, 분기 없는 단일 종류 `const`·`enum`은 그 리터럴 종류로 사상한다. 정적으로 판정할 수 없는 참조·게이트·복합 연언은 넓은 `FieldNode`이고 청사진 오류인 모양은 `never`이다. 오버로드가 생성 결과를 좁히며 단언·`any`를 쓰지 않는다(NODE-046·058·059, TEST-070).
- 공개 노드 형·가드는 이 fractal이 소유하고 패키지 진입점이 이름으로 내보내며, 소비자 형도 새 엔진 계약을 따른다(NODE-010·050, LANDING-067·159). `setContext`는 `surface/index.ts`가 이름 붙여 내보내고 `core/index.ts`가 이름으로 다시 내보내며 `src/index.ts`는 내보내지 않는다(NODE-010, SURFACE-055, 28C-03·08). 이 바인딩 전용 함수는 클래스 멤버가 아니며 맥락 변경 사슬을 `write.dispatchContextChange`에 한 문장으로 위임하고 옵션 비트를 받지 않는다(NODE-010·016, LANDING-064·084, WRITE-015, 28C-08).
- `SetValueOption`은 클래스 멤버가 아니라 공개 옵션 형이며 `Overwrite`, `Merge`, `DisableAutomaticWrites`, `EnableAutomaticWrites`의 비트 뜻은 settle 계약을 따른다(WRITE-015, 26C-01). 05의 통지·검증 멤버와 06의 배열 메서드는 위 표·공개 형·멤버 목록 시험을 함께 갱신한다(EVENT-063, LANDING-064·065, 26C-01).

### 바인딩 전용 통로

통로의 몸은 `engine/write/`의 진입 함수가 소유한다. `surface/index.ts`의 겉면은 공개 `FieldNode` 형을 받는 이름 있는 함수이며, `core/index.ts`가 와일드카드 없이 이름으로 다시 내보내고 `src/index.ts`는 내보내지 않는다. 각 함수의 문서 주석은 `binding-only; not exported from src/index.ts`를 명시한다(69C-01, LANDING-064, 실행 ADR D2).

| 함수                                                          | 계약                                                                                                                                                                  | 원장                      |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `buildFieldNodeTree(props)`                                   | 청사진 작성과 팩토리 결합으로 트리를 만들며 마운트하지 않는다                                                                                                         | 70C-01, VALIDATE-010      |
| `mountFieldNode(root, value?, option?, { deferValidation? })` | 루트 로드를 마운트하고 검증 요청의 미룸 선택을 받는다                                                                                                                 | 69C-01·05, LANDING-041    |
| `reloadFieldNodeForm(root, value, option?)`                   | 명시적인 `undefined`를 포함한 필수 로드 값으로 트리는 유지한 채 폼 수준 reset을 수행하고 외부 오류와 검증 결과를 비운다. 선택적 자동 쓰기 비트는 그 로드에만 적용된다 | WRITE-015·043·045, 69C-03 |
| `adoptFieldNodeTree(previousRoot, nextRoot)`                  | 재생성 트리로 사슬과 경로 키 외부 오류를 인계하고 옛 트리를 폐기한다                                                                                                  | 69C-02·03, WRITE-046      |
| `writeFieldNodeInput(node, value, option)`                    | 입력 출처 표식을 실은 쓰기로 `handleChange` 진입 전체를 구별한다                                                                                                      | REACT-009·010, 69C-01     |
| `finishFieldNodeInput(node)`                                  | 입력 마침을 동작 행의 `finishInput`으로 보내 자동 쓰기 계약을 적용한다                                                                                                | WRITE-083, 69C-01         |
| `readFieldNodeInteractionReset(node)`                         | 사건 개정과 별개인 노드의 상호작용 초기화 번호를 읽는다                                                                                                               | REACT-024, 69C-02         |
| `observeFieldNodeReports(root, deliver)`                      | core 오류 관찰자 범위에서 전달을 실행하고 중첩·예외에도 이전 범위를 복원한다                                                                                          | ERROR-113, 69C-01         |
| `interpretFieldNodeDraft(node, draft)`                        | 현재 유효 타입 목록으로 기존 순수 해석기를 호출하여 값과 멤버 여부를 쓰기 없이 돌려준다                                                                               | REACT-033, 69C-01         |

- 위계: `runtime/`은 공개 노드 표면 뒤에서 움직이는 런타임 객체의 칸이다. 일부러 하나만 둔 클래스라 복수형 역할 이름 classes 대신 주제 이름을 쓴다. 이 칸에는 런타임 노드 클래스 `FieldNode`(`runtime/FieldNode.ts`)와, 런타임 노드 객체에만 작용하는 `requireRuntimeFieldNode`·`setContext`가 있다. `utils/`에는 바인딩 통로(`utils/binding/`)·가드(`guards.ts`)·생성 통로(`fieldNodeFactory.ts`)가 남는다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둔다(filid zero-peer-file).

## Acceptance Criteria

### surface-slot-new-instance — 슬롯 복제의 새 수명

- 재진입한 노드와 자손은 새 인스턴스이고 옛 참조는 떼어진 채 유지된다. raw·extras·선언 밖 값과 보존된 자손 원본은 같은 공개 값으로 복원된다.

### surface-slot-old-subscriptions — 옛 구독의 무통지

- 슬롯으로 보유한 옛 참조의 구독은 후속 재진입·입력·상태 변경에서 발화하지 않는다. 새 참조의 구독은 기존 사건·payload·revision 계약을 따른다.

### surface-slot-interaction-reset — 상호작용과 오류의 새 수명

- 새 인스턴스는 비어 있는 상호작용·오류 상태로 기존 채움·resetInteraction 규칙을 받는다. 옛 참조의 상태·오류 읽기는 마지막 커밋 그대로이다.

### surface-slot-array-keys — 복제된 배열의 새 아이템 키

- 배열 자손의 itemKey는 새 값이다. 반복 재진입에서도 이전 수명의 nonce를 다시 발급하지 않으며 원본 배열 값과 아이템 전량 실체화를 유지한다.

### surface-slot-frozen-reads — 떼어진 슬롯의 고정 읽기

- 옛 참조의 value·raw·선언 밖 값·children·inactiveValues 읽기는 이후 overlay·재진입·reset에서 바뀌지 않는다. 같은 인스턴스에서 변화 없는 inactiveValues 반복 읽기는 같은 동결 배열을 반환한다.

### surface-slot-memory-bound — 방문한 슬롯의 보유 상한

- 같은 엔트리의 반복 왕복은 이전 수명들을 누적 보유하지 않는다. 슬롯 수는 호스트가 실제 방문한 엔트리 수 이하이며 재귀는 실제 값 깊이까지만 보유한다.

### surface-members — 정확한 겉면

- 멤버 목록 시험은 배열 메서드 여섯을 포함한 이 표의 55개 게터·세터·메서드 이름과 종류를 프로토타입 및 공개 형과 대조하고 스텁이 없음을 확인한다. 클래스 파일 한정 린트와 행 칸 순서 시험도 통과한다(NODE-010·014, SURFACE-005, 26C-01, LANDING-066, 28C-07·08).

### surface-types — 판별과 참조

- `tsc --strict`에서 `as`·`any` 없이 종류·union 경고등 판별·`InferFieldNode`가 좁혀지고 배열 메서드는 `ArrayNode`에만 있으며 `children`은 저장 배열과 동일한 참조이다(NODE-010·014·046·058, TEST-070, 26C-01).

### surface-detached — 떼어진 참조의 고정 읽기

- 이탈한 자손 전체의 옛 참조는 `active: false`·`enabled: false`이고 쓰기로 커밋 번호가 바뀌지 않는다. 마지막 커밋의 `misfit`·`misfits`·`inactiveValues`·`defaultValue`·`visible`·`readOnly`·`disabled`는 이후 트리 변경·새 인스턴스 재진입에도 같다. `diagnostics`는 이탈 후에도 살아 있는 트리의 진단을 읽는다. 같은 `(path, kind)`가 새 인스턴스로 살아 있는 동안 옛 참조의 `setValue`·`Merge`·`resetSubtree`는 오류 없이 아무 효과도 내지 않으며 살아 있는 값과 잠복 원본을 보존한다. 경로가 다시 이탈하면 두 옛 참조는 같은 잠복 원본을 쓰고 다음 재진입이 그 값을 읽는다. 이탈 객체의 전체 교체 값은 재진입 시 기존 자손 잠복 원본보다 우선하고, `Merge`는 양쪽이 키 병합 가능한 객체일 때 기존 키를 유지한다(NODE-043·044, WRITE-079·087, SETTLE-010, ERROR-131, SURFACE-007, 26C-08·12, 28C-02).

### surface-visit — 하위 트리 방문

- `visitSubtree`는 자기 자신부터 전위로, 형제는 `children` 순서로 방문한다. `false`를 돌려준 노드의 하위만 건너뛰고, 형상 밖 노드(꺼진 게이트의 노드)는 방문하지 않으며, 터미널은 잎이고, 참조로 두 번 닿는 같은 인스턴스는 한 번만 방문한다. 떼어진 시작 노드에서는 NODE-044의 구조 읽기 규칙대로 그 노드와 함께 떼어진 마지막 커밋의 하위를 걷는다.
- 순회 안에서 쓰기가 없으면 사슬에 들어가지 않는다. 첫 쓰기에 묶음이 열리고 순회가 끝날 때 루트에서 한 번 정착하며, 순회 중 읽기는 직전 커밋 값이다. 바깥 `batch` 안에서는 그 묶음에 합류해 바깥 끝에서 정착한다. 리스너 안에서도 순회는 되며, 전달 중(리스너 안)의 쓰기는 평소 규칙대로 리스너 되먹임으로 세어지고 오류 관찰자 안의 쓰기는 `WriteInObserver`로 거부된다. 순회 안의 상태·외부 오류 진입은 데이터를 즉시 바꾸고 그 사건 전달만 순회 끝(바깥 `batch`가 있으면 그 끝)으로 미루며, 요청 진입의 전달도 같다. 순회 안의 `reset`은 `batch` 안에서처럼 그 로드를 즉시 정착한다(EVENT-015). visitor가 던지면 표시된 쓰기를 커밋한 뒤 그 오류를 다시 던진다(SURFACE-062).

## Last Updated

2026-10-28
