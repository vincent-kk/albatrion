# Git Analysis Mode Detection

## Priority Rules

Review prioritization (highest to lowest):

1. **Commit Hash Provided**: Use specific commit changes
2. **Non-master Branch**: Compare current branch HEAD with master (using merge-base)
3. **Master Branch**: Compare staged changes with master HEAD

## Mode Detection Algorithm

```bash
# Check current branch
CURRENT_BRANCH=$(git branch --show-current)

# Check if commit hash is provided as parameter
if [ -n "$COMMIT_HASH" ]; then
    echo "Mode: Specific Commit Analysis"
    MODE="commit"
elif [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo "Mode: Branch Comparison"
    MODE="branch"
else
    echo "Mode: Staged Changes"
    MODE="staged"
fi
```

## Mode Characteristics

### Commit Mode
- **Trigger**: `--commit <hash>` parameter provided
- **Target**: Single commit changes
- **Use Case**: Review specific commit in history

### Branch Mode  
- **Trigger**: Current branch is not master/main AND no commit hash
- **Target**: All commits since divergence from base branch
- **Use Case**: Review feature branch before merge

### Staged Mode
- **Trigger**: On master/main branch AND no commit hash
- **Target**: Currently staged changes
- **Use Case**: Review changes before committing to master

## Validation

```bash
# For commit mode
git cat-file -t $COMMIT_HASH 2>/dev/null || echo "Invalid commit hash"

# For branch mode  
git rev-parse --verify $BASE_BRANCH 2>/dev/null || echo "Invalid base branch"

# For staged mode
git diff --cached --quiet && echo "No staged changes"
```
