# AbstractNode

## Purpose

모든 스키마 노드의 추상 기반 클래스. JSON Schema 기반 폼 트리에서 노드 정체성, 경로 관리, 값 관리, computed 속성, 상태, 유효성 검사, 이벤트 발행을 통합 제공한다.

## Conventions

- Domain-First 멤버 순서: Identity → Tree → Value → Computed → State → Validation → Events → Injection → Lifecycle → Constructor
- Protected 내부 메서드 `__methodName__` 패턴; JSDoc: `@internal` (private), `@remarks` (추가 맥락), `@example` (공개 API)
- 루트 validation 값·루트 방출 값·`FormHandle.getValue`는 공개 `normalizedValue` getter 경유 (기본 `this.value`, 서브클래스가 값 정제 목적으로만 override)

## Boundaries

### Always do

- `AbstractNode` 를 상속하는 서브클래스는 `type`, `value` getter/setter, `applyValue` 를 구현
- 이벤트 발행은 `this.publish(EventType.X)` 를 통해 수행
- 값 변경 통보는 `this.onChange(value)` 를 통해 부모에게 전달
- `__initialize__` 는 부모 노드가 actor 로서 호출 (루트는 self)
- `find()` / `findAll()` 로 JSONPointer 경로 탐색

### Ask first

- `__reset__` 의 우선순위 로직(inputValue > derivedValue > defaultValue) 변경
- constructor 서명에 새 필드 추가 (`SchemaNodeConstructorProps`)
- `onChange` 전파 조건 변경 (`__computeManager__.active && __scoped__`)

### Never do

- `__eventManager__`, `__computeManager__` 등 private 매니저를 서브클래스에서 직접 접근
- `__setGlobalErrors__` 를 `ValidationManager` 외부에서 호출
- `integer` schemaType을 `type` 속성으로 노출 (내부적으로 `number` 로 정규화됨)
- root 여부 확인 없이 `__validationManager__` 직접 접근

## Dependencies

검증과 순환 inject 방지는 루트 노드가 소유하는 관리자를 통해 수행합니다. 계산 속성은 의존 노드 구독과 연결되며, 이벤트 전달의 revision은 늦게 등록된 구독자가 누락된 갱신을 감지하는 기준입니다.
