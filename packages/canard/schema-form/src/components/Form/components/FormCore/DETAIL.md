# FormCore 계약

## Requirements

- 값 채널, 제출, 오류 경계, `FormHandle`의 계약은 부모 Form의 DETAIL에 있고, 이 fractal은 그 구현을 소유합니다.

## API Contracts

함수 children은 아직 교체되지 않은 prop 대신 현재 Context 루트의 스키마를 읽습니다. 구조 교체 전후와 실패 뒤에도 schema·node 쌍이 일치해야 합니다.

Form과 Provider 중 실제 선택한 입력 값만 정책 해석의 기준으로 삼습니다. 가려진 Provider 변경은 같은 invalid 값의 중복 보고도 만들지 않습니다. 유효하지 않은 정책은 렌더 중 오류 객체로 보관하고 마지막 커밋의 유효 기본 정책을 유지하며, 트리 생성·복구와 origin load 보고는 RootNodeContext가 맡습니다.

`revealErrors()`는 일시적으로 Always를 선택하고 `resetErrorVisibility()`는 최신 기본 정책으로 돌아갑니다. 두 명령은 검증하거나 노드 상태를 쓰지 않습니다. 실효 기본 정책 값이 바뀐 커밋에서만 정책 세대를 증가시키고, 공개 명령은 발급 당시의 세대를 저장합니다. 렌더와 정리는 현재 정책 세대와 다른 공개를 무시하여, 정책 변경 커밋에 아직 렌더된 공개가 없어도 대기 중인 명령이 이전 정책으로 돌아왔을 때 부활하지 않게 합니다. 기본 정책 변경의 커밋, reset, rebuild, 루트 교체는 Form 공개를 해제합니다. 같은 값의 재렌더나 Form prop에 가려진 Provider 변경은 공개를 유지합니다. 중단된 렌더는 정책 세대를 바꾸거나 공개를 해제하지 않습니다.

- 제출 어댑터 `submitForm`은 `FieldNode | Nullish`를 받고 루트가 null·undefined이면 callback을 호출하지 않고 성공 종료한다. `FormHandle.node`의 미연결 상태는 undefined, `findNode`의 부재는 null, `findNodes`의 부재는 빈 배열이다. 이 값을 구독 훅에 전달할 때의 동작과 ref 할당 제한은 [hooks 계약](../../../../hooks/DETAIL.md)에 따른다.
- FormRoot는 마운트 시 가상화 값과 라이프사이클 레지스트리를 고정하고 Context 요소를 직접 조립합니다. Provider 컴포넌트를 추가하지 않아 고정 렌더 수를 지킵니다. 처리기 오류는 ListenerThrew, origin render, 노드 경로로 보고하며 문자열 변환이 실패해도 고정 메시지와 원래 error 값을 보존합니다. 보고기가 던지면 호스트 오류 통로로 넘깁니다. 호스트도 던지면 더 보고할 곳이 없으므로 삼키며 나머지 큐를 계속 실행합니다.
- 핸들과 네이티브 무효 제출은 focusNode를 공유합니다. 이전 요청을 취소하고 새 FocusRequest를 ref에 보관한 다음 공개합니다. React 18 legacy root의 공개 커밋 안에서 새 요청이 들어와도 이전 요청을 취소할 수 있어야 합니다. live는 같은 load와 루트 및 취소 여부만 보고 effect-mounted 표시는 읽지 않아 StrictMode 재실행 중 예약을 잃지 않습니다.
- 입력 마운트 판정은 매니저가 알고 있는 입력 컨테이너의 첫 초점 요소가 존재하며 disabled가 아닌지를 봅니다. FieldProxy 감싸개에는 Input을 생략한 렌더러의 버튼도 있으므로 이를 입력으로 보지 않습니다. 마운트된 입력이 없을 때만 문서의 capture focusin 관찰과 Mount 예약을 등록한 뒤 revealPath를 호출합니다. 게이트가 없어도 진행 중인 입력 마운트가 예약을 소비할 수 있도록 microtask까지 기다립니다. 그때도 요청이 살아 있고 Mount 처리기가 실행되지 않았으면 예약을 취소하고 기존 Focus 요청을 보냅니다.
- 요청 뒤 focusin이 발생했거나, 요청 시작의 초점 요소가 아직 연결되어 있는데 activeElement가 달라졌으면 Mount의 Focus 행동을 막습니다. 본문으로 빠진 초점도 이동이며, 공개 과정에서 시작 요소 자체가 제거된 것은 사용자 이동으로 보지 않습니다.
- reset은 즉시 취소하고 마운트 effect 정리는 microtask 뒤에도 mounted가 거짓일 때 취소합니다. StrictMode cleanup과 재실행 사이의 거짓 값으로 요청을 잃지 않기 위한 확인입니다. 요청의 취소는 등록한 정리를 한 번씩 순서대로 실행하며 취소 뒤 등록한 정리도 즉시 실행합니다.
- DOM 행동의 보장과 도달할 수 없는 입력의 범위는 부모 Form의 가상화 초점 계약을 따릅니다. 렌더 경로 탐색은 매니저에 맡기며 폼 DOM의 자리표시자를 훑지 않습니다.

