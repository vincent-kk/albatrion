# write 계약

## Requirements

- `onInactive`의 옛 해제 함수를 반복 호출해도 더 새 등록 집합은 제거하지 않습니다. resolver 쓰기 거부의 경고 보고기 안에서 시도한 쓰기는 재보고 없이 무시하여 재귀 배달을 막습니다.

- B12 resolver는 자동 쓰기가 허용되는 정상 보존 gate exit에서만 실행합니다. load/reset 범위·throwingGateExits·entered-only 퇴장과 자동 쓰기 억제·실패/예산 억제에서는 호출하지 않습니다. 다중 콜백은 등록 순서로 모두 실행하고 마지막 non-undefined를 채택하며 하나라도 던지면 해당 노드의 override 전체를 취소합니다.

- B12 `onInactive` 등록은 인스턴스별 Map/Set이며 해제 함수를 반환합니다. resolver 실행 중 setValue·배열 동사·batch·resetSubtree는 진입 전에 무시하고 개발 모드에서만 `WriteInInactiveResolver` 경고를 보고합니다. 정착·배달·콜백 실행을 중첩하지 않습니다.

- 폐기되지 않은 떼어진 노드의 늦은 UI 입력도 값 쓰기와 같이 무효이며 개발 모드 경고를 낸다.
- 폐기되면서 떼어진 참조의 공개 setValue와 배열 동사는 detached 거부가 폐기 검사보다 먼저 적용되어 DisposedNodeWrite를 던지는 대신 무동작과 개발 경고로 끝나며, UI 입력 채널의 폐기 거부는 무음이다. resetSubtree도 detached 검사가 폐기 검사보다 먼저 적용되어 경고 없이 무동작으로 끝나며, 상태·오류·요청 명령은 폐기 검사를 먼저 적용해 DisposedNodeWrite를 던진다.

- 중첩 경고 보고는 호출 전 reportingErrors를 복원한다. onError 안의 떼어진 쓰기가 경고를 보고해도 같은 콜백의 살아 있는 쓰기는 WriteInObserver로 거부한다.

- 떼어진 참조의 값 쓰기와 배열 동사는 사슬·배치·updater 평가 전에 무동작으로 끝난다. 개발 모드에서는 `FormWarningCode.DetachedNodeWrite`로 경고하고 운영 모드에서는 침묵한다. push·insert는 동결된 현재 길이를 반환하고 나머지 동사는 undefined를 반환한다. 호스트의 경로 JSON 쓰기만 비활성 원본을 바꾼다(B11).

- 배치 값은 jsonPointer가 해석한 이름만으로 합성하고, 진단 경로 조립과 reset 하위 범위 판정도 같은 경로 소유자의 API에 위임한다.

- 쓰기 진입은 슬롯 원본의 단일 정착 경로를 사용하며 off/verify 원본 재생을 실행하지 않는다. 배열 묶음의 살아남는 후보 원본은 슬롯·overlay로 이전하고 공개 쓰기·batch·visit·load·배달·오류 순서는 유지한다.

- D2-P1의 전체 교체 세대 표식은 settle 내부 작업 기록이다. 공개 쓰기·batch·visit·load의 의미와 배달 순서·payload·revision·오류 시점은 유지한다. 정적 독립 branch 전체 쓰기만 자격을 받고 부분·가상·형상 변경 등은 원래 DirtyPathSet 경로로 돌아간다. 대상 내부 경로 장부는 0이며 조상 처리는 기존 정착 순서로 한 번만 한다. 선택 표식의 논리 메모리는 도달 노드당 숫자 8바이트·트리당 숫자 8바이트이고 엔진별 객체 확장 비용이 추가될 수 있다(TEST-080 D2-P1, NODE-060, SETTLE-017·047).

- H5b의 revision 읽기 없음은 트리에서 공개 revision()을 한 번도 호출하지 않았음을 뜻한다. 최초 읽기는 영구 관측 플래그를 세우되 반환 카운터는 바꾸지 않는다. 공개 최외곽·전체 미구독·해당 노드 기존 pending 없음까지 만족할 때만 settle이 payload와 원장 할당을 생략·공유하며, 정착 밖 파동의 원장 생성과 배달 파동 분리·정렬은 기존 경로를 유지한다. revision과 listener의 payload·previous·개발 모드 동결은 바뀌지 않는다(EVENT-006, NODE-060, TEST-080 D1-H5b).

- 묶음 배열 동사의 update·remove 반환 원본 해석은 살아 있는 자리의 청사진을 우선한다. 부재 자리는 단일 후보일 때만 미리 해석하고, 여러 fold가 가능하면 입력을 그대로 반환하며 실제 쓰기의 후보 선택은 묶음 끝 정착에 맡긴다(390C-01, 391C-01).

- 사건의 비트·페이로드/options는 레코드의 정착/비정착 대기 칸에 있고 런타임은 대상 집합을 유지한다. 파동 시작에 전체 사건을 분리하고 모든 대기 칸을 비운 뒤 리스너 목록을 고정한다. 리스너 안의 쓰기는 다음 사건 객체와 다음 파동을 만들므로 기존 리스너의 페이로드와 비트가 변하지 않는다. 정착 밖 개정은 기존과 같이 파동 전체를 먼저 올린다(EVENT-004·007·023·024, 65C-03).

