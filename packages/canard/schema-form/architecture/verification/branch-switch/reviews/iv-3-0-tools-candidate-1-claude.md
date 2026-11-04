# Ⅳ-3-0 프로파일 도구 독립 검토 판정

검토 범위는 `510962d63..30f901de6`(커밋 `30f901de6`, 16개 파일)입니다. 아래에서 `tools/iv-3-0/`는 `packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/`를, `src/`는 `packages/canard/schema-form/src/`를, 번들은 작업 트리의 `packages/canard/schema-form/dist/index.node.mjs`를 뜻합니다. 작업 트리의 파일은 하나도 수정하지 않았습니다. 정식 프로파일, build, 시험은 돌리지 않았고, 정적 읽기와 `node --check`, 새 파일에 한정한 Prettier·ESLint·`checkJs`, 그리고 스크래치 디렉터리에서 1초 안팎의 합성 탐침만 실행했습니다. 저장소 사본은 기계 경로 세 곳을 자리표시자로 바꾸고 Prettier로 표를 정렬한 것 외에는 원본과 같습니다.

## 판정

**FAIL**입니다. P1 2건, P2 5건, P3 5건입니다.

가장 큰 문제는 self 환산이 요청한 표본 간격(50 µs)을 그대로 쓰는데, 이 기계의 V8 표본 수집기는 요청보다 약 1.6배 긴 간격으로 표본을 찍는다는 점입니다. 그 결과 모든 µs 수치가 약 0.63배로 작아지고, ±15 % 교차 확인은 50 µs와 25 µs에서 모두 실패해 첫 행에서 멈출 것으로 예상됩니다. 두 번째 문제는 갈래 B의 착수 수치에 서술자가 대신할 수 없는 게이트 평가 함수가 들어가 있다는 점입니다. 이 두 가지를 고치기 전에는 소유자의 유휴 기계 시간을 이 도구에 쓰면 안 됩니다.

## P1 — 프로파일 수치나 판정을 틀리게 만드는 것

### P1-1. 요청 간격 기준 self 환산이 실제 표본 간격과 어긋나, 모든 µs 수치가 약 0.63배가 되고 교차 확인이 두 번 모두 실패합니다 (확인됨)

**근거.** `tools/iv-3-0/helpers/attributeSamples.mjs:79`는 함수별 self를 `entry.samples * wall.intervalUs / wall.switches`로, `:98`은 총 self를 `active * wall.intervalUs / wall.switches`로 계산합니다. 여기서 `intervalUs`는 요청 간격입니다. `:117-118`은 이 값을 벽시계와 비교해 ±15 %를 판정하고, `tools/iv-3-0/profile.mjs:69`는 실패하면 25 µs로 한 번 더 돌린 뒤 멈춥니다. `tools/iv-3-0/README.md:21`은 "요청 간격과 실제 시간차가 다르면 교차 확인 실패로 드러납니다"라고 적어 이 위험을 알고 있었지만, `tools/iv-3-0/rehearse.mjs:47-90`의 예행은 실제 표본 간격을 재지 않으므로 정식 실행 전에 이 실패를 잡지 못합니다.

이 기계에서 `--cpu-prof`로 합성 반복문(약 0.9초의 측정 구간을 `process.hrtime` 블록으로 감싼 것)을 돌려 측정 구간 안의 표본만 세었습니다. 결과는 다음과 같습니다.

| Node     | 요청 간격 µs | 실측 평균 간격 µs | 요청 간격 × 표본 수 ÷ 벽시계 |
| -------- | -----------: | ----------------: | ---------------------------: |
| v24.20.0 |           50 |              78.3 |                        0.638 |
| v24.20.0 |           25 |              40.9 |                        0.611 |
| v24.20.0 |           20 |              33.0 |                        0.607 |
| v24.20.0 |          100 |             155.1 |                        0.645 |
| v26.12.1 |           50 |              78.9 |                        0.633 |
| v26.12.1 |           25 |              39.8 |                        0.627 |

