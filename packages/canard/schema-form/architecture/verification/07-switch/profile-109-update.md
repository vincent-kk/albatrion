# 109 갱신 경로 귀속·제거 실험 상한

HEAD: `3b38c7092272dc281c8997b76ea7d2e4dae91e57`. 측정만 수행했습니다. 제품 src·Git·설치·원장은 변경하지 않았습니다.

## 판정 요약

flat-100 첫 갱신의 신규 (가) 실패는 **보정 종단의 microtask 이후 sentinel tail과 주변 중앙값의 비가산 합성**에 귀속됩니다. 107→108에서 tail 중앙값은 17.583 µs로 같고, 빈 대기 보정은 14.291→14.292 µs입니다. 비가산 항만 0.375→6.626 µs로 커져 차이가 3.667→9.917 µs로 증가했습니다. 쓰기·정착·배달 실행 몫이 어느 한 끝점에서 빠진 현상은 아닙니다.
새 세 회차의 (가)는 **통과**, 차이/잡음 **8.583/10.707 µs**, 새/0.16.0 **1.795699×**, 공식 수치 판정은 **미달**입니다. 새로운 소유자 수용 처분은 만들지 않았습니다.
array-100 BF/첫 갱신의 공유 원인: **예**. 같은 종단 보정/중앙값 합성 문제입니다. 다만 107은 비가산 항 7.959 µs, 108은 tail 잔차 25.792 µs가 주항입니다. interactionCount=1이라 BF와 첫 갱신은 같은 101개 표본을 사용합니다. 이번에도 (가) 미통과(17.833/12.000 µs)여서 공식 판정은 보류합니다.

## 설계와 시계

production, fresh process, warmup 20, 101쌍, 표본별 순서 교대, schema clone/강제 GC/anchor가 clock 밖, 64 checkpoints와 FIFO sentinel, 공통 empty 보정; 작은 이득은 9회차 pooled 짝 차이 99% bootstrap과 같은 세션 A/A 대조. AA 중앙값의 절댓값을 사용한 보수적인 이득 기준.

Part 1은 기존 95C-01 development 도구의 HEAD·warmup 20·data-module 경로만 메모리에서 바꿨습니다. 세 회차 순서는 old→new / new→old / old→new이며 각 101표본입니다. 구 엔진의 (나) 합은 원 규칙에 따라 선택했고 새 엔진에는 적용하지 않았습니다. 양 끝점을 같은 호출에서 기록하며 표본 제거·음수 clipping·재측정 행 선택을 하지 않았습니다. Part 2는 production 판정 열입니다. 두 열의 절대 시간을 직접 합치거나 뺄 수 없습니다.

원문: 106C-01은 origin/1.0.0-beta의 round-106-closing.md(416613c70)에서 읽었고, 105C-01·최소 크기 부록·95C-01·104 소유자 답도 같은 로컬 ref에서 읽었습니다. 설치나 외부 fetch는 수행하지 않았습니다.

## Part 1 — 불일치의 위치와 원인

원 도구의 measure는 operation → 64 Promise checkpoints → micro clock → FIFO setImmediate sentinel clock 순서입니다. 실제 동기 쓰기와 정착·배달은 두 끝점이 공유합니다. 새 엔진의 모든 scheduler 진단에서 scheduled=0, pending=0, 추가 128 checkpoints/다음 sentinel의 예약·실행=0입니다. 이 worker에는 React render/commit이 없습니다.
검증 차이는 med(end)-med(micro)-(C-M)입니다. 이것을 [med(end-micro)-(C-M)] + [med(end)-med(micro)-med(end-micro)]로 정확히 분해했습니다. 첫 항은 tail 대기의 잔차, 둘째는 주변 중앙값의 비가산 항입니다. 다음 표는 모든 원시 표본을 그대로 사용합니다.

| 회차 / fixture | micro 중앙값 µs | end 중앙값 µs | tail 중앙값 µs | C−M µs | tail 잔차 µs | 비가산 항 µs | (가) 차이 µs |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 107 / flat-100 | 62.583 | 80.541 | 17.583 | 14.291 | 3.292 | 0.375 | 3.667 |
| 107 / array-100 | 83.333 | 108.958 | 17.666 | 14.291 | 3.375 | 7.959 | 11.334 |
| 108 / flat-100 | 56.416 | 80.625 | 17.583 | 14.292 | 3.291 | 6.626 | 9.917 |
| 108 / array-100 | 82.000 | 118.291 | 40.084 | 14.292 | 25.792 | -3.793 | 21.999 |
| 109 / flat-100 | 57.042 | 80.000 | 16.833 | 14.375 | 2.458 | 6.125 | 8.583 |
| 109 / array-100 | 83.000 | 115.208 | 31.625 | 14.375 | 17.250 | 0.583 | 17.833 |

107→108 flat-100의 raw micro 중앙값은 62.583→56.416 µs로 줄었으나 raw end는 80.541→80.625 µs입니다. tail 중앙값은 같아도 두 주변 중앙값이 선택하는 표본 순위가 달라져 이 차이를 만들었습니다. FIFO sentinel은 완료 순서를 보장하며 동일한 대기 길이는 보장하지 않습니다. 빈 호출 하나의 C/M 상수를 모든 상태에 적용한 잔차와 이 비가산성이 (가)에 남습니다. 그 공식 정의를 고쳐 이번 행을 통과시키지는 않았습니다.

동일 HEAD의 별도 진단에서 첫 갱신 tail self는 flat-100 idle 69.52%, array-100 idle 72.46%였고 program/Node check 큐·드라이버가 뒤를 이었습니다. array의 post-mount/capture 위치에 실제 쓰기 대신 먼저 잰 빈 shadow의 tail 중앙값은 29.542 µs, 일반 빈 호출은 17.792 µs였습니다. 엔진 쓰기가 없는 호출에서도 같은 위치의 대기가 달라집니다. shadow 뒤 첫 쓰기의 tail은 18.459 µs였습니다. 이는 제품의 새로운 비동기 실행이 아니라 호출 위치에 따른 대기 보정 불일치를 뒷받침합니다. 이 계측/프로파일 진단은 공식 표본에 섞지 않았습니다. OS의 개별 wake-up 원인을 특정했다는 주장은 하지 않습니다.

### 공식 재측정 — 모든 행과 회차

공통 보정: C=17.375 µs, M=3.000 µs, wait=14.375 µs, empty=2424호출. empty residual p95=4.917 µs.

| fixture / 작업 | 새/구 median ms | 배율 | 회차 1 / 2 / 3 배율 | (가) 차이/잡음 µs | pooled / 모든 회차 | 구 열 | 공식 판정 |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| flat-100 / update | 0.223751 / 0.203209 | 1.101088 | 1.036496 / 1.243643 / 1.041396 | 25.834 / 70.117 | 통과 / 통과 | 종단 | 충족 |
| flat-100 / update-first | 0.062625 / 0.034875 | 1.795699 | 1.749091 / 1.899854 / 1.673794 | 8.583 / 10.707 | 통과 / 통과 | 종단 | 미달 |
| flat-100 / update-later | 0.013667 / 0.015334 | 0.891287 | 0.788357 / 0.959303 / 0.871795 | -0.250 / 6.333 | 통과 / 통과 | 종단 | 충족 |
| array-100 / update | 0.097833 / 0.031292 | 3.126454 | 3.240528 / 3.230211 / 3.019862 | 17.833 / 12.000 | 미통과 / 미통과 | 종단 | 보류((가) 미통과) |
| array-100 / update-first | 0.097833 / 0.031292 | 3.126454 | 3.240528 / 3.230211 / 3.019862 | 17.833 / 12.000 | 미통과 / 미통과 | 종단 | 보류((가) 미통과) |
| array-100 / update-later | 0.061167 / 0.013750 | 4.448509 | 4.590587 / 3.028201 / 4.489321 | 5.625 / 37.500 | 통과 / 통과 | 종단 | 미달 |

| flat-100 첫 갱신 회차 | (가) 차이 µs | 잡음 µs | 판정 |
| --- | ---: | ---: | --- |
| 1 | 7.000 | 16.541 | 통과 |
| 2 | 7.375 | 13.123 | 통과 |
| 3 | 6.459 | 12.207 | 통과 |

## Part 2 — 계측 없는 steady CPU top 20

각 fresh process에서 20회 예열 뒤 mount/BF 준비를 profiler 시작 전에 끝내고, 첫/이후 쓰기 101개를 연속 수행했습니다. 첫은 fresh root의 첫 쓰기, 이후는 fixture BF를 완료한 retained root의 다음 쓰기입니다. 101개의 준비된 root를 순차 소비하며 수집 중 schema clone/mount/강제 GC를 하지 않습니다. 요청 interval은 10 µs입니다. 세 fresh process의 시간 가중치를 pooled했고 재귀 total은 같은 함수당 한 번만 셉니다.
실행 구간의 모든 샘플 가중치를 분모로 유지합니다. GC/program/idle/드라이버를 빼거나 함수들만으로 정규화하지 않았습니다. 같은 수집의 64 checkpoints+sentinel 전체 구간 결과는 raw JSON의 endpointCpu에 있습니다. 앞선 full-endpoint 탐색 CPU 자료도 삭제하지 않았습니다. 짧은 구간의 샘플링 경계 오차와 inline 비용 때문에 caller self가 해당 함수의 독립 제거 가능 비율인 것은 아닙니다.

### flat-100 / 첫 갱신

