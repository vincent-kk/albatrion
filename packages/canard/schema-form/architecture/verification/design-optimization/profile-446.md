# 446라운드 CPU 프로파일 — 마운트·분기 전환·일괄 쓰기의 자기 시간과 단계별 비중

2026-10-26. 설계 최적화 단계(`../../plan/design-optimization/request.md`)를 열기 전에 현재 코어 엔진의 시간이 어디에 쓰이는지 잰 기록이다. 측정 대상은 `dist/index.mjs`(sha256 `7d82da3d…c7f`, 마지막 제품 커밋 `c62818ab4` 뒤의 빌드)이고 옛 판은 npm 공개판 `@canard/schema-form@0.16.0` 번들(sha256 `78362ee2…1b2`)이다. dist는 minify하지 않으므로 함수 이름이 그대로이며, 줄 번호는 번들의 `//#region src/...` 표지로 원본 파일에 되돌렸다. 아래 경로는 `src/core/` 기준이고 줄은 함수 선언 줄이다.

**측정 조건의 한계.** 측정 중 다른 에이전트가 동시에 벤치를 돌려 부하 평균이 26~73이었다. 절대 밀리초는 부풀려지고 흔들리므로, 같은 프로세스에서 두 판을 번갈아 잰 쌍 비율과 프로파일 백분율만 쓴다. 조용한 창의 정식 수치는 D0 기준선(`../../plan/design-optimization/request.md` D0)이 다시 잰다.

## 1. 장면

- **mount** — `bench/legacy-compare/node-and-settle.bench.ts`의 B6(flat 10,000 혼합 잎, 청사진 미리 계산, `fieldNodeFactory` + `loadFieldNodeAtMount(Overwrite)`). 옛 판은 `loadLegacyEngine`과 같은 `nodeFromJSONSchema` + `materializeMountedValues`. **mount-bp**는 같은 장면에 `blueprint(schema)`를 반복마다 포함한다(B6은 청사진 비용을 뺀다).
- **switch** — `src/core/__benchmarks__/event-cascade.bench.ts`의 oneOf 스키마(판별자 `type` a/b, 분기마다 x·y)에서 `find('type').setValue`를 왕복. 옛 판은 `controls.active` 대신 `computed: { if: "./type === 'a'" }`. 변형 **switch-distinct**(분기 키 a_x/a_y, b_x/b_y)와 **switch-wide**(같은 스키마에 형제 number 필드 `pad_i` 1,000개).
- **wave** — `dispatch-and-validation` EVENT-004 파동: number 필드 1,000개에 모두 구독을 걸고 루트 `setValue`로 `waveValue(0)`/`waveValue(1)`을 번갈아 씀(새 판은 쓰기마다 배달 정확히 1,000, 옛 판은 마이크로태스크 8번 뒤 1,000 이상).
- **leaf-wide**, **leaf-wide-oneof** — 형제 4,000개 옆의 잎 하나(`pad_7`) 쓰기, 루트 oneOf 없음/있음.

**의미 차이 하나.** 정확한 switch 픽스처에서 새 판은 두 분기의 같은 이름 `x`를 노드 하나로 공유하고 값을 유지하며('A'가 b로 바꾼 뒤에도 'A'), 옛 판은 분기별 노드를 만들고 분기 기본값('B', 2)을 넣는다(ADR 0005 노드 공유). 그래서 픽스처 검사는 판별자 값과(distinct 변형은 분기 키의 존재까지) 본다.

## 2. 벽시계 쌍 비율 (같은 프로세스, 두 판 교대, 표본 21, 반복 둘)

반복마다 untimed `setTimeout(0)` 양보를 한 번 둔다(옛 판은 빡빡한 루프에서 `INFINITE_LOOP_DETECTED`를 던진다). 옛 판 쓰기 시간은 공개 파동 벤치대로 마이크로태스크 8번의 대기를 포함한다. "hot"은 양보 없는 빡빡한 루프의 새 판 수치다.

