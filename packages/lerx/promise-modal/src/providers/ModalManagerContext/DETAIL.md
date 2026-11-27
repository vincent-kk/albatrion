# ModalManagerContext

## Requirements

Context는 변하지 않는 조작 함수만 담고 별도 노드 목록을 보관하지 않습니다. 열기·순서 변경·파괴는 static 저장소에 연결합니다.

## API Contracts

전환 시간·확정 후 파괴 훅은 이 Context 안에서만 유효합니다. 밖에서는 호출 위치를 설명하는 오류를 내며, alive·settled 판정과 timer 취소·재예약 및 duration 정규화의 메모 조건은 유지합니다. node 참조는 정체성을 그대로 전달하고 별도 목록이나 사본을 만들지 않습니다.

- 기본 경로 훅에서는 요청 처리 순간의 window.location.pathname을 initiator로 사용합니다. 사용자 경로 훅은 마지막으로 반영한 pathname을 유지하여 라우터 고유 경로 계약을 보존합니다.
- closeOnEscape는 병합 전 데이터에서 모달 Esc, 모달 배경 클릭, Provider Esc, Provider 배경 클릭 순으로 첫 정의값을 선택합니다. trapFocus와 lockScroll은 일반 undefined 상속 병합을 따릅니다.

- Provider 위에 호출 데이터를 undefined를 건너뛰어 병합하고 호출 duration을 안전하게 정규화합니다. 명시적 0과 false는 상속을 덮습니다.
- 열기 핸들러는 layout effect에서 등록하고 cleanup은 자신의 핸들러만 해제합니다. 경로 효과는 저장소를 순회해 미확정 노드를 숨기거나 표시합니다.
- Provider 인스턴스의 첫 경로 효과는 살아 있고 표시 중인 노드 가운데 initiator가 자기 pathname과 다른 노드를 인스턴스 소유의 채택 경로 표에 자기 pathname으로 기록하고, 표시 여부는 채택 경로가 있으면 그 경로로, 없으면 initiator로 판단합니다. 이전 소유자의 경로는 새 소유자의 경로 훅이 보고하지 않을 수 있어, 채택하지 않으면 소유권 이전 뒤 모달이 숨겨진 채 끝나지 않습니다. 이미 경로로 숨겨진 노드는 원래 경로를 유지합니다.
- 채택 경로 표는 저장소 구독으로 확정되거나 제거된 노드의 항목을 지우며 Provider 인스턴스와 함께 사라지므로 다른 Provider로 새지 않습니다.
- 알려진 한계: 노드의 initiator는 바꾸지 않으므로 채택 뒤에도 프레임과 배경은 이전 소유자의 initiator를 받습니다. 노드 인터페이스 변경은 core/node가 소유자 확인 사항으로 정해 두었기 때문입니다.
- 렌더 오류 조작 함수는 해당 노드를 거부하고 파괴하며 Presenter는 노드를 직접 변경하지 않습니다.

## Acceptance Criteria

### modal-manager-context-contract — 관찰 가능한 동작

- 경로 숨김은 결과를 바꾸지 않고 확인·취소·렌더 오류는 저장소에 한 번만 반영됩니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
