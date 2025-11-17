# 2-커밋 전략 (Two-Commit Strategy)

## 핵심 원칙

**1 Task = 2 Commits**
- **Commit 1 (Feature)**: 기능 구현 (코드, 테스트, 스타일)
- **Commit 2 (Docs)**: 문서화 (README, 가이드, 예시)

## 왜 2-커밋인가?

### 장점
```yaml
separation_of_concerns:
  - 코드 리뷰: 기능 변경만 집중 검토
  - 문서 리뷰: 사용성 및 명확성 집중 검토
  - 되돌리기: 기능만 또는 문서만 선택적 롤백

git_history_clarity:
  - feat vs docs 커밋이 명확히 구분
  - git log로 기능 추가 시점 추적 용이
  - 문서 업데이트 이력 별도 관리

collaboration:
  - 기능 구현자 ≠ 문서 작성자 가능
  - 문서 전문가가 후속 개선 가능
  - PR 리뷰 시 역할 분담 명확
```

### 단점 및 대응
```yaml
overhead:
  문제: 커밋 2번이 번거로움
  대응: commit_generator.sh로 자동화

consistency:
  문제: 개발자마다 다르게 분리
  대응: 명확한 분리 기준 문서화
```

---

## 커밋 분리 기준

### Commit 1: Feature (기능)

**Type**:
- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `refactor`: 코드 리팩토링 (기능 변경 없음)
- `perf`: 성능 개선
- `test`: 테스트 추가/수정
- `style`: 코드 포맷팅 (기능 변경 없음)
- `build`: 빌드 시스템/외부 의존성 변경

**포함 파일**:
```yaml
source_code:
  - "*.ts", "*.tsx", "*.js", "*.jsx"
  - "*.vue", "*.svelte"
  - "*.css", "*.scss", "*.less"

tests:
  - "*.test.*", "*.spec.*"
  - "__tests__/*"

configuration:
  - "tsconfig.json", "package.json"
  - "webpack.config.js", "vite.config.ts"
  - ".eslintrc", "prettier.config.js"
```

**예시**:
```bash
# 작업 2.3: Button 컴포넌트 구현

git add packages/app/src/components/Button.tsx
git add packages/app/src/components/Button.test.tsx
git add packages/app/src/components/Button.module.css

git commit -m "feat(ui): implement Button component with variants

- Add Button component with primary/secondary variants
- Add comprehensive unit tests (95% coverage)
- Follow accessibility guidelines (WCAG 2.1)
- Add hover/focus/disabled states

Relates to: Task 2.3"
```

---

### Commit 2: Docs (문서)

**Type**:
- `docs`: 문서 변경 (코드 변경 없음)

**포함 파일**:
```yaml
documentation:
  - "README.md", "CHANGELOG.md"
  - "docs/**/*.md"
  - "*.mdx" (MDX 문서)

examples:
  - "examples/**/*"
  - "demo/**/*"
  - Storybook stories (선택적, 문서 성격 강함)

guides:
  - "CONTRIBUTING.md"
  - "API.md", "USAGE.md"
```

**예시**:
```bash
# 작업 2.3: Button 컴포넌트 구현 (문서화)

git add README.md
git add packages/app/docs/components/Button.md

git commit -m "docs(ui): add Button component usage guide

- Add Button component to README
- Add detailed API documentation
- Add usage examples (basic, variants, states)
- Add accessibility notes

Relates to: Task 2.3"
```

---

## 단일 커밋 예외 조건

### 1. 문서만 수정 (Docs Only)
```bash
# 타이포 수정, 링크 업데이트 등
git add README.md
git commit -m "docs: fix typo in installation guide"

# ✓ 단일 커밋 허용
```

### 2. 설정만 수정 (Config Only)
```bash
# ESLint 규칙 추가, TypeScript 설정 변경
git add .eslintrc.json
git commit -m "build: add no-console eslint rule"

# ✓ 단일 커밋 허용
```

### 3. 긴급 Hotfix (Critical Fix)
```bash
# 프로덕션 버그 긴급 수정
git add packages/app/src/auth/login.ts
git commit -m "fix(auth): prevent null pointer in login handler

CRITICAL: Fixes production crash on empty password field
Deployed to prod immediately without docs update"

# ✓ 단일 커밋 허용 (문서는 후속 PR로)
```

### 4. 테스트만 추가 (Test Only)
```bash
# 기존 코드에 테스트 추가 (코드 변경 없음)
git add packages/app/src/utils/format.test.ts
git commit -m "test(utils): add tests for edge cases in format function"

# ✓ 단일 커밋 허용
```

---

## 커밋 순서

### 원칙: Feature → Docs

**이유**:
1. **기능 우선**: 코드가 먼저 존재해야 문서 작성 가능
2. **의존성**: 문서는 기능에 의존, 역은 불가능
3. **롤백**: Feature만 롤백 시 문서는 남아있어도 무방

**잘못된 순서**:
```bash
# ❌ 문서를 먼저 커밋하면 안 됨
git commit -m "docs(ui): add Button usage guide"  # 아직 Button 없음!
git commit -m "feat(ui): implement Button"
```

**올바른 순서**:
```bash
# ✅ 기능 먼저, 문서 나중
git commit -m "feat(ui): implement Button"
git commit -m "docs(ui): add Button usage guide"
```

---

## Phase 완료 보고

### Phase 완료 조건
```yaml
all_tasks_completed:
  - Phase 내 모든 작업의 체크박스 ✓
  - 모든 작업의 검증 통과 (Level 1-3)

no_blockers:
  - 미해결 에러 없음
  - 사용자 개입 대기 상태 없음
```

