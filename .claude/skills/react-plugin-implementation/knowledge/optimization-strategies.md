# 성능 최적화 전략

@canard/schema-form 플러그인 개발 시 성능 최적화를 위한 전략들입니다.

## useHandle 훅 사용

**출처**: `@winglet/react-utils`

**목적**: 이벤트 핸들러 메모이제이션으로 불필요한 리렌더링 방지

### 기본 사용법

```typescript
import { useHandle } from '@winglet/react-utils';

const FormTypeInputString = ({ onChange, ...props }: Props) => {
  // ✅ useHandle 사용 - 컴포넌트 리렌더링 시에도 동일한 참조 유지
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  
  return <TextField onChange={handleChange} {...props} />;
};
```

### useCallback과의 차이

```typescript
// ❌ useCallback - 의존성 배열 관리 필요, 복잡함
const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
}, [onChange]);  // onChange가 변경되면 handleChange도 재생성

// ✅ useHandle - 의존성 배열 불필요, 항상 최신 값 참조
const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
  onChange(event.target.value);
});
```

### 복잡한 로직에서도 사용

```typescript
const FormTypeInputNumber = ({
  onChange,
  jsonSchema,
  context,
}: Props) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    let numValue = parseFloat(rawValue);
    
    // 복잡한 validation 로직
    if (isNaN(numValue)) numValue = 0;
    if (jsonSchema.minimum !== undefined) {
      numValue = Math.max(numValue, jsonSchema.minimum);
    }
    if (jsonSchema.maximum !== undefined) {
      numValue = Math.min(numValue, jsonSchema.maximum);
    }
    
    onChange(numValue);
  });
  
  return <TextField type="number" onChange={handleChange} />;
};
```

## useMemo로 props 연산 최적화

**목적**: 복잡한 props 연산을 캐싱하여 매 렌더링마다 재계산 방지

### 기본 패턴

```typescript
const FormTypeInputString = ({
  jsonSchema,
  context,
  name,
  size: sizeProp,
  variant: variantProp,
  label: labelProp,
}: Props) => {
  // ✅ 여러 props를 한 번에 계산
  const [size, variant, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',
      variantProp || context.variant || 'outlined',
      labelProp || jsonSchema.label || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, labelProp, name]);
  
  return <TextField size={size} variant={variant} label={label} />;
};
```

### 언제 useMemo를 사용하지 않아도 되는가?

```typescript
// ✅ 단순 연산은 useMemo 불필요
const FormTypeInputString = ({
  disabled,
  readOnly,
}: Props) => {
  // 간단한 논리 연산 - 그냥 사용
  const isDisabled = disabled || readOnly;
  
  return <TextField disabled={isDisabled} />;
};

// ✅ Primitive 값은 useMemo 불필요
const FormTypeInputString = ({
  jsonSchema,
}: Props) => {
  const placeholder = jsonSchema.placeholder || '';  // useMemo 불필요
  
  return <TextField placeholder={placeholder} />;
};
```

### 복잡한 객체 생성 시

```typescript
const FormTypeInputDate = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  size,
}: Props) => {
  // ✅ 중첩된 객체는 useMemo로 메모이제이션
  const slotProps = useMemo(() => ({
    textField: {
      id: path,
      name,
      required,
      disabled,
      size,
    },
    day: {
      sx: {
        '&.Mui-selected': {
          backgroundColor: jsonSchema.highlightColor || 'primary.main',
        },
      },
    },
  }), [path, name, required, disabled, size, jsonSchema.highlightColor]);
  
  return <DatePicker slotProps={slotProps} />;
};
```

## 비제어 컴포넌트로 리렌더링 방지

**가장 중요한 최적화**: `defaultValue` 사용

### 비제어 vs 제어 성능 비교

```typescript
// ❌ 제어 컴포넌트 - 매 타이핑마다 리렌더링
const ControlledInput = ({ value, onChange }: Props) => {
  console.log('Render');  // 매 타이핑마다 출력
  
  return (
    <TextField
      value={value}  // 제어
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

// ✅ 비제어 컴포넌트 - 초기 렌더링 후 리렌더링 없음
const UncontrolledInput = ({ defaultValue, onChange }: Props) => {
  console.log('Render');  // 초기 1회만 출력
  
  return (
    <TextField
      defaultValue={defaultValue}  // 비제어
      onChange={(e) => onChange(e.target.value)}
    />
  );
};
```

### 제어 컴포넌트가 필요한 경우

```typescript
// ✅ 실시간 validation이 필요한 경우만 제어 컴포넌트 사용
const FormTypeInputEmail = ({ value, onChange }: Props) => {
  const isValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, [value]);
  
  return (
    <TextField
      value={value}  // 제어 컴포넌트 (실시간 validation 때문에)
      onChange={(e) => onChange(e.target.value)}
      error={!isValid && value.length > 0}
      helperText={!isValid ? 'Invalid email format' : ''}
    />
  );
};
```

## Context 구독 최소화

**문제**: Context가 변경되면 모든 구독 컴포넌트가 리렌더링

### 필요한 값만 구독

