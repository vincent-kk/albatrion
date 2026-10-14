# write 계약

## Requirements

- 사건의 비트·페이로드/options는 레코드의 정착/비정착 대기 칸에 있고 런타임은 대상 집합을 유지한다. 파동 시작에 전체 사건을 분리하고 모든 대기 칸을 비운 뒤 리스너 목록을 고정한다. 리스너 안의 쓰기는 다음 사건 객체와 다음 파동을 만들므로 기존 리스너의 페이로드와 비트가 변하지 않는다. 정착 밖 개정은 기존과 같이 파동 전체를 먼저 올린다(EVENT-004·007·023·024, 65C-03).

- 상태 키·감시의 커밋 계산은 settle이 재계산/배달 후보와 청사진 기능 정적 색인의 교집합에 제한한다. dispatch는 이미 표시된 배달 집합의 문서 순서, 페이로드, 비트별 개정 및 전역 상태→배달→검증→`onChange` 순서를 유지한다. 전역 상호작용 상태는 모든 노드에 런타임 API로 쓸 수 있어 정적 선언 색인으로 줄일 수 없으며, 최외곽 진입당 `UpdateGlobalState` 한 번의 계약을 유지한다(SETTLE-006, EVENT-062·064, 43C-01, 65C-02).

- `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < FieldNode`를 타입 import에도 지킨다. `write`는 `record`의 비트/런타임, `settle`의 동기 커밋, `validation`의 요청을 진입점으로만 연결한다. 검증 결과는 `write`가 넘긴 콜백으로 돌아온다(NODE-016·045, LANDING-084).
- `FieldNodeRuntime`의 진입 깊이, 되먹임 파동 수, `onChange` 중첩 수, 배달 대기열, 리스너/콜백, 보고기, 전달 중 깃발, 경고 구조 키를 쓰며, 그 칸의 선언은 `record`가 소유한다. 레코드의 `revisionLedger`는 읽기만 하고 커밋 표시를 다시 계산하지 않는다(NODE-004·045, 26C-06, EVENT-004·007, ERROR-024·029).

## API Contracts

- `setValue`는 독립 비트 `Overwrite`와 `Merge`가 함께 오면 updater 실행과 쓰기 표시 전에 `INVALID_WRITE_OPTION`으로 거부한다. 오류는 기존 사슬 보고·throw 통로로 전달하며 검사 비용은 고정 비트 연산이다(LANDING-141).

### 이름 붙은 진입점

- `FieldNodeEvent`는 내부 배달 형이며 write index가 내보내지 않는다. 외부 구독자는 공개 `FieldNodeListener` 계약을 사용한다. 시험 트리 생성 fixture는 engine 층의 공용 시험 구획이 소유한다.
- `dispatch.nan-delivery.test.ts`는 write 배달을 검증하며 watched object의 동일성 비교 단위 검증은 settle의 `isSameDeliveryValue` 소유 시험 구획이 담당한다. `dispatch.source-path.test.ts`는 errors 진입점의 `FormErrorRecord`로 기록을 관찰하며, 코드별 상세 형의 계약은 errors의 시험 구획이 검증한다.

