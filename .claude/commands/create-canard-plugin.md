# Canard Schema Form Plugin Development

**Usage**:

- `/create-canard-plugin <UI_LIBRARY_NAME>` - Full plugin development process
- `/create-canard-plugin <UI_LIBRARY_NAME> --compatibility-only` - Compatibility analysis only

**Examples**:

- `/create-canard-plugin "Chakra UI v2"` - Execute full plugin development process
- `/create-canard-plugin "Chakra UI v2" --compatibility-only` - Execute compatibility analysis only
- `/create-canard-plugin "Material-UI v5"` - Full development
- `/create-canard-plugin "Ant Design v5" --compatibility-only` - Quick compatibility check

---

This command develops UI library plugins for @canard/schema-form by combining the following skills:

## Skills Used

### 1. **canard-type-system** (`.claude/skills/canard-type-system/`)

- Role: Provides TypeScript type system for @canard/schema-form
- Usage: Type definition stage, legacy type validation

### 2. **ui-plugin-guidelines** (`.claude/skills/ui-plugin-guidelines/`)

- Role: UI library compatibility verification and project structure design
- Usage: Initial analysis stage, compatibility mapping

### 3. **react-plugin-implementation** (`.claude/skills/react-plugin-implementation/`)

- Role: Provides React component implementation patterns and optimization strategies
- Usage: Component implementation stage

### 4. **dependency-management** (`.claude/skills/dependency-management/`)

- Role: package.json dependency configuration and version management
- Usage: Project setup stage

### 5. **phased-development** (`.claude/skills/phased-development/`)

- Role: 5-phase development process and priority guide
- Usage: Overall project roadmap planning

## Execution Flow

### `/create-canard-plugin <UI_LIBRARY_NAME>` (Full Development)

Skill execution order:

1. **ui-plugin-guidelines skill**: Compatibility analysis
   - UI library component mapping
   - Compatibility grading (✅ / ⚠️ / ❌)
   - Priority determination

2. **canard-type-system skill**: Type definition reference
   - FormTypeInputProps, FormTypeRendererProps, etc.
   - Context type design
   - Legacy type validation

3. **phased-development skill**: Development roadmap planning
   - 5-phase development plan
   - Priority-based schedule
   - Milestone setting

4. **dependency-management skill**: package.json generation
   - dependencies/peerDependencies configuration
   - Version specification

5. **react-plugin-implementation skill**: Implementation guide
   - Component pattern provision
   - Optimization strategy guide
   - Test condition writing

### `/create-canard-plugin <UI_LIBRARY_NAME> --compatibility-only` (Compatibility Analysis Only)

**Purpose**: Quick compatibility check without full development setup

Skill execution order:

1. **ui-plugin-guidelines skill** (Primary)
   - Compatibility matrix creation
   - Implementation feasibility assessment
   - Priority determination

2. **canard-type-system skill** (Supporting)
   - Type requirements reference
   - Basic type compatibility check

**Output**: Compatibility report only (no code generation, no package setup)

## Output Example

### When executing `/create-canard-plugin "Chakra UI v2"`

````markdown
# Chakra UI v2 Plugin Development Plan

## Stage 1: Compatibility Analysis [ui-plugin-guidelines]

| Schema Form Requirement | Chakra UI Component | Compatibility | Priority      |
| ----------------------- | ------------------- | ------------- | ------------- |
| String Input            | Input               | ✅ Direct     | P1            |
| Date Selection          | -                   | ❌ Missing    | P3 (Fallback) |

...

## Stage 2: Type System [canard-type-system]

```typescript
interface ChakraContext {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "outline" | "filled" | "flushed" | "unstyled";
}
```

## Stage 3: Development Roadmap [phased-development]

- Phase 1: Design and Verification (1-2 days)
- Phase 2: Basic Infrastructure (2-3 days)
  ...

## Stage 4: package.json [dependency-management]

```json
{
  "dependencies": {
    "@chakra-ui/react": "^2.8.0",
    ...
  }
}
```

## Stage 5: Implementation Guide [react-plugin-implementation]

### FormTypeInputString Implementation

```typescript
const FormTypeInputString = ({ ... }) => {
  // Pattern code
};
```
````

---

## Command Modes

### Full Development Mode (Default)

**Command**: `/create-canard-plugin <UI_LIBRARY_NAME>`
**Execution**: 5 skills sequentially

