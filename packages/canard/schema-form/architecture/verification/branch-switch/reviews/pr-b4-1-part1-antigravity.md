# PR B4-1 독립 코드 리뷰 판정서 (`perf/schema-form-b4-1-slots`)

- **리뷰 범위**: `fc341d51b6afb14fba88557d11f7e251fe4d365f..f290cd04dc396aeed7728a1a42ee9eeb51a2fc04` (기준 `origin/feat/schema-form-branch-switch` merge-base `fc341d51b` 대비 23개 커밋, 247개 파일 변경, `+13,522 / -40`)
- **패키지**: `packages/canard/schema-form`
- **설계 기준**: 설계 Ⅱ "retained detached instances and clone re-entry" (`architecture/plan/branch-switch/design-ii.md` 및 457/458라운드 정정 포함), 작업 지시서(`b4-1.md`), 검증 관문(`architecture/plan/branch-switch/verification.md`), 원장 계약(`NODE-044`, `NODE-043`, `NODE-060`, `VALUE-031`, `SETTLE-044`, `GOAL-029`, `BLUEPRINT-007`, `SETTLE-001`, `ERROR-125`, `WRITE-034`)

---

## 1. 항목별 판정 요약표

| 항목 | 판정(PASS/FAIL/주의) | 근거(path:line) |
| --- | --- | --- |
| 1-1. 공개 표면 불변 (`src/index.ts`, `publicSurface.test.ts`, `dist/index.d.ts`) | **PASS** | `src/index.ts:1-61` (diff 0줄), `src/__tests__/publicSurface.test.ts:1-130` (diff 0줄), `dist/index.d.ts` (diff 0줄, SHA-256 동일 `architecture/verification/branch-switch/raw/b4-1/public-surface.json:5-6`) |
| 1-2. 기존 테스트 기대값 불변 (Add-only 핀 전수 대조) | **PASS** | 수정된 기존 테스트/픽스처 58개 파일 전수 `git diff -U0` 확인: 제거(`-`)된 단언문 0줄 (유일한 `-` 2줄은 `src/core/engine/settle/__tests__/settle.extras-single-compare.test.ts:65,78`의 공백 들여쓰기 정리), `architecture/verification/branch-switch/raw/b4-1/pins.json:517-521` (기존 단언 33,822개 전부 보존) |
| 1-3. `core` → `src/app` 역참조 금지 | **PASS** | `src/core/**` 전체에서 `src/app` import 0건 (`architecture/verification/branch-switch/raw/b4-1/public-surface.json:36-40`) |
| 1-4. 프랙탈 경계 규칙 (새 organ/파일 및 소비자 없는 index 수출 금지) | **PASS** | `src/core/engine/index.ts:1-97` (새 수출 없음), `src/core/engine/record/index.ts:28-32` (`InactiveSlotBaseline`, `InactiveSlotOverlay`, `InactiveSlotValueMemo`는 `src/core/engine/settle/`이 소비), `src/core/engine/settle/utils/slots/*` 및 `utils/verify/*`는 내부 유틸로만 구성 |
| 1-5. `DETAIL.md` 선행 커밋 및 내용 완비 | **PASS** | `4fe0fb7ea`~`4c65a8bdd`가 첫 코드 커밋 `869fa4ab5`에 선행하며 후속 정정도 각각 `DETAIL.md` 커밋이 선행. `src/core/engine/record/DETAIL.md:5-14`, `src/core/engine/settle/DETAIL.md:5-20`, `src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md:5-11`, `src/core/engine/blueprint/DETAIL.md:5-6`, `src/core/surface/DETAIL.md:5-10`에 상태 모델·불변식·비용 모델·무효화·메모리 상한·플래그 모두 명시 |
| 1-6. 주석 현행 명세 전용 원칙 (시제·날짜·커밋 참조 금지) | **PASS** | 변경된 모든 `.ts` 파일 주석 전수 검색 결과 `"previously"`, `"before B4"`, 날짜, PR/커밋 번호 참조 0건 |
| 2-(a). 슬롯 `on` 퇴장(Exit) 경로 의미론 및 잠복 포착 0 | **PASS** | `src/core/engine/settle/utils/transition/finalizeExits.ts:46-111`, `src/core/engine/settle/utils/slots/retainExitedSlot.ts:27-97`, `src/core/engine/settle/utils/detached/captureDetachedFieldNodeReads.ts:19-46` — `detached = true`, `active = false`, 고정 읽기 포착, 레지스트리/경로 색인 제거, 이전 구독 침묵 유지 + 호스트 `inactiveSlots` 삽입. 슬롯 적격 트리에서 `captureExitedRaw`·`setLatentRaw`·잠복 메타데이터 호출 0 |
| 2-(b). 재진입(Entry) 복제 및 중첩 호스트 고정 출발점 재선택 (`SETTLE-044`/`GOAL-029`) | **PASS** | `src/core/engine/settle/utils/slots/cloneFromSlot.ts:25-60`, `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:34-102`, `src/core/engine/settle/utils/slots/enterSlotClone.ts:15-50`, `src/core/engine/settle/utils/compute/primeHost.ts:154-224`, `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:385-451` — `raw`/`undeclaredValues`/중첩 `inactiveSlots` 복제, 부모/경로/레지스트리 재결합, `interactionState` `{}` 및 오류 미복사, 배열 `itemKey` 신규 발급(`host.nextItemKey++`), `entered` 등록으로 채움·`resetInteraction` 적용, 중첩 branch 전체 `shapeDirtyPaths` 등록 및 고정 baseline에서 재선택 |
| 2-(c). 비활성 중 쓰기(Overlay), 전체 교체·초기화 폐기, 배열 재배치 시 분리 인스턴스 불변성 | **PASS** | `src/core/engine/settle/utils/write/writeFieldNode.ts:91-120`, `src/core/engine/settle/utils/slots/writeSlotPath.ts:35-138`, `src/core/engine/settle/utils/slots/createSlotValueOverlay.ts:46-188`, `src/core/engine/settle/utils/slots/pruneSlotSources.ts:17-105`, `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArraySlotSources.ts:25-156`, `convertArraySlotSources.ts:29-145` — 분리 인스턴스를 직접 수정하는 경로 0건; 모든 비활성 쓰기는 호스트 소유 `inactiveSlotOverlays`에 기록 |
| 2-(d). `inactiveValues` 계산 동치성, 동결, 참조 안정성 및 분리 호스트 자체 계산 | **PASS** | `src/core/engine/settle/utils/detached/readFieldNodeInactiveValues.ts:11-26`, `src/core/engine/settle/utils/slots/materializeInactiveSlotValues.ts:20-74`, `src/core/engine/settle/utils/slots/collectHostSlotValues.ts:37-115`, `src/core/engine/settle/utils/slots/commitSlotChanges.ts:17-66` — 호스트별 지연 계산·동결·참조 재사용 완비; 분리 호스트는 자신의 보유 슬롯과 `retainedSourceOverlay`만으로 독립 계산 |
| 2-(e). `WRITE-034` 및 단일 후보 배열 clear 특이 동작(quirk) 재현 | **PASS** | `src/core/engine/settle/utils/slots/createExitSlotOverlay.ts:31-161` (특히 47-56행 단일 후보 배열 clear 시 keep 자손 포함 전량 폐기 및 88, 102행 후보 소유권 내 비활성 keep 보존), `src/core/engine/settle/utils/slots/retainClearedArrayCarriers.ts:17-44`, `src/core/engine/settle/utils/slots/applySlotOverlay.ts:74-75` |
| 2-(f). 리터럴 `*` 이름 청사진 정적 배제 및 레거시 경로 라우팅 | **PASS** | `src/core/engine/blueprint/types/node.ts:135-136`, `src/core/engine/blueprint/buildNodes/utils/children/appendChildEntries.ts:29`, `src/core/engine/blueprint/utils/features/markCandidateDescendants.ts:18-58`, `src/core/engine/settle/utils/slots/isSlotEligible.ts:10-12` — `name === '*'`을 역방향 작업 목록으로 루트까지 전파해 `root.containsLiteralStar === true`이면 트리 전체를 기존 잠복 경로로 라우팅 |
| 2-(g). `ERROR-125` (던진 게이트·가드 실패 퇴장 시 원본 보존) 불변 | **PASS** | `src/core/engine/settle/utils/transition/finalizeExits.ts:100-110` (`!context.throwingGateExits?.has(node)`를 `retainExitedSlot`의 `applyPolicy`로 전달), `src/core/surface/__tests__/surface.slots-exit-policy.test.ts:38-61` |
| 2-(h). 메모리 상한 및 참조 수명 관리 | **PASS** | `src/core/engine/record/types/record.ts:169-178`, `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:52-63` — 호스트당 `inactiveSlots` 크기는 실제 활성 방문한 `BlueprintChildEntry` 수 $M$ 이하, 재귀 깊이는 실제 값 깊이 $K$ 이하. 복제 시 중첩 `inactiveSlots`도 새 부모로 복제(`entering = false`)하여 과거 호스트 사슬 누적을 차단. 엔진 내부 전역 표는 모두 `WeakMap` 사용 |
| 3. Verify 그림자 (`slots = 'verify'`) 독립성·재진입 가드·비교 범위·출하 비용 | **PASS** | `src/core/engine/settle/utils/verify/prepareSlotShadow.ts:16-64`, `createSlotShadowSession.ts:11-52`, `compareSlotShadowCommit.ts:12-41`, `compareSlotShadowObservations.ts:25-103`, `slotShadowChannels.ts:1-53`, `vite.config.ts:114-136` — 독립 `slots: 'off'` 트리에서 최외곽 연산 재실행(`session.active` 가드로 중첩 연산 생략), 매 커밋마다 34개 공개 채널·5개 레코드 채널·4개 런타임 채널·배달 페이로드·17개 리비전 비트·동결/참조 쌍사성 검증. `on` 경로는 `root.runtime.slots !== 'verify'` 단일 비교만 수행 |
| 4. 설계 Ⅱ 6대 의미론 테스트 및 신규/특성화 테스트 완비 | **PASS** | `src/core/surface/__tests__/surface.slots-*.test.ts` (16개 파일), `src/core/engine/settle/__tests__/settle.retained-slot-*.test.ts` (12개 파일), `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.retained-source-*.test.ts` (9개 파일), `architecture/verification/branch-switch/raw/b4-1/fail-first.json:1-43` (기준 브랜치에서 실패 확인 완료) |

