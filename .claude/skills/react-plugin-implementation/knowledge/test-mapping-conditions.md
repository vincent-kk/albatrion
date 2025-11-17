# Test 조건 작성 가이드

FormTypeInputDefinition의 `test` 조건을 작성하는 방법과 우선순위 설정 가이드입니다.

## Test 조건 두 가지 방식

### 1. 객체 형태 (FormTypeTestObject)

**사용 시기**: 단순 조건, 명확한 매칭

**장점**:
- 간결하고 읽기 쉬움
- 타입 안전성
- 자동 완성 지원

**구조**:

```typescript
type OptionalString = string | undefined;

type FormTypeTestObject = Partial<{
  type: JsonSchemaType | JsonSchemaType[];  // 'string', 'number' 등
  path: string | string[];  // JSONPointer 경로
  format: OptionalString | OptionalString[];  // 'email', 'date' 등
  formType: OptionalString | OptionalString[];  // 'textarea', 'slider' 등
}>;
```

**예제**:

```typescript
// 단일 type
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;

// 여러 type
export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: { type: ['number', 'integer'] },
} satisfies FormTypeInputDefinition;

// type + format
export const FormTypeInputPasswordDefinition = {
  Component: FormTypeInputPassword,
  test: { type: 'string', format: 'password' },
} satisfies FormTypeInputDefinition;

// type + formType
export const FormTypeInputTextareaDefinition = {
  Component: FormTypeInputTextarea,
  test: { type: 'string', formType: 'textarea' },
} satisfies FormTypeInputDefinition;

// 여러 format
export const FormTypeInputDateTimeDefinition = {
  Component: FormTypeInputDateTime,
  test: { type: 'string', format: ['date', 'date-time'] },
} satisfies FormTypeInputDefinition;

// path 조건
export const FormTypeInputUserNameDefinition = {
  Component: FormTypeInputUserName,
  test: { type: 'string', path: '/user/name' },
} satisfies FormTypeInputDefinition;
```

### 2. 함수 형태 (FormTypeTestFn)

**사용 시기**: 복합 조건, 동적 판단

**장점**:
- 복잡한 로직 표현 가능
- jsonSchema의 다양한 속성 접근
- 동적 조건 판단

**구조**:

```typescript
type Hint = {
  type: JsonSchemaType;
  path: string;
  jsonSchema: JsonSchemaWithVirtual;
  format?: string;
  formType?: string;
};

type FormTypeTestFn = (hint: Hint) => boolean;
```

**예제**:

```typescript
// Enum 조건
export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: ({ type, jsonSchema }: Hint) =>
    type === 'string' &&
    jsonSchema.enum !== undefined &&
    jsonSchema.enum.length > 0,
} satisfies FormTypeInputDefinition;

// Array + Enum 조건
export const FormTypeInputMultiSelectDefinition = {
  Component: FormTypeInputMultiSelect,
  test: ({ type, jsonSchema }: Hint) =>
    type === 'array' &&
    jsonSchema.items?.type === 'string' &&
    jsonSchema.items?.enum !== undefined &&
    jsonSchema.items.enum.length > 0,
} satisfies FormTypeInputDefinition;

// 복합 format 조건
export const FormTypeInputRichTextDefinition = {
  Component: FormTypeInputRichText,
  test: ({ type, format, jsonSchema }: Hint) =>
    type === 'string' &&
    (format === 'html' || format === 'markdown' || jsonSchema.richText === true),
} satisfies FormTypeInputDefinition;

// Range 조건
export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: ({ type, formType, jsonSchema }: Hint) =>
    (type === 'number' || type === 'integer') &&
    formType === 'slider' &&
    jsonSchema.minimum !== undefined &&
    jsonSchema.maximum !== undefined,
} satisfies FormTypeInputDefinition;

// Path 기반 조건
export const FormTypeInputCustomDefinition = {
  Component: FormTypeInputCustom,
  test: ({ path, jsonSchema }: Hint) =>
    path.startsWith('/settings/') &&
    jsonSchema.customComponent === true,
} satisfies FormTypeInputDefinition;
```

