# ModalNode

## Requirements

모달 종류별 확인·취소 결과를 공통 상태 및 구독 생명주기에 연결합니다.

## API Contracts

- alert는 닫기 시 void, confirm은 확인 시 true와 취소 시 false로 완료합니다.
- prompt는 확인 시 입력값, 취소 시 null로 완료하며 returnOnCancel이 켜져 있으면 취소 시 현재 입력값을 반환합니다.
- subscribe는 listener를 제거하는 cleanup 함수를 반환합니다. onDestroy는 alive 상태를 내리고 manualDestroy일 때 변경을 알리지만 listener 집합을 직접 비우지 않습니다.

## Acceptance Criteria

### modal-node-contract — 관찰 가능한 동작

- 일반 취소를 Promise rejection으로 표현하지 않습니다.
- 소비자는 구독 시 받은 cleanup을 실행해 listener를 해제하며, UI는 노드 외부에서 Promise를 직접 완료하지 않습니다.

## Last Updated

2026-09-16 — destroy와 구독 cleanup의 책임을 현재 생명주기에 맞춤.
