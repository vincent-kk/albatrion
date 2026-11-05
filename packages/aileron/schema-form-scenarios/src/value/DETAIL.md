# Value Scenarios contract

## Requirements

값 해석과 방출 투영의 차이를 공유 장면으로 소유합니다. 빈 입력과 명령형 쓰기를 구별해야 화면 어댑터가 엔진의 값 계약을 가리지 않습니다.

## API Contracts

빈 칸 조작은 `clear`로 기술하고 호출자의 `setValue('')`와 합치지 않습니다. nullable 입력의 화면 초안까지 확인하는 계측은 소비자 e2e가 맡습니다.

루트 `$defs`와 이스케이프한 경로는 공개 진입점으로 렌더하는 소비자도 같은 데이터를 사용합니다. 내부 노드 러너만 통과하여 공개 경로의 회귀를 놓치지 않게 합니다.

## Acceptance Criteria

### value-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../DETAIL.md)에 둡니다.

### value-scene-coverage — 관찰을 보존하는 기준

- 값 해석과 부모 방출을 함께 관찰할 수 있는 기대값을 유지합니다.
- 빈 입력과 명령형 쓰기는 각 계기의 직후 값을 확인하여 입력 처리가 차이를 가리지 않게 합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
