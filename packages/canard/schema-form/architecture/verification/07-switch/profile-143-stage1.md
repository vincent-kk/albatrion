# @canard/schema-form 배열 update 단계 분해 — 읽기 전용 진단

작성 시각: 2026-10-11T13:10:00.887Z. 제품 수정, Git 쓰기, 설치 명령 및 yarn/npm/pnpm/bun CLI 호출 없이 지정된 scratch 안에서만 산출물을 작성하였습니다. 측정·빌드·집계·보고서 스크립트는 지정된 Node 바이너리로 실행하였습니다.

## 판단에 필요한 결과

push 계열에서는 코어의 배열 정착/구조 관리 증가를 React commit·scheduler 감소가 상쇄합니다. replace는 React 신규 마운트 경로가 주된 증가입니다. 아래 수치는 현재 HEAD와 공개판을 같은 하네스로 측정한 값이며, 136k 공식 표의 7–8 ms를 직접 분해한 것으로 주장하지 않습니다.

| fixture | core Δ | React Δ | other Δ | profiled wall Δ | unprofiled wall Δ |
| --- | ---: | ---: | ---: | ---: | ---: |
| array-push-100 | +19.571 | -3.607 | +2.361 | +17.974 | +15.818 |
| array-push-remove-100 | +33.900 | -13.593 | +2.711 | +22.465 | +17.878 |
| array-replace-200 | +2.113 | +4.682 | +0.335 | +7.366 | +7.878 |

단위는 ms/전체 공식 update 시퀀스이며, 위 행은 각 그룹 합계의 pooled median 차이입니다. 서로 다른 분포의 median은 가산적이지 않습니다. 정확히 더해지는 평균 차이도 아래에 제공합니다. other는 GC와 unattributed를 합한 것입니다.

## 1. 환경과 동일성

| 항목 | 값 |
| --- | --- |
| Node | `v26.11.1` |
| Node binary | `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node` |
| V8 | `14.6.202.34-node.37` |
| React | `19.2.6` |
| react-dom | `19.2.6` |
| HEAD | `b1035b73b694f3ec6ebc717ebb6340be4bc6e592` |
| HEAD src tree | `fc6685b6baf5452eb838ef4bfa40e26cbaea2158` |
| f8a39d65e src tree | `fc6685b6baf5452eb838ef4bfa40e26cbaea2158` |
| 136k src tree | `80c23cc2d0e389cc5e925b434a2d7a228d8532f0` |
| CPU | `Apple M1 Max` |
| validation | `OFF (validationMode=0)` |
| React build | `production profiling` |
| 측정 본문 경과 | `31.014분 (보조 실행 포함; 전체 세션 시작은 2026-10-11 12:33 UTC)` |

HEAD는 현재 작업 트리의 HEAD로 고정하였고 tracked 제품 src diff가 비어 있음을 확인하였습니다. 136k의 HEAD는 `aa1433cba6a22898867fda0dd73692aadd1ce875`이며 현재와 src 트리가 다릅니다. 이 차이가 수치 변화의 원인이라는 인과 주장은 하지 않습니다.

| 실행 번들/제품 | 파일 | SHA-256 |
| --- | --- | --- |
| HEAD 하네스 번들 | `head-published.cjs` (910192 bytes) | `fe622cd4e13d94a060e441d0ef82d9fe6b818e6e0ba1ac1e1b9348b9855a8718` |
| 0.16.0 하네스 번들 | `old-published.cjs` (25929 bytes) | `de8c87160a9c84ee914698bcf1ddd941075c256b7876449288490dab285cc926` |
| 공개판 제품 ESM | `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/node_modules/@canard/schema-form_0.16.0/dist/index.mjs` | `78362ee2e5b7c0bdca5f9b80f7490c32a54ea344565e97c2b4088080a3c861b2` |

HEAD 번들은 현재 제품 src를 포함하며 0.16.0 하네스는 설치된 공개판 ESM만 동적 import합니다. 두 판 모두 같은 설치된 `@winglet/*`, React, react-dom 패키지를 사용합니다. HEAD CJS / 공개판 ESM의 모듈 형식은 공식 하네스 구조를 유지하였습니다.

`provenance-published.json`에 빌더·재사용 도구 해시와 초기 Git 상태를, `audit.json`에 종료 시 HEAD/src tree/Git 상태/도구 해시 불변 검사를 기록하였습니다.

## 2. 방법, 귀속 규칙과 재현

### 하네스와 표본

기존 prepare-react-bundles.mjs, measure-react-pair-126.entry.tsx, measure-react-pair-129.mjs의 fixture API·fresh mount·commit 보정·쓰기 루프를 재사용하였습니다. measure-react-render-counts.mjs의 React 경계와 summarize-round-93i-react-phases.mjs의 render/commit/layout/passive 구분을 참고하되, 계수/phase 타이밍 훅은 삽입하지 않았습니다. 원본 도구는 모두 [tools](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/tools) 아래에 그대로 있습니다.

주 측정은 판·fixture·lane마다 3개의 새 프로세스, 프로세스마다 보정 1회 + 예열 20회 + fresh mount update 101회입니다. pooled 판별 표본은 303개입니다. 순서는 회차별 old→HEAD / HEAD→old / old→HEAD이며, 각 판에서 plain 뒤 profile을 별도 새 프로세스로 실행하였습니다. 측정 프로세스는 하나씩만 실행하였습니다.

매 시퀀스에서 강제 GC와 mount·초기 관측값 수집은 update 시계 밖입니다. 각 쓰기는 기존 `applyInteraction`을 `flushSync`에서 호출한 뒤 `setImmediate` 4회를 기다립니다. 같은 구간의 wall과 `performance.eventLoopUtilization().active`를 기록합니다. 마지막 값과 DOM data-path digest가 모든 표본·두 판에서 같아야 하며, 쓰기별 commit 수가 그 판의 보정값과 같아야 합니다. push/remove는 old 2회 → HEAD 1회, replace는 두 판 모두 1회입니다. 서로 다른 판의 commit 수를 억지로 동일하게 단언하지 않았습니다.

| fixture | 공식 쓰기 정의 | 판별 실행 중 쓰기 수/판/lane |
| --- | --- | ---: |
| array-push-100 | 빈 `/items`에 서로 다른 값 100개를 1개씩 push, 쓰기마다 drain | 30,300 |
| array-replace-200 | 빈 `/items`에 200개 값 배열을 setValue 1회 | 303 |
| array-push-remove-100 | 같은 100 push 후 index 99→0 remove 100회, 쓰기마다 drain | 60,600 |

### 빌더 사본 변경과 계측

scratch의 entry는 기존 126 entry에서 `mountEquivalentForm`, `applyInteraction`, `setupJsdom`, `drainTicks`, `equivalentFixtures`만 re-export합니다. 빌더 사본에는 (1) old용 `@canard/schema-form`을 기존 공개판 ESM 경로로 해결하는 `releaseOnly` 분기, (2) 공식 121/136k 빌더처럼 `@winglet/*`를 external로 유지하는 `externalWinglet` 분기만 추가하였습니다.

제품 코드, react-dom, 번들 제품 본문에는 훅을 넣지 않았습니다. 기존 빌더가 benchmark mount 하네스에 넣는 아래 ELU 시계만 두 판에 동일하게 재사용하였으며 update phase 계측에는 쓰지 않았습니다.

```js
const activeStart = performance.eventLoopUtilization(); const start = performance.now();
// 기존 mountMs 반환 옆에 추가
mountActiveMs: performance.eventLoopUtilization(activeStart).active,
```

### V8 샘플링과 시간 배분

Node inspector `Profiler`를 예열 뒤 시작하여 101개 시퀀스를 기록하였습니다. 요청 interval은 100 µs입니다. GC·mount·teardown도 원 프로필에는 들어 있지만, `process.hrtime.bigint()`로 기록한 각 update 쓰기 구간과 겹치는 샘플만 집계하였습니다. inspector start/end와 hrtime 구간이 같은 monotonic 시계 범위인지 단언하였습니다. V8 `timeDeltas`를 누적한 샘플 시각을 정렬하고 이웃 시각 사이를 해당 self frame에 배분한 뒤 쓰기 경계에서 잘랐습니다. 드물게 기록된 작은 음수 delta는 누적 시각을 유지한 채 정렬하였으며, 절대 시간을 늘리거나 잘라서 맞추지 않았습니다.

HEAD의 `// packages/...`와 공개판/의존성의 `//#region src/...`를 이용해 self frame 소스 파일을 매핑합니다. 같은 파일·함수 이름의 self time을 합칩니다. 가장 가까운 의미 있는 frame으로 배타 귀속하며, 공용 helper/native self time은 호출 스택의 소유 범주를 상속합니다. 한 샘플을 둘 이상의 범주에 합산하지 않습니다.

