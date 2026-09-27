# processVirtualSchema

## Requirements

가상 필드를 요구하는 조건을 실제 구성 필드의 요구로 펼칩니다.

## API Contracts

- virtual 정의가 없거나 required·then·else가 모두 없으면 null이며, then 또는 else가 있으면 내부 required 치환 여부와 관계없이 스키마를 반환합니다.
- required와 then·else 조건을 처리하며, 펼친 가상 이름은 virtualRequired로 추적하고 virtual 정의 자체는 보존합니다.

## Acceptance Criteria

### process-virtual-schema-contract — 관찰 가능한 동작

- 같은 실제 필드를 중복으로 요구 목록에 넣지 않습니다.
- 루트 required를 처리하면 얕은 복사본을 반환하지만, 루트 required 없이 then·else만 처리하면 입력 객체의 해당 조건 프로퍼티를 직접 교체합니다.

## Last Updated

2026-09-16
