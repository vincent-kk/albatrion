# error

## Requirements

개발자 진단 문자열과 사용자 검증 메시지의 책임을 구분합니다.

## API Contracts

- 진단 포맷터는 문자열을 반환하되 원시 JSON 미리보기의 직렬화 오류를 전파할 수 있고, 검증 포맷터는 스키마의 메시지 설정을 반영합니다.

## Acceptance Criteria

### error-contract — 관찰 가능한 동작

- 표시용 포맷팅은 외부 상태를 변경하지 않지만, 순환 참조 등 JSON으로 직렬화할 수 없는 진단 입력은 예외를 발생시킬 수 있습니다.

## Last Updated

2026-10-13 — 177라운드(VALIDATE-010, LANDING-115).
