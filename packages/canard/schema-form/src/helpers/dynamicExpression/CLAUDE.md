# dynamicExpression

## Purpose
조건 딕셔너리를 실행 가능한 JavaScript 표현식 문자열로 변환하고, 다수의 조건을 논리 연산자로 결합하는 헬퍼 모음. 계산된 프로퍼티(`computed`)와 스키마 조건(`&if`) 생성에 사용된다.

## Structure
- `combineConditions/` — 문자열 조건 배열을 `&&` / `||` 로 결합
- `convertExpression/` — 조건 딕셔너리를 JSONPointer 기반 JS 표현식으로 변환
- `index.ts` — barrel export

## Conventions
- 모든 함수는 순수 함수; 표현식 문자열만 반환하고 실행하지 않음
- `convertExpression`의 기본 소스 경로는 `JSONPointer.Parent` (`..`)
- 조건이 없으면 `null` 반환
- 배열 값은 `includes()` 체크, 단일 값은 `===` / `!==` 비교
- `inverse: true` 시 드 모르간 법칙 적용 (`&&` → `||`)

## Boundaries

### Always do
- 생성된 표현식은 문자열로만 반환할 것 (직접 `eval`/`Function` 호출 금지)
- `combineConditions` 결과가 `null`인 경우를 호출부에서 처리할 것

### Ask first
- `convertExpression`에 새 값 타입(현재: 배열, boolean, 기타) 추가
- 기본 `source` 경로(`$.Parent`) 변경

### Never do
- 이 모듈에서 표현식을 직접 실행(`eval`, `new Function`) 하는 로직 추가
- JSONPointer 경로 유효성 검사를 이 레이어에서 수행

## Dependencies
- `@winglet/common-utils/array` — `map`
- `@winglet/common-utils/filter` — `isTruthy`, `isArray`
- `@winglet/common-utils/object` — `serializeNative`
- `@aileron/declare` — `Nullish`, `Dictionary`
- `@/schema-form/helpers/jsonPointer` — `JSONPointer`
- `@/schema-form/types` — `AllowedValue`
