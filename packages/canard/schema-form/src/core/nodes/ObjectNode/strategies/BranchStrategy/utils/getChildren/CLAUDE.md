# getChildren

## Purpose
`ChildNodeMap`과 가상 참조 맵으로부터 `ChildNode[]` 배열을 생성한다. 가상 노드(`VirtualNode`)를 적절한 위치에 삽입하여 프로퍼티 순서를 보장한다.

## Structure
- `getChildren.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- `propertyKeys` 순서에 따라 자식 노드 배열 구성
- 가상 참조가 있는 프로퍼티 앞에 `VirtualNode` 삽입
- 한 번 처리된 가상 참조는 `virtualReferencesMap`에서 삭제 (중복 방지)
- `NOOP_FUNCTION`을 VirtualNode의 `onChange`로 사용

## Boundaries

### Always do
- 가상 노드는 참조 필드 바로 앞에 삽입
- `virtualReferencesMap.delete(fieldName)`으로 처리 완료 표시
- `refNodes`와 `defaultValue`는 `getRefNodes` 내부 함수로 추출

### Ask first
- 가상 노드 삽입 위치 변경 (현재 참조 필드 앞)
- `virtualReferencesMap` 변경 없는(immutable) 처리 방식 도입

### Never do
- `propertyKeys` 순서를 무시하고 임의 순서로 자식 구성
- 동일한 가상 참조를 중복 삽입

## Dependencies
- `getVirtualReferencesMap` 타입 — `VirtualReferencesMap`, `VirtualReferenceFieldsMap`
- `mergeShowConditions` — 조건 병합
- `SchemaNodeFactory`, `ChildNode` — `core/nodes/type`
- `NOOP_FUNCTION` — `@winglet/common-utils/constant`
