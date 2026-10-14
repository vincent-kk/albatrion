# 100C-01 — 콜드 청사진 분석의 함수 귀속과 제거 상한

청사진 분석 안에서 nested의 자기 시간은 buildNodes 직접 구축 31.09%, 정적 스키마 병합 23.68%, 자식 바인딩 15.77%였습니다. 코드 수준 최대 상한은 자식 바인딩 1.708 ms(1.680–1.878 ms)였으며 그 한 가지의 구현은 종단 이득이 잡음을 넘지 못하여 복구했습니다. 전체 청사진 공유의 8.261 ms와 완성 그래프 공유의 7.720 ms는 계약에 닿는 겹친 천장입니다.

## 기준과 재현 방법

- 작업 트리: stage-07; HEAD `0fdb6660ba07b94bafe3ff20e95b0025154ca490`; 100C-01은 `git show origin/1.0.0-beta:packages/canard/schema-form/architecture/reviews/round-100-closing.md`로 읽었습니다(결정 commit 3d7e28520). 89C-03 commit은 af1904cf9입니다.
- A는 기존 profile-99c01.mjs의 소스 전용 EOF 종료 빌드·source-map·표본 가중 집계를 재사용했습니다. B·C는 measure-schema-merge-100.mjs가 사용한 같은 99C-01 sentinel timer와 교대 조건을 사용하며, 중앙값 구간은 summarize-99c01.mjs의 함수를 그대로 실행합니다.
- 환경: Apple M1 Max, darwin/arm64, Node v24.20.0, V8 13.6.233.17-node.53, esbuild 0.25.9; production, validation off, 외부 구독자 0입니다.
- A는 매회 새 schema를 structuredClone으로 만들고 cache 옵션 없이 blueprint만 호출합니다. 내부 계측이 없습니다. warmup 20 후 3.5초 작업, 100 μs 요청 간격으로 표본을 얻고 blueprint 하위 비유휴 프레임만 선택합니다. clone·driver·스택을 잃은 GC는 분모 밖입니다. 표본 CPU 시간은 B·C의 cold mount 벽시계 시간으로 대체하지 않습니다.
- 함수 total은 재귀 프레임을 한 번만 셉니다. 단계 self는 가장 가까운 단계에 배타적으로 귀속하고, total은 그 단계가 스택에 있는 표본의 합집합입니다. 누적 단계·함수는 서로 겹칩니다. buildNodes/자식 바인딩의 total은 재귀 자식 구축까지 포함합니다.
- V8가 Object.freeze의 native/inlined 호출을 별도 함수로 내보내지 않아 동결 몫만의 표본 비율은 분리할 수 없습니다. 해당 비용은 각 호출자 self에 포함됩니다. 아래의 동결 제거 대조로만 그 천장을 확인합니다. 0%로 해석하지 않습니다.
- B·C는 새 process마다 H와 A/W를 번갈아 실행합니다. warmup 20, 101쌍 × 3회입니다. schema 준비·강제 GC는 시계 밖이며 끝점은 64 Promise turn 및 같은 check queue의 setImmediate sentinel입니다. 앞뒤 empty sentinel 101개의 중앙값 평균을 양쪽 시간에서 뺍니다. 음수 차이는 보존합니다.
- N은 동일 HEAD control 세 run의 H−control 중앙값 차이 및 paired 중앙값 절댓값의 최댓값입니다. 세 run의 bound가 모두 N보다 크고 paired 중앙값 95% 구간 하한이 모두 0보다 클 때만 **잡음 초과**입니다. 101개 표본에서는 정렬한 41번째/61번째가 구간입니다. 연속 표본의 독립성은 보장되지 않아 구간보다 세 run 재현과 control을 우선합니다.
- 제거는 측정 전용 in-memory build plugin에서 함수 body를 상수/무동작/상수 자료 재생으로 교체합니다. 조회·guard·유효한 그래프를 위한 재생 scaffold 비용은 남습니다. cold 분석에 한정한 병합·동결/형 판정 guard를 사용합니다. 결과가 바뀐 제거는 후속 마운트 작업도 달라질 수 있어 순수 함수 비용으로 해석하지 않습니다.
- 사용자 지정 작업 트리 외 제품·git 쓰기·설치·다른 에이전트는 사용하지 않았습니다. worker는 순차 실행하고 signal 없는 정상/예상 exit를 확인했습니다. esbuild는 stdin EOF를 받아 exit 0으로 끝났습니다. 원시 .cpuprofile만 지정 /private/tmp 위치에 보관하고 per-run 자료는 profile-100c01/ 아래에 둡니다.

## A — 분석만의 표본 귀속

### nested-d5-f4

새 분석 521회; blueprint 하위 표본 16,069개, 2446.139 ms; 분모 밖 1057.070 ms입니다. 노드 1365개·조각 1365개입니다. [전체 함수 JSON](profile-100c01/analysis-nested-d5-f4.summary.json).

| 단계 | self ms | self % | total ms | total % |
|---|---:|---:|---:|---:|
| buildNodes 직접 구축 | 760.549 | 31.09 | 2184.820 | 89.32 |
| 정적 스키마 병합 | 579.155 | 23.68 | 602.454 | 24.63 |
| 자식 바인딩 | 385.790 | 15.77 | 2180.738 | 89.15 |
| 선언 수집 | 221.710 | 9.06 | 239.124 | 9.78 |
| 청사진 마무리·인라인 동결 | 141.696 | 5.79 | 2446.139 | 100.00 |
| 템플릿 키·색인 | 135.496 | 5.54 | 135.496 | 5.54 |
| 형상·자식 대상 검증 | 119.623 | 4.89 | 119.623 | 4.89 |
| 형·전략 판정 | 102.120 | 4.17 | 102.120 | 4.17 |
| 동결 단독 | 분리 불가 | 분리 불가 | 분리 불가 | 분리 불가 |

자기 시간 상위 25개와 self 또는 total이 2% 이상인 **모든 함수**를 아래에 단계별로 모았습니다. 함수 위치는 HEAD source map 기준입니다.

#### buildNodes 직접 구축

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `buildNodes` — `src/core/blueprint/utils/analyze/buildNodes.ts:25` | 760.549 | 2184.820 | 31.09 | 89.32 |

#### 자식 바인딩

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `populateNodeChildren` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 224.354 | 2180.738 | 9.17 | 89.15 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:163` | 69.547 | 69.547 | 2.84 | 2.84 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:73` | 66.967 | 75.430 | 2.74 | 3.08 |
| `populateVirtualNodes` — `src/core/blueprint/utils/analyze/populateVirtualNodes.ts:18` | 6.667 | 6.667 | 0.27 | 0.27 |

