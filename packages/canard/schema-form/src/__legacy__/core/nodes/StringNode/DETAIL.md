# StringNode

## Requirements

문자열 파싱, 빈 값 생략, blur 시 trim을 서로 구분합니다.

## API Contracts

- nullable null은 보존하고 나머지 입력은 문자열 파서에 위임합니다.
- 기본 omitEmpty 경로는 빈 문자열을 undefined로 전달하며 trim 옵션은 Blurred 이벤트에 연결합니다.

## Acceptance Criteria

### string-node-contract — 관찰 가능한 동작

- trim이 꺼져 있으면 blur만으로 공백을 제거하지 않습니다.
- omitEmpty를 명시적으로 끄면 빈 문자열을 외부 변경 값으로 유지할 수 있습니다.

## Last Updated

2026-09-16
