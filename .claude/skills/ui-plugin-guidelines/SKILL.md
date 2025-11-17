# UI Plugin Guidelines Skill

## 역할
당신은 UI 라이브러리와 @canard/schema-form 플러그인 간 호환성 검증 및 프로젝트 구조 설계 전문가입니다.

## 핵심 책임
1. **호환성 검증**: UI 라이브러리 컴포넌트와 Schema Form 요구사항 매핑
2. **프로젝트 구조 설계**: 플러그인 디렉토리 구조 권장
3. **접근성 요구사항**: ARIA 속성 및 키보드 네비게이션 가이드
4. **렌더러 컴포넌트**: FormGroup, FormLabel, FormInput, FormError 구현 가이드
5. **UI 라이브러리별 특수 사항**: 각 라이브러리의 고유한 패턴 안내

## 작동 방식

### 1. 호환성 분석
**knowledge/compatibility-matrix.md**를 통해:
- Schema Form 요구사항과 UI 라이브러리 컴포넌트 매핑
- 호환성 등급 (직접/커스텀/Fallback) 판정
- 구현 우선순위 결정

### 2. 프로젝트 구조 제공
**knowledge/project-structure.md**로:
- 권장 디렉토리 구조
- 파일 명명 규칙
- import/export 패턴

### 3. 접근성 검증
**knowledge/accessibility-checklist.md**로:
- ARIA 속성 필수 항목
- 키보드 네비게이션 요구사항
- 스크린 리더 호환성

## 제공하는 정보

### 호환성 매핑 표 형식

| Schema Form 요구사항 | UI Library 컴포넌트 | 호환성 | 구현 방식 | 우선순위 |
|---------------------|---------------------|--------|----------|---------|
| String 입력 (기본) | TextField / Input | ✅ 직접 | defaultValue 사용 | P1 |
| Number 입력 | NumberInput | ✅ 직접 | type="number" | P1 |
| Boolean (Checkbox) | Checkbox | ✅ 직접 | defaultChecked | P1 |
| Date 선택 | DatePicker | ⚠️ 커스텀 | 값 변환 필요 | P2 |
| Rich Text 편집기 | - | ❌ 없음 | Fallback 또는 외부 라이브러리 | P4 |

**호환성 등급**:
- ✅ **직접**: 컴포넌트 그대로 사용 가능
- ⚠️ **커스텀**: 값 변환/래핑 필요
- ❌ **없음**: Fallback 또는 외부 라이브러리 필요

### 권장 프로젝트 구조

```
@canard/schema-form-{ui-library}-plugin/
├── src/
│   ├── index.ts                    # 메인 export (plugin 객체)
│   ├── type.ts                     # Context 타입 정의
│   ├── renderers/                  # 기본 렌더러 (필수 5개)
│   │   ├── FormGroup.tsx
│   │   ├── FormLabel.tsx
│   │   ├── FormInput.tsx
│   │   ├── FormError.tsx
│   │   └── formatError.ts
│   ├── formTypeInputs/             # FormTypeInput 구현체
│   │   ├── index.ts                # formTypeInputDefinitions 통합
│   │   ├── FormTypeInputString.tsx
│   │   ├── FormTypeInputNumber.tsx
│   │   ├── FormTypeInputBoolean.tsx
│   │   ├── FormTypeInputArray.tsx
│   │   ├── FormTypeInputStringEnum.tsx
│   │   └── ...
│   └── utils/                      # 공통 유틸리티 (선택적)
│       └── valueConversion.ts      # 값 변환 헬퍼
├── coverage/                       # Storybook stories
│   ├── FormTypeInputString.stories.tsx
│   └── ...
├── package.json
├── tsconfig.json
├── rollup.config.mjs
├── vite.config.ts                  # Vitest 설정
├── README.md
└── README-ko_kr.md
```

### 필수 렌더러 컴포넌트

#### 1. FormGroup

**역할**: 필드 그룹 래퍼 (object, array 타입)

**필수 처리**:
- `depth` 기반 스타일링 (들여쓰기)
- `isRoot` 조건 처리
- 타입별 시각적 구분 (object vs array)

```typescript
const FormGroup = ({
  depth,
  isRoot,
  type,
  name,
  children,
}: FormTypeRendererProps) => {
  return (
    <Box
      sx={{
        pl: depth * 2,  // 깊이에 따른 들여쓰기
        border: isRoot ? 'none' : '1px solid',
        borderColor: 'divider',
      }}
    >
      {!isRoot && (
        <Typography variant="h6">{name}</Typography>
      )}
      {children}
    </Box>
  );
};
```

#### 2. FormLabel

**역할**: 필드 라벨 렌더링

**필수 처리**:
- `htmlFor` 연결
- `required` 시각적 표시 (`*` 또는 라이브러리 표준)
- 라벨 우선순위: `jsonSchema.label` > `jsonSchema.title` > `name`

```typescript
const FormLabel = ({
  path,
  name,
  jsonSchema,
  required,
}: FormTypeRendererProps) => {
  const label = jsonSchema.label || jsonSchema.title || name;
  
  return (
    <FormLabel htmlFor={path} required={required}>
      {label}
    </FormLabel>
  );
};
```

#### 3. FormInput

**역할**: Input 컴포넌트 래퍼

**구현**: 단순 패스스루

```typescript
const FormInput = ({ Input, ...props }: FormTypeRendererProps) => {
  return <Input {...props} />;
};
```

