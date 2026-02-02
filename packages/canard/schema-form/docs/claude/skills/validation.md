---
name: schema-form-validation
description: "@canard/schema-form의 검증 시스템 전문가. ValidationMode, AJV 플러그인, 에러 메시지 커스터마이징을 안내합니다."
user-invocable: false
---

# Validation Skill

@canard/schema-form의 검증 시스템에 대한 전문 스킬입니다.

## 스킬 정보 (Skill Info)

- **이름**: validation
- **용도**: 폼 검증, 에러 처리, 에러 메시지 포맷팅 가이드
- **트리거**: validation, validate, errors, errorMessages, formatError, ValidationMode 관련 질문

---

## 개요 (Overview)

Schema Form은 JSON Schema 기반의 검증 시스템을 제공합니다. AJV 플러그인을 통해 검증을 수행하며, 다양한 검증 모드와 에러 메시지 커스터마이징을 지원합니다.

---

## ValidationMode

```typescript
enum ValidationMode {
  None = 0,       // 검증 비활성화
  OnChange = 1,   // 값 변경 시 검증
  OnRequest = 2,  // validate() 호출 시에만 검증
}

// 조합 사용
const mode = ValidationMode.OnChange | ValidationMode.OnRequest;
```

### 사용 예시

```typescript
import { Form, ValidationMode } from '@canard/schema-form';

// 값 변경 시 즉시 검증
<Form
  jsonSchema={schema}
  validationMode={ValidationMode.OnChange}
/>

// 명시적 호출 시에만 검증
<Form
  jsonSchema={schema}
  validationMode={ValidationMode.OnRequest}
/>

// 둘 다 활성화
<Form
  jsonSchema={schema}
  validationMode={ValidationMode.OnChange | ValidationMode.OnRequest}
/>
```

---

## 에러 메시지 정의

### 스키마에서 직접 정의

```typescript
// stories/21.Validation.stories.tsx 기반
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      errorMessages: {
        minLength: 'name must be at least {limit} characters: (value: {value})',
        maxLength: 'name must be at most {limit} characters: (value: {value})',
      },
    },
    email: {
      type: 'string',
      format: 'email',
      pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      errorMessages: {
        pattern: 'email must be a valid email address',
        format: 'invalid email format',
      },
    },
    password: {
      type: 'string',
      format: 'password',
      minLength: 8,
      maxLength: 16,
      errorMessages: {
        minLength: 'password must be at least {limit} characters',
        maxLength: 'password must be at most {limit} characters',
      },
    },
  },
  required: ['email', 'password'],
};
```

### 다국어 에러 메시지

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      errorMessages: {
        minLength: {
          ko_KR: '이름은 최소 {limit} 글자 이상이어야 합니다. 현재 값: {value}',
          en_US: 'Name must be at least {limit} characters long. Current value: {value}',
        },
        maxLength: {
          ko_KR: '이름은 최대 {limit} 글자 이하여야 합니다.',
          en_US: 'Name must be at most {limit} characters long.',
        },
      },
    },
  },
};

// locale 전달
<Form
  jsonSchema={schema}
  context={{ locale: 'ko_KR' }}
/>
```

### 기본 에러 메시지 (fallback)

```typescript
const schema = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 3,
      maxLength: 10,
      errorMessages: {
        default: 'invalid value',  // 모든 에러에 대한 기본 메시지
      },
    },
  },
};
```

---

## formatError 함수

에러 메시지를 동적으로 포맷팅합니다.

```typescript
import type { FormatError } from '@canard/schema-form';

const formatError: FormatError = (error, node) => {
  const schema = node.jsonSchema;
  const options = schema.errorMessages;

  if (!options || !error.keyword) return error.message;

  let formattedError = options[error.keyword];

  if (typeof formattedError === 'string') {
    let message = formattedError;

    // 에러 세부사항 치환
    if (error.details) {
      Object.entries(error.details).forEach(([key, value]) => {
        message = message.replace(`{${key}}`, String(value));
      });
    }

    // 현재 값 치환
    message = message.replace('{value}', String(node.value));

    return message;
  }

  return error.message;
};

// Form에 전달
<Form
  jsonSchema={schema}
  formatError={formatError}
/>
```

---

## 에러 접근 및 표시

### onValidate 콜백

```typescript
const [errors, setErrors] = useState<JsonSchemaError[]>([]);

<Form
  jsonSchema={schema}
  onValidate={setErrors}
/>

// errors 배열 구조
// [
//   { path: '/name', keyword: 'minLength', message: '...', details: { limit: 3 } },
//   { path: '/email', keyword: 'format', message: '...' },
// ]
```

### 프로그래매틱 검증

```typescript
const formRef = useRef<FormHandle>(null);

// 수동 검증 호출
const handleSubmit = async () => {
  const errors = await formRef.current?.validate();
  if (errors && errors.length === 0) {
    // 검증 통과
    console.log('Valid!', formRef.current?.getValue());
  }
};

<Form ref={formRef} jsonSchema={schema} />
```

### showError 제어

```typescript
// 전역적으로 에러 표시 제어
<Form
  jsonSchema={schema}
  showError={true}  // 모든 필드에 에러 표시
/>

