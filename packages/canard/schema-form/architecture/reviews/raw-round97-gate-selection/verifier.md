# 97라운드 원자료 — 게이트 선택 설계안의 독립 검증(Claude 검증자, 읽기 전용)

2026-10-06. 원장 관리자가 07의 설계안 `verification/07-switch/gate-selection-design.md`(가지 `feat/schema-form-switch`의 `4d2e54533`)를 제품 코드와 대조하도록 Claude 검증자(읽기 전용, 시험·빌드·측정은 실행하지 않음, 모든 근거는 코드 추적)에게 맡긴 결과다. 경로는 07 워크트리의 `packages/canard/schema-form/src/core/` 기준이다. 엔진: Claude 검증자(antigravity는 앞서 G32에서 없는 경로를 인용해 쓰지 않았다).

판정: 조건부 통과. 판별 선택 표(가)와 결과 재사용(나)의 핵심 동치 논증은 코드와 맞으나, 문서에 적힌 그대로 구현하면 안 되고 아래 조건을 설계에 먼저 반영해야 한다.

## 발견(심각도순)

1. 후보 축약이 퇴장 대기 노드를 놓친다(그럴듯함, 경로는 코드로 확인). 설계 6.3절 B5 행의 "prior/live/입력/latent 후보만"이 문제다. `settle/utils/compute/selectChildren.ts:172-180`은 거짓 엔트리에서도 `pendingExits`에 있는 노드의 `throwingGateExits` 표시를 지운다. `computeNode.ts:73`의 prior는 같은 정착 안 이전 바퀴의 형상이라, 앞 바퀴에서 퇴장한 노드는 prior에 없고 `pendingExits`에만 있다. 반례: 페이로드 게이트가 [판별 앞 항, 던지는 일반 active]이고, 첫 바퀴에서 앞 항이 참·뒤 항이 예외라 노드가 퇴장한 뒤, 전이 라운드에서 derived가 kind를 바꿔 앞 항이 거짓이 되면 기준 실행은 표시를 지우고 최적화 실행은 남겨 `transition/finalizeExits.ts:73-78`의 퇴장 정책이 갈린다.
2. 투영 세대가 무엇으로 바뀌는지 정의되어 있지 않다(코드 사실은 확인). 설계 4.2절·5.1절. 기존 `gates/getGateRegistry.ts:172-186`은 `changedRaw`만 보는데 투영은 유효 스키마에 의존한다(`behaviors/utils/slots/projectEmpty.ts:7`, `behaviors/objectBehavior/utils/projectObject.ts:9-11`). 원본이 변하지 않아도 읽기 값이 바뀌는 길: `compute/primeHost.ts:50-58`의 기준 스키마 복원과 분기 overlay; `gates/readProjectedValue.ts:13-17`의 미계산 구간; 같은 파일 36-40행의 wrong-kind 조상; 판별자는 호스트 emit 전체와 extras를 읽으므로(`gates/evaluateGate.ts:36-60`) 루트 호스트의 `selectNodeSchema`가 바퀴 도중 스키마를 바꾸면 키 값이 그대로여도 결과가 달라질 수 있음; 같은 이름에 종류가 다른 엔트리가 먼저 활성되면 읽는 노드 자체가 바뀜(`selectChildren.ts:197-209`).
3. 레지스트리 색인이 형상 dirty 판정과 재사용 유효성을 섞는다(요구 의미는 확인). 설계 6.2절. 형상 dirty 판정은 기존 `readsChanged`와 정확히 같아야 한다: 루트 읽기 `''`는 항상 참; 조상과 자손 양방향 교차; `'@'`는 무시; 판별자의 감시 경로는 host/propertyName(`getGateRegistry.ts:159-163`); own 발생과 edge 발생의 구분(같은 파일 121-126행); `locate`가 나중에 더한 발생 포함(89-100행); 매 호출마다 누적 `changedRaw`와 `dirtyPaths`의 교집합(`write/registerRecalculation.ts:35-49`). 판정이 더 좁으면 기준 실행이 도는 바퀴를 건너뛰고 그것은 사실상 직전 활성 집합에서 출발하는 것이다. 증분 처리도 안 된다 — 전이 라운드는 누적 집합으로 다시 부르고 `transition/restoreSourceB.ts:37-38`은 집합을 재설정한다.
4. 같은 세대 읽기 병합이 호스트 공표 시점을 바꾼다(그럴듯함). 설계 5.1절·6.3절 B4 행. 기준 실행은 판별 게이트 위치마다 호스트를 flush한다(`gates/flushPendingGateReads.ts:80,94`, `readProjectedValue.ts:61`). 병합하면 `compute/updateOutput.ts:42-53`에서 `changedNodes`에 넣는 순서가 바뀌고 그 순서는 배달 방문 순서로 이어진다(`commit/commitGlobalState.ts:28`, `commit/markCommitDeliveries.ts:101-103`, `record/utils/markSchemaNodeEvent.ts:15-26`). 값이 달라지는 반례는 찾지 못했다.
5. 정적 계획으로 바꾸면 다음 입력이 달라질 수 있다(그럴듯함). `computeNode.ts:74-135`의 게이트 목록은 `gates.length > 0` 여부(`primeHost` 실행과 즉시 반영)와 바퀴 상한(`gates/getGateBudgetCap.ts:65-80`)을 정하며 라운드마다 발견되는 이동 게이트와 배열 엔트리가 든다. 잠복 owner 제거(설계 4.1절)도 영향이 있다: `write/getDependencyIndex.ts:69`는 페이로드 선언 경로를 모두 owner로 넣고, 그 owner는 `stateDirtyNodes`·`dependencyOwnerPaths`를 거쳐 `compute/publishStateKeys.ts:20-23`, `commit/commitExitPolicyValues.ts:52-56`, 배달 후보로 이어진다.
6. 세부(확인). 판별 키가 분기에만 선언되면 `blueprint/utils/analyze/populateNodeChildren.ts:90-100`이 무게이트 사본을 만든다 — 설계 3.1절의 "본체 직접 키"는 이 흔한 꼴을 빼므로 적용 범위의 문제다(정확성 문제는 아님). bucket은 `gate.condition.values`(교집합을 거친 값, −0·undefined·NaN·객체가 들 수 있음)로 만들어야 한다. 경로 정규식은 따옴표 바로 뒤의 경로만 막아(`blueprint/utils/expressions/regex.ts:22`) `'a ./x'` 같은 리터럴 안의 경로도 의존성으로 잡히고 기준 실행은 모든 의존성을 읽으므로(`evaluateGate.ts:109-113`) 표 자격에는 의존성이 정확히 하나라는 조건이 필요하다.

