# FormCore 계약

## Requirements

현재 루트에 연결된 핸들·제출·오류 공개를 소유합니다. 노드 로드·설정 적용은 [RootNodeContext](../../../../providers/RootNodeContext/DETAIL.md), 오류 기록·중복 억제·호스트 전달은 [FormErrorContext](../../../../providers/FormErrorContext/DETAIL.md)에 맡겨 수명과 보고를 중복 구현하지 않습니다.

## API Contracts

Provider 조립은 외부 설정을 안쪽 소비자가 읽는 고정 의존 순서입니다. 노드·입력 상태를 이 계층에 복제하지 않습니다. 핸들은 현재 binding을 읽고, 값 읽기·제출은 `outputValue`, 쓰기는 전달받은 원본 값을 사용합니다. 비연결 루트의 조회·제출은 무해한 빈 결과로 끝나며 제출 callback을 호출하지 않습니다. nullish 노드의 구독은 [hooks 계약](../../../../hooks/DETAIL.md)을 따릅니다.

### form-error-reveal — 공개 명령의 수명

`revealErrors()`는 임시 Always, `resetErrorVisibility()`는 최신 기본 정책 복귀이며 검증하거나 노드 상태를 쓰지 않습니다. Form > FormProvider > AfterEditAndTouch로 선택한 실효 기본 정책이 바뀐 commit, reset·rebuild·루트 교체는 공개를 해제합니다. 같은 정책 재렌더와 Form override에 가려진 Provider 변경은 공개를 유지합니다.

공개 명령은 발급 시점의 정책 세대·load를 보유합니다. 실효 기본 정책 변경 commit에서만 세대를 증가시키므로 대기 중인 공개가 A→B→A 변경을 건너 부활하지 않습니다. 중단된 render는 세대와 committed 설정을 바꾸지 않습니다. 잘못된 선택 정책은 마지막 유효 committed 정책을 유지하며 오류를 보관하고, 보고·초기 로드 차단·복구는 RootNodeContext가 맡습니다. 가려진 Provider 값 때문에 별도 오류를 만들지 않습니다.

### submit-validation-epoch — 비동기 제출과 설정 수명

제출 값과 validate 반환은 시작 snapshot의 결과입니다. callback은 시작 시 마지막 committed prop을 잡으며 mode 변경이 이미 시작한 유효 제출의 callback을 취소하지 않습니다. 명시적 submit·validate Promise의 정착과 최신 화면 게시 여부는 구별합니다.

네이티브 판정의 공개·focus는 시작 load·root·validation epoch와 연결 상태를 판정 도착 및 공개 뒤에 다시 검사합니다. 비동기 실패의 capture·host 보고는 root 동일성과 epoch로 차단하며 같은 root reset·ordinary supersession만으로 버리지 않습니다. React 18 legacy root의 동기 공개 commit 사이에 사용자 layout effect가 reset하거나 정책을 Never로 바꿀 수 있으므로 초점 직전에도 committed 정책·잠금과 후보를 다시 읽습니다. 버려진 render 설정이 명령에 새어들지 않게 committed ref를 사용합니다.

