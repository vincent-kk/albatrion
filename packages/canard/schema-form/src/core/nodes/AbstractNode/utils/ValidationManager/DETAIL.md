# ValidationManager

## Requirements

루트 검증 결과를 현재 노드의 data path와 variant에 맞춰 배분합니다.

## API Contracts

- 스키마 확장 필드를 제거한 뒤 생성 시 검증기를 준비합니다. 컴파일 오류는 fallback 검증기로 전달합니다.
- 비루트나 비활성 검증은 수행하지 않으며, 이전 실행의 뒤늦은 결과는 세대 확인으로 무시합니다.

## Acceptance Criteria

### validation-manager-contract — 관찰 가능한 동작

- 다음 검증에서 사라진 오류의 이전 경로를 정리합니다.
- 같은 data path의 variant라도 schemaPath가 맞지 않는 오류는 그 노드에 적용하지 않습니다.

## Last Updated

2026-09-16
