# getComputedPropertiesManager

## Requirements

호출자는 실제 computed 매니저와 공유 sentinel의 선택을 공통 인터페이스로 소비합니다.

## API Contracts

- computed surface가 있으면 실제 매니저를 만들고, 없으면 frozen sentinel을 반환합니다.
- 선택은 값의 truthiness가 아니라 필드 존재 여부를 기준으로 하며, 불확실하면 실제 매니저를 선택합니다.

## Acceptance Criteria

### get-computed-properties-manager-contract — 관찰 가능한 동작

- false로 명시한 computed 설정도 실제 매니저 경로를 거칩니다.
- sentinel을 받은 노드 간에 변경 가능한 노드별 상태를 공유하지 않습니다.

## Last Updated

2026-09-16
