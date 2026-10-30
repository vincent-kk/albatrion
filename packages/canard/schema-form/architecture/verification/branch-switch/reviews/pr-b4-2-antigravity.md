# B4-2 독립 코드 리뷰 판정서 (`perf/schema-form-b4-2-latent-removal`)

- **리뷰 범위**: `4c1016a02..813b32d17` (`packages/canard/schema-form`)
- **대상 워크트리**: 가지 `perf/schema-form-b4-2-latent-removal`의 작업트리
- **작성자 호칭**: Vincent
- **리뷰 일자**: 2026-10-28

---

## 1. 항목별 판정 요약표

| 항목 | 판정(PASS/FAIL/주의) | 근거(path:line) |
| :--- | :---: | :--- |
| **(1) 공개 표면(Public Surface) 불변** | **PASS** | `packages/canard/schema-form/src/index.ts:1-120` (범위 내 diff 0줄), `packages/canard/schema-form/src/__tests__/publicSurface.test.ts:1-113` (94개 공개 심볼 불변, diff 0줄), `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/public-surface.json:1-120`, `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/build.json:21-24,61` (`dist/index.d.ts` 크기 `3054` B 및 sha256 `740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6` 완전 일치) |
| **(2) 기존 테스트 변경 적격성 및 공개 기대값 보존** | **PASS** | `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/pin-removals.json:1-91` (77개 파일 add-only 핀 제거, 잔여 핀 호출 `0`), `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/test-migrations.json:1-540`, `packages/canard/schema-form/src/core/engine/settle/__tests__/fixtures/readRetainedSlotRaw.ts:14-60` (내부 `latentRaw` 조회만 슬롯 조회로 치환, 기대값 수치·문자열·객체 동일), `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.candidate-source-preservation-exit-cost.test.ts:55,109` / `settle.empty-phases.test.ts:107` / `settle.exit-direct-ownership.test.ts:56` / `settle.array-clear-cost.test.ts:57-61` (내부 함수 호출 횟수 spy만 슬롯 기제 비용에 맞게 갱신, 공개 관측 기대값 변경 `0`건) |
| **(3) 제거된 모듈 데드 레퍼런스 부재, `engineModes.slots` 제거, `*` 예외 장치 최소성** | **PASS** | `packages/canard/schema-form/src/core/engine/utils/cache/engineModes.ts:1-46` (`slots` 모드 완전 제거), `packages/canard/schema-form/src/core/engine/record/types/runtime.ts:58-159` (`slots`, `latentRaw`, `inactiveValuesMemo` 제거), `packages/canard/schema-form/src/core/engine/blueprint/utils/construction/appendChildEntries.ts:29` 및 `markCandidateDescendants.ts:18,53-54` (`containsLiteralStar` 정적 분석), `packages/canard/schema-form/src/core/engine/settle/utils/slots/isSlotEligible.ts:10` (`runtime.blueprint.root.containsLiteralStar !== true`), `packages/canard/schema-form/src/core/surface/utils/fieldNodeFactory.ts:138-145` (`containsLiteralStar === true`일 때만 `literalStarRaw`·`literalStarValuesMemo` 할당), `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/source-removal.json:1899-1938` (`literalStar*` 20개 파일 1,275줄로 격리, 일반 폼 런타임 호출 `0`) |
| **(4) 무슬롯(Slot-less) 호스트 고속 경로 및 불변성 증명** | **PASS** | `packages/canard/schema-form/src/core/engine/settle/utils/slots/prepareSourcePruner.ts:9,16-95` (`skipSourcePruning` 공유 no-op과 `hasRetainableDescendants` 정적 증명), `packages/canard/schema-form/src/core/engine/utils/cache/derivedRecords.ts:24,52,70-82` (`WeakMap` 기반 호스트별 1회 캐시 `derived.sourcePruner`), `packages/canard/schema-form/src/core/engine/settle/utils/write/writeFieldNode.ts:43`, `packages/canard/schema-form/src/core/engine/settle/utils/input/markWrite.ts:144` (쓰기 시 준비된 함수 직접 호출), `packages/canard/schema-form/src/core/engine/settle/utils/slots/pruneInactiveSources.ts:24-30` (루트 슬롯·overlay가 비어 있을 때 `pruneSlotSources` 생략) |
| **(5) 핀이 가렸던 슬롯 경로 결함 2건 수정 검증** | **PASS** | ① **OPEN-4 (동명 이종 비활성 원본의 호스트 기본값 차단)**: `packages/canard/schema-form/src/core/engine/settle/utils/transition/isMissingRaw.ts:18-26` (`node.inactiveSlots?.size`, `hasSlotOverlaySource(overlay)`, `context.pendingExits` 내 `pending.raw !== undefined && !context.filledNodes.has(pending)` 검사), `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.value-model.test.ts:524-563`. ② **비활성 쓰기 시 미선언 꼬리·extras 보존**: `packages/canard/schema-form/src/core/engine/settle/utils/slots/applySlotOverlay.ts:36-42,46-50` (`overlay.replace && !arrayInput` 가드로 `distributeArrayInput`이 계산한 `node.undeclaredValues` 꼬리 덮어쓰기 방지), `packages/canard/schema-form/src/core/engine/settle/utils/slots/createSlotValueOverlay.ts:103-199`, `packages/canard/schema-form/src/core/engine/settle/__tests__/settle.candidate-source-preservation-inactive-write.test.ts:471-522` |
| **(6) 배열 직접 이전, 분리 인스턴스 불변성, 최악 복잡도 경계** | **PASS** | `packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:121-126,175,198,240`, `packages/canard/schema-form/src/core/engine/settle/utils/slots/rekeyArraySlotBindings.ts:20-83` (2단계 충돌 없는 슬롯·overlay 이동 및 `{ ...entry, name }` 외부 바인딩 보존), `packages/canard/schema-form/src/core/engine/settle/utils/slots/restoreTransferredSlotSource.ts:21-46` (`cloneSlotSubtree(..., false)`로 보유 슬롯 불변 복제), `packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/__tests__/arrange.retained-transfer-cost.test.ts:17-60` (동일 템플릿 이동 시 `cloneSlotSubtree` 0회, `readSlotRawTree` 0회, 선형 방문 고정), `packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md:5` (이종 tuple 중첩 사슬 최악 $O(\text{영향 서브트리} \times \text{재생성 깊이})$ 한계 명시) |
| **(7) 메모리 상한 및 슬롯당 보유 바이트 ~6% 증가 원인 규명** | **PASS** | `packages/canard/schema-form/src/core/surface/__tests__/surface.slots-memory-bound.test.ts:1-60` (호스트당 보유 슬롯 수 $\le$ 방문한 선언 엔트리 수 $M$), `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/retention.json:7-32` (`switch-oneOf-80` 3슬롯: 미열람 `5336` B → 열람 후 `5656` B, `+320` B = `+6.00%`), `packages/canard/schema-form/src/core/engine/settle/utils/slots/readSlotValueEntry.ts:15-26` 및 `packages/canard/schema-form/src/core/engine/record/types/record.ts:104-106` (첫 `inactiveValues` 읽기 시 각 보유 슬롯 `FieldNode`에 지연 부착되는 `source.inactiveValueMemo` `{ path, value, entry }` + 동결된 `{ path, value }` `entry` 객체 3쌍이 `inactiveSlots` 단독 지배 크기에 합산됨; B4-1 대비는 `5416→5336` B / `5736→5656` B로 80 B 감소) |
| **(8) `importModel` 무결성 및 테스트 재배치 정당성** | **PASS** | `packages/canard/schema-form/src/__tests__/importModel.test.ts:1-319` (범위 내 diff 0줄; U outside D7 = 0, D = 0, S1 = 0, B1 = 0 실측 통과), `packages/canard/schema-form/src/core/engine/settle/__tests__/dispatch.batch.test.ts:1-19` 및 `dispatch.closing-branch.test.ts:1-16` (`write/__tests__`에서 `settle/__tests__`로 배치 이동하여 `write`는 공개 진입점 `../../write`로 호출하고 `settle` 내부 슬롯 검증 픽스처를 적법 소비), `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:195` (부모 `DETAIL.md`의 `## Structure`에 선언 완료) |
| **(9) `DETAIL.md` 선행 갱신, 주석 현재 명세 원칙, 계층 분리(`core` ↛ `app`)** | **주의** | 커밋 순서: 문서 커밋 `c032ad1d5`..`9d89f7ffa`가 코드 커밋 `c632ab5f5`에 선행하며, `0365a4d2f`는 `settle/DETAIL.md:8` 1줄 보완. 코드 주석: 현재 명세만 기술. 계층 분리: `src/core` 내 `src/app` import `0`건 (`src/core/__tests__/dependencyDirection.test.ts:232`). **주의 사항**: 일부 기존 `DETAIL.md` 하위 문단(`record/DETAIL.md:62,78`, `surface/DETAIL.md:25`, `settle/DETAIL.md:177,283`, `arrangeFieldNodeItems/DETAIL.md:36`)에 제거된 구 명칭(`latentRaw`, `inactiveValuesMemo`, `HostLatent`) 서술이 잔존함(실행 코드에는 영향 없음) |
| **(10) 리스크 목록 정리** | **PASS** | 아래 **섹션 3 (관찰 사항 및 리스크 목록)**에 우선순위 및 구체적 수정안과 함께 기재 |

