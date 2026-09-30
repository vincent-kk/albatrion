# getFieldConditionMap

## Requirements

조건부 스키마에서 필드가 필요한 조건과 반전 여부를 보존합니다.

## API Contracts

- 중첩 조건 평탄화는 flattenConditions에 위임하고, 같은 필드의 조건은 순서대로 누적합니다.
- true로 기록된 무조건 필수 필드는 이후 조건을 추가하지 않습니다.

## Acceptance Criteria

### get-field-condition-map-contract — 관찰 가능한 동작

- then과 else에서 유래한 조건은 inverse 정보로 구분됩니다.
- 조건이 없는 스키마에는 불필요한 조건 맵을 만들지 않습니다.

## Last Updated

2026-09-16
