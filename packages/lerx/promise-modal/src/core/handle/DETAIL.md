# handle

## Requirements

반환 핸들의 modalNode는 큐 처리 뒤 실제 노드를 읽는 getter입니다. resolve와 reject 배선은 모달 데이터에 실어 큐를 통과합니다.

## API Contracts

- 확정은 한 번만 유효하며 확인·취소·거부 시 AbortSignal 리스너를 정리합니다. 경로로 숨겨져도 중단은 취소 값으로 완료됩니다.

## Acceptance Criteria

### handle-contract — 관찰 가능한 동작

- 큐 처리와 오류 뒤에도 최초 반환한 Promise가 정확히 한 번 완료되며 중단 리스너가 남지 않습니다.

## Last Updated

결과 확정, 자원 소유권 또는 표시 계약이 바뀔 때 갱신합니다.
