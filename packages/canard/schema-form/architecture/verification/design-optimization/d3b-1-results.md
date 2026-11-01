# D3b-1 모드·값 메모·트리 저장소 검증 결과

현재 판정: **TEST-027 소유자 수용 필요**. 시간 10개 행의 폭 (다) 밖 악화는 0이지만 Bun B2의 B 중앙값이 A 최댓값을 넘었다. 코디네이터 지시에 따라 TEST-027 수용 요청 PR을 열며 소유자 수용 전에는 병합하지 않는다. 고정 B2 기준을 충족했다고 주장하지 않으며 제품 후보는 그대로 보존한다.

## 비교 기준과 재현 조건

- 기준은 `53d49ca94`, 구현은 `5cc588c51`이다. `9c32ffc7d`에서 인벤토리·DETAIL 계약을 먼저 커밋했고 `8e20a78ea`에서 모드를 트리 생성 전에 정하는 사용 조건을 보충했다.
- 코디네이터가 D2-P5를 보류하여 rebase하지 않았다. 승인한 같은 창의 실제 첫 build 시작 UTC는 `2026-10-27T00:58:10Z`이며 모든 formal run의 `--quiet-since`에 썼다.
- A는 D2-P5의 읽기 전용 보존본 `20261027T0027-53d49ca-d2-p5-profile/baseline-dist`를 복사했다. B는 이 가지의 최종 build이다. 생성물은 커밋하지 않았다.
- Node 26, production, 각 행 20회 예열·100표본·독립 3프로세스. 코어는 정본 pair-core의 여덟 행을 A/B/A′ 순서로, 구독 두 행은 독립 18개 자식에서 순서를 교차하여 실행했다.
- 판정은 측정 전에 고정했다. 폭은 max(A와 A′ 차이, A의 widthMs, A′의 widthMs)이며 B가 양쪽 기준에서 모두 폭을 넘을 때만 개선/악화로 판정한다. 채택은 시간 악화 0이고 Node·Bun 각각 B2의 B 중앙값≤A 최댓값이어야 한다. 개선은 요구하지 않는다.

| 산출물           | A SHA-256                                                          | B SHA-256                                                          |
| ---------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `index.node.mjs` | `3cd015751444657797806cd582d1b5ccc6df78a2ce366cca463801c4eb3d3d4a` | `cca627b4e38506551c786aaa778b87ac1d2e6f7d8a3a6aab9bc699f2b1d3a418` |
| `index.mjs`      | `516aa5f98104328bb726fffac00d710de1720e2b76fca8885337a94f8c9298a4` | `0068e9b21889d7c959fbbce208b17fb60247eaef48d7d27fe87f0b1b6cb66bc3` |
| `index.cjs`      | `1feb55429d4c53985f15fe67584ab425b262d9713306997d7e02b8bc28b6f490` | `7d73853f3daa785fb199216b76caf71a06e48fb336938835cde8d0b1c3aaf6da` |
| `index.d.ts`     | `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6` | `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6` |

## 시간 측정

단위는 ms이며 셋의 독립 프로세스 최소값에 대한 중앙값이다. `unproven`은 폭 안이거나 양쪽 기준에서 같은 방향의 증거가 없는 경우이다.

| 행                          |         A |         B |        A′ |  폭 (다) |     B/A |    B/A′ | 판정     |
| --------------------------- | --------: | --------: | --------: | -------: | ------: | ------: | -------- |
| mount-oneOf-80              |  2.104792 |  2.057833 |  2.064750 | 0.076500 |  -2.23% |  -0.34% | unproven |
| mount-flat-1000             |  2.071167 |  2.103167 |  2.089792 | 0.086959 |  +1.55% |  +0.64% | unproven |
| mount-nested-d6-f4          | 15.926625 | 15.994875 | 16.147958 | 0.758875 |  +0.43% |  -0.95% | unproven |
| single-flat-1000            |  0.112083 |  0.069250 |  0.104667 | 0.063000 | -38.22% | -33.84% | unproven |
| single-nested-d6-f4         |  0.185958 |  0.179375 |  0.116500 | 0.069458 |  -3.54% | +53.97% | unproven |
| switch-oneOf-80             |  0.510542 |  0.413875 |  0.510167 | 0.279792 | -18.93% | -18.87% | unproven |
| bulk-flat-2000              |  1.791542 |  1.841208 |  1.742959 | 0.224418 |  +2.77% |  +5.64% | unproven |
| bulk-nested-d6-f4           |  4.011959 |  4.024542 |  3.993500 | 0.233333 |  +0.31% |  +0.78% | unproven |
| wave-1000                   |  1.699542 |  1.709834 |  1.700750 | 0.070541 |  +0.61% |  +0.53% | unproven |
| single-flat-1000-subscribed |  0.088334 |  0.079041 |  0.093791 | 0.006458 | -10.52% | -15.73% | improved |