| 장면 | 새 판 ms | 옛 판 ms | 새/옛 (반복 1, 2) | 새 판 hot ms |
| --- | --- | --- | --- | --- |
| mount (B6) | 46.8 | 41.6 | 1.16, 1.06 | — |
| mount-bp | 132.3 | 54.7 | 2.41, 2.50 | — |
| switch (정확) | 0.31 | 0.097 | 2.72, 3.30 | 0.018~0.05 |
| switch-distinct | 0.52 | 0.082 | 4.84, 4.56 | 0.05~0.11 |
| switch-wide | 5.7 | 4.6 | 1.13, 1.12 | 3.8 |
| wave (일괄) | 2.76 | 1.25 | 2.09, 2.17 | 2.6 |
| leaf-wide | 0.88 | 2.73 | 0.35, 0.32 | 0.82 |
| leaf-wide-oneof | 1.80 | 2.63 | 0.68, 0.68 | 1.73 |

ms 열은 반복 2의 값이다. 별도 프로세스의 앞선 마운트 측정은 33.2 ms 대 32.2 ms(비율 1.03)였다.

크기에 따른 추세(새 판, 중앙값 ms, 부하가 높은 기계이므로 모양만 본다):

- 청사진 1k/2.5k/5k/10k/20k 필드: 13.6 / 33.8 / 57.8 / 133 / 272 (선형).
- 마운트 같은 크기: 10.7 / 21.4 / 56.7 / 139 / 236 (대략 선형).
- 분기 전환, 형제 0/100/1,000/4,000: 0.13 / 1.15 / 7.96 / 41.5 (형제 수에 선형).
- 일괄 쓰기 250/1,000/4,000 필드: 1.27 / 6.2 / 39.
- 잎 하나 쓰기, 형제 250/1k/4k/8k, oneOf 없음: 새 판 0.21 / 0.24 / 1.18 / 3.39, 옛 판 0.26 / 0.81 / 3.06 / 13.0.
- 같은 장면, oneOf 있음: 새 판 0.25 / 0.53 / 4.62 / 9.09, 옛 판 0.35 / 1.43 / 5.93 / 13.6.

## 3. 자기 시간 상위 (측정 루프만, 약 5초 창, 200 µs 표본)

형식: 함수, 원본 파일:줄, 자기 ms, 자기 %, 포함 %.

### mount (5002 ms, GC 10.7 %)

| 순위 | 함수 | 파일:줄 | 자기 ms | 자기 % | 포함 % |
| --- | --- | --- | --- | --- | --- |
| 1 | markCommitDeliveries | engine/settle/utils/commit/markCommitDeliveries.ts:30 | 616.7 | 12.3 | 27.1 |
| 2 | selectEntryStep | engine/settle/utils/compute/childSelection/selectEntryStep.ts:73 | 591.3 | 11.8 | 38.3 |
| 3 | (garbage collector) | — | 534.6 | 10.7 | — |
| 4 | markFieldNodeEvent | engine/record/utils/markFieldNodeEvent.ts:12 | 388.8 | 7.8 | 7.8 |
| 5 | markWrite | engine/settle/utils/input/markWrite.ts:34 | 354.6 | 7.1 | 13.4 |
| 6 | selectChildren | engine/settle/utils/compute/childSelection/selectChildren.ts:39 | 342.1 | 6.8 | 45.3 |
| 7 | transitionSettlement | engine/settle/utils/transition/transitionSettlement.ts:26 | 184.3 | 3.7 | 3.7 |
| 8 | DirtyPathSet.add | engine/settle/utils/scratch/DirtyPathSet.ts:107 | 170.3 | 3.4 | 3.4 |
| 9 | commitSettlement | engine/settle/utils/commit/commitSettlement.ts:32 | 169.1 | 3.4 | 30.6 |
| 10 | (closure) | engine/settle/utils/commit/commitSettlement.ts | 147.2 | 2.9 | 4.0 |
| 11 | createFieldNode | surface/utils/fieldNodeFactory.ts:77 | 143.2 | 2.9 | 3.5 |
| 12 | computeNodeBody | engine/settle/utils/compute/computeNode.ts:33 | 128.2 | 2.6 | 48.4 |
| 13 | DirtyPathSet.delete | engine/settle/utils/scratch/DirtyPathSet.ts:168 | 124.5 | 2.5 | 2.5 |
| 14 | nextExtras | engine/settle/utils/input/nextExtras.ts:14 | 121.8 | 2.4 | 2.4 |
| 15 | writeObjectKey | engine/utils/writeObjectKey.ts:2 | 112.9 | 2.3 | 2.3 |
| 16 | finishSettlement | engine/settle/utils/settlement/finishSettlement.ts:23 | 112.2 | 2.2 | 36.6 |
| 17 | mergeEffectiveSchema | engine/blueprint/effectiveSchema/utils/merge/mergeEffectiveSchema.ts:28 | 89.9 | 1.8 | 1.8 |
| 18 | commitGlobalState | engine/settle/utils/commit/commitGlobalState.ts:19 | 79.1 | 1.6 | 1.6 |
| 19 | enterFieldNode | engine/settle/utils/compute/enterFieldNode.ts:19 | 69.0 | 1.4 | 12.8 |
| 20 | updateOutput | engine/settle/utils/output/updateOutput.ts:18 | 45.0 | 0.9 | 4.1 |

