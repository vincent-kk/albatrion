# dispatch 계약

## Requirements

- `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < SchemaNode`를 타입 import에도 지킵니다. `dispatch`는 `record`의 비트/런타임, `settle`의 동기 커밋, `validation`의 요청을 진입점으로만 연결합니다. 검증 결과는 `dispatch`가 넘긴 콜백으로 돌아옵니다(NODE-016·045, LANDING-084).
- `SchemaNodeRuntime`의 진입 깊이, 되먹임 파동 수, `onChange` 중첩 수, 배달 대기열, 리스너/콜백, 보고기, 전달 중 깃발, 경고 구조 키를 쓰며, 그 칸의 선언은 `record`가 소유합니다. 레코드의 `revisionLedger`는 읽기만 하고 커밋 표시를 다시 계산하지 않습니다(NODE-004·045, 26C-06, EVENT-004·007, ERROR-024·029).

## API Contracts

### 이름 붙은 진입점

- `dispatchSetValue(node, value, option?)`, `dispatchResetSubtree(node, option?)`, `dispatchResetForm(root, value?, option?)`, `dispatchMount(root, value?, option?)`, `dispatchBatch(node, fn: () => void)`, `dispatchContextChange(root, context)`는 공개 쓰기 사슬을 엽니다. `dispatchBatch`의 중첩은 바깥 배치가 이기고, 함수가 던져도 표시된 쓰기를 정착·배달한 뒤 그 예외를 사슬 끝에서 드러냅니다(EVENT-013–019·035·061, LANDING-064).
- `subscribeSchemaNode(node, listener): () => void`와 `readSchemaNodeRevision(node, mask?)`는 읽기이며 진입을 열지 않습니다. 구독 사건은 `{ type, payload?, options? }` 모양이고, `revision(mask?)`는 리스너 유무와 무관한 해당 비트 카운터의 합입니다(EVENT-001·004·007).
- `dispatchRequest(node, kind: SchemaNodeRequestType): void`, `dispatchSetState(node, state)`, `dispatchSetSubtreeState(node, state)`, `dispatchClearSubtreeState(node)`, `dispatchSetExternalErrors(node, errors: readonly ValidationIssue[])`, `dispatchClearExternalErrors(node)`는 정착 밖 사건입니다. `dispatchValidate(node): Promise<readonly ValidationIssue[]>`는 호출할 때 새 판정을 요청합니다(EVENT-012·045·063·067·073, VALIDATE-049).
- `adoptSchemaNodeChain(previousRoot, nextRoot)`는 새 루트의 검증 컴파일을 먼저 확인한 뒤 재생성 reset의 진입 깊이, 배치 표시, 예산과 모은 오류를 넘기는 바인딩 전용 통로입니다. 실패하면 옛 사슬은 그대로입니다(EVENT-030, VALIDATE-046).
- `createFormErrorRecord`는 새 트리 생성에서 청사진 진단을 소비자에게 전달할 기록으로 바꿉니다. `SchemaNode`가 이름 붙은 진입점으로 가져오며, 소비자가 없으면 서식을 만들지 않습니다(ERROR-017·019, NODE-010).

### 사슬, 파동, 기록

