# @canard/schema-form 스펙 문서

> JSON Schema 기반 React 폼 렌더링 라이브러리

## 개요

`@canard/schema-form`은 다음 기능을 제공하는 React 기반 폼 라이브러리입니다:

- **JSON Schema 기반 렌더링**: JSON Schema를 기반으로 자동 폼 생성
- **플러그인 기반 검증**: AJV 6/7/8 플러그인을 통한 유연한 검증 시스템
- **FieldInput 시스템**: 우선순위 기반 컴포넌트 선택
- **Controls**: 조건부 필드, 파생 값, 반응형 로직
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
6. [FieldInput 시스템](#fieldinput-시스템)
7. [Controls](#controls)
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
import { plugin as ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 앱 시작 시 한 번 등록
registerPlugin(ajvValidatorPlugin);
```

### 2. 기본 사용법

```tsx
import { useState } from 'react';

import { Form } from '@canard/schema-form';

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
    <Form jsonSchema={jsonSchema} defaultValue={value} onChange={setValue} />
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
│  └── Virtual Node (options.virtual 필드 묶음)                 │
├─────────────────────────────────────────────────────────────┤
│  FieldInput System                                       │
│  └── 우선순위 기반 컴포넌트 선택                               │
├─────────────────────────────────────────────────────────────┤
│  Plugin System                                              │
│  ├── Validator Plugins (AJV 6/7/8)                          │
│  └── UI Plugins (Ant Design, MUI 등)                        │
└─────────────────────────────────────────────────────────────┘
```

### 디자인 패턴

| 패턴                 | 용도                                     |
| -------------------- | ---------------------------------------- |
| **Strategy Pattern** | Array/Object 노드의 Branch/Terminal 전략 |
| **Factory Pattern**  | JSON Schema에서 노드 생성                |
| **Observer Pattern** | 노드 상태 변경 구독                      |
| **Plugin Pattern**   | 검증 및 UI 컴포넌트 확장                 |

---

## 핵심 API

### FormProps

```typescript
interface FormProps<
  Schema extends JSONSchema = JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 이 SchemaForm에서 사용할 JSON Schema */
  jsonSchema: Schema;
  /** 이 SchemaForm의 기본값 */
  defaultValue?: Value;
  /** 모든 FieldInput 컴포넌트에 readOnly 속성 적용 */
  readOnly?: boolean;
  /** 모든 FieldInput 컴포넌트에 disabled 속성 적용 */
  disabled?: boolean;
  /** 이 SchemaForm의 값이 변경될 때 호출되는 함수 */
  onChange?: SetStateFn<Value>;
  /** 이 SchemaForm이 검증될 때 호출되는 함수 */
  onValidate?: Fn<[errors: readonly ValidationIssue[]]>;
  /** 폼이 제출될 때 호출되는 함수 */
  onSubmit?: Fn<[value: Value], Promise<void> | void>;
  /** 이 SchemaForm의 상태가 변경될 때 호출되는 함수 */
  onStateChange?: Fn<[state: NodeStateFlags]>;
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
  errors?: readonly ValidationIssue[];
  /** 커스텀 오류 포맷 함수 */
  formatError?: FieldRendererProps['formatError'];
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
  /** 커스텀 검증기 객체(`compile`과 `compileGuard`); Form 속성 > FormProvider > 플러그인 */
  validatorFactory?: ValidatorFactory;
  /**
   * 대형 폼용 렌더 레벨 가상화(지연 마운트, 기본값: off)
   *  - `true`: 기본 옵션으로 활성화
   *  - `VirtualizationOptions`: 커스텀 옵션으로 활성화
   *  - 화면 밖 필드는 placeholder로 지연되고 뷰포트 근접·idle·focus/select 시 마운트
   *  - node tree는 항상 전량 생성 — 값/검증/제출은 영향 없음
   *  - CSR 전용: IntersectionObserver 필요, SSR/하이드레이션 앱에서 켜지 말 것(하이드레이션 mismatch)
   */
  virtualization?: boolean | VirtualizationOptions;
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
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  /** 루트 노드 */
  node?: InferFieldNode<Schema>;
  /** 특정 경로의 입력 필드에 포커스 */
  focus: Fn<[dataPath: FieldNode['path']]>;
  /** 특정 경로의 입력 필드 선택 */
  select: Fn<[dataPath: FieldNode['path']]>;
  /** 폼 초기화 */
  reset: Fn;
  /** 경로로 노드 찾기 */
  findNode: Fn<[path: FieldNode['path']], FieldNode | null>;
  /** 경로로 여러 노드 찾기 */
  findNodes: Fn<[path: FieldNode['path']], FieldNode[]>;
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
  getErrors: Fn<[], readonly ValidationIssue[]>;
  /** 첨부 파일 맵 가져오기 */
  getAttachedFilesMap: Fn<[], AttachedFilesMap>;
  /** 검증 실행 */
  validate: Fn<[], Promise<readonly ValidationIssue[]>>;
  /** 오류 표시 설정 */
  showError: Fn<[visible: boolean]>;
  /** 폼 제출 */
  submit: TrackableHandlerFunction<[], void, { loading: boolean }>;
}
```

### FormChildrenProps

```typescript
interface FormChildrenProps<
  Schema extends JSONSchema,
  Value extends AllowedValue = InferValueType<Schema>,
> {
  node?: InferFieldNode<Schema>;
  jsonSchema: Schema;
  defaultValue?: Value;
  value?: Value;
  errors?: readonly ValidationIssue[];
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

| 노드          | 설명                                         |
| ------------- | -------------------------------------------- |
| `StringNode`  | 문자열 값, format 검증 지원 (email, date 등) |
| `NumberNode`  | 숫자 값, min/max 제약, 정수 강제             |
| `BooleanNode` | 불리언 값                                    |
| `NullNode`    | 명시적 null 값                               |

**Branch Nodes** (컨테이너 구조):

| 노드         | 설명                                                         |
| ------------ | ------------------------------------------------------------ |
| `ObjectNode` | 키-값 구조, `required`, `additionalProperties` 지원          |
| `ArrayNode`  | 순서가 있는 컬렉션, `minItems`, `maxItems`, 배열 조작 메서드 |

**Special Nodes**:

| 노드          | 설명                                                      |
| ------------- | --------------------------------------------------------- |
| `VirtualNode` | `options.virtual`에 선언한 형제 필드를 묶는 비스키마 노드 |

### Branch와 Terminal (`options.terminal`)

`object`와 `array` 노드는 기본적으로 branch입니다. 속성이나 항목마다 자식 노드를 만듭니다. `options.terminal: true`를 주면 terminal이 됩니다. 입력 하나가 값 전체를 읽고 쓰며, 자식 노드는 만들지 않습니다. 전략은 스키마에서 한 번, 다음 순서로 정해집니다.

1. `options.terminal`이 `true`든 `false`든 있으면 아래 항목보다 우선합니다.
2. 스키마에 `presentation.FieldInput` 컴포넌트가 있으면 terminal입니다.
3. 그 밖에는 branch입니다.

```typescript
{
  type: 'object',
  properties: { lat: { type: 'number' }, lng: { type: 'number' } },
  options: { terminal: true }, // 지도 선택기 하나가 { lat, lng }를 씁니다
}
```

- 다른 종류는 전략이 고정되어 있습니다. `string`, `number`, `integer`, `boolean`, `null`과 여러 종류를 담은 `type`은 terminal이고, `virtual`은 branch입니다. 고정된 전략과 어긋나는 `options.terminal`은 `TERMINAL_OPTION_UNSUPPORTED`를 던지고, 같은 값을 다시 적은 것은 받아들입니다.
- 게이트 없는 선언은 `controls.active`를 지니지 않은 노드 자신의 스키마, 그 `$ref` 대상, 그 `allOf` 조각입니다. 이들 사이에서는 나중의 `options.terminal`이 이기며, `$ref` 대상은 그것을 가리키는 스키마보다 나중으로 칩니다.
- 전략은 실행 중에 바뀔 수 없습니다. 게이트가 걸린 선언(`then` / `else`, `controls.active`를 지닌 조각, 부모의 `controls.fields` 항목 중 `active`를 지닌 것이 가리키는 자식, `controls.active`나 호스트의 `controls.discriminator`로 고르는 `oneOf` / `anyOf` 분기) 때문에 노드가 어떤 경우에는 branch, 다른 경우에는 terminal이 된다면 스키마가 `TERMINAL_STRATEGY_MISMATCH`를 던집니다.
- 그런 게이트가 없는 `oneOf` / `anyOf` 분기는 호스트의 전략을 정하지 않으며, 그 분기의 `options.terminal`은 무시됩니다.

### 노드 초기화

`<Form>`은 `jsonSchema`와 `defaultValue`로 노드 트리를 만들고 렌더 중에 마운트합니다. 그래서 기다려야 할 초기화 단계가 없습니다. 패키지는 노드를 따로 만드는 팩터리를 내보내지 않으며, 노드는 폼을 통해 얻습니다.

```tsx
import { useEffect, useRef } from 'react';

import { Form, type FormHandle } from '@canard/schema-form';

const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
} as const;

function ProfileForm() {
  const formRef = useRef<FormHandle<typeof jsonSchema>>(null);

  useEffect(() => {
    const root = formRef.current?.node; // 마운트된 트리의 루트 노드
    formRef.current?.findNode('/name')?.setValue('Ada'); // JSONPointer 경로의 노드
  }, []);

  return (
    <Form
      ref={formRef}
      jsonSchema={jsonSchema}
      onChange={(value) => console.log('Form value changed:', value)}
    />
  );
}
```

| 있는 자리          | 노드를 얻는 법                                                 |
| ------------------ | -------------------------------------------------------------- |
| 폼 밖, ref를 통해  | `formRef.current.node`, `findNode(path)`, `findNodes(path)`    |
| `children` 함수 안 | 인자의 `node` ([children 함수 사용](#children-함수-사용) 참고) |
| FieldInput 안      | `node` prop ([FieldInputProps](#fieldinputprops) 참고)         |

`jsonSchema`나 `defaultValue` 속성만 바뀌면 폼은 지금 트리를 그대로 두고, 두 값은 `reset`이 다시 읽습니다. 폼은 검증기가 바뀔 때와 `reset`이 다른 `jsonSchema`로 실행될 때 트리를 새로 만들고, 같은 스키마의 `reset`은 기존 트리에 값을 다시 불러옵니다. 재생성 전에 보관한 노드는 버려진 트리에 속하므로, 참조를 들고 있지 말고 노드가 필요한 순간에 `formRef.current.node`를 읽거나 `findNode`를 부르십시오.

### 노드 상태 플래그

```typescript
node.dirty; // 초기화 이후 값이 변경되었는가?
node.touched; // 사용자가 이 필드와 상호작용했는가?
node.validated; // 검증이 실행되었는가?
node.errors; // 현재 검증 오류
node.visible; // 필드가 보이는가?
node.active; // 필드가 활성 상태인가?
node.readOnly; // 필드가 읽기 전용인가?
node.disabled; // 필드가 비활성화되었는가?
node.initialized; // 노드가 초기화를 완료했는가?
```

---

## FieldInput 시스템

### FieldInputDefinition

```typescript
type FieldInputDefinition<T = unknown> = {
  test: FieldInputTestFn | FieldInputTestObject;
  Component: ComponentType<InferFieldInputProps<T>>;
};
```

### 테스트 조건

```typescript
// 함수 형태
type FieldInputTestFn = Fn<[hint: FieldInputHint], boolean>;

// 객체 형태
type FieldInputTestObject = Partial<{
  type: Array<string>;
  jsonSchema: JSONSchema;
  format: Array<string>;
  inputType: Array<string>;
  nullable: boolean;
  [alt: string]: any;
}>;

// FieldInputHint 객체
type FieldInputHint = {
  jsonSchema: JSONSchema;
  type: string;
  format: string;
  inputType: string;
  path: string;
  nullable: boolean;
  [alt: string]: any;
};
```

inputType은 정의의 test가 해석하는 문자열 힌트이며 HTML input type과 같지 않습니다.

### FieldInputProps

```typescript
interface FieldInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JSONSchemaWithVirtual = InferJSONSchema<Value>,
  Node extends FieldNode = InferFieldNode<Schema>,
> {
  jsonSchema: Schema; // FieldInput 컴포넌트의 JSON Schema
  readOnly: boolean; // 읽기 전용 상태
  disabled: boolean; // 비활성화 상태
  required: boolean; // 필수 여부
  node: Node; // 필드 노드
  type: Node['schemaType']; // JSON Schema 타입
  name: Node['name']; // 노드 이름
  path: Node['path']; // 노드 경로
  nullable: Node['nullable']; // null 허용 여부
  errors: Node['errors']; // 검증 오류
  errorVisible: boolean; // 오류 표시 여부
  watchValues: WatchValues; // controls.watch 경로에서 읽은 값
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildFields: ChildField[];
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;
  context: Context;
  [alt: string]: any;
}
```

### 선택 우선순위

FieldInput은 다음 우선순위로 선택됩니다 (높은 순):

1. **JSON Schema의 presentation.FieldInput 직접 할당**

   ```tsx
   { type: 'string', presentation: { FieldInput: CustomInput } }
   ```

2. **fieldInputMap** (경로 기반)

   ```tsx
   <Form fieldInputMap={{ '/email': EmailInput }} />
   ```

3. **Form의 fieldInputDefinitions**

   ```tsx
   <Form fieldInputDefinitions={[...]} />
   ```

4. **FormProvider의 fieldInputDefinitions**

   ```tsx
   <FormProvider fieldInputDefinitions={[...]} />
   ```

5. **플러그인의 fieldInputDefinitions**
   ```tsx
   registerPlugin({ fieldInputDefinitions: [...] })
   ```

### FieldInputMap

```typescript
type FieldInputMap = {
  [path: string]: ComponentType<FieldInputProps>;
};

// 와일드카드 지원
const formInputMap = {
  '/users/*/name': CustomNameInput, // 배열 인덱스 매칭
  '/config/*/value': ConfigValueInput, // 동적 키 매칭
};
```

---

## Controls

### 속성 종류

```typescript
{
  type: 'string',
  controls: {
    active: boolean | string;            // 활성화 (false면 값 제거)
    visible: boolean | string;           // 표시 (false면 값 유지)
    readOnly: boolean | string;          // 읽기 전용
    disabled: boolean | string;          // 비활성화
    default: any;                        // 새로 나타난 노드의 채움 값
    derived: string;                     // 파생 값
    unsetValue: string;                  // false에서 true로 바뀌면 값을 비움
    resetInteraction: string;            // false에서 true로 바뀌면 dirty/touched를 비움
    unsetOnInactive: boolean | string;   // 노드가 형상을 떠날 때 유지된 값을 버림
    fields: { targets: string[]; controls: { /* 앞의 아홉 키 */ } }[];
    injectTo: (value, ctx) => ...;       // 이 노드의 값이 바뀔 때마다 다른 노드로 값을 밀어 넣기
    discriminator: string;               // oneOf/anyOf 호스트: 분기 태그 속성
    watch: string[];                     // 값 구독 (경로 배열)
  }
}
```

키 목록은 닫혀 있어서 알 수 없는 키가 있으면 청사진 빌드가 코드 `UNKNOWN_GROUP_KEY`인 스키마 오류(`isJSONSchemaError`로 판별)를 던집니다. `controls.fields[].controls`와 조각(`oneOf`/`anyOf`/`allOf` 분기, `then`, `else`)의 `controls` 안에서는 앞의 아홉 키(`active`부터 `unsetOnInactive`까지)만 허용되며, 나머지 네 키는 던집니다.

닫힌 목록은 `controls`와 `options` 안에만 적용됩니다. 세 묶음 밖에 있는 0.16의 최상위 키(`formType`, `FormTypeInput`, `FormTypeInputProps`, `FormTypeRendererProps`, `computed`, `&` 접두어 키, `injectTo`, `terminal`, `virtual`, `placeholder`, `errorMessages`, `propertyKeys`)는 아예 읽지 않으므로, 1.0.0은 이들을 오류도 경고도 없이 무시합니다. 별칭도 경고도 두지 않는 것은 의도된 설계이므로, 0.16에서 옮겨 오는 스키마는 키마다 직접 옮겨야 합니다(README의 마이그레이션 (1.0.0) 절 참고).

### 중첩 controls

```typescript
{
  type: 'string',
  controls: {
    active: '../toggle === true',
    visible: "@.userRole === 'admin'",
    derived: '(../price ?? 0) * (../quantity ?? 0)',
    watch: ['../category', '../price'],
  },
}
```

### 경로 참조

| 문법          | 의미                 | 예시                       |
| ------------- | -------------------- | -------------------------- |
| `../field`    | 형제 필드            | `'../category === "A"'`    |
| `../../field` | 부모의 형제          | `'../../parentField'`      |
| `./field`     | 현재 객체의 자식     | `'./nestedChild'`          |
| `/field`      | 절대 경로 (루트에서) | `'/rootField'`             |
| `@.prop`      | context 객체의 속성  | `'@.userRole === "admin"'` |

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
      controls: {
        active: "../category === 'premium'",
        watch: ['../category'],
      },
      properties: {
        // premium 전용 필드들
      },
    },
    total: {
      type: 'number',
      controls: { derived: '(../price ?? 0) * (../quantity ?? 1)' },
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
      controls: { active: "./type === 'A'" },
      properties: { fieldA: { type: 'string' } }
    },
    {
      controls: { active: "./type === 'B'" },
      properties: { fieldB: { type: 'string' } }
    }
  ]
}
```

분기는 게이트가 통과하는 동안에만 참여합니다. 분기 객체에 `controls.active` 표현식을 주거나, 호스트에 `controls.discriminator: '<property>'`를 지정하고 각 분기에 그 속성의 `const`/`enum` 태그를 둡니다. 태그는 `===`로 비교하며 분기 자신의 `controls.active`와 AND로 결합합니다. 게이트가 없으면 모든 분기가 켜집니다. 모든 분기의 필드가 존재하며 어느 분기가 맞는지는 검증기만 정합니다.

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
      controls: { active: './hasFeature1 === true' },
      properties: { config1: { type: 'string' } }
    },
    {
      controls: { active: './hasFeature2 === true' },
      properties: { config2: { type: 'string' } }
    }
  ]
}
```

### oneOf / anyOf 분기의 type

분기는 보통 `type`을 생략하고 부모의 타입을 따릅니다. 선언한다면 부모가 허용하는 것보다 넓게 말할 수 없습니다.

| 부모 `type`                                             | 허용되는 분기 `type`                         |
| ------------------------------------------------------- | -------------------------------------------- |
| `'object'`                                              | 생략, `'object'`, `['object']`               |
| `['object', 'null']` 또는 `'object'` + `nullable: true` | 생략, 부모와 같은 타입, `'object'`, `'null'` |

분기 자신의 `nullable: true` 플래그는 부모와 비교하지 않으므로 `'object'` + `nullable: true`는 어떤 객체 아래에서도 허용됩니다. 그 밖의 선언 — nullable이 아닌 객체 아래의 `'null'`·`['object', 'null']` 분기, `'string'`, `'array'` — 은 `COMPOSITION_TYPE_REDEFINITION`을 던집니다.

이 규칙과 아래 두 개발 환경 경고는 객체가 자식 노드를 만드는 경우에만 실행됩니다. 객체 전체를 하나의 입력으로 다루는 경우 — `options.terminal: true`이거나 객체 스키마에 `presentation.FieldInput` 컴포넌트를 지정한 경우 — 에는 분기를 만들지 않으므로 분기 type을 검사하지 않고 두 경고도 나오지 않습니다. 검증기는 그때도 작성된 스키마를 그대로 봅니다.

분기의 `properties` 안에서 `type`이 **있는** 항목은 필드이고, `type` 없이 `const`나 `enum`만 가진 항목은 호스트의 `controls.discriminator`가 읽어 그 분기를 고르는 태그입니다. 이런 판별자에 `type`을 붙이면 필드가 되어 부모의 같은 이름 프로퍼티와 충돌합니다(`COMPOSITION_PROPERTY_REDEFINITION`).

#### null 분기 패턴

`oneOf`는 정확히 한 분기가 맞아야 하고, `type`이 없는 분기는 `null`에도 맞습니다 — `properties`와 `required`는 객체에만 적용되기 때문입니다. 그래서 nullable 객체가 `oneOf` 아래에서 `null`로 검증을 통과하려면 이 null 분기 패턴이 필요합니다: `{ type: 'null' }` 분기 하나, 그리고 객체 분기마다 `type: 'object'`.

```typescript
{
  type: ['object', 'null'],
  properties: {
    kind: { type: 'string', enum: ['a', 'b'], default: 'a' }
  },
  oneOf: [
    { type: 'null' },
    {
      type: 'object',
      controls: { active: "./kind === 'a'" },
      properties: { aValue: { type: 'string' } }
    },
    {
      type: 'object',
      controls: { active: "./kind === 'b'" },
      properties: { bValue: { type: 'string' } }
    }
  ]
}
```

- null 분기는 검증기를 위한 것입니다. 필드가 없고 활성 분기가 되지 않으며, 거기에 쓴 조건이나 `properties`는 무시되고 개발 환경 경고 `NULL_BRANCH_IGNORED_FOR_FORM`이 나옵니다.
- 객체가 `null`인지는 값이 정하고, 어떤 객체 분기가 보이는지는 분기 조건이 정합니다. 값이 `null`인 동안 선택된 분기의 자식 필드는 default 없이 표시됩니다([Nullable 객체와 배열](#nullable-객체와-배열) 참고). 객체·배열 필드에 종류가 맞지 않는 값이 들어 있을 때도, 폼 표시·노드 데이터·출력 값이 어긋나지 않게 하려는 같은 까닭으로 마찬가지입니다. 예를 들어 객체에 문자열을 로드하면, 자식에 값을 주기 전까지 자식은 default를 받지 않습니다.
- null 분기의 위치는 상관없습니다. 사용 중인 분기의 오류는 해당 필드에 전달됩니다. 객체 값이 `oneOf`를 통과하지 못하면 null 분기도 맞지 않은 다른 분기처럼 자기 불일치("must be null")를 객체에 보고하며, 이 오류는 `oneOf` 오류와 함께 나옵니다.
- `oneOf`가 `null`을 검증할 수 없는 nullable 객체 — 받아 주는 분기가 없거나 여러 개인 경우 — 는 개발 환경 경고 `NULLABLE_ONE_OF_NULL_UNREACHABLE`을 냅니다. `anyOf`는 이런 주의가 필요 없습니다: null 분기 하나 또는 type 없는 분기만으로 충족됩니다.

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

`then`의 프로퍼티는 `if` 가드가 통과하는 동안에만, `else`의 프로퍼티는 가드가 실패하는 동안에만 형상에 속합니다. 가드는 검증기의 가드 진입점을 통해 동기로 평가하며, 선택된 검증기가 없으면(Form이나 FormProvider의 `validatorFactory`도, 검증기 플러그인도 없으면) `then`과 `else` 모두 꺼진 채로 남습니다.

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
node.find('/path/to/field'); // 루트에서 절대 경로
node.find('./childField'); // 현재 노드에서 상대 경로
```

### 확장 문법

| 문법 | 의미         | 사용 가능 컨텍스트           |
| ---- | ------------ | ---------------------------- |
| `..` | 부모 탐색    | controls 표현식, node.find() |
| `.`  | 현재 노드    | controls 표현식, node.find() |
| `*`  | 와일드카드   | FieldInputMap만              |
| `@`  | context 참조 | controls 표현식만            |

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
  None = 0, // 검증 비활성화
  OnChange = 1, // 값 변경 시 검증
  OnRequest = 2, // 요청 시 검증 (validate() 호출)
}

// 조합 가능
ValidationMode.OnChange | ValidationMode.OnRequest;
```

### 오류 메시지 포맷팅

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      presentation: {
        errorMessages: {
          minLength:
            '이름은 최소 {limit}자 이상이어야 합니다. 현재 값: {value}',
          required: '이름은 필수 입력 항목입니다.',
        },
      },
    },
  },
  required: ['name'],
};
```

### 다국어 지원

```typescript
presentation: {
  errorMessages: {
    minLength: {
      ko_KR: '이름은 최소 {limit}자 이상이어야 합니다.',
      en_US: 'Name must be at least {limit} characters.',
    },
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
  FieldRenderer?: ComponentType<FieldRendererProps>;
  FormLabelRenderer?: ComponentType<FieldRendererProps>;
  FormInputRenderer?: ComponentType<FieldRendererProps>;
  FormErrorRenderer?: ComponentType<FieldRendererProps>;
  fieldInputDefinitions?: FieldInputDefinition[];
  validator?: ValidatorPlugin;
  formatError?: FormatError;
}

interface ValidatorPlugin {
  bind?: Fn<[instance: any]>;
  compile(jsonSchema: JSONSchema): ValidateFunction;
  compileGuard(root: JSONSchema, pointer: string): (value: unknown) => boolean;
  release?(root: JSONSchema): void;
  readonly dialect?: string;
}
```

기본 그룹 렌더러는 자체 레이블과 메시지를 그리므로 `FormLabelRenderer`와 `FormErrorRenderer`는 컴포지션 API(`Form.Label`, `Form.Error`)나 이를 호출하는 사용자 그룹 렌더러를 통해서만 나타납니다.

렌더러 속성은 폼이 마운트될 때 한 번 읽히므로, 마운트 이후에 렌더러를 교체해도 반영된다고 보장하지 않습니다.

---

## 고급 기능

### 렌더 가상화 (Virtualization)

수백 개 이상 필드를 가진 폼에서는 초기 React 마운트가 지배적 비용이다(node tree 자체는 저렴). `virtualization` prop은 화면 밖 필드의 마운트를 지연한다 — 경량 placeholder로 렌더하다가 뷰포트에 근접하거나, 브라우저 idle 시간, 또는 focus/select 명령 시 실제 컴포넌트로 교체한다(한 번 reveal되면 되돌아가지 않음, defer-once). node tree는 항상 전량 생성되므로 `value`·검증·`getValue()`/`setValue()`·제출은 마운트 여부와 무관하게 동일하다. 모든 FieldInput 플러그인과 호환된다(게이트가 레이아웃 아래에 위치).

```tsx
import { Form, VirtualizationBackfill } from '@canard/schema-form';

<Form
  jsonSchema={largeSchema}
  virtualization={{
    threshold: 30, // 자식 30개 이상인 branch만 게이팅
    eagerCount: 20, // 선행 20개 필드 즉시 마운트
    rootMargin: '100%', // IntersectionObserver 여백 (px 또는 % 만)
    backfill: VirtualizationBackfill.Idle, // 또는 .None (스크롤/명령 시에만)
    estimateHeight: 40, // placeholder 높이(px) 또는 (node) => number
    Placeholder: FieldSkeleton, // placeholder 안에 렌더할 컴포넌트(선택)
  }}
/>;
// 기본값으로 활성화: <Form jsonSchema={largeSchema} virtualization />
```

**VirtualizationOptions**

| 옵션             | 타입                                      | 기본값   | 설명                                                                |
| ---------------- | ----------------------------------------- | -------- | ------------------------------------------------------------------- |
| `threshold`      | `number`                                  | `30`     | 이 수 이상 자식을 가진 branch만 게이팅 대상                         |
| `eagerCount`     | `number`                                  | `20`     | 게이팅된 branch에서 즉시 마운트할 선행 필드 수                      |
| `rootMargin`     | `` `${number}px` `` \| `` `${number}%` `` | `'100%'` | IntersectionObserver rootMargin (px/% 만 허용)                      |
| `backfill`       | `VirtualizationBackfill`                  | `Idle`   | `Idle`=idle 시 나머지 점진 마운트, `None`=스크롤/명령 시에만 reveal |
| `estimateHeight` | `number \| ((node) => number)`            | `40`     | placeholder 공간 예약 높이(px)                                      |
| `Placeholder`    | `ComponentType<{ node, height }>`         | `null`   | placeholder 안에 렌더할 시각 컴포넌트                               |

- **Placeholder 스타일**: placeholder는 `[data-path]`와 `[data-deferred]` 마커를 가진 박스다. CSS 속성 선택자(`[data-deferred] { … }`) 또는 `Placeholder` 컴포넌트로 스타일링하며, 공간 예약은 항상 `estimateHeight`가 담당한다.
- **⚠️ CSR 전용**: `IntersectionObserver`가 필요하다. SSR/하이드레이션 앱에서는 활성화하지 말 것 — 서버는 전 필드를 마운트하고 클라이언트는 게이팅해 하이드레이션 mismatch가 발생한다. `IntersectionObserver`가 없으면 무음 비활성화된다(개발 모드 경고 출력).

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

같은 경로에 바인딩된 두 입력(예: 두 개의 `Form.Input` 컴포넌트나 두 개의 `Input` 슬롯)은 타이핑하는 동안 서로를 미러링하지 않습니다. 타이핑은 Refresh를 일으키지 않고 각 입력이 자신의 초안을 소유하므로, 다른 입력은 값을 바꾸는 `setValue`, `reset`, 폼 핸들의 `refresh(path)`처럼 Refresh가 닿을 때까지 자신의 글자를 그대로 보여 줍니다.

### 배열 조작

```tsx
const arrayNode = node.find('/items') as ArrayNode;

arrayNode.push(); // 기본값으로 항목 추가
arrayNode.push('custom'); // 커스텀 값으로 항목 추가
arrayNode.remove(index); // 인덱스의 항목 제거
arrayNode.clear(); // 모든 항목 제거

arrayNode.length; // 현재 항목 수
arrayNode.children; // 자식 노드 배열
```

### 배열 출력 필터 (`omitTrailing` / `omitEmpty`)

배열 스키마는 `options` 아래에 출력 필터를 지정할 수 있습니다. 이 필터는 배열이 **내보내는 값** — 부모 전파, 루트 validation, 외부 표면(`onChange`, `getValue()`, `submit`) — 만 정제하며, 자식 노드와 raw `node.value`는 모든 항목을 유지하므로 미리 노출한 빈 input이 그대로 렌더링됩니다.

```tsx
const jsonSchema = {
  type: 'array',
  minItems: 3, // 빈 input 3개가 먼저 렌더링됨
  items: { type: 'string' },
  options: { omitTrailing: true },
};
// UI에는 input 3개가 보이고, 사용자가 첫 번째만 채우면
// getValue() / onChange / validation 값은: ['first']
```

- `omitTrailing` (opt-in): **후행** 연속 `undefined` 항목만 제거합니다. 선행·중간 `undefined`는 보존되어 error `dataPath`와 validation index 정합이 유지됩니다 — `[1, undefined, 2]`는 그대로 방출됩니다.
- `omitEmpty` (기본 활성): 빈 배열을 부모 전파 경로에서 `undefined`로 변환합니다. 필터 순서는 `omitTrailing → omitEmpty`라서 전부 빈 배열은 부모에서 `undefined`로 수렴합니다 (루트 폼은 `[]`를 방출).
- `null`은 빈 값이 아닙니다: 두 필터 모두 값이 `null`인 nullable 배열을 건드리지 않습니다 — [Nullable 객체와 배열](#nullable-객체와-배열) 참고.
- `node.value`는 raw를 유지하고, 정제된 출력은 `node.outputValue`로 노출됩니다. validation은 정제된 값 기준이라 `minItems`는 채워진 prefix만 셉니다.
- Reset 계열 초기화(폼 reset, 분기 재활성화)는 `minItems`만큼 빈 항목을 재충전하고, 일반 `setValue(undefined)`는 전부 비웁니다 — 배열을 빼고 부모를 교체하는 쓰기도 같습니다: `setValue({ other: 1 })`는 배열을 비우고, `SetValueOption.Merge`는 그대로 둡니다. 기본값이 `null`인 배열은 채움 없이 `null`로 reset됩니다.

### 객체 옵션 (`propertyOrder` / `virtual`)

객체 스키마는 `options` 아래에 키 두 개를 더 받습니다.

```typescript
{
  type: 'object',
  properties: {
    name: { type: 'string' },
    startDate: { type: 'string', format: 'date' },
    endDate: { type: 'string', format: 'date' },
  },
  options: {
    propertyOrder: ['endDate', 'startDate'], // { endDate, startDate, name } 순서로 내보냄
    virtual: { period: { fields: ['startDate', 'endDate'] } },
  },
}
```

- `propertyOrder`는 내보내는 객체 값의 키 순서이며 화면 순서가 아닙니다. 나열한 키가 먼저 오고, 그다음 나머지 선언 프로퍼티가 선언 순서로, 마지막으로 선언 밖 키가 들어온 순서로 옵니다. 값에 없는 키는 건너뛰며, 정수처럼 보이는 키는 JavaScript가 항상 맨 앞에 둡니다.
- `virtual`은 가상 필드 묶음에 이름을 붙입니다. 각 항목은 `fields`에 하나의 가상 노드로 모을 형제 프로퍼티를 나열하고, 그 노드 자신의 `presentation`·`controls` 같은 키를 함께 둘 수 있습니다. 가상 노드를 `type: 'virtual'` 스키마로 작성하는 경우는 없습니다.

### Value Injection (injectTo)

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    source: {
      type: 'string',
      controls: {
        injectTo: (value: string) => ({
          '../target': `injected: ${value}`,
        }),
      },
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

Enter는 Form의 `form` 요소를 통해 제출합니다. 텍스트류 필드가 둘 이상이면 브라우저는 폼에 제출 버튼이 있을 때만 Enter로 제출합니다(암묵적 제출은 이를 막는 필드만 세므로, 텍스트 필드 하나와 체크박스 하나는 그대로 제출됩니다).

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

| prop     | 타입                         | 설명                            |
| -------- | ---------------------------- | ------------------------------- |
| `value`  | `InferValueType<Schema>`     | 현재 폼 값                      |
| `errors` | `readonly ValidationIssue[]` | 전체 검증 에러 목록             |
| `node`   | `InferFieldNode<Schema>`     | 루트 노드 (프로그래매틱 접근용) |

---

## 타입 정의

### 타입 유틸리티

```typescript
import {
  FormHandle,
  InferFieldNode,
  InferValueType,
} from '@canard/schema-form';

// 스키마에서 값 타입 추론
type FormValue = InferValueType<typeof jsonSchema>;

// 스키마에서 노드 타입 추론
type RootNode = InferFieldNode<typeof jsonSchema>;

// 타입 안전한 폼 핸들
const formRef = useRef<FormHandle<typeof jsonSchema>>(null);
```

`InferValueType`은 스키마에 `as const`가 필요합니다. 없으면 `type`이 `string`으로 넓어져 결과가 `any`로 떨어집니다. `as const`가 있으면 `properties`와 `items`를 재귀 순회하며, 모든 필드를 **optional**로 만들고 `Record<string, any>`와 교차한 타입을 냅니다:

```typescript
const jsonSchema = {
  type: 'object',
  properties: { name: { type: 'string' } },
  required: ['name'],
} as const;

type FormValue = InferValueType<typeof jsonSchema>;
// { name?: string } & Record<string, any>
```

- `required`에 있어도 optional로 유지됩니다. 폼이 런타임에 필드를 제외할 수 있기 때문입니다 (`controls.active`가 false, `options.omitEmpty` 등).
- 객체 타입은 열려 있습니다 — JSON Schema의 기본값입니다. 그래서 `oneOf`/`anyOf`, `if`/`then`/`else`, `patternProperties`가 기여하는 키가 거부되지 않습니다. `additionalProperties: false`를 지정하면 추론 타입이 닫힙니다.

정확한 형태를 알고 있다면 직접 정의해 두 번째 타입 인자로 넘기세요:

```typescript
interface SignUpValue {
  name: string;
}

<Form<typeof jsonSchema, SignUpValue> jsonSchema={jsonSchema} onChange={(v) => v.name} />;
const formRef = useRef<FormHandle<typeof jsonSchema, SignUpValue>>(null);
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

// FieldInput에서 nullable 조건
const definitions = [
  { test: { type: 'string', nullable: true }, component: NullableInput },
  { test: { type: 'string', nullable: false }, component: RequiredInput },
];
```

`nullable: true`는 공식 지원하는 OpenAPI 3.0 호환 표기입니다. `type`에 `'null'`을 추가하는 것과 동등하여, `{ type: 'string', nullable: true }`는 `{ type: ['string', 'null'] }`를 뜻합니다. 이 표기를 사용해도 경고나 오류가 발생하지 않습니다.

### Nullable 객체와 배열

nullable 객체·배열(`type: ['object', 'null']`, `type: ['array', 'null']`)은 서로 다른 세 상태를 가지며, 폼이 스스로 한 상태를 다른 상태로 바꾸지 않습니다.

| 값          | 의미             | 부모가 받는 값                                                   |
| ----------- | ---------------- | ---------------------------------------------------------------- |
| `null`      | 객체/배열이 없음 | `null` — `omitEmpty`의 대상이 아님                               |
| `{}` / `[]` | 있고 비어 있음   | `omitEmpty`(기본)로 생략, `options: { omitEmpty: false }`면 유지 |
| `undefined` | 설정되지 않음    | 키가 생략됨                                                      |

**`null`은 의도로만 바뀝니다.**

- `defaultValue`·스키마 `default: null`, 노드 자신이나 조상을 통한 `setValue(null)`로 `null`이 됩니다.
- 노드 자신에 객체/배열을 대입하거나 — `setValue({})`, `setValue([])`, 키를 담은 `setValue({ ... }, SetValueOption.Merge)` — **값을 담은 쓰기**가 활성 자손에 도착하면 객체/배열이 됩니다: 사용자 입력, `setValue`, 배열 `push`, 사용자가 일으킨 `injectTo`. 필드가 이미 보여 주는 값을 그대로 확정하는 것도 쓰기입니다.
- 폼이 스스로 만든 값으로는 `null`이 유지됩니다: 자식의 `default`, `controls.derived`, `oneOf`/`anyOf` 분기 복원, `controls.active`에 의한 재활성화, reset 중의 자식 복원, 그리고 그런 값만으로 구동된 `injectTo`(`default`나 derived 값만 가진 source).
- 값 없는 쓰기로도 `null`이 유지됩니다: 필드 비우기, null 배열의 `pop()`/`remove()`/`update()`/`clear()`, `setValue({}, SetValueOption.Merge)`. 비운 필드는 기억되어 이후 노드가 만들어질 때 반영됩니다.

필드를 *비운다*는 것은 그 노드가 `undefined`를 emit한다는 뜻입니다. 기본 `omitEmpty`에서 빈 문자열은 비우기이고, `false`·`0`·`null`은 값입니다. `options: { omitEmpty: false }`이면 빈 문자열도 값입니다. 비활성 필드에 쓴 값은 누구에게도 도착하지 않습니다.

reset은 노드가 무엇을 갖고 있든 기본값을 복원합니다: 기본값이 `null`이면 `null`로, 아니면 기본 객체로.

**`null`인 동안** 출력은 스키마가 무엇을 담고 있든 — 배열, default, derived, `oneOf`/`anyOf`, controls로 게이트된 필드·virtual 필드 — `null`입니다. 객체의 자식 필드는 계속 렌더되며, `null`인 동안 자식 default, 객체 default, `minItems` 채움은 나타나지 않습니다. `controls.derived`나 `injectTo`가 쓴 값은 객체를 만들지 않고 그 필드에 표시됩니다. 로드·reset·쓰기 중 어떤 경로로 `null`이 되었든 같고, `null`로 버린 데이터는 되살아나지 않습니다. 이 규칙과, 종류가 틀린 값을 로드했을 때의 같은 규칙은 폼에 보이는 것, 노드 데이터, 출력 값이 서로 어긋나지 않게 하기 위한 것입니다. 자신이 `null`인 nullable **배열**에는 아이템이 없고 `minItems` 채움도 없습니다.

**무엇이 되는가:** 자식 필드에 입력하면 객체는 그 입력값을 담은 객체로 승격됩니다. 승격으로 새로 생긴 필드(예를 들어 입력값이 여는 분기의 필드)만 default를 받으며, 이미 있던 필드는 값을 채울 때까지 빈 상태를 유지합니다. 배열의 쓰기는 빈 배열을 기준으로 합니다. 배열에는 병합이 없습니다: `setValue([], SetValueOption.Merge)`는 대입이며 `[]`를 만듭니다.

```tsx
const jsonSchema = {
  type: 'object',
  properties: {
    closed: {
      type: ['object', 'null'],
      properties: {
        reason: { type: 'string', default: 'completed' },
        note: { type: 'string' },
      },
    },
  },
};
// <Form jsonSchema={jsonSchema} defaultValue={{ closed: null }} />
// getValue()                     → { closed: null }   (필드에 default가 표시되지 않음)
// note에 "done" 입력             → { closed: { note: 'done' } }
// setValue({ closed: null })     → { closed: null }   (필드에 다시 default가 표시되지 않음)
```

- **nullable이 아닌** 객체에 `null`을 대입하면 `{}`가 됩니다.
- `setValue(undefined)`는 `null`이 아닙니다: 서브트리를 — 모든 필드와 모든 배열 아이템을 — 비우며 자식 default를 복원하지 않습니다.
- 폼은 검증을 통과시키려고 값을 바꾸지 않습니다. `null`의 유효성은 스키마가 결정합니다. `type`을 선언하지 않은 `oneOf` 분기는 모두 `null`에 매치되므로 어떤 검증기에서도 `null`은 그 `oneOf`를 통과하지 못합니다. [null 분기 패턴](#null-분기-패턴) — `{ type: 'null' }` 분기와 객체 분기의 `type: 'object'` — 을 쓰거나 `anyOf`를 쓰십시오.

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
2. **FieldInputDefinitions 캐싱** - 컴포넌트 외부에서 정의
3. **ValidationMode 최적화** - 필요에 따라 OnChange 또는 OnRequest 선택
4. **TypeScript as const 사용** - 스키마 타입 추론을 위해
5. **controls.watch 활용** - 반응형 폼 로직 구현
6. **Form.Render로 커스텀 레이아웃** - 복잡한 UI 요구사항 충족

---

## 라이선스

MIT License

---

## 버전

현재: package.json 참조