---

## 2. 항목별 상세 검증 근거 (`path:line`)

### (1) 공개 표면(Public Surface) 불변 검증
- `packages/canard/schema-form/src/index.ts:1-120` 및 `packages/canard/schema-form/src/__tests__/publicSurface.test.ts:1-113`: `4c1016a02..813b32d17` 범위에서 변경이 `0`줄이며, 런타임 공개 심볼 94개 목록과 순서가 그대로 유지된다.
- `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/public-surface.json:1-120` 및 `raw/b4-2/build.json:21-24,61`: 빌드 산출물 `dist/index.d.ts`의 바이트 크기(`3054` B)와 해시(`740dc55ca2f4f0503da3a7d6f968797a37cce7305e6d0d6b4d57c34e2b9158d6`)가 B4-1 대비 변화 없음이 검증되었다.

### (2) 기존 테스트 변경 전수 대조 (`git diff -U0`)
`4c1016a02..813b32d17` 범위에서 변경·삭제·이동된 모든 테스트 파일을 `-U0` diff로 대조한 결과, 모든 변경은 다음 세 범주에 정확히 속하며 **공개 기대값(public expectation)이 변경된 사례는 0건**이다.
1. **77개 테스트 파일의 핀 제거 (`raw/b4-2/pin-removals.json:1-91`)**:
   - `pinLatentBaseline()`(41개 파일) 및 `pinSlotShipping()`(36개 파일) import와 `beforeEach`/본문 호출만 제거되었고, 픽스처 `src/core/__tests__/fixtures/pinLatentBaseline.ts` 및 `pinSlotShipping.ts`가 삭제되었다.
