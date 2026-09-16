# getEmptyValue

## Requirements

컨테이너 타입에만 독립적인 빈 초기값을 제공합니다.

## API Contracts

- array에는 새 배열, object에는 새 객체를 반환합니다.
- 원시 타입이나 미확인·누락 타입에는 undefined를 반환합니다.

## Acceptance Criteria

### get-empty-value-contract — 관찰 가능한 동작

- 연속 호출의 빈 배열·객체는 서로 다른 참조입니다.
- virtual이나 원시 타입의 초기화 정책을 이 함수에서 임의로 추가하지 않습니다.

## Last Updated

2026-09-16
