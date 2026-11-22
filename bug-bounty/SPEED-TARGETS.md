# 속도 재측정 및 개선 대상 목록

## 1. 목적과 범위

버그 바운티 수정으로 `1.0.0-beta`(`1c77ced57`)보다 느려진 코드를 이후 별도 작업에서 재측정하고 개선하기 위한 출발 지도입니다. 대상은 병합된 `1.0.0/bugbounty` 브랜치(헤드 `e6322c110`)이며, 속도만을 위한 커밋은 모두 제거되어 있습니다. 표의 이전 비율은 속도 커밋이 포함된 이전 헤드에서 잰 값이므로 낡은 값이고, 행의 식별(패키지, 함수 또는 벤치마크, 입력)과 대략적인 힌트로만 사용합니다. 모든 행의 상태는 "재측정 필요"입니다.

## 2. 측정 규칙

- 기준선은 beta `1c77ced57`이며, 현재 `1.0.0/bugbounty` 헤드와 비교합니다.
- 수리된 경우를 실행하지 않는 일반 입력은 beta의 1.03배 이내여야 합니다.
- 느려짐이 수정 비용으로 인정되려면 입력이 수리된 경우를 실행해야 하고, 남은 차이가 필요한 작업을 한 번 수행한 비용이어야 하며, 그 귀속이 측정으로 확인되어야 합니다. 수정 비용은 수용됩니다.
- 판정은 min과 p10으로 하며, 대조군이 0.98에서 1.02 안에 있어야 합니다. 중앙값은 진단용입니다.
- 동작은 바꾸지 않습니다. 바운티에서 결정된 모든 동작은 통합 브랜치의 공개 진입점 테스트로 고정되어 있으며, 속도 변경은 이 테스트를 그대로 통과해야 합니다.

## 3. 우선순위 1: 기준을 넘은 일반 입력 24행

이전 비율은 p10, 괄호는 min이며 이전 헤드 측정값입니다. 후보 열은 속도 커밋이 건드린 파일로 연결한 것이고, "—"는 연결되는 커밋이 없다는 뜻입니다.

| 패키지 | 함수 또는 벤치마크 | 입력 | 이전 비율(구 측정) | 관련 속도 커밋 후보 | 상태 |
|---|---|---|---|---|---|
| json-schema | schema-first-miss | 일반 미스 | 5.349 (5.352) | utils `41d237199` | 재측정 필요 |
| react-utils | rest-changed | 일반 | 4.211 (4.228) | — | 재측정 필요 |
| react-utils | rest-equal | 일반 | 1.987 (1.996) | — | 재측정 필요 |
| common-utils | equals-deep | 일반(순환 없음) | 1.718 (1.691) | — | 재측정 필요 |
| common-utils | isEmpty-general | 일반 혼합 | 1.709 (1.697) | — | 재측정 필요 |
| json | getValue-tokens | 일반 | 1.527 (1.52) | — | 재측정 필요 |
| style-utils | document-fresh-add | 일반 문서 | 1.508 (1.502) | utils `b40fcb199` | 재측정 필요 |
| style-utils | flat-combinator | 일반 | 1.501 (1.494) | utils `f13441eed` | 재측정 필요 |
| style-utils | inject-add | 일반 추가 | 1.442 (1.438) | utils `b40fcb199` | 재측정 필요 |
| style-utils | plain-multiple | 일반 | 1.207 (1.207) | utils `f13441eed` | 재측정 필요 |
| antd5 | checkboxChangePlain | 일반 | 1.132 (1.152) | — | 재측정 필요 |
| common-utils | clone-builtins | 일반 | 1.119 (1.12) | utils `613898883` | 재측정 필요 |
| common-utils | cloneLite-deep | 일반 | 1.103 (1.103) | utils `ef44d2814` | 재측정 필요 |
| common-utils | clone-deep | 일반 | 1.076 (1.07) | utils `613898883` | 재측정 필요 |
| json | getValue-array | 일반 | 1.075 (1.077) | — | 재측정 필요 |
| schema-form core | mount-plain | 일반 | 1.071 (1.086) | — | 재측정 필요 |
| schema-form core | whole-array-client-own-write | 일반 | 1.071 (1.086) | engine `252110dda` | 재측정 필요 |
| json | getValue-fragment-plain | 일반 | 1.063 (1.07) | — | 재측정 필요 |
| schema-form core | context-update | 일반 | 1.055 (1.061) | core `837e3ace1` | 재측정 필요 |
| common-utils | isEmpty-local-map | 일반 | 1.049 (1.055) | — | 재측정 필요 |
| schema-form engine | mount-plain | 일반 | 1.048 (1.051) | — | 재측정 필요 |
| mui | stringSwitchMount | 일반 | 1.034 (1.061) | — | 재측정 필요 |
| json | patch-array-test-mutable | 일반 | 1.032 (1.031) | — | 재측정 필요 |
| schema-form core | react-bridges | 일반 | 1.031 (1.014) | — | 재측정 필요 |

