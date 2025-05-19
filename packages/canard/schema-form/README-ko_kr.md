# @canard/schema-form

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Json Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()
[![Json Schema Form](https://img.shields.io/badge/JsonSchemaForm-form-red.svg)]()

---

## 개요

`@canard/schema-form`은 제공된 [JSON Schema](https://json-schema.org/)를 기반으로 양식을 렌더링하는 React 기반 컴포넌트 라이브러리입니다.

JSON Schema를 검증에 활용하며, 이 목적으로 [ajv@8](https://ajv.js.org/)를 사용합니다.

다양한 `FormTypeInput` 컴포넌트를 정의함으로써 복잡한 요구사항을 쉽게 충족시킬 수 있는 유연성을 제공합니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form
```

### 인터페이스

#### FormProps

```ts
interface FormProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 이 SchemaForm에서 사용할 JSON Schema */
  jsonSchema: Schema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value;
  /** 모든 FormTypeInput 구성 요소에 readOnly 속성을 적용합니다 */
  readOnly?: boolean;
  /** 모든 FormTypeInput 구성 요소에 disabled 속성을 적용합니다 */
  disabled?: boolean;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: SetStateFn<Value>;
  /** 이 SchemaForm이 유효성 검사를 통과했을 때 호출되는 함수 */
  onValidate?: Fn<[jsonSchemaError: JsonSchemaError[]]>;
  /** FormTypeInput 정의 목록 */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormTypeInput 경로 매핑 */
  formTypeInputMap?: FormTypeInputMap;
  /** 사용자 정의 형식 렌더러 컴포넌트 */
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** 초기 검증 오류, 기본값은 undefined */
  errors?: JsonSchemaError[];
  /** 사용자 정의 오류 형식 함수 */
  formatError?: FormTypeRendererProps['formatError'];
  /**
   * 오류 표시 조건 (기본: ShowError.DirtyTouched)
   *   - `true`: 항상 표시
   *   - `false`: 절대 표시하지 않음
   *   - `ShowError.Dirty`: 값이 변경되었을 때 표시
   *   - `ShowError.Touched`: 입력 필드가 초점 받았을 때 표시
   *   - `ShowError.DirtyTouched`: Dirty 및 Touched 조건이 모두 충족되었을 때 표시
   */
  showError?: boolean | ShowError;
  /**
   * 유효성 검사 모드 실행 (기본값: ValidationMode.OnChange)
   *  - `ValidationMode.None`: 유효성 검사 비활성화
   *  - `ValidationMode.OnChange`: 값이 변경될 때 유효성 검사
   *  - `ValidationMode.OnRequest`: 요청 시에만 유효성 검사
   */
  validationMode?: ValidationMode;
  /** 외부 Ajv 인스턴스, 제공되지 않으면 내부적으로 생성됨 */
  ajv?: Ajv;
  /** 사용자 정의 컨텍스트 */
  context?: Dictionary;
  /** 자식 컴포넌트 */
  children?:
    | ReactNode
    | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}
```

#### FormHandle

```ts
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  focus: Fn<[dataPath: SchemaNode['path']]>;
  select: Fn<[dataPath: SchemaNode['path']]>;
  reset: Fn;
  getValue: Fn<[], Value>;
  setValue: SetStateFnWithOptions<Value>;
  validate: Fn;
}
```

#### FormChildrenProps

```ts
interface FormChildrenProps<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferSchemaNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: JsonSchemaError[];
}
```

### 기본 사용법

```tsx
import { Form } from '@canard/schema-form';

export const App = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'number',
      },
    },
  };

  const defaultValues = {
    name: 'Woody',
    age: 30,
  };

  const [value, setValue] = useState<{
    name: string;
    age: number;
  }>(defaultValues);

  return (
    <Form
      jsonSchema={jsonSchema}
      defaultValues={defaultValues}
      onChange={setValue}
    />
  );
};
```

---

## FormTypeInput 시스템

`@canard/schema-form`은 강력하고 유연한 FormTypeInput 시스템을 제공합니다. 이 시스템은 사용자가 각 JSON 스키마 노드에 어떤 입력 컴포넌트를 사용할지 정확히 제어할 수 있도록 합니다.

### FormTypeInputDefinition

FormTypeInputDefinition은 특정 조건에 맞는 JSON 스키마 노드에 사용될 입력 컴포넌트를 정의합니다:

```ts
type FormTypeInputDefinition<T = unknown> = {
  test: FormTypeTestFn | FormTypeTestObject;
  Component: ComponentType<InferFormTypeInputProps<T>>;
};
```

각 정의는 두 개의 주요 부분으로 구성됩니다:

- **test**: 이 입력 구성 요소가 적용되어야 하는 JSON Schema 노드의 조건을 정의합니다
- **Component**: 조건이 충족될 때 사용될 React 구성 요소

#### 테스트 함수 또는 테스트 객체

FormTypeInput의 조건은 함수 또는 객체를 사용하여 정의할 수 있습니다:

```ts
type Hint = {
  jsonSchema: JsonSchema;
  type: string;
  format: string;
  formType: string;
  path: string;
  [alt: string]: any;
};
type FormTypeTestFn = Fn<[hint: Hint], boolean>;

