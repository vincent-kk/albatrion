# handle

## Requirements

내부 요청 핸들과 공개 Promise API를 분리하면서 마운트 전 요청을 지원합니다.

## API Contracts

- 내부 핸들은 modalNode의 live getter, promiseHandler와 큐 취소 수단을 제공합니다.
- 공개 static 래퍼는 promiseHandler만 반환하며 완료 연결은 큐에 보관된 모달 데이터로 전달합니다.

## Acceptance Criteria

### handle-contract — 관찰 가능한 동작

- 마운트 전 undefined였던 modalNode는 큐 처리 후 실제 노드 참조를 제공합니다.
- 요청이 큐에 머물렀더라도 호출자에게 반환한 Promise가 해당 모달 결과로 완료됩니다.

## Last Updated

2026-09-16