### switch, 정확한 픽스처 (5000 ms, GC 3.0 %)

| 순위 | 함수 | 파일:줄 | 자기 ms | 자기 % | 포함 % |
| --- | --- | --- | --- | --- | --- |
| 1 | markCommitDeliveries | markCommitDeliveries.ts:30 | 521.9 | 10.4 | 19.5 |
| 2 | markFieldNodeEvent | markFieldNodeEvent.ts:12 | 367.2 | 7.3 | 7.3 |
| 3 | selectEntryStep | selectEntryStep.ts:73 | 327.6 | 6.6 | 21.9 |
| 4 | computeNodeBody | computeNode.ts:33 | 244.4 | 4.9 | 53.7 |
| 5 | assembleObject | engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:21 | 218.8 | 4.4 | 4.9 |
| 6 | commitSettlement | commitSettlement.ts:32 | 213.0 | 4.3 | 24.3 |
| 7 | selectEffectiveDeclarations | engine/blueprint/effectiveSchema/utils/merge/selectEffectiveDeclarations.ts:10 | 186.1 | 3.7 | 4.3 |
| 8 | (garbage collector) | — | 149.6 | 3.0 | — |
| 9 | registerRecalculation | engine/settle/utils/dependencies/registerRecalculation.ts:18 | 147.7 | 3.0 | 6.4 |
| 10 | primeHost | engine/settle/utils/compute/primeHost.ts:31 | 123.4 | 2.5 | 2.7 |
| 11 | selectChildren | selectChildren.ts:39 | 122.8 | 2.5 | 28.7 |
| 12 | selectNodeSchema | engine/settle/utils/compute/selectNodeSchema.ts:24 | 106.2 | 2.1 | 9.4 |
| 13 | mergeEffectiveSchema | mergeEffectiveSchema.ts:28 | 101.1 | 2.0 | 6.5 |
| 14 | evaluateGateValue | engine/settle/utils/gates/evaluateGate.ts:32 | 94.5 | 1.9 | 6.3 |
| 15 | affected | engine/settle/utils/dependencies/getDependencyIndex.ts:344 | 88.1 | 1.8 | 2.2 |
| 16 | flushRead | engine/settle/utils/gates/flushPendingGateReads.ts:96 | 88.1 | 1.8 | 2.6 |
| 17 | updateOutput | updateOutput.ts:18 | 86.4 | 1.7 | 8.1 |
| 18 | readProjectedValue | engine/settle/utils/gates/readProjectedValue.ts:30 | 79.9 | 1.6 | 2.6 |
| 19 | locate | engine/settle/utils/gates/getGateRegistry.ts:173 | 68.7 | 1.4 | 1.6 |
| 20 | releaseSettlementScratch | engine/settle/utils/scratch/releaseSettlementScratch.ts:9 | 64.1 | 1.3 | 1.7 |

