# 현재 구조 (관찰)

상태: 관찰. `master` `660dde66f` 시점의 스냅숏이며 이후 갱신하지 않는다. 경로는 `src/` 기준이다.

네 축(노드 생성 / 값·이벤트 / composition·검증 / React 바인딩)을 코드에서 추적했고, 일부는 임시 하니스와 AJV 8.17.1로 실측했다. "(실측)"이 없는 항목은 코드 읽기만 한 것이다. 테스트 스위트는 실행하지 않았다.

## 1. 전체 흐름

```
<Form jsonSchema>                                        components/Form/Form.tsx:91
 └ preprocessSchema(clone(schema))   스키마 제자리 변형: virtual의 required 재작성, oneOf 마커 주입
    └ nodeFromJSONSchema             $ref 테이블 1회 + 단일 팩토리 클로저   core/nodeFromJSONSchema.ts:45-55
       └ 노드마다: $ref 해석 → processAllOfSchema → extractSchemaInfo → type switch
                                                          core/nodes/schemaNodeFactory.ts:74-146
          └ 노드 트리 (모든 분기 자식 사전 생성)
             ├ 상향: 자식 생성 시 주입된 onChange 클로저 (동기)
             └ 알림: EventCascadeManager (마이크로태스크 배치, UpdateValue만 즉시)
                └ 루트 전용: 검증 · enhancer · 주입 가드 · Form onChange (디바운스 매크로태스크)
                   └ React: useSyncExternalStore(node.revision(mask)) → SchemaNodeProxy 재귀
```

## 2. 하중을 지는 설계 결정

| # | 결정 | 근거 |
| - | ---- | ---- |
| D1 | 스키마는 주석이 아니라 변형된다. 전처리가 마커·`virtualRequired`를 심고, 노드 생성 중에도 `nodeProps.jsonSchema`를 덮어쓴다. 사용자 객체의 보호는 함수가 아니라 `Form.tsx:91`의 `clone` 호출부가 맡는다 | `helpers/jsonSchema/preprocessSchema/preprocessSchema.ts:21-39`, `core/nodes/schemaNodeFactory.ts:140` |
| D2 | 모든 분기 자식을 사전 생성한다. `__subnodes__`(전체)와 `__children__`(활성 슬라이스). 분기 전환은 생성이 아니라 reset이다 | `core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:761-921, 465-520` |
| D3 | 2단계 생명주기. 생성은 아래에서 위로, 초기화는 위에서 아래로. 자식의 자기 `__initialize__()`는 의도된 no-op이다 | `core/nodes/AbstractNode/AbstractNode.ts:1041-1049` |
| D4 | 값은 자식이 소유하고 모든 레벨이 사본을 든다. `root.value.items !== arrayNode.value` (실측). branch 노드는 `__value__`/`__draft__`/`__composed__`에 배열 슬롯의 `data`/`output`까지 최대 4벌 | `ObjectNode/.../BranchStrategy.ts:220-237, 304-317`, `ArrayNode/.../BranchStrategy.ts:76-80` |
| D5 | 값 전파와 알림 전파가 서로 다른 두 그래프다. 상향은 클로저 콜백(동기), 이벤트는 하향·UI 알림 전용 | `ObjectNode/.../BranchStrategy.ts:805-838`, `ArrayNode/.../BranchStrategy.ts:211-235` |
| D6 | 쓰기 의미가 11비트 플래그 워드다. `SetValueOption`을 다섯 곳에서 각자 해석한다. `Propagate`는 ObjectNode만 읽고 ArrayNode는 항상 전량 재구축한다 | `core/types/value.ts:26-66` |
| D7 | 검증은 루트 단독이다. `normalizedValue`에 enhancer를 덮은 값 한 벌을 검증하고 `dataPath`로 오류를 역분배한다 | `AbstractNode.ts:716-741`, `.../ValidationManager/ValidationManager.ts:121-161` |
| D8 | composition은 "값 필터 + 숨은 마커"로 구현된다. 활성 분기의 키만 통과시키고 검증 값에 활성 인덱스를 쓴다 | `ObjectNode/.../BranchStrategy.ts:623-674` |
| D9 | "필드냐 판별식이냐"의 유일한 구분이 `type`/`$ref`의 유무다. 두 파일이 서로를 언급하지 않은 채 같은 암묵 규칙에 기댄다 | `.../getCompositionKeyInfo.ts:33`, `.../getExpressionFromSchema.ts:43` |
| D10 | 표현식은 `new Function`이다. JSON Pointer를 정규식으로 뽑아 위치 기반 `dependencies[]`로 치환한다 | `.../ComputedPropertiesManager/ComputedPropertiesManager.ts:262-263`, `.../utils/regex.ts:87-109` |
| D11 | 비제어 입력. 입력이 값을 다시 읽게 하는 것은 `RequestRefresh` 하나뿐이다(`key={version}` 리마운트). 타이핑 경로에는 `Refresh`가 없어 캐럿이 보존된다 | `components/SchemaNode/SchemaNodeInput/SchemaNodeInput.tsx:94-95,121`, `.../hooks/useFormTypeInputControl.ts:32-37` |
| D12 | `jsonSchema`/`defaultValue` prop은 비반응형이다. 트리 재생성은 `FormHandle.reset()`뿐이다 | `components/Form/Form.tsx:84-94,157,186` |

