# FieldInputSlot

## Requirements

선택된 입력 컴포넌트를 노드의 값·상태·명령 체계에 연결합니다.

## API Contracts

- 입력 선택은 인라인 지정, 입력 맵, 내부 정의, 외부 정의, 플러그인 fallback의 우선순위를 유지합니다.
- 모든 입력 공급 경로와 preferred/override 입력은 해석 지점에서 한 번 적용한 사설 어댑터 `withFieldInputErrorBoundary`의 인스턴스를 Refresh 동안 유지합니다. 어댑터는 렌더 때 path 보고기를 읽고 `ErrorBoundary` 하나를 직접 렌더합니다. 자동 Refresh와 명시 `refresh`는 실패한 경계의 상태를 풀지 않으며, `RequestRemount`와 `<Form key>`만 경계를 다시 마운트하여 실패 상태를 해제합니다(EVENT-039·040·042·070, 112C-01).
- Refresh key는 오류 경계 안의 원본 사용자 입력 하나에만 적용합니다. 사설 어댑터는 `useFieldInputControl`이 반환한 적용 세대를 key로 사용하고 세대 prop을 사용자 입력에 전달하지 않습니다. 노드의 원시 Refresh 개정은 key로 직접 읽지 않으므로 IME 조합과 마운트된 자식 프록시가 보류한 세대를 유지합니다. 비제어 입력은 다시 마운트할 때 커밋된 defaultValue를 읽고 해당 입력의 캐럿·선택·IME 상태만 버립니다(EVENT-039·065, REACT-024·028).
- 첫 마운트의 자식 layout effect에서 호출한 입력 onChange도 Context의 살아 있는 노드에 기록되며 부모 binding 준비 순서 때문에 버리지 않습니다(WRITE-046).
- 사용자 변경은 폼 전체 잠금과 노드의 읽기 전용·disabled 상태를 확인합니다. `handleChange`는 한 `batch` 안에서 ① `writeFieldNodeInput`으로 값 쓰기 ② 외부 오류 지움 ③ dirty 표시를 수행합니다. 세 단계 전체가 사슬 진입의 입력 출처 표식을 가지며 공개 옵션 비트를 더하지 않습니다. 사슬 끝에서 던지는 오류가 있어도 이미 표시한 dirty를 보존하고, 폐기된 노드의 표식 있는 세 단계는 조용히 버립니다(REACT-009–011, 69C-01·02).
- 흐림 처리는 `Blurred` 발행 대신 `finishFieldNodeInput`으로 입력 마침을 전달합니다. 문자열 행의 `finishInput`이 `options.trim` 자동 쓰기를 판단하고 외부 오류·dirty는 유지합니다(WRITE-083, LANDING-067).
- 입력의 key와 defaultValue 메모 의존은 렌더 시 `node.revision(RequestRefresh)`로 읽은 적용 Refresh 번호를 사용하며 입력 속성·자식·Refresh 마스크를 합친 하나의 `useSyncExternalStore` tracker가 구독 전에 놓친 사건도 구독 뒤 따라잡습니다. 조합 중·마운트된 자식 프록시가 있는 동안은 적용 세대를 유지하고 Refresh만으로 추가 렌더하지 않습니다. 자식 마운트 유예는 렌더와 구독 시작·사건 전달에서 갱신하며 layout 정리만으로 스냅숏이 바뀌지 않게 하여 마지막 배열 삭제의 추가 커밋을 방지합니다. focus/select는 지연 프록시의 재발행을 받도록 layout 구독을 유지하며 필드 하나는 노드 리스너 네 개를 보유합니다. 대체된 입력은 마운트 시 붙잡은 이 번호와 쓰기 시 번호가 다르면 늦은 `onChange`·`onFileAttach`를 버립니다. 흐림 뒤 미룬 touched는 흐릴 때 읽은 상호작용 초기화 번호와 콜백 시 번호가 다르면 버립니다. 첨부 파일 맵은 컨테이너 입력에서도 폐기된 노드의 늦은 쓰기를 받지 않습니다(REACT-024·028, 69C-02, 121C-01 F-E).
- Refresh의 다시 마운트 판정은 노드 종류만이 아니라 자식 프록시의 실제 마운트 여부로 가릅니다. 터미널·값 전체 브랜치·빈 배열·접힌 입력은 다시 마운트하고, 자식을 그리는 기본 객체·배열 입력은 추적 스냅숏을 유지하여 Refresh만으로 다시 렌더링하지 않습니다. 컨테이너 입력에는 대체된 입력의 Refresh 번호 검사를 적용하지 않습니다(REACT-024·028).
- 통합 tracker의 스냅숏 getter는 Refresh 유예가 없으면 `node.revision(INPUT_TRACKING_EVENTS)`를 한 번 읽습니다. 유예 중에는 모듈 상수로 분리한 Refresh 제외 마스크의 개정과 적용 세대 `generation.current`를 더합니다. `revision(mask)`는 선택한 비트별 전달 횟수의 합이므로 유예가 없는 통합 읽기는 분리된 두 읽기의 합과 같습니다. 적용 세대는 렌더에서 별도로 읽으며 자식 소유 유예 비트·IME 억제·구독 전 catch-up 계약은 유지합니다.
- 입력의 `compositionstart`부터 `compositionend`까지 다시 마운트가 필요한 Refresh는 보류합니다. 조합 중에는 Refresh로 입력 DOM을 교체하거나 값을 복원하지 않고, 중복 요청은 하나로 모아 `compositionend`에서 적용합니다. 노드의 Refresh 번호와 동기 통지는 즉시 진행하므로 이전 입력의 조합 완료·늦은 변경 콜백은 번호 검사로 버립니다. 조합 중 Refresh가 없으면 완료 텍스트는 정상적으로 노드에 전달합니다(EVENT-065, REACT-024).
- `useFieldInput`의 메모 의존에는 유효 `jsonSchema` 참조가 포함됩니다. `FieldInputHint`는 `{ type: node.type, schemaType: node.schemaType, nullable: node.nullable, path, required, jsonSchema, format, inputType }`이며 입력 props의 같은 이름은 같은 값입니다. `schemaType`은 integer와 union 목록을 보존하고 입력 props는 `typeMismatch`·`watchValues`도 전달합니다(REACT-012·032, LANDING-137·181·185).
- 객체 시험의 키는 `type`·`schemaType`·`path`·`required`·`nullable`·`format`·`inputType`입니다. 모르는 키는 대조에서 빼고 `type`의 integer도 무효 시험으로 다루며, 개발 모드 `FORM_TYPE_TEST_INVALID`는 정의마다 한 번 보고합니다. union은 `{ type: 'union' }` 또는 함수 시험으로 선택합니다(REACT-032·033).
- 터미널 입력의 `ChildFields`는 빈 배열입니다. 개발 모드(`process.env.NODE_ENV !== 'production'`)에서 object·array 노드가 인라인 입력으로 터미널이 된 경우에만(`hooks/utils/isDetectableTerminal`) 읽기를 감지하는 동결 빈 배열을 전달하여 첫 색인·length·순회 읽기를 `CHILD_NODE_COMPONENTS_ON_TERMINAL`로 기록합니다. 필드 커밋 뒤 입력의 focus/select layout effect가 맨 먼저 부르는 커밋 표시에서 보고하고 로드마다 `(code, path)`로 한 번만 전달합니다. 프로덕션과 본래 터미널인 노드(string·number·boolean·null·union)는 오류 핸들러가 있어도 보통의 빈 배열을 받습니다. 컨테이너 입력이라면 자식을 그렸을 스키마에서만 빈 목록 읽기가 실수이기 때문입니다(ERROR-202, 18C-73, 180라운드).
- 자식 읽기 탐침은 감지 대상 터미널에서만 만들며 의존성이 같은 쓰기는 입력의 layout effect를 재실행하지 않습니다. 탐침은 자체 layout effect 없이 목록과 커밋 표시를 한 쌍으로 돌려주고, 입력은 커밋 표시와 focus/select 구독을 layout effect 하나에서 처리합니다. 자식 프록시마다의 `mountedChildren` 계수 effect는 사용자 입력이 자식을 그리는 위치를 정하므로 자식 쪽에 남깁니다. 커밋 이후 최초 읽기는 기존 Proxy getter를 microtask로 재사용하여 경고를 전달하므로 입력 자체의 늦은 렌더·layout·이벤트 읽기도 놓치지 않습니다. 탐침의 첫 읽기 표시는 보고기의 로드 번호에 묶여, 같은 root를 유지하는 reset이 새 로드를 시작하면 그 로드의 첫 읽기를 다시 한 번 전달합니다. 필드별 훅·보유 객체를 늘리지 않습니다(121C-01 F-F, ERROR-202).
- 같은 브랜치에 매칭한 입력 맵과 정의 목록의 입력은 같은 ChildFields를 받으며 부모 입력 인스턴스를 유지합니다. 맵의 정규식이 터미널 자식에도 매칭하면 그 자식의 동일 컴포넌트 호출에는 빈 ChildFields를 전달합니다(REACT-019·028, ERROR-202).
- 재귀 NodeProxy의 props는 `FieldProxy`가 소유한 `FieldProxyProps` 계약을 타입 전용 import로 읽으며, 입력 계층은 FieldProxy 구현을 값으로 의존하지 않습니다.

