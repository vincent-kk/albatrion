# 102: mount 간극의 작업량 귀속

`268832c7c`의 HEAD와 `src/__legacy__` 0.16.0을 같은 production adapter로 비교했습니다. 큰 간극은 단순 fixture에서 숨은 O(N²) 노드 순회가 발견돼서 생긴 것으로 볼 수 없습니다. HEAD는 노드당 실제 정규화 1회, 여러 분석 단계, 약 18회 서로 다른 객체의 동결, live node당 17개 초기 revision 읽기를 수행합니다. oneOf는 다른 양상입니다. 동일 gate 위치 20개를 400회 평가하고 같은 `/kind`를 400회 읽으며 동일 상대 경로를 641회 해석했습니다. old는 단순 equality 사전을 1회 조회합니다.

객체 수를 줄인 결과와 작업 단위를 없앤 결과를 구분했습니다. 아래 replay·skip 수치는 한 단계 전체를 없애는 상한이며, 필요한 공개 결과를 그대로 만드는 안전한 부분 수정이 그 시간을 모두 회수한다는 뜻은 아닙니다.

## 계측과 분모

99C-01 (다): 원본 HEAD/0.16.0 소스와 winglet production CJS에 메모리 AST entry/loop/freeze/path/동적 함수 counters를 넣고 fresh mount 1회만 계수합니다. 계수 bundle은 시간·CPU 측정에 사용하지 않습니다.

95C-01: fresh fixture process, 엔진별 warmup 20, clone 및 forced collection/anchor를 clock 밖에서 수행, 101 H/V pair의 순서를 교대합니다. run 1/3은 H 시작, run 2는 V 시작입니다. 동일한 pooled 202 empty/drain median을 두 엔진에 적용합니다.

fresh fixture process, 엔진 block마다 warmup 20 후 101회 연속 mount; forced GC 없음. block 순서는 run 1/3 H→V, run 2 V→H입니다. clone과 관측은 clock 밖입니다.

fresh process, uninstrumented bundle, warmup 20 후 101 consecutive mounts, forced GC 없음, V8 Inspector Profiler interval 100µs. 원시 timeDelta 구간을 모든 mount window와 교차시켜 가중합니다. GC/program/idle/driver를 분모에서 빼지 않습니다. 3회 가중 합계이며 재귀 total은 같은 함수당 표본을 한 번만 셉니다.

round-99 canonical production adapter의 nodeFromJSONSchema + Promise 64 checkpoint + setImmediate sentinel입니다. React 렌더 측정이 아닙니다. validation off, subscribers 0입니다.

모든 계측은 순차 실행했습니다. 세 회차마다 fresh process를 사용했고 별도 GC가 없는 steady 열을 forced 열과 섞지 않았습니다. 환경은 Apple M1 Max / arm64 / Node v26.10.0 / V8 14.6.202.34-node.35 / esbuild 0.25.9입니다. bundle과 map은 지정된 scratchpad에만 있습니다.

| fixture | template N / schema F | live HEAD / old | 생성 runtime HEAD / old |
| --- | --- | --- | --- |
| nested-d5-f4 | 1365 / 1365 | 1365 / 1365 | 1365 / 1365 |
| flat-500 | 501 / 501 | 501 / 501 | 501 / 501 |
| oneOf-20 | 63 / 83 | 6 / 6 | 6 / 63 |
| sample-0 | 3 / 3 | 3 / 3 | 3 / 3 |

정적 작업의 node 분모는 HEAD blueprint N이며 old의 잠재 후보 runtime node 수와 같습니다. oneOf의 live 6개를 정적 template 63개의 분모 대신 쓰면 branch 크기 증가를 잘못된 차수로 읽게 됩니다. runtime 작업은 JSON에 live node당 값도 함께 제공합니다.

## mount 시간과 소음

| fixture | forced HEAD / old / 간극 ms | steady HEAD / old / 간극 ms | control envelope forced / steady ms |
| --- | --- | --- | --- |
| nested-d5-f4 | 10.8133 / 3.2715 / 7.5417 | 8.2337 / 1.9356 / 6.3096 | 0.5208 / 0.2936 |
| flat-500 | 3.7081 / 1.7956 / 1.9843 | 2.4855 / 1.1074 / 1.3622 | 0.1218 / 0.1216 |
| oneOf-20 | 2.4976 / 0.3615 / 2.1087 | 1.1544 / 0.1462 / 1.0144 | 0.0095 / 0.1147 |
| sample-0 | 0.1494 / 0.0890 / 0.0610 | 0.0518 / 0.0210 / 0.0312 | 0.0025 / 0.0074 |

세 회차의 중앙값을 표시했습니다. HEAD·old·간극은 각각 세 회차의 중앙값이므로 표시한 HEAD−old와 간극이 정확히 일치하지 않을 수 있습니다. 각 회차 median/p5/p95/p99·101개 원시 시간·forced paired 차이·empty/drain은 개별 JSON에 보존했습니다. fixture/열별 byte-identical control의 3회 |difference-of-medians| 최대값을 envelope로 사용하며 forced는 |paired median|도 포함합니다. 세 회차 모두 envelope보다 큰 difference-of-medians이고 forced는 각 paired median의 근사 95% 순서통계 구간 [41,61] 하한이 0보다 클 때만 ↑입니다. steady ordinal 차이를 paired CI로 사용하지 않습니다.

## 작업 계수

각 셀은 `HEAD mount당 횟수 / old mount당 횟수 (HEAD node당 / old node당)`입니다. 0은 해당 작업 또는 공개 기록이 없다는 뜻이며 old가 아무 일도 하지 않는다는 뜻은 아닙니다. 대응 함수·다른 단위·중복 행을 아래와 JSON에 명시했습니다. 이 표를 합산해 총 작업량 하나로 만들지 마십시오.

| 작업 | nested-d5-f4 | flat-500 | oneOf-20 | sample-0 |
| --- | --- | --- | --- | --- |
| 종류·허용 타입 읽기 | 4095 / 1706 (3.000 / 1.250) | 1503 / 502 (3.000 / 1.002) | 155 / 124 (2.460 / 1.968) | 9 / 4 (3.000 / 1.333) |
| object schema 읽기 | 9213 / 1706 (6.749 / 1.250) | 3009 / 502 (6.006 / 1.002) | 644 / 124 (10.222 / 1.968) | 21 / 4 (7.000 / 1.333) |
| 노드 타입 집합 결정 | 1365 / 1706 (1.000 / 1.250) | 501 / 502 (1.000 / 1.002) | 63 / 124 (1.000 / 1.968) | 3 / 4 (1.000 / 1.333) |
| 자식 전략 결정 | 1365 / 341 (1.000 / 0.250) | 501 / 1 (1.000 / 0.002) | 63 / 1 (1.000 / 0.016) | 3 / 1 (1.000 / 0.333) |
| 실제 유효 스키마 fold | 1365 / 0 (1.000 / 0.000) | 501 / 0 (1.000 / 0.000) | 71 / 0 (1.127 / 0.000) | 3 / 0 (1.000 / 0.000) |
| 유효 스키마 API 입구 | 1365 / 1365 (1.000 / 1.000) | 501 / 501 (1.000 / 1.000) | 39 / 63 (0.619 / 1.000) | 3 / 3 (1.000 / 1.000) |
| 선택된 기여 적용 | 1365 / 0 (1.000 / 0.000) | 501 / 0 (1.000 / 0.000) | 9 / 0 (0.143 / 0.000) | 3 / 0 (1.000 / 0.000) |
| 제약 키워드 처리 | 1365 / 0 (1.000 / 0.000) | 501 / 0 (1.000 / 0.000) | 9 / 0 (0.143 / 0.000) | 3 / 0 (1.000 / 0.000) |
| 제약 숫자 판독 | 43680 / 0 (32.000 / 0.000) | 16032 / 0 (32.000 / 0.000) | 288 / 0 (4.571 / 0.000) | 96 / 0 (32.000 / 0.000) |
| 선언·fragment 방문 | 1365 / 1365 (1.000 / 1.000) | 501 / 501 (1.000 / 1.000) | 83 / 83 (1.317 / 1.317) | 3 / 3 (1.000 / 1.000) |
| fragment 키워드 검사 | 6825 / 0 (5.000 / 0.000) | 2505 / 0 (5.000 / 0.000) | 415 / 20 (6.587 / 0.317) | 15 / 0 (5.000 / 0.000) |
| 자식 입력 호스트 열거 | 341 / 341 (0.250 / 0.250) | 1 / 1 (0.002 / 0.002) | 1 / 21 (0.016 / 0.333) | 1 / 1 (0.333 / 0.333) |
| template 및 host-bound 키 생성 | 2730 / 0 (2.000 / 0.000) | 1002 / 0 (2.000 / 0.000) | 126 / 0 (2.000 / 0.000) | 6 / 0 (2.000 / 0.000) |
| 정적 shape traversal 입구 | 2729 / 1365 (1.999 / 1.000) | 1001 / 501 (1.998 / 1.000) | 65 / 83 (1.032 / 1.317) | 5 / 3 (1.667 / 1.000) |
| child target 검사 | 1 / 0 (0.001 / 0.000) | 1 / 0 (0.002 / 0.000) | 1 / 0 (0.016 / 0.000) | 1 / 0 (0.333 / 0.000) |
| 역의존 index 실제 생성 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 1 / 1 (0.016 / 0.016) | 0 / 0 (0.000 / 0.000) |
| 의존 경로 등록 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 100 / 20 (1.587 / 0.317) | 0 / 0 (0.000 / 0.000) |
| gate 위치 조회 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 400 / 1 (6.349 / 0.016) | 0 / 0 (0.000 / 0.000) |
| gate 등록 입구 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 429 / 20 (6.810 / 0.317) | 0 / 0 (0.000 / 0.000) |
| gate budget 수집 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 145 / 20 (2.302 / 0.317) | 0 / 0 (0.000 / 0.000) |
| 경로 index add | 2 / 0 (0.001 / 0.000) | 2 / 0 (0.004 / 0.000) | 8 / 0 (0.127 / 0.000) | 2 / 0 (0.667 / 0.000) |
| 상대 의존 경로 해석 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 641 / 20 (10.175 / 0.317) | 0 / 0 (0.000 / 0.000) |
| gate 판단 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 400 / 1 (6.349 / 0.016) | 0 / 0 (0.000 / 0.000) |
| gate 투영 값 읽기 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 400 / 1 (6.349 / 0.016) | 0 / 0 (0.000 / 0.000) |
| Object.freeze | 24911 / 0 (18.250 / 0.000) | 9019 / 0 (18.002 / 0.000) | 1335 / 0 (21.190 / 0.000) | 55 / 0 (18.333 / 0.000) |
| 경로 관련 문자열 생산 site | 4092 / 2730 (2.998 / 2.000) | 1500 / 1002 (2.994 / 2.000) | 1958 / 146 (31.079 / 2.317) | 6 / 6 (2.000 / 2.000) |
| 초기 revision 슬롯 읽기 | 23205 / 0 (17.000 / 0.000) | 8517 / 0 (17.000 / 0.000) | 102 / 0 (1.619 / 0.000) | 51 / 0 (17.000 / 0.000) |
| 런타임 노드 생성 | 1365 / 1365 (1.000 / 1.000) | 501 / 501 (1.000 / 1.000) | 6 / 63 (0.095 / 1.000) | 3 / 3 (1.000 / 1.000) |

