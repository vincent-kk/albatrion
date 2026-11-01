# D2-0 — D1 통합 판의 프로파일과 누적 효과

2026-10-27 KST, TEST-080 D2 착수 자료입니다. #463–#468을 합친 판의 D4 대상은 분기 왕복 **0.4865ms**, nested 일괄 **6.6830ms**이며 두 행 모두 관문 미달입니다. 같은 창의 0.16.1에 맞춘 실효 상한까지 각각 **0.3690ms**, **1.6830ms**를 더 줄여야 합니다. 분기는 잠복·비활성 값·경로 장부, nested 일괄은 dirty 경로와 입력 분배, 두 마운트는 청사진 생성·할당이 남은 큰 비용입니다.

## 통합 판 구성

단계 기반은 `34ca96333ea1bfa90587839f16c29b2a6b82c9ba`, 측정한 로컬 통합 HEAD는 `e713089687a3559c115d4360bb07b50e2690a493`입니다. 번호 순서대로 다음 가지를 합쳤으며 건너뛴 PR과 코드 충돌은 없습니다. PR 자체는 병합하지 않았고 통합 가지는 원격에 올리지 않았습니다.

| PR | 가지 | 포함한 원격 HEAD |
| --- | --- | --- |
| #463 | `fix/schema-form-detached-rekey` | `65b9daea9ec568853f3c160084f55590400924fc` |
| #464 | `perf/schema-form-h1-static-partition` | `43bc8340a712c9bca146e9eb6c0a348ac82f2ed9` |
| #465 | `feat/schema-form-app-cache` | `b29738f6a7f5ae960d7c3272cf6abd466accefa3` |
| #466 | `perf/schema-form-h2-preserve-references` | `a0cad0c69296283748cc7bdb023d06a8ec10a63d` |
| #467 | `perf/schema-form-h4-latent-scope-m` | `a0a748a87a2ffd269f8ae590830f77fdc45dd548` |
| #468 | `perf/schema-form-h5b-unobserved-payload` | `478e4fe3e289a4150d121c566cc14559a669525e` |

문서 충돌은 두 건이며 `packages/canard/schema-form/src/core/engine/settle/DETAIL.md`의 다음 구간을 양쪽 보존으로 해결했습니다. 코드 자동 병합은 수정하지 않았습니다.

| PR | 구간 | 보존한 내용 |
| --- | --- | --- |
| #464 | API Contracts, Acceptance Criteria | #463의 분리 참조 현재 쓰기 주소 계약·`settle-detached-address`와 H1의 정적 분할/후속 계약·`settle-host-static-partition`을 모두 유지 |
| #466 | API Contracts, Acceptance Criteria | 기존 #463·H1 계약/수용 기준과 H2의 비바퀴 참조 비용 계약·`settle-non-wheel-reference-cost`를 모두 유지 |

충돌의 원본은 외부 실행 디렉터리의 `conflict-464.patch`, `conflict-466.patch`에 있습니다. H1 문서의 “preserveReferences는 H2까지 바꾸지 않는다” 문구도 양쪽 보존 규칙에 따라 남겼습니다. 이는 H1의 의도 기록이며, 통합 판에는 H2 구현이 들어 있으므로 D2가 계약 문서를 정리할 때 확인해야 합니다.

## 환경과 원자료

- 실행 ID: `20261026T2245-e713089-d2-integration`; 외부 원자료 루트: `{scratch}/perf-runs/20261026T2245-e713089-d2-integration`.
- 조용한 창 시작/설치 시작: `2026-10-26T22:42:38Z`; 종료 알림 시각: `2026-10-26T22:48:33Z`. H5b 관문 종료 후 코디네이터가 다른 워커의 무거운 작업을 중지한 창입니다.
- 쌍 측정 실제 시각: `2026-10-26T22:44:14.548Z` ~ `2026-10-26T22:44:52.239Z`; 프로파일 실제 시각과 argv·종료 코드는 `profile-commands.json`에 있습니다.
- Node `v26.12.1`, Apple M1 Max 10코어, Darwin `27.0.0 arm64`, 메모리 64GiB, `NODE_ENV=production`입니다.
- `yarn install --immutable`과 `yarn workspaces foreach --from @canard/schema-form --recursive --topological-dev run build`가 exit 0으로 완료되었습니다. 설치는 기존 peer dependency 경고를 남겼습니다. 빌드의 gate-selection dist 검사도 통과했습니다.
- 원자료: `results.json`, `environment.json`, `engines.json`, 행/반복별 표본·명령·stdout/stderr, `prof/<장면>/loop.cpuprofile`, `coverage.json`, `allocation.heapprofile`, `summary.json`, `derived.json`, 장면별 표 `.txt`, `profile-derived.json`, 검증 스크립트·결과, `seal.json`입니다.

### dist SHA256

| 번들 | SHA256 |
| --- | --- |
| 통합 판 Node ESM | `4563286f5862703164f47729acc6a7e3d251af2365ca2d72b9632bb6dc4d1a99` |
| npm 0.16.1 ESM | `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46` |
| 통합 판 `index.mjs` | `2e3d15ffa4e976c0fef5d2a4740192d51b005875a17e395bc67c0b8b43c8d40c` |
| 통합 판 `index.cjs` | `b242f93f4b90d0cbe59ab9d5e3bec45ed32ba38d01b02ef7d864183ba5a5ae20` |

실행 전후 배포 번들의 해시가 같음을 검증했습니다. 측정용 사본에는 기존 장치가 내부 심볼 export 한 줄만 추가했습니다. 제품 소스·배포 번들은 편집하지 않았습니다.

## 누적 효과: canonical 여덟 행

각 판 20회 예열·100표본, 행당 독립 쌍 프로세스 3개(전체 24 PID·유지 표본 4,800개)입니다. 프로세스 안에서 두 판을 AB/BA로 번갈아 실행하며, 시간은 **세 실행 최소값의 중앙값**, 폭은 **세 최소값의 최댓값−최솟값**입니다. Δ %는 같은 창의 `(통합 판 / 0.16.1 − 1) × 100`입니다. 단일 입력은 잎 열 개 쓰기의 묶음, 분기는 `kind_0 → kind_79 → kind_0` 왕복 두 쓰기, 일괄은 루트 교체 한 번입니다.

단계 시작 열은 [baseline.md 표 1](./baseline.md)의 새 판 시간이며 마지막 열은 그 표시값 대비 변화율입니다. **다른 창·다른 판의 참고 수치이며 개선/회귀의 판정이나 개별 PR의 인과 효과로 해석하지 않습니다.**

| 행 | N | 0.16.1 ms | 폭 ms | 통합 ms | 폭 ms | 같은 창 Δ % | 단계 시작 ms (참고) | 단계 시작 대비 % (참고) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| mount-oneOf-80 | 80 | 0.3517 | 0.0015 | 2.0945 | 0.1197 | +495.44 | 2.1338 | -1.84 |
| mount-flat-1000 | 1000 | 2.1066 | 0.0655 | 2.1164 | 0.0722 | +0.47 | 2.3952 | -11.64 |
| mount-nested-d6-f4 | 4096 | 6.6230 | 0.2653 | 15.5886 | 0.5192 | +135.37 | 17.4387 | -10.61 |
| single-flat-1000 | 1000 | 0.5414 | 0.0856 | 0.0747 | 0.0368 | -86.19 | 0.1165 | -35.84 |
| single-nested-d6-f4 | 4096 | 0.0322 | 0.0142 | 0.1725 | 0.0694 | +436.13 | 0.1533 | +12.50 |
| switch-oneOf-80 | 80 | 0.0783 | 0.0025 | 0.4865 | 0.0541 | +521.07 | 0.5172 | -5.94 |
| bulk-flat-2000 | 2000 | 1.4379 | 0.0960 | 2.3702 | 0.0751 | +64.84 | 3.0585 | -22.50 |
| bulk-nested-d6-f4 | 4096 | 3.6629 | 0.1712 | 6.6830 | 0.1812 | +82.45 | 8.8146 | -24.18 |

