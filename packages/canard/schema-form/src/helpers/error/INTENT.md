# error

## Purpose
schema-form 내부에서 발생하는 에러 메시지 포맷팅과 검증 에러 변환을 담당하는 헬퍼 모음.

## Structure
- `formatErrorMessage/` — 스키마/런타임 에러별 구조화된 개발자용 메시지 생성 (15개 포맷터)
  - `utils/` — 공통 포맷 유틸 (divider, preview, list, type 등)
- `formatValidationError/` — JSON Schema 검증 에러를 사용자 정의 메시지로 변환
  - `utils/` — `getErrorMessage`, `replacePattern`
- `transformErrors/` — 에러 배열 필터링 및 키 할당
- `index.ts` — 세 서브모듈을 barrel export

## Conventions
- `formatErrorMessage` 포맷터는 개발자 콘솔용 멀티라인 ASCII 박스 형식 사용
- `formatValidationError`는 `FormatError` 타입 시그니처 준수
- `transformErrors`는 입력 배열을 직접 변형(`@warning THIS FUNCTION CHANGE INPUT ERRORS`)
- `sequence` 카운터는 모듈 수준 변수 (키 할당 시 단조 증가)

## Boundaries

### Always do
- 새 스키마 에러 포맷터는 `formatErrorMessage/` 하위에 개별 파일로 추가하고 `index.ts`에 export
- `formatValidationError`는 `FormatError` 인터페이스 시그니처를 반드시 준수

### Ask first
- `transformErrors`의 `ENHANCED_KEY` 필터 조건 변경
- `sequence` 카운터 초기화 또는 리셋 로직 추가

### Never do
- `transformErrors` 호출 후 원본 에러 배열이 변경됨을 가정하지 않는 코드 작성
- `formatErrorMessage` 포맷터에서 에러를 throw하거나 외부 상태 변경

## Dependencies
- `@/schema-form/app/constants` — `ENHANCED_KEY`
- `@/schema-form/types` — `FormatError`, `JsonSchemaError`
- `formatErrorMessage/utils/*` — 내부 포맷 유틸
