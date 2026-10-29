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

## 항목 5–6

진행 중입니다.

## 최종 정적 관문

미실행입니다.

## 측정 장치와 창

미실행입니다. `tools/iv-2/window.mjs` 계열의 공개 행과 힙 장치를 재사용하며, Ⅳ-1의 `summarize.mjs`·`weightedExchange.mjs`·`judgeStage.mjs` 판정은 유지합니다. Ⅳ-2 전용 할당·exit self·cold 지연 생성 추가항은 이 정리에 해당하지 않으므로 별도 어댑터에서 제외할 예정입니다. 최종 판정은 미시 위생 계획에 따라 모든 행의 폭 밖 퇴보 0과 가중 교환비 ≤ 0이며, 교환비 0도 허용합니다.
