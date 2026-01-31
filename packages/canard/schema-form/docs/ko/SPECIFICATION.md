# @canard/schema-form 스펙 문서

> JSON Schema 기반 React 폼 렌더링 라이브러리

## 개요

`@canard/schema-form`은 다음 기능을 제공하는 React 기반 폼 라이브러리입니다:

- **JSON Schema 기반 렌더링**: JSON Schema를 기반으로 자동 폼 생성
- **플러그인 기반 검증**: AJV 6/7/8 플러그인을 통한 유연한 검증 시스템
- **FormTypeInput 시스템**: 우선순위 기반 컴포넌트 선택
- **Computed Properties**: 조건부 필드, 파생 값, 반응형 로직
- **조건부 스키마**: oneOf, anyOf, allOf, if-then-else 지원
- **TypeScript 지원**: 완전한 타입 추론 및 타입 안전성

---

## 목차

1. [설치](#설치)
2. [빠른 시작](#빠른-시작)
3. [아키텍처](#아키텍처)
4. [핵심 API](#핵심-api)
   - [FormProps](#formprops)
   - [FormHandle](#formhandle)
5. [노드 시스템](#노드-시스템)
6. [FormTypeInput 시스템](#formtypeinput-시스템)
7. [Computed Properties](#computed-properties)
8. [조건부 스키마](#조건부-스키마)
9. [JSONPointer 시스템](#jsonpointer-시스템)
10. [검증 시스템](#검증-시스템)
11. [플러그인 시스템](#플러그인-시스템)
12. [고급 기능](#고급-기능)
13. [타입 정의](#타입-정의)

---

## 설치

```bash
# yarn 사용
yarn add @canard/schema-form

# Validator 플러그인 설치 (필수)
yarn add @canard/schema-form-ajv8-plugin
# 또는 AJV 7.x
yarn add @canard/schema-form-ajv7-plugin
# 또는 AJV 6.x
yarn add @canard/schema-form-ajv6-plugin
```

### 피어 의존성

- React 18-19
- React DOM 18-19

### 호환성

- Node.js 16.11.0 이상
- 최신 브라우저 (Chrome 94+, Firefox 93+, Safari 15+)

---

## 빠른 시작

### 1. 플러그인 등록

```tsx
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 앱 시작 시 한 번 등록
registerPlugin(ajvValidatorPlugin);
```

### 2. 기본 사용법

```tsx
import { Form } from '@canard/schema-form';
import { useState } from 'react';

export const App = () => {
  const jsonSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'number' },
    },
  };

  const [value, setValue] = useState({ name: '', age: 0 });

  return (
    <Form
      jsonSchema={jsonSchema}
      defaultValue={value}
      onChange={setValue}
    />
  );
};
```

---

## 아키텍처

### 계층 구조

```
┌─────────────────────────────────────────────────────────────┐
│                     애플리케이션                              │
├─────────────────────────────────────────────────────────────┤
│  Form Component                                             │
│  └── JSON Schema 기반 폼 렌더링                               │
├─────────────────────────────────────────────────────────────┤
│  Node System                                                │
│  ├── Terminal Nodes (String, Number, Boolean, Null)         │
│  ├── Branch Nodes (Object, Array)                           │
│  └── Virtual Node (조건부/계산 필드)                          │
├─────────────────────────────────────────────────────────────┤
│  FormTypeInput System                                       │
│  └── 우선순위 기반 컴포넌트 선택                               │
├─────────────────────────────────────────────────────────────┤
│  Plugin System                                              │
│  ├── Validator Plugins (AJV 6/7/8)                          │
│  └── UI Plugins (Ant Design, MUI 등)                        │
└─────────────────────────────────────────────────────────────┘
```

### 디자인 패턴

| 패턴 | 용도 |
|------|------|
| **Strategy Pattern** | Array/Object 노드의 Branch/Terminal 전략 |
| **Factory Pattern** | JSON Schema에서 노드 생성 |
| **Observer Pattern** | 노드 상태 변경 구독 |
| **Plugin Pattern** | 검증 및 UI 컴포넌트 확장 |

---

## 핵심 API

### FormProps

```typescript
interface FormProps<
  Schema extends JsonSchema = JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 이 SchemaForm에서 사용할 JSON Schema */
  jsonSchema: Schema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value;
  /** 모든 FormTypeInput 컴포넌트에 readOnly 속성 적용 */
  readOnly?: boolean;
  /** 모든 FormTypeInput 컴포넌트에 disabled 속성 적용 */
  disabled?: boolean;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: SetStateFn<Value>;
  /** 이 SchemaForm이 검증될 때 호출되는 함수 */
  onValidate?: Fn<[jsonSchemaError: JsonSchemaError[]]>;
  /** 폼이 제출될 때 호출되는 함수 */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** 이 SchemaForm의 상태가 변경될 때 호출되는 함수 */
  onStateChange?: Fn<[state: NodeStateFlags]>;
  /** FormTypeInput 정의 목록 */
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  /** FormTypeInput 경로 매핑 */
  formTypeInputMap?: FormTypeInputMap;
  /** 커스텀 폼 타입 렌더러 컴포넌트 */
  CustomFormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  /** 초기 검증 오류, 기본값은 undefined */
  errors?: JsonSchemaError[];
  /** 커스텀 오류 포맷 함수 */
  formatError?: FormTypeRendererProps['formatError'];
  /**
   * 오류 표시 조건 (기본값: ShowError.DirtyTouched)
   *   - `true`: 항상 표시
   *   - `false`: 표시 안함
   *   - `ShowError.Dirty`: 값이 변경되었을 때 표시
   *   - `ShowError.Touched`: 입력에 포커스가 있었을 때 표시
   *   - `ShowError.DirtyTouched`: Dirty와 Touched 조건 모두 충족 시 표시
   */
  showError?: boolean | ShowError;
  /**
   * 검증 실행 모드 (기본값: ValidationMode.OnChange | ValidationMode.OnRequest)
   *  - `ValidationMode.None`: 검증 비활성화
   *  - `ValidationMode.OnChange`: 값 변경 시 검증
   *  - `ValidationMode.OnRequest`: 요청 시 검증
   */
  validationMode?: ValidationMode;
  /** 커스텀 ValidatorFactory 함수 */
  validatorFactory?: ValidatorFactory;
  /** 사용자 정의 context */
  context?: Dictionary;
  /** 자식 컴포넌트 */
  children?:
    | ReactNode
    | Fn<[props: FormChildrenProps<Schema, Value>], ReactNode>;
}
```

### FormHandle

```typescript
interface FormHandle<
  Schema extends JsonSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 루트 노드 */
  node?: InferSchemaNode<Schema>;
  /** 특정 경로의 입력 필드에 포커스 */
  focus: Fn<[dataPath: SchemaNode['path']]>;
  /** 특정 경로의 입력 필드 선택 */
  select: Fn<[dataPath: SchemaNode['path']]>;
  /** 폼 초기화 */
  reset: Fn;
  /** 경로로 노드 찾기 */
  findNode: Fn<[path: SchemaNode['path']], SchemaNode | null>;
  /** 경로로 여러 노드 찾기 */
  findNodes: Fn<[path: SchemaNode['path']], SchemaNode[]>;
  /** 현재 상태 가져오기 */
  getState: Fn<[], NodeStateFlags>;
  /** 상태 설정 */
  setState: Fn<[state: NodeStateFlags]>;
  /** 상태 초기화 */
  clearState: Fn;
  /** 현재 값 가져오기 */
  getValue: Fn<[], Value>;
  /** 값 설정 */
  setValue: SetStateFnWithOptions<Value>;
  /** 현재 오류 가져오기 */
  getErrors: Fn<[], JsonSchemaError[]>;
  /** 첨부 파일 맵 가져오기 */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  /** 검증 실행 */
  validate: Fn<[], Promise<JsonSchemaError[]>>;
  /** 오류 표시 설정 */
  showError: Fn<[visible: boolean]>;
  /** 폼 제출 */
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```

### FormChildrenProps

```typescript
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

### AttachedFilesMap

```typescript
// JSONPointer 경로 키로 File[]을 저장 (예: "/attachment" 또는 "/items/0/file")
type AttachedFilesMap = Map<string, File[]>;
```

---

## 노드 시스템

### 노드 타입

**Terminal Nodes** (원시 값):

| 노드 | 설명 |
|------|------|
| `StringNode` | 문자열 값, format 검증 지원 (email, date 등) |
| `NumberNode` | 숫자 값, min/max 제약, 정수 강제 |
| `BooleanNode` | 불리언 값 |
| `NullNode` | 명시적 null 값 |

**Branch Nodes** (컨테이너 구조):

| 노드 | 설명 |
|------|------|
| `ObjectNode` | 키-값 구조, `required`, `additionalProperties` 지원 |
| `ArrayNode` | 순서가 있는 컬렉션, `minItems`, `maxItems`, 배열 조작 메서드 |

**Special Nodes**:

| 노드 | 설명 |
|------|------|
| `VirtualNode` | 조건부 필드 및 계산된 값을 위한 비스키마 노드 |

### 노드 초기화

```typescript
const node = nodeFromJsonSchema({
  jsonSchema: { type: 'object', properties: { name: { type: 'string' } } },
  onChange: (value) => console.log('Form value changed:', value)
});

await delay(); // 초기화 완료 대기
```

### 노드 상태 플래그

```typescript
node.dirty;        // 초기화 이후 값이 변경되었는가?
node.touched;      // 사용자가 이 필드와 상호작용했는가?
node.validated;    // 검증이 실행되었는가?
node.errors;       // 현재 검증 오류
node.visible;      // 필드가 보이는가? (computed property)
node.active;       // 필드가 활성 상태인가? (computed property)
node.readOnly;     // 필드가 읽기 전용인가? (computed property)
node.disabled;     // 필드가 비활성화되었는가? (computed property)
node.initialized;  // 노드가 초기화를 완료했는가?
```

---

## FormTypeInput 시스템

### FormTypeInputDefinition

```typescript
type FormTypeInputDefinition<T = unknown> = {
  test: FormTypeTestFn | FormTypeTestObject;
  Component: ComponentType<InferFormTypeInputProps<T>>;
};
```

### 테스트 조건

```typescript
// 함수 형태
type FormTypeTestFn = Fn<[hint: Hint], boolean>;

// 객체 형태
type FormTypeTestObject = Partial<{
  type: Array<string>;
  jsonSchema: JsonSchema;
  format: Array<string>;
  formType: Array<string>;
  nullable: boolean;
  [alt: string]: any;
}>;

// Hint 객체
type Hint = {
  jsonSchema: JsonSchema;
  type: string;
  format: string;
  formType: string;
  path: string;
  nullable: boolean;
  [alt: string]: any;
};
```

### FormTypeInputProps

```typescript
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  jsonSchema: Schema;           // FormTypeInput 컴포넌트의 JSON Schema
  readOnly: boolean;            // 읽기 전용 상태
  disabled: boolean;            // 비활성화 상태
  required: boolean;            // 필수 여부
  node: Node;                   // 스키마 노드
  type: Node['schemaType'];     // JSON Schema 타입
  name: Node['name'];           // 노드 이름
  path: Node['path'];           // 노드 경로
  nullable: Node['nullable'];   // null 허용 여부
  errors: Node['errors'];       // 검증 오류
  errorVisible: boolean;        // 오류 표시 여부
  watchValues: WatchValues;     // computed.watch로 구독 중인 값
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildNodeComponents: ChildNodeComponent[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: Context;
  [alt: string]: any;
}
```

### 선택 우선순위

FormTypeInput은 다음 우선순위로 선택됩니다 (높은 순):

1. **JSON Schema의 직접 할당**
   ```tsx
   { type: 'string', FormTypeInput: CustomInput }
   ```

2. **formTypeInputMap** (경로 기반)
   ```tsx
   <Form formTypeInputMap={{ '/email': EmailInput }} />
   ```

3. **Form의 formTypeInputDefinitions**
   ```tsx
   <Form formTypeInputDefinitions={[...]} />
   ```

4. **FormProvider의 formTypeInputDefinitions**
   ```tsx
   <FormProvider formTypeInputDefinitions={[...]} />
   ```

5. **플러그인의 formTypeInputDefinitions**
   ```tsx
   registerPlugin({ formTypeInputDefinitions: [...] })
   ```

### FormTypeInputMap

```typescript
type FormTypeInputMap = {
  [path: string]: ComponentType<FormTypeInputProps>;
};

// 와일드카드 지원
const formInputMap = {
  '/users/*/name': CustomNameInput,      // 배열 인덱스 매칭
  '/config/*/value': ConfigValueInput,   // 동적 키 매칭
};
```

---

## Computed Properties

### 속성 종류

```typescript
{
  type: 'string',
  computed: {
    watch: string | string[];     // 값 구독
    active: boolean | string;     // 활성화 (false면 값 제거)
    visible: boolean | string;    // 표시 (false면 값 유지)
    readOnly: boolean | string;   // 읽기 전용
    disabled: boolean | string;   // 비활성화
    pristine: boolean | string;   // 상태 초기화
    derived: string;              // 파생 값
  }
}
```

### 단축 문법

```typescript
{
  type: 'string',
  '&active': '../toggle === true',
  '&visible': "@.userRole === 'admin'",
  '&derived': '(../price ?? 0) * (../quantity ?? 0)',
  '&watch': ['../category', '../price'],
}
```

### 경로 참조

| 문법 | 의미 | 예시 |
|------|------|------|
| `../field` | 형제 필드 | `'../category === "A"'` |
| `../../field` | 부모의 형제 | `'../../parentField'` |
| `./field` | 현재 객체의 자식 | `'./nestedChild'` |
| `/field` | 절대 경로 (루트에서) | `'/rootField'` |
| `@.prop` | context 객체의 속성 | `'@.userRole === "admin"'` |

### 예제

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: ['standard', 'premium'],
    },
    premiumFeatures: {
      type: 'object',
      computed: {
        active: "../category === 'premium'",
        watch: '../category',
      },
      properties: {
        // premium 전용 필드들
      },
    },
    total: {
      type: 'number',
      '&derived': '(../price ?? 0) * (../quantity ?? 1)',
    },
  },
};
```

---

## 조건부 스키마

### oneOf (배타적 선택)

```typescript
{
  type: 'object',
  properties: {
    type: { type: 'string', enum: ['A', 'B'] }
  },
  oneOf: [
    {
      '&if': "./type === 'A'",
      properties: { fieldA: { type: 'string' } }
    },
    {
      '&if': "./type === 'B'",
      properties: { fieldB: { type: 'string' } }
    }
  ]
}
```

### anyOf (비배타적 선택)

```typescript
{
  type: 'object',
  properties: {
    hasFeature1: { type: 'boolean' },
    hasFeature2: { type: 'boolean' }
  },
  anyOf: [
    {
      '&if': './hasFeature1 === true',
      properties: { config1: { type: 'string' } }
    },
    {
      '&if': './hasFeature2 === true',
      properties: { config2: { type: 'string' } }
    }
  ]
}
```

### if-then-else

```typescript
{
  type: 'object',
  properties: {
    country: { type: 'string' }
  },
  if: { properties: { country: { const: 'KR' } } },
  then: { properties: { phone: { pattern: '^010-' } } },
  else: { properties: { phone: { pattern: '^\\+' } } }
}
```

### allOf (합성)

```typescript
{
  type: 'object',
  allOf: [
    { properties: { firstName: { type: 'string' } } },
    { properties: { lastName: { type: 'string' } } },
    { required: ['firstName', 'lastName'] }
  ]
}
```

---

## JSONPointer 시스템

### 표준 JSONPointer (RFC 6901)

```typescript
node.find('/path/to/field');     // 루트에서 절대 경로
node.find('./childField');       // 현재 노드에서 상대 경로
```

### 확장 문법

| 문법 | 의미 | 사용 가능 컨텍스트 |
|------|------|-------------------|
| `..` | 부모 탐색 | computed 속성, node.find() |
| `.` | 현재 노드 | computed 속성, node.find() |
| `*` | 와일드카드 | FormTypeInputMap만 |
| `@` | context 참조 | computed 속성만 |

### 이스케이프 규칙

- `~0` → `~`
- `~1` → `/`

```typescript
// 특수 문자가 있는 필드명: "field/with~special"
node.find('/field~1with~0special');
```

---

## 검증 시스템

### ValidationMode

```typescript
enum ValidationMode {
  None = 0,      // 검증 비활성화
  OnChange = 1,  // 값 변경 시 검증
  OnRequest = 2, // 요청 시 검증 (validate() 호출)
}

// 조합 가능
ValidationMode.OnChange | ValidationMode.OnRequest
```

### 오류 메시지 포맷팅

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      errorMessages: {
        minLength: '이름은 최소 {limit}자 이상이어야 합니다. 현재 값: {value}',
        required: '이름은 필수 입력 항목입니다.',
      },
    },
  },
  required: ['name'],
};
```

### 다국어 지원

```typescript
errorMessages: {
  minLength: {
    ko_KR: '이름은 최소 {limit}자 이상이어야 합니다.',
    en_US: 'Name must be at least {limit} characters.',
  },
}

// Form에서 context.locale 설정
<Form jsonSchema={schema} context={{ locale: 'ko_KR' }} />
```

---

## 플러그인 시스템

### 플러그인 등록

```tsx
import { registerPlugin } from '@canard/schema-form';
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';
import { plugin as antd5Plugin } from '@canard/schema-form-antd5-plugin';

registerPlugin(antd5Plugin);
registerPlugin(ajvValidatorPlugin);
```

### 사용 가능한 플러그인

**Validator 플러그인:**
- `@canard/schema-form-ajv8-plugin`: AJV 8.x (최신 JSON Schema 지원)
- `@canard/schema-form-ajv7-plugin`: AJV 7.x
- `@canard/schema-form-ajv6-plugin`: AJV 6.x

**UI 플러그인:**
- `@canard/schema-form-antd5-plugin`: Ant Design 5
- `@canard/schema-form-antd6-plugin`: Ant Design 6
- `@canard/schema-form-antd-mobile-plugin`: Ant Design Mobile
- `@canard/schema-form-mui-plugin`: Material UI

### 플러그인 인터페이스

```typescript
interface SchemaFormPlugin {
  FormGroup?: ComponentType<FormTypeRendererProps>;
  FormLabel?: ComponentType<FormTypeRendererProps>;
  FormInput?: ComponentType<FormTypeRendererProps>;
  FormError?: ComponentType<FormTypeRendererProps>;
  formTypeInputDefinitions?: FormTypeInputDefinition[];
  validator?: ValidatorPlugin;
  formatError?: FormatError;
}

interface ValidatorPlugin {
  bind: Fn<[instance: any]>;
  compile: ValidatorFactory;
}
```

---

## 고급 기능

### 커스텀 레이아웃 (Form.Render)

```tsx
<Form jsonSchema={jsonSchema}>
  <div className="custom-layout">
    <Form.Render path="/personalInfo/name">
      {({ Input, node }) => (
        <div className="form-field">
          <label>{node.jsonSchema.title}</label>
          <Input />
        </div>
      )}
    </Form.Render>
  </div>
</Form>
```

### 배열 조작

```tsx
const arrayNode = node.find('/items') as ArrayNode;

arrayNode.push();              // 기본값으로 항목 추가
arrayNode.push('custom');      // 커스텀 값으로 항목 추가
arrayNode.remove(index);       // 인덱스의 항목 제거
arrayNode.clear();             // 모든 항목 제거

arrayNode.length;              // 현재 항목 수
arrayNode.children;            // 자식 노드 배열
```

### Value Injection (injectTo)

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      injectTo: (value: string) => ({
        '../target': `injected: ${value}`,
      }),
    },
    target: { type: 'string' },
  },
};
```

### 파일 첨부

```tsx
const FileInput = ({ onFileAttach, onChange }) => {
  const handleChange = (e) => {
    const file = e.target.files[0];
    onFileAttach(file);
    onChange({
      name: file.name,
      size: file.size,
      type: file.type,
    });
  };

  return <input type="file" onChange={handleChange} />;
};

// 제출 시 파일 가져오기
const files = formRef.current.getAttachedFilesMap();
```

### 폼 제출

```tsx
import { useFormSubmit } from '@canard/schema-form';

const { submit, loading } = useFormSubmit(formRef);

const handleClick = async () => {
  try {
    await submit();
    alert('제출 완료!');
  } catch (error) {
    if (isValidationError(error)) {
      console.log('검증 실패:', error.details);
    }
  }
};
```

### children 함수 사용

`Form` 컴포넌트의 `children`을 함수로 전달하면 폼의 상태와 노드에 접근할 수 있습니다.

```tsx
<Form jsonSchema={jsonSchema} defaultValue={{ name: '', email: '' }}>
  {({ value, errors, node }) => (
    <div className="form-container">
      {/* 자동 생성된 폼 필드 */}
      <Form.Render />

      {/* 현재 폼 값 미리보기 */}
      <div className="preview">
        <h3>현재 입력 값:</h3>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>

      {/* 에러 요약 표시 */}
      {errors.length > 0 && (
        <div className="error-summary">
          <h3>검증 오류:</h3>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>{error.message}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 노드를 통한 프로그래매틱 제어 */}
      <button onClick={() => node?.find('/name')?.setValue('기본 이름')}>
        이름 초기화
      </button>
    </div>
  )}
</Form>
```

**children 함수 props:**

| prop | 타입 | 설명 |
|------|------|------|
| `value` | `InferValueType<Schema>` | 현재 폼 값 |
| `errors` | `JsonSchemaError[]` | 전체 검증 에러 목록 |
| `node` | `InferSchemaNode<Schema>` | 루트 노드 (프로그래매틱 접근용) |

---

## 타입 정의

### 타입 유틸리티

```typescript
import { InferValueType, InferSchemaNode, FormHandle } from '@canard/schema-form';

// 스키마에서 값 타입 추론
type FormValue = InferValueType<typeof jsonSchema>;

// 스키마에서 노드 타입 추론
type RootNode = InferSchemaNode<typeof jsonSchema>;

// 타입 안전한 폼 핸들
const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
```

### Nullable 스키마

```typescript
const schema = {
  type: 'object',
  properties: {
    // 필수 필드 (non-nullable)
    name: { type: 'string' },
    // 선택 필드 (nullable) - as const 사용
    nickname: { type: ['string', 'null'] as const },
  },
};

// FormTypeInput에서 nullable 조건
const definitions = [
  { test: { type: 'string', nullable: true }, component: NullableInput },
  { test: { type: 'string', nullable: false }, component: RequiredInput },
];
```

### 노드 타입 가드

```typescript
import { isArrayNode, isObjectNode, isVirtualNode } from '@canard/schema-form';

if (isArrayNode(node)) {
  node.push(); // ArrayNode 메서드 사용 가능
}
```

---

## 모범 사례

1. **플러그인을 앱 시작 시 등록** - 최상위 레벨에서 한 번만
2. **FormTypeInputDefinitions 캐싱** - 컴포넌트 외부에서 정의
3. **ValidationMode 최적화** - 필요에 따라 OnChange 또는 OnRequest 선택
4. **TypeScript as const 사용** - 스키마 타입 추론을 위해
5. **computed.watch 활용** - 반응형 폼 로직 구현
6. **Form.Render로 커스텀 레이아웃** - 복잡한 UI 요구사항 충족

---

## 라이선스

MIT License

---

## 버전

현재: package.json 참조
