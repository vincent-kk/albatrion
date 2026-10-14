# 105: HEAD에서 남은 mount 작업량과 제거 범위

`a958b37cbf7d7cd897565a06278ee141fd402816`에서 새 엔진과 `src/__legacy__` 0.16.0 스냅샷을 source-backed production bundle로 측정했습니다. 현재 네 mount 비율은 모두 1보다 큽니다. 작은 form update의 round 104 수용 결정은 이 작업의 대상 밖입니다.

실제 단일 변경으로 잡음 밖에 남은 후보는 `children-once`(nested·flat)와 `fragment-empty-fast`(flat)입니다. 전체 replay의 큰 이득은 필수 공개 결과 생산과 자손 작업까지 포함하므로 그대로 한 패치의 절약 시간으로 해석할 수 없습니다.

## 현재 mount 판정열

| fixture | 새 ms | 구 공식 ms | 새/구 | 구 선택 | 회차별 비율 |
| --- | --- | --- | --- | --- | --- |
| nested-d5-f4 | 8.4223 | 3.1073 | 2.7105× | (나) microtask + callback 합 | 2.7969 / 2.5182 / 2.6782 |
| flat-500 | 2.8836 | 1.6450 | 1.7530× | (나) microtask + callback 합 | 1.7578 / 1.7565 / 1.7530 |
| oneOf-20 | 2.2337 | 0.3654 | 6.1136× | 종단 | 6.1136 / 6.4341 / 5.9397 |
| sample-0 | 0.1327 | 0.0917 | 1.4466× | 종단 | 1.4466 / 1.3966 / 1.4893 |

표는 회차별 median의 median이며 비율은 표시한 새/구 median으로 계산했습니다. 기존 판정표의 old 선택을 고정하지 않고 현재 세 회차에서 (가)/(나)를 다시 판정했습니다. 한 회차라도 old 종단과 합이 잡음 밖이면 그 fixture의 세 회차 모두 합을 사용합니다. microtask와 callback은 회차 내 순번별로 합치고 C/M은 같은 202개 빈 호출의 pooled median입니다. callback boundary는 공식 표본 후의 별도 진단에서만 감쌌습니다. 모든 old sentinel의 pending=0 및 추가 128 checkpoints/다음 sentinel의 추가 예약·실행=0, 새 엔진 예약=0을 확인했습니다.

| fixture/run | 새 종단−micro ms / 잡음 | 구 종단−합 ms / 잡음 | (나) 일치 |
| --- | --- | --- | --- |
| nested-d5-f4/1 | 0.0230 / 0.2983 | 0.2163 / 0.1221 | 아니요 |
| nested-d5-f4/2 | 0.0313 / 0.4275 | 0.2532 / 0.0858 | 아니요 |
| nested-d5-f4/3 | 0.0149 / 0.2555 | 0.2221 / 0.1063 | 아니요 |
| flat-500/1 | 0.0250 / 0.1695 | 0.1025 / 0.0667 | 아니요 |
| flat-500/2 | 0.0136 / 0.1001 | 0.1002 / 0.0659 | 아니요 |
| flat-500/3 | 0.0118 / 0.0638 | 0.0915 / 0.0580 | 아니요 |
| oneOf-20/1 | 0.0367 / 0.7568 | 0.0162 / 0.0251 | 예 |
| oneOf-20/2 | 0.0234 / 0.6846 | 0.0188 / 0.0280 | 예 |
| oneOf-20/3 | 0.0183 / 0.9318 | 0.0159 / 0.0259 | 예 |
| sample-0/1 | 0.0043 / 0.0249 | 0.0050 / 0.0225 | 예 |
| sample-0/2 | 0.0044 / 0.0158 | 0.0050 / 0.0155 | 예 |
| sample-0/3 | 0.0058 / 0.0234 | 0.0052 / 0.0202 | 예 |

## 계측 조건과 한계

{"date":"2026-10-06T15:27:00.770Z","head":"a958b37cbf7d7cd897565a06278ee141fd402816","node":"v26.10.0","v8":"14.6.202.34-node.35","esbuild":"0.25.9","platform":"darwin","arch":"arm64","cpu":"Apple M1 Max","cpus":10,"memoryBytes":68719476736,"osRelease":"25.6.0","mode":"production","validation":"off","subscribers":0}

각 timing worker는 fresh process에서 H/W 엔진별 warmup 20과 101 쌍을 수행했습니다. 측정 표본의 순서는 회차 1/3 H 시작, 2 W 시작으로 매 표본 교대합니다. schema clone, 명시적 GC 및 GC 뒤 check anchor는 clock 밖이며 64 Promise checkpoints 후 same-check-queue sentinel까지 잰 공통 empty 보정 verdict 열입니다. 계수 bundle과 CPU profile은 timing에 사용하지 않았습니다.

CPU는 fresh process마다 warmup 20 뒤 101 consecutive mounts를 100 µs interval로 3회 수집했습니다. 101개의 schema clone을 Profiler.start 전에 준비하여 짧은 old mount의 경계에서 clone stack이 mount에 섞이는 문제를 줄였습니다. 표본 timeDelta를 모든 mount window와 교차 가중하고 GC/program/idle/driver를 분모에 남겼습니다. 재귀 total은 같은 frame당 한 번만 셉니다. old oneOf의 표본은 적어 작은 함수 간 순위는 변동할 수 있습니다. V8 inline 비용은 caller self에 잡힐 수 있으며 inclusive total끼리 합산하지 않습니다.

replay는 첫 warmup의 성공 fixture 결과를 발생 순서로 재사용하는 낙관적 작업 제거입니다. 제거 대상의 public view 생산·진단·referential contract를 우회할 수 있고 replay/memo lookup 비용도 들어갑니다. 따라서 수학적 상한 또는 검증된 일반 구현 성능이 아닙니다. narrow 변경은 같은 성공 fixture 값 hash를 확인했으나 전체 Blueprint observable·오류·callback 계약 검증은 수행하지 않았습니다. 제품 시험/빌드는 요청 범위 밖이므로 실행하지 않았습니다.

## 노드당 작업 계수

각 셀은 `HEAD mount당 / old mount당 (HEAD template-node당 / old potential-node당)`입니다. old oneOf는 63개 runtime 후보를 만들고 live는 6개입니다. 정적 분모는 HEAD template N=63을 old에도 적용하고 runtime용 live 분모는 JSON에 따로 제공합니다. 서로 다른 역할이나 중복 site를 더해 총 작업량으로 만들지 마십시오.

| 작업 | nested-d5-f4 | flat-500 | oneOf-20 | sample-0 |
| --- | --- | --- | --- | --- |
| 타입·허용 타입 읽기 | 2730 / 1706 (2.000 / 1.250) | 1002 / 502 (2.000 / 1.002) | 153 / 124 (2.429 / 1.968) | 6 / 4 (2.000 / 1.333) |
| object schema 읽기 | 9213 / 1706 (6.749 / 1.250) | 3009 / 502 (6.006 / 1.002) | 644 / 124 (10.222 / 1.968) | 21 / 4 (7.000 / 1.333) |
| 유효 스키마 병합 입구 | 1365 / 1365 (1.000 / 1.000) | 501 / 501 (1.000 / 1.000) | 71 / 63 (1.127 / 1.000) | 3 / 3 (1.000 / 1.000) |
| 범용 기여 적용 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 7 / 0 (0.111 / 0.000) | 0 / 0 (0.000 / 0.000) |
| Object.freeze | 3071 / 0 (2.250 / 0.000) | 1003 / 0 (2.002 / 0.000) | 116 / 0 (1.841 / 0.000) | 8 / 0 (2.667 / 0.000) |
| 선언·fragment 방문 | 1365 / 1365 (1.000 / 1.000) | 501 / 501 (1.000 / 1.000) | 83 / 83 (1.317 / 1.317) | 3 / 3 (1.000 / 1.000) |
| fragment keyword 검사 | 6825 / 0 (5.000 / 0.000) | 2505 / 0 (5.000 / 0.000) | 415 / 20 (6.587 / 0.317) | 15 / 0 (5.000 / 0.000) |
| 자식 입력 호스트 열거 | 341 / 341 (0.250 / 0.250) | 1 / 1 (0.002 / 0.002) | 1 / 21 (0.016 / 0.333) | 1 / 1 (0.333 / 0.333) |
| 경로 문자열 생산 site | 4092 / 2730 (2.998 / 2.000) | 1500 / 1002 (2.994 / 2.000) | 1958 / 146 (31.079 / 2.317) | 6 / 6 (2.000 / 2.000) |
| template/host-bound key 생성 | 2730 / 0 (2.000 / 0.000) | 1002 / 0 (2.000 / 0.000) | 126 / 0 (2.000 / 0.000) | 6 / 0 (2.000 / 0.000) |
| 역의존 index 생성 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 1 / 1 (0.016 / 0.016) | 0 / 0 (0.000 / 0.000) |
| 의존 경로 등록 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 100 / 20 (1.587 / 0.317) | 0 / 0 (0.000 / 0.000) |
| PathStoreIndex.add | 2 / 0 (0.001 / 0.000) | 2 / 0 (0.004 / 0.000) | 8 / 0 (0.127 / 0.000) | 2 / 0 (0.667 / 0.000) |
| 상대 의존 경로 해석 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 641 / 20 (10.175 / 0.317) | 0 / 0 (0.000 / 0.000) |
| gate 평가 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 400 / 1 (6.349 / 0.016) | 0 / 0 (0.000 / 0.000) |
| 투영 값 읽기 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 400 / 1 (6.349 / 0.016) | 0 / 0 (0.000 / 0.000) |
| 17개 initial previous bit 읽기 | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) | 0 / 0 (0.000 / 0.000) |

