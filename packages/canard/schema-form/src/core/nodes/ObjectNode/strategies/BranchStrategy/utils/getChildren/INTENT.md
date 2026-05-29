# getChildren

## Purpose

`ChildNodeMap`과 가상 참조 맵(`VirtualReferencesMap`)으로부터 `ChildNode[]` 배열을 생성한다. `propertyKeys` 순서를 보장하면서 가상 참조가 있는 프로퍼티 앞에 `VirtualNode`를 삽입한다.

## Structure

| 파일             | 역할                                                 |
| ---------------- | ---------------------------------------------------- |
| `getChildren.ts` | 핵심 구현 — `getChildren`, `getRefNodes` (내부 헬퍼) |
| `index.ts`       | `getChildren` re-export                              |

## Conventions

- `propertyKeys` 배열 순서에 따라 자식 노드 배열을 구성
- 가상 참조가 있는 프로퍼티 앞에 `VirtualNode` 삽입 (`scope: 'properties'`, `type: 'virtual'`)
- 처리된 가상 참조는 `virtualReferencesMap.delete(fieldName)`으로 즉시 제거 (중복 삽입 방지)
- `VirtualNode`의 `onChange`는 `NOOP_FUNCTION` (`@winglet/common-utils/constant`)
- `getRefNodes`: 가상 참조의 `fields`로부터 `refNodes: SchemaNode[]`와 `defaultValue: AllowedValue[]` 추출

## Boundaries

### Always do

- 가상 노드는 참조 프로퍼티 바로 앞에 삽입 (현재 순서 정책 유지)
- `virtualReferencesMap.has(fieldName)` 확인 후에만 `VirtualNode` 생성
- `virtualReferencesMap.delete(fieldName)` 호출로 처리 완료 표시

### Ask first

- 가상 노드 삽입 위치 변경 (현재 정책: 참조 필드 앞)
- `virtualReferencesMap`을 불변(immutable) 방식으로 처리하는 방식 도입

### Never do

- `propertyKeys` 순서를 무시하고 임의 순서로 자식 구성
- 동일한 가상 참조를 중복 삽입 (`delete` 없이 재처리)
- `VirtualNode`에 실제 `onChange` 핸들러 주입

## Dependencies

- 내부: `../mergeShowConditions`, `../getConditionsMap`(`ConditionsMap`), `../getVirtualReferencesMap`(`VirtualReference`, `VirtualReferenceFieldsMap`, `VirtualReferencesMap`), `../../type`(`ChildNodeMap`), `@/schema-form/core/nodes/ObjectNode`(`ObjectNode`), `@/schema-form/core/nodes/type`(`ChildNode`, `SchemaNode`, `SchemaNodeFactory`), `@/schema-form/types`(`AllowedValue`)
- 외부: `@winglet/common-utils/constant`(`NOOP_FUNCTION`), `@winglet/common-utils/filter`(`isArray`)
