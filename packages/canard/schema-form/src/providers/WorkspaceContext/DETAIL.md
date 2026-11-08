# WorkspaceContext

## Requirements

폼별 첨부 파일 맵과 사용자 context를 공급합니다. 노드 값·오류를 여기에 저장하지 않아 엔진과 React의 이중 상태 소유를 막습니다.

## API Contracts

외부 기본 context에 Form context를 덮고 원래 딕셔너리는 수정하지 않습니다. 내용 기준 안정화로 동등한 값의 참조 교체가 불필요한 Context 전파를 만들지 않게 합니다.

## Acceptance Criteria

### workspace-context-contract — 첨부 파일은 폼 인스턴스에 속합니다

첨부 맵은 FormCore가 소유한 동일 객체를 전달하고 Context에서 새로 만들지 않습니다. reset 시 비우는 책임은 [RootNodeContext](../RootNodeContext/DETAIL.md)에 둡니다. context 병합이나 Provider 재렌더가 첨부 파일을 유실시키지 않아야 합니다.

## Last Updated

context 병합 우선순위 또는 첨부 파일 소유 수명이 바뀌면 갱신합니다.
