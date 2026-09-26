# 9라운드 원문 — 현재 코드의 사실 조사 (로컬 sonnet scout, 읽기 전용)

편집자 주: 열 항목의 대조에 필요한 현재 코드의 동작을 조사한 보고의 원문이다. 경로는 `packages/canard/schema-form` 기준이다. 편집자는 내용을 고치지 않았다.

---

**1) oneOf/anyOf 분기 선택**
활성 분기는 `ComputedPropertiesManager.oneOfIndex`/`anyOfIndices`가 계산하고, `AbstractNode`가 이를 노출합니다(`src/core/nodes/AbstractNode/AbstractNode.ts:490-500`). `BranchStrategy`는 `this.__host__.oneOfIndex`를 읽어 자식 맵을 갱신합니다(`src/core/nodes/ObjectNode/strategies/BranchStrategy/BranchStrategy.ts:468, 531`).

판별자(discriminant) 읽기: `getExpressionFromSchema`가 각 분기의 `properties`를 훑어 `type`/`$ref`가 없는 속성 중 `const` 또는 `enum`(단일/다중)을 조건식으로 변환합니다 — `dependencies[i] === 'value'` 형태(`src/core/nodes/AbstractNode/utils/getComputedPropertiesManager/ComputedPropertiesManager/utils/getConditionIndexFactory/utils/getExpressionFromSchema.ts:35-51`). 이 조건은 분기의 `&if`/`computed.if`와 `combineConditions`로 결합됩니다(`extractConditionInfo.ts:55-58`). 즉 "판별자 자동 감지 + 명시적 `&if`" 두 경로가 공존하며 병합됩니다.

수동 선택자(사용자가 인덱스를 직접 지정)는 없습니다 — `oneOfIndex`는 항상 `ComputedPropertiesManager.recalculate()`가 산출한 읽기전용 값입니다(`ComputedPropertiesManager.ts:106, 210-211`).

조건이 하나도 참이 아니면 인덱스는 기본값 `-1`(`ComputedPropertiesManager.ts:106`, `getSimpleEquality.ts:63`, `getConditionIndexFactory.ts:62`)이며, `BranchStrategy.__processOneOfChildren__`에서 `current === -1`이면 `oneOfChildNodeMap = null`이 되어 해당 분기의 모든 속성이 자식에서 제거됩니다(`BranchStrategy.ts:472-473`). `docs/.../knowledge/expressions.md:107`도 "oneOf 미매치 시 폼 데이터에서 제거"라고 명시합니다.

**2) if/then/else**
검증기가 컴파일하는 게 아니라 자체 평가기입니다. `flattenConditionsInto`가 `schema.if.properties`에서 `const`/`enum`만 읽어 `then.required`/`else.required` 목록을 필드별 조건으로 변환합니다(`src/core/nodes/ObjectNode/strategies/BranchStrategy/utils/getFieldConditionMap/utils/flattenConditions.ts:44-97`). 런타임에는 `requiredFactory`가 현재 값과 조건을 비교해 그 필드가 "required"인지만 판정합니다(`.../processValueWithSchema/utils/requiredFactory.ts:17-43`). 즉 **required 여부만** 바뀌고, 새 속성 추가/제거는 없습니다 — 조건부 필드는 반드시 `properties`에 미리 선언돼 있어야 합니다. `docs/.../expressions.md:116`: "if/then/else... drives conditional validation, not field addition/removal... never mutates branch values; use oneOf/anyOf for that."

**3) allOf 병합**
`processAllOfSchema`가 `allOf` 배열을 순서대로 접어 하나의 `jsonSchema`로 만듭니다(`src/helpers/jsonSchema/processAllOfSchema/processAllOfSchema.ts:29-55`). 키워드별 전략(`intersectSchema/utils/constants.ts:8-88`):
- FIRST_WIN_FIELDS(`title`,`description`,`default`,`readOnly`,`format`,`additionalProperties`, `prefixItems` 등): base(기존 누적 스키마)가 값이 있으면 유지, 없으면 source 채택 — 즉 **먼저 나온 값이 이김**.
- SPECIAL_FIELDS(`type`,`enum`,`const`,`required`,`min/max*`,`properties`,`items` 등): 전용 intersect 함수(`intersectObjectSchema` 등)로 교집합/유니온 처리(예: `unionRequired.ts`).
- 나머지 필드는 `processOverwriteFields`가 **뒤에 나온 source가 base를 덮어씀**(마지막 승리)(`processOverwriteFields.ts:15-25`).
- IGNORE_FIELDS(`allOf`,`anyOf`,`oneOf`,`not`,`if`,`then`,`else`,`dependentSchemas` 등)는 병합되지 않고 개발 경고(`ALL_OF_KEYWORD_IGNORED_FOR_FORM`)만 발생합니다(`processAllOfSchema.ts:38-44`). **즉 allOf 항목 안의 if/then/else는 무시되고 경고만 뜹니다.**