- 상태 키·감시의 커밋 계산은 settle이 재계산/배달 후보와 청사진 기능 정적 색인의 교집합에 제한한다. dispatch는 이미 표시된 배달 집합의 문서 순서, 페이로드, 비트별 개정 및 전역 상태→배달→검증→`onChange` 순서를 유지한다. 전역 상호작용 상태는 모든 노드에 런타임 API로 쓸 수 있어 정적 선언 색인으로 줄일 수 없으며, 최외곽 진입당 `UpdateGlobalState` 한 번의 계약을 유지한다(SETTLE-006, EVENT-062·064, 43C-01, 65C-02).

- `blueprint < record < {behaviors, navigation} < validation < settle < dispatch < FieldNode`를 타입 import에도 지킨다. `write`는 `record`의 비트/런타임, `settle`의 동기 커밋, `validation`의 요청을 진입점으로만 연결한다. 검증 결과는 `write`가 넘긴 콜백으로 돌아온다(NODE-016·045, LANDING-084).
- `FieldNodeRuntime`의 진입 깊이, 되먹임 파동 수, `onChange` 중첩 수, 배달 대기열, 리스너/콜백, 보고기, 전달 중 깃발, 경고 구조 키를 쓰며, 그 칸의 선언은 `record`가 소유한다. 레코드의 `revisionLedger`는 읽기만 하고 커밋 표시를 다시 계산하지 않는다(NODE-004·045, 26C-06, EVENT-004·007, ERROR-024·029).

## API Contracts

- `forEachFailureLeaf(failure, visit)`는 write가 소유한 실패 묶음의 호스트 전달 계약을 core 바인딩에 제공한다. SchemaFormError MultipleErrors의 비어 있지 않은 own-index 배열만 깊이 우선·원소 순서로 펼치고 malformed·재방문 묶음과 그 밖의 값은 같은 identity로 방문한다. frame stack과 root부터의 visited 집합으로 깊이·순환을 제한하며 시간과 호출별 임시 메모리는 O(N)이다. 영구 노드 필드는 추가하지 않는다. 방문 callback과 기존 raw sink의 예외 의미는 유지한다.

- `dispatchLoadValidation(root): boolean`은 사슬을 열지 않는 로드 검증 진입점이다. None·unavailable·검증기 없음은 false이며 나머지는 전체 스키마를 준비한다. 컴파일 실패만 failValidationCompile로 unavailable·정착·로드별 origin validate 보고하고, 다른 실패는 reporter에 보낸다. OnChange이며 현재 로드 이후 전체 배정을 충족할 요청이 없을 때만 true를 반환한다. 로드 판정이 남아 있는 동안 자동 하위 요청은 루트로 넓힌다. None·OnRequest-only는 자동 요청하지 않는다.
- 모든 mount·form reset은 validationStamp를 증가시키고 finally의 사슬 종료 직전에 validationLoadStamp를 기록한다. deferred reset은 이전 pending을 정착한다. dispatchValidate의 오래된 로드 컴파일 실패는 caller에만 거부하고 현재 로드의 flag·보고를 바꾸지 않는다.

- 수락한 명시적 root 판정은 route 뒤 pending이면 settle, 아니면 전체 release를 수행하여 한 번만 해제하고 배달한다. release listener가 여는 새 쓰기의 이력은 보존한다.

- H: 최외곽 chain 진입·standalone 상태 진입·outer visit는 record의 sequence를 한 번 전진시킨다. exit의 request 뒤와 standalone closeNonSettleEntry의 finally에서 !entryDepth일 때 drop을 예약한다. listener가 던져도 기록 수명은 예약된다. clearSubtreeState의 직접 {} 쓰기 전에도 기록한다.
- H/D: 하위 트리 validate는 전체 release하거나 stamp를 올리지 않는다. 로드 판정이 남은 자동 하위 요청은 루트로 넓히며, 대체될 실행의 대상은 새 요청이 stamp를 올리기 전에 후속 pending으로 인계한다. 완료 시 다시 요청하지 않으며 명시적 하위 검증은 실행 소유 기록을 건드리지 않는다. commit-only 재요청과 호출 시점 반환 계약은 유지한다. requestFieldNodeValidationWave는 deliverValidationWave 옆의 chain 파일이며 두 소비자가 구체 파일로 사용한다.

- W3: 공개 리스너 배달 전에 validation의 prepareFieldNodeValidation을 호출해 동기 flushSync·legacy render도 pending을 보게 한다. 종료는 같은 적격 조건으로 실제 요청을 만들고, 요청이 사라지면 기록한 entry stamp만 정착하여 더 최신 pending은 보존한다. state-only 사슬은 기존 다른 요청을 풀지 않는다.

- U2: 명시적 루트 validate의 현재 stamp 실행은 라우팅 뒤·deliverValidationWave 전에 pending을 정착시킨다. null·실패는 현재 stamp이면 정착하며 commit-only 폐기는 pending을 유지하고 최신 commit을 다시 요청한다. 하위 트리 실행은 pending을 풀지 않으며 컴파일 실패의 validationUnavailable은 무조건 정착한다. non-OnChange reset의 새 요청 없는 stamp 증가도 정착한다(승인 msg_1f2afdd094c7).

