# PR B4-1 Part 2 (Candidate 2 Delta) 독립 코드 리뷰 판정서 (`perf/schema-form-b4-1-slots`)

- **리뷰 범위**: `f290cd04dc396aeed7728a1a42ee9eeb51a2fc04..cdfc65725ac12159d3d7dca107faf5c710f30baf` (총 15개 커밋, 54개 파일 변경, `+43,697 / -61`; 제품 코드 3개 파일 수정, 신규 단위 테스트 3개 파일 추가, `DETAIL.md` 2개 파일 갱신, 검증 도구 4개 파일 갱신 및 후보 1 측정 증거 보존)
- **패키지**: `packages/canard/schema-form`
- **설계 기준**: 설계 Ⅱ "retained detached instances and clone re-entry" (`architecture/plan/branch-switch/design-ii.md`), 선행 판정서 (`pr-b4-1-part1-antigravity.md`)

---

## 1. 항목별 판정 요약표

| 항목 | 판정(PASS/FAIL/주의) | 근거(path:line) |
| --- | --- | --- |
| 1-(a). 후보 1 보장 유지: 분리 인스턴스 불변성 및 비활성 자식 재귀 복제 유지 (공유 실험 미적용 확인) | **PASS** | `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:28,60-89` — `nodeFactory`로 새 인스턴스 생성, `source.inactiveSlots`(`60-66`행)와 `source.children`(`68-89`행) 모두 재귀적으로 `cloneSlotSubtree`를 호출해 새 부모(`node`)로 복제하며 비활성 자식 인스턴스 공유는 전혀 반영되지 않음. `writeFieldNode.ts:99-149`, `retainExitedSlot.ts:49-65`도 분리 인스턴스 직접 변이 0건 |
| 1-(b). 후보 1 보장 유지: 재진입 복제 계약 (새 인스턴스, 새 `itemKey`, 빈 `interaction`/`errors`, 중첩 호스트 `shapeDirtyPaths`) | **PASS** | `src/core/surface/utils/fieldNodeFactory.ts:95-114` (`interactionState = {}`, 빈 `revisionLedger`/오류), `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:50-51` (`node.itemKey = host.nextItemKey++`), `cloneSlotSubtree.ts:98-99` (`if (node.behavior.strategy === 'branch') context.shapeDirtyPaths.add(node.path)`) |
| 1-(c). 후보 1 보장 유지: 오버레이 의미론, `WRITE-034`/단일 후보 배열 clear 특이 동작, `*` 배제, `load`/`reset`/전체 교체 폐기, 배열 재배치, `inactiveValues` 동치성 | **PASS** | `src/core/engine/settle/utils/slots/applySlotOverlay.ts:18-81`, `createExitSlotOverlay.ts:47-56,84-160`, `isSlotEligible.ts:10-12`, `pruneSlotSources.ts:17-89`, `rekeyArraySlotBindings.ts`, `serializeArraySlotSources.ts:30-156`, `materializeInactiveSlotValues.ts:15-56`, `commitSettlement.ts:248-286` |
| 2-(a). 제거된 게이트 레지스트리 등록의 중복성 입증 및 단일 등록·경로 색인·분리 읽기 정합성 | **PASS** | `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:91-101`에서 선제 `register(node)` 제거. 최상위 복제본은 `primeHost.ts:134` 및 `selectEntryStep.ts:334`에서 선택 시점에 등록되고, 중첩 자손은 `cloneSlotSubtree.ts:97-99`의 `dirtyPaths`/`shapeDirtyPaths`를 통해 `computeNode.ts:168,220`이 내려가며 각 선택 단계에서 등록되거나 게이트 평가 시 `getGateRegistry.ts:222`(`locate` → `this.register(node)`)가 바인딩함. `hasLivePathKind.ts:16-26`은 색인 미비 시 `find(node.rootNode, path)`로 폴백해 분리 쓰기/리셋 판정이 항상 정확함 |
| 2-(b). 활성 복제 진입 시 `DetachedWriteAddress` 할당 제거의 정당성 및 옛 참조 쓰기 주소 추적 | **PASS** | `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:29-36` — `entering === true`인 활성 복제본은 아직 분리된 적이 없으므로 `DetachedWriteAddress` 셀과 `getLatentOrder` 배열을 만들지 않고, 실제 퇴장 시 `retainExitedSlot.ts:42-48`(또는 `captureExitedRaw.ts:134`)에서 포착함. 옛 분리 참조(`source`)의 주소 셀은 그대로 유지되며, 비활성 후보 복제(`!entering`)와 배열 이동(`rekeySlotWriteAddresses.ts:15-20`)은 기존 `transfer`+`retain` 규칙을 그대로 유지함 (`settle.retained-slot-active-address.test.ts:12-48`) |
| 2-(c). 평문 쓰기(Plain write) 슬롯 적격성 검사(20→10) 및 슬롯 발행(10→0) 단축, 쓰기 커널 프레임(2→1) 단축의 무결성 | **PASS** | `src/core/engine/settle/utils/commit/commitSettlement.ts:40,248-289` — `context.exited.size > 0`을 `isSlotEligible(runtime)`보다 먼저 검사(10회 절감), 출하 모드(`runtime.slots === 'on'`)에서 진입/퇴장/더러운 슬롯 호스트/잠복 저장소가 모두 비어 있으면 `isSlotEligible`(추가 10회 절감)와 `commitSlotChanges`(10→0회) 및 `compareSlotShadowCommit` 호출을 건너뜀 (`settle.retained-slot-plain-write.test.ts:15-31`). `writeFieldNode.ts:48-65,207-227` — `writeFieldNode`가 직접 커널 본문을 실행하고 `slots === 'verify'` 최외곽 연산에서만 `writeFieldNodeWithShadow`로 분기하여 출하 경로 래퍼 프레임을 제거함 |
| 3. 기존 테스트 파일 불변 (Add-only 핀) 및 공개 표면 불변 (`src/index.ts`, `dist/index.d.ts`) | **PASS** | `git diff f290cd04d..cdfc65725 -- 'packages/canard/schema-form/src/**/*.test.ts'` 확인 결과 기존 테스트 파일 수정 0건, 신규 테스트 3개 파일만 추가(`settle.retained-slot-active-address.test.ts`, `settle.retained-slot-plain-write.test.ts`, `settle.retained-slot-registration-cost.test.ts`). `src/index.ts`, `dist/index.d.ts`, `src/__tests__/publicSurface.test.ts` diff 0줄 |
| 4. 계측/도구 커밋 `cdfc65725` 격리성 (제품 코드 영향 0, 출하 경로 잔존 타이머 0) | **PASS** | `cdfc65725`는 `architecture/verification/branch-switch/tools/b4-1/{retention,stages,summarize}.mjs` 및 `architecture/verification/design-optimization/tools/profile/branch-switch/collectProfiles.mjs` 4개 검증 스크립트만 수정하며 `src/` 하위 변경은 0줄임 |
| 5. `DETAIL.md` 선행 갱신 및 현행 명세 전용 주석 원칙 | **PASS** | 코드 커밋 `b40089fec`, `68077387d`, `04d56b5a9`, `0778bd955` 각각에 대해 문서 커밋 `3e163608c`, `2027e3a1d`~`bd35f7a30`, `06a11ca14`, `a7902cd6a`가 모두 선행함 (`src/core/engine/record/DETAIL.md:5`, `src/core/engine/settle/DETAIL.md:5-14`). 수정된 모든 `.ts` 주석은 현행 명세만 기술함 |
| 6. 메모리 안전성 (슬롯 없는 호스트 평문 쓰기 및 복제 경로의 잔존 참조·불필요 프로퍼티 부재) | **PASS** | `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:41-49`, `commitSettlement.ts:260-261` — `source.inactiveValueMemo !== undefined`일 때만 복사하고 커밋 시 `node.inactiveValueMemo !== undefined`일 때만 `undefined`로 지우며, `source.inactiveValuesCache?.length`가 있을 때만 캐시와 `inactiveValuesDirty = true`를 설정해 빈 `EMPTY_VALUES` 캐시나 미사용 프로퍼티가 활성 복제본에 own property로 생기지 않음 (`settle.retained-slot-active-address.test.ts:50-77`, `settle.retained-slot-plain-write.test.ts:33-44`) |

