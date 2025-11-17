# Change Categorization Rules

## Overview

Changes are categorized into four main types:
1. 💥 **Breaking Changes** - Requires user action
2. ✨ **New Features** - Adds new functionality
3. 🚀 **Improvements** - Enhances existing functionality
4. 🐛 **Bug Fixes** - Fixes broken functionality

## Categorization Decision Tree

```
Is the change user-facing?
├─ No → Skip (internal change)
└─ Yes → Continue

Does it break existing code?
├─ Yes → 💥 Breaking Change
└─ No → Continue

Does it add new functionality?
├─ Yes → ✨ New Feature
└─ No → Continue

Does it fix a bug?
├─ Yes → 🐛 Bug Fix
└─ No → 🚀 Improvement
```

## Breaking Changes (💥)

### Definition
A change that requires users to modify their code to maintain functionality.

### Indicators

#### Commit Message Patterns
```
BREAKING CHANGE: {description}
BREAKING: {description}
!: {description}
feat!: {description}
refactor!: {description}
```

#### Code Patterns
- Removed functions, methods, or props
- Renamed public APIs
- Changed function signatures
- Removed configuration options
- Changed default behavior
- Updated minimum version requirements

### Examples

#### ✅ Breaking Change
```
- Removed deprecated `validate()` method
- Renamed `FormConfig` to `SchemaFormConfig`
- Changed `onSubmit` to return Promise instead of void
- Updated peer dependency React from >=16 to >=18
```

#### ❌ Not Breaking
```
- Added new optional prop `theme`
- Deprecated `oldMethod()` (still functional)
- Improved internal validation logic
- Updated TypeScript types (more permissive)
```

### Required Information
- [ ] What changed (old vs new)
- [ ] Why it changed (brief reason)
- [ ] How to migrate (step-by-step)
- [ ] Code example (before/after)

## New Features (✨)

### Definition
Addition of new functionality that didn't exist before.

### Indicators

#### Commit Message Patterns
```
feat: {description}
feature: {description}
add: {description}
Added {feature}
```

#### Code Patterns
- New functions, methods, or components
- New optional props or parameters
- New configuration options
- New packages or plugins
- New export from existing package

### Examples

#### ✅ New Feature
```
- Added async validator support
- New `@canard/schema-form-antd-plugin` package
- Added `theme` prop for custom styling
- Introduced plugin system for custom renderers
```

#### ❌ Not New Feature
```
- Improved existing validation logic (Improvement)
- Fixed validator not running (Bug Fix)
- Refactored plugin architecture (Internal)
- Updated plugin documentation (Internal)
```

### Required Information
- [ ] Feature name (concise, descriptive)
- [ ] What it enables users to do
- [ ] Brief usage description
- [ ] Code example (if API is not obvious)

## Improvements (🚀)

### Definition
Enhancement of existing functionality without breaking changes.

### Indicators

#### Commit Message Patterns
```
refactor: {description}
perf: {description}
improve: {description}
enhance: {description}
optimize: {description}
```

#### Code Patterns
- Performance optimizations
- Better error messages
- Enhanced TypeScript types
- Reduced bundle size
- Improved developer experience
- Better accessibility

### Examples

#### ✅ Improvement
```
- Reduced bundle size by 20%
- Enhanced TypeScript type inference
- Improved error messages for validation failures
- Better accessibility for form inputs
- Faster form rendering (50% improvement)
```

#### ❌ Not Improvement
```
- Added new feature X (New Feature)
- Fixed bug in validation (Bug Fix)
- Refactored internal code (Internal - skip)
```

### Subcategories

#### Performance
- Rendering speed improvements
- Bundle size reductions
- Memory usage optimizations
- Network request optimizations

#### TypeScript
- Better type inference
- More accurate types
- Additional type exports
- Generic improvements

#### Developer Experience
- Better error messages
- Improved documentation
- Better IDE support
- Enhanced debugging

#### Accessibility
- ARIA improvements
- Keyboard navigation
- Screen reader support
- Focus management

### Required Information
- [ ] Category (Performance, TypeScript, etc.)
- [ ] Specific improvement
- [ ] Metrics if available (e.g., "20% faster")

## Bug Fixes (🐛)

### Definition
Correction of broken or incorrect behavior.

### Indicators

#### Commit Message Patterns
```
fix: {description}
bugfix: {description}
Fixed {issue}
Resolved {problem}
Corrected {error}
```

#### Code Patterns
- Functions not working as documented
- Edge cases causing errors
- Memory leaks
- Race conditions
- Validation not triggering
- Incorrect rendering

### Examples

#### ✅ Bug Fix
```
- Fixed async validators not triggering
- Resolved memory leak in subscriptions
- Corrected validation for nested fields
- Fixed form reset not clearing errors
```

#### ❌ Not Bug Fix
```
- Changed API structure (Breaking Change)
- Added error validation (New Feature)
- Improved validation performance (Improvement)
```

### Required Information
- [ ] What was broken
- [ ] What it caused (user impact)
- [ ] Brief description only (no code examples)

## Edge Cases

### Deprecated but Not Removed
**Category**: 🚀 Improvement

```markdown
- **Deprecation**: Deprecated `oldMethod()` in favor of `newMethod()` (still functional)
```

**Note**: Mark as Breaking Change when actually removed.

### New Package
**Category**: ✨ New Feature

```markdown
- `@package/new@1.0.0` 🆕 - Brief description
```

