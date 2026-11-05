# VirtualizationManager

## Requirements

폼 단위로 관찰과 대기열을 공유하여 필드마다 observer·스케줄러를 만들지 않습니다. 노출 기록은 DOM 경로와 별개로 유지해 배열 재배치가 마운트 정책을 되돌리지 않게 합니다.

## API Contracts

- 옵션의 의미는 [resolveVirtualizationOptions](../resolveVirtualizationOptions/DETAIL.md)를 따르며 매니저 수명과 섞지 않습니다.
- `markRevealed`는 소비층이 커밋한 노출을 기록하는 통로입니다. 게이트 객체를 준비하거나 placeholder를 등록했다는 이유만으로 호출하지 않습니다. 실제 입력 커밋의 판정은 [FieldInputBridge](../../../components/FieldProxy/components/FieldInputBridge/DETAIL.md)가 소유합니다.
- Placeholder의 경로 연결은 [DeferredFieldProxy](../../../components/FieldProxy/components/DeferredFieldProxy/DETAIL.md), 보고·중복 제거는 [FormErrorContext](../../../providers/FormErrorContext/DETAIL.md)가 소유합니다.

### 렌더 경로와 입력 위치

- `revealPath`는 `markRevealed`와 달리 포커스 경로를 커밋 전에 기록합니다. 물리 조상과 각 object 조상의 다음 경로 노드를 참조하는 가상 그룹을 함께 기록해야 자식 게이트가 한 공개 커밋에 입력을 마운트합니다. 대상이 끝내 마운트되지 않아도 이 기록은 남아 해당 노드가 이후 바로 그려집니다.
- 등록 중이거나 열리는 중인 게이트 중 렌더 경로에 속한 문서 순서상 첫 위치를 선택합니다. 부재 노드나 terminal 조상 아래에는 입력 위치가 없으므로 경로가 없습니다. 막는 게이트가 없으면 기록도 만들지 않습니다.
- 입력 컨테이너는 가상화가 켜진 폼에서만 요소별로 등록합니다. 렌더러 감싸개의 버튼을 실제 입력으로 오인하지 않도록 입력의 layout effect가 등록·해제하며 노드별 마운트 수는 세지 않습니다. 입력 조회는 포커스 요청 때만 등록 수에 비례합니다.
- 공개 추적은 reveal 호출 전에 남깁니다. React 18 legacy root는 그 호출 안에서 커밋할 수 있습니다. 공개 커밋의 settle은 대상 Mount 뒤 같은 게이트 객체의 요청만 끝냅니다. 같은 노드의 다른 렌더 위치가 새 요청을 끝내지 못하도록 노드 동일성으로 대신하지 않습니다. 위치 정리는 microtask 뒤에도 두 등록부에서 사라진 같은 추적만 끝내어 StrictMode 재등록을 보존합니다.
- disconnect는 관찰과 대기 등록만 정리하고 열리는 중인 게이트·공개 추적·입력 컨테이너는 남깁니다. effect 재실행으로 살아 있는 요청을 잃지 않게 하며 입력은 자기 cleanup에서 해제합니다.
- 탐색은 각 조상 수준에서 그 조상의 자식들과 가상 그룹 자식의 구성원을 확인하고, 대기 및 공개 중 게이트를 한 번 훑습니다. 겹치는 가상 그룹의 구성원도 각각 확인하므로 비용에 포함됩니다. 포커스 요청에서만 실행하며 렌더와 값 쓰기에서는 탐색하지 않습니다.

## Acceptance Criteria

### virtualization-manager-contract — 정리 뒤에도 다시 등록할 수 있습니다

등록·해제·disconnect를 멱등하게 유지하고 disconnect 이후 등록을 허용합니다. StrictMode의 effect 재실행을 영구 폐기로 오인해 관찰이나 backfill이 멈추지 않아야 합니다.

### GOAL-066 — 한 번 노출한 노드를 다시 지연하지 않습니다

같은 노드의 노출 기록은 값 변경·스크롤 아웃·배열 인덱스 변경에도 유지합니다. 주소를 기록의 키로 쓰면 이동한 입력이 placeholder로 바뀌어 포커스·선택을 잃습니다. 새 노드는 별개의 수명이며, 기록을 역전시키는 API는 두지 않습니다.

### IR-idle-budget — backfill의 묶음 크기와 화면 기회를 보존합니다

현재의 25개 상한과 잔여 idle 예산 기준을 유지합니다. 개수는 placeholder 노출 횟수이며 각 하위 트리의 작업량이나 React 커밋 시간을 제한하지 않습니다. 더 큰 묶음이 모든 폼의 전체 노출을 줄이지는 않으므로 한 폼의 처리량만 보고 확대하지 않습니다. requestIdleCallback이 없으면 취소 가능한 safe macrotask로 화면 기회를 남깁니다. 폴백의 합성 deadline은 실제 경과 시간의 상한이 아니며, timeout이면 잔여 시간 검사보다 개수 상한이 제한을 맡습니다.

### ERROR-090 — Placeholder를 해석하는 자리에서 한 번 격리합니다

생성자는 Placeholder의 경계 컴포넌트를 한 번 만들고 지연 필드들이 같은 컴포넌트 타입을 공유합니다. 소비 위치마다 다시 감싸면 불필요한 경계가 늘고 재렌더가 입력 수명 변경으로 번질 수 있습니다. helpers의 React·provider 런타임 의존은 이 방어와 전용 보고 훅에 한정합니다.

### IR-no-observer — 관찰 불가를 렌더 실패로 바꾸지 않습니다

IO가 없는 서버는 경고 없이 null 매니저로 전체 렌더링합니다. IO가 없는 브라우저에서 가상화를 요청하면 개발 경고와 함께 같은 경로로 돌아갑니다. SSR은 정상 사용 경로이므로 브라우저 기능 누락 경고의 대상으로 취급하지 않습니다.

## Last Updated

노출 기록의 수명, 자원 정리, idle 예산, 관찰 미지원 처리 또는 Placeholder 경계가 바뀌면 갱신합니다.