```typescript
// ❌ 전체 Context 구독
const FormTypeInputString = ({ context, ...props }: Props) => {
  // context의 어떤 값이 변경되어도 리렌더링
  return <TextField size={context.size} />;
};

// ✅ 필요한 값만 추출하여 사용
const FormTypeInputString = ({
  context,
  size: sizeProp,
  ...props
}: Props) => {
  const size = useMemo(() => {
    return sizeProp || context.size || 'medium';
  }, [sizeProp, context.size]);  // context.size만 구독
  
  return <TextField size={size} />;
};
```

## 조건부 렌더링 최적화

### Early Return 패턴

```typescript
const FormTypeInputArray = ({
  ChildNodeComponents,
  jsonSchema,
}: Props) => {
  // ✅ 조건을 먼저 체크하여 불필요한 연산 방지
  if (!ChildNodeComponents || ChildNodeComponents.length === 0) {
    return <EmptyState />;
  }
  
  // 이하 복잡한 렌더링 로직
  return (
    <Box>
      {ChildNodeComponents.map((Child, index) => (
        <Child key={index} />
      ))}
    </Box>
  );
};
```

### 조건부 컴포넌트 분리

```typescript
// ❌ 하나의 컴포넌트에서 조건 처리 - 복잡함
const FormTypeInputString = ({ isPassword, ...props }: Props) => {
  if (isPassword) {
    return <PasswordField {...props} />;
  }
  return <TextField {...props} />;
};

// ✅ 별도 컴포넌트로 분리 - 명확함
const FormTypeInputString = (props: Props) => {
  return <TextField {...props} />;
};

const FormTypeInputPassword = (props: Props) => {
  return <PasswordField {...props} />;
};

// Definition 단계에서 분리
export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
};

export const FormTypeInputPasswordDefinition = {
  Component: FormTypeInputPassword,
  test: { type: 'string', format: 'password' },
};
```

## ChildNodeComponents 최적화

**중요**: ChildNodeComponents는 이미 메모이제이션된 컴포넌트

### 올바른 사용법

```typescript
const FormTypeInputArray = ({ ChildNodeComponents }: Props) => {
  // ✅ 그대로 렌더링 - props 전달 금지
  return (
    <Box>
      {ChildNodeComponents.map((Child, index) => (
        <Box key={index}>
          <Child />  {/* ✅ props 없이 */}
        </Box>
      ))}
    </Box>
  );
};
```

### 잘못된 사용법

```typescript
const FormTypeInputArray = ({ ChildNodeComponents, context }: Props) => {
  // ❌ props 전달 시 메모이제이션 무효화
  return (
    <Box>
      {ChildNodeComponents.map((Child, index) => (
        <Box key={index}>
          <Child context={context} />  {/* ❌ props 전달 금지 */}
        </Box>
      ))}
    </Box>
  );
};
```

## 값 변환 최적화

### 값 변환은 useMemo로

```typescript
const FormTypeInputDate = ({ defaultValue, onChange }: Props) => {
  // ✅ defaultValue 변환을 메모이제이션
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return parseISO(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);
  
  // ✅ onChange 콜백은 useHandle로
  const handleChange = useHandle((newDate: Date | null) => {
    if (!newDate) {
      onChange('');
      return;
    }
    try {
      onChange(formatISO(newDate, { representation: 'date' }));
    } catch {
      onChange('');
    }
  });
  
  return (
    <DatePicker
      value={dateValue}
      onChange={handleChange}
    />
  );
};
```

## 성능 측정

### React DevTools Profiler 사용

```typescript
// 개발 환경에서만 활성화
if (process.env.NODE_ENV === 'development') {
  const FormTypeInputString = ({ ...props }: Props) => {
    const renderCount = useRef(0);
    renderCount.current += 1;
    
    console.log(`FormTypeInputString rendered ${renderCount.current} times`);
    
    return <TextField {...props} />;
  };
}
```

## 최적화 체크리스트

배포 전 다음 항목들을 확인하세요:

- [ ] **비제어 컴포넌트 사용**: `defaultValue` 우선
- [ ] **useHandle 사용**: 모든 이벤트 핸들러에 적용
- [ ] **useMemo 사용**: 복잡한 props 연산, 객체 생성
- [ ] **Context 구독 최소화**: 필요한 값만 추출
- [ ] **조건부 렌더링 분리**: 복잡한 조건은 컴포넌트 분리
- [ ] **ChildNodeComponents**: props 전달 금지
- [ ] **값 변환 메모이제이션**: useMemo 사용
- [ ] **Early Return**: 조건을 먼저 체크
- [ ] **React DevTools Profiler**: 성능 측정

## 안티 패턴

### 피해야 할 패턴들

```typescript
// ❌ 매 렌더링마다 함수 재생성
const handleChange = (event) => {
  onChange(event.target.value);
};

// ❌ 매 렌더링마다 객체 재생성
const slotProps = {
  textField: { id: path, name },
};

// ❌ inline 함수
<TextField onChange={(e) => onChange(e.target.value)} />

// ❌ Context 전체 구독
const { size, variant, color, theme } = context;  // 전부 구독

// ❌ ChildNodeComponents에 props 전달
<Child context={context} />
```

---

**핵심 원칙**:
1. 비제어 컴포넌트 우선 (defaultValue)
2. useHandle로 모든 핸들러 메모이제이션
3. useMemo로 복잡한 연산 캐싱
4. Context는 필요한 값만 구독
5. ChildNodeComponents는 그대로 렌더링
6. React DevTools로 성능 측정