## 조건 우선순위 및 순서

**중요**: formTypeInputDefinitions 배열의 순서가 매핑 우선순위입니다.

### 우선순위 원칙

1. **가장 구체적 조건 먼저** (format + formType + 기타)
2. **중간 구체성** (format 또는 formType)
3. **Enum 조건** (함수 형태, 복합 조건)
4. **구조 타입** (array, object)
5. **일반 타입** (type만)

### 권장 순서

```typescript
export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Priority 1: 가장 구체적 (format + formType 등) ===
  
  // type + format + 추가 조건
  FormTypeInputRichTextDefinition,     // string + format: html/markdown + richText
  FormTypeInputPhoneDefinition,        // string + format: tel + pattern
  
  // type + formType + 추가 조건  
  FormTypeInputSliderDefinition,       // number + formType: slider + min/max
  FormTypeInputColorPickerDefinition,  // string + formType: color + pattern
  
  // === Priority 2: 중간 (format 또는 formType) ===
  
  // type + format
  FormTypeInputPasswordDefinition,     // string + format: password
  FormTypeInputTextareaDefinition,     // string + format: textarea
  FormTypeInputEmailDefinition,        // string + format: email
  FormTypeInputUrlDefinition,          // string + format: url
  FormTypeInputDateDefinition,         // string + format: date
  FormTypeInputTimeDefinition,         // string + format: time
  FormTypeInputDateTimeDefinition,     // string + format: date-time
  
  // type + formType
  FormTypeInputRadioGroupDefinition,   // string + formType: radio
  FormTypeInputSwitchDefinition,       // boolean + formType: switch
  
  // === Priority 3: Enum 조건 (함수 형태, 복합) ===
  
  FormTypeInputStringEnumDefinition,   // string + enum exists (함수)
  FormTypeInputNumberEnumDefinition,   // number + enum exists (함수)
  FormTypeInputMultiSelectDefinition,  // array + items.enum exists (함수)
  
  // === Priority 4: 구조 타입 ===
  
  FormTypeInputArrayDefinition,        // type: array
  FormTypeInputObjectDefinition,       // type: object
  
  // === Priority 5: 일반 타입 (마지막!) ===
  
  FormTypeInputNumberDefinition,       // type: number | integer
  FormTypeInputBooleanDefinition,      // type: boolean
  FormTypeInputStringDefinition,       // type: string (가장 마지막!)
];
```

### 순서가 중요한 이유

```typescript
// ❌ 잘못된 순서 - 일반 조건이 먼저
const badOrder = [
  FormTypeInputStringDefinition,     // type: string (너무 일반적!)
  FormTypeInputPasswordDefinition,   // type: string, format: password
  // ↑ Password는 절대 매칭 안 됨! String이 먼저 매칭되기 때문
];

// ✅ 올바른 순서 - 구체적 조건이 먼저
const goodOrder = [
  FormTypeInputPasswordDefinition,   // type: string, format: password
  FormTypeInputStringDefinition,     // type: string
  // ✅ Password가 먼저 체크되므로 올바르게 매칭됨
];
```

## 실전 예제

### 예제 1: Email 입력

```typescript
interface EmailSchema extends JsonSchema {
  type: 'string';
  format: 'email';
}

// 객체 형태 사용 (단순 조건)
export const FormTypeInputEmailDefinition = {
  Component: FormTypeInputEmail,
  test: { type: 'string', format: 'email' },
} satisfies FormTypeInputDefinition;
```

**배치 위치**: Priority 2 (type + format)

### 예제 2: Slider (Range 입력)

