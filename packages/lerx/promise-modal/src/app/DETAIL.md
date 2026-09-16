# app

## Requirements

모달의 전역 상태·DOM 앵커·스타일 자원을 동일한 매니저 생명주기로 관리합니다.

## API Contracts

- 마운트 전 open 요청은 모달 데이터와 dispatch를 함께 큐에 보관하고 핸들러 연결 시 처리합니다.
- reset은 초기화의 역순으로 연결과 스타일 상태를 정리하며 다음 초기화를 가능하게 합니다.

## Acceptance Criteria

### app-contract — 관찰 가능한 동작

- Provider 전에 만든 요청도 마운트 후 원래 Promise 연결로 완료됩니다.
- 초기화와 정리를 반복해도 이전 앵커나 스타일 연결이 다음 사용에 남지 않습니다.

## Last Updated

2026-09-16
