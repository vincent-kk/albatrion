# 107: 현재 mount 비율과 남은 코드 작업 제거 범위

`5c530e05414df1c7a09e0b5307b04910a0864c90`에서 측정했습니다. 잡음 밖의 코드 작업 제거 범위가 아직 남아 있습니다. 실제 단일 변경 중 잡음 밖 후보도 있습니다. 넓은 replay 범위는 한 수정의 기대 성능이 아닙니다.

## 현재 공식 core mount 열

공식 `tools/measure-verdict-95c01.mjs`를 메모리에서 HEAD·예열 20·data module 위치만 재배치했습니다. 도구의 기본 development 빌드 모드와 전체 종단/후속 callback 진단을 유지했습니다. validation OFF, 외부 구독자 0, onChange noop, fresh old→new / new→old / old→new 프로세스, 각 warmup 20·101 표본입니다. CPU/ablation은 105와 같은 production이므로 이 비율의 비용과 직접 빼거나 더하지 않습니다.

| fixture | 새 median / p99 ms | 구 공식 median / p99 ms | 새/0.16.0 | 회차 1 / 2 / 3 | 구 선택 | 1.5× 판정 |
| --- | --- | --- | --- | --- | --- | --- |
| sample-0 | 0.1079 / 0.1407 | 0.0758 / 0.1183 | 1.4231× | 1.3768 / 1.4580 / 1.4232 | 종단 | 충족 |
| sample-1 | 0.1569 / 0.2112 | 0.1003 / 0.1496 | 1.5635× | 1.6125 / 1.5729 / 1.5018 | 종단 | 미달 |
| sample-2 | 0.2213 / 0.2652 | 0.1038 / 0.1644 | 2.1329× | 2.1361 / 2.0783 / 2.1707 | 종단 | 미달 |
| sample-3 | 0.5310 / 0.6072 | 0.3183 / 0.3883 | 1.6679× | 1.6518 / 1.6930 / 1.6544 | 종단 | 미달 |
| flat-50 | 0.3542 / 0.4188 | 0.2108 / 0.2484 | 1.6804× | 1.6924 / 1.6996 / 1.6594 | (나) microtask + callback 합 | 미달 |
| flat-100 | 0.6414 / 0.7205 | 0.3802 / 0.4326 | 1.6869× | 1.7626 / 1.6263 / 1.6181 | (나) microtask + callback 합 | 미달 |
| flat-500 | 2.5544 / 2.8194 | 1.7189 / 1.9521 | 1.4861× | 1.5073 / 1.4117 / 1.5194 | (나) microtask + callback 합 | 충족 (공식 동률 규칙) |
| nested-d3-f4 | 0.5462 / 0.6177 | 0.2553 / 0.3018 | 2.1397× | 2.1504 / 2.2140 / 2.0852 | (나) microtask + callback 합 | 미달 |
| nested-d5-f4 | 7.5629 / 8.4117 | 3.0027 / 3.2380 | 2.5187× | 2.5024 / 2.5657 / 2.4892 | (나) microtask + callback 합 | 미달 |
| array-100 | 0.5144 / 0.6201 | 0.9500 / 1.0758 | 0.5415× | 0.5571 / 0.5378 / 0.5326 | (나) microtask + callback 합 | 충족 |
| array-500 | 1.7859 / 1.9897 | 4.0373 / 4.6214 | 0.4423× | 0.4466 / 0.4399 / 0.4397 | (나) microtask + callback 합 | 충족 |
| array-1000 | 3.9601 / 4.7722 | 8.1827 / 9.0401 | 0.4840× | 0.5073 / 0.4891 / 0.4650 | (나) microtask + callback 합 | 충족 |
| computed-visible-derived | 0.4510 / 0.5591 | 0.1275 / 0.1904 | 3.5361× | 3.5105 / 3.4069 / 3.5955 | 종단 | 미달 |
| oneOf-20 | 1.7425 / 1.9990 | 0.2918 / 0.3493 | 5.9724× | 6.1195 / 6.0609 / 5.8416 | (나) microtask + callback 합 | 미달 |

기존 공식 표의 분기 없음 12개 mount와 식 전용 1개 mount를 모두 포함했고 oneOf-20 OFF를 추가했습니다. oneOf의 1.5× 비교는 이번 질문의 요청에 따른 수치 비교이며 기존 분기 증가 ledger를 대체하지 않습니다. 303개 전체 표본 median 비율입니다. 공식 94C-02에 따라 회차가 목표선 양쪽이면 동률·충족입니다.

## 종단 검증과 보정

clock 밖 schema clone·강제 GC 뒤 별도 check anchor를 기다리고, 호출→64 Promise checkpoints→같은 check 큐 FIFO sentinel까지 잽니다. 공식 표본 뒤에만 scheduler callback을 감쌌습니다. 모든 sentinel의 pending=0, 추가 128 checkpoints/다음 sentinel의 추가 예약·실행=0, 새 엔진 예약=0입니다. 같은 빈 호출 16968개의 pooled C=17.2910µs, M=3.0000µs를 두 판에 공통으로 뺐습니다. (가)는 새 종단과 microtask, (나)는 구 종단과 microtask+별도 callback의 순번별 합을 비교합니다. 한 회차라도 (나)가 잡음 밖이면 세 회차 모두 합을 씁니다. 기존 구 선택을 고정하지 않았고 음수 clipping은 없습니다.

