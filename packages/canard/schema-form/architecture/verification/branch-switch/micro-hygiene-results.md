# 미시 위생 검증

기준은 `1c3655a10`이며 제품 범위는 `src`에서 시험·벤치·스토리·동결된 `__legacy__`를 제외한 TypeScript/TSX입니다. 횟수는 주석과 예제 문자열을 제외한 AST 노드 수입니다. 계획의 텍스트 검색 수와 범위가 다르므로 직접 비교하지 않습니다. 새 공개 API나 상주 구조를 추가하지 않고 시험을 삭제하거나 약화하지 않습니다.

## 항목 1 — 포인터 상수

포인터 도우미 전체와 엔진을 훑어 **37파일·107개 문자열 리터럴**을 기존 `JSONPointer` 상수 참조로 바꿨습니다. 파싱된 연산자의 `PointerOperator` 심볼은 그대로 유지합니다. fragment와 separator의 합성은 기존 두 상수를 조합합니다.

유지 지점과 이유:

- `constants/JSONPointer.ts`의 확장 토큰은 상수의 정의 자체입니다.
- `utils/parsePointerSegment.ts`·`parseStandardPointer.ts`의 `~`, 후자의 `%`, `formatSegment.ts`·`parsePointerSegment.ts`·`isReservedPercentName.ts`의 예약 퍼센트 표기는 기존 상수에 대응 멤버가 없습니다. 이스케이프 구현은 계속 winglet이 소유합니다.
- `resolvePointer.ts`의 `segment === ''`는 빈 이름이고 루트 토큰과 다른 문법 역할이므로 유지합니다.
- 엔진 식 토크나이저의 `.` 및 오류 코드에서 namespace를 자르는 `.`는 포인터가 아닙니다. 템플릿 문자열에 든 스키마 키워드·주소 예제·진단 문장은 보존합니다.

후보 2 재검토 P3-C에서 확인한 **엔진 경로 키·dirty 집합·경로 색인 루트의 빈 문자열 약 30곳은 후속 정리(소유자 결정)**로 유지합니다. 앞의 총 116개는 실제 치환 수이며 엔진의 모든 루트 표기 완료를 뜻하지 않습니다. 판정이 열거한 위치는 다음과 같습니다(이 후속 과제에서 코드는 바꾸지 않았습니다).

| 엔진 내부 위치 | 판정이 지목한 줄 |
| --- | --- |
| `settle/utils/transition/restoreSourceB.ts` | 37–38 |
| `settle/utils/dependencies/deferPresenceTemplate.ts` | 57, 60 |
| `settle/utils/dependencies/flushPresenceTemplates.ts` | 47(두 곳) |
| `settle/utils/dependencies/registerPresenceChanges.ts` | 105 |
| `settle/utils/gates/getGateRegistry.ts` | 448, 504 |
| `settle/utils/gates/flushPendingGateReads.ts` | 99 |
| `settle/utils/loadValues/alignArraySnapshotSlots.ts` | 85, 87 |
| `settle/utils/scratch/DirtyPathSet.ts` | 154, 181, 243, 272 |
| `settle/utils/inactive/getInactiveValuePath.ts` | 26 |
| `settle/utils/inactive/getInactiveValueContext.ts` | 23 |
| `settle/loadFieldNodeAtMount/loadFieldNodeAtMount.ts` | 21 |
| `settle/utils/reset/resetFieldNodeForm.ts` | 21 |
| `utils/pathIndex/utils/PathStoreIndex.ts` | 142 |
| `utils/pathIndex/utils/utils/NumericPathIndex.ts` | 58 |
| `navigation/utils/query/findNodes.ts` | 18 |
| `surface/utils/fieldNodeFactory.ts`(core 내부) | 90 |

줄 번호는 재검토 후보 기준입니다. 빈 이름·값·문자열 연결의 빈 문자열과 구분하여 소유자가 변경 범위를 결정합니다.

독립 검토 P3-1에서 엔진 7파일의 루트 리터럴 9개를 추가로 상수화했습니다(두 루트 비교와 blueprint의 두 루트 인수를 포함). 최초 107개와 합쳐 총 **116개**이며, 빈 이름 세그먼트는 계속 별도 문법으로 유지합니다.

첫 표적 시험은 workspace `@winglet/json` dist 부재로 7파일 적재가 실패했습니다. 설치 없이 지정된 common-utils와 json build로 준비했고, 수정 전후 동일한 포인터 시험 **8파일·96건**, 수정 뒤 패키지 typecheck·lint를 통과했습니다. lint의 첫 실행도 미준비 json-schema·react-utils dist 때문에 실패했으며 지정 build 뒤 통과했습니다. 상수의 literal 형으로 좁아진 조립 변수는 `string` 주석으로 원래 형을 유지합니다.

## 항목 2 — 고빈도 membership과 체인

제품 `.includes`는 **84 → 35**로 줄었습니다(**49개 치환**). 정착·파생·탐색·런타임 유효 스키마·쓰기 시 청사진 아이템 조회·포인터 해석·입력 해석을 대상으로 했습니다. optional 배열의 부재는 기존 분기/기본값을 유지하며, 숫자 ID·문자열·객체 identity만 비교해 `NaN`의 SameValueZero 차이를 만들지 않습니다.

배열 정렬 후보의 `filter/map`, 나감 식 색인의 `filter/map`, 파생 감시 의존의 `filter/map`을 단일 순회로 합쳤습니다. 유효 선언 선택의 연속 `filter` 세 곳도 단일 수집 순회와 기존 정렬로 대체했습니다. **체인/선택 4지점**이며 제거한 prototype iteration은 10개입니다. 파생 의존 값은 원래 식 의존 다음 감시 의존 순서이고, 중복 제외 조건·평가 횟수는 그대로입니다.

유지한 35개 membership 지점은 [항목 2 원시](raw/micro-hygiene/item-2.json)의 `kept`에 파일·행으로 전부 열거했습니다. 청사진 작성 검증·기능 분석·정적 마운트·입력 정의 준비는 일회성 경로입니다. UI의 checkbox 선택 membership은 임의 값의 `NaN` 의미를 보존하며, union 렌더의 선택과 정의 매칭은 이후 반복 정리에서 함께 검토합니다. 제품 전체 반복 방식은 항목 5에서 별도 집계합니다.

표적 포인터·유효 스키마·파생·배열·나감·배달 시험 **44파일·436건**, 패키지 typecheck·lint를 통과했습니다. 추가 세 지점에서도 typecheck·lint를 재확인했습니다.

## 항목 3 — Set/Map 수명과 작은 dirty 후보

기준 제품 `src/core`의 생성식은 **422개**입니다. 문자열 검색의 행 수 대신 각 AST `new Set`/`new Map`을 셉니다. **(가) 상주/호출 밖으로 보존하는 자료 170개, (나) 기존 정착 scratch 22개, (다) 호출 한정 자료 230개**로 분류했습니다. 상주 여부는 값 자체가 보존되는지로 판단하며, 임시 Map의 값만 최종 결과로 넘어가는 경우 Map 자체는 (다)입니다. 조건부 캐시는 한 경로라도 보존될 수 있으면 (가)로 두어 교체 대상에서 제외했습니다. 생성식별 ID·파일·행·분류·판단은 [전체 분류 원시](raw/micro-hygiene/set-map-classification.json)에 보존했습니다.

첫 후보의 **(다) 1지점**인 `dirtyChildren`의 membership은 실제 부모 예약 맵 크기가 **64개 이하**일 때 기존 반환 배열을 재사용합니다. 새 상주 구조나 보조 배열은 없습니다. 결과 개수는 예약 엔트리 수 이하이므로 비교는 최대 64×64이며 10,000에 훨씬 못 미치는 상한을 런타임에서 증명합니다. 65개 이상은 기존 Set을 유지하여 큰 입력의 선형 방문·중복 제거를 보존합니다. 첫 후보에서 나머지 임시 자료는 임의 스키마·엔트리·게이트·노드·경로·기록 수의 제품 상한을 증명하지 못하거나 반복 조회/반환 자료의 소유 계약을 유지해야 하므로 그대로 두었습니다. 첫 후보의 생성식 정적 총수는 422개 그대로지만 작은 호출의 Set 생성은 1 → 0입니다.

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


### 소유자 접근 패턴 기준 재검토 — 임시 230곳

분류 단위의 임시는 청사진 작성·정착·사슬 마감 한 호출의 수명이며, 그 안의 보조 함수 사이에서 재사용하는 인덱스도 포함합니다. 값의 재활용과 많은 읽기/쓰기는 유지하고, 상한 없는 배열 대체의 중첩 비교는 피합니다. `dirtyChildren`의 기존 64 경로는 최악 4,096회로 제한되므로 소유자 기준의 상한 없는 폭증과 다르다는 조정자 판정에 따라 유지합니다. 경계 시험 0/0/1과 순서·중복 검사는 바꾸지 않았으며 해당 행은 소유자 리뷰 대상으로 표시합니다.

추가 정리는 **3지점**입니다: ID 55는 고정 1개인 splice 루트 인수 배열을 그대로 쓰고, ID 56은 고유 tail 경로를 실제 삭제 후보 64개 이하에서 배열로 수집하며 초과는 Set을 유지합니다. ID 57은 읽히지 않는 clear 인수와 빈 fallback Set을 제거합니다. 따라서 초기 1지점에 더해 총 **4지점**이며, core의 정적 생성식은 **422→420**입니다. 작은 tail의 Set 한 개를 최대 64칸 배열 한 개로 바꾸고, splice는 기존 한 칸 인수 배열을 재사용합니다. 새로운 상주 자료는 없습니다. 기존 clear의 세 oracle 비교는 사용하지 않는 네 번째 인수만 제거하고 모든 단언을 유지합니다. 추가 정리의 첫 검사에서 oracle fixture가 그 인수에 의존해 7건이 실패했습니다. fixture는 공개 쓰기 직전 실제 item 루트 경로를 직접 잡아 이전 방식의 prune/re-key를 수행하도록 고쳤고 host 경로 단언도 추가했습니다. 교정 뒤 기존 **50파일 327건**, typecheck·lint가 통과했으며 실패와 교정 로그를 함께 보존했습니다. 작은 tail의 컨테이너 분기는 삭제 항목마다 O(1)이며, 최종 시간/힙 비용은 짧은 창에서 판단합니다.

