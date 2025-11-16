# @canard/schema-form 핵심 타입 정의

> 출처: `packages/canard/schema-form/src/types/`
> 최종 갱신: 2025-01-16

## FormTypeInputProps

**파일**: `formTypeInput.ts`

FormTypeInput 컴포넌트가 받아야 하는 Props의 완전한 정의입니다.

```typescript
export interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  /** JsonSchema of FormTypeInput Component */
  jsonSchema: Schema;
  /** ReadOnly state of FormTypeInput Component */
  readOnly: boolean;
  /** Disabled state of FormTypeInput Component */
  disabled: boolean;
  /** Whether the schema node assigned to FormTypeInput Component is required */
  required: boolean;
  /** Schema node assigned to FormTypeInput Component */
  node: Node;
  /** Name of schema node assigned to FormTypeInput Component */
  name: Node['name'];
  /** Path of schema node assigned to FormTypeInput Component */
  path: Node['path'];
  /** Errors of schema node assigned to FormTypeInput Component */
  errors: Node['errors'];
  /** Values subscribed according to `computed.watch`(=`&watch`) property defined in JsonSchema */
  watchValues: WatchValues;
  /** Default value of FormTypeInput Component */
  defaultValue: Value | undefined;
  /** Current value of FormTypeInput Component */
  value: Value;
  /** onChange handler of FormTypeInput Component */
  onChange: SetStateFnWithOptions<Value>;
  /** onFileAttach handler of FormTypeInput Component */
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  /** Child FormTypeInput Components of this FormTypeInput Component */
  ChildNodeComponents: ChildNodeComponent[];
  /** Style of FormTypeInput Component */
  style: CSSProperties | undefined;
  /** UserDefinedContext passed to Form */
  context: Context;
  /** Additional properties can be freely defined */
  [alt: string]: any;
}
```

### 제네릭 파라미터

1. **Value**: 입력 값의 타입
   - `string`, `number`, `boolean`, `any[]`, `object` 등
   - `AllowedValue` 타입을 만족해야 함

2. **Context**: 사용자 정의 Context 타입
   - UI 라이브러리별로 확장 (예: `{ size?: 'small' | 'medium' | 'large' }`)
   - 기본값: `object`

3. **WatchValues**: watch 필드로 구독하는 값들의 배열
   - JsonSchema의 `&watch` 속성으로 정의된 다른 필드 값들
   - 기본값: `Array<any>`

4. **Schema**: JsonSchema 타입
   - `InferJsonSchema<Value>`로 자동 추론
   - `JsonSchemaWithVirtual` 확장

5. **Node**: SchemaNode 타입
   - `InferSchemaNode<Schema>`로 자동 추론
   - 내부 노드 구조

## FormTypeInputPropsWithSchema

간편한 타입 정의를 위한 헬퍼 타입입니다.

```typescript
export type FormTypeInputPropsWithSchema<
  Value extends AllowedValue = any,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Context extends Dictionary = object,
> = FormTypeInputProps<Value, Context, any[], Schema>;
```

**사용 사례**: 대부분의 플러그인 컴포넌트에서 사용

```typescript
interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<string, StringSchema, MuiContext> {
  // 추가 props
}
```

## FormTypeInputPropsWithNode

Node 타입을 명시적으로 지정해야 하는 경우 사용합니다.

```typescript
export type FormTypeInputPropsWithNode<
  Value extends AllowedValue = any,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> = FormTypeInputProps<Value, Dictionary, any[], Schema, Node>;
```

## UnknownFormTypeInputProps

타입 추론이 불필요한 경우 사용하는 타입입니다.

```typescript
export interface UnknownFormTypeInputProps {
  jsonSchema: any;
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  node: any;
  name: string;
  path: string;
  errors: any[];
  watchValues: any[];
  defaultValue: any;
  value: any;
  onChange: SetStateFnWithOptions<any>;
  onFileAttach: Fn<[file: File | File[] | undefined]>;
  ChildNodeComponents: ChildNodeComponent<any>[];
  style: CSSProperties | undefined;
  context: any;
  [alt: string]: any;
}
```

## FormTypeRendererProps

**파일**: `formTypeRenderer.ts`

FormTypeRenderer 컴포넌트 (FormGroup, FormLabel, FormInput, FormError)가 받는 Props입니다.

