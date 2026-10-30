# F-B·F-C·F-F·F-E 합본의 array-1000 업데이트 회귀 진단

## 결론

**합본의 강제 GC 후 마운트 첫 업데이트 회귀는 재현됐습니다. 다만 이번 조사에서는 70–140 µs의 손실을 하나의 변경이나 하나의 V8 동작까지 확정하지 못했습니다.** `fd-a500`의 결론인 “마운트 보유량 때문에 후보에서만 구간 안 scavenge가 발생한다”를 이 사례에 그대로 적용하면 증거와 충돌합니다.

원래 하네스의 준비 절차를 유지한 17쌍에서 `base − candidate`의 update-wall 중앙값은 **−39.793 µs**, 95% 구간 **[−68.334, −24.126] µs**였습니다. 관측된 GC 정지 시간을 각 창에서 빼도 **−41.187 µs [−61.583, −18.251]**가 남았습니다. 후보의 scavenge 횟수와 전체 GC 정지 시간 합계는 오히려 줄었습니다. 따라서 **관측된 구간 안 GC 정지만으로 손실을 설명할 수 없습니다.** 마킹 중 쓰기 장벽, 백그라운드 작업, JIT·메모리 배치 효과까지 배제한 결과는 아닙니다.

쓰기 전 시계 밖 minor GC를 추가한 별도의 17쌍에서는 양쪽 510개 창 모두 GC가 없었고, 차이는 **−30.271 µs [−67.687, +12.021]**였습니다. 구간이 0을 포함하므로 이 조건의 손실은 확정되지 않습니다. 그러나 점 추정이 그대로 음수이므로 “minor GC로 회귀가 완전히 사라졌다”는 주장도 성립하지 않습니다.

호출 계측에서는 합본의 렌더·구독·Fiber 처리 횟수가 줄었습니다. 작은 증가도 있습니다. F-B는 shallow 비교 4회, F-F는 의존성 비교 4회, F-E는 revision ledger 비트 순회 5회를 더 수행합니다. 이 증가가 70–140 µs를 만든다는 시간 증거는 확보하지 못했습니다. **시간 손실이 확정된 귀속 단위는 현재 네 변경의 합본입니다.** F-E에는 보유 힙 감소와 GC 종류 변화가 귀속되지만, 단독 업데이트 손실은 귀속되지 않았습니다.

후속 하나씩 뺀 조합 비교에서는 합본 대조의 wall 손실 -38.145 µs가 다시 확인됐습니다. F-E를 뺀 F-B + F-C + F-F 조합은 wall -3.646 µs·active -3.042 µs로 0 근처이고 두 95% 구간 모두 0을 포함해, 요청하신 진단 기준에서 손실 해소가 관측됐습니다. F-F 제외는 손실 유지, F-B·F-C 제외는 미해결입니다. 우선 전체 판정을 돌릴 부분 조합은 F-E 제외이며 예상 비용은 약 267.7분입니다. 다만 합본 보유량 절감은 두 크기에서 약 12.5%만 남고, array-500 시간 이득은 예산상 미검증이므로 F-E의 보유량 이득까지 유지하려면 재구현·새 검증이 필요합니다.

## 근거

### 1. 조사 대상과 방법

- 작업 트리: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07`, HEAD `f22a7b89b8f17edd9977a280e3888e83442d9a72`입니다.
- D: `/Users/Vincent/Workspace/albatrion/.claude/worktrees/stage-07/packages/canard/schema-form/architecture/verification/07-switch`입니다.
- S: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad`입니다.
- 이하 B는 S의 `fbx-a1000-diag/`입니다. 스크립트·작업 명세·원시 JSON·GC 로그·요약·상태 검증은 모두 여기에 있습니다.
- 모든 프로브·빌드·분석은 `/Users/Vincent/.nvm/versions/node/v26.11.1/bin/node`를 사용했습니다. 프로세스마다 번들 하나를 로드했고, 타이밍 측정은 순차 실행했습니다. 판정 세션을 만들지 않았습니다.

`fd-a500-diagnosis.md`, `harness-131.md`, `fb-ff-fe-implementation.md`와 S의 두 진단 키트를 먼저 읽었습니다. `fd-a500-diag`의 호출 계측, ABBA 쌍별 비교, 창 경계와 V8 trace 연결 방법을 재사용했습니다. 초기의 간소화 프로브는 base에서 GC가 거의 없고 후보에서 자주 발생하는 약 3 ms 차이를 만들었습니다. 원래 하네스의 calibration·마운트/업데이트 digest·DOM 경로 추출을 복원하자 그 GC 분포가 바뀌었습니다. **초기 간소화 프로브의 3 ms를 원래 회귀의 재현으로 채택하지 않았습니다.** 그 자료는 B의 `noneA*`, `exact*`, `trace*` 계열에 보존돼 있습니다.

주된 비교는 D의 `tools/measure-react-pair-129.mjs`를 B의 `original-worker.mjs`로 복사하고, 강제 GC 열에도 관측기를 켤 수 있게 한 것입니다. 타이밍 본체, calibration, 쓰기당 commit 검증, 값·경로 digest 검증은 유지했습니다. 주된 17쌍에서는 heap 조회와 trace 마커를 껐습니다. `original-drive.mjs`가 manifest 검증을 거쳐 번들 하나를 로드하는 별도 프로세스를 만들며, 순서는 `base,candidate / candidate,base`를 반복합니다.

조건별 17쌍, 프로세스별 warmup 10회와 표본 30회, 쓰기 창 510개/side입니다. 실행은 4·4·4·4·1쌍으로 나눴습니다. 프로세스별 중앙값의 쌍별 차이를 계산하고 그 17개 차이의 중앙값 및 고정 seed 12,000회 bootstrap 95% 구간을 냈습니다. 아래의 창 전체 중앙값은 기술 통계이며, 쌍별 효과 추정과 구별합니다. 각 실행은 8분 이내였습니다.

원시 자료는 `pairedNone[A-E]-p*-{base,fbx}-worker.json` 및 `pairedMinor[A-E]-p*-{base,fbx}-worker.json`, 창별 변환은 같은 이름의 `-worker` 없는 JSON, 요약은 각 다섯 tag를 `+`로 연결한 `-summary.json`입니다. `audit-before-report.json`은 조건별 34개 프로세스 모두 `bundlesLoaded: 1`임을 검증합니다.

### 2. minor GC를 추가하지 않은 대조

마운트 전에 full GC를 수행하고, 마운트와 mounted-value/path digest 이후 첫 쓰기를 측정했습니다. 차이의 부호는 문서 전체에서 base minus candidate이며, 음수는 후보가 느리다는 뜻입니다.

| 지표 | 결과 |
| --- | ---: |
| 쌍별 update-wall 차이 | −39.793 µs [−68.334, −24.126] |
| 쌍별 update-active 차이 | −39.813 µs [−68.312, −23.417] |
| 음수인 쌍 | 15 / 17 |
| 각 창의 관측 GC 정지 시간을 뺀 wall 차이 | −41.187 µs [−61.583, −18.251] |

