# Fill Scenarios contract

## Requirements

로드와 최초 생김의 채움을 일반 편집과 구별하는 장면을 소유합니다. 채움 시점을 지워 단순한 최종 값 비교로 바꾸면 편집 값을 덮는 회귀를 놓칩니다.

## API Contracts

minItems 제약과 실제 항목 생성은 별도 관찰로 유지합니다. 터미널 객체·배열의 보존과 호출자 데이터 불변을 확인할 때 컴포넌트 주입·동결 계측은 소비자가 맡습니다.

## Acceptance Criteria

### fill-scene-data — 공유 장면 경계

- 공유 형식의 수용 기준은 [패키지의 scenario-data 계약](../../DETAIL.md)에 둡니다.

### fill-scene-coverage — 관찰을 보존하는 기준

- 로드·첫 생김·편집 뒤 reset의 관찰을 분리하여 채움 계기를 보존합니다.
- 호출자 객체의 불변성은 소비자 계측으로 확인하며 장면의 리터럴 값 비교만으로 대체하지 않습니다.

## Last Updated

이 부류의 관찰 범위·실행 전제·소비자 계측 경계가 바뀔 때 갱신합니다.