type FormTypeTestObject = Partial<{
  type: Array<string>;
  jsonSchema: JsonSchema;
  format: Array<string>;
  formType: Array<string>;
  [alt: string]: any;
}>;
```

- **FormTypeTestFn**: Hint 객체를 받아 boolean을 반환하는 함수입니다. 더 복잡한 조건을 구현하는 데 유용합니다.
- **FormTypeTestObject**: 조건을 단순히 객체로 정의할 수 있습니다. 예를 들어, `{ type: ['string'], format: ['email'] }`는 문자열 유형이고 이메일 형식인 노드를 일치시킵니다.

#### FormTypeInput 속성

선택된 컴포넌트는 다음 props를 받습니다:

```ts
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  /** FormType 컴포넌트의 JSON 스키마 */
  jsonSchema: Schema;
  /** FormType 컴포넌트의 읽기 전용 상태 */
  readOnly: boolean;
  /** FormType 컴포넌트의 비활성화 상태 */
  disabled: boolean;
  /** FormType 컴포넌트에 할당된 스키마 노드 */
  node: Node;
  /** 이 FormType 컴포넌트의 자식 FormType 컴포넌트 */
  ChildNodes: WithKey<ComponentType<ChildFormTypeInputProps>>[];
  /** FormType 컴포넌트에 할당된 스키마 노드의 이름 */
  name: Node['name'];
  /** FormType 컴포넌트에 할당된 스키마 노드의 경로 */
  path: Node['path'];
  /** FormType 컴포넌트에 할당된 스키마 노드의 오류 */
  errors: Node['errors'];
  /** JsonSchema에서 정의된 `computed.watch`(=`&watch`) 속성에 따라 모니터링되는 값 */
  watchValues: WatchValues;
  /** FormType 컴포넌트의 기본값 */
  defaultValue: Value | undefined;
  /** FormType 컴포넌트의 값 */
  value: Value | undefined;
  /** FormType 컴포넌트의 onChange 핸들러 */
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** FormType 컴포넌트의 스타일 */
  style: CSSProperties | undefined;
  /** Form에 전달되는 사용자 정의 컨텍스트 */
  context: Context;
  /** 추가 속성은 자유롭게 정의 가능합니다 */
  [alt: string]: any;
}
```

### FormTypeInputMap

구성 요소를 JSON 스키마의 특정 필드에 직접 매핑할 수 있습니다:

```ts
type FormTypeInputMap = {
  [path: string]: ComponentType<FormTypeInputProps>;
};
```

이것은 JSON 스키마의 특정 경로에 컴포넌트를 명시적으로 할당할 수 있도록 합니다.

### FormTypeInput 선택 프로세스 및 우선순위

폼이 렌더링될 때 각 JSON 스키마 노드의 입력 컴포넌트는 다음과 같은 우선순위에 따라 결정됩니다:

1. **직접 할당된 FormType**: JSON 스키마 객체의 `FormType` 속성을 통해 컴포넌트가 직접 할당된 경우

```js
const jsonSchema = {
  type: 'string',
  FormType: CustomTextInput, // 가장 높은 우선순위
};
```

2. **FormTypeInputMap**: `Form` 구성 요소에 전달된 `formTypeInputMap`에 일치하는 경로가 있을 때

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     formTypeInputMap={{
       'user.email': EmailInput,
       'user.profile.avatar': AvatarUploader,
     }}
   />
   ```