- 쓰기 검증 요청은 동기 정착·사건 배달 뒤, `onChange` 앞에서 예약하지만 실제 실행·오류 배달은 다음 화면 뒤 선행·연속 프레임 이월·첫 무요청 프레임 뒤 후행 및 마지막 자동 실행 시작 기준100ms 상한 주기로 최신 커밋을 판정한다. 명시적 `dispatchValidate`와 제출은 즉시 판정한다. 루트의 명시적 검증만 스탬프를 올리고 대기 대상을 비우며, 하위 트리 검증은 현재 스탬프를 초기화해 읽고 대기 중·진행 중 전체 폼 검증을 보존한다. 같은 커밋의 중복 배달은 기존 오류 참조 보존·보고 중복 억제를 따른다(IR-6).
- 세그먼트만 소비하는 경로는 jsonPointer의 배열 전용 정본을 사용하여 해석 결과 wrapper를 추가하지 않습니다. 문법과 현재 형상의 조회는 계속 분리합니다.

- `setValue`는 독립 비트 `Overwrite`와 `Merge`가 함께 오면 updater 실행과 쓰기 표시 전에 `INVALID_WRITE_OPTION`으로 거부한다. 오류는 기존 사슬 보고·throw 통로로 전달하며 검사 비용은 고정 비트 연산이다(LANDING-141).

### 이름 붙은 진입점

- `FieldNodeEvent`는 내부 배달 형이며 write index가 내보내지 않는다. 외부 구독자는 공개 `FieldNodeListener` 계약을 사용한다. 시험 트리 생성 fixture는 engine 층의 공용 시험 구획이 소유한다.
- `dispatch.nan-delivery.test.ts`는 write 배달을 검증하며 watched object의 동일성 비교 단위 검증은 settle의 `isSameDeliveryValue` 소유 시험 구획이 담당한다. `dispatch.source-path.test.ts`는 errors 진입점의 `FormErrorRecord`로 기록을 관찰하며, 코드별 상세 형의 계약은 errors의 시험 구획이 검증한다.

- `dispatchPush`·`dispatchPop`·`dispatchUpdate`·`dispatchRemove`·`dispatchInsert`·`dispatchClear`는 같은 공개 쓰기 사슬로 들어가며 거부 시 push·insert는 바뀌지 않은 현재 길이, 나머지는 `undefined`를 돌려준다. 배치 밖에서는 배열 정착의 동기 결과를 돌려주고, 배치 안에서는 `readBatchValue`의 앞선 표시를 얹은 배열에 행의 순수 계획을 적용하여 결과 배열을 Replace로 표시한다. push·insert는 호출 뒤의 배열 길이이며, 되먹임 한도 거부·사슬 끝으로 넘긴 중첩 호출의 실패·무동작 계획(insert의 [0, N] 밖 색인 포함)에서는 바뀌지 않은 현재 길이(branch는 `itemCount`, terminal은 `raw` 배열 길이, 그 밖은 0, settle의 `readArrayLength`)이다. pop·remove는 표시된 자리의 원본, update는 입력 값, clear는 `undefined`이다. 잘못된 종류 값에는 push와 `insert(0, x)`만 `[x]`를 표시하고 나머지는 무동작이다. 비배열 호출은 사슬 끝에서 `ARRAY_METHOD_ON_NON_ARRAY`를 `origin: 'write'`으로 보고하고 던진다. 배치 끝 정착은 통째 쓰기라 아이템 키는 위치로 잇고 정착·`onChange`는 한 번이다. 비용은 배열 계획/복사 O(배열 길이), 앞선 표시 합성 비용이며 노드별 고정 칸은 늘리지 않는다(33C-01, 35C-01, 62C-01, EVENT-035·061).

