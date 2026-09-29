# BooleanNode — boolean 단말 값 계약

## Purpose

boolean 스키마의 단말 값을 파싱하고 변경을 공통 노드 생명주기에 전달합니다. 자식 트리나 별도의 boolean 상태 계산은 소유하지 않습니다.

## Conventions

- `undefined`는 그대로 두고 nullable일 때만 `null`을 보존합니다. 나머지 입력만 `parseBoolean`에 맡겨 부재와 false를 구별합니다.
- 기본값은 `__emitChange__`로 적용한 뒤 마지막에 `__initialize__()`를 호출합니다. 초기 쓰기와 초기화 이후 변경의 이벤트 상태를 구별합니다.
- `SetValueOption`의 변경 통보·새로고침·값 업데이트 비트는 각각의 발행 경로를 독립적으로 결정합니다.

## Boundaries

### Always do

- 값 변경은 `__emitChange__`를 거쳐 내부 상태와 이벤트를 함께 갱신합니다.
- `__parseValue__`에서 nullable을 확인한 뒤 `null` 허용 여부를 결정합니다.
- `__initialize__()`를 생성자 마지막에 호출합니다.

### Ask first

- `parseBoolean`의 falsy 처리 변경
- 새 `options.*` 동작 추가

### Never do

- `__emitChange__`를 우회해 `__value__`에 직접 할당하지 않습니다.
- 단말 노드에 자식 노드를 추가하지 않습니다.