#465의 app cache는 앱이 cache domain을 전달하여 재사용하는 경로입니다. 이 코어 마운트는 매번 새 청사진을 만들며 앱 도메인을 주입하지 않으므로, 이 표에서 app cache의 반복 마운트 이득을 측정했다고 주장하지 않습니다. 이 자료는 여섯 PR의 통합 결과이며 PR별 기여도를 분해하는 ablation은 수행하지 않았습니다.

## D4 관문까지 남은 거리

| 행 | 통합 ms | 같은 창 0.16.1 ms | 비율 | 1.5배 상한 ms | 절대 상한 ms | 비율 상한까지 초과 ms | 절대 상한과의 차 ms | 실효 상한까지 추가 감축 ms | 판정 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| switch-oneOf-80 | 0.4865 | 0.0783 | 6.211배 | 0.1175 | < 1.0 | +0.3690 | -0.5135 | 0.3690 | 미달 |
| bulk-nested-d6-f4 | 6.6830 | 3.6629 | 1.825배 | 5.4943 | < 5.0 | +1.1887 | +1.6830 | 1.6830 | 미달 |

분기는 1ms 아래이지만 1.5배 조건을 넘습니다. nested 일괄은 비율·5ms 조건을 모두 넘으며 5ms 조건이 더 엄격합니다. 절대 상한은 엄격한 미만 조건이므로 경계에 정확히 닿는 감축량보다 조금 더 줄여야 합니다.

## 프로파일 정의와 단계별 포함 시간

기존 `tools/profile`에 canonical 행을 연결하여 `buildRows(false)`·`setupOperation`·`buildFixture`를 그대로 재사용했습니다. 도구의 임시 변경은 `canonical-profile.patch`에 보존했으며 결과 가지에는 보고서 한 파일만 올립니다. 장면 준비·사전 값 검사·예열은 CPU/할당 수집 밖에 두고, CPU는 20회 예열 뒤 10초(200µs 간격), precise coverage는 준비/4회 예열 뒤 30연산, heap sampling은 10회 예열 뒤 6초(4,096바이트 간격, minor/major GC로 수거한 객체 포함)입니다.

CPU·호출 수·할당은 서로 다른 계측 실행입니다. CPU의 연산당 시간은 반복 루프의 뜨거운 상태이며 canonical 쌍 측정의 태스크 양보·import 경계와 다릅니다. **CPU %를 쌍 측정 ms에 곱하여 절감 가능한 ms로 확정하지 않습니다.** 할당은 표본 추정량이고 retained heap이 아닙니다. coverage 합계는 복사한 엔진 번들 함수만 포함하며 외부 의존 함수 호출은 제외합니다.

아래 값은 **수집 구간 포함 ms / %**이며 한 표본의 호출 스택에서 같은 묶음은 한 번만 셉니다. 서로 다른 행은 중첩하므로 더하지 않습니다. 게이트 묶음은 `/gates/`, 의존 묶음은 `/dependencies/`, 경로 묶음은 pathIndex·PathKeyed·DirtyPathSet 소스 프레임의 합집합입니다. `computeNode` 묶음은 `computeNodeBody`·`computeStableNode`를 포함하고, 커밋 묶음은 static-first commit도 포함합니다. 0은 이 수집에서 관측된 표본이 없다는 뜻입니다.

| 단계 | 분기 oneOf-80 | 일괄 nested | 마운트 oneOf-80 | 마운트 nested |
| --- | ---: | ---: | ---: | ---: |
| 청사진 | 0.0 / 0.0 | 0.0 / 0.0 | 3813.8 / 38.0 | 4989.9 / 49.6 |
| markWrite | 103.0 / 1.0 | 3189.1 / 31.7 | 24.6 / 0.2 | 0.0 / 0.0 |
| computeNode | 3128.2 / 31.2 | 3384.7 / 33.7 | 1146.7 / 11.4 | 0.0 / 0.0 |
| selectChildren | 1700.3 / 17.0 | 0.0 / 0.0 | 400.3 / 4.0 | 0.0 / 0.0 |
| updateOutput / assembleObject | 435.5 / 4.3 | 1598.8 / 15.9 | 99.5 / 1.0 | 269.9 / 2.7 |
| 게이트 평가·레지스트리 | 843.0 / 8.4 | 0.0 / 0.0 | 1317.0 / 13.1 | 0.0 / 0.0 |
| 의존 색인 | 792.4 / 7.9 | 968.7 / 9.6 | 2855.8 / 28.5 | 0.0 / 0.0 |
| finish / commit / markCommitDeliveries | 4872.6 / 48.6 | 1851.5 / 18.4 | 689.5 / 6.9 | 30.4 / 0.3 |
| 배달 파동 | 0.0 / 0.0 | 0.0 / 0.0 | 0.3 / 0.0 | 13.4 / 0.1 |
| 경로 색인 | 1156.8 / 11.5 | 2197.3 / 21.9 | 46.6 / 0.5 | 3.7 / 0.0 |
| GC | 1117.0 / 11.1 | 312.0 / 3.1 | 998.6 / 10.0 | 2596.7 / 25.8 |
| loadFieldNodeAtMount / writeFieldNode | 8575.0 / 85.6 | 9458.3 / 94.2 | 4941.6 / 49.3 | 2082.0 / 20.7 |
| updateOutput | 434.8 / 4.3 | 1597.9 / 15.9 | 99.2 / 1.0 | 0.0 / 0.0 |
| assembleObject | 331.8 / 3.3 | 510.4 / 5.1 | 82.5 / 0.8 | 269.9 / 2.7 |
| preserveReferences / sameValue | 37.8 / 0.4 | 91.1 / 0.9 | 7.6 / 0.1 | 0.0 / 0.0 |
| evaluateGate / evaluateGateValue | 0.0 / 0.0 | 0.0 / 0.0 | 0.0 / 0.0 | 0.0 / 0.0 |
| 게이트 register | 357.1 / 3.6 | 0.0 / 0.0 | 222.2 / 2.2 | 0.0 / 0.0 |
| registerRecalculation | 338.1 / 3.4 | 966.5 / 9.6 | 69.7 / 0.7 | 0.0 / 0.0 |
| affected / affectedByPresence | 249.5 / 2.5 | 14.3 / 0.1 | 108.6 / 1.1 | 0.0 / 0.0 |
| finishSettlement | 4871.7 / 48.6 | 1851.5 / 18.4 | 689.5 / 6.9 | 0.0 / 0.0 |
| commitSettlement | 1925.7 / 19.2 | 1511.5 / 15.0 | 88.9 / 0.9 | 0.0 / 0.0 |
| markCommitDeliveries | 296.3 / 3.0 | 1063.6 / 10.6 | 30.3 / 0.3 | 0.0 / 0.0 |
| markFieldNodeEvent | 0.0 / 0.0 | 0.0 / 0.0 | 0.0 / 0.0 | 0.0 / 0.0 |
| loadStaticFirstTree | 0.0 / 0.0 | 0.0 / 0.0 | 0.0 / 0.0 | 2039.8 / 20.3 |
| setLatentRaw | 842.7 / 8.4 | 0.0 / 0.0 | 0.0 / 0.0 | 0.0 / 0.0 |
| updateInactiveValuesMemo | 905.1 / 9.0 | 0.6 / 0.0 | 3.4 / 0.0 | 0.0 / 0.0 |

