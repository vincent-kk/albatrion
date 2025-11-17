# Git Commands Reference

## Commit Analysis

### Basic Commit Information
```bash
# Show commit with stats
git show $COMMIT_HASH --stat --format=fuller

# Get changed files with status
git show $COMMIT_HASH --name-status

# Get detailed diff
git show $COMMIT_HASH --unified=3
```

### Commit Metadata
```bash
# Extract commit details
git log -1 $COMMIT_HASH --format="%H%n%an%n%ad%n%s%n%b"
# Output: hash, author, date, subject, body

# Get commit parents
git show $COMMIT_HASH --format="%P"
```

## Branch Comparison

### ⚠️ CRITICAL: Use Merge-Base for Target Branch Changes Only

**CORRECT Methods:**

```bash
# Method 1: Explicit merge-base
MERGE_BASE=$(git merge-base master HEAD)
git diff $MERGE_BASE..HEAD --unified=3

# Method 2: Three-dot syntax (recommended)
git diff master...HEAD --unified=3

# Get commits in target branch only
git log $MERGE_BASE..HEAD --oneline --stat
```

**WRONG Methods:**

```bash
# ❌ Two-dot syntax includes base branch changes
git diff master..HEAD

# ❌ Log without merge-base shows both branches  
git log master..HEAD
```

### Why Merge-Base?

```
master:  A---B---C---D
              \
feature:       E---F---G (HEAD)
```

- `git diff master..HEAD` compares D with G → includes C, D (master's new commits)
- `git diff $(git merge-base master HEAD)..HEAD` compares B with G → ONLY E, F, G
- `git diff master...HEAD` (three-dot) = merge-base method

### Branch Analysis Commands

```bash
# Find common ancestor
MERGE_BASE=$(git merge-base master HEAD)

# Verify merge-base
echo "Common ancestor: $MERGE_BASE"
git log -1 $MERGE_BASE --oneline

# Get statistics (target branch only)
git diff $MERGE_BASE..HEAD --stat

# Get file-specific changes
git diff $MERGE_BASE..HEAD -- path/to/file.ts

# Find commits that modified specific file (target branch only)
git log $MERGE_BASE..HEAD --oneline -- path/to/file.ts

# Detect potential merge conflicts
git merge-tree $MERGE_BASE master HEAD
```

## Staged Changes Analysis

### Basic Staged Commands
```bash
# Check for staged changes
git diff --cached --quiet && echo "No staged changes" || echo "Staged changes detected"

# Get staged diff
git diff --cached --unified=3

# Get staged files list
git diff --cached --name-only

# Get staged file status
git diff --cached --name-status
```

### Staged vs Unstaged
```bash
# Only staged changes
git diff --cached

# Only unstaged changes  
git diff

# All changes (staged + unstaged)
git diff HEAD
```

### Staged File Analysis
```bash
# Specific file staged changes
git diff --cached -- path/to/file.ts

# Staged changes with context (5 lines)
git diff --cached --unified=5

# Ignore whitespace changes
git diff --cached -w

# Show word-level diff
git diff --cached --word-diff
```

## File Classification Helpers

```bash
# Get file extension
filename="src/components/Button.tsx"
extension="${filename##*.}"  # tsx

# Get directory
dirname=$(dirname "$filename")  # src/components

# Check if file matches pattern
if [[ "$filename" =~ \.test\. ]]; then
  echo "Test file"
fi

# Check if file is in specific directory
if [[ "$filename" =~ ^src/components/ ]]; then
  echo "Component file"
fi
```

## Diff Parsing

```bash
# Get lines added/deleted
stats=$(git diff $MERGE_BASE..HEAD --numstat)
# Output format: added\tdeleted\tfilename

# Parse stats
while IFS=$'\t' read added deleted filename; do
  echo "File: $filename, +$added, -$deleted"
done <<< "$stats"

# Get total changes
git diff $MERGE_BASE..HEAD --shortstat
# Output: X files changed, Y insertions(+), Z deletions(-)
```

## Error Handling

```bash
# Check if commit exists
if ! git cat-file -t $COMMIT_HASH &>/dev/null; then
  echo "Error: Commit $COMMIT_HASH not found"
  exit 1
fi

# Check if branch exists
if ! git rev-parse --verify $BRANCH_NAME &>/dev/null; then
  echo "Error: Branch $BRANCH_NAME not found"
  exit 1
fi

# Check for merge conflicts
if git diff --check &>/dev/null; then
  echo "No whitespace errors"
else
  echo "Warning: Whitespace errors detected"
fi
```

## Performance Tips

```bash
# Limit diff context for large files
git diff --unified=1  # Minimal context

# Skip binary files
git diff --text=false

# Get summary only (faster)
git diff --stat --summary

# Use shallow clone for faster analysis
git diff --no-ext-diff  # Disable external diff tools
```
