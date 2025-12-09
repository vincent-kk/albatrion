# @canard/schema-form

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![Json Schema](https://img.shields.io/badge/JsonSchema-{}-blue.svg)]()
[![Json Schema Form](https://img.shields.io/badge/JsonSchemaForm-form-red.svg)]()

---

## 개요

`@canard/schema-form`은 제공된 [JSON Schema](https://json-schema.org/)를 기반으로 양식을 렌더링하는 React 기반 컴포넌트 라이브러리입니다.

JSON Schema 검증은 플러그인 시스템을 통해 지원되며, 다양한 validator plugin을 통해 사용할 수 있습니다.

다양한 `FormTypeInput` 컴포넌트를 정의함으로써 복잡한 요구사항을 쉽게 충족시킬 수 있는 유연성을 제공합니다.

---

## 사용 방법

```bash
yarn add @canard/schema-form
# Validator plugin도 함께 설치
yarn add @canard/schema-form-ajv8-plugin
# 또는 AJV 7.x를 사용하는 경우
yarn add @canard/schema-form-ajv7-plugin
# 또는 AJV 6.x를 사용하는 경우
yarn add @canard/schema-form-ajv6-plugin
```

---

## 호환성 안내

`@canard/schema-form`은 ECMAScript 2022 (ES2022) 문법으로 작성되었습니다.

ES2022보다 낮은 버전의 JavaScript 환경에서 사용하시는 경우, 별도의 트랜스파일 과정이 필요합니다.

**지원 환경:**

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

**레거시 환경 지원이 필요한 경우:**
Babel 등의 트랜스파일러를 사용하여 타겟 환경에 맞게 변환해주세요.

**대상 패키지**

- `@canard/schema-form`
- `@winglet/common-utils`
- `@winglet/json-schema`
- `@winglet/react-utils`

---

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
  /** 폼이 제출될 때 호출되는 함수 (검증 통과 후 실행) */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
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
  /** 커스텀 Validator Factory 함수 */
  validatorFactory?: ValidatorFactory;
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
  /** 폼 전역 오류를 반환합니다 */
  getErrors: Fn<[], JsonSchemaError[]>;
  /** onFileAttach로 첨부된 파일 맵을 반환합니다 */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```

#### AttachedFilesMap

```ts
// JSONPointer 경로(예: "/attachment" 또는 "/items/0/file")를 키로, File[]를 값으로 보관합니다.
type AttachedFilesMap = Map<string, File[]>;
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
import { Form, registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// Validator plugin 등록 (앱 시작 시 한 번만)
registerPlugin(ajvValidatorPlugin);

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

## Validator 시스템

`@canard/schema-form`은 플러그인 기반의 검증 시스템을 제공합니다. JSON Schema 검증을 위해 다양한 validator plugin을 사용할 수 있습니다.

### ValidatorFactory

ValidatorFactory는 JSON Schema를 받아 검증 함수를 반환하는 함수입니다:

```ts
interface ValidatorFactory {
  (schema: JsonSchema): ValidateFunction<any>;
}

type ValidateFunction<Value = unknown> = Fn<
  [data: Value],
  Promise<JsonSchemaError[] | null> | JsonSchemaError[] | null
>;
```

### Validator Plugin 사용법

#### 1. 기본적인 플러그인 등록

```tsx
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 앱 시작 시 플러그인 등록
registerPlugin(ajvValidatorPlugin);
```

#### 2. 커스텀 ValidatorFactory 사용

특정 Form에서만 다른 검증 로직을 사용하고 싶은 경우:

```tsx
import { Form } from '@canard/schema-form';
// createValidatorFactory 가 ajv8.x 기반인 경우, ajv 역시 8.x 버전을 사용해야 합니다.
// 만약 ajv7.x를 사용하고 싶다면, @canard/schema-form-ajv7-plugin을 사용하세요.
// 또는 ajv6.x인 경우 @canard/schema-form-ajv6-plugin을 사용하세요.
import { createValidatorFactory } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

export const CustomValidationForm = () => {
  const validatorFactory = useMemo(() => {
    // 커스텀 AJV 인스턴스 생성
    const customAjv = new Ajv({
      allErrors: true,
      strictSchema: false,
      validateFormats: false,
    });

    // 커스텀 키워드 추가
    customAjv.addKeyword({
      keyword: 'isEven',
      type: 'number',
      validate: (schema: boolean, data: number) => {
        if (schema === false) return true;
        return data % 2 === 0;
      },
      errors: false,
    });
    // ValidatorFactory 생성
    return createValidatorFactory(customAjv);
  }, []);

  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 10 },
      evenNumber: { type: 'number', isEven: true, maximum: 100 },
    },
  };

  return <Form jsonSchema={jsonSchema} validatorFactory={validatorFactory} />;
};
```

#### 3. FormProvider를 통한 전역 ValidatorFactory 설정

여러 Form에서 동일한 검증 로직을 사용하는 경우:

```tsx
import { FormProvider } from '@canard/schema-form';
// createValidatorFactory 가 ajv8.x 기반인 경우, ajv 역시 8.x 버전을 사용해야 합니다.
// 만약 ajv7.x를 사용하고 싶다면, @canard/schema-form-ajv7-plugin을 사용하세요.
// 또는 ajv6.x인 경우 @canard/schema-form-ajv6-plugin을 사용하세요.
import { createValidatorFactory } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

export const App = () => {
  const validatorFactory = useMemo(() => {
    const customAjv = new Ajv({
      allErrors: true,
      strictSchema: false,
    });
    return createValidatorFactory(customAjv);
  }, []);
  return (
    <FormProvider validatorFactory={validatorFactory}>
      <MyForms />
    </FormProvider>
  );
};
```

### 오류 메시지 형식 지정

📌 `@canard/schema-form`은 유효성 검증 메시지를 커스텀 할 수 있는 기능을 제공합니다.

📌 이 기능은 유효성 검증 기능을 포함하지 않습니다. 유효성 검증 기능을 사용하려면 다음 플러그인 중 하나를 사용하거나, 직접 구현한 유효성 검증기를 적용해야 합니다.

- [@canard/schema-form-ajv6-plugin](../schema-form-ajv6-plugin/README-ko_kr.md)
- [@canard/schema-form-ajv7-plugin](../schema-form-ajv7-plugin/README-ko_kr.md)
- [@canard/schema-form-ajv8-plugin](../schema-form-ajv8-plugin/README-ko_kr.md)

📌 만약 추가적인 메시지 형식이 필요하다면, `formatError` 함수를 직접 작성하여 적용할 수 있습니다.

📌 유효성 검증 메시지는 다음 규칙을 따르도록 정의해야 합니다:

- 유효성 검증 메시지는 jsonSchema의 `errorMessages` 속성에 정의해야 합니다.
- 유효성 검증 메시지는 `{[keyword]:errorMessage}` 형태로 정의해야 합니다.
- `default` 키를 정의하면 keyword가 매칭되지 않는 경우 기본값으로 사용됩니다.
- 각각의 에러 메시지(errorMessage)는 다음과 같은 표현을 통해 동적으로 값을 치환할 수 있습니다
  - `{key}`: key는 `error.details`의 키에 해당하는 값으로 치환됩니다.
  - `{value}`: value는 현재 해당 input에 입력된 값으로 치환됩니다

#### 기본 사용법

```ts
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      errorMessages: {
        minLength:
          '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
        maxLength: '이름은 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
        required: '이름은 필수 입력 항목입니다.',
      },
    },
  },
  required: ['name'],
};

// AJV8 error example
const error = {
  dataPath: '/name',
  keyword: 'minLength',
  message: 'must NOT have fewer than 3 characters',
  details: {
    limit: 3,
  },
};

// 현재 값
const value = 'AB';

// 치환 결과
// "이름은 최소 3 글자 이상이어야 합니다. 현재 값: AB"
```

#### 다국어 지원

```ts
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      errorMessages: {
        minLength: {
          ko_KR: '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
          en_US:
            'Name must be at least {limit} characters long. Current value: {value}',
        },
        maxLength: {
          ko_KR: '이름은 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
          en_US:
            'Name must be at most {limit} characters long. Current value: {value}',
        },
        required: {
          ko_KR: '이름은 필수 입력 항목입니다.',
          en_US: 'Name is a required field.',
        },
      },
    },
  },
  required: ['name'],
};

// AJV8 error example
const error = {
  dataPath: '/name',
  keyword: 'minLength',
  message: 'must NOT have fewer than 3 characters',
  details: {
    limit: 3,
  },
};

// Form context
const context = {
  locale: 'ko_KR',
};

// 현재 값
const value = 'AB';

// 치환 결과
// "이름은 최소 3 글자 이상이어야 합니다. 현재 값: AB"
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
  /** FormTypeInput 컴포넌트의 JSON 스키마 */
  jsonSchema: Schema;
  /** FormTypeInput 컴포넌트의 읽기 전용 상태 */
  readOnly: boolean;
  /** FormTypeInput 컴포넌트의 비활성화 상태 */
  disabled: boolean;
  /** FormTypeInput 컴포넌트에 할당된 스키마 노드가 필수인지 여부 */
  required: boolean;
  /** FormTypeInput 컴포넌트에 할당된 스키마 노드 */
  node: Node;
  /** 이 필드의 JSON Schema 타입 (예: 'string', 'number', 'object', 'array') */
  type: Node['schemaType'];
  /** FormTypeInput 컴포넌트에 할당된 스키마 노드의 이름 */
  name: Node['name'];
  /** FormTypeInput 컴포넌트에 할당된 스키마 노드의 경로 */
  path: Node['path'];
  /** 이 필드가 null 값을 허용하는지 여부 (스키마 타입 배열에 'null'이 포함된 경우에서 파생) */
  nullable: Node['nullable'];
  /** FormTypeInput 컴포넌트에 할당된 스키마 노드의 오류 */
  errors: Node['errors'];
  /** JsonSchema에서 정의된 `computed.watch`(=`&watch`) 속성에 따라 모니터링되는 값 */
  watchValues: WatchValues;
  /** FormTypeInput 컴포넌트의 기본값 */
  defaultValue: Value | undefined;
  /** FormTypeInput 컴포넌트의 값 */
  value: Value | undefined;
  /** FormTypeInput 컴포넌트의 onChange 핸들러 */
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** 파일(들)을 폼의 파일 저장소에 첨부/해제합니다 */
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  /** 이 FormTypeInput 컴포넌트의 자식 FormTypeInput 컴포넌트 */
  ChildNodeComponents: ChildNodeComponent[];
  /** FormTypeInput 컴포넌트의 스타일 */
  style: CSSProperties | undefined;
  /** Form에 전달되는 사용자 정의 컨텍스트 */
  context: Context;
  /** 추가 속성은 자유롭게 정의 가능합니다 */
  [alt: string]: any;
}
```

### 파일 관리 시스템 (onFileAttach)

`@canard/schema-form`은 파일 자체는 별도의 저장소에 보관하고, 스키마 값에는 메타데이터(파일명, 크기 등)만 저장하는 방식을 지원합니다. 이를 위해 `FormTypeInput`에서 `onFileAttach`를 호출하여 파일을 첨부하고, 제출 시 `FormHandle.getAttachedFilesMap()`으로 실제 파일을 추출해 API로 전송합니다.

- **저장 위치**: `getAttachedFilesMap()`은 `Map<string, File[]>`을 반환합니다. 키는 해당 입력의 표준 JSONPointer 경로(`node.path`)입니다. 이때 키는 RFC 6901의 표준 JSONPointer만 사용하며, 확장 문법(`..`, `.`, `*`)은 사용하지 않습니다.
- **자동 정리(cleanup)**:
  - 폼이 재구성되거나(unmount 포함) 입력 노드가 제거되면 해당 경로의 파일은 자동으로 제거됩니다.
  - 조건부 스키마(`if/then/else`, `oneOf`)로 필드가 사라질 때도 파일이 정리됩니다.

#### 단일/다중 파일 FormTypeInput 예시

```tsx
const FileFormTypeInput = ({
  onFileAttach,
  onChange,
  readOnly,
  disabled,
  value,
  jsonSchema,
}: FormTypeInputProps<any>) => {
  const multiple: boolean = jsonSchema?.FormTypeInputProps?.multiple ?? false;
  const accept: string | undefined = jsonSchema?.FormTypeInputProps?.accept;

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const fileList = Array.from(e.target.files || []);
    if (fileList.length === 0) {
      onFileAttach(undefined);
      onChange(undefined);
      return;
    }
    if (multiple) {
      onFileAttach(fileList);
      onChange(
        fileList.map((f) => ({
          name: f.name,
          size: f.size,
          type: f.type,
          lastModified: f.lastModified,
        })),
      );
    } else {
      const file = fileList[0];
      onFileAttach(file);
      onChange({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
      });
    }
  };

  return (
    <div>
      <input
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={readOnly || disabled}
        onChange={handleChange}
      />
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};
```

#### API로 파일 업로드하기 (FormData)

```tsx
import React, { useRef } from 'react';

import { Form, type FormHandle, ValidationMode } from '@canard/schema-form';

const schema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    attachment: {
      type: 'object',
      FormTypeInput: FileFormTypeInput,
      FormTypeInputProps: { multiple: false, accept: '*/*' },
      properties: {
        name: { type: 'string' },
        size: { type: 'number' },
        type: { type: 'string' },
        lastModified: { type: 'number' },
      },
    },
  },
} as const;

export const UploadForm = () => {
  const ref = useRef<FormHandle<typeof schema>>(null);

  const handleSubmit = async () => {
    const form = ref.current;
    if (!form) return;

    // 1) 스키마 값(JSON)과 2) 첨부 파일들을 함께 보냅니다.
    const values = form.getValue();
    const files = form.getAttachedFilesMap(); // AttachedFilesMap

    const body = new FormData();
    body.append(
      'json',
      new Blob([JSON.stringify(values)], { type: 'application/json' }),
    );

    for (const [path, fileList] of files.entries()) {
      if (fileList.length === 1) {
        // 단일 파일: 경로를 직접 사용
        body.append(path, fileList[0]);
      } else {
        // 다중 파일: JSONPointer 표준에 따라 "/0", "/1" 처럼 사용합니다 (대괄호 [] 사용 안 함)
        fileList.forEach((file, idx) => body.append(`${path}/${idx}`, file));
      }
    }

    await fetch('/api/upload', { method: 'POST', body });
  };

  return (
    <Form
      ref={ref}
      jsonSchema={schema}
      validationMode={ValidationMode.OnRequest}
      onSubmit={handleSubmit}
    />
  );
};
```

권장 사항:

- 배열 파일의 FormData 키는 표준 JSONPointer 방식(예: "/0", "/1")을 사용하시고, 대괄호 `[]` 표기는 사용하지 마십시오.
- 대용량 파일은 업로드 진행 상태/취소, 청크 업로드 등 추가 전략을 적용하십시오.

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

1. **직접 할당된 FormTypeInput**: JSON 스키마 객체의 `FormTypeInput` 속성을 통해 컴포넌트가 직접 할당된 경우

```js
const jsonSchema = {
  type: 'string',
  FormTypeInput: CustomTextInput, // 가장 높은 우선순위
};
```

2. **FormTypeInputMap**: `Form` 구성 요소에 전달된 `formTypeInputMap`에 일치하는 경로가 있을 때

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     formTypeInputMap={{
       '/user/email': EmailInput,
       '/user/profile/avatar': AvatarUploader,
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
    '/user/address/postalCode': PostalCodeInput,
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
                FormTypeInput: CountrySelector, // 직접 할당된 컴포넌트 사용 (최우선순위)
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

## Plugin System

`@canard/schema-form`은 개발자가 라이브러리를 확장하고 사용자 정의 기능을 추가할 수 있는 플러그인 시스템을 제공합니다.

### Plugin Registration

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as AjvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as AntdPlugin } from '@canard/schema-form-antd-plugin';

registerPlugin(AntdPlugin);
registerPlugin(AjvValidatorPlugin);
```

### 사용 가능한 플러그인

#### UI Plugins

- [**@canard/schema-form-antd-plugin**](../schema-form-antd-plugin/README-ko_kr.md): Ant Design 기반 기초 컴포넌트 제공
- [**@canard/schema-form-antd-mobile-plugin**](../schema-form-antd-mobile-plugin/README-ko_kr.md): Ant Design Mobile 기반 기초 컴포넌트 제공
- [**@canard/schema-form-mui-plugin**](../schema-form-mui-plugin/README-ko_kr.md): MUI 기반 기초 컴포넌트 제공

#### Validator Plugins

- [**@canard/schema-form-ajv8-plugin**](../schema-form-ajv8-plugin/README-ko_kr.md): AJV 8.x 기반 (최신 JSON Schema 지원)
- [**@canard/schema-form-ajv7-plugin**](../schema-form-ajv7-plugin/README-ko_kr.md): AJV 7.x 기반 (레거시 환경 지원)
- [**@canard/schema-form-ajv6-plugin**](../schema-form-ajv6-plugin/README-ko_kr.md): AJV 6.x 기반 (레거시 환경 지원)

## 커스텀 플러그인 시스템

`@canard/schema-form`은 개발자가 사용자 정의 플러그인을 작성하고 등록할 수 있는 플러그인 시스템을 제공합니다.

### 플러그인 타입 구조

```ts
export interface SchemaFormPlugin {
  /** Form.Group 컴포넌트 */
  FormGroup?: ComponentType<FormTypeRendererProps>;
  /** Form.Label 컴포넌트 */
  FormLabel?: ComponentType<FormTypeRendererProps>;
  /** Form.Input 컴포넌트 */
  FormInput?: ComponentType<FormTypeRendererProps>;
  /** Form.Error 컴포넌트 */
  FormError?: ComponentType<FormTypeRendererProps>;
  /** 사용자 정의 입력 타입 정의 */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** 사용자 정의 유효성 검사기 플러그인 */
  validator?: ValidatorPlugin;
  /** 에러 메시지 포매팅 함수 */
  formatError?: FormatError;
}

export interface ValidatorPlugin {
  /** 외부 Validator 인스턴스 주입 */
  bind: Fn<[instance: any]>;
  /** 스키마 기반 Validator 생성 함수 */
  compile: ValidatorFactory;
}

export interface ValidatorFactory {
  (schema: JsonSchema): ValidateFunction<any>;
}
```

### 플러그인 등록 규칙

동일한 속성에 대해 여러 개의 플러그인이 등록된 경우, 다음과 같은 우선순위 규칙이 적용됩니다.

| 속성                                               | 허용 개수         | 우선순위 규칙                                     |
| -------------------------------------------------- | ----------------- | ------------------------------------------------- |
| `FormGroup`, `FormLabel`, `FormInput`, `FormError` | 하나만 허용       | 마지막에 등록한 컴포넌트가 적용됩니다.            |
| `formTypeInputDefinitions`                         | 여러 개 병합 가능 | 병합되며, 마지막에 등록한 항목이 우선 적용됩니다. |
| `validator`, `formatError`                         | 하나만 허용       | 마지막에 등록한 항목이 적용됩니다.                |

이 구조는 다양한 플러그인을 조합해 사용하는 경우에도 일관된 우선순위와 확장성을 제공합니다.

---

## JSONPointer 경로 시스템

`@canard/schema-form`은 폼 스키마 내의 필드를 참조하기 위해 JSONPointer (RFC 6901)를 사용합니다. 이는 JSON Schema 구조의 특정 노드를 주소 지정하는 표준화된 방법을 제공합니다.

### 표준 JSONPointer

JSONPointer는 RFC 6901 사양을 따릅니다:

- `/` - 경로 구분자
- `#` - URI 프래그먼트 식별자 접두사
- `''` (빈 문자열) - 전체 문서를 나타내는 루트 포인터

#### 경로 규칙

`@canard/schema-form`은 두 가지 경로 타입을 구분합니다:

| 경로 타입 | 루트 값 | 예시 | 설명 |
|-----------|--------|------|------|
| `dataPath` | `''` (빈 문자열) | `''`, `'/user/name'` | URI 프래그먼트 접두사 없는 JSON Pointer 문자열. 데이터 값 참조에 사용. |
| `schemaPath` | `'#'` | `'#'`, `'#/properties/user'` | `#` 접두사가 있는 JSON Pointer URI 프래그먼트. 스키마 정의 참조에 사용. |

```tsx
// 표준 JSONPointer 사용 예시
<Form.Render path="/user/name" />        // user.name 접근 (dataPath 스타일)
<Form.Render path="/user/address/0" />   // user.address 배열의 첫 번째 항목 접근
```

**참고**: `<Form.Render path="..." />`는 `dataPath` 스타일의 경로(`#` 접두사 없이)를 사용합니다.

### 확장 JSONPointer

**중요 공지**: 복잡한 폼 시나리오를 더 잘 지원하기 위해, `@canard/schema-form`은 공식 RFC 6901 사양을 벗어나는 **확장 JSONPointer 문법**을 구현합니다. 이러한 확장은 폼 탐색 및 조작을 위한 향상된 기능을 제공하기 위해 부득이하게 필요한 확장입니다.

**사용 컨텍스트**: 확장 JSONPointer 문법은 특정 컨텍스트에서만 사용할 수 있습니다:

- `FormTypeInputMap` 키 (와일드카드 `*` 사용)
- `computed`(`&`) 속성 (상대 경로 `..`, `.` 사용)
- `node.find()` 메서드를 통한 프로그래밍적 노드 탐색

**주의**: 확장 문법은 `<Form.Render path="..." />` 컴포넌트와 `node.find()` 메서드에서는 **지원되지 않으며**, 표준 JSONPointer 경로만 허용됩니다.

다음 확장 기능들이 지원됩니다:

#### 부모 탐색 (`..`)

부모 노드로 탐색, 주로 computed 속성에서 사용:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['admin', 'user'] },
        permissions: {
          type: 'array',
          computed: {
            watch: '../type', // 부모의 type 필드 감시
            active: "../type === 'admin'", // admin일 때만 표시
          },
        },
      },
    },
  },
};

// 프로그래밍적 탐색
const userNode = node.find('user');
const typeNode = userNode.find('../type'); // 형제 노드로 탐색
```

#### 현재 노드 (`.`)

현재 노드 참조:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    settings: {
      type: 'object',
      computed: {
        watch: '.', // 현재 노드 감시
        // 기타 computed 로직
      },
    },
  },
};

// 프로그래밍적 탐색
const currentNode = node.find('.'); // 현재 노드 참조
```

#### 배열 인덱스 와일드카드 (`*`)

배열의 모든 항목에 대해 작업, 주로 FormTypeInputMap에서 사용:

```tsx
const formInputMap = {
  '/users/*/name': CustomNameInput, // 모든 사용자 이름
  '/settings/*/enabled': ToggleInput, // 모든 활성화 설정
  '/data/*/status': StatusBadge, // 모든 상태 필드
};
```

### 실제 사용 예시

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    user: {
      type: 'object',
      properties: {
        role: { type: 'string', enum: ['admin', 'user', 'guest'] },
        profile: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            adminSettings: {
              type: 'object',
              computed: {
                watch: '../role',  // 형제 필드 감시
                active: "../role === 'admin'"  // admin일 때만 표시
              },
              properties: {
                permissions: { type: 'array' }
              }
            }
          }
        },
        addresses: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string', enum: ['home', 'work'] },
              street: { type: 'string' },
              city: { type: 'string' },
              isDefault: {
                type: 'boolean',
                computed: {
                  watch: '../type',  // 형제 type 감시
                  active: "../type === 'home'"  // 집 주소일 때만 표시
                }
              }
            }
          }
        }
      }
    }
  }
};

