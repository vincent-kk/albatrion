# mergeShowConditions

## Purpose

조건 표현식 목록을 JSON Schema의 `computed.active` 속성으로 병합한다. 기존 `active` 조건과 새 조건들을 OR 결합하여 노드 가시성을 제어한다.

## Structure

| 파일                     | 역할                                                     |
| ------------------------ | -------------------------------------------------------- |
| `mergeShowConditions.ts` | `JsonSchemaWithRef` + `string[]` → 병합된 새 스키마 반환 |
| `index.ts`               | `mergeShowConditions` re-export                          |

## Conventions

- 반환 타입: `JsonSchemaWithRef` (원본 또는 병합된 새 객체)
- `conditions`가 없거나 `null`이면 원본 스키마 그대로 반환
- `computed.active` 또는 레거시 `&active`가 이미 `boolean`이면 병합 건너뜀
- 새 조건 목록은 `combineConditions(conditions, '||')`로 OR 결합 후 기존 `active`와 재결합
- `merge(jsonSchema, { computed: { active: expression } })`로 불변 새 객체 생성

## Boundaries

### Always do

- 원본 스키마 객체를 직접 수정하지 않고 `merge`로 새 객체 반환
- `active`가 이미 `boolean`이면 조건 병합 건너뜀
- OR 결합은 `combineConditions(conditions, '||')` 사용

### Ask first

- 결합 연산자를 `||`에서 `&&`로 변경
- 레거시 `&active` 키 지원 제거

### Never do

- 원본 `jsonSchema` 객체를 직접 변경(mutate)
- `computed.active`가 이미 문자열로 존재할 때 덮어쓰지 않음 — 항상 기존 값과 결합

## Dependencies

내부:

- `@/schema-form/helpers/dynamicExpression` — `combineConditions`
- `@/schema-form/types` — `JsonSchemaWithRef`

외부:

- `@winglet/common-utils/object` — `merge`
