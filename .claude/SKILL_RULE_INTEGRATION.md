# Skill vs Rule 통합 가이드

## 📋 개요

이 프로젝트는 **Skill (액션 수행)**과 **Rule (선언적 가이드라인)**의 하이브리드 접근 방식을 사용합니다.

## 🎯 구분 기준

### ✅ Skill로 변환된 것들 (`.claude/skills/`)

**특징**: 특정 액션 수행, 도구 실행, 명시적 호출

| Skill 이름 | 목적 | 호출 방법 | 원본 Rule |
|-----------|------|----------|-----------|
| `test-generator` | 테스트 자동 생성 및 커버리지 분석 | `/test` | `testing-strategy.mdc` |
| `code-quality-reviewer` | 코드 품질 검토 및 보고서 생성 | `/code-style` | `code-writing-guidelines.mdc` |

**액션 예시**:
- 테스트 코드 생성
- 커버리지 분석
- 품질 보고서 작성
- AST 파싱 및 분석

### ❌ Rule로 유지된 것들 (`.cursor/rules/`)

**특징**: 선언적 규칙, 상시 적용, 배경 지식

| Rule 파일 | 목적 | 적용 방식 | alwaysApply |
|-----------|------|-----------|-------------|
| `typescript.mdc` | TypeScript 베스트 프랙티스 | 코드 작성 시 참고 | ✅ (globs: `*.ts`) |
| `typescript-react.mdc` | React + TS 컴포넌트 규칙 | 코드 작성 시 참고 | ✅ (globs: `*.tsx`) |
| `toss-basic-frontend-rules.mdc` | 프론트엔드 디자인 원칙 | 코드 작성 시 참고 | ✅ (alwaysApply: true) |
| `project-structure.mdc` | 프로젝트 디렉토리 구조 | 파일 생성 시 참고 | ✅ (alwaysApply: true) |

**규칙 예시**:
- 함수는 15줄 이하로
- interface 우선 사용
- AAA 패턴 준수
- 디렉토리는 복수형, 파일은 단수형

## 🔄 통합 패턴

### Pattern 1: Rule 참조 → Skill 실행

```yaml
워크플로우:
  1. Rule 읽기:
     - typescript.mdc의 타입 안전성 규칙
     - toss-rules.mdc의 가독성 원칙

  2. Skill 실행:
     - /code-style 호출
     - code_quality_reviewer가 Rule 기반으로 검증
     - quality_rules.yaml에 Rule 규칙 통합

  3. 결과:
     - Rule 준수 여부 보고서
     - 개선 액션 아이템
```

### Pattern 2: Skill 독립 실행

```yaml
워크플로우:
  1. Skill 호출:
     - /test src/utils/pricing.ts

  2. Skill 실행:
     - testing-strategy.md 지식 로드
     - test_generator.ts 도구 실행
     - 자동으로 테스트 코드 생성

  3. 생성된 코드:
     - Rule 자동 준수 (typescript.mdc, testing-strategy.mdc)
     - 생성 후 Rule 기반 검증 가능
```

## 📂 디렉토리 구조

```
.claude/
├── commands/               # Slash commands
│   ├── code-style.md      # Skill: code_quality_reviewer 호출
│   ├── test.md            # Skill: test_generator 호출
│   └── ...
├── skills/                # Skill 정의 (액션 수행)
│   ├── test-generator/
│   │   ├── SKILL.md       # Skill 설명서
│   │   ├── knowledge/     # 지식베이스
│   │   │   └── testing-strategy.md
│   │   └── tools/         # 실행 도구
│   │       ├── test_generator.ts
│   │       └── coverage_analyzer.sh
│   ├── code-quality-reviewer/
│   │   ├── SKILL.md
│   │   ├── knowledge/
│   │   │   └── quality_rules.yaml
│   │   └── tools/
│   │       └── complexity_checker.ts
│   └── ...

.cursor/
└── rules/                 # Rule 정의 (선언적 가이드)
    ├── typescript.mdc     # TypeScript 규칙
    ├── typescript-react.mdc
    ├── toss-basic-frontend-rules.mdc
    ├── project-structure.mdc
    ├── testing-strategy.mdc  # 참고용 유지
    └── ...
```

## 🔧 Skill 생성 기준

### ✅ Skill로 만들어야 할 때

```yaml
조건:
  - 특정 작업 수행 필요 (generate, analyze, transform)
  - 도구(tool) 실행 포함
  - 입력 → 처리 → 출력 구조
  - 사용자 명시적 호출

예시:
  - 테스트 생성: test_generator
  - 코드 리뷰: code_quality_reviewer
  - 플러그인 생성: plugin_generator
  - 릴리즈 노트: release_note_generator
```

### ❌ Rule로 유지해야 할 때

