# core/nodes — 기존 런타임 노드 계약

## Purpose

기존 런타임에서 스키마 종류에 맞는 노드의 값·자식·이벤트 생명주기를 소유합니다. 공유 노드 타입은 개별 노드가 다시 정의하지 않고 상위 core 계약에 둡니다.

## Conventions

- branch만 자식 트리를 관리하고 terminal은 값의 잎으로 남깁니다. 자식 보유 여부와 값 처리 계약을 섞지 않습니다.
- `integer`는 런타임 노드 종류를 `number`로 정규화하되 원래 `schemaType`은 정수 파싱 판단을 위해 보존합니다.
- 각 노드는 공통 초기화·값 적용·이벤트 규칙을 상속하고, 타입별 파싱만 해당 노드에서 결정합니다.

## Boundaries

### Always do

- 새 기존 엔진 노드는 `AbstractNode`를 상속하고 `type`, `value`, `applyValue`를 구현합니다.
- 외부 소비에는 노드별 진입점을 사용하고 이벤트는 `NodeEventType`으로 발행합니다.

### Ask first

- bitmask 의미에 영향을 주는 `NodeEventType` 추가
- `ChildNode` / `SchemaNode` 공유 타입 구조 변경
- 자식 보유 경계를 바꾸는 `getNodeGroup` 판정 변경

### Never do

- 외부에서 노드 내부 `__method__`를 직접 호출하지 않습니다.
- 독립 계약이 없는 내부 구획에 별도 INTENT.md를 만들지 않습니다.
- `AbstractNode`를 우회하여 이벤트를 발행하거나 상태를 변경하지 않습니다.
