# WorkspaceContext

## Requirements

첨부 저장소는 공개 Map identity를 유지하면서 브리지 소유 토큰과 노드별 파일을 보유합니다. 경로 이동은 한 번의 전체 투영으로 정리하며 같은 경로의 다른 렌더 위치를 해제해도 살아 있는 소유자의 파일을 지우지 않습니다. clear는 소유 기록도 비워 reset 뒤 재투영으로 파일이 부활하지 않게 합니다.

폼별 첨부 파일 맵과 사용자 context를 공급합니다. 노드 값·오류를 여기에 저장하지 않아 엔진과 React의 이중 상태 소유를 막습니다.

## API Contracts

라벨의 htmlFor·id와 aria 연결은 native form owner와 무관하게 문서 전체에서 해석합니다. 서로 다른 Form이 각자 native form 요소를 가지더라도 같은 id를 재사용하면 연결 대상이 충돌하므로 모든 Form에 고유 scope를 적용합니다. 포털의 입력은 자기 wrapper 밖에서 같은 native form owner를 공유하거나 owner가 없을 수도 있으므로 native form 경계만으로 id·radio name 충돌을 해결하지 않습니다.

폼별 DOM 식별 범위는 Form마다 한 번의 useId로 생성하고 중앙 경로 어휘의 formatSegment로 tilde와 slash를 이스케이프하여 context에 보유합니다. 애플리케이션의 identifierPrefix에 ~2가 있어도 scope에 파생 식별자 구분자가 유입되지 않게 하는 가역 변환입니다. 서버와 클라이언트는 같은 트리와 `identifierPrefix`를 사용합니다. 독립적인 서버 렌더링 루트와 별도 `react-dom` 사본으로 같은 문서에 Form을 렌더링하는 루트는 호스트가 서로 다른 접두사를 지정합니다. 별도 번들 앱, 마이크로 프런트엔드, 위젯의 렌더러는 각각 `useId`를 같은 값에서 시작하므로 접두사가 충돌하면 한 앱의 라벨 클릭이 다른 앱의 입력에 작용할 수 있습니다. 범위는 데이터 경로와 분리하여 같은 경로의 여러 Form이 레이블·선택 그룹을 공유하지 않게 합니다.

FormCore가 외부 기본 context를 공급하고 WorkspaceContext가 그 위에 Form context를 합칩니다. 입력이 생성되기 전에 context를 조립하며 원래 딕셔너리는 수정하지 않습니다. [context 비교 계약](../DETAIL.md)에 따른 안정화로 동등한 값의 참조 교체가 불필요한 Context 전파를 만들지 않게 합니다.

[FormCore](../../components/Form/components/FormCore/DETAIL.md)가 소유한 실제 입력 위치 맵을 바꾸지 않고 전달합니다. [위치 키](../../helpers/focusTarget/DETAIL.md)와 [등록 수명](../../components/FieldProxy/components/FieldInputBridge/DETAIL.md#goal-052--입력-추적-비용과-명령)은 각 소유자의 계약을 따릅니다.

## Acceptance Criteria

### workspace-context-contract — 첨부 파일은 폼 인스턴스에 속합니다

첨부 맵은 FormCore가 소유한 동일 객체를 전달하고 Context에서 새로 만들지 않습니다. reset 시 비우는 책임은 [RootNodeContext](../RootNodeContext/DETAIL.md)에 둡니다. context 병합이나 Provider 재렌더가 첨부 파일을 유실시키지 않아야 합니다.

## Last Updated

context 병합 우선순위 또는 첨부 파일 소유 수명이 바뀌면 갱신합니다.