- `FieldInputSlotWrapper`는 `components/`에 있고 동명 구현 `FieldInputSlot.tsx`만 뿌리에 둡니다. 뿌리에는 문서·진입점·형 동반 파일(`type.ts`)만 둡니다(filid zero-peer-file).

## Acceptance Criteria

### field-input-slot-contract — 관찰 가능한 동작

- 언마운트하면 해당 경로의 첨부 파일 상태를 제거합니다.
- refresh는 자식 프록시 마운트 판정에 따라 입력 버전을 갱신하고 focus/select는 해당 입력의 DOM 명령으로 연결됩니다(REACT-028, EVENT-063).
- 실패한 입력은 피어 쓰기의 자동 Refresh와 명시 Refresh 뒤에도 fallback을 유지하고, RequestRemount 또는 폼 key 교체 뒤에는 다시 실행됩니다. 정상 입력의 Refresh는 원본 입력만 교체하며 피어 입력의 DOM 상태와 입력 오류 경계는 유지합니다(EVENT-039·040·042·070, 112C-01).
- 조합 중 Refresh에도 매 단계의 IME 텍스트와 입력 인스턴스를 보존하며 `value` setter를 호출하지 않습니다. 한 번의 `compositionend` 뒤 입력을 다시 마운트하고 이전 입력의 조합 텍스트는 노드에 늦게 쓰이지 않습니다(EVENT-065, REACT-024).
- Refresh 유예가 없는 스냅숏은 통합 마스크 한 번으로 읽고, 유예 중에는 Refresh 제외 개정과 적용 세대만 읽습니다. 렌더와 구독 사이에 전달된 자식·값 갱신은 화면에 따라잡습니다. 마운트된 자식이 보류한 Refresh는 자식 해제만으로 추가 커밋하지 않고 다음 전달에서 한 번 적용합니다. `array-push-remove-100`의 커밋은 202회를 유지합니다.
- 가상화 없이 마운트한 터미널 배열 항목 하나는 라이브러리 layout effect를 두 번(부모 입력의 자식 마운트 계수, 항목 입력의 커밋) 실행합니다(REACT-028, ERROR-202).
- 한 입력 변경의 세 단계는 한 진입으로 정착·통지하고, 유효 스키마 변경은 입력 선택에 반영됩니다. 대체·폐기된 입력의 늦은 값·파일 쓰기와 초기화 뒤 미룬 touched는 살아 있는 폼 상태를 바꾸지 않습니다(REACT-011·012·024, 69C-01·02).

## Last Updated

계약 기준: REACT-009–012·024·028·032·033, EVENT-039·040·042·065·070, WRITE-083, ERROR-202, 69C-01·02, 112C-01, 121C-01.
