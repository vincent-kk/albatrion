# getSafeEmptyValue

## Purpose
노드의 현재 값이 `undefined` 일 때 스키마 타입에 맞는 안전한 기본 빈 값을 반환한다. 루트 노드의 `onChange` 콜백에 전달할 값이 항상 정의된 상태임을 보장한다.

## Structure
- `getSafeEmptyValue.ts` — 함수 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- `value !== undefined` 이면 그대로 반환
- `undefined` 이면 `getEmptyValue(schemaType)` 폴백 (object→`{}`, array→`[]`, 등)
- `afterMicrotask` 래퍼 내부 `onChange` 호출 직전에 사용

## Boundaries

### Always do
- 루트 노드 `onChange` 호출 시에만 사용

### Ask first
- `null` 값 처리 방식 변경 (현재: null은 그대로 전달)

### Never do
- 자식 노드의 내부 값 처리에 사용 (루트 경계 전용)

## Dependencies
- `@/schema-form/helpers/defaultValue` — `getEmptyValue`
- `@/schema-form/types` — `JsonSchemaType`