- `dispatchSetValue(node, value, option?)`, `dispatchResetSubtree(node, option?)`, `dispatchResetForm(root, value, option?, { deferValidation? })`, `dispatchMount(root, value?, option?, { deferValidation? })`, `dispatchBatch(node, fn: () => void, origin = 'write')`, `dispatchContextChange(root, context)`는 공개 쓰기 사슬을 연다. 폼 reset의 값은 `undefined`도 그대로 로드하는 필수 인자이며 이전 스냅숏을 다시 읽는 호출자는 그 값을 명시한다. `dispatchBatch`의 중첩은 바깥 배치가 이기고, 함수가 던져도 표시된 쓰기를 정착·배달한 뒤 그 예외를 사슬 끝에서 드러낸다. 쓰기가 둘 이상인 배치는 루트 한 번 정착으로 합치되 통째 교체 범위(잠복 원본 정리, whole 분배, 교체 나감 판정)는 표시된 경로의 합집합이고 얕은 Merge 표시는 받은 키의 자식 경로이므로, 쓰이지 않은 경로의 잠복 비활성 원본은 남는다. 배치 안 가상 노드 표시는 합성 때 참조 필드 키로 펼쳐지므로(호출 순서대로, 나중 필드 쓰기가 앞선 가상 쓰기를 이김) 합성 루트 입력에 가상 키가 남지 않고, 덮어쓰기 가상 표시는 참조 형제 경로를 교체 범위에 더하며, 가상 대상의 updater는 참조 필드 튜플을 읽고, 틀린 모양은 단일 쓰기처럼 표시 시점에 `INVALID_VIRTUAL_NODE_VALUES`를 던진다; 바인딩 입력(`dispatchWriteInput`)도 배치 안 표시이므로 틀린 가상 모양은 값 표시에서 던지고, 같은 진입의 외부 오류 지우기와 Edited 표시는 일어나지 않는다(EVENT-013–019·035·061, LANDING-064, 191C-01, 26C-10, R2).
- 입력 출처 쓰기 진입은 사슬 진입 칸에 `source: 'input'`을 싣는다. 이 출처는 `UpdateValue`의 `options.source`, 쓴 입력 자신을 제외하는 Refresh 판정과 늦은 쓰기 차단에 흐르며 공개 `SetValueOption`의 비트가 아니다. `handleChange`의 값 쓰기·외부 오류 지움·dirty를 한 `batch`로 묶은 진입 전체가 같은 표식을 갖고, 폐기된 노드의 표식 있는 셋은 조용히 버린다(REACT-009·010·011, EVENT-071, 69C-01·02, 실행 ADR D4).
- 입력 마침 진입은 동작 행의 `finishInput` 결과를 자동 쓰기로 적용한다. 문자열 `options.trim`은 바뀐 값만 쓰며 외부 오류와 dirty를 유지하고 입력을 Refresh한다. Form의 `disableAutomaticWrites`가 참이면 이 자동 쓰기는 억제된다(WRITE-083, TEST-020, 69C-01).
- 마운트와 폼 reset의 `deferValidation`이 참이면 로드 사슬 끝에서 검증을 요청하지 않고 바인딩의 공통 로드 슬롯이 커밋 뒤 컴파일·판정을 시작한다. 기본값은 거짓이며 core 호스트는 사슬 끝에서 직접 요청한다. 두 경로 모두 로드 뒤 `OnChange` 비트가 켜져 있으면 한 번 요청한다(69C-05, LANDING-041).
- 폼 reset 진입은 외부 오류와 검증 결과를 비운다. 바인딩의 `errors` 속성은 같은 reset 호출이 돌아오기 전에 현재 트리에 경로 키로 재적용하며, 비움과 재적용의 통지는 진입 끝의 규칙을 따른다(WRITE-045, 69C-03).
- `subscribeFieldNode(node, listener): () => void`와 `readFieldNodeRevision(node, mask?)`는 읽기이며 진입을 열지 않는다. 구독 사건은 `{ type, payload?, options? }` 모양이고, `revision(mask?)`는 리스너 유무와 무관한 해당 비트 카운터의 합이다(EVENT-001·004·007).
- `dispatchRequest(node, kind: FieldNodeRequestType): void`, `dispatchSetState(node, state)`, `dispatchSetSubtreeState(node, state)`, `dispatchClearSubtreeState(node)`, `dispatchSetExternalErrors(node, errors: readonly ValidationIssue[])`, `dispatchClearExternalErrors(node)`는 정착 밖 사건이다. 하위 트리 상태 두 진입은 navigation의 `visitFieldNodes`로 현재 형상을 전위로 걷고(형제는 `children` 순), 떼어진 노드에서는 그 하위를 건너뛴다. 전달은 파동 안에서 문서 순서로 정렬되므로(`deliverWave`) 방문 순서와 무관하다(SURFACE-062). 이 여섯 진입은 열린 진입이 없으면 큐에 넣은 사건을 바로 전달하고(`closeNonSettleEntry`), `visitSubtree` 순회 안에서는 순회의 묶음을 열어 전달을 순회 끝으로 미룬다. `dispatchValidate(node): Promise<readonly ValidationIssue[]>`는 호출할 때 새 판정을 요청한다(EVENT-012·045·063·067·073, VALIDATE-049).
- 비루트 노드의 외부 오류 쓰기·지우기는 노드 단위로 루트 목록에 귀속된다: 루트 외부 목록에서 그 노드가 앞서 보탠 참조와 `dataPath`의 표준 경로(`find()`로 푼 경로; `/`로 시작하면 그대로)가 그 노드의 경로인 항목을 빼고, 노드의 현재 목록 가운데 루트에 이미 같은 참조로 있는 항목은 자리를 지키며 나머지를 끝에 덧붙인 목록으로 루트를 갱신한 뒤, 루트의 `setExternalErrors`와 같은 경로(`globalErrors` 재계산과 루트 `UpdateError`·`UpdateGlobalError`)를 탄다. 루트 자신의 쓰기·지우기나 자식 전파로 합산(`globalErrors`)의 참조가 바뀔 때 `UpdateGlobalError`를 `globalErrors` 페이로드와 함께 올려 `onValidate`가 집계를 받는다. 한 batch 안의 여러 변경은 같은 노드의 대기 사건으로 합쳐져 한 번 전달된다(188C-01). 루트 목록이 이미 그 경로에 같은 항목을 같은 순서로 담고 있거나 뺄 항목도 더할 항목도 없으면 루트는 바뀌지 않고 사건도 없다. 진입(batch·쓰기) 안에서는 바뀐 노드를 런타임의 `pendingExternalErrorNodes`에 모았다가 최외곽 진입이 끝날 때 한 번만 재구성하고(떼어진 노드는 앞서 보탠 참조만 거두고 루트 항목은 노드의 표준 경로로 교체; 커밋이 떼어낸 노드가 루트에 보탠 참조가 있으면 그 노드를 대기 집합에 넣어 같은 진입의 재구성이 거둠), 진입 밖의 단일 호출은 즉시 재구성한다. 재구성 결과가 비면 루트 항목을 지운다. 비용은 재구성마다 루트 외부 목록 길이와 덧붙일 목록 길이의 합에 비례하는 한 번의 순회와, 바뀔 때만 새 배열 하나이다(기록: `core/__tests__/global-errors.timing.test.ts`). 자리는 0.16.0이 보장하지 않았으므로 첫 변경 순서로 끝에 덧붙이다. 최외곽 진입이 전달하는 동안 리스너가 만든 비루트 외부 오류 변경은 다음 전달 묶음 전에 재구성하며 같은 25회 한도를 따른다(185라운드, 188C-01, 195C-01, SURFACE-053, 178C-01).
- `adoptFieldNodeChain(previousRoot, nextRoot)`는 재생성 reset의 진입 깊이, 배치 표시, 예산과 모은 오류를 넘기는 바인딩 전용 통로이다. 대기 중인 비루트 외부 오류 변경은 경로 키 인계 전에 옛 루트 목록에 접고(195C-01), 외부 오류는 옛 노드 객체가 아닌 경로 키로 넘기고, 인계한 옛 트리는 settle의 폐기 계약에 따라 표시·리스너 해제·통지 없는 동기 번호 증가를 마친다. 검증기 등록 참조 수는 옛 트리 이펙트 정리에서 내린다. 인계는 컴파일하지 않으며 컴파일 실패로 던지지 않는다(EVENT-030, VALIDATE-046, WRITE-046·086, 69C-02·03).
- `adoptFieldNodeChain`은 이미 물러났거나 폐기된 루트에서나 그런 루트로의 인계를 상태를 바꾸기 전에 `DisposedNodeWrite`로 거부한다. 물러난 루트로 되돌아가는 인계는 `adoptedRoot` 연결을 고리로 만들어 활성 루트 해석이 끝나지 않기 때문이다.
- 전달과 사슬 종료(`runDeliveryWaves`·`flushQueuedEvents`·`deliverWave`·`exitFieldNodeChain`)는 리스너와 `onStateChange`·`onChange` 콜백이 돌아올 때마다 활성 루트를 `resolveFieldNodeChainRoot`로 다시 해석한다. 그래서 전달 중 리스너나 콜백이 `adoptFieldNodeTree`로 인계하면 남은 파동·전달과 사슬 마감은 새 런타임에서 끝나고, 새 런타임에 열린 진입이나 임시 오류 목록이 남지 않는다. 다시 해석할 때 지나간 런타임(연속 인계의 중간 런타임 포함)은 모두 모아 둘러싼 사슬의 오류 목록으로 되돌리고 `chainRoot`를 비우며, `onChange`가 올린 예산도 지나간 런타임마다 내린다. 묶음 함수의 오류와 정착 밖 전달의 `onStateChange` 오류도 다시 해석한 런타임에 담는다. 인계가 없으면 해석 결과가 같은 루트이므로 동작은 같다.
- `createFormErrorRecord`는 새 트리 생성에서 청사진 진단을 소비자에게 전달할 기록으로 바꾼다. 진단 코드를 그대로 기록 코드로 쓰고, 오류 객체가 없을 때의 메시지는 `<맨 이름> at <schemaPath>`이다. 던진 값의 기록 코드는 알려진 `FormErrorCode`일 때 그 값, 아니면 `LISTENER_THREW`이다. `FieldNode`가 이름 붙은 진입점으로 가져오며, 소비자가 없으면 서식을 만들지 않는다(ERROR-017·019, NODE-010).

