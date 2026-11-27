# Union Scenarios contract

## Requirements

union 해석과 전이 되먹임을 관찰하는 공유 장면을 소유합니다. 입력 해석과 분기 전환을 한 결과로 축약하면 원래 입력이 중간 변환으로 손실되는 회귀를 놓칩니다.

## API Contracts

분기 왕복은 준비 쓰기의 결과를 확인한 뒤 전환하며 null 쓰기는 바로 다음 기대값에서 관찰합니다. 되먹임은 값뿐 아니라 `diagnostics`도 확인하여 수렴과 저하를 구별합니다.

## Acceptance Criteria

### union-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../DETAIL.md)에 둡니다.

### union-scene-coverage — 관찰을 보존하는 기준

- 두 단계 해석은 원래 입력을 식별할 수 있는 값으로 유지하여 중간 결과 재사용을 검출합니다.
- 수렴·비수렴 장면을 함께 유지하고, 예산 초과의 값과 저하 원인을 모두 관찰합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
