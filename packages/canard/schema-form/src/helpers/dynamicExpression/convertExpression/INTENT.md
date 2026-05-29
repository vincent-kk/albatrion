# convertExpression

## Purpose

조건 딕셔너리(`{ key: value | value[] }`)를 JSONPointer 기반
JavaScript 비교 표현식 문자열로 변환한다.
배열 값은 `[...].includes(...)`, 단일 값은 `===` / `!==` 비교식으로 변환하며
`inverse: true` 시 드 모르간 법칙으로 연산자를 반전한다.

## Structure

| 파일                   | 역할                                                          |
| ---------------------- | ------------------------------------------------------------- |
| `convertExpression.ts` | 구현 + `ConditionDictionary` 타입 정의                        |
| `index.ts`             | `convertExpression`, `ConditionDictionary` re-export (barrel) |

## Conventions

- `ConditionDictionary` = `Dictionary<AllowedValue | AllowedValue[]>`
- 기본 소스 경로: `JSONPointer.Parent`(`..`) — 부모 노드 스코프 기준
- boolean 값은 `=== true` / `=== false` 형태로 따옴표 없이 출력
- 비boolean 단일 값은 `serializeNative` 로 직렬화
- `inverse: true` 시: 배열 → `![...].includes(...)`, 단일 → `!==`, 다중 결합 → `||` (정방향 `&&`)
- 결과 0개 → `null`, 1개 → 그대로, 복수 → `(...)` 래핑 후 연산자 join

## Boundaries

### Always do

- boolean 값 출력 시 `serializeNative` 대신 `value` 리터럴 직접 삽입하여 따옴표 방지
- `inverse` 적용 시 드 모르간 법칙(`&&` ↔ `||`)을 다중 결합 연산자에 일관 적용

### Ask first

- `Date`, `RegExp` 등 신규 값 타입 직렬화 지원 추가 (`serializeNative` 확장 연동)
- 기본 `source` 경로(`$.Parent`) 변경 — 호출부 계약에 광범위 영향

### Never do

- 생성된 표현식을 이 함수 내에서 `eval`, `Function()` 등으로 실행
- `ConditionDictionary` 키를 JSONPointer 경로로 해석하거나 정규화
- `isArray` 판별 없이 값 타입을 가정하여 직렬화 방식 고정

## Dependencies

- 내부: `@/schema-form/helpers/jsonPointer`(`JSONPointer` 별칭 `$`), `@/schema-form/types`(`AllowedValue`), `@aileron/declare`(`Dictionary`)
- 외부: `@winglet/common-utils/filter`(`isArray`), `@winglet/common-utils/object`(`serializeNative`)
