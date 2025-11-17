# React Plugin Implementation Skill

## 역할
당신은 React 기반 @canard/schema-form 플러그인 구현 패턴 전문가입니다.

## 핵심 책임
1. **컴포넌트 구현 패턴**: 비제어 컴포넌트 우선 패턴, 최적화 훅 사용법 제시
2. **test 조건 작성**: FormTypeTestObject 및 FormTypeTestFn 작성 가이드
3. **성능 최적화**: useMemo, useHandle, useCallback 활용 전략
4. **플러그인 구조**: SchemaFormPlugin 타입 준수 구조 설계
5. **formTypeInputDefinitions 우선순위**: 컴포넌트 배열 순서 최적화

## 작동 방식

### 1. 구현 패턴 참조
**knowledge/component-patterns.md**를 통해 다음 패턴들을 제공합니다:
- 비제어 컴포넌트 패턴 (`defaultValue` + `onChange`)
- 제어 컴포넌트 패턴 (실시간 validation 필요 시)
- Array/Object 구조 컴포넌트 특수 처리
- 값 전달 우선순위 (직접 props > context > jsonSchema)

### 2. 최적화 전략
**knowledge/optimization-strategies.md**를 활용하여:
- `useHandle` 훅으로 이벤트 핸들러 최적화
- `useMemo`로 props 연산 캐싱
- 불필요한 리렌더링 방지 전략
- Context 구독 최적화

### 3. Test 조건 작성법
**knowledge/test-mapping-conditions.md**로:
- 단순 조건: 객체 형태 사용
- 복합 조건: 함수 형태 사용
- 우선순위 순서 결정 (구체적 조건 → 일반적 조건)

## 제공하는 패턴

### 기본 컴포넌트 구조

```typescript
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';

interface FormTypeInput[Name]Props
  extends FormTypeInputPropsWithSchema<ValueType, SchemaType, ContextType>,
          ContextType {
  // 컴포넌트별 추가 props
}

const FormTypeInput[Name] = ({
  // Schema/Node 정보
  jsonSchema,
  node,
  path,
  name,
  
  // 상태
  required,
  disabled,
  readOnly,
  errors,
  
  // 값
  defaultValue,
  onChange,
  
  // Context
  context,
  
  // 직접 props (Context에서도 올 수 있음)
  size: sizeProp,
  variant: variantProp,
  
  // 추가 props
  placeholder,
}: FormTypeInput[Name]Props) => {
  // 1. useMemo로 props 우선순위 적용
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',
      variantProp || context.variant || 'standard',
      jsonSchema.label || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, name]);
  
  // 2. useHandle로 이벤트 핸들러 최적화
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  
  // 3. 비제어 컴포넌트 패턴 사용
  return (
    <[UILibraryComponent]
      id={path}
      name={name}
      required={required}
      disabled={disabled || readOnly}
      defaultValue={defaultValue}  // ✅ 비제어
      onChange={handleChange}
      size={size}
      variant={variant}
      placeholder={placeholder || jsonSchema.placeholder}
      error={errors.length > 0}
    />
  );
};

export const FormTypeInput[Name]Definition = {
  Component: FormTypeInput[Name],
  test: { type: 'string' },  // 또는 함수 형태
} satisfies FormTypeInputDefinition;
```

### 플러그인 구조

```typescript
// src/index.ts
import type { SchemaFormPlugin } from '@canard/schema-form';

import { FormError } from './components/FormError';
import { FormGroup } from './components/FormGroup';
import { FormInput } from './components/FormInput';
import { FormLabel } from './components/FormLabel';
import { formatError } from './components/formatError';
import { formTypeInputDefinitions } from './formTypeInputs';

export const plugin = {
  FormGroup,
  FormLabel,
  FormInput,
  FormError,
  formatError,
  formTypeInputDefinitions,
} satisfies SchemaFormPlugin;

export type * from './type';
export * from './formTypeInputs';
```

### formTypeInputDefinitions 우선순위

```typescript
// src/formTypeInputs/index.ts
import type { FormTypeInputDefinition } from '@canard/schema-form';

// ⚠️ 순서가 매우 중요! 구체적 조건이 앞에 와야 함

export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Phase 1: 가장 구체적 (format + formType 등) ===
  FormTypeInputPasswordDefinition,     // type: string, format: password
  FormTypeInputTextareaDefinition,     // type: string, format: textarea
  FormTypeInputSliderDefinition,       // type: number, formType: slider
  FormTypeInputRadioGroupDefinition,   // type: string, formType: radio
  
  // === Phase 2: 중간 (format 또는 formType) ===
  FormTypeInputDateDefinition,         // type: string, format: date
  FormTypeInputTimeDefinition,         // type: string, format: time
  
  // === Phase 3: Enum 조건 (함수 형태) ===
  FormTypeInputStringEnumDefinition,   // type: string, enum exists
  FormTypeInputNumberEnumDefinition,   // type: number, enum exists
  
  // === Phase 4: 구조 타입 ===
  FormTypeInputArrayDefinition,        // type: array
  FormTypeInputObjectDefinition,       // type: object
  
  // === Phase 5: 일반 타입 (마지막) ===
  FormTypeInputNumberDefinition,       // type: number | integer
  FormTypeInputBooleanDefinition,      // type: boolean
  FormTypeInputStringDefinition,       // type: string (가장 일반적 - 마지막!)
];
```