---

## 2. 세부 검증 근거 (Path:Line 증거)

### 2.1 범위 및 계약 (Section 1)

1. **공개 표면 불변**:
   - `packages/canard/schema-form/src/index.ts:1-61`, `packages/canard/schema-form/src/__tests__/publicSurface.test.ts:1-130`, `packages/canard/schema-form/dist/index.d.ts` 모두 기준 커밋 `fc341d51b` 대비 변경이 0줄입니다.
   - `packages/canard/schema-form/scripts/verifyGateSelectionMode.mjs:44-54`에서 빌드된 `dist/index.mjs`, `dist/index.node.mjs`, `dist/index.cjs` 내 `modes.slots`의 출하 기본값이 `'on'`임을 AST로 검증합니다.
2. **프랙탈 경계 및 의존 방향**:
   - `src/core` 하위에서 `src/app`을 가져오는 코드는 0건입니다.
   - `packages/canard/schema-form/src/core/engine/record/index.ts:28-32`에 추가된 `InactiveSlotBaseline`, `InactiveSlotOverlay`, `InactiveSlotValueMemo` 타입은 `packages/canard/schema-form/src/core/engine/settle/utils/slots/` 내 모듈들이 소비하며, 소비자 없는 index 수출은 없습니다.
3. **`DETAIL.md` 선행 커밋 및 현행 명세 주석**:
   - 커밋 로그 확인 결과 `4fe0fb7ea` → `84a935145` → `61860ed9b` → `2c1c97324` → `fa1b91dbb` → `4c65a8bdd`의 `DETAIL.md` 및 테스트 커밋이 첫 구현 커밋 `869fa4ab5`에 선행하며, 이후 배열/패킹/정책/리터럴 `*` 보완 커밋에서도 각각 `DETAIL.md` 커밋(`ccd932447`, `839d22ca4`, `1e3564f22`, `49ec73266`, `623ee74fe`, `c336f802a`, `eeb03c69c`, `e5114048c`, `b20f649f0`)이 구현 커밋에 앞섭니다.