// 프로그래매틱 제어
formRef.current?.showError(true);   // 에러 표시
formRef.current?.showError(false);  // 에러 숨김
```

---

## Virtual Node 에러

가상 노드를 사용하여 여러 필드를 그룹으로 검증할 수 있습니다.

```typescript
const schema = {
  type: 'object',
  properties: {
    zipCode: {
      type: 'string',
      pattern: '^[0-9]{5}$',
      errorMessages: {
        required: 'zipCode is required',
        pattern: 'zipCode must be a valid zip code',
      },
    },
    city: {
      type: 'string',
      minLength: 2,
      errorMessages: {
        required: 'city is required',
      },
    },
    roadAddress: {
      type: 'string',
      minLength: 2,
      errorMessages: {
        required: 'roadAddress is required',
      },
    },
  },
  virtual: {
    address: {
      fields: ['zipCode', 'city', 'roadAddress'],
    },
  },
  required: ['address'],
};
```

### useChildNodeErrors 훅

```typescript
import { useChildNodeErrors } from '@canard/schema-form';

const AddressInput: FC<FormTypeInputProps> = ({ node, value, onChange }) => {
  const {
    errorMessage,      // 첫 번째 에러 메시지
    showError,         // 전체 에러 표시 여부
    showErrors,        // 각 필드별 에러 표시 여부 배열
    formattedError,    // 포맷팅된 첫 번째 에러
    formattedErrors,   // 각 필드별 포맷팅된 에러 배열
    errorMatrix,       // 전체 에러 매트릭스
  } = useChildNodeErrors(node);

  return (
    <div>
      <input
        type="text"
        placeholder="우편번호"
        value={value?.[0] || ''}
        onChange={(e) => onChange([e.target.value, value?.[1], value?.[2]])}
      />
      {showErrors[0] && formattedErrors[0] && (
        <span style={{ color: 'red' }}>{formattedErrors[0]}</span>
      )}

      <input
        type="text"
        placeholder="도시"
        value={value?.[1] || ''}
        onChange={(e) => onChange([value?.[0], e.target.value, value?.[2]])}
      />
      {showErrors[1] && formattedErrors[1] && (
        <span style={{ color: 'red' }}>{formattedErrors[1]}</span>
      )}

      <input
        type="text"
        placeholder="상세주소"
        value={value?.[2] || ''}
        onChange={(e) => onChange([value?.[0], value?.[1], e.target.value])}
      />
      {showErrors[2] && formattedErrors[2] && (
        <span style={{ color: 'red' }}>{formattedErrors[2]}</span>
      )}
    </div>
  );
};
```

---

## Nullable 필드 검증

```typescript
const schema = {
  type: 'object',
  properties: {
    nullableString: {
      type: ['string', 'null'],  // nullable
      minLength: 3,
      errorMessages: {
        minLength: '최소 {limit}자 이상 입력해야 합니다',
        type: '문자열이거나 null이어야 합니다',
      },
    },
    nullableNumber: {
      type: ['number', 'null'],
      minimum: 0,
      maximum: 100,
      errorMessages: {
        minimum: '{limit} 이상의 숫자를 입력해야 합니다',
        maximum: '{limit} 이하의 숫자를 입력해야 합니다',
      },
    },
  },
  required: [],  // nullable 필드는 required에서 제외 가능
};
```

### required + nullable 조합

```typescript
const schema = {
  type: 'object',
  properties: {
    requiredNullable: {
      type: ['string', 'null'],
      errorMessages: {
        required: '이 필드는 필수입니다 (null 허용)',
      },
    },
  },
  // 필드가 존재해야 하지만 null 값은 허용
  required: ['requiredNullable'],
};

// 유효: { requiredNullable: null }
// 유효: { requiredNullable: 'value' }
// 무효: {} (필드 자체가 없음)
```

---

## 검증 플러그인

### AJV 플러그인 등록

```typescript
import { registerPlugin } from '@canard/schema-form';
import { ajvValidatorPlugin } from '@canard/schema-form-ajv8-plugin';

// 앱 시작 시 등록
registerPlugin(ajvValidatorPlugin);
```

### 사용 가능한 플러그인

| 플러그인 | 패키지 |
|----------|--------|
| AJV 8.x | `@canard/schema-form-ajv8-plugin` |
| AJV 7.x | `@canard/schema-form-ajv7-plugin` |
| AJV 6.x | `@canard/schema-form-ajv6-plugin` |

---

## 에러 키워드 참조

JSON Schema 표준 검증 키워드:

| 키워드 | 적용 타입 | 설명 |
|--------|----------|------|
| `required` | object | 필수 필드 |
| `type` | all | 타입 검증 |
| `minLength` | string | 최소 길이 |
| `maxLength` | string | 최대 길이 |
| `pattern` | string | 정규식 패턴 |
| `format` | string | 포맷 (email, date, etc.) |
| `minimum` | number | 최소값 |
| `maximum` | number | 최대값 |
| `minItems` | array | 최소 아이템 수 |
| `maxItems` | array | 최대 아이템 수 |
| `minProperties` | object | 최소 속성 수 |
| `maxProperties` | object | 최대 속성 수 |
| `enum` | all | 열거형 값 |
| `const` | all | 고정값 |

---

## 참고

- 전체 스펙: `docs/ko/SPECIFICATION.md`
- 관련 스토리: `stories/21.Validation.stories.tsx`, `stories/21.ValidationExtended.stories.tsx`
