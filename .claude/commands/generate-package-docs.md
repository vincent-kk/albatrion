# /generate-package-docs - Package Documentation Generator

This command generates or updates documentation, skills, and commands for a given package path.

## Usage

```bash
# Basic usage
/generate-package-docs {package-path}

# Examples
/generate-package-docs packages/lerx/promise-modal
/generate-package-docs packages/winglet/react-utils
/generate-package-docs packages/canard/schema-form
```

## Overview

This command automates the creation and maintenance of package documentation:

- **CREATE Mode**: When `docs/` doesn't exist → Analyzes package and generates all documentation
- **UPDATE Mode**: When `docs/` exists → Re-analyzes and updates existing documentation

---

## Phase 1: Pre-Execution Checks

### 1.1 Package Path Validation

```bash
PACKAGE_PATH="$1"

# Check if directory exists
if [ ! -d "$PACKAGE_PATH" ]; then
  echo "❌ Package directory not found: $PACKAGE_PATH"
  exit 1
fi

# Check for package.json
if [ ! -f "$PACKAGE_PATH/package.json" ]; then
  echo "❌ package.json not found in $PACKAGE_PATH"
  exit 1
fi

# Check for README.md (optional but recommended)
if [ ! -f "$PACKAGE_PATH/README.md" ]; then
  echo "⚠️ README.md not found - will generate from source analysis"
fi
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
  # Check for existing documentation files
  SKILL_FILE="$DOCS_PATH/claude/skills/expert/SKILL.md"
  COMMAND_FILE="$DOCS_PATH/claude/commands/guide.md"
  KNOWLEDGE_FILES=$(find "$DOCS_PATH/claude/skills/expert/knowledge" -name "*.md" 2>/dev/null)
  EN_SPEC="$DOCS_PATH/en/SPECIFICATION.md"
  KO_SPEC="$DOCS_PATH/ko/SPECIFICATION.md"

  echo "📁 Existing files detected:"
  [ -f "$SKILL_FILE" ] && echo "  - Expert Skill: $SKILL_FILE"
  [ -f "$COMMAND_FILE" ] && echo "  - Guide Command: $COMMAND_FILE"
  [ -n "$KNOWLEDGE_FILES" ] && echo "  - Knowledge Files: $(echo "$KNOWLEDGE_FILES" | wc -l) files"
  [ -f "$EN_SPEC" ] && echo "  - English Spec: $EN_SPEC"
  [ -f "$KO_SPEC" ] && echo "  - Korean Spec: $KO_SPEC"
fi
```

---

## Phase 2: Package Analysis

### 2.1 Source Code Structure Analysis

Analyze the following files and directories:

```
{package-path}/
├── src/
│   ├── index.ts          # Main exports
│   ├── **/*.ts           # Source files
│   └── **/*.tsx          # React components
├── package.json          # Package metadata
├── README.md             # Existing documentation
├── CLAUDE.md             # Claude-specific instructions
├── stories/              # Storybook stories (if exists)
└── src/*/tests/          # Test files
```

### 2.2 Information Extraction

Extract the following information:

1. **Package Metadata** (from package.json):
   - Package name
   - Version
   - Description
   - Dependencies
   - Peer dependencies

2. **Architecture** (from source code):
   - Directory structure
   - Design patterns used
   - Layer organization

3. **API Surface** (from exports):
   - Functions
   - Classes
   - Hooks
   - Components
   - Types/Interfaces

4. **Usage Patterns** (from README/stories):
   - Basic usage examples
   - Advanced patterns
   - Customization options

---

## Phase 3: Document Generation/Update

### 3.1 Directory Structure

Create the following structure if not exists:

```
{package-path}/docs/
├── claude/
│   ├── skills/
│   │   └── expert/
│   │       ├── SKILL.md
│   │       └── knowledge/
│   │           ├── {topic-1}.md
│   │           ├── {topic-2}.md
│   │           └── ...
│   └── commands/
│       └── guide.md
├── en/
│   └── SPECIFICATION.md
└── ko/
    └── SPECIFICATION.md
```

### 3.2 File Templates

#### Skills Template: `claude/skills/expert/SKILL.md`