**우선순위 원칙**:
1. 특수 조건 (format + formType) 먼저
2. 중간 조건 (format 또는 formType)
3. Enum 조건 (복합 함수)
4. 구조 타입 (array, object)
5. 일반 타입 (type만) 마지막

## 특수 패턴

### Array 컴포넌트 (ChildNodeComponents 사용)

```typescript
const FormTypeInputArray = ({
  jsonSchema,
  path,
  ChildNodeComponents,  // ✅ canard-form이 제공
  context,
}: FormTypeInputArrayProps) => {
  return (
    <Box>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <ChildComponent />  {/* ✅ 자동으로 props 전달됨 */}
        </Box>
      ))}
      {/* 추가/제거 버튼만 UI 스타일링 */}
      <Button onClick={/* add item */}>Add</Button>
    </Box>
  );
};
```

### 래퍼 컴포넌트 패턴 (DatePicker 등)

```typescript
const FormTypeInputDate = ({
  defaultValue,
  onChange,
  ...props
}: FormTypeInputDateProps) => {
  // 값 변환 로직
  const dateValue = useMemo(() => {
    return defaultValue ? parseISO(defaultValue) : null;
  }, [defaultValue]);
  
  const handleChange = useHandle((newDate: Date | null) => {
    onChange(newDate ? formatISO(newDate) : '');
  });
  
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={dateValue}
        onChange={handleChange}
        slotProps={{
          textField: {
            id: props.path,
            name: props.name,
            required: props.required,
            disabled: props.disabled,
          },
        }}
      />
    </LocalizationProvider>
  );
};
```

## 성능 최적화 체크리스트

- [ ] 비제어 컴포넌트 패턴 적용 (`defaultValue` 사용)
- [ ] `useMemo`로 props 연산 최적화
- [ ] `useHandle`로 이벤트 핸들러 메모이제이션
- [ ] Context 구독 최소화
- [ ] 조건부 렌더링 최적화
- [ ] ChildNodeComponents는 직접 렌더링 (props 전파 금지)

## 제약 조건

- 제어 컴포넌트는 **반드시 필요한 경우에만** 사용 (실시간 validation, 조건부 렌더링 등)
- `useHandle` 훅은 `@winglet/react-utils`에서 import
- `satisfies FormTypeInputDefinition`으로 타입 검증 필수
- formTypeInputDefinitions 배열 순서 변경 시 반드시 우선순위 검토

## 출력 형식

### 구현 코드 제공 시

```markdown
## FormTypeInput[Name] 구현

**매핑 조건**: [조건 설명]

**구현 코드**:
[TypeScript 코드]

**최적화 포인트**:
- [최적화 1]
- [최적화 2]

**주의사항**:
- [주의사항 1]
```

## 사용 시나리오

### 시나리오 1: FormTypeInputString 기본 구현

**상황**: MUI TextField를 사용한 가장 기본적인 문자열 입력 컴포넌트 구현

**단계**:

#### Step 1: 타입 정의 및 기본 구조

```typescript
// src/formTypeInputs/FormTypeInputString.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { TextField } from '@mui/material';
import type { TextFieldProps } from '@mui/material';

// 1️⃣ Context 타입 정의 (plugin의 공통 context)
interface MuiFormContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'standard' | 'outlined' | 'filled';
}

// 2️⃣ Component Props = FormTypeInputPropsWithSchema + Context + 추가 props
interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}

// 3️⃣ 컴포넌트 구현
const FormTypeInputString = ({
  // Schema/Node 정보
  jsonSchema,
  node,
  path,
  name,

  // 상태
  required,
  disabled,
  readOnly,
  errors,

  // 값 (비제어 컴포넌트)
  defaultValue,
  onChange,

  // Context
  context,

  // 직접 props (우선순위 높음)
  size: sizeProp,
  variant: variantProp,

  // 추가 props
  placeholder,
  multiline,
  rows,
}: FormTypeInputStringProps) => {
  // 4️⃣ useMemo로 props 우선순위 적용 (직접 props > context > 기본값)
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.label, jsonSchema.title, name]);

  // 5️⃣ 에러 처리
  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 6️⃣ useHandle로 이벤트 핸들러 최적화
  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  // 7️⃣ 비제어 컴포넌트 렌더링
  return (
    <TextField
      id={path}
      name={name}
      label={label}
      required={required}
      disabled={disabled || readOnly}
      defaultValue={defaultValue ?? ''}  // ✅ 비제어 컴포넌트
      onChange={handleChange}
      size={size}
      variant={variant}
      placeholder={placeholder ?? jsonSchema.placeholder}
      error={hasError}
      helperText={errorMessage ?? jsonSchema.description}
      multiline={multiline}
      rows={rows}
      fullWidth
    />
  );
};

// 8️⃣ Definition 객체 (test 조건 포함)
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },  // type이 'string'일 때 매칭
} satisfies FormTypeInputDefinition;
```