- 타입·허용 타입 읽기: old는 타입 외 정보도 추출합니다.
- object schema 읽기: type-read와 중복되므로 합산하지 않습니다.
- 유효 스키마 병합 입구: HEAD의 채택된 single-contribution 빠른 경로를 포함합니다.
- 범용 기여 적용: 단순 HEAD에서 0회인 것은 단일 기여 처리까지 0회라는 뜻이 아닙니다.
- Object.freeze: 최종 유효 스키마·옵션·entry view 등이 남습니다.
- 선언·fragment 방문: old는 공개 declaration 기록 대신 reference scanner 방문을 대응시킵니다.
- fragment keyword 검사: HEAD의 5 keyword 검사와 old의 실제 schema-list 원소는 다른 단위입니다.
- 자식 입력 호스트 열거: 호스트 수이며 edge 원소 수와 구분합니다.
- 경로 문자열 생산 site: AST site 계수이며 전체 문자열 할당 수는 아닙니다. JSON key는 다음 행입니다.
- template/host-bound key 생성: host-bound JSON stringify의 HEAD 위치는 원시 계수에도 보존합니다.
- 역의존 index 생성: getter와 실제 생성은 구분합니다.
- 의존 경로 등록: 등록 입구와 unique watch/owner 수는 다릅니다.
- PathStoreIndex.add: old에 같은 index 구조는 없습니다.
- 상대 의존 경로 해석: old set은 expression 등장 수이며 매회 재해석 횟수가 아닙니다.
- gate 평가: old는 단순 equality 사전 selector입니다.
- 투영 값 읽기: old의 selector가 dependency 배열 값을 읽는 호출을 대응시킵니다.
- 17개 initial previous bit 읽기: 채택된 EMPTY 및 native ledger 경로에서 생략됐습니다.

HEAD 단순 mount의 initial previous 17-bit 읽기는 0입니다. single-contribution 빠른 경로는 병합 입구 수를 없애지 않고 범용 기여 적용을 제거했습니다. 남은 freeze는 nested 3071, flat 1003, oneOf 116, sample 8이며 producer-owned inline 동결의 과거 상한을 다시 더하지 않았습니다. 원시 AST 함수/loop/path site와 문자열 총량은 `counts-*.json`에 남겼습니다.

## 계수 없는 steady CPU: self/total top 20

| fixture/엔진 | mounts | 표본 | 분모 ms | GC % | program % |
| --- | --- | --- | --- | --- | --- |
| nested-d5-f4/head | 303 | 13238 | 2058.6840 | 29.07 | 1.60 |
| nested-d5-f4/old | 303 | 5400 | 838.1730 | 21.79 | 2.76 |
| flat-500/head | 303 | 4540 | 705.4400 | 22.44 | 2.18 |
| flat-500/old | 303 | 2893 | 449.1560 | 15.13 | 1.78 |
| oneOf-20/head | 303 | 2832 | 428.0310 | 9.60 | 2.84 |
| oneOf-20/old | 303 | 424 | 65.6150 | 7.64 | 3.21 |

### nested-d5-f4 / HEAD / self 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 29.07 | 29.07 | 1975.17 | 1975.17 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 18.68 | 41.87 | 1269.31 | 2844.57 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 5.24 | 41.00 | 355.87 | 2785.55 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 4.99 | 5.08 | 338.77 | 345.39 |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 4.81 | 5.06 | 326.77 | 343.58 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 4.45 | 5.61 | 302.24 | 381.49 |
| `getStaticObjectEntries` · `core/settle/utils/load/getStaticObjectEntries.ts:11` | 3.71 | 3.71 | 251.82 | 251.82 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.11 | 3.83 | 211.33 | 260.37 |
| `getStaticChoices` · `core/behaviors/utils/options/getStaticChoices.ts:23` | 3.04 | 3.04 | 206.85 | 206.85 |
| `(anonymous)` · `core/blueprint/utils/analyze/populateNodeChildren.ts:76` | 2.35 | 2.60 | 159.75 | 176.97 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.33 | 23.26 | 158.15 | 1580.38 |
| `createSchemaNode` · `core/SchemaNode/utils/schemaNodeFactory.ts:29` | 2.27 | 3.25 | 154.22 | 220.76 |
| `(program)` · `(V8):0` | 1.60 | 1.60 | 108.40 | 108.40 |
| `visitShape` · `core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:14` | 1.36 | 1.46 | 92.32 | 99.40 |
| `mergeSingleStaticContribution` · `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:19` | 1.07 | 1.92 | 72.84 | 130.58 |
| `createChildNode` · `core/settle/utils/compute/createChildNode.ts:10` | 0.91 | 4.10 | 61.52 | 278.65 |
| `freezeEffectiveSchema` · `core/blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:14` | 0.85 | 0.85 | 57.74 | 57.74 |
| `resolveNodeTypes` · `core/blueprint/utils/types/resolveNodeTypes.ts:17` | 0.69 | 1.35 | 46.79 | 91.59 |
| `unionAllowedTypes` · `core/blueprint/utils/types/unionAllowedTypes.ts:8` | 0.63 | 0.63 | 43.12 | 43.12 |
| `mergeEffectiveSchema` · `core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` | 0.59 | 0.59 | 39.91 | 39.91 |

### nested-d5-f4 / HEAD / total 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 6794.34 |
| `measured` · `(round-99 canonical adapter):326` | 0.05 | 68.79 | 3.73 | 4673.55 |
| `cpu` · `(round-99 canonical adapter):474` | 0.03 | 68.72 | 2.12 | 4669.16 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.01 | 68.66 | 0.90 | 4664.70 |
| `create` · `(round-99 canonical adapter):157` | 0.03 | 68.65 | 1.72 | 4664.29 |
| `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.01 | 68.62 | 0.42 | 4662.11 |
| `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.06 | 43.91 | 4.14 | 2983.69 |
| `blueprint` · `core/blueprint/blueprint.ts:19` | 0.20 | 43.80 | 13.25 | 2976.05 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 18.68 | 41.87 | 1269.31 | 2844.57 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 5.24 | 41.00 | 355.87 | 2785.55 |
| `(garbage collector)` · `(V8):0` | 29.07 | 29.07 | 1975.17 | 1975.17 |
| `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.01 | 24.68 | 0.51 | 1676.89 |
| `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.03 | 24.66 | 2.06 | 1675.39 |
| `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.54 | 23.85 | 36.63 | 1620.14 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.33 | 23.26 | 158.15 | 1580.38 |
| `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.38 | 6.89 | 25.61 | 468.19 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 4.45 | 5.61 | 302.24 | 381.49 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 4.99 | 5.08 | 338.77 | 345.39 |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 4.81 | 5.06 | 326.77 | 343.58 |
| `createChildNode` · `core/settle/utils/compute/createChildNode.ts:10` | 0.91 | 4.10 | 61.52 | 278.65 |