// 와일드카드를 사용한 FormTypeInputMap
const formInputMap = {
  '/user/profile/name': CustomNameInput,
  '/user/addresses/*/street': AddressInput,      // 모든 주소의 거리
  '/user/addresses/*/isDefault': ToggleInput,    // 모든 isDefault 필드
};

// 표준 Form.Render (확장 문법 없음)
<Form.Render path="/user/profile/name" />           // ✅ 표준 경로
<Form.Render path="/user/addresses/0/street" />     // ✅ 표준 경로

// ❌ Form.Render에서 작동하지 않는 예시:
// <Form.Render path="/user/profile/.." />           // 확장 문법 지원 안 됨
// <Form.Render path="/user/addresses/*/city" />     // 확장 문법 지원 안 됨
```

### 이스케이프 및 언이스케이프

JSONPointer는 RFC 6901에 따라 특수 문자를 이스케이프해야 합니다:

- `~0`는 `~`를 나타냄
- `~1`는 `/`를 나타냄

**구현 참고사항**: `@canard/schema-form`은 공식 RFC 6901 사양을 따르는 모든 이스케이프/언이스케이프 구현을 지원합니다. 필드 이름의 특수 문자 처리를 위해 호환되는 라이브러리나 구현체를 사용할 수 있습니다.

```tsx
// 특수 문자가 포함된 필드 이름: "field/with~special"
<Form.Render path="/field~1with~0special" />
```

### 확장 경로를 사용한 FormTypeInputMap

`FormTypeInputMap`을 사용할 때, 배열 요소에 대해 와일드카드 문법을 사용할 수 있습니다:

```tsx
const formInputMap = {
  '/user/email': EmailInput, // 표준 경로
  '/user/profile/avatar': AvatarUploader, // 중첩 경로
  '/settings/*/enabled': ToggleInput, // ✅ 배열용 와일드카드
  '/users/*/permissions': PermissionSelector, // ✅ 모든 사용자 권한
  '/data/*/status': StatusBadge, // ✅ 모든 상태 필드
};