3. **Form의 FormTypeInputDefinitions**: `Form` 컴포넌트에 전달된 `formTypeInputDefinitions` 배열에서 테스트 조건을 충족하는 첫 번째 정의
   <Form
     jsonSchema={jsonSchema}
     formTypeInputDefinitions={[
       { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
       { test: { type: ['string'], format: ['date'] }, Component: DatePicker },
     ]}
   />
   ```

4. **FormProvider의 FormTypeInputDefinitions**: `FormProvider`를 통해 전역으로 제공된 `formTypeInputDefinitions`

5. **플러그인의 FormTypeInputDefinitions**: 등록된 플러그인에서 제공된 `formTypeInputDefinitions`

**중요**: 동일한 조건을 충족하는 여러 FormTypeInput이 존재할 경우, 위의 우선순위 순서대로 첫 번째로 발견된 것이 사용됩니다. 배열로 제공될 경우, 정의는 배열에 나타나는 순서대로 평가됩니다.

이 강력한 메커니즘은 **높은 수준의 커스터마이징**을 가능하게 합니다:

- 기본 입력 컴포넌트를 전역적으로 오버라이드
- 특정 양식에 특화된 커스텀 입력 컴포넌트를 정의
- 필드의 경로에 따라 특정 필드에 컴포넌트를 명시적으로 지정
- JSON 스키마 속성에 구성 요소를 직접 할당하여 가장 구체적인 수준의 제어

### 예시: 다른 우선순위 활용

```tsx
import { Form, FormProvider, registerPlugin } from '@canard/schema-form';
import { AntdPlugin } from '@canard/schema-form-antd-plugin';

// 플러그인 등록 (최저 우선순위)
registerPlugin(AntdPlugin);

export const CustomizedForm = () => {
  // 글로벌 FormTypeInput 정의 (중간 우선순위)
  const globalDefinitions = [
    {
      test: { type: ['string'] },
      Component: GlobalTextInput,
    },
  ];

  // 양식별 FormTypeInput 정의 (더 높은 우선순위)
  const formDefinitions = [
    {
      test: { type: ['string'], format: ['email'] },
      Component: EmailInput,
    },
  ];

  // 경로 기반 매핑 (더 높은 우선순위)
  const formInputMap = {
    'user.address.postalCode': PostalCodeInput,
  };

  // JSON 스키마 내 직접 컴포넌트 할당 (가장 높은 우선순위)
  const jsonSchema = {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        properties: {
          name: { type: 'string' }, // GlobalTextInput 사용
          email: { type: 'string', format: 'email' }, // EmailInput 사용
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' }, // GlobalTextInput 사용
              postalCode: { type: 'string' }, // PostalCodeInput 사용 (경로 매핑)
              country: {
                type: 'string',
                FormType: CountrySelector, // 직접 할당된 컴포넌트 사용 (최우선순위)
              },
            },
          },
        },
      },
    },
  };

  return (
    <FormProvider formTypeInputDefinitions={globalDefinitions}>
      <Form
        jsonSchema={jsonSchema}
        formTypeInputDefinitions={formDefinitions}
        formTypeInputMap={formInputMap}
      />
    </FormProvider>
  );
};
```

이 강력한 시스템은 개발자가 양식의 모든 측면에 대해 세밀한 제어를 유지하면서 코드 중복을 최소화할 수 있도록 합니다.

---

## 고급 사용법

### 사용자 정의 양식 레이아웃

`@canard/schema-form`은 `Form.Render` 컴포넌트를 사용하여 사용자 정의 레이아웃을 지원합니다:

```tsx
import { Form } from '@canard/schema-form';

