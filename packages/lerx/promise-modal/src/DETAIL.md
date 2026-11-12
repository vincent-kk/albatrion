# @lerx/promise-modal

## Requirements

Promise는 최초 확인·취소 또는 렌더 오류로 한 번만 확정됩니다. 렌더 오류는 거부로 전달되며 일반 취소는 종류별 취소 값으로 완료됩니다.

## API Contracts

- alive는 저장소에 남는 생명주기, visible은 경로에 따른 표시, settled는 결과 확정을 나타냅니다. 경로 숨김은 결과를 확정하지 않습니다.
- Provider 해제는 열린 노드를 마이크로태스크 뒤 취소하며 같은 커밋의 재마운트는 입력값과 Promise를 유지합니다. DOM 없는 가져오기와 서버 렌더는 가능합니다. 서버에서는 모달 열기 함수를 호출하지 않습니다.
- 개수와 상태 구독은 Provider 밖에서도 저장소를 읽습니다. 개수 판별 함수는 읽기 전용 ModalNodeView를 받으며 refreshKey를 사용하지 않습니다.

## Acceptance Criteria

### modal-results — 모달별 완료 결과

- alert·confirm·prompt의 확인·취소 결과가 유지되고 렌더 오류는 거부됩니다.

### initialization-lifecycle — 초기화와 요청 연결

- 마운트 전 요청과 같은 커밋 재마운트는 원래 Promise와 입력값을 유지합니다.

### presentation-customization — 사용자 UI와 상태 구독

- 사용자 프레임과 Provider 밖 구독은 현재 노드 상태를 반영합니다.

## Last Updated

결과 확정, 자원 소유권 또는 표시 계약이 바뀔 때 갱신합니다.
