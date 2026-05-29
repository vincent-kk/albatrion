# getConditionsMap

## Purpose

`FieldConditionMap`을 필드별 실행 가능한 표현식 목록(`ConditionsMap`)으로 변환한다. `if-then-else` 등 조건부 스키마에서 추출한 조건을 동적 표현식으로 컴파일한다.

## Structure

| 파일                  | 역할                                                 |
| --------------------- | ---------------------------------------------------- |
| `getConditionsMap.ts` | `FieldConditionMap` → `ConditionsMap` 변환 핵심 구현 |
| `index.ts`            | `getConditionsMap`, `ConditionsMap` re-export        |

## Conventions

- 반환 타입: `ConditionsMap` (`Map<string, string[]>`) 또는 `undefined`
- `fieldConditionMap`이 `undefined`면 즉시 `undefined` 반환
- `conditions === true`인 항목은 무조건 required이므로 표현식 생성 없이 건너뜀
- `convertExpression(source.condition, source.inverse)` 결과가 falsy이면 결과 배열에 포함하지 않음
- `ConditionsMap`은 `Map<string, string[]>`으로 내보냄

## Boundaries

### Always do

- `fieldConditionMap`이 `undefined`이면 `undefined` 반환
- `true` 값 항목 건너뜀 (무조건 required 필드)
- 빈 표현식은 `operations` 배열에 포함하지 않음
- 표현식 변환은 `convertExpression`에 위임

### Ask first

- `convertExpression` 출력 형식 또는 시그니처 변경
- `ConditionsMap` 값 타입을 `string[]` 외 형태로 변경

### Never do

- 표현식을 직접 평가(eval) — 평가는 동적 표현식 헬퍼에 위임
- `FieldConditionMap` 원본을 직접 수정

## Dependencies

내부:

- `@/schema-form/helpers/dynamicExpression` — `convertExpression`
- `../getFieldConditionMap` — `FieldConditionMap` 타입 (상대 임포트)

외부: 없음
