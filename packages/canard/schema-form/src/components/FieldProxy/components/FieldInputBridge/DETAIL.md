# FieldInputBridge

## Requirements

입력 시험이 읽는 misfit·required는 노드 identity가 같아도 다시 평가합니다. 렌더마다 원시 힌트 둘을 읽어 메모 키에 넣으며, 동일 원본 입력 어댑터의 identity는 유지하여 선택 재검사가 무관한 DOM 교체를 만들지 않게 합니다.

선택된 입력의 DOM 수명을 노드의 값·상호작용·명령 수명에 연결합니다. 입력 초안과 노드 커밋은 다른 수명이므로 입력을 갱신할 때 자식·캐럿·IME·오류 경계 중 무엇을 보존하는지 구분합니다.

## API Contracts

InputRenderer는 전용 폼 Context의 Form prop, 자기 위치의 가장 가까운 좁은 외부 Context, 플러그인 순으로 선택합니다. 실제 입력의 컨테이너를 children으로 정확히 한 번 같은 커밋에 감싸고 미등록이면 기존 컨테이너만 렌더합니다. 직접 Input의 unwrapped만 틀을 건너뛰고, 부모 자식 덮어쓰기나 스키마 입력 props의 같은 키는 실제 입력으로 그대로 전달합니다. 틀에도 실제 입력과 같은 required·readOnly·disabled·context를 전달합니다.

틀은 children을 같은 커밋에 정확히 한 번 조건 없이 그립니다. 틀 루트와 children 사이의 요소·컴포넌트 경로 변경, 틀 identity 변경, 묶인 unwrapped 전환으로 컨테이너가 교체되면 입력 수명도 새로 시작합니다. 원본 입력을 만드는 어댑터가 현재 노드 값을 defaultValue로 잡으며 포커스와 진행 중인 조합은 사라집니다. 컨테이너 callback ref가 커밋된 위치의 교체를 감지하여 조합 보류를 풀고 가상화 등록을 새 요소로 옮깁니다. 위치 epoch와 실제 입력 선택으로 만든 토큰을 갱신하여 옛 값·파일·blur 처리를 무효화하며 토큰 갱신 자체는 원본 입력을 다시 마운트하지 않습니다. 브리지 인스턴스와 자기 첨부 파일은 유지하지만 가지 입력의 자식 브리지는 다시 마운트되어 그 자식 첨부 기록은 정리됩니다.

실제 입력에는 오류 목록과 표시 여부를 기본 전달하지 않습니다. 입력은 오류 설정 전체와 외부 설정 전체를 읽지 않고 외부 입력 정의만 읽으므로 오류나 인라인 포맷터 변경에 다시 렌더하지 않습니다. 바인딩은 값·제어 속성·스키마·경로·자식 변경과 적용 가능한 Refresh로 렌더합니다. 상태나 오류만 전달되고 적용 세대가 현재 controlled 선언의 세대를 따라잡았다면 통지를 마칩니다. 뒤처졌다면 추적 사건과 같은 외부 저장소 통지 경로에서 자식·조합 보류 비트를 갱신하여 보류된 Refresh만 적용합니다. 사건 비트를 먼저 검사하고 필요한 경우에만 세대를 읽습니다. 별도 기본 lane dispatch를 더하지 않아 React 18의 같은 task에 Refresh와 오류가 이어져도 중복 렌더를 만들지 않습니다. 표시·문구가 필요한 입력은 useFieldErrors를 사용하고, 그룹의 상태 기반 오류 표시는 바깥 렌더러 추적이 소유합니다.

값과 defaultValue는 노드가 소유합니다. 렌더러와 입력의 공통 required는 Child·Form.Input·Form.Render·Form.Field의 불리언 덮어쓰기, 불리언 `presentation.required`, `node.isRequired` 순으로 결정합니다. false도 존중하고 불리언이 아닐 때만 다음 값으로 넘어갑니다. 부모만 변경되어도 두 표면에 전달되며 undefined로 돌아가면 presentation 또는 노드 값을 다시 사용합니다. `presentation.FieldInputProps.required`와 `presentation.FieldRendererProps.required`는 바인딩이 spread 뒤에서 덮으므로 영향을 주지 않습니다. 렌더러 작성자가 Input 요소에 주는 불리언 required는 해당 입력에만 우선 적용되며 undefined를 포함한 비불리언 값은 부모 값을 지우지 않고 공통 값으로 돌아갑니다. 표시 전용 해석이며 검증과 입력 선택 힌트는 스키마의 required만 따릅니다. 네이티브 요소에 required를 전달하는 입력은 브라우저 검증에 영향을 줄 수 있습니다. 공통 계산은 FieldProxy의 utils가 소유하고 브리지와 생성 팩토리가 직접 사용합니다. 부모의 공통 값 변경이 렌더러 props를 바꾸므로 별도의 Context·구독·effect·전달 채널 없이 기존 메모 경계로 전달됩니다.

