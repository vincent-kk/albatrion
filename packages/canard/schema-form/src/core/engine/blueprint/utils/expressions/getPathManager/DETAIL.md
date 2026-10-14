# Dependency path registry contract

## Requirements

표현식에서 수집한 의존성 경로의 중복을 제거하면서 최초 등록 순서를 보존한다. 컴파일러를 옮기는 과정에서 기존 경로 문법이나 해석 기준을 바꾸지 않는다.

## API Contracts

- set과 findIndex는 선두 fragment 표시를 제거한 동일한 경로를 사용한다.
- get은 수집한 배열을 제공하며, 소비자는 반환된 배열을 직접 변경하지 않는다.
- 등록하지 않은 경로의 인덱스는 -1이다. factory를 호출할 때마다 독립된 등록 목록을 새로 만든다.

## Acceptance Criteria

### get-path-manager-contract — 등록 순서와 정규화

- 정규화 후 같은 경로는 같은 인덱스를 갖는다.
- 서로 다른 경로의 등록 순서를 보존하며, 컴파일끼리 상태를 공유하지 않는다.

## Last Updated

2026-09-27
