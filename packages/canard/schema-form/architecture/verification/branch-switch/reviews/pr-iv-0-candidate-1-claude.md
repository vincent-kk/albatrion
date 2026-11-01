# Ⅳ-0 측정 도구 독립 검토 판정 (4b7abf5de)

## 판정

**FAIL** — P1 0건, P2 3건, P3 7건입니다.

시간을 재는 장치(세 레인 이정표, 단계 장부, 바닥 분해, 힙)는 장치 규칙대로 배선되어 있고 제품 바이트도 건드리지 않습니다. P2 세 건은 모두 시계를 쓰지 않는 진단(영향 집합 닫힘 판정과 할당 계수)에 있습니다. 그중 두 건은 지금 원시의 수치를 바꿉니다. 하나는 배달 코퍼스의 국소 적격 비율(useful 0/175)이고, 다른 하나는 항목 6의 배달 패스 할당 수(0)입니다.

창 순서에 대한 권고입니다. 준비 루트의 `inputs.json`이 도구 `.mjs` 전부의 해시를 고정하므로, 기존 도구 파일을 고치면 `window.mjs:21`과 `:137`의 `verifyInputs`가 실패합니다. 시간 레인은 P2와 무관하므로, 정식 창은 지금 준비 루트로 열고 수정은 창이 끝난 뒤 적용하기를 권합니다. 그다음 새 `.noindex` 루트에서 `prepare`, `checkTools`, `checkLoad`, `diagnoseRows`, `diagnoseDelivery`만 다시 돌리고, 결과 문서에는 시간 루트와 진단 루트를 따로 적습니다. 어느 순서로 할지는 코디네이터가 정합니다.

## 발견

경로는 `packages/canard/schema-form/` 아래 상대 경로입니다. 원시 근거는 준비 루트 `<scratch>/claude-501/perf-runs/20261029T0330-4b7abf5-iv-0.noindex`의 파일입니다.

### P2-1 (확인됨) 닫힘 판정이 국소 정착을 깨지 않는 간선까지 거절 사유로 셉니다

