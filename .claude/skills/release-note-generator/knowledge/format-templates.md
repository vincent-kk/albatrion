# Release Note Format Templates

## Standard Template

```markdown
# [albatrion-YYMMDD] {Summary of Key Changes}

## 📦 Package Releases

{List of packages with version changes}

---

## 💥 Breaking Changes

{Breaking changes with migration guide}

---

## ✨ New Features

{New functionality and features}

---

## 🚀 Improvements

{Enhancements and optimizations}

---

## 🐛 Bug Fixes

{Bug fixes and corrections}

---

## 📋 Installation

{Installation commands}
```

## Section Templates

### 📦 Package Releases

```markdown
## 📦 Package Releases

- `@package/name@1.2.0` - Brief description of changes (from v1.1.0)
- `@package/another@2.0.0` - Major update with new API (from v1.5.0)
- `@package/new-plugin@1.0.0` 🆕 - New plugin for X integration
```

**Rules**:
- List format: `` `@package/name@version` `` - Description (from vOldVersion)
- Mark new packages with 🆕
- Include version bump information
- Order by significance (major changes first)
- Brief description (5-10 words)

### 💥 Breaking Changes

```markdown
## 💥 Breaking Changes

### {API/Feature Name}

{Brief description of what changed and why}

```tsx
// Before
{old code example}

// After
{new code example}
```

#### Migration

1. {Step one}
2. {Step two}
3. {Step three (if needed)}

---

### {Another Breaking Change}

{Description}

#### Migration

{Steps}
```

