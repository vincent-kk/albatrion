# core/nodes

## Purpose
JSON Schema 타입별 노드 클래스 집합. `AbstractNode` 를 기반으로 `StringNode`, `NumberNode`, `BooleanNode`, `NullNode`, `ArrayNode`, `ObjectNode`, `VirtualNode` 를 구현하며 폼 트리를 구성한다.

## Structure
- `AbstractNode/` — 모든 노드의 추상 기반 클래스 및 공유 유틸리티
- `ArrayNode/` — 배열 타입 노드 (BranchStrategy / TerminalStrategy)
- `ObjectNode/` — 객체 타입 노드 (BranchStrategy / TerminalStrategy)
- `StringNode/` — 문자열 타입 노드
- `NumberNode/` — 숫자/정수 타입 노드
- `BooleanNode/` — 불리언 타입 노드
- `NullNode/` — null 타입 노드
- `VirtualNode/` — 스키마 외 가상 노드 (조건부 필드, 계산 값)
- `type.ts` — 노드 공유 타입 (`SchemaNode`, `ChildNode`, `NodeEventType` 등)

## Conventions
- TypeScript strict 모드; 제네릭 `Schema extends JsonSchemaWithVirtual`, `Value extends AllowedValue`
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
- `organ` 디렉토리(`utils`, `types`, `strategies`) 에 CLAUDE.md 생성
- `AbstractNode` 를 우회하여 이벤트 발행 또는 상태 변경

## Dependencies
- `AbstractNode/utils/` — ComputedPropertiesManager, EventCascadeManager 등
- `@winglet/json/pointer` — JSONPointer 경로 처리
- `@winglet/common-utils` — 필터, 배열, 객체 유틸
- `@aileron/declare` — `Fn`, `Dictionary`, `Nullish` 타입
- `@/schema-form/types` — `JsonSchemaWithVirtual`, `AllowedValue`
