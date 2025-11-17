---
description: Comprehensive code review with security, logic, and performance analysis
tags: [review, quality, security, performance, comprehensive, skills]
---

# Comprehensive Code Review (Skills-based)

**🔍 Purpose**: Deep, thorough code review for PR preparation (1-3 minutes)
**🎯 Use Case**: Pre-PR validation, security audits, quality assessment, architectural review

This command performs a **comprehensive, in-depth code review** using the **code_quality_reviewer Skill** in full analysis mode.

## 📋 Skill Execution

### code_quality_reviewer (Full Analysis Mode)

**All Areas Covered** (Deep Analysis):

- 🔍 **Code Quality**: Readability, maintainability, structure design, SOLID principles
- ⚡ **Performance**: Algorithm complexity, optimization opportunities, bottleneck detection
- 🛡️ **Security**: SQL injection, XSS, CSRF, authentication/authorization, sensitive data exposure
- 🧪 **Testing**: Coverage analysis, edge cases, test quality, missing scenarios
- 📝 **Documentation**: Comments, API docs, README, inline documentation quality
- 🏗️ **Architecture**: Design patterns, coupling, cohesion, scalability
- 🐛 **Logic**: Algorithm correctness, edge case handling, business rule validation
- 💼 **Business**: Domain rule compliance, UX considerations

**Includes Everything** (Unlike `/code-style`):
- ✅ Security vulnerability scanning
- ✅ Algorithm correctness validation
- ✅ Performance profiling and optimization suggestions
- ✅ Comprehensive quality scoring
- ✅ Architectural analysis

## 🎯 Review Priorities

**P0 (Critical):** Security vulnerabilities, data loss risks
**P1 (High):** Functional bugs, performance degradation
**P2 (Medium):** Code style, missing comments
**P3 (Low):** Variable naming improvements, formatting

## 📊 Output

- 📋 Comprehensive code review report (markdown)
- 🎯 Prioritized action items
- 📈 Quality scores and improvement trends
- 💡 Specific improvement suggestions (with code examples)

---

**Execution Instructions:**

Please perform comprehensive code review in the following order:

1. **Activate code_quality_reviewer skill**
   - Load `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml`
   - Analyze target files (current file or specified files/directories)

2. **Run automated validation**
   - Execute `.claude/skills/code_quality_reviewer/tools/complexity_checker.ts`
   - Calculate function length, nesting depth, cyclomatic complexity
   - Validate naming conventions
   - Check type coverage (TypeScript)

3. **Perform manual review**
   - **Security**: SQL injection, XSS, sensitive information exposure
   - **Logic**: Algorithm correctness, edge case handling
   - **Business**: Domain rule compliance
   - **UX**: Error message clarity

4. **Generate report**
   ```markdown
   # Code Review Report

   ## 📊 Overall Rating: B+ (85/100)

   ### ✅ Passed Items
   - Readability, type safety

   ### ⚠️ Needs Improvement
   1. [P1] Function length 35 lines → split to under 15 lines
   2. [P2] Test coverage 55% → target 80%

   ### 🔴 Immediate Fix Required
   - [P0] SQL injection vulnerability found (auth.ts:15)

   ## 🎯 Prioritized Action Items
   ...
   ```

5. **Positive Feedback**
   - Highlight well-written sections
   - Acknowledge improved areas

**Reference:**
- Skills: `.claude/skills/code_quality_reviewer/`
- Quality rules: `.claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml`
- Existing guide: `.cursor/rules/code-review.mdc` (for reference)

---

## 📖 When to Use

### ✅ Use `/review` for:
- **PR Preparation**: Comprehensive review before creating pull request
- **Security Audits**: Detect vulnerabilities and security issues
- **Quality Assessment**: Full quality scoring and improvement roadmap
- **Architectural Review**: Design pattern and structure validation
- **Performance Analysis**: Identify bottlenecks and optimization opportunities
- **Logic Validation**: Ensure algorithm correctness and edge case handling

### ❌ Do NOT use `/review` for:
- Quick pre-commit checks → Use `/code-style` (faster)
- Simple formatting validation → Use `/code-style`
- CI/CD style gates → Use `/code-style` (lightweight)

---

## 💡 Usage Examples

