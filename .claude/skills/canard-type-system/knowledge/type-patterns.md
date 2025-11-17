# Type Patterns Guide

@canard/schema-form 타입 시스템 사용 패턴 가이드

## 1. FormTypeInputProps 기본 사용 패턴

### 1.1 기본 타입 정의

```typescript
import type { FormTypeInputProps } from '@canard/schema-form';

// 가장 기본적인 FormTypeInput 컴포넌트
function StringInput(props: FormTypeInputProps<string>) {
  const { value, onChange, errors, disabled, readOnly } = props;

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      readOnly={readOnly}
    />
  );
}
```

### 1.2 Context를 사용하는 패턴

```typescript
// UI 라이브러리별 Context 정의
interface MuiContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  color?: 'primary' | 'secondary' | 'error';
}

// Context를 활용한 컴포넌트
function MuiStringInput(props: FormTypeInputProps<string, MuiContext>) {
  const { value, onChange, context, disabled } = props;

  return (
    <TextField
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      size={context?.size}
      variant={context?.variant}
      color={context?.color}
    />
  );
}
```

### 1.3 WatchValues를 사용하는 패턴

```typescript
// JSON Schema에서 watch 정의
const schema = {
  type: 'object',
  properties: {
    country: { type: 'string' },
    city: {
      type: 'string',
      computed: {
        watch: ['../country']  // country 필드를 구독
      }
    }
  }
};

// WatchValues 타입 지정
function CityInput(props: FormTypeInputProps<string, object, [string]>) {
  const { value, onChange, watchValues } = props;
  const [country] = watchValues;  // country 값 추출

  // country에 따라 city 옵션 변경
  const cities = getCitiesByCountry(country);

  return (
    <select value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
      {cities.map(city => (
        <option key={city} value={city}>{city}</option>
      ))}
    </select>
  );
}
```

## 2. Props 타입 확장 패턴

### 2.1 기본 확장 패턴

```typescript
// FormTypeInputProps를 확장하여 추가 props 정의
interface StringInputProps extends FormTypeInputProps<string> {
  placeholder?: string;
  maxLength?: number;
}

function EnhancedStringInput(props: StringInputProps) {
  const { value, onChange, placeholder, maxLength } = props;

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
    />
  );
}
```

### 2.2 Context와 함께 확장하는 패턴

```typescript
// Context 타입과 함께 props 확장
interface MuiStringInputProps
  extends FormTypeInputProps<string, MuiContext>,
          MuiContext {  // Context 필드도 직접 props로 받기
  placeholder?: string;
  helperText?: string;
}

function FullMuiStringInput(props: MuiStringInputProps) {
  const {
    value,
    onChange,
    errors,
    // Context 필드들을 직접 구조 분해
    size,
    variant,
    color,
    placeholder,
    helperText
  } = props;

  return (
    <TextField
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      error={errors.length > 0}
      helperText={errors[0]?.message || helperText}
      size={size}
      variant={variant}
      color={color}
      placeholder={placeholder}
    />
  );
}
```

## 3. 복잡한 타입 사용 패턴

### 3.1 Array 타입 처리

```typescript
// 배열 값을 다루는 FormTypeInput
function TagInput(props: FormTypeInputProps<string[]>) {
  const { value, onChange, ChildNodeComponents } = props;

  // ChildNodeComponents를 사용하여 각 아이템 렌더링
  return (
    <div>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <ChildComponent key={index} />
      ))}
      <button onClick={() => onChange([...(value ?? []), ''])}>
        Add Tag
      </button>
    </div>
  );
}
```

### 3.2 Object 타입 처리

```typescript
// 객체 값을 다루는 FormTypeInput
interface Address {
  street: string;
  city: string;
  zipCode: string;
}

function AddressInput(props: FormTypeInputProps<Address>) {
  const { value, onChange, ChildNodeComponents } = props;

  // ChildNodeComponents를 사용하여 각 필드 렌더링
  return (
    <div className="address-input">
      {ChildNodeComponents.map((ChildComponent, index) => (
        <ChildComponent key={index} />
      ))}
    </div>
  );
}
```

