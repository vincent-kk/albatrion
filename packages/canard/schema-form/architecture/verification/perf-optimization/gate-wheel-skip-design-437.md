# 결정 58 실험 설계 — 게이트 호스트의 확인 바퀴 조건부 생략 (437라운드 초안)

이 문서는 437라운드에 디버거(Claude Opus)가 읽기 전용으로 코드와 원장을 조사해 낸 설계 초안이며, 코디네이터가 그대로 보존한다. 구현·측정은 하지 않았다. 채택은 실험 결과를 Vincent가 본 뒤 정한다(387라운드 소유자 답). 근거 자료는 `size-diagnosis-437-results.md`의 "oneOf 갱신 세부"다.

결론부터 적는다. 게이트 읽기 집합을 새로 뽑지 않고도 확인 바퀴를 조건부로 생략할 수 있다. 근거는 정적 읽기 집합이 아니라, 바로 앞 바퀴에서 각 게이트가 실제로 받은 입력 값이 바퀴가 끝난 상태에서도 같다는 동일성 검사다. 원래 결정 58 장면(gate-form-one-key, 노드 게이트 K개)이 oneOf보다 더 직접적인 대상이다.

## 1. 바퀴 루프의 실제 동작

- 출발점은 primeHost다. `computeNode.ts:99`에서 prior를 고정하고, `:102-144`에서 선언·간선·이동(relocated) 게이트를 모은다. `:145`의 primeHost가 구조를 게이트 없는 기준선으로 되돌린다(`primeHost.ts:48-58`, `:106-113`). 코드에서 SETTLE-018의 출발점 A는 이 호출이다.
- 상한은 "닿는 결정 수 + 1"이다. `getGateBudgetCap.ts:86-92`가 호스트 게이트들이 닿는 조각 결정과 노드 게이트 결정(`:40-57`)을 세어 1을 더한다. 바퀴 중 이동 게이트가 늘면 `computeNode.ts:168-176`에서 다시 계산한다.
- 바퀴 한 번의 구성: 루트에서만 selectNodeSchema가 모든 선언의 게이트를 평가하고 스키마 참조가 바뀌면 true를 돌려준다(`computeNode.ts:153-154`, `selectNodeSchema.ts:27-29`, `:90-93`). 이어서 selectChildren(`:155-161`), 더러운 자식 계산(`:162-164`), updateOutput의 반환인 outputChanged(`:167`)가 온다.
- childrenChanged의 출처는 다섯 곳이다: 엔트리 제거(`selectChildren.ts:236-246`), 새 자식(`:339-348`), 자식 유효 스키마 변경(`:363-373`), next[name]과 자식의 불일치(`:387-390`), 최종 자식 목록 비교(`:465-468`).
- 정지 조건은 세 값이 모두 false인 바퀴다(`computeNode.ts:178-182`). 상한까지 정지하지 못하면 hostWheelExceeded가 남고(`:184`), 전이 단계가 BudgetExceeded로 기록한다(`transitionSettlement.ts:209-221`).
- 첫 바퀴는 구조적으로 거의 항상 "바뀜"이다. primeHost가 게이트 자식을 뺀 기준선에서 출발하므로, 켜진 게이트 자식이 하나라도 있으면 첫 바퀴의 `:387-390` 또는 `:465-468`이 참이 된다. 그래서 게이트 자식이 켜진 호스트는 계산 한 번에 최소 두 바퀴를 돌고, 둘째 바퀴가 확인 바퀴다.
- 437의 round 0/1과 "두 쌍": round는 한 computeNode 호출 안의 바퀴 번호다. 첫 쓰기의 두 쌍은 computeNode(root)가 두 번 불린 것이며 primeHost는 2회다. 두 번째 호출은 전이 단계가 자동 쓰기를 낸 뒤 재계산을 등록하고 부른 것이다(`transitionSettlement.ts:184-189`, `:206-208`). 가설: kind_{N-1} 분기의 payload 셋은 잠복 값이 없어 default 채움(`branches.ts:31-33`)이 자동 쓰기가 된다. 둘째 쓰기의 payload_0_*은 첫 쓰기에서 저장한 잠복 값으로 복원되어 채움이 없다. 두 번째 호출의 round 0은 primeHost가 다시 기준선으로 되돌렸기 때문에 childrenChanged=true이며 생략 대상이 아니다.

## 2. 확인 바퀴가 읽는 것과 같음이 보장되는 조건

