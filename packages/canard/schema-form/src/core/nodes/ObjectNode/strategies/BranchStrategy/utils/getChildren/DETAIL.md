# getChildren

## Requirements

프로퍼티 순서를 유지하면서 필요한 가상 노드를 참조 필드 앞에 배치합니다.

## API Contracts

- 처리한 가상 참조는 전달된 맵에서 삭제하여 같은 참조를 다시 삽입하지 않습니다.
- 참조 노드와 기본값 배열은 같은 순서로 수집하고 가상 노드의 onChange는 no-op으로 둡니다.

## Acceptance Criteria

### get-children-contract — 관찰 가능한 동작

- 동일한 가상 참조가 여러 필드에 걸쳐 있어도 한 번만 삽입됩니다.
- 일반 자식의 상대 순서는 propertyKeys 순서와 일치합니다.

## Last Updated

2026-09-16