### wave, 일괄 쓰기 (5003 ms, GC 1.2 %)

| 순위 | 함수 | 파일:줄 | 자기 ms | 자기 % | 포함 % |
| --- | --- | --- | --- | --- | --- |
| 1 | markCommitDeliveries | markCommitDeliveries.ts:30 | 749.4 | 15.0 | 26.5 |
| 2 | hasOwnProperty | @winglet/common-utils | 560.4 | 11.2 | 11.2 |
| 3 | markFieldNodeEvent | markFieldNodeEvent.ts:12 | 441.9 | 8.8 | 8.8 |
| 4 | markWrite | markWrite.ts:34 | 344.4 | 6.9 | 19.5 |
| 5 | assembleObject | assembleObject.ts:21 | 341.3 | 6.8 | 14.1 |
| 6 | updateOutput | updateOutput.ts:18 | 249.3 | 5.0 | 19.2 |
| 7 | DirtyPathSet.add | DirtyPathSet.ts:107 | 228.7 | 4.6 | 4.6 |
| 8 | deliverWave | engine/write/utils/chain/deliverWave.ts:26 | 206.1 | 4.1 | 8.7 |
| 9 | compareDocumentOrder | engine/write/utils/chain/utils/compareDocumentOrder.ts:10 | 200.1 | 4.0 | 4.0 |
| 10 | commitSettlement | commitSettlement.ts:32 | 185.4 | 3.7 | 30.3 |
| 11 | writeObjectKey | writeObjectKey.ts:2 | 177.4 | 3.5 | 3.5 |
| 12 | computeStableNode | engine/settle/utils/compute/utils/computeStableNode.ts:14 | 172.3 | 3.4 | 30.6 |
| 13 | nextExtras | nextExtras.ts:14 | 134.9 | 2.7 | 2.7 |
| 14 | registerRecalculation | registerRecalculation.ts:18 | 133.5 | 2.7 | 3.0 |
| 15 | dirtyChildren | engine/settle/utils/compute/dirtyChildren.ts:16 | 116.2 | 2.3 | 6.4 |
| 16 | finishSettlement | finishSettlement.ts:23 | 90.3 | 1.8 | 32.7 |
| 17 | DirtyPathSet.consume | DirtyPathSet.ts:285 | 74.2 | 1.5 | 1.5 |
| 18 | keepsHostKeys | engine/settle/utils/input/utils/keepsHostKeys.ts:15 | 71.2 | 1.4 | 5.0 |
| 19 | runDeliveryWaves | engine/write/utils/chain/runDeliveryWaves.ts:11 | 54.4 | 1.1 | 9.8 |
| 20 | writeFieldNode | engine/settle/utils/write/writeFieldNode.ts:40 | 40.2 | 0.8 | 86.7 |

추가 장면의 상위 자기 %:

- switch-wide: selectChildren 20.8, hasOwnProperty 16.6, computeNodeBody 14.5, writeObjectKey 9.7, selectEntryStep 8.8, assembleObject 8.3, primeHost 6.2, updateOutput 3.2, 게이트 레지스트리 register 1.8.
- switch-distinct: markCommitDeliveries 4.8, GC 3.4, markFieldNodeEvent 3.3, updateInactiveValuesMemo 3.0(포함 9.4), selectEntryStep 3.0, setLatentRaw 2.9(포함 7.8), 게이트 레지스트리 register 2.8, affectedByPresence 2.7 — 평평한 프로파일, 두드러진 지점 없음.
- mount-bp: buildNodes 16.1(blueprint 포함 43.0), GC 15.4, collectDeclarations 5.7, appendChildEntries 5.5, populateNodeChildren 3.6, freezeEffectiveSchema 2.9.
- leaf-wide-oneof: sameValue 46.0, assembleObject 43.0, computeNodeBody 6.8.
- leaf-wide: assembleObject 94.3.

