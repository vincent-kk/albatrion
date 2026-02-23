# getEmptyValue

## Purpose
JSON Schema 타입 문자열을 받아 해당 타입의 빈 초기값(`[]` 또는 `{}`)을 반환하는 최소 단위 순수 함수.

## Structure
- `getEmptyValue.ts` — 구현 (3줄 함수)
- `index.ts` — named export

## Conventions
- `'array'` → `[]`, `'object'` → `{}`, 그 외 → `undefined`
- 반환 타입: `ArrayValue | ObjectValue | undefined`
- 인자 `type`은 선택적(`string | undefined`)
- 순수 함수, 부수 효과 없음

## Boundaries

### Always do
- 원시 타입(`string`, `number`, `boolean`, `null`)은 `undefined` 반환을 유지할 것

### Ask first
- 새 컨테이너 타입 추가 시 (노드 시스템 전반의 기본값 초기화에 영향)

### Never do
- `null`, `0`, `false` 등 원시 타입 기본값 반환 로직 추가
- 이 함수에서 스키마 파싱이나 외부 의존성 추가

## Dependencies
- `@/schema-form/types` — `ArrayValue`, `ObjectValue`