export const CustomLayoutForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      personalInfo: {
        type: 'object',
        properties: {
          name: { type: 'string', title: '이름' },
          age: { type: 'number', title: '나이' },
        },
      },
      contactInfo: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email', title: '이메일' },
          phone: { type: 'string', title: '전화번호' },
        },
      },
    },
  };

  return (
    <Form jsonSchema={jsonSchema}>
      <div className=“custom-form-layout”>
        <div className=“section”>
          <h3>개인 정보</h3>
          <Form.Render path=“.personalInfo.name”>
            {({ Input, path, node }) => (
              <div className=“form-field”>
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path=“.personalInfo.age”>
            {({ Input, path, node }) => (
              <div className=“form-field”>
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>
        </div>

        <div className=“section”>
          <h3>연락처 정보</h3>
          <Form.Render path=“.contactInfo.email”>
            {({ Input, path, node }) => (
              <div className=“form-field”>
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path=“.contactInfo.phone”>
            {({ Input, path, node }) => (
              <div className=“form-field”>
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>
        </div>
      </div>
    </Form>
  );
};
```

### 배열 처리

이 라이브러리는 배열 데이터 처리를 위한 강력한 기능을 제공합니다:

```tsx
import { Form } from '@canard/schema-form';
import { isArrayNode } from '@canard/schema-form';

export const ArrayForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      users: {
        type: 'array',
        title: '사용자 목록',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', title: '이름' },
            email: { type: 'string', format: 'email', title: '이메일' },
          },
        },
      },
    },
  };

  return (
    <Form jsonSchema={jsonSchema}>
      {({ node }) => (
        <div className=“array-form”>
          <h3>사용자</h3>

          {node && isArrayNode(node.find('users')) && (
            <button onClick={() => node.find('users').push()} type=“button”>
              사용자 추가
            </button>
          )}

          <Form.Render path=“.users”>{({ Input }) => <Input />}</Form.Render>
        </div>
      )}
    </Form>
  );
};
```

### 명령형 핸들을 사용한 양식

`FormHandle`을 사용하여 양식을 프로그래밍 방식으로 제어하는 방법:

```tsx
import React, { useRef } from 'react';

import { Form, FormHandle, ValidationMode } from '@canard/schema-form';

export const ImperativeForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        title: '사용자 이름',
      },
      password: {
        type: 'string',
        format: '비밀번호',
        minLength: 8,
        title: '비밀번호',
      },
    },
    required: ['username', 'password'],
  };

  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  const handleSubmit = () => {
    formRef.current?.validate();
    const values = formRef.current?.getValue();

    // 유효한 양식 값 처리
    console.log('폼 값:', values);
  };

  const handleReset = () => {
    formRef.current?.reset();
  };

  return (
    <div className=“login-form”>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        validationMode={ValidationMode.OnRequest}
      />

      <div className=“form-actions”>
        <button onClick={handleSubmit} type=“button”>
          제출
        </button>
        <button onClick={handleReset} type=“button”>
          초기화
        </button>
      </div>
    </div>
  );
};
```

### 사용자 정의 양식 유형 입력 구성 요소

폼 기능을 확장하려면 사용자 정의 입력 컴포넌트를 생성할 수 있습니다:

```tsx
import React from 'react';

import { Form, FormTypeInputDefinition } from '@canard/schema-form';

// 사용자 정의 날짜 선택기 컴포넌트
const DatePickerInput = (props) => {
  const { value, onChange, disabled, readOnly } = props;

  return (
    <div className=“custom-date-picker”>
      <input
        type="date”
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
      />
    </div>
  );
};

// FormTypeInput 정의
const datePickerDefinition: FormTypeInputDefinition = {
  test: { format: ['date'] },
  Component: DatePickerInput,
};

export const FormWithCustomInput = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      birthDate: {
        type: 'string',
        format: 'date',
        title: '생년월일',
      },
    },
  };

  return (
    <Form
      jsonSchema={jsonSchema}
      formTypeInputDefinitions={[datePickerDefinition]}
    />
  );
};
```

### 조건부 필드와 Watch

`watch` 속성을 사용하여 동적 양식 논리 생성:

```tsx
import React from 'react';

import { Form } from '@canard/schema-form';