- 게이트 입력은 세 경로뿐이다. 식 게이트는 occurrence.watchPaths마다 readProjectedValue 값을 읽고 `@`는 runtime.context를 읽는다(`evaluateGate.ts:164-173`). if·판별 게이트는 호스트 투영 값과 호스트 extras를 읽는다(`:44-47`, `:66-90`). appliesWhen의 부모 게이트는 재귀로 같은 함수를 지난다(`:36-40`). readProjectedValue는 노드의 emit, 조상 emit의 하위 값, undeclaredValues 가운데 하나를 돌려주고, 아직 계산되지 않은 변경은 undefined로 돌려준다(`readProjectedValue.ts:15-22`, `:30-91`).
- 바퀴 k+1의 입력이 달라지는 길은 모두 바퀴 k 안의 가우스-자이델 효과다. 바퀴 사이에 새 쓰기는 없다. 길은 다섯이다: (가) 앞 게이트가 평가된 뒤 뒤 엔트리가 켜져 키가 투영에 나타남(분배 입력과 잠복 복원 `selectChildren.ts:286-300` 포함), (나) 자식의 유효 스키마나 overlay가 바뀌어 원본은 그대로인데 emit이 바뀜(`:363-373`), (다) 꺼진 엔트리가 제거되어 키가 사라짐(`:236-246`), (라) 루트 스키마 변경이 루트 투영을 바꿈(selectNodeSchema), (마) 이동 게이트 추가나 scheduleRelocatedGates가 자손을 더럽힘(`computeNode.ts:168-177`). 상속 overlay는 호스트 루프 동안 바뀌지 않는다.
- 게이트의 정적 의존 목록은 이미 있다. 식 컴파일러가 의존 경로를 BlueprintExpression.dependencies로 둔다(`blueprint/types/blueprint.ts:78-81`, `compileBlueprintExpressions.ts:89-106`, `createDynamicFunction.ts:35`). 레지스트리가 발생마다 절대 경로 watchPaths로 묶고(`getGateRegistry.ts:238-258`), 표시 단계가 이것으로 형상 dirty를 정한다(`registerRecalculation.ts:41-64`, `getGateRegistry.ts:180-201`, `:261-281`). if 게이트의 watchPaths는 호스트 경로 하나, 판별 게이트는 propertyName 경로 하나다(`:240-250`). controls.watch는 derived·감시 쪽 의존이며 게이트 판정에는 쓰이지 않는다(SETTLE-043).
- BLUEPRINT-007 (a)는 제품 코드에 구현되어 있지 않다. 가장 가까운 것은 유니온 호스트의 직접 선택 계획이며 dependencies.length === 1을 요구하지만 "condition still runs on every visit"다(`getDirectChildSelectionPlan.ts:12`, `:96-106`). 96C-01 (가) 판별 선택 표는 99라운드에 구현했다가 되돌렸다(`reviews/round-99-closing.md:3`). (나) 결과 재사용은 제품 코드에 없다.
- 정확한 조건: 바퀴 k에서 각 게이트가 받은 입력이 바퀴 k가 끝난 상태에서 같은 자리를 다시 읽은 값과 모두 같고, 바퀴 k가 자손 일거리를 남기지 않아야 한다. 이 둘이 성립하면 바퀴 k+1은 귀납적으로 같은 순서로 같은 값을 내고 아무것도 바꾸지 않는다. 쓰면 안 되는 조건: "바퀴 중 바뀐 원본 키(changedRaw)와 선언된 의존의 교집합". (나)와 (라)는 원본 경로를 건드리지 않고 읽는 값을 바꾸기 때문이다(97C-01 (2)).

## 3. 실험 설계: 조건부 생략

술어 P는 `computeNode.ts:177` 뒤, `:178` 정지 판정 앞에서 검사한다. P가 참이면 `:179-181`과 같은 마무리(preserveReferences, dirtyPaths 삭제) 뒤에 반환한다.

