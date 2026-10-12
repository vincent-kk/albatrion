# getSafeEmptyValue

## Requirements

루트 onChange 경계에서만 미정의 값을 스키마 타입에 맞는 빈 값으로 보완합니다.

## API Contracts

- value가 undefined가 아니면 원본을 그대로 반환합니다.
- undefined일 때만 getEmptyValue에 타입별 빈 값 결정을 위임합니다.

## Acceptance Criteria

### get-safe-empty-value-contract — 관찰 가능한 동작

- null, false, 0과 빈 문자열을 빈 값 폴백으로 대체하지 않습니다.
- 이미 정의된 객체나 배열은 참조를 유지합니다.

## Last Updated

2026-09-16
