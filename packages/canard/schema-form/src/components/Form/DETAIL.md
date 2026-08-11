# Form contract

## Requirements

- `Form`은 패키지의 최상위 공개 컴포넌트다. `jsonSchema`를 받아 폼 트리를 초기화하고, Provider 스택을 고정 순서로 조합하며, `FormHandle` ref로 명령형 API를 노출한다.
- **폼 밖으로 나가는 값은 `rootNode.normalizedValue`(정제 값)이고, 폼 안으로 들어오는 값은 raw다.** 세 방출 경로가 모두 정제 값을 읽는다 — `onSubmit`(`Form.tsx:116`), `handleReady`의 최초 `onChange` 방출(`:138`), `FormHandle.getValue`(`:154`). 반대 방향인 `setValue`는 `rootNode.setValue`로 raw를 그대로 넘긴다.
- `onChange` 방출은 `ready.current`가 참이 된 뒤에만 일어나고, 직전에 내보낸 값과 동일하면(`emittedValueRef` 참조 비교) 재방출하지 않는다. 초기 방출은 `handleReady`가 담당한다.
- `submit`은 정제 값을 먼저 확정한 뒤 `rootNode.validate()`를 수행한다. 에러가 하나라도 있으면 `inputOnSubmit`을 호출하지 않고 `ValidationError('SCHEMA_VALIDATION_FAILED')`를 던지며, 그 payload에 `{value, errors, jsonSchema}`를 담는다. 검증을 통과해야만 `inputOnSubmit(value)`가 호출된다.
- Provider 중첩 순서는 계약이다: `WorkspaceContext → FormTypeInputsContext → FormTypeRendererContext → InputControlContext → VirtualizationContext → RootNodeContext → FormRootProxy`. 부분 렌더나 순서 변경은 허용되지 않는다.
- `Form`은 `SchemaNode`를 직접 생성하지 않는다. 노드 생성은 `RootNodeContextProvider`가 소유한다.

## API Contracts

### 값 채널

| 표면 | 읽는 값 | 위치 |
| ---- | ------- | ---- |
| `FormHandle.getValue()` | `rootNode.normalizedValue` | `Form.tsx:154` |
| `submit` / `onSubmit` 인자 | `rootNode.normalizedValue` | `Form.tsx:116`, `:124` |
| 최초 `onChange` 방출 | `rootNode.normalizedValue` | `Form.tsx:138` |
| `FormHandle.setValue(value, options)` | raw → `rootNode.setValue` | `Form.tsx:155` |
| `FormHandle.node` / `findNode` / `findNodes` | 노드 자체 (raw 접근 가능) | `Form.tsx:146`, `:152`, `:153` |

정제의 내용은 스키마 옵션이 결정하며 `Form`은 그것을 알지 못한다 — 현재 `ArrayNode`의 `options.omitTrailing`이 유일한 적용 사례다. `Form`의 계약은 "어느 채널을 읽는가"까지이고, "무엇을 정제하는가"는 노드 쪽 계약이다.

### `FormHandle`

`node`, `focus(path)`, `select(path)`, `reset`, `findNode(path)`, `findNodes(path)`, `getValue()`, `setValue(value, options)`, `getState()`, `setState(state)`, `clearState()`, `getErrors()`, `getAttachedFilesMap()`, `validate()`, `showError(visible?)`, `submit`.

- `rootNode`가 아직 없으면 조회 계열은 `null`·빈 배열·빈 객체를 돌려주고 예외를 던지지 않는다.
- `focus`/`select`는 `find(path)`로 찾은 노드에 `RequestFocus`/`RequestSelect`를 발행한다. 경로가 없으면 아무 일도 하지 않는다.
- `submit`은 `getTrackableHandler`로 감싸여 진행 상태를 추적할 수 있다.

## Acceptance Criteria

### emit-normalized — 방출 경로는 정제 값을 낸다

- `options.omitTrailing`이 켜진 배열을 가진 폼에서 `getValue()`와 `onSubmit` 인자에 후행 빈 항목이 없다.
- 같은 폼에서 렌더된 배열 입력 개수는 줄지 않는다 — 정제는 방출에만 적용되고 노드 트리나 DOM을 지우지 않는다.

### submit-gate — 검증 실패는 제출을 막는다

- 검증 에러가 있는 상태에서 `submit()`을 호출하면 `inputOnSubmit`이 호출되지 않고 `ValidationError`가 던져진다.
- 던져진 에러의 `details`에 `value`·`errors`·`jsonSchema`가 들어 있다.

### emit-dedupe — 동일 값 재방출 억제

- `ready` 이전에는 `onChange`가 호출되지 않는다.
- 직전 방출과 동일한 참조가 다시 전달되면 `onChange`가 추가로 호출되지 않는다.

## Last Updated

2026-08-12 — `getValue`·`submit`·초기 방출이 `rootNode.normalizedValue`를 읽도록 전환된 것에 맞춰 값 채널 방향(나가는 값은 정제, 들어오는 값은 raw)과 submit 게이트를 명문화 (신규 문서).