- P1: round + 1 < cap(갱신된 cap). 거짓이면 지금처럼 루프를 끝내 hostWheelExceeded를 남긴다(예산 초과 보고를 지우면 관측이 바뀐다).
- P2: 바퀴 k에서 게이트 목록이 늘지 않았다(`computeNode.ts:170-175`). 새 게이트는 바퀴 k에서 평가되지 않았다.
- P3: 바퀴 k 끝에 dirtyChildren(node, context)가 비어 있다(`dirtyChildren.ts:19-31`).
- P4: 바퀴 k 동안 gateThrowVersion이 그대로다(`evaluateGate.ts:178`; 보수 조항).
- P5: context.pendingOutputs가 비어 있다. 끝의 재읽기가 flushPendingOutput을 부르지 않아야 공표 자리와 배달 순서(EVENT-005)가 그대로다(`flushPendingOutput.ts:17`, `readProjectedValue.ts:35`, `:45`, `:66`, `:88`).
- P6(핵심): 바퀴 k 동안 이 호스트 프레임의 evaluateGate가 읽은 모든 (경로 → 값)이, 끝에서 같은 경로를 다시 읽은 값과 Object.is로 같다. 식 게이트는 의존 값을, `@`는 runtime.context 참조를, if·판별 게이트는 raw 참조와 projectedExtra 참조를 기록하고, appliesWhen은 재귀 호출이 스스로 기록한다. 같은 경로가 한 바퀴 안에서 다른 값으로 읽혔다면 P6은 거짓이다. 기록 비용은 평가마다 맵 연산 한 번이고, 끝 검사는 서로 다른 경로 수만큼의 재읽기다(oneOf와 S1에서는 1).
- P7(범위 제한): context.kind !== 'load', !context.distributedInputs.has(node), !context.exceededBudget. 꺼진 엔트리 분배(`selectChildren.ts:405-448`)의 멱등성을 증명하지 않은 범위를 뺀다.
- 프레임 격리: computeNode는 재귀이므로 증인 맵을 호스트 프레임마다 두고 중첩 호출 전후로 저장·복원한다. 자식 호스트 바퀴의 읽기는 부모 증인에 넣지 않는다.

원장 합치 논증:

- SETTLE-020 결과 동치(귀납): 바퀴 k+1의 i번째 평가 직전 상태는 바퀴 k의 끝 상태와 같다(1~i−1 단계가 무동작이라는 귀납 가정). P6에 의해 입력이 바퀴 k의 i번째 입력과 같고, 식은 순수하므로 값이 같다(FRAGMENT-048의 AND 포함). 같은 값에 대해 선택 단계는 무동작이다: 자식은 이미 next에 있고(`selectChildren.ts:274-277`), 유효 스키마는 같은 메모 참조이며(`settle/DETAIL.md:164`), 더럽지 않으므로 computeChild가 없고(P3), 실패는 동일성 키로(`recordSettlementFailure.ts:24-26`), 경고는 warningKeys로 중복 제거된다(`selectNodeSchema.ts:50-51`). 따라서 k+1은 세 값이 모두 false로 끝났을 바퀴이고, 생략은 그 바퀴를 실행하지 않는다는 점만 다르다. 실행된 바퀴는 여전히 모든 게이트를 평가한다. 바퀴 수는 원장이 상한으로만 정한다(SETTLE-017).
- SETTLE-018: primeHost는 매 호출 그대로 돌고, 생략은 그 출발점에서 한 바퀴를 모두 돈 뒤에만 적용된다. 직전 커밋의 active는 읽지 않는다.
- SETTLE-001: 표시·계산·파생·전이·커밋의 순서와 전이·파생이 부르는 재계산(`transitionSettlement.ts:206-208`, `runDeriveRounds.ts:128`)은 손대지 않는다. 바뀌는 것은 계산 단계 안 호스트 루프의 반복 횟수뿐이다.
- SETTLE-044: 양의 순환 문제는 "이전 결과에서 출발"할 때 생긴다. 생략은 출발점이 아니라 정지 판정을 바꾸며, 그 판정은 "다음 바퀴의 모든 입력이 같다"는 증명이다. 바퀴 안에서 뒤 엔트리가 앞 게이트의 키를 켜면 P6이 거짓이 되어 다음 바퀴가 돈다. if 게이트는 입력 참조만 견주므로 GOAL-034와도 충돌하지 않는다.
- 원장 판단이 필요한 점: P6은 실행 중 실제로 받은 입력을 기록한다. 이것이 BLUEPRINT-007의 "게이트가 무엇을 읽는지는 기본적으로 뽑지 않는다"와 충돌하는지는 원장 관리자나 Vincent가 판단한다. 디버거의 판단은 충돌하지 않는다는 것이다: 새 추출이 아니라 이미 컴파일된 dependencies(96C-01 (나)가 "정적으로 알려진다"고 인정)와 인자 동일성을 쓰고, 커밋 사이에 남는 상태가 없다.

