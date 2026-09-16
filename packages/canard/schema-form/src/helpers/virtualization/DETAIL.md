# virtualization

## Requirements

가상화는 노드 값이 아니라 React 하위 트리의 마운트 시점만 조율합니다.

## API Contracts

- 비활성 옵션이나 IntersectionObserver 부재는 null 매니저로 표현하여 일반 렌더링을 허용합니다.
- 노출은 단방향이며 관찰과 idle backfill 자원은 명시적으로 정리할 수 있어야 합니다.

## Acceptance Criteria

### virtualization-contract — 관찰 가능한 동작

- 이미 노출된 노드를 값 변경 때문에 placeholder로 되돌리지 않습니다.
- idle API가 없는 환경에서도 취소 가능한 macrotask 폴백을 사용할 수 있습니다.

## Last Updated

2026-09-16