- 표시 정책 이력은 RootNodeContext가 root별 layout commit에서 기록합니다. validate 반환과 submit 값은 호출 시점 snapshot입니다.

- SURFACE-063: FormHandle.rebuild(option?) delegates to the current root binding, invalidates its schema cache entry and forces tree replacement through reset semantics. Other forms retain their existing roots until their own rebuild; ordinary reset stays unchanged. The package export names do not change.

- `FormCore`(`FormCore.tsx`)는 오류 경계를 입힌 바깥쪽 컴포넌트입니다. `memo(forwardRef)`로 `FormErrorContextProvider`에 `onError`를 넘기고, 그 안에서 `withErrorBoundaryForwardRef(forwardRef(FormRoot), undefined, useBoundaryReporter)`를 렌더합니다. 경계가 보고기 안쪽에 있으므로 루트 fallback이 표시된 뒤에도 보고는 계속 동작합니다. 공개 형은 `Schema`·`Value` 제네릭 시그니처로 단언합니다(ERROR-026·110–117).
- `FormRoot`(`components/FormRoot.tsx`)는 경계가 없는 안쪽 컴포넌트입니다. Provider와 FieldLifecycle Context 요소를 정해진 순서로 중첩하고, 바인딩 ref, 첨부 파일 맵, 기본 정책과 별도의 Form 공개 상태, 추적 제출 핸들을 소유합니다. `useImperativeHandle`로 현재 루트에 위임하는 핸들을 노출합니다.
- `components/`: `FormRoot`는 위에서 설명한 대로이고, `FormRootProxy`는 `<form onSubmit>`을 그리며 자식이 없으면 루트 `FieldProxy`를 렌더합니다. `FormChildrenRenderer`는 함수 자식이 루트 노드의 값, 전역 오류, refresh, remount 사건을 구독해서 다시 실행되게 합니다.
- `utils/`: `createChildren`은 요소 자식은 그대로 두고 함수 자식은 `FormChildrenRenderer`로 바꿉니다. `submitForm`은 degraded 거부, 투영 값 확정, 검증, `onSubmit` 호출 순서로 진행하며, 검증 실패가 아닌 거부만 `onFailure`로 보고합니다. 검증 판정은 try 안에서 지역 변수에 담고, `onInvalid`가 있으면 그것을 불러 resolve하며 없으면 `ValidationError`로 거부합니다. `onSubmit`은 판정이 없을 때만 불리므로 소비자가 던진 `ValidationError`는 판정으로 취급되지 않습니다(`isValidationError`가 공개이고 판정 객체를 다시 던질 수 있어 클래스·코드로 구별하지 않습니다). FormRoot는 네이티브 제출에만 `onInvalid`를 넘깁니다. 그 처리기는 제출 시작의 load 번호(`onReset`마다 1 증가)와 루트를 잡아 두고, 판정 도착과 공개 뒤 초점 직전에 마운트와 load가 그대로인지 확인합니다. 루트를 바꾸는 길(reset의 재생성, rebuild, validator 변경)은 모두 reset 처리기에서 `onReset`을 부릅니다. load 번호뿐 아니라 `binding.current.root === root`로 루트 동일성도 별도로 검사합니다. `native` 인자는 `true`일 때만 네이티브로 취급하므로, `handle.submit`을 onClick에 그대로 넘겨 이벤트 객체가 와도 명시적 제출처럼 거부합니다. 지난 판정은 버리고 host에도 보내지 않습니다. 정책과 잠금(기본 정책과 별도의 Form 공개 상태, `FormProvider`의 `errorVisibility`, Form의 `disabled`·`readOnly`)은 layout effect에서 갱신하는 ref로 읽어 커밋된 값만 씁니다(`useHandle`은 버려진 렌더의 값도 남깁니다). React 18 legacy root에서는 공개가 동기로 커밋되어 사용자 layout effect가 그 사이 reset하거나 기본 정책을 Never로 바꿀 수 있으므로, 초점 직전에 수명·최신 기본 정책을 재검사하고 후보를 다시 구합니다. 최신 기본 정책이 `ErrorVisibility.Never`인지 직접 비교하고, `findFirstInvalidNode`는 초점 후보를 노드 상태만으로 고릅니다. FormRoot는 degraded 거부를 service.report로 origin submit에 한 번 보고하며, 핸들러 예외는 원인과 함께 MultipleErrors로 caller에게 거부합니다. 명시적 제출은 host에 보내지 않으며 native 제출만 거부를 capture하고 첫 원인부터 핸들러 예외까지 잎 순서로 host에 전달합니다. 이미 보고한 원인·핸들러 예외와 같은 규칙의 유효한 중첩 묶음만 담은 bundle은 capture 기록을 생략합니다. 렌더 경계는 React·ErrorBoundary가 잡은 원래 값을 기록합니다.
- `types/props.ts`는 FormChildrenProps·FormProps를, `types/handle.ts`는 FormHandle을 선언하고 진입점이 세 형을 이름으로 내보냅니다.
- 뿌리에는 문서, 진입점과 `FormCore.tsx`만 두며 형은 관심사별 칸에 둡니다(filid zero-peer-file).