2. **제거된 저장소(`runtime.latentRaw`, `latentRawMetadata`, `inactiveValuesMemo`, `engineModes.slots`) 단언의 슬롯/공개 등가 마이그레이션 (`raw/b4-2/test-migrations.json:1-540`)**:
   - `src/core/engine/settle/__tests__/fixtures/readRetainedSlotRaw.ts:14-60`의 `readRetainedSlotRaw(root, path, kind)` 및 `hasRetainedSlotOwnSource(root, path, kind)`를 통해 동일한 시나리오에서 동일한 원시/객체 기대값(예: `37`, `'live'`, `123`, `{ extra: 9 }`, `['a', 'x', 'b']`)을 단언한다.
   - `src/core/engine/settle/utils/slots/__tests__/createSlotValueOverlay.test.ts:33-36` 및 `materializeInactiveSlotValues.test.ts:48-50,56-61,99-101`: `runtime.inactiveValuesMemo.get('')` 오라클 비교를 해당 시나리오의 구체적 공개 `inactiveValues` 배열 리터럴과 직접 비교하도록 변환했다.
   - `src/core/surface/__tests__/surface.slots-wildcard-*.test.ts` (5개 파일) 및 `arrange.retained-source-*.test.ts` (8개 파일): `['off', 'on', 'verify']` 모드 루프만 제거하고 본문 공개 기대값은 완전히 동일하다.
   - `*` 전용 저장소 단위 시험(`src/core/engine/settle/utils/literalStarStore/__tests__/setLatentRaw.test.ts:27-92`, `settle.array-clear.test.ts:220-252`, `static-first-load.test.ts:234-237`, `context.test.ts:26-30`, `surface.delta-application.test.ts:16-19`, `surface.test.ts:23-26`)은 `literalStarRaw` / `literalStarValuesMemo`로 대상 필드명만 치환했다.
