# convertExpression

## Requirements

조건 딕셔너리를 부모 경로 기준의 비교 표현식으로 변환합니다.

## API Contracts

- 배열 값은 includes, 단일 값은 엄격한 동등 비교로 표현하며 boolean은 리터럴로 기록합니다.
- 배열과 비boolean 값의 리터럴은 JSON.stringify의 escaping과 출력 의미론을 따릅니다.
- inverse는 비교 부정과 AND에서 OR로의 결합 반전을 함께 적용합니다.

## Acceptance Criteria

### convert-expression-contract — 관찰 가능한 동작

- 조건이 없으면 null이고 단일 조건은 불필요한 다중 결합을 만들지 않습니다.
- 문자열과 boolean의 표현이 구분되며 생성된 코드를 변환 중 실행하지 않습니다.

## Last Updated

2026-09-16
