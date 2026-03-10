# transformErrors

## Purpose
`JsonSchemaError` 배열에서 내부 강화 키(`ENHANCED_KEY`)를 포함한 에러를 제거하고, 남은 에러에 순차 키를 할당하여 반환한다.

## Structure
- `transformErrors.ts` — 구현 (입력 배열 직접 변형 주의)
- `index.ts` — named export

## Conventions
- `@warning THIS FUNCTION CHANGE INPUT ERRORS` — 입력 배열 요소의 `key` 필드를 직접 수정
- `ENHANCED_KEY`를 `dataPath`에 포함하는 에러는 결과에서 제외
- `key` 옵션이 `true`일 때만 모듈 수준 `sequence` 카운터로 단조 증가 키 할당
- 입력이 배열이 아니면 빈 배열 반환

## Boundaries

### Always do
- 호출부에서 입력 에러 배열이 변형될 수 있음을 인지하고 사용할 것
- 반환 배열과 입력 배열을 동일 참조로 취급하지 말 것

### Ask first
- `sequence` 카운터 초기화 로직 추가 (기존 에러 키 연속성에 영향)
- `ENHANCED_KEY` 필터 조건 변경

### Never do
- 이 함수를 React 렌더 사이클 내에서 반복 호출 (sequence가 단조 증가하므로)
- 입력 배열을 순수하게 유지해야 하는 컨텍스트에서 사용

## Dependencies
- `@winglet/common-utils/filter` — `isArray`
- `@/schema-form/app/constants` — `ENHANCED_KEY`
- `@/schema-form/types` — `JsonSchemaError`
