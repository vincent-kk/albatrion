# validateCompatibility

## Requirements

allOf 항목을 병합하기 전에 타입 호환 여부만 판정합니다.

## API Contracts

- allOf 항목에 type이 없으면 true이며, 명시된 경우 공통 타입 호환 판정에 위임합니다.
- nullable 타입 배열은 순서에 무관하게 비교하며 비호환은 false로 반환합니다.

## Acceptance Criteria

### validate-compatibility-contract — 관찰 가능한 동작

- 같은 nullable 타입의 배열 순서 차이만으로 비호환 판정하지 않습니다.
- 이 함수는 직접 병합하거나 오류를 던지지 않으며 호출자가 false를 처리합니다.

## Last Updated

2026-09-16