V8의 표본 시각은 이 기계에서 약 41.7 µs 단위로 양자화되어 있었습니다(50 µs 요청에서 `timeDeltas`의 10·50·90 백분위가 83·83·84 µs, 25 µs 요청에서 41·42·42 µs였고, 20 µs 요청에서는 길이 0인 간격이 나왔습니다). 반면 측정 구간 안의 `timeDeltas` 합은 모든 경우에 벽시계와 1.000으로 일치했습니다. 즉 시계 정렬은 건전하고, 틀린 것은 "표본 하나 = 요청 간격"이라는 가정뿐입니다.

**실패 시나리오.** 첫 행 `switch-oneOf-80`의 50 µs 시도에서 비율은 약 0.63에 `(program)`·`(idle)`를 뺀 몫(탐침에서 약 0.955)을 곱한 약 0.60이 되어 실패합니다. 25 µs 시도도 실측 간격이 약 40 µs이므로 같은 비율로 실패합니다. 그러면 `reconciliation-failed-twice`로 첫 행에서 멈추고, `switch-siblings-0`과 `single-flat-1000`은 돌지 않으며, `started.json` 때문에 같은 root는 다시 쓸 수 없습니다. 판정 문턱을 느슨하게 하더라도 표와 두 결정 수치가 모두 약 37 % 작게 나오므로, 15 µs 규칙이 "미만" 쪽으로 기울어집니다. 간격을 절반으로 줄이는 재시도는 양자화 때문에 이 문제를 고칠 수 없습니다.

**수정 명세.** 이 변경은 계약서의 "self samples × interval ÷ switches"에서 interval을 실측 간격으로 읽는 것이므로, 작업자는 먼저 `question`으로 코디네이터의 승인을 받아야 합니다. 승인 뒤에는 `tools/iv-3-0/helpers/attributeSamples.mjs`에서 측정 구간 안의 표본마다 `const weightUs = profile.timeDeltas[index + 1] ?? profile.timeDeltas[index];`(다음 표본까지의 시간, Chrome DevTools와 같은 관례)를 구해 `entry.weightUs`, `activeWeightUs`, `excludedWeightUs`에 더하고, `selfUsPerSwitch = entry.weightUs / wall.switches`, 총 self는 `activeWeightUs / wall.switches`, 함수별 백분율은 `entry.weightUs / activeWeightUs * 100`, `excludedPercent`도 가중치 기준으로 바꿉니다. 지금의 요청 간격 기준 값은 `nominalSelfUsPerSwitch`로, 실측 간격은 `measuredPeriodUs = (activeWeightUs + excludedWeightUs) / selected`로 보조 필드에 남깁니다. `tools/iv-3-0/checkTools.mjs`의 합성 프로파일은 고르지 않은 간격(예를 들어 `[50, 80, 80, 40, 120, 80, 80, 80]`)으로 바꾸고 기대값을 손으로 다시 계산해 단언합니다. `tools/iv-3-0/rehearse.mjs`는 정제 직후 전체 표본의 평균 간격(첫 간격을 뺀 `timeDeltas` 합 ÷ 그 개수)을 계산해 `rehearsal.json`에 `requestedIntervalUs`와 `measuredPeriodUs`로 기록하고, `profile.mjs`는 실행 시작 때 이 값을 출력합니다. `tools/iv-3-0/README.md:19,21`과 `tools/iv-3-0/helpers/renderReport.mjs:14`의 설명은 "표본별 실측 간격의 합"으로 고칩니다. 검증은 `node tools/iv-3-0/checkTools.mjs`가 `IV_3_0_TOOLS_OK`를 출력하는지, 그리고 예행 기록의 `measuredPeriodUs`가 50 µs 요청에서 약 80 µs로 남는지 확인하는 것입니다.

### P1-2. `decisions.B`와 `groups.B`에 계약서에 없는 게이트 평가 함수가 들어가, 갈래 B의 착수 수치를 부풀립니다 (결함은 확인됨, 판정이 뒤집히는 크기는 개연성)

