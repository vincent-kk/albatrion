# B4-1 detached 접근 지점 분류

기준: B2-P3 기록 병합 `fc341d51b` 위의 B4-1 구현입니다. 시험·벤치 fixture를 제외한 core 제품 코드의 `.detached` 접근을 분류하며, 분리 플래그 쓰기도 포함합니다.

`detached public read`는 공개 고정 읽기와 수명·형상 경계의 무동작 검사를 뜻합니다. `engine assumes the state left the tree`는 원본 보유·복제·overlay·초기화·정책에 슬롯을 포함하여 검토할 지점입니다. 슬롯 원본은 계속 detached이며 활성 구조·등록·구독의 대상이 아닙니다. 별표 이름을 품는 청사진 폼은 기존 잠복 경로를 보존합니다. 독립 그림자, 공개 수명·배열·Source B·reset 시험과 실제 배달 비교가 실행 근거이며 최종 통과 범위는 결과 문서에 기록합니다.

재현: `rg -n '\.detached\b' packages/canard/schema-form/src/core --glob '!**/__tests__/**' --glob '!**/__benchmarks__/**'`.

접근 지점: 107개.

| 위치 | 분류 | 접근 | 확인할 계약 |
| --- | --- | --- | --- |
| `src/core/engine/derive/evaluateDeriveRound/evaluateDeriveRound.ts:62` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/derive/utils/evaluate/evaluateResetInteraction.ts:41` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/derive/utils/evaluate/getRuleTargets.ts:34` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/navigation/utils/query/findNodes.ts:30` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/record/utils/captureFieldNodeChange.ts:34` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/record/utils/patchFieldNodeInteractionState.ts:10` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/arrangeFieldNodeItems.ts:83` | engine assumes the state left the tree | 읽기 | 떼어진 배열 동사의 원본과 비활성 이동 자료에 슬롯·overlay를 포함합니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/arrangeFieldNodeItems.ts:114` | engine assumes the state left the tree | 읽기 | 떼어진 배열 동사의 원본과 비활성 이동 자료에 슬롯·overlay를 포함합니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/arrangeFieldNodeItems.ts:131` | engine assumes the state left the tree | 읽기 | 떼어진 배열 동사의 원본과 비활성 이동 자료에 슬롯·overlay를 포함합니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/admitsStaticArrayTail.ts:30` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArrayTail.ts:115` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/canLoadStaticFirstTree.ts:17` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitExitPolicyValues.ts:82` | engine assumes the state left the tree | 읽기 | 기준 경로의 정책 커밋은 유지하며 슬롯이 보존할 마지막 명시 정책을 확인합니다. |
| `src/core/engine/settle/utils/commit/commitExitPolicyValues.ts:155` | engine assumes the state left the tree | 읽기 | 기준 경로의 정책 커밋은 유지하며 슬롯이 보존할 마지막 명시 정책을 확인합니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:27` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:38` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:44` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:60` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts:62` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitSettlement.ts:63` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitSettlement.ts:92` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitSettlement.ts:251` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/commitSettlement.ts:264` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/finalizeDeriveTrace.ts:35` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:72` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:179` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:373` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/canReuseAppendedChild.ts:54` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/canReuseArrayChildren.ts:85` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/canReuseSplicedChildren.ts:61` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:78` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:399` | engine assumes the state left the tree | 쓰기 | 현재·대기 노드의 재사용과 이전 수명의 슬롯 복제를 구분합니다. |
| `src/core/engine/settle/utils/compute/childSelection/utils/createStaticEntryReuser.ts:81` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/childSelection/utils/prepareStaticHost.ts:102` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/compute/primeHost.ts:162` | engine assumes the state left the tree | 쓰기 | 슬롯 자체를 되살리지 않고 새 복제 노드만 baseline에 넣습니다. |
| `src/core/engine/settle/utils/controls/calculateStateKeys.ts:86` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/controls/calculateStateKeys.ts:100` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/controls/readFieldNodeWatchValues.ts:31` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/controls/readFieldNodeWatchValues.ts:33` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/dependencies/flushPresenceTemplates.ts:66` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/dependencies/getLivePresenceNode.ts:25` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:124` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/detached/hasLivePathKind.ts:24` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/detached/readFieldNodeInactiveValues.ts:12` | engine assumes the state left the tree | 읽기 | 공개 고정 읽기 계약을 유지하면서 보유 슬롯의 지연 읽기로 연결합니다. |
| `src/core/engine/settle/utils/detached/readFieldNodeMisfit.ts:7` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/detached/readFieldNodeMisfits.ts:8` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/input/utils/admitsSameValueWrite.ts:25` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/input/utils/prepareWriteEpoch.ts:19` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/latent/readLatentSlotSource.ts:51` | engine assumes the state left the tree | 읽기 | 부재 원본 질의에 슬롯과 overlay를 포함하되 활성 발생 제외는 유지합니다. |
| `src/core/engine/settle/utils/latent/readRawTree.ts:29` | engine assumes the state left the tree | 읽기 | 일반 슬롯 폼의 raw는 슬롯과 overlay에서 읽고, 별표 호환 폼은 기존 잠복 원본에서 읽습니다. |
| `src/core/engine/settle/utils/latent/readRawTree.ts:33` | engine assumes the state left the tree | 읽기 | 일반 슬롯 폼의 raw는 슬롯과 overlay에서 읽고, 별표 호환 폼은 기존 잠복 원본에서 읽습니다. |
| `src/core/engine/settle/utils/latentStore/hasLatentUnder.ts:23` | engine assumes the state left the tree | 읽기 | 채움 방지 원본에는 잠복 fallback과 보유 슬롯 모두를 포함합니다. |
| `src/core/engine/settle/utils/loadValues/readFieldNodeDefaultValue.ts:12` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/output/updateOutput.ts:127` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/reset/resetFieldNodeSubtree.ts:20` | engine assumes the state left the tree | 읽기 | 살아 있는 동일 종류에 대한 옛 참조 무효과와 슬롯 원본 초기화를 함께 보존합니다. |
| `src/core/engine/settle/utils/settlement/finishSettlement.ts:94` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts:50` | engine assumes the state left the tree | 쓰기 | 활성 복제와 재귀 비활성 복제의 수명을 구별하고 새 부모·주소·itemKey를 맺습니다. |
| `src/core/engine/settle/utils/slots/commitSlotChanges.ts:21` | engine assumes the state left the tree | 읽기 | 현재 활성 조상만 공표를 무효화하며 떼어진 옛 호스트의 읽기 수명을 변경하지 않습니다. |
| `src/core/engine/settle/utils/slots/commitSlotChanges.ts:53` | engine assumes the state left the tree | 읽기 | 현재 활성 조상만 공표를 무효화하며 떼어진 옛 호스트의 읽기 수명을 변경하지 않습니다. |
| `src/core/engine/settle/utils/slots/commitSlotChanges.ts:55` | engine assumes the state left the tree | 읽기 | 현재 활성 조상만 공표를 무효화하며 떼어진 옛 호스트의 읽기 수명을 변경하지 않습니다. |
| `src/core/engine/settle/utils/slots/finalizeRestoredSlotRaw.ts:14` | engine assumes the state left the tree | 읽기 | 복제 원본의 보존 raw는 해당 재진입 전이에만 반영하고 이전 분리 인스턴스와 섞지 않습니다. |
| `src/core/engine/settle/utils/slots/markSlotChange.ts:44` | engine assumes the state left the tree | 읽기 | 현재 구조에 붙은 조상까지 변경을 전파하고 떼어진 경계에서 멈춥니다. |
| `src/core/engine/settle/utils/slots/markSlotChange.ts:48` | engine assumes the state left the tree | 읽기 | 현재 구조에 붙은 조상까지 변경을 전파하고 떼어진 경계에서 멈춥니다. |
| `src/core/engine/settle/utils/slots/materializeInactiveSlotValues.ts:21` | engine assumes the state left the tree | 읽기 | 떼어진 호스트는 고정 원본과 그 수명의 슬롯에서 지연 읽고, 활성 호스트만 현재 잠복 경로와 합칩니다. |
| `src/core/engine/settle/utils/slots/pruneSlotSources.ts:43` | engine assumes the state left the tree | 읽기 | 활성 구조와 보유 슬롯을 별도로 순회하여 load·reset·replace가 원본과 overlay를 폐기합니다. |
| `src/core/engine/settle/utils/slots/pruneSlotSources.ts:86` | engine assumes the state left the tree | 읽기 | 활성 구조와 보유 슬롯을 별도로 순회하여 load·reset·replace가 원본과 overlay를 폐기합니다. |
| `src/core/engine/settle/utils/slots/retainClearedArrayCarriers.ts:26` | engine assumes the state left the tree | 쓰기 | 기준 clear 정책이 허용한 비활성 배열 원본만 분리된 운반자로 보존합니다. |
| `src/core/engine/settle/utils/slots/updateSlotChildIndex.ts:16` | engine assumes the state left the tree | 읽기 | 활성 자식과 비활성 후보를 구별하여 슬롯 호스트 색인을 갱신합니다. |
| `src/core/engine/settle/utils/slots/writeSlotPath.ts:53` | engine assumes the state left the tree | 읽기 | 활성 경로의 새 인스턴스와 보유 원본을 구별하여 현재 슬롯 overlay에만 씁니다. |
| `src/core/engine/settle/utils/transition/applyExitClearing.ts:23` | engine assumes the state left the tree | 읽기 | 정책·상속·후보 소유권은 유지하고 보존·비움 대상을 슬롯으로 확장합니다. |
| `src/core/engine/settle/utils/transition/collectFillDescendants.ts:24` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:34` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:53` | engine assumes the state left the tree | 쓰기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:98` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:116` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:133` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizeExits.ts:159` | engine assumes the state left the tree | 읽기 | 기존 분리·등록 해제는 유지하고 원본의 목적지를 호스트 슬롯으로 바꿉니다. |
| `src/core/engine/settle/utils/transition/finalizePerished.ts:75` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/isReplacedLivePath.ts:29` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/readDepartingAncestorPolicy.ts:19` | engine assumes the state left the tree | 읽기 | 보유 슬롯 아래의 명시 정책과 나가는 살아 있는 조상의 상속 정책을 구별합니다. |
| `src/core/engine/settle/utils/transition/restoreArrayStructure.ts:33` | engine assumes the state left the tree | 쓰기 | 철회하는 현재 정착의 아이템과 이전 수명의 슬롯 인스턴스를 구별합니다. |
| `src/core/engine/settle/utils/transition/restoreArrayStructure.ts:44` | engine assumes the state left the tree | 쓰기 | 철회하는 현재 정착의 아이템과 이전 수명의 슬롯 인스턴스를 구별합니다. |
| `src/core/engine/settle/utils/transition/transitionSettlement.ts:37` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/transitionSettlement.ts:74` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/transitionSettlement.ts:159` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/transition/utils/detachPerishedNode.ts:30` | engine assumes the state left the tree | 쓰기 | 소멸 원본은 삭제하되 옛 참조가 소유한 불변 비활성 읽기는 유지합니다. |
| `src/core/engine/settle/utils/transition/withdrawDetachedFills.ts:18` | engine assumes the state left the tree | 읽기 | 철회 뒤 원본을 보유하며 옛 공개 인스턴스에 새 overlay를 쓰지 않습니다. |
| `src/core/engine/settle/utils/verify/compareSlotShadowObservations.ts:85` | detached public read | 읽기 | 양쪽 공개 분리 상태와 과거 참조의 고정 관측을 비교합니다. |
| `src/core/engine/settle/utils/verify/synchronizeSlotShadowInputs.ts:61` | detached public read | 읽기 | 독립 기준 트리의 살아 있는 입력만 현재 공개 인스턴스에 대응시킵니다. |
| `src/core/engine/settle/utils/write/releaseWrongKindHosts.ts:22` | detached public read | 읽기 | 분리된 공개 수명의 읽기·무동작·활성 형상 경계를 유지합니다. 슬롯은 structure·children·활성 등록에 포함하지 않습니다. |
| `src/core/engine/settle/utils/write/writeFieldNode.ts:61` | engine assumes the state left the tree | 읽기 | 떼어진 쓰기는 고정 인스턴스를 수정하지 않고 현재 주소의 슬롯 overlay에 반영합니다. |
| `src/core/engine/settle/utils/write/writeFieldNode.ts:91` | engine assumes the state left the tree | 읽기 | 떼어진 쓰기는 고정 인스턴스를 수정하지 않고 현재 주소의 슬롯 overlay에 반영합니다. |
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
