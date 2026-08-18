# errors — 구조화 오류 계층

## Purpose

`BaseError` 추상 클래스와 이를 확장하는 구체 오류 3종(`AbortError`/`InvalidTypeError`/`TimeoutError`), 그리고 각각의 instanceof 기반 타입가드(`isAbortError`/`isInvalidTypeError`/`isTimeoutError`)를 소유한다. 모든 오류는 `group`(대분류)·`specific`(세부 코드)·`code`(둘을 합친 식별자)·`details` 4개 필드로 프로그램적으로 식별 가능한 구조를 공유한다.

## Conventions

- 공개 subpath는 `@winglet/common-utils/error`(단수)다 — 디렉터리명 `errors`(복수)와 다르다.
- 새 구체 오류는 `BaseError`를 확장하고, 고정된 `group` 문자열과 `name`을 생성자에서 설정하며, `instanceof`만으로 판별하는 `isX` 가드를 함께 export한다.

## Boundaries

### Always do

- 새 오류 클래스 추가 시 `BaseError`를 확장하고 대응하는 `isX` 타입가드를 함께 export한다
- `group`/`code` 포맷을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- `BaseError` 생성자 시그니처(group, specific, message, details) 변경
- 기존 오류 클래스의 `group` 또는 `name` 값 변경

### Never do

- `isX` 타입가드를 `instanceof` 이외의 방식(덕타이핑 등)으로 변경
- `BaseError`의 프로토타입 복원(`new.target.prototype`) 로직을 우회하는 서브클래스 추가
