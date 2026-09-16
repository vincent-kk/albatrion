# error

## Requirements

개발자 진단 문자열과 사용자 검증 메시지, 내부 오류 배열 변환의 책임을 구분합니다.

## API Contracts

- 진단 포맷터는 문자열을 반환하고, 검증 포맷터는 스키마의 메시지 설정을 반영합니다.
- transformErrors는 오류 객체에 key를 쓸 수 있으므로 호출자는 원본 보존을 가정하지 않습니다.

## Acceptance Criteria

### error-contract — 관찰 가능한 동작

- 표시용 포맷팅 때문에 새로운 예외나 외부 상태 변경이 발생하지 않습니다.
- 오류 변환을 거친 결과 배열과 원래 배열을 동일한 배열 참조로 가정하지 않습니다.

## Last Updated

2026-09-16
