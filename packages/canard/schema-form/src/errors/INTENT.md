# schema-form/src/errors

## Purpose

schema-form 도메인 에러 클래스와 패키지 전체의 오류·경고 코드 enum과 기록 형을 소유합니다. 모든 에러 클래스는 `@winglet/common-utils/error`의 `BaseError`를 상속하여 일관된 에러 구조를 제공합니다(ERROR-017·031·164).

## Conventions

- 각 에러 클래스는 `(code: <클래스>Code, message: string, details: ErrorDetails)` 생성자 패턴을 따르며, `code`는 `FormErrorCode` 중 그 클래스 그룹의 그룹 한정 값만 받는다(`SchemaFormErrorCode` 등)
- 오류·경고 코드의 정본은 `codes/`의 object enum `FormErrorCode`·`FormWarningCode` 둘이며 키는 맨 이름의 PascalCase, 값은 실제로 발생하는 그룹 한정 문자열
- 각 에러 클래스와 함께 `is*Error(error): error is XxxError` 타입 가드 함수를 제공한다
- `this.name` 을 클래스명으로 명시적으로 설정한다 (`this.name = 'JSONSchemaError'` 등)
- `details` 에 디버깅에 필요한 컨텍스트 정보(jsonSchema, path, plugin 등)를 담는다

## Boundaries

### Always do

- 새 에러 클래스를 추가할 때는 `BaseError`를 상속하고 `is*Error` 타입 가드를 함께 제공한다
- `index.ts` 에 새 에러를 이름으로 나열해 넣는다
- `details` 객체에 에러를 재현하는 데 필요한 컨텍스트를 충분히 담는다
- 코드 enum과 기록·보고기 형은 데이터로만 두고 사슬 끝 전달·묶음은 `engine/write`가 맡습니다(ERROR-004·005·029, LANDING-084).

### Ask first

- 기존 코드의 값 문자열을 바꾸는 경우 (외부에서 `error.code`를 비교하는 코드에 영향)
- `BaseError` 상속 구조를 따르지 않는 에러 클래스를 도입하는 경우

### Never do

- 에러 클래스에 비즈니스 로직을 추가하지 않는다 (순수한 에러 데이터 컨테이너여야 한다)
- `details` 에 민감한 사용자 데이터를 담지 않는다
- `Error` 를 직접 상속해 새 에러를 만들지 않는다 (반드시 `BaseError` 를 거쳐야 한다)

## Dependencies

- `@winglet/common-utils/error` — `BaseError`, `ErrorDetails`
