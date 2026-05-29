# formatValidationError

## Purpose

JSON Schema 검증 에러를 스키마의 `errorMessages` 프로퍼티에 정의된 사용자 커스텀 메시지로 대체하고, `{field}` / `{value}` 등 플레이스홀더 패턴을 실제 값으로 치환한다.

## Structure

| 파일                       | 역할                                                                                    |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `formatValidationError.ts` | `FormatError` 시그니처 구현체 — `errorMessages` 조회 후 `replacePattern` 위임           |
| `utils/getErrorMessage.ts` | `keyword` 및 `context.locale`로 에러 메시지 조회; `errorMessages.default` fallback 처리 |
| `utils/replacePattern.ts`  | `error.details` 키 + `{value}` 패턴을 실제 값으로 치환                                  |
| `index.ts`                 | `formatValidationError` named export                                                    |

## Conventions

- `FormatError` 시그니처: `(error, node, context) => string | undefined`
- `errorMessages` 또는 `keyword` 부재 시 원본 `error.message` 반환 (절대 throw 금지)
- 로케일 메시지: `errorMessages[keyword]`가 객체인 경우 `context.locale` 키로 접근
- 패턴 치환: `{keyword}` 형식 (중괄호) — `replacePattern` 내부에서 `details` 키 → `{value}` 순 처리

## Boundaries

### Always do

- `FormatError` 타입 시그니처를 반드시 준수할 것
- `errorMessages` 또는 `keyword` 부재 시 원본 메시지를 fallback으로 반환

### Ask first

- 패턴 치환 문법(`replacePattern`) 변경 — 스키마 작성자가 사용하는 메시지 포맷 계약에 영향
- `getErrorMessage`의 `context.locale` 우선순위 로직 변경

### Never do

- `formatValidationError` 내에서 에러를 throw
- `node.jsonSchema` 외의 소스(외부 상태, 글로벌 레지스트리 등)에서 메시지 조회

## Dependencies

내부:

- `./utils/getErrorMessage`
- `./utils/replacePattern`

외부:

- `@aileron/declare` — `Dictionary` (getErrorMessage 내부)
- `@/schema-form/types` — `FormatError`, `BasicSchema`, `PublicJsonSchemaError`