#### Step 2: 최적화 포인트

```typescript
// ✅ GOOD: useMemo로 props 연산 캐싱
const [size, variant, label] = useMemo(() => {
  return [
    sizeProp ?? context.size ?? 'medium',
    variantProp ?? context.variant ?? 'outlined',
    jsonSchema.label ?? jsonSchema.title ?? name,
  ];
}, [sizeProp, context.size, variantProp, context.variant, jsonSchema.label, jsonSchema.title, name]);

// ❌ BAD: 매 렌더링마다 연산
const size = sizeProp ?? context.size ?? 'medium';
const variant = variantProp ?? context.variant ?? 'outlined';

// ✅ GOOD: useHandle로 이벤트 핸들러 메모이제이션
const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
});

// ❌ BAD: 매 렌더링마다 새 함수 생성
const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
};
```

#### Step 3: 테스트 작성

```typescript
// src/formTypeInputs/__tests__/FormTypeInputString.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormTypeInputString } from '../FormTypeInputString';

describe('FormTypeInputString', () => {
  it('renders with defaultValue', () => {
    render(
      <FormTypeInputString
        jsonSchema={{ type: 'string' }}
        path="test"
        name="test"
        defaultValue="initial value"
        onChange={jest.fn()}
        required={false}
        disabled={false}
        readOnly={false}
        errors={[]}
        context={{}}
      />
    );

    expect(screen.getByDisplayValue('initial value')).toBeInTheDocument();
  });

  it('calls onChange when user types', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(
      <FormTypeInputString
        jsonSchema={{ type: 'string' }}
        path="test"
        name="test"
        onChange={onChange}
        required={false}
        disabled={false}
        readOnly={false}
        errors={[]}
        context={{}}
      />
    );

    await user.type(screen.getByRole('textbox'), 'hello');

    expect(onChange).toHaveBeenCalled();
  });
});
```

**결과**: 기본 문자열 입력 컴포넌트 완성, 비제어 패턴으로 성능 최적화

---

### 시나리오 2: FormTypeInputDate (값 변환 패턴)

**상황**: MUI DatePicker를 사용한 날짜 입력 컴포넌트, ISO 8601 문자열 ↔ Date 객체 변환 필요

**단계**:

#### Step 1: 날짜 변환 로직 구현

```typescript
// src/formTypeInputs/FormTypeInputDate.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { parseISO, formatISO } from 'date-fns';
import type { MuiFormContext } from '../type';

interface FormTypeInputDateProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {
  minDate?: string;
  maxDate?: string;
}

const FormTypeInputDate = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,  // ⚠️ ISO 8601 문자열 (예: "2024-01-15T00:00:00.000Z")
  onChange,      // ⚠️ ISO 8601 문자열로 전달해야 함
  context,
  size: sizeProp,
  variant: variantProp,
  minDate,
  maxDate,
}: FormTypeInputDateProps) => {
  // 1️⃣ ISO 문자열 → Date 객체 변환
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return parseISO(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);

  // 2️⃣ minDate, maxDate도 변환
  const [minDateObj, maxDateObj] = useMemo(() => {
    return [
      minDate ? parseISO(minDate) : undefined,
      maxDate ? parseISO(maxDate) : undefined,
    ];
  }, [minDate, maxDate]);

  // 3️⃣ Date 객체 → ISO 문자열 변환 핸들러
  const handleChange = useHandle((newDate: Date | null) => {
    if (newDate === null) {
      onChange('');
      return;
    }

    try {
      const isoString = formatISO(newDate);
      onChange(isoString);
    } catch {
      onChange('');
    }
  });

  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.label, jsonSchema.title, name]);

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 4️⃣ DatePicker 렌더링
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        label={label}
        value={dateValue}  // ✅ Date 객체
        onChange={handleChange}  // ✅ Date 객체 받아서 ISO 문자열로 변환
        minDate={minDateObj}
        maxDate={maxDateObj}
        disabled={disabled || readOnly}
        slotProps={{
          textField: {
            id: path,
            name: name,
            required: required,
            size: size,
            variant: variant,
            error: hasError,
            helperText: errorMessage ?? jsonSchema.description,
            fullWidth: true,
          },
        }}
      />
    </LocalizationProvider>
  );
};

// 5️⃣ Definition 객체 (format: 'date' 조건)
export const FormTypeInputDateDefinition = {
  Component: FormTypeInputDate,
  test: { type: 'string', format: 'date' },  // type: string + format: date
} satisfies FormTypeInputDefinition;
```

