# transformErrors

## Requirements

선택되지 않은 조합 분기가 남긴 검증 오류를 사용자 오류 결과에서 제외합니다: 내부 강화 필드의 오류, 그리고 null이 아닌 값을 `type: 'null'` 분기가 거부한 오류입니다.

## API Contracts

- 배열이 아닌 입력은 빈 배열을 반환하며, 남은 오류를 새 결과 배열에 담습니다.
- 유지되는 오류 객체는 원본 참조를 그대로 사용하며, key 옵션이 켜지면 모듈 수준의 순차 key를 쓰고 꺼지면 기존 key를 undefined로 지웁니다.

## Acceptance Criteria

### transform-errors-contract — 관찰 가능한 동작

- 강화 키를 포함한 dataPath 오류는 반환 배열에 남지 않습니다.
- `oneOf`/`anyOf` 분기의 `type` 키워드가 낸, 기대 타입이 `null`인(`'null'` 또는 `['null']`) `type` 오류는 반환 배열에 남지 않습니다. 같은 검증의 `oneOf` 오류와 다른 분기의 오류는 남으므로 실패 자체는 가려지지 않습니다.
- 조합 분기가 아닌 곳의 `type` 오류와 기대 타입이 `null`이 아닌 분기 오류는 남습니다.
- key 부여를 요청하지 않아도 유지되는 원래 오류 객체의 key는 undefined로 설정됩니다.

## Last Updated

2026-09-20