**근거.** `tools/iv-3-0/branches.json:48-50`(`groups.B`)과 `:103-105`(`decisions.B`)에 `evaluateGate`, `evaluateGateValue`, `readGateSelectionGroup`이 있습니다. 계약서의 B 목록(`selectChildren` 계열, `publishPreparedSelection`, `computeNode` 제어 흐름, `registerRecalculation`/`getDependencyIndex`, `markCommitDeliveries`, `commitSettlement`, `assembleObject`/`updateOutput`)에는 이 셋이 없습니다. 설계 문서의 "갈래 B" 절은 서술자를 "(호스트 청사진, 이전 bucket, 다음 bucket) 단위"로 정의하고, 리터럴 게이트는 "kind 한 번 읽기와 bucket 조회로 끝나지만, 그 뒤의 선택·공표·presence·등록·배달·커밋은" 일반 경로를 지난다고 적습니다. 코드에서도 `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:126-141`이 `readGateSelectionGroup`으로 판별 값을 읽고 `evaluateGate`로 허용 여부를 정합니다. 이 두 계산이 곧 서술자의 열쇠인 "다음 bucket"이므로, 서술자를 도입해도 없어지지 않습니다. Ⅳ-0의 단계 표에서 `evaluateGate`는 siblings-0에서 7.3 µs(계측 포함)로, 15 µs 문턱의 절반에 해당합니다.

**실패 시나리오.** 서술자가 실제로 대신할 수 있는 self 합이 11 µs이고 게이트 평가 self가 5 µs라면, 도구는 16 µs를 보고하고 "15 µs 이상"으로 갈래 B 착수를 권합니다. 부풀려진 수치로 갈래 B가 시작됩니다.

**수정 명세.** `tools/iv-3-0/branches.json`의 `groups.B`(48-50행)와 `decisions.B`(103-105행)에서 `evaluateGate`, `evaluateGateValue`, `readGateSelectionGroup`을 지워 이름 그대로 OTHER에 남게 하고, `notes`에 "Gate evaluation computes the next bucket that keys the descriptor; it is not descriptor-replaceable and stays OTHER." 한 줄을 더합니다. `tools/iv-3-0/helpers/renderReport.mjs`의 "15 µs 착수 조건" 절에는 행마다 세 함수의 self 합을 "게이트 평가(서술자 열쇠 계산, B 합에서 제외): X µs" 한 줄로 출력합니다(`table.table`에서 이름으로 합산). 검증은 `node tools/iv-3-0/checkTools.mjs`가 통과하는지(합성 시험은 B에 `selectChildren`만 쓰므로 영향이 없습니다), 그리고 `branches.json`의 `decisions.B`에 세 이름이 없는지 확인하는 것입니다. P2-2의 나머지 계약서 밖 B 이름들은 코디네이터 확인 대상입니다.

## P2 — 결과 문서의 독자를 오도하는 것

### P2-1. 교차 확인이 평균에 해당하는 self 합을 블록 중앙값과 비교합니다 (확인됨)

**근거.** `tools/iv-3-0/helpers/attributeSamples.mjs:93-97`은 100동작 블록별 µs/동작의 중앙값을 만들고, `:117-118`은 `selfUs / medianUs`로 판정합니다. 그러나 `selfUs`는 200개 블록 전체의 표본을 20,000으로 나눈 값이므로 평균에 해당합니다. 같은 구간의 평균은 이미 `:113-115`에서 `wallMeanUs`로 계산되어 있지만 판정에 쓰이지 않습니다.

**실패 시나리오.** 할당이 많은 `switch-oneOf-80`에서 GC가 몰린 블록이 오른쪽 꼬리를 만들면 평균이 중앙값보다 커지고, self 합(평균)이 중앙값보다 커 보여 비율이 실제 귀속 정확도와 무관하게 움직입니다. 그 결과 거짓 실패가 나거나, 반대로 표본 누락을 가릴 수 있습니다.