| fixture/run | 새 (가) 차이 / 잡음 ms | 구 (나) 차이 / 잡음 ms | 구 (나) 일치 |
| --- | --- | --- | --- |
| sample-0/1 | 0.0016 / 0.0089 | 0.0020 / 0.0083 | 예 |
| sample-0/2 | 0.0018 / 0.0100 | 0.0018 / 0.0091 | 예 |
| sample-0/3 | 0.0019 / 0.0086 | 0.0018 / 0.0091 | 예 |
| sample-1/1 | 0.0021 / 0.0182 | 0.0025 / 0.0227 | 예 |
| sample-1/2 | 0.0031 / 0.0180 | 0.0020 / 0.0156 | 예 |
| sample-1/3 | 0.0022 / 0.0180 | 0.0035 / 0.0179 | 예 |
| sample-2/1 | 0.0037 / 0.0189 | 0.0015 / 0.0117 | 예 |
| sample-2/2 | 0.0025 / 0.0175 | 0.0025 / 0.0127 | 예 |
| sample-2/3 | 0.0028 / 0.0162 | 0.0020 / 0.0130 | 예 |
| sample-3/1 | 0.0101 / 0.0142 | 0.0095 / 0.0158 | 예 |
| sample-3/2 | 0.0081 / 0.0227 | 0.0075 / 0.0200 | 예 |
| sample-3/3 | 0.0098 / 0.0180 | 0.0088 / 0.0178 | 예 |
| flat-50/1 | 0.0049 / 0.0176 | 0.0099 / 0.0089 | 아니요 |
| flat-50/2 | 0.0045 / 0.0155 | 0.0081 / 0.0086 | 예 |
| flat-50/3 | 0.0027 / 0.0131 | 0.0078 / 0.0092 | 예 |
| flat-100/1 | 0.0150 / 0.0292 | 0.0171 / 0.0126 | 아니요 |
| flat-100/2 | 0.0229 / 0.0269 | 0.0182 / 0.0135 | 아니요 |
| flat-100/3 | 0.0185 / 0.0274 | 0.0214 / 0.0126 | 아니요 |
| flat-500/1 | 0.0153 / 0.0591 | 0.0852 / 0.0500 | 아니요 |
| flat-500/2 | 0.0129 / 0.0715 | 0.0914 / 0.0431 | 아니요 |
| flat-500/3 | 0.0140 / 0.0755 | 0.0811 / 0.0372 | 아니요 |
| nested-d3-f4/1 | 0.0151 / 0.0258 | 0.0140 / 0.0110 | 아니요 |
| nested-d3-f4/2 | 0.0179 / 0.0386 | 0.0128 / 0.0119 | 아니요 |
| nested-d3-f4/3 | 0.0101 / 0.0241 | 0.0148 / 0.0133 | 아니요 |
| nested-d5-f4/1 | 0.0094 / 0.2519 | 0.1658 / 0.0800 | 아니요 |
| nested-d5-f4/2 | 0.0115 / 0.2726 | 0.1633 / 0.0552 | 아니요 |
| nested-d5-f4/3 | 0.0324 / 0.4018 | 0.1785 / 0.0905 | 아니요 |
| array-100/1 | 0.0149 / 0.0377 | 0.0926 / 0.0386 | 아니요 |
| array-100/2 | 0.0096 / 0.0272 | 0.0868 / 0.0462 | 아니요 |
| array-100/3 | 0.0075 / 0.0691 | 0.0797 / 0.0387 | 아니요 |
| array-500/1 | 0.0189 / 0.0334 | 0.2923 / 0.1792 | 아니요 |
| array-500/2 | 0.0165 / 0.0284 | 0.3141 / 0.2758 | 아니요 |
| array-500/3 | 0.0164 / 0.0306 | 0.3027 / 0.1679 | 아니요 |
| array-1000/1 | 0.0245 / 0.1498 | 0.5880 / 0.8545 | 예 |
| array-1000/2 | 0.0185 / 0.1035 | 0.5075 / 1.2712 | 예 |
| array-1000/3 | 0.0248 / 0.1176 | 0.5657 / 0.6258 | 예 |
| computed-visible-derived/1 | 0.0084 / 0.0328 | 0.0008 / 0.0162 | 예 |
| computed-visible-derived/2 | 0.0063 / 0.0550 | 0.0024 / 0.0172 | 예 |
| computed-visible-derived/3 | 0.0072 / 0.0262 | 0.0020 / 0.0115 | 예 |
| oneOf-20/1 | 0.0106 / 0.0505 | 0.0090 / 0.0284 | 예 |
| oneOf-20/2 | 0.0252 / 0.0751 | 0.0156 / 0.0174 | 예 |
| oneOf-20/3 | 0.0120 / 0.0611 | 0.0114 / 0.0228 | 예 |

## 계수 없는 steady CPU 프로파일

각 fixture별 세 fresh process에서 warmup 20 뒤 101개 consecutive mount를 100µs 간격으로 수집했습니다. 101개 schema clone을 Profiler.start 전에 준비했고 강제 GC는 하지 않았습니다. mount window와 sample timeDelta의 교차 시간을 가중하고 GC/program/idle/driver도 분모에 남겼습니다. 재귀 함수 total은 같은 frame당 한 번만 셉니다. V8 inline 비용은 caller self에 포함될 수 있고 inclusive total끼리 합산하지 않습니다.

| fixture | mounts | 표본 | 분모 ms | GC % | program % |
| --- | --- | --- | --- | --- | --- |
| nested-d5-f4 | 303 | 12429 | 1919.0430 | 28.61 | 1.55 |
| flat-500 | 303 | 4369 | 677.6920 | 24.13 | 1.93 |

