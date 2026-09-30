# omitEmptyArray

## Requirements

omitEmpty가 켜진 배열의 외부 변경 값에서 빈 배열만 제거합니다.

## API Contracts

- 빈 배열은 undefined로 반환하고, 나머지 값은 그대로 통과시킵니다.
- 배열을 변경하거나 요소를 필터링하지 않습니다.

## Acceptance Criteria

### omit-empty-array-contract — 관찰 가능한 동작

- 비어 있지 않은 배열은 원본 참조를 유지합니다.
- null과 undefined를 서로 변환하지 않습니다.

## Last Updated

2026-09-16
