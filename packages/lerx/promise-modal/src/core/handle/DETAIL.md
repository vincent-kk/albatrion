# handle

## Requirements

반환 핸들의 modalNode는 큐 처리 뒤 실제 노드를 읽는 getter입니다. resolve와 reject 배선은 모달 데이터에 실어 큐를 통과합니다.

## API Contracts

- 공개 호출은 closeOnEscape·trapFocus·lockScroll을 받아 Provider 기본값을 모달별로 재정의합니다.

- prompt 반환 타입은 Promise<T | undefined | null>이며 확인과 returnOnCancel 취소는 값을 변환하지 않습니다. 렌더 전 returnOnCancel 취소는 defaultValue이고 일반 취소는 null입니다.
- 호출 duration은 숫자 밀리초 또는 ms·s 문자열을 받으며 undefined는 상속합니다. AbortSignal은 거부가 아닌 취소로 처리합니다.
- 확정은 한 번만 유효하며 확인·취소·거부 시 AbortSignal 리스너를 정리합니다. 경로로 숨겨져도 중단은 취소 값으로 완료됩니다.

## Acceptance Criteria

### handle-contract — 관찰 가능한 동작

- 큐 처리와 오류 뒤에도 최초 반환한 Promise가 정확히 한 번 완료되며 중단 리스너가 남지 않습니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