### 사슬, 파동, 기록

- 진입은 같은 루트의 다른 공개 쓰기가 스택에 없을 때의 공개 쓰기 한 호출이다. 정착은 동기로 커밋하고, 깊이 1 → 0에서 정착 파동, 해당하는 검증 요청, `onChange`, 발생 순서의 `onError` 기록 전달, throw 순서로 끝난다. `onChange`는 최외곽 동기 진입당 마지막 파동 뒤에 최종 emit으로 한 번만 부른다. 루트 emit 참조가 그대로인 쓰기는 검증 요청과 `onChange`를 모두 만들지 않는다. 리스너 안의 쓰기는 같은 사슬의 다음 파동이고 `onChange` 안의 쓰기는 새 진입이다(EVENT-008·026·027·031·033, ERROR-004·019, 31C-01).
- `reset`은 emit 참조가 그대로여도 `ValidationMode`의 `OnChange` 비트가 켜져 있으면 검증을 한 번 요청한다. 이 예외만으로 `onChange`를 부르지는 않으며, `resetSubtree()`의 요청은 그 하위 트리에 적용하되 로드 전체 판정이 아직 남아 있으면 루트로 넓혀 형제 오류도 배정한다(EVENT-032·072, VALIDATE-052).
- `dispatchVisitSubtree(node, visitor)`는 공개 `visitSubtree`의 진입이다. 순회 자체는 사슬에 들어가지 않고 런타임의 `visitDepth`만 올리므로, 읽기만 하는 순회는 비용이 없고 리스너 안에서도 된다. 순회 중 쓰기가 `enterFieldNodeChain`에 닿을 때 열린 묶음이 없으면(`batchDepth`가 0) 그 진입이 묶음 하나를 함께 열고(`batchDepth = 1`, 여는 진입을 `visitBatchEntry`에 둠) 이후 쓰기는 `batch`처럼 표시만 된다. 가장 바깥 순회가 끝나 `visitDepth`가 0이 되면 열린 묶음을 `flushBatchWrites`로 루트에서 한 번 정착하고 사슬을 나간다. 쓰기가 없으면 아무것도 열지 않고, 바깥 묶음이 열려 있으면 합류만 하며 정착은 바깥 끝에서 한다. 순회 안의 정착 밖 진입도 열린 진입이 없으면 같은 묶음을 열어 전달을 순회 끝으로 미루므로, 순회 안의 전달 시점은 `batch` 안과 같다. 순회 안에서 쓰기 전에 연 `batch()`는 순회의 묶음에 합류해 자기 끝이 아니라 순회 끝에 정착한다. 오류 관찰자 안의 쓰기 거부와 리스너 되먹임 예산은 묶음을 열기 전에 평소대로 적용된다. visitor가 던지면 자기가 연 묶음이 있을 때만 그 오류를 사슬에 담아 표시된 쓰기를 커밋한 뒤 사슬 끝에서 던지고, 아니면 그대로 다시 던진다. 재생성 reset의 사슬 넘김은 `visitDepth`와 `visitBatchEntry`도 새 루트로 옮긴다(SURFACE-062, 191C-01).
- `batch(fn)` 안의 `reset`은 그 로드를 즉시 정착시키고 커밋은 함수 끝의 파동에 합류시킨다. 검증 요청과 해당하는 `onChange`는 최외곽 진입의 끝에서 낸다. `resetSubtree()`의 즉시 정착 범위는 그 하위 트리뿐이다(EVENT-015·072).
- 묶음 안에서도 떼어진 참조의 setValue와 배열 동사는 표시·정착·배달 없이 무동작이다. 생사 판정은 호출 시 직전 커밋의 detached 플래그를 따른다. finishInput도 기존 NODE-044 무동작 규칙을 유지한다. resetSubtree도 무동작이다.
- 파동 시작에 배달 집합과 리스너 목록을 고정하고, 리스너가 있는 노드만 문서 순서 위→아래로 정렬·순회한다. 리스너가 없는 노드의 리비전은 커밋에서 이미 기록된다. 최종 이탈 노드는 건너뛰며, 중간 구독은 다음 파동부터, 해지는 즉시 반영한다. 리스너 예외 하나가 다른 배달을 막지 않는다(EVENT-004·009–011, SETTLE-007, 44C-01).
- `injectTo`와 사용자 함수 안에서 공개 쓰기 API를 부르면 리스너 되먹임처럼 같은 최외곽 사슬의 안쪽 진입이 되고, 그 되먹임 파동 예산을 공유한다. 되먹임이 낸 파동과 `onChange`가 연 새 진입의 중첩 상한은 각각 25이다. 25번째 되먹임 파동은 배달하되 그 파동의 리스너 쓰기는 정착·커밋·통지 전에 조용히 거부하고, 리스너의 `batch`는 콜백 전체를 실행하지 않는다. 리스너 밖의 호출자 쓰기는 거부하지 않으며, 깊이 1 → 0에서 예산을 초기화한다. 허용된 커밋·해당하는 검증 요청과 `onChange`를 마친 뒤 모든 환경에서 `FEEDBACK_LIMIT_EXCEEDED`를 사슬 끝에 한 번 던지고 `diagnostics`에는 넣지 않는다(EVENT-008·020–022·034, CONTROLS-079).
- `setState`의 edited/touched 변화는 `UpdateState`, 외부 오류 변화는 `UpdateError`, 명령은 요청 비트로 표시한다. 깊이 > 0이면 노드마다 합쳐 정착 파동 뒤 별도 파동으로 한 번, 깊이 0이면 호출 안에서 동기로 배달한다. 이 사건은 검증 요청과 `onChange`를 만들지 않고, 떼어진 노드에는 무동작이다(EVENT-012·045·067·073, NODE-044, 31C-01).
- 상태 쓰기 진입 셋은 각 노드의 이전·다음 `interactionState`에서 참 여부가 달라진 키만 런타임의 셈에 반영하고 레코드 배달 기준의 상태도 그 값으로 옮긴다. 셈이 0↔1을 넘으면 공유 레코드 연산이 새 `globalState` 참조와 루트의 `UpdateGlobalState`를 대기시키며, 깊이 0이면 같은 호출에서, 열린 진입에서는 최외곽 끝의 정착 파동 뒤에 한 번 배달한다. 겹치는 참 노드가 남으면 참조와 사건은 그대로이다(EVENT-062·067, 43C-01, LANDING-152·153).
- 정착의 모든 종류의 실패 수집을 받아 사슬 끝까지 모은다. 한 정착의 게이트·공유 충돌·예산·주입 대상·쓰기 모양·파생·상태 키·커밋 규칙 실패는 모두 각자 한 번 사슬 오류가 되며 발생 순서대로 묶는다. 정착 실패가 발생 자리에서 사슬에 들어오므로 커밋 뒤 재수집하지 않고, 기존 가드 기록과 던진 오류의 병합 및 폼당 가드 하나의 기록 규칙을 유지한다. 보고기가 소비자를 가질 때만 기록과 경고 서식을 만든다. 단, `NON_JSON_WHOLE_VALUE`의 깊이 점검과 보고는 `hasConsumer()`와 무관하게 개발 모드에서만 한다. 기록은 발생 순서대로 전달한다. 하나의 예외는 원래 값을 던지고 여럿은 `SchemaFormError`의 `MULTIPLE_ERRORS`로 묶어 `details.errors`의 순서를 보존한다. 전달 중 같은 폼에 대한 쓰기는 즉시 `WRITE_IN_OBSERVER`로 거부하지만 `validate()`는 허용한다(ERROR-004·005·013·019·021·023·028–030·041, WRITE-099, 31C-02, 58C-01).
- 경고 중복 키는 코드·위치·코드별 판별 칸의 구조 키이다. 폼 수준 로드에서만 비우며 `setValue(V)`·`resetSubtree()`에서는 유지한다. 로드는 데이터 경로 역색인도 비운 뒤 대기 기록만 재색인하고, 배달된 일회성 경고 키는 역색인에서도 지운다. 대기 기록을 새 루트에 넘길 때도 현재 구조 키의 데이터 경로를 색인한다. 발생 기록 객체의 경로는 당시 경로로 남아 사슬 기록과 중복 보고되지 않는다. 추가 비용은 로드/인계의 대기 경고 수 × 깊이, 배달의 일회성 경고 수 × 깊이이다. 주인 없는 실패는 묶음의 잎마다 싱크에 한 번 보고하고 검증 결과 파동의 리스너 예외를 미처리 거부로 남기지 않는다. handler 예외가 원래 실패보다 먼저 host에 가는 검증 결과 파동과 OnChange 실행 실패의 순서는 유지한다. caller가 있는 validate·submit은 묶음 하나로 거부한다(ERROR-008·017·024·204, EVENT-046, 35C-09).
- 정착 밖 동기 파동이나 `onChange` 안에서 열린 쓰기 진입은 바깥 오류·기록 수집기를 스택으로 보존·복원하고, 안쪽 발생을 바깥 수집기에 순서대로 합쳐 사슬 끝에서만 보고한다. 검증 결과 파동의 origin은 validate이며 그 안쪽 쓰기의 리스너 오류도 `origin: 'validate'`로 한 번 보고하고 싱크로 한 번 보낸다. 명시적 `validate()`의 검증기 실패는 거부 전에 `origin: 'validate'`로 한 번 보고한다(ERROR-004·019·022·023, EVENT-010·046).
- 쓰기 사슬과 정착 밖 파동은 같은 발생→기록 병합을 사용한다. 먼저 저장된 오류 기록과 뒤따른 `SchemaFormError`의 코드·스키마 위치가 같으면 수집 호출마다 첫 병합에서만 기존 기록의 오류·상세를 갱신하며, 묶음의 첫 오류를 유지한다. 새로 만든 기록은 같은 수집에서 병합 대상으로 쓰지 않으며, 노드에 묶인 예외의 `path`·`schemaPath`를 보존한다. 가드 실패는 폼마다 가드 하나당 `GUARD_FAILED` 기록 하나이며(같은 가드의 뒤따른 실패는 던지되 다시 기록하지 않음), 가드 실패 기록은 mount 점검을 포함해 그 mount를 연 사슬의 origin을 쓴다(첫 mount·reset·rebuild는 load, 쓰기 리스너·onChange의 reset은 write)(ERROR-017·023·041).