- **종류·허용 타입 읽기**: readAllowedTypes / extractSchemaInfo. old의 extractSchemaInfo는 타입 외 정보도 읽습니다. 동일 역할의 대표 호출 비교이며 두 열의 함수가 같은 연산은 아닙니다.
- **object schema 읽기**: readSchemaObject / extractSchemaInfo. HEAD의 반복 typeof·반환과 old의 복합 정보 추출을 구분합니다. type-read 행과 중복되므로 합산하지 않습니다.
- **노드 타입 집합 결정**: resolveNodeTypes / factory 정보 추출. old의 별도 group/nullable 청사진 결과는 없습니다.
- **자식 전략 결정**: resolveNodeStrategy / BranchStrategy constructor. old는 object 호스트에서 전략을 만듭니다.
- **실제 유효 스키마 fold**: mergeSchemaContributions / getMergeSchemaHandler 호출. old의 processAllOfSchema 입구와 구분합니다. 본 fixture에는 old의 실제 allOf 병합이 없습니다.
- **유효 스키마 API 입구**: mergeEffectiveSchema / processAllOfSchema. cache hit 및 조기 반환도 셉니다. 실제 fold 수가 아닙니다.
- **선택된 기여 적용**: applySchemaContribution / 실제 교집합 handler. oneOf의 빈 static fold는 기여 적용을 하지 않습니다.
- **제약 키워드 처리**: applyConstraintKeywords / 실제 교집합 handler. 키가 없어도 HEAD의 범용 helper는 호출됩니다.
- **제약 숫자 판독**: numberValue. 본 fixture의 HEAD에서는 적용당 32회입니다.
- **선언·fragment 방문**: collectDeclarations / reference scanner 방문. old는 fragment/declaration 공개 기록을 만들지 않으며 전체 스키마 스캐너 방문을 대응시켰습니다.
- **fragment 키워드 검사**: collectDeclarations 고정 keyword loop / scanner schema-list 원소. HEAD의 5개 keyword 검사와 old의 실제 목록 원소 방문은 다른 단위입니다.
- **자식 입력 호스트 열거**: populateNodeChildren / scanner map 호스트. 실제 edge 원소와 property group binding은 별도 원시 계수에서 확인합니다.
- **template 및 host-bound 키 생성**: getTemplateKey + buildNodes JSON. old는 같은 template cache를 만들지 않습니다. reference table은 아래 traversal 열에서 셉니다.
- **정적 shape traversal 입구**: visitShape / reference scanner 방문. HEAD의 complete guard 때문에 입구 재방문과 실제 subtree 확장을 구분해야 합니다.
- **child target 검사**: validateChildTargets. 노드와 edge를 한 번씩 훑는 별도 정적 진단 단계입니다. old에 동일 단계는 없습니다.
- **역의존 index 실제 생성**: DependencyIndex constructor / PathManager 생성. oneOf에서 getter는 3회지만 실제 index 생성은 1회입니다. old는 expression dependency 위치 사전을 만듭니다.
- **의존 경로 등록**: DependencyIndex.add / PathManager.set. 등록 호출과 최종 unique 경로·owner 개수는 같지 않습니다.
- **gate 위치 조회**: GateRegistry.locate / simple-equality selector. old는 gate registry 대신 root 선택 함수를 사용합니다.
- **gate 등록 입구**: GateRegistry.register / condition 표현식 준비. HEAD의 대부분은 등록된 위치에 대한 guard hit이며 새 등록 429개라는 뜻이 아닙니다.
- **gate budget 수집**: getGateBudgetCap collect / 조건식 준비. budget index는 1회 만들어 node/child 선언을 재열거합니다.
- **경로 index add**: PathStoreIndex.add. HEAD 단순 mount fast path는 노드 전체를 index에 다시 넣지 않습니다.
- **상대 의존 경로 해석**: resolveDependencyPath / PathManager.set. old의 set은 expression 등장 수이며 매 평가마다 경로를 다시 해석하지 않습니다.
- **gate 판단**: evaluateGate / simple-equality selector. oneOf의 HEAD는 생성 함수 400회, old는 사전 조회 selector 1회입니다.
- **gate 투영 값 읽기**: readProjectedValue / simple-equality dependency 읽기. 이 fixture의 old selector는 dependency 배열의 한 값을 읽습니다.
- **Object.freeze**: mount 중 freeze 호출. 모든 대상이 서로 다른 객체입니다. 동일 객체를 다시 freeze한 사례는 0입니다.
- **경로 관련 문자열 생산 site**: path/pointer/dependency template + joinSegment. AST site 계수로 expression dependency 코드 문자열도 포함합니다. JSON 키 직렬화는 별도 행이며 전체 문자열 할당을 세는 계수가 아닙니다.
- **초기 revision 슬롯 읽기**: 17개 이전 bit 읽기 callback. HEAD의 live runtime node당 17회입니다. old의 EventCascade 초기화와 같은 연산은 아닙니다.
- **런타임 노드 생성**: constructedNodes. oneOf에서 old는 비활성 후보도 runtime node로 구성하고 HEAD는 template만 만듭니다.

### 반복의 실제 단위

- 타입 읽기: nested/flat/sample에서 `readAllowedTypes=3N`, schema identity는 N개입니다. collector → group resolver → contribution 적용의 세 경로입니다. `readSchemaObject`는 nested 9,213/1,365, flat 3,009/501, oneOf 644/83개 identity입니다. 값 반환·typeof 수준의 반복이라 두 memo 후보는 안정적인 시간 이득이 없었습니다.
- 실제 병합: nested 1,365, flat 501, sample 3회입니다. runtime `mergeEffectiveSchema` 입구를 다시 fold로 세면 안 됩니다. HEAD의 static normalization reuse가 이미 이중 병합을 없앴습니다. oneOf는 71회이고 `(node, mode, selected IDs)`는 모두 다르지만 mode를 빼면 **67개 선택 집합, 4회 정적/런타임 재계산**입니다. 선택 집합을 유지하는 memo는 개선이 없었고, 선택 변경까지 무시한 node-only memo의 큰 수치는 안전한 중복 제거 예산이 아닙니다.
- 제약: simple fixture에 제약 키가 없어도 contribution당 `numberValue` 32회, minimum/maximum 교집합 각 5회, enum/const/multipleOf helper 각 1회가 실행됩니다. 이는 병합 안의 범용 검사 작업입니다.
- 동결: nested 24,911회 = 18N + object 호스트 341, flat 9,019회 = 18N + 1입니다. **동결 대상도 각각 24,911/9,019개이고 같은 객체를 재동결하지 않습니다.** freeze-zero는 필요한 immutable output까지 생략한 예산입니다.
- gate: oneOf의 gate/location key는 20개이고 key당 20회, 총 400회입니다. projection은 동일 context/path 1개를 400회, resolveDependencyPath는 동일 host/dependency 1쌍을 641회 실행합니다. 생성한 Function도 HEAD 20개/호출 400회, old 0개/0회이며 old의 단순 equality callback은 1회입니다.
- index: oneOf dependency index 생성 1회/add 100회, getter 3회; budget index 수집 145회/생성 1회입니다. GateRegistry locate 400회·register 429회는 대부분 기존 위치의 guard hit입니다. 단순 폼에서 이 index/registry 작업은 실행되지 않습니다. PathStoreIndex.add는 2회, oneOf 8회이고 ancestor loop는 oneOf 13회입니다. 노드마다 모든 조상 path index를 재구축하는 패턴은 관측되지 않았습니다.
- shape: nested/flat/sample `visitShape=2N−1`은 outer node loop와 edge 진입을 함께 센 값입니다. `complete` guard가 subtree 재확장을 막으므로 O(N)입니다. old의 전체 reference scanner는 authored schema당 1회 방문합니다.
- revision: nested 23,205 / flat 8,517 / sample 51회는 live node당 17개 빈 previous bit 읽기입니다. 변형도 ledger당 배열 하나를 유지하면서 이 읽기·fill 작업을 없애므로 객체 수 감소와 다른 증거입니다.

