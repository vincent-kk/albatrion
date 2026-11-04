# unionBehavior — union 터미널 행

## Purpose

여러 JSON 종류를 허용하는 터미널 노드에서 순서 없는 해석과 원본 방출을 소유한다.

## Conventions

- 행은 `type: 'union'`, `strategy: 'terminal'` 하나다(BLUEPRINT-043, NODE-047).
- 기본 spec과 좁혀진 유효 목록은 청사진과 정착의 메모에서 읽으며, 이 행은 값을 계산하기만 한다(WRITE-093).

## Boundaries

### Always do

- 멤버이면 원본을 유지하고, 변환 결과가 유일할 때만 바꾼다(WRITE-093).
- 객체·배열 원본을 복사하거나 내부를 정규화하지 않는다(VALUE-037).

### Ask first

- union 멤버십과 변환 후보의 동점 규칙을 바꿀 때

### Never do

- 선언 순서로 변환 우선순위를 정하거나 원본·경고등을 직접 쓰지 않는다(NODE-006·056, WRITE-093).
- behaviors 뿌리, settle, FieldNode, 레거시를 가져오지 않는다(NODE-009, LANDING-159).