## 4. 우선순위 2: cut 또는 undetermined 행 67행

우선순위 1에 이미 있는 행은 제외했습니다. 구성은 cut 42행(UI 7, core 4, engine 18, utils 13)과 undetermined 25행(UI)입니다. 일반 입력이 아닌 행이므로 수리된 경우를 실행하는지 먼저 확인하고, 수정 비용 조건을 만족하면 수용 대상으로 재분류합니다. undetermined 행은 이전에 대조군(A/A)이 범위를 벗어나 beta 비교 자체가 무효였던 행이므로, 대조군이 0.98에서 1.02 안에 들어오는지부터 확인합니다.

### 4.1 cut (42행)

| 패키지 | 함수 또는 벤치마크 | 입력 | 이전 비율(구 측정) | 관련 속도 커밋 후보 | 상태 |
|---|---|---|---|---|---|
| antd5 | checkboxChange | 수리 | 1.161 (1.257) | — | 재측정 필요 |
| antd5 | branchError | 수리 | 4.126 (4.891), beta 대조군 불일치 | — | 재측정 필요 |
| antd5 | coreExternalArray | 수리 | 1.189 (1.067) | — | 재측정 필요 |
| antd6 | multiEnumMount | 미확인 | 1.242 (1.033) | — | 재측정 필요 |
| antd-mobile | sliderChange | 미확인 | 1.037 (0.994) | — | 재측정 필요 |
| mui | checkboxChange | 수리 | 1.161 (1.167) | — | 재측정 필요 |
| mui | branchError | 수리 | 1.052 (1.08) | — | 재측정 필요 |
| schema-form core | context-error-cause | 수리 | 3.313 (3.313) | core `837e3ace1` | 재측정 필요 |
| schema-form core | mount-100 | 미확인 | 1.057 (1.073) | — | 재측정 필요 |
| schema-form core | whole-array-client-write | 수리 | 1.335 (1.331) | engine `252110dda` | 재측정 필요 |
| schema-form core | anchor-slider6-gate | 미확인 | 4.084 (4.205) | — | 재측정 필요 |
| schema-form engine | ab-reset-pending | 수리 | 1.092 (1.102) | engine `12d6a3221`, `252110dda` | 재측정 필요 |
| schema-form engine | virtual-merge-one | 미확인 | 1.036 (1.033) | engine `7531414da`, `d1088a79b` | 재측정 필요 |
| schema-form engine | ab-derive-disjoint | 미확인 | 1.039 (1.034) | engine `514ba284d` | 재측정 필요 |
| schema-form engine | virtual-write | 미확인 | 1.029 (1.051) | engine `d1088a79b`, `0615fb080`, `ee52f765b` | 재측정 필요 |
| schema-form engine | virtual-reset | 미확인 | 1.033 (1.041) | engine `d1088a79b`, `12d6a3221` | 재측정 필요 |
| schema-form engine | virtual-absent-undefined | 미확인 | 1.04 (1.037) | engine `aec97b658` | 재측정 필요 |
| schema-form engine | mount-100 | 미확인 | 1.034 (1.035) | engine `ee52f765b`, `403dc63a5` | 재측정 필요 |
| schema-form engine | aliased-mount | 미확인 | 1.114 (1.113) | engine `403dc63a5` | 재측정 필요 |
| schema-form engine | reset-refused-sequential-8 | 수리 | 1.007 (1.036) | engine `252110dda`, `12d6a3221` | 재측정 필요 |
| schema-form engine | plain-merge-shallow | 일반 | 1.014 (1.041) | engine `ee52f765b` | 재측정 필요 |
| schema-form engine | whole-array-client-write | 수리 | 1.35 (1.328) | engine `252110dda` | 재측정 필요 |
| schema-form engine | whole-array-client-own-write | 수리 | 1.044 (1.086) | engine `252110dda` | 재측정 필요 |
| schema-form engine | whole-array-client-mixed-batch | 수리 | 1.301 (1.279) | engine `252110dda` | 재측정 필요 |
| schema-form engine | whole-array-client-composition | 수리 | 1.433 (1.411) | engine `252110dda` | 재측정 필요 |
| schema-form engine | batch-structural | 미확인 | 1.772 (1.798) | engine `252110dda` | 재측정 필요 |
| schema-form engine | virtual-getters | 수리 | 2.16 (2.149) | — | 재측정 필요 |
| schema-form engine | virtual-getter-divergence | 수리 | 3.254 (3.251) | — | 재측정 필요 |
| schema-form engine | virtual-getter-inactive | 수리 | 4.347 (4.323) | — | 재측정 필요 |
| style-utils | lists | 미확인 | 2.87 (2.875) | utils `f13441eed` | 재측정 필요 |
| style-utils | opaque | 미확인 | 4.709 (4.706) | utils `f13441eed` | 재측정 필요 |
| style-utils | media | 미확인 | 2.029 (2.023) | utils `f13441eed` | 재측정 필요 |
| style-utils | escapes | 미확인 | 4.898 (4.893) | utils `f13441eed` | 재측정 필요 |
| style-utils | pseudo | 미확인 | 4.759 (4.755) | utils `f13441eed` | 재측정 필요 |
| style-utils | mixed | 미확인 | 4.411 (4.4) | utils `f13441eed`, `b40fcb199` | 재측정 필요 |
| agents-assets-sync | installer-new | 미확인 | 1.818 (1.798) | utils `6476ea09f` | 재측정 필요 |
| agents-assets-sync | installer-unchanged | 미확인 | 1.136 (1.132) | utils `6476ea09f` | 재측정 필요 |
| agents-assets-sync | installer-force | 미확인 | 1.601 (1.632) | utils `6476ea09f` | 재측정 필요 |
| common-utils | isEmpty-foreign-map | 수리 | 4.185 (4.173) | — | 재측정 필요 |
| json-schema | schema-known-noncanonical | 미확인 | 1.762 (1.79) | utils `41d237199` | 재측정 필요 |
| json-schema | schema-first-embedded | 수리 | 4.039 (4.059) | utils `41d237199` | 재측정 필요 |
| json-schema | schema-key-collision | 미확인 | 2.133 (2.121) | utils `41d237199` | 재측정 필요 |