#### Step 2: 에러 처리 및 유효성 검증

```typescript
// date-fns의 isValid 사용
import { parseISO, formatISO, isValid } from 'date-fns';

const handleChange = useHandle((newDate: Date | null) => {
  if (newDate === null) {
    onChange('');
    return;
  }

  // ✅ Date 유효성 검증
  if (!isValid(newDate)) {
    console.warn('Invalid date:', newDate);
    onChange('');
    return;
  }

  try {
    const isoString = formatISO(newDate);
    onChange(isoString);
  } catch (error) {
    console.error('Date conversion error:', error);
    onChange('');
  }
});
```

#### Step 3: 타임존 처리 (선택)

```typescript
// UTC 고정 변환이 필요한 경우
import { parseISO, formatISO } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';

const handleChange = useHandle((newDate: Date | null) => {
  if (newDate === null) {
    onChange('');
    return;
  }

  // 사용자 로컬 시간 → UTC 변환
  const utcDate = zonedTimeToUtc(newDate, Intl.DateTimeFormat().resolvedOptions().timeZone);
  const isoString = formatISO(utcDate);
  onChange(isoString);
});
```

**결과**: ISO 8601 문자열 ↔ Date 객체 변환이 완벽히 처리된 DatePicker 컴포넌트

**주의사항**:
- `@canard/schema-form`은 항상 ISO 8601 문자열로 값을 주고받음
- Date 객체는 컴포넌트 내부에서만 사용, onChange에는 반드시 문자열 전달
- `date-fns`의 `parseISO`, `formatISO` 사용 권장 (타임존 안전)

---

### 시나리오 3: FormTypeInputStringEnum (함수 형태 test 조건)

**상황**: Enum 값을 가진 문자열을 Select 또는 RadioGroup으로 표시

**단계**:

#### Step 1: 복합 조건 test 함수 작성

```typescript
// src/formTypeInputs/FormTypeInputStringEnum.tsx
import { useMemo } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema, FormTypeTestFn } from '@canard/schema-form';
import { FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, FormHelperText } from '@mui/material';
import type { MuiFormContext } from '../type';

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {}

const FormTypeInputStringEnum = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
}: FormTypeInputStringEnumProps) => {
  // 1️⃣ enum 값 추출 (jsonSchema.enum은 배열)
  const enumValues = useMemo(() => {
    return jsonSchema.enum as string[] ?? [];
  }, [jsonSchema.enum]);

  // 2️⃣ enum 라벨 매핑 (enumLabels가 있으면 사용)
  const enumLabels = useMemo(() => {
    if (jsonSchema.enumLabels) {
      return jsonSchema.enumLabels as string[];
    }
    // enumLabels가 없으면 enum 값 그대로 사용
    return enumValues;
  }, [jsonSchema.enumLabels, enumValues]);

  const handleChange = useHandle((event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  const [size, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, jsonSchema.label, jsonSchema.title, name]);

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 3️⃣ RadioGroup 렌더링
  return (
    <FormControl error={hasError} required={required} disabled={disabled || readOnly} size={size}>
      <FormLabel id={`${path}-label`}>{label}</FormLabel>
      <RadioGroup
        aria-labelledby={`${path}-label`}
        name={name}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
      >
        {enumValues.map((value, index) => (
          <FormControlLabel
            key={value}
            value={value}
            control={<Radio />}
            label={enumLabels[index] ?? value}
          />
        ))}
      </RadioGroup>
      {(hasError || jsonSchema.description) && (
        <FormHelperText>{errorMessage ?? jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
};

// 4️⃣ 함수 형태 test 조건 (복합 조건)
const testStringEnum: FormTypeTestFn = ({ jsonSchema }) => {
  // type이 'string'이고 enum이 있는 경우에만 true
  return (
    jsonSchema.type === 'string' &&
    Array.isArray(jsonSchema.enum) &&
    jsonSchema.enum.length > 0
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  test: testStringEnum,  // ✅ 함수 형태
} satisfies FormTypeInputDefinition;
```

