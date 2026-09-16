# ExternalFormContext

## Requirements

여러 폼이 공통으로 사용할 외부 설정을 제공하며 폼별 override를 허용합니다.

## API Contracts

- 입력 정의는 마운트 시 고정하고 사용자 context는 내용 기준으로 안정화합니다.
- 외부 설정은 폼 수준 props보다 낮은 우선순위이며 기본 Context는 빈 설정입니다.

## Acceptance Criteria

### external-form-context-contract — 관찰 가능한 동작

- 외부 Provider가 없어도 소비자는 빈 설정에서 폴백을 선택할 수 있습니다.
- 마운트 후 입력 정의 prop의 참조만 바꿔 고정된 정의를 재등록하지 않습니다.

## Last Updated

2026-09-16
