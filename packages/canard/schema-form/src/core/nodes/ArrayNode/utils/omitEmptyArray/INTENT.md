# omitEmptyArray

## Purpose

빈 배열(`[]`)을 `undefined`로 변환하는 순수 유틸 함수.
`ArrayNode`의 `onChange` 핸들러에서 `omitEmpty` 옵션이 활성화된 경우 적용된다.

## Structure

| 파일                | 역할                                                                  |
| ------------------- | --------------------------------------------------------------------- |
| `omitEmptyArray.ts` | `omitEmptyArray(value): ArrayValue \| Nullish \| undefined` 핵심 구현 |
| `index.ts`          | barrel re-export                                                      |

## Conventions

- 순수 함수, 부수 효과 없음
- `null`과 `undefined` 입력은 그대로 통과 — 오직 `length === 0`인 배열만 `undefined`로 변환
- 비어 있지 않은 배열은 원본 참조를 그대로 반환 (불필요한 객체 생성 없음)
- `isEmptyArray` 위임으로 빈 배열 판단 로직을 직접 구현하지 않는다

## Boundaries

### Always do

- `omitEmpty` 옵션이 활성화된 경우에만 `ArrayNode` onChange 경로에서 호출한다
- 빈 배열만 `undefined`로 변환하고 다른 값은 원본 그대로 반환한다

### Ask first

- 빈 배열 대신 `null`을 반환하도록 변경하는 경우 (nullable 스키마 동작에 영향)
- `ArrayNode` 외부 모듈이 이 함수를 직접 사용하는 경우

### Never do

- 배열 내용을 변경하거나 필터링하는 것
- 빈 배열 판단 기준을 `isEmptyArray` 없이 인라인으로 재구현하는 것

## Dependencies

**외부**

- `@winglet/common-utils/filter` — `isEmptyArray`
- `@aileron/declare` — `Nullish` 타입

**내부**

- `@/schema-form/types` — `ArrayValue` 타입
