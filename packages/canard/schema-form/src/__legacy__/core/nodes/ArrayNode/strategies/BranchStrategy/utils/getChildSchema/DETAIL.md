# getChildSchema

## Requirements

배열 인덱스에 적용할 스키마를 입력 변경 없이 선택합니다.

## API Contracts

- prefixItems 범위 안에서는 해당 항목을 사용하고, 범위를 벗어나면 items로 폴백합니다.
- 적용 가능한 스키마가 없으면 null을 반환하여 호출자가 자식 생성을 중단할 수 있게 합니다.

## Acceptance Criteria

### get-child-schema-contract — 관찰 가능한 동작

- prefixItems가 없으면 items 선택이 모든 인덱스에 동일하게 적용됩니다.
- 선택 과정은 스키마 객체에 속성을 추가하거나 원본을 수정하지 않습니다.

## Last Updated

2026-09-16
