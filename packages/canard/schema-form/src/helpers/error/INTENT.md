# error

## Purpose

schema-form 내부에서 발생하는 에러 메시지 포맷팅을 담당하는 헬퍼 모음.

## Conventions

- `formatErrorMessage` 포맷터는 개발자 콘솔용 멀티라인 ASCII 박스 형식 사용
- `formatValidationError`는 `FormatError` 타입 시그니처 준수

## Boundaries

### Always do

- 새 스키마 에러 포맷터는 `formatErrorMessage/` 하위에 개별 파일로 추가하고 `index.ts`에 export
- `formatValidationError`는 `FormatError` 인터페이스 시그니처를 반드시 준수

### Ask first

- `formatValidationError`의 `FormatError` 시그니처나 진단 박스 형식을 바꿀 때

### Never do

- `formatErrorMessage` 포맷터에서 에러를 throw하거나 외부 상태 변경
