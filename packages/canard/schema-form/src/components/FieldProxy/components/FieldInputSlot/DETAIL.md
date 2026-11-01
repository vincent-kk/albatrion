# FieldInputSlot

## Requirements

선택된 입력 컴포넌트를 노드의 값, 상태, 명령 체계에 연결합니다.

## API Contracts

- H: 오류는 현재 적격이며 마지막 release 이후 모든 state·enabled·커밋 정책 조합에서 계속 적격일 때만 표시한다. 잠깐이라도 부적격이면 다음 release를 기다리며 숨김은 즉시다. release는 pending true→false 정착, 조용한 post-paint drop, 수락한 explicit root 판정, 폐기다. pending이 없어도 새 표시는 약2프레임 뒤 release에서 나타난다. OnChange가 아니면 live 조건만 사용한다.
- input도 renderer와 동일한 순수 이력 조건을 사용하며 enabled/live가 거짓이면 reveal을 읽지 않는다. held일 때만 동일 렌더 release version으로 passive 구독자를 기존 FieldInput 다음 자리에 마운트한다. useFieldInputControl은 컨테이너 ref·적용 세대·composition 시작/종료 처리와 다섯 번째 stable rerender dispatch를 반환하며 표시 release와 composition 종료가 같은 reducer를 재사용한다. user-input batch 안 dirty 설정과 resetInteraction clear는 한 write sequence로 합치며 live cleared state를 따른다. mount layout은2회·ordinary write0회다.

