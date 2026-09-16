# transformErrors

## Requirements

내부 강화 필드에 해당하는 검증 오류를 사용자 오류 결과에서 제외합니다.

## API Contracts

- 배열이 아닌 입력은 빈 배열을 반환하며, 남은 오류를 새 결과 배열에 담습니다.
- key 옵션이 켜져 있으면 원래 오류 객체에 모듈 수준의 순차 key를 부여합니다.

## Acceptance Criteria

### transform-errors-contract — 관찰 가능한 동작

- 강화 키를 포함한 dataPath 오류는 반환 배열에 남지 않습니다.
- key 부여를 요청하지 않으면 그 목적으로 원래 오류 객체를 수정하지 않습니다.

## Last Updated

2026-09-16