### 계측 예외와 위치 표기

oneOf 마운트의 CPU 원자료 32,675표본 중 `timeDeltas[577]`에 `-1µs`가 있습니다(`affectedForRegistration`, 앞뒤 336/299µs). 다른 세 CPU 프로파일에는 음수 차분이 없습니다. 원자료와 기존 분석기의 부호 있는 합계를 그대로 유지했고 총 시간과 프로파일 시작/종료 차이도 검증했습니다. 이 프로파일러 출력 예외의 런타임 내부 원인은 확인하지 못했으며, 영향의 절댓값은 0.001ms로 표의 0.1ms 반올림과 해석 범위보다 작습니다.

자기 시간 위치의 `engine/`·`surface/`는 패키지 `src/core/` 기준입니다. 명명 함수는 번들 region을 원본 선언에 연결했고 익명 함수는 원본 콜백 위치를 대조했습니다. `getFragmentOwnerPaths`의 두 some 콜백은 번들 한 줄로 합쳐져 원본 13·15행을 함께 표시합니다. 네이티브/GC/Node 내부 프레임에는 대응하는 저장소 줄이 없어 그대로 표시합니다. source map을 수정하거나 생성하지 않았습니다.

## 장면별 결과

### switch-oneOf-80

왕복 한 연산은 엔진 호출 3,060회와 할당 204.4KiB이며, 판별자 쓰기 한 번으로 나누면 1,530회·102.2KiB입니다. 쓰기 한 번당 prepare/finishGateTableRound 각각 1회, selectNodeSchema 1회, mergeEffectiveSchema 7회, assembleObject 2회이고, 게이트 표의 readGateSelectionGroup 2회 중 첫 읽기가 recordGateInput 1회를 남기며 일반 evaluateGate/evaluateGateValue 호출은 0회입니다. getGateExpression은 쓰기당 83회 남아 있어 80개 게이트의 정적 증명·호스트 준비가 매 쓰기에서 얼마만큼 재사용되는지 설계 Ⅰ의 컴파일 계획에서 확인할 근거입니다. 포함 시간은 finishSettlement 48.6%, computeNode 31.2%, 경로 색인 11.5%이며 자기 시간의 큰 셋은 GC 11.1%, getControlLayers 5.0%, assembleObject 3.2%입니다. Set 15.2%·Map 6.2%·updateInactiveValuesMemo 5.3%가 할당의 큰 셋이고, 잠복/비활성 메모·나감 정책·경로 장부가 H5b 이후에도 남으므로 2단계 정착에서는 이 의미 계약을 유지하면서 장부 생성/소비를 줄이는 방안을 먼저 확인해야 합니다. D4의 실효 상한 0.1175ms까지 0.3690ms가 남으며, 반복 루프의 CPU 시간이나 포함 비율만으로 이 감축량을 달성한다고 주장하지 않습니다.

CPU 반복 66,142회, 비 idle 수집 10020.8ms입니다. 아래 자기 시간은 **수집 전체의 ms**이며 연산당 ms가 아닙니다.

자기 시간 상위 25:

| # | function | source | self ms | self % | incl % |
|---|---|---|---|---|---|
| 1 | (garbage collector) | (native) | 1117 | 11.1 | 11.1 |
| 2 | getControlLayers | engine/settle/utils/controls/getControlLayers.ts:62 | 503.4 | 5 | 8.6 |
| 3 | assembleObject | engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:21 | 316.5 | 3.2 | 3.3 |
| 4 | getPrefix | engine/utils/pathIndex/utils/PathStoreIndex.ts:38 | 281.9 | 2.8 | 2.9 |
| 5 | updateInactiveValuesMemo | engine/settle/utils/commit/updateInactiveValuesMemo.ts:29 | 269.4 | 2.7 | 9 |
| 6 | setLatentRaw | engine/settle/utils/latentStore/setLatentRaw.ts:22 | 255.2 | 2.5 | 8.4 |
| 7 | selectEntryStep | engine/settle/utils/compute/childSelection/selectEntryStep.ts:75 | 246.2 | 2.5 | 10 |
| 8 | register | engine/settle/utils/gates/getGateRegistry.ts:118 | 240.9 | 2.4 | 3.6 |
| 9 | (program) | (native) | 221.6 | 2.2 | 2.2 |
| 10 | affectedByPresence | engine/settle/utils/dependencies/getDependencyIndex.ts:401 | 208.5 | 2.1 | 2.5 |
| 11 | delete | engine/utils/pathIndex/utils/PathStoreIndex.ts:51 | 207.4 | 2.1 | 2.3 |
| 12 | readUnsetPolicy | engine/settle/utils/transition/readUnsetPolicy.ts:12 | 194.3 | 1.9 | 7.2 |
| 13 | computeNodeBody | engine/settle/utils/compute/computeNode.ts:35 | 183.9 | 1.8 | 30.8 |
| 14 | indexLatentDescendant | engine/settle/utils/latentStore/indexLatentDescendant.ts:11 | 181 | 1.8 | 1.8 |
| 15 | add | engine/utils/pathIndex/utils/PathStoreIndex.ts:36 | 180.6 | 1.8 | 4.7 |
| 16 | transitionSettlement | engine/settle/utils/transition/transitionSettlement.ts:26 | 170.8 | 1.7 | 1.8 |
| 17 | getGateExpression | engine/settle/utils/gates/getGateExpression.ts:15 | 166.9 | 1.7 | 1.7 |
| 18 | set | engine/utils/pathIndex/PathKeyedMap.ts:16 | 161.3 | 1.6 | 7.8 |
| 19 | visitFieldNodes.owned | engine/settle/utils/commit/snapshotExitedPolicies.ts:25 | 160.8 | 1.6 | 4.7 |
| 20 | getStoreKeyPaths | engine/utils/pathIndex/utils/getStoreKeyPaths.ts:12 | 155.9 | 1.6 | 1.6 |
| 21 | retain | engine/settle/utils/latentStore/DetachedWriteAddress.ts:21 | 144.9 | 1.4 | 1.4 |
| 22 | markCommitDeliveries | engine/settle/utils/commit/markCommitDeliveries.ts:32 | 127.3 | 1.3 | 3 |
| 23 | getCommittedDeclarationKey | engine/utils/controls/getCommittedDeclarationKey.ts:18 | 122.2 | 1.2 | 1.3 |
| 24 | (anonymous) | engine/utils/controls/getFragmentOwnerPaths.ts:13·15 | 121.2 | 1.2 | 1.2 |
| 25 | registerPresenceChanges | engine/settle/utils/dependencies/registerPresenceChanges.ts:24 | 113.7 | 1.1 | 4.2 |

분기 판별자 비용의 직접 계수(위치 확인: `computeNode.ts:205`, `readGateSelectionGroup.ts:22`):