### 3.3 Union 타입 처리

```typescript
// Union 타입 값 처리
function NumberOrStringInput(props: FormTypeInputProps<number | string>) {
  const { value, onChange, jsonSchema } = props;

  // jsonSchema.type을 확인하여 현재 타입 결정
  const isNumber = jsonSchema.type === 'number';

  return (
    <input
      type={isNumber ? 'number' : 'text'}
      value={value ?? ''}
      onChange={(e) => onChange(
        isNumber ? Number(e.target.value) : e.target.value
      )}
    />
  );
}
```

## 4. onChange 사용 패턴

### 4.1 기본 onChange 사용

```typescript
function BasicInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;

  // 간단한 값 업데이트
  return (
    <input
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

### 4.2 onChange Options 사용

```typescript
import type { PublicSetValueOption } from '@canard/schema-form';

function AdvancedInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;

  const handleChange = (newValue: string) => {
    // 두 번째 인자로 options 전달 가능
    onChange(newValue, {
      // Isolate: computed properties를 동기적으로 업데이트
      // (기본값: onChange는 Overwrite 옵션 사용, Isolate 포함)
    });
  };

  return (
    <input
      value={value ?? ''}
      onChange={(e) => handleChange(e.target.value)}
    />
  );
}
```

### 4.3 함수형 업데이트 패턴

```typescript
function CounterInput(props: FormTypeInputProps<number>) {
  const { value, onChange } = props;

  const increment = () => {
    // 이전 값을 기반으로 업데이트
    onChange((prev) => (prev ?? 0) + 1);
  };

  const decrement = () => {
    onChange((prev) => (prev ?? 0) - 1);
  };

  return (
    <div>
      <button onClick={decrement}>-</button>
      <span>{value ?? 0}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

## 5. onFileAttach 사용 패턴

### 5.1 단일 파일 업로드

```typescript
function FileInput(props: FormTypeInputProps<string>) {
  const { value, onChange, onFileAttach } = props;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // 파일 첨부 처리
    onFileAttach(file);

    // 파일명을 value로 저장
    if (file) {
      onChange(file.name);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {value && <span>Selected: {value}</span>}
    </div>
  );
}
```

### 5.2 다중 파일 업로드

```typescript
function MultiFileInput(props: FormTypeInputProps<string[]>) {
  const { value, onChange, onFileAttach } = props;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    // 다중 파일 첨부
    onFileAttach(files);

    // 파일명 배열을 value로 저장
    onChange(files.map(f => f.name));
  };

  return (
    <div>
      <input type="file" multiple onChange={handleFileChange} />
      {value && (
        <ul>
          {value.map((filename, i) => <li key={i}>{filename}</li>)}
        </ul>
      )}
    </div>
  );
}
```

## 6. ChildNodeComponents 사용 패턴

### 6.1 기본 자식 렌더링

```typescript
function ObjectFieldset(props: FormTypeInputProps<object>) {
  const { ChildNodeComponents } = props;

  return (
    <fieldset>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <ChildComponent key={index} />
      ))}
    </fieldset>
  );
}
```

### 6.2 자식에 props 전달

```typescript
import type { ChildNodeComponentProps } from '@canard/schema-form';

function CustomLayout(props: FormTypeInputProps<object>) {
  const { ChildNodeComponents } = props;

  return (
    <div className="custom-layout">
      {ChildNodeComponents.map((ChildComponent, index) => {
        // 자식에게 추가 props 전달 가능
        const childProps: Partial<ChildNodeComponentProps> = {
          className: 'custom-child',
          style: { marginBottom: '1rem' },
          // readOnly, disabled, context 등도 override 가능
        };

        return <ChildComponent key={index} {...childProps} />;
      })}
    </div>
  );
}
```

### 6.3 배열 아이템 제어

```typescript
function ArrayWithControls(props: FormTypeInputProps<any[]>) {
  const { ChildNodeComponents, node } = props;

  // node를 ArrayNode로 타입 캐스팅
  const arrayNode = node as import('@canard/schema-form').ArrayNode;

  return (
    <div>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <div key={index} className="array-item">
          <ChildComponent />
          <button onClick={() => arrayNode.remove(index)}>
            Remove
          </button>
        </div>
      ))}
      <button onClick={() => arrayNode.push()}>
        Add Item
      </button>
    </div>
  );
}
```

## 7. 에러 처리 패턴

### 7.1 기본 에러 표시

```typescript
function InputWithErrors(props: FormTypeInputProps<string>) {
  const { value, onChange, errors } = props;

  return (
    <div>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={errors.length > 0 ? 'error' : ''}
      />
      {errors.length > 0 && (
        <span className="error-message">
          {errors[0].message}
        </span>
      )}
    </div>
  );
}
```

### 7.2 모든 에러 표시

```typescript
function InputWithAllErrors(props: FormTypeInputProps<string>) {
  const { value, onChange, errors } = props;

  return (
    <div>
      <input
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        className={errors.length > 0 ? 'error' : ''}
      />
      {errors.length > 0 && (
        <ul className="error-list">
          {errors.map((error, index) => (
            <li key={index}>{error.message}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

## 8. 상태 플래그 활용 패턴

### 8.1 readOnly와 disabled 처리

```typescript
function StatefulInput(props: FormTypeInputProps<string>) {
  const { value, onChange, readOnly, disabled } = props;

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      readOnly={readOnly}
      disabled={disabled}
      className={readOnly ? 'read-only' : disabled ? 'disabled' : ''}
    />
  );
}
```

### 8.2 required 플래그 활용

```typescript
function RequiredInput(props: FormTypeInputProps<string>) {
  const { value, onChange, required, name } = props;

  return (
    <div>
      <label>
        {name} {required && <span className="required">*</span>}
      </label>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </div>
  );
}
```

## 9. jsonSchema 활용 패턴

### 9.1 Schema 속성 읽기

```typescript
function SchemaAwareInput(props: FormTypeInputProps<string>) {
  const { value, onChange, jsonSchema } = props;

  // jsonSchema에서 제약 조건 읽기
  const maxLength = jsonSchema.maxLength;
  const minLength = jsonSchema.minLength;
  const pattern = jsonSchema.pattern;

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      pattern={pattern}
    />
  );
}
```

### 9.2 format에 따른 조건부 렌더링

```typescript
function FormatBasedInput(props: FormTypeInputProps<string>) {
  const { value, onChange, jsonSchema } = props;

  // format에 따라 다른 input type 사용
  const inputType = jsonSchema.format === 'email' ? 'email'
    : jsonSchema.format === 'uri' ? 'url'
    : jsonSchema.format === 'date' ? 'date'
    : 'text';

  return (
    <input
      type={inputType}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
```

## 10. 성능 최적화 패턴

### 10.1 메모이제이션

```typescript
import { memo, useMemo } from 'react';

const OptimizedInput = memo((props: FormTypeInputProps<string>) => {
  const { value, onChange, jsonSchema } = props;

  // 계산 비용이 높은 작업은 useMemo 사용
  const validationRegex = useMemo(() => {
    return jsonSchema.pattern ? new RegExp(jsonSchema.pattern) : null;
  }, [jsonSchema.pattern]);

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
});
```

### 10.2 onChange 핸들러 최적화

```typescript
import { useCallback } from 'react';

function OptimizedCallbackInput(props: FormTypeInputProps<string>) {
  const { value, onChange } = props;

  // onChange 핸들러를 useCallback으로 메모이제이션
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  }, [onChange]);

  return (
    <input
      type="text"
      value={value ?? ''}
      onChange={handleChange}
    />
  );
}
```

---

이 가이드는 @canard/schema-form의 실제 타입 정의(`packages/canard/schema-form/src/types/formTypeInput.ts`)를 기반으로 작성되었습니다.
