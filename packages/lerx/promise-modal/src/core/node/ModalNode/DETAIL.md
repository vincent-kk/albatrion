# ModalNode

## Requirements

settled는 최초 resolve 또는 reject에서 true가 되며 후속 결과는 무시합니다. 파괴는 미확정 노드를 먼저 취소하고 표시와 생존을 내린 뒤 변경을 알립니다.

## API Contracts

- 각 노드는 유효 closeOnEscape와 trapFocus·lockScroll 옵션을 보존하여 매니저가 전역 접근성 동작을 결정합니다.

- prompt 확인과 returnOnCancel 취소는 현재 값을 그대로 반환하고 일반 취소만 null입니다. 결과 채널은 T | undefined | null을 수용합니다.
- 확정됐거나 파괴된 노드는 다시 표시하지 않습니다. group과 subtype은 모든 종류에서 유지합니다.
- prompt의 현재 값은 노드에서 읽으므로 Provider 재마운트 뒤 화면도 입력값을 유지합니다. 일반 취소는 거부가 아닙니다.

## Acceptance Criteria

### modal-node-contract — 관찰 가능한 동작

- 파괴는 취소를 완료하고 표시·생존을 내립니다. 중복 확정과 확정 뒤 재표시는 무효입니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
