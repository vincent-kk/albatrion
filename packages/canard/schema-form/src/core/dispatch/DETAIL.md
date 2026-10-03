# dispatch 계약

## Requirements

- 사건의 비트·payload/options는 레코드의 정착/비정착 대기 칸에 있고 런타임은 대상 집합을 유지합니다. 파동 시작에 전체 사건을 분리하고 모든 대기 칸을 비운 뒤 리스너 목록을 고정합니다. 리스너 안의 쓰기는 다음 사건 객체와 다음 파동을 만들므로 기존 리스너의 payload와 비트가 변하지 않습니다. 정착 밖 개정은 기존과 같이 파동 전체를 먼저 올립니다(EVENT-004·007·023·024, 65C-03).


- 상태 키·감시의 커밋 계산은 settle이 재계산/배달 후보와 청사진 기능 정적 색인의 교집합에 제한합니다. dispatch는 이미 표시된 배달 집합의 문서 순서, payload, 비트별 개정 및 전역 상태→배달→검증→`onChange` 순서를 유지합니다. 전역 상호작용 상태는 모든 노드에 런타임 API로 쓸 수 있어 정적 선언 색인으로 줄일 수 없으며, 최외곽 진입당 `UpdateGlobalState` 한 번의 계약을 유지합니다(SETTLE-006, EVENT-062·064, 43C-01, 65C-02).

- `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < SchemaNode`를 타입 import에도 지킵니다. `dispatch`는 `record`의 비트/런타임, `settle`의 동기 커밋, `validation`의 요청을 진입점으로만 연결합니다. 검증 결과는 `dispatch`가 넘긴 콜백으로 돌아옵니다(NODE-016·045, LANDING-084).
- `SchemaNodeRuntime`의 진입 깊이, 되먹임 파동 수, `onChange` 중첩 수, 배달 대기열, 리스너/콜백, 보고기, 전달 중 깃발, 경고 구조 키를 쓰며, 그 칸의 선언은 `record`가 소유합니다. 레코드의 `revisionLedger`는 읽기만 하고 커밋 표시를 다시 계산하지 않습니다(NODE-004·045, 26C-06, EVENT-004·007, ERROR-024·029).

## API Contracts

### 이름 붙은 진입점