| 범주 | 귀속 규칙 |
| --- | --- |
| core node creation | createSchemaNode/createChildNode/createChildren/schemaNodeFactory와 노드 constructor, factory/creation 경로. 하위 validation·settle frame이 있으면 그 더 가까운 단계로 분리 |
| core settle/propagation | settle/dispatch/EventCascadeManager 및 set/push/remove/value/event 전달. 배열 raw/slot/path 관리 포함 |
| core validation/bookkeeping | validation/validator/derive/recalculation/dependency/computed/conditions 함수·경로. OFF에서도 필요한 등록/읽기만 포함하며 검증 실행의 존재를 가정하지 않음 |
| core other | 위 단계가 없는 core getter·record·navigation 등. React가 부른 core 읽기도 core로 유지 |
| tracker/subscription | useSchemaNodeTracker/useSchemaNodeSubscribe/useVersion/subscribeSchemaNode, uSES snapshot/store check/store subscription, useFormTypeInputControl의 내부 callback(구독 setup·listener·refreshSource subscribe/revision). hook 본체의 render는 제외. React 범주에 합산 |
| React render | renderRoot/renderWithHooks/beginWork/completeWork/reconcile/workLoop, component·hook·wrapper 실행. React reconciler 및 render 중 host 생성 포함; component/helper self는 별도 보조 표로 분리 |
| React commit | commitRoot/mutation/beforeMutation/deletion/placement/host update와 그 안의 jsdom/DOM self |
| layout / passive effects | 각각 commitHookLayout/commitLayout/flushLayout, commitHookPassive/commitPassive/flushPassive 아래의 self. core·tracker 작업은 더 가까운 의미 frame으로 먼저 분리 |
| scheduler | React schedule/ensureRoot/processRootSchedule/performWork/flushSyncWork/lanes/enqueue/flushPendingEffects 및 scheduler 패키지. 내부의 render/commit/effect는 별도 귀속 |
| GC / unattributed | V8 garbage collector는 GC. idle/program/unknown, Node drain/Promise 및 귀속할 근거 없는 self, 샘플 coverage와 wall의 경계 잔여는 unattributed |

통계는 nearest-rank median과 Q1/Q3입니다. 표의 `[Q1,Q3]`가 spread이며 IQR=Q3−Q1입니다. 범주 median을 더하면 전체 median이 되지 않으므로 잔여를 임의로 한 범주에 밀어 넣지 않았습니다. gap share는 범주 median 차이 / profiled 전체 median 차이의 signed %입니다. 100% 초과와 음수는 다른 범주의 상쇄를 뜻합니다. unprofiled total 행의 %도 같은 분모를 쓰되, 별도 lane의 gap 크기를 비교하는 비율이며 단계별 분해에 합산하지 않습니다. 작은 범주의 0.000 median은 정확한 무비용을 증명하지 않습니다.

| fixture | old/HEAD 프로필 수 | old/HEAD 원 V8 샘플 수 | old/HEAD update 샘플 배정 수 | 실제 interval median, old/HEAD 회차별 µs |
| --- | --- | --- | --- | --- |
| array-push-100 | 3 / 3 | 246028 / 283453 | 220061 / 255929 | 153/153/153 / 153/153/153 |
| array-push-remove-100 | 3 / 3 | 293479 / 340757 | 335622 / 381322 | 152/152/152 / 153/153/153 |
| array-replace-200 | 3 / 3 | 330778 / 348139 | 234662 / 249771 | 153/153/153 / 153/153/153 |

원 V8 샘플 수에는 update 밖 작업도 포함됩니다. 배정 수는 구간 겹침 횟수이므로 긴 sample interval이 둘 이상의 쓰기에 겹치면 중복 배정될 수 있지만, 배분 시간은 겹친 길이만 사용합니다.

### 재현 명령

driver는 기존 timing JSON이 있으면 해당 worker 실행을 건너뜁니다. 따라서 아래 명령은 지정 stage1 안의 새 하위 디렉터리에 필요한 스크립트만 복사하여 실제 새 측정을 실행합니다. 측정 시와 동일한 작업 트리·설치된 의존성을 전제로 하며 도구 원본은 편집하지 않습니다. `report.mjs`는 초기 자동 생성본을 작성하고, 이번 문서 점검의 보완은 현재 `report.md`에만 반영하였습니다.

```sh
task_node='/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node'
task_source='/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/g26-143/stage1'
task_out="$task_source/repro-$(date -u +%Y%m%dT%H%M%SZ)"
"$task_node" -e 'if (process.version !== "v26.11.1") throw new Error(process.version); console.log(process.version, process.versions.v8)'
mkdir "$task_out"
for task_script in build.mjs group.mjs run.mjs measure.mjs analyze.mjs audit.mjs report.mjs; do
  cp "$task_source/$task_script" "$task_out/"
done
"$task_node" "$task_out/build.mjs" --external-winglet
"$task_node" "$task_out/group.mjs" array-push-100 1 3
"$task_node" "$task_out/group.mjs" array-replace-200 1 3
"$task_node" "$task_out/group.mjs" array-push-remove-100 1 3
"$task_node" "$task_out/analyze.mjs"
"$task_node" "$task_out/audit.mjs"
"$task_node" "$task_out/report.mjs"
```

group/run은 worker를 순차 spawn합니다. 각 worker는 420초 내 종료를 단언하고 driver는 450초 guard를 둡니다. 실제 실행 argv·시각은 `execution-published-*.json` 및 `audit.json`에 있습니다.

## 3. fixture별 전체 시퀀스 단계 표

### array-push-100

| category | 0.16.0 ms — median [Q1,Q3] | HEAD ms — median [Q1,Q3] | difference ms | share of the gap |
| --- | ---: | ---: | ---: | ---: |
| core node creation | 1.304 [1.030, 1.588] | 0.593 [0.431, 0.799] | -0.712 | -4.0% |
| core settle/propagation | 2.831 [2.369, 3.259] | 23.317 [22.299, 24.845] | +20.486 | 114.0% |
| core validation/bookkeeping | 0.149 [0.000, 0.294] | 0.155 [0.000, 0.305] | +0.006 | 0.0% |
| core other | 1.111 [0.891, 1.425] | 0.761 [0.581, 1.050] | -0.350 | -1.9% |
| React render | 35.396 [34.148, 36.682] | 38.224 [36.801, 39.547] | +2.828 | 15.7% |
| React commit | 28.754 [27.464, 30.537] | 24.234 [23.262, 25.428] | -4.520 | -25.1% |
| tracker/subscription | 1.522 [1.203, 1.846] | 1.391 [1.080, 1.715] | -0.131 | -0.7% |
| layout effects | 1.060 [0.771, 1.272] | 0.618 [0.459, 0.918] | -0.442 | -2.5% |
| passive effects | 3.054 [2.632, 3.533] | 2.574 [2.146, 2.911] | -0.480 | -2.7% |
| scheduler | 4.978 [4.482, 5.568] | 3.809 [3.340, 4.418] | -1.169 | -6.5% |
| GC | 6.581 [6.308, 6.886] | 8.043 [7.782, 8.353] | +1.462 | 8.1% |
| unattributed | 8.080 [7.480, 8.778] | 9.003 [8.348, 9.561] | +0.924 | 5.1% |
| total (profiled) | 94.915 [92.798, 97.392] | 112.889 [110.728, 115.797] | +17.974 | 100% |
| total (unprofiled wall from the same harness) | 86.180 [85.079, 89.237] | 101.999 [100.766, 103.282] | +15.818 | 88.0% (별도 lane 비교) |

같은 구간의 ELU active: profiled old 94.954 [92.849, 97.432], HEAD 112.940 [110.771, 115.847] ms; plain old 86.218 [85.116, 89.274], HEAD 102.035 [100.797, 103.326] ms입니다. ELU active는 JS self CPU만의 합이 아니므로 idle 샘플과 직접 동일시하지 않았습니다.

범주 median 차이의 합은 +17.901 ms, 전체 median 차이는 +17.974 ms입니다. 그 차이는 median의 비가산성 +0.073 ms이며, 샘플이 사라진 시간으로 해석하지 않습니다.

| render 보조 분해 (self) | 0.16.0 ms | HEAD ms | Δ ms |
| --- | ---: | ---: | ---: |
| component / hook / wrapper / JSX helper | 6.612 [5.882, 7.280] | 6.863 [6.140, 7.433] | +0.251 |
| React DOM reconciler | 10.436 [9.723, 11.324] | 12.938 [11.944, 13.860] | +2.503 |
| render 중 host 생성 / 기타 호출 | 18.245 [17.315, 19.213] | 18.565 [17.570, 19.555] | +0.320 |

| 회차 | plain old / HEAD median ms | profiled old / HEAD median ms |
| --- | ---: | ---: |
| 1 | 86.649 / 102.083 | 95.820 / 116.027 |
| 2 | 85.808 / 100.913 | 93.384 / 111.122 |
| 3 | 86.286 / 102.562 | 93.793 / 111.990 |

### array-push-remove-100