## 4. fixture 가족 "gate-form-one-key"

- S1(원래 결정 58 장면): `probe-write-paths.ts:27-28`, `:241-257`, `:512-530`. 호스트 h 아래 자식 K개가 '../sw >= 0' 노드 게이트를 갖고 h.sw를 1에서 2로 쓴다. 기대: 바퀴 2→1, evaluateGate 2K→K, selectChildren 2회→1회(`write-paths-measurement.md:225`). 형상과 값은 바뀌지 않는다.
- S2(oneOf-N 전환): `branches.ts`, kind_0→kind_{N-1}→kind_0, N = 5·20·80, 같은 oneOf를 /obj 아래 둔 비루트 변형 추가. 기대: 첫 쓰기 바퀴 4→2, 게이트 16N→8N; 둘째 쓰기 바퀴 2→1, 게이트 8N→4N.
- S3(새로 켜진 조각이 선언한 키를 앞 게이트가 읽는 양의 순환 꼴): allOf[0]은 './extra === "on"'일 때 p를 켜고, allOf[1]은 './mode === "x"'일 때 extra를 선언한다. mode x에서 extra='on'을 쓰고, y로 바꾼 뒤 x로 되돌리면 extra가 잠복에서 복원된다. 마지막 쓰기의 바퀴 0에서 allOf[0]은 undefined를 읽어 거짓이 되고 extra가 들어오므로 P6이 거짓이 되어 바퀴 1이 p를 켜야 한다. 대조: A는 './bkey === true || ./mode === "x"'일 때 akey를, B는 './akey === true'일 때 bkey를 선언하고, mode를 x→y로 바꾸면 둘 다 꺼져야 한다(`settle.gates.test.ts:425` 꼴).
- S4(같은 호스트의 두 게이트가 다른 키를 읽음): './k1 === "on"'이 p를, './k2 === "on"'이 q를 켠다. k1을 쓰면 생략이 적용되어야 한다.
- S5(중첩 키): './cfg/mode === "x"' 게이트에 cfg/mode를 쓰면 생략. 변형으로 켜진 분기가 cfg에 overlay(omitEmpty 등)를 얹어 원본은 그대로인데 읽는 값이 바뀌면 P6이 거짓이어야 한다(`fixtures/gateSelectionCases.ts:227` 꼴).
- S6(게이트 입력을 바꾸지 않는 쓰기와 if 게이트 대조군): oneOf 폼의 common을 쓰면 형상 dirty가 아니므로 바퀴 0(`computeNode.ts:90-97`). 검증기 if 게이트 호스트에 쓰면 생략되지 않아야 한다.
- 변이 목록(각 변이는 지정한 단언을 뒤집어야 한다): V1 P6을 끄고 무조건 생략 → S3에서 p가 빠짐. V2 P6을 changedRaw 비교로 → S5 overlay 변형이 뒤집힘. V3 바퀴 시작에 없던 노드의 읽기(undefined)를 무시 → S3 뒤집힘. V4 emit 대신 구조 노드 정체성만 비교 → S5 변형과 `gateSelectionCases.ts:227` 뒤집힘. V5 P1 끔 → cap 1 스파이 아래 BudgetExceeded 관측 소실(`settle/DETAIL.md:476` 선례). V6 P2·P3 끔 → `gateSelectionCases.ts:357`, `settle.gates.test.ts:319` 뒤집힘. V7 바퀴 0을 직전 선택으로 대체 → S3 대조 장면에서 A·B가 남고 `settle.gates.test.ts:425` 뒤집힘. V8 증인 프레임 공유 → S2 비루트 변형. P4나 P7을 끈 변이가 아무 단언도 뒤집지 못하면 보수 조항으로 따로 보고한다.
- 차등과 그림자 시험: runGateSelectionCase의 configure 훅으로 생략을 켠 판과 끈 판의 전체 관측(nodes, revisions, deliveries, failures, latent, commit)을 견준다. 그림자 모드에서는 P가 참일 때도 k+1을 실제로 돌려 세 값이 false이고 자리별 게이트 값이 같음을 단언하며, settle 전체 스위트와 시나리오에 걸쳐 돌린다. P가 거짓인데 k+1이 안정이었던 "놓친 생략" 횟수도 센다.
- 본뜰 기존 시험: `settle.gates.test.ts:400-460`(SETTLE-050), `:223-344`(SETTLE-045), `:492`(SETTLE-017 중첩), `fixtures/gateSelectionCases.ts`의 이력 14개, `settle.gate-selection.test.ts`, `settle.gate-selection-counts.test.ts`.

