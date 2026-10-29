# 미시 위생 검증

기준은 `1c3655a10`이며 제품 범위는 `src`에서 시험·벤치·스토리·동결된 `__legacy__`를 제외한 TypeScript/TSX입니다. 횟수는 주석과 예제 문자열을 제외한 AST 노드 수입니다. 계획의 텍스트 검색 수와 범위가 다르므로 직접 비교하지 않습니다. 새 공개 API나 상주 구조를 추가하지 않고 시험을 삭제하거나 약화하지 않습니다.

## 항목 1 — 포인터 상수

포인터 도우미 전체와 엔진을 훑어 **37파일·107개 문자열 리터럴**을 기존 `JSONPointer` 상수 참조로 바꿨습니다. 파싱된 연산자의 `PointerOperator` 심볼은 그대로 유지합니다. fragment와 separator의 합성은 기존 두 상수를 조합합니다.

유지 지점과 이유:

- `constants/JSONPointer.ts`의 확장 토큰은 상수의 정의 자체입니다.
- `utils/parsePointerSegment.ts`·`parseStandardPointer.ts`의 `~`, 후자의 `%`, `formatSegment.ts`·`parsePointerSegment.ts`·`isReservedPercentName.ts`의 예약 퍼센트 표기는 기존 상수에 대응 멤버가 없습니다. 이스케이프 구현은 계속 winglet이 소유합니다.
- `resolvePointer.ts`의 `segment === ''`는 빈 이름이고 루트 토큰과 다른 문법 역할이므로 유지합니다.
- 엔진 식 토크나이저의 `.` 및 오류 코드에서 namespace를 자르는 `.`는 포인터가 아닙니다. 템플릿 문자열에 든 스키마 키워드·주소 예제·진단 문장은 보존합니다.

첫 표적 시험은 workspace `@winglet/json` dist 부재로 7파일 적재가 실패했습니다. 설치 없이 지정된 common-utils와 json build로 준비했고, 수정 전후 동일한 포인터 시험 **8파일·96건**, 수정 뒤 패키지 typecheck·lint를 통과했습니다. lint의 첫 실행도 미준비 json-schema·react-utils dist 때문에 실패했으며 지정 build 뒤 통과했습니다. 상수의 literal 형으로 좁아진 조립 변수는 `string` 주석으로 원래 형을 유지합니다.

## 항목 2 — 고빈도 membership과 체인

제품 `.includes`는 **84 → 35**로 줄었습니다(**49개 치환**). 정착·파생·탐색·런타임 유효 스키마·쓰기 시 청사진 아이템 조회·포인터 해석·입력 해석을 대상으로 했습니다. optional 배열의 부재는 기존 분기/기본값을 유지하며, 숫자 ID·문자열·객체 identity만 비교해 `NaN`의 SameValueZero 차이를 만들지 않습니다.

배열 정렬 후보의 `filter/map`, 나감 식 색인의 `filter/map`, 파생 감시 의존의 `filter/map`을 단일 순회로 합쳤습니다. 유효 선언 선택의 연속 `filter` 세 곳도 단일 수집 순회와 기존 정렬로 대체했습니다. **체인/선택 4지점**이며 제거한 prototype iteration은 10개입니다. 파생 의존 값은 원래 식 의존 다음 감시 의존 순서이고, 중복 제외 조건·평가 횟수는 그대로입니다.

유지한 35개 membership 지점은 [항목 2 원시](raw/micro-hygiene/item-2.json)의 `kept`에 파일·행으로 전부 열거했습니다. 청사진 작성 검증·기능 분석·정적 마운트·입력 정의 준비는 일회성 경로입니다. UI의 checkbox 선택 membership은 임의 값의 `NaN` 의미를 보존하며, union 렌더의 선택과 정의 매칭은 이후 반복 정리에서 함께 검토합니다. 제품 전체 반복 방식은 항목 5에서 별도 집계합니다.

표적 포인터·유효 스키마·파생·배열·나감·배달 시험 **44파일·436건**, 패키지 typecheck·lint를 통과했습니다. 추가 세 지점에서도 typecheck·lint를 재확인했습니다.

## 항목 3 — Set/Map 수명과 작은 dirty 후보