<Form jsonSchema={jsonSchema} formTypeInputMap={formInputMap} />;
```

### 프로그래밍적 노드 탐색

```tsx
export const AdvancedForm = () => {
  return (
    <Form jsonSchema={jsonSchema}>
      {({ node }) => {
        // node.find()에서 확장 문법 사용
        const userRole = node?.find('/user/role');
        const parentNode = node?.find('..'); // ✅ 부모 탐색

        return (
          <div>
            <Form.Render path="/user/role" /> {/* 표준 경로 */}
            <Form.Render path="/user/profile" />
          </div>
        );
      }}
    </Form>
  );
};
```

**참고**: 확장 JSONPointer 문법 (`..`, `.`, `*`)은 RFC 6901 사양에 대한 의도적인 확장으로, 향상된 폼 조작 기능을 제공하기 위해 구현되었습니다. 이러한 확장은 표준에서 벗어나지만, 실제 애플리케이션에서 일반적으로 요구되는 복잡한 폼 상호작용 및 탐색 패턴을 지원하는 데 필수적입니다.

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
      <div className="custom-form-layout">
        <div className="section">
          <h3>개인 정보</h3>
          <Form.Render path="/personalInfo/name">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path="/personalInfo/age">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>
        </div>

        <div className="section">
          <h3>연락처 정보</h3>
          <Form.Render path="/contactInfo/email">
            {({ Input, path, node }) => (
              <div className="form-field">
                <label htmlFor={path}>{node.jsonSchema.title}</label>
                <Input />
              </div>
            )}
          </Form.Render>

          <Form.Render path="/contactInfo/phone">
            {({ Input, path, node }) => (
              <div className="form-field">
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
        <div className="array-form">
          <h3>사용자</h3>

          {node && isArrayNode(node.find('/users')) && (
            <button onClick={() => node.find('/users').push()} type="button">
              사용자 추가
            </button>
          )}

          <Form.Render path="/users">{({ Input }) => <Input />}</Form.Render>
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
    <div className="login-form">
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        validationMode={ValidationMode.OnRequest}
      />

      <div className="form-actions">
        <button onClick={handleSubmit} type="button">
          제출
        </button>
        <button onClick={handleReset} type="button">
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
    <div className="custom-date-picker">
      <input
        type="date"
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

#### 종류

- `watch`: 다른 Node의 값을 구독할 수 있습니다. (watchValues 속성으로 전달됨)
- `active`: 해당 Node가 활성화될지 여부를 결정합니다. 활성화 되지 않은 Node의 Input은 표시되지 않으며 그 값은 제거됩니다.
- `visible`: 해당 Node가 표시될지 여부를 결정합니다. Input의 표시 여부를 결정합니다.
- `readOnly`: 해당 Node가 읽기 전용일지 여부를 결정합니다. readOnly 상태인 경우 Input에서 값을 수정할 수 없습니다.
- `disabled`: 해당 Node가 비활성화될 때 표시될지 여부를 결정합니다. disabled 상태인 경우 Input에서 값을 수정할 수 없습니다.
- `if` + `oneOf`: oneOf 정의 중 if 조건을 만족하는 정의를 표시합니다. ObjectNode 에서만 사용할 수 있습니다.

#### 우선순위

`active`, `visible`, `readOnly`, `disabled` 속성은 다음과 같은 우선순위를 가집니다.

1. root jsonSchema 의 속성 (boolean)
2. shortcut 속성 (`jsonSchema[{fieldName}]`, boolean)
3. computed 속성 (`jsonSchema.computed[{fieldName}]`, boolean | string)
4. alias computed (`jsonSchema['&{fieldName}']`, boolean | string)

위 우선순위 중 상위 우선순위에 정의한 값을 우선 적용합니다.

#### 기본 예제

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
        default: 'fulltime',
      },
      commonField: {
        type: 'string',
        title: '공통 필드',
        computed: {
          watch: '../employmentType',
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },
    oneOf: [
      {
        computed: {
          if: "./employmentType === 'fulltime'",
        },
        properties: {
          salary: {
            type: 'number',
            title: '연봉',
          },
          bonus: {
            type: 'number',
            title: '보너스',
          },
          benefits: {
            type: 'object',
            title: '복리후생',
            properties: {
              healthInsurance: {
                type: 'boolean',
                title: '건강보험',
              },
              pension: {
                type: 'boolean',
                title: '연금',
              },
            },
          },
          probationPeriod: {
            type: 'number',
            title: '수습기간 (개월)',
            minimum: 0,
            maximum: 12,
          },
        },
      },
      {
        computed: {
          if: "./employmentType === 'parttime'",
        },
        properties: {
          hourlyRate: {
            type: 'number',
            title: '시간당 급여',
          },
          workingHours: {
            type: 'number',
            title: '주당 근무시간',
            minimum: 1,
            maximum: 40,
          },
        },
      },
      {
        computed: {
          if: "./employmentType === 'contractor'",
        },
        properties: {
          hourlyRate: {
            type: 'number',
            title: '시간당 급여',
          },
          contractType: {
            type: 'string',
            enum: ['hourly', 'project', 'temporary'],
            title: '계약 유형',
          },
          workingHours: {
            type: 'number',
            title: '주당 근무시간',
            minimum: 1,
            maximum: 168,
            computed: {
              active: '../contractType === "hourly"',
            },
          },
        },
      },
    ],
  } satisfies JsonSchema;

  return <Form jsonSchema={jsonSchema} />;
};
```