## 4. 단계별 포함 시간 (측정 창의 %)

| 단계 | mount | mount-bp | switch | switch-wide | wave | leaf-wide-oneof |
| --- | --- | --- | --- | --- | --- | --- |
| blueprint | — | 43.0 | — | — | — | — |
| loadFieldNodeAtMount 또는 writeFieldNode | 88.1 | 39.9 | 77.0 | 97.1 | 86.8 | 98.3 |
| markWrite(입력 분배) | 13.2 | 5.3 | 0.7 | 0.1 | 20.3 | 0.1 |
| computeNode(파생 라운드 포함) | 48.6 | 24.5 | 43.6 | 93.2 | 30.6 | 96.5 |
| selectChildren | 45.5 | 23.0 | 12.5 | 46.6 | — | — |
| updateOutput / assembleObject | 4.4 / 2.7 | 2.1 / 1.3 | 1.9 / 1.6 | 24.1 / 20.9 | 19.1 / 14.2 | 43.3 / 43.0 |
| preserveReferences(sameValue) | — | — | 0.3 | 0.3 | — | 46.0 |
| 게이트(evaluateGate / 레지스트리 register) | — | — | 10.7 / — | 0.2 / 1.8 | — | — |
| 의존 색인(registerRecalculation / affected) | — | — | 6.4 / 5.5 | 0.3 / 0.1 | 3.3 / 0.1 | — |
| finishSettlement | 37.6 | 13.8 | 22.2 | 3.3 | 31.7 | 1.0 |
| commitSettlement | 29.6 | 11.5 | 17.3 | 3.2 | 29.6 | 0.7 |
| markCommitDeliveries | 26.6 | 10.4 | 11.0 | 0.7 | 26.5 | 0.4 |
| markFieldNodeEvent | 7.3 | 2.9 | 5.8 | 0.2 | 8.8 | 0.1 |
| 배달 파동(runDeliveryWaves) | — | — | 0.3 | 0.1 | 9.8 | — |
| 경로 색인 add/delete/set(DirtyPathSet·PathKeyedMap·PathStoreIndex) | 5.6 | 2.5 | 0.8 | 1.6 | 5.4 | 0.2 |
| GC | 10.2 | 15.4 | 12.2(재실행 3.0) | 1.7 | 1.2 | 0.9 |

switch-distinct에서는 잠복·비활성 값 장부가 보인다: setLatentRaw 7.8, updateInactiveValuesMemo 9.4, PathKeyedMap.set 7.3.

## 5. 호출 수와 할당

호출 수(V8 precise coverage, 엔진 함수만):

- mount: 10k 노드 마운트에 943,525회, 노드당 약 94회. 노드마다 `path` getter 12회, markFieldNodeEvent 2회, mergeEffectiveSchema 2회(청사진이 캐시되어 있어도).
- wave: 쓰기당 68,141회, 자식당 약 68회. 자식마다 `path` 9회, sameValue 2회, markFieldNodeEvent 2회, DirtyPathSet.add 2회, compute 1회.
- switch: 681회. switch-distinct: 1,165회.
- switch-wide: 35,681회. 자식 1,003개마다 selectEntryStep, getChildDistribution, readAdmittedEdgeSchema, staticIds, mergeEffectiveSchema, getCommittedDeclarationKey, PathKeyedMap.set 1회씩과 게이트 레지스트리 register 2회, writeObjectKey 2회, `active` set 2회, captureFieldNodeChange 2회.
- leaf-wide, leaf-wide-oneof: 174회와 240회(상수). 형제당 비용은 호출이 아니라 루프 안에 있다.

할당(sampling heap profiler, 수거된 객체 포함):

