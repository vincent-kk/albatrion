# UI 라이브러리 호환성 매트릭스

Schema Form 요구사항과 UI 라이브러리 컴포넌트 간 매핑 및 호환성 분석 방법입니다.

## 호환성 등급

- ✅ **직접 (Direct)**: 컴포넌트를 그대로 사용 가능, 최소한의 props 매핑만 필요
- ⚠️ **커스텀 (Custom)**: 값 변환, 래핑, 또는 추가 로직 필요
- ❌ **없음 (Missing)**: UI 라이브러리에 해당 컴포넌트 없음, Fallback 또는 외부 라이브러리 필요

## 우선순위 가이드

- **P1 (Priority 1)**: 직접 사용 가능, 즉시 구현
- **P2 (Priority 2)**: 커스텀 필요, 초기 버전에 포함
- **P3 (Priority 3)**: 추가 라이브러리 필요, 2차 버전
- **P4 (Priority 4)**: 선택적 기능, 3차 버전 또는 생략

## Schema Form 필수 요구사항

### 기본 Input (필수)

| 요구사항 | type | format | 비고 |
|---------|------|--------|------|
| String 입력 | string | - | 기본 텍스트 |
| Number 입력 | number, integer | - | 숫자 입력 |
| Boolean | boolean | - | 체크박스 |
| Textarea | string | textarea | 여러 줄 텍스트 |

### Enum/Select (필수)

| 요구사항 | type | 조건 | 비고 |
|---------|------|------|------|
| String Enum | string | enum exists | 단일 선택 |
| Multi Select | array | items.enum | 다중 선택 |

### 구조 타입 (필수)

| 요구사항 | type | 비고 |
|---------|------|------|
| Array | array | 동적 항목 추가/제거 |
| Object | object | 중첩 구조 |

### 날짜/시간 (선택적)

| 요구사항 | type | format | 비고 |
|---------|------|--------|------|
| Date | string | date | ISO 8601 |
| Time | string | time | HH:mm:ss |
| DateTime | string | date-time | ISO 8601 |

### 특수 입력 (선택적)

| 요구사항 | type | format/formType | 비고 |
|---------|------|-----------------|------|
| Password | string | password | 마스킹 |
| Email | string | email | validation |
| URL | string | url | validation |
| Color | string | color | 색상 선택기 |
| Slider | number | slider (formType) | 범위 선택 |
| Radio Group | string/number | radio (formType) + enum | 라디오 버튼 |

## UI 라이브러리별 매핑

### MUI (Material-UI) v5+

| Schema Form | MUI 컴포넌트 | 호환성 | 구현 방식 | 우선순위 |
|------------|--------------|--------|----------|---------|
| String | TextField | ✅ 직접 | defaultValue, onChange | P1 |
| Number | TextField (type="number") | ✅ 직접 | inputProps.type="number" | P1 |
| Boolean | Checkbox | ✅ 직접 | defaultChecked | P1 |
| Textarea | TextField (multiline) | ✅ 직접 | multiline, rows | P1 |
| String Enum | Select + MenuItem | ✅ 직접 | defaultValue, map enum | P1 |
| Multi Select | Select (multiple) | ✅ 직접 | multiple, defaultValue array | P1 |
| Array | - | ⚠️ 커스텀 | ChildNodeComponents + IconButton | P2 |
| Date | DatePicker (@mui/x-date-pickers) | ⚠️ 커스텀 | 값 변환 (string ↔ Date) | P2 |
| Time | TimePicker (@mui/x-date-pickers) | ⚠️ 커스텀 | 값 변환 | P2 |
| DateTime | DateTimePicker | ⚠️ 커스텀 | 값 변환 | P2 |
| Password | TextField (type="password") | ✅ 직접 | type="password" | P2 |
| Email | TextField (type="email") | ✅ 직접 | type="email", pattern | P2 |
| Slider | Slider | ⚠️ 커스텀 | defaultValue, min/max | P2 |
| Radio Group | RadioGroup + FormControlLabel | ✅ 직접 | map enum | P2 |
| Color | TextField (type="color") | ⚠️ 커스텀 | 기본 input 또는 외부 라이브러리 | P3 |
| Rich Text | - | ❌ 없음 | 외부 라이브러리 (react-quill) | P4 |

**특수 사항**:
- `@mui/x-date-pickers` 별도 패키지 필요
- `LocalizationProvider` 래퍼 필요 (DatePicker 등)
- `slotProps`로 중첩 props 전달

### Ant Design v5+

