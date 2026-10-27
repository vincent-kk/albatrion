# B4-1 detached 접근 지점 분류

기준: B2-P2 병합 `a28b502cc` 위의 B4-1 작업 트리. 시험·벤치 fixture를 제외한 core 제품 코드의 `.detached` 접근을 대상으로 합니다. 읽기와 함께 나타난 분리 플래그 쓰기도 명시하여 빠뜨리지 않았습니다.

`detached public read`는 공개 고정 읽기와 수명·형상 경계의 무동작 검사를 포함합니다. 슬롯에 보유한 인스턴스도 계속 detached이므로 이 경계는 유지합니다. `engine assumes the state left the tree`는 원본 보유·복제·overlay·초기화·정책의 연결을 확인할 지점입니다. 이 분류는 정리 계획이며 구현 검증 완료 주장이 아닙니다. B2-P3 병합 뒤 달라진 지점을 갱신합니다.

재현: `rg -n '\.detached\b' packages/canard/schema-form/src/core --glob '!**/__tests__/**' --glob '!**/__benchmarks__/**'`.

| 위치 | 분류 | 접근 | 확인할 계약 |
| --- | --- | --- | --- |
| `src/core/engine/derive/evaluateDeriveRound/evaluateDeriveRound.ts:62` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/derive/utils/evaluate/evaluateResetInteraction.ts:41` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/derive/utils/evaluate/getRuleTargets.ts:34` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/navigation/utils/query/findNodes.ts:30` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/record/utils/captureFieldNodeChange.ts:34` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/record/utils/patchFieldNodeInteractionState.ts:10` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/arrangeFieldNodeItems.ts:113` | engine assumes the state left the tree | 읽기 | 떼어진 배열 동사의 원본과 비활성 이동 자료에 슬롯·overlay를 포함합니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/arrangeFieldNodeItems.ts:130` | engine assumes the state left the tree | 읽기 | 떼어진 배열 동사의 원본과 비활성 이동 자료에 슬롯·overlay를 포함합니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/arrangeFieldNodeItems.ts:82` | engine assumes the state left the tree | 읽기 | 떼어진 배열 동사의 원본과 비활성 이동 자료에 슬롯·overlay를 포함합니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/admitsStaticArrayTail.ts:30` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArrayTail.ts:115` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/canLoadStaticFirstTree.ts:17` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitExitPolicyValues.ts:155` | engine assumes the state left the tree | 읽기 | 기준 경로의 정책 커밋은 유지하며 슬롯이 보존할 마지막 명시 정책을 확인합니다. |
| `src/core/engine/settle/utils/commit/commitExitPolicyValues.ts:82` | engine assumes the state left the tree | 읽기 | 기준 경로의 정책 커밋은 유지하며 슬롯이 보존할 마지막 명시 정책을 확인합니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:27` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:38` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:44` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:60` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:62` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitSettlement.ts:58` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitSettlement.ts:87` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/finalizeDeriveTrace.ts:35` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:179` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:373` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:72` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/canReuseAppendedChild.ts:54` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/canReuseArrayChildren.ts:85` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/canReuseSplicedChildren.ts:61` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:78` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:378` | engine assumes the state left the tree | 쓰기 | 현재·대기 노드의 재사용과 이전 수명의 슬롯 복제를 구분합니다. |
| `src/core/engine/settle/utils/compute/childSelection/utils/createStaticEntryReuser.ts:81` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/utils/prepareStaticHost.ts:102` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/primeHost.ts:141` | engine assumes the state left the tree | 쓰기 | 슬롯 자체를 되살리지 않고 새 복제 노드만 baseline에 넣습니다. |
| `src/core/engine/settle/utils/controls/calculateStateKeys.ts:100` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/controls/calculateStateKeys.ts:86` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/controls/readFieldNodeWatchValues.ts:31` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/controls/readFieldNodeWatchValues.ts:33` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/dependencies/flushPresenceTemplates.ts:66` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/dependencies/getLivePresenceNode.ts:25` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:124` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/detached/hasLivePathKind.ts:24` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/detached/readFieldNodeInactiveValues.ts:8` | engine assumes the state left the tree | 읽기 | 공개 고정 읽기 계약을 유지하면서 보유 슬롯의 지연 읽기로 연결합니다. |
| `src/core/engine/settle/utils/detached/readFieldNodeMisfit.ts:7` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/detached/readFieldNodeMisfits.ts:8` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/input/utils/admitsSameValueWrite.ts:25` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/input/utils/prepareWriteEpoch.ts:19` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/latent/readLatentSlotSource.ts:43` | engine assumes the state left the tree | 읽기 | 부재 원본 질의에 슬롯과 overlay를 포함하되 활성 발생 제외는 유지합니다. |
| `src/core/engine/settle/utils/latentStore/hasLatentUnder.ts:23` | engine assumes the state left the tree | 읽기 | 채움 방지 원본에는 잠복 fallback과 보유 슬롯 모두를 포함합니다. |
| `src/core/engine/settle/utils/loadValues/readFieldNodeDefaultValue.ts:12` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/output/updateOutput.ts:127` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/reset/resetFieldNodeSubtree.ts:19` | engine assumes the state left the tree | 읽기 | 살아 있는 동일 종류에 대한 옛 참조 무효과와 슬롯 원본 초기화를 함께 보존합니다. |
| `src/core/engine/settle/utils/settlement/finishSettlement.ts:94` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/applyExitClearing.ts:23` | engine assumes the state left the tree | 읽기 | 정책·상속·후보 소유권은 유지하고 보존·비움 대상을 슬롯으로 확장합니다. |
| `src/core/engine/settle/utils/transition/collectFillDescendants.ts:24` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:101` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:118` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:143` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:31` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:50` | engine assumes the state left the tree | 쓰기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizePerished.ts:73` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/isReplacedLivePath.ts:29` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/readDepartingAncestorPolicy.ts:19` | engine assumes the state left the tree | 읽기 | 보유 슬롯 아래의 명시 정책과 나가는 살아 있는 조상의 상속 정책을 구별합니다. |
| `src/core/engine/settle/utils/transition/restoreArrayStructure.ts:33` | engine assumes the state left the tree | 쓰기 | 철회하는 현재 정착의 아이템과 이전 수명의 슬롯 인스턴스를 구별합니다. |
| `src/core/engine/settle/utils/transition/restoreArrayStructure.ts:44` | engine assumes the state left the tree | 쓰기 | 철회하는 현재 정착의 아이템과 이전 수명의 슬롯 인스턴스를 구별합니다. |
| `src/core/engine/settle/utils/transition/transitionSettlement.ts:159` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/transitionSettlement.ts:37` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/transitionSettlement.ts:74` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/utils/detachPerishedNode.ts:30` | engine assumes the state left the tree | 쓰기 | 소멸 원본은 삭제하되 옛 참조가 소유한 불변 비활성 읽기는 유지합니다. |
| `src/core/engine/settle/utils/transition/withdrawDetachedFills.ts:17` | engine assumes the state left the tree | 읽기 | 철회 뒤 원본을 보유하며 옛 공개 인스턴스에 새 overlay를 쓰지 않습니다. |
| `src/core/engine/settle/utils/write/releaseWrongKindHosts.ts:22` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/write/writeFieldNode.ts:57` | engine assumes the state left the tree | 읽기 | 떼어진 쓰기는 고정 인스턴스를 수정하지 않고 현재 주소의 슬롯 overlay에 반영합니다. |
| `src/core/engine/settle/utils/write/writeFieldNode.ts:87` | engine assumes the state left the tree | 읽기 | 떼어진 쓰기는 고정 인스턴스를 수정하지 않고 현재 주소의 슬롯 overlay에 반영합니다. |
| `src/core/engine/validation/utils/read/readFieldNodeErrors.ts:16` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/chain/deliverWave.ts:47` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/chain/isBatchMarking.ts:12` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchClearExternalErrors.ts:24` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchClearSubtreeState.ts:23` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchClearSubtreeState.ts:29` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchRequest.ts:20` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchSetExternalErrors.ts:23` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchSetState.ts:26` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchSetSubtreeState.ts:27` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/dispatchSetSubtreeState.ts:33` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:60` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:93` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/surface/runtime/FieldNode.ts:152` | detached public read | 쓰기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/surface/runtime/requireRuntimeFieldNode.ts:17` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
