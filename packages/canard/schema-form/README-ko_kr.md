# @canard/schema-form

[![Typescript](https://img.shields.io/badge/typescript-✔-blue.svg)]()
[![Javascript](https://img.shields.io/badge/javascript-✔-yellow.svg)]()
[![React](https://img.shields.io/badge/react-✔-61DAFB.svg)]()
[![JSON Schema](https://img.shields.io/badge/JSONSchema-{}-blue.svg)]()
[![JSON Schema Form](https://img.shields.io/badge/JSONSchemaForm-form-red.svg)]()

---

## 개요

`@canard/schema-form`은 제공된 [JSON Schema](https://json-schema.org/)를 기반으로 양식을 렌더링하는 React 기반 컴포넌트 라이브러리입니다.

JSON Schema 검증은 플러그인 시스템을 통해 지원되며, 다양한 validator plugin을 통해 사용할 수 있습니다.

다양한 `FieldInput` 컴포넌트를 정의함으로써 복잡한 요구사항을 쉽게 충족시킬 수 있는 유연성을 제공합니다.

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
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 이 SchemaForm에서 사용할 JSON Schema */
  jsonSchema: Schema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value;
  /** 모든 FieldInput 구성 요소에 readOnly 속성을 적용합니다 */
  readOnly?: boolean;
  /** 모든 FieldInput 구성 요소에 disabled 속성을 적용합니다 */
  disabled?: boolean;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: Fn<[value: Value]>;
  /** 검증 결과나 외부 오류 목록이 폼 오류 목록을 바꿀 때 호출되는 함수 */
  onValidate?: Fn<[errors: FieldNode['globalErrors']]>;
  /** 폼이 제출될 때 호출되는 함수 (검증 통과 후 실행) */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** 이 SchemaForm의 상태가 변경될 때 호출되는 함수 */
  onStateChange?: Fn<[state: FieldNode['globalState']]>;
  /** 이 폼 인스턴스의 오류 기록(생성·렌더 실패 포함)마다 호출되는 함수 */
  onError?: Fn<[record: FormErrorRecord]>;
  /** 준비가 끝난 뒤 루트 진단이 바뀔 때 호출되는 함수 */
  onDiagnosticsChange?: Fn<[diagnostics: FieldNode['diagnostics']]>;
  /** `controls.unsetOnInactive`의 폼 기본값: 형상에서 빠진 필드의 값을 지움 (노드 자신의 정책이 우선) */
  unsetOnInactive?: boolean;
  /** 명령형 쓰기는 막지 않고 자동 쓰기만 억제하는 폼 기본값 */
  disableAutomaticWrites?: boolean;
  /** FieldInput 정의 목록 */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** FieldInput 경로 매핑 */
  fieldInputMap?: FieldInputMap;
  /** 그룹 렌더러 컴포넌트 */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** 레이블 렌더러 컴포넌트 */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** 입력 렌더러 컴포넌트 */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** 오류 렌더러 컴포넌트 */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** 초기 검증 오류, 기본값은 undefined */
  errors?: FieldNode['globalErrors'];
  /** 사용자 정의 오류 형식 함수 */
  formatError?: FieldRendererProps['formatError'];
  /**
   * 오류 표시 조건 (기본: ShowError.DirtyTouched)
   *   - `true`: 항상 표시
   *   - `false`: 절대 표시하지 않음
   *   - `ShowError.Dirty`: 값이 변경되었을 때 표시
   *   - `ShowError.Touched`: 입력에서 포커스가 한 번 빠진 뒤 표시
   *   - `ShowError.DirtyTouched`: Dirty 및 Touched 조건이 모두 충족되었을 때 표시
   */
  showError?: boolean | ShowError;
  /**
   * 유효성 검사 모드 실행 (기본값: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: 유효성 검사 비활성화
   *  - `ValidationMode.OnChange`: 값이 변경될 때 유효성 검사
   *  - `ValidationMode.OnRequest`: 요청 시 유효성 검사
   */
  validationMode?: ValidationMode;
  /** 커스텀 검증기 객체(`compile`과 `compileGuard`); Form 속성 > FormProvider > 플러그인 */
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

`getAttachedFilesMap`과 `showError`를 뺀 모든 멤버는 폼의 현재 루트 노드를 대상으로 합니다. 폼이 트리를 새로 만들면 핸들도 새 루트를 따릅니다.

```typescript
interface FormHandle<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 현재 루트 노드 (첫 마운트 전에는 undefined) */
  node?: InferFieldNode<Schema>;
  /** `path`의 입력에 포커스 (생략하면 루트) */
  focus: Fn<[path?: FieldNode['path']]>;
  /** `path`의 입력 값을 선택 (생략하면 루트) */
  select: Fn<[path?: FieldNode['path']]>;
  /** `path`의 입력이 커밋된 값을 다시 읽게 함 (생략하면 루트) */
  refresh: Fn<[path?: FieldNode['path']]>;
  /** `path`에 렌더된 하위 트리를 다시 마운트 (생략하면 루트) */
  remount: Fn<[path?: FieldNode['path']]>;
  /** 커밋된 기본값을 다시 불러옴; 자동 쓰기 옵션만 받음 */
  reset: Fn<
    [
      option?:
        | typeof SetValueOption.DisableAutomaticWrites
        | typeof SetValueOption.EnableAutomaticWrites,
    ]
  >;
  /** JSONPointer 경로의 노드 찾기 */
  findNode: Fn<[path: FieldNode['path']], FieldNode | null>;
  /** JSONPointer 경로에 맞는 모든 노드 찾기 */
  findNodes: Fn<[path: FieldNode['path']], readonly FieldNode[]>;
  /** 하나 이상의 노드에서 참인 상호작용 플래그 */
  getState: Fn<[], FieldNode['globalState']>;
  /** 모든 노드의 상호작용 플래그 패치 */
  setState: Fn<[state: FieldNode['state']]>;
  /** 모든 노드의 상호작용 플래그 지우기 */
  clearState: Fn;
  /** 현재 출력 값 (배열 출력 필터 적용) */
  getValue: Fn<[], Value>;
  /** 값 설정 */
  setValue: SetStateFnWithOptions<Value>;
  /** 현재 오류 전체 */
  getErrors: Fn<[], FieldNode['globalErrors']>;
  /** 첨부 파일 맵 */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  /** 검증을 실행하고 오류를 반환 */
  validate: Fn<[], Promise<FieldNode['globalErrors']>>;
  /** `true`(기본)는 모든 오류 표시, `false`는 `showError` prop으로 되돌림 */
  showError: Fn<[visible?: boolean]>;
  /** 폼 제출; `useFormSubmit`이 진행 상태를 읽음 */
  submit: TrackableHandlerFunction;
}
```

- 노드가 없는 `path`를 주면 `focus`, `select`, `refresh`, `remount`는 아무것도 하지 않습니다.
- 첫 마운트 전에도 조회는 예외를 던지지 않습니다. `findNode`는 `null`, `findNodes`·`getErrors`·`validate`는 빈 배열, `getState`는 빈 객체를 반환합니다.
- `showError(false)`는 오류를 숨기지 않습니다. 표시 여부를 Form의 `showError` prop에 되돌려 줍니다.
- `reset()`은 첨부 파일 맵도 비우고 `showError(true)`로 켠 표시도 풀어, 오류 표시가 다시 `showError` prop을 따르게 합니다.

#### AttachedFilesMap

```ts
// JSONPointer 경로(예: "/attachment" 또는 "/items/0/file")를 키로, File[]를 값으로 보관합니다.
type AttachedFilesMap = Map<string, File[]>;
```

#### FormChildrenProps

```ts
interface FormChildrenProps<
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferFieldNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: FieldNode['globalErrors'];
}
```

### 기본 사용법

```tsx
import { Form, registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

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

ValidatorFactory는 스키마를 컴파일하는 `compile`과 `if/then/else`가 쓰는 동기 가드를 컴파일하는 `compileGuard`를 필수로 갖고, `release`와 `dialect`를 선택으로 갖는 객체입니다:

```ts
// The engine passes its own copy of the schema; it is typed as JSONSchema here.
interface ValidatorFactory {
  compile(copy: JSONSchema): ValidateFunction;
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  release?(root: JSONSchema): void;
  readonly dialect?: string;
}

type ValidateFunction<Value = unknown> = (
  data: Value,
) =>
  | Promise<readonly ValidationIssue[] | null>
  | readonly ValidationIssue[]
  | null;
```

`ValidateFunction`은 순서가 있는 `ValidationIssue` 목록을 반환하고 값이 유효하면 `null`을 반환하며, 예외를 던지면 안 됩니다. `Form`과 `FormProvider`의 `validatorFactory` 속성이 이 객체를 받습니다. 선택 순서는 Form 속성, FormProvider, 플러그인의 `validator` 순입니다. 참조가 바뀌면 트리가 다시 만들어지므로 참조를 안정적으로 유지하세요.

### Validator Plugin 사용법

#### 1. 기본적인 플러그인 등록

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 앱 시작 시 플러그인 등록
registerPlugin(ajvValidatorPlugin);
```

#### 2. 커스텀 AJV 인스턴스

직접 만든 AJV 인스턴스를 사용하려면 플러그인을 등록하기 전에 주입합니다:

```tsx
import { Form, registerPlugin } from '@canard/schema-form';
// 플러그인이 ajv8.x 기반이므로 ajv 역시 8.x 버전을 사용해야 합니다.
// ajv7.x를 사용하려면 @canard/schema-form-ajv7-plugin을,
// ajv6.x를 사용하려면 @canard/schema-form-ajv6-plugin을 사용하세요.
import { plugin } from '@canard/schema-form-ajv8-plugin';
import Ajv from 'ajv';

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

// 플러그인을 등록하기 전에 인스턴스를 주입
plugin.validator.bind(customAjv);
registerPlugin(plugin);

export const CustomValidationForm = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', maxLength: 10 },
      evenNumber: { type: 'number', isEven: true, maximum: 100 },
    },
  } as const;

  return <Form jsonSchema={jsonSchema} />;
};
```

`coerceTypes`, `useDefaults`, `removeAdditional`이 설정된 인스턴스는 검증이 값을 바꾸면 안 되므로 거부됩니다.

#### 3. Form 또는 FormProvider용 커스텀 ValidatorFactory

한 Form이나 FormProvider 아래의 모든 Form에서 검증기를 바꾸려면 `compile`과 `compileGuard`를 모두 선언한 객체를 전달합니다:

```tsx
import { Form, FormProvider, type ValidatorFactory } from '@canard/schema-form';

// 컴포넌트 밖에서 한 번만 선언: 참조가 바뀌면 트리가 다시 만들어집니다.
const validatorFactory: ValidatorFactory = {
  compile: (copy) => compileWithMyEngine(copy),
  compileGuard: (root, pointer) => compileGuardWithMyEngine(root, pointer),
};

export const CustomValidationForm = () => (
  <Form jsonSchema={jsonSchema} validatorFactory={validatorFactory} />
);

export const App = () => (
  <FormProvider validatorFactory={validatorFactory}>
    <MyForms />
  </FormProvider>
);
```

AJV 플러그인의 `createValidatorFactory(ajv)`는 compile 함수만 반환하므로 그 자체로는 유효한 `validatorFactory`가 아닙니다.

### 오류 메시지 형식 지정

📌 `@canard/schema-form`은 유효성 검증 메시지를 커스텀 할 수 있는 기능을 제공합니다.

📌 이 기능은 유효성 검증 기능을 포함하지 않습니다. 유효성 검증 기능을 사용하려면 다음 플러그인 중 하나를 사용하거나, 직접 구현한 유효성 검증기를 적용해야 합니다.

- [@canard/schema-form-ajv6-plugin](../schema-form-ajv6-plugin/README-ko_kr.md)
- [@canard/schema-form-ajv7-plugin](../schema-form-ajv7-plugin/README-ko_kr.md)
- [@canard/schema-form-ajv8-plugin](../schema-form-ajv8-plugin/README-ko_kr.md)

📌 만약 추가적인 메시지 형식이 필요하다면, `formatError` 함수를 직접 작성하여 적용할 수 있습니다.

📌 유효성 검증 메시지는 다음 규칙을 따르도록 정의해야 합니다:

- 유효성 검증 메시지는 jsonSchema의 `presentation.errorMessages` 속성에 정의해야 합니다.
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
      presentation: {
        errorMessages: {
          minLength:
            '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
          maxLength:
            '이름은 최대 {limit} 글자 이하여야 합니다. 현재 값: {value}',
          required: '이름은 필수 입력 항목입니다.',
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
      presentation: {
        errorMessages: {
          minLength: {
            ko_KR:
              '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
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

## FieldInput 시스템

`@canard/schema-form`은 강력하고 유연한 FieldInput 시스템을 제공합니다. 이 시스템은 사용자가 각 JSON 스키마 노드에 어떤 입력 컴포넌트를 사용할지 정확히 제어할 수 있도록 합니다.

### FieldInputDefinition

FieldInputDefinition은 특정 조건에 맞는 JSON 스키마 노드에 사용될 입력 컴포넌트를 정의합니다:

```ts
type FieldInputDefinition<T = unknown> = {
  test: FieldInputTestFn | FieldInputTestObject;
  Component: ComponentType<InferFieldInputProps<T>>;
};
```

각 정의는 두 개의 주요 부분으로 구성됩니다:

- **test**: 이 입력 구성 요소가 적용되어야 하는 JSON Schema 노드의 조건을 정의합니다
- **Component**: 조건이 충족될 때 사용될 React 구성 요소

#### 테스트 함수 또는 테스트 객체

FieldInput의 조건은 함수 또는 객체를 사용하여 정의할 수 있습니다:

```ts
type FieldInputHint = {
  type: FieldNodeType;
  schemaType: FieldNode['schemaType'];
  typeMismatch: boolean;
  path: string;
  required: boolean;
  nullable: boolean;
  jsonSchema: JSONSchema | JSONSchemaWithVirtual;
  format?: string;
  inputType?: string;
};
type FieldInputTestFn = Fn<[hint: FieldInputHint], boolean>;

// type, schemaType, path, format, inputType은 값 하나 또는 목록 중 아무 값과 맞음
type FieldInputTestObject = Partial<{
  type: FieldNodeType | FieldNodeType[];
  schemaType: FieldNode['schemaType'] | FieldNode['schemaType'][];
  path: string | string[];
  format: string | string[];
  inputType: string | string[];
  required: boolean;
  nullable: boolean;
}>;
```

inputType은 정의의 test가 해석하는 문자열 힌트이며 HTML input type과 같지 않습니다.

- **FieldInputTestFn**: FieldInputHint 객체를 받아 boolean을 반환하는 함수입니다. 더 복잡한 조건을 구현하는 데 유용합니다.
- **FieldInputTestObject**: 조건을 단순히 객체로 정의할 수 있습니다. 예를 들어, `{ type: ['string'], format: ['email'] }`는 문자열 유형이고 이메일 형식인 노드를 일치시킵니다.

#### FieldInput 속성

선택된 컴포넌트는 다음 props를 받습니다:

```ts
interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends ReadonlyArray<any> = ReadonlyArray<any>,
  Schema extends JSONSchema | JSONSchemaWithVirtual = unknown extends Value
    ? JSONSchema
    : InferJSONSchema<Value>,
  Node extends FieldNode = unknown extends Value
    ? FieldNode
    : InferFieldNode<Schema>,
> {
  /** FieldInput 컴포넌트의 JSON 스키마 */
  jsonSchema: Schema;
  /** FieldInput 컴포넌트의 읽기 전용 상태 */
  readOnly: boolean;
  /** FieldInput 컴포넌트의 비활성화 상태 */
  disabled: boolean;
  /** FieldInput 컴포넌트에 할당된 필드 노드가 필수인지 여부 */
  required: boolean;
  /** FieldInput 컴포넌트에 할당된 필드 노드 */
  node: Node;
  /** 노드 종류 (예: 'string', 'number', 'object', 'array') */
  type: Node['type'];
  /** 작성한 허용 종류('integer' 포함) */
  schemaType: Node['schemaType'];
  /** 저장된 값이 허용 종류와 어긋나는지 */
  typeMismatch: Node['typeMismatch'];
  /** FieldInput 컴포넌트에 할당된 필드 노드의 이름 */
  name: Node['name'];
  /** FieldInput 컴포넌트에 할당된 필드 노드의 경로 */
  path: Node['path'];
  /** 이 필드가 null 값을 허용하는지 여부 (스키마 타입 배열에 'null'이 포함된 경우에서 파생) */
  nullable: Node['nullable'];
  /** FieldInput 컴포넌트에 할당된 필드 노드의 오류 */
  errors: Node['errors'];
  /** 이 필드의 에러를 표시할지 여부 */
  errorVisible: boolean;
  /** JSONSchema에서 정의된 `controls.watch` 경로에 따라 모니터링되는 값 */
  watchValues: WatchValues;
  /** FieldInput 컴포넌트의 기본값 */
  defaultValue: Value | undefined;
  /** FieldInput 컴포넌트의 값 */
  value: Value | undefined;
  /** FieldInput 컴포넌트의 onChange 핸들러 */
  onChange: SetStateFnWithOptions<Value | undefined>;
  /** 파일(들)을 폼의 파일 저장소에 첨부/해제합니다 */
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  /** 이 FieldInput 컴포넌트의 자식 FieldInput 컴포넌트 */
  ChildFields: ChildField[];
  /** 입력 필드의 placeholder 텍스트 */
  placeholder: string | undefined;
  /** 스타일링을 위한 CSS 클래스 이름 */
  className: string | undefined;
  /** FieldInput 컴포넌트의 스타일 */
  style: CSSProperties | undefined;
  /** Form에 전달되는 사용자 정의 컨텍스트 */
  context: Context;
  /** 추가 속성은 자유롭게 정의 가능합니다 */
  [alt: string]: any;
}
```

### 파일 관리 시스템 (onFileAttach)

`@canard/schema-form`은 파일 자체는 별도의 저장소에 보관하고, 스키마 값에는 메타데이터(파일명, 크기 등)만 저장하는 방식을 지원합니다. 이를 위해 `FieldInput`에서 `onFileAttach`를 호출하여 파일을 첨부하고, 제출 시 `FormHandle.getAttachedFilesMap()`으로 실제 파일을 추출해 API로 전송합니다.

- **저장 위치**: `getAttachedFilesMap()`은 `Map<string, File[]>`을 반환합니다. 키는 해당 입력의 표준 JSONPointer 경로(`node.path`)입니다. 이때 키는 RFC 6901의 표준 JSONPointer만 사용하며, 확장 문법(`..`, `.`, `*`)은 사용하지 않습니다.
- **자동 정리(cleanup)**:
  - 폼이 재구성되거나(unmount 포함) 입력 노드가 제거되면 해당 경로의 파일은 자동으로 제거됩니다.
  - 조건부 스키마(`if/then/else`, `oneOf`)로 필드가 사라질 때도 파일이 정리됩니다.

#### 단일/다중 파일 FieldInput 예시

```tsx
const FileFieldInput = ({
  onFileAttach,
  onChange,
  readOnly,
  disabled,
  value,
  jsonSchema,
}: FieldInputProps<any>) => {
  const multiple: boolean =
    jsonSchema?.presentation?.FieldInputProps?.multiple ?? false;
  const accept: string | undefined =
    jsonSchema?.presentation?.FieldInputProps?.accept;

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
      presentation: {
        FieldInput: FileFieldInput,
        FieldInputProps: { multiple: false, accept: '*/*' },
      },
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

### FieldInputMap

구성 요소를 JSON 스키마의 특정 필드에 직접 매핑할 수 있습니다:

```ts
type FieldInputMap = {
  [path: string]: ComponentType<FieldInputProps>;
};
```

이것은 JSON 스키마의 특정 경로에 컴포넌트를 명시적으로 할당할 수 있도록 합니다.

### FieldInput 선택 프로세스 및 우선순위

폼이 렌더링될 때 각 JSON 스키마 노드의 입력 컴포넌트는 다음과 같은 우선순위에 따라 결정됩니다:

1. **직접 할당된 FieldInput**: JSON 스키마 객체의 `presentation.FieldInput` 속성을 통해 컴포넌트가 직접 할당된 경우

```js
const jsonSchema = {
  type: 'string',
  presentation: {
    FieldInput: CustomTextInput, // 가장 높은 우선순위
  },
};
```

2. **FieldInputMap**: `Form` 구성 요소에 전달된 `fieldInputMap`에 일치하는 경로가 있을 때

   ```jsx
   <Form
     jsonSchema={jsonSchema}
     fieldInputMap={{
       '/user/email': EmailInput,
       '/user/profile/avatar': AvatarUploader,
     }}
   />
   ```

3. **Form의 FieldInputDefinitions**: `Form` 컴포넌트에 전달된 `fieldInputDefinitions` 배열에서 테스트 조건을 충족하는 첫 번째 정의
   <Form
     jsonSchema={jsonSchema}
     fieldInputDefinitions={[
       { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
       { test: { type: ['string'], format: ['date'] }, Component: DatePicker },
     ]}
   />
   ```

4. **FormProvider의 FieldInputDefinitions**: `FormProvider`를 통해 전역으로 제공된 `fieldInputDefinitions`

5. **플러그인의 FieldInputDefinitions**: 등록된 플러그인에서 제공된 `fieldInputDefinitions`

**중요**: 동일한 조건을 충족하는 여러 FieldInput이 존재할 경우, 위의 우선순위 순서대로 첫 번째로 발견된 것이 사용됩니다. 배열로 제공될 경우, 정의는 배열에 나타나는 순서대로 평가됩니다.

이 강력한 메커니즘은 **높은 수준의 커스터마이징**을 가능하게 합니다:

- 기본 입력 컴포넌트를 전역적으로 오버라이드
- 특정 양식에 특화된 커스텀 입력 컴포넌트를 정의
- 필드의 경로에 따라 특정 필드에 컴포넌트를 명시적으로 지정
- JSON 스키마 속성에 구성 요소를 직접 할당하여 가장 구체적인 수준의 제어

### 예시: 다른 우선순위 활용

```tsx
import { Form, FormProvider, registerPlugin } from '@canard/schema-form';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

// 플러그인 등록 (최저 우선순위)
registerPlugin(antd5Plugin);

export const CustomizedForm = () => {
  // 글로벌 FieldInput 정의 (중간 우선순위)
  const globalDefinitions = [
    {
      test: { type: ['string'] },
      Component: GlobalTextInput,
    },
  ];

  // 양식별 FieldInput 정의 (더 높은 우선순위)
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
                presentation: {
                  FieldInput: CountrySelector, // 직접 할당된 컴포넌트 사용 (최우선순위)
                },
              },
            },
          },
        },
      },
    },
  };

  return (
    <FormProvider fieldInputDefinitions={globalDefinitions}>
      <Form
        jsonSchema={jsonSchema}
        fieldInputDefinitions={formDefinitions}
        fieldInputMap={formInputMap}
      />
    </FormProvider>
  );
};
```

이 강력한 시스템은 개발자가 양식의 모든 측면에 대해 세밀한 제어를 유지하면서 코드 중복을 최소화할 수 있도록 합니다.

---

## 오류 처리

오류 클래스는 네 가드 `isJSONSchemaError`, `isSchemaFormError`, `isValidationError`, `isUnhandledError`로 가르고, `error.code`(`onError`에서는 `record.code`)는 문자열 리터럴 대신 `FormErrorCode`·`FormWarningCode` 상수와 비교하십시오. 값은 `'SCHEMA_FORM_ERROR.RENDER_FAILED'` 같은 그룹 한정 문자열입니다. 상수는 패키지 안의 이름 변경을 따라가지만, 리터럴은 조용히 더는 맞지 않게 됩니다.

```tsx
import { useRef } from 'react';
import {
  Form,
  FormErrorCode,
  FormWarningCode,
  isValidationError,
  useFormSubmit,
  type FormHandle,
} from '@canard/schema-form';

const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

declare function reportToMonitoring(error: unknown): void;

function ProfileForm() {
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
  const { submit, pending } = useFormSubmit(formRef);

  const handleSubmit = async () => {
    try {
      await submit();
    } catch (error) {
      if (isValidationError(error) && error.code === FormErrorCode.SchemaValidationFailed)
        return; // field errors are already on the form; formRef.current?.getErrors() lists them
      throw error;
    }
  };

  return (
    <>
      <Form
        ref={formRef}
        jsonSchema={jsonSchema}
        onError={(record) => {
          if (record.code === FormErrorCode.RenderFailed) reportToMonitoring(record.error);
          else if (record.code === FormWarningCode.TypeMismatch) console.info(record.path, record.message);
        }}
      />
      <button onClick={handleSubmit} disabled={pending}>Submit</button>
    </>
  );
}
```

`onError`는 그 폼 인스턴스의 모든 오류와 경고 기록을 받고, `submit()`은 검증이 실패하면 `ValidationError`(`FormErrorCode.SchemaValidationFailed`)로 거부합니다. 전체 코드 일람은 [SPECIFICATION — 오류 처리](./docs/ko/SPECIFICATION.md#오류-처리)에 있습니다.

---

## Plugin System

`@canard/schema-form`은 개발자가 라이브러리를 확장하고 사용자 정의 기능을 추가할 수 있는 플러그인 시스템을 제공합니다.

### Plugin Registration

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(antd5Plugin);
registerPlugin(ajvValidatorPlugin);
```

### 사용 가능한 플러그인

#### UI Plugins

- [**@canard/schema-form-antd5-plugin**](../schema-form-antd5-plugin/README-ko_kr.md): Ant Design 기반 기초 컴포넌트 제공
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
  /** Form.Field 컴포넌트 */
  FieldRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Label 컴포넌트 */
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Input 컴포넌트 */
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  /** Form.Error 컴포넌트 */
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  /** 사용자 정의 입력 타입 정의 */
  fieldInputDefinitions?: FieldInputDefinition[];
  /** 사용자 정의 유효성 검사기 플러그인 */
  validator?: ValidatorPlugin;
  /** 에러 메시지 포매팅 함수 */
  formatError?: FormatError;
}

export interface ValidatorPlugin {
  /** 외부 Validator 인스턴스 주입 */
  bind?: Fn<[instance: any]>;
  /** 스키마 기반 Validator 생성 함수 */
  compile(jsonSchema: JSONSchema): ValidateFunction;
  /** 작성된 스키마 포인터에 대한 동기 가드 컴파일러 */
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  /** 루트의 검증기 자원 해제 */
  release?(root: JSONSchema): void;
  /** 선언된 JSON Schema 방언 */
  readonly dialect?: string;
}
```

### 플러그인 등록 규칙

동일한 속성에 대해 여러 개의 플러그인이 등록된 경우, 다음과 같은 우선순위 규칙이 적용됩니다.

| 속성                                                                           | 허용 개수         | 우선순위 규칙                                     |
| ------------------------------------------------------------------------------ | ----------------- | ------------------------------------------------- |
| `FieldRenderer`, `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer` | 하나만 허용       | 마지막에 등록한 컴포넌트가 적용됩니다.            |
| `fieldInputDefinitions`                                                        | 여러 개 병합 가능 | 병합되며, 마지막에 등록한 항목이 우선 적용됩니다. |
| `validator`, `formatError`                                                     | 하나만 허용       | 마지막에 등록한 항목이 적용됩니다.                |

이 구조는 다양한 플러그인을 조합해 사용하는 경우에도 일관된 우선순위와 확장성을 제공합니다.

기본 그룹 렌더러는 자체 레이블과 메시지를 그리므로 `FormLabelRenderer`와 `FormErrorRenderer`는 컴포지션 API(`Form.Label`, `Form.Error`)나 이를 호출하는 사용자 그룹 렌더러를 통해서만 나타납니다.

렌더러 속성은 폼이 마운트될 때 한 번 읽히므로, 마운트 이후에 렌더러를 교체해도 반영된다고 보장하지 않습니다.

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

| 경로 타입    | 루트 값          | 예시                         | 설명                                                                    |
| ------------ | ---------------- | ---------------------------- | ----------------------------------------------------------------------- |
| `dataPath`   | `''` (빈 문자열) | `''`, `'/user/name'`         | URI 프래그먼트 접두사 없는 JSON Pointer 문자열. 데이터 값 참조에 사용.  |
| `schemaPath` | `'#'`            | `'#'`, `'#/properties/user'` | `#` 접두사가 있는 JSON Pointer URI 프래그먼트. 스키마 정의 참조에 사용. |

```tsx
// 표준 JSONPointer 사용 예시
<Form.Render path="/user/name" />        // user.name 접근 (dataPath 스타일)
<Form.Render path="/user/address/0" />   // user.address 배열의 첫 번째 항목 접근
```

**참고**: `<Form.Render path="..." />`는 `dataPath` 스타일의 경로(`#` 접두사 없이)를 사용합니다.

### 확장 JSONPointer

**중요 공지**: 복잡한 폼 시나리오를 더 잘 지원하기 위해, `@canard/schema-form`은 공식 RFC 6901 사양을 벗어나는 **확장 JSONPointer 문법**을 구현합니다. 이러한 확장은 폼 탐색 및 조작을 위한 향상된 기능을 제공하기 위해 부득이하게 필요한 확장입니다.

**사용 컨텍스트**: 확장 JSONPointer 문법은 특정 컨텍스트에서만 사용할 수 있습니다:

- `FieldInputMap` 키 (와일드카드 `*` 사용)
- `controls` 표현식 (상대 경로 `..`, `.` 사용)
- `node.find()` 메서드를 통한 프로그래밍적 노드 탐색

**주의**: 확장 문법은 `<Form.Render path="..." />` 컴포넌트에서는 **지원되지 않으며**, 표준 JSONPointer 경로만 허용됩니다. `node.find()`는 상대 경로 탐색(`..`, `.`)을 지원하지만 와일드카드는 지원하지 않습니다 — 와일드카드 매칭에는 `findNodes()`를 사용하세요.

다음 확장 기능들이 지원됩니다:

#### 부모 탐색 (`..`)

부모 노드로 탐색, 주로 `controls` 표현식에서 사용:

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
          controls: {
            watch: ['../type'], // 부모의 type 필드 감시
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
      controls: {
        watch: ['.'], // 현재 노드 감시
        // 기타 controls 로직
      },
    },
  },
};

// 프로그래밍적 탐색
const currentNode = node.find('.'); // 현재 노드 참조
```

#### 와일드카드 (`*`)

경로의 모든 세그먼트를 매칭, 주로 FieldInputMap에서 사용됩니다. 와일드카드는 배열 인덱스와 동적 객체 키(`additionalProperties` 등) 모두를 매칭합니다:

```tsx
const formInputMap = {
  // 배열 인덱스 매칭
  '/users/*/name': CustomNameInput, // /users/0/name, /users/1/name 등 매칭
  '/settings/*/enabled': ToggleInput, // 모든 배열 항목의 enabled 필드

  // 동적 키 매칭 (additionalProperties)
  '/config/*/value': ConfigValueInput, // /config/theme/value, /config/lang/value 등 매칭
  '/permissions/*/granted': PermissionToggle, // 모든 권한 키 매칭
};

// additionalProperties를 사용한 스키마 예시
const jsonSchema = {
  type: 'object',
  properties: {
    config: {
      type: 'object',
      additionalProperties: {
        type: 'object',
        properties: {
          value: { type: 'string' },
          enabled: { type: 'boolean' },
        },
      },
    },
  },
};
// '/config/*/value'는 /config/theme/value, /config/language/value 등을 매칭
```

**참고**: 와일드카드 `*`는 `FieldInputMap` 키와 복수형 `findNodes()` 메서드에서 사용 가능합니다. `<Form.Render path="..." />` 또는 단수형 `node.find()` 메서드에서는 지원되지 않습니다.

#### Context 참조 (`@`)

Form에 전달된 외부 context 데이터를 참조합니다. 주로 `controls` 표현식에서 사용됩니다.

**중요:** `@` 심볼은 context 객체 자체를 직접 참조하며, JSON Pointer 경로가 아닙니다. 따라서 JSON Pointer 형식이 아닌 **JavaScript 속성 접근자 문법**(점 표기법 또는 대괄호 표기법)을 사용해야 합니다:

```tsx
// ✅ 올바른 사용 - 속성 접근자 문법
'@.mode'; // context.mode
'@.user.role'; // context.user.role
'@.permissions?.edit'; // context.permissions?.edit (옵셔널 체이닝)

// ❌ 잘못된 사용 - JSON Pointer 형식
'@/mode'; // 작동하지 않음
'@/user/role'; // 작동하지 않음
```

**`controls` 표현식에서의 사용:**

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    secretField: {
      type: 'string',
      controls: {
        visible: '@.userRole === "admin"', // admin 사용자에게만 표시
        readOnly: '@.mode === "view"', // 보기 모드에서 읽기 전용
        disabled: '@.permissions?.canEdit === false', // 권한에 따라 비활성화
      },
    },
    combinedCondition: {
      type: 'string',
      controls: {
        // context (@)와 폼 필드 참조 (..)를 조합
        active: '@.featureEnabled && ../category === "premium"',
      },
    },
  },
};

// Form에 context 전달
<Form
  jsonSchema={jsonSchema}
  context={{
    mode: 'edit',
    userRole: 'admin',
    featureEnabled: true,
    permissions: { canEdit: true },
  }}
/>;
```

**주요 특징:**

- Context 값은 반응형으로 업데이트됩니다 - context가 변경되면 `controls` 표현식이 재평가됩니다
- 안전한 중첩 접근을 위한 옵셔널 체이닝(`?.`) 지원
- `controls` 표현식에서만 사용 가능하며, `FieldInputMap`이나 `Form.Render`에서는 사용 불가

> ⚠️ **권장사항:** `@`는 런타임에 동적으로 변경될 수 있는 context 객체를 참조하므로, 중첩 속성에 안전하게 접근하기 위해 **옵셔널 체이닝(`?.`)**을 사용하는 것을 권장합니다. 이렇게 하면 context 속성이 undefined 또는 null일 때 발생할 수 있는 런타임 오류를 방지할 수 있습니다.
>
> ```tsx
> // ✅ 옵셔널 체이닝을 사용한 안전한 접근
> '@.user?.profile?.name';
> '@.settings?.theme ?? "light"';
>
> // ⚠️ context 구조가 변경되면 오류 발생 가능
> '@.user.profile.name';
> ```

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
              controls: {
                watch: ['../role'],  // 형제 필드 감시
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
                controls: {
                  watch: ['../type'],  // 형제 type 감시
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

// 와일드카드를 사용한 FieldInputMap
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

### 확장 경로를 사용한 FieldInputMap

`FieldInputMap`을 사용할 때, 와일드카드 문법을 사용하여 모든 경로 세그먼트를 매칭할 수 있습니다 (배열 인덱스 또는 동적 객체 키):

```tsx
const formInputMap = {
  '/user/email': EmailInput, // 표준 경로
  '/user/profile/avatar': AvatarUploader, // 중첩 경로

  // 배열 인덱스 와일드카드
  '/settings/*/enabled': ToggleInput, // ✅ 모든 배열 항목의 enabled 필드
  '/users/*/permissions': PermissionSelector, // ✅ 모든 사용자 권한

  // 동적 키 와일드카드 (additionalProperties)
  '/metadata/*/value': MetadataInput, // ✅ 모든 메타데이터 키의 value
  '/features/*/*': FeatureInput, // ✅ 중첩된 와일드카드 지원
};

<Form jsonSchema={jsonSchema} fieldInputMap={formInputMap} />;
```

**와일드카드 매칭 예시:**

- `/users/*/name`은 `/users/0/name`, `/users/1/name` 매칭 (배열 인덱스)
- `/config/*/enabled`는 `/config/theme/enabled`, `/config/lang/enabled` 매칭 (객체 키)
- `/data/*/*/status`는 깊게 중첩된 모든 status 필드를 매칭

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

**참고**: 두 입력(예: 두 개의 `Form.Input` 컴포넌트나 두 개의 `Input` 슬롯)이 같은 경로에 바인딩되어 있어도 타이핑하는 동안에는 서로를 미러링하지 않습니다. 타이핑은 Refresh를 일으키지 않고 각 입력이 자신의 초안을 소유하므로, 다른 입력은 값을 바꾸는 `setValue`, `reset`, 폼 핸들의 `refresh(path)`처럼 Refresh가 닿을 때까지 자신의 글자를 그대로 보여 줍니다.

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
  } as const;

  return (
    <Form jsonSchema={jsonSchema}>
      {({ node }) => (
        <div className="array-form">
          <h3>사용자</h3>

          {node?.find('/users')?.type === 'array' && (
            <button
              onClick={() => {
                const users = node.find('/users');
                if (users && isArrayNode(users)) users.push();
              }}
              type="button"
            >
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

#### 배열 한도 (minItems / maxItems)

core는 채우지도 막지도 않습니다. `minItems`는 마운트·reset·분기 재활성화 때 항목을 만들지 않고, `maxItems`는 `push`나 `setValue`를 거부하지 않습니다. 두 한도는 `node.jsonSchema`에 남고, 위반은 검증이 알립니다. 기본 배열 입력은 `maxItems`에 이르면 추가 버튼을 숨깁니다.

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      items: { type: 'string', default: 'item' },
      minItems: 3,
      maxItems: 5,
    },
  },
};

// default 없음: tags는 []로 로드 — 항목이 셋이 될 때까지 검증이 minItems를 알림
// default: ['one'] 또는 defaultValue={{ tags: ['one'] }}: tags는 ['one']으로 로드
// push()는 ('item')을 덧붙이고 새 길이를 돌려줌 — maxItems를 넘어도 마찬가지
```

#### 배열 prefixItems 지원 (JSON Schema 2020-12)

이 라이브러리는 JSON Schema Draft 2020-12의 `prefixItems`를 지원하여 위치 기반 튜플 검증이 가능합니다:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    // 각 위치에 특정 타입을 가진 튜플
    coordinates: {
      type: 'array',
      prefixItems: [
        { type: 'number', title: 'X' },
        { type: 'number', title: 'Y' },
        { type: 'number', title: 'Z' },
      ],
      items: false, // 추가 항목 불허
    },

    // 혼합 튜플: 고정 접두사 + 유연한 꼬리
    person: {
      type: 'array',
      prefixItems: [
        { type: 'string', title: '이름' },
        { type: 'string', title: '성' },
      ],
      items: { type: 'string', title: '중간 이름' }, // 추가 항목 허용
    },
  },
};
```

**주요 동작:**

- **위치 기반 스키마**: 각 배열 인덱스는 해당하는 `prefixItems` 스키마를 사용합니다
- **items로 폴백**: `prefixItems.length`를 초과하는 인덱스는 `items` 스키마를 사용합니다
- **items: false**: `prefixItems.length`를 넘는 항목은 유효하지 않으며 검증이 알립니다. core는 튜플 뒤로의 push를 막지 않고, `maxItems`를 `prefixItems`에서 끌어내지 않습니다

**검증 요구사항:**

> `prefixItems` 검증을 사용하려면 Draft 2020-12를 지원하는 AJV8 플러그인을 import하세요:
>
> ```tsx
> import { plugin } from '@canard/schema-form-ajv8-plugin/2020';
> ```

#### 배열 출력 필터 (omitTrailing / omitEmpty)

배열 스키마는 `options` 아래에 출력 필터를 지정할 수 있습니다. 이 필터는 배열이 **내보내는 값** — 부모 전파, 루트 validation, 외부 표면(`onChange`, `getValue()`, `submit`) — 만 정제하며, 자식 노드와 raw `node.value`는 모든 항목을 유지하므로 사용자가 추가한 빈 행이 그대로 렌더링됩니다:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    tags: {
      type: 'array',
      title: 'Tags',
      items: { type: 'string' },
      options: { omitTrailing: true },
    },
  },
};

// 사용자가 행 3개를 추가하고 첫 번째만 채우면
// onChange / getValue() / validation 값은: { tags: ['first'] }
// node.find('/tags').value는 ['first', undefined, undefined]로 유지
```

**주요 동작:**

- **`omitTrailing` (opt-in)**: **후행** 연속 `undefined` 항목만 제거합니다. 선행·중간 `undefined`는 보존되어 error `dataPath`와 validation index 정합이 유지됩니다 — `[1, undefined, 2]`는 그대로 방출됩니다.
- **`omitEmpty` (기본 활성)**: 빈 배열을 부모 전파 경로에서 `undefined`로 변환합니다. 필터 순서는 `omitTrailing → omitEmpty`라서 전부 빈 배열은 부모에서 `undefined`로 수렴합니다 (루트 폼은 `[]`를 방출).
- **값 2채널**: `node.value`는 raw를 유지하고, 정제된 출력은 `node.outputValue`로 노출됩니다. validation은 정제된 값 기준이라 후행 빈 항목은 `minItems`에 세지 않고, 선행·중간 빈 항목은 셉니다.
- **Reset 의미**: reset은 배열이 로드된 값을 되돌리며 `minItems`를 위해 항목을 만들지 않고, 일반 `setValue(undefined)`는 전부 비웁니다.
- **커스텀 입력**: 행 수는 `value.length`가 아니라 `node.children`(또는 `ChildFields`) 기준으로 세야 합니다 — 후행 행이 비어 있으면 방출 값이 렌더된 행보다 짧습니다.

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

### 사용자 정의 FieldInput 구성 요소

폼 기능을 확장하려면 사용자 정의 입력 컴포넌트를 생성할 수 있습니다:

```tsx
import React from 'react';

import { FieldInputDefinition, Form } from '@canard/schema-form';

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

// FieldInput 정의
const datePickerDefinition: FieldInputDefinition = {
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
      fieldInputDefinitions={[datePickerDefinition]}
    />
  );
};
```

### 조건부 필드와 Watch

#### 종류

아래 속성은 모두 `controls` 객체의 키입니다.

- `watch`: 다른 Node의 값을 구독할 수 있습니다. (watchValues 속성으로 전달됨)
- `derived`: JSONPointer 표현식을 사용하여 다른 필드 값을 참조해 자동으로 값을 계산합니다. `controls.derived` 속성을 사용합니다
- `active`: 해당 Node가 활성화될지 여부를 결정합니다. 활성화 되지 않은 Node의 Input은 표시되지 않으며 그 값은 제거됩니다.
- `visible`: 해당 Node가 표시될지 여부를 결정합니다. Input의 표시 여부를 결정합니다.
- `resetInteraction`: 해당 Node의 상호작용 상태를 초기화합니다. 표현식이 `false`에서 `true`로 바뀌면 Node의 `dirty`와 `touched` 상태를 비웁니다.
- `readOnly`: 해당 Node가 읽기 전용일지 여부를 결정합니다. readOnly 상태인 경우 Input에서 값을 수정할 수 없습니다.
- `disabled`: 해당 Node가 비활성화될 때 표시될지 여부를 결정합니다. disabled 상태인 경우 Input에서 값을 수정할 수 없습니다.
- `oneOf`/`anyOf` 분기의 `active`, 또는 호스트의 `discriminator`: 표시할 분기를 선택합니다. 각 분기에 `controls.active` 표현식을 주거나, `controls.discriminator`에 속성 이름을 지정하고 각 분기에 그 속성의 `const`/`enum` 태그를 둡니다. ObjectNode 에서만 사용할 수 있습니다. 두 게이트가 모두 없으면 모든 분기가 켜집니다. 모든 분기의 필드가 존재하며 어느 분기가 맞는지는 검증기만 정합니다.

#### 계층 규칙

`controls`는 Node 자신, 그 Node를 가리키는 부모의 `controls.fields` 항목, 그 Node를 선언한 조각(예: `allOf` 항목)에 선언할 수 있습니다. 계층은 서로를 덮어쓰지 않고 합쳐집니다. 표준 `readOnly`와 `readOnly` / `disabled` 제어는 OR로, `visible`은 AND로 결합합니다.

`default`는 Node 자신의 `controls.default`, 부모의 `fields` 항목, 조각의 `controls.default`, 표준 `default` 순으로 우선합니다.

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
        controls: {
          watch: ['../employmentType'],
          active: '../employmentType !== null',
          visible: '../employmentType !== null',
        },
      },
    },
    oneOf: [
      {
        controls: {
          active: "./employmentType === 'fulltime'",
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
        controls: {
          active: "./employmentType === 'parttime'",
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
        controls: {
          active: "./employmentType === 'contractor'",
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
            controls: {
              active: '../contractType === "hourly"',
            },
          },
        },
      },
    ],
  } satisfies JSONSchema;

  return <Form jsonSchema={jsonSchema} />;
};
```

### injectTo를 통한 값 주입

`injectTo` 기능은 폼 필드 간의 자동 값 전파를 가능하게 합니다. 소스 필드의 값이 변경되면 폼의 다른 필드에 파생된 값을 자동으로 주입할 수 있습니다.

#### 기본 사용법

JSON Schema의 `controls` 안에 타겟 경로와 값을 매핑하는 객체를 반환하는 `injectTo` 핸들러 함수를 정의합니다:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      title: '소스',
      controls: {
        injectTo: (value: string) => ({
          '../target': `주입됨: ${value}`,
        }),
      },
    },
    target: {
      type: 'string',
      title: '타겟 (자동 주입됨)',
    },
  },
};

// 사용자가 source 필드에 "안녕"을 입력하면,
// target 필드는 자동으로 "주입됨: 안녕"이 됩니다
```

#### 경로 유형

`injectTo`는 상대 경로와 절대 경로 모두 지원합니다:

**상대 경로** (현재 노드 기준):

```tsx
controls: {
  injectTo: (value) => ({
    '../sibling': value, // 형제 필드
    '../nested/child': value, // 중첩된 형제의 자식
    '../../uncle': value, // 부모의 형제
  }),
},
```

**절대 경로** (루트 기준):

```tsx
controls: {
  injectTo: (value) => ({
    '/rootField': value, // 루트 레벨 필드
    '/user/profile/name': value, // 깊이 중첩된 필드
  }),
},
```

#### 다중 타겟

여러 필드에 동시에 주입:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    fullName: {
      type: 'string',
      controls: {
        injectTo: (value: string) => ({
          '../displayName': value,
          '../searchName': value.toLowerCase(),
          '../initials': value
            .split(' ')
            .map((n) => n[0])
            .join(''),
        }),
      },
    },
    displayName: { type: 'string' },
    searchName: { type: 'string' },
    initials: { type: 'string' },
  },
};
```

#### 배열 형식

동적 경로나 순서가 중요한 경우 배열 형식을 사용합니다:

```tsx
controls: {
  injectTo: (value: number) => [
    ['/calculations/doubled', value * 2],
    ['/calculations/squared', value * value],
  ],
},
```

#### 컨텍스트 접근

핸들러는 부모 값, 루트 폼 값, 사용자 정의 컨텍스트에 접근할 수 있는 컨텍스트 객체를 받습니다:

```tsx
import type { InjectToHandler } from '@canard/schema-form';

const handler: InjectToHandler<string> = (value, ctx) => {
  // ctx.dataPath - 현재 노드의 JSON Pointer 경로
  // ctx.schemaPath - 현재 노드의 스키마 경로
  // ctx.jsonSchema - 현재 노드의 JSON Schema
  // ctx.parentValue - 부모 노드의 값 (루트인 경우 null)
  // ctx.parentJSONSchema - 부모의 JSON Schema (루트인 경우 null)
  // ctx.rootValue - 전체 폼 값
  // ctx.rootJSONSchema - 루트 JSON Schema
  // ctx.context - Form에 전달된 사용자 정의 컨텍스트

  // 부모 값에 따른 조건부 주입
  if (ctx.parentValue?.locked) {
    return null; // 주입 건너뛰기
  }

  // 루트 폼 값을 사용한 계산
  return {
    '/total': ctx.rootValue.baseAmount + parseFloat(value),
  };
};
```

#### Form 컨텍스트 사용

조건부 주입을 위해 폼 전역 컨텍스트 데이터에 접근:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    secretField: {
      type: 'string',
      controls: {
        injectTo: (value, ctx) => {
          // admin 사용자에게만 주입
          if (ctx.context.userRole === 'admin') {
            return { '/adminCopy': value };
          }
          return null;
        },
      },
    },
  },
};

// Form에 컨텍스트 전달
<Form jsonSchema={jsonSchema} context={{ userRole: 'admin' }} />;
```

#### 순환 참조

주입 순환은 감지하지 않습니다. 각 정착은 소스 값이 더 바뀌지 않을 때까지 규칙을 다시 실행하며, 최대 25라운드까지 반복합니다:

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    fieldA: {
      type: 'string',
      controls: {
        injectTo: (value) => ({ '../fieldB': `A에서: ${value}` }),
      },
    },
    fieldB: {
      type: 'string',
      controls: {
        injectTo: (value) => ({ '../fieldA': `B에서: ${value}` }),
      },
    },
  },
};

// 사용자가 fieldA에 입력:
// 1. fieldA → fieldB, 이어서 fieldB → fieldA로 이어지며 매 홉이 새 값을 만듭니다
// 2. 25라운드 뒤 정착이 예산을 초과합니다
```

같은 값이 되돌아오는 순환은 스스로 멈춥니다. 위 예제처럼 계속 새 값을 만드는 순환은 예산을 초과합니다. 호출자의 쓰기는 유지되고, 그 정착의 모든 자동 쓰기는 되돌려지며, `diagnostics`는 `exceededBudget: 'derive'`인 `degraded`가 되고 쓰기는 예외를 던집니다. 주입 체인은 순환 없는 그래프로 설계하세요.

#### 에러 처리

`injectTo` 핸들러가 예외를 던지면 그 규칙은 해당 라운드에서 건너뛰고, 정착은 `cause: 'expression'`인 `degraded`가 되며, 쓰기는 코드 `EXPRESSION_THREW`인 `SchemaFormError`를 던지며 끝납니다:

```tsx
controls: {
  injectTo: (value) => {
    if (!value) {
      throw new Error('값이 필요합니다');
    }
    return { '../target': value };
  },
},

// 그 규칙은 해당 라운드에서 건너뛰고 정착은 degraded가 되며,
// 쓰기는 SchemaFormError(EXPRESSION_THREW)를 던집니다
```

#### TypeScript 지원

제네릭을 통한 완전한 타입 안전성:

```tsx
import type { InjectToHandler } from '@canard/schema-form';

interface FormContext {
  userId: string;
  permissions: string[];
}

const typedHandler: InjectToHandler<
  string, // Value 타입
  ParentType, // 부모 값 타입
  RootType, // 루트 폼 값 타입
  FormContext // 컨텍스트 타입
> = (value, ctx) => {
  // ctx.context는 FormContext 타입으로 지정됨
  if (ctx.context.permissions.includes('write')) {
    return { '/audit/lastModifiedBy': ctx.context.userId };
  }
  return null;
};
```

---

### 폼 제출 관리

`@canard/schema-form`은 폼 제출 상태를 효과적으로 관리할 수 있는 다양한 방법을 제공합니다.

#### onSubmit 사용하기

`onSubmit` prop을 사용하여 폼 제출 로직을 정의할 수 있습니다:

```tsx
import React, { useState } from 'react';

import {
  Form,
  type ValidationIssue,
  isValidationError,
} from '@canard/schema-form';

export const FormWithSubmit = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string', title: '이름' },
      email: { type: 'string', format: 'email', title: '이메일' },
    },
    required: ['name', 'email'],
  };

  const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);

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
  type ValidationIssue,
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
  const [errors, setErrors] = useState<readonly ValidationIssue[]>([]);

  // 비동기 제출 핸들러
  const handleSubmit = async (value: any) => {
    // 서버 요청 시뮬레이션
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log('제출된 데이터:', value);
  };

  // 제출 상태 관리
  const { submit, pending } = useFormSubmit(formRef);

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
        disabled={pending}
        style={{ marginTop: '16px' }}
      >
        {pending ? '제출 중...' : '제출'}
      </button>

      {pending && (
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

Enter는 Form의 `form` 요소를 통해 제출합니다. 텍스트류 필드가 둘 이상이면 브라우저는 폼에 제출 버튼이 있을 때만 Enter로 제출합니다(암묵적 제출은 이를 막는 필드만 세므로, 텍스트 필드 하나와 체크박스 하나는 그대로 제출됩니다).

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

  const { submit, pending } = useFormSubmit(formRef);

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
        disabled={pending}
        style={{ marginTop: '16px' }}
      >
        {pending ? '로그인 중...' : '로그인'}
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

2. **FieldInput 캐싱**:
   자주 사용하는 커스텀 FieldInput을 컴포넌트 외부에서 정의하여 불필요한 재생성을 방지합니다.

```jsx
// 전역에서 한 번 정의
const CUSTOM_INPUTS = [
  { test: { type: ['string'], format: ['email'] }, Component: EmailInput },
];

// 컴포넌트 내에서 재사용
<Form jsonSchema={jsonSchema} fieldInputDefinitions={CUSTOM_INPUTS} />;
```

---

## TypeScript 지원

`@canard/schema-form`은 TypeScript로 구축되었으며 포괄적인 유형 정의를 제공합니다. 주요 유형 유틸리티에는 다음과 같습니다:

- `InferValueType<Schema>`: JSON Schema에서 값 유형을 추론합니다
- `InferFieldNode<Schema>`: JSON Schema에서 필드 노드 유형을 추론합니다
- `FormHandle<Schema, Value>`: 스키마 특정 메서드를 가진 양식 참조 핸들러의 유형

### `InferValueType`이 보장하는 것

스키마에 `as const`를 붙이세요. 없으면 `type: 'object'`가 `string`으로 넓어져 추론이 `any`로 떨어집니다.

`as const`가 있으면 `InferValueType`이 `properties`와 `items`를 재귀 순회해, 선언된 필드에 실제 타입이 붙습니다:

```typescript
const jsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
  },
  required: ['name'],
} as const;

type Value = InferValueType<typeof jsonSchema>;
// { name?: string; tags?: string[] } & Record<string, any>
```

이 결과에는 의도된 성질이 세 가지 있습니다:

- **`required`에 있는 필드까지 포함해 모든 필드가 optional입니다.** 폼은 런타임에 필드를 값에서 제외할 수 있습니다 — `controls.active`가 false인 분기, `options.omitEmpty` 등. 필수로 표시하면 `value.name.trim()`이 컴파일을 통과한 뒤 터집니다.
- **스키마가 `additionalProperties: false`를 지정하지 않는 한 객체 타입은 열려 있습니다.** JSON Schema의 기본값이 그렇습니다. 이 덕분에 `oneOf`/`anyOf` 분기, `if`/`then`/`else`, `patternProperties`가 기여하는 키가 초과 속성으로 거부되지 않습니다. `additionalProperties: false`를 지정하면 추론 타입이 닫혀서 오타를 잡아줍니다.
- **nullable 스키마에는 `| null`이 붙습니다.** 타입 배열(`type: ['string', 'null']`)과 `nullable: true` 키워드 모두 `T | null`을 만듭니다. 런타임이 nullable 노드에 `null`을 허용하므로, `null`을 거부하는 타입은 폼이 정상 처리하는 `setValue({ field: null })`을 컴파일 실패로 만듭니다.

`nullable: true`는 공식 지원하는 OpenAPI 3.0 호환 표기입니다. `type`에 `'null'`을 추가하는 것과 동등하여, `{ type: 'string', nullable: true }`는 `{ type: ['string', 'null'] }`를 뜻합니다. 이 표기를 사용해도 경고나 오류가 발생하지 않습니다.

### 값 타입을 직접 정의해 주입하기

`InferValueType`은 어디까지나 기본값입니다. 정확한 형태를 알고 있다면 직접 정의해 두 번째 타입 인자로 넘기세요. 추론은 폼이 실제로 어떤 필드를 유지하는지 알 수 없지만, 작성자는 알고 있습니다:

```typescript
interface SignUpValue {
  name: string;
  tags?: string[];
}

<Form<typeof jsonSchema, SignUpValue>
  jsonSchema={jsonSchema}
  onChange={(value) => value.name.trim()} // value: SignUpValue
/>;

const formRef = useRef<FormHandle<typeof jsonSchema, SignUpValue>>(null);
```

`defaultValue`를 넘기면 그 값으로부터도 `Value`가 추론되므로, 명시적 타입 인자가 항상 필요하지는 않습니다.

---

## 마이그레이션 (1.0.0)

1.0.0은 스키마 설정을 `presentation`·`controls`·`options` 세 묶음으로 옮기고, 공개 API 이름을 "field" 중심으로 다시 짓고, 노드 엔진을 교체합니다. 옛 이름은 별칭으로도 남지 않습니다. 스키마, 컴포넌트와 형 import, 노드 상태나 검증 오류를 읽는 코드 순서로 고치세요.

> **옛 스키마 키는 오류 없이 무시됩니다.** 제거된 최상위 키(`formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `computed`, `&` 접두어 키, `terminal`, `virtual`, `propertyKeys`, `injectTo`, `errorMessages`, `placeholder`)는 오류도 경고도 없이 무시됩니다. 이는 의도된 것입니다. 1.0.0은 0.16과의 단절이므로 이 키들에는 별칭도 개발 경고도 두지 않으며, 이주할 때 키마다 직접 옮겨야 합니다. 이런 키가 남은 스키마도 화면은 그려지지만 조건, 파생 값, 입력 선택이 동작하지 않으니, 아래 표의 키를 스키마에서 모두 찾아 바꾸세요. 새 묶음 안에서는 규칙이 다릅니다. `controls`와 `options` 안의 모르는 키는 폼을 만들 때 `UNKNOWN_GROUP_KEY`를 던지고, `presentation`은 어떤 키든 받는 열린 묶음입니다.

### 스키마 키

| 0.16                                                                   | 1.0.0                                                                    |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `formType`                                                             | `presentation.inputType`                                                 |
| `FormTypeInput`                                                        | `presentation.FieldInput`                                                |
| `FormTypeInputProps` (`placeholder`, `alias`, `className`, `style` 등) | `presentation.FieldInputProps`                                           |
| `FormTypeRendererProps` (`label`, `className`, `style` 등)             | `presentation.FieldRendererProps`                                        |
| `errorMessages`                                                        | `presentation.errorMessages`                                             |
| `computed.active` / `&active`                                          | `controls.active`                                                        |
| `computed.visible` / `&visible`                                        | `controls.visible`                                                       |
| `computed.readOnly` / `&readOnly`                                      | `controls.readOnly`                                                      |
| `computed.disabled` / `&disabled`                                      | `controls.disabled`                                                      |
| `computed.derived` / `&derived`                                        | `controls.derived`                                                       |
| `computed.watch` / `&watch` (문자열 또는 배열)                         | `controls.watch` (배열만)                                                |
| `computed.pristine` / `&pristine`                                      | `controls.resetInteraction` (조건이 참으로 바뀔 때 dirty·touched 초기화) |
| `oneOf` / `anyOf` 분기의 `computed.if` / `&if`                         | 그 분기의 `controls.active`                                              |
| `injectTo`                                                             | `controls.injectTo` (핸들러 모양은 같음)                                 |
| `terminal`                                                             | `options.terminal` (객체·배열 스키마)                                    |
| `propertyKeys` (객체)                                                  | `options.propertyOrder` (출력 값의 키 순서)                              |
| `virtual` (객체)와 `type: 'virtual'`                                   | `options.virtual: { <이름>: { fields: [...] } }` (객체 스키마)           |

```ts
// 0.16
{
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['a', 'b'], formType: 'radio' },
    note: {
      type: 'string',
      FormTypeInputProps: { placeholder: 'Note' },
      computed: { visible: '../kind === "b"' },
    },
  },
}

// 1.0.0
{
  type: 'object',
  properties: {
    kind: { type: 'string', enum: ['a', 'b'], presentation: { inputType: 'radio' } },
    note: {
      type: 'string',
      presentation: { FieldInputProps: { placeholder: 'Note' } },
      controls: { visible: '../kind === "b"' },
    },
  },
}
```

- `controls`에는 0.16에 없던 키도 있습니다: `default`, `unsetValue`, `unsetOnInactive`, `fields`(이름으로 지정한 하위 필드의 controls), `discriminator`.
- `options`는 `omitEmpty`, `trim`(문자열), `omitTrailing`(배열), `terminal`(객체·배열), `propertyOrder`·`virtual`(객체)만 받습니다. `min`·`max` 같은 입력 설정은 `presentation.FieldInputProps`에 두세요.

### 이름이 바뀐 API

| 0.16                                                                                                                                                                      | 1.0.0                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Form prop `formTypeInputDefinitions`                                                                                                                                      | `fieldInputDefinitions`                                                                                                                                        |
| Form prop `formTypeInputMap`                                                                                                                                              | `fieldInputMap`                                                                                                                                                |
| Form prop `CustomFormTypeRenderer`                                                                                                                                        | `FieldRenderer` (Form은 `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer`도 받음)                                                                  |
| 플러그인 키 `FormGroup`, `FormLabel`, `FormInput`, `FormError`                                                                                                            | `FieldRenderer`, `FormLabelRenderer`, `FormInputRenderer`, `FormErrorRenderer`                                                                                 |
| 플러그인 키 `formTypeInputDefinitions`                                                                                                                                    | `fieldInputDefinitions`                                                                                                                                        |
| `Form.Group`, `FormGroupProps`                                                                                                                                            | `Form.Field`, `FormFieldProps`                                                                                                                                 |
| `FormTypeInputDefinition`, `FormTypeInputMap`, `FormTypeInputProps`, `FormTypeInputPropsWithNode`, `FormTypeInputPropsWithSchema`, `FormTypeTestFn`, `FormTypeTestObject` | `FieldInputDefinition`, `FieldInputMap`, `FieldInputProps`, `FieldInputPropsWithNode`, `FieldInputPropsWithSchema`, `FieldInputTestFn`, `FieldInputTestObject` |
| `FormTypeRendererProps`                                                                                                                                                   | `FieldRendererProps`                                                                                                                                           |
| `Hint`                                                                                                                                                                    | `FieldInputHint` (키는 `inputType`)                                                                                                                            |
| `FormTypeInputProps.FormTypeRenderer`                                                                                                                                     | `FieldInputProps.FieldRenderer`                                                                                                                                |
| `FormTypeInputProps.ChildNodeComponents`                                                                                                                                  | `FieldInputProps.ChildFields` (각 항목은 `ChildField`)                                                                                                         |
| `ChildNodeComponentProps`, `useChildNodeComponentMap`, `useChildNodeErrors`                                                                                               | `ChildFieldProps`, `useChildFieldMap`, `useChildFieldErrors`                                                                                                   |
| `SchemaNode`, `InferSchemaNode`, `isSchemaNode`                                                                                                                           | `FieldNode`, `InferFieldNode`, `isFieldNode`                                                                                                                   |
| `NodeState`                                                                                                                                                               | `FieldNodeState`                                                                                                                                               |
| `NodeState.ShowError`                                                                                                                                                     | `FieldNodeState.ErrorVisible` (같은 비트)                                                                                                                      |
| `NodeEventType`                                                                                                                                                           | `FieldNodeEventType` (`UpdateValue`, `UpdateState`, `UpdateError`, `RequestFocus`, `RequestSelect`, `RequestRemount`는 그대로이고 이벤트가 더 공개됨)          |
| `useSchemaNodeTracker`, `useSchemaNodeSubscribe`, `SchemaNodeSubscribeOptions`                                                                                            | `useFieldNodeTracker`, `useFieldNodeSubscribe`, `FieldNodeSubscribeOptions`                                                                                    |
| 형 `JSONSchemaError` (`errors` prop과 `onValidate` 인자)                                                                                                                  | `ValidationIssue` (필드는 같고 선택 필드 `rejectedKey` 추가, `isJSONSchemaError`는 유지)                                                                       |

- 이름이 바뀐 것은 노드 상태 비트뿐입니다. `ShowError` 정책 enum(`Dirty`, `Touched`, `DirtyTouched` 등), Form의 `showError` prop, `FormHandle.showError()`는 이름이 그대로입니다.

### 동작 변경

- **불러온 `null`이나 종류가 다른 값 아래의 자식 필드는 채워지지 않습니다.** 객체나 배열 필드가 `defaultValue`, 불러오기, `reset`, `resetSubtree`로 `null`이나 종류가 다른 값(예: 객체 자리에 문자열)을 받으면, 직접 `null`을 쓸 때와 똑같이 자식 필드에 기본값이 채워지지 않습니다. 자식에 입력하면 부모가 객체로 승격되고, 그 승격으로 새로 생긴 필드만 기본값을 받습니다. `derived`와 `injectTo` 값은 그대로 보입니다. 기본값이 필요하면 `null` 대신 값이 든 객체를 불러오거나 객체 자체에 `default`를 주세요. 객체 스키마에 `<Form defaultValue={null}>`을 줄 때도 같습니다.
- **enum select는 `undefined`를 선택 없음으로 보여 줍니다.** 기본 문자열 enum select는 값이 `undefined`이면 맨 앞에 선택된 빈 비활성 선택지를 보여 주며, enum에 `''`가 있어도 같습니다. enum 밖의 값은 지금처럼 맨 앞 비활성 선택지로 보입니다.
- **체크박스와 라디오 선택지 id에 순번이 붙습니다.** 각 선택지의 `id`는 이제 `${path}-${index}`이고, 레이블의 `htmlFor`도 같이 바뀝니다. 이 입력을 `#<path>`로 찾던 선택자는 고쳐야 합니다. 기본 렌더러의 label과 `Form.Label`은 항상 `htmlFor={path}`와 `id="label:${path}"`를 둘 다 가지며, branch의 legend는 id만 가집니다. 라벨을 그리는 곳은 어떤 입력이 선택되었는지 알 수 없기 때문입니다. 입력 id는 루트에서 빈 문자열이고 나머지는 `/`로 시작하므로, `label:` 접두어는 어떤 입력 id와도 겹치지 않습니다. 내장 checkbox·radio의 선택지 컨테이너는 `role="group"`과 `aria-labelledby="label:${path}"`를 가지므로 묶음을 제목으로 찾을 수 있습니다(`getByRole('group', { name })`). 이런 묶음에서는 `htmlFor`가 가리키는 요소가 없지만 해롭지 않습니다. 사용자 `FieldInput`과 `FieldRenderer`도 같은 규약을 따릅니다. 단일 입력은 `id={path}`를 달아 제목과 연결하고, 묶음 컨테이너는 `aria-labelledby`로 `label:${path}`를 참조합니다. 기본 렌더러에서 checkbox 배열은 같은 legend로 이름 붙은 fieldset이기도 하므로, 그 fieldset 안에서 찾으세요. `id="label:${path}"`를 가진 제목을 그리지 않는 자리(루트, 배열 항목, `Form.Label` 없는 `Form.Input`, 그 id를 빠뜨린 사용자·플러그인 렌더러)에서는 묶음 컨테이너의 `aria-labelledby`가 가리킬 대상이 없으므로 렌더러가 묶음의 이름을 직접 주어야 합니다. `Form.Label`은 두 속성을 `path` prop 그대로 만들므로, 입력·묶음과 맞으려면 절대 경로(`size`나 `./size`가 아닌 `/size`)를 넘기세요.
- **`oneOf` / `anyOf` 분기를 더 이상 `const` 태그로 고르지 않습니다.** 분기끼리 `const` 태그만 다르면 호스트에 `controls.discriminator: '<속성>'`을 선언하거나 각 분기에 `controls.active`를 선언하세요. 둘 다 없으면 모든 분기가 활성 상태로 남습니다.
- **직접 만든 검증기 플러그인은 `compileGuard`를 구현해야 합니다.** `ValidatorPlugin`은 이제 `compile` 옆에 `compileGuard(root, pointer)`가 필요하고, `release(root)`는 선택입니다. 공식 ajv6·ajv7·ajv8 플러그인은 이미 구현되어 있습니다.

`onValidate`는 0.16과 같이 동작합니다. 보고할 오류 목록이나 `errors` prop이 바뀔 때 호출되고, 결과가 같은 재검증에서는 호출되지 않습니다.

### `nullable: true`

`nullable: true`는 공식 지원 표기입니다. OpenAPI 3.0 표기이며 `type`에 `'null'`을 더한 것(`type: ['string', 'null']`)과 같습니다. 경고도 나지 않습니다.

---

## 마이그레이션 (0.16.0)

0.16.0은 0.15.0이 이전 대소문자 혼용 이름을 위해 남겨 둔 deprecated 별칭을 제거합니다. `JSONSchemaError`, `isJSONSchemaError`, `JSONSchema`, `InferJSONSchema`를 사용하세요. `injectTo` 핸들러는 스키마를 `parentJSONSchema`, `rootJSONSchema`로만 받습니다.

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
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

// Ant Design 플러그인 등록
registerPlugin(antd5Plugin);

export const AntdForm = () => {
  const jsonSchema = {
    //...
  };
  // 플러그인에 지정된 matching 조건에 따라 컴포넌트가 자동으로 선택됩니다.
  return <Form jsonSchema={jsonSchema} />;
};
```
