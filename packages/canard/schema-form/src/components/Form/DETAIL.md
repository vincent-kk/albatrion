# Form contract

## Requirements

공개 Form은 스키마와 UI 조각의 조합 경계입니다. 노드 생성과 로드는 [RootNodeContext](../../providers/RootNodeContext/DETAIL.md), 핸들·제출·루트 격리는 [FormCore](components/FormCore/DETAIL.md)가 소유합니다. 같은 사실을 Form에서 다시 구현하지 않아 두 진입 경로의 계약이 갈라지는 일을 막습니다.

- Provider의 중첩 순서는 `Workspace → FieldInputs → FieldRenderer → InputControl → Virtualization → FieldLifecycle → RootNode`이며 FieldLifecycle은 Context 요소만 조립한다. 바깥 설정과 안쪽 노드·폼 루트의 소비 관계를 유지해야 하므로 부분 렌더나 순서 변경은 허용하지 않는다.

## API Contracts

Form의 설정은 불변 참조 교체로 전달합니다. `jsonSchema`·`defaultValue`는 mount·reset 입력이며, 렌더러·포맷터·입력 맵·정의와 실행 기본값은 각 소유자의 live 계약을 따릅니다. 함수 children의 schema·node 일치는 [FormCore](components/FormCore/DETAIL.md), 입력 선택 수명은 [FieldInputsContext](../../providers/FieldInputsContext/DETAIL.md), 표시 설정은 [FieldRendererContext](../../providers/FieldRendererContext/DETAIL.md)에서 다룹니다.

폼 전체 잠금은 [InputControlContext](../../providers/InputControlContext/DETAIL.md)의 UI 계약입니다. core 명령형 쓰기를 잠그는 정책으로 확대하지 않습니다. `onError`의 기록과 검증 판정은 [오류 계약](../../errors/DETAIL.md)에 따라 서로 다른 채널로 유지합니다(SURFACE-012).

### 가상화 초점

- 핸들과 네이티브 무효 제출은 같은 정확한 포커스 흐름을 사용합니다. 포커스를 받을 입력이 마운트된 위치가 있으면 기존 명령을 보내고 다른 조상 게이트는 열지 않습니다. 마운트된 중복 위치는 모두 요청을 받아 마지막 위치가 초점을 가집니다. 대상 자신의 다른 자리표시자는 기존 명령 구독으로 공개될 수 있습니다.
- 마운트된 입력이 없고 렌더 경로에 막는 게이트가 있으면 대상 Mount를 예약하고 경로를 미리 공개하여 한 커밋에 정확한 대상 입력을 엽니다. 이 흐름은 Focus 명령을 보내지 않아 지연 전달이나 자리표시자의 재전달이 취소 뒤 초점을 빼앗지 않습니다. 구현 수명은 [FormCore](./components/FormCore/DETAIL.md)가 소유합니다.
- 새 요청, reset·루트 교체, 확인된 폼 언마운트나 게이트 소멸은 예약을 끝냅니다. 요청 동안 어떤 focusin이라도 발생하면 대상 행동을 생략하며 다른 곳에 갔다 돌아오는 이동과 하위 자동 포커스도 존중합니다.
- terminal 안쪽, 사용자 레이아웃이 생략한 입력, 숨겨진 Activity, 공개 커밋에서 Suspense로 마운트되지 않은 입력에는 도달하지 않습니다. 숨김·disabled·inert 요소는 focus를 무시할 수 있고 다음 무효 후보로 넘어가지 않습니다. 주변 자리표시자의 높이가 바뀌어 생기는 스크롤 위치 이동은 보정하지 않습니다.
- 이미 마운트된 대상이나 막는 게이트가 없는 대상에 보낸 명령이 지연되면 이후 마운트된 위치에도 닿으며 새 요청으로 취소되지 않습니다. 이는 예약 공개와 구별되는 기존 노드 명령의 수명입니다.

## Acceptance Criteria

### SCHEMA-016 — 스키마 입구는 하나입니다

Form은 완성된 `jsonSchema` 하나를 받습니다. 표현·제어 설정을 합치는 방법은 소비자가 선택하며 별도 overlay prop을 두지 않습니다. 인라인 선언과 overlay 사이에 두 번째 우선순위 체계를 만들지 않기 위해서입니다. 입력 컴포넌트의 데이터 경로별 선택은 `fieldInputMap`·`fieldInputDefinitions`로 표현합니다.