3. **제거된 기제 전용 테스트·단언 삭제 및 내부 비용 spy 갱신**:
   - 기제 전용 테스트 파일 4개 삭제: `settle.latent-candidate-ownership-stale-policy.test.ts`, `settle.latent-candidate-ownership-stale.test.ts`, `settle.retained-slot-shadow.test.ts`, `settle.retained-slot-verify-oracle.test.ts` (및 `createSlotVerifyPair.ts`).
   - `settle.array-prefix.test.ts:281-355` 및 `settle.array-rekey.test.ts:15-130`: `runtime.latentRaw`에 직접 값을 주입해 경로 저장소 재키를 시험하던 기제 전용 블록 삭제(공개/슬롯 재키는 동 파일 하위 테스트와 `arrange.retained-source-*`가 검증).
   - 내부 구현 spy 횟수 갱신 4건(모두 비공개 내부 함수 호출 횟수 단언):
     - `src/core/engine/settle/__tests__/settle.candidate-source-preservation-exit-cost.test.ts:55,109`: 슬롯 경로가 이탈 시 `getControlLayers` 후보 소유권 재탐색을 하지 않으므로 `selectorCalls` 기대값을 `slots` → `0`으로 갱신.
     - `src/core/engine/settle/__tests__/settle.empty-phases.test.ts:107`: 일반 폼에서 `snapshotExitedPolicies`가 호출되지 않으므로 `toHaveBeenCalledTimes(1)` → `not.toHaveBeenCalled()`로 갱신.
     - `src/core/engine/settle/__tests__/settle.exit-direct-ownership.test.ts:56`: 이탈 시 후보 소유권용 추가 `getControlLayers` 호출이 제거되어 `exitCalls`를 `toBeGreaterThan(64)` → `toBeGreaterThan(0)`으로 갱신.
     - `src/core/engine/settle/arrangeFieldNodeItems/__tests__/settle.array-clear-cost.test.ts:31,57-61`: `latentRaw.pathIndex` 제거에 따라 `misfitPaths.pathIndex`를 측정하도록 변경하고, 슬롯 없는 배열 삭제가 경로 색인을 조회하지 않음을 반영해 `large.under - small.under`를 `7_000` → `0`으로 갱신.

### (3) 제거된 모듈 데드 레퍼런스, `engineModes.slots` 제거, `*` 예외 장치 최소성
- `src/core/engine/utils/cache/engineModes.ts:1-46` 및 `src/core/engine/record/types/runtime.ts:58-159`: `engineModes.slots`, `runtime.slots`, `runtime.latentRaw`, `runtime.latentRawMetadata`, `runtime.inactiveValuesMemo`, `runtime.inactiveValueEntries`가 모두 제거되었다.
- `src/core/engine/settle/utils/verify/*` (13개 파일), `src/core/engine/settle/utils/latent/*`, `src/core/engine/settle/utils/latentStore/*`, `src/core/engine/settle/utils/commit/updateInactiveValuesMemo.ts`, `src/core/engine/settle/utils/transition/applyExitClearing.ts`, `captureExitedRaw.ts`, `captureLatentDescendants.ts`, `writeLatentRaw.ts`, `src/core/engine/settle/utils/slots/serializeArraySlotSources.ts`, `applyConvertedExitPolicy.ts`, `preserveConvertedSlotMemos.ts`가 모두 삭제되었고 코드베이스 내 실행 가능한 참조가 `0`건이다.
- `*` 예외 장치는 청사진 구축 시 `appendChildEntries.ts:29` (`entry.name === '*'`)와 `markCandidateDescendants.ts:18,53-54`에서 루트 청사진에 `containsLiteralStar?: true`로 단 한 번 표기되며, `isSlotEligible.ts:10` (`runtime.blueprint.root.containsLiteralStar !== true`) 및 `fieldNodeFactory.ts:138-145`에서 이 플래그가 `true`인 폼만 `literalStar/`·`literalStarStore/`(20개 파일, 1,275줄)를 사용하도록 정밀하게 격리되어 있다.

### (4) 무슬롯(Slot-less) 호스트 고속 경로 및 정적 불변성 증명
- `src/core/engine/settle/utils/slots/prepareSourcePruner.ts:16-59`는 호스트의 첫 쓰기 시점에 `getHostDerived(node).sourcePruner`(`src/core/engine/utils/cache/derivedRecords.ts:24`)를 1회 계산하여 캐시한다.
- `hasRetainableDescendants(template, visited)` (`prepareSourcePruner.ts:62-95`)는 유한하고 불변인 `BlueprintNode` 그래프만 순회하여:
  1. `template.kind === 'virtual' || template.kind === 'array' || template.hasCandidateDescendants`이면 즉시 `true`(보유 가능)를 반환하고,
  2. 자식 선언 중 무게이트 선언(`declaration.gates.length === 0`)이 없는 엔트리나 재귀 자손이 있으면 `true`를 반환하며,
  3. 조상 체인(`prepareSourcePruner.ts:26-55`)에서도 `parent.behavior.type !== 'object'`(단, 후보 자손 없는 배열 부모는 건너뛰고 상위 조상까지 계속 확인)이거나 부모에 동명 이종 후보(`getBlueprintNodeIdentity(template) !== identity`)가 있으면 `unique = false`로 판정한다.