### nested-d5-f4 / self top 20

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 28.61 | 28.61 | 1812.25 | 1812.25 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:32` | 18.31 | 40.13 | 1159.64 | 2541.58 |
| `encodeLeaf` · `core/blueprint/utils/analyze/getTemplateKey.ts:14` | 5.81 | 5.81 | 368.02 | 368.02 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 5.32 | 5.47 | 337.00 | 346.15 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:34` | 4.70 | 5.85 | 297.67 | 370.31 |
| `getStaticObjectEntries` · `core/settle/utils/load/getStaticObjectEntries.ts:11` | 3.78 | 3.78 | 239.17 | 239.17 |
| `getStaticChoices` · `core/behaviors/utils/options/getStaticChoices.ts:23` | 3.44 | 3.44 | 218.17 | 218.17 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.31 | 4.11 | 209.64 | 260.61 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 3.25 | 39.36 | 205.71 | 2492.94 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.70 | 25.31 | 171.02 | 1602.79 |
| `createSchemaNode` · `core/SchemaNode/utils/schemaNodeFactory.ts:29` | 2.50 | 3.72 | 158.18 | 235.33 |
| `appendChildEntries` · `core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts:17` | 1.55 | 1.55 | 98.39 | 98.39 |
| `(program)` · `(V8):0` | 1.55 | 1.55 | 97.92 | 97.92 |
| `visitShape` · `core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:14` | 1.36 | 1.42 | 85.98 | 90.05 |
| `mergeSingleStaticContribution` · `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:19` | 1.30 | 2.11 | 82.60 | 133.79 |
| `createChildNode` · `core/settle/utils/compute/createChildNode.ts:10` | 0.87 | 4.53 | 55.39 | 287.17 |
| `freezeEffectiveSchema` · `core/blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:14` | 0.81 | 0.81 | 51.18 | 51.18 |
| `resolveNodeTypes` · `core/blueprint/utils/types/resolveNodeTypes.ts:17` | 0.74 | 1.44 | 46.97 | 91.23 |
| `readAllowedTypes` · `core/blueprint/utils/types/readAllowedTypes.ts:19` | 0.72 | 1.21 | 45.85 | 76.90 |
| `mergeEffectiveSchema` · `core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` | 0.62 | 0.62 | 39.03 | 39.03 |

### nested-d5-f4 / total top 20

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 6333.48 |
| `measured` · `(round-99 canonical adapter):326` | 0.09 | 69.22 | 5.67 | 4384.02 |
| `cpu` · `(round-99 canonical adapter):474` | 0.04 | 69.18 | 2.59 | 4381.21 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.01 | 69.11 | 0.45 | 4377.33 |
| `create` · `(round-99 canonical adapter):157` | 0.05 | 69.11 | 2.97 | 4376.89 |
| `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.02 | 69.04 | 1.52 | 4372.71 |
| `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.08 | 42.14 | 5.08 | 2669.19 |
| `blueprint` · `core/blueprint/blueprint.ts:19` | 0.19 | 41.97 | 12.23 | 2658.05 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:32` | 18.31 | 40.13 | 1159.64 | 2541.58 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 3.25 | 39.36 | 205.71 | 2492.94 |
| `(garbage collector)` · `(V8):0` | 28.61 | 28.61 | 1812.25 | 1812.25 |
| `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.01 | 26.87 | 0.50 | 1702.00 |
| `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.05 | 26.85 | 3.02 | 1700.49 |
| `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.46 | 25.79 | 29.30 | 1633.10 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.70 | 25.31 | 171.02 | 1602.79 |
| `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.43 | 7.59 | 27.42 | 480.74 |
| `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:35` | 0.43 | 6.24 | 27.11 | 395.13 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:34` | 4.70 | 5.85 | 297.67 | 370.31 |
| `encodeLeaf` · `core/blueprint/utils/analyze/getTemplateKey.ts:14` | 5.81 | 5.81 | 368.02 | 368.02 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 5.32 | 5.47 | 337.00 | 346.15 |

