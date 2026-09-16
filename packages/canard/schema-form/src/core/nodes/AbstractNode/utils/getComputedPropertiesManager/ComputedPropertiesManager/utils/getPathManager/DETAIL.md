# getPathManager

## Requirements

의존성 경로의 중복을 제거하면서 최초 등록 순서를 보존합니다.

## API Contracts

- set과 findIndex는 선두 fragment 표시를 제거한 동일한 경로 표현을 사용합니다.
- get은 수집된 배열을 제공하며 호출자는 이를 직접 변경하지 않습니다.

## Acceptance Criteria

### get-path-manager-contract — 관찰 가능한 동작

- 같은 정규화 경로를 반복 등록해도 항목과 인덱스가 늘어나지 않습니다.
- 등록하지 않은 경로의 findIndex는 -1이며, 서로 다른 경로의 등록 순서는 유지됩니다.

## Last Updated

2026-09-16
