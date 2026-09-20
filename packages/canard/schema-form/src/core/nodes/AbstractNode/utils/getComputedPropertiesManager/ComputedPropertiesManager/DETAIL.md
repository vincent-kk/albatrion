# ComputedPropertiesManager

## Requirements

의존성 값에서 노드의 계산 속성을 재계산하며, 경로 수집과 값 배열의 인덱스를 일치시킵니다.

## API Contracts

- 생성 시 표현식과 의존성 경로를 준비하고, 갱신된 dependencies를 바탕으로 recalculate를 수행합니다.
- derived와 pristine의 정의 여부를 별도로 노출하여 값이 없거나 false인 경우와 구분합니다.
- entry point는 `ComputedProperties` 인터페이스와 함께 computed 필드 어휘(`ALIAS`, `COMPUTED_FIELD_NAMES`, `STATE_FIELD_NAMES`)를 이름으로 내보냅니다. 실제 매니저를 만들지 판단하는 게이트가 이 매니저가 읽는 목록과 같은 목록을 봐야 하므로, 사본 대신 이 어휘를 건네줍니다 — 어긋나면 computed를 가진 노드가 sentinel을 공유해 재계산이 사라집니다.

## Acceptance Criteria

### computed-properties-manager-contract — 관찰 가능한 동작

- 등록된 경로의 순서는 표현식이 읽는 dependencies 인덱스와 일치합니다.
- 계산 함수가 없는 상태 항목은 기본값을 유지하며, 파생 값은 원래 값 타입을 보존합니다.

## Last Updated

2026-09-21 — entry point가 computed 필드 어휘를 이름으로 내보내도록 계약을 넓힘. 이유: `needsRealComputedManager`가 `utils/type.ts`를 직접 읽어 이 fractal의 organ을 밖에서 침범했다. 어휘의 소유자는 이 매니저이므로 소비자를 옮기는 대신 entry point로 건넨다.

2026-09-16
