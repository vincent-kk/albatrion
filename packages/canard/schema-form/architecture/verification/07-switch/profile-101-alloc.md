# 101 중간 구조별 할당·종단 제거 상한

HEAD `619798ddc6d6c70f27e1a7058421b94a4a6713b1`, source tree `e04227e4378968282541c7bc072edd7ddff6437c`, Apple M1 Max, Node v26.10.0, V8 14.6.202.34-node.35. 측정은 지정 stage-07 worktree에서만 순차 실행했습니다. 제품 코드·git·설치는 변경하지 않았습니다.

청사진 병합, 선언 수집, key 인코딩, 자식 입력/binding의 제거가 주요 후보입니다. 노드 staging과 frame 재사용은 할당을 줄이더라도 시간 이득을 보장하지 않았습니다. runtime node 공유는 nested/flat에서 크게 퇴행했습니다. oneOf에서는 gate/projected read, 경로, dependency index도 비용 묶음입니다.

## 집계와 해석

기존 보강의 303개 창을 재사용했습니다. 이 HEAD의 제품 source tree와 기존 bundle의 source tree가 같습니다. 아래 ‘객체’는 1-byte V8 allocation sample 수이며 정확한 JavaScript 객체 수가 아닙니다. 기본 allocation folding으로 한 sample이 여러 JS 객체를 담을 수 있습니다. major/minor로 수거한 할당도 포함했습니다. byte/평균 크기로 개수를 추정하지 않았습니다.

native leaf 자기 할당을 가장 가까운 제품 source owner에 한 번만 귀속했습니다. 함수 안의 record/array/iterator별 정확한 byte 분해는 원 profile에 없으므로 **중간 구조의 source family 단위**로 집계했습니다. 최종 기록과 폐기 구조를 함께 만드는 함수는 보존/폐기 항목을 따로 밝혔습니다. 특히 frame 1,365개를 load site 전체 표본 16,734개와 혼동하지 않습니다. getTemplateKey 실험이 지우는 hostPaths/boundKey 표본은 buildNodes 칸에 귀속되어 있습니다. 각 표본을 이중 집계하지 않았습니다.

## mount당 객체·bytes

각 셀은 **객체 / bytes**입니다. 303개 창 산술 평균을 각각 반올림했습니다.

| 묶음 | nested-d5-f4 | flat-500 | oneOf-20 |
|---|---:|---:|---:|
| 선언·fragment 기록 및 수집 작업 벡터 | 43,060 / 2,516,906 | 16,020 / 892,451 | 3,009 / 176,205 |
| 노드 기록·타입 group·생성용 staging 벡터 | 40,155 / 3,514,383 | 14,786 / 1,194,487 | 3,104 / 239,494 |
| 자식 SchemaInput·binding 선언·작업 배열 | 50,407 / 2,970,719 | 19,217 / 1,008,230 | 2,834 / 143,863 |
| 정규화·병합 state·memo 및 결과 | 40,541 / 2,844,654 | 15,600 / 1,086,290 | 2,698 / 169,185 |
| allowed-type 임시 배열 | 19,110 / 1,365,081 | 7,014 / 501,052 | 2,628 / 132,108 |
| 전략 판정 case tree와 필터 벡터 | 16,358 / 1,102,289 | 5,020 / 349,383 | 946 / 63,082 |
| template-key 문자열·인코딩 배열 | 15,895 / 825,676 | 6,230 / 279,783 | 1,302 / 63,288 |
| 첫 로드 frame 및 load 작업 슬롯 | 19,306 / 2,224,184 | 6,415 / 786,218 | 1 / 48 |
| 런타임 노드 및 초기 container | 8,541 / 914,952 | 2,518 / 325,762 | 52 / 5,166 |
| 값 조립 Map·names·Set·출력 record | 6,377 / 372,407 | 1,702 / 456,963 | 868 / 40,101 |
| 의존 경로 segment·바인딩 문자열 | 0 / 0 | 0 / 0 | 5,128 / 228,957 |
| gate 입력·projected 읽기·read plan·binding 슬롯 | 0 / 0 | 0 / 0 | 13,266 / 662,969 |
| 자식 선택 next·active·ids·seen 벡터 | 0 / 0 | 0 / 0 | 2,762 / 134,241 |
| 역의존 trie·owner record·선언 dictionary | 0 / 0 | 0 / 0 | 3,737 / 179,253 |
| 기타 (<2% source owner만 남음) | 14,807 / 886,153 | 8,040 / 418,133 | 5,676 / 329,347 |
| **전체** | 274,559 / 19,537,403 | 102,562 / 7,298,750 | 48,011 / 2,567,309 |

청사진 / 그외 객체: nested-d5-f4 236,708 / 37,850; flat-500 88,422 / 14,139; oneOf-20 18,179 / 29,832. JSON에는 묶음별 청사진/그외 객체·bytes와 모든 source owner를 보존했습니다.

## 보존·폐기 구조와 제거 빌드

### 선언·fragment 기록 및 수집 작업 벡터 — declarations

