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
- `oneOf`/`anyOf`는 `type`과 동일 위계에서만 동작 — 분기 스키마 직속의 중첩 `oneOf`/`anyOf`는 필드로 확장하지 않고 무시하되, `warnDevelopmentIssue`로 dev 경고(`NESTED_COMPOSITION_IGNORED_FOR_FORM`, 프로덕션 무음)를 방출

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

- 내부: `@/schema-form/core/nodes/ObjectNode`(`ObjectNode`), `@/schema-form/core/nodes/type`(`SchemaNodeFactory`, `HandleChange`), `@/schema-form/errors`(`JsonSchemaError`), `@/schema-form/helpers/error`(`formatCompositionPropertyExclusivenessError`, `formatCompositionPropertyRedefinitionError`, `formatCompositionTypeRedefinitionError`, `formatNestedCompositionIgnoredWarning`), `@/schema-form/helpers/warning`(`warnDevelopmentIssue`), `@/schema-form/types`(`JsonSchema`, `ObjectSchema`, `ObjectValue`), `../../type`(`ChildNodeMap`)
- 외부: `@winglet/common-utils/filter`(`isArray`, `isPlainObject`), `@winglet/json-schema/filter`(`isIdenticalSchemaType`), `@aileron/declare`(`Fn`, `Nullish`)