3×101 updates, 유효 sample intervals=730, 분모=9189 µs, 시계 window=9189 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `(idle)` · `(V8):0` | 17.89 | 17.89 | 5.426 | 5.426 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 6.76 | 23.79 | 2.050 | 7.215 |
| `(program)` · `(V8):0` | 6.20 | 6.20 | 1.881 | 1.881 |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 6.04 | 13.69 | 1.832 | 4.152 |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 5.60 | 11.13 | 1.700 | 3.376 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 5.52 | 74.82 | 1.673 | 22.690 |
| `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts:35` | 5.04 | 59.77 | 1.528 | 18.125 |
| `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts:23` | 3.73 | 28.12 | 1.132 | 8.528 |
| `computeNode` · `src/core/settle/utils/compute/computeNode.ts:21` | 3.68 | 17.33 | 1.116 | 5.254 |
| `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts:18` | 2.34 | 64.96 | 0.710 | 19.700 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 1.98 | 1.98 | 0.601 | 0.601 |
| `commitGlobalState` · `src/core/settle/utils/commit/commitGlobalState.ts:11` | 1.80 | 1.80 | 0.545 | 0.545 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 1.58 | 1.72 | 0.479 | 0.521 |
| `registerRecalculation` · `src/core/settle/utils/write/registerRecalculation.ts:12` | 1.49 | 3.03 | 0.452 | 0.917 |
| `mark` · `src/core/settle/utils/commit/markCommitDeliveries.ts:92` | 1.31 | 3.29 | 0.396 | 0.997 |
| `markWrite` · `src/core/settle/utils/write/markWrite.ts:23` | 1.31 | 1.87 | 0.396 | 0.568 |
| `captureSchemaNodeChange` · `src/core/record/utils/captureSchemaNodeChange.ts:25` | 1.24 | 1.24 | 0.376 | 0.376 |
| `pruneLatentRaw` · `src/core/settle/utils/write/pruneLatentRaw.ts:16` | 1.12 | 1.38 | 0.340 | 0.419 |
| `beginPostOrder` · `src/core/settle/utils/write/DirtyPathSet.ts:22` | 1.08 | 1.08 | 0.327 | 0.327 |
| `delete` · `src/core/settle/utils/write/DirtyPathSet.ts:83` | 1.07 | 1.07 | 0.323 | 0.323 |

### flat-100 / 이후 갱신

3×101 updates, 유효 sample intervals=475, 분모=4820 µs, 시계 window=4820 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `(idle)` · `(V8):0` | 22.99 | 22.99 | 3.657 | 3.657 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 15.54 | 63.82 | 2.472 | 10.152 |
| `(program)` · `(V8):0` | 11.18 | 11.18 | 1.779 | 1.779 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 5.54 | 5.54 | 0.881 | 0.881 |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 4.19 | 15.35 | 0.667 | 2.442 |
| `clear` · `(V8):4004` | 3.92 | 7.20 | 0.624 | 1.145 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 3.84 | 29.71 | 0.611 | 4.726 |
| `isTreeNode` · `(V8):8959` | 3.11 | 3.11 | 0.495 | 0.495 |
| `releaseSettlementScratch` · `src/core/settle/utils/write/releaseSettlementScratch.ts:8` | 2.49 | 2.49 | 0.396 | 0.396 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 1.83 | 1.83 | 0.290 | 0.290 |
| `commitGlobalState` · `src/core/settle/utils/commit/commitGlobalState.ts:11` | 1.58 | 1.58 | 0.251 | 0.251 |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 1.37 | 4.07 | 0.218 | 0.647 |
| `visit` · `src/core/settle/utils/commit/commitGlobalState.ts:43` | 1.31 | 1.31 | 0.208 | 0.208 |
| `markCommitDeliveries` · `(V8):8899` | 1.10 | 4.23 | 0.175 | 0.673 |
| `computeNode` · `src/core/settle/utils/compute/computeNode.ts:21` | 1.00 | 6.00 | 0.158 | 0.954 |
| `(garbage collector)` · `(V8):0` | 0.95 | 0.95 | 0.152 | 0.152 |
| `set` · `(V8):4094` | 0.91 | 1.78 | 0.145 | 0.284 |
| `add` · `src/core/utils/pathIndex/utils/PathStoreIndex.ts:34` | 0.87 | 1.20 | 0.139 | 0.191 |
| `updateInactiveValuesMemo` · `src/core/settle/utils/commit/updateInactiveValuesMemo.ts:23` | 0.87 | 0.87 | 0.139 | 0.139 |
| `deliverWave` · `src/core/dispatch/utils/chain/deliverWave.ts:22` | 0.83 | 0.83 | 0.132 | 0.132 |

### flat-500 / 첫 갱신

3×101 updates, 유효 sample intervals=1000, 분모=13535 µs, 시계 window=13535 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 24.99 | 28.60 | 11.165 | 12.776 |
| `(program)` · `(V8):0` | 7.99 | 7.99 | 3.571 | 3.571 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 5.15 | 83.91 | 2.300 | 37.482 |
| `computeNode` · `src/core/settle/utils/compute/computeNode.ts:21` | 4.38 | 34.79 | 1.957 | 15.541 |
| `(idle)` · `(V8):0` | 4.24 | 4.24 | 1.894 | 1.894 |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 4.23 | 11.20 | 1.891 | 5.003 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 4.20 | 20.52 | 1.875 | 9.165 |
| `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts:35` | 3.28 | 70.05 | 1.465 | 31.290 |
| `(garbage collector)` · `(V8):0` | 2.84 | 2.84 | 1.267 | 1.267 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 2.52 | 2.52 | 1.125 | 1.125 |
| `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts:23` | 1.85 | 23.12 | 0.825 | 10.327 |
| `markWrite` · `src/core/settle/utils/write/markWrite.ts:23` | 1.79 | 2.67 | 0.799 | 1.191 |
| `releaseSettlementScratch` · `src/core/settle/utils/write/releaseSettlementScratch.ts:8` | 1.57 | 1.70 | 0.703 | 0.759 |
| `exitSchemaNodeChain` · `src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24` | 1.46 | 3.32 | 0.650 | 1.482 |
| `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts:18` | 1.43 | 75.30 | 0.637 | 33.637 |
| `clear` · `src/core/utils/pathIndex/utils/PathStoreIndex.ts:79` | 1.32 | 1.32 | 0.587 | 0.587 |
| `mark` · `src/core/settle/utils/commit/markCommitDeliveries.ts:92` | 1.26 | 3.78 | 0.561 | 1.686 |
| `findNodes` · `src/core/navigation/utils/query/findNodes.ts:7` | 1.20 | 1.75 | 0.535 | 0.782 |
| `registerRecalculation` · `src/core/settle/utils/write/registerRecalculation.ts:12` | 1.12 | 1.94 | 0.498 | 0.868 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 1.06 | 1.89 | 0.475 | 0.845 |

### flat-500 / 이후 갱신

3×101 updates, 유효 sample intervals=613, 분모=6867 µs, 시계 window=6867 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 14.74 | 25.88 | 3.340 | 5.865 |
| `(idle)` · `(V8):0` | 12.68 | 12.68 | 2.875 | 2.875 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 7.59 | 78.16 | 1.719 | 17.713 |
| `(program)` · `(V8):0` | 6.92 | 6.92 | 1.568 | 1.568 |
| `markCommitDeliveries` · `(V8):8899` | 4.37 | 11.61 | 0.990 | 2.630 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 4.09 | 6.01 | 0.927 | 1.363 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 3.54 | 3.54 | 0.802 | 0.802 |
| `interpret` · `src/core/behaviors/utils/parse/interpret.ts:6` | 3.29 | 3.29 | 0.746 | 0.746 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 2.66 | 23.91 | 0.604 | 5.419 |
| `clear` · `(V8):4004` | 2.18 | 3.61 | 0.495 | 0.818 |
| `markWrite` · `src/core/settle/utils/write/markWrite.ts:23` | 1.98 | 6.41 | 0.449 | 1.452 |
| `(anonymous)` · `src/core/settle/utils/compute/updateOutput.ts:28` | 1.76 | 1.94 | 0.399 | 0.439 |
| `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts:23` | 1.72 | 26.52 | 0.389 | 6.010 |
| `enterSchemaNodeChain` · `src/core/dispatch/utils/chain/enterSchemaNodeChain.ts:11` | 1.34 | 1.34 | 0.304 | 0.304 |
| `getStaticChoices` · `src/core/behaviors/utils/options/getStaticChoices.ts:30` | 1.27 | 1.27 | 0.287 | 0.287 |
| `writeObjectKey` · `src/core/behaviors/objectBehavior/utils/keys/writeObjectKey.ts:2` | 1.27 | 1.27 | 0.287 | 0.287 |
| `visit` · `src/core/settle/utils/commit/commitGlobalState.ts:43` | 1.24 | 1.24 | 0.281 | 0.281 |
| `set` · `(V8):4094` | 1.05 | 2.23 | 0.238 | 0.505 |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 1.03 | 4.98 | 0.234 | 1.129 |
| `get path` · `src/core/SchemaNode/SchemaNode.ts:154` | 0.93 | 0.93 | 0.211 | 0.211 |

### nested-d5-f4 / 첫 갱신