---

## 2. 세부 검증 근거 (Path:Line 증거)

### 2.1 후보 1 보장 유지 및 "비활성 자식 인스턴스 공유" 실험 미적용 확인 (항목 1)

1. **비활성 자식 인스턴스 공유 실험 미적용(재귀 복제 유지) 확인**:
   - `packages/canard/schema-form/src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:28`에서 `host.runtime.nodeFactory(entry, host, host.runtime, source)`를 호출해 항상 새로운 `FieldNode` 인스턴스를 생성합니다.
   - `cloneSlotSubtree.ts:60-66`에서 `source.inactiveSlots?.size`가 있으면 새 `Map`을 만들고 각 `[binding, retained]`마다 `cloneSlotSubtree(node, binding, retained, context, false)`를 재귀 호출하여 `parent`가 새 `node`로 결합된 복제본을 넣습니다.
   - `cloneSlotSubtree.ts:68-89`에서 `source.children`에 대해서도 각 자식마다 `cloneSlotSubtree(node, binding, child, context, entering)`를 재귀 호출합니다.
   - 따라서 스크래치에서 시도되었던 "비활성 자식 인스턴스 재귀 복제 생략/공유" 실험은 코드에 일절 반영되지 않았으며, 분리된 인스턴스와 활성 트리 사이에 어떤 노드 참조나 부모 사슬도 공유되지 않습니다.
