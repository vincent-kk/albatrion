# stringBehavior — 문자열 터미널 행

## Purpose

문자열 노드의 입력 해석과 문자열 방출·입력 마침 계산을 소유합니다.

## Conventions

- `type: 'string'`, `strategy: 'terminal'`인 행 하나를 둡니다(NODE-002·047).
- 공통 변환은 behaviors의 공유 parse를 사용합니다(NODE-056).

## Boundaries

### Always do

- 바꿀 수 없는 입력은 원본 그대로 돌려주고 `trim`은 `finishInput`에 둡니다(WRITE-075·084, NODE-007).

### Ask first

- 문자열 변환 표나 빈 문자열 방출 정책을 바꿀 때

### Never do

- 원본을 직접 쓰거나 behaviors 뿌리·settle·SchemaNode·레거시를 가져오지 않습니다(NODE-006·009).