### SCHEMA-017 — 별도 overlay가 주지 않는 이점

검증용 사본은 [validation의 그룹 제거 계약](../../core/engine/validation/DETAIL.md)에 따라 격리하므로 overlay가 검증기 격리를 추가로 보장하지 않습니다. 합성 중 표준 `type`·`required`를 바꾸지 않을 책임은 작성자에게 있으며, 위치 불일치 경고라는 편의도 별도 스키마 입구를 정당화하지 않습니다. 표현·제어만 합성한 경우와 표준 검증 키워드를 바꾼 경우를 같은 판정 보장으로 묶지 않습니다.

### SCHEMA-018 — 공유 정의와 위치별 입력을 구분합니다

재사용 `$ref` 정의에 합친 설정은 그 정의의 모든 사용처에 적용됩니다. 특정 데이터 위치만 다른 입력을 요구하면 경로 맵을 사용합니다. 공유 선언의 변경이 한 필드에만 적용된다고 오해하는 것을 막습니다.

### SCHEMA-046 — 병합 편의 장치를 추가하지 않습니다

스키마 병합·위치 불일치 경고 helper는 공개하지 않습니다. 소비자가 자기 합성 방법을 쓰면 되므로 같은 문제를 위한 패키지 장치를 늘리지 않습니다.

### SURFACE-003 — 합성 API의 공개 경계

필드 조각은 `Form.X` 네임스페이스로 제공합니다. 독립 구현 이름을 별도 공개 컴포넌트로 늘리지 않아 같은 역할의 진입점이 중복되지 않게 합니다. 공개 props의 Roll 표현은 자식 형 계약을 유지하면서 패키지 진입점에서 소비자 이름으로 제공하며, 구현용 props와 혼동하지 않습니다(SURFACE-018).

### SURFACE-059 — 핸들은 현재 바인딩을 따릅니다

명령의 선택적 경로는 생략 시 루트, 존재하지 않는 경로는 무동작입니다. 임의 사건을 발행하는 공개 `publish`는 두지 않으며 노드의 요청 통로에 위임합니다(EVENT-063·EVENT-073). 읽은 오류 배열은 공유 상태이므로 변경하려는 소비자가 복사합니다. 읽기마다 방어 복사하여 참조 안정성을 잃지 않습니다.

### live-configuration — 설정 교체 수명

설정 교체만으로 Form 인스턴스를 재마운트하지 않습니다. 단, 선택 검증기의 참조 교체는 검증기별 캐시·등록 수명 때문에 [루트 로드 계약](../../providers/RootNodeContext/DETAIL.md)에 따라 트리를 교체합니다(VALIDATE-044). 폼 전체 설정과 조각의 mount 고정 override는 서로 다른 계약입니다.

### reset-options — 로드별 자동 쓰기 억제

reset은 값 초기화의 기본 연산이고 옵션·커밋 재대조·rebuild의 의미는 [RootNodeContext](../../providers/RootNodeContext/DETAIL.md)에 둡니다(WRITE-015·WRITE-044·SURFACE-064). UI만 다시 만드는 remount나 전체 Form 인스턴스를 새로 만드는 key와 혼동하지 않습니다(REACT-025).

### emit-normalized — 방출 경로는 정제 값을 냅니다

핸들의 읽기·제출과 변경 방출은 투영 값, 입력은 원본 값입니다. 정제 규칙은 core가 소유하므로 Form이 정제 때문에 배열의 입력 DOM이나 노드를 제거하지 않습니다(LANDING-067). 핸들 값 선택은 [FormCore](components/FormCore/DETAIL.md), 방출은 [RootNodeContext](../../providers/RootNodeContext/DETAIL.md)를 따릅니다.

### submit-gate — 판정과 실행 실패를 구분합니다

제출 차단과 네이티브 판정 공개는 [FormCore](components/FormCore/DETAIL.md)의 계약입니다. 검증 오류를 실행 실패로 보고하거나 명시적 제출에 네이티브 오류 공개를 적용하지 않습니다.

### emit-dedupe — 로드별 방출 수명

준비된 현행 load와 동일 참조 방출 억제는 [RootNodeContext](../../providers/RootNodeContext/DETAIL.md)가 소유합니다. React 숨김·이펙트 정리와 load 은퇴를 같은 의미로 취급하지 않습니다.

## Last Updated

공개 조합 경계, 스키마 입구 또는 하위 소유 계약과의 연결이 바뀌면 갱신합니다.
