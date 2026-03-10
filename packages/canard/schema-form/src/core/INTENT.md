# schema-form/src/core

## Purpose
JSON Schema를 노드 트리로 변환하고 폼 상태를 관리하는 핵심 엔진. `nodeFromJsonSchema()` 팩토리로 스키마를 파싱하여 타입별 노드(StringNode, NumberNode, ObjectNode 등) 트리를 생성한다.

## Structure
- `nodeFromJsonSchema.ts` — 공개 팩토리 함수, JSON Schema → SchemaNode 변환 진입점
- `nodes/` — 노드 구현체 (AbstractNode, StringNode, NumberNode, BooleanNode, ArrayNode, ObjectNode, NullNode, VirtualNode)
- `parsers/` — 타입별 값 파서 (parseString, parseNumber, parseArray, parseObject, parseBoolean)
- `__tests__/` — 352개+ 명세 검증 테스트

## Conventions
- 클래스는 Domain-First 멤버 순서: Identity → Tree → Value → Computed → State → Validation → Events → Injection → Lifecycle → Constructor
- 내부 필드/메서드는 `__name__` 이중 언더스코어
- 이벤트는 `EventCascade` 를 통해 마이크로태스크 배칭
- `UpdateValue` 는 즉시(synchronous) 발행, 나머지는 배칭
- 노드 타입 가드: `isStringNode`, `isArrayNode`, `isObjectNode` 등

## Boundaries

### Always do
- 새 노드 타입 추가 시 `AbstractNode` 상속 및 `nodes/index.ts` export 포함
- 노드 값 변경은 반드시 `setValue()` 공개 API 사용
- 파서 함수는 순수 함수로 유지 (사이드 이펙트 없음)
- 노드 상태 변경 시 관련 이벤트 발행

### Ask first
- `EventCascade` 배칭 메커니즘 변경 (이벤트 타이밍 회귀 위험)
- `SetValueOption` 비트 플래그 추가 또는 변경
- `AbstractNode` 에 새 공개 메서드 추가 (모든 노드 타입에 영향)
- `BranchStrategy` / `TerminalStrategy` 분기 조건 수정

### Never do
- 노드의 `__value__` 등 private 필드에 외부에서 직접 접근
- `__tests__/` 파일을 수정하지 않고 명세 동작 변경
- 파서 함수에 JSON Schema 검증 로직 추가 (파서는 값 변환만 담당)
- 노드 트리를 순환 참조 구조로 구성

## Dependencies
- `@winglet/json` — JSONPointer 처리
- `@winglet/json-schema` — Schema 타입 및 resolveSchema
- `@winglet/common-utils` — 필터, 유틸
- `@aileron/declare` — `Fn` 등 공통 타입
- `@/schema-form/helpers/` — 내부 헬퍼
- `@/schema-form/types` — `AllowedValue`, `JsonSchema`, `ValidatorFactory`