### flat-500 / self top 20

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(garbage collector)` · `(V8):0` | 24.13 | 24.13 | 539.63 | 539.63 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:32` | 18.31 | 39.65 | 409.51 | 886.76 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 6.14 | 6.38 | 137.35 | 142.69 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:34` | 4.92 | 6.36 | 110.02 | 142.22 |
| `getStaticChoices` · `core/behaviors/utils/options/getStaticChoices.ts:23` | 4.47 | 4.47 | 100.04 | 100.04 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 3.45 | 38.48 | 77.15 | 860.53 |
| `encodeLeaf` · `core/blueprint/utils/analyze/getTemplateKey.ts:14` | 3.44 | 3.44 | 76.83 | 76.83 |
| `getStaticObjectEntries` · `core/settle/utils/load/getStaticObjectEntries.ts:11` | 3.30 | 3.30 | 73.81 | 73.81 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.23 | 5.78 | 72.23 | 129.32 |
| `createSchemaNode` · `core/SchemaNode/utils/schemaNodeFactory.ts:29` | 2.80 | 3.69 | 62.62 | 82.48 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.51 | 28.79 | 56.12 | 643.88 |
| `writeObjectKey` · `core/behaviors/objectBehavior/utils/keys/writeObjectKey.ts:2` | 2.42 | 2.42 | 54.04 | 54.04 |
| `(program)` · `(V8):0` | 1.93 | 1.93 | 43.16 | 43.16 |
| `appendChildEntries` · `core/blueprint/utils/analyze/populateNodeChildren/utils/appendChildEntries.ts:17` | 1.37 | 1.37 | 30.70 | 30.70 |
| `resolveNodeTypes` · `core/blueprint/utils/types/resolveNodeTypes.ts:17` | 1.28 | 2.17 | 28.69 | 48.63 |
| `mergeSingleStaticContribution` · `core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions/utils/mergeSingleStaticContribution.ts:19` | 1.23 | 1.84 | 27.45 | 41.24 |
| `resolveNodeStrategy` · `core/blueprint/utils/types/resolveNodeStrategy.ts:14` | 1.13 | 1.22 | 25.19 | 27.18 |
| `readAllowedTypes` · `core/blueprint/utils/types/readAllowedTypes.ts:19` | 0.86 | 1.54 | 19.23 | 34.37 |
| `(idle)` · `(V8):0` | 0.74 | 0.74 | 16.46 | 16.46 |
| `freezeEffectiveSchema` · `core/blueprint/utils/effectiveSchema/utils/freezeEffectiveSchema.ts:14` | 0.62 | 0.62 | 13.79 | 13.79 |

### flat-500 / total top 20

| 함수·원본 위치 | self % | total % | self µs/mount | total µs/mount |
| --- | --- | --- | --- | --- |
| `(root)` · `(V8):0` | 0.00 | 100.00 | 0.00 | 2236.61 |
| `measured` · `(round-99 canonical adapter):326` | 0.13 | 72.45 | 2.98 | 1620.32 |
| `cpu` · `(round-99 canonical adapter):474` | 0.07 | 72.29 | 1.47 | 1616.76 |
| `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.00 | 72.20 | 0.00 | 1614.80 |
| `create` · `(round-99 canonical adapter):157` | 0.00 | 72.20 | 0.00 | 1614.80 |
| `(anonymous)` · `(round-99 canonical adapter):484` | 0.00 | 72.20 | 0.00 | 1614.80 |
| `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.09 | 41.39 | 2.03 | 925.67 |
| `blueprint` · `core/blueprint/blueprint.ts:19` | 0.11 | 41.11 | 2.54 | 919.55 |
| `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:32` | 18.31 | 39.65 | 409.51 | 886.76 |
| `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 3.45 | 38.48 | 77.15 | 860.53 |
| `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.05 | 30.81 | 1.02 | 689.13 |
| `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.05 | 30.77 | 1.01 | 688.11 |
| `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.59 | 29.40 | 13.21 | 657.60 |
| `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.51 | 28.79 | 56.12 | 643.88 |
| `(garbage collector)` · `(V8):0` | 24.13 | 24.13 | 539.63 | 539.63 |
| `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.34 | 10.73 | 7.64 | 240.05 |
| `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 6.14 | 6.38 | 137.35 | 142.69 |
| `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:34` | 4.92 | 6.36 | 110.02 | 142.22 |
| `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.23 | 5.78 | 72.23 | 129.32 |
| `projectEmpty` · `core/behaviors/utils/slots/projectEmpty.ts:6` | 0.14 | 4.59 | 3.03 | 102.57 |

## total ≥5% 함수의 누락 없는 귀속

부모 entry/dispatch/load 함수는 자손을 포함하는 누적 범위입니다. self가 5% 미만인 부모에 대해 자손 budget을 별도 제거 범위처럼 반복 계산하지 않았습니다. GC에는 독립적인 코드 owner가 없으며 allocation 관련 ablation과 S01에 겹칩니다. 강제 GC를 clock 밖에 둔 판정 열에서 CPU의 GC 비율을 그대로 시간 절약으로 환산하지 않습니다.

| fixture | 함수·위치 | self / total % | 연결한 범위 또는 제외 근거 |
| --- | --- | --- | --- |
| nested-d5-f4 | `(garbage collector)` · `(V8):0` | 28.61 / 28.61 | VM 분모입니다. 강제 GC가 clock 밖인 판정 열에서 독립 GC 절약으로 바꾸지 않습니다. |
| nested-d5-f4 | `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:32` | 18.31 / 40.13 | build-own-replay, template-replay, declarations-replay |
| nested-d5-f4 | `encodeLeaf` · `core/blueprint/utils/analyze/getTemplateKey.ts:14` | 5.81 / 5.81 | template-replay, encode-native, key-single-json |
| nested-d5-f4 | `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:34` | 4.70 / 5.85 | declarations-replay |
| nested-d5-f4 | `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 5.32 / 5.47 | delivery-replay, revision-dense-first |
| nested-d5-f4 | `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 3.25 / 39.36 | child-own-replay, child-input-literal, build-own-replay |
| nested-d5-f4 | `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.70 / 25.31 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| nested-d5-f4 | `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.43 / 7.59 | assembly-replay, choices-replay |
| nested-d5-f4 | `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.46 / 25.79 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| nested-d5-f4 | `getTemplateKey` · `core/blueprint/utils/analyze/getTemplateKey.ts:35` | 0.43 / 6.24 | template-replay, encode-native, key-single-json |
| nested-d5-f4 | `blueprint` · `core/blueprint/blueprint.ts:19` | 0.19 / 41.97 | blueprint-replay |
| nested-d5-f4 | `measured` · `(round-99 canonical adapter):326` | 0.09 / 69.22 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| nested-d5-f4 | `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.02 / 69.04 | blueprint-replay, build-own-replay, assembly-replay, delivery-replay |
| nested-d5-f4 | `create` · `(round-99 canonical adapter):157` | 0.05 / 69.11 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| nested-d5-f4 | `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.05 / 26.85 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| nested-d5-f4 | `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.08 / 42.14 | blueprint-replay |
| nested-d5-f4 | `cpu` · `(round-99 canonical adapter):474` | 0.04 / 69.18 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| nested-d5-f4 | `(anonymous)` · `(round-99 canonical adapter):484` | 0.01 / 69.11 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| nested-d5-f4 | `(root)` · `(V8):0` | 0.00 / 100.00 | VM 분모입니다. 강제 GC가 clock 밖인 판정 열에서 독립 GC 절약으로 바꾸지 않습니다. |
| nested-d5-f4 | `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.01 / 26.87 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| flat-500 | `(garbage collector)` · `(V8):0` | 24.13 / 24.13 | VM 분모입니다. 강제 GC가 clock 밖인 판정 열에서 독립 GC 절약으로 바꾸지 않습니다. |
| flat-500 | `buildNodes` · `core/blueprint/utils/analyze/buildNodes.ts:32` | 18.31 / 39.65 | build-own-replay, template-replay, declarations-replay |
| flat-500 | `commitStaticFirstNode` · `core/settle/utils/load/commitStaticFirstNode.ts:13` | 6.14 / 6.38 | delivery-replay, revision-dense-first |
| flat-500 | `collectDeclarations` · `core/blueprint/utils/analyze/collectDeclarations.ts:34` | 4.92 / 6.36 | declarations-replay |
| flat-500 | `assembleObject` · `core/behaviors/objectBehavior/branch/utils/assembleObject.ts:18` | 3.23 / 5.78 | assembly-replay, assembly-first-empty-hints |
| flat-500 | `populateNodeChildren` · `core/blueprint/utils/analyze/populateNodeChildren.ts:22` | 3.45 / 38.48 | child-own-replay, child-input-literal, build-own-replay |
| flat-500 | `loadStaticFirstTree` · `core/settle/utils/load/loadStaticFirstTree.ts:42` | 2.51 / 28.79 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| flat-500 | `loadSchemaNodeAtMount` · `core/settle/utils/load/loadSchemaNodeAtMount.ts:15` | 0.59 / 29.40 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| flat-500 | `assembleStaticFirstNode` · `core/settle/utils/load/assembleStaticFirstNode.ts:11` | 0.34 / 10.73 | assembly-replay, choices-replay |
| flat-500 | `buildSchemaNodeTree` · `core/SchemaNode/utils/binding/buildSchemaNodeTree.ts:37` | 0.09 / 41.39 | blueprint-replay |
| flat-500 | `dispatchMount` · `core/dispatch/utils/entry/dispatchMount.ts:21` | 0.05 / 30.77 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| flat-500 | `mountSchemaNode` · `core/SchemaNode/utils/binding/mountSchemaNode.ts:14` | 0.05 / 30.81 | assembly-replay, delivery-replay, entries-replay, choices-replay |
| flat-500 | `measured` · `(round-99 canonical adapter):326` | 0.13 / 72.45 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| flat-500 | `cpu` · `(round-99 canonical adapter):474` | 0.07 / 72.29 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| flat-500 | `blueprint` · `core/blueprint/blueprint.ts:19` | 0.11 / 41.11 | blueprint-replay |
| flat-500 | `nodeFromJSONSchema` · `core/nodeFromJSONSchema.ts:17` | 0.00 / 72.20 | blueprint-replay, build-own-replay, assembly-replay, delivery-replay |
| flat-500 | `create` · `(round-99 canonical adapter):157` | 0.00 / 72.20 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| flat-500 | `(anonymous)` · `(round-99 canonical adapter):484` | 0.00 / 72.20 | 측정 driver 누적 범위이며 제품 수정 대상이 아닙니다. |
| flat-500 | `(root)` · `(V8):0` | 0.00 / 100.00 | VM 분모입니다. 강제 GC가 clock 밖인 판정 열에서 독립 GC 절약으로 바꾸지 않습니다. |

