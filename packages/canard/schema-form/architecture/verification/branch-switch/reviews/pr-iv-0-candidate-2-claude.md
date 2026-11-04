# Ⅳ-0 측정 도구 재검토 판정 (098cd76c6)

## 판정

**PASS with P3**입니다. P1 0건, P2 0건, P3 3건입니다.

이전 판정의 P2 세 건은 명세대로 고쳐졌고, 새 진단 원시에서 효과가 확인됩니다. 시간 레인의 번들은 이전 준비 루트와 바이트까지 같고, 제품 파일 변경도 없습니다. 남은 P3 세 건은 측정을 무효로 만들지 않습니다. 결과 문서를 쓰기 전에 반영하면 됩니다.

검토 중에 정식 창 2가 끝났습니다(`window-end.json`: `completed: true`, `invalid: false`, 종료 04:49:02Z). 저는 읽기와 텍스트 집계만 했습니다.

## 발견

경로는 `packages/canard/schema-form/` 아래 상대 경로입니다. 새 원시 루트는 `<scratch>/claude-501/perf-runs/20261029T0410-098cd76-iv-0-window2.noindex`입니다.

### P3-1 (가능성, 원시에서는 관측되지 않음) 배달 frame이 덮어쓰기 방식이라 드문 순서에서 행이 섞일 수 있습니다

- 근거: `architecture/verification/branch-switch/tools/iv-0/diagnostics/createDiagnosticRecorder.mjs`의 `chainExitEnd`는 `frame.row.deliveryAllocations`를 합치지 않고 대입합니다. `pendingDelivery`는 다음 사슬 종료가 올 때까지 남아 있고, 기록기를 끄거나 label이 바뀌어도 비워지지 않습니다. 그래서 쓰기가 끝난 뒤 그 쓰기의 사슬 종료가 기록기가 꺼진 상태에서 일어나고, 다음 동작이 쓰기 없이 사슬 종료만 일으키면, 이전 행의 배달 할당이 뒤의 값으로 바뀝니다.
- 지금 원시: 이런 일은 없었습니다. `row-diagnostics.json`의 208행과 `delivery-diagnostics.json`의 175행이 모두 `deliveryAllocations` 블록을 정확히 하나씩 가집니다. `exitFieldNodeChain.ts:Set` 값은 쓰기 204행에서 2(`exitFieldNodeChain.ts:31`과 onChange가 실행될 때의 `:139`), load 4행에서 1로, 사슬 종료 한 번과 맞습니다. 본 할당에는 `src/core/engine/write/` 사이트가 하나도 없고, `deliveryContexts`는 모두 0입니다.
- 수정: `chainExit()`의 반환 조건에 `pendingDelivery.row.label !== recorder.label || pendingDelivery.row.deliveryAllocations !== undefined`를 더합니다. `chainExitEnd()`에서는 대입 전에 `assert.equal(frame.row.deliveryAllocations, undefined)`를 둡니다. `checkTools.mjs`에는 label을 바꾼 뒤의 `chainExit()`가 `false`임을 단언하는 사례를 더합니다.

### P3-2 (이전 P3-3과 P3-4의 남은 절반, 결과 문서 쪽) 항목 4의 레인 선택과 A 장부 표시는 아직 코드 밖에 있습니다

- 근거: `architecture/verification/branch-switch/tools/iv-0/report/summarizeTimings.mjs:30`은 `details`와 `wrapped`를 함께 요약합니다. 항목 4에 어느 쪽을 쓸지는 미추적 `renderReport.mjs`가 정하는데, 커밋 밖이라 검토하지 않았습니다. `details`의 `computeNode` self에는 `wheelPreparation` 영역이 섞여 있습니다. `summarize.mjs`는 A 장부(원래 단계 목록)와 B 장부(장부 목록)를 같은 `ledgerNames`로 요약합니다.
- 수정: 결과 문서에서 항목 4의 단계별 고정·형상 분리는 `wrapped` 값으로 쓰고, `details`는 항목 5의 하위 타이머에만 씁니다. A 장부는 "원래 단계 목록"으로 표시하고, A와 B의 단계 비율은 만들지 않습니다.

### P3-3 (사소함) 요약의 라운드 목록이 `parentRound`를 버립니다

- 근거: 원시의 라운드에는 `parentRound`가 기록됩니다(코퍼스 원시에서 null 321개, 숫자 다수). 그러나 `report/summarizeDiagnostics.mjs`의 `roundChanges` 매핑에는 그 필드가 없어서, 요약에서는 라운드별 호스트 집합을 볼 수 없습니다.
- 수정: `roundChanges` 매핑 객체에 `parentRound: round.parentRound`를 더합니다.

## 확인한 것

- **명세 대조.**
  - `classifyClosure.mjs`는 명세와 글자 단위로 같습니다. `required`와 `unknown`은 양방향 검사를 하고, 나머지는 조상 원천이거나 안에서 밖으로 나갈 때만 거절합니다. `owners` 중 범위 밖이 있으면 `owner-outside`를 더합니다.
  - `collectDependencyEdges.mjs`는 숫자 `evaluationReads`를 건너뛰고 `gate-if-host`와 `gate-discriminator` 간선을 더합니다.
  - `createDiagnosticRecorder.mjs`는 `owners: frame.dependencyOwners ?? []`를 넘기고, `pendingDelivery`, `chainExit`, `chainExitEnd`를 명세대로 처리하며, `parentRound`를 기록합니다.
  - `instrumentSource.mjs`는 diagnostics 모드 안에서만 `exitFieldNodeChain`을 감싸고, `PathKeyedMap`과 `PathKeyedSet`을 셉니다.
  - `buildDiagnostics.mjs`는 `chainExitBoundary`를 단일 사이트로 단언하고, details 사이트 20개를 하나씩 단언합니다.
  - `installDisabledHooks.mjs`에 두 이름이 추가되었습니다. `checkTools.mjs`에 명세의 다섯 단언과 합성 배달 사례가 들어갔습니다.
