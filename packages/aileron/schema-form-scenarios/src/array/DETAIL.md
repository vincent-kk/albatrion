# Array Scenarios contract

## Requirements

배열의 위치·정체성·스냅숏·방출을 구별하는 장면을 소유합니다. 값만 같으면 통과하는 관찰은 이동한 아이템의 상태 손실과 잘못된 재사용을 놓칩니다.

## API Contracts

일반 코어 표는 위치 재조정·터미널 동사·Source-B 구조 장면을 제외하고, 전용 명세가 같은 데이터를 실행하며 상호작용 상태·source 사본·사용한 키를 추가 단언합니다. 데이터 공유가 전용 계측의 삭제나 중복 실행을 뜻하지 않습니다.

reset 직전의 통째 쓰기 결과도 관찰하여 준비 단계의 실패를 reset 성공이 가리지 않게 합니다. minItems를 자동 채움의 근거로 삼지 않는 장면 구분은 [fill 계약](../fill/DETAIL.md)에 둡니다.

## Acceptance Criteria

### array-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../DETAIL.md)에 둡니다.

### array-scene-coverage — 관찰을 보존하는 기준

- 구조 동사 뒤 값뿐 아니라 identity와 기본값 스냅숏의 관찰을 유지합니다.
- 예산 초과의 원본 복구와 이미 사용한 키의 계측은 전용 소비자 명세에서 보존합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