**수정 명세.** `attributeSamples.mjs`에서 `reconciliationRatio`를 `selfUs / wallMeanUs`로, `reconciled`를 그 비율의 ±15 %로 바꾸고, 중앙값 비율은 `medianRatio`로 보조 필드에 남깁니다. `wallMedianUs`는 보고하는 벽시계 값으로 그대로 둡니다. `renderReport.mjs:20-26`의 교차 확인 표에 "벽시계 평균 µs"와 "self/중앙값" 열을 더합니다. 계약서는 벽시계를 중앙값으로 정의하므로, 작업자는 P1-1의 `question`에 이 변경도 함께 묻습니다. 검증은 `checkTools.mjs`의 합성 단언(`reconciliationRatio`)을 평균 기준으로 다시 계산해 통과시키는 것입니다.

### P2-2. 매핑표가 코드와 어긋나 갈래 A와 C의 몫을 틀리게 보여 줍니다 (확인됨)

**근거.** 첫째, 번들에도 소스에도 없는 이름이 8개 있습니다. `tools/iv-3-0/branches.json:14`의 `nodeFactory`(런타임 칸 이름일 뿐 함수 이름이 아닙니다), `:21-24`의 `finalizePendingExitLoop`, `finalizeRetainLoop`, `finalizeAncestorCollection`, `finalizeAncestorOutput`, `:39-40`과 `:94-95`의 `publishChildren`, `prepareChildSelection`, `:79`의 `removeNode`입니다. 수치에는 영향이 없지만, 독자는 이 이름들이 측정 대상이었다고 읽습니다. 둘째, 실제 `finalizeExits` 계열 함수가 빠져 OTHER로 갑니다. `src/core/engine/settle/utils/transition/finalizeExits.ts:40`의 `finalizePerished`, `:105`의 `withdrawDetachedFills`, `:49`의 `isRekeyedDestination`, 그리고 `transition/utils/detachPerishedNode.ts`의 `detachPerishedNode`입니다. 같은 파일 `:52`의 이름 없는 노드별 방문 함수와 `:33`의 `inLoadScope`도 나감 수명 작업인데, 이름이 없거나 매핑에 없어 OTHER로 갑니다. 셋째, `branches.json:71`이 `transitionSettlement`를 C(고정비)에 넣었지만, `src/core/engine/settle/utils/transition/transitionSettlement.ts:32-43`은 게이트가 없고 들고나는 노드가 없으면 바로 반환합니다. 따라서 single-flat-1000에서는 거의 0이고, 전환 행에서는 들어온 노드의 전환 라운드를 도는 전환 작업입니다. 넷째, 계약서 밖에서 더한 이름(B의 `prepareGateTableRound`, `finishGateTableRound`, `canSkipGateWheel`, `computeRootGateSelection`, `getGateSelectionTable`, `primeHost`, `registerPresenceChanges`, `createPreparedSelectionStructure`, C의 `startFieldNodeChain`, `flushQueuedEvents`, `publishStateKeys`, A의 `createChildNode`, `enterSlotClone`)에 근거가 기록되어 있지 않습니다.

**실패 시나리오.** 갈래 A의 몫은 실제보다 작게, OTHER는 크게 나오고, 전환 행의 C 몫에는 전환 작업이 섞여 "고정비"로 읽힙니다. 설계의 "두 갈래 모두 몫이 20 % 미만이면 폐기" 규칙을 독자가 이 표로 판단하면 틀릴 수 있습니다.

**수정 명세.** `branches.json`에서 위의 8개 이름을 지웁니다. `groups.A`에 `finalizePerished`, `withdrawDetachedFills`, `isRekeyedDestination`, `detachPerishedNode`를 더합니다. `scoped`에 `{ "source": "src/core/engine/settle/utils/transition/finalizeExits.ts", "names": ["(anonymous)", "inLoadScope"], "group": "A" }`를 더합니다(이름 없는 프레임은 `attributeSamples.mjs:47`에서 `(anonymous)`가 되므로 이 규칙이 맞습니다). `groups.C`에서 `transitionSettlement`를 지워 OTHER에 남기고, 코디네이터가 갈래를 정하면 그때 옮깁니다. 계약서 밖에서 더한 13개 이름은 `notes`에 이름마다 한 줄 근거를 적거나, 코디네이터 답을 받을 때까지 OTHER로 둡니다. 검증은 `groups`와 `decisions`의 모든 이름이 번들에서 정확히 한 번 정의되는지(`(?:var|const|let|function|class) <이름>\b` 또는 클래스 메서드) 검색으로 확인하고, `checkTools.mjs`가 통과하는지 보는 것입니다.

