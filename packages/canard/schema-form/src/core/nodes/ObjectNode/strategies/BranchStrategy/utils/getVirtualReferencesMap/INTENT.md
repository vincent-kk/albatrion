# getVirtualReferencesMap

## Purpose
스키마의 `virtual` 정의에서 가상 참조 맵과 역방향 맵을 생성한다. 가상 노드가 참조하는 프로퍼티 목록을 검증하고 인덱싱한다.

## Structure
- `getVirtualReferencesMap.ts` — 핵심 구현
- `index.ts` — re-export
- `type.ts` — `VirtualReference`, `VirtualReferencesMap`, `VirtualReferenceFieldsMap` 타입

## Conventions
- `virtualReferencesMap`: `Map<virtualKey, VirtualReference>`
- `virtualReferenceFieldsMap`: `Map<propertyKey, virtualKey[]>` (역방향 인덱스)
- `fields` 배열이 없으면 `VIRTUAL_FIELDS_NOT_VALID` 오류
- `fields` 중 `properties`에 없는 키가 있으면 `VIRTUAL_FIELDS_NOT_IN_PROPERTIES` 오류

## Boundaries

### Always do
- `fields`가 배열인지 검증
- 모든 `fields` 항목이 `propertyKeys`에 존재하는지 확인
- 유효성 오류 시 `JsonSchemaError` 던지기

### Ask first
- 가상 참조가 `properties` 외부 경로를 참조하는 것 허용

### Never do
- `virtualReferences`가 `undefined`일 때 오류 발생 (빈 객체 반환)
- 반환된 맵을 caller에서 직접 수정 (`getChildren`은 삭제 연산 수행하므로 주의)

## Dependencies
- `JsonSchemaError` — 유효성 오류
- `@winglet/common-utils/filter` (`isArray`)
- `@aileron/declare` (`Dictionary`)