#### 정적 스키마 병합

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `applySchemaContribution` — `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36` | 218.931 | 327.083 | 8.95 | 13.37 |
| `ensureEffectiveSchemaCache` — `src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15` | 132.301 | 132.301 | 5.41 | 5.41 |
| `applyConstraintKeywords` — `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:36` | 69.613 | 69.613 | 2.85 | 2.85 |
| `finalizeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:13` | 49.087 | 49.087 | 2.01 | 2.01 |
| `mergeSchemaContributions` — `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27` | 46.804 | 423.684 | 1.91 | 17.32 |
| `mergeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` | 43.177 | 602.121 | 1.77 | 24.62 |
| `applyTypeContribution` — `src/core/blueprint/utils/effectiveSchema/utils/applyTypeContribution.ts:16` | 16.449 | 39.205 | 0.67 | 1.60 |
| `selectEffectiveDeclarations` — `src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9` | 2.793 | 2.793 | 0.11 | 0.11 |

#### 선언 수집

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `collectDeclarations` — `src/core/blueprint/utils/analyze/collectDeclarations.ts:27` | 209.082 | 239.124 | 8.55 | 9.78 |
| `collectSchemaCapabilities` — `src/core/blueprint/utils/analyze/collectSchemaCapabilities.ts:19` | 7.169 | 7.169 | 0.29 | 0.29 |
| `validateControlGroups` — `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:17` | 5.459 | 5.459 | 0.22 | 0.22 |

#### 청사진 마무리·인라인 동결

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `blueprint` — `src/core/blueprint/blueprint.ts:21` | 140.947 | 2445.972 | 5.76 | 99.99 |
| `escapeSegment` — `packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6` | 16.420 | 16.420 | 0.67 | 0.67 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:37` | 3.041 | 3.041 | 0.12 | 0.12 |

#### 템플릿 키·색인

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `getTemplateKey` — `src/core/blueprint/utils/analyze/getTemplateKey.ts:11` | 135.496 | 135.496 | 5.54 | 5.54 |

#### 형상·자식 대상 검증

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `visitShape` — `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:14` | 87.334 | 90.375 | 3.57 | 3.69 |
| `validateChildTargets` — `src/core/blueprint/utils/diagnostics/validateChildTargets.ts:11` | 28.580 | 28.580 | 1.17 | 1.17 |
| `validateShape` — `src/core/blueprint/utils/analyze/validateShape.ts:10` | 0.668 | 91.043 | 0.03 | 3.72 |

#### 형·전략 판정

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `readAllowedTypes` — `src/core/blueprint/utils/types/readAllowedTypes.ts:19` | 57.917 | 58.251 | 2.37 | 2.38 |
| `resolveNodeTypes` — `src/core/blueprint/utils/types/resolveNodeTypes.ts:17` | 25.249 | 42.538 | 1.03 | 1.74 |
| `resolveNodeStrategy` — `src/core/blueprint/utils/types/resolveNodeStrategy.ts:14` | 17.413 | 18.453 | 0.71 | 0.75 |

### flat-500

새 분석 1,886회; blueprint 하위 표본 17,918개, 2734.647 ms; 분모 밖 767.562 ms입니다. 노드 501개·조각 501개입니다. [전체 함수 JSON](profile-100c01/analysis-flat-500.summary.json).

| 단계 | self ms | self % | total ms | total % |
|---|---:|---:|---:|---:|
| buildNodes 직접 구축 | 796.537 | 29.13 | 2466.663 | 90.20 |
| 정적 스키마 병합 | 705.890 | 25.81 | 738.019 | 26.99 |
| 자식 바인딩 | 424.900 | 15.54 | 2440.706 | 89.25 |
| 선언 수집 | 240.705 | 8.80 | 267.374 | 9.78 |
| 청사진 마무리·인라인 동결 | 198.506 | 7.26 | 2734.647 | 100.00 |
| 형·전략 판정 | 149.463 | 5.47 | 149.463 | 5.47 |
| 템플릿 키·색인 | 149.335 | 5.46 | 149.335 | 5.46 |
| 형상·자식 대상 검증 | 69.311 | 2.53 | 69.311 | 2.53 |
| 동결 단독 | 분리 불가 | 분리 불가 | 분리 불가 | 분리 불가 |

자기 시간 상위 25개와 self 또는 total이 2% 이상인 **모든 함수**를 아래에 단계별로 모았습니다. 함수 위치는 HEAD source map 기준입니다.

#### buildNodes 직접 구축

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `buildNodes` — `src/core/blueprint/utils/analyze/buildNodes.ts:25` | 796.537 | 2466.663 | 29.13 | 90.20 |

#### 정적 스키마 병합

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `applySchemaContribution` — `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36` | 246.259 | 391.552 | 9.01 | 14.32 |
| `ensureEffectiveSchemaCache` — `src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15` | 172.539 | 172.539 | 6.31 | 6.31 |
| `applyConstraintKeywords` — `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:36` | 95.253 | 95.253 | 3.48 | 3.48 |
| `finalizeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:13` | 65.098 | 65.098 | 2.38 | 2.38 |
| `mergeSchemaContributions` — `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27` | 61.915 | 518.191 | 2.26 | 18.95 |
| `mergeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` | 40.789 | 737.020 | 1.49 | 26.95 |
| `applyTypeContribution` — `src/core/blueprint/utils/effectiveSchema/utils/applyTypeContribution.ts:16` | 18.494 | 50.331 | 0.68 | 1.84 |
| `selectEffectiveDeclarations` — `src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9` | 5.376 | 5.543 | 0.20 | 0.20 |

#### 선언 수집

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `collectDeclarations` — `src/core/blueprint/utils/analyze/collectDeclarations.ts:27` | 214.961 | 266.916 | 7.86 | 9.76 |
| `collectSchemaCapabilities` — `src/core/blueprint/utils/analyze/collectSchemaCapabilities.ts:19` | 16.162 | 16.162 | 0.59 | 0.59 |
| `validateControlGroups` — `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:17` | 9.582 | 9.582 | 0.35 | 0.35 |

#### 자식 바인딩

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `populateNodeChildren` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 210.945 | 2439.706 | 7.71 | 89.21 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:163` | 101.746 | 101.746 | 3.72 | 3.72 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:73` | 85.205 | 93.915 | 3.12 | 3.43 |

#### 청사진 마무리·인라인 동결

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `blueprint` — `src/core/blueprint/blueprint.ts:21` | 198.047 | 2734.647 | 7.24 | 100.00 |
| `escapeSegment` — `packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6` | 26.670 | 26.670 | 0.98 | 0.98 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:37` | 3.167 | 3.167 | 0.12 | 0.12 |
| `set` — `src/core/blueprint/utils/features/StaticFirstLoadCapability.ts:8` | 0.459 | 0.459 | 0.02 | 0.02 |

#### 템플릿 키·색인

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `getTemplateKey` — `src/core/blueprint/utils/analyze/getTemplateKey.ts:11` | 149.210 | 149.335 | 5.46 | 5.46 |