### P2-3. 두 결정 수치의 정의가 실제로 없어지는 작업의 경계와 맞지 않고, 인라이닝 주의문은 근거가 약합니다 (확인됨)

**근거.** `branches.json:84`의 `decisions.A`는 `FieldNode`, `cloneSlotSubtree`, `getRetainedChildEntry`의 self만 셉니다. 그런데 정상 상태의 왕복에서 `createFieldNode`(`src/core/surface/utils/fieldNodeFactory.ts:82-113`, 경로 문자열 생성과 행동 조회 포함)는 `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:31`의 `host.runtime.nodeFactory`를 통해서만 불리고, `getSlotChildIndex`는 `getRetainedChildEntry.ts:28`의 탐색 일부입니다. 둘 다 갈래 A로 사라지지만 `createFieldNode`는 `groups.A`에만, `getSlotChildIndex`는 OTHER에 들어가므로, A 수치는 하한입니다. 반대로 `renderReport.mjs:69`와 `branches.json:6`은 B 합을 "상한"이라고 부르지만, self는 B 함수가 부르는 JavaScript 보조 함수(OTHER에 남는 것)를 빼므로 서술자가 대신할 작업의 상한이 아닙니다. 또 `renderReport.mjs:69`의 "별도 native Map 프레임·V8 인라이닝으로 사라진 프레임" 주의문은 탐침 결과와 맞지 않습니다. `--trace-turbo-inlining`으로 확인한 탐침에서 생성자가 호출자에 인라인되었는데도 표본은 모두 생성자 자신의 이름으로 귀속되었고, `new Map(...)` 내장 함수의 시간은 호출한 JavaScript 함수의 self에 들어갔습니다.

**실패 시나리오.** 독자는 A 수치를 "A가 없애는 전부"로, B 수치를 "B가 줄 수 있는 최대"로 읽습니다. A 수치가 13 µs이고 `createFieldNode`와 `getSlotChildIndex`가 3 µs라면, 실제 제거 가능 몫은 15 µs를 넘는데 "분석으로 닫힘"이 기록됩니다.

**수정 명세.** 15 µs 비교는 설계대로 self 합으로 유지하되, 괄호 범위를 함께 보고합니다. `attributeSamples.mjs`에서 `profile.nodes[].children`으로 부모 사상을 만들고, 측정 구간의 활성 표본마다 뿌리까지 올라가며 서로 다른 callFrame 열쇠를 모은 뒤, A는 `cloneSlotSubtree`가 스택에 있는 표본의 가중치 합을, B는 `decisions.B`의 이름 중 하나라도 스택에 있는 표본의 가중치 합(표본당 한 번)을 `decisionBrackets: { A: { self, inclusive }, B: { self, inclusive } }`로 냅니다. `renderReport.mjs`의 착수 조건 절은 두 값을 함께 출력하고, A 줄 옆에 `createFieldNode` self를 따로 적습니다. `renderReport.mjs:69`와 `README.md:21`의 인라이닝 문장은 "V8 프로파일은 인라인된 JavaScript 함수를 자기 이름으로 귀속하고, Map 같은 내장 함수의 시간은 호출한 함수의 self에 들어갑니다"로 고칩니다. 검증은 `checkTools.mjs`에 `cloneSlotSubtree` 아래 자식 프레임을 가진 합성 트리를 더해 inclusive 값을 단언하는 것입니다.

### P2-4. 준비 root를 실제 경로로 정규화하지 않아, 엔진 프레임이 `external/engine.mjs`로 바뀌면 원본 모듈 표기와 범위 규칙이 조용히 사라집니다 (원인은 확인됨, 발생은 root 경로 지정 방식에 따른 개연성)