### 4.2 undetermined (25행, 모두 UI, 이전 비율 없음, 후보 없음)

각 행은 상태가 모두 "재측정 필요"이며 이전 비율은 대조군 무효로 없습니다.

- antd5 (9): timeRangePanel, coreFormMount, coreEqualArray, sliderMount, uriMount, multiEnumMount, coreOwnArray, timeRangeMount, timeRangePanelPlain
- antd6 (6): sliderMount, uriMount, checkboxChange, branchError, timeRangeMount, timeRangePanel
- antd-mobile (5): sliderMount, radioMount, rangeSliderChange, checkboxChange, branchError
- mui (5): datePickerMount, uriMount, datePickerPanel, sliderMount, sliderChange

## 5. 우선순위 3: 수정 비용 행 18행 (귀속 재검증용)

수정 비용으로 분류되었던 행입니다. 개선 대상이 아니라 귀속이 여전히 측정으로 확인되는지 점검하는 대상이며, 이전 비율은 p10 구 측정값입니다.

- ajv7 (4): default/rootIdCompile 1.025, default/bindCompile 1.048, default/factoryCompile 1.082, default/r5/factory/fresh 1.231 (사유 I24/I29, 비공개 app 범위 격리)
- ajv8 (1): default/r5/factory/fresh 1.259 (I24/I29)
- schema-form core (3): expr-return-regexp 1.224 (C14), anchor-ssr-initial-errors 1.117 (R2.6), validate-writeback 1.114 (R3.12)
- schema-form engine (8): reset-refused-8 1.224, overlap-array-32-4 1.179, ab-derive-overlap 1.204, validate-writeback 1.064, r2-client-array-external 1.082, r3-batch-array 1.907, validate-writeback-errors 1.483, r2-async-relay-content 1.478 (엔진 값은 하한이 아니라 상한으로 보아야 하는 중간 로그 값)
- json (1): getValue-fragment 4.036 (R2-6+8, native decode 1회)
- json-schema (1): schema-alternate-lookup 2.17 (R1-1)

