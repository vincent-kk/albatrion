# ComputedPropertiesManager

## Requirements

의존성 값에서 노드의 계산 속성을 재계산하며, 경로 수집과 값 배열의 인덱스를 일치시킵니다.

## API Contracts

- 생성 시 표현식과 의존성 경로를 준비하고, 갱신된 dependencies를 바탕으로 recalculate를 수행합니다.
- derived와 pristine의 정의 여부를 별도로 노출하여 값이 없거나 false인 경우와 구분합니다.

## Acceptance Criteria

### computed-properties-manager-contract — 관찰 가능한 동작

- 등록된 경로의 순서는 표현식이 읽는 dependencies 인덱스와 일치합니다.
- 계산 함수가 없는 상태 항목은 기본값을 유지하며, 파생 값은 원래 값 타입을 보존합니다.

## Last Updated

2026-09-16