## 세 회차 ablation 판정 열

모든 변형은 esbuild onLoad 메모리에서만 적용했습니다. CPU/count 번들은 timing에 사용하지 않았습니다. 첫 variant warmup의 결과를 tape로 재사용하는 replay에는 lookup/복사 overhead가 있으며 필수 생산·참조 소유권·진단을 우회할 수 있어 수학적 상한이 아닙니다. 관측한 동일 fixture 값 hash는 모두 같지만 일반 오류·reference·callback 계약의 구현 검증은 아닙니다. 실제 좁은 변경도 mount hash만 확인했습니다.

각 fresh worker는 warmup 20·101 H/W 쌍을 매 표본 교대하며 세 회차 실행했습니다. 명시적 GC와 clone/check anchor는 clock 밖, 종단은 같은 95C-01 열이며 빈 종단 C는 두 판에 공통입니다. 9 byte-identical control의 최대 |median 차이|/|paired median|와 빈 잔차 p95+두 median bootstrap 99% 오차, 1µs 중 최대를 잡음으로 정했습니다. 각 회차가 자기 잡음을 초과하고 paired bootstrap 95% 하한>0일 때만 세 회차 ↑입니다.

| fixture | 동일 코드 잡음 floor ms |
| --- | --- |
| nested-d5-f4 | 0.4542 |
| flat-500 | 0.0352 |

### nested-d5-f4

