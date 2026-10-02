# SchemaNode

## Requirements

노드 렌더링의 외부 진입점은 SchemaNodeProxy이며, 입력 처리와 지연 마운트는 내부에서 조합합니다.

## API Contracts

- 비활성 노드는 렌더하지 않습니다. 하위 노드는 전달된 NodeProxy를 통해 같은 렌더 계약을 재사용합니다.
- 마운트된 노드는 data-path로 경로를 노출하며, 노드 구독은 React 생명주기에 맞춰 해제합니다.
- 가상화 reveal 기록은 매니저의 노드 identity 기록을 소비합니다. 한 번 노출된 필드는 배열 재인덱싱으로 placeholder가 되지 않으며 미노출 형제의 placeholder도 현재 경로를 표시합니다(LANDING-087).

## Acceptance Criteria

### schema-node-contract — 관찰 가능한 동작

- enabled가 false인 노드는 입력과 래퍼를 남기지 않습니다.
- 재귀 렌더링에서도 동일한 노드 경로와 렌더러 연결 규칙이 적용됩니다.
- 실제 배열 remove 버튼으로 앞 아이템을 지우면 노출된 아이템의 노드와 입력 DOM identity가 유지되고, 새 경로에 placeholder가 겹치지 않습니다.
- 미노출 형제는 현재 경로의 placeholder로 유지되고 없어진 마지막 경로는 DOM에 남지 않습니다.

## Last Updated

계약 기준: LANDING-087.
