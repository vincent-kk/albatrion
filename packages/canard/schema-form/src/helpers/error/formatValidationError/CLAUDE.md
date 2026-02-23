# formatValidationError

## Purpose
JSON Schema 검증 에러를 스키마의 `errorMessages` 프로퍼티에 정의된 사용자 커스텀 메시지로 대체하고, 플레이스홀더 패턴을 실제 값으로 치환한다.

## Structure
- `formatValidationError.ts` — `FormatError` 인터페이스 구현체
- `utils/getErrorMessage.ts` — keyword와 context로 에러 메시지 조회
- `utils/replacePattern.ts` — 메시지 내 패턴(`{{field}}` 등)을 실제 값으로 치환
- `index.ts` — named export

## Conventions
- `FormatError` 시그니처: `(error, node, context) => string | undefined`
- `errorMessages`가 없거나 해당 `keyword`가 없으면 원래 `error.message` 반환
- 패턴 치환은 `replacePattern` 유틸에 위임

## Boundaries

### Always do
- `FormatError` 타입 시그니처를 반드시 준수할 것
- `errorMessages` 또는 `keyword` 부재 시 원본 메시지를 fallback으로 반환

### Ask first
- 패턴 치환 문법(`replacePattern`) 변경 (스키마 작성자 계약에 영향)
- `getErrorMessage`의 context 기반 우선순위 로직 변경

### Never do
- `formatValidationError` 내에서 에러를 throw
- `node.jsonSchema` 외의 소스에서 메시지 조회

## Dependencies
- `@/schema-form/types` — `FormatError`
- `./utils/getErrorMessage`
- `./utils/replacePattern`
