# Automated Pull Request Creation Guide

## Role

When requested to create a Pull Request, automatically analyze changes in the current branch, perform a code review, and create a PR to the master branch based on the results.

## Understanding Project Structure

⚠️ **REQUIRED**: Verify project structure file before PR creation

### 1. Check Project Structure File

Verify `.project-structure.yaml` exists:

```bash
[ ! -f ".project-structure.yaml" ] && echo "⚠️ Missing → Run @analyze-structure.md"
```

### 2. Load Project Info

Load from `.project-structure.yaml`:

- **Type**: `project.type` (monorepo/single-package)
- **Packages**: `examples.packages` (for monorepo)
- **Stack**: `tech_stack` (frontend/backend/testing)
- **Manager**: `package_manager.type`
- **Commands**: `commands` (test/lint/build)

Based on this information:

1. **Identify Affected Packages**: Automatically detect which packages are affected based on changed file paths
2. **Suggest Appropriate Test Commands**: Use test commands that match the project configuration
3. **Group Changes by Package**: For monorepo, classify changes by package

### 3. Example Output Format

Express the following format based on information loaded from `.project-structure.yaml`:

```markdown
## 📦 Affected Packages

<!-- Auto-generated based on examples.packages for monorepo -->

- `@{project.name}/{package.name}`: {change summary}
- `@{project.name}/{another-package.name}`: {change summary}

## 🧪 Test Checklist

<!-- Suggest appropriate test commands based on commands.test -->

- [ ] Regression testing for existing features: `{commands.test.all}`
- [ ] Test affected packages: `{commands.test.{package}}`
- [ ] TypeScript compilation: `{commands.typecheck.all}`
- [ ] Lint check: `{commands.lint.all}`
```

## Automation Workflow

### Step 1: Determine Branch Analysis Mode

Check if the current branch is master and determine the analysis mode:

- **If current branch is not master**: Branch comparison mode (current branch vs master)
- **If current branch is master**: Staged changes analysis mode

### Step 2: Collect Changes & Review

**Parallel execution** of git commands by mode:

#### Branch Comparison (current != master)

```bash
# Parallel - branch diff analysis
git log master..HEAD --oneline --stat &
git diff master..HEAD --unified=3 &
git diff master..HEAD --name-only &
wait

# Divergence point
git merge-base master HEAD
```

#### Staged Changes (current == master)

```bash
# Parallel - staged changes
git diff --cached --unified=3 &
git diff --cached --name-only &
git status --porcelain &
wait
```

### Step 3: Generate Code Review

Per code-review.mdc:

- **Simple Refactoring**: Structure changes w/o logic mods
- **Logic Changes**: Business logic/algorithm updates
- **File Movement**: Structural reorganization
- **Detailed History**: New features, bug fixes

### Step 4: Generate PR Title and Description

Automatically generate PR title and description based on analyzed changes:

#### PR Title Format

```
[<Type>](<Scope>): <Summary>
```

**Examples**:
- `[Fix/Feat](schema-form): input handling and parser improvements`
- `[Refactor](schema-form): Async strategy methods and dependency optimization`
- `[Feat](promise-modal): Add queue-based modal management system`

#### PR Description Structure

```markdown
## 📋 TL;DR

한 줄 요약: 이 PR의 핵심 변경사항

## 🔄 변경사항 분석

### ✨ 새로운 기능

- **기능명**: 간단한 설명
- **다른 기능**: 간단한 설명

### 🐛 버그 수정

- **수정사항**: 문제 해결 내용
- **영향도**: 사용자에게 미치는 영향

### 🚀 개선사항

- **성능**: 성능 향상 내용
- **리팩토링**: 코드 구조 개선

### 💥 Breaking Changes (해당시)

- **변경사항**: 기존 API 변경 내용
- **마이그레이션**: 업데이트 방법

## 🔍 주요 변경 파일

- `packages/xxx/src/component.ts`: 주요 로직 변경
- `packages/yyy/src/types.ts`: 타입 정의 업데이트

## 🧪 테스트 확인사항

<!-- .project-structure.yaml의 commands를 기반으로 자동 생성 -->

- [ ] 기존 기능 회귀 테스트: `{commands.test.all 또는 commands.test.{package}}`
- [ ] 새로운 기능 동작 확인
- [ ] TypeScript 컴파일: `{commands.typecheck.all 또는 'tsc --noEmit'}`
- [ ] 린트 검사: `{commands.lint.all 또는 commands.lint.{package}}`

## 📦 영향받는 패키지

<!-- .project-structure.yaml의 examples.packages를 기반으로 변경된 파일 경로 분석하여 자동 생성 -->
<!-- monorepo인 경우: @{project.name}/{package.name} 형식 -->
<!-- single-package인 경우: 이 섹션 생략 -->

- `@{project.name}/{affected-package}`: {변경사항 요약}
- `@{project.name}/{another-package}`: {변경사항 요약}
```

### Step 5: Create GitHub PR

```bash
# Push & create PR
git push -u origin <branch>
gh pr create --title "Title" --body "$(cat <<'EOF'
Content
EOF
)" --base master --head <branch>
```

## Automation Execution Guide

On "Create PR" request:

1. **Structure Check** ⚠️ **Required**
   - Verify `.project-structure.yaml` exists → Run `@analyze-structure.md` if missing
   - Load: type, packages, commands
2. **Branch Analysis**: Detect state → Select mode
3. **Code Review**: Analyze changes → Generate review
4. **PR Content**:
   - Title & description from review
   - Auto-detect affected packages
   - Auto-suggest test commands
5. **Create PR**: Execute via `gh` CLI
6. **Verify**: Return PR link & summary

## Quality Principles

### Accuracy
- **Fact-Based**: Use actual git diff/commits
- **Context**: Meta-level change understanding
- **Impact**: Classify breaking/new/fixes correctly

### Clarity
- **Concise**: Focus on core changes
- **Structured**: Consistent format
- **Actionable**: Clear review/test items

### Reliability
- **Verify**: Check lint/typecheck/test pre-PR
- **Handle Errors**: Provide alternatives
- **Confirm**: User approval for critical changes

## Additional Features

### Auto Mermaid Diagrams
Generate when relevance ≥50%:
- **Sequence**: Behavioral flows
- **Flowchart**: Logic flows
- **Class**: Structural changes

### Smart Labels
Auto-suggest by type:
- `enhancement`: New features
- `bug`: Fixes
- `refactor`: Refactoring
- `breaking-change`: Breaking changes
- `documentation`: Docs

---

**Result**: High-quality PRs with comprehensive analysis via single command.
