# Dependency path registry contract

## Requirements

표현식 등록에서 `/`와 `#/`는 빈 이름 자식이고 `#`는 절대 루트입니다. 상대 빈 문자열과 절대 루트를 구별해야 하므로 stripFragment의 preserveAbsoluteRoot 모드로 단독 `#`를 보존하고 다른 선행 fragment 표시만 제거합니다. 이 소유자 결정은 값 조회 순서나 최초 등록 순서를 바꾸지 않습니다.

- fragment 정규화는 jsonPointer의 stripFragment에 위임하며 최초 등록 순서를 보존한다.

표현식에서 수집한 의존성 경로의 중복을 제거하면서 최초 등록 순서를 보존한다. 컴파일러를 옮기는 과정에서 기존 경로 문법이나 해석 기준을 바꾸지 않는다.

## API Contracts

- set과 findIndex는 단독 절대 루트 표시를 보존하고 다른 선두 fragment를 제거한 동일한 경로를 사용한다.
- get은 수집한 배열을 제공하며, 소비자는 반환된 배열을 직접 변경하지 않는다.
- 등록하지 않은 경로의 인덱스는 -1이다. factory를 호출할 때마다 독립된 등록 목록을 새로 만든다.

## Acceptance Criteria

### get-path-manager-contract — 등록 순서와 정규화

- 정규화 후 같은 경로는 같은 인덱스를 갖는다.
- 서로 다른 경로의 등록 순서를 보존하며, 컴파일끼리 상태를 공유하지 않는다.

## Last Updated

2026-10-28
