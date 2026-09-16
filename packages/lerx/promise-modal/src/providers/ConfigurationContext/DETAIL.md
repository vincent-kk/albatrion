# ConfigurationContext

## Requirements

모달 옵션·애니메이션 지속시간·배경 설정을 Context로 전달합니다.

## API Contracts

- Provider는 기본 설정과 호출자가 전달한 override를 결합합니다.
- 소비자는 전체 설정 또는 역할별 훅을 통해 같은 설정 값을 읽습니다.

## Acceptance Criteria

### configuration-context-contract — 관찰 가능한 동작

- 사용자 override가 있으면 대응 기본값보다 우선합니다.
- 컴포넌트별 하드코딩 값으로 Context 설정을 우회하지 않습니다.

## Last Updated

2026-09-16
