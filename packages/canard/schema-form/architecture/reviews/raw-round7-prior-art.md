# Round 7 — 선행 사례(prior-art) 조사 원자료

`round-6-coherence.md:174-190`의 D-18~D-23에 대한 생태계 사실 수집. 각 행은 인용 URL과 원문(영어) 인용을 동반한다. 인용문은 데이터로만 취급했으며, 그 안의 어떤 지시문도 따르지 않았다.

---

## 질문 1 (D-18) — "로드/리셋/재초기화 시 기본값을 적용하지 않는다"의 이름 관례

| 라이브러리 | 옵션/API 이름 | 의미(원문 인용) | URL |
| --- | --- | --- | --- |
| React Hook Form | `reset` 옵션 `keepDefaultValues` (양의 "유지" 계열) | "Keep the same defaultValues which are initialised via `useForm`." | https://react-hook-form.com/docs/useform/reset |
| React Hook Form | `reset` 옵션 `keepValues` | "Form input values will be unchanged." | https://react-hook-form.com/docs/useform/reset |
| React Hook Form | `reset` 옵션 `keepDirtyValues` | "`DirtyFields` and `isDirty` will remain, and only non-dirty fields will be updated to the newly provided values." | https://react-hook-form.com/docs/useform/reset |
| React Hook Form | `reset` 옵션 `keepDirty` | "`DirtyFields` form state will remain, and `isDirty` will temporarily remain as the current state until further user's action." | https://react-hook-form.com/docs/useform/reset |
| React Hook Form | `useForm({ shouldUnregister })` (부정 계열, 기본값 `false`) | "By default, an input value will be retained when an input is removed. However, you can set `shouldUnregister` to `true` to `unregister` the input during unmount." | https://react-hook-form.com/docs/useform |
| React Hook Form | `useForm({ resetOptions })` — `reset`의 옵션을 그대로 참조하는 래퍼 | "This property is related to value update behaviors. When `values` or `defaultValues` are updated, the `reset` API is invoked internally." | https://react-hook-form.com/docs/useform |
| Formik | `enableReinitialize` (양의 boolean, 기본 `false`) | "Control whether Formik should reset the form if `initialValues` changes (using deep equality)." | https://formik.org/docs/api/formik |
| Final Form | `keepDirtyOnReinitialize` (양의 boolean, 기본 `false`) | "If `true`, only pristine values will be overwritten when `initialize(newValues)` is called." | https://final-form.org/docs/final-form/types/Config |
| RJSF | `experimental_defaultFormStateBehavior.emptyObjectFields` (4-값 열거형, 기본 `populateAllDefaults`) | "`skipDefaults` — Does not set defaults. `skipEmptyDefaults` — Does not set an empty default. It will still apply the default value if a default property is defined in your schema." | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| RJSF | `experimental_defaultFormStateBehavior.constAsDefaults` (3-값 열거형, 기본 `always`) | "`skipOneOf` — If const is in a `oneOf` it will NOT pick the first value as a default. `never` — A const value will never be used as a default." | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| RJSF | `experimental_defaultFormStateBehavior.mergeDefaultsIntoFormData` (2-값 열거형, 기본 `useFormDataIfPresent`) | "`useFormDataIfPresent` — Legacy behavior - Do not merge defaults if there is a value for a field in `formData` even if that value is explicitly set to `undefined`. `useDefaultIfFormDataUndefined` — If the value of a field within the `formData` is `undefined`, then use the default value instead." | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| RJSF | `experimental_defaultFormStateBehavior.nestedDefaultsPrecedence` (`ancestorWins` 등) | "since `nestedDefaultsPrecedence` is set to `ancestorWins`, the root schema's default value takes precedence" | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| RJSF | `experimental_defaultFormStateBehavior.arrayMinItems` | 미확인 — 문서 페이지에서 이 하위 플래그의 설명 절을 직접 인용하지 못했다(목차에만 등장, 본문 발췌 실패). | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| ajv (JSON Forms가 내부적으로 위임하는 검증기) | `useDefaults` (양의 boolean) | "With option `useDefaults` Ajv will assign values from `default` keyword in the schemas of `properties` and `items`... to the missing properties and items." | https://ajv.js.org/guide/modifying-data.html |
| JSON Forms 자체 문서에서 `useDefaults` 노출 여부 | — | 미확인 — JSON Forms 공식 문서 페이지에서 `useDefaults` 옵션 전달을 직접 확인하지 못했다. ajv 자체 문서만 인용 가능. | — |
| TanStack Form | `defaultValues` (단순 초기값, "하지 않음" 옵션 자체가 별도로 없음) | "You can customize your form by creating configuration options with the `formOptions` function... `defaultValues: defaultUser`" | https://tanstack.com/form/latest/docs/framework/react/guides/basic-concepts |