```typescript
interface SliderSchema extends JsonSchema {
  type: 'number' | 'integer';
  formType: 'slider';
  minimum: number;
  maximum: number;
  step?: number;
}

// 함수 형태 사용 (복합 조건)
export const FormTypeInputSliderDefinition = {
  Component: FormTypeInputSlider,
  test: ({ type, formType, jsonSchema }: Hint) =>
    (type === 'number' || type === 'integer') &&
    formType === 'slider' &&
    jsonSchema.minimum !== undefined &&
    jsonSchema.maximum !== undefined,
} satisfies FormTypeInputDefinition;
```

**배치 위치**: Priority 1 (type + formType + 추가 조건)

### 예제 3: Multi-Select (Array + Enum)

```typescript
interface MultiSelectSchema extends JsonSchema {
  type: 'array';
  items: {
    type: 'string';
    enum: string[];
  };
}

// 함수 형태 사용 (중첩 속성 체크)
export const FormTypeInputMultiSelectDefinition = {
  Component: FormTypeInputMultiSelect,
  test: ({ type, jsonSchema }: Hint) =>
    type === 'array' &&
    jsonSchema.items?.type === 'string' &&
    jsonSchema.items?.enum !== undefined &&
    jsonSchema.items.enum.length > 0,
} satisfies FormTypeInputDefinition;
```

**배치 위치**: Priority 3 (Enum 조건, 함수 형태)

### 예제 4: Radio Group

```typescript
interface RadioGroupSchema extends JsonSchema {
  type: 'string' | 'number';
  formType: 'radio';
  enum: any[];
}

// 함수 형태 사용 (여러 타입 + 조건)
export const FormTypeInputRadioGroupDefinition = {
  Component: FormTypeInputRadioGroup,
  test: ({ type, formType, jsonSchema }: Hint) =>
    (type === 'string' || type === 'number' || type === 'integer') &&
    formType === 'radio' &&
    jsonSchema.enum !== undefined &&
    jsonSchema.enum.length > 0,
} satisfies FormTypeInputDefinition;
```

**배치 위치**: Priority 2 (type + formType) 또는 Priority 3 (enum 체크 때문)

## 의사결정 플로우

```
조건이 단순한가? (type, format, formType만)
├─ Yes → 객체 형태 사용
│         { type: 'string', format: 'email' }
│
└─ No → 함수 형태 사용
          ({ type, jsonSchema }) => 
            type === 'string' && jsonSchema.enum?.length > 0
```

```
조건이 얼마나 구체적인가?
├─ 매우 구체적 (format + formType + 추가 속성)
│  → Priority 1에 배치
│
├─ 중간 (format 또는 formType)
│  → Priority 2에 배치
│
├─ Enum 조건 (함수 형태)
│  → Priority 3에 배치
│
├─ 구조 타입 (array, object)
│  → Priority 4에 배치
│
└─ 일반 타입 (type만)
   → Priority 5 (마지막)에 배치
```

## 테스트 조건 검증

### 수동 검증

```typescript
import { Hint } from '@canard/schema-form';

// Test hint 생성
const testHint: Hint = {
  type: 'string',
  path: '/email',
  jsonSchema: {
    type: 'string',
    format: 'email',
  },
  format: 'email',
};

// 조건 테스트
const shouldMatch = FormTypeInputEmailDefinition.test(testHint);
console.log(shouldMatch);  // true
```

## 디버깅 팁

### 매칭 로깅

```typescript
// 개발 환경에서만 활성화
if (process.env.NODE_ENV === 'development') {
  export const FormTypeInputStringDefinition = {
    Component: FormTypeInputString,
    test: (hint: Hint) => {
      const matches = hint.type === 'string';
      console.log('FormTypeInputString test:', { hint, matches });
      return matches;
    },
  };
}
```

---

**핵심 원칙**:
1. 단순 조건 → 객체 형태
2. 복합 조건 → 함수 형태
3. 구체적 조건 → 배열 앞쪽
4. 일반 조건 → 배열 뒤쪽
5. 순서가 매핑 우선순위를 결정

