# 현행 dist 마운트 비용 분해

제품 기준은 `214534c2f6e820f58cadf75f03828196a6c9760a`, 가지는 `perf/schema-form-mount-breakdown`입니다. PR #421 병합 뒤 post-L3 dist를 조사했습니다. 이어 조정자가 승인한 완료 경계 보정으로 검증 어댑터·first-batch 공통 도구·영속 readiness 가드와 설명 문서를 갱신했습니다. **제품 소스·기존 제품 시험 기대값·매니페스트·INTENT·DETAIL·추적 빌드 산출물 변경은 0건**입니다. 제품 최적화·새 의존성·유지 캐시·전역 상태·제품 공개 이름 추가는 하지 않았습니다.

**공개 값 확정을 포함한 새 완료 창**의 BN 객체 1,000키는 Node **6.6765 ms**·Bun **4.0709 ms**, B0 객체 1,000키는 Node **0.9511 ms**·Bun **0.4750 ms**입니다. 두 바퀴 중앙값의 평균입니다. 옛 판 factory 반환 뒤 지연 합성을 확인했으므로 첫 창의 legacy factory-only 시간과 대비 비율은 완료 비교로 무효입니다. 새 창은 양 판 모두 자식부터 공개 값을 읽는 순회 비용까지 포함합니다. 첫 창의 current 비용 분해는 원래 경계의 진단으로 보존하며 새 시간에 합산하지 않습니다. 옛 판은 목표치가 아니고 회귀 수용을 결정하지 않습니다.

첫 별도 구현 후보는 **items·prefixItems가 모두 없는 배열의 빈 자식 선언을 알아내려고 모든 자리를 탐색하는 작업 하나**입니다. 현재 1,000/8,000자리에서 자식은 0개인데 `getItemEntries`를 1,000/8,000회 호출합니다. 기존 `EMPTY` 결과를 직접 반환할 수 있는 정적 자격을 증명하는 작은 변경을 제안하며, 전체 마운트의 시간 절감을 예측하지 않습니다.

## 측정 경계와 실제 호출 경로

