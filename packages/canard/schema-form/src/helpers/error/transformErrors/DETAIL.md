# transformErrors

## Requirements

내부 강화 필드에 해당하는 검증 오류를 사용자 오류 결과에서 제외합니다.

## API Contracts

- 배열이 아닌 입력은 빈 배열을 반환하며, 남은 오류를 새 결과 배열에 담습니다.
- 유지되는 오류 객체는 원본 참조를 그대로 사용하며, key 옵션이 켜지면 모듈 수준의 순차 key를 쓰고 꺼지면 기존 key를 undefined로 지웁니다.

## Acceptance Criteria

### transform-errors-contract — 관찰 가능한 동작

- 강화 키를 포함한 dataPath 오류는 반환 배열에 남지 않습니다.
- key 부여를 요청하지 않아도 유지되는 원래 오류 객체의 key는 undefined로 설정됩니다.

## Last Updated

2026-09-16