### submit-validation-epoch — 실행 설정 수명

네이티브 제출의 판정 표시와 focus는 시작 load·root·validation epoch 및 연결 상태를 판정 도착과 reveal 뒤 다시 검사합니다. 비동기 실패의 capture와 host 보고는 시작 root 동일성과 epoch만 검사하여 루트 교체·은퇴와 실효 모드 전환 뒤의 실패를 차단하며, 같은 root reset이나 ordinary supersession만으로 기존 보고를 버리지 않습니다. 명시적 submit·validate의 Promise는 게시·보고 여부와 별개로 시작 snapshot의 결과나 거부로 정착합니다. 제출 callback은 호출 시작 시점의 마지막 committed props에서 읽으며, mode 전환이 이미 시작한 유효 제출의 callback까지 취소하지는 않습니다. 중단된 render는 명령 동작을 바꾸지 않습니다.

## Acceptance Criteria

### live-configuration — 설정 교체 수명

- schema prop 교체만으로 트리는 바뀌지 않으며 reset 전후에 함수 children이 새 schema와 옛 node를 함께 받지 않습니다.

### root-boundary — 경계와 보고기의 순서

- 루트 렌더 오류는 fallback 안에 가두고, `onError`에 `RENDER_FAILED` 기록으로 한 번 전달합니다. 단, 이미 보고한 원인·handler 객체와 같은 규칙의 유효한 중첩 묶음만 담은 비어 있지 않은 dense bundle 또는 bare handler 예외의 capture는 생략하며 componentStack도 전달하지 않습니다. 부모의 시험은 진입점의 `FormCore`를 직접 렌더해서 이를 확인합니다.

### exact-focus — 취소 가능한 정확한 대상 초점

- 핸들과 네이티브 무효 제출은 중첩 게이트 아래 대상 입력을 한 공개 커밋에 포커스하고 경로 밖 형제를 열지 않습니다. 가상 그룹의 형제 참조를 렌더 경로에 포함합니다.
- 새 요청·사용자 초점 이동·reset·확인된 언마운트·게이트 소멸은 이전 예약의 행동을 막습니다. StrictMode 재실행은 살아 있는 요청이나 Mount를 중복 소비하지 않습니다.
- React 18 legacy root의 동기 재진입과 쓰기 중 지연 명령에서도 예약 공개는 대상에 Focus 명령을 보내지 않아 초점을 되찾지 않습니다. production React도 대상 focus 호출이 한 번입니다.

## Boundary Exemptions

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: `FormProps`·`FormHandle`·`FormChildrenProps`는 이름으로 진입점에 올라 `components/Form/index.ts`를 거쳐 `src/index.ts`가 공개하고, `FormProps`·`FormHandle`은 `providers/*`와 `hooks/form/useFormSubmit.ts`도 쓴다. 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

계약·경계·검증 조건이 변경될 때 갱신합니다.