4. **기존 테스트 파일 수정 내역 전수 목록 (총 58개 파일, 모두 Add-only 핀)**:
   - 모든 기존 테스트 파일에서 단언문(`expect`/`assert`) 수정이나 삭제는 **0건**입니다 (`git diff fc341d51b..f290cd04d --diff-filter=M -U0`로 전수 확인).
   - **공용 픽스처 및 설정 파일 (4개)**:
     1. `src/core/engine/__tests__/fixtures/createTestTree.ts:33`: `slots: 'off'` 추가 (기본 단위 테스트 트리를 레거시 잠복 기준 경로에 고정)
     2. `src/core/engine/settle/__tests__/fixtures/runChildSelectionHistory.ts:132`: `Reflect.set(root.runtime, 'slots', 'off')` 추가
     3. `src/core/engine/settle/__tests__/setupDeriveShadowEvaluation.ts:17`: `engineModes.setMode('slots', 'verify')` 추가 (`test:verify`에서 슬롯 그림자 검증 활성화)
     4. `src/core/engine/settle/__tests__/settle.derive-shadow-setup.test.ts:8`: `expect(engineModes.slots).toBe('verify')` 추가
   - **`pinLatentBaseline()` (`slots = 'off'`) 추가 파일 (37개 — 내부 잠복 저장소·원시 키·과거 인스턴스 되살림 내부 구현을 직접 검사하는 기존 테스트)**:
     5. `src/core/engine/settle/__tests__/selectChildren.head-differential.test.ts:19-20`
     6. `src/core/engine/settle/__tests__/settle.array-legacy-ports.test.ts:17-18`
     7. `src/core/engine/settle/__tests__/settle.array-lifecycle.test.ts:28-29`
     8. `src/core/engine/settle/__tests__/settle.array-scaling.test.ts:24-25`
     9. `src/core/engine/settle/__tests__/settle.array-verbs.test.ts:21-22`
     10. `src/core/engine/settle/__tests__/settle.candidate-source-preservation-controls.test.ts:13-14`
     11. `src/core/engine/settle/__tests__/settle.candidate-source-preservation-exit-cost.test.ts:11-12`
     12. `src/core/engine/settle/__tests__/settle.candidate-source-preservation-gate.test.ts:10-11`
     13. `src/core/engine/settle/__tests__/settle.candidate-source-preservation-inactive-write.test.ts:15-16`
     14. `src/core/engine/settle/__tests__/settle.candidate-source-preservation-stale.test.ts:10-11`
     15. `src/core/engine/settle/__tests__/settle.exit-direct-ownership.test.ts:19-20`
     16. `src/core/engine/settle/__tests__/settle.extras-single-compare.test.ts:57-58` (65, 78행의 `-` 2줄은 6칸→4칸 들여쓰기 공백 정리)
     17. `src/core/engine/settle/__tests__/settle.gate-table-mutations.test.ts:18-19`
     18. `src/core/engine/settle/__tests__/settle.item-fold-selection.test.ts:15-16`
     19. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership-controls.test.ts:14-15`
     20. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership-enclosing.test.ts:11-12`
     21. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership-inactive-move.test.ts:11-12`
     22. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership-policy.test.ts:10-11`
     23. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership-retention.test.ts:11-12`
     24. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership-stale-policy.test.ts:10-11`
     25. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership-stale.test.ts:10-11`
     26. `src/core/engine/settle/__tests__/settle.latent-candidate-ownership.test.ts:11-12`
     27. `src/core/engine/settle/__tests__/settle.scalar-latent-scope.test.ts:13-14`
     28. `src/core/engine/settle/__tests__/settle.static-same-value-write-fallback.test.ts:16-17`
     29. `src/core/engine/settle/__tests__/settle.union-fold-latent.test.ts:14-15`
     30. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.candidate-source-preservation-exits.test.ts:13-14`
     31. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.candidate-source-preservation-tail-scope.test.ts:12-13`
     32. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.candidate-source-preservation-tail.test.ts:13-14`
     33. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-absent-destinations.test.ts:11-12`
     34. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-inactive-source.test.ts:14-15`
     35. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-live-descendants.test.ts:14-15`
     36. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-nested-array.test.ts:12-13`
     37. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-replay-contract.test.ts:17-18`
     38. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-replay-mutations.test.ts:18-19`
     39. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-root.test.ts:14-15`
     40. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-unrelated-slots.test.ts:14-15`
     41. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership.test.ts:16-17`
     42. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-append-fallback.test.ts:103-104`
     43. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-clear-cost.test.ts:47-48`
     44. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-detached-reference.test.ts:18-19`
     45. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-detached-reset-address.test.ts:15-16`
     46. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-pop-fallback.test.ts:119-120`
     47. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-pop.test.ts:24-25`
     48. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.detached-write-address.test.ts:15-16`
     49. `src/core/engine/write/__tests__/dispatch.batch.test.ts:29-30`
     50. `src/core/engine/write/__tests__/dispatch.closing-branch.test.ts:14-15`
     51. `src/core/surface/__tests__/context.test.ts:10-11`
     52. `src/core/surface/__tests__/detached.test.ts:14-15`
   - **`pinSlotShipping()` (`slots = 'on'`) 또는 혼합 핀 추가 파일 (20개 — 내부 호출 횟수 스파이 또는 강제 변이 주입으로 그림자 이중 실행을 제외해야 하는 테스트, 모두 현행 명세 주석 동반)**:
     53. `src/core/__tests__/regression/r7-port-notify.test.ts:13-14` (`pinSlotShipping`)
     54. `src/core/engine/__tests__/delivery.h5b-observation.test.ts:23-24` (`pinSlotShipping`)
     55. `src/core/engine/settle/__tests__/settle.delivery-watch-exit.test.ts:20-21` (`pinSlotShipping`)
     56. `src/core/engine/settle/__tests__/settle.dirty-consume-verification.test.ts:13-14` (`pinSlotShipping`)
     57. `src/core/engine/settle/__tests__/settle.feature-pass-scaling.test.ts:18-19` (`pinSlotShipping`)
     58. `src/core/engine/settle/__tests__/settle.non-wheel-preservation.test.ts:17-18` (`pinSlotShipping`)
     59. `src/core/engine/settle/__tests__/settle.presence-evaluation-counts.test.ts:17-18` (`pinSlotShipping`)
     60. `src/core/engine/settle/__tests__/settle.presence-reuse-reachability.test.ts:16-17` (`pinSlotShipping`)
     61. `src/core/engine/settle/__tests__/settle.static-same-value-write-cost.test.ts:22-23` (`pinSlotShipping`)
     62. `src/core/engine/settle/__tests__/settle.write-epoch-verification.test.ts:14-15` (`pinSlotShipping`)
     63. `src/core/engine/settle/__tests__/settle.write-epoch.test.ts:18-19,178-179` (`pinSlotShipping` + latent fallback 케이스 `pinLatentBaseline`)
     64. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.latent-candidate-ownership-destinations.test.ts:13-14` (`pinSlotShipping`)
     65. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-append-cost.test.ts:44-45` (`pinSlotShipping`)
     66. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-clear.test.ts:14-15` (`pinSlotShipping`)
     67. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-pop-cost.test.ts:44-45` (`pinSlotShipping`)
     68. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-splice-cost.test.ts:28-29` (`pinSlotShipping`)
     69. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-splice-fallback.test.ts:25-26,125-126,174-175` (`pinSlotShipping` + `pinLatentBaseline`)
     70. `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-splice.test.ts:27-28,62-63` (`pinLatentBaseline` + `pinSlotShipping`)
     71. `src/core/engine/settle/loadFieldNodeAtMount/__tests__/static-first.h5b-memo-lifetime.test.ts:15-16` (`pinSlotShipping`)
     72. `src/core/engine/settle/utils/input/__tests__/markWrite.static-spec.test.ts:13-14` (`pinSlotShipping`)
     73. `src/core/engine/validation/__tests__/validation.reset.test.ts:14-15` (`pinSlotShipping`)
     74. `src/core/engine/write/__tests__/dispatch.all-failures.test.ts:18-19` (`pinSlotShipping`)
     75. `src/core/engine/write/__tests__/dispatch.budget.test.ts:17-18` (`pinSlotShipping`)
     76. `src/core/engine/write/__tests__/dispatch.state.test.ts:942-943` (`pinSlotShipping`)

