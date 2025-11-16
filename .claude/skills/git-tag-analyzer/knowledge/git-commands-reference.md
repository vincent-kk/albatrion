# Git Commands Reference for Tag Analysis

## Tag Operations

### Finding Tags

#### List All Tags
```bash
git tag
git tag --list
git tag -l
```

#### List Tags with Pattern
```bash
git tag --list "albatrion-*"
git tag -l "v*"
git tag --list "*-beta"
```

#### Sort Tags
```bash
# By version (recommended for semantic versions)
git tag --list --sort=-version:refname

# By date
git tag --list --sort=-creatordate

# Reverse order
git tag --list --sort=version:refname
```

### Tag Information

#### Show Tag Details
```bash
git show <tag>
git show <tag> --oneline
git show <tag> --stat
```

#### Get Tag Commit
```bash
git rev-list -n 1 <tag>
git log -1 <tag> --format="%H"
```

## Commit Range Operations

### Count Commits Between References

```bash
# Commits from tag to HEAD
git rev-list <tag>..HEAD --count

# Commits between two tags
git rev-list <tag1>..<tag2> --count
```

### List Commits

```bash
# One-line format
git log <tag>..HEAD --oneline

# With file names
git log <tag>..HEAD --oneline --name-only

# With stats
git log <tag>..HEAD --stat

# Specific format
git log <tag>..HEAD --format="%h - %s (%an, %ar)"
```

### Filter Commits

```bash
# By path
git log <tag>..HEAD --oneline -- packages/specific-package/

# By author
git log <tag>..HEAD --author="John Doe"

# By message pattern
git log <tag>..HEAD --grep="feature"
git log <tag>..HEAD --grep="fix" --grep="bug"

# By date
git log <tag>..HEAD --since="2024-01-01"
```

## Diff Operations

### Compare Tag to HEAD

```bash
# Show all changes
git diff <tag>..HEAD

# Only file names
git diff <tag>..HEAD --name-only

# With status (Added, Modified, Deleted)
git diff <tag>..HEAD --name-status

# Statistics
git diff <tag>..HEAD --stat
git diff <tag>..HEAD --numstat
```

### Compare Specific Files

```bash
# Single file
git diff <tag>..HEAD -- path/to/file

# Multiple files
git diff <tag>..HEAD -- path1 path2

# Specific package
git diff <tag>..HEAD -- packages/schema-form/
```

### Unified Diff Format

```bash
# With context lines (default 3)
git diff <tag>..HEAD --unified=3

# More context
git diff <tag>..HEAD --unified=5

# Full file context
git diff <tag>..HEAD --unified=999999
```

## File Operations at Tag

### Show File Content at Tag

```bash
# Show file
git show <tag>:path/to/file

# Save to file
git show <tag>:packages/pkg/package.json > /tmp/old-package.json
```

### Compare File Versions

```bash
# Using git show
git show <tag>:package.json
git show HEAD:package.json

# Using diff
diff <(git show <tag>:package.json) <(git show HEAD:package.json)
```

## Merge Base Operations

### Find Common Ancestor

```bash
# Merge base between tag and HEAD
git merge-base <tag> HEAD

# Merge base between two tags
git merge-base <tag1> <tag2>
```

### Three-Dot Diff

```bash
# Changes on current branch since diverging from tag
git diff <tag>...HEAD

# Equivalent to:
MERGE_BASE=$(git merge-base <tag> HEAD)
git diff $MERGE_BASE..HEAD
```

## Branch Comparison

### CORRECT: Changes on Feature Branch Only

```bash
# Using merge-base (recommended)
MERGE_BASE=$(git merge-base master HEAD)
git diff $MERGE_BASE..HEAD

# Using three-dot syntax (equivalent)
git diff master...HEAD
```

### WRONG: Includes Base Branch Changes

```bash
# DON'T USE THIS for branch comparison
git diff master..HEAD
```

## Package-Specific Operations

### Find Changed Packages

```bash
# List changed directories under packages/
git diff <tag>..HEAD --name-only | grep "^packages/" | cut -d/ -f1-3 | sort -u

# For monorepo with nested packages
git diff <tag>..HEAD --name-only | grep "^packages/" | sed 's|/.*||' | sort -u
```

### Get Package.json Version

```bash
# At tag
git show <tag>:packages/pkg/package.json | jq -r '.version'

# At HEAD
cat packages/pkg/package.json | jq -r '.version'

# Get package name
cat packages/pkg/package.json | jq -r '.name'
```

### Compare Package Versions

```bash
# Using jq
OLD_VERSION=$(git show <tag>:packages/pkg/package.json | jq -r '.version')
NEW_VERSION=$(cat packages/pkg/package.json | jq -r '.version')
echo "Version: $OLD_VERSION → $NEW_VERSION"
```

## Advanced Patterns

### Multi-Pattern Tag Search

```bash
# Find latest from multiple patterns
{
  git tag --list "albatrion-*" --sort=-version:refname
  git tag --list "release-*" --sort=-version:refname
} | head -1
```

### Conditional Tag Operations

```bash
# Check if tag exists
if git rev-parse <tag> >/dev/null 2>&1; then
  echo "Tag exists"
else
  echo "Tag not found"
fi

# Get tag or default
LATEST_TAG=$(git tag --list "albatrion-*" --sort=-version:refname | head -1)
LATEST_TAG=${LATEST_TAG:-HEAD}
```

### Commit Message Analysis

```bash
# Extract commit types
git log <tag>..HEAD --format="%s" | sed 's/:.*//' | sort | uniq -c

# Find breaking changes
git log <tag>..HEAD --grep="BREAKING" --grep="breaking"

# Find version bumps
git log <tag>..HEAD --grep="bump version" --grep="version"
```

## Performance Tips

### Shallow Clone Considerations

```bash
# Check if shallow
git rev-parse --is-shallow-repository

# If shallow, some operations may fail
# Solution: Unshallow if needed
git fetch --unshallow
```

### Large Repository Optimization

```bash
# Limit diff output
git diff <tag>..HEAD --stat | head -100

# Use --quiet for existence checks
git diff --quiet <tag>..HEAD && echo "No changes" || echo "Has changes"

# Count without listing
git rev-list <tag>..HEAD --count
```

## Error Handling

### Common Errors

```bash
# Fatal: ambiguous argument '<tag>': unknown revision
# Solution: Tag doesn't exist, verify with git tag

# Fatal: bad revision '<tag>..HEAD'
# Solution: Check tag format, ensure no typos

# Error: Could not read from repository
# Solution: Check git status, repository integrity
```

### Validation Pattern

```bash
# Safe tag operation
TAG="albatrion-251108"

# 1. Verify tag exists
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: Tag '$TAG' not found"
  exit 1
fi

# 2. Verify tag is reachable
if ! git merge-base --is-ancestor "$TAG" HEAD; then
  echo "Warning: Tag '$TAG' is not ancestor of HEAD"
fi

# 3. Proceed with operations
git log "$TAG..HEAD" --oneline
```

## Reference

- Git Documentation: https://git-scm.com/docs
- Git Book: https://git-scm.com/book/en/v2