#### 형·전략 판정

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `readAllowedTypes` — `src/core/blueprint/utils/types/readAllowedTypes.ts:19` | 87.182 | 87.182 | 3.19 | 3.19 |
| `resolveNodeTypes` — `src/core/blueprint/utils/types/resolveNodeTypes.ts:17` | 38.328 | 66.255 | 1.40 | 2.42 |
| `resolveNodeStrategy` — `src/core/blueprint/utils/types/resolveNodeStrategy.ts:14` | 23.661 | 23.786 | 0.87 | 0.87 |

#### 형상·자식 대상 검증

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `visitShape` — `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:14` | 39.676 | 42.843 | 1.45 | 1.57 |
| `validateChildTargets` — `src/core/blueprint/utils/diagnostics/validateChildTargets.ts:11` | 26.052 | 26.052 | 0.95 | 0.95 |

### oneOf-20

새 분석 10,661회; blueprint 하위 표본 17,997개, 2748.919 ms; 분모 밖 751.372 ms입니다. 노드 63개·조각 83개입니다. [전체 함수 JSON](profile-100c01/analysis-oneOf-20.summary.json).

| 단계 | self ms | self % | total ms | total % |
|---|---:|---:|---:|---:|
| buildNodes 직접 구축 | 661.775 | 24.07 | 2259.933 | 82.21 |
| 자식 바인딩 | 330.892 | 12.04 | 1802.622 | 65.58 |
| 선언 수집 | 327.028 | 11.90 | 564.729 | 20.54 |
| 형·전략 판정 | 301.374 | 10.96 | 301.374 | 10.96 |
| 정적 스키마 병합 | 255.118 | 9.28 | 257.662 | 9.37 |
| 식 컴파일 | 231.526 | 8.42 | 231.526 | 8.42 |
| 게이트 읽기 추출 | 219.701 | 7.99 | 219.701 | 7.99 |
| 청사진 마무리·인라인 동결 | 209.164 | 7.61 | 2748.919 | 100.00 |
| 템플릿 키·색인 | 164.129 | 5.97 | 164.129 | 5.97 |
| 형상·자식 대상 검증 | 47.713 | 1.74 | 47.713 | 1.74 |
| 경고 수집 | 0.499 | 0.02 | 0.499 | 0.02 |
| 동결 단독 | 분리 불가 | 분리 불가 | 분리 불가 | 분리 불가 |

자기 시간 상위 25개와 self 또는 total이 2% 이상인 **모든 함수**를 아래에 단계별로 모았습니다. 함수 위치는 HEAD source map 기준입니다.

#### buildNodes 직접 구축

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `buildNodes` — `src/core/blueprint/utils/analyze/buildNodes.ts:25` | 661.483 | 2259.933 | 24.06 | 82.21 |

#### 선언 수집

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `collectDeclarations` — `src/core/blueprint/utils/analyze/collectDeclarations.ts:27` | 290.411 | 564.271 | 10.56 | 20.53 |
| `validateControlGroups` — `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:17` | 13.247 | 13.247 | 0.48 | 0.48 |
| `createBlueprintGate` — `src/core/blueprint/utils/analyze/createBlueprintGate.ts:9` | 9.205 | 228.739 | 0.33 | 8.32 |

#### 게이트 읽기 추출

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `collectGateEvaluationReads` — `src/core/blueprint/utils/analyze/collectGateEvaluationReads.ts:8` | 213.411 | 219.701 | 7.76 | 7.99 |