- 결함 하나: `architecture/verification/branch-switch/tools/iv-0/diagnostics/classifyClosure.mjs:16-19`는 `inside(source) !== inside(target)`인 간선을 모두 거절 사유로 삼습니다. 그래서 범위 밖의 무관한 경로를 범위 안 노드가 읽는 "들어오는 간선"도 거절이 됩니다. 쓰기는 범위 밖 원천을 바꾸지 않으므로 이 간선은 국소 정착을 깨지 않습니다.
- 결함 둘: `architecture/verification/branch-switch/tools/iv-0/diagnostics/collectDependencyEdges.mjs:65-68`은 active 게이트의 숫자 `evaluationReads`(부모로 올라가는 횟수)를 `'../'.repeat(read)`로 풀어 조상 경로 전체를 원천으로 씁니다. 같은 게이트의 정밀한 읽기는 이미 식 의존(`:27-37`)과 제품 색인(`:11-26`)에 들어 있으므로, 이 간선은 거친 중복입니다.
- 원시에서의 실패: `delivery-diagnostics.json`에서 루트가 아닌 범위의 쓰기는 34건이고, 모두 범위 `/h`이며, 34건 모두 거절되었습니다. 34건의 `crossing`에 든 간선은 `/flag → /h…`(index 2,312개, active 484개)와 `"" → /h…`(gate-active 5,388개)뿐입니다. 범위 안에서 밖으로 나가는 간선은 하나도 없고, injectTo 때문에 `unknown-dependency`를 가진 것은 7건뿐입니다. 나머지 27건은 `/flag`를 바꿀 정적 경로가 없습니다. 따라서 코퍼스의 "useful 0/175"는 판정 규칙이 만든 값일 가능성이 높고, 고치면 최대 27건이 useful이 될 수 있습니다. 재실행 전이므로 이 수는 추정입니다. 지금 상태로는 결과 문서가 "코퍼스에서 Ⅳ-1이 적용되는 쓰기는 0건"이라고 잘못 적게 됩니다.
- 수정 명세(P2-3과 같은 함수이므로 한 번에 적용합니다):
  1. `classifyClosure.mjs`의 서명을 `classifyClosure({ target, hosts, edges, owners = [] })`로 바꾸고, JSDoc `@param` 형에 `owners:string[]`를 더합니다.
  2. `classifyClosure.mjs:14-19`를 다음으로 바꿉니다.
     ```js
     const inside = (path) => !scope || path === scope || path.startsWith(scope + '/');
     const ancestor = (path) => !!scope && path !== scope && (path === '' || scope.startsWith(path + '/'));
     const crossing = edges.filter((edge) =>
       edge.kind === 'required' || edge.kind === 'unknown'
         ? inside(edge.source) !== inside(edge.target)
         : ancestor(edge.source) || (inside(edge.source) && !inside(edge.target)),
     );
     const reasons = crossing.map((edge) => 'crossing-' + edge.kind);
     for (const owner of owners) if (!inside(owner)) reasons.push('owner-outside');
     ```
  3. `collectDependencyEdges.mjs:64-73`의 `evaluationReads` 루프 첫 줄에 `if (typeof read !== 'string') continue;`를 넣고, `source`는 `read`를 그대로 씁니다.
  4. `checkTools.mjs`에 단언 두 개를 더합니다. 첫째, `{ target: '/h/x', hosts: ['/h'], edges: [{ source: '/flag', target: '/h', kind: 'index' }] }`는 `useful === true`입니다. 둘째, `{ target: '/h/x', hosts: ['/h'], edges: [{ source: '', target: '/h', kind: 'required' }] }`는 `qualifies === false`입니다. 기존 다섯 단언은 그대로 통과해야 합니다.
  - 확인 방법: 새 진단 루트에서 이 34건의 판정과 남은 사유를 결과 문서에 적습니다. 남은 사유가 `unknown-dependency`, `owner-outside`, 밖으로 나가는 간선, 조상 원천 간선뿐인지 확인합니다.

### P2-2 (확인됨) 할당 계수가 배달 파동을 통째로 빠뜨립니다