## B2 노드당 힙

정본 `bench/legacy-compare/node-and-settle.bench.ts --heap-child`를 사용했다. Node는 GC 가능한 한 자식의 7표본, Bun은 각각 새 자식 7개이다. 단위는 B/node이고 트리는 5,001노드이다.

| 런타임 |    A 중앙값 |    A 최댓값 |    B 중앙값 |  B−A 최댓값 | 판정 |
| ------ | ----------: | ----------: | ----------: | ----------: | ---- |
| node   | 1441.826835 | 1900.143171 | 1442.156369 | -457.986803 | 통과 |
| bun    | 2222.401920 | 2222.628274 | 2224.092981 |   +1.464707 | 미달 |

- node A 7표본: 1900.143171, 1445.598880, 1448.947011, 1441.006199, 1441.826835, 1437.864427, 1435.048990.
- node B 7표본: 1901.122176, 1445.512498, 1449.252549, 1439.092981, 1442.156369, 1437.592482, 1435.085783.

- bun A 7표본: 2221.992002, 2222.442711, 2222.157968, 2222.333933, 2222.608278, 2222.628274, 2222.401920.
- bun B 7표본: 2224.154969, 2224.104979, 2223.599480, 2223.318736, 2224.092981, 2223.344331, 2231.403519.

Bun은 B 중앙값이 A 최댓값보다 1.464707 B/node(약 0.066%) 크다. 기존 전역 공유 메모를 트리별 WeakMap으로 생성하는 소유 비용이 원인 후보이나 분리 실험으로 입증하지 않았다. 임의 재측정이나 판정 폭 변경을 하지 않았다.

## 지연 생성과 B2 저장소 확인

코디네이터 요청에 따라 제품 `5cc588c51`을 보존한 채 원인 후보를 점검했다. 시간·힙 재측정 없이 정본과 같은 `flat(5000)` → blueprint → factory → load를 Node·Bun에서 한 번씩 실행했다. WeakMap constructor를 관찰한 단회 실행이며 수치 판정 표본에는 포함하지 않았다.

| 항목                            | Node A/B               | Bun A/B                |
| ------------------------------- | ---------------------- | ---------------------- |
| 노드 수                         | 5,001 / 5,001          | 5,001 / 5,001          |
| factory까지 새 WeakMap          | 0 / 0                  | 0 / 0                  |
| load까지 새 WeakMap             | 0 / 1                  | 0 / 1                  |
| B에서 생성한 저장소와 키 수     | objectShapes, root 1개 | objectShapes, root 1개 |
| factory 직후 새 runtime own-key | 없음                   | 없음                   |
| load 뒤 새 runtime own-key      | objectShapes           | objectShapes           |
| 노드 own-key 추가·삭제          | 없음                   | 없음                   |

일곱 저장소의 생성 식은 모두 첫 쓰기의 `??= new WeakMap()`이다. 선언 키는 key set, target ID는 첫 rule key 요청, 주소 셀은 retain, 배열·객체 형상은 remember/assembly set, 예산은 cap set, 배열 선언은 count/result set 때 생성한다. B2에서 다른 여섯 저장소는 own property조차 없다. `TreeMemoStores`는 type-only이며 factory와 FieldNode에는 이 칸들을 미리 두지 않았다.

clearTreeMemoStores의 여섯 undefined 대입은 폼 reset·폐기에서만 실행하고 B2는 두 경로를 호출하지 않는다. 비지연 생성이나 B2의 선할당 결함은 확인되지 않았다. A의 모듈 전역 WeakMap은 분석 이전에 이미 존재하고 B는 첫 객체 조립에서 새 트리 소유 WeakMap 하나를 만든다. 이 소유 비용은 원인 후보이며, 힙 차이 전체가 그 하나 때문인지는 별도 분리하지 않았다. 코디네이터가 TEST-027 소유자 판단으로 올리도록 지시했다. 추가 제품 수정·재측정 없이 수용 요청 PR을 열며 수용 전 병합은 금지한다.

