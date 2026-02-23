# getConditionsMap

## Purpose
`FieldConditionMap`을 필드별 실행 가능한 표현식 목록(`ConditionsMap`)으로 변환한다. `if-then-else` 등 조건부 스키마에서 추출한 조건을 동적 표현식으로 컴파일한다.

## Structure
- `getConditionsMap.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 반환 타입: `ConditionsMap` (`Map<string, string[]>`) 또는 `undefined`
- `true` 값 항목은 무조건 required이므로 표현식 생성 생략
- `convertExpression`으로 조건을 실행 가능한 문자열로 변환

## Boundaries

### Always do
- `fieldConditionMap`이 `undefined`이면 `undefined` 반환
- `true` 값 항목은 건너뜀 (무조건 required)
- 빈 표현식은 결과 배열에 포함하지 않음

### Ask first
- `convertExpression` 출력 형식 변경

### Never do
- 표현식을 직접 평가 (eval 금지) — 평가는 동적 표현식 헬퍼에 위임
- `FieldConditionMap`을 직접 수정

## Dependencies
- `getFieldConditionMap` — `FieldConditionMap` 타입
- `convertExpression` — `@/schema-form/helpers/dynamicExpression`
