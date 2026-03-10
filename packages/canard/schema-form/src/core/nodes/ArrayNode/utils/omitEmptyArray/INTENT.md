# omitEmptyArray

## Purpose
빈 배열(`[]`)을 `undefined`로 변환하는 순수 유틸 함수. `ArrayNode`의 `onChange` 핸들러에서 `omitEmpty` 옵션이 활성화된 경우 적용된다.

## Structure
- `omitEmptyArray.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 순수 함수, 부수 효과 없음
- 시그니처: `(value: ArrayValue | Nullish) => ArrayValue | Nullish | undefined`
- `isEmptyArray` (`@winglet/common-utils/filter`) 사용

## Boundaries

### Always do
- `null`과 `undefined` 입력은 그대로 통과
- 빈 배열(`length === 0`)만 `undefined`로 변환
- 비어 있지 않은 배열은 원본 참조 그대로 반환

### Ask first
- 빈 배열 대신 `null` 반환으로 변경 (nullable 스키마 동작에 영향)

### Never do
- 배열 내용을 변경하거나 필터링
- `ArrayNode` 외부에서 직접 이 함수를 호출하여 값 조작

## Dependencies
- `@winglet/common-utils/filter` (`isEmptyArray`)
- `ArrayValue`, `Nullish` — `@/schema-form/types`, `@aileron/declare`