| 구간 안 GC 관측 | base | 합본 |
| --- | ---: | ---: |
| 쓰기 창 | 510 | 510 |
| GC 이벤트 수 / 쓰기 창 | 97 / 510 = 0.1902 | 109 / 510 = 0.2137 |
| GC가 겹친 창 / 비율 | 92 / 510 = 18.04% | 97 / 510 = 19.02% |
| minor 이벤트 수 / 조건부 pause 중앙값 | 81 / 3,428.375 µs | 47 / 3,126.959 µs |
| major 이벤트 수 / 조건부 pause 중앙값 | 0 / 해당 없음 | 3 / 15,978.500 µs |
| incremental 이벤트 수 / 조건부 pause 중앙값 | 16 / 426.625 µs | 59 / 348.958 µs |
| 관측 pause 전체 합계 | 292.895 ms | 226.020 ms |
| 모든 창의 wall 중앙값 | 1,795.771 µs | 1,860.917 µs |

GC 종류는 `perf_hooks`의 minor=1, major=4, incremental=8입니다. startTime/endTime이 쓰기 시작부터 `flushSync`와 네 번의 `setImmediate` drain 종료까지의 창과 겹치는 이벤트를 셌습니다. pause는 이벤트 duration이며 이벤트가 있었을 때의 중앙값입니다. 드물게 긴 major GC가 후보에 생겼지만, 후보의 관측 pause 총량은 base보다 66.875 ms 작았습니다. 창별 pause 차감은 기술적인 분해이며, GC 전후 상태까지 제거하는 인과 실험은 아닙니다.

### 3. 쓰기 전 시계 밖 minor GC 대조

2번과 동일하게 마운트 전 full GC를 수행했습니다. mounted digest 이후, 타이머 이전에 `gc({type:'minor', execution:'sync'})`와 네 번의 drain을 추가했습니다.

| 지표 | 결과 |
| --- | ---: |
| 쌍별 update-wall 차이 | −30.271 µs [−67.687, +12.021] |
| 쌍별 update-active 차이 | −30.271 µs [−68.792, +12.104] |
| 음수인 쌍 | 11 / 17 |
| base / 후보 구간 안 GC | 각각 0 이벤트, 0 / 510 창 |
| base / 후보 창 전체 wall 중앙값 | 1,791.333 / 1,830.000 µs |

원래 no-gc 열과 이 대조는 동일하지 않습니다. 원래 하네스 약 154행은 강제 GC 열의 마운트 전에 full GC를 수행하고, 약 168행의 no-gc 열은 마운트 전 full GC를 생략한 채 쓰기 전에 minor GC를 수행합니다. 이번 대조는 **full GC 전처리를 양쪽에 유지하고 쓰기 전 minor GC만 바꿉니다.** 기존 no-gc의 약 +14 µs와 이번 −30 µs를 서로 대체할 수 없습니다. 이 차이는 minor 여부뿐 아니라 앞선 GC·프로세스 warmup 이력도 영향을 준다는 근거입니다.

### 4. 힙·생존·승격·할당 관측과 array-500의 차이

힙 조회와 V8 trace는 타이밍을 교란하므로 별도 프로세스로 수집했습니다. B의 `originalPilot2-p0-{base,fbx}-summary.json`은 warmup 10 / 30개 창의 array-1000 자료입니다. GC trace는 `WIN-START/END` 안의 이벤트만 셉니다. observer는 경계에 겹치는 이벤트도 세므로 수가 달라질 수 있습니다. 후보의 같은 30개 창에서 observer는 5개 이벤트를 관측했고, 마커 안의 trace는 scavenge 2개와 major 1개였습니다.

| array-1000 trace 프로브 | base | 합본 |
| --- | ---: | ---: |
| 마커 안 GC / GC 창 비율 | 4 / 30, 13.33% | 3 / 30, 10.00% |
| scavenge 수 / pause 중앙값 | 4 / 3.637 ms | 2 / 3.468 ms |
| major 수 / pause | 0 | 1 / 14.831 ms |
| scavenge당 new-space survived 중앙값 | 539,904 B | 527,152 B |
| scavenge당 promoted 중앙값 | 8,289,776 B | 6,221,016 B |
| scavenge당 survived + promoted 중앙값 | 8,828,732 B | 6,748,168 B |
| 쓰기 창당 survived / promoted 평균, GC 없는 창 포함 | 71,924 / 1,101,799 B | 35,143 / 414,734 B |
| 쓰기 창당 survived + promoted 중앙값, GC 없는 창 포함 | 0 B | 0 B |
| 마운트 직후 heap used 중앙값 | 454,459,100 B | 452,002,352 B |
| 쓰기 직전 heap used 중앙값 | 471,737,364 B | 445,100,248 B |
| 쓰기 직전 new-space 사용 / 가용 중앙값 | 23,446,008 / 10,106,376 B | 4,908,008 / 28,644,376 B |
| GC 없는 창의 heap used 증가량 중앙값 | 565,104 B, 26개 창 | 560,744 B, 25개 창 |

마운트 직후 heap used는 수거하지 않은 일시 객체와 앞선 반복의 상태를 포함합니다. 아래 귀속 절의 full-GC 후 보유량과는 다릅니다. 할당량은 GC 없는 창의 `used_heap_size` 증가량으로 추정했으며, V8의 누적 allocation counter 측정은 아닙니다. 후보의 쓰기 할당이 증가했다는 관측은 없습니다.

`heapMinor-p0-*`의 별도 15개 창은 양쪽 GC가 0이었습니다. 쓰기 전 new-space 사용량은 base 302,608 B, 후보 203,328 B이고, 가용량은 각각 33,249,776 / 33,349,056 B였습니다. 할당 추정 중앙값은 570,416 / 560,920 B였습니다. 이 프로브에서도 wall은 1,820.791 / 1,872.083 µs였습니다. 한 쌍의 기술 통계이므로 17쌍의 구간을 대신하지 않습니다.

array-500을 같은 원래 worker의 준비 절차로 별도 추적한 `heap500-p0-*`에서는 다음과 같았습니다. warmup 5 / 15개 창이며 단일 쌍입니다.

| array-500 trace 프로브 | base | 합본 |
| --- | ---: | ---: |
| 구간 안 scavenge / GC 창 비율 | 15 / 15, 100% | 2 / 15, 13.33% |
| scavenge pause 중앙값 | 2.498 ms | 2.141 ms |
| scavenge당 survived + promoted 중앙값 | 7,636,232 B | 5,430,220 B |
| 마운트 직후 heap used 중앙값 | 245,697,472 B | 237,194,328 B |
| 쓰기 직전 new-space 사용 / 가용 중앙값 | 29,119,744 / 4,432,640 B | 26,146,424 / 7,405,960 B |
| 쓰기 wall 중앙값 | 3.888 ms | 1.293 ms |

**array-500의 이득에는 base의 scavenge가 대부분의 쓰기 창 안에 들어가고 후보에서는 대부분 들어가지 않는 효과가 직접 관측됩니다.** 이는 `profile-136a-session.md`의 +2.932 ms 이득 및 기존 mount retention 감소와 같은 방향입니다. 기존 보유량은 array-500에서 56,221,656 → 48,390,528 B, flat-500에서 14,382,544 → 12,421,576 B였습니다.

