# formatValidationError

## Purpose

JSON Schema 검증 에러를 스키마의 `errorMessages` 프로퍼티에 정의된 사용자 커스텀 메시지로 바꾸고, `{field}`, `{value}` 같은 플레이스홀더 패턴을 실제 값으로 치환한다.

## Conventions

- `FormatError` 시그니처: `(error, node, context) => string | undefined`
- `errorMessages`나 `keyword`가 없으면 원본 `error.message`를 반환한다(절대 throw하지 않는다).
- 로케일 메시지: `errorMessages[keyword]`가 객체이면 `context.locale` 키로 접근한다.
- 패턴 치환은 `{keyword}` 형식(중괄호)이며, `replacePattern` 안에서 `details` 키를 먼저 처리하고 그다음에 `{value}`를 처리한다.

## Boundaries

### Always do

- `FormatError` 타입 시그니처를 반드시 지킨다.
- `errorMessages`나 `keyword`가 없으면 원본 메시지를 fallback으로 반환한다.

### Ask first

- 패턴 치환 문법(`replacePattern`) 변경: 스키마 작성자가 쓰는 메시지 포맷 계약에 영향을 준다.
- `selectKeywordErrorMessage`의 `context.locale` 우선순위 로직 변경

### Never do

- `formatValidationError` 안에서 에러를 throw하지 않는다.
- `node.jsonSchema` 외의 소스(외부 상태, 글로벌 레지스트리 등)에서 메시지를 조회하지 않는다.