```markdown
---
name: {package-name-slug}-expert
description: "@{package-name} library expert. Provides Q&A, usage examples, and troubleshooting by referencing all knowledge files."
user-invocable: false
---

# {Package Display Name} Expert Skill

This is an expert skill for @{package-name}. This skill answers questions about the {package-name} library, provides usage examples, and assists with troubleshooting.

## Skill Info

- **Name**: {package-name-slug}-expert
- **Purpose**: @{package-name} library Q&A and guidance
- **Triggers**: `/{package-name-slug}` command or {package-name} related questions

---

## Knowledge Files Reference

Refer to the following knowledge files for detailed guides by feature:

| File | Topics | Load When |
|------|--------|-----------|
| `knowledge/{topic-1}.md` | {topic-1 description} | {when to load topic-1} |
| `knowledge/{topic-2}.md` | {topic-2 description} | {when to load topic-2} |
| `knowledge/{topic-3}.md` | {topic-3 description} | {when to load topic-3} |

---

## Knowledge Base

### Core Architecture

{architecture analysis from package}

### Key Interfaces

```typescript
{extracted key interfaces and types}
```

### Usage Patterns

{extracted usage patterns from README/stories}

---

## Common Questions

### Installation & Setup

{installation and setup guidance}

### Basic Usage

{basic usage examples}

### Advanced Features

{advanced features overview}

### Troubleshooting

{common issues and solutions}
```

#### Commands Template: `claude/commands/guide.md`

```markdown
# @{package-name} Q&A Command

**Package**: `@{package-name}`
**Expert Skill**: `{package-name-slug}-expert` (directory-based skill)

Ask questions about @{package-name} and get answers through the `/{package-name-slug}` command.

## Usage

```
/{package-name-slug} [question or topic]
```

## Examples

```
/{package-name-slug} How to get started?
/{package-name-slug} What is the main API?
/{package-name-slug} How to customize components?
/{package-name-slug} How to handle errors?
```

## Supported Topics

### Basic Concepts
- Installation and setup
- Main component usage
- Basic examples

### Core Features
- {Feature 1}
- {Feature 2}
- {Feature 3}

### Advanced Features
- {Advanced Feature 1}
- {Advanced Feature 2}
- {Advanced Feature 3}

### Troubleshooting
- Frequently asked questions
- Common problem resolution
- Performance optimization
- Debugging tips

## Knowledge Sources

For more detailed information, you can check the in-depth knowledge in the following related skills:

| Topic | Knowledge File |
|------|-----------|
| Comprehensive guide | `{package-name-slug}-expert` (directory skill) |
| {Topic 1} | `knowledge/{topic-1}.md` |
| {Topic 2} | `knowledge/{topic-2}.md` |
| {Topic 3} | `knowledge/{topic-3}.md` |

Full API specifications are available in the SPECIFICATION documents:
- English: `en/SPECIFICATION.md`
- Korean: `ko/SPECIFICATION.md`
```

#### Knowledge Files Template: `claude/skills/expert/knowledge/{topic}.md`

Knowledge files are detailed topic-specific guides referenced by the expert skill. Each file should focus on a single feature or concept.

**File naming convention:** Use kebab-case (e.g., `computed-properties.md`, `validation-system.md`, `event-handling.md`)

**Template structure:**

```markdown
# {Topic Name} Knowledge

Expert knowledge for {topic} features in @{package-name}.

## Overview

{Brief description of the topic and when to use it}

## Basic Concepts

### Concept 1

{Explanation with code examples}

### Concept 2

{Explanation with code examples}

---

## API Reference

### Function/Hook/Component 1

```typescript
{Type signature}
```

{Description and usage}

**Parameters:**
- `param1` - {description}
- `param2` - {description}

**Returns:** {return value description}

**Example:**

```typescript
{code example}
```

### Function/Hook/Component 2

{Similar structure}

---

## Common Patterns

### Pattern 1: {Pattern Name}

{Description and use case}

```typescript
{code example}
```

### Pattern 2: {Pattern Name}

{Description and use case}

```typescript
{code example}
```

---

## Best Practices

1. **{Practice 1}**: {Description}
2. **{Practice 2}**: {Description}
3. **{Practice 3}**: {Description}

---

## Troubleshooting

### Issue 1: {Issue Description}

**Symptom:** {What the user sees}

**Cause:** {Why it happens}

**Solution:** {How to fix it}

```typescript
{code example if applicable}
```

### Issue 2: {Issue Description}

{Similar structure}

---

## Related Topics

- See `knowledge/{related-topic-1}.md` for {related topic 1}
- See `knowledge/{related-topic-2}.md` for {related topic 2}
- See main SPECIFICATION for comprehensive API reference
```

**Example topics to create:**
- `getting-started.md` - Installation and basic setup
- `core-concepts.md` - Fundamental concepts and architecture
- `api-reference.md` - Core API functions and hooks
- `advanced-patterns.md` - Complex usage patterns
- `performance.md` - Performance optimization techniques
- `troubleshooting.md` - Common issues and solutions
- `testing.md` - Testing strategies and examples
- `migration.md` - Migration guides from previous versions

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

{installation instructions}

## Quick Start

{quick start guide with code examples}

## Architecture

{architecture overview with diagrams}

## Core API

{detailed API documentation}

## Hooks

{hooks documentation}

## Components

{components documentation}

## Type Definitions

{type definitions}

## Usage Patterns

{usage pattern examples}

## Advanced Examples

{advanced examples}

---

## License

