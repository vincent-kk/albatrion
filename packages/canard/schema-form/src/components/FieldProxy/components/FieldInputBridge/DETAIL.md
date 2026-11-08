# FieldInputBridge

## Requirements

선택된 입력의 DOM 수명을 노드의 값·상호작용·명령 수명에 연결합니다. 입력 초안과 노드 커밋은 다른 수명이므로 입력을 갱신할 때 자식·캐럿·IME·오류 경계 중 무엇을 보존하는지 구분합니다.

## API Contracts

### REACT-033 — 입력 선택과 표현 경계

인라인 입력, 경로 맵, Form 정의, Provider 정의, 플러그인 순으로 선택하며 인라인 null은 fallback 탐색을 막습니다. preferred 입력은 이 선택 대신 사용합니다. 유효 스키마·경로·입력 공급 설정 변경은 선택에 반영하고 동일 원본 컴포넌트는 [입력 해석 어댑터](../../../../helpers/fieldInputDefinition/DETAIL.md)를 재사용합니다. 무관한 맵 변경이 입력 초안을 지우지 않기 위한 정체성 계약입니다.

CONTROLS-081·REACT-032. presentation의 입력 props는 표현 payload로 전달하고 브리지에서 뜻을 재해석하지 않습니다. props 덮어쓰기 순서는 구현이 정하되 노드 신원과 실효 잠금이 임의 표현 props로 바뀌지 않아야 합니다. Hint의 형·초안·nullable·misfit 의미는 [types](../../../../types/DETAIL.md)가 소유하며 객체 시험의 정규화와 잘못된 키 경고는 입력 해석 어댑터가 소유합니다.

`createFieldInputBridge`만 null·undefined를 같은 공유 무동작 함수로 받습니다. 실제 브리지와 FieldInputProps.node는 필수 노드로 작업하여 부재 검사를 사용자 입력에 퍼뜨리지 않습니다.

### REACT-011 — 한 입력의 한 진입

입력 값 쓰기는 내부 입력 출처 통로를 사용하여 타이핑이 자기 입력을 Refresh하지 않게 합니다. 기본 통로는 값·외부 오류 지움·Edited를 하나의 입력 진입으로 처리합니다. 소비자가 onChange를 덮어쓰면 브리지가 그 callback과 외부 오류 지움·Edited를 배치합니다. 사슬 끝 실패가 이미 표시한 상호작용을 빠뜨리지 않게 하기 위한 규칙입니다. 공개 SetValueOption에 입력 출처 비트를 더하지 않습니다.

CONTROLS-083. Form과 노드의 readOnly·disabled는 사용자 값 쓰기를 차단합니다. 표현 props의 잠금 합성과 실제 브리지 진입 검사를 혼동하지 않으며, 공개·자동 쓰기를 UI 잠금으로 거부하지 않습니다. 입력 자체의 제약 집행과 초안 표현은 [fieldInputs](../../../../fieldInputs/DETAIL.md)가 소유합니다.

GOAL-061·WRITE-083. blur는 입력 마침을 알리고 touched를 다음 프레임으로 미룹니다. focus는 예약을 취소하여 포커스 이동 중 오류 깜빡임을 막습니다. blur 때의 상호작용 초기화 번호가 바뀌면 늦은 touched를 버립니다. trim은 엔진의 자동 쓰기 정책을 따르며 blur 자체가 외부 오류를 지우거나 Edited를 세우지 않습니다.

### REACT-024 — 늦은 입력의 수명 검사

입력은 현재 binding의 살아 있는 노드, 활성 선택 토큰, 적용 Refresh 세대를 함께 검사합니다. 마운트된 자식을 가진 컨테이너에는 Refresh 세대 검사를 적용하지 않지만 노드·선택 수명 검사는 유지합니다. 첫 자식 layout 쓰기는 binding 준비 전 Context 루트로 수락합니다. 교체된 루트의 늦은 값·파일 쓰기는 현재 폼을 바꾸지 않습니다.

선택 토큰은 A→B→A에서도 각 선택 수명마다 다릅니다. 선택 어댑터의 insertion effect가 원본 입력 layout cleanup보다 먼저 폐기하여 cleanup에서 호출한 값·파일 callback도 막습니다. 중단된 렌더는 현재 선택을 폐기하지 않습니다. 파일 첨부는 같은 수명 검사를 받고 unmount에서 경로의 첨부 상태를 제거합니다.

### REACT-028 — Refresh와 자식 소유권

Refresh는 실제로 마운트된 자식 프록시가 없는 입력의 원본 컴포넌트만 다시 마운트합니다. 터미널·빈 배열·접힌 입력·값 전체를 편집하는 브랜치도 이 조건을 따릅니다. 자식을 그리는 컨테이너는 입력과 자식 DOM을 보존하므로 값에서 복제한 내부 상태가 남을 수 있습니다. 그런 입력은 구독으로 동기화하거나 명시적 Remount·Form key 교체를 사용합니다. 자식이 필요한 입력을 terminal로 바꾸는 해결은 자식을 없애므로 허용하지 않습니다.

