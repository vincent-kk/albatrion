# Structure Feature Scenarios contract

## Requirements

객체 잔여 키·중첩 배열·batch 동사의 조합과 오류 귀속을 소유합니다. 단일 동사 장면은 array 부류에서 소비하여 같은 기대값의 복제를 막습니다.

## API Contracts

중첩 이동과 batch는 값뿐 아니라 `identity`로 관찰합니다. 배열 동사는 batch 안에서도 순차 호출과 같은 항목 신원을 유지하며, 앞선 쓰기를 정착한 뒤 배열 배치를 즉시 적용합니다. 외부 배달과 onChange는 가장 바깥 batch에서 한 번 수집하므로 개별 호출로 장면을 대체하지 않습니다.

검증 오류는 부분 필드와 개수·순서를 함께 대조합니다. 빈 중첩 배열의 생략 여부는 검증기에 가는 출력도 바꾸므로 배열이 남아 있다는 사실만으로 minItems 판정을 가정하지 않습니다.

## Acceptance Criteria

### structure-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../../DETAIL.md)에 둡니다.

### structure-scene-coverage — 관찰을 보존하는 기준

- 구조 동사의 중첩·batch 관찰을 유지하여 순차 동사로 같은 최종 값만 만드는 시험으로 축약하지 않습니다.
- 제거·이동 뒤 오류 경로와 identity를 함께 확인하여 값 비교가 귀속 손실을 가리지 않게 합니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