기존 [probe-terminal-mode.ts:77](probe-terminal-mode.ts#L77)의 `createCore`와 [loadDistEngine.ts:152](../../../bench/distEngine/loadDistEngine.ts#L152)을 대조했습니다. 타이머 안에서 `buildFieldNodeTree(props)`와 `mountFieldNode(root, undefined, undefined, { deferValidation: false })`를 부릅니다. [buildFieldNodeTree.ts:39](../../../src/core/surface/utils/binding/buildFieldNodeTree.ts#L39)는 청사진을 그 안에서 만듭니다. 청사진 생성·정적 검증은 기존 core mount에 이미 포함되며, 폼 한 개의 엔진 준비 비용을 별도 합산하지 않습니다. React DOM 렌더·마운트·validator 플러그인 비용은 이 경계에 없습니다.

| 연결 | 실제 경계와 증거 |
| --- | --- |
| 스키마 → 청사진 | `src/core/surface/utils/binding/buildFieldNodeTree.ts:41` → `src/core/engine/blueprint/blueprint.ts:23`; buildNodes 뒤 validateShape·validateChildTargets를 마칩니다. |
| 청사진 → 루트·자식 레코드 | `src/core/surface/utils/fieldNodeFactory.ts:77,95,141`; createFieldNode가 경로·행·유효 스키마를 준비하고 RuntimeFieldNode를 만듭니다. 자식 연결은 `src/core/engine/settle/utils/compute/createChildNode.ts:10`의 runtime.nodeFactory입니다. |
| 마운트 기본 입력 | `src/core/engine/write/utils/entry/dispatchMount.ts:24,26,39`; 생략한 value를 runtime.loadSnapshot으로 치환합니다. 따라서 이 fixture의 defaultValue는 loadFieldNodeAtMount에 실제 객체로 도착합니다. |
| 정적 첫 로드/범용 정착 | `src/core/engine/settle/loadFieldNodeAtMount/loadFieldNodeAtMount.ts:23–24`; `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/canLoadStaticFirstTree.ts:14`는 value === undefined를 요구합니다. 이번 호출 수는 loadStaticFirstTree 0·writeFieldNode 1로 범용 경로를 확인합니다. 정적 첫 로드와 같은 비용이라고 해석하지 않습니다. |
| 입력·자식 선택·계산·커밋 | `src/core/engine/settle/utils/write/writeFieldNode.ts:136,139,140,143` → markWrite·registerRecalculation·computeNode·finishSettlement입니다. |
| 선언 배열의 실제 dispatch | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:152` → `src/core/engine/behaviors/arrayBehavior/branch/arrayBranchBehavior.ts:15` → `src/core/engine/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts:21–33`; child/node 이름만으로 경로를 추정하지 않았습니다. |
| extras 복사와 합성 | `src/core/engine/settle/utils/input/nextExtras.ts:18–27`; 객체 합성은 `src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:161–177,236`의 Map·names·seen과 결과 객체, 배열 합성은 `src/core/engine/behaviors/arrayBehavior/utils/value/assembleArray.ts:166` 이후 자리 순회입니다. |
| 커밋·배달 | `src/core/engine/settle/utils/commit/commitSettlement.ts:32`와 `src/core/engine/write/utils/chain/runDeliveryWaves.ts:11`; dispatchMount:65의 exitFieldNodeChain이 배달 사슬을 마칩니다. 리스너 호출 이전 revision·payload 확정은 지킬 결과입니다. |

경로는 패키지 기준입니다. 인터프리터·게이트 장면은 이번 숫자로 추적 완료라고 주장하지 않습니다. 게이트 없는 숫자 fixture의 실제 경로만 계수와 함께 확인했습니다.

## 첫 창의 입력·재현 자료

첫 번째 조용한 창: **2026-10-18T10:59:59.475Z → 2026-10-18T11:03:09.740Z UTC**, arm64, Node v26.12.0, Bun 1.4.3, `NODE_ENV=production`입니다. 창을 열기 전에 `yarn workspace @canard/schema-form build`를 완료했고, 창 안에는 빌드·게이트·다른 벤치·대규모 분석을 겹치지 않았습니다. 전체 명령 순서·시작·종료·종료 코드는 `window.json`에 있습니다.

| 입력 | SHA-256 |
| --- | --- |
| current raw dist | `20e9321ba693d6fc810ab2f04a2aced52e7ccc996f17978a27db342133166fbd` |
| 로컬 0.16.1 raw dist | `5f6b0171b3c53f44e259a1c5e1049e48c9ea0ecae6509d821749e36295489c46` |
| current 내부 export 사본 | `31cb314e41037ba0ec7de8f5bedfbb21959268ab8e2431477b56aadcfbd23cc7` |
| legacy 내부 export 사본 | `8724b4d98ceea5b27dae868ff228f8eb315fe8e70a34e2a540827499ffda605c` |
| current 성긴 계측 사본 | `a3a27f8360bb3ca337b9981778448368770b58bf0e8c7873d96fb450980e2860` |
| current 세부 계측 사본 | `6f12bbeb68bc40111ecc581a2d1444375bb22932f41a85b2ade363f3ba0db535` |
| 별도 호출 계수 사본 | `fb4d669cb5cc91acfcea8ee6506b511c65f59490959292167c4847ada418c498` |

양 판의 bare Winglet import는 동일한 기존 작업 폴더 node_modules로 해석합니다. 새 설치나 외부 참조를 가져오지 않았습니다. 다음은 각 패키지 ESM 주 dist이며, 하위 entry를 포함한 전체 실행 dist **603개**의 해시는 `manifest.json`에 있고 창 후 모두 일치했습니다.

| Winglet | dist/index.mjs SHA-256 |
| --- | --- |
| common-utils | `7de0a8437570ec34bd9627885ebbcc9133347b92eadae9c01693a5a24a6cfc9e` |
| json | `46d6b60e1513a9759e874ed254c38bae5d18a96675ab9094e9d5031cc121cae9` |
| json-schema | `301f7709fe203772c80e050605874f17030f0dbe25847a7ceb3c584a5a5d6ff9` |
| react-utils | `48c575ffcae6334a9f388c10932366977dcb60e5af443d5e7a3cd3716f0419f2` |

원시 결과·사본·도구의 실제 경로는 `{tmp}/mount-breakdown-task_7e0e67a1893f`입니다. `preserved-evidence.json`은 기존 .seiri 및 bench/.results 원자료 138개의 보존 해시이고 창 후 전부 일치했습니다. `manifest.json`은 기준·dist·Winglet, `window.json`은 창·도구 해시·명령, `analysis.json`은 표를 재계산한 전정밀도 값입니다. `{baseline,coarse,detailed,counts}-{node,bun}-{1,2}.json`과 같은 이름의 `.err` 파일이 16개 실행의 stdout·stderr를 보존합니다.

실행 도구는 기존 first-batch/b-a2의 config·bench-common을 TMPDIR에 복사한 것입니다. config는 자기 작업 폴더와 실제 current 해시만 고정했습니다. schemaOf/fullCheck는 기존 terminal 프로브와 같도록 T0의 terminal 표기, array T의 items 선언, T0의 terminal 판별 세 곳만 맞췄습니다. core factory와 schema/input/recorder/fullCheck/drain은 기존 도구를 재사용했고 임시 run.mjs가 mount 구간과 원자료 보관을 조율합니다. `prepare.mjs`의 모든 치환은 복사본에만 적용됩니다.

창 진입은 `{node-home}/bin/node {tmp}/mount-breakdown-task_7e0e67a1893f/window.mjs`입니다. 이미 존재하는 사본과 manifest를 검토한 뒤에만 재현해야 하며, 기존 원시 파일 위로 다시 실행하지 말고 새 TMPDIR 실행 폴더를 사용합니다. window.mjs는 mode를 baseline→coarse→detailed→counts 순서로 돌리고, 각 mode에서 Node1→Bun1→Node2→Bun2를 직렬 실행합니다. 두 번째 바퀴는 `--reverse`로 판·장면 순서를 뒤집습니다. 개별 명령·바이너리 경로는 window.json의 commands 배열에 그대로 있습니다. Node/Bun correctness-only 사전 확인은 창 밖이며 성능 근거에서 제외했습니다.

TMPDIR는 영구 저장소가 아니며 원자료는 보고서 커밋에 포함하지 않습니다. 현재 재현 입력은 전부 존재하지만 TMPDIR가 정리되면 원자료·도구 해시만으로 표본을 복원할 수 없습니다. 기존 L3 원자료를 덮어쓰지 않았습니다.

## 첫 창의 current 시간과 factory-only 진단

각 판·장면·바퀴에 준비 20회·표본 100회입니다. 스키마·입력 작성과 sample input 복제는 시간 밖, 시작은 core factory 직전, 끝은 factory 반환과 마지막 mount onChange 중 늦은 시점입니다. 두 zero-delay timer를 기다린 polling 시간은 더하지 않습니다. current는 반환 직후 및 drain 후 값·자식·경로를 검사했고, legacy는 기존 mount probe처럼 drain 후 전체 관측을 확인했습니다. 실제로 legacy는 모든 지원 mount 표본에서 초기 onChange 0회, current는 1회였으며, 양 판의 초기 callback 횟수가 같다고 주장하지 않습니다. 쓰기의 비동기 완료 시간을 이 mount 수치로 대신하지 않습니다.

모든 자식의 값·이름·경로, root/host의 전체 값, terminal/branch, 선언 자식 수, caller 입력 불변, 키 순서를 시간 밖에서 확인했습니다. 이 제한된 관측은 새/옛 엔진의 전체 이벤트·revision 차등이나 사용자 렌더 검증을 대신하지 않습니다. 특히 legacy의 '읽으면 맞음'과 '타이머 종료 전에 합성 완료'는 다릅니다.

current ms는 두 바퀴 중앙값의 산술 평균 [최소–최대]이며 범위는 신뢰구간이 아닙니다. 옛 판의 관측 완료 시간과 대비 ±%는 지원 장면도 **미검증**입니다. 배열 T0/B0의 옛 판 칸은 실제 스키마 거부를 확인한 **미지원**으로 구별합니다. 다른 창이나 다른 런타임의 수치로 채우지 않았습니다.

| 런타임 | 장면 | 0.16.1 관측 완료 ms | current ms [바퀴 범위] | current/0.16.1 완료 시간 ±% |
| --- | --- | ---: | ---: | ---: |
| Node v26.12.0 | object/T N=100 | 미검증 | 0.1463 [0.1144–0.1782] | 미검증 |
| Node v26.12.0 | object/T N=1,000 | 미검증 | 0.1291 [0.0706–0.1876] | 미검증 |
| Node v26.12.0 | object/B0 N=100 | 미검증 | 0.2469 [0.2356–0.2583] | 미검증 |
| Node v26.12.0 | object/B0 N=1,000 | 미검증 | 0.8636 [0.7105–1.0168] | 미검증 |
| Node v26.12.0 | object/B1 N=100 | 미검증 | 0.1481 [0.1052–0.1909] | 미검증 |
| Node v26.12.0 | object/B1 N=1,000 | 미검증 | 0.8663 [0.8349–0.8978] | 미검증 |
| Node v26.12.0 | object/BN N=100 | 미검증 | 1.0054 [0.8706–1.1402] | 미검증 |
| Node v26.12.0 | object/BN N=1,000 | 미검증 | 6.3688 [6.1471–6.5905] | 미검증 |
| Node v26.12.0 | array/T N=1,000 | 미검증 | 0.1385 [0.0694–0.2075] | 미검증 |
| Node v26.12.0 | array/T N=8,000 | 미검증 | 0.1202 [0.1071–0.1333] | 미검증 |
| Node v26.12.0 | array/T0 N=1,000 | 미지원 | 0.2281 [0.1825–0.2737] | 미지원 |
| Node v26.12.0 | array/T0 N=8,000 | 미지원 | 0.1400 [0.0760–0.2040] | 미지원 |
| Node v26.12.0 | array/B0 N=1,000 | 미지원 | 0.6820 [0.4569–0.9071] | 미지원 |
| Node v26.12.0 | array/B0 N=8,000 | 미지원 | 2.4627 [2.4354–2.4899] | 미지원 |
| Node v26.12.0 | array/BN N=1,000 | 미검증 | 3.0279 [2.9799–3.0759] | 미검증 |
| Node v26.12.0 | array/BN N=8,000 | 미검증 | 28.6761 [28.4447–28.9075] | 미검증 |
| Bun 1.4.3 | object/T N=100 | 미검증 | 0.1957 [0.1322–0.2592] | 미검증 |
| Bun 1.4.3 | object/T N=1,000 | 미검증 | 0.2748 [0.0795–0.4701] | 미검증 |
| Bun 1.4.3 | object/B0 N=100 | 미검증 | 0.2259 [0.1596–0.2921] | 미검증 |
| Bun 1.4.3 | object/B0 N=1,000 | 미검증 | 0.4519 [0.4233–0.4804] | 미검증 |
| Bun 1.4.3 | object/B1 N=100 | 미검증 | 0.2676 [0.2204–0.3148] | 미검증 |
| Bun 1.4.3 | object/B1 N=1,000 | 미검증 | 0.4695 [0.4413–0.4978] | 미검증 |
| Bun 1.4.3 | object/BN N=100 | 미검증 | 0.5851 [0.5377–0.6325] | 미검증 |
| Bun 1.4.3 | object/BN N=1,000 | 미검증 | 3.7340 [3.4935–3.9746] | 미검증 |
| Bun 1.4.3 | array/T N=1,000 | 미검증 | 0.0952 [0.0895–0.1009] | 미검증 |
| Bun 1.4.3 | array/T N=8,000 | 미검증 | 0.1211 [0.1159–0.1262] | 미검증 |
| Bun 1.4.3 | array/T0 N=1,000 | 미지원 | 0.0771 [0.0534–0.1008] | 미지원 |
| Bun 1.4.3 | array/T0 N=8,000 | 미지원 | 0.1194 [0.0765–0.1623] | 미지원 |
| Bun 1.4.3 | array/B0 N=1,000 | 미지원 | 0.1667 [0.1654–0.1680] | 미지원 |
| Bun 1.4.3 | array/B0 N=8,000 | 미지원 | 1.0503 [0.9615–1.1392] | 미지원 |
| Bun 1.4.3 | array/BN N=1,000 | 미검증 | 2.4176 [2.2969–2.5384] | 미검증 |
| Bun 1.4.3 | array/BN N=8,000 | 미검증 | 20.6475 [19.8749–21.4200] | 미검증 |

T는 terminal, B0는 하위 선언 없음, 객체 B1은 k0만 선언, BN은 모든 객체 키 또는 공통 숫자 items를 선언합니다. 배열 T에는 숫자 items가 있고 T0는 items 없는 terminal입니다. 과거의 +446%·+286%·약 28배를 이번 숫자의 목표나 검증 기준으로 사용하지 않았습니다.

### legacy 종료 경계의 사후 correctness 확인과 결손

창을 닫은 뒤 같은 사본에서 지원 12장면을 새로 20회씩, Node 240회·Bun 240회 확인했습니다. factory 반환 뒤 await·microtask·timer·drain 전에 root/host의 전체 값·자식·경로를 읽으면 모두 맞았고 drain 뒤에도 같으며 callback은 0회였습니다. 그러나 getter를 읽기 **전** 루트 strategy는 모든 480회에서 `expired=true, locked=false, composedValid=false`였고 읽은 뒤 composedValid=true가 됐습니다. 로컬 0.16.1 raw dist의 **5146–5152행**은 이 경우 value getter가 `__parseValue__`를 호출함을 보여 줍니다. 따라서 이 correctness 성공으로 factory 반환 시 합성 완료를 추정할 수 없습니다.

`legacy-completion-state.mjs`와 `legacy-completion-state-node.json`, `legacy-completion-state-bun.json`이 getter 접근 전후 상태를 보존합니다. 최초의 약한 확인인 `legacy-completion-{node,bun}.json`도 덮어쓰지 않았습니다. 이 후속 확인은 correctness-only이며 새로운 시간 창이나 시간 표본을 만들지 않았습니다. 이 범위에서 옛 판 시간/비율을 관측 완료 비교로 쓰지 않습니다. 이 결손 때문에 아래의 canonical 보정과 새 완료 경계 창을 추가했습니다. 사후 검사의 성공을 첫 창의 완료 비교 복구에 쓰지 않습니다.

정확한 후속 명령은 `{node-home}/bin/node {tmp}/mount-breakdown-task_7e0e67a1893f/legacy-completion-state.mjs`와 `bun {tmp}/mount-breakdown-task_7e0e67a1893f/legacy-completion-state.mjs`이며 각각 Node v26.12.0·Bun 1.4.3에서 실행했습니다. 기존 run.mjs·window.mjs·prepare.mjs·계측 사본·원시 시간 표본은 고치지 않았고 측정 당시 window.json의 도구 해시가 그대로 재현됩니다. 이 scratch 상태 확인의 범위는 지원 12장면의 factory 반환 직후 상태·즉시 public 읽기·drain 후 상태·callback뿐이며, 이 확인의 경과 시간을 재거나 원래 표본에 더하지 않았습니다.

다음은 잃어버리지 않도록 남긴 **factory-only 참고 진단**입니다. 합성 완료 시간도, current와의 속도 비교도 아닙니다. 원래 analysis.json의 changePct는 이 factory-only 시간으로 계산한 값이므로 산술 검산 성공과 무관하게 완료 비교에서는 무효입니다. 아래에서는 그 비율을 다시 주장하지 않습니다.

| 런타임 | 장면 | 0.16.1 factory-only 참고 ms [바퀴 범위] |
| --- | --- | ---: |
| Node v26.12.0 | object/T N=100 | 0.1618 [0.0705–0.2531] |
| Node v26.12.0 | object/T N=1,000 | 1.7780 [1.5989–1.9570] |
| Node v26.12.0 | object/B0 N=100 | 0.0207 [0.0143–0.0271] |
| Node v26.12.0 | object/B0 N=1,000 | 0.0512 [0.0321–0.0703] |
| Node v26.12.0 | object/B1 N=100 | 0.1710 [0.0742–0.2677] |
| Node v26.12.0 | object/B1 N=1,000 | 1.2373 [1.1480–1.3266] |
| Node v26.12.0 | object/BN N=100 | 0.3260 [0.1686–0.4833] |
| Node v26.12.0 | object/BN N=1,000 | 1.6553 [1.6323–1.6784] |
| Node v26.12.0 | array/T N=1,000 | 1.1273 [1.1096–1.1450] |
| Node v26.12.0 | array/T N=8,000 | 35.9453 [35.7942–36.0963] |
| Node v26.12.0 | array/BN N=1,000 | 0.8392 [0.8210–0.8574] |
| Node v26.12.0 | array/BN N=8,000 | 9.3088 [8.0042–10.6133] |
| Bun 1.4.3 | object/T N=100 | 0.0836 [0.0394–0.1278] |
| Bun 1.4.3 | object/T N=1,000 | 0.5668 [0.4999–0.6337] |
| Bun 1.4.3 | object/B0 N=100 | 0.0504 [0.0272–0.0736] |
| Bun 1.4.3 | object/B0 N=1,000 | 0.1828 [0.1299–0.2356] |
| Bun 1.4.3 | object/B1 N=100 | 0.0519 [0.0390–0.0648] |
| Bun 1.4.3 | object/B1 N=1,000 | 0.6880 [0.6206–0.7554] |
| Bun 1.4.3 | object/BN N=100 | 0.1509 [0.1489–0.1530] |
| Bun 1.4.3 | object/BN N=1,000 | 1.3280 [1.2651–1.3909] |
| Bun 1.4.3 | array/T N=1,000 | 2.4622 [2.4619–2.4625] |
| Bun 1.4.3 | array/T N=8,000 | 86.9591 [86.5784–87.3399] |
| Bun 1.4.3 | array/BN N=1,000 | 0.7702 [0.7165–0.8240] |
| Bun 1.4.3 | array/BN N=8,000 | 5.3261 [5.2238–5.4284] |

## 완료 경계 보정과 영속 가드

[loadDistEngine.ts:103](../../../bench/distEngine/loadDistEngine.ts#L103)의 `materializeMountedValues`는 공개 children을 후위 순회하고 각 노드의 value를 읽은 뒤 반환합니다. 같은 호출에서 공유 가상 자식의 중복 관측만 막고 상태를 유지하지 않습니다. current·legacy create 양쪽과 [first-batch bench-common](first-batch/b-a2/bench-common.mjs)에 같은 helper를 연결했습니다. 루트 value만 읽는 중간 수정은 루트 composedValid=true여도 B0·BN 객체 host에 lazy 합성을 남겨 네 장면에서 실패했으므로 채택하지 않았습니다.

[check-mount-readiness.mjs](../../../bench/distEngine/check-mount-readiness.mjs)는 실제 로컬 0.16.1과 current dist로 adapter·first-batch 두 표면을 검사합니다. public find/value/children 또는 await로 상태를 바꾸기 **전에** root/host strategy의 expired·locked·composedValid를 확인합니다. 이어 전체 값·모든 자식 이름/경로/값·키 순서·caller 불변, drain 뒤 관측·callback 안정성을 검사합니다. private 상태는 이 고정 legacy dist의 반례를 잡는 진단이며 제품 API 계약으로 추가하지 않습니다.

| 실제 실행 단계 | Node adapter | Node first-batch | Bun adapter | Bun first-batch |
| --- | --- | --- | --- | --- |
| 보정 전 red | 통과 16 / 미지원 4 / 실패 12 | 통과 16 / 미지원 4 / 실패 12 | 통과 16 / 미지원 4 / 실패 12 | 통과 16 / 미지원 4 / 실패 12 |
| 루트만 읽는 중간 반례 | 통과 24 / 미지원 4 / 실패 4 | 통과 24 / 미지원 4 / 실패 4 | 통과 24 / 미지원 4 / 실패 4 | 통과 24 / 미지원 4 / 실패 4 |
| 최종 green | 통과 28 / 미지원 4 / 실패 0 | 통과 28 / 미지원 4 / 실패 0 | 통과 28 / 미지원 4 / 실패 0 | 통과 28 / 미지원 4 / 실패 0 |

red는 실제 종료 코드 1로 `lazy-composition-at-clock-boundary`를 기록했고, 최종 green은 네 명령 모두 종료 코드 0입니다. 작업 폴더 루트에서 실행한 명령은 다음과 같습니다. Node는 v26.12.0의 native TypeScript를 사용했습니다.

```sh
{node-home}/bin/node packages/canard/schema-form/bench/distEngine/check-mount-readiness.mjs
{node-home}/bin/node packages/canard/schema-form/bench/distEngine/check-mount-readiness.mjs --surface=first-batch
bun packages/canard/schema-form/bench/distEngine/check-mount-readiness.mjs
bun packages/canard/schema-form/bench/distEngine/check-mount-readiness.mjs --surface=first-batch
```

최종 green 원본 폴더는 위 순서로 `mount-readiness-guard-lglNOS`, `mount-readiness-guard-DH9pvl`, `mount-readiness-guard-DT6bch`, `mount-readiness-guard-VLgrKt`입니다. red·중간 반례·green result.json을 새 창의 `guard-evidence/`에 별도 복사했고 manifest의 hash·surface·runtime·source hash로 연결합니다. 기준214의 보정 전 canonical 파일과 234의 보정 후 파일도 보존했습니다. 최종 loader SHA-256은 `343857dd924916ef59c369033bf654692506cb3024022a8a61065385ed8f8f7d`, canonical bench-common은 `2c28118bafe1b429d78a6840649acd38874ce46ddeb792ba0e7146a199b8ef95`입니다.

이는 이 지원 fixture의 공개 값 준비 가드입니다. 전체 실제 제품 event/payload/revision 차등·다른 스키마·다른 런타임·M3 Form 렌더까지 검증했다고 주장하지 않습니다. 원래 raw dist와 첫 창 실행 파일·원자료는 변경하지 않았습니다.

## 새 창의 관측 완료 core mount

보정 커밋 **`234d88ce0bb059eea47c11b7227cb871e1b19fbc`**, 제품 기준 **`214534c2f6e820f58cadf75f03828196a6c9760a`**에서 별도 조용한 창을 열고 닫았습니다: **2026-10-18T11:49:39.642Z → 2026-10-18T11:52:05.641Z UTC**. Node v26.12.0·Bun 1.4.3·arm64·production이며 Node1→Bun1→Node2→Bun2의 네 명령을 직렬 실행했습니다. 두 번째 바퀴는 판·장면 역순입니다. 동일한 스키마·입력 16장면을 사용하며 T0 표기·array T items·T0 terminal 판별의 복사본 정렬도 유지했습니다.

판·장면·바퀴마다 준비 20회·표본 100회입니다. 스키마·입력 작성과 복제는 시간 밖입니다. 타이머는 core factory 직전부터 **후위 공개 값 materialization을 끝낸 factory 반환과 마지막 mount onChange 중 늦은 시점**까지입니다. 양 판에 같은 관측 순회 비용이 들어갑니다. runner는 추가 public 읽기보다 먼저 종료 직후 지연 합성 상태를 기록합니다. 모든 지원 표본에서 lazy 미완료·비동기 종료는 0건이며 시간 밖 fullCheck·전체 snapshot을 drain 전후 대조했습니다. timer polling 대기는 더하지 않습니다. current callback은 표본당 1회(총6,400회), legacy는 0회이고 drain 뒤에도 같았습니다.

ms는 **두 바퀴 중앙값의 평균 [최소–최대]**, ±%는 **바퀴마다 (current/legacy−1)×100을 구한 평균 [최소–최대]**입니다. 평균 ms끼리 나눈 비율과 다를 수 있습니다. 범위는 신뢰구간이 아니며 작은 장면의 바퀴 차이가 큽니다. 배열 T0/B0는 legacy 미지원입니다.

| 런타임 | 장면 | 0.16.1 완료 ms [바퀴 범위] | current 완료 ms [바퀴 범위] | current/0.16.1 ±% [바퀴 범위] |
| --- | --- | ---: | ---: | ---: |
| Node v26.12.0 | object/T N=100 | 0.1475 [0.1244–0.1706] | 0.2663 [0.2001–0.3325] | +92.3 [+17.3–+167.3] |
| Node v26.12.0 | object/T N=1,000 | 1.9853 [1.9651–2.0054] | 0.1965 [0.1898–0.2032] | -90.1 [-90.5–-89.7] |
| Node v26.12.0 | object/B0 N=100 | 0.0878 [0.0472–0.1285] | 0.2068 [0.1301–0.2835] | +251.1 [+1.3–+500.9] |
| Node v26.12.0 | object/B0 N=1,000 | 0.0469 [0.0397–0.0541] | 0.9511 [0.9375–0.9648] | +1972.2 [+1684.6–+2259.8] |
| Node v26.12.0 | object/B1 N=100 | 0.2034 [0.0910–0.3159] | 0.3605 [0.3127–0.4082] | +136.5 [+29.2–+243.8] |
| Node v26.12.0 | object/B1 N=1,000 | 1.4598 [1.4324–1.4873] | 0.8272 [0.7695–0.8850] | -43.4 [-46.3–-40.5] |
| Node v26.12.0 | object/BN N=100 | 0.2326 [0.2187–0.2465] | 0.9851 [0.9180–1.0522] | +326.8 [+272.4–+381.2] |
| Node v26.12.0 | object/BN N=1,000 | 1.9444 [1.8559–2.0330] | 6.6765 [6.3900–6.9631] | +243.4 [+242.5–+244.3] |
| Node v26.12.0 | array/T N=1,000 | 0.9516 [0.9443–0.9588] | 0.1115 [0.1088–0.1141] | -88.3 [-88.6–-87.9] |
| Node v26.12.0 | array/T N=8,000 | 37.5503 [37.2728–37.8279] | 0.1507 [0.1352–0.1662] | -99.6 [-99.6–-99.6] |
| Node v26.12.0 | array/T0 N=1,000 | 미지원 | 0.1582 [0.0901–0.2263] | 미지원 |
| Node v26.12.0 | array/T0 N=8,000 | 미지원 | 0.1731 [0.1228–0.2234] | 미지원 |
| Node v26.12.0 | array/B0 N=1,000 | 미지원 | 0.5140 [0.4998–0.5282] | 미지원 |
| Node v26.12.0 | array/B0 N=8,000 | 미지원 | 2.0307 [1.9377–2.1237] | 미지원 |
| Node v26.12.0 | array/BN N=1,000 | 0.9768 [0.9700–0.9835] | 3.1812 [3.1510–3.2115] | +225.7 [+224.8–+226.5] |
| Node v26.12.0 | array/BN N=8,000 | 11.2643 [10.7219–11.8068] | 30.5530 [29.8573–31.2488] | +172.2 [+152.9–+191.4] |
| Bun 1.4.3 | object/T N=100 | 0.1213 [0.0549–0.1877] | 0.2691 [0.2095–0.3287] | +178.5 [+75.1–+281.9] |
| Bun 1.4.3 | object/T N=1,000 | 0.6926 [0.6199–0.7654] | 0.2382 [0.1327–0.3436] | -66.8 [-78.6–-55.1] |
| Bun 1.4.3 | object/B0 N=100 | 0.0856 [0.0770–0.0941] | 0.5140 [0.4669–0.5611] | +512.3 [+396.1–+628.5] |
| Bun 1.4.3 | object/B0 N=1,000 | 0.1401 [0.1397–0.1404] | 0.4750 [0.4456–0.5043] | +239.1 [+217.3–+260.9] |
| Bun 1.4.3 | object/B1 N=100 | 0.1474 [0.0824–0.2124] | 0.1986 [0.1600–0.2373] | +52.9 [+11.7–+94.1] |
| Bun 1.4.3 | object/B1 N=1,000 | 0.6950 [0.6196–0.7703] | 0.6270 [0.6069–0.6471] | -8.4 [-21.2–+4.4] |
| Bun 1.4.3 | object/BN N=100 | 0.1796 [0.1310–0.2282] | 0.6183 [0.5827–0.6539] | +265.7 [+186.5–+344.8] |
| Bun 1.4.3 | object/BN N=1,000 | 1.3931 [1.2821–1.5041] | 4.0709 [4.0678–4.0740] | +194.1 [+170.9–+217.3] |
| Bun 1.4.3 | array/T N=1,000 | 2.1637 [2.0229–2.3046] | 0.1498 [0.0975–0.2022] | -93.2 [-95.2–-91.2] |
| Bun 1.4.3 | array/T N=8,000 | 90.7134 [90.5807–90.8461] | 0.1977 [0.1580–0.2373] | -99.8 [-99.8–-99.7] |
| Bun 1.4.3 | array/T0 N=1,000 | 미지원 | 0.1337 [0.1157–0.1518] | 미지원 |
| Bun 1.4.3 | array/T0 N=8,000 | 미지원 | 0.2125 [0.1486–0.2764] | 미지원 |
| Bun 1.4.3 | array/B0 N=1,000 | 미지원 | 0.2546 [0.2432–0.2659] | 미지원 |
| Bun 1.4.3 | array/B0 N=8,000 | 미지원 | 1.3564 [1.0594–1.6534] | 미지원 |
| Bun 1.4.3 | array/BN N=1,000 | 0.8295 [0.7614–0.8975] | 2.4885 [2.2472–2.7299] | +199.6 [+195.1–+204.2] |
| Bun 1.4.3 | array/BN N=8,000 | 6.1943 [6.1556–6.2330] | 22.6071 [22.0399–23.1744] | +265.0 [+253.6–+276.5] |

지원 시간 표본 **11,200개**, 준비 **2,240회**, 지원 행 **112개**, 미지원 행 **16개**입니다. 값·자식·경로·순서·caller 불변·drain 안정성과 종료 직후 상태 검사는 11,200표본 모두 통과했습니다. B0 객체/1,000은 Node +1972.2%·Bun +239.1%, BN 객체/1,000은 +243.4%·+194.1%이지만 새 회귀 수용이나 제품 최적화 예상 절감률을 정하지 않습니다. 첫 창과의 차이도 보정의 성능 개선/악화로 계산하지 않습니다.

새 원자료·도구·사본은 **`{tmp}/mount-breakdown-completed-task_7e0e67a1893f`**에 있습니다. `complete-{node,bun}-{1,2}.json`과 `.err`, `window.json`, `manifest.json`, `analysis-completed.json`을 보존합니다. 창 진입 명령은 `{node-home}/bin/node {tmp}/mount-breakdown-completed-task_7e0e67a1893f/window.mjs`이며 재현은 새 TMPDIR에서 해야 합니다. raw dist SHA는 위 표와 같습니다. source·canonical·Winglet 603개·기존 원자료 138개·첫 창 파일 58개 해시가 모두 유지됐습니다. **실제 실행 도구의 identity는 각 window.json.scriptHashes**이며, 첫 창 manifest의 준비 중 generated snapshot보다 실제 window 해시를 우선합니다.

### 창 밖의 패키지 검사

새 창 전 11:38:40.167Z–11:41:19.346Z에 아래 명령을 순차 실행했고 모두 종료 코드 0입니다. **759파일·4,785시험 통과, 기존 todo 1개, 120.22초**이며 unit/render/storybook을 포함합니다. 기존 기대값 변경·검사 생략은 없습니다. build 뒤 current dist 해시도 같았으며 추적 빌드 변경은 없었습니다. 게이트 runner Node v24.20.0은 측정 런타임과 구별합니다.

```sh
yarn workspace @canard/schema-form typecheck
yarn workspace @canard/schema-form lint
yarn workspace @canard/schema-form test --run
yarn workspace @canard/schema-form build
```

원본 로그는 `{tmp}/mount-readiness-gates-task_7e0e67a1893f`이며 새 폴더의 `package-gates/`에도 복사했습니다. guard·loader의 Prettier check와 first-batch common의 Node syntax check도 통과했습니다. 모든 빌드·게이트는 측정 창 밖입니다.

## 계측의 포괄·배타 합계와 유효 범위

이 절부터의 시간 분해와 호출 계수는 **첫 창의 current factory-only 경계**입니다. 새 완료 경계의 순회 비용은 포함하지 않으며 새 total의 성분으로 바꾸지 않습니다.

scratch current 사본의 함수 진입·반환만 감쌌고 제품 알고리즘은 치환하지 않았습니다. timer는 현재 호출 stack의 자식 포괄 시간을 부모에서 빼서 exclusiveMs를 만들고 각 배타 시간을 단계에 한 번만 배정합니다. 같은 함수의 재귀 포괄 값은 가장 바깥 호출만 합칩니다. blueprint·loadFieldNodeAtMount·selectChildren 같은 부모의 포괄 시간을 자식 시간과 합산하지 않습니다. `other = 측정 envelope − 배타 단계 합`은 timer 경계 밖의 wiring·루트 runtime 준비 등을 포함하며 특정 함수의 비용으로 추정하지 않습니다.

아래 셀은 **계측 표본 200개 전체의 평균 ms / 계측 총합 점유 %**입니다. 표의 계측 합과 셀들은 같은 표본을 산술 합산하므로 서로 더할 수 있지만, 비계측 중앙값이나 옛 판과의 ms 격차 성분으로 더하지 않습니다. 부하는 각 바퀴의 `(계측 중앙값/비계측 current 중앙값 − 1) × 100` 평균 [범위]입니다. 총 17600개 시간 표본과 호출 계수용 32개 확인을 분리했습니다.

계측 부담은 timer 자체와 JIT·GC·실행 순서 변동을 분리한 순수 비용이 아닙니다. 보수적인 해석 필터로 어느 바퀴든 비계측 대비 −20% 미만 또는 +50% 초과면 그 장면의 분해를 **폐기**합니다. 이는 사전 등록한 통계 합격선이나 TEST-027의 성능 게이트가 아니며, 숫자가 남아 있어도 해석 근거로 쓰지 않는 사후 보고 규칙입니다. 필터 안의 행도 방향 단서일 뿐 생산 시간의 정확한 분율이나 달성 가능한 절감량이 아닙니다. 성긴 계측과 세부 계측의 서로 다른 포함 관계까지 확인합니다.

### 성긴 계측

record는 createFieldNode의 경로·유효 스키마 준비와 생성자를 함께 포함합니다. loadOther는 extras·assembly·record·commit을 뺀 loadFieldNodeAtMount 내부이고, 상세한 선택·표시·계산 비용은 아직 그 안에 있습니다. commit은 commitSettlement 포괄 범위만이며 finishSettlement의 나머지는 loadOther에 남습니다.

| 런타임·장면 | 계측 합 mean ms | 부담 ±% [범위] | 판정 | blueprint | record | extras | assembly | commit | loadOther | delivery | other |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Node v26.12.0 object-B0-mount-N100 | 0.2307 | -22.2 [-46.3–+1.8] | 폐기 | — | — | — | — | — | — | — | — |
| Node v26.12.0 object-B0-mount-N1000 | 1.0981 | +25.1 [+10.2–+39.9] | 방향 단서 | 0.0480 / 4.4% | 0.0043 / 0.4% | 0.4196 / 38.2% | 0.5161 / 47.0% | 0.0322 / 2.9% | 0.0578 / 5.3% | 0.0037 / 0.3% | 0.0166 / 1.5% |
| Node v26.12.0 object-BN-mount-N100 | 1.1137 | +11.0 [-1.5–+23.5] | 방향 단서 | 0.5055 / 45.4% | 0.0423 / 3.8% | 0.0030 / 0.3% | 0.0204 / 1.8% | 0.1751 / 15.7% | 0.3446 / 30.9% | 0.0090 / 0.8% | 0.0138 / 1.2% |
| Node v26.12.0 object-BN-mount-N1000 | 6.6628 | +1.0 [-0.5–+2.4] | 방향 단서 | 3.0789 / 46.2% | 0.2208 / 3.3% | 0.0208 / 0.3% | 0.2140 / 3.2% | 0.9580 / 14.4% | 2.1004 / 31.5% | 0.0476 / 0.7% | 0.0222 / 0.3% |
| Node v26.12.0 array-B0-mount-N1000 | 0.5255 | -20.4 [-61.8–+21.0] | 폐기 | — | — | — | — | — | — | — | — |
| Node v26.12.0 array-B0-mount-N8000 | 2.2163 | -8.7 [-10.2–-7.2] | 방향 단서 | 0.0348 / 1.6% | 0.0021 / 0.1% | 0.0035 / 0.2% | 0.1600 / 7.2% | 0.0213 / 1.0% | 1.9806 / 89.4% | 0.0025 / 0.1% | 0.0114 / 0.5% |
| Node v26.12.0 array-BN-mount-N1000 | 3.2573 | +4.9 [+3.6–+6.2] | 방향 단서 | 0.0573 / 1.8% | 0.2019 / 6.2% | 0.0013 / 0.0% | 0.0356 / 1.1% | 0.8880 / 27.3% | 2.0177 / 61.9% | 0.0412 / 1.3% | 0.0143 / 0.4% |
| Node v26.12.0 array-BN-mount-N8000 | 31.1313 | +5.4 [+3.0–+7.8] | 방향 단서 | 0.0917 / 0.3% | 2.0172 / 6.5% | 0.0023 / 0.0% | 0.5337 / 1.7% | 9.0468 / 29.1% | 19.0091 / 61.1% | 0.4020 / 1.3% | 0.0286 / 0.1% |
| Bun 1.4.3 object-B0-mount-N100 | 0.2303 | -18.5 [-40.9–+4.0] | 폐기 | — | — | — | — | — | — | — | — |
| Bun 1.4.3 object-B0-mount-N1000 | 0.6536 | +17.6 [-20.3–+55.4] | 폐기 | — | — | — | — | — | — | — | — |
| Bun 1.4.3 object-BN-mount-N100 | 0.6412 | -2.5 [-3.5–-1.5] | 방향 단서 | 0.2574 / 40.1% | 0.0258 / 4.0% | 0.0019 / 0.3% | 0.0057 / 0.9% | 0.1194 / 18.6% | 0.2115 / 33.0% | 0.0076 / 1.2% | 0.0120 / 1.9% |
| Bun 1.4.3 object-BN-mount-N1000 | 4.4003 | +5.0 [+1.7–+8.2] | 방향 단서 | 1.9869 / 45.2% | 0.2024 / 4.6% | 0.0330 / 0.7% | 0.0589 / 1.3% | 0.6418 / 14.6% | 1.4169 / 32.2% | 0.0406 / 0.9% | 0.0198 / 0.4% |
| Bun 1.4.3 array-B0-mount-N1000 | 0.1953 | +9.6 [+8.0–+11.2] | 방향 단서 | 0.0290 / 14.9% | 0.0016 / 0.8% | 0.0025 / 1.3% | 0.0356 / 18.2% | 0.0174 / 8.9% | 0.0973 / 49.9% | 0.0025 / 1.3% | 0.0093 / 4.8% |
| Bun 1.4.3 array-B0-mount-N8000 | 1.1411 | +3.1 [+2.5–+3.8] | 방향 단서 | 0.0570 / 5.0% | 0.0028 / 0.2% | 0.0054 / 0.5% | 0.6321 / 55.4% | 0.0259 / 2.3% | 0.3987 / 34.9% | 0.0036 / 0.3% | 0.0157 / 1.4% |
| Bun 1.4.3 array-BN-mount-N1000 | 2.7714 | +0.7 [-6.2–+7.6] | 방향 단서 | 0.0536 / 1.9% | 0.2583 / 9.3% | 0.0017 / 0.1% | 0.0621 / 2.2% | 0.6335 / 22.9% | 1.7110 / 61.7% | 0.0365 / 1.3% | 0.0147 / 0.5% |
| Bun 1.4.3 array-BN-mount-N8000 | 22.8298 | +1.2 [+0.3–+2.0] | 방향 단서 | 0.0921 / 0.4% | 1.8210 / 8.0% | 0.0033 / 0.0% | 1.0283 / 4.5% | 4.6583 / 20.4% | 14.9837 / 65.6% | 0.2040 / 0.9% | 0.0391 / 0.2% |

### 세부 계측

blueprint는 buildNodes·선언 수집·정적 병합·검증의 배타 합입니다. record에는 mergeEffectiveSchema 호출 자체의 배타 시간도 포함하므로 객체 생성만의 비용이 아닙니다. selection은 selectChildren·primeHost·declareArrayChildren에서 재귀 입력·계산·레코드 생성 등을 뺀 시간, assembly는 computeNode·computeStableNode·updateOutput·객체/배열 합성의 나머지입니다. commit은 finishSettlement·transitionSettlement·commitSettlement·각 commit helper의 배타 합입니다. 그 때문에 성긴 표와 단계 몫을 같은 정의라고 비교하지 않습니다.

| 런타임·장면 | 계측 합 mean ms | 부담 ±% [범위] | 판정 | blueprint | record | extras | admission | selection | assembly | commit | loadOther | delivery | other |
| --- | ---: | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Node v26.12.0 object-B0-mount-N100 | 0.1839 | -30.5 [-47.8–-13.2] | 폐기 | — | — | — | — | — | — | — | — | — | — |
| Node v26.12.0 object-B0-mount-N1000 | 1.0917 | +28.9 [+9.1–+48.7] | 방향 단서 | 0.0519 / 4.8% | 0.0086 / 0.8% | 0.4132 / 37.8% | 0.0077 / 0.7% | 0.0164 / 1.5% | 0.5154 / 47.2% | 0.0470 / 4.3% | 0.0134 / 1.2% | 0.0032 / 0.3% | 0.0150 / 1.4% |
| Node v26.12.0 object-BN-mount-N100 | 1.2293 | +19.7 [+14.4–+25.1] | 방향 단서 | 0.5468 / 44.5% | 0.0852 / 6.9% | 0.0026 / 0.2% | 0.0794 / 6.5% | 0.2151 / 17.5% | 0.0891 / 7.2% | 0.1810 / 14.7% | 0.0109 / 0.9% | 0.0071 / 0.6% | 0.0123 / 1.0% |
| Node v26.12.0 object-BN-mount-N1000 | 8.2094 | +24.5 [+20.4–+28.6] | 방향 단서 | 3.6687 / 44.7% | 0.5796 / 7.1% | 0.0207 / 0.3% | 0.5872 / 7.2% | 1.6076 / 19.6% | 0.6168 / 7.5% | 1.0468 / 12.8% | 0.0177 / 0.2% | 0.0427 / 0.5% | 0.0217 / 0.3% |
| Node v26.12.0 array-B0-mount-N1000 | 0.5800 | -22.4 [-48.4–+3.6] | 폐기 | — | — | — | — | — | — | — | — | — | — |
| Node v26.12.0 array-B0-mount-N8000 | 2.2717 | -8.5 [-12.5–-4.5] | 방향 단서 | 0.0419 / 1.8% | 0.0050 / 0.2% | 0.0036 / 0.2% | 0.0051 / 0.2% | 1.9846 / 87.4% | 0.1733 / 7.6% | 0.0340 / 1.5% | 0.0106 / 0.5% | 0.0024 / 0.1% | 0.0111 / 0.5% |
| Node v26.12.0 array-BN-mount-N1000 | 3.9569 | +28.6 [+25.7–+31.4] | 방향 단서 | 0.0654 / 1.7% | 0.4157 / 10.5% | 0.0013 / 0.0% | 0.4994 / 12.6% | 1.4990 / 37.9% | 0.4365 / 11.0% | 0.9757 / 24.7% | 0.0125 / 0.3% | 0.0364 / 0.9% | 0.0150 / 0.4% |
| Node v26.12.0 array-BN-mount-N8000 | 38.2895 | +30.2 [+29.6–+30.7] | 방향 단서 | 0.1028 / 0.3% | 3.6299 / 9.5% | 0.0024 / 0.0% | 4.9177 / 12.8% | 14.0911 / 36.8% | 4.4805 / 11.7% | 10.4376 / 27.3% | 0.0221 / 0.1% | 0.5771 / 1.5% | 0.0284 / 0.1% |
| Bun 1.4.3 object-B0-mount-N100 | 0.2838 | -28.6 [-47.6–-9.7] | 폐기 | — | — | — | — | — | — | — | — | — | — |
| Bun 1.4.3 object-B0-mount-N1000 | 0.7579 | +20.2 [+12.9–+27.5] | 방향 단서 | 0.0773 / 10.2% | 0.0111 / 1.5% | 0.2205 / 29.1% | 0.0170 / 2.2% | 0.0190 / 2.5% | 0.2825 / 37.3% | 0.0832 / 11.0% | 0.0217 / 2.9% | 0.0049 / 0.7% | 0.0205 / 2.7% |
| Bun 1.4.3 object-BN-mount-N100 | 0.9360 | +40.3 [+27.4–+53.2] | 폐기 | — | — | — | — | — | — | — | — | — | — |
| Bun 1.4.3 object-BN-mount-N1000 | 5.6387 | +38.0 [+37.8–+38.2] | 방향 단서 | 2.2579 / 40.0% | 0.5133 / 9.1% | 0.0408 / 0.7% | 0.4909 / 8.7% | 1.0961 / 19.4% | 0.3496 / 6.2% | 0.8060 / 14.3% | 0.0261 / 0.5% | 0.0364 / 0.6% | 0.0215 / 0.4% |
| Bun 1.4.3 array-B0-mount-N1000 | 0.2538 | +27.3 [+25.2–+29.4] | 방향 단서 | 0.0385 / 15.2% | 0.0057 / 2.2% | 0.0029 / 1.1% | 0.0070 / 2.8% | 0.0834 / 32.8% | 0.0538 / 21.2% | 0.0361 / 14.2% | 0.0122 / 4.8% | 0.0031 / 1.2% | 0.0112 / 4.4% |
| Bun 1.4.3 array-B0-mount-N8000 | 1.2934 | +19.3 [+9.4–+29.3] | 방향 단서 | 0.0620 / 4.8% | 0.0075 / 0.6% | 0.0058 / 0.4% | 0.0084 / 0.7% | 0.4882 / 37.7% | 0.6393 / 49.4% | 0.0461 / 3.6% | 0.0162 / 1.3% | 0.0039 / 0.3% | 0.0161 / 1.2% |
| Bun 1.4.3 array-BN-mount-N1000 | 3.3865 | +25.3 [+21.1–+29.6] | 방향 단서 | 0.0638 / 1.9% | 0.4275 / 12.6% | 0.0019 / 0.1% | 0.4308 / 12.7% | 1.2448 / 36.8% | 0.3741 / 11.0% | 0.7797 / 23.0% | 0.0239 / 0.7% | 0.0248 / 0.7% | 0.0151 / 0.4% |
| Bun 1.4.3 array-BN-mount-N8000 | 27.6158 | +27.3 [+25.3–+29.3] | 방향 단서 | 0.1237 / 0.4% | 2.9697 / 10.8% | 0.0086 / 0.0% | 3.1936 / 11.6% | 11.7445 / 42.5% | 3.3028 / 12.0% | 5.9581 / 21.6% | 0.0329 / 0.1% | 0.2466 / 0.9% | 0.0352 / 0.1% |

함수 포괄과 배타의 차이는 다음과 같습니다. 모두 세부 계측의 같은 200표본 평균이며 줄 사이의 포괄 시간을 더하지 않습니다.

| 런타임·장면 | 함수 | 포괄 mean ms | 배타 mean ms | 호출 수 [min–max] |
| --- | --- | ---: | ---: | ---: |
| Node v26.12.0 object-B0-mount-N1000 | `loadFieldNodeAtMount` | 1.0185 | 0.0018 | 1 [1–1] |
| Node v26.12.0 object-B0-mount-N1000 | `nextExtras` | 0.4132 | 0.4132 | 2 [2–2] |
| Node v26.12.0 object-B0-mount-N1000 | `assembleObject` | 0.5033 | 0.5033 | 2 [2–2] |
| Node v26.12.0 object-BN-mount-N1000 | `blueprint` | 3.6687 | 0.1848 | 1 [1–1] |
| Node v26.12.0 object-BN-mount-N1000 | `buildNodes` | 3.4303 | 1.5965 | 1002 [1002–1002] |
| Node v26.12.0 object-BN-mount-N1000 | `getTemplateKey` | 0.3525 | 0.3525 | 1002 [1002–1002] |
| Node v26.12.0 object-BN-mount-N1000 | `mergeSchemaContributions` | 0.3222 | 0.3222 | 1002 [1002–1002] |
| Node v26.12.0 object-BN-mount-N1000 | `createFieldNode` | 0.3885 | 0.2850 | 1002 [1002–1002] |
| Node v26.12.0 object-BN-mount-N1000 | `selectChildren` | 3.3930 | 1.6076 | 2 [2–2] |
| Node v26.12.0 object-BN-mount-N1000 | `commitSettlement` | 0.9133 | 0.0308 | 1 [1–1] |
| Node v26.12.0 array-B0-mount-N8000 | `selectChildren` | 2.1565 | 0.0168 | 2 [2–2] |
| Node v26.12.0 array-B0-mount-N8000 | `declareArrayChildren` | 1.9677 | 1.9677 | 1 [1–1] |
| Node v26.12.0 array-B0-mount-N8000 | `assembleArray` | 0.1596 | 0.1596 | 1 [1–1] |
| Bun 1.4.3 array-B0-mount-N8000 | `selectChildren` | 1.1208 | 0.0198 | 2 [2–2] |
| Bun 1.4.3 array-B0-mount-N8000 | `declareArrayChildren` | 0.4683 | 0.4683 | 1 [1–1] |
| Bun 1.4.3 array-B0-mount-N8000 | `assembleArray` | 0.6174 | 0.6174 | 1 [1–1] |

배타 단계 합은 원시 `capturedMs`와 6,400개 계측 표본 모두에서 오차 0 ms이며 음수 remainder는 0건입니다. 반올림한 표는 0.1% 또는 소수 마지막 자리 오차가 있을 수 있습니다. 이전 첫 묶음의 촘촘 계측·약 15배 배열 분해는 재사용하지 않았습니다. 이번 배열 중 Node B0/1000의 성긴·세부 분해는 큰 음의 차이 때문에 폐기합니다. Node B0/8000과 BN 배열 등 필터 안의 이번 새 계측도 정확한 제거 가능 비율로 승격하지 않습니다.

## 별도 호출 계수와 비용의 계약 분류

counts 사본은 함수 타이머 없이 같은 코드를 실행하고 진입 수만 셉니다. 각 런타임·바퀴당 한 번의 correctness 확인이며 그 시간은 성능 근거가 아닙니다. nextExtras의 결과 Object.keys는 원래 호출을 그대로 실행한 반환 배열의 길이만 세어 추가 키 순회를 만들지 않았습니다. 아래 계수는 Node·Bun과 정·역순 네 실행에서 모두 같은 정확한 값입니다. 회귀 시험으로 옮길 때는 이 숫자를 고정하기보다 N과 무관한 호출 상한으로 작성해야 합니다.

| 장면 | buildNodes | createFieldNode | mergeEffectiveSchema | getItemEntries | nextExtras 결과 키 열거 수/반환 키 수 | writeObjectKey |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| object-B0-mount-N100 | 2 | 2 | 5 | 0 | 2/100 | 201 |
| object-B0-mount-N1000 | 2 | 2 | 5 | 0 | 2/1000 | 2001 |
| object-BN-mount-N100 | 102 | 102 | 305 | 0 | 2/0 | 101 |
| object-BN-mount-N1000 | 1002 | 1002 | 3005 | 0 | 2/0 | 1001 |
| array-B0-mount-N1000 | 2 | 2 | 5 | 1000 | 1/0 | 1 |
| array-B0-mount-N8000 | 2 | 2 | 5 | 8000 | 1/0 | 1 |
| array-BN-mount-N1000 | 3 | 1002 | 2005 | 1000 | 1/0 | 1 |
| array-BN-mount-N8000 | 3 | 8002 | 16005 | 8000 | 1/0 | 1 |

모든 이 표의 장면은 blueprint 1·writeFieldNode 1·loadStaticFirstTree 0·commitSettlement 1·runDeliveryWaves 1·flushQueuedEvents 1입니다. 객체 BN은 N+2개의 서로 다른 선언 occurrence를 만들며, 배열 BN은 청사진 템플릿 3개를 N+2개의 런타임 occurrence로 펼칩니다. 청사진 수와 실제 노드 수를 혼동하지 않습니다.

| 의미 있는 몫 | 분류 | 현행 계약과 남는 판단 |
| --- | --- | --- |
| B0 입력 보관·출력 소유·키 순서 | (a) 지킬 결과 + (b) 바꿀 수 있는 순회 | [VALUE-002](../../ledger/value.md), [WRITE-013](../../ledger/write.md), [SETTLE-042·043](../../ledger/settle.md)는 caller 입력 불변·Merge·안정된 순서·참조 되살림을 요구합니다. nextExtras의 결과 키 재열거나 assembleObject의 names/seen라는 중간 표현 자체를 요구하지 않습니다. 입력 참조 재사용(v1)은 400·405라운드대로 폐기 상태입니다. |
| itemless 배열의 N번 빈 선언 조회 | (b) 현재 알고리즘 | 선언이 없으면 자식 0이라는 결과는 필요하나, 모든 자리에서 같은 부재를 다시 조회할 필요는 원장으로 정해지지 않았습니다. 기존 LAST/ENTRIES와 per-slot 빈 배열은 코드의 메모 표현입니다. 출력·extras·snapshot 사본은 별개로 남습니다. |
| BN의 eagerly committed 발생·값·revision·배달 | (a) 지킬 결과 + (b) 미확정 구현 | [SETTLE-001](../../ledger/settle.md)의 89C-01은 후위 조립·한 commit 번호·첫 리스너 전 전체 revision/payload를 허용합니다. N+2 발생의 공개 접근성과 결과는 보존해야 하지만 현재 per-node allocation 수·Map 수·반복문이 모두 필수라는 증명은 아닙니다. |
| BN 객체의 청사진 1002회 buildNodes와 current 준비 | (b) 알고리즘, 폼 독립성은 (a) | 같은 스키마의 폼 간 공유는 [398라운드](../../reviews/round-398-owner-answers.md)에서 지금 하지 않기로 닫혔습니다. 그 결정은 모든 현재 정적 병합·키 생성·검증 통과가 최소라는 증명은 아닙니다. 전체 blueprint 비용을 없앨 수 있다고 제안하지 않습니다. |
| 게이트 고정점·평가 순서 | (a), 이번 시간 몫은 (c) 미검증 | SETTLE-018의 충돌 주석은 직전 active를 평가 순서 힌트로도 쓰지 않는 SETTLE-050이 우선함을 명시합니다. SETTLE-020·BLUEPRINT-007의 96C-01·97C-01은 승인된 정확한 꼴·되돌림·즉시 반영·그림자 대조를 조건으로 하므로 '게이트 전부 매번 호출은 영원히 고정' 또는 '임의로 생략 가능' 모두 아닙니다. 이번 fixture는 게이트가 없어 결정 58의 조건을 세우지 못합니다. |
| 노드 바이트와 메모리 허용선 | (c) 이번에는 미검증 | [NODE-018·055](../../ledger/node.md)의 110–140/210–260 B는 추정이며 의무 record 크기가 아닙니다. 과거 수용과 400C-01의 초과 관찰이 현재 M3 수용을 대신하지 않습니다. 이번은 heap 측정이 아니므로 현재 B/node·합격을 판정하지 않습니다. |

SETTLE-001·018(충돌 포함)·020(96/97 보충 포함)·042·043, BLUEPRINT-007, NODE-018·055, VALUE-002, WRITE-013, TEST-027은 이 기준의 전체 현행 항목과 보충·충돌을 읽고 분류했습니다. DETAIL의 설계 이유만으로 '제거 불가'라고 판정하지 않았습니다. [TEST-027](../../ledger/test.md)과 410C-01에 따라 이번 보고서는 회귀를 새로 수용하지 않습니다.

## 우선순위가 있는 별도 구현 가설

1. **첫 후보 — itemless 배열의 자리별 빈 선언 조회 제거.** 근거: `src/core/engine/behaviors/arrayBehavior/branch/utils/declareArrayChildren.ts:21–33`의 count 순회와 `src/core/engine/blueprint/utils/itemEntry/getItemEntries.ts:25–30`의 후보 부재, 위의 N회 계수입니다. `src/core/engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts:247–263`는 itemCandidates를 item과 함께, prefixItemCandidates를 prefixItems와 함께 생성합니다. 최소 규칙은 불변 청사진에서 item·prefixItems 및 대응 candidate가 없음을 확정한 배열만 기존 EMPTY 선언 결과를 곧바로 쓰는 것입니다. 그 외는 현재 길을 유지합니다. 그 조회 작업만 O(N) 시간·N개의 빈 slot memo 셀에서 O(1)로 바뀔 가설이며 extras 복사·출력 합성의 O(N)은 그대로입니다. 예상 코드는 고정 자격 분기 약 2–6행이며 새로운 캐시·전역 상태·공개 이름은 없습니다. 이 범위는 제안이고 구현 diff를 검토하기 전 확정 수치가 아닙니다.
2. **둘째 — nextExtras의 비었는지 확인하기 위한 결과 키 재열거 제거.** `nextExtras.ts:26`은 이미 쓴 결과에 Object.keys(result)를 다시 만들어 length만 읽습니다. B0/1000에서 2회 호출로 결과 키 1000개를 열거합니다. 기존 복사 루프 안에서 '실제로 한 키라도 썼는지'를 호출 한정 지역값으로 기록하는 한 규칙이면 됩니다. 이 빈 판정의 O(N) 키 배열 하나만 제거하며 전체 복사·비교는 O(N)입니다. 예상 순증 약 2–4행; Merge의 기존 키, 선언 키 거름, own undefined, __proto__, 빈 값·같은 값 참조를 기존 차등과 함께 증명해야 합니다. measured extras 전체 점유를 이 한 열거의 몫으로 주장하지 않습니다.
3. **셋째 — B0 첫 객체 합성의 중간 이름/중복 집합 구성 제거.** `assembleObject.ts:161–177,236`은 자식·선호 순서가 없는 첫 합성도 빈 childValues와 names·seen을 거쳐 복사합니다. 이전 local 부재·빈 선언/자식·선호 순서 부재가 증명된 경우만 extras own 키 순서로 결과를 새로 쓰는 가설입니다. O(N)은 유지하되 중간 O(N) 이름/집합과 순회를 덜 수 있으며 분기 약 5–15행이 필요할 수 있습니다. 스키마 조각의 inactive 선언, propertyOrder, integer-like 키·__proto__·undefined, 참조와 후속 쓰기의 기존 STABLE_SHAPES 관측까지 검증하기 전에는 첫 후보보다 준비도가 낮습니다. 새 메모나 입력 alias는 제안하지 않습니다.

BN의 repeated effective-schema 조회 수(객체 3N+5·배열 2N+5)는 현재 결과가 사용되는 호출입니다. 이미 DEFAULT_NO_ACTIVE를 읽는 단순 호출도 포함하므로 '불필요한 병합 N회'라고 부르지 않습니다. 기존 기본 스키마를 전달해 조회 한 자리를 줄일 수 있는지는 각 사용처·예외·참조의 논증이 더 필요하여 아직 실행 가능한 가설 목록에 넣지 않았습니다. 정적 첫 로드의 자격을 caller 입력으로 넓히는 일도 별도 큰 증명이 필요하며 이번 작은 변경안에 섞지 않습니다.

### 첫 후보의 정확한 가드와 남는 모호함

현재 [L3-b append 시험](../../../src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-extras-append.test.ts)과 [static-first-load 시험](../../../src/core/engine/settle/loadFieldNodeAtMount/__tests__/static-first-load.test.ts)은 각각 append와 정적 첫 로드를 지킵니다. 이번 caller snapshot의 **범용 mount에서 N과 무관한 빈 선언 조회 상한**은 이번 보고서의 계수일 뿐 영속 회귀 가드가 아닙니다.

자격은 원본 `jsonSchema.items`가 없다는 검사로 정하지 않습니다. 실제 `node.blueprintNode`가 합성된 뒤 item·prefixItems와 대응 후보가 모두 없다는 증명이어야 합니다. `oneOf/allOf/then/else/controls`의 기여나 아직 비활성인 조각에서 items가 생기는 경우, tuple/prefixItems와 additionalItems 기여를 모두 포함해 부재를 확인해야 하며 현재 활성 분기만 비어 있다는 이유로 허용하지 않습니다. `getItemEntries.ts:25–30`의 모든 후보 선택 경로가 모든 비음수 자리에서 빈 결과임을 `populateNodeChildren.ts:247–263`의 생성 불변과 함께 증명해야 합니다. 확정하지 못한 경우는 기존 선언 경로로 되돌립니다.

첫 로드·명시적 defaultValue·스키마 기본값에서 온 입력을 구별하고, 자동 쓰기 억제/허용, 비배열·null/wrong-kind에서도 이후 선택·정착·EMPTY 결과와 source metadata가 같음을 대조해야 합니다. 기존 EMPTY는 declareChildren의 내부 결과일 뿐 공개 children 참조를 새로 정의하는 근거가 아닙니다. 빈 children의 참조·UpdateChildren 사건·모든 revision 및 commit은 각각 기존 기준 dist의 관측대로 보존해야 합니다.

별도 구현 PR의 실패해야 하는 새 가드는 items·prefixItems가 없는 배열을 N=1,000/8,000의 서로 다른 새 청사진으로 mount하고, getItemEntries 호출에 같은 작은 상한을 둡니다. 현행의 N회 호출은 그 상한을 넘습니다. blueprint를 폼마다 새로 만들어 기존 LAST/ENTRIES의 히트가 문제를 가리지 않게 해야 합니다. 숫자 배열뿐 아니라 빈 배열·성긴 배열·own undefined·NaN·null/wrong-kind·동결 caller·중첩 host, 후속 push/insert/remove/pop/clear/update·Overwrite/Merge·배치까지 기준 dist와 대조해야 합니다. items·prefixItems·옛 tuple·additionalItems, fragment 후보·게이트·union·재귀·terminal은 자격을 넓히지 않고 그대로 fallback해야 합니다.

비교 기록은 값·raw/local/emit/extras·키 순서, 전체 listener event/payload/순서·onChange, 모든 revision bit·commit, 선언/선택·latent/inactive/misfit·경고/진단, 보관한 children·extras·snapshot 참조의 전후 동일성을 포함해야 합니다. 첫 리스너 시점에 다른 노드의 revision/payload도 이미 확정됐는지 확인해야 합니다. 이번 숫자 mount 프로브는 이 전체 기록을 만들지 않으므로 **가드 결손**으로 남깁니다.

400C-01이 아직 미확정이라 한 '빈 배열의 새 children 참조·UpdateChildren가 계약인가 부산물인가'를 이번에 결정하지 않습니다. 첫 후보는 그 기존 관측을 그대로 보존하고 declareChildren의 내부 결과만 기존 EMPTY로 돌려주는 범위여야 합니다. 모호함을 풀어야만 가능한 변경으로 커지면 소유자에게 먼저 질문해야 합니다. 결정 58은 이 후보와 무관하며 소유자 판단으로 남깁니다.

## 잠정 M3 수용 후보

여기의 '후보'는 지금 제거 근거가 없는 잔여를 소유자에게 올릴 목록이며 수용 완료가 아닙니다. 후보 최적화 뒤 새 창에서 재측정하여 현재 수치로 갱신해야 합니다.

| 잔여 결과/비용 | 현재 수치·방향 근거 | 원장 이유와 미확정 부분 |
| --- | --- | --- |
| caller 소유권을 분리하는 B0 키 복사·출력 구성 | B0/1000의 writeObjectKey 2001회; Node 성긴 계측 extras 38.2%·assembly 47.0%, Bun 세부 계측 extras 29.1%·assembly 37.3% | VALUE-002·WRITE-013·SETTLE-042·043. 순서/소유 결과는 필요하나 모든 열거와 중간 집합이 필요한 것은 아닙니다. 비율을 비계측 절감 ms로 환산하지 않습니다. |
| BN의 eager occurrence와 commit-before-delivery | 객체/1000 및 배열/1000은 1002개 record, 배열/8000은 8002개; Node 배열/8000 성긴 commit 29.1%·Bun 20.4% | SETTLE-001과 공개 노드·revision 관측. commit 후보 자료구조나 할당 하나마다의 불가피성은 미증명입니다. |
| 폼 하나의 독립된 청사진 준비 | 객체 BN/1000의 성긴 blueprint Node 46.2%·Bun 45.2%, 배열 BN/8000은 각각 0.3%·0.4% | 398라운드에 따라 폼 간 청사진 공유는 제안하지 않습니다. 객체에서 큰 현재 정적 분석 구현이 최솟값이라는 뜻은 아닙니다. |
| source snapshot·extras·출력 배열 소유와 순서 | 새 완료 창 itemless/8000 current Node 2.0307 ms·Bun 1.3564 ms; old는 미지원 | VALUE-002·WRITE-013과 기존 L3-b 관측. 빈 선언 N회 제거 후보는 먼저 분리하고 사본의 잔여를 재측정해야 합니다. |
| 노드·청사진 메모리와 게이트 형상 비용 | 이번 heap·게이트 장면은 미측정 | NODE-018은 추정, NODE-055/TEST-027의 허용 여부는 별도 판단입니다. 과거 376 B나 약 20% 초과를 이번 현재 수치로 인용하지 않습니다. SETTLE-018/020·BLUEPRINT-007의 고정점 조건도 유지합니다. |

[이전 L3-e](l3e-direct-ownership-results.md)·[L3-b](l3b-array-append-results.md)·[L3-a](l3a-extras-plain-assignment-results.md)·[L3-c](l3c-extras-single-compare-results.md)·[L3-d](l3d-static-spec-pass-through-results.md)와 [첫 묶음](first-batch-measurement.md)은 다른 창입니다. 특히 L3-d는 중복 조회 제거이지 시간 개선이 아닙니다. 이전 창의 절대 시간과 이어 붙이거나 개선율을 누적하지 않습니다. [400C-02](../../reviews/round-400-closing.md)의 계측 해석, [인계 7–9절](../../AGENT-HANDOFF.md)의 정상 동작·가드 기준과 [398라운드](../../reviews/round-398-owner-answers.md)를 유지합니다.

## 검산과 한계

첫 창 `analyze.mjs`·`analysis.json`·`report.mjs`·`validate.py`는 당시 결과와 함께 동결했습니다. 첫 창 17,600시간 표본·계수 확인 32개·준비 3,520회·미지원 16행, 계측 표본 6,400개의 배타 합 오차 0 ms·음수 remainder 0건이라는 증거는 유지합니다. 옛 판 factory-only 대비 비율은 산술이 맞아도 완료 비교로 무효입니다.

새 창 `analyze-completed.mjs`는 median·바퀴 평균/범위/비율·관측 상태·callback·drain·source/canonical/Winglet/기존 증거/실행 도구 해시를 검산했고 실패 0건입니다. 별도 Python 검산은 raw samples에서 다시 median·평균·비율을 구해 새 완료 표 32행, 첫 창 current 32행·factory-only 진단 24행·계측 32행·포괄/배타 함수 16행·계수 8행을 대조했습니다. **수치 필드 1,104개·상대 링크 24개·red/중간 반례/green·해시 검사 통과, 오류 0건**입니다. 새 명령은 `python3 {tmp}/mount-breakdown-completed-task_7e0e67a1893f/validate-completed.py`이며 동결 원본을 고치지 않습니다.

TMPDIR는 영구 보관소가 아니며 raw는 커밋에 넣지 않습니다. 정리되면 해시만으로 표본을 복원할 수 없습니다. 창을 합친 정밀도·신뢰구간이나 JIT/GC 비용 분리를 주장하지 않습니다. 첫 창의 분해 filter도 사후 보수적 해석 규칙일 뿐 통계/계약 gate가 아닙니다. 1 ms = 1000 µs이며 profiler 점유율을 생산 지연의 절감 ms로 환산하지 않습니다.

## Filid 병합 경계 검사와 독립 검토 상태

고정 HEAD `d0300133765c1f0e5b7635ee5dbed0d7d2a76264`의 전체 Filid seam 판정은 **FAIL, 분석 완전성은 INDETERMINATE**입니다. snapshot summary·여섯 scope 구조 검사·전체 검증 문서 감사의 snapshot은 모두 `e216ba42c97f592b0810c4daba0218ee95b091b1a2d6600cf152d66cd4e14776`로 일치했습니다. 구조 raw 384건은 오류 24·경고 52·설정상 면제 info 308건이며, 검증 문서 위반 24건(오류 2·경고 22)은 구조 finding에 중복 포함됩니다. 중복 제거한 non-exempt finding은 76건이고 진단은 130건(detail-document-contract 33·intent-document-contract 20·unresolved-local-dependency 4·unowned-local-dependency 73)입니다. facts 2,596파일은 exact여도 미해결·소유자 없는 참조와 동적 case 수 때문에 의존·검증 축은 미확정입니다. 기존 finding을 이번에 고치거나 면제하지 않았습니다.

기준과 같은 `.filid/config.json`의 `**/architecture`·`**/bench` ignore 때문에 PR의 다섯 변경 경로는 자동 구조·검증 감사에서 모두 제외됩니다. 수동으로 공개 `src/index.ts`·package exports 불변, 제품의 helper 소비 없음, first-batch 공통 도구의 내부 helper 직접 import와 guard의 기존 distEngine 배치를 확인했습니다. 이 확인은 자동 PASS가 아니며 standalone guard의 자동 verification role·case cap은 미판정입니다. 원본 감사·전체 finding·진단·기준 대조는 `{tmp}/filid-seam-task_614c1ed6f279/filid-seam-report.md`에 보존했습니다. 이번 보완은 위 감사 뒤의 문서 변경뿐이며 전체 scan을 반복하지 않았습니다.

수치 검산 도구와 `validate-completed.py`는 구현자가 작성한 증거입니다. g4의 구조·계약·readiness 검토는 코드가 그대로인 범위의 근거로 재사용하되, 그 Python 재실행을 독립 수치 재계산으로 보지 않습니다. g4는 Git config 접근 거부로 commit metadata도 검증하지 못했습니다. 조정자가 받은 별도 g3.8 보완 검증은 자체 수치 계산의 일치를 보고했지만, gh·Git global config 접근 거부로 PR·commit metadata는 **UNVERIFIED**로 남겼습니다. 구현자의 정상 허용 경로 PR 위생 확인은 본인 근거이며 이를 독립 metadata 통과로 대체하지 않습니다. 최종 독립 승인이나 병합 준비 완료를 주장하지 않으며 남은 검증과 병합 판단은 조정자·소유자에게 남깁니다.

최종 범위는 이 보고서, verification loader, readiness 가드, first-batch 공통 도구·README의 다섯 경로입니다. 기존 다섯 L3 보고서와 ignored/raw 증거는 보존합니다. 독립 검토의 후속 결과·병합·M3/원장 마감은 조정자에게 남깁니다.
