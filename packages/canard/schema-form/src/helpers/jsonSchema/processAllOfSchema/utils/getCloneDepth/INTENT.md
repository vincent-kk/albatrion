# getCloneDepth

## Purpose

JSON Schema의 타입에 따라 `cloneLite` 복제에 필요한 최소 안전 깊이를 결정한다. `isObjectSchema` → 3, `isArraySchema` → 2, 그 외 primitive → 1을 반환하여 `processAllOfSchema`의 allOf 병합 전 복제 깊이를 제공한다.

## Structure

| 파일               | 역할                                                              |
| ------------------ | ----------------------------------------------------------------- |
| `getCloneDepth.ts` | `getCloneDepth(schema: JsonSchema) => 1 \| 2 \| 3` 단일 순수 함수 |
| `index.ts`         | barrel export                                                     |

## Conventions

- 반환값은 항상 `1 | 2 | 3` 리터럴 타입 (양의 정수)
- object 스키마 → depth 3: `properties`, `required`, `propertyNames` 등 3단계 중첩 반영
- array 스키마 → depth 2: `items` 포함 2단계 구조 반영
- 그 외 primitive → depth 1: 단순 값 복제로 충분
- 함수 내부에서 스키마를 복제하거나 변경하지 않음 (depth 계산만 담당)

## Boundaries

### Always do

- `processAllOfSchema`의 `cloneLite` 호출 인자로만 사용
- 반환값 `1 | 2 | 3` 범위를 유지할 것

### Ask first

- depth 상한값 변경 (object를 4 이상으로 늘리는 경우)
- 새 스키마 타입(`tupleSchema` 등) 추가 시 깊이 정책 결정

### Never do

- 이 함수 내부에서 스키마를 직접 복제하거나 변경
- `processAllOfSchema` 외부에서 독립적으로 호출

## Dependencies

외부:

- `@winglet/json-schema/filter` — `isObjectSchema`, `isArraySchema`
- `@/schema-form/types` — `JsonSchema`