- 결함: 진단의 쓰기 경계는 `writeFieldNode` 본문입니다(`architecture/verification/branch-switch/tools/iv-0/instrumentation/instrumentSource.mjs:101-108`). 배달 파동은 그 바깥에서 돕니다. `src/core/engine/write/utils/entry/dispatchSetValue.ts:66`의 `finally`가 `exitFieldNodeChain`을 부르고, 그 안에서 `runDeliveryWaves`와 `flushQueuedEvents`가 돕니다(`src/core/engine/write/utils/chain/exitFieldNodeChain.ts:41-42`). 활성 frame이 없으면 `allocate`는 값을 버립니다(`architecture/verification/branch-switch/tools/iv-0/diagnostics/createDiagnosticRecorder.mjs:91-93`).
- 원시에서의 실패: 쓰기마다 할당하는 `exitFieldNodeChain.ts:31`(Set), `runDeliveryWaves.ts:23`(Set), `deliverWave.ts:42`(Map)이 `row-diagnostics.json`에 한 번도 나오지 않습니다. `src/core/engine/write/` 사이트는 0건이고, 같은 파일에서 commit 사이트는 840건, compute 사이트는 560건입니다. 미추적 요약기 `report/summarizeDiagnostics.mjs:18`의 `delivery` 묶음은 그래서 늘 0이 됩니다. 항목 6은 배달 패스의 Map/Set 수를 요구하고, Ⅳ-3(범위 안 배달과 재사용 풀)이 이 수로 크기를 정하므로 과소 추정으로 이어집니다.
- 수정 명세:
  1. `instrumentSource.mjs`의 `mode === 'diagnostics'` 블록에 `if (name === 'exitFieldNodeChain')` 분기를 더합니다. 본문 시작 위치 + 1에 `const __ivExit=globalThis.__iv.chainExit();try{`를, 본문 끝 위치 - 1에 `}finally{globalThis.__iv.chainExitEnd(__ivExit);}`를 넣고, `sites.push({ name: 'chainExitBoundary', file })`를 합니다.
  2. `buildDiagnostics.mjs:107-115`의 단일 사이트 목록에 `'chainExitBoundary'`를 더합니다.
  3. `installDisabledHooks.mjs:9-21`의 이름 목록에 `'chainExit'`와 `'chainExitEnd'`를 더합니다.
  4. `createDiagnosticRecorder.mjs`에 변수 `let pendingDelivery`를 두고, `end()`가 push한 행을 여기에 넣습니다. `chainExit()`는 `!recorder.enabled || frames.length > 0 || !pendingDelivery`이면 `false`를 돌려줍니다. 그렇지 않으면 `begin`과 같은 모양의 frame에 `delivery: true`와 `row: pendingDelivery`를 넣어 push하고 `true`를 돌려줍니다. `chainExitEnd(token)`은 `token`이 참이고 맨 위 frame의 `delivery`가 참일 때만 pop합니다. pop한 뒤 `row.deliveryAllocations = frame.allocations`, `row.deliveryContexts = frame.contexts`, `row.deliveryScratchNew = frame.scratchNew`, `row.deliveryScratchReused = frame.scratchReused`를 기록하고 `pendingDelivery`를 비웁니다. 배달 중에 일어난 다른 쓰기의 `begin`은 그 위에 자기 frame을 쌓으므로 행이 섞이지 않습니다.
  5. 요약 단계(`report/summarizeDiagnostics.mjs`)는 `record.deliveryAllocations`를 `delivery` 묶음과 `maps`·`sets`에 더합니다.
  6. `checkTools.mjs`에 합성 사례를 더합니다. `begin`과 `end`로 행 하나를 만든 뒤 `const t = recorder.chainExit(); recorder.allocate('write.ts', 'Set'); recorder.chainExitEnd(t);`를 실행하면 `rows[0].deliveryAllocations['write.ts:Set'] === 1`이어야 합니다.
  - 확인 방법: 새 진단 루트에서 쓰기 행마다 `deliveryAllocations`에 `src/core/engine/write/utils/chain/exitFieldNodeChain.ts:Set`이 1 이상인지, `diagnoseDelivery`의 차이가 0으로 남는지 확인합니다.

### P2-3 (확인됨, 지금 원시의 수치는 바뀌지 않을 것으로 봄) 닫힘 판정이 세 가지 의존을 놓칩니다

