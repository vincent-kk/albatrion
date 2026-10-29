# Ⅳ-3-0 — 분기 전환의 함수 단위 샘플링 귀속

세 행의 함수 self 귀속과 같은 관측 구간의 평균 벽시계를 교차 확인했습니다.

제품 기준: `510962d634c94dc56be808b693d76aa86e4af11a`. 도구 머리: `5d8078a3049283a06f3b116cedff99141643ca4c`. Node v26.12.1, darwin/arm64; Apple M1 Max, OS 27.0.0. Node 전용 진단이며 Bun에는 같은 V8 장치가 없습니다. 창·A/B 비교가 아닙니다.

준비 root의 realpath 정규화로 경로가 달라졌는가: 예. 실행 인자의 정규화 변경: 예. 기계 경로 자체는 보존하지 않습니다. 제품 소스가 기준과 동일하고 dist가 모든 제품 소스보다 새로 생성되었음을 준비 때 확인했습니다.

지정 제품 build의 기존 비축소 index.node.mjs에 fixture용 내부 export만 덧붙였습니다. 제품 소스·빌드 설정·계측 타이머 변경은 없습니다. 수집 행과 수집기 없는 plain 대조는 별도 프로세스이며 각각 폼 한 번·2,000동작 예열·20,000동작입니다. oneOf는 왕복 2쓰기, siblings는 1쓰기, single-flat은 잎 1쓰기입니다(single-flat의 기존 10쓰기 표본과 단위가 다릅니다).

벽시계는 100동작 블록 바깥의 단조 시계로 재고 평균과 중앙값을 함께 보고합니다. 500동작마다 타이밍 밖 setImmediate로 양보했습니다. 프로파일은 동일 블록 구간의 leaf 표본만 고르므로 적재·폼 생성·예열·검사·양보를 제외합니다. 각 표본의 가중치는 다음 표본까지의 실측 timeDeltas이며 마지막 표본은 자기 간격을 씁니다. self는 가중치 합 ÷ 20,000이고 평균 벽시계와 ±15%를 비교합니다. 벽시계에 맞춰 정규화하지 않습니다. (program)/(idle)은 self와 백분율 가중치 분모에서 빼고 동작 수 분모는 유지합니다. GC는 포함합니다. 요청 간격 × 표본 수의 nominal 값은 보조 진단입니다.

수집 프로세스의 벽시계에는 수집기 부담이 포함됩니다. 별도 plain 프로세스와의 평균·중앙값 비율로 그 부담을 보고하며 Ⅳ-0의 plain 값과 비교할 때는 별도 plain만 씁니다. 이 별도 관측은 같은 프로세스 교차 확인의 분모를 대체하지 않습니다.

CPU 사전 검사: 공용 3초 평균·개별 외부 PID 30%, 일반 시작 지연 120초·Spotlight 600초. 원시는 상위 10개 프로세스의 이름·비율만 공개하며 거절은 자동 재시도하지 않습니다. 원시 .cpuprofile.gz는 URL만 상대 주소로 치환했고 입력 SHA-256은 inputs.json에 보존했습니다.

## 교차 확인

| 행 / 요청 간격 µs | 수집 벽시계 평균 µs | 중앙값 µs | self µs | self/평균 | self/중앙값 | ±15% | nominal self µs | program·idle 가중 % |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| switch-oneOf-80 / 50 | 100.812 | 81.410 | 98.281 | 0.9749 | 1.2072 | 통과 | 61.590 | 2.51 |
| switch-siblings-0 / 50 | 15.991 | 15.405 | 15.596 | 0.9753 | 1.0124 | 통과 | 9.835 | 2.42 |
| single-flat-1000 / 50 | 4.902 | 4.555 | 4.781 | 0.9752 | 1.0495 | 통과 | 3.002 | 2.92 |

## 표본 간격과 수집기 부담

| 행 / 요청 µs | 실측 평균 간격 µs | 양자화 대역 간격 추정 µs | 표본 수(활성/제외) | plain 평균/중앙 µs | 수집/plain 평균·중앙 비 |
| --- | ---: | ---: | ---: | ---: | ---: |
| switch-oneOf-80 / 50 | 79.780 | 식별 불가 | 25272 (24636/636) | 86.266 / 71.490 | 1.1686 / 1.1388 |
| switch-siblings-0 / 50 | 79.301 | 23.999 | 4031 (3934/97) | 14.502 / 13.725 | 1.1027 / 1.1224 |
| single-flat-1000 / 50 | 79.622 | 24.421 | 1237 (1201/36) | 4.449 / 4.265 | 1.1020 / 1.0680 |

timeDeltas의 JSON 단위는 1 µs입니다. 양자화 단위 열은 표본 3개 이상이면서 전체의 0.1% 이상인 연속 정수-µs 대역 중심 간 거리의 중앙값으로 추정한 관측 간격이며 시계의 기본 해상도를 증명하지 않습니다. 두 대역 미만이면 식별 불가로 남깁니다.

switch-oneOf-80/50: 간격 p10/p50/p90 76/79/82 µs; 0 간격 0개; 반복 대역 중심 79.005 µs.

## switch-oneOf-80 — 50 µs

| 갈래 | self µs/동작 | % |
| --- | ---: | ---: |
| A | 9.651 | 9.82 |
| B | 23.259 | 23.67 |
| C | 2.164 | 2.20 |
| GC | 14.390 | 14.64 |
| OTHER | 48.817 | 49.67 |

