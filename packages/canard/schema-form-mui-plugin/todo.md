## Schema Form Plugin 개발을 위한 범용 프롬프트

### 프롬프트 템플릿

```
새로운 UI 라이브러리 "MUI"을 사용하여 Schema Form Plugin을 개발하려고 합니다.

MUI 컴포넌트 목록: https://mui.com/material-ui/react-components/

아래의 체크리스트와 절차에 따라 개발 계획을 수립해주세요:

1. 먼저 MUI에서 제공하는 폼 관련 컴포넌트를 조사하고, 아래 체크리스트의 각 컴포넌트와 매핑 가능한지 확인해주세요.
2. 매핑 가능한 컴포넌트만을 대상으로 구현 계획을 세워주세요. (지원하지 않는 컴포넌트는 Fallback이 있으므로 제외)
3. 구현 우선순위와 예상 일정을 포함한 상세 개발 계획을 작성해주세요.

[컴포넌트 체크리스트와 요구사항은 아래 참조]
```

### 패키지 이름

`@canard/schema-form-mui-plugin`

### 개발 대상 및 컴포넌트 구조

#### 1. **기본 구성요소 (Renderer 기반)**

모든 플러그인은 다음 기본 컴포넌트를 구현해야 합니다:

| 이름          | 역할 설명                                                                |
| ------------- | ------------------------------------------------------------------------ |
| `FormGroup`   | 폼 필드 그룹 Wrapper. `depth` 기준 스타일 적용, `object/array` 구분 지원 |
| `FormLabel`   | `name`, `path`, `required` 기반으로 label 렌더링. htmlFor 연결 포함      |
| `FormInput`   | `Input` 컴포넌트를 그대로 렌더링 (단순 Wrapper)                          |
| `FormError`   | `errorMessage`를 표시하는 컴포넌트                                       |
| `formatError` | `JsonSchemaError`를 ReactNode로 변환하는 함수                            |

```ts
// Props 타입 정의: FormTypeRendererProps
import type { FormTypeRendererProps } from '@canard/schema-form-types';
```

---

#### 2. **FormTypeInput 컴포넌트 구조**

각 입력 컴포넌트는 다음 형태로 정의되어야 합니다:

```ts
const FormTypeInputExample: FormTypeInputDefinition = {
  test: { type: 'string', format: 'password' },
  Component: MyPasswordInputComponent,
};
```

**필수 타입:**

```ts
export interface FormTypeInputProps<Value, Context, WatchValues, Schema, Node> {
  jsonSchema: Schema;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: Node;
  name: Node['name'];
  path: Node['path'];
  errors: Node['errors'];
  watchValues: WatchValues;
  defaultValue: Value | undefined;
  value: Value;
  onChange: SetStateFnWithOptions<Value>;
  ChildNodeComponents: WithKey<ComponentType<ChildFormTypeInputProps>>[];
  style?: CSSProperties;
  context: Context;
  [alt: string]: any;
}
```

**매핑 기준 테스트용 타입:**

```ts
export type FormTypeTestObject = Partial<{
  type: string | string[];
  path: string | string[];
  jsonSchema: JsonSchemaWithVirtual;
  format: string | string[];
  formType: string | string[];
}>;
```

### 컴포넌트 체크리스트 및 요구사항

#### 1. 기본 컴포넌트 (필수) (FormTypeRendererProps 사용)

모든 플러그인은 다음 5개의 기본 컴포넌트를 구현해야 합니다

| 이름          | 역할 설명                                                                |
| ------------- | ------------------------------------------------------------------------ |
| `FormGroup`   | 폼 필드 그룹 Wrapper. `depth` 기준 스타일 적용, `object/array` 구분 지원 |
| `FormLabel`   | `name`, `path`, `required` 기반으로 label 렌더링. htmlFor 연결 포함      |
| `FormInput`   | `Input` 컴포넌트를 그대로 렌더링 (단순 Wrapper)                          |
| `FormError`   | `errorMessage`를 표시하는 컴포넌트                                       |
| `formatError` | `JsonSchemaError`를 ReactNode로 변환하는 함수                            |

