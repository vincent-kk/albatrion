# engine 실행 계약

## Requirements

- 청사진에서 쓰기까지의 실행 규칙과 원본·계산·투영 채널을 보존합니다. 재배치로 노드 형상·값·오류·리비전·경고·통지가 달라지지 않습니다.
- 의존 순서는 blueprint < record < {behaviors, navigation} < validation < settle/derive < settle < write입니다. 검증은 결과 콜백으로 쓰기에 돌려주며 타입 간선도 역전시키지 않습니다(NODE-016·045).
- surface는 이 진입점만 경유해 엔진 계약을 소비합니다. 자식 엔진 모듈은 형제의 진입점을 직접 소비합니다.
- 경로 색인 보조는 레코드 형과 정착·생성의 공통 소비를 위해 engine의 utils 구획에 둡니다. 기존 native Map·Set 및 prefix 색인 계약을 유지합니다.

## API Contracts

### 진입점 이름

승인 계획 9.2절이 겉면과 core 호스트 사이에 고정한 표면입니다. 아래 이름만 명명해 재수출하며 구현 파일의 새 수출이 이 계약을 자동으로 넓히지 않습니다.

- **write**: adoptFieldNodeChain, createFormErrorRecord, dispatchBatch, dispatchClear, dispatchClearExternalErrors, dispatchClearSubtreeState, dispatchContextChange, dispatchFinishInput, dispatchMount, dispatchPop, dispatchPush, dispatchRemove, dispatchRequest, dispatchResetForm, dispatchResetSubtree, dispatchSetExternalErrors, dispatchSetState, dispatchSetSubtreeState, dispatchSetValue, dispatchUpdate, dispatchValidate, dispatchWriteInput, readFieldNodeInteractionReset, readFieldNodeRevision, subscribeFieldNode; 형 FieldNodeListener.
- **blueprint**: blueprint, collectBlueprintWarnings, mergeEffectiveSchema; 형 Blueprint, BlueprintChildEntry, BlueprintNode, BlueprintOptions, BlueprintSchema, BlueprintSchemaType, EffectiveSchema, SchemaTypeName.
- **validation**: compileEntryGuards, EMPTY_GLOBAL_ERRORS, readFieldNodeErrors, readValidationEntry, retainValidationRoot, releaseValidationRoot; 형 ValidationIssue, Validator, ValidateFunction.
- **record**: EMPTY_REVISION_LEDGER, FieldNodeEventType, FieldNodeRequestType; 형 Behavior, FieldNodeRecord, FieldNodeRuntime.
- **settle**: readFieldNodeDefaultValue, readFieldNodeInactiveValues, readFieldNodeTypeMismatch, readFieldNodeTypeMismatches, readFieldNodeWatchValues, loadFieldNodeAtMount, resetFieldNodeForm.
- **types**: ValidationMode, WriteOption, FieldNodeState; 형 AuthoredSchema, NodeStateFlags, SchemaControls.
- **behaviors**: BEHAVIORS, interpret, isMember.
- **navigation**: find, findNodes.
- **utils**: PathKeyedMap, PathKeyedSet.

### 수출의 이유와 도달 범위

- `loadFieldNodeAtMount`·`resetFieldNodeForm` 수출의 보유 이유: core 수준 시험 기반 도구(makeFieldNodeTree·시나리오 실행기·createDispatchTree)가 쓰는 생성·적재 통로; 제품 소비자는 없음; 정돈-3에서 시험 도구의 자리와 함께 재검토.
- `blueprint`는 core 수준 시험 기반 도구가 쓰는 생성 통로로 core index가 다시 내보내며 패키지 src/index 표면에는 추가하지 않습니다. `readFieldNodeGuard`는 validation 내부 계약이며 engine·core 집계 진입점이 재수출하지 않습니다.
- 이름 목록은 승인된 내부 계약이며 자식 모듈의 모든 수출을 대신하지 않습니다. 시험은 검사 대상의 소유 구획에서 구체 내부 단위를 검증합니다.
- `__tests__/fixtures`는 engine 층의 공용 시험 fixture를 소유합니다. `createDispatchTree.ts`는 write·validation 시험이 공유하는 생성 도우미이고 `ownedInlineHead.json`은 blueprint·settle 시험이 공유하는 기준 데이터이므로 이 최소 공통 소유자에 둡니다.
- `__tests__/validation-guard-integration.test.ts`는 validation·write 두 자식 계약을 함께 검증하는 engine 통합 시험입니다.

## Acceptance Criteria

### branchless-observables — 분기 없는 청사진의 코어 관측 동등성

- BF 픽스처와 기존 청사진 시험 스키마에서 범용 분석과 분기 없는 분석의 트리·값·오류·경고·진단이 같고, 모든 BF 상호작용 뒤에도 유지됩니다.
- derive·watch·state·역의존 기능이 선언되면 코어 정착에 필요한 색인이 남습니다. 빈 파생 식처럼 규칙이 없어도 부재 증명이 없는 경우에는 청사진 사이에서 빈 표를 공유하지 않습니다.

### engine-entry — 명명한 내부 계약

- 진입점은 위 그룹의 값과 형을 이름으로 재수출하며 와일드카드 수출이 없습니다. surface의 엔진 참조는 engine/index를 통해서만 도달합니다.

### engine-observables — 재배치의 관측 보존

- 기존 청사진·동작 행·정착·쓰기·검증 시험의 값·형상·오류·사건 단언이 같은 결과를 냅니다. 고정 리비전 대조 시험은 옛 경로를 현재 배치로 해석합니다.

## Last Updated

계약 기준: NODE-016·045, LANDING-067·084, 07c 승인 계획 9.1·9.2·9.6; 정돈-2(2026-10-14).
