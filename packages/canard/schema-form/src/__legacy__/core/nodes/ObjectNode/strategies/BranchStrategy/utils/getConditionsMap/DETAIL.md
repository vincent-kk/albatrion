# getConditionsMap

## Requirements

필드별 조건 기록을 실행하지 않은 표현식 목록으로 변환합니다.

## API Contracts

- 입력 맵이 없으면 undefined이며 무조건 필수인 true 항목은 표현식 생성을 생략합니다.
- 조건과 inverse를 convertExpression으로 전달하고 빈 변환 결과는 목록에 넣지 않습니다.

## Acceptance Criteria

### get-conditions-map-contract — 관찰 가능한 동작

- 조건 맵 원본은 변환 후에도 변경되지 않습니다.
- 반환된 값은 표현식 문자열이며 변환 과정에서 조건을 평가하지 않습니다.

## Last Updated

2026-09-16
