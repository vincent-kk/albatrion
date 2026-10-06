# 101 — paired mount의 GC·할당·CPU·JIT 귀속

HEAD `aee63933e43e3f8da442cf3ba7e7574f2aa16679`에서 측정했습니다. clock 안 GC pause는 세 fixture의 새·0.16.0 엔진 모두 **0 ms, 0/303 mount**입니다. 기존 hot 분석 수치와 제거 상한의 차이는 같은 clock regime의 분석 CPU가 훨씬 크다는 점으로 설명됩니다. 강제 GC는 clock 밖에 있지만 최적화된 code의 약한 참조와 field-type feedback을 무효화하여 다음 mount에 영향을 주었습니다.

## 측정 조건과 재현

- worktree: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`; 제품 `src` diff는 비어 있습니다. git write, 설치, 다른 agent, 동시 benchmark, kill은 없었습니다.
- 새 엔진은 HEAD source를 production define으로 bundle한 원본이며 함수 내부 timer/counter를 넣지 않았습니다. 0.16.0은 `src/__legacy__/core/nodeFromJSONSchema.ts`입니다. esbuild 설정·fixture·create·64회 microtask와 setImmediate 배출은 기존 99C-01 도구를 메모리에서 재사용했습니다.
- fresh process에서 fixture별 warmup 20쌍 뒤 101 measured쌍을 실행했고 이를 3회 반복했습니다. 회차 첫 순서는 H-V/V-H/H-V이며 매 sample 교대합니다. schema clone·강제 GC는 각 mount의 clock 밖, empty sentinel 101회씩 전후 중앙값 평균은 clock에서 뺍니다.
- GC/기본 clock, CPU sampling, heap sampling은 별도 순차 process입니다. CPU profiler는 warmup 종료 뒤 시작하고 101개 창만 선택했습니다. 2,000 warmup과 강제 GC 생략은 별도 비교입니다. 강제 GC 생략 결과는 주 regime의 성능 수치에 섞지 않았습니다.
- 환경: Node v26.10.0, V8 14.6.202.34-node.35, esbuild 0.25.9; Apple M1 Max, darwin/arm64; production, validation=off, subscribers=0.
- clock bound는 profiler를 켜지 않은 timer 결과만 사용합니다. heap profiler의 약 3~4배 clock 증가는 이득 판정에서 제외했습니다.

```sh
D=packages/canard/schema-form/architecture/verification/07-switch
node "$D/tools/profile-101-gc.mjs" --build head control old
node "$D/tools/profile-101-gc.mjs" --phase timer old 20 3
node "$D/tools/profile-101-gc.mjs" --phase timer control 20 3
node "$D/tools/profile-101-gc.mjs" --phase cpu old 20 3
node "$D/tools/profile-101-gc.mjs" --phase heap old 20 3
node "$D/tools/profile-101-gc.mjs" --trace-phase 20 3
node "$D/tools/profile-101-gc.mjs" --phase cpu old 2000 3
node "$D/tools/profile-101-gc.mjs" --phase cpu-no-forced-gc old 20 3
node "$D/tools/profile-101-gc.mjs" --trace-phase 20 3 trace-no-forced-gc
node "$D/tools/profile-101-gc.mjs" --phase memory old 20 3
node "$D/tools/profile-101-gc.mjs" --phase timer-final control 20 3
node "$D/tools/check-profile-101-content.mjs"
```

변형은 `profile-101-gc/ablations.json`의 ID를 `--build`와 `--bounds`에 순서대로 전달합니다. 각 ID를 AST/문자열의 유일한 anchor로 메모리 안에서만 적용했습니다. 원시 자료·환경·empty 값·101개 timings·paired deltas·창 경계·출력 hash는 회차별 artifact에 남아 있습니다.

## (a) 실제 clock 안 GC와 발생률 — structural

| fixture | 새/구 mount 중앙값 ms | 새 Scavenge / Mark-Compact ms/mount | 구 Scavenge / Mark-Compact ms/mount | 새/구 GC 포함 mount |
|---|---:|---:|---:|---:|
| nested-d5-f4 | 11.545 / 2.857 | 0.000 / 0.000 | 0.000 / 0.000 | 0/303 / 0/303 |
| flat-500 | 4.058 / 1.619 | 0.000 / 0.000 | 0.000 / 0.000 | 0/303 / 0/303 |
| oneOf-20 | 2.328 / 0.363 | 0.000 / 0.000 | 0.000 / 0.000 | 0/303 / 0/303 |

PerformanceObserver `gc` entry의 startTime/duration을 실제 clock window와 겹친 길이로 합산했고 kind 1/4를 minor/major로 나눴습니다. incremental도 주 regime에서 0입니다. 별도 `--trace-gc` 3회씩에서도 모든 measured 창의 collection이 0이었습니다. observer가 수집을 놓친 결과는 아닙니다. 강제 GC를 생략한 비교에서는 창 안 collection을 실제로 검출했습니다.

CPU profiler의 `(garbage collector)` 표본은 아래에 포함하지만 이를 위 GC pause로 대체하지 않습니다. 같은 process에서도 이 표본 bucket은 양수인 반면 observer·native GC trace의 실제 창 안 수집은 0입니다. bucket의 정확한 native 원인까지 단정하지 않고 별도 귀속으로 보존했습니다.

## (b) 총 할당과 청사진/나머지 — structural 비용과 code-level 임시값

단위는 byte/mount입니다. 2,048-byte sampling에서 major/minor GC로 수거된 객체도 포함했으며 clone·강제 GC·observer/inspector 준비 등의 창 밖 호출은 제외했습니다. `blueprint` 호출 조상 아래를 분석으로, 나머지 mount/배출을 rest로 분할했습니다. 아래 그외에는 위치미상 byte의 보수적 상한을 포함합니다.

| fixture | 새 총량 | 새 청사진 | 새 그외 | 구 총량=그외 | 위치미상 새/구 | profiler 없는 heap 증가 새/구 |
|---|---:|---:|---:|---:|---:|---:|
| nested-d5-f4 | 19,510,536 | 15,766,289 | 3,744,247 | 6,139,607 | 20 / 34 | 19,512,747 / 6,136,453 |
| flat-500 | 7,235,072 | 5,529,319 | 1,705,753 | 2,892,025 | 61 / 14 | 7,301,154 / 3,022,167 |
| oneOf-20 | 2,565,848 | 1,113,458 | 1,452,390 | 405,726 | 55 / 48 | 2,575,289 / 415,912 |

할당 표본은 통계적 추정치이며 회차간 spread는 JSON에 있습니다. 수집이 없는 같은 clock 창에서 `used_heap_size`를 전후 읽은 별도 101×3 비교도 남겼습니다. snapshot 호출·clock 직후 wrapper의 작은 추가 할당이 포함되므로 절대 기준으로 동일시하지 않으며, 관측 차이는 약 0.0~4.3%였습니다. nested의 총량은 거의 일치했습니다. 일부 stopSampling 결과의 마지막 ordinal이 호출 트리 없는 nodeId를 참조하여 초기 pilot이 실패했으나, 본 자료에서는 그 byte를 버리지 않고 위치미상으로 보존했습니다.

자기 할당을 **가장 가까운 제품 source 함수**에 귀속했습니다. native `push`/`add`/`next` 등은 source 호출자로 연결했고 callee의 할당을 호출자의 자기 할당에 이중 합산하지 않았습니다. 위치는 source map의 함수 진입 위치이며 정확한 object literal 한 줄을 주장하지 않습니다.

### nested-d5-f4의 상위 할당 함수

| 엔진 | 함수 | byte/mount | 분석/그외 | source |
|---|---|---:|---|---|
| 새 | `buildNodes` | 3,072,079 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/buildNodes.ts:25` |
| 새 | `collectDeclarations` | 2,524,577 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts:27` |
| 새 | `loadStaticFirstTree` | 2,114,095 | rest | `packages/canard/schema-form/src/core/settle/utils/load/loadStaticFirstTree.ts:42` |
| 새 | `mergeEffectiveSchema` | 1,917,896 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` |
| 새 | `(anonymous)` | 1,537,591 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/populateNodeChildren.ts:73` |
| 0.16.0 | `publish` | 1,100,761 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891` |
| 0.16.0 | `mergeEventEntries` | 773,086 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` |
| 0.16.0 | `getReferenceTable` | 660,937 | rest | `packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts:12` |
| 0.16.0 | `EventCascadeManager` | 617,425 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` |
| 0.16.0 | `AbstractNode` | 527,388 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` |

### flat-500의 상위 할당 함수

| 엔진 | 함수 | byte/mount | 분석/그외 | source |
|---|---|---:|---|---|
| 새 | `buildNodes` | 1,035,070 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/buildNodes.ts:25` |
| 새 | `collectDeclarations` | 893,099 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts:27` |
| 새 | `loadStaticFirstTree` | 653,187 | rest | `packages/canard/schema-form/src/core/settle/utils/load/loadStaticFirstTree.ts:42` |
| 새 | `(anonymous)` | 506,110 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/populateNodeChildren.ts:73` |
| 새 | `readAllowedTypes` | 502,976 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/types/readAllowedTypes.ts:19` |
| 0.16.0 | `publish` | 370,397 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891` |
| 0.16.0 | `__processValue__` | 302,217 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245` |
| 0.16.0 | `__parseValue__` | 298,394 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220` |
| 0.16.0 | `(anonymous)` | 297,764 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807` |
| 0.16.0 | `mergeEventEntries` | 282,436 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` |

