# virtualBehavior 계약

## Requirements

- 의존 방향은 `blueprint·record·behaviors/utils < virtualBehavior < behaviors 뿌리 < SchemaNode`입니다. 정착·겉면·레거시를 가져오지 않으며 경계 예외가 없습니다(NODE-009·016, LANDING-159).

## API Contracts

- 진입점은 `virtualBehavior: Behavior`를 이름으로 내보냅니다. 공통 여덟 칸 순서(`arrange`는 공유 거부 칸, 36C-01), `type: 'virtual'`, `strategy: 'branch'`를 지킵니다. `options.terminal: true`는 행 선택이 아니라 청사진 오류입니다(NODE-002·006·047).
- `declareChildren`은 청사진 `fields`가 가리키는 형제 참조를 선언 순서로 돌려주고 새 독립 노드를 만들지 않습니다. `assemble`은 참조 노드의 `value`를 같은 순서의 튜플 `local`로 만듭니다. `value` 게터는 그 `local`을 읽으며 자체 `raw`와 `emit`은 없습니다(NODE-034·054).
- `project`는 방출 없음이고 표준 `required`·가드·검증에는 가상 이름을 넣지 않습니다. `interpret`는 참조 노드로 보낼 입력을 계산할 뿐 쓰기와 자식 확정은 정착이 맡습니다. 가상 노드는 `typeMismatch`를 켜지 않습니다(NODE-006·034, VALUE-030).

## Acceptance Criteria

### virtual-row — 참조 그룹

- 참조 자식은 별도 원본 없이 실제 형제 노드를 가리키고, `local` 튜플 순서와 방출 부재가 유지됩니다(NODE-034·054).

## Last Updated

2026-09-29