각 노드의 `jsonSchema`는 이 병합 결과를 반영한 정적 스냅샷이며, `oneOf`/`anyOf`/`if` 같은 조건부 분기 결과는 `jsonSchema` 자체가 아니라 위 1)·2)의 런타임 계산(`oneOfIndex`, `fieldConditionMap`)으로 별도 관리됩니다.

**4) computed vs `&`**
동일한 여덟 키(`watch, active, visible, readOnly, disabled, pristine, derived, if`)의 별칭 관계입니다(`docs/.../expressions.md:3`). 해석 함수는 두 갈래:
- boolean형(`active/visible/readOnly/disabled/pristine`): `checkComputedOptionFactory`의 우선순위 `rootJSONSchema[fieldName] ?? jsonSchema[fieldName] ?? jsonSchema.computed?.[fieldName] ?? jsonSchema['&'+fieldName]`(`checkComputedOptionFactory.ts:22-26`) — 즉 **루트 스키마 최상위 키워드 > 노드 자신의 최상위 키워드 > `computed.X` > `&X`** 순.
- `oneOf`/`anyOf`의 `if`: `extractConditionInfo`가 `oneOfSchema.computed?.[conditionField] ?? oneOfSchema['&'+conditionField]`로 읽어 `computed.if`가 `&if`보다 우선(`extractConditionInfo.ts:44-45`).

**5) injectTo와 computed/derived 순서**
`AbstractNode.__initialize__`: `__prepareUpdateDependencies__()`(computed/&, derived 구독 등록) → `__prepareInjectHandler__()`(injectTo 구독 등록) 순으로 호출(`AbstractNode.ts:1044-1045`). `derived`는 `UpdateComputedProperties` 이벤트에서 의존 경로 재계산 후 자기 값을 덮어씁니다(`AbstractNode.ts:541-551`). `injectTo`는 자기 노드의 `UpdateValue`에서 `RequestInjection`을 publish하고, 그 이벤트에서 실제 핸들러를 실행해 대상 경로에 `setValue`(자동 갱신이면 `Automatic|Overwrite`)합니다(`AbstractNode.ts:967-1021`), `InjectionGuardManager`로 순환 주입을 차단합니다. 문서(`docs/.../inject-to.md:1-10`): `injectTo`는 1회성 전파, `derived`는 지속적 재계산이며 두 값-소유권 메커니즘은 별개입니다.

**6) 전역 vs 노드 레벨 설정**
`Form`의 `readOnly`/`disabled` prop은 `InputControlContext`로 전파되고(`Form.tsx:60-61, 183`), `SchemaNodeInput`에서 `readOnly={rootReadOnly || node.readOnly}`, `disabled={rootDisabled || node.disabled}`로 **OR 결합**됩니다(`SchemaNodeInput.tsx:46-47, 111-112`) — 즉 둘 중 하나라도 true면 잠깁니다(override가 아니라 합산).
`context` prop도 Form → `WorkspaceContext`로 전파되며 `computed`식의 `@.field`로 참조됩니다(`docs/.../expressions.md:24, 82-83`).
경로 참조 스코프(`docs/.../expressions.md:17-26`): `../field`=부모 기준 형제, `./field`=현재 노드의 자식(단 oneOf/anyOf 분기 내부에서는 분기를 소유한 객체 기준), `/abs/path`=폼 루트 절대경로, `@.field`=Form의 `context` prop(외부 데이터) — `@`는 computed 표현식 안에서만 유효, `node.find()`/`formTypeInputMap` 키에서는 무효.
`formTypeInputDefinitions`/`errorMessages`/`validationMode` 등 나머지 Form-레벨 옵션의 개별 병합 지점은 이번 조사에서 소스까지는 못 갔습니다(아래 "미조사" 참고).

**7) 문서 페이지와 정의 라인 범위**
`docs/agents/skills/schema-form-skill/knowledge/expressions.md`:
- computed/`&` 별칭 총론: 1-15
- 경로 참조 표: 17-26
- watch/derived: 44-58
- 평가 타이밍(microtask): 59-61
- `@` 컨텍스트: 63-83
- oneOf/anyOf/allOf 분기: 85-112
- if/then/else: 114-117
`docs/agents/skills/schema-form-skill/knowledge/inject-to.md`: injectTo 총론 1-21, 핸들러 계약 23-34, 순환 참조 36-38.
`docs/agents/skills/schema-form-skill/knowledge/nullable-branch-nodes.md`: oneOf/anyOf의 null 분기 관련(3가지 상태) 1-52 — oneOf 직접 정의는 아니지만 null 분기와 상호작용을 다룸.

**미조사(범위 밖)**: `formTypeInputDefinitions`/`formTypeMap`/`errorMessages`/`validationMode`의 정확한 Form-레벨↔노드-레벨 병합 소스 지점(우선순위 문서상 CLAUDE.md에 FormTypeInput 우선순위 5단계는 있으나 validationMode/errorMessages 병합은 코드 확인 안 함), `derived`가 코드 검색어로 잡히는 다른 키워드 사용처 전수 조사(주요 경로만 확인), README/SPECIFICATION.md 쪽 문서는 열지 않음(agents/knowledge 문서로 충분히 커버된다고 판단).
