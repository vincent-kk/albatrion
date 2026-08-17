# Claude Code Guidelines for Albatrion Project

This document provides project-specific guidelines for Claude Code when working on the Albatrion monorepo. Detailed rules, skills, and commands are maintained under `.claude/`.

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

## 🔧 Agent Assets (`.claude/`)

All agent assets live under `.claude/`. The lists below are the complete inventory — nothing else exists.

### Rules — `.claude/rules/`

Declarative rules that apply at all times. Loaded at session start.

| Family    | Files                                                                                                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seiri_*` | `agent-legible`, `code-comments`, `cognitive-discipline`, `context-efficiency`, `function-boundaries`, `naming`, `public-contract`, `reuse-first`, `structure`, `test-validity` |
| `filid_*` | `code-placement`, `fractal-boundaries`, `module-documents`, `verification-records`                                                                                              |

Precedence: repository instructions (this document, per-package CLAUDE.md) > repository conventions > the rules above.

### Skills — `.claude/skills/`

| Skill                         | Purpose                                                                                        |
| ----------------------------- | ---------------------------------------------------------------------------------------------- |
| `ui-plugin-guidelines`        | Compatibility verification and structure design between a UI library and `@canard/schema-form` |
| `react-plugin-implementation` | React-based `@canard/schema-form` plugin implementation patterns                               |
| `release-note-generator`      | Release notes written from git change data                                                     |
| `agents-docs-asset-wiring`    | Wire a package's `docs/agents` assets into the `@slats/agents-assets-sync` engine              |

### Commands — `.claude/commands/`

| Command                  | Purpose                                   |
| ------------------------ | ----------------------------------------- |
| `/create-canard-plugin`  | Create a new `@canard/schema-form` plugin |
| `/generate-package-docs` | Generate package documentation            |

Any other slash command comes from Claude Code itself or from an installed plugin (seiri, filid, and so on); this repository does not define them.

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

1. Read and follow all rules in the `.claude/rules` directory
2. Check the specific package's CLAUDE.md for detailed guidance
3. Use yarn workspace commands for package-specific operations
4. Run yarn lint, typecheck, and tests before completing tasks
5. Follow the project structure and naming conventions
6. Bump the package version in its `package.json` when releasing — this repository does not use changesets or CHANGELOG files, so the commit message is the only durable record of a behavior change

### 4. **Available Packages**

Major package groups include:

- **@canard/schema-form\***: Form generation libraries with various UI plugins
- **@winglet/\***: Utility libraries (common-utils, react-utils, json, etc.)
- **@lerx/promise-modal**: Modal management

---

> **Important**: This CLAUDE.md is for monorepo-level guidance. For package-specific work, always consult the individual package's CLAUDE.md first.
>
> Rules, skills, and commands live under `.claude/`. Keep this document's inventory in sync when they change — a stale pointer here misleads every agent that reads it.
>
> Copyright © 2025 Vincent K. Kelvin. All rights reserved.
