# convertExpression

## Purpose
조건 딕셔너리(`{ key: value }`)를 JSONPointer 기반 JavaScript 비교 표현식 문자열로 변환한다. 배열 값은 `includes()`, 단일 값은 `===`/`!==` 비교로 변환된다.

## Structure
- `convertExpression.ts` — 구현 및 `ConditionDictionary` 타입 정의
- `index.ts` — named export (`convertExpression`, `ConditionDictionary`)

## Conventions
- `ConditionDictionary`: `Dictionary<AllowedValue | AllowedValue[]>`
- 기본 소스: `JSONPointer.Parent` (`..`)
- `inverse: true` 시 배열은 `!includes()`, 단일은 `!==`, 다중 결합은 `||`
- 빈 딕셔너리이면 `null` 반환
- `serializeNative`로 값을 안전하게 직렬화

## Boundaries

### Always do
- boolean 값은 `=== true` / `=== false` 형태로 따옴표 없이 출력할 것
- `inverse` 적용 시 드 모르간 법칙을 일관되게 적용(`&&` ↔ `||`)

### Ask first
- 새 값 타입(예: Date, RegExp) 직렬화 지원 추가
- 기본 `source` 경로 변경

### Never do
- 생성된 표현식을 이 함수 내에서 실행
- `ConditionDictionary` 키를 JSONPointer 경로로 해석하거나 검증

## Dependencies
- `@winglet/common-utils/filter` — `isArray`
- `@winglet/common-utils/object` — `serializeNative`
- `@aileron/declare` — `Dictionary`
- `@/schema-form/helpers/jsonPointer` — `JSONPointer`
- `@/schema-form/types` — `AllowedValue`