#### 4. FormError

**역할**: 에러 메시지 표시

```typescript
const FormError = ({ errorMessage }: FormTypeRendererProps) => {
  if (!errorMessage) return null;
  
  return (
    <FormHelperText error>
      {errorMessage}
    </FormHelperText>
  );
};
```

#### 5. formatError

**역할**: JsonSchemaError → ReactNode 변환

```typescript
const formatError: FormatError = (error, node, context) => {
  // 다국어 지원, 사용자 친화적 메시지
  return error.message;
};
```

## 접근성 요구사항

### 필수 ARIA 속성

```typescript
<TextField
  id={path}                          // ✅ 고유 ID
  name={name}                        // ✅ name 속성
  required={required}                // ✅ required
  aria-required={required}           // ✅ ARIA required
  aria-invalid={hasError}            // ✅ ARIA invalid
  aria-describedby={`${path}-error`} // ✅ 에러 연결
/>
```

### 키보드 네비게이션

- Tab: 다음 필드로 이동
- Shift+Tab: 이전 필드로 이동
- Enter: 폼 제출 (button type="submit")
- Esc: 모달 닫기 (해당 시)

## UI 라이브러리별 특수 사항

### MUI (Material-UI)

**slotProps 패턴**:
```typescript
<DatePicker
  slotProps={{
    textField: { id, name, required, disabled },
  }}
/>
```

**sx prop 스타일링**:
```typescript
<Box sx={{ pl: 2, mb: 1 }} />
```

### Ant Design

**Form.Item 사용하지 않음**:
- canard-form이 레이아웃 관리
- 컴포넌트만 직접 사용

```typescript
// ✅ 올바름
<Input id={path} name={name} />

// ❌ 사용하지 않음
<Form.Item label="Name">
  <Input />
</Form.Item>
```

### Chakra UI

**FormControl 래핑**:
```typescript
<FormControl isRequired={required} isInvalid={hasError}>
  <FormLabel htmlFor={path}>{label}</FormLabel>
  <Input id={path} name={name} />
  {hasError && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
</FormControl>
```

## 제약 조건

- 필수 렌더러 5개는 반드시 구현
- 접근성 속성 필수
- UI 라이브러리 네이티브 컴포넌트 우선 사용
- 커스텀 컴포넌트는 최소화

## 출력 형식

### 호환성 분석 결과

```markdown
## {UI Library} 호환성 분석

### ✅ 직접 사용 가능 (Priority 1)
- String 입력: TextField
- Number 입력: NumberInput
- Boolean: Checkbox

### ⚠️ 커스텀 필요 (Priority 2)
- Date 선택: DatePicker (값 변환 필요)
- Time 선택: TimePicker (값 변환 필요)

### ❌ 대체 필요 (Priority 3)
- Rich Text: 외부 라이브러리 (react-quill 등)

**구현 권장 순서**: P1 → P2 → P3
```

## 다음 단계 연계

- 호환성 분석 후 `react-plugin-implementation` 스킬로 구현
- 프로젝트 구조 설정 후 `phased-development` 스킬로 개발 진행

## 사용 시나리오

### 시나리오 1: MUI (Material-UI) v6 플러그인 호환성 검증

**상황**: @canard/schema-form을 위한 MUI v6 플러그인 개발 시작

**Step 1: 호환성 분석**

```markdown
## MUI v6 호환성 분석

### ✅ 직접 사용 가능 (Priority 1)

| Schema Form 요구사항 | MUI 컴포넌트 | 호환성 | 구현 방식 | 비고 |
|---------------------|-------------|--------|----------|------|
| String 입력 (기본) | TextField | ✅ 직접 | defaultValue, onChange | - |
| Number 입력 | TextField (type="number") | ✅ 직접 | type="number" | - |
| Boolean (Checkbox) | Checkbox | ✅ 직접 | defaultChecked | - |
| Boolean (Switch) | Switch | ✅ 직접 | defaultChecked | - |
| String (Multiline) | TextField (multiline) | ✅ 직접 | multiline prop | - |
| StringEnum (Radio) | RadioGroup | ✅ 직접 | - | - |
| StringEnum (Select) | Select | ✅ 직접 | - | - |
| Array (기본) | - | ✅ 렌더러 | ChildNodeComponents | FormGroup으로 래핑 |
| Object (기본) | - | ✅ 렌더러 | ChildNodeComponents | FormGroup으로 래핑 |

### ⚠️ 커스텀 필요 (Priority 2)

| Schema Form 요구사항 | MUI 컴포넌트 | 호환성 | 구현 방식 | 필요 작업 |
|---------------------|-------------|--------|----------|----------|
| Date 입력 | DatePicker (@mui/x-date-pickers) | ⚠️ 커스텀 | slotProps 활용 | ISO string ↔ Date 변환 |
| Time 입력 | TimePicker (@mui/x-date-pickers) | ⚠️ 커스텀 | slotProps 활용 | ISO string ↔ Date 변환 |
| DateTime 입력 | DateTimePicker (@mui/x-date-pickers) | ⚠️ 커스텀 | slotProps 활용 | ISO string ↔ Date 변환 |
| StringEnum (Autocomplete) | Autocomplete | ⚠️ 커스텀 | value/onChange 매핑 | 값 구조 변환 |
| File Upload | - | ⚠️ 커스텀 | Button + hidden input | onFileAttach 연동 |

### ❌ 대체 필요 (Priority 3)

| Schema Form 요구사항 | MUI 컴포넌트 | 호환성 | 대체 방안 | 비고 |
|---------------------|-------------|--------|----------|------|
| Rich Text Editor | - | ❌ 없음 | react-quill, tiptap | 외부 라이브러리 |
| Color Picker | - | ❌ 없음 | react-color, mui-color | 외부 라이브러리 |
| Slider (Range) | Slider | ⚠️ 커스텀 | value/onChange 매핑 | 단일값/범위 처리 |

**구현 권장 순서**:
1. P1 (기본 FormType 9개) - 1-2일
2. P2 (DatePicker, Autocomplete 등) - 2-3일
3. P3 (Rich Text 등) - 선택적

**총 예상 개발 기간**: 5-7일 (테스트 포함)
```