3×101 updates, 유효 sample intervals=1235, 분모=17994 µs, 시계 window=17994 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 8.38 | 18.55 | 4.974 | 11.013 |
| `(idle)` · `(V8):0` | 7.06 | 7.06 | 4.195 | 4.195 |
| `computeNode` · `src/core/settle/utils/compute/computeNode.ts:21` | 6.35 | 22.86 | 3.772 | 13.574 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 5.87 | 27.66 | 3.488 | 16.426 |
| `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts:35` | 4.77 | 76.40 | 2.835 | 45.373 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 4.61 | 4.81 | 2.739 | 2.858 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 4.35 | 88.48 | 2.581 | 52.545 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 4.28 | 4.28 | 2.545 | 2.545 |
| `beginPostOrder` · `src/core/settle/utils/write/DirtyPathSet.ts:22` | 4.16 | 4.16 | 2.469 | 2.469 |
| `(program)` · `(V8):0` | 3.53 | 3.53 | 2.096 | 2.096 |
| `add` · `src/core/settle/utils/write/DirtyPathSet.ts:45` | 3.29 | 3.29 | 1.954 | 1.954 |
| `sameValue` · `src/core/settle/utils/compute/sameValue.ts:9` | 2.80 | 2.80 | 1.660 | 1.660 |
| `markWrite` · `src/core/settle/utils/write/markWrite.ts:23` | 2.78 | 6.54 | 1.650 | 3.884 |
| `registerRecalculation` · `src/core/settle/utils/write/registerRecalculation.ts:12` | 2.63 | 7.11 | 1.561 | 4.224 |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 2.44 | 12.47 | 1.449 | 7.403 |
| `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts:23` | 2.28 | 30.70 | 1.356 | 18.234 |
| `delete` · `src/core/settle/utils/write/DirtyPathSet.ts:83` | 2.03 | 2.03 | 1.208 | 1.208 |
| `(anonymous)` · `src/core/settle/utils/commit/commitSettlement.ts:71` | 1.64 | 2.10 | 0.974 | 1.244 |
| `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts:18` | 1.60 | 80.80 | 0.950 | 47.987 |
| `getStaticChoices` · `src/core/behaviors/utils/options/getStaticChoices.ts:30` | 1.38 | 1.38 | 0.822 | 0.822 |

### nested-d5-f4 / 이후 갱신

3×101 updates, 유효 sample intervals=843, 분모=10848 µs, 시계 window=10848 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `(idle)` · `(V8):0` | 9.52 | 9.52 | 3.409 | 3.409 |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 8.20 | 19.13 | 2.937 | 6.848 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 7.86 | 7.86 | 2.815 | 2.815 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 5.65 | 84.17 | 2.023 | 30.135 |
| `(program)` · `(V8):0` | 4.76 | 4.76 | 1.703 | 1.703 |
| `computeNode` · `src/core/settle/utils/compute/computeNode.ts:21` | 4.42 | 31.43 | 1.584 | 11.251 |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 4.35 | 17.01 | 1.558 | 6.089 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 4.11 | 4.11 | 1.472 | 1.472 |
| `delete` · `src/core/settle/utils/write/DirtyPathSet.ts:83` | 3.45 | 3.45 | 1.234 | 1.234 |
| `clear` · `(V8):4004` | 2.95 | 4.94 | 1.056 | 1.769 |
| `beginPostOrder` · `src/core/settle/utils/write/DirtyPathSet.ts:22` | 2.93 | 2.93 | 1.050 | 1.050 |
| `getStaticChoices` · `src/core/behaviors/utils/options/getStaticChoices.ts:30` | 2.31 | 2.31 | 0.828 | 0.828 |
| `sameValue` · `src/core/settle/utils/compute/sameValue.ts:9` | 2.00 | 2.00 | 0.716 | 0.716 |
| `registerRecalculation` · `src/core/settle/utils/write/registerRecalculation.ts:12` | 1.97 | 5.86 | 0.706 | 2.099 |
| `dirtyChildren` · `src/core/settle/utils/compute/dirtyChildren.ts:12` | 1.89 | 3.57 | 0.677 | 1.277 |
| `get path` · `src/core/SchemaNode/SchemaNode.ts:154` | 1.87 | 1.87 | 0.670 | 0.670 |
| `add` · `src/core/settle/utils/write/DirtyPathSet.ts:45` | 1.81 | 1.81 | 0.647 | 0.647 |
| `(anonymous)` · `src/core/settle/utils/commit/commitSettlement.ts:71` | 1.72 | 3.84 | 0.617 | 1.376 |
| `visit` · `src/core/settle/utils/commit/commitGlobalState.ts:43` | 1.63 | 1.63 | 0.584 | 0.584 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 1.50 | 30.75 | 0.538 | 11.010 |

### sample-0 / 첫 갱신

3×101 updates, 유효 sample intervals=735, 분모=9069 µs, 시계 window=9069 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `(idle)` · `(V8):0` | 14.53 | 14.53 | 4.350 | 4.350 |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 8.47 | 17.76 | 2.535 | 5.317 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 8.27 | 29.73 | 2.475 | 8.898 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 7.29 | 77.20 | 2.182 | 23.106 |
| `(program)` · `(V8):0` | 6.12 | 6.12 | 1.832 | 1.832 |
| `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts:35` | 4.08 | 59.51 | 1.221 | 17.812 |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 3.86 | 9.82 | 1.155 | 2.941 |
| `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts:23` | 3.07 | 33.44 | 0.917 | 10.010 |
| `computeNode` · `src/core/settle/utils/compute/computeNode.ts:21` | 2.96 | 14.40 | 0.884 | 4.310 |
| `exitSchemaNodeChain` · `src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24` | 2.35 | 4.98 | 0.703 | 1.492 |
| `captureSchemaNodeChange` · `src/core/record/utils/captureSchemaNodeChange.ts:25` | 2.21 | 2.21 | 0.660 | 0.660 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 2.15 | 2.65 | 0.644 | 0.792 |
| `registerRecalculation` · `src/core/settle/utils/write/registerRecalculation.ts:12` | 2.12 | 3.05 | 0.634 | 0.914 |
| `commitGlobalState` · `src/core/settle/utils/commit/commitGlobalState.ts:11` | 1.92 | 1.92 | 0.574 | 0.574 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 1.86 | 1.86 | 0.558 | 0.558 |
| `markWrite` · `src/core/settle/utils/write/markWrite.ts:23` | 1.48 | 2.28 | 0.442 | 0.683 |
| `(anonymous)` · `src/core/settle/utils/commit/commitSettlement.ts:71` | 1.46 | 2.27 | 0.436 | 0.680 |
| `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts:18` | 1.31 | 65.88 | 0.393 | 19.719 |
| `mark` · `src/core/settle/utils/commit/markCommitDeliveries.ts:92` | 1.30 | 3.16 | 0.389 | 0.947 |
| `deliverWave` · `src/core/dispatch/utils/chain/deliverWave.ts:22` | 1.22 | 1.22 | 0.366 | 0.366 |

### sample-0 / 이후 갱신

3×101 updates, 유효 sample intervals=698, 분모=8668 µs, 시계 window=8668 µs, self 보존=100.000%.

