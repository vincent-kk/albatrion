# SchemaNodeProxy

## Requirements

경로나 노드 참조로 찾은 노드를 입력 팩토리와 오류 경계를 갖춘 렌더러에 연결합니다.

## API Contracts

- 재귀 렌더 props는 형제 SchemaNodeProxyProps 계약에서 가져오며 기존 SchemaNodeProxyProps 공개 타입 경로를 유지합니다. 입력 구현은 이 조율 구현을 역참조하지 않습니다.
- 노드가 없거나 비활성이면 null을 반환합니다. 오류 표시가 꺼져 있으면 오류 포맷 함수의 결과를 노출하지 않습니다.
- `UpdateJsonSchema`를 구독하여 유효 스키마가 바뀌면 렌더 props와 입력 선택을 갱신합니다. 프록시 하나가 구독·메모·스냅샷 ref를 소유하며 별도 필드 컴포넌트나 필드별 경로 Provider를 만들지 않습니다(REACT-012, 119라운드, 121C-01 F-A).
- 렌더러 경계는 ErrorBoundary를 직접 씁니다. children이 렌더마다 새 엘리먼트라 memo 비교가 항상 실패하므로 memo로 감싸지 않습니다. 소유 지점에서 한 번 선택한 렌더러가 그 내부에서 errorMessage를 계산합니다. formatError와 렌더러 예외는 원래 오류 identity·현재 path·componentStack·surface sink를 같은 폼 보고기로 전달하고 같은 fallback과 console.error를 유지합니다(ERROR-044·090·114).
- Refresh는 렌더러 경계와 입력 경계의 수명을 유지하고 해당 노드의 원본 입력만 다시 마운트합니다. RequestRemount는 래퍼 key를 바꾸어 경계까지 교체합니다(REACT-019·024, EVENT-039·040, 112C-01).
- 비용: 필드 전체의 Provider·감싸개·경계·분리 컴포넌트를 없애고 오류 메시지 계산을 렌더러 경계 안의 컴포넌트에 둡니다. 필드당 fiber 순감소 목표는 4개이며, 별도 필드 경계 상태와 경로 Provider를 보유하지 않습니다. 쓰기당 렌더와 DOM 반영 지연은 런타임 계수로 비교합니다.
  - 측정값(세션 129e): 필드당 fiber는 평면 24→20, 배열 항목 21→17이고, 쓰기당 렌더·커밋·호스트 갱신·이펙트 수는 같습니다. 마운트 할당은 array-1000에서 8.8 MB 적습니다.
  - 미확인: 쓰기 1회 할당은 한 실행에서 18~56 KB 많았지만 다른 실행에서는 방향이 반대였습니다. 다음 F2 고침부터 쓰기당 할당을 계수에 넣어 지켜봅니다(121C-01 덧붙임, Q131).
- `request(kind)`의 focus·select·refresh·remount 사건을 실행합니다. `RequestRemount`는 래퍼 key를 변경하며, 사용자 override는 노드 식별 정보처럼 덮어쓸 수 없는 필드를 대체하지 않습니다(EVENT-063·073).
- 입력의 자식 프록시 마운트 판정에는 이 프록시와 가상화의 `DeferrableNodeProxy` 자리를 포함합니다. 입력은 실제 자식 프록시 마운트 여부로 Refresh의 다시 마운트를 가릅니다(REACT-028).

## Acceptance Criteria

### schema-node-proxy-contract — 관찰 가능한 동작

- 렌더러와 formatError 예외는 같은 경로와 폼 보고기로 한 번 전달되고, 형제 필드는 유지됩니다.
- 오류 표시 조건이 거짓이면 기존 오류가 있어도 오류 메시지를 렌더러에 표시하지 않습니다.
- 제어·비제어 입력의 필드당 fiber와 쓰기당 렌더 수가 같고, 형제·부모의 쓰기는 변경되지 않은 필드를 렌더하지 않습니다.
- Refresh 뒤 경계 identity는 같고 해당 입력 identity만 바뀝니다. 실패한 경계는 Refresh로 복구되지 않습니다.

## Last Updated

2026-10-09 — 121C-01 F-A(Q131 채택), 125C-01 F-A', ERROR-044·090·114, REACT-012·019·024·028, EVENT-039·040·063·073, 112C-01.
