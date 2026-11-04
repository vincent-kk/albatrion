# sharedComputedSentinel

## Requirements

계산 속성이 없는 노드에만 변경 불가능한 공통 기본 상태를 제공합니다.

## API Contracts

- recalculate는 아무 변경도 하지 않고 derived와 pristine 조회는 undefined를 반환합니다.
- 인스턴스와 공유 배열을 모두 freeze하며 노드별 값을 저장하지 않습니다.

## Acceptance Criteria

### shared-computed-sentinel-contract — 관찰 가능한 동작

- 여러 노드가 같은 sentinel을 사용해도 한 노드의 처리로 다른 노드 상태가 바뀌지 않습니다.
- 계산 필드가 필요한 노드에는 sentinel을 할당하지 않습니다.

## Last Updated

2026-09-16