---

### 2.2 의미론 코드 추적 (Section 2)

#### (a) 슬롯 `on` 퇴장(Exit) 경로
- **분리 및 레지스트리 해제**: `src/core/engine/settle/utils/transition/finalizeExits.ts:46-88`에서 퇴장하는 서브트리의 모든 노드에 대해 `captureDetachedFieldNodeReads(departing)`를 호출하고 `departing.detached = true`, `departing.active = false`로 전환한 뒤 `getGateRegistry(context.root.runtime).remove(node)` 및 `misfitPaths` 제거를 수행합니다.
- **고정 읽기 및 구독 침묵**: `captureDetachedFieldNodeReads.ts:19-46`에서 `misfit`, `misfits`, `defaultValue`, `visible`, `readOnly`, `disabled`, `errors`를 마지막 커밋 값으로 얼려 `runtime.detachedReads`(`WeakMap`)에 저장합니다. 슬롯 적격 트리에서는 퇴장 시점에 `inactiveValues`를 즉시 배열로 만들지 않고(`!isSlotEligible(runtime)`일 때만 즉시 캡처), 나중에 분리된 노드의 `inactiveValues`를 실제로 읽을 때 보유 슬롯에서 지연 생성합니다(`readFieldNodeInactiveValues.ts:11-26`). 또한 `deliverWave.ts:47` 및 `markCommitDeliveries.ts:72,179,373`에서 `node.detached` 노드는 배달에서 제외되어 옛 참조의 구독은 침묵합니다.
- **잠복 포착 0 및 슬롯 삽입**: `finalizeExits.ts:97-111`에서 `isSlotEligible(context.root.runtime)`가 참이면 `retainExitedSlot`을 호출합니다. `retainExitedSlot.ts:27-97`은 `captureExitedRaw`나 `setLatentRaw`를 전혀 호출하지 않고, `DetachedWriteAddress.retain(node, { path, order }, runtime)`에 쓰기 주소를 남긴 뒤 `createExitSlotOverlay`로 정책을 계산합니다. 보존 대상(`result.retain === true`)이면 호스트의 `inactiveSlots.set(entry, node)`에 분리된 인스턴스를 삽입하고, clear 등으로 보존할 원본이 전혀 없으면(`!result.retain`) `inactiveSlots`와 `inactiveSlotOverlays`에서 해당 엔트리를 제거합니다.