| category | 0.16.0 ms — median [Q1,Q3] | HEAD ms — median [Q1,Q3] | difference ms | share of the gap |
| --- | ---: | ---: | ---: | ---: |
| core node creation | 1.335 [1.056, 1.716] | 0.452 [0.300, 0.727] | -0.883 | -3.9% |
| core settle/propagation | 4.770 [4.260, 5.350] | 39.855 [38.411, 41.306] | +35.086 | 156.2% |
| core validation/bookkeeping | 0.149 [0.000, 0.292] | 0.308 [0.158, 0.548] | +0.159 | 0.7% |
| core other | 1.774 [1.380, 2.135] | 1.298 [0.936, 1.638] | -0.476 | -2.1% |
| React render | 44.594 [43.152, 46.464] | 46.439 [44.865, 47.984] | +1.845 | 8.2% |
| React commit | 44.743 [43.230, 46.369] | 33.397 [31.950, 34.647] | -11.346 | -50.5% |
| tracker/subscription | 1.962 [1.507, 2.285] | 2.271 [1.821, 2.603] | +0.309 | 1.4% |
| layout effects | 1.810 [1.393, 2.133] | 1.077 [0.794, 1.378] | -0.733 | -3.3% |
| passive effects | 5.909 [5.331, 6.497] | 4.752 [4.165, 5.356] | -1.157 | -5.2% |
| scheduler | 9.230 [8.502, 10.006] | 6.827 [6.258, 7.477] | -2.403 | -10.7% |
| GC | 6.705 [6.469, 6.973] | 8.005 [7.696, 8.396] | +1.300 | 5.8% |
| unattributed | 14.799 [14.008, 15.658] | 16.191 [15.262, 17.239] | +1.393 | 6.2% |
| total (profiled) | 137.784 [135.926, 140.274] | 160.249 [157.644, 163.185] | +22.465 | 100% |
| total (unprofiled wall from the same harness) | 128.643 [126.519, 131.193] | 146.521 [144.809, 149.339] | +17.878 | 79.6% (별도 lane 비교) |

같은 구간의 ELU active: profiled old 137.835 [135.971, 140.328], HEAD 160.320 [157.726, 163.256] ms; plain old 128.690 [126.559, 131.236], HEAD 146.577 [144.883, 149.403] ms입니다. ELU active는 JS self CPU만의 합이 아니므로 idle 샘플과 직접 동일시하지 않았습니다.

범주 median 차이의 합은 +23.093 ms, 전체 median 차이는 +22.465 ms입니다. 그 차이는 median의 비가산성 -0.628 ms이며, 샘플이 사라진 시간으로 해석하지 않습니다.

| render 보조 분해 (self) | 0.16.0 ms | HEAD ms | Δ ms |
| --- | ---: | ---: | ---: |
| component / hook / wrapper / JSX helper | 9.520 [8.834, 10.380] | 8.994 [8.243, 9.691] | -0.526 |
| React DOM reconciler | 16.426 [15.380, 17.535] | 18.169 [16.940, 19.289] | +1.743 |
| render 중 host 생성 / 기타 호출 | 18.657 [17.712, 19.650] | 19.291 [18.220, 20.359] | +0.634 |

| 회차 | plain old / HEAD median ms | profiled old / HEAD median ms |
| --- | ---: | ---: |
| 1 | 129.075 / 146.647 | 138.586 / 160.645 |
| 2 | 125.050 / 146.123 | 134.343 / 158.602 |
| 3 | 129.987 / 146.626 | 138.873 / 161.892 |

### array-replace-200

| category | 0.16.0 ms — median [Q1,Q3] | HEAD ms — median [Q1,Q3] | difference ms | share of the gap |
| --- | ---: | ---: | ---: | ---: |
| core node creation | 1.456 [1.234, 1.656] | 0.595 [0.311, 0.761] | -0.861 | -11.7% |
| core settle/propagation | 2.097 [1.702, 2.432] | 5.404 [5.148, 5.701] | +3.307 | 44.9% |
| core validation/bookkeeping | 0.155 [0.149, 0.307] | 0.000 [0.000, 0.154] | -0.155 | -2.1% |
| core other | 0.738 [0.456, 0.918] | 0.473 [0.306, 0.768] | -0.265 | -3.6% |
| React render | 47.723 [45.835, 49.404] | 51.222 [49.760, 53.087] | +3.499 | 47.5% |
| React commit | 39.415 [38.150, 40.837] | 38.997 [37.616, 40.583] | -0.418 | -5.7% |
| tracker/subscription | 2.448 [2.103, 2.884] | 3.338 [3.004, 3.792] | +0.890 | 12.1% |
| layout effects | 1.349 [1.182, 1.649] | 2.100 [1.842, 2.433] | +0.751 | 10.2% |
| passive effects | 3.436 [3.133, 3.741] | 3.134 [2.827, 3.446] | -0.302 | -4.1% |
| scheduler | 3.062 [2.709, 3.508] | 3.602 [3.172, 3.969] | +0.540 | 7.3% |
| GC | 13.084 [12.714, 13.509] | 13.432 [12.944, 13.763] | +0.348 | 4.7% |
| unattributed | 2.314 [1.965, 2.759] | 2.312 [1.920, 2.721] | -0.002 | -0.0% |
| total (profiled) | 116.998 [115.127, 120.252] | 124.364 [122.399, 128.414] | +7.366 | 100% |
| total (unprofiled wall from the same harness) | 106.360 [104.582, 108.306] | 114.239 [112.754, 116.617] | +7.878 | 107.0% (별도 lane 비교) |

같은 구간의 ELU active: profiled old 117.001 [115.130, 120.257], HEAD 124.366 [122.402, 128.417] ms; plain old 106.363 [104.585, 108.309], HEAD 114.244 [112.757, 116.620] ms입니다. ELU active는 JS self CPU만의 합이 아니므로 idle 샘플과 직접 동일시하지 않았습니다.

범주 median 차이의 합은 +7.332 ms, 전체 median 차이는 +7.366 ms입니다. 그 차이는 median의 비가산성 +0.034 ms이며, 샘플이 사라진 시간으로 해석하지 않습니다.

| render 보조 분해 (self) | 0.16.0 ms | HEAD ms | Δ ms |
| --- | ---: | ---: | ---: |
| component / hook / wrapper / JSX helper | 6.595 [5.865, 7.304] | 7.653 [6.869, 8.394] | +1.058 |
| React DOM reconciler | 9.028 [8.000, 10.076] | 11.361 [10.373, 12.225] | +2.333 |
| render 중 host 생성 / 기타 호출 | 32.005 [30.661, 33.459] | 32.410 [31.095, 33.617] | +0.405 |

| 회차 | plain old / HEAD median ms | profiled old / HEAD median ms |
| --- | ---: | ---: |
| 1 | 107.702 / 113.821 | 117.978 / 125.001 |
| 2 | 104.840 / 114.374 | 118.155 / 124.021 |
| 3 | 106.158 / 114.709 | 114.590 / 123.800 |

### 정확히 가산되는 평균 예산

| fixture | core mean Δ | React mean Δ | other mean Δ | 합계 mean Δ |
| --- | ---: | ---: | ---: | ---: |
| array-push-100 | +19.669 | -3.867 | +2.335 | +18.137 |
| array-push-remove-100 | +33.978 | -13.560 | +3.300 | +23.719 |
| array-replace-200 | +2.180 | +5.337 | +0.252 | +7.770 |

### GC·대기와 미귀속

| fixture | old/HEAD unattributed median ms (% wall) | idle mean old/HEAD ms | program mean old/HEAD ms | 기타 미귀속 mean old/HEAD ms |
| --- | ---: | ---: | ---: | ---: |
| array-push-100 | 8.080 (8.5%) / 9.003 (8.0%) | 5.141 / 5.517 | 1.910 / 2.365 | 1.046 / 1.094 |
| array-push-remove-100 | 14.799 (10.7%) / 16.191 (10.1%) | 10.383 / 11.451 | 2.807 / 3.667 | 1.611 / 1.627 |
| array-replace-200 | 2.314 (2.0%) / 2.312 (1.9%) | 0.063 / 0.060 | 1.664 / 1.723 | 0.638 / 0.558 |

`program`은 V8가 JS 위치를 제공하지 않은 시간이며 core/React로 추정 분배하지 않았습니다. GC는 업데이트 안에서 관측된 V8 GC self이며 원인이 된 할당 소유자는 이 방법으로 확정하지 못하였습니다. 모든 쓰기의 12범주 합과 wall의 차이는 0.01 ms 미만으로 단언하였습니다.

## 4. HEAD self-time 증가 상위 함수

아래 ms는 시퀀스당 self time의 **평균** 차이입니다. zero-heavy 함수에서 median 순위가 정보를 잃는 것을 피하였습니다. 같은 소스 파일·함수 이름을 비교하고, HEAD에만 있는 함수의 old 값은 그 이름의 관측값 0입니다. 이는 기능상 old 대응 구현 전체가 무료라는 뜻이 아닙니다. 익명 함수는 파일 내 익명 self의 합이며 native/GC처럼 파일을 식별할 수 없는 frame은 이 표에서 제외하였습니다.

### array-push-100

| name | source file | 0.16.0 self ms | HEAD self ms | Δ ms |
| --- | --- | ---: | ---: | ---: |
| `readRawTree` | `packages/canard/schema-form/src/core/settle/utils/latent/readRawTree.ts` | 0.000 | 3.564 | +3.564 |
| `applyArraySlots` | `packages/canard/schema-form/src/core/settle/utils/structure/applyArraySlots.ts` | 0.000 | 3.044 | +3.044 |
| `selectChildren` | `packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts` | 0.000 | 2.695 | +2.695 |
| `computeNode` | `packages/canard/schema-form/src/core/settle/utils/compute/computeNode.ts` | 0.000 | 2.238 | +2.238 |
| `arrangeSchemaNodeItems` | `packages/canard/schema-form/src/core/settle/utils/structure/arrangeSchemaNodeItems.ts` | 0.000 | 1.384 | +1.384 |
| `rekeyArrayRuntimePaths` | `packages/canard/schema-form/src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts` | 0.000 | 0.855 | +0.855 |
| `propagateParentContextChanges` | `node_modules/react-dom/cjs/react-dom-profiling.profiling.js` | 0.588 | 1.341 | +0.753 |
| `shouldConstruct` | `node_modules/react-dom/cjs/react-dom-profiling.profiling.js` | 0.036 | 0.775 | +0.739 |
| `markCommitDeliveries` | `packages/canard/schema-form/src/core/settle/utils/commit/markCommitDeliveries.ts` | 0.000 | 0.660 | +0.660 |
| `commitSettlement` | `packages/canard/schema-form/src/core/settle/utils/commit/commitSettlement.ts` | 0.000 | 0.557 | +0.557 |