### REACT-033 — 입력 선택과 표현 경계

인라인 입력, 경로 맵, Form 정의, Provider 정의, 플러그인 순으로 선택하며 인라인 null은 fallback 탐색을 막습니다. preferred 입력은 이 선택 대신 사용합니다. 유효 스키마·경로·입력 공급 설정 변경은 선택에 반영하고 동일 원본 컴포넌트는 [입력 해석 어댑터](../../../../helpers/fieldInputDefinition/DETAIL.md)를 재사용합니다. 무관한 맵 변경이 입력 초안을 지우지 않기 위한 정체성 계약입니다.

CONTROLS-081·REACT-032. presentation의 입력 props는 표현 payload로 전달하고 브리지에서 뜻을 재해석하지 않습니다. props 덮어쓰기 순서는 구현이 정하되 노드 신원과 실효 잠금이 임의 표현 props로 바뀌지 않아야 합니다. Hint의 형·초안·nullable·misfit 의미는 [types](../../../../types/DETAIL.md)가 소유하며 객체 시험의 정규화와 잘못된 키 경고는 입력 해석 어댑터가 소유합니다.

`createFieldInputBridge`만 null·undefined를 같은 공유 무동작 함수로 받습니다. 실제 브리지와 FieldInputProps.node는 필수 노드로 작업하여 부재 검사를 사용자 입력에 퍼뜨리지 않습니다.

### REACT-011 — 한 입력의 한 진입

`onChange`와 `onFileAttach`는 바인딩이 소유하여 레이아웃 덮어쓰기가 값 저장·상호작용·파일 등록을 우회하지 못하게 합니다. 중계 콜백은 하이브리드 부모의 Child와 렌더러의 Input에서만 받습니다.

입력 값 쓰기는 내부 입력 출처 통로를 사용하여 타이핑이 자기 입력을 Refresh하지 않게 합니다. 기본 통로는 값·외부 오류 지움·Edited를 하나의 입력 진입으로 처리합니다. 하이브리드 부모의 `<Child onChange>` 또는 렌더러의 `<Input onChange>`가 중계 콜백을 제공하면 브리지는 입력 중계 통로에 callback을 전달하여 값 기록과 외부 오류 지움·Edited를 같은 배치로 처리합니다. 사슬 끝 실패가 이미 표시한 상호작용을 빠뜨리지 않게 하기 위한 규칙입니다. 공개 SetValueOption에 입력 출처 비트를 더하지 않습니다.

값·파일 callback은 자식 자신의 prop을 우선하고, 없으면 호출 시점의 부모 ref를 읽습니다. 부모의 재렌더만으로 메모된 형제 브리지가 다시 렌더된다고 가정하면 옛 클로저가 형제의 편집을 덮거나 첨부를 오래된 상태로 처리합니다. 자식 prop을 제거하면 현재 부모 callback으로 돌아가며, 부모 ref의 값을 브리지 렌더 시점에 복사하지 않습니다. 안정된 ref를 전달하므로 렌더마다 훅이나 할당을 추가하지 않습니다.

CONTROLS-083. Form과 노드의 readOnly·disabled는 사용자 값 쓰기를 차단합니다. 표현 props의 잠금 합성과 실제 브리지 진입 검사를 혼동하지 않으며, 공개·자동 쓰기를 UI 잠금으로 거부하지 않습니다. 입력 자체의 제약 집행과 초안 표현은 [fieldInputs](../../../../fieldInputs/DETAIL.md)가 소유합니다.