- `dispatchPush`·`dispatchPop`·`dispatchUpdate`·`dispatchRemove`·`dispatchClear`는 같은 공개 쓰기 사슬로 들어가며 거부 시 push는 바뀌지 않은 현재 길이, 나머지는 `undefined`를 돌려준다. 배치 밖에서는 배열 정착의 동기 결과를 돌려주고, 배치 안에서는 `readBatchValue`의 앞선 표시를 얹은 배열에 행의 순수 계획을 적용하여 결과 배열을 Replace로 표시한다. push는 호출 뒤의 배열 길이이며, 되먹임 한도 거부·사슬 끝으로 넘긴 중첩 호출의 실패·무동작 계획에서는 바뀌지 않은 현재 길이(branch는 `itemCount`, terminal은 `raw` 배열 길이, 그 밖은 0, settle의 `readArrayLength`)이다. pop·remove는 표시된 자리의 원본, update는 입력 값, clear는 `undefined`이다. 잘못된 종류 값에는 push만 `[x]`를 표시하고 나머지는 무동작이다. 비배열 호출은 사슬 끝에서 `ARRAY_METHOD_ON_NON_ARRAY`를 `surface: 'thrown'`으로 보고하고 던진다. 배치 끝 정착은 통째 쓰기라 아이템 키는 위치로 잇고 정착·`onChange`는 한 번이다. 비용은 배열 계획/복사 O(배열 길이), 앞선 표시 합성 비용이며 노드별 고정 칸은 늘리지 않는다(33C-01, 35C-01, 62C-01, EVENT-035·061).