### array-push-remove-100

| name | source file | 0.16.0 self ms | HEAD self ms | Δ ms |
| --- | --- | ---: | ---: | ---: |
| `readRawTree` | `packages/canard/schema-form/src/core/settle/utils/latent/readRawTree.ts` | 0.000 | 6.098 | +6.098 |
| `applyArraySlots` | `packages/canard/schema-form/src/core/settle/utils/structure/applyArraySlots.ts` | 0.000 | 5.799 | +5.799 |
| `selectChildren` | `packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts` | 0.000 | 4.879 | +4.879 |
| `computeNode` | `packages/canard/schema-form/src/core/settle/utils/compute/computeNode.ts` | 0.000 | 3.072 | +3.072 |
| `arrangeSchemaNodeItems` | `packages/canard/schema-form/src/core/settle/utils/structure/arrangeSchemaNodeItems.ts` | 0.000 | 2.407 | +2.407 |
| `rekeyArrayRuntimePaths` | `packages/canard/schema-form/src/core/settle/utils/structure/rekeyArrayRuntimePaths.ts` | 0.000 | 1.740 | +1.740 |
| `propagateParentContextChanges` | `node_modules/react-dom/cjs/react-dom-profiling.profiling.js` | 1.118 | 2.422 | +1.304 |
| `markCommitDeliveries` | `packages/canard/schema-form/src/core/settle/utils/commit/markCommitDeliveries.ts` | 0.000 | 1.093 | +1.093 |
| `ArrayItems2` | `packages/canard/schema-form/src/formTypeDefinitions/FormTypeInputArray.tsx` | 0.000 | 0.920 | +0.920 |
| `commitSettlement` | `packages/canard/schema-form/src/core/settle/utils/commit/commitSettlement.ts` | 0.000 | 0.892 | +0.892 |

### array-replace-200

| name | source file | 0.16.0 self ms | HEAD self ms | Δ ms |
| --- | --- | ---: | ---: | ---: |
| `shouldConstruct` | `node_modules/react-dom/cjs/react-dom-profiling.profiling.js` | 0.056 | 1.323 | +1.266 |
| `subscribeSchemaNode` | `packages/canard/schema-form/src/core/dispatch/utils/read/subscribeSchemaNode.ts` | 0.000 | 0.713 | +0.713 |
| `mountWorkInProgressHook` | `node_modules/react-dom/cjs/react-dom-profiling.profiling.js` | 0.150 | 0.734 | +0.584 |
| `FormTypeInputBoundary` | `packages/canard/schema-form/src/helpers/formTypeInputDefinition/utils/withFormTypeInputErrorBoundary.tsx` | 0.000 | 0.583 | +0.583 |
| `computeNode` | `packages/canard/schema-form/src/core/settle/utils/compute/computeNode.ts` | 0.000 | 0.532 | +0.532 |
| `selectChildren` | `packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts` | 0.000 | 0.494 | +0.494 |
| `markCommitDeliveries` | `packages/canard/schema-form/src/core/settle/utils/commit/markCommitDeliveries.ts` | 0.000 | 0.423 | +0.423 |
| `markWrite` | `packages/canard/schema-form/src/core/settle/utils/write/markWrite.ts` | 0.000 | 0.414 | +0.414 |
| `(anonymous)` | `packages/canard/schema-form/src/components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx` | 1.807 | 2.193 | +0.386 |
| `(anonymous)` | `packages/canard/schema-form/src/hooks/useSchemaNodeTracker.ts` | 0.316 | 0.670 | +0.354 |

## 5. 118의 열린 귀속과 117의 정합성

[118](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/react-layer-diagnosis-118.md)의 +0.40 / +0.64 ms는 각각 array-push-100의 push 100회, array-push-remove-100의 push 100회+remove 100회에 대한 **평균 쓰기당 ELU active 차이**입니다. 한 번의 100개 일괄 push나 replace-200의 값이 아닙니다. 당시 HEAD는 3a637c4cd이며 후속 고침 전입니다. 현재 동일 시퀀스의 plain active median 차이를 쓰기 수로 나누면 +0.158 / +0.089 ms입니다. 현재 프로필의 가산적 평균 귀속은 push 쓰기당 core +0.197, React -0.039, other +0.023 ms; push/remove 전체 쓰기당 core +0.170, React -0.068, other +0.017 ms입니다. 현재 gap은 개별 쓰기와 push/remove 부분합까지 분해하였지만, unattributed median은 old/HEAD 각각 push 8.080/9.003 ms, push/remove 14.799/16.191 ms로 남습니다. 현재 프로필 귀속을 과거 CPU active +0.40/+0.64의 분해로 대체하지 않습니다.

118을 소급 종결하려면 당시 HEAD `3a637c4cd`와 공개판을 당시 `diag.mjs`의 쓰기 구간·drain 종료점으로 맞춘 단계별 CPU profile, 같은 쓰기의 wall/ELU active, 번들·환경 식별 증거가 필요합니다. 특히 push/remove의 +0.64 ms가 push 100회와 remove 100회에 각각 얼마나 속했는지도 같은 구간에서 구분해야 합니다. 이번 세션은 현재 HEAD의 303개 표본을 수집하였고, 118의 당시 시간 표본 11회에 대응하는 이 증거를 수집·재측정하지 않았습니다. 따라서 대상 행과 쓰기는 확인하였지만 과거 증가분 자체의 정확한 귀속은 미해결입니다.

[117](/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch/profile-117-session.md)의 core 증가는 push +14.696 ms(2.980→17.676), push/remove +25.143 ms(4.535→29.678)입니다. 그러나 그 보고서의 전체 wall 증가는 각각 +154.919 ms(236.514→391.433), +260.397 ms(504.756→765.153)였으며 React 잔여에는 drainTicks(2) 대기가 들어갑니다. 따라서 이 core 수치를 다른 종료점·후속 제품의 136k +6.949/+8.239 ms에 그대로 더하는 것은 동일 회계가 아닙니다. 현재 동일 구간의 core median 증가 +19.571 / +33.900 ms를 React median -3.607 / -13.593 ms가 상쇄합니다. old 쪽에서 더 큰 항목은 push의 commit -4.520, scheduler -1.169, passive -0.480 ms와 push/remove의 commit -11.346, scheduler -2.403, passive -1.157 ms입니다. 코어의 전체 시간 비중보다 **버전 간 증가와 상쇄**를 보아야 하며, 현재 push 계열에서는 코어 단독 고침을 먼저 검토할 근거가 있습니다.

## 6. 읽기와 다음 고침 후보

push gap의 주된 양수는 core settle/propagation +20.486 ms이며 React 전체는 -3.607 ms입니다. push/remove도 core settle +35.086 ms가 주된 증가이고 React -13.593 ms가 상쇄합니다. replace는 React 전체 +4.682 ms가 core +2.113 ms보다 큽니다. node creation은 세 행에서 양의 주된 증가로 관측되지 않았고 validation/derived bookkeeping도 주된 gap이 아닙니다.

아래 절감량은 구현 결과가 아니라 **조건부 예산**입니다. 해당 self 구간의 50%를 없앤다는 가정의 절감액과 관측 상한을 제공합니다. 다른 호출의 시간·GC를 함께 절약한다고 더하지 않았습니다. profiler overhead가 있으므로 이를 배포 wall 절감량으로 보장하지 않습니다.

| 후보 | 구분 | 근거와 시도할 경계 | 조건부 절감 예산 / 관측 self 상한 |
| --- | --- | --- | --- |
| append / remove-last에서 raw·slot·path 전체 재구성 줄이기 | core | readRawTree의 기존 slot 순회, applyArraySlots의 전체 slot/map/set 재구성, rekey의 움직이지 않는 path 처리를 함께 확인. 이 fixture는 끝에서만 추가/삭제하므로 일반 재배열을 거치지 않는 경계가 후보입니다 | push 4.423 / 8.847 ms; push/remove 8.022 / 16.044 ms |
| 구조가 그대로인 자식의 select/compute 재방문 줄이기 | core | selectChildren와 computeNode에서 dirty child 및 새/제거 slot만 처리할 수 있는지 확인. snapshot·latent/branch·path 계약은 유지되어야 합니다 | push 2.466 / 4.933 ms; push/remove 3.976 / 7.951 ms; replace 0.513 / 1.025 ms |
| 입력의 uSES tracker 통합과 등록/스냅샷 중복 줄이기 | React (tracker) | useFormTypeInputControl의 refresh tracker, SchemaNodeInput과 useChildNodeComponents의 tracker를 한 스냅샷으로 합치는 기존 F-E 방향. 포커스/선택 layout 구독과 자식의 commit 순서는 유지. 현재 보류된 F-E의 구현 승인으로 읽지 않습니다 | replace tracker 전체의 50%는 1.669 ms, 관측 전체 3.338 ms. old보다 증가한 tracker 자체는 +0.890 ms입니다 |