| 지표 | 왕복/연산 | 판별자 쓰기 1회 |
| --- | ---: | ---: |
| prepareGateTableRound | 2 | 1 |
| finishGateTableRound | 2 | 1 |
| readGateSelectionGroup | 4 | 2 |
| recordGateInput | 2 | 1 |
| getGateExpression | 166 | 83 |
| selectNodeSchema | 2 | 1 |
| mergeEffectiveSchema | 14 | 7 |
| assembleObject | 4 | 2 |
| computeNode | 10 | 5 |
| evaluateGate / evaluateGateValue | 0 | 0 |

연산당 엔진 호출 상위 30(분기는 왕복 두 쓰기 기준):

| # | 함수 | 원본 | 호출/연산 |
| --- | --- | --- | ---: |
| 1 | get path | surface/runtime/FieldNode.ts | 480.0 |
| 2 | getGateExpression | engine/settle/utils/gates/getGateExpression.ts | 166.0 |
| 3 | getBlueprintNodeIdentity | engine/utils/nodeIdentity/getBlueprintNodeIdentity.ts | 122.0 |
| 4 | get children | surface/runtime/FieldNode.ts | 114.0 |
| 5 | get name | surface/runtime/FieldNode.ts | 86.0 |
| 6 | isChildMarkerAt | engine/utils/controls/getFragmentOwnerPaths.ts | 72.0 |
| 7 | getCommittedDeclarationKey | engine/utils/controls/getCommittedDeclarationKey.ts | 54.0 |
| 8 | get raw | surface/runtime/FieldNode.ts | 54.0 |
| 9 | captureFieldNodeChange | engine/record/utils/captureFieldNodeChange.ts | 52.0 |
| 10 | get rootNode | surface/runtime/FieldNode.ts | 46.0 |
| 11 | set | engine/utils/pathIndex/PathKeyedMap.ts | 44.0 |
| 12 | get | engine/utils/emptyReadonlyMap.ts | 42.0 |
| 13 | selected | engine/settle/utils/controls/getControlLayers.ts | 42.0 |
| 14 | add | engine/settle/utils/scratch/DirtyPathSet.ts | 38.0 |
| 15 | sameValue | engine/utils/compute/sameValue.ts | 36.0 |
| 16 | delete | engine/utils/pathIndex/utils/PathStoreIndex.ts | 34.0 |
| 17 | isTreeNode | engine/settle/utils/commit/markCommitDeliveries.ts | 34.0 |
| 18 | getGateRegistry | engine/settle/utils/gates/getGateRegistry.ts | 30.0 |
| 19 | get schemaType | surface/runtime/FieldNode.ts | 26.0 |
| 20 | isCanonicalArraySlot | engine/utils/pathIndex/utils/utils/isCanonicalArraySlot.ts | 24.0 |
| 21 | add | engine/utils/pathIndex/utils/PathStoreIndex.ts | 24.0 |
| 22 | getPrefix | engine/utils/pathIndex/utils/PathStoreIndex.ts | 24.0 |
| 23 | dropPrefix | engine/utils/pathIndex/utils/PathStoreIndex.ts | 24.0 |
| 24 | getStoreKeyPaths | engine/utils/pathIndex/utils/getStoreKeyPaths.ts | 24.0 |
| 25 | delete | engine/utils/pathIndex/PathKeyedMap.ts | 24.0 |
| 26 | getControlLayers | engine/settle/utils/controls/getControlLayers.ts | 24.0 |
| 27 | get active | surface/runtime/FieldNode.ts | 24.0 |
| 28 | clearFieldNodeChanges | engine/record/utils/clearFieldNodeChanges.ts | 22.0 |
| 29 | markSilent | engine/settle/utils/commit/markCommitDeliveries.ts | 22.0 |
| 30 | getFragmentOwnerPaths | engine/utils/controls/getFragmentOwnerPaths.ts | 18.0 |

연산당 할당 상위 15(표본 추정; 네이티브 할당 함수의 소유자를 임의로 단정하지 않습니다):

| # | 할당 함수 | 원본/런타임 | KiB/연산 | 비중 % |
| --- | --- | --- | ---: | ---: |
| 1 | Set | (native) | 30.99 | 15.2 |
| 2 | Map | (native) | 12.72 | 6.2 |
| 3 | updateInactiveValuesMemo | engine/settle/utils/commit/updateInactiveValuesMemo.ts | 10.75 | 5.3 |
| 4 | add | engine/utils/pathIndex/utils/PathStoreIndex.ts | 10.02 | 4.9 |
| 5 | delete | (native) | 8.99 | 4.4 |
| 6 | getControlLayers | engine/settle/utils/controls/getControlLayers.ts | 8.72 | 4.3 |
| 7 | set | (native) | 8.53 | 4.2 |
| 8 | sort | (native) | 8.32 | 4.1 |
| 9 | next | (native) | 7.08 | 3.5 |
| 10 | computeNodeBody | engine/settle/utils/compute/computeNode.ts | 4.97 | 2.4 |
| 11 | releaseSettlementScratch | engine/settle/utils/scratch/releaseSettlementScratch.ts | 4.44 | 2.2 |
| 12 | captureLatentDescendants | engine/settle/utils/transition/captureLatentDescendants.ts | 4.08 | 2.0 |
| 13 | collect | engine/settle/utils/dependencies/getDependencyIndex.ts | 3.94 | 1.9 |
| 14 | add | (native) | 3.76 | 1.8 |
| 15 | setLatentRaw | engine/settle/utils/latentStore/setLatentRaw.ts | 3.62 | 1.8 |

### bulk-nested-d6-f4

이 트리는 잎 4,096개와 객체 호스트 1,365개, 총 5,461노드이며 일괄 한 번에 엔진 호출 350,016회(노드당 64.1회)가 남습니다. markWrite·computeStableNode·updateOutput·advanceFieldNodeRevision·canOmitFieldNodePayload는 각각 5,461회, assembleObject는 1,365회이고 path getter는 노드당 약 8회이므로 게이트 재평가보다 노드별 입력/정착/리비전 장부가 목표입니다. 자기 시간의 큰 셋은 DirtyPathSet.add 17.3%, markWrite 14.4%, computeStableNode 7.3%이며 포함 시간은 computeNode 33.7%, markWrite 31.7%, 경로 색인 21.9%입니다. 할당 5,799.6KiB는 노드당 약 1.06KiB이고 네이티브 add 30.4%·set 11.6%·keys 9.6%가 큰 셋이며, updateOutput 9.4%와 registerRecalculation 6.3%도 남습니다. H5b의 payload 생략 경로에서도 노드마다 리비전 증가와 생략 판정은 필요하고 markFieldNodeEvent 호출은 0이므로 이벤트 객체 생성만 더 줄이는 가설로 전체 잔여 비용을 설명할 수 없습니다. D4에는 추가 1.6830ms보다 조금 큰 감축이 필요하며, 설계 Ⅰ의 2단계 정착은 전체 노드를 쓰는 필수 선형 작업과 중복 dirty/의존 장부를 구분해서 겨냥해야 합니다.

CPU 반복 1,372회, 비 idle 수집 10045.9ms입니다. 아래 자기 시간은 **수집 전체의 ms**이며 연산당 ms가 아닙니다.

자기 시간 상위 25:

