# getChildSchema

## Purpose

배열 스키마에서 특정 인덱스의 자식 요소에 적용할 JSON Schema를 결정하는 순수 함수.
`prefixItems`와 `items` 키워드의 우선순위를 처리하여 올바른 스키마 또는 `null`을 반환한다.

## Structure

| 파일                | 역할                                                          |
| ------------------- | ------------------------------------------------------------- |
| `getChildSchema.ts` | `getChildSchema(schema, index): JsonSchema \| null` 핵심 구현 |
| `index.ts`          | barrel re-export                                              |

## Conventions

- 순수 함수, 부수 효과 없음; 입력 스키마 객체를 절대 변경하지 않는다
- 반환 타입은 항상 `JsonSchema | null` — `null`은 해당 인덱스에 적용 가능한 스키마 없음을 의미
- 우선순위: `prefixItems[index]` → `items` → `null` 순서로 평가
- `prefixItems`가 `undefined`이면 모든 인덱스에 `items` 스키마를 적용(또는 `null`)

## Boundaries

### Always do

- 스키마가 없는 경우 반드시 `null`을 반환한다 (caller인 `BranchStrategy`가 `null`을 push 중단 신호로 처리)
- `prefixItems` 범위를 초과한 인덱스는 `items` 스키마로 폴백한다

### Ask first

- 반환 타입을 `null` 이외의 sentinel 값(예: `false`, `undefined`)으로 변경하는 경우
- `BranchStrategy` 외부 모듈이 이 함수를 직접 참조하는 경우

### Never do

- 스키마 객체를 변경하거나 새 속성을 추가하는 것
- `ArrayNode/strategies/BranchStrategy/utils` 경계 밖에서 직접 import하는 것

## Dependencies

**외부**

- `@/schema-form/types` — `ArraySchema`, `JsonSchema` 타입