### 반복을 만드는 호출 경로

| 작업 | HEAD의 호출 경로 | old 대응 |
| --- | --- | --- |
| 타입 3회 | [core/blueprint/utils/analyze/buildNodes.ts:49](../../../src/core/blueprint/utils/analyze/buildNodes.ts#L49) → collectDeclarations.ts:42 → readAllowedTypes; resolveNodeTypes.ts:33–40 → readAllowedTypes; buildNodes.ts:92 → mergeSchemaContributions.ts:51 → applySchemaContribution.ts:43 → applyTypeContribution | __legacy__/core/nodes/schemaNodeFactory.ts:131 → processAllOfSchema.ts:29 조기 반환 → extractSchemaInfo.ts:13 |
| 경로와 key 재직렬화 | [core/blueprint/utils/analyze/buildNodes.ts:35](../../../src/core/blueprint/utils/analyze/buildNodes.ts#L35) → getTemplateKey.ts:15; buildNodes.ts:42에서 key+hostPaths를 다시 stringify; populateNodeChildren.ts:77/161 및 core/SchemaNode/utils/binding/buildSchemaNodeTree.ts의 runtime child path | schemaNodeFactory 및 AbstractNode joinSegment 경로; 원시 site/문자량은 counts-old JSON |
| order 복사 | [core/blueprint/utils/analyze/populateNodeChildren.ts:78](../../../src/core/blueprint/utils/analyze/populateNodeChildren.ts#L78) → buildNodes → collectDeclarations.ts:67에서 input.order 재복사 | 동일한 blueprint order 공개 벡터 없음 |
| fragment 반환 flatten | [core/blueprint/utils/analyze/collectDeclarations.ts:130](../../../src/core/blueprint/utils/analyze/collectDeclarations.ts#L130) → recursive collectDeclarations → :114/$ref 및 :170/keyword의 result.push(...반환 배열) | __legacy__/helpers/jsonSchema/getResolveSchema/utils/getReferenceTable.ts:16 → winglet JSONSchemaScanner.cjs:15/47 → getStackEntriesForNode.cjs:74 |
| gate·projection 재읽기 | [core/settle/utils/compute/selectChildren.ts:156](../../../src/core/settle/utils/compute/selectChildren.ts#L156) → :160–164 evaluateGate → getGateRegistry.ts:83/86 → evaluateGate.ts:111–115 → resolveDependencyPath.ts:7 / readProjectedValue.ts:25 | __legacy__/getConditionIndexFactory.ts:52 → getSimpleEquality.ts:59 사전 lookup |
| dependency/budget 별도 열거 | [core/settle/utils/write/getDependencyIndex.ts:32](../../../src/core/settle/utils/write/getDependencyIndex.ts#L32) → :39–61 declarations/gates; getGateBudgetCap.ts:36/50–53에서 node와 child declarations 재열거 | PathManager.ts:23 set 및 condition 식 20개 준비 |
| shape 입구 재방문 | [core/blueprint/utils/diagnostics/validateShape.ts:13](../../../src/core/blueprint/utils/diagnostics/validateShape.ts#L13) → visitShape.ts:14/20–25 complete guard → :41 child visit | getReferenceTable scanner authored node 방문 |
| 초기 ledger | [core/record/utils/SchemaNodeRevisionLedger.ts:18](../../../src/core/record/utils/SchemaNodeRevisionLedger.ts#L18) → :19–20 Array.from callback 17회 → :22–26 mask update | AbstractNode의 EventCascade / computed manager 초기화 |

## 성장 차수

단순 nested에서 declaration/type/fold/freeze/shape 방문 횟수는 N에 선형입니다. key와 경로의 문자열 길이, 조상 order의 복사 원소 수는 O(Σ depth)이며 균형 4분 트리에서는 O(N log N)입니다. 문자열이 호출 N회라는 이유만으로 생산 바이트도 O(N)이라고 볼 수 없습니다. public full path/order를 유지하는 데 필요한 양과, 이를 임시 input·key에서 다시 복사하는 양을 구분하십시오.

| fixture | N | decl / type / merge / freeze / shape | template / bound key 문자 | schema / data path 문자 | input / final order 복사 원소 | old scanner / 타입 / path 관련 문자 |
| --- | --- | --- | --- | --- | --- | --- |
| nested-d3-f4 | 85 | 85 / 255 / 85 / 1551 / 169 | 5232 / 6337 | 3276 / 684 | 288 / 456 | 85 / 106 / 3961 |
| nested-d4-f4 | 341 | 341 / 1023 / 341 / 6223 / 681 | 25712 / 30145 | 17868 / 3756 | 1824 / 2504 | 341 / 426 / 21625 |
| nested-d5-f4 | 1365 | 1365 / 4095 / 1365 / 24911 / 2729 | 121968 / 139713 | 90572 / 19116 | 10016 / 12744 | 1365 / 1706 / 109689 |
| flat-100 | 101 | 101 / 303 / 101 / 1819 / 201 | 4524 / 5837 | 2200 / 1000 | 0 / 200 | 101 / 102 / 3201 |
| flat-500 | 501 | 501 / 1503 / 501 / 9019 / 1001 | 22524 / 29037 | 11000 / 5000 | 0 / 1000 | 501 / 502 / 16001 |
| flat-1000 | 1001 | 1001 / 3003 / 1001 / 18019 / 2001 | 45024 / 58037 | 22000 / 10000 | 0 / 2000 | 1001 / 1002 / 32001 |

fragment 사슬은 input 크기 F가 증가하고 runtime/template N은 1입니다. 깊은 `allOf`의 각 상위 collector가 하위 반환 배열 전체를 합치므로 복사 원소는 k(k+1)/2입니다. F가 같은 평면 목록에서는 k개입니다. 이것이 확인된 진짜 제곱 중간 작업입니다. 공개 order 자체도 깊이 합계가 제곱으로 늘지만, 동일한 공개 내용 조건에서는 그 최종 벡터를 삭제할 수 없습니다. old scanner는 chain/flat 모두 F회 방문합니다.

| fixture | N / F | 반환 flatten 복사 | 최종 order 재복사 | fold 호출 | old scanner |
| --- | --- | --- | --- | --- | --- |
| fragment-chain-10 | 1 / 11 | 55 | 110 | 2 | 11 |
| fragment-chain-20 | 1 / 21 | 210 | 420 | 2 | 21 |
| fragment-chain-40 | 1 / 41 | 820 | 1640 | 2 | 41 |
| fragment-flat-10 | 1 / 11 | 10 | 20 | 2 | 11 |
| fragment-flat-20 | 1 / 21 | 20 | 40 | 2 | 21 |
| fragment-flat-40 | 1 / 41 | 40 | 80 | 2 | 41 |

oneOf branch 크기를 늘리면 고정 live 6개에 대해 dormant template/fragment 양이 늘어납니다. gate 평가 20B, path 해석 32B+1은 B에 **선형**입니다. 분기 크기 증가를 O(B²)라고 부르지 않습니다. template occurrence당 subtree 재분석이나 fragment당 subtree 재병합의 초선형 패턴은 이 scale 집합에서 발견되지 않았습니다. chain의 여러 선언은 fold 2회 안에서 선형 처리됩니다.

| fixture | template / fragment / live | gate / projection / resolve path | old equality lookup / scanner |
| --- | --- | --- | --- |
| oneOf-5 | 18 / 23 / 6 | 100 / 100 / 161 | 1 / 23 |
| oneOf-10 | 33 / 43 / 6 | 200 / 200 / 321 | 1 / 43 |
| oneOf-20 | 63 / 83 / 6 | 400 / 400 / 641 | 1 / 83 |
| oneOf-40 | 123 / 163 / 6 | 800 / 800 / 1281 | 1 / 163 |

## 계수 없는 steady CPU profile

세 fresh process의 가중 합계를 표시합니다. 아래 `self / total %`의 분모는 GC·program·idle·driver를 포함한 모든 mount window 표본입니다. self 합은 분모와 정확히 일치하고 total은 호출 관계 때문에 더할 수 없습니다. source map은 제품 HEAD 파일:줄에 매핑했습니다. driver frame의 줄 번호는 채집 당시 드라이버 revision의 번호입니다. 모든 함수의 self/total·표본·ms/mount는 summary JSON의 cpuProfiles에 있으며 각 회차 원시 .cpuprofile도 보존했습니다.

Profiler 자체의 부하가 있으므로 profile clock은 end-to-end 이득 열로 사용하지 않았습니다. 100µs는 요청 interval이며 실제 timeDelta는 달라집니다. window 경계에 걸친 표본은 일부 clone/driver 시간을 담습니다. 특히 old oneOf와 sample-0는 수십~수백 표본 수준이므로 작은 함수의 순위·비율은 정밀 추정으로 읽지 마십시오. 경계 표본을 임의로 삭제해 분모를 작게 만들지 않았습니다.

### nested-d5-f4 / HEAD

303 mounts / 18891 window 표본 / 분모 2872.206 ms. 회차 coverage 99.996%, 99.995%, 99.994%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 20.37 / 20.37 | 1.9309 / 1.9309 | GC |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:29` | 13.15 / 39.88 | 1.2465 / 3.7805 | 분석 wiring·최종 동결 |
| `_SchemaNodeRevisionLedger` · `core/record/utils/SchemaNodeRevisionLedger.ts:18` | 10.63 / 11.63 | 1.0080 / 1.1023 | revision |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 4.69 / 39.38 | 0.4450 / 3.7327 | children |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:27` | 4.34 / 5.09 | 0.4115 / 0.4828 | declarations |
| `blueprint` · `core/blueprint/blueprint.ts:21` | 4.16 / 46.52 | 0.3940 / 4.4096 | 분석 wiring·최종 동결 |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 3.75 / 3.93 | 0.3552 / 0.3726 | template-key |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 3.73 / 15.36 | 0.3533 / 1.4556 | mount/runtime |
| `applySchemaContribution` · `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36` | 3.13 / 5.59 | 0.2964 / 0.5297 | merge/constraints |
| `getStaticObjectEntries` · `core/settle/utils/load/getStaticObjectEntries.ts:11` | 2.35 / 2.35 | 0.2227 / 0.2227 | mount/runtime |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 2.20 / 2.68 | 0.2083 / 0.2541 | 기타 |
| `getStaticChoices` · `core/behaviors/utils/options/getStaticChoices.ts:23` | 1.94 / 1.94 | 0.1837 / 0.1837 | 기타 |
| `(program)` · `(V8):0` | 1.68 / 1.68 | 0.1590 / 0.1590 | V8 (program) |
| `(idle)` · `(V8):0` | 0.10 / 0.10 | 0.0092 / 0.0092 | V8 (idle) |

### nested-d5-f4 / 0.16.0

303 mounts / 5746 window 표본 / 분모 1117.367 ms. 회차 coverage 100.000%, 99.985%, 100.000%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 23.76 / 23.76 | 0.8762 / 0.8762 | GC |
| `(idle)` · `(V8):0` | 13.28 / 13.28 | 0.4899 / 0.4899 | V8 (idle) |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 11.21 / 11.21 | 0.4133 / 0.4133 | old computed 초기화 |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 6.71 / 6.71 | 0.2474 / 0.2474 | old event delivery |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 5.96 / 17.17 | 0.2199 / 0.6332 | old computed 초기화 |
| `EventCascadeManager` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` | 3.82 / 3.82 | 0.1408 / 0.1408 | old event delivery |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 3.07 / 25.49 | 0.1134 / 0.9400 | mount/runtime |
| `(anonymous)` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120` | 2.57 / 9.27 | 0.0949 / 0.3418 | old event delivery |
| `structuredClone` · `node:internal/worker/js_transferable:101` | 1.79 / 1.83 | 0.0660 / 0.0675 | 계측·런타임·경계 표본 |
| `(program)` · `(V8):0` | 1.76 / 1.76 | 0.0650 / 0.0650 | V8 (program) |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 1.73 / 40.82 | 0.0639 / 1.5052 | mount/runtime |
| `getChildNodeMap` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:33` | 1.58 / 40.76 | 0.0581 / 1.5031 | mount/runtime |

### flat-500 / HEAD

303 mounts / 6252 window 표본 / 분모 925.073 ms. 회차 coverage 99.975%, 100.000%, 99.999%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:29` | 14.54 / 42.36 | 0.4439 / 1.2933 | 분석 wiring·최종 동결 |
| `(garbage collector)` · `(V8):0` | 12.97 / 12.97 | 0.3960 / 0.3960 | GC |
| `_SchemaNodeRevisionLedger` · `core/record/utils/SchemaNodeRevisionLedger.ts:18` | 11.12 / 12.25 | 0.3395 / 0.3740 | revision |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:27` | 4.32 / 5.39 | 0.1319 / 0.1646 | declarations |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 4.06 / 42.00 | 0.1238 / 1.2821 | children |
| `applySchemaContribution` · `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36` | 3.99 / 6.31 | 0.1219 / 0.1927 | merge/constraints |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 3.60 / 15.85 | 0.1100 / 0.4840 | mount/runtime |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 3.53 / 3.76 | 0.1077 / 0.1147 | template-key |
| `blueprint` · `core/blueprint/blueprint.ts:21` | 3.30 / 47.33 | 0.1007 / 1.4449 | 분석 wiring·최종 동결 |
| `getStaticChoices` · `core/behaviors/utils/options/getStaticChoices.ts:23` | 2.72 / 2.72 | 0.0831 / 0.0831 | 기타 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 2.41 / 4.29 | 0.0736 / 0.1311 | 기타 |
| `structuredClone` · `node:internal/worker/js_transferable:101` | 2.39 / 2.43 | 0.0730 / 0.0742 | 계측·런타임·경계 표본 |
| `(program)` · `(V8):0` | 2.29 / 2.29 | 0.0699 / 0.0699 | V8 (program) |
| `(idle)` · `(V8):0` | 0.45 / 0.45 | 0.0137 / 0.0137 | V8 (idle) |

### flat-500 / 0.16.0

303 mounts / 3209 window 표본 / 분모 453.309 ms. 회차 coverage 99.983%, 100.000%, 100.000%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 17.04 / 17.04 | 0.2549 / 0.2549 | GC |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 9.33 / 9.33 | 0.1396 / 0.1396 | old computed 초기화 |
| `__processValue__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245` | 6.02 / 15.26 | 0.0900 / 0.2283 | mount/runtime |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 5.49 / 5.49 | 0.0822 / 0.0822 | old event delivery |
| `hasOwnProperty` · `packages/winglet/common-utils/dist/libs/hasOwnProperty.cjs:6` | 4.88 / 4.88 | 0.0730 / 0.0730 | 기타 |
| `structuredClone` · `node:internal/worker/js_transferable:101` | 4.65 / 4.69 | 0.0695 / 0.0702 | 계측·런타임·경계 표본 |
| `sortObjectKeys` · `packages/winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6` | 4.39 / 9.27 | 0.0657 / 0.1387 | 기타 |
| `(anonymous)` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807` | 4.25 / 4.25 | 0.0636 / 0.0636 | mount/runtime |
| `__parseValue__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220` | 4.07 / 19.46 | 0.0609 / 0.2911 | mount/runtime |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 3.74 / 13.03 | 0.0559 / 0.1950 | old computed 초기화 |
| `onChange` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414` | 3.54 / 7.77 | 0.0530 / 0.1162 | mount/runtime |
| `EventCascadeManager` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` | 3.51 / 3.51 | 0.0525 / 0.0525 | old event delivery |
| `(program)` · `(V8):0` | 1.69 / 1.69 | 0.0253 / 0.0253 | V8 (program) |
| `(idle)` · `(V8):0` | 0.72 / 0.72 | 0.0108 / 0.0108 | V8 (idle) |

### oneOf-20 / HEAD

303 mounts / 2993 window 표본 / 분모 442.176 ms. 회차 coverage 100.000%, 99.976%, 99.998%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 11.28 / 11.28 | 0.1647 / 0.1647 | GC |
| `resolveDependencyPath` · `core/settle/utils/paths/resolveDependencyPath.ts:7` | 8.12 / 8.12 | 0.1184 / 0.1184 | path-index/dependency-path |
| `selectChildren` · `core/settle/utils/compute/selectChildren.ts:82` | 6.18 / 27.17 | 0.0902 / 0.3965 | gates/selection |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:29` | 3.90 / 16.69 | 0.0570 / 0.2435 | 분석 wiring·최종 동결 |
| `add` · `core/settle/utils/write/getDependencyIndex.ts:119` | 3.89 / 3.89 | 0.0567 / 0.0567 | index/registry |
| `readProjectedValue` · `core/settle/utils/gates/readProjectedValue.ts:25` | 3.77 / 4.97 | 0.0550 / 0.0725 | projection |
| `structuredClone` · `node:internal/worker/js_transferable:101` | 3.20 / 3.31 | 0.0466 / 0.0484 | 계측·런타임·경계 표본 |
| `(program)` · `(V8):0` | 2.82 / 2.82 | 0.0411 / 0.0411 | V8 (program) |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:27` | 2.44 / 4.56 | 0.0357 / 0.0665 | declarations |
| `computeNode` · `core/settle/utils/compute/computeNode.ts:21` | 2.43 / 39.60 | 0.0354 / 0.5780 | mount/runtime |
| `blueprint` · `core/blueprint/blueprint.ts:21` | 1.78 / 21.44 | 0.0259 / 0.3129 | 분석 wiring·최종 동결 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 1.70 / 13.77 | 0.0248 / 0.2010 | children |
| `(idle)` · `(V8):0` | 0.67 / 0.67 | 0.0098 / 0.0098 | V8 (idle) |

### oneOf-20 / 0.16.0

303 mounts / 498 window 표본 / 분모 60.946 ms. 회차 coverage 99.851%, 99.659%, 99.938%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `structuredClone` · `node:internal/worker/js_transferable:101` | 16.06 / 16.49 | 0.0323 / 0.0332 | 계측·런타임·경계 표본 |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 10.00 / 10.00 | 0.0201 / 0.0201 | old computed 초기화 |
| `(idle)` · `(V8):0` | 9.55 / 9.55 | 0.0192 / 0.0192 | V8 (idle) |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 5.78 / 5.78 | 0.0116 / 0.0116 | old event delivery |
| `(garbage collector)` · `(V8):0` | 5.45 / 5.45 | 0.0110 / 0.0110 | GC |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 3.32 / 24.04 | 0.0067 / 0.0484 | mount/runtime |
| `(program)` · `(V8):0` | 3.28 / 3.28 | 0.0066 / 0.0066 | V8 (program) |
| `scannerFactory` · `packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/scannerFactory.cjs:17` | 2.65 / 4.96 | 0.0053 / 0.0100 | schema-traversal |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 2.58 / 30.50 | 0.0052 / 0.0614 | mount/runtime |
| `getCompositionNodeMapList` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:42` | 2.16 / 24.44 | 0.0043 / 0.0492 | mount/runtime |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 2.07 / 17.54 | 0.0042 / 0.0353 | old computed 초기화 |
| `EventCascadeManager` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` | 2.03 / 2.03 | 0.0041 / 0.0041 | old event delivery |

### sample-0 / HEAD

303 mounts / 191 window 표본 / 분모 26.735 ms. 회차 coverage 100.000%, 100.000%, 99.129%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `(idle)` · `(V8):0` | 17.08 / 17.08 | 0.0151 / 0.0151 | V8 (idle) |
| `(garbage collector)` · `(V8):0` | 10.17 / 10.17 | 0.0090 / 0.0090 | GC |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:29` | 9.70 / 30.00 | 0.0086 / 0.0265 | 분석 wiring·최종 동결 |
| `(program)` · `(V8):0` | 4.82 / 4.82 | 0.0043 / 0.0043 | V8 (program) |
| `structuredClone` · `node:internal/worker/js_transferable:101` | 4.00 / 4.99 | 0.0035 / 0.0044 | 계측·런타임·경계 표본 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 3.65 / 18.70 | 0.0032 / 0.0165 | children |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:27` | 3.13 / 5.18 | 0.0028 / 0.0046 | declarations |
| `measured` · `packages/canard/schema-form/architecture/verification/07-switch/profile-102-work/measure.mjs:198` | 3.07 / 58.25 | 0.0027 / 0.0514 | 계측·런타임·경계 표본 |
| `_SchemaNodeRevisionLedger` · `core/record/utils/SchemaNodeRevisionLedger.ts:18` | 2.67 / 2.67 | 0.0024 / 0.0024 | revision |
| `applyConstraintKeywords` · `core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:36` | 2.65 / 2.65 | 0.0023 / 0.0023 | merge/constraints |
| `applySchemaContribution` · `core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36` | 2.35 / 6.53 | 0.0021 / 0.0058 | merge/constraints |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 2.32 / 2.32 | 0.0020 / 0.0020 | template-key |

### sample-0 / 0.16.0

303 mounts / 126 window 표본 / 분모 17.064 ms. 회차 coverage 100.000%, 100.000%, 99.652%.

| 함수 · source:line | self / total % | self / total ms/mount | 작업 대응 |
| --- | --- | --- | --- |
| `(idle)` · `(V8):0` | 20.55 / 20.55 | 0.0116 / 0.0116 | V8 (idle) |
| `(program)` · `(V8):0` | 8.03 / 8.03 | 0.0045 / 0.0045 | V8 (program) |
| `processImmediate` · `node:internal/timers:525` | 5.79 / 14.18 | 0.0033 / 0.0080 | 계측·런타임·경계 표본 |
| `(garbage collector)` · `(V8):0` | 4.91 / 4.91 | 0.0028 / 0.0028 | GC |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 4.59 / 4.59 | 0.0026 / 0.0026 | old event delivery |
| `measured` · `packages/canard/schema-form/architecture/verification/07-switch/profile-102-work/measure.mjs:198` | 4.58 / 40.21 | 0.0026 / 0.0226 | 계측·런타임·경계 표본 |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 3.97 / 3.97 | 0.0022 / 0.0022 | old computed 초기화 |
| `scannerFactory` · `packages/winglet/json-schema/dist/utils/JSONSchemaScanner/utils/scannerFactory.cjs:17` | 3.21 / 4.81 | 0.0018 / 0.0027 | schema-traversal |
| `structuredClone` · `node:internal/worker/js_transferable:101` | 3.10 / 3.10 | 0.0017 / 0.0017 | 계측·런타임·경계 표본 |
| `StringNode` · `__legacy__/core/nodes/StringNode/StringNode.ts:111` | 2.44 / 10.74 | 0.0014 / 0.0060 | mount/runtime |
| `cpu` · `packages/canard/schema-form/architecture/verification/07-switch/profile-102-work/measure.mjs:337` | 2.17 / 42.87 | 0.0012 / 0.0241 | 계측·런타임·경계 표본 |
| `runNextTicks` · `node:internal/process/task_queues:63` | 1.75 / 1.75 | 0.0010 / 0.0010 | 계측·런타임·경계 표본 |

## 작업 제거 상한

셀은 `세 회차 difference-of-medians 중앙값 [최소, 최대] ms`이며 `↑`만 위의 control/paired 규칙을 통과했습니다. 음수는 변형이 느려졌다는 뜻입니다. forced와 steady는 별도 열입니다. 모든 후보는 counters 없이 20+101 mounts를 세 회차 실행했습니다. 순수 memo에는 lookup 비용을 포함했습니다. replay는 최초 warmup의 결과를 발생 순서로 빌리며 결과가 틀릴 수 있는 측정용 코드입니다. 최종 값 해시 일치는 전체 Blueprint·정적 진단 동등성 증명이 아닙니다.

### nested-d5-f4

| 변형 | forced bound ms | steady bound ms |
| --- | --- | --- |
| allowed-once | 0.0978 [0.0406, 0.2159] | -0.1069 [-0.2959, -0.0319] |
| schema-read-once | -0.0641 [-1.0052, -0.0618] | -0.1990 [-0.5509, -0.1181] |
| merge-once | 0.2038 [-0.3198, 0.2644] | -0.1914 [-0.2000, 0.0047] |
| merge-selection-once | -0.2138 [-0.4060, -0.1916] | -0.2486 [-0.5165, -0.2443] |
| merge-replay | ↑ 1.3262 [1.0507, 1.5053] | ↑ 1.2720 [0.7987, 1.5213] |
| types-replay | 0.2812 [-0.0398, 0.5927] | 0.0364 [-0.0341, 0.2714] |
| declarations-replay | ↑ 1.2838 [0.8813, 1.5178] | ↑ 1.1207 [0.9143, 1.1286] |
| children-replay | 1.2218 [0.5014, 1.3830] | ↑ 1.1145 [0.7736, 1.3763] |
| strategy-replay | 0.5337 [-0.0943, 1.0265] | 0.1301 [0.0055, 0.2053] |
| template-replay | 1.2595 [0.4778, 1.4040] | ↑ 0.4464 [0.3933, 0.6330] |
| path-strings-replay | ↑ 1.1081 [0.6007, 1.2525] | ↑ 1.5197 [1.2920, 1.5916] |
| constraint-present | 0.4693 [0.3545, 0.7996] | 0.2216 [0.0175, 0.5813] |
| freeze-zero | ↑ 2.1253 [1.0138, 2.3135] | ↑ 1.3083 [1.1076, 1.3126] |
| shape-once | 0.4091 [-0.4971, 0.5251] | 0.0375 [-0.1114, 0.1005] |
| child-targets-zero | 0.3887 [-0.3554, 0.6232] | 0.0377 [-0.0834, 0.0539] |
| dependency-replay | -0.0019 [-0.7113, 0.4085] | 0.1733 [-0.0606, 0.2152] |
| dependency-paths-once | 0.2195 [-0.0803, 0.3542] | -0.0222 [-0.1390, 0.2330] |
| gates-once | 0.1998 [-0.4288, 0.6284] | -0.0236 [-0.0583, 0.2612] |
| projected-once | 0.4077 [0.3655, 0.6062] | -0.0049 [-0.0550, 0.0590] |
| registry-replay | 0.1815 [-0.2006, 0.1911] | -0.1562 [-0.1753, -0.0217] |
| budget-replay | 0.2857 [-0.4659, 0.4399] | 0.0120 [-0.0366, 0.1717] |
| path-index-zero | 0.3506 [-0.5956, 0.4374] | -0.0871 [-0.2113, 0.0473] |
| revision-initial-empty | ↑ 1.4141 [0.8271, 1.5634] | ↑ 1.1054 [1.0527, 1.3733] |
| order-once | 0.2441 [-0.1886, 0.4290] | 0.0554 [-0.1856, 0.1279] |
| declaration-sink | 0.4503 [-0.0408, 0.4758] | 0.0152 [-0.1398, 0.1854] |

### flat-500

| 변형 | forced bound ms | steady bound ms |
| --- | --- | --- |
| allowed-once | 0.0270 [-0.0480, 0.0645] | -0.0859 [-0.0971, 0.0112] |
| schema-read-once | -0.0857 [-0.0978, -0.0754] | -0.1007 [-0.2528, -0.0631] |
| merge-once | -0.0222 [-0.1216, 0.0193] | -0.0226 [-0.1900, -0.0145] |
| merge-selection-once | -0.1092 [-0.2050, -0.0433] | -0.0685 [-0.1777, 0.0211] |
| merge-replay | ↑ 0.3475 [0.3184, 0.4065] | ↑ 0.4440 [0.2844, 0.5589] |
| types-replay | 0.0525 [-0.0047, 0.0757] | 0.0177 [-0.1148, 0.1455] |
| declarations-replay | ↑ 0.5065 [0.4950, 0.5275] | ↑ 0.2723 [0.1879, 0.3574] |
| children-replay | ↑ 0.2167 [0.2149, 0.2347] | ↑ 0.2917 [0.2217, 0.3736] |
| strategy-replay | 0.1103 [0.0702, 0.1215] | 0.0474 [-0.0118, 0.1205] |
| template-replay | ↑ 0.2234 [0.2120, 0.2755] | 0.1888 [0.1177, 0.2896] |
| path-strings-replay | ↑ 0.3620 [0.3576, 0.3682] | ↑ 0.3748 [0.3433, 0.3831] |
| constraint-present | ↑ 0.1424 [0.1259, 0.2092] | 0.1937 [-0.0568, 0.2580] |
| freeze-zero | ↑ 0.3132 [0.2642, 0.3515] | ↑ 0.4097 [0.1758, 0.4112] |
| shape-once | -0.0026 [-0.0210, 0.0470] | 0.0576 [-0.0849, 0.1219] |
| child-targets-zero | 0.0210 [0.0130, 0.0652] | 0.1157 [-0.0560, 0.1189] |
| dependency-replay | 0.0088 [-0.0420, 0.2467] | -0.0298 [-0.1108, 0.0144] |
| dependency-paths-once | 0.0267 [0.0044, 0.0327] | 0.0247 [0.0137, 0.0698] |
| gates-once | 0.0441 [0.0131, 0.0629] | 0.0095 [-0.0680, 0.0606] |
| projected-once | 0.0042 [-0.0040, 0.0137] | -0.0165 [-0.0320, 0.0968] |
| registry-replay | -0.0217 [-0.0867, -0.0060] | 0.0727 [-0.0479, 0.0988] |
| budget-replay | 0.0517 [0.0042, 0.0768] | 0.0683 [-0.1105, 0.2138] |
| path-index-zero | -0.0225 [-0.0243, -0.0163] | 0.0287 [-0.0311, 0.0736] |
| revision-initial-empty | ↑ 0.3990 [0.3834, 0.4310] | ↑ 0.4567 [0.3634, 0.4805] |
| order-once | -0.0032 [-0.0138, 0.0267] | 0.0023 [-0.0757, 0.0265] |
| declaration-sink | -0.0210 [-0.0628, 0.0291] | 0.0311 [-0.0228, 0.0336] |

### oneOf-20

| 변형 | forced bound ms | steady bound ms |
| --- | --- | --- |
| allowed-once | -0.0201 [-0.0315, -0.0083] | 0.0999 [-0.0338, 0.1165] |
| schema-read-once | -0.0256 [-0.0470, -0.0083] | 0.0388 [-0.0822, 0.1304] |
| merge-once | ↑ 0.3525 [0.3505, 0.3815] | ↑ 0.2962 [0.1282, 0.3398] |
| merge-selection-once | -0.0389 [-0.0500, -0.0029] | 0.0307 [-0.1512, 0.0698] |
| merge-replay | 0.0361 [0.0105, 0.0524] | 0.0518 [-0.0397, 0.0737] |
| types-replay | ↑ 0.0888 [0.0584, 0.0896] | 0.1028 [-0.0130, 0.1059] |
| declarations-replay | ↑ 0.3379 [0.3370, 0.6482] | 0.1877 [0.0819, 0.2343] |
| children-replay | 0.0046 [-0.0059, 0.0192] | 0.0955 [-0.0716, 0.1389] |
| strategy-replay | 0.0088 [0.0011, 0.0527] | 0.0965 [-0.0533, 0.1042] |
| template-replay | ↑ 0.0253 [0.0150, 0.0394] | 0.0982 [-0.0096, 0.1159] |
| path-strings-replay | ↑ 0.0648 [0.0529, 0.0808] | 0.1434 [0.0076, 0.1442] |
| constraint-present | 0.0146 [0.0004, 0.0166] | 0.0577 [-0.0415, 0.1092] |
| freeze-zero | ↑ 0.0750 [0.0712, 0.0790] | 0.1365 [-0.0285, 0.2016] |
| shape-once | -0.0142 [-0.0406, 0.0046] | 0.0468 [-0.0836, 0.0515] |
| child-targets-zero | -0.0046 [-0.0054, 0.0063] | 0.0684 [-0.0182, 0.0828] |
| dependency-replay | ↑ 0.0838 [0.0732, 0.1075] | 0.1745 [0.0248, 0.1939] |
| dependency-paths-once | ↑ 0.0645 [0.0535, 0.0839] | 0.1265 [0.0273, 0.1726] |
| gates-once | ↑ 0.8017 [0.7786, 0.8125] | ↑ 0.5295 [0.4221, 0.5621] |
| projected-once | ↑ 0.7474 [0.6999, 0.7794] | ↑ 0.4737 [0.3432, 0.4943] |
| registry-replay | 0.0133 [0.0009, 0.0283] | 0.0765 [-0.0948, 0.1266] |
| budget-replay | 0.0256 [0.0096, 0.0256] | 0.0651 [-0.1358, 0.1189] |
| path-index-zero | 0.0126 [0.0050, 0.0133] | 0.0582 [-0.0656, 0.0640] |
| revision-initial-empty | -0.0091 [-0.0106, 0.0353] | 0.0485 [-0.0350, 0.0633] |
| order-once | -0.0032 [-0.0201, 0.0182] | 0.0788 [-0.0969, 0.0885] |
| declaration-sink | 0.0090 [-0.0088, 0.0187] | 0.0558 [-0.1223, 0.0743] |

### sample-0

| 변형 | forced bound ms | steady bound ms |
| --- | --- | --- |
| allowed-once | -0.0008 [-0.0010, -0.0004] | 0.0056 [-0.0090, 0.0077] |
| schema-read-once | -0.0036 [-0.0057, -0.0014] | 0.0030 [-0.0086, 0.0087] |
| merge-once | -0.0024 [-0.0045, 0.0005] | 0.0048 [-0.0044, 0.0058] |
| merge-selection-once | -0.0010 [-0.0011, -0.0010] | 0.0042 [-0.0071, 0.0073] |
| merge-replay | ↑ 0.0208 [0.0182, 0.0214] | 0.0124 [0.0048, 0.0161] |
| types-replay | 0.0026 [0.0008, 0.0035] | 0.0100 [-0.0090, 0.0107] |
| declarations-replay | ↑ 0.0125 [0.0096, 0.0139] | 0.0108 [-0.0008, 0.0122] |
| children-replay | 0.0018 [0.0017, 0.0023] | 0.0080 [-0.0037, 0.0106] |
| strategy-replay | 0.0047 [0.0030, 0.0065] | 0.0051 [-0.0029, 0.0091] |
| template-replay | ↑ 0.0058 [0.0028, 0.0066] | 0.0058 [-0.0037, 0.0098] |
| path-strings-replay | ↑ 0.0070 [0.0037, 0.0098] | 0.0098 [-0.0029, 0.0099] |
| constraint-present | ↑ 0.0122 [0.0092, 0.0135] | 0.0093 [-0.0026, 0.0106] |
| freeze-zero | ↑ 0.0052 [0.0052, 0.0068] | 0.0055 [-0.0035, 0.0055] |
| shape-once | 0.0010 [-0.0024, 0.0017] | 0.0059 [-0.0038, 0.0098] |
| child-targets-zero | -0.0000 [-0.0047, 0.0007] | 0.0030 [-0.0087, 0.0087] |
| dependency-replay | -0.0010 [-0.0025, 0.0031] | 0.0029 [-0.0033, 0.0052] |
| dependency-paths-once | -0.0006 [-0.0009, 0.0032] | 0.0035 [-0.0059, 0.0050] |
| gates-once | -0.0004 [-0.0022, 0.0023] | 0.0048 [-0.0047, 0.0075] |
| projected-once | -0.0009 [-0.0020, 0.0018] | 0.0022 [-0.0060, 0.0071] |
| registry-replay | 0.0011 [-0.0006, 0.0014] | 0.0057 [-0.0061, 0.0068] |
| budget-replay | -0.0003 [-0.0011, 0.0008] | 0.0018 [-0.0022, 0.0090] |
| path-index-zero | 0.0026 [0.0015, 0.0053] | 0.0062 [-0.0069, 0.0075] |
| revision-initial-empty | ↑ 0.0062 [0.0061, 0.0063] | 0.0080 [-0.0058, 0.0093] |
| order-once | -0.0005 [-0.0007, 0.0008] | 0.0048 [-0.0066, 0.0060] |
| declaration-sink | 0.0008 [-0.0010, 0.0026] | 0.0071 [-0.0045, 0.0081] |

| 변형 | 생략한 작업 | 해석 제한 |
| --- | --- | --- |
| allowed-once | schema identity별 readAllowedTypes memo | memo 비용 포함; schemaPath·진단 mode는 무시하는 측정용 cache입니다. |
| schema-read-once | schema identity별 readSchemaObject memo | 객체 fixture 한정입니다. boolean 일반 지원 수정안이 아닙니다. |
| merge-once | node별 최초 fold만 사용 | 선택 집합 변경도 무시합니다. 필요한 상태까지 제거한 넓은 상한으로 직접 채택할 수 없습니다. |
| merge-selection-once | node와 declaration ID 집합별 fold 재사용 | static/runtime mode 및 callback policy는 무시합니다. 실제 같은 선택 재계산의 비용을 가늠하는 측정용 memo입니다. |
| merge-replay | 최초 warmup의 fold 결과를 발생 순서대로 replay | 정규화 전체 생략 상한입니다. 다른 입력·진단·참조 동일성의 정확성은 보장하지 않습니다. |
| types-replay | 노드 타입 결정 결과 replay | 필요한 group/nullable/type 검증도 포함해 생략합니다. |
| declarations-replay | 최상위 collector의 선언·fragment·ID 상태 replay | 새 공개 분석 결과 생성과 진단 전체까지 포함한 단계 상한입니다. |
| children-replay | 자식 입력 및 binding 결과 replay | 재귀 build와 최종 child entry 구성은 유지하며 입력 열거·binding을 생략합니다. |
| strategy-replay | 전략 결정 replay | 유효 전략 검증 전체 상한입니다. |
| template-replay | getTemplateKey 결과 replay | host-bound key는 유지합니다. 구현 후보의 speedup과 동일하지 않습니다. |
| path-strings-replay | template key 및 함수 내 경로·JSON 문자열 replay | 공개 경로 생산까지 포함하므로 중복 직렬화만 제거한 시간보다 넓은 상한입니다. |
| constraint-present | 13개 제약 키가 없는 contribution의 범용 제약 처리 생략 | Object.keys/some guard 비용을 포함합니다. 일반 제약·invalid target 상태의 정확성 검증은 별도입니다. |
| freeze-zero | Object.freeze를 identity 함수로 대체 | 유일한 공개 객체 동결도 제거합니다. 동결·불변 계약을 위반하는 전체 단계 상한입니다. |
| shape-once | root에서만 visitShape 시작 | 비활성 또는 분리된 template의 정적 검증이 누락될 수 있습니다. |
| child-targets-zero | validateChildTargets 생략 | 정적 오류 경로를 보존하는 구현이 아닙니다. |
| dependency-replay | 역의존 index replay | 이전 warmup의 node·owner 참조를 포함할 수 있어 일반 동작은 보장하지 않습니다. |
| dependency-paths-once | hostPath와 authored dependency 문자열별 해석 memo | Map key 구성 비용을 포함합니다. wildcard/rekey 일반 수정은 검증하지 않았습니다. |
| gates-once | gate identity와 owner 위치별 결과 memo | 값 변경·projection epoch를 무시합니다. 사용자 callback과 실패 재평가에도 적용하면 잘못됩니다. |
| projected-once | settlement context와 path별 값 읽기 memo | 중간 쓰기와 flush를 무시합니다. |
| registry-replay | GateRegistry.locate 결과 replay | 등록의 동적 위치·owner 일반 정확성은 보장하지 않습니다. |
| budget-replay | fixture에 맞는 합성 gate budget index 사용 | oneOf root 크기만 반영한 측정용 값으로 일반 budget 규칙을 대체할 수 없습니다. |
| path-index-zero | PathKeyedMap 저장은 유지하고 path index add 생략 | affected/ancestor 조회 의미를 보존하지 않습니다. |
| revision-initial-empty | 초기 17개 previous bit 읽기를 빈 배열로 대체 | 빈 previous인 mount 경로의 상한입니다. nonempty plain previous 일반 동작은 틀립니다. |
| order-once | collector에서 input.order 재복사 생략 | 공개 배열 frozen 상태와 생산 순서를 유지하는 좁은 후보입니다. |
| declaration-sink | recursive collector 반환 배열 flatten을 단일 sink로 대체 | 방문·ID·추가 순서를 유지하는 좁은 후보입니다. chain scale의 제곱 복사를 제거합니다. |

관측상 채택을 뒷받침하지 않는 항목도 남겼습니다. allowed/schema-read memo, 같은 selection의 merge memo, strategy replay, order-only/sink-only, root-only shape, child-target skip, registry replay, budget 합성 및 path index add skip은 각 주 fixture에서 두 열에 공통으로 안정적인 이득이 없습니다. 특히 cheap read의 호출 횟수만 보고 cache를 추가하거나, fragment chain의 제곱 개선을 nested mount 전체의 큰 개선으로 해석해서는 안 됩니다.

## 소음 밖 상한에 대응하는 단일 변경 명세

아래 순위는 안전하게 좁힐 수 있는 변경과 두 열의 재현성을 우선한 것입니다. 제품 변경은 수행하지 않았습니다. 전체 단계 생략 상한이 큰 경우에도 수정은 반복 중간 작업만 제거하며 공개 결과 생성과 정적 검증은 유지합니다. 어느 명세에도 전체 상한 회수를 보장하지 않습니다.

### 1. 공유 빈 previous의 17개 bit 읽기를 생략하십시오.

대응: `revision-initial-empty`. SchemaNodeRevisionLedger constructor에서 shared empty previous identity만 분기해 counts=[]로 시작하고 기존 mask 갱신을 그대로 수행합니다. ledger 및 nonempty plain record에는 기존 복사를 유지합니다.

근거 경로: `core/record/utils/SchemaNodeRevisionLedger.ts:18–26`.

보존 조건: bit getter의 undefined/증가 값, read(mask), immutable previous snapshot과 이벤트 전달 순서가 같아야 합니다. Blueprint 및 정적 분석·진단 경로는 건드리지 않습니다.

설계 중첩: 분석 기록 설계의 범위 밖입니다.

측정 한계: 측정 변형은 모든 plain previous를 빈 값으로 취급합니다. 구현은 공유 empty identity에 한정해야 합니다.

### 2. 순수 gate의 성공 결과를 의존 projection 버전 동안 재사용하십시오.

대응: `gates-once`. GateRegistry occurrence에 (gate, host, edge binding, dependency epoch) 성공 결과 하나를 저장합니다. primitive equality처럼 순수성이 증명된 compiled 식부터 적용하며 동일 projection epoch에서 20개 gate를 각 1회 평가합니다.

근거 경로: `core/settle/utils/compute/selectChildren.ts:156–164 → core/settle/utils/gates/evaluateGate.ts:26,35,111–115`.

보존 조건: Blueprint의 20개 gate·expression·dependency 기록과 컴파일 호출을 모두 유지합니다. 값·extras·구조·wildcard·rekey·flush·host 변경에서 invalidation하며 throw 및 사용자 callback은 memo하지 않습니다. 정적 오류·경고는 원래 compile/collect 위치, 순서, 횟수대로 남깁니다.

설계 중첩: 분석 기록 생성 감소와 독립적인 settlement 작업입니다. view 정체성과 read dependency 의미는 설계의 보존 조건을 따릅니다.

측정 한계: 측정용 once memo는 값 전환을 무시하므로 직접 구현으로 쓸 수 없습니다. 중간 값 변경·동일 gate의 다중 host·실패 반복 검증이 필요합니다.

### 3. 같은 projection epoch의 동일 경로 읽기를 재사용하십시오.

대응: `projected-once`. SettlementContext에 (path, projection epoch) read 결과를 저장하고 pending flush 및 실제 write 전에 invalidation합니다. 한 epoch의 /kind 400회 탐색을 1회로 줄입니다.

근거 경로: `core/settle/utils/gates/evaluateGate.ts:111–115 → core/settle/utils/gates/readProjectedValue.ts:25,34,61`.

보존 조건: resolved root/extra 값, absent key, wildcard, parent/array context 및 이전 gate가 만든 projection을 똑같이 관측해야 합니다. 첫 read의 flush와 실패 처리는 생략하지 않습니다. 정적 분석의 기록·진단은 유지합니다.

설계 중첩: 분석 기록 설계 밖입니다. gate cache와 중첩되므로 두 절감 상한을 더하지 않습니다.

측정 한계: context 단위 무조건 memo는 올바르지 않습니다. 원시 객체에 대한 외부 변경을 버전으로 관측할 수 없는 경로는 일반 경로를 유지합니다.

### 4. 증명된 단일 정적 기여에는 범용 제약 교집합 순회를 우회하십시오.

대응: `merge-replay`, `constraint-present`, `merge-once`. 단일 ungated conjunction, 검증된 scalar type, nullable/pattern/options/custom atomic 없음, 제약 키 없음이 확정된 경우에만 같은 renderer-hint schema를 직접 구성합니다. 나머지는 기존 ordered fold를 사용합니다. oneOf의 선택 변경은 별도 결과를 계속 생성합니다.

근거 경로: `core/blueprint/utils/analyze/buildNodes.ts:92–100 → core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:48–53 → applySchemaContribution.ts:43`.

보존 조건: 현재 key 존재·enumeration 순서, property 참조, normalized type, nullable와 EffectiveSchema 참조 cache 조건을 그대로 보존합니다. invalid/multiple/gated/collect/isAtomic 경로는 원래 검증 및 진단을 동일 순서로 실행합니다.

설계 중첩: 설계의 static 임시 node 제거와 scalar 배열 공유는 이미 별도이며, 102는 남은 helper 순회라는 작업을 대상으로 합니다.

측정 한계: merge-replay는 전체 fold 예산입니다. 필요한 결과 생성은 남으므로 전부 회수할 수 없습니다. merge-once의 oneOf 0.35 ms에는 서로 다른 선택 제거까지 들어가며 안전한 memo 이득이 아닙니다. merge-selection-once는 소음 밖 이득이 없습니다.

### 5. 단일 ungated 자식 입력은 중간 Map 수집과 재열거 없이 전달하십시오.

대응: `children-replay`. 한 선언의 object properties를 eager snapshot으로 한 번 열거하고 기존 entry 순서 그대로 child build에 전달하는 좁은 경로를 추가합니다. overlay·공유 template·gate·control·virtual의 일반 경로는 유지합니다.

근거 경로: `core/blueprint/utils/analyze/populateNodeChildren.ts:31,77–87,160–181`.

보존 조건: name insertion 순서, input order/schemaPath/hostPath, fragment membership, child node cache key, bound declaration의 필드와 gate 원소, childEntries 및 모든 정적 검사 순서·횟수가 같아야 합니다.

설계 중첩: 설계의 eager snapshot·slot cursor·숫자 연결과 겹칩니다. 단일 기여의 동일한 입력을 다시 조립하지 않는 작업 제거가 목적입니다.

측정 한계: children-replay에는 binding 전체 생략도 포함됩니다. 단일 경로 구현의 실제 시간은 이 상한보다 작을 수 있습니다.

### 6. 선언을 처음부터 최종 소유자의 sink에 한 번 수집하십시오.

대응: `declarations-replay`, `declaration-sink`, `order-once`. collectDeclarations의 recursive 반환 배열을 단일 ordered sink로 교체하고 기록을 소유자의 최종 declaration/fragment view에 한 번 배정합니다. 진단과 ID 예약은 기존 DFS 위치에 둡니다.

근거 경로: `core/blueprint/utils/analyze/collectDeclarations.ts:27,62–76,114,170`.

보존 조건: declaration/fragment ID, role·scope·context·validationOnly·membership, own enumerable 필드, frozen final arrays, 원본/바인딩 gate 관계를 동일하게 남깁니다. 무효 schema나 callback의 진단을 dedupe하거나 다른 시점에 내보내지 않습니다.

설계 중첩: 설계의 권위 declaration과 frozen view 단일 생성에 겹칩니다. H개의 반환 scratch 배열 재사용만으로는 상위 호출의 flatten 복사 작업이 없어지지 않습니다. 반환 배열을 유지하는 것과 한 번 수집하는 것은 작업량이 다릅니다.

측정 한계: 전체 declarations-replay는 큰 예산이지만 sink-only와 order-only는 네 주 fixture에서 소음 밖 이득이 없습니다. O(F²) 개선은 chain probe로 입증됐으며 nested 주 간극의 원인으로 확대하지 않습니다.

### 7. 값이 같은 frozen 빈 membership만 공유해 새 동결 작업을 줄이십시오.

대응: `freeze-zero`. module-owned frozen empty arrays를 빈 gates/overlays/inheritedOverlays/childEntries에 사용하고 실제 membership이 생길 때만 독립 배열을 만들어 최종 freeze합니다. 필드별 공유 허용 범위를 명시합니다.

근거 경로: `core/blueprint/utils/analyze/collectDeclarations.ts:46,67–72 → core/blueprint/blueprint.ts:73–89`.

보존 조건: 각 공개 view와 비어 있지 않은 배열은 frozen으로 남고 own field·순서·기존에 보장한 참조 동일성을 유지합니다. 공개 mutable 배열이나 getter/Proxy는 도입하지 않습니다.

설계 중첩: 설계의 module-owned 빈 배열 및 gate-prefix 재사용과 직접 겹칩니다.

측정 한계: 현재 freeze 24,911회는 모두 서로 다른 대상입니다. freeze-zero는 필요 동결까지 뺀 넓은 상한입니다. 빈 배열 공유의 좁은 속도 효과를 따로 증명하지 않았으며 전체 상한을 회수한다고 주장하지 않습니다.

### 8. 내부 template key에서 완성 경로의 이중 직렬화를 제거하십시오.

대응: `template-replay`, `path-strings-replay`. source occurrence, context, ordered gate identity와 host binding identity를 보존하는 내부 interned tuple key를 사용하고 host-bound key가 template 문자열을 다시 JSON화하지 않게 합니다. 공개 schema/data 경로와 order 배열은 기존처럼 생성합니다.

근거 경로: `core/blueprint/utils/analyze/buildNodes.ts:35–42 → getTemplateKey.ts:15–34`.

보존 조건: template 동치 관계, cache hit/miss, ID 예약 순서, 재귀 판정과 host 재바인딩이 같아야 합니다. 경로 충돌·scope/context·동일 source 다중 host를 key에 반영하며 정적 진단 occurrence를 합치지 않습니다.

설계 중첩: 설계는 과거 streaming key가 시간 이득 없이 미채택됐다고 기록하고 현재 인코딩을 유지합니다. 102의 제거 상한은 streaming 구현을 다시 채택할 근거가 아니며 새로운 key 구조는 별도 범위입니다.

측정 한계: 경로 replay에는 필요한 공개 문자열 생산까지 포함됩니다. getTemplateKey replay도 새 key 구조의 실속도와 같지 않습니다. 공개 path/order 총량 O(N·depth)는 보존 계약상 남습니다.

### 9. 동일 host·authored dependency의 순수 경로 해석을 한 번 바인딩하십시오.

대응: `dependency-paths-once`, `dependency-replay`. registry occurrence의 dependency를 최초 host binding 때 resolve하고 index와 gate reads가 같은 완성 경로를 빌립니다. 중복 (resolved watch path, owner) 등록은 첫 삽입 순서를 유지해 제거합니다.

근거 경로: `core/settle/utils/gates/getGateRegistry.ts:156–166 → core/settle/utils/paths/resolveDependencyPath.ts:7 → write/getDependencyIndex.ts:119`.

보존 조건: relative/absolute path, escaping, wildcard, ancestor/descendant affected 의미, host rekey 및 owner insertion 순서를 보존하고 relocation 때만 다시 바인딩합니다. 진단 생성에는 영향을 주지 않습니다.

설계 중첩: 설계의 원본 host와 bound view 구분 및 역의존 의미 보존과 연결됩니다. source-only key로 서로 다른 host를 합치지 않습니다.

측정 한계: oneOf의 forced 열에서만 안정적입니다. index 전체 replay 상한과 경로 해석 상한은 중첩되며 실제 index는 이미 한 번 생성합니다.

### 10. 선언에서 검증한 타입 사실을 node grouping과 fold에 전달하십시오.

대응: `types-replay`. scalar 선언에서 얻은 검증된 allowed-type 사실을 type grouping과 contribution 단계가 그대로 읽도록 내부 분석 frame에 전달합니다. 입력 occurrence의 원래 검증/진단 호출은 남기고 순수 타입 집합 재계산만 줄입니다.

근거 경로: `core/blueprint/utils/analyze/collectDeclarations.ts:42 → core/blueprint/utils/types/resolveNodeTypes.ts:33–40 → effectiveSchema/utils/applySchemaContribution.ts:43`.

보존 조건: 다중 타입·nullable·boolean schema·추론·gated group 결과와 정적 오류의 source path/순서/횟수가 같아야 합니다. schema identity만으로 서로 다른 진단 occurrence를 합치지 않습니다.

설계 중첩: 설계의 scalar frozen singleton과 겹치지만 객체 생산량보다 실제 검증 이후 재계산을 줄이는 별도 문제입니다.

측정 한계: oneOf forced type-resolution replay만 소음 밖입니다. readAllowedTypes memo 및 schema-read memo는 안정적인 개선이 없으므로 무조건 cache를 권하지 않습니다.

각 구현의 acceptance는 기존 captureBlueprintObservables 전체 비교, frozen 상태와 필수 reference 관계, static 오류·warning의 code/source path/발생 순서/개수 비교입니다. boolean·nullable·충돌 constraint·무효 pattern·custom collect/isAtomic·gated inactive branch·$ref 다중 host·order-sensitive overlays를 포함해야 합니다. 성공 fixture의 값 해시만으로 통과시키면 안 됩니다. gate/projection 수정은 중간 값 쓰기, 앞 gate의 flush, extras, 배열 rekey와 같은 occurrence의 다른 host도 검증해야 합니다.

설계 문서 읽기 단면: SHA256 `4465fa21a59f24fabb5aff0a23c1cdc89c7d2eab38bdf239bdfe7056b5b3022c`, 문서의 source 단면 `da734b40da7a35186646bef42c9f65cee3178892`. 다른 작업자의 문서는 읽기만 했습니다. 102 계수와 source chain은 요청된 HEAD 기준이며 문서의 별도 source 단면 계수를 그대로 옮기지 않습니다.

## 산출물 검증

성공 time artifact 648개, CPU artifact 24개, count artifact 34개를 검사했습니다. 각 시간 열은 engine당 정확히 warmup 20 + measured 101회, empty/drain 202개이며 CPU는 forced GC/counter 없이 20+101회입니다. GC/program 포함 self 가중 합과 분모 보존, window coverage, HEAD/control bundle byte 일치, 모든 fixture의 old/HEAD 값 해시 일치를 확인했습니다.

측정 driver process 기록의 최대 elapsed는 16.327초이고 signal 기록은 0개입니다. 기록된 worker는 스스로 종료했습니다. 기록에 남은 초기 설정 실패 1건은 성공 시간 artifact와 분리했습니다. 가장 큰 실행별·scratch 산출물은 1,041,126 bytes로 5 MB 이하입니다. 성공 결과만 근거로 사용했습니다.

HEAD와 src의 tracked diff가 없으며 git write·설치·제품 소스 변경은 하지 않았습니다. 두 설계 문서는 편집하지 않았습니다. repository 내부 bundle/map은 만들지 않았습니다. monorepo build/lint/typecheck/test는 제품 변경이 없는 이 분석의 검증 수단으로 실행하지 않았으며, 지정된 계측 adapter와 데이터·artifact 검사를 사용했습니다.

- [계측 driver](profile-102-work/measure.mjs)
- [보고서 생성 계산](profile-102-work/summarize.mjs)
- [전체 요약 JSON](profile-102-work-summary.json)
- raw counts: `profile-102-work/counts-{head,old}-{fixture}.json`
- raw CPU: `profile-102-work/cpu-{head,old}-{fixture}-r{1,2,3}.{json,cpuprofile}`
- raw time: `profile-102-work/{variant}-{fixture}-{forced,steady}-r{1,2,3}.json`
- 자연 종료 및 build hash: `profile-102-work/process-*.json`, `build-*.json`

bundle/map 위치: `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles`.

계수의 문자열 길이는 UTF-16 code unit, 배열 spread 길이는 복사한 원소 수입니다. CPU window 표본 coverage 범위는 99.129%–100.000%이며, profile 시작/끝에서 표본 interval이 없는 부분은 분모에 만들지 않았습니다. 수정한 setup 문제는 summary.validation.correctedSetupIssues에 기록했고, 실패 시간은 상한 집계에 사용하지 않았습니다.