#### (b) 재진입(Entry) 복제 및 중첩 호스트 재선택
- **후보 풀 복제**: `primeHost.ts:154-224`와 `selectEntryStep.ts:385-451`은 같은 정착 안에서 임시 이탈한 노드의 되살림(`pendingExits`)과 이전 커밋에서 분리된 `inactiveSlots` 복제를 명확히 구분합니다. `inactiveSlots.get(entry)`가 있으면 `cloneFromSlot(node, entry, slotSource, context, slotOverlay)`를 호출합니다.
- **채널 복제 및 상태 초기화**: `cloneSlotSubtree.ts:34-102`는 `host.runtime.nodeFactory(entry, host, host.runtime, source)`로 **새 `FieldNode` 인스턴스**를 생성합니다(`fieldNodeFactory.ts:53-70`에서 `source`의 검증된 정적 스키마만 초기 스키마로 전달). 생성자 초기화에 의해 새 노드는 `interactionState = {}`, `revisionLedger = EMPTY_REVISION_LEDGER`, `deliveryInitialized = false`, `detached = false`, `disposed = false`, `interactionReset = 0`으로 시작하며 외부 오류·검증 오류(`runtime.nodeErrors`, `runtime.validationErrors`는 이전 노드 키에 귀속)나 구독 리스너(`runtime.listeners`)를 이어받지 않습니다.
- **원본 채널·배열 키·중첩 슬롯 재결합**: `cloneSlotSubtree.ts:45-64`에서 `raw`, `undeclaredValues`, `itemCount`, `nextItemKey`, `inactiveValueMemo`를 복사하고, 배열 아이템인 경우 `node.itemKey = host.nextItemKey++`로 **새 `itemKey` nonce**를 발급합니다(라인 49). `source.inactiveSlots`가 있으면 각 중첩 슬롯도 `entering = false`로 복제하여 `clonedSlot.parent`가 새 복제 호스트를 가리키게 재결합합니다(라인 52-63).
- **`entered` 등록·채움·`resetInteraction` 및 중첩 호스트 고정 출발점 재선택 (`SETTLE-044`/`GOAL-029`)**:
  - `enterSlotClone.ts:15-50`에서 `entering === true`인 모든 복제 노드를 `context.entered.add(node)`, `context.changedNodes.add(node)`, `context.dirtyPaths.add(node.path)`에 등록하고 게이트 레지스트리에 바인딩합니다. 따라서 `transitionSettlement.ts:60-156`에서 `raw === undefined`인 복제 노드에 기본값 채움 규칙이 그대로 적용되고, `evaluateResetInteraction.ts:86`에서 `state.entered.has(target)`에 의해 `controls.resetInteraction`이 작동합니다.
  - 특히 `enterSlotClone.ts:27`에서 모든 중첩 branch 호스트에 `context.shapeDirtyPaths.add(node.path)`를 설정합니다. 이후 `computeNode.ts:117-226`가 중첩 호스트를 방문할 때 `shapeDirtyPaths.has(node.path)`가 참이므로 빠른 경로를 건너뛰고 `primeHost` 및 `selectChildren`을 실행합니다. 이때 중첩 호스트에 있던 이전 활성 자식 중 이번 정착의 게이트에서 탈락한 자식은 `selectChildren.ts:276-294`에서 `pendingExits`로 빠져나가며(빌렸던 `changedRaw` 표식도 `finalizeRestoredSlotRaw.ts:10-25`에서 정리), 새로 켜진 분기는 중첩 호스트의 `inactiveSlots` 후보 풀에서 복제되거나 새로 생성됩니다. 즉 슬롯은 직전 형상이 아니라 후보 풀로만 소비됩니다.

#### (c) 비활성 쓰기(Overlay), 전체 교체·초기화 폐기, 배열 재배치
- **분리 인스턴스 불변성 전수 확인**:
  - `writeFieldNode.ts:91-120`: 분리된 노드(`node.detached === true`)에 대한 쓰기는 `DetachedWriteAddress.read(node)`로 현재 주소를 조회한 뒤 `writeSlotPath`를 호출하고 즉시 반환합니다. 분리된 `node`의 `raw`, `undeclaredValues`, `local`, `emit`, `children`을 수정하는 코드는 전혀 없습니다.
  - `writeSlotPath.ts:35-138`: 활성 트리를 따라 내려가다 비활성 경계 호스트를 만나면 `createSlotValueOverlay`로 `InactiveSlotOverlay` 객체를 생성해 `host.inactiveSlotOverlays.set(entry, nextOverlay)`에만 저장합니다. 같은 경로·같은 종류가 현재 활성인 경우(`current && !current.detached && isSameKind`) 옛 참조의 쓰기는 무동작으로 무시되고, 다른 종류가 활성인 경우 다른 비활성 후보들의 슬롯과 오버레이를 정리합니다(`clearOtherSlotKinds.ts:13-48`).
  - `markSlotChange.ts:18-52`: 정착 밖의 분리된 쓰기(`!context`)가 `inactiveSlotOverlays`를 갱신할 때, 아직 커밋되지 않은 변경 이전 상태를 `host.inactiveSlotBaselines`에 보존합니다. 따라서 살아 있는 호스트의 `inactiveValues`는 다음 커밋(`commitSlotChanges.ts:17-66`) 전까지 직전 커밋 결과를 그대로 반환합니다.
- **전체 교체 및 `load`/`reset` 폐기**:
  - 전체 교체 쓰기(`markWrite.ts:136`)와 `resetFieldNodeSubtree.ts:56`, `loadFieldNodeAtMount.ts:102`는 `pruneLatentRaw`를 호출하며, `pruneLatentRaw.ts:30-31`이 `pruneSlotSources(context.root, path, names, context)`를 호출해 해당 범위의 `inactiveSlots`와 `inactiveSlotOverlays`를 모두 폐기합니다.
- **배열 재배치 (이동 및 B4-1 일회 잠복 변환 fallback)**:
  - `arrangeFieldNodeItems.ts:110-149` 및 `applyArraySlots.ts:144-169`, `applyArrayTail.ts:96-119`, `applyArraySplice.ts:112-122`에서:
    1. 같은 템플릿으로 이동하는 살아남은 아이템 호스트는 자신의 `inactiveSlots`와 `inactiveSlotOverlays`를 그대로 달고 이동하며, `rekeySlotSubtree.ts:19-83`가 보유 슬롯 내부 노드들의 `DetachedWriteAddress`와 `inactiveValueMemo` 키만 새 경로·문서 순서로 갱신합니다(**분리된 노드 인스턴스의 `node.path`는 절대 변경하지 않음**).
    2. 튜플 위치 변경 등으로 살아남은 아이템 레코드가 재생성되거나 비활성 아이템 자리가 이동할 때, 템플릿이 같으면 `rekeyArraySlotSources.ts:25-156`가 슬롯과 오버레이를 새 호스트/새 인덱스 엔트리로 직접 이전합니다.
    3. 후보가 있는 자리가 다른 튜플 청사진이나 미선언 꼬리로 이동하는 경우에 한해 `convertArraySlotSources.ts:29-145`가 해당 배열 범위의 보유 슬롯+오버레이를 잠복 저장소로 일회 변환한 뒤 기존 무충돌 재키(`rekeyArrayRuntimePaths`)를 수행합니다(설계 Ⅱ가 허용한 B4-1 fallback). 변환 중에도 분리된 인스턴스는 읽기만 수행하며 변이시키지 않습니다.
    4. 진짜 삭제(`pop`, `remove`, `clear`, 길이 단축)되는 아이템은 `detachPerishedNode.ts:17-42`에서 소멸 전에 `captureDetachedFieldNodeReads`가 분리된 호스트의 `inactiveValues`를 포착한 뒤 `clearPerishedSlotSources.ts:14-48`가 호스트의 슬롯 맵을 비우므로, 옛 참조의 고정된 `inactiveValues` 읽기는 보존되면서 메모리는 해제됩니다.