### 폼 제출 관리

`@canard/schema-form`은 폼 제출 상태를 효과적으로 관리할 수 있는 다양한 방법을 제공합니다.

#### onSubmit 사용하기

`onSubmit` prop을 사용하여 폼 제출 로직을 정의할 수 있습니다:

```tsx
import React, { useState } from 'react';

import { Form, JsonSchemaError, isValidationError } from '@canard/schema-form';

export const FormWithSubmit = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: '이름' },
      email: { type: 'string', format: 'email', title: '이메일' },
    },
    required: ['name', 'email'],
  };

  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  const handleSubmit = async (value: any) => {
    try {
      // API 호출 또는 다른 비동기 작업
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(value),
      });

      if (!response.ok) {
        throw new Error('제출 실패');
      }

      console.log('제출 성공!');
    } catch (error) {
      console.error('제출 에러:', error);
    }
  };

  return (
    <Form
      jsonSchema={jsonSchema}
      onSubmit={handleSubmit}
      onValidate={setErrors}
      errors={errors}
    />
  );
};
```

#### useFormSubmit Hook 사용하기

더 복잡한 제출 상태 관리가 필요한 경우 `useFormSubmit` hook을 사용할 수 있습니다:

```tsx
import React, { useRef, useState } from 'react';

import {
  Form,
  FormHandle,
  JsonSchemaError,
  isValidationError,
  useFormSubmit,
} from '@canard/schema-form';

export const AdvancedSubmitForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: '이름' },
      email: { type: 'string', format: 'email', title: '이메일' },
      message: { type: 'string', title: '메시지' },
    },
    required: ['name', 'email'],
  };

  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
  const [errors, setErrors] = useState<JsonSchemaError[]>([]);

  // 비동기 제출 핸들러
  const handleSubmit = async (value: any) => {
    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('제출된 데이터:', value);
  };

  // 제출 상태 관리
  const { submit, loading } = useFormSubmit(formRef);

  const onSubmitClick = async () => {
    try {
      await submit();
      alert('제출이 완료되었습니다!');
    } catch (error) {
      if (isValidationError(error)) {
        console.log('유효성 검사 오류:', error.details);
      } else {
        // 서버 오류 또는 네트워크 오류
        console.error('제출 오류:', error);
      }
    }
  };

  return (
    <div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onSubmit={handleSubmit}
        onValidate={setErrors}
        errors={errors}
      />

      <button
        onClick={onSubmitClick}
        disabled={loading}
        style={{ marginTop: '16px' }}
      >
        {loading ? '제출 중...' : '제출'}
      </button>

      {loading && (
        <div style={{ marginTop: '8px', color: '#666' }}>
          처리 중입니다. 잠시만 기다려주세요...
        </div>
      )}
    </div>
  );
};
```

