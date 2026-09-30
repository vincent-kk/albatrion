# virtualBehavior — 참조 그룹 행

## Purpose

형제 노드를 묶는 가상 노드의 참조 자식과 로컬 튜플 값을 계산합니다.

## Conventions

- 가상 노드는 항상 `type: 'virtual'`, `strategy: 'branch'`입니다(NODE-047).
- 값은 참조 노드에서 읽으며 자체 `raw`·`emit`을 소유하지 않습니다(NODE-034).

## Boundaries

### Always do

- 참조된 형제의 값 순서로 `local`을 합성하고 자식 선언에는 참조만 돌려줍니다(NODE-034·054).

### Ask first

- 가상 노드의 자식 참조·튜플 순서 또는 방출 부재를 바꿀 때

### Never do

- 자체 원본을 만들거나 검증·방출에 가상 값을 끼워 넣지 않습니다(NODE-034).
- behaviors 뿌리·settle·SchemaNode·레거시를 가져오지 않습니다(NODE-009, LANDING-159).