```yaml
조건:
  - 선언적 규칙 (어떻게 작성해야 하는가)
  - 상시 적용 필요 (alwaysApply: true)
  - 특정 파일 타입에 자동 적용 (globs: *.ts)
  - 배경 지식으로 작동

예시:
  - TypeScript 작성 원칙
  - React 컴포넌트 구조
  - 프론트엔드 디자인 원칙
  - 프로젝트 디렉토리 구조
```

## 🚀 실전 예시

### 예시 1: 새 함수 작성 + 테스트 생성

```bash
# 1. 함수 작성 (Rule 자동 적용)
# - typescript.mdc: 타입 명시
# - toss-rules.mdc: 함수 길이 ≤15줄
# - code-writing-guidelines.mdc: 순차적 흐름

# src/utils/pricing.ts 작성 완료

# 2. Skill로 테스트 자동 생성
/test src/utils/pricing.ts

# 3. Skill로 품질 검증
/code-style

# 결과:
# ✅ typescript.mdc 규칙 준수
# ✅ 테스트 자동 생성 완료
# ✅ 품질 검증 통과
```

### 예시 2: React 컴포넌트 작성 + 리뷰

```bash
# 1. 컴포넌트 작성 (Rule 자동 적용)
# - typescript-react.mdc: Props 인터페이스
# - toss-rules.mdc: 컴포넌트 분리
# - project-structure.mdc: 디렉토리 구조

# src/components/Button/Button.tsx 작성 완료

# 2. Skill로 컴포넌트 테스트 생성
/test src/components/Button/Button.tsx component

# 3. Skill로 통합 리뷰
/code-style

# 결과:
# ✅ typescript-react.mdc 규칙 준수
# ✅ 컴포넌트 테스트 생성
# ✅ 접근성 검증 완료
```

## 📊 Rule → Skill 변환 체크리스트

새로운 Rule 파일을 만들 때 다음을 확인하세요:

```yaml
질문:
  - [ ] 특정 액션을 수행하는가? (생성, 분석, 변환)
  - [ ] 도구(script, tool) 실행이 필요한가?
  - [ ] 사용자가 명시적으로 호출하는가?
  - [ ] 입력 → 처리 → 출력 구조인가?

답변이 YES:
  → Skill로 생성
  → .claude/skills/{skill-name}/

답변이 NO:
  → Rule로 유지
  → .cursor/rules/{rule-name}.mdc
  → alwaysApply: true 설정
```

## 🎓 Best Practices

### 1. Skill은 Rule을 참조
```yaml
# .claude/skills/test-generator/SKILL.md
참고 문서:
  - .cursor/rules/testing-strategy.mdc (원본 규칙)
  - .cursor/rules/typescript.mdc (타입 규칙)

# Skill이 생성하는 코드는 자동으로 Rule 준수
```

### 2. Rule은 독립적으로 유지
```yaml
# .cursor/rules/typescript.mdc
alwaysApply: true  # 항상 적용
globs: *.ts        # TypeScript 파일에만

# Skill 없이도 단독으로 작동
```

### 3. Slash Command는 브리지 역할
```yaml
# .claude/commands/test.md
역할:
  - Rule 참조 설명
  - Skill 호출 방법
  - 사용 예시 제공

# 사용자는 /test만 입력하면 됨
```

## 🔍 검증 방법

### Skill 검증
```bash
# 1. Skill 디렉토리 존재 확인
ls .claude/skills/test-generator/

# 2. SKILL.md 파일 확인
cat .claude/skills/test-generator/SKILL.md

# 3. 도구 실행 테스트
tsx .claude/skills/test-generator/tools/test_generator.ts --help

# 4. Slash command 테스트
# Claude Code에서 /test 입력
```

### Rule 검증
```bash
# 1. Rule 파일 존재 확인
ls .cursor/rules/typescript.mdc

# 2. alwaysApply 설정 확인
head -5 .cursor/rules/typescript.mdc

# 3. globs 패턴 확인
grep "globs:" .cursor/rules/typescript.mdc
```

## 📝 요약

| 항목 | Skill | Rule |
|------|-------|------|
| **목적** | 액션 수행 | 가이드라인 제공 |
| **활성화** | 명시적 호출 (`/test`) | 자동 적용 (alwaysApply) |
| **위치** | `.claude/skills/` | `.cursor/rules/` |
| **도구** | tools/ 스크립트 | N/A |
| **지식** | knowledge/ 문서 | 파일 자체가 지식 |
| **예시** | test_generator, code_quality_reviewer | typescript.mdc, toss-rules.mdc |

---

> **유지보수**: Rule과 Skill은 독립적으로 관리되지만, Skill이 Rule을 참조할 수 있습니다.
> **확장성**: 새로운 액션이 필요하면 Skill 추가, 새로운 규칙이 필요하면 Rule 추가.
