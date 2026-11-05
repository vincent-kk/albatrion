# Validation Scenarios contract

## Requirements

작성 스키마의 판정과 노드 오류 귀속을 관찰하는 공유 장면을 소유합니다. 형상 선택의 성공을 전체 검증의 성공으로 오인하지 않게 합니다.

## API Contracts

코어 검증 장면은 관찰 어댑터와 독립 AJV 경로의 비교 입력으로 사용합니다. 노드 오류 귀속의 성공을 검증기 플러그인 적합성 전체로 확대하지 않으며 후자는 [validator 계약](../validator/DETAIL.md)이 소유합니다.

제출·reset의 화면 장면도 공유 데이터를 쓰며, 제출 실행과 검증기 주입은 소비자가 맡습니다.

## Acceptance Criteria

### validation-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../DETAIL.md)에 둡니다.

### validation-scene-coverage — 관찰을 보존하는 기준

- 형상 선택과 전체 스키마 판정을 함께 관찰하여 켜진 분기만 검사하는 잘못을 검출합니다.
- 오류가 남는 노드 경로를 확인하여 폼 수준 무효 여부만으로 귀속 검증을 대신하지 않습니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