## 3. "조건부로 존재/필수"를 표현하는 장치 — 7개

| 장치 | 구현 | 의미 |
| ---- | ---- | ---- |
| `&if`/`computed.if` (oneOf) | `.../getConditionIndexFactory/getConditionIndexFactory.ts:51-63` | 분기 인덱스 하나, 없으면 `-1` |
| `&if`/`computed.if` (anyOf) | `.../getConditionIndicesFactory.ts:66-74` | 분기 인덱스 여럿 |
| 분기 `properties`의 `type` 없는 `const`/`enum` | `.../getExpressionFromSchema.ts:35-50` | 같은 종류의 표현식을 합성해 `&if`와 AND 결합 (`extractConditionInfo.ts:55-58`) |
| `if`/`then`/`else` + `required` | `.../getFieldConditionMap/utils/flattenConditions.ts:37-98` → `.../mergeShowConditions.ts:12-30` | **자식의 `computed.active`로 변환된다.** 필수성이 아니라 존재가 된다 |
| `computed.active` / `&active` | `.../checkComputedOptionFactory.ts:22-28`, `AbstractNode.ts:441-443` | 꺼지면 값이 출력에서 빠진다 |
| `computed.visible` / `&visible` | 같은 팩토리, `AbstractNode.ts:450-452` | 화면에서만 숨고 값은 남는다 |
| `virtual` + `virtualRequired` | `.../processVirtualSchema/utils/transformCondition.ts:37-52` | 논리 이름 하나를 실제 필드 여럿으로 펼친다 |

- 앞의 셋은 모두 하나의 `oneOfIndex`로 합류한다. 넷째는 다섯째로 완전히 흡수된다.
- `active=false`는 투영 필터가 아니라 파괴적이다. 전이 시 `__reset__`이 노드 자신의 값을 `undefined`로 쓴다 (`AbstractNode.ts:564-574, 1087-1092`) (실측).
- 표현식 컴파일러가 3개(`getConditionIndexFactory`, `getConditionIndicesFactory`, `createDynamicFunction`)이고, 같은 조건 평가를 해석 방식으로 다시 구현한 `requiredFactory`가 따로 있다. 한 개념에 평가기가 둘이다.
- `if`/`then`/`else`는 한 가지 좁은 형태만 읽는다. `if`와 `then`이 둘 다 있고 `if.properties`에서 `const`/`enum` 조건이 나올 때만이다(`flattenConditions.ts:44-48`). 그 밖의 합법적인 `if`는 폼이 무시하지만 검증기에는 그대로 컴파일된다 — 폼 동작과 검증 동작이 구조적으로 갈린다.

## 4. 폼 내부가 작성된 스키마·`getValue()`와 달라지는 지점

이것이 #342의 계약 표면이다.