```ts
// Props 타입 정의: FormTypeRendererProps
import type { FormTypeRendererProps } from '@canard/schema-form-types';
```

- [ ] **FormGroup**

  - Input: `FormTypeRendererProps` (node, depth, path, name, required, Input, errorMessage)
  - Output: 필드 그룹 래퍼 (fieldset 또는 div)
  - 기능: depth에 따른 들여쓰기, object/array 타입 구분 처리

- [ ] **FormLabel**

  - Input: `name`, `path`, `required` (from FormTypeRendererProps)
  - Output: label 엘리먼트 with 필수 표시
  - 기능: htmlFor 연결, 필수 필드 표시

- [ ] **FormInput**

  - Input: `Input` 컴포넌트 (from FormTypeRendererProps)
  - Output: Input 컴포넌트 렌더링
  - 기능: 단순 래퍼

- [ ] **FormError**

  - Input: `errorMessage` (from FormTypeRendererProps)
  - Output: 에러 메시지 표시
  - 기능: 에러 메시지 렌더링

- [ ] **formatError**
  - Input: `JsonSchemaError` 객체
  - Output: 포맷된 에러 메시지 (ReactNode)
  - 기능: 에러 객체를 UI 친화적 메시지로 변환

#### 2. FormTypeInput 컴포넌트 체크리스트

각 FormTypeInput은 다음 형태로 정의되어야 합니다(타입 구조는 문서 상단의 FormTypeInputDefinition를 참조하세요):

예시)

```ts
const FormTypeInputExample: FormTypeInputDefinition = {
  test: { type: 'string', format: 'password' },
  Component: MyPasswordInputComponent,
};
```

각 FormTypeInput은 아래와 같은 Props를 공통적으로 사용합니다(문서 상단에 정의된 타입과 동일)

```ts
export interface FormTypeInputProps<Value, Context, WatchValues, Schema, Node> {
  jsonSchema: Schema;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: Node;
  name: Node['name'];
  path: Node['path'];
  errors: Node['errors'];
  watchValues: WatchValues;
  defaultValue: Value | undefined;
  value: Value;
  onChange: SetStateFnWithOptions<Value>;
  ChildNodeComponents: WithKey<ComponentType<ChildFormTypeInputProps>>[];
  style?: CSSProperties;
  context: Context;
  [alt: string]: any;
}
```

##### 2.1 기본 타입 입력

- [ ] **FormTypeInputString**

  - Test: `type: 'string'`
  - 특수 Props: `size`, `format` (password 지원)
  - 필요 UI: 기본 텍스트 입력, 비밀번호 입력

- [ ] **FormTypeInputNumber**

  - Test: `type: ['number', 'integer']`
  - 특수 Props: `size`, `formatter`, `parser`, `min`, `max`, `step`
  - 필요 UI: 숫자 입력 (스피너 포함)

- [ ] **FormTypeInputBoolean**

  - Test: `type: 'boolean'`
  - 특수 Props: `indeterminate` 상태 지원
  - 필요 UI: 체크박스

- [ ] **FormTypeInputArray**
  - Test: `type: 'array'`
  - 특수 Props: `ChildNodeComponents`, 추가/제거 버튼
  - 필요 UI: 버튼 (추가/제거)

##### 2.2 선택 컴포넌트

- [ ] **FormTypeInputStringEnum**

  - Test: `type: 'string' && enum.length` 또는 `type: 'array' && items.type: 'string' && items.enum.length`
  - 특수 Props: `size`, `mode` (단일/다중 선택), `enumLabels`
  - 필요 UI: Select/Dropdown (단일/다중 선택 지원)

- [ ] **FormTypeInputRadioGroup**

  - Test: `type: ['string', 'number', 'integer'] && formType: 'radio' && enum.length`
  - 특수 Props: `size`, `radioLabels`
  - 필요 UI: Radio 그룹

- [ ] **FormTypeInputStringCheckbox**
  - Test: `type: 'array' && formType: 'checkbox' && items.enum.length`
  - 특수 Props: `checkboxLabels`
  - 필요 UI: 체크박스 그룹

##### 2.3 특수 입력

