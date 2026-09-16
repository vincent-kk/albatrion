# Presenter

## Requirements

각 모달 노드의 상태를 표시하고 렌더링 생명주기와 구독을 연결합니다.

## API Contracts

- Presenter는 배경과 전경을 조합하고 구독으로 노드 변경을 반영합니다.
- 모달 닫힘과 언마운트에 맞춰 구독 및 표시 자원을 정리합니다.

## Acceptance Criteria

### presenter-contract — 관찰 가능한 동작

- 하나의 노드에 연결된 Presenter가 다른 노드의 내부 상태를 직접 변경하지 않습니다.
- Presenter 제거 후 해당 인스턴스의 구독이 남아 리렌더를 요청하지 않습니다.

## Last Updated

2026-09-16