- 첫째, 조상 경로 읽기입니다. `classifyClosure.mjs:14-15`의 `inside`는 엄격한 포함만 봅니다. 제품 색인은 읽은 경로와 바뀐 경로가 어느 방향으로든 겹치면 영향으로 봅니다(`src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:416`). 그래서 범위 `/a/b`에서 간선 `{ source: '/a', target: '/c' }`는 거절되지 않습니다. 이 간선은 바깥 `/c`가 범위를 담은 객체 `/a`를 읽는다는 뜻입니다. 관측도 이를 보완하지 못합니다. `createDiagnosticRecorder.mjs:44-55`는 branch만 남기고, 바뀐 branch 자손이 있는 조상을 직접 호스트에서 빼므로, 루트 바로 아래 잎 `/c`의 변화는 `hosts`에 나타나지 않습니다. 결과는 거짓 적격입니다.
- 둘째, if-then-else 조건입니다. `evaluationReads`는 `active` 게이트에만 채워집니다(`src/core/engine/blueprint/buildNodes/utils/gates/createBlueprintGate.ts:23-26`). 제품 색인도 `active` 식만 게이트 식으로 찾습니다(`src/core/engine/settle/utils/gates/getGateExpression.ts:24`). 그래서 `collectDependencyEdges.mjs:63-74`는 `if` 게이트에 간선을 하나도 만들지 않습니다. 호스트 `/h`의 `if`가 읽는 `/h/a/b`에 쓰되 그 표본에서 조건이 뒤집히지 않으면, 범위 `/h/a`로 적격이자 useful이 됩니다. 이 정의를 쓰기와 무관한 정적 표(설계 Ⅳ의 "경로에서 흔드는 호스트들로 가는 표")로 옮기면 조건을 뒤집는 쓰기에서 틀립니다. `discriminator` 게이트도 간선이 없지만, 읽기가 "호스트/속성" 하나라서 범위가 늘 호스트를 담으므로 해가 없습니다.
- 셋째, 제품이 계산한 소유자를 쓰지 않습니다. 같은 frame이 정착의 재계산 소유자 `dependencyOwners`를 기록하지만(`createDiagnosticRecorder.mjs:157`), `classifyClosure`에 넘기지 않습니다(`:60-64`). 원시에서 이 값은 채워져 있습니다(예: `["/h","/h/k0",…]`).
- 지금 원시에 대한 영향: useful인 쓰기는 `single-nested-d6-f4` 40건과 `switch-nested-oneOf-20` 8건뿐입니다. 두 fixture에는 `if` 게이트도 조상 객체 읽기도 없습니다(`architecture/verification/design-optimization/tools/helpers/buildBranchFixture.mjs:4-8`, `architecture/verification/design-optimization/tools/helpers/buildRows.mjs:18-20`). 그래서 지금 수치는 바뀌지 않을 것으로 봅니다. 그러나 이 정의를 Ⅳ-1 정적 표의 근거로 쓰면 거짓 낙관이 되고, 검토 요청이 명시한 "oneOf와 if-then-else 조건" 및 브리프의 "gate expression reads"를 덮지 못합니다.
- 수정 명세:
  1. P2-1의 `classifyClosure` 규칙(조상 원천을 거절 사유로 셈, `owners` 검사)이 첫째와 셋째를 닫습니다.
  2. `createDiagnosticRecorder.mjs:60-64`의 `classifyClosure` 호출 인자에 `owners: frame.dependencyOwners ?? []`를 더합니다.
  3. `collectDependencyEdges.mjs:63`의 게이트 루프 안, `evaluationReads` 루프 앞에 두 줄을 넣습니다. `if (gate.kind === 'if') edges.push({ source: gate.hostPath, target: declaration.path, kind: 'gate-if-host' });` 그리고 `if (gate.kind === 'discriminator') edges.push({ source: engine.appendSegment(gate.hostPath, gate.condition.propertyName), target: declaration.path, kind: 'gate-discriminator' });`입니다.
  4. `checkTools.mjs`에 단언 세 개를 더합니다. `{ target: '/a/b/x', hosts: ['/a/b'], edges: [{ source: '/a', target: '/c', kind: 'index' }] }`는 `qualifies === false`입니다. `{ target: '/h/a/b', hosts: ['/h/a'], edges: [{ source: '/h', target: '/h/p', kind: 'gate-if-host' }] }`는 `qualifies === false`입니다. `{ target: '/h/x', hosts: ['/h'], edges: [], owners: [''] }`는 `qualifies === false`입니다.
  - 확인 방법: 새 진단 루트에서 `single-nested-d6-f4`와 `switch-nested-oneOf-20`의 useful 수가 그대로인지 확인합니다. 바뀌었다면 사유를 결과 문서에 적습니다.

### P3-1 단계 시작 레인 번들의 출처를 단언하지 않습니다

- `prepare.mjs:81-86`과 `:178-179`는 B5의 `files.S` 해시를 기록만 하고, `bundles/A/*`가 그와 같은지 확인하지 않습니다. 보관본의 `dist`가 다른 빌드여도 조용히 지나갑니다. 지금 루트는 같습니다: `inputs.json`의 `bundles/A/index.node.mjs`(sha256 `59932cf4…`)와 `bundles/A/index.mjs`(`0896a2b1…`)가 `architecture/verification/branch-switch/raw/b5/inputs.json`의 S와 일치합니다.
- 수정: `prepare.mjs:93-107` 루프에서 `lane === 'A'`일 때 `assert.deepEqual(digest(path.join(target, name)), startingHashes.files.S[name], 'Stage start equals B5 S: ' + name)`를 더합니다.

