# omitTrailingArray

## Purpose

배열 끝의 연속된 `undefined` 요소를 제거하는 순수 유틸 함수. `ArrayNode`의 출력 경로(`onChange` 핸들러, `outputValue`)에서 `omitTrailing` 옵션이 활성화된 경우 적용된다.

## Structure

| 파일                   | 역할                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `omitTrailingArray.ts` | `omitTrailingArray(value): ArrayValue \| Nullish` 핵심 구현 |
| `index.ts`             | barrel re-export                                            |

## Conventions

- 순수 함수, 부수 효과 없음 — 원본 배열을 변경하지 않고 `slice` 사본 반환
- `null`/`undefined` 입력과 비배열은 그대로 통과
- 제거할 후행 `undefined`가 없으면 원본 참조를 그대로 반환 (불필요한 객체 생성 없음)
- `null` 요소는 제거 대상이 아니다 — 오직 `undefined`만

## Boundaries

### Always do

- 배열 끝에서부터 연속된 `undefined`만 제거한다
- 선행·중간 `undefined`는 보존한다 — 제거하면 index가 밀려 error path와 validation 매핑이 어긋난다

### Ask first

- 제거 대상에 `null`을 포함하는 변경
- `ArrayNode` 외부 모듈이 이 함수를 직접 사용하는 경우

### Never do

- 선행·중간 `undefined` 제거
- 원본 배열 in-place 변경

## Dependencies

**외부**

- `@winglet/common-utils/filter` — `isArray`
- `@aileron/declare` — `Nullish` 타입

**내부**

- `@/schema-form/types` — `ArrayValue` 타입
