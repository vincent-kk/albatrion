# getObservedValuesFactory

## Requirements

watch에 지정한 경로의 값을 지정 순서대로 읽는 계산 함수를 만듭니다.

## API Contracts

- 단일 문자열은 배열로 정규화하며, 경로 등록과 인덱스 조회는 PathManager에 위임합니다.
- 사용할 인덱스가 없으면 undefined를 반환하고 컴파일 실패는 OBSERVED_VALUES 오류로 전달합니다.

## Acceptance Criteria

### get-observed-values-factory-contract — 관찰 가능한 동작

- watch 순서와 반환 배열의 값 순서가 일치합니다.
- 다른 표현식이 같은 경로를 먼저 등록해도 올바른 dependency 인덱스를 읽습니다.

## Last Updated

2026-09-16