기준 제품 `src/core`의 생성식은 **422개**입니다. 문자열 검색의 행 수 대신 각 AST `new Set`/`new Map`을 셉니다. **(가) 상주/호출 밖으로 보존하는 자료 170개, (나) 기존 정착 scratch 22개, (다) 호출 한정 자료 230개**로 분류했습니다. 상주 여부는 값 자체가 보존되는지로 판단하며, 임시 Map의 값만 최종 결과로 넘어가는 경우 Map 자체는 (다)입니다. 조건부 캐시는 한 경로라도 보존될 수 있으면 (가)로 두어 교체 대상에서 제외했습니다. 생성식별 ID·파일·행·분류·판단은 [전체 분류 원시](raw/micro-hygiene/set-map-classification.json)에 보존했습니다.

**(다) 1지점**인 `dirtyChildren`의 membership은 실제 부모 예약 맵 크기가 **64개 이하**일 때 기존 반환 배열을 재사용합니다. 새 상주 구조나 보조 배열은 없습니다. 결과 개수는 예약 엔트리 수 이하이므로 비교는 최대 64×64이며 10,000에 훨씬 못 미치는 상한을 런타임에서 증명합니다. 65개 이상은 기존 Set을 유지하여 큰 입력의 선형 방문·중복 제거를 보존합니다. 나머지 임시 자료는 임의 스키마·엔트리·게이트·노드·경로·기록 수의 제품 상한을 증명하지 못하거나 반복 조회/반환 자료의 소유 계약을 유지해야 하므로 그대로 두었습니다. 생성식의 정적 총수는 422개 그대로지만 작은 호출의 Set 생성은 1 → 0입니다.

새 특성화 시험은 수정 전 1개·64개 후보에서 Set 생성 1회로 실패했고, 수정 뒤 1/64/65 경계의 생성 0/0/1과 역순·중복 identity 순서를 확인했습니다. 표적 배열·게이트·할당 시험 **38파일·297건**, typecheck·lint를 통과했습니다. 시험 삭제·약화는 없습니다.

Ⅳ-2는 쓰기당 Map/Set을 97 → 37로 줄여도 oneOf-80·siblings-0 시간이 폭 안이었습니다. 이 정리도 전환 속도를 약속하지 않으며 작은 잎 쓰기의 누적 비용은 최종 가중 창으로 판단합니다.

파일별 분류 표입니다. 각 열은 해당 생성식의 수입니다.