재검토 P3-D 보호 시험은 실제 공개 splice의 singleton 한 건, 공개 pop의 N=3/65 두 건, 직접 `applyArrayTail`을 호출한 제거 64/65개 경계 두 건의 **5사례**입니다. 각 경로의 실제 호출과 prune 인수·순서를 확인하고 scratch를 finally에서 해제합니다. 처음 제안된 `setValue(65→1/66→1)`는 꼬리 적용 호출 0으로 실패하여 지시대로 중단·질문했고, 승인된 공개 pop/내부 경계 방식으로 바꿨습니다. 64개 분기를 항상 `new Set<string>()`으로 되돌린 변이는 배열 단언 실패를 검출했으며 제품 소스를 바이트 그대로 복구했습니다. 일반 값 교체와 구조 동사를 같은 경로라고 가정하지 않습니다. 공개 동사로는 pop이 항상 1개만 제거하므로 `applyArrayTail`의 65개 이상 Set 분기는 공개 경로에서 도달 불가입니다. 항상 배열로 단순화할지는 소유자 결정 후속이며 이번 과제에서는 코드를 바꾸지 않았습니다.

아래 230행은 각각 실제 접근·입력 차원·판단을 기록합니다. 위치는 반복 정리 머리 `b50f06050`의 줄을 가리키고 ID는 최초 기준과 같습니다. `반복 멤버십`/`중첩 비교`는 배열로 대체했을 때 키 검색을 기존 질의마다 추가하게 되는 경우를 구분하며, 수집만 하더라도 Set의 중복 제거를 배열에서 공짜로 보지 않습니다. 여러 함수에 전달되는 문맥 인덱스의 크기는 해당 마감 입력의 고유 키 수로 셉니다. 정적 심볼·프로퍼티·인수 추적은 완전한 호출 그래프를 주장하지 않으며, 남은 불확실성이나 입력 상한 미증명은 유지 판단입니다. [230행 원시](raw/micro-hygiene/temporary-set-map-access.json)와 [관측한 연산·호출상대](raw/micro-hygiene/temporary-set-map-operations.json.gz)를 함께 남깁니다.

