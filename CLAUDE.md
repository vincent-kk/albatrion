# Claude Code Guidelines for Albatrion Project

This document provides project-specific guidelines for Claude Code when working on the Albatrion monorepo. Detailed rules, skills, and commands are maintained under `.claude/`.

## 🏗️ Project Structure

This is a **yarn-based monorepo** with the following structure:

- **Root**: Configuration and shared tooling
- **Packages**: Individual libraries in `packages/**/*` with their own CLAUDE.md files
- **Workspaces**: Configured for yarn workspaces

## 📋 Important Commands

The `ci` workflow uses the default `pr` tier for pull requests to every branch and pushes to `master`. Its install-free selector compares the merge base, follows workspace manifest dependencies and tracked source imports to select affected consumers, lints changed workspaces, builds their dependency closures, and runs available typechecks and per-package tests. Shared inputs select all workspaces; ordinary Markdown and unrelated tooling select none. Schema-form runs only `test --run --project unit` in its separate shard in the `pr` tier, without Chromium. The separate manual `pre-release` workflow runs the `pre-release` tier, typically on the commit about to be published: it checks every workspace and runs schema-form's complete unit, render, React 18, Storybook, verification and production suites with Chromium. Publishing remains a separate workflow. Other workspaces use the same checks in both tiers. Check jobs run Node with a 4 GB heap (`NODE_OPTIONS`) because the schema-form typecheck needs about 2.4 GB and the runner default of about 2 GB fails intermittently. The runner gives every Vitest command a 120-second test timeout to accommodate variable CI compute; a workspace whose test script finds no test files passes; each check job retains its 90-minute limit. Hooks keep Vitest's project defaults because Vitest 3.2.6 does not propagate the CLI hookTimeout option to projects; a hook timeout in GitHub Actions is the signal to revisit this limitation. To inspect a range locally, run `node scripts/ci/selectAffectedWorkspaces.mjs --tier pr --base <sha> --head <sha> --output <plan.json>`, followed by `node scripts/ci/runCheckPlan.mjs --plan <plan.json> --dry-run`. For the full pre-release plan, run `node scripts/ci/selectAffectedWorkspaces.mjs --tier pre-release --output <plan.json>` and the same dry-run command; the pre-release tier ignores base and head arguments.

Use **yarn** commands (not npm) for this project:

- `yarn run:all lint` - Check code style across all packages
- `yarn run:all typecheck` - Verify TypeScript types across all packages
- `yarn run:all test` - Run tests across all packages
- `yarn run:all <command>` - Run command across all workspaces

## 📦 Working with Individual Packages

When working on specific packages, **always check the package-specific CLAUDE.md** in each package directory:

- Each package has its own `CLAUDE.md` with specific commands and guidelines
- Package-specific commands use yarn workspace syntax: `yarn workspace @scope/package-name <command>`
- Example: `yarn workspace @canard/schema-form build`

## 🔧 Agent Assets (`.claude/`)

All agent assets live under `.claude/`. The lists below are the complete inventory — nothing else exists.

### Rules — `.claude/rules/`

Declarative rules. `filid_module-documents`, `filid_verification-records` and `seiri_test-validity` load only for files matching their `paths:` frontmatter; the others load at session start.

| Family    | Files                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seiri_*` | `agent-legible`, `code-comments`, `context-efficiency`, `function-boundaries`, `naming`, `public-contract`, `reuse-first`, `structure`, `test-validity` |
| `filid_*` | `code-placement`, `fractal-boundaries`, `module-documents`, `verification-records`                                                                      |

Precedence: repository instructions (this document, `DOCUMENTATION.md`, per-package CLAUDE.md) > repository conventions > the rules above.

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

## 📝 Documentation

`DOCUMENTATION.md` holds the principles for the documents within the scope it states, and nothing else restates them. If its text is not already in your context, read it before writing or editing a document.

@DOCUMENTATION.md

## 📏 Repository Requirements

- For arrays with fewer than 5,000 elements, prefer direct array operations for one-off work. Avoid constructing a `Set` only to inspect its size or perform a single lookup. Use a `Set` when repeated membership operations reuse the index enough to amortize construction. Verify performance-sensitive choices with measurements.
- Keep build outputs out of source commits: run the designated builds and artifact checks, then commit regenerated runtime bundles and adapters in their own build commit.

## 🎯 Quick Reference for Claude Code

When working on this monorepo:

### 1. **First Priority**: Check Package-Specific CLAUDE.md

- Each package in `packages/**/*` has its own `CLAUDE.md` with specific guidelines
- Always read the package-specific CLAUDE.md before working on that package
- Package CLAUDE.md files contain architecture details, testing commands, and development patterns

### 2. **Command Strategy**

- Use `yarn` (not npm) for all commands
- For monorepo-wide operations: `yarn run:all <command>` (lint, typecheck, test)
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
4. Run lint, typecheck and tests for the workspaces you changed (`yarn workspace <name> <script>`, with `--run` for Vitest), and reproduce CI with the affected-workspace procedure under Important Commands
5. Follow the project structure and naming conventions
6. Record releases as the change records section of `DOCUMENTATION.md` describes, and publish as `scripts/PUBLISHING.md` describes; `yarn changeset:version` needs a `GITHUB_TOKEN`
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

## Shared build-script verification

`yarn --cwd . test:build-scripts` runs the shared aileron build scripts' node:test suite, including declaration-path rewriting and runtime environment output checks. `build:all` runs this suite once before workspace builds; CI runs it in the first check shard only. Package `build:verify:types` scripts check their own built public declarations without repeating the shared unit suite. String export targets are checked as consumer imports; null targets are reported as blocked. Conditional exports require a top-level string `types` target: nested-only type conditions and wildcard addresses fail explicitly because the ESM consumer checks cannot prove every branch. The declaration rewriter parses TypeScript module specifiers, including import-equals references, preserves ordinary comments and string literal types, maps `.d.ts` targets to `.js` and `.d.mts` targets to `.mjs`, and resolves directory indexes without adding duplicate slashes. Triple-slash `reference path` directives retain declaration extensions because TypeScript resolves them as declaration files, not runtime modules.
