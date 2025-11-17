# Tag Validation Guide

## Validation Workflow

### Phase 1: Tag Discovery

#### Primary Method
```bash
git tag --list "albatrion-*" --sort=-version:refname | head -1
```

#### Validation Methods (Run ALL)
```bash
# Method 2: Alternative sorting
git tag --list | grep "albatrion-" | sort -V | tail -1

# Method 3: Show recent tags
git tag --list --sort=-version:refname | head -10

# Method 4: Simple grep
git tag | grep albatrion
```

#### Expected Results
- All methods should return the same tag
- If results differ, investigate why
- If all return empty, tag does not exist

### Phase 2: Tag Validation

#### Check Tag Exists
```bash
TAG="albatrion-251108"
git show $TAG --oneline | head -1
```

Expected: Tag commit information

#### Check Tag is Reachable
```bash
git rev-list $TAG..HEAD --count
```

Expected: Number (0 or more, not error)

#### Verify Tag Points to Valid Commit
```bash
git log -1 $TAG --format="%H %s"
```

Expected: Commit hash and message

### Phase 3: Troubleshooting

If commands return empty or fail:

1. **Verify Repository State**
   ```bash
   pwd                    # Confirm correct directory
   git status             # Check repository status
   git branch            # Check current branch
   ```

2. **Check All Tags**
   ```bash
   git tag                # List all tags
   git tag | wc -l        # Count tags
   ```

3. **Try Different Patterns**
   ```bash
   git tag --list "*"     # All tags
   git tag --list "v*"    # Version tags
   ```

## Validation Checklist

Before proceeding to change collection:

- [ ] Latest tag found and confirmed
- [ ] Tag format verified (e.g., albatrion-YYMMDD)
- [ ] Tag reachable from current HEAD
- [ ] Tag points to valid commit
- [ ] Cross-verified with multiple methods
- [ ] No command errors occurred

## Error Recovery

### Error: Tag Not Found

**Symptoms**: All commands return empty

**Recovery Steps**:
1. Verify you're in git repository: `git status`
2. Check if ANY tags exist: `git tag`
3. Look for alternative patterns: `git tag | grep -i release`
4. Ask user: "Should I create first tag?"

### Error: Command Failed

**Symptoms**: Git command returns error

**Recovery Steps**:
1. Check git version: `git --version`
2. Verify repository integrity: `git fsck`
3. Try simpler command: `git tag` instead of `git tag --list`
4. Report error to user with context

### Error: Multiple Tags Match

**Symptoms**: Different methods return different tags

**Recovery Steps**:
1. List all matching tags: `git tag --list "pattern-*"`
2. Compare by date: `git log --tags --simplify-by-decoration --pretty="format:%ci %d"`
3. Use most recent by commit date, not tag name
4. Document ambiguity in output

## Common Patterns

### Monorepo Tag Pattern
- Format: `{project}-YYMMDD`
- Example: `albatrion-251108`
- Sorting: By version (numerical)

### Semantic Version Tags
- Format: `v{major}.{minor}.{patch}`
- Example: `v1.2.3`
- Sorting: By semantic version

### Package-Specific Tags
- Format: `{package}@{version}`
- Example: `@canard/schema-form@1.1.0`
- Sorting: By version within package

## Best Practices

1. **Always Validate**: Never trust a single command
2. **Cross-Check**: Use multiple methods for verification
3. **Document Assumptions**: If you assume something, state it
4. **Fail Clearly**: Error messages should be actionable
5. **Preserve Context**: Include git status in error reports
