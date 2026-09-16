# checkDefinedValue

## Requirements

JSON 값의 기본값 존재 여부를 판정하며, 값의 truthiness와 존재를 구분합니다.

## API Contracts

- null과 정의된 원시값은 true, undefined는 false입니다.
- 객체와 배열은 열거 가능한 own property가 있을 때만 true입니다. 상속 프로퍼티는 포함하지 않습니다.

## Acceptance Criteria

### check-defined-value-contract — 관찰 가능한 동작

- false, 0, 빈 문자열과 null을 미정의 값으로 취급하지 않습니다.
- 빈 객체·빈 배열과 own property 없는 객체는 false이며, 입력을 변경하지 않습니다.

## Last Updated

2026-09-16
