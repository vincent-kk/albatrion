# defaultValue

## Requirements

명시적 기본값, 타입별 빈 값과 객체 내부 기본값을 구분하여 산출합니다.

## API Contracts

- 명시적 기본값은 타입 기반 폴백보다 우선합니다. 객체 내부 기본값 병합은 최종 경로의 기존 값을 보존하지만 중간 null은 필요한 컨테이너로 교체할 수 있습니다.
- 산출 결과가 비어 있으면 원래 기본값의 부재 여부를 보존합니다.

## Acceptance Criteria

### default-value-contract — 관찰 가능한 동작

- 객체 기본값 수집은 호출자가 준 객체를 제자리에서 보강하며, 하위 경로를 만들 때 중간 null을 객체나 배열로 대체할 수 있습니다.
- 기본값 계산은 React나 DOM 상태를 요구하지 않습니다.

## Last Updated

2026-09-16