참고: ajv6 default/boundFirstIdResourceInvalid 1.226은 within으로 분류되었고 승인 상한 1.46(I05)이 있으므로 같은 방식으로 상한을 재확인합니다.

## 6. 속도 커밋 후보 목록

보관 브랜치에서 `git log -i --grep=^perf 09e194459..<branch>`로 얻은 목록이며, 병합된 코드에는 없습니다. 파일 경로는 `packages/` 아래이고, 한 줄 설명은 제목과 변경 파일에서 읽은 것입니다.

### 6.1 `archive/speed-candidates-core` (3개)

| SHA | 제목 | 변경 파일 | 최적화 내용 |
|---|---|---|---|
| `c0e4c6cb4` | skip repeated empty validation routing | `canard/schema-form/src/core/engine/validation/utils/route/routeValidationIssues.ts` | 빈 검증 결과의 반복 라우팅 생략 |
| `8fe9986a8` | limit expression lookbehind to slash tokens | `.../engine/blueprint/utils/expressions/replaceExpressionPaths.ts` | 슬래시 토큰에서만 lookbehind 수행 |
| `837e3ace1` | skip graph traversal for plain errors | `.../contextSnapshot/utils/areContextsEqual.ts` | 일반 Error 비교 시 그래프 순회 생략 |

### 6.2 `archive/speed-candidates-ajv` (6개)

| SHA | 제목 | 변경 파일 | 최적화 내용 |
|---|---|---|---|
| `95cddae5a` | ajv7 defer synthetic root keys | `canard/schema-form-ajv7-plugin/src/validator/utils/registerSchemaRoot.ts` | 합성 루트 키 생성 지연 |
| `c87f14a23` | ajv7 reuse detached application schemas | ajv7 `cloneInstance.ts`, `registerApplicationSchemas.ts`, `registerSchemaRoot.ts` | 분리된 application 스키마 재사용 |
| `3e67590b0` | ajv6 share resource indexes for compiled schemas | ajv6 `createValidatorFactory.ts` | 컴파일된 스키마의 리소스 색인 공유 |
| `708673f18` | ajv8 resolve authored rejected keys once | ajv8 `createValidatorFactory.ts`, `createRejectedKeyLookup.ts`(신규), `getRejectedKey.ts`(삭제), `resolveAuthoredSchemaPath.ts`(신규), `transformErrors.ts`, `rejected-key.test.ts` | 거부 키를 한 번만 해석하는 조회 도입 |
| `48e4168a8` | ajv8 reuse detached application registrations | ajv8 `isApplicationProfileCurrent.ts`(신규), `makeSibling.ts`, `registerApplicationSchemas.ts`, `registerSchemaRoot.ts` | 분리된 application 등록 재사용 |
| `3fe8f7173` | ajv6 preserve synchronous named validation | ajv6 `canCompileUnmarkedRoot.ts`(신규), `registerSchemaRoot.ts`, `DETAIL.md`, README 2개 | 이름 있는 검증의 동기 경로 유지 |

