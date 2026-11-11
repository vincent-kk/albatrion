# FieldRendererContext

## Purpose

렌더러와 순수 오류 표시 판단·release 구독 경계를 공급합니다.

## Conventions

- 세부 선택·수명과 소유자 연결은 [DETAIL](DETAIL.md)에 둡니다.

## Boundaries

### Always do

- 라벨·오류 부품의 좁은 props 계약을 공급하고 실행과 복구는 FieldProxy에 맡깁니다.

- 노드 override를 먼저 판단하고 원시 오류를 표시 상태와 분리하여 판정 손실을 막습니다.

### Ask first

- 표시 우선순위·release 이력·구독 수명 또는 정책 종류를 바꿀 때

### Never do

- 렌더러를 직접 실행하거나 Context 밖에 표시 checker를 중복 구현하지 않습니다.