per-child layout effect는 replace layout 범주 전체 2.100 ms 안에 포함되며 증가 +0.751 ms입니다. child counter 한 effect만의 비용을 이 전체값으로 주장하지 않았습니다. push 계열에서 layout/passive가 old보다 작은 경우, 이들을 전체 gap의 주된 원인으로 추천하지 않습니다. ErrorBoundary·React render 증가도 관측되지만 계약을 유지하는 구체적 고침의 절감량은 이 측정만으로 확정하지 못하였습니다. 고침은 구현하지 않았습니다.

## 7. 공식 수치 대조와 한계

| fixture | 136k old/HEAD median ms (gap) | 현재 plain old/HEAD median ms (gap) | 현재 profiled old/HEAD median ms (gap) |
| --- | ---: | ---: | ---: |
| array-push-100 | 84.888 / 91.837 (+6.949) | 86.180 / 101.999 (+15.818) | 94.915 / 112.889 (+17.974) |
| array-push-remove-100 | 122.520 / 130.760 (+8.239) | 128.643 / 146.521 (+17.878) | 137.784 / 160.249 (+22.465) |
| array-replace-200 | 106.485 / 113.781 (+7.297) | 106.360 / 114.239 (+7.878) | 116.998 / 124.364 (+7.366) |

세 행 모두 HEAD가 느린 방향은 같습니다. replace의 profiled gap +7.366 ms는 공식 +7.297 ms와 비슷하지만, push +17.974 ms와 push/remove +22.465 ms는 공식 +6.949/+8.239 ms의 크기를 재현하지 못했습니다. 예를 들어 push/remove는 core +33.900 ms에서 React -13.593 ms만큼 상쇄되며 other +2.711 ms가 남습니다. 그룹별 median의 비가산성을 포함한 전체 median gap은 +22.465 ms입니다. 정확히 가산되는 평균으로도 core +33.978, React -13.560, other +3.300 ms → 전체 +23.719 ms이므로, 이 측정의 단계 몫을 공식 +8.239 ms에 직접 맞출 수 없습니다.

차이를 계측 lane과 공식 기준선으로 나누면 아래와 같습니다. 단위는 ms이며, 각 열은 위 전체 median gap끼리의 차이입니다.

| fixture | profiled gap − 같은 하네스 plain gap | 같은 하네스 plain gap − 공식 gap | profiled gap − 공식 gap |
| --- | ---: | ---: | ---: |
| array-push-100 | +2.156 | +8.870 | +11.025 |
| array-push-remove-100 | +4.587 | +9.639 | +14.225 |
| array-replace-200 | -0.513 | +0.582 | +0.069 |

프로파일링을 끈 같은 하네스에서도 wall gap은 push +15.818, push/remove +17.878, replace +7.878 ms입니다. 따라서 push 계열의 공식 대비 차이는 profiler를 끈 상태에도 +8.870/+9.639 ms 남습니다. profiled/plain은 별도 worker에서 측정하였으므로 첫 열은 lane 간 관측 차이이며 profiler overhead의 인과적 절감량으로 확정하지 않습니다. 두 판의 총량이 모두 늘어도 버전 간 gap은 줄 수 있어 replace의 첫 열이 음수입니다. 현재 HEAD와 136k의 src tree가 다르고 실행 시점·환경·번들 조건도 완전히 고정한 재대조가 아니므로, 남은 plain 차이의 원인이 src·환경·하네스 중 무엇인지 이 자료만으로 구분할 수 없습니다. 같은 src와 조건을 고정한 추가 대조 없이 특정 원인을 추정하지 않았습니다.

기본 prepare 도구의 working Winglet 인라인 모드도 보조 측정(r 접두)하였습니다. 이후 공식 방식의 external 모드(p 접두)로 주 측정을 통일했습니다. 외부화 뒤에도 큰 plain gap이 남았으므로 helper 연결 방식만으로 공식 표와의 차이를 설명하지 않았습니다. 보조 자료는 표본에 섞지 않고 원본 그대로 보존하였습니다.

검증: 주 worker 36개, 원 CPU profile 18개, 판별 시퀀스 3636개, 예열 720개, 보정 36개, 체크한 쓰기 440664개, 실패 0개입니다. 보조 worker 32개도 주 worker와 순차입니다. 프로필은 gzip으로 보존했고 최대 raw profile 크기는 465260 bytes입니다. 소스 변경·Git 상태 변경·도구 해시 변경은 없습니다.

## 부록 A. push/remove 부분합

각 부분합은 한 표본 안의 해당 쓰기 시간을 먼저 더한 뒤 303개 분포의 median을 구하였습니다. 반면 쓰기당 평균 귀속은 해당 부분합의 평균 / 쓰기 수입니다. 서로 다른 쓰기의 median 합을 총량으로 만들지 않았습니다.

| fixture / 부분 | old wall median | HEAD wall median | core mean Δ/쓰기 | React mean Δ/쓰기 | other mean Δ/쓰기 |
| --- | ---: | ---: | ---: | ---: | ---: |
| array-push-100 / push 1–100 | 94.915 [92.798, 97.392] | 112.889 [110.728, 115.797] | +0.197 | -0.039 | +0.023 |
| array-push-remove-100 / push 1–100 | 96.196 [94.467, 98.702] | 109.723 [107.421, 112.288] | +0.184 | -0.064 | +0.020 |
| array-push-remove-100 / remove index 99→0 | 41.465 [40.665, 42.176] | 50.588 [49.582, 51.687] | +0.155 | -0.072 | +0.013 |
| array-replace-200 / replace 1회 | 116.998 [115.127, 120.252] | 124.364 [122.399, 128.414] | +2.180 | +5.337 | +0.252 |

## 부록 B. 모든 개별 공식 쓰기

번호는 1부터 시작합니다. push 값은 기존 fixture 배열의 순서이며 remove는 표의 실제 index입니다. 각 쓰기를 독립적으로 303회 관측한 profiled wall median과 core/React/other 그룹 median 차이를 아래에 기록하였습니다. 범주별 old/HEAD median·Q1·Q3 전체는 [per-write.csv](per-write.csv)에 있습니다. plain 개별 wall/active·profile sample window는 원 JSON에 보존하였습니다.

### array-push-100

