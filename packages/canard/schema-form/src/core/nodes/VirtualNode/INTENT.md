# VirtualNode

## Purpose

스키마에 직접 정의되지 않은 가상 필드 노드. 여러 실제 노드에 대한 참조를 집합하여 복합 폼 필드(다중 값 제어)를 구현한다.

## Structure

| 파일             | 역할                                                                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `VirtualNode.ts` | 메인 클래스 — `AbstractNode<VirtualSchema, VirtualNodeValue>` 상속; `__refNodes__`, `__children__`, `__emitChange__` 핵심 구현 |
| `filter.ts`      | `isVirtualNode(input)` 타입 가드 — `input.type === 'virtual'` 체크                                                             |
| `index.ts`       | barrel re-export                                                                                                               |

## Conventions

- `type = 'virtual'`로 고정; JSON Schema 실제 타입과 구분됨
- `__value__`는 `refNodes` 배열과 1:1 대응하는 `VirtualNodeValue` 배열로 유지
- `setValue(values)` 호출 시 `values.length !== refNodes.length`이면 `JsonSchemaError('INVALID_VIRTUAL_NODE_VALUES')` 즉시 throw
- 각 `refNode`의 `UpdateValue` 이벤트 구독을 `saveUnsubscribe(node.subscribe(...))` 패턴으로 등록 — 노드 정리 시 자동 해제
- `children` getter는 `map(refNodes, node => ({ node }))` 결과를 반환; `__children__`은 생성자에서 단 1회 확정
- `__initialize__()` 는 생성자 마지막에 호출 (Domain-First 멤버 순서 준수)

## Boundaries

### Always do

- `setValue` 시 값 배열 길이와 참조 노드 수 일치 확인
- 불일치 시 `JsonSchemaError('INVALID_VIRTUAL_NODE_VALUES')` 던지기
- 참조 노드 구독은 `saveUnsubscribe`로 등록

### Ask first

- 참조 노드 없이 독립적인 값 저장 허용 (설계 변경)
- `children` 반환값 변경

### Never do

- `refNodes`를 생성자 외부에서 변경
- 길이 불일치 상태의 값 배열을 `__value__`에 저장
- `VirtualNode`를 JSON Schema의 실제 타입(`string`, `object` 등)으로 사용

## Dependencies

- 내부: `../AbstractNode`(`AbstractNode`, `saveUnsubscribe`, `publish`, `__initialize__`), `@/schema-form/errors`(`JsonSchemaError`), `@/schema-form/helpers/error`(`formatInvalidVirtualNodeValuesError`), `../type`(`NodeEventType`, `SetValueOption`, `ChildNode`, `SchemaNode`, `UnionSetValueOption`, `VirtualNodeConstructorProps`)
- 외부: `@/schema-form/types`(`VirtualSchema`, `VirtualNodeValue`), `@winglet/common-utils/array`(`map`)
