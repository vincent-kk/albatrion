# VirtualizationContext

## Requirements

폼의 가상화 매니저를 마운트 시 한 번 생성하여 하위 소비자에게 공유합니다.

## API Contracts

- 마운트 후 virtualization prop이 바뀌어도 기존 매니저를 다시 만들지 않습니다.
- 비활성·관찰 API 부재의 null 결과를 그대로 전달하며 정리 시 disconnect를 호출합니다.

## Acceptance Criteria

### virtualization-context-contract — 관찰 가능한 동작

- null 매니저 때문에 하위 노드가 예외를 던지지 않고 일반 렌더링을 계속할 수 있습니다.
- Provider 언마운트 시 관찰자와 idle 작업이 남지 않습니다.

## Last Updated

2026-09-16