### oneOf-20의 상위 할당 함수

| 엔진 | 함수 | byte/mount | 분석/그외 | source |
|---|---|---:|---|---|
| 새 | `resolveDependencyPath` | 227,905 | rest | `packages/canard/schema-form/src/core/settle/utils/paths/resolveDependencyPath.ts:7` |
| 새 | `collectDeclarations` | 177,261 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/collectDeclarations.ts:27` |
| 새 | `buildNodes` | 148,947 | blueprint | `packages/canard/schema-form/src/core/blueprint/utils/analyze/buildNodes.ts:25` |
| 새 | `selectChildren` | 136,811 | rest | `packages/canard/schema-form/src/core/settle/utils/compute/selectChildren.ts:82` |
| 새 | `readProjectedValue` | 129,644 | rest | `packages/canard/schema-form/src/core/settle/utils/gates/readProjectedValue.ts:25` |
| 0.16.0 | `needsRealComputedManager` | 57,956 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` |
| 0.16.0 | `getReferenceTable` | 39,754 | rest | `packages/canard/schema-form/src/__legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts:12` |
| 0.16.0 | `publish` | 36,531 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891` |
| 0.16.0 | `mergeEventEntries` | 36,010 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` |
| 0.16.0 | `EventCascadeManager` | 29,972 | rest | `packages/canard/schema-form/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` |

