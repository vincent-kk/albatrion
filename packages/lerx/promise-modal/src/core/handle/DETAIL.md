# handle

## Requirements

반환 핸들의 modalNode는 큐 처리 뒤 실제 노드를 읽는 getter입니다. resolve와 reject 배선은 모달 데이터에 실어 큐를 통과합니다.

## API Contracts

컴포넌트 소유 요청 훅은 미확정 handle만 보관하고 결과 확정 때 즉시 해제합니다. 소유자 unmount는 실제 노드를 취소하거나 마운트 전 큐 항목을 취소하여 미완료 Promise가 남지 않게 합니다. 요청 함수와 훅은 노드·매니저 계약만 소비하고 렌더 컴포넌트나 Context는 가져오지 않습니다.

공개 진입점은 이름과 시그니처를 유지하며 구현은 내부 역할 구획이 소유합니다. 이 배치는 구현 파일의 위치가 독립 공개 계약으로 오해되는 것을 막고, 소비자는 기존 진입점을 계속 사용합니다.

- 공개 호출은 closeOnEscape·trapFocus·lockScroll을 받아 Provider 기본값을 모달별로 재정의합니다.

- prompt 반환 타입은 Promise<T | undefined | null>이며 확인과 returnOnCancel 취소는 값을 변환하지 않습니다. 렌더 전 returnOnCancel 취소는 defaultValue이고 일반 취소는 null입니다.
- 호출 duration은 숫자 밀리초 또는 ms·s 문자열을 받으며 undefined는 상속합니다. AbortSignal은 거부가 아닌 취소로 처리합니다.
- 확정은 한 번만 유효하며 확인·취소·거부 시 AbortSignal 리스너를 정리합니다. 경로로 숨겨져도 중단은 취소 값으로 완료됩니다.

## Acceptance Criteria

### handle-contract — 관찰 가능한 동작

- 큐 처리와 오류 뒤에도 최초 반환한 Promise가 정확히 한 번 완료되며 중단 리스너가 남지 않습니다.

### request-retention — 소유자 요청 수명

- 확정된 handle을 즉시 해제하고 unmount는 남은 요청만 취소합니다. 마운트 전 큐의 live getter와 최초 결과 확정 의미를 유지합니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
