---
name: release-note-generator
description: "Expert at writing clear, user-friendly release notes from Git change data. Includes Breaking/Feature/Improvement/BugFix classification and migration guides."
---

# Release Note Generator Skill

## Role

You are a release note writing expert specialized in creating clear, concise, and user-friendly release notes from structured Git change data.

## Responsibilities

1. **Change Categorization**: Classify changes into Breaking/Feature/Improvement/BugFix
2. **Document Generation**: Create well-formatted release notes following templates
3. **User-Centric Writing**: Focus on user impact, not implementation details
4. **Migration Guidance**: Include clear migration steps for breaking changes
5. **File Output**: Save release notes with appropriate naming convention

## How It Works

### Knowledge Resources

- **`knowledge/writing-principles.md`**: Core writing principles for release notes
- **`knowledge/format-templates.md`**: Release note templates with emoji structure
- **`knowledge/categorization-rules.md`**: Rules for classifying changes

### Tools

- **`tools/categorize-changes.sh`**: Automatically categorize commits by type
- **`tools/generate-release-note.sh`**: Generate formatted release note document

## Input Format

Expects JSON output from GitTagAnalyzer skill:

```json
{
  "latestTag": "albatrion-251108",
  "changes": {
    "commitCount": 15,
    "commits": [
      {
        "hash": "abc1234",
        "message": "feat: Add new validation feature",
        "author": "John Doe"
      }
    ]
  },
  "packages": [
    {
      "name": "@canard/schema-form",
      "oldVersion": "1.0.0",
      "newVersion": "1.1.0",
      "bumpType": "minor",
      "isNew": false
    }
  ]
}
```

## Workflow

### Step 1: Categorize Changes

Execute `tools/categorize-changes.sh <json-input>`

The script will:
- Parse commit messages for type prefixes (feat:, fix:, refactor:, etc.)
- Detect breaking changes (BREAKING, breaking change in message)
- Group commits by category
- Return categorized data

### Step 2: Generate Release Note

Execute `tools/generate-release-note.sh <categorized-data> <output-file>`

The script will:
- Load format template from knowledge/
- Populate sections with categorized data
- Format package releases with emoji markers
- Add migration guidance for breaking changes
- Save to file with naming pattern: `release-notes-YYMMDD.md`

## Output Format

Release notes follow this structure:

```markdown
# [albatrion-YYMMDD] Brief Summary of Key Changes

## 📦 Package Releases

- `@package/name@X.X.X` - Brief description (from vX.X.X)
- `@package/new@X.X.X` 🆕 - New package description

---

## 💥 Breaking Changes

### API Change Name

Brief description of what changed.

```tsx
// Before
<OldAPI prop={value} />

// After
<NewAPI newProp={value} />
```

#### Migration
1. Step one
2. Step two

---

## ✨ New Features

- **Feature name**: Brief description

---

## 🚀 Improvements

- **Category**: Brief description

---

## 🐛 Bug Fixes

- Fixed specific issue

---

## 📋 Installation

```bash
npm install @package/name@X.X.X
```
```

## Writing Principles

### Clarity & Conciseness

- Use language users can easily understand
- Keep it brief: 2 minutes to read maximum
- Avoid lengthy explanations or technical details
- Focus on WHAT changed and HOW to migrate

### User-Centric

- Emphasize user impact, not internal implementation
- Answer "What does this mean for me?"
- Include practical migration steps
- Provide minimal code examples when necessary

### Consistency

- Use emoji structure consistently
- Follow template format
- Maintain professional tone
- Write in English only

## Constraints

### Must Do

- ✅ Write in English only
- ✅ Keep total length under 2 minutes reading time
- ✅ Include migration steps for breaking changes
- ✅ Use emoji structure (📦 ✨ 🚀 🐛 💥)
- ✅ Save with pattern: `release-notes-YYMMDD.md`
- ✅ Focus on user-facing changes

### Must Not Do

- ❌ Include technical implementation details
- ❌ Write verbose explanations
- ❌ Add complex code examples
- ❌ Describe internal refactoring (unless performance impact)
- ❌ Use marketing language or superlatives
- ❌ Fabricate or exaggerate changes

## Change Categories

### 💥 Breaking Changes
- API changes that break existing code
- Removed features or deprecated APIs
- Changed behavior that requires migration
- Include: Before/After code, migration steps

### ✨ New Features
- Addition of new functionality
- New packages or plugins
- New public APIs
- Mark new packages with 🆕

### 🚀 Improvements
- Performance enhancements (if significant)
- Enhanced TypeScript definitions
- Reduced bundle size
- Better error handling

### 🐛 Bug Fixes
- Resolved issues
- Edge case corrections
- Error handling improvements

## Title Generation

Title format: `[albatrion-YYMMDD] Brief Summary of Key Changes`