- 가상화 매니저는 훅의 `useSyncExternalStore`에서 서버 스냅숏을 null로 읽습니다. 서버에서 렌더한 자식과 동일한 구성을 하이드레이션에서 마운트하며, 클라이언트 전용 마운트는 첫 렌더부터 게이팅합니다. 기존 입력 commit layout effect에서 하이드레이션 커밋을 ref로 기록하여 passive 일관성 검사가 null을 유지하게 하며, 하이드레이션 완료만으로 슬롯이나 사용자 브랜치 입력을 다시 렌더하지 않습니다. 이후 실제 자식 변경 렌더는 폼 매니저를 적용합니다. Provider의 문맥 값은 바꾸지 않습니다.
- 폼 매니저가 있고 실제 입력 슬롯이 커밋하면 기존 입력 commit layout effect에서 슬롯 자신의 노드를 노출 원장에 기록합니다. 자식 wrapper만 커밋하고 비활성·숨김 노드가 실제 슬롯을 만들지 않은 경우에는 기록하지 않습니다. 하이드레이션, eager window, 문턱 미만 마운트 모두 포함합니다. 이후 remount·enabled 전환으로 캐시를 다시 만들어도 해당 노드는 placeholder가 되지 않으며, 하이드레이션 뒤 추가한 자식과 브랜치에는 게이팅이 적용됩니다. 자식 컴포넌트 캐시는 StrictMode의 effect 재실행에도 유지하고 실제 훅 인스턴스와 함께 회수합니다.
- 사용자 브랜치 입력 내부의 아직 하이드레이션되지 않은 Suspense 경계에 매니저 활성화만으로 갱신을 보내지 않습니다. React 18/19는 하이드레이션 자체 때문에 해당 경계의 서버 DOM을 교체하지 않습니다. React 18에서 경계가 하이드레이션되기 전에 도달하는 이후 갱신은 여전히 클라이언트 렌더링으로 전환할 수 있습니다.
- 하이드레이션 중 준비한 자식을 사용자 브랜치 입력이 접힌 탭·아코디언처럼 나중에 처음 렌더하면 준비 시점의 비게이트 결정을 유지하여 게이팅하지 않습니다. 이 제한의 후속 해결은 자식별 hydration 감지로 최초 실제 마운트 때 게이트를 판정하는 것입니다.
- 입력은 인라인 지정, 입력 맵, 내부 정의, 외부 정의, 플러그인 fallback 순서로 우선해서 고릅니다.
- 모든 입력 공급 경로와 preferred/override 입력은 해석하는 지점에서 사설 어댑터 `withFieldInputErrorBoundary`를 한 번 적용하며, 이 어댑터의 인스턴스는 Refresh 동안 유지됩니다. 어댑터는 렌더할 때 path 보고기를 읽고 `ErrorBoundary` 하나를 직접 렌더합니다. 자동 Refresh와 명시적인 `refresh`는 실패한 경계의 상태를 풀지 않고, `RequestRemount`와 `<Form key>`만 경계를 다시 마운트해서 실패 상태를 해제합니다(EVENT-039·040·042·070, 112C-01).
- Refresh key는 오류 경계 안에 있는 원본 사용자 입력 하나에만 적용합니다. 사설 어댑터는 `useFieldInputControl`이 반환한 적용 세대를 key로 쓰며, 세대 prop을 사용자 입력에는 넘기지 않습니다. 노드의 원시 Refresh 개정은 key로 직접 읽지 않기 때문에, IME 조합과 마운트된 자식 프록시가 보류해 둔 세대가 유지됩니다. 비제어 입력은 다시 마운트할 때 커밋된 defaultValue를 읽으며, 그 입력의 캐럿, 선택, IME 상태만 버립니다(EVENT-039·065, REACT-024·028).
- 첫 마운트 때 자식 layout effect에서 호출한 입력 onChange도 Context의 살아 있는 노드에 기록됩니다. 부모 binding이 준비되는 순서 때문에 버리지 않습니다(WRITE-046).
- 사용자 변경은 폼 전체 잠금과 노드의 읽기 전용·disabled 상태를 확인합니다. `handleChange`는 한 `batch` 안에서 ① `writeFieldNodeInput`으로 값 쓰기 ② 외부 오류 지우기 ③ dirty 표시를 차례로 수행합니다. 세 단계 모두 사슬에 들어갈 때 입력 출처 표식을 달고 있으며, 공개 옵션 비트를 추가하지는 않습니다. 사슬 끝에서 오류가 던져져도 이미 표시한 dirty는 보존하고, 폐기된 노드에서 표식이 달린 세 단계는 조용히 버립니다(REACT-009–011, 69C-01·02).
- 흐림 처리는 `Blurred`를 발행하지 않고 `finishFieldNodeInput`으로 입력이 끝났음을 알립니다. 문자열 행의 `finishInput`이 `options.trim` 자동 쓰기 여부를 판단하며, 외부 오류와 dirty는 그대로 둡니다(WRITE-083, LANDING-067).
- 입력의 key와 defaultValue 메모 의존은 렌더할 때 `node.revision(RequestRefresh)`로 읽은 적용 Refresh 번호를 씁니다. 입력 속성, 자식, Refresh 마스크를 합친 `useSyncExternalStore` tracker 하나가 구독하기 전에 놓친 사건도 구독한 뒤에 따라잡습니다. 조합 중이거나 마운트된 자식 프록시가 있는 동안에는 적용 세대를 유지하며, Refresh만으로는 추가 렌더를 하지 않습니다. 자식 마운트 유예는 렌더, 구독 시작, 사건 전달 시점에 갱신하고, layout 정리만으로는 스냅숏이 바뀌지 않게 해서 마지막 배열 삭제 때 생기는 추가 커밋을 막습니다. focus/select는 지연 프록시가 다시 발행하는 사건을 받도록 layout 구독을 유지하며, 필드 하나가 노드 리스너를 네 개 가집니다. 대체된 입력은 마운트할 때 붙잡은 번호가 쓰기 시점의 번호와 다르면 늦게 도착한 `onChange`·`onFileAttach`를 버립니다. 흐림 뒤로 미룬 touched도 흐릴 때 읽은 상호작용 초기화 번호가 콜백 시점의 번호와 다르면 버립니다. 첨부 파일 맵은 컨테이너 입력에서도 폐기된 노드의 늦은 쓰기를 받지 않습니다(REACT-024·028, 69C-02, 121C-01 F-E).
- Refresh 때 다시 마운트할지는 노드 종류만 보지 않고 자식 프록시가 실제로 마운트되어 있는지로 가립니다. 터미널, 값 전체를 다루는 브랜치, 빈 배열, 접힌 입력은 다시 마운트합니다. 자식을 그리는 기본 객체·배열 입력은 추적 스냅숏을 유지하므로 Refresh만으로는 다시 렌더링하지 않습니다. 컨테이너 입력에는 대체된 입력의 Refresh 번호 검사를 적용하지 않습니다(REACT-024·028).
- 통합 tracker의 스냅숏 getter는 Refresh 유예가 없으면 `node.revision(INPUT_TRACKING_EVENTS)`를 한 번 읽습니다. 유예 중에는 모듈 상수로 분리한 Refresh 제외 마스크의 개정과 적용 세대 `generation.current`를 더합니다. `revision(mask)`는 선택한 비트별 전달 횟수를 합한 값이므로, 유예가 없을 때 통합해서 읽은 값은 분리해서 읽은 두 값의 합과 같습니다. 적용 세대는 렌더에서 따로 읽으며, 자식이 소유한 유예 비트, IME 억제, 구독 전 catch-up 계약은 그대로 유지합니다.
- 입력의 `compositionstart`부터 `compositionend`까지는 다시 마운트가 필요한 Refresh를 보류합니다. 조합 중에는 Refresh가 입력 DOM을 교체하거나 값을 복원하지 않으며, 중복 요청은 하나로 모아서 `compositionend`에서 적용합니다. 노드의 Refresh 번호와 동기 통지는 바로 진행하므로, 이전 입력에서 뒤늦게 온 조합 완료 콜백이나 변경 콜백은 번호 검사로 버립니다. 조합 중에 Refresh가 없었다면 완료된 텍스트는 평소처럼 노드에 전달합니다(EVENT-065, REACT-024).
- `useFieldInput`의 메모 의존에는 유효한 `jsonSchema` 참조가 들어갑니다. `FieldInputHint`는 `{ type: node.type, schemaType: node.schemaType, nullable: node.nullable, path, required, jsonSchema, format, inputType }`이며, 입력 props에 같은 이름이 있으면 같은 값입니다. `schemaType`은 integer와 union 목록을 보존하고, 입력 props에는 `misfit`과 `watchValues`도 전달합니다(REACT-012·032, LANDING-137·181·185).
- 객체 시험의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`inputType`입니다. 모르는 키는 대조에서 빼고, `type`이 integer인 경우도 무효 시험으로 다룹니다. 개발 모드의 `FORM_TYPE_TEST_INVALID`는 정의마다 한 번 보고합니다. union은 `{ type: 'union' }` 또는 함수 시험으로 선택합니다(REACT-032·033).
- 터미널 입력의 `ChildFields`는 빈 배열입니다. 개발 모드(`process.env.NODE_ENV !== 'production'`)에서 object·array 노드가 인라인 입력 때문에 터미널이 된 경우에만(`hooks/utils/isDetectableTerminal`) 읽기를 감지하는 동결 빈 배열을 전달합니다. 이 배열은 첫 색인, length, 순회 읽기를 `CHILD_NODE_COMPONENTS_ON_TERMINAL`로 기록합니다. 보고는 필드 커밋 뒤 입력의 focus/select layout effect가 가장 먼저 호출하는 커밋 표시에서 하고, 로드마다 `(code, path)` 기준으로 한 번만 전달합니다. 프로덕션이거나 원래부터 터미널인 노드(string·number·boolean·null·union)는 오류 핸들러가 있어도 보통의 빈 배열을 받습니다. 컨테이너 입력이라면 자식을 그렸을 스키마에서만 빈 목록을 읽는 것이 실수이기 때문입니다(ERROR-202, 18C-73, 180라운드).
- 자식 읽기 탐침은 감지 대상인 터미널에서만 만들고, 의존성이 같은 쓰기는 입력의 layout effect를 다시 실행하지 않습니다. 탐침은 자체 layout effect 없이 목록과 커밋 표시를 한 쌍으로 돌려주며, 입력이 커밋 표시와 focus/select 구독을 layout effect 하나에서 처리합니다. 자식 프록시마다 도는 `mountedChildren` 계수 effect는 사용자 입력이 자식을 그리는 위치를 정하기 때문에 자식 쪽에 남깁니다. 커밋 이후 첫 읽기는 당시 warning scope를 붙잡아 microtask에서 보고합니다. 그때 reporter의 root가 입력 자신의 root와 다르면 폐기한 load의 경고를 버립니다. 같은 root reset은 원래 scope에 보고하며, 실패한 rebuild도 root를 유지하되 새 scope를 이미 시작하므로 다음 읽기를 다시 보고합니다. unmount 뒤 개발용 경고는 기존처럼 마지막 onError에 도달합니다. 탐침의 첫 읽기 표시는 보고기의 로드 번호에 묶여 있어서, 같은 root를 유지하는 reset이 새 로드를 시작하면 그 로드의 첫 읽기를 한 번 더 전달합니다. 필드마다 훅이나 보유 객체를 늘리지 않습니다(121C-01 F-F, ERROR-202).
- 같은 브랜치에 매칭한 입력 맵의 입력과 정의 목록의 입력은 같은 ChildFields를 받으며 부모 입력 인스턴스를 유지합니다. 맵의 정규식이 터미널인 자식에도 매칭되면, 그 자식에서 같은 컴포넌트를 호출할 때는 빈 ChildFields를 전달합니다(REACT-019·028, ERROR-202).
- 재귀 NodeProxy의 props는 `FieldProxy`가 소유한 `FieldProxyProps` 계약을 타입 전용 import로 읽으며, 입력 계층은 FieldProxy 구현을 값으로 의존하지 않습니다.