### onError origin

`onError?: (record: FormErrorRecord) => void`는 발생마다 해당 기록 하나를 전달합니다. 기록의 필수 `origin`은 발생을 만든 연산을 나타냅니다.

| origin | 연산 |
| --- | --- |
| `load` | 트리 구성·mount·reset·rebuild·검증기 변경과 그 로드 사슬 |
| `write` | 공개 쓰기·배열 동사·상태·batch·맥락·finishInput·외부 오류 및 통지 리스너 |
| `validate` | 자동·명시적 전체 스키마 컴파일·실행, 판정 전달 및 그 리스너 |
| `submit` | SubmitWhileDegraded와 네이티브 submit의 capture에서 처음 드러난 실패 |
| `render` | RenderFailed 경계 및 ChildNodeComponentsOnTerminal 같은 렌더 계층 경고 |

사슬을 연 가장 바깥 연산이 origin을 정합니다. reset의 onChange 안에서 중첩 쓰기가 나면 `load`이며, 쓰기 사슬의 노드 리스너나 폼 onChange가 reset을 호출하면 `write`입니다. 검증 결과 파동 리스너의 실패는 `validate`이고, 로드 직후 독립 setState 리스너의 실패는 `write`입니다. 최초 commit의 외부 errors 적용은 `load`, errors prop 변경은 `write`입니다. 제출 안의 dispatchValidate가 이미 보고한 실패는 `validate`를 유지합니다. 개발 콘솔의 warnDevelopmentIssue 경고는 기록이 아닙니다. caller의 거부 값은 오류 묶음 하나이며 개별 기록에는 묶음을 싣지 않습니다. 부른 쪽이 없는 실패는 잎 순서로 host에 보내며 렌더 경계만 잡은 값 그대로 기록합니다. 전달 시점·중복 제거·caller 거부·재진입 규칙은 유지합니다.