- `dispatchSetValue(node, value, option?)`, `dispatchResetSubtree(node, option?)`, `dispatchResetForm(root, value, option?)`, `dispatchMount(root, value?, option?, { deferValidation? })`, `dispatchBatch(node, fn: () => void)`, `dispatchContextChange(root, context)`는 공개 쓰기 사슬을 연다. 폼 reset의 값은 `undefined`도 그대로 로드하는 필수 인자이며 이전 스냅숏을 다시 읽는 호출자는 그 값을 명시한다. `dispatchBatch`의 중첩은 바깥 배치가 이기고, 함수가 던져도 표시된 쓰기를 정착·배달한 뒤 그 예외를 사슬 끝에서 드러낸다. 쓰기가 둘 이상인 배치는 루트 한 번 정착으로 합치되 통째 교체 범위(잠복 원본 정리, whole 분배, 교체 나감 판정)는 표시된 경로의 합집합이고 얕은 Merge 표시는 받은 키의 자식 경로이므로, 쓰이지 않은 경로의 잠복 비활성 원본은 남는다. 배치 안 가상 노드 표시는 합성 때 참조 필드 키로 펼쳐지므로(호출 순서대로, 나중 필드 쓰기가 앞선 가상 쓰기를 이김) 합성 루트 입력에 가상 키가 남지 않고, 덮어쓰기 가상 표시는 참조 형제 경로를 교체 범위에 더하며, 가상 대상의 updater는 참조 필드 튜플을 읽고, 틀린 모양은 단일 쓰기처럼 표시 시점에 `INVALID_VIRTUAL_NODE_VALUES`를 던진다; 바인딩 입력(`dispatchWriteInput`)도 배치 안 표시이므로 틀린 가상 모양은 값 표시에서 던지고, 같은 진입의 외부 오류 지우기와 Dirty 표시는 일어나지 않는다(EVENT-013–019·035·061, LANDING-064, 191C-01, 26C-10, R2).
- 입력 출처 쓰기 진입은 사슬 진입 칸에 `source: 'input'`을 싣는다. 이 출처는 `UpdateValue`의 `options.source`, 쓴 입력 자신을 제외하는 Refresh 판정과 늦은 쓰기 차단에 흐르며 공개 `SetValueOption`의 비트가 아니다. `handleChange`의 값 쓰기·외부 오류 지움·dirty를 한 `batch`로 묶은 진입 전체가 같은 표식을 갖고, 폐기된 노드의 표식 있는 셋은 조용히 버린다(REACT-009·010·011, EVENT-071, 69C-01·02, 실행 ADR D4).
- 입력 마침 진입은 동작 행의 `finishInput` 결과를 자동 쓰기로 적용한다. 문자열 `options.trim`은 바뀐 값만 쓰며 외부 오류와 dirty를 유지하고 입력을 Refresh한다. Form의 `disableAutomaticWrites`가 참이면 이 자동 쓰기는 억제된다(WRITE-083, TEST-020, 69C-01).
- 마운트의 `deferValidation`이 참이면 로드 사슬 끝에서 검증을 요청하지 않고 바인딩의 준비 이펙트가 커밋 뒤 요청한다. 기본값은 거짓이며 core 호스트는 사슬 끝에서 직접 요청한다. 두 경로 모두 로드 뒤 `OnChange` 비트가 켜져 있으면 한 번 요청한다(69C-05, LANDING-041).
- 폼 reset 진입은 외부 오류와 검증 결과를 비운다. 바인딩의 `errors` 속성은 같은 reset 호출이 돌아오기 전에 현재 트리에 경로 키로 재적용하며, 비움과 재적용의 통지는 진입 끝의 규칙을 따른다(WRITE-045, 69C-03).
- `subscribeFieldNode(node, listener): () => void`와 `readFieldNodeRevision(node, mask?)`는 읽기이며 진입을 열지 않는다. 구독 사건은 `{ type, payload?, options? }` 모양이고, `revision(mask?)`는 리스너 유무와 무관한 해당 비트 카운터의 합이다(EVENT-001·004·007).
- `dispatchRequest(node, kind: FieldNodeRequestType): void`, `dispatchSetState(node, state)`, `dispatchSetSubtreeState(node, state)`, `dispatchClearSubtreeState(node)`, `dispatchSetExternalErrors(node, errors: readonly ValidationIssue[])`, `dispatchClearExternalErrors(node)`는 정착 밖 사건이다. 하위 트리 상태 두 진입은 navigation의 `visitFieldNodes`로 현재 형상을 전위로 걷고(형제는 `children` 순), 떼어진 노드에서는 그 하위를 건너뛴다. 전달은 파동 안에서 문서 순서로 정렬되므로(`deliverWave`) 방문 순서와 무관하다(SURFACE-062). 이 여섯 진입은 열린 진입이 없으면 큐에 넣은 사건을 바로 전달하고(`closeNonSettleEntry`), `visitSubtree` 순회 안에서는 순회의 묶음을 열어 전달을 순회 끝으로 미룬다. `dispatchValidate(node): Promise<readonly ValidationIssue[]>`는 호출할 때 새 판정을 요청한다(EVENT-012·045·063·067·073, VALIDATE-049).
- 비루트 노드의 외부 오류 쓰기·지우기는 노드 단위로 루트 목록에 귀속된다: 루트 외부 목록에서 그 노드가 앞서 보탠 참조와 `dataPath`의 표준 경로(`find()`로 푼 경로; `/`로 시작하면 그대로)가 그 노드의 경로인 항목을 빼고, 노드의 현재 목록 가운데 루트에 이미 같은 참조로 있는 항목은 자리를 지키며 나머지를 끝에 덧붙인 목록으로 루트를 갱신한 뒤, 루트의 `setExternalErrors`와 같은 경로(`globalErrors` 재계산과 루트 `UpdateError`·`UpdateGlobalError`)를 탄다. 루트 자신의 쓰기·지우기나 자식 전파로 합산(`globalErrors`)의 참조가 바뀔 때 `UpdateGlobalError`를 `globalErrors` 페이로드와 함께 올려 `onValidate`가 집계를 받는다. 한 batch 안의 여러 변경은 같은 노드의 대기 사건으로 합쳐져 한 번 전달된다(188C-01). 루트 목록이 이미 그 경로에 같은 항목을 같은 순서로 담고 있거나 뺄 항목도 더할 항목도 없으면 루트는 바뀌지 않고 사건도 없다. 진입(batch·쓰기) 안에서는 바뀐 노드를 런타임의 `pendingExternalErrorNodes`에 모았다가 최외곽 진입이 끝날 때 한 번만 재구성하고(떼어진 노드는 앞서 보탠 참조만 거두고 루트 항목은 노드의 표준 경로로 교체; 커밋이 떼어낸 노드가 루트에 보탠 참조가 있으면 그 노드를 대기 집합에 넣어 같은 진입의 재구성이 거둠), 진입 밖의 단일 호출은 즉시 재구성한다. 재구성 결과가 비면 루트 항목을 지운다. 비용은 재구성마다 루트 외부 목록 길이와 덧붙일 목록 길이의 합에 비례하는 한 번의 순회와, 바뀔 때만 새 배열 하나이다(기록: `core/__tests__/global-errors.timing.test.ts`). 자리는 0.16.0이 보장하지 않았으므로 첫 변경 순서로 끝에 덧붙이다. 최외곽 진입이 전달하는 동안 리스너가 만든 비루트 외부 오류 변경은 다음 전달 묶음 전에 재구성하며 같은 25회 한도를 따른다(185라운드, 188C-01, 195C-01, SURFACE-053, 178C-01).
- `adoptFieldNodeChain(previousRoot, nextRoot)`는 새 루트의 검증 컴파일을 먼저 확인한 뒤 재생성 reset의 진입 깊이, 배치 표시, 예산과 모은 오류를 넘기는 바인딩 전용 통로이다. 대기 중인 비루트 외부 오류 변경은 경로 키 인계 전에 옛 루트 목록에 접고(195C-01), 외부 오류는 옛 노드 객체가 아닌 경로 키로 넘기고, 인계한 옛 트리는 settle의 폐기 계약에 따라 표시·리스너 해제·통지 없는 동기 번호 증가를 마친다. 검증기 등록 참조 수는 옛 트리 이펙트 정리에서 내린다. 컴파일 확인이 실패하면 옛 사슬은 그대로이다(EVENT-030, VALIDATE-046, WRITE-046·086, 69C-02·03).
- 전달과 사슬 종료(`runDeliveryWaves`·`flushQueuedEvents`·`deliverWave`·`exitFieldNodeChain`)는 리스너와 `onStateChange`·`onChange` 콜백이 돌아올 때마다 활성 루트를 `resolveFieldNodeChainRoot`로 다시 해석한다. 그래서 전달 중 리스너가 `adoptFieldNodeTree`로 인계하면 남은 파동·전달과 사슬 마감은 새 런타임에서 끝나고, 새 런타임에 열린 진입이나 임시 오류 목록이 남지 않으며, 옛 런타임도 쉬는 상태로 돌아간다. 인계가 없으면 해석 결과가 같은 루트이므로 동작은 같다.
- `createFormErrorRecord`는 새 트리 생성에서 청사진 진단을 소비자에게 전달할 기록으로 바꾼다. 진단 코드를 그대로 기록 코드로 쓰고, 오류 객체가 없을 때의 메시지는 `<맨 이름> at <schemaPath>`이다. 던진 값의 기록 코드는 알려진 `FormErrorCode`일 때 그 값, 아니면 `LISTENER_THREW`이다. `FieldNode`가 이름 붙은 진입점으로 가져오며, 소비자가 없으면 서식을 만들지 않는다(ERROR-017·019, NODE-010).