GOAL-061·WRITE-083. blur는 입력 마침을 알리고 touched를 다음 프레임으로 미룹니다. focus는 예약을 취소하여 포커스 이동 중 오류 깜빡임을 막습니다. blur 때의 상호작용 초기화 번호가 바뀌면 늦은 touched를 버립니다. trim은 엔진의 자동 쓰기 정책을 따르며 blur 자체가 외부 오류를 지우거나 Edited를 세우지 않습니다.

### REACT-024 — 늦은 입력의 수명 검사

입력은 현재 binding의 살아 있는 노드, 활성 선택 토큰, 적용 Refresh 세대를 함께 검사합니다. 마운트된 자식을 가진 컨테이너에는 Refresh 세대 검사를 적용하지 않지만 노드·선택 수명 검사는 유지합니다. 첫 자식 layout 쓰기는 binding 준비 전 Context 루트로 수락합니다. 교체된 루트의 늦은 값·파일 쓰기는 현재 폼을 바꾸지 않습니다.

선택 토큰은 A→B→A에서도 각 선택 수명마다 다릅니다. 선택 어댑터의 insertion effect가 원본 입력 layout cleanup보다 먼저 폐기하여 cleanup에서 호출한 값·파일 callback도 막습니다. 중단된 렌더는 현재 선택을 폐기하지 않습니다. 파일 첨부는 같은 수명 검사를 받고 unmount에서 경로의 첨부 상태를 제거합니다.

### REACT-028 — Refresh와 자식 소유권

Refresh는 실제로 마운트된 자식 프록시가 없는 입력의 원본 컴포넌트만 다시 마운트합니다. 터미널·빈 배열·접힌 입력·값 전체를 편집하는 브랜치도 이 조건을 따릅니다. 자식을 그리는 컨테이너는 입력과 자식 DOM을 보존하므로 값에서 복제한 내부 상태가 남을 수 있습니다. 그런 입력은 구독으로 동기화하거나 명시적 Remount·Form key 교체를 사용합니다. 자식이 필요한 입력을 terminal로 바꾸는 해결은 자식을 없애므로 허용하지 않습니다.

EVENT-039·EVENT-040·EVENT-041. 적용 세대는 원본 입력 key와 defaultValue를 함께 갱신합니다. Refresh는 오류 경계 바깥을 교체하지 않으므로 실패 fallback을 해제하지 않습니다. Remount·Form key 교체는 경계를 포함한 수명을 다시 시작합니다. 원본 입력의 캐럿·선택·포커스는 리마운트에서 사라지며 자동 복원하지 않습니다. 포맷터의 캐럿 복구는 해당 입력의 책임입니다.

### 값 선언과 적용 세대

`controlled: true`는 입력이 매 렌더의 value만으로 그리고 값의 사본을 두지 않는다는 선언입니다. 그런 입력은 Refresh로 교체할 이유가 없으므로 적용 세대를 상수로 읽어 DOM·포커스·내부 상태를 유지하고, 값은 value로 받습니다. 선언이 없거나 false인 입력은 Refresh revision을 세대로 읽어 교체됩니다. 재마운트가 기본인 이유는 defaultValue를 읽는 입력이 선언 없이도 값을 잃지 않게 하기 위해서이며, 제어 선언은 마운트 비용을 없애는 최적화입니다.

정의의 선언과 유효 스키마의 `presentation.controlled`를 결합하며 하나라도 false면 false가 이깁니다. 정의가 제어로 선언한 입력을 스키마가 필드 단위로 끌 수 있게 합니다. preferred·인라인·경로 맵 입력에는 정의 선언이 없으므로 스키마 선언만 따릅니다.

제어 입력은 교체되지 않으므로 적용 세대 검사가 늦은 callback을 막지 않으며, 노드·선택 수명 검사와 명시적 Remount는 그대로 적용됩니다. 값에서 복제한 내부 상태를 가진 입력에 제어를 선언하면 리셋 뒤에도 그 상태가 남습니다.

렌더·조합 종료·callback 수락은 같은 세대 읽기 함수를 사용하고, 보류가 없는 스냅숏은 그 세대에 맞는 revision 마스크를 읽으므로 함께 바뀌어야 합니다. 하나라도 다른 값을 읽으면 세대 검사가 어긋나 정상 입력을 버립니다. 선언이 마운트 중에 바뀌어 세대가 달라지면 원본 입력을 한 번 다시 마운트합니다.

### EVENT-065 — 조합과 숨김의 경계