| write | kind / index | old wall ms | HEAD wall ms | core Δ ms | React Δ ms | other Δ ms |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | push | 1.247 | 1.872 | +0.234 | +0.394 | +0.039 |
| 2 | push | 0.920 | 1.283 | +0.146 | +0.335 | +0.006 |
| 3 | push | 1.044 | 0.956 | +0.143 | -0.111 | +0.010 |
| 4 | push | 0.780 | 0.866 | +0.103 | -0.040 | +0.071 |
| 5 | push | 0.759 | 0.883 | +0.131 | +0.012 | +0.001 |
| 6 | push | 0.756 | 0.964 | +0.136 | +0.141 | +0.013 |
| 7 | push | 0.822 | 1.425 | +0.167 | +0.244 | +0.058 |
| 8 | push | 0.769 | 0.838 | +0.138 | -0.072 | +0.145 |
| 9 | push | 0.722 | 0.816 | +0.126 | +0.001 | +0.136 |
| 10 | push | 0.728 | 0.801 | +0.120 | +0.001 | +0.147 |
| 11 | push | 0.731 | 0.816 | +0.135 | -0.007 | +0.144 |
| 12 | push | 0.732 | 0.818 | +0.153 | -0.003 | +0.140 |
| 13 | push | 0.734 | 0.831 | +0.136 | +0.008 | +0.142 |
| 14 | push | 0.732 | 0.825 | +0.144 | +0.001 | +0.144 |
| 15 | push | 0.738 | 0.825 | +0.158 | -0.002 | +0.038 |
| 16 | push | 0.736 | 0.823 | +0.142 | +0.000 | +0.126 |
| 17 | push | 0.756 | 0.838 | +0.147 | -0.009 | -0.002 |
| 18 | push | 0.756 | 0.838 | +0.169 | -0.022 | -0.122 |
| 19 | push | 0.780 | 0.855 | +0.146 | -0.053 | +0.053 |
| 20 | push | 0.749 | 0.854 | +0.159 | -0.023 | +0.000 |
| 21 | push | 0.753 | 0.858 | +0.157 | -0.005 | +0.048 |
| 22 | push | 0.768 | 0.861 | +0.174 | -0.031 | +0.002 |
| 23 | push | 0.760 | 0.875 | +0.174 | -0.020 | +0.039 |
| 24 | push | 0.754 | 0.868 | +0.176 | -0.000 | +0.004 |
| 25 | push | 0.761 | 0.861 | +0.181 | -0.002 | -0.138 |
| 26 | push | 0.764 | 0.857 | +0.191 | -0.014 | -0.032 |
| 27 | push | 0.765 | 0.862 | +0.211 | -0.016 | -0.143 |
| 28 | push | 0.763 | 0.868 | +0.187 | -0.019 | +0.011 |
| 29 | push | 0.773 | 0.869 | +0.220 | -0.036 | -0.130 |
| 30 | push | 0.770 | 0.870 | +0.218 | -0.024 | -0.133 |
| 31 | push | 0.775 | 0.881 | +0.203 | -0.026 | -0.025 |
| 32 | push | 0.776 | 0.879 | +0.221 | -0.031 | -0.135 |
| 33 | push | 0.785 | 0.890 | +0.191 | -0.041 | -0.074 |
| 34 | push | 0.781 | 2.285 | +0.189 | -0.039 | +1.463 |
| 35 | push | 0.786 | 1.290 | +0.325 | +0.249 | +0.139 |
| 36 | push | 0.786 | 0.961 | +0.201 | -0.034 | -0.005 |
| 37 | push | 0.796 | 0.927 | +0.199 | -0.041 | -0.117 |
| 38 | push | 0.801 | 0.930 | +0.207 | -0.054 | -0.094 |
| 39 | push | 2.286 | 0.934 | +0.177 | -0.093 | -1.441 |
| 40 | push | 1.143 | 0.929 | +0.125 | -0.382 | +0.063 |
| 41 | push | 0.860 | 0.938 | +0.219 | -0.122 | +0.014 |
| 42 | push | 0.834 | 0.937 | +0.197 | -0.102 | +0.036 |
| 43 | push | 0.844 | 0.951 | +0.210 | -0.117 | +0.000 |
| 44 | push | 0.827 | 0.939 | +0.207 | -0.100 | +0.079 |
| 45 | push | 0.834 | 0.955 | +0.203 | -0.096 | +0.110 |
| 46 | push | 0.830 | 0.956 | +0.223 | -0.085 | -0.140 |
| 47 | push | 0.836 | 0.962 | +0.220 | -0.108 | +0.017 |
| 48 | push | 0.834 | 0.955 | +0.210 | -0.091 | +0.144 |
| 49 | push | 0.839 | 0.965 | +0.209 | -0.101 | +0.030 |
| 50 | push | 0.840 | 0.962 | +0.209 | -0.105 | +0.014 |
| 51 | push | 0.839 | 0.965 | +0.215 | -0.107 | +0.147 |
| 52 | push | 0.851 | 0.970 | +0.202 | -0.108 | +0.148 |
| 53 | push | 0.878 | 0.982 | +0.211 | -0.145 | +0.148 |
| 54 | push | 0.840 | 0.975 | +0.207 | -0.104 | +0.146 |
| 55 | push | 0.834 | 3.561 | +0.218 | -0.093 | +2.631 |
| 56 | push | 0.834 | 1.460 | +0.388 | +0.333 | +0.009 |
| 57 | push | 0.837 | 1.107 | +0.260 | +0.054 | +0.130 |
| 58 | push | 0.835 | 1.086 | +0.266 | +0.055 | +0.079 |
| 59 | push | 0.849 | 1.192 | +0.266 | +0.040 | +0.143 |
| 60 | push | 0.860 | 1.126 | +0.271 | +0.007 | -0.007 |
| 61 | push | 0.851 | 1.088 | +0.256 | +0.022 | +0.130 |
| 62 | push | 0.840 | 1.081 | +0.255 | +0.035 | +0.139 |
| 63 | push | 3.534 | 1.047 | +0.194 | +0.039 | -2.642 |
| 64 | push | 1.264 | 1.047 | +0.177 | -0.308 | -0.134 |
| 65 | push | 0.923 | 1.047 | +0.254 | -0.013 | +0.009 |
| 66 | push | 0.881 | 1.058 | +0.262 | +0.003 | -0.108 |
| 67 | push | 0.880 | 1.073 | +0.278 | +0.014 | -0.063 |
| 68 | push | 0.886 | 1.074 | +0.280 | -0.002 | +0.045 |
| 69 | push | 0.877 | 1.080 | +0.279 | +0.007 | +0.104 |
| 70 | push | 0.879 | 1.087 | +0.273 | +0.007 | +0.144 |
| 71 | push | 0.884 | 1.092 | +0.277 | -0.002 | +0.140 |
| 72 | push | 0.884 | 1.100 | +0.274 | +0.005 | +0.140 |
| 73 | push | 0.891 | 1.081 | +0.273 | -0.002 | +0.142 |
| 74 | push | 0.889 | 1.083 | +0.274 | -0.000 | +0.134 |
| 75 | push | 0.892 | 1.091 | +0.269 | +0.002 | +0.129 |
| 76 | push | 0.921 | 1.117 | +0.284 | -0.011 | -0.019 |
| 77 | push | 0.892 | 1.097 | +0.287 | -0.003 | +0.005 |
| 78 | push | 0.894 | 2.871 | +0.263 | +0.002 | +1.906 |
| 79 | push | 0.899 | 1.562 | +0.431 | +0.291 | +0.136 |
| 80 | push | 0.899 | 1.182 | +0.318 | -0.004 | +0.138 |
| 81 | push | 0.904 | 1.125 | +0.301 | -0.006 | +0.141 |
| 82 | push | 0.907 | 1.121 | +0.295 | -0.006 | +0.140 |
| 83 | push | 0.909 | 1.120 | +0.303 | -0.004 | +0.143 |
| 84 | push | 0.915 | 1.130 | +0.288 | -0.006 | +0.028 |
| 85 | push | 0.925 | 1.170 | +0.317 | -0.008 | +0.092 |
| 86 | push | 0.927 | 1.121 | +0.319 | -0.010 | +0.003 |
| 87 | push | 0.922 | 1.122 | +0.269 | -0.008 | +0.144 |
| 88 | push | 0.922 | 1.125 | +0.289 | -0.004 | +0.118 |
| 89 | push | 0.940 | 1.127 | +0.285 | -0.026 | +0.031 |
| 90 | push | 2.875 | 1.136 | +0.268 | -0.040 | -1.917 |
| 91 | push | 1.387 | 1.131 | +0.255 | -0.451 | +0.007 |
| 92 | push | 1.051 | 1.124 | +0.291 | -0.150 | +0.136 |
| 93 | push | 1.015 | 1.149 | +0.305 | -0.123 | +0.084 |
| 94 | push | 1.004 | 1.160 | +0.316 | -0.112 | +0.056 |
| 95 | push | 1.026 | 1.160 | +0.322 | -0.160 | -0.042 |
| 96 | push | 0.993 | 1.165 | +0.324 | -0.099 | +0.005 |
| 97 | push | 0.975 | 1.174 | +0.333 | -0.083 | +0.054 |
| 98 | push | 0.970 | 1.195 | +0.330 | -0.066 | +0.012 |
| 99 | push | 0.976 | 2.939 | +0.342 | -0.080 | +1.818 |
| 100 | push | 0.975 | 1.604 | +0.426 | +0.221 | +0.006 |

### array-push-remove-100

