# core

## Requirements

노드의 첫 resolve 또는 reject만 결과를 확정합니다. 결과 확정과 경로 표시 상태를 구분하여 숨겨진 모달도 취소됩니다.

## API Contracts

- prompt 결과는 현재 값 그대로이며 입력 없는 확인과 returnOnCancel 취소는 undefined입니다. 일반 취소만 null입니다.
- 렌더 오류의 거부 채널은 모달 데이터와 함께 큐를 통과합니다.
- 핸들러 검증은 실제 노드의 확인·취소로 공개 Promise 결과를 확인합니다. 노드에 보관한 사용자 검증 함수를 테스트에서 직접 호출한 결과는 라이브러리 검증으로 취급하지 않습니다.

## Acceptance Criteria

### core-contract — 관찰 가능한 동작

- 경로 숨김 뒤 중단도 완료되며 렌더 실패는 해당 요청에만 오류로 전달됩니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
