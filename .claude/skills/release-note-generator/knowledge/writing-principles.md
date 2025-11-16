# Release Note Writing Principles

## Core Philosophy

Release notes are **user documentation**, not developer logs. They answer:
- What changed?
- How does it affect me?
- What do I need to do?

## Clarity & Conciseness

### Be Clear
- Use simple, direct language
- Avoid jargon and acronyms (unless common)
- Define technical terms when necessary
- One idea per sentence

**Example**:
- ❌ "Refactored validation layer architecture for improved extensibility"
- ✅ "Added support for custom validation rules"

### Be Concise
- Maximum 2 minutes reading time
- Each section 3-5 items maximum
- One-line descriptions preferred
- Code examples only when essential

**Example**:
- ❌ "We've significantly enhanced the performance of the form rendering system by implementing a new caching mechanism that reduces re-renders..."
- ✅ "Improved form rendering performance with smart caching"

### Be Specific
- State exactly what changed
- Use concrete examples
- Avoid vague terms like "various", "some", "better"

**Example**:
- ❌ "Various improvements to forms"
- ✅ "Form validation now supports async validators"

## User-Centric Writing

### Focus on Impact
Answer: "What does this mean for users?"

**Example**:
- ❌ "Migrated from class components to hooks"
- ✅ "Reduced bundle size by 20% through modern React patterns"

### Provide Context
Help users understand why the change matters

**Example**:
- ❌ "Changed API endpoint structure"
- ✅ "API endpoints now follow RESTful conventions for easier integration"

### Include Migration Steps
For breaking changes, always provide clear migration path

**Example**:
```markdown
## Migration

1. Replace `<Form validation={rules}>` with `<Form validators={rules}>`
2. Update validation rule format from strings to objects
3. No other changes required
```

## Structure & Organization

### Use Consistent Sections

Always include (even if empty):
1. Package Releases (📦)
2. Breaking Changes (💥) - if any
3. New Features (✨)
4. Improvements (🚀)
5. Bug Fixes (🐛)
6. Installation (📋)

### Order by Priority

Within each section:
1. Most impactful changes first
2. Most common use cases first
3. Breaking changes at the top (with warning)

### Use Visual Hierarchy

```markdown
## 💥 Breaking Changes     # Section header

### API Name Change        # Specific change

Brief description.         # Explanation

Migration steps           # Action items
```

## Language & Tone

### Professional but Friendly
- Direct and helpful
- Avoid marketing language
- No superlatives ("amazing", "incredible")
- No apologizing for breaking changes

**Example**:
- ❌ "We're excited to announce our amazing new feature!"
- ✅ "Added support for multi-step forms"

### Active Voice
- Use active voice: "Added feature X"
- Not passive: "Feature X was added"

### Present Tense
- "Adds support for..." (present)
- Not "Added support for..." (past)

**Exception**: Use past tense for bug fixes
- "Fixed issue where..."

## Code Examples

### When to Include
- Breaking changes (always)
- New features (if API usage is not obvious)
- Bug fixes (if showing workaround)

### When to Exclude
- Simple feature additions
- Internal improvements
- Obvious changes

### Example Format

```tsx
// Before
<Component oldProp={value} />

// After
<Component newProp={value} />
```

Keep examples minimal (3-5 lines maximum)

## Common Patterns

### Package Releases

```markdown
- `@package/name@1.1.0` - Brief description (from v1.0.0)
- `@package/new@1.0.0` 🆕 - New package description
```

### Breaking Changes

```markdown
### API Name Changed

The `oldAPI` has been renamed to `newAPI` for clarity.

Migration:
1. Replace `oldAPI` with `newAPI`
2. No other changes required
```

### New Features

```markdown
- **Feature name**: Brief description in one line
- **Another feature**: What it enables users to do
```

### Improvements

```markdown
- **Performance**: Reduced bundle size by 15%
- **TypeScript**: Enhanced type definitions for better IDE support
```

### Bug Fixes

```markdown
- Fixed form validation not triggering on async validators
- Resolved memory leak in subscription cleanup
```

## What NOT to Include

### Internal Changes
- Refactoring without user impact
- Test improvements
- CI/CD changes
- Build configuration
- Documentation-only updates

**Exception**: Include if there's user impact
- "Refactored form validation (50% faster)"

### Technical Details
- Implementation details
- Architecture descriptions
- Algorithm explanations
- Performance metrics (unless significant)

### Dependencies
- Dependency version bumps
- Internal package updates

**Exception**: Security-related dependency updates

## Length Guidelines

### Overall Document
- Target: 1-2 minutes reading time
- Maximum: 3 minutes
- If longer, you're including too much detail

### Sections
- Breaking Changes: Detailed (with migration)
- Features: Brief (one-line)
- Improvements: Very brief (one-line)
- Bug Fixes: Minimal (list only)

### Individual Items
- Title: 3-5 words
- Description: 1-2 sentences max
- Code example: 3-5 lines

## Quality Checklist

Before publishing, verify:

- [ ] Written in English only
- [ ] No technical jargon or unexplained terms
- [ ] All breaking changes have migration steps
- [ ] Code examples are minimal and clear
- [ ] User impact is explicit for each change
- [ ] Total reading time under 3 minutes
- [ ] Emoji structure used consistently
- [ ] Installation commands included
- [ ] Title summarizes most important change
- [ ] No internal/implementation details

## Examples

### Good Release Note Item

```markdown
## ✨ New Features

- **Async validation**: Form fields now support asynchronous validators for server-side validation
```

Why it's good:
- Clear feature name
- One-line description
- Explains user benefit
- No technical details

### Bad Release Note Item

```markdown
## ✨ New Features

- **Enhanced validation architecture**: We've completely refactored the validation layer using a new abstract factory pattern that decouples the validation logic from the component lifecycle, enabling more flexible validation strategies including the new asynchronous validation capability which leverages promises and async/await to perform server-side validation with proper error handling and state management.
```

Why it's bad:
- Too verbose (1 sentence with many clauses)
- Technical architecture details
- Buries the key feature (async validation)
- Marketing tone ("completely refactored")

### Improved Version

```markdown
## ✨ New Features

- **Async validators**: Validate form fields against server-side rules

```tsx
<FormField
  validators={[
    async (value) => {
      const isValid = await checkServer(value);
      return isValid ? null : 'Invalid value';
    }
  ]}
/>
```
```

Why it's better:
- Clear feature name
- Brief description
- Minimal code example showing usage
- User can understand immediately

## Reference

- [Semantic Versioning](https://semver.org/) - Version numbering guide
- [Keep a Changelog](https://keepachangelog.com/) - Changelog best practices
- [Writing Clear Documentation](https://documentation.divio.com/) - Documentation framework