### nested-d5-f4 / 0.16.0 / self 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 21.79 | 21.79 | 602.72 | 602.72 |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 15.49 | 15.49 | 428.53 | 428.53 |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 8.12 | 8.12 | 224.49 | 224.49 |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 6.22 | 21.66 | 172.15 | 599.18 |
| `EventCascadeManager` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` | 5.80 | 5.80 | 160.37 | 160.37 |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 3.17 | 32.73 | 87.66 | 905.38 |
| `(program)` · `(V8):0` | 2.76 | 2.76 | 76.46 | 76.46 |
| `scannerFactory` · `winglet/json-schema/dist/utils/JSONSchemaScanner/utils/scannerFactory.cjs:17` | 2.49 | 5.04 | 68.76 | 139.55 |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 2.10 | 52.06 | 58.15 | 1440.21 |
| `getChildNodeMap` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:33` | 2.00 | 51.90 | 55.22 | 1435.68 |
| `publish` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:134` | 1.46 | 4.18 | 40.25 | 115.55 |
| `publish` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891` | 1.37 | 5.55 | 37.96 | 153.51 |
| `(anonymous)` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807` | 1.32 | 1.34 | 36.45 | 36.94 |
| `sortObjectKeys` · `winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6` | 1.16 | 1.63 | 32.02 | 45.17 |
| `onChange` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414` | 1.11 | 2.39 | 30.71 | 66.10 |
| `pushMapChildren` · `winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:34` | 1.04 | 1.71 | 28.89 | 47.40 |
| `__acquireBatch__` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90` | 1.01 | 2.72 | 28.04 | 75.30 |
| `escapeSegment` · `winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6` | 1.01 | 1.01 | 27.85 | 27.85 |
| `StringNode` · `__legacy__/core/nodes/StringNode/StringNode.ts:111` | 1.00 | 30.03 | 27.57 | 830.59 |
| `runNextTicks` · `node:internal/process/task_queues:63` | 0.90 | 1.87 | 24.90 | 51.80 |

### nested-d5-f4 / 0.16.0 / total 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 2766.25 |
| `cpu` · `(round-99 canonical adapter):474` | 0.11 | 62.01 | 2.99 | 1715.28 |
| `measured` · `(round-99 canonical adapter):326` | 0.09 | 61.98 | 2.48 | 1714.44 |
| `create` · `(round-99 canonical adapter):157` | 0.04 | 61.89 | 0.97 | 1711.97 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.00 | 61.89 | 0.00 | 1711.97 |
| `nodeFromJSONSchema` · `__legacy__/core/nodeFromJSONSchema.ts:34` | 0.00 | 61.85 | 0.00 | 1711.00 |
| `ObjectNode` · `__legacy__/core/nodes/ObjectNode/ObjectNode.ts:96` | 0.86 | 56.49 | 23.68 | 1562.76 |
| `(anonymous)` · `__legacy__/core/nodes/schemaNodeFactory.ts:75` | 0.61 | 56.49 | 16.78 | 1562.76 |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 2.10 | 52.06 | 58.15 | 1440.21 |
| `getChildNodeMap` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:33` | 2.00 | 51.90 | 55.22 | 1435.68 |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 3.17 | 32.73 | 87.66 | 905.38 |
| `StringNode` · `__legacy__/core/nodes/StringNode/StringNode.ts:111` | 1.00 | 30.03 | 27.57 | 830.59 |
| `(garbage collector)` · `(V8):0` | 21.79 | 21.79 | 602.72 | 602.72 |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 6.22 | 21.66 | 172.15 | 599.18 |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 15.49 | 15.49 | 428.53 | 428.53 |
| `(anonymous)` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120` | 0.77 | 9.18 | 21.34 | 253.93 |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 8.12 | 8.12 | 224.49 | 224.49 |
| `EventCascadeManager` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` | 5.80 | 5.80 | 160.37 | 160.37 |
| `__emitChange__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137` | 0.38 | 5.59 | 10.59 | 154.55 |
| `publish` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:891` | 1.37 | 5.55 | 37.96 | 153.51 |

### flat-500 / HEAD / self 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 22.44 | 22.44 | 522.54 | 522.54 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 18.79 | 43.75 | 437.57 | 1018.67 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 6.45 | 6.69 | 150.14 | 155.85 |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 5.12 | 5.64 | 119.09 | 131.42 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 4.42 | 6.01 | 102.94 | 139.98 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 4.41 | 42.05 | 102.63 | 978.95 |
| `getStaticObjectEntries` · `core/settle/utils/load/getStaticObjectEntries.ts:11` | 3.13 | 3.13 | 72.89 | 72.89 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.10 | 5.56 | 72.16 | 129.41 |
| `getStaticChoices` · `core/behaviors/utils/options/getStaticChoices.ts:23` | 2.94 | 2.94 | 68.52 | 68.52 |
| `(anonymous)` · `core/blueprint/utils/analyze/populateNodeChildren.ts:76` | 2.58 | 2.92 | 60.14 | 67.97 |
| `writeObjectKey` · `core/behaviors/objectBehavior/utils/keys/writeObjectKey.ts:2` | 2.41 | 2.41 | 56.14 | 56.14 |
| `createSchemaNode` · `core/SchemaNode/utils/schemaNodeFactory.ts:29` | 2.35 | 3.33 | 54.82 | 77.46 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.22 | 26.52 | 51.67 | 617.37 |
| `(program)` · `(V8):0` | 2.18 | 2.18 | 50.74 | 50.74 |
| `mergeSingleStaticContribution` · `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:19` | 1.42 | 2.21 | 33.05 | 51.41 |
| `resolveNodeTypes` · `core/blueprint/utils/types/resolveNodeTypes.ts:17` | 0.97 | 1.55 | 22.56 | 36.17 |
| `resolveNodeStrategy` · `core/blueprint/utils/types/resolveNodeStrategy.ts:14` | 0.92 | 0.96 | 21.31 | 22.33 |
| `freezeEffectiveSchema` · `core/blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:14` | 0.79 | 0.79 | 18.36 | 18.36 |
| `(idle)` · `(V8):0` | 0.77 | 0.77 | 17.91 | 17.91 |
| `escapeSegment` · `winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6` | 0.73 | 0.73 | 16.91 | 16.91 |

### flat-500 / HEAD / total 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 2328.18 |
| `cpu` · `(round-99 canonical adapter):474` | 0.09 | 73.95 | 2.02 | 1721.60 |
| `measured` · `(round-99 canonical adapter):326` | 0.05 | 73.94 | 1.10 | 1721.47 |
| `create` · `(round-99 canonical adapter):157` | 0.06 | 73.81 | 1.47 | 1718.33 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.00 | 73.81 | 0.00 | 1718.33 |
| `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.00 | 73.72 | 0.00 | 1716.35 |
| `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.09 | 45.44 | 2.06 | 1058.02 |
| `blueprint` · `core/blueprint/blueprint.ts:19` | 0.11 | 45.16 | 2.49 | 1051.39 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 18.79 | 43.75 | 437.57 | 1018.67 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 4.41 | 42.05 | 102.63 | 978.95 |
| `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.04 | 28.30 | 1.02 | 658.84 |
| `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.07 | 28.23 | 1.60 | 657.32 |
| `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.44 | 27.02 | 10.18 | 629.08 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.22 | 26.52 | 51.67 | 617.37 |
| `(garbage collector)` · `(V8):0` | 22.44 | 22.44 | 522.54 | 522.54 |
| `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.28 | 8.91 | 6.56 | 207.44 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 6.45 | 6.69 | 150.14 | 155.85 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 4.42 | 6.01 | 102.94 | 139.98 |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 5.12 | 5.64 | 119.09 | 131.42 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.10 | 5.56 | 72.16 | 129.41 |

### flat-500 / 0.16.0 / self 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 15.13 | 15.13 | 224.31 | 224.31 |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 11.12 | 11.12 | 164.88 | 164.88 |
| `__processValue__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245` | 6.40 | 15.26 | 94.88 | 226.16 |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 5.86 | 5.86 | 86.83 | 86.83 |
| `hasOwnProperty` · `winglet/common-utils/dist/libs/hasOwnProperty.cjs:6` | 5.29 | 5.29 | 78.40 | 78.40 |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 4.53 | 15.65 | 67.10 | 231.98 |
| `__parseValue__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220` | 4.45 | 19.74 | 65.91 | 292.57 |
| `(anonymous)` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:807` | 4.41 | 4.41 | 65.33 | 65.33 |
| `getStackEntriesForNode` · `winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:74` | 4.40 | 5.61 | 65.18 | 83.22 |
| `sortObjectKeys` · `winglet/common-utils/dist/utils/object/sortObjectKeys.cjs:6` | 3.57 | 8.86 | 52.88 | 131.28 |
| `EventCascadeManager` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` | 3.55 | 3.55 | 52.61 | 52.61 |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 3.54 | 62.88 | 52.48 | 932.15 |
| `onChange` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:414` | 2.96 | 7.33 | 43.87 | 108.70 |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 2.79 | 23.45 | 41.33 | 347.65 |
| `(program)` · `(V8):0` | 1.78 | 1.78 | 26.40 | 26.40 |
| `getChildNodeMap` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:33` | 1.66 | 38.65 | 24.62 | 572.97 |
| `StringNode` · `__legacy__/core/nodes/StringNode/StringNode.ts:111` | 1.51 | 35.82 | 22.32 | 530.94 |
| `escapeSegment` · `winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6` | 1.08 | 1.08 | 15.97 | 15.97 |
| `(idle)` · `(V8):0` | 1.06 | 1.06 | 15.67 | 15.67 |
| `__emitChange__` · `__legacy__/core/nodes/StringNode/StringNode.ts:40` | 0.90 | 11.06 | 13.30 | 163.95 |

### flat-500 / 0.16.0 / total 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 1482.36 |
| `measured` · `(round-99 canonical adapter):326` | 0.17 | 72.56 | 2.56 | 1075.54 |
| `cpu` · `(round-99 canonical adapter):474` | 0.07 | 72.48 | 1.08 | 1074.37 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.03 | 72.35 | 0.50 | 1072.49 |
| `create` · `(round-99 canonical adapter):157` | 0.04 | 72.32 | 0.59 | 1071.99 |
| `nodeFromJSONSchema` · `__legacy__/core/nodeFromJSONSchema.ts:34` | 0.03 | 72.28 | 0.46 | 1071.40 |
| `(anonymous)` · `__legacy__/core/nodes/schemaNodeFactory.ts:75` | 0.47 | 65.21 | 7.03 | 966.63 |
| `ObjectNode` · `__legacy__/core/nodes/ObjectNode/ObjectNode.ts:96` | 0.18 | 65.11 | 2.66 | 965.13 |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 3.54 | 62.88 | 52.48 | 932.15 |
| `getChildNodeMap` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getChildNodeMap/getChildNodeMap.ts:33` | 1.66 | 38.65 | 24.62 | 572.97 |
| `StringNode` · `__legacy__/core/nodes/StringNode/StringNode.ts:111` | 1.51 | 35.82 | 22.32 | 530.94 |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 2.79 | 23.45 | 41.33 | 347.65 |
| `__emitChange__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:137` | 0.03 | 19.84 | 0.50 | 294.08 |
| `__handleEmitChange__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:155` | 0.03 | 19.80 | 0.50 | 293.57 |
| `__parseValue__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:220` | 4.45 | 19.74 | 65.91 | 292.57 |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 4.53 | 15.65 | 67.10 | 231.98 |
| `__processValue__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:245` | 6.40 | 15.26 | 94.88 | 226.16 |
| `(garbage collector)` · `(V8):0` | 15.13 | 15.13 | 224.31 | 224.31 |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 11.12 | 11.12 | 164.88 | 164.88 |
| `__emitChange__` · `__legacy__/core/nodes/StringNode/StringNode.ts:40` | 0.90 | 11.06 | 13.30 | 163.95 |

