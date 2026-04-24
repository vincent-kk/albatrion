# /generate-package-docs - Package Documentation Generator

This command generates or updates documentation, skills, and optional consumer rules for a given package path.

## Usage

```bash
# Basic (skill + SPECIFICATION only)
/generate-package-docs {package-path}

# With optional consumer rules
/generate-package-docs {package-path} --rules

# Examples
/generate-package-docs packages/lerx/promise-modal
/generate-package-docs packages/winglet/react-utils
/generate-package-docs packages/winglet/common-utils
/generate-package-docs packages/canard/schema-form --rules
```

**Flag policy**

- `--rules` MUST be passed explicitly to create or update `docs/claude/rules/{slug}-rule.md`.
- If `--rules` is absent, rules artifacts are left untouched — even when a rules file already exists.
- Rationale: consumer-authored rule content MUST NOT be silently overwritten. Opt-in only.

## Overview

This command automates the creation and maintenance of package documentation:

- **CREATE Mode**: When `docs/` does not exist → analyze the package and generate all artifacts from templates.
- **UPDATE Mode**: When `docs/` exists → re-analyze the package and, per file, prompt the user for **Delta merge** vs **Template regenerate**.

Scope of artifacts:

- Skill bundle: `docs/claude/skills/{slug}-skill/SKILL.md` + `knowledge/*.md`
- Specification: `docs/en/SPECIFICATION.md` + `docs/ko/SPECIFICATION.md`
- Consumer rules (opt-in via `--rules`): `docs/claude/rules/{slug}-rule.md`

Note: This command does NOT generate any files under `docs/claude/commands/`. Slash commands are not part of the per-package artifact set.

---

## Slug Convention

`{slug}` is the kebab-case package name derived from `package.json`'s `name`:

| `name` | `{slug}` |
|---|---|
| `@canard/schema-form` | `schema-form` |
| `@winglet/common-utils` | `common-utils` |
| `@lerx/promise-modal` | `promise-modal` |

Derive with:

```bash
PKG_NAME=$(node -p "require('./$PACKAGE_PATH/package.json').name")
SLUG="${PKG_NAME##*/}"
```

All generated paths and identifiers use `{slug}`. Never mix `expert/`, generic, or scoped names.

---

## Phase 1: Pre-Execution Checks

### 1.1 Package Path Validation & Flag Parsing

```bash
PACKAGE_PATH=""
WITH_RULES="false"

for arg in "$@"; do
  case "$arg" in
    --rules) WITH_RULES="true" ;;
    --*)     echo "❌ Unknown flag: $arg"; exit 1 ;;
    *)       [ -z "$PACKAGE_PATH" ] && PACKAGE_PATH="$arg" ;;
  esac
done

if [ -z "$PACKAGE_PATH" ]; then
  echo "❌ Package path is required"
  exit 1
fi

if [ ! -d "$PACKAGE_PATH" ]; then
  echo "❌ Package directory not found: $PACKAGE_PATH"
  exit 1
fi

if [ ! -f "$PACKAGE_PATH/package.json" ]; then
  echo "❌ package.json not found in $PACKAGE_PATH"
  exit 1
fi

if [ ! -f "$PACKAGE_PATH/README.md" ]; then
  echo "⚠️ README.md not found — will generate from source analysis"
fi

PKG_NAME=$(node -p "require('./$PACKAGE_PATH/package.json').name")
SLUG="${PKG_NAME##*/}"
echo "📦 Package: $PKG_NAME  → slug: $SLUG  (rules: $WITH_RULES)"
```

### 1.2 Mode Detection

```bash
DOCS_PATH="$PACKAGE_PATH/docs"

if [ -d "$DOCS_PATH" ]; then
  MODE="UPDATE"
  echo "🔄 Mode: UPDATE (existing documentation found)"
else
  MODE="CREATE"
  echo "🆕 Mode: CREATE (no existing documentation)"
fi
```

### 1.3 Existing Files Detection (UPDATE Mode)

