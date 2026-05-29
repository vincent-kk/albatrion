# checkComputedOptionFactory

## Purpose
JSON Schema의 `computed` 필드(active, visible, readOnly, disabled, pristine)에 대한 boolean 조건 함수를 생성하는 팩토리. 루트 스키마 → 노드 스키마 → `computed.*` → `&alias` 순서로 표현식을 탐색한다.

## Structure
- `checkComputedOptionFactory.ts` — 팩토리 함수 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- 반환 타입: `DynamicFunction<boolean> | undefined`
- `boolean` 리터럴 표현식은 상수 함수 `() => expression` 으로 최적화
- `string` 표현식은 `createDynamicFunction(..., coerceToBoolean: true)` 로 컴파일
- 탐색 우선순위: `rootJsonSchema[fieldName]` > `jsonSchema[fieldName]` > `jsonSchema.computed[fieldName]` > `jsonSchema[ALIAS + fieldName]`

## Boundaries

### Always do
- `ConditionFieldName` 타입에 정의된 필드명만 인자로 전달
- `coerceToBoolean: true` 를 `createDynamicFunction` 에 전달하여 boolean 반환 보장

### Ask first
- 탐색 우선순위 변경 (루트 스키마 vs 노드 스키마 우선순위)

### Never do
- 이 팩토리를 `ComputedPropertiesManager` 외부에서 직접 호출
- `string` 표현식을 `coerceToBoolean: false` 로 컴파일

## Dependencies
- `../createDynamicFunction` — JS 표현식 컴파일
- `../getPathManager` — `PathManager` 타입
- `../type` — `ALIAS`, `ConditionFieldName`
- `@/schema-form/types` — `JsonSchemaWithVirtual`
