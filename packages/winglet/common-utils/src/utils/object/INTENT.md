# object — 순수 객체 조작 유틸리티

## Purpose

플레인 객체·배열에 대한 구조 조작(클론, 병합, 비교, 직렬화, 키/값 변환)과 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)의 안전한 데이터 속성 접근 프리미티브를 소유한다.

타입 판별은 소유하지 않는다 — filter 형제 fractal의 책임이다. 예약 멤버 판별과 접근 규칙의 canonical 위치는 이 fractal이며, 상위 소비자(`@winglet/json` 등)는 엔트리 포인트를 경유해 이 규칙을 공유한다.

## Conventions

- 예약 멤버 이름은 불투명한 문자열, 즉 own 데이터 속성으로 취급한다(RFC 6901/6902/7396 정합). 읽기는 프로토타입 체인으로 넘어가지 않고, 쓰기는 `__proto__` setter를 트리거하지 않으며, 어떤 경로에서도 대상 객체의 프로토타입과 `Object.prototype`을 포함한 상속 객체는 변경되지 않는다.
- 예약 멤버 분기는 예약 멤버일 때만 발생한다 — 일반 키 경로에 측정 가능한 비용을 추가하지 않는다. 성능이 존재 이유인 유틸(`cloneLite` 등)을 수정할 때는 bench 전/후 수치로 무회귀를 증명한다.

## Boundaries

### Always do

- 예약 멤버 이름을 읽거나 쓰는 코드 경로는 데이터 속성 프리미티브(`getDataProperty`/`setDataProperty`/`deleteDataProperty`)를 경유하거나, 공유 판별자(`isReservedName`) 분기 위에서 동등한 own 데이터 속성 의미론을 지킨다
- 예약 멤버 계약을 바꾸는 변경은 DETAIL.md를 먼저 갱신한다

### Ask first

- 예약 멤버 목록 확장 또는 취급 의미론(own 데이터 취급) 변경
- 데이터 속성 프리미티브의 시그니처 변경

### Never do

- `__proto__` 대입으로 대상 프로토타입을 교체하는 쓰기 경로 추가
- `Object.prototype` 등 상속 객체에 도달하는 읽기/쓰기 경로 추가