- 보존: fragment, 원본 declaration, order/gates 및 fragment의 declares/overlays/inheritedOverlays/children 배열은 청사진에 남습니다.
- 폐기: 방문 stack, 재귀 result 배열, keyword tuple iterator는 분석 뒤 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/blueprint/utils/analyze/collectDeclarations.ts:27` (collectDeclarations). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: collectDeclarations의 최외곽 호출 결과와 생성 fragment를 seed tape에서 가져오고 ID/capability/owner 상태만 재생합니다. 재귀 생산·검사 전체를 생략합니다.
- 상한의 범위: readAllowedTypes와 정적 진단 같은 하위 계산도 생략합니다. 타입 묶음과 상한을 더할 수 없습니다.

### 노드 기록·타입 group·생성용 staging 벡터 — node-staging

- 보존: 최종 BlueprintNode, node.declarations, childEntries, union일 때 schemaType 배열은 남습니다.
- 폐기: type group, collected→owned/conjunction 복사, nonNull staging, 로컬 nodes 벡터 및 static merge용 node 복사본은 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/blueprint/utils/analyze/buildNodes.ts:25` (buildNodes), `core/blueprint/utils/types/resolveNodeTypes.ts:17` (resolveNodeTypes), `core/blueprint/utils/types/resolveNodeTypes.ts:111` ((anonymous)), `core/blueprint/utils/types/resolveNodeTypes.ts:114` ((anonymous)), `core/blueprint/utils/types/resolveNodeTypes.ts:29` ((anonymous)), `core/blueprint/utils/types/resolveNodeTypes.ts:25` ((anonymous)). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: resolveNodeTypes 결과, nonNull 및 nodes 벡터를 재사용하고 collected/owned/conjunction staging을 기존 선언 배열로 대체합니다. 최종 노드 객체는 새로 만듭니다.
- 상한의 범위: 타입 판정 및 readAllowedTypes를 생략합니다. buildNodes의 hostPaths/boundKey 할당도 이 귀속 칸에 들어가지만 key 실험에서 제거합니다.

### 자식 SchemaInput·binding 선언·작업 배열 — child-bindings

- 보존: child entry, 경로에 바인딩한 declaration 복사본 및 entry.declarations/gates는 청사진에 남습니다.
- 폐기: properties/tuples Map, SchemaInput, order/gate 병합 배열, entries tuple과 filter/map 작업 결과·callback은 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/blueprint/utils/analyze/populateNodeChildren.ts:73` ((anonymous)), `core/blueprint/utils/analyze/populateNodeChildren.ts:19` (populateNodeChildren), `core/blueprint/utils/analyze/populateNodeChildren.ts:163` ((anonymous)), `core/blueprint/utils/analyze/populateNodeChildren.ts:31` ((anonymous)). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: 자식 입력 수집 결과와 binding 선언 배열을 재사용합니다. fragment 참조는 현재 context에 연결합니다. buildNodes 재귀 호출과 최종 child entry 생성은 유지합니다.
- 상한의 범위: 입력 수집 및 바인딩 callback의 계산도 생략합니다. SchemaInput 자체를 공유하는 실험이며 생산용 안전한 공유는 아닙니다.

### 정규화·병합 state·memo 및 결과 — effective-merge

- 보존: 정규화 schema/effective 결과는 실제 blueprint node를 key로 하는 DEFAULT_NO_ACTIVE/DEFAULT_MEMO 또는 runtime node.schema에서 유지됩니다.
- 폐기: static 임시 node 복사본을 key로 만든 memo, 기여 state, patterns/types/선택 선언/key 배열은 버립니다. 이 static memo는 청사진 본체에 남지 않습니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` (mergeEffectiveSchema), `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36` (applySchemaContribution), `core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:13` (finalizeEffectiveSchema), `core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9` (selectEffectiveDeclarations), `core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:36` (applyConstraintKeywords), `core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15` (ensureEffectiveSchemaCache), `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27` (mergeSchemaContributions), `core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:14` ((anonymous)), `core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:21` ((anonymous)), `core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:41` ((anonymous)), `core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:18` ((anonymous)). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: mergeEffectiveSchema 전체 결과를 호출 순서 tape에서 가져오며 state, memo, 정규화 결과를 clock 안에 만들지 않습니다.
- 상한의 범위: apply/finalize/타입 읽기·정적 검사도 생략합니다. 타입·선언 상한과 더하지 않습니다.

### allowed-type 임시 배열 — allowed-types

- 보존: 일부 결과가 최종 union schemaType/정규화 type에 사용됩니다. scalar 노드에서는 allowed 배열 자체가 청사진 필드로 남지 않습니다.
- 폐기: values/result/union 입력, group의 allowed 배열과 타입 읽기 callback 대부분을 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/blueprint/utils/types/readAllowedTypes.ts:19` (readAllowedTypes), `core/blueprint/utils/types/inferAllowedTypes.ts:27` (inferAllowedTypes), `core/blueprint/utils/types/unionAllowedTypes.ts:8` (unionAllowedTypes), `core/blueprint/utils/types/foldAllowedTypes.ts:8` (foldAllowedTypes), `core/blueprint/utils/types/intersectAllowedTypes.ts:9` (intersectAllowedTypes). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: readAllowedTypes 결과를 재사용하여 이 함수가 만드는 타입 배열과 검사를 생략합니다. 다른 타입 helper의 독립 호출과 최종 schemaType는 남습니다.
- 상한의 범위: 검증·union 계산도 생략합니다. 수집·병합·type group 재사용과 중복됩니다.

### 전략 판정 case tree와 필터 벡터 — strategy-cases

- 보존: branch/terminal 문자열만 노드에 남습니다.
- 폐기: count/relevant 필터, case record/Map, pending stack, gate key와 callback은 전부 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/blueprint/utils/types/resolveNodeStrategy.ts:14` (resolveNodeStrategy), `core/blueprint/utils/types/resolveNodeStrategy.ts:43` ((anonymous)), `core/blueprint/utils/types/resolveNodeStrategy.ts:23` ((anonymous)), `core/blueprint/utils/types/resolveNodeStrategy.ts:20` ((anonymous)). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: resolveNodeStrategy의 반환 문자열을 재사용합니다. case tree·필터·정적 terminal 검사는 clock 안에서 만들거나 실행하지 않습니다.
- 상한의 범위: 순수 할당 비용뿐 아니라 진단·renderer 판정 비용도 빠집니다.

### template-key 문자열·인코딩 배열 — template-keys

