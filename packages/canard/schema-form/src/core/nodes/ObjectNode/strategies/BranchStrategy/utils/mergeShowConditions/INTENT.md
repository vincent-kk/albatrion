# mergeShowConditions

## Purpose
조건 표현식 목록을 JSON Schema의 `computed.active` 속성으로 병합한다. 기존 `active` 조건과 새 조건들을 OR 결합하여 노드 가시성을 제어한다.

## Structure
- `mergeShowConditions.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 반환 타입: `JsonSchemaWithRef` (원본 또는 병합된 새 스키마)
- `conditions`가 없거나 `active`가 이미 boolean이면 원본 스키마 그대로 반환
- 기존 `computed.active` 또는 `&active`와 새 조건을 `||` OR 결합
- `combineConditions`로 표현식 조합, `merge`로 새 스키마 생성

## Boundaries

### Always do
- `active`가 이미 `boolean`이면 조건 병합 건너뜀
- 원본 스키마 객체는 수정하지 않고 `merge`로 새 객체 생성
- OR 결합은 `combineConditions(conditions, '||')` 사용

### Ask first
- AND 결합(`&&`)으로 변경
- `&active` 레거시 키 지원 제거

### Never do
- 원본 스키마를 직접 변경(mutate)
- `computed.active`가 이미 있는 경우 덮어쓰기

## Dependencies
- `combineConditions` — `@/schema-form/helpers/dynamicExpression`
- `merge` — `@winglet/common-utils/object`
- `JsonSchemaWithRef` — `@/schema-form/types`