### oneOf-20 / HEAD / self 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 9.60 | 9.60 | 135.59 | 135.59 |
| `resolveDependencyPath` · `core/settle/utils/paths/resolveDependencyPath.ts:7` | 7.69 | 7.69 | 108.69 | 108.69 |
| `selectChildren` · `core/settle/utils/compute/selectChildren.ts:82` | 7.63 | 28.01 | 107.79 | 395.71 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 4.73 | 20.78 | 66.81 | 293.50 |
| `add` · `core/settle/utils/write/getDependencyIndex.ts:119` | 4.37 | 4.37 | 61.76 | 61.76 |
| `readProjectedValue` · `core/settle/utils/gates/readProjectedValue.ts:25` | 4.28 | 5.39 | 60.40 | 76.13 |
| `(program)` · `(V8):0` | 2.84 | 2.84 | 40.19 | 40.19 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 2.75 | 6.44 | 38.92 | 90.91 |
| `collectGateEvaluationReads` · `core/blueprint/utils/analyze/collectGateEvaluationReads.ts:8` | 2.50 | 2.50 | 35.34 | 35.34 |
| `computeNode` · `core/settle/utils/compute/computeNode.ts:21` | 2.29 | 40.11 | 32.37 | 566.58 |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 2.01 | 2.72 | 28.40 | 38.38 |
| `hasOwnProperty` · `winglet/common-utils/dist/libs/hasOwnProperty.cjs:6` | 1.79 | 1.79 | 25.24 | 25.24 |
| `registerRecalculation` · `core/settle/utils/write/registerRecalculation.ts:12` | 1.76 | 11.58 | 24.83 | 163.64 |
| `flushPendingGateReads` · `core/settle/utils/gates/flushPendingGateReads.ts:30` | 1.66 | 5.57 | 23.44 | 78.74 |
| `evaluateGate` · `core/settle/utils/gates/evaluateGate.ts:26` | 1.50 | 14.20 | 21.21 | 200.55 |
| `getGateExpression` · `core/settle/utils/gates/getGateExpression.ts:13` | 1.49 | 1.49 | 20.98 | 20.98 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 1.37 | 15.45 | 19.42 | 218.26 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 1.33 | 1.36 | 18.74 | 19.24 |
| `register` · `core/settle/utils/gates/getGateRegistry.ts:50` | 1.20 | 2.70 | 17.01 | 38.18 |
| `DependencyIndex` · `core/settle/utils/write/getDependencyIndex.ts:32` | 1.13 | 7.55 | 15.92 | 106.70 |

