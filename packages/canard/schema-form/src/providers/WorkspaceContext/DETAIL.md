# WorkspaceContext

## Requirements

첨부 저장소는 공개 Map identity를 유지하면서 브리지 소유 토큰과 노드별 파일을 보유합니다. 경로 이동은 한 번의 전체 투영으로 정리하며 같은 경로의 다른 렌더 위치를 해제해도 살아 있는 소유자의 파일을 지우지 않습니다. clear는 소유 기록도 비워 reset 뒤 재투영으로 파일이 부활하지 않게 합니다.

폼별 첨부 파일 맵과 사용자 context를 공급합니다. 노드 값·오류를 여기에 저장하지 않아 엔진과 React의 이중 상태 소유를 막습니다.

## API Contracts

폼별 DOM 식별 범위는 Form마다 한 번의 useId로 생성하며 context에 보유합니다. 서버와 클라이언트는 같은 트리·identifierPrefix를 사용하고 독립 React root의 prefix는 호스트가 구별합니다. 범위는 데이터 경로와 분리하여 같은 경로의 여러 Form이 레이블·선택 그룹을 공유하지 않게 합니다.

외부 기본 context에 Form context를 덮고 원래 딕셔너리는 수정하지 않습니다. [context 비교 계약](../DETAIL.md)에 따른 안정화로 동등한 값의 참조 교체가 불필요한 Context 전파를 만들지 않게 합니다.

## Acceptance Criteria

### workspace-context-contract — 첨부 파일은 폼 인스턴스에 속합니다

첨부 맵은 FormCore가 소유한 동일 객체를 전달하고 Context에서 새로 만들지 않습니다. reset 시 비우는 책임은 [RootNodeContext](../RootNodeContext/DETAIL.md)에 둡니다. context 병합이나 Provider 재렌더가 첨부 파일을 유실시키지 않아야 합니다.

## Last Updated

context 병합 우선순위 또는 첨부 파일 소유 수명이 바뀌면 갱신합니다.
