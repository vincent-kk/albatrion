# 현재 구현의 조건부·FE 전용 키워드 사실 (scout, 2026-09-23, HEAD 01e52d0bd)

읽기 전용 조사 원문이다. 비교표(round-6)의 재료. 코드·타입·테스트만 읽었고 `architecture/`·`README.md`·`docs/agents/**`는 읽지 않았다.

## 1. FE 전용 키워드

| 키워드 | 값 형태 | 읽는 곳 | 비고 |
|---|---|---|---|
| `&if`/`computed.if` | boolean\|string | `getConditionIndexFactory/utils/extractConditionInfo.ts:44-45` | oneOf/anyOf 분기 판별용. `oneOf/anyOf` 배열 원소에만 의미 있음 |
| `&active`/`computed.active` | boolean\|string | `checkComputedOptionFactory.ts:22-26` | false면 값 쓰기 불가+출력 제외 |
| `&visible`/`computed.visible` | boolean\|string | 동일 | false여도 값은 유지, UI만 숨김 |
| `&readOnly`/`computed.readOnly` | boolean\|string | 동일 | FormTypeInput 구현 위임 |
| `&disabled`/`computed.disabled` | boolean\|string | 동일 | FormTypeInput 구현 위임 |
| `&pristine`/`computed.pristine` | boolean\|string | 동일 | dirty/touched 리셋 |
| `&watch`/`computed.watch` | string\|string[] | `getObservedValuesFactory.ts:29` | `computed.[field] ?? &[field]`만, root 폴백 없음 |
| `&derived`/`computed.derived` | string | `getDerivedValueFactory.ts:20-22` | 동일하게 root 폴백 없음 |
| `virtual`(object 최상위) | `{[key]: {fields, ...}}` | `types/jsonSchema.ts:196-197,209-211` | 가상 필드 그룹 정의 |
| `type: 'virtual'`(노드 자체) | schema | `types/jsonSchema.ts:214-220` | VirtualNode 생성 |
| `FormTypeInput`/`formType` | Component\|string | `useFormTypeInput.ts:76` 등 | 입력 컴포넌트 선택 |
| `terminal` | boolean | `getNodeGroup.ts:20-21` | branch/terminal 강제 지정 |
| `options.omitEmpty` | boolean | `ObjectNode.ts:99,102` | 부모 전파 시 빈 값 제거 |
| `options.trim`/`omitTrailing` | boolean | `types/jsonSchema.ts:139,173` | string/array 전용 |
| `FormTypeInputProps.alias` | Dictionary | 타입만 선언(`jsonSchema.ts:235`), **패키지 내부 소비처 없음** — 외부 FormTypeInput 구현체용 패스스루 |
| `injectTo` | Function | `AbstractNode.ts:969` | 값 변경 시 다른 노드로 전파 |

표현식 문법: `JSON_POINTER_PATH_REGEX`(`ComputedPropertiesManager/utils/regex.ts:7,84-101`) — `#/path`, `./path`(fragment/current), `../path`(부모, 반복 가능), `/path`(절대), `@`(context, `.prop`은 JS가 처리), `#`(fragment 단독). `new Function('dependencies', ...)`로 컴파일(`createDynamicFunction.ts:41`), 의존 경로 값이 변할 때(`AbstractNode.ts:524-531` 이벤트 기반) 동기 재평가(`ComputedPropertiesManager.ts:204-216`).

우선순위(active/visible/readOnly/disabled/pristine만 해당): `rootJSONSchema[field] ?? jsonSchema[field] ?? jsonSchema.computed?.[field] ?? jsonSchema['&'+field]` (`checkComputedOptionFactory.ts:22-26`) — root 스키마 최상위 키가 노드 자신의 `computed.*`보다도 우선. watch/derived/if는 이 폴백 없이 `computed.[f] ?? &[f]`만.

## 2. 표준 조건부 키워드

| 키워드 | 지원 | 처리 | 근거 |
|---|---|---|---|
| `if/then/else` | 부분 지원 | `then.required`/`else.required` **만** 읽어 `computed.active` 조건으로 변환(`flattenConditions.ts:44-97`→`getConditionsMap.ts`→`mergeShowConditions.ts:17-29`). `then.properties`, 타입 변경 등은 무시 |
| if 판별 | `if.properties`의 `const`/단일 `enum` | `extractCondition`(`flattenConditions.ts:105-121`) |
| else-if 체인 | 지원(`schema.else.if && schema.else.then`이면 재귀) | `flattenConditions.ts:64-65` |
| 중첩 if(`then` 안, `allOf` 안) | **미지원** | `then`/`allOf` 내부 `if`는 순회되지 않음(allOf는 명시적 경고+무시, 아래) |
| `required` 동적 판정 | if/then/else 결과를 `requiredFactory.ts:13-44`가 값 비교로 재검증 | — |
| `oneOf`/`anyOf` | 지원 | 분기별 `&if`/`computed.if`(우선) 또는 `properties`의 `const`/`enum`(`getExpressionFromSchema.ts`) 조합(`combineConditions`), 매치 시 `oneOfIndex`/`anyOfIndices` 계산(`getConditionIndexFactory.ts`, `getConditionIndicesFactory.ts`). 단순 동등비교면 O(1) lookup 최적화(`getSimpleEquality.ts`) |
| 미판별 시 | `oneOfIndex = -1`(기본값, `ComputedPropertiesManager.ts:106`) | 이후 분기 선택 로직은 미추적 |
| `null` 타입 분기 | `&if`/`properties` 있어도 무시 + dev 경고 | `warnIfNullBranchIgnored.ts:15-30` |
| `allOf` | 병합 지원, 단 `type/enum/const/required/nullable/pattern/min*/max*/uniqueItems/propertyNames/properties/items`는 타입별 intersect 함수로 병합(`getMergeSchemaHandler.ts`), `title/description/readOnly/...`는 first-win, `allOf/anyOf/oneOf/not/if/then/else/dependencies/dependentRequired/dependentSchemas/unevaluatedProperties/unevaluatedItems/contains`는 **무시+dev 경고만**(`intersectSchema/utils/constants.ts:61-75`, `processAllOfSchema.ts:36-44`) |
| `not` | **미지원** — 코드 전체에서 조건 해석 로직 없음, allOf 내부에서만 경고 대상으로 등장 |
| `dependentSchemas`/`dependencies` | **미지원** — 동일 |