- 진입은 같은 루트의 다른 공개 쓰기가 스택에 없을 때의 공개 쓰기 한 호출입니다. 정착은 동기로 커밋하고, 깊이 1 → 0에서 정착 파동, 해당하는 검증 요청, `onChange`, 발생 순서의 `onError` 기록 전달, throw 순서로 끝납니다. `onChange`는 최외곽 동기 진입당 마지막 파동 뒤에 최종 emit으로 한 번만 부릅니다. 루트 emit 참조가 그대로인 쓰기는 검증 요청과 `onChange`를 모두 만들지 않습니다. 리스너 안의 쓰기는 같은 사슬의 다음 파동이고 `onChange` 안의 쓰기는 새 진입입니다(EVENT-008·026·027·031·033, ERROR-004·019, 31C-01).
- `reset`은 emit 참조가 그대로여도 `ValidationMode`의 `OnChange` 비트가 켜져 있으면 검증을 한 번 요청합니다. 이 예외만으로 `onChange`를 부르지는 않으며, `resetSubtree()`의 요청은 그 하위 트리에만 적용합니다(EVENT-032·072).
- `batch(fn)` 안의 `reset`은 그 로드를 즉시 정착시키고 커밋은 함수 끝의 파동에 합류시킵니다. 검증 요청과 해당하는 `onChange`는 최외곽 진입의 끝에서 냅니다. `resetSubtree()`의 즉시 정착 범위는 그 하위 트리뿐입니다(EVENT-015·072).
- 파동 시작에 배달 집합과 리스너 목록을 고정하고, 리스너가 있는 노드만 문서 순서 위→아래로 정렬·순회합니다. 리스너가 없는 노드의 리비전은 커밋에서 이미 기록됩니다. 최종 이탈 노드는 건너뛰며, 중간 구독은 다음 파동부터, 해지는 즉시 반영합니다. 리스너 예외 하나가 다른 배달을 막지 않습니다(EVENT-004·009–011, SETTLE-007, 44C-01).
- `injectTo`와 사용자 함수 안에서 공개 쓰기 API를 부르면 리스너 되먹임처럼 같은 최외곽 사슬의 안쪽 진입이 되고, 그 되먹임 파동 예산을 공유합니다. 되먹임이 낸 파동과 `onChange`가 연 새 진입의 중첩 상한은 각각 25입니다. 25번째 되먹임 파동은 배달하되 그 파동의 리스너 쓰기는 정착·커밋·통지 전에 조용히 거부하고, 리스너의 `batch`는 콜백 전체를 실행하지 않습니다. 리스너 밖의 호출자 쓰기는 거부하지 않으며, 깊이 1 → 0에서 예산을 초기화합니다. 허용된 커밋·해당하는 검증 요청과 `onChange`를 마친 뒤 모든 환경에서 `FEEDBACK_LIMIT_EXCEEDED`를 사슬 끝에 한 번 던지고 `diagnostics`에는 넣지 않습니다(EVENT-008·020–022·034, CONTROLS-079).
- `setState`의 dirty/touched 변화는 `UpdateState`, 외부 오류 변화는 `UpdateError`, 명령은 요청 비트로 표시합니다. 깊이 > 0이면 노드마다 합쳐 정착 파동 뒤 별도 파동으로 한 번, 깊이 0이면 호출 안에서 동기로 배달합니다. 이 사건은 검증 요청과 `onChange`를 만들지 않고, 떼어진 노드에는 무동작입니다(EVENT-012·045·067·073, NODE-044, 31C-01).
- 상태 쓰기 진입 셋은 각 노드의 이전·다음 `interactionState`에서 참 여부가 달라진 키만 런타임의 셈에 반영하고 정착 비교 스냅숏의 상태 기준도 그 값으로 옮깁니다. 셈이 0↔1을 넘으면 공유 레코드 연산이 새 `globalState` 참조와 루트의 `UpdateGlobalState`를 대기시키며, 깊이 0이면 같은 호출에서, 열린 진입에서는 최외곽 끝의 정착 파동 뒤에 한 번 배달합니다. 겹치는 참 노드가 남으면 참조와 사건은 그대로입니다(EVENT-062·067, 43C-01, LANDING-152·153).
- 정착의 커밋 뒤 throw를 받아 사슬 끝까지 모읍니다. 보고기가 소비자를 가질 때만 기록과 경고 서식을 만듭니다. 단, `NON_JSON_WHOLE_VALUE`의 깊이 점검과 보고는 `hasConsumer()`와 무관하게 개발 모드에서만 합니다. 기록은 발생 순서대로 전달합니다. 하나의 예외는 원래 값을 던지고 여럿은 `SchemaFormError`의 `MULTIPLE_ERRORS`로 묶어 `details.errors`의 순서를 보존합니다. 전달 중 같은 폼에 대한 쓰기는 즉시 `WRITE_IN_OBSERVER`로 거부하지만 `validate()`는 허용합니다(ERROR-005·013·019·021·023·028–030, WRITE-099, 31C-02).
- 경고 중복 키는 코드·위치·코드별 판별 칸의 구조 키입니다. 폼 수준 로드에서만 비우며 `setValue(V)`·`resetSubtree()`에서는 유지합니다. 주인 없는 예외는 싱크로 한 번 보고하고 검증 결과 파동의 리스너 예외를 미처리 거부로 남기지 않습니다(ERROR-008·024·204, EVENT-046).
- 정착 밖 동기 파동에서 안쪽 쓰기 진입이 열리면 바깥 파동의 오류 수집기를 보존·복원하고, 안쪽 진입의 노출 오류를 바깥 수집기에 합칩니다. 결과 파동은 호출자가 없으므로 리스너 오류를 `surface: 'sink'`로 한 번 보고하고 싱크로 한 번 보냅니다. 명시적 `validate()`의 검증기 실패는 거부 전에 `surface: 'rejected'`로 한 번 보고합니다(ERROR-004·019·022·023, EVENT-010·046).

## Acceptance Criteria

### dispatch-order — 진입당 배달과 검증 순서

- 커밋에서 표시한 비트를 문서 순서의 파동으로 한 번 배달하고, 최외곽 진입에서 검증 요청과 `onChange`가 모두 생기면 요청이 앞서며, 중첩 쓰기는 정해진 다음 파동에서 보입니다(EVENT-004·007·008·027·031·032, SETTLE-007).

### dispatch-observers — 정착 밖 사건과 오류 격리

- 상태·오류·명령은 원본을 정착시키지 않고 같은 비트 공간으로 배달하며, 리스너 및 보고기 예외가 나머지 전달을 막지 않습니다. 전달 중 쓰기와 예산 초과의 오류 시점은 계약을 따릅니다(EVENT-010·012·045·067·073, ERROR-005·028·029).

### dispatch-boundary — 의존 방향

- 새 엔진이 레거시·플러그인·React를 가져오지 않고 검증 결과 배달은 콜백만으로 역방향에 닿습니다(NODE-016·045, CONTROLS-075, GOAL-088, LANDING-084·159).

## Last Updated

2026-10-01
