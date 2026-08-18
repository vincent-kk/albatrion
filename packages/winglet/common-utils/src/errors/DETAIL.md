# errors contract

## Requirements

- `BaseError`는 `group`·`specific`·`code`·`details` 4개 읽기전용 필드를 가지며, `details` 생략 시 빈 객체로 채워진다.
- `BaseError`의 생성자는 `new.target.prototype`으로 프로토타입을 복원해, 서브클래스 인스턴스가 `instanceof` 체인(구체 클래스 → `BaseError` → `Error`) 전 구간에서 올바르게 판별된다.
- 구체 오류 3종은 각각 고정된 `group` 값과 `name` 값을 가지며, 소비자가 전달하는 `code` 인자는 `specific` 필드에 매핑된다.
- 각 `isX` 타입가드는 대응 클래스의 인스턴스에서만 `true`이며, 다른 오류·원시값·`null`/`undefined`/plain object에서는 `false`다.

## API Contracts

- `BaseError(group, specific, message, details = {})` — abstract 클래스. `code`는 `group`과 `specific`을 마침표로 이어붙인 문자열이다.
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

## Boundary Exemptions

### `*.ts` — flat 오류 클래스 계층 유지 (fractal root)

- **Consumers**: `entry-point`
- **Direct import**: `allowed`
- **Reason**: `BaseError`와 3개 구체 클래스가 파일당 하나로 나란히 있는 flat 구조 자체가 상속 계층을 보여준다 — organ으로 묶으면 어떤 클래스가 부모인지 경로만으로 알 수 없게 된다. zero-peer 승인은 `.filid` 설정의 scoped exempt와 쌍이다.

## Last Updated

2026-08-18 — 최초 계약 작성