compositionstart부터 compositionend까지 Refresh를 보류하고 중복 요청을 한 번으로 모읍니다. DOM value를 프로그램으로 덮거나 입력을 교체하지 않아 IME 초안을 보존합니다. 노드 revision과 동기 통지는 계속 진행하므로 적용 뒤의 옛 callback은 세대 검사로 버립니다. Refresh가 없던 조합의 완성 텍스트는 정상 입력입니다.

Activity·Suspense의 layout 해제는 조합 보류를 끝냅니다. 끝 이벤트가 오지 않는 숨김 상태에서 복귀할 때 현재 값·세대를 따라잡기 위해서입니다. 자식 소유권 보류는 유지하고 매 attach 직후 스냅숏을 검사합니다. 노드 사건·공개 callback을 재생하지 않습니다. 상태가 바뀌지 않는 연결은 추가 렌더가 없으며 재연결의 개정 확인은 O(1)입니다.

### GOAL-052 — 입력 추적 비용과 명령

값·속성·자식·Refresh는 통합 외부 저장소 스냅숏 하나를 사용하여 동시 마운트의 구독 공백을 막습니다. 보류가 없으면 통합 마스크를 한 번 읽고, 보류 중이면 Refresh 제외 revision과 적용 세대를 합칩니다. 자식 소유권은 렌더·attach·배달 때 갱신하고 자식 layout 정리만으로 스냅숏을 바꾸지 않아 마지막 배열 삭제의 추가 커밋을 막습니다.

렌더가 직접 읽는 Refresh revision은 초기 세대와 적용 세대에 공유하여 렌더당 중복 조회를 피합니다. 이 호출 한정 값은 구독의 스냅숏 확인을 대체하지 않으므로 렌더와 attach 사이 변경 및 Activity 재연결을 계속 따라잡습니다.

focus/select는 지연 프록시의 재발행을 받도록 layout에서 구독합니다. focus는 문서 순서상 첫 `[data-focus-target]`·input·textarea·select·button, select는 첫 input·textarea를 대상으로 하여 앞의 버튼·select가 텍스트 선택을 가로채지 않게 합니다. 입력의 commit 작업은 같은 layout effect를 공유하고, 컨테이너 교체와 composition 종료는 useVersion의 안정된 갱신 dispatch를 공유하여 effect를 추가하지 않습니다.

### GOAL-067 — 자식 캐시와 하이드레이션

자식 컴포넌트는 노드 인스턴스로 캐시하고 준비할 때 게이트 컴포넌트의 사용 여부를 고정하여 훅 구성을 수명 중 바꾸지 않습니다. 준비된 대기 gate는 옵션 revision을 구독하여 새 threshold·eagerCount를 읽으며 ChildComponent identity는 유지합니다. ChildFields에 전달한 렌더러는 현재 prop을 읽습니다. 캐시는 StrictMode effect 재실행에서 유지되고 실제 훅 인스턴스와 함께 회수합니다.

서버·하이드레이션은 null 매니저 스냅숏으로 같은 자식을 렌더합니다. 기존 입력 commit에서 hydration ref를 표시하여 매니저 활성화만으로 추가 렌더나 사용자 Suspense의 조기 갱신을 만들지 않습니다. 이후 실제 자식 변경은 매니저를 사용하며 클라이언트 전용 마운트는 처음부터 게이트할 수 있습니다. 가상화 비활성 동안에도 실제 입력이 commit할 때만 자신의 노드를 노출 기록에 넣어 eager·문턱 미만·hydration 입력도 remount 후 placeholder로 돌아가지 않게 합니다. 숨겨진 프록시나 wrapper 준비만으로는 노출을 기록하지 않습니다.

현재 한계는 다음과 같습니다. hydration 때 준비만 한 탭·아코디언 자식은 나중 첫 렌더에도 비게이트 결정을 재사용합니다. React 18의 아직 hydrate하지 않은 Suspense 경계에 이후 갱신이 들어가면 client rendering으로 전환할 수 있습니다. 렌더 중 공유 Map에 추가한 게이트 결정은 폐기 렌더 뒤에도 남을 수 있고, 제거된 자식 항목은 훅 수명 동안 정리하지 않아 장기 배열에서 캐시가 증가합니다. 상태 보존 Fast Refresh는 캐시의 옛 closure를 재사용할 수 있습니다. 자식 callback·override의 useReference도 렌더 중 공유 ref를 쓰므로 commit-only 격리를 보장하지 않습니다. 자식별 최초 마운트 판정·pruning·개발 세대 교체는 현재 보장이 아닙니다.

