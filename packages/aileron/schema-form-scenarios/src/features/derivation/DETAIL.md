# Derivation Feature Scenarios contract

## Requirements

파생·주입·감시의 기능 장면과 소비자 사례를 소유합니다. controls·exit·derive·union의 기존 장면은 복사하지 않아 같은 동작의 기대값이 갈라지지 않게 합니다.

## API Contracts

Form 맥락과 소비자 전용 상호작용은 사례 상수로 둡니다. 범용 장면 어휘를 props 교체와 UI 조작으로 넓히면 코어 러너까지 렌더 계층에 묶이므로 소비자가 해석합니다.

맥락 사례의 첫 단계는 마운트 맥락이며 onChange 수는 그 단계에서 발생한 수입니다. 누적 횟수로 대조하여 이전 단계의 통지를 잘못 귀속하지 않습니다.

## Acceptance Criteria

### derivation-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### derivation-scene-coverage — 관찰을 보존하는 기준

- watch의 실제 의존 변화 전에 수동 편집을 관찰하여 무조건 재계산을 검출합니다.
- resetInteraction은 상태와 값을 함께 관찰하며 맥락은 실제 prop 교체로 실행합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
