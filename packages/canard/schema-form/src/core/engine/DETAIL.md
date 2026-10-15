# engine 실행 계약

## Requirements

- 청사진에서 쓰기까지의 실행 규칙과 원본, 계산, 투영 채널을 보존한다. 재배치를 하더라도 노드 형상, 값, 오류, 리비전, 경고, 통지는 달라지지 않는다.
- 의존 순서는 blueprint < record < {behaviors, navigation} < validation < derive < settle < write이다. `derive`와 `settle`은 형제이며, settle이 derive 진입점을 소비한다. 둘이 함께 쓰는 순수 보조 넷은 engine의 `utils/compute/sameValue.ts`, `utils/paths/resolveDependencyPath.ts`, `utils/controls/getCommittedDeclarationKey.ts`, `utils/controls/getControlExpression.ts`에 있으며, 두 자식이 위로 열린 방향으로 직접 가져온다. 이 보조들은 engine의 organ이므로 자식 fractal(`blueprint` 등)의 형도 가져오지 않는다(모델 B1). 필요한 칸만 구조 형으로 받는다. `getControlExpression`은 청사진의 식 목록을 받은 그대로의 원소 형으로 돌려준다. 검증은 결과 콜백으로 쓰기에 돌려주며 타입 간선도 거꾸로 만들지 않는다(NODE-016·045).
- surface는 이 진입점만 거쳐서 엔진 계약을 소비한다. 자식 엔진 모듈은 형제의 진입점을 직접 소비한다.
- 경로 색인 보조는 레코드 형과 정착·생성이 함께 소비하므로 engine의 utils 구획에 둔다. 기존 native Map·Set과 prefix 색인 계약은 그대로 유지한다.

## API Contracts

### 진입점 이름

승인 계획 9.2절이 겉면과 core 호스트 사이에 고정한 표면이다. 아래 이름만 명명해 재수출하며, 구현 파일에 새 수출이 생겨도 이 계약이 저절로 넓어지지는 않는다.

- **write**: adoptFieldNodeChain, createFormErrorRecord, dispatchBatch, dispatchClear, dispatchClearExternalErrors, dispatchClearSubtreeState, dispatchContextChange, dispatchFinishInput, dispatchInsert, dispatchMount, dispatchPop, dispatchPush, dispatchRemove, dispatchRequest, dispatchResetForm, dispatchResetSubtree, dispatchSetExternalErrors, dispatchSetState, dispatchSetSubtreeState, dispatchSetValue, dispatchUpdate, dispatchValidate, dispatchVisitSubtree, dispatchWriteInput, readFieldNodeInteractionReset, readFieldNodeRevision, subscribeFieldNode; 형 FieldNodeListener.
- **blueprint**: blueprint, collectBlueprintWarnings, mergeEffectiveSchema; 형 Blueprint, BlueprintChildEntry, BlueprintNode, BlueprintOptions, BlueprintSchema, BlueprintSchemaType, EffectiveSchema, SchemaTypeName.
- **validation**: compileEntryGuards, EMPTY_GLOBAL_ERRORS, readFieldNodeErrors, readValidationEntry, retainValidationRoot, releaseValidationRoot; 형 ValidationIssue, Validator, ValidateFunction.
- **record**: EMPTY_REVISION_LEDGER, FieldNodeEventType, FieldNodeRequestType; 형 Behavior, FieldNodeRecord, FieldNodeRuntime.
- **settle**: readFieldNodeDefaultValue, readFieldNodeInactiveValues, readFieldNodeMisfit, readFieldNodeMisfits, readFieldNodeWatchValues, loadFieldNodeAtMount, resetFieldNodeForm.
- **types**: ValidationMode, WriteOption, FieldNodeState; 형 AuthoredSchema, NodeStateFlags, NodeStrategy, SchemaControls.
- **behaviors**: BEHAVIORS, interpret, isMember.
- **navigation**: find, findNodes.
- **utils**: PathKeyedMap, PathKeyedSet.

### 수출의 이유와 도달 범위

