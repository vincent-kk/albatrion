# StringNode — 문자열 단말 값 계약

## Purpose

문자열 단말 값의 파싱과 빈 값 전달, blur 시 trim을 소유합니다. 자식 트리나 폼 전체의 문자열 정제 정책은 소유하지 않습니다.

## Conventions

- `omitEmpty !== false`이면 부모 변경 통보에서 빈 문자열(`''`)을 `undefined`로 변환하도록 생성자에서 `onChange` 경로를 고릅니다.
- `options.trim === true`일 때만 `Blurred` 이벤트를 구독해 저장된 값을 `trim()`합니다. 입력 중의 문자열을 blur 전에는 정리하지 않습니다.
- `undefined`와 nullable `null`을 먼저 구별하고 나머지 입력을 `parseString`으로 변환합니다.

## Boundaries

### Always do

- 빈 문자열의 부모 전달은 `__onChangeWithOmitEmpty__`에서 처리합니다.
- `trim`은 `Blurred` 이벤트 구독으로만 적용합니다.
- nullable을 확인한 뒤 `null` 허용 여부를 결정합니다.

### Ask first

- trim 적용 타이밍 변경 (현재 blur 시)
- omitEmpty 기본값 변경 (현재 `true`)

### Never do

- 부모 `onChange`에 빈 문자열을 그대로 전달 (omitEmpty 활성화 시). raw `__value__`와 `value`·`UpdateValue`에는 빈 문자열이 남을 수 있습니다
- 단말 노드에 자식을 추가하지 않습니다.