array-1000에서는 같은 32 MiB new-space capacity에 이르기까지 마운트·digest 중의 수거 위상 자체가 바뀌었습니다. `getHeapSpaceStatistics()`의 new-space 물리 size 64 MiB를 현재 allocation capacity로 읽으면 안 됩니다. trace의 capacity는 33,554,432 B입니다. array-1000의 후보는 쓰기 직전 가용량이 더 컸고, 실제 쓰기 중 scavenge도 더 적었습니다. 따라서 array-500의 GC 이득을 크기 두 배에 그대로 외삽할 수 없습니다. **array-1000의 잔여 손실이 정확히 어느 힙/JIT 상태에서 생겼는지는 미확정입니다.** new-space 가용량 중앙값만으로 개별 GC 트리거를 증명하지 않았습니다.

### 5. 쓰기당 내부 작업량

B의 `counts.mjs`가 React profiling 구현을 메모리에서 계측하고, 번들의 revision ledger 반복문도 메모리에서 계측했습니다. 디스크의 React·제품 파일은 수정하지 않았습니다. 각 side는 별도 프로세스, 마운트 이후 카운터 활성화, 3번 반복이며 모든 벡터가 동일했습니다. 원시는 `counts-array-1000-<side>.json`입니다.

| 쓰기당 호출/반복 | base | 합본 | F-B | F-C | F-F | F-E |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| beginWork / completeWork / bubbleProperties | 1103 | 1099 | 1099 | 1103 | 1103 | 1103 |
| createWorkInProgress | 1101 | 1097 | 1097 | 1101 | 1101 | 1101 |
| bailoutOnAlreadyFinishedWork | 1036 | 1036 | 1036 | 1036 | 1036 | 1036 |
| propagateParentContextChanges | 1005 | 1005 | 1005 | 1005 | 1005 | 1005 |
| renderWithHooks | 32 | 28 | 28 | 32 | 32 | 32 |
| updateSimpleMemoComponent / shallowEqual | 9 | 13 | 13 | 9 | 9 | 9 |
| areHookInputsEqual | 150 | 126 | 150 | 150 | 154 | 122 |
| updateMemo | 38 | 34 | 38 | 38 | 38 | 34 |
| updateCallback | 80 | 64 | 80 | 80 | 80 | 64 |
| updateSyncExternalStore | 20 | 12 | 20 | 20 | 20 | 12 |
| pushSimpleEffect | 45 | 36 | 45 | 45 | 45 | 36 |
| checkIfSnapshotChanged | 18 | 16 | 18 | 18 | 18 | 16 |
| forceStoreRerender | 9 | 8 | 9 | 9 | 9 | 8 |
| node.revision / ledger.read | 39 | 36 | 39 | 39 | 39 | 36 |
| ledger 내부 비트 순회 | 163 | 168 | 163 | 163 | 163 | 168 |
| commitHookEffectListMount | 16 | 8 | 16 | 16 | 8 | 16 |
| updateStoreInstance | 9 | 8 | 9 | 9 | 9 | 8 |
| commitRoot | 1 | 1 | 1 | 1 | 1 | 1 |
| commitHostUpdate / updateProperties | 22 | 22 | 22 | 22 | 22 | 22 |

마운트 profiler 기록까지 포함한 `profilerCommits: 3`을 업데이트 commit 3회로 해석하지 않았습니다. 실제 계측 창의 commitRoot는 1회입니다. F-E는 revision 호출 수를 줄이면서 더 넓은 마스크를 읽습니다. base의 `33070 × 24`, `130 × 4` 등이 후보의 `33070 × 12`, `33198 × 12` 등으로 바뀌어 실제 비트 순회는 5회 증가합니다. 적은 함수 호출을 곧바로 적은 모든 작업으로 간주하지 않았습니다.

보조 Inspector CPU 샘플은 `cpu-p0-*-worker.json`, `cpu-summary.json`에 있습니다. 15개 창, 50 µs 요청 간격이며 수집 자체가 GC 상태와 실행을 바꿉니다. 후보의 context propagation self 샘플이 쓰기당 약 33 µs 많았지만 호출 수는 양쪽 1005회였습니다. 전체 flushSync inclusive 샘플은 후보가 더 작았습니다. 표본 하나의 샘플 차이를 근본 원인이나 변경별 귀속으로 채택하지 않았습니다.

### 6. 최초 −140 µs와 확인 −70 µs

`profile-136c-session.md`의 wall은 −139.730 µs [−190.249, −68.375], `profile-136c2-session.md`는 −70.584 µs [−103.125, −27.500]입니다. 두 구간은 겹치므로 크기가 달라졌다는 통계적 결론은 없습니다. 같은 번들 해시로 수행한 두 측정이며, 양쪽 모두 음수입니다.

`historical.mjs`가 각 실행의 24개 process × 41개 창을 다시 분석했습니다. **3 ms 초과는 긴 창의 대리 지표이며 GC 횟수가 아닙니다.** 최초에는 base 89/984(9.04%), 후보 128/984(13.01%), 확인에는 base 89/984(9.04%), 후보 94/984(9.55%)였습니다. 3 ms 이하 창의 프로세스별 중앙값을 다시 중앙값 낸 값도 최초 base 1.768 / 후보 1.885 ms에서 확인 base 1.742 / 후보 1.795 ms로 가까워졌습니다. 따라서 후보의 긴 창 비율과 짧은 창 비용이 함께 달라졌습니다. 긴 GC 꼬리만으로 차이가 두 배였다고 설명할 수 없습니다.

원래 관측기는 no-gc 열에서만 켜져 있고 forced-GC 열의 GC 관측 값은 null입니다. 과거 두 실행의 정확한 GC 횟수나 pause를 역산할 수 없습니다. 정확한 크기 차이의 원인은 미확정이며, 위상·warmup 변화와 표본 변동은 관측에 맞는 설명 후보입니다. 원시 재분석은 `historical-summary.json`입니다.

## 변경별 귀속

### 동일 역사적 base에서 단독 번들을 만들었습니다

현재 HEAD의 제품 소스를 단독 번들의 base로 사용하지 않았습니다. B의 `prepare.mjs`는 기존 `prepareReactBundles` 빌드 경로를 쓰되, 역사적 build base `e805074de8a9cb0c072a81284a166ab985a113be`의 `git show` 바이트에 해당 패치의 런타임 변경만 메모리에서 적용합니다. 먼저 동일 방식으로 base를 재빌드해 기존 `r133-base.cjs`와 SHA-256이 정확히 같은 것을 확인했습니다. 파일 패치를 작업 트리에 적용할 필요가 없었으므로 복원할 제품 파일도 없었습니다. 각 빌드 후 제품 파일 해시가 동일하고 `git status --short`가 빈 문자열임을 확인했습니다.