| # | function | source | self ms | self % | incl % |
|---|---|---|---|---|---|
| 1 | add | engine/settle/utils/scratch/DirtyPathSet.ts:107 | 1741.9 | 17.3 | 17.3 |
| 2 | markWrite | engine/settle/utils/input/markWrite.ts:34 | 1449.4 | 14.4 | 31.7 |
| 3 | computeStableNode | engine/settle/utils/compute/utils/computeStableNode.ts:14 | 732.4 | 7.3 | 33.6 |
| 4 | updateOutput | engine/settle/utils/output/updateOutput.ts:18 | 612.8 | 6.1 | 15.9 |
| 5 | markCommitDeliveries | engine/settle/utils/commit/markCommitDeliveries.ts:32 | 565.5 | 5.6 | 10.6 |
| 6 | registerRecalculation | engine/settle/utils/dependencies/registerRecalculation.ts:18 | 493.9 | 4.9 | 9.6 |
| 7 | commitSettlement | engine/settle/utils/commit/commitSettlement.ts:32 | 434.4 | 4.3 | 15 |
| 8 | assembleObject | engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:21 | 425.8 | 4.2 | 5.1 |
| 9 | hasOwnProperty | packages/winglet/common-utils/src/libs/hasOwnProperty.ts:29 | 419.5 | 4.2 | 4.2 |
| 10 | consume | engine/settle/utils/scratch/DirtyPathSet.ts:285 | 399.1 | 4 | 4 |
| 11 | (garbage collector) | (native) | 312 | 3.1 | 3.1 |
| 12 | dirtyChildren | engine/settle/utils/compute/dirtyChildren.ts:16 | 290.2 | 2.9 | 6.4 |
| 13 | getStaticChoices | engine/behaviors/utils/options/getStaticChoices.ts:30 | 274.7 | 2.7 | 2.7 |
| 14 | (anonymous) | engine/settle/utils/commit/commitSettlement.ts:86 | 192.9 | 1.9 | 2.7 |
| 15 | (program) | (native) | 190.9 | 1.9 | 1.9 |
| 16 | finishSettlement | engine/settle/utils/settlement/finishSettlement.ts:23 | 188 | 1.9 | 18.4 |
| 17 | sameValue | engine/utils/compute/sameValue.ts:9 | 91.1 | 0.9 | 0.9 |
| 18 | effectiveType | engine/settle/utils/commit/effectiveType.ts:11 | 90 | 0.9 | 1.2 |
| 19 | visit | engine/settle/utils/commit/commitGlobalState.ts:52 | 81.9 | 0.8 | 0.8 |
| 20 | keepsHostKeys | engine/settle/utils/input/utils/keepsHostKeys.ts:15 | 71.5 | 0.7 | 1.1 |
| 21 | nextExtras | engine/settle/utils/input/nextExtras.ts:14 | 65.1 | 0.6 | 0.6 |
| 22 | advanceFieldNodeRevision | engine/record/utils/advanceFieldNodeRevision.ts:11 | 64.7 | 0.6 | 0.7 |
| 23 | writeFieldNode | engine/settle/utils/write/writeFieldNode.ts:42 | 63.3 | 0.6 | 94.2 |
| 24 | transitionSettlement | engine/settle/utils/transition/transitionSettlement.ts:26 | 60 | 0.6 | 1.5 |
| 25 | unescapePath | packages/winglet/json/src/JSONPointer/utils/escape/unescapePath.ts:129 | 58 | 0.6 | 0.6 |

연산당 엔진 호출 상위 30(분기는 왕복 두 쓰기 기준):

| # | 함수 | 원본 | 호출/연산 |
| --- | --- | --- | ---: |
| 1 | get path | surface/runtime/FieldNode.ts | 43,689.0 |
| 2 | get name | surface/runtime/FieldNode.ts | 24,570.0 |
| 3 | get raw | surface/runtime/FieldNode.ts | 17,748.0 |
| 4 | get schemaType | surface/runtime/FieldNode.ts | 16,383.0 |
| 5 | sameValue | engine/utils/compute/sameValue.ts | 12,740.0 |
| 6 | isTreeNode | engine/settle/utils/commit/markCommitDeliveries.ts | 10,923.0 |
| 7 | captureFieldNodeChange | engine/record/utils/captureFieldNodeChange.ts | 10,922.0 |
| 8 | effectiveType | engine/settle/utils/commit/effectiveType.ts | 10,922.0 |
| 9 | isTypeName | engine/settle/utils/commit/effectiveType.ts | 10,922.0 |
| 10 | get nullable | surface/runtime/FieldNode.ts | 10,922.0 |
| 11 | add | engine/settle/utils/scratch/DirtyPathSet.ts | 10,921.0 |
| 12 | markSilent | engine/settle/utils/commit/markCommitDeliveries.ts | 9,557.0 |
| 13 | isPlain | engine/settle/utils/input/isPlain.ts | 9,555.0 |
| 14 | get children | surface/runtime/FieldNode.ts | 6,826.0 |
| 15 | has | engine/utils/emptyReadonlySet.ts | 5,461.0 |
| 16 | consume | engine/settle/utils/scratch/DirtyPathSet.ts | 5,461.0 |
| 17 | advanceFieldNodeRevision | engine/record/utils/advanceFieldNodeRevision.ts | 5,461.0 |
| 18 | canOmitFieldNodePayload | engine/record/utils/canOmitFieldNodePayload.ts | 5,461.0 |
| 19 | clearFieldNodeChanges | engine/record/utils/clearFieldNodeChanges.ts | 5,461.0 |
| 20 | isSameDeliveryValue | engine/settle/utils/commit/utils/isSameDeliveryValue.ts | 5,461.0 |
| 21 | updateOutput | engine/settle/utils/output/updateOutput.ts | 5,461.0 |
| 22 | getStaticChoices | engine/behaviors/utils/options/getStaticChoices.ts | 5,461.0 |
| 23 | staticSpec | engine/settle/utils/input/staticSpec.ts | 5,461.0 |
| 24 | delete | engine/utils/pathIndex/utils/PathStoreIndex.ts | 5,461.0 |
| 25 | markWrite | engine/settle/utils/input/markWrite.ts | 5,461.0 |
| 26 | computeStableNode | engine/settle/utils/compute/utils/computeStableNode.ts | 5,461.0 |
| 27 | isMisfit | engine/settle/utils/commit/isMisfit.ts | 5,461.0 |
| 28 | visit | engine/settle/utils/commit/commitGlobalState.ts | 5,461.0 |
| 29 | delete | engine/utils/pathIndex/PathKeyedSet.ts | 5,461.0 |
| 30 | hasDistributedChildInput | engine/settle/utils/input/hasDistributedChildInput.ts | 5,460.0 |

연산당 할당 상위 15(표본 추정; 네이티브 할당 함수의 소유자를 임의로 단정하지 않습니다):

| # | 할당 함수 | 원본/런타임 | KiB/연산 | 비중 % |
| --- | --- | --- | ---: | ---: |
| 1 | add | (native) | 1762.33 | 30.4 |
| 2 | set | (native) | 673.13 | 11.6 |
| 3 | keys | (native) | 558.14 | 9.6 |
| 4 | updateOutput | engine/settle/utils/output/updateOutput.ts | 543.09 | 9.4 |
| 5 | registerRecalculation | engine/settle/utils/dependencies/registerRecalculation.ts | 362.51 | 6.3 |
| 6 | add | engine/settle/utils/scratch/DirtyPathSet.ts | 299.64 | 5.2 |
| 7 | dirtyChildren | engine/settle/utils/compute/dirtyChildren.ts | 298.00 | 5.1 |
| 8 | next | (native) | 284.28 | 4.9 |
| 9 | markWrite | engine/settle/utils/input/markWrite.ts | 279.87 | 4.8 |
| 10 | Map | (native) | 245.33 | 4.2 |
| 11 | delete | (native) | 217.40 | 3.7 |
| 12 | Set | (native) | 203.18 | 3.5 |
| 13 | assembleObject | engine/behaviors/objectBehavior/branch/utils/assembleObject.ts | 37.27 | 0.6 |
| 14 | affected | engine/settle/utils/dependencies/getDependencyIndex.ts | 12.70 | 0.2 |
| 15 | (anonymous) | engine/settle/utils/commit/commitSettlement.ts | 9.82 | 0.2 |

