---
description: Quick code style check for pre-commit validation
tags: [code-style, formatting, quick-check, skills]
---

# Quick Code Style Check (Skills-based)

**⚡ Purpose**: Fast style validation before committing (< 30 seconds)
**🎯 Use Case**: Pre-commit checks, quick formatting validation, CI/CD style gates

This command performs a **lightweight, fast code style check** using the **code_quality_reviewer Skill** in quick mode.

## 📋 Executed Skill

### code_quality_reviewer (Quick Mode)

**Focus Areas** (Style & Formatting Only):

- ✅ **Formatting**: Indentation, line length, spacing
- ✅ **Naming**: camelCase, PascalCase, UPPER_CASE consistency
- ✅ **Function Length**: ≤ 15 lines per function
- ✅ **Nesting Depth**: ≤ 3 levels
- ✅ **Type Coverage**: TypeScript type declarations (basic check)

**NOT Checked** (Use `/review` for these):
- ❌ Security vulnerabilities
- ❌ Algorithm correctness
- ❌ Business logic validation
- ❌ Comprehensive testing coverage
- ❌ Performance optimization opportunities

## 🔧 Verification Tools

1. **complexity_checker.ts** - Automatic cyclomatic complexity analysis
2. **quality_rules.yaml** - Structured quality rules
3. **ESLint/Prettier** - Style consistency

## 📊 Output (Concise Format)

**Quick Pass/Fail Summary**:
```
✅ Style Check: PASSED (12/15 files)

❌ Issues Found:
  - auth.ts:45 - Function length 23 lines (max 15)
  - utils.ts:12 - Nesting depth 4 (max 3)
  - config.ts:8 - Missing type annotation

⏱️ Execution Time: 8 seconds
```

**NOT Included** (use `/review` for detailed reports):
- No security analysis
- No algorithm review
- No performance profiling
- No comprehensive quality scores

---

**Execution Instructions:**

**IMPORTANT**: This is a **quick style check only**. For comprehensive review, use `/review`.

1. **Activate code_quality_reviewer skill (Quick Mode)**
   - Load style rules only from `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml`
   - Focus on formatting, naming, and basic structural metrics
   - Execute `.claude/skills/code_quality_reviewer/tools/complexity_checker.ts` (basic metrics only)

2. **Perform quick validation** (Surface-level only)
   - ✅ Function length ≤ 15 lines
   - ✅ Nesting depth ≤ 3 levels
   - ✅ Naming conventions (camelCase, PascalCase)
   - ✅ Basic type coverage (TypeScript)
   - ⏭️ **SKIP**: Security, logic, performance deep analysis

3. **Generate concise report** (Pass/Fail format)
   - Simple PASSED / FAILED status
   - List of style violations only
   - File:Line references for issues
   - Execution time (should be < 30 seconds)

**References:**

- Skills structure: `.claude/skills/code_quality_reviewer/`
- Quality rules: `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml`
- Existing guidelines: `.cursor/rules/code-writing-guidelines.mdc` (for reference)

---

## 📖 When to Use

### ✅ Use `/code-style` for:
- **Pre-commit checks**: Quick validation before committing
- **CI/CD gates**: Fast style enforcement in pipelines
- **Formatting validation**: Ensure code style consistency
- **Quick feedback**: Immediate style issue detection (< 30 seconds)

### ❌ Do NOT use `/code-style` for:
- Security vulnerability detection → Use `/review`
- Algorithm correctness validation → Use `/review`
- Performance optimization → Use `/review`
- Comprehensive quality assessment → Use `/review`
- PR review preparation → Use `/review`

---

## 💡 Usage Examples

### Example 1: Pre-commit Quick Check
```
Scenario: Before committing changes
Command: /code-style
Expected: Quick pass/fail in < 30 seconds
```

### Example 2: CI/CD Pipeline
```
Scenario: Automated style gate in GitHub Actions
Command: /code-style
Result: Fast style validation, no deep analysis
```

### Example 3: After Code Formatting
```
Scenario: Verify Prettier/ESLint changes
Command: /code-style
Result: Confirm formatting rules applied correctly
```

---

## 🔄 Relationship with `/review`

| Aspect | `/code-style` | `/review` |
|--------|---------------|-----------|
| **Purpose** | Quick style check | Comprehensive review |
| **Time** | < 30 seconds | 1-3 minutes |
| **Depth** | Surface (formatting) | Deep (security, logic, performance) |
| **Output** | Pass/Fail list | Detailed report with scores |
| **Use When** | Before commit | Before PR |
| **Security** | ❌ Not checked | ✅ Comprehensive |
| **Performance** | ❌ Not checked | ✅ Analysis included |
| **Testing** | ❌ Not checked | ✅ Coverage analysis |

**Recommendation**: Use `/code-style` for quick checks, then `/review` before creating PR.