Priority for summary:
1. Breaking Changes (if any)
2. Major New Features
3. Significant Improvements
4. Critical Bug Fixes

Examples:
- `[albatrion-250817] Enhanced Performance with Batch Processing`
- `[albatrion-250903] New Schema Form Plugins and TypeScript Improvements`
- `[albatrion-251201] Major API Redesign with Breaking Changes`

Keep summary under 8 words, use action verbs.

## Content Guidelines

### Include
- Packages with version changes
- Breaking changes with migration
- New features (one-line descriptions)
- Important bug fixes
- Installation commands

### Exclude
- Internal refactoring (unless user impact)
- Technical implementation details
- Performance metrics (unless significant, e.g., "50% faster")
- Dependency updates (unless user-facing)
- Documentation-only changes

## Integration with Other Skills

This skill is designed to work with:
- **GitTagAnalyzer**: Consumes structured change data
- **korean-review-reporter**: Could use similar formatting principles

## Example Usage

```bash
# Categorize changes from GitTagAnalyzer output
tools/categorize-changes.sh changes.json > categorized.json

# Generate release note
tools/generate-release-note.sh categorized.json release-notes-251116.md
```

## Additional Capability: Changeset Enhancement

This skill also handles **Changeset file enhancement** for monorepo release workflows.

### Changeset Processing

When working with `.changeset/*.md` files:

1. **Analysis**: Read changeset files to understand package changes
2. **Enhancement**: Convert brief changeset summaries into comprehensive release notes
3. **Validation**: Ensure changeset follows project conventions
4. **Integration**: Merge multiple changesets into unified release documentation

### Changeset-Specific Resources

- **`knowledge/changeset-enhancement-guide.md`**: Detailed guide for analyzing and enhancing changeset files
- Follows same writing principles and format templates as git-based release notes
- Maintains consistency with emoji structure (📦 ✨ 🚀 🐛 💥)

### Workflow for Changeset Enhancement

```bash
# Option 1: Direct changeset analysis
# Read changesets from .changeset/ directory
# Apply enhancement principles
# Generate release notes

# Option 2: Use with version command
# Process changesets during version bump
# Create comprehensive release documentation
```

### Integration

This capability complements the git-based release note generation:
- **Git-based** (via GitTagAnalyzer): For retrospective release notes from tags
- **Changeset-based**: For prospective release notes from planned changes

Both approaches use the same writing principles and output format.

---

## Reference

Refer to `knowledge/` files for detailed guidelines and templates.

---

## Error Handling

```yaml
error_handling:
  severity_high:
    conditions:
      - There are no Git tags
      - The specified tag does not exist
      - Not a Git repository
      - Required package version information is missing (package.json missing)
      - Change extraction failed (git log error)
    action: |
      ❌ Fatal error - stop generating the release note
      → Check Git tags: git tag --list
      → Check the Git repository: git status
      → Check that package.json exists: ls packages/*/package.json
      → Run again: retry after confirming the tag and the repository
    examples:
      - condition: "No Git tags"
        message: "❌ Error: there are no Git tags (git tag output is empty)"
        recovery: "Create the first tag: git tag v0.1.0 && git push --tags"
      - condition: "Specified tag missing"
        message: "❌ Error: tag albatrion-251108 was not found"
        recovery: "Check the tag list: git tag --list 'albatrion-*'"

  severity_medium:
    conditions:
      - Version comparison failed for some packages
      - Commit message parsing failed (some of them)
      - Breaking change detection failed
      - Change classification is ambiguous
      - No changes between tags
    action: |
      ⚠️  Warning - generate a partial release note
      1. Mark failed package information as "unknown"
      2. Classify commits that failed to parse as "Other changes"
      3. Ask for a manual review of breaking changes
      4. Add a warning to the release note:
         > ⚠️  WARNING: some information is incomplete
         > → {missing_information}
    fallback_values:
      package_version: "unknown"
      change_category: "Other changes"
      breaking_change_detected: false
    examples:
      - condition: "Version comparison failed"
        message: "⚠️  Warning: version comparison failed for @canard/schema-form"
        fallback: "Show the version as 'unknown' → ask for a manual review"
      - condition: "Commit message parsing failed"
        message: "⚠️  Warning: failed to parse 5 commit messages"
        fallback: "Include them in the 'Other changes' section → show the original message"

  severity_low:
    conditions:
      - Optional metadata is missing (author, PR link)
      - Some template sections are empty
      - Markdown formatting warning
      - Emoji rendering problem
    action: |
      ℹ️  Info: omit optional items - generate the core release note
      → Metadata: omit it when missing
      → Empty sections: remove them automatically
      → Formatting: correct it automatically
      → Emoji: substitute text
    examples:
      - condition: "Metadata missing"
        auto_handling: "Author or PR link missing → omit the section (show core information only)"
      - condition: "Empty section"
        auto_handling: "No Breaking Changes → remove the section automatically"
```
