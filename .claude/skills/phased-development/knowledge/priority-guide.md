# 우선순위 가이드

컴포넌트 구현 우선순위 결정 기준입니다.

## 우선순위 정의

### Priority 1 (P1) - MVP 필수
**기준**: 기본 폼 동작에 반드시 필요
**목표**: 초기 2-3일 내 구현
**배포**: MVP 버전에 포함

### Priority 2 (P2) - 초기 버전
**기준**: 일반적으로 자주 사용
**목표**: Phase 3-4에서 구현
**배포**: v1.0.0에 포함

### Priority 3 (P3) - 추가 기능
**기준**: 특수한 경우 사용
**목표**: Phase 4 또는 v1.1.0
**배포**: v1.0.0 선택적, v1.1.0 권장

### Priority 4 (P4) - 선택적
**기준**: 외부 라이브러리 필요 또는 비표준
**목표**: v2.0.0 또는 별도 패키지
**배포**: 선택적

## 컴포넌트별 우선순위

### P1: MVP 필수 (3-4개)

| 컴포넌트 | 타입 | 이유 |
|---------|------|------|
| **FormTypeInputString** | string | 가장 기본적인 입력 |
| **FormTypeInputNumber** | number, integer | 숫자 입력 필수 |
| **FormTypeInputBoolean** | boolean | 체크박스 필수 |
| **FormTypeInputArray** (선택) | array | 동적 항목 추가/제거 (선택적으로 P2로 이동 가능) |

**formTypeInputDefinitions 순서**: **마지막**에 배치 (가장 일반적)

### P2: 초기 버전 (5-8개)

| 컴포넌트 | 조건 | 이유 |
|---------|------|------|
| **FormTypeInputTextarea** | string + format: textarea | 여러 줄 텍스트 자주 사용 |
| **FormTypeInputPassword** | string + format: password | 로그인 폼 필수 |
| **FormTypeInputStringEnum** | string + enum | Select/Dropdown 자주 사용 |
| **FormTypeInputDate** | string + format: date | 날짜 선택 자주 사용 |
| **FormTypeInputTime** | string + format: time | 시간 선택 (선택적) |
| **FormTypeInputEmail** | string + format: email | 이메일 validation |
| **FormTypeInputUrl** | string + format: url | URL validation (선택적) |
| **FormTypeInputArray** | array | (P1에서 이동 시) |

**formTypeInputDefinitions 순서**: **앞쪽**에 배치 (String보다 구체적)

### P3: 추가 기능 (3-5개)

| 컴포넌트 | 조건 | 이유 |
|---------|------|------|
| **FormTypeInputRadioGroup** | string/number + formType: radio | Radio 버튼 그룹 |
| **FormTypeInputSlider** | number + formType: slider | 범위 선택 |
| **FormTypeInputColorPicker** | string + format: color | 색상 선택 |
| **FormTypeInputMultiSelect** | array + items.enum | 다중 선택 |
| **FormTypeInputSwitch** | boolean + formType: switch | Toggle Switch |

### P4: 선택적 (1-2개 또는 없음)

| 컴포넌트 | 조건 | 이유 |
|---------|------|------|
| **FormTypeInputRichText** | string + format: html/markdown | 외부 라이브러리 필요 (react-quill 등) |
| **FormTypeInputFileUpload** | string + format: data-url | 파일 업로드 (고급) |

## 우선순위 결정 플로우

```
컴포넌트 평가
├─ 기본 폼 동작에 필수인가?
│  ├─ Yes → P1
│  └─ No → 다음
├─ 일반적으로 자주 사용하는가?
│  ├─ Yes → P2
│  └─ No → 다음
├─ 특수한 경우 사용하는가?
│  ├─ Yes → P3
│  └─ No → P4
```

## formTypeInputDefinitions 순서 결정

### 우선순위 → 배열 순서 매핑

| 우선순위 | 구체성 | 배열 위치 | 예시 |
|---------|-------|----------|------|
| P2 | 가장 구체적 | **첫 번째** | Password, Textarea |
| P3 | 중간 | 중간 | Radio, Slider, Enum |
| P1 | 일반적 | **마지막** | String, Number, Boolean |

**이유**: formTypeInputDefinitions는 **순서대로 매칭**하므로, 구체적 조건이 앞에 와야 함

### 올바른 순서 예시

```typescript
export const formTypeInputDefinitions: FormTypeInputDefinition[] = [
  // === P2: 가장 구체적 ===
  FormTypeInputPasswordDefinition,     // string + format: password
  FormTypeInputTextareaDefinition,     // string + format: textarea
  FormTypeInputDateDefinition,         // string + format: date
  
  // === P3: 중간 ===
  FormTypeInputStringEnumDefinition,   // string + enum (함수 조건)
  FormTypeInputRadioGroupDefinition,   // string + formType: radio
  
  // === P1: 일반적 (마지막!) ===
  FormTypeInputNumberDefinition,       // number | integer
  FormTypeInputBooleanDefinition,      // boolean
  FormTypeInputStringDefinition,       // string (가장 마지막)
];
```

## MVP 범위 결정

### 최소 MVP (P1만)

**목표**: 3-5일 내 완성

**포함**:
- 기본 렌더러 5개
- String, Number, Boolean 입력
- 빌드 및 테스트 환경

**특징**:
- 빠른 출시
- 기능 제한적
- 피드백 수집용

### 표준 MVP (P1 + P2 일부)

**목표**: 1-2주 내 완성

**포함**:
- 기본 렌더러 5개
- P1 컴포넌트 전체
- P2 컴포넌트 일부 (Textarea, Password, Enum)

**특징**:
- 일반적인 폼 커버
- 실용적
- 권장 범위

### Full Feature v1.0 (P1 + P2 전체)

**목표**: 2-3주 내 완성

**포함**:
- P1 + P2 전체
- 완전한 문서화
- Storybook stories

**특징**:
- 대부분의 use case 커버
- 정식 릴리스 가능

## 의사결정 가이드

### 빠른 출시 vs 완전한 기능

| 상황 | 권장 범위 |
|------|----------|
| POC (Proof of Concept) | 최소 MVP |
| 초기 피드백 수집 | 표준 MVP |
| 정식 릴리스 | Full Feature |
| 기업 프로젝트 | Full Feature + P3 일부 |

### UI 라이브러리별 조정

- **완성도 높은 라이브러리** (MUI, Ant Design): Full Feature 목표
- **컴포넌트 부족한 라이브러리** (Chakra UI): 표준 MVP, Fallback 활용
- **모바일 특화** (Ant Design Mobile): P1+P2 선택적 (모바일 UX 고려)

---

**핵심 원칙**:
1. P1 완료 전 P2 시작 금지
2. formTypeInputDefinitions 순서: 구체적 → 일반적
3. MVP 범위는 프로젝트 상황에 맞게
4. 우선순위는 가이드일 뿐, 유연하게 조정 가능

