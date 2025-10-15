# Claude Code Guidelines for Albatrion Project

This document provides project-specific guidelines for Claude Code when working on the Albatrion monorepo. All detailed guidelines are maintained in the `.cursor/rules` directory.

## 🏗️ Project Structure

This is a **yarn-based monorepo** with the following structure:
- **Root**: Configuration and shared tooling
- **Packages**: Individual libraries in `packages/**/*` with their own CLAUDE.md files
- **Workspaces**: Configured for yarn workspaces

## 📋 Important Commands

Use **yarn** commands (not npm) for this project:
- `yarn lint` - Check code style across all packages
- `yarn typecheck` - Verify TypeScript types across all packages  
- `yarn test` - Run tests across all packages
- `yarn run:all <command>` - Run command across all workspaces

## 📦 Working with Individual Packages

When working on specific packages, **always check the package-specific CLAUDE.md** in each package directory:
- Each package has its own `CLAUDE.md` with specific commands and guidelines
- Package-specific commands use yarn workspace syntax: `yarn workspace @scope/package-name <command>`
- Example: `yarn workspace @canard/schema-form build`

## 🔧 Slash Commands for .cursor/rules

`.cursor/rules` 디렉토리의 규칙들을 쉽게 사용할 수 있도록 slash command를 제공합니다:

### Development Workflow
- **/changeset** - Create changeset and release notes (→ `.cursor/rules/create-changeset.mdc`)
- **/execute** - Execute implementation plans with automated workflow (→ `.cursor/rules/plan-execution.mdc`)
- **/requirements** - Create requirements document and implementation plan (→ `.cursor/rules/requirement-driven-development.mdc`)
- **/review** - Perform comprehensive code review (→ `.cursor/rules/code-review.mdc`)
- **/pr** - Create well-structured pull request (→ `.cursor/rules/pull-request.mdc`)

### Code Quality
- **/code-style** - Apply code writing and TypeScript guidelines (→ multiple style rules)
  - Includes: code-writing-guidelines, typescript, typescript-react, toss-frontend-rules

### Specialized Tasks
- **/plugin** - Create new @canard/schema-form plugin (→ `.cursor/rules/create-canard-form-plugin-guidelines.mdc`)
- **/release** - Generate comprehensive release notes (→ `.cursor/rules/create-release-note.mdc`)
- **/analyze-structure** - Analyze project structure and generate .project-structure.yaml (→ `.cursor/rules/analyze-project-structure.mdc`)

### 사용 방법

각 slash command는 해당하는 `.cursor/rules` 파일을 자동으로 읽고 가이드라인을 따릅니다:

```bash
# 예시: changeset 생성
/changeset

# 예시: 계획 실행
/execute

# 예시: 요구사항 작성
/requirements

# 예시: 코드 리뷰
/review

# 예시: PR 생성
/pr
```

## 📁 Rule Files Reference (직접 참조)

필요시 `.cursor/rules` 파일을 직접 참조할 수도 있습니다:

### Core Guidelines
- **Project Structure**: `.cursor/rules/project-structure.mdc`
- **Code Writing Guidelines**: `.cursor/rules/code-writing-guidelines.mdc`
- **TypeScript Best Practices**: `.cursor/rules/typescript.mdc`
- **React + TypeScript Rules**: `.cursor/rules/typescript-react.mdc`
- **Testing Strategy**: `.cursor/rules/testing-strategy.mdc`
- **Frontend Design Guidelines (Toss)**: `.cursor/rules/toss-basic-frontend-rules.mdc`

### Process Guidelines
- **Changeset Creation**: `.cursor/rules/create-changeset.mdc`
- **Pull Request Guidelines**: `.cursor/rules/pull-request.mdc`
- **Plan Execution**: `.cursor/rules/plan-execution.mdc`
- **Requirement Driven Development**: `.cursor/rules/requirement-driven-development.mdc`
- **Code Review**: `.cursor/rules/code-review.mdc`
- **Release Notes**: `.cursor/rules/create-release-note.mdc`

### Plugin Development
- **Schema Form Plugin Guidelines**: `.cursor/rules/create-canard-form-plugin-guidelines.mdc`

## 🎯 Quick Reference for Claude Code

When working on this monorepo:

### 1. **First Priority**: Check Package-Specific CLAUDE.md
- Each package in `packages/**/*` has its own `CLAUDE.md` with specific guidelines
- Always read the package-specific CLAUDE.md before working on that package
- Package CLAUDE.md files contain architecture details, testing commands, and development patterns

### 2. **Command Strategy**
- Use `yarn` (not npm) for all commands
- For monorepo-wide operations: `yarn <command>` (lint, typecheck, test)
- For package-specific operations, you have two options:
  - **Full syntax**: `yarn workspace @scope/package-name <command>`
  - **Shortcut commands**: Many packages have shortcuts defined in root package.json
    - Examples: `yarn schemaForm`, `yarn reactUtils`, `yarn promiseModal`
    - See root package.json scripts section for all available shortcuts
- Check each package's CLAUDE.md for available commands

### 3. **Development Workflow**
1. Read and follow all guidelines in the `.cursor/rules` directory
2. Check the specific package's CLAUDE.md for detailed guidance
3. Use yarn workspace commands for package-specific operations
4. Run yarn lint, typecheck, and tests before completing tasks
5. Follow the project structure and naming conventions
6. Create proper changesets and pull requests according to guidelines

### 4. **Available Packages**
Major package groups include:
- **@canard/schema-form\***: Form generation libraries with various UI plugins
- **@winglet/\***: Utility libraries (common-utils, react-utils, json, etc.)
- **@lerx/promise-modal**: Modal management

---

> **Important**: This CLAUDE.md is for monorepo-level guidance. For package-specific work, always consult the individual package's CLAUDE.md first.
> 
> All detailed guidelines are maintained in `.cursor/rules` directory to ensure consistency between Cursor and Claude Code.
> 
> Copyright © 2025 Vincent K. Kelvin. All rights reserved.