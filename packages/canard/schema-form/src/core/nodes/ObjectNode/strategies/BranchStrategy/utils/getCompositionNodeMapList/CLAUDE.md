# getCompositionNodeMapList

## Purpose
`oneOf`/`anyOf` 각 분기 스키마에서 자식 노드 맵 배열(`ChildNodeMap[]`)을 생성한다. 분기 간 프로퍼티 중복, 타입 재정의, 배타성 위반을 검증하여 오류를 던진다.

## Structure
- `getCompositionNodeMapList.ts` — 핵심 구현
- `index.ts` — re-export

## Conventions
- 반환 타입: `ChildNodeMap[] | undefined`
- `oneOf`의 경우 분기 간 프로퍼티 중복 금지 (`COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION`)
- `anyOf`의 경우 분기 간 중복 금지 + 기본 `properties`와의 중복 금지 (`COMPOSITION_PROPERTY_REDEFINITION`)
- 분기 스키마 타입이 부모와 다르면 `COMPOSITION_TYPE_REDEFINITION` 오류

## Boundaries

### Always do
- 프로퍼티 충돌 시 `JsonSchemaError` 던지기
- `keySetList`로 허용 키 필터링
- `excludeKeySet`으로 반대 합성 타입 키 제외

### Ask first
- 분기 간 프로퍼티 중복 허용 정책 변경

### Never do
- 검증 없이 중복 프로퍼티를 허용
- `childNodeMap`(기본 프로퍼티 맵)을 직접 수정

## Dependencies
- `SchemaNodeFactory`, `HandleChange` — `core/nodes/type`
- `JsonSchemaError` — 유효성 오류
- `@winglet/common-utils/filter` (`isArray`, `isPlainObject`)
- `@winglet/json-schema/filter` (`isIdenticalSchemaType`)
