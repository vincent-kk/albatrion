# ComputedPropertiesManager

## Requirements

의존성 값에서 노드의 계산 속성을 재계산하며, 경로 수집과 값 배열의 인덱스를 일치시킵니다.

## API Contracts

- 생성 시 표현식과 의존성 경로를 준비하고, 갱신된 dependencies를 바탕으로 recalculate를 수행합니다.
- derived와 pristine의 정의 여부를 별도로 노출하여 값이 없거나 false인 경우와 구분합니다.
- `ComputedProperties` 계약과 computed 필드 어휘는 같은 공개 경계를 통해 소비합니다. 실제 매니저 생성 판단과 매니저가 읽는 어휘가 같은 정의를 공유해야 하며, 사본이 어긋나면 계산이 필요한 노드가 sentinel을 공유해 재계산하지 못합니다.

## Acceptance Criteria

### computed-properties-manager-contract — 관찰 가능한 동작

- 등록된 경로의 순서는 표현식이 읽는 dependencies 인덱스와 일치합니다.
- 계산 함수가 없는 상태 항목은 기본값을 유지하며, 파생 값은 원래 값 타입을 보존합니다.

## History

- 2026-09-21 — 실제 매니저 생성 판단과 매니저가 읽는 computed 필드 어휘를 같은 공개 경계에서 전달하기로 했습니다. 별도 사본은 sentinel 선택과 재계산의 판단을 어긋나게 하고, 내부 유틸리티 직접 참조는 이 fractal의 경계를 침범하기 때문입니다.

## Last Updated

2026-09-27
