# Composition Feature Scenarios contract

## Requirements

조건·합성의 형상 선택과 검증기 판정을 구별하는 장면을 소유합니다. 기존 엔진 부류와 겹치는 장면은 소비자가 원래 부류에서 가져와 기대값의 이중 정본을 막습니다.

## API Contracts

guard·오류 귀속 장면은 검증기를 주입한 소비자가 실행합니다. 구조적 오류 기대값은 부분 계약으로 두고 소비자는 개수·순서와 부분 필드를 함께 대조하여 불필요한 검증기 메시지 결합을 피합니다.

batch 보존 장면은 쓴 경로 밖의 꺼진 source를 관찰하므로 관계없는 쓰기를 분기 전체 교체로 바꾸지 않습니다.

## Acceptance Criteria

### composition-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### composition-scene-coverage — 관찰을 보존하는 기준

- 형상 제어와 전체 검증을 별도 관찰하여 명시 활성만으로 oneOf가 통과한다고 가정하지 않습니다.
- 중첩·왕복·관계없는 batch 뒤의 관찰을 유지하여 최종 화면만 맞는 손실을 검출합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
