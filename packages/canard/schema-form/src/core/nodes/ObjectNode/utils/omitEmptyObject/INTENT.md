# omitEmptyObject

## Purpose

빈 객체(`{}`)를 `undefined`로 변환하는 순수 유틸 함수. `ObjectNode`의 `onChange` 핸들러에서 `omitEmpty` 옵션이 활성화된 경우 적용된다.

## Structure

| 파일                 | 역할                             |
| -------------------- | -------------------------------- | ----------------------- | ------- | ---------- |
| `omitEmptyObject.ts` | 핵심 구현 — `(value: ObjectValue | Nullish) => ObjectValue | Nullish | undefined` |
| `index.ts`           | re-export 배럴                   |

## Conventions

- 순수 함수, 부수 효과 없음
- `isEmptyObject(value)` 가 `true`이면 `undefined` 반환, 그 외 원본 참조 그대로 반환
- `null`과 `undefined` 입력은 `isEmptyObject` 에 의해 `false` 판정 → 원본 통과
- 키가 하나라도 있으면 빈 객체로 간주하지 않음 (값이 `undefined`인 키 포함)

## Boundaries

### Always do

- 빈 객체(`{}`)만 `undefined`로 변환
- `null`/`undefined` 입력은 원본 그대로 반환
- 비어 있지 않은 객체는 원본 참조 그대로 반환 (복사 금지)

### Ask first

- 빈 객체를 `null`로 변환 (nullable 스키마 동작 및 ObjectNode 이벤트 흐름에 영향)

### Never do

- 객체 내용을 변경하거나 키를 필터링
- `ObjectNode` 외부 컨텍스트에서 이 함수로 직접 값 조작

## Dependencies

### 내부 의존성

- `ObjectValue` (타입) — `@/schema-form/types`

### 외부 의존성

- `isEmptyObject` — `@winglet/common-utils/filter`
- `Nullish` (타입) — `@aileron/declare`