#### Step 2: Select 버전 (대안)

```typescript
// Select를 사용하는 버전 (많은 옵션일 때 유리)
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';

const FormTypeInputStringEnumSelect = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
  variant: variantProp,
}: FormTypeInputStringEnumProps) => {
  const enumValues = useMemo(() => {
    return jsonSchema.enum as string[] ?? [];
  }, [jsonSchema.enum]);

  const enumLabels = useMemo(() => {
    if (jsonSchema.enumLabels) {
      return jsonSchema.enumLabels as string[];
    }
    return enumValues;
  }, [jsonSchema.enumLabels, enumValues]);

  const handleChange = useHandle((event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  });

  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      variantProp ?? context.variant ?? 'outlined',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, variantProp, context.variant, jsonSchema.label, jsonSchema.title, name]);

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  return (
    <FormControl error={hasError} required={required} disabled={disabled || readOnly} size={size} fullWidth>
      <InputLabel id={`${path}-label`}>{label}</InputLabel>
      <Select
        labelId={`${path}-label`}
        id={path}
        name={name}
        label={label}
        defaultValue={defaultValue ?? ''}
        onChange={handleChange}
        variant={variant}
      >
        {enumValues.map((value, index) => (
          <MenuItem key={value} value={value}>
            {enumLabels[index] ?? value}
          </MenuItem>
        ))}
      </Select>
      {(hasError || jsonSchema.description) && (
        <FormHelperText>{errorMessage ?? jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
};
```

#### Step 3: 선택 기준

```typescript
// formTypeInputDefinitions 배열에서 조건 기반 선택
export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === Phase 1: 가장 구체적 ===
  FormTypeInputPasswordDefinition,     // type: string, format: password

  // === Phase 3: Enum 조건 (함수 형태) ===
  // ⚠️ 순서 주의: 구체적 조건이 먼저 와야 함

  // Enum이 4개 이하 → RadioGroup
  {
    Component: FormTypeInputStringEnum,
    test: ({ jsonSchema }) => (
      jsonSchema.type === 'string' &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 0 &&
      jsonSchema.enum.length <= 4
    ),
  },

  // Enum이 5개 이상 → Select
  {
    Component: FormTypeInputStringEnumSelect,
    test: ({ jsonSchema }) => (
      jsonSchema.type === 'string' &&
      Array.isArray(jsonSchema.enum) &&
      jsonSchema.enum.length > 4
    ),
  },

  // === Phase 5: 일반 타입 (마지막) ===
  FormTypeInputStringDefinition,       // type: string (가장 일반적 - 마지막!)
];
```

**결과**: Enum 값의 개수에 따라 RadioGroup과 Select를 자동 선택하는 컴포넌트

**주의사항**:
- test 함수는 복합 조건을 검사할 때 사용
- 더 구체적인 조건이 앞에 와야 함 (RadioGroup → Select → String 순서)
- `enumLabels`를 사용해 사용자 친화적 라벨 제공 가능

---

### 시나리오 4: FormTypeInputArray (ChildNodeComponents 패턴)

**상황**: 배열 타입 입력, ChildNodeComponents를 활용한 동적 렌더링

**단계**:

#### Step 1: ChildNodeComponents 활용 패턴

