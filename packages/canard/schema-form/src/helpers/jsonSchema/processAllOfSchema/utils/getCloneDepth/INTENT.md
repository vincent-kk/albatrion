# getCloneDepth

## Purpose
JSON Schema의 타입에 따라 `cloneLite` 복제에 필요한 깊이(depth)를 결정한다. object=3, array=2, 그 외 primitive=1을 반환하여 allOf 병합 전 최소한의 안전한 복제 깊이를 제공한다.

## Structure
- `getCloneDepth.ts` — 핵심 구현 (단일 함수)
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드, 순수 함수
- 시그니처: `getCloneDepth(schema: JsonSchema) => 1 | 2 | 3`
- `isObjectSchema`: depth 3 (properties, required, propertyNames 등 3단계 중첩)
- `isArraySchema`: depth 2 (items 포함 2단계)
- 그 외: depth 1 (단순 값)

## Boundaries

### Always do
- `processAllOfSchema`의 `cloneLite` 호출에서만 사용
- 반환값은 항상 양의 정수 (1, 2, 3 중 하나)

### Ask first
- 깊이 기준 변경 (object를 4 이상으로 늘리는 경우 등)
- 새 스키마 타입 추가 시 깊이 정책 결정

### Never do
- 이 함수 내부에서 스키마를 직접 복제하거나 변경
- `processAllOfSchema` 외부에서 독립 호출

## Dependencies
- `@winglet/json-schema/filter` — `isObjectSchema`, `isArraySchema`
- `@/schema-form/types` — `JsonSchema`