### 6.3 `archive/speed-candidates-utils` (6개)

| SHA | 제목 | 변경 파일 | 최적화 내용 |
|---|---|---|---|
| `613898883` | common-utils copy deep object keys with frame positions | `winglet/common-utils/src/utils/object/utils/clone/getCloneFrameKeys.ts`, `replicateDeep.ts`, `DETAIL.md` | 깊은 복제에서 프레임 위치로 키 복사 |
| `41d237199` | json-schema index registered spellings and schemas together | `winglet/json-schema/.../createReferenceResolver/utils/ResolverStore/ResolverStore.ts`, `DETAIL.md` | 등록 철자와 스키마를 한 번에 색인 |
| `ef44d2814` | common-utils advance cloneLite with explicit copy frames | `winglet/common-utils/src/utils/object/cloneLite/utils/replicateDeep.ts` | 명시적 복사 프레임으로 generator 재개 제거 |
| `6476ea09f` | agents-assets-sync read runtime asset snapshots concurrently | `slats/agents-assets-sync/src/core/hashManifest/utils/computeHashManifest.ts`, `DETAIL.md` | 런타임 자산 스냅샷 동시 읽기 |
| `b40fcb199` | style-utils reuse the injector active manager | `winglet/style-utils/src/styleManager/StyleManager/StyleManager.ts`, `styleManagerFactory.ts`, 문서 3개 | 주입기가 활성 관리자를 재사용 |
| `f13441eed` | style-utils batch simple CSS text using shared boundaries | `winglet/style-utils/src/utils/cssTokens/getCssComponentEnd.ts`, `processCssSheet/processCssSheet.ts`, `src/DETAIL.md` | 단순 CSS 텍스트를 공유 경계로 일괄 처리 |

### 6.4 `archive/speed-candidates-engine` (11개)

경로는 모두 `canard/schema-form/src/core/engine/` 아래입니다.