nested/flat의 공통 상위 3개는 `buildNodes`, `collectDeclarations`, `loadStaticFirstTree`입니다. 새 nested의 분석 외 할당은 구 엔진보다 작지만, 차가운 분석이 약 15.77 MB를 추가하여 총량이 커졌습니다. oneOf는 runtime 경로 해석·gate 투영도 큰 비중을 차지하며 `resolveDependencyPath`가 가장 큽니다.

## (c) 같은 101개 창의 CPU와 JIT — structural

각 칸은 3회×101개 창의 산술 평균 ms/mount입니다. 합계 분모는 GC·program·idle·driver를 모두 포함합니다. profiler의 native sampling 간격을 창 경계에서 잘랐으며 표본 수와 전체 함수 self/inclusive 값은 회차별 JSON에 있습니다.

| fixture/엔진 | 청사진 | 그외 engine | GC bucket | program | idle+driver | 전체 표본 시간 |
|---|---:|---:|---:|---:|---:|---:|
| nested-d5-f4/새 | 8.184 | 3.281 | 0.299 | 0.224 | 0.051 | 12.039 |
| nested-d5-f4/구 | 0.000 | 2.752 | 0.031 | 0.050 | 0.180 | 3.012 |
| flat-500/새 | 3.099 | 1.215 | 0.035 | 0.092 | 0.038 | 4.477 |
| flat-500/구 | 0.000 | 1.602 | 0.001 | 0.028 | 0.099 | 1.730 |
| oneOf-20/새 | 0.945 | 1.602 | 0.009 | 0.067 | 0.046 | 2.669 |
| oneOf-20/구 | 0.000 | 0.298 | 0.001 | 0.009 | 0.044 | 0.351 |