### Example 1: Pre-PR Comprehensive Review
```
Scenario: Before creating pull request
Command: /review
Expected: Detailed report with security, performance, and quality analysis (1-3 min)
```

### Example 2: Security Audit
```
Scenario: Audit authentication implementation
Command: /review src/auth/
Result: Security vulnerability report + recommendations
```

### Example 3: Performance Optimization
```
Scenario: Identify slow algorithms
Command: /review src/utils/
Result: Complexity analysis + optimization suggestions
```

### Example 4: Quality Gate Before Merge
```
Scenario: Final validation before merging to main
Command: /review
Result: Comprehensive quality score + action items
```

---

## 🔄 Relationship with `/code-style`

| Aspect | `/code-style` | `/review` ⬅️ **This** |
|--------|---------------|-----------|
| **Purpose** | Quick style check | **Comprehensive review** |
| **Time** | < 30 seconds | **1-3 minutes** |
| **Depth** | Surface (formatting) | **Deep (everything)** |
| **Output** | Pass/Fail list | **Detailed report with scores** |
| **Use When** | Before commit | **Before PR** |
| **Security** | ❌ Not checked | **✅ Comprehensive** |
| **Performance** | ❌ Not checked | **✅ Analysis included** |
| **Testing** | ❌ Not checked | **✅ Coverage analysis** |
| **Architecture** | ❌ Not checked | **✅ Design review** |
| **Logic** | ❌ Not checked | **✅ Correctness validation** |

**Workflow**: Use `/code-style` for quick commits, then `/review` before PR.

---

## 🎯 Expected Output Format

Unlike `/code-style`, this provides a **comprehensive report**:

```markdown
# Code Review Report

## 📊 Overall Quality Score: B+ (85/100)

### Breakdown
- 🔍 Code Quality: 90/100
- ⚡ Performance: 75/100
- 🛡️ Security: 95/100
- 🧪 Testing: 70/100
- 📝 Documentation: 85/100

### ✅ Strengths
- Well-structured architecture following SOLID principles
- Comprehensive error handling
- Good test coverage for core functionality

### ⚠️ Areas for Improvement

#### [P0] Critical Issues
- 🛡️ SQL injection vulnerability in user query (auth.ts:45)
  - Recommendation: Use parameterized queries

#### [P1] High Priority
- ⚡ O(n²) algorithm in data processing (utils.ts:123)
  - Recommendation: Use hash map for O(n) complexity

#### [P2] Medium Priority
- 🧪 Missing edge case tests for empty input
- 📝 Incomplete API documentation

#### [P3] Low Priority
- Variable naming could be more descriptive (x → userId)

### 💡 Actionable Recommendations
1. Fix SQL injection vulnerability immediately
2. Optimize data processing algorithm
3. Add edge case tests
4. Complete API documentation

### 📈 Improvement Trends
- Code quality improved 15% since last review
- Security score increased from 80 to 95
```


---

## ⚠️ 문제 해결 (Troubleshooting)

### 스킬을 찾을 수 없는 경우
**문제**: `.claude/skills/code_quality_reviewer/` 디렉토리가 없음

**Fallback 동작**:
1. ⚠️ 경고 메시지: "code_quality_reviewer 스킬이 없어 기본 리뷰를 수행합니다"
2. 네이티브 방식으로 리뷰 진행:
   - 코드 읽기 및 수동 분석
   - 보안 패턴 검색 (SQL injection, XSS 등)
   - 성능 병목 수동 확인
3. 결과 품질: 자동화된 분석 및 스코어링 없음

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
1. ⚠️ 자동화된 복잡도 분석 생략
2. 수동 리뷰로 진행:
   - 함수 길이 육안 확인
   - 중첩 깊이 수동 체크
   - 순환 복잡도 추정
3. 정성적 분석 결과 제공

**해결 방법**:
```bash
# 스크립트 실행 권한 및 도구 확인
chmod +x .claude/skills/code_quality_reviewer/tools/complexity_checker.ts
npm install -g tsx

# 수동 실행
npx tsx .claude/skills/code_quality_reviewer/tools/complexity_checker.ts
```

### Knowledge 파일 누락
**문제**: `quality_rules.yaml` 파일 없음