2. **후보 1의 모든 의미론 보장 유지**:
   - 새 배열 `itemKey` 발급(`cloneSlotSubtree.ts:50-51`), 빈 `interactionState`/`errors`/구독 상태(`fieldNodeFactory.ts:95-114`), 중첩 분기 호스트 `shapeDirtyPaths` 등록(`cloneSlotSubtree.ts:98-99`), 오버레이 적용(`cloneFromSlot.ts:23-24`, `applySlotOverlay.ts:18-81`), `WRITE-034` 및 단일 후보 배열 clear 특이 동작(`createExitSlotOverlay.ts:47-56`), 리터럴 `*` 정적 배제(`isSlotEligible.ts:10-12`), `load`/`reset`/전체 교체 시 `pruneSlotSources` 폐기(`pruneLatentRaw.ts:30-31`), 배열 재배치 시 슬롯 이동 및 일회 잠복 변환(`applyArraySlots.ts:47-49,170-171,191`), `inactiveValues` 계산 동치성(`materializeInactiveSlotValues.ts:15-56`)이 후보 1과 동일하게 유지됩니다.

### 2.2 제거된 등록·주소 단계의 중복성 및 정확성 추적 (항목 2)

1. **`cloneSlotSubtree` 내 게이트 레지스트리 선제 등록 제거 (`0778bd955`)**:
   - 후보 1에서는 `cloneSlotSubtree.ts` 말미에서 `entering === true`인 모든 복제 노드에 대해 즉시 `getGateRegistry(node.runtime).register(node)`를 호출했습니다. 그러나 `cloneFromSlot`을 호출하는 두 진입점인 `primeHost.ts:121` → `134`행과 `selectEntryStep.ts:321` → `334`행에서 이미 선택된 자식(`child`)에 대해 `if (context.hasGates) getGateRegistry(child.runtime).register(child);`를 호출하므로 최상위 복제본은 매번 중복 등록되고 있었습니다.
   - 중첩 자손 복제본의 경우:
     - `cloneSlotSubtree.ts:97-99`가 모든 진입 복제 노드를 `context.dirtyPaths`에, 모든 중첩 branch 호스트를 `context.shapeDirtyPaths`에 추가합니다.
     - 부모 선택 직후 `computeNode.ts:168-171` 및 `220-238`(`selectEntryStep.ts:386`의 `computeChild(child)`)이 더러운 중첩 branch 호스트로 내려가 `primeHost`와 `selectChildren`을 실행합니다(`prepareStaticHost.ts:66-105`와 `createStaticEntryReuser.ts:79`는 `prior`의 기존 자식 참조와 일치할 때만 정적 재사용을 허용하므로, 새로 복제된 자식은 반드시 일반 선택 단계를 거침).
     - 중첩 호스트의 선택 과정에서 살아남는 자식은 `primeHost.ts:134` 또는 `selectEntryStep.ts:334`에서 정확히 1회 등록되고, 중첩 게이트에서 탈락한 임시 복제 자식은 애초에 레지스트리에 등록조차 되지 않고 `pendingExits`로 정리됩니다.
     - 설령 선택 단계 이전에 게이트 평가가 노드를 조회하더라도 `getGateRegistry.ts:217-222`의 `locate(node, gate, edgeName)` 첫 줄이 `this.register(node)`를 호출(이미 등록된 경우 `getGateRegistry.ts:163`의 `if (this.byPath.get(node.path)?.node === node) return;`으로 즉시 반환)하므로 누락될 수 없습니다.
   - **분리 참조 읽기/쓰기 지점(`hasLivePathKind`) 영향 확인**:
     - `src/core/engine/settle/utils/detached/hasLivePathKind.ts:16-26`은 `getGateRegistry(node.runtime).hasRegisteredPathKind(path, kind)`가 `undefined`를 반환하면 `find(node.rootNode, path)`로 활성 트리를 직접 탐색합니다. 또한 `GateRegistry.hasRegisteredPathKind`(`getGateRegistry.ts:156-159`)는 정착이 끝난 시점에 모든 활성 노드가 선택 단계에서 등록되어 있으므로 동일한 결과를 반환하며, 정착 도중에는 `writeFieldNode`나 `resetFieldNodeSubtree`의 외부 분리 진입이 발생하지 않습니다.
