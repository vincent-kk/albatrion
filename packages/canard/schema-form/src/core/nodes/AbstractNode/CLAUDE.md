# AbstractNode

## Purpose
모든 스키마 노드의 추상 기반 클래스. JSON Schema 기반 폼 트리에서 노드 정체성, 경로 관리, 값 관리, computed 속성, 상태, 유효성 검사, 이벤트 발행을 통합 제공한다.

## Structure
- `AbstractNode.ts` — 추상 클래스 본체 (1100+ lines)
- `index.ts` — barrel export
- `utils/` — 내부 매니저 및 유틸리티 (organ 디렉토리)

## Conventions
- TypeScript abstract class; `type`, `value`, `applyValue` 는 서브클래스에서 반드시 구현
- Domain-First 멤버 순서: Identity → Tree → Value → Computed → State → Validation → Events → Injection → Lifecycle → Constructor
- 내부 필드: `__fieldName__` 이중 언더스코어
- Protected 내부 메서드: `__methodName__` 패턴
- JSDoc: `@internal` (private), `@remarks` (추가 맥락), `@example` (공개 API)

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
- `utils/ComputedPropertiesManager` — computed 속성 계산 및 의존성 구독
- `utils/EventCascadeManager` — 이벤트 배치 발행/구독
- `utils/InjectionGuardManager` — 순환 inject 방지 (루트 전용)
- `utils/ValidationManager` — JSON Schema 유효성 검사 (루트 전용)
- `utils/ValidationErrorManager` — 에러 상태 관리
- `utils/` 순수 함수들 — afterMicrotask, findNode, shallowPatch 등
- `@winglet/json/pointer` — escapeSegment, setValue
- `@/schema-form/helpers/jsonPointer` — JSONPointer 상수 및 경로 헬퍼
