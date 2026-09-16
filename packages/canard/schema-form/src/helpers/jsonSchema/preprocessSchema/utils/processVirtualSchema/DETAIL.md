# processVirtualSchema

## Requirements

가상 필드를 요구하는 조건을 실제 구성 필드의 요구로 펼칩니다.

## API Contracts

- virtual 정의가 없거나 변환할 내용이 없으면 null입니다.
- required와 then·else 조건을 처리하며, 펼친 가상 이름은 virtualRequired로 추적하고 virtual 정의 자체는 보존합니다.

## Acceptance Criteria

### process-virtual-schema-contract — 관찰 가능한 동작

- 같은 실제 필드를 중복으로 요구 목록에 넣지 않습니다.
- 변환 결과는 입력 객체를 직접 수정하지 않으며 실제 변화가 있을 때만 반환됩니다.

## Last Updated

2026-09-16
