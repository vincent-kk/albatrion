# hooks contract

## Requirements

React의 렌더와 엔진의 동기 배달 사이를 연결합니다. 이 계층은 상태를 복제해 소유하지 않으며, 렌더와 구독 사이의 공백이나 숨김 때문에 화면이 과거 상태에 고정되지 않게 합니다.

## API Contracts

useFieldErrors(node)는 해당 노드가 속한 폼 아래에서 원시 errors·errorVisible·errorMessage·가려진 formatError를 읽는 공개 소비자 계약입니다. 입력·틀·라벨·오류 렌더러와 에이전트 예제 테스트가 소비합니다. FieldProxy와 같은 공유 추적 마스크·표시 계산·첫 문구 계산을 사용하고, 반환 네 값이 같으면 객체 참조를 유지합니다. 모든 훅을 조건 없이 호출하며 공개 해제 구독은 표시가 보류된 동안만 연결합니다.

같은 폼의 동기 커밋에서 인자와 추적되는 노드 상태만 읽는 포맷터에 대해 그룹과 표시 값이 같습니다. React 요소 문구는 내용이 같아도 참조가 다를 수 있습니다. transition·hydration 중 노드 사건 없는 공개 해제는 한 커밋 차이 뒤 수동 효과로 맞춰지고, 추적 범위 밖의 값에 의존한 포맷터는 다음 사건까지 다를 수 있습니다. 포맷 실패는 호출한 컴포넌트의 가까운 경계가 잡으며 입력 경계는 포맷터 교체만으로 복구하지 않습니다.

공개 훅과 내부 경로 훅의 구분은 [진입점](index.ts)이 정합니다. 컴포넌트 형을 역방향으로 참조할 때는 type import만 사용하여 런타임 순환을 만들지 않습니다.

### REACT-006 — 사건 재생 없는 따라잡기

`useFieldNodeTracker`는 revision 스냅숏을 읽고 매 연결 직후 다시 검사합니다. 렌더→commit 사이 배달과 Activity 재연결 때의 숨김 배달을 따라잡되 노드 사건을 재생하지 않습니다. 연결당 마스크 개정 읽기는 O(1)이고 같은 스냅숏은 추가 렌더를 만들지 않습니다.

`useFieldNodeSubscribe`의 listener는 연결 후 사건만 받습니다. React state에 노드 상태를 미러링하는 소비자는 `onSubscribe`에서 현재 값을 다시 읽어야 합니다. 그렇지 않으면 구독 전 통지를 영구히 놓칩니다. 렌더에서 getter를 읽는 소비자는 tracker를 사용합니다. 엔진의 동기 쓰기를 transition으로 감싸도 별도 지연 상태 저장소로 바뀌지 않으며, 렌더 중 사용자 쓰기는 React 사용 규칙을 따라야 합니다.

### EVENT-069 — 파생 쓰기와 React effect

파생값은 controls.derived·controls.injectTo 또는 노드 리스너에서 씁니다. effect에서 다시 쓰면 이미 끝난 입력 사슬에 합류하지 않아 첫 출력 뒤에 별도 콜백·검증이 발생할 수 있습니다. 훅이 effect 사이의 순환을 엔진 배치로 합치거나 막아 준다고 약속하지 않습니다. [쓰기 사슬](../core/engine/write/DETAIL.md)의 경계를 유지하고 소비자가 우발적인 이중 저장을 만들지 않게 하기 위한 사용 규칙입니다.

### hooks-nullish — 관찰 부재와 ref 수명

두 관찰 훅은 null·undefined를 구독 없는 상태로 받습니다. tracker의 서버·클라이언트 스냅숏은 0이며 listener와 onSubscribe를 부르지 않습니다. 연결 대상 변경·부재 전환·unmount는 이전 구독을 해제하고 실제 노드에 연결한 때만 필수 subtype으로 catch-up을 실행합니다.