**근거.** `tools/iv-3-0/profile.mjs:16`과 `tools/iv-3-0/rehearse.mjs:14`는 `path.resolve`만 하고 실제 경로로 바꾸지 않습니다. `tools/iv-3-0/helpers/sanitizeProfile.mjs:10-16`은 프레임 URL이 `root + '/'`로 시작할 때만 `prepared/`로 바꾸고, `attributeSamples.mjs:51`은 `prepared/engine.mjs`일 때만 번들의 `//#region` 원본을 붙입니다. 탐침에서 Node v24.20.0과 v26.12.1 모두 심볼릭 링크를 거친 root의 모듈을 실제 경로 URL로 보고했습니다.

**실패 시나리오.** `PROFILE_ROOT`를 `<temporary-root>`나 `$TMPDIR`(`<temporary-root-alias>`, 실제로는 `<canonical-temporary-root>`) 아래로 주면 모든 엔진 프레임이 `external/engine.mjs`가 되어 `source`가 비고, `GateRegistry` 범위 규칙이 맞지 않아 `register`·`remove`·`removePath`가 OTHER로 갑니다. 어떤 단언도 실패하지 않으므로 아무도 알아채지 못합니다.

**수정 명세.** `profile.mjs:16`과 `rehearse.mjs:14`를 `const root = fs.realpathSync(path.resolve(rootArgument));`로 바꿉니다. `prepare.mjs:15`는 아직 없는 root이므로 `path.join(fs.realpathSync(path.dirname(path.resolve(process.argv[2]))), path.basename(process.argv[2]))`로 만듭니다. `attributeSamples.mjs`의 반복문 뒤에 `assert.ok(table.some((entry) => entry.url === 'prepared/engine.mjs'), 'No product frames attributed');`를 더합니다. 검증은 `checkTools.mjs`에 URL이 `external/engine.mjs`뿐인 합성 프로파일이 예외를 던지는 단언을 더하는 것입니다.

### P2-5. 결과 문서의 벽시계에 표본 수집기 부담이 들어 있다는 사실이 적혀 있지 않습니다 (확인됨, 크기는 탐침 기준)

**근거.** `tools/iv-3-0/helpers/renderReport.mjs:14`와 `:20-26`은 같은 프로세스의 벽시계를 그대로 "벽시계 중앙 µs"로 보고합니다. 같은 합성 반복문을 수집기 없이 돌린 벽시계는 855,516 µs와 856,229 µs였고, 50 µs 수집기를 켠 벽시계는 925,539 µs와 931,115 µs로 약 8 % 길었습니다.

**실패 시나리오.** 독자가 이 값을 Ⅳ-0의 plain 값(oneOf-80 왕복 약 160 µs)과 나란히 놓고 퇴보나 차이로 읽습니다.

**수정 명세.** `renderReport.mjs:14`의 문단 끝에 "벽시계는 표본 수집기가 켜진 같은 프로세스의 값이며 수집기 부담만큼 plain 경로보다 깁니다. Ⅳ-0의 plain 값과 절대값으로 비교하지 않습니다." 두 문장을 더합니다. 검증은 결과 문서를 다시 생성해 문장이 들어갔는지 보는 것입니다.

## P3 — 위생

### P3-1. 내보낸 함수의 TSDoc이 매개변수와 결과를 적지 않습니다 (확인됨)

`tools/iv-3-0/helpers/attributeSamples.mjs:3`, `renderReport.mjs:1`, `runBlocks.mjs:3`, `sanitizeProfile.mjs:4`, `setupOperation.mjs:8`, `hashInputs.mjs:5`는 한 줄 설명만 있고 `@param`, `@returns`, 실패 조건이 없습니다. 저장소 규칙 `seiri_code-comments` 3절은 매개변수, 결과, 실패 조건을 모두 적도록 요구하며, 이웃 도구 `tools/window/waitForQuietProcess.mjs:7-11`이 그 형식을 보여 줍니다. **수정 명세.** 여섯 함수마다 매개변수별 `@param`, `@returns`, 그리고 `assert`가 던지는 조건(예를 들어 `attributeSamples`의 표본·간격 길이 불일치와 정렬 표본 0개)을 적습니다. 검증은 Prettier와 ESLint를 새 파일에 다시 돌리는 것입니다.