- FormRoot는 마운트 시 가상화 manager identity와 라이프사이클 레지스트리를 고정하고 Context 요소를 직접 조립합니다. Provider 컴포넌트를 추가하지 않아 고정 렌더 수를 지킵니다. 처리기 오류는 ListenerThrew, origin render, 노드 경로로 보고하며 문자열 변환이 실패해도 고정 메시지와 원래 error 값을 보존합니다. 보고기가 던지면 호스트 오류 통로로 넘깁니다. 호스트도 던지면 더 보고할 곳이 없으므로 삼키며 나머지 큐를 계속 실행합니다.
- 컴포넌트 호출 수 보존은 렌더 비용이 없다는 뜻이 아닙니다. FormRoot는 폼별 레지스트리·가상화 값·요청 ref와 안정된 보고·초점 핸들러를 보유하고, 렌더마다 그 훅·초기화 클로저·핸들러 클로저를 평가합니다. 이 고정 비용을 필드 수에 비례하는 작업이나 추가 Provider 컴포넌트로 늘리지 않습니다. 지연 초점 요청 동안에는 문서 리스너 두 개(focusin·focusout)와 예약·취소 클로저가 생기며 요청 종료 때 정리합니다. 폼 DOM ref는 IO가 지원되고 virtualization prop이 활성인 폼에만 연결합니다. 활성화 렌더의 mutation 단계에 ref가 붙어 첫 layout 포커스 요청도 폼 DOM을 읽을 수 있습니다. 비활성에는 ref를 해제하여 일반 입력 쓰기 경로에 사용하지 않는 host ref 비용을 남기지 않습니다. 옵션은 layout commit에서 manager에 반영하며 중단된 렌더는 실행 설정을 바꾸지 않습니다. 포커스도 manager의 현재 활성 상태를 확인하여 비활성에서는 기존 직접 노드 요청으로 끝냅니다.
- 핸들과 네이티브 무효 제출은 focusNode를 공유합니다. 이전 요청을 취소하고 새 FocusRequest를 ref에 보관한 다음 공개합니다. React 18 legacy root의 공개 커밋 안에서 새 요청이 들어와도 이전 요청을 취소할 수 있어야 합니다. live는 같은 load와 루트 및 취소 여부만 보고 effect-mounted 표시는 읽지 않아 StrictMode 재실행 중 예약을 잃지 않습니다.
- 입력 마운트 판정은 매니저가 알고 있는 입력 컨테이너의 첫 초점 요소가 존재하며 disabled가 아닌지를 봅니다. FieldProxy 감싸개에는 Input을 생략한 렌더러의 버튼도 있으므로 이를 입력으로 보지 않습니다. 마운트된 입력이 없을 때만 문서의 capture focusin·focusout 관찰과 Mount 예약을 등록한 뒤 revealPath를 호출합니다. 게이트가 없어도 진행 중인 입력 마운트가 예약을 소비할 수 있도록 microtask까지 기다립니다. 이 microtask는 Mount 처리기의 실행 여부와 관계없이 요청을 종료하여 두 리스너와 남은 예약을 해제합니다. 종료 직전까지 요청이 살아 있고 Mount 처리기가 실행되지 않았으며 초점도 이동하지 않았을 때만 기존 Focus 요청을 보냅니다.
- 요청 뒤 focusin이 발생했거나, 요청 시작의 초점 요소가 연결된 동안 focusout을 보냈거나, 아직 연결되어 있는데 activeElement가 달라졌으면 Mount와 microtask 폴백 모두 Focus 행동을 막습니다. 본문으로 빠진 초점도 이동이며 그 뒤 공개 과정이 시작 요소를 제거해도 이동 기록을 유지합니다. 시작 요소의 제거만으로는 사용자 이동으로 보지 않습니다.
- reset은 즉시 취소하고 마운트 effect 정리는 microtask 뒤에도 mounted가 거짓일 때 취소합니다. StrictMode cleanup과 재실행 사이의 거짓 값으로 요청을 잃지 않기 위한 확인입니다. 요청의 취소는 등록한 정리를 한 번씩 순서대로 실행하며 취소 뒤 등록한 정리도 즉시 실행합니다.
- DOM 행동의 보장과 도달할 수 없는 입력의 범위는 부모 Form의 가상화 초점 계약을 따릅니다. 렌더 경로 탐색은 매니저에 맡기며 폼 DOM의 자리표시자를 훑지 않습니다.

- 무관한 가상화 옵션 변경은 진행 중 포커스 요청을 취소하지 않습니다. 옵션으로 gate가 공개되면 대상 Mount 이후 gate의 settle이 예약과 문서 리스너를 정리합니다. 실제 위치가 사라지면 releaseGate가 요청을 끝냅니다.

## Acceptance Criteria

### live-configuration — 함수 children의 일관된 뷰

함수 children에는 새 prop이 아닌 현재 Context 루트의 schema·node를 함께 전달합니다. reset 전후와 로드 실패 뒤에도 아직 없는 필드를 새 스키마로 설명하지 않습니다. 값·전역 오류·refresh·remount는 tracker로 다시 읽으며 구독과 catch-up의 규칙은 hooks가 소유합니다.

### ERROR-016 — 검증 판정은 실행 오류가 아닙니다

degraded는 환경과 무관하게 제출을 거부합니다. 활성 검증의 컴파일 실패도 거부하지만 검증기 미등록만으로 차단하지는 않습니다. 필요한 검증을 거친 오류 목록은 `SCHEMA_VALIDATION_FAILED`의 `{value, errors, jsonSchema}` 판정이며 callback을 호출하지 않습니다. 명시적 제출은 판정으로 reject하고 오류를 공개하지 않으며 네이티브 제출은 판정 처리로 resolve하여 onError·host에 보내지 않습니다.

판정은 검증 직후 지역 값으로 구분합니다. 사용자 onSubmit이 던지는 ValidationError는 클래스·코드가 같아도 판정으로 다시 분류하지 않습니다. 소비자의 실패를 성공적인 판정 UI로 삼키지 않기 위해서입니다(ERROR-100).

### ERROR-138 — 저하를 제출 계층에서 차단합니다