- **이전 P3 반영.**
  - A 레인 번들은 B5의 S와 단언됩니다(`prepare.mjs`). git 호출 넷에 `cwd: repository`가 들어갔습니다.
  - 창은 파일럿 범위와 타이머 예행을 단언합니다(`window.mjs:27-32`). 타이머 예행은 `rehearse.mjs`가 만들고, floor 비시간 smoke 24개는 `checkLoad.mjs`에 있습니다.
  - `summarizeTimings.mjs`가 프로세스·모드별 중앙값/최솟값 비를 남깁니다. 새 파일럿 값은 1.231입니다.
  - `saveRawEvidence.mjs`는 `quiet-*.json`도 압축하고, 명령 기록을 `portableEvidence`에 통과시키며, 기계 경로를 단언합니다.
  - README의 injectTo 문장은 이제 코드와 실질적으로 같습니다. 함수가 아닌 injectTo는 제품에서 쓰기를 만들지 않기 때문입니다(`src/core/engine/derive/evaluateDeriveRound/utils/inject/evaluateInjectTo.ts:34`).
- **제품 바이트 중립.** `b026bd04f..098cd76c6`에서 `architecture/verification/branch-switch/tools/iv-0/` 밖의 변경 파일은 0개입니다. 추적 파일의 작업 트리 변경도 없습니다. 미추적 파일은 `raw/iv-0/`, `publishDiagnostics.mjs`, `renderReport.mjs`뿐입니다.
- **시간 레인 무변경.**
  - `worker.mjs`와 `timing/*`은 diff에 없습니다. `window.mjs`의 변경은 사전 단언 6줄뿐이고, `prepare.mjs`의 변경은 `cwd`와 A 해시 단언뿐입니다.
  - 두 준비 루트의 `inputs.json`을 비교하면 `diagnostics/plain.mjs`, `diagnostics/details.mjs`, `bundles/A/index.node.mjs`, `bundles/B/index.node.mjs`, `A/stages/wrapped.mjs`, `B/stages/wrapped.mjs`, `B/stages/unwrapped.mjs`, `B/engines/current.mjs`의 sha256이 같습니다. 달라진 것은 `diagnostics/diagnostics.mjs` 하나입니다.
  - `verifyInputs`의 새 `verifyTools = false` 경로는 중단된 창 1을 보존하는 `preserveFailure.mjs:14`에서만 쓰입니다. 창, 파일럿, 예행, 요약은 기본값으로 도구 해시를 검사합니다.
- **새 코퍼스 원시(`delivery-diagnostics.json`, 175행, 모두 `callerReplace`).**
  - 범위 `/h`인 쓰기는 34건입니다. 그중 27건이 qualifies이자 useful이고, 7건이 거절입니다.
  - 거절 7건은 `items-F1-C16-control`, `items-F16-C16-control`, `items-F4-C16-control`, `items-F4-C256-control`, `items-F4-C4-control`, `items-F4-C64-control`, `items-F64-C16-control`입니다. 사유는 모두 `crossing-unknown`과 `unknown-dependency` 둘뿐입니다. 가로지르는 간선은 7건 모두 `{"source":"/flag","target":"/h/*","kind":"unknown"}` 하나로, 배열 wildcard 소유자입니다.
  - injectTo에서 온 unknown 간선(`{"source":"","target":"","kind":"unknown"}`)은 0개입니다. 워커 보고와 맞습니다.
  - 이 7건의 거절은 README가 밝힌 보수 규칙(wildcard가 남으면 거절)의 결과입니다. wildcard가 범위 아래에만 있으니 정밀화 여지는 있지만, 결함이 아니라 설계상의 선택입니다.
  - 루트 범위는 104건이 qualifies, 37건이 `unknown-dependency`로 거절이며, 이전과 같습니다. `owner-outside`는 0건입니다.
  - 175행 모두 `exitFieldNodeChain.ts:Set`이 1 이상입니다. 배달 비교는 79장면 429단계에서 차이 0입니다.
- **새 행 원시(`row-diagnostics.json`, 208행 = 쓰기 204행 + load 4행).**
  - 208행 모두 `deliveryAllocations`를 가집니다. 배달 사이트는 `exitFieldNodeChain`·`flushQueuedEvents`·`collectChainRecords`의 Set이 208행, `runDeliveryWaves`·`deliverWave`의 Set과 Map이 44행, `compareDocumentOrder`의 Map이 4행입니다.
  - useful은 `single-nested-d6-f4` 40건과 `switch-nested-oneOf-20` 8건으로 그대로입니다. `commitSettlement.ts:PathKeyedMap`도 이제 셉니다.

## 실행한 명령

- `git -C <worktree>`로 `log --oneline 4b7abf5de..HEAD`, `diff --stat 4b7abf5de..098cd76c6`, `diff 4b7abf5de..098cd76c6 -- <도구 파일들>`, `diff --name-only b026bd04f..098cd76c6`(도구 경로 제외), `status --porcelain`을 실행했습니다.
- `cat -n`, `sed -n`, `grep`, `ls`, `find`, `head`, `tail`로 도구, 제품 원천, 두 준비 루트의 파일을 읽었습니다.
- `grep -o`와 `sort | uniq -c`, `awk`, `zgrep -c`로 두 진단 JSON과 두 `inputs.json`, 미추적 `raw/iv-0`의 기계 경로를 집계했습니다(경로 0건).
- 빌드, 시험, lint, node 실행은 하지 않았습니다.
