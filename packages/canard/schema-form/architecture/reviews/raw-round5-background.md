# 라운드 5 배경 지식 보고서 (D-1 ~ D-10)

본 문서는 `@canard/schema-form` 재설계 아키텍처의 열 가지 설계 결정(D-1 ~ D-10)에 대해 소유자가 판단을 내리는 데 필요한 객관적 배경 지식을 정리한 기술 보고서입니다. 특정 결정을 권고하지 않으며, (1) JSON Schema 표준 명세(Draft 2020-12 / OpenAPI 3.1)의 규정과 명세의 침묵 영역, (2) 대표적인 스키마 기반 폼 라이브러리들의 실제 동작 방식과 출처 링크, (3) 해당 배경이 우리 라이브러리의 설계 결정에 미치는 객관적 함의만을 제공합니다. 직접 검증하지 못하고 동작을 분석하여 도출한 항목은 `[추론]`으로 표기하였습니다.

---

## D-1: #338 null 계약 (부모 객체가 null이 되었을 때 자식 raw 보존 여부)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12 §4.2.1 (Instance Data Model)**: JSON 인스턴스는 `null`, `boolean`, `object`, `array`, `number`, `string` 중 정확히 하나의 기본 데이터 타입을 가집니다.
- **`null` 값과 속성 부재(Absent Property)의 구분**:
  - 인스턴스 `{ "target": null }`은 `"target"`이라는 프로퍼티가 객체의 프로퍼티 집합에 명확히 존재하며, 그 값이 원시 타입 `null`입니다.
  - 반면 `{}`는 `"target"` 프로퍼티 자체가 부재합니다.
  - **Validation §6.5.3 (`required`)**: `required: ["target"]` 검증은 객체의 프로퍼티 집합에 `"target"`이 존재하는지만 검사하므로, `{ "target": null }`은 `required` 제약을 충족(valid)합니다. 반면 `{}`는 위반(invalid)입니다.
- **Validation §6.1.1 (`type`) 및 OpenAPI 3.1 다중 타입**:
  - `type: ["object", "null"]`(OpenAPI 3.0의 `nullable: true`에 대응)로 선언된 필드에서 `null`은 완벽히 유효한 인스턴스 값입니다.
- **명세의 침묵**:
  - JSON Schema 명세는 인스턴스가 스키마에 부합하는지 정적으로 검증(validation)하는 규칙만을 정의합니다.
  - UI 폼 런타임에서 사용자가 객체를 `null`로 지정(예: nullable 체크박스 해제)했다가 다시 객체로 되돌릴 때, 이전에 입력했던 자식 필드의 값을 내부 메모리에 보존해야 하는지, 아니면 완전히 폐기해야 하는지에 대해 명세는 완전히 침묵합니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | `formData`의 객체 속성이 `null`로 변경되면 하위 트리 렌더러가 언마운트되거나 널 필드로 전환됩니다. 다시 객체로 복귀할 때 이전 자식 데이터를 보존하는 별도 메모리가 없으며, `getDefaultFormState`를 통해 스키마의 `default`나 빈 객체 `{}`로 새로 생성됩니다. | [RJSF Objects Docs](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/objects), [getDefaultFormState.ts](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/utils/src/getDefaultFormState.ts) |
