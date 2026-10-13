# Dependency path registry contract

## Requirements

표현식에서 수집한 의존성 경로의 중복을 제거하면서 최초 등록 순서를 보존합니다. 컴파일러 이동 과정에서 기존 경로 문법이나 해석 기준을 바꾸지 않습니다.

## API Contracts

- set과 findIndex는 선두 fragment 표시를 제거한 동일한 경로를 사용합니다.
- get은 수집한 배열을 제공하며 소비자는 반환 배열을 직접 변경하지 않습니다.
- 등록하지 않은 경로의 인덱스는 -1입니다. 각 factory 호출은 독립된 등록 목록을 만듭니다.

## Acceptance Criteria

### get-path-manager-contract — 등록 순서와 정규화

- 정규화 후 같은 경로는 같은 인덱스를 갖습니다.
- 서로 다른 경로의 등록 순서를 보존하며 컴파일 간 상태를 공유하지 않습니다.

## Last Updated

2026-09-27
