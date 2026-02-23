# validateCompatibility

## Purpose
allOf 병합 시 기반 스키마와 allOf 항목 간의 타입 호환성을 검증한다. 타입이 지정되지 않은 allOf 항목은 항상 호환 가능으로 처리하며, 타입이 있는 경우 `isCompatibleSchemaType`으로 정확히 일치하는지 확인한다.

## Structure
- `validateCompatibility.ts` — 핵심 구현 (단일 함수)
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드, 순수 함수
- 시그니처: `validateCompatibility(schema, allOfSchema) => boolean`
- 호환 규칙:
  - `allOfSchema.type === undefined` → `true` (타입 미지정은 항상 호환)
  - 그 외 → `isCompatibleSchemaType(schema, allOfSchema)`
- 비호환 타입 예시: `number` vs `integer`, `'string'` vs `['string', 'null']`
- nullable 배열 타입은 순서 무관하게 비교 (`['string','null']` = `['null','string']`)

## Boundaries

### Always do
- `allOfSchema.type`이 없으면 즉시 `true` 반환
- `isCompatibleSchemaType`을 통해 nullable 배열 타입 순서 무관 비교
- `processAllOfSchema`에서 병합 전에만 호출

### Ask first
- `number`/`integer` 호환성 정책 변경 (현재 비호환으로 처리)
- nullable vs non-nullable 호환성 허용 여부 변경

### Never do
- 이 함수 내부에서 스키마를 변경하거나 병합
- `false` 반환 시 에러를 직접 throw (에러는 호출부 `processAllOfSchema`에서 처리)
- `isCompatibleSchemaType` 없이 `schema.type` 직접 비교

## Dependencies
- `@winglet/json-schema/filter` — `isCompatibleSchemaType`
- `@/schema-form/types` — `JsonSchema`
