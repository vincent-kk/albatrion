# afterMicrotask

## Requirements

루트 변경 콜백을 현재 실행 흐름 이후로 미뤄 React 스케줄링과의 충돌을 피합니다.

## API Contracts

- 반환된 래퍼는 호출마다 기존 예약을 취소하고 새 macrotask를 예약합니다.
- 이름과 달리 microtask가 아니라 안전한 macrotask 스케줄러를 사용합니다.

## Acceptance Criteria

### after-microtask-contract — 관찰 가능한 동작

- 동기 구간에서 연속 호출하면 취소된 예약의 핸들러는 실행되지 않습니다.
- 마지막 예약의 핸들러는 호출 스택 안에서 즉시 실행되지 않습니다.

## Last Updated

2026-09-16
