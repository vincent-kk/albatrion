# core/nodes

## Purpose

JSON Schema 타입별 노드 클래스 집합. `AbstractNode` 를 기반으로 `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`, `ArrayNode`, `ObjectNode`, `VirtualNode` 를 구현하며 폼 트리를 구성한다.

## Structure

노드 공유 타입은 개별 노드 구현의 소유가 아니라 상위 core 모듈의 계약입니다. 특정 노드 안에 공용 타입을 복제하지 않습니다.

## Conventions

- TypeScript strict 모드; 제네릭 `Schema extends JSONSchemaWithVirtual`, `Value extends AllowedValue`
- 클래스 멤버는 Domain-First 순서 (Identity → Tree → Value → Computed → State → Validation → Events → Lifecycle → Constructor)
- `branch` 노드(object/array)는 children을 가질 수 있고, `terminal` 노드는 불가
- `integer` schemaType은 내부적으로 `number` 로 정규화
- 내부 필드는 `__fieldName__` 이중 언더스코어 네이밍

## Boundaries

### Always do

- 새 노드 타입은 반드시 `AbstractNode` 를 상속하고 `type`, `value`, `applyValue` 를 구현
- 각 노드 디렉토리에 `index.ts` barrel export 포함
- `NodeEventType` enum 을 사용하여 이벤트 발행

### Ask first

- 기존 `NodeEventType` 에 새 이벤트 타입 추가 (이벤트 bitmask 플래그 영향)
- `ChildNode` / `SchemaNode` 공유 타입 구조 변경
- `terminal` 판정 로직(`getNodeGroup`) 변경

### Never do

- 노드 내부 `__method__` 를 외부에서 직접 호출
- `organ` 디렉토리(`utils`, `types`, `strategies`) 에 INTENT.md 생성
- `AbstractNode` 를 우회하여 이벤트 발행 또는 상태 변경