#### (d) `inactiveValues` 계산 동치성 및 참조 안정성
- `materializeInactiveSlotValues.ts:20-74`는 호스트별 첫 읽기에 `collectHostSlotValues`를 호출해 문서 순서(`compareLatentOrders`)로 정렬하고, 각 `{ path, value }` 항목을 `Object.freeze`한 뒤 `host.inactiveValueMemo`에 캐시하여 값이 `Object.is`로 같으면 이전 동결 항목 참조를 재사용합니다.
- 완성된 배열은 `Object.freeze` 후 `host.inactiveValuesCache`에 저장되며, 모든 항목이 직전 캐시 배열과 동일한 참조이면 직전 동결 배열 참조 자체를 그대로 반환합니다(라인 57-68).
- 분리된 호스트(`host.detached === true`)는 `host.retainedSourceOverlay`와 자신이 보유한 `host.inactiveSlots`만 읽어 계산하고 `runtime.latentRaw`를 합치지 않으므로, 퇴장 이후 루트나 형제에서 일어난 오버레이·재진입·초기화가 분리된 호스트의 지연 읽기에 영향을 주지 않습니다.

#### (e) `WRITE-034` 및 단일 후보 배열 clear 특이 동작(quirk) 재현
- `createExitSlotOverlay.ts:47-56`: `clear && node.behavior.type === 'array' && !hasSlotCandidateOwner(node)`일 때 `{ overlay: { replace: true, raw: undefined, undeclaredValues: undefined, itemCount: 0 }, hasSource: false, retain: false }`를 반환하여, 배열 아래에 명시적 `unsetOnInactive: false` 자손이 있더라도 모두 버리고 재진입 시 길이 0이 되는 기존 동작을 정확히 재현합니다.
- `createExitSlotOverlay.ts:84-110`: 후보 소유권(`hasSlotCandidateOwner(node) === true`)이 있는 배열이 clear될 때는 퇴장 시점에 활성이었던 자식에는 `activeClear = true`를 전달해 포착하지 않고, 이미 비활성 슬롯이었던 `node.inactiveSlots`에는 `activeClear = false`를 전달해 명시적 `unsetOnInactive: false` 원본만 살아남게 합니다. 이후 재진입 시 `applySlotOverlay.ts:74-75` → `retainClearedArrayCarriers.ts:17-44`가 배열 길이는 0(`children = []`)으로 두면서 보존된 비활성 운반자만 `node.inactiveSlots`에 유지합니다.
- 객체 호스트가 clear될 때는 `createExitSlotOverlay.ts:112-160`이 활성 자식과 비활성 슬롯 모두에서 명시적 `unsetOnInactive: false` 자손을 보존하고 나머지 자손과 호스트의 `raw`/`undeclaredValues`에는 지움 표식(`replace: true`)을 남깁니다.

#### (f) 리터럴 `*` 이름 청사진 정적 배제
- `appendChildEntries.ts:29`에서 `if (name === '*') node.containsLiteralStar = true;`로 직계 프로퍼티 이름이 정확히 `'*'`인 템플릿을 표시합니다(배열 아이템 템플릿 경로의 `/*`나 `'*suffix'`, `'slash/*'`는 해당하지 않음).
- `markCandidateDescendants.ts:18-58`에서 역방향 템플릿 간선(`childEntries`, `item`, `itemCandidates`, `prefixItems`, `prefixItemCandidates`)을 따라 부모 템플릿과 재귀 `$ref` 템플릿까지 `containsLiteralStar = true`를 전파합니다. `'*'`가 없는 일반 스키마에서는 추가 그래프 할당이나 순회가 전혀 없습니다.
- `isSlotEligible.ts:10-12`는 `runtime.slots !== 'off' && runtime.blueprint.root.containsLiteralStar !== true`를 검사하므로, 청사진 어디에든 리터럴 `'*'` 프로퍼티가 존재하면 루트의 `containsLiteralStar`가 `true`가 되어 폼 전체가 변경 없는 기존 잠복 경로로 라우팅됩니다.

#### (g) `ERROR-125` 경로 불변
- `finalizeExits.ts:100-110`에서 `!context.entered.has(node) && !context.throwingGateExits?.has(node)`를 계산하여 `retainExitedSlot`의 `applyPolicy` 인수로 전달합니다. 게이트 식이나 `if` 가드가 예외를 던져 퇴장한 노드는 `applyPolicy === false`가 되어 `unsetOnInactive: true`여도 원본 슬롯이 비워지지 않고 그대로 보존됩니다.

#### (h) 메모리 상한 및 해제 조건
- 호스트의 `inactiveSlots`와 `inactiveSlotOverlays`는 `BlueprintChildEntry`를 키로 하는 `Map`입니다. `BlueprintChildEntry`는 청사진의 유한한 정적 선언 간선이므로 호스트당 슬롯 수는 실제로 한 번이라도 활성 방문한 엔트리 수 $M$을 넘을 수 없습니다.
- 같은 엔트리가 재진입 후 다시 퇴장하면 `inactiveSlots.set(entry, node)`가 이전 분리 인스턴스를 덮어쓰므로 이전 수명이 누적되지 않습니다(`surface.slots-memory-bound.test.ts:10-28`).
- 복제 시 `cloneSlotSubtree.ts:52-63`에서 중첩 `inactiveSlots`의 노드들도 새 복제 호스트를 `parent`로 하여 복제하므로, 새 활성 트리가 과거 분리 호스트를 `parent` 사슬로 붙잡아 두는 메모리 누수가 없습니다.
- 엔진 내부 보조 저장소(`detachedReads`, `DetachedWriteAddress`, `slotShadowSessions`, `derivedRecords`)는 모두 `WeakMap`을 사용합니다. 따라서 분리된 옛 `FieldNode` 인스턴스는 (1) 현재 호스트의 `inactiveSlots`에 최신 후보 원본으로 들어 있는 동안, 또는 (2) 외부 호출자가 변수/클로저로 직접 참조를 쥐고 있는 동안에만 메모리에 유지되며, 재진입/교체/초기화/삭제 후 외부 참조가 없으면 GC 대상이 됩니다.

---

### 2.3 Verify 그림자 검증기 (Section 3)

