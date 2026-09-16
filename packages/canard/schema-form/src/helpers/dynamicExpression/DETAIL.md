# dynamicExpression

## Requirements

조건을 표현식 문자열로 만들고 실행 책임은 소비자에게 남깁니다.

## API Contracts

- 조건이 없으면 null이며 배열 조건은 포함 여부, 단일 조건은 동등 비교를 표현합니다.
- 반전 시 개별 비교와 다중 조건 결합을 함께 반전합니다.

## Acceptance Criteria

### dynamic-expression-contract — 관찰 가능한 동작

- 변환이나 결합 과정에서 eval 또는 동적 함수를 실행하지 않습니다.
- 호출자는 null 결과와 실행 가능한 표현식 문자열을 구분할 수 있습니다.

## Last Updated

2026-09-16
