# FormTypeInput Skill

@canard/schema-form의 FormTypeInput 시스템에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: formtype-input
- **용도**: FormTypeInput 컴포넌트 개발 및 커스터마이징 가이드
- **트리거**: FormTypeInput, formTypeInputDefinitions, formTypeInputMap, 커스텀 입력 컴포넌트 관련 질문

---

## 개요 (Overview)

FormTypeInput은 JSON Schema의 각 필드를 렌더링하는 컴포넌트입니다. 우선순위 기반으로 적절한 컴포넌트가 선택됩니다.

### 우선순위 (Priority Order)

1. **JSON Schema의 `FormTypeInput` 속성** - 가장 높은 우선순위
2. **`formTypeInputMap`** - 경로 기반 매핑
3. **Form의 `formTypeInputDefinitions`**
4. **FormProvider의 `formTypeInputDefinitions`**
5. **플러그인의 `formTypeInputDefinitions`**

---

## FormTypeInputProps 인터페이스

```typescript
interface FormTypeInputProps<
  Value extends AllowedValue = any,
  Context extends Dictionary = object,
  WatchValues extends Array<any> = Array<any>,
  Schema extends JsonSchemaWithVirtual = InferJsonSchema<Value>,
  Node extends SchemaNode = InferSchemaNode<Schema>,
> {
  // 스키마 정보
  jsonSchema: Schema;
  type: Node['schemaType'];
  name: Node['name'];
  path: Node['path'];
  nullable: Node['nullable'];

  // 상태
  readOnly: boolean;
  disabled: boolean;
  required: boolean;
  errorVisible: boolean;
  errors: Node['errors'];

  // 노드 접근
  node: Node;

  // 값 관리
  defaultValue: Value | undefined;
  value: Value | undefined;
  onChange: SetStateFnWithOptions<Value | undefined>;

  // 파일 첨부
  onFileAttach: Fn<[file: File | File[] | undefined]>;

  // 자식 컴포넌트
  ChildNodeComponents: ChildNodeComponent[];

  // watch 값
  watchValues: WatchValues;

  // 스타일
  placeholder: string | undefined;
  className: string | undefined;
  style: CSSProperties | undefined;

  // 컨텍스트
  context: Context;

  // 추가 속성 허용
  [alt: string]: any;
}
```

---

## FormTypeInput 정의 방법

### 1. JSON Schema에 직접 지정 (최우선)

```typescript
// stories/03.FormTypeInput.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      // 직접 컴포넌트 지정
      FormTypeInput: ({ value, onChange }: FormTypeInputProps<string>) => (
        <input
          type="email"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="이메일을 입력하세요"
        />
      ),
    },
  },
};
```

### 2. formTypeInputDefinitions 사용

```typescript
const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // test 함수 사용
  {
    test: (hint) => hint.type === 'string' && hint.format === 'email',
    Component: EmailInput,
  },

  // test 객체 사용
  {
    test: {
      type: 'string',
      format: 'email',
    },
    Component: EmailInput,
  },

  // formType 사용
  {
    test: {
      type: 'string',
      formType: 'password',
    },
    Component: PasswordInput,
  },

  // nullable 조건
  {
    test: {
      type: 'string',
      nullable: true,
    },
    Component: NullableStringInput,
  },
];

// Form에 전달
<Form
  jsonSchema={schema}
  formTypeInputDefinitions={formTypeInputDefinitions}
/>
```

### 3. formTypeInputMap 사용

```typescript
// stories/03.FormTypeInput.stories.tsx 기반
const formTypeInputMap: FormTypeInputMap = {
  // 절대 경로 매핑
  '/email': EmailInput,
  '/user/name': UserNameInput,

  // 와일드카드 사용 (배열 인덱스)
  '/items/*/name': ItemNameInput,
  '/users/*/email': UserEmailInput,

  // 와일드카드 사용 (객체 키)
  '/metadata/*': MetadataInput,
  '/config/*/value': ConfigValueInput,

  // 이스케이프된 경로 (슬래시 포함 키)
  '/object~1Node': SpecialPathInput,  // 'object/Node' 키 매칭
};

// Form에 전달
<Form
  jsonSchema={schema}
  formTypeInputMap={formTypeInputMap}
/>
```

---

## Test 객체 속성

```typescript
interface FormTypeInputHint {
  type: SchemaType;           // 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null'
  format?: string;            // 'email' | 'date' | 'password' | etc.
  formType?: string;          // 커스텀 타입 식별자
  path: string;               // JSONPointer 경로
  nullable: boolean;          // null 허용 여부
  jsonSchema: JsonSchema;     // 전체 스키마 객체
}
```

### Test 함수 예제

```typescript
const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // 복잡한 조건
  {
    test: (hint) => {
      // enum이 있는 string 타입
      if (hint.type === 'string' && hint.jsonSchema.enum) {
        return true;
      }
      return false;
    },
    Component: SelectInput,
  },

  // 패턴 기반
  {
    test: (hint) => {
      return hint.path.startsWith('/settings/');
    },
    Component: SettingsInput,
  },

  // 복합 조건
  {
    test: (hint) => {
      return (
        hint.type === 'number' &&
        hint.jsonSchema.minimum !== undefined &&
        hint.jsonSchema.maximum !== undefined
      );
    },
    Component: RangeSliderInput,
  },
];
```

---

## 커스텀 컴포넌트 예제

### 기본 입력 컴포넌트

