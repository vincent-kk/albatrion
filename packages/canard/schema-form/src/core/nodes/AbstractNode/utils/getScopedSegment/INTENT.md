# getScopedSegment

## Purpose

노드의 scope(oneOf/anyOf/allOf/properties/items 등)와 variant 인덱스를 기반으로 JSON Schema 경로 세그먼트를 생성한다. `schemaPath` 구성에 사용되어 validator 에러의 `schemaPath` 와 노드의 `schemaPath` 를 매칭 가능하게 한다.

## Conventions

- TypeScript strict 모드를 유지합니다.
- composition scope에서는 scope 이름 뒤에 전달된 variant가 있으면 붙입니다. 객체 자식에는 properties와 이름을, 배열 자식에는 items를 이어 붙입니다. 그 밖의 부모 타입은 이름을 이어 붙입니다.
- properties scope는 이름을, items scope는 전달된 인덱스를 뒤에 붙입니다. 커스텀 scope의 variant도 전달된 경우에만 이름 앞에 포함합니다.
- scope가 비어 있으면 이름을 그대로 반환합니다. 이 규칙은 AbstractNode 생성과 경로 갱신에 동일하게 적용됩니다.

## Boundaries

### Always do

- `scope` 가 falsy 이면 `name` 그대로 반환
- `variant` 가 `undefined` 이면 인덱스 세그먼트 생략

### Ask first

- 새 scope 타입 추가 시 경로 생성 규칙 검토 (`ValidationManager.matchesSchemaPath` 와 연동)

### Never do

- `schemaPath` 를 `AbstractNode` 외부에서 직접 조작
- `$.Separator` 없이 세그먼트를 연결
