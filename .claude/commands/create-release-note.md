# Create Release Note Command

This command generates comprehensive release notes by analyzing git changes since the latest tag.

## Skills Used

This command utilizes two specialized skills:

1. **GitTagAnalyzer** (`.claude/skills/git-tag-analyzer/`)
   - Finds and validates the latest git tag
   - Collects commits and changes since the tag
   - Detects package version changes in monorepo
   - Verifies actual package names from package.json

2. **ReleaseNoteGenerator** (`.claude/skills/release-note-generator/`)
   - Categorizes changes (Breaking/Feature/Improvement/BugFix)
   - Generates user-friendly release notes with emoji structure
   - Creates migration guidance for breaking changes
   - Outputs formatted markdown file

## Execution Flow

### Phase 1: Git Analysis (GitTagAnalyzer)

1. **Find Latest Tag**
   - Execute `git-tag-analyzer/tools/find-latest-tag.sh albatrion-*`
   - Validate tag existence with multiple methods
   - Handle errors if tag not found

2. **Collect Changes**
   - Execute `git-tag-analyzer/tools/collect-changes.sh <tag>`
   - Get commits between tag and HEAD
   - Analyze changed files

3. **Detect Package Changes**
   - Execute `git-tag-analyzer/tools/compare-package-versions.sh <tag>`
   - Compare package.json versions (tag vs HEAD)
   - Identify version bump types (major/minor/patch)
   - Detect new packages

### Phase 2: Document Generation (ReleaseNoteGenerator)

4. **Categorize Changes**
   - Execute `release-note-generator/tools/categorize-changes.sh <git-data>`
   - Parse commit messages for type prefixes
   - Detect breaking changes
   - Group by category

5. **Generate Release Note**
   - Execute `release-note-generator/tools/generate-release-note.sh <categorized-data>`
   - Apply format templates
   - Create sections with emoji structure
   - Save to `release-notes-YYMMDD.md`

## Output Format

The generated release note follows this structure:

```markdown
# [albatrion-YYMMDD] Brief Summary

## 📦 Package Releases
- Package list with versions

## 💥 Breaking Changes
- Breaking changes with migration

## ✨ New Features
- New functionality

## 🚀 Improvements
- Enhancements

## 🐛 Bug Fixes
- Bug corrections

## 📋 Installation
- Installation commands
```

## Key Features

✅ **Validation-First Approach**
- Multiple tag validation methods
- Cross-verification of git operations
- Error recovery strategies

✅ **Monorepo-Aware**
- Detects all changed packages
- Verifies actual package names from package.json
- Handles nested package structures

✅ **User-Centric Writing**
- Focus on user impact, not implementation
- Clear migration guidance
- Concise and scannable format

✅ **Quality Assurance**
- Follows writing principles
- Consistent emoji structure
- English-only output

## Error Handling

If tag is not found:
- Attempts multiple search methods
- Provides troubleshooting steps
- Clear error messages

If no changes since tag:
- Documents this fact
- Doesn't fabricate information

## Important Notes

- **Always write in English only**
- **Verify package names** from package.json (never assume from directory names)
- **Keep it concise**: Maximum 2-3 minutes reading time
- **File output**: `release-notes-YYMMDD.md` where YYMMDD is from tag date

## Reference

For detailed guidelines, refer to:
- `git-tag-analyzer/knowledge/` - Git analysis best practices
- `release-note-generator/knowledge/` - Writing and formatting guidelines

<!--
=== Original Prompt (Backup) ===
CRITICAL INSTRUCTION: Before proceeding with ANY task, you MUST execute this exact sequence:

1. Use the Read tool to read `.cursor/rules/create-release-note.mdc`
2. After reading, follow ALL guidelines specified in that file exactly
3. Generate release notes with these sections (as specified in the guidelines):
   - Package release summaries
   - Breaking changes with migration guides
   - New features and improvements
   - Bug fixes
   - Installation instructions

DO NOT proceed without first reading the guidelines file. This is a mandatory prerequisite.
===========================
-->