| 변형 | H / W median ms | 제거 median [최소, 최대] ms | 최대 잡음 ms | verdict |
| --- | --- | --- | --- | --- |
| blueprint-replay | 6.8345 / 1.2127 | 5.6267 [5.5984, 6.1296] | 0.4542 | ↑ 잡음 밖 |
| build-own-replay | 6.3558 / 3.3506 | 3.0662 [2.8984, 3.1850] | 0.4542 | ↑ 잡음 밖 |
| membership-once | 6.9545 / 6.5712 | 0.3944 [-0.1605, 0.4566] | 0.4542 | ≈ 미입증 |
| declarations-replay | 7.0457 / 6.5342 | 0.5391 [0.4598, 0.6186] | 0.4542 | ↑ 잡음 밖 |
| template-replay | 6.4425 / 5.1051 | 1.3883 [1.2361, 1.4050] | 0.4542 | ↑ 잡음 밖 |
| encode-native | 6.9965 / 6.8456 | 0.2355 [-0.2810, 0.3463] | 0.4542 | ≈ 미입증 |
| key-single-json | 6.9625 / 7.0047 | 0.2928 [-0.4037, 0.3249] | 0.4542 | ≈ 미입증 |
| path-strings-replay | 6.4895 / 5.1513 | 1.3799 [1.1926, 1.3905] | 0.4542 | ↑ 잡음 밖 |
| child-own-replay | 5.7834 / 6.1755 | -0.3557 [-0.5349, -0.3534] | 0.4542 | ≈ 미입증 |
| child-input-literal | 6.8393 / 6.2986 | 0.7756 [0.4628, 0.8973] | 0.4542 | ↑ 잡음 밖 |
| assembly-replay | 6.9879 / 6.6873 | 0.2450 [-0.1229, 0.5982] | 0.4542 | ≈ 미입증 |
| assembly-first-empty-hints | 6.8980 / 6.4827 | 0.4514 [-0.2035, 0.5005] | 0.4542 | ≈ 미입증 |
| choices-replay | 6.9242 / 6.6803 | 0.2709 [0.0432, 0.3980] | 0.4542 | ≈ 미입증 |
| choices-default | 7.1585 / 6.6897 | 0.2772 [-0.0530, 0.4688] | 0.4542 | ≈ 미입증 |
| entries-replay | 6.9219 / 6.6308 | 0.5094 [-0.0471, 0.7454] | 0.4542 | ≈ 미입증 |
| delivery-replay | 6.7592 / 6.3105 | 0.4530 [0.4315, 0.4598] | 0.4542 | ≈ 미입증 |
| revision-dense-first | 6.8190 / 6.6597 | 0.2033 [-0.3682, 0.2087] | 0.4542 | ≈ 미입증 |
| flush-reads-zero | 6.9950 / 6.7285 | 0.2665 [-0.1913, 0.3332] | 0.4542 | 미입증·해당 작업 0회 |
| recalculation-replay | 6.7798 / 6.7553 | 0.0888 [-0.2810, 0.2645] | 0.4542 | 미입증·해당 작업 0회 |
| dependency-replay | 6.9293 / 7.0881 | 0.2038 [-0.3702, 0.2760] | 0.4542 | 미입증·해당 작업 0회 |
| dependency-paths-once | 6.8865 / 6.6316 | 0.2550 [-0.1842, 0.4085] | 0.4542 | 미입증·해당 작업 0회 |
| watched-tokens | 6.9748 / 6.6700 | 0.3047 [-0.2290, 0.3881] | 0.4542 | 미입증·해당 작업 0회 |

### flat-500

| 변형 | H / W median ms | 제거 median [최소, 최대] ms | 최대 잡음 ms | verdict |
| --- | --- | --- | --- | --- |
| blueprint-replay | 2.3561 / 0.5308 | 1.8257 [1.8007, 1.8266] | 0.0579 | ↑ 잡음 밖 |
| build-own-replay | 2.3063 / 1.1782 | 1.1425 [1.0935, 1.2156] | 0.0595 | ↑ 잡음 밖 |
| membership-once | 2.3364 / 2.3065 | 0.0145 [0.0060, 0.0310] | 0.0906 | ≈ 미입증 |
| declarations-replay | 2.3424 / 2.2372 | 0.1075 [0.0996, 0.1237] | 0.0755 | ↑ 잡음 밖 |
| template-replay | 2.2714 / 1.9414 | 0.3273 [0.3213, 0.3455] | 0.0645 | ↑ 잡음 밖 |
| encode-native | 2.3269 / 2.3452 | 0.0022 [-0.0303, 0.0049] | 0.0782 | ≈ 미입증 |
| key-single-json | 2.3366 / 2.3970 | -0.0772 [-0.0795, -0.0506] | 0.0915 | ≈ 미입증 |
| path-strings-replay | 2.2701 / 1.9297 | 0.3487 [0.3173, 0.3536] | 0.0617 | ↑ 잡음 밖 |
| child-own-replay | 2.2270 / 2.3333 | -0.1082 [-0.1385, -0.0854] | 0.1256 | ≈ 미입증 |
| child-input-literal | 2.3488 / 2.2165 | 0.1235 [0.1088, 0.1716] | 0.0954 | ↑ 잡음 밖 |
| assembly-replay | 2.3164 / 2.1956 | 0.1210 [0.1194, 0.1467] | 0.0675 | ↑ 잡음 밖 |
| assembly-first-empty-hints | 2.3630 / 2.2527 | 0.1112 [0.0573, 0.1198] | 0.0799 | ≈ 미입증 |
| choices-replay | 2.3482 / 2.2404 | 0.1055 [0.1042, 0.1133] | 0.0744 | ↑ 잡음 밖 |
| choices-default | 2.3417 / 2.3364 | 0.0053 [0.0007, 0.0383] | 0.0728 | ≈ 미입증 |
| entries-replay | 2.5804 / 2.4833 | 0.1040 [0.0650, 0.1240] | 0.0765 | ≈ 미입증 |
| delivery-replay | 2.3193 / 2.2763 | 0.0553 [0.0413, 0.0635] | 0.0870 | ≈ 미입증 |
| revision-dense-first | 2.3282 / 2.3358 | -0.0077 [-0.0121, 0.0046] | 0.0757 | ≈ 미입증 |
| flush-reads-zero | 2.3184 / 2.3352 | -0.0169 [-0.0272, 0.0021] | 0.0838 | 미입증·해당 작업 0회 |
| recalculation-replay | 2.3365 / 2.3376 | 0.0148 [-0.0288, 0.0210] | 0.0862 | 미입증·해당 작업 0회 |
| dependency-replay | 2.3451 / 2.3389 | 0.0057 [-0.0173, 0.0345] | 0.0953 | 미입증·해당 작업 0회 |
| dependency-paths-once | 2.3311 / 2.3585 | -0.0293 [-0.0713, -0.0027] | 0.0856 | 미입증·해당 작업 0회 |
| watched-tokens | 2.3348 / 2.3325 | 0.0031 [-0.0013, 0.0059] | 0.0811 | 미입증·해당 작업 0회 |

