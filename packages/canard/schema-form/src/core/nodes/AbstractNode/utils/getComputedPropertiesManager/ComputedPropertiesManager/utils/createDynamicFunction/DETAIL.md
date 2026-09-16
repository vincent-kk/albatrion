# createDynamicFunction

## Requirements

computed 표현식의 경로 참조를 의존성 인덱스로 치환하여 실행 함수를 만듭니다.

## API Contracts

- 문자열이 아니거나 처리 후 비어 있는 표현식은 undefined를 반환합니다. 경로는 PathManager로 등록하고 조회합니다.
- 후행 세미콜론을 제거하고 요청된 boolean coercion을 적용합니다. 컴파일 실패는 CREATE_DYNAMIC_FUNCTION 오류로 전달합니다.

## Acceptance Criteria

### create-dynamic-function-contract — 관찰 가능한 동작

- 반복되는 같은 경로는 같은 의존성 인덱스를 사용합니다.
- 유효하지 않은 표현식을 조용히 빈 함수로 바꾸지 않으며, 값 표현식은 강제 boolean 변환 없이 실행할 수 있습니다.

## Last Updated

2026-09-16
