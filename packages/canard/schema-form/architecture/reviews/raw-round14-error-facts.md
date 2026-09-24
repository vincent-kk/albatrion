# 14라운드 — 오류 처리 현행 사실 (scout 원문)

2026-09-24. 소유자의 지시("이 error 처리 기법에 대해서 확장 조사를 한번 해보세요")에 따라 오늘 코드의 throw·경고·리스너 예외·React 경계 사실을 모았다. 편집자는 고치지 않았다.

**1. 코어 throw 지점 (30곳, 테스트 제외)**
- `JSONSchemaError`: 생성 단계에 집중 — `schemaNodeFactory.ts:116`(UNKNOWN_JSON_SCHEMA), `getCompositionNodeMapList.ts:82,97`(COMPOSITION_*_REDEFINITION), `throwIfTypeRedefinition.ts:30`(COMPOSITION_TYPE_REDEFINITION), `getVirtualReferencesMap.ts:42,56`(VIRTUAL_FIELDS_*), `VirtualNode.ts:47`(INVALID_VIRTUAL_NODE_VALUES), `ArrayNode/validate.ts:27,41,54,73`(UNEXPECTED_ARRAY_SCHEMA), `processAllOfSchema.ts:47`·`intersectConst.ts:25`·`validateRange.ts:23`·`intersectEnum.ts:37`(스키마 병합 단계). 예외: `AbstractNode.ts:1012`(INJECT_TO)는 **쓰기(setValue) 단계**, ComputedPropertiesManager 하위 4곳(`createDynamicFunction.ts:44` 등)은 **computed 평가 단계**.
- `SchemaFormError`: `EventCascadeManager.ts:97`(INFINITE_LOOP_DETECTED, **이벤트 배치 단계**), `formTypeInputMap.ts:54`(FORM_TYPE_INPUT_MAP).
- `UnhandledError`: `registerPlugin.ts:215`(REGISTER_PLUGIN, **플러그인 등록 단계**).
- `ValidationError`: `Form.tsx:119`(SCHEMA_VALIDATION_FAILED, **제출(submit) 단계**, `async onSubmit` 내부).
- `schema-form-ajv8-plugin/src`에는 `throw new` 지점이 전혀 없음(검증기 자체는 오류를 던지지 않고 결과 배열로 반환하는 것으로 추정).

**React 이벤트 핸들러 내 전파 경로**: `SchemaNodeInput.tsx:53`의 `node.setValue(...)`, `useSchemaNodeSubscribe.ts`, `EventCascadeManager.__resolve__`(`EventCascadeManager.ts:207-213`) 어디에도 try/catch가 없음. 즉 `onChange`에서 `setValue`가 `INJECT_TO` 또는 `INFINITE_LOOP_DETECTED`를 던지면 **잡히지 않고 이벤트 핸들러를 그대로 뚫고 나감** — `withErrorBoundary`는 렌더 단계 예외만 잡으므로 이 경로는 방어되지 않음(React 이벤트 핸들러 throw는 에러 바운더리 범위 밖, 표준 React 동작).

**2. console.error/warn, warnDevelopmentIssue**
- `console.error` 1곳: `ValidationManager.ts:221`(검증기 자체 오류 시 재던지지 않고 로그만 남김).
- `warnDevelopmentIssue`(`helpers/warning/warnDevelopmentIssue.ts:25`) 사용처: `warnIfNullBranchIgnored.ts:25`, `warnIfNestedComposition.ts:24`, `warnIfNullUnreachable.ts:34`, `VirtualizationManager.ts:201`, `processAllOfSchema.ts:40` — 모두 스키마 조합(oneOf/allOf) 단계 경고.
- 프로덕션 분기는 `warnDevelopmentIssue.ts:26` 한 곳에만 존재: `if (process.env.NODE_ENV === 'production') return;`. 동일 code+message는 세션당 1회만 출력(`emittedWarnings` Set으로 중복 억제).

