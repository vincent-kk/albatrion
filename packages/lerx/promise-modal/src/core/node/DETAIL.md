# node

## Requirements

모달 타입을 대응하는 노드 구현에 연결하는 생성 경계입니다.

## API Contracts

- 팩토리는 알려진 모달 타입별 구현을 선택하며 알 수 없는 타입은 오류로 드러냅니다.
- 생성된 노드는 공통 구독·완료·정리 계약을 따릅니다.

## Acceptance Criteria

### node-contract — 관찰 가능한 동작

- 알 수 없는 타입을 임의의 기본 모달로 대체하지 않습니다.
- 노드 생성 자체가 DOM을 조작하거나 React 컴포넌트를 렌더하지 않습니다.

## Last Updated

2026-09-16