| 함수 / 원본 위치 | self % | total % | self µs/update | total µs/update |
| --- | ---: | ---: | ---: | ---: |
| `(idle)` · `(V8):0` | 18.48 | 18.48 | 5.287 | 5.287 |
| `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts:25` | 9.07 | 21.24 | 2.594 | 6.076 |
| `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts:30` | 8.87 | 32.98 | 2.538 | 9.436 |
| `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs:98` | 6.77 | 71.34 | 1.937 | 20.409 |
| `(garbage collector)` · `(V8):0` | 5.08 | 5.08 | 1.452 | 1.452 |
| `(program)` · `(V8):0` | 4.85 | 4.85 | 1.386 | 1.386 |
| `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts:35` | 4.19 | 55.28 | 1.198 | 15.815 |
| `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts:12` | 4.18 | 4.18 | 1.195 | 1.195 |
| `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.17 | 3.44 | 0.908 | 0.983 |
| `commitGlobalState` · `src/core/settle/utils/commit/commitGlobalState.ts:11` | 2.96 | 2.96 | 0.848 | 0.848 |
| `computeNode` · `src/core/settle/utils/compute/computeNode.ts:21` | 2.45 | 10.50 | 0.700 | 3.003 |
| `_SchemaNodeRevisionLedger` · `src/core/record/utils/SchemaNodeRevisionLedger.ts:19` | 1.62 | 1.62 | 0.462 | 0.462 |
| `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts:13` | 1.48 | 6.83 | 0.422 | 1.954 |
| `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts:23` | 1.47 | 34.74 | 0.419 | 9.937 |
| `releaseWrongKindHosts` · `src/core/settle/utils/write/releaseWrongKindHosts.ts:12` | 1.23 | 1.23 | 0.353 | 0.353 |
| `runDeliveryWaves` · `src/core/dispatch/utils/chain/runDeliveryWaves.ts:9` | 1.20 | 1.92 | 0.343 | 0.548 |
| `(anonymous)` · `src/core/settle/utils/commit/commitSettlement.ts:71` | 1.12 | 2.03 | 0.320 | 0.581 |
| `markWrite` · `src/core/settle/utils/write/markWrite.ts:23` | 0.98 | 2.08 | 0.281 | 0.594 |
| `exitSchemaNodeChain` · `src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24` | 0.90 | 4.87 | 0.257 | 1.393 |
| `findNodes` · `src/core/navigation/utils/query/findNodes.ts:7` | 0.89 | 0.96 | 0.254 | 0.274 |

## 잡음 밖 상한의 순위와 변경 하나의 수정안

같은 후보의 fixture 이득을 합하지 않습니다. D1⊃E1, O1⊃A1이며 C1/F1/P1에도 일부 겹침이 있습니다. 순위는 각 후보의 잡음 밖 행 중 최대 짝 차이를 보여주는 인덱스입니다. 전체 행과 회귀는 다음 표가 기준입니다. 제거된 필수 일 전체가 실제 수정안의 기대 이득은 아닙니다.

| 순위 / ID | 제거 범위 | 최대 행 | 이득 µs [99% 구간] | 회차 | 잡음 밖 행 / 변형 회귀 행 | 계약 질문 |
| --- | --- | --- | --- | ---: | --- | --- |
| 1 / D1 | 커밋 배달 후보·방문 전체 | nested-d5-f4 / first | 65.834 [62.876, 68.750] | 3 | 8 / 0 | EVENT-007 |
| 2 / E1 | 사건 표시와 그 후속 비용 | nested-d5-f4 / first | 33.833 [32.083, 35.083] | 9 | 8 / 0 | EVENT-007 |
| 3 / C1 | 커밋 진단·메모 정리 | nested-d5-f4 / first | 18.208 [16.791, 19.750] | 9 | 8 / 0 | E/V 직접 수정 없음 |
| 4 / F1 | 쓰기당 고정 진입·빈 단계 검사 | sample-0 / first | 10.375 [9.751, 11.041] | 9 | 5 / 3 | E/V 직접 수정 없음 |
| 5 / O1 | 전체 출력 조립·투영·참조 결정 | nested-d5-f4 / first | 9.959 [8.500, 12.083] | 9 | 5 / 3 | VALUE-012 |
| 6 / S1 | 정착 scratch 정리 | nested-d5-f4 / first | 5.166 [2.459, 7.042] | 9 | 8 / 0 | E/V 직접 수정 없음 |
| 7 / A1 | 객체 조립 | flat-500 / first | 4.500 [2.792, 6.042] | 9 | 4 / 3 | VALUE-012 |
| 8 / R1 | 재계산 등록·조상 경로 확장 | nested-d5-f4 / first | 4.125 [2.249, 5.417] | 9 | 4 / 0 | E/V 직접 수정 없음 |
| 9 / Q1 | 계산 경로의 검사·방문 shell | nested-d5-f4 / first | 3.458 [2.042, 5.126] | 9 | 4 / 1 | E/V 직접 수정 없음 |
| 10 / P1 | 빈 latent 저장소의 고정 작업 | sample-0 / first | 3.458 [2.834, 4.000] | 9 | 3 / 3 | E/V 직접 수정 없음 |
| 11 / W1 | scalar 표시의 일반 분기 | nested-d5-f4 / first | 3.249 [1.708, 5.125] | 9 | 2 / 3 | E/V 직접 수정 없음 |

### D1 — 커밋 배달 후보·방문 전체

소유자: `src/core/settle`; 변경 위치: `utils/commit/markCommitDeliveries.ts`. 수정안 하나: globalState.nodes와 candidates를 합칠 때 두 번째 ordered Set을 만들지 않고 기존 globalState.nodes의 membership을 재사용해 같은 순서로 한 번씩 방문합니다. global-state 후보 다음의 추가 후보 순서와 전체 revision 증가 완료 뒤 배달하는 순서를 유지합니다.
제거 실험: markCommitDeliveries 전체를 생략합니다. global-state 방문·후보/required 처리·배달 비교·payload·revision까지 포함하므로 E1과 크게 겹칩니다.
계약 표기: **EVENT-007에 닿음 — 코드 전 원장 질문**. 후보 합치기와 방문 순서가 배달 집합 전체의 revision 증가를 빠뜨리거나 리스너보다 뒤로 미루지 않는지 원장 질문이 필요합니다.

### E1 — 사건 표시와 그 후속 비용

소유자: `src/core/record`; 변경 위치: `utils/markSchemaNodeEvent.ts`. 수정안 하나: UpdateValue의 흔한 표시 경로를 단형 객체 리터럴/대입 경로로 특화하여 pendingDelivery와 payload/options 사전의 일시적 모양 변화를 줄입니다. 기존 runtime 집합과 pendingRevision 비트는 모두 유지하고 외부에 전달한 payload를 재사용하지 않습니다.
제거 실험: markSchemaNodeEvent를 생략합니다. 해당 표시에서 발생하는 revision-ledger 생성 및 dispatch의 후속 처리 감소도 포함합니다. 순수 marker self만의 상한이 아닙니다.
계약 표기: **EVENT-007에 닿음 — 코드 전 원장 질문**. 이 함수의 pendingRevision와 revisionNodes가 커밋의 일괄 증가 입력이므로 표시를 싸게 하면서도 리스너 유무와 관계없는 집합과 일괄 증가를 보존해야 합니다.

### C1 — 커밋 진단·메모 정리

소유자: `src/core/settle`; 변경 위치: `utils/commit/commitSettlement.ts`. 수정안 하나: 불일치 경로가 계속 비어 있는 경우의 typeMismatchesMemo 갱신을 기존 빈 경로 row의 commit 갱신으로 특화합니다. 비어 있지 않은 상태에서 비는 전이는 기존 초기화를 유지하고 현재 commit 검사와 경고·진단 방문은 보존합니다.
제거 실험: commitNumber 증가와 markCommitDeliveries만 남깁니다. 진단 방문·타입 불일치 메모·refresh/비활성 값 메모 등을 함께 제거한 포괄 상한입니다.
계약 표기: EVENT-007 / VALUE-012 직접 수정 없음. EVENT-007의 증가 루프와 VALUE-012의 조립은 기존 함수를 그대로 소비합니다. 진단/메모 의미를 건너뛰는 수정안은 아닙니다.

### F1 — 쓰기당 고정 진입·빈 단계 검사

소유자: `src/core/settle`; 변경 위치: `utils/write/writeSchemaNode.ts; utils/settlement/finishSettlement.ts`. 수정안 하나: 기존 branchless·파생 없음·정상 live scalar 조건에 한정하여 고정 진입과 빈 단계 검사를 같은 owner의 단형 호출 경로로 특화합니다. 표시·계산·파생·전이·커밋·배달의 의미와 순서는 유지하고 일반 조건은 기존 경로를 사용합니다.
제거 실험: writeSchemaNode의 일반/latent/wrong-kind 진입 검사와 finishSettlement의 이 픽스처에서 비어 있는 후처리 검사를 생략합니다. 모든 고정 비용을 제거한 실험은 아니며 C1/P1과 겹칩니다.
계약 표기: EVENT-007 / VALUE-012 직접 수정 없음. revision 증가나 assembly 구현을 고치지 않습니다. SETTLE-001의 단계·순서를 생략하는 설계 변경은 이 수정안의 범위 밖입니다.

### O1 — 전체 출력 조립·투영·참조 결정

소유자: `src/core/settle`; 변경 위치: `utils/compute/updateOutput.ts`. 수정안 하나: settlement 한 호출 안에서 사용하는 assembly hint 객체를 owner 내부 WeakMap으로 재사용하고, 매 assemble 직전에 incremental을 false로 초기화합니다. 가상 노드 재진입에서도 이전 hint의 상태를 읽지 않도록 합니다.
제거 실험: 미리 기록한 local/emit/changed를 재생하고 change capture를 유지합니다. 조립·투영·참조 결정을 함께 제거하므로 A1을 포함합니다.
계약 표기: **VALUE-012에 닿음 — 코드 전 원장 질문**. hint.incremental은 얕은 참조 비교/복원의 경로를 결정합니다. hint 수명과 재진입이 바뀌어도 입력 네 종류의 변화와 이전 참조 복원을 보존하는지 원장 질문이 필요합니다.

### S1 — 정착 scratch 정리

소유자: `src/core/settle`; 변경 위치: `utils/write/releaseSettlementScratch.ts`. 수정안 하나: 고정 scratch 컨테이너마다 실제 비어 있지 않을 때만 clear/길이 초기화를 호출하는 단형 경로로 바꿉니다. inUse 해제와 모든 사용한 컨테이너의 초기화는 항상 유지합니다.
제거 실험: 정리 호출을 clock 밖으로 이동합니다. 실제 작업 제거가 아니라 정리 비용의 제거 실험입니다.
계약 표기: EVENT-007 / VALUE-012 직접 수정 없음. 배달/조립은 끝난 뒤의 내부 정리이며 revision과 emit 구현은 그대로입니다.

### A1 — 객체 조립

소유자: `src/core/behaviors/objectBehavior`; 변경 위치: `branch/utils/assembleObject.ts`. 수정안 하나: STABLE_SHAPES가 증명한 같은 children/schema/extras와 키 집합에 한하여 첫 patch의 객체 spread를 고전 루프 복사로 비교합니다. 현재 own 키 순서와 writeObjectKey의 특수 키 처리를 유지하고 메타데이터가 맞지 않으면 기존 경로를 사용합니다.
제거 실험: assembleObject 결과를 재생합니다. 조립 lookup/copy를 제거하지만 재생 lookup과 hint 설정 비용이 남습니다.
계약 표기: **VALUE-012에 닿음 — 코드 전 원장 질문**. 새 컨테이너를 만드는 조건, 키 순서, 자식 emit 참조 및 같은 값의 이전 참조 복원을 직접 건드립니다. 원장 질문 뒤에만 제품 수정으로 진행할 수 있습니다.

### R1 — 재계산 등록·조상 경로 확장

소유자: `src/core/settle`; 변경 위치: `utils/write/registerRecalculation.ts`. 수정안 하나: 의존 확장 후 dirty path가 하나이고 게이트가 없는 경우 expanded Set을 만들지 않고 그 경로의 조상만 직접 등록합니다. 여러 경로나 게이트 조건은 기존 경로를 사용합니다.
제거 실험: 이 픽스처의 단일 leaf 조상 경로를 직접 등록하여 dependency 질의와 중복 검사 작업을 생략합니다.
계약 표기: EVENT-007 / VALUE-012 직접 수정 없음. 의존 확장과 dirtyChildren의 입력은 유지하고 revision/assembly 구현은 수정하지 않습니다.

### Q1 — 계산 경로의 검사·방문 shell

소유자: `src/core/settle`; 변경 위치: `utils/compute/computeNode.ts`. 수정안 하나: branchless이며 shape가 변하지 않은 계산 몸통을 같은 함수의 단형 호출 자리로 특화합니다. 더티 확인, stateDirty 표시, child post-order, updateOutput 호출과 더티 삭제는 유지합니다.
제거 실험: 정상 leaf/branch 계산의 일반 shape/gate 검사를 생략하고 기존 dirtyChildren/updateOutput을 호출합니다.
계약 표기: EVENT-007 / VALUE-012 직접 수정 없음. 종류별 assemble와 reference 복원은 기존 updateOutput을 그대로 소비합니다. 단계 순서나 호스트 바퀴는 바꾸지 않습니다.

### P1 — 빈 latent 저장소의 고정 작업

소유자: `src/core/settle`; 변경 위치: `utils/write/pruneLatentRaw.ts`. 수정안 하나: runtime.latentRaw.size가 0일 때 childPaths와 call-local latent index를 만들기 전에 반환합니다. 비어 있지 않은 저장소의 prefix 제거·rollback 처리는 유지합니다.
제거 실험: 측정 root의 latentRaw가 비어 있음을 단언한 뒤 pruneLatentRaw를 생략합니다.
계약 표기: EVENT-007 / VALUE-012 직접 수정 없음. 빈 저장소의 작업만 제거하며 revision과 emit 조립은 고치지 않습니다.

### W1 — scalar 표시의 일반 분기

소유자: `src/core/settle`; 변경 위치: `utils/write/markWrite.ts`. 수정안 하나: 기존 정상 terminal·명시적 scalar 쓰기를 단형 분기로 특화하여 branch/virtual/load/automatic 검사만 줄입니다. interpret와 SameValueZero, writtenInputs 및 모든 dirty/changed 표시는 유지합니다.
제거 실험: 이 픽스처의 terminal 입력 몸통만 직접 실행합니다.
계약 표기: EVENT-007 / VALUE-012 직접 수정 없음. raw 표시의 분기 특화이며 assembly나 커밋 revision 증가를 고치지 않습니다.

### 첫 갱신의 크기 독립 고정 몫

F1은 leaf의 진입과 빈 단계 검사를 다루며 필드 전체를 순회하는 작업을 제거하지 않습니다. C1은 이 정상 값 픽스처의 빈 진단/메모 정리 몫입니다. flat-100→flat-500은 전체 필드가 5배지만 한 쓰기의 바뀐 경로는 leaf와 root 두 곳입니다. 따라서 이 두 범위의 이득을 고정 몫의 측정 가능한 부분 상한으로 따로 보며, 중첩 폼의 깊이·조상 수 효과까지 크기 독립이라고 부르지는 않습니다. 모든 쓰기당 고정 비용을 0으로 만든다는 설계 변경은 측정하거나 제안하지 않았습니다.

| 범위 / fixture | 첫 이득 µs [99% 구간] | 회차 | 판정 |
| --- | --- | ---: | --- |
| fixed-shell / flat-100 | 7.917 [6.750, 9.084] | 9 | 잡음 밖 상한 |
| fixed-shell / flat-500 | 8.416 [7.250, 9.833] | 9 | 잡음 밖 상한 |
| fixed-shell / nested-d5-f4 | 10.375 [8.792, 11.957] | 9 | 잡음 밖 상한 |
| fixed-shell / sample-0 | 10.375 [9.751, 11.041] | 9 | 잡음 밖 상한 |
| commit-bookkeeping / flat-100 | 14.542 [13.500, 16.333] | 9 | 잡음 밖 상한 |
| commit-bookkeeping / flat-500 | 13.709 [12.709, 15.417] | 9 | 잡음 밖 상한 |
| commit-bookkeeping / nested-d5-f4 | 18.208 [16.791, 19.750] | 9 | 잡음 밖 상한 |
| commit-bookkeeping / sample-0 | 15.000 [14.542, 15.584] | 9 | 잡음 밖 상한 |
| fixed-empty-latent / flat-100 | -0.167 [-1.542, 0.833] | 9 | 미입증 |
| fixed-empty-latent / flat-500 | 0.583 [-0.667, 2.125] | 9 | 미입증 |
| fixed-empty-latent / nested-d5-f4 | 3.125 [1.625, 5.124] | 9 | 잡음 밖 상한 |
| fixed-empty-latent / sample-0 | 3.458 [2.834, 4.000] | 9 | 잡음 밖 상한 |

## 모든 제거 실험의 판정 열

이득은 HEAD−variant의 ordinal 짝 차이 중앙값입니다. 3회차는 각 회차 이득이 해당 회차 잡음보다 커야 합니다. 작은 이득의 행이 있는 후보/fixture는 worker가 두 update 모드를 함께 내므로 둘 다 9회차 자료를 유지했습니다. 9회차는 pooled 99% 구간 하한>0 및 이득>같은 행 A/A 중앙값 절댓값을 요구했습니다. 회귀는 구간 상한<0이고 |중앙값|>max(|A/A|, HEAD median×0.005)입니다. 원 결정의 signed A/A 비교보다 보수적으로 절댓값을 사용했습니다.
A1/O1/F1/P1/Q1/W1의 일부 later 제거 변형은 회귀 조건을 채웁니다. 이것을 숨기거나 해당 표본을 버리지 않았습니다. 이 실험 변형을 제품 수정으로 채택하지 않으며 실제 수정은 계약 확인 뒤 별도 재측정해야 합니다.

| fixture / 모드 / ID | 회차 | HEAD/variant median µs | 짝 이득 µs [99%] | 최대 회차 잡음 µs | A/A µs | 회귀 바닥 µs | 판정 |
| --- | ---: | --- | --- | ---: | ---: | ---: | --- |
| flat-100 / first / D1 | 9 | 132.083 / 89.251 | 42.459 [41.208, 43.791] | 38.833 | 2.084 | 2.084 | 잡음 밖 상한 |
| flat-100 / first / E1 | 9 | 132.918 / 116.292 | 16.917 [15.708, 18.126] | 8.043 | 2.084 | 2.084 | 잡음 밖 상한 |
| flat-100 / first / C1 | 9 | 133.500 / 119.125 | 14.542 [13.500, 16.333] | 21.833 | 2.084 | 2.084 | 잡음 밖 상한 |
| flat-100 / first / F1 | 9 | 132.709 / 124.792 | 7.917 [6.750, 9.084] | 12.458 | 2.084 | 2.084 | 잡음 밖 상한 |
| flat-100 / first / O1 | 9 | 132.125 / 125.207 | 7.166 [5.916, 8.251] | 22.792 | 2.084 | 2.084 | 잡음 밖 상한 |
| flat-100 / first / S1 | 9 | 133.958 / 130.583 | 3.582 [2.083, 4.916] | 15.292 | 2.084 | 2.084 | 잡음 밖 상한 |
| flat-100 / first / A1 | 9 | 133.333 / 129.500 | 3.958 [2.292, 5.333] | 9.209 | 2.084 | 2.084 | 잡음 밖 상한 |
| flat-100 / first / R1 | 9 | 134.041 / 131.792 | 1.792 [0.375, 3.375] | 16.708 | 2.084 | 2.084 | 미입증 |
| flat-100 / first / Q1 | 9 | 132.584 / 129.875 | 1.667 [0.583, 3.041] | 8.459 | 2.084 | 2.084 | 미입증 |
| flat-100 / first / P1 | 9 | 132.999 / 133.083 | -0.167 [-1.542, 0.833] | 10.624 | 2.084 | 2.084 | 미입증 |
| flat-100 / first / W1 | 9 | 133.125 / 132.041 | 1.251 [-0.417, 2.583] | 8.793 | 2.084 | 2.084 | 미입증 |
| flat-100 / later / D1 | 9 | 10.750 / 5.750 | 5.000 [4.875, 5.125] | 38.833 | 0.041 | 0.054 | 잡음 밖 상한 |
| flat-100 / later / E1 | 9 | 11.167 / 9.458 | 1.750 [1.625, 1.958] | 7.042 | 0.041 | 0.056 | 잡음 밖 상한 |
| flat-100 / later / C1 | 9 | 11.334 / 10.542 | 0.666 [0.500, 0.833] | 6.167 | 0.041 | 0.057 | 잡음 밖 상한 |
| flat-100 / later / F1 | 9 | 11.333 / 13.334 | -2.041 [-2.167, -1.834] | 12.458 | 0.041 | 0.057 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-100 / later / O1 | 9 | 11.083 / 13.041 | -1.625 [-2.001, -1.209] | 22.792 | 0.041 | 0.055 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-100 / later / S1 | 9 | 11.041 / 10.583 | 0.374 [0.250, 0.541] | 15.292 | 0.041 | 0.055 | 잡음 밖 상한 |
| flat-100 / later / A1 | 9 | 11.167 / 13.375 | -1.750 [-2.000, -1.459] | 7.834 | 0.041 | 0.056 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-100 / later / R1 | 9 | 11.207 / 11.209 | -0.083 [-0.208, 0.042] | 16.708 | 0.041 | 0.056 | 미입증 |
| flat-100 / later / Q1 | 9 | 10.750 / 10.958 | -0.166 [-0.333, 0.001] | 6.542 | 0.041 | 0.054 | 미입증 |
| flat-100 / later / P1 | 9 | 11.125 / 13.708 | -2.582 [-2.709, -2.417] | 5.376 | 0.041 | 0.056 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-100 / later / W1 | 9 | 11.376 / 11.959 | -0.583 [-0.708, -0.416] | 8.208 | 0.041 | 0.057 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-500 / first / D1 | 9 | 146.875 / 93.209 | 52.208 [50.166, 53.625] | 11.373 | 0.666 | 0.734 | 잡음 밖 상한 |
| flat-500 / first / E1 | 9 | 146.584 / 120.292 | 25.834 [24.000, 27.333] | 20.250 | 0.666 | 0.733 | 잡음 밖 상한 |
| flat-500 / first / C1 | 9 | 145.542 / 131.625 | 13.709 [12.709, 15.417] | 13.333 | 0.666 | 0.728 | 잡음 밖 상한 |
| flat-500 / first / F1 | 9 | 146.542 / 137.292 | 8.416 [7.250, 9.833] | 14.125 | 0.666 | 0.733 | 잡음 밖 상한 |
| flat-500 / first / O1 | 9 | 145.376 / 138.249 | 7.417 [6.375, 8.625] | 11.751 | 0.666 | 0.727 | 잡음 밖 상한 |
| flat-500 / first / S1 | 9 | 144.417 / 141.875 | 3.541 [2.250, 5.000] | 21.417 | 0.666 | 0.722 | 잡음 밖 상한 |
| flat-500 / first / A1 | 9 | 146.083 / 142.542 | 4.500 [2.792, 6.042] | 20.250 | 0.666 | 0.730 | 잡음 밖 상한 |
| flat-500 / first / R1 | 9 | 145.792 / 143.875 | 1.416 [0.208, 2.708] | 12.749 | 0.666 | 0.729 | 잡음 밖 상한 |
| flat-500 / first / Q1 | 9 | 146.042 / 144.083 | 2.125 [0.708, 3.208] | 14.792 | 0.666 | 0.730 | 잡음 밖 상한 |
| flat-500 / first / P1 | 9 | 147.333 / 145.500 | 0.583 [-0.667, 2.125] | 13.292 | 0.666 | 0.737 | 미입증 |
| flat-500 / first / W1 | 9 | 144.917 / 143.124 | 1.000 [-0.375, 3.084] | 13.751 | 0.666 | 0.725 | 미입증 |
| flat-500 / later / D1 | 9 | 11.542 / 6.500 | 5.042 [4.916, 5.166] | 9.208 | 0.084 | 0.084 | 잡음 밖 상한 |
| flat-500 / later / E1 | 9 | 11.541 / 9.666 | 1.958 [1.792, 2.042] | 20.250 | 0.084 | 0.084 | 잡음 밖 상한 |
| flat-500 / later / C1 | 9 | 11.875 / 11.167 | 0.667 [0.541, 0.833] | 5.334 | 0.084 | 0.084 | 잡음 밖 상한 |
| flat-500 / later / F1 | 9 | 11.750 / 13.833 | -1.999 [-2.167, -1.875] | 10.625 | 0.084 | 0.084 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-500 / later / O1 | 9 | 11.667 / 12.708 | -0.833 [-1.126, -0.334] | 9.583 | 0.084 | 0.084 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-500 / later / S1 | 9 | 11.541 / 11.167 | 0.375 [0.250, 0.500] | 21.417 | 0.084 | 0.084 | 잡음 밖 상한 |
| flat-500 / later / A1 | 9 | 11.791 / 13.167 | -1.083 [-1.292, -0.834] | 20.250 | 0.084 | 0.084 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-500 / later / R1 | 9 | 11.791 / 11.875 | -0.084 [-0.208, 0.000] | 7.875 | 0.084 | 0.084 | 미입증 |
| flat-500 / later / Q1 | 9 | 11.708 / 11.957 | -0.250 [-0.334, -0.124] | 14.792 | 0.084 | 0.084 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-500 / later / P1 | 9 | 11.875 / 14.374 | -2.459 [-2.625, -2.334] | 11.208 | 0.084 | 0.084 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| flat-500 / later / W1 | 9 | 11.251 / 11.916 | -0.459 [-0.667, -0.292] | 6.083 | 0.084 | 0.084 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| nested-d5-f4 / first / D1 | 3 | 182.042 / 115.417 | 65.834 [62.876, 68.750] | 8.126 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / E1 | 9 | 180.667 / 148.499 | 33.833 [32.083, 35.083] | 11.416 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / C1 | 9 | 182.375 / 165.000 | 18.208 [16.791, 19.750] | 11.709 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / F1 | 9 | 181.833 / 171.417 | 10.375 [8.792, 11.957] | 8.376 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / O1 | 9 | 182.208 / 171.667 | 9.959 [8.500, 12.083] | 10.251 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / S1 | 9 | 182.084 / 177.042 | 5.166 [2.459, 7.042] | 10.751 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / A1 | 9 | 181.042 / 177.458 | 3.625 [2.292, 5.292] | 10.500 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / R1 | 9 | 181.709 / 177.625 | 4.125 [2.249, 5.417] | 11.249 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / Q1 | 9 | 181.250 / 178.541 | 3.458 [2.042, 5.126] | 38.709 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / P1 | 9 | 183.041 / 179.375 | 3.125 [1.625, 5.124] | 9.417 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / first / W1 | 9 | 181.750 / 179.001 | 3.249 [1.708, 5.125] | 10.126 | 1.958 | 1.958 | 잡음 밖 상한 |
| nested-d5-f4 / later / D1 | 3 | 27.334 / 16.584 | 10.667 [10.542, 10.917] | 8.126 | 0.083 | 0.137 | 잡음 밖 상한 |
| nested-d5-f4 / later / E1 | 9 | 27.375 / 23.333 | 4.125 [3.958, 4.250] | 11.416 | 0.083 | 0.137 | 잡음 밖 상한 |
| nested-d5-f4 / later / C1 | 9 | 27.750 / 26.167 | 1.542 [1.374, 1.709] | 5.916 | 0.083 | 0.139 | 잡음 밖 상한 |
| nested-d5-f4 / later / F1 | 9 | 27.458 / 29.667 | -2.167 [-2.333, -1.959] | 8.250 | 0.083 | 0.137 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| nested-d5-f4 / later / O1 | 9 | 27.625 / 28.874 | -1.000 [-1.417, -0.584] | 5.083 | 0.083 | 0.138 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| nested-d5-f4 / later / S1 | 9 | 27.834 / 27.125 | 0.625 [0.458, 0.833] | 10.751 | 0.083 | 0.139 | 잡음 밖 상한 |
| nested-d5-f4 / later / A1 | 9 | 27.918 / 31.084 | -2.458 [-2.792, -2.125] | 5.292 | 0.083 | 0.140 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| nested-d5-f4 / later / R1 | 9 | 27.708 / 27.708 | 0.084 [-0.125, 0.250] | 6.375 | 0.083 | 0.139 | 미입증 |
| nested-d5-f4 / later / Q1 | 9 | 28.417 / 28.416 | 0.001 [-0.208, 0.208] | 38.709 | 0.083 | 0.142 | 미입증 |
| nested-d5-f4 / later / P1 | 9 | 27.542 / 30.584 | -3.042 [-3.250, -2.834] | 6.124 | 0.083 | 0.138 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| nested-d5-f4 / later / W1 | 9 | 27.792 / 28.167 | -0.333 [-0.500, -0.166] | 6.375 | 0.083 | 0.139 | 측정 변형 회귀 — 제거 변형 채택 불가 |
| sample-0 / first / D1 | 3 | 122.625 / 79.750 | 42.833 [41.500, 43.749] | 18.167 | 0.458 | 0.613 | 잡음 밖 상한 |
| sample-0 / first / E1 | 3 | 121.334 / 104.124 | 17.626 [16.541, 18.416] | 8.291 | 0.458 | 0.607 | 잡음 밖 상한 |
| sample-0 / first / C1 | 9 | 123.501 / 108.126 | 15.000 [14.542, 15.584] | 42.876 | 0.458 | 0.618 | 잡음 밖 상한 |
| sample-0 / first / F1 | 9 | 122.208 / 111.876 | 10.375 [9.751, 11.041] | 21.750 | 0.458 | 0.611 | 잡음 밖 상한 |
| sample-0 / first / O1 | 9 | 122.334 / 116.625 | 5.583 [5.042, 6.041] | 13.500 | 0.458 | 0.612 | 잡음 밖 상한 |
| sample-0 / first / S1 | 9 | 122.042 / 118.417 | 3.624 [3.000, 4.124] | 11.792 | 0.458 | 0.610 | 잡음 밖 상한 |
| sample-0 / first / A1 | 9 | 122.583 / 119.875 | 2.416 [1.833, 3.208] | 8.458 | 0.458 | 0.613 | 잡음 밖 상한 |
| sample-0 / first / R1 | 9 | 121.832 / 118.916 | 3.000 [2.334, 3.583] | 7.958 | 0.458 | 0.609 | 잡음 밖 상한 |
| sample-0 / first / Q1 | 9 | 122.376 / 119.583 | 3.041 [2.417, 3.625] | 5.833 | 0.458 | 0.612 | 잡음 밖 상한 |
| sample-0 / first / P1 | 9 | 121.792 / 118.542 | 3.458 [2.834, 4.000] | 9.167 | 0.458 | 0.609 | 잡음 밖 상한 |
| sample-0 / first / W1 | 9 | 122.459 / 121.958 | 0.625 [0.083, 1.250] | 50.375 | 0.458 | 0.612 | 잡음 밖 상한 |
| sample-0 / later / D1 | 3 | 38.709 / 17.458 | 21.167 [20.584, 21.500] | 18.167 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / E1 | 3 | 38.583 / 24.959 | 13.750 [13.292, 14.167] | 8.291 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / C1 | 9 | 39.542 / 33.833 | 5.626 [5.291, 5.918] | 42.876 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / F1 | 9 | 38.959 / 35.667 | 3.209 [2.917, 3.500] | 21.750 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / O1 | 9 | 39.042 / 37.917 | 1.167 [0.875, 1.500] | 13.500 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / S1 | 9 | 39.041 / 37.375 | 1.750 [1.416, 1.959] | 11.792 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / A1 | 9 | 39.083 / 39.041 | 0.083 [-0.291, 0.375] | 8.458 | 0.209 | 0.209 | 미입증 |
| sample-0 / later / R1 | 9 | 38.916 / 37.916 | 1.042 [0.583, 1.332] | 7.958 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / Q1 | 9 | 39.874 / 38.750 | 1.000 [0.667, 1.333] | 5.833 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / P1 | 9 | 39.208 / 37.917 | 1.332 [0.959, 1.583] | 9.167 | 0.209 | 0.209 | 잡음 밖 상한 |
| sample-0 / later / W1 | 9 | 39.458 / 39.333 | -0.083 [-0.374, 0.167] | 50.375 | 0.209 | 0.209 | 미입증 |

### A/A 대조 — HEAD 대 HEAD 9회차

| fixture / 모드 | 짝 중앙값 µs [99%] | HEAD median µs |
| --- | --- | ---: |
| flat-100 / first | 2.084 [0.376, 3.792] | 132.249 |
| flat-100 / later | 0.041 [-0.124, 0.167] | 10.667 |
| flat-500 / first | 0.666 [-0.667, 1.917] | 144.000 |
| flat-500 / later | 0.084 [-0.041, 0.209] | 11.500 |
| nested-d5-f4 / first | 1.958 [0.958, 3.542] | 180.708 |
| nested-d5-f4 / later | 0.083 [-0.042, 0.292] | 28.041 |
| sample-0 / first | 0.458 [-0.042, 1.041] | 121.709 |
| sample-0 / later | 0.209 [-0.125, 0.459] | 39.334 |

## EVENT-007 / VALUE-012 — 코드 전 원장 질문

### EVENT-007

정확한 문장 (architecture/ledger/event.md:172):

> **원장** — `revision`은 **커밋 시 배달 집합 전체를 한 번에** 올린다

보충: 65C-03은 변경을 알아내는 구현은 바꿀 수 있으나 구독한 노드에만 payload/revision을 만드는 S4는 하지 않는다고 정합니다.

- **D1**: 후보 합치기와 방문 순서가 배달 집합 전체의 revision 증가를 빠뜨리거나 리스너보다 뒤로 미루지 않는지 원장 질문이 필요합니다.
- **E1**: 이 함수의 pendingRevision와 revisionNodes가 커밋의 일괄 증가 입력이므로 표시를 싸게 하면서도 리스너 유무와 관계없는 집합과 일괄 증가를 보존해야 합니다.

### VALUE-012

정확한 문장 (architecture/ledger/value.md:215):

> **9. `emit`의 참조**는 (자식 `emit` 참조 ∪ `extras` ∪ 호스트 `raw` ∪ 활성 키 집합) 가운데 하나라도 바뀌면 새로 만들고, 아니면 이전 참조를 그대로 둔다(F9).

보충: 새로 만든 것이 직전 커밋의 것과 키 목록(순서 포함)도 같고 키마다의 자식 `emit` 참조도 같으면 직전 참조를 둔다(얕은 비교, 재계산 목록의 호스트만).

- **O1**: hint.incremental은 얕은 참조 비교/복원의 경로를 결정합니다. hint 수명과 재진입이 바뀌어도 입력 네 종류의 변화와 이전 참조 복원을 보존하는지 원장 질문이 필요합니다.
- **A1**: 새 컨테이너를 만드는 조건, 키 순서, 자식 emit 참조 및 같은 값의 이전 참조 복원을 직접 건드립니다. 원장 질문 뒤에만 제품 수정으로 진행할 수 있습니다.

D1/E1은 EVENT-007, A1/O1은 VALUE-012 질문입니다. 다른 수정안은 E/V 구현을 직접 고치지 않는다고 명시했으며, 그 경계를 넘는 실제 수정이면 다시 원장 질문으로 올려야 합니다. 정착 설계 변경·구독자 유무에 따른 revision 생략·새 공개 계약·폼 간 공유는 어느 수정안에도 없습니다.

## ≥5% self+children 귀속의 빠짐 확인

self+children은 inclusive total입니다. self와 total을 더하지 않습니다. 모든 pooled ≥5% 프레임을 아래에 기록했습니다. 위임 부모는 자손 상한을 다시 독립 이득으로 더하지 않았습니다. VM/드라이버는 분모에 남긴 범위이며 독립 제품 owner의 개선안으로 만들지 않았습니다.

| fixture / 모드 | 함수 | self / total % | 상한 ID / 귀속 |
| --- | --- | --- | --- |
| flat-100 / first | `(idle)` · `(V8)` | 17.89 / 17.89 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / first | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 6.76 / 23.79 | C1, D1 |
| flat-100 / first | `(program)` · `(V8)` | 6.20 / 6.20 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / first | `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 6.04 / 13.69 | D1, E1 |
| flat-100 / first | `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts` | 5.60 / 11.13 | O1, A1 |
| flat-100 / first | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 5.52 / 74.82 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / first | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 5.04 / 59.77 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-100 / first | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 3.73 / 28.12 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-100 / first | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 3.68 / 17.33 | Q1, O1, R1 |
| flat-100 / first | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 2.34 / 64.96 | F1, D1, E1, C1, O1 |
| flat-100 / first | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.40 / 70.19 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / first | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.28 / 66.47 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / first | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.22 / 66.69 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / first | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / first | `setValue` · `src/core/SchemaNode/SchemaNode.ts` | 0.00 / 64.96 | F1, D1, E1, C1, O1 |
| flat-100 / later | `(idle)` · `(V8)` | 22.99 / 22.99 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 15.54 / 63.82 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `(program)` · `(V8)` | 11.18 / 11.18 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts` | 5.54 / 5.54 | E1, D1 |
| flat-100 / later | `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 4.19 / 15.35 | D1, E1 |
| flat-100 / later | `clear` · `(V8)` | 3.92 / 7.20 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 3.84 / 29.71 | C1, D1 |
| flat-100 / later | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 1.00 / 6.00 | Q1, O1, R1 |
| flat-100 / later | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.66 / 46.62 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.60 / 55.15 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 0.27 / 41.66 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-100 / later | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 45.95 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 0.00 / 44.56 | F1, D1, E1, C1, O1 |
| flat-100 / later | `setValue` · `(V8)` | 0.00 / 44.56 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-100 / later | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 0.00 / 30.25 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-100 / later | `mark` · `(V8)` | 0.00 / 5.54 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / first | `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts` | 24.99 / 28.60 | O1, A1 |
| flat-500 / first | `(program)` · `(V8)` | 7.99 / 7.99 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / first | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 5.15 / 83.91 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / first | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 4.38 / 34.79 | Q1, O1, R1 |
| flat-500 / first | `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 4.23 / 11.20 | D1, E1 |
| flat-500 / first | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 4.20 / 20.52 | C1, D1 |
| flat-500 / first | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 3.28 / 70.05 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-500 / first | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 1.85 / 23.12 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-500 / first | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 1.43 / 75.30 | F1, D1, E1, C1, O1 |
| flat-500 / first | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.58 / 80.89 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / first | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.10 / 77.67 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / first | `setValue` · `src/core/SchemaNode/SchemaNode.ts` | 0.06 / 75.36 | F1, D1, E1, C1, O1 |
| flat-500 / first | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / first | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 77.71 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts` | 14.74 / 25.88 | O1, A1 |
| flat-500 / later | `(idle)` · `(V8)` | 12.68 / 12.68 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 7.59 / 78.16 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `(program)` · `(V8)` | 6.92 / 6.92 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `markCommitDeliveries` · `(V8)` | 4.37 / 11.61 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `assembleObject` · `src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts` | 4.09 / 6.01 | A1, O1 |
| flat-500 / later | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 2.66 / 23.91 | C1, D1 |
| flat-500 / later | `markWrite` · `src/core/settle/utils/write/markWrite.ts` | 1.98 / 6.41 | W1 |
| flat-500 / later | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 1.72 / 26.52 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-500 / later | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.86 / 74.25 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 0.55 / 27.62 | Q1, O1, R1 |
| flat-500 / later | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 0.48 / 66.94 | F1, D1, E1, C1, O1 |
| flat-500 / later | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 0.17 / 63.07 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| flat-500 / later | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 68.20 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 68.28 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| flat-500 / later | `setValue` · `(V8)` | 0.00 / 66.94 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / first | `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 8.38 / 18.55 | D1, E1 |
| nested-d5-f4 / first | `(idle)` · `(V8)` | 7.06 / 7.06 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / first | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 6.35 / 22.86 | Q1, O1, R1 |
| nested-d5-f4 / first | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 5.87 / 27.66 | C1, D1 |
| nested-d5-f4 / first | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 4.77 / 76.40 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| nested-d5-f4 / first | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 4.35 / 88.48 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / first | `markWrite` · `src/core/settle/utils/write/markWrite.ts` | 2.78 / 6.54 | W1 |
| nested-d5-f4 / first | `registerRecalculation` · `src/core/settle/utils/write/registerRecalculation.ts` | 2.63 / 7.11 | R1 |
| nested-d5-f4 / first | `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts` | 2.44 / 12.47 | O1, A1 |
| nested-d5-f4 / first | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 2.28 / 30.70 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| nested-d5-f4 / first | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 1.60 / 80.80 | F1, D1, E1, C1, O1 |
| nested-d5-f4 / first | `mark` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 1.29 / 5.49 | D1, E1 |
| nested-d5-f4 / first | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.29 / 85.76 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / first | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.15 / 83.02 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / first | `setValue` · `src/core/SchemaNode/SchemaNode.ts` | 0.14 / 80.95 | F1, D1, E1, C1, O1 |
| nested-d5-f4 / first | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / first | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 83.02 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `(idle)` · `(V8)` | 9.52 / 9.52 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts` | 8.20 / 19.13 | O1, A1 |
| nested-d5-f4 / later | `markSchemaNodeEvent` · `src/core/record/utils/markSchemaNodeEvent.ts` | 7.86 / 7.86 | E1, D1 |
| nested-d5-f4 / later | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 5.65 / 84.17 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 4.42 / 31.43 | Q1, O1, R1 |
| nested-d5-f4 / later | `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 4.35 / 17.01 | D1, E1 |
| nested-d5-f4 / later | `registerRecalculation` · `src/core/settle/utils/write/registerRecalculation.ts` | 1.97 / 5.86 | R1 |
| nested-d5-f4 / later | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 1.50 / 30.75 | C1, D1 |
| nested-d5-f4 / later | `markCommitDeliveries` · `(V8)` | 1.13 / 7.08 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 0.61 / 73.30 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| nested-d5-f4 / later | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 0.48 / 31.23 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| nested-d5-f4 / later | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.38 / 80.96 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `mark` · `(V8)` | 0.15 / 8.01 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `setValue` · `(V8)` | 0.13 / 76.65 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 77.77 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 77.77 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| nested-d5-f4 / later | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 0.00 / 76.52 | F1, D1, E1, C1, O1 |
| sample-0 / first | `(idle)` · `(V8)` | 14.53 / 14.53 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / first | `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 8.47 / 17.76 | D1, E1 |
| sample-0 / first | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 8.27 / 29.73 | C1, D1 |
| sample-0 / first | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 7.29 / 77.20 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / first | `(program)` · `(V8)` | 6.12 / 6.12 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / first | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 4.08 / 59.51 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| sample-0 / first | `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts` | 3.86 / 9.82 | O1, A1 |
| sample-0 / first | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 3.07 / 33.44 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| sample-0 / first | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 2.96 / 14.40 | Q1, O1, R1 |
| sample-0 / first | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 1.31 / 65.88 | F1, D1, E1, C1, O1 |
| sample-0 / first | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.44 / 70.82 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / first | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.37 / 67.17 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / first | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / first | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 66.80 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / first | `setValue` · `src/core/SchemaNode/SchemaNode.ts` | 0.00 / 65.88 | F1, D1, E1, C1, O1 |
| sample-0 / later | `(idle)` · `(V8)` | 18.48 / 18.48 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / later | `markCommitDeliveries` · `src/core/settle/utils/commit/markCommitDeliveries.ts` | 9.07 / 21.24 | D1, E1 |
| sample-0 / later | `commitSettlement` · `src/core/settle/utils/commit/commitSettlement.ts` | 8.87 / 32.98 | C1, D1 |
| sample-0 / later | `measuredPlain` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 6.77 / 71.34 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / later | `(garbage collector)` · `(V8)` | 5.08 / 5.08 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / later | `writeSchemaNode` · `src/core/settle/utils/write/writeSchemaNode.ts` | 4.19 / 55.28 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| sample-0 / later | `computeNode` · `src/core/settle/utils/compute/computeNode.ts` | 2.45 / 10.50 | Q1, O1, R1 |
| sample-0 / later | `updateOutput` · `src/core/settle/utils/compute/updateOutput.ts` | 1.48 / 6.83 | O1, A1 |
| sample-0 / later | `finishSettlement` · `src/core/settle/utils/settlement/finishSettlement.ts` | 1.47 / 34.74 | F1, P1, W1, R1, Q1, O1, C1, D1 |
| sample-0 / later | `dispatchSetValue` · `src/core/dispatch/utils/entry/dispatchSetValue.ts` | 0.57 / 60.72 | F1, D1, E1, C1, O1 |
| sample-0 / later | `setValue` · `src/core/SchemaNode/SchemaNode.ts` | 0.17 / 60.89 | F1, D1, E1, C1, O1 |
| sample-0 / later | `write` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.15 / 62.17 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / later | `(anonymous)` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.07 / 62.24 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / later | `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs` | 0.00 / 64.71 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |
| sample-0 / later | `(root)` · `(V8)` | 0.00 / 100.00 | VM/측정 드라이버: 분모에 유지. 제품 owner가 없어 독립 수정안 없음. GC 할당 몫은 A1/O1/E1/S1에 겹치며 강제 GC 위치를 바꿔 독립 판정 상한으로 만들지 않음. |