EVENT-039·EVENT-040·EVENT-041. 적용 세대는 원본 입력 key와 defaultValue를 함께 갱신합니다. Refresh는 오류 경계 바깥을 교체하지 않으므로 실패 fallback을 해제하지 않습니다. Remount·Form key 교체는 경계를 포함한 수명을 다시 시작합니다. 원본 입력의 캐럿·선택·포커스는 리마운트에서 사라지며 자동 복원하지 않습니다. 포맷터의 캐럿 복구는 해당 입력의 책임입니다.

### EVENT-065 — 조합과 숨김의 경계

compositionstart부터 compositionend까지 Refresh를 보류하고 중복 요청을 한 번으로 모읍니다. DOM value를 프로그램으로 덮거나 입력을 교체하지 않아 IME 초안을 보존합니다. 노드 revision과 동기 통지는 계속 진행하므로 적용 뒤의 옛 callback은 세대 검사로 버립니다. Refresh가 없던 조합의 완성 텍스트는 정상 입력입니다.

Activity·Suspense의 layout 해제는 조합 보류를 끝냅니다. 끝 이벤트가 오지 않는 숨김 상태에서 복귀할 때 현재 값·세대를 따라잡기 위해서입니다. 자식 소유권 보류는 유지하고 매 attach 직후 스냅숏을 검사합니다. 노드 사건·공개 callback을 재생하지 않습니다. 상태가 바뀌지 않는 연결은 추가 렌더가 없으며 재연결의 개정 확인은 O(1)입니다.

### GOAL-052 — 입력 추적 비용과 명령

값·속성·자식·Refresh는 통합 외부 저장소 스냅숏 하나를 사용하여 동시 마운트의 구독 공백을 막습니다. 보류가 없으면 통합 마스크를 한 번 읽고, 보류 중이면 Refresh 제외 revision과 적용 세대를 합칩니다. 자식 소유권은 렌더·attach·배달 때 갱신하고 자식 layout 정리만으로 스냅숏을 바꾸지 않아 마지막 배열 삭제의 추가 커밋을 막습니다.

focus/select는 지연 프록시의 재발행을 받도록 layout에서 구독합니다. focus는 첫 input·textarea·select·button, select는 첫 input·textarea를 대상으로 하여 앞의 버튼·select가 텍스트 선택을 가로채지 않게 합니다. 입력의 commit 작업은 같은 layout effect를 공유하고, 표시 release와 composition 종료는 useVersion의 안정된 갱신 dispatch를 공유하여 effect를 추가하지 않습니다.

### GOAL-067 — 자식 캐시와 하이드레이션

자식 컴포넌트는 노드 인스턴스로 캐시하고 준비할 때 게이트 여부를 고정하여 훅 구성을 수명 중 바꾸지 않습니다. ChildFields에 전달한 렌더러는 현재 prop을 읽습니다. 캐시는 StrictMode effect 재실행에서 유지되고 실제 훅 인스턴스와 함께 회수합니다.

서버·하이드레이션은 null 매니저 스냅숏으로 같은 자식을 렌더합니다. 기존 입력 commit에서 hydration ref를 표시하여 매니저 활성화만으로 추가 렌더나 사용자 Suspense의 조기 갱신을 만들지 않습니다. 이후 실제 자식 변경은 매니저를 사용하며 클라이언트 전용 마운트는 처음부터 게이트할 수 있습니다. 실제 입력이 commit할 때만 자신의 노드를 노출 기록에 넣어 eager·문턱 미만·hydration 입력도 remount 후 placeholder로 돌아가지 않게 합니다. 숨겨진 프록시나 wrapper 준비만으로는 노출을 기록하지 않습니다.

현재 한계는 다음과 같습니다. hydration 때 준비만 한 탭·아코디언 자식은 나중 첫 렌더에도 비게이트 결정을 재사용합니다. React 18의 아직 hydrate하지 않은 Suspense 경계에 이후 갱신이 들어가면 client rendering으로 전환할 수 있습니다. 렌더 중 공유 Map에 추가한 게이트 결정은 폐기 렌더 뒤에도 남을 수 있고, 제거된 자식 항목은 훅 수명 동안 정리하지 않아 장기 배열에서 캐시가 증가합니다. 상태 보존 Fast Refresh는 캐시의 옛 closure를 재사용할 수 있습니다. 자식 callback·override의 useReference도 렌더 중 공유 ref를 쓰므로 commit-only 격리를 보장하지 않습니다. 자식별 최초 마운트 판정·pruning·개발 세대 교체는 현재 보장이 아닙니다.

### ERROR-202 — 터미널 자식 읽기 경고

자식 없는 입력도 공통 구현을 쓸 수 있으므로 모든 terminal의 빈 ChildFields 읽기를 경고하지 않습니다. 개발 모드의 terminal object·array에만 탐침을 두며 명시적 terminal도 이 조건에 포함됩니다. production과 본래 terminal인 종류는 공유 빈 목록을 받습니다.