#### 청사진 마무리·인라인 동결

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `blueprint` — `src/core/blueprint/blueprint.ts:21` | 206.124 | 2748.919 | 7.50 | 100.00 |
| `escapeSegment` — `packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6` | 22.412 | 22.412 | 0.82 | 0.82 |
| `RegExp: (?<![a-zA-Z0-9_#./@"'`\\])(?:(?:\#|\.)\/(?:(?:[^\s\(\)\[\]\{\}\/~]|~[01]|\[[^\s\(\)\[\]\{\}]*\]|\{[^\s\(\)\[\]\{\}]*\}|[\[\]\{\}](?=[^\s\(\)\[\]\{\}\/~]))+(?:\/(?:[^\s\(\)\[\]\{\}\/~]|~[01]|\[[^\s\(\)\[\]\{\}]*\]|\{[^\s\(\)\[\]\{\}]*\}|[\[\]\{\}](?=[^\s\(\)\[\]\{\}\/~]))+)*)?(?!\/)|(?:\..\/)+(?:(?:[^\s\(\)\[\]\{\}\/~]|~[01]|\[[^\s\(\)\[\]\{\}]*\]|\{[^\s\(\)\[\]\{\}]*\}|[\[\]\{\}](?=[^\s\(\)\[\]\{\}\/~]))+(?:\/(?:[^\s\(\)\[\]\{\}\/~]|~[01]|\[[^\s\(\)\[\]\{\}]*\]|\{[^\s\(\)\[\]\{\}]*\}|[\[\]\{\}](?=[^\s\(\)\[\]\{\}\/~]))+)*)?(?!\/)|\/(?:[^\s\(\)\[\]\{\}\/~]|~[01]|\[[^\s\(\)\[\]\{\}]*\]|\{[^\s\(\)\[\]\{\}]*\}|[\[\]\{\}](?=[^\s\(\)\[\]\{\}\/~]))+(?:\/(?:[^\s\(\)\[\]\{\}\/~]|~[01]|\[[^\s\(\)\[\]\{\}]*\]|\{[^\s\(\)\[\]\{\}]*\}|[\[\]\{\}](?=[^\s\(\)\[\]\{\}\/~]))+)*|(?:(?<![a-zA-Z0-9_#./@"'`\\])\@|^\@)(?=\.(?![\/\.])|[\[\]\)\}\s,;:?=!<>&|+\-*%~^]|$)|(?<=\()\/(?=\))|(?:(?<![a-zA-Z0-9_#./@"'`\\])\#|^\#)(?=\.(?![\/\.])|[\[\]\)\}\s,;:?=!<>&|+\-*%~^]|$))` — `(V8):0` | 11.581 | 11.581 | 0.42 | 0.42 |

#### 자식 바인딩

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `populateNodeChildren` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 174.548 | 1802.456 | 6.35 | 65.57 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:73` | 65.922 | 74.377 | 2.40 | 2.71 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:163` | 62.259 | 64.676 | 2.26 | 2.35 |

#### 템플릿 키·색인

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `getTemplateKey` — `src/core/blueprint/utils/analyze/getTemplateKey.ts:11` | 160.672 | 164.129 | 5.84 | 5.97 |

#### 식 컴파일

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `createDynamicFunction` — `src/core/blueprint/utils/expressions/createDynamicFunction/createDynamicFunction.ts:18` | 123.038 | 142.910 | 4.48 | 5.20 |
| `compileBlueprintExpressions` — `src/core/blueprint/utils/analyze/compileBlueprintExpressions.ts:23` | 58.613 | 231.526 | 2.13 | 8.42 |
| `registerBlueprintDependency` — `src/core/blueprint/utils/analyze/compileBlueprintExpressions/utils/registerBlueprintDependency.ts:14` | 30.003 | 30.003 | 1.09 | 1.09 |

#### 정적 스키마 병합

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `ensureEffectiveSchemaCache` — `src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15` | 112.740 | 112.740 | 4.10 | 4.10 |
| `mergeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` | 67.594 | 257.328 | 2.46 | 9.36 |
| `finalizeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:13` | 52.081 | 52.248 | 1.89 | 1.90 |
| `mergeSchemaContributions` — `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27` | 6.207 | 73.581 | 0.23 | 2.68 |

#### 형·전략 판정

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `resolveNodeTypes` — `src/core/blueprint/utils/types/resolveNodeTypes.ts:17` | 70.921 | 187.551 | 2.58 | 6.82 |
| `(anonymous)` — `src/core/blueprint/utils/types/resolveNodeStrategy.ts:43` | 65.817 | 65.984 | 2.39 | 2.40 |
| `inferAllowedTypes` — `src/core/blueprint/utils/types/inferAllowedTypes.ts:27` | 62.242 | 86.498 | 2.26 | 3.15 |
| `readAllowedTypes` — `src/core/blueprint/utils/types/readAllowedTypes.ts:19` | 36.045 | 43.882 | 1.31 | 1.60 |
| `resolveNodeStrategy` — `src/core/blueprint/utils/types/resolveNodeStrategy.ts:14` | 26.170 | 92.279 | 0.95 | 3.36 |
| `foldAllowedTypes` — `src/core/blueprint/utils/types/foldAllowedTypes.ts:8` | 24.337 | 24.337 | 0.89 | 0.89 |

#### 형상·자식 대상 검증

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `visitShape` — `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:14` | 25.003 | 27.128 | 0.91 | 0.99 |
| `validateChildTargets` — `src/core/blueprint/utils/diagnostics/validateChildTargets.ts:11` | 19.377 | 19.377 | 0.70 | 0.70 |

### sample-0

새 분석 255,250회; blueprint 하위 표본 15,946개, 2432.412 ms; 분모 밖 1067.630 ms입니다. 노드 3개·조각 3개입니다. [전체 함수 JSON](profile-100c01/analysis-sample-0.summary.json).

| 단계 | self ms | self % | total ms | total % |
|---|---:|---:|---:|---:|
| 정적 스키마 병합 | 645.762 | 26.55 | 672.128 | 27.63 |
| buildNodes 직접 구축 | 581.382 | 23.90 | 2092.155 | 86.01 |
| 자식 바인딩 | 331.671 | 13.64 | 1466.384 | 60.29 |
| 청사진 마무리·인라인 동결 | 271.762 | 11.17 | 2432.412 | 100.00 |
| 선언 수집 | 257.157 | 10.57 | 262.405 | 10.79 |
| 형·전략 판정 | 143.982 | 5.92 | 143.982 | 5.92 |
| 템플릿 키·색인 | 132.659 | 5.45 | 132.659 | 5.45 |
| 형상·자식 대상 검증 | 66.828 | 2.75 | 66.828 | 2.75 |
| 경고 수집 | 1.209 | 0.05 | 1.209 | 0.05 |
| 동결 단독 | 분리 불가 | 분리 불가 | 분리 불가 | 분리 불가 |

자기 시간 상위 25개와 self 또는 total이 2% 이상인 **모든 함수**를 아래에 단계별로 모았습니다. 함수 위치는 HEAD source map 기준입니다.

#### buildNodes 직접 구축

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `buildNodes` — `src/core/blueprint/utils/analyze/buildNodes.ts:25` | 581.382 | 2092.155 | 23.90 | 86.01 |

#### 정적 스키마 병합

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `applySchemaContribution` — `src/core/blueprint/utils/effectiveSchema/utils/applySchemaContribution.ts:36` | 228.072 | 356.949 | 9.38 | 14.67 |
| `ensureEffectiveSchemaCache` — `src/core/blueprint/utils/effectiveSchema/utils/ensureEffectiveSchemaCache.ts:15` | 140.715 | 140.715 | 5.78 | 5.78 |
| `applyConstraintKeywords` — `src/core/blueprint/utils/effectiveSchema/utils/applyConstraintKeywords.ts:36` | 82.219 | 82.219 | 3.38 | 3.38 |
| `mergeSchemaContributions` — `src/core/blueprint/utils/effectiveSchema/utils/mergeSchemaContributions.ts:27` | 63.332 | 483.243 | 2.60 | 19.87 |
| `finalizeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/utils/finalizeEffectiveSchema.ts:13` | 63.254 | 63.421 | 2.60 | 2.61 |
| `mergeEffectiveSchema` — `src/core/blueprint/utils/effectiveSchema/mergeEffectiveSchema.ts:25` | 39.212 | 672.128 | 1.61 | 27.63 |
| `applyTypeContribution` — `src/core/blueprint/utils/effectiveSchema/utils/applyTypeContribution.ts:16` | 20.666 | 46.741 | 0.85 | 1.92 |
| `selectEffectiveDeclarations` — `src/core/blueprint/utils/effectiveSchema/utils/selectEffectiveDeclarations.ts:9` | 8.125 | 8.125 | 0.33 | 0.33 |

#### 청사진 마무리·인라인 동결

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `blueprint` — `src/core/blueprint/blueprint.ts:21` | 226.480 | 2432.412 | 9.31 | 100.00 |
| `set` — `src/core/blueprint/utils/features/StaticFirstLoadCapability.ts:8` | 45.282 | 45.282 | 1.86 | 1.86 |
| `escapeSegment` — `packages/winglet/json/dist/JSONPointer/utils/escape/escapeSegment.cjs:6` | 17.669 | 17.669 | 0.73 | 0.73 |

#### 선언 수집

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `collectDeclarations` — `src/core/blueprint/utils/analyze/collectDeclarations.ts:27` | 224.787 | 260.489 | 9.24 | 10.71 |
| `collectSchemaCapabilities` — `src/core/blueprint/utils/analyze/collectSchemaCapabilities.ts:19` | 20.577 | 20.577 | 0.85 | 0.85 |
| `validateControlGroups` — `src/core/blueprint/utils/diagnostics/validateControlGroups.ts:17` | 11.793 | 11.793 | 0.48 | 0.48 |

#### 자식 바인딩

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `populateNodeChildren` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:19` | 195.968 | 1464.800 | 8.06 | 60.22 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:163` | 67.362 | 67.362 | 2.77 | 2.77 |
| `(anonymous)` — `src/core/blueprint/utils/analyze/populateNodeChildren.ts:73` | 41.677 | 49.926 | 1.71 | 2.05 |

#### 템플릿 키·색인

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `getTemplateKey` — `src/core/blueprint/utils/analyze/getTemplateKey.ts:11` | 132.367 | 132.659 | 5.44 | 5.45 |

#### 형·전략 판정

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `readAllowedTypes` — `src/core/blueprint/utils/types/readAllowedTypes.ts:19` | 58.395 | 59.353 | 2.40 | 2.44 |
| `resolveNodeStrategy` — `src/core/blueprint/utils/types/resolveNodeStrategy.ts:14` | 42.455 | 44.789 | 1.75 | 1.84 |
| `resolveNodeTypes` — `src/core/blueprint/utils/types/resolveNodeTypes.ts:17` | 39.424 | 67.246 | 1.62 | 2.76 |

#### 형상·자식 대상 검증

| 함수·작성 위치 | self ms | total ms | self % | total % |
|---|---:|---:|---:|---:|
| `visitShape` — `src/core/blueprint/utils/analyze/validateShape/utils/visitShape.ts:14` | 41.795 | 43.210 | 1.72 | 1.78 |
| `validateChildTargets` — `src/core/blueprint/utils/diagnostics/validateChildTargets.ts:11` | 14.039 | 14.039 | 0.58 | 0.58 |
| `validateShape` — `src/core/blueprint/utils/analyze/validateShape.ts:10` | 9.579 | 52.789 | 0.39 | 2.17 |

## B — 제거 상한과 잡음

bound = 각 run의 HEAD 중앙값 − ablated 중앙값입니다. 대표값은 세 bound의 중앙값이고 spread는 최솟값–최댓값입니다. 상세 paired 구간·날짜·empty 값·출력 hash는 [요약 JSON](profile-100c01-summary.json)에 모두 있습니다. 출력이 달라진 제거에 표시를 남깁니다. 그 천장을 동일 내용의 제품 수정으로 그대로 얻을 수 있다고 주장하지 않습니다.

| 대상/연산 | N ms | control bound 3회 ms |
|---|---:|---|
| nested-d5-f4/mount | 0.841083 | 0.393791, -0.542666, 0.091958 |
| flat-500/mount | 0.059458 | 0.029084, -0.020958, 0.043333 |
| oneOf-20/mount | 0.041291 | 0.041291, 0.011375, -0.006875 |
| sample-0/mount | 0.005958 | -0.005958, -0.000125, -0.001208 |
| sample-0/later | 0.002042 | 0.000250, -0.002042, 0.000084 |
| nested-d5-f4/later | 0.003417 | -0.001334, -0.001291, 0.003417 |

| 제거 대상 | fixture | 분류 | H→A 중앙값 ms | bound ms [spread] | 잡음 초과 | 결과 변화 |
|---|---|---|---:|---:|---|---|
| blueprint | nested-d5-f4 | 계약 접촉 | 10.853959→2.593416 | 8.260542 [8.141999, 8.417667] | **초과** | 같음 |
| blueprint | flat-500 | 계약 접촉 | 4.073771→1.022687 | 3.038750 [3.037459, 3.081583] | **초과** | 같음 |
| blueprint | oneOf-20 | 계약 접촉 | 2.539271→1.406645 | 1.139834 [1.080500, 1.145500] | **초과** | 같음 |
| blueprint | sample-0 | 계약 접촉 | 0.188646→0.092771 | 0.095875 [0.094833, 0.097292] | **초과** | 같음 |
| build-nodes | nested-d5-f4 | 계약 접촉 | 10.942625→3.217438 | 7.720168 [7.714709, 7.777376] | **초과** | 같음 |
| build-nodes | flat-500 | 계약 접촉 | 3.973854→1.243729 | 2.730125 [2.722874, 2.759084] | **초과** | 같음 |
| build-nodes | oneOf-20 | 계약 접촉 | 2.573499→1.671541 | 0.910166 [0.871833, 0.963000] | **초과** | 같음 |
| build-nodes | sample-0 | 계약 접촉 | 0.187626→0.105458 | 0.082168 [0.080250, 0.083333] | **초과** | 같음 |
| static-normalization | nested-d5-f4 | 코드 수준 | 11.119042→9.488167 | 1.630875 [1.523791, 1.643416] | **초과** | 같음 |
| static-normalization | flat-500 | 코드 수준 | 4.018729→3.500813 | 0.506291 [0.501125, 0.523750] | **초과** | 같음 |
| static-normalization | oneOf-20 | 코드 수준 | 2.366959→2.332667 | 0.034292 [0.006792, 0.054249] | 미확인 | 같음 |
| static-normalization | sample-0 | 코드 수준 | 0.189333→0.160062 | 0.029291 [0.026666, 0.029416] | **초과** | 같음 |
| merge-effective | nested-d5-f4 | 코드 수준 | 11.108896→9.709166 | 1.320458 [1.281459, 1.440666] | **초과** | 같음 |
| merge-effective | flat-500 | 코드 수준 | 4.036397→3.561167 | 0.470583 [0.468166, 0.489834] | **초과** | 같음 |
| merge-effective | oneOf-20 | 코드 수준 | 2.360917→2.344417 | 0.016500 [-0.022166, 0.041166] | 미확인 | 같음 |
| merge-effective | sample-0 | 코드 수준 | 0.192875→0.163916 | 0.028001 [0.027833, 0.028959] | **초과** | 같음 |
| merge-contributions | nested-d5-f4 | 코드 수준 | 11.089145→10.225937 | 0.826166 [0.804916, 0.863208] | 미확인 | 같음 |
| merge-contributions | flat-500 | 코드 수준 | 4.040104→3.766104 | 0.298624 [0.253208, 0.335625] | **초과** | 같음 |
| merge-contributions | oneOf-20 | 코드 수준 | 2.374478→2.368271 | 0.006208 [-0.018582, 0.007624] | 미확인 | 같음 |
| merge-contributions | sample-0 | 코드 수준 | 0.189791→0.169666 | 0.021750 [0.020125, 0.024625] | **초과** | 같음 |
| apply-contribution | nested-d5-f4 | 코드 수준 | 11.284813→10.646270 | 0.638542 [0.482001, 0.765584] | 미확인 | 변경 |
| apply-contribution | flat-500 | 코드 수준 | 4.042729→3.681938 | 0.347583 [0.347542, 0.360791] | **초과** | 변경 |
| apply-contribution | oneOf-20 | 코드 수준 | 2.349395→1.302209 | 1.055666 [1.040749, 1.074791] | **초과** | 변경 |
| apply-contribution | sample-0 | 코드 수준 | 0.191937→0.171188 | 0.018708 [0.018666, 0.020750] | **초과** | 변경 |
| static-cache | nested-d5-f4 | 코드 수준 | 11.262562→11.458271 | -0.120583 [-0.195709, -0.005084] | 미확인 | 같음 |
| static-cache | flat-500 | 코드 수준 | 4.054021→4.060229 | 0.001750 [-0.090334, 0.015375] | 미확인 | 같음 |
| static-cache | oneOf-20 | 코드 수준 | 2.381874→2.393313 | -0.003416 [-0.019917, 0.032666] | 미확인 | 같음 |
| static-cache | sample-0 | 코드 수준 | 0.197854→0.200979 | -0.000292 [-0.005041, 0.003708] | 미확인 | 같음 |
| declarations | nested-d5-f4 | 코드 수준 | 11.343750→10.425333 | 0.884500 [0.792250, 1.128832] | 미확인 | 같음 |
| declarations | flat-500 | 코드 수준 | 4.092667→3.700417 | 0.382667 [0.371751, 0.417416] | **초과** | 같음 |
| declarations | oneOf-20 | 코드 수준 | 2.541105→2.370063 | 0.166125 [0.138208, 0.224124] | **초과** | 같음 |
| declarations | sample-0 | 코드 수준 | 0.197854→0.191167 | 0.005833 [0.005667, 0.009833] | 미확인 | 같음 |
| children | nested-d5-f4 | 코드 수준 | 10.813875→9.107958 | 1.707792 [1.680500, 1.877792] | **초과** | 같음 |
| children | flat-500 | 코드 수준 | 4.068520→3.283709 | 0.758876 [0.746166, 0.810375] | **초과** | 같음 |
| children | oneOf-20 | 코드 수준 | 2.372854→2.311521 | 0.044666 [0.038166, 0.081708] | 미확인 | 같음 |
| children | sample-0 | 코드 수준 | 0.198520→0.177459 | 0.020750 [0.019916, 0.022166] | **초과** | 같음 |
| template-key | nested-d5-f4 | 코드 수준 | 11.060146→10.699624 | 0.381751 [0.289500, 0.393708] | 미확인 | 같음 |
| template-key | flat-500 | 코드 수준 | 4.038625→3.911604 | 0.124584 [0.088958, 0.145876] | **초과** | 같음 |
| template-key | oneOf-20 | 코드 수준 | 2.357125→2.342771 | 0.034124 [0.011626, 0.040875] | 미확인 | 같음 |
| template-key | sample-0 | 코드 수준 | 0.196291→0.193708 | 0.002583 [0.002166, 0.004875] | 미확인 | 같음 |
| node-types | nested-d5-f4 | 코드 수준 | 11.122207→11.359291 | -0.237084 [-0.317167, 0.042543] | 미확인 | 같음 |
| node-types | flat-500 | 코드 수준 | 4.098000→4.184041 | -0.071707 [-0.172333, -0.069666] | 미확인 | 같음 |
| node-types | oneOf-20 | 코드 수준 | 2.396646→2.279167 | 0.121624 [0.110916, 0.124000] | **초과** | 같음 |
| node-types | sample-0 | 코드 수준 | 0.201166→0.198083 | 0.000167 [0.000041, 0.007250] | 미확인 | 같음 |
| compile-expressions | nested-d5-f4 | 코드 수준 | 11.187667→11.291875 | -0.104208 [-0.129709, 0.057750] | 미확인 | 같음 |
| compile-expressions | flat-500 | 코드 수준 | 4.023500→4.061625 | -0.038125 [-0.107958, -0.016333] | 미확인 | 같음 |
| compile-expressions | oneOf-20 | 코드 수준 | 2.381520→2.286437 | 0.095083 [0.082333, 0.101999] | **초과** | 같음 |
| compile-expressions | sample-0 | 코드 수준 | 0.197730→0.196812 | 0.000918 [0.000209, 0.004834] | 미확인 | 같음 |
| dynamic-function | nested-d5-f4 | 코드 수준 | 11.070333→11.183082 | -0.129333 [-0.161417, -0.019959] | 미확인 | 같음 |
| dynamic-function | flat-500 | 코드 수준 | 4.047917→4.086249 | -0.005042 [-0.038333, -0.004417] | 미확인 | 같음 |
| dynamic-function | oneOf-20 | 코드 수준 | 2.372584→2.329209 | 0.049334 [0.043375, 0.049792] | **초과** | 같음 |
| dynamic-function | sample-0 | 코드 수준 | 0.197625→0.203833 | -0.002416 [-0.007417, 0.000917] | 미확인 | 같음 |
| gate-reads | nested-d5-f4 | 코드 수준 | 11.214625→11.267209 | -0.063875 [-0.160125, 0.130625] | 미확인 | 같음 |
| gate-reads | flat-500 | 코드 수준 | 4.033979→4.049729 | -0.013458 [-0.015750, -0.010750] | 미확인 | 같음 |
| gate-reads | oneOf-20 | 코드 수준 | 2.575708→2.341625 | 0.228125 [0.205917, 0.278875] | **초과** | 같음 |
| gate-reads | sample-0 | 코드 수준 | 0.196728→0.195644 | 0.001084 [-0.000126, 0.002417] | 미확인 | 같음 |
| create-gate | nested-d5-f4 | 코드 수준 | 11.214354→11.283937 | 0.047875 [-0.150584, 0.092916] | 미확인 | 같음 |
| create-gate | flat-500 | 코드 수준 | 4.027042→4.062875 | -0.035125 [-0.035834, -0.006167] | 미확인 | 같음 |
| create-gate | oneOf-20 | 코드 수준 | 2.585500→2.363729 | 0.230708 [0.216959, 0.249458] | **초과** | 같음 |
| create-gate | sample-0 | 코드 수준 | 0.199646→0.198687 | 0.000958 [-0.000084, 0.002333] | 미확인 | 같음 |
| freezing | nested-d5-f4 | 계약 접촉 | 11.294645→10.746875 | 0.675458 [0.306917, 0.677709] | 미확인 | 같음 |
| freezing | flat-500 | 계약 접촉 | 4.023375→3.861167 | 0.162208 [0.136291, 0.184292] | **초과** | 같음 |
| freezing | oneOf-20 | 계약 접촉 | 2.369292→2.330063 | 0.039917 [0.036166, 0.052625] | 미확인 | 같음 |
| freezing | sample-0 | 계약 접촉 | 0.200292→0.195917 | 0.004375 [0.003666, 0.005667] | 미확인 | 같음 |
| shape | nested-d5-f4 | 계약 접촉 | 11.178125→10.935438 | 0.220999 [0.165250, 0.321792] | 미확인 | 같음 |
| shape | flat-500 | 계약 접촉 | 4.029146→4.014624 | 0.018000 [-0.000250, 0.024500] | 미확인 | 같음 |
| shape | oneOf-20 | 계약 접촉 | 2.380042→2.377021 | 0.023875 [-0.000709, 0.030208] | 미확인 | 같음 |
| shape | sample-0 | 계약 접촉 | 0.199687→0.194833 | 0.004917 [0.000500, 0.006709] | 미확인 | 같음 |
| type-strategy | nested-d5-f4 | 코드 수준 | 11.145646→12.025063 | -0.850833 [-1.086125, -0.740208] | 미확인 | 같음 |
| type-strategy | flat-500 | 코드 수준 | 4.054958→4.259583 | -0.204625 [-0.234916, -0.199750] | 미확인 | 같음 |
| type-strategy | oneOf-20 | 코드 수준 | 2.352687→2.248271 | 0.104417 [0.103792, 0.107167] | **초과** | 같음 |
| type-strategy | sample-0 | 코드 수준 | 0.189499→0.185416 | 0.004209 [0.004083, 0.004791] | 미확인 | 같음 |

### 분류와 수정 사양

코드 수준 항목은 동일 blueprint 내용·정적 오류·경고·참조 계약을 유지하는 아래 사양만 구현 후보입니다. 상수 결과 재사용 자체는 측정 전용입니다. 계약 접촉 항목은 원장 결정을 위한 천장으로 남깁니다.

- **blueprint** (계약 접촉): PROFILE-100C01-S01: 완성 청사진의 폼 간 공유는 BLUEPRINT-001·021·022, GOAL-070의 키·수명·옵션·독립 계약 결정이 필요합니다.
- **build-nodes** (계약 접촉): PROFILE-100C01-S01: 완성 노드/조각 그래프 재사용으로 전체 구축을 제거한 겹친 천장입니다. 공개 내용과 폼별 소유권을 새로 정해야 합니다.
- **static-normalization** (코드 수준): 일회 정적 정규화는 메모 조회·partition·활성 ID 키와 spread 임시 노드를 거치지 않고 기존 contribution fold를 원래 노드와 이미 수집한 conjunctions에 직접 적용합니다. 정적 오류·경고·result와 DEFAULT_NO_ACTIVE는 유지합니다.
- **merge-effective** (코드 수준): 같은 정적 결과를 유지하며 일회 분석의 선택·캐시·키 계산을 직접 fold로 우회합니다.
- **merge-contributions** (코드 수준): 기여·제약·형 병합을 융합하고 필요하지 않은 임시 상태를 생략하되 정적 충돌·shape·불변성을 유지하는 사양입니다.
- **apply-contribution** (코드 수준): 키 판정과 제약 병합을 한 순회로 결합하고 고정 키 할당·반복 검사만 제거합니다. 결과와 진단은 같아야 합니다.
- **static-cache** (코드 수준): 재사용되지 않는 일회 정적 node view의 약한 메모·partition을 만들지 않습니다. 런타임 및 호출자 메모는 유지합니다.
- **declarations** (코드 수준): 단일 수집 순회의 선언·조각 레코드를 안정된 shape로 만들고 경로/ID 계산과 불필요한 배열 복사를 줄입니다. 도달한 모든 선언의 검증·순서·진단은 유지합니다.
- **children** (코드 수준): 자식 입력 수집·게이트 결합을 고전 루프로 융합하고 동일 호스트 선언의 불필요한 spread·복사를 줄입니다. build 호출·새 graph·호스트별 차이는 유지합니다.
- **template-key** (코드 수준): 무게이트 단일 입력의 키 생성에 불필요한 중간 배열·map·filter를 만들지 않고 참조 절단과 키 분리는 유지합니다.
- **node-types** (코드 수준): 단일 명시 형에서 반복 필터/교집합 순회를 융합합니다. 추론·게이트·정적 형 오류는 기존 경로를 유지합니다.
- **compile-expressions** (코드 수준): 선언 식과 게이트 경로의 중복 분석을 청사진 호출 안에서 재사용하고 컴파일 시점·schemaPath·의존·함수 본문을 보존합니다.
- **dynamic-function** (코드 수준): 식 경로 변환/본문 생성의 중복 계산을 줄이되 manager 등록·동일 함수 본문·컴파일 실패 시점과 위치를 유지합니다.
- **gate-reads** (코드 수준): 같은 게이트 조건의 정적 읽기 목록을 호출 안에서 한 번 파싱하여 공유합니다. 읽기 순서·위치·불변성을 유지합니다.
- **create-gate** (코드 수준): 게이트 필드 결합과 정적 읽기 계산의 반복을 제거하되 호스트·appliesWhen·immutable shape는 유지합니다.
- **freezing** (계약 접촉): PROFILE-100C01-S02: BLUEPRINT-002·021의 불변 노드/조각/식/유효 스키마 계약을 제거한 천장입니다. 동결 생략 자체는 제품 후보가 아닙니다.
- **shape** (계약 접촉): PROFILE-100C01-S03: BLUEPRINT-012·030·044의 정적 재귀/직접 자식 오류를 드러내지 않는 천장입니다. 지연/생략은 계약 결정이 필요합니다.
- **type-strategy** (코드 수준): 형 파싱·종류 그룹·전략 판정의 전체 단계 천장입니다. 중복 읽기와 필터/교집합 순회를 융합하고 같은 정적 오류·옵션 판정·그룹을 유지하는 코드 사양입니다.

### 5% coverage

각 fixture에서 self/total 5% 이상인 모든 함수와 단계가 적어도 하나의 제거에 연결되어 있고 101×3 원시 시간 배열을 확인했습니다. 형·전략 전체는 readAllowedTypes·resolveNodeTypes·resolveNodeStrategy를 함께 상수 재생하여 별도 측정했습니다. 함수 단독 node-types와 구분합니다.

| fixture | 종류 | 5% 대상 | self/total % | 제거 |
|---|---|---|---:|---|
| nested-d5-f4 | 함수 | buildNodes | 31.09/89.32 | build-nodes |
| nested-d5-f4 | 함수 | populateNodeChildren | 9.17/89.15 | children |
| nested-d5-f4 | 함수 | applySchemaContribution | 8.95/13.37 | apply-contribution |
| nested-d5-f4 | 함수 | collectDeclarations | 8.55/9.78 | declarations |
| nested-d5-f4 | 함수 | blueprint | 5.76/99.99 | blueprint |
| nested-d5-f4 | 함수 | getTemplateKey | 5.54/5.54 | template-key |
| nested-d5-f4 | 함수 | ensureEffectiveSchemaCache | 5.41/5.41 | static-cache |
| nested-d5-f4 | 함수 | mergeSchemaContributions | 1.91/17.32 | merge-contributions |
| nested-d5-f4 | 함수 | mergeEffectiveSchema | 1.77/24.62 | merge-effective |
| nested-d5-f4 | 단계 | buildNodes other | 31.09/89.32 | build-nodes |
| nested-d5-f4 | 단계 | static schema merge | 23.68/24.63 | static-normalization |
| nested-d5-f4 | 단계 | child binding | 15.77/89.15 | children |
| nested-d5-f4 | 단계 | declaration collection | 9.06/9.78 | declarations |
| nested-d5-f4 | 단계 | blueprint orchestration / inlined freezing | 5.79/100.00 | blueprint |
| nested-d5-f4 | 단계 | indexes | 5.54/5.54 | template-key |
| flat-500 | 함수 | buildNodes | 29.13/90.20 | build-nodes |
| flat-500 | 함수 | applySchemaContribution | 9.01/14.32 | apply-contribution |
| flat-500 | 함수 | collectDeclarations | 7.86/9.76 | declarations |
| flat-500 | 함수 | populateNodeChildren | 7.71/89.21 | children |
| flat-500 | 함수 | blueprint | 7.24/100.00 | blueprint |
| flat-500 | 함수 | ensureEffectiveSchemaCache | 6.31/6.31 | static-cache |
| flat-500 | 함수 | getTemplateKey | 5.46/5.46 | template-key |
| flat-500 | 함수 | mergeSchemaContributions | 2.26/18.95 | merge-contributions |
| flat-500 | 함수 | mergeEffectiveSchema | 1.49/26.95 | merge-effective |
| flat-500 | 단계 | buildNodes other | 29.13/90.20 | build-nodes |
| flat-500 | 단계 | static schema merge | 25.81/26.99 | static-normalization |
| flat-500 | 단계 | child binding | 15.54/89.25 | children |
| flat-500 | 단계 | declaration collection | 8.80/9.78 | declarations |
| flat-500 | 단계 | blueprint orchestration / inlined freezing | 7.26/100.00 | blueprint |
| flat-500 | 단계 | type and strategy | 5.47/5.47 | type-strategy |
| flat-500 | 단계 | indexes | 5.46/5.46 | template-key |
| oneOf-20 | 함수 | buildNodes | 24.06/82.21 | build-nodes |
| oneOf-20 | 함수 | collectDeclarations | 10.56/20.53 | declarations |
| oneOf-20 | 함수 | collectGateEvaluationReads | 7.76/7.99 | gate-reads |
| oneOf-20 | 함수 | blueprint | 7.50/100.00 | blueprint |
| oneOf-20 | 함수 | populateNodeChildren | 6.35/65.57 | children |
| oneOf-20 | 함수 | getTemplateKey | 5.84/5.97 | template-key |
| oneOf-20 | 함수 | createDynamicFunction | 4.48/5.20 | dynamic-function |
| oneOf-20 | 함수 | resolveNodeTypes | 2.58/6.82 | node-types |
| oneOf-20 | 함수 | mergeEffectiveSchema | 2.46/9.36 | merge-effective |
| oneOf-20 | 함수 | compileBlueprintExpressions | 2.13/8.42 | compile-expressions |
| oneOf-20 | 함수 | createBlueprintGate | 0.33/8.32 | create-gate |
| oneOf-20 | 단계 | buildNodes other | 24.07/82.21 | build-nodes |
| oneOf-20 | 단계 | child binding | 12.04/65.58 | children |
| oneOf-20 | 단계 | declaration collection | 11.90/20.54 | declarations |
| oneOf-20 | 단계 | type and strategy | 10.96/10.96 | type-strategy |
| oneOf-20 | 단계 | static schema merge | 9.28/9.37 | static-normalization |
| oneOf-20 | 단계 | expression compilation | 8.42/8.42 | compile-expressions |
| oneOf-20 | 단계 | gate read analysis | 7.99/7.99 | gate-reads |
| oneOf-20 | 단계 | blueprint orchestration / inlined freezing | 7.61/100.00 | blueprint |
| oneOf-20 | 단계 | indexes | 5.97/5.97 | template-key |
| sample-0 | 함수 | buildNodes | 23.90/86.01 | build-nodes |
| sample-0 | 함수 | applySchemaContribution | 9.38/14.67 | apply-contribution |
| sample-0 | 함수 | blueprint | 9.31/100.00 | blueprint |
| sample-0 | 함수 | collectDeclarations | 9.24/10.71 | declarations |
| sample-0 | 함수 | populateNodeChildren | 8.06/60.22 | children |
| sample-0 | 함수 | ensureEffectiveSchemaCache | 5.78/5.78 | static-cache |
| sample-0 | 함수 | getTemplateKey | 5.44/5.45 | template-key |
| sample-0 | 함수 | mergeSchemaContributions | 2.60/19.87 | merge-contributions |
| sample-0 | 함수 | mergeEffectiveSchema | 1.61/27.63 | merge-effective |
| sample-0 | 단계 | static schema merge | 26.55/27.63 | static-normalization |
| sample-0 | 단계 | buildNodes other | 23.90/86.01 | build-nodes |
| sample-0 | 단계 | child binding | 13.64/60.29 | children |
| sample-0 | 단계 | blueprint orchestration / inlined freezing | 11.17/100.00 | blueprint |
| sample-0 | 단계 | declaration collection | 10.57/10.79 | declarations |
| sample-0 | 단계 | type and strategy | 5.92/5.92 | type-strategy |
| sample-0 | 단계 | indexes | 5.45/5.45 | template-key |

## C와 최종 상태

nested 기준 코드 수준 최대인 자식 바인딩 하나만 구현했습니다. 59-schema 구조·오류·경고 차등과 생성 횟수 시험을 통과했지만 실제 종단 이득이 잡음을 넘지 못했습니다. 제품 코드와 소유 DETAIL은 HEAD의 원래 바이트로 복구했습니다. 다른 후보는 구현하지 않았습니다. C의 수치·복구 근거·메모리 비용은 [101라운드 재측정](remeasure-86c02.md#101라운드-콜드-청사진-자식-바인딩)에 기록했습니다.

재현 명령(작업 트리에서 순차 실행):

```sh
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --build head control
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --profiles
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --matrix
# C 원시 결과는 복구 전 attempt.diff의 단일 실험 코드로 --compare를 실행한 결과입니다.
# 현재 복구된 제품으로 --compare를 재실행하면 두 측정 대상이 HEAD가 됩니다.
node packages/canard/schema-form/architecture/verification/07-switch/tools/profile-100c01.mjs --verify
node packages/canard/schema-form/architecture/verification/07-switch/tools/summarize-100c01.mjs --emit-patch
```

생성 번들·source map은 최종 산출물에서 제거합니다. 재집계 시 --build head control로 동일 해시의 map을 다시 만듭니다. 프로파일·측정·보고서·summary는 모두 파일당 5,000,000 바이트 이하입니다. 설치 없는 npx 실행에는 npm_config_offline=true와 npm_config_yes=false를 적용했습니다.