**Step 2: 특수 사항 확인**

```markdown
## MUI v6 특수 사항

### 1. DatePicker slotProps 패턴
MUI DatePicker는 TextField를 내부적으로 사용하므로, slotProps로 접근성 속성 전달:

```typescript
<DatePicker
  value={value ? new Date(value) : null}
  onChange={(newDate) => onChange(newDate?.toISOString())}
  slotProps={{
    textField: {
      id: path,
      name: name,
      required: required,
      disabled: disabled,
      error: hasError,
      helperText: errorMessage,
    },
  }}
/>
```

### 2. sx prop 스타일링
MUI의 sx prop 활용하여 일관된 스타일링:

```typescript
<Box sx={{ pl: depth * 2, mb: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
  {children}
</Box>
```

### 3. Theme 통합
사용자의 MUI Theme 존중:

```typescript
import { useTheme } from '@mui/material/styles';

const FormGroup = ({ depth, children }: FormTypeRendererProps) => {
  const theme = useTheme();

  return (
    <Box sx={{
      pl: depth * theme.spacing(2),  // theme spacing 사용
      borderColor: theme.palette.divider,
    }}>
      {children}
    </Box>
  );
};
```

### 4. 의존성 버전
```json
{
  "peerDependencies": {
    "@mui/material": ">=6.0.0 <7.0.0",
    "@mui/x-date-pickers": ">=7.0.0 <8.0.0",  // DatePicker 사용 시
    "react": ">=18.0.0",
    "@canard/schema-form": "*"
  }
}
```
```

**Step 3: 접근성 검증**

```markdown
## MUI 접근성 체크리스트

### ✅ 필수 ARIA 속성

**TextField**:
```typescript
<TextField
  id={path}                          // ✅ 고유 ID (WCAG 4.1.1)
  name={name}                        // ✅ name 속성
  label={label}                      // ✅ 라벨 (WCAG 1.3.1)
  required={required}                // ✅ required (WCAG 3.3.2)
  error={hasError}                   // ✅ error 상태
  helperText={errorMessage}          // ✅ 에러 메시지 (WCAG 3.3.1)
  aria-describedby={`${path}-helper`} // ✅ 보조 텍스트 연결
/>
```

**Checkbox**:
```typescript
<FormControlLabel
  control={
    <Checkbox
      id={path}
      name={name}
      checked={value ?? false}
      required={required}
      aria-required={required}
    />
  }
  label={label}  // ✅ 체크박스 라벨 (WCAG 1.3.1)
/>
```

**RadioGroup**:
```typescript
<FormControl component="fieldset" required={required}>
  <FormLabel component="legend">{label}</FormLabel>  {/* ✅ 그룹 라벨 */}
  <RadioGroup
    name={name}
    value={value ?? ''}
    onChange={(e) => onChange(e.target.value)}
  >
    {options.map(option => (
      <FormControlLabel
        key={option.value}
        value={option.value}
        control={<Radio />}
        label={option.label}  {/* ✅ 각 라디오 라벨 */}
      />
    ))}
  </RadioGroup>
</FormControl>
```

### 🎹 키보드 네비게이션

**기본 동작** (MUI 기본 지원):
- Tab: 다음 필드로 이동 ✅
- Shift+Tab: 이전 필드로 이동 ✅
- Enter: 폼 제출 (type="submit" 버튼) ✅
- Space: 체크박스/라디오 토글 ✅
- Arrow keys: 라디오 그룹 내 이동 ✅

**DatePicker 특수 동작**:
- Enter: 날짜 선택기 열기
- Esc: 날짜 선택기 닫기
- Arrow keys: 날짜 네비게이션

### 🖥️ 스크린 리더 테스트

**권장 테스트 도구**:
- NVDA (Windows) - 무료
- JAWS (Windows) - 유료
- VoiceOver (macOS) - 기본 내장

**테스트 시나리오**:
1. 폼 필드 라벨이 올바르게 읽히는지
2. 에러 메시지가 필드와 연결되어 읽히는지
3. required 필드가 "필수" 또는 "required"로 표시되는지
4. 체크박스/라디오 상태가 올바르게 읽히는지
```

**결과 요약**:
```markdown
## MUI v6 플러그인 개발 준비 완료

### ✅ 검증 완료 항목
- 9개 기본 FormType 직접 지원 가능
- DatePicker 등 5개 추가 FormType 커스텀 지원
- 접근성 요구사항 모두 충족 가능
- MUI Theme 통합 가능

### 📋 다음 단계
1. 프로젝트 구조 설정 (권장 구조 사용)
2. P1 FormType 9개 구현 (react-plugin-implementation 스킬)
3. P2 DatePicker 등 커스텀 FormType 구현
4. Storybook stories 작성
5. 접근성 테스트

### ⚠️ 주의사항
- @mui/x-date-pickers는 별도 peer dependency
- slotProps 패턴 일관되게 사용
- Theme spacing 활용하여 일관된 스타일링
```

### 시나리오 2: Ant Design v5 플러그인 호환성 검증

**상황**: Ant Design v5 기반 플러그인 개발

**Step 1: 호환성 분석**

```markdown
## Ant Design v5 호환성 분석

### ✅ 직접 사용 가능 (Priority 1)

| Schema Form 요구사항 | Ant Design 컴포넌트 | 호환성 | 구현 방식 | 특이사항 |
|---------------------|-------------------|--------|----------|---------|
| String 입력 (기본) | Input | ✅ 직접 | defaultValue | - |
| Number 입력 | InputNumber | ✅ 직접 | defaultValue | - |
| Boolean (Checkbox) | Checkbox | ✅ 직접 | defaultChecked | - |
| Boolean (Switch) | Switch | ✅ 직접 | defaultChecked | - |
| String (Multiline) | Input.TextArea | ✅ 직접 | defaultValue | - |
| StringEnum (Radio) | Radio.Group | ✅ 직접 | defaultValue | - |
| StringEnum (Select) | Select | ✅ 직접 | defaultValue | - |
| Date 입력 | DatePicker | ⚠️ 커스텀 | dayjs 변환 | dayjs 필수 |
| Time 입력 | TimePicker | ⚠️ 커스텀 | dayjs 변환 | dayjs 필수 |

### ⚠️ 커스텀 필요 (Priority 2)

| Schema Form 요구사항 | Ant Design 컴포넌트 | 호환성 | 구현 방식 | 필요 작업 |
|---------------------|-------------------|--------|----------|----------|
| StringEnum (Autocomplete) | AutoComplete | ⚠️ 커스텀 | options 매핑 | 값 구조 변환 |
| Number (Slider) | Slider | ⚠️ 커스텀 | - | 단일값/범위 처리 |
| File Upload | Upload | ⚠️ 커스텀 | customRequest | onFileAttach 연동 |
| Color Picker | ColorPicker | ✅ 직접 | - | v5.5+ 기본 지원 |

### 🚨 중요: Form.Item 사용하지 않음

Ant Design의 Form.Item은 **사용하지 않습니다**. @canard/schema-form이 폼 레이아웃과 검증을 관리합니다.

```typescript
// ❌ 잘못된 방법 (Form.Item 사용)
<Form.Item label="Name" name="name" rules={[{ required: true }]}>
  <Input />
</Form.Item>

// ✅ 올바른 방법 (컴포넌트만 사용)
<Input
  id={path}
  name={name}
  defaultValue={defaultValue}
  onChange={(e) => onChange(e.target.value)}
  status={hasError ? 'error' : undefined}
/>
```

**이유**:
1. @canard/schema-form이 JSON Schema 기반으로 검증 관리
2. Form.Item의 name, rules는 중복/충돌 발생
3. FormGroup, FormLabel, FormError 렌더러가 레이아웃 담당
```

**Step 2: Ant Design 특수 사항**

```markdown
## Ant Design v5 특수 사항

### 1. dayjs 필수 의존성

Ant Design v5는 날짜 처리에 dayjs 사용 (moment.js 제거):

```json
{
  "dependencies": {
    "dayjs": "^1.11.10"
  },
  "peerDependencies": {
    "antd": ">=5.0.0 <6.0.0",
    "react": ">=18.0.0",
    "@canard/schema-form": "*"
  }
}
```

**DatePicker 구현**:
```typescript
import dayjs, { Dayjs } from 'dayjs';
import { DatePicker } from 'antd';

function FormTypeInputDate(props: FormTypeInputProps<string>) {
  const { value, defaultValue, onChange, ...rest } = props;

  return (
    <DatePicker
      {...rest}
      defaultValue={defaultValue ? dayjs(defaultValue) : undefined}
      value={value ? dayjs(value) : null}
      onChange={(date: Dayjs | null) => {
        onChange(date ? date.toISOString() : undefined);
      }}
    />
  );
}
```

### 2. status prop으로 에러 표시

Ant Design은 `error` prop 대신 `status` prop 사용:

```typescript
<Input
  status={hasError ? 'error' : undefined}  // ✅ status prop
/>

// ❌ error prop은 없음
<Input error={hasError} />  // 작동 안 함
```

### 3. ConfigProvider를 통한 테마

사용자의 Ant Design 테마 존중:

```typescript
import { ConfigProvider, theme } from 'antd';

// 사용자가 설정한 테마 사용
const { token } = theme.useToken();

<div style={{ padding: token.padding }}>
  {children}
</div>
```

### 4. Upload 컴포넌트 특수 처리

Upload는 customRequest로 onFileAttach 연동:

```typescript
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

function FormTypeInputFile(props: FormTypeInputProps<string>) {
  const { onChange, onFileAttach, value } = props;

  return (
    <Upload
      maxCount={1}
      customRequest={({ file, onSuccess }) => {
        // File 객체를 schema-form에 첨부
        onFileAttach(file as File);

        // 파일명을 value로 저장
        onChange((file as File).name);

        onSuccess?.('ok');
      }}
      fileList={value ? [{ uid: '-1', name: value, status: 'done' }] : []}
    >
      <Button icon={<UploadOutlined />}>Click to Upload</Button>
    </Upload>
  );
}
```
```

**Step 3: 접근성 검증**

```markdown
## Ant Design 접근성 검증

### ✅ 기본 접근성 지원

Ant Design v5는 대부분의 접근성 속성을 자동으로 처리하지만, 일부는 수동 추가 필요:

**Input**:
```typescript
<Input
  id={path}                    // ✅ 고유 ID
  name={name}                  // ✅ name 속성
  aria-required={required}     // ⚠️ 수동 추가 필요
  aria-invalid={hasError}      // ⚠️ 수동 추가 필요
  aria-describedby={hasError ? `${path}-error` : undefined}  // ⚠️ 수동
  status={hasError ? 'error' : undefined}
/>
```

**Checkbox**:
```typescript
<Checkbox
  id={path}
  name={name}
  checked={value ?? false}
  aria-required={required}     // ⚠️ 수동 추가 필요
>
  {label}
</Checkbox>
```

**Select**:
```typescript
<Select
  id={path}
  defaultValue={defaultValue}
  onChange={onChange}
  aria-required={required}     // ⚠️ 수동 추가 필요
  aria-invalid={hasError}      // ⚠️ 수동 추가 필요
  status={hasError ? 'error' : undefined}
>
  {options.map(opt => (
    <Select.Option key={opt.value} value={opt.value}>
      {opt.label}
    </Select.Option>
  ))}
</Select>
```

### ⚠️ 주의: FormLabel 직접 구현 필요

Ant Design의 Form.Item을 사용하지 않으므로, FormLabel 렌더러에서 라벨 처리:

```typescript
const FormLabel = ({ path, name, jsonSchema, required }: FormTypeRendererProps) => {
  const label = jsonSchema.label || jsonSchema.title || name;

  return (
    <label
      htmlFor={path}
      style={{
        display: 'block',
        marginBottom: '8px',
        fontWeight: 500,
      }}
    >
      {label}
      {required && <span style={{ color: 'red', marginLeft: '4px' }}>*</span>}
    </label>
  );
};
```

### 🎹 키보드 네비게이션

Ant Design은 기본 키보드 네비게이션 지원:
- Tab/Shift+Tab: 필드 이동 ✅
- Enter: 폼 제출 ✅
- Space: 체크박스/스위치 토글 ✅
- Arrow keys: Select/Radio 옵션 이동 ✅

### 📝 접근성 테스트 체크리스트

- [ ] 모든 Input에 id, name, aria-required 속성 확인
- [ ] 에러 발생 시 aria-invalid 및 aria-describedby 추가
- [ ] FormLabel이 htmlFor로 Input과 연결 확인
- [ ] 키보드만으로 모든 필드 접근 가능한지 테스트
- [ ] 스크린 리더로 라벨 및 에러 메시지 읽히는지 테스트
```

**결과 요약**:
```markdown
## Ant Design v5 플러그인 개발 준비 완료

### ✅ 검증 완료 항목
- 9개 기본 FormType 지원 (DatePicker는 dayjs 변환)
- ColorPicker 기본 지원 (v5.5+)
- Upload 컴포넌트 커스텀 지원 가능

### ⚠️ 주의사항
- Form.Item 절대 사용하지 않음
- dayjs peer dependency 필수
- status prop 사용 (error prop 없음)
- ARIA 속성 일부 수동 추가 필요

### 📋 다음 단계
1. dayjs 의존성 추가
2. FormLabel, FormError 렌더러 직접 구현
3. 모든 컴포넌트에 ARIA 속성 수동 추가
4. 접근성 테스트 (스크린 리더, 키보드)
```

### 시나리오 3: Chakra UI v2 플러그인 호환성 검증

**상황**: Chakra UI v2 기반 플러그인 개발

**Step 1: 호환성 분석**

```markdown
## Chakra UI v2 호환성 분석

### ✅ 직접 사용 가능 (Priority 1)

| Schema Form 요구사항 | Chakra UI 컴포넌트 | 호환성 | 구현 방식 | 특이사항 |
|---------------------|------------------|--------|----------|---------|
| String 입력 (기본) | Input | ✅ 직접 | defaultValue | FormControl 래핑 |
| Number 입력 | NumberInput | ✅ 직접 | defaultValue | - |
| Boolean (Checkbox) | Checkbox | ✅ 직접 | defaultChecked | - |
| Boolean (Switch) | Switch | ✅ 직접 | defaultChecked | - |
| String (Multiline) | Textarea | ✅ 직접 | defaultValue | - |
| StringEnum (Radio) | RadioGroup | ✅ 직접 | defaultValue | - |
| StringEnum (Select) | Select | ✅ 직접 | defaultValue | - |

### ⚠️ 커스텀 필요 (Priority 2)

| Schema Form 요구사항 | Chakra UI 컴포넌트 | 호환성 | 구현 방식 | 필요 작업 |
|---------------------|------------------|--------|----------|----------|
| Number (Slider) | Slider | ⚠️ 커스텀 | - | 단일값/범위 처리 |
| File Upload | - | ❌ 없음 | Input (type="file") | 커스텀 스타일링 |
| Color Picker | - | ❌ 없음 | react-colorful | 외부 라이브러리 |

### ❌ 대체 필요 (Priority 3)

| Schema Form 요구사항 | Chakra UI 컴포넌트 | 호환성 | 대체 방안 | 비고 |
|---------------------|------------------|--------|----------|------|
| Date Picker | - | ❌ 없음 | react-datepicker + Chakra 스타일 | Chakra는 DatePicker 없음 |
| Rich Text Editor | - | ❌ 없음 | tiptap + Chakra 스타일 | 외부 라이브러리 |

**주요 차이점**: Chakra UI는 DatePicker/TimePicker가 없으므로 외부 라이브러리 필수
```

**Step 2: Chakra UI 특수 사항**

```markdown
## Chakra UI v2 특수 사항

### 1. FormControl 래핑 패턴 (필수)

Chakra UI는 FormControl로 필드를 래핑하여 접근성 자동 처리:

```typescript
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  Input,
} from '@chakra-ui/react';

function FormTypeInputString(props: FormTypeInputProps<string>) {
  const { path, name, jsonSchema, required, value, defaultValue, onChange, errors } = props;

  const label = jsonSchema.label || jsonSchema.title || name;
  const hasError = errors && errors.length > 0;
  const errorMessage = hasError ? errors[0].message : undefined;

  return (
    <FormControl isRequired={required} isInvalid={hasError}>
      <FormLabel htmlFor={path}>{label}</FormLabel>
      <Input
        id={path}
        name={name}
        defaultValue={defaultValue}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {hasError && <FormErrorMessage>{errorMessage}</FormErrorMessage>}
      {jsonSchema.description && (
        <FormHelperText>{jsonSchema.description}</FormHelperText>
      )}
    </FormControl>
  );
}
```

**FormControl의 장점**:
- `isRequired` → 라벨에 자동으로 `*` 표시
- `isInvalid` → Input에 error 스타일 자동 적용
- `htmlFor` → FormLabel과 Input 자동 연결
- ARIA 속성 자동 추가

### 2. NumberInput 특수 구조

NumberInput은 복합 컴포넌트:

```typescript
import { NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react';

<NumberInput
  defaultValue={defaultValue}
  value={value ?? undefined}
  onChange={(valueString, valueNumber) => onChange(valueNumber)}
  min={jsonSchema.minimum}
  max={jsonSchema.maximum}
>
  <NumberInputField id={path} name={name} />
  <NumberInputStepper>
    <NumberIncrementStepper />
    <NumberDecrementStepper />
  </NumberInputStepper>
</NumberInput>
```

### 3. DatePicker 통합 (react-datepicker)

Chakra UI는 DatePicker가 없으므로 react-datepicker를 Chakra 스타일로 래핑:

```typescript
import ReactDatePicker from 'react-datepicker';
import { Input, useColorMode } from '@chakra-ui/react';
import 'react-datepicker/dist/react-datepicker.css';

function ChakraDatePicker({ value, onChange, ...props }: any) {
  const { colorMode } = useColorMode();

  return (
    <ReactDatePicker
      selected={value ? new Date(value) : null}
      onChange={(date: Date | null) => {
        onChange(date ? date.toISOString() : undefined);
      }}
      customInput={
        <Input
          {...props}
          bg={colorMode === 'dark' ? 'gray.700' : 'white'}
        />
      }
    />
  );
}
```

**의존성 추가**:
```json
{
  "dependencies": {
    "react-datepicker": "^4.21.0",
    "@types/react-datepicker": "^4.19.0"
  }
}
```

### 4. useColorMode 통합

Chakra UI의 다크 모드 지원:

```typescript
import { useColorMode } from '@chakra-ui/react';

const FormGroup = ({ depth, children }: FormTypeRendererProps) => {
  const { colorMode } = useColorMode();

  return (
    <Box
      pl={depth * 4}
      borderLeft="2px solid"
      borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.50'}
    >
      {children}
    </Box>
  );
};
```
```

**Step 3: 접근성 검증**

```markdown
## Chakra UI 접근성 검증

### ✅ FormControl 자동 접근성 처리

Chakra UI의 FormControl은 대부분의 접근성 속성을 자동으로 추가:

**자동 추가되는 속성**:
```typescript
<FormControl isRequired={true} isInvalid={true}>
  <FormLabel htmlFor="name">Name</FormLabel>
  <Input id="name" name="name" />
  <FormErrorMessage>Name is required</FormErrorMessage>
</FormControl>
```

**렌더링된 HTML** (자동 생성):
```html
<div role="group">
  <label for="name" class="chakra-form__label">
    Name
    <span role="presentation" aria-hidden="true" class="chakra-form__required-indicator">*</span>
  </label>
  <input
    id="name"
    name="name"
    aria-required="true"
    aria-invalid="true"
    aria-describedby="name-feedback"
    class="chakra-input"
  />
  <div id="name-feedback" class="chakra-form__error-message">
    Name is required
  </div>
</div>
```

**자동 처리 항목**:
- ✅ `aria-required` (isRequired prop에서)
- ✅ `aria-invalid` (isInvalid prop에서)
- ✅ `aria-describedby` (FormErrorMessage 연결)
- ✅ `htmlFor` 연결 (FormLabel)
- ✅ `*` 표시 (required 시)

### 🎹 키보드 네비게이션

Chakra UI는 완벽한 키보드 네비게이션 지원:
- Tab/Shift+Tab: 필드 이동 ✅
- Enter: 폼 제출 ✅
- Space: 체크박스/스위치 토글 ✅
- Arrow keys: Radio, Select, NumberInput 조작 ✅

### 🌗 다크 모드 접근성

Chakra UI의 다크 모드는 WCAG 대비율 자동 보장:

```typescript
import { useColorModeValue } from '@chakra-ui/react';

const FormGroup = ({ children }: FormTypeRendererProps) => {
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  return (
    <Box bg={bgColor} borderColor={borderColor}>
      {children}
    </Box>
  );
};
```

### 📝 접근성 테스트 체크리스트

- [x] FormControl로 모든 필드 래핑
- [x] isRequired, isInvalid prop 사용
- [x] FormLabel, FormErrorMessage 사용
- [x] 키보드 네비게이션 테스트
- [x] 스크린 리더 테스트
- [x] 다크 모드 대비율 확인
```

**결과 요약**:
```markdown
## Chakra UI v2 플러그인 개발 준비 완료

### ✅ 강점
- FormControl의 자동 접근성 처리 (최고 수준)
- 완벽한 다크 모드 지원
- 간결한 API (isRequired, isInvalid)
- 키보드 네비게이션 완벽

### ⚠️ 약점
- DatePicker 없음 (react-datepicker 통합 필요)
- TimePicker 없음
- ColorPicker 없음
- 추가 의존성 필요

### 📋 다음 단계
1. react-datepicker 통합 및 Chakra 스타일 적용
2. FormControl 패턴 일관되게 적용
3. useColorMode로 다크 모드 지원
4. 접근성 자동 처리 검증
```

### 시나리오 4: Headless UI + Tailwind CSS 플러그인 호환성 검증

**상황**: Headless UI + Tailwind CSS 조합 플러그인 개발

**호환성 분석**:

```markdown
## Headless UI + Tailwind CSS 호환성 분석

### ⚠️ 특수 상황: 스타일 없는 컴포넌트

Headless UI는 스타일이 전혀 없는 완전 headless 컴포넌트이므로:
- 모든 스타일을 Tailwind CSS로 직접 작성 필요
- 접근성은 자동 처리 (Headless UI의 강점)
- FormControl 같은 래퍼 없음 → 직접 구현

### ✅ Headless UI 활용 가능

| 용도 | Headless UI 컴포넌트 | 구현 방식 |
|------|---------------------|----------|
| StringEnum (Select) | Listbox | 완전 접근성 지원 |
| StringEnum (Autocomplete) | Combobox | 검색 기능 + 접근성 |
| Boolean (Toggle) | Switch | 접근성 자동 처리 |
| Radio Group | RadioGroup | 접근성 자동 처리 |

### 🔧 직접 구현 필요

| 용도 | 구현 방식 | 비고 |
|------|----------|------|
| String 입력 | `<input>` + Tailwind | 스타일만 추가 |
| Number 입력 | `<input type="number">` + Tailwind | 스타일만 추가 |
| Textarea | `<textarea>` + Tailwind | 스타일만 추가 |
| Checkbox | `<input type="checkbox">` + Tailwind | 커스텀 스타일링 |
| DatePicker | react-datepicker + Tailwind | 외부 라이브러리 |

**결론**: Headless UI + Tailwind는 **고급 사용자용**
- 장점: 완전한 스타일 자유도, 작은 번들 사이즈
- 단점: 모든 스타일을 직접 작성, 개발 시간 증가
```

**권장사항**:
```markdown
## 권장 사항

### ✅ Headless UI + Tailwind 추천 대상
- Tailwind CSS에 익숙한 팀
- 완전한 디자인 커스터마이징 필요
- 번들 사이즈 최소화 우선

### ⚠️ 권장하지 않는 대상
- 빠른 프로토타이핑 필요
- 디자인 시스템 없음
- Tailwind CSS 경험 부족

### 💡 대안
위 조건에 해당하면 MUI, Ant Design, Chakra UI 추천
```

### 시나리오 5: 다중 UI 라이브러리 비교 및 선택 가이드

**상황**: 프로젝트에 가장 적합한 UI 라이브러리 선택

**비교표**:

```markdown
## UI 라이브러리 종합 비교

| 기준 | MUI v6 | Ant Design v5 | Chakra UI v2 | Headless UI + TW |
|------|--------|---------------|--------------|------------------|
| **기본 컴포넌트** | ✅ 완벽 (9/9) | ✅ 완벽 (9/9) | ✅ 완벽 (9/9) | ⚠️ 수동 (5/9) |
| **DatePicker** | ✅ 있음 (@mui/x) | ✅ 있음 (dayjs) | ❌ 없음 | ❌ 없음 |
| **접근성** | ✅ 우수 | ⚠️ 수동 추가 | ✅ 최고 (자동) | ✅ 우수 (headless) |
| **다크 모드** | ✅ Theme | ✅ ConfigProvider | ✅ 완벽 (내장) | 🔧 수동 (TW) |
| **번들 크기** | 🟡 중간 (300KB+) | 🟡 중간 (400KB+) | 🟢 작음 (200KB+) | 🟢 최소 (50KB+) |
| **TypeScript** | ✅ 완벽 | ✅ 우수 | ✅ 우수 | ✅ 우수 |
| **학습 곡선** | 🟡 중간 | 🟡 중간 | 🟢 쉬움 | 🔴 어려움 |
| **커뮤니티** | ✅ 최대 | ✅ 대형 | 🟡 중간 | 🟢 성장 중 |
| **디자인 자유도** | 🟡 제한적 (sx) | 🟡 제한적 (style) | 🟢 높음 (props) | ✅ 최대 (TW) |
| **개발 속도** | ✅ 빠름 | ✅ 빠름 | ✅ 빠름 | 🟡 느림 |

**추천 순위**:

1. **MUI v6** - 가장 안전한 선택
   - 👍 완전한 컴포넌트 세트
   - 👍 DatePicker 기본 지원
   - 👍 최대 커뮤니티
   - 👎 번들 크기 큼
   - 👎 디자인 커스터마이징 제한적

2. **Chakra UI v2** - 최고의 접근성
   - 👍 FormControl 자동 접근성
   - 👍 완벽한 다크 모드
   - 👍 간결한 API
   - 👍 작은 번들
   - 👎 DatePicker 없음

3. **Ant Design v5** - 엔터프라이즈급
   - 👍 풍부한 컴포넌트
   - 👍 DatePicker 기본 지원
   - 👍 중국 시장 강세
   - 👎 Form.Item 사용 불가 (주의)
   - 👎 ARIA 수동 추가 필요

4. **Headless UI + Tailwind** - 고급 사용자용
   - 👍 완전한 디자인 자유
   - 👍 최소 번들 크기
   - 👍 Headless 접근성
   - 👎 모든 스타일 수동
   - 👎 개발 시간 증가
```

**의사결정 트리**:

```markdown
## UI 라이브러리 선택 가이드

```
프로젝트에 DatePicker 필요?
├─ Yes
│  ├─ MUI v6 ✅ (가장 완전한 컴포넌트 세트)
│  └─ Ant Design v5 ✅ (엔터프라이즈 기능 풍부)
│
└─ No
   ├─ 접근성 최우선?
   │  └─ Chakra UI v2 ✅ (자동 접근성 최고)
   │
   ├─ 번들 크기 최소화?
   │  └─ Headless UI + Tailwind ✅ (완전한 자유도)
   │
   └─ 빠른 개발?
      └─ MUI v6 ✅ (가장 빠른 프로토타이핑)
```
```

---

> **Best Practice**: 접근성 필수, UI 라이브러리 네이티브 컴포넌트 우선
> **Integration**: 호환성 검증 → 구현 → 테스트

---

## 에러 처리

```yaml
error_handling:
  severity_high:
    conditions:
      - UI 라이브러리 미설치 (peer dependency 누락)
      - 호환성 매트릭스 없음 (knowledge/ 파일 누락)
      - 필수 렌더러 구현 불가 (FormGroup, FormLabel 등)
      - 프로젝트 구조 설정 실패
      - 접근성 요구사항 충족 불가
    action: |
      ❌ 치명적 오류 - 플러그인 개발 중단
      → UI 라이브러리 설치 확인: npm list {ui-library}
      → 호환성 매트릭스 확인: ls knowledge/compatibility-matrix.md
      → 필수 렌더러 요구사항 재검토
      → 프로젝트 구조 템플릿 사용
      → 재실행: 필수 요건 충족 후 재시도
    examples:
      - condition: "UI 라이브러리 없음"
        message: "❌ 오류: @mui/material이 설치되지 않음"
        recovery: "peer dependency 설치: npm install @mui/material @mui/x-date-pickers"
      - condition: "필수 렌더러 불가"
        message: "❌ 오류: FormGroup 컴포넌트 구현 불가 (depth prop 미지원)"
        recovery: "UI 라이브러리 대체 또는 커스텀 래퍼 구현"

  severity_medium:
    conditions:
      - 일부 FormType 호환 안 됨 (DatePicker, RichText 등)
      - 접근성 속성 일부 누락 (ARIA)
      - UI 라이브러리 버전 호환 경고
      - Storybook 설정 실패
      - 테스트 커버리지 낮음
    action: |
      ⚠️  경고 - 부분 플러그인 구현
      1. 호환 안 되는 FormType을 Fallback 또는 외부 라이브러리로 대체
      2. 누락된 ARIA 속성 수동 추가
      3. UI 라이브러리 버전 업데이트 권장
      4. Storybook 없이 진행 (수동 테스트)
      5. 플러그인에 경고 추가:
         > ⚠️  WARNING: 일부 FormType 미지원
         > → {unsupported_types}
    fallback_values:
      unsupported_formtype: "Fallback 또는 외부 라이브러리"
      missing_aria: "수동 추가 필요"
      storybook_enabled: false
    examples:
      - condition: "FormType 호환 안 됨"
        message: "⚠️  경고: RichText FormType 지원 안 됨 (컴포넌트 없음)"
        fallback: "react-quill 외부 라이브러리 사용 권장"
      - condition: "ARIA 속성 누락"
        message: "⚠️  경고: Select 컴포넌트에 aria-required 누락"
        fallback: "수동으로 aria-required 추가"

  severity_low:
    conditions:
      - 선택적 FormType 미구현 (ColorPicker, Slider 등)
      - UI 라이브러리 Theme 통합 경고
      - Storybook stories 일부 누락
      - 문서화 부족
    action: |
      ℹ️  정보: 선택적 항목 생략 - 핵심 플러그인 구현
      → 선택적 FormType: Priority 3로 연기
      → Theme 통합: 기본 스타일 사용
      → Storybook: 필수 stories만 작성
      → 문서화: 최소 README 제공
    examples:
      - condition: "ColorPicker 미구현"
        auto_handling: "Priority 3 FormType → 선택적 구현 (필수 아님)"
      - condition: "Theme 통합 경고"
        auto_handling: "Theme 미통합 → 기본 스타일 사용 (일부 불일치 가능)"
```