- [ ] **FormTypeInputBooleanSwitch**

  - Test: `type: 'boolean' && formType: 'switch'`
  - 특수 Props: `switchSize`, `checkboxLabels` (checked/unchecked)
  - 필요 UI: Switch/Toggle

- [ ] **FormTypeInputStringSwitch**

  - Test: `type: 'string' && formType: 'switch' && enum.length === 2`
  - 특수 Props: `switchSize`, `switchLabels`
  - 필요 UI: Switch/Toggle (문자열 값)

- [ ] **FormTypeInputSlider**

  - Test: `type: ['number', 'integer'] && formType: 'slider'`
  - 특수 Props: `min`, `max`, `step`, `lazy` (onChange vs onChangeComplete)
  - 필요 UI: Slider/Range

- [ ] **FormTypeInputTextarea**

  - Test: `type: 'string' && (format: 'textarea' || formType: 'textarea')`
  - 특수 Props: `size`, `minRows`, `maxRows`
  - 필요 UI: Textarea (자동 크기 조절)

- [ ] **FormTypeInputUri**
  - Test: `type: 'string' && (format: 'uri' || formType: 'uri')`
  - 특수 Props: `protocols` 배열, 프로토콜 선택 드롭다운
  - 필요 UI: Input + Select 조합

##### 2.4 날짜/시간 컴포넌트

- [ ] **FormTypeInputDate**

  - Test: `type: 'string' && format: 'date'`
  - 특수 Props: `size`, `disabledDate` (min/max 날짜)
  - 필요 UI: DatePicker

- [ ] **FormTypeInputTime**

  - Test: `type: 'string' && format: 'time'`
  - 특수 Props: `size`, 시간 포맷
  - 필요 UI: TimePicker

- [ ] **FormTypeInputMonth**

  - Test: `type: 'string' && format: 'month'`
  - 필요 UI: MonthPicker

- [ ] **FormTypeInputDateRange**

  - Test: `type: 'array' && (format: 'date-range' || formType: 'dateRange')`
  - 필요 UI: DateRangePicker

- [ ] **FormTypeInputTimeRange**

  - Test: `type: 'array' && (format: 'time-range' || formType: 'timeRange')`
  - 필요 UI: TimeRangePicker

- [ ] **FormTypeInputMonthRange**
  - Test: `type: 'array' && (format: 'month-range' || formType: 'monthRange')`
  - 필요 UI: MonthRangePicker

### 개발 절차 템플릿

#### Phase 1: UI 라이브러리 조사 및 매핑

1. **컴포넌트 매핑 표 작성**

   ```
   | Schema Form 컴포넌트 | [UI_LIBRARY] 컴포넌트 | 구현 가능 여부 | 비고 |
   |---------------------|---------------------|--------------|------|
   | FormTypeInputString | ? | ? | |
   | ... | ... | ... | |
   ```

2. **구현 가능 컴포넌트 목록 확정**
   - ✅ 직접 매핑 가능
   - ⚠️ 커스터마이징 필요
   - ❌ 구현 불가 (Fallback 사용)

#### Phase 2: 프로젝트 설정

1. 프로젝트 구조 생성
2. 필요 의존성 설치
3. TypeScript 및 빌드 설정

#### Phase 3: 기본 컴포넌트 구현

1. FormInput → FormError → formatError → FormLabel → FormGroup 순서로 구현
2. 기본 스타일링 설정

#### Phase 4: FormTypeInput 컴포넌트 구현

**구현 우선순위 기준:**

- Priority 1: 기본 타입 (String, Number, Boolean)
- Priority 2: 자주 사용되는 선택 컴포넌트 (Select, Radio, Checkbox)
- Priority 3: 특수 입력 컴포넌트
- Priority 4: 날짜/시간 컴포넌트

#### Phase 5: 테스트 및 문서화

1. Storybook 스토리 작성
2. 통합 테스트
3. README 및 API 문서 작성

### 사용 예시

```
새로운 UI 라이브러리 "Material-UI v5"를 사용하여 Schema Form Plugin을 개발하려고 합니다.

[위의 체크리스트와 절차 포함...]
```