| write | kind / index | old wall ms | HEAD wall ms | core Δ ms | React Δ ms | other Δ ms |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | push | 1.340 | 2.044 | +0.206 | +0.440 | +0.039 |
| 2 | push | 1.011 | 1.194 | +0.174 | +0.064 | -0.080 |
| 3 | push | 0.783 | 0.960 | +0.137 | +0.105 | +0.089 |
| 4 | push | 0.776 | 0.864 | +0.098 | -0.069 | +0.115 |
| 5 | push | 0.763 | 0.864 | +0.113 | -0.031 | +0.129 |
| 6 | push | 0.745 | 0.850 | +0.126 | -0.009 | +0.077 |
| 7 | push | 0.755 | 1.105 | +0.135 | +0.104 | +0.007 |
| 8 | push | 0.786 | 0.836 | +0.144 | -0.074 | +0.013 |
| 9 | push | 0.737 | 0.819 | +0.098 | +0.002 | +0.100 |
| 10 | push | 0.736 | 0.802 | +0.131 | -0.011 | +0.143 |
| 11 | push | 0.735 | 0.819 | +0.121 | +0.000 | +0.127 |
| 12 | push | 0.739 | 0.807 | +0.162 | -0.053 | +0.133 |
| 13 | push | 0.739 | 0.811 | +0.136 | -0.010 | +0.147 |
| 14 | push | 0.738 | 0.811 | +0.169 | +0.002 | +0.040 |
| 15 | push | 0.745 | 0.824 | +0.175 | -0.006 | +0.000 |
| 16 | push | 0.742 | 0.828 | +0.132 | -0.003 | +0.145 |
| 17 | push | 0.758 | 0.861 | +0.184 | -0.007 | +0.081 |
| 18 | push | 0.754 | 0.841 | +0.165 | -0.009 | +0.000 |
| 19 | push | 0.760 | 0.861 | +0.163 | -0.010 | -0.113 |
| 20 | push | 0.753 | 0.845 | +0.153 | -0.013 | +0.001 |
| 21 | push | 0.771 | 0.842 | +0.185 | -0.035 | -0.000 |
| 22 | push | 0.759 | 0.844 | +0.165 | -0.014 | +0.000 |
| 23 | push | 0.765 | 0.849 | +0.157 | -0.021 | -0.024 |
| 24 | push | 0.764 | 0.854 | +0.182 | -0.009 | -0.142 |
| 25 | push | 0.773 | 0.874 | +0.169 | -0.020 | +0.007 |
| 26 | push | 0.771 | 0.874 | +0.168 | -0.030 | +0.112 |
| 27 | push | 0.775 | 0.866 | +0.183 | -0.059 | -0.000 |
| 28 | push | 0.776 | 0.870 | +0.196 | -0.038 | -0.064 |
| 29 | push | 0.792 | 0.875 | +0.172 | -0.058 | +0.000 |
| 30 | push | 0.796 | 0.876 | +0.187 | -0.056 | -0.115 |
| 31 | push | 0.802 | 0.884 | +0.170 | -0.057 | -0.005 |
| 32 | push | 0.802 | 0.891 | +0.207 | -0.050 | -0.056 |
| 33 | push | 0.810 | 0.904 | +0.169 | -0.075 | -0.029 |
| 34 | push | 0.809 | 0.908 | +0.161 | -0.049 | -0.079 |
| 35 | push | 0.810 | 2.329 | +0.196 | -0.079 | +1.497 |
| 36 | push | 0.813 | 1.329 | +0.337 | +0.211 | +0.139 |
| 37 | push | 0.816 | 0.978 | +0.196 | +0.063 | +0.025 |
| 38 | push | 0.813 | 0.937 | +0.182 | -0.080 | +0.143 |
| 39 | push | 2.263 | 0.926 | +0.164 | -0.083 | -1.374 |
| 40 | push | 1.222 | 0.921 | +0.115 | -0.368 | -0.094 |
| 41 | push | 0.919 | 0.923 | +0.173 | -0.208 | +0.136 |
| 42 | push | 0.864 | 0.924 | +0.195 | -0.134 | -0.039 |
| 43 | push | 0.859 | 0.940 | +0.192 | -0.122 | +0.138 |
| 44 | push | 0.845 | 0.928 | +0.208 | -0.101 | -0.131 |
| 45 | push | 0.850 | 0.940 | +0.201 | -0.124 | +0.027 |
| 46 | push | 0.844 | 0.957 | +0.207 | -0.111 | +0.123 |
| 47 | push | 0.859 | 0.967 | +0.202 | -0.123 | +0.139 |
| 48 | push | 0.854 | 0.974 | +0.237 | -0.127 | +0.124 |
| 49 | push | 0.861 | 0.960 | +0.193 | -0.138 | +0.146 |
| 50 | push | 0.872 | 0.973 | +0.194 | -0.117 | +0.133 |
| 51 | push | 0.880 | 0.983 | +0.206 | -0.126 | +0.141 |
| 52 | push | 0.887 | 0.989 | +0.220 | -0.118 | +0.010 |
| 53 | push | 0.905 | 1.009 | +0.224 | -0.013 | +0.057 |
| 54 | push | 0.901 | 0.973 | +0.202 | -0.189 | +0.040 |
| 55 | push | 0.902 | 0.971 | +0.195 | -0.152 | +0.033 |
| 56 | push | 0.902 | 3.064 | +0.195 | -0.155 | +2.175 |
| 57 | push | 0.913 | 1.490 | +0.306 | +0.152 | +0.111 |
| 58 | push | 1.078 | 1.142 | +0.260 | -0.124 | +0.140 |
| 59 | push | 0.902 | 1.294 | +0.232 | +0.139 | +0.138 |
| 60 | push | 0.938 | 1.075 | +0.270 | -0.009 | -0.016 |
| 61 | push | 1.012 | 1.040 | +0.260 | -0.098 | -0.084 |
| 62 | push | 0.897 | 1.030 | +0.230 | +0.002 | +0.005 |
| 63 | push | 3.053 | 1.030 | +0.190 | +0.005 | -2.134 |
| 64 | push | 1.329 | 1.032 | +0.179 | -0.307 | -0.146 |
| 65 | push | 0.986 | 1.030 | +0.224 | -0.122 | +0.101 |
| 66 | push | 0.927 | 1.028 | +0.235 | -0.020 | +0.041 |
| 67 | push | 0.917 | 1.041 | +0.240 | -0.004 | +0.049 |
| 68 | push | 0.915 | 1.052 | +0.235 | -0.015 | -0.011 |
| 69 | push | 0.912 | 1.046 | +0.242 | -0.005 | -0.003 |
| 70 | push | 0.904 | 1.042 | +0.238 | -0.003 | -0.005 |
| 71 | push | 0.929 | 1.046 | +0.234 | -0.015 | +0.004 |
| 72 | push | 0.908 | 1.045 | +0.247 | -0.007 | +0.139 |
| 73 | push | 0.910 | 1.050 | +0.243 | -0.001 | -0.063 |
| 74 | push | 0.912 | 1.052 | +0.251 | -0.007 | +0.061 |
| 75 | push | 0.916 | 1.062 | +0.261 | -0.013 | +0.112 |
| 76 | push | 0.941 | 1.079 | +0.264 | -0.028 | -0.032 |
| 77 | push | 0.923 | 1.065 | +0.252 | -0.010 | +0.136 |
| 78 | push | 0.921 | 1.072 | +0.247 | -0.017 | +0.138 |
| 79 | push | 0.926 | 2.602 | +0.261 | -0.014 | +1.536 |
| 80 | push | 0.923 | 1.566 | +0.370 | +0.137 | +0.012 |
| 81 | push | 0.932 | 1.241 | +0.355 | -0.011 | +0.004 |
| 82 | push | 0.932 | 1.132 | +0.307 | -0.018 | +0.006 |
| 83 | push | 0.938 | 1.149 | +0.296 | -0.019 | +0.011 |
| 84 | push | 0.939 | 1.108 | +0.263 | -0.027 | +0.145 |
| 85 | push | 0.951 | 1.127 | +0.281 | -0.031 | +0.006 |
| 86 | push | 0.954 | 1.103 | +0.299 | -0.047 | +0.004 |
| 87 | push | 0.951 | 1.114 | +0.294 | -0.044 | +0.015 |
| 88 | push | 0.952 | 1.112 | +0.284 | -0.044 | +0.141 |
| 89 | push | 0.971 | 1.131 | +0.292 | -0.068 | +0.019 |
| 90 | push | 2.666 | 1.139 | +0.273 | -0.099 | -1.630 |
| 91 | push | 1.440 | 1.118 | +0.230 | -0.435 | +0.004 |
| 92 | push | 1.107 | 1.120 | +0.255 | -0.223 | +0.099 |
| 93 | push | 1.054 | 1.124 | +0.289 | -0.152 | +0.091 |
| 94 | push | 1.030 | 1.113 | +0.276 | -0.136 | +0.144 |
| 95 | push | 1.040 | 1.115 | +0.284 | -0.154 | +0.007 |
| 96 | push | 1.025 | 1.122 | +0.280 | -0.142 | +0.146 |
| 97 | push | 0.997 | 1.127 | +0.300 | -0.108 | +0.007 |
| 98 | push | 0.990 | 1.145 | +0.306 | -0.102 | +0.117 |
| 99 | push | 0.994 | 1.183 | +0.309 | -0.099 | +0.143 |
| 100 | push | 0.991 | 2.668 | +0.325 | -0.107 | +1.492 |
| 101 | remove / 99 | 0.650 | 1.117 | +0.510 | -0.074 | +0.005 |
| 102 | remove / 98 | 0.590 | 0.809 | +0.346 | -0.160 | +0.152 |
| 103 | remove / 97 | 0.547 | 0.805 | +0.376 | -0.125 | +0.001 |
| 104 | remove / 96 | 0.567 | 0.706 | +0.329 | -0.122 | -0.067 |
| 105 | remove / 95 | 0.607 | 0.681 | +0.321 | -0.163 | -0.022 |
| 106 | remove / 94 | 0.563 | 0.678 | +0.321 | -0.135 | +0.003 |
| 107 | remove / 93 | 0.552 | 0.674 | +0.305 | -0.121 | -0.034 |
| 108 | remove / 92 | 0.561 | 0.711 | +0.339 | -0.150 | -0.059 |
| 109 | remove / 91 | 0.549 | 0.655 | +0.300 | -0.141 | +0.026 |
| 110 | remove / 90 | 0.540 | 0.642 | +0.305 | -0.120 | -0.000 |
| 111 | remove / 89 | 0.538 | 0.638 | +0.300 | -0.112 | -0.083 |
| 112 | remove / 88 | 0.545 | 0.633 | +0.292 | -0.173 | +0.119 |
| 113 | remove / 87 | 0.528 | 0.622 | +0.289 | -0.098 | -0.018 |
| 114 | remove / 86 | 0.958 | 0.634 | +0.282 | -0.486 | +0.116 |
| 115 | remove / 85 | 0.523 | 0.628 | +0.289 | -0.107 | -0.090 |
| 116 | remove / 84 | 0.502 | 0.620 | +0.281 | -0.067 | -0.112 |
| 117 | remove / 83 | 0.498 | 0.622 | +0.285 | -0.090 | +0.000 |
| 118 | remove / 82 | 0.494 | 0.602 | +0.275 | -0.050 | -0.109 |
| 119 | remove / 81 | 0.489 | 0.583 | +0.261 | -0.042 | +0.000 |
| 120 | remove / 80 | 0.485 | 0.580 | +0.259 | -0.041 | +0.000 |
| 121 | remove / 79 | 0.480 | 0.571 | +0.247 | -0.036 | +0.000 |
| 122 | remove / 78 | 0.478 | 0.576 | +0.252 | -0.035 | -0.000 |
| 123 | remove / 77 | 0.474 | 0.573 | +0.245 | -0.027 | +0.000 |
| 124 | remove / 76 | 0.470 | 0.579 | +0.251 | -0.039 | +0.001 |
| 125 | remove / 75 | 0.467 | 0.563 | +0.242 | -0.032 | +0.000 |
| 126 | remove / 74 | 0.464 | 0.554 | +0.236 | -0.029 | +0.000 |
| 127 | remove / 73 | 0.457 | 0.550 | +0.232 | -0.027 | +0.000 |
| 128 | remove / 72 | 0.456 | 0.540 | +0.224 | -0.025 | +0.000 |
| 129 | remove / 71 | 0.452 | 0.537 | +0.222 | -0.016 | +0.000 |
| 130 | remove / 70 | 0.449 | 0.532 | +0.217 | -0.010 | +0.000 |
| 131 | remove / 69 | 0.445 | 0.530 | +0.216 | -0.012 | +0.000 |
| 132 | remove / 68 | 0.446 | 0.527 | +0.214 | -0.029 | +0.000 |
| 133 | remove / 67 | 0.442 | 0.523 | +0.208 | -0.038 | +0.000 |
| 134 | remove / 66 | 0.439 | 0.521 | +0.210 | -0.060 | +0.000 |
| 135 | remove / 65 | 0.432 | 0.515 | +0.204 | -0.051 | +0.000 |
| 136 | remove / 64 | 0.430 | 0.540 | +0.214 | -0.045 | +0.000 |
| 137 | remove / 63 | 0.426 | 0.515 | +0.200 | -0.076 | +0.000 |
| 138 | remove / 62 | 0.430 | 0.509 | +0.197 | -0.080 | +0.000 |
| 139 | remove / 61 | 0.423 | 0.508 | +0.195 | -0.034 | +0.138 |
| 140 | remove / 60 | 0.419 | 0.506 | +0.194 | -0.007 | +0.000 |
| 141 | remove / 59 | 0.414 | 0.501 | +0.186 | -0.007 | +0.111 |
| 142 | remove / 58 | 0.414 | 0.503 | +0.189 | +0.000 | +0.000 |
| 143 | remove / 57 | 0.415 | 0.508 | +0.194 | -0.005 | -0.150 |
| 144 | remove / 56 | 0.617 | 0.494 | +0.182 | -0.080 | -0.072 |
| 145 | remove / 55 | 0.454 | 0.498 | +0.182 | -0.092 | -0.014 |
| 146 | remove / 54 | 0.422 | 0.496 | +0.182 | -0.009 | +0.139 |
| 147 | remove / 53 | 0.413 | 0.488 | +0.179 | -0.055 | +0.127 |
| 148 | remove / 52 | 0.409 | 0.482 | +0.172 | -0.061 | -0.000 |
| 149 | remove / 51 | 0.405 | 0.475 | +0.165 | -0.151 | +0.145 |
| 150 | remove / 50 | 0.399 | 0.479 | +0.169 | -0.020 | +0.018 |
| 151 | remove / 49 | 0.390 | 0.534 | +0.207 | +0.018 | +0.148 |
| 152 | remove / 48 | 0.386 | 0.525 | +0.173 | -0.003 | +0.141 |
| 153 | remove / 47 | 0.381 | 0.487 | +0.178 | +0.001 | +0.001 |
| 154 | remove / 46 | 0.378 | 0.467 | +0.164 | -0.109 | +0.000 |
| 155 | remove / 45 | 0.373 | 0.458 | +0.155 | -0.079 | +0.000 |
| 156 | remove / 44 | 0.369 | 0.457 | +0.149 | -0.021 | +0.000 |
| 157 | remove / 43 | 0.362 | 0.457 | +0.146 | -0.077 | +0.142 |
| 158 | remove / 42 | 0.371 | 0.466 | +0.157 | -0.030 | +0.000 |
| 159 | remove / 41 | 0.357 | 0.445 | +0.147 | +0.047 | +0.000 |
| 160 | remove / 40 | 0.353 | 0.438 | +0.138 | -0.055 | +0.000 |
| 161 | remove / 39 | 0.352 | 0.429 | +0.130 | -0.115 | +0.000 |
| 162 | remove / 38 | 0.354 | 0.426 | +0.129 | -0.077 | +0.000 |
| 163 | remove / 37 | 0.348 | 0.420 | +0.118 | +0.052 | +0.000 |
| 164 | remove / 36 | 0.345 | 0.415 | +0.118 | -0.071 | +0.000 |
| 165 | remove / 35 | 0.341 | 0.408 | +0.114 | -0.094 | +0.000 |
| 166 | remove / 34 | 0.338 | 0.412 | +0.112 | -0.083 | +0.000 |
| 167 | remove / 33 | 0.335 | 0.404 | +0.106 | -0.072 | +0.000 |
| 168 | remove / 32 | 0.332 | 0.401 | +0.103 | -0.052 | +0.000 |
| 169 | remove / 31 | 0.328 | 0.399 | +0.102 | -0.037 | +0.000 |
| 170 | remove / 30 | 0.327 | 0.392 | +0.097 | -0.041 | -0.002 |
| 171 | remove / 29 | 0.319 | 0.388 | +0.094 | -0.029 | +0.000 |
| 172 | remove / 28 | 0.316 | 0.383 | +0.091 | -0.057 | +0.000 |
| 173 | remove / 27 | 0.315 | 0.378 | +0.085 | -0.034 | +0.000 |
| 174 | remove / 26 | 0.309 | 0.376 | +0.086 | -0.025 | +0.000 |
| 175 | remove / 25 | 0.304 | 0.371 | +0.078 | -0.012 | +0.000 |
| 176 | remove / 24 | 0.303 | 0.370 | +0.084 | -0.002 | +0.000 |
| 177 | remove / 23 | 0.300 | 0.364 | +0.075 | -0.049 | +0.000 |
| 178 | remove / 22 | 0.296 | 0.361 | +0.076 | -0.106 | +0.000 |
| 179 | remove / 21 | 0.297 | 0.360 | +0.078 | -0.117 | +0.000 |
| 180 | remove / 20 | 0.291 | 0.363 | +0.075 | -0.106 | +0.000 |
| 181 | remove / 19 | 0.287 | 0.354 | +0.072 | -0.114 | +0.000 |
| 182 | remove / 18 | 0.307 | 0.374 | +0.082 | -0.104 | +0.000 |
| 183 | remove / 17 | 0.280 | 0.347 | +0.080 | -0.110 | +0.000 |
| 184 | remove / 16 | 0.278 | 0.343 | +0.062 | -0.103 | +0.048 |
| 185 | remove / 15 | 0.274 | 0.337 | +0.059 | -0.096 | +0.147 |
| 186 | remove / 14 | 0.270 | 0.347 | +0.071 | -0.085 | +0.000 |
| 187 | remove / 13 | 0.267 | 0.329 | +0.062 | -0.021 | +0.061 |
| 188 | remove / 12 | 0.264 | 0.326 | +0.044 | -0.091 | +0.150 |
| 189 | remove / 11 | 0.260 | 0.321 | +0.036 | -0.090 | +0.150 |
| 190 | remove / 10 | 0.258 | 0.321 | +0.044 | -0.081 | +0.149 |
| 191 | remove / 9 | 0.250 | 0.315 | +0.037 | -0.089 | +0.145 |
| 192 | remove / 8 | 0.249 | 0.312 | +0.033 | -0.084 | +0.147 |
| 193 | remove / 7 | 0.246 | 0.307 | +0.027 | -0.058 | +0.149 |
| 194 | remove / 6 | 0.241 | 0.304 | +0.044 | -0.079 | +0.107 |
| 195 | remove / 5 | 0.238 | 0.301 | +0.082 | -0.076 | +0.000 |
| 196 | remove / 4 | 0.236 | 0.299 | +0.133 | -0.071 | +0.000 |
| 197 | remove / 3 | 0.232 | 0.295 | +0.134 | -0.068 | +0.000 |
| 198 | remove / 2 | 0.229 | 0.289 | +0.129 | -0.064 | +0.000 |
| 199 | remove / 1 | 0.224 | 0.284 | +0.126 | -0.060 | +0.000 |
| 200 | remove / 0 | 0.227 | 0.284 | +0.021 | +0.050 | -0.011 |

### array-replace-200

| write | kind / index | old wall ms | HEAD wall ms | core Δ ms | React Δ ms | other Δ ms |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 1 | set | 116.998 | 124.364 | +2.113 | +4.682 | +0.335 |

## 산출물

`p*.json`: 쓰기별 wall·active·commit·monotonic window. `p*.cpuprofile.gz`: 원 V8 CPU 프로필. `p*.attribution.json.gz`: 쓰기별 배타 귀속·self 함수·미귀속 이유. `summary.json`: pooled 통계. `per-write.csv`: 301개 쓰기 × 12범주. `audit.json`: 동일성·순차성·정상 종료 검사. `execution-*.json`: 재현 argv·실행 시각. `r*`: 별도 helper 인라인 보조 자료입니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `3a637c4cd967`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