#### Enter 키로 제출하기

문자열 입력 필드에서 Enter 키를 눌러 폼을 제출할 수 있습니다:

```tsx
import React from 'react';

import { Form } from '@canard/schema-form';

export const EnterSubmitForm = () => {
  const jsonSchema = {
    type: 'string',
    title: '검색어',
  };

  const handleSubmit = (value: string) => {
    console.log('검색어:', value);
    // 검색 로직 실행
  };

  return (
    <Form
      jsonSchema={jsonSchema}
      onSubmit={handleSubmit}
      placeholder="검색어를 입력하고 Enter를 누르세요"
    />
  );
};
```

#### 제출 오류 처리

제출 과정에서 발생할 수 있는 다양한 오류를 처리하는 방법:

```tsx
import React, { useRef, useState } from 'react';

import {
  Form,
  FormHandle,
  ValidationMode,
  isValidationError,
  useFormSubmit,
} from '@canard/schema-form';

export const ErrorHandlingForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      username: { type: 'string', minLength: 3, title: '사용자명' },
      password: { type: 'string', minLength: 8, title: '비밀번호' },
    },
    required: ['username', 'password'],
  };

  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
  const [submitError, setSubmitError] = useState<string>('');

  const handleSubmit = async (value: any) => {
    // 서버 요청 시뮬레이션
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(value),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || '로그인에 실패했습니다.');
    }

    return response.json();
  };

  const { submit, loading } = useFormSubmit(formRef);

  const onSubmitClick = async () => {
    setSubmitError(''); // 이전 오류 초기화

    try {
      await submit();
      alert('로그인 성공!');
    } catch (error) {
      if (isValidationError(error)) {
        // 유효성 검사 오류는 폼에서 자동으로 표시됨
        console.log('유효성 검사 실패');
      } else {
        // 서버 오류 또는 네트워크 오류
        setSubmitError(error.message || '예상치 못한 오류가 발생했습니다.');
      }
    }
  };

  return (
    <div>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onSubmit={handleSubmit}
        validationMode={ValidationMode.OnRequest}
      />

      {submitError && (
        <div
          style={{
            color: 'red',
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#fff2f2',
            border: '1px solid #ffcccc',
            borderRadius: '4px',
          }}
        >
          {submitError}
        </div>
      )}

      <button
        onClick={onSubmitClick}
        disabled={loading}
        style={{ marginTop: '16px' }}
      >
        {loading ? '로그인 중...' : '로그인'}
      </button>
    </div>
  );
};
```