## 남은 105 명세와 작업 0회 근거

getTemplateKey/encodeLeaf는 nested 1365회, flat 501회입니다. 기존 키 개선 뒤에도 template replay·native escape·단일 JSON 경로를 이번 HEAD에서 각각 세 회차 시도했습니다. read flush·recalculation·dependency index 전체 replay와 watched-path token 재사용도 두 fixture에서 각각 세 회차 시도했습니다.

| 작업 함수 | nested 호출/mount | flat 호출/mount |
| --- | --- | --- |
| flushPendingGateReads | 0 | 0 |
| registerRecalculation | 0 | 0 |
| getDependencyIndex | 0 | 0 |
| DependencyIndex.add | 0 | 0 |

이 네 작업은 static-first mount에서 호출되지 않아 해당 fixture의 귀속 가능한 제거 bound는 0ms입니다. unused 변형의 관측 차이는 control/JIT 잡음이며 비용으로 해석하지 않습니다. 분기·expression mount나 이후 update 비용이 0이라는 주장도 하지 않습니다. 이미 채택된 children-once·선언 sink·fragment-empty·tuple key 처리를 새 후보로 반복 제안하지 않았습니다.

## 잡음 밖 코드 bound 순위와 owner 안의 한 변경 명세

잡음 밖 코드 수준의 범위가 남아 있습니다. 실제 단일 변경 중 세 회차 통과 후보: nested-d5-f4/child-input-literal, flat-500/child-input-literal. structural S01은 순위에서 제외했습니다. build-own은 collector/type/key/effective schema 생산을 포함하고 자손 construction을 제외합니다. path replay와 template replay도 겹치므로 합산하지 마십시오. 작업 제거의 넓은 예산을 아래 좁은 fix의 기대 이득으로 주장하지 않습니다.

