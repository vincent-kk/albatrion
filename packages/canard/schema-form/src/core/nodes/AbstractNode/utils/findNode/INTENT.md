# findNode

## Purpose

JSONPointer 경로로 노드 트리를 탐색하는 함수 쌍. `findNode` 는 variant-aware 단일 노드 탐색(oneOf 브랜치 우선), `findNodes` 는 모든 매칭 노드를 중복 없이 반환한다.

## Conventions

- TypeScript strict 모드
- 특수 세그먼트: `$.Fragment` (`#`, root), `$.Parent` (`..`), `$.Current` (`.`)
- `findNode`: 동일 name의 여러 노드 중 `detectsCandidate(source, node) === true` 우선, 없으면 첫 번째 폴백
- `findNodes`: variant 필터링 없이 모든 매칭 노드 수집; wildcard(`*`) 지원
- terminal 노드 도달 시 더 이상 탐색 불가 (subnodes 없음)

## Boundaries

### Always do

- `findNode` 는 `AbstractNode.find()` 에서만 사용
- `findNodes` 는 `AbstractNode.findAll()` 에서만 사용
- `getSegments` 로 경로 파싱 (직접 split 금지)

### Ask first

- `detectsCandidate` 의 variant 판단 로직 변경 (oneOf/anyOf 경계 조건)

### Never do

- `findNode` 에서 모든 브랜치를 반환 (`findNodes` 의 역할)
- `null` pointer를 source 반환이 아닌 다른 값으로 처리