- 보존: constructing/templates Map의 key로 분석 중 유지되며 최종 청사진에는 남지 않습니다.
- 폐기: inputs/gates tuple, 중복 제거 배열, hostPaths 및 두 JSON 인코딩용 배열·문자열은 분석 뒤 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/blueprint/utils/analyze/getTemplateKey.ts:16` ((anonymous)), `core/blueprint/utils/analyze/getTemplateKey.ts:11` (getTemplateKey), `core/blueprint/utils/analyze/getTemplateKey.ts:23` ((anonymous)). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: getTemplateKey + hostPaths + boundKey 결과를 재사용합니다. key 생성·JSON 인코딩·중복 제거를 생략하고 실제 template lookup은 유지합니다.
- 상한의 범위: hostPaths/boundKey의 source sample은 node-staging에 귀속됩니다. 표의 개수는 중복 없이 귀속한 값이고 이 상한은 그 칸 일부도 제거합니다.

### 첫 로드 frame 및 load 작업 슬롯 — first-load-frames

- 보존: runtime의 structure/children 및 최종 value는 남습니다. 청사진에 load frame은 남지 않습니다.
- 폐기: DFS Frame, stack, warning/delta 작업 슬롯은 mount 정착 뒤 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/settle/utils/load/loadStaticFirstTree.ts:42` (loadStaticFirstTree), `core/settle/utils/load/readStaticFirstWarning.ts:14` (readStaticFirstWarning), `core/settle/utils/load/assembleStaticFirstNode.ts:11` (assembleStaticFirstNode), `core/settle/utils/load/commitStaticFirstNode.ts:13` (commitStaticFirstNode), `core/settle/utils/load/finishStaticFirstLoad.ts:19` (finishStaticFirstLoad), `core/settle/utils/load/getStaticObjectEntries.ts:11` (getStaticObjectEntries), `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` (loadSchemaNodeAtMount). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: DFS Frame만 pool에서 재사용하고 node/input/index/flags를 초기화합니다. 구조·children·warning/delta의 필수 최종 기록과 실제 load/commit은 유지합니다.
- 상한의 범위: 전체 load site가 아니라 frame 제거의 상한입니다. nested의 1,365 frame을 없애도 전체 site 16,734 표본이 모두 없어지는 것은 아닙니다.

### 런타임 노드 및 초기 container — runtime-nodes

- 보존: RuntimeSchemaNode와 structure/children/interactionState는 runtime graph에 남습니다. 청사진 객체는 아닙니다.
- 폐기: factory의 경로 문자열·options 및 최초 load가 교체하는 branch placeholder container는 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/SchemaNode/utils/schemaNodeFactory.ts:29` (createSchemaNode), `core/SchemaNode/utils/schemaNodeFactory.ts:60` (schemaNodeFactory), `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` (buildSchemaNodeTree), `core/SchemaNode/SchemaNode.ts:154` (get path), `core/SchemaNode/SchemaNode.ts:148` (get name), `core/SchemaNode/SchemaNode.ts:160` (get raw), `core/SchemaNode/SchemaNode.ts:163` (get extras), `core/SchemaNode/SchemaNode.ts:157` (get children), `core/SchemaNode/SchemaNode.ts:139` (get depth). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: createSchemaNode 결과를 seed에서 재사용합니다. 실제 RuntimeSchemaNode 생성 및 초기 container를 만들지 않습니다. runtime graph까지 공유합니다.
- 상한의 범위: 잘못된 runtime 공유로 다른 settle 경로를 탈 수 있습니다. 정상적인 새 node 생성의 순수 비용과 동일시하지 않습니다.

### 값 조립 Map·names·Set·출력 record — object-assembly

- 보존: 조립한 object/patch는 local/emit에, STABLE_SHAPES names는 runtime node 수명 동안 남습니다.
- 폐기: childValues Map, seen Set, oldNames, 조립 작업 벡터는 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` (assembleObject). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: assembleObject 결과 object를 재사용하여 조립용 자료구조와 최종 output object 모두를 만들지 않습니다.
- 상한의 범위: 값 조립 계산 및 STABLE_SHAPES 등록도 생략합니다. 최종 값 object의 소유권 검증이 없습니다.

### 의존 경로 segment·바인딩 문자열 — dependency-paths

- 보존: 정규 경로 일부는 dependency trie/registry에 남습니다. 대부분의 단기 경로는 청사진에 남지 않습니다.
- 폐기: split/filter parts 및 상대 경로 slice/join 결과 대부분은 읽기 뒤 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/settle/utils/paths/resolveDependencyPath.ts:7` (resolveDependencyPath). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: resolveDependencyPath의 정규 경로 문자열을 재사용하여 segment 배열 및 계산을 만들지 않습니다.
- 상한의 범위: gate 및 dependency-index 재사용이 이 함수의 호출도 제거합니다.

### gate 입력·projected 읽기·read plan·binding 슬롯 — gate-workspaces

- 보존: registry의 occurrence/host binding, READ_PLANS의 occurrence 배열은 node/blueprint 수명 동안 남습니다.
- 폐기: 평가용 host/input 복사본, projected path 배열, evaluation callback, pending flush closure는 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/settle/utils/gates/readProjectedValue.ts:25` (readProjectedValue), `core/settle/utils/gates/evaluateGate.ts:26` (evaluateGate), `core/settle/utils/gates/flushPendingGateReads.ts:30` (flushPendingGateReads), `core/settle/utils/gates/flushPendingGateReads.ts:41` (visit), `core/settle/utils/gates/getGateRegistry.ts:50` (register), `core/settle/utils/gates/flushPendingGateReads.ts:74` (flushRead), `core/settle/utils/gates/flushPendingGateReads.ts:89` (flushGate), `core/settle/utils/gates/getGateBudgetCap.ts:22` (getIndex), `core/settle/utils/gates/getGateBudgetCap.ts:36` (collect), `core/settle/utils/gates/getGateRegistry.ts:113` (mayChangeAt), `core/settle/utils/gates/getGateRegistry.ts:121` (mayChangeOwnDeclarationAt), `core/blueprint/utils/analyze/collectGateEvaluationReads.ts:8` (collectGateEvaluationReads). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: evaluateGate의 boolean을 재사용하고 flushPendingGateReads를 생략합니다. 입력 복사·projected read·read-plan 생산을 clock 안에서 하지 않습니다.
- 상한의 범위: 경로 해석·expression 평가·registry 접근·출력 flush도 빠집니다. 경로/index 상한과 더하지 않습니다.

