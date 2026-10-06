# 99C-01 — 무계측 CPU 귀속과 제거 상한

기준 HEAD는 `4ae9dced58bcbc05c05ff5907fca463af024c7b6`입니다. 99C-01의 “span 시간은 호출수로만 사용하고 sampling으로 다시 귀속하며 제거 빌드의 종단 상한을 먼저 확인한다”는 결정을 적용했습니다. 제품 구현, 설치, git 쓰기, 커밋 및 다른 에이전트 실행은 하지 않았습니다.

## 판정에 필요한 결론

분기 수가 늘 때 커지는 것은 조건 비교식 자체보다 경로 해석·투영 읽기·게이트 등록·선언 선택·재계산 표시입니다. 정적 리터럴 비교 및 미리 계산한 Boolean 조회는 첫/후속 갱신에서 잡음을 넘는 개선을 보이지 않았습니다. 전체 gate 제거의 이득을 비교식 비용으로 다시 귀속하지 않습니다.

요청된 22개 프로파일과 258개 연산별 대조(52개 변형, 동일 번들 control 포함), 구 엔진 비교 7개를 수집했습니다. paired worker는 총 795개이며 각 worker는 warmup 20, 101개 표본을 사용하고 스스로 종료했습니다. 잡음 초과 판정은 182행입니다.

코드 수준 우선 후보는 경로의 정적 바인딩, 투영 읽기 재사용, 변경 경로 표시의 중복 제거, 단일 무조건 유효 스키마의 준비, 올바른 초기 revision 스냅샷 공유, 소비자 없는 payload 지연, 첫 조립의 안정 형상 메모입니다. 완성 청사진·노드 트리·scratch 상수 재사용, 고정점·전이·나감 생략은 구조 항목입니다. 어느 상한도 구현 후 보장되는 속도 향상이나 서로 더할 수 있는 단계별 비율이 아닙니다.

## 방법과 환경

PKG의 engine 코드는 HEAD 소스에서 빌드했고 외부 workspace utility는 이미 존재하는 production dist를 양쪽에서 동일하게 사용했습니다. 표본에 나타난 외부 runtime 파일의 SHA-256을 JSON의 dependencyArtifacts에 보존했습니다.

- Apple M1 Max, 10 logical CPU, 64 GiB, darwin arm64 25.6.0; Node v26.10.0, V8 14.6.202.34-node.35, esbuild 0.25.9. NODE_ENV=production, validation off, subscribers=0, root onChange=noop.
- 새 엔진과 0.16.0(__legacy__) 모두 HEAD 소스에서 core 전용 production 번들을 만들었습니다. React·브라우저·검증기 비용은 이 작업의 표본에 포함하지 않았습니다. 인스트루먼트 span은 하나도 넣지 않았으며 함수 안에 타이머를 삽입하지 않았습니다. 함수명을 보존한 source map으로 파일:줄을 복원했습니다.
- CPU interval 요청값은 100 µs입니다. 요청값을 샘플 수에 곱하지 않고 V8 timeDeltas의 실제 간격을 가중치로 사용했습니다. 로딩/warmup 밖의 작업 구간만 선택했고 (idle)은 제외했습니다. first는 profileFirstUpdate 호출의 자손 표본만 남겨 새 마운트 표본을 분리했습니다. first의 바깥 연산 시계는 V8 내부 함수의 인라이닝을 막지 않습니다.
- later는 한 mounted form의 동일 전이를 반복합니다. 새 엔진은 128회마다 driver를 drain하고 구 엔진은 매회 drain하여 비동기 변경을 다음 연산으로 넘기지 않습니다. first는 매번 새 cold mount 뒤 첫 작성된 갱신이며 누적 동기 작업 3.5초(아주 짧은 sample-0은 5초)를 목표로 했습니다. later/mount의 driver, schema clone, GC, V8 내장 프레임은 표에 유지됩니다. 그 비율은 종단 phase 비율이 아닙니다.
- hot loop 프로파일과 warmup20/101 fresh-process 종단 측정의 JIT 및 GC 조건이 다릅니다. 프로파일의 sampled µs/op를 후자의 벽시계 시간 대신 쓰지 않습니다. 실제 표본 수와 작업/선택 시간을 각 표 앞에 적었습니다.
- 제거는 파일을 쓰지 않는 in-memory build plugin으로만 수행했습니다. 각 named body의 일치 수를 1로 검증하고 guard는 타이머 밖 준비/마운트를 원래 동작으로 유지합니다. 잘못된 결과는 허용되며 최종 출력 hash/크기/폭을 모든 paired JSON에 기록했습니다. guard·상수 조회 자체의 비용은 제거 빌드에 남습니다.
- 종단 timer는 연산 전에서 시작해 64개의 Promise turn과 같은 check queue의 setImmediate sentinel을 통과할 때 끝납니다(95C-01 방식). 양쪽은 같은 세션에서 순서를 교대합니다. schema clone·fresh mount 준비·강제 GC는 timer 밖이며 empty sentinel 101개를 앞뒤로 재서 두 median의 평균을 양쪽에서 뺐습니다. 음수는 0으로 자르지 않았습니다.
- 잡음 N은 동일 HEAD 번들을 다른 모듈로 로드한 control의 3회 median 차이와 paired median 절댓값의 최댓값입니다. 모든 run의 HEAD−ablated가 N보다 크고 각 run의 paired median 구간 하한이 0보다 클 때만 “초과”입니다. 연속 표본의 독립성은 보장되지 않으므로 구간은 보조 관찰이며 run 재현성과 control이 판정의 핵심입니다.
- 유효 스키마 상수는 BlueprintNode별 안정 객체를 사용했습니다. 매회 새 객체를 돌려주어 호스트 바퀴가 예산을 초과했던 실패 변형과 PathPrefix 반환형을 잘못 쓴 실패는 자연 종료 후 수정했고 성공 측정만 저장했습니다. 실패 시간은 채택하지 않았습니다.

재현 명령(모두 stage-07에서, 순차 실행):

```sh
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --build head old
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --profiles
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --profiles head sample-0 first 5000
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-99c01.mjs --matrix
# 구 엔진 보강: --profiles old array-100 later 50000, nested-d5-f4 later 30000, sample-0 later 55000, computed-visible-derived later 50000.
# 구 엔진 종단 비교: 표의 각 fixture/mode로 --paired old <fixture> later|mount를 실행합니다.
```

## 종단 비교 — 새 엔진과 0.16.0

| 연산 | HEAD median ms | 0.16.0 median ms | 비율 median | 3회 비율 범위 |
| --- | ---: | ---: | ---: | --- |
| sample-0/later | 0.115500 | 0.061833 | 1.832× | 1.831–1.868× |
| nested-d5-f4/later | 0.142895 | 0.067396 | 2.120× | 2.081–2.138× |
| computed-visible-derived/later | 0.231979 | 0.081625 | 2.865× | 2.780–2.934× |
| array-100/later | 0.134750 | 0.078584 | 1.683× | 1.666–1.722× |
| flat-500/mount | 4.470230 | 1.813876 | 2.466× | 2.443–2.511× |
| nested-d5-f4/mount | 13.502687 | 3.266604 | 4.137× | 4.120–4.148× |
| oneOf-20/mount | 2.277416 | 0.385687 | 5.834× | 5.709–6.365× |

원 엔진의 의미·이벤트 계약이 새 원장과 완전히 같다는 주장이 아니라, BF가 정의한 같은 작성자 연산에 대한 기준선입니다. computed-visible-derived는 의존 갱신 뒤 trigger on 상태, array-100은 첫 아이템 내부 갱신입니다. 같은 값을 반복하는 빠른 반환을 쓰지 않았습니다.

## 분기 축 — oneOf 5 → 40

oneOf fixture는 분기 조각 수만 증가하고 선택된 kind_0↔kind_4 전이, 살아 있는 자식 폭과 입력/출력 크기는 고정입니다. 증가 판단은 각 프로파일의 비율만 비교하지 않고 실제 sampled µs/op를 비교합니다. 1 µs 이상 차이, 양쪽 20개 이상 표본, 근사 표본 오차보다 큰 차이를 증가 후보로 표시했습니다. 이는 sampling 추론이며 구현 판정은 아래 제거 상한으로 합니다.

### later

최종 관찰: 5={"sha256":"0dab1516af88193530f8e44693db2dd2fb9d4c721b0de5c72fdb688315c07092","outputBytes":90,"liveWidth":5,"kind":"kind_0"}, 40={"sha256":"944f8d033acb76743764d9a30a709574d2e2f2f4895506b4779d6ea51c18a997","outputBytes":90,"liveWidth":5,"kind":"kind_4"}.