| 순위 | fixture / 범위 | 제거 ms | 분류 | owner · 한 변경 명세 |
| --- | --- | --- | --- | --- |
| 1 | nested-d5-f4 / build-own-replay | 3.0662 | 작업 제거 | `core/blueprint` · 단일 conjunction group에서 validationOnly 복제가 없음을 확인한 경우, 두 membership 배열 생산을 동일한 새 배열 참조를 유지하는 native slice로 치환하십시오. 재귀·ID·effective schema·Map 등록 순서를 유지하십시오. |
| 2 | nested-d5-f4 / template-replay | 1.3883 | 작업 제거 | `core/blueprint` · getTemplateKey의 encodeLeaf 내부 quote/backslash scan만 native 문자열 처리로 치환하십시오. key와 boundKey의 JSON bytes 및 gate/owner 중복 순서를 보존하십시오. 결과 memo는 채택하지 않습니다. |
| 3 | nested-d5-f4 / path-strings-replay | 1.3799 | 작업 제거 | `core/blueprint` · populateNodeChildren에서 같은 name의 escapeSegment 결과를 한 번 계산해 schemaPath와 data path에 재사용하십시오. 공개 두 경로는 계속 생산하고 getTemplateKey bytes는 유지하십시오. template-replay와 겹칩니다. |
| 4 | flat-500 / build-own-replay | 1.1425 | 작업 제거 | `core/blueprint` · 단일 conjunction group에서 validationOnly 복제가 없음을 확인한 경우, 두 membership 배열 생산을 동일한 새 배열 참조를 유지하는 native slice로 치환하십시오. 재귀·ID·effective schema·Map 등록 순서를 유지하십시오. |
| 5 | nested-d5-f4 / child-input-literal | 0.7756 | 단일 변경 | `core/blueprint` · populateNodeChildren의 ungated 빠른 경로에서 base spread를 동일 필드 순서의 literal로 치환하십시오. 이 변형은 실제 자식 build와 binding 생산을 모두 실행합니다. |
| 6 | nested-d5-f4 / declarations-replay | 0.5391 | 작업 제거 | `core/blueprint` · collectDeclarations의 gates/order 복사만 packed-array slice로 치환하십시오. fragment와 declaration의 별도 배열 참조, ID·DFS·진단·capability 순서를 유지하십시오. 이미 채택된 sink를 다시 제안하지 않습니다. |
| 7 | flat-500 / path-strings-replay | 0.3487 | 작업 제거 | `core/blueprint` · populateNodeChildren에서 같은 name의 escapeSegment 결과를 한 번 계산해 schemaPath와 data path에 재사용하십시오. 공개 두 경로는 계속 생산하고 getTemplateKey bytes는 유지하십시오. template-replay와 겹칩니다. |
| 8 | flat-500 / template-replay | 0.3273 | 작업 제거 | `core/blueprint` · getTemplateKey의 encodeLeaf 내부 quote/backslash scan만 native 문자열 처리로 치환하십시오. key와 boundKey의 JSON bytes 및 gate/owner 중복 순서를 보존하십시오. 결과 memo는 채택하지 않습니다. |
| 9 | flat-500 / child-input-literal | 0.1235 | 단일 변경 | `core/blueprint` · populateNodeChildren의 ungated 빠른 경로에서 base spread를 동일 필드 순서의 literal로 치환하십시오. 이 변형은 실제 자식 build와 binding 생산을 모두 실행합니다. |
| 10 | flat-500 / assembly-replay | 0.1210 | 작업 제거 | `core/behaviors/objectBehavior` · 최초 local/extras 없음·propertyKeys 없음·entries/children 순서 동치인 경우만 Map/Set 수집을 한 classic loop로 치환하십시오. 실제 새 값 객체, stable shape 및 key count를 생산하십시오. |
| 11 | flat-500 / declarations-replay | 0.1075 | 작업 제거 | `core/blueprint` · collectDeclarations의 gates/order 복사만 packed-array slice로 치환하십시오. fragment와 declaration의 별도 배열 참조, ID·DFS·진단·capability 순서를 유지하십시오. 이미 채택된 sink를 다시 제안하지 않습니다. |
| 12 | flat-500 / choices-replay | 0.1055 | 작업 제거 | `core/behaviors` · getStaticChoices의 options 없음 분기만 동일 frozen 기본 choices에 연결하십시오. effective별 WeakMap 및 사용자 propertyKeys 처리는 유지하십시오. |

각 수정은 기존 ID/DFS/읽기/평가/정착/오류 순서, enumerable 필드, frozen 상태와 필요한 참조 소유권을 보존해야 합니다. 새 settlement 설계·계약·form 간 결과 공유를 제안하지 않습니다. JIT용 고정 layout literal과 native loop/string 경로는 같은 owner의 내부 생산만 바꾸는 후보이며, 구조적 분석 생략은 후보가 아닙니다.

## 전체 cold blueprint 분석: 구조 S01 비교

| fixture | H / S01 W ms | 제거 ms [회차 최소, 최대] | 최대 잡음 ms | verdict |
| --- | --- | --- | --- | --- |
| nested-d5-f4 | 6.8345 / 1.2127 | 5.6267 [5.5984, 6.1296] | 0.4542 | ↑ 잡음 밖 |
| flat-500 | 2.3561 / 0.5308 | 1.8257 [1.8007, 1.8266] | 0.0579 | ↑ 잡음 밖 |

S01은 전체 blueprint 결과를 첫 warmup에서 재사용하여 cold analysis를 우회한 구조적 비교입니다. 코드 미세 개선이 아니며 여러 form 사이에 캐시를 도입하거나 분석을 지연하는 설계의 승인/성능 증명이 아닙니다.

## 실행 감사와 재현

Node v26.10.0, V8 14.6.202.34-node.35, Apple M1 Max. 공식 worker 84개, ablation/control worker 150개, CPU 6개, count 2개를 순차 수행했습니다. 성공 기록의 signal은 모두 null이며 esbuild는 stdin EOF로 종료했습니다. 기록된 최대 worker 8291ms, 최대 command 47396ms입니다. 공식 batch 최대 worker 합 51297ms이며 모든 실제 실행 명령은 60초 도구 예산 내에서 자연 종료했습니다. build adapter의 anchor/중괄호 오류 두 시도는 exit 1로 자체 종료했고 수정 뒤 측정을 시작했으며 성능 표본에 포함하지 않았습니다.

제품 src diff 없음, git 쓰기 없음, 설치 없음, 제품 test/build 실행 없음입니다. 새 저장소 산출물은 이 보고서·summary·profile-107-remaining 근거뿐입니다. 각 raw 파일 최대 517981bytes로 5MB 이하입니다. bundle/map은 지정된 저장소 밖 `/private/tmp/claude-501/-Users-Vincent-Workspace-albatrion/c8aaf054-1ea7-43d3-b3c1-a4196f8407e1/scratchpad/bundles`에만 있습니다. 캐시를 생성하는 명령은 실행하지 않았습니다.

재현 CLI: `yarn node packages/canard/schema-form/architecture/verification/07-switch/profile-107-remaining/measure.mjs --official <fixture>`; `--build-worker <variant>`, `--cpu-worker head <fixture> <run>`, `--count-worker head <fixture>`, `--batch <run> <fixture> <variants...>`. 모든 batch를 순차 실행하십시오. `summarize.mjs`는 보고서/JSON bytes를 stdout으로 내고 native 파일 도구로 저장하도록 설계했습니다. 공식 source/tag·번들·도구 해시, 101쌍·시계 window·회차별 CI 및 자연 종료 근거는 sibling raw JSON에 있습니다.
