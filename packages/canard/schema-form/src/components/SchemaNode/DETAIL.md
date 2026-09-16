# SchemaNode

## Requirements

노드 렌더링의 외부 진입점은 SchemaNodeProxy이며, 입력 처리와 지연 마운트는 내부에서 조합합니다.

## API Contracts

- 비활성 노드는 렌더하지 않습니다. 하위 노드는 전달된 NodeProxy를 통해 같은 렌더 계약을 재사용합니다.
- 마운트된 노드는 data-path로 경로를 노출하며, 노드 구독은 React 생명주기에 맞춰 해제합니다.

## Acceptance Criteria

### schema-node-contract — 관찰 가능한 동작

- enabled가 false인 노드는 입력과 래퍼를 남기지 않습니다.
- 재귀 렌더링에서도 동일한 노드 경로와 렌더러 연결 규칙이 적용됩니다.

## Last Updated

2026-09-16