| **JSON Forms (jsonforms.io)** | JSON Forms는 단일 불변 `data` 상태 트리를 유지합니다. 부모 경로의 데이터가 `null`로 설정되면(`updateCore(path, () => null)`), 해당 경로 하위의 자식 프로퍼티들은 상태 트리에서 즉시 소멸합니다. 다시 객체로 전환 시 이전에 입력했던 값을 복원하지 않고 새로 할당된 빈 객체 또는 스키마 기본값만 반영됩니다. | [JSON Forms Data Docs](https://jsonforms.io/docs/default-data/), [core.ts Reducer](https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/reducers/core.ts) |
| **Formily (@formily/core)** | Formily는 MVVM 모델로 각 필드가 `Field` 인스턴스를 유지합니다. 상위 객체에 `null`이 할당되면 하위 필드의 `value`는 `undefined` 또는 `null`로 갱신됩니다. 상위 객체가 다시 `{}`로 변경될 때, 컴포넌트가 언마운트되지 않았다면 필드 인스턴스는 유지되나 이전 사용자 입력 값이 자동으로 복원되지 않고 필드의 `initialValue`나 `undefined` 상태가 됩니다. | [Formily Form Model](https://core.formilyjs.org/api/models/form#setvalues), [Formily Field Model](https://core.formilyjs.org/api/models/field#value) |
| **uniforms** | 단일 모델 객체를 기반으로 동작하며, 상위 객체가 `null`이 되면 모델 경로의 하위 데이터는 제거됩니다. 객체 복귀 시 스키마 브리지의 기본값을 다시 로드할 뿐 이전 세션의 자식 raw를 유지하지 않습니다. | [uniforms Model Guide](https://uniforms.tools/docs/common-usage/) |

### 우리 결정에 주는 함의
- `null`을 "키가 없는 전체 교체(`Overwrite`)"로 취급하여 자식 raw를 비우면, 레코드 A 로드 후 `null`인 레코드 B를 로드할 때 이전 레코드 A의 숨은 데이터가 남아 새 레코드 입력 시 방출 데이터로 누출되는 상태 오염을 근본적으로 차단할 수 있습니다.
- 부모가 `null`인 동안 자식 raw를 보존하려면 폼 코어에 현재 값 외에 '초기값' 또는 '잠복 메모'를 위한 제3의 상태 칸이 필요하며, 자식 컴포넌트가 null 부모 아래에서 비활성화되어 있는 동안의 생명주기 관리 복잡도가 증가합니다.
- 명세상 `null`은 온전한 단일 인스턴스 값이므로, 부모가 `null`일 때 하위 자식 스키마의 `required`나 `default` 주입을 트리거하는 것은 JSON Schema의 인스턴스 계층 모델과 모순을 일으킵니다.

---

## D-2: 조각 활성 계산 (옵션 B: 비단조 + 상한)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12 Applicator 키워드**:
  - **§10.2.2.1 (`if`/`then`/`else`)**: `if` 서브스키마에 대해 인스턴스가 유효하면 `then` 서브스키마를 적용하고, 무효하면 `else` 서브스키마를 적용합니다.
  - **§10.2.1.4 (`not`)**: 지정된 서브스키마에 대해 인스턴스가 유효하지 않을 때만 인스턴스가 유효합니다.
  - **Validation §6.5.4 (`dependentRequired`)**: 인스턴스에 특정 프로퍼티 이름이 존재할 때 다른 프로퍼티들이 필수로 요구됩니다.
  - **§10.2.3.2 (`unevaluatedProperties`)**: 인접 어플리케이터(`if/then/else`, `allOf`, `oneOf` 등)에서 이미 평가된 프로퍼티 집합을 추적하여, 평가되지 않은 나머지 프로퍼티의 유효성을 검사합니다.
- **명세의 침묵**:
  - JSON Schema는 선언적 제약 시스템이며, 조건부 서브스키마가 상태를 변경하거나 다른 조건부를 활성화/비활성화하는 순환 그래프를 평가하는 런타임 알고리즘을 정의하지 않습니다.
  - 특히 부정 가드(`not`)나 상호 의존 스키마에서 고정점(Fixed-point)이 존재하는지 여부, 비단조적(non-monotonic) 조건 평가의 수렴 순서 및 바퀴(loop) 상한에 대해 명세는 일체 침묵합니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | `retrieveSchema` 함수를 통해 현재 `formData`에 맞춰 `if/then/else` 및 `dependencies`를 단일 패스로 병합합니다. 조건 평가가 또 다른 조건 스키마를 트리거하는 복잡한 연쇄 의존성이나 부정 가드의 진동에 대해 다중 바퀴 반복 평가 루프를 돌리지 않으며, 한 번의 계산으로 형상을 결정합니다. | [RJSF Dependencies](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/dependencies/), [retrieveSchema.ts](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/utils/src/schema/retrieveSchema.ts) |
| **JSON Forms (jsonforms.io)** | UI Schema의 `rule` (`condition` 및 `effect`: HIDE/SHOW/ENABLE/DISABLE)을 통해 조건부를 처리합니다. 데이터 변경 시 각 룰의 조건을 1회 평가하며, 룰의 결과가 다른 스키마 조건을 순환적으로 진동시키는 상황에 대한 자체적인 반복 고정점 수렴 루프를 두지 않고 단일 패스 평가로 완료합니다. | [JSON Forms Rules Docs](https://jsonforms.io/docs/uischema/rules/) |
| **Formily (@formily/core, @formily/reactive)** | 반응형 의존성 추적 그래프를 기반으로 `x-reactions`를 실행합니다. 필드 간 연쇄 반응이 발생하면 배치 루프에서 의존성을 전파하며, 상호 순환 참조가 발생할 경우 무한 루프를 방지하기 위해 내부적으로 재귀 호출 깊이/배치 카운터 상한을 두고 상한 초과 시 런타임 에러를 발생시킵니다. | [Formily Reactive Graph](https://reactive.formilyjs.org/), [Formily Field Reactions](https://core.formilyjs.org/api/models/field#reactions) |
| **ngx-formly (Angular Formly)** | `expressions`를 통해 필드의 `hide`, `disabled` 등을 조건부 평가합니다. Angular 변경 감지 주기마다 `checkExpressions`를 실행하며, 순환 의존으로 인해 표현식 평가가 반복될 경우 최대 체크 횟수(예: 100회) 초과 시 경고를 출력하고 루프를 차단합니다. | [Formly Expressions Guide](https://formly.dev/docs/guide/formly-expressions) |

### 우리 결정에 주는 함의
- 옵션 B(비단조 재평가 + 상한)를 적용하면 현실적인 복합 스키마(부정 가드 `not`, 조건부 분기에 따른 활성 키 변경)에서 검증기(Validator)가 수용하는 고정점에 정확히 도달할 수 있습니다.
- 자기 부정 스키마(`if not required x then x default`)와 같이 수학적으로 고정점이 존재하지 않고 진동하는 스키마의 경우, 무한 루프를 방지하기 위한 정적 바퀴 상한과 함께 상태 플래그(`budget-exceeded`)를 통한 명시적 관측성이 필수적입니다.
- 타 폼 라이브러리들 역시 무제한 상호 의존성을 완전 탐색하기보다는 1회성 단일 패스(RJSF/JSON Forms) 또는 안전 상한 카운터 강제 종료(Formily/ngx-formly) 방식을 채택하고 있습니다.

---

## D-3: 금지 조각 (`properties: { x: false }` / `not: { required: ["x"] }`)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12 §4.3.2 (Boolean Schemas)**:
  - 불리언 값 `false`는 서브스키마로 유효하며, "어떤 인스턴스도 유효하지 않다(never valid against any instance)"는 의미를 가집니다.
- **§10.2.1.1 (`properties`)의 `false` 서브스키마**:
  - `properties: { "x": false }`가 선언된 경우, 인스턴스에 프로퍼티 `"x"`가 존재하기만 하면 그 값이 무엇이든(null, undefined, 공백 문자열 포함) 해당 인스턴스는 즉시 유효성 검증에 실패합니다.
- **§10.2.1.4 (`not`)와 §6.5.3 (`required`)**:
  - `not: { "required": ["x"] }`는 인스턴스에 `"x"`가 존재할 경우 `required`가 참이 되므로, `not`에 의해 전체 인스턴스가 무효(invalid)가 됩니다.
- **명세의 침묵**:
  - 명세는 인스턴스가 유효한지 무효한지만을 판단할 뿐입니다.
  - 금지된 키 `"x"`를 폼 UI에서 완전히 가려야(hide) 하는지, 방출 데이터(`emit`)에서 폼 라이브러리가 자동으로 해당 키를 삭제(strip)해야 하는지, 아니면 필드를 렌더링하고 유효성 오류(validation error)를 표시해야 하는지에 대해 명세는 규정하지 않습니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | `properties: { x: false }`나 `not`이 포함되어 있어도 폼이 해당 데이터를 자동으로 제거하지 않습니다. 스키마에 따라 위젯 렌더링을 시도하거나 Ajv 유효성 검사 단계에서 `false schema` 검증 오류를 발생시켜 UI에 에러 목록으로 노출합니다. | [RJSF Validation Docs](https://rjsf-team.github.io/react-jsonschema-form/docs/validation/) |
| **JSON Forms (jsonforms.io)** | 필드의 숨김 처리는 JSON Schema 키워드가 아닌 UI Schema의 룰(`rule: { effect: HIDE }`)로만 결정합니다. 스키마에 `properties: { x: false }`가 존재하더라도 데이터에서 해당 키를 임의로 지우지 않으며, Ajv가 발생시킨 유효성 검증 오류를 해당 컨트롤에 표시합니다. | [JSON Forms Rules](https://jsonforms.io/docs/uischema/rules/), [JSON Forms Validation](https://jsonforms.io/docs/validation/) |
| **Formily (@formily/json-schema)** | `@formily/json-schema`는 JSON Schema의 검증 제약을 필드의 `validator` 규칙으로 컴파일합니다. `properties: { x: false }`는 해당 필드의 입력 검증 실패(에러 메시지 발생)로 이어질 뿐 폼 데이터에서 키를 조용히 삭제하지 않습니다. 필드 숨김은 `x-display: 'none'` 등을 사용합니다. | [Formily Field Display](https://core.formilyjs.org/api/models/field#display), [Formily JSON Schema Spec](https://core.formilyjs.org/api/models/form#setvalidators) |
| **uniforms** | uniforms의 Ajv 기반 브리지는 모델에 금지된 키가 존재할 경우 검증 에러를 모델 상태에 기록할 뿐, 폼 엔진이 자의적으로 모델 프로퍼티를 제거하거나 필드를 렌더 트리에서 배제하지 않습니다. | [uniforms Validation](https://uniforms.tools/docs/validation/) |

### 우리 결정에 주는 함의
- 금지 조각을 폼 코어가 "비활성화(방출 값에서 자동 제외)"로 해석할 경우, 백엔드 스키마가 잘못된 입력을 거부하려던 의도를 폼이 조용히 삭제하여 유효한 문서로 왜곡하는 결과(P2: '폼은 값을 고치지 않는다' 원칙 위반)를 낳습니다.
- 금지 조각을 "검증기에만 맡긴다(`false` 서브스키마는 아무것도 선언하지 않음)"로 처리하면, 폼 엔진이 스키마의 금지 의도를 자의적으로 해석하여 데이터를 변조하지 않고 표준 검증기 에러를 통해 사용자에게 올바르게 전달할 수 있습니다.
- 단, 입력 노드가 없는 extra 키에 대해 검증기 에러가 발생할 경우, 사용자가 이를 인지하고 해결할 수 있도록 폼 수준의 잔여 키 표시 및 삭제 인터페이스가 제공되어야 합니다.

---

## D-4: 쓰기 종류 (공개 옵션 `Overwrite`(기본) vs `Merge`, `Refresh`는 core 판단)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12**:
  - 명세는 오직 데이터 인스턴스가 주어진 제약 조건을 만족하는지 판정하는 정적 규격입니다.
  - 인스턴스 데이터의 런타임 상태 전이, 폼의 부분 패치(`merge`)나 전체 교체(`replace`/`overwrite`), 프로그래밍 방식의 값 수정(`setValue`)의 의미론에 대해서는 일체 다루지 않습니다 (완전한 명세 밖 사안).

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **Formily (@formily/core)** | `form.setValues(values, strategy)` API를 제공하며, 전략 옵션으로 `'merge'`(기본값, 부분 병합)와 `'overwrite'`(전체 교체)를 명시적으로 지원합니다. `overwrite`를 전달하면 기존 폼 데이터 전체를 새 객체로 대체하고 이전 키를 비웁니다. | [Formily setValues Docs](https://core.formilyjs.org/api/models/form#setvalues) |
| **react-jsonschema-form (RJSF)** | 단일 `<Form formData={...} />` 제어 프로퍼티를 통해 외부 데이터를 주입받습니다. `formData` prop이 변경되면 컴포넌트 라이프사이클에서 새 객체를 받아 `getDefaultFormState`를 거쳐 폼 상태를 전체 교체(`overwrite` 성격)합니다. 내부적으로 세분화된 merge/overwrite 플래그를 외부에 노출하지 않습니다. | [RJSF Form Data](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/form-data) |
| **JSON Forms (jsonforms.io)** | 제어 컴포넌트로서 `<JsonForms data={...} />` prop을 통한 전체 데이터 교체와, 내부 리덕스 액션 `Actions.update(path, updater)`를 통한 특정 서브트리 경로의 부분 갱신을 분리하여 지원합니다. | [JSON Forms Core Actions](https://github.com/eclipsesource/jsonforms/blob/master/packages/core/src/actions/index.ts), [JSON Forms Core Service](https://jsonforms.io/docs/renderer/core-service/) |
| **ngx-formly (Angular Formly)** | Angular Reactive Forms의 표준 메서드 체계를 따라 `form.setValue(value)`(모든 컨트롤의 키가 정확히 일치해야 하는 전체 교체)와 `form.patchValue(value)`(일부 프로퍼티만 갱신하는 부분 병합)를 명확히 구분하여 제공합니다. | [Angular Reactive Forms Guide](https://angular.dev/guide/forms/reactive-forms#updating-parts-of-the-data-model) |

### 우리 결정에 주는 함의
- 호출자가 쓰기의 종류(`Overwrite` vs `Merge`)를 명시적으로 선언하도록 규정하면, 폼 엔진이 전달된 객체 구조만 보고 부분 쓰기인지 전체 교체인지 추론하다가 발생하는 부작용(예: 잠복 데이터 삭제 실패 또는 원치 않는 삭제)을 방지할 수 있습니다.
- UI 입력 컴포넌트의 리프레시나 비제어 컴포넌트 동기화를 위한 `Refresh`를 코어가 작업 루프 규칙에 따라 자체 판단하게 하면, 외부 호출자에게 불필요한 내부 구현 복잡도를 숨길 수 있습니다.
- Formily의 `setValues(values, 'merge' | 'overwrite')`나 Angular Formly의 `patchValue`/`setValue`처럼 업계 표준 폼 아키텍처는 전체 교체와 부분 패치를 명확한 인터페이스로 분리하고 있습니다.

---

## D-5: 로드 시 default 주입 스위치 (`disableDefaultInjection` 등)

### 명세가 말하는 것
- **JSON Schema Validation (Draft 2020-12) §7.6.1 (`default`)**:
  - "`default` 키워드는 특정 스키마와 연결된 기본 JSON 값을 제공하는 데 사용된다. 기본값은 연결된 스키마에 대해 유효한 것이 권장된다."
- **JSON Schema Core (Draft 2020-12) §3.3 및 §7.7 (Annotations)**:
  - "`default`와 같이 어노테이션을 생성하는 키워드는 순수하게 정보 제공용(purely informational)이며, 인스턴스의 유효성 검증 여부에 절대 영향을 미쳐서는 안 된다(MUST NOT affect whether an instance validates)."
  - 검증기(Validator)는 인스턴스에 값을 주입하거나 수정하지 않습니다. 어노테이션의 활용은 전적으로 검증기 외부의 애플리케이션에 위임됩니다.
- **명세의 침묵**:
  - 명세는 데이터 로드 시 누락된 키에 `default` 값을 주입해야 하는지, 주입을 끄는 옵션을 제공해야 하는지에 대해 전혀 규정하지 않습니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | 폼 로드 시 및 스키마 평가 시 `getDefaultFormState`를 통해 누락된 키에 스키마 `default`를 기본 주입합니다. 이를 제어하기 위해 실험적 prop인 `experimental_defaultFormStateBehavior` (예: `emptyObjectFields: 'skipDefaults'`, `constAsDefaults: 'never'`)를 제공하여 기본값 주입 동작을 세부 조정할 수 있습니다. | [RJSF Form Props](https://rjsf-team.github.io/react-jsonschema-form/docs/components/form#experimental_defaultformstatebehavior), [RJSF Default Form State Behavior](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/objects#default-form-state-behavior) |
| **JSON Forms (jsonforms.io)** | JSON Forms는 기본적으로 스키마의 `default` 값을 폼 `data`에 자동 주입하지 않습니다. 명세의 어노테이션 원칙을 준수하여 원본 데이터를 보존합니다. 기본값을 주입하려면 사용자가 명시적으로 `createAjv({ useDefaults: true })` 옵션을 설정한 커스텀 Ajv 인스턴스를 주입해야 합니다. | [JSON Forms Default Data](https://jsonforms.io/docs/default-data/), [JSON Forms Ajv Setup](https://jsonforms.io/docs/validation/) |
| **Formily (@formily/json-schema)** | 스키마의 `default`는 각 필드의 `initialValue`로 바인딩됩니다. 폼 인스턴스 생성 시 외부에서 `initialValues`나 `values`를 전달하면 외부 값이 우선하며, 값이 없는 필드에만 스키마의 `default`가 채워집니다. 전역 폼 옵션을 통해 초기값 주입 여부를 통제할 수 있습니다. | [Formily Field InitialValue](https://core.formilyjs.org/api/models/field#initialvalue), [Formily JSON Schema](https://core.formilyjs.org/api/models/form#createform) |
| **uniforms** | uniforms의 `JSONSchemaBridge`는 `getDefault()` 메서드를 제공하지만, 폼 모델이 빈 객체 `{}`로 초기화될 때 스키마 기본값으로 모델을 강제 변조할지 여부는 브리지 옵션 및 컴포넌트의 초기 모델 설정에 따릅니다. | [uniforms JSONSchemaBridge](https://uniforms.tools/docs/api-bridges#jsonschemabridge) |

### 우리 결정에 주는 함의
- 표준 명세상 `default`는 단순 어노테이션이므로, 폼 라이브러리가 기본값을 무조건 데이터에 주입해야 할 표준상의 의무는 없습니다.
- 외부 데이터베이스에서 부분 레코드(sparse record)를 로드할 때 스키마 `default`가 자동으로 주입되면, 사용자가 입력하지 않은 필드가 채워져 폼이 `dirty` 상태로 전환되는 심각한 부작용이 발생하므로 이를 끄는 스위치는 필수적입니다.
- 스위치의 범위를 "호출자의 전체 교체(`defaultValue`, `reset()`, `setValue(Overwrite)`)"로 좁히면, 폼의 초기화 시점과 사용자 런타임 입력 시점의 경계를 명확하게 통제할 수 있습니다.

---

## D-6: `virtual` (참조 그룹 노드 vs 렌더 계층 vs 현행 유지)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12 §10.2.1.1 (`properties`) 및 §4.3.1**:
  - JSON Schema의 객체 유효성 검증은 실제 인스턴스 객체의 프로퍼티 키들을 대상으로 수행됩니다.
  - `virtual`은 JSON Schema 표준 키워드가 아니며, Draft 2020-12에 따르면 알 수 없는 키워드(Unknown keyword)는 유효성 검증에 영향을 미치지 않는 순수 어노테이션으로 취급됩니다.
- **Validation §6.5.3 (`required`)**:
  - `required` 배열에 포함된 모든 문자열은 반드시 인스턴스 객체의 실제 프로퍼티 키로 존재해야 합니다.
  - 만약 스키마 전처리를 통해 가상 필드(예: `period`)를 표준 `required: ["period"]`로 등록하거나, 가상 필드의 이름을 검증기 스키마에 남길 경우, 데이터 인스턴스에 해당 키가 없으므로 표준 검증기(Ajv 등)는 즉시 유효성 실패 판정을 내립니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | 데이터를 소유하지 않는 그룹화/가상 필드는 JSON Schema에 두지 않고 `uiSchema`의 `ui:field` 또는 커스텀 필드로 분리합니다. 스키마에는 실제 데이터 필드(`startDate`, `endDate`)만 정의하고, `uiSchema: { "period": { "ui:field": "PeriodCustomField" } }`로 UI 렌더링을 묶어 데이터 모델과 표준 스키마를 훼손하지 않습니다. | [RJSF Custom Field Components](https://rjsf-team.github.io/react-jsonschema-form/docs/advanced-customization/custom-widgets-fields#custom-field-components) |
| **JSON Forms (jsonforms.io)** | JSON Forms는 완전히 분리된 **UI Schema** 아키텍처를 가집니다. `Group`, `HorizontalLayout`, `VerticalLayout`과 같은 Layout 엘리먼트는 자체적인 데이터 경로(`scope`)를 갖지 않으며(데이터 비소유), 하위 컨트롤들을 그룹화하여 배치하는 역할만 수행합니다. JSON Schema는 순수성을 유지합니다. | [JSON Forms Layouts](https://jsonforms.io/docs/uischema/layouts/), [JSON Forms Group Layout](https://jsonforms.io/docs/uischema/layouts/#group) |
| **Formily (@formily/core, @formily/react)** | Formily는 아키텍처 핵심 모델로 **`VoidField`**(가상 필드)를 제공합니다. `VoidField`는 `value`나 `initialValue`를 갖지 않으며 폼 데이터 모델에 바인딩되지 않습니다. 오직 레이아웃(`FormItem`, `FormLayout`, 스텝퍼 등)이나 장식 UI를 관리하며, 하위의 실제 `Field`들이 독립적으로 데이터를 관리합니다. | [Formily VoidField Model](https://core.formilyjs.org/api/models/void-field), [Formily SchemaField](https://react.formilyjs.org/api/components/schema-field) |
| **uniforms** | uniforms는 데이터를 소유하지 않는 그룹화를 위해 스키마를 오염시키지 않고, 렌더링 템플릿 레벨에서 `AutoField`들을 래핑하는 폼 레이아웃 컴포넌트를 사용합니다. | [uniforms Component Lifecycle](https://uniforms.tools/docs/advanced-lifecycle/) |

### 우리 결정에 주는 함의
- 가상 이름을 표준 `required`에 허용하는 현행 전처리 방식은 표준 검증기와의 판정 동치 원칙(P1)을 명백히 위반하므로 제거되어야 합니다.
- Formily의 `VoidField`나 JSON Forms의 Layout처럼 코어 모델에 "데이터를 소유하지 않는 참조 그룹 노드(a안)"를 두면, 표준 스키마와의 충돌 없이 복합 위젯(기간 선택 등)의 쓰기 분배 및 동기화를 안정적으로 지원할 수 있습니다.
- 참조 그룹 노드를 코어에 두면 렌더러(React 이외의 환경)가 바뀌더라도 가상 필드 그룹화 로직을 일관되게 재사용할 수 있습니다.

---

## D-7: `setValue(getValue())` 멱등성 (사용자가 지운 키의 default 재주입 문제)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12**:
  - JSON Schema는 데이터 검증 명세이며, 인스턴스의 직렬화 및 역직렬화 라이프사이클이나 폼의 왕복 멱등성(Round-trip Idempotency)에 대해 규정하지 않습니다.
- **인스턴스에서의 프로퍼티 부재(Absent)**:
  - JSON 데이터 표현에서 "사용자가 의도적으로 값을 지워서 키가 없는 것"과 "처음부터 스키마 기본값에 의존하여 키를 제공하지 않은 것"은 결과적으로 동일하게 `{}`(키 부재)로 직렬화됩니다.
  - 직렬화된 JSON 문서 자체는 필드 삭제의 역사적 맥락(히스토리)을 담을 수 없습니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | `onChange(formData)`로 방출된 데이터는 이미 스키마의 `default`가 병합된 상태입니다. 만약 소비자가 특정 필드를 삭제하여 새 `formData`를 주입하더라도, `Form` 컴포넌트가 다시 `getDefaultFormState`를 실행하므로 스키마에 `default`가 존재하는 한 해당 키가 다시 주입됩니다. 즉, 기본값이 선언된 필드를 비운 채 유지하는 멱등성은 기본적으로 성립하지 않습니다. | [RJSF Form Data](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/form-data), [getDefaultFormState.ts](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/utils/src/getDefaultFormState.ts) |
| **JSON Forms (jsonforms.io)** | JSON Forms는 기본적으로 `default` 자동 주입을 하지 않으므로(`useDefaults: false`), `onChange({ data })`로 방출된 `data`를 그대로 다시 `data` prop으로 전달했을 때 데이터가 변형되지 않고 완벽한 멱등성이 보장됩니다. 사용자가 삭제한 필드는 빈 상태로 유지됩니다. | [JSON Forms Data Guide](https://jsonforms.io/docs/default-data/) |
| **Formily (@formily/core)** | 필드 값을 삭제하면 내부 상태는 `undefined`가 됩니다. `form.getValues()`로 방출된 데이터를 `form.setValues(values, 'overwrite')`로 다시 주입할 때, 기존 필드 인스턴스가 유지되는 경우 `undefined`가 보존되나, 폼을 새로 생성하거나 스키마 반응형 규칙이 동작할 경우 `initialValue`가 다시 개입할 수 있습니다. | [Formily Form getValues](https://core.formilyjs.org/api/models/form#getvalues), [Formily Form setValues](https://core.formilyjs.org/api/models/form#setvalues) |
| **ngx-formly (Angular Formly)** | Angular Reactive Forms 기반에서는 `form.value`를 그대로 `form.setValue()`에 주입하면 정확히 동일한 상태가 복원(멱등)됩니다. 스키마 기본값은 초기 폼 빌드 시점에만 관여하며, 런타임 값 주입 시에는 추가되지 않습니다. | [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms) |

### 우리 결정에 주는 함의
- `getValue()`가 방출한 JSON 문서에는 "사용자가 방금 지운 키"라는 이력이 없으므로, 이를 다시 전체 교체(`Overwrite`)로 주입했을 때 새 로드로 간주되어 `default`가 재주입되는 것은 상태 모델 관점에서 자연스러운 현상입니다.
- 이를 막기 위해 "직전 커밋에도 없었던 키"를 추적하는 역사적 장부 규칙을 코어에 추가하면, 폼 엔진의 내부 상태 관리가 급격히 복잡해지고 외부에서 주입되는 데이터와의 정합성이 깨지기 쉽습니다.
- 호출자가 `setValue` 호출 단위에서 기본값 주입 억제 옵션을 지정할 수 있도록 하면, 불필요한 장부 복잡도 없이 왕복 멱등성이 요구되는 시나리오를 효과적으로 처리할 수 있습니다.

---

## D-8: 원본 없는 중첩 union의 판별 default (빈 값일 때 분기 선택 여부)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12 §10.2.1.3 (`oneOf`) 및 §10.2.1.2 (`anyOf`)**:
  - `oneOf`는 주어진 인스턴스가 나열된 서브스키마 중 **정확히 하나(exactly one)**에만 유효할 때 검증에 통과합니다.
  - `anyOf`는 나열된 서브스키마 중 **적어도 하나(at least one)**에 유효할 때 검증에 통과합니다.
- **OpenAPI 3.1 §4.8.25 (`Discriminator Object`)**:
  - `discriminator.propertyName`은 다형성 객체를 직렬화/역직렬화하고 검증할 때 어느 서브스키마를 적용할지 식별하기 위한 명시적 힌트입니다.
- **빈 값에 대한 명세의 판정**:
  - 인스턴스가 빈 객체 `{}`이거나 판별 프로퍼티가 누락된 경우, 각 분기가 판별 프로퍼티를 `const` 또는 `required`로 규정하고 있다면 인스턴스는 어떤 분기에도 유효하지 않으므로 **검증 실패(invalid)**입니다.
  - 명세에는 "인스턴스가 비어 있을 때 첫 번째 분기를 기본 분기로 선택한다"는 규칙이 전혀 존재하지 않습니다.
  - UI 렌더러가 빈 인스턴스에 대해 어떤 분기를 렌더링해야 하는지에 대해 명세는 침묵합니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | `oneOf` 처리 시 `getFirstMatchingOption` 유틸리티를 실행합니다. 현재 `formData`와 일치하는 서브스키마를 찾지 못할 경우(데이터가 빈 경우 포함), **폴백으로 인덱스 0(첫 번째 분기)**을 강제 선택하여 해당 분기의 필드들을 렌더링하고 기본값을 채웁니다. | [RJSF oneOf/anyOf Docs](https://rjsf-team.github.io/react-jsonschema-form/docs/usage/oneof-anyof-allof/), [getFirstMatchingOption.ts](https://github.com/rjsf-team/react-jsonschema-form/blob/main/packages/utils/src/schema/getFirstMatchingOption.ts) |
| **JSON Forms (jsonforms.io)** | `MaterialOneOfRenderer` 및 `CombinatorProperties`는 현재 `data`를 각 서브스키마에 대해 Ajv로 검증합니다. 데이터가 비어 있거나 일치하는 분기가 없을 경우, 선택 인덱스가 미선택(`-1`) 상태로 남아 하위 분기 폼을 렌더링하지 않고 분기 선택 드롭다운/탭만 노출합니다. 사용자가 선택하기 전까지 하위 데이터를 임의로 생성하지 않습니다. | [JSON Forms Complex Renderers](https://jsonforms.io/docs/renderer/renderers-overview/), [MaterialOneOfRenderer.tsx](https://github.com/eclipsesource/jsonforms/blob/master/packages/material-renderers/src/complex/MaterialOneOfRenderer.tsx) |
| **Formily (@formily/json-schema)** | Formily는 JSON Schema의 `oneOf`를 자동으로 다형성 UI로 전환하지 않으며, 명시적인 조건부 컴포넌트나 `x-reactions`를 권장합니다. 기본값이 선언되지 않은 다형 필드는 빈 상태로 유지되며 임의의 첫 분기가 선택되지 않습니다. | [Formily Schema Reactions](https://formilyjs.org/), [Formily JSON Schema](https://core.formilyjs.org/api/models/form) |
| **uniforms** | uniforms의 JSONSchemaBridge는 `oneOf`에 대해 기본 분기를 강제 선택하지 않으며, 사용자가 라디오/셀렉트를 통해 명시적으로 분기를 선택할 때까지 하위 필드를 렌더링하지 않습니다. | [uniforms Advanced Schema](https://uniforms.tools/docs/advanced-schemas/) |

### 우리 결정에 주는 함의
- RJSF처럼 빈 데이터에 대해 첫 번째 분기를 임의로 선택하면, 사용자가 입력하지도 않은 중첩 객체와 자식 기본값이 방출 데이터에 멋대로 생성되는 심각한 부작용(P2: '원본은 호출자와 작성자만 쓴다' 위반)이 발생합니다.
- "데이터 없음 + 판별자 기본값 없음 → 분기 없음(`oneOfIndex = -1`)"으로 처리하면, 판별 필드만 화면에 존재하고 하위 분기는 렌더링되지 않아 폼이 자의적으로 데이터를 조작하는 것을 완벽히 방지할 수 있습니다.
- 명세상으로도 빈 값은 어떤 분기에도 유효하지 않으므로, 임의의 분기를 선택하지 않는 것이 검증기 판정과 정확히 동치(P1)를 이룹니다.

---

## D-9: `RequestRemount` (서브트리 강제 리마운트 / 갱신 도구)

### 명세가 말하는 것
- **JSON Schema Draft 2020-12**:
  - JSON Schema는 순수한 데이터 구조 유효성 검증 명세입니다.
  - UI 렌더링 계층의 컴포넌트 마운트/언마운트, DOM 리셋, 서브트리 리마운트와 같은 라이프사이클 제어는 완전히 명세 밖의 사안입니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | 라이브러리 차원의 서브트리 강제 리마운트 API를 제공하지 않습니다. 개발자들은 비제어 입력이나 서드파티 위젯을 강제 초기화해야 할 때 React의 표준 패턴인 컴포넌트 `key` prop을 변경하여 서브트리를 통째로 언마운트 후 다시 마운트시키는 방식을 사용합니다. | [RJSF Custom Widgets](https://rjsf-team.github.io/react-jsonschema-form/docs/advanced-customization/custom-widgets-fields), [React Key Reset Pattern](https://react.dev/learn/preserving-and-resetting-state#resetting-a-form-with-a-key) |
| **JSON Forms (jsonforms.io)** | 코어 서비스나 액션에 리마운트 전용 명령을 두지 않습니다. 상태 동기화는 Redux 기반 상태 흐름으로 처리되며, 특정 렌더러의 완전 재초기화가 필요한 경우 UI 스키마나 래퍼 컴포넌트의 React `key`를 교체하는 외부 리액트 패턴에 의존합니다. | [JSON Forms Custom Renderers](https://jsonforms.io/docs/renderer/custom-renderers/) |
| **Formily (@formily/core)** | `field.reset()` 및 `field.onInit()` 등의 세밀한 필드 라이프사이클 메서드를 제공합니다. 상태 관찰자(`observer`)를 통해 DOM을 파괴하지 않고도 상태를 최신화할 수 있으나, DOM 자체를 완전히 재구축해야 하는 특수 상황에서는 React `key` 교체 방식을 병행합니다. | [Formily Field Model reset](https://core.formilyjs.org/api/models/field#reset) |
| **ngx-formly (Angular Formly)** | 폼 필드의 리마운트 명령 대신, 필드 설정 객체의 `formly-field`가 참조하는 컨트롤을 재초기화하거나 폼 그룹을 재생성하는 방식을 사용합니다. | [Angular Formly Advanced](https://formly.dev/docs/guide/advanced-layout) |

### 우리 결정에 주는 함의
- `RequestRemount`는 코어 내부의 상태 전파 사이클이 자체 소비하는 장치가 아니라, 비제어 컴포넌트나 서드파티 UI 위젯의 내부 DOM 상태 불일치를 해결하기 위한 "사용자 비상 탈출구(Escape hatch)"입니다.
- 타 라이브러리들이 React 표준 `key` prop 변경에만 의존하는 것과 달리, 라이브러리가 명시적인 리마운트 신호를 제공하면 복잡한 계층 구조에서 특정 서브트리만 정밀하게 재초기화할 수 있는 실무적 편의를 제공합니다.
- 단, 이는 탈출구이므로 코어의 작업 루프나 상태 계산(P3)의 필수 단계로 결합되어서는 안 되며 독립된 명령형 인터페이스로 격리되어야 합니다.

---

## D-10: 루트 `onChange` 디바운스 및 이벤트 발화 시점

### 명세가 말하는 것
- **JSON Schema Draft 2020-12**:
  - 검증 시점, 이벤트 루프 스케줄링(매크로태스크/마이크로태스크), `onChange` 콜백의 호출 빈도 및 디바운스 처리는 명세와 전혀 무관한 UI 구현 상세입니다.

### 다른 라이브러리

| 라이브러리 | 동작 | 출처 링크 |
| :--- | :--- | :--- |
| **react-jsonschema-form (RJSF)** | 사용자의 키 입력마다(per keystroke) 동기적으로 `onChange(formData)`를 호출합니다. 라이브러리 내부에서 디바운스를 제공하지 않으며, `liveValidate`가 켜져 있으면 매 키 입력마다 동기 유효성 검증을 실행합니다. 비동기 검증이나 디바운스가 필요한 경우 소비자가 외부에서 lodash debounce 등을 적용해야 합니다. | [RJSF Form Props](https://rjsf-team.github.io/react-jsonschema-form/docs/components/form#onchange), [RJSF Live Validation](https://rjsf-team.github.io/react-jsonschema-form/docs/validation/#live-validation) |
| **JSON Forms (jsonforms.io)** | 코어 스토어 상태가 갱신될 때마다 즉시 `onChange({ data, errors })`를 호출합니다. 입력 이벤트마다 동기적으로 검증을 수행하고 결과를 전달하며, 내부 매크로태스크 타이머를 두지 않습니다. | [JSON Forms React Component](https://jsonforms.io/docs/components/react/) |
| **Formily (@formily/core)** | `form.setValues`나 입력 이벤트에 대해 내부 `batch` 시스템을 적용합니다. 단일 이벤트 루프 내에서 여러 필드가 연속 변경되더라도 배치 경계가 끝나는 시점에 묶어서 `onFormValuesChange`를 1회 발행합니다. 비동기 검증의 경합 문제는 디바운스가 아니라 단조 증가 검증 토큰/스탬프를 통해 최신 요청만 반영하는 방식으로 해결합니다. | [Formily Form Batch](https://core.formilyjs.org/api/models/form#batch), [Formily Validate](https://core.formilyjs.org/api/models/form#validate) |
| **ngx-formly (Angular Formly)** | Angular의 이벤트 루프 및 `valueChanges` Observable 스트림을 그대로 활용합니다. 프레임워크 수준의 변경 감지 주기마다 발화하며, 디바운스가 필요할 경우 RxJS의 `debounceTime` 연산자를 파이프라인에 결합합니다. | [Angular Reactive Forms valueChanges](https://angular.dev/guide/forms/reactive-forms#monitoring-form-state) |

### 우리 결정에 주는 함의
- 매크로태스크(`setTimeout` 등) 기반 디바운스는 React 19의 동시성 렌더링 및 제어 컴포넌트 라이프사이클과 충돌하여, 입력 중간에 캐럿이 끝으로 튀거나 IME(한글 등) 조합 중 글자가 소실·지연되는 치명적인 결함을 유발합니다.
- `onChange`를 "최외곽 동기 진입당 1회(마지막 파동 정착 후 최종 emit)"로 일원화하면, 마이크로/매크로태스크 지연 없이 React의 이벤트 핸들러 복원 시점보다 앞서 상태를 커밋하여 캐럿 소실과 화면 깜빡임을 완벽하게 방지할 수 있습니다.
- 비동기 검증기의 네트워크 경합 문제는 이벤트 발화를 늦추는 디바운스가 아니라, 커밋 번호 스탬프(F28)를 매겨 최신 커밋보다 이전의 비동기 응답을 폐기하는 방식으로 해결하는 것이 정확성과 반응성을 동시에 보장합니다.