export const ConditionalForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      employmentType: {
        type: 'string',
        enum: ['fulltime', 'parttime', 'contractor'],
        title: '고용 유형',
      },
      salary: {
        type: 'number',
        title: '연봉',
        computed: {
          watch: 'employmentType',
          visible: “employmentType === ‘fulltime’”,
        },
      },
      hourlyRate: {
        type: 'number',
        title: '시간당 급여',
        computed: {
          watch: 'employmentType',
          visible:
            “employmentType === ‘parttime’ || employmentType === ‘contractor’”,
        },
      },
    },
  };

  return <Form jsonSchema={jsonSchema} />;
};
```

### TypeScript를 사용한 Form 사용

TypeScript를 활용한 유형 안전형 양식 개발:

```tsx
import React, { useState } from 'react';

import { Form, InferValueType } from '@canard/schema-form';

export const TypeSafeForm = () => {
  // 유형 추론을 위해 const 선언을 포함한 스키마 정의
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      email: { type: 'string', format: 'email' },
      age: { type: 'number' },
      isActive: { type: 'boolean' },
    },
    required: ['name', 'email'],
  } as const;

  // 스키마에서 값 유형 추론
  type FormValues = InferValueType<typeof jsonSchema>;

  const [values, setValues] = useState<FormValues>({
    name: '',
    email: '',
  });

  return (
    <Form jsonSchema={jsonSchema} defaultValue={values} onChange={setValues} />
  );
};
```

### UI 라이브러리와의 통합

`@canard/schema-form`은 플러그인을 통해 인기 있는 UI 라이브러리와 쉽게 통합할 수 있습니다:

```tsx
import React from 'react';

import { Form, registerPlugin } from '@canard/schema-form';
import { AntdPlugin } from '@canard/schema-form-antd-plugin';

// Ant Design 플러그인 등록
registerPlugin(AntdPlugin);

export const AntdForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        title: '이름',
        computed: {
          // Ant Design 특정 옵션
          size: 'large',
          placeholder: '이름을 입력하세요',
        },
      },
      tags: {
        type: 'array',
        title: '태그',
        items: {
          type: 'string',
        },
        // Ant Design Select 컴포넌트 사용
        FormType: 'antd.select',
        computed: {
          mode: 'tags',
          placeholder: '태그를 입력하세요',
        },
      },
    },
  };

  return <Form jsonSchema={jsonSchema} />;
};
```

## 성능 최적화

이 라이브러리는 다음과 같은 기능으로 성능 최적화가 이루어졌습니다:

- 복잡한 양식용 지연 렌더링
- 불필요한 재렌더링을 방지하기 위한 컴포넌트 메모화
- ajv를 사용한 효율적인 검증
- 유효성 검사 시점을 최적화하기 위한 구성 가능한 유효성 검사 모드

### 최적화 팁

1. **유효성 검사 모드 설정**:
   `validationMode` 속성을 구성하여 불필요한 유효성 검사를 방지합니다.

```jsx
// 사용자가 제출 버튼을 클릭할 때만 유효성 검사
<Form jsonSchema={jsonSchema} validationMode={ValidationMode.OnRequest} />
```

2. **FormTypeInput 캐싱**:
   자주 사용하는 커스텀 FormTypeInput을 컴포넌트 외부에서 정의하여 불필요한 재생성을 방지합니다.

```jsx
// 전역에서 한 번 정의
const CUSTOM_INPUTS = [
  { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
];

// 컴포넌트 내에서 재사용
<Form jsonSchema={jsonSchema} formTypeInputDefinitions={CUSTOM_INPUTS} />;
```

## TypeScript 지원

`@canard/schema-form`은 TypeScript로 구축되었으며 포괄적인 유형 정의를 제공합니다. 주요 유형 유틸리티에는 다음과 같습니다:

- `InferValueType<Schema>`: JSON Schema에서 값 유형을 추론합니다
- `InferSchemaNode<Schema>`: JSON Schema에서 스키마 노드 유형을 추론합니다
- `FormHandle<Schema>`: 스키마 특정 메서드를 가진 양식 참조 핸들러의 유형

## 브라우저 지원

`@canard/schema-form`은 모든 현대 브라우저(Chrome, Firefox, Safari, Edge)를 지원하지만 IE11은 지원하지 않습니다.

---

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.