### ERROR-202 — 터미널 자식 읽기 경고

자식 없는 입력도 공통 구현을 쓸 수 있으므로 모든 terminal의 빈 ChildFields 읽기를 경고하지 않습니다. 개발 모드의 terminal object·array에만 탐침을 두며 명시적 terminal도 이 조건에 포함됩니다. production과 본래 terminal인 종류는 공유 빈 목록을 받습니다.

첫 색인·length·순회 읽기를 감지하고 commit 전 읽기는 기존 입력 layout marker에서, commit 후 읽기는 microtask에서 보고합니다. 로드별 중복 제거는 [FormErrorContext](../../../../providers/FormErrorContext/DETAIL.md)가 맡습니다. 지연 보고는 읽은 warning scope를 보존하되 root가 교체되면 버립니다. 같은 root reset·실패 rebuild가 새 로드 scope를 시작하면 다시 읽을 수 있고, unmount만으로 마지막 보고기를 없애지는 않습니다. 탐침 자체의 effect를 추가하지 않는 이유는 필드 수에 비례하는 마운트 비용을 막기 위해서입니다.

오류 표시의 이력·release 조건은 [FieldRendererContext](../../../../providers/FieldRendererContext/DETAIL.md)가 소유합니다. 오류를 요청한 useFieldErrors 소비자의 표시·구독 계약은 [hooks](../../../../hooks/DETAIL.md)를 따릅니다.

useFieldInputControl은 컨테이너 ref·적용 세대·composition 시작/종료 처리와 다섯 번째 stable rerender dispatch와 마지막 stable releaseComposition을 반환하며 컨테이너 교체와 composition 종료가 같은 reducer를 재사용합니다.

useFieldLifecycle의 cleanup이 안정된 releaseComposition을 호출하므로 입력 제어와 수명 처리가 분리되고 별도 effect는 필요하지 않습니다. 조합 보류 셀과 정리 함수는 같은 입력 인스턴스에 보존합니다. 항상 참인 셀을 만드는 모듈 수준 팩토리를 기존 ref 기반 캐시로 한 번 평가하여, 매 렌더의 정리 콜백 할당과 별도 callback 훅·의존성 배열을 만들지 않습니다.

### 라이프사이클 시점

- 위치는 입력 컨테이너가 있는 브리지 인스턴스입니다. 입력이 없어 null을 반환하는 브리지는 시점을 발행하지 않습니다. 유일한 layout effect는 useFieldLifecycle이 소유하며 터미널 자식 커밋, hydration 표시, 노출 기록, 가상화 입력 등록, 명령 구독 뒤 Mount와 Render를 실행합니다. callback ref는 기존 메모 안에서 한 번 만들고 ref 객체를 최신 컨테이너로 유지합니다. 첫 effect 전, null, 같은 등록 요소의 StrictMode 재연결은 교체로 세지 않습니다. cleanup은 committed를 지우고 조합·구독·현재 등록 요소를 정리한 뒤 Unmount를 실행합니다.
- effect 함수는 같은 의존성으로 useMemo에서 만들며 실행 여부를 그 클로저에 보존합니다. 같은 함수의 StrictMode 재실행·Activity 재표시는 Mount와 Render를 소비하지 않습니다. 이 재실행 방지는 React 18·19의 해당 재연결 경로처럼 의존성이 같은 동안 React가 메모된 effect를 유지한다는 전제에 의존하며, 향후 React가 이를 폐기하면 실행 여부도 초기화되어 StrictMode 재실행·Activity 재표시에서 Mount와 Render 예약을 다시 소비할 수 있습니다. 숨겨진 동안 의존성이 바뀌면 재표시가 새 Mount입니다. Unmount는 cleanup에서 실행되므로 StrictMode 재실행과 Activity 숨김에도 실행되며 행동은 무시합니다.
- 한 커밋의 Render는 Mount 뒤 한 번입니다. 다른 커밋은 committed이고 Render 예약이 있는 위치에만 감지 컴포넌트를 렌더합니다. 의존성 변경의 mutation cleanup이 committed를 지워 자식 감지기가 Mount보다 먼저 실행하지 못하게 합니다. 감지기 자신의 effect 재실행도 같은 함수 비교로 막습니다.
- 예약만으로 렌더하지 않으며 같은 노드의 여러 위치는 커밋 순서상 먼저 실행한 위치가 큐를 가져갑니다. 한 시점의 행동은 합쳐 컨테이너에 한 번 실행하고 Focus 다음 Select 순서를 지킵니다.
- 오류는 FormRoot의 던지지 않는 보고기로 보내 나머지 예약과 입력 트리를 유지합니다. 큐 의미는 [fieldLifecycle](../../../../helpers/fieldLifecycle/DETAIL.md)의 계약을 따릅니다.
- 빈 경로에도 Context 읽기, effect 메모와 의존성 비교, composition 보류 셀의 ref 읽기 및 비트 확인 비용은 남습니다. effect 함수·committed 셀·재실행 표시·컨테이너 callback ref·위치 epoch는 의존성이 바뀔 때만 새로 만들며 별도의 ref 훅은 두지 않습니다. 메모 팩토리 클로저와 의존성 배열은 렌더마다 평가됩니다. 새 effect·노드 리스너는 없습니다. Render 감지기의 호출과 effect는 해당 노드 예약이 있을 때만 발생합니다. 가상화 입력 Map 쓰기는 마운트·정리·실제 컨테이너 교체에만 있습니다.

