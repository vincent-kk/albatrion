# getScopedSegment

## Purpose
노드의 scope(oneOf/anyOf/allOf/properties/items 등)와 variant 인덱스를 기반으로 JSON Schema 경로 세그먼트를 생성한다. `schemaPath` 구성에 사용되어 validator 에러의 `schemaPath` 와 노드의 `schemaPath` 를 매칭 가능하게 한다.

## Structure
- `getScopedSegment.ts` — 함수 본체
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- scope별 경로 생성 규칙:
  - `oneOf/anyOf/allOf` + `object` parent → `oneOf/0/properties/name`
  - `oneOf/anyOf/allOf` + `array` parent → `oneOf/0/items`
  - `properties` → `properties/name`
  - `items` → `items/0`
  - 커스텀 scope + variant → `scope/variant/name`
- `AbstractNode` 생성자 및 `__updatePath__` 에서 호출

## Boundaries

### Always do
- `scope` 가 falsy 이면 `name` 그대로 반환
- `variant` 가 `undefined` 이면 인덱스 세그먼트 생략

### Ask first
- 새 scope 타입 추가 시 경로 생성 규칙 검토 (`ValidationManager.matchesSchemaPath` 와 연동)

### Never do
- `schemaPath` 를 `AbstractNode` 외부에서 직접 조작
- `$.Separator` 없이 세그먼트를 연결

## Dependencies
- `@/schema-form/core/nodes/AbstractNode` — `AbstractNode['type']` 타입 참조
- `@/schema-form/helpers/jsonPointer` — `JSONPointer` (`$.Separator`, `$.Fragment`)
