# JSONPointer — RFC 6901 JSON Pointer 구현

## Purpose

RFC 6901 JSON Pointer 구문과 그 위에서 동작하는 값 조작·패치 연산 계열을 소유한다. 포인터 구문 상수, 이스케이프 규칙, 값 읽기/쓰기, RFC 6902·7396 패치 적용이 하위 fractal에서 제공된다.

JSONPath 구문, 스키마 검증, 직렬화는 소유하지 않는다 — 각각 별도 모듈의 책임이다.

## Conventions

- 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)은 불투명한 문자열, 즉 own 데이터 속성으로 취급한다(RFC 6901/6902/7396 정합 — 세 RFC 모두 멤버 이름을 불투명 문자열로 규정한다). 예약 멤버의 읽기·쓰기·삭제는 `@winglet/common-utils`의 데이터 속성 프리미티브(`getDataProperty`/`setDataProperty`/`deleteDataProperty`)를 경유하며 프로토타입 체인과 접촉하지 않는다.
- 어떤 연산 경로에서도 `Object.prototype`을 포함한 상속 객체는 변경되지 않는다 — 이 무오염 불변식은 옵션이 아니라 구조적 보증이다.
- 세 공개 쓰기 API(`setValue`, `applyPatch`, `mergePatch`)는 동일한 예약 멤버 입력에 동일하게 관측되는 결과(반환 문서의 own 키, 프로토타입 불변, 에러 없음)를 낸다.
- 루트 포인터는 `''`(빈 문자열)과 `#` 두 형태를 모두 허용한다. 단독 슬래시는 루트가 아니라 빈 문자열 키를 가리킨다.

## Boundaries

### Always do

- 값 순회·기록 경로를 추가·수정할 때 예약 멤버 접근을 공유 프리미티브로 일원화한다
- 패치 동작을 바꿀 때 해당 RFC 준수 여부를 DETAIL.md에 명시한다

### Ask first

- 예약 멤버 목록 확장 또는 취급 의미론(own 데이터 취급) 변경
- entry point가 재수출하는 하위 fractal 표면 변경

### Never do

- 예약 멤버 **접근**(읽기·쓰기·삭제)을 공유 프리미티브 우회로 구현 — 판별의 인라인 분기는 성능 임계 루프에 한해 허용되며 `isReservedName`과 동일 판정을 유지해야 한다
- 예약 멤버 경로로 상속 객체를 읽어 문서에 싣거나 상속 객체를 변경하는 코드 경로 추가
