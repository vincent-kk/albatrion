# ContextNode

## Requirements

계산 표현식이 참조할 공유 값을 담되 일반 객체 필드 트리를 만들지 않습니다.

## API Contracts

- 값은 unknown으로 보관하고 applyValue는 previous와 current를 포함한 UpdateValue를 발행합니다.
- 이전 값과 같은 값을 다시 적용해도 알림을 생략하지 않습니다.

## Acceptance Criteria

### context-node-contract — 관찰 가능한 동작

- 동일 참조를 재적용하는 경우에도 의존성 소비자가 UpdateValue를 받습니다.
- 공유 컨텍스트 값을 properties 기반 자식 노드로 분해하지 않습니다.

## Last Updated

2026-09-16