{license info}
```

#### SPECIFICATION Template (Korean): `ko/SPECIFICATION.md`

Same structure as English but with Korean translations.

---

## Phase 4: Verification

### 4.1 File Existence Check

```bash
# Verify all files were created/updated
FILES=(
  "$DOCS_PATH/claude/skills/expert/SKILL.md"
  "$DOCS_PATH/claude/commands/guide.md"
  "$DOCS_PATH/en/SPECIFICATION.md"
  "$DOCS_PATH/ko/SPECIFICATION.md"
)

echo "📝 Checking core documentation files:"
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
  fi
done

# Check for knowledge files
KNOWLEDGE_DIR="$DOCS_PATH/claude/skills/expert/knowledge"
if [ -d "$KNOWLEDGE_DIR" ]; then
  KNOWLEDGE_COUNT=$(find "$KNOWLEDGE_DIR" -name "*.md" 2>/dev/null | wc -l)
  echo ""
  echo "📚 Knowledge files: $KNOWLEDGE_COUNT"
  if [ "$KNOWLEDGE_COUNT" -gt 0 ]; then
    echo "Knowledge topics:"
    find "$KNOWLEDGE_DIR" -name "*.md" -exec basename {} \; | sed 's/^/  - /'
  fi
else
  echo "⚠️ Knowledge directory not found: $KNOWLEDGE_DIR"
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

---

## Output Format

### CREATE Mode Success

```
✅ Package documentation generated successfully!

📦 Package: {package-name}
📂 Path: {package-path}
🔄 Mode: CREATE (new documentation)

📊 Analysis Results:
- Core APIs: X functions
- Hooks: X hooks
- Components: X components
- Types: X interfaces

📁 Generated Files:
├── docs/claude/skills/expert/SKILL.md
├── docs/claude/skills/expert/knowledge/
│   ├── {topic-1}.md
│   ├── {topic-2}.md
│   └── ... (X knowledge files)
├── docs/claude/commands/guide.md
├── docs/en/SPECIFICATION.md
└── docs/ko/SPECIFICATION.md

💡 Next Steps:
1. Review generated documentation
2. Test skill with: /{package-name-slug}
3. Update CLAUDE.md to reference new docs
```

### UPDATE Mode Success

```
✅ Package documentation updated successfully!

📦 Package: {package-name}
📂 Path: {package-path}
🔄 Mode: UPDATE (existing documentation)

📊 Changes Detected:
- New APIs: X ({list})
- Modified APIs: X ({list})
- Removed APIs: X ({list})

📁 Updated Files:
├── docs/claude/skills/expert/SKILL.md ✏️
├── docs/claude/skills/expert/knowledge/ ✏️
│   ├── {topic-1}.md (updated)
│   ├── {topic-2}.md (new)
│   └── ... (X files updated/added)
├── docs/claude/commands/guide.md ✏️
├── docs/en/SPECIFICATION.md ✏️
└── docs/ko/SPECIFICATION.md ✏️

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
   - Extract package path from arguments
   - Validate path exists

2. **Pre-Execution Checks**
   - Validate package structure
   - Determine CREATE or UPDATE mode
   - Identify existing documentation

3. **Package Analysis**
   - Read package.json for metadata
   - Analyze src/ directory structure
   - Extract exports from index.ts
   - Parse README.md and CLAUDE.md
   - Analyze stories/ if exists

4. **Document Generation**
   - CREATE mode: Generate all files from scratch
   - UPDATE mode: Compare current spec with docs, update differences

5. **Verification**
   - Check all files exist
   - Verify API coverage
   - Output results

---

## Language Policy

All documentation follows a consistent language policy:

- **Claude documents**: English only
  - `claude/skills/expert/SKILL.md`: English
  - `claude/skills/expert/knowledge/*.md`: English
  - `claude/commands/guide.md`: English
  - **Rationale**: Claude works best with English technical documentation

- **User documentation (SPECIFICATION)**: Bilingual
  - `en/SPECIFICATION.md`: English
  - `ko/SPECIFICATION.md`: Korean
  - **Rationale**: End-user documentation should support multiple languages

---

## Related Commands

- `/code-review` - Review code changes
- `/create-pr` - Create pull request
- `/analyze-requirements` - Requirements analysis

---

## Troubleshooting

### "Package directory not found"

- Verify the path is correct
- Use relative path from repository root
- Example: `packages/lerx/promise-modal` not `/absolute/path`

### "No exports found"

- Ensure `src/index.ts` exists and has exports
- Check if package uses different export pattern

### "README.md not found"

- Command will still work but may produce less detailed docs
- Consider adding README.md first for better results

---

## Notes

- This command uses the Task tool with Explore agent for codebase analysis
- Analysis results are cached in memory during execution
- For large packages, execution may take longer
- Generated documentation should be reviewed before committing
