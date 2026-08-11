# resolveArrayValueFilter

## Purpose

`ArraySchema.options`의 `omitTrailing`/`omitEmpty`를 읽어 부모 전파(`onChange`) 값 필터 함수를 합성하는 순수 유틸 함수. `ArrayNode` 생성자에서 1회 호출된다.

## Structure

| 파일                         | 역할                                                                           |
| ---------------------------- | ------------------------------------------------------------------------------ |
| `resolveArrayValueFilter.ts` | `resolveArrayValueFilter(options): (value) => ArrayValue \| Nullish` 핵심 구현 |
| `index.ts`                   | barrel re-export                                                               |

## Conventions

- 순수 함수, 부수 효과 없음 — 옵션 판정은 호출 시점에 1회, 반환된 필터는 상태 없음
- 옵션 판정: `omitTrailing === true` (opt-in), `omitEmpty !== false` (opt-out)
- 둘 다 비활성이면 identity 필터 반환

## Boundaries

### Always do

- 필터 순서는 omitTrailing → omitEmpty 고정 (전부 `undefined`인 배열이 `[]`를 거쳐 `undefined`로 수렴)
- 실제 변환은 `omitTrailingArray`/`omitEmptyArray`에 위임

### Ask first

- 필터 순서 변경
- 새 배열 출력 옵션 추가 (필터 합성 조합 증가)

### Never do

- 필터 내부에서 자식 노드나 전략 상태 접근
- 변환 로직을 위임 없이 인라인으로 재구현

## Dependencies

**외부**

- `@aileron/declare` — `Nullish` 타입

**내부**

- `../omitEmptyArray`, `../omitTrailingArray` — 위임 대상 변환 함수
- `@/schema-form/types` — `ArraySchema`, `ArrayValue` 타입
