# core

## Requirements

노드의 첫 resolve 또는 reject만 결과를 확정합니다. 결과 확정과 경로 표시 상태를 구분하여 숨겨진 모달도 취소됩니다.

## API Contracts

- 렌더 오류의 거부 채널은 모달 데이터와 함께 큐를 통과합니다.

## Acceptance Criteria

### core-contract — 관찰 가능한 동작

- 경로 숨김 뒤 중단도 완료되며 렌더 실패는 해당 요청에만 오류로 전달됩니다.

## Last Updated

결과 확정, 자원 소유권 또는 표시 계약이 바뀔 때 갱신합니다.
