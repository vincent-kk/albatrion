# DeferredFieldProxy

## Requirements

가상화 대상은 처음 노출되기 전까지만 마운트를 미루며, 한 번 노출되면 다시 placeholder로 되돌리지 않습니다.

## API Contracts

- placeholder는 공간을 예약하는 관찰 대상이며 data-path, data-deferred, aria-hidden을 유지합니다.
- placeholder 등록은 DOM ref와 커밋 효과로 멱등하게 복구합니다. React 18 StrictMode가 모의로 실행하는 정리는 등록부를 비우지만 DOM ref는 다시 실행하지 않습니다. 그래서 다시 재생되는 layout effect가 관찰 등록과 idle backfill 등록을 다시 연결합니다(REACT-017, TEST-021).
- 복구를 위해 placeholder마다 layout effect 하나와 멱등 등록 호출 하나를 더합니다. 등록부, observer, idle pump를 재사용하므로 별도의 노드 인덱스나 새 스케줄러는 만들지 않습니다.
- placeholder는 노드의 경로 변경 사건을 추적합니다. 배열 아이템의 identity와 노출 기록(한 방향으로만 바뀝니다)은 유지하고, 인덱스가 다시 매겨진 미노출 형제의 data-path는 현재 경로로 갱신합니다(LANDING-087).
- 교차 관찰, idle backfill, `request(kind)`의 focus/select 명령 중 하나가 일어나면 즉시 노출합니다. 커밋한 뒤 노출 기록을 남기고, 보류해 둔 명령을 `request`로 다시 실행해서 마운트된 입력의 DOM 동작에 연결합니다. 공개 `publish`는 사용하지 않습니다(EVENT-045·063·073, 68C-03).
- 지연된 자리도 입력의 자식 프록시가 마운트되었는지 판정할 때 포함됩니다. 이 판정은 Refresh에서 컨테이너 입력의 비값 상태를 유지할지 결정합니다(REACT-028).
- 사용자 Placeholder의 필드 오류 경계는 그 Placeholder를 소유한 자리에서 한 번만 감쌉니다. `useReporter`로 렌더할 때 폼 보고기를 읽어 fallback과 오류 기록으로 연결합니다(68C-08, ERROR-114–117).

## Acceptance Criteria

### deferrable-node-proxy-contract — 관찰 가능한 동작

- 비활성 노드는 placeholder도 렌더하지 않으며, placeholder를 제거하면 관찰 등록을 해제합니다.
- 이미 노출된 노드가 다시 연결되어도 노출 기록을 보존하고, refresh 명령만으로 미노출 노드를 모두 마운트하지는 않습니다.
- 앞쪽 아이템을 삭제한 뒤에도 미노출 placeholder의 이전 경로가 노출된 아이템의 새 경로와 겹치지 않습니다.

## Last Updated

계약 기준: EVENT-045·063·073, REACT-028, 68C-03·08.