## 3. 공개 API 표면

- `FormProps`(`components/Form/type.ts:39-106`): jsonSchema, defaultValue, readOnly, disabled, onChange, onValidate, onSubmit, onStateChange, formTypeInputDefinitions, formTypeInputMap, CustomFormTypeRenderer, errors, formatError, showError, validationMode, validatorFactory, virtualization, context, children
- `FormHandle`(`type.ts:108-128`): node, focus, select, reset, findNode, findNodes, getState, setState, clearState, getValue, setValue, getErrors, getAttachedFilesMap, validate, showError, submit
- `SetValueOption`(`core/types/value.ts:26-66`, 10비트+조합): Replace/EmitChange/Propagate/Refresh/Batch/Isolate/Normalize/PublishUpdateEvent/PreventInjection/Automatic + 조합값(Default/Reset/Merge/Overwrite 등). 공개 서브셋은 `PublicSetValueOption`(Merge/Overwrite만, `value.ts:69-74`)
- `node.setValue(input, option = Overwrite)`(`AbstractNode.ts:355-364`)
- `NodeEventType`(`core/types/event.ts:45-80`, 17종): Initialized/UpdatePath/UpdateValue/UpdateState/UpdateGlobalState/UpdateError/UpdateGlobalError/UpdateChildren/UpdateComputedProperties/Focused/Blurred/RequestFocus/RequestSelect/RequestRefresh/RequestRemount/RequestEmitChange/RequestInjection. 공개 서브셋 `PublicNodeEventType`(6종, `event.ts:83-96`)
- `node.subscribe`(`AbstractNode.ts:916`)/`node.revision`(`:938`)/`node.publish`(`:891`) 모두 `public` — 클래스 시그니처상 공개
- `ValidationMode`(`core/types/state.ts:9-16`): None/OnChange/OnRequest
- 공개 훅(`src/index.ts:78-84`): `useSchemaNodeTracker`, `useSchemaNodeSubscribe`, `useChildNodeComponentMap`, `useChildNodeErrors`, `useFormSubmit`. `useSchemaNode`(`hooks/useSchemaNode.ts`)는 배럴 없음 → 내부 전용

## 4. 전처리 오버레이

1. `preprocessSchema`(`preprocessSchema.ts:17-39`) — 스캐너로 전체 순회하며 object 스키마마다 `processVirtualSchema`, `oneOf` 항목마다 `processOneOfSchema` 적용
2. `processVirtualSchema`(`processVirtualSchema.ts:13-29`) — `schema.virtual` 있으면 `required`/`then`/`else`를 `transformCondition`으로 변환(가상 필드명을 구성 필드로 전개, `virtualRequired` 별도 기록)
3. `processOneOfSchema`(`processOneOfSchema.ts:14-24`) — 각 oneOf 분기에 `properties.__enhanced__: {const: variant}` 삽입(분기 인덱스 추적용, `ENHANCED_KEY`)
4. `processAllOfSchema`(`processAllOfSchema.ts:29-55`) — 타입별 intersect, 위 IGNORE_FIELDS는 경고만
5. `stripSchemaExtensions`(`stripSchemaExtensions.ts:29-53`) — 검증기(AJV 등)에 넘기기 전 `FormTypeInput`/`FormTypeInputProps`/`FormTypeRendererProps`/`errorMessages`/`options`/`injectTo` 제거. **`&*` 키와 `computed`는 제거 대상에 없음**(미확인: AJV가 이를 additionalProperties 위반으로 처리하는지는 미조사)

## 미확인

- oneOfIndex/anyOfIndices = -1(무매치)일 때 실제 렌더/값 처리 downstream 동작(어느 노드를 core가 선택하는지)은 조사 범위 밖(`getCompositionNodeMapList` 상세 미독)
- `stripSchemaExtensions`가 `&*`/`computed`를 안 지우는 것이 AJV 검증에 실제 영향 주는지
- `FormTypeInputProps.alias`를 소비하는 실제 플러그인 패키지 위치(이 패키지 밖)