### 사슬, 파동, 기록

- 진입은 같은 루트의 다른 공개 쓰기가 스택에 없을 때의 공개 쓰기 한 호출이다. 정착은 동기로 커밋하고, 깊이 1 → 0에서 정착 파동, 해당하는 검증 요청, `onChange`, 발생 순서의 `onError` 기록 전달, throw 순서로 끝난다. `onChange`는 최외곽 동기 진입당 마지막 파동 뒤에 최종 emit으로 한 번만 부른다. 루트 emit 참조가 그대로인 쓰기는 검증 요청과 `onChange`를 모두 만들지 않는다. 리스너 안의 쓰기는 같은 사슬의 다음 파동이고 `onChange` 안의 쓰기는 새 진입이다(EVENT-008·026·027·031·033, ERROR-004·019, 31C-01).
- `reset`은 emit 참조가 그대로여도 `ValidationMode`의 `OnChange` 비트가 켜져 있으면 검증을 한 번 요청한다. 이 예외만으로 `onChange`를 부르지는 않으며, `resetSubtree()`의 요청은 그 하위 트리에만 적용한다(EVENT-032·072).
- `dispatchVisitSubtree(node, visitor)`는 공개 `visitSubtree`의 진입이다. 순회 자체는 사슬에 들어가지 않고 런타임의 `visitDepth`만 올리므로, 읽기만 하는 순회는 비용이 없고 리스너 안에서도 된다. 순회 중 쓰기가 `enterFieldNodeChain`에 닿을 때 열린 묶음이 없으면(`batchDepth`가 0) 그 진입이 묶음 하나를 함께 열고(`batchDepth = 1`, 여는 진입을 `visitBatchEntry`에 둠) 이후 쓰기는 `batch`처럼 표시만 된다. 가장 바깥 순회가 끝나 `visitDepth`가 0이 되면 열린 묶음을 `flushBatchWrites`로 루트에서 한 번 정착하고 사슬을 나간다. 쓰기가 없으면 아무것도 열지 않고, 바깥 묶음이 열려 있으면 합류만 하며 정착은 바깥 끝에서 한다. 순회 안의 정착 밖 진입도 열린 진입이 없으면 같은 묶음을 열어 전달을 순회 끝으로 미루므로, 순회 안의 전달 시점은 `batch` 안과 같다. 순회 안에서 쓰기 전에 연 `batch()`는 순회의 묶음에 합류해 자기 끝이 아니라 순회 끝에 정착한다. 오류 관찰자 안의 쓰기 거부와 리스너 되먹임 예산은 묶음을 열기 전에 평소대로 적용된다. visitor가 던지면 자기가 연 묶음이 있을 때만 그 오류를 사슬에 담아 표시된 쓰기를 커밋한 뒤 사슬 끝에서 던지고, 아니면 그대로 다시 던진다. 재생성 reset의 사슬 넘김은 `visitDepth`와 `visitBatchEntry`도 새 루트로 옮긴다(SURFACE-062, 191C-01).
- `batch(fn)` 안의 `reset`은 그 로드를 즉시 정착시키고 커밋은 함수 끝의 파동에 합류시킨다. 검증 요청과 해당하는 `onChange`는 최외곽 진입의 끝에서 낸다. `resetSubtree()`의 즉시 정착 범위는 그 하위 트리뿐이다(EVENT-015·072).
- 묶음 안에서도 떼어진 노드에 대한 쓰기(`setValue`, `finishInput`, 배열 동사 다섯)는 표시하지 않고 바로 `writeFieldNode`의 NODE-044 경로로 보낸다(`isBatchMarking`). 그 쓰기는 루트의 (경로, 종류) 잠복 원본만 고치고 아무것도 내지 않으므로 미룰 정착이 없고, 같은 경로에 살아 있는 노드가 있으면 무동작이다. 생사 판정은 쓰는 시점의 직전 커밋 형상이며, `batch` 안에서 같은 `batch`가 바꿀 형상은 보지 않는다(EVENT-013). 표시하면 끝의 정착이 경로로 대상을 다시 찾아 살아 있는 노드를 덮어쓰거나 쓰기를 버린다(NODE-044, 26C-12).
- 파동 시작에 배달 집합과 리스너 목록을 고정하고, 리스너가 있는 노드만 문서 순서 위→아래로 정렬·순회한다. 리스너가 없는 노드의 리비전은 커밋에서 이미 기록된다. 최종 이탈 노드는 건너뛰며, 중간 구독은 다음 파동부터, 해지는 즉시 반영한다. 리스너 예외 하나가 다른 배달을 막지 않는다(EVENT-004·009–011, SETTLE-007, 44C-01).
- `injectTo`와 사용자 함수 안에서 공개 쓰기 API를 부르면 리스너 되먹임처럼 같은 최외곽 사슬의 안쪽 진입이 되고, 그 되먹임 파동 예산을 공유한다. 되먹임이 낸 파동과 `onChange`가 연 새 진입의 중첩 상한은 각각 25이다. 25번째 되먹임 파동은 배달하되 그 파동의 리스너 쓰기는 정착·커밋·통지 전에 조용히 거부하고, 리스너의 `batch`는 콜백 전체를 실행하지 않는다. 리스너 밖의 호출자 쓰기는 거부하지 않으며, 깊이 1 → 0에서 예산을 초기화한다. 허용된 커밋·해당하는 검증 요청과 `onChange`를 마친 뒤 모든 환경에서 `FEEDBACK_LIMIT_EXCEEDED`를 사슬 끝에 한 번 던지고 `diagnostics`에는 넣지 않는다(EVENT-008·020–022·034, CONTROLS-079).
- `setState`의 dirty/touched 변화는 `UpdateState`, 외부 오류 변화는 `UpdateError`, 명령은 요청 비트로 표시한다. 깊이 > 0이면 노드마다 합쳐 정착 파동 뒤 별도 파동으로 한 번, 깊이 0이면 호출 안에서 동기로 배달한다. 이 사건은 검증 요청과 `onChange`를 만들지 않고, 떼어진 노드에는 무동작이다(EVENT-012·045·067·073, NODE-044, 31C-01).
- 상태 쓰기 진입 셋은 각 노드의 이전·다음 `interactionState`에서 참 여부가 달라진 키만 런타임의 셈에 반영하고 레코드 배달 기준의 상태도 그 값으로 옮긴다. 셈이 0↔1을 넘으면 공유 레코드 연산이 새 `globalState` 참조와 루트의 `UpdateGlobalState`를 대기시키며, 깊이 0이면 같은 호출에서, 열린 진입에서는 최외곽 끝의 정착 파동 뒤에 한 번 배달한다. 겹치는 참 노드가 남으면 참조와 사건은 그대로이다(EVENT-062·067, 43C-01, LANDING-152·153).
- 정착의 모든 종류의 실패 수집을 받아 사슬 끝까지 모은다. 한 정착의 게이트·공유 충돌·예산·주입 대상·쓰기 모양·파생·상태 키·커밋 규칙 실패는 모두 각자 한 번 사슬 오류가 되며 발생 순서대로 묶는다. 정착 실패가 발생 자리에서 사슬에 들어오므로 커밋 뒤 재수집하지 않고, 기존 가드 기록과 던진 오류의 병합 및 폼당 가드 하나의 기록 규칙을 유지한다. 보고기가 소비자를 가질 때만 기록과 경고 서식을 만든다. 단, `NON_JSON_WHOLE_VALUE`의 깊이 점검과 보고는 `hasConsumer()`와 무관하게 개발 모드에서만 한다. 기록은 발생 순서대로 전달한다. 하나의 예외는 원래 값을 던지고 여럿은 `SchemaFormError`의 `MULTIPLE_ERRORS`로 묶어 `details.errors`의 순서를 보존한다. 전달 중 같은 폼에 대한 쓰기는 즉시 `WRITE_IN_OBSERVER`로 거부하지만 `validate()`는 허용한다(ERROR-004·005·013·019·021·023·028–030·041, WRITE-099, 31C-02, 58C-01).
- 경고 중복 키는 코드·위치·코드별 판별 칸의 구조 키이다. 폼 수준 로드에서만 비우며 `setValue(V)`·`resetSubtree()`에서는 유지한다. 로드는 데이터 경로 역색인도 비운 뒤 대기 기록만 재색인하고, 배달된 일회성 경고 키는 역색인에서도 지운다. 대기 기록을 새 루트에 넘길 때도 현재 구조 키의 데이터 경로를 색인한다. 발생 기록 객체의 경로는 당시 경로로 남아 사슬 기록과 중복 보고되지 않는다. 추가 비용은 로드/인계의 대기 경고 수 × 깊이, 배달의 일회성 경고 수 × 깊이이다. 주인 없는 예외는 싱크로 한 번 보고하고 검증 결과 파동의 리스너 예외를 미처리 거부로 남기지 않는다(ERROR-008·017·024·204, EVENT-046, 35C-09).
- 정착 밖 동기 파동이나 `onChange` 안에서 열린 쓰기 진입은 바깥 오류·기록 수집기를 스택으로 보존·복원하고, 안쪽 발생을 바깥 수집기에 순서대로 합쳐 사슬 끝에서만 보고한다. 결과 파동은 호출자가 없으므로 그 안쪽 쓰기의 리스너 오류도 `surface: 'sink'`로 한 번 보고하고 싱크로 한 번 보낸다. 명시적 `validate()`의 검증기 실패는 거부 전에 `surface: 'rejected'`로 한 번 보고한다(ERROR-004·019·022·023, EVENT-010·046).
- 쓰기 사슬과 정착 밖 파동은 같은 발생→기록 병합을 사용한다. 먼저 저장된 오류 기록과 뒤따른 `SchemaFormError`의 코드·스키마 위치가 같으면 기존 기록의 오류·상세·묶음과 최종 전달 표면을 갱신하며, 묶음의 첫 오류를 유지한다. 새로 만든 기록은 같은 수집에서 병합 대상으로 쓰지 않으며, 노드에 묶인 예외의 `path`·`schemaPath`를 보존한다. 가드 실패는 폼마다 가드 하나당 `GUARD_FAILED` 기록 하나이며(같은 가드의 뒤따른 실패는 던지되 다시 기록하지 않음), 호출자가 있으면 `thrown`, 없으면 `sink` 표면을 쓴다(ERROR-017·023·041).