| 생성한 번들 | SHA-256 | manifest |
| --- | --- | --- |
| S/bundles/r136-fc.cjs | `4fad436fb9e1c4f660b5b7ed7fb4ab23ca67a80078fa6bd968d69646b94e5bb5` | `r136-fc-manifest.json` |
| S/bundles/r136-ff.cjs | `3fb055ae8c92f9592690985ff49c688acf327b418af07b1d70ce9f0a1e45875d` | `r136-ff-manifest.json` |
| S/bundles/r136-fe.cjs | `6185dfd3b655e099699f613c91013d10bf1e32d624e5d5d7e5ba7062f3cdbd1f` | `r136-fe-manifest.json` |

manifest에는 실제 작업 트리 HEAD, build base, 입력 패치와 overlay의 해시, 방법이 기록돼 있습니다. 기존 base 해시는 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`, 합본은 `9e4ba12ac2d9f124a88b29f4b1d12e990dcf65446c7dbf16365131d2aa54c32d`입니다. 보고서 작성 직전 `audit-before-report.json`에서 HEAD 동일, 제품 diff 없음, 전체 status 빈 문자열을 다시 검증했습니다. 작성 후의 유일한 새 작업 트리 파일은 이 보고서입니다.

### 단독 GC·시간·보유량

단독 시간 측정은 주 대조와 같은 worker 및 warmup 10회, process별 15개 창입니다. F-B/F-C/F-E는 3쌍, F-F는 4쌍이며 ABBA 순서입니다. 적은 쌍의 bootstrap 구간은 탐색용이며, 손실이 없다는 동등성 증명은 아닙니다. `matchFB/FC/FF/FE` 원시와 요약을 사용합니다. 앞선 warmup 5회의 `attribFB/FE` 자료는 준비 조건이 달라 아래 추정에 합치지 않았습니다.

| 단독 변경 | 자체 GC 이벤트 / 창, GC 창 비율 | 종류·pause 중앙값 | paired wall 차이 µs, 95% 구간 |
| --- | --- | --- | ---: |
| F-B | 12 / 45, 11/45 = 24.44% | minor 11, 3.589 ms; incremental 1, 0.251 ms | +9.000 [−146.042, +92.416] |
| F-C | 11 / 45, 11/45 = 24.44% | minor 11, 3.582 ms | +39.833 [+22.542, +3515.375] |
| F-F | 5 / 60, 5/60 = 8.33% | minor 5, 3.525 ms | +25.312 [+0.917, +100.666] |
| F-E | 6 / 45, 6/45 = 13.33% | major 3, 12.222 ms; incremental 3, 0.377 ms; minor 0 | +7.500 [−78.209, +39.333] |

각 쌍의 base GC 관측은 위 표 순서대로 8/45 이벤트·8/45 창, 21/45 이벤트·21/45 창, 8/60 이벤트·8/60 창, 3/45 이벤트·3/45 창입니다. F-C 구간의 큰 상한은 base의 GC가 많았던 한 쌍에서 나왔습니다. 관측 pause를 뺀 paired wall 차이는 순서대로 +9.000 [−47.334, +55.624], −5.084 [−18.167, +8.166], +37.895 [+0.917, +100.666], +7.500 [−33.333, +39.333] µs입니다. **단독 GC 관측과 짧은 시간 측정으로 손실의 유일한 담지 변경을 분리하지 못했습니다.**

비타이밍 프로브 `retained-all.mjs`는 각 side에서 독립적으로 warmup 3회와 측정 9회를 수행하고, 마운트된 폼을 살아 있게 유지한 채 full GC를 수행합니다. 원시는 `retained-array-1000-<side>.json`입니다. 이 결과를 타이밍 중의 힙 상태와 혼합하지 않았습니다.

| side | 마운트 직후 heap used 중앙값 B | full GC 후 heap used 중앙값 B | 마운트 전 대비 보유 증가분 중앙값 B |
| --- | ---: | ---: | ---: |
| base | 313,619,856 | 293,932,280 | 261,631,016 |
| 합본 | 295,587,712 | 278,262,864 | 245,967,424 |
| F-B | 309,285,896 | 291,785,304 | 259,497,648 |
| F-C | 314,338,568 | 293,928,512 | 261,638,760 |
| F-F | 313,777,072 | 294,131,160 | 261,832,336 |
| F-E | 300,475,816 | 280,230,984 | 247,942,312 |

합본의 보유 증가분은 base보다 **15,663,592 B 작습니다.** F-E만으로 13,688,704 B 감소하고 F-B만으로 2,133,368 B 감소합니다. F-C는 거의 같고 F-F는 이 측정에서 201,320 B 증가합니다. 메모리 감소의 대부분과 scavenge에서 major/incremental로의 관측 종류 변화는 F-E에 연결됩니다. 그러나 **메모리 감소의 귀속은 시간 손실의 귀속이 아닙니다.** 합본에서의 상호작용을 분리하는 leave-one-out 또는 부분 조합 비교는 하지 못했습니다.

## 사용자가 보는 비용

원래 하네스의 회귀는 매 표본마다 full GC, 새 마운트, 첫 쓰기를 수행한 비용입니다. 따라서 기존 −140/−70 µs를 모든 키 입력에 계속 더해지는 비용으로 해석할 수 없습니다. 기존 no-gc의 wall 약 +14 µs, 0을 포함하는 구간과 984개 창/side의 GC 0 관측도 정상 상태의 지속 손실을 확정하지 않습니다.

B의 `steady.mjs`는 하나의 살아 있는 마운트에서 동일 leaf에 서로 다른 값으로 16번 쓰고, warmup 마운트 3개와 측정 마운트 9개를 사용했습니다. 매번 실제 값 변경과 commit 1회를 확인했습니다. 각 side는 번들 하나를 로드한 별도 프로세스입니다.

| 반복 입력 프로브 | base | 합본 |
| --- | ---: | ---: |
| 마운트 첫 쓰기 9개, wall 중앙값 | 1.644 ms | 4.690 ms |
| 첫 쓰기에 GC가 있는 창 | 1 / 9 | 5 / 9 |
| 이후 135개 쓰기, wall 중앙값 | 0.621 ms | 0.616 ms |
| 이후 쓰기에 GC가 있는 창 | 1 / 135 | 0 / 135 |

이 프로브는 mounted value를 `JSON.stringify`로 준비하므로 원래 canonical digest와 다릅니다. 첫 쓰기의 3 ms 차이는 초기 간소화 프로브처럼 GC 위상에 민감한 예시이며, 기존 회귀 70–140 µs를 대신하는 추정은 아닙니다. side별 한 프로세스이므로 steady의 약 +4.6 µs도 paired 이득 판정이 아닙니다. 확인한 실용적 범위는 **마운트 직후 첫 업데이트와 반복 입력을 구분해야 하며, steady에 8% 손실이 계속된다는 증거는 없다**는 것입니다. Node/JSDOM 측정이며 실제 브라우저의 paint·입력 지연은 측정하지 않았습니다.

## 고침의 선택지

다음은 후속 worker가 적용·검증할 수 있는 명세입니다. 이 조사에서는 제품 변경을 적용하지 않았습니다.

### 1순위: 합본을 보류하고 기존 base 동작을 유지합니다

확정된 회귀를 제거하는 가장 명확한 선택입니다. 후보와 동일한 역사적 소스 분기에서 F-B/F-C/F-F/F-E 런타임 변경을 함께 되돌리고 기존 base 번들 재현을 확인합니다. 현재 HEAD에는 다른 core 변경이 있으므로 `fbx.patch`의 역패치를 무조건 적용하지 않습니다. 단독 실험만으로 부분 조합의 출하를 결정하지 않습니다.

검증에는 동일 입력·경로 digest와 commit 수, 기존 base 번들 SHA 또는 동일 소스 재현, original-worker의 ABBA 17쌍을 사용합니다. 강제 full GC 후 첫 쓰기와 시계 밖 minor 대조를 모두 유지합니다. array-500의 업데이트 이득과 보유량 절감을 포기하는 선택입니다. 실제 채택·롤백 결정은 이 보고서의 범위 밖이며 여기서는 실행하지 않았습니다.

### 2순위: 손실을 가진 최소 조합을 분리해 해당 조합만 재설계합니다

합본에서 B/C/F/E를 각각 하나씩 제외한 번들 4개를 동일 historical base와 기존 builder로 만듭니다. 우선 GC 종류·마운트 보유량·호출 벡터를 보고, 시간은 각각 ABBA 17쌍과 원래 준비 조건으로 측정합니다. 한 변경을 제외했을 때 손실이 사라지는 결과를 별도 순서 반전으로 확인한 후 해당 변경의 합본 상호작용을 수정합니다. 여러 변경을 제외해야 사라지면 해당 부분 조합을 추가 비교합니다.

worker의 완료 조건은 동일 digest/commit 계약, 보유량·할당·GC 창 비율의 전후 기록, 강제 GC 첫 쓰기 회귀의 해소, minor 대조와 steady에 새 손실이 없음입니다. GC 종류나 짧은 단독 결과만으로 F-E를 원인으로 정하지 않습니다. 메모리 이득을 보존할 가능성이 있지만 아직 고침 효과가 증명되지 않았습니다.

### 3순위: F-E의 중복 revision 읽기를 줄이는 작은 후보를 시험합니다

`useFormTypeInputControl`의 snapshot getter에서 refresh를 지연하지 않는 경우에는 `node.revision(INPUT_TRACKING_EVENTS)`를 한 번 읽고, 지연 중인 경우에만 `node.revision(INPUT_TRACKING_EVENTS & ~SchemaNodeEventType.RequestRefresh) + generation.current`를 읽습니다. ledger가 선택 counter의 합이라는 현재 계약을 이용합니다. 렌더 이후 `generation.current` 동기화와 IME composition·mounted children에 따른 deferral은 유지합니다. 새로운 검증 후보이며 회귀의 확정 고침은 아닙니다.

검증에는 combined mask와 분리된 합의 동치, composition 중/종료 후 refresh, 자식 보유 중 refresh, subscribe 직전 catch-up, update-path/children, observer 교체 계약을 포함합니다. `counts.mjs`에서 revision 호출과 비트 순회를 실제 줄였는지 보고, 동일 ABBA 17쌍·두 GC 전처리와 array-500 보유량을 비교합니다. ledger 반복 5회를 줄이는 것만으로 70–140 µs가 사라질 것이라고 가정하지 않습니다.

### 4순위: 측정에서 first update와 steady state를 별도 행으로 유지합니다

원래 강제 GC 행을 남기고, 한 마운트의 1번째 쓰기와 2–16번째 쓰기 행을 추가합니다. 매번 서로 다른 값과 commit/digest를 검증하고 warmup·GC 전처리를 명시합니다. minor GC로 GC 창을 없앤 행도 별도 대조로 유지합니다. 제품 고침은 아니며 원래 회귀 판정을 지우지 않습니다. 제품에서 `globalThis.gc()`를 호출하는 고침을 제안하지 않습니다.

## 확인하지 못한 것

- 합본의 70–140 µs를 하나의 코드 경로나 하나의 V8 기작까지 확정하지 못했습니다. 관측된 GC pause 단독 설명은 불충분하며, 작은 추가 비교·ledger 작업도 총시간의 원인으로 확정되지 않았습니다.
- 단독 3–4쌍은 검출력이 낮고 F-B/F-E 구간은 손실도 포함합니다. 단독 손실 부재나 조합 안전을 증명하지 않았습니다. leave-one-out/전체 조합 비교는 실행하지 않았습니다.
- 과거 forced-GC 열에는 GC 관측치가 없으므로 최초와 확인의 GC 종류·pause 차이를 복구하지 못했습니다. 긴 창 대리 지표를 GC로 간주하지 않았습니다.
- minor 대조의 0 포함 구간은 동등성 보장이 아닙니다. 새 후보의 수용 판정이나 기존 회귀 판정 변경을 내리지 않았습니다.
- heap 조회·trace·Inspector는 실행과 GC 위상을 바꿉니다. 이 자료의 pause·힙 중앙값을 주 타이밍의 개별 창 상태라고 주장하지 않았습니다. new-space 생존/승격 바이트는 대표 trace 프로브의 값이며 17쌍 전체의 바이트 전수 계측은 아닙니다.
- 할당은 GC 없는 창의 heap used 증가량 추정입니다. 누적 allocation counter, native 할당, 백그라운드 마킹 CPU, 캐시/페이지 fault, 쓰기 장벽이나 JIT 상태의 인과 분해는 하지 못했습니다.
- 실제 브라우저 paint·입력 지연과 장시간 마운트 유지 시의 메모리 상한을 측정하지 않았습니다. 제품 코드 변경, 설치, git 쓰기, 판정 세션 생성은 하지 않았습니다. D에서 이 보고서 외의 파일은 수정하지 않았습니다.

## 하나씩 뺀 조합 비교

### 범위·빌드·측정 방법

이 절은 커밋 `5dc355e146b63e387ff146036ca5fa3aa955aec6`의 진단에 대한 후속 비교입니다. 위 절의 측정 결과와 원시 파일은 유지했습니다. 작업 트리·D·S·B 경로와 Node 바이너리는 위 조사와 같습니다. 제품 파일을 변경하지 않고 S에 네 부분 조합과 manifest를 만들었습니다. 부분 조합 네 개와 합본 대조군의 17쌍씩을 완료했으며 결과는 아래에 기록합니다.

| 후보 | 남긴 변경 | 번들 | SHA-256 |
| --- | --- | --- | --- |
| no-fb | F-C + F-F + F-E | S/bundles/r136-no-fb.cjs | `fc72620eb675f5c349e2adc9046ed9931a18e8cbd81b9bee5c0a510ac3be0547` |
| no-fc | F-B + F-F + F-E | S/bundles/r136-no-fc.cjs | `7b8cdd2bcd44f677aa59f5c264b5401d43239c14eaf2b9b81b98005510e1321b` |
| no-ff | F-B + F-C + F-E | S/bundles/r136-no-ff.cjs | `92cb49e4fb2cd3e288f3553d80a7e75cc90de0769cb16b9fcbb484333a44f6b7` |
| no-fe | F-B + F-C + F-F | S/bundles/r136-no-fe.cjs | `1d0ad52295ebb91e590d12f4119e5d5e4170ec23dc61f7b08aac7cdc7b6958cb` |
| 합본 대조 | F-B + F-C + F-F + F-E | S/bundles/r133-fbx.cjs | 기존 해시 `9e4ba12a…54c32d`, 변경 없음 |

각 부분 조합의 manifest는 번들 이름의 `.cjs`를 `-manifest.json`으로 바꾼 경로입니다. B의 `prepare-loo.mjs`는 기존 `prepare.mjs`와 같은 builder·historical git-show overlay 방법을 사용합니다. build base는 `e805074de8a9cb0c072a81284a166ab985a113be`이고, 빌드 프로세스의 현재 디렉터리를 stage-07로 고정했습니다. base 재빌드는 `r133-base.cjs`의 SHA-256 `ac0b83c954a26b15dcb9100f8d467c8169b35fefcc965da13ac89b1288b44027`과 정확히 일치했습니다. 입력 패치의 런타임 파일은 서로 겹치지 않았고, 각 historical hunk의 문맥을 정확히 대조한 뒤 메모리에서 적용했습니다. 구성 불가로 생략한 번들은 없습니다. `loo-build.json`과 manifest에 포함/제외 변경, 원본·overlay·패치 해시, 현재 HEAD와 historical base, 빌드 후 빈 status가 기록돼 있습니다.

주 타이밍 worker는 B의 기존 `original-worker.mjs`를 그대로 사용합니다. SHA-256은 `a68ad816b0ab7a16154d6e14e9724677ba16e136d629b65896721568721cdab7`이며, `telemetry.mjs`도 수정하지 않았습니다. 설정은 위 근거 2번과 같은 array-1000 / validation off / 마운트 전 full GC / warmup 10 / 표본 30 / 강제 GC 열의 창별 observer입니다. 쓰기 전 minor GC, heap 조회, trace 마커, Inspector는 추가하지 않았습니다. 프로세스마다 번들 하나를 로드하고 값·경로 digest와 쓰기별 commit 수를 검증합니다.

B의 `loo-round.mjs`는 한 명령에서 다섯 후보의 한 쌍씩을 순차 실행합니다. 라운드 0의 후보 순서는 no-fb → no-fc → no-ff → no-fe → 합본이며, 다음 라운드는 순서를 한 칸 순환합니다. 각 후보의 실행 순서는 짝수 라운드 base → 후보, 홀수 라운드 후보 → base입니다. 따라서 후보별로 ABBA 순서를 유지하면서 라운드 내 앞·뒤 위치도 분산합니다. 각 대안의 base는 그 대안과 짝지은 별도 프로세스이고, 다른 대안의 base 표본을 재사용하지 않습니다. 타이밍 중 무거운 별도 작업은 실행하지 않습니다.

원시는 `loo1000-r00-no-fb-p0-{base,no-fb}-worker.json` 형태이며, 라운드는 r00–r16, 후보 이름은 각 대안 또는 fbx입니다. 같은 이름의 `.job.json`은 번들·manifest 해시와 설정을 고정하고, `-worker`가 없는 JSON은 창별 observer 자료입니다. `loo1000-round-*.json`에 순서·실제 실행 시각·소요 시간이 있습니다. `loo-summary.mjs`는 기존 `summ.mjs`의 프로세스 중앙값 → paired 차이 → 그 차이의 중앙값과 고정 seed 12,000회 bootstrap 95% 구간을 그대로 사용합니다. 결과는 `loo1000-<후보>-summary.json` 및 `loo1000-all-summary.json`입니다.

array-500의 5쌍 타이밍은 시간 예산에 따라 먼저 생략했습니다. 첫 라운드가 약 6분이어서 필수 85쌍에 약 102분이 예상됐습니다. 빌드, 두 크기의 비타이밍 수집, 보고서를 포함하면 약 110분을 사용하므로 탐색 타이밍 20쌍을 추가할 여유가 없었습니다. **아래의 array-500 보유량과 호출 감소를 업데이트 시간 이득의 생존 증명으로 해석하지 않습니다.**

### 두 크기의 쓰기당 호출 벡터

타이밍을 멈춘 구간에서 `loo-nontiming.mjs`로 각 side·fixture의 기존 `counts.mjs`를 실행했습니다. 각 벡터는 쓰기 3회 반복에서 같았습니다. 이번 원시는 `loo-array-1000-<side>-counts.json`, `loo-array-500-<side>-counts.json`입니다. 이전의 base·합본 원시 파일은 수집 후 원래 바이트로 복원했습니다. React와 revision ledger의 계측은 메모리에서만 수행했습니다.

| array-1000 쓰기당 호출/반복 | base | no-fb | no-fc | no-ff | no-fe | 합본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| checkIfSnapshotChanged | 18 | 16 | 16 | 16 | 18 | 16 |
| node.revision / ledger.read | 39 | 36 | 36 | 36 | 39 | 36 |
| ledger 비트 순회 | 163 | 168 | 168 | 168 | 163 | 168 |
| forceStoreRerender | 9 | 8 | 8 | 8 | 9 | 8 |
| createWorkInProgress | 1101 | 1101 | 1097 | 1097 | 1097 | 1097 |
| beginWork / completeWork / bubbleProperties | 1103 | 1103 | 1099 | 1099 | 1099 | 1099 |
| bailoutOnAlreadyFinishedWork | 1036 | 1036 | 1036 | 1036 | 1036 | 1036 |
| propagateParentContextChanges | 1005 | 1005 | 1005 | 1005 | 1005 | 1005 |
| renderWithHooks | 32 | 32 | 28 | 28 | 28 | 28 |
| updateMemo | 38 | 34 | 34 | 34 | 38 | 34 |
| areHookInputsEqual | 150 | 126 | 126 | 122 | 154 | 126 |
| updateCallback | 80 | 64 | 64 | 64 | 80 | 64 |
| updateSyncExternalStore | 20 | 12 | 12 | 12 | 20 | 12 |
| pushSimpleEffect | 45 | 36 | 36 | 36 | 45 | 36 |
| updateSimpleMemoComponent / shallowEqual | 9 | 9 | 13 | 13 | 13 | 13 |
| commitRoot | 1 | 1 | 1 | 1 | 1 | 1 |
| commitHostUpdate / updateProperties | 22 | 22 | 22 | 22 | 22 | 22 |
| commitHookEffectListMount | 16 | 8 | 8 | 16 | 8 | 8 |
| updateStoreInstance | 9 | 8 | 8 | 8 | 9 | 8 |

array-500의 전체 벡터는 위 표에서 다음 여섯 Fiber 처리 항목만 아래 값으로 바꾼 것입니다. 나머지 항목은 각 side의 array-1000 값과 정확히 같았습니다. `updateMemoComponent`와 `subscribeToStore`는 모든 side·두 크기에서 0회입니다. 두 크기 모두 계측 창의 update commit은 1회이고, 마운트 기록을 포함한 `profilerCommits`는 3회입니다.

| array-500 쓰기당 호출 | base | no-fb | no-fc | no-ff | no-fe | 합본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| createWorkInProgress | 601 | 601 | 597 | 597 | 597 | 597 |
| beginWork | 603 | 603 | 599 | 599 | 599 | 599 |
| completeWork | 603 | 603 | 599 | 599 | 599 | 599 |
| bubbleProperties | 603 | 603 | 599 | 599 | 599 | 599 |
| bailoutOnAlreadyFinishedWork | 536 | 536 | 536 | 536 | 536 | 536 |
| propagateParentContextChanges | 505 | 505 | 505 | 505 | 505 | 505 |

revision mask별 읽기도 두 크기에서 같습니다. base/no-fe는 `130:4, 8192:7, 16384:4, 33070:24`, 나머지는 `8192:8, 16384:4, 33070:12, 33198:12`입니다. no-fb는 F-B의 렌더 감소를 잃고, no-ff는 F-F의 layout effect 감소를 잃습니다. no-fe는 F-E의 구독·snapshot·effect 생성 감소를 잃습니다. no-fc의 이번 leaf 쓰기 벡터는 합본과 같습니다. 이는 Form 자체의 rerender/submit callback 계약 전체를 비교한 결과는 아닙니다.

### full GC 후 보유 힙

각 side·fixture에서 warmup 3개 마운트와 측정 9개 마운트를 사용했습니다. 마운트 전 full GC 후의 used heap을 기록하고, 마운트된 폼이 살아 있는 상태에서 다시 full GC를 수행했습니다. 표의 “보유 heap”은 후자의 `used_heap_size` 중앙값, “보유 증가분”은 같은 표본에서 마운트 전 값을 뺀 차이의 중앙값입니다. 서로 다른 중앙값을 빼서 증가분을 만들지 않았습니다. 원시는 `loo-<fixture>-<side>-retained.json`입니다.

| side | array-1000 보유 heap B | array-1000 보유 증가분 B | array-500 보유 heap B | array-500 보유 증가분 B |
| --- | ---: | ---: | ---: | ---: |
| base | 293,935,096 | 261,642,616 | 160,552,288 | 130,964,184 |
| no-fb | 280,412,256 | 248,135,584 | 153,744,640 | 124,158,096 |
| no-fc | 278,272,072 | 245,979,664 | 152,691,952 | 123,104,888 |
| no-ff | 278,072,496 | 245,784,096 | 152,549,496 | 123,052,576 |
| no-fe | 291,979,624 | 259,688,392 | 159,504,000 | 129,984,072 |
| 합본 | 278,272,864 | 245,984,808 | 152,651,112 | 123,106,048 |

F-E를 남긴 세 부분 조합은 합본의 보유량 절감을 대부분 유지합니다. F-E를 뺀 조합은 F-B/F-F가 만드는 일부 절감만 유지합니다. 이 결과는 위 진단의 메모리 귀속과 일치하지만, GC 전처리와 수거 위상에 민감한 array-500 update-wall 이득까지 확인한 결과는 아닙니다.

### array-1000 쌍별 결과와 선택

각 대안과 합본 대조군 모두 17쌍을 완료했습니다. 표의 부호는 base − 후보이며 음수는 후보가 느리다는 뜻입니다. `fbx`는 같은 실행군의 합본 대조입니다. pause 차감 wall은 각 창의 wall에서 observer가 기록한 GC pause 합을 뺀 뒤, 원래와 같은 프로세스 중앙값·paired 중앙값으로 계산했습니다. 관측 pause를 차감한 진단값이며 GC에 따른 다른 실행 비용까지 제거하는 측정은 아닙니다.

| 후보 | wall 차이 [95% 구간] µs | active 차이 [95% 구간] µs | pause 차감 wall 차이 [95% 구간] µs | 음수 쌍 수 wall/active/차감 (각 17쌍) |
| --- | ---: | ---: | ---: | ---: |
| no-fb | -27.709 [-64.104, 21.146] | -27.771 [-64.583, 20.355] | -26.083 [-54.208, -3.708] | 11/11/13 |
| no-fc | -27.021 [-68.459, 5.812] | -28.520 [-68.979, 5.938] | -40.896 [-57.625, -16.271] | 11/11/16 |
| no-ff | -38.708 [-81.541, -22.126] | -36.980 [-80.563, -21.980] | -35.250 [-59.230, -18.042] | 13/13/14 |
| no-fe | -3.646 [-34.167, 24.520] | -3.042 [-34.230, 24.395] | 16.417 [-0.376, 29.854] | 9/9/6 |
| fbx | -38.145 [-83.583, -7.313] | -38.041 [-86.334, -7.437] | -38.771 [-59.832, -7.313] | 13/13/13 |

각 base와 후보의 분모는 각각 510개 창입니다. 이벤트 수/창은 여러 GC가 같은 창에 들어온 경우도 포함합니다.

| 후보 | base GC 이벤트 / GC 창 (% 창) | 후보 GC 이벤트 / GC 창 (% 창) | base 이벤트/창 | 후보 이벤트/창 |
| --- | ---: | ---: | ---: | ---: |
| no-fb | 95 / 91 (17.84%) | 79 / 78 (15.29%) | 0.186 | 0.155 |
| no-fc | 110 / 104 (20.39%) | 100 / 90 (17.65%) | 0.216 | 0.196 |
| no-ff | 92 / 90 (17.65%) | 90 / 82 (16.08%) | 0.180 | 0.176 |
| no-fe | 65 / 63 (12.35%) | 124 / 122 (23.92%) | 0.127 | 0.243 |
| fbx | 108 / 101 (19.80%) | 102 / 93 (18.24%) | 0.212 | 0.200 |

아래의 pause 중앙값은 해당 종류의 GC가 관측된 이벤트에 한정하며 단위는 µs입니다. 표기 순서는 “이벤트 수 / pause 중앙값”입니다.

| 후보 | side | minor | major | incremental | 총 pause ms |
| --- | --- | ---: | ---: | ---: | ---: |
| no-fb | base | 83 / 3438.083 | 0 / - | 12 / 425.833 | 297.116 |
| no-fb | no-fb | 3 / 2808.125 | 10 / 13788.396 | 66 / 379.771 | 196.467 |
| no-fc | base | 97 / 3397.333 | 0 / - | 13 / 420.084 | 339.744 |
| no-fc | no-fc | 42 / 3022.063 | 3 / 13714.250 | 55 / 350.791 | 186.562 |
| no-ff | base | 80 / 3491.625 | 0 / - | 12 / 438.417 | 288.142 |
| no-ff | no-ff | 34 / 3146.708 | 4 / 11988.687 | 52 / 346.417 | 184.737 |
| no-fe | base | 52 / 3440.188 | 0 / - | 13 / 447.333 | 188.417 |
| no-fe | no-fe | 115 / 3390.125 | 0 / - | 9 / 446.708 | 399.447 |
| fbx | base | 93 / 3437.958 | 0 / - | 15 / 335.834 | 332.618 |
| fbx | fbx | 42 / 3075.875 | 6 / 12047.896 | 54 / 356.083 | 224.142 |

| 대안 | 합본 보유 증가분 절감의 유지 비율 array-1000 | array-500 |
| --- | ---: | ---: |
| no-fb | 86.3% | 86.6% |
| no-fc | 100.0% | 100.0% |
| no-ff | 101.3% | 100.7% |
| no-fe | 12.5% | 12.5% |

합본 대조의 wall **-38.145 [-83.583, -7.313] µs**, active **-38.041 [-86.334, -7.437] µs**는 모두 음수 구간입니다. 앞선 근거 2의 약 -40 µs 손실이 이번 순환 실행에서도 재현됐습니다. pause 차감 wall도 **-38.771 [-59.832, -7.313] µs**로 남습니다. 합본의 GC 이벤트와 총 pause는 짝지은 base보다 적으므로, 이번에도 관측 GC pause만으로 합본 손실을 설명할 수 없습니다.

| 대안 | array-1000 결과 | 유지하는 관측 이득과 절충 | 다음 전체 네 항목 판정 추정 |
| --- | --- | --- | ---: |
| no-fb: F-C + F-F + F-E | **미해결**. wall·active 구간은 0을 포함하지만 점 추정은 약 -28 µs로 합본 손실의 약 73%가 남습니다. pause 차감 wall 구간은 음수입니다. | F-E의 구독 감소와 보유량 절감 대부분을 유지합니다. F-B의 렌더·Fiber 처리 감소를 잃습니다. | 약 267.7분 |
| no-fc: F-B + F-F + F-E | **미해결**. wall·active 구간은 0을 포함하지만 약 -27~-29 µs의 점 추정과 음수 pause 차감 구간이 남습니다. | 이번 leaf 쓰기 벡터와 보유량 절감은 합본과 거의 같습니다. Form의 다른 콜백·렌더 경로 이득은 이번 벡터의 범위 밖입니다. | 약 267.7분 |
| no-ff: F-B + F-C + F-E | **손실 유지**. wall·active·pause 차감 wall의 세 구간이 모두 음수이며 wall 점 추정은 합본과 비슷합니다. | 보유량 절감과 F-B/F-E 호출 감소를 유지하며, F-F의 layout effect 감소를 잃습니다. | 약 267.7분 |
| no-fe: F-B + F-C + F-F | **요청하신 진단 기준에서 손실 해소 관측**. wall -3.646 µs, active -3.042 µs로 0 근처이며 두 구간 모두 0을 포함합니다. wall 점 추정은 짝지은 base 중앙값 약 1,794 µs의 약 0.20%입니다. pause 차감 wall도 0을 포함하고 점 추정은 +16.417 µs입니다. | F-B의 렌더 감소와 F-F의 layout effect 감소를 유지합니다. F-E의 구독·snapshot·effect 감소를 잃으며 두 크기 모두 합본 보유량 절감의 약 12.5%만 남습니다. | 약 267.7분 |

**선별 채택 후보의 우선순위는 no-fe, 즉 F-B + F-C + F-F입니다.** 준비된 `r136-no-fe.cjs`로 전체 네 항목 판정을 먼저 실행할 수 있습니다. array-500 시간 이득 유지가 중요한 선택 조건이라면 그 결과는 현재 미확인으로 남습니다. 기존 합본의 큰 보유량 절감까지 유지하려면 F-E의 재구현·새 번들 검증이 후속 선택입니다. 이번 근거는 이 조합에서 F-E를 제외했을 때 첫 쓰기 손실이 0 근처로 이동했다는 결과이며, F-E 단독의 회귀나 원인 코드 행까지 확정하는 범위는 아닙니다.

no-fe는 GC 없는 업데이트를 만든 조합도 아닙니다. 후보의 GC 창은 122/510으로 짝지은 base의 63/510보다 많고, minor도 115회 대 52회입니다. 원 wall이 0 근처로 이동한 것과 pause 차감 점 추정이 양수인 것을 함께 보셔야 합니다. 나머지 F-E 유지 조합의 GC 종류 이동과 보유량 절감은 관측되지만, 그것만으로 원 wall 손실 해소가 입증되지는 않았습니다.

필수 타이밍 17개 명령의 합계는 **6,093.825초, 약 101.56분**이고 가장 긴 명령은 **362.898초, 약 6.05분**입니다. 원시는 총 170개 worker(5후보 × 17쌍 × 2프로세스), 후보별 양쪽 510개 창입니다. `loo-post.mjs`는 타이밍 종료 후 기존 요약기를 순차 호출하며, `loo-decision-data.json`에 효과·GC·보유량 유지 비율과 비용을 기록합니다.

최종 작업 검사는 B의 `loo-audit.mjs`와 `loo-audit-final.json`으로 확인합니다. HEAD는 `5dc355e146b63e387ff146036ca5fa3aa955aec6`이고 `git status --short`의 변경 파일은 아래 보고서 하나입니다. 기존 절은 바이트가 동일하고, 결론 문단 하나와 이 비교 절만 추가합니다. 제품 파일을 수정한 적이 없으며 base·합본·worker·telemetry 해시는 고정값과 대조합니다.

```text
 M packages/canard/schema-form/architecture/verification/07-switch/fbx-a1000-diagnosis.md