단회 관찰 원시는 `{scratch}/453-d3b-1/inspect-b2-node.json`, `{scratch}/453-d3b-1/inspect-b2-bun.json`이다.

## 구현과 비용

- 이전 항목은 모드 3개·값 메모 6개·트리 저장소 7개, 총 16개이다. 원 인벤토리의 해당 16행에 완료를 표시했다. LAST는 count/result만 완료이며 정적 사실 배치는 D3b-2에 남는다.
- engineModes는 세 모드를 한 파일에서 읽고 setMode로 바꾼다. 실제 변경 때 기존 파생 WeakMap 32개를 새로 만드는 임시 초기화 콜백을 호출한다. 생성 사실 두 개는 유지한다. 모드는 트리를 만들기 전에 정하며 모드 전환 후 기존 트리 문맥은 보장하지 않는다. 출하 모드는 고정이다.
- 값 메모는 이름을 구분한 단일 파일에 모았다. 공유 구조 형은 engine/types로 내려 자식 모듈 역의존을 만들지 않았다.
- 루트 runtime에 필요한 WeakMap만 지연 생성한다. 노드 고정 칸은 추가하지 않았다. 재계산 가능한 여섯 저장소는 폼 전체 reset·폐기에서 해제하고 부분 reset에서는 유지한다.
- DetachedWriteAddress는 상태 예외이다. resetFieldNodeForm은 기존 runtime을 재사용하며 주소 셀은 어떤 reset에서도 지우지 않는다. 재키된 옛 참조가 부분·폼 reset 뒤에도 같은 이동 주소로 쓰는 것을 기준과 구현에서 확인했다. nextTargetId와 REGISTRIES는 유지했다.
- 비용은 사용하는 트리당 최대 일곱 지연 WeakMap과 모드 변경 때만 동작하는 파생 저장소별 콜백이다. 값·배달·타입 표면과 노드 배치는 보존했다. 실제 Bun B2 증가를 위 표에 그대로 기록했다.

## 관문과 회귀 증거

| 관문                     | 결과                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| DETAIL 선행              | 9c32ffc7d → 8e20a78ea → 5cc588c51                                                                   |
| 새 시험의 구현 전 실패   | 트리 공유 count 메모의 참조 불안정·reset 미초기화 2실패; 새 engineModes API 부재 실패               |
| 기존 주소 동작 고정      | 부분 reset·폼 reset 2사례가 기준/구현 모두 같은 이동 주소로 쓰기                                    |
| 새 시험                  | 4파일 7사례 통과                                                                                    |
| build / lint / typecheck | 모두 통과                                                                                           |
| unit                     | 506파일, 3,617통과·기존 todo1                                                                       |
| render / react18         | 각각 128파일·760통과                                                                                |
| storybook                | 100파일·251통과                                                                                     |
| production               | 9파일·20통과                                                                                        |
| test:verify              | 639파일·4,421통과·기존 todo1                                                                        |
| 전후 배달 비교           | C 일반 72장면·323시점 차이0; static-first/generic × unobserved/revision/listener 6장면·12시점 차이0 |
| dist/index.d.ts          | 바이트 차이0                                                                                        |
| 기존 단언                | 변경한 기존 시험 54파일의 기대값·조건을 AST 비교; 승인된 내부 이름/인수/경로 이동 외 차이0          |

Filid는 동일 snapshot `8443d2eb6a0b1f695c373a97b990f2fa8b7095a21830650cd6b939d4bfe5ea51`에서 scan/validate/verification을 실행했다. 전체 판정은 indeterminate이며 validate finding 552개, failed15·skipped308이었다. 변경 경로의 경고는 가져온 인벤토리의 src 상대 경로·행번호·원래 위치 표기 174개와 기존 동적 매개변수 시험 1개이다. 새 소스/시험 배치의 경계 오류는 없고 importModel의 U/D/S1 단언도 통과했다. 전체 프로젝트 통과라고 주장하지 않는다. Scan complete: 552 findings.

## 내부 위치 이동에 따른 fixture 접근 변경

기존 단언의 값과 조건은 유지했다. runtime이 없던 조립 부분 레코드에는 빈 runtime만 제공했고 실제 producer reader는 전역 TARGET_IDS 대신 해당 노드 runtime의 deriveTargetIds를 읽는다. 출하 기본값의 소스 문자열 단언은 승인에 따라 engineModes.ts의 gateSelection 이름으로 옮겼다. build verifier도 같은 내부 이름을 읽는다.