| 함수 (번들 줄, 원본 모듈) | 갈래 | self µs/동작 | % | 표본 |
| --- | --- | ---: | ---: | ---: |
| (garbage collector) (0, V8) | GC | 14.390 | 14.64 | 3540 |
| assembleObject (9149, src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts) | B | 4.987 | 5.07 | 1260 |
| register (6701, src/core/engine/settle/utils/gates/getGateRegistry.ts) | A | 4.748 | 4.83 | 1196 |
| affectedByPresence (5674, src/core/engine/settle/utils/dependencies/getDependencyIndex.ts) | OTHER | 3.151 | 3.21 | 797 |
| computeNodeBody (12005, src/core/engine/settle/utils/compute/computeNode.ts) | OTHER | 3.093 | 3.15 | 783 |
| getHostDerived (1175, src/core/engine/utils/cache/derivedRecords.ts) | OTHER | 2.474 | 2.52 | 629 |
| markCommitDeliveries (13756, src/core/engine/settle/utils/commit/markCommitDeliveries.ts) | B | 2.422 | 2.46 | 611 |
| registerPresenceChanges (6994, src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts) | B | 2.059 | 2.10 | 517 |
| collect (5561, src/core/engine/settle/utils/dependencies/getDependencyIndex.ts) | OTHER | 1.931 | 1.96 | 489 |
| transitionSettlement (15481, src/core/engine/settle/utils/transition/transitionSettlement.ts) | B | 1.918 | 1.95 | 471 |
| publishPreparedSelection (11456, src/core/engine/settle/utils/compute/childSelection/utils/publishPreparedSelection.ts) | B | 1.833 | 1.86 | 464 |
| selectEffectiveDeclarations (1703, src/core/engine/blueprint/effectiveSchema/utils/merge/selectEffectiveDeclarations.ts) | OTHER | 1.829 | 1.86 | 465 |
| getCommittedDeclarationKey (4808, src/core/engine/utils/controls/getCommittedDeclarationKey.ts) | OTHER | 1.726 | 1.76 | 439 |
| selectEntryStep (10997, src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts) | B | 1.539 | 1.57 | 390 |
| selectChildren (11480, src/core/engine/settle/utils/compute/childSelection/selectChildren.ts) | B | 1.518 | 1.54 | 384 |
| commitSettlement (13994, src/core/engine/settle/utils/commit/commitSettlement.ts) | B | 1.518 | 1.54 | 386 |
| captureDetachedFieldNodeReads (14546, src/core/engine/settle/utils/detached/captureDetachedFieldNodeReads.ts) | A | 1.482 | 1.51 | 373 |
| resolvePointer (1041, src/helpers/jsonPointer/utils/resolvePointer.ts) | OTHER | 1.476 | 1.50 | 371 |
| markRestoredSlotRaw (10525, src/core/engine/settle/utils/slots/markRestoredSlotRaw.ts) | OTHER | 1.428 | 1.45 | 364 |
| readFieldNodeWatchValues (13488, src/core/engine/settle/utils/controls/readFieldNodeWatchValues.ts) | OTHER | 1.413 | 1.44 | 361 |
| add (7238, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 1.243 | 1.26 | 314 |
| updateOutput (7768, src/core/engine/settle/utils/output/updateOutput.ts) | B | 1.225 | 1.25 | 312 |
| selectLiteralTableChildren (11173, src/core/engine/settle/utils/compute/childSelection/gateSelection/selectLiteralTableChildren.ts) | B | 1.203 | 1.22 | 305 |
| hasOwnProperty (3, packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs) | OTHER | 1.111 | 1.13 | 282 |
| finalizeExits (15313, src/core/engine/settle/utils/transition/finalizeExits.ts) | A | 1.072 | 1.09 | 229 |
| resolveGateOccurrence (6622, src/core/engine/settle/utils/gates/resolveGateOccurrence.ts) | OTHER | 1.061 | 1.08 | 270 |
| mergeEffectiveSchema (1738, src/core/engine/blueprint/effectiveSchema/utils/merge/mergeEffectiveSchema.ts) | OTHER | 0.989 | 1.01 | 251 |
| pathSegments (5395, src/core/engine/settle/utils/dependencies/getDependencyIndex.ts) | OTHER | 0.967 | 0.98 | 246 |
| releaseSettlementScratch (12402, src/core/engine/settle/utils/scratch/releaseSettlementScratch.ts) | C | 0.916 | 0.93 | 233 |
| markSlotChange (9611, src/core/engine/settle/utils/slots/markSlotChange.ts) | OTHER | 0.904 | 0.92 | 230 |
| commitSlotChanges (12886, src/core/engine/settle/utils/slots/commitSlotChanges.ts) | OTHER | 0.887 | 0.90 | 217 |
| parsePointerSegment (921, src/helpers/jsonPointer/utils/parsePointerSegment.ts) | OTHER | 0.826 | 0.84 | 207 |
| escapeSegment (4, packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.mjs) | OTHER | 0.817 | 0.83 | 205 |
| computeNode (12178, src/core/engine/settle/utils/compute/computeNode.ts) | B | 0.784 | 0.80 | 182 |
| readFormattedPointerSegment (1066, src/helpers/jsonPointer/utils/readFormattedPointerSegment.ts) | OTHER | 0.764 | 0.78 | 193 |
| emit (5610, src/core/engine/settle/utils/dependencies/getDependencyIndex.ts) | OTHER | 0.697 | 0.71 | 177 |
| mergeGateSteps (10963, src/core/engine/settle/utils/compute/childSelection/gateSelection/mergeGateSteps.ts) | OTHER | 0.655 | 0.67 | 165 |
| registerRecalculation (12224, src/core/engine/settle/utils/dependencies/registerRecalculation.ts) | B | 0.641 | 0.65 | 162 |
| set (12821, src/core/engine/utils/pathIndex/PathKeyedMap.ts) | OTHER | 0.603 | 0.61 | 152 |
| captureFieldNodeChange (7617, src/core/engine/record/utils/captureFieldNodeChange.ts) | OTHER | 0.601 | 0.61 | 150 |

GC 14.64%. program·idle의 가중 몫 2.51%.

OTHER 전체:

| 함수 (URL:줄) | self µs/동작 |
| --- | ---: |
| affectedByPresence (prepared/engine.mjs:5674) | 3.151 |
| computeNodeBody (prepared/engine.mjs:12005) | 3.093 |
| getHostDerived (prepared/engine.mjs:1175) | 2.474 |
| collect (prepared/engine.mjs:5561) | 1.931 |
| selectEffectiveDeclarations (prepared/engine.mjs:1703) | 1.829 |
| getCommittedDeclarationKey (prepared/engine.mjs:4808) | 1.726 |
| resolvePointer (prepared/engine.mjs:1041) | 1.476 |
| markRestoredSlotRaw (prepared/engine.mjs:10525) | 1.428 |
| readFieldNodeWatchValues (prepared/engine.mjs:13488) | 1.413 |
| add (prepared/engine.mjs:7238) | 1.243 |
| hasOwnProperty (packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs:3) | 1.111 |
| resolveGateOccurrence (prepared/engine.mjs:6622) | 1.061 |
| mergeEffectiveSchema (prepared/engine.mjs:1738) | 0.989 |
| pathSegments (prepared/engine.mjs:5395) | 0.967 |
| markSlotChange (prepared/engine.mjs:9611) | 0.904 |
| commitSlotChanges (prepared/engine.mjs:12886) | 0.887 |
| parsePointerSegment (prepared/engine.mjs:921) | 0.826 |
| escapeSegment (packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.mjs:4) | 0.817 |
| readFormattedPointerSegment (prepared/engine.mjs:1066) | 0.764 |
| emit (prepared/engine.mjs:5610) | 0.697 |
| mergeGateSteps (prepared/engine.mjs:10963) | 0.655 |
| set (prepared/engine.mjs:12821) | 0.603 |
| captureFieldNodeChange (prepared/engine.mjs:7617) | 0.601 |
| supplementSplitOwner (prepared/engine.mjs:10277) | 0.568 |
| visitFieldNodes.owned (prepared/engine.mjs:15324) | 0.558 |
| add (prepared/engine.mjs:6813) | 0.548 |
| affectedForRegistration (prepared/engine.mjs:5557) | 0.530 |
| sameValue (prepared/engine.mjs:4692) | 0.520 |
| getTableVisitSteps (prepared/engine.mjs:11143) | 0.510 |
| visit (prepared/engine.mjs:13564) | 0.506 |
| dirtyChildren (prepared/engine.mjs:7318) | 0.467 |
| advanceFieldNodeRevision (prepared/engine.mjs:7522) | 0.447 |
| getBlueprintDerived (prepared/engine.mjs:1167) | 0.444 |
| getGateRegistry (prepared/engine.mjs:6912) | 0.394 |
| (anonymous) (prepared/engine.mjs:14035) | 0.363 |
| commitGlobalState (prepared/engine.mjs:13538) | 0.356 |
| appendSegment (prepared/engine.mjs:1018) | 0.339 |
| formatSegment (prepared/engine.mjs:998) | 0.336 |
| clear (prepared/engine.mjs:7306) | 0.332 |
| getControlLayers (prepared/engine.mjs:13237) | 0.318 |
| map (packages/winglet/common-utils/dist/utils/array/map.mjs:2) | 0.316 |
| markWrite (prepared/engine.mjs:10401) | 0.306 |
| selectNodeSchema (prepared/engine.mjs:11802) | 0.281 |
| owner (prepared/engine.mjs:12260) | 0.273 |
| delete (prepared/engine.mjs:7276) | 0.262 |
| readProjectedValue (prepared/engine.mjs:7836) | 0.247 |
| updatePendingExitIndex (prepared/engine.mjs:8405) | 0.242 |
| collectPresenceChangeNames (prepared/engine.mjs:6924) | 0.215 |
| mayChangeAt (prepared/engine.mjs:6759) | 0.207 |
| presenceChildren (prepared/engine.mjs:5737) | 0.206 |
| writeObjectKey (prepared/engine.mjs:9137) | 0.199 |
| getSlotSource (prepared/engine.mjs:8519) | 0.188 |
| flushPendingOutput (prepared/engine.mjs:7824) | 0.188 |
| accumulateGlobalStateDeltas (prepared/engine.mjs:7681) | 0.178 |
| isDescendantPath (prepared/engine.mjs:1037) | 0.176 |
| getSlotEntries (prepared/engine.mjs:8454) | 0.174 |
| prepareStaticHost (prepared/engine.mjs:11399) | 0.173 |
| projectedEmission (prepared/engine.mjs:7835) | 0.164 |
| getChildPointer (prepared/engine.mjs:1111) | 0.161 |
| isCanonicalArrayIndex (prepared/engine.mjs:5329) | 0.153 |
| collectPresenceOwners (prepared/engine.mjs:5747) | 0.152 |
| RegExp: ^(0\|[1-9]\d*)$ (V8:0) | 0.150 |
| prepareControlLayers (prepared/engine.mjs:13127) | 0.149 |
| readGateBucket (prepared/engine.mjs:9821) | 0.147 |
| releaseSplitMember (prepared/engine.mjs:7192) | 0.137 |
| get path (prepared/engine.mjs:18981) | 0.135 |
| mayChangeOwnDeclarationAt (prepared/engine.mjs:6805) | 0.131 |
| appendFormattedSegment (prepared/engine.mjs:1014) | 0.129 |
| getStaticChoices (prepared/engine.mjs:8649) | 0.122 |
| getRequiredChildren (prepared/engine.mjs:13691) | 0.119 |
| resolveRead (prepared/engine.mjs:6676) | 0.112 |
| (anonymous) (prepared/engine.mjs:5594) | 0.112 |
| isTreeNode (prepared/engine.mjs:13816) | 0.110 |
| hit (prepared/engine.mjs:12256) | 0.108 |
| readExitLayerPolicy (prepared/engine.mjs:14604) | 0.107 |
| dispatchSetValue (prepared/engine.mjs:18002) | 0.103 |
| resolveFieldNodeChainRoot (prepared/engine.mjs:17608) | 0.103 |
| releaseWrongKindHosts (prepared/engine.mjs:15725) | 0.096 |
| get gateSelection (prepared/engine.mjs:1200) | 0.095 |
| preserveReferences (prepared/engine.mjs:11643) | 0.093 |
| (anonymous) (prepared/engine.mjs:11167) | 0.093 |
| get raw (prepared/engine.mjs:18993) | 0.089 |
| readFieldNodeErrors (prepared/engine.mjs:6414) | 0.089 |
| getChildDistribution (prepared/engine.mjs:8382) | 0.087 |
| visitFieldNodes (prepared/engine.mjs:12995) | 0.082 |
| presenceLevels (prepared/engine.mjs:5723) | 0.078 |
| ensureEffectiveSchemaCache (prepared/engine.mjs:1229) | 0.078 |
| getSlotBinding (prepared/engine.mjs:8506) | 0.078 |
| readDepartingAncestorPolicy (prepared/engine.mjs:14668) | 0.075 |
| clearFieldNodeChanges (prepared/engine.mjs:7729) | 0.075 |
| isMisfit (prepared/engine.mjs:10579) | 0.072 |
| readFormattedNameSegment (prepared/engine.mjs:1098) | 0.071 |
| prepareHostWheelPlan (prepared/engine.mjs:11966) | 0.071 |
| commitExitPolicyValues (prepared/engine.mjs:13347) | 0.070 |
| verifyGateSelection (prepared/engine.mjs:7101) | 0.064 |
| watchPaths (prepared/engine.mjs:6858) | 0.064 |
| captureAbsentSlotInputs (prepared/engine.mjs:14858) | 0.063 |
| get children (prepared/engine.mjs:18987) | 0.063 |
| hasPointerOperator (prepared/engine.mjs:1123) | 0.063 |
| locate (prepared/engine.mjs:6729) | 0.063 |
| get gateWheel (prepared/engine.mjs:1203) | 0.062 |
| write (packages/canard/schema-form/architecture/verification/branch-switch/tools/b9-0/operation.mjs:26) | 0.062 |
| bindPointerTemplate (prepared/engine.mjs:1137) | 0.062 |
| watchSplitRegistration (prepared/engine.mjs:12503) | 0.060 |
| readsChanged (prepared/engine.mjs:6870) | 0.059 |
| (anonymous) (prepared/engine.mjs:5618) | 0.058 |
| rebuildRootExternalErrors (prepared/engine.mjs:17420) | 0.057 |
| delete (prepared/engine.mjs:18846) | 0.055 |
| getLoadValue (prepared/engine.mjs:9729) | 0.055 |
| (anonymous) (prepared/engine.mjs:11539) | 0.055 |
| omitEmptyObject (prepared/engine.mjs:9123) | 0.055 |
| staticSpec (prepared/engine.mjs:9487) | 0.051 |
| readSlotExitPolicy (prepared/engine.mjs:14622) | 0.051 |
| get rootNode (prepared/engine.mjs:18963) | 0.051 |
| pathSegments (prepared/engine.mjs:6689) | 0.048 |
| updateSlotChildIndex (prepared/engine.mjs:12878) | 0.047 |
| emit (prepared/engine.mjs:5571) | 0.047 |
| (anonymous) (prepared/engine.mjs:5630) | 0.046 |
| delete (prepared/engine.mjs:12713) | 0.046 |
| effectiveType (prepared/engine.mjs:13440) | 0.043 |
| preserveSlotValueMemos (prepared/engine.mjs:12864) | 0.043 |
| getVirtualReferenceIndex (prepared/engine.mjs:12472) | 0.041 |
| emit (prepared/engine.mjs:5601) | 0.039 |
| getGateExpression (prepared/engine.mjs:5310) | 0.039 |
| markSilent (prepared/engine.mjs:13818) | 0.036 |
| run (packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/helpers/setupOperation.mjs:22) | 0.036 |
| recordGateInput (prepared/engine.mjs:9836) | 0.036 |
| joinPointer (prepared/engine.mjs:1022) | 0.035 |
| keepsChildEmissions (prepared/engine.mjs:7757) | 0.035 |
| (anonymous) (prepared/engine.mjs:9624) | 0.035 |
| collectChainRecords (prepared/engine.mjs:17536) | 0.035 |
| projectEmpty (prepared/engine.mjs:9361) | 0.035 |
| getIndex (prepared/engine.mjs:7929) | 0.035 |
| (anonymous) (prepared/engine.mjs:1233) | 0.031 |
| registerProjectionChanges (prepared/engine.mjs:6977) | 0.031 |
| indexOccurrence (prepared/engine.mjs:6836) | 0.031 |
| prepareSourcePruner (prepared/engine.mjs:15657) | 0.030 |
| runBlocks (packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/helpers/runBlocks.mjs:11) | 0.027 |
| relocated (prepared/engine.mjs:6749) | 0.027 |
| RegisteredGateOccurrence (prepared/engine.mjs:6645) | 0.027 |
| readFieldNodeDefaultValue (prepared/engine.mjs:14537) | 0.025 |
| get active (prepared/engine.mjs:19014) | 0.024 |
| getBlueprintNodeIdentity (prepared/engine.mjs:4716) | 0.024 |
| (anonymous) (prepared/engine.mjs:8320) | 0.024 |
| compareDeclarations (prepared/engine.mjs:1726) | 0.024 |
| readSettlementSource (prepared/engine.mjs:13738) | 0.024 |
| deliverChainRecords (prepared/engine.mjs:17300) | 0.023 |
| minLite (packages/winglet/common-utils/dist/utils/math/minLite.mjs:2) | 0.023 |
| set children (prepared/engine.mjs:18990) | 0.021 |
| markWrongKindAncestors (prepared/engine.mjs:15715) | 0.020 |
| set active (prepared/engine.mjs:19017) | 0.020 |
| (anonymous) (prepared/engine.mjs:11784) | 0.020 |
| assembleRaw (prepared/engine.mjs:8893) | 0.020 |
| isTypeName (prepared/engine.mjs:13447) | 0.019 |
| planSplitAnchors (prepared/engine.mjs:7126) | 0.019 |
| getFeatureNodeIndex (prepared/engine.mjs:4368) | 0.019 |
| set raw (prepared/engine.mjs:18996) | 0.016 |
| flushPresenceTemplates (prepared/engine.mjs:5870) | 0.016 |
| get name (prepared/engine.mjs:18969) | 0.016 |
| get nullable (prepared/engine.mjs:18951) | 0.016 |
| isReplacedLivePath (prepared/engine.mjs:14633) | 0.015 |
| prepareGateSelection (prepared/engine.mjs:12444) | 0.015 |
| recordGateFrameInput (prepared/engine.mjs:9825) | 0.015 |
| isMember (prepared/engine.mjs:9025) | 0.012 |
| get (prepared/engine.mjs:4096) | 0.012 |
| getExitExpressions (prepared/engine.mjs:13338) | 0.012 |
| interpret (prepared/engine.mjs:9043) | 0.012 |
| assertFieldNodeWritable (prepared/engine.mjs:12327) | 0.012 |
| parentOf (prepared/engine.mjs:6993) | 0.012 |
| relocatedGates (prepared/engine.mjs:11732) | 0.012 |
| bundleChainErrors (prepared/engine.mjs:17493) | 0.011 |
| publishGlobalStateDeltas (prepared/engine.mjs:7697) | 0.011 |
| setValue (prepared/engine.mjs:19068) | 0.009 |
| (anonymous) (prepared/engine.mjs:11850) | 0.008 |
| expireOccupiedSlotMemos (prepared/engine.mjs:12852) | 0.008 |
| bindGateHostPath (prepared/engine.mjs:6615) | 0.008 |
| has (prepared/engine.mjs:4088) | 0.008 |
| projectIdentity (prepared/engine.mjs:9067) | 0.008 |
| (anonymous) (prepared/engine.mjs:1746) | 0.008 |
| canOmitFieldNodePayload (prepared/engine.mjs:7545) | 0.008 |
| getTransitionBudgetCap (prepared/engine.mjs:7977) | 0.004 |
| filter (packages/winglet/common-utils/dist/utils/array/filter.mjs:2) | 0.004 |
| refuseListenerFeedback (prepared/engine.mjs:17349) | 0.004 |
| (anonymous) (prepared/engine.mjs:12135) | 0.004 |
| hrtimeBigInt (V8:0) | 0.004 |
| get mutations (prepared/engine.mjs:18830) | 0.004 |
| isSameDeliveryValue (prepared/engine.mjs:7753) | 0.004 |
| refuseInactiveResolverWrite (prepared/engine.mjs:17325) | 0.004 |
| (anonymous) (prepared/engine.mjs:11849) | 0.004 |
| (anonymous) (prepared/engine.mjs:6866) | 0.004 |
| (anonymous) (prepared/engine.mjs:5595) | 0.004 |
| projectObject (prepared/engine.mjs:9130) | 0.003 |

switch-siblings-0/50: 간격 p10/p50/p90 76/79/82 µs; 0 간격 0개; 반복 대역 중심 78.458, 102.457, 118.400 µs.

## switch-siblings-0 — 50 µs

| 갈래 | self µs/동작 | % |
| --- | ---: | ---: |
| A | 0.206 | 1.32 |
| B | 3.961 | 25.40 |
| C | 0.859 | 5.51 |
| GC | 0.654 | 4.19 |
| OTHER | 9.916 | 63.58 |

| 함수 (번들 줄, 원본 모듈) | 갈래 | self µs/동작 | % | 표본 |
| --- | --- | ---: | ---: | ---: |
| hasOwnProperty (3, packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs) | OTHER | 1.571 | 10.07 | 399 |
| computeNodeBody (12005, src/core/engine/settle/utils/compute/computeNode.ts) | OTHER | 0.674 | 4.32 | 170 |
| selectEntryStep (10997, src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts) | B | 0.673 | 4.32 | 171 |
| (garbage collector) (0, V8) | GC | 0.654 | 4.19 | 148 |
| assembleObject (9149, src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts) | B | 0.645 | 4.14 | 163 |
| markCommitDeliveries (13756, src/core/engine/settle/utils/commit/markCommitDeliveries.ts) | B | 0.529 | 3.39 | 134 |
| mergeEffectiveSchema (1738, src/core/engine/blueprint/effectiveSchema/utils/merge/mergeEffectiveSchema.ts) | OTHER | 0.394 | 2.52 | 100 |
| releaseSettlementScratch (12402, src/core/engine/settle/utils/scratch/releaseSettlementScratch.ts) | C | 0.393 | 2.52 | 100 |
| commitSettlement (13994, src/core/engine/settle/utils/commit/commitSettlement.ts) | B | 0.364 | 2.33 | 93 |
| readFormattedPointerSegment (1066, src/helpers/jsonPointer/utils/readFormattedPointerSegment.ts) | OTHER | 0.349 | 2.24 | 89 |
| registerRecalculation (12224, src/core/engine/settle/utils/dependencies/registerRecalculation.ts) | B | 0.331 | 2.12 | 83 |
| evaluateGateValue (9944, src/core/engine/settle/utils/gates/evaluateGate.ts) | B | 0.318 | 2.04 | 81 |
| advanceFieldNodeRevision (7522, src/core/engine/record/utils/advanceFieldNodeRevision.ts) | OTHER | 0.307 | 1.97 | 78 |
| readProjectedValue (7836, src/core/engine/settle/utils/gates/readProjectedValue.ts) | OTHER | 0.294 | 1.88 | 75 |
| add (7238, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 0.284 | 1.82 | 72 |
| selectChildren (11480, src/core/engine/settle/utils/compute/childSelection/selectChildren.ts) | B | 0.278 | 1.78 | 71 |
| getOwnPropertyDescriptor (11348, src/core/engine/settle/utils/compute/childSelection/utils/createPreparedSelectionStructure.ts) | OTHER | 0.248 | 1.59 | 63 |
| delete (7276, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 0.247 | 1.58 | 62 |
| resolvePointer (1041, src/helpers/jsonPointer/utils/resolvePointer.ts) | OTHER | 0.245 | 1.57 | 62 |
| getGateRegistry (6912, src/core/engine/settle/utils/gates/getGateRegistry.ts) | OTHER | 0.216 | 1.39 | 55 |
| sameValue (4692, src/core/engine/utils/compute/sameValue.ts) | OTHER | 0.213 | 1.37 | 54 |
| selectEffectiveDeclarations (1703, src/core/engine/blueprint/effectiveSchema/utils/merge/selectEffectiveDeclarations.ts) | OTHER | 0.211 | 1.35 | 54 |
| updateOutput (7768, src/core/engine/settle/utils/output/updateOutput.ts) | B | 0.180 | 1.16 | 45 |
| parsePointerSegment (921, src/helpers/jsonPointer/utils/parsePointerSegment.ts) | OTHER | 0.165 | 1.06 | 42 |
| affected (5637, src/core/engine/settle/utils/dependencies/getDependencyIndex.ts) | OTHER | 0.161 | 1.03 | 39 |
| captureFieldNodeChange (7617, src/core/engine/record/utils/captureFieldNodeChange.ts) | OTHER | 0.159 | 1.02 | 40 |
| clear (7306, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 0.153 | 0.98 | 39 |
| computeNode (12178, src/core/engine/settle/utils/compute/computeNode.ts) | B | 0.150 | 0.96 | 37 |
| (anonymous) (14035, src/core/engine/settle/utils/commit/commitSettlement.ts) | OTHER | 0.142 | 0.91 | 36 |
| escapeSegment (4, packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.mjs) | OTHER | 0.121 | 0.77 | 30 |
| dirtyChildren (7318, src/core/engine/settle/utils/compute/dirtyChildren.ts) | OTHER | 0.118 | 0.75 | 30 |
| captureProjectionBaseline (10263, src/core/engine/settle/utils/dependencies/captureProjectionBaseline.ts) | OTHER | 0.117 | 0.75 | 30 |
| flushPendingOutput (7824, src/core/engine/settle/utils/output/flushPendingOutput.ts) | OTHER | 0.115 | 0.74 | 29 |
| evaluateGate (10075, src/core/engine/settle/utils/gates/evaluateGate.ts) | B | 0.110 | 0.70 | 28 |
| finishSettlement (15619, src/core/engine/settle/utils/settlement/finishSettlement.ts) | C | 0.110 | 0.70 | 27 |
| getBlueprintDerived (1167, src/core/engine/utils/cache/derivedRecords.ts) | OTHER | 0.105 | 0.67 | 27 |
| flushPendingGateReads (10151, src/core/engine/settle/utils/gates/flushPendingGateReads.ts) | OTHER | 0.103 | 0.66 | 26 |
| getHostDerived (1175, src/core/engine/utils/cache/derivedRecords.ts) | OTHER | 0.099 | 0.64 | 25 |
| register (6701, src/core/engine/settle/utils/gates/getGateRegistry.ts) | A | 0.099 | 0.63 | 25 |
| exitFieldNodeChain (17786, src/core/engine/write/utils/chain/exitFieldNodeChain.ts) | C | 0.098 | 0.63 | 25 |

GC 4.19%. program·idle의 가중 몫 2.42%.

OTHER 전체:

| 함수 (URL:줄) | self µs/동작 |
| --- | ---: |
| hasOwnProperty (packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs:3) | 1.571 |
| computeNodeBody (prepared/engine.mjs:12005) | 0.674 |
| mergeEffectiveSchema (prepared/engine.mjs:1738) | 0.394 |
| readFormattedPointerSegment (prepared/engine.mjs:1066) | 0.349 |
| advanceFieldNodeRevision (prepared/engine.mjs:7522) | 0.307 |
| readProjectedValue (prepared/engine.mjs:7836) | 0.294 |
| add (prepared/engine.mjs:7238) | 0.284 |
| getOwnPropertyDescriptor (prepared/engine.mjs:11348) | 0.248 |
| delete (prepared/engine.mjs:7276) | 0.247 |
| resolvePointer (prepared/engine.mjs:1041) | 0.245 |
| getGateRegistry (prepared/engine.mjs:6912) | 0.216 |
| sameValue (prepared/engine.mjs:4692) | 0.213 |
| selectEffectiveDeclarations (prepared/engine.mjs:1703) | 0.211 |
| parsePointerSegment (prepared/engine.mjs:921) | 0.165 |
| affected (prepared/engine.mjs:5637) | 0.161 |
| captureFieldNodeChange (prepared/engine.mjs:7617) | 0.159 |
| clear (prepared/engine.mjs:7306) | 0.153 |
| (anonymous) (prepared/engine.mjs:14035) | 0.142 |
| escapeSegment (packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.mjs:4) | 0.121 |
| dirtyChildren (prepared/engine.mjs:7318) | 0.118 |
| captureProjectionBaseline (prepared/engine.mjs:10263) | 0.117 |
| flushPendingOutput (prepared/engine.mjs:7824) | 0.115 |
| getBlueprintDerived (prepared/engine.mjs:1167) | 0.105 |
| flushPendingGateReads (prepared/engine.mjs:10151) | 0.103 |
| getHostDerived (prepared/engine.mjs:1175) | 0.099 |
| locate (prepared/engine.mjs:6729) | 0.095 |
| flushGate (prepared/engine.mjs:10210) | 0.095 |
| projectedEmission (prepared/engine.mjs:7835) | 0.091 |
| recordGateInput (prepared/engine.mjs:9836) | 0.090 |
| collectPresenceChangeNames (prepared/engine.mjs:6924) | 0.090 |
| flushRead (prepared/engine.mjs:10195) | 0.081 |
| selectNodeSchema (prepared/engine.mjs:11802) | 0.074 |
| markWrite (prepared/engine.mjs:10401) | 0.072 |
| get path (prepared/engine.mjs:18981) | 0.071 |
| collect (prepared/engine.mjs:5642) | 0.068 |
| appendSegment (prepared/engine.mjs:1018) | 0.068 |
| mayChangeAt (prepared/engine.mjs:6759) | 0.065 |
| set (prepared/engine.mjs:12821) | 0.063 |
| isTreeNode (prepared/engine.mjs:13816) | 0.060 |
| ensureEffectiveSchemaCache (prepared/engine.mjs:1229) | 0.059 |
| formatSegment (prepared/engine.mjs:998) | 0.055 |
| commitGlobalState (prepared/engine.mjs:13538) | 0.051 |
| projectObject (prepared/engine.mjs:9130) | 0.051 |
| registerProjectionChanges (prepared/engine.mjs:6977) | 0.051 |
| visit (prepared/engine.mjs:13564) | 0.051 |
| resolveFieldNodeChainRoot (prepared/engine.mjs:17608) | 0.048 |
| prepareStaticHost (prepared/engine.mjs:11399) | 0.047 |
| getChildPointer (prepared/engine.mjs:1111) | 0.046 |
| projectEmpty (prepared/engine.mjs:9361) | 0.043 |
| get gateWheel (prepared/engine.mjs:1203) | 0.043 |
| isDescendantPath (prepared/engine.mjs:1037) | 0.040 |
| mayChangeOwnDeclarationAt (prepared/engine.mjs:6805) | 0.040 |
| isCanonicalArrayIndex (prepared/engine.mjs:5329) | 0.039 |
| getCommittedDeclarationKey (prepared/engine.mjs:4808) | 0.039 |
| effectiveType (prepared/engine.mjs:13440) | 0.038 |
| readsChanged (prepared/engine.mjs:6870) | 0.035 |
| hasPointerOperator (prepared/engine.mjs:1123) | 0.035 |
| collectChainRecords (prepared/engine.mjs:17536) | 0.035 |
| map (packages/winglet/common-utils/dist/utils/array/map.mjs:2) | 0.035 |
| (anonymous) (V8:1) | 0.035 |
| filter (packages/winglet/common-utils/dist/utils/array/filter.mjs:2) | 0.033 |
| (anonymous) (prepared/engine.mjs:11803) | 0.032 |
| getIndex (prepared/engine.mjs:7929) | 0.032 |
| readFormattedNameSegment (prepared/engine.mjs:1098) | 0.032 |
| delete (prepared/engine.mjs:12713) | 0.031 |
| readPointerSegment (prepared/engine.mjs:1091) | 0.030 |
| pathSegments (prepared/engine.mjs:6689) | 0.028 |
| preserveReferences (prepared/engine.mjs:11643) | 0.028 |
| interpret (prepared/engine.mjs:9043) | 0.027 |
| rebuildRootExternalErrors (prepared/engine.mjs:17420) | 0.027 |
| releaseWrongKindHosts (prepared/engine.mjs:15725) | 0.024 |
| commitExitPolicyValues (prepared/engine.mjs:13347) | 0.024 |
| getChildDistribution (prepared/engine.mjs:8382) | 0.024 |
| get gateSelection (prepared/engine.mjs:1200) | 0.023 |
| appendFormattedSegment (prepared/engine.mjs:1014) | 0.023 |
| assertFieldNodeWritable (prepared/engine.mjs:12327) | 0.020 |
| markSilent (prepared/engine.mjs:13818) | 0.020 |
| dispatchSetValue (prepared/engine.mjs:18002) | 0.020 |
| get raw (prepared/engine.mjs:18993) | 0.020 |
| prepareHostWheelPlan (prepared/engine.mjs:11966) | 0.020 |
| get children (prepared/engine.mjs:18987) | 0.020 |
| projectIdentity (prepared/engine.mjs:9067) | 0.020 |
| resolveRead (prepared/engine.mjs:6676) | 0.020 |
| isMisfit (prepared/engine.mjs:10579) | 0.020 |
| bindGateHostPath (prepared/engine.mjs:6615) | 0.019 |
| relocated (prepared/engine.mjs:6749) | 0.019 |
| getRequiredChildren (prepared/engine.mjs:13691) | 0.019 |
| getGateExpression (prepared/engine.mjs:5310) | 0.017 |
| get (prepared/engine.mjs:4096) | 0.016 |
| get active (prepared/engine.mjs:19014) | 0.016 |
| set children (prepared/engine.mjs:18990) | 0.016 |
| getTransitionBudgetCap (prepared/engine.mjs:7977) | 0.016 |
| delete (prepared/engine.mjs:18846) | 0.015 |
| staticSpec (prepared/engine.mjs:9487) | 0.015 |
| RegExp: ^(0\|[1-9]\d*)$ (V8:0) | 0.015 |
| assembleRaw (prepared/engine.mjs:8893) | 0.013 |
| prepareSourcePruner (prepared/engine.mjs:15657) | 0.012 |
| write (packages/canard/schema-form/architecture/verification/branch-switch/tools/b9-0/operation.mjs:26) | 0.012 |
| get rootNode (prepared/engine.mjs:18963) | 0.012 |
| bundleChainErrors (prepared/engine.mjs:17493) | 0.012 |
| publishGlobalStateDeltas (prepared/engine.mjs:7697) | 0.012 |
| bindPointerTemplate (prepared/engine.mjs:1137) | 0.012 |
| runBlocks (packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/helpers/runBlocks.mjs:11) | 0.012 |
| omitEmptyObject (prepared/engine.mjs:9123) | 0.012 |
| getStaticChoices (prepared/engine.mjs:8649) | 0.012 |
| (anonymous) (prepared/engine.mjs:1233) | 0.011 |
| isSameDeliveryValue (prepared/engine.mjs:7753) | 0.011 |
| readSettlementSource (prepared/engine.mjs:13738) | 0.009 |
| getVirtualReferenceIndex (prepared/engine.mjs:12472) | 0.009 |
| evaluate (prepared/engine.mjs:6595) | 0.008 |
| getExitExpressions (prepared/engine.mjs:13338) | 0.008 |
| scheduleChangedRelocatedGates (prepared/engine.mjs:11749) | 0.008 |
| set active (prepared/engine.mjs:19017) | 0.008 |
| (anonymous) (prepared/engine.mjs:5665) | 0.008 |
| (anonymous) (prepared/engine.mjs:11539) | 0.008 |
| markWrongKindAncestors (prepared/engine.mjs:15715) | 0.008 |
| flushPresenceTemplates (prepared/engine.mjs:5870) | 0.008 |
| getFeatureNodeIndex (prepared/engine.mjs:4368) | 0.008 |
| refuseInactiveResolverWrite (prepared/engine.mjs:17325) | 0.008 |
| isMember (prepared/engine.mjs:9025) | 0.008 |
| get nullable (prepared/engine.mjs:18951) | 0.008 |
| pathSegments (prepared/engine.mjs:5395) | 0.008 |
| prepareGateSelection (prepared/engine.mjs:12444) | 0.007 |
| get hasSplitOwners (prepared/engine.mjs:5398) | 0.004 |
| get name (prepared/engine.mjs:18969) | 0.004 |
| get undeclaredValues (prepared/engine.mjs:18999) | 0.004 |
| (anonymous) (prepared/engine.mjs:11850) | 0.004 |
| compareDeclarations (prepared/engine.mjs:1726) | 0.004 |
| get schemaType (prepared/engine.mjs:18939) | 0.004 |
| refuseDetachedWrite (prepared/engine.mjs:17987) | 0.004 |
| finish (prepared/engine.mjs:13582) | 0.004 |
| getBlueprintNodeIdentity (prepared/engine.mjs:4716) | 0.004 |
| relocatedGates (prepared/engine.mjs:11732) | 0.004 |
| (anonymous) (prepared/engine.mjs:11849) | 0.004 |
| (anonymous) (prepared/engine.mjs:12135) | 0.004 |
| deliverChainRecords (prepared/engine.mjs:17300) | 0.004 |
| set raw (prepared/engine.mjs:18996) | 0.004 |
| isTypeName (prepared/engine.mjs:13447) | 0.003 |

single-flat-1000/50: 간격 p10/p50/p90 76/79/82 µs; 0 간격 0개; 반복 대역 중심 78.900, 103.321, 111.333 µs.

## single-flat-1000 — 50 µs

| 갈래 | self µs/동작 | % |
| --- | ---: | ---: |
| A | 0.036 | 0.74 |
| B | 2.284 | 47.76 |
| C | 0.630 | 13.17 |
| GC | 0.175 | 3.66 |
| OTHER | 1.657 | 34.66 |

| 함수 (번들 줄, 원본 모듈) | 갈래 | self µs/동작 | % | 표본 |
| --- | --- | ---: | ---: | ---: |
| updateOutput (7768, src/core/engine/settle/utils/output/updateOutput.ts) | B | 1.437 | 30.05 | 362 |
| assembleObject (9149, src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts) | B | 0.375 | 7.84 | 94 |
| releaseSettlementScratch (12402, src/core/engine/settle/utils/scratch/releaseSettlementScratch.ts) | C | 0.267 | 5.58 | 67 |
| markCommitDeliveries (13756, src/core/engine/settle/utils/commit/markCommitDeliveries.ts) | B | 0.228 | 4.78 | 57 |
| (garbage collector) (0, V8) | GC | 0.175 | 3.66 | 44 |
| advanceFieldNodeRevision (7522, src/core/engine/record/utils/advanceFieldNodeRevision.ts) | OTHER | 0.138 | 2.89 | 34 |
| clear (7306, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 0.138 | 2.89 | 35 |
| commitSettlement (13994, src/core/engine/settle/utils/commit/commitSettlement.ts) | B | 0.129 | 2.70 | 33 |
| exitFieldNodeChain (17786, src/core/engine/write/utils/chain/exitFieldNodeChain.ts) | C | 0.107 | 2.25 | 27 |
| beginPostOrder (7215, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 0.104 | 2.17 | 25 |
| resolvePointer (1041, src/helpers/jsonPointer/utils/resolvePointer.ts) | OTHER | 0.097 | 2.04 | 24 |
| consume (7299, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 0.091 | 1.91 | 23 |
| registerRecalculation (12224, src/core/engine/settle/utils/dependencies/registerRecalculation.ts) | B | 0.087 | 1.81 | 22 |
| sameValue (4692, src/core/engine/utils/compute/sameValue.ts) | OTHER | 0.082 | 1.72 | 21 |
| computeStableNode (11871, src/core/engine/settle/utils/compute/utils/computeStableNode.ts) | OTHER | 0.077 | 1.61 | 19 |
| commitGlobalState (13538, src/core/engine/settle/utils/commit/commitGlobalState.ts) | OTHER | 0.076 | 1.58 | 19 |
| flushQueuedEvents (17700, src/core/engine/write/utils/chain/flushQueuedEvents.ts) | C | 0.069 | 1.44 | 17 |
| add (7238, src/core/engine/settle/utils/scratch/DirtyPathSet.ts) | OTHER | 0.069 | 1.44 | 17 |
| finishSettlement (15619, src/core/engine/settle/utils/settlement/finishSettlement.ts) | C | 0.063 | 1.32 | 16 |
| hasOwnProperty (3, packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs) | OTHER | 0.061 | 1.27 | 15 |
| writeFieldNode (15755, src/core/engine/settle/utils/write/writeFieldNode.ts) | C | 0.053 | 1.10 | 13 |
| markWrite (10401, src/core/engine/settle/utils/input/markWrite.ts) | OTHER | 0.052 | 1.08 | 13 |
| resolveFieldNodeChainRoot (17608, src/core/engine/write/utils/chain/resolveFieldNodeChainRoot.ts) | OTHER | 0.048 | 0.99 | 12 |
| isTreeNode (13816, src/core/engine/settle/utils/commit/markCommitDeliveries.ts) | OTHER | 0.043 | 0.90 | 11 |
| (anonymous) (14035, src/core/engine/settle/utils/commit/commitSettlement.ts) | OTHER | 0.041 | 0.85 | 10 |
| FieldNodeRevisionLedger (7446, src/core/engine/record/utils/FieldNodeRevisionLedger.ts) | A | 0.036 | 0.74 | 9 |
| dirtyChildren (7318, src/core/engine/settle/utils/compute/dirtyChildren.ts) | OTHER | 0.035 | 0.74 | 9 |
| computeNodeBody (12005, src/core/engine/settle/utils/compute/computeNode.ts) | OTHER | 0.032 | 0.67 | 8 |
| parsePointerSegment (921, src/helpers/jsonPointer/utils/parsePointerSegment.ts) | OTHER | 0.032 | 0.66 | 8 |
| computeNode (12178, src/core/engine/settle/utils/compute/computeNode.ts) | B | 0.028 | 0.58 | 7 |
| readFormattedPointerSegment (1066, src/helpers/jsonPointer/utils/readFormattedPointerSegment.ts) | OTHER | 0.028 | 0.58 | 7 |
| runBlocks (11, packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/helpers/runBlocks.mjs) | OTHER | 0.027 | 0.57 | 7 |
| captureFieldNodeChange (7617, src/core/engine/record/utils/captureFieldNodeChange.ts) | OTHER | 0.027 | 0.57 | 7 |
| markSilent (13818, src/core/engine/settle/utils/commit/markCommitDeliveries.ts) | OTHER | 0.024 | 0.50 | 6 |
| getStaticChoices (8649, src/core/engine/behaviors/utils/options/getStaticChoices.ts) | OTHER | 0.024 | 0.49 | 6 |
| createSettlementContext (12563, src/core/engine/settle/utils/settlement/createSettlementContext.ts) | C | 0.024 | 0.49 | 6 |
| collectChainRecords (17536, src/core/engine/write/utils/report/collectChainRecords.ts) | OTHER | 0.020 | 0.42 | 5 |
| writeObjectKey (9137, src/core/engine/utils/writeObjectKey.ts) | OTHER | 0.020 | 0.41 | 5 |
| enterFieldNodeChain (17379, src/core/engine/write/utils/chain/enterFieldNodeChain.ts) | C | 0.020 | 0.41 | 5 |
| delete (12713, src/core/engine/utils/pathIndex/utils/PathStoreIndex.ts) | OTHER | 0.016 | 0.34 | 4 |

GC 3.66%. program·idle의 가중 몫 2.92%.

OTHER 전체:

| 함수 (URL:줄) | self µs/동작 |
| --- | ---: |
| advanceFieldNodeRevision (prepared/engine.mjs:7522) | 0.138 |
| clear (prepared/engine.mjs:7306) | 0.138 |
| beginPostOrder (prepared/engine.mjs:7215) | 0.104 |
| resolvePointer (prepared/engine.mjs:1041) | 0.097 |
| consume (prepared/engine.mjs:7299) | 0.091 |
| sameValue (prepared/engine.mjs:4692) | 0.082 |
| computeStableNode (prepared/engine.mjs:11871) | 0.077 |
| commitGlobalState (prepared/engine.mjs:13538) | 0.076 |
| add (prepared/engine.mjs:7238) | 0.069 |
| hasOwnProperty (packages/winglet/common-utils/dist/libs/hasOwnProperty.mjs:3) | 0.061 |
| markWrite (prepared/engine.mjs:10401) | 0.052 |
| resolveFieldNodeChainRoot (prepared/engine.mjs:17608) | 0.048 |
| isTreeNode (prepared/engine.mjs:13816) | 0.043 |
| (anonymous) (prepared/engine.mjs:14035) | 0.041 |
| dirtyChildren (prepared/engine.mjs:7318) | 0.035 |
| computeNodeBody (prepared/engine.mjs:12005) | 0.032 |
| parsePointerSegment (prepared/engine.mjs:921) | 0.032 |
| readFormattedPointerSegment (prepared/engine.mjs:1066) | 0.028 |
| runBlocks (packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/helpers/runBlocks.mjs:11) | 0.027 |
| captureFieldNodeChange (prepared/engine.mjs:7617) | 0.027 |
| markSilent (prepared/engine.mjs:13818) | 0.024 |
| getStaticChoices (prepared/engine.mjs:8649) | 0.024 |
| collectChainRecords (prepared/engine.mjs:17536) | 0.020 |
| writeObjectKey (prepared/engine.mjs:9137) | 0.020 |
| delete (prepared/engine.mjs:12713) | 0.016 |
| affected (prepared/engine.mjs:5637) | 0.016 |
| rebuildRootExternalErrors (prepared/engine.mjs:17420) | 0.016 |
| visit (prepared/engine.mjs:13564) | 0.016 |
| publishGlobalStateDeltas (prepared/engine.mjs:7697) | 0.016 |
| flushPresenceTemplates (prepared/engine.mjs:5870) | 0.013 |
| canOmitFieldNodePayload (prepared/engine.mjs:7545) | 0.012 |
| dispatchSetValue (prepared/engine.mjs:18002) | 0.012 |
| staticSpec (prepared/engine.mjs:9487) | 0.012 |
| get isPostOrder (prepared/engine.mjs:7120) | 0.012 |
| deliverChainRecords (prepared/engine.mjs:17300) | 0.011 |
| bundleChainErrors (prepared/engine.mjs:17493) | 0.008 |
| refuseInactiveResolverWrite (prepared/engine.mjs:17325) | 0.008 |
| get gateSelection (prepared/engine.mjs:1200) | 0.008 |
| interpret (prepared/engine.mjs:9043) | 0.008 |
| effectiveType (prepared/engine.mjs:13440) | 0.008 |
| omitEmptyObject (prepared/engine.mjs:9123) | 0.008 |
| isMisfit (prepared/engine.mjs:10579) | 0.008 |
| get schemaType (prepared/engine.mjs:18939) | 0.008 |
| hrtimeBigInt (V8:0) | 0.004 |
| isSameDeliveryValue (prepared/engine.mjs:7753) | 0.004 |
| get mutations (prepared/engine.mjs:18830) | 0.004 |
| projectObject (prepared/engine.mjs:9130) | 0.004 |
| delete (prepared/engine.mjs:18846) | 0.004 |
| isMember (prepared/engine.mjs:9025) | 0.004 |
| isTypeName (prepared/engine.mjs:13447) | 0.004 |
| get raw (prepared/engine.mjs:18993) | 0.004 |
| get rootNode (prepared/engine.mjs:18963) | 0.004 |
| setValue (prepared/engine.mjs:19068) | 0.004 |
| clearFieldNodeChanges (prepared/engine.mjs:7729) | 0.004 |
| refuseDetachedWrite (prepared/engine.mjs:17987) | 0.004 |
| assertFieldNodeWritable (prepared/engine.mjs:12327) | 0.004 |
| get name (prepared/engine.mjs:18969) | 0.004 |
| projectEmpty (prepared/engine.mjs:9361) | 0.004 |

## 15 µs 착수 조건

- A의 계약상 네 작업 self 합(왕복): 0.481 µs; 15 µs 미만. 분석으로 닫힘.
  A 확장 합(createFieldNode·getSlotChildIndex 포함)은 0.895 µs이며 주 판정을 대체하지 않습니다. getSlotChildIndex는 슬롯 순서·정리 함수 네 곳에서도 불리므로 이 확장 합은 A가 없애는 몫보다 클 수 있습니다.
  게이트 평가(서술자 열쇠 계산, B 결정 합 제외)는 0.138 µs입니다.
- B의 서술자가 대신하는 함수 self 합(보조 함수 제외, 한 전환): 3.451 µs; 15 µs 미만. 착수 조건 미충족.
  게이트 평가(서술자 열쇠 계산, B 결정 합 제외)는 0.428 µs입니다.

oneOf 왕복 갈래 A 9.82%, B 23.67%를 20% 선과 비교합니다. 둘 다 20% 미만이라는 폐기 조건에는 해당하지 않습니다.

계약상 네 작업은 생성자, cloneSlotSubtree 재귀, overlay Map 복사, getRetainedChildEntry 탐색입니다. overlay Map 복사는 cloneSlotSubtree self에 들어 있으므로 두 번 더하지 않습니다. 확장 합은 createFieldNode와 getSlotChildIndex self를 추가합니다. B 수치는 매핑되지 않은 JavaScript 보조 함수를 뺀 합입니다. 독립 합성 탐침에서는 V8이 인라인된 JavaScript 함수를 자기 이름으로 귀속하고 Map 같은 내장 함수 시간은 호출한 JavaScript self에 귀속했습니다. 실제 행은 보고된 프레임 그대로 기록합니다. 매핑 근거와 나감 클로저의 URL·줄은 branches.json에 있습니다.

## single-flat-1000 고정비 주인

- releaseSettlementScratch (C, prepared/engine.mjs:12402): 0.267 µs/잎 쓰기, 표본 67개.
- exitFieldNodeChain (C, prepared/engine.mjs:17786): 0.107 µs/잎 쓰기, 표본 27개.
- flushQueuedEvents (C, prepared/engine.mjs:17700): 0.069 µs/잎 쓰기, 표본 17개.
- finishSettlement (C, prepared/engine.mjs:15619): 0.063 µs/잎 쓰기, 표본 16개.
- writeFieldNode (C, prepared/engine.mjs:15755): 0.053 µs/잎 쓰기, 표본 13개.
- createSettlementContext (C, prepared/engine.mjs:12563): 0.024 µs/잎 쓰기, 표본 6개.
- enterFieldNodeChain (C, prepared/engine.mjs:17379): 0.020 µs/잎 쓰기, 표본 5개.
- runDeliveryWaves (C, prepared/engine.mjs:17679): 0.008 µs/잎 쓰기, 표본 2개.
- getSettlementScratch (C, prepared/engine.mjs:12366): 0.008 µs/잎 쓰기, 표본 2개.
- publishStateKeys (C, prepared/engine.mjs:14259): 0.008 µs/잎 쓰기, 표본 2개.
- startFieldNodeChain (C, prepared/engine.mjs:17361): 0.004 µs/잎 쓰기, 표본 1개.
- advanceFieldNodeRevision (OTHER, prepared/engine.mjs:7522): 0.138 µs/잎 쓰기, 표본 34개.
- clear (OTHER, prepared/engine.mjs:7306): 0.138 µs/잎 쓰기, 표본 35개.
- beginPostOrder (OTHER, prepared/engine.mjs:7215): 0.104 µs/잎 쓰기, 표본 25개.
- resolvePointer (OTHER, prepared/engine.mjs:1041): 0.097 µs/잎 쓰기, 표본 24개.
- consume (OTHER, prepared/engine.mjs:7299): 0.091 µs/잎 쓰기, 표본 23개.

## Ⅳ-0 장부와의 관계

Ⅳ-0 §1의 E plain 값은 프로세스 최소값들의 중앙값이며, oneOf 157.146 µs/왕복, siblings 56.708 µs/쓰기, single-flat 56.812 µs/10쓰기입니다. 아래 비교는 수집기 없는 별도 plain의 블록 중앙값을 사용하며 집계법·단계 머리·Node 버전이 달라 개선 판정으로 쓰지 않습니다. §4의 no-op 고정비와 switch 증가분은 인과적 제거 가능 비용이 아니며, §5의 쓰기 진입·사슬 종료·finish 잔여는 이번 C와 OTHER의 실제 함수로 나뉩니다. 단계 inclusive 값과 함수 self를 더하거나 기존 계측 오버헤드를 이번 self에서 빼지 않습니다.

| 행 | Ⅳ-0 E plain(동작당 환산) µs | 이번 별도 plain 중앙 µs | 참고 비율 |
| --- | ---: | ---: | ---: |
| switch-oneOf-80 | 157.146 | 71.490 | 0.4549 |
| switch-siblings-0 | 56.708 | 13.725 | 0.2420 |
| single-flat-1000 | 5.681 | 4.265 | 0.7507 |