- mount: 10k 마운트에 38 MB, 노드당 약 3.8 KB. Set/Map 성장(add 16 %, delete 8 %, set 7 %, Map 5 %), markFieldNodeEvent 14 %(pendingDelivery 객체와 Set add 둘), markCommitDeliveries 13 %, createFieldNode 13 %.
- switch: 전환당 29 KiB. Set 11 %, markCommitDeliveries 10 %, Map 7.5 %, releaseSettlementScratch 6 %, mergeEffectiveSchema 5 %.
- switch-wide: 전환당 6.1 MB. assembleObject 45 %, primeHost 23 %, selectChildren 21 %.
- wave: 쓰기당 4.5 MB. assembleObject 29 %, markCommitDeliveries 20 %, compareDocumentOrder 9.5 %, deliverWave 6.7 %.
- leaf-wide-oneof: 쓰기당 651 KiB. assembleObject 59 %, Object.keys 38 %.

## 6. 해석

- **mount**(청사진 캐시 시 1.0~1.16, 포함 시 2.4~2.5). 전체 노드에 대한 로드 정착 하나이며 선형이다. 약 절반이 파생(자식 선택 45 % 포함: 로드에서 모든 호스트가 자식마다 일반 선택 경로를 탄다, selectEntryStep 11.8 % 자기), 약 3분의 1이 커밋과 배달 표식(finishSettlement 37.6 % 포함: markCommitDeliveries가 커밋마다 Set 여러 개를 만들고 노드 출처 여섯을 돌며, 구독이 없어도 노드마다 이벤트 2회를 표시한다). 입력 분배(markWrite + nextExtras) 약 15 %. GC 10.7 %는 노드당 약 3.8 KB, 대부분 경로 키 스크래치의 Set/Map 성장과 노드별 pendingDelivery 객체. 청사진을 포함하면 청사진 43 %(buildNodes 16 % 자기), GC 15.4 %가 되며 이것이 옛 판 대비 첫 렌더 격차의 실체다. 공개된 B6 행은 청사진을 미리 만들어 이를 숨긴다.
- **switch**, 정확(2.7~3.3배)과 distinct(4.6~4.8배). 노드 3개만 건드리므로 비용은 트리가 아니라 정착 1회의 고정 장치다 — 커밋과 배달 표식(markCommitDeliveries 19.5 % 포함, 커밋마다 새 Set), 게이트 평가와 투영 읽기(약 11 %), 유효 스키마 재선택과 병합(selectNodeSchema 9.4 %, selectEffectiveDeclarations + mergeEffectiveSchema 약 8 %), 의존 색인(registerRecalculation 6.4 %, affected 2.2 %). 전환당 29 KiB, 대부분 Set/Map 스크래치. distinct 변형은 잠복 원본 저장, 비활성 값 메모, 존재 추적, 경로 색인 유지가 더해지며 각각은 작고 약 230개 함수에 퍼져 있다. 옛 판은 이 픽스처에서 노드를 바꾸고 기본값을 넣는 더 많은 의미 작업을 하면서도 3배 빠르므로, 격차는 라운드별 장부 비용이다.
- **switch-wide**. 노드 하나의 연산에 트리 전체 비용이 드는 가장 또렷한 예다. 판별자 한 번이 루트 호스트를 다시 계산하고 루트가 자식 1,003개를 모두 다시 고른다: 자식마다 selectEntryStep, 유효 스키마 병합, 게이트 레지스트리 등록 2회, `active` 쓰기 2회, 변경 캡처 2회. `{ ...node.structure }`와 `Object.setPrototypeOf(next, null)`(`selectChildren.ts:114-115`)로 구조를 복사하고 루트 객체를 두 번(computeNodeBody와 flushPendingOutput) 조립한다. 직접 원인은 `selectChildren.ts:53`의 `if (!context.hasGates && node.behavior.type === 'object')`다 — 폼에 게이트가 하나라도 있으면 정적 형상 빠른 경로가 폼 전체에서 꺼진다. 형제 수에 선형(형제 0개 0.13 ms, 1,000개 약 8 ms, 4,000개 약 41 ms). 옛 판도 여기서 늘어나므로(비율 1.12) 옛 판 대비 회귀는 아니지만 가장 큰 구조적 목표다.
- **wave**(2.1~2.2배). 자식 1,000개를 실제로 쓰므로 선형은 당연하고, 문제는 자식당 엔진 호출 약 68회와 할당 약 4.5 KB의 상수다. 배달 표식 26.5 %(markCommitDeliveries + markFieldNodeEvent), hasOwnProperty 11 %(1,000키 사전 모드 객체에 자식당 약 3회: dirtyChildren, keepsHostKeys, assembleObject), 입력 분배(markWrite) 19.5 %, 루트 객체 조립 14 %, 배달 팬아웃 9.8 %(deliverWave가 문서 순서로 정렬하며 비교자가 비교마다 조상 배열 둘을 할당한다, `compareDocumentOrder.ts:16-17`, 쓰기당 425 KiB, n log n 비교; 리스너 집합을 `[...listeners]`로 복사한다, `deliverWave.ts:40`).
- **잎 하나 쓰기**(새 판이 빠름, 0.32~0.68). 두 판 모두 부모 객체를 다시 만들어 잎 하나 쓰기가 O(N)이다. 새 판은 `assembleObject.ts:61/111/242`의 `{ ...previous }` 패치 복사가 게이트 없는 쓰기의 94 %다. 폼에 게이트가 있으면 `preserveReferences.ts:28·30`이 호스트의 이전 local과 emit 전체를 sameValue로 깊은 비교해 양쪽에 4,000키 Object.keys를 쓰기마다 두 번 하며 시간의 46 %를 더해 형제당 비용을 약 두 배로 만든다.

