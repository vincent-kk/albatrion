# mergeShowConditions

## Requirements

추가 표시 조건을 기존 active 조건의 의미를 보존하여 병합합니다.

## API Contracts

- 조건이 없으면 원본 스키마를 반환하고, 기존 active가 boolean이면 그대로 유지합니다.
- 문자열 조건은 OR로 결합한 뒤 기존 조건과 조합하여 새 스키마에 반영합니다.

## Acceptance Criteria

### merge-show-conditions-contract — 관찰 가능한 동작

- 기존 false 또는 true를 새 문자열 조건으로 덮어쓰지 않습니다.
- 병합이 필요한 경우에도 원본 스키마 객체는 변경되지 않습니다.

## Last Updated

2026-09-16
