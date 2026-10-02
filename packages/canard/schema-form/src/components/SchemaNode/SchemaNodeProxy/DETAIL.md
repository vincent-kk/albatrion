# SchemaNodeProxy

## Requirements

경로나 노드 참조로 찾은 노드를 입력 팩토리와 오류 경계를 갖춘 렌더러에 연결합니다.

## API Contracts

- 재귀 렌더 props는 형제 SchemaNodeProxyProps 계약에서 가져오며 기존 SchemaNodeProxyProps 공개 타입 경로를 유지합니다. 입력 구현은 이 조율 구현을 역참조하지 않습니다.
- 노드가 없거나 비활성이면 null을 반환합니다. 오류 표시가 꺼져 있으면 오류 포맷 함수의 결과를 노출하지 않습니다.
- `UpdateJsonSchema`를 구독하여 유효 스키마가 바뀌면 렌더 props와 입력 선택을 갱신합니다. 렌더러는 `FormTypeGroupRenderer` 계약을 따르고, 소유 지점에서 한 번 감싼 필드 경계가 `useReporter`로 렌더 때 보고기를 읽습니다(REACT-012, LANDING-067, 68C-08).
- `request(kind)`의 focus·select·refresh·remount 사건을 실행합니다. `RequestRemount`는 래퍼 key를 변경하며, 사용자 override는 노드 식별 정보처럼 덮어쓸 수 없는 필드를 대체하지 않습니다(EVENT-063·073).
- 입력의 자식 프록시 마운트 판정에는 이 프록시와 가상화의 `DeferrableNodeProxy` 자리를 포함합니다. 입력은 실제 자식 프록시 마운트 여부로 Refresh의 다시 마운트를 가릅니다(REACT-028).

## Acceptance Criteria

### schema-node-proxy-contract — 관찰 가능한 동작

- 렌더러 예외는 오류 경계 안에서 처리됩니다.
- 오류 표시 조건이 거짓이면 기존 오류가 있어도 오류 메시지를 렌더러에 표시하지 않습니다.

## Last Updated

계약 기준: REACT-012·028, EVENT-063·073, LANDING-067, 68C-08.