```typescript
import type { FormTypeInputProps } from '@canard/schema-form';

const TextInput: FC<FormTypeInputProps<string>> = ({
  value,
  onChange,
  readOnly,
  disabled,
  required,
  placeholder,
  errors,
  errorVisible,
}) => {
  return (
    <div>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
      />
      {errorVisible && errors.length > 0 && (
        <span style={{ color: 'red' }}>{errors[0].message}</span>
      )}
    </div>
  );
};
```

### Controlled vs Uncontrolled

```typescript
// Controlled 컴포넌트 (value 사용)
const ControlledInput: FC<FormTypeInputProps<string>> = ({
  value,
  onChange,
}) => (
  <input
    type="text"
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
  />
);

// Uncontrolled 컴포넌트 (defaultValue 사용)
const UncontrolledInput: FC<FormTypeInputProps<string>> = ({
  defaultValue,
  onChange,
}) => (
  <input
    type="text"
    defaultValue={defaultValue ?? ''}
    onChange={(e) => onChange(e.target.value)}
  />
);
```

### watchValues 활용

```typescript
// computed.watch로 구독한 값 사용
const DependentInput: FC<FormTypeInputProps<string>> = ({
  value,
  onChange,
  watchValues,
}) => {
  // watchValues[0] = 첫 번째 watch 경로의 값
  const categoryValue = watchValues[0];

  return (
    <div>
      <label>카테고리: {categoryValue}</label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

// 스키마에서 watch 설정
const schema = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    description: {
      type: 'string',
      computed: {
        watch: ['../category'],
      },
      FormTypeInput: DependentInput,
    },
  },
};
```

### 객체 타입 커스텀 렌더링

```typescript
// stories/05.WatchValues.stories.tsx 기반
const ObjectFormTypeInput: FC<FormTypeInputProps<{ name?: string; age?: number }>> = ({
  defaultValue,
  onChange,
}) => {
  const [name, setName] = useState(() => defaultValue?.name);
  const [age, setAge] = useState(() => defaultValue?.age);

  useEffect(() => {
    onChange({ name, age });
  }, [name, age, onChange]);

  return (
    <div>
      <div>
        <label>
          Name:
          <input
            type="text"
            defaultValue={defaultValue?.name}
            onChange={(e) => setName(e.target.value || undefined)}
          />
        </label>
      </div>
      <div>
        <label>
          Age:
          <input
            type="number"
            defaultValue={defaultValue?.age}
            onChange={(e) => setAge(Number(e.target.value) || undefined)}
          />
        </label>
      </div>
    </div>
  );
};
```

### 배열 타입 커스텀 렌더링

```typescript
// stories/27.OptimizeArrayUsecase.stories.tsx 기반
const ArrayFormTypeInput: FC<FormTypeInputProps<string[]>> = ({
  value,
  onChange,
}) => (
  <input
    type="text"
    value={value?.join('') ?? ''}
    onChange={(e) => onChange(e.target.value.split(''))}
  />
);

// 배열 조작 메서드 사용
const ArrayWithControls: FC<FormTypeInputProps<number[]>> = ({
  node,
  value,
}) => {
  const handlePush = async () => {
    const newValue = await node.push(Math.random() * 100);
    console.log('추가된 값:', newValue);
  };

  const handleClear = () => {
    node.clear();
  };

  return (
    <div>
      <button onClick={handlePush}>추가</button>
      <button onClick={handleClear}>전체 삭제</button>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </div>
  );
};
```

---

## 와일드카드 패턴

### 배열 인덱스 매칭

```typescript
const formTypeInputMap = {
  // 모든 배열 아이템의 name 필드
  '/items/*/name': ItemNameInput,

  // 중첩 배열
  '/orders/*/items/*/price': PriceInput,
};

// 매칭 예시:
// /items/0/name ✓
// /items/1/name ✓
// /items/abc/name ✓ (문자열 키도 매칭)
```

### 동적 객체 키 매칭

```typescript
const formTypeInputMap = {
  // 동적 객체의 모든 값
  '/metadata/*': MetadataValueInput,

  // 특정 패턴 내 하위 필드
  '/config/*/enabled': ToggleInput,
};
```

### 복합 패턴

```typescript
const formTypeInputMap = {
  // 여러 레벨의 와일드카드
  '/users/*/addresses/*/city': CityInput,

  // 와일드카드 + 고정 경로
  '/products/*/variants/*/price': ProductPriceInput,
};
```

---

## context 활용

```typescript
// Form에 context 전달
<Form
  jsonSchema={schema}
  context={{
    locale: 'ko_KR',
    userRole: 'admin',
    theme: 'dark',
  }}
/>

// FormTypeInput에서 context 사용
const ContextAwareInput: FC<FormTypeInputProps<string>> = ({
  value,
  onChange,
  context,
}) => {
  const { locale, userRole, theme } = context;

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      style={{ background: theme === 'dark' ? '#333' : '#fff' }}
      placeholder={locale === 'ko_KR' ? '입력하세요' : 'Enter value'}
      disabled={userRole !== 'admin'}
    />
  );
};
```

---

## ChildNodeComponents 활용

객체나 배열 타입에서 자식 노드들을 렌더링할 때 사용합니다.

```typescript
const CustomObjectLayout: FC<FormTypeInputProps<Record<string, any>>> = ({
  ChildNodeComponents,
}) => {
  return (
    <div className="custom-grid">
      {ChildNodeComponents.map((ChildNode, index) => (
        <div key={index} className="grid-item">
          <ChildNode />
        </div>
      ))}
    </div>
  );
};
```

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/03.FormTypeInput.stories.tsx`, `stories/05.WatchValues.stories.tsx`, `stories/27.OptimizeArrayUsecase.stories.tsx`