1. 스키마에 `ENHANCED_KEY`(`'\x02\x1F\x03'`, `app/constants/internal.ts:3`)가 주입된다. `oneOf`의 null이 아닌 분기마다 `properties[ENHANCED_KEY] = { const: i }`. **`anyOf`에는 주입하지 않는다.**
2. `stripSchemaExtensions`는 이 마커를 지우지 않는다. 지우는 것은 `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `errorMessages`, `options`, `injectTo` 여섯 개뿐이다(`.../stripSchemaExtensions.ts:43-51`). `&if`·`computed`·`virtual`·`virtualRequired`·`propertyKeys`는 그대로 검증기에 도달하고, AJV는 `strictSchema: false`여야 돈다 (실측). 파일 머리의 설명("plain JSON Schema validator never sees them")과 어긋난다.
3. 마커 값은 `__enhancedValue__`에만 있고 `getValue()`와 `onChange` 방출에는 없다.
4. 마커를 값에서 빼면 내부 스키마도 `passingSchemas: [0,1]`로 실패하고, **작성된 원본 스키마도 같은 값에 똑같이 실패한다** (실측). 마커는 상처가 아니라 반창고이고, 상처는 "`&if`가 검증기에 보이지 않는다"이다. 마커만 제거하면 계약은 더 나빠진다.
5. `additionalProperties: false` + `oneOf`이면 마커 자체가 additional로 기각된다 (실측).
6. `oneOfIndex === -1`이면 `-1`이 그대로 값에 쓰여 어떤 분기의 `const`와도 맞지 않는다. 분기별 에러는 `transformErrors.ts:21`에서 걸러지지만 최상위 `oneOf` 에러는 남아, 붙일 필드가 없는 에러가 된다 (실측).
7. `allOf`는 검증 전에 병합되어 사라진다. `processAllOfSchema`가 각 항목의 `if`/`then`/`else`/`oneOf`/`anyOf`/`not`/`dependencies`/`dependentRequired`/`dependentSchemas`/`unevaluatedProperties`/`unevaluatedItems`/`contains`를 개발 모드 경고만 남기고 버린다(`.../processAllOfSchema.ts:34-53`, `.../intersectSchema/utils/constants.ts:61-75`). 검증기가 받는 것은 병합 후의 `node.jsonSchema`이므로 작성자가 `allOf` 안에 쓴 제약은 폼의 검증에 도달하지 않는다. 이슈 §3.6의 의심은 코드상 사실이다. 폼·독립 검증기 대조 실측은 하지 않았다.
8. `virtual`이 `required`를 고쳐 쓴다. `required: ['fullName']`이 구성 필드 이름으로 펼쳐지고 가상 이름은 비표준 `virtualRequired`로 옮겨진다.
9. 값이 활성 분기와 `computed.active`로 걸러진다. `getValue()`에는 사용자가 입력했던 데이터가 빠져 있을 수 있다.
10. `nodeFromJSONSchema`를 직접 부르면 두 번째 계약이 된다. 분기 선택은 되지만(마커가 아니라 `&if` → computed 경로이므로) 마커가 없어, 같은 스키마가 진입점에 따라 다르게 검증된다.

## 5. 라이프사이클에서 확인된 문제

- `afterMicrotask`는 마이크로태스크가 아니다. `scheduleMacrotaskSafe`(setImmediate/setTimeout)에 이전 태스크 취소를 더한 디바운스 매크로태스크다(`AbstractNode/utils/afterMicrotask/afterMicrotask.ts:18-28`).
- 재진입 디스패치로 인과가 뒤집힌다. 루트 구독자가 `UpdateValue`를 그 원인인 `RequestEmitChange`보다 먼저 받는다 (실측). `EventCascadeManager.ts:207-213`의 리스너 루프 안에서 첫 리스너가 동기로 `UpdateValue`를 즉시 발행하면 중첩 디스패치가 먼저 끝난다.
- 한 번의 쓰기가 두 번 배달된다. `RequestRefresh`는 배치로, `UpdateValue`는 즉시 나간다(`StringNode.ts:62-70`). 외부 `setValue` 한 번에 FormTypeInput은 2렌더 + 리마운트다.
- 배치 머지는 타입별 last-write-wins다(`.../utils/mergeEventEntries.ts:13-30`). 같은 배치 안의 중간 payload가 사라진다.
- 분기 전환은 자기 이벤트를 매개로 일어난다. BranchStrategy가 자기 host의 `UpdateComputedProperties`를 구독한다(`ObjectNode/.../BranchStrategy.ts:447-457`). 값은 동기로 커밋됐는데 분기 전환은 뒤의 마이크로태스크에 일어난다.
- ObjectNode BranchStrategy는 불린 6개(`__locked__`/`__batched__`/`__intended__`/`__isolated__`/`__expired__`/`__composedValid__`)의 암묵적 상태 기계다. 어떤 조합이 합법인지 타입이 강제하지 않는다.
- `oneOf`는 `__processOneOfChildren__` 경로, `active`는 자식이 스스로 reset하는 경로로, 같은 일을 두 라이프사이클이 나눠 한다.
- `globalState`는 OR 누적이다(`shallowPatch`의 `additive`). 한 번 켜진 전역 플래그는 내릴 수 없고 어느 노드가 켰는지 알 수 없다.
- 배열의 `push`/`remove`/`clear`만 Promise를 돌려준다. 값 쓰기는 동기인데 구조 변경 API만 await 대상이다.

## 6. core와 React의 경계

- core의 React 런타임 의존은 한 곳이다. `core/nodes/AbstractNode/utils/getNodeGroup/getNodeGroup.ts:27-29`가 `isReactComponent(schema.FormTypeInput)`로 branch/terminal을 정한다. **렌더링 선택이 노드 트리의 형태를 결정한다.**
- core는 컴포넌트 참조나 ref를 들지 않지만, 렌더 계층에 대한 명령 어휘(`RequestFocus`/`RequestSelect`/`RequestRefresh`/`RequestRemount`)와 React key 규약(`AbstractNode.ts:207-213`)을 이벤트 타입 수준에서 소유한다.
- `types/jsonSchema.ts`가 React 타입을 import하고 core의 132개 파일이 그 타입을 import한다.
- 구독 모델: `useSchemaNodeTracker` = `useSyncExternalStore(subscribe, () => node.revision(mask))`. `revision`은 리스너 유무와 무관한 단조 원장이어서 render→commit 사이에 빠진 배달을 React가 다시 맞춘다(`hooks/useSchemaNodeTracker.ts:36-49`).

## 7. 문서와 코드의 불일치

- 패키지 `CLAUDE.md`는 `find()`가 `*`를 지원한다고 적지만 `findNode`에는 와일드카드 분기가 없다(`findNodes`만 있다).
- 같은 문서가 `node.enhancedValue`를 공개 API로 적지만 실제는 private·루트 전용 `__enhancedValue__`다.
- `RequestRemount`는 프로덕션 코드에서 한 번도 발행되지 않는다. 소비처는 `SchemaNodeProxy.tsx:84` 하나다.
- `processOneOfSchema`의 `INTENT.md`는 "입력 직접 변경 금지"라고 적지만 구현은 `merge(schema, …)`로 제자리 병합한다(이슈 #342 §3.7).

## 8. 추적하지 않은 것

`$ref` 해석 상세, `intersectSchema`의 타입별 병합 본문, `InjectionGuardManager`와 `injectTo`의 스케줄링, `VirtualNode`의 양방향 동기화, `ValidationErrorManager`의 병합 규칙, virtualization 내부, ajv 플러그인 패키지.

추적 보고에 있었지만 재확인하지 않은 주장 두 가지 — 재설계의 논거로 쓰기 전에 실측이 필요하다.

- `getSimpleEquality`의 빠른 경로가 문자열이 아닌 판별값에 `-1`을 돌려, 최적화 발동 여부에 따라 동작이 갈린다(`.../getSimpleEquality.ts:61-63`).
- `items` 바로 아래의 `oneOf`는 마커만 받고 소비처가 없다.