startFieldNodeChain은 enclosingChain이 없을 때만 chainOrigin을 정하고 adoption이 이를 옮깁니다. 최외곽 exit는 전달 후 chainOrigin을 비우고 지나간 stale runtime도 비웁니다. 독립 flushQueuedEvents는 write 또는 validate origin을 받아 임시로 설정한 뒤 finally에서 이전 값을 복원합니다. 대기 기록은 선택 origin을 허용하고 deliverChainRecords가 누락 origin을 전달 직전에 채웁니다. collectChainRecords의 호출별 merged Set은 같은 기록의 오류·상세를 첫 병합에서만 갱신하며 묶음의 첫 오류를 유지합니다. 시간 비용은 기존 발생 순회 O(N), 추가 메모리는 오류 수에 비례한 호출별 Set과 트리 런타임의 선택 origin 한 칸입니다.

읽을 수 없는 중첩 묶음(details·errors getter, index·length 읽기 실패)은 capture에서는 unknown으로 처리하고 호스트 순회에서는 같은 identity의 불투명한 잎으로 보냅니다. 호스트 순회는 묶음의 own 원소를 방문 전에 임시 배열에 읽어 두므로 뒤 원소를 읽지 못해도 앞 원소를 부분 전달하지 않습니다. snapshot과 frame·visited는 호출별 O(N) 임시 메모리이며 영구 필드를 추가하지 않습니다. visit·sink callback의 예외는 삼키지 않습니다.