**Indicator**: Mark with 🆕 emoji in Package Releases section.

### Performance with Breaking Change
**Category**: 💥 Breaking Change (primary), 🚀 Improvement (mention)

```markdown
## Breaking Changes
### Optimized API Structure

Simplified API for better performance...

## Improvements
- **Performance**: 50% faster rendering with new API
```

### Internal Refactoring with User Impact
**Category**: 🚀 Improvement

```markdown
- **Performance**: Reduced bundle size by 15% through internal refactoring
```

**Rule**: If there's user-visible impact, include it. Mention impact, not implementation.

### Security Fix
**Category**: 🐛 Bug Fix (if fixing vulnerability) or 🚀 Improvement (if proactive)

```markdown
## Bug Fixes
- Fixed XSS vulnerability in form input sanitization

## Improvements
- **Security**: Enhanced input validation to prevent injection attacks
```

## Commit Message Parsing

### Conventional Commits Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type Mapping

| Commit Type | Category | Notes |
|-------------|----------|-------|
| `feat` | ✨ New Feature | New functionality |
| `feat!` | 💥 Breaking Change | Breaking new feature |
| `fix` | 🐛 Bug Fix | Bug correction |
| `refactor` | 🚀 Improvement | If user-visible |
| `refactor!` | 💥 Breaking Change | Breaking refactor |
| `perf` | 🚀 Improvement | Performance |
| `docs` | Skip | Documentation only |
| `test` | Skip | Tests only |
| `chore` | Skip | Maintenance |
| `ci` | Skip | CI/CD |
| `build` | Skip | Build system |
| `style` | Skip | Code style |

### Breaking Change Detection

#### Footer Keyword
```
BREAKING CHANGE: Description of breaking change
```

#### Exclamation Mark
```
feat!: description
refactor!: description
```

#### Body Keyword
```
feat: description

This introduces a breaking change because...
```

### Scope Usage
```
feat(form): Add async validation
fix(validation): Resolve race condition
perf(rendering): Optimize component updates
```

**Rule**: Scope is informative, doesn't affect categorization.

## Multiple Categories

### Priority Rules

If a change fits multiple categories, use this priority:

1. 💥 Breaking Change (highest priority)
2. 🐛 Bug Fix
3. ✨ New Feature
4. 🚀 Improvement

### Example
```
feat!: Add new validation API with breaking changes

BREAKING CHANGE: Old validation API removed
```

**Categorization**:
- Primary: 💥 Breaking Change
- Also mention: ✨ New Feature in description

## Filtering Out Internal Changes

### Skip These

#### Documentation Only
```
docs: Update README
docs(api): Add JSDoc comments
```

#### Tests Only
```
test: Add validation tests
test(form): Increase coverage
```

#### Build/CI Changes
```
chore: Update build config
ci: Add GitHub Actions workflow
```

#### Internal Refactoring
```
refactor: Restructure internal modules
```

**Exception**: Include if there's user impact
```
refactor: Improve performance by 50%  → 🚀 Improvement
```

### Include These

#### Dependency Updates (if user-facing)
```
feat: Update React to v18      → ✨ Feature or 💥 Breaking
chore: Update dev dependencies → Skip
```

#### Type Definition Changes
```
feat: Export new types         → ✨ New Feature
fix: Correct type definitions  → 🐛 Bug Fix
refactor: Improve type safety  → 🚀 Improvement
```

## Validation Checklist

Before finalizing categories:

- [ ] All breaking changes are actually breaking (require user action)
- [ ] New features are truly new (not improvements)
- [ ] Bug fixes were actually bugs (not enhancements)
- [ ] Improvements have user-visible impact
- [ ] Internal changes without user impact excluded
- [ ] Each change is in exactly one primary category
- [ ] Breaking changes have migration guidance

## Examples with Reasoning

### Example 1: Version Bump

```
Commit: "feat: Update minimum React version to 18"
```

**Analysis**:
- New feature? No (doesn't add functionality)
- Breaking? Yes (requires users to upgrade)
- Bug fix? No
- Improvement? Could be, but breaking takes priority

**Category**: 💥 Breaking Change

**Reasoning**: Requires user action (upgrade React)

### Example 2: Performance Optimization

```
Commit: "perf: Optimize form rendering with memoization"
```

**Analysis**:
- New feature? No (same functionality)
- Breaking? No (same API)
- Bug fix? No (not broken before)
- Improvement? Yes (better performance)

**Category**: 🚀 Improvement

**Reasoning**: Enhances existing functionality

### Example 3: New Optional Prop

```
Commit: "feat: Add optional 'theme' prop for styling"
```

**Analysis**:
- New feature? Yes (new functionality)
- Breaking? No (optional, doesn't break existing code)
- Bug fix? No
- Improvement? Could be, but it's genuinely new

**Category**: ✨ New Feature

**Reasoning**: Adds new capability

### Example 4: Bug Fix with API Change

```
Commit: "fix!: Change return type of validate() to Promise"

BREAKING CHANGE: validate() now returns Promise instead of boolean
```

**Analysis**:
- New feature? No
- Breaking? Yes (changes API)
- Bug fix? Yes (fixes async handling)
- Primary category? Breaking (affects existing code)

**Category**: 💥 Breaking Change

**Note**: Mention it fixes validation issues in description

## Reference

- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message convention
- [Semantic Versioning](https://semver.org/) - Version numbering guide
- [Keep a Changelog](https://keepachangelog.com/) - Changelog categories