2. **활성 복제본의 `DetachedWriteAddress` 및 `getLatentOrder` 지연 포착 (`b40089fec`)**:
   - `DetachedWriteAddress`는 `writeFieldNode.ts:102`(`if (!scalarWrite && node.detached)`)와 `readRawTree.ts:39,51`에서 **분리된(`detached === true`) 노드**의 현재 쓰기 주소를 조회할 때만 읽힙니다.
   - 후보 1에서는 `cloneSlotSubtree`가 `entering === true`인 새 활성 복제본에 대해서도 즉시 `getLatentOrder` 배열과 `{ path, order }` 셀을 할당해 `DetachedWriteAddress.retain(node, address, node.runtime)`를 호출했으나, 활성 노드는 `node.detached === false`이므로 활성 수명 동안 이 셀을 읽는 곳이 없습니다. 이후 해당 복제본이 실제로 퇴장할 때 `retainExitedSlot.ts:42-48`(또는 잠복 폴백 시 `captureExitedRaw.ts:134`)에서 새 `{ path, order }`를 만들어 덮어쓰고 있었습니다.
   - 후보 2(`cloneSlotSubtree.ts:29-36`)는 `if (!entering)`일 때만(즉, 중첩 `inactiveSlots`에 남아 있는 비활성 후보를 새 부모 아래로 복제할 때만) `DetachedWriteAddress.transfer(source, address, node.runtime)`와 `DetachedWriteAddress.retain(node, address, node.runtime)`를 수행합니다.
   - 이때 옛 분리 참조 `source`가 활성 복제본(`entering === true`)으로 복제될 때는 `source`의 `DetachedWriteAddress` 셀이 변경되지 않고 그대로 유지되므로, 옛 참조 `source`에 대한 이후 비활성 쓰기는 계속 `/value` 등 올바른 주소로 라우팅됩니다(`settle.retained-slot-active-address.test.ts:36-44`에서 검증 완료).
3. **평문 쓰기(Plain write) 빠른 경로 및 쓰기 커널 직접 진입 (`68077387d`, `04d56b5a9`)**:
   - `commitSettlement.ts:40`: `if (!isSlotEligible(runtime) && context.exited.size > 0)`을 `if (context.exited.size > 0 && !isSlotEligible(runtime))`로 단락 평가 순서를 바꾸어, 퇴장 노드가 없는 평문 쓰기마다 호출되던 `isSlotEligible` 1회를 제거했습니다.
   - `commitSettlement.ts:248-286`: 출하 모드(`runtime.slots === 'on'`)에서 `context.entered.size === 0 && context.exited.size === 0 && runtime.latentRaw.size === 0 && !runtime.slotDirtyHosts?.size && !runtime.latentRawDirty && !runtime.inactiveValueEntries?.size && runtime.inactiveValuesMemo.size === 0`이면 비활성 슬롯이나 잠복 상태에 어떠한 변화도 없으므로 `isSlotEligible` 검사 및 `commitSlotChanges` 호출 전체를 건너뜁니다.
     - 만약 이전에 이미 비활성 슬롯이 존재하던 트리에서 평문 쓰기가 일어나면 `runtime.slotDirtyHosts?.size`도 0이고 `entered`/`exited`도 0이므로 `commitSlotChanges`를 부르지 않으며, 기존 호스트들의 `inactiveValuesCache`는 유효한 상태로 그대로 보존됩니다.
     - 만약 정착 밖에서 분리된 참조에 비활성 쓰기(`writeSlotPath` → `markSlotChange`)가 일어났거나 배열 이동(`rekeySlotWriteAddresses`)이 일어났다면 `runtime.slotDirtyHosts`에 호스트가 추가되어 있으므로(`markSlotChange.ts:41`, `rekeySlotWriteAddresses.ts:54`) 가드를 통과해 `commitSlotChanges`가 정상 실행됩니다.
     - 만약 `slots === 'off'`이거나 `slots === 'verify'`이면 `runtime.slots !== 'on'`이 참이 되어 기존과 동일하게 분기 및 `compareSlotShadowCommit(context.root)`(`288`행)가 실행됩니다.
   - `writeFieldNode.ts:48-65,207-227`: 기존에 `writeFieldNode`가 래퍼이고 `writeFieldNodeBody`를 호출하던 2단 프레임 구조를 바꾸어, `writeFieldNode` 자체가 본문을 실행하고 `if (root.runtime.slots === 'verify' && !getSlotShadowSession(root)?.active)`일 때만 `writeFieldNodeWithShadow`를 호출합니다. `writeFieldNodeWithShadow`는 `prepareSlotShadow`로 그림자 트리를 먼저 실행(`session.active = true`가 되어 중첩/본문 호출에서는 재진입하지 않음)한 뒤 다시 `writeFieldNode`를 호출하고 `finally`에서 `complete?.(failure)`를 실행하므로, `verify` 모드의 최외곽 재생·오류 대조·최종 상태 대조 의미론은 100% 동일하면서 출하 경로(`slots === 'on'`)의 함수 호출 프레임만 1단계 줄였습니다.