대표 분석 값은 회차별 분석 평균 3개의 중앙값으로 비교했습니다. 기존 hot 루프는 다른 commit의 standalone 분석이며 GC/program 및 분석 밖 호출이 분모에서 빠졌습니다. 이 역사 수치를 현재 budget의 항처럼 정확히 더하지 않습니다.

| fixture | 기존 hot 분석 ms | 동일 paired regime 분석 ms | 차이 | warmup 2000 분석 ms | 강제 GC 생략 분석 ms |
|---|---:|---:|---:|---:|---:|
| nested-d5-f4 | 4.695 | 8.183 | +3.487 | 9.045 | 5.225 |
| flat-500 | 1.450 | 3.009 | +1.559 | 2.971 | 1.670 |
| oneOf-20 | 0.258 | 0.930 | +0.672 | 0.920 | 0.318 |

nested-d5-f4의 역사적 구멍 8.261−4.695=3.565 ms에 대해 현재 동일-regime 분석은 8.183 ms, hot 대비 +3.487 ms입니다. clock 안 GC에 그 시간을 옮겨 잡을 근거는 없습니다. 현재 HEAD의 전체 분석 제거 상한 9.205 ms는 역사적 제거 값과 구분합니다.
flat-500의 역사적 구멍 3.039−1.450=1.589 ms에 대해 현재 동일-regime 분석은 3.009 ms, hot 대비 +1.559 ms입니다. clock 안 GC에 그 시간을 옮겨 잡을 근거는 없습니다. 현재 HEAD의 전체 분석 제거 상한 3.106 ms는 역사적 제거 값과 구분합니다.

전체 분석 재사용과 HEAD를 **같은 CPU paired process**에서 비교하면 제거 효과가 분석 함수의 시간만은 아니라는 것도 드러납니다. 아래는 303개 창의 정확한 표본 차이 분해입니다.

| fixture | 청사진 Δ | 그외 engine Δ | GC bucket Δ | program Δ | idle+driver Δ | 표본 합계 Δ | 비계측 clock 제거 상한 |
|---|---:|---:|---:|---:|---:|---:|---:|
| nested-d5-f4 | 8.298 | 0.833 | 0.255 | 0.169 | -0.000 | 9.554 | 9.205 |
| flat-500 | 2.978 | 0.258 | 0.031 | 0.054 | 0.005 | 3.325 | 3.106 |
| oneOf-20 | 0.954 | 0.311 | 0.002 | 0.026 | -0.008 | 1.285 | 1.001 |

nested에는 분석 외 표본 차이가 약 1.256 ms, flat에는 약 0.347 ms 있습니다. 재사용된 분석 결과는 이후 mount의 할당·형상 feedback·native 상태에도 영향을 줍니다. 이 차이를 청사진 함수 자기 시간으로 강제로 배분하지 않습니다. CPU profiler를 켠 주 실행의 HEAD clock 중앙값은 비계측보다 fixture별 약 6~13% 컸고, 표본 평균과 clock 중앙값도 다른 통계입니다.

`--trace-opt/--trace-deopt`는 측정 구간에서도 반복 compilation과 무효화를 보였습니다. 아래 두 reason의 전체 함수 event 수는 native trace의 직접 관측값이고, function별 blueprint event 집계는 JSON에 분리했습니다.

| fixture | forced GC의 최적화 trace line 범위 | GC 생략의 trace line 범위 | 무효화 함수의 분석 자기 시간 비중 |
|---|---:|---:|---:|
| nested-d5-f4 | 1738~1766 | 280~288 | 53.4% |
| flat-500 | 1081~1101 | 337~348 | 56.9% |
| oneOf-20 | 1285~1309 | 607~616 | 3.7% |