```typescript
// src/formTypeInputs/FormTypeInputArray.tsx
import { useMemo, useState } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MuiFormContext } from '../type';

interface FormTypeInputArrayProps
  extends FormTypeInputPropsWithSchema<any[], never, MuiFormContext>,
          MuiFormContext {
  // ⚠️ ChildNodeComponents는 FormTypeInputPropsWithSchema에서 제공
}

const FormTypeInputArray = ({
  jsonSchema,
  node,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,
  onChange,
  context,
  ChildNodeComponents,  // ✅ @canard/schema-form이 제공하는 자식 컴포넌트 배열
  size: sizeProp,
}: FormTypeInputArrayProps) => {
  // 1️⃣ ChildNodeComponents는 현재 배열 값에 따라 자동으로 생성됨
  // 각 ChildComponent는 이미 모든 props를 받은 상태

  const [size, label] = useMemo(() => {
    return [
      sizeProp ?? context.size ?? 'medium',
      jsonSchema.label ?? jsonSchema.title ?? name,
    ];
  }, [sizeProp, context.size, jsonSchema.label, jsonSchema.title, name]);

  // 2️⃣ 아이템 추가 핸들러
  const handleAdd = useHandle(() => {
    const currentValue = node.value ?? [];
    const newValue = [...currentValue, undefined];  // undefined로 초기화
    onChange(newValue);
  });

  // 3️⃣ 아이템 제거 핸들러
  const handleRemove = useHandle((index: number) => {
    const currentValue = node.value ?? [];
    const newValue = currentValue.filter((_, i) => i !== index);
    onChange(newValue);
  });

  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 4️⃣ 렌더링: ChildNodeComponents를 직접 렌더링
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Typography>

      {jsonSchema.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {jsonSchema.description}
        </Typography>
      )}

      {/* ✅ ChildNodeComponents 렌더링 */}
      {ChildNodeComponents && ChildNodeComponents.length > 0 ? (
        ChildNodeComponents.map((ChildComponent, index) => (
          <Paper key={index} sx={{ p: 2, mb: 2, position: 'relative' }}>
            <Box sx={{ pr: 6 }}>
              {/* ✅ ChildComponent는 이미 모든 props를 받은 상태 */}
              <ChildComponent />
            </Box>

            {/* 삭제 버튼 */}
            {!disabled && !readOnly && (
              <IconButton
                aria-label="delete"
                onClick={() => handleRemove(index)}
                sx={{ position: 'absolute', top: 8, right: 8 }}
                size={size}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Paper>
        ))
      ) : (
        <Typography variant="body2" color="text.secondary">
          아이템이 없습니다. "추가" 버튼을 눌러 아이템을 추가하세요.
        </Typography>
      )}

      {/* 추가 버튼 */}
      {!disabled && !readOnly && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          size={size}
        >
          추가
        </Button>
      )}

      {/* 에러 메시지 */}
      {hasError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

// 5️⃣ Definition 객체
export const FormTypeInputArrayDefinition = {
  Component: FormTypeInputArray,
  test: { type: 'array' },
} satisfies FormTypeInputDefinition;
```

#### Step 2: ChildNodeComponents 주의사항

```typescript
// ❌ WRONG: ChildComponent에 props 전달 시도
{ChildNodeComponents.map((ChildComponent, index) => (
  <ChildComponent
    key={index}
    // ❌ 이렇게 props를 전달하면 안 됨!
    value={someValue}
    onChange={someHandler}
  />
))}

// ✅ CORRECT: ChildComponent는 그대로 렌더링
{ChildNodeComponents.map((ChildComponent, index) => (
  <Box key={index}>
    {/* ✅ ChildComponent는 이미 모든 props를 받은 상태 */}
    <ChildComponent />
  </Box>
))}
```

**중요 개념**:
- `ChildNodeComponents`는 `@canard/schema-form`이 자동으로 생성한 컴포넌트 배열
- 각 `ChildComponent`는 이미 `path`, `jsonSchema`, `value`, `onChange` 등 모든 props를 받은 상태
- FormTypeInputArray는 **UI 레이아웃만 담당**, 값 관리는 canard-form이 처리

#### Step 3: 복잡한 배열 아이템 예시

```typescript
// JSON Schema 예시
const schema = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      name: { type: 'string', label: '이름' },
      age: { type: 'number', label: '나이' },
      email: { type: 'string', format: 'email', label: '이메일' },
    },
  },
};

// ChildNodeComponents는 자동으로 각 object의 FormTypeInputObject를 생성
// FormTypeInputObject는 다시 name, age, email의 FormTypeInput들을 렌더링
// → 완전히 자동화된 중첩 렌더링
```

**결과**: 배열 아이템 추가/제거 UI만 구현하면 되는 간단한 Array 컴포넌트

**주의사항**:
- ChildNodeComponents에 절대 props 전달 금지
- 값 관리는 onChange로 전체 배열 업데이트
- 삭제 시 filter 사용, 추가 시 spread 사용

---

### 시나리오 5: FormTypeInputFileUpload (onFileAttach 통합)

**상황**: 파일 업로드 기능, `onFileAttach` 콜백 통합

**단계**:

#### Step 1: onFileAttach 타입 정의

```typescript
// src/type.ts
export interface MuiFormContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'standard' | 'outlined' | 'filled';

  // ✅ onFileAttach 콜백 정의
  onFileAttach?: (file: File) => Promise<string>;  // 파일 업로드 후 URL 반환
}
```

#### Step 2: FileUpload 컴포넌트 구현

