# NullNode

## Purpose
JSON Schema `null` 타입을 처리하는 단말 노드. `null` 또는 `undefined` 값만 허용하며 type-safe한 null 표현을 제공한다.

## Structure
- `NullNode.ts` — 메인 클래스, `AbstractNode` 상속
- `filter.ts` — `isNullNode` 타입 가드
- `index.ts` — re-export

## Conventions
- `value`는 `null | undefined`만 허용
- `nullable`이 없어도 `null` 값 수용 (`null` 타입 자체가 nullable 의미)
- `parseValue`는 `undefined` → `undefined`, 그 외 → 입력값 그대로 반환
- 클래스 멤버 Domain-First 순서 준수

## Boundaries

### Always do
- `__emitChange__`를 통해서만 내부 상태 갱신
- `__initialize__()` 생성자 마지막에 호출

### Ask first
- `null` 이외의 값 허용 (타입 계약 변경)

### Never do
- `__value__`에 `null`/`undefined` 외 값 할당
- 자식 노드 추가 (단말 노드)

## Dependencies
- `AbstractNode` — 기반 클래스
- `NullSchema`, `NullValue` — `@/schema-form/types`
- `NodeEventType`, `SetValueOption` — `core/nodes/type`
