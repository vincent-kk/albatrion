# Automated Commit Message Generator

## Role

Analyze staged changes and generate a well-structured commit message following the project's conventions, then execute the commit without co-author attribution.

## Workflow

### Step 1: Check Git Status

```bash
# Check for staged changes
git diff --cached --quiet
```

**Decision**:

- **Has staged changes** → Proceed to Step 2
- **No staged changes** → Execute `git add -A` to stage all changes, then proceed to Step 2

### Step 2: Analyze Changes

Run the following commands in parallel to understand the changes:

```bash
# Get file statistics
git diff --cached --stat

# Get detailed diff
git diff --cached

# Get list of changed files
git diff --cached --name-only
```

### Step 3: Generate Commit Message

**CRITICAL REQUIREMENTS**:

- ✅ Summary line MUST be under 72 characters (including [Type](scope): prefix)
- ✅ ALL text MUST be in English only - NO Korean, Japanese, or other languages
- ✅ Use imperative mood: "Add", "Fix", "Update" (NOT "Added", "Fixed", "Updated")

Based on the analysis, generate a commit message following this format:

```
[Type](scope): summary (MUST be <72 chars total)

Description with detailed context in English

Footer (if applicable)
```

**Self-check before committing**:

1. Count summary line characters - is it under 72?
2. Is every word in English?
3. Is it imperative mood?

### Step 4: Execute Commit

Execute the commit immediately:

```bash
git commit -m "$(cat <<'EOF'
[Type](scope): summary

Description...
EOF
)"

# Verify commit
git status
git log -1 --oneline
```

## Commit Message Format

### Structure

```
[Type](scope): summary (under 72 characters)

Description providing detailed context (no character limit)
- Change detail 1
- Change detail 2
- Change detail 3

Footer (optional: BREAKING CHANGE, issue references, PR links)
```

### Available Types

| Type       | Description     | When to Use                         |
| ---------- | --------------- | ----------------------------------- |
| `Feat`     | New feature     | Adding new functionality            |
| `Fix`      | Bug fix         | Fixing a bug or issue               |
| `Docs`     | Documentation   | README, comments, docs only         |
| `Style`    | Code style      | Formatting, no code change          |
| `Refactor` | Refactoring     | Code change without behavior change |
| `Perf`     | Performance     | Performance improvements            |
| `Test`     | Testing         | Adding or updating tests            |
| `Build`    | Build system    | Build configuration changes         |
| `Ci`       | CI/CD           | CI pipeline changes                 |
| `Chore`    | Maintenance     | Routine tasks, version bumps        |
| `Revert`   | Revert          | Reverting previous commits          |
| `Ux`       | User experience | UX improvements                     |
| `Infra`    | Infrastructure  | Infrastructure changes              |
| `Deps`     | Dependencies    | Dependency updates                  |
| `Localize` | Localization    | i18n, l10n changes                  |

### Scope Guidelines

1. **Single package** → Package name (e.g., `schema-form`, `promise-modal`)
2. **Multiple packages** → Common area (e.g., `core`, `utils`)
3. **Specific feature** → Feature name (e.g., `modal`, `validation`)
4. **Single file** → File name (e.g., `index.js`, `config.ts`)

### Writing Rules (STRICT ENFORCEMENT)

- **Use imperative mood**: "Add", "Fix", "Update" (NOT "Added", "Fixed", "Updated")
- **Summary**: MAXIMUM 72 characters total (including [Type](scope): prefix)
  - Example: `[Feat](schema-form): add validation` = 39 chars ✅
  - Example: `[Fix](modal): resolve memory leak in modal cleanup handler` = 60 chars ✅
  - Example: `[Feat](schema-form): add dynamic field validation support with debouncing` = 77 chars ❌ TOO LONG
- **Description**: Provide context, explain "why" not just "what"
- **Language**: ENGLISH ONLY - absolutely no Korean (한글), Japanese (日本語), Chinese (中文), or any other language
  - ✅ Correct: "Fix memory leak in modal cleanup"
  - ❌ Wrong: "메모리 누수 수정" (Korean)
  - ❌ Wrong: "モーダルのバグを修正" (Japanese)

### Examples

#### Feature Addition

```
[Feat](schema-form): add dynamic field validation support

- Implemented real-time validation for dynamic form fields
- Added debounce mechanism to prevent excessive validation calls
- Created new ValidationContext for managing validation state

Closes #234
```

#### Bug Fix

```
[Fix](promise-modal): resolve memory leak in modal cleanup

- Fixed event listener not being removed on unmount
- Added proper cleanup in useEffect return function
- Prevents memory accumulation when modals are frequently opened/closed
```

#### Refactoring

```
[Refactor](core): simplify async handling in data fetcher

- Replaced callback pattern with async/await
- Extracted retry logic into separate utility function
- Improved error handling with specific error types
```

#### Version Bump

```
[Chore](deps): update React to version 18.3.0

- Updated react and react-dom to 18.3.0
- Updated @types/react to match new version
- Verified compatibility with existing components
```

#### Breaking Change

```
[Feat](api): redesign authentication flow

- Implemented OAuth 2.0 PKCE flow
- Added refresh token rotation
- Created new AuthProvider component

BREAKING CHANGE: AuthContext API has changed
- `login()` now returns Promise<AuthResult>
- `user` property renamed to `currentUser`
- Removed deprecated `isLoggedIn` in favor of `isAuthenticated`

Migration guide: https://docs.example.com/auth-migration
```

## Important Notes

### What This Command Does

1. Checks for staged changes (stages all if none)
2. Analyzes the diff to understand changes
3. Generates an appropriate commit message following STRICT rules:
   - Summary MUST be under 72 characters total
   - ALL text MUST be in English only
   - MUST use imperative mood
4. Executes the commit immediately WITHOUT co-author attribution

### Validation Checklist (MUST verify before committing)

- [ ] Summary line is under 72 characters (count it!)
- [ ] No Korean, Japanese, Chinese, or other non-English text
- [ ] Uses imperative mood ("Add", "Fix", not "Added", "Fixed")
- [ ] Type is appropriate for the change
- [ ] Scope accurately represents the affected area

### What This Command Does NOT Do

- Does not push to remote
- Does not add co-author attribution
- Does not modify files
- Does not run tests or linting

### Error Handling

**No changes to commit**:

```
⚠️ No changes detected in the working directory.
Nothing to commit.
```

**Commit hook failure**:

```
⚠️ Commit failed due to pre-commit hook.
Review the hook output and fix any issues before retrying.
```

## Quick Reference

```bash
# Manual staging if needed
git add <specific-files>

# Then run /commit

# Or let /commit handle staging automatically
```