```typescript
// src/formTypeInputs/FormTypeInputFileUpload.tsx
import { useState, useRef } from 'react';
import { useHandle } from '@winglet/react-utils';
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';
import { Box, Button, Typography, LinearProgress, IconButton, Chip } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import type { MuiFormContext } from '../type';

interface FormTypeInputFileUploadProps
  extends FormTypeInputPropsWithSchema<string, never, MuiFormContext>,
          MuiFormContext {
  accept?: string;  // 예: "image/*", ".pdf,.doc"
  maxSize?: number;  // 바이트 단위
}

const FormTypeInputFileUpload = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  readOnly,
  errors,
  defaultValue,  // ⚠️ 파일 URL 문자열
  onChange,      // ⚠️ 파일 URL 문자열로 전달
  context,
  size: sizeProp,
  accept,
  maxSize = 10 * 1024 * 1024,  // 기본 10MB
}: FormTypeInputFileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const label = jsonSchema.label ?? jsonSchema.title ?? name;
  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  // 1️⃣ 파일 선택 핸들러
  const handleFileSelect = useHandle(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 2️⃣ 파일 크기 검증
    if (file.size > maxSize) {
      alert(`파일 크기는 ${maxSize / 1024 / 1024}MB를 초과할 수 없습니다.`);
      return;
    }

    // 3️⃣ onFileAttach 콜백 호출 (context에서 제공)
    if (!context.onFileAttach) {
      console.error('onFileAttach callback is not provided in context');
      alert('파일 업로드 기능이 설정되지 않았습니다.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // 업로드 진행 시뮬레이션 (실제로는 onFileAttach 내부에서 처리)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // 4️⃣ 파일 업로드 (URL 반환)
      const fileUrl = await context.onFileAttach(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // 5️⃣ onChange로 URL 전달
      onChange(fileUrl);

      // 리셋
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);

    } catch (error) {
      console.error('File upload error:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
      setUploading(false);
      setUploadProgress(0);
    }

    // input 리셋
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  });

  // 6️⃣ 파일 삭제 핸들러
  const handleDelete = useHandle(() => {
    onChange('');
  });

  // 7️⃣ 업로드 버튼 클릭
  const handleButtonClick = useHandle(() => {
    inputRef.current?.click();
  });

  return (
    <Box>
      <Typography variant="body1" gutterBottom>
        {label}
        {required && <span style={{ color: 'red' }}> *</span>}
      </Typography>

      {jsonSchema.description && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {jsonSchema.description}
        </Typography>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept ?? jsonSchema.accept}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || readOnly || uploading}
      />

      {/* Upload button or file info */}
      {defaultValue ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={defaultValue.split('/').pop() ?? 'Uploaded file'}
            onDelete={!disabled && !readOnly ? handleDelete : undefined}
            deleteIcon={<DeleteIcon />}
            color="primary"
            variant="outlined"
          />
          <Button
            variant="text"
            size="small"
            onClick={() => window.open(defaultValue, '_blank')}
          >
            보기
          </Button>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={handleButtonClick}
          disabled={disabled || readOnly || uploading}
          size={sizeProp ?? context.size ?? 'medium'}
        >
          {uploading ? '업로드 중...' : '파일 선택'}
        </Button>
      )}

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ mt: 1 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}

      {/* Error message */}
      {hasError && (
        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

// 8️⃣ Definition 객체
export const FormTypeInputFileUploadDefinition = {
  Component: FormTypeInputFileUpload,
  test: { type: 'string', format: 'file' },  // format: 'file'
} satisfies FormTypeInputDefinition;
```

#### Step 3: onFileAttach 구현 예시 (사용자 측)

```typescript
// App.tsx에서 SchemaForm 사용
import { SchemaForm } from '@canard/schema-form';
import { plugin as muiPlugin } from '@canard/schema-form-mui-plugin';

const App = () => {
  // onFileAttach 구현 (예: AWS S3 업로드)
  const handleFileAttach = async (file: File): Promise<string> => {
    // 1. FormData 생성
    const formData = new FormData();
    formData.append('file', file);

    // 2. 서버에 업로드
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    // 3. 서버에서 반환한 파일 URL
    const data = await response.json();
    return data.fileUrl;  // 예: "https://s3.amazonaws.com/bucket/file.jpg"
  };

  return (
    <SchemaForm
      schema={schema}
      plugin={muiPlugin}
      context={{
        size: 'medium',
        variant: 'outlined',
        onFileAttach: handleFileAttach,  // ✅ context로 전달
      }}
    />
  );
};
```

#### Step 4: 다중 파일 업로드 (확장)