### 리포트 형식
```markdown
🎉 Phase {number} 완료: {phase_name}

📊 Phase 통계:
- 완료 작업: {completed_count}/{total_count}
- 총 커밋: {commit_count} ({feature_count} feature, {docs_count} docs)
- 변경 파일: {file_count}

📦 주요 변경사항:
- {key_change_1}
- {key_change_2}
- {key_change_3}

✓ 검증 완료:
- Lint: ✓ 0 errors
- TypeCheck: ✓ 0 errors
- Test: ✓ {test_count} passed

⏭️ 다음 Phase:
- Phase {next_phase_number}: {next_phase_name}
- 예상 작업: {task_count}개
- 예상 소요 시간: {estimated_time}

🛑 계속 진행하시겠습니까?
   Reply: "continue" to proceed
   Reply: "pause" to stop and review
```

### 사용자 입력 대기
```yaml
continue:
  - 즉시 다음 Phase 시작
  - task-and-progress에서 다음 작업 선택

pause:
  - 작업 중지
  - 현재 상태 저장
  - 리뷰 기회 제공

timeout (60초):
  - 기본값: pause
  - 안전하게 중지
```

---

## 계획 완료 보고

### 계획 완료 조건
```yaml
all_phases_completed:
  - 모든 Phase 완료
  - 모든 작업 완료

all_verifications_passed:
  - 전체 lint: 0 errors
  - 전체 typecheck: 0 errors
  - 전체 test: passing
```

### 최종 리포트 형식
```markdown
🏁 계획 완료: {plan_name}

📈 전체 통계:
- 완료 Phase: {phase_count}
- 완료 작업: {task_count}
- 총 커밋: {commit_count} ({feature_count} feature, {docs_count} docs)
- 변경 파일: {file_count}
- 추가 라인: +{added_lines}
- 삭제 라인: -{deleted_lines}

📦 주요 성과:
- ✅ {achievement_1}
- ✅ {achievement_2}
- ✅ {achievement_3}

🔍 품질 지표:
- Lint: ✓ 0 errors, {warning_count} warnings
- TypeCheck: ✓ 0 errors
- Test: ✓ {test_count} passed, {coverage}% coverage
- Build: ✓ Success

📋 후속 조치 (Next Steps):
- [ ] Pull Request 생성 및 제출
- [ ] 코드 리뷰 요청 (@reviewer)
- [ ] 문서 업데이트 확인 (README, CHANGELOG)
- [ ] Changeset 생성 (배포 예정 시)
- [ ] Storybook 배포 (UI 컴포넌트인 경우)

🎯 브랜치 정보:
- 브랜치: {branch_name}
- 커밋 범위: {first_commit}..{last_commit}
- Base: {base_branch}

🔗 빠른 링크:
- PR 생성: gh pr create --base {base_branch}
- 커밋 히스토리: git log {base_branch}..HEAD
- 변경 파일: git diff --name-only {base_branch}..HEAD

---

🎉 축하합니다! 계획이 성공적으로 완료되었습니다.
```

---

## 커밋 검증 체크리스트

### 커밋 전
```markdown
- [ ] 모든 변경 파일이 의도된 작업에 속함
- [ ] Lint 및 TypeCheck 통과
- [ ] 테스트 추가 및 통과 (해당 시)
- [ ] 커밋 메시지가 Conventional Commits 형식 준수
- [ ] Feature와 Docs가 명확히 분리됨
```

### 커밋 후
```markdown
- [ ] git log로 커밋 확인
- [ ] git show로 변경 내용 검증
- [ ] 의도하지 않은 파일이 포함되지 않았는지 확인
- [ ] 커밋 메시지가 명확하고 유용한지 확인
```

---

## 예시: 전체 작업 커밋 과정

```bash
# 작업 2.3: Button 컴포넌트 구현

# Step 1: 파일 구현 (execution-engine)
# → Button.tsx, Button.test.tsx, Button.module.css 생성
# → README.md 업데이트

# Step 2: 검증 (execution-engine)
# → Level 1: yarn lint && yarn typecheck ✓
# → Level 2: yarn test Button.test.tsx ✓
# → Level 3: REQ-1.2 검증 ✓

# Step 3: Feature 커밋 (git-workflow-automation)
git add packages/app/src/components/Button.tsx
git add packages/app/src/components/Button.test.tsx
git add packages/app/src/components/Button.module.css

git commit -m "$(./tools/commit_generator.sh 2.3 feature)"
# Output: feat(ui): implement Button component with variants
#
# - Add Button component with primary/secondary variants
# - Add comprehensive unit tests (95% coverage)
# - Follow accessibility guidelines (WCAG 2.1)
# - Add hover/focus/disabled states
#
# Relates to: Task 2.3

# Step 4: Docs 커밋 (git-workflow-automation)
git add README.md

git commit -m "$(./tools/commit_generator.sh 2.3 docs)"
# Output: docs(ui): add Button component usage guide
#
# - Add Button component to README
# - Add API documentation
# - Add usage examples
#
# Relates to: Task 2.3

# Step 5: 확인
git log -2 --oneline
# a1b2c3d docs(ui): add Button component usage guide
# d4e5f6g feat(ui): implement Button component with variants

# Step 6: 보고
echo "✅ 작업 2.3 완료: Button 컴포넌트 구현"
echo "📦 커밋: 2개 (1 feature, 1 docs)"
echo "🔗 다음: 작업 2.4"
```

---

> **Best Practice**: 항상 Feature → Docs 순서 유지
> **Exception Handling**: 단일 커밋 예외 조건 명확히 문서화
> **Automation**: commit_generator.sh로 일관된 메시지 생성
