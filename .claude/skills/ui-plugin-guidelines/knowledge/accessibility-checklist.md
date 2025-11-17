# 접근성 체크리스트

@canard/schema-form 플러그인 개발 시 필수 접근성 요구사항입니다.

## 필수 ARIA 속성

### 모든 Input 컴포넌트

```typescript
<TextField
  // ✅ 필수 속성
  id={path}                          // 고유 ID
  name={name}                        // 폼 제출 시 사용
  required={required}                // HTML required
  
  // ✅ ARIA 속성
  aria-required={required}           // 스크린 리더용
  aria-invalid={hasError}            // 에러 상태
  aria-describedby={hasError ? `${path}-error` : undefined}  // 에러 메시지 연결
  
  // ✅ Label 연결
  // FormLabel의 htmlFor={path}와 id={path} 연결
/>
```

### Error 메시지 연결

```typescript
// Input
<TextField
  id={path}
  aria-describedby={`${path}-error`}
  aria-invalid={true}
/>

// Error
<FormHelperText
  id={`${path}-error`}  // ✅ ID 매칭
  error
>
  {errorMessage}
</FormHelperText>
```

### Label 연결

```typescript
// Label
<FormLabel
  htmlFor={path}  // ✅ Input ID와 연결
>
  {label}
</FormLabel>

// Input
<TextField
  id={path}  // ✅ Label htmlFor와 연결
/>
```

## 키보드 네비게이션

### Tab 순서

- Input 요소는 자연스러운 Tab 순서 (DOM 순서)
- `tabIndex` 사용 최소화
- `tabIndex={-1}`: 프로그래밍 focus만 허용
- `tabIndex={0}`: 자연스러운 Tab 순서

```typescript
// ✅ 자연스러운 Tab 순서
<TextField id="name" />
<TextField id="email" />
<Button type="submit">Submit</Button>

// ❌ tabIndex 남용
<TextField id="name" tabIndex={2} />
<TextField id="email" tabIndex={1} />
```

### 키보드 이벤트

- **Enter**: 폼 제출 (button type="submit")
- **Escape**: 모달 닫기 (해당 시)
- **Arrow keys**: Select, Radio 등에서 옵션 선택
- **Space**: Checkbox, Radio 토글

## 스크린 리더 지원

### 의미 있는 Label

```typescript
// ✅ 명확한 Label
<FormLabel htmlFor="email">Email Address</FormLabel>

// ❌ 모호한 Label
<FormLabel htmlFor="input1">Input</FormLabel>
```

### 에러 메시지 명확성

```typescript
// ✅ 구체적 에러
"Email address must be in format: user@example.com"

// ❌ 모호한 에러
"Invalid input"
```

### 그룹화

```typescript
// Object 타입은 fieldset으로 그룹화
<fieldset>
  <legend>{jsonSchema.title || name}</legend>
  {/* children */}
</fieldset>

// Array 타입도 그룹화
<div role="group" aria-labelledby={`${path}-label`}>
  <Typography id={`${path}-label`}>{name}</Typography>
  {/* children */}
</div>
```

## 색상 및 대비

### 색상 의존 방지

```typescript
// ❌ 색상만으로 표시
<TextField sx={{ borderColor: 'red' }} />

// ✅ 색상 + 아이콘/텍스트
<TextField
  error
  helperText="This field is required"
  InputProps={{
    endAdornment: <ErrorIcon />
  }}
/>
```

### 대비율

- **일반 텍스트**: 최소 4.5:1
- **큰 텍스트**: 최소 3:1
- **UI 컴포넌트**: 최소 3:1

## FormTypeInput별 접근성 요구사항

### String, Number, Textarea

```typescript
<TextField
  id={path}
  name={name}
  required={required}
  aria-required={required}
  aria-invalid={hasError}
  aria-describedby={hasError ? `${path}-error` : undefined}
  placeholder={placeholder}  // 추가 힌트
/>
```

### Boolean (Checkbox)

```typescript
<FormControlLabel
  control={
    <Checkbox
      id={path}
      name={name}
      required={required}
      aria-required={required}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${path}-error` : undefined}
    />
  }
  label={label}  // ✅ Label 필수
/>
```

### Select (Enum)

```typescript
<Select
  id={path}
  name={name}
  required={required}
  aria-required={required}
  aria-invalid={hasError}
  aria-describedby={hasError ? `${path}-error` : undefined}
  aria-label={label}  // ✅ Label이 없는 경우
>
  {options.map(option => (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ))}
</Select>
```

### Radio Group

```typescript
<RadioGroup
  name={name}
  aria-labelledby={`${path}-label`}
  aria-describedby={hasError ? `${path}-error` : undefined}
  aria-required={required}
>
  <FormLabel id={`${path}-label`}>{label}</FormLabel>
  {options.map(option => (
    <FormControlLabel
      key={option.value}
      value={option.value}
      control={<Radio />}
      label={option.label}
    />
  ))}
</RadioGroup>
```

### Array (동적 항목)

```typescript
<Box role="group" aria-labelledby={`${path}-label`}>
  <Typography id={`${path}-label`}>{label}</Typography>
  
  {items.map((item, index) => (
    <Box key={index} role="listitem">
      {/* Child component */}
      
      <IconButton
        aria-label={`Remove item ${index + 1}`}  // ✅ 명확한 label
        onClick={() => removeItem(index)}
      >
        <DeleteIcon />
      </IconButton>
    </Box>
  ))}
  
  <Button
    aria-label="Add new item"  // ✅ 명확한 label
    onClick={addItem}
  >
    Add
  </Button>
</Box>
```

## 접근성 테스트 도구

### 자동 테스트
- **axe-core**: 자동 접근성 검사
- **jest-axe**: Jest 통합
- **@storybook/addon-a11y**: Storybook 접근성 검사

```typescript
// 예: jest-axe
import { axe } from 'jest-axe';

test('FormTypeInputString should have no accessibility violations', async () => {
  const { container } = render(<FormTypeInputString {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 수동 테스트
- **키보드만으로 네비게이션** (마우스 사용 금지)
- **스크린 리더** (NVDA, JAWS, VoiceOver)
- **브라우저 개발자 도구** (Lighthouse Accessibility)

## 접근성 체크리스트 (요약)

플러그인 배포 전 확인:

### 필수 항목
- [ ] 모든 Input에 `id`, `name` 속성
- [ ] `required` Input에 `aria-required`
- [ ] 에러 상태에 `aria-invalid`, `aria-describedby`
- [ ] Label과 Input `htmlFor` 연결
- [ ] 에러 메시지 ID와 Input `aria-describedby` 매칭
- [ ] 키보드로 모든 기능 접근 가능
- [ ] Tab 순서가 논리적

### 권장 항목
- [ ] 스크린 리더 테스트 완료
- [ ] 색상 대비율 4.5:1 이상
- [ ] 색상만으로 정보 전달하지 않음
- [ ] 그룹화 (fieldset, role="group") 적용
- [ ] 명확한 `aria-label` 또는 Label 텍스트
- [ ] axe-core 테스트 통과

---

**핵심 원칙**:
1. 모든 Input에 필수 ARIA 속성
2. Label과 Input 명확히 연결
3. 키보드로 모든 기능 접근 가능
4. 스크린 리더 친화적 텍스트
5. 자동 테스트 + 수동 테스트

