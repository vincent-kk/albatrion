# error

## Purpose

개발자 진단 상자의 공유 원소(`createDivider`, `getErrorMessage`)와 사용자 검증 메시지 포맷터(`formatValidationError`)를 제공합니다. 이 셋을 `index.ts`가 이름으로 내보내는 계약으로 둡니다.

## Conventions

- 공유 원소는 개발자 콘솔용 멀티라인 진단 상자에 사용
- `formatValidationError`는 `FormatError` 타입 시그니처 준수

## Boundaries

### Always do

- 개별 진단 포맷터는 그 소비자 fractal의 `utils/`에 소유
- `formatValidationError`는 `FormatError` 인터페이스 시그니처를 반드시 준수

### Ask first

- `formatValidationError`의 `FormatError` 시그니처나 진단 박스 형식을 바꿀 때

### Never do

- 공유 원소와 검증 메시지 포맷터에서 외부 상태 변경