| 파일 | (가) | (나) | (다) |
| --- | ---: | ---: | ---: |
| `src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts` | 0 | 0 | 2 |
| `src/core/engine/blueprint/blueprint.ts` | 0 | 0 | 3 |
| `src/core/engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts` | 0 | 0 | 2 |
| `src/core/engine/blueprint/buildNodes/utils/children/populateVirtualNodes.ts` | 0 | 0 | 1 |
| `src/core/engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts` | 0 | 0 | 2 |
| `src/core/engine/blueprint/buildNodes/utils/declarations/readDiscriminatorBranches.ts` | 0 | 0 | 1 |
| `src/core/engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts` | 0 | 0 | 2 |
| `src/core/engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts` | 0 | 0 | 1 |
| `src/core/engine/blueprint/collectBlueprintWarnings/collectBlueprintWarnings.ts` | 0 | 0 | 1 |
| `src/core/engine/blueprint/compileBlueprintExpressions/compileBlueprintExpressions.ts` | 0 | 0 | 1 |
| `src/core/engine/blueprint/effectiveSchema/utils/finalize/ensureEffectiveSchemaCache.ts` | 1 | 0 | 0 |
| `src/core/engine/blueprint/utils/features/HostStaticPartition.ts` | 1 | 0 | 0 |
| `src/core/engine/blueprint/utils/features/buildFeatureNodeIndex.ts` | 4 | 0 | 1 |
| `src/core/engine/blueprint/utils/features/collectDeriveConvergenceTargets.ts` | 1 | 0 | 4 |
| `src/core/engine/blueprint/utils/features/collectTemplateParents.ts` | 0 | 0 | 1 |
| `src/core/engine/blueprint/validateShape/validateShape.ts` | 0 | 0 | 2 |
| `src/core/engine/derive/evaluateDeriveRound/evaluateDeriveRound.ts` | 0 | 0 | 3 |
| `src/core/engine/derive/evaluateDeriveRound/utils/rank/getDeriveChildEntry.ts` | 1 | 0 | 0 |
| `src/core/engine/derive/utils/evaluate/addActiveRuleKey.ts` | 0 | 0 | 1 |
| `src/core/engine/derive/utils/evaluate/evaluateResetInteraction.ts` | 0 | 0 | 2 |
| `src/core/engine/derive/utils/evaluate/getDeriveSourceNodes.ts` | 0 | 0 | 1 |
| `src/core/engine/derive/utils/rules/getDeriveRuleTable.ts` | 1 | 0 | 0 |
| `src/core/engine/navigation/utils/visit/visitFieldNodes.ts` | 0 | 0 | 1 |
| `src/core/engine/record/utils/advanceFieldNodeRevision.ts` | 0 | 0 | 1 |
| `src/core/engine/record/utils/captureFieldNodeChange.ts` | 0 | 0 | 1 |
| `src/core/engine/record/utils/indexFieldNodeWarning.ts` | 3 | 0 | 0 |
| `src/core/engine/record/utils/markFieldNodeEvent.ts` | 2 | 0 | 0 |
| `src/core/engine/record/utils/publishGlobalStateDeltas.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts` | 2 | 0 | 3 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySplice.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArrayTail.ts` | 0 | 0 | 2 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/clearArrayRuntimePaths.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArrayRuntimePaths.ts` | 1 | 0 | 5 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyCommittedRules.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyPairedPathStore.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/finishStaticFirstLoad.ts` | 1 | 0 | 1 |
| `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts` | 1 | 0 | 1 |
| `src/core/engine/settle/utils/commit/commitExitPolicyValues.ts` | 1 | 0 | 2 |
| `src/core/engine/settle/utils/commit/commitGlobalState.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/commit/commitSettlement.ts` | 2 | 0 | 3 |
| `src/core/engine/settle/utils/commit/finalizeDeriveTrace.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/commit/markCommitDeliveries.ts` | 2 | 0 | 5 |
| `src/core/engine/settle/utils/commit/updateCommittedRuleValue.ts` | 4 | 0 | 0 |
| `src/core/engine/settle/utils/commit/utils/createWatchDeliveryIndex.ts` | 7 | 0 | 0 |
| `src/core/engine/settle/utils/compute/childSelection/gateSelection/computeRootGateSelection.ts` | 1 | 0 | 2 |
| `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectLiteralTableChildren.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectPredicateTableChildren.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectRootGateDeclarations.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/compute/childSelection/getGateSelectionTable.ts` | 5 | 0 | 3 |
| `src/core/engine/settle/utils/compute/childSelection/prepareGateSelection.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts` | 0 | 0 | 4 |
| `src/core/engine/settle/utils/compute/childSelection/utils/createStaticEntryReuser.ts` | 1 | 0 | 1 |
| `src/core/engine/settle/utils/compute/childSelection/utils/prepareDiscriminatorEntrySelection.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/compute/childSelection/utils/prepareStaticHost.ts` | 1 | 0 | 3 |
| `src/core/engine/settle/utils/compute/computeNode.ts` | 0 | 0 | 6 |
| `src/core/engine/settle/utils/compute/dirtyChildren.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/compute/getVirtualReferenceIndex.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/compute/hasRecursiveExpansion.ts` | 0 | 0 | 2 |
| `src/core/engine/settle/utils/compute/primeHost.ts` | 0 | 0 | 2 |
| `src/core/engine/settle/utils/compute/selectNodeSchema.ts` | 1 | 0 | 1 |
| `src/core/engine/settle/utils/compute/utils/getStaticGateList.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/compute/utils/prepareHostWheelPlan.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/controls/calculateStateKeys.ts` | 0 | 0 | 2 |
| `src/core/engine/settle/utils/controls/getStateDependencyPlan.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/controls/prepareControlLayers.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/controls/prepareFragmentOwners.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/controls/prepareParentControlLayers.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/declarations/getDeclaredChildNames.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/dependencies/captureProjectionBaseline.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/dependencies/deferPresenceTemplate.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts` | 8 | 0 | 16 |
| `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts` | 0 | 0 | 6 |
| `src/core/engine/settle/utils/dependencies/registerRecalculation.ts` | 0 | 0 | 4 |
| `src/core/engine/settle/utils/dependencies/supplementSplitOwner.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/derivation/collectDeriveSourcePaths.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/derivation/getDeriveState.ts` | 0 | 0 | 7 |
| `src/core/engine/settle/utils/errors/recordSettlementFailure.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/gates/evaluateGate.ts` | 4 | 0 | 2 |
| `src/core/engine/settle/utils/gates/flushPendingGateReads.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/gates/getGateBudgetCap.ts` | 2 | 0 | 3 |
| `src/core/engine/settle/utils/gates/getGateExpression.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/gates/getGateRegistry.ts` | 15 | 0 | 0 |
| `src/core/engine/settle/utils/gates/predicates/getIfGateReadNames.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/gates/prepareGateTableRound.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/gates/readGateHostView.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/gates/readGateSelectionGroup.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/gates/watchSplitRegistration.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/inactive/getInactiveValueContext.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/inactive/resolveInactiveValue.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/input/interpretFieldNodeInput.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/input/utils/verifyWriteEpoch.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/input/utils/watchWriteEpoch.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/loadValues/alignArraySnapshotSlots.ts` | 0 | 0 | 4 |
| `src/core/engine/settle/utils/reset/clearSubtreeState.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/scratch/DirtyPathSet.ts` | 0 | 2 | 8 |
| `src/core/engine/settle/utils/scratch/getSettlementScratch.ts` | 0 | 19 | 0 |
| `src/core/engine/settle/utils/scratch/updatePendingExitIndex.ts` | 0 | 1 | 1 |
| `src/core/engine/settle/utils/slots/applySlotOverlay.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/slots/captureAbsentSlotInputs.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/slots/cloneSlotSubtree.ts` | 5 | 0 | 0 |
| `src/core/engine/settle/utils/slots/collectHostSlotValues.ts` | 0 | 0 | 2 |
| `src/core/engine/settle/utils/slots/commitSlotChanges.ts` | 0 | 0 | 2 |
| `src/core/engine/settle/utils/slots/createClearedArrayOverlay.ts` | 2 | 0 | 1 |
| `src/core/engine/settle/utils/slots/createExitSlotOverlay.ts` | 4 | 0 | 0 |
| `src/core/engine/settle/utils/slots/createSlotValueOverlay.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/slots/getSlotChildIndex.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/slots/getSlotEntries.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/slots/markRestoredSlotRaw.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/slots/markSlotChange.ts` | 3 | 0 | 2 |
| `src/core/engine/settle/utils/slots/materializeInactiveSlotValues.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/slots/materializeKeptSlotOverlay.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/slots/pruneArraySlotTail.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/slots/pruneSlotSources.ts` | 2 | 0 | 2 |
| `src/core/engine/settle/utils/slots/rekeyArraySlotBindings.ts` | 3 | 0 | 2 |
| `src/core/engine/settle/utils/slots/restoreSlotSources.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/slots/restoreTransferredSlotSource.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/slots/retainExitedSlot.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/slots/updateSlotChildIndex.ts` | 1 | 0 | 0 |
| `src/core/engine/settle/utils/slots/writeSlotPath.ts` | 2 | 0 | 0 |
| `src/core/engine/settle/utils/transition/collectFillDescendants.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/transition/finalizeExits.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/transition/finalizePerished.ts` | 0 | 0 | 3 |
| `src/core/engine/settle/utils/transition/pruneArrayTailPaths.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/transition/prunePerishedPaths.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/transition/restoreArrayStructure.ts` | 0 | 0 | 1 |
| `src/core/engine/settle/utils/transition/transitionSettlement.ts` | 0 | 0 | 5 |
| `src/core/engine/utils/cache/valueMemos.ts` | 2 | 0 | 0 |
| `src/core/engine/utils/controls/getControlExpression.ts` | 1 | 0 | 0 |
| `src/core/engine/utils/pathIndex/utils/PathStoreIndex.ts` | 7 | 0 | 1 |
| `src/core/engine/utils/pathIndex/utils/utils/NumericPathIndex.ts` | 3 | 0 | 0 |
| `src/core/engine/utils/paths/getCachedPointerSegments.ts` | 1 | 0 | 0 |
| `src/core/engine/validation/utils/cache/readValidationEntry.ts` | 1 | 0 | 0 |
| `src/core/engine/validation/utils/copy/createValidatorCopy.ts` | 3 | 0 | 1 |
| `src/core/engine/validation/utils/lifetime/recentReleaseList.ts` | 1 | 0 | 0 |
| `src/core/engine/validation/utils/read/readFieldNodeErrors.ts` | 1 | 0 | 0 |
| `src/core/engine/validation/utils/route/isOffUnionBranchIssue.ts` | 0 | 0 | 1 |
| `src/core/engine/validation/utils/route/routeValidationIssues.ts` | 1 | 0 | 4 |
| `src/core/engine/validation/utils/run/requestFieldNodeValidation.ts` | 2 | 0 | 0 |
| `src/core/engine/write/utils/chain/adoptFieldNodeChain.ts` | 4 | 0 | 0 |
| `src/core/engine/write/utils/chain/deliverWave.ts` | 0 | 0 | 2 |
| `src/core/engine/write/utils/chain/exitFieldNodeChain.ts` | 1 | 0 | 2 |
| `src/core/engine/write/utils/chain/flushQueuedEvents.ts` | 0 | 0 | 1 |
| `src/core/engine/write/utils/chain/queueNonSettleEvent.ts` | 1 | 0 | 0 |
| `src/core/engine/write/utils/chain/refuseListenerFeedback.ts` | 1 | 0 | 0 |
| `src/core/engine/write/utils/chain/restoreAdoptedExternalErrors.ts` | 2 | 0 | 0 |
| `src/core/engine/write/utils/chain/runDeliveryWaves.ts` | 1 | 0 | 0 |
| `src/core/engine/write/utils/chain/utils/compareDocumentOrder.ts` | 0 | 0 | 1 |
| `src/core/engine/write/utils/entry/dispatchClearSubtreeState.ts` | 0 | 0 | 1 |
| `src/core/engine/write/utils/entry/dispatchMount.ts` | 3 | 0 | 0 |
| `src/core/engine/write/utils/entry/dispatchResetForm.ts` | 1 | 0 | 0 |
| `src/core/engine/write/utils/entry/dispatchResetSubtree.ts` | 1 | 0 | 0 |
| `src/core/engine/write/utils/entry/dispatchSetExternalErrors.ts` | 1 | 0 | 0 |
| `src/core/engine/write/utils/entry/dispatchSetState.ts` | 0 | 0 | 1 |
| `src/core/engine/write/utils/entry/dispatchSetSubtreeState.ts` | 0 | 0 | 1 |
| `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts` | 3 | 0 | 5 |
| `src/core/engine/write/utils/read/onInactiveFieldNode.ts` | 2 | 0 | 0 |
| `src/core/engine/write/utils/read/subscribeFieldNode.ts` | 2 | 0 | 0 |
| `src/core/engine/write/utils/report/collectChainRecords.ts` | 0 | 0 | 1 |
| `src/core/engine/write/utils/report/readReferenceOnlySchemaPaths.ts` | 0 | 0 | 2 |
| `src/core/surface/utils/fieldNodeFactory.ts` | 2 | 0 | 0 |

## 항목 4 — 두 피연산자 비교

제품 Math 호출 **18 → 4**, **14개**를 `@winglet/common-utils/math`의 `minLite`/`maxLite`로 바꿨습니다. 배열 길이·위치·파생 순위·논리 시각처럼 엔진이 만드는 수를 비교하며, 슬롯 배열 길이는 기존 Array.from의 ToLength 관측을 유지합니다. `NaN` 또는 부호 있는 0을 공개 결과로 내보내는 일반 수 비교로 범위를 넓히지 않았습니다.

유지한 네 곳은 [항목 4 원시](raw/micro-hygiene/item-4.json)에 열거했습니다. predicate table의 세 피연산자 Math.min과 검증 경로의 spread Math.max 두 곳은 대상이 아닙니다. ArrayItems의 작성 minItems는 NaN일 수 있어 `Math.min(NaN, finite)`와 minLite의 차이로 추가 빈 행이 생기는 것을 막기 위해 유지했습니다.

패키지 typecheck·lint와 포인터·파생·배열·게이트 표적 시험 **52파일·446건**을 통과했습니다.

## 항목 5 — 배열 반복

항목 2 뒤 제품 prototype 반복 **229 → 0**입니다. 최초 기준은 239개였고 항목 2에서 10개를 제거했습니다. 남은 229개는 생성한 밀집 메타데이터의 map/filter를 common-utils로, 단락 조건·반환값·희소 입력은 for-loop로 옮겼습니다. 소스의 주석·TSDoc 예제와 동결 레거시는 바꾸지 않았습니다. [항목 5 원시](raw/micro-hygiene/item-5.json)에 위치와 변환 방식을 남겼습니다.

순회마다 receiver와 최초 length를 한 번 읽고 희소 입력은 `index in array`로 원래 HasProperty를 보존합니다. 빈 자리만 건너뛰고 명시 undefined는 방문합니다. some/every는 원래 조건 자리에서 단락하며, forEach의 콜백 반환은 순회를 중단하지 않습니다. 콜백은 모두 arrow였고 lexical this를 그대로 유지했습니다. optional 배열의 부재, filter 결과 순서, type predicate의 축소는 보존했으며 형 단언을 추가하지 않았습니다. short-circuit 표현식 안의 순회는 즉시 실행 arrow로 평가 위치를 유지합니다. 새 상주 구조나 공개 이름은 없습니다.

표적 포인터·유효 스키마·파생·배열·게이트·배달·입력 정의·행 동작 시험 **82파일·720건(기존 todo 1)**과 typecheck·lint 및 렌더 표적 **24파일·71건**을 통과했습니다. 첫 타입/린트 검사는 type predicate 및 bool callback 문맥 차이를 검출했고, 같은 의미의 명시적 순회·predicate로 보존한 뒤 통과했습니다. 콜백 반환을 변환할 때 중괄호 없는 조건의 범위가 달라질 수 있음을 코드 점검에서 확인하여 각 반환 치환을 블록으로 묶은 뒤 표적 시험을 실행했습니다.

첫 전체 unit의 세 실패는 후속 정적 교정으로 보존했습니다. binding organ은 array 유틸리티 import를 허용하지 않아 같은 for-loop로 바꿨습니다. P-08 계수 fixture는 기존 includes와 문자열 연산 계수를 유지하면서 배열 indexOf 계수를 더했고, 모든 크기에서 실제 work > 0도 추가했습니다(32/64/128/256, 배율 2). 식 색인 시험은 기존 native find/map 계수를 유지해 둘 다 0임을 확인하고 common-utils map의 실제 입력을 세어 최초 색인 생성 1회를 확인합니다. 시험을 삭제하거나 단언을 줄이지 않았으며 수정 뒤 기존 실패 **3파일·17건**이 통과했습니다. 이 교정은 해당 원래 항목 커밋으로 합칩니다.


### 독립 검토 P2-1에 따른 반복 정리

후보 1의 크기 비용은 다음과 같습니다. 즉시 실행 함수는 호출마다 함수 호출을 더하고 `in` 검사는 방문 원소마다 실행됩니다. 검토의 추가 줄 grep 132개는 실제 인수 없는 IIFE **131개**와 필요한 `useMemo` 콜백 한 줄을 함께 센 값입니다. 그 밖의 형 술어용 인수 있는 IIFE **6개**도 있었습니다. 후보 2에서는 **137개 모두**를 보통 반복문·결과 변수 또는 정적 이름을 가진 형 술어로 옮겼습니다. 파서의 밀집 세그먼트 형 술어는 엔진 내부 한 파일을 세 호출자가 공유하며 패키지 공개 내보내기는 늘리지 않습니다. 필수 hook 콜백은 유지합니다.

| 번들 | 기준 바이트 | 후보 1 바이트 | 증가 |
| --- | ---: | ---: | ---: |
| `index.mjs` | 830373 | 861528 | +31155 (3.75%) |
| `index.node.mjs` | 829595 | 860750 | +31155 (3.76%) |
| `index.cjs` | 847915 | 882316 | +34401 (4.06%) |

전체 제품 AST의 `in`은 **204→87(117개 제거)**, 반복용 labeled continue는 **16→0**, prototype 반복은 계속 **0**입니다. 밀집인 엔진 작성 배열에서 불필요한 검사를 없애고 callback 값/색인 별칭과 결과 별칭을 합쳤습니다. 내부 불변 메타데이터는 직접 순회하고, 쓰기 도중 바뀔 수 있는 배열은 최초 길이와 수신 배열을 보존합니다. 임시 filter 결과 배열의 소유·순서와 기존 반환 참조는 유지하고 새 상주 컨테이너는 없습니다. 후보 2의 세 번들 바이트는 최종 build 뒤 같은 표에 추가하며, 시간과 Node/Bun 힙 비용은 승인된 짧은 창으로 판단합니다. 창 1은 중단되어 이 비용의 채택 근거가 아닙니다.

[반복 감사 원시](raw/micro-hygiene/candidate-2-loop-audit.json)는 남은 숫자 `in` 28곳을 모두 열거합니다. 작성/외부 입력의 tuple·virtual fields·controls.fields/targets·schema.allOf/branches·enum/literal 값·작성 type·required/dependentRequired·외부 오류·checkbox prev·union authored·공개 `ChildFields` 인수의 구멍은 계속 건너뜁니다. 기존 item-entry 캐시의 sparse 존재 검사, 스냅숏의 실제 구멍 보존 검사도 유지합니다. `Object.keys`, 이전 discriminator 값의 push 배열, 렌더의 생성된 옵션/표시 배열에서는 검사를 없앴습니다. 새로 작성한 로컬 선택 형 13개는 기존 Optional 유틸리티로 표기했습니다. typecheck·lint·표적 **82파일 720건(기존 todo 1)**을 통과했으며 [로그](raw/micro-hygiene/candidate-2-loop-checks.json.gz)를 보존했습니다.

## 항목 6 — 형 유틸리티

**521지점**을 치환했습니다: `Record<string, T>` → Dictionary **101개**, Optional **284개**, Nullable **122개**, Optional<Nullable> **13개**, Nullish **1개**입니다. 문자열 아닌 Record 키와 기존 조건부·mapped type의 분배·modifier 의미가 달라지는 조합은 유지했습니다. 대응하는 Required/Partial/IsNullable/Roll의 추가 수기 동등 조합은 이 제품 범위에서 발견하지 못했으며, 이미 사용하는 유틸리티는 유지했습니다. [항목 6 위치](raw/micro-hygiene/item-6.json)를 보존합니다.

실제 공통 유틸리티 선언을 import한 TypeScript 제네릭 동등 증명 **7개·진단 0**으로 Dictionary/Nullable/Optional/중첩/Nullish 및 함수·중첩 Ref 모양을 검증했습니다. Nullable이라는 기존 boolean 제네릭 매개변수와 겹친 surface 파일은 `NullableValue` import alias를 사용합니다. [형 증명 결과](raw/micro-hygiene/utility-equivalence.json)와 [타입 제거 결과](raw/micro-hygiene/type-erasure.json)에서 수정한 **259개 제품 파일의 transpile JavaScript 바이트가 항목 5와 모두 동일**합니다. 한 파일의 기존 import 순서·괄호는 보존하여 형 정리의 런타임 변경을 막았습니다.

공개 97이름 스냅숏에서 네 함수의 null union 표기만 Nullable 표기로 바뀌었습니다: registerPlugin, useFieldNodeSubscribe, useFieldNodeTracker, useFormSubmit. 같은 제네릭 동등 증명으로 확인한 뒤 그 네 문자열만 정확히 갱신했으며, 이름 수·형/값 종류·검사 강도·사례 수는 유지했습니다. 초기 시험은 이 네 표기 때문에 실패했고 수정 뒤 공개/수입/표면 형/할당 시험 **4파일·15건**, typecheck·lint를 통과했습니다. 최종 build의 공개 `index.d.ts`는 **3,129바이트·차이 0**, SHA-256 `ed3bfe4d2c42fab94543b2afeca4f4d904e987ae7e865385116218b3d4614b3d`입니다. 그 파일이 재수출하는 선언 그래프 전체 **1,306파일**을 비교했습니다. **194파일**의 바이트가 달라졌으나 증명한 네 기본 유틸리티와 그 중첩 조합의 named/inline import를 원래 형으로 펼치고 union의 괄호·순서와 import/주석 표기를 정규화한 AST 차이는 **0**입니다. 원래 제네릭 매개변수·modifier·조건부 형·멤버·함수 시그니처는 그대로 비교했습니다. [선언 동등 결과](raw/micro-hygiene/declaration-equivalence.json)와 [194파일의 A/B 선언 원시](raw/micro-hygiene/declaration-diff.json.gz), [제네릭 증명](raw/micro-hygiene/utility-equivalence.ts)을 보존합니다.

## 최종 정적 관문

최종 제품 머리는 `082c3995a`이며 Node 26.12.1·Bun 1.4.4입니다. 지정 build와 artifact checks·typecheck·lint, 다음 다섯 프로젝트를 각각 종료 0 확인 후 순차 실행하고 verify를 통과했습니다. 이전 머리의 unit 실패 3건과 교정 후 표적 증거도 보존했습니다. 8 GiB·maxWorkers 4를 사용했고 기존 todo 한 건은 유지했습니다.

| 프로젝트 | 파일 | 통과 사례 | todo | 초 |
| --- | ---: | ---: | ---: | ---: |
| unit | 601 | 3975 | 1 | 98.69 |
| render | 132 | 768 | 0 | 61.36 |
| storybook | 100 | 251 | 0 | 35.63 |
| react18 | 132 | 768 | 0 | 61.54 |
| production | 10 | 21 | 0 | 3.07 |
| verify | 738 | 4787 | 1 | 173.42 |

레거시 격리 **2,375파일**, 배달 **79장면·429단계 + B12 7장면·21단계 차이 0**입니다. 공개 index.d.ts와 전체 선언 그래프의 동등 기록은 항목 6에 있습니다. [정적 로그·제품 해시](raw/micro-hygiene/static/artifacts.json)를 보존했습니다. build 산출물은 기존처럼 비추적 파일이며 소스 커밋에 넣지 않았습니다.

FCA facts **1,663/1,663 exact**, 세 검사 동일 snapshot `c517ae013f9e50b5e4a0229c06566bc90865f3bd285cadc859b78a9b68f7862a`, full validation **202건(오류 1·경고 200·정보 1)**으로 상한을 유지했습니다. 기존 cycle·문서 findings에 따른 전체 판정 FAIL과 분석 indeterminate는 보존하며, 상한 통과를 FCA 전체 통과로 표현하지 않습니다. [FCA 전체 원시와 요약](raw/micro-hygiene/fca/summary.json)을 보존했습니다.

기준 archive의 첫 build는 package-local 의존 연결이 없어 AJV 6을 읽었습니다. 설치 없이 기존 workspace node_modules를 연결한 뒤 통과했고, 기준과 후보의 최종 build는 같은 Node 26으로 맞췄습니다. 추가 의존 설치나 제품 범위 밖 수정은 없습니다.

## 측정 장치와 창

측정 후보는 `8d7d1a87e`이며 제품 바이트는 정적 관문의 `082c3995a`와 같습니다. `tools/iv-2/window.mjs` 계열의 공개 행과 힙 장치를 재사용하며, Ⅳ-1의 `summarize.mjs`·`weightedExchange.mjs`·`judgeStage.mjs` 판정은 유지합니다. Ⅳ-2 전용 할당·exit self·cold 지연 생성 추가항은 이 정리에 해당하지 않으므로 별도 어댑터에서 제외했습니다. 최종 판정은 미시 위생 계획에 따라 모든 행의 폭 밖 퇴보 0과 가중 교환비 ≤ 0이며, 교환비 0도 허용합니다.


### 사전 검사와 pilot

같은 Node 26으로 준비한 A/B 불변 bundle과 stage bundle의 해시를 고정했습니다. untimed smoke는 공개 A44/B44·legacy36, stage 9모드, siblings-1000 retention 적재를 통과했습니다. 실제 `alternate.mjs` worker CLI dry run은 single-flat-1000 한 행·한 프로세스·warmup 1/sample 1로 성공했고 formal marker를 만들지 않았습니다.

조정자의 별도 승인을 받은 pilot 한 번은 **22행·행당 한 프로세스·20/100·종료 0**입니다. 행별 median/min 비율의 중앙값은 current **1.3474188821**, legacy **1.2143182973**이며 current가 요구 범위 1.2–1.4에 들었습니다. CPU precheck **25/25 승인·지연 25회**를 보존했습니다. 순간 부하는 quiet gate의 지연 대상이며 거절된 측정 표본을 재실행한 것이 아닙니다. 모든 관측에서 이름별 최대 CPU 상위 10개는 duetexpertd 64.19%, WindowServer 61.65%, Google Chrome Helper (Aperitif Renderer) 30.07%, KakaoTalk 21.20%, 2.1.312 18.65%, Google Chrome 18.17%, codex 16.68%, Orca Helper (Renderer) 15.58%, Stats 11.03%, BetterTouchTool 10.67%입니다. [pilot 전체 행·표본](raw/micro-hygiene/preflight/pilot-samples.json.gz), [요약](raw/micro-hygiene/preflight/pilot-summary.json), [CPU 상위 10개와 지연](raw/micro-hygiene/preflight/pilot-cpu-prechecks.json.gz), [사전 검사 로그](raw/micro-hygiene/preflight/logs.json.gz)를 남겼습니다.

창 1은 pilot 범위를 보고한 뒤 별도 승인을 받아 시작했으나 **소유자 지시로 중단, 기계 사용 중이라 quiet gate 대기가 길어짐, 판정 없음**입니다. 정식 marker는 `2026-10-29T14:09:50.510Z`, finally 종료는 `2026-10-29T14:41:38.584Z`입니다. 공개 종료 0 프로세스 **282/440**, SIGINT 중단 1개이며 stage·Node/Bun 힙·retention은 실행하지 못했습니다. 따라서 가중 교환비·폭 밖 퇴보 목록·힙 관문은 미판정이며 부분 표본으로 완료 판정을 만들지 않습니다. dist를 복원하고 입력 해시를 재확인했습니다. **항목 5 정리로 대체됨**이며 자동 재실행하지 않았습니다. [중단 기록과 부분 원시](raw/micro-hygiene/candidate-1-partial/cancellation.json)에 공개 stdout·stderr·영수증, CPU 상위 10개와 지연, 러너 로그를 보존했습니다.