```typescript
// 다중 파일 업로드 버전
interface FormTypeInputMultiFileUploadProps
  extends FormTypeInputPropsWithSchema<string[], never, MuiFormContext>,
          MuiFormContext {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
}

const FormTypeInputMultiFileUpload = ({
  defaultValue,  // string[] (URL 배열)
  onChange,      // (urls: string[]) => void
  context,
  maxFiles = 5,
  // ... 기타 props
}: FormTypeInputMultiFileUploadProps) => {
  const handleFileSelect = useHandle(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    // 파일 개수 검증
    if ((defaultValue?.length ?? 0) + files.length > maxFiles) {
      alert(`최대 ${maxFiles}개의 파일만 업로드 가능합니다.`);
      return;
    }

    if (!context.onFileAttach) {
      alert('파일 업로드 기능이 설정되지 않았습니다.');
      return;
    }

    try {
      setUploading(true);

      // 병렬 업로드
      const uploadPromises = files.map((file) => context.onFileAttach!(file));
      const newUrls = await Promise.all(uploadPromises);

      // 기존 URL + 새 URL
      const allUrls = [...(defaultValue ?? []), ...newUrls];
      onChange(allUrls);

      setUploading(false);
    } catch (error) {
      console.error('Multi-file upload error:', error);
      alert('파일 업로드 중 오류가 발생했습니다.');
      setUploading(false);
    }
  });

  // ... 렌더링 (Chip 배열로 표시)
};
```

**결과**: 파일 업로드 기능이 완벽히 통합된 컴포넌트, context를 통한 콜백 주입 패턴

**주의사항**:
- `onFileAttach`는 반드시 context로 제공해야 함
- 파일 업로드는 비동기이므로 loading 상태 관리 필수
- 파일 URL은 문자열로 onChange에 전달
- 다중 파일은 string[] 타입 사용

---

## 다음 단계 연계

- 구현 완료 후 `dependency-management` 스킬로 package.json 설정
- UI 라이브러리 호환성 검증은 `ui-plugin-guidelines` 스킬 참조

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - 타입 정의 파일 없음 (types/index.d.ts)
      - React 미설치
      - @canard/schema-form 패키지 미설치
      - UI 라이브러리 미설치 (MUI, Ant Design 등)
      - 컴포넌트 빌드 실패 (심각한 구문 오류)
    action: |
      ❌ 치명적 오류 - 컴포넌트 구현 중단
      → 타입 파일 확인: ls types/index.d.ts
      → React 설치: yarn add react react-dom
      → @canard/schema-form 설치: yarn add @canard/schema-form
      → UI 라이브러리 설치: yarn add @mui/material (예시)
      → 빌드 검증: yarn build
      → 재실행: 필수 패키지 설치 후 구현 재시도
    examples:
      - condition: "타입 파일 없음"
        message: "❌ 오류: types/index.d.ts를 찾을 수 없습니다"
        recovery: "canard-type-system 먼저 실행하여 타입 정의 생성"
      - condition: "UI 라이브러리 미설치"
        message: "❌ 오류: @mui/material 패키지를 찾을 수 없습니다"
        recovery: "설치: yarn add @mui/material @emotion/react @emotion/styled"

  severity_medium:
    conditions:
      - 컴포넌트 타입 추론 실패
      - Props 검증 누락
      - UI 라이브러리 컴포넌트 매핑 불명확
      - 성능 최적화 자동 적용 실패 (memo, useMemo)
      - Storybook args 생성 실패
    action: |
      ⚠️  경고 - 기본 구현으로 진행
      1. 타입: any로 fallback (수동 수정 권장)
      2. Props 검증: PropTypes 생략
      3. UI 컴포넌트: 기본 HTML 요소 사용
      4. 성능 최적화: 수동 적용 권장
      5. Storybook: 기본 args만 생성
      6. 구현 파일에 경고 추가:
         // ⚠️  WARNING: {warning_description}
         // → {action_required}
    fallback_values:
      component_type: "any"
      ui_component: "input" # 기본 HTML
      optimization: "none (apply manually)"
    examples:
      - condition: "타입 추론 실패"
        message: "⚠️  경고: FormTypeInput Props 타입을 추론할 수 없습니다"
        fallback: "any로 대체 → 수동으로 FormTypeInputProps<string> 지정"
      - condition: "UI 컴포넌트 매핑 불명확"
        message: "⚠️  경고: MUI TextField를 자동으로 매핑할 수 없습니다"
        fallback: "기본 <input> 사용 → 수동으로 <TextField> 변경"

  severity_low:
    conditions:
      - 접근성 속성 자동 생성 실패
      - 스타일링 가이드 위반 (경미한)
      - JSDoc 주석 누락
      - import 순서 비표준
    action: |
      ℹ️  정보: 최적화 제안 - 자동 또는 수동 개선
      → 접근성: aria-* 속성 추가 제안
      → 스타일: Prettier 자동 수정
      → JSDoc: 주석 추가 제안
      → import: ESLint auto-fix
    examples:
      - condition: "접근성 속성 없음"
        auto_handling: "aria-label, aria-describedby 추가 제안"
      - condition: "import 순서"
        auto_handling: "ESLint --fix로 자동 정렬"
```

---

> **Best Practice**: 비제어 컴포넌트 우선, 성능 최적화 항상 고려
> **Integration**: 타입 시스템 기반 구현, 가이드라인 준수

