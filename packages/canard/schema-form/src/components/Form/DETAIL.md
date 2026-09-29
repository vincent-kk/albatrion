# Form contract

## Requirements

- `Form`은 공개 폼 컴포넌트로서 Provider를 고정 순서로 조합하고 `FormHandle` ref를 노출합니다. 노드 생성은 `RootNodeContextProvider`에 맡겨 폼 조합과 트리 생성의 책임을 분리합니다.
- **폼 밖으로 나가는 값은 `rootNode.normalizedValue`(정제 값)이고, 폼 안으로 들어오는 값은 raw입니다.** `getValue`·제출·최초 변경 방출은 정제 값을 읽고 `setValue`는 raw 값을 노드에 전달합니다. 편집 중인 노드 상태를 방출용 정제로 바꾸지 않기 위한 구분입니다.
- `onChange`는 `ready.current`가 참이 된 뒤에만 방출합니다. 직전 방출 값과 같은 참조는 다시 내보내지 않으며, 최초 방출은 `handleReady`가 담당합니다.
- `submit`은 정제 값을 먼저 확정한 뒤 `rootNode.validate()`를 수행한다. 에러가 하나라도 있으면 `inputOnSubmit`을 호출하지 않고 `ValidationError('SCHEMA_VALIDATION_FAILED')`를 던지며, 그 payload에 `{value, errors, jsonSchema}`를 담는다. 검증을 통과해야만 `inputOnSubmit(value)`가 호출된다.
- Provider의 현행 중첩 순서는 계약입니다. 바깥 설정과 안쪽 노드·폼 루트의 소비 관계를 유지해야 하므로 부분 렌더나 순서 변경은 허용하지 않습니다.

## API Contracts

### 값 채널

- `getValue()`·`submit`·최초 `onChange`는 `rootNode.normalizedValue`를 읽습니다. `setValue(value, options)`는 raw 값을 `rootNode.setValue`에 넘깁니다.
- `node`와 경로 조회는 노드 자체를 제공하므로 호출자가 raw 상태를 관찰할 수 있습니다. 이 조회를 폼 방출 값의 정제와 혼동하지 않습니다.
- 정제의 내용은 스키마 옵션과 노드가 결정합니다. 현재 `ArrayNode`의 `options.omitTrailing`이 적용 사례이며, `Form`은 읽을 채널을 고를 뿐 정제 규칙을 다시 구현하지 않습니다.

### `FormHandle`

`FormHandle`은 노드 조회·상태 변경·검증·제출을 폼의 현재 루트에 위임합니다. `reset`은 루트 Provider를 새 버전으로 다시 구성하고, 루트가 아직 없는 호출도 조회 경계에서 처리합니다.

- `rootNode`가 아직 없으면 조회 계열은 예외를 던지지 않는다. `findNode`는 `null`, `findNodes`·`getErrors`·`validate`는 빈 배열, `getState`는 빈 객체, `getValue`는 런타임에서 `undefined`를 반환한다.
- `focus`/`select`는 `find(path)`로 찾은 노드에 `RequestFocus`/`RequestSelect`를 발행한다. 경로가 없으면 아무 일도 하지 않는다.
- `submit`은 `getTrackableHandler`로 감싸여 진행 상태를 추적할 수 있다.

## Acceptance Criteria

### emit-normalized — 방출 경로는 정제 값을 낸다

- `options.omitTrailing`이 켜진 배열을 가진 폼에서 `getValue()`와 `onSubmit` 인자에 후행 빈 항목이 없다.
- 같은 폼의 최초 `onChange` 방출도 정제 값을 전달한다.
- 같은 폼에서 렌더된 배열 입력 개수는 줄지 않는다 — 정제는 방출에만 적용되고 노드 트리나 DOM을 지우지 않는다.

### submit-gate — 검증 실패는 제출을 막는다

- 검증 에러가 있는 상태에서 `submit()`을 호출하면 `inputOnSubmit`이 호출되지 않고 `ValidationError`가 던져진다.
- 던져진 에러의 `details`에 `value`·`errors`·`jsonSchema`가 들어 있다.

### emit-dedupe — 동일 값 재방출 억제

- `ready` 이전에는 `onChange`가 호출되지 않는다.
- 직전 방출과 동일한 참조가 다시 전달되면 `onChange`가 추가로 호출되지 않는다.

## Last Updated

2026-09-27 — 값 채널과 Provider 위임의 이유를 명확히 하고 공개 메서드 목록을 현재 계약으로 정리했습니다.