- **독립 `off` 기준 트리**: `createSlotShadowSession.ts:11-52`가 동일한 청사진과 초기 설정으로 `slots: 'off'`인 독립 런타임과 루트 노드를 생성합니다.
- **최외곽 연산 재생 및 재진입 가드**: 모든 공개 쓰기/배열/상태/오류/초기화/맥락 진입점(`dispatchSetValue.ts:28`, `dispatchBatch.ts:23`, `dispatchMount.ts:27`, `dispatchResetForm.ts:25`, `dispatchResetSubtree.ts:22`, `dispatchContextChange.ts:22`, `dispatchSetState.ts:21`, `dispatchSetSubtreeState.ts:20`, `dispatchClearSubtreeState.ts:18`, `dispatchSetExternalErrors.ts:20`, `dispatchClearExternalErrors.ts:18`, `finishFieldNodeInput.ts:18`, `dispatchPush.ts:21`, `dispatchPop.ts:18`, `dispatchInsert.ts:22`, `dispatchRemove.ts:21`, `dispatchUpdate.ts:22`, `dispatchClear.ts:18`)에서 `prepareSlotShadow`를 호출합니다.
  - `prepareSlotShadow.ts:30`의 `if (session.active) return undefined;` 재진입 가드가 리스너 되먹임·`batch` 내부 호출·`injectTo` 등 중첩 진입에서의 중복 재생을 막습니다.
  - 사용자 콜백(`updater`, `batch` 함수, `onChange`, 구독 리스너)은 실제 트리에서만 1회 실행되고, 그림자 트리에는 해석된 입력값만 전달됩니다(`synchronizeSlotShadowInputs.ts:6-80`, `settle.retained-slot-verify-delivery.test.ts:24-59`).
- **커밋별 및 연산 종료 시점 전수 비교**:
  - `commitSettlement.ts:294`에서 매 커밋마다 `compareSlotShadowCommit(context.root)`를 호출하여 그림자 트리의 동일 커밋 스냅숏(`expectedCommits`)과 대조하고, 최외곽 연산 종료 시 `prepareSlotShadow.ts:44-63`에서 최종 상태(정착을 만들지 않는 분리된 쓰기·상태/오류 쓰기 포함)를 한 번 더 대조합니다.
  - 비교 항목(`compareSlotShadowObservations.ts:25-103`, `slotShadowChannels.ts:1-53`):
    - 공개 채널 34개(`raw`, `undeclaredValues`, `value`, `outputValue`, `inactiveValues`, `defaultValue`, `jsonSchema`, `state`, `globalState`, `errors`, `globalErrors`, `watchValues`, `misfit`, `misfits`, `diagnostics`, `context`, `active`, `visible`, `enabled`, `readOnly`, `disabled`, `required`, `nullable`, `type`, `strategy`, `name`, `escapedName`, `path`, `depth`, `isRoot`, `rootNode`, `parentNode`, `children`)와 교차 커밋 객체 참조 안정성(`session.references` / `reverseReferences` 쌍사 검증)
    - 레코드 채널 5개(`detached`, `disposed`, `interactionReset`, `pendingDelivery`, `pendingNonSettleDelivery`) 및 배달 페이로드/옵션
    - 모든 노드의 17개 이벤트 비트별 `revisionLedger` 값
    - `inactiveValues` 배열 및 각 항목의 `Object.isFrozen` 여부
    - 과거에 분리된 모든 옛 노드 참조(`session.nodes`에 영구 보존)의 고정 읽기 일치 여부
- **`test:verify` 통합 및 출하 경로 비용**:
  - `vite.config.ts:114-136`의 `verify-unit`, `verify-render` 프로젝트가 `setupDeriveShadowEvaluation.ts:17`(`engineModes.setMode('slots', 'verify')`)를 로드하여 `test:verify` 실행 시 전체 테스트 스위트에서 그림자 검증이 수행됩니다.
  - 출하 모드(`slots = 'on'`)에서 `prepareSlotShadow.ts:21`은 `if (root.runtime.slots !== 'verify') return undefined;` 한 줄, `compareSlotShadowCommit.ts:15`는 `if (root.runtime.slots !== 'verify' && root.runtime.slots !== 'off') return;` 한 줄로 즉시 반환하므로 할당이나 추가 연산 비용이 없습니다.

---

### 2.4 테스트 검증 (Section 4)

1. **설계 Ⅱ의 6대 의미론 계약 테스트 존재 및 기준 브랜치 실패 확인**:
   - `surface-slot-new-instance`: `src/core/surface/__tests__/surface.slots-new-instance.test.ts:6-22`
   - `surface-slot-old-subscriptions`: `src/core/surface/__tests__/surface.slots-old-subscriptions.test.ts:6-25`
   - `surface-slot-interaction-reset`: `src/core/surface/__tests__/surface.slots-interaction-reset.test.ts:6-26`
   - `surface-slot-array-keys`: `src/core/surface/__tests__/surface.slots-array-keys.test.ts:6-23`
   - `surface-slot-frozen-reads`: `src/core/surface/__tests__/surface.slots-frozen-reads.test.ts:6-27`
   - `surface-slot-memory-bound`: `src/core/surface/__tests__/surface.slots-memory-bound.test.ts:10-66`
   - 기준 브랜치(`fc341d51b` / `a28b502cc`)에서 먼저 실행하여 `inactiveSlots` 부재 및 `setLatentRaw` 호출로 실패함을 확인한 기록이 `architecture/verification/branch-switch/raw/b4-1/fail-first.json:1-43`에 보존되어 있습니다.
