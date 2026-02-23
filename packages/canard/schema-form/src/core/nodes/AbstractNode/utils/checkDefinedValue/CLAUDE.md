# checkDefinedValue

## Purpose
JSON 직렬화 가능한 값이 "정의된" 상태인지 확인한다. 기본값의 유효성 판단에 사용되며, `null` 은 defined, `undefined` 는 not defined, 빈 객체/배열은 not defined로 처리한다.

## Structure
- `checkDefinedValue.ts` — 함수 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- JSON 직렬화 가능 타입 대상: `string`, `number`, `boolean`, `null`, `array`, `object`
- 객체의 경우 열거 가능한 own property가 하나라도 있으면 defined
- `Date`, `RegExp`, `Map`, `Set` 은 enumerable own property가 없어 not defined (의도적 동작)
- `AbstractNode.__setDefaultValue__()` 에서 `__isDefinedDefaultValue__` 플래그 설정에 사용

## Boundaries

### Always do
- JSON 직렬화 가능 타입에만 사용
- `null` 은 `true` 반환 (명시적 null은 defined 상태)

### Ask first
- `Date` / `Map` / `Set` 등 비-JSON 타입 지원 추가 (의도적으로 배제된 케이스)

### Never do
- 클래스 인스턴스나 함수 타입에 사용
- `undefined` 를 defined로 처리하도록 변경

## Dependencies
- `@winglet/common-utils/lib` — `hasOwnProperty`
