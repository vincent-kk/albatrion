# Dependency path registry contract

## Requirements

표현식 등록에서는 fragment 접두사만 제거하고 절대 루트의 슬래시를 유지합니다. 빈 문자열로 정규화하면 상대 현재 위치와 구별할 수 없어 정착 중 투영을 읽는 순서가 바뀌므로 stripFragment의 normalizeRoot=false 모드를 사용합니다.

- fragment 정규화는 jsonPointer의 stripFragment에 위임하며 최초 등록 순서를 보존한다.

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

2026-10-28