| SHA | 제목 | 변경 파일 | 최적화 내용 |
|---|---|---|---|
| `7531414da` | reuse pruning for admitted virtual addresses | `settle/utils/write/writeFieldNode.ts` | 허용된 가상 주소의 가지치기 재사용 |
| `a80fa7e7e` | read each relay candidate value once | `settle/utils/commit/utils/isRelayedInput.ts` | 중계 후보 값을 한 번만 읽음 |
| `82c15d746` | reuse named source decision after fill removal | `settle/utils/source/recordSourceDecision.ts` | 채움 제거 후 이름 있는 원천 판정 재사용 |
| `ee52f765b` | skip redundant work for stable root writes | `settle/utils/commit/markCommitDeliveries.ts`, `settle/utils/compute/selectNodeSchema.ts`, `settle/utils/write/writeFieldNode.ts` | 안정된 루트 쓰기의 중복 작업 생략 |
| `403dc63a5` | reuse indexed alias topology and syntax | `utils/dependencies/getAliasedDependencyIndex.ts`, `trie/DependencyIndex.ts` | 별칭 위상과 구문 색인 재사용 |
| `252110dda` | reuse contiguous coverage for refused resets | `settle/index.ts`, `settle/types/writeRange.ts`, `settle/utils/input/composeBatchValue.ts`, `settle/utils/write/readWriteCoverage.ts`, `write/utils/chain/flushBatchWrites.ts`, `write/utils/entry/dispatchResetSubtree.ts`, `write/utils/entry/utils/subtractLaterMarks.ts` | 거부된 리셋의 연속 범위 계산 재사용 |
| `514ba284d` | compare two direct write addresses without sorting | `settle/utils/derivation/runDeriveRounds.ts`, `utils/hasOverlappingWrites.ts`, `utils/isOverlappingAddress.ts`(신규) | 두 쓰기 주소를 정렬 없이 비교 |
| `0615fb080` | reuse admitted addresses and fresh write ranks | `settle/utils/input/markWrite.ts`, `utils/paths/resolveStorageTargets.ts`, `write/utils/entry/dispatchSetValue.ts` | 허용 주소와 새 쓰기 순위 재사용 |
| `12d6a3221` | skip replay ranges when reset withholds no writes | `write/utils/entry/dispatchResetSubtree.ts` | 보류 쓰기가 없으면 재생 범위 생략 |
| `d1088a79b` | reuse admitted virtual storage targets | `settle/utils/input/markWrite.ts`, `settle/utils/reset/resetFieldNodeSubtree.ts`, `settle/utils/write/writeFieldNode.ts`, `utils/paths/resolveStorageTargets.ts`, `write/utils/entry/dispatchSetValue.ts` | 허용된 가상 저장 대상 재사용 |
| `aec97b658` | skip irrelevant retained candidate lookups | `settle/types/settlement.ts`, `settle/utils/input/getChildDistribution.ts`, `settle/utils/source/getSlotDecision.ts`, `settle/utils/source/recordNamedChildSource.ts` | 무관한 유지 후보 조회 생략 |

후보 연결은 변경 파일 기준의 추정입니다. 적용하기 전에 해당 커밋이 바운티 결정 동작을 바꾸지 않는지 공개 진입점 테스트로 확인해야 합니다.

## 7. 측정 도구

`__benchmarks__` 디렉터리(`node_modules`와 빌드 산출물 `dist` 제외):

- `packages/winglet/style-utils/src/__benchmarks__`
- `packages/winglet/common-utils/src/utils/object/fingerprint/__benchmarks__`
- `packages/winglet/common-utils/src/utils/object/merge/__benchmarks__`
- `packages/canard/schema-form/src/core/__benchmarks__`
- `packages/canard/schema-form/src/components/Form/__benchmarks__`
- `packages/canard/schema-form/src/components/FieldProxy/components/FieldInputBridge/__benchmarks__`
- `packages/canard/schema-form/src/helpers/virtualization/VirtualizationManager/__benchmarks__`
- `packages/lerx/promise-modal/src/bootstrap/__benchmarks__`

이 밖에 `packages/aileron/benchmark-form`(브라우저 벤치마크 하니스)과 json-schema의 `benchmark/verify.mjs`, `benchmark/equivalence.mjs`가 워크플로에서 사용됩니다.

워크플로:

- `.github/workflows/performance-benchmarks.yml`: schema-form 렌더 테스트(React 18/19), `yarn workspace @canard/schema-form bench`(마이크로 벤치), aileron 벤치(sweep), 프레임워크 비교와 과다 렌더 가드, 경고 전용 회귀 검사, 그리고 json-schema 스캐너 검증을 실행합니다.
- `.github/workflows/browser-benchmark.yml`: 후보와 기준선을 각각 설치하고 빌드한 뒤 `yarn workspace @aileron/benchmark-form bench:form`으로 Chromium 브라우저 사례를 측정하고 요약을 게시합니다. `--baseline-dir`로 beta 체크아웃을 지정하는 방식이므로 이 문서의 기준선 비교에 맞습니다.
