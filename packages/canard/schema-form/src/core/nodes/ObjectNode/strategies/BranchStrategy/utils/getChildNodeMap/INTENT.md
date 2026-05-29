# getChildNodeMap

## Purpose

객체 스키마의 `properties`로부터 자식 노드 맵(`ChildNodeMap`)을 생성한다. 각 프로퍼티에 조건 표현식(`conditionsMap`)과 가상 참조 조건(`virtualReferencesMap`)을 `unique`로 병합하여 `nodeFactory`로 노드를 생성한다.

## Structure

| 파일                 | 역할                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| `getChildNodeMap.ts` | 핵심 구현 — `getChildNodeMap`, `getVirtualReferenceConditions` (내부) |
| `index.ts`           | `getChildNodeMap` re-export                                           |

## Conventions

- 반환 타입: `ChildNodeMap` (`Map<string, { virtual: boolean; node: SchemaNode }>`)
- `virtual: true` — `virtualReferenceFieldsMap`에 해당 프로퍼티 키가 존재할 때만 설정
- `required` 플래그: `jsonSchema.required` 포함 여부 또는 `conditionsMap`에 조건 존재 여부로 결정
- 가상 참조 조건 추출 경로: `virtualReference.computed?.active ?? virtualReference['&active']`
- 중복 조건 제거: `unique([...conditions, ...virtualReferenceConditions])` (`@winglet/common-utils/array`)

## Boundaries

### Always do

- `jsonSchema.properties`가 없으면 즉시 빈 맵 반환
- 원본 스키마 객체 변경 금지 — `mergeShowConditions`로 새 스키마 객체 생성 후 `nodeFactory`에 전달
- 노드 생성은 반드시 주입받은 `nodeFactory`를 통해서만 수행

### Ask first

- `required` 결정 로직 변경 (현재: `required[]` 포함 여부 OR `conditions !== undefined`)
- 가상 참조 조건 우선순위 변경 (`computed.active` vs `&active`)

### Never do

- `nodeFactory` 외부에서 `SchemaNode` 직접 인스턴스화
- `virtualReferencesMap` 또는 `virtualReferenceFieldsMap` 원본 직접 수정

## Dependencies

- 내부: `../mergeShowConditions`, `../getConditionsMap`(`ConditionsMap`), `../getVirtualReferencesMap`(`VirtualReference`, `VirtualReferenceFieldsMap`, `VirtualReferencesMap`), `../../type`(`ChildNodeMap`), `@/schema-form/core/nodes/ObjectNode`(`ObjectNode`), `@/schema-form/core/nodes/type`(`HandleChange`, `SchemaNodeFactory`), `@/schema-form/types`(`ObjectSchema`, `ObjectValue`)
- 외부: `@winglet/common-utils/array`(`unique`), `@aileron/declare`(`Fn`, `Nullish`)