- 모든 조건을 통과한 호스트는 공유 no-op 함수 `skipSourcePruning = () => {}` (`prepareSourcePruner.ts:9,48-50`)를 부여받아 `writeFieldNode.ts:43` 및 `markWrite.ts:144`에서 매 쓰기마다 플래그·적격성·overlay 조회를 전혀 수행하지 않는다.
- **호스트가 사후에 보유 가능한 엔트리를 얻을 수 있는가?** 얻을 수 없다.
  - `BlueprintNode`의 `childEntries`, `prefixItems`, `item`, `hasCandidateDescendants`는 스키마 분석 시 확정되는 불변 구조이다.
  - 배열 호스트나 배열 자손을 가진 호스트는 분리된 아이템 참조 쓰기가 원본을 만들 수 있으므로 애초에 `hasRetainableDescendants`에서 `true`로 분류되어 `pruneInactiveSources`를 사용한다(`prepareSourcePruner.ts:70`).
  - 동일 청사진 내 배열 재키(`rekeyArrayRuntimePaths`)는 `BlueprintNode` 계보를 바꾸지 않으며, 이종 tuple 청사진 간 이동은 새 `FieldNode` 인스턴스를 생성(`createChildNode`)하므로 `WeakMap<object, DerivedRecord>`(`derivedRecords.ts:52,70-82`)에서 새 캐시 레코드를 사용한다.

### (5) 핀이 가렸던 슬롯 경로 공개 계약 결함 2건 수정 추적
1. **결함 1 (`settle.value-model` 26C-14 OPEN-4: 동명 이종 비활성 원본이 재진입 시 호스트 기본값을 차단해야 함)**:
   - **원인 및 수정**: 부모 객체 호스트 `g`(`default: { value: 'D' }`)가 `mode === 'string'`에서 `{ value: 'old' }`를 가진 채 비활성화되면 `root.inactiveSlots`에 `g`(자식 `value:string` 보유)가 저장된다. 이후 `mode === 'number'`로 전환되어 `g`가 복제 재진입(`cloneFromSlot` → `cloneSlotSubtree`)할 때, `g`의 자식 선택(`selectChildren.ts:278-291`)에서 이전 자식 `value(string)`은 현재 형상(`value:number`)에 선택되지 않아 `context.pendingExits`로 이동한다. 전이 단계(`fillDefaults` → `isMissingRaw(g, context)`)에서 `g`에 기본값 `{ value: 'D' }`를 채울지 판정할 때, 기존 슬롯 코드는 `g.inactiveSlots`(아직 `finalizeExits` 전이라 비어 있음)만 보고 `pendingExits`에 대기 중인 동명 이종 자식 `value(string)`을 확인하지 않아 호스트 기본값이 잘못 적용되었다.
   - **코드 근거**: `src/core/engine/settle/utils/transition/isMissingRaw.ts:18-26`에서 `node.inactiveSlots?.size`와 `node.inactiveSlotOverlays`뿐 아니라 `context.pendingExits.values()`를 순회하여 `pending.path.startsWith(node.path + '/') && pending.raw !== undefined && !context.filledNodes.has(pending)`이면 `false`를 반환하도록 수정하여 동명 이종 비활성 원본이 호스트 기본값을 정확히 차단한다(`settle.value-model.test.ts:524-563`).