1. ui-plugin-guidelines (compatibility analysis)
2. canard-type-system (type definitions)
3. phased-development (roadmap)
4. dependency-management (package.json)
5. react-plugin-implementation (implementation guide)

### Compatibility-Only Mode

**Command**: `/create-canard-plugin <UI_LIBRARY_NAME> --compatibility-only`
**Execution**: 2 skills only

1. ui-plugin-guidelines (Primary - compatibility matrix)
2. canard-type-system (Supporting - type requirements)

**Purpose**: Quick assessment before committing to full development

---

## 💡 Usage Scenarios

### Scenario 1: Quick Compatibility Check

```bash
# Situation: Considering a new UI library
# Goal: Check if it's compatible before investing time

/create-canard-plugin "Radix UI" --compatibility-only

# Output: Compatibility matrix in 30 seconds
# Decision: If ✅ > 80%, proceed to full development
```

### Scenario 2: Full Plugin Development

```bash
# Situation: Decided to create a new plugin
# Goal: Complete development roadmap and implementation

/create-canard-plugin "Chakra UI v2"

# Output: 5-stage complete plan
# Next Steps: Follow the generated implementation guide
```

### Scenario 3: Multiple Library Evaluation

```bash
# Situation: Choosing between 3 UI libraries
# Goal: Compare compatibility scores

/create-canard-plugin "Chakra UI" --compatibility-only
/create-canard-plugin "Material-UI" --compatibility-only
/create-canard-plugin "Ant Design" --compatibility-only

# Result: Compare compatibility matrices, choose best fit
```

### Scenario 4: Version Migration Planning

```bash
# Situation: Upgrading from Chakra UI v1 to v2
# Goal: Assess breaking changes impact

/create-canard-plugin "Chakra UI v2" --compatibility-only

# Result: See which components need updates
```

---

## 🔄 Workflow Recommendation

```
1. Quick Check Phase
   ↓
   /create-canard-plugin "Library Name" --compatibility-only
   ↓
   Review compatibility matrix
   ↓
   Decision: Compatible enough? (≥80% ✅)

2. Full Development Phase (if YES)
   ↓
   /create-canard-plugin "Library Name"
   ↓
   Follow 5-stage implementation plan
   ↓
   Build, test, release
```

---

## ⚙️ Command Execution Details

When you run `/create-canard-plugin <UI_LIBRARY_NAME>`, Claude will:

1. **Parse the command**
   - Detect if `--compatibility-only` flag is present
   - Extract UI library name and version

2. **Route to appropriate mode**
   - Full mode: Execute all 5 skills
   - Compatibility-only: Execute 2 skills

3. **Execute skills in order**
   - Each skill reads from its knowledge/ directory
   - Tools may be invoked for automation

4. **Generate structured output**
   - Markdown format with clear sections
   - Actionable recommendations
   - Next steps guidance

---

## 🚀 Advanced Features

### 1. Plugin Template Auto-Generation

- **Boilerplate 자동 생성**: 호환성 분석 완료 후 즉시 프로젝트 구조 생성
  - 디렉토리 구조: `packages/{library-name}-plugin/`
  - 파일 템플릿: package.json, tsconfig.json, README.md
  - Component 스캐폴딩: 각 FormType에 대한 빈 컴포넌트 파일
- **타입 정의 자동화**: FormTypeInputProps, Context 인터페이스 자동 생성
  - UI 라이브러리별 맞춤 타입
  - Props 확장 인터페이스
  - Context 타입 정의
- **설정 파일 생성**: Linter, Formatter, TypeScript 설정
  - .eslintrc.js (React/TypeScript 규칙)
  - .prettierrc (프로젝트 스타일)
  - tsconfig.json (엄격한 타입 체크)

### 2. Dependency Version Auto-Detection

- **최신 버전 자동 확인**: WebSearch로 UI 라이브러리 최신 stable 버전 탐지
  - npm registry 조회
  - 호환성 버전 범위 계산
  - peerDependencies 자동 설정
- **의존성 충돌 감지**: 기존 monorepo 의존성과 충돌 사전 체크
  - React 버전 호환성
  - TypeScript 버전 호환성
  - 중복 의존성 최적화 제안
- **버전 범위 최적화**: 적절한 semver 범위 자동 추천
  - ^: minor 버전 업데이트 허용
  - ~: patch 버전만 허용
  - 정확한 버전: breaking change 우려 시

### 3. Test Case Auto-Generation

