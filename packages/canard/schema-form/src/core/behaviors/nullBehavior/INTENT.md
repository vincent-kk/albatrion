# nullBehavior — null 터미널 행

## Purpose

null 노드의 입력 멤버십과 원본 참조 방출을 소유합니다.

## Conventions

- 행은 `type: 'null'`, `strategy: 'terminal'` 하나입니다(NODE-047).
- null 변환은 하지 않고 없음인 `undefined`와 구별합니다(WRITE-075·093).

## Boundaries

### Always do

- `null`을 그대로 받고 다른 값의 원본을 보존합니다(WRITE-084).

### Ask first

- null의 채움·방출 의미를 바꿀 때

### Never do

- 임의 값을 null로 강제하거나 원본을 직접 쓰거나 상위 동작 표·정착·겉면을 가져오지 않습니다(NODE-006·009).
