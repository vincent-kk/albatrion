# BootstrapProvider

## Requirements

모달 Provider는 초기화 핸들과 렌더 앵커를 연결하며 자신이 만든 자원을 정리합니다.

## API Contracts

- ref를 통해 초기화 핸들을 노출하고 설정·매니저·사용자 정의 Provider를 순서대로 중첩합니다.
- 앵커는 ModalManager를 통해 확보하며 정리는 자신이 초기화한 경우에만 수행합니다.

## Acceptance Criteria

### bootstrap-provider-contract — 관찰 가능한 동작

- 언마운트한 Provider가 다른 초기화 주체의 전역 상태를 임의로 해제하지 않습니다.
- 자신이 초기화한 Provider를 제거하면 앵커와 매니저 상태가 함께 정리됩니다.

## Last Updated

2026-09-16