첫 색인·length·순회 읽기를 감지하고 commit 전 읽기는 기존 입력 layout marker에서, commit 후 읽기는 microtask에서 보고합니다. 로드별 중복 제거는 [FormErrorContext](../../../../providers/FormErrorContext/DETAIL.md)가 맡습니다. 지연 보고는 읽은 warning scope를 보존하되 root가 교체되면 버립니다. 같은 root reset·실패 rebuild가 새 로드 scope를 시작하면 다시 읽을 수 있고, unmount만으로 마지막 보고기를 없애지는 않습니다. 탐침 자체의 effect를 추가하지 않는 이유는 필드 수에 비례하는 마운트 비용을 막기 위해서입니다.

오류 표시의 이력·release 조건은 [FieldRendererContext](../../../../providers/FieldRendererContext/DETAIL.md)가 소유합니다. 입력은 isPresent와 현재 정책이 적격일 때만 reveal을 읽고 보류 중에만 release 구독자를 둡니다.

useFieldInputControl은 컨테이너 ref·적용 세대·composition 시작/종료 처리와 다섯 번째 stable rerender dispatch와 마지막 stable releaseComposition을 반환하며 표시 release와 composition 종료가 같은 reducer를 재사용한다.

useFieldLifecycle의 cleanup이 안정된 releaseComposition을 호출하므로 입력 제어와 수명 처리가 분리되고 별도 effect는 필요하지 않습니다.

### 라이프사이클 시점

- 위치는 입력 컨테이너가 있는 브리지 인스턴스입니다. 입력이 없어 null을 반환하는 브리지는 시점을 발행하지 않습니다. 유일한 layout effect는 useFieldLifecycle이 소유하며 터미널 자식 커밋, hydration 표시, 노출 기록, 가상화 입력 등록, 명령 구독 뒤 Mount와 Render를 실행합니다. cleanup은 committed를 지우고 조합·구독·입력 등록을 정리한 뒤 Unmount를 실행합니다.
- effect 함수는 같은 의존성으로 useMemo에서 만들며 실행 여부를 그 클로저에 보존합니다. 같은 함수의 StrictMode 재실행·Activity 재표시는 Mount와 Render를 소비하지 않습니다. 숨겨진 동안 의존성이 바뀌면 재표시가 새 Mount입니다. Unmount는 cleanup에서 실행되므로 StrictMode 재실행과 Activity 숨김에도 실행되며 행동은 무시합니다.
- 한 커밋의 Render는 Mount 뒤 한 번입니다. 다른 커밋은 committed이고 Render 예약이 있는 위치에만 감지 컴포넌트를 렌더합니다. 의존성 변경의 mutation cleanup이 committed를 지워 자식 감지기가 Mount보다 먼저 실행하지 못하게 합니다. 감지기 자신의 effect 재실행도 같은 함수 비교로 막습니다.
- 예약만으로 렌더하지 않으며 같은 노드의 여러 위치는 커밋 순서상 먼저 실행한 위치가 큐를 가져갑니다. 한 시점의 행동은 합쳐 컨테이너에 한 번 실행하고 Focus 다음 Select 순서를 지킵니다.
- 오류는 FormRoot의 던지지 않는 보고기로 보내 나머지 예약과 입력 트리를 유지합니다. 큐 의미는 [fieldLifecycle](../../../../helpers/fieldLifecycle/DETAIL.md)의 계약을 따릅니다.
- 빈 경로에도 Context 읽기, effect 메모와 의존성 비교, 안정된 composition 정리 callback 및 비트 확인 비용은 남습니다. effect 함수·committed 셀·재실행 표시는 의존성이 바뀔 때만 새로 만들며 별도의 ref 훅은 두지 않습니다. 메모 팩토리 클로저와 의존성 배열은 렌더마다 평가됩니다. 새 effect·노드 리스너는 없습니다. Render 감지기의 호출과 effect는 해당 노드 예약이 있을 때만 발생합니다. 가상화 입력 Map 쓰기는 마운트·정리에만 있습니다.

## Acceptance Criteria

### live-configuration — 설정 교체 수명

같은 원본을 고르는 설정 변경은 조상 입력도 유지되는 동안 DOM을 보존합니다. 부모 입력 교체는 자식 DOM·미커밋 draft를 재생성하지만 노드 값·상태·외부 오류는 유지합니다. 교체·unmount cleanup의 옛 callback과 A→B→A의 첫 A callback은 쓰지 못합니다.

### field-input-bridge-contract — 관찰 가능한 동작

React 18/19·StrictMode의 hydration은 서버 DOM과 값을 보존하고 hydration 자체의 추가 렌더를 만들지 않습니다. 숨김 중 retained handle 쓰기는 재표시 입력에 반영하되 콜백을 재생하지 않습니다. 입력 중간 삽입·IME는 자기 타이핑으로 리마운트하지 않고, 명시 Refresh는 위 자식·조합 조건을 따릅니다. 가상화 없는 terminal 배열 항목의 라이브러리 layout은 자식 소유권과 입력 commit 두 작업이며, 표시가 같은 일반 쓰기는 추가 layout 작업을 만들지 않습니다.

## Last Updated

입력 선택·초안·Refresh·구독·하이드레이션 또는 오류 표시의 연결 계약이 바뀔 때 갱신합니다.
