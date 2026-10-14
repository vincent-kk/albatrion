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

## 📐 Module Contract Principles

Owner principles for every package that has adopted FCA (directories with `INTENT.md`). Per the precedence above, they outrank `.claude/rules/`.

1. **`index.ts` is the contract record.** It records which interface a fractal promised, and it is the strict contract that keeps internal helpers and sub-fractal trees from multiplying complexity outward. Widening it is a contract change; it lists its exports by name, never with a wildcard.
2. **The root is the first image.** The `index.ts` and the flat files at a fractal's root are what a reader sees first, while attention is highest. A fractal root holds its documents, its `index.ts` and at most one implementation file named after the fractal; everything else sits in a role compartment (`components/`, `utils/`, `hooks/`, `types/` and the like) or in a child fractal. Every root file and every index export must have a consumer.
3. **A consumer is product code outside the fractal**: another fractal or another package. Tests, benchmarks and stories are not consumers.
4. **Imports follow lineage.** Upward is open: a fractal may import its ancestors' organ files and root files directly. Downward is closed: a parent reaches a child fractal only through the child's `index.ts`. Sideways is closed: a non-lineage fractal is reached only through its own `index.ts`, like an external package. An organ has no `index.ts`; its files are imported directly, and an organ never imports a child fractal of its owner. A fractal never imports its own or an ancestor's `index.ts`.
5. **Tests verify from inside.** A test lives in the fractal it verifies (its `__tests__/`) and imports that fractal's internal files directly, never through its own `index.ts`. Public-API tests that act as an external consumer sit in the package-level `src/__tests__/` and import the package entry point. The verification-file exemption in `filid_fractal-boundaries` §5 does not lift §3.
6. **An unused root file or export is a defect**, on par with a broken feature. The "leave pre-existing dead code" allowance of `seiri_reuse-first` §3 does not apply to it: remove it or move it below the root.

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
7. Before adding a root file or an `index.ts` export, name its consumer outside the fractal (see Module Contract Principles)

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