### P3-2. 제품 기준이 상수로 박혀 있고, `dist`가 그 소스로 만들어졌는지 확인하지 않습니다 (확인됨, 이번 작업 트리에서는 `dist`가 기준 커밋 9분 뒤에 만들어져 실제 위험은 낮습니다)

`tools/iv-3-0/prepare.mjs:42`는 `productBase`를 상수로 적고, `:18-21`은 `dist/index.node.mjs`를 읽기만 합니다. Ⅳ-0 도구는 번들 해시를 기존 기록과 대조했습니다. **수정 명세.** `prepare.mjs`에 `execFileSync('git', ['diff', '--quiet', productBase, 'HEAD', '--', 'packages/canard/schema-form/src', 'packages/canard/schema-form/package.json', 'packages/canard/schema-form/rolldown.config.mjs'], { cwd: repoDir })`(차이가 있으면 예외)를 더하고, `dist/index.node.mjs`의 수정 시각이 `src` 아래 가장 늦은 수정 시각보다 늦은지 단언합니다. 검증은 `prepare.mjs`를 새 root로 한 번 돌려 `IV_3_0_PREPARED`가 나오는지 보는 것입니다.

### P3-3. 귀속 단계가 실패하면 중단 기록 없이 프로세스가 죽습니다 (확인됨)

`tools/iv-3-0/profile.mjs:120-125`는 `attribute.mjs`의 실패를 `assert`로 처리하므로, `started.json`을 쓴 뒤 `outcome.json` 없이 종료되고 `publish.mjs:17`은 중단 사유를 공개할 수 없습니다. **수정 명세.** `assert.equal(attributed.status, 0, ...)`를 `if (attributed.status !== 0) { fs.writeFileSync(path.join(directory, 'attribute.stderr'), attributed.stderr ?? ''); failure = { kind: 'attribution-failure', row, interval, status: attributed.status }; break; }`로 바꿉니다. 검증은 `node --check`와 ESLint입니다.

### P3-4. 게이트 레지스트리 범위 규칙이 파일 이름 접미사의 우연으로만 맞습니다 (확인됨)

`tools/iv-3-0/branches.json:78`의 `"GateRegistry.ts"`는 번들 6643행의 region `src/core/engine/settle/utils/gates/getGateRegistry.ts`의 접미사라서 맞을 뿐이고, 같은 이름의 다른 파일이 생기면 잘못 맞습니다. **수정 명세.** `source`를 `"src/core/engine/settle/utils/gates/getGateRegistry.ts"`로 바꿉니다. 검증은 `checkTools.mjs` 통과입니다.

### P3-5. 계약서가 요구한 출력 일부가 결과 문서에 명시되지 않습니다 (확인됨)

`tools/iv-3-0/helpers/renderReport.mjs:75`는 single-flat-1000의 고정비 주인을 "위 표와 전체 원시에 있다"고만 적고 이름을 대지 않습니다. OTHER 전체 목록은 원시 `tables.json`에만 있고, 설계의 "두 갈래 모두 몫이 20 % 미만이면 폐기" 규칙도 평가하지 않습니다. **수정 명세.** single-flat-1000 절에 C 함수 전부와 OTHER 상위 5개를 이름과 µs/동작으로 나열하고, 착수 조건 절에 A와 B 갈래 백분율을 20 % 선과 함께 한 줄씩 출력합니다. 검증은 결과 문서 재생성과 `checkResults.mjs`의 결정적 재생성 단언입니다.

## 계약 대조에서 통과한 항목

