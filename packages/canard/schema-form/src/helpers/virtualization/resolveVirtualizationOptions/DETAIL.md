# resolveVirtualizationOptions

## Requirements

폼 수준의 가상화 입력을 정규화하며, 옵션 계약은 매니저의 생명주기 상태와 독립적으로 유지합니다.

## API Contracts

- 입력이 false이거나 없으면 null을 반환하고, true이면 기존 기본값을 선택합니다.
- 객체 입력은 명시적인 옵션 값을 유지하고 null 또는 undefined인 필드만 기본값으로 채웁니다.
- eagerCount는 큰 가지의 선행 자식 수와 폼 전체 작업당 즉시 마운트 수의 공통 예산입니다. 별도 taskBudget 옵션은 추가하지 않으며 기본값은 유지합니다.
- 상위 virtualization의 내보내기와 호환성 타입 모듈은 같은 옵션 타입과 backfill 열거형을 그대로 가리켜야 합니다.

## Acceptance Criteria

### option-compatibility — 기존 옵션 의미 유지

- 매니저 생성·선택 테스트의 기존 기대값을 유지합니다.
- 소비자는 기존 내보내기 경로를 통해 같은 열거형 값과 옵션 구조를 사용합니다.

## Last Updated

2026-09-16