## Acceptance Criteria

### dispatch-array-entry — 배열 진입과 배치 표시

- 다섯 배열 진입은 거부 시 `undefined`이며 배치 안에서 앞선 표시를 읽고 동기 결과를 반환한다. 배열 동사를 포함한 배치는 한 번 정착·통지하며 경로가 옮겨진 아이템과 자손의 이전·현재 경로를 배달한다(33C-01, 35C-01·02, 62C-01, EVENT-035·068).

### dispatch-source-details — 자동 쓰기의 원천 경로

- 같은 대상을 겨눈 서로 다른 `injectTo` 선언의 대상 없음·가상 쓰기 모양 실패는 각각의 `details.sourcePath`를 오류 기록에도 유지한다. 기록의 `path`는 대상 경로이고 `details`는 오류의 상세와 같은 참조이다. 호출자 경로의 쓰기 모양 오류에는 `sourcePath`를 더하지 않는다(ERROR-017·195, 59C-01).

### dispatch-order — 진입당 배달과 검증 순서

- 커밋에서 표시한 비트를 문서 순서의 파동으로 한 번 배달하고, 최외곽 진입에서 검증 요청과 `onChange`가 모두 생기면 요청이 앞서며, 중첩 쓰기는 정해진 다음 파동에서 보이다(EVENT-004·007·008·027·031·032, SETTLE-007).

### dispatch-observers — 정착 밖 사건과 오류 격리

- 상태·오류·명령은 원본을 정착시키지 않고 같은 비트 공간으로 배달하며, 리스너 및 보고기 예외가 나머지 전달을 막지 않는다. 전달 중 쓰기와 예산 초과의 오류 시점은 계약을 따른다(EVENT-010·012·045·067·073, ERROR-005·028·029).

### dispatch-boundary — 의존 방향

- 새 엔진이 레거시·플러그인·React를 가져오지 않고 검증 결과 배달은 콜백만으로 역방향에 닿는다(NODE-016·045, CONTROLS-075, GOAL-088, LANDING-084·159).

## Last Updated

계약 기준: 69C-01–03·05, REACT-009–011, WRITE-045·046·083·086; 정돈-2(2026-10-14).
