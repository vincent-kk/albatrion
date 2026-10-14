# promiseAfterMicrotask

## Requirements

공개 배열 조작 결과를 현재 실행 흐름 이후의 Promise로 전달합니다.

## API Contracts

- 전달한 값과 제네릭 값 타입을 그대로 보존합니다.
- 이름과 달리 macrotask 스케줄러를 사용하며 값을 즉시 resolve하지 않습니다.

## Acceptance Criteria

### promise-after-microtask-contract — 관찰 가능한 동작

- await로 얻는 결과는 입력값과 동일합니다.
- 호출 직후 같은 동기 스택에서 완료 콜백이 실행되지 않습니다.

## Last Updated

2026-09-16
