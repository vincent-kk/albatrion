# Automated Pull Request Creation Guide

## Role

When requested to create a Pull Request, automatically analyze changes in the current branch, perform a code review, and create a PR to the master branch based on the results.

## Understanding Project Structure

**CRITICAL: Project structure file verification required before PR creation**

### 1. Check Project Structure File

Before starting PR creation, verify that `.project-structure.yaml` file exists:

```bash
# Check if .project-structure.yaml file exists
if [ ! -f ".project-structure.yaml" ]; then
  echo "⚠️  .project-structure.yaml file does not exist."
  echo "→ Running project structure analysis first..."
  echo ""
  echo "📋 Executing @analyze-structure.md to analyze project structure."
  # Execute analyze-structure.md rule to generate .project-structure.yaml
  # Continue with this PR workflow after generation
fi
```

### 2. Load Project Information

Load the following information from `.project-structure.yaml` file:

- **Project Type**: `project.type` (monorepo or single-package)
- **Package Structure**: `examples.packages` (for monorepo)
- **Tech Stack**: `tech_stack` (frontend, backend, testing, etc.)
- **Package Manager**: `package_manager.type`
- **Commands**: `commands` (test, lint, build, etc.)

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

### Step 2: Collect Changes and Perform Code Review

Collect changes using appropriate git commands based on the analysis mode, and perform a comprehensive code review following the code-review.mdc guidelines.

#### Branch Comparison Mode (current != master)

```bash
# Analyze differences between branches
git log master..HEAD --oneline --stat
git diff master..HEAD --unified=3
git diff master..HEAD --name-only

# Check divergence point
git merge-base master HEAD
git log $(git merge-base master HEAD)..HEAD --oneline
```

#### Staged Changes Analysis Mode (current == master)

```bash
# Analyze staged changes
git diff --cached --unified=3
git diff --cached --name-only
git status --porcelain
```

### Step 3: Generate Code Review

Generate code review in the following format according to code-review.mdc guidelines:

- **Simple Refactoring**: Structural changes without logic modifications
- **Logic Changes**: Business logic and algorithm modifications
- **File Movement/Reordering**: Structural reorganization
- **Detailed Change History**: New features, bug fixes, etc.

### Step 4: Generate PR Title and Description

Automatically generate PR title and description based on analyzed changes:

#### PR Title Format

```
[<Change Purpose Grouping>](<Scope>): <Change Summary>
```

**Examples**:

- `[Fix/Feat](schema-form): input handling and parser improvements`
- `[Refactor](schema-form): Async strategy methods and dependency optimization`
- `[Feat](promise-modal): Add queue-based modal management system`

#### PR 설명 구조

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

Create the actual PR using GitHub CLI:

```bash
# Check if branch is pushed to remote
git push -u origin <current-branch>

# Create PR
gh pr create --title "PR Title" --body "$(cat <<'EOF'
PR Description Content
EOF
)" --base master --head <current-branch>
```

## Automation Execution Guide

When user requests "Create PR" or similar:

1. **Project Structure Check** ⚠️ **Required Pre-Step**
   - Verify `.project-structure.yaml` file exists
   - If file doesn't exist, automatically execute `@analyze-structure.md` rule
   - Load project type, package structure, commands, etc.
2. **Automatic Branch Analysis**: Identify current state and select appropriate analysis mode

3. **Automatic Code Review**: Comprehensively analyze changes and generate review document

4. **Automatic PR Content Generation**:
   - Write PR title and description based on review results
   - Automatically detect affected packages using `.project-structure.yaml` information
   - Automatically suggest test commands appropriate for the project
5. **Automatic PR Creation**: Create actual PR through GitHub CLI

6. **Result Verification**: Provide generated PR link and summary information

## Quality Assurance Principles

### Analysis Accuracy

- **Fact-Based**: Analyze based on actual git diff and commit messages
- **Context Consideration**: Understand the overall context of changes and summarize from a meta perspective
- **Impact Assessment**: Accurately classify impacts such as breaking changes, new features, bug fixes, etc.

### PR Content Clarity

- **Conciseness**: Write clearly and concisely, focusing on core changes
- **Structure**: Structure information in a consistent format for easy reviewer understanding
- **Actionability**: Clearly present sections requiring actual review and test verification items

### Automation Reliability

- **Verification Steps**: Check required items before PR creation (lint, typecheck, test)
- **Error Handling**: Provide appropriate alternatives when errors occur during analysis
- **User Confirmation**: Request user confirmation for critical changes

## Additional Features

### Automatic Mermaid Diagram Generation

When change relevance is 50% or higher, automatically generate the following diagrams:

- **Sequence Diagram**: Behavioral flow changes
- **Flowchart**: Logic flow changes
- **Class Diagram**: Structural changes

### Smart Labeling

Automatic label suggestions based on change type:

- `enhancement`: New features
- `bug`: Bug fixes
- `refactor`: Refactoring
- `breaking-change`: Breaking changes
- `documentation`: Documentation changes

---

Through this guide, users can automatically generate high-quality PRs with comprehensive analysis using a single simple command.
