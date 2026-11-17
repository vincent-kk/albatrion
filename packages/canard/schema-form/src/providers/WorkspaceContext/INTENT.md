# WorkspaceContext

## Purpose

폼별 첨부 파일과 사용자 context를 공급합니다.

## Conventions

- 세부 선택·수명과 소유자 연결은 [DETAIL](DETAIL.md)에 둡니다.

## Boundaries

### Always do

- Form의 context 우선순위와 첨부 맵 identity를 유지하여 데이터 혼합·유실을 막습니다.

### Ask first

- context 병합 전략이나 첨부 파일 저장 방식을 바꿀 때

### Never do

- 첨부 맵을 Context에서 새로 만들거나 노드 값·오류를 저장하지 않습니다.
