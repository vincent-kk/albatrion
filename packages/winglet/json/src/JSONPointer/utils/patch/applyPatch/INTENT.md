# applyPatch — RFC 6902 JSON Patch 적용

## Purpose

RFC 6902 JSON Patch 연산 시퀀스(add, remove, replace, move, copy, test)를 소스 문서에 적용하는 연산을 소유한다.

패치 생성(compare)·머지 패치(difference, mergePatch)는 소유하지 않는다 — 형제 fractal의 책임이다.

## Conventions

- 연산은 주어진 순서대로 하나씩 적용되고, 실패는 `JsonPatchError`(구조화된 코드 포함)로 표면화된다.
- immutable 기본값(true)에서 변경 경로만 copy-on-write로 소유하고 무변경 서브트리는 소스와 구조를 공유한다.
- 예약 멤버 이름(`__proto__`, `constructor`, `prototype`)은 불투명한 문자열, 즉 own 데이터 속성으로 취급한다. 경로 순회와 연산 핸들러의 멤버 접근은 `@winglet/common-utils` 데이터 속성 프리미티브를 경유하며, 어떤 패치 입력에서도 상속 객체는 변경되지 않는다 — 안전성은 옵션이 아니라 구조적 보증이다.

## Boundaries

### Always do

- 새 연산 핸들러나 순회 경로를 추가할 때 멤버 읽기·쓰기·삭제를 데이터 속성 프리미티브로 유지한다
- 연산 의미론을 바꿀 때 RFC 6902 준수 여부를 DETAIL.md에 명시한다

### Ask first

- 옵션 표면(strict, immutable) 변경
- `JsonPatchError` 코드 계약 변경

### Never do

- 예약 멤버 접근을 개별 핸들러에 하드코딩 (프리미티브 우회)
- 프로토타입 안전성을 끌 수 있는 옵션 도입 — 옵션은 표현 방식이지 안전성 스위치가 아니다
