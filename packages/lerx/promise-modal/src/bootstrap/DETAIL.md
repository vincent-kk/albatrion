# bootstrap

## Requirements

공개 ModalProvider는 내부 BootstrapProvider를 연결합니다. 포털은 소유자만 렌더하고 초기화와 해제는 매니저를 거칩니다.

## API Contracts

- StrictMode와 같은 커밋 재마운트는 열린 Promise를 취소하지 않습니다.

## Acceptance Criteria

### bootstrap-contract — 관찰 가능한 동작

- 일반 마운트와 StrictMode 마운트가 같은 요청 결과를 유지합니다.

## Last Updated

결과 확정, 자원 소유권 또는 표시 계약이 바뀔 때 갱신합니다.
