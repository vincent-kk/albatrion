# EventCascadeManager

## Requirements

노드 이벤트를 배치하고 전달 revision을 유지하여 늦게 연결된 구독자가 놓친 전달을 감지할 수 있게 합니다.

## API Contracts

- publish는 microtask 배치에 모으고 dispatch는 동기 전달합니다. 같은 수집 구간의 이벤트는 배치를 공유합니다.
- 전달 시 리스너 존재 여부와 무관하게 타입별 revision을 증가시킵니다. cleanUp은 구독을 해제하지만 원장은 보존합니다.

## Acceptance Criteria

### event-cascade-manager-contract — 관찰 가능한 동작

- 동일 마스크의 revision은 노드 수명 동안 감소하지 않습니다.
- 반복 배치가 루프 한계를 넘으면 오류를 드러내며, 정리 후에는 보관된 구독 해제 함수가 실행됩니다.

## Last Updated

2026-09-16