### 2.3 기존 테스트 파일·공개 표면·계측 커밋·문서·메모리 검증 (항목 3 ~ 6)

- **항목 3 (기존 테스트 및 공개 표면)**:
  - `f290cd04d..cdfc65725` 범위에서 기존 테스트 파일은 단 한 줄도 수정되지 않았으며, 신규 테스트 파일 3개(`settle.retained-slot-active-address.test.ts`, `settle.retained-slot-plain-write.test.ts`, `settle.retained-slot-registration-cost.test.ts`)만 추가되었습니다(3개 파일 모두 Vitest 실행 통과 확인).
  - `src/index.ts`, `dist/index.d.ts`, `src/__tests__/publicSurface.test.ts`는 변경이 0줄입니다.
- **항목 4 (계측 커밋 `cdfc65725`)**:
  - `cdfc65725`는 `architecture/verification/` 하위의 프로파일링·요약 스크립트 4개(`retention.mjs`, `stages.mjs`, `summarize.mjs`, `collectProfiles.mjs`)만 수정하여 `ledger` 패스(`wrapped.mjs`)와 `supplemental` 패스(`supplemental.mjs`)의 프로파일 파일명 덮어쓰기를 방지하고 힙 스냅숏의 숫자 ID 재사용 한계를 명시한 커밋입니다. 제품 코드(`src/`)에는 어떤 타이머나 변경도 남기지 않았습니다.
- **항목 5 (`DETAIL.md` 선행 갱신 및 주석 규칙)**:
  - 모든 코드 변경 커밋 전에 해당 요구사항을 반영한 `DETAIL.md` 커밋이 먼저 기록되었습니다(`3e163608c` → `b40089fec`, `2027e3a1d`/`93a71700a`/`5d83b6705`/`bd35f7a30` → `68077387d`, `06a11ca14` → `04d56b5a9`, `a7902cd6a` → `0778bd955`).
  - 추가·수정된 모든 주석에 과거 시제, 날짜, 커밋/단계 번호 참조가 없음을 확인했습니다.
- **항목 6 (메모리 및 히든 클래스/프로퍼티 영향)**:
  - `cloneSlotSubtree.ts:41-49`에서 `source.inactiveValueMemo !== undefined`일 때만 `node.inactiveValueMemo`를 복사하고(같은 정착 내 중첩 선택에서 다시 탈락하는 경우 기존 발행 항목 참조 동일성을 유지하기 위함), 최종적으로 활성 상태로 정착되면 `commitSettlement.ts:260-261`에서 `if (node.inactiveValueMemo !== undefined) node.inactiveValueMemo = undefined;`로 참조를 해제합니다. 아예 메모가 없던 노드에는 불필요한 own property(`inactiveValueMemo: undefined`)조차 생성하지 않습니다.
  - 또한 `source.inactiveValuesCache?.length && !hasAdditionalInactiveSources(source)`일 때만 `inactiveValuesCache`와 `inactiveValuesDirty = true`를 복사하므로, 분리 시점에 빈 `EMPTY_VALUES`(`length === 0`)가 읽혔던 잎/호스트를 복제할 때 불필요한 캐시 프로퍼티가 활성 노드에 붙지 않습니다.

---

## 3. 결함 목록 (Defects)

- **검출된 결함 없음 (0건)**.
  - 후보 1의 의미론적 보장이 깨진 곳 없음.
  - 분리된 인스턴스가 변이되는 경로 없음.
  - 기존 테스트 기대값 수정 없음.
  - 비활성 자식 인스턴스 공유 실험 코드 유입 없음.
  - 게이트 레지스트리 및 쓰기 주소 등록 모호성 없음.

---

최종 판정: PASS
