# DeferrableNodeProxy

## Requirements

가상화 대상은 최초 노출 전까지만 마운트를 지연하며, 노출 이후에는 다시 placeholder로 되돌리지 않습니다.

## API Contracts

- placeholder는 공간을 예약하는 관찰 대상이며 data-path, data-deferred와 aria-hidden을 유지합니다.
- placeholder 등록은 DOM ref와 커밋 효과를 통해 멱등적으로 복구합니다. React 18 StrictMode의 모의 정리는 등록부를 비우지만 DOM ref를 재실행하지 않으므로, 재생되는 layout effect가 관찰 및 idle backfill 등록을 다시 연결합니다(REACT-017, TEST-021).
- 복구는 placeholder마다 layout effect 하나와 멱등 등록 호출 하나를 추가합니다. 등록부·observer·idle pump를 재사용하므로 별도 노드 인덱스나 새 스케줄러는 만들지 않습니다.
- placeholder는 노드의 경로 변경 사건을 추적합니다. 배열 아이템의 identity와 단방향 reveal 기록은 유지하면서, 재인덱싱된 미노출 형제의 data-path를 현재 경로로 갱신합니다(LANDING-087).
- 교차·idle backfill 또는 `request(kind)`의 focus/select 명령으로 즉시 노출합니다. 커밋 후 노출 기록을 남기고 보류한 명령을 `request`로 다시 실행하여 마운트된 입력의 DOM 동작에 연결합니다. 공개 `publish`는 사용하지 않습니다(EVENT-045·063·073, 68C-03).
- 지연 자리도 입력의 자식 프록시 마운트 판정에 포함되며, 그 판정은 Refresh에서 컨테이너 입력의 비값 상태를 유지할지 결정합니다(REACT-028).
- 사용자 Placeholder의 필드 오류 경계는 소유 자리에서 한 번 감싸며 `useReporter`로 렌더 때 폼 보고기를 읽어 fallback과 오류 기록으로 연결합니다(68C-08, ERROR-114–117).

## Acceptance Criteria

### deferrable-node-proxy-contract — 관찰 가능한 동작

- 비활성 노드는 placeholder도 렌더하지 않고, placeholder 제거 시 관찰 등록을 해제합니다.
- 이미 노출된 노드가 다시 연결되어도 노출 기록을 보존하며, refresh 명령만으로 미노출 노드를 모두 마운트하지 않습니다.
- 앞 아이템 삭제 뒤 미노출 placeholder의 이전 경로가 노출된 아이템의 새 경로와 겹치지 않습니다.

## Last Updated

계약 기준: EVENT-045·063·073, REACT-028, 68C-03·08.