nested 첫 forced-GC 회차에는 전체 함수 기준 `embedded weak objects cleared` 88회, `dependent field type changed` 120회가 있었습니다. blueprint의 `resolveNodeTypes`, `collectDeclarations`, `buildNodes` 등이 다시 MAGLEV/TURBOFAN compilation을 요청했습니다. 이들은 이미 충분히 호출되었더라도 다음 GC/field 변화에 code가 무효화될 수 있습니다. 위 자기 시간 비중은 무효화가 관측된 함수들의 귀속 규모이며, sample별 tier 정보가 없으므로 실제 unoptimized 실행 비율이라고 부르지 않습니다.

warmup을 20→2000으로 바꾸어도 분석 비용이 내려가지 않았습니다. forced GC만 생략한 별도 비교는 nested 분석 8.183→5.225 ms, flat 3.009→1.670 ms였으며 최적화 trace도 크게 줄었습니다. 대신 새 nested/flat 창 안 실제 GC는 각각 약 1.688/0.551 ms/mount가 들어왔습니다. 단순 warmup 부족과 clock 안 GC 제외만으로 문제를 설명할 수 없으며 GC를 clock 밖으로 옮기는 정책이 다음 mount의 JIT 상태까지 바꿉니다. 대표적인 frozen-array 6개를 강하게 보유한 단일 추가 탐색은 nested 분석 비용을 낮추지 못하여, frozen-array map 보유 하나가 완성된 해결책이라는 가설도 지지하지 않았습니다.

## (d) 상위 할당 함수의 제거 상한과 제한적 회피

| fixture | N ms (전후 H↔H 6회) |
|---|---:|
| nested-d5-f4 | 0.315542 |
| flat-500 | 0.068750 |
| oneOf-20 | 0.019334 |

상한은 각 회차 HEAD 중앙값−variant 중앙값이며 대표값은 세 상한의 중앙값입니다. **세 회차 모두 N 초과이고 paired rank 구간 하한이 양수일 때만 재현된 이득**으로 표시합니다. 단일 큰 회차나 profiler clock을 이득으로 쓰지 않았습니다. 함수/하위 작업 재사용은 allocation뿐 아니라 CPU work·JIT·lifetime도 바꾸므로 순수 byte당 비용으로 해석하거나 상한들을 합산하지 않습니다.

| 변형 / 분류 | fixture | 상한 ms | 세 회차 범위 ms | N 초과 재현 | 출력 변경 |
|---|---|---:|---:|---|---|
| `blueprint-cache` / structural | nested-d5-f4 | 9.205 | 8.773~9.509 | 예 | fixture 관측값 일치 |
| `blueprint-cache` / structural | flat-500 | 3.106 | 3.088~3.458 | 예 | fixture 관측값 일치 |
| `blueprint-cache` / structural | oneOf-20 | 1.001 | 0.972~1.215 | 예 | fixture 관측값 일치 |
| `nodes-replay` / structural | nested-d5-f4 | 7.699 | 7.132~7.750 | 예 | fixture 관측값 일치 |
| `nodes-replay` / structural | flat-500 | 2.778 | 2.746~2.821 | 예 | fixture 관측값 일치 |
| `nodes-replay` / structural | oneOf-20 | 0.799 | 0.768~1.028 | 예 | fixture 관측값 일치 |
| `declarations-replay` / structural | nested-d5-f4 | 1.392 | 0.964~1.727 | 예 | fixture 관측값 일치 |
| `declarations-replay` / structural | flat-500 | 0.549 | 0.513~0.610 | 예 | fixture 관측값 일치 |
| `declarations-replay` / structural | oneOf-20 | 0.503 | 0.406~0.551 | 예 | fixture 관측값 일치 |
| `load-zero` / structural | nested-d5-f4 | 2.797 | 2.593~2.884 | 예 | 예 |
| `load-zero` / structural | flat-500 | 1.066 | 1.027~1.113 | 예 | 예 |
| `load-zero` / structural | oneOf-20 | 0.011 | -0.025~0.025 | 아니요 | fixture 관측값 일치 |
| `dependency-path-replay` / structural | nested-d5-f4 | 0.714 | -0.350~0.860 | 아니요 | fixture 관측값 일치 |
| `dependency-path-replay` / structural | flat-500 | -0.016 | -0.022~0.024 | 아니요 | fixture 관측값 일치 |
| `dependency-path-replay` / structural | oneOf-20 | 0.089 | 0.072~0.119 | 예 | fixture 관측값 일치 |
| `nodes-empty-hosts` / code-level | nested-d5-f4 | 0.789 | 0.474~1.096 | 아니요 | fixture 관측값 일치 |
| `nodes-empty-hosts` / code-level | flat-500 | 0.125 | 0.108~0.179 | 예 | fixture 관측값 일치 |
| `nodes-empty-hosts` / code-level | oneOf-20 | -0.027 | -0.029~0.009 | 아니요 | fixture 관측값 일치 |
| `declarations-empty-arrays` / code-level | nested-d5-f4 | 0.216 | 0.000~0.759 | 아니요 | fixture 관측값 일치 |
| `declarations-empty-arrays` / code-level | flat-500 | 0.015 | -0.028~0.030 | 아니요 | fixture 관측값 일치 |
| `declarations-empty-arrays` / code-level | oneOf-20 | -0.000 | -0.031~0.020 | 아니요 | fixture 관측값 일치 |
| `load-frame-pool` / code-level | nested-d5-f4 | 0.214 | -0.282~0.483 | 아니요 | fixture 관측값 일치 |
| `load-frame-pool` / code-level | flat-500 | -0.000 | -0.018~0.021 | 아니요 | fixture 관측값 일치 |
| `load-frame-pool` / code-level | oneOf-20 | 0.003 | -0.026~0.004 | 아니요 | fixture 관측값 일치 |
| `nodes-empty-hosts-guarded` / code-level | nested-d5-f4 | 0.603 | 0.257~0.974 | 아니요 | fixture 관측값 일치 |
| `nodes-empty-hosts-guarded` / code-level | flat-500 | 0.136 | 0.086~0.158 | 예 | fixture 관측값 일치 |
| `nodes-empty-hosts-guarded` / code-level | oneOf-20 | 0.014 | -0.039~0.023 | 아니요 | fixture 관측값 일치 |

