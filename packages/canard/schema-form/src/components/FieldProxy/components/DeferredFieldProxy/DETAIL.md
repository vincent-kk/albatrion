# DeferredFieldProxy

## Requirements

입력이 아직 없는 자리와 실제로 마운트한 입력을 구별합니다. 노출의 단방향 기록은 [VirtualizationManager의 GOAL-066](../../../../helpers/virtualization/VirtualizationManager/DETAIL.md#goal-066--한-번-노출한-노드를-다시-지연하지-않습니다)을 따르며 이 컴포넌트는 DOM 전환과 명령 재실행을 소유합니다.

## API Contracts

- 게이트 선택과 SSR·Suspense 하이드레이션의 준비 시점은 [FieldInputBridge](../FieldInputBridge/DETAIL.md)의 계약입니다. 이 컴포넌트가 렌더 중 매니저를 다시 고르거나 훅 집합을 바꾸지 않습니다.
- Placeholder는 매니저가 소유한 경계 컴포넌트를 사용합니다. 이 자리는 현재 node.path만 경로 문맥에 제공하고, [FormErrorContext](../../../../providers/FormErrorContext/DETAIL.md)의 전용 훅이 렌더 때 보고기를 읽습니다. 여기서 다시 감싸면 경계 수명이 중복됩니다.
- placeholder는 실제 높이를 갖는 관찰 대상입니다. display: contents로 바꾸면 공간 예약과 관찰 대상을 잃으므로 사용자 Placeholder는 wrapper 내부의 장식만 맡습니다.

- 게이트 객체는 위치 수명 동안 한 번 만들고 ref와 effect 등록에서 재사용합니다. effect 정리는 공개 전환에 반응하지 않으며 위치가 사라졌음을 매니저에 알립니다. 정상 공개의 ref 해제를 위치 소멸로 오인하면 자식의 Mount 예약이 취소됩니다.
- 공개 커밋은 노출 기록 뒤 위치 수명의 같은 게이트 객체로 settle을 알리고 기존 보류 명령을 재실행합니다. 같은 노드를 그리는 다른 위치는 이 요청을 끝내지 않습니다. 자식 layout effect가 먼저 실행되어 같은 커밋의 대상 Mount가 예약을 가져갈 수 있습니다. 경로 공개는 Focus 요청을 보내지 않으므로 이 명령 재실행에 섞이지 않습니다.

## Acceptance Criteria

### GOAL-054 — 노출한 커밋에서 명령을 다시 전달합니다

이미 구독 중인 지연 프록시는 focus/select를 보관하고 노출합니다. 새 입력이 자식 layout effect에서 구독한 뒤 같은 커밋의 부모 layout effect가 공개 request로 동기 재실행하여 명령 유실을 막습니다. Refresh는 강제 노출에 넣지 않습니다. 값 교체·초기화의 Refresh가 모든 미노출 필드를 한꺼번에 마운트해서는 안 됩니다.

구독 전에 보낸 명령은 보관하지 않습니다. 새 항목을 push한 같은 batch에서 바로 focus/select하면 프록시의 첫 layout 구독보다 먼저 배달되어 유실될 수 있으므로, 이 계약을 생성 전후의 모든 명령에 대한 재생 보장으로 넓히지 않습니다.

### deferrable-node-proxy-contract — effect 재실행과 주소 변경을 견딥니다

- React 18 StrictMode는 effect를 정리·재실행해도 DOM ref를 다시 부르지 않을 수 있으므로 layout effect에서도 멱등 등록을 복구합니다. ref만 사용하면 관찰과 idle 노출이 멈춥니다. ref 정리는 null 콜백으로 처리하여 React 18과 호환합니다.
- 비참여 노드는 placeholder도 남기지 않습니다. 미노출 상태는 경로 변경을 추적하여 배열 재배치 뒤에도 현재 주소를 표시합니다. DOM 소비자는 data-path와 data-deferred를 함께 보고 실제 입력의 존재를 판정해야 합니다.

### IR-accessibility — 미노출 입력을 완전한 UI로 취급하지 않습니다

placeholder는 aria-hidden 장식이며 실제 입력·라벨 콘텐츠를 대신하지 않습니다. reveal 전에는 해당 필드가 페이지 내 검색·스크린 리더·브라우저 자동완성의 실제 입력 대상에 없습니다. Focus/Select 강제 노출은 위 명령 계약의 범위에서만 제공하며, 브라우저 자동완성이 나중에 새 입력을 다시 탐색하는 품질은 보장하지 않습니다.

Idle backfill은 남은 입력을 점진적으로 만들지만 None은 교차나 명령을 기다립니다. 이 동안의 DOM 제약을 node 값이 완전하다는 이유로 무시하지 않습니다. 기본 활성화 판단은 [옵션 해석](../../../../helpers/virtualization/resolveVirtualizationOptions/DETAIL.md)이 소유합니다.

## Last Updated

명령의 보관·재실행 범위, placeholder의 DOM·접근성 계약, StrictMode 등록 복구 또는 경로 보고 연결이 바뀌면 갱신합니다.