- `packages/canard/schema-form/.storybook/vitest.setup.ts`
- `packages/canard/schema-form/scripts/verifyGateSelectionMode.mjs`
- `packages/canard/schema-form/src/core/__benchmarks__/fixtures/observationIdentity/cases.mjs`
- `packages/canard/schema-form/src/core/__benchmarks__/fixtures/observationIdentity/compare.mjs`
- `packages/canard/schema-form/src/core/__benchmarks__/fixtures/observationIdentity/prepare.mjs`
- `packages/canard/schema-form/src/core/__tests__/fixtures/observationIdentity/__tests__/capture.test.ts`
- `packages/canard/schema-form/src/core/engine/__tests__/fixtures/itemlessDeclarationsSource.ts`
- `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/branch/utils/__tests__/assembleObject.extras-first.test.ts`
- `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/branch/utils/__tests__/assembleObject.first-work.test.ts`
- `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/branch/utils/__tests__/assembleObject.key-identity.test.ts`
- `packages/canard/schema-form/src/core/engine/behaviors/objectBehavior/branch/utils/__tests__/fixtures/assembleObject.baseline.ts`
- `packages/canard/schema-form/src/core/engine/blueprint/effectiveSchema/__tests__/applyControlHints.test.ts`
- `packages/canard/schema-form/src/core/engine/blueprint/effectiveSchema/__tests__/mergeHintGroup.test.ts`
- `packages/canard/schema-form/src/core/engine/blueprint/effectiveSchema/__tests__/mergeSingleStaticContribution.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/evaluateGate.path-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/childSelection/buildChildSelectionRuntime.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/expectedGateSelectionCalls.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/gate-table/observeGateTableModes.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/referenceControlLayers.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/runDeriveConvergenceCase.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/helpers/observePresenceTree.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/selectChildren.metadata-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/selectChildren.plan-lookup-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.branch-switch-const.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.derive-convergence.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.derive-shadow-setup.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.derive-shadow.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.dirty-consume-cost.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.dirty-consume-verification.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.exit-direct-ownership.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-selection-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-selection-order.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-selection-switch.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-selection.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-key-order.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-loading-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-loading.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-root.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-verification.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-wheel-differential.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-wheel-budget.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-wheel-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-wheel-critical.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-wheel-differential.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-wheel-relocated.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.host-static-partition.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.host-static-shared.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.pending-exit-index.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-evaluation-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-index-equivalence.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-index.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-projection.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-readers.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-reuse-reachability.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.presence-star-name.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.remount-equivalence-presence-metrics.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.split-registration-counts.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.split-registration.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.tuple-host-registration.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.ungated-split-cost.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.write-epoch-verification.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/setupDeriveShadowEvaluation.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/setupShippedGateEvaluation.ts`
- `packages/canard/schema-form/src/core/engine/settle/utils/scratch/__tests__/DirtyPathSet.consume-differential.test.ts`
- `packages/canard/schema-form/src/core/engine/settle/utils/scratch/__tests__/DirtyPathSet.consume.test.ts`
- `packages/canard/schema-form/src/core/engine/utils/controls/__tests__/getCommittedDeclarationKey.test.ts`

## 모드 전환 시점 이동

파생 저장소를 초기화한 뒤 그 이전 schema/shape를 가진 문맥을 계속 쓰던 fixture를 고쳤다. configure는 analysis 뒤·root 생성 전에 실행하고 mutation fixture도 모드를 먼저 정한다. 이 세 파일의 순서 변경은 코디네이터가 승인했으며 모든 단언은 유지했다.

- `packages/canard/schema-form/src/core/engine/__tests__/fixtures/createTestTree.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/helpers/runGateSelectionCase.ts`
- `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.gate-table-mutations.test.ts`

## 원시 증거

`{scratch}/453-d3b-1/`에 build·프로젝트별 시험·verify·lint·단언 비교·배달 비교·힙 원시 표본과 SHA를 보존했다. 시간 원시는 다음 세 정본 실행 디렉터리와 그 아래의 환경/표본 파일에 있다.

- before: `{scratch}/perf-runs/20261027T0117-5cc588c-d3b1-final-before`
- head: `{scratch}/perf-runs/20261027T0117-5cc588c-d3b1-final-head`
- aprime: `{scratch}/perf-runs/20261027T0118-5cc588c-d3b1-final-aprime`

구독 원시는 `{scratch}/453-d3b-1/subscribed/results.json`이다. 독립 검토는 코디네이터가 배정한다.
