# 컴포넌트 구현 패턴

React 기반 @canard/schema-form 플러그인 컴포넌트 구현 시 권장되는 패턴들입니다.

## 비제어 vs 제어 컴포넌트

### 비제어 컴포넌트 (권장)

**사용 시기**: 기본 패턴으로 항상 우선 사용

**장점**:

- 불필요한 리렌더링 방지
- 성능 최적화
- React Hook Form과 호환성 우수

**패턴**:

```typescript
const FormTypeInputString = ({
  defaultValue,  // ✅ defaultValue 사용
  onChange,
  ...props
}: FormTypeInputStringProps) => {
  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  return (
    <TextField
      defaultValue={defaultValue}  // ✅ 비제어
      onChange={handleChange}
      {...props}
    />
  );
};
```

### 제어 컴포넌트 (필요시만)

**사용 시기**:

- 실시간 validation 필요
- 조건부 렌더링 필요
- 값 포맷팅/변환 필요

**패턴**:

```typescript
const FormTypeInputEmail = ({
  value,  // ✅ value 사용
  onChange,
  ...props
}: FormTypeInputEmailProps) => {
  // 실시간 validation
  const isValid = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }, [value]);

  const handleChange = useHandle((event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  });

  return (
    <TextField
      value={value}  // ✅ 제어
      onChange={handleChange}
      error={!isValid && value.length > 0}
      helperText={!isValid ? 'Invalid email' : ''}
      {...props}
    />
  );
};
```

## 값 전달 우선순위 패턴

props는 여러 곳에서 올 수 있습니다: 직접 props, context, jsonSchema

**우선순위**: `직접 props` > `context` > `jsonSchema` > `기본값`

```typescript
const FormTypeInputString = ({
  jsonSchema,
  context,
  name,
  // 직접 props
  size: sizeProp,
  variant: variantProp,
  placeholder: placeholderProp,
  label: labelProp,
}: FormTypeInputStringProps) => {
  // useMemo로 우선순위 적용
  const [size, variant, placeholder, label] = useMemo(() => {
    return [
      sizeProp || context.size || 'medium',  // 1순위: sizeProp
      variantProp || context.variant || 'outlined',
      placeholderProp || jsonSchema.placeholder || '',
      labelProp || jsonSchema.label || jsonSchema.title || name,
    ];
  }, [sizeProp, context, jsonSchema, variantProp, placeholderProp, labelProp, name]);

  return (
    <TextField
      size={size}
      variant={variant}
      placeholder={placeholder}
      label={label}
    />
  );
};
```

## ChildNodeComponents 패턴 (Array/Object)

Array와 Object 타입은 `ChildNodeComponents`를 사용하여 자식 노드를 렌더링합니다.

### Array 컴포넌트

```typescript
const FormTypeInputArray = ({
  jsonSchema,
  path,
  name,
  ChildNodeComponents,  // ✅ canard-form이 자동 제공
  onChange,
  value,
  context,
}: FormTypeInputArrayProps) => {
  // ChildNodeComponents는 이미 필요한 props를 받은 함수형 컴포넌트 배열

  return (
    <Box>
      <Typography variant="h6">{jsonSchema.title || name}</Typography>

      {ChildNodeComponents.map((ChildComponent, index) => (
        <Paper key={index} sx={{ p: 2, mb: 2 }}>
          {/* ✅ ChildComponent는 이미 props를 가지고 있음 */}
          <ChildComponent />

          {/* UI 라이브러리별 스타일 적용 */}
          <IconButton
            size="small"
            onClick={() => {
              // 삭제 로직은 canard-form 내부에서 처리
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      {/* 추가 버튼 */}
      <Button
        startIcon={<AddIcon />}
        onClick={() => {
          // 추가 로직은 canard-form 내부에서 처리
        }}
        disabled={
          jsonSchema.maxItems !== undefined &&
          value.length >= jsonSchema.maxItems
        }
      >
        Add Item
      </Button>
    </Box>
  );
};
```

**주의사항**:

- `ChildNodeComponents`에 props를 직접 전달하지 **않음**
- 추가/제거 버튼만 UI 라이브러리 스타일로 구현
- 실제 추가/제거 로직은 canard-form 내부에서 처리됨

## 값 변환 패턴 (DatePicker, TimePicker 등)

UI 라이브러리 컴포넌트와 JsonSchema 값 형식이 다른 경우:

