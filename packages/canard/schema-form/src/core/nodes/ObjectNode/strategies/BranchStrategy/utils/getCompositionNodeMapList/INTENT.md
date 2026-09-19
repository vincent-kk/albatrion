# getCompositionNodeMapList

## Purpose

`oneOf`/`anyOf` 각 분기 스키마에서 자식 노드 맵 배열(`ChildNodeMap[]`)을 생성한다. 분기 간 프로퍼티 중복, 타입 재정의, 배타성 위반을 검증하여 오류를 던진다.

## Conventions

- 반환 타입: `ChildNodeMap[] | undefined`
- `oneOf`의 경우 분기 간 프로퍼티 중복 금지 (`COMPOSITION_PROPERTY_EXCLUSIVENESS_REDEFINITION`)
- `anyOf`의 경우 분기 간 중복 금지 + 기본 `properties`와의 중복 금지 (`COMPOSITION_PROPERTY_REDEFINITION`)
- 분기는 `type`을 생략하거나 부모와 같은 타입을 선언한다. nullable 부모에서는 `object` 또는 `null`로 좁힐 수 있다. 부모를 넓히거나 다른 타입을 선언하면 `COMPOSITION_TYPE_REDEFINITION` 오류
- `type`이 `null`인 분기는 검증 전용 — 자식 노드를 만들지 않고, 무시되는 조건·`properties`가 있으면 dev 경고(`NULL_BRANCH_IGNORED_FOR_FORM`)
- `oneOf`/`anyOf`는 `type`과 동일 위계에서만 동작 — 분기 스키마 직속의 중첩 `oneOf`/`anyOf`는 필드로 확장하지 않고 무시하되, `warnDevelopmentIssue`로 dev 경고(`NESTED_COMPOSITION_IGNORED_FOR_FORM`, 프로덕션 무음)를 방출

## Boundaries

### Always do

- 프로퍼티 충돌 시 `JSONSchemaError` 던지기
- `keySetList`로 허용 키 필터링
- `excludeKeySet`으로 반대 합성 타입 키 제외

### Ask first

- 분기 간 프로퍼티 중복 허용 정책 변경

### Never do

- 검증 없이 중복 프로퍼티를 허용
- `childNodeMap`(기본 프로퍼티 맵)을 직접 수정