### mount-oneOf-80

새 청사진을 포함한 마운트 한 번은 엔진 호출 18,855회·할당 4,584.9KiB이며 매번 청사진을 만드는 canonical 경로입니다. 포함 시간은 청사진 38.0%, 의존 색인 28.5%, 게이트 장치 13.1%이고, 자기 시간의 큰 셋은 GC 10.0%, buildNodes 8.1%, 의존 색인의 add 7.8%입니다. 할당의 큰 셋은 collectDeclarations 9.8%, getTemplateKey 7.7%, buildNodes 7.5%로, 활성 런타임 노드 수만으로 설명되지 않는 80개 선언/게이트 청사진과 등록 계획 비용이 드러납니다. 마운트에는 prepareGateTableRound·selectChildren 각 5회, mergeEffectiveSchema 39회, assembleObject 10회가 있어 호스트별 컴파일 계획을 초기 청사진과 초기 정착 사이에서 재사용할 여지가 설계 Ⅰ의 확인 대상입니다. 같은 창 0.16.1 대비 5.954배인 이 행은 app cache 재사용 장면이 아니며 D4 두 갱신 관문의 통과 여부와도 별도로 유지해야 합니다.

CPU 반복 4,463회, 비 idle 수집 10027.3ms입니다. 아래 자기 시간은 **수집 전체의 ms**이며 연산당 ms가 아닙니다.

자기 시간 상위 25:

| # | function | source | self ms | self % | incl % |
|---|---|---|---|---|---|
| 1 | (garbage collector) | (native) | 998.6 | 10 | 10 |
| 2 | buildNodes | engine/blueprint/buildNodes/buildNodes.ts:33 | 810 | 8.1 | 32.2 |
| 3 | add | engine/settle/utils/dependencies/getDependencyIndex.ts:319 | 783.4 | 7.8 | 7.9 |
| 4 | resolveDependencyPath | engine/utils/paths/resolveDependencyPath.ts:14 | 723.8 | 7.2 | 7.3 |
| 5 | prepareRegistration | engine/settle/utils/dependencies/getDependencyIndex.ts:142 | 589.5 | 5.9 | 9.5 |
| 6 | collectGateEvaluationReads | engine/blueprint/buildNodes/utils/gates/collectGateEvaluationReads.ts:13 | 533 | 5.3 | 5.3 |
| 7 | encodeLeaf | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts:14 | 443.2 | 4.4 | 4.4 |
| 8 | collectDeclarations | engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts:41 | 345.6 | 3.4 | 9.8 |
| 9 | getGateExpression | engine/settle/utils/gates/getGateExpression.ts:15 | 262.9 | 2.6 | 2.6 |
| 10 | getGateSelectionTable | engine/settle/utils/compute/childSelection/getGateSelectionTable.ts:39 | 249.3 | 2.5 | 5.1 |
| 11 | (program) | (native) | 185.1 | 1.8 | 1.8 |
| 12 | (anonymous) | engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts:135 | 155.4 | 1.6 | 1.7 |
| 13 | populateNodeChildren | engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts:25 | 149.1 | 1.5 | 23.2 |
| 14 | DependencyIndex | engine/settle/utils/dependencies/getDependencyIndex.ts:61 | 146.2 | 1.5 | 13.1 |
| 15 | substituteDependencyPaths | engine/blueprint/compileBlueprintExpressions/createDynamicFunction/utils/substituteDependencyPaths.ts:13 | 143.8 | 1.4 | 1.6 |
| 16 | (anonymous) | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts:45 | 125.7 | 1.3 | 1.3 |
| 17 | createDynamicFunction | engine/blueprint/compileBlueprintExpressions/createDynamicFunction/createDynamicFunction.ts:21 | 108.1 | 1.1 | 2.2 |
| 18 | hasTemplateCycle | engine/settle/utils/compute/hasRecursiveExpansion.ts:21 | 99.5 | 1 | 1 |
| 19 | hasOwnProperty | packages/winglet/common-utils/src/libs/hasOwnProperty.ts:29 | 99.4 | 1 | 1 |
| 20 | getDependencyIndex | engine/settle/utils/dependencies/getDependencyIndex.ts:596 | 99.1 | 1 | 23.6 |
| 21 | register | engine/settle/utils/gates/getGateRegistry.ts:118 | 96.5 | 1 | 2.2 |
| 22 | collect | engine/settle/utils/gates/getGateBudgetCap.ts:40 | 91 | 0.9 | 1.6 |
| 23 | resolveNodeTypes | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts:18 | 84 | 0.8 | 2.5 |
| 24 | blueprint | engine/blueprint/blueprint.ts:28 | 82.9 | 0.8 | 38 |
| 25 | inferAllowedTypes | engine/blueprint/buildNodes/utils/nodeTypes/inferAllowedTypes.ts:33 | 81 | 0.8 | 1.4 |

연산당 엔진 호출 상위 30(분기는 왕복 두 쓰기 기준):

| # | 함수 | 원본 | 호출/연산 |
| --- | --- | --- | ---: |
| 1 | readSchemaObject | engine/blueprint/utils/analyze/readSchemaObject.ts | 2,181.0 |
| 2 | getGateExpression | engine/settle/utils/gates/getGateExpression.ts | 1,207.0 |
| 3 | resolveDependencyPath | engine/utils/paths/resolveDependencyPath.ts | 961.0 |
| 4 | get path | surface/runtime/FieldNode.ts | 599.0 |
| 5 | readAllowedTypes | engine/blueprint/utils/allowedTypes/readAllowedTypes.ts | 573.0 |
| 6 | collect | engine/settle/utils/gates/getGateBudgetCap.ts | 565.0 |
| 7 | unionAllowedTypes | engine/blueprint/utils/allowedTypes/unionAllowedTypes.ts | 492.0 |
| 8 | isAllowedTypeList | engine/blueprint/utils/allowedTypes/readAllowedTypes.ts | 492.0 |
| 9 | encodeLeaf | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts | 483.0 |
| 10 | add | engine/settle/utils/dependencies/getDependencyIndex.ts | 400.0 |
| 11 | bindTemplatePath | engine/settle/utils/templatePaths/bindTemplatePath.ts | 330.0 |
| 12 | collectSchemaCapabilities | engine/blueprint/buildNodes/utils/declarations/collectSchemaCapabilities.ts | 323.0 |
| 13 | validateControlGroups | engine/blueprint/buildNodes/utils/declarations/validateControlGroups.ts | 323.0 |
| 14 | collectDeclarations | engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts | 323.0 |
| 15 | get | engine/utils/emptyReadonlyMap.ts | 323.0 |
| 16 | add | engine/settle/utils/gates/getGateRegistry.ts | 323.0 |
| 17 | selectEffectiveDeclarations | engine/blueprint/effectiveSchema/utils/merge/selectEffectiveDeclarations.ts | 274.0 |
| 18 | freezeEffectiveSchema | engine/blueprint/effectiveSchema/utils/finalize/freezeEffectiveSchema.ts | 251.0 |
| 19 | mergeSingleStaticContribution | engine/blueprint/effectiveSchema/utils/merge/mergeSingleStaticContribution.ts | 251.0 |
| 20 | mergeSchemaContributions | engine/blueprint/effectiveSchema/utils/merge/mergeSchemaContributions.ts | 251.0 |
| 21 | intersectAllowedTypes | engine/blueprint/utils/allowedTypes/intersectAllowedTypes.ts | 250.0 |
| 22 | finalizeEffectiveSchema | engine/blueprint/effectiveSchema/utils/finalize/finalizeEffectiveSchema.ts | 249.0 |
| 23 | parentOf | engine/settle/utils/dependencies/registerPresenceChanges.ts | 248.0 |
| 24 | foldAllowedTypes | engine/utils/nodeIdentity/foldAllowedTypes.ts | 243.0 |
| 25 | resolveNodeStrategy | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts | 243.0 |
| 26 | resolveNodeTypes | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts | 243.0 |
| 27 | getTemplateKey | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts | 243.0 |
| 28 | buildNodes | engine/blueprint/buildNodes/buildNodes.ts | 243.0 |
| 29 | hasTemplateCycle | engine/settle/utils/compute/hasRecursiveExpansion.ts | 243.0 |
| 30 | appendChildEntries | engine/blueprint/buildNodes/utils/children/appendChildEntries.ts | 242.0 |