```typescript
const FormTypeInputDate = ({
  defaultValue,  // ISO 8601 string: "2025-01-16"
  onChange,
  ...props
}: FormTypeInputDateProps) => {
  // 1. defaultValue 변환 (string → Date)
  const dateValue = useMemo(() => {
    if (!defaultValue) return null;
    try {
      return parseISO(defaultValue);
    } catch {
      return null;
    }
  }, [defaultValue]);

  // 2. onChange 변환 (Date → string)
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker
        value={dateValue}  // Date 객체
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

## 래퍼 컴포넌트 패턴

특정 UI 라이브러리에서 추가 Provider가 필요한 경우:

```typescript
// DatePicker - LocalizationProvider 필요
const FormTypeInputDate = ({ ...props }: FormTypeInputDateProps) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DatePicker {...props} />
    </LocalizationProvider>
  );
};

// RichTextEditor - 에디터 Provider 필요
const FormTypeInputRichText = ({ ...props }: FormTypeInputRichTextProps) => {
  return (
    <EditorProvider>
      <RichTextEditor {...props} />
    </EditorProvider>
  );
};
```

## 조건부 props 패턴

UI 라이브러리 컴포넌트가 중첩된 props 구조를 사용하는 경우:

### MUI slotProps 패턴

```typescript
const FormTypeInputDate = ({
  path,
  name,
  required,
  disabled,
  size,
  ...props
}: FormTypeInputDateProps) => {
  return (
    <DatePicker
      slotProps={{
        // TextField props
        textField: {
          id: path,
          name,
          required,
          disabled,
          size,
        },
        // 기타 slot props
        day: {
          sx: { /* custom styles */ },
        },
      }}
      {...props}
    />
  );
};
```

### Ant Design 중첩 props 패턴

```typescript
const FormTypeInputUpload = ({
  path,
  name,
  onChange,
  ...props
}: FormTypeInputUploadProps) => {
  return (
    <Upload
      id={path}
      name={name}
      customRequest={(options) => {
        // 파일 업로드 로직
      }}
      onChange={(info) => {
        onChange(info.fileList);
      }}
      {...props}
    >
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};
```

## Enum/Select 패턴

Enum 값을 Select/Radio로 렌더링:

```typescript
const FormTypeInputStringEnum = ({
  jsonSchema,
  defaultValue,
  onChange,
  ...props
}: FormTypeInputStringEnumProps) => {
  const isMultiple = type === 'array';
  const enumValues = jsonSchema.enum || [];
  const enumLabels = jsonSchema.enumLabels || {};

  const handleChange = useHandle((event: SelectChangeEvent<string | string[]>) => {
    onChange(event.target.value);
  });

  return (
    <Select
      defaultValue={defaultValue}
      onChange={handleChange}
      multiple={isMultiple}
      {...props}
    >
      {enumValues.map((value) => (
        <MenuItem key={value} value={value}>
          {enumLabels[value] || value}
        </MenuItem>
      ))}
    </Select>
  );
};
```

## Error 처리 패턴

```typescript
const FormTypeInputString = ({
  errors,
  ...props
}: FormTypeInputStringProps) => {
  // errors는 JsonSchemaError[] 타입
  const hasError = errors.length > 0;
  const errorMessage = hasError ? errors[0].message : '';

  return (
    <TextField
      error={hasError}
      helperText={errorMessage}
      {...props}
    />
  );
};
```

**주의**: FormError 컴포넌트를 별도로 구현하는 경우 여기서는 error prop만 전달

## Label 숨김 패턴

```typescript
const FormTypeInputBoolean = ({
  jsonSchema,
  name,
  label: labelProp,
  hideLabel,
  ...props
}: FormTypeInputBooleanProps) => {
  const label = useMemo(() => {
    if (hideLabel) return undefined;
    return labelProp || jsonSchema.label || jsonSchema.title || name;
  }, [hideLabel, labelProp, jsonSchema, name]);

  return (
    <FormControlLabel
      control={<Checkbox {...props} />}
      label={label}
    />
  );
};
```

## 접근성 패턴

```typescript
const FormTypeInputString = ({
  path,
  name,
  jsonSchema,
  required,
  errors,
  ...props
}: FormTypeInputStringProps) => {
  const hasError = errors.length > 0;
  const describedBy = hasError ? `${path}-error` : undefined;

  return (
    <>
      <TextField
        id={path}
        name={name}
        required={required}
        aria-invalid={hasError}
        aria-describedby={describedBy}
        aria-required={required}
        {...props}
      />
      {hasError && (
        <FormHelperText id={`${path}-error`} error>
          {errors[0].message}
        </FormHelperText>
      )}
    </>
  );
};
```

---

**핵심 원칙**:

1. 비제어 컴포넌트 우선
2. 값 우선순위: 직접 props > context > jsonSchema
3. useMemo로 연산 최적화
4. useHandle로 핸들러 메모이제이션
5. ChildNodeComponents는 props 전달 금지
6. 값 변환은 명시적으로
7. 접근성 속성 필수