2. **세부 시나리오별 테스트 커버리지**:
   - **잠복 포착 0 (`setLatentRaw` / `captureExitedRaw` 0회, `updateInactiveValuesMemo` 0회)**: `src/core/engine/settle/__tests__/settle.retained-slot-capture.test.ts:17-39`, `src/core/engine/settle/__tests__/settle.retained-slot-lazy-read.test.ts:17-34`
   - **복제 동등성 및 중첩 선택**: `src/core/engine/settle/utils/slots/__tests__/cloneFromSlot.test.ts:20-93`, `src/core/surface/__tests__/surface.slots-nested-selection.test.ts:5-68`, `src/core/engine/settle/__tests__/settle.retained-slot-verify-nested.test.ts:7-110`
   - **오버레이 및 전체 교체/초기화 폐기**: `src/core/surface/__tests__/surface.slots-overlay.test.ts:6-85`, `src/core/engine/settle/utils/slots/__tests__/createSlotValueOverlay.test.ts:20-118`, `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.retained-source-pruning.test.ts:16-65`
   - **배열 재배치 및 변환**: `src/core/surface/__tests__/surface.slots-array-rearrangement.test.ts:31-70`, `src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.retained-source-*.test.ts` (9개 파일)
   - **`inactiveValues` 동치성·분리 호스트·참조 안정성**: `src/core/surface/__tests__/surface.slots-inactive-values.test.ts:5-55`, `src/core/engine/settle/__tests__/settle.retained-slot-host-cache.test.ts:8-49`, `src/core/engine/settle/utils/slots/__tests__/materializeInactiveSlotValues.test.ts:15-104`
   - **리터럴 `*` 배제 및 wildcard-hidden 호환성 보존**: `src/core/engine/blueprint/utils/features/__tests__/markCandidateDescendants.literalStar.test.ts:5-97`, `src/core/engine/settle/__tests__/settle.retained-slot-wildcard.test.ts:13-137`, `src/core/surface/__tests__/surface.slots-wildcard-*.test.ts` (5개 파일)
   - **`WRITE-034` 및 배열/객체 clear 정책**: `src/core/surface/__tests__/surface.slots-exit-policy.test.ts:5-61`, `src/core/engine/settle/__tests__/settle.retained-slot-array-policy.test.ts:8-71`, `src/core/engine/settle/__tests__/settle.retained-slot-verify-policy.test.ts:8-108`

---

## 3. 결함 목록 (Defects)

- **검출된 결함 없음 (0건)**.
  - 분리된 인스턴스가 변이되는 경로 없음.
  - 리터럴 `*` 배제 범위 밖에서 레거시 잠복 경로와 공개 결과가 달라지는 도달 가능 케이스 없음.
  - 자식 선택이 이력 의존적(history-dependent)으로 변하는 경로 없음.
  - 수정된 기존 테스트 기대값 없음.
  - 메모리가 무한 증식하는 경로 없음.

---

## 4. 리스크 목록 (Risk List — Section 5)

판정에 영향을 주는 결함은 없으나, B4-2 후속 단계 및 운영 관점에서 유의할 잠재 리스크는 다음과 같습니다.

1. **[중간] B4-1 배열 튜플/꼬리 이동 시 슬롯-잠복 표현 공존 복잡도 (`convertArraySlotSources.ts:29-145`, `collectHostSlotValues.ts:94-110`)**:
   - 후보가 있는 배열 아이템이 다른 튜플 청사진이나 미선언 꼬리로 이동할 때 B4-1에서는 슬롯을 잠복 저장소(`latentRaw` + `inactiveValueEntries`)로 일회 변환하여 두 표현이 한 트리 안에 공존할 수 있습니다.
   - 현재 `collectHostSlotValues.ts`와 `pruneSlotSources.ts`, `retainExitedSlot.ts`(`deleteLatentSlotKind`)가 양쪽 저장소의 우선순위와 정리를 정합하게 맞추고 있으나, 상태 전이 조합이 복잡하므로 `settle/DETAIL.md:9` 및 `arrangeFieldNodeItems/DETAIL.md:7-10`에 명시된 대로 **B4-2에서 잠복 변환 없이 직접 슬롯 이전으로 단일화**하는 작업을 누락 없이 완수해야 합니다.
2. **[낮음] 중첩 호스트 복제 시 직전 활성 자식의 선제 복제 후 탈락 비용 (`cloneSlotSubtree.ts:65-99`, `finalizeRestoredSlotRaw.ts:10-25`)**:
   - `cloneSlotSubtree`는 보유 슬롯의 `source.children`(퇴장 당시 활성이었던 중첩 자식들)도 함께 복제하여 `node.structure`에 넣은 뒤 `enterSlotClone`에서 중첩 호스트를 `shapeDirtyPaths`로 표시합니다.
   - 만약 비활성 동안 외부 입력이 바뀌어 중첩 호스트의 게이트가 다른 분기를 선택하게 되면, 선제 복제된 직전 분기 자식들은 같은 정착의 `selectChildren`에서 `pendingExits`로 빠져나가 다시 슬롯으로 돌아갑니다.
   - `finalizeRestoredSlotRaw.ts:13-24`가 임시 복제 노드가 빌렸던 `changedRaw` 표식을 정확히 회수하고 `primeHost`/`selectChildren`이 고정 출발점에서 재선택하므로 **관측 가능한 결과나 선택 이력 독립성에는 영향이 없으나**, 비활성 중 중첩 분기가 자주 바뀌는 깊은 트리에서는 불필요한 선제 복제 비용이 발생할 수 있습니다.
3. **[낮음] 리터럴 `*` 프로퍼티 스키마의 전체 트리 잠복 경로 후퇴 (`markCandidateDescendants.ts:53-57`, `isSlotEligible.ts:10-12`)**:
   - 스키마의 어느 한 곳에라도 이름이 정확히 `'*'`인 프로퍼티가 있으면 `root.containsLiteralStar === true`가 되어 해당 폼 전체가 슬롯 최적화를 쓰지 않고 레거시 잠복 경로로 동작합니다. 의미론적 호환성(wildcard query exclusion quirk 보존)을 위한 의도된 정적 배제이며, B4-2에서 잠복 경로를 제거하기 전에 소유자(Vincent)의 정책 결정이 필요합니다.
4. **[낮음] `createTestTree.ts:33`의 `slots: 'off'` 고정**:
   - B4-1 코디네이터 결정에 따라 `createTestTree` 픽스처는 `slots: 'off'`로 고정되어 있어, 이를 사용하는 기존 단위 테스트 133개는 기본 `unit` 프로젝트에서는 `off` 경로를 실행하고 `test:verify`(`setupDeriveShadowEvaluation.ts:17`에서 `engineModes.setMode('slots', 'verify')` 설정)에서만 `createTestTree`의 명시적 `slots: 'off'`가 우선합니다. `pins.json:515`에 기록된 대로 B4-2에서 `createTestTree`를 `slots: 'on'`으로 전환하고 잠복 전용 단언을 정리해야 합니다.

---

최종 판정: PASS
