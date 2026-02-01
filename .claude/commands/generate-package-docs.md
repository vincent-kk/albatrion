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
  SKILL_FILES=$(find "$DOCS_PATH/claude/skills" -name "*.md" 2>/dev/null)
  COMMAND_FILES=$(find "$DOCS_PATH/claude/commands" -name "*.md" 2>/dev/null)
  EN_SPEC="$DOCS_PATH/en/SPECIFICATION.md"
  KO_SPEC="$DOCS_PATH/ko/SPECIFICATION.md"

  echo "📁 Existing files detected:"
  [ -n "$SKILL_FILES" ] && echo "  - Skills: $SKILL_FILES"
  [ -n "$COMMAND_FILES" ] && echo "  - Commands: $COMMAND_FILES"
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
│   │   └── {package-name}-expert.md
│   └── commands/
│       └── {package-name}-guide.md
├── en/
│   └── SPECIFICATION.md
└── ko/
    └── SPECIFICATION.md
```

### 3.2 File Templates

#### Skills Template: `{package-name}-expert.md`

```markdown
# {Package Display Name} Expert Skill

## Role

You are an expert on the `{package-name}` library. Your role is to help users implement features effectively using this library.

## Core Knowledge

### Library Overview

`{package-name}` is {description from package.json}.

Key features include:
{extracted features}

### Architecture

{architecture analysis}

---

## API Reference

### Core Functions

{extracted functions with signatures and descriptions}

### Hooks

{extracted hooks with signatures and descriptions}

### Components

{extracted components with props}

### Type Definitions

{extracted types and interfaces}

---

## Usage Patterns

### Pattern 1: Basic Usage

{basic usage example}

### Pattern 2: Advanced Usage

{advanced usage example}

### Pattern 3: Customization

{customization example}

---

## Troubleshooting

### Common Issues

{common issues and solutions}

### Best Practices

{best practices}
```

#### Commands Template: `{package-name}-guide.md`

```markdown
# {Package Display Name} Guide Command

**Package**: `{full-package-name}`
**Skill Scope**: `@{scope}:{package-name}`

## Purpose

This command provides an interactive Q&A guide for `{package-name}` library users. `guide.md` file is used for this command.
(example: `packages/canard/schema-form/docs/claude/commands/guide.md`)

## Activation

This command should be used when users:

- Ask questions about `{package-name}`
- Need help implementing features
- Want to understand specific API usage
- Encounter issues with the library
- Need code examples for specific scenarios

## Response Strategy

### Step 1: Identify Question Category

Categorize the user's question into one of:

1. **Getting Started** - Installation, setup, basic usage
2. **API Usage** - Specific function/hook usage
3. **Customization** - Custom components, styling, theming
4. **Advanced Patterns** - Complex use cases
5. **Troubleshooting** - Error resolution, debugging

### Step 2: Provide Structured Response

For each category, provide:

1. Brief answer (1-2 sentences)
2. Code example
3. Key points to understand
4. Related APIs or further reading

---

## Category: Getting Started

### Questions like:

- "How do I install {package-name}?"
- "How do I set up the provider/config?"
- "What's the basic usage?"

### Response Template:

{getting started template}

---

## Category: API Usage

{API usage templates for each major API}

---

## Category: Customization

{customization templates}

---

## Category: Advanced Patterns

{advanced pattern templates}

---

## Category: Troubleshooting

{troubleshooting templates}

---

## Knowledge Sources

For more detailed information, the following related skills provide in-depth knowledge:

| Topic | Skill Name |
|-------|-----------|
| Comprehensive Guide | `{package-name}-expert` |

Full API specifications are available in the SPECIFICATION documents.
```

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
  "$DOCS_PATH/claude/skills/${PACKAGE_NAME}-expert.md"
  "$DOCS_PATH/claude/commands/${PACKAGE_NAME}-guide.md"
  "$DOCS_PATH/en/SPECIFICATION.md"
  "$DOCS_PATH/ko/SPECIFICATION.md"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file"
  else
    echo "❌ Missing: $file"
  fi
done
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
├── docs/claude/skills/{package-name}-expert.md
├── docs/claude/commands/{package-name}-guide.md
├── docs/en/SPECIFICATION.md
└── docs/ko/SPECIFICATION.md

💡 Next Steps:
1. Review generated documentation
2. Test skill with: /{package-name}-guide
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
├── docs/claude/skills/{package-name}-expert.md ✏️
├── docs/claude/commands/{package-name}-guide.md ✏️
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

- **Claude documents (skills, commands)**: English
- **SPECIFICATION documents**:
  - `en/SPECIFICATION.md`: English
  - `ko/SPECIFICATION.md`: Korean

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