### oneOf-20 / HEAD / total 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 1412.64 |
| `measured` · `(round-99 canonical adapter):326` | 0.11 | 85.94 | 1.53 | 1214.06 |
| `cpu` · `(round-99 canonical adapter):474` | 0.00 | 85.82 | 0.00 | 1212.33 |
| `create` · `(round-99 canonical adapter):157` | 0.04 | 85.76 | 0.53 | 1211.53 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.00 | 85.76 | 0.00 | 1211.53 |
| `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.04 | 85.68 | 0.51 | 1210.41 |
| `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.11 | 60.96 | 1.60 | 861.12 |
| `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.11 | 60.77 | 1.54 | 858.49 |
| `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.11 | 60.52 | 1.52 | 854.94 |
| `writeSchemaNode` · `core/settle/utils/write/writeSchemaNode.ts:35` | 0.40 | 60.38 | 5.63 | 852.91 |
| `finishSettlement` · `core/settle/utils/settlement/finishSettlement.ts:23` | 0.32 | 41.52 | 4.57 | 586.49 |
| `computeNode` · `core/settle/utils/compute/computeNode.ts:21` | 2.29 | 40.11 | 32.37 | 566.58 |
| `transitionSettlement` · `core/settle/utils/transition/transitionSettlement.ts:28` | 0.36 | 37.95 | 5.06 | 536.08 |
| `selectChildren` · `core/settle/utils/compute/selectChildren.ts:82` | 7.63 | 28.01 | 107.79 | 395.71 |
| `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.04 | 24.73 | 0.58 | 349.36 |
| `blueprint` · `core/blueprint/blueprint.ts:19` | 0.25 | 24.11 | 3.46 | 340.63 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 4.73 | 20.78 | 66.81 | 293.50 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 1.37 | 15.45 | 19.42 | 218.26 |
| `evaluateGate` · `core/settle/utils/gates/evaluateGate.ts:26` | 1.50 | 14.20 | 21.21 | 200.55 |
| `registerRecalculation` · `core/settle/utils/write/registerRecalculation.ts:12` | 1.76 | 11.58 | 24.83 | 163.64 |

### oneOf-20 / 0.16.0 / self 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 15.73 | 15.73 | 34.07 | 34.07 |
| `(idle)` · `(V8):0` | 12.15 | 12.15 | 26.31 | 26.31 |
| `(garbage collector)` · `(V8):0` | 7.64 | 7.64 | 16.54 | 16.54 |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 5.66 | 36.24 | 12.26 | 78.48 |
| `mergeEventEntries` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/utils/mergeEventEntries.ts:13` | 5.65 | 5.65 | 12.22 | 12.22 |
| `(program)` · `(V8):0` | 3.21 | 3.21 | 6.96 | 6.96 |
| `extractConditionInfo` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/extractConditionInfo.ts:30` | 3.21 | 5.55 | 6.95 | 12.02 |
| `getStackEntriesForNode` · `winglet/json-schema/dist/utils/JSONSchemaScanner/utils/getStackEntriesForNode.cjs:74` | 2.49 | 4.33 | 5.38 | 9.37 |
| `getSimpleEquality` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/getSimpleEquality.ts:31` | 2.44 | 2.68 | 5.29 | 5.80 |
| `EventCascadeManager` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:257` | 2.42 | 2.42 | 5.24 | 5.24 |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 2.32 | 27.24 | 5.01 | 58.99 |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 2.09 | 38.95 | 4.52 | 84.34 |
| `scannerFactory` · `winglet/json-schema/dist/utils/JSONSchemaScanner/utils/scannerFactory.cjs:17` | 1.89 | 6.09 | 4.10 | 13.18 |
| `__processChildren__` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:596` | 1.41 | 1.41 | 3.04 | 3.04 |
| `getCompositionKeyInfo` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionKeyInfo/getCompositionKeyInfo.ts:16` | 1.39 | 1.39 | 3.00 | 3.00 |
| `__acquireBatch__` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:90` | 1.17 | 2.08 | 2.52 | 4.50 |
| `getCompositionNodeMapList` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:42` | 1.16 | 33.35 | 2.51 | 72.23 |
| `resolveReferences` · `__legacy__/core/nodes/schemaNodeFactory.ts:139` | 0.99 | 1.22 | 2.14 | 2.65 |
| `ObjectNode` · `__legacy__/core/nodes/ObjectNode/ObjectNode.ts:96` | 0.96 | 52.74 | 2.09 | 114.20 |
| `measured` · `(round-99 canonical adapter):326` | 0.93 | 60.88 | 2.01 | 131.84 |

### oneOf-20 / 0.16.0 / total 순

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 216.55 |
| `cpu` · `(round-99 canonical adapter):474` | 0.65 | 61.47 | 1.41 | 133.12 |
| `measured` · `(round-99 canonical adapter):326` | 0.93 | 60.88 | 2.01 | 131.84 |
| `nodeFromJSONSchema` · `__legacy__/core/nodeFromJSONSchema.ts:34` | 0.22 | 59.73 | 0.47 | 129.35 |
| `create` · `(round-99 canonical adapter):157` | 0.00 | 59.73 | 0.00 | 129.35 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.00 | 59.73 | 0.00 | 129.35 |
| `(anonymous)` · `__legacy__/core/nodes/schemaNodeFactory.ts:75` | 0.46 | 52.74 | 1.00 | 114.20 |
| `ObjectNode` · `__legacy__/core/nodes/ObjectNode/ObjectNode.ts:96` | 0.96 | 52.74 | 2.09 | 114.20 |
| `BranchStrategy2` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761` | 2.09 | 38.95 | 4.52 | 84.34 |
| `AbstractNode` · `__legacy__/core/nodes/AbstractNode/AbstractNode.ts:1146` | 5.66 | 36.24 | 12.26 | 78.48 |
| `getCompositionNodeMapList` · `__legacy__/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getCompositionNodeMapList/getCompositionNodeMapList.ts:42` | 1.16 | 33.35 | 2.51 | 72.23 |
| `getComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/getComputedPropertiesManager.ts:19` | 2.32 | 27.24 | 5.01 | 58.99 |
| `needsRealComputedManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/utils/needsRealComputedManager/needsRealComputedManager.ts:27` | 15.73 | 15.73 | 34.07 | 34.07 |
| `StringNode` · `__legacy__/core/nodes/StringNode/StringNode.ts:111` | 0.89 | 12.92 | 1.92 | 27.98 |
| `(idle)` · `(V8):0` | 12.15 | 12.15 | 26.31 | 26.31 |
| `(anonymous)` · `__legacy__/core/nodes/AbstractNode/utils/EventCascadeManager/EventCascadeManager.ts:120` | 0.23 | 9.80 | 0.50 | 21.22 |
| `BooleanNode` · `__legacy__/core/nodes/BooleanNode/BooleanNode.ts:89` | 0.00 | 9.37 | 0.00 | 20.29 |
| `NumberNode` · `__legacy__/core/nodes/NumberNode/NumberNode.ts:125` | 0.23 | 9.21 | 0.50 | 19.94 |
| `ComputedPropertiesManager` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/ComputedPropertiesManager.ts:246` | 0.50 | 9.19 | 1.08 | 19.91 |
| `(anonymous)` · `__legacy__/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/getConditionIndexFactory.ts:33` | 0.24 | 8.47 | 0.51 | 18.33 |

## HEAD의 total ≥5% 함수와 상한 연결

부모/dispatch 단계는 제거할 독립 작업이 아니라 자손 단계들의 누적 범위입니다. 그 행은 연결한 leaf/phase bound로 귀속하며 self와 필수 출력 비용 전부가 같은 단일 수정으로 없어지는 것으로 판정하지 않았습니다. GC/program/idle는 분모에 포함한 VM/driver 항목이고, 강제 GC를 clock 밖에 둔 verdict에서 독립 GC 시간을 빼는 상한으로 변환하지 않았습니다. old 함수는 고정 비교판의 귀속이며 수정 대상은 HEAD입니다.

| fixture | 함수·위치 | self / total % | 연결한 제거 범위 |
| --- | --- | --- | --- |
| nested-d5-f4 | `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 18.68 / 41.87 | blueprint-replay, node-membership-once, path-strings-replay |
| nested-d5-f4 | `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 5.24 / 41.00 | children-once, children-replay |
| nested-d5-f4 | `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 4.99 / 5.08 | delivery-replay, revision-dense-first |
| nested-d5-f4 | `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 4.81 / 5.06 | template-replay, path-strings-replay |
| nested-d5-f4 | `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 4.45 / 5.61 | declarations-replay, declaration-sink, fragment-empty-fast |
| nested-d5-f4 | `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.33 / 23.26 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| nested-d5-f4 | `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.54 / 23.85 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| nested-d5-f4 | `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.38 / 6.89 | assembly-replay, assembly-first-plain |
| nested-d5-f4 | `blueprint` · `core/blueprint/blueprint.ts:19` | 0.20 / 43.80 | blueprint-replay, node-membership-once, path-strings-replay |
| nested-d5-f4 | `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.06 / 43.91 | blueprint-replay, node-membership-once, path-strings-replay |
| nested-d5-f4 | `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.01 / 68.62 | blueprint-replay, delivery-replay, assembly-replay, selection-replay |
| nested-d5-f4 | `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.03 / 24.66 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| nested-d5-f4 | `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.01 / 24.68 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| flat-500 | `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 18.79 / 43.75 | blueprint-replay, node-membership-once, path-strings-replay |
| flat-500 | `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 6.45 / 6.69 | delivery-replay, revision-dense-first |
| flat-500 | `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 4.42 / 6.01 | declarations-replay, declaration-sink, fragment-empty-fast |
| flat-500 | `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:11` | 5.12 / 5.64 | template-replay, path-strings-replay |
| flat-500 | `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 4.41 / 42.05 | children-once, children-replay |
| flat-500 | `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.10 / 5.56 | assembly-replay, assembly-first-plain |
| flat-500 | `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.22 / 26.52 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| flat-500 | `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.44 / 27.02 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| flat-500 | `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.09 / 45.44 | blueprint-replay, node-membership-once, path-strings-replay |
| flat-500 | `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.28 / 8.91 | assembly-replay, assembly-first-plain |
| flat-500 | `blueprint` · `core/blueprint/blueprint.ts:19` | 0.11 / 45.16 | blueprint-replay, node-membership-once, path-strings-replay |
| flat-500 | `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.00 / 73.72 | blueprint-replay, delivery-replay, assembly-replay, selection-replay |
| flat-500 | `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.07 / 28.23 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| flat-500 | `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.04 / 28.30 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| oneOf-20 | `resolveDependencyPath` · `core/settle/utils/paths/resolveDependencyPath.ts:7` | 7.69 / 7.69 | dependency-paths-once |
| oneOf-20 | `selectChildren` · `core/settle/utils/compute/selectChildren.ts:82` | 7.63 / 28.01 | selection-replay, selection-lazy, gates-replay |
| oneOf-20 | `readProjectedValue` · `core/settle/utils/gates/readProjectedValue.ts:25` | 4.28 / 5.39 | projected-once, projected-first, projected-tokens |
| oneOf-20 | `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:31` | 4.73 / 20.78 | blueprint-replay, node-membership-once, path-strings-replay |
| oneOf-20 | `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:33` | 2.75 / 6.44 | declarations-replay, declaration-sink, fragment-empty-fast |
| oneOf-20 | `computeNode` · `core/settle/utils/compute/computeNode.ts:21` | 2.29 / 40.11 | selection-replay, gates-replay, flush-reads-zero, recalculation-replay |
| oneOf-20 | `registerRecalculation` · `core/settle/utils/write/registerRecalculation.ts:12` | 1.76 / 11.58 | recalculation-replay |
| oneOf-20 | `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 1.37 / 15.45 | children-once, children-replay |
| oneOf-20 | `flushPendingGateReads` · `core/settle/utils/gates/flushPendingGateReads.ts:30` | 1.66 / 5.57 | flush-reads-zero |
| oneOf-20 | `evaluateGate` · `core/settle/utils/gates/evaluateGate.ts:26` | 1.50 / 14.20 | gates-replay, projected-once |
| oneOf-20 | `DependencyIndex` · `core/settle/utils/write/getDependencyIndex.ts:32` | 1.13 / 7.55 | dependency-replay, index-declarations-needed |
| oneOf-20 | `finishSettlement` · `core/settle/utils/settlement/finishSettlement.ts:23` | 0.32 / 41.52 | selection-replay, gates-replay, flush-reads-zero, recalculation-replay |
| oneOf-20 | `(anonymous)` · `core/settle/utils/gates/evaluateGate.ts:111` | 0.61 / 10.19 | gates-replay, projected-once |
| oneOf-20 | `writeSchemaNode` · `core/settle/utils/write/writeSchemaNode.ts:35` | 0.40 / 60.38 | selection-replay, gates-replay, flush-reads-zero, recalculation-replay |
| oneOf-20 | `transitionSettlement` · `core/settle/utils/transition/transitionSettlement.ts:28` | 0.36 / 37.95 | selection-replay, gates-replay, flush-reads-zero, recalculation-replay |
| oneOf-20 | `blueprint` · `core/blueprint/blueprint.ts:19` | 0.25 / 24.11 | blueprint-replay, node-membership-once, path-strings-replay |
| oneOf-20 | `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.11 / 60.77 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| oneOf-20 | `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.11 / 60.52 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| oneOf-20 | `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.04 / 24.73 | blueprint-replay, node-membership-once, path-strings-replay |
| oneOf-20 | `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.04 / 85.68 | blueprint-replay, delivery-replay, assembly-replay, selection-replay |
| oneOf-20 | `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.11 / 60.96 | delivery-replay, assembly-replay, selection-replay, gates-replay |
| oneOf-20 | `getDependencyIndex` · `core/settle/utils/write/getDependencyIndex.ts:161` | 0.04 / 7.59 | dependency-replay, index-declarations-needed |

## 95C-01 작업 제거 범위와 verdict

잡음은 9개 byte-identical control의 최대 |difference-of-medians| 및 |paired median|, 빈 종단 잔차 p95 + 양쪽 median의 bootstrap 99% 오차, 1 µs 중 최대입니다. 3회 각각 difference-of-medians가 자기 잡음보다 크고 paired bootstrap 95% 하한이 0보다 클 때만 ↑입니다. 표의 max 잡음은 세 회차 최대이고 median gain과 같은 회차 값은 아닙니다. 회차별 수치·CI·원시 101쌍·clock windows는 JSON에 보존했습니다.

| fixture | 동일 코드 noise envelope ms |
| --- | --- |
| nested-d5-f4 | 0.2845 |
| flat-500 | 0.0640 |
| oneOf-20 | 0.0528 |
| sample-0 | 0.0030 |

### nested-d5-f4

| 변형 | 새 / W ms | 제거 ms [회차 최소, 최대] | 최대 잡음 ms | verdict |
| --- | --- | --- | --- | --- |
| children-once | 7.0758 / 6.2403 | 0.8440 [0.7995, 1.0241] | 0.3301 | ↑ 잡음 밖 |
| children-replay | 6.7684 / 5.9974 | 0.7083 [0.6896, 0.9852] | 0.2845 | ↑ 잡음 밖 |
| declarations-replay | 7.6219 / 6.8131 | 0.7774 [0.7157, 1.0899] | 0.5771 | ↑ 잡음 밖 |
| declaration-sink | 7.8809 / 7.9238 | -0.0430 [-0.1097, 0.4160] | 0.7238 | ≈ 미입증 |
| path-strings-replay | 7.2277 / 6.0368 | 1.1635 [1.1422, 1.5401] | 0.5629 | ↑ 잡음 밖 |
| template-replay | 7.5645 / 7.0115 | 0.5797 [0.5523, 1.0496] | 0.6835 | ≈ 미입증 |
| projected-once | 7.7900 / 7.9212 | -0.1762 [-0.1778, 0.1547] | 0.5862 | ≈ 미입증 |
| projected-first | 7.8367 / 7.8932 | -0.0566 [-0.1951, 0.1637] | 0.6087 | ≈ 미입증 |
| projected-tokens | 7.9405 / 7.9230 | 0.0060 [-0.1300, 0.0424] | 0.7761 | ≈ 미입증 |
| blueprint-replay | 8.3642 / 1.3457 | 6.9897 [6.9532, 7.0595] | 0.2845 | ↑ 잡음 밖 |
| node-membership-once | 7.7250 / 7.8819 | -0.1569 [-0.2949, 0.1906] | 0.5816 | ≈ 미입증 |
| assembly-replay | 7.8028 / 7.6242 | 0.0970 [0.0549, 0.2744] | 0.6023 | ≈ 미입증 |
| delivery-replay | 7.8335 / 7.2371 | 0.4413 [0.3547, 0.6921] | 0.8171 | ≈ 미입증 |
| selection-replay | 8.0182 / 7.8835 | -0.1251 [-0.1347, 0.2733] | 0.9101 | ≈ 미입증 |
| selection-lazy | 7.8916 / 7.9690 | -0.0773 [-0.1270, 0.0602] | 0.6364 | ≈ 미입증 |
| flush-reads-zero | 7.8680 / 7.7929 | 0.0482 [0.0190, 0.0752] | 0.5448 | ≈ 미입증 |
| recalculation-replay | 7.8262 / 7.8523 | -0.0258 [-0.2295, 0.1712] | 0.6349 | ≈ 미입증 |
| assembly-first-plain | 7.7500 / 8.2334 | -0.4102 [-0.5540, -0.3798] | 0.6707 | ≈ 미입증 |
| dependency-replay | 7.8182 / 8.1067 | -0.0919 [-0.2884, 0.1022] | 0.8243 | ≈ 미입증 |
| dependency-paths-once | 7.9159 / 7.8530 | -0.0029 [-0.1353, 0.1286] | 0.6281 | ≈ 미입증 |
| gates-replay | 7.8155 / 7.9396 | -0.0124 [-0.2083, 0.0641] | 0.5757 | ≈ 미입증 |
| freeze-remainder | 7.8045 / 7.7151 | 0.1505 [0.0840, 0.2523] | 0.6320 | ≈ 미입증 |
| path-key-once | 7.8439 / 7.7210 | 0.2042 [0.0134, 0.2083] | 0.6124 | ≈ 미입증 |
| revision-dense-first | 8.1715 / 8.5232 | -0.0483 [-0.4076, 0.1078] | 0.8150 | ≈ 미입증 |
| fragment-empty-fast | 7.8460 / 7.5628 | 0.1860 [0.0335, 0.4590] | 0.5177 | ≈ 미입증 |
| template-key-classic | 7.8801 / 7.8742 | 0.0576 [-0.0340, 0.1255] | 1.0209 | ≈ 미입증 |
| gate-active-input-zero | 7.9701 / 8.0845 | -0.1692 [-0.2853, -0.1145] | 0.7791 | ≈ 미입증 |
| index-declarations-needed | 7.7254 / 7.8683 | -0.1430 [-0.4513, 0.3398] | 0.6699 | ≈ 미입증 |

### flat-500

| 변형 | 새 / W ms | 제거 ms [회차 최소, 최대] | 최대 잡음 ms | verdict |
| --- | --- | --- | --- | --- |
| children-once | 2.8521 / 2.6063 | 0.2515 [0.2459, 0.2730] | 0.1113 | ↑ 잡음 밖 |
| children-replay | 2.7333 / 2.5431 | 0.1773 [0.1544, 0.2003] | 0.1113 | ↑ 잡음 밖 |
| declarations-replay | 2.8520 / 2.4466 | 0.4336 [0.4055, 0.4509] | 0.0965 | ↑ 잡음 밖 |
| declaration-sink | 2.8506 / 2.8545 | -0.0274 [-0.0436, -0.0039] | 0.1477 | ≈ 미입증 |
| path-strings-replay | 2.7699 / 2.3973 | 0.3726 [0.3248, 0.3785] | 0.1158 | ↑ 잡음 밖 |
| template-replay | 2.8331 / 2.6371 | 0.2062 [0.1960, 0.2292] | 0.1070 | ↑ 잡음 밖 |
| projected-once | 2.8887 / 2.8617 | 0.0270 [-0.0253, 0.0685] | 0.1008 | ≈ 미입증 |
| projected-first | 2.8848 / 2.8580 | 0.0277 [-0.0191, 0.0351] | 0.1439 | ≈ 미입증 |
| projected-tokens | 2.8558 / 2.8587 | 0.0032 [-0.0119, 0.0467] | 0.1275 | ≈ 미입증 |
| blueprint-replay | 2.8562 / 0.5047 | 2.3552 [2.3230, 2.3948] | 0.1085 | ↑ 잡음 밖 |
| node-membership-once | 2.8496 / 2.8381 | 0.0292 [-0.0072, 0.0328] | 0.0949 | ≈ 미입증 |
| assembly-replay | 2.8770 / 2.7204 | 0.1567 [0.1131, 0.1575] | 0.1305 | ≈ 미입증 |
| delivery-replay | 2.9016 / 2.7717 | 0.1299 [0.1163, 0.1766] | 0.1658 | ↑ 잡음 밖 |
| selection-replay | 2.8605 / 2.8478 | -0.0066 [-0.0106, 0.0293] | 0.1075 | ≈ 미입증 |
| selection-lazy | 2.8703 / 2.8526 | 0.0168 [-0.0030, 0.0177] | 0.1241 | ≈ 미입증 |
| flush-reads-zero | 2.8352 / 2.8661 | -0.0209 [-0.0477, -0.0045] | 0.1021 | ≈ 미입증 |
| recalculation-replay | 2.8542 / 2.8558 | -0.0123 [-0.0177, 0.0093] | 0.1158 | ≈ 미입증 |
| assembly-first-plain | 2.8472 / 2.9024 | -0.0543 [-0.0950, -0.0155] | 0.1199 | ≈ 미입증 |
| dependency-replay | 2.8551 / 2.8492 | 0.0059 [0.0023, 0.0120] | 0.1033 | ≈ 미입증 |
| dependency-paths-once | 2.8580 / 2.8721 | -0.0141 [-0.0501, -0.0126] | 0.1489 | ≈ 미입증 |
| gates-replay | 2.8627 / 2.8665 | -0.0038 [-0.0885, 0.0170] | 0.1131 | ≈ 미입증 |
| freeze-remainder | 2.8478 / 2.8269 | 0.0210 [-0.0348, 0.0508] | 0.1065 | ≈ 미입증 |
| path-key-once | 2.8423 / 2.8015 | 0.0408 [0.0338, 0.0681] | 0.1082 | ≈ 미입증 |
| revision-dense-first | 2.8541 / 2.8321 | 0.0126 [-0.0030, 0.0316] | 0.1202 | ≈ 미입증 |
| fragment-empty-fast | 2.8365 / 2.6510 | 0.1843 [0.1800, 0.1992] | 0.0999 | ↑ 잡음 밖 |
| template-key-classic | 2.8457 / 2.8274 | 0.0053 [0.0042, 0.0183] | 0.1059 | ≈ 미입증 |
| gate-active-input-zero | 2.8396 / 2.8353 | -0.0151 [-0.0318, 0.0370] | 0.1027 | ≈ 미입증 |
| index-declarations-needed | 2.8365 / 2.8600 | -0.0235 [-0.0491, 0.0167] | 0.1083 | ≈ 미입증 |

### oneOf-20

| 변형 | 새 / W ms | 제거 ms [회차 최소, 최대] | 최대 잡음 ms | verdict |
| --- | --- | --- | --- | --- |
| children-once | 2.2078 / 2.1981 | 0.0029 [-0.0405, 0.0165] | 0.1137 | ≈ 미입증 |
| children-replay | 1.9708 / 1.9585 | 0.0070 [0.0035, 0.0122] | 0.0815 | ≈ 미입증 |
| declarations-replay | 2.2363 / 1.8460 | 0.3560 [0.3536, 0.5098] | 0.4117 | ≈ 미입증 |
| declaration-sink | 2.0095 / 2.0239 | -0.0199 [-0.0614, 0.0153] | 0.1258 | ≈ 미입증 |
| path-strings-replay | 1.9856 / 1.9021 | 0.0835 [0.0672, 0.0938] | 0.0876 | ≈ 미입증 |
| template-replay | 2.0198 / 1.9990 | 0.0359 [0.0209, 0.0625] | 0.1090 | ≈ 미입증 |
| projected-once | 2.0294 / 1.9744 | 0.0363 [0.0271, 0.0623] | 0.1227 | ≈ 미입증 |
| projected-first | 2.0337 / 2.0000 | 0.0279 [0.0093, 0.0865] | 0.0922 | ≈ 미입증 |
| projected-tokens | 2.0071 / 1.9712 | 0.0320 [0.0257, 0.0513] | 0.0890 | ≈ 미입증 |
| blueprint-replay | 2.1622 / 1.2248 | 0.9374 [0.9149, 1.2769] | 0.5075 | ↑ 잡음 밖 |
| node-membership-once | 2.0407 / 2.0533 | -0.0127 [-0.0307, 0.0403] | 0.1153 | ≈ 미입증 |
| assembly-replay | 1.9880 / 1.9580 | 0.0289 [0.0113, 0.0300] | 0.1331 | ≈ 미입증 |
| delivery-replay | 2.0250 / 2.0122 | 0.0000 [-0.0056, 0.0128] | 0.1144 | ≈ 미입증 |
| selection-replay | 2.0011 / 1.7460 | 0.2551 [0.2452, 0.2556] | 0.0775 | ↑ 잡음 밖 |
| selection-lazy | 2.0063 / 2.0217 | -0.0154 [-0.0442, 0.0233] | 0.0954 | ≈ 미입증 |
| flush-reads-zero | 2.0317 / 1.8600 | 0.1533 [0.1383, 0.1717] | 0.0868 | ↑ 잡음 밖 |
| recalculation-replay | 2.0069 / 1.8782 | 0.1287 [0.1285, 0.1710] | 0.1133 | ↑ 잡음 밖 |
| assembly-first-plain | 2.0140 / 2.0169 | -0.0269 [-0.0354, 0.0214] | 0.0829 | ≈ 미입증 |
| dependency-replay | 2.0104 / 1.9222 | 0.0927 [0.0882, 0.0935] | 0.0833 | ↑ 잡음 밖 |
| dependency-paths-once | 2.0429 / 1.9735 | 0.0797 [0.0694, 0.0981] | 0.0966 | ≈ 미입증 |
| gates-replay | 2.0435 / 1.6689 | 0.3746 [0.3352, 0.4005] | 0.0839 | ↑ 잡음 밖 |
| freeze-remainder | 2.0385 / 2.0430 | 0.0170 [-0.0045, 0.0204] | 0.0895 | ≈ 미입증 |
| path-key-once | 2.0058 / 2.0116 | 0.0075 [-0.0114, 0.0127] | 0.0951 | ≈ 미입증 |
| revision-dense-first | 2.0297 / 2.0213 | 0.0052 [0.0044, 0.0083] | 0.1022 | ≈ 미입증 |
| fragment-empty-fast | 2.0307 / 1.9982 | 0.0325 [0.0261, 0.0576] | 0.0859 | ≈ 미입증 |
| template-key-classic | 2.0288 / 2.0328 | -0.0040 [-0.0169, 0.0173] | 0.1302 | ≈ 미입증 |
| gate-active-input-zero | 2.0466 / 2.0460 | 0.0005 [-0.0073, 0.0042] | 0.0783 | ≈ 미입증 |
| index-declarations-needed | 2.0479 / 2.0455 | 0.0024 [-0.0225, 0.0112] | 0.0720 | ≈ 미입증 |

### sample-0

| 변형 | 새 / W ms | 제거 ms [회차 최소, 최대] | 최대 잡음 ms | verdict |
| --- | --- | --- | --- | --- |
| children-once | 0.1289 / 0.1130 | 0.0159 [0.0150, 0.0165] | 0.0252 | ≈ 미입증 |
| children-replay | 0.1181 / 0.1133 | 0.0049 [0.0014, 0.0055] | 0.0293 | ≈ 미입증 |
| declarations-replay | 0.1263 / 0.1150 | 0.0115 [0.0099, 0.0125] | 0.0189 | ≈ 미입증 |
| declaration-sink | 0.1248 / 0.1257 | 0.0020 [-0.0010, 0.0026] | 0.0272 | ≈ 미입증 |
| path-strings-replay | 0.1263 / 0.1180 | 0.0083 [0.0043, 0.0090] | 0.0270 | ≈ 미입증 |
| template-replay | 0.1263 / 0.1236 | 0.0038 [0.0027, 0.0060] | 0.0305 | ≈ 미입증 |
| projected-once | 0.1268 / 0.1277 | 0.0002 [-0.0057, 0.0018] | 0.0310 | ≈ 미입증 |
| projected-first | 0.1248 / 0.1265 | -0.0007 [-0.0019, 0.0003] | 0.0243 | ≈ 미입증 |
| projected-tokens | 0.1274 / 0.1258 | 0.0015 [0.0011, 0.0031] | 0.0247 | ≈ 미입증 |
| blueprint-replay | 0.1284 / 0.0551 | 0.0733 [0.0730, 0.0761] | 0.0221 | ↑ 잡음 밖 |
| node-membership-once | 0.1272 / 0.1249 | 0.0023 [0.0006, 0.0028] | 0.0275 | ≈ 미입증 |
| assembly-replay | 0.1262 / 0.1233 | 0.0029 [0.0003, 0.0035] | 0.0282 | ≈ 미입증 |
| delivery-replay | 0.1276 / 0.1255 | 0.0020 [0.0008, 0.0047] | 0.0240 | ≈ 미입증 |
| selection-replay | 0.1282 / 0.1278 | 0.0003 [-0.0013, 0.0024] | 0.0249 | ≈ 미입증 |
| selection-lazy | 0.1278 / 0.1277 | 0.0000 [-0.0001, 0.0017] | 0.0205 | ≈ 미입증 |
| flush-reads-zero | 0.1257 / 0.1261 | -0.0004 [-0.0020, -0.0002] | 0.0217 | ≈ 미입증 |
| recalculation-replay | 0.1255 / 0.1258 | -0.0001 [-0.0028, 0.0022] | 0.0649 | ≈ 미입증 |
| assembly-first-plain | 0.1256 / 0.1260 | 0.0013 [-0.0003, 0.0020] | 0.0632 | ≈ 미입증 |
| dependency-replay | 0.1265 / 0.1265 | -0.0005 [-0.0008, 0.0028] | 0.0585 | ≈ 미입증 |
| dependency-paths-once | 0.1294 / 0.1274 | 0.0002 [-0.0012, 0.0060] | 0.0232 | ≈ 미입증 |
| gates-replay | 0.1262 / 0.1263 | -0.0002 [-0.0007, -0.0000] | 0.0252 | ≈ 미입증 |
| freeze-remainder | 0.1275 / 0.1242 | 0.0019 [-0.0001, 0.0044] | 0.0265 | ≈ 미입증 |
| path-key-once | 0.1304 / 0.1279 | 0.0035 [-0.0020, 0.0047] | 0.0320 | ≈ 미입증 |
| revision-dense-first | 0.1253 / 0.1279 | -0.0007 [-0.0025, 0.0020] | 0.0221 | ≈ 미입증 |
| fragment-empty-fast | 0.1259 / 0.1236 | 0.0026 [0.0023, 0.0065] | 0.0303 | ≈ 미입증 |
| template-key-classic | 0.1295 / 0.1302 | -0.0004 [-0.0007, 0.0002] | 0.0208 | ≈ 미입증 |
| gate-active-input-zero | 0.1265 / 0.1242 | -0.0003 [-0.0004, 0.0025] | 0.0214 | ≈ 미입증 |
| index-declarations-needed | 0.1289 / 0.1286 | 0.0002 [-0.0014, 0.0008] | 0.0251 | ≈ 미입증 |

## 잡음 밖 범위의 순위와 단일 변경 명세

전체 graph/collector/path/selection bound는 서로 겹칩니다. 아래 제거 범위를 합산하지 마십시오. `blueprint-replay`는 중첩 전체 예산이고 개별 패치의 실행 우선순위는 실제 narrow 근거를 먼저 봅니다.

| 순위 | fixture / 범위 | 제거 ms | 분류 | 범위 내 한 변경·ledger |
| --- | --- | --- | --- | --- |
| 1 | nested-d5-f4 / blueprint-replay | 6.9897 | 중첩 전체 예산 | buildNodes에서 단일 conjunction의 group.declarations를 중간 owned/conjunction 배열로 다시 복사하는 작업만 제거하십시오. node-membership-once의 실제 이득은 미입증입니다. 전체 blueprint 공유를 수정 명세로 제안하지 않습니다. Ledger 질문: 없음. |
| 2 | flat-500 / blueprint-replay | 2.3552 | 중첩 전체 예산 | buildNodes에서 단일 conjunction의 group.declarations를 중간 owned/conjunction 배열로 다시 복사하는 작업만 제거하십시오. node-membership-once의 실제 이득은 미입증입니다. 전체 blueprint 공유를 수정 명세로 제안하지 않습니다. Ledger 질문: 없음. |
| 3 | nested-d5-f4 / path-strings-replay | 1.1635 | 전체 작업 제거 | getTemplateKey의 private 동치 관계를 유지하는 occurrence/context/ordered gate tuple key를 한 번 구성하고 host-bound key가 그 문자열을 다시 JSON 인코딩하지 않게 하십시오. 공개 schema/data 경로 및 순서는 그대로 생산하십시오. Ledger 질문: 없음. |
| 4 | oneOf-20 / blueprint-replay | 0.9374 | 중첩 전체 예산 | buildNodes에서 단일 conjunction의 group.declarations를 중간 owned/conjunction 배열로 다시 복사하는 작업만 제거하십시오. node-membership-once의 실제 이득은 미입증입니다. 전체 blueprint 공유를 수정 명세로 제안하지 않습니다. Ledger 질문: 없음. |
| 5 | nested-d5-f4 / children-once | 0.8440 | 단일 변경 | populateNodeChildren의 단일 conjunction·ungated object 경로에서 eager Object.entries snapshot을 곧바로 build에 전달하십시오. 중간 properties Map과 재열거를 제거하고 기존 binding producer·DFS·정적 검사를 유지하십시오. Ledger 질문: 없음. |
| 6 | nested-d5-f4 / declarations-replay | 0.7774 | 전체 작업 제거 | collectDeclarations의 recursive 반환 flatten을 최종 소유자별 단일 ordered sink로 바꾸십시오. ID 예약·fragment 연결·capability·진단은 기존 DFS 위치에 두고 최종 공개 배열은 그대로 생산하십시오. Ledger 질문: 없음. |
| 7 | nested-d5-f4 / children-replay | 0.7083 | 전체 작업 제거 | children-once와 같은 직접 전달 명세입니다. replay에는 binding 생산까지 들어가므로 공개 결과를 생산하는 실제 변경의 회수 시간은 별도입니다. Ledger 질문: 없음. |
| 8 | flat-500 / declarations-replay | 0.4336 | 전체 작업 제거 | collectDeclarations의 recursive 반환 flatten을 최종 소유자별 단일 ordered sink로 바꾸십시오. ID 예약·fragment 연결·capability·진단은 기존 DFS 위치에 두고 최종 공개 배열은 그대로 생산하십시오. Ledger 질문: 없음. |
| 9 | oneOf-20 / gates-replay | 0.3746 | 전체 작업 제거 | evaluateGate의 dependencies.map callback을 동일 읽기 순서의 고정 길이 classic loop로 교체하십시오. 평가 함수는 매회 호출하고 catch·gateThrowVersion·오류 occurrence를 유지하십시오. 결과 memo는 제안하지 않습니다. Ledger 질문: 없음. |
| 10 | flat-500 / path-strings-replay | 0.3726 | 전체 작업 제거 | getTemplateKey의 private 동치 관계를 유지하는 occurrence/context/ordered gate tuple key를 한 번 구성하고 host-bound key가 그 문자열을 다시 JSON 인코딩하지 않게 하십시오. 공개 schema/data 경로 및 순서는 그대로 생산하십시오. Ledger 질문: 없음. |
| 11 | oneOf-20 / selection-replay | 0.2551 | 부분 작업 제거 | 단일 declaration edge의 immutable 단일 ID 목록을 entry별로 한 번 생산하고 성공 시 사용하십시오. gate 호출·flush·throw 및 선택 순서는 전부 유지하십시오. Ledger 질문: 없음. |
| 12 | flat-500 / children-once | 0.2515 | 단일 변경 | populateNodeChildren의 단일 conjunction·ungated object 경로에서 eager Object.entries snapshot을 곧바로 build에 전달하십시오. 중간 properties Map과 재열거를 제거하고 기존 binding producer·DFS·정적 검사를 유지하십시오. Ledger 질문: 없음. |
| 13 | flat-500 / template-replay | 0.2062 | 부분 작업 제거 | 같은 내부 tuple key 단일 구성 명세입니다. 현재 단순 문자열 연결과 classic-loop 변형은 그 전체 예산을 회수하지 못했습니다. Ledger 질문: 없음. |
| 14 | flat-500 / fragment-empty-fast | 0.1843 | 단일 변경 | 기존 제어·타입 검사·capability·ID·fragment 기록 뒤, $ref/allOf/if/oneOf/anyOf가 없을 때 visiting stack 및 고정 fragment keyword loop 생성을 생략하십시오. Ledger 질문: 없음. |
| 15 | flat-500 / children-replay | 0.1773 | 전체 작업 제거 | children-once와 같은 직접 전달 명세입니다. replay에는 binding 생산까지 들어가므로 공개 결과를 생산하는 실제 변경의 회수 시간은 별도입니다. Ledger 질문: 없음. |
| 16 | oneOf-20 / flush-reads-zero | 0.1533 | 전체 작업 제거 | READ_PLANS의 occurrence·bound dependency에 JSON Pointer token/첫 segment를 한 번 바인딩하고 순수 경로 해석을 재사용하십시오. pending output 검사와 실제 flush 시점은 유지하십시오. Ledger 질문: 없음. |
| 17 | flat-500 / delivery-replay | 0.1299 | 전체 작업 제거 | EMPTY previous와 UpdateValue|RequestRefresh의 첫 mask만 기존 undefined/증가 값을 보존하는 조밀한 counter literal로 초기화하십시오. private counter 소유권과 새 ledger 참조를 유지하십시오. 이 좁은 후보 자체의 개선은 미입증입니다. Ledger 질문: 없음. |
| 18 | oneOf-20 / recalculation-replay | 0.1287 | 전체 작업 제거 | registerRecalculation에서 affected owner 경로를 최초 등장 순서대로 한 번 모아 반복 prefix slicing과 세 집합의 중복 등록을 제거하십시오. 기존 dirty 순서와 affected 관계를 유지하십시오. Ledger 질문: 없음. |
| 19 | oneOf-20 / dependency-replay | 0.0927 | 전체 작업 제거 | DependencyIndex.add에서 같은 watchedPath의 encoded token을 index construction 동안 한 번 해석하고 재사용하십시오. wildcard/owner 비교와 최초 owner 삽입 순서를 유지하십시오. Ledger 질문: 없음. |
| 20 | sample-0 / blueprint-replay | 0.0733 | 중첩 전체 예산 | buildNodes에서 단일 conjunction의 group.declarations를 중간 owned/conjunction 배열로 다시 복사하는 작업만 제거하십시오. node-membership-once의 실제 이득은 미입증입니다. 전체 blueprint 공유를 수정 명세로 제안하지 않습니다. Ledger 질문: 없음. |

### 실제 narrow 후보 우선순위

| fixture / 후보 | 개선 ms | 명세 |
| --- | --- | --- |
| nested-d5-f4 / children-once | 0.8440 | populateNodeChildren의 단일 conjunction·ungated object 경로에서 eager Object.entries snapshot을 곧바로 build에 전달하십시오. 중간 properties Map과 재열거를 제거하고 기존 binding producer·DFS·정적 검사를 유지하십시오. |
| flat-500 / children-once | 0.2515 | populateNodeChildren의 단일 conjunction·ungated object 경로에서 eager Object.entries snapshot을 곧바로 build에 전달하십시오. 중간 properties Map과 재열거를 제거하고 기존 binding producer·DFS·정적 검사를 유지하십시오. |
| flat-500 / fragment-empty-fast | 0.1843 | 기존 제어·타입 검사·capability·ID·fragment 기록 뒤, $ref/allOf/if/oneOf/anyOf가 없을 때 visiting stack 및 고정 fragment keyword loop 생성을 생략하십시오. |

같은 후보의 fixture 수치를 합산하지 않습니다. `declaration-sink`만으로 네 fixture의 안정적 이득이 없으며 선언 전체 replay를 그 수정의 기대치로 쓰지 않습니다. `projected-once`와 `projected-first` 모두 잡음 밖을 통과하지 못했습니다. mount만 재므로 limited variant의 첫 공개 전이 이득에 대한 시간 주장은 없습니다. `path-key-once`·`template-key-classic`, `node-membership-once`, `selection-lazy`, `assembly-first-plain`, `revision-dense-first`, `gate-active-input-zero`, `index-declarations-needed`도 안정적인 일반 mount 개선이 미입증입니다.

## 무효 memo 진단과 ledger 질문

mount 전체의 무조건 projection/gate memo는 oneOf payload를 없앴습니다. 이 3개 진단 JSON은 보존했으며 정상 bound/순위에서 제외했습니다. 정상 projected 변형은 context별 memo를 사용하고 markWrite/updateOutput/selectChildren 진입 및 pending output이 있는 읽기에서 지웁니다. limited 변형은 load 및 root의 첫 non-load context에만 사용합니다. 이 coarse 경계는 일반 cache 정당성 증명이 아닙니다.

권장 한 변경 명세는 기존 읽기·평가·정착·오류 순서와 공개 결과를 유지하는 내부 작업 제거이므로 새 ledger 질문이 없습니다. projection 값을 epoch 전체에서 공유하는 새 규칙이나 form/mount 간 blueprint/runtime result 공유를 채택하려면 별도 범위 확장 질문이 필요합니다. 현재 round 104 범위에서 이 결과 공유를 권장하지 않습니다. 작은 form update 수용은 다시 묻지 않습니다.

각 후속 fix는 frozen 상태/own enumerable 필드/필수 참조 관계와 static 오류·warning의 code/source path/순서/개수를 보존해야 합니다. Boolean·nullable·충돌 제약·무효 pattern·custom collect/isAtomic·inactive gated branch·다중 host $ref·순서 민감 overlay를 포함하십시오. gate/경로 수정은 중간 쓰기·앞 gate의 flush·extras·배열 rekey·다중 host를 포함하고 실제 평가 횟수 및 실패 재평가를 줄이지 않아야 합니다.

## 산출물과 실행 감사

| 항목 | 결과 |
| --- | --- |
| HEAD | a958b37cbf7d7cd897565a06278ee141fd402816 |
| 채택 worker 자연 종료 | 423개, signal 없음 |
| 전체 성공 command 최대 | 250586 ms (<480000 ms) |
| worker 최대 | 4459 ms |
| worker 시간 겹침 | 없음 |
| 제품 src diff | 없음 |
| bundle / map / cache | 저장소 안 신규 출력 없음. bundle/map은 /private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles |
| 개별 raw 파일 최대 | 519104 bytes (≤5000000) |

`profile-105-rebound/measure.mjs`는 profile-102의 원본 harness와 round-99 canonical builder를 메모리에서 재배치합니다. 모든 source transform은 esbuild onLoad 메모리에서만 수행했으며 서비스는 stdin EOF로 종료했습니다. `process-*.json`, `build-*.json`, `counts-*.json`, `cpu-*.cpuprofile`, `*-forced-r*.json`, `verdict-*.json`이 재현·검증 근거입니다. 공식 보고서는 `profile-105-rebound.md`, 구조화 요약은 `profile-105-rebound-summary.json`입니다.