- **각 FormType 기본 테스트**: 필수 테스트 케이스 자동 생성
  - Rendering test: 컴포넌트 정상 렌더링 확인
  - Props test: 필수 props 전달 확인
  - Validation test: 입력 검증 로직 테스트
- **Snapshot 테스트**: 각 컴포넌트 시각적 회귀 방지
  - Initial render snapshot
  - Props variant snapshots
  - Error state snapshots
- **Integration 테스트**: FormRenderer와 통합 테스트
  - Schema 기반 렌더링
  - Context 전달 확인
  - Event handling 검증

**Example Template Output**:

```typescript
// Auto-generated: packages/chakra-ui-plugin/src/components/FormTypeInputString.tsx
import { FormTypeInputProps } from '@canard/schema-form';
import { Input } from '@chakra-ui/react';
import { ChakraContext } from '../types';

export const FormTypeInputString = <TValues extends Record<string, any>>({
  name,
  value,
  onChange,
  context,
  ...props
}: FormTypeInputProps<TValues, string, ChakraContext>) => {
  return (
    <Input
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      size={context?.size}
      variant={context?.variant}
      {...props}
    />
  );
};
```

**Example Test Output**:

```typescript
// Auto-generated: packages/chakra-ui-plugin/src/components/__tests__/FormTypeInputString.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { FormTypeInputString } from '../FormTypeInputString';

describe('FormTypeInputString', () => {
  it('should render input with correct value', () => {
    const onChange = jest.fn();
    render(
      <FormTypeInputString
        name="email"
        value="test@example.com"
        onChange={onChange}
      />
    );
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });

  it('should call onChange when input changes', () => {
    const onChange = jest.fn();
    render(
      <FormTypeInputString name="email" value="" onChange={onChange} />
    );
    fireEvent.change(screen.getByRole('textbox'), {
      target: { value: 'new@example.com' }
    });
    expect(onChange).toHaveBeenCalledWith('new@example.com');
  });

  it('should match snapshot', () => {
    const { container } = render(
      <FormTypeInputString name="email" value="" onChange={() => {}} />
    );
    expect(container).toMatchSnapshot();
  });
});
```

---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우

**문제**: 필수 스킬 (`ui-plugin-guidelines`, `canard-type-system`, `react-plugin-implementation`, `dependency-management`, `phased-development`) 디렉토리가 없음

**Fallback 동작**:

1. ⚠️ 경고 메시지: "스킬이 없어 기본 방식으로 플러그인 개발 가이드를 제공합니다"
2. 네이티브 방식으로 플러그인 가이드 생성:
   - 수동 UI 라이브러리 분석
   - 기본 TypeScript 타입 정의
   - 일반적인 React 컴포넌트 패턴
   - 간단한 의존성 설정
3. 결과 품질: 호환성 매트릭스 및 단계별 로드맵 없음

**해결 방법**:

```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/ui-plugin-guidelines/
ls -la .claude/skills/canard-type-system/
ls -la .claude/skills/react-plugin-implementation/
ls -la .claude/skills/dependency-management/
ls -la .claude/skills/phased-development/

# 저장소에서 복원
git checkout .claude/skills/
```

### UI 라이브러리 정보 부족

**문제**: 제공된 UI 라이브러리 이름이 모호하거나 정보 부족

**Fallback 동작**:

1. ⚠️ UI 라이브러리 정보 부족 경고
2. 대화형 질문 시작:
   - 정확한 라이브러리 이름 확인
   - 버전 정보 확인
   - 공식 문서 URL 확인
3. 충분한 정보 수집 후 진행

**해결 방법**:

```bash
# 정확한 라이브러리 이름과 버전 제공
/create-canard-plugin "Material-UI v5" --compatibility-only

# 공식 이름 확인
# - "Material-UI" → "@mui/material"
# - "Ant Design" → "antd"
# - "Chakra UI" → "@chakra-ui/react"
```

### --compatibility-only 모드 오류

**문제**: 호환성 분석만 수행 시 오류 발생

**Fallback 동작**:

1. ⚠️ 호환성 분석 실패 알림
2. 전체 모드로 전환 제안
3. 수동 호환성 체크 가이드 제공

**해결 방법**:

```bash
# 전체 모드로 시도
/create-canard-plugin "UI Library Name"

# 수동 호환성 확인
# 1. UI 라이브러리 공식 문서 확인
# 2. @canard/schema-form 요구사항 리스트 확인
# 3. 컴포넌트 매칭 테이블 작성
```

