# combineConditions

## Requirements

조건 문자열을 의미 변경 없이 논리 연산자로 묶습니다.

## API Contracts

- falsy 항목을 제거한 뒤 0개이면 null, 1개이면 해당 문자열을 그대로 반환합니다.
- 복수 항목은 각각 괄호로 감싸며 기본 결합 연산자는 AND입니다.

## Acceptance Criteria

### combine-conditions-contract — 관찰 가능한 동작

- 빈 항목이 있어도 불필요한 연산자가 결과에 남지 않습니다.
- 복수 조건 내부의 연산자 우선순위는 괄호로 보존합니다.

## Last Updated

2026-09-16