- `loadFieldNodeAtMount`와 `resetFieldNodeForm`을 수출하는 이유는 다음과 같다. core 시나리오 실행기(`createCoreScenarioAdapter`, `createObservedCoreScenarioAdapter`, `executeCoreScenarioStep`), `core/__tests__/scenarios/differential.spec.ts`, `core/surface/__tests__/detached.test.ts`, 그리고 `bench/legacy-compare/`의 독립 비교 스크립트(`array`, `derive-and-controls`, `node-and-settle`)가 engine index를 통해 이 적재 통로를 쓴다. 제품 소비자는 없다.
- `blueprint`는 bench와 `src/hooks/__tests__/createHookNode.ts`가 쓰는 생성 통로이므로 core index가 다시 내보내고, 패키지 src/index 표면에는 추가하지 않는다. `readFieldNodeGuard`는 validation 내부 계약이라서 engine과 core의 집계 진입점이 재수출하지 않는다.
- 이름 목록은 승인된 내부 계약이며, 자식 모듈의 모든 수출을 대신하지는 않는다. 시험은 검사 대상이 속한 구획에서 구체적인 내부 단위를 검증한다.
- `__tests__/fixtures`는 engine 층의 공용 시험 fixture를 소유한다. `createDispatchTree.ts`는 write와 validation 시험이 함께 쓰는 생성 도우미이고, `createTestTree.ts`와 `createPlainNode.ts`는 settle과 derive 시험이 함께 쓰는 트리 도우미이며, `ownedInlineHead.json`은 blueprint와 settle 시험이 함께 쓰는 기준 데이터이다. 모두 여러 자식이 공유하므로, 이들을 아우르는 가장 낮은 공통 소유자인 이곳에 둔다.
- `types/controls.ts`의 `ControlKey`는 노드 `controls` 키의 합집합이고, `constants/controlKey.ts`의 `CONTROL_KEY`는 키 이름을 값으로 가진 상수 객체이다. 두 방향 모두 `ControlKey`와 같아지도록 형으로 묶여 있어서, `Reflect.get`이나 `hasOwnProperty`로 제어 키를 읽는 곳은 이 상수를 거친다. 여러 자식 모듈이 같은 값 집합을 쓰는 합집합 형은 정본을 하나만 둔다. 해당하는 형은 `types/strategy.ts`의 `NodeStrategy`(`'branch' | 'terminal'`), `types/controls.ts`의 `DeclarationLayer`(`'node' | 'fields' | 'fragment'`), `types/value.ts`의 `FieldNodeWriteKind`, record 런타임 형의 `SettlementFailureCause`·`SettlementBudget`·`SettlementEntryApi`·`MisfitSource`, blueprint의 `EffectiveSchemaMode`(`'static' | 'runtime'`)이다. 값 집합이 서로 다른 범위·모드 합집합(blueprint 선언의 `scope`, 커밋 규칙 키 정리의 `scope`, 경로 색인 저장소의 `mode`)은 각자의 자리에 둔다. `constants/schemaGroup.ts`의 `SCHEMA_GROUP`은 스키마의 폼 전용 그룹 키워드(`controls`, `options`, `presentation`)를 값으로 가진 상수 객체이다. `constants`는 engine의 자식 모듈들이 함께 쓰는 상수 compartment(organ)이다.
- `__tests__/validation-guard-integration.test.ts`는 validation과 write 두 자식 계약을 함께 검증하는 engine 통합 시험이다.
- `__tests__/blueprint.branchless-differential.test.ts`는 같은 스키마를 branchless 분석과 일반 분석으로 각각 실행해 관측 결과가 같은지 비교하는 engine 통합 시험이다. 일반 분석을 강제하려면 blueprint 내부의 capability 수집 단위(`blueprint/buildNodes/utils/declarations/collectSchemaCapabilities`)를 `vi.mock` 경로로 바꿔야 한다. 이 단위는 blueprint index로 나가지 않으며, 스키마 입력만으로는 같은 스키마의 일반 분석을 만들어 낼 수 없다. 부모 수준의 시험 도구가 자식 내부에 닿는 B8 사례로 선언하고, 정돈-3에서 시험 도구의 자리와 함께 다시 검토한다.

## Acceptance Criteria

### branchless-observables — 분기 없는 청사진의 코어 관측 동등성

- BF 픽스처와 기존 청사진 시험 스키마에서 범용 분석과 분기 없는 분석이 같은 트리, 값, 오류, 경고, 진단을 내고, 모든 BF 상호작용 뒤에도 이 동등성이 유지된다.

### engine-entry — 명명한 내부 계약

- 진입점은 위 그룹의 값과 형을 이름으로 재수출하며 와일드카드 수출은 없다. surface가 엔진을 참조할 때는 반드시 engine/index를 통해서만 닿는다.

### engine-observables — 재배치의 관측 보존

- 기존 청사진, 동작 행, 정착, 쓰기, 검증 시험이 값, 형상, 오류, 사건에 대해 같은 단언 결과를 낸다. 고정 리비전 대조 시험은 옛 경로를 현재 배치로 바꿔 해석한다.

## Boundary Exemptions

### `utils/compute/sameValue.ts` — 레거시 비교 스크립트의 직접 import

- **Consumers**: `**/bench/legacy-compare/**`
- **Direct import**: `allowed`
- **Reason**: `bench/legacy-compare/`는 src 밖에서 레거시 코어와 새 코어를 나란히 재는 독립 스크립트 넷(`array`, `derive-and-controls`, `dispatch-and-validation`, `node-and-settle`)이 있는 자리이며, 레거시를 지울 때 함께 지운다. 그때까지는 소유자 결정(276라운드, 대기열 49)에 따라 fractal import 규칙의 직접 import 금지에서 면제된다. 값 비교 비용만 따로 재려는 것이라서 진입점에 올리지 않고 그대로 읽는다.

## Last Updated

계약 기준: NODE-016·045, LANDING-067·084, 07c 승인 계획 9.1·9.2·9.6; 정돈-2(2026-10-14); 365라운드 insert(2026-10-15).
