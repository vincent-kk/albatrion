# errors contract

## Requirements

- `BaseError`는 `group`·`specific`·`code`·`details` 4개 읽기전용 필드를 가지며, `details` 생략 시 빈 객체로 채워진다.
- `BaseError`의 생성자는 `new.target.prototype`으로 프로토타입을 복원해, 서브클래스 인스턴스가 `instanceof` 체인(구체 클래스 → `BaseError` → `Error`) 전 구간에서 올바르게 판별된다.
- 구체 오류 3종은 각각 고정된 `group` 값과 `name` 값을 가지며, 소비자가 전달하는 `code` 인자는 `specific` 필드에 매핑된다.
- 각 `isX` 타입가드는 대응 클래스의 인스턴스에서만 `true`이며, 다른 오류·원시값·`null`/`undefined`/plain object에서는 `false`다.

## API Contracts

- `BaseError(group, specific, message, details = {})` — abstract 클래스. `code`는 `group`과 `specific`을 마침표로 이어붙인 문자열이다.
- `BaseError.toJSON()` — `name`, `message`, `stack`, `group`, `specific`, `code`, 정규화된 `details`를 가진 새 객체를 반환한다. `JSON.stringify`가 자동 호출하며, 임의의 최상위 추가 속성은 포함하지 않는다.
- `details`의 객체·배열을 복사하며 조상 순환 참조와 `undefined`·함수·심볼 값은 객체에서 생략하고 배열에서 `null`로 바꾼다. 공유 참조는 각 위치에 보존한다. `BigInt`는 10진 문자열, 유한하지 않은 수는 `null`로 바꾼다.
- 중첩 `Error`는 열거 가능한 속성과 `name`·`message`·`stack`·존재하는 `cause`를 직렬화한다. 오류 객체에서는 이 진단 정보 투영이 사용자 정의 `toJSON`보다 우선한다. 그 외 객체는 호출 가능한 `toJSON(key)`의 결과를 현재 노드에서 한 번 사용하고 재귀 정규화한다. 날짜도 이 규칙을 따른다.
- `details` 자체의 `toJSON`도 `key = 'details'`로 호출하며 원시값이나 `undefined`를 반환할 수 있으므로 반환 타입의 `details`는 `unknown`이다. `undefined`인 `stack`과 `details`는 JSON 문자열에서 생략된다.
- 박싱된 `Number`·`String`·`Boolean`·`BigInt`는 `toJSON` 적용 후 원시값으로 변환한다. 숫자·문자열 변환은 기본 JSON의 사용자 정의 강제 변환을 따르며 예외를 전파한다. 박싱된 `BigInt`도 10진 문자열로 정규화한다. `Symbol` 객체는 기본 JSON처럼 열거 가능한 속성을 처리한다.
- 다른 실행 컨텍스트의 오류는 `Error.isError`가 있으면 해당 판별을 사용하고, 없으면 로컬 `instanceof` 또는 `Symbol.toStringTag`가 없는 객체의 네이티브 Error 태그로 판별한다. 구형 환경에서는 사용자 정의 태그가 있는 외부 컨텍스트 오류의 식별을 보장하지 않는다. 일반 공개 `isError` 타입가드의 계약은 변경하지 않는다.
- 중첩 오류의 `errors` 속성이 존재하면 비열거 속성도 포함해 재귀 정규화한다. `AggregateError`의 이름 변경, 다른 실행 컨텍스트, 순환 원인·오류 목록도 동일한 규칙을 따른다.
- 자체 열거 가능한 문자열 키만 처리하며 `__proto__`도 데이터로 보존한다. 원본은 변경하지 않으며 getter·사용자 정의 `toJSON`의 예외는 전파한다. 자동 마스킹이나 임의 깊이 제한은 제공하지 않는다.
- `AbortError(code, message, details = {})` — `group`은 `'ABORT'`, `name`은 `'Abort'`로 고정. `isAbortError(error): error is AbortError`.
- `InvalidTypeError(code, message, details = {})` — `group`은 `'INVALID_TYPE'`, `name`은 `'InvalidType'`로 고정. `isInvalidTypeError(error): error is InvalidTypeError`.
- `TimeoutError(code, message, details = {})` — `group`은 `'TIMEOUT'`, `name`은 `'Timeout'`로 고정. `isTimeoutError(error): error is TimeoutError`.