## 현재 구조 서술과의 불일치

- `selectNodeSchema`는 루트에서만 불린다(`computeNode.ts:47,58,119`). 루트가 아닌 호스트의 분기 게이트는 부모의 `selectChildren`에서 owner가 부모인 채로 평가되므로 "호스트 선언 다음 직접 에지"의 순서와 "첫 표 게이트 위치"는 루트에만 해당한다.
- active가 판별자 뒤에 온다는 서술은 맞으나 넣는 곳은 재귀 호출의 `collectDeclarations.ts:47-60`이고 154-163행은 `if` 게이트를 넣는다.
- `mayChangeAt`은 레지스트리 전체가 아니라 위치별 발생만 순회한다(분기 수에 선형이라는 결론은 맞다).
- 맞는 서술: 판별자는 `Object.is`로 비교한다(`evaluateGate.ts:70`); 겹침 검사는 0과 −0, NaN과 NaN을 같은 값으로 보고 거절한다(`readDiscriminatorBranches.ts:114-124`); 단락 평가, `appliesWhen` 선평가, 예외 기록.

## 결과 재사용(나)의 결론

조건 2와 6을 갖추면 충분하다. 읽기를 바꾸는 쓰기는 같은 정착 안에서 바퀴를 다시 돌게 하고, 실패한 커밋(`restoreSourceB`, 예산 초과)은 설계대로 버려진다. 반례는 찾지 못했다.

## 조건

1. B5 후보에 `pendingExits`의 키(경로와 종류)와 `throwingGateExits` 구성원을 넣는다. 발견 1의 반례를 전수 평가와 두 최적화를 모두 켠 실행으로 비교한다.
2. 밀어 넣는 방식의 세대 대신, 원래 위치마다 O(1) 동일성 검사를 한다. 판별자는 `flushPendingOutput(host)`를 부른 뒤 host.emit·extras·projectedHost의 참조를 비교하고, active 키는 구조상의 노드·emit·미계산 구간을 비교한다. 하나라도 다르면 다시 읽는다. 이러면 발견 4의 공표 위치도 보존된다.
3. 읽기 키는 그 이름의 엔트리가 하나일 때만 자격을 준다.
4. 레지스트리 색인은 `readsChanged`의 의미 그대로, 매 호출 누적 집합에 질의한다. 모든 `registerRecalculation` 직후의 `shapeDirtyPaths`를 전수 평가와 비교한다.
5. 정적 계획은 기존과 같은 게이트 집합과 바퀴 상한을 내야 한다. owner 축약은 증명 전까지 넣지 않는다.
6. 슬롯은 실패 없는 커밋에서만 저장하고, 마지막 평가 이후 읽기가 건드려졌으면 저장하지 않는다.

## 시험 계획에 빠진 경우

발견 1의 반례; overlay(omitEmpty)로 읽기 값이 바뀌는 경우와 루트 호스트 스키마가 바뀌는 경우; 같은 이름에 종류가 다른 읽기 키, 분기에만 선언된 판별 키; −0·undefined·NaN·객체 const; 리터럴 안의 경로, 루트가 아닌 호스트; 이동 게이트가 있을 때의 바퀴 상한; `changedNodes` 순서와 배달 순서의 기록; 위치별 그림자 평가(같은 실행에서 전수 평가의 결과와 최적화의 결과를 그 자리에서 대조).

## 확인하지 못한 것

시험·빌드·측정은 실행하지 않았다. 배달 디스패처가 Set 순서를 그대로 따르는지, 잠복 owner 축약이 실제로 관찰 가능한 차이를 내는지 확인하지 않았다. 진단 계수와 벤치 픽스처는 읽지 않았다.
