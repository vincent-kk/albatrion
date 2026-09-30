# numberBehavior — 수 터미널 행

## Purpose

수·정수 노드의 입력 해석과 터미널 값 방출을 소유합니다.

## Conventions

- 종류는 `number` 한 행이고 `schemaType: 'integer'`는 그 행의 허용 형입니다(NODE-057).
- 전략은 언제나 `terminal`입니다(NODE-047).

## Boundaries

### Always do

- 문자열을 변환할 때 전체 수 표기와 유한성, 정수의 안전 범위를 확인합니다(WRITE-075·093).

### Ask first

- number와 integer의 멤버십 또는 변환 범위를 바꿀 때

### Never do

- 이미 수인 값을 자르거나 원본을 직접 쓰지 않고, 상위 동작 표·정착·겉면을 가져오지 않습니다(WRITE-075, NODE-009).