`nodes-replay`는 root buildNodes가 생성한 node·fragment·분석 context를 재사용해 해당 할당과 하위 분석을 없앴습니다. `declarations-replay`는 declaration/fragment와 context 변경을 재생해 해당 함수의 할당·검사를 없앴습니다. `load-zero`는 hydration을 생략해 실제 children/frame 생성과 관련 작업을 없앴고 nested/flat 출력이 바뀌었습니다. oneOf는 이 narrow static loader를 사용하지 않아 그 제거 이득이 재현되지 않았습니다. 모든 변형은 측정 전용이며 생산 소스에 적용하지 않았습니다.

동일 101개 nested 창의 추가 heap audit 1회는 회피가 실제 byte 감소로 이어졌음을 보였습니다. 이 audit은 byte 검증이며 세 회차 wall bound의 대체가 아닙니다.

| 변형 | HEAD byte/mount | 변형 byte/mount | 감소 byte/mount |
|---|---:|---:|---:|
| `nodes-replay` | 19,533,763 | 3,757,348 | 15,776,414 |
| `declarations-replay` | 19,510,640 | 16,509,630 | 3,001,011 |
| `load-zero` | 19,547,360 | 15,832,815 | 3,714,545 |
| `nodes-empty-hosts` | 19,537,683 | 19,045,607 | 492,076 |
| `declarations-empty-arrays` | 19,542,686 | 19,298,742 | 243,945 |
| `load-frame-pool` | 19,536,603 | 19,417,725 | 118,878 |

## code-level 수정 사양과 structural 판단

