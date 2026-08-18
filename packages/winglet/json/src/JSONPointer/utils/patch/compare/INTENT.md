# compare — RFC 6902 패치 생성

## Purpose

두 JSON 값을 비교해 RFC 6902 patch 연산(add/remove/replace/test) 시퀀스를 생성하는 연산을 소유한다. 생성한 패치를 실제로 적용하는 것은 소유하지 않는다 — 형제 fractal `applyPatch`의 책임이다.

## Conventions

- 배열 원소 삭제는 인덱스 역순으로 방출한다 — `applyPatch`가 배열을 앞에서부터 splice로 처리하므로, 오름차순 삭제는 뒤 인덱스가 이미 줄어든 배열을 가리키게 만든다.
- `toJSON`(표준 훅) 또는 `toJson`(이 fractal이 받아들이는 별칭)을 가진 값은 비교 전에 그 반환값으로 축소된다.
- 순회는 own enumerable 키만 대상으로 하므로 프로토타입 체인에 닿지 않는다.

## Boundaries

### Always do

- 배열 삭제 순서(역순 방출)를 바꾸는 변경은 부모 fractal `patch`가 소유한 왕복 테스트로 먼저 실패를 확인한다
- `strict`·`immutable` 옵션의 관측 가능한 차이를 DETAIL.md에 반영한다

### Ask first

- `toJson` 별칭 지원 제거 또는 새 직렬화 훅 추가
- 배열·객체 타입 불일치 시 전체 교체 대신 부분 병합으로 바꾸는 변경

### Never do

- `compareRecursive`를 entry point에 노출
- 배열 삭제를 오름차순으로 방출해 `applyPatch` 왕복 계약을 깨는 변경