---

## 성능 최적화

이 라이브러리는 다음과 같은 기능으로 성능 최적화가 이루어졌습니다:

- 복잡한 양식용 지연 렌더링
- 불필요한 재렌더링을 방지하기 위한 컴포넌트 메모화
- 플러그인 기반의 효율적인 검증 시스템
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

---

## TypeScript 지원

`@canard/schema-form`은 TypeScript로 구축되었으며 포괄적인 유형 정의를 제공합니다. 주요 유형 유틸리티에는 다음과 같습니다:

- `InferValueType<Schema>`: JSON Schema에서 값 유형을 추론합니다
- `InferSchemaNode<Schema>`: JSON Schema에서 스키마 노드 유형을 추론합니다
- `FormHandle<Schema>`: 스키마 특정 메서드를 가진 양식 참조 핸들러의 유형

---

## 감사의 말씀

`@canard/schema-form`은 [bluewings/react-genie-form](https://github.com/bluewings/react-genie-form)의 아이디어와 설계에서 많은 영감을 받아 개발되었습니다.

훌륭한 오픈소스를 공유해주신 [bluewings](https://github.com/bluewings) 님께 감사드립니다.

## 라이선스

이 저장소는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [`LICENSE`](./LICENSE) 파일을 참조하세요.

---

## 연락처

프로젝트와 관련된 문의나 제안은 이슈를 생성해 주세요.

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
    //...
  };
  // 플러그인에 지정된 matching 조건에 따라 컴포넌트가 자동으로 선택됩니다.
  return <Form jsonSchema={jsonSchema} />;
};
```
