# getCloneDepth

## Requirements

allOf 병합을 위한 복제 깊이를 스키마 종류에 맞춰 제공합니다.

## API Contracts

- 객체 스키마에는 3, 배열에는 2, 그 밖에는 1을 반환합니다.
- 함수는 깊이만 계산하며 복제와 병합은 호출자가 수행합니다.

## Acceptance Criteria

### get-clone-depth-contract — 관찰 가능한 동작

- 반환값은 항상 1·2·3 중 하나입니다.
- 깊이 계산 때문에 스키마 내용이나 참조가 변경되지 않습니다.

## Last Updated

2026-09-16
