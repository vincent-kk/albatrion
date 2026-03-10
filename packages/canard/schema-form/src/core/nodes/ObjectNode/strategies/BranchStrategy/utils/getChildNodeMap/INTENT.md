# getChildNodeMap

## Purpose
객체 스키마의 `properties`로부터 자식 노드 맵(`ChildNodeMap`)을 생성한다. 각 프로퍼티에 조건 표현식과 가상 참조 조건을 병합하여 노드를 생성한다.

## Structure
- `getChildNodeMap.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 반환 타입: `ChildNodeMap` (`Map<string, { virtual: boolean; node: SchemaNode }>`)
- 가상 참조 필드가 있으면 `virtual: true`로 표시
- `mergeShowConditions`로 조건 표현식을 스키마에 병합
- `conditionsMap`과 `virtualReferenceConditions`를 `unique`로 중복 없이 합산

## Boundaries

### Always do
- `properties`가 없으면 빈 맵 반환
- `required` 배열 또는 `conditions` 존재 여부로 `required` 플래그 설정
- 가상 참조 조건은 `virtualReferencesMap`에서 `computed.active` 또는 `&active` 추출

### Ask first
- `required` 결정 로직 변경
- 가상 참조 조건 우선순위 변경

### Never do
- 원본 스키마 객체 변경 (`mergeShowConditions`로 새 객체 생성)
- `nodeFactory` 외부에서 노드를 직접 생성

## Dependencies
- `mergeShowConditions` — 조건 병합
- `getVirtualReferencesMap` 타입 — `VirtualReferencesMap`, `VirtualReferenceFieldsMap`
- `SchemaNodeFactory`, `HandleChange` — `core/nodes/type`