- **structural — clock 안 GC가 missing time을 설명하지 않음; clock 밖 강제 GC 뒤 최적화 무효화·재컴파일이 반복됨**: benchmark/JIT regime의 영향입니다. warmup 횟수만 늘리거나 GC pause를 CPU 표본에서 제거해서 제품 수정의 이득으로 해석하지 않습니다.
- **structural — 차가운 청사진의 완전한 node/declaration/fragment 내용과 eager hydration이 큰 할당을 소유함**: 완성 그래프를 폼 사이에서 재사용하거나 hydration을 생략한 수치는 천장입니다. 새 root 참조·predicate identity·cache 수명·정적 오류/경고의 재노출 계약을 바꾸는 결정이 필요합니다.
- **code-level — buildNodes의 빈 host 경로 임시 배열·JSON 쌍 직렬화**: 한 ungated contribution의 내부 bound key를 별도 tag+기존 template key로 구성하고 그외 경로는 기존 host binding을 유지합니다. node/declaration/fragment/dependency/expression 내용, 동결·원본 참조, predicate별 결과와 모든 정적 오류·경고를 유지해야 합니다. guarded 변형은 flat만 3회 N 초과입니다.
- **code-level — collectDeclarations의 증명된 빈 gate/order/unused overlay 목록**: 변경되지 않는 빈 목록만 module-owned frozen 값으로 공유하고 필요한 mutable children·declares·활성 gate·상속 overlay는 독립 소유합니다. 원래 검사·진단·내용을 유지합니다. mount 개선은 재현되지 않았습니다.
- **code-level — loadStaticFirstTree의 반복 DFS frame**: 한 mount의 stack 깊이별 frame만 재사용하며 모든 필드를 초기화합니다. 실제 node/child/value 생성, required·automatic 처리, commit·delivery·warning 순서는 그대로 유지합니다. mount 개선은 재현되지 않았습니다.
- **code-level — oneOf의 resolveDependencyPath 호출당 문자열·분할 작업**: root/host path와 authored dependency identity가 완전히 같은 정적 해석만 runtime 안에서 재사용하는 후보입니다. 경로 오류 및 경고는 원래 위치에서 재노출하고 array index·root·expression 변경에 무효화해야 합니다. 호출순서 replay는 이 사양의 구현이 아닌 측정 상한입니다.

빈 host 배열 회피의 전체-scan 변형은 flat에서 재현 기준을 통과했습니다. nested는 세 회차 중앙값 차이가 N을 넘었지만 paired rank 구간 조건을 통과하지 못했고 oneOf 값은 혼재했습니다. 한 ungated contribution에만 fast path를 둔 guarded 변형으로 다시 측정했을 때 flat은 +0.136 ms로 3회 N 초과, nested는 +0.603 ms 중앙값이지만 한 회차 +0.257 ms가 N 아래라 재현 판정을 통과하지 못했습니다. gated 일반 경로의 작은 변화도 cold JIT 결과를 바꾸므로 보편적인 nested 개선을 주장하지 않습니다. 선언 빈 목록 공유와 frame 재사용은 실제 할당을 줄였지만 mount 이득의 재현 기준을 통과하지 못했습니다.

제한적 code-level 변형 4개는 canonical 59개 스키마×predicate 설정 4개의 **944회** graph/diagnostic 비교에서 HEAD와 일치했습니다. 기본 결과 140개 성공·96개 거절과 진단 124개가 그대로였고 원본 schema 참조·predicate identity·graph 동결도 확인했습니다. 세 fixture의 전체 mount tree와 onChange 전달도 일치했습니다. 이 검증 범위를 완전한 제품 regression 승인으로 확대하지 않습니다.

## 자료와 최종 검증

- 실행 자료: [profile-101-gc/](profile-101-gc/); 통합 수치: [profile-101-gc-summary.json](profile-101-gc-summary.json).
- 도구: [profile-101-gc.mjs](tools/profile-101-gc.mjs), [content check](tools/check-profile-101-content.mjs), [순수 report derivation](tools/summarize-profile-101-gc.mjs).
- 원시 CPU/heap profile: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/prof`. 이 작업의 prefix `101-` 파일 3067개, 최대 472,078 bytes입니다.
- 성공한 fresh measurement worker 187개, 보존된 measured 창 37774개, EOF 자연 종료 build service 12개입니다. 모든 회차 timing 길이와 CPU 분모 phase 합계를 검사했습니다.
- per-run 파일 최대 1,791,021 bytes이며 raw/per-run 모든 파일은 decimal 5 MB 이하입니다. 생성 보고서도 같은 한도를 확인합니다.
- 초기 heap pilot의 자연 exit 1은 본 결과에서 제외했고 마지막 sample nodeId 누락을 처리한 뒤 해당 전체 회차를 새 process로 다시 실행했습니다. 제품 source diff와 HEAD는 최종 검사에서 그대로였습니다.


