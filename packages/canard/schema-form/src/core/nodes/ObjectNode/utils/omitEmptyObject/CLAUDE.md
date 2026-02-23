# omitEmptyObject

## Purpose
빈 객체(`{}`)를 `undefined`로 변환하는 순수 유틸 함수. `ObjectNode`의 `onChange` 핸들러에서 `omitEmpty` 옵션이 활성화된 경우 적용된다.

## Structure
- `omitEmptyObject.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 순수 함수, 부수 효과 없음
- 시그니처: `(value: ObjectValue | Nullish) => ObjectValue | Nullish | undefined`
- `isEmptyObject` (`@winglet/common-utils/filter`) 사용
- `null`과 `undefined` 입력은 그대로 통과

## Boundaries

### Always do
- 빈 객체(`{}`)만 `undefined`로 변환
- `null`/`undefined`는 원본 그대로 반환
- 비어 있지 않은 객체는 원본 참조 그대로 반환

### Ask first
- 빈 객체를 `null`로 변환 (nullable 스키마 동작에 영향)

### Never do
- 객체 내용을 변경하거나 키를 필터링
- `ObjectNode` 외부에서 이 함수로 직접 값 조작

## Dependencies
- `@winglet/common-utils/filter` (`isEmptyObject`)
- `ObjectValue`, `Nullish` — `@/schema-form/types`, `@aileron/declare`
