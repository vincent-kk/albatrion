# getFieldConditionMap

## Purpose
JSON Schema의 `if-then-else` 구조에서 필드별 조건 맵(`FieldConditionMap`)을 추출한다. 각 필드가 required가 되는 조건과 inverse 여부를 기록한다.

## Structure
- `getFieldConditionMap.ts` — 핵심 구현
- `index.ts` — re-export
- `utils/flattenConditions.ts` — `if-then-else` 중첩 구조 평탄화

## Conventions
- 반환 타입: `FieldConditionMap` (`Map<string, Array<{condition, inverse?}> | true>`)
- `true` 값: 해당 필드는 무조건 required (조건 없음)
- 이미 `true`인 필드는 조건 추가 불가
- 조건 키(`if` 블록 키) 자체는 `true`로 표시

## Boundaries

### Always do
- 조건 구조 평탄화는 `flattenConditions` 위임
- `if` 블록의 프로퍼티 키는 `true`로 등록
- 중복 필드는 기존 배열에 `push` 추가

### Ask first
- `flattenConditions` 결과 형식 변경
- `allOf` 내 `if-then-else` 지원 확장

### Never do
- 스키마를 직접 파싱하지 않고 반드시 `flattenConditions` 사용
- `FieldConditionMap`을 외부에서 직접 수정

## Dependencies
- `flattenConditions` — `utils/flattenConditions`
- `JsonSchema` — `@/schema-form/types`
