# error

## Requirements

개발자 진단의 공유 문자열 원소를 소유하고, 사용자 입력 판정의 메시지 변환은 [formatValidationError](formatValidationError/DETAIL.md)에 맡깁니다. 진단 박스의 개별 포맷터는 이를 읽는 모듈에 두어 공유 원소가 모든 오류 도메인을 알아야 하는 구조를 피합니다.

## API Contracts

구분선과 메시지 추출은 표현용 보조이며 오류의 분류·보고·복구를 수행하지 않습니다. 이 메시지 추출기는 임의의 접근자나 문자열 변환 실패까지 격리하는 capture 경계가 아니므로, [렌더 보고 경계](../../providers/FormErrorContext/DETAIL.md)의 보호 로직을 대신하지 않습니다.

## Acceptance Criteria

### error-contract — 진단 표현은 사건을 바꾸지 않습니다

공유 문자열 원소는 외부 상태를 변경하지 않습니다. 진단 문구를 만드는 일이 오류를 다시 보고하거나 검증 결과·노드 값을 수정하면 보고 횟수와 입력 판정이 표현 방식에 종속되므로 그런 책임을 추가하지 않습니다.

## Last Updated

공유 진단 표현의 책임이나 메시지 포맷터와의 경계가 바뀔 때 갱신합니다.