## 5. 측정 계획

- 계수 장치: 437 `instrument.mjs`에 생략 분기 탐침을 더한다(지금 탐침은 `:34-39` 두 줄뿐이라 생략된 바퀴가 보이지 않는다). 대상은 count.mjs로 oneOf-5·10·20·40·80과 S1 폭 100·1000.
- 시간 장치 셋: 437 wall.mjs 창(판마다 새 프로세스, 최소값 중앙값; oneOf 5–80 update·mount), M3 형식 benchmark-form core 모드(core/oneOf-5·10·20 core-update·core-mount)와 render 모드(render-update-wall·render-mount-wall), `probe-write-paths.ts`·`probe-legacy-write-paths.ts`의 gate-form-one-key 폭 100·1000. 표는 368 형식(옛 판 0.16.1, 수정 전, 수정 후의 ms와 세 비율). mount는 P7로 빠지므로 변화가 없어야 하는 회귀 대조군이다.
- 절제 측정: "증인만 기록하고 생략하지 않는" 판을 함께 재어 기록 비용을 따로 낸다. 437 profile.mjs로 전후의 selectChildren·selectNodeSchema·evaluateGate 포함 비중도 낸다.
- 예상 범위: oneOf-80 update 두 쓰기 합 1.457 ms에서 하한 −11.6 %(약 1.29 ms, evaluateGate 포함 23.16 %의 절반), 상한 −24.2 %(약 1.10 ms, selectChildren 37.50 %와 selectNodeSchema 10.85 %를 더한 값의 절반). 옛 판 대비 배율은 15.8배에서 약 12~14배. 상한에서도 oneOf-80은 옛 판보다 10배 넘게 느리므로 이 실험 하나로 배율이 닫히지 않는다. S1 폭 1000은 지금 6.847 ms(`write-paths-measurement.md:317`)이며 상한 대략 −3 ms. render 행은 엔진 몫이 작아 잡음 안의 변화를 예상한다.
- 선례에 따른 위험: 99라운드 판별 선택 표는 조건 평가를 0으로 만들고도 oneOf-20 −6 %, oneOf-40 −2 %에 그쳐 되돌렸다(`round-99-closing.md:3`). 이번 후보는 바퀴 전체를 없애므로 더 큰 몫을 겨냥하지만, 이득이 없으면 같은 선례대로 되돌리는 것이 기본이다.

## 판정

새 읽기 집합 없이 가능하다. 술어 P는 이미 컴파일되어 형상 dirty 판정에 쓰이는 식 의존 목록과, 바로 앞 바퀴에서 게이트가 받은 입력 값의 동일성만 쓴다. P는 실행된 바퀴의 모든 게이트 평가를 그대로 두고, 같은 computeNode 호출 안에서 입력이 같음이 증명된 다음 바퀴만 생략한다. 따라서 SETTLE-020의 결과 동치, SETTLE-018의 고정 출발, SETTLE-001의 단계 순서를 지키고, SETTLE-044가 금한 직전 활성 출발과 다르다. BLUEPRINT-007 (a)의 정적 읽기 집합으로 범위를 좁힐 필요는 없다. 다만 P6의 실행 중 입력 기록이 BLUEPRINT-007 문면에 맞는지는 원장 판단이 필요하다. 기대 효용은 oneOf-80 갱신에서 −12 %에서 −24 % 사이로 추정하며, 99라운드 선례 때문에 측정 전에는 보장할 수 없다.

## 확인되지 않은 것

- 첫 쓰기의 두 번째 computeNode 원인이 default 채움이라는 것은 가설이다. `transitionSettlement.ts:206` 직전에 filledNodes와 automaticChanged를 기록하면 확인된다.
- 확인 바퀴가 바뀐 바퀴보다 얼마나 싼지는 모른다. 생략 판의 시간으로만 확인된다.
- 생략 판에서는 일부 내부 참조가 바퀴 k의 것으로 남는다(selectedDeclarationIds의 새 배열 `selectChildren.ts:207`, structure 객체 `:123`). 커밋이 이들을 내용으로 비교하는지 확인해야 하며, 차등 관측에 committedDeclarationIds를 넣어야 한다.
- P7의 분배 입력 제외는 멱등성을 증명하지 못해서 둔 조항이다. 나중에 증명되면 풀 수 있다.
