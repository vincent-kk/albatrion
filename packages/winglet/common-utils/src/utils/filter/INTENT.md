# filter — 값 타입 판별 유틸리티

## Purpose

원시·구조·환경 의존 타입에 대한 `isX(value): value is X` 형태의 판별자를 소유한다. 예외를 던지지 않고 항상 boolean(타입 프레디킷)으로 답하는 것이 모든 함수의 공통 계약이다.

구조 조작(클론·병합·직렬화·키 변환처럼 값 자체를 만들거나 바꾸는 연산)은 소유하지 않는다 — object 형제 fractal의 책임이며, object의 구조 조작 함수들은 이 fractal의 판별자를 엔트리 우회 없이 개별 파일로 가져가 재사용한다. "이 값이 무엇인가"를 답하는 canonical 위치는 이 fractal이다.

## Conventions

- 원시·구조 판별은 `typeof`/`instanceof`를 직접 쓴다. 환경 의존 전역(`Blob`/`Buffer`/`File`/`SharedArrayBuffer`)은 모듈 스코프에서 한 번만 참조해 두고 `undefined` 가드를 먼저 거친 뒤 판별한다 — 매 호출마다 전역을 다시 조회하지 않는다.
- 이 fractal 내부의 합성 판별(예: 비어있음·클론가능 여부가 다른 판별자에 의존하는 경우)은 형제 파일을 직접 가져와 합성하고, 로직을 복제하지 않는다.
- own-속성 기반 판별은 `hasOwnProperty` 프리미티브를 거쳐 `Object.prototype`에 나중에 추가된 속성(프로토타입 오염)의 영향을 받지 않는다.

## Boundaries

### Always do

- own-속성 판별의 `Object.prototype` 오염 내성을 유지한다 — `for...in` 단독이 아니라 own-속성 확인과 짝지어 쓴다
- 판별 알고리즘이나 반환 의미론을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 타입 판별 알고리즘 교체(`typeof`/`instanceof` ↔ 문자열 타입 태그 비교)
- `isEmptyObject`처럼 문서화된 성능-정확성 트레이드오프(내장 타입을 "비어있음"으로 취급)를 바꾸는 변경
- 예약 멤버(`__proto__`/`constructor`/`prototype`) 판별을 이 fractal의 책임으로 확장

### Never do

- 구조 조작(클론/병합/직렬화 등 값 변형)을 이 fractal에 추가
- 예외를 던지는 판별자 추가 — 입력이 무엇이든 boolean으로 답해야 한다
