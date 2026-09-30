# omitEmptyObject

## Requirements

객체 변경 경계에서 비어 있는 객체만 생략합니다.

## API Contracts

- isEmptyObject가 참이면 undefined를 반환하고 그 밖에는 입력을 그대로 반환합니다.
- 키를 제거하거나 객체를 복사하지 않습니다.

## Acceptance Criteria

### omit-empty-object-contract — 관찰 가능한 동작

- 값이 undefined인 키라도 존재하면 빈 객체로 취급하지 않습니다.
- null과 undefined는 그대로 통과하며 비어 있지 않은 객체의 참조를 유지합니다.

## Last Updated

2026-09-16
