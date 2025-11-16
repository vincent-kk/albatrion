# 타입 사용 예제

@canard/schema-form 플러그인 개발 시 실제로 사용되는 타입 패턴들입니다.

## UI 라이브러리별 Context 타입

### MUI (Material-UI)

```typescript
interface MuiContext {
  size?: 'small' | 'medium' | 'large';
  variant?: 'outlined' | 'filled' | 'standard';
  color?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
}
```

### Ant Design

```typescript
interface AntdContext {
  size?: 'small' | 'middle' | 'large';
  status?: 'error' | 'warning';
}
```

### Ant Design Mobile

```typescript
interface AntdMobileContext {
  size?: 'small' | 'middle' | 'large';
}
```

### Chakra UI (예시)

```typescript
interface ChakraContext {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'outline' | 'filled' | 'flushed' | 'unstyled';
  colorScheme?: string;
}
```

## 컴포넌트별 Props 타입 예제

### String 입력 컴포넌트

```typescript
import type { FormTypeInputPropsWithSchema } from '@canard/schema-form';

interface StringSchema extends JsonSchema {
  type: 'string';
  format?: 'email' | 'url' | 'password' | 'textarea';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

interface FormTypeInputStringProps
  extends FormTypeInputPropsWithSchema<string, StringSchema, MuiContext>,
          MuiContext {
  placeholder?: string;
  multiline?: boolean;
}

const FormTypeInputString = ({
  jsonSchema,
  name,
  path,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  // Context props
  size: sizeProp,
  variant: variantProp,
  // Additional props
  placeholder,
}: FormTypeInputStringProps) => {
  const size = sizeProp || context.size || 'medium';
  const variant = variantProp || context.variant || 'outlined';
  
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });
  
  return (
    <TextField
      id={path}
      name={name}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
      placeholder={placeholder || jsonSchema.placeholder}
      size={size}
      variant={variant}
    />
  );
};

export const FormTypeInputStringDefinition = {
  Component: FormTypeInputString,
  test: { type: 'string' },
} satisfies FormTypeInputDefinition;
```

### Number 입력 컴포넌트

```typescript
interface NumberSchema extends JsonSchema {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
  multipleOf?: number;
}

interface FormTypeInputNumberProps
  extends FormTypeInputPropsWithSchema<number, NumberSchema, MuiContext>,
          MuiContext {
  step?: number;
  formatter?: (value: number) => string;
  parser?: (value: string) => number;
}

const FormTypeInputNumber = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
  step,
}: FormTypeInputNumberProps) => {
  const size = sizeProp || context.size || 'medium';
  
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const numValue = parseFloat(event.target.value);
    onChange(isNaN(numValue) ? 0 : numValue);
  });
  
  return (
    <TextField
      id={path}
      name={name}
      type="number"
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
      inputProps={{
        min: jsonSchema.minimum,
        max: jsonSchema.maximum,
        step: step || jsonSchema.multipleOf || 1,
      }}
      size={size}
    />
  );
};

export const FormTypeInputNumberDefinition = {
  Component: FormTypeInputNumber,
  test: { type: ['number', 'integer'] },
} satisfies FormTypeInputDefinition;
```

### Boolean 입력 컴포넌트

```typescript
interface BooleanSchema extends JsonSchema {
  type: 'boolean';
  default?: boolean;
}

interface FormTypeInputBooleanProps
  extends FormTypeInputPropsWithSchema<boolean, BooleanSchema, MuiContext>,
          MuiContext {
  label?: ReactNode;
  hideLabel?: boolean;
  indeterminate?: boolean;
}

const FormTypeInputBoolean = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  defaultValue,
  onChange,
  label: labelProp,
  hideLabel,
}: FormTypeInputBooleanProps) => {
  const label = useMemo(() => {
    if (hideLabel) return undefined;
    return labelProp || jsonSchema.label || jsonSchema.title || name;
  }, [hideLabel, labelProp, jsonSchema, name]);
  
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  });
  
  return (
    <FormControlLabel
      control={
        <Checkbox
          id={path}
          name={name}
          required={required}
          disabled={disabled}
          defaultChecked={defaultValue}
          onChange={handleChange}
        />
      }
      label={label}
    />
  );
};

export const FormTypeInputBooleanDefinition = {
  Component: FormTypeInputBoolean,
  test: { type: 'boolean' },
} satisfies FormTypeInputDefinition;
```

### Array 입력 컴포넌트

```typescript
interface ArraySchema extends JsonSchema {
  type: 'array';
  items: JsonSchema;
  minItems?: number;
  maxItems?: number;
}

interface FormTypeInputArrayProps
  extends FormTypeInputPropsWithSchema<any[], ArraySchema, MuiContext>,
          MuiContext {
  // ChildNodeComponents는 FormTypeInputProps에서 제공됨
}

const FormTypeInputArray = ({
  jsonSchema,
  path,
  ChildNodeComponents,
  context,
  size: sizeProp,
}: FormTypeInputArrayProps) => {
  const size = sizeProp || context.size || 'medium';
  
  return (
    <Box>
      {ChildNodeComponents.map((ChildComponent, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <ChildComponent />
        </Box>
      ))}
      {/* 추가/제거 버튼은 UI 라이브러리 스타일로 구현 */}
    </Box>
  );
};

export const FormTypeInputArrayDefinition = {
  Component: FormTypeInputArray,
  test: { type: 'array' },
} satisfies FormTypeInputDefinition;
```

### Enum 선택 컴포넌트 (복합 조건)

