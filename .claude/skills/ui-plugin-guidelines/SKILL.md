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

---

> **Best Practice**: 접근성 필수, UI 라이브러리 네이티브 컴포넌트 우선
> **Integration**: 호환성 검증 → 구현 → 테스트

