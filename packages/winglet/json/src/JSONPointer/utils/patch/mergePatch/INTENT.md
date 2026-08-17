# mergePatch — RFC 7396 JSON Merge Patch 적용

## Purpose

RFC 7396 JSON Merge Patch 문서를 소스 값에 적용하는 연산을 소유한다.

병합 패치 생성과 RFC 6902 패치 적용은 소유하지 않는다 — 각각 difference, applyPatch 형제 fractal의 책임이다.

## Conventions

- RFC 7396 의미론을 따른다: 비객체 패치는 완전 치환, null 값은 키 삭제, 객체는 재귀 병합.
- 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)은 불투명한 문자열, 즉 own 데이터 속성으로 병합된다. 접근은 `@winglet/common-utils` 데이터 속성 프리미티브를 경유하며, 병합 결과의 프로토타입과 상속 객체는 변경되지 않는다.
- immutable 파라미터(기본 true)는 RFC 밖의 구현 특성이다: 소스와 패치를 복제한 뒤 병합하며, false면 소스를 제자리에서 수정한다.

## Boundaries

### Always do

- 병합 로직을 바꿀 때 RFC 7396 §2 의사코드와의 차이를 DETAIL.md에 명시한다
- 예약 멤버의 own 데이터 병합과 무오염 불변식을 재귀의 모든 깊이에서 유지한다

### Ask first

- 예약 멤버 처리 의미론(own 데이터 병합)을 제외나 예외 발생으로 바꾸는 변경
- immutable 기본값 변경

### Never do

- 예약 멤버 병합을 프리미티브 우회 직접 대입으로 수행 (프로토타입 교체 경로)
- 패치 객체의 상속 속성(비자기 소유) 병합
- `Object.prototype` 등 상속 객체에 도달하는 병합 경로 추가