**Rules**:
- Each breaking change is a subsection (###)
- Always include before/after code
- Always include migration steps
- Numbered migration list
- Explain WHY it changed (briefly)
- Separate each change with ---

### ✨ New Features

```markdown
## ✨ New Features

- **{Feature name}**: {Brief description of what users can now do}
- **{Another feature}**: {One-line explanation}
- **{Third feature}**: {User benefit}

{Optional code example for complex features}
```

**Rules**:
- Bullet list format
- Bold feature name
- One-line description after colon
- Focus on user benefit
- Code examples only if necessary
- Order by importance/impact

### 🚀 Improvements

```markdown
## 🚀 Improvements

- **Performance**: {Specific improvement, e.g., "50% faster rendering"}
- **TypeScript**: {Type definition improvements}
- **Bundle size**: {Size reduction, e.g., "Reduced by 15%"}
- **Developer experience**: {DX improvements}
- **Accessibility**: {A11y enhancements}
```

**Rules**:
- Group by category (Performance, TypeScript, etc.)
- Include metrics when available
- One-line descriptions
- No code examples (unless exceptional)

### 🐛 Bug Fixes

```markdown
## 🐛 Bug Fixes

- Fixed {specific issue description}
- Resolved {problem that users experienced}
- Corrected {edge case or error}
```

**Rules**:
- Start with past tense verbs (Fixed, Resolved, Corrected)
- Describe the bug from user perspective
- Keep very brief
- No code examples
- Order by severity/frequency

### 📋 Installation

```markdown
## 📋 Installation

```bash
# Install specific package
npm install @package/name@1.2.0

# Or install with plugin
npm install @package/name@1.2.0 @package/plugin@1.0.0

# Yarn users
yarn add @package/name@1.2.0
```
```

**Rules**:
- Show npm commands first
- Include yarn alternative
- Show multi-package installation if applicable
- Use exact versions (not ^1.2.0)

## Title Templates

### Pattern
```
[{tag}] {Summary}
```

### Summary Guidelines

Based on most impactful change:

#### Breaking Changes Priority
```
[albatrion-YYMMDD] Major API Redesign with Breaking Changes
[albatrion-YYMMDD] New Component Architecture (Breaking)
[albatrion-YYMMDD] Simplified API with Migration Required
```

#### New Features Priority
```
[albatrion-YYMMDD] New Plugin System and Extensions
[albatrion-YYMMDD] Added Multi-Step Form Support
[albatrion-YYMMDD] Introduced Async Validation
```

#### Improvements Priority
```
[albatrion-YYMMDD] Enhanced Performance and Type Safety
[albatrion-YYMMDD] Improved Developer Experience
[albatrion-YYMMDD] Bundle Size Optimization
```

#### Bug Fixes Priority
```
[albatrion-YYMMDD] Critical Bug Fixes and Stability
[albatrion-YYMMDD] Resolved Validation Edge Cases
```

**Rules**:
- Keep under 8 words (excluding tag)
- Use action verbs
- Describe impact, not implementation
- Avoid "various", "multiple", "several"

## Complete Examples

### Example 1: Feature Release

```markdown
# [albatrion-250903] New Schema Form Plugins and TypeScript Improvements

## 📦 Package Releases

- `@canard/schema-form@1.5.0` - Added plugin system support (from v1.4.0)
- `@canard/schema-form-antd-plugin@1.0.0` 🆕 - Ant Design component integration
- `@canard/schema-form-mui-plugin@1.0.0` 🆕 - Material-UI component integration

---

## ✨ New Features

- **Plugin system**: Integrate any UI library with custom renderers
- **Antd plugin**: Pre-built components for Ant Design
- **MUI plugin**: Pre-built components for Material-UI

---

## 🚀 Improvements

- **TypeScript**: Full type inference for plugin APIs
- **Bundle size**: Reduced core package by 20%
- **Documentation**: Added plugin development guide

---

## 🐛 Bug Fixes

- Fixed plugin registration race condition
- Resolved type conflicts with strict mode

---

## 📋 Installation

```bash
# Core package
npm install @canard/schema-form@1.5.0

# With Ant Design plugin
npm install @canard/schema-form@1.5.0 @canard/schema-form-antd-plugin@1.0.0

# With Material-UI plugin
npm install @canard/schema-form@1.5.0 @canard/schema-form-mui-plugin@1.0.0
```
```

### Example 2: Breaking Change Release

```markdown
# [albatrion-251201] Simplified API with Improved Type Safety

## 📦 Package Releases

- `@canard/schema-form@2.0.0` - Major API simplification (from v1.5.0)

---

## 💥 Breaking Changes

### Form Configuration API

The `config` prop has been replaced with individual props for better type safety and clarity.

```tsx
// Before
<SchemaForm
  config={{
    schema: mySchema,
    validation: myRules,
    onSubmit: handleSubmit
  }}
/>

// After
<SchemaForm
  schema={mySchema}
  validators={myRules}
  onSubmit={handleSubmit}
/>
```

#### Migration

1. Replace `config.schema` with `schema` prop
2. Replace `config.validation` with `validators` prop
3. Move `config.onSubmit` to top-level `onSubmit` prop
4. No other changes required

---

## ✨ New Features

- **Better type inference**: Props now have full TypeScript support
- **Simplified imports**: No need to import configuration types

---

## 🚀 Improvements

- **Developer experience**: Auto-completion for all props
- **Bundle size**: Removed configuration wrapper (3KB smaller)

---

## 📋 Installation

```bash
npm install @canard/schema-form@2.0.0
```
```

### Example 3: Bug Fix Release

```markdown
# [albatrion-251015] Critical Validation Fixes

## 📦 Package Releases

- `@canard/schema-form@1.4.1` - Bug fixes and stability (from v1.4.0)

---

## 🐛 Bug Fixes

- Fixed async validators not triggering on initial render
- Resolved memory leak in field subscription cleanup
- Corrected validation error display for nested fields
- Fixed form reset not clearing validation state

---

## 📋 Installation

```bash
npm install @canard/schema-form@1.4.1
```
```

## Template Variables

### Common Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{tag}` | Git tag | albatrion-251116 |
| `{YYMMDD}` | Date from tag | 251116 |
| `{version}` | Package version | 1.2.0 |
| `{oldVersion}` | Previous version | 1.1.0 |
| `{packageName}` | NPM package name | @canard/schema-form |
| `{summary}` | Brief summary | New Plugin System |

### Section Variables

| Variable | Description |
|----------|-------------|
| `{featureName}` | Name of feature |
| `{description}` | Brief description |
| `{beforeCode}` | Code before change |
| `{afterCode}` | Code after change |
| `{migrationStep}` | Migration instruction |
| `{improvementCategory}` | Category of improvement |
| `{bugDescription}` | Description of fixed bug |

## Formatting Rules

### Spacing
- One blank line between sections
- `---` separator between section header and content
- No blank lines within lists
- Two line breaks before section headers

### Code Blocks
- Use ````tsx` for TypeScript/React examples
- Use ````bash` for shell commands
- Always include `// Before` and `// After` comments
- Keep examples under 5 lines each

### Lists
- Use `-` for unordered lists
- Use `1.` for ordered lists (migration steps)
- Use `**Bold**:` for category/name prefix
- One line per item

### Emphasis
- Bold (`**text**`) for feature names and categories
- Backticks (`` `code` ``) for package names and inline code
- 🆕 emoji for new packages only
- No italics or other formatting

## Quality Checklist

For each release note, verify:

- [ ] Title follows pattern: [tag] Summary
- [ ] All emoji sections present (even if empty)
- [ ] Package releases list all changed packages
- [ ] Breaking changes have migration steps
- [ ] Code examples use correct syntax highlighting
- [ ] Installation commands use exact versions
- [ ] No markdown formatting errors
- [ ] Consistent spacing and separators
- [ ] English language only
- [ ] Professional tone maintained

## Reference

See `writing-principles.md` for content guidelines and `categorization-rules.md` for change classification.