```

### 후속 전체 판정 비용과 이번 비교의 한계

부분 조합 하나의 전체 네 항목 판정에는 기존 세션 wall time을 그대로 합산하면 **약 267.7분, 4시간 28분**이 듭니다. `profile-136a-session.md`의 66.7분, `profile-136b-session.md`의 74.0분, `profile-136c-session.md`의 81.0분, nested-d5의 약 46분을 합친 추정입니다. 어느 대안을 고르든 같은 범위의 판정을 실행하므로 추정 비용은 같습니다. 두 대안을 검증하면 약 535.4분, 네 대안을 모두 검증하면 약 1,070.8분입니다. 이는 기존 세션의 관측 시간을 사용한 일정 추정이며, 새 준비 작업이나 재시도 비용을 포함하지 않습니다.

이번 비교는 array-1000의 강제 GC 업데이트 손실을 가르는 진단입니다. array-500 탐색 타이밍은 예산 때문에 생략했으며, 다른 flat/nested fixture의 업데이트·마운트·보유량과 공개 동작 계약을 부분 조합마다 다시 판정하지 않았습니다. 두 크기의 보유량과 leaf 쓰기 호출 벡터가 합본 이득의 일부를 유지한다는 사실은 그 전체 판정을 대신하지 않습니다. 후보별 95% 구간도 네 대안을 비교하는 진단 구간이며, 동등성 보장이나 공식 채택 판정은 아닙니다.

464라운드 가지 정리 보충: 이 문서가 인용한 미병합 후보 `e805074de8a9`의 필요한 내용은 [본선 보존물](../../_archive/branches/README.md)에 있습니다. 원래 SHA는 자료 식별자이며 가지 유지에 의존하지 않습니다.