### P3-2 파일럿과 새 러너 규칙이 코드로 묶여 있지 않습니다

- `window.mjs:26`은 `pilot-summary.json`의 `processes === 22`만 보고 `currentInExpectedRange`를 보지 않습니다. `pilot.mjs:47`은 그 값을 기록만 합니다(이번 값은 1.265로 범위 안입니다). 파일럿은 B9-1의 파일럿 러너를 재고, 새 러너인 `iv-0/worker.mjs`는 재지 않습니다. 타이머 러너 예행은 루트의 `details-rehearsal.json`(oneOf-80 switch 한 행)으로만 남아 있고, 그것을 만든 스크립트가 커밋에 없으며, 창이 그 존재를 확인하지 않습니다. `checkLoad.mjs`는 바닥 분해의 noop과 leaf 변형을 비시간으로 돌려 보지 않습니다.
- 수정: `window.mjs:26` 뒤에 `assert.equal(read(path.join(root, 'pilot-summary.json')).currentInExpectedRange, true)`와, `details-rehearsal.json`의 `warmups === 1` 및 `sampleCount === 1` 단언을 더합니다. `rehearse.mjs`에 `worker.mjs <root> switch-oneOf-80 switch 0 1 1`을 실행해 그 stdout을 `details-rehearsal.json`으로 쓰는 단계를 더합니다. `checkLoad.mjs`에 두 행, 세 변형, 네 번들 조합마다 `setupFloorOperation` 뒤 `write()`와 `check()`를 한 번씩 부르는 비시간 smoke를 더합니다. 결과 문서에는 정식 원시에서 details 프로세스와 모드마다 중앙값/최솟값 비를 함께 적습니다.

### P3-3 details 레인의 단계 집합이 장부와 다르고, 사이트 수 단언이 없습니다

- `instrumentSource.mjs:17-34`와 `:54-55`는 이름이 같은 함수만 감쌉니다. 그래서 B9-0 장부의 `wheelPreparation` 영역 타이머(`architecture/verification/branch-switch/tools/b9-0/buildStages.mjs:117-140`), literal-star 별칭(`:13-16`), 생성 단계의 바깥쪽 호출만 재는 `enterCreation` 규칙이 details 레인에 없습니다. details의 `computeNode` self에는 `wheelPreparation`(설계 Ⅳ 바닥 표의 3.0 µs)이 섞입니다. `buildDiagnostics.mjs:107-120`은 diagnostics 사이트만 단언하므로, 원천이 바뀌면 하위 타이머가 조용히 빠질 수 있습니다. 지금은 열다섯 이름이 원천에 하나씩 있음을 확인했습니다.
- 수정: 항목 4의 단계별 고정·형상 분리는 `wrapped`와 `unwrapped` 짝에서 내고, `details`는 항목 5의 하위 타이머에만 씁니다. 결과 문서에 이 구분을 한 줄 적습니다. `buildDiagnostics.mjs`에 details 모드 단언을 더합니다: `instrumentSource.mjs:19-33`의 열다섯 이름, finalize 루프 이름 넷, `registryRemoval`이 각각 사이트 1개여야 합니다.

### P3-4 단계 장부의 A 레인과 B 레인은 계측 집합이 다릅니다

- `prepare.mjs:109-115`는 A를 `design-optimization`의 `buildBundle`(원래 단계 목록)로, B를 `b9-0/buildStages`(장부 목록)로 짓습니다. 단계 시작 원천에 새 함수 이름이 없으니 불가피하지만, 타이머 수가 달라서 A와 B의 단계 self나 wrapped 총합의 비율은 같은 잣대가 아닙니다.
- 수정: 결과 문서에서 A 장부를 "원래 단계 목록"으로 표시하고, A와 B의 단계 비율을 만들지 않습니다. 레인 사이 비교는 alternate 표만 씁니다.

