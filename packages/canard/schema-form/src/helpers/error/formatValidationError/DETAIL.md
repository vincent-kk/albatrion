# formatValidationError

## Requirements

스키마에 정의된 사용자 오류 메시지를 검증 오류에 적용합니다.

## API Contracts

- 메시지 설정이나 keyword가 없으면 원래 error.message를 반환합니다. 로케일별 설정은 context.locale로 고릅니다.
- 고른 메시지의 플레이스홀더를 오류 details와 현재 노드 값으로 치환합니다.

## Acceptance Criteria

### format-validation-error-contract — 관찰 가능한 동작

- 커스텀 메시지를 찾지 못해도 기존 메시지를 잃지 않습니다.
- 메시지는 해당 노드의 스키마 설정에서 조회하며, 외부 전역 메시지 저장소에 의존하지 않습니다.

## Last Updated

2026-09-16