```bash
if [ "$MODE" = "UPDATE" ]; then
  SKILL_FILE="$DOCS_PATH/claude/skills/${SLUG}-skill/SKILL.md"
  KNOWLEDGE_DIR="$DOCS_PATH/claude/skills/${SLUG}-skill/knowledge"
  KNOWLEDGE_FILES=$(find "$KNOWLEDGE_DIR" -name "*.md" 2>/dev/null)
  EN_SPEC="$DOCS_PATH/en/SPECIFICATION.md"
  KO_SPEC="$DOCS_PATH/ko/SPECIFICATION.md"
  RULES_FILE="$DOCS_PATH/claude/rules/${SLUG}-rule.md"

  echo "📁 Existing files detected:"
  [ -f "$SKILL_FILE" ]   && echo "  - Expert Skill: $SKILL_FILE"
  [ -n "$KNOWLEDGE_FILES" ] && echo "  - Knowledge Files: $(echo "$KNOWLEDGE_FILES" | wc -l) files"
  [ -f "$EN_SPEC" ]      && echo "  - English Spec: $EN_SPEC"
  [ -f "$KO_SPEC" ]      && echo "  - Korean Spec: $KO_SPEC"
  [ -f "$RULES_FILE" ]   && echo "  - Consumer Rules: $RULES_FILE ($([ "$WITH_RULES" = "true" ] && echo "in scope" || echo "IGNORED — pass --rules to include"))"
fi
```

### 1.4 Rules Generation Decision (flag-only)

Rules generation is strictly controlled by the `--rules` flag:

| Flag | Rules file absent | Rules file present |
|---|---|---|
| `--rules` | Create via template | Update via per-file strategy (see §1.5) |
| (omitted) | Skip entirely | **Leave untouched** — diff 0 |

There is no prompt fallback. If the user forgets the flag, rules artifacts are ignored even when they already exist. This is intentional.

### 1.5 UPDATE Strategy Decision (per-file)

For every artifact that already exists in UPDATE mode, call `AskUserQuestion` with two options:

- **Delta merge** (recommended) — preserve hand-written content, append newly discovered APIs / topics / sections only.
- **Template regenerate** — overwrite file with freshly rendered template (erases manual work).

Prompt scope:

- `SKILL.md` — always, when it exists.
- Each existing `knowledge/*.md` — once per file.
- `en/SPECIFICATION.md` and `ko/SPECIFICATION.md` — once each.
- `rules/{slug}-rule.md` — **only when `--rules` is set** AND the file exists.

If a target file does not exist yet, skip the prompt and generate from template.

---

## Phase 2: Package Analysis

### 2.1 Source Code Structure Analysis

Analyze:

```
{package-path}/
├── src/
│   ├── index.ts          # Main exports
│   ├── **/*.ts           # Source files
│   └── **/*.tsx          # React components (if any)
├── package.json
├── README.md
├── CLAUDE.md
├── stories/              # Storybook stories (if any)
└── src/**/__tests__/     # Test files
```

### 2.2 Information Extraction

1. **Package Metadata** — name, version, description, dependencies, peer dependencies.
2. **Architecture** — directory structure, design patterns, layer organization.
3. **API Surface** — functions, classes, hooks, components, types/interfaces.
4. **Usage Patterns** — basic usage, advanced patterns, customization examples drawn from README and stories.
5. **Consumer Invariants** (only when `--rules` is set):
   - Silent-bug shapes: misuse that compiles but breaks at runtime (e.g. unstable references, missing cleanup, mixed rendering surfaces).
   - Public API boundary: which deep imports or internal members must be avoided.
   - State ownership: where mirroring state into external stores causes drift.
   - Decision routing: which topics MUST delegate to the `{slug}-skill` skill rather than being answered from memory.

---

## Phase 3: Document Generation / Update

### 3.1 Directory Structure

Produce only the files in scope:

```
{package-path}/docs/
├── claude/
│   ├── rules/                               # only when --rules is set
│   │   └── {slug}-rule.md
│   └── skills/
│       └── {slug}-skill/
│           ├── SKILL.md
│           └── knowledge/
│               ├── {topic-1}.md             # kebab-case
│               ├── {topic-2}.md
│               └── ...
├── en/
│   └── SPECIFICATION.md
└── ko/
    └── SPECIFICATION.md
```

### 3.2 File Templates

#### Skill Template: `claude/skills/{slug}-skill/SKILL.md`