**3. 리스너 예외 처리**: `EventCascadeManager.__resolve__`(`EventCascadeManager.ts:212`) — `for (const listener of this.__listeners__) listener(eventCollection);`에 try/catch 없음. 한 리스너가 던지면 나머지 리스너 순회가 중단되고 예외가 호출자(마이크로태스크 콜백 또는 `dispatch` 호출자)로 전파됨. `AbstractNode.subscribe/publish`는 이 메서드에 위임만 하며 자체 방어 없음.

**4. `Form` 오류 관련 props** (`components/Form/type.ts`): `onError` prop은 **존재하지 않음**. 대신 `onValidate?: Fn<[JSONSchemaError[]]>`(36,54행), `errors?: JSONSchemaError[]`(초기 검증 오류, 66행), `showError?: boolean | ShowError`(77행, 기본 `ShowError.DirtyTouched`), `validationMode?: ValidationMode`(84행, `None|OnChange|OnRequest`), `validatorFactory?: ValidatorFactory`(86행). `FormHandle`에는 `getErrors`, `showError`, `validate` 존재.

**5. `withErrorBoundary`**: 표준 React 에러 바운더리(`react-utils/src/hoc/withErrorBoundary/withErrorBoundary.tsx`) — **렌더 중 throw만** 잡음. 이벤트 핸들러·비동기 코드·자기 자신 내부 예외는 못 잡음. 사용처: `Form.tsx:16`(루트, `withErrorBoundaryForwardRef`), `SchemaNodeProxy.tsx:59`, `SchemaNodeInputWrapper.tsx:56-57`, `useFormTypeInput.ts:36-37`, `VirtualizationManager.ts:214`(Placeholder), `formTypeInputMap.ts:32,37`, `formTypeInputDefinitions.ts:32,37` — 총 7개 파일.

**6. `validatorFactory`**: 타입은 `ValidatorFactory`(`components/Form/type.ts:25,86`). `ValidationManager.ts:203`: `validatorFactory?.(schema) || PluginManager.validator?.compile(schema)` — **Form 레벨 `validatorFactory`가 플러그인 `ValidatorPlugin.compile`보다 우선**. `ValidatorPlugin`(`app/plugin/type.ts:240-249`) 정의: `compile: ValidatorFactory`(코어가 호출), `bind?: Fn<[instance]>`(등록 전 플러그인 객체에 커스텀 인스턴스를 주입하는 소비자 전용 훅 — 코어는 절대 호출하지 않음). README는 `validatorFactory`를 `FormProvider`/`Form` 예시(104, 257-315행)로 안내하나 "우선순위"나 "에러 처리"라는 별도 절은 없음.

**7. `@winglet/common-utils` merge**: `merge.ts`는 시그니처 `merge(target, source)` 단 하나, **옵션 파라미터 없음**. 배열은 인덱스별 재귀 병합. `object/` 디렉터리 전체에 `mergeWith`, `deepMerge` 등 대안 유틸 없음.

**8. 테스트**: `toThrow` 사용 파일 30개(schema-form/src), 대표: `core/__tests__/ObjectNode.composition.typeCompatibility.test.ts`, `ArrayNode.schemaValidation.test.ts`, `AbstractNode.injectTo.test.ts`, `processAllOfSchema` 계열(intersect*.test.ts 6개), `getComputedPropertiesManager/utils/__tests__/errorHandling.test.ts`. `console.warn` spy 사용 파일 7개.

**9. 문서 내 오류 처리 절**: README.md에 두 곳 — `#### Error Handling`(1909행, injectTo 핸들러 오류가 `JSONSchemaError`로 포착·래핑되어 경로/원인 컨텍스트 포함된다고 서술), `#### Handling Submission Errors`(2131행, `isValidationError` 가드와 `useFormSubmit` 훅으로 제출 시 `ValidationError`를 다루는 예시). 전역 오류 처리 "정책"을 선언한 절은 없음. `Form.tsx:119`의 `SCHEMA_VALIDATION_FAILED` throw는 `async onSubmit` 내부에서 발생하며 Form 컴포넌트 자체는 이 예외를 잡지 않음.

미조사: `@winglet/common-utils`·`react-utils`의 다른 서브패스는 전수 조사하지 않음.
