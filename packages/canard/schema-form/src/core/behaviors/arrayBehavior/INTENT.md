# arrayBehavior — 배열의 두 전략

## Purpose

배열 노드의 branch 자리별 자식 합성과 terminal 통째 원본 계산을 한 종류의 계약으로 묶습니다.

## Conventions

- 같은 `array` 종류 아래 `branch`·`terminal` 두 행을 두고 청사진의 전략 선택을 따릅니다(NODE-002·005, 35C-12).
- 두 전략의 투영과 구조 계획 보조는 이 종류의 `utils/`에 둡니다(NODE-009, LANDING-085).

## Boundaries

### Always do

- branch는 값의 자리로 자식 선언을 고르고 방출 없는 자리를 채운 뒤 선언 밖 꼬리 값을 보존합니다(NODE-052, VALUE-034).
- `arrange`는 효과 없이 계획만 돌려주며 자식 생성·경로 이동·정착은 settle에 맡깁니다(NODE-006·014, 33C-01).

### Ask first

- 배열의 전략 선택, 자리 청사진 규칙 또는 투영의 빈 값 정책을 바꿀 때

### Never do

- branch와 terminal을 별개 종류 fractal로 나누거나 행에서 원본 쓰기·자식 생성·통지를 하지 않습니다(NODE-006·009).
- behaviors 뿌리·settle·SchemaNode·레거시를 가져오지 않습니다(NODE-009·016, LANDING-159).
