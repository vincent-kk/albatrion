# traversal

## Requirements

노드 트리의 활성 여부와 관계없이 전체 subnodes를 순회합니다.

## API Contracts

- 순회 함수는 하위 노드 연결만 요구하는 구조적 계약을 사용하며, 방문자에는 입력 노드 타입을 유지합니다.
- DFS는 기본적으로 자식을 먼저 방문하고, postOrder를 끄면 부모를 먼저 방문합니다.
- BFS는 큐 순서로 방문합니다. visitor 실행 중 트리 구조를 변경하지 않습니다.

## Acceptance Criteria

### traversal-contract — 관찰 가능한 동작

- 비활성 분기의 노드도 순회 대상에 포함됩니다.
- DFS의 전위·후위 선택에 따라 부모와 자식의 방문 순서가 달라집니다.

## Last Updated

2026-09-16