2. **결함 2 (`settle.candidate-source-preservation-inactive-write`: 비활성 상태에서의 쓰기가 미선언 배열 꼬리(tail)와 객체 extras를 보존해야 함)**:
   - **원인 및 수정**: 비활성 배열 슬롯에 tuple 선언 길이보다 긴 배열(예: `['tuple', 'extra']`)을 써서 `overlay`가 생성(`createSlotValueOverlay.ts:138-154`, `replace: true`, `itemCount: 2`, `undeclaredValues: ['extra']`)된 뒤 호스트가 재진입할 때, `applySlotOverlay.ts:36-42`에서 `arrayInput`을 재구성해 `distributeArrayInput(node, items, context, true)`를 호출한다. 이때 `distributeArrayInput`은 선언 밖 꼬리(`['extra']`)를 `node.undeclaredValues`에 정상 기록한다. 그런데 직후 `applySlotOverlay.ts:46`(수정 전)의 `if (hasOwnProperty(overlay, 'undeclaredValues') || overlay.replace) node.undeclaredValues = overlay.undeclaredValues;`가 `overlay.replace === true`이고 `overlay`에 `undeclaredValues`가 없는 케이스(또는 하위 슬롯 overlay 재조합 시)에서 `distributeArrayInput`이 방금 설정한 `node.undeclaredValues`를 `undefined`로 덮어쓰는 결함이 있었다.
   - **코드 근거**: `src/core/engine/settle/utils/slots/applySlotOverlay.ts:46-50`에서 조건을 `hasOwnProperty(overlay, 'undeclaredValues') || (overlay.replace && !arrayInput)`으로 좁혀, `arrayInput` 분배가 이미 `node.undeclaredValues`에 설정한 미선언 꼬리를 보존하도록 수정했다(`settle.candidate-source-preservation-inactive-write.test.ts:471-522`). 또한 `writeSlotPath.ts:94-136` 및 `getSlotPathEntry.ts:18-53`에서 `getBlueprintNodeIdentity` 기반 비교와 `preserveCandidates` 플래그를 통해 비활성 부분/전체 쓰기와 배열 이동 시 후보 간 extras·원본 채널이 손실되지 않도록 보강했다.

### (6) 배열 직접 이전(Direct Transfer) 및 복잡도 경계
- `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:121-126,175,198,240`: 기존 `serializeArraySlotSources`를 통한 잠복 저장소 직렬화를 완전히 제거하고, 이동하는 아이템의 후보 슬롯을 `retainExitedSlot`으로 포착한 뒤 `rekeyArraySlotBindings(host, moves, context)`를 호출한다.
- `src/core/engine/settle/utils/slots/rekeyArraySlotBindings.ts:20-83`: 1단계에서 기존 슬롯·overlay를 수집·분리하고 2단계에서 새 위치의 바인딩(`getItemEntries` 매칭 또는 미선언 꼬리/타 템플릿 이동 시 `{ ...entry, name }` 외부 바인딩, `line 40-43`)으로 이전하며 `rekeySlotWriteAddresses`(`rekeySlotWriteAddresses.ts:12-56`)로 `DetachedWriteAddress` 약한 참조 셀만 갱신한다. 분리된 `FieldNode` 인스턴스 자체는 절대 변이되지 않는다.
- 동일 청사진(same-template) 배열 이동은 `arrange.retained-transfer-cost.test.ts:17-60`에서 `cloneSlotSubtree` 호출 `0`회, `readSlotRawTree` 호출 `0`회, `rekeySlotWriteAddresses` 방문 수가 이동 아이템 수에 선형 비례함이 고정되어 있다.
- 서로 다른 tuple 청사진 간 중첩 후보 사슬 이동 시 `restoreTransferredSlotSource.ts:24-35`가 각 재생성 깊이에서 `readSlotRawTree`와 `cloneSlotSubtree(..., false)`를 호출하여 최악 $O(\text{영향 서브트리} \times \text{재생성 깊이})$가 되는 한계는 `src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md:5`에 명시적으로 기록되어 있고, 일반 동일 템플릿 배열 및 일반 분기 전환에는 발생하지 않는다.