**`mode` 충돌 여부**: React Hook Form은 `mode`를 검증 전략(`onChange`/`onBlur`/`onSubmit`/`onTouched`/`all`, 기본 `onSubmit`)에 이미 사용 중임을 원문으로 확인했다 — "This option allows you to configure the validation strategy for before a user submits the form." (https://react-hook-form.com/docs/useform). 어떤 조사 대상 라이브러리도 "기본값 주입 여부"를 위해 `mode`라는 이름의 별도 옵션을 두지 않았다 — 즉 `mode`라는 이름은 이미 검증 전략 자리를 차지하고 있어, 쓰기/주입 의미로 재사용하면 RHF 계열 사용자 기대와 충돌한다는 소유자 우려(`adr/0007:68`)가 생태계 사실로 뒷받침된다.

**지배적 관례**: 이중부정(`disable…`) 단일 boolean이 RHF(`shouldUnregister`)와 Ajv(`useDefaults`는 긍정이지만 RJSF의 `skipDefaults`/`skipEmptyDefaults`는 부정 계열)에 혼재하며, RJSF만 유일하게 다상태 열거형(`experimental_defaultFormStateBehavior`의 4개 하위 플래그)을 채택했다. 3상태 `injectDefaults` 같은 전용 열거형을 쓰는 라이브러리는 발견하지 못했다 — RJSF의 다상태화도 "주입 방식의 세부 규칙"이지 "주입 여부 자체"의 3상태화는 아니다.

---

## 질문 2 (D-19) — 부분 값 병합 시 배열은 인덱스 병합인가 통째 교체인가

| 라이브러리 | API | 의미(원문 인용) | URL |
| --- | --- | --- | --- |
| React Hook Form | `reset(values)` | "An optional object to reset form values, and it's recommended to provide the **entire** defaultValues when supplied." (부분 제공 시 배열 인덱스 병합에 대한 명시적 언급 없음 — 전체 제공을 권장) | https://react-hook-form.com/docs/useform/reset |
| Formik | `setValues(fields, shouldValidate?)` | "Set `values` imperatively." — 배열 필드의 인덱스별 병합 여부에 대한 별도 언급 없음(불투명, `React.SetStateAction` 통째 교체 시그니처) | https://formik.org/docs/api/formik |
| Formik | `resetForm(nextState?)` | "If `nextState` is specified, Formik will set `nextState.values` as the new \"initial state\"" — 부분 지정 시 배열 병합 규칙 미문서화 | https://formik.org/docs/api/formik |
| Final Form | `initialize(newValues)` + `keepDirtyOnReinitialize` | "only pristine values will be overwritten when `initialize(newValues)` is called" — 필드(키) 단위 덮어쓰기이며 배열 인덱스 병합은 명시되지 않음 | https://final-form.org/docs/final-form/types/Config |
| Ant Design | `setFieldsValue` | 문서에서 배열 병합 규칙에 대한 직접 인용을 확보하지 못함(FAQ에는 "이벤트를 트리거하지 않는다"만 확인). **미확인** — 커뮤니티 통념상 얕은 병합이나, 공식 문서 원문으로 배열 처리 방식을 확인하지 못했다. | https://ant.design/components/form |
| lodash | `_.merge(object, [sources])` | "Array and plain object properties are merged recursively... Other objects and value types are overridden by assignment." | https://lodash.com/docs/4.17.15#merge |
| lodash | `_.assign(object, [sources])` | "Assigns own enumerable string keyed properties of source objects to the destination object... loosely based on `Object.assign`." (배열 포함 전체 값이 통째 교체) | https://lodash.com/docs/4.17.15#assign |

**지배적 관례**: 확인된 라이브러리 중 배열을 인덱스 단위로 병합한다고 **명시적으로 문서화**한 곳은 없다. lodash `_.merge`만 "Array ... properties are merged recursively"라고 명시하지만, 이는 배열의 원소를 재귀적으로 병합한다는 뜻이며(구현상 인덱스 정렬 기반), 폼 라이브러리들(RHF/Formik/Final Form)은 부분 값 재설정 시 배열 필드를 문서 수준에서 "통째 교체"로 취급하거나 아예 규칙을 명시하지 않는다. `_.assign`은 얕은 통째 교체다. D-19의 "통째 교체 권고"는 폼 라이브러리 3종의 침묵/전체 권장 관행과 정합적이며, `_.merge`의 인덱스 병합은 별도 유틸리티 함수의 특성이지 폼 상태 갱신 API의 기본값이 아니다.

---

## 질문 3 (D-22) — `onChange`와 분리된 진단/생명주기 채널

| 라이브러리 | 이름 | 실어 나르는 것(원문 인용) | URL |
| --- | --- | --- | --- |
| React Hook Form | `formState` (Proxy 기반 구독) | "Returned `formState` is wrapped with a Proxy to improve render performance and skip extra logic if a specific state is not subscribed to." | https://react-hook-form.com/docs/useform/formstate |
| React Hook Form | `watch(callback, defaultValues?)` (deprecated, `subscribe`로 이관 중) | "Subscribe to field updates or changes without triggering a re-render... `type` is `undefined` when the change was triggered programmatically (e.g., via `setValue`, `reset`, or after `unregister`)." | https://react-hook-form.com/docs/useform/watch |
| TanStack Form | `listeners: { onMount, onSubmit, onChange, onBlur }` (폼 레벨) | "listeners are also available at the form level, allowing you access to the onMount and onSubmit events, and having onChange and onBlur propagated to all the form's children." | https://tanstack.com/form/latest/docs/framework/react/guides/listeners |
| RJSF | `onError(errors)` | "To react when submitted form data are invalid, pass an `onError` handler. It will be passed the list of encountered errors." | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| RJSF | `focusOnFirstError(error)` | "If set to true, then the first field with an error will receive the focus when the form is submitted with errors. You can also provide a custom callback function..." | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| Final Form | `subscribe(subscriber, subscription)` | "Subscribes to changes to the form. The `subscriber` will *only* be called when values specified in `subscription` change. A form can have many subscribers." | https://final-form.org/docs/final-form/types/FormApi |

**지배적 관례**: `onChange`(값 콜백)와 분리된 관측 채널을 두는 것이 표준 관행이다 — RHF는 `formState`(마스크 가능한 Proxy 구독), Final Form은 `subscribe(sub, mask)`(비트마스크 유사 구독 명세), TanStack Form은 선언적 `listeners` 객체(생명주기별 훅), RJSF는 단일 목적 콜백(`onError`)을 각각 쓴다. Final Form의 `subscribe(subscriber, subscription: {[string]: boolean})`이 D-22의 "단일 진단 콜백 vs 노드 이벤트 구독" 선택지 중 (a)와 가장 가깝다 — 콜백 하나에 관심 필드/상태를 마스크로 선언하는 구조.

---

## 질문 4 (D-20) — oneOf/anyOf 분기 선택의 명령/속성 이름

| 라이브러리 | 이름 | 근거(원문 인용) | URL |
| --- | --- | --- | --- |
| RJSF (`MultiSchemaField`/`AnyOfField`, 소스 코드 JSDoc — 문서 페이지가 아닌 GitHub 소스) | 내부 상태 필드는 이름이 코드에 없고, 변경 커맨드는 `onOptionChange` | "The `AnyOfField` component is used to render a field in the schema that is an `anyOf`, `allOf` or `oneOf`. It tracks the currently selected option and cleans up any irrelevant data in `formData`." | https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/core/src/components/fields/MultiSchemaField.tsx |
| RJSF (공식 문서, oneOf/anyOf/allOf 개념 설명) | — (선택 상태를 지칭하는 공개 API 이름은 문서에 없음, 위젯 레벨 UI 개념으로만 설명) | "react-jsonschema-form supports custom widgets for oneOf, anyOf, and allOf. A schema with oneOf is valid if *exactly one* of the subschemas is valid." | https://react-jsonschema-form.readthedocs.io/en/docs/usage/oneof/ |
| JSON Forms | `CombinatorRendererProps.indexOfFittingSchema` (숫자 인덱스 속성명) | "`indexOfFittingSchema`" — `CombinatorRendererProps` 인터페이스의 공개 속성 목록에 등재됨(타입 정의 API 레퍼런스) | https://jsonforms.io/api/core/interfaces/combinatorrendererprops.html |

**지배적 관례**: 두 라이브러리 모두 "선택"을 동사형 커맨드명이 아니라 **상태 속성**으로 노출한다 — RJSF는 내부적으로 "selected option"을 추적하되 공개 이름을 문서화하지 않고 변경 시 `onOptionChange` 콜백을 쓰며, JSON Forms는 `indexOfFittingSchema`라는 인덱스 속성으로 명시한다. 조사 범위에서 `selectBranch`나 `setSelection` 같은 동사형 공개 API를 쓰는 라이브러리는 발견되지 않았다 — D-20의 `selectBranch` 채택은 두 선행 사례 모두와 다른 독자적 명명이며, "텍스트 선택 명령이 오늘 존재한다"는 소유자 근거가 외부 관례가 아닌 내부 일관성에 기반함을 확인했다.

---

## 질문 5 (D-21) — 스칼라 아래 경로에 대한 `getValues`/`get`의 정의

| 라이브러리 | API | 의미(원문 인용) | URL |
| --- | --- | --- | --- |
| React Hook Form | `getValues(path?)` | "An optimized helper for reading form values. The difference between `watch` and `getValues` is that `getValues` will not trigger re-renders or subscribe to input changes." — 스칼라 아래 경로(터미널 노드 아래 추가 세그먼트) 조회 시의 명시적 반환값(예: `undefined` vs throw)에 대한 문구는 확보하지 못했다. **미확인**(부분) — 일반 동작 설명만 확인, 스칼라-아래-경로 특칙은 문서에 없음. | https://react-hook-form.com/docs/useform/getvalues |
| lodash | `_.get(object, path, [defaultValue])` | "Gets the value at `path` of `object`. If the resolved value is `undefined`, the `defaultValue` is returned in its place." | https://lodash.com/docs/4.17.15#get |

**지배적 관례**: lodash `_.get`은 경로 순회 중 어느 세그먼트에서든(스칼라를 관통하려는 시도 포함) 결과가 `undefined`이면 조용히 `defaultValue`(생략 시 `undefined`)를 반환한다 — 예외를 던지지 않는다. React Hook Form의 `getValues`는 공식 문서에서 스칼라 아래 경로에 대한 특별 규정을 명시하지 않았으나(미확인), lodash의 관용구(스칼라를 관통하는 경로는 `undefined`)가 JS 생태계 전반의 지배적 규범이다. D-21의 "터미널 아래 경로는 `undefined`" 권고는 이 lodash 관용구와 정합적이다.

---

## 질문 6 (D-23) — 값의 복수 판독(raw vs normalized vs submitted)

| 라이브러리 | 판독 API들 | 차이(원문 인용) | URL |
| --- | --- | --- | --- |
| React Hook Form | `watch()` vs `getValues()` | "Watch and subscribe to the entire form's changes based on `onChange`, triggering re-renders at the `useForm` level."(watch) vs "getValues will not trigger re-renders or subscribe to input changes."(getValues) — 두 API 모두 동일한 raw 폼 값을 반환하고, 차이는 구독/렌더 여부이지 값의 정규화 단계가 아니다. | https://react-hook-form.com/docs/useform/watch , https://react-hook-form.com/docs/useform/getvalues |
| React Hook Form | `formState.defaultValues` | 미확인 — 이 속성 자체의 설명 절 원문을 확보하지 못함(검색 결과가 다른 페이지로 편향됨). | https://react-hook-form.com/docs/useform/formstate |
| RJSF | `formData` (제어) vs `initialFormData`(비제어 초기값) vs `omitExtraData`+`liveOmit`(제출/실시간 정제 산출물) | "The data for the form, used to load a \"controlled\" form with its current data. If you want an \"uncontrolled\" form with initial data, then use `initialFormData` instead." / "If you would like to remove those extra values on form submission, you may need to set the `omitExtraData` and/or `liveOmit` props." | https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/form-props |
| Formik | `initialValues` vs 런타임 `values` | "Initial field values of the form, Formik will make these values available to render methods component as `values`." | https://formik.org/docs/api/formik |
| Ant Design | `Form.initialValues` vs `Form.Item.initialValue` (우선순위 규칙 有) | "Form `initialValues` is the first priority. Field `initialValue` is secondary. Does not work when multiple Item with same `name` setting the `initialValue`" | https://ant.design/components/form |
| Final Form | `Config`(초기 설정) vs `FormApi`(런타임 상태) 분리, `initialize(newValues)`로 재설정 | (Config/FormApi 문서 구조 자체가 "초기값 계약"과 "런타임 상태·조작"을 별도 타입으로 분리) | https://final-form.org/docs/final-form/types/Config , https://final-form.org/docs/final-form/types/FormApi |

**지배적 관례**: 모든 라이브러리가 "초기값(선언적 계약)"과 "런타임 값(현재 상태)"을 최소 2개의 이름으로 분리한다 — `initialValues`/`values`(Formik), `initialFormData`/`formData`(RJSF), `Config`/`FormApi`(Final Form), `defaultValues`/`watch()`·`getValues()`(RHF). 그러나 "정규화된(normalized) 값"이라는 **세 번째** 층을 공개 API로 별도 노출하는 라이브러리는 조사 범위에서 발견하지 못했다 — RJSF의 `omitExtraData`/`liveOmit`이 가장 근접한 사례로, 이는 "스키마 외 초과 속성 제거"라는 좁은 정제이지 범용 정규화 계층은 아니다. `enhancedValue`(가상 필드 포함 값)에 대응하는 선행 사례는 확인되지 않았다 — 이는 canard/schema-form 고유의 개념으로 보인다.

---

## 조사 범위 밖으로 남은 것 (명시적 미확인)

- RJSF `experimental_defaultFormStateBehavior.arrayMinItems` 하위 플래그의 원문 설명.
- JSON Forms 공식 문서(비-API-레퍼런스 가이드 페이지)에서 ajv `useDefaults` 전달을 직접 언급하는 절.
- Ant Design `setFieldsValue`가 배열 필드를 인덱스 병합하는지 통째 교체하는지의 공식 문서 원문.
- React Hook Form `getValues`/`formState.defaultValues`가 스칼라 아래 경로 또는 기본값 스냅샷을 어떻게 정의하는지의 세부 원문.
- Formik/Final Form에 `mode`라는 이름의 옵션이 존재하는지(존재하지 않는 것으로 보이나, 양사 모두 전체 API 레퍼런스를 완독하지 않았으므로 "부재 확인"이 아닌 "미발견"으로 표기).
