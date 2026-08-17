# JSONPointer — RFC 6901 JSON Pointer 구현

## Purpose

RFC 6901 JSON Pointer 구문과 그 위에서 동작하는 값 조작·패치 연산 계열을 소유한다. 포인터 구문 상수, 이스케이프 규칙, 값 읽기/쓰기, RFC 6902·7396 패치 적용이 하위 fractal에서 제공된다.

JSONPath 구문, 스키마 검증, 직렬화는 소유하지 않는다 — 각각 별도 모듈의 책임이다.

## Conventions

- 프로토타입 오염 방지가 기본값이다: 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)은 쓰기 계열 연산 전체에서 무시된다. 판별자는 `isForbiddenKey` 하나이며 하위 fractal들이 공유한다.
- 예약 멤버 상수의 canonical 위치는 constants organ이다. 새 쓰기 경로를 추가할 때 자체 판별을 작성하지 않고 이 판별자를 재사용한다.
- 루트 포인터는 `''`(빈 문자열)과 `#` 두 형태를 모두 허용한다. 단독 슬래시는 루트가 아니라 빈 문자열 키를 가리킨다.

## Boundaries

### Always do

- 쓰기 계열 연산(값 설정, 병합)을 추가·수정할 때 예약 멤버 처리를 `isForbiddenKey`로 일원화한다
- 패치 동작을 바꿀 때 해당 RFC 준수 여부를 DETAIL.md에 명시한다

### Ask first

- 예약 멤버 목록 확장 또는 차단 의미론(무시 vs 예외) 변경
- entry point가 재수출하는 하위 fractal 표면 변경

### Never do

- 예약 멤버 판별을 개별 연산에 하드코딩 (공유 판별자 우회)