- 한 행에 한 프로세스를 씁니다(`profile.mjs:68-99`). 세 행은 기존 고정물을 재사용합니다. oneOf-80 왕복은 두 쓰기, siblings-0은 한 쓰기입니다(`setupOperation.mjs:3-21`, `tools/b9-0/operation.mjs:26-29`). single-flat-1000은 정식 행과 같은 `buildFixture({ shape: 'flat', n: 1000 })`(`design-optimization/tools/helpers/buildRows.mjs:16`)에 잎 한 쓰기입니다.
- A 레인의 plain 경로가 맞습니다. 번들에는 `performance.now`·`hrtime` 호출이 없고, 엔진 모드 기본값은 `table`·`skip`·그림자 없음이며(번들 1190-1195행), 작업 프로세스는 `NODE_ENV=production`을 단언합니다(`worker.mjs:11`).
- 예열 2,000회, 측정 20,000회, 500회마다 타이밍 밖 `setImmediate`, 100회 블록 바깥의 단조 시계가 맞습니다(`worker.mjs:19-21`, `runBlocks.mjs:5-18`).
- `--cpu-prof`, `--cpu-prof-interval`, root 아래 `--cpu-prof-dir`가 맞습니다(`profile.mjs:83-87`). `.noindex` root, 저장소 밖 단언, 공용 정숙 관문(3초 평균, 외부 PID 30 %, 일반 120초·Spotlight 600초), 환경 거절 시 보존 후 중단, `started.json`으로 재실행 금지가 모두 들어 있습니다.
- self 계산 자체는 맞습니다. 표본의 leaf 노드 id를 `nodes`로 찾아 callFrame(함수 이름, URL, 줄)별로 세고, 표본 시각은 `startTime`에 `timeDeltas`를 누적해 구합니다(`attributeSamples.mjs:19-61`). self에는 `children`이 필요하지 않습니다.
- 예열·적재 제외는 시간 창 방식이며 건전합니다. 탐침에서 V8 표본 시각과 `process.hrtime`이 같은 단조 시계 기준이었습니다(첫 블록이 프로파일 시작 약 0.96초 뒤, 마지막 표본이 마지막 블록 끝 약 1 ms 뒤). 이 방식은 `README.md:21`과 `renderReport.mjs:14`에 적혀 있습니다.
- `(program)`·`(idle)`은 분모에서 빠지고 비율이 보고됩니다(`attributeSamples.mjs:37-40, 122`). overlay Map 복사는 `cloneSlotSubtree.ts:68`의 `new Map(...)`이므로, 탐침이 보여 준 대로 `cloneSlotSubtree`의 self에 한 번 들어갑니다.
- 계약서가 A·B·C로 이름을 댄 함수는 모두 매핑에 있습니다(`nodeFactory`는 `createFieldNode`에 묶인 런타임 칸이고 `createFieldNode`가 A에 있습니다). `finalizeExits`는 A입니다. 번들에서 이름 충돌로 `$1` 접미사가 붙은 매핑 대상은 없습니다.
- 위생 항목은 통과했습니다. 변경은 `tools/iv-3-0/` 아래 16개 파일뿐이고 제품 소스·manifest·build 설정 변경은 없습니다. 기계 경로는 없습니다(`checkTools.mjs`의 합성 `file:///fixture/...`만 있습니다). `node --check`, 그리고 새 파일에 한정한 Prettier·ESLint·`tsc --allowJs --checkJs`가 모두 종료 코드 0이었습니다. 파일마다 내보낸 함수는 하나입니다. 커밋 메시지는 개수를 담고 있고 공동 작성자나 세션 식별자가 없습니다.

## 확인하지 못한 것

- 실제 행의 프로파일은 돌리지 않았습니다. 표본 간격 비율 0.61~0.645는 합성 반복문의 값이며, 실제 행에서도 같은 수집기 동작이 예상되지만 측정한 값은 아닙니다.
- 중앙값과 평균의 차이, 게이트 평가 self, `createFieldNode`·`getSlotChildIndex` self의 실제 크기는 프로파일 없이는 알 수 없습니다.
- 패키지 전체 lint와 build는 지시에 따라 돌리지 않았습니다.
