# schema-form/src/core contract

## Requirements

- `core/index.ts`가 이 fractal의 공개 표면이다. `nodeFromJSONSchema()` 팩토리, 노드 타입과 타입 가드, `NodeEventType`·`SetValueOption`·`ValidationMode` 등 열거값을 이름으로 내보낸다.
- **모든 노드는 값을 두 채널로 노출한다.** `value`는 노드가 보유한 raw 값이고, `normalizedValue`는 스키마 출력 옵션이 적용된 정제 뷰다. 기본 구현은 `AbstractNode`가 제공하며 `value`를 그대로 돌려주므로, 정제가 필요 없는 노드 타입은 아무것도 구현하지 않는다.
- `normalizedValue` override는 **값 정제 목적으로만** 허용된다. 현재 유일한 override는 `ArrayNode`(`options.omitTrailing`)이다. 정제는 노드 트리를 바꾸지 않는다 — 자식 노드는 raw 상태를 유지하며, 정제로 사라진 항목의 노드도 그대로 남는다.
- 정제 값을 읽는 곳은 밖으로 나가는 경로뿐이다 — 루트 검증 값, 루트 방출, `FormHandle.getValue`, 부모측 하이드레이션 스냅샷. 안으로 들어오는 경로(`setValue`)와 raw 관측 경로(`UpdateValue` payload)는 계속 `value`를 쓴다.
- 노드 값 변경은 `setValue()` 공개 API를 경유한다. private `__value__`에 외부에서 접근하지 않는다.
- 파서(`parsers/`)는 순수 함수다. 값 변환만 담당하며 JSON Schema 검증 로직을 넣지 않는다.
- 이벤트는 `EventCascade`로 마이크로태스크 배칭한다. 단 `UpdateValue`는 동기 발행이다.
- 노드 트리는 순환 참조를 만들지 않는다.

## API Contracts

### 진입점 표면

| 심볼                                                             | 계약                                                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `nodeFromJSONSchema(props)`                                      | JSON Schema → `SchemaNode` 트리. 이 fractal의 유일한 트리 생성 경로                             |
| `SchemaNode` 및 타입별 노드                                      | `value`·`normalizedValue`·`setValue`·`validate`·`subscribe`·`find`·`revision` 등 노드 공개 표면 |
| `isSchemaNode` · `isBranchNode` · `isTerminalNode` · 타입별 가드 | 런타임 타입 판별                                                                                |
| `NodeEventType` · `SetValueOption` · `ValidationMode`            | 비트 플래그·열거값                                                                              |

### 값 채널 규약

생성자 기본값의 타입은 노드가 이미 보관하는 `Value | Nullish`와 일치합니다. 공개 스키마 union 추론이 null을 보존해도 기존 노드의 기본값 입력을 좁히지 않으며, 이 타입 보정은 런타임 파서나 변경 통보 동작을 바꾸지 않습니다.

| 채널                     | 읽는 곳                                                          | 특성                               |
| ------------------------ | ---------------------------------------------------------------- | ---------------------------------- |
| `value` (raw)            | `UpdateValue` payload, 자식 상태 슬롯, `setValue` 왕복           | 정제되지 않음. 편집 중 상태를 보존 |
| `normalizedValue` (정제) | 루트 검증, 루트 방출, `FormHandle.getValue`, 부모측 하이드레이션 | 스키마 출력 옵션 적용              |

두 채널을 섞으면 편집 중인 화면이 정제 때문에 접히거나, 반대로 정제되지 않은 값이 폼 밖으로 나간다. 새 소비 지점을 추가할 때는 그 값이 밖으로 나가는지 안에 머무는지를 먼저 정하고 채널을 고른다.

### 노드 타입 추가

기존 엔진의 노드 타입은 AbstractNode 상속 계약을 유지합니다. 재설계 엔진에는 이 상속 의무를 적용하지 않으며, 청사진이 정한 종류와 후속 단일 노드 계약을 따릅니다. 전환 전 공개 팩토리는 기존 엔진을 계속 사용합니다.

공개 `InferSchemaNode`는 NODE-059에 따라 형 없는 `oneOf`·`anyOf`의 모든 분기가 인라인 객체 또는 인라인 배열 스키마일 때만 각각 `ObjectNode`·`ArrayNode`로 좁힙니다. `$ref`, 게이트 분기, 두 키워드의 동시 사용, 본체 `allOf`는 넓은 `SchemaNode`를 유지합니다. 형 없는 분기 없는 `const`·`enum` 칸은 리터럴의 JSON 종류에 맞는 원시 노드로 좁힙니다. 이 타입 추론은 기존 런타임 팩토리의 동작을 바꾸지 않습니다.

## Acceptance Criteria

### two-channel — 두 채널이 분리되어 있다

- `options.omitTrailing`이 켜진 배열 노드에서 `node.value`에는 후행 빈 항목이 남아 있고 `node.normalizedValue`에는 없다.
- 정제되지 않는 노드 타입에서 두 값이 같다.

### normalize-preserves-tree — 정제는 트리를 건드리지 않는다

- 정제로 항목이 걸러진 뒤에도 `ArrayNode`의 자식 노드 수는 줄지 않는다.
- 걸러진 위치에 값을 넣으면 그 항목이 다시 정제 결과에 나타난다.

### factory-single-path — 트리 생성 경로는 하나다

- `nodeFromJSONSchema()`로 만든 트리의 루트가 스키마 타입에 대응하는 노드 인스턴스이고, 각 타입 가드가 그 노드를 참으로 판별한다.

### scenario-runner — 코어 시나리오 실행 소유

- TEST-023에 따라 코어 시험이 공유 시나리오 데이터를 해석합니다. 비공개 시나리오 패키지는 코어 실행기를 소유하지 않습니다.
- 주입된 코어 어댑터가 단계를 순서대로 한 번씩 실행하며 정착을 기다린 뒤 기대를 검사하고 실패를 호출자에게 전달합니다.
- 빈 시나리오는 실행 단계가 0개입니다. 초기 뼈대의 빈 패밀리를 엔진 동작 검증으로 계산하지 않습니다.

### public-node-inference — 형 없는 스키마의 공개 노드 형

- 인라인 객체·배열 분기만 있는 칸은 대응 노드로 좁히고, 참조·게이트·두 키워드·본체 allOf가 있으면 넓은 노드 형을 유지합니다.
- 분기 없는 단일 리터럴 종류의 `const`·`enum` 칸은 대응 원시 노드 형으로 좁힙니다.

## Last Updated

2026-08-12 — 공개 `normalizedValue` getter 도입에 맞춰 raw/정제 두 채널 규약과 채널별 소비 지점, 정제가 노드 트리를 보존한다는 계약을 명문화 (신규 문서).