ref 할당은 렌더를 만들지 않습니다. `formRef.current?.node`를 전달한 훅은 소비자의 다음 렌더에서 실제 노드나 교체된 루트를 받습니다. callback ref도 state를 갱신해야 이 연결을 일으킵니다. 핸들의 node 교체가 외부 소비자를 자동 렌더한다는 약속은 없습니다. `useFieldNode`에서 생략한 입력은 루트 선택이므로 이 부재 계약과 다릅니다.

### REACT-012 — 경로와 인스턴스 구독

내부 `useFieldNode`는 경로 입력의 해석 가능한 prefix마다 구조 변경을 관찰합니다. 구조 사건에서 구독을 다시 연결하고 매 attach 직후 재해석하여 숨김 중 바뀐 노드도 포착합니다. wildcard는 첫 매치만 추적합니다. 인스턴스·루트 입력은 해당 대상을 고정하므로 추가 경로 리스너가 없지만 렌더마다 O(1) 스냅숏 훅은 있습니다. 경로 입력은 컨테이너별 리스너와 재탐색 비용을 부담합니다.

### VALUE-044 — 출력 차이 관찰

`isDivergent`를 표시하는 소비자는 루트의 UpdateValue·UpdateState·RequestRefresh와 해당 노드의 UpdatePath에서 다시 읽고, 루트나 노드 교체 시 다시 구독합니다. 같은 출력의 루트 reset도 기준을 바꾸므로 값 사건만 구독하면 놓칩니다. [비교 의미](../core/engine/settle/DETAIL.md)와 [떼어진 참조 수명](../core/surface/DETAIL.md)은 해당 소유자가 정합니다.

### child-error-visibility — 숨겨진 자식의 집계

`useChildFieldErrors`는 raw 오류를 유지하며 집계 자격과 직접 자식 순서의 자격을 각각 반환합니다. 부모·자식 각 노드의 표시 이력을 사용하고 배열 위치 사이에 자격을 이전하지 않습니다. isPresent를 검사하지 않으므로 숨겨진 자식도 집계합니다. 숨김과 비활성의 값을 같은 것으로 다루면 컨테이너가 유효 오류를 잃습니다. 표시 release와 정책은 [FieldRendererContext](../providers/FieldRendererContext/DETAIL.md)가 소유합니다.

구독 중 스냅숏은 O(1) 토큰입니다. 비구독 읽기·연결·정리·보유량은 직접 자식 수 C에 대해 O(C)이며 종료 revision vector 하나를 보존합니다. 같은 저장소의 변화 없는 비구독 렌더 읽기와 재연결은 마지막 구독 토큰을 유지하되 연결 직후 검사하고, node·children·disabled로 새 저장소가 만들어지면 React commit 검사를 사용합니다. 이렇게 해야 숨김 변화는 따라잡으면서 구독 identity 교체만으로 추가 렌더하지 않습니다.

### EVENT-044 — 제출 핸들 위임

`useFormSubmit`은 현재 핸들의 submit을 호출하고 그 거부를 그대로 호출자에게 전달합니다. 훅이 검증·degraded 판정을 재구현하거나 거부를 삼키지 않습니다. 제출 차단과 native submit 보고는 [FormCore](../components/Form/components/FormCore/DETAIL.md)가 소유합니다. pending 구독은 연결 직후 현재 값을 검사하여 숨김 중 시작·완료를 따라잡습니다. 핸들이 없으면 제출은 undefined로 이행하며 pending도 undefined일 수 있습니다.

## Acceptance Criteria

### hooks-gateway — 관문으로만 소비

제품 소비자는 훅 진입점을 사용하며 형 전용 역참조가 런타임 순환을 만들지 않습니다.

### GOAL-057 — 구독 공백 없는 화면

동시 마운트와 StrictMode·Activity 재연결에서 최신 스냅숏을 표시하고 사건·폼 콜백을 재생하지 않습니다. 부재 연결은 아무 사건도 만들지 않으며 실제 노드 연결에는 구독 하나만 남아야 합니다.

## Last Updated

구독 공백·재연결·노드 선택·오류 집계 또는 제출 위임 계약이 바뀔 때 갱신합니다.