core가 DOM·제출을 알지 않도록 차단은 이 계층에서 수행합니다. degraded 시 자동 복구 화면을 제공하지 않으며 호스트는 diagnostics를 읽어 표시·복구를 선택합니다. 검증 판정과 실패의 의미는 [validation 계약](../../../../core/engine/validation/DETAIL.md)을 따릅니다(ERROR-140·ERROR-142·ERROR-145).

### ERROR-139 — 호출자와 네이티브 실패 통로

degraded 거부는 origin submit 기록을 한 번 보고한 뒤 caller에게 거부합니다. onError가 던지면 원인·핸들러 예외 순서의 MultipleErrors 하나로 거부하며 명시적 submit은 그 거부를 host에 추가 전달하지 않습니다. native는 이미 보고된 원인·묶음의 capture 중복을 피하고 host에 원인부터 잎 순서로 전달합니다. onSubmit 실패는 onError 없이 caller에게 거부하고 native만 host로 보냅니다. 검증 과정 리스너 실패처럼 caller가 없는 통로는 validate Promise의 성공과 별개로 보고될 수 있습니다(ERROR-019·ERROR-028).

### native-invalid-focus — 오류 공개와 초점의 조건

현행 네이티브 판정은 committed 기본 정책이 Never가 아닐 때 공개합니다. Form의 disabled·readOnly는 공개를 막지 않고 focus만 막습니다. 후보는 present 조상 아래에서 자기 errors가 있고 disabled·readOnly가 아니며 자기 ErrorVisibility가 false가 아닌 노드의 전위 첫 항목입니다. 루트는 다른 후보가 없을 때만 고르므로 관련 없는 첫 입력으로 이동하지 않습니다. 선택 입력이 focus할 수 없더라도 다음 후보로 넘어가지 않아 트리 순서를 결정적으로 유지합니다.

native 여부는 `true`만 인정합니다. handle.submit을 클릭 핸들러로 직접 넘겼을 때 이벤트 객체를 native 신호로 오인하지 않습니다. 네이티브 이벤트 기본 동작은 억제하며 안정적인 제출 함수 참조로 무관한 prop 변경이 FormRootProxy까지 전파되지 않게 합니다.

### root-boundary — ERROR-088·ERROR-091·ERROR-112: 보고기를 경계 바깥에 둡니다

루트 경계 바깥에 폼별 보고기를 둬 fallback 뒤에도 기록을 전달하고, 중첩 Form의 실패는 안쪽 경계가 가둡니다. 오류 클래스별 재throw로 외부 폼을 무너뜨리지 않습니다. 렌더 실패의 componentStack·중복 capture 예외는 FormErrorContext가 소유합니다. 이벤트 처리기의 예외는 렌더 경계를 발화시키지 않으므로 그 경계를 제출 실패 처리기로 사용하지 않습니다(ERROR-086·ERROR-087·ERROR-111·ERROR-113).

### REACT-025 — UI 재생성과 전체 폼 복구를 구분합니다

노드 remount는 트리를 유지한 UI 교체이며 reset은 루트 로드 연산입니다. Form key 교체는 핸들·노드·외부 구독·첨부 파일·가상화·오류 공개·경계 fallback을 포함한 전체 인스턴스 교체입니다. 루트 렌더 경계의 fallback에서 ref가 해제되면 key로 복구합니다. RootNodeContext의 구성 실패 대체 화면은 별도 로드 복구 계약이므로 모든 fallback을 같은 상태로 설명하지 않습니다.

### exact-focus — 취소 가능한 정확한 대상 초점

- 핸들과 네이티브 무효 제출은 중첩 게이트 아래 대상 입력을 한 공개 커밋에 포커스하고 경로 밖 형제를 열지 않습니다. 가상 그룹의 형제 참조를 렌더 경로에 포함합니다.
- 새 요청·사용자 초점 이동·reset·확인된 언마운트·게이트 소멸은 이전 예약의 행동을 막습니다. StrictMode 재실행은 살아 있는 요청이나 Mount를 중복 소비하지 않습니다.
- React 18 legacy root의 동기 재진입과 쓰기 중 지연 명령에서도 예약 공개는 대상에 Focus 명령을 보내지 않아 초점을 되찾지 않습니다. production React도 대상 focus 호출이 한 번입니다.

## Boundary Exemptions

### `types/` — 공개 형의 소유

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: Form 공개 props·핸들·함수 children 형은 구현과 함께 변경하는 계약이므로 이 모듈에 두고 부모와 패키지 진입점이 이름으로 노출합니다.

## Last Updated

제출 판정·보고·초점, 정책 공개 수명 또는 루트 조립 경계가 바뀌면 갱신합니다.