---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: `.claude/skills/code_quality_reviewer/` 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "code_quality_reviewer 스킬이 없어 기본 체크를 수행합니다"
2. 네이티브 방식으로 간단한 체크 진행:
   - 파일 읽기 및 기본 패턴 검색
   - 함수 길이 수동 카운트
   - 네이밍 규칙 정규식 검증
3. 결과 품질: 자동화된 복잡도 분석 없음

**해결 방법**:
```bash
# 스킬 디렉토리 확인
ls -la .claude/skills/code_quality_reviewer/

# 저장소에서 복원
git checkout .claude/skills/code_quality_reviewer/
```

### 스크립트 실행 실패 시
**문제**: `complexity_checker.ts` 실행 실패

**Fallback 동작**:
1. ⚠️ 복잡도 분석 생략 경고
2. 기본 스타일 체크만 진행:
   - 네이밍 규칙
   - 들여쓰기
   - 라인 길이
3. 수동 복잡도 확인 권장

**해결 방법**:
```bash
# 스크립트 실행 권한 확인
chmod +x .claude/skills/code_quality_reviewer/tools/complexity_checker.ts

# tsx 설치 확인
npm install -g tsx

# 수동 실행
npx tsx .claude/skills/code_quality_reviewer/tools/complexity_checker.ts <file>
```

### 외부 도구 미설치 시
**문제**: `eslint`, `prettier`, `tsx` 미설치

**Fallback 동작**:
1. ⚠️ 도구별 체크 생략 안내
2. 가능한 범위 내에서 기본 체크 진행
3. 설치 가이드 제공

**해결 방법**:
```bash
# 프로젝트 의존성 설치
npm install

# 글로벌 도구 설치 (선택적)
npm install -g eslint prettier tsx

# 수동 실행
npx eslint <file>
npx prettier --check <file>
```

### 설정 파일 누락
**문제**: `.eslintrc`, `.prettierrc` 파일 없음

**Fallback 동작**:
1. ⚠️ 기본 규칙 사용 경고
2. 일반적인 코드 스타일 가이드라인 적용
3. 설정 파일 생성 권장

**해결 방법**:
```bash
# ESLint 초기화
npx eslint --init

# Prettier 설정 생성
echo '{ "semi": true, "singleQuote": true }' > .prettierrc
```

## 📖 사용 예시

### 기본 사용법
```
/code-style
```

### 실제 시나리오

#### 시나리오 1: 커밋 전 빠른 스타일 체크
```
상황: Git commit 전 코드 스타일 검증
명령: /code-style
결과:
  ✅ 12/15 파일 통과
  ❌ 3개 파일 스타일 이슈 발견
  ⏱️ 8초 소요
  → 이슈 수정 후 커밋
```

#### 시나리오 2: CI/CD 스타일 게이트
```
상황: PR 생성 시 자동 스타일 검증
명령: /code-style
결과:
  ✅ 모든 파일 통과
  → CI/CD 파이프라인 다음 단계 진행
```

#### 시나리오 3: 코드 리뷰 전 사전 점검
```
상황: PR 리뷰 요청 전 기본 스타일 확인
명령: /code-style
결과:
  ❌ 함수 길이, 네이밍 이슈 발견
  → 수정 후 /review로 종합 검증
```

## 💡 팁
- **빠른 피드백**: 30초 이내 결과로 즉시 수정 가능
- **커밋 전 필수**: pre-commit hook에 통합 권장
- **상세 분석 필요 시**: 보안/성능 검토는 `/review` 사용
- **CI/CD 통합**: GitHub Actions 등에서 스타일 게이트로 활용


---

## ✅ 성공 시 출력

```
✅ 코드 스타일 체크: PASSED (12/15 파일)

📊 체크 결과:
- ✅ 포맷팅: 일관성 유지
- ✅ 네이밍: 규칙 준수
- ✅ 함수 길이: 평균 8 라인
- ⚠️ 네스팅 깊이: 3개 파일 초과

❌ 수정 필요 (3개):
- src/auth.ts:45 - 함수 길이 23줄 (권장: ≤15줄)
- src/utils.ts:12 - 네스팅 깊이 4 (권장: ≤3)
- src/config.ts:8 - 타입 선언 누락

⏱️ 실행 시간: 8초

💡 다음 단계: 이슈 수정 후 /review로 종합 검증
```

## ❌ 실패 시 출력

```
❌ 코드 스타일 체크 실패

🔍 원인:
- ESLint 설정 파일 없음 (.eslintrc.*)
- 또는: code_quality_reviewer 스킬 누락

💡 해결 방법:
1. ESLint 설정 생성:
   npx eslint --init

2. Prettier 설정 확인:
   cat .prettierrc

3. 스킬 복원:
   git checkout .claude/skills/code_quality_reviewer/

📚 추가 도움말: 문제 해결 섹션 참조
```
