# schema-form/src/core contract

## Requirements

- `core/index.ts`가 이 fractal의 공개 표면이다. `nodeFromJsonSchema()` 팩토리, 노드 타입과 타입 가드, `NodeEventType`·`SetValueOption`·`ValidationMode` 등 열거값을 이름으로 내보낸다.
- **모든 노드는 값을 두 채널로 노출한다.** `value`는 노드가 보유한 raw 값이고, `normalizedValue`는 스키마 출력 옵션이 적용된 정제 뷰다. 기본 구현은 `AbstractNode`가 제공하며 `value`를 그대로 돌려주므로, 정제가 필요 없는 노드 타입은 아무것도 구현하지 않는다.
- `normalizedValue` override는 **값 정제 목적으로만** 허용된다. 현재 유일한 override는 `ArrayNode`(`options.omitTrailing`)이다. 정제는 노드 트리를 바꾸지 않는다 — 자식 노드는 raw 상태를 유지하며, 정제로 사라진 항목의 노드도 그대로 남는다.
- 정제 값을 읽는 곳은 밖으로 나가는 경로뿐이다 — 루트 검증 값, 루트 방출, `FormHandle.getValue`, 부모측 하이드레이션 스냅샷. 안으로 들어오는 경로(`setValue`)와 raw 관측 경로(`UpdateValue` payload)는 계속 `value`를 쓴다.
- 노드 값 변경은 `setValue()` 공개 API를 경유한다. private `__value__`에 외부에서 접근하지 않는다.
- 파서(`parsers/`)는 순수 함수다. 값 변환만 담당하며 JSON Schema 검증 로직을 넣지 않는다.
- 이벤트는 `EventCascade`로 마이크로태스크 배칭한다. 단 `UpdateValue`는 동기 발행이다.
- 노드 트리는 순환 참조를 만들지 않는다.

## API Contracts

### 진입점 표면

| 심볼 | 계약 |
| ---- | ---- |
| `nodeFromJsonSchema(props)` | JSON Schema → `SchemaNode` 트리. 이 fractal의 유일한 트리 생성 경로 |
| `SchemaNode` 및 타입별 노드 | `value`·`normalizedValue`·`setValue`·`validate`·`subscribe`·`find`·`revision` 등 노드 공개 표면 |
| `isSchemaNode` · `isBranchNode` · `isTerminalNode` · 타입별 가드 | 런타임 타입 판별 |
| `NodeEventType` · `SetValueOption` · `ValidationMode` | 비트 플래그·열거값 |

### 값 채널 규약

| 채널 | 읽는 곳 | 특성 |
| ---- | ------- | ---- |
| `value` (raw) | `UpdateValue` payload, 자식 상태 슬롯, `setValue` 왕복 | 정제되지 않음. 편집 중 상태를 보존 |
| `normalizedValue` (정제) | 루트 검증, 루트 방출, `FormHandle.getValue`, 부모측 하이드레이션 | 스키마 출력 옵션 적용 |

두 채널을 섞으면 편집 중인 화면이 정제 때문에 접히거나, 반대로 정제되지 않은 값이 폼 밖으로 나간다. 새 소비 지점을 추가할 때는 그 값이 밖으로 나가는지 안에 머무는지를 먼저 정하고 채널을 고른다.

### 노드 타입 추가

새 노드 타입은 `AbstractNode`를 상속하고 `nodes/index.ts`에 export를 추가한다. `type`, `value` getter/setter, `applyValue`는 필수 구현이고 `normalizedValue`는 정제가 필요할 때만 override한다.

## Acceptance Criteria

### two-channel — 두 채널이 분리되어 있다

- `options.omitTrailing`이 켜진 배열 노드에서 `node.value`에는 후행 빈 항목이 남아 있고 `node.normalizedValue`에는 없다.
- 정제되지 않는 노드 타입에서 두 값이 같다.

### normalize-preserves-tree — 정제는 트리를 건드리지 않는다

- 정제로 항목이 걸러진 뒤에도 `ArrayNode`의 자식 노드 수는 줄지 않는다.
- 걸러진 위치에 값을 넣으면 그 항목이 다시 정제 결과에 나타난다.

### factory-single-path — 트리 생성 경로는 하나다

- `nodeFromJsonSchema()`로 만든 트리의 루트가 스키마 타입에 대응하는 노드 인스턴스이고, 각 타입 가드가 그 노드를 참으로 판별한다.

## Last Updated

2026-08-12 — 공개 `normalizedValue` getter 도입에 맞춰 raw/정제 두 채널 규약과 채널별 소비 지점, 정제가 노드 트리를 보존한다는 계약을 명문화 (신규 문서).
