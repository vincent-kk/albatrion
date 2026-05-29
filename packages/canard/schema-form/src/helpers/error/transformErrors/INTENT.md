# transformErrors

## Purpose

`JsonSchemaError` 배열에서 내부 강화 키(`ENHANCED_KEY`)를 `dataPath`에 포함하는 에러를 제거하고, 남은 에러에 모듈 수준 단조 증가 순차 키를 선택적으로 할당하여 반환한다.

## Structure

| 파일                 | 역할                                                                            |
| -------------------- | ------------------------------------------------------------------------------- |
| `transformErrors.ts` | `transformErrors(errors, key?)` 구현 — 입력 배열 요소를 직접 변형함(`@warning`) |
| `index.ts`           | `transformErrors` named export                                                  |

## Conventions

- `@warning THIS FUNCTION CHANGE INPUT ERRORS` — 입력 배열 요소의 `key` 필드를 직접 수정하므로 호출부에서 변형 인지 필수
- `ENHANCED_KEY`를 `dataPath`에 포함하는 에러는 결과 배열에서 제외
- `key` 인자가 `true`일 때만 모듈 수준 `sequence` 변수(`let sequence = 0`)로 단조 증가 키 할당
- 입력이 배열이 아니면(`isArray` false) 빈 배열 반환

## Boundaries

### Always do

- 호출부에서 입력 에러 배열이 변형될 수 있음을 인지하고 사용
- 반환 배열과 입력 배열을 동일 참조로 취급하지 말 것

### Ask first

- `sequence` 카운터 초기화 로직 추가 (기존 에러 키 연속성 파괴 위험)
- `ENHANCED_KEY` 필터 조건 변경 (강화 에러 노출 범위에 영향)

### Never do

- React 렌더 사이클 내에서 반복 호출 (`sequence`가 단조 증가하므로 키 중복 없이 계속 증가)
- 입력 배열을 순수하게 유지해야 하는 컨텍스트에서 사용

## Dependencies

내부:

- `@/schema-form/app/constants` — `ENHANCED_KEY`

외부:

- `@winglet/common-utils/filter` — `isArray`
- `@/schema-form/types` — `JsonSchemaError`
