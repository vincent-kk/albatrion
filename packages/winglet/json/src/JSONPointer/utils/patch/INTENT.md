# patch — RFC 6902/7396 패치 연산 집합

## Purpose

RFC 6902(JSON Patch)의 생성(`compare`)·적용(`applyPatch`)과 RFC 7396(JSON Merge Patch)의 생성(`difference`)·적용(`mergePatch`), 자식 fractal 넷을 하나의 entry point 아래 모으는 부모 fractal이다. 생성-적용 쌍이 서로의 역연산인지(왕복 시 target과 동일한 구조로 재구성되는지)는 개별 자식의 단위 테스트로는 검증되지 않으므로, 이 fractal이 소유한 통합 테스트로 보장한다.

개별 연산의 RFC 준수 알고리즘은 소유하지 않는다 — 각 자식 fractal의 책임이다. 연산 이름·패치 형태 어휘도 소유하지 않는다 — 형제 fractal `patchModel`의 책임이며, entry point는 그 어휘를 재수출만 한다.

## Conventions

- entry point는 자식 fractal 넷의 공개 함수와 `patchModel`의 연산 어휘를 원래 이름 그대로 재수출한다 — 감싸거나 이름을 바꾸지 않는다.
- entry point는 패키지의 독립 서브패스로도 직접 노출된다 — 재수출 항등성이 깨지면 그 서브패스의 공개 표면도 함께 깨진다.
- 생성-적용 쌍의 재구성 계약이 깨지면 개별 자식 테스트가 아니라 이 fractal의 왕복 테스트가 먼저 실패해야 한다.

## Boundaries

### Always do

- 자식 fractal에 연산을 추가·변경하면 entry point 재수출을 함께 갱신한다
- 생성-적용 쌍의 재구성 계약을 바꾸는 변경은 왕복 테스트가 먼저 실패하는 것을 확인한 뒤 진행한다

### Ask first

- entry point가 재수출하는 `patchModel` 어휘의 범위 변경
- 다섯 번째 연산 계열(새 자식 fractal) 추가

### Never do

- 패치 연산 로직을 자식 fractal에 위임하지 않고 이 fractal에 직접 구현
- `patchModel`이 정의한 어휘를 재정의하거나 복제