연산당 할당 상위 15(표본 추정; 네이티브 할당 함수의 소유자를 임의로 단정하지 않습니다):

| # | 할당 함수 | 원본/런타임 | KiB/연산 | 비중 % |
| --- | --- | --- | ---: | ---: |
| 1 | collectDeclarations | engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts | 450.85 | 9.8 |
| 2 | getTemplateKey | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts | 351.80 | 7.7 |
| 3 | buildNodes | engine/blueprint/buildNodes/buildNodes.ts | 343.58 | 7.5 |
| 4 | set | (native) | 302.59 | 6.6 |
| 5 | split | (native) | 235.94 | 5.1 |
| 6 | (anonymous) | engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts | 233.85 | 5.1 |
| 7 | resolveNodeTypes | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts | 183.66 | 4.0 |
| 8 | prepareRegistration | engine/settle/utils/dependencies/getDependencyIndex.ts | 169.20 | 3.7 |
| 9 | push | (native) | 162.53 | 3.5 |
| 10 | inferAllowedTypes | engine/blueprint/buildNodes/utils/nodeTypes/inferAllowedTypes.ts | 153.52 | 3.3 |
| 11 | next | (native) | 145.42 | 3.2 |
| 12 | add | engine/settle/utils/dependencies/getDependencyIndex.ts | 131.47 | 2.9 |
| 13 | populateNodeChildren | engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts | 127.88 | 2.8 |
| 14 | Map | (native) | 123.66 | 2.7 |
| 15 | add | (native) | 122.09 | 2.7 |

### mount-nested-d6-f4

총 5,461노드 마운트는 엔진 호출 367,315회(노드당 67.3회)와 할당 43,488.8KiB(노드당 약 7.96KiB)입니다. 자기 시간의 큰 셋은 GC 25.8%, buildNodes 24.7%, encodeLeaf 8.2%이며 청사진 포함 시간 49.6%와 static-first 로드 20.3%가 중심입니다. buildNodes·populateNodeChildren·collectDeclarations의 할당이 각각 17.6%·15.7%·14.1%이므로 새 노드의 의미 작업과 별도로 선언 중간 객체·템플릿 키를 만드는 청사진 비용이 크게 남습니다. 이 장면의 computeNode·markWrite·일반 finishSettlement 호출은 0이고 static-first 경로가 작동하므로 일반 정착 바퀴의 축약을 이 마운트의 직접 원인으로 제시하면 안 됩니다. 설계 Ⅰ에서는 컴파일 계획/청사진 중간 표현과 최초 노드 실체화의 소유 범위를 나누어 확인하되, 캐시를 쓰지 않는 첫 마운트 15.5886ms와 GC 비중을 함께 추적해야 합니다.

CPU 반복 480회, 비 idle 수집 10059.5ms입니다. 아래 자기 시간은 **수집 전체의 ms**이며 연산당 ms가 아닙니다.

자기 시간 상위 25:

| # | function | source | self ms | self % | incl % |
|---|---|---|---|---|---|
| 1 | (garbage collector) | (native) | 2596.7 | 25.8 | 25.8 |
| 2 | buildNodes | engine/blueprint/buildNodes/buildNodes.ts:33 | 2488.7 | 24.7 | 49.2 |
| 3 | encodeLeaf | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts:14 | 823.3 | 8.2 | 8.2 |
| 4 | getStaticObjectEntries | engine/settle/loadFieldNodeAtMount/utils/staticFirst/getStaticObjectEntries.ts:11 | 488.2 | 4.9 | 4.9 |
| 5 | collectDeclarations | engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts:41 | 464.3 | 4.6 | 6.2 |
| 6 | loadStaticFirstTree | engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:44 | 296 | 2.9 | 20.3 |
| 7 | getStaticChoices | engine/behaviors/utils/options/getStaticChoices.ts:30 | 276.3 | 2.7 | 2.7 |
| 8 | populateNodeChildren | engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts:25 | 243.1 | 2.4 | 48.7 |
| 9 | createFieldNode | surface/utils/fieldNodeFactory.ts:77 | 209 | 2.1 | 3.2 |
| 10 | assembleObject | engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:21 | 204.7 | 2 | 2.7 |
| 11 | createChildNode | engine/settle/utils/compute/createChildNode.ts:10 | 171.8 | 1.7 | 4.9 |
| 12 | appendChildEntries | engine/blueprint/buildNodes/utils/children/appendChildEntries.ts:19 | 168.3 | 1.7 | 1.7 |
| 13 | materialize | tools/helpers/materialize.mjs:2 | 148.3 | 1.5 | 1.5 |
| 14 | (program) | (native) | 143 | 1.4 | 1.4 |
| 15 | mergeSingleStaticContribution | engine/blueprint/effectiveSchema/utils/merge/mergeSingleStaticContribution.ts:21 | 138.1 | 1.4 | 2.3 |
| 16 | isMisfit | engine/settle/utils/commit/isMisfit.ts:12 | 100.8 | 1 | 1.1 |
| 17 | freezeEffectiveSchema | engine/blueprint/effectiveSchema/utils/finalize/freezeEffectiveSchema.ts:11 | 96.3 | 1 | 1 |
| 18 | mergeEffectiveSchema | engine/blueprint/effectiveSchema/utils/merge/mergeEffectiveSchema.ts:28 | 90.9 | 0.9 | 0.9 |
| 19 | readAllowedTypes | engine/blueprint/utils/allowedTypes/readAllowedTypes.ts:16 | 81.8 | 0.8 | 1.5 |
| 20 | resolveNodeTypes | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts:18 | 68.6 | 0.7 | 1.5 |
| 21 | post | node:inspector | 53.3 | 0.5 | 0.5 |
| 22 | resolveNodeStrategy | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts:16 | 52.8 | 0.5 | 0.7 |
| 23 | getTemplateKey | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts:35 | 49.4 | 0.5 | 8.7 |
| 24 | collectSchemaCapabilities | engine/blueprint/buildNodes/utils/declarations/collectSchemaCapabilities.ts:17 | 46.9 | 0.5 | 0.5 |
| 25 | validateControlGroups | engine/blueprint/buildNodes/utils/declarations/validateControlGroups.ts:25 | 44.7 | 0.4 | 0.5 |

