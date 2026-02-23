# traversal

## Purpose
노드 트리를 깊이 우선(DFS) 또는 너비 우선(BFS)으로 순회하는 유틸리티 함수 모음. 전체 서브트리에 대한 상태 설정, 초기화, 계산 속성 업데이트 등에 사용된다.

## Structure
- `depthFirstSearch.ts` — DFS 순회 (postOrder 기본값: true)
- `breadthFirstSearch.ts` — BFS 순회 (큐 기반)
- `index.ts` — barrel export

## Conventions
- TypeScript strict 모드
- `depthFirstSearch`: `postOrder: true`(기본) → 자식 먼저 방문, `false` → 부모 먼저
- `breadthFirstSearch`: 배열 큐로 구현, `subnodes` 기반 탐색
- 두 함수 모두 `node.subnodes` 를 통해 모든 브랜치(inactive 포함) 탐색
- visitor 함수: `(node: AbstractNode) => void`

## Boundaries

### Always do
- `setSubtreeState` / `clearSubtreeState` 등 트리 전체 작업에서 DFS 사용
- `subnodes` 사용으로 inactive(scope 밖) 노드도 순회

### Ask first
- 순회 중 early exit 지원 추가 (visitor 반환값으로 중단)
- `children` (active only) vs `subnodes` (all) 사용 기준 변경

### Never do
- 이 함수들을 React 렌더 사이클 내에서 반복 호출 (성능 주의)
- 순회 중 트리 구조(subnodes) 변경

## Dependencies
- `../../AbstractNode` — `AbstractNode` 타입
- `@aileron/declare` — `Fn`