## 실행 감사·한계·재현

유효 worker 472개: 공식 12, 제거 실험/A/A 414, CPU 42(최종 실행 창 24개와 초기 전체 끝점 탐색 18개), 끝점 진단 4. 모두 code=0, signal=null, natural=true입니다. 측정 timeline 겹침은 0이며 각 subprocess는 정상 종료했습니다. esbuild는 두 bundle을 메모리에서 만든 뒤 stdin EOF로 종료했고 timing 시작 전에 끝났습니다. 최대 worker 내부 경과 5908 ms; 확장 묶음은 427.840 / 322.948 / 201.889 / 102.639초입니다. 8분을 넘는 실행 명령, 강제 kill, background 측정은 없습니다.
산출물은 profile-109-update/의 JSON·mjs와 요청한 보고서/summary뿐입니다. 현재 원시/도구 파일 최대 163749 bytes로 각 5 MB 이하입니다. write:false bundle/map은 메모리에서만 사용했고 TMPDIR/sourceURL/outfile 위치는 지정된 저장소 밖 bundles입니다. Node compile cache는 비활성화했습니다. tracked diff는 없으며 HEAD를 끝에 다시 확인했습니다. Git 쓰기·설치·제품 test/build는 실행하지 않았습니다.

- 준비 단계 기록: 기본 yarn node가 Node 24로 실행되어 버전 단언에서 exit 1; 이후 기존 Node 26.10.0 실행 파일을 명시함
- 준비 단계 기록: 진단 프로파일 출력 준비 중 두 번 stdout 전송 한도 초과; 공식 표본 계열에 속하지 않으며 판정에 사용하지 않음. gzip 원문과 해시로 수정하여 유효 진단 원문 보존
- 준비 단계 기록: sample-0 필터 어댑터 누락과 두 번째 esbuild 서비스 사용 준비가 각각 exit 1; 표본 루프 전에 종료. 필터 및 두 번 빌드 후 stdin EOF 종료를 수정함