연산당 엔진 호출 상위 30(분기는 왕복 두 쓰기 기준):

| # | 함수 | 원본 | 호출/연산 |
| --- | --- | --- | ---: |
| 1 | readSchemaObject | engine/blueprint/utils/analyze/readSchemaObject.ts | 30,035.0 |
| 2 | get name | surface/runtime/FieldNode.ts | 21,840.0 |
| 3 | get raw | surface/runtime/FieldNode.ts | 16,383.0 |
| 4 | get children | surface/runtime/FieldNode.ts | 10,923.0 |
| 5 | unionAllowedTypes | engine/blueprint/utils/allowedTypes/unionAllowedTypes.ts | 10,922.0 |
| 6 | readAllowedTypes | engine/blueprint/utils/allowedTypes/readAllowedTypes.ts | 10,922.0 |
| 7 | isAllowedTypeList | engine/blueprint/utils/allowedTypes/readAllowedTypes.ts | 10,922.0 |
| 8 | get schemaType | surface/runtime/FieldNode.ts | 10,922.0 |
| 9 | get nullable | surface/runtime/FieldNode.ts | 10,922.0 |
| 10 | getStaticChoices | engine/behaviors/utils/options/getStaticChoices.ts | 6,826.0 |
| 11 | get rootNode | surface/runtime/FieldNode.ts | 5,464.0 |
| 12 | intersectAllowedTypes | engine/blueprint/utils/allowedTypes/intersectAllowedTypes.ts | 5,461.0 |
| 13 | freezeEffectiveSchema | engine/blueprint/effectiveSchema/utils/finalize/freezeEffectiveSchema.ts | 5,461.0 |
| 14 | mergeSingleStaticContribution | engine/blueprint/effectiveSchema/utils/merge/mergeSingleStaticContribution.ts | 5,461.0 |
| 15 | mergeSchemaContributions | engine/blueprint/effectiveSchema/utils/merge/mergeSchemaContributions.ts | 5,461.0 |
| 16 | selectEffectiveDeclarations | engine/blueprint/effectiveSchema/utils/merge/selectEffectiveDeclarations.ts | 5,461.0 |
| 17 | mergeEffectiveSchema | engine/blueprint/effectiveSchema/utils/merge/mergeEffectiveSchema.ts | 5,461.0 |
| 18 | collectSchemaCapabilities | engine/blueprint/buildNodes/utils/declarations/collectSchemaCapabilities.ts | 5,461.0 |
| 19 | validateControlGroups | engine/blueprint/buildNodes/utils/declarations/validateControlGroups.ts | 5,461.0 |
| 20 | collectDeclarations | engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts | 5,461.0 |
| 21 | resolveNodeStrategy | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts | 5,461.0 |
| 22 | resolveNodeTypes | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts | 5,461.0 |
| 23 | encodeLeaf | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts | 5,461.0 |
| 24 | getTemplateKey | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts | 5,461.0 |
| 25 | buildNodes | engine/blueprint/buildNodes/buildNodes.ts | 5,461.0 |
| 26 | advanceFieldNodeRevision | engine/record/utils/advanceFieldNodeRevision.ts | 5,461.0 |
| 27 | canOmitFieldNodePayload | engine/record/utils/canOmitFieldNodePayload.ts | 5,461.0 |
| 28 | staticSpec | engine/settle/utils/input/staticSpec.ts | 5,461.0 |
| 29 | isMisfit | engine/settle/utils/commit/isMisfit.ts | 5,461.0 |
| 30 | effectiveType | engine/settle/utils/commit/effectiveType.ts | 5,461.0 |

연산당 할당 상위 15(표본 추정; 네이티브 할당 함수의 소유자를 임의로 단정하지 않습니다):

| # | 할당 함수 | 원본/런타임 | KiB/연산 | 비중 % |
| --- | --- | --- | ---: | ---: |
| 1 | buildNodes | engine/blueprint/buildNodes/buildNodes.ts | 7662.81 | 17.6 |
| 2 | populateNodeChildren | engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts | 6812.65 | 15.7 |
| 3 | collectDeclarations | engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts | 6115.21 | 14.1 |
| 4 | getTemplateKey | engine/blueprint/buildNodes/utils/references/getTemplateKey.ts | 4685.27 | 10.8 |
| 5 | readAllowedTypes | engine/blueprint/utils/allowedTypes/readAllowedTypes.ts | 3458.06 | 8.0 |
| 6 | loadStaticFirstTree | engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts | 2784.47 | 6.4 |
| 7 | createFieldNode | surface/utils/fieldNodeFactory.ts | 2650.80 | 6.1 |
| 8 | resolveNodeStrategy | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts | 2140.94 | 4.9 |
| 9 | set | (native) | 1197.30 | 2.8 |
| 10 | values | (native) | 642.01 | 1.5 |
| 11 | add | (native) | 639.82 | 1.5 |
| 12 | materialize | file://design-opt-d0-tools/packages/canard/schema-form/architecture/verification/design-optimization/tools/helpers/materialize.mjs | 557.82 | 1.3 |
| 13 | validateControlGroups | engine/blueprint/buildNodes/utils/declarations/validateControlGroups.ts | 555.74 | 1.3 |
| 14 | mergeSingleStaticContribution | engine/blueprint/effectiveSchema/utils/merge/mergeSingleStaticContribution.ts | 516.74 | 1.2 |
| 15 | resolveNodeTypes | engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts | 513.71 | 1.2 |

## 검증과 인계

`verify-artifacts.py`가 여덟 행·24 독립 PID·표본 4,800개·AB/BA 교대·각 표본의 유한한 양수·실행 최소값/중앙값/폭/Δ 계산·네 장면 CPU/coverage/heap 원자료·기록된 단일 -1µs 예외·dist 전후 해시·제품 소스 미변경을 검증하여 `D2_ARTIFACTS_OK`를 출력했습니다. 다섯 도구 파일의 Node 문법 검사도 통과했습니다. 분석 작업으로 제품 코드 변경이 없어 전체 lint/typecheck/제품 시험을 추가 실행하지 않았으며, 여섯 PR의 기능적 통합 정합성 통과를 주장하지 않습니다.

결과는 단계 기반의 `docs/schema-form-d2-0-profile`에 이 문서 하나로 커밋하여 게시합니다. 임시 도구 변경은 외부 patch와 원자료로 보존하고 작업 트리에서 복원하며 로컬 `tmp/d1-integration`은 삭제합니다. 따라서 결과 가지에 제품 변경·통합 merge commit·런타임 번들·원자료가 들어가지 않습니다. PR을 열거나 병합하지 않습니다.

설계 Ⅰ의 우선 확인 대상은 분기의 매 쓰기 정적 게이트 증명/제어 레이어·잠복 occurrence 장부, nested 일괄의 중복 dirty 경로/의존 등록, 두 최초 마운트의 청사진 중간 표현·등록 계획입니다. 이 자료는 후보 비용의 위치와 크기를 정한 것이며 공개 경계·나감 정책·리비전 의미를 바꾸는 결정을 포함하지 않습니다.