- `FieldInputSlotWrapper`는 `components/`에 있고, 뿌리에는 같은 이름의 구현인 `FieldInputSlot.tsx`만 둡니다. 뿌리에는 문서, 진입점, 형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### field-input-slot-contract — 관찰 가능한 동작

- 가상화가 켜진 SSR 입력은 React 18/19의 일반·StrictMode 하이드레이션에서 DOM identity와 값을 보존하고 placeholder나 recoverable error를 만들지 않습니다. 중첩 브랜치 remount 뒤에도 노출을 유지하며, 배열에 나중에 추가한 eager window 밖 항목은 지연합니다. 문턱 미만에서 실제 마운트한 항목도 문턱 도달 뒤 remount하면 계속 노출합니다.
- 언마운트하면 해당 경로의 첨부 파일 상태를 제거합니다.
- refresh는 자식 프록시가 마운트되어 있는지에 따라 입력 버전을 갱신하고, focus/select는 해당 입력의 DOM 명령으로 이어집니다(REACT-028, EVENT-063).
- 실패한 입력은 피어의 쓰기로 생긴 자동 Refresh와 명시적인 Refresh를 거쳐도 fallback을 유지하고, RequestRemount나 폼 key 교체 뒤에는 다시 실행됩니다. 정상 입력의 Refresh는 원본 입력만 교체하며, 피어 입력의 DOM 상태와 입력 오류 경계는 유지합니다(EVENT-039·040·042·070, 112C-01).
- 조합 중에 Refresh가 와도 매 단계의 IME 텍스트와 입력 인스턴스를 보존하고 `value` setter를 호출하지 않습니다. `compositionend`가 한 번 오면 그 뒤에 입력을 다시 마운트하며, 이전 입력의 조합 텍스트가 노드에 뒤늦게 쓰이는 일은 없습니다(EVENT-065, REACT-024).
- Refresh 유예가 없는 스냅숏은 통합 마스크로 한 번에 읽고, 유예 중에는 Refresh 제외 개정과 적용 세대만 읽습니다. 렌더와 구독 사이에 전달된 자식·값 갱신은 화면이 따라잡습니다. 마운트된 자식이 보류한 Refresh는 자식을 해제하는 것만으로는 추가 커밋하지 않고, 다음 전달 때 한 번 적용합니다. `array-push-remove-100`의 커밋은 202회로 유지됩니다.
- 가상화 없이 마운트한 터미널 배열 항목 하나는 라이브러리 layout effect를 두 번(부모 입력의 자식 마운트 계수, 항목 입력의 커밋) 실행합니다. H는 엔진 이력으로 표시를 계산하며 일반 입력 쓰기의 표시가 같으면 layout effect0회를 유지합니다. G8의 None·OnChange 마운트 행으로 이 비용을 정식 측정하고 기준을 넘으면 병합하지 않습니다(코디네이터 msg_cc8e08d106e0; REACT-028, ERROR-202).
- 입력 변경 한 번에 담긴 세 단계는 한 번의 진입으로 정착하고 통지하며, 유효 스키마가 바뀌면 입력 선택에 반영됩니다. 대체되었거나 폐기된 입력이 뒤늦게 하는 값·파일 쓰기와, 초기화 뒤로 미룬 touched는 살아 있는 폼 상태를 바꾸지 않습니다(REACT-011·012·024, 69C-01·02).

## Last Updated

2026-10-31 — IR-5. 계약 기준: REACT-009–012·024·028·032·033, EVENT-039·040·042·065·070, WRITE-083, ERROR-202, 69C-01·02, 112C-01, 121C-01.