### (7) 메모리 상한 및 슬롯당 보유 바이트 ~6% 증가(`5336 → 5656 B`) 원인 규명
- **호스트당 상한 불변**: `retainExitedSlot.ts:48-60` 및 `writeSlotPath.ts:107-140`은 호스트의 선언된 `BlueprintChildEntry`를 키로 하는 `host.inactiveSlots` 및 `host.inactiveSlotOverlays` 맵에만 저장하므로, 호스트당 보유 슬롯 수는 방문한 후보 엔트리 수 $M$ 이하로 유계이다(`surface.slots-memory-bound.test.ts:15-59`).
- **3슬롯 보유 바이트 `5336 → 5656 B` (`+320 B`, `+6.00%`) 증가 원인**:
  - `packages/canard/schema-form/architecture/verification/branch-switch/raw/b4-2/retention.json:7-32`의 `switch-oneOf-80` 측정값에서, 3개 슬롯을 방문한 직후(`unread`) `root.inactiveSlots`가 단독 지배하는 바이트는 **`5336` B**이고, `void root.inactiveValues`를 1회 읽은 직후(`read`, `retention.mjs:112-114`) **`5656` B**가 되어 정확히 **`+320` B (`+6.00%`)** 증가한다(슬롯 1개당 약 `106.7` B).
  - 코드 추적 결과, `materializeInactiveSlotValues.ts:21-25` → `collectHostSlotValues.ts` → `collectSlotSourceValues.ts:44` → `readSlotValueEntry.ts:15-26`에서 첫 `inactiveValues` 읽기 시 각 보유 슬롯의 분리된 `FieldNode` 인스턴스(`source`)에 다음 메모 객체를 지연 할당하여 부착한다:
    ```ts
    const entry = Object.freeze({ path, value });
    source.inactiveValueMemo = { path, value, entry };
    ```
  - `source`(`FieldNode`)는 `root.inactiveSlots` 맵이 단독 지배(exclusively dominated)하므로, 첫 읽기 시 생성된 3개의 `{ path, value, entry }` 메모 레코드(`record.ts:104-106`의 `inactiveValueMemo?: InactiveSlotValueMemo`)와 3개의 동결된 `{ path, value }` `entry` 객체(및 V8 객체 프로퍼티 슬롯 확장분)가 `inactiveSlots` 지배 크기에 추가되어 `5336 B → 5656 B`가 된다. 이후 반복 읽기에서는 동일 값에 대해 이 메모를 $O(1)$로 재사용한다(`readSlotValueEntry.ts:16-21`).
  - 참고로 B4-1 측정값(`raw/b4-1/retention.json:7-32`: 미열람 `5416` B, 열람 후 `5736` B)과 비교하면 B4-2는 오히려 슬롯 3개 기준 `80` B 감소했다.

### (8) `importModel` 검증 및 테스트 재배치
- `src/__tests__/importModel.test.ts`는 수정되지 않았으며(diff 0줄), 실측 실행 결과 `keeps U outside D7, D and S1 import-model edges at zero` 및 `B1: organ files do not import a direct child fractal of their owner` 2개 테스트가 모두 통과한다.
- `dispatch.batch.test.ts`와 `dispatch.closing-branch.test.ts`는 `write`의 공개 진입점(`../../write`)을 호출하면서 정착 후 보유된 슬롯 상태(`readRetainedSlotRaw`)를 검증하는 통합 테스트이므로, `src/core/engine/write/__tests__/`에서 `src/core/engine/settle/__tests__/`로 이동하여 예외(exemption) 추가 없이 경계 규칙을 만족시켰고, 부모 문서인 `src/core/engine/settle/DETAIL.md:195` (`## Structure`)에 해당 배치 근거가 선언되어 있다.

### (9) `DETAIL.md` 갱신 순서, 주석 규칙, `core` ↛ `app` 분리
- **문서 선행 갱신**: `c032ad1d5`부터 `9d89f7ffa`까지 7개의 `docs(schema-form)` 커밋이 구현 커밋 `c632ab5f5` 이전에 기록되었다. 구현 직후의 `0365a4d2f`는 `src/core/engine/settle/DETAIL.md:8`에서 `prepareSourcePruner` 증명의 캐시 재사용 수명 문구 1줄을 정밀화한 것이다.
- **주석 규칙**: 변경 범위 내 코드 주석에는 `"previously"`, 커밋 해시, PR 번호 등 과거 이력 서술이 없으며 현재 명세만 기술한다.
- **계층 분리**: `src/core` 하위에서 `src/app`을 가져오는 코드는 `0`건이다. (`src/app/cache/DETAIL.md:45`의 포인터만 `settle/utils/detached/DetachedWriteAddress.ts`로 갱신됨.)
- **경미한 주의 사항**: 수정된 `DETAIL.md` 파일들의 상단 `## Requirements`는 B4-2 명세로 갱신되었으나, 파일 하단의 기존 문단 몇 곳(`record/DETAIL.md:62,78`, `surface/DETAIL.md:25`, `settle/DETAIL.md:177,283`, `arrangeFieldNodeItems/DETAIL.md:36`)에 구 명칭(`latentRaw`, `inactiveValuesMemo`, `HostLatent`) 언급이 남아 있다.

---

## 3. 결함 및 관찰 사항 (우선순위 순)

> **판정 기준 대조**: 공개 기대값 변경 없음, 분리된 인스턴스 변이 불가, 선택의 이력 의존성 없음(SETTLE-044 / GOAL-029 준수), 실행 가능한 구 기제 참조 없음, 메모리 무한 증가 없음. 따라서 FAIL 요건에 해당하는 결함은 **0건**이다. 아래 항목은 유지보수성 및 최악 복잡도 경계에 관한 경미한 관찰 사항이다.