## Acceptance Criteria

### base-error-identity — BaseError 필드와 프로토타입 체인

- `group`/`specific`/`code`/`message`/`details`가 생성자 인자대로 설정되고, `details` 생략 시 `{}`로 채워진다.
- 인스턴스는 `Error`와 `BaseError` 양쪽의 `instanceof`를 만족하며, 프로토타입 체인이 서브클래스 → `BaseError` → `Error` 순서로 유지된다.

### concrete-error-taxonomy — 구체 오류 3종의 고정값과 타입가드

- `AbortError`/`InvalidTypeError`/`TimeoutError`는 각각 `group`이 `'ABORT'`/`'INVALID_TYPE'`/`'TIMEOUT'`, `name`이 `'Abort'`/`'InvalidType'`/`'Timeout'`로 고정된다(예: `AbortError('USER_CANCELLED', ...).code === 'ABORT.USER_CANCELLED'`).
- `details`를 생략하면 세 클래스 모두 `{}`로 채워진다.
- `isAbortError`/`isInvalidTypeError`/`isTimeoutError`는 대응 클래스 인스턴스에서만 `true`이고, 일반 `Error`·다른 서브클래스·`null`/`undefined`/원시값/plain object에서는 `false`다.

### base-error-json — 진단 정보의 JSON 직렬화

- 반환 객체와 `JSON.stringify(error)` 결과는 오류 식별 필드와 비열거 진단 정보를 포함한다. 없는 `stack`은 JSON 문자열에서 생략된다.
- 순환 참조·공유 참조·배열 위치·특수 원시값·중첩 오류·날짜·사용자 정의 직렬화가 API 계약을 따른다.
- 원본과 반환 객체는 중첩 데이터 참조를 공유하지 않으며, 특수 키가 반환 객체의 프로토타입을 변경하지 않는다.
- 구체 오류 서브클래스에서 메소드를 상속하고 예외를 던지는 사용자 코드의 실패를 숨기지 않는다.

### base-error-json-boxed-values — 박싱 값과 기본 JSON 호환성

- 로컬·외부 실행 컨텍스트의 박싱된 원시값은 값과 JSON 표현을 보존하며, 숫자·문자열·불리언은 기본 JSON 출력과 일치한다.
- 사용자 정의 직렬화가 박싱 해제보다 우선하고 숫자·문자열의 강제 변환 예외를 숨기지 않는다. 위장 타입 태그는 원시값의 내부 브랜드로 인정하지 않는다.
- 사용자 정의 타입 태그가 있는 실제 박싱 값과 `Symbol` 객체도 데이터 손실 없이 명시된 규칙을 따른다.

### base-error-json-native-errors — 실행 컨텍스트와 집계 오류

- 다른 실행 컨텍스트의 오류와 원인도 `name`·`message`·`stack`을 보존한다. 네이티브 판별과 구형 환경의 대체 판별을 각각 검증한다.
- `AggregateError.errors`의 오류·원시값·공유 참조·순환 참조는 일반 정규화 규칙을 따르며 원본을 변경하지 않는다.
- 위장 Error 태그를 가진 일반 객체를 오류로 승격하지 않으며, 오류의 사용자 정의 `toJSON`보다 진단 필드 투영이 우선한다. `errors` 접근자의 예외는 전파한다.

## Boundary Exemptions

### `*.ts` — flat 오류 클래스 계층 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `BaseError`와 3개 구체 클래스가 파일당 하나로 나란히 있는 flat 구조 자체가 상속 계층을 보여준다 — organ으로 묶으면 어떤 클래스가 부모인지 경로만으로 알 수 없게 된다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

2026-09-18 — BaseError JSON 직렬화 계약 추가
