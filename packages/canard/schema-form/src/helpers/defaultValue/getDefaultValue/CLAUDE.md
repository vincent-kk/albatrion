# getDefaultValue

## Purpose
JSON Schema의 `default` 프로퍼티를 우선 반환하고, 없으면 타입에 따른 빈값(`getEmptyValue`)을 반환하는 단일 함수 모듈.

## Structure
- `getDefaultValue.ts` — 핵심 구현 (제네릭 함수)
- `index.ts` — named export

## Conventions
- 제네릭 `Schema extends { type?, default? }`로 스키마 타입을 보존
- `virtual` 타입은 빈 배열 `[]` 반환
- `extractSchemaInfo`가 `null`이면 `undefined` 반환
- 순수 함수, 부수 효과 없음

## Boundaries

### Always do
- `schema.default !== undefined` 체크를 최우선으로 수행할 것
- `virtual` 타입 분기를 `extractSchemaInfo` 호출 전에 처리할 것

### Ask first
- 새 특수 타입(예: `virtual` 이외)에 대한 기본값 분기 추가

### Never do
- 이 함수 내에서 스키마 유효성 검사 수행
- `getEmptyValue` 외 다른 기본값 생성 로직 인라인 추가

## Dependencies
- `@/schema-form/helpers/jsonSchema` — `extractSchemaInfo`
- `@/schema-form/types` — `JsonSchemaWithVirtual`
- `../getEmptyValue` — `getEmptyValue`