## Acceptance Criteria

### live-configuration — 설정 교체 수명

같은 원본을 고르는 설정 변경은 조상 입력도 유지되는 동안 DOM을 보존합니다. 부모 입력 교체는 자식 DOM·미커밋 draft를 재생성하지만 노드 값·상태·외부 오류는 유지합니다. 교체·unmount cleanup의 옛 callback과 A→B→A의 첫 A callback은 쓰지 못합니다.

### field-input-bridge-contract — 관찰 가능한 동작

React 18/19·StrictMode의 hydration은 서버 DOM과 값을 보존하고 hydration 자체의 추가 렌더를 만들지 않습니다. 숨김 중 retained handle 쓰기는 재표시 입력에 반영하되 콜백을 재생하지 않습니다. 입력 중간 삽입·IME는 자기 타이핑으로 리마운트하지 않고, 명시 Refresh는 위 자식·조합 조건을 따릅니다. 가상화 없는 terminal 배열 항목의 라이브러리 layout은 자식 소유권과 입력 commit 두 작업이며, 표시가 같은 일반 쓰기는 추가 layout 작업을 만들지 않습니다.

### controlled-declaration — 제어 선언

`controlled: true`인 입력은 호출자 쓰기·리셋·refresh·파생에서 DOM을 유지한 채 새 value를 받고 명시적 Remount에서만 교체됩니다. 선언 없는 입력은 같은 쓰기에서 교체됩니다. 정의와 스키마의 선언이 다르면 false가 이깁니다.

### hybrid-parent-control — 부모가 쓰는 자식 입력의 유지

자식 자신의 onChange prop을 우선하고 없으면 부모 callback ref의 현재 값을 호출합니다. 덮어쓴 콜백은 함수 갱신자 대신 호출 자리에서 한 번 평가한 값을 받습니다. 동기 부모 쓰기가 자식의 마지막 전달 값을 같은 경로에 그대로 커밋하면 해당 입력의 Refresh를 생략하여 DOM·포커스·조합을 유지합니다. 형제 쓰기의 Refresh는 유지합니다.

비동기 콜백의 후속 쓰기와 값을 변형하는 부모는 Refresh를 발생시킵니다. 객체·배열의 사본은 구조가 같아도 배달 값의 참조 동일성 규칙을 만족하지 않아 Refresh를 받습니다. 부모가 입력을 거절하여 아무것도 쓰지 않으면 노드 값은 그대로이며 선언 없는 입력에는 타이핑한 초안이 남습니다. 다음 독립 쓰기·reset에는 중계 기록을 재사용하지 않습니다. 부모가 이후 렌더에서 onChange를 제거하고 자식 자신의 callback도 없으면 입력은 현재 노드에 직접 쓰며 제거된 부모 callback을 호출하지 않습니다.

## Last Updated

입력 선택·값 선언·초안·Refresh·구독·하이드레이션 또는 오류 표시의 연결 계약이 바뀔 때 갱신합니다.