### P3-5 원시 공개 단계가 커밋에 없고, 압축 대상이 일부뿐입니다

- `quiet-window.json`(`window.mjs:35`), `quiet-<label>.json`(`architecture/verification/branch-switch/tools/b9-1/helpers/runWindowProcess.mjs:21-24`), `cpu-prechecks/*.json`은 전체 프로세스 목록을 담습니다. `<label>.command.json`(`runWindowProcess.mjs:59-73`)은 절대 인자와 작업 디렉터리를 담습니다. 커밋에는 공개 단계가 없고, 작업 중인 미추적 `report/saveRawEvidence.mjs`는 `cpu-prechecks`만 압축합니다.
- 수정: `quiet-window.json`과 `quiet-*.json`도 `compactQuietCheck`로 줄이고, 공개하는 모든 JSON을 `portableEvidence`에 통과시키며, 지금의 기계 경로 단언을 유지합니다.

### P3-6 prepare의 git 호출이 호출자의 작업 디렉터리에서 돕니다

- `prepare.mjs:30-32`, `:33-47`, `:48-63`의 `execFileSync('git', …)`에는 `cwd`가 없습니다. 메인 체크아웃에서 실행하면 제품 diff 검사가 다른 작업 트리를 봅니다.
- 수정: 세 호출에 `cwd: repository`를 넣습니다.

### P3-7 작은 계수와 문서 불일치 네 가지

- `collectDependencyEdges.mjs:76-78`은 injectTo 규칙이 하나라도 있으면 모든 쓰기를 unknown으로 거절합니다. 그런데 `README.md:29`는 "함수형 injectTo의 정적 목적지를 증명할 수 없을 때"라고 적습니다. README를 코드에 맞추거나, 리터럴 목적지를 분석하도록 고칩니다.
- `instrumentSource.mjs:89-91`은 `new Map`과 `new Set`만 셉니다. `PathKeyedMap`과 `PathKeyedSet`은 Map과 Set을 상속하므로 빠집니다(`src/core/engine/utils/pathIndex/PathKeyedMap.ts:6`, `src/core/engine/utils/pathIndex/PathKeyedSet.ts:4`). 목록에 두 이름을 더하고, 요약에서 각각 Map과 Set으로 셉니다.
- `createDiagnosticRecorder.mjs:119-125`의 라운드 기록에는 감싸는 라운드가 없어서, 루트 라운드 하나 안에서 돈 호스트 집합을 순서로만 추정할 수 있습니다. `roundStart`에서 `const open = frame.rounds.findLast((entry) => entry.changeSetSize === undefined && entry.computeId !== computeId)`를 구하고 `parentRound: open ? frame.rounds.indexOf(open) : null`을 기록합니다.
- 루트 범위의 `qualifies`는 거의 늘 참입니다. 루트에서는 가로지름이 생길 수 없기 때문입니다. 결과 문서의 첫 수치는 `useful`로 둡니다.

## 확인한 것