### Knowledge 파일 누락

**문제**: UI 패턴, 타입 시스템 가이드 파일 없음

**Fallback 동작**:

1. ⚠️ 가이드 파일 없음 경고
2. 일반적인 React 패턴 적용
3. 기본 TypeScript 타입 사용

**해결 방법**:

```bash
# Knowledge 파일 확인
ls -la .claude/skills/*/knowledge/

# 저장소에서 복원
git checkout .claude/skills/*/knowledge/
```

## 📖 사용 예시

### 기본 사용법

```
/create-canard-plugin "UI_LIBRARY_NAME"
```

### 호환성 체크만

```
/create-canard-plugin "UI_LIBRARY_NAME" --compatibility-only
```

### 실제 시나리오

#### 시나리오 1: 빠른 호환성 체크

```
상황: Radix UI 사용 가능 여부 사전 확인
명령: /create-canard-plugin "Radix UI" --compatibility-only
결과:
  📊 호환성 매트릭스
  - String Input: ✅ 100%
  - Select: ✅ 95%
  - DatePicker: ❌ 없음 (대안 필요)
  종합 점수: 85% → 개발 진행 권장
```

#### 시나리오 2: 전체 플러그인 개발

```
상황: Chakra UI v2 플러그인 완전 개발
명령: /create-canard-plugin "Chakra UI v2"
결과:
  1. 호환성 분석 (ui-plugin-guidelines)
  2. 타입 시스템 설계 (canard-type-system)
  3. 5단계 개발 로드맵 (phased-development)
  4. package.json 생성 (dependency-management)
  5. 구현 가이드 제공 (react-plugin-implementation)
```

#### 시나리오 3: 여러 라이브러리 비교

```
상황: 3개 UI 라이브러리 중 최적 선택
명령:
  /create-canard-plugin "Chakra UI" --compatibility-only
  /create-canard-plugin "Material-UI" --compatibility-only
  /create-canard-plugin "Ant Design" --compatibility-only
결과:
  - 호환성 점수 비교 (Chakra: 88%, MUI: 92%, Ant: 85%)
  - 최종 선택: Material-UI
  → /create-canard-plugin "Material-UI v5" (전체 개발 진행)
```

### 고급 기능 사용 예시

#### 예시 1: 템플릿 자동 생성

```
상황: Chakra UI 플러그인 boilerplate 즉시 생성
명령: /create-canard-plugin "Chakra UI v2"
결과:
  - 호환성 분석 완료 (88%)
  - 자동 생성:
    - packages/chakra-ui-plugin/
      - src/components/FormTypeInputString.tsx (빈 템플릿)
      - src/types/ChakraContext.ts
      - package.json (의존성 포함)
      - tsconfig.json, .eslintrc.js
      - README.md (사용 가이드)
  - 즉시 구현 시작 가능
```

#### 예시 2: 의존성 버전 자동 감지

```
상황: 최신 stable 버전 자동 확인
명령: /create-canard-plugin "Material-UI"
결과:
  - WebSearch로 최신 버전 조회: @mui/material@5.15.0
  - 호환성 확인: React 18.x 필요
  - 자동 생성 package.json:
    {
      "dependencies": {
        "@mui/material": "^5.15.0"
      },
      "peerDependencies": {
        "react": "^18.0.0"
      }
    }
  - 충돌 감지: 없음 ✅
```

#### 예시 3: 테스트 자동 생성

```
상황: 모든 FormType 테스트 케이스 자동 생성
명령: /create-canard-plugin "Chakra UI v2"
결과:
  - 각 컴포넌트별 3가지 테스트 자동 생성:
    - FormTypeInputString.test.tsx (rendering, onChange, snapshot)
    - FormTypeInputNumber.test.tsx (validation, onChange, snapshot)
    - FormTypeSelect.test.tsx (options, onChange, snapshot)
  - Integration 테스트:
    - FormRenderer.integration.test.tsx (schema 기반 렌더링)
  - 즉시 yarn test 실행 가능
```

#### 예시 4: 전체 워크플로우 자동화

```
상황: 호환성 체크 → 템플릿 생성 → 테스트 생성 → 구현 시작
명령:
  1. /create-canard-plugin "Radix UI" --compatibility-only
  2. (호환성 85% → 진행 결정)
  3. /create-canard-plugin "Radix UI"
결과:
  - 완전한 프로젝트 구조 생성
  - 의존성 자동 설치 명령: yarn install
  - 테스트 프레임워크 설정 완료
  - 구현 가이드 제공
  - 즉시 개발 시작 가능
```

