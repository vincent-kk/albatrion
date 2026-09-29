# booleanBehavior — 불리언 터미널 행

## Purpose

불리언 노드의 제한된 입력 변환과 터미널 방출을 소유합니다.

## Conventions

- 행은 `type: 'boolean'`, `strategy: 'terminal'` 하나입니다(NODE-002·047).
- 종류 간 변환 표는 공유 parse에서 소비합니다(NODE-056).

## Boundaries

### Always do

- 정확한 문자열과 수 0·1만 불리언으로 변환합니다(WRITE-075).

### Ask first

- 불리언 입력의 변환 목록을 넓힐 때

### Never do

- truthy/falsy 강제 변환, 원본 쓰기 또는 상위 동작 표·정착·겉면 import를 하지 않습니다(NODE-006·009, WRITE-075).
