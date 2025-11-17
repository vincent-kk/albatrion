# Changeset Enhancement Guide

## Purpose

This guide provides instructions for analyzing and enhancing changeset files (`.changeset/*.md`) to create comprehensive, user-friendly release notes for the Albatrion monorepo.

## Changeset File Structure

Typical changeset format:

```markdown
---
"@package/name": minor
"@package/another": patch
---

Brief description of changes
```

### Components

1. **Frontmatter** (YAML):
   - Package names with version bump types (`major`, `minor`, `patch`)
   - Indicates which packages are affected

2. **Description**:
   - Usually brief (1-3 sentences)
   - May lack user-facing context
   - Often technical or implementation-focused

## Enhancement Process

### Step 1: Analyze Changeset Metadata

```bash
# Read all changeset files
ls .changeset/*.md

# Extract package and version info
# Parse YAML frontmatter
```

**Key information to extract**:
- Affected packages
- Version bump types (major = breaking, minor = feature, patch = fix)
- Original descriptions

### Step 2: Categorize Changes

Based on version bump type:

| Bump Type | Likely Category | Default Emoji |
|-----------|----------------|---------------|
| `major` | 💥 Breaking Changes | Critical - requires migration |
| `minor` | ✨ New Features | New functionality |
| `patch` | 🐛 Bug Fixes or 🚀 Improvements | Fixes or enhancements |

**Special markers** in descriptions:
- "BREAKING", "breaking change" → 💥 Breaking Changes
- "feat:", "feature:" → ✨ New Features
- "fix:", "bug:" → 🐛 Bug Fixes
- "perf:", "improve:" → 🚀 Improvements

### Step 3: Enhance Descriptions

Transform brief changeset descriptions into user-friendly content:

#### Before (Changeset)
```markdown
---
"@canard/schema-form": minor
---

Add validation for nested objects
```

#### After (Enhanced)
```markdown
## ✨ New Features

- **Nested Object Validation**: Schema Form now validates deeply nested object structures, ensuring data integrity across complex forms
```

### Enhancement Principles

1. **Expand Context**: Add "why this matters" for users
2. **User-Centric Language**: Avoid technical jargon
3. **Action-Oriented**: Use active voice and clear verbs
4. **Brief but Complete**: 1-2 sentences maximum per item

### Step 4: Create Unified Release Note

Merge all changesets into a single document following the standard format:

```markdown
# [Package Name] vX.X.X - Brief Title

## 📦 Package Releases

- `@package/name@X.X.X` - Brief description (from vX.X.X)
- `@package/new@X.X.X` 🆕 - New package description

---

## 💥 Breaking Changes

### [Change Name]

[Description of what changed and why]

```tsx
// Before
<OldAPI />

// After
<NewAPI />
```

#### Migration
1. Step one
2. Step two

---

## ✨ New Features

- **Feature Name**: Brief description

---

## 🚀 Improvements

- **Category**: Brief description

---

## 🐛 Bug Fixes

- Fixed [specific issue]

---

## 📋 Installation

```bash
npm install @package/name@X.X.X
```
```

## Project-Specific Conventions

### Package Naming

Always use **actual package names** from `package.json`:

```bash
# Verify package names
cat packages/path/package.json | jq -r '.name'
```

Common packages in this project:
- `@albatrion/aileron`
- `@albatrion/canard/schema-form`
- `@albatrion/canard/schema-form-*-plugin`
- `@albatrion/lerx/promise-modal`
- `@albatrion/winglet/*`

### Version Decision

- **Major (X.0.0)**: Contains Breaking Changes (`major` bump)
- **Minor (0.X.0)**: New feature additions (`minor` bump)
- **Patch (0.0.X)**: Bug fixes, internal improvements (`patch` bump)

### File Naming

Output file pattern: `release-notes-YYMMDD.md`

Example: `release-notes-251116.md`

## Quality Checklist

Before finalizing enhanced release notes:

- [ ] All package names verified from package.json
- [ ] Version bumps match changeset types
- [ ] Breaking changes include migration steps
- [ ] Descriptions are user-centric (not implementation-focused)
- [ ] Length is under 2-3 minutes reading time
- [ ] Emoji structure is consistent
- [ ] English only (no other languages)
- [ ] Installation commands are correct
- [ ] New packages marked with 🆕

## Common Patterns

### Pattern 1: Multiple Changesets for Same Package

When multiple changesets affect the same package:

1. Combine into single package entry
2. List all changes under appropriate categories
3. Use highest version bump type (major > minor > patch)

### Pattern 2: New Package Release

Mark with 🆕 emoji:

```markdown
- `@albatrion/new-package@1.0.0` 🆕 - Initial release with [key features]
```

### Pattern 3: Plugin Updates

Group plugin updates together:

```markdown
## 📦 Package Releases

**Schema Form Plugins**:
- `@canard/schema-form-react-plugin@1.2.0` - Enhanced validation
- `@canard/schema-form-vue-plugin@1.2.0` - Enhanced validation
```

## Integration with Workflows

### Workflow 1: Pre-Release Enhancement

```bash
# Before running changeset version
1. Read all changesets
2. Enhance descriptions
3. Create draft release notes
4. Review with team
5. Run changeset version
```

### Workflow 2: Post-Release Documentation

```bash
# After changeset version
1. Read CHANGELOG.md changes
2. Extract version info
3. Generate comprehensive release notes
4. Publish to GitHub releases
```

## Error Handling

### No Changesets Found

If `.changeset/` is empty or contains only config:

```markdown
# No Changes to Release

No changesets found. Create changesets using:

```bash
npx changeset
```
```

### Invalid Changeset Format

If YAML frontmatter is malformed:
- Skip the file
- Log warning
- Continue with other changesets

### Missing Package

If changeset references non-existent package:
- Verify with `ls packages/`
- Check for renamed/moved packages
- Warn user about potential error

## Reference Documents

This guide should be used alongside:

- `writing-principles.md`: Core writing standards
- `format-templates.md`: Release note structure templates
- `categorization-rules.md`: Change classification rules

All principles from these documents apply to changeset enhancement.

## Examples

### Example 1: Feature Addition

**Changeset**:
```markdown
---
"@canard/schema-form": minor
---

Add support for array validation
```

**Enhanced**:
```markdown
## ✨ New Features

- **Array Validation**: Schema Form now validates array fields with min/max length constraints and item-level validation rules
```

### Example 2: Breaking Change

**Changeset**:
```markdown
---
"@canard/schema-form": major
---

Remove deprecated FormBuilder API
```

**Enhanced**:
```markdown
## 💥 Breaking Changes

### FormBuilder API Removed

The deprecated `FormBuilder` API has been removed. Use `SchemaForm` directly.

```tsx
// Before
<FormBuilder schema={schema} />

// After
<SchemaForm schema={schema} />
```

#### Migration
1. Replace all `FormBuilder` imports with `SchemaForm`
2. No other changes required - API is identical
```

### Example 3: Bug Fix

**Changeset**:
```markdown
---
"@winglet/common-utils": patch
---

Fix isFalsy with zero values
```

**Enhanced**:
```markdown
## 🐛 Bug Fixes

- Fixed `isFalsy()` incorrectly treating zero (0) as falsy value
```

---

**Remember**: Keep it clear, concise, and user-focused. The goal is to help developers quickly understand what changed and how to adapt.
