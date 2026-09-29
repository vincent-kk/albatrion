# behaviors — 종류별 계산 행 경계

## Purpose

노드 종류와 전략에 따라 순수 계산 행을 선택하고, 여러 종류가 함께 쓰는 값 해석을 소유합니다.

## Conventions

- 행은 `BEHAVIORS[type][strategy]`로 찾고 모든 행의 칸 순서가 같습니다(NODE-002·006).
- 종류마다 독립 fractal을 두며, 공유 보조는 실제 소비자의 가장 낮은 공통 fractal에 둡니다(NODE-009).

## Boundaries

### Always do

- 같은 뜻의 칸은 함수 객체 하나를 공유하고, 없는 동작은 공유 칸으로 채웁니다(NODE-006).
- 변환은 받은 값의 뜻을 보존할 수 있을 때만 수행합니다(WRITE-075·093).

### Ask first

- 새 종류·전략 조합이나 `Behavior` 칸을 공개 표에 더할 때

### Never do

- 행에서 원본 쓰기, 자식 생성·확정, 되돌림 또는 통지를 하지 않습니다(NODE-006).
- 종류 fractal에서 이 뿌리, `settle`, `SchemaNode`, `dispatch`, `validation` 또는 레거시를 가져오지 않습니다(NODE-009, LANDING-159).