## 7. 재현

스크립트는 세션 임시 폴더(`/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/349f4da5-0121-4452-a71e-eb7f51d6cb4e/scratchpad/profile/`)에 있으며 D0가 `tools/`로 옮긴다. 그 폴더에서:

```
node prepare.mjs                                               # dist/index.mjs와 0.16.0 번들을 engines/에 복사하고 export 한 줄을 붙인다
node --import ./register.mjs run.mjs <장면> current profile 5   # prof/<장면>/loop.cpuprofile
node analyze.mjs prof/<장면> 25                                # 자기 시간 표와 prof/<장면>/summary.json
node tables.mjs <장면> 25                                      # 같은 표에 원본 파일:줄
node phases.mjs                                                # 장면 교차 포함 시간 표
node callers.mjs prof/<장면> fnA,fnB                           # 호출자 사슬별 자기 시간
node --import ./register.mjs compare.mjs <장면> 21             # 새 판 대 옛 판 쌍 벽시계
node --import ./register.mjs count.mjs <장면> <ops> <rows>     # 연산당 호출 수
node --import ./register.mjs heap.mjs <장면> 3                 # 연산당 함수별 할당
node --import ./register.mjs scale.mjs                         # 청사진·마운트·wave·switch의 크기 추세
node --import ./register.mjs leaf.mjs                          # 형제 수에 따른 잎 쓰기, 두 판
```

장면: mount, mount-bp, switch, switch-distinct, switch-wide, wave, leaf-wide, leaf-wide-oneof. 픽스처는 `fixtures.mjs`. 저장소 밖에 복사한 번들은 맨 import(`@winglet/*`, react)를 풀지 못하므로 `hooks.mjs`(`register.mjs`가 등록)가 원본 번들 위치에서 다시 푼다. `--cpu-prof`는 모듈 적재와 로더 훅 워커까지 잡으므로 inspector Profiler를 준비와 예열 20회 뒤에 켜고 루프 뒤에 끈다. `--no-turbo-inlining` 확인 프로파일도 같은 순위를 준다. 옛 판 엔진 자체의 프로파일과 Bun/JSC 실행은 하지 않았다.
