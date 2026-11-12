# ModalNode

## Requirements

settled는 최초 resolve 또는 reject에서 true가 되며 후속 결과는 무시합니다. 파괴는 미확정 노드를 먼저 취소하고 표시와 생존을 내린 뒤 변경을 알립니다.

## API Contracts

- 확정됐거나 파괴된 노드는 다시 표시하지 않습니다. group과 subtype은 모든 종류에서 유지합니다.
- prompt의 현재 값은 노드에서 읽으므로 Provider 재마운트 뒤 화면도 입력값을 유지합니다. 일반 취소는 거부가 아닙니다.

## Acceptance Criteria

### modal-node-contract — 관찰 가능한 동작

- 파괴는 취소를 완료하고 표시·생존을 내립니다. 중복 확정과 확정 뒤 재표시는 무효입니다.

## Last Updated

결과 확정, 자원 소유권 또는 표시 계약이 바뀔 때 갱신합니다.