### 자식 선택 next·active·ids·seen 벡터 — selection-workspaces

- 보존: next structure/children과 selected declaration IDs는 runtime/settlement에 남습니다. STATIC_SHAPES/STATIC_IDS는 blueprint key의 cache입니다.
- 폐기: seen/inactive/active 작업 배열, priorNames 등의 선택 workspace는 settle 뒤 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/settle/utils/compute/selectChildren.ts:82` (selectChildren). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: next record, seen Set, inactive/active/ids/children 배열을 pool에서 재사용합니다. 실제 gate 평가·자식 생성·선택 루프는 실행합니다.
- 상한의 범위: Set.clear 뒤 backing storage와 retained array 재사용의 위험은 남습니다. 대부분의 branchless fixture는 이 경로를 사용하지 않습니다.

### 역의존 trie·owner record·선언 dictionary — dependency-index

- 보존: owner/children trie와 ownerPaths Set은 blueprint를 key로 한 INDEXES에서 유지됩니다.
- 폐기: declaration dictionary, entries tuple, path segment 및 constructor 작업 배열은 버립니다.
- 생산 site (PKG/src 기준, line은 함수 진입 source-map 위치): `core/settle/utils/write/getDependencyIndex.ts:119` (add), `core/settle/utils/write/getDependencyIndex.ts:32` (DependencyIndex), `core/settle/utils/write/getDependencyIndex.ts:39` ((anonymous)), `core/settle/utils/write/getDependencyIndex.ts:40` ((anonymous)), `core/settle/utils/write/getDependencyIndex.ts:83` (collect), `core/settle/utils/write/getDependencyIndex.ts:75` (affected), `core/settle/utils/write/getDependencyIndex.ts:108` ((anonymous)), `core/settle/utils/write/getDependencyIndex.ts:161` (getDependencyIndex). 나머지는 JSON sourceSites를 참조하십시오.
- 측정 빌드: getDependencyIndex 결과를 재사용하여 새 trie, owner record, 선언 dictionary를 만들지 않습니다.
- 상한의 범위: derive/context-owner/index 준비 및 경로 해석도 생략합니다. 같은 fixture를 새 blueprint마다 재사용하는 비제품 실험입니다.

## 두 종단 시간 열

각 fixture/묶음/회차는 새 Node process입니다. 엔진별 warmup 정확히 20 뒤 101쌍을 교대로 마운트하고 첫 순서는 H–V / V–H / H–V입니다. seed는 variant의 첫 예열에서 캡처하며 별도 마운트를 추가하지 않습니다. 각 엔진 실제 호출 수는 121로 검사했습니다. clone은 clock 밖입니다. 강제 GC 열은 GC와 그 뒤 setImmediate check anchor도 밖입니다. steady는 엔진마다 101개 연속 fresh mount×3이며 강제 GC/anchor를 넣지 않습니다. 두 열 모두 64 Promise checkpoint 뒤 sentinel **안에서** 종료 clock을 캡처했습니다. 앞/뒤 pooled 202개 빈 종단 중앙값을 두 엔진에 같은 값으로 뺐습니다.

표는 회차별 **HEAD median − variant median** 3개의 중앙값(ms)입니다. 양수는 제거 빌드가 빠른 방향이고 음수는 퇴행입니다. **↑**는 세 회차 모두 잡음 폭을 넘는 양수, **↓**는 세 회차 모두 음의 잡음 폭을 넘는 퇴행입니다. °는 seed/측정에서 대상 호출이 없는 칸이며 그 차이를 구조 비용으로 해석하지 않습니다. 표시 없는 값은 이 보수적 문턱을 통과하지 못했습니다.

잡음은 max(1µs, 같은 fixture/regime no-op 회차 abs bound 최대, 빈 대기 residual p95 + 두 median의 ordinary bootstrap 99% 오차 합)입니다. 1,999회 deterministic bootstrap을 사용했습니다. 연속 표본의 독립성이나 생산 개선의 통계적 유의성을 보장하는 표시는 아닙니다. 특히 flat steady 대조군이 큰 편차를 보여 이 열의 작은 차이는 채택하지 않았습니다.

| fixture | no-op 강제 GC 최대 abs ms | no-op steady 최대 abs ms |
|---|---:|---:|
| nested-d5-f4 | 0.7056 | 0.1996 |
| flat-500 | 0.1425 | 0.9402 |
| oneOf-20 | 0.0093 | 0.0519 |
| sample-0 | 0.0007 | 0.0041 |

### nested-d5-f4

| 묶음 | 강제 GC 상한 ms | steady 상한 ms | 최대 잡음 GC / steady ms |
|---|---:|---:|---:|
| declarations | 1.1096 **↑** | 0.6550 | 0.8012 / 1.2782 |
| node-staging | -1.2510 **↓** | -0.5052 | 0.9810 / 1.4337 |
| child-bindings | 0.9232 | 0.8549 | 0.7056 / 1.5622 |
| effective-merge | 1.8158 **↑** | 1.7899 **↑** | 0.7805 / 1.6246 |
| allowed-types | 0.1751 | 0.4119 | 0.8322 / 1.1123 |
| strategy-cases | 0.3664 | 0.1771 | 0.8667 / 1.4680 |
| template-keys | 1.3245 **↑** | 1.0510 | 0.8723 / 1.3645 |
| first-load-frames | -0.3068 | -0.0124 | 1.0922 / 1.4704 |
| runtime-nodes | -7.8326 **↓** | -2.5610 **↓** | 1.3143 / 0.8763 |
| object-assembly | 0.3160 | 0.2183 | 0.9368 / 1.3601 |
| dependency-paths | -0.0826 ° | 0.1863 ° | 0.9046 / 1.2190 |
| gate-workspaces | 0.0316 ° | 0.1990 ° | 0.7056 / 1.0955 |
| selection-workspaces | 0.0117 ° | -0.0318 ° | 0.7235 / 1.0146 |
| dependency-index | 0.0878 ° | 0.1894 ° | 0.8843 / 1.1387 |

### flat-500

| 묶음 | 강제 GC 상한 ms | steady 상한 ms | 최대 잡음 GC / steady ms |
|---|---:|---:|---:|
| declarations | 0.5363 **↑** | -0.4611 | 0.2090 / 0.9402 |
| node-staging | -0.3906 **↓** | -1.0244 | 0.2313 / 0.9402 |
| child-bindings | 0.2250 **↑** | -0.3902 | 0.1750 / 0.9402 |
| effective-merge | 0.5871 **↑** | 0.5928 | 0.1460 / 0.9402 |
| allowed-types | 0.0263 | 0.3025 | 0.1777 / 0.9402 |
| strategy-cases | 0.1060 | -0.1544 | 0.1844 / 0.9412 |
| template-keys | 0.3397 **↑** | 0.3984 | 0.1615 / 0.9402 |
| first-load-frames | -0.0920 | 0.1569 | 0.1780 / 0.9402 |
| runtime-nodes | -1.8297 **↓** | -0.5888 | 0.1679 / 0.9402 |
| object-assembly | 0.1078 | 0.4486 | 0.1898 / 1.0723 |
| dependency-paths | -0.0645 ° | -0.0177 ° | 0.1958 / 1.1049 |
| gate-workspaces | -0.0520 ° | -0.1537 ° | 0.1786 / 0.9402 |
| selection-workspaces | -0.0267 ° | -0.0186 ° | 0.1905 / 0.9402 |
| dependency-index | -0.0687 ° | -0.0288 ° | 0.1877 / 0.9402 |

### oneOf-20

| 묶음 | 강제 GC 상한 ms | steady 상한 ms | 최대 잡음 GC / steady ms |
|---|---:|---:|---:|
| declarations | 0.3194 | 0.1015 | 0.4334 / 0.1469 |
| node-staging | 0.0700 | -0.0260 | 0.0623 / 0.1361 |
| child-bindings | 0.0158 | 0.0369 | 0.0673 / 0.1521 |
| effective-merge | 0.0945 | 0.1139 | 0.1321 / 0.1578 |
| allowed-types | 0.0237 | 0.0246 | 0.1066 / 0.1432 |
| strategy-cases | 0.0644 | 0.0215 | 0.1473 / 0.1200 |
| template-keys | 0.0558 | 0.0865 | 0.1186 / 0.1228 |
| first-load-frames | 0.0096 ° | -0.0235 ° | 0.0918 / 0.1320 |
| runtime-nodes | 0.1246 **↑** | 0.1589 **↑** | 0.0687 / 0.1196 |
| object-assembly | 0.0131 | 0.0495 | 0.0830 / 0.2002 |
| dependency-paths | 0.0895 **↑** | 0.1350 | 0.0821 / 0.1281 |
| gate-workspaces | 0.5031 **↑** | 0.2745 **↑** | 0.0705 / 0.1359 |
| selection-workspaces | -0.1035 **↓** | -0.0683 | 0.0909 / 0.1584 |
| dependency-index | 0.0820 **↑** | 0.1056 | 0.0701 / 0.1473 |

### sample-0

| 묶음 | 강제 GC 상한 ms | steady 상한 ms | 최대 잡음 GC / steady ms |
|---|---:|---:|---:|
| declarations | 0.0122 | 0.0032 | 0.0217 / 0.0271 |
| node-staging | -0.0031 | 0.0003 | 0.0246 / 0.0224 |
| child-bindings | 0.0008 | 0.0030 | 0.0262 / 0.0255 |
| effective-merge | 0.0258 **↑** | 0.0097 | 0.0235 / 0.0243 |
| allowed-types | 0.0039 | 0.0035 | 0.0233 / 0.0237 |
| strategy-cases | 0.0013 | 0.0022 | 0.0256 / 0.0230 |
| template-keys | 0.0079 | 0.0022 | 0.0229 / 0.0244 |
| first-load-frames | 0.0000 | -0.0019 | 0.0234 / 0.0273 |
| runtime-nodes | -0.1020 **↓** | -0.0415 **↓** | 0.0227 / 0.0260 |
| object-assembly | 0.0008 | 0.0025 | 0.0229 / 0.0253 |
| dependency-paths | -0.0022 ° | 0.0002 ° | 0.0240 / 0.0260 |
| gate-workspaces | 0.0001 ° | 0.0004 ° | 0.0232 / 0.0258 |
| selection-workspaces | 0.0013 ° | -0.0013 ° | 0.0230 / 0.0237 |
| dependency-index | -0.0005 ° | -0.0009 ° | 0.0245 / 0.0228 |

상한은 seed 재사용, 계산·검사 생략, retained shape 및 JIT 상태 변화까지 포함합니다. 실제 allocator 시간으로 동일시하거나 서로 합산하지 않습니다. steady에는 자연 GC가 들어갑니다. 회차별 GC 창 수/평균 pause는 JSON에 기록했으며 median 차이에 더하거나 빼지 않았습니다. 강제 GC 표의 clock 안 GC는 모두 0입니다.

## 별도 할당 진단

각 빌드/fixture마다 별도 process에서 seed 1 mount 준비 후 warmup 20 뒤 한 mount를 1-byte profiler로 확인했습니다. 이는 **1회 진단**이며 시간 측정의 정확히 20예열 상태, 303개 창 평균이나 성능 증거와 구별합니다. 같은 source라도 warmup/seed 유지·allocation folding/JIT에 따라 control의 nested 청사진은 191,213개(140.1/node)로 기존 236,708개(173.4/node)와 달랐습니다. 따라서 기존 귀속 개수에서 이 진단의 감소량을 직접 빼지 않습니다. 음수 감소량은 진단에서 오히려 더 할당한 경우입니다.

| 제거 빌드 | nested 객체 감소 | nested 청사진 감소 | flat 객체 감소 | oneOf 객체 감소 |
|---|---:|---:|---:|---:|
| declarations | 22,521 | 22,521 | 6,007 | 4,086 |
| node-staging | 17,289 | 17,289 | 9,582 | 4,443 |
| child-bindings | 38,188 | 38,188 | 13,515 | 1,540 |
| effective-merge | 45,912 | 45,912 | 22,351 | 2,749 |
| allowed-types | 19,110 | 19,110 | 7,010 | 1,740 |
| strategy-cases | 1,504 | 1,504 | 4,508 | 858 |
| template-keys | 16,379 | 16,379 | 10,234 | 1,800 |
| first-load-frames | 1,364 | 0 | 489 | -5 |
| runtime-nodes | -74,980 | -889 | -25,540 | 6,082 |
| object-assembly | 9,525 | -23 | 1,741 | 851 |
| dependency-paths | -23 | -23 | 0 | 4,487 |
| gate-workspaces | 0 | 0 | -12 | 13,087 |
| selection-workspaces | -23 | -23 | 0 | 285 |
| dependency-index | -23 | -23 | -1 | 4,256 |

first-load-frames는 nested에서 1,364개 표본 감소와 시간 퇴행이 함께 나왔습니다. node-staging도 제거된 자료구조가 있어도 시간 개선을 보장하지 않았습니다. source 함수의 큰 개수를 작은 한 literal의 제거량으로 오해하면 안 됩니다.

## 잡음 초과 묶음의 한 변경 수정 사양

우선순위는 큰 종단 상한과 안전하게 한 번에 제거할 수 있는 범위를 함께 반영했습니다. 아래 예산은 173.4/node 기준의 **구조적 계획 범위**입니다. 상한의 전체 절감량을 실제 사양의 절감량으로 쓰지 않았습니다. 소스 구조 추정이며 V8 folding/JIT를 재측정하기 전에는 달성 수치가 아닙니다.

### 1. buildNodes의 일회성 static 정규화에서 memo staging 생략 — effective-merge

- 변경: 일회성 static normalization 전용 경로가 선택 선언을 같은 순서로 mergeSchemaContributions에 넘기고 최종 effective 결과에 바로 씁니다. 임시 node 객체, options-key memo/Map, declaration-ID 문자열 cache를 만들지 않습니다. 실제 node의 DEFAULT_NO_ACTIVE 등록과 일반 runtime/public memo 경로는 유지합니다.
- 동일 계약: isAtomic/collect 전달, 선언 선택 순서, apply/finalize 및 정적 type/const/pattern 오류·경고를 기존과 동일하게 실행합니다. 최종 schema/effective 필드와 freeze 상태를 바꾸지 않습니다.
- 제거 대상: static memo/key와 임시 node/options staging; 최종 schema/effective record는 유지.
- 잡음 초과 근거: nested-d5-f4/forced 1.8158ms (N≤0.7805ms); nested-d5-f4/steady 1.7899ms (N≤1.6246ms); flat-500/forced 0.5871ms (N≤0.1460ms); sample-0/forced 0.0258ms (N≤0.0235ms).
- nested 분석 예산: 8–12개/node 제거, 단독 적용 후 161.4–165.4개/node.

### 2. FRAGMENT_KEYWORDS tuple destructuring을 직접 index 읽기로 변경 — declarations

- 변경: 한 loop에서 const [keyword, rank] 대신 const entry = FRAGMENT_KEYWORDS[keywordIndex], keyword = entry[0], rank = entry[1]로 읽습니다. node마다 반복 생성되는 tuple iterator/next record를 만들지 않습니다.
- 동일 계약: keyword rank/순서, 방문/ref 검출, declaration/fragment ID, gates/order/owner와 validateControlGroups/readAllowedTypes/capability 수집을 그대로 실행합니다. 선언 record 자체의 단순 재사용을 재제안하는 사양이 아닙니다.
- 제거 대상: keyword tuple iteration protocol; final fragment/declaration은 유지.
- 잡음 초과 근거: nested-d5-f4/forced 1.1096ms (N≤0.8012ms); flat-500/forced 0.5363ms (N≤0.2090ms).
- nested 분석 예산: 10–15개/node 제거, 단독 적용 후 158.4–163.4개/node.

### 3. template key 인코딩용 nested 배열을 streaming key로 대체 — template-keys

- 변경: inputs/gates/hostPaths 배열 및 이중 JSON stringify의 배열 staging 대신 동일 문자열을 만드는 key encoder에 직접 씁니다. constructing의 미바인딩 key와 templates의 host 바인딩 key를 두 명시적 모드로 생성하고 기존 JSON 문자열과 byte 단위로 같게 만듭니다.
- 동일 계약: ref-only canonical location, conjunction/declaration context, gate kind/path/negated/appliesWhen dedup와 hostPath 구별, 문자열 escape를 모두 유지합니다. key 문자열 자체가 기존과 같으므로 template/cycle 동치와 충돌 동작도 바꾸지 않습니다. blueprint 필드는 바꾸지 않습니다.
- 제거 대상: key tuple/gate/hostPaths 배열; 최종 두 key 문자열 및 실제 lookup은 유지.
- 잡음 초과 근거: nested-d5-f4/forced 1.3245ms (N≤0.8723ms); flat-500/forced 0.3397ms (N≤0.1615ms).
- nested 분석 예산: 10–16개/node 제거, 단독 적용 후 157.4–163.4개/node.

### 4. 자식 입력 생산을 인자 기반 직접 loop로 결합 — child-bindings

- 변경: Object.entries→forEach와 filter→map→spread 체인을 순서 보존 생산기로 바꾸고 shared appendChildInput(context, node, declaration, name, schema, index, childrenControls)에 인자를 넘깁니다. 이름-스키마의 per-entry tuple 대신 flat snapshot을 사용하고 per-child callback/빈 gate 벡터/복사 단계용 base record 없이 최종 SchemaInput에 직접 씁니다.
- 동일 계약: Object.entries와 같은 own enumerable key 순서와 키/값의 선행 snapshot 및 getter/Proxy trap 순서를 유지한 뒤 callback을 실행합니다. index/order, prototype/escaped 이름, discriminator 입력 복제, children-control gate 순서, array/prefixItems 정적 오류와 virtual 처리, 최종 binding declaration/entry의 내용·freeze를 유지합니다.
- 제거 대상: entries tuple/callback/base/filter-map gate scratch; 필요한 최종 binding record는 유지.
- 잡음 초과 근거: flat-500/forced 0.2250ms (N≤0.1750ms).
- nested 분석 예산: 10–14개/node 제거, 단독 적용 후 159.4–163.4개/node.

### 5. 컴파일된 active gate의 인자형 projected evaluator — gate-workspaces

- 변경: 컴파일된 active expression만 context/hostPath와 shared projected-read 함수를 명시적 인자로 받는 evaluator 경로로 바꿉니다. 빈 host/input object 복사와 read callback closure를 만들지 않습니다. authored function, discriminator, validator-if 경로는 기존 방식으로 유지합니다.
- 동일 계약: projected 값 읽기 및 pending flush의 순서, declaration/gate 등록과 host binding, 예외 포착·boolean 검사·warning/error 코드와 경로·횟수를 유지합니다. gate boolean을 memo하거나 projected state를 다음 mount로 재사용하지 않습니다.
- 제거 대상: compiled active evaluation input/closure; gate/read-plan/registry 기록은 유지.
- 잡음 초과 근거: oneOf-20/forced 0.5031ms (N≤0.0705ms); oneOf-20/steady 0.2745ms (N≤0.1359ms).
- nested 분석 예산: 0–0개/node 제거, 단독 적용 후 173.4–173.4개/node.
- oneOf runtime 예산: 160–800개/mount 제거; cold blueprint에는 절감을 적용하지 않습니다.

### 6. 정규 의존 경로를 occurrence/index 준비 때 한 번 생성 — dependency-paths

- 변경: 같은 blueprint gate host+dependency 쌍의 상대 경로 resolve를 occurrence/index 준비 시 한 번 계산해 binding record에 보관합니다. evaluate/read/flush 단계는 보관된 정규 경로를 사용합니다.
- 동일 계약: array * host의 실제 index 바인딩, ../ 이동과 @/#/absolute 처리 및 JSON Pointer escaping을 유지합니다. projected value 자체는 cache하지 않고 기존 순서로 읽습니다. 동적 host는 해당 occurrence 수명 단위에서 별도로 계산합니다.
- 제거 대상: repeated split/filter/slice/join; distinct path record는 유지.
- 잡음 초과 근거: oneOf-20/forced 0.0895ms (N≤0.0821ms).
- nested 분석 예산: 0–0개/node 제거, 단독 적용 후 173.4–173.4개/node.
- oneOf runtime 예산: 2500–4000개/mount 제거; cold blueprint에는 절감을 적용하지 않습니다.

### 7. trie 삽입의 owner/watch segment를 한 번만 파싱 — dependency-index

- 변경: add에서 반복하던 ownerParts/watchedParts/indexedParts split을 한 번의 parse와 단일 segment walk로 결합합니다. 같은 owner의 parse 결과는 constructor 범위에서 재사용합니다. 노드/owner 레코드에 직접 씁니다.
- 동일 계약: * array watch의 ancestor collapse, bindable 판정, owner dedup/순서와 역의존 질의를 유지합니다. 새 blueprint마다 새 trie를 만들고 INDEXES의 수명/격리를 유지합니다.
- 제거 대상: add의 segment scratch; 필수 trie/owner/Set는 유지.
- 잡음 초과 근거: oneOf-20/forced 0.0820ms (N≤0.0701ms).
- nested 분석 예산: 0–0개/node 제거, 단독 적용 후 173.4–173.4개/node.
- oneOf runtime 예산: 900–1700개/mount 제거; cold blueprint에는 절감을 적용하지 않습니다.

### 8. branch container를 최초 authoritative 단계에서 한 번 생성 — runtime-nodes

- 변경: factory constructor의 일회용 {} / [] placeholder를 늦추고 최초 load/selection이 최종 structure/children을 한 번 생성하도록 합니다. RuntimeSchemaNode는 mount마다 새로 만듭니다.
- 동일 계약: gate가 초기 노드를 읽는 시점과 정착 callback 순서, active/detached/required 및 초기 interactionState를 유지합니다. 서로 다른 mount의 node/runtime/구독은 공유하지 않습니다. 정적 blueprint/warning 처리는 그대로 실행합니다.
- 제거 대상: 폐기되는 branch placeholder; 최종 RuntimeSchemaNode graph는 유지.
- 잡음 초과 근거: oneOf-20/forced 0.1246ms (N≤0.0687ms); oneOf-20/steady 0.1589ms (N≤0.1196ms).
- nested 분석 예산: 0–0개/node 제거, 단독 적용 후 173.4–173.4개/node.
- nested runtime container 예산: 682–1364개/mount 제거; 분석 density에는 절감을 적용하지 않습니다.
- 제한: oneOf의 양수 상한은 runtime 전체 공유 실험입니다. 작은 placeholder 제거가 그 시간 차이를 달성한다는 증거는 없으며, nested/flat에서 큰 퇴행이 있으므로 우선순위가 가장 낮습니다.

사양 채택 시 Blueprint 전체의 id/path/schemaPath/kind/schemaType/strategy, 선언·fragment·entry/gate/order/owner/dependency 및 freeze 상태를 기존 결과와 비교해야 합니다. 잘못된 type/중복 type, allOf 충돌, terminal 불일치, ref/array/control 진단의 코드·schemaPath·details·순서·횟수도 기존대로여야 합니다. 네 fixture의 value hash 일치는 이 계약 검증을 대체하지 않습니다. 이번에는 제품 수정이나 그 테스트를 작성하지 않았습니다.

## 65개/node 전망과 ledger 결정

기존 nested cold 분석은 173.4개/node이고 0.16.0의 **전체 mount**는 약 65.5개/node입니다. 서로 다른 범위의 비교임을 유지합니다. 잡음 초과 묶음의 위 한 변경 사양을 합친 계획은 116.4–135.4개/node이며, 현재 사양만으로 65/node 근접을 입증하지 못합니다. 계획 범위 합도 독립적인 성능/할당 효과 측정은 아닙니다.

동시에 분석 구조를 재사용한 비제품 진단은 nested 43,886개 / 32.2개/node, flat 38.3개/node, oneOf 58.5개/node였습니다. 최종 declaration/fragment/정규화 결과까지 seed에서 가져오고 정적 검사를 생략하는 값입니다. **65보다 낮은 이상화 제거 결과가 있어도 동일 계약 사양으로 65를 달성했다는 뜻은 아닙니다.** 이 진단은 별도 성능 열을 만들지 않았습니다.

분석 구조가 유지해야 하는 기록은 다음과 같습니다.

- 서로 다른 id/path/schemaPath/role/scope를 가진 BlueprintNode, PropertyDeclaration, BlueprintFragment
- 선언의 order/gates와 fragment의 declares/overlays/inheritedOverlays/children 순서 기록
- template 재사용 시 occurrence host/name/path/gates가 다른 child-binding/entry 기록
- 정규화 schema/effective 결과와 active 선언·gate/read/dependency 의미를 보존하는 기록

빈 frozen 배열 공유, order/gate suffix 표현, fragment/declaration/child-binding의 중복 메타데이터를 한 authoritative record/view로 표현할 수 있는지 ledger가 결정해야 합니다. 공개 청사진 내용·정적 진단 경로/순서/횟수 유지가 조건입니다. 이 기록들이 V8 sample 기준 65 이상의 하한을 강제한다고 증명하지는 않았습니다. 관측 profiler는 여러 JavaScript 객체를 한 allocation block으로 접기 때문에 이 목록만으로 65 sample/node의 엄밀한 하한을 산출할 수도 없습니다. 다음 선택은 더 큰 유효 범위의 구조 제거·직접 final record 쓰기, frozen empty/order/gate 공유, authoritative declaration/binding view 설계 중 무엇을 공개 계약 안에서 허용할지입니다.

## 재현·검사 기록

- driver: [profile-101-alloc/measure.mjs](profile-101-alloc/measure.mjs), 읽기 전용 집계: [profile-101-alloc/analyze.mjs](profile-101-alloc/analyze.mjs). production bundle은 write:false esbuild 결과를 이 artifact directory에만 저장했습니다. 서비스는 stdin EOF로 종료했습니다.
- 재현: `node profile-101-alloc/measure.mjs --build`, 묶음별 `--matrix <id>`, 할당 확인 `--allocations <id>`. 묶음 단위 명령도 분할할 수 있도록 `--timers <id> <1|2|3> [fixture...]`를 제공합니다. 모든 실행 cwd는 지정 worktree여야 합니다.
- 360개 타이머 worker, 72,720개 시간 창, 출력 hash 일치 360/360, 모든 ≥2% source owner 분류, count/byte 보존 합계, 보정 및 101×3 길이를 검사했습니다.
- 기록된 process 최대 49.513초; worker/빌드 서비스는 signal 없이 자체 종료했습니다. setup 실패는 시간/할당 표에 포함하지 않았습니다. 최초 자식 tape의 frozen fragment 참조 및 합성 빌드의 memo 이름 충돌을 고친 뒤 해당 결과 전체를 재수집했습니다. node-staging의 최종 빌드는 모든 type-group/nonNull/nodes staging 재사용을 적용했습니다. 초기 별도 seed가 20예열 밖에서 실행된 시간 자료는 모두 교체했으며 표/JSON은 정확히 20예열 재측정본만 사용합니다.
- per-run/build artifact 최대 537,177 bytes, 모든 새 artifact ≤5,000,000 bytes. 제품 src diff 없음, HEAD/source tree 확인, git write/설치/제품 bundle overwrite 없음. 각 process 파일에 실행 인자·시간·driver hash가 있습니다.
- 상세 데이터: [profile-101-alloc-summary.json](profile-101-alloc-summary.json). ↑ 외 숫자는 공식 채택 판정이 아닙니다. steady는 기록용 열입니다.