### [P3 / 문서 정합성] 일부 `DETAIL.md` 하위 기존 문단에 제거된 런타임 필드명(`latentRaw`, `inactiveValuesMemo`, `HostLatent`) 잔존
- **근거**:
  - `packages/canard/schema-form/src/core/engine/record/DETAIL.md:62,78` (`HostLatent`, `latentRaw`, `inactiveValuesMemo` 언급)
  - `packages/canard/schema-form/src/core/surface/DETAIL.md:25` (`latentRaw`·`inactiveValuesMemo` 시드 기본 생성 언급)
  - `packages/canard/schema-form/src/core/engine/settle/DETAIL.md:177,283` (`latentRaw`, `latentRawDirty`, `inactiveValuesMemo` 언급)
  - `packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md:36` (`inactiveValuesMemo`, `latentRawDirty` 언급)
- **영향**: 런타임 실행이나 타입/테스트에는 영향이 없으나, 상단 `## Requirements`의 "잠복 직렬화·잠복 색인·커밋 전체 비활성 메모 재구성은 없다"는 현재 명세와 하위 문단 용어가 불일치한다.
- **구체적 수정안**:
  - `record/DETAIL.md:62,78` 및 `surface/DETAIL.md:25`에서 일반 경로의 원천을 `inactiveSlots`·`inactiveSlotOverlays`·`inactiveValuesCache`로, 별표 호환 경로의 선택적 런타임 저장소를 `literalStarRaw`·`literalStarValuesMemo`·`LiteralStarHostSource`로 정정한다.
  - `settle/DETAIL.md:177,283` 및 `arrangeFieldNodeItems/DETAIL.md:36`에서 `latentRaw` / `inactiveValuesMemo` 서술을 `literalStarRaw` / `literalStarValuesMemo`(별표 호환 폼 한정) 및 호스트 슬롯 기준으로 정리한다.

### [P3 / 성능 경계 리스크] 이종 tuple 청사진 간 중첩 후보 이동 시 $O(\text{영향 서브트리} \times \text{재생성 깊이})$ 비용 및 선형 바인딩 탐색
- **근거**:
  - `packages/canard/schema-form/src/core/engine/settle/utils/slots/restoreTransferredSlotSource.ts:24-35`
  - `packages/canard/schema-form/src/core/engine/settle/utils/slots/getSlotBinding.ts:21-49`
  - `packages/canard/schema-form/src/core/engine/settle/arrangeFieldNodeItems/DETAIL.md:5`
- **영향**:
  1. 서로 다른 `prefixItems` tuple 청사진 사이에서 중첩 후보를 가진 아이템이 이동할 때 각 재생성 깊이마다 `readSlotRawTree` 합성 및 `cloneSlotSubtree` 복제가 수행된다(`arrangeFieldNodeItems/DETAIL.md:5`에 알려진 한계로 기록됨).
  2. `getSlotBinding`은 정확한 `entry` 참조가 맵에 없을 때 `host.inactiveSlots` / `inactiveSlotOverlays`의 키를 순회하여 `name`과 `getBlueprintNodeIdentity(binding.node)`를 대조한다. 일반적인 스키마에서는 호스트당 비활성 슬롯 수가 작아 상수 시간에 가까우나, 한 배열 호스트 아래에 수백 개의 비활성 인덱스 슬롯이 쌓인 상태에서 이종 바인딩 조회가 반복되면 선형 탐색 비용이 발생할 수 있다.
- **구체적 수정안**:
  - 현재 설계 범위에서는 `arrangeFieldNodeItems/DETAIL.md:5`에 한계가 명확히 문서화되어 있고 동일 템플릿 이동은 `arrange.retained-transfer-cost.test.ts:17-60`으로 $O(\text{이동 아이템 수})$ 및 복제 0회가 보장되므로 즉시 변경은 불필요하다.
  - 추후 대규모 희소 비활성 배열에서 이종 바인딩 조회 최적화가 필요할 경우, `rekeyArraySlotBindings.ts:40-43`에서 목적지 위치에 선언된 동일 `BlueprintNode` 엔트리가 있으면 항상 정규 선언 엔트리를 재사용하고(현재도 `find((candidate) => candidate.node === entry.node)`로 처리 중), 외부 바인딩(`{ ...entry, name }`)에 대해서만 호스트별 보조 색인을 두거나 `restoreTransferredSlotSource`에 지연 서브트리 이전(lazy subtree transfer)을 도입할 수 있다.

---

최종 판정: PASS
