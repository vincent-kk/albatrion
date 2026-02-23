# getChildSchema

## Purpose
배열 스키마에서 특정 인덱스의 자식 요소에 적용할 JSON Schema를 결정하는 순수 함수. `prefixItems`와 `items` 키워드를 조합하여 올바른 스키마를 반환한다.

## Structure
- `getChildSchema.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 순수 함수, 부수 효과 없음
- 반환 타입: `JsonSchema | null` (`null`은 해당 인덱스에 스키마 없음을 의미)
- 우선순위: `prefixItems[index]` → `items` → `null`
- `prefixItems`가 없으면 모든 인덱스에 `items` 적용

## Boundaries

### Always do
- 스키마 없는 경우 `null` 반환 (caller는 `null`을 push 중단 신호로 처리)
- `prefixItems` 범위를 초과한 인덱스는 `items` 스키마로 폴백

### Ask first
- 반환 타입을 `null` 이외의 sentinel 값으로 변경하는 경우

### Never do
- 스키마 객체를 변경하거나 새 속성 추가
- `BranchStrategy` 외부에서 이 함수를 직접 import

## Dependencies
- `ArraySchema`, `JsonSchema` — `@/schema-form/types`
