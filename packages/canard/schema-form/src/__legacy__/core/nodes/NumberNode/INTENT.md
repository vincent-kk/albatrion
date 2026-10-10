# NumberNode — 수치 단말 값 계약

## Purpose

number·integer 스키마의 단말 값 파싱과 수치 비교를 소유합니다. 부모에게 전달할 빈 값 처리와 노드 값 적용을 구분하며 자식 트리는 만들지 않습니다.

## Conventions

- 런타임 노드 종류가 `number`여도 `schemaType === 'integer'`일 때만 `parseNumber`에 정수 모드를 전달합니다. 작성 스키마의 정수 제한을 잃지 않습니다.
- 일반 비교는 `isClose`를 쓰고 full precision 비교는 엄격한 동등성을 씁니다. 값 쓰기의 중복 판정에는 full precision을 적용합니다.
- `omitEmpty !== false`이면 부모 변경 통보의 `NaN`과 `undefined`를 `undefined`로 변환하도록 생성자에서 `onChange` 경로를 고릅니다.

## Boundaries

### Always do

- 정수 여부는 `schemaType` 비교로만 판단 (`type` 직접 비교 금지)
- `NaN`은 부모 전달 시에만 `undefined`로 바꿉니다 (omitEmpty 기본 활성화). raw `__value__`와 `value`·`UpdateValue`에서는 `NaN`이 그대로 관찰됩니다
- `__equals__`에서 일반 비교와 full precision 비교를 구분합니다.

### Ask first

- `isClose` tolerance 값 변경
- `omitEmpty` 기본값 변경 (현재 `true`)

### Never do

- 부모 `onChange`에 `NaN`을 그대로 전달 (omitEmpty 활성화 시)
- `integer` 타입에 소수값을 강제 저장하지 않습니다.