```typescript
interface EnumSchema extends JsonSchema {
  type: 'string' | 'array';
  enum: any[];
  enumLabels?: Record<string, string>;
}

interface FormTypeInputStringEnumProps
  extends FormTypeInputPropsWithSchema<string | string[], EnumSchema, MuiContext>,
          MuiContext {
  mode?: 'single' | 'multiple';
  enumLabels?: Record<string, ReactNode>;
}

const FormTypeInputStringEnum = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  defaultValue,
  onChange,
  context,
  size: sizeProp,
  enumLabels,
}: FormTypeInputStringEnumProps) => {
  const size = sizeProp || context.size || 'medium';
  const isMultiple = jsonSchema.type === 'array';
  
  const labels = enumLabels || jsonSchema.enumLabels || {};
  
  const handleChange = useHandle((event: SelectChangeEvent<string | string[]>) => {
    onChange(event.target.value);
  });
  
  return (
    <Select
      id={path}
      name={name}
      required={required}
      disabled={disabled}
      defaultValue={defaultValue}
      onChange={handleChange}
      multiple={isMultiple}
      size={size}
    >
      {jsonSchema.enum.map((value) => (
        <MenuItem key={value} value={value}>
          {labels[value] || value}
        </MenuItem>
      ))}
    </Select>
  );
};

export const FormTypeInputStringEnumDefinition = {
  Component: FormTypeInputStringEnum,
  // 복합 조건은 함수 형태로
  test: ({ type, jsonSchema }: Hint) =>
    (type === 'string' && jsonSchema.enum && jsonSchema.enum.length > 0) ||
    (type === 'array' &&
     jsonSchema.items?.type === 'string' &&
     jsonSchema.items?.enum &&
     jsonSchema.items.enum.length > 0),
} satisfies FormTypeInputDefinition;
```

### FormType 기반 컴포넌트 (Radio Group)

```typescript
interface RadioGroupSchema extends JsonSchema {
  type: 'string' | 'number' | 'integer';
  formType: 'radio';
  enum: any[];
  radioLabels?: Record<string | number, string>;
}

interface FormTypeInputRadioGroupProps
  extends FormTypeInputPropsWithSchema<string | number, RadioGroupSchema, MuiContext>,
          MuiContext {
  radioLabels?: Record<string | number, ReactNode>;
  direction?: 'horizontal' | 'vertical';
}

const FormTypeInputRadioGroup = ({
  jsonSchema,
  path,
  name,
  required,
  disabled,
  defaultValue,
  onChange,
  radioLabels,
  direction = 'vertical',
}: FormTypeInputRadioGroupProps) => {
  const labels = radioLabels || jsonSchema.radioLabels || {};
  
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    onChange(jsonSchema.type === 'string' ? value : Number(value));
  });
  
  return (
    <RadioGroup
      name={name}
      defaultValue={defaultValue}
      onChange={handleChange}
      row={direction === 'horizontal'}
    >
      {jsonSchema.enum.map((value) => (
        <FormControlLabel
          key={value}
          value={value}
          control={<Radio required={required} disabled={disabled} />}
          label={labels[value] || value}
        />
      ))}
    </RadioGroup>
  );
};

export const FormTypeInputRadioGroupDefinition = {
  Component: FormTypeInputRadioGroup,
  test: ({ type, formType, jsonSchema }: Hint) =>
    (type === 'string' || type === 'number' || type === 'integer') &&
    formType === 'radio' &&
    jsonSchema.enum &&
    jsonSchema.enum.length > 0,
} satisfies FormTypeInputDefinition;
```

## 타입 추론 활용

### 자동 타입 추론

```typescript
// Value 타입만 지정하면 Schema와 Node는 자동 추론
interface FormTypeInputTimeProps
  extends FormTypeInputPropsWithSchema<
    Date,
    // Schema 자동 추론: InferJsonSchema<Date>
    // Context는 명시: MuiContext
    MuiContext
  > {
  format?: string;
}
```

### 명시적 타입 지정

```typescript
// 복잡한 Schema가 필요한 경우 명시적으로 지정
interface CustomSchema extends JsonSchema {
  type: 'string';
  format: 'custom-format';
  customProperty: boolean;
}

interface FormTypeInputCustomProps
  extends FormTypeInputPropsWithSchema<string, CustomSchema, MuiContext> {
  customProp?: boolean;
}
```

## 값 전달 우선순위 패턴

```typescript
const FormTypeInputComponent = ({
  jsonSchema,
  context,
  // Direct props
  size: sizeProp,
  placeholder: placeholderProp,
  customProp: customPropProp,
}: FormTypeInputComponentProps) => {
  // useMemo로 우선순위 적용
  const [size, placeholder, customProp] = useMemo(() => {
    return [
      // 1순위: 직접 props
      // 2순위: context
      // 3순위: jsonSchema
      sizeProp || context.size || 'medium',
      placeholderProp || jsonSchema.placeholder || '',
      customPropProp ?? jsonSchema.customProperty ?? false,
    ];
  }, [sizeProp, context, jsonSchema, placeholderProp, customPropProp]);
  
  // ...
};
```

---

**핵심 포인트**:
1. `FormTypeInputPropsWithSchema`를 사용하여 타입 간소화
2. Context 타입을 intersection으로 확장하여 size, variant 등 자동 포함
3. test 조건: 단순하면 객체, 복합하면 함수 형태
4. 값 우선순위: 직접 props > context > jsonSchema
5. useMemo와 useHandle로 성능 최적화