| ID | 위치·자료 | 접근 패턴 | 크기 상한 근거 | 판단·이유 |
| ---: | --- | --- | --- | --- |
| 1 | `src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:178` · `childValues` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `children` · `preferred` · `node.blueprintNode.childEntries`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 2 | `src/core/engine/behaviors/objectBehavior/branch/utils/assembleObject.ts:189` · `seen` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `preferred` · `node.blueprintNode.childEntries` · `Object.keys(extras)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 3 | `src/core/engine/blueprint/blueprint.ts:66` · `templates` | 반복 멤버십 조회 | 상한 불명; 청사진 작성 중 재방문하는 schema identity별 template 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 4 | `src/core/engine/blueprint/blueprint.ts:67` · `constructing` | 반복 멤버십 조회 | 상한 불명; 재귀 작성 중 활성 schema identity와 구성 프레임 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 5 | `src/core/engine/blueprint/blueprint.ts:68` · `declarationInputs` | 반복 멤버십 조회 | 상한 불명; 작성되는 declaration input identity 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 6 | `src/core/engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts:102` · `properties` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < count` · `node.declarations` · `properties`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 7 | `src/core/engine/blueprint/buildNodes/utils/children/populateNodeChildren.ts:104` · `tuples` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < count` · `node.declarations`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 8 | `src/core/engine/blueprint/buildNodes/utils/children/populateVirtualNodes.ts:32` · `groups` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `Object.entries(virtual)` · `host.declarations` · `groups`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 9 | `src/core/engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts:145` · `<inline>` | 반복 멤버십 조회 | 상한 불명; collectDeclarations가 방문하는 schema contribution의 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 10 | `src/core/engine/blueprint/buildNodes/utils/declarations/collectDeclarations.ts:151` · `<inline>` | 반복 멤버십 조회 | 상한 불명; collectDeclarations가 따라가는 참조/기여 경로 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 11 | `src/core/engine/blueprint/buildNodes/utils/declarations/readDiscriminatorBranches.ts:43` · `result` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `index < host[keyword].length` · `UNION_KEYWORDS`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 12 | `src/core/engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts:51` · `children` | 반복 멤버십 조회 | 상한 불명; terminal 전략 트리의 gate-prefix 가지 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 13 | `src/core/engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeStrategy.ts:68` · `children` | 반복 멤버십 조회 | 상한 불명; terminal 전략 트리에서 새 gate-prefix마다 생기는 자식 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 14 | `src/core/engine/blueprint/buildNodes/utils/nodeTypes/resolveNodeTypes.ts:101` · `groups` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `filterArray( declarations, (item) => item.role === 'declaration', )`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 15 | `src/core/engine/blueprint/collectBlueprintWarnings/collectBlueprintWarnings.ts:48` · `seen` | 반복 멤버십 조회 | 상한 불명; `seen.has(key)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 16 | `src/core/engine/blueprint/compileBlueprintExpressions/compileBlueprintExpressions.ts:26` · `visited` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `declarationIndex < declarations.length` · `nodeIndex < context.nodes.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 23 | `src/core/engine/blueprint/utils/features/buildFeatureNodeIndex.ts:58` · `paths` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `getFragmentOwnerPaths(declaration.schemaPath)` · `child.node.declarations`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 24 | `src/core/engine/blueprint/utils/features/collectDeriveConvergenceTargets.ts:46` · `declarations` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `declaration < node.declarations.length` · `index < nodes.length` · `owner < owners.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 25 | `src/core/engine/blueprint/utils/features/collectDeriveConvergenceTargets.ts:47` · `hosts` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < nodes.length` · `dependency < expression.dependencies.length` · `index < expressions.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 26 | `src/core/engine/blueprint/utils/features/collectDeriveConvergenceTargets.ts:73` · `reads` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `dependency < expression.dependencies.length` · `index < expressions.length` · `owner < owners.length`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 27 | `src/core/engine/blueprint/utils/features/collectDeriveConvergenceTargets.ts:77` · `gateExpressions` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < expressions.length` · `gateIndex < entry.gates.length` · `declaration < node.declarations.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 29 | `src/core/engine/blueprint/utils/features/collectTemplateParents.ts:12` · `parents` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `node.childEntries` · `nodes` · `node.itemCandidates ?? (node.item ? [node.item] : [])`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 30 | `src/core/engine/blueprint/validateShape/validateShape.ts:11` · `complete` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `context.nodes`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 31 | `src/core/engine/blueprint/validateShape/validateShape.ts:12` · `active` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `context.nodes`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 32 | `src/core/engine/derive/evaluateDeriveRound/evaluateDeriveRound.ts:54` · `winners` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `evaluated.writes` · `targets` · `table.byDeclaration.get(id) ?? []`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 33 | `src/core/engine/derive/evaluateDeriveRound/evaluateDeriveRound.ts:56` · `traceWinners` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `evaluated.writes` · `targets` · `table.byDeclaration.get(id) ?? []`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 34 | `src/core/engine/derive/evaluateDeriveRound/evaluateDeriveRound.ts:57` · `evaluatedExpressions` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `targets` · `table.byDeclaration.get(id) ?? []` · `selected`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 36 | `src/core/engine/derive/utils/evaluate/addActiveRuleKey.ts:19` · `sourceKeys` | 반복 멤버십 조회 | 상한 불명; derive source별 활성 rule key 수; 같은 DeriveState 안에서 재사용 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 37 | `src/core/engine/derive/utils/evaluate/evaluateResetInteraction.ts:37` · `resetNodes` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `getRuleTargets(node, rule, state)` · `table.byDeclaration.get(id) ?? []` · `selected`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 38 | `src/core/engine/derive/utils/evaluate/evaluateResetInteraction.ts:39` · `evaluatedExpressions` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `getRuleTargets(node, rule, state)` · `table.byDeclaration.get(id) ?? []` · `selected`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 39 | `src/core/engine/derive/utils/evaluate/getDeriveSourceNodes.ts:22` · `seen` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `state.sourcePaths`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 41 | `src/core/engine/navigation/utils/visit/visitFieldNodes.ts:19` · `seen` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `pending.length > 0`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 42 | `src/core/engine/record/utils/advanceFieldNodeRevision.ts:27` · `byMask` | 반복 멤버십 조회 | 상한 불명; 한 commit의 revision ledger transition mask 수; 마감까지 get/set 재사용 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 43 | `src/core/engine/record/utils/captureFieldNodeChange.ts:70` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 한 delivery chain에서 영향을 받은 고유 path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 50 | `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:78` · `reused` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < plan.slots.length` · `index < oldCount` · `Object.entries(nextItems)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 51 | `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:81` · `destinations` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < plan.slots.length` · `index < oldCount`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 53 | `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySlots.ts:184` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 옮겨 보존하는 inactive slot binding 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 55 | `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArraySplice.ts:100` · `applyArraySplice` | 단일 순회 | 정확히 1; `[removedItem.path]`는 한 삭제 item의 주소 | 배열로 바꿈: prunePerishedPaths는 size와 순회만 사용; 원래 생성자 인수 배열을 그대로 전달해 Set 1개만 제거 |
| 56 | `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArrayTail.ts:138` · `perishedPaths` | 단일 순회 | 배열 경로 ≤64: `oldCount - prefixCount <= 64`; 초과는 기존 Set | 배열로 바꿈: 삭제 index마다 고유 item.path를 한 번 수집; 조회/중복 탐색 없음. 빈 결과는 수집도 생략  공개 동사에서 pop은 항상 1개만 제거하며 65개 이상 Set 분기는 공개 경로에서 도달 불가; 항상 배열로 단순화할지는 소유자 결정 |
| 57 | `src/core/engine/settle/arrangeFieldNodeItems/utils/arraySlots/applyArrayTail.ts:146` · `perishedPaths` | 단일 순회(방문 0) | 정확히 0; 미사용 clear 인수의 빈 fallback Set | 미사용 인수 제거: clearArrayRuntimePaths는 _perished를 읽지 않음; 인수와 그 Set을 제거해 배열도 할당하지 않음 |
| 58 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/clearArrayRuntimePaths.ts:22` · `keys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `index.under(slot)` · `[...index.tail(hostPath, 0)]`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 59 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/clearArrayRuntimePaths.ts:49` · `slots` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `store.pathIndex.tail(hostPath, 0)` · `owned` · `slots`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 60 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/clearArrayRuntimePaths.ts:55` · `warningKeys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `runtime.warningKeysByPath.get(appendSegment(hostPath, index)) ?? []` · `index < oldCount` · `runtime.warningKeysByPath.get(slot) ?? []`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 61 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArrayRuntimePaths.ts:41` · `unaddressed` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `store.pathIndex.tail( hostPath, preservedPrefixCount + moves.length, )` · `[stores.declarations, stores.rules, stores.misfits]` · `[stores.misfits, stores.declarations]`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 62 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArrayRuntimePaths.ts:52` · `moveByPath` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `mapArray(moves, (move) => [move.previous, move.current])`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 63 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArrayRuntimePaths.ts:65` · `warningKeys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `runtime.warningKeysByPath?.get(move.previous) ?? []` · `changed` · `warningKeys`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 65 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArrayRuntimePaths.ts:93` · `misfitKeys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `stores.misfits.pathIndex.under(move.previous)` · `changed` · `misfitKeys`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 66 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyArrayRuntimePaths.ts:107` · `keys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `store.pathIndex.intersecting(move.previous)` · `changed` · `[stores.misfitsMemo]`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 67 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyCommittedRules.ts:23` · `keys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `rules.pathIndex.under(move.previous)` · `moves` · `keys`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 68 | `src/core/engine/settle/arrangeFieldNodeItems/utils/rekey/rekeyPairedPathStore.ts:23` · `keys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `store.pathIndex.under(move.previous)` · `moves` · `keys`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 70 | `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/finishStaticFirstLoad.ts:81` · `byAncestor` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `ancestor` · `index < paths.length` · `byAncestor`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 72 | `src/core/engine/settle/loadFieldNodeAtMount/utils/staticFirst/loadStaticFirstTree.ts:137` · `deltas` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `state`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 74 | `src/core/engine/settle/utils/commit/commitExitPolicyValues.ts:84` · `candidates` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `context.stateDirtyNodes` · `source.children ?? []` · `source.blueprintNode.declarations`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 75 | `src/core/engine/settle/utils/commit/commitExitPolicyValues.ts:164` · `evaluated` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `getControlLayers( node, context.selectedDeclarationIds, )` · `candidates`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 76 | `src/core/engine/settle/utils/commit/commitGlobalState.ts:26` · `deltas` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `node.interactionState` · `changedKeys` · `Object.entries(previous)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 77 | `src/core/engine/settle/utils/commit/commitGlobalState.ts:27` · `departing` | 반복 멤버십 조회 | 상한 불명; `departing.has(node)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 78 | `src/core/engine/settle/utils/commit/commitGlobalState.ts:43` · `loadNodes` | 반복 멤버십 조회 | 상한 불명; `loadNodes.has(node)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 79 | `src/core/engine/settle/utils/commit/commitSettlement.ts:77` · `<inline>` | 단일 순회 | 상한 불명; 마감에서 누적하는 오류/경고 식별 키 수; 중복 제거 필요 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 80 | `src/core/engine/settle/utils/commit/commitSettlement.ts:113` · `warningTasks` | 반복 멤버십 조회 | 상한 불명; commit warning task의 고유 schema/path 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 82 | `src/core/engine/settle/utils/commit/commitSettlement.ts:220` · `byAncestor` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `ancestor` · `index < allPaths.length` · `byAncestor`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 84 | `src/core/engine/settle/utils/commit/finalizeDeriveTrace.ts:19` · `live` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < round.length` · `context.traceRounds`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 86 | `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:51` · `automaticNodes` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < context.automaticLog.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 87 | `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:58` · `<inline>` | 반복 멤버십 조회 | 상한 불명; delivery affected path의 고유 주소 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 88 | `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:77` · `candidates` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < children.length` · `context.changedNodes` · `context.pathChanges`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 89 | `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:78` · `enteredByParent` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `context.entered` · `context.changedNodes`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 90 | `src/core/engine/settle/utils/commit/markCommitDeliveries.ts:393` · `seenDeparting` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `departing.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 103 | `src/core/engine/settle/utils/compute/childSelection/gateSelection/computeRootGateSelection.ts:26` · `groupByGate` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `group.literalsByGate.keys()` · `groups` · `index < host.declarations.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 104 | `src/core/engine/settle/utils/compute/childSelection/gateSelection/computeRootGateSelection.ts:31` · `rootGroups` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < host.declarations.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 106 | `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectLiteralTableChildren.ts:29` · `active` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `bucket` · `groupIndex < table.groups.length && table.groups[groupIndex].firstStepIndex <= index` · `verify \|\| shadow ? fullIndex < table.plan.steps.length : cursor < selected.length \|\| groupIndex`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 107 | `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectPredicateTableChildren.ts:33` · `active` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `bucket` · `groupIndex < table.groups.length && table.groups[groupIndex].firstStepIndex <= index` · `verify \|\| shadow ? fullIndex < table.plan.steps.length : cursor < selected.length \|\| groupIndex`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 108 | `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectPredicateTableChildren.ts:98` · `firstThrow` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `verify \|\| shadow ? fullIndex < table.plan.steps.length : cursor < selected.length \|\| groupIndex`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 109 | `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectPredicateTableChildren.ts:99` · `throwing` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `verify \|\| shadow ? fullIndex < table.plan.steps.length : cursor < selected.length \|\| groupIndex`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 110 | `src/core/engine/settle/utils/compute/childSelection/gateSelection/selectRootGateDeclarations.ts:40` · `admitted` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `selected` · `index < node.blueprintNode.declarations.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 111 | `src/core/engine/settle/utils/compute/childSelection/getGateSelectionTable.ts:71` · `watchedNames` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `plan.baseline` · `index < plan.steps.length` · `names`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 112 | `src/core/engine/settle/utils/compute/childSelection/getGateSelectionTable.ts:75` · `groups` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < plan.steps.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 115 | `src/core/engine/settle/utils/compute/childSelection/getGateSelectionTable.ts:80` · `predicateGroups` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < plan.steps.length` · `predicateGroups` · `predicateGroups.values()`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 119 | `src/core/engine/settle/utils/compute/childSelection/prepareGateSelection.ts:28` · `tables` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `blueprint.nodes` · `declaration.gates` · `node.declarations`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 120 | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:142` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 선택에서 방문한 presence/entry path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 121 | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:194` · `seen` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < inactiveEntries.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 122 | `src/core/engine/settle/utils/compute/childSelection/selectChildren.ts:306` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 선택에서 보류/변경하는 entry path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 123 | `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:218` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 현재 선택의 entered/changed path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 124 | `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:231` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 선택에서 deferred/exit membership으로 재사용하는 node/path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 125 | `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:263` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 현재 선택의 dirty/presence path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 126 | `src/core/engine/settle/utils/compute/childSelection/selectEntryStep.ts:410` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 선택에서 마감까지 참조하는 gate/exit membership 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 128 | `src/core/engine/settle/utils/compute/childSelection/utils/createStaticEntryReuser.ts:97` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 정적 entry 재사용 중 마감에 전달하는 변화 membership 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 130 | `src/core/engine/settle/utils/compute/childSelection/utils/prepareStaticHost.ts:82` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 정적 host 준비 중 소유하는 후보 node/path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 132 | `src/core/engine/settle/utils/compute/childSelection/utils/prepareStaticHost.ts:126` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 정적 host 준비의 후보 membership 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 133 | `src/core/engine/settle/utils/compute/childSelection/utils/prepareStaticHost.ts:152` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 정적 host 준비에서 마감까지 유지하는 후보 membership 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 134 | `src/core/engine/settle/utils/compute/computeNode.ts:52` · `<inline>` | 반복 멤버십 조회 | 상한 불명; node 계산의 부모/자식 기준 snapshot 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 135 | `src/core/engine/settle/utils/compute/computeNode.ts:59` · `computes` | 반복 멤버십 조회 | 상한 불명; presenceMetrics.computes의 계산 node 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 136 | `src/core/engine/settle/utils/compute/computeNode.ts:128` · `computed` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `recalculated` · `index < candidates.length` · `!wheel && (context.presenceRegistrations ?? 0) !== registrations`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 137 | `src/core/engine/settle/utils/compute/computeNode.ts:175` · `<inline>` | 반복 멤버십 조회 | 상한 불명; node 계산 중 exit/presence 상태로 재사용하는 node/path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 138 | `src/core/engine/settle/utils/compute/computeNode.ts:199` · `inputs` | 반복 멤버십 조회 | 상한 불명; gate wheel frame의 관측 input/gate 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 139 | `src/core/engine/settle/utils/compute/computeNode.ts:212` · `<inline>` | 반복 멤버십 조회 | 상한 불명; node wheel에서 참조하는 원래 계산 snapshot 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 140 | `src/core/engine/settle/utils/compute/dirtyChildren.ts:24` · `seen` | 반복 멤버십 조회 | 배열 경로 ≤64, 최악 4096회 identity 비교; 65 이상은 기존 Set | 배열로 바꿈: 기존 반환 children 배열을 재사용; 명시적 작은 상한이 중첩 비교를 제한함. 소유자 리뷰 대상 |
| 143 | `src/core/engine/settle/utils/compute/hasRecursiveExpansion.ts:101` · `cyclic` | 반복 멤버십 조회 | 상한 불명; 재귀 확장 탐색에서 방문하는 node와 순환 후보 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 144 | `src/core/engine/settle/utils/compute/hasRecursiveExpansion.ts:101` · `cyclic` | 반복 멤버십 조회 | 상한 불명; 재귀 확장의 마감 내 순환 후보 node 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 145 | `src/core/engine/settle/utils/compute/primeHost.ts:47` · `<inline>` | 반복 멤버십 조회 | 상한 불명; primeHost가 재사용하는 원래 host/schema snapshot 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 146 | `src/core/engine/settle/utils/compute/primeHost.ts:51` · `<inline>` | 반복 멤버십 조회 | 상한 불명; primeHost가 재사용하는 자식/출력 snapshot 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 147 | `src/core/engine/settle/utils/compute/selectNodeSchema.ts:47` · `branches` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `active` · `branches`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 150 | `src/core/engine/settle/utils/compute/utils/prepareHostWheelPlan.ts:48` · `seen` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `gates` · `relocated`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 151 | `src/core/engine/settle/utils/controls/calculateStateKeys.ts:88` · `candidates` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `stateDirtyNodes` · `source.children` · `candidates`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 152 | `src/core/engine/settle/utils/controls/calculateStateKeys.ts:102` · `evaluated` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `KEY_NAMES` · `getControlLayers(node, selectedDeclarationIds)` · `candidates`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 159 | `src/core/engine/settle/utils/dependencies/captureProjectionBaseline.ts:19` · `<inline>` | 반복 멤버십 조회 | 상한 불명; projection baseline의 고유 live node 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 160 | `src/core/engine/settle/utils/dependencies/captureProjectionBaseline.ts:21` · `children` | 반복 멤버십 조회 | 상한 불명; `children.has(child)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 161 | `src/core/engine/settle/utils/dependencies/captureProjectionBaseline.ts:24` · `<inline>` | 반복 멤버십 조회 | 상한 불명; projection baseline 마감까지 참조하는 변화 path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 162 | `src/core/engine/settle/utils/dependencies/deferPresenceTemplate.ts:32` · `<inline>` | 반복 멤버십 조회 | 상한 불명; presenceTemplates의 kind/template 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 168 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:146` · `declarations` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `blueprint.nodes.flatMap((node) => mapArray( node.declarations, (declaration): [number, Property` · `ids` · `dependencies`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 169 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:214` · `candidates` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `declaration.gates` · `node.declarations` · `this.blueprint.nodes`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 170 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:215` · `plain` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `this.ordinaryOwners` · `declaration.gates` · `node.declarations`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 171 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:276` · `runNumbers` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `ranksByName` · `grouped`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 172 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:280` · `grouped` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `rank < node.owners.length` · `grouped`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 174 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:300` · `runByName` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `ranksByName` · `grouped`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 175 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:351` · `emitted` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `paths` · `node.plainOwners ?? mapArray(node.owners, (entry, rank) => ({ entry, rank }))` · `living`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 176 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:352` · `hostsEmitted` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `node.splitBuckets ?? []`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 177 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:454` · `owners` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `expandTemplatePaths( root, path, this.pathSegments(path, root.runtime), )` · `node.owners` · `this.pathSegments(changedPath, root.runtime)`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 178 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:519` · `owners` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `ancestorOwners` · `direct`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 179 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:520` · `stateOnly` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `ancestorOwners`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 180 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:521` · `outerTemplates` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `node.owners` · `nodes`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 181 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:522` · `directTemplates` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `node.owners` · `nodes`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 182 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:530` · `ancestorOwners` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `ancestorOwners` · `node.owners` · `nodes`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 183 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:533` · `memo` | 반복 멤버십 조회 | 상한 불명; presenceLevels가 해석하는 고유 경로 및 ancestor 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 184 | `src/core/engine/settle/utils/dependencies/getDependencyIndex.ts:551` · `direct` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `direct` · `node.owners` · `nodes`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 187 | `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:47` · `<inline>` | 반복 멤버십 조회 | 상한 불명; changedPresence의 고유 변경 path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 188 | `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:48` · `<inline>` | 반복 멤버십 조회 | 상한 불명; presencePrefixes의 고유 prefix 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 189 | `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:52` · `owners` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `affected.owners` · `names` · `owners`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 190 | `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:53` · `ownerStamps` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `affected.owners` · `names` · `owners`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 191 | `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:54` · `stateOnly` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `affected.stateOnly` · `names` · `stateOnly`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 192 | `src/core/engine/settle/utils/dependencies/registerPresenceChanges.ts:144` · `<inline>` | 반복 멤버십 조회 | 상한 불명; presenceQueryCursors의 ancestor별 cursor 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 193 | `src/core/engine/settle/utils/dependencies/registerRecalculation.ts:71` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 등록 검증 shadow의 원래 gate/dependency 값 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 194 | `src/core/engine/settle/utils/dependencies/registerRecalculation.ts:80` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 등록 검증 shadow의 owner/schema 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 195 | `src/core/engine/settle/utils/dependencies/registerRecalculation.ts:97` · `expanded` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `ancestor && !expanded.has(ancestor)` · `context.dirtyPaths`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 196 | `src/core/engine/settle/utils/dependencies/registerRecalculation.ts:107` · `changedAncestors` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `prefix` · `context.changedRaw` · `context.dirtyPaths`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 197 | `src/core/engine/settle/utils/dependencies/supplementSplitOwner.ts:30` · `<inline>` | 반복 멤버십 조회 | 상한 불명; split owner 보강에서 참조하는 baseline 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 198 | `src/core/engine/settle/utils/derivation/collectDeriveSourcePaths.ts:20` · `paths` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `context.contextOwners ?? []` · `dependencies.affected(changed, context.root)` · `context.changedRaw`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 199 | `src/core/engine/settle/utils/derivation/getDeriveState.ts:22` · `<inline>` | 반복 멤버십 조회 | 상한 불명; DeriveState의 이전/현재 rule 평가 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 200 | `src/core/engine/settle/utils/derivation/getDeriveState.ts:23` · `consumedRuleValues` | 반복 멤버십 조회 | 상한 불명; DeriveState.consumedRuleValues의 rule-target 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 201 | `src/core/engine/settle/utils/derivation/getDeriveState.ts:24` · `activeRuleKeys` | 반복 멤버십 조회 | 상한 불명; DeriveState.activeRuleKeys의 활성 rule 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 202 | `src/core/engine/settle/utils/derivation/getDeriveState.ts:25` · `activeRuleKeysBySource` | 반복 멤버십 조회 | 상한 불명; DeriveState.activeRuleKeysBySource의 source/rule 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 203 | `src/core/engine/settle/utils/derivation/getDeriveState.ts:26` · `activeUnsetTargets` | 반복 멤버십 조회 | 상한 불명; DeriveState.activeUnsetTargets의 target 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 204 | `src/core/engine/settle/utils/derivation/getDeriveState.ts:27` · `appliedRanks` | 반복 멤버십 조회 | 상한 불명; DeriveState.appliedRanks의 target/rank 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 205 | `src/core/engine/settle/utils/derivation/getDeriveState.ts:28` · `visitedSourcePaths` | 단일 순회 | 상한 불명; DeriveState.visitedSourcePaths의 고유 방문 source 주소 수 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 206 | `src/core/engine/settle/utils/errors/recordSettlementFailure.ts:24` · `<inline>` | 반복 멤버십 조회 | 상한 불명; failureKeys에 들어오는 고유 실패 identity 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 207 | `src/core/engine/settle/utils/gates/evaluateGate.ts:98` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 한 gate round에 관측한 dependency/input 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 212 | `src/core/engine/settle/utils/gates/evaluateGate.ts:256` · `<inline>` | 반복 멤버십 조회 | 상한 불명; gate 평가에서 마감까지 참조하는 식/입력 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 213 | `src/core/engine/settle/utils/gates/flushPendingGateReads.ts:51` · `ancestors` | 반복 멤버십 조회 | 상한 불명; `ancestors.has(node)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 215 | `src/core/engine/settle/utils/gates/getGateBudgetCap.ts:31` · `decisions` | 단일 순회 | 상한 불명; `decisions.add(key)`에서 다루는 고유 키 수 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 216 | `src/core/engine/settle/utils/gates/getGateBudgetCap.ts:32` · `fieldControls` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `declaration.gates`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 218 | `src/core/engine/settle/utils/gates/getGateBudgetCap.ts:118` · `decisions` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `index.decisionsByGate.get(gate) ?? []` · `gates`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 236 | `src/core/engine/settle/utils/gates/prepareGateTableRound.ts:65` · `<inline>` | 반복 멤버십 조회 | 상한 불명; gateSelectionRounds의 live host round 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 237 | `src/core/engine/settle/utils/gates/prepareGateTableRound.ts:68` · `values` | 반복 멤버십 조회 | 상한 불명; gate round.values의 gate/step별 평가 결과 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 238 | `src/core/engine/settle/utils/gates/prepareGateTableRound.ts:80` · `inputs` | 반복 멤버십 조회 | 상한 불명; selectionShadow.inputs의 gate/owner/input 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 239 | `src/core/engine/settle/utils/gates/readGateHostView.ts:34` · `<inline>` | 반복 멤버십 조회 | 상한 불명; gateHostViews의 projected host path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 240 | `src/core/engine/settle/utils/gates/readGateSelectionGroup.ts:49` · `indices` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `bucket` · `childGroup.buckets.values()` · `indices`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 241 | `src/core/engine/settle/utils/gates/watchSplitRegistration.ts:25` · `dirty` | 반복 멤버십 조회 | 상한 불명; split registration shadow의 dirty path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 242 | `src/core/engine/settle/utils/gates/watchSplitRegistration.ts:26` · `shape` | 단일 순회 | 상한 불명; split registration shadow의 고유 shape path 수 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 243 | `src/core/engine/settle/utils/gates/watchSplitRegistration.ts:27` · `owners` | 단일 순회 | 상한 불명; split registration shadow의 고유 owner path 수 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 244 | `src/core/engine/settle/utils/inactive/getInactiveValueContext.ts:56` · `origins` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `context.pathChanges`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 245 | `src/core/engine/settle/utils/inactive/resolveInactiveValue.ts:91` · `<inline>` | 반복 멤버십 조회 | 상한 불명; inactive resolver의 owner/path origin 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 246 | `src/core/engine/settle/utils/input/interpretFieldNodeInput.ts:64` · `bindings` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `template.childEntries`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 247 | `src/core/engine/settle/utils/input/utils/verifyWriteEpoch.ts:16` · `actual` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `context.dirtyPaths` · `index < count`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 248 | `src/core/engine/settle/utils/input/utils/watchWriteEpoch.ts:15` · `<inline>` | 반복 멤버십 조회 | 상한 불명; writeEpochShadow의 dirty parent/child path 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 249 | `src/core/engine/settle/utils/loadValues/alignArraySnapshotSlots.ts:26` · `copies` | 반복 멤버십 조회 | 상한 불명; `copies.get(source)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 250 | `src/core/engine/settle/utils/loadValues/alignArraySnapshotSlots.ts:27` · `draftContainers` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `hosts`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 251 | `src/core/engine/settle/utils/loadValues/alignArraySnapshotSlots.ts:28` · `holey` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `hosts` · `index < segments.length - 1`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 252 | `src/core/engine/settle/utils/loadValues/alignArraySnapshotSlots.ts:44` · `byPath` | 반복 멤버십 조회 | 상한 불명; `byPath?.get(path)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 253 | `src/core/engine/settle/utils/reset/clearSubtreeState.ts:13` · `visited` | 반복 멤버십 조회 | 상한 불명; `visited.has(current)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 256 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:96` · `excluded` | 반복 멤버십 조회 | 상한 불명; 한 split run의 definition.ranks 원소 수와 excluded rank 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 257 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:97` · `released` | 반복 멤버십 조회 | 상한 불명; 한 split run에서 release된 rank/path 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 258 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:101` · `living` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `liveRanks` · `state.released` · `run < bucket.runs.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 259 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:161` · `children` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `parent !== anchor.hostPath`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 260 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:201` · `linked` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `current && !linked.has(current)` · `this`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 261 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:212` · `children` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `current && !linked.has(current)` · `this`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 262 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:233` · `children` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `!this.has(current)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 263 | `src/core/engine/settle/utils/scratch/DirtyPathSet.ts:251` · `children` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `parent !== path`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 284 | `src/core/engine/settle/utils/scratch/updatePendingExitIndex.ts:32` · `children` | 반복 멤버십 조회 | 상한 불명; `children.get(path)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 293 | `src/core/engine/settle/utils/slots/collectHostSlotValues.ts:22` · `entries` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `host.inactiveSlots?.keys()` · `host.inactiveSlotOverlays?.keys() ?? []` · `host.inactiveSlotBaselines?.keys() ?? []`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 294 | `src/core/engine/settle/utils/slots/collectHostSlotValues.ts:27` · `active` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `entries` · `host.inactiveSlotChildren?.values() ?? []`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 295 | `src/core/engine/settle/utils/slots/commitSlotChanges.ts:18` · `visited` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `current` · `hosts`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 296 | `src/core/engine/settle/utils/slots/commitSlotChanges.ts:31` · `bindings` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `host.inactiveSlots?.keys()` · `host.inactiveSlotOverlays?.keys() ?? []` · `hosts`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 299 | `src/core/engine/settle/utils/slots/createClearedArrayOverlay.ts:79` · `<inline>` | 반복 멤버십 조회 | 상한 불명; clear overlay에서 보유한 고유 slot/entry 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 308 | `src/core/engine/settle/utils/slots/getSlotEntries.ts:21` · `entries` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `host?.children ?? []` · `host?.inactiveSlots?.keys() ?? []` · `host?.inactiveSlotOverlays?.keys() ?? []`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 309 | `src/core/engine/settle/utils/slots/markRestoredSlotRaw.ts:14` · `<inline>` | 반복 멤버십 조회 | 상한 불명; slotRestoredRaw가 기억하는 restored live node 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 310 | `src/core/engine/settle/utils/slots/markSlotChange.ts:19` · `<inline>` | 반복 멤버십 조회 | 상한 불명; slotAutomaticLog의 host와 slot binding 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 311 | `src/core/engine/settle/utils/slots/markSlotChange.ts:21` · `bindings` | 반복 멤버십 조회 | 상한 불명; `bindings.has(entry)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 315 | `src/core/engine/settle/utils/slots/materializeInactiveSlotValues.ts:36` · `chosen` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `values`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 317 | `src/core/engine/settle/utils/slots/pruneArraySlotTail.ts:23` · `entries` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `host.inactiveSlots?.keys()` · `host.inactiveSlotOverlays?.keys() ?? []` · `entries`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 318 | `src/core/engine/settle/utils/slots/pruneSlotSources.ts:34` · `entries` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `host.inactiveSlots?.keys()` · `host.inactiveSlotOverlays?.keys() ?? []` · `entries`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 320 | `src/core/engine/settle/utils/slots/pruneSlotSources.ts:65` · `entries` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `host.inactiveSlots?.keys()` · `host.inactiveSlotOverlays?.keys() ?? []` · `entries`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 322 | `src/core/engine/settle/utils/slots/rekeyArraySlotBindings.ts:26` · `entries` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `host.inactiveSlots?.keys()` · `host.inactiveSlotOverlays?.keys() ?? []` · `entries`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 323 | `src/core/engine/settle/utils/slots/rekeyArraySlotBindings.ts:30` · `destinations` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `mapArray(moves, (move) => [move.previous, move.current])` · `entries`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 336 | `src/core/engine/settle/utils/transition/collectFillDescendants.ts:23` · `firstEvaluations` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < count`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 337 | `src/core/engine/settle/utils/transition/finalizeExits.ts:80` · `misfitIndex` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `context.pendingExits.values()` · `context.root.runtime.misfitPaths` · `[...(misfitIndex.get(node.path) ?? [])]`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 338 | `src/core/engine/settle/utils/transition/finalizeExits.ts:86` · `paths` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `context.root.runtime.misfitPaths` · `context.pendingExits.values()`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 339 | `src/core/engine/settle/utils/transition/finalizeExits.ts:116` · `affectedAncestors` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `ancestor` · `context.exited` · `[...affectedAncestors].sort( (left, right) => right.path.length - left.path.length, )`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 340 | `src/core/engine/settle/utils/transition/finalizePerished.ts:30` · `perishing` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `context.perished` · `pendingExits` · `current`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 341 | `src/core/engine/settle/utils/transition/finalizePerished.ts:51` · `perishedPaths` | 단일 순회 | 상한 불명; 한 마감의 소멸 item path 수; 겹친 출처 중복 제거 필요 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 342 | `src/core/engine/settle/utils/transition/finalizePerished.ts:73` · `resizedHosts` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `context.arrayCounts`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 343 | `src/core/engine/settle/utils/transition/pruneArrayTailPaths.ts:26` · `removed` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `store.pathIndex.tail(host, count)` · `[stores.declarations, stores.misfits, stores.rules]` · `hosts`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 344 | `src/core/engine/settle/utils/transition/prunePerishedPaths.ts:20` · `warningKeys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `runtime.warningKeysByPath.get(path) ?? []` · `paths` · `warningKeys`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 345 | `src/core/engine/settle/utils/transition/restoreArrayStructure.ts:28` · `prior` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `previousItems` · `host.children ?? []` · `index >= 0`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 346 | `src/core/engine/settle/utils/transition/transitionSettlement.ts:47` · `filled` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < entered.length` · `depth < enteredByDepth.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 347 | `src/core/engine/settle/utils/transition/transitionSettlement.ts:48` · `filledNodes` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < entered.length` · `depth < enteredByDepth.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 348 | `src/core/engine/settle/utils/transition/transitionSettlement.ts:122` · `fillHosts` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < entered.length` · `depth < enteredByDepth.length` · `ancestor`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 349 | `src/core/engine/settle/utils/transition/transitionSettlement.ts:123` · `fillAncestors` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < entered.length` · `depth < enteredByDepth.length` · `logIndex < context.arrayStructureLog.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 350 | `src/core/engine/settle/utils/transition/transitionSettlement.ts:155` · `newArrayHosts` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < count`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 358 | `src/core/engine/utils/pathIndex/utils/PathStoreIndex.ts:111` · `keys` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `this.under(path)` · `this.prefixes.get(ancestor)?.exact ?? []` · `ancestor`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 370 | `src/core/engine/validation/utils/copy/createValidatorCopy.ts:47` · `seen` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `[[authored, copy]]` · `Object.entries(current.source)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 373 | `src/core/engine/validation/utils/route/isOffUnionBranchIssue.ts:54` · `visited` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `blueprint.fragments` · `index < count`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 374 | `src/core/engine/validation/utils/route/routeValidationIssues.ts:37` · `<inline>` | 반복 멤버십 조회 | 상한 불명; validation route의 노드별 이전 오류 snapshot 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 376 | `src/core/engine/validation/utils/route/routeValidationIssues.ts:41` · `activeIds` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < ids.length` · `runtime.committedDeclarationIds.values()` · `index < issues.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 377 | `src/core/engine/validation/utils/route/routeValidationIssues.ts:90` · `changed` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `candidates` · `changed`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 378 | `src/core/engine/validation/utils/route/routeValidationIssues.ts:91` · `candidates` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `before.keys()` · `next.keys()` · `candidates`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 385 | `src/core/engine/write/utils/chain/deliverWave.ts:42` · `siblingIndexes` | 반복 멤버십 조회 | 상한 불명; `siblingIndexes.get(parent)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 386 | `src/core/engine/write/utils/chain/deliverWave.ts:60` · `passed` | 반복 멤버십 조회 | 상한 불명; runtime adoption 연쇄가 지나가는 runtime 수; 초기 1 이후 add 가능 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 387 | `src/core/engine/write/utils/chain/exitFieldNodeChain.ts:32` · `passed` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `raised` · `passed` · `isFieldNodeChainRoot<Self>(active.runtime.adoptedRoot)`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 389 | `src/core/engine/write/utils/chain/exitFieldNodeChain.ts:154` · `raised` | 단일 순회 | 상한 불명; 고유 엔트리 수는 `raised` · `isFieldNodeChainRoot<Self>(active.runtime.adoptedRoot)`에 비례 | 상한 불명: 수집/순회는 한 작업 안이지만 임의 입력 크기와 중복 제거 비용의 작은 상한을 증명하지 못함 |
| 390 | `src/core/engine/write/utils/chain/flushQueuedEvents.ts:50` · `owners` | 반복 멤버십 조회 | 상한 불명; queued event flush의 runtime adoption 연쇄 길이; 초기 1 이후 add 가능 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 396 | `src/core/engine/write/utils/chain/utils/compareDocumentOrder.ts:38` · `positions` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `(parent.children ?? []).entries()`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 397 | `src/core/engine/write/utils/entry/dispatchClearSubtreeState.ts:27` · `deltas` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `changedKeys` · `Object.entries(previous)` · `Object.entries(next)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 404 | `src/core/engine/write/utils/entry/dispatchSetState.ts:33` · `deltas` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `changedKeys` · `Object.entries(previous)` · `Object.entries(next)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 405 | `src/core/engine/write/utils/entry/dispatchSetSubtreeState.ts:31` · `deltas` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `changedKeys` · `Object.entries(previous)` · `Object.entries(next)`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 407 | `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:52` · `placed` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `at < list.length` · `index < nodes.length` · `index < current.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 408 | `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:53` · `retired` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `at < previous.length` · `index < nodes.length` · `index < current.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 409 | `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:54` · `paths` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `index < nodes.length` · `index < current.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 410 | `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:68` · `resolved` | 반복 멤버십 조회 | 상한 불명; `resolved.get(dataPath)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 411 | `src/core/engine/write/utils/entry/utils/propagateExternalErrorsToRoot.ts:79` · `present` | 중첩 비교 | 상한 불명; 고유 엔트리 수는 `index < current.length` · `at < list.length` · `index < nodes.length`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 418 | `src/core/engine/write/utils/report/collectChainRecords.ts:31` · `created` | 반복 멤버십 조회 | 상한 불명; 고유 엔트리 수는 `occurrences`에 비례 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 419 | `src/core/engine/write/utils/report/readReferenceOnlySchemaPaths.ts:27` · `seen` | 반복 멤버십 조회 | 상한 불명; `seen.get(left)`에서 다루는 고유 키 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |
| 420 | `src/core/engine/write/utils/report/readReferenceOnlySchemaPaths.ts:56` · `<inline>` | 반복 멤버십 조회 | 상한 불명; 참조 동등 검사에서 한 왼쪽 객체와 비교하는 오른쪽 객체 수 | Set·Map 유지: 기존 인덱스의 재조회/갱신을 보존; 배열 대체는 키마다 선형 검색을 더함 |

## 항목 4 — 두 피연산자 비교

제품 Math 호출 **18 → 4**, **14개**를 `@winglet/common-utils/math`의 `minLite`/`maxLite`로 바꿨습니다. 배열 길이·위치·파생 순위·논리 시각처럼 엔진이 만드는 수를 비교하며, 슬롯 배열 길이는 기존 Array.from의 ToLength 관측을 유지합니다. `NaN` 또는 부호 있는 0을 공개 결과로 내보내는 일반 수 비교로 범위를 넓히지 않았습니다.

유지한 네 곳은 [항목 4 원시](raw/micro-hygiene/item-4.json)에 열거했습니다. predicate table의 세 피연산자 Math.min과 검증 경로의 spread Math.max 두 곳은 대상이 아닙니다. ArrayItems의 작성 minItems는 NaN일 수 있어 `Math.min(NaN, finite)`와 minLite의 차이로 추가 빈 행이 생기는 것을 막기 위해 유지했습니다.

패키지 typecheck·lint와 포인터·파생·배열·게이트 표적 시험 **52파일·446건**을 통과했습니다.

## 항목 5 — 배열 반복

항목 2 뒤 제품 prototype 반복 **229 → 0**입니다. 최초 기준은 239개였고 항목 2에서 10개를 제거했습니다. 남은 229개는 생성한 밀집 메타데이터의 map/filter를 common-utils로, 단락 조건·반환값·희소 입력은 for-loop로 옮겼습니다. 소스의 주석·TSDoc 예제와 동결 레거시는 바꾸지 않았습니다. `setLoadValue.ts`의 세그먼트는 parsePointerSegments의 split/채움 결과이고 `flushBatchWrites.ts`의 batchWrites는 push로만 모은 배열이므로 두 for...of 순회는 모두 밀집 입력을 방문합니다. 이 두 곳에는 건너뛸 구멍이 없습니다. [항목 5 원시](raw/micro-hygiene/item-5.json)에 위치와 변환 방식을 남겼습니다.

순회마다 receiver와 최초 length를 한 번 읽고 희소 입력은 `index in array`로 원래 HasProperty를 보존합니다. 빈 자리만 건너뛰고 명시 undefined는 방문합니다. some/every는 원래 조건 자리에서 단락하며, forEach의 콜백 반환은 순회를 중단하지 않습니다. 콜백은 모두 arrow였고 lexical this를 그대로 유지했습니다. optional 배열의 부재, filter 결과 순서, type predicate의 축소는 보존했으며 형 단언을 추가하지 않았습니다. 후보 2에서는 short-circuit 표현식의 조건과 순서를 명시적 분기·결과 변수로 유지하며 즉시 실행 arrow는 제거했습니다. 새 상주 구조나 공개 이름은 없습니다.

표적 포인터·유효 스키마·파생·배열·게이트·배달·입력 정의·행 동작 시험 **82파일·720건(기존 todo 1)**과 typecheck·lint 및 렌더 표적 **24파일·71건**을 통과했습니다. 첫 타입/린트 검사는 type predicate 및 bool callback 문맥 차이를 검출했고, 같은 의미의 명시적 순회·predicate로 보존한 뒤 통과했습니다. 콜백 반환을 변환할 때 중괄호 없는 조건의 범위가 달라질 수 있음을 코드 점검에서 확인하여 각 반환 치환을 블록으로 묶은 뒤 표적 시험을 실행했습니다.

첫 전체 unit의 세 실패는 후속 정적 교정으로 보존했습니다. binding organ은 array 유틸리티 import를 허용하지 않아 같은 for-loop로 바꿨습니다. P-08 계수 fixture는 기존 includes와 문자열 연산 계수를 유지하면서 배열 indexOf 계수를 더했고, 모든 크기에서 실제 work > 0도 추가했습니다(32/64/128/256, 배율 2). 식 색인 시험은 기존 native find/map 계수를 유지해 둘 다 0임을 확인하고 common-utils map의 실제 입력을 세어 최초 색인 생성 1회를 확인합니다. 시험을 삭제하거나 단언을 줄이지 않았으며 수정 뒤 기존 실패 **3파일·17건**이 통과했습니다. 이 교정은 해당 원래 항목 커밋으로 합칩니다.


### 독립 검토 P2-1에 따른 반복 정리

후보 1의 크기 비용은 다음과 같습니다. 즉시 실행 함수는 호출마다 함수 호출을 더하고 `in` 검사는 방문 원소마다 실행됩니다. 검토의 추가 줄 grep 132개는 실제 인수 없는 IIFE **131개**와 필요한 `useMemo` 콜백 한 줄을 함께 센 값입니다. 그 밖의 형 술어용 인수 있는 IIFE **6개**도 있었습니다. 후보 2에서는 **137개 모두**를 보통 반복문·결과 변수 또는 정적 이름을 가진 형 술어로 옮겼습니다. 파서의 밀집 세그먼트 형 술어는 엔진 내부 한 파일을 세 호출자가 공유하며 패키지 공개 내보내기는 늘리지 않습니다. 필수 hook 콜백은 유지합니다.

| 번들 | 기준 바이트 | 후보 1 | 후보 2 | 후보 2 − 기준 |
| --- | ---: | ---: | ---: | ---: |
| `index.mjs` | 830373 | 861528 | 855127 | +24754 (2.98%) |
| `index.node.mjs` | 829595 | 860750 | 854349 | +24754 (2.98%) |
| `index.cjs` | 847915 | 882316 | 875949 | +28034 (3.31%) |

반복 정리 머리의 제품 AST `in`은 **204→87(117개 제거)**, 반복용 labeled continue는 **16→0**, prototype 반복은 계속 **0**입니다. 밀집인 엔진 작성 배열에서 불필요한 검사를 없애고 callback 값/색인 별칭과 결과 별칭을 합쳤습니다. 내부 불변 메타데이터는 직접 순회하고, 쓰기 도중 바뀔 수 있는 배열은 최초 길이와 수신 배열을 보존합니다. 임시 filter 결과 배열의 소유·순서와 기존 반환 참조는 유지하고 새 상주 컨테이너는 없습니다. 후보 2는 후보 1보다 ESM 두 파일이 각각 6,401바이트, CJS가 6,367바이트 작습니다. 기준보다 남는 바이트 증가와 시간/Node·Bun 힙 비용은 승인된 짧은 창으로 판단합니다. 창 1은 중단되어 이 비용의 채택 근거가 아닙니다.

[반복 감사 원시](raw/micro-hygiene/candidate-2-loop-audit.json)는 남은 숫자 `in` 28곳을 모두 열거합니다. 작성/외부 입력의 tuple·virtual fields·controls.fields/targets·schema.allOf/branches·enum/literal 값·작성 type·required/dependentRequired·외부 오류·checkbox prev·union authored·공개 `ChildFields` 인수의 구멍은 계속 건너뜁니다. 기존 item-entry 캐시의 sparse 존재 검사, 스냅숏의 실제 구멍 보존 검사도 유지합니다. `Object.keys`, 이전 discriminator 값의 push 배열, 렌더의 생성된 옵션/표시 배열에서는 검사를 없앴습니다. 새로 작성한 로컬 선택 형 13개는 기존 Optional 유틸리티로 표기했습니다. typecheck·lint·표적 **82파일 720건(기존 todo 1)**을 통과했으며 [로그](raw/micro-hygiene/candidate-2-loop-checks.json.gz)를 보존했습니다.

후보 2 재검토 P3-B에 따라 감사의 다섯 곳(`collectBlueprintWarnings`, `getGateSelectionTable`, `isStableDiscriminatorEntry`, `prepareDiscriminatorEntrySelection`, `readGateSelectionGroup`)은 **판별자 태그의 엔진 동결 복사본, 검사 무해하나 불필요**로 교정했습니다. `readDiscriminatorBranches`가 spread 후 동결한 배열은 구멍을 undefined로 채웁니다. 이 다섯 검사는 바이트 중립 범위에서 그대로 두며 제거는 소유자 결정 후속입니다. `effectiveType`의 입력은 이 태그가 아닌 `node.schema.schema.type`이므로 **작성 입력(스키마 type 목록), 검사 유지**입니다. 조정자가 코드 근거에 따른 이 구분을 승인했으며 두 함수의 매개변수 주석도 실제 입력에 맞췄습니다.

## 항목 6 — 형 유틸리티

Dictionary의 기본 인수는 any이므로 `Dictionary<any>`는 쓰지 않습니다. 소유자 리뷰에 따라 중복 기본 형 인수 2곳을 `Dictionary`로 줄였고 `Dictionary<unknown>`은 유지합니다.

**521지점**을 치환했습니다: `Record<string, T>` → Dictionary **101개**, Optional **284개**, Nullable **122개**, Optional<Nullable> **13개**, Nullish **1개**입니다. 문자열 아닌 Record 키와 기존 조건부·mapped type의 분배·modifier 의미가 달라지는 조합은 유지했습니다. 대응하는 Required/Partial/IsNullable/Roll의 추가 수기 동등 조합은 이 제품 범위에서 발견하지 못했으며, 이미 사용하는 유틸리티는 유지했습니다. [항목 6 위치](raw/micro-hygiene/item-6.json)를 보존합니다.

실제 공통 유틸리티 선언을 import한 TypeScript 제네릭 동등 증명 **7개·진단 0**으로 Dictionary/Nullable/Optional/중첩/Nullish 및 함수·중첩 Ref 모양을 검증했습니다. Nullable이라는 기존 boolean 제네릭 매개변수와 겹친 surface 파일은 `NullableValue` import alias를 사용합니다. [형 증명 결과](raw/micro-hygiene/utility-equivalence.json)와 [타입 제거 결과](raw/micro-hygiene/type-erasure.json)에서 수정한 **259개 제품 파일의 transpile JavaScript 바이트가 항목 5와 모두 동일**합니다. 한 파일의 기존 import 순서·괄호는 보존하여 형 정리의 런타임 변경을 막았습니다.

공개 97이름 스냅숏에서 네 함수의 null union 표기만 Nullable 표기로 바뀌었습니다: registerPlugin, useFieldNodeSubscribe, useFieldNodeTracker, useFormSubmit. 같은 제네릭 동등 증명으로 확인한 뒤 그 네 문자열만 정확히 갱신했으며, 이름 수·형/값 종류·검사 강도·사례 수는 유지했습니다. 초기 시험은 이 네 표기 때문에 실패했고 수정 뒤 공개/수입/표면 형/할당 시험 **4파일·15건**, typecheck·lint를 통과했습니다. 후보 1 build의 공개 `index.d.ts`는 **3,129바이트·차이 0**, SHA-256 `ed3bfe4d2c42fab94543b2afeca4f4d904e987ae7e865385116218b3d4614b3d`입니다. 그 파일이 재수출하는 선언 그래프 전체 **1,306파일**을 비교했습니다. **194파일**의 바이트가 달라졌으나 증명한 네 기본 유틸리티와 그 중첩 조합의 named/inline import를 원래 형으로 펼치고 union의 괄호·순서와 import/주석 표기를 정규화한 AST 차이는 **0**입니다. 원래 제네릭 매개변수·modifier·조건부 형·멤버·함수 시그니처는 그대로 비교했습니다. [선언 동등 결과](raw/micro-hygiene/declaration-equivalence.json)와 [194파일의 A/B 선언 원시](raw/micro-hygiene/declaration-diff.json.gz), [제네릭 증명](raw/micro-hygiene/utility-equivalence.ts)을 보존합니다.

## 후보 1 정적 관문

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


## 후보 2 최종 정적 관문

제품 머리는 `86251d017`이며 이후 장치·증거 커밋도 같은 제품 바이트를 사용합니다. Node 26.12.1·Bun 1.4.4에서 build와 artifact checks(20.59초), typecheck·lint, 다섯 프로젝트를 순차 실행하고 각 종료 0을 확인한 뒤 verify를 통과했습니다. 다섯 프로젝트는 브리프의 원래 기본 환경(`NODE_ENV=test`)이며 `production`은 프로젝트 이름입니다. 그 프로젝트의 detached/resolver 번들 검사는 세 빌드를 실제 production 자식 프로세스에서 확인합니다.

| 프로젝트 | 파일 | 통과 사례 | todo | 초 |
| --- | ---: | ---: | ---: | ---: |
| unit | 601 | 3975 | 1 | 97.58 |
| render | 132 | 768 | 0 | 62.01 |
| storybook | 100 | 251 | 0 | 36.54 |
| react18 | 132 | 768 | 0 | 59.43 |
| production | 10 | 21 | 0 | 3.06 |
| verify | 738 | 4787 | 1 | 165.77 |

레거시 격리 **2,376파일**, 배달 **79장면 429단계 + B12 7장면 21단계 차이 0**입니다. 배달의 첫 적재는 외부 출력 폴더에 기존 node_modules 연결이 없어 실패했고, 설치 없이 기존 의존 연결을 만든 뒤 완료했습니다. 장치의 네 프로세스 opt-in·기본 열 프로세스 유지·선언 도달성 검사는 **14건 통과**입니다. [정적 로그·해시](raw/micro-hygiene/candidate-2-static/artifacts.json)에 원래 실패와 교정도 남겼습니다.

공개 `index.d.ts`는 여전히 **3,129바이트·바이트 차이 0**입니다. 전체 선언은 **1,306→1,307파일**, A/B 바이트가 다른 파일은 **197개**입니다. 증명한 유틸리티를 펼친 뒤 기존 1,306파일 중 차이는 명시적으로 승인된 내부 두 시그니처뿐입니다: `clearArrayRuntimePaths`의 미사용 인수 제거, `prunePerishedPaths`의 고유 배열 입력 허용. 추가 한 파일은 파서의 밀집 세그먼트 술어입니다. 패키지 exports가 계속 루트 하나임을 검사하고, index에서 import·재수출·import type으로 도달하는 **308파일의 주소와 정규화 AST 차이가 모두 0**임을 확인했습니다. 도구는 다른 내부 차이/삭제/추가를 허용하지 않습니다. [전체 선언 원시와 공개 동등 증거](raw/micro-hygiene/candidate-2-static/declaration-equivalence.json)를 보존합니다.

FCA facts **1,664/1,664 exact**, 세 검사 동일 snapshot `dabc8b5fd93ec78a6c05752309a73385a67528cb6d87d020cf2a68cfcf7d7570`, findings **202건**으로 상한을 유지합니다. 전체 FAIL·분석 indeterminate도 그대로 기록합니다. [FCA 원시](raw/micro-hygiene/candidate-2-static/fca/summary.json)를 보존했습니다. 후속 항목 3의 Set/배열 구분에 쓰는 O(1) `size in paths` 한 곳 때문에 최종 전체 `in`은 88개이며, 원소마다 실행하던 밀집 검사 117개 제거와 숫자 HasProperty 유지 목록은 달라지지 않습니다.

## 측정 장치와 창

창 1의 측정 후보는 `8d7d1a87e`이며 제품 바이트는 정적 관문의 `082c3995a`와 같습니다. `tools/iv-2/window.mjs` 계열의 공개 행과 힙 장치를 재사용하며, Ⅳ-1의 `summarize.mjs`·`weightedExchange.mjs`·`judgeStage.mjs` 판정은 유지합니다. Ⅳ-2 전용 할당·exit self·cold 지연 생성 추가항은 이 정리에 해당하지 않으므로 별도 어댑터에서 제외했습니다. 최종 판정은 미시 위생 계획에 따라 모든 행의 폭 밖 퇴보 0과 가중 교환비 ≤ 0이며, 교환비 0도 허용합니다.


### 사전 검사와 pilot

같은 Node 26으로 준비한 A/B 불변 bundle과 stage bundle의 해시를 고정했습니다. untimed smoke는 공개 A44/B44·legacy36, stage 9모드, siblings-1000 retention 적재를 통과했습니다. 실제 `alternate.mjs` worker CLI dry run은 single-flat-1000 한 행·한 프로세스·warmup 1/sample 1로 성공했고 formal marker를 만들지 않았습니다.

조정자의 별도 승인을 받은 pilot 한 번은 **22행·행당 한 프로세스·20/100·종료 0**입니다. 행별 median/min 비율의 중앙값은 current **1.3474188821**, legacy **1.2143182973**이며 current가 요구 범위 1.2–1.4에 들었습니다. CPU precheck **25/25 승인·지연 25회**를 보존했습니다. 순간 부하는 quiet gate의 지연 대상이며 거절된 측정 표본을 재실행한 것이 아닙니다. 모든 관측에서 이름별 최대 CPU 상위 10개는 duetexpertd 64.19%, WindowServer 61.65%, Google Chrome Helper (Aperitif Renderer) 30.07%, KakaoTalk 21.20%, 2.1.312 18.65%, Google Chrome 18.17%, codex 16.68%, Orca Helper (Renderer) 15.58%, Stats 11.03%, BetterTouchTool 10.67%입니다. [pilot 전체 행·표본](raw/micro-hygiene/preflight/pilot-samples.json.gz), [요약](raw/micro-hygiene/preflight/pilot-summary.json), [CPU 상위 10개와 지연](raw/micro-hygiene/preflight/pilot-cpu-prechecks.json.gz), [사전 검사 로그](raw/micro-hygiene/preflight/logs.json.gz)를 남겼습니다.

창 1은 pilot 범위를 보고한 뒤 별도 승인을 받아 시작했으나 **소유자 지시로 중단, 기계 사용 중이라 quiet gate 대기가 길어짐, 판정 없음**입니다. 정식 marker는 `2026-10-29T14:09:50.510Z`, finally 종료는 `2026-10-29T14:41:38.584Z`입니다. 공개 종료 0 프로세스 **282/440**, SIGINT 중단 1개이며 stage·Node/Bun 힙·retention은 실행하지 못했습니다. 따라서 가중 교환비·폭 밖 퇴보 목록·힙 관문은 미판정이며 부분 표본으로 완료 판정을 만들지 않습니다. dist를 복원하고 입력 해시를 재확인했습니다. **항목 5 정리로 대체됨**이며 자동 재실행하지 않았습니다. [중단 기록과 부분 원시](raw/micro-hygiene/candidate-1-partial/cancellation.json)에 공개 stdout·stderr·영수증, CPU 상위 10개와 지연, 러너 로그를 보존했습니다.


### 후보 2 — 짧은 창(4프로세스)

소유자가 짧은 창을 지시했고 조정자는 홀수 1/2 분할을 거절하여 레인당 **4프로세스**로 확정했습니다. 후보는 `870fe268900da5b69ade2ef28dac146a1b3d05cb`이며 원래 요약기의 A 2개 / A-prime 2개 / B 4개, 같은 median·range·폭·판정식을 유지했습니다. 명시적 short-window 옵션만 formal 4를 허용하고 기본 10은 그대로입니다. 새 준비 루트에서 untimed smoke와 실제 CLI 한 worker의 1/1 예행을 통과한 뒤 한 번 실행했습니다. pilot·stage 장부·retention은 생략하고 Node/Bun 힙을 포함했습니다.

정식 시작은 `2026-10-29T16:19:01.724Z`, 종료는 `2026-10-29T16:31:53.984Z`로 **12분 52.260초**입니다. 공개 **176/176프로세스**와 Node/Bun A/B 힙 네 자식이 모두 종료 0이며 입력 해시와 dist 복원을 확인했습니다. legacy 품질비 중앙값은 **0.996321962550**(18행), TEST-073 전체 비교의 퇴보는 **0건**입니다. 예행을 포함한 CPU 사전 검사 179개가 승인되었고 지연 6회를 보존했습니다. CPU 기록은 각 관측의 이름별 상위 10개와 모든 지연을 포함합니다.

**관문 기준 미채택, 경계선, 소유자 결정 대기**입니다. 가중 교환비는 **−500.724999995 µs(−0.109105530%)**로 개선 방향이지만 `switch-payload-12` 한 행이 폭 밖 퇴보이고 Bun 힙이 기준 최대를 넘습니다. 두 실패를 전체 교환비로 상쇄하지 않으며 원래 판정을 그대로 보존합니다.

행 표의 A·A-prime·B는 프로세스별 최소의 중앙값, 폭은 원래 A 두 절반의 range와 중앙값 차이 중 최댓값입니다. 시간 열은 **µs/표본**이며 마지막 열은 기존 eventsPerSample로 나눈 뒤 세션 가중치를 곱한 **가중 µs 기여**입니다. 폭 안 행은 기여 0입니다.

| 행 | A | A-prime | B | 폭 | 판정 | 가중 기여 |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| `single-flat-1000` | 58.791500 | 56.271000 | 57.187500 | 2.520500 | 폭 안 | 0.000000 |
| `mount-oneOf-80` | 2335.188000 | 2258.228500 | 2342.271000 | 96.042000 | 폭 안 | 0.000000 |
| `mount-flat-1000` | 2164.458500 | 2165.312500 | 2131.958000 | 163.791000 | 폭 안 | 0.000000 |
| `mount-nested-d6-f4` | 16377.896000 | 16412.958000 | 16453.312500 | 352.292000 | 폭 안 | 0.000000 |
| `single-nested-d6-f4` | 110.979500 | 111.083500 | 111.104500 | 2.625000 | 폭 안 | 0.000000 |
| `switch-oneOf-80` | 165.958000 | 159.770500 | 155.458000 | 6.187500 | 개선 | -525.000000 |
| `bulk-flat-2000` | 1756.646000 | 1836.166500 | 1779.458000 | 108.583000 | 폭 안 | 0.000000 |
| `bulk-nested-d6-f4` | 4066.479500 | 4072.374500 | 3968.458500 | 61.041000 | 개선 | -490.105000 |
| `switch-discriminator-80` | 152.020500 | 148.562500 | 150.583000 | 14.791000 | 폭 안 | 0.000000 |
| `switch-if-80` | 285.854500 | 276.708500 | 277.687500 | 11.875000 | 폭 안 | 0.000000 |
| `switch-nested-oneOf-20` | 301.167000 | 289.958500 | 293.083000 | 21.250000 | 폭 안 | 0.000000 |
| `switch-siblings-0` | 59.729000 | 59.292000 | 60.125000 | 4.292000 | 폭 안 | 0.000000 |
| `switch-siblings-100` | 78.000000 | 77.958500 | 78.979500 | 7.083000 | 폭 안 | 0.000000 |
| `switch-siblings-1000` | 313.229500 | 313.604500 | 314.499500 | 16.125000 | 폭 안 | 0.000000 |
| `switch-siblings-4000` | 2701.958000 | 2679.396000 | 2678.854000 | 47.708000 | 폭 안 | 0.000000 |
| `leaf-gate-250` | 23.291500 | 21.917000 | 22.479000 | 2.083000 | 폭 안 | 0.000000 |
| `leaf-gate-1000` | 22.041500 | 23.958500 | 22.229000 | 1.917000 | 폭 안 | 0.000000 |
| `leaf-gate-4000` | 741.041500 | 788.375500 | 736.791500 | 104.833000 | 폭 안 | 0.000000 |
| `leaf-gate-8000` | 1580.500500 | 1635.021000 | 1561.604000 | 121.792000 | 폭 안 | 0.000000 |
| `wave-1000` | 1654.812500 | 1644.291500 | 1651.166500 | 17.041000 | 폭 안 | 0.000000 |
| `single-flat-1000-subscribed` | 66.667000 | 67.208500 | 66.979000 | 3.834000 | 폭 안 | 0.000000 |
| `switch-payload-12` | 356.083000 | 363.250000 | 373.229000 | 17.084000 | 퇴보 | 514.380000 |

개선 행은 `switch-oneOf-80`(가중 −525.000 µs), `bulk-nested-d6-f4`(−490.105 µs)이며 `switch-payload-12`는 +514.380 µs입니다. 나머지 19행은 폭 안입니다. 이 한 번의 짧은 창에서 얻은 수치이며 속도 개선 약속으로 확대하지 않습니다.

`switch-payload-12`는 A **356.083**, A-prime **363.250**, B **373.229**, 폭 **17.084 µs**입니다. B는 A+폭 373.167을 **0.062 µs(약 0.017%)** 넘었습니다. 문턱을 넘었으므로 퇴보 판정을 유지합니다. 개별 행 legacy 비는 1.001602958213입니다.

| 힙(bytes/node, 각 7표본) | A 중앙값 | A 최댓값 | B 중앙값 | 판정 |
| --- | ---: | ---: | ---: | --- |
| node | 1439.312137572 | 1896.884623075 | 1438.792241552 | 통과 |
| bun | 2248.278744251 | 2248.563487303 | 2253.234353129 | 실패 |

Bun B 중앙값은 A 최댓값보다 **4.670865827 bytes/node(약 0.208%)** 큽니다. Node 통과와 구분하여 Bun 실패를 그대로 기록합니다.

#### 원인 후보와 소유자 결정

원인 추정은 코드 경로에 근거한 다음 두 후보이며 인과를 확정하지 않습니다. 장면은 `buildBranchRows.mjs`의 80분기·payload 12개이며 `setupBranchOperation.mjs`가 kind 잎을 두 번 씁니다.

- 항목 5(`af3e2e1d3` 및 정리 `b50f06050`)는 `settle/utils/compute/childSelection/selectEntryStep.ts`의 활성 선언 ID map과 `utils/publishPreparedSelection.ts`의 동적 자식 순서/참조 비교를 각각 common-utils map과 인덱스 반복으로 바꿨습니다. `selectChildren`에서 쓰는 이 경로는 payload 멤버 수에 비례한 반복과 연결되며, 생성 코드와 JIT 비용이 달라질 후보입니다. 번들 증가도 관측했지만 그 사실만으로 이 행의 원인이라 판단하지 않습니다.
- 항목 3(`ecef006f4`)은 `settle/utils/compute/dirtyChildren.ts`의 예약 자식 64개 이하에서 Set membership을 반환 배열 indexOf로 바꿨습니다. `computeNode.ts`가 재계산할 자식을 찾을 때 이 함수를 사용하므로 payload에 관련된 다른 비용 후보입니다. 이 장면에서 그 분기가 실행된 횟수와 실제 길이를 분리 계측하지 않았으므로 영향은 미확정입니다. 64개 경로의 최악 비교 상한 4,096과 기존 0/0/1 할당 시험은 그대로입니다.

이 창은 여섯 항목을 함께 비교했으며 항목별 제거 비교나 프로파일은 실행하지 않았습니다. 조정자의 후속 지시로 **되돌림·재측정을 하지 않고** 이 결과를 PR 리뷰에 제출합니다. 소유자 결정 항목은 **(가) 그대로 병합, (나) 항목 5 전체 되돌림 뒤 정적 관문, (다) 10프로세스 창 재실행**입니다. 어느 선택도 이 문서 작성 시 실행하지 않았습니다. 창 2는 미채택이며 후보 1 검토의 conditional PASS를 이 후보의 새 검토 판정으로 사용하지 않습니다.

[행·폭·품질](raw/micro-hygiene/candidate-2-window/rows.json), [원래 최종 판정](raw/micro-hygiene/candidate-2-window/judgment.json), [전체 표본](raw/micro-hygiene/candidate-2-window/pair-samples.json.gz), [176개 worker의 stdout·stderr·영수증](raw/micro-hygiene/candidate-2-window/worker-records.json.gz), [CPU 사전 검사](raw/micro-hygiene/candidate-2-window/cpu-prechecks.json.gz), [힙 14표본/런타임](raw/micro-hygiene/candidate-2-window/heap.json), [로그·종료 영수증](raw/micro-hygiene/candidate-2-window/logs-and-receipts.json.gz)를 보존했습니다.

## 후속 항목 — 추가 strict-production의 기존 문제

브리프의 다섯 프로젝트에 없던 `NODE_ENV=production` 강제 경로는 기준 `1c3655a10`과 후보에서 같은 두 건이 실패했습니다. 조정자 승인으로 설정과 기존 상한을 이 PR에서 고치거나 낮추지 않았으며 다음을 별도로 남깁니다.

- 오래된 `transformMode` 옵션이 현재 Vitest에서 적용되지 않아 `node:child_process`를 web 처리합니다. 임시 기준 config에서 현재 `testTransformMode`와 glob을 쓰면 이 실패는 해결됩니다.
- 실제 production의 oneOf-20 distinct freeze는 기준/후보 모두 **117**, 기존 상한은 **111**입니다. 원인과 비용을 별도 검증해야 하며 이 PR에서는 111을 올리지 않았습니다.