| Schema Form | Ant Design 컴포넌트 | 호환성 | 구현 방식 | 우선순위 |
|------------|---------------------|--------|----------|---------|
| String | Input | ✅ 직접 | defaultValue, onChange | P1 |
| Number | InputNumber | ✅ 직접 | defaultValue, onChange | P1 |
| Boolean | Checkbox | ✅ 직접 | defaultChecked | P1 |
| Textarea | Input.TextArea | ✅ 직접 | defaultValue, rows | P1 |
| String Enum | Select + Option | ✅ 직접 | defaultValue, map enum | P1 |
| Multi Select | Select (mode="multiple") | ✅ 직접 | mode="multiple" | P1 |
| Array | - | ⚠️ 커스텀 | ChildNodeComponents + Button | P2 |
| Date | DatePicker | ⚠️ 커스텀 | 값 변환 (string ↔ dayjs) | P2 |
| Time | TimePicker | ⚠️ 커스텀 | 값 변환 | P2 |
| DateTime | DatePicker (showTime) | ⚠️ 커스텀 | 값 변환 | P2 |
| Password | Input.Password | ✅ 직접 | defaultValue | P2 |
| Email | Input (type="email") | ✅ 직접 | type="email" | P2 |
| Slider | Slider | ⚠️ 커스텀 | defaultValue, min/max | P2 |
| Radio Group | Radio.Group + Radio | ✅ 직접 | map enum | P2 |
| Color | ColorPicker (v5.5+) | ✅ 직접 | defaultValue | P3 |
| Rich Text | - | ❌ 없음 | 외부 라이브러리 | P4 |

**특수 사항**:
- `Form.Item` 사용하지 않음 (canard-form이 레이아웃 관리)
- `dayjs` 날짜 라이브러리 사용

### Ant Design Mobile v5+

| Schema Form | Ant Design Mobile | 호환성 | 구현 방식 | 우선순위 |
|------------|-------------------|--------|----------|---------|
| String | Input | ✅ 직접 | defaultValue, onChange | P1 |
| Number | Input (type="number") | ✅ 직접 | type="number" | P1 |
| Boolean | Checkbox | ✅ 직접 | defaultChecked | P1 |
| Textarea | TextArea | ✅ 직접 | defaultValue, rows | P1 |
| String Enum | Picker | ⚠️ 커스텀 | 모바일 Picker 패턴 | P1 |
| Multi Select | CheckList | ✅ 직접 | defaultValue array | P1 |
| Array | - | ⚠️ 커스텀 | ChildNodeComponents | P2 |
| Date | DatePicker | ⚠️ 커스텀 | 값 변환, 모바일 UX | P2 |
| Time | DatePicker (precision="minute") | ⚠️ 커스텀 | 값 변환 | P2 |
| Password | Input (type="password") | ✅ 직접 | type="password" | P2 |
| Slider | Slider | ⚠️ 커스텀 | defaultValue | P2 |
| Radio Group | Radio.Group | ✅ 직접 | map enum | P2 |
| Color | - | ❌ 없음 | Fallback Input | P4 |

**특수 사항**:
- 모바일 UX 패턴 (Popup Picker 등)
- Touch 최적화

### Chakra UI v2+

| Schema Form | Chakra UI 컴포넌트 | 호환성 | 구현 방식 | 우선순위 |
|------------|-------------------|--------|----------|---------|
| String | Input | ✅ 직접 | defaultValue, onChange | P1 |
| Number | NumberInput | ✅ 직접 | defaultValue, onChange | P1 |
| Boolean | Checkbox | ✅ 직접 | defaultIsChecked | P1 |
| Textarea | Textarea | ✅ 직접 | defaultValue | P1 |
| String Enum | Select + option | ✅ 직접 | defaultValue, map enum | P1 |
| Multi Select | - | ⚠️ 커스텀 | Checkbox Group 또는 외부 | P2 |
| Array | - | ⚠️ 커스텀 | ChildNodeComponents + IconButton | P2 |
| Date | - | ❌ 없음 | Input (type="date") Fallback | P3 |
| Time | - | ❌ 없음 | Input (type="time") Fallback | P3 |
| Password | Input (type="password") | ✅ 직접 | type="password" | P2 |
| Slider | Slider | ✅ 직접 | defaultValue | P2 |
| Radio Group | RadioGroup + Radio | ✅ 직접 | defaultValue, map enum | P2 |
| Color | - | ❌ 없음 | Input (type="color") Fallback | P3 |

**특수 사항**:
- `FormControl` 래핑 권장
- 날짜/시간 컴포넌트 없음 (외부 라이브러리 필요)

## 호환성 분석 체크리스트

새로운 UI 라이브러리 평가 시:

### 1단계: 필수 컴포넌트 확인
- [ ] String 입력 컴포넌트
- [ ] Number 입력 컴포넌트
- [ ] Boolean (Checkbox) 컴포넌트
- [ ] Select/Dropdown 컴포넌트

### 2단계: 비제어 컴포넌트 지원
- [ ] `defaultValue` 지원
- [ ] `defaultChecked` 지원 (Boolean)
- [ ] 제어/비제어 모드 전환 가능

### 3단계: 접근성
- [ ] `id`, `name` 속성 지원
- [ ] `required`, `disabled` 지원
- [ ] ARIA 속성 지원
- [ ] 키보드 네비게이션

### 4단계: 확장성
- [ ] 날짜/시간 선택 컴포넌트 (또는 Fallback 가능)
- [ ] 커스터마이징 가능한 스타일
- [ ] TypeScript 타입 정의

---

**평가 기준**:
- 1단계 모두 충족: 플러그인 개발 **가능**
- 2단계 부분 충족: 플러그인 개발 **가능** (제어 컴포넌트로 대체)
- 3단계 부분 충족: 플러그인 개발 **가능** (접근성 수동 추가)
- 4단계 미충족: 플러그인 개발 **가능** (Fallback 사용)

