# bootstrap

## Requirements

공개 ModalProvider는 내부 BootstrapProvider를 연결합니다. 포털은 소유자만 렌더하고 초기화와 해제는 매니저를 거칩니다.

## API Contracts

- root가 undefined이면 document.body, 요소이면 그 요소, null이면 대기합니다. ref의 존재는 자동 초기화를 막지 않으며 initialize는 유효 root를 정합니다.
- StrictMode와 같은 커밋 재마운트는 열린 Promise를 취소하지 않습니다.

## Acceptance Criteria

### bootstrap-contract — 관찰 가능한 동작

- 일반 마운트와 StrictMode 마운트가 같은 요청 결과를 유지합니다.

## Last Updated

공개 결과·설정·초기화 또는 표시 계약이 바뀔 때 갱신합니다.
