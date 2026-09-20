# getCompositionNodeMapList

## Requirements

조합 분기의 자식 맵을 만들 때 타입과 필드 소유권 충돌을 드러냅니다.

## API Contracts

- 자식 맵은 공통 `ChildNode` 계약으로 표현하며 소비자인 BranchStrategy의 타입 별칭에 의존하지 않습니다.
- 허용 키와 제외 키를 반영해 노드를 만들며 기본 자식 맵을 직접 변경하지 않습니다.
- 분기의 `type`은 생략하거나, 부모와 같은 타입이거나, nullable 부모의 `object`·`null` 중 하나여야 합니다. 그 밖의 타입과 허용되지 않는 프로퍼티 충돌은 JSONSchemaError로 전달합니다. 직접 중첩된 조합은 필드로 확장하지 않습니다.

## Acceptance Criteria

### get-composition-node-map-list-contract — 관찰 가능한 동작

- 각 결과 맵은 원래 조합 분기와 대응합니다.
- properties가 없는 분기는 빈 맵에 대응하며, 결과 배열에는 빈 자리가 없습니다.
- `type`이 `null`인 분기는 검증 전용입니다. `properties`가 있어도 자식 노드를 만들지 않고 빈 맵에 대응하며, 무시되는 조건이나 `properties`가 있으면 개발 환경에서 `NULL_BRANCH_IGNORED_FOR_FORM` 진단을 제공합니다.
- nullable 부모의 `oneOf`에서 `null`을 받아들이는 분기가 정확히 하나가 아니면 어떤 검증기도 `null`을 통과시키지 않으므로, 개발 환경에서 `NULLABLE_ONE_OF_NULL_UNREACHABLE` 진단을 제공합니다. `type`을 생략한 분기는 `null`을 받아들이는 분기로 세고, 분기 자체의 `const`·`enum`이 `null`을 배제하면 세지 않습니다. `$ref` 분기가 있으면 판단하지 않습니다. `type`·`const`·`enum`으로는 `null`을 배제하지 않는 분기가 `not`·`allOf`·`anyOf`·`oneOf`·`if`를 가지면 그 분기가 `null`을 받아들이는지 셀 수 없으므로 역시 판단하지 않습니다; 이미 `null`을 배제한 분기는 이런 키워드가 있어도 받아들이지 않는 분기로 셉니다. `anyOf`와 nullable이 아닌 부모는 대상이 아닙니다.
- nullable이 아닌 부모에서 `null`을 선언한 분기, 그리고 `string`·`array` 같은 다른 타입을 선언한 분기는 거부됩니다.
- 중첩 조합을 무시하는 경우 개발 환경에서 진단을 제공하며 프로덕션에서는 같은 경고를 출력하지 않습니다.

## Last Updated

2026-09-20
