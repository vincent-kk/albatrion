# defaultValue

## Requirements

명시적 기본값, 타입별 빈 값과 객체 내부 기본값을 구분하여 산출합니다.

## API Contracts

- 명시적 기본값은 타입 기반 폴백보다 우선합니다. 객체 내부 기본값 병합은 기존 값을 덮어쓰지 않습니다.
- 산출 결과가 비어 있으면 원래 기본값의 부재 여부를 보존합니다.

## Acceptance Criteria

### default-value-contract — 관찰 가능한 동작

- 중첩 기본값 추가가 호출자에게서 받은 기존 필드 값을 대체하지 않습니다.
- 기본값 계산은 React나 DOM 상태를 요구하지 않습니다.

## Last Updated

2026-09-16