- 제품 바이트 중립: `b026bd04f..4b7abf5de`의 변경 22개 파일이 모두 `architecture/verification/branch-switch/tools/iv-0/` 아래에 있습니다. `src`, `package.json`, `rolldown.config.mjs`, `vite.config.ts`의 작업 트리 변경도 없습니다. `prepare.mjs:69-80`은 현재 `dist`를 B9-1 병합 창 입력 해시와 대조합니다.
- 계측 격리: 시계 없는 `diagnostics.mjs`는 `diagnoseRows.mjs`와 `diagnoseDelivery.mjs`에서만 적재됩니다. 창의 시간 레인은 A와 B 번들, 단계 묶음, plain과 details, 힙만 씁니다(`window.mjs:54-126`). 배달 코퍼스 차이 0을 단언합니다(`diagnoseDelivery.mjs:64-65`).
- 라운드 계측: `roundStart`는 `computeNode.ts`의 라운드 루프 첫 문장에, `roundEnd`는 `finishGateTableRound` 바로 앞에 들어가고, 그 사이에 `return`이 없습니다(`src/core/engine/settle/utils/compute/computeNode.ts:191-279`). `computeId`로 다음 라운드 개시를 잇고, 원시에 `openedNext`가 있어 빈 종료 라운드와 빈 개시 라운드를 나눌 수 있습니다. oneOf-80 원시의 computeNode 호출 5회는 루트 1회와 자식 4회입니다. 설계 Ⅲ의 "루트 5회"가 실제로는 재귀 호출의 합이라는 워커 보고와 맞습니다.
- 시간 러너: 표본 사이 양보는 `setImmediate`입니다(`iv-0/worker.mjs:5`와 `:48`, `design-optimization/tools/helpers/measurePair.mjs:2`와 `:28`, `b9-0/yieldBeforeSample.mjs`). 행·변형·반복마다 프로세스 하나이고, 10 프로세스, 예열 20, 표본 100, legacy 품질입니다(`window.mjs:61-64`, `verifyInputs.mjs:17-22`). 준비 루트와 형제 디렉터리는 모두 `.noindex`로 끝납니다(`prepare.mjs:24`와 실제 목록). 창 끝 CPU 기록은 상위 10개 프로세스로 줄입니다(`window.mjs:135`). 시작 지연은 일반 120초, Spotlight 계열 600초이고(`window/waitForQuietProcess.mjs:17-18`, `:37-48`), node 자식은 preload로, bun은 사전 대기로 지킵니다(`b9-1/helpers/runWindowProcess.mjs:19-49`). 비시간 smoke가 예행과 창보다 먼저입니다(`window.mjs:22-25`).
- 세 레인: A는 단계 시작 보관본이고 원천 blob을 전수 대조합니다(`prepare.mjs:48-68`). B는 현재 `dist`이고, L은 `prepareEngines`의 0.16.1입니다. 표본은 lane과 engine으로 귀속되어 섞이지 않습니다.
- 공용 장치: `tools/window` 아래 변경이 없으므로 B9-1과 B12 창의 의미는 그대로입니다.
- 경로: 커밋 파일에 기계 경로가 없습니다. 쓰기는 준비 루트와 그 형제 `.noindex` 디렉터리로 한정됩니다. 예외는 힙 단계가 작업 트리의 `dist/index.mjs`를 바꿨다가 `finally`에서 복원하는 것인데, B9-1과 같은 상속 방식입니다(`window.mjs:103-107`, `:129`; `b9-1/window.mjs:79-80`, `:200`). PR 본문이나 결과 문서 템플릿은 diff에 없습니다.

## 미확인

- 진단을 고친 뒤의 실제 판정 변화는 확인하지 못했습니다. 창이 도는 동안 실행하지 말라는 지시 때문입니다.
- `unsetValue`와 `resetInteraction` 규칙의 의존이 모두 `blueprint.expressions`에 들어 있는지는 확인하지 못했습니다.
- 공유 `$ref` 템플릿에서 두 번째 이후 발생 위치의 간선은 확인하지 못했습니다. 정적 간선은 첫 발생 경로로만 기록됩니다(`src/core/engine/blueprint/types/node.ts:115`).
- `report/` 아래 미추적 파일은 작업 중이라 커밋 대상이 아니며, 일부만 읽었습니다.
- lint, typecheck, `checkTools.mjs`는 창 때문에 실행하지 않았습니다.

## 실행한 명령

- `git -C <worktree>`로 `log --oneline b026bd04f..HEAD`, `diff --stat`, `diff --name-only`(도구 경로 제외), `status --porcelain`(제품 경로), `rev-parse`를 실행했습니다.
- `cat -n`, `sed -n`, `grep`, `find`, `ls`, `wc`로 도구, 제품 원천, B5와 B9-1 원시, 준비 루트 파일을 읽었습니다.
- `grep -o`와 `sort | uniq -c`, `awk`로 준비 루트의 `row-diagnostics.json`과 `delivery-diagnostics.json`을 집계했습니다.
- 빌드, 시험, lint, node 실행은 하지 않았습니다.