- `dispatchPush`·`dispatchPop`·`dispatchUpdate`·`dispatchRemove`·`dispatchClear`는 같은 공개 쓰기 사슬로 들어가며 거부 시 `undefined`를 돌려줍니다. 배치 밖에서는 배열 정착의 동기 결과를 돌려주고, 배치 안에서는 `readBatchValue`의 앞선 표시를 얹은 배열에 행의 순수 계획을 적용하여 결과 배열을 Replace로 표시합니다. push는 결과 길이, pop·remove는 표시된 자리의 원본, update는 입력 값, clear는 `undefined`입니다. 잘못된 종류 값에는 push만 `[x]`를 표시하고 나머지는 무동작입니다. 비배열 호출은 사슬 끝에서 `ARRAY_METHOD_ON_NON_ARRAY`를 `surface: 'thrown'`으로 보고하고 던집니다. 배치 끝 정착은 통째 쓰기라 아이템 키는 위치로 잇고 정착·`onChange`는 한 번입니다. 비용은 배열 계획/복사 O(배열 길이), 앞선 표시 합성 비용이며 노드별 고정 칸은 늘리지 않습니다(33C-01, 35C-01, 62C-01, EVENT-035·061).

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
- 상태 쓰기 진입 셋은 각 노드의 이전·다음 `interactionState`에서 참 여부가 달라진 키만 런타임의 셈에 반영하고 레코드 배달 기준의 상태도 그 값으로 옮깁니다. 셈이 0↔1을 넘으면 공유 레코드 연산이 새 `globalState` 참조와 루트의 `UpdateGlobalState`를 대기시키며, 깊이 0이면 같은 호출에서, 열린 진입에서는 최외곽 끝의 정착 파동 뒤에 한 번 배달합니다. 겹치는 참 노드가 남으면 참조와 사건은 그대로입니다(EVENT-062·067, 43C-01, LANDING-152·153).
- 정착의 모든 종류의 실패 수집을 받아 사슬 끝까지 모읍니다. 한 정착의 게이트·공유 충돌·예산·주입 대상·쓰기 모양·파생·상태 키·커밋 규칙 실패는 모두 각자 한 번 사슬 오류가 되며 발생 순서대로 묶습니다. 정착 실패가 발생 자리에서 사슬에 들어오므로 커밋 뒤 재수집하지 않고, 기존 가드 기록과 던진 오류의 병합 및 폼당 가드 하나의 기록 규칙을 유지합니다. 보고기가 소비자를 가질 때만 기록과 경고 서식을 만듭니다. 단, `NON_JSON_WHOLE_VALUE`의 깊이 점검과 보고는 `hasConsumer()`와 무관하게 개발 모드에서만 합니다. 기록은 발생 순서대로 전달합니다. 하나의 예외는 원래 값을 던지고 여럿은 `SchemaFormError`의 `MULTIPLE_ERRORS`로 묶어 `details.errors`의 순서를 보존합니다. 전달 중 같은 폼에 대한 쓰기는 즉시 `WRITE_IN_OBSERVER`로 거부하지만 `validate()`는 허용합니다(ERROR-004·005·013·019·021·023·028–030·041, WRITE-099, 31C-02, 58C-01).
- 경고 중복 키는 코드·위치·코드별 판별 칸의 구조 키입니다. 폼 수준 로드에서만 비우며 `setValue(V)`·`resetSubtree()`에서는 유지합니다. 로드는 데이터 경로 역색인도 비운 뒤 대기 기록만 재색인하고, 배달된 일회성 경고 키는 역색인에서도 지웁니다. 대기 기록을 새 루트에 넘길 때도 현재 구조 키의 데이터 경로를 색인합니다. 발생 기록 객체의 경로는 당시 경로로 남아 사슬 기록과 중복 보고되지 않습니다. 추가 비용은 로드/인계의 대기 경고 수 × 깊이, 배달의 일회성 경고 수 × 깊이입니다. 주인 없는 예외는 싱크로 한 번 보고하고 검증 결과 파동의 리스너 예외를 미처리 거부로 남기지 않습니다(ERROR-008·017·024·204, EVENT-046, 35C-09).
- 정착 밖 동기 파동이나 `onChange` 안에서 열린 쓰기 진입은 바깥 오류·기록 수집기를 스택으로 보존·복원하고, 안쪽 발생을 바깥 수집기에 순서대로 합쳐 사슬 끝에서만 보고합니다. 결과 파동은 호출자가 없으므로 그 안쪽 쓰기의 리스너 오류도 `surface: 'sink'`로 한 번 보고하고 싱크로 한 번 보냅니다. 명시적 `validate()`의 검증기 실패는 거부 전에 `surface: 'rejected'`로 한 번 보고합니다(ERROR-004·019·022·023, EVENT-010·046).
- 쓰기 사슬과 정착 밖 파동은 같은 발생→기록 병합을 사용합니다. 먼저 저장된 오류 기록과 뒤따른 `SchemaFormError`의 코드·스키마 위치가 같으면 기존 기록의 오류·상세·묶음과 최종 전달 표면을 갱신하며, 묶음의 첫 오류를 유지합니다. 새로 만든 기록은 같은 수집에서 병합 대상으로 쓰지 않으며, 노드에 묶인 예외의 `path`·`schemaPath`를 보존합니다. 가드 실패는 폼마다 가드 하나당 `GUARD_FAILED` 기록 하나이며(같은 가드의 뒤따른 실패는 던지되 다시 기록하지 않음), 호출자가 있으면 `thrown`, 없으면 `sink` 표면을 씁니다(ERROR-017·023·041).

## Acceptance Criteria

### dispatch-array-entry — 배열 진입과 배치 표시

- 다섯 배열 진입은 거부 시 `undefined`이며 배치 안에서 앞선 표시를 읽고 동기 결과를 반환합니다. 배열 동사를 포함한 배치는 한 번 정착·통지하며 경로가 옮겨진 아이템과 자손의 이전·현재 경로를 배달합니다(33C-01, 35C-01·02, 62C-01, EVENT-035·068).

### dispatch-source-details — 자동 쓰기의 원천 경로

- 같은 대상을 겨눈 서로 다른 `injectTo` 선언의 대상 없음·가상 쓰기 모양 실패는 각각의 `details.sourcePath`를 오류 기록에도 유지합니다. 기록의 `path`는 대상 경로이고 `details`는 오류의 상세와 같은 참조입니다. 호출자 경로의 쓰기 모양 오류에는 `sourcePath`를 더하지 않습니다(ERROR-017·195, 59C-01).

### dispatch-order — 진입당 배달과 검증 순서

- 커밋에서 표시한 비트를 문서 순서의 파동으로 한 번 배달하고, 최외곽 진입에서 검증 요청과 `onChange`가 모두 생기면 요청이 앞서며, 중첩 쓰기는 정해진 다음 파동에서 보입니다(EVENT-004·007·008·027·031·032, SETTLE-007).

### dispatch-observers — 정착 밖 사건과 오류 격리

- 상태·오류·명령은 원본을 정착시키지 않고 같은 비트 공간으로 배달하며, 리스너 및 보고기 예외가 나머지 전달을 막지 않습니다. 전달 중 쓰기와 예산 초과의 오류 시점은 계약을 따릅니다(EVENT-010·012·045·067·073, ERROR-005·028·029).

### dispatch-boundary — 의존 방향

- 새 엔진이 레거시·플러그인·React를 가져오지 않고 검증 결과 배달은 콜백만으로 역방향에 닿습니다(NODE-016·045, CONTROLS-075, GOAL-088, LANDING-084·159).

## Last Updated

2026-10-02
