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

Declarative rules. `filid_module-documents`, `filid_verification-records` and `seiri_test-validity` load only for files matching their `paths:` frontmatter; the others load at session start.

| Family    | Files                                                                                                                                                   |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `seiri_*` | `agent-legible`, `code-comments`, `context-efficiency`, `function-boundaries`, `naming`, `public-contract`, `reuse-first`, `structure`, `test-validity` |
| `filid_*` | `code-placement`, `fractal-boundaries`, `module-documents`, `verification-records`                                                                      |

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

## 📝 Document Principles

Owner principles for every document this repository authors for a person or an agent: module documents (`INTENT.md`, `DETAIL.md`), `CLAUDE.md` and `AGENTS.md`, the repository skills and commands under `.claude/`, packaged agent documents (`packages/*/docs/agents/**`), package documentation and the documentation site. Change records (commit messages, pull request descriptions, `.changeset/` entries and release notes) record history by design and are outside these principles, as are the plugin-managed rule files under `.claude/rules/` and their copies in `AGENTS.md`. Per the precedence above, these principles outrank `.claude/rules/`.

1. **Record what the reader cannot establish.** Every mental model, policy, invariant, rejected alternative, known limit and other idea that the intended reader cannot establish from what they hold (principle 2) is written down with its reason, and a rule also names the failure it prevents. Reasons and change permissions (`Always do`, `Ask first`, `Never do`) stay even when the behavior they govern is visible in code. When it is unclear whether the reader would establish something correctly, keep it.
2. **Omit what the reader derives.** A maintainer holds the source and tests; a consumer holds the published types, names and documents. A restatement of what that reader derives directly is a second copy that drifts, and stays out. To decide a sentence, ask whether deleting it raises the chance that this reader acts wrongly; if it does not, delete it.
3. **The present, and true.** Documents describe current behavior; history lives in commit messages. There is no `## History` section, dated note or "previously" (this overrides section 6, the opening summary and the closing line of `filid_module-documents`, and the changelog and module-document options in `seiri_code-comments` section 1). The `## Last Updated` heading that filid requires stays, and its body states what triggers an update, never a date. A decision and its reason are present facts; when and how the decision was reached is history, and a demotion that `filid_fractal-boundaries` asks the parent to record is written as the parent's present decision. Every behavioral claim holds for the current code with its conditions intact. Code examples under `docs/agents/**` are copied from tests that run; examples elsewhere are checked against the current API whenever they are written or changed. Each stated limit is grounded in code or a test that the pull request description cites, and the document names that code or test only when its reader can open it.
4. **One home per fact.** Each fact lives in the one document its reader opens; other documents refer to it instead of restating it. A mirror that a host requires, such as `AGENTS.md` for this file, names its canonical source and changes with it. A translation keeps its source's structure and changes with it in the same pull request; it is not a second home.
5. **Sized for attention.** Always-loaded text stays short: an `INTENT.md` within 50 lines, a rule under `packages/*/docs/agents/rules/` within 40. Detail sits one link away, in a document whose name states its purpose. A document still over budget after principle 2 has removed what its reader derives is split by reader or purpose; required content is never dropped to fit.
6. **Changed with the code.** A change that alters a documented policy updates its document in the same pull request, before the code. A mismatch between a document and the code is a defect, fixed like a bug.
7. **Judged by a fresh agent.** The packaged agent rules and skills and the module documents are done when an agent with no prior context does its role's job correctly from fixed inputs: the role's documents, plus the public declarations and tooling for a consumer, plus the source and tests for a maintainer. A consumer builds the requested feature through the public API, advanced features included; a maintainer makes the right change decision for the right reason. When a pull request changes what these documents teach, an evaluator other than the writer runs this check: it withholds solutions, grading and anything the role does not hold, counts a task only when it actually passes, compares with a run whose inputs differ only by the absence of the document, keeps some tasks unseen by the writer, and fixes a failure at its general cause rather than by adding that task's answer. Every other document is written to pass the same test.

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
