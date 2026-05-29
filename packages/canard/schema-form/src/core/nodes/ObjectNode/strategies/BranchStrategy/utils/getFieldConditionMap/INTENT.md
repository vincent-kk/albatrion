# getFieldConditionMap

## Purpose

JSON Schema의 `if-then-else` 구조에서 필드별 조건 맵(`FieldConditionMap`)을 추출한다. 각 필드가 required가 되는 조건과 inverse 여부를 기록한다.

## Structure

| 파일/디렉토리                | 역할                                                                      |
| ---------------------------- | ------------------------------------------------------------------------- |
| `getFieldConditionMap.ts`    | `JsonSchema` → `FieldConditionMap` 변환 핵심 구현                         |
| `index.ts`                   | `getFieldConditionMap`, `FieldConditionMap`, `FlattenCondition` re-export |
| `utils/flattenConditions.ts` | `if-then-else` 중첩 구조 평탄화 (organ)                                   |

## Conventions

- 반환 타입: `FieldConditionMap` (`Map<string, Array<{condition, inverse?}> | true>`) 또는 `undefined`
- `true` 값: 해당 필드는 무조건 required (조건 추가 불가)
- `if` 블록의 프로퍼티 키 중 `required`에 포함되지 않은 키는 `true`로 등록
- 동일 필드에 복수 조건이 있으면 기존 배열에 `push`로 추가
- 중첩 구조 평탄화는 반드시 `flattenConditions`에 위임

## Boundaries

### Always do

- 조건 구조 평탄화는 `flattenConditions` 위임
- `if` 블록의 프로퍼티 키는 `true`로 등록 (조건 키 자체)
- 이미 `true`인 필드는 조건 추가 없이 건너뜀

### Ask first

- `flattenConditions` 결과 형식(`FlattenCondition`) 변경
- `allOf` 내 `if-then-else` 지원 확장

### Never do

- `flattenConditions`를 우회하여 스키마를 직접 파싱
- `FieldConditionMap`을 외부에서 직접 수정

## Dependencies

내부:

- `@/schema-form/types` — `JsonSchema`
- `./utils/flattenConditions` — `FlattenCondition`, `flattenConditions`

외부: 없음