**Fallback 동작**:
1. ⚠️ 기본 품질 규칙 사용 경고
2. 일반적인 코드 품질 기준 적용:
   - SOLID 원칙
   - Clean Code 가이드라인
   - 일반적인 보안 체크리스트
3. 커스텀 규칙 없이 진행

**해결 방법**:
```bash
# Knowledge 파일 확인
cat .claude/skills/code_quality_reviewer/knowledge/quality_rules.yaml

# 저장소에서 복원
git checkout .claude/skills/code_quality_reviewer/knowledge/
```

### 외부 도구 미설치 시
**문제**: 보안 스캐너, 린터 등 미설치

**Fallback 동작**:
1. ⚠️ 도구별 분석 생략 안내
2. 수동 패턴 검색으로 대체
3. 설치 가이드 제공

**해결 방법**:
```bash
# 보안 스캐너 설치
npm install -g eslint-plugin-security

# 정적 분석 도구
npm install -g typescript eslint @typescript-eslint/parser
```

## 📖 사용 예시

### 기본 사용법
```
/review
```

### 실제 시나리오

#### 시나리오 1: PR 생성 전 종합 리뷰
```
상황: Pull Request 생성 전 전체 코드 품질 검증
명령: /review
결과:
  📊 Overall Rating: B+ (85/100)
  🛡️ 보안 취약점 1개 발견 (P0)
  ⚡ 성능 개선 기회 3개 (P1)
  📝 테스트 커버리지 55% → 80% 권장
  → 이슈 수정 후 PR 생성
```

#### 시나리오 2: 보안 감사
```
상황: 프로덕션 배포 전 보안 취약점 점검
명령: /review
결과:
  🛡️ SQL injection 위험 감지
  🔒 민감 정보 노출 가능성 발견
  → 즉시 수정 필요 항목 리스트 제공
```

#### 시나리오 3: 아키텍처 품질 평가
```
상황: 리팩토링 후 설계 품질 확인
명령: /review
결과:
  🏗️ SOLID 원칙 준수도 분석
  🔗 결합도/응집도 평가
  📈 확장성 개선 제안
  → 리팩토링 방향 검증
```

## 💡 팁
- **PR 전 필수**: 코드 리뷰 전 자가 점검으로 시간 절약
- **우선순위 활용**: P0(치명적) 먼저 수정, P3(개선) 나중에 처리
- **정기 실행**: 주요 기능 완성 후 품질 확인
- **보안 중요**: 민감 데이터 처리 코드는 반드시 리뷰


---

## ✅ 성공 시 출력

```
✅ 종합 코드 리뷰 완료!

📊 전체 평가: B+ (85/100)

### 영역별 점수
- 🔍 코드 품질: A (92/100)
- ⚡ 성능: B (78/100)
- 🛡️ 보안: C (65/100) ⚠️
- 🧪 테스트: B- (72/100)
- 📝 문서화: A- (88/100)
- 🏗️ 아키텍처: B+ (85/100)

### 🔴 즉시 수정 필요 (P0)
1. [보안] SQL injection 취약점 (auth.ts:15)
   → Prepared statement 사용 권장

### ⚠️ 개선 권장 (P1)
1. [성능] O(n²) 알고리즘 최적화 (search.ts:45)
2. [테스트] 커버리지 55% → 80% 목표

### 💡 개선 제안 (P2)
1. [문서화] API 문서 추가 권장
2. [리팩토링] 함수 분리로 가독성 향상

⏱️ 실행 시간: 1분 32초

📋 다음 단계: P0 이슈 수정 → /review 재실행 → /pr
```

## ❌ 실패 시 출력

```
❌ 종합 코드 리뷰 실패

🔍 원인:
- 분석 대상 파일 없음
- 또는: complexity_checker.ts 실행 오류

💡 해결 방법:
1. 대상 파일 확인:
   ls -la src/**/*.ts

2. 스크립트 권한 확인:
   chmod +x .claude/skills/code_quality_reviewer/tools/complexity_checker.ts

3. 수동 실행하여 오류 확인:
   npx tsx .claude/skills/code_quality_reviewer/tools/complexity_checker.ts src/

📚 추가 도움말: /code-style로 빠른 체크 먼저 시도
```
