# objectBehavior — 객체의 두 전략

## Purpose

객체 노드의 branch 자식 합성과 terminal 통째 값 계산을 한 종류의 계약으로 묶습니다.

## Conventions

- 같은 `object` 종류 아래 `branch`·`terminal` 두 행을 둡니다(NODE-002·009).
- 두 전략이 함께 쓰는 보조는 이 종류의 `utils/`에 둡니다(NODE-009).

## Boundaries

### Always do

- branch는 현재 형상의 자식만 합성하고 terminal은 자식 없이 원본 참조를 유지합니다(NODE-043, VALUE-002).
- 키 순서는 청사진 전순서와 `propertyKeys`·`extras`의 계약을 지킵니다(SETTLE-042).

### Ask first

- 객체의 전략 선택이나 빈 객체 방출 정책을 바꿀 때

### Never do

- branch와 terminal을 별개 종류 fractal로 나누거나 행에서 자식 생성·원본 쓰기를 하지 않습니다(NODE-006·009).
- behaviors 뿌리·settle·SchemaNode·레거시를 가져오지 않습니다(NODE-009, LANDING-159).