```typescript
export interface FormTypeRendererProps extends OverridableFormTypeInputProps {
  /** Whether the schema node assigned to FormTypeRenderer Component is the root node */
  isRoot: boolean;
  /** Depth of the schema node assigned to FormTypeRenderer Component */
  depth: number;
  /** JsonSchema of the schema node assigned to FormTypeRenderer Component */
  jsonSchema: SchemaNode['jsonSchema'];
  /** Schema node assigned to FormTypeRenderer Component */
  node: SchemaNode;
  /** Type of the schema node assigned to FormTypeRenderer Component */
  type: SchemaNode['type'];
  /** Path of the schema node assigned to FormTypeRenderer Component */
  path: SchemaNode['path'];
  /** Name of the schema node assigned to FormTypeRenderer Component */
  name: SchemaNode['name'];
  /** Value of the schema node assigned to FormTypeRenderer Component */
  value: SchemaNode['value'];
  /** Errors of the schema node assigned to FormTypeRenderer Component */
  errors: SchemaNode['errors'];
  /** Whether the schema node assigned to FormTypeRenderer Component is required */
  required: SchemaNode['required'];
  /** FromTypeInput component of the schema node assigned to FormTypeRenderer Component */
  Input: ComponentType<OverridableFormTypeInputProps>;
  /** Error message of the schema node assigned to FormTypeRenderer Component */
  errorMessage: ReactNode;
  /** Function to format error message of the schema node assigned to FormTypeRenderer Component */
  formatError: FormatError;
  /** User defined context of the schema node assigned to FormTypeRenderer Component */
  context: Dictionary;
  /** Additional props of the schema node assigned to FormTypeRenderer Component */
  [alt: string]: any;
}
```

## FormTypeTestObject & FormTypeTestFn

**파일**: `formTypeInput.ts`

컴포넌트와 스키마 노드를 매핑하는 조건을 정의하는 타입입니다.

```typescript
export type FormTypeTestFn = Fn<[hint: Hint], boolean>;

type OptionalString = string | undefined;

export type FormTypeTestObject = Partial<{
  /** JsonSchema['type'] | Array<JsonSchema['type']> */
  type: JsonSchemaType | JsonSchemaType[];
  /** SchemaNode['path'] | Array<SchemaNode['path']> */
  path: string | string[];
  /** JsonSchema['format'] | Array<JsonSchema['format']> | undefined */
  format: OptionalString | OptionalString[];
  /** JsonSchema['formType'] | Array<JsonSchema['formType']> | undefined */
  formType: OptionalString | OptionalString[];
}>;

export type Hint = {
  /** JsonSchema['type'] */
  type: JsonSchemaType;
  /** SchemaNode['path'] */
  path: string;
  /** JsonSchema */
  jsonSchema: JsonSchemaWithVirtual;
  /** JsonSchema['format'] */
  format?: string;
  /** JsonSchema['formType'] */
  formType?: string;
};
```

### 사용 방법

```typescript
// 객체 형태 (권장: 단순 조건)
test: { type: 'string', format: 'email' }

// 함수 형태 (권장: 복합 조건)
test: ({ type, jsonSchema }: Hint) => 
  type === 'string' && jsonSchema.enum && jsonSchema.enum.length > 0
```

## FormTypeInputDefinition

```typescript
export type FormTypeInputDefinition<T = unknown> = {
  test: FormTypeTestFn | FormTypeTestObject;
  Component: ComponentType<InferFormTypeInputProps<T>>;
};
```

**사용 예**:

```typescript
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;
```

## SetStateFnWithOptions

```typescript
export type SetStateFnWithOptions<S = unknown> = Fn<
  [value: S | ((prevState: S) => S), options?: PublicSetValueOption]
>;
```

**사용법**:

```typescript
const handleChange = (newValue: string) => {
  onChange(newValue);  // 직접 값 전달
  // 또는
  onChange((prev) => prev + newValue);  // 함수 형태
  // 또는
  onChange(newValue, { shouldValidate: true });  // 옵션 포함
};
```

## ChildNodeComponent

```typescript
export interface ChildNodeComponentProps<Value extends AllowedValue = any>
  extends OverridableFormTypeInputProps {
  defaultValue?: Value;
  value?: Value;
  onChange?: SetStateFnWithOptions<Value>;
  onFileAttach?: Fn<[file: File | File[] | undefined]>;
  FormTypeRenderer?: ComponentType<FormTypeRendererProps>;
  context?: Dictionary;
  [alt: string]: any;
}
```

**사용 사례**: Array, Object 타입에서 자식 노드 렌더링

```typescript
<>
  {ChildNodeComponents.map((ChildComponent, index) => (
    <ChildComponent key={index} />
  ))}
</>
```

---

## 중요 노트

1. **onFileAttach 필드**: 최신 버전에서 추가됨. 레거시 문서에는 누락되어 있을 수 있음.
2. **FormTypeTestObject의 jsonSchema 필드**: 실제 타입에는 **없음**. 레거시 문서에 잘못 포함된 경우 제거 필요.
3. **OptionalString**: `format`과 `formType`은 `undefined`를 허용하는 `OptionalString` 타입 사용.