- 제거/재생 변형은 고정 픽스처의 작업 비용을 귀속하는 관측 상한이며 수학적인 무오버헤드 상한이 아닙니다. guard/replay 및 JIT 차이가 남습니다.
- A1/O1의 tape는 측정에서만 폼 밖 참조를 재생합니다. 수정안은 폼 간 공유를 하지 않습니다. 값 digest의 일치는 일반 참조·오류·구독자 계약의 검증이 아닙니다.
- E1/D1은 필수 revision/payload/global-state 일을 제거합니다. 이 전체를 제품에서 생략하는 변경은 제안하지 않습니다.
- 105C-01의 회귀 행은 해당 제거 변형의 결과입니다. 실제 수정안의 채택에는 계약 확인 뒤 그 변경 하나의 새로운 판정이 필요합니다.
- CPU의 inline 비용은 caller self에 잡힐 수 있고 짧은 샘플 구간은 인접 드라이버 프레임과 섞일 수 있습니다. GC/program/idle은 분모에 그대로 두고 verdict 시간으로 환산하지 않습니다.

재현 CLI(한 worker씩, 순차 실행):

```sh
TMPDIR='/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles' NODE_DISABLE_COMPILE_CACHE=1 GIT_OPTIONAL_LOCKS=0 yarn exec /opt/homebrew/Cellar/node/26.10.0_2/bin/node --expose-gc packages/canard/schema-form/architecture/verification/07-switch/profile-109-update/measure.mjs --official flat-100 off 1 old
```

동일 prefix로 --cpu <fixture> <first|later> <1|2|3>, --bound <fixture> <variant> <run>, --diagnose <fixture> <run> <original|shadow-unprofiled>를 실행합니다. official은 원 세 회차 순서를 유지하고 bound는 raw 파일의 3/9 회차 수를 유지합니다. stats.mjs --official/--historical/--bounds와 report.mjs --summary/--markdown은 stdout artifact renderer입니다. stdout은 native 파일 도구로 보존합니다. 원문·해시·시계 창·303/909쌍·진단·회차별 잡음은 [원시 자료](profile-109-update/)와 [구조화 요약](profile-109-update-summary.json)에 있습니다.
