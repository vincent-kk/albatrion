# schema-form/src/errors

## Purpose
schema-form 도메인 에러 클래스 모음. 모든 에러는 `@winglet/common-utils/error` 의 `BaseError` 를 상속하여 일관된 에러 구조를 제공한다.

## Structure
- `JsonSchemaError.ts` — JSON Schema 파싱/구조 오류 (알 수 없는 타입, 잘못된 oneOf 설정 등)
- `SchemaFormError.ts` — 폼 빌드 오류 (FormTypeInputMap 잘못된 키 패턴 등)
- `UnhandledError.ts` — 예상치 못한 예외 래퍼 (플러그인 등록 실패 등)
- `ValidationError.ts` — 폼 제출 시 유효성 검사 실패
- `index.ts` — barrel export (`export * from`)

## Conventions
- 각 에러 클래스는 `(code: string, message: string, details: ErrorDetails)` 생성자 패턴
- 각 에러 클래스와 함께 `is*Error(error): error is XxxError` 타입 가드 함수 제공
- `this.name` 을 클래스명으로 명시적 설정 (`this.name = 'JsonSchemaError'` 등)
- `details` 에 디버깅에 필요한 컨텍스트 정보 포함 (jsonSchema, path, plugin 등)

## Boundaries

### Always do
- 새 에러 클래스 추가 시 `BaseError` 상속 및 `is*Error` 타입 가드 함께 제공
- `index.ts` 에 `export *` 로 새 에러 포함
- `details` 객체에 에러 재현에 필요한 충분한 컨텍스트 포함

### Ask first
- 기존 에러 클래스의 `code` 문자열 변경 (외부에서 에러 코드를 문자열로 비교하는 코드에 영향)
- `BaseError` 상속 구조 이외의 에러 클래스 도입

### Never do
- 에러 클래스에 비즈니스 로직 추가 (순수 에러 데이터 컨테이너여야 함)
- `details` 에 민감한 사용자 데이터 포함
- `Error` 를 직접 상속하여 새 에러 생성 (`BaseError` 를 반드시 거쳐야 함)

## Dependencies
- `@winglet/common-utils/error` — `BaseError`, `ErrorDetails`