| 함수 / 원본 | self µs/op 5→40 | total µs/op 5→40 | self 표본 5/40 | total 표본 5/40 | 증가 |
| --- | ---: | ---: | ---: | ---: | --- |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 7.971→61.117 | 7.971→61.117 | 1530/3013 | 1530/3013 | self+total |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 9.036→59.210 | 39.247→241.886 | 1737/2919 | 7539/11930 | self+total |
| readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 5.656→42.808 | 7.832→58.199 | 1087/2108 | 1505/2867 | self+total |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 2.987→19.972 | 2.987→19.972 | 574/985 | 574/985 | self+total |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 4.209→19.726 | 59.010→339.894 | 808/972 | 11338/16758 | self+total |
| evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 2.373→15.769 | 20.133→150.941 | 456/779 | 3866/7441 | self+total |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.003→13.630 | 5.102→33.778 | 385/670 | 978/1658 | self+total |
| flushRead · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:74 | 0.744→9.688 | 1.074→13.132 | 143/478 | 206/648 | self+total |
| locate · PKG/src/core/settle/utils/gates/getGateRegistry.ts:83 | 1.373→9.967 | 1.651→13.402 | 264/492 | 317/661 | self+total |
| (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 1.367→9.795 | 15.161→111.775 | 262/483 | 2911/5509 | self+total |
| getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 0.813→9.228 | 0.813→9.228 | 156/455 | 156/455 | self+total |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.765→9.778 | 3.012→10.154 | 529/482 | 577/501 | self+total |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.426→8.437 | 1.426→8.437 | 273/414 | 273/414 | self+total |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 0.827→7.752 | 0.827→7.752 | 160/383 | 160/383 | self+total |
| flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 0.386→5.131 | 3.294→39.146 | 74/253 | 632/1930 | self+total |
| flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 0.638→5.336 | 3.932→44.482 | 123/263 | 755/2193 | self+total |
| collect · PKG/src/core/settle/utils/write/getDependencyIndex.ts:83 | 0.499→4.955 | 0.650→6.196 | 96/243 | 125/304 | self+total |
| primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 1.730→5.819 | 1.927→6.332 | 332/286 | 370/311 | self+total |
| register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 2.652→6.083 | 4.023→7.544 | 507/299 | 771/372 | self+total |
| projectedEmission · PKG/src/core/settle/utils/gates/readProjectedValue.ts:13 | 0.806→4.196 | 0.806→4.196 | 155/207 | 155/207 | self+total |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 1.175→3.997 | 9.245→52.979 | 226/195 | 1779/2609 | self+total |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.546→3.182 | 6.572→44.670 | 105/157 | 1263/2200 | self+total |
| unescapePath · packages/winglet/json/dist/JSONPointer/utils/escape/unescapePath.cjs:6 | 0.361→2.772 | 0.361→2.772 | 69/137 | 69/137 | self+total |
| getControlLayers · PKG/src/core/settle/utils/controls/getControlLayers.ts:56 | 2.046→4.384 | 2.569→4.868 | 394/217 | 494/241 | self+total |
| mayChangeOwnDeclarationAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:121 | 0.239→2.505 | 0.484→2.810 | 45/123 | 92/138 | self+total |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 2.790→5.030 | 3.083→5.952 | 537/249 | 594/295 | self+total |
| getGateRegistry · PKG/src/core/settle/utils/gates/getGateRegistry.ts:222 | 0.536→2.495 | 0.536→2.495 | 103/123 | 103/123 | self+total |
| mayChangeAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:113 | 0.365→1.928 | 0.376→1.928 | 70/94 | 72/94 | self+total |
| flushPendingOutput · PKG/src/core/settle/utils/compute/flushPendingOutput.ts:12 | 0.239→1.593 | 1.309→5.653 | 46/79 | 251/279 | self+total |
| bindTemplatePath · PKG/src/core/settle/utils/paths/bindTemplatePath.ts:7 | 0.291→1.627 | 0.291→1.627 | 56/80 | 56/80 | self+total |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 0.291→1.455 | 1.420→9.148 | 56/72 | 273/451 | self+total |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.431→1.486 | 103.944→424.268 | 83/73 | 19977/20914 | self+total |
| bindGateHostPath · PKG/src/core/settle/utils/gates/bindGateHostPath.ts:12 | 0.131→1.116 | 0.256→1.419 | 25/55 | 49/70 | total |
| readUnsetPolicy · PKG/src/core/settle/utils/transition/readUnsetPolicy.ts:11 | 0.597→1.500 | 2.414→4.331 | 115/74 | 464/214 | total |
| relocated · PKG/src/core/settle/utils/gates/getGateRegistry.ts:107 | 0.218→1.107 | 0.255→1.532 | 42/54 | 49/75 | total |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.155→0.870 | 5.944→41.146 | 30/43 | 1142/2026 | total |
| affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 0.287→0.795 | 1.017→7.115 | 55/39 | 195/349 | total |
| finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.578→1.051 | 16.651→21.919 | 111/52 | 3201/1083 | total |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.738→1.158 | 19.326→22.427 | 142/57 | 3720/1109 | total |
| walkOwnedSchemaNodes · PKG/src/core/settle/utils/walkOwnedSchemaNodes.ts:9 | 0.247→0.588 | 4.238→6.433 | 47/29 | 813/318 | total |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 0.569→0.766 | 3.915→11.469 | 110/38 | 751/566 | total |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.315→0.465 | 37.542→46.448 | 60/23 | 7221/2296 | total |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.971→1.118 | 4.427→7.395 | 189/56 | 854/367 | total |
| applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.173→0.286 | 11.439→15.106 | 33/14 | 2199/746 | total |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.031→0.081 | 104.412→425.183 | 6/4 | 20067/20959 | total |
| captureExitedRaw · PKG/src/core/settle/utils/transition/captureExitedRaw.ts:19 | 0.510→0.551 | 6.934→8.162 | 98/27 | 1332/403 | total |
| snapshotExitedPolicies · PKG/src/core/settle/utils/commit/snapshotExitedPolicies.ts:14 | 0.036→0.061 | 1.641→2.768 | 7/3 | 315/137 | total |
| relocatedGates · PKG/src/core/settle/utils/compute/relocatedGates.ts:10 | 0.000→0.020 | 0.281→1.613 | 0/1 | 54/79 | total |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.011→0.000 | 104.423→425.203 | 2/0 | 20069/20960 | total |

### first

최종 관찰: 5={"sha256":"944f8d033acb76743764d9a30a709574d2e2f2f4895506b4779d6ea51c18a997","outputBytes":90,"liveWidth":5,"kind":"kind_4"}, 40={"sha256":"944f8d033acb76743764d9a30a709574d2e2f2f4895506b4779d6ea51c18a997","outputBytes":90,"liveWidth":5,"kind":"kind_4"}.

| 함수 / 원본 | self µs/op 5→40 | total µs/op 5→40 | self 표본 5/40 | total 표본 5/40 | 증가 |
| --- | ---: | ---: | ---: | ---: | --- |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 12.736→120.976 | 12.736→120.976 | 1894/3749 | 1894/3749 | self+total |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 17.814→122.658 | 72.517→485.731 | 2654/3807 | 10797/15067 | self+total |
| readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 10.028→83.181 | 14.436→114.056 | 1491/2575 | 2147/3532 | self+total |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 9.436→43.754 | 114.947→700.939 | 1404/1353 | 17102/21726 | self+total |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 5.479→36.611 | 5.479→36.611 | 814/1134 | 814/1134 | self+total |
| evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 4.187→34.248 | 37.223→302.340 | 624/1061 | 5537/9367 | self+total |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 4.411→28.114 | 11.000→66.242 | 657/864 | 1634/2033 | self+total |
| getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 1.965→21.560 | 1.965→21.560 | 293/669 | 293/669 | self+total |
| (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 2.297→19.454 | 27.754→222.215 | 341/603 | 4126/6883 | self+total |
| flushRead · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:74 | 0.556→17.485 | 0.949→24.470 | 83/542 | 142/758 | self+total |
| locate · PKG/src/core/settle/utils/gates/getGateRegistry.ts:83 | 1.765→17.648 | 2.490→22.196 | 263/547 | 371/688 | self+total |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 1.592→15.655 | 1.592→15.655 | 237/486 | 237/486 | self+total |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 6.007→19.745 | 6.637→20.649 | 890/612 | 984/640 | self+total |
| collect · PKG/src/core/settle/utils/write/getDependencyIndex.ts:83 | 1.369→12.892 | 1.733→15.963 | 203/395 | 257/490 | self+total |
| primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 3.412→13.964 | 3.985→14.866 | 506/429 | 591/457 | self+total |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 2.010→11.699 | 2.010→11.699 | 299/359 | 299/359 | self+total |
| flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 0.663→10.042 | 2.956→84.189 | 99/311 | 442/2610 | self+total |
| ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 4.750→13.685 | 4.803→13.718 | 704/427 | 712/428 | self+total |
| flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 0.273→9.010 | 2.292→74.109 | 41/280 | 343/2298 | self+total |
| projectedEmission · PKG/src/core/settle/utils/gates/readProjectedValue.ts:13 | 1.518→9.915 | 1.518→9.915 | 226/307 | 226/307 | self+total |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 1.201→7.947 | 13.408→97.135 | 178/246 | 1992/3004 | self+total |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 2.092→8.206 | 19.777→115.994 | 312/255 | 2942/3590 | self+total |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.160→6.659 | 3.228→20.969 | 173/207 | 481/651 | self+total |
| unescapePath · packages/winglet/json/dist/JSONPointer/utils/escape/unescapePath.cjs:6 | 0.888→5.811 | 0.888→5.811 | 133/181 | 133/181 | self+total |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 5.853→10.139 | 6.512→11.178 | 870/314 | 969/347 | self+total |
| getGateRegistry · PKG/src/core/settle/utils/gates/getGateRegistry.ts:222 | 1.039→5.139 | 1.039→5.139 | 155/159 | 155/159 | self+total |
| register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 2.139→5.967 | 3.972→7.304 | 319/185 | 592/226 | self+total |
| mayChangeAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:113 | 0.627→4.164 | 0.682→4.293 | 93/128 | 101/132 | self+total |
| getControlLayers · PKG/src/core/settle/utils/controls/getControlLayers.ts:56 | 2.711→5.995 | 3.552→6.768 | 401/186 | 525/210 | self+total |
| bindTemplatePath · PKG/src/core/settle/utils/paths/bindTemplatePath.ts:7 | 0.398→3.645 | 0.398→3.645 | 59/113 | 59/113 | self+total |
| mayChangeOwnDeclarationAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:121 | 0.663→3.804 | 1.206→4.384 | 99/116 | 180/134 | self+total |
| flushPendingOutput · PKG/src/core/settle/utils/compute/flushPendingOutput.ts:12 | 0.666→3.574 | 2.933→9.047 | 99/111 | 437/281 | self+total |
| bindGateHostPath · PKG/src/core/settle/utils/gates/bindGateHostPath.ts:12 | 0.122→2.714 | 0.155→3.096 | 18/84 | 23/96 | total |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.308→2.291 | 12.127→88.448 | 46/71 | 1802/2735 | self+total |
| updateInactiveValuesMemo · PKG/src/core/settle/utils/commit/updateInactiveValuesMemo.ts:23 | 1.750→3.441 | 5.366→7.264 | 259/106 | 794/224 | self+total |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.900→2.236 | 22.450→28.392 | 133/68 | 3309/877 | self+total |
| relocated · PKG/src/core/settle/utils/gates/getGateRegistry.ts:107 | 0.410→1.580 | 0.480→2.097 | 61/49 | 71/65 | self+total |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.511→1.662 | 174.109→838.877 | 76/51 | 25840/25979 | self+total |
| transitionSettlement · PKG/src/core/settle/utils/transition/transitionSettlement.ts:28 | 3.448→4.430 | 54.608→368.577 | 512/138 | 8118/11434 | total |
| affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 1.263→2.240 | 3.187→18.540 | 186/68 | 471/568 | total |
| walkOwnedSchemaNodes · PKG/src/core/settle/utils/walkOwnedSchemaNodes.ts:9 | 0.803→1.734 | 5.075→8.727 | 118/54 | 745/271 | total |
| readUnsetPolicy · PKG/src/core/settle/utils/transition/readUnsetPolicy.ts:11 | 0.656→1.509 | 2.753→4.799 | 96/47 | 406/149 | total |
| readDepartingAncestorPolicy · PKG/src/core/settle/utils/transition/readDepartingAncestorPolicy.ts:13 | 0.229→0.960 | 0.542→2.022 | 34/30 | 80/63 | total |
| markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 0.547→1.270 | 1.383→2.537 | 80/39 | 204/78 | total |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.519→1.221 | 95.304→426.924 | 77/38 | 14116/13242 | total |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 1.038→1.707 | 8.648→23.684 | 153/53 | 1281/734 | total |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 2.028→2.688 | 9.451→10.848 | 299/83 | 1396/336 | total |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 1.890→2.507 | 17.861→31.733 | 282/78 | 2656/987 | total |
| readDefault · PKG/src/core/settle/utils/transition/readDefault.ts:14 | 0.313→0.841 | 0.978→2.029 | 46/26 | 146/63 | total |
| finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.884→1.285 | 17.552→28.413 | 130/40 | 2586/883 | total |
| (anonymous) · PKG/src/core/settle/utils/commit/snapshotExitedPolicies.ts:19 | 1.104→1.449 | 1.931→3.064 | 161/45 | 282/95 | total |
| applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.243→0.546 | 12.356→19.524 | 36/17 | 1819/607 | total |
| writeLatentRaw · PKG/src/core/settle/utils/transition/writeLatentRaw.ts:16 | 0.074→0.290 | 5.982→7.549 | 11/9 | 879/235 | total |
| (anonymous) · PKG/src/core/settle/utils/transition/finalizeExits.ts:30 | 0.458→0.643 | 1.933→3.153 | 68/20 | 286/98 | total |
| setLatentRaw · PKG/src/core/settle/utils/latent/setLatentRaw.ts:21 | 2.255→2.416 | 5.929→7.194 | 332/75 | 871/224 | total |
| captureExitedRaw · PKG/src/core/settle/utils/transition/captureExitedRaw.ts:19 | 0.515→0.674 | 7.380→10.188 | 76/21 | 1086/317 | total |
| snapshotExitedPolicies · PKG/src/core/settle/utils/commit/snapshotExitedPolicies.ts:14 | 0.117→0.195 | 2.630→4.064 | 17/6 | 384/126 | total |
| relocatedGates · PKG/src/core/settle/utils/compute/relocatedGates.ts:10 | 0.007→0.064 | 0.547→2.320 | 1/2 | 81/72 | total |
| createChildNode · PKG/src/core/settle/utils/compute/createChildNode.ts:10 | 0.041→0.037 | 6.618→15.010 | 6/1 | 982/468 | total |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.020→0.000 | 174.964→840.447 | 3/0 | 25966/26027 | total |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.054→0.032 | 174.884→840.447 | 8/1 | 25955/26027 | total |
| createSchemaNode · PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 0.381→0.321 | 6.571→14.973 | 57/10 | 975/467 | total |

## 연산별 프로파일

각 표는 self 상위 25와 total 상위 25의 합집합 및 self 또는 total이 2% 이상인 모든 함수를 포함합니다. self는 잎의 시간, total은 자손 포함 시간입니다. 재귀로 같은 function/file:line이 여러 번 등장해도 한 sample의 inclusive 시간은 한 번만 셉니다. 행끼리 total을 더하지 않습니다.

### head · array-100/first

연산 222,961회; 작업 벽시계 204129.478 ms; 첫 갱신 누적 동기 작업 3500.009 ms; 선택된 비유휴 표본 19,024개 / 2983.930 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-array-100-first.json](profile-99c01/profile-99c01-head-array-100-first.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 24.44 | 24.96 | 729.242 | 744.689 | 4508 | 4608 |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 8.34 | 8.34 | 248.780 | 248.780 | 1602 | 1602 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 7.26 | 23.96 | 216.645 | 714.991 | 1400 | 4613 |
| getSettlementScratch · PKG/src/core/settle/utils/write/getSettlementScratch.ts:9 | 3.65 | 3.80 | 108.852 | 113.410 | 697 | 726 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.30 | 7.37 | 98.606 | 219.913 | 628 | 1403 |
| beginPostOrder · PKG/src/core/settle/utils/write/DirtyPathSet.ts:22 | 3.23 | 3.23 | 96.258 | 96.258 | 622 | 622 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 3.15 | 3.15 | 93.982 | 93.982 | 607 | 607 |
| getSchemaNodePath · PKG/src/core/navigation/utils/query/utils/getSchemaNodePath.ts:10 | 3.11 | 3.11 | 92.773 | 92.773 | 593 | 593 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.80 | 38.92 | 83.465 | 1161.381 | 541 | 7298 |
| (anonymous) · PKG/src/core/settle/utils/commit/commitSettlement.ts:71 | 2.77 | 4.37 | 82.565 | 130.257 | 535 | 841 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 2.72 | 2.72 | 81.100 | 81.100 | 523 | 523 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.48 | 28.87 | 74.057 | 861.346 | 475 | 5555 |
| pruneLatentRaw · PKG/src/core/settle/utils/write/pruneLatentRaw.ts:16 | 2.31 | 2.49 | 68.952 | 74.318 | 444 | 478 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 2.19 | 30.86 | 65.319 | 920.714 | 421 | 5742 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 2.00 | 88.47 | 59.667 | 2639.900 | 384 | 16826 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 1.68 | 1.68 | 50.245 | 50.245 | 322 | 322 |
| commitGlobalState · PKG/src/core/settle/utils/commit/commitGlobalState.ts:11 | 1.55 | 1.55 | 46.317 | 46.317 | 299 | 299 |
| markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 1.34 | 4.03 | 40.012 | 120.342 | 258 | 774 |
| visit · PKG/src/core/settle/utils/commit/commitGlobalState.ts:43 | 1.33 | 1.33 | 39.771 | 39.771 | 258 | 258 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.25 | 5.02 | 37.214 | 149.806 | 240 | 968 |
| sameValue · PKG/src/core/settle/utils/compute/sameValue.ts:9 | 1.20 | 1.20 | 35.948 | 35.948 | 230 | 230 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.12 | 1.70 | 33.358 | 50.866 | 216 | 329 |
| assembleArray · PKG/src/core/behaviors/arrayBehavior/utils/value/assembleArray.ts:19 | 1.10 | 1.12 | 32.945 | 33.405 | 213 | 216 |
| runDeliveryWaves · PKG/src/core/dispatch/utils/chain/runDeliveryWaves.ts:9 | 0.90 | 1.32 | 26.979 | 39.390 | 173 | 253 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.90 | 8.27 | 26.738 | 246.821 | 171 | 1575 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.70 | 29.89 | 20.988 | 891.759 | 136 | 5752 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.32 | 91.41 | 9.592 | 2727.726 | 61 | 17390 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.05 | 8.36 | 1.408 | 249.419 | 9 | 1606 |
| profileFirstUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:157 | 0.03 | 100.00 | 0.920 | 2983.930 | 6 | 19024 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01 | 91.68 | 0.336 | 2735.574 | 2 | 17439 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 2983.930 | 0 | 19024 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.00 | 99.99 | 0.000 | 2983.776 | 0 | 19023 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 8.27 | 0.000 | 246.821 | 0 | 1575 |

### head · computed-visible-derived/first

연산 141,665회; 작업 벽시계 22132.394 ms; 첫 갱신 누적 동기 작업 3500.013 ms; 선택된 비유휴 표본 19,135개 / 2926.496 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-computed-visible-derived-first.json](profile-99c01/profile-99c01-head-computed-visible-derived-first.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 6.48 | 6.48 | 189.698 | 189.698 | 1241 | 1241 |
| updateCommittedRuleValue · PKG/src/core/settle/utils/commit/updateCommittedRuleValue.ts:14 | 4.60 | 8.97 | 134.630 | 262.581 | 882 | 1720 |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 4.32 | 7.46 | 126.375 | 218.413 | 825 | 1426 |
| getDeriveSourceNodes · PKG/src/core/settle/derive/utils/evaluate/utils/getDeriveSourceNodes.ts:13 | 3.99 | 4.60 | 116.636 | 134.718 | 763 | 881 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 3.89 | 15.30 | 113.801 | 447.674 | 746 | 2933 |
| affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 3.33 | 5.01 | 97.576 | 146.518 | 638 | 958 |
| collectDeriveConvergenceTargets · PKG/src/core/blueprint/utils/analyze/collectDeriveConvergenceTargets.ts:31 | 3.26 | 4.37 | 95.324 | 127.975 | 623 | 837 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.93 | 22.81 | 85.676 | 667.623 | 560 | 4359 |
| releaseSettlementScratch · PKG/src/core/settle/utils/write/releaseSettlementScratch.ts:8 | 2.54 | 2.93 | 74.290 | 85.777 | 487 | 562 |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 2.52 | 2.52 | 73.805 | 73.805 | 481 | 481 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.48 | 2.75 | 72.674 | 80.337 | 470 | 520 |
| sameValue · PKG/src/core/settle/utils/compute/sameValue.ts:9 | 2.43 | 2.43 | 71.044 | 71.044 | 465 | 465 |
| evaluateDeriveRound · PKG/src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:31 | 2.28 | 12.61 | 66.658 | 369.058 | 436 | 2409 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.23 | 34.12 | 65.147 | 998.632 | 427 | 6543 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 1.86 | 1.86 | 54.542 | 54.542 | 357 | 357 |
| getDeriveRuleKey · PKG/src/core/settle/derive/utils/edges/getDeriveRuleKey.ts:16 | 1.75 | 1.75 | 51.170 | 51.324 | 333 | 334 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.71 | 7.32 | 49.936 | 214.286 | 327 | 1401 |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 1.70 | 2.00 | 49.684 | 58.590 | 325 | 383 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 1.61 | 3.08 | 47.044 | 90.116 | 307 | 588 |
| getPrefix · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:109 | 1.47 | 1.49 | 42.957 | 43.615 | 281 | 285 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 1.42 | 1.42 | 41.476 | 41.476 | 271 | 271 |
| (anonymous) · PKG/src/core/settle/utils/commit/commitSettlement.ts:71 | 1.37 | 2.48 | 40.198 | 72.660 | 264 | 476 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 1.37 | 1.52 | 40.068 | 44.527 | 262 | 291 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.27 | 1.84 | 37.168 | 53.769 | 243 | 352 |
| getStoreKeyPaths · PKG/src/core/utils/pathIndex/utils/getStoreKeyPaths.ts:9 | 1.25 | 1.25 | 36.628 | 36.628 | 240 | 240 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 1.22 | 5.41 | 35.767 | 158.241 | 234 | 1030 |
| getOrCollect · PKG/src/core/blueprint/utils/features/DeriveConvergenceTargets.ts:33 | 0.97 | 5.48 | 28.249 | 160.437 | 186 | 1050 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.91 | 93.91 | 26.503 | 2748.336 | 173 | 17972 |
| collectDeriveSourcePaths · PKG/src/core/settle/utils/derivation/collectDeriveSourcePaths.ts:10 | 0.89 | 2.19 | 25.981 | 64.073 | 169 | 418 |
| add · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:34 | 0.89 | 2.38 | 25.978 | 69.743 | 170 | 456 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.87 | 2.57 | 25.323 | 75.327 | 166 | 493 |
| evaluateResetInteraction · PKG/src/core/settle/derive/utils/evaluate/evaluateResetInteraction.ts:22 | 0.84 | 3.63 | 24.558 | 106.262 | 161 | 696 |
| evaluateScopedExpression · PKG/src/core/settle/derive/utils/evaluate/utils/evaluateScopedExpression.ts:23 | 0.81 | 2.23 | 23.721 | 65.331 | 155 | 427 |
| runDeriveRounds · PKG/src/core/settle/utils/derivation/runDeriveRounds.ts:29 | 0.70 | 33.58 | 20.629 | 982.715 | 135 | 6425 |
| readDeriveDependency · PKG/src/core/settle/derive/utils/evaluate/utils/readDeriveDependency.ts:14 | 0.67 | 3.43 | 19.736 | 100.423 | 129 | 655 |
| commitDeriveRules · PKG/src/core/settle/utils/commit/commitDeriveRules.ts:19 | 0.66 | 13.90 | 19.449 | 406.840 | 128 | 2666 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.58 | 69.32 | 17.066 | 2028.713 | 112 | 13278 |
| pruneCommittedRuleKeys · PKG/src/core/settle/utils/commit/pruneCommittedRuleKeys.ts:13 | 0.57 | 4.59 | 16.636 | 134.198 | 109 | 879 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.40 | 3.48 | 11.692 | 101.808 | 76 | 664 |
| set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 0.30 | 3.92 | 8.878 | 114.792 | 58 | 751 |
| (anonymous) · PKG/src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:102 | 0.27 | 2.45 | 7.950 | 71.807 | 52 | 468 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.18 | 96.31 | 5.212 | 2818.576 | 34 | 18431 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.10 | 6.54 | 2.867 | 191.521 | 19 | 1253 |
| profileFirstUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:157 | 0.08 | 100.00 | 2.401 | 2926.496 | 16 | 19135 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.07 | 96.43 | 2.005 | 2822.132 | 13 | 18454 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 2926.496 | 0 | 19135 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.00 | 99.96 | 0.000 | 2925.275 | 0 | 19127 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 3.48 | 0.000 | 101.808 | 0 | 664 |

### head · nested-d5-f4/first

연산 56,958회; 작업 벽시계 776770.526 ms; 첫 갱신 누적 동기 작업 3500.019 ms; 선택된 비유휴 표본 22,074개 / 3485.137 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-nested-d5-f4-first.json](profile-99c01/profile-99c01-head-nested-d5-f4-first.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 26.36 | 26.94 | 918.589 | 938.724 | 5750 | 5878 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 7.06 | 18.61 | 246.181 | 648.548 | 1575 | 4149 |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 5.48 | 5.48 | 190.818 | 190.818 | 1220 | 1220 |
| getSchemaNodePath · PKG/src/core/navigation/utils/query/utils/getSchemaNodePath.ts:10 | 4.88 | 4.88 | 170.015 | 170.015 | 1077 | 1077 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 3.86 | 3.86 | 134.449 | 134.449 | 851 | 851 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.53 | 8.52 | 123.016 | 296.803 | 770 | 1871 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 3.45 | 33.39 | 120.376 | 1163.684 | 770 | 7316 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 3.17 | 24.01 | 110.578 | 836.927 | 707 | 5350 |
| beginPostOrder · PKG/src/core/settle/utils/write/DirtyPathSet.ts:22 | 2.95 | 2.95 | 102.842 | 102.842 | 654 | 654 |
| pruneLatentRaw · PKG/src/core/settle/utils/write/pruneLatentRaw.ts:16 | 2.74 | 2.95 | 95.635 | 102.737 | 603 | 648 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.70 | 40.31 | 94.048 | 1405.009 | 597 | 8850 |
| getSettlementScratch · PKG/src/core/settle/utils/write/getSettlementScratch.ts:9 | 2.32 | 2.61 | 80.948 | 90.841 | 514 | 577 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 2.31 | 2.31 | 80.552 | 80.552 | 514 | 514 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 2.23 | 87.07 | 77.634 | 3034.340 | 492 | 19224 |
| (anonymous) · PKG/src/core/settle/utils/commit/commitSettlement.ts:71 | 1.81 | 2.83 | 63.074 | 98.695 | 404 | 631 |
| sameValue · PKG/src/core/settle/utils/compute/sameValue.ts:9 | 1.71 | 1.71 | 59.766 | 59.766 | 382 | 382 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.53 | 5.07 | 53.445 | 176.857 | 338 | 1122 |
| commitGlobalState · PKG/src/core/settle/utils/commit/commitGlobalState.ts:11 | 1.39 | 1.39 | 48.519 | 48.519 | 311 | 311 |
| markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 1.27 | 5.21 | 44.277 | 181.516 | 281 | 1148 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 1.21 | 9.73 | 42.084 | 339.040 | 267 | 2139 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 0.88 | 0.88 | 30.598 | 30.598 | 194 | 194 |
| releaseSettlementScratch · PKG/src/core/settle/utils/write/releaseSettlementScratch.ts:8 | 0.88 | 1.03 | 30.594 | 35.756 | 195 | 228 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 0.80 | 1.37 | 27.732 | 47.613 | 176 | 301 |
| staticSpec · PKG/src/core/settle/utils/write/staticSpec.ts:16 | 0.76 | 0.76 | 26.360 | 26.360 | 166 | 166 |
| visit · PKG/src/core/settle/utils/commit/commitGlobalState.ts:43 | 0.72 | 0.72 | 24.952 | 24.952 | 160 | 160 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.70 | 24.98 | 24.349 | 870.668 | 156 | 5566 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.34 | 89.78 | 11.855 | 3129.067 | 74 | 19826 |
| profileFirstUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:157 | 0.12 | 100.00 | 4.206 | 3485.137 | 27 | 22074 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.09 | 5.48 | 3.166 | 191.157 | 20 | 1222 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.02 | 90.12 | 0.763 | 3140.970 | 5 | 19902 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3485.137 | 0 | 22074 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.00 | 99.96 | 0.000 | 3483.757 | 0 | 22065 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 9.72 | 0.000 | 338.887 | 0 | 2138 |

### head · oneOf-40/first

연산 4,014회; 작업 벽시계 12370.013 ms; 첫 갱신 누적 동기 작업 3500.540 ms; 선택된 비유휴 표본 26,074개 / 3380.018 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-oneOf-40-first.json](profile-99c01/profile-99c01-head-oneOf-40-first.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 14.57 | 57.68 | 492.351 | 1949.725 | 3807 | 15067 |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 14.37 | 14.37 | 485.596 | 485.596 | 3749 | 3749 |
| readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 9.88 | 13.54 | 333.888 | 457.820 | 2575 | 3532 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 5.20 | 83.24 | 175.627 | 2813.571 | 1353 | 21726 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 4.35 | 4.35 | 146.957 | 146.957 | 1134 | 1134 |
| evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 4.07 | 35.90 | 137.471 | 1213.593 | 1061 | 9367 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 3.34 | 7.87 | 112.848 | 265.896 | 864 | 2033 |
| getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 2.56 | 2.56 | 86.542 | 86.542 | 669 | 669 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.34 | 2.45 | 79.256 | 82.887 | 612 | 640 |
| (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 2.31 | 26.39 | 78.088 | 891.970 | 603 | 6883 |
| locate · PKG/src/core/settle/utils/gates/getGateRegistry.ts:83 | 2.10 | 2.64 | 70.839 | 89.093 | 547 | 688 |
| flushRead · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:74 | 2.08 | 2.91 | 70.185 | 98.222 | 542 | 758 |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 1.86 | 1.86 | 62.840 | 62.840 | 486 | 486 |
| (anonymous) · (V8):1 | 1.73 | 1.73 | 58.354 | 58.354 | 451 | 451 |
| primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 1.66 | 1.77 | 56.052 | 59.674 | 429 | 457 |
| ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 1.63 | 1.63 | 54.933 | 55.066 | 427 | 428 |
| collect · PKG/src/core/settle/utils/write/getDependencyIndex.ts:83 | 1.53 | 1.90 | 51.750 | 64.077 | 395 | 490 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.39 | 1.39 | 46.960 | 46.960 | 359 | 359 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 1.20 | 1.33 | 40.697 | 44.869 | 314 | 347 |
| flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 1.19 | 10.00 | 40.307 | 337.935 | 311 | 2610 |
| projectedEmission · PKG/src/core/settle/utils/gates/readProjectedValue.ts:13 | 1.18 | 1.18 | 39.800 | 39.800 | 307 | 307 |
| flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 1.07 | 8.80 | 36.166 | 297.472 | 280 | 2298 |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.97 | 13.78 | 32.938 | 465.601 | 255 | 3590 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.94 | 11.54 | 31.898 | 389.899 | 246 | 3004 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 0.79 | 2.49 | 26.729 | 84.168 | 207 | 651 |
| transitionSettlement · PKG/src/core/settle/utils/transition/transitionSettlement.ts:28 | 0.53 | 43.77 | 17.783 | 1479.470 | 138 | 11434 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.30 | 3.77 | 10.062 | 127.376 | 78 | 987 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.27 | 10.50 | 9.195 | 355.032 | 71 | 2735 |
| affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 0.27 | 2.20 | 8.991 | 74.418 | 68 | 568 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.27 | 3.37 | 8.977 | 113.966 | 68 | 877 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 0.20 | 2.81 | 6.853 | 95.068 | 53 | 734 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.20 | 99.62 | 6.673 | 3367.252 | 51 | 25979 |
| finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.15 | 3.37 | 5.159 | 114.050 | 40 | 883 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.14 | 50.70 | 4.901 | 1713.672 | 38 | 13242 |
| applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.06 | 2.32 | 2.190 | 78.370 | 17 | 607 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.00 | 99.81 | 0.130 | 3373.553 | 1 | 26027 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3380.018 | 0 | 26074 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.00 | 100.00 | 0.000 | 3380.018 | 0 | 26074 |
| profileFirstUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:157 | 0.00 | 100.00 | 0.000 | 3380.018 | 0 | 26074 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.00 | 99.81 | 0.000 | 3373.553 | 0 | 26027 |

### head · oneOf-5/first

연산 19,202회; 작업 벽시계 11755.149 ms; 첫 갱신 누적 동기 작업 3500.128 ms; 선택된 비유휴 표본 26,097개 / 3377.200 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-oneOf-5-first.json](profile-99c01/profile-99c01-head-oneOf-5-first.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 10.13 | 41.23 | 342.068 | 1392.481 | 2654 | 10797 |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 7.24 | 7.24 | 244.557 | 244.557 | 1894 | 1894 |
| readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 5.70 | 8.21 | 192.565 | 277.198 | 1491 | 2147 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 5.37 | 65.36 | 181.192 | 2207.205 | 1404 | 17102 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 3.42 | 3.77 | 115.346 | 127.445 | 890 | 984 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 3.33 | 3.70 | 112.392 | 125.048 | 870 | 969 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 3.12 | 3.12 | 105.204 | 105.204 | 814 | 814 |
| ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 2.70 | 2.73 | 91.211 | 92.234 | 704 | 712 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.51 | 6.25 | 84.703 | 211.219 | 657 | 1634 |
| evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 2.38 | 21.16 | 80.404 | 714.752 | 624 | 5537 |
| getPrefix · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:109 | 2.02 | 2.03 | 68.051 | 68.440 | 522 | 525 |
| transitionSettlement · PKG/src/core/settle/utils/transition/transitionSettlement.ts:28 | 1.96 | 31.05 | 66.214 | 1048.580 | 512 | 8118 |
| primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 1.94 | 2.27 | 65.515 | 76.514 | 506 | 591 |
| getControlLayers · PKG/src/core/settle/utils/controls/getControlLayers.ts:56 | 1.54 | 2.02 | 52.062 | 68.197 | 401 | 525 |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 1.48 | 1.48 | 50.067 | 50.067 | 386 | 386 |
| _SchemaNodeRevisionLedger · PKG/src/core/record/utils/SchemaNodeRevisionLedger.ts:18 | 1.46 | 1.57 | 49.200 | 53.102 | 379 | 409 |
| (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 1.31 | 15.78 | 44.107 | 532.927 | 341 | 4126 |
| setLatentRaw · PKG/src/core/settle/utils/latent/setLatentRaw.ts:21 | 1.28 | 3.37 | 43.300 | 113.840 | 332 | 871 |
| register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 1.22 | 2.26 | 41.071 | 76.273 | 319 | 592 |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 1.19 | 11.24 | 40.164 | 379.762 | 312 | 2942 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 1.15 | 5.37 | 38.949 | 181.479 | 299 | 1396 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.14 | 1.14 | 38.601 | 38.601 | 299 | 299 |
| getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 1.12 | 1.12 | 37.740 | 37.740 | 293 | 293 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 1.07 | 10.16 | 36.284 | 342.964 | 282 | 2656 |
| getStoreKeyPaths · PKG/src/core/utils/pathIndex/utils/getStoreKeyPaths.ts:9 | 1.05 | 1.05 | 35.532 | 35.532 | 273 | 273 |
| updateInactiveValuesMemo · PKG/src/core/settle/utils/commit/updateInactiveValuesMemo.ts:23 | 0.99 | 3.05 | 33.594 | 103.034 | 259 | 794 |
| add · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:34 | 0.89 | 2.94 | 30.018 | 99.254 | 230 | 761 |
| set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 0.78 | 4.75 | 26.201 | 160.344 | 201 | 1230 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.68 | 7.62 | 23.053 | 257.465 | 178 | 1992 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 0.59 | 4.92 | 19.925 | 166.066 | 153 | 1281 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.51 | 12.76 | 17.285 | 431.080 | 133 | 3309 |
| finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.50 | 9.98 | 16.982 | 337.043 | 130 | 2586 |
| walkOwnedSchemaNodes · PKG/src/core/settle/utils/walkOwnedSchemaNodes.ts:9 | 0.46 | 2.89 | 15.428 | 97.452 | 118 | 745 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.30 | 54.19 | 9.964 | 1830.029 | 77 | 14116 |
| captureExitedRaw · PKG/src/core/settle/utils/transition/captureExitedRaw.ts:19 | 0.29 | 4.20 | 9.881 | 141.708 | 76 | 1086 |
| mergeSchemaContributions · PKG/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27 | 0.29 | 2.65 | 9.814 | 89.403 | 76 | 693 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.29 | 98.99 | 9.809 | 3343.243 | 76 | 25840 |
| createSchemaNode · PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 0.22 | 3.74 | 7.316 | 126.175 | 57 | 975 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.18 | 6.89 | 5.921 | 232.854 | 46 | 1802 |
| applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.14 | 7.03 | 4.659 | 237.261 | 36 | 1819 |
| writeLatentRaw · PKG/src/core/settle/utils/transition/writeLatentRaw.ts:16 | 0.04 | 3.40 | 1.419 | 114.872 | 11 | 879 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.03 | 99.43 | 1.038 | 3358.115 | 8 | 25955 |
| (anonymous) · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:36 | 0.02 | 2.05 | 0.796 | 69.236 | 6 | 531 |
| createChildNode · PKG/src/core/settle/utils/compute/createChildNode.ts:10 | 0.02 | 3.76 | 0.780 | 127.082 | 6 | 982 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01 | 99.48 | 0.388 | 3359.651 | 3 | 25966 |
| profileFirstUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:157 | 0.00 | 100.00 | 0.130 | 3377.200 | 1 | 26097 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3377.200 | 0 | 26097 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.00 | 100.00 | 0.000 | 3377.200 | 0 | 26097 |

### head · sample-0/first

연산 799,887회; 작업 벽시계 57262.290 ms; 첫 갱신 누적 동기 작업 5000.006 ms; 선택된 비유휴 표본 17,199개 / 2227.887 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-sample-0-first.json](profile-99c01/profile-99c01-head-sample-0-first.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 12.25 | 12.25 | 272.924 | 272.924 | 2114 | 2114 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 8.39 | 29.13 | 186.835 | 649.014 | 1447 | 5027 |
| getSettlementScratch · PKG/src/core/settle/utils/write/getSettlementScratch.ts:9 | 5.64 | 5.79 | 125.716 | 129.087 | 965 | 991 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 4.97 | 5.39 | 110.667 | 120.194 | 840 | 914 |
| getSchemaNodePath · PKG/src/core/navigation/utils/query/utils/getSchemaNodePath.ts:10 | 4.90 | 4.90 | 109.084 | 109.084 | 840 | 840 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 3.74 | 39.32 | 83.323 | 876.033 | 645 | 6785 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 3.66 | 3.66 | 81.597 | 81.597 | 628 | 628 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.61 | 10.96 | 80.356 | 244.094 | 616 | 1875 |
| pruneLatentRaw · PKG/src/core/settle/utils/write/pruneLatentRaw.ts:16 | 3.04 | 3.21 | 67.678 | 71.605 | 520 | 550 |
| beginPostOrder · PKG/src/core/settle/utils/write/DirtyPathSet.ts:22 | 2.89 | 2.89 | 64.389 | 64.389 | 496 | 496 |
| (anonymous) · PKG/src/core/settle/utils/commit/commitSettlement.ts:71 | 2.77 | 4.16 | 61.625 | 92.788 | 476 | 718 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 2.64 | 2.64 | 58.768 | 58.768 | 455 | 455 |
| commitGlobalState · PKG/src/core/settle/utils/commit/commitGlobalState.ts:11 | 2.49 | 2.49 | 55.382 | 55.382 | 429 | 429 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.33 | 18.23 | 51.958 | 406.063 | 404 | 3130 |
| clear · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:79 | 2.33 | 2.33 | 51.846 | 51.846 | 402 | 402 |
| releaseSettlementScratch · PKG/src/core/settle/utils/write/releaseSettlementScratch.ts:8 | 2.09 | 2.97 | 46.558 | 66.130 | 361 | 513 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 2.08 | 10.13 | 46.331 | 225.741 | 358 | 1732 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.07 | 5.26 | 46.188 | 117.275 | 356 | 904 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 2.04 | 81.99 | 45.395 | 1826.742 | 350 | 14112 |
| getPrefix · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:109 | 1.48 | 1.48 | 32.933 | 32.933 | 256 | 256 |
| runDeliveryWaves · PKG/src/core/dispatch/utils/chain/runDeliveryWaves.ts:9 | 1.40 | 2.17 | 31.202 | 48.324 | 241 | 374 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.36 | 2.59 | 30.409 | 57.781 | 235 | 447 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 1.30 | 12.27 | 29.071 | 273.293 | 224 | 2100 |
| add · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:34 | 1.16 | 2.64 | 25.793 | 58.856 | 199 | 456 |
| enterSchemaNodeChain · PKG/src/core/dispatch/utils/chain/enterSchemaNodeChain.ts:11 | 1.09 | 1.47 | 24.257 | 32.786 | 188 | 253 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.97 | 40.57 | 21.667 | 903.928 | 168 | 7002 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.81 | 87.26 | 18.072 | 1944.024 | 139 | 15017 |
| exitSchemaNodeChain · PKG/src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24 | 0.49 | 3.02 | 10.969 | 67.320 | 85 | 521 |
| set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 0.49 | 3.09 | 10.834 | 68.921 | 84 | 534 |
| clear · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:32 | 0.48 | 2.81 | 10.732 | 62.578 | 83 | 485 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.04 | 12.28 | 0.894 | 273.549 | 7 | 2119 |
| profileFirstUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:157 | 0.03 | 100.00 | 0.689 | 2227.887 | 5 | 17199 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.02 | 87.68 | 0.518 | 1953.513 | 4 | 15091 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 2227.887 | 0 | 17199 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.00 | 99.99 | 0.000 | 2227.585 | 0 | 17197 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 12.27 | 0.000 | 273.293 | 0 | 2100 |

### head · array-100/later

연산 511,863회; 작업 벽시계 3500.002 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,263개 / 3452.801 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-array-100-later.json](profile-99c01/profile-99c01-head-array-100-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 13.34 | 13.34 | 460.695 | 460.695 | 2995 | 2995 |
| (garbage collector) · (V8):0 | 8.27 | 8.27 | 285.389 | 285.389 | 1719 | 1719 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 6.92 | 26.81 | 238.839 | 925.850 | 1546 | 6012 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 5.09 | 5.09 | 175.812 | 175.812 | 1141 | 1141 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 4.95 | 5.27 | 171.028 | 182.018 | 1088 | 1159 |
| beginPostOrder · PKG/src/core/settle/utils/write/DirtyPathSet.ts:22 | 4.89 | 4.89 | 168.777 | 168.777 | 1095 | 1095 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 4.24 | 4.24 | 146.367 | 146.367 | 951 | 951 |
| (program) · (V8):0 | 3.91 | 3.91 | 135.153 | 135.153 | 877 | 877 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.70 | 7.31 | 127.677 | 252.235 | 828 | 1637 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.88 | 22.62 | 99.443 | 780.969 | 646 | 5049 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.54 | 33.78 | 87.589 | 1166.304 | 570 | 7575 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 2.47 | 11.76 | 85.247 | 405.879 | 554 | 2614 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 2.37 | 2.37 | 81.970 | 81.970 | 532 | 532 |
| getSchemaNodePath · PKG/src/core/navigation/utils/query/utils/getSchemaNodePath.ts:10 | 2.28 | 2.28 | 78.851 | 78.851 | 513 | 513 |
| releaseSettlementScratch · PKG/src/core/settle/utils/write/releaseSettlementScratch.ts:8 | 2.20 | 2.93 | 76.120 | 100.997 | 495 | 657 |
| sameValue · PKG/src/core/settle/utils/compute/sameValue.ts:9 | 2.02 | 2.02 | 69.909 | 69.909 | 454 | 454 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.89 | 8.01 | 65.131 | 276.670 | 423 | 1796 |
| commitGlobalState · PKG/src/core/settle/utils/commit/commitGlobalState.ts:11 | 1.74 | 1.74 | 60.190 | 60.190 | 391 | 391 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.60 | 2.82 | 55.373 | 97.312 | 359 | 632 |
| (anonymous) · PKG/src/core/settle/utils/commit/commitSettlement.ts:71 | 1.57 | 2.64 | 54.166 | 91.097 | 352 | 592 |
| clear · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:79 | 1.55 | 1.55 | 53.387 | 53.387 | 346 | 346 |
| getPrefix · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:109 | 1.45 | 1.45 | 50.148 | 50.148 | 326 | 326 |
| runDeliveryWaves · PKG/src/core/dispatch/utils/chain/runDeliveryWaves.ts:9 | 1.43 | 2.13 | 49.520 | 73.691 | 322 | 479 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 1.42 | 74.81 | 48.888 | 2582.878 | 317 | 16750 |
| visit · PKG/src/core/settle/utils/commit/commitGlobalState.ts:43 | 0.94 | 0.94 | 32.508 | 32.508 | 211 | 211 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.62 | 7.92 | 21.275 | 273.510 | 138 | 1775 |
| add · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:34 | 0.56 | 2.19 | 19.202 | 75.499 | 125 | 491 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.54 | 34.41 | 18.561 | 1188.101 | 120 | 7716 |
| markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 0.52 | 3.93 | 18.083 | 135.756 | 117 | 881 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.33 | 78.01 | 11.229 | 2693.385 | 73 | 17468 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.28 | 87.27 | 9.620 | 3013.271 | 63 | 19544 |
| exitSchemaNodeChain · PKG/src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24 | 0.22 | 2.76 | 7.734 | 95.150 | 50 | 618 |
| set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 0.12 | 2.34 | 4.278 | 80.848 | 28 | 526 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.04 | 86.04 | 1.401 | 2970.951 | 9 | 19269 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.04 | 13.37 | 1.377 | 461.610 | 9 | 3001 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.02 | 78.04 | 0.764 | 2694.475 | 5 | 17475 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3452.801 | 0 | 22263 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 7.92 | 0.000 | 273.510 | 0 | 1775 |

### old · array-100/later

연산 2,759,571회; 작업 벽시계 50000.018 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 67,303개 / 10281.639 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-old-array-100-later.json](profile-99c01/profile-99c01-old-array-100-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (program) · (V8):0 | 25.46 | 25.46 | 2617.876 | 2617.876 | 17178 | 17178 |
| drain · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:151 | 15.81 | 16.10 | 1625.522 | 1654.933 | 10648 | 10841 |
| getEventCollection · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/getEventCollection.ts:7 | 12.68 | 12.68 | 1303.425 | 1303.425 | 8524 | 8524 |
| __toArray__ · PKG/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:113 | 11.89 | 11.89 | 1222.372 | 1222.372 | 7997 | 7997 |
| __toNormalized__ · PKG/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:127 | 8.33 | 8.33 | 855.979 | 855.979 | 5609 | 5609 |
| mergeEventEntries · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13 | 2.19 | 2.19 | 225.370 | 225.370 | 1475 | 1475 |
| (garbage collector) · (V8):0 | 2.18 | 2.18 | 224.193 | 224.193 | 1441 | 1441 |
| onChange · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414 | 2.16 | 36.35 | 222.438 | 3737.813 | 1453 | 24455 |
| equalsRecursive · packages/winglet/common-utils/dist/utils/object/equals/utils/equalsRecursive.cjs:11 | 2.11 | 2.33 | 216.646 | 239.644 | 1416 | 1567 |
| sortObjectKeys · packages/winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6 | 1.14 | 1.57 | 117.286 | 161.729 | 764 | 1055 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:167 | 0.98 | 32.11 | 101.032 | 3301.458 | 659 | 21606 |
| getSegments · PKG/src/__legacy__/core/nodes/AbstractNode/utils/findNode/utils/getSegments.ts:30 | 0.87 | 0.95 | 89.208 | 97.461 | 585 | 639 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807 | 0.84 | 9.37 | 86.439 | 963.221 | 567 | 6302 |
| findNode · PKG/src/__legacy__/core/nodes/AbstractNode/utils/findNode/findNode.ts:46 | 0.83 | 1.84 | 85.190 | 188.891 | 557 | 1237 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155 | 0.76 | 38.99 | 78.324 | 4008.734 | 512 | 26228 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:211 | 0.75 | 13.29 | 76.713 | 1366.107 | 502 | 8930 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 0.68 | 0.68 | 70.237 | 70.237 | 460 | 460 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:839 | 0.56 | 39.44 | 57.752 | 4054.759 | 376 | 26527 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891 | 0.55 | 16.36 | 56.331 | 1681.597 | 369 | 10995 |
| __resolve__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:207 | 0.54 | 39.97 | 55.581 | 4109.472 | 363 | 26885 |
| __parseValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220 | 0.53 | 4.65 | 54.238 | 478.343 | 355 | 3126 |
| enqueueMicrotask · (V8):0 | 0.52 | 0.52 | 53.388 | 53.388 | 349 | 349 |
| hrtimeBigInt · (V8):0 | 0.48 | 0.48 | 49.044 | 49.044 | 321 | 321 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:497 | 0.47 | 0.47 | 47.878 | 47.878 | 312 | 312 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137 | 0.46 | 8.52 | 47.139 | 876.474 | 308 | 5733 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:212 | 0.43 | 32.55 | 44.159 | 3346.846 | 288 | 21902 |
| __acquireBatch__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90 | 0.39 | 2.18 | 40.156 | 223.723 | 262 | 1461 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134 | 0.33 | 2.50 | 33.496 | 257.219 | 219 | 1680 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:40 | 0.27 | 9.03 | 28.080 | 928.385 | 184 | 6065 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120 | 0.27 | 42.04 | 27.340 | 4322.701 | 179 | 28281 |
| equals · packages/winglet/common-utils/dist/utils/object/equals/equals.cjs:6 | 0.15 | 2.44 | 15.841 | 250.969 | 104 | 1642 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:171 | 0.13 | 11.17 | 13.580 | 1147.988 | 89 | 7502 |
| ObjectNode.handleChange · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:101 | 0.04 | 34.25 | 4.567 | 3521.554 | 30 | 23043 |
| __onChangeWithOmitEmpty__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:79 | 0.03 | 2.23 | 3.165 | 229.140 | 21 | 1496 |
| get normalizedValue · PKG/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:275 | 0.02 | 8.34 | 1.682 | 857.661 | 11 | 5620 |
| handleChange · PKG/src/__legacy__/core/nodes/ArrayNode/ArrayNode.ts:201 | 0.01 | 7.78 | 0.766 | 800.253 | 5 | 5238 |
| setValue · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:355 | 0.00 | 9.03 | 0.306 | 928.844 | 2 | 6068 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/ArrayNode/strategies/BranchStrategy/BranchStrategy.ts:145 | 0.00 | 32.11 | 0.153 | 3301.611 | 1 | 21607 |
| applyValue · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:91 | 0.00 | 9.03 | 0.153 | 928.538 | 1 | 6066 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 10281.639 | 0 | 67303 |
| __equals__ · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:46 | 0.00 | 2.44 | 0.000 | 250.969 | 0 | 1642 |
| dispatch · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:143 | 0.00 | 13.31 | 0.000 | 1368.047 | 0 | 8946 |

### head · computed-visible-derived/later

연산 206,054회; 작업 벽시계 3500.009 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,530개 / 3481.962 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-computed-visible-derived-later.json](profile-99c01/profile-99c01-head-computed-visible-derived-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (garbage collector) · (V8):0 | 4.97 | 4.97 | 173.033 | 173.033 | 1036 | 1036 |
| getDeriveSourceNodes · PKG/src/core/settle/derive/utils/evaluate/utils/getDeriveSourceNodes.ts:13 | 4.95 | 5.98 | 172.507 | 208.062 | 1121 | 1352 |
| updateCommittedRuleValue · PKG/src/core/settle/utils/commit/updateCommittedRuleValue.ts:14 | 4.70 | 9.35 | 163.758 | 325.537 | 1064 | 2115 |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 4.64 | 4.64 | 161.500 | 161.500 | 1049 | 1049 |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 3.90 | 7.38 | 135.744 | 256.981 | 882 | 1673 |
| (program) · (V8):0 | 3.27 | 3.27 | 113.921 | 113.921 | 744 | 744 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 3.09 | 25.26 | 107.659 | 879.428 | 700 | 5698 |
| sameValue · PKG/src/core/settle/utils/compute/sameValue.ts:9 | 2.94 | 2.94 | 102.464 | 102.464 | 667 | 667 |
| affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 2.90 | 4.34 | 101.054 | 151.253 | 657 | 983 |
| getDeriveRuleKey · PKG/src/core/settle/derive/utils/edges/getDeriveRuleKey.ts:16 | 2.68 | 2.68 | 93.407 | 93.407 | 608 | 608 |
| evaluateDeriveRound · PKG/src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:31 | 2.65 | 16.61 | 92.207 | 578.190 | 600 | 3760 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.64 | 3.01 | 91.912 | 104.953 | 578 | 662 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 2.50 | 2.50 | 86.917 | 86.917 | 564 | 564 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 2.32 | 9.53 | 80.828 | 331.982 | 525 | 2157 |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 2.29 | 2.29 | 79.669 | 79.669 | 517 | 517 |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 2.14 | 2.27 | 74.606 | 79.202 | 484 | 514 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.03 | 6.75 | 70.796 | 234.935 | 460 | 1526 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 1.98 | 1.98 | 68.820 | 68.820 | 448 | 448 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 1.95 | 2.14 | 67.945 | 74.581 | 442 | 487 |
| releaseSettlementScratch · PKG/src/core/settle/utils/write/releaseSettlementScratch.ts:8 | 1.91 | 2.17 | 66.345 | 75.441 | 432 | 491 |
| getPrefix · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:109 | 1.61 | 1.64 | 56.006 | 57.106 | 363 | 370 |
| getStoreKeyPaths · PKG/src/core/utils/pathIndex/utils/getStoreKeyPaths.ts:9 | 1.54 | 1.54 | 53.741 | 53.741 | 350 | 350 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 1.45 | 27.60 | 50.576 | 960.995 | 329 | 6246 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 1.41 | 6.00 | 49.146 | 208.755 | 319 | 1336 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.36 | 1.36 | 47.311 | 47.311 | 308 | 308 |
| evaluateScopedExpression · PKG/src/core/settle/derive/utils/evaluate/utils/evaluateScopedExpression.ts:23 | 1.33 | 3.22 | 46.201 | 111.997 | 300 | 728 |
| readDeriveDependency · PKG/src/core/settle/derive/utils/evaluate/utils/readDeriveDependency.ts:14 | 1.29 | 4.02 | 45.017 | 140.056 | 294 | 911 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.29 | 2.19 | 44.906 | 76.347 | 292 | 496 |
| collectDeriveSourcePaths · PKG/src/core/settle/utils/derivation/collectDeriveSourcePaths.ts:10 | 1.26 | 2.52 | 43.906 | 87.795 | 285 | 571 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 1.16 | 2.12 | 40.343 | 73.744 | 262 | 479 |
| evaluateResetInteraction · PKG/src/core/settle/derive/utils/evaluate/evaluateResetInteraction.ts:22 | 0.84 | 3.93 | 29.210 | 136.908 | 190 | 890 |
| add · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:34 | 0.67 | 2.42 | 23.271 | 84.209 | 152 | 547 |
| runDeriveRounds · PKG/src/core/settle/utils/derivation/runDeriveRounds.ts:29 | 0.67 | 35.03 | 23.184 | 1219.873 | 150 | 7928 |
| pruneCommittedRuleKeys · PKG/src/core/settle/utils/commit/pruneCommittedRuleKeys.ts:13 | 0.62 | 4.77 | 21.677 | 166.077 | 141 | 1079 |
| commitDeriveRules · PKG/src/core/settle/utils/commit/commitDeriveRules.ts:19 | 0.62 | 14.53 | 21.646 | 505.763 | 141 | 3287 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.61 | 2.92 | 21.281 | 101.698 | 139 | 664 |
| preserveReferences · PKG/src/core/settle/utils/compute/preserveReferences.ts:23 | 0.53 | 2.23 | 18.342 | 77.641 | 119 | 505 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.49 | 86.49 | 17.165 | 3011.561 | 111 | 19557 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.37 | 63.93 | 13.041 | 2225.897 | 85 | 14467 |
| (anonymous) · PKG/src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:102 | 0.30 | 2.67 | 10.301 | 93.028 | 67 | 605 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.25 | 2.36 | 8.754 | 82.040 | 57 | 533 |
| set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 0.20 | 4.16 | 6.905 | 144.702 | 45 | 941 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.19 | 91.13 | 6.467 | 3173.034 | 42 | 20607 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.16 | 87.92 | 5.673 | 3061.211 | 37 | 19880 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.03 | 4.65 | 0.919 | 161.961 | 6 | 1052 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.02 | 90.34 | 0.612 | 3145.726 | 4 | 20429 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01 | 87.94 | 0.307 | 3061.974 | 2 | 19885 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3481.962 | 0 | 22530 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 2.36 | 0.000 | 82.040 | 0 | 533 |

### old · computed-visible-derived/later

연산 2,978,262회; 작업 벽시계 50000.010 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 28,519개 / 3776.667 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-old-computed-visible-derived-later.json](profile-99c01/profile-99c01-old-computed-visible-derived-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (program) · (V8):0 | 31.94 | 31.94 | 1206.254 | 1206.254 | 9163 | 9163 |
| drain · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:144 | 18.39 | 18.68 | 694.343 | 705.422 | 5347 | 5432 |
| getEventCollection · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/getEventCollection.ts:7 | 12.08 | 12.08 | 456.263 | 456.263 | 3482 | 3482 |
| mergeEventEntries · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13 | 6.51 | 6.51 | 245.842 | 245.842 | 1873 | 1873 |
| (garbage collector) · (V8):0 | 6.43 | 6.43 | 242.946 | 242.946 | 1660 | 1660 |
| sortObjectKeys · packages/winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6 | 1.81 | 2.58 | 68.534 | 97.287 | 523 | 743 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:839 | 1.22 | 14.46 | 45.907 | 546.087 | 350 | 4177 |
| equalsRecursive · packages/winglet/common-utils/dist/utils/object/equals/utils/equalsRecursive.cjs:11 | 1.19 | 1.19 | 45.069 | 45.069 | 342 | 342 |
| getSegments · PKG/src/__legacy__/core/nodes/AbstractNode/utils/findNode/utils/getSegments.ts:30 | 1.11 | 1.18 | 41.836 | 44.606 | 301 | 321 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.97 | 12.35 | 36.684 | 466.428 | 269 | 3469 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155 | 0.93 | 13.65 | 35.234 | 515.472 | 270 | 3945 |
| __parseValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220 | 0.89 | 5.61 | 33.511 | 211.991 | 256 | 1618 |
| enqueueMicrotask · (V8):0 | 0.89 | 0.89 | 33.491 | 33.491 | 257 | 257 |
| __processValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245 | 0.83 | 3.39 | 31.275 | 127.853 | 239 | 977 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 0.78 | 0.78 | 29.391 | 29.391 | 225 | 225 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807 | 0.76 | 2.24 | 28.800 | 84.778 | 217 | 639 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891 | 0.68 | 18.36 | 25.832 | 693.548 | 197 | 5289 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:526 | 0.68 | 1.94 | 25.687 | 73.249 | 196 | 559 |
| runMicrotasks · (V8):0 | 0.67 | 0.67 | 25.197 | 25.197 | 182 | 182 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134 | 0.64 | 3.33 | 24.225 | 125.683 | 185 | 955 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:542 | 0.60 | 6.13 | 22.590 | 231.634 | 173 | 1779 |
| hrtimeBigInt · (V8):0 | 0.59 | 0.59 | 22.232 | 22.232 | 162 | 162 |
| __resolve__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:207 | 0.56 | 22.53 | 20.977 | 850.974 | 160 | 6515 |
| queueMicrotask · node:internal/process/task_queues:160 | 0.55 | 1.46 | 20.862 | 55.258 | 159 | 423 |
| runNextTicks · node:internal/process/task_queues:63 | 0.52 | 1.22 | 19.457 | 46.051 | 142 | 334 |
| __acquireBatch__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90 | 0.51 | 2.68 | 19.375 | 101.304 | 147 | 769 |
| onChange · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414 | 0.49 | 3.28 | 18.685 | 123.915 | 139 | 937 |
| processImmediate · node:internal/timers:525 | 0.49 | 2.51 | 18.476 | 94.608 | 133 | 682 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120 | 0.40 | 27.77 | 15.214 | 1048.941 | 116 | 8022 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/NumberNode/NumberNode.ts:64 | 0.28 | 13.73 | 10.678 | 518.626 | 79 | 3936 |
| dispatch · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:143 | 0.19 | 14.39 | 7.173 | 543.515 | 55 | 4149 |
| __onChangeWithOmitEmpty__ · PKG/src/__legacy__/core/nodes/NumberNode/NumberNode.ts:113 | 0.09 | 2.80 | 3.432 | 105.611 | 26 | 795 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.07 | 9.75 | 2.691 | 368.133 | 19 | 2747 |
| applyValue · PKG/src/__legacy__/core/nodes/NumberNode/NumberNode.ts:39 | 0.05 | 13.69 | 1.976 | 517.196 | 15 | 3926 |
| setValue · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:355 | 0.04 | 13.74 | 1.574 | 518.770 | 11 | 3937 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3776.667 | 0 | 28519 |

### head · nested-d5-f4/later

연산 276,062회; 작업 벽시계 3500.003 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,423개 / 3473.305 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-nested-d5-f4-later.json](profile-99c01/profile-99c01-head-nested-d5-f4-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 11.92 | 11.92 | 413.919 | 413.919 | 2690 | 2690 |
| (garbage collector) · (V8):0 | 8.48 | 8.48 | 294.487 | 294.487 | 1787 | 1787 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 7.53 | 8.08 | 261.454 | 280.529 | 1689 | 1813 |
| beginPostOrder · PKG/src/core/settle/utils/write/DirtyPathSet.ts:22 | 6.40 | 6.40 | 222.193 | 222.193 | 1443 | 1443 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 5.92 | 24.05 | 205.553 | 835.186 | 1334 | 5425 |
| sameValue · PKG/src/core/settle/utils/compute/sameValue.ts:9 | 5.42 | 5.42 | 188.197 | 188.197 | 1222 | 1222 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 5.20 | 5.20 | 180.782 | 180.782 | 1174 | 1174 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 5.19 | 5.19 | 180.176 | 180.176 | 1170 | 1170 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 4.46 | 30.96 | 155.014 | 1075.242 | 1007 | 6975 |
| (program) · (V8):0 | 3.46 | 3.46 | 120.067 | 120.067 | 777 | 777 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.37 | 5.27 | 116.906 | 182.932 | 759 | 1187 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 3.19 | 18.39 | 110.648 | 638.629 | 719 | 4139 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.07 | 9.63 | 72.027 | 334.537 | 468 | 2173 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.04 | 28.52 | 70.974 | 990.465 | 461 | 6435 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 1.98 | 78.43 | 68.630 | 2724.109 | 446 | 17687 |
| (anonymous) · PKG/src/core/settle/utils/commit/commitSettlement.ts:71 | 1.70 | 2.69 | 59.048 | 93.354 | 383 | 606 |
| getSchemaNodePath · PKG/src/core/navigation/utils/query/utils/getSchemaNodePath.ts:10 | 1.70 | 1.70 | 58.978 | 58.978 | 382 | 382 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 1.65 | 1.65 | 57.263 | 57.263 | 373 | 373 |
| commitGlobalState · PKG/src/core/settle/utils/commit/commitGlobalState.ts:11 | 1.62 | 1.62 | 56.425 | 56.425 | 367 | 367 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.38 | 2.84 | 47.909 | 98.780 | 311 | 642 |
| runDeliveryWaves · PKG/src/core/dispatch/utils/chain/runDeliveryWaves.ts:9 | 1.14 | 1.81 | 39.470 | 62.758 | 257 | 409 |
| visit · PKG/src/core/settle/utils/commit/commitGlobalState.ts:43 | 0.94 | 0.94 | 32.477 | 32.477 | 211 | 211 |
| releaseSettlementScratch · PKG/src/core/settle/utils/write/releaseSettlementScratch.ts:8 | 0.89 | 1.30 | 31.026 | 45.194 | 202 | 294 |
| clear · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:79 | 0.87 | 0.87 | 30.308 | 30.308 | 197 | 197 |
| (anonymous) · PKG/src/core/settle/utils/compute/updateOutput.ts:28 | 0.79 | 6.02 | 27.422 | 209.027 | 178 | 1357 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.69 | 5.95 | 23.873 | 206.654 | 155 | 1341 |
| markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 0.47 | 4.80 | 16.313 | 166.769 | 106 | 1083 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.29 | 28.91 | 10.136 | 1003.996 | 66 | 6523 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.17 | 80.86 | 5.861 | 2808.610 | 38 | 18237 |
| exitSchemaNodeChain · PKG/src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24 | 0.16 | 2.16 | 5.576 | 75.142 | 36 | 489 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.15 | 87.51 | 5.106 | 3039.554 | 33 | 19735 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.03 | 86.88 | 0.931 | 3017.615 | 6 | 19593 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.02 | 11.93 | 0.653 | 414.423 | 4 | 2693 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3473.305 | 0 | 22423 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 5.95 | 0.000 | 206.654 | 0 | 1341 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.00 | 80.88 | 0.000 | 2809.111 | 0 | 18240 |

### old · nested-d5-f4/later

연산 1,561,228회; 작업 벽시계 30000.005 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 43,117개 / 6652.206 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-old-nested-d5-f4-later.json](profile-99c01/profile-99c01-old-nested-d5-f4-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (program) · (V8):0 | 20.66 | 20.66 | 1374.121 | 1374.121 | 9012 | 9012 |
| getEventCollection · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/getEventCollection.ts:7 | 13.91 | 13.91 | 925.636 | 925.636 | 6053 | 6053 |
| (garbage collector) · (V8):0 | 11.87 | 11.87 | 789.843 | 789.843 | 4771 | 4771 |
| drain · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:151 | 11.46 | 11.67 | 762.566 | 776.262 | 5003 | 5092 |
| sortObjectKeys · packages/winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6 | 5.42 | 8.09 | 360.688 | 538.139 | 2357 | 3519 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155 | 5.34 | 34.10 | 354.923 | 2268.699 | 2325 | 14848 |
| getSegments · PKG/src/__legacy__/core/nodes/AbstractNode/utils/findNode/utils/getSegments.ts:30 | 3.14 | 3.37 | 209.062 | 223.956 | 1360 | 1457 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 2.71 | 2.71 | 180.328 | 180.328 | 1181 | 1181 |
| equalsRecursive · packages/winglet/common-utils/dist/utils/object/equals/utils/equalsRecursive.cjs:11 | 2.43 | 2.43 | 161.531 | 161.531 | 1056 | 1056 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807 | 2.08 | 32.84 | 138.069 | 2184.774 | 902 | 14288 |
| __parseValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220 | 1.95 | 12.76 | 129.642 | 848.862 | 847 | 5550 |
| mergeEventEntries · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13 | 1.83 | 1.83 | 121.831 | 121.831 | 792 | 792 |
| findNode · PKG/src/__legacy__/core/nodes/AbstractNode/utils/findNode/findNode.ts:46 | 1.79 | 5.27 | 119.050 | 350.246 | 777 | 2281 |
| onChange · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414 | 1.25 | 33.55 | 83.147 | 2231.884 | 542 | 14594 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137 | 0.94 | 31.97 | 62.360 | 2126.926 | 409 | 13911 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:211 | 0.91 | 16.61 | 60.677 | 1105.072 | 396 | 7194 |
| hrtimeBigInt · (V8):0 | 0.86 | 0.86 | 57.538 | 57.538 | 376 | 376 |
| enqueueMicrotask · (V8):0 | 0.83 | 0.83 | 54.984 | 54.984 | 357 | 357 |
| __acquireBatch__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90 | 0.61 | 3.21 | 40.739 | 213.840 | 265 | 1390 |
| processImmediate · node:internal/timers:525 | 0.59 | 2.19 | 39.526 | 145.833 | 255 | 948 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:40 | 0.55 | 7.90 | 36.299 | 525.427 | 237 | 3415 |
| runMicrotasks · (V8):0 | 0.55 | 0.55 | 36.299 | 36.299 | 238 | 238 |
| microseconds · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:148 | 0.53 | 1.57 | 35.191 | 104.538 | 230 | 683 |
| queueMicrotask · node:internal/process/task_queues:160 | 0.46 | 1.32 | 30.448 | 87.733 | 198 | 570 |
| ref · node:internal/timers:763 | 0.40 | 0.80 | 26.916 | 53.402 | 175 | 347 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:839 | 0.40 | 34.38 | 26.687 | 2287.135 | 174 | 14968 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:171 | 0.33 | 14.11 | 21.772 | 938.617 | 142 | 6107 |
| dispatch · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:143 | 0.31 | 14.57 | 20.940 | 969.481 | 137 | 6339 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120 | 0.28 | 36.61 | 18.852 | 2435.676 | 123 | 15934 |
| __resolve__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:207 | 0.25 | 34.51 | 16.930 | 2295.772 | 110 | 15024 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891 | 0.22 | 18.17 | 14.507 | 1208.769 | 95 | 7894 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134 | 0.21 | 3.43 | 14.086 | 227.926 | 91 | 1481 |
| equals · packages/winglet/common-utils/dist/utils/object/equals/equals.cjs:6 | 0.13 | 2.51 | 8.586 | 166.928 | 56 | 1091 |
| ObjectNode.handleChange · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:101 | 0.11 | 29.85 | 7.218 | 1985.511 | 47 | 12994 |
| __processValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245 | 0.10 | 8.18 | 6.416 | 544.400 | 42 | 3560 |
| find · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:253 | 0.07 | 5.53 | 4.595 | 368.149 | 30 | 2398 |
| __onChangeWithOmitEmpty__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:79 | 0.04 | 3.82 | 2.752 | 253.972 | 18 | 1650 |
| setValue · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:355 | 0.03 | 7.93 | 1.991 | 527.418 | 13 | 3428 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 6652.206 | 0 | 43117 |
| __equals__ · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:46 | 0.00 | 2.51 | 0.000 | 166.928 | 0 | 1091 |
| applyValue · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:91 | 0.00 | 7.90 | 0.000 | 525.305 | 0 | 3414 |

### head · oneOf-40/later

연산 7,577회; 작업 벽시계 3500.180 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,713개 / 3499.701 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-oneOf-40-later.json](profile-99c01/profile-99c01-head-oneOf-40-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 13.23 | 13.23 | 463.083 | 463.083 | 3013 | 3013 |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 12.82 | 52.37 | 448.633 | 1832.768 | 2919 | 11930 |
| readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 9.27 | 12.60 | 324.354 | 440.976 | 2108 | 2867 |
| (garbage collector) · (V8):0 | 4.69 | 4.69 | 164.094 | 164.094 | 1010 | 1010 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 4.32 | 4.32 | 151.325 | 151.325 | 985 | 985 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 4.27 | 73.59 | 149.466 | 2575.379 | 972 | 16758 |
| evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 3.41 | 32.68 | 119.479 | 1143.677 | 779 | 7441 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.95 | 7.31 | 103.276 | 255.938 | 670 | 1658 |
| (program) · (V8):0 | 2.76 | 2.76 | 96.449 | 96.449 | 629 | 629 |
| locate · PKG/src/core/settle/utils/gates/getGateRegistry.ts:83 | 2.16 | 2.90 | 75.521 | 101.548 | 492 | 661 |
| (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 2.12 | 24.20 | 74.214 | 846.916 | 483 | 5509 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.12 | 2.20 | 74.088 | 76.940 | 482 | 501 |
| flushRead · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:74 | 2.10 | 2.84 | 73.404 | 99.504 | 478 | 648 |
| getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 2.00 | 2.00 | 69.923 | 69.923 | 455 | 455 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.83 | 1.83 | 63.926 | 63.926 | 414 | 414 |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 1.68 | 1.68 | 58.735 | 58.735 | 383 | 383 |
| register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 1.32 | 1.63 | 46.092 | 57.160 | 299 | 372 |
| primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 1.26 | 1.37 | 44.090 | 47.975 | 286 | 311 |
| (anonymous) · (V8):1 | 1.21 | 1.21 | 42.387 | 42.387 | 275 | 275 |
| flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 1.16 | 9.63 | 40.428 | 337.038 | 263 | 2193 |
| flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 1.11 | 8.48 | 38.876 | 296.610 | 253 | 1930 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 1.09 | 1.29 | 38.116 | 45.097 | 249 | 295 |
| collect · PKG/src/core/settle/utils/write/getDependencyIndex.ts:83 | 1.07 | 1.34 | 37.545 | 46.949 | 243 | 304 |
| getControlLayers · PKG/src/core/settle/utils/controls/getControlLayers.ts:56 | 0.95 | 1.05 | 33.218 | 36.887 | 217 | 241 |
| projectedEmission · PKG/src/core/settle/utils/gates/readProjectedValue.ts:13 | 0.91 | 0.91 | 31.794 | 31.794 | 207 | 207 |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.87 | 11.47 | 30.284 | 401.420 | 195 | 2609 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.69 | 9.67 | 24.109 | 338.464 | 157 | 2200 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.32 | 91.86 | 11.258 | 3214.675 | 73 | 20914 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.25 | 4.86 | 8.772 | 169.932 | 57 | 1109 |
| finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.23 | 4.75 | 7.967 | 166.081 | 52 | 1083 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.19 | 8.91 | 6.592 | 311.764 | 43 | 2026 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 0.17 | 2.48 | 5.806 | 86.904 | 38 | 566 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.10 | 10.06 | 3.525 | 351.937 | 23 | 2296 |
| applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.06 | 3.27 | 2.168 | 114.456 | 14 | 746 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.04 | 92.22 | 1.229 | 3227.492 | 9 | 20998 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.02 | 92.05 | 0.614 | 3221.611 | 4 | 20959 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.00 | 92.16 | 0.153 | 3225.337 | 1 | 20983 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3499.701 | 0 | 22713 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.00 | 92.06 | 0.000 | 3221.765 | 0 | 20960 |

### head · oneOf-5/later

연산 29,540회; 작업 벽시계 3500.137 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,676개 / 3498.191 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-oneOf-5-later.json](profile-99c01/profile-99c01-head-oneOf-5-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (garbage collector) · (V8):0 | 8.64 | 8.64 | 302.285 | 302.285 | 1881 | 1881 |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 7.63 | 33.14 | 266.918 | 1159.351 | 1737 | 7539 |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 6.73 | 6.73 | 235.454 | 235.454 | 1530 | 1530 |
| readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 4.78 | 6.61 | 167.093 | 231.350 | 1087 | 1505 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 3.55 | 49.83 | 124.338 | 1743.146 | 808 | 11338 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 2.52 | 2.52 | 88.240 | 88.240 | 574 | 574 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 2.36 | 2.60 | 82.426 | 91.058 | 537 | 594 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.33 | 2.54 | 81.667 | 88.973 | 529 | 577 |
| (program) · (V8):0 | 2.31 | 2.31 | 80.644 | 80.644 | 526 | 526 |
| register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 2.24 | 3.40 | 78.329 | 118.841 | 507 | 771 |
| getPrefix · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:109 | 2.10 | 2.12 | 73.549 | 74.017 | 479 | 482 |
| _SchemaNodeRevisionLedger · PKG/src/core/record/utils/SchemaNodeRevisionLedger.ts:18 | 2.07 | 2.26 | 72.436 | 78.917 | 473 | 515 |
| evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 2.00 | 17.00 | 70.101 | 594.734 | 456 | 3866 |
| updateInactiveValuesMemo · PKG/src/core/settle/utils/commit/updateInactiveValuesMemo.ts:23 | 1.99 | 6.26 | 69.591 | 219.146 | 453 | 1428 |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 1.95 | 1.95 | 68.241 | 68.241 | 444 | 444 |
| getControlLayers · PKG/src/core/settle/utils/controls/getControlLayers.ts:56 | 1.73 | 2.17 | 60.448 | 75.891 | 394 | 494 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.69 | 4.31 | 59.161 | 150.725 | 385 | 978 |
| setLatentRaw · PKG/src/core/settle/utils/latent/setLatentRaw.ts:21 | 1.61 | 5.77 | 56.273 | 201.748 | 366 | 1313 |
| primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 1.46 | 1.63 | 51.092 | 56.916 | 332 | 370 |
| delete · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:49 | 1.31 | 1.59 | 45.781 | 55.573 | 299 | 363 |
| add · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:34 | 1.22 | 3.47 | 42.662 | 121.291 | 278 | 790 |
| indexLatentDescendant · PKG/src/core/settle/utils/latent/indexLatentDescendant.ts:9 | 1.20 | 1.20 | 42.129 | 42.129 | 274 | 274 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.20 | 1.20 | 42.126 | 42.126 | 273 | 273 |
| locate · PKG/src/core/settle/utils/gates/getGateRegistry.ts:83 | 1.16 | 1.39 | 40.567 | 48.773 | 264 | 317 |
| (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 1.15 | 12.80 | 40.381 | 447.844 | 262 | 2911 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 1.04 | 6.52 | 36.348 | 228.116 | 238 | 1487 |
| set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 1.00 | 5.61 | 35.139 | 196.107 | 229 | 1277 |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.99 | 7.81 | 34.717 | 273.108 | 226 | 1779 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.82 | 3.74 | 28.694 | 130.762 | 189 | 854 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.62 | 16.32 | 21.804 | 570.889 | 142 | 3720 |
| flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 0.54 | 3.32 | 18.849 | 116.151 | 123 | 755 |
| readUnsetPolicy · PKG/src/core/settle/utils/transition/readUnsetPolicy.ts:11 | 0.50 | 2.04 | 17.641 | 71.306 | 115 | 464 |
| finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.49 | 14.06 | 17.061 | 491.867 | 111 | 3201 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 0.48 | 3.31 | 16.814 | 115.638 | 110 | 751 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.46 | 5.55 | 16.141 | 194.151 | 105 | 1263 |
| captureExitedRaw · PKG/src/core/settle/utils/transition/captureExitedRaw.ts:19 | 0.43 | 5.86 | 15.058 | 204.827 | 98 | 1332 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.36 | 87.77 | 12.727 | 3070.500 | 83 | 19977 |
| flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 0.33 | 2.78 | 11.412 | 97.302 | 74 | 632 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.27 | 31.70 | 9.291 | 1108.992 | 60 | 7221 |
| walkOwnedSchemaNodes · PKG/src/core/settle/utils/walkOwnedSchemaNodes.ts:9 | 0.21 | 3.58 | 7.306 | 125.203 | 47 | 813 |
| applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.15 | 9.66 | 5.096 | 337.920 | 33 | 2199 |
| (anonymous) · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:36 | 0.13 | 2.25 | 4.612 | 78.629 | 30 | 512 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.13 | 5.02 | 4.592 | 175.571 | 30 | 1142 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.11 | 88.67 | 3.887 | 3101.743 | 26 | 20181 |
| writeLatentRaw · PKG/src/core/settle/utils/transition/writeLatentRaw.ts:16 | 0.07 | 5.83 | 2.480 | 204.072 | 16 | 1328 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.03 | 88.17 | 0.920 | 3084.343 | 6 | 20067 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01 | 88.18 | 0.311 | 3084.654 | 2 | 20069 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3498.191 | 0 | 22676 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.00 | 88.39 | 0.000 | 3092.172 | 0 | 20118 |

### head · sample-0/later

연산 948,586회; 작업 벽시계 3500.002 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 21,864개 / 3398.536 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-sample-0-later.json](profile-99c01/profile-99c01-head-sample-0-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 12.65 | 12.65 | 429.876 | 429.876 | 2789 | 2789 |
| (garbage collector) · (V8):0 | 11.33 | 11.33 | 385.171 | 385.171 | 2335 | 2335 |
| markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 7.14 | 25.71 | 242.603 | 873.890 | 1573 | 5666 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 5.05 | 5.23 | 171.713 | 177.693 | 1094 | 1133 |
| (program) · (V8):0 | 4.00 | 4.00 | 136.077 | 136.077 | 883 | 883 |
| commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 3.59 | 36.52 | 121.963 | 1241.148 | 792 | 8050 |
| beginPostOrder · PKG/src/core/settle/utils/write/DirtyPathSet.ts:22 | 3.40 | 3.40 | 115.477 | 115.477 | 748 | 748 |
| releaseSettlementScratch · PKG/src/core/settle/utils/write/releaseSettlementScratch.ts:8 | 3.24 | 4.62 | 110.020 | 156.988 | 715 | 1019 |
| delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 3.18 | 3.18 | 107.955 | 107.955 | 701 | 701 |
| findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 2.78 | 5.85 | 94.459 | 198.835 | 612 | 1289 |
| clear · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:79 | 2.47 | 2.47 | 83.988 | 83.988 | 545 | 545 |
| commitGlobalState · PKG/src/core/settle/utils/commit/commitGlobalState.ts:11 | 2.41 | 2.41 | 82.015 | 82.015 | 531 | 531 |
| getPrefix · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:109 | 2.37 | 2.37 | 80.448 | 80.448 | 522 | 522 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.20 | 16.74 | 74.629 | 569.043 | 485 | 3674 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 2.13 | 2.13 | 72.535 | 72.535 | 471 | 471 |
| getSchemaNodePath · PKG/src/core/navigation/utils/query/utils/getSchemaNodePath.ts:10 | 2.03 | 2.03 | 69.101 | 69.101 | 448 | 448 |
| updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 1.98 | 9.17 | 67.133 | 311.553 | 436 | 2002 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.69 | 5.28 | 57.549 | 179.479 | 373 | 1163 |
| runDeliveryWaves · PKG/src/core/dispatch/utils/chain/runDeliveryWaves.ts:9 | 1.65 | 2.79 | 56.182 | 94.765 | 365 | 616 |
| add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.50 | 1.50 | 50.957 | 50.957 | 331 | 331 |
| clear · PKG/src/core/settle/utils/write/DirtyPathSet.ts:107 | 1.38 | 1.38 | 46.968 | 46.968 | 304 | 304 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 1.21 | 70.22 | 41.135 | 2386.393 | 266 | 15461 |
| dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 1.09 | 2.18 | 37.174 | 73.980 | 241 | 480 |
| markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 0.99 | 2.83 | 33.553 | 96.039 | 218 | 624 |
| dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.94 | 75.30 | 31.780 | 2559.240 | 206 | 16584 |
| add · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:34 | 0.89 | 3.56 | 30.403 | 121.013 | 198 | 786 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.73 | 37.40 | 24.681 | 1271.050 | 161 | 8245 |
| clear · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:32 | 0.66 | 3.13 | 22.521 | 106.509 | 146 | 691 |
| find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.47 | 6.31 | 15.946 | 214.305 | 103 | 1389 |
| exitSchemaNodeChain · PKG/src/core/dispatch/utils/chain/exitSchemaNodeChain.ts:24 | 0.40 | 3.85 | 13.455 | 130.953 | 88 | 851 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.33 | 83.61 | 11.227 | 2841.648 | 73 | 18415 |
| (anonymous) · PKG/src/core/utils/pathIndex/utils/PathStoreIndex.ts:36 | 0.32 | 2.67 | 10.779 | 90.610 | 70 | 588 |
| set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 0.21 | 3.78 | 6.999 | 128.629 | 45 | 835 |
| mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.11 | 12.75 | 3.836 | 433.249 | 25 | 2811 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.08 | 81.75 | 2.664 | 2778.215 | 17 | 18003 |
| setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01 | 75.31 | 0.311 | 2559.551 | 2 | 16586 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3398.536 | 0 | 21864 |
| find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00 | 6.31 | 0.000 | 214.305 | 0 | 1389 |

### old · sample-0/later

연산 3,585,656회; 작업 벽시계 55000.013 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 13,181개 / 1988.607 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-old-sample-0-later.json](profile-99c01/profile-99c01-old-sample-0-later.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (program) · (V8):0 | 36.20 | 36.20 | 719.967 | 719.967 | 4812 | 4812 |
| drain · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:144 | 19.86 | 20.27 | 395.013 | 403.126 | 2639 | 2693 |
| (garbage collector) · (V8):0 | 9.93 | 9.93 | 197.433 | 197.433 | 1282 | 1282 |
| getEventCollection · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/getEventCollection.ts:7 | 8.03 | 8.03 | 159.657 | 159.657 | 1048 | 1048 |
| mergeEventEntries · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13 | 5.31 | 5.31 | 105.595 | 105.595 | 700 | 700 |
| getSegments · PKG/src/__legacy__/core/nodes/AbstractNode/utils/findNode/utils/getSegments.ts:30 | 1.31 | 1.35 | 26.008 | 26.926 | 169 | 175 |
| runMicrotasks · (V8):0 | 1.25 | 1.25 | 24.813 | 24.813 | 165 | 165 |
| sortObjectKeys · packages/winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6 | 1.24 | 1.55 | 24.722 | 30.886 | 163 | 204 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 1.22 | 16.58 | 24.341 | 329.659 | 159 | 2154 |
| __acquireBatch__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90 | 1.02 | 3.25 | 20.237 | 64.657 | 133 | 421 |
| equalsRecursive · packages/winglet/common-utils/dist/utils/object/equals/utils/equalsRecursive.cjs:11 | 1.01 | 1.01 | 20.080 | 20.080 | 132 | 132 |
| microseconds · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:141 | 0.84 | 1.58 | 16.779 | 31.400 | 110 | 204 |
| enqueueMicrotask · (V8):0 | 0.73 | 0.73 | 14.478 | 14.478 | 94 | 94 |
| processImmediate · node:internal/timers:525 | 0.69 | 3.60 | 13.795 | 71.660 | 92 | 477 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155 | 0.65 | 7.38 | 13.011 | 146.751 | 86 | 968 |
| hrtimeBigInt · (V8):0 | 0.65 | 0.65 | 12.933 | 12.933 | 83 | 83 |
| __processValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245 | 0.65 | 2.20 | 12.928 | 43.660 | 86 | 289 |
| __parseValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220 | 0.63 | 4.03 | 12.554 | 80.066 | 83 | 529 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:839 | 0.61 | 8.00 | 12.131 | 159.034 | 81 | 1050 |
| ref · node:internal/timers:763 | 0.58 | 0.69 | 11.568 | 13.796 | 76 | 90 |
| __resolve__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:207 | 0.54 | 8.55 | 10.724 | 170.059 | 70 | 1122 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134 | 0.47 | 3.72 | 9.321 | 73.978 | 61 | 482 |
| queueMicrotask · node:internal/process/task_queues:160 | 0.43 | 1.21 | 8.483 | 24.041 | 55 | 156 |
| runNextTicks · node:internal/process/task_queues:63 | 0.43 | 1.69 | 8.459 | 33.702 | 56 | 224 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891 | 0.39 | 12.74 | 7.826 | 253.372 | 51 | 1659 |
| profileLaterUpdate · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:164 | 0.23 | 13.16 | 4.640 | 261.694 | 31 | 1710 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807 | 0.21 | 2.90 | 4.256 | 57.572 | 28 | 374 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:40 | 0.15 | 11.08 | 3.033 | 220.368 | 20 | 1441 |
| __onChangeWithOmitEmpty__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:79 | 0.12 | 3.10 | 2.469 | 61.602 | 16 | 400 |
| dispatch · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:143 | 0.11 | 8.67 | 2.140 | 172.348 | 14 | 1131 |
| onChange · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414 | 0.10 | 3.19 | 2.021 | 63.405 | 13 | 412 |
| applyValue · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:91 | 0.09 | 11.17 | 1.848 | 222.073 | 12 | 1452 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120 | 0.06 | 13.51 | 1.233 | 268.649 | 8 | 1776 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137 | 0.06 | 2.68 | 1.116 | 53.316 | 7 | 346 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 1988.607 | 0 | 13181 |
| setValue · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:355 | 0.00 | 11.17 | 0.000 | 222.073 | 0 | 1452 |

### head · flat-500/mount

연산 786회; 작업 벽시계 3517.853 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,671개 / 3509.057 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-flat-500-mount.json](profile-99c01/profile-99c01-head-flat-500-mount.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (garbage collector) · (V8):0 | 20.78 | 20.78 | 729.013 | 729.013 | 4615 | 4615 |
| buildNodes · PKG/src/core/blueprint/utils/analyze/buildNodes.ts:24 | 8.46 | 33.44 | 296.905 | 1173.310 | 1932 | 7625 |
| _SchemaNodeRevisionLedger · PKG/src/core/record/utils/SchemaNodeRevisionLedger.ts:18 | 7.88 | 8.67 | 276.346 | 304.382 | 1798 | 1981 |
| structuredClone · node:internal/worker/js_transferable:101 | 5.46 | 5.52 | 191.598 | 193.834 | 1235 | 1249 |
| applySchemaContribution · PKG/src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36 | 5.22 | 8.73 | 183.038 | 306.359 | 1192 | 1994 |
| ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 5.12 | 5.12 | 179.587 | 179.587 | 1164 | 1164 |
| commitStaticFirstNode · PKG/src/core/settle/utils/load/commitStaticFirstNode.ts:13 | 3.65 | 12.32 | 128.107 | 432.489 | 834 | 2815 |
| collectDeclarations · PKG/src/core/blueprint/utils/analyze/collectDeclarations.ts:27 | 2.99 | 3.69 | 104.992 | 129.416 | 683 | 842 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 2.85 | 23.37 | 100.044 | 819.974 | 650 | 5328 |
| populateNodeChildren · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:19 | 2.42 | 30.31 | 84.959 | 1063.431 | 551 | 6913 |
| createSchemaNode · PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 2.39 | 13.67 | 83.908 | 479.789 | 545 | 3120 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 2.39 | 2.79 | 83.865 | 97.897 | 545 | 636 |
| getTemplateKey · PKG/src/core/blueprint/utils/analyze/getTemplateKey.ts:11 | 2.38 | 2.60 | 83.521 | 91.335 | 543 | 594 |
| blueprint · PKG/src/core/blueprint/blueprint.ts:21 | 2.32 | 36.67 | 81.287 | 1286.623 | 528 | 8361 |
| applyConstraintKeywords · PKG/src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:36 | 1.98 | 2.20 | 69.510 | 77.313 | 452 | 503 |
| mergeSchemaContributions · PKG/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27 | 1.93 | 12.60 | 67.617 | 442.292 | 440 | 2877 |
| finalizeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:13 | 1.91 | 1.96 | 66.918 | 68.623 | 434 | 445 |
| getStaticObjectEntries · PKG/src/core/settle/utils/load/getStaticObjectEntries.ts:11 | 1.66 | 1.66 | 58.385 | 58.385 | 377 | 377 |
| (program) · (V8):0 | 1.56 | 1.56 | 54.719 | 54.719 | 355 | 355 |
| getStaticChoices · PKG/src/core/behaviors/utils/options/getStaticChoices.ts:23 | 1.50 | 1.50 | 52.758 | 52.758 | 343 | 343 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 1.49 | 2.78 | 52.331 | 97.639 | 340 | 634 |
| (anonymous) · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:163 | 1.37 | 1.37 | 48.094 | 48.094 | 313 | 313 |
| (anonymous) · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:73 | 1.28 | 1.48 | 45.077 | 52.018 | 293 | 338 |
| writeObjectKey · PKG/src/core/behaviors/objectBehavior/utils/keys/writeObjectKey.ts:2 | 1.28 | 1.28 | 45.003 | 45.003 | 292 | 292 |
| loadStaticFirstTree · PKG/src/core/settle/utils/load/loadStaticFirstTree.ts:42 | 1.25 | 32.87 | 44.025 | 1153.545 | 286 | 7499 |
| createChildNode · PKG/src/core/settle/utils/compute/createChildNode.ts:10 | 0.28 | 12.69 | 9.922 | 445.302 | 64 | 2895 |
| loadSchemaNodeAtMount · PKG/src/core/settle/utils/load/loadSchemaNodeAtMount.ts:15 | 0.21 | 33.80 | 7.468 | 1185.890 | 49 | 7710 |
| assembleStaticFirstNode · PKG/src/core/settle/utils/load/assembleStaticFirstNode.ts:11 | 0.18 | 4.49 | 6.319 | 157.640 | 41 | 1024 |
| create · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:150 | 0.10 | 71.52 | 3.592 | 2509.711 | 23 | 16312 |
| buildSchemaNodeTree · PKG/src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37 | 0.05 | 37.19 | 1.843 | 1304.933 | 12 | 8480 |
| dispatchMount · PKG/src/core/dispatch/utils/entry/dispatchMount.ts:21 | 0.03 | 34.22 | 1.228 | 1200.733 | 8 | 7806 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.03 | 77.12 | 1.095 | 2706.124 | 7 | 17577 |
| mountSchemaNode · PKG/src/core/SchemaNode/utils/binding/mountSchemaNode.ts:14 | 0.01 | 34.23 | 0.456 | 1201.189 | 3 | 7809 |
| nodeFromJSONSchema · PKG/src/core/nodeFromJSONSchema.ts:17 | 0.01 | 71.41 | 0.303 | 2505.967 | 2 | 16288 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3509.057 | 0 | 22671 |

### old · flat-500/mount

연산 2,195회; 작업 벽시계 3500.587 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,369개 / 3470.731 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-old-flat-500-mount.json](profile-99c01/profile-99c01-old-flat-500-mount.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| structuredClone · node:internal/worker/js_transferable:101 | 16.90 | 17.01 | 586.470 | 590.529 | 3787 | 3812 |
| (garbage collector) · (V8):0 | 12.65 | 12.65 | 438.963 | 438.963 | 2733 | 2733 |
| needsRealComputedManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27 | 9.37 | 9.37 | 325.212 | 325.212 | 2112 | 2112 |
| __processValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245 | 5.30 | 14.31 | 184.098 | 496.589 | 1197 | 3225 |
| mergeEventEntries · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13 | 5.26 | 5.26 | 182.687 | 182.687 | 1187 | 1187 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 5.22 | 5.22 | 181.235 | 181.235 | 1176 | 1176 |
| getComputedPropertiesManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19 | 3.84 | 13.19 | 133.393 | 457.948 | 867 | 2975 |
| sortObjectKeys · packages/winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6 | 3.80 | 9.01 | 131.724 | 312.647 | 855 | 2029 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807 | 3.79 | 3.80 | 131.683 | 131.836 | 856 | 857 |
| getStackEntriesForNode · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:74 | 3.72 | 4.73 | 129.058 | 164.060 | 838 | 1065 |
| __parseValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220 | 3.56 | 17.90 | 123.518 | 621.198 | 803 | 4035 |
| BranchStrategy2 · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761 | 3.34 | 53.64 | 115.915 | 1861.728 | 752 | 12087 |
| onChange · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414 | 3.00 | 6.80 | 104.023 | 235.867 | 677 | 1534 |
| EventCascadeManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257 | 2.88 | 2.88 | 100.076 | 100.076 | 650 | 650 |
| AbstractNode · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146 | 1.87 | 18.91 | 65.007 | 656.380 | 421 | 4262 |
| getChildNodeMap · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:33 | 1.56 | 31.84 | 54.153 | 1104.980 | 350 | 7172 |
| (program) · (V8):0 | 1.53 | 1.53 | 53.182 | 53.182 | 338 | 338 |
| StringNode · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:111 | 1.16 | 29.35 | 40.120 | 1018.740 | 260 | 6614 |
| scannerFactory · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/scannerFactory.cjs:17 | 0.78 | 5.53 | 27.245 | 191.933 | 176 | 1245 |
| __acquireBatch__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90 | 0.70 | 2.13 | 24.150 | 73.973 | 157 | 480 |
| pushMapChildren · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:34 | 0.68 | 1.01 | 23.435 | 35.002 | 152 | 227 |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 0.61 | 0.61 | 21.251 | 21.251 | 138 | 138 |
| enqueueMicrotask · (V8):0 | 0.55 | 0.55 | 19.108 | 19.108 | 124 | 124 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134 | 0.50 | 2.63 | 17.336 | 91.309 | 113 | 593 |
| runNextTicks · node:internal/process/task_queues:63 | 0.50 | 0.99 | 17.250 | 34.266 | 105 | 211 |
| (anonymous) · PKG/src/__legacy__/core/nodes/schemaNodeFactory.ts:75 | 0.42 | 54.96 | 14.468 | 1907.416 | 94 | 12384 |
| __run__ · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/JSONSchemaScanner.cjs:47 | 0.36 | 5.88 | 12.333 | 203.967 | 80 | 1323 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:40 | 0.35 | 9.37 | 12.291 | 325.293 | 78 | 2112 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120 | 0.28 | 5.74 | 9.729 | 199.140 | 63 | 1294 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891 | 0.20 | 2.83 | 6.935 | 98.244 | 45 | 638 |
| ObjectNode · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:96 | 0.10 | 54.94 | 3.432 | 1906.647 | 22 | 12379 |
| create · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:150 | 0.05 | 60.99 | 1.695 | 2116.936 | 11 | 13743 |
| scan · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/JSONSchemaScanner.cjs:15 | 0.04 | 5.92 | 1.535 | 205.502 | 10 | 1333 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.04 | 78.10 | 1.328 | 2710.592 | 9 | 17575 |
| __onChangeWithOmitEmpty__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:79 | 0.04 | 6.82 | 1.256 | 236.815 | 8 | 1540 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155 | 0.03 | 17.96 | 1.072 | 623.352 | 7 | 4049 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137 | 0.02 | 17.98 | 0.619 | 623.971 | 4 | 4053 |
| nodeFromJSONSchema · PKG/src/__legacy__/core/nodeFromJSONSchema.ts:34 | 0.02 | 60.94 | 0.614 | 2114.934 | 4 | 13730 |
| getReferenceTable · PKG/src/__legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts:12 | 0.01 | 5.94 | 0.482 | 206.292 | 3 | 1338 |
| getResolveSchema · PKG/src/__legacy__/helpers/jsonSchema/getResolveSchema/getResolveSchema.ts:18 | 0.01 | 5.95 | 0.305 | 206.597 | 2 | 1340 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3470.731 | 0 | 22369 |

### head · nested-d5-f4/mount

연산 257회; 작업 벽시계 3509.686 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,682개 / 3506.954 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-nested-d5-f4-mount.json](profile-99c01/profile-99c01-head-nested-d5-f4-mount.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| (garbage collector) · (V8):0 | 21.91 | 21.91 | 768.530 | 768.530 | 4872 | 4872 |
| buildNodes · PKG/src/core/blueprint/utils/analyze/buildNodes.ts:24 | 9.31 | 32.69 | 326.583 | 1146.363 | 2125 | 7464 |
| _SchemaNodeRevisionLedger · PKG/src/core/record/utils/SchemaNodeRevisionLedger.ts:18 | 7.18 | 7.83 | 251.905 | 274.743 | 1639 | 1787 |
| structuredClone · node:internal/worker/js_transferable:101 | 5.50 | 5.53 | 192.724 | 193.982 | 1245 | 1253 |
| applySchemaContribution · PKG/src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36 | 4.63 | 8.33 | 162.284 | 292.189 | 1057 | 1902 |
| ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 3.94 | 3.94 | 138.027 | 138.027 | 897 | 897 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 3.24 | 3.76 | 113.455 | 131.724 | 737 | 856 |
| collectDeclarations · PKG/src/core/blueprint/utils/analyze/collectDeclarations.ts:27 | 3.23 | 3.80 | 113.357 | 133.273 | 738 | 868 |
| commitStaticFirstNode · PKG/src/core/settle/utils/load/commitStaticFirstNode.ts:13 | 3.17 | 11.00 | 111.063 | 385.806 | 722 | 2509 |
| populateNodeChildren · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:19 | 3.03 | 32.10 | 106.375 | 1125.844 | 692 | 7332 |
| blueprint · PKG/src/core/blueprint/blueprint.ts:21 | 2.90 | 37.49 | 101.820 | 1314.889 | 663 | 8561 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 2.61 | 21.99 | 91.582 | 771.042 | 596 | 5016 |
| getTemplateKey · PKG/src/core/blueprint/utils/analyze/getTemplateKey.ts:11 | 2.25 | 2.38 | 79.052 | 83.373 | 515 | 543 |
| createSchemaNode · PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 2.21 | 13.75 | 77.509 | 482.333 | 504 | 3136 |
| applyConstraintKeywords · PKG/src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:36 | 1.82 | 2.11 | 63.752 | 73.866 | 415 | 481 |
| mergeSchemaContributions · PKG/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27 | 1.76 | 11.69 | 61.608 | 409.869 | 401 | 2668 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 1.74 | 2.08 | 61.104 | 73.091 | 397 | 475 |
| getStaticObjectEntries · PKG/src/core/settle/utils/load/getStaticObjectEntries.ts:11 | 1.64 | 1.64 | 57.453 | 57.453 | 374 | 374 |
| finalizeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:13 | 1.60 | 1.63 | 56.075 | 57.293 | 365 | 373 |
| getStaticChoices · PKG/src/core/behaviors/utils/options/getStaticChoices.ts:23 | 1.53 | 1.53 | 53.509 | 53.509 | 348 | 348 |
| loadStaticFirstTree · PKG/src/core/settle/utils/load/loadStaticFirstTree.ts:42 | 1.48 | 31.44 | 51.976 | 1102.647 | 339 | 7171 |
| (program) · (V8):0 | 1.41 | 1.41 | 49.506 | 49.506 | 323 | 323 |
| visitShape · PKG/src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:14 | 1.40 | 1.42 | 49.156 | 49.775 | 319 | 323 |
| (anonymous) · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:73 | 1.09 | 1.21 | 38.397 | 42.372 | 251 | 277 |
| (anonymous) · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:163 | 1.07 | 1.07 | 37.540 | 37.540 | 245 | 245 |
| createChildNode · PKG/src/core/settle/utils/compute/createChildNode.ts:10 | 0.43 | 13.10 | 15.195 | 459.246 | 99 | 2986 |
| assembleStaticFirstNode · PKG/src/core/settle/utils/load/assembleStaticFirstNode.ts:11 | 0.31 | 3.84 | 10.799 | 134.637 | 70 | 875 |
| loadSchemaNodeAtMount · PKG/src/core/settle/utils/load/loadSchemaNodeAtMount.ts:15 | 0.18 | 32.28 | 6.159 | 1132.188 | 40 | 7363 |
| buildSchemaNodeTree · PKG/src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37 | 0.08 | 37.98 | 2.763 | 1331.958 | 18 | 8672 |
| create · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:150 | 0.01 | 70.78 | 0.489 | 2482.282 | 3 | 16152 |
| nodeFromJSONSchema · PKG/src/core/nodeFromJSONSchema.ts:17 | 0.01 | 70.77 | 0.309 | 2481.793 | 2 | 16149 |
| dispatchMount · PKG/src/core/dispatch/utils/entry/dispatchMount.ts:21 | 0.01 | 32.75 | 0.309 | 1148.608 | 2 | 7469 |
| mountSchemaNode · PKG/src/core/SchemaNode/utils/binding/mountSchemaNode.ts:14 | 0.01 | 32.78 | 0.305 | 1149.526 | 2 | 7475 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3506.954 | 0 | 22682 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.00 | 76.34 | 0.000 | 2677.189 | 0 | 17411 |

### old · nested-d5-f4/mount

연산 1,002회; 작업 벽시계 3502.429 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,523개 / 3492.333 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-old-nested-d5-f4-mount.json](profile-99c01/profile-99c01-old-nested-d5-f4-mount.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| structuredClone · node:internal/worker/js_transferable:101 | 21.05 | 21.12 | 735.246 | 737.737 | 4756 | 4772 |
| (garbage collector) · (V8):0 | 18.30 | 18.30 | 639.251 | 639.251 | 4029 | 4029 |
| needsRealComputedManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27 | 12.46 | 12.46 | 435.260 | 435.260 | 2837 | 2837 |
| mergeEventEntries · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13 | 6.52 | 6.52 | 227.554 | 227.554 | 1481 | 1481 |
| getComputedPropertiesManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19 | 5.03 | 17.47 | 175.623 | 610.121 | 1145 | 3977 |
| EventCascadeManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257 | 3.29 | 3.29 | 114.991 | 114.991 | 749 | 749 |
| AbstractNode · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146 | 3.14 | 25.45 | 109.749 | 888.938 | 712 | 5790 |
| scannerFactory · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/scannerFactory.cjs:17 | 2.50 | 4.58 | 87.363 | 159.887 | 563 | 1031 |
| (program) · (V8):0 | 1.85 | 1.85 | 64.748 | 64.748 | 418 | 418 |
| BranchStrategy2 · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761 | 1.75 | 41.12 | 60.969 | 1435.921 | 397 | 9350 |
| getChildNodeMap · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:33 | 1.54 | 41.06 | 53.634 | 1433.882 | 349 | 9337 |
| StringNode · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:111 | 1.24 | 23.72 | 43.160 | 828.244 | 280 | 5394 |
| sortObjectKeys · packages/winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6 | 0.99 | 1.32 | 34.463 | 45.980 | 225 | 300 |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 0.88 | 0.88 | 30.810 | 30.810 | 200 | 200 |
| pushMapChildren · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:34 | 0.87 | 1.37 | 30.243 | 48.013 | 195 | 310 |
| onChange · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414 | 0.86 | 1.63 | 30.098 | 57.076 | 196 | 371 |
| ObjectNode · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:96 | 0.83 | 43.47 | 28.893 | 1518.204 | 188 | 9886 |
| runNextTicks · node:internal/process/task_queues:63 | 0.82 | 1.62 | 28.701 | 56.455 | 171 | 342 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807 | 0.82 | 0.82 | 28.477 | 28.791 | 185 | 187 |
| __acquireBatch__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90 | 0.80 | 2.50 | 27.983 | 87.388 | 182 | 569 |
| runMicrotasks · (V8):0 | 0.73 | 0.73 | 25.493 | 25.493 | 157 | 157 |
| getStackEntriesForNode · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:74 | 0.71 | 2.09 | 24.818 | 72.991 | 160 | 471 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134 | 0.66 | 3.16 | 22.879 | 110.267 | 149 | 718 |
| __parseValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220 | 0.63 | 2.41 | 21.909 | 84.160 | 143 | 549 |
| enqueueMicrotask · (V8):0 | 0.61 | 0.61 | 21.174 | 21.174 | 138 | 138 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891 | 0.58 | 3.73 | 20.165 | 130.432 | 131 | 849 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120 | 0.54 | 7.27 | 18.886 | 254.015 | 122 | 1652 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:40 | 0.51 | 3.73 | 17.899 | 130.371 | 117 | 849 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137 | 0.51 | 4.33 | 17.861 | 151.387 | 116 | 986 |
| (anonymous) · PKG/src/__legacy__/core/nodes/schemaNodeFactory.ts:75 | 0.40 | 43.50 | 13.815 | 1519.013 | 90 | 9891 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155 | 0.32 | 3.82 | 11.065 | 133.396 | 72 | 869 |
| initialize · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:717 | 0.28 | 2.19 | 9.791 | 76.521 | 64 | 499 |
| __run__ · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/JSONSchemaScanner.cjs:47 | 0.24 | 4.82 | 8.356 | 168.378 | 54 | 1086 |
| processImmediate · node:internal/timers:525 | 0.18 | 2.42 | 6.393 | 84.558 | 39 | 516 |
| create · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:150 | 0.07 | 48.45 | 2.308 | 1692.007 | 15 | 11007 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.06 | 69.66 | 2.037 | 2432.721 | 13 | 15798 |
| __initialize__ · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:72 | 0.03 | 2.23 | 1.221 | 77.893 | 8 | 508 |
| scan · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/JSONSchemaScanner.cjs:15 | 0.03 | 4.85 | 0.923 | 169.301 | 6 | 1092 |
| getReferenceTable · PKG/src/__legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts:12 | 0.02 | 4.87 | 0.768 | 170.069 | 5 | 1097 |
| nodeFromJSONSchema · PKG/src/__legacy__/core/nodeFromJSONSchema.ts:34 | 0.01 | 48.38 | 0.461 | 1689.542 | 3 | 10991 |
| getResolveSchema · PKG/src/__legacy__/helpers/jsonSchema/getResolveSchema/getResolveSchema.ts:18 | 0.00 | 4.87 | 0.152 | 170.221 | 1 | 1098 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3492.333 | 0 | 22523 |

### head · oneOf-20/mount

연산 2,979회; 작업 벽시계 3500.214 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 22,374개 / 3457.647 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-head-oneOf-20-mount.json](profile-99c01/profile-99c01-head-oneOf-20-mount.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 8.52 | 8.52 | 294.667 | 294.667 | 1917 | 1917 |
| (garbage collector) · (V8):0 | 7.62 | 7.62 | 263.475 | 263.475 | 1605 | 1605 |
| selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 6.64 | 27.91 | 229.519 | 965.035 | 1496 | 6289 |
| structuredClone · node:internal/worker/js_transferable:101 | 4.83 | 4.91 | 166.869 | 169.744 | 1074 | 1092 |
| readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 4.49 | 5.96 | 155.412 | 205.966 | 1012 | 1342 |
| buildNodes · PKG/src/core/blueprint/utils/analyze/buildNodes.ts:24 | 4.19 | 21.61 | 144.748 | 747.311 | 943 | 4856 |
| add · PKG/src/core/settle/utils/write/getDependencyIndex.ts:119 | 3.88 | 3.90 | 134.240 | 135.015 | 872 | 877 |
| collectDeclarations · PKG/src/core/blueprint/utils/analyze/collectDeclarations.ts:27 | 2.92 | 6.20 | 100.845 | 214.390 | 654 | 1391 |
| computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.57 | 40.76 | 88.969 | 1409.214 | 580 | 9181 |
| collectGateEvaluationReads · PKG/src/core/blueprint/utils/analyze/collectGateEvaluationReads.ts:8 | 2.50 | 2.57 | 86.590 | 88.919 | 562 | 577 |
| (program) · (V8):0 | 2.39 | 2.39 | 82.758 | 82.758 | 538 | 538 |
| blueprint · PKG/src/core/blueprint/blueprint.ts:21 | 1.95 | 26.14 | 67.563 | 903.713 | 438 | 5871 |
| getTemplateKey · PKG/src/core/blueprint/utils/analyze/getTemplateKey.ts:11 | 1.94 | 2.19 | 67.087 | 75.570 | 434 | 490 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 1.93 | 1.93 | 66.642 | 66.642 | 435 | 435 |
| populateNodeChildren · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:19 | 1.84 | 15.64 | 63.520 | 540.733 | 415 | 3514 |
| evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 1.75 | 15.99 | 60.439 | 552.730 | 394 | 3601 |
| ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 1.64 | 1.64 | 56.563 | 56.873 | 368 | 370 |
| getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 1.56 | 1.56 | 53.786 | 53.786 | 350 | 350 |
| registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.48 | 10.13 | 51.182 | 350.109 | 334 | 2277 |
| flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 1.25 | 5.73 | 43.181 | 198.137 | 281 | 1290 |
| DependencyIndex · PKG/src/core/settle/utils/write/getDependencyIndex.ts:32 | 1.24 | 6.73 | 42.890 | 232.571 | 278 | 1510 |
| register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 1.23 | 2.61 | 42.381 | 90.117 | 276 | 586 |
| selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 1.07 | 1.28 | 37.166 | 44.191 | 241 | 287 |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 1.06 | 1.06 | 36.701 | 36.701 | 239 | 239 |
| assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 1.04 | 1.10 | 35.875 | 38.010 | 234 | 248 |
| (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 0.79 | 12.12 | 27.389 | 419.220 | 179 | 2731 |
| mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.57 | 4.88 | 19.639 | 168.821 | 127 | 1096 |
| selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.53 | 6.18 | 18.307 | 213.744 | 119 | 1390 |
| compileBlueprintExpressions · PKG/src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts:23 | 0.49 | 2.08 | 16.831 | 71.863 | 109 | 467 |
| flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 0.45 | 3.86 | 15.405 | 133.379 | 100 | 868 |
| transitionSettlement · PKG/src/core/settle/utils/transition/transitionSettlement.ts:28 | 0.44 | 37.27 | 15.062 | 1288.534 | 98 | 8398 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.36 | 4.95 | 12.447 | 171.094 | 81 | 1113 |
| getDependencyIndex · PKG/src/core/settle/utils/write/getDependencyIndex.ts:161 | 0.16 | 6.89 | 5.502 | 238.224 | 36 | 1547 |
| writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.11 | 57.58 | 3.700 | 1990.885 | 24 | 12965 |
| createBlueprintGate · PKG/src/core/blueprint/utils/analyze/createBlueprintGate.ts:9 | 0.10 | 2.66 | 3.362 | 92.132 | 22 | 598 |
| create · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:150 | 0.08 | 84.44 | 2.851 | 2919.523 | 18 | 18997 |
| finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.07 | 39.31 | 2.440 | 1359.364 | 16 | 8861 |
| (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.07 | 4.55 | 2.327 | 157.420 | 15 | 1024 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.04 | 89.45 | 1.215 | 3092.795 | 8 | 20111 |
| dispatchMount · PKG/src/core/dispatch/utils/entry/dispatchMount.ts:21 | 0.03 | 57.82 | 1.069 | 1999.041 | 7 | 13018 |
| loadSchemaNodeAtMount · PKG/src/core/settle/utils/load/loadSchemaNodeAtMount.ts:15 | 0.02 | 57.63 | 0.609 | 1992.576 | 4 | 12976 |
| buildSchemaNodeTree · PKG/src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37 | 0.01 | 26.51 | 0.461 | 916.715 | 3 | 5955 |
| nodeFromJSONSchema · PKG/src/core/nodeFromJSONSchema.ts:17 | 0.00 | 84.35 | 0.154 | 2916.365 | 1 | 18977 |
| mountSchemaNode · PKG/src/core/SchemaNode/utils/binding/mountSchemaNode.ts:14 | 0.00 | 57.83 | 0.149 | 1999.496 | 1 | 13021 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 3457.647 | 0 | 22374 |

### old · oneOf-20/mount

연산 20,437회; 작업 벽시계 3500.044 ms; 첫 갱신 누적 동기 작업 0.000 ms; 선택된 비유휴 표본 15,733개 / 2422.639 ms; 요청 interval 100 µs. 개별 요약: [profile-99c01/profile-99c01-old-oneOf-20-mount.json](profile-99c01/profile-99c01-old-oneOf-20-mount.json).

| 함수 / 원본 | self % | total % | self ms | total ms | self 표본 | total 표본 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| structuredClone · node:internal/worker/js_transferable:101 | 28.58 | 28.96 | 692.386 | 701.605 | 4505 | 4565 |
| needsRealComputedManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27 | 9.94 | 9.94 | 240.809 | 240.809 | 1569 | 1569 |
| mergeEventEntries · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13 | 6.33 | 6.33 | 153.344 | 153.344 | 993 | 993 |
| getComputedPropertiesManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19 | 4.46 | 21.51 | 108.134 | 521.018 | 706 | 3405 |
| (program) · (V8):0 | 3.86 | 3.86 | 93.442 | 93.442 | 608 | 608 |
| AbstractNode · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146 | 3.17 | 29.29 | 76.725 | 709.635 | 499 | 4634 |
| EventCascadeManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257 | 3.10 | 3.10 | 75.064 | 75.064 | 490 | 490 |
| (garbage collector) · (V8):0 | 2.70 | 2.70 | 65.475 | 65.475 | 388 | 388 |
| extractConditionInfo · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/extractConditionInfo.ts:30 | 2.40 | 3.80 | 58.083 | 92.069 | 377 | 598 |
| scannerFactory · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/scannerFactory.cjs:17 | 2.32 | 4.91 | 56.179 | 119.066 | 366 | 776 |
| getSimpleEquality · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/getSimpleEquality.ts:31 | 1.95 | 2.47 | 47.306 | 59.880 | 309 | 391 |
| getCompositionNodeMapList · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:42 | 1.71 | 27.52 | 41.530 | 666.707 | 271 | 4346 |
| drain · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:144 | 1.58 | 1.78 | 38.352 | 43.097 | 250 | 281 |
| getCompositionKeyInfo · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionKeyInfo/getCompositionKeyInfo.ts:16 | 1.39 | 1.40 | 33.673 | 33.979 | 219 | 221 |
| getEventCollection · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/getEventCollection.ts:7 | 1.36 | 1.36 | 32.979 | 32.979 | 214 | 214 |
| BranchStrategy2 · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761 | 1.24 | 32.11 | 30.152 | 777.904 | 196 | 5070 |
| getStackEntriesForNode · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:74 | 1.10 | 2.56 | 26.694 | 61.978 | 174 | 404 |
| escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 0.98 | 0.98 | 23.732 | 23.732 | 155 | 155 |
| __processChildren__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:596 | 0.86 | 0.90 | 20.820 | 21.774 | 135 | 141 |
| pushMapChildren · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:34 | 0.71 | 1.36 | 17.132 | 32.994 | 112 | 215 |
| runMicrotasks · (V8):0 | 0.65 | 0.65 | 15.863 | 15.863 | 103 | 103 |
| hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 0.61 | 0.61 | 14.669 | 14.669 | 95 | 95 |
| __acquireBatch__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90 | 0.59 | 1.94 | 14.230 | 47.038 | 92 | 306 |
| BooleanNode · PKG/src/__legacy__/core/nodes/BooleanNode/BooleanNode.ts:89 | 0.58 | 8.09 | 14.111 | 196.036 | 92 | 1283 |
| enqueueMicrotask · (V8):0 | 0.56 | 0.56 | 13.577 | 13.577 | 89 | 89 |
| StringNode · PKG/src/__legacy__/core/nodes/StringNode/StringNode.ts:111 | 0.51 | 9.20 | 12.263 | 222.832 | 80 | 1450 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891 | 0.50 | 4.42 | 12.185 | 106.981 | 79 | 695 |
| NumberNode · PKG/src/__legacy__/core/nodes/NumberNode/NumberNode.ts:125 | 0.50 | 8.59 | 12.112 | 208.141 | 79 | 1355 |
| publish · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134 | 0.46 | 2.40 | 11.095 | 58.133 | 72 | 378 |
| __initialize__ · PKG/src/__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1041 | 0.40 | 2.29 | 9.615 | 55.548 | 62 | 358 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/getConditionIndexFactory.ts:33 | 0.39 | 6.67 | 9.352 | 161.634 | 61 | 1052 |
| __run__ · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/JSONSchemaScanner.cjs:47 | 0.35 | 5.36 | 8.444 | 129.969 | 55 | 847 |
| (anonymous) · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120 | 0.30 | 10.58 | 7.383 | 256.427 | 48 | 1660 |
| create · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:150 | 0.30 | 49.00 | 7.333 | 1187.081 | 47 | 7740 |
| (anonymous) · PKG/src/__legacy__/core/nodes/schemaNodeFactory.ts:75 | 0.28 | 43.14 | 6.788 | 1045.191 | 44 | 6816 |
| processImmediate · node:internal/timers:525 | 0.25 | 2.42 | 6.032 | 58.639 | 39 | 380 |
| __resolve__ · PKG/src/__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:207 | 0.25 | 3.95 | 6.013 | 95.700 | 39 | 619 |
| ComputedPropertiesManager · PKG/src/__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/ComputedPropertiesManager.ts:246 | 0.17 | 7.14 | 4.150 | 172.985 | 28 | 1136 |
| initialize · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:717 | 0.15 | 2.18 | 3.550 | 52.896 | 23 | 342 |
| ObjectNode · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:96 | 0.15 | 43.12 | 3.541 | 1044.599 | 23 | 6812 |
| profileWorker · PKG/architecture/verification/07-switch/tools/profile-99c01.mjs:204 | 0.11 | 78.20 | 2.644 | 1894.432 | 18 | 12343 |
| __emitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137 | 0.08 | 2.79 | 2.031 | 67.669 | 14 | 440 |
| __handleEmitChange__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155 | 0.08 | 2.70 | 1.840 | 65.331 | 12 | 424 |
| getReferenceTable · PKG/src/__legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts:12 | 0.07 | 5.49 | 1.677 | 132.998 | 11 | 867 |
| __processCompositionValue__ · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:623 | 0.04 | 2.56 | 1.077 | 61.971 | 7 | 402 |
| (anonymous) · PKG/src/__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:447 | 0.04 | 3.63 | 0.977 | 87.969 | 6 | 569 |
| nodeFromJSONSchema · PKG/src/__legacy__/core/nodeFromJSONSchema.ts:34 | 0.04 | 48.68 | 0.943 | 1179.441 | 6 | 7691 |
| __initialize__ · PKG/src/__legacy__/core/nodes/ObjectNode/ObjectNode.ts:72 | 0.04 | 2.93 | 0.920 | 70.938 | 6 | 458 |
| scan · packages/winglet/json-schema/dist/utils/JSONSchemaScanner/sync/JSONSchemaScanner.cjs:15 | 0.04 | 5.40 | 0.898 | 130.867 | 6 | 853 |
| getResolveSchema · PKG/src/__legacy__/helpers/jsonSchema/getResolveSchema/getResolveSchema.ts:18 | 0.03 | 5.52 | 0.616 | 133.614 | 4 | 871 |
| (root) · (V8):0 | 0.00 | 100.00 | 0.000 | 2422.639 | 0 | 15733 |

## 제거 상한과 잡음

단위는 ms입니다. Δ=각 fresh process의 median(HEAD)−median(제거); 대표값은 세 Δ의 median입니다. 범위는 세 run의 최솟값–최댓값입니다. “결과 변경”은 마지막 표본의 output hash가 달라진 run 수이며, 0/3도 모든 중간 동작의 동치 증명은 아닙니다.

| 연산 | 동일 번들 잡음 N ms | control Δ 3회 |
| --- | ---: | --- |
| array-100/later | 0.002917 | 0.001417, -0.002001, 0.000125 |
| nested-d5-f4/later | 0.002917 | 0.002917, -0.002250, 0.000208 |
| oneOf-40/later | 0.016584 | -0.016584, -0.015958, -0.003208 |
| oneOf-5/first | 0.005833 | 0.000833, -0.002667, -0.001417 |
| computed-visible-derived/first | 0.004750 | -0.000083, 0.002083, 0.004750 |
| sample-0/first | 0.002167 | 0.001251, -0.000249, -0.002167 |
| nested-d5-f4/mount | 0.492333 | -0.232876, -0.280333, -0.492333 |
| array-100/first | 0.005292 | 0.001334, -0.002124, 0.003125 |
| oneOf-40/first | 0.012208 | 0.009542, -0.007041, 0.012208 |
| oneOf-5/later | 0.006500 | -0.006084, 0.006500, -0.000499 |
| flat-500/mount | 0.056583 | 0.029041, 0.056583, 0.011000 |
| computed-visible-derived/later | 0.006167 | 0.006167, 0.002459, -0.001084 |
| nested-d5-f4/first | 0.063207 | 0.022208, -0.008667, 0.009416 |
| oneOf-20/mount | 0.025333 | -0.025333, 0.000208, -0.004209 |
| sample-0/later | 0.001500 | -0.001500, -0.000749, -0.000750 |

| 제거 job | 연산 | HEAD / 제거 ms | Δ median ms | 3회 Δ 범위 ms | N ms | 판정 | 분류 | 결과 변경 |
| --- | --- | ---: | ---: | --- | ---: | --- | --- | --- |
| total-write | array-100/later | 0.129396 / 0.040667 | 0.089834 | 0.088041–0.095041 | 0.002917 | 초과 | 구조 | 3/3 |
| total-write | nested-d5-f4/later | 0.143208 / 0.043333 | 0.102792 | 0.099875–0.105917 | 0.002917 | 초과 | 구조 | 3/3 |
| total-write | oneOf-40/later | 0.981041 / 0.040479 | 0.940459 | 0.938000–0.941083 | 0.016584 | 초과 | 구조 | 3/3 |
| total-write | oneOf-5/first | 0.597938 / 0.045062 | 0.553125 | 0.542876–0.554417 | 0.005833 | 초과 | 구조 | 3/3 |
| total-write | computed-visible-derived/first | 0.252853 / 0.041937 | 0.211583 | 0.206792–0.212251 | 0.004750 | 초과 | 구조 | 3/3 |
| total-write | sample-0/first | 0.121021 / 0.039625 | 0.081875 | 0.079749–0.082834 | 0.002167 | 초과 | 구조 | 3/3 |
| total-write | array-100/first | 0.135667 / 0.040500 | 0.094667 | 0.093500–0.100750 | 0.005292 | 초과 | 구조 | 3/3 |
| total-write | oneOf-40/first | 1.482020 / 0.045354 | 1.437291 | 1.428667–1.440001 | 0.012208 | 초과 | 구조 | 3/3 |
| total-write | oneOf-5/later | 0.478375 / 0.039583 | 0.437958 | 0.427000–0.443042 | 0.006500 | 초과 | 구조 | 3/3 |
| total-write | computed-visible-derived/later | 0.227584 / 0.038707 | 0.188876 | 0.186582–0.190834 | 0.006167 | 초과 | 구조 | 3/3 |
| total-write | nested-d5-f4/first | 0.256397 / 0.059564 | 0.196833 | 0.191291–0.197749 | 0.063207 | 초과 | 구조 | 3/3 |
| total-write | oneOf-20/mount | 2.100020 / 2.130437 | -0.026625 | -0.042209–-0.007584 | 0.025333 | 불명확 | 구조 | 0/3 |
| total-write | sample-0/later | 0.112501 / 0.038125 | 0.073834 | 0.072375–0.074668 | 0.001500 | 초과 | 구조 | 3/3 |
| total-mount | nested-d5-f4/mount | 13.874167 / 0.046167 | 13.828000 | 13.503042–14.114209 | 0.492333 | 초과 | 구조 | 0/3 |
| total-mount | flat-500/mount | 4.541333 / 0.039395 | 4.502541 | 4.413833–4.787000 | 0.056583 | 초과 | 구조 | 0/3 |
| total-mount | oneOf-20/mount | 2.192105 / 0.037021 | 2.155084 | 2.147542–2.375001 | 0.025333 | 초과 | 구조 | 0/3 |
| root-build | nested-d5-f4/mount | 12.705188 / 9.398938 | 3.323500 | 3.166041–3.366209 | 0.492333 | 초과 | 구조 | 0/3 |
| root-build | flat-500/mount | 4.480751 / 2.924875 | 1.555876 | 1.537167–1.618917 | 0.056583 | 초과 | 구조 | 0/3 |
| root-build | oneOf-20/mount | 2.256103 / 1.335500 | 0.924916 | 0.873917–0.934042 | 0.025333 | 초과 | 구조 | 0/3 |
| compute | array-100/later | 0.132333 / 0.102542 | 0.029791 | 0.026834–0.030459 | 0.002917 | 초과 | 구조 | 3/3 |
| compute | nested-d5-f4/later | 0.145750 / 0.107417 | 0.038333 | 0.037167–0.040416 | 0.002917 | 초과 | 구조 | 3/3 |
| compute | oneOf-40/later | 0.984687 / 0.185855 | 0.800417 | 0.792458–0.840667 | 0.016584 | 초과 | 구조 | 3/3 |
| compute | oneOf-5/first | 0.591542 / 0.132979 | 0.459668 | 0.455708–0.472376 | 0.005833 | 초과 | 구조 | 3/3 |
| compute | computed-visible-derived/first | 0.252541 / 0.159792 | 0.092750 | 0.090458–0.093292 | 0.004750 | 초과 | 구조 | 3/3 |
| compute | sample-0/first | 0.121937 / 0.103645 | 0.018500 | 0.018292–0.018626 | 0.002167 | 초과 | 구조 | 3/3 |
| compute | array-100/first | 0.134542 / 0.102125 | 0.032125 | 0.030042–0.045375 | 0.005292 | 초과 | 구조 | 3/3 |
| compute | oneOf-40/first | 1.489792 / 0.180667 | 1.308333 | 1.299167–1.320875 | 0.012208 | 초과 | 구조 | 3/3 |
| compute | oneOf-5/later | 0.474876 / 0.130562 | 0.344125 | 0.340833–0.359250 | 0.006500 | 초과 | 구조 | 3/3 |
| compute | computed-visible-derived/later | 0.231666 / 0.152583 | 0.076458 | 0.075792–0.083832 | 0.006167 | 초과 | 구조 | 3/3 |
| compute | nested-d5-f4/first | 0.248958 / 0.146166 | 0.102792 | 0.099334–0.107708 | 0.063207 | 초과 | 구조 | 3/3 |
| compute | oneOf-20/mount | 2.067147 / 0.946605 | 1.120542 | 1.116791–1.121333 | 0.025333 | 초과 | 구조 | 3/3 |
| compute | sample-0/later | 0.114166 / 0.095333 | 0.018834 | 0.018750–0.019251 | 0.001500 | 초과 | 구조 | 3/3 |
| finish | array-100/later | 0.131104 / 0.091563 | 0.039541 | 0.036459–0.040042 | 0.002917 | 초과 | 구조 | 0/3 |
| finish | nested-d5-f4/later | 0.142291 / 0.099083 | 0.042167 | 0.041500–0.043208 | 0.002917 | 초과 | 구조 | 0/3 |
| finish | oneOf-40/later | 0.970708 / 0.807333 | 0.179999 | 0.160501–0.200875 | 0.016584 | 초과 | 구조 | 0/3 |
| finish | oneOf-5/first | 0.588605 / 0.327771 | 0.264125 | 0.260249–0.269416 | 0.005833 | 초과 | 구조 | 3/3 |
| finish | computed-visible-derived/first | 0.251521 / 0.114896 | 0.137042 | 0.136625–0.143208 | 0.004750 | 초과 | 구조 | 3/3 |
| finish | sample-0/first | 0.120333 / 0.087020 | 0.035001 | 0.032625–0.035500 | 0.002167 | 초과 | 구조 | 0/3 |
| finish | array-100/first | 0.141687 / 0.102375 | 0.037666 | 0.032958–0.045750 | 0.005292 | 초과 | 구조 | 0/3 |
| finish | oneOf-40/first | 1.494167 / 0.931917 | 0.562250 | 0.559959–0.571417 | 0.012208 | 초과 | 구조 | 3/3 |
| finish | oneOf-5/later | 0.477895 / 0.319605 | 0.159666 | 0.155958–0.163250 | 0.006500 | 초과 | 구조 | 0/3 |
| finish | computed-visible-derived/later | 0.232125 / 0.106853 | 0.124625 | 0.122168–0.126542 | 0.006167 | 초과 | 구조 | 3/3 |
| finish | nested-d5-f4/first | 0.254375 / 0.176688 | 0.078583 | 0.069916–0.079166 | 0.063207 | 불명확 | 구조 | 0/3 |
| finish | oneOf-20/mount | 2.087771 / 1.106603 | 0.983416 | 0.959751–1.077291 | 0.025333 | 초과 | 구조 | 3/3 |
| finish | sample-0/later | 0.113750 / 0.081542 | 0.032501 | 0.032208–0.034292 | 0.001500 | 초과 | 구조 | 0/3 |
| transition | oneOf-5/first | 0.601812 / 0.478646 | 0.121750 | 0.120501–0.123166 | 0.005833 | 초과 | 구조 | 3/3 |
| transition | oneOf-40/first | 1.503145 / 1.105459 | 0.406874 | 0.375250–0.413791 | 0.012208 | 초과 | 구조 | 3/3 |
| transition | oneOf-20/mount | 2.079395 / 1.184812 | 0.899875 | 0.882501–0.987124 | 0.025333 | 초과 | 구조 | 3/3 |
| children | oneOf-40/later | 0.997521 / 0.385938 | 0.611583 | 0.602875–0.611626 | 0.016584 | 초과 | 코드 | 3/3 |
| children | oneOf-5/first | 0.585978 / 0.227395 | 0.358583 | 0.358251–0.376917 | 0.005833 | 초과 | 코드 | 3/3 |
| children | oneOf-40/first | 1.497583 / 0.408792 | 1.088083 | 1.081249–1.096042 | 0.012208 | 초과 | 코드 | 3/3 |
| children | oneOf-5/later | 0.482604 / 0.220728 | 0.258166 | 0.251209–0.263001 | 0.006500 | 초과 | 코드 | 3/3 |
| children | oneOf-20/mount | 2.077291 / 1.224875 | 0.852416 | 0.841124–0.937459 | 0.025333 | 초과 | 코드 | 3/3 |
| gates | oneOf-40/later | 0.980418 / 0.367417 | 0.616084 | 0.607917–0.660208 | 0.016584 | 초과 | 구조 | 3/3 |
| gates | oneOf-5/first | 0.599021 / 0.337562 | 0.263874 | 0.261334–0.268876 | 0.005833 | 초과 | 구조 | 3/3 |
| gates | oneOf-40/first | 1.500230 / 0.589813 | 0.910417 | 0.905459–0.970958 | 0.012208 | 초과 | 구조 | 3/3 |
| gates | oneOf-5/later | 0.473812 / 0.218979 | 0.254958 | 0.252583–0.256417 | 0.006500 | 초과 | 구조 | 3/3 |
| gates | oneOf-20/mount | 2.065313 / 1.264416 | 0.800125 | 0.798542–0.828459 | 0.025333 | 초과 | 구조 | 3/3 |
| path-resolve | oneOf-40/later | 0.989355 / 0.912605 | 0.071166 | 0.067958–0.076750 | 0.016584 | 초과 | 코드 | 0/3 |
| path-resolve | oneOf-5/first | 0.586832 / 0.568959 | 0.017874 | 0.012001–0.021125 | 0.005833 | 초과 | 코드 | 0/3 |
| path-resolve | oneOf-40/first | 1.501084 / 1.353667 | 0.147417 | 0.145332–0.150625 | 0.012208 | 초과 | 코드 | 0/3 |
| path-resolve | oneOf-5/later | 0.497064 / 0.479459 | 0.013833 | 0.013501–0.026000 | 0.006500 | 초과 | 코드 | 0/3 |
| path-resolve | oneOf-20/mount | 2.097166 / 1.986208 | 0.115208 | 0.110958–0.126583 | 0.025333 | 초과 | 코드 | 0/3 |
| projected-read | oneOf-40/later | 0.983374 / 0.930208 | 0.053166 | 0.050583–0.063625 | 0.016584 | 초과 | 코드 | 0/3 |
| projected-read | oneOf-5/first | 0.597000 / 0.578958 | 0.015626 | 0.014250–0.018042 | 0.005833 | 초과 | 코드 | 0/3 |
| projected-read | oneOf-40/first | 1.504646 / 1.401229 | 0.110625 | 0.103417–0.118542 | 0.012208 | 초과 | 코드 | 0/3 |
| projected-read | oneOf-5/later | 0.474271 / 0.464750 | 0.012667 | 0.007125–0.014626 | 0.006500 | 초과 | 코드 | 0/3 |
| projected-read | oneOf-20/mount | 2.096000 / 1.940167 | 0.162583 | 0.129666–0.170708 | 0.025333 | 초과 | 코드 | 0/3 |
| read-flush | oneOf-40/later | 1.046104 / 0.954104 | 0.100291 | 0.092000–0.100792 | 0.016584 | 초과 | 코드 | 0/3 |
| read-flush | oneOf-5/first | 0.591479 / 0.584270 | 0.007000 | 0.006625–0.007208 | 0.005833 | 불명확 | 코드 | 0/3 |
| read-flush | oneOf-40/first | 1.499770 / 1.363917 | 0.136999 | 0.132708–0.143458 | 0.012208 | 초과 | 코드 | 0/3 |
| read-flush | oneOf-5/later | 0.482792 / 0.471625 | 0.008083 | 0.004875–0.012125 | 0.006500 | 불명확 | 코드 | 0/3 |
| read-flush | oneOf-20/mount | 2.091355 / 1.963646 | 0.125291 | 0.118458–0.128584 | 0.025333 | 초과 | 코드 | 0/3 |
| gate-registry | nested-d5-f4/later | 0.141812 / 0.140312 | 0.001292 | 0.000250–0.001875 | 0.002917 | 불명확 | 코드 | 0/3 |
| gate-registry | oneOf-40/later | 0.988979 / 0.961417 | 0.020791 | 0.017416–0.050709 | 0.016584 | 초과 | 코드 | 0/3 |
| gate-registry | oneOf-5/first | 0.597979 / 0.574187 | 0.015876 | 0.014833–0.023792 | 0.005833 | 초과 | 코드 | 0/3 |
| gate-registry | oneOf-40/first | 1.500813 / 1.466604 | 0.048626 | 0.034209–0.051750 | 0.012208 | 초과 | 코드 | 0/3 |
| gate-registry | oneOf-5/later | 0.479083 / 0.460374 | 0.019958 | 0.018709–0.020166 | 0.006500 | 초과 | 코드 | 0/3 |
| gate-expression | oneOf-40/later | 0.979521 / 0.464855 | 0.516583 | 0.505333–0.536125 | 0.016584 | 초과 | 코드 | 3/3 |
| gate-expression | oneOf-5/first | 0.586897 / 0.368334 | 0.217875 | 0.215500–0.221083 | 0.005833 | 초과 | 코드 | 3/3 |
| gate-expression | oneOf-40/first | 1.506125 / 0.885750 | 0.620166 | 0.615624–0.623250 | 0.012208 | 초과 | 코드 | 3/3 |
| gate-expression | oneOf-5/later | 0.472667 / 0.239250 | 0.234833 | 0.230083–0.237125 | 0.006500 | 초과 | 코드 | 3/3 |
| prime-host | oneOf-40/later | 0.991730 / 0.969896 | 0.021834 | 0.009541–0.025417 | 0.016584 | 불명확 | 구조 | 0/3 |
| prime-host | oneOf-5/first | 0.587417 / 0.560876 | 0.024750 | 0.024500–0.026542 | 0.005833 | 초과 | 구조 | 0/3 |
| prime-host | oneOf-40/first | 1.495917 / 1.251625 | 0.242626 | 0.239208–0.246917 | 0.012208 | 초과 | 구조 | 0/3 |
| prime-host | oneOf-5/later | 0.475500 / 0.483520 | -0.006541 | -0.009250–-0.005541 | 0.006500 | 불명확 | 구조 | 0/3 |
| exits | oneOf-5/first | 0.588563 / 0.496229 | 0.092334 | 0.089958–0.097875 | 0.005833 | 초과 | 구조 | 0/3 |
| exits | oneOf-5/later | 0.497896 / 0.454604 | 0.043292 | 0.009917–0.043375 | 0.006500 | 불명확 | 구조 | 0/3 |
| inactive-memo | oneOf-5/later | 0.479041 / 0.455333 | 0.023708 | 0.023416–0.029875 | 0.006500 | 초과 | 코드 | 0/3 |
| latent-prune | oneOf-40/later | 0.997208 / 0.983791 | 0.012792 | 0.009458–0.024459 | 0.016584 | 불명확 | 코드 | 0/3 |
| latent-prune | oneOf-5/first | 0.591688 / 0.576020 | 0.013166 | 0.006917–0.015667 | 0.005833 | 불명확 | 코드 | 0/3 |
| latent-prune | oneOf-40/first | 1.489564 / 1.484229 | -0.000417 | -0.001209–0.005334 | 0.012208 | 불명확 | 코드 | 0/3 |
| latent-prune | oneOf-5/later | 0.476646 / 0.476896 | 0.004667 | -0.001041–0.005958 | 0.006500 | 불명확 | 코드 | 0/3 |
| schema-select | oneOf-40/later | 0.996374 / 0.925375 | 0.072041 | 0.063167–0.085917 | 0.016584 | 초과 | 코드 | 0/3 |
| schema-select | oneOf-5/first | 0.588228 / 0.560750 | 0.026916 | 0.021751–0.038083 | 0.005833 | 초과 | 코드 | 0/3 |
| schema-select | computed-visible-derived/first | 0.253500 / 0.238791 | 0.012208 | 0.011751–0.014709 | 0.004750 | 초과 | 코드 | 0/3 |
| schema-select | oneOf-40/first | 1.505896 / 1.376062 | 0.129834 | 0.127583–0.136041 | 0.012208 | 초과 | 코드 | 0/3 |
| schema-select | oneOf-5/later | 0.486562 / 0.466604 | 0.012792 | 0.012167–0.019959 | 0.006500 | 초과 | 코드 | 0/3 |
| schema-select | computed-visible-derived/later | 0.233875 / 0.220709 | 0.014375 | 0.013166–0.015709 | 0.006167 | 초과 | 코드 | 0/3 |
| schema-select | oneOf-20/mount | 2.112083 / 2.007333 | 0.102834 | 0.073583–0.106666 | 0.025333 | 초과 | 코드 | 0/3 |
| schema-merge | oneOf-5/first | 0.589105 / 0.552062 | 0.037042 | 0.032458–0.043542 | 0.005833 | 초과 | 코드 | 0/3 |
| schema-merge | nested-d5-f4/mount | 12.946688 / 9.773833 | 3.166792 | 3.060708–3.290125 | 0.492333 | 초과 | 코드 | 0/3 |
| schema-merge | flat-500/mount | 4.482145 / 3.436332 | 1.013376 | 1.012709–1.089833 | 0.056583 | 초과 | 코드 | 0/3 |
| blueprint | nested-d5-f4/mount | 13.273896 / 2.580313 | 10.675500 | 10.660749–10.802792 | 0.492333 | 초과 | 구조 | 0/3 |
| blueprint | flat-500/mount | 4.446750 / 0.986624 | 3.460126 | 3.420042–3.469457 | 0.056583 | 초과 | 구조 | 0/3 |
| blueprint | oneOf-20/mount | 2.268646 / 1.290271 | 0.978375 | 0.965084–1.241041 | 0.025333 | 초과 | 구조 | 0/3 |
| static-load | nested-d5-f4/mount | 12.959500 / 7.418916 | 5.494417 | 5.459750–5.557041 | 0.492333 | 초과 | 구조 | 3/3 |
| static-load | flat-500/mount | 4.404021 / 2.688895 | 1.732083 | 1.693459–1.733750 | 0.056583 | 초과 | 구조 | 3/3 |
| mount-load | nested-d5-f4/mount | 12.922251 / 7.464084 | 5.458166 | 5.152417–5.713333 | 0.492333 | 초과 | 구조 | 3/3 |
| mount-load | flat-500/mount | 4.397333 / 2.692854 | 1.703001 | 1.692542–1.707375 | 0.056583 | 초과 | 구조 | 3/3 |
| mount-load | oneOf-20/mount | 2.044730 / 0.641167 | 1.402000 | 1.399042–1.425709 | 0.025333 | 초과 | 구조 | 3/3 |
| static-commit | nested-d5-f4/mount | 12.986271 / 11.190937 | 1.830292 | 1.755875–2.267083 | 0.492333 | 초과 | 코드 | 0/3 |
| static-commit | flat-500/mount | 4.773167 / 4.096230 | 0.633500 | 0.588791–0.687333 | 0.056583 | 초과 | 코드 | 0/3 |
| revision | nested-d5-f4/mount | 12.983355 / 11.777395 | 1.049291 | 1.035542–1.599667 | 0.492333 | 초과 | 코드 | 0/3 |
| revision | flat-500/mount | 4.434459 / 3.980917 | 0.453542 | 0.366708–0.456875 | 0.056583 | 초과 | 코드 | 0/3 |
| commit | array-100/later | 0.133542 / 0.098562 | 0.034000 | 0.032292–0.036667 | 0.002917 | 초과 | 구조 | 0/3 |
| commit | nested-d5-f4/later | 0.142375 / 0.105250 | 0.035791 | 0.033000–0.038542 | 0.002917 | 초과 | 구조 | 0/3 |
| commit | oneOf-5/first | 0.587001 / 0.507126 | 0.077957 | 0.076584–0.079875 | 0.005833 | 초과 | 구조 | 0/3 |
| commit | computed-visible-derived/first | 0.252187 / 0.203437 | 0.048750 | 0.043959–0.051291 | 0.004750 | 초과 | 구조 | 0/3 |
| commit | sample-0/first | 0.121375 / 0.092270 | 0.028666 | 0.027916–0.030458 | 0.002167 | 초과 | 구조 | 0/3 |
| commit | array-100/first | 0.136605 / 0.106458 | 0.032292 | 0.027583–0.034167 | 0.005292 | 초과 | 구조 | 0/3 |
| commit | oneOf-5/later | 0.475521 / 0.401771 | 0.073750 | 0.070083–0.078667 | 0.006500 | 초과 | 구조 | 0/3 |
| commit | computed-visible-derived/later | 0.233459 / 0.154438 | 0.078334 | 0.076625–0.081584 | 0.006167 | 초과 | 구조 | 0/3 |
| commit | nested-d5-f4/first | 0.246374 / 0.194146 | 0.055125 | 0.032541–0.064291 | 0.063207 | 불명확 | 구조 | 0/3 |
| commit | sample-0/later | 0.114771 / 0.086104 | 0.028667 | 0.028292–0.030626 | 0.001500 | 초과 | 구조 | 0/3 |
| deliveries | array-100/later | 0.130250 / 0.106958 | 0.022876 | 0.022209–0.023292 | 0.002917 | 초과 | 코드 | 0/3 |
| deliveries | nested-d5-f4/later | 0.142104 / 0.115687 | 0.026417 | 0.026084–0.027667 | 0.002917 | 초과 | 코드 | 0/3 |
| deliveries | oneOf-5/first | 0.588437 / 0.549146 | 0.043417 | 0.035458–0.044375 | 0.005833 | 초과 | 코드 | 0/3 |
| deliveries | computed-visible-derived/first | 0.250292 / 0.229917 | 0.023209 | 0.020375–0.023334 | 0.004750 | 초과 | 코드 | 0/3 |
| deliveries | sample-0/first | 0.121812 / 0.100541 | 0.021167 | 0.020833–0.023167 | 0.002167 | 초과 | 코드 | 0/3 |
| deliveries | array-100/first | 0.140416 / 0.118520 | 0.023083 | 0.021374–0.023084 | 0.005292 | 초과 | 코드 | 0/3 |
| deliveries | oneOf-5/later | 0.479146 / 0.441750 | 0.043000 | 0.031584–0.046125 | 0.006500 | 초과 | 코드 | 0/3 |
| deliveries | computed-visible-derived/later | 0.233438 / 0.209041 | 0.023667 | 0.022250–0.026376 | 0.006167 | 초과 | 코드 | 0/3 |
| deliveries | nested-d5-f4/first | 0.244000 / 0.195667 | 0.047792 | 0.033416–0.048333 | 0.063207 | 불명확 | 코드 | 0/3 |
| deliveries | sample-0/later | 0.113083 / 0.093875 | 0.019292 | 0.019208–0.020125 | 0.001500 | 초과 | 코드 | 0/3 |
| events | array-100/later | 0.132979 / 0.127730 | 0.005249 | 0.004083–0.007250 | 0.002917 | 초과 | 코드 | 0/3 |
| events | nested-d5-f4/later | 0.140333 / 0.132104 | 0.008417 | 0.006333–0.008708 | 0.002917 | 초과 | 코드 | 0/3 |
| events | computed-visible-derived/first | 0.249979 / 0.245978 | 0.004001 | 0.003666–0.006417 | 0.004750 | 불명확 | 코드 | 0/3 |
| events | sample-0/first | 0.123145 / 0.116563 | 0.006292 | 0.004708–0.007458 | 0.002167 | 초과 | 코드 | 0/3 |
| events | array-100/first | 0.142937 / 0.134916 | 0.008917 | 0.005249–0.009251 | 0.005292 | 불명확 | 코드 | 0/3 |
| events | nested-d5-f4/first | 0.236791 / 0.226374 | 0.014125 | 0.010417–0.017250 | 0.063207 | 불명확 | 코드 | 0/3 |
| events | sample-0/later | 0.118082 / 0.112937 | 0.005667 | 0.002750–0.006542 | 0.001500 | 초과 | 코드 | 0/3 |
| assemble | array-100/later | 0.132105 / 0.119062 | 0.011458 | 0.010292–0.013417 | 0.002917 | 초과 | 코드 | 3/3 |
| assemble | nested-d5-f4/later | 0.141958 / 0.126333 | 0.016334 | 0.014125–0.016667 | 0.002917 | 초과 | 코드 | 3/3 |
| assemble | sample-0/first | 0.119292 / 0.114291 | 0.005541 | 0.005000–0.005916 | 0.002167 | 초과 | 코드 | 3/3 |
| assemble | array-100/first | 0.144188 / 0.121833 | 0.020833 | 0.019083–0.022750 | 0.005292 | 초과 | 코드 | 3/3 |
| assemble | nested-d5-f4/first | 0.245813 / 0.170563 | 0.075250 | 0.070667–0.075833 | 0.063207 | 초과 | 코드 | 3/3 |
| assemble | sample-0/later | 0.114666 / 0.108854 | 0.005833 | 0.005041–0.006750 | 0.001500 | 초과 | 코드 | 3/3 |
| output | array-100/later | 0.131251 / 0.109563 | 0.021500 | 0.019333–0.022333 | 0.002917 | 초과 | 구조 | 3/3 |
| output | nested-d5-f4/later | 0.140125 / 0.117562 | 0.022083 | 0.021709–0.025251 | 0.002917 | 초과 | 구조 | 3/3 |
| output | computed-visible-derived/first | 0.251688 / 0.187249 | 0.063333 | 0.063001–0.064917 | 0.004750 | 초과 | 구조 | 3/3 |
| output | sample-0/first | 0.121041 / 0.107291 | 0.013666 | 0.012875–0.013750 | 0.002167 | 초과 | 구조 | 3/3 |
| output | array-100/first | 0.146395 / 0.115062 | 0.030709 | 0.029583–0.031333 | 0.005292 | 초과 | 구조 | 3/3 |
| output | computed-visible-derived/later | 0.234645 / 0.184563 | 0.049208 | 0.048292–0.050625 | 0.006167 | 초과 | 구조 | 3/3 |
| output | nested-d5-f4/first | 0.249105 / 0.161563 | 0.087542 | 0.087541–0.089708 | 0.063207 | 초과 | 구조 | 3/3 |
| output | sample-0/later | 0.114146 / 0.102583 | 0.011584 | 0.010709–0.011959 | 0.001500 | 초과 | 구조 | 3/3 |
| same-value | nested-d5-f4/later | 0.142126 / 0.116500 | 0.025626 | 0.024168–0.026209 | 0.002917 | 초과 | 코드 | 3/3 |
| dirty-begin | nested-d5-f4/later | 0.142896 / 0.143229 | -0.000667 | -0.002667–-0.000333 | 0.002917 | 불명확 | 코드 | 0/3 |
| dirty-add | nested-d5-f4/later | 0.142229 / 0.140563 | 0.001126 | 0.000916–0.001958 | 0.002917 | 불명확 | 코드 | 0/3 |
| dirty-delete | array-100/later | 0.128478 / 0.128103 | 0.000333 | -0.001458–0.000375 | 0.002917 | 불명확 | 코드 | 0/3 |
| dirty-delete | nested-d5-f4/later | 0.142333 / 0.142708 | 0.000042 | -0.000375–0.002500 | 0.002917 | 불명확 | 코드 | 0/3 |
| recalculation | array-100/later | 0.131646 / 0.095958 | 0.035584 | 0.034042–0.035709 | 0.002917 | 초과 | 코드 | 3/3 |
| recalculation | nested-d5-f4/later | 0.147250 / 0.102416 | 0.044083 | 0.042833–0.045376 | 0.002917 | 초과 | 코드 | 3/3 |
| recalculation | oneOf-40/later | 0.989375 / 0.109105 | 0.881000 | 0.870916–0.887249 | 0.016584 | 초과 | 코드 | 3/3 |
| recalculation | oneOf-5/first | 0.588562 / 0.109041 | 0.479542 | 0.471709–0.480250 | 0.005833 | 초과 | 코드 | 3/3 |
| recalculation | computed-visible-derived/first | 0.251020 / 0.153792 | 0.098583 | 0.096041–0.102167 | 0.004750 | 초과 | 코드 | 3/3 |
| recalculation | sample-0/first | 0.120292 / 0.098750 | 0.023084 | 0.018083–0.023208 | 0.002167 | 초과 | 코드 | 3/3 |
| recalculation | array-100/first | 0.145396 / 0.103999 | 0.044751 | 0.039625–0.047834 | 0.005292 | 초과 | 코드 | 3/3 |
| recalculation | oneOf-40/first | 1.488230 / 0.111812 | 1.376251 | 1.372000–1.394583 | 0.012208 | 초과 | 코드 | 3/3 |
| recalculation | computed-visible-derived/later | 0.228250 / 0.146792 | 0.081917 | 0.079958–0.082376 | 0.006167 | 초과 | 코드 | 3/3 |
| recalculation | nested-d5-f4/first | 0.237604 / 0.141354 | 0.100875 | 0.089083–0.102666 | 0.063207 | 초과 | 코드 | 3/3 |
| recalculation | oneOf-20/mount | 2.055625 / 1.097333 | 0.951167 | 0.939667–0.966250 | 0.025333 | 초과 | 코드 | 3/3 |
| recalculation | sample-0/later | 0.115625 / 0.094709 | 0.022166 | 0.020916–0.022417 | 0.001500 | 초과 | 코드 | 3/3 |
| dependency-index | computed-visible-derived/first | 0.256250 / 0.149479 | 0.104500 | 0.100125–0.108000 | 0.004750 | 초과 | 코드 | 3/3 |
| dependency-index | oneOf-20/mount | 2.084792 / 1.927458 | 0.156875 | 0.155250–0.176042 | 0.025333 | 초과 | 코드 | 0/3 |
| derive-rounds | computed-visible-derived/first | 0.252188 / 0.166646 | 0.085542 | 0.083958–0.087000 | 0.004750 | 초과 | 구조 | 3/3 |
| derive-rounds | computed-visible-derived/later | 0.232499 / 0.157834 | 0.076041 | 0.072333–0.077042 | 0.006167 | 초과 | 구조 | 3/3 |
| derive-evaluation | computed-visible-derived/first | 0.251479 / 0.181937 | 0.069542 | 0.066250–0.072208 | 0.004750 | 초과 | 구조 | 3/3 |
| derive-evaluation | computed-visible-derived/later | 0.232666 / 0.171000 | 0.061666 | 0.060250–0.063542 | 0.006167 | 초과 | 구조 | 3/3 |
| derive-sources | computed-visible-derived/later | 0.234125 / 0.166126 | 0.067999 | 0.067417–0.068334 | 0.006167 | 초과 | 코드 | 3/3 |
| derive-commit | computed-visible-derived/first | 0.249979 / 0.230562 | 0.019417 | 0.018000–0.019625 | 0.004750 | 초과 | 코드 | 0/3 |
| derive-commit | computed-visible-derived/later | 0.230479 / 0.181688 | 0.049916 | 0.045750–0.050416 | 0.006167 | 초과 | 코드 | 0/3 |
| rule-values | computed-visible-derived/first | 0.246021 / 0.239208 | 0.006958 | 0.006542–0.008041 | 0.004750 | 초과 | 코드 | 0/3 |
| rule-values | computed-visible-derived/later | 0.233375 / 0.192459 | 0.041376 | 0.040916–0.044625 | 0.006167 | 초과 | 코드 | 0/3 |
| scratch | sample-0/first | 0.119708 / 0.118875 | 0.000416 | -0.000001–0.001625 | 0.002167 | 불명확 | 구조 | 0/3 |
| navigation | array-100/later | 0.133083 / 0.127313 | 0.006208 | 0.002583–0.006583 | 0.002917 | 불명확 | 코드 | 0/3 |
| navigation | nested-d5-f4/later | 0.142625 / 0.137958 | 0.004750 | 0.004667–0.005208 | 0.002917 | 초과 | 코드 | 0/3 |
| navigation | sample-0/first | 0.121063 / 0.119521 | 0.001292 | 0.000625–0.003166 | 0.002167 | 불명확 | 코드 | 0/3 |
| navigation | array-100/first | 0.147063 / 0.138792 | 0.007417 | 0.006667–0.013791 | 0.005292 | 불명확 | 코드 | 0/3 |
| navigation | nested-d5-f4/first | 0.251750 / 0.226104 | 0.025166 | 0.021916–0.032500 | 0.063207 | 불명확 | 코드 | 0/3 |
| navigation | sample-0/later | 0.114875 / 0.113418 | 0.002416 | 0.000667–0.006624 | 0.001500 | 불명확 | 코드 | 0/3 |
| mark-write | nested-d5-f4/first | 0.252541 / 0.128501 | 0.125792 | 0.110791–0.127792 | 0.063207 | 초과 | 구조 | 3/3 |
| gate-condition | oneOf-40/later | 0.968166 / 0.989458 | -0.010292 | -0.021292–-0.008208 | 0.016584 | 불명확 | 코드 | 0/3 |
| gate-condition | oneOf-5/first | 0.587395 / 0.587605 | 0.000375 | -0.004541–0.007749 | 0.005833 | 불명확 | 코드 | 0/3 |
| gate-condition | oneOf-40/first | 1.485874 / 1.464958 | 0.011834 | -0.000917–0.021291 | 0.012208 | 불명확 | 코드 | 0/3 |
| gate-condition | oneOf-5/later | 0.463562 / 0.473813 | -0.010750 | -0.013750–-0.008458 | 0.006500 | 불명확 | 코드 | 0/3 |
| gate-condition | oneOf-20/mount | 2.085854 / 2.098604 | -0.012750 | -0.049834–0.011249 | 0.025333 | 불명확 | 코드 | 0/3 |
| control-layers | oneOf-40/later | 0.991708 / 0.980749 | 0.019250 | 0.003042–0.020417 | 0.016584 | 불명확 | 코드 | 0/3 |
| control-layers | oneOf-5/first | 0.583750 / 0.579584 | 0.006000 | 0.003167–0.017291 | 0.005833 | 불명확 | 코드 | 0/3 |
| control-layers | oneOf-40/first | 1.506187 / 1.500521 | 0.008999 | -0.004667–0.010792 | 0.012208 | 불명확 | 코드 | 0/3 |
| control-layers | oneOf-5/later | 0.475562 / 0.469146 | 0.006416 | 0.003999–0.012417 | 0.006500 | 불명확 | 코드 | 0/3 |
| control-layers | oneOf-20/mount | 2.096876 / 2.100834 | -0.003958 | -0.048958–0.023584 | 0.025333 | 불명확 | 코드 | 0/3 |
| path-index | oneOf-40/later | 0.975041 / 0.976999 | -0.000958 | -0.001958–0.004749 | 0.016584 | 불명확 | 코드 | 0/3 |
| path-index | oneOf-5/first | 0.590021 / 0.583584 | -0.000375 | -0.003250–0.008750 | 0.005833 | 불명확 | 코드 | 0/3 |
| path-index | oneOf-40/first | 1.483416 / 1.484187 | 0.000874 | -0.006624–0.004750 | 0.012208 | 불명확 | 코드 | 0/3 |
| path-index | oneOf-5/later | 0.483125 / 0.475917 | -0.002041 | -0.003917–0.009292 | 0.006500 | 불명확 | 코드 | 0/3 |
| path-index | oneOf-20/mount | 2.109916 / 2.102374 | -0.007708 | -0.016750–0.007542 | 0.025333 | 불명확 | 코드 | 0/3 |
| gate-evaluation-zero | oneOf-40/later | 0.972417 / 0.981666 | -0.009250 | -0.024833–0.001125 | 0.016584 | 불명확 | 코드 | 0/3 |
| gate-evaluation-zero | oneOf-5/first | 0.602646 / 0.602791 | -0.000041 | -0.000209–0.000251 | 0.005833 | 불명확 | 코드 | 0/3 |
| gate-evaluation-zero | oneOf-40/first | 1.474104 / 1.467854 | 0.007167 | 0.004708–0.008084 | 0.012208 | 불명확 | 코드 | 0/3 |
| gate-evaluation-zero | oneOf-5/later | 0.473833 / 0.485417 | -0.011625 | -0.012541–-0.011584 | 0.006500 | 불명확 | 코드 | 0/3 |
| gate-evaluation-zero | oneOf-20/mount | 2.123312 / 1.935437 | 0.187875 | 0.174667–0.239751 | 0.025333 | 초과 | 구조 | 0/3 |
| api-write | array-100/later | 0.135709 / 0.040708 | 0.095000 | 0.087209–0.095291 | 0.002917 | 초과 | 구조 | 3/3 |
| api-write | nested-d5-f4/later | 0.141937 / 0.041188 | 0.101042 | 0.098750–0.107750 | 0.002917 | 초과 | 구조 | 3/3 |
| api-write | oneOf-40/later | 0.987624 / 0.040999 | 0.946625 | 0.944958–1.009709 | 0.016584 | 초과 | 구조 | 3/3 |
| api-write | oneOf-5/first | 0.588395 / 0.044209 | 0.544000 | 0.543417–0.562500 | 0.005833 | 초과 | 구조 | 3/3 |
| api-write | computed-visible-derived/first | 0.251833 / 0.041042 | 0.210791 | 0.208084–0.216958 | 0.004750 | 초과 | 구조 | 3/3 |
| api-write | sample-0/first | 0.120438 / 0.040145 | 0.080708 | 0.079292–0.080750 | 0.002167 | 초과 | 구조 | 3/3 |
| api-write | array-100/first | 0.139229 / 0.040459 | 0.099250 | 0.094958–0.099375 | 0.005292 | 초과 | 구조 | 3/3 |
| api-write | oneOf-40/first | 1.483521 / 0.045729 | 1.437792 | 1.433959–1.558499 | 0.012208 | 초과 | 구조 | 3/3 |
| api-write | oneOf-5/later | 0.468584 / 0.039313 | 0.428209 | 0.427667–0.430792 | 0.006500 | 초과 | 구조 | 3/3 |
| api-write | computed-visible-derived/later | 0.227625 / 0.038125 | 0.189500 | 0.188167–0.191250 | 0.006167 | 초과 | 구조 | 3/3 |
| api-write | nested-d5-f4/first | 0.240332 / 0.060688 | 0.180082 | 0.176166–0.188042 | 0.063207 | 초과 | 구조 | 3/3 |
| api-write | oneOf-20/mount | 2.118626 / 2.135960 | -0.017334 | -0.031292–-0.007084 | 0.025333 | 불명확 | 구조 | 0/3 |
| api-write | sample-0/later | 0.116958 / 0.038146 | 0.079834 | 0.072917–0.079917 | 0.001500 | 초과 | 구조 | 3/3 |
| navigation-call | oneOf-5/later | 0.489604 / 0.464229 | 0.024125 | 0.015876–0.026334 | 0.006500 | 초과 | 코드 | 0/3 |
| navigation-call | oneOf-40/later | 0.985189 / 0.962564 | 0.022625 | 0.001209–0.046500 | 0.016584 | 불명확 | 코드 | 0/3 |
| navigation-call | oneOf-5/first | 0.586333 / 0.568396 | 0.014542 | 0.008417–0.024375 | 0.005833 | 불명확 | 코드 | 0/3 |
| navigation-call | oneOf-40/first | 1.487334 / 1.453166 | 0.034291 | 0.023959–0.040668 | 0.012208 | 초과 | 코드 | 0/3 |
| navigation-call | array-100/later | 0.131437 / 0.126021 | 0.004625 | 0.003375–0.005875 | 0.002917 | 초과 | 코드 | 0/3 |
| navigation-call | nested-d5-f4/later | 0.140001 / 0.136541 | 0.004626 | 0.001459–0.005083 | 0.002917 | 불명확 | 코드 | 0/3 |
| navigation-call | sample-0/first | 0.121208 / 0.116562 | 0.002833 | 0.002792–0.004667 | 0.002167 | 불명확 | 코드 | 0/3 |
| navigation-call | array-100/first | 0.138292 / 0.130792 | 0.008251 | 0.000959–0.011957 | 0.005292 | 불명확 | 코드 | 0/3 |
| navigation-call | nested-d5-f4/first | 0.243771 / 0.227312 | 0.016459 | 0.011125–0.023291 | 0.063207 | 불명확 | 코드 | 0/3 |
| navigation-call | sample-0/later | 0.114605 / 0.111937 | 0.002667 | 0.001750–0.003375 | 0.001500 | 불명확 | 코드 | 0/3 |
| template-path | oneOf-40/later | 0.984605 / 0.984895 | -0.000291 | -0.024458–0.012375 | 0.016584 | 불명확 | 코드 | 0/3 |
| template-path | oneOf-5/first | 0.589979 / 0.586959 | 0.002375 | 0.000749–0.003041 | 0.005833 | 불명확 | 코드 | 0/3 |
| template-path | oneOf-40/first | 1.496042 / 1.495708 | -0.000292 | -0.009125–0.015709 | 0.012208 | 불명확 | 코드 | 0/3 |
| template-path | oneOf-5/later | 0.490834 / 0.487438 | 0.000000 | -0.005875–0.003709 | 0.006500 | 불명확 | 코드 | 0/3 |
| template-path | oneOf-20/mount | 2.090271 / 2.128521 | -0.040208 | -0.042668–-0.038250 | 0.025333 | 불명확 | 코드 | 0/3 |
| factory-reuse | nested-d5-f4/mount | 11.830083 / 16.709625 | -4.879541 | -5.066208–-4.740458 | 0.492333 | 불명확 | 구조 | 0/3 |
| factory-reuse | flat-500/mount | 4.492979 / 5.636125 | -1.162625 | -1.187458–-1.135375 | 0.056583 | 불명확 | 구조 | 0/3 |
| factory-reuse | oneOf-20/mount | 2.091771 / 1.969125 | 0.123291 | 0.111833–0.125958 | 0.025333 | 초과 | 구조 | 0/3 |

gate-condition은 비교식을 정적 리터럴 비교로 바꾼 변형이고 gate-evaluation-zero는 타이머 밖에서 계산한 Boolean을 조회하는 변형입니다. first/later는 관찰된 최종 출력이 같고 잡음 초과 이득이 없습니다. latter의 mount 이득은 기본 kind의 최종 결과를 초기 바퀴부터 고정해 경로가 달라진 상한이므로 구조로 분류했습니다. gates의 전체 제거와 gate-expression의 잘못된 상수 표현식도 순수 비교식 비용으로 해석하지 않습니다.

## 코드 수준 수정 사양

아래는 큰 상한을 원장 안에서 실제 동작을 유지하며 다룰 수정 사양입니다. 상수/skip 빌드 자체를 구현하지 않습니다. 최종 입력/출력, 중간 공표 순서, late subscription, 배열·wrong-kind·throw·Source B 및 재진입 차등 검증 뒤 95C-01 종단 재측정이 통과해야 합니다. 제거 상한이 큰 항목도 같은 크기의 구현 이득을 약속하지 않습니다.

| job | 잡음 초과 연산 수 | 최대 대표 상한 ms / 연산 | 사양 | 원장 |
| --- | ---: | --- | --- | --- |
| children | 5 | 1.088083 / oneOf-40/first | 정적 게이트/엔트리 색인으로 관련 선언만 방문하고 원래 평가 위치·순서·즉시 공표를 유지합니다. 97C-01의 후보·퇴장·배열·wrong-kind·던진 게이트 차등 조건을 모두 유지해야 합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| path-resolve | 5 | 0.147417 / oneOf-40/first | 바인딩된 발생의 호스트 경로와 정적 의존성으로 절대 포인터를 한 번 계산하고 재사용합니다. 배열 이동·동일 이름/다른 종류·@·#/·~ escape와 늦은 등록에 대한 무효화를 지켜야 합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| projected-read | 5 | 0.162583 / oneOf-20/mount | 정적 포인터의 디코딩된 세그먼트를 재사용하고 경로의 직접 노드 접근을 계획합니다. 대기 출력·wrong-kind·extras·공표 위치와 97C-01의 동일성 묶음을 보존합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| read-flush | 3 | 0.136999 / oneOf-40/first | 같은 발생/읽기 경로의 공표 준비를 정착 내 색인으로 합칩니다. 실제로 읽거나 공표할 노드의 대기가 해소됐다는 조건을 유지하며 공표 순서를 바꾸지 않습니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| gate-registry | 4 | 0.048626 / oneOf-40/first | 이미 등록된 발생은 참조와 종류의 동일성이 확인되면 경로·감시 등록을 반복하지 않습니다. 퇴장·되살아남·새 배열 발생·읽기 dirty의 양방향 교차를 유지합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| gate-expression | 4 | 0.620166 / oneOf-40/first | 게이트 발생의 정적 표현식 참조를 청사진/바인딩에 연결해 반복된 authored-path Map 조회를 줄입니다. 이 상수 빌드의 결과는 잘못되므로 이득은 천장입니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| inactive-memo | 1 | 0.023708 / oneOf-5/later | 실제로 변경된 잠복 소유자만 메모를 갱신하는 증분 색인을 사용합니다. 이전 커밋 읽기와 종류별 잠복 키를 유지합니다. | WRITE-087, WRITE-094, VALUE-031 |
| latent-prune | 0 | 잡음 초과 없음 | 쓰기 경로의 교차 잠복 키만 기존 경로 색인으로 찾아 제거합니다. JSON 키 파싱과 전체 스캔을 중복하지 않으며 전이 자동 로그의 복구를 유지합니다. | WRITE-087, WRITE-094, VALUE-031 |
| schema-select | 7 | 0.129834 / oneOf-40/first | 같은 발생의 활성 선언 ID와 유효 스키마 참조를 재사용합니다. 부모 overlay·게이트 오류·wrong-kind가 바뀌면 재선택하고 경고/공표 순서를 유지합니다. | BLUEPRINT-021, NODE-006, SETTLE-017 |
| schema-merge | 3 | 3.166792 / nested-d5-f4/mount | 단일 무조건 선언의 유효 스키마를 청사진에서 한 번 정규화하고 런타임 조립에서 재병합하지 않습니다. 타입 교집합·nullable·pattern·원자 값·경고 수집·선언 순서가 있는 경우 기존 병합으로 돌아갑니다. | BLUEPRINT-021, NODE-006, SETTLE-017 |
| static-commit | 2 | 1.830292 / nested-d5-f4/mount | 무조건 첫 로드의 동일 초기 마스크에 대해 불변 리비전 스냅샷을 공유하고, 이벤트 payload는 소비자가 필요한 시점에 만듭니다. Initialized/UpdateValue/RequestRefresh와 늦은 구독 리비전을 보존합니다. | EVENT-005, EVENT-007, EVENT-024, SETTLE-006 |
| revision | 2 | 1.049291 / nested-d5-f4/mount | 이전 장부가 공유 빈 장부이고 마스크가 정적 초기 마스크이면 미리 만든 불변 초기 장부를 재사용합니다. 이후 수정은 독립 복사하며 각 비트의 단조 리비전·직접 비트 접근을 보존합니다. | EVENT-005, EVENT-007, EVENT-024, SETTLE-006 |
| deliveries | 9 | 0.043417 / oneOf-5/first | 한 커밋의 변경 노드/조상과 마스크를 한 번 모아 장부와 배달 후보를 갱신합니다. 구독자가 없어도 리비전은 유지하고 배달 방문 순서와 root onChange를 보존합니다. | EVENT-005, EVENT-007, EVENT-024, SETTLE-006 |
| events | 4 | 0.008417 / nested-d5-f4/later | 소비자 없는 경로의 이벤트 payload/옵션 복사를 지연하되 비트·pendingRevision·노드별 최신 리비전은 같은 커밋에서 기록합니다. 늦은 구독 catch-up과 root onChange 결과를 보존합니다. | EVENT-005, EVENT-007, EVENT-024, SETTLE-006 |
| assemble | 6 | 0.075250 / nested-d5-f4/first | 첫 마운트 조립 때 STABLE_SHAPES와 키 수 증명을 같이 저장하여 첫 갱신도 동일 children/schema/extras에서 증분 조립을 사용합니다. 없는 키·undefined·가상/공유 노드·참조 동일성의 fallback을 유지합니다. | SETTLE-043, VALUE-028, VALUE-013 |
| same-value | 1 | 0.025626 / nested-d5-f4/later | 증분 조립에서 실제로 바뀐 필드가 없는 경우 이미 확보된 참조/키 증명으로 전체 비교를 줄입니다. 값이 바뀐 경우 또는 구조 증명이 무효인 경우 원래 비교를 유지합니다. | SETTLE-043, VALUE-028, VALUE-013 |
| dirty-begin | 0 | 잡음 초과 없음 | 분기 없는 경로의 prefix 색인을 add와 beginPostOrder 양쪽에서 중복 구축하지 않습니다. 첫 자손 삽입 순서와 조상 복구·무해한 미해결 경로를 유지합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| dirty-add | 0 | 잡음 초과 없음 | 분기 없는 정착에서 post-order rebuild가 즉시 예정된 경우 pre-order prefix 구축을 생략합니다. 게이트 있는 정착과 후속 자동 쓰기는 기존 증분 경로를 유지합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| dirty-delete | 0 | 잡음 초과 없음 | 현재 post-order의 직접 부모 인덱스 삭제만 수행하고 빈 프리픽스 처리를 중복하지 않습니다. 같은 prefix의 다른 dirty 자손이 유지되는지 차등 검증합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| recalculation | 12 | 1.376251 / oneOf-40/first | 정적 역방향 의존성과 게이트 읽기 경로를 기존 색인에 바인딩하고 쓰기별 조상 집합을 한 번 공유합니다. 루트/조상/자손 교차·새 발생·배열 이동·원래 dirty 집합을 유지합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| dependency-index | 2 | 0.156875 / oneOf-20/mount | 청사진에 이미 있는 선언 ID→소유자 대응을 의존성 색인 구축에서 다시 전수 수집하지 않습니다. 정적 읽기와 런타임 배열/동적 호스트의 바인딩을 구분하고 변화한 소유자만 돌려줍니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| derive-sources | 1 | 0.067999 / computed-visible-derived/later | 역방향 의존성 소유자에 디코딩된 경로 또는 세대가 검증된 살아 있는 발생 참조를 연결합니다. 반복 경로 split/unescape/Set 구축을 줄이며 이동·퇴장·같은 이름/다른 종류에서 무효화합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| derive-commit | 2 | 0.049916 / computed-visible-derived/later | 실제로 값이 바뀐 규칙의 committed baseline과 소스/타겟 인덱스만 갱신합니다. undefined와 삭제, 이전 커밋 기준값의 관측을 유지합니다. | EVENT-005, EVENT-007, EVENT-024, SETTLE-006 |
| rule-values | 2 | 0.041376 / computed-visible-derived/later | 직렬화된 규칙 키를 매 커밋 JSON.parse하지 않고 생성 시 source/target 토큰을 보관합니다. 외부 키 형식·동일성·삭제 및 양쪽 경로 인덱스의 원자 갱신을 유지합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| navigation | 1 | 0.004750 / nested-d5-f4/later | 포인터의 토큰화 결과를 재사용하되 현재 구조에서 노드는 다시 찾습니다. 배열 이동·가상 키·부모 탐색·wildcard·~ escape와 세대 무효화를 유지합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| gate-condition | 0 | 잡음 초과 없음 | 전체 gate 제거와 구분해 의존성 읽기와 등록은 그대로 두고 컴파일된 비교식만 정적 리터럴 비교로 대체합니다. 이 항목은 종단 상한이 잡음보다 큰 경우에만 97C-01 후보가 됩니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| control-layers | 0 | 잡음 초과 없음 | 활성 선언 ID로 이미 정해진 controls layer를 발생별 참조로 재사용하며 overlay와 kind 및 children 제어가 변하면 무효화합니다. | BLUEPRINT-021, NODE-006, SETTLE-017 |
| path-index | 0 | 잡음 초과 없음 | 조상·자손 prefix 교차 결과를 정착 안에서 재사용합니다. 삭제와 재등록의 세대 및 Source B/잠복 키 별도 인덱스를 유지합니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| gate-evaluation-zero | 0 | 잡음 초과 없음 | 의존성 읽기·게이트 등록은 유지하고 비교식의 결과를 타이머 밖에서 미리 계산한 Boolean 조회로 대체합니다. 첫/후속 갱신의 최종 출력 동치를 확인합니다. 조회 자체의 비용을 포함한 순 상한이며, 마운트는 초기 바퀴도 변할 수 있습니다. 유의한 상한 없이는 비교식 미세 최적화를 구현하지 않습니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| navigation-call | 3 | 0.034291 / oneOf-40/first | 공개 find와 query find를 미리 찾은 노드로 대체한 전체 탐색 천장입니다. 제품 수정은 포인터 토큰만 재사용하고 현재 구조에서 탐색하며 배열 이동·가상 키·부모·wildcard·escape·세대 무효화를 보존합니다. 기존 findNodes 제거와 겹칩니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |
| template-path | 0 | 잡음 초과 없음 | 고정 fixture에서 바인딩 경로를 호출 순서별 상수로 재사용한 순 상한입니다. 제품 수정은 정적 template 토큰과 현재 occurrence 세대를 키로 삼아 올바른 경로를 캐시하며 배열 이동과 삭제/재등장을 보존합니다. 호출 순서 자체를 제품 캐시 키로 쓰지 않습니다. | GOAL-011, BLUEPRINT-022, SETTLE-017, SETTLE-044, SETTLE-050 |

schema-merge는 기존 단일 무조건 경로에서 매 cold 분석의 재병합을 없애는 사양이고, blueprint는 이미 완성된 전체 분석을 공유하는 별도 구조 상한입니다. static-commit은 올바른 revision 및 통지를 유지한 초기 경로 최적화이고 revision은 그 중 복사/할당만의 상한입니다. children/recalculation/gate-expression의 큰 값에는 dirty 제거 또는 잘못된 gate 결과로 사라지는 하위 작업도 포함됩니다. 작은 Map 조회 하나를 바꾸면 이 값 전체가 회복된다고 해석할 수 없습니다.

## 구조적 원장 항목

아래 ID는 이 보고서의 제안 꼬리표이며 실제 ledger 파일은 수정하지 않았습니다.

| 제안 ID | 해당 제거 job | 검토할 계약 | 기존 원장 |
| --- | --- | --- | --- |
| PROFILE-99C01-S01 | blueprint | 콜드 청사진의 불변 분석과 폼별 가변 캐시를 분리할 공유 계약을 원장에 명시합니다. 스키마 객체의 내용·옵션·표현식 컨텍스트·변경 가능성·캐시 수명과 무효화 및 서로 다른 폼의 독립성을 정의해야 합니다. 완성 청사진 상수 공유를 제품에 그대로 적용하지 않습니다. | BLUEPRINT-001, BLUEPRINT-021, BLUEPRINT-022, GOAL-070 |
| PROFILE-99C01-S02 | root-build, factory-reuse, static-load, mount-load | 모든 초기 살아 있는 노드의 즉시 생성, 인스턴스 identity, 동기 find/명령, 초기 생명주기와 비용을 함께 다루는 구조 항목입니다. 노드 트리 상수 재사용·초기 로드 생략은 이 계약을 포기한 천장입니다. 공유 청사진만의 상한과 노드/런타임 재사용 상한을 혼동하지 않습니다. | GOAL-071, NODE-039, BLUEPRINT-010, GOAL-069 |
| PROFILE-99C01-S03 | compute, finish, transition, gates, prime-host, commit, output, mark-write, derive-rounds, derive-evaluation, derive-commit, gate-evaluation-zero/mount | 고정 출발점·청사진 전순서·게이트 즉시 공표·파생 및 전이 쓰기·최소 고정점·예산과 Source B를 보존하는 구조 개선만 별도 원장 항목으로 검토합니다. 직전 활성 집합이나 fixture 상수 결과로 계산을 생략하는 변경은 허용하지 않습니다. | SETTLE-003, SETTLE-017, SETTLE-044, SETTLE-050, WRITE-090 |
| PROFILE-99C01-S04 | exits | 나감·잠복 하위 트리·비움 정책을 제거한 천장입니다. 정책·원본 보존·공유 종류·잠복 identity를 바꿀 경우 원장 결정이 필요합니다. 정책을 보존하는 메모 증분 갱신은 inactive-memo의 코드 수준 항목으로 분리합니다. | WRITE-032, WRITE-033, WRITE-034, WRITE-037, VALUE-031 |
| PROFILE-99C01-S05 | scratch | 정착 scratch와 런타임 소유권의 수명, 같은 폼 재진입, batch 및 서로 다른 폼의 동시성을 명시할 구조 항목입니다. 전역 상수 scratch 재사용은 독립성을 잃는 천장입니다. | SETTLE-001, SETTLE-038, EVENT-008, EVENT-013 |
| PROFILE-99C01-S06 | total-write, api-write, total-mount | 전체 연산을 무동작 또는 상수 트리로 만든 계측 천장입니다. 구현 후보가 아니며 전체 남은 비용과 잡음의 크기를 검산하는 데만 사용합니다. | GOAL-011, GOAL-071, EVENT-002 |

## 큰 share / 증가 함수의 제거 대조 coverage

자손의 inclusive share는 중첩된 job의 상한에 묶습니다. 아래 연결은 실제 CPU call tree에서 그 함수를 덮는 직접 또는 부모 job이며, “coverage”는 해당 함수 inclusive 시간 중 그 job 프레임이 조상에 있는 비율입니다. 여러 호출 문맥에 걸친 함수는 job들의 표본 합집합을 쓰며 제거 상한의 합은 쓰지 않습니다. 전체-write 천장만 있는 행은 그 사실을 그대로 적습니다. JSON에는 모든 연결과 비율을 보존했습니다.

| 연산 | 함수 / 원본 | self/total % | 근거 | 직접 또는 부모 job | coverage % |
| --- | --- | ---: | --- | --- | ---: |
| array-100/first | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 24.44/24.96 | inclusive>=5% | assemble (직접) | 100.00 |
| array-100/first | markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 8.34/8.34 | inclusive>=5% | events (직접) | 100.00 |
| array-100/first | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 7.26/23.96 | inclusive>=5% | deliveries (직접) | 100.00 |
| array-100/first | findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.30/7.37 | inclusive>=5% | navigation (직접) | 100.00 |
| array-100/first | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.80/38.92 | inclusive>=5% | compute (직접) | 100.00 |
| array-100/first | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.48/28.87 | inclusive>=5% | commit (직접) | 100.00 |
| array-100/first | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 2.19/30.86 | inclusive>=5% | output (직접) | 100.00 |
| array-100/first | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 2.00/88.47 | inclusive>=5% | api-write (부모) | 100.00 |
| array-100/first | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.25/5.02 | inclusive>=5% | recalculation (직접) | 100.00 |
| array-100/first | find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.90/8.27 | inclusive>=5% | navigation-call (직접) | 100.00 |
| array-100/first | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.70/29.89 | inclusive>=5% | finish (직접) | 100.00 |
| array-100/first | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.32/91.41 | inclusive>=5% | total-write (직접) | 100.00 |
| array-100/first | mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.05/8.36 | inclusive>=5% | deliveries (직접) | 100.00 |
| array-100/first | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01/91.68 | inclusive>=5% | api-write (직접) | 100.00 |
| array-100/first | find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00/8.27 | inclusive>=5% | navigation-call (직접) | 100.00 |
| computed-visible-derived/first | markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 6.48/6.48 | inclusive>=5% | events (직접) | 100.00 |
| computed-visible-derived/first | updateCommittedRuleValue · PKG/src/core/settle/utils/commit/updateCommittedRuleValue.ts:14 | 4.60/8.97 | inclusive>=5% | rule-values (직접) | 100.00 |
| computed-visible-derived/first | selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 4.32/7.46 | inclusive>=5% | schema-select (직접) | 100.00 |
| computed-visible-derived/first | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 3.89/15.30 | inclusive>=5% | deliveries (직접) | 100.00 |
| computed-visible-derived/first | affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 3.33/5.01 | inclusive>=5% | dependency-index (직접) | 100.00 |
| computed-visible-derived/first | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.93/22.81 | inclusive>=5% | compute (직접) | 100.00 |
| computed-visible-derived/first | evaluateDeriveRound · PKG/src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:31 | 2.28/12.61 | inclusive>=5% | derive-evaluation (직접) | 100.00 |
| computed-visible-derived/first | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.23/34.12 | inclusive>=5% | commit (직접) | 100.00 |
| computed-visible-derived/first | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.71/7.32 | inclusive>=5% | recalculation (직접) | 100.00 |
| computed-visible-derived/first | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 1.22/5.41 | inclusive>=5% | output (직접) | 100.00 |
| computed-visible-derived/first | getOrCollect · PKG/src/core/blueprint/utils/features/DeriveConvergenceTargets.ts:33 | 0.97/5.48 | inclusive>=5% | total-write (부모) | 100.00 |
| computed-visible-derived/first | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.91/93.91 | inclusive>=5% | api-write (부모) | 100.00 |
| computed-visible-derived/first | runDeriveRounds · PKG/src/core/settle/utils/derivation/runDeriveRounds.ts:29 | 0.70/33.58 | inclusive>=5% | derive-rounds (직접) | 100.00 |
| computed-visible-derived/first | commitDeriveRules · PKG/src/core/settle/utils/commit/commitDeriveRules.ts:19 | 0.66/13.90 | inclusive>=5% | derive-commit (직접) | 100.00 |
| computed-visible-derived/first | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.58/69.32 | inclusive>=5% | finish (직접) | 100.00 |
| computed-visible-derived/first | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.18/96.31 | inclusive>=5% | total-write (직접) | 100.00 |
| computed-visible-derived/first | mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.10/6.54 | inclusive>=5% | deliveries (직접) | 100.00 |
| computed-visible-derived/first | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.07/96.43 | inclusive>=5% | api-write (직접) | 100.00 |
| nested-d5-f4/first | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 26.36/26.94 | inclusive>=5% | assemble (직접) | 100.00 |
| nested-d5-f4/first | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 7.06/18.61 | inclusive>=5% | deliveries (직접) | 100.00 |
| nested-d5-f4/first | markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 5.48/5.48 | inclusive>=5% | events (직접) | 100.00 |
| nested-d5-f4/first | findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.53/8.52 | inclusive>=5% | navigation (직접) | 100.00 |
| nested-d5-f4/first | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 3.45/33.39 | inclusive>=5% | output (직접) | 100.00 |
| nested-d5-f4/first | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 3.17/24.01 | inclusive>=5% | commit (직접) | 100.00 |
| nested-d5-f4/first | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.70/40.31 | inclusive>=5% | compute (직접) | 100.00 |
| nested-d5-f4/first | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 2.23/87.07 | inclusive>=5% | api-write (부모) | 100.00 |
| nested-d5-f4/first | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.53/5.07 | inclusive>=5% | recalculation (직접) | 100.00 |
| nested-d5-f4/first | markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 1.27/5.21 | inclusive>=5% | mark-write (직접) | 100.00 |
| nested-d5-f4/first | find · PKG/src/core/navigation/utils/query/find.ts:5 | 1.21/9.73 | inclusive>=5% | navigation-call (직접) | 100.00 |
| nested-d5-f4/first | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.70/24.98 | inclusive>=5% | finish (직접) | 100.00 |
| nested-d5-f4/first | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.34/89.78 | inclusive>=5% | total-write (직접) | 100.00 |
| nested-d5-f4/first | mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.09/5.48 | inclusive>=5% | deliveries (직접) | 100.00 |
| nested-d5-f4/first | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.02/90.12 | inclusive>=5% | api-write (직접) | 100.00 |
| nested-d5-f4/first | find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00/9.72 | inclusive>=5% | navigation-call (직접) | 100.00 |
| oneOf-40/first | selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 14.57/57.68 | inclusive>=5% | children (직접) | 100.00 |
| oneOf-40/first | resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 14.37/14.37 | inclusive>=5% | path-resolve (직접) | 100.00 |
| oneOf-40/first | readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 9.88/13.54 | inclusive>=5% | projected-read (직접) | 100.00 |
| oneOf-40/first | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 5.20/83.24 | inclusive>=5% | compute (직접) | 100.00 |
| oneOf-40/first | hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 4.35/4.35 | branch-growth | total-write+api-write+compute+children+gates+projected-read+finish+transition+read-flush+schema-select+navigation-call+prime-host (부모) | 100.00 |
| oneOf-40/first | evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 4.07/35.90 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-40/first | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 3.34/7.87 | inclusive>=5% | recalculation (직접) | 100.00 |
| oneOf-40/first | getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 2.56/2.56 | branch-growth | gate-expression (직접) | 100.00 |
| oneOf-40/first | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.34/2.45 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 2.31/26.39 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-40/first | locate · PKG/src/core/settle/utils/gates/getGateRegistry.ts:83 | 2.10/2.64 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/first | flushRead · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:74 | 2.08/2.91 | branch-growth | read-flush (직접) | 100.00 |
| oneOf-40/first | escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 1.86/1.86 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 1.66/1.77 | branch-growth | prime-host (직접) | 100.00 |
| oneOf-40/first | ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 1.63/1.63 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | collect · PKG/src/core/settle/utils/write/getDependencyIndex.ts:83 | 1.53/1.90 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.39/1.39 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 1.20/1.33 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 1.19/10.00 | inclusive>=5% | read-flush (직접) | 100.00 |
| oneOf-40/first | projectedEmission · PKG/src/core/settle/utils/gates/readProjectedValue.ts:13 | 1.18/1.18 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 1.07/8.80 | inclusive>=5% | read-flush (직접) | 100.00 |
| oneOf-40/first | selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.97/13.78 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-40/first | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.94/11.54 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-40/first | dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 0.79/2.49 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | getControlLayers · PKG/src/core/settle/utils/controls/getControlLayers.ts:56 | 0.71/0.80 | branch-growth | control-layers (직접) | 100.00 |
| oneOf-40/first | register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 0.71/0.87 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/first | unescapePath · packages/winglet/json/dist/JSONPointer/utils/escape/unescapePath.cjs:6 | 0.69/0.69 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | getGateRegistry · PKG/src/core/settle/utils/gates/getGateRegistry.ts:222 | 0.61/0.61 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | transitionSettlement · PKG/src/core/settle/utils/transition/transitionSettlement.ts:28 | 0.53/43.77 | inclusive>=5% | transition (직접) | 100.00 |
| oneOf-40/first | mayChangeAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:113 | 0.49/0.51 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/first | mayChangeOwnDeclarationAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:121 | 0.45/0.52 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/first | bindTemplatePath · PKG/src/core/settle/utils/paths/bindTemplatePath.ts:7 | 0.43/0.43 | branch-growth | template-path (직접) | 100.00 |
| oneOf-40/first | flushPendingOutput · PKG/src/core/settle/utils/compute/flushPendingOutput.ts:12 | 0.42/1.07 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | updateInactiveValuesMemo · PKG/src/core/settle/utils/commit/updateInactiveValuesMemo.ts:23 | 0.41/0.86 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | bindGateHostPath · PKG/src/core/settle/utils/gates/bindGateHostPath.ts:12 | 0.32/0.37 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 0.32/1.29 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.30/3.77 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | setLatentRaw · PKG/src/core/settle/utils/latent/setLatentRaw.ts:21 | 0.29/0.85 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.27/10.50 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-40/first | affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 0.27/2.20 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.27/3.37 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | walkOwnedSchemaNodes · PKG/src/core/settle/utils/walkOwnedSchemaNodes.ts:9 | 0.21/1.04 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 0.20/2.81 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.20/99.62 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-40/first | relocated · PKG/src/core/settle/utils/gates/getGateRegistry.ts:107 | 0.19/0.25 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | readUnsetPolicy · PKG/src/core/settle/utils/transition/readUnsetPolicy.ts:11 | 0.18/0.57 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | (anonymous) · PKG/src/core/settle/utils/commit/snapshotExitedPolicies.ts:19 | 0.17/0.36 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.15/3.37 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | markWrite · PKG/src/core/settle/utils/write/markWrite.ts:23 | 0.15/0.30 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.14/50.70 | inclusive>=5% | finish (직접) | 100.00 |
| oneOf-40/first | readDepartingAncestorPolicy · PKG/src/core/settle/utils/transition/readDepartingAncestorPolicy.ts:13 | 0.11/0.24 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | readDefault · PKG/src/core/settle/utils/transition/readDefault.ts:14 | 0.10/0.24 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | captureExitedRaw · PKG/src/core/settle/utils/transition/captureExitedRaw.ts:19 | 0.08/1.21 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | (anonymous) · PKG/src/core/settle/utils/transition/finalizeExits.ts:30 | 0.08/0.37 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.06/2.32 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | createSchemaNode · PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 0.04/1.78 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | writeLatentRaw · PKG/src/core/settle/utils/transition/writeLatentRaw.ts:16 | 0.03/0.90 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | snapshotExitedPolicies · PKG/src/core/settle/utils/commit/snapshotExitedPolicies.ts:14 | 0.02/0.48 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | relocatedGates · PKG/src/core/settle/utils/compute/relocatedGates.ts:10 | 0.01/0.28 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | createChildNode · PKG/src/core/settle/utils/compute/createChildNode.ts:10 | 0.00/1.78 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/first | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.00/99.81 | inclusive>=5% | total-write (직접) | 100.00 |
| oneOf-40/first | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.00/99.81 | inclusive>=5% | api-write (직접) | 100.00 |
| oneOf-5/first | selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 10.13/41.23 | inclusive>=5% | children (직접) | 100.00 |
| oneOf-5/first | resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 7.24/7.24 | inclusive>=5% | path-resolve (직접) | 100.00 |
| oneOf-5/first | readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 5.70/8.21 | inclusive>=5% | projected-read (직접) | 100.00 |
| oneOf-5/first | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 5.37/65.36 | inclusive>=5% | compute (직접) | 100.00 |
| oneOf-5/first | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.51/6.25 | inclusive>=5% | recalculation (직접) | 100.00 |
| oneOf-5/first | evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 2.38/21.16 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-5/first | transitionSettlement · PKG/src/core/settle/utils/transition/transitionSettlement.ts:28 | 1.96/31.05 | inclusive>=5% | transition (직접) | 100.00 |
| oneOf-5/first | (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 1.31/15.78 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-5/first | selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 1.19/11.24 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-5/first | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 1.15/5.37 | inclusive>=5% | deliveries (직접) | 100.00 |
| oneOf-5/first | mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 1.07/10.16 | inclusive>=5% | schema-merge (직접) | 100.00 |
| oneOf-5/first | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.68/7.62 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-5/first | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.51/12.76 | inclusive>=5% | commit (직접) | 100.00 |
| oneOf-5/first | finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.50/9.98 | inclusive>=5% | exits (직접) | 100.00 |
| oneOf-5/first | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.30/54.19 | inclusive>=5% | finish (직접) | 100.00 |
| oneOf-5/first | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.29/98.99 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/first | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.18/6.89 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-5/first | applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.14/7.03 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/first | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.03/99.43 | inclusive>=5% | total-write (직접) | 100.00 |
| oneOf-5/first | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01/99.48 | inclusive>=5% | api-write (직접) | 100.00 |
| sample-0/first | markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 12.25/12.25 | inclusive>=5% | events (직접) | 100.00 |
| sample-0/first | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 8.39/29.13 | inclusive>=5% | deliveries (직접) | 100.00 |
| sample-0/first | getSettlementScratch · PKG/src/core/settle/utils/write/getSettlementScratch.ts:9 | 5.64/5.79 | inclusive>=5% | scratch (직접) | 100.00 |
| sample-0/first | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 4.97/5.39 | inclusive>=5% | assemble (직접) | 100.00 |
| sample-0/first | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 3.74/39.32 | inclusive>=5% | commit (직접) | 100.00 |
| sample-0/first | findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.61/10.96 | inclusive>=5% | navigation (직접) | 100.00 |
| sample-0/first | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.33/18.23 | inclusive>=5% | compute (직접) | 100.00 |
| sample-0/first | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 2.08/10.13 | inclusive>=5% | output (직접) | 100.00 |
| sample-0/first | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.07/5.26 | inclusive>=5% | recalculation (직접) | 100.00 |
| sample-0/first | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 2.04/81.99 | inclusive>=5% | api-write (부모) | 100.00 |
| sample-0/first | find · PKG/src/core/navigation/utils/query/find.ts:5 | 1.30/12.27 | inclusive>=5% | navigation-call (직접) | 100.00 |
| sample-0/first | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.97/40.57 | inclusive>=5% | finish (직접) | 100.00 |
| sample-0/first | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.81/87.26 | inclusive>=5% | total-write (직접) | 100.00 |
| sample-0/first | mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.04/12.28 | inclusive>=5% | deliveries (직접) | 100.00 |
| sample-0/first | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.02/87.68 | inclusive>=5% | api-write (직접) | 100.00 |
| sample-0/first | find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00/12.27 | inclusive>=5% | navigation-call (직접) | 100.00 |
| array-100/later | markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 13.34/13.34 | inclusive>=5% | events (직접) | 100.00 |
| array-100/later | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 6.92/26.81 | inclusive>=5% | deliveries (직접) | 100.00 |
| array-100/later | delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 5.09/5.09 | inclusive>=5% | dirty-delete (직접) | 100.00 |
| array-100/later | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 4.95/5.27 | inclusive>=5% | assemble (직접) | 100.00 |
| array-100/later | findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.70/7.31 | inclusive>=5% | navigation (직접) | 100.00 |
| array-100/later | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.88/22.62 | inclusive>=5% | compute (직접) | 100.00 |
| array-100/later | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.54/33.78 | inclusive>=5% | commit (직접) | 100.00 |
| array-100/later | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 2.47/11.76 | inclusive>=5% | output (직접) | 100.00 |
| array-100/later | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.89/8.01 | inclusive>=5% | recalculation (직접) | 100.00 |
| array-100/later | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 1.42/74.81 | inclusive>=5% | total-write (부모) | 99.99 |
| array-100/later | find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.62/7.92 | inclusive>=5% | navigation-call (직접) | 100.00 |
| array-100/later | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.54/34.41 | inclusive>=5% | finish (직접) | 100.00 |
| array-100/later | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.33/78.01 | inclusive>=5% | total-write (직접) | 100.00 |
| array-100/later | mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.04/13.37 | inclusive>=5% | deliveries (직접) | 100.00 |
| array-100/later | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.02/78.04 | inclusive>=5% | api-write (직접) | 100.00 |
| array-100/later | find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00/7.92 | inclusive>=5% | navigation-call (직접) | 100.00 |
| computed-visible-derived/later | getDeriveSourceNodes · PKG/src/core/settle/derive/utils/evaluate/utils/getDeriveSourceNodes.ts:13 | 4.95/5.98 | inclusive>=5% | derive-sources (직접) | 100.00 |
| computed-visible-derived/later | updateCommittedRuleValue · PKG/src/core/settle/utils/commit/updateCommittedRuleValue.ts:14 | 4.70/9.35 | inclusive>=5% | rule-values (직접) | 100.00 |
| computed-visible-derived/later | selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 3.90/7.38 | inclusive>=5% | schema-select (직접) | 100.00 |
| computed-visible-derived/later | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 3.09/25.26 | inclusive>=5% | compute (직접) | 100.00 |
| computed-visible-derived/later | evaluateDeriveRound · PKG/src/core/settle/derive/utils/evaluate/evaluateDeriveRound.ts:31 | 2.65/16.61 | inclusive>=5% | derive-evaluation (직접) | 100.00 |
| computed-visible-derived/later | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 2.32/9.53 | inclusive>=5% | deliveries (직접) | 100.00 |
| computed-visible-derived/later | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.03/6.75 | inclusive>=5% | recalculation (직접) | 100.00 |
| computed-visible-derived/later | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 1.45/27.60 | inclusive>=5% | commit (직접) | 100.00 |
| computed-visible-derived/later | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 1.41/6.00 | inclusive>=5% | output (직접) | 100.00 |
| computed-visible-derived/later | runDeriveRounds · PKG/src/core/settle/utils/derivation/runDeriveRounds.ts:29 | 0.67/35.03 | inclusive>=5% | derive-rounds (직접) | 100.00 |
| computed-visible-derived/later | commitDeriveRules · PKG/src/core/settle/utils/commit/commitDeriveRules.ts:19 | 0.62/14.53 | inclusive>=5% | derive-commit (직접) | 100.00 |
| computed-visible-derived/later | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.49/86.49 | inclusive>=5% | api-write (부모) | 99.99 |
| computed-visible-derived/later | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.37/63.93 | inclusive>=5% | finish (직접) | 100.00 |
| computed-visible-derived/later | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.16/87.92 | inclusive>=5% | total-write (직접) | 100.00 |
| computed-visible-derived/later | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01/87.94 | inclusive>=5% | api-write (직접) | 100.00 |
| nested-d5-f4/later | markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 11.92/11.92 | inclusive>=5% | events (직접) | 100.00 |
| nested-d5-f4/later | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 7.53/8.08 | inclusive>=5% | assemble (직접) | 100.00 |
| nested-d5-f4/later | beginPostOrder · PKG/src/core/settle/utils/write/DirtyPathSet.ts:22 | 6.40/6.40 | inclusive>=5% | dirty-begin (직접) | 100.00 |
| nested-d5-f4/later | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 5.92/24.05 | inclusive>=5% | deliveries (직접) | 100.00 |
| nested-d5-f4/later | sameValue · PKG/src/core/settle/utils/compute/sameValue.ts:9 | 5.42/5.42 | inclusive>=5% | same-value (직접) | 100.00 |
| nested-d5-f4/later | add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 5.20/5.20 | inclusive>=5% | dirty-add (직접) | 100.00 |
| nested-d5-f4/later | delete · PKG/src/core/settle/utils/write/DirtyPathSet.ts:83 | 5.19/5.19 | inclusive>=5% | dirty-delete (직접) | 100.00 |
| nested-d5-f4/later | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 4.46/30.96 | inclusive>=5% | compute (직접) | 100.00 |
| nested-d5-f4/later | findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 3.37/5.27 | inclusive>=5% | navigation (직접) | 100.00 |
| nested-d5-f4/later | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 3.19/18.39 | inclusive>=5% | output (직접) | 100.00 |
| nested-d5-f4/later | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.07/9.63 | inclusive>=5% | recalculation (직접) | 100.00 |
| nested-d5-f4/later | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 2.04/28.52 | inclusive>=5% | commit (직접) | 100.00 |
| nested-d5-f4/later | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 1.98/78.43 | inclusive>=5% | api-write (부모) | 100.00 |
| nested-d5-f4/later | (anonymous) · PKG/src/core/settle/utils/compute/updateOutput.ts:28 | 0.79/6.02 | inclusive>=5% | output (직접) | 100.00 |
| nested-d5-f4/later | find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.69/5.95 | inclusive>=5% | navigation-call (직접) | 100.00 |
| nested-d5-f4/later | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.29/28.91 | inclusive>=5% | finish (직접) | 100.00 |
| nested-d5-f4/later | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.17/80.86 | inclusive>=5% | total-write (직접) | 100.00 |
| nested-d5-f4/later | mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.02/11.93 | inclusive>=5% | deliveries (직접) | 100.00 |
| nested-d5-f4/later | find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00/5.95 | inclusive>=5% | navigation-call (직접) | 100.00 |
| nested-d5-f4/later | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.00/80.88 | inclusive>=5% | api-write (직접) | 100.00 |
| oneOf-40/later | resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 13.23/13.23 | inclusive>=5% | path-resolve (직접) | 100.00 |
| oneOf-40/later | selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 12.82/52.37 | inclusive>=5% | children (직접) | 100.00 |
| oneOf-40/later | readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 9.27/12.60 | inclusive>=5% | projected-read (직접) | 100.00 |
| oneOf-40/later | hasOwnProperty · packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6 | 4.32/4.32 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 4.27/73.59 | inclusive>=5% | compute (직접) | 100.00 |
| oneOf-40/later | evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 3.41/32.68 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-40/later | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 2.95/7.31 | inclusive>=5% | recalculation (직접) | 100.00 |
| oneOf-40/later | locate · PKG/src/core/settle/utils/gates/getGateRegistry.ts:83 | 2.16/2.90 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/later | (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 2.12/24.20 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-40/later | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 2.12/2.20 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | flushRead · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:74 | 2.10/2.84 | branch-growth | read-flush (직접) | 100.00 |
| oneOf-40/later | getGateExpression · PKG/src/core/settle/utils/gates/getGateExpression.ts:13 | 2.00/2.00 | branch-growth | gate-expression (직접) | 100.00 |
| oneOf-40/later | add · PKG/src/core/settle/utils/write/DirtyPathSet.ts:45 | 1.83/1.83 | branch-growth | total-write (부모) | 99.52 |
| oneOf-40/later | escapeSegment · packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6 | 1.68/1.68 | branch-growth | total-write (부모) | 99.73 |
| oneOf-40/later | register · PKG/src/core/settle/utils/gates/getGateRegistry.ts:50 | 1.32/1.63 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/later | primeHost · PKG/src/core/settle/utils/compute/primeHost.ts:19 | 1.26/1.37 | branch-growth | prime-host (직접) | 100.00 |
| oneOf-40/later | flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 1.16/9.63 | inclusive>=5% | read-flush (직접) | 100.00 |
| oneOf-40/later | flushGate · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:89 | 1.11/8.48 | inclusive>=5% | read-flush (직접) | 100.00 |
| oneOf-40/later | selectEffectiveDeclarations · PKG/src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9 | 1.09/1.29 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | collect · PKG/src/core/settle/utils/write/getDependencyIndex.ts:83 | 1.07/1.34 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | getControlLayers · PKG/src/core/settle/utils/controls/getControlLayers.ts:56 | 0.95/1.05 | branch-growth | control-layers (직접) | 100.00 |
| oneOf-40/later | projectedEmission · PKG/src/core/settle/utils/gates/readProjectedValue.ts:13 | 0.91/0.91 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.87/11.47 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-40/later | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.69/9.67 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-40/later | unescapePath · packages/winglet/json/dist/JSONPointer/utils/escape/unescapePath.cjs:6 | 0.60/0.60 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | mayChangeOwnDeclarationAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:121 | 0.54/0.61 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/later | getGateRegistry · PKG/src/core/settle/utils/gates/getGateRegistry.ts:222 | 0.54/0.54 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | mayChangeAt · PKG/src/core/settle/utils/gates/getGateRegistry.ts:113 | 0.42/0.42 | branch-growth | gate-registry (직접) | 100.00 |
| oneOf-40/later | bindTemplatePath · PKG/src/core/settle/utils/paths/bindTemplatePath.ts:7 | 0.35/0.35 | branch-growth | template-path (직접) | 100.00 |
| oneOf-40/later | flushPendingOutput · PKG/src/core/settle/utils/compute/flushPendingOutput.ts:12 | 0.34/1.22 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | readUnsetPolicy · PKG/src/core/settle/utils/transition/readUnsetPolicy.ts:11 | 0.32/0.94 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.32/91.86 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-40/later | dirtyChildren · PKG/src/core/settle/utils/compute/dirtyChildren.ts:12 | 0.32/1.98 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.25/4.86 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 0.24/1.60 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | bindGateHostPath · PKG/src/core/settle/utils/gates/bindGateHostPath.ts:12 | 0.24/0.31 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | relocated · PKG/src/core/settle/utils/gates/getGateRegistry.ts:107 | 0.24/0.33 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.23/4.75 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.19/8.91 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-40/later | affected · PKG/src/core/settle/utils/write/getDependencyIndex.ts:75 | 0.17/1.54 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 0.17/2.48 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | walkOwnedSchemaNodes · PKG/src/core/settle/utils/walkOwnedSchemaNodes.ts:9 | 0.13/1.39 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | captureExitedRaw · PKG/src/core/settle/utils/transition/captureExitedRaw.ts:19 | 0.12/1.77 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.10/10.06 | inclusive>=5% | finish (직접) | 100.00 |
| oneOf-40/later | applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.06/3.27 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.02/92.05 | inclusive>=5% | total-write (직접) | 100.00 |
| oneOf-40/later | snapshotExitedPolicies · PKG/src/core/settle/utils/commit/snapshotExitedPolicies.ts:14 | 0.01/0.60 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | relocatedGates · PKG/src/core/settle/utils/compute/relocatedGates.ts:10 | 0.00/0.35 | branch-growth | total-write (부모) | 100.00 |
| oneOf-40/later | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.00/92.06 | inclusive>=5% | api-write (직접) | 100.00 |
| oneOf-5/later | selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 7.63/33.14 | inclusive>=5% | children (직접) | 100.00 |
| oneOf-5/later | resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 6.73/6.73 | inclusive>=5% | path-resolve (직접) | 100.00 |
| oneOf-5/later | readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 4.78/6.61 | inclusive>=5% | projected-read (직접) | 100.00 |
| oneOf-5/later | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 3.55/49.83 | inclusive>=5% | compute (직접) | 100.00 |
| oneOf-5/later | evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 2.00/17.00 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-5/later | updateInactiveValuesMemo · PKG/src/core/settle/utils/commit/updateInactiveValuesMemo.ts:23 | 1.99/6.26 | inclusive>=5% | inactive-memo (직접) | 100.00 |
| oneOf-5/later | setLatentRaw · PKG/src/core/settle/utils/latent/setLatentRaw.ts:21 | 1.61/5.77 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/later | (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 1.15/12.80 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-5/later | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 1.04/6.52 | inclusive>=5% | deliveries (직접) | 100.00 |
| oneOf-5/later | set · PKG/src/core/utils/pathIndex/PathKeyedMap.ts:20 | 1.00/5.61 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/later | selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.99/7.81 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-5/later | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 0.62/16.32 | inclusive>=5% | commit (직접) | 100.00 |
| oneOf-5/later | finalizeExits · PKG/src/core/settle/utils/transition/finalizeExits.ts:20 | 0.49/14.06 | inclusive>=5% | exits (직접) | 100.00 |
| oneOf-5/later | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:21 | 0.46/5.55 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-5/later | captureExitedRaw · PKG/src/core/settle/utils/transition/captureExitedRaw.ts:19 | 0.43/5.86 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/later | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.36/87.77 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/later | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.27/31.70 | inclusive>=5% | finish (직접) | 100.00 |
| oneOf-5/later | applyExitClearing · PKG/src/core/settle/utils/transition/applyExitClearing.ts:15 | 0.15/9.66 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/later | (anonymous) · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:22 | 0.13/5.02 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-5/later | writeLatentRaw · PKG/src/core/settle/utils/transition/writeLatentRaw.ts:16 | 0.07/5.83 | inclusive>=5% | total-write (부모) | 100.00 |
| oneOf-5/later | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.03/88.17 | inclusive>=5% | total-write (직접) | 100.00 |
| oneOf-5/later | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01/88.18 | inclusive>=5% | api-write (직접) | 100.00 |
| sample-0/later | markSchemaNodeEvent · PKG/src/core/record/utils/markSchemaNodeEvent.ts:12 | 12.65/12.65 | inclusive>=5% | events (직접) | 100.00 |
| sample-0/later | markCommitDeliveries · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:25 | 7.14/25.71 | inclusive>=5% | deliveries (직접) | 100.00 |
| sample-0/later | assembleObject · PKG/src/core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18 | 5.05/5.23 | inclusive>=5% | assemble (직접) | 100.00 |
| sample-0/later | commitSettlement · PKG/src/core/settle/utils/commit/commitSettlement.ts:30 | 3.59/36.52 | inclusive>=5% | commit (직접) | 100.00 |
| sample-0/later | findNodes · PKG/src/core/navigation/utils/query/findNodes.ts:7 | 2.78/5.85 | inclusive>=5% | navigation (직접) | 100.00 |
| sample-0/later | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.20/16.74 | inclusive>=5% | compute (직접) | 100.00 |
| sample-0/later | updateOutput · PKG/src/core/settle/utils/compute/updateOutput.ts:13 | 1.98/9.17 | inclusive>=5% | output (직접) | 100.00 |
| sample-0/later | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.69/5.28 | inclusive>=5% | recalculation (직접) | 100.00 |
| sample-0/later | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 1.21/70.22 | inclusive>=5% | total-write (부모) | 100.00 |
| sample-0/later | dispatchSetValue · PKG/src/core/dispatch/utils/entry/dispatchSetValue.ts:18 | 0.94/75.30 | inclusive>=5% | total-write (직접) | 100.00 |
| sample-0/later | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.73/37.40 | inclusive>=5% | finish (직접) | 100.00 |
| sample-0/later | find · PKG/src/core/navigation/utils/query/find.ts:5 | 0.47/6.31 | inclusive>=5% | navigation-call (직접) | 100.00 |
| sample-0/later | mark · PKG/src/core/settle/utils/commit/markCommitDeliveries.ts:92 | 0.11/12.75 | inclusive>=5% | deliveries (직접) | 100.00 |
| sample-0/later | setValue · PKG/src/core/SchemaNode/SchemaNode.ts:208 | 0.01/75.31 | inclusive>=5% | api-write (직접) | 100.00 |
| sample-0/later | find · PKG/src/core/SchemaNode/SchemaNode.ts:200 | 0.00/6.31 | inclusive>=5% | navigation-call (직접) | 100.00 |
| flat-500/mount | buildNodes · PKG/src/core/blueprint/utils/analyze/buildNodes.ts:24 | 8.46/33.44 | inclusive>=5% | total-mount (부모) | 99.99 |
| flat-500/mount | _SchemaNodeRevisionLedger · PKG/src/core/record/utils/SchemaNodeRevisionLedger.ts:18 | 7.88/8.67 | inclusive>=5% | revision (직접) | 100.00 |
| flat-500/mount | applySchemaContribution · PKG/src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36 | 5.22/8.73 | inclusive>=5% | total-mount (부모) | 100.00 |
| flat-500/mount | ensureEffectiveSchemaCache · PKG/src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15 | 5.12/5.12 | inclusive>=5% | total-mount (부모) | 100.00 |
| flat-500/mount | commitStaticFirstNode · PKG/src/core/settle/utils/load/commitStaticFirstNode.ts:13 | 3.65/12.32 | inclusive>=5% | static-commit (직접) | 100.00 |
| flat-500/mount | mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 2.85/23.37 | inclusive>=5% | schema-merge (직접) | 100.00 |
| flat-500/mount | populateNodeChildren · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:19 | 2.42/30.31 | inclusive>=5% | total-mount (부모) | 100.00 |
| flat-500/mount | createSchemaNode · PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 2.39/13.67 | inclusive>=5% | factory-reuse (직접) | 100.00 |
| flat-500/mount | blueprint · PKG/src/core/blueprint/blueprint.ts:21 | 2.32/36.67 | inclusive>=5% | blueprint (직접) | 100.00 |
| flat-500/mount | mergeSchemaContributions · PKG/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27 | 1.93/12.60 | inclusive>=5% | total-mount (부모) | 100.00 |
| flat-500/mount | loadStaticFirstTree · PKG/src/core/settle/utils/load/loadStaticFirstTree.ts:42 | 1.25/32.87 | inclusive>=5% | static-load (직접) | 100.00 |
| flat-500/mount | createChildNode · PKG/src/core/settle/utils/compute/createChildNode.ts:10 | 0.28/12.69 | inclusive>=5% | total-mount (부모) | 100.00 |
| flat-500/mount | loadSchemaNodeAtMount · PKG/src/core/settle/utils/load/loadSchemaNodeAtMount.ts:15 | 0.21/33.80 | inclusive>=5% | mount-load (직접) | 100.00 |
| flat-500/mount | buildSchemaNodeTree · PKG/src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37 | 0.05/37.19 | inclusive>=5% | root-build (직접) | 100.00 |
| flat-500/mount | dispatchMount · PKG/src/core/dispatch/utils/entry/dispatchMount.ts:21 | 0.03/34.22 | inclusive>=5% | total-mount (부모) | 100.00 |
| flat-500/mount | mountSchemaNode · PKG/src/core/SchemaNode/utils/binding/mountSchemaNode.ts:14 | 0.01/34.23 | inclusive>=5% | total-mount (부모) | 99.97 |
| flat-500/mount | nodeFromJSONSchema · PKG/src/core/nodeFromJSONSchema.ts:17 | 0.01/71.41 | inclusive>=5% | total-mount (직접) | 100.00 |
| nested-d5-f4/mount | buildNodes · PKG/src/core/blueprint/utils/analyze/buildNodes.ts:24 | 9.31/32.69 | inclusive>=5% | total-mount (부모) | 100.00 |
| nested-d5-f4/mount | _SchemaNodeRevisionLedger · PKG/src/core/record/utils/SchemaNodeRevisionLedger.ts:18 | 7.18/7.83 | inclusive>=5% | revision (직접) | 100.00 |
| nested-d5-f4/mount | applySchemaContribution · PKG/src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36 | 4.63/8.33 | inclusive>=5% | total-mount (부모) | 99.90 |
| nested-d5-f4/mount | commitStaticFirstNode · PKG/src/core/settle/utils/load/commitStaticFirstNode.ts:13 | 3.17/11.00 | inclusive>=5% | static-commit (직접) | 100.00 |
| nested-d5-f4/mount | populateNodeChildren · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:19 | 3.03/32.10 | inclusive>=5% | total-mount (부모) | 100.00 |
| nested-d5-f4/mount | blueprint · PKG/src/core/blueprint/blueprint.ts:21 | 2.90/37.49 | inclusive>=5% | blueprint (직접) | 100.00 |
| nested-d5-f4/mount | mergeEffectiveSchema · PKG/src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:26 | 2.61/21.99 | inclusive>=5% | schema-merge (직접) | 100.00 |
| nested-d5-f4/mount | createSchemaNode · PKG/src/core/SchemaNode/utils/schemaNodeFactory.ts:29 | 2.21/13.75 | inclusive>=5% | factory-reuse (직접) | 100.00 |
| nested-d5-f4/mount | mergeSchemaContributions · PKG/src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27 | 1.76/11.69 | inclusive>=5% | total-mount (부모) | 100.00 |
| nested-d5-f4/mount | loadStaticFirstTree · PKG/src/core/settle/utils/load/loadStaticFirstTree.ts:42 | 1.48/31.44 | inclusive>=5% | static-load (직접) | 100.00 |
| nested-d5-f4/mount | createChildNode · PKG/src/core/settle/utils/compute/createChildNode.ts:10 | 0.43/13.10 | inclusive>=5% | total-mount (부모) | 100.00 |
| nested-d5-f4/mount | loadSchemaNodeAtMount · PKG/src/core/settle/utils/load/loadSchemaNodeAtMount.ts:15 | 0.18/32.28 | inclusive>=5% | mount-load (직접) | 100.00 |
| nested-d5-f4/mount | buildSchemaNodeTree · PKG/src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37 | 0.08/37.98 | inclusive>=5% | root-build (직접) | 100.00 |
| nested-d5-f4/mount | nodeFromJSONSchema · PKG/src/core/nodeFromJSONSchema.ts:17 | 0.01/70.77 | inclusive>=5% | total-mount (직접) | 100.00 |
| nested-d5-f4/mount | dispatchMount · PKG/src/core/dispatch/utils/entry/dispatchMount.ts:21 | 0.01/32.75 | inclusive>=5% | total-mount (부모) | 100.00 |
| nested-d5-f4/mount | mountSchemaNode · PKG/src/core/SchemaNode/utils/binding/mountSchemaNode.ts:14 | 0.01/32.78 | inclusive>=5% | total-mount (부모) | 100.00 |
| oneOf-20/mount | resolveDependencyPath · PKG/src/core/settle/utils/paths/resolveDependencyPath.ts:7 | 8.52/8.52 | inclusive>=5% | path-resolve (직접) | 100.00 |
| oneOf-20/mount | selectChildren · PKG/src/core/settle/utils/compute/selectChildren.ts:82 | 6.64/27.91 | inclusive>=5% | children (직접) | 100.00 |
| oneOf-20/mount | readProjectedValue · PKG/src/core/settle/utils/gates/readProjectedValue.ts:25 | 4.49/5.96 | inclusive>=5% | projected-read (직접) | 100.00 |
| oneOf-20/mount | buildNodes · PKG/src/core/blueprint/utils/analyze/buildNodes.ts:24 | 4.19/21.61 | inclusive>=5% | total-mount (부모) | 99.98 |
| oneOf-20/mount | collectDeclarations · PKG/src/core/blueprint/utils/analyze/collectDeclarations.ts:27 | 2.92/6.20 | inclusive>=5% | total-mount (부모) | 100.00 |
| oneOf-20/mount | computeNode · PKG/src/core/settle/utils/compute/computeNode.ts:21 | 2.57/40.76 | inclusive>=5% | compute (직접) | 100.00 |
| oneOf-20/mount | blueprint · PKG/src/core/blueprint/blueprint.ts:21 | 1.95/26.14 | inclusive>=5% | blueprint (직접) | 100.00 |
| oneOf-20/mount | populateNodeChildren · PKG/src/core/blueprint/utils/analyze/populateNodeChildren.ts:19 | 1.84/15.64 | inclusive>=5% | total-mount (부모) | 100.00 |
| oneOf-20/mount | evaluateGate · PKG/src/core/settle/utils/gates/evaluateGate.ts:26 | 1.75/15.99 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-20/mount | registerRecalculation · PKG/src/core/settle/utils/write/registerRecalculation.ts:12 | 1.48/10.13 | inclusive>=5% | recalculation (직접) | 100.00 |
| oneOf-20/mount | flushPendingGateReads · PKG/src/core/settle/utils/gates/flushPendingGateReads.ts:30 | 1.25/5.73 | inclusive>=5% | read-flush (직접) | 100.00 |
| oneOf-20/mount | DependencyIndex · PKG/src/core/settle/utils/write/getDependencyIndex.ts:32 | 1.24/6.73 | inclusive>=5% | dependency-index (직접) | 100.00 |
| oneOf-20/mount | (anonymous) · PKG/src/core/settle/utils/gates/evaluateGate.ts:111 | 0.79/12.12 | inclusive>=5% | gates (직접) | 100.00 |
| oneOf-20/mount | selectNodeSchema · PKG/src/core/settle/utils/compute/selectNodeSchema.ts:17 | 0.53/6.18 | inclusive>=5% | schema-select (직접) | 100.00 |
| oneOf-20/mount | transitionSettlement · PKG/src/core/settle/utils/transition/transitionSettlement.ts:28 | 0.44/37.27 | inclusive>=5% | transition (직접) | 100.00 |
| oneOf-20/mount | getDependencyIndex · PKG/src/core/settle/utils/write/getDependencyIndex.ts:161 | 0.16/6.89 | inclusive>=5% | total-mount (부모) | 100.00 |
| oneOf-20/mount | writeSchemaNode · PKG/src/core/settle/utils/write/writeSchemaNode.ts:35 | 0.11/57.58 | inclusive>=5% | total-mount (부모) | 100.00 |
| oneOf-20/mount | finishSettlement · PKG/src/core/settle/utils/settlement/finishSettlement.ts:23 | 0.07/39.31 | inclusive>=5% | finish (직접) | 100.00 |
| oneOf-20/mount | dispatchMount · PKG/src/core/dispatch/utils/entry/dispatchMount.ts:21 | 0.03/57.82 | inclusive>=5% | total-mount (부모) | 100.00 |
| oneOf-20/mount | loadSchemaNodeAtMount · PKG/src/core/settle/utils/load/loadSchemaNodeAtMount.ts:15 | 0.02/57.63 | inclusive>=5% | mount-load (직접) | 100.00 |
| oneOf-20/mount | buildSchemaNodeTree · PKG/src/core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37 | 0.01/26.51 | inclusive>=5% | root-build (직접) | 100.00 |
| oneOf-20/mount | nodeFromJSONSchema · PKG/src/core/nodeFromJSONSchema.ts:17 | 0.00/84.35 | inclusive>=5% | total-mount (직접) | 100.00 |
| oneOf-20/mount | mountSchemaNode · PKG/src/core/SchemaNode/utils/binding/mountSchemaNode.ts:14 | 0.00/57.83 | inclusive>=5% | total-mount (부모) | 100.00 |

미대조 행 0개입니다. driver·GC·V8 프레임은 위 프로파일 표에 남기되 라이브러리 함수의 share로 덮어씌우지 않았습니다. GC의 할당 영향은 노드/청사진/스키마/revision/scratch 제거 job의 종단 차이에 포함됩니다.

## 보관과 검증

raw CPU profile은 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/prof`에만 남겼습니다. 모든 측정 및 요약 파일은 5 MB 이하입니다. 재빌드 가능한 임시 `.profile-99c01-work`는 번들 SHA-256을 JSON에 저장한 뒤 삭제했습니다. 생성 번들·source map은 산출물에 포함하지 않았습니다.

[profile-99c01-summary.json](profile-99c01-summary.json)은 방법·환경·번들 hash·22개 프로파일·분기 축·모든 제거 상한·세 run·수정 사양·coverage를 기계 판독 형태로 보존합니다. 개별 paired JSON은 101개 원 관측과 sentinel 보정·관찰값을 보존합니다. 하네스 및 compiler의 Node 구문 검사, 표본 수/파일 크기/프로파일 열과 대조 coverage 검사, HEAD 및 제품 소스 불변·변경 범위 검사를 완료했습니다. 제품 코드의 lint/typecheck/test는 이 분석 작업의 검증 근거로 주장하지 않습니다.