호스트 순회는 배열의 첫 길이를 고정 범위로 쓰고 정수 1..2^32 − 1과 모든 own index, 마지막 길이의 동일성을 확인합니다. 호출별 원소 점검 예산 1,000,000개를 모든 nested snapshot이 공유합니다. reader는 snapshot 전에 길이를 예약하고 실패해도 환불하지 않습니다. invalid·변한 길이·예산 초과인 묶음도 원래 identity의 잎 하나이며 최종 sink가 묶음을 받을 수 있습니다. callback 예외는 입력 검사 catch 밖에서 전파합니다.

## Acceptance Criteria

### dispatch-array-entry — 배열 진입과 배치 표시

- 여섯 배열 진입은 거부 시 push·insert는 현재 길이, 나머지는 `undefined`이며 배치 안에서 앞선 표시를 읽고 동기 결과를 반환한다. 배치 안에서 섞은 insert·remove는 호출 자리마다 앞선 표시 위의 새 길이·지운 값을 돌려주고 끝의 통째 쓰기로 한 번 정착한다. 배열 동사를 포함한 배치는 한 번 정착·통지하며 경로가 옮겨진 아이템과 자손의 이전·현재 경로를 배달한다(33C-01, 35C-01·02, 62C-01, EVENT-035·068).

### dispatch-source-details — 자동 쓰기의 원천 경로

- 같은 대상을 겨눈 서로 다른 `injectTo` 선언의 대상 없음·가상 쓰기 모양 실패는 각각의 `details.sourcePath`를 오류 기록에도 유지한다. 기록의 `path`는 대상 경로이고 `details`는 오류의 상세와 같은 참조이다. 호출자 경로의 쓰기 모양 오류에는 `sourcePath`를 더하지 않는다(ERROR-017·195, 59C-01).

### dispatch-order — 진입당 배달과 검증 순서

- 커밋에서 표시한 비트를 문서 순서의 파동으로 한 번 배달하고, 최외곽 진입에서 검증 요청과 `onChange`가 모두 생기면 요청이 앞서며, 중첩 쓰기는 정해진 다음 파동에서 보이다(EVENT-004·007·008·027·031·032, SETTLE-007).

### dispatch-observers — 정착 밖 사건과 오류 격리

- 상태·오류·명령은 원본을 정착시키지 않고 같은 비트 공간으로 배달하며, 리스너 및 보고기 예외가 나머지 전달을 막지 않는다. 전달 중 쓰기와 예산 초과의 오류 시점은 계약을 따른다(EVENT-010·012·045·067·073, ERROR-005·028·029).

### dispatch-boundary — 의존 방향

- 새 엔진이 레거시·플러그인·React를 가져오지 않고 검증 결과 배달은 콜백만으로 역방향에 닿는다(NODE-016·045, CONTROLS-075, GOAL-088, LANDING-084·159).

### ownerless-leaves — 호스트 전달 순서와 identity

- 유효한 중첩 묶음의 잎을 깊이 우선·원소 순서로 보낸다. 순환·재방문·빈 배열·hole·plain-object 묶음은 그 값을 한 번 방문하며 깊이 50,000에서도 재귀하지 않는다.

### settle-disposal — 재생성 트리의 폐기

- 인계된 옛 트리는 통지 없이 두 번호가 동기로 오르고 리스너가 해제된다. 참조 연결과 마지막 커밋 읽기를 유지하며, 입력 출처 표식이 있는 늦은 쓰기만 조용히 버리고 나머지는 `DISPOSED_NODE_WRITE`로 거부한다(WRITE-046·086, 69C-02).

### settle-form-reset-errors — 폼 로드의 오류 초기화

- 같은 트리와 재생성 트리의 reset 모두 명령형 외부 오류·검증 결과를 비우고, 호출이 돌아오기 전에 바인딩이 경로 키 `errors`를 재적용한다(WRITE-045, 69C-03).

## Boundary Exemptions

### `utils/report/forEachFailureLeaf.ts` — write의 호스트 전달 규칙 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 실패 묶음의 의미는 write의 오류 배달 계약이 소유하며 engine sink와 core 바인딩이 같은 순서를 사용해야 한다. Amendment 15가 지정한 이 소유권을 유지하고 core를 통해 provider에 명명 재수출한다. provider는 구현 파일을 직접 가져오지 않으며 별도 공유 모듈이나 React 의존을 만들지 않는다.

### `types/` — 형 칸 유지

- **Consumers**: `entry-point`
- **Direct import**: `not allowed`
- **Reason**: 형 칸의 형은 이름으로 진입점을 거쳐 engine의 집계 진입점과 노드 겉면에 제공되며, 형은 구현이 아니므로 칸에 두고 진입점이 이름으로 내보낸다.

## Last Updated

2026-11-02
