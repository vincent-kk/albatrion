# ModalManagerContext

## Requirements

매니저의 열기 요청과 React 모달 목록을 연결합니다.

## API Contracts

- openHandler를 연결하여 요청을 Context 상태에 반영하고 소비자에게 관리 인터페이스를 제공합니다.
- 열기·닫기·갱신은 상태 갱신 경로를 통해 React 렌더에 반영됩니다.

## Acceptance Criteria

### modal-manager-context-contract — 관찰 가능한 동작

- 매니저로 들어온 요청이 별도 목록에 고립되지 않고 현재 Context의 모달로 표시됩니다.
- 소비자가 Context 외부에서 목록을 직접 수정하여 매니저 상태와 어긋나게 하지 않습니다.

## Last Updated

2026-09-16