## 💡 팁

- **사전 확인 필수**: --compatibility-only로 먼저 검증 후 개발 시작
- **버전 명시**: "Chakra UI v2"처럼 정확한 버전 지정
- **80% 기준**: 호환성 80% 이상일 때 개발 권장
- **대안 계획**: 호환성 낮은 컴포넌트는 fallback 전략 수립
- **템플릿 활용**: 자동 생성된 boilerplate로 개발 시간 단축
- **의존성 최신화**: WebSearch 자동 탐지로 항상 최신 stable 버전 사용
- **테스트 커버리지**: 자동 생성 테스트로 기본 품질 보장

---

## ✅ 성공 시 출력

### 호환성 체크 모드 (--compatibility-only)

```
✅ Chakra UI v2 호환성 분석 완료!

📊 호환성 매트릭스:
| Schema Form 요구사항 | Chakra UI 컴포넌트 | 호환성 | 우선순위 |
|---------------------|-------------------|--------|---------|
| String Input        | Input             | ✅ 100% | P1      |
| Select              | Select            | ✅ 95%  | P1      |
| Checkbox            | Checkbox          | ✅ 100% | P1      |
| DatePicker          | -                 | ❌ 0%   | P3      |
| FileUpload          | -                 | ⚠️ 50%  | P2      |

📈 종합 호환성: 88% ✅ (개발 진행 권장)

💡 권장사항:
- ✅ 즉시 개발 가능: String, Select, Checkbox
- ⚠️ 대안 필요: DatePicker (react-datepicker 통합 고려)
- 📦 확장 구현: FileUpload (Chakra Box 기반 커스텀)

⏱️ 분석 시간: 12초

💡 다음 단계:
- 호환성 ≥ 80% → /create-canard-plugin "Chakra UI v2" (전체 개발 진행)
- 호환성 < 80% → 다른 UI 라이브러리 검토
```

### 전체 개발 모드

```
✅ Chakra UI v2 플러그인 개발 계획 완료!

📊 5단계 개발 로드맵:

Phase 1: 설계 및 검증 (1-2일)
- ✅ 호환성 분석 완료 (88%)
- ✅ 타입 시스템 설계
- ✅ Context 인터페이스 정의

Phase 2: 기본 인프라 (2-3일)
- [ ] package.json 생성
- [ ] 프로젝트 구조 설정
- [ ] 의존성 설치

Phase 3: 핵심 컴포넌트 (3-5일)
- [ ] FormTypeInputString 구현
- [ ] FormTypeInputNumber 구현
- [ ] FormTypeSelect 구현

Phase 4: 테스트 및 문서화 (2-3일)
Phase 5: 릴리즈 준비 (1일)

📁 생성 예정 파일:
- packages/chakra-ui-plugin/
  - package.json
  - src/components/
  - src/types/
  - README.md

⏱️ 계획 생성 시간: 35초
⏱️ 예상 개발 기간: 9-14일

💡 다음 단계:
1. 개발 로드맵 검토
2. /requirements-execute로 구현 시작
3. 각 Phase 완료 후 /code-review
```

## ❌ 실패 시 출력

```
❌ 플러그인 개발 계획 생성 실패

🔍 원인:
- UI 라이브러리 정보 부족 ("Chakra UI" → 버전 명시 필요)
- 또는: 필수 스킬 누락 (ui-plugin-guidelines, canard-type-system)
- 또는: WebSearch 실패 (최신 버전 정보 확인 불가)

💡 해결 방법:
1. 정확한 라이브러리 이름과 버전 제공:
   /create-canard-plugin "Chakra UI v2.8.0"
   /create-canard-plugin "@chakra-ui/react v2"

2. 공식 문서 URL 확인:
   - Chakra UI: https://chakra-ui.com
   - Material-UI: https://mui.com
   - Ant Design: https://ant.design

3. 대화형 모드로 정보 수집:
   /create-canard-plugin
   (질문에 답변하며 라이브러리 정보 제공)

4. 스킬 복원:
   git checkout .claude/skills/ui-plugin-guidelines/
   git checkout .claude/skills/canard-type-system/
   git checkout .claude/skills/react-plugin-implementation/

📚 추가 도움말: 먼저 --compatibility-only로 호환성 체크 권장
```