```markdown
---
name: {slug}-skill
description: "Expert knowledge base for @{package-name}. Triggers on {symbol-1}, {symbol-2}, {concept-1}, {concept-2}, ... — enumerate concrete API names, types, and concepts that should invoke this skill."
user-invocable: false
---

# {Package Display Name} Expert

Knowledge base for `@{package-name}`. Answer questions, show usage examples, and diagnose issues by routing to the right knowledge file in `knowledge/`.

## How to Use This Skill

1. Identify the topic in the user's question.
2. Locate the matching knowledge file using the Topic Router below.
3. Load that knowledge file and any related files listed in the router.
4. Answer with a concept explanation, a concrete code example, and references to the knowledge file(s) used.

Do not inline full interface definitions or long examples from knowledge files into the answer — cite them and quote only the minimal relevant snippet.

## Topic Router

| Topic keywords in user question | Knowledge file |
|---|---|
| `{keyword-a}`, `{keyword-b}` | `knowledge/{topic-1}.md` |
| `{keyword-c}`, `{keyword-d}` | `knowledge/{topic-2}.md` |

## Architecture Cheat Sheet

Summarize the subsystem map, resolution priorities, or sub-path import table that best fits this package:

- **Application / React library** (e.g. schema-form, promise-modal): document subsystems, resolution priorities, API primitives, plugin surface.
- **Utility library** (e.g. common-utils): document sub-path import map and per-sub-path key exports.

## Answer Format

1. **Concept** — one-paragraph explanation rooted in the cited knowledge file.
2. **Example** — minimal code snippet that compiles against the public API.
3. **References** — `knowledge/<file>.md` and any relevant story/test file.

## Reference Map

| Resource | Path |
|---|---|
| Full specification (Korean) | `{package-path}/docs/ko/SPECIFICATION.md` |
| Full specification (English) | `{package-path}/docs/en/SPECIFICATION.md` |
| Storybook examples (if any) | `{package-path}/stories/*.stories.tsx` |
| Unit tests | `{package-path}/src/**/__tests__/*.test.ts` |
| Package CLAUDE.md | `{package-path}/CLAUDE.md` |
```

**Frontmatter rules**

- `name` MUST be `{slug}-skill`.
- `description` MUST list concrete trigger keywords (API names, concepts, symbols) separated by commas. Avoid generic marketing copy.
- `user-invocable` MUST be `false` — the skill is loaded via topic routing, not a user-invoked slash command.

#### Knowledge Files Template: `claude/skills/{slug}-skill/knowledge/{topic}.md`

Knowledge files are topic-specific deep-dives referenced by the expert skill. Each file owns one feature or concept.

**File naming**: kebab-case (e.g. `computed-properties.md`, `async-utils.md`, `hooks-reference.md`).

**Template structure**:

```markdown
# {Topic Name}

Expert knowledge for {topic} features in @{package-name}.

## Overview

{Brief description of the topic and when to use it.}

## API Reference

### {Symbol 1}

​```typescript
{type signature}
​```

{description and usage}

**Parameters**
- `param1` — {description}

**Returns** {return value}

**Example**
​```typescript
{code example}
​```

## Common Patterns

### {Pattern Name}

{description + code example}

## Troubleshooting

### {Symptom}

**Cause** {why it happens}
**Fix** {how to resolve}

## Related

- `knowledge/{related-topic}.md`
```

**Suggested topic inventory** (pick the relevant subset for the package):
`getting-started.md`, `core-concepts.md`, `api-reference.md`, `advanced-patterns.md`, `performance.md`, `troubleshooting.md`, `testing.md`, `migration.md`.

#### Rules Template: `claude/rules/{slug}-rule.md`  *(only when `--rules` is set)*

Consumer-facing rules are **perspective-level**: they describe the mental model, invariants, and anti-patterns required to use the package correctly. They do not duplicate API shapes from the skill.

**Reference original**: `packages/canard/schema-form/docs/claude/rules/schema-form-rule.md`.

**Structure**:

```markdown
# {Package Display Name} Consumer Rules

These rules apply when authoring application code that imports from `@{package-name}`.
They do not apply to plugin authoring (if applicable) or to work inside the library itself.
Rules are perspective-level. For concrete API shapes, defaults, and edge behavior, invoke the `{slug}-skill` skill; §3 lists the topics that trigger that invocation.

---

## 1. Mental Model

### {principle-name}

- {Core principle stated as an imperative.}
- {Consequence of violation.}

---

## 2. Composition / Core Concepts

{Topology, resolution order, state ownership, lifecycle — the structural facts that govern correct usage. Use tables or bullet lists.}

---

## 3. Decision Routing

When the task touches any of these areas, invoke the `{slug}-skill` skill.
The skill owns the concrete API shapes, defaults, and edge behavior.
Do not attempt to answer these from memory.

- {trigger topic 1}
- {trigger topic 2}

---

## 4. Invariants

Each rule is a single hard requirement. Violations typically produce silent bugs, not compile errors.

### {invariant-name}

- {MUST statement.}
- Why: {consequence of violation — what breaks silently.}

---

## 5. Red Flags

Reject these on sight.

- {anti-pattern 1} → violates `{invariant-name}`.
- {anti-pattern 2} → ...

---

## 6. Extending the Knowledge

- For {adjacent topic A}, invoke the `{adjacent-skill}` skill.
- For topics outside the `{slug}-skill` skill's coverage → consult `{package-path}/docs/en/SPECIFICATION.md`.
- For package-internal structural rules (FCA) → see `.claude/rules/filid_fca-policy.md`. Scope is disjoint: this document is for consumers.
```

**Rules content policy**

- Document only consumer-facing concerns (people who `import` from the package).
- Keep each rule body short (≤5 lines). Link to skill knowledge for depth.
- Every invariant MUST include a `Why:` line describing the consequence of violation.
- Do not restate API signatures — route to the skill via §3.

#### SPECIFICATION Template (English): `en/SPECIFICATION.md`

```markdown
# {Package Display Name} Specification

> {Short description}

## Overview

{Detailed description and purpose}

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Core API](#core-api)
5. [Hooks](#hooks)
6. [Components](#components)
7. [Type Definitions](#type-definitions)
8. [Usage Patterns](#usage-patterns)
9. [Advanced Examples](#advanced-examples)

---

## Installation
{…}

## Quick Start
{…}

## Architecture
{…}

## Core API
{…}

## Hooks
{…}

## Components
{…}

## Type Definitions
{…}

## Usage Patterns
{…}

## Advanced Examples
{…}

---

## License
{…}
```

#### SPECIFICATION Template (Korean): `ko/SPECIFICATION.md`

Same structure as English, translated into Korean.

---

## Phase 4: Verification

### 4.1 File Existence Check

```bash
CORE_FILES=(
  "$DOCS_PATH/claude/skills/${SLUG}-skill/SKILL.md"
  "$DOCS_PATH/en/SPECIFICATION.md"
  "$DOCS_PATH/ko/SPECIFICATION.md"
)

echo "📝 Core documentation files:"
for file in "${CORE_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
  fi
done

KNOWLEDGE_DIR="$DOCS_PATH/claude/skills/${SLUG}-skill/knowledge"
if [ -d "$KNOWLEDGE_DIR" ]; then
  KNOWLEDGE_COUNT=$(find "$KNOWLEDGE_DIR" -name "*.md" 2>/dev/null | wc -l)
  echo ""
  echo "📚 Knowledge files: $KNOWLEDGE_COUNT"
  find "$KNOWLEDGE_DIR" -name "*.md" -exec basename {} \; | sed 's/^/  - /'
else
  echo "⚠️ Knowledge directory not found: $KNOWLEDGE_DIR"
fi

if [ "$WITH_RULES" = "true" ]; then
  RULES_FILE="$DOCS_PATH/claude/rules/${SLUG}-rule.md"
  echo ""
  if [ -f "$RULES_FILE" ]; then
    echo "📏 Consumer rules: ✅ $RULES_FILE"
  else
    echo "📏 Consumer rules: ❌ Missing $RULES_FILE"
  fi
fi
```

### 4.2 Content Completeness Check

Verify that documentation covers:

- [ ] All exported functions
- [ ] All exported hooks
- [ ] All exported components
- [ ] All exported types
- [ ] Usage examples for each major API
- [ ] Troubleshooting section

When `--rules` is set, additionally verify:

- [ ] Mental Model section documents the library's core invariants
- [ ] Decision Routing lists the `{slug}-skill` skill as the depth resource
- [ ] Every invariant entry includes a `Why:` line

---

## Output Format

### CREATE Mode Success

```
✅ Package documentation generated successfully!

📦 Package: {package-name}
📂 Path: {package-path}
🔄 Mode: CREATE (new documentation)
🏷️  Rules: {generated | skipped — pass --rules to include}

📊 Analysis Results:
- Core APIs: X functions
- Hooks: X hooks
- Components: X components
- Types: X interfaces

📁 Generated Files:
├── docs/claude/skills/{slug}-skill/SKILL.md
├── docs/claude/skills/{slug}-skill/knowledge/
│   ├── {topic-1}.md
│   ├── {topic-2}.md
│   └── ... (X knowledge files)
├── docs/en/SPECIFICATION.md
├── docs/ko/SPECIFICATION.md
[and, only when --rules was set:]
└── docs/claude/rules/{slug}-rule.md

💡 Next Steps:
1. Review generated documentation
2. Validate that the skill is invoked on expected topics
3. Update CLAUDE.md to reference the new docs if needed
```

### UPDATE Mode Success

```
✅ Package documentation updated successfully!

📦 Package: {package-name}
📂 Path: {package-path}
🔄 Mode: UPDATE (existing documentation)
🏷️  Rules: {updated | skipped — pass --rules to include}

📊 Changes Detected:
- New APIs: X ({list})
- Modified APIs: X ({list})
- Removed APIs: X ({list})

📁 Updated Files (per-file strategy shown):
├── docs/claude/skills/{slug}-skill/SKILL.md ✏️  [Delta]
├── docs/claude/skills/{slug}-skill/knowledge/
│   ├── {topic-1}.md  [Delta]
│   ├── {topic-2}.md  [New]
│   └── ...
├── docs/en/SPECIFICATION.md ✏️  [Regenerated]
├── docs/ko/SPECIFICATION.md ✏️  [Regenerated]
[and, only when --rules was set:]
└── docs/claude/rules/{slug}-rule.md ✏️  [Delta]

💡 Summary:
{change summary}
```

### Failure Output

```
❌ Package documentation generation failed

🔍 Cause:
- {error description}

💡 Resolution:
{resolution steps}
```

---

## Execution Workflow

When this command is invoked:

1. **Parse Input**
   - Extract package path and flags (`--rules`)
   - Validate path exists and contains a `package.json`

2. **Pre-Execution Checks**
   - Derive `{slug}` from `package.json` name (`@scope/name` → `name`)
   - Determine CREATE or UPDATE mode
   - Identify existing documentation per artifact type
   - Decide whether rules are in scope (flag-only)

3. **Package Analysis**
   - Read `package.json` for metadata
   - Analyze `src/` directory structure
   - Extract exports from `src/index.ts`
   - Parse `README.md` and `CLAUDE.md`
   - Analyze `stories/` if present
   - When `--rules` is set, additionally collect consumer invariants and red flags

4. **Strategy Decision (UPDATE only)**
   - For each existing target artifact, prompt Delta merge vs Template regenerate
   - Skip the prompt for artifacts that do not exist yet
   - Never prompt for rules unless `--rules` was passed

5. **Document Generation / Update**
   - CREATE mode: render templates
   - UPDATE mode: apply per-file strategy selected in step 4

6. **Verification**
   - Check all required files exist
   - Verify API coverage
   - Output results

---

## Language Policy

All documentation follows a consistent language policy:

- **Claude artifacts**: English only
  - `claude/skills/{slug}-skill/SKILL.md`: English
  - `claude/skills/{slug}-skill/knowledge/*.md`: English
  - `claude/rules/{slug}-rule.md`: English
  - Rationale: Claude works best with English technical documentation.

- **User documentation (SPECIFICATION)**: Bilingual
  - `en/SPECIFICATION.md`: English
  - `ko/SPECIFICATION.md`: Korean
  - Rationale: End-user documentation should support multiple languages.

---

## Related Commands

- `/code-review` — Review code changes
- `/create-pr` — Create pull request
- `/analyze-requirements` — Requirements analysis

---

## Troubleshooting

### "Package directory not found"

- Verify the path is correct.
- Use a relative path from the repository root.
- Example: `packages/lerx/promise-modal`, not `/absolute/path`.

### "No exports found"

- Ensure `src/index.ts` exists and has exports.
- Check whether the package uses a different export entry (update the analysis target accordingly).

### "README.md not found"

- The command still works but produces less detailed docs.
- Consider adding `README.md` first for better results.

### "Rules file exists but I ran without --rules and nothing happened"

- Expected behavior. Rules generation is strictly opt-in.
- Re-run with `--rules` to update the rules artifact.

### "Skill directory has the old `expert/` name in an existing package"

- The 4 first-party packages already use `{slug}-skill/`. If you encounter a legacy `expert/` directory in an unfamiliar package, rename it manually first. This command does not migrate it automatically (by design — no silent structural moves).

---

## Notes

- This command uses the Task tool with Explore agent for codebase analysis.
- Analysis results are cached in memory during execution.
- For large packages, execution may take longer.
- Generated documentation should be reviewed before committing.
