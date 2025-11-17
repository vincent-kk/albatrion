# Monorepo Package Detection

## Overview

In monorepo projects, package detection requires understanding:
1. Project structure conventions
2. Package naming patterns
3. Version management strategies
4. Dependency relationships

## Package Structure Patterns

### Common Monorepo Layouts

#### Yarn/NPM Workspaces
```
packages/
├── package-a/
│   └── package.json (@scope/package-a)
├── package-b/
│   └── package.json (@scope/package-b)
└── shared/
    └── package.json (@scope/shared)
```

#### Nested Structure
```
packages/
├── category-1/
│   ├── package-a/
│   │   └── package.json (@scope/category-1-package-a)
│   └── package-b/
│       └── package.json (@scope/category-1-package-b)
└── category-2/
    └── package-c/
        └── package.json (@scope/category-2-package-c)
```

#### Mixed Structure
```
packages/
├── core/
│   └── package.json (@scope/core)
├── plugins/
│   ├── plugin-a/
│   │   └── package.json (@scope/plugin-a)
│   └── plugin-b/
│       └── package.json (@scope/plugin-b)
└── utilities/
    ├── util-a/
    └── util-b/
```

## Package Name Resolution

### CRITICAL: Never Assume Package Names

**❌ WRONG**: Assume based on directory path
```bash
# Directory: packages/canard/schema-form
# WRONG assumption: @albatrion/canard/schema-form
```

**✅ CORRECT**: Read from package.json
```bash
# Directory: packages/canard/schema-form
cat packages/canard/schema-form/package.json | jq -r '.name'
# Output: @canard/schema-form
```

### Package Name Extraction

```bash
# Find all packages
find packages -name "package.json" -not -path "*/node_modules/*" | while read pkg; do
  NAME=$(cat "$pkg" | jq -r '.name')
  VERSION=$(cat "$pkg" | jq -r '.version')
  DIR=$(dirname "$pkg")
  echo "$DIR: $NAME@$VERSION"
done
```

### Batch Package Detection

```bash
# Get all package names and paths
find packages -name "package.json" -not -path "*/node_modules/*" -exec sh -c '
  echo "$(dirname "$1")|$(cat "$1" | jq -r ".name")|$(cat "$1" | jq -r ".version")"
' _ {} \; | column -t -s "|"
```

## Changed Package Detection

### Method 1: Git Diff Based

```bash
# Get changed files since tag
CHANGED_FILES=$(git diff <tag>..HEAD --name-only)

# Extract package directories
CHANGED_PACKAGES=$(echo "$CHANGED_FILES" | grep "^packages/" | cut -d/ -f1-3 | sort -u)

# Get actual package names
for dir in $CHANGED_PACKAGES; do
  if [ -f "$dir/package.json" ]; then
    NAME=$(cat "$dir/package.json" | jq -r '.name')
    OLD_VERSION=$(git show <tag>:"$dir/package.json" 2>/dev/null | jq -r '.version')
    NEW_VERSION=$(cat "$dir/package.json" | jq -r '.version')

    if [ "$OLD_VERSION" != "$NEW_VERSION" ]; then
      echo "$NAME: $OLD_VERSION → $NEW_VERSION"
    fi
  fi
done
```

### Method 2: Version Comparison Based

```bash
# Compare all package.json versions
find packages -name "package.json" -not -path "*/node_modules/*" | while read pkg; do
  OLD_VERSION=$(git show <tag>:"$pkg" 2>/dev/null | jq -r '.version // "missing"')
  NEW_VERSION=$(cat "$pkg" | jq -r '.version')

  if [ "$OLD_VERSION" != "$NEW_VERSION" ]; then
    NAME=$(cat "$pkg" | jq -r '.name')
    echo "$NAME: $OLD_VERSION → $NEW_VERSION ($pkg)"
  fi
done
```

## Version Bump Detection

### Semantic Version Comparison

```bash
#!/bin/bash

compare_versions() {
  local old_version=$1
  local new_version=$2

  # Extract major.minor.patch
  IFS='.' read -r old_major old_minor old_patch <<< "$old_version"
  IFS='.' read -r new_major new_minor new_patch <<< "$new_version"

  # Remove non-numeric suffixes (e.g., -beta)
  old_major=${old_major%%-*}
  new_major=${new_major%%-*}

  if [ "$new_major" -gt "$old_major" ]; then
    echo "major"
  elif [ "$new_major" -eq "$old_major" ] && [ "$new_minor" -gt "$old_minor" ]; then
    echo "minor"
  elif [ "$new_major" -eq "$old_major" ] && [ "$new_minor" -eq "$old_minor" ] && [ "$new_patch" -gt "$old_patch" ]; then
    echo "patch"
  else
    echo "unknown"
  fi
}

# Usage
BUMP_TYPE=$(compare_versions "1.2.3" "1.3.0")
echo "Bump type: $BUMP_TYPE"  # Output: minor
```

### Detect New Packages

```bash
# Find packages that don't exist at tag
find packages -name "package.json" -not -path "*/node_modules/*" | while read pkg; do
  if ! git show <tag>:"$pkg" >/dev/null 2>&1; then
    NAME=$(cat "$pkg" | jq -r '.name')
    VERSION=$(cat "$pkg" | jq -r '.version')
    echo "🆕 New package: $NAME@$VERSION"
  fi
done
```

## Dependency Analysis

### Find Package Dependencies

```bash
#!/bin/bash

get_package_deps() {
  local pkg_path=$1
  local pkg_json="$pkg_path/package.json"

  echo "=== Dependencies for $(cat "$pkg_json" | jq -r '.name') ==="

  # Production dependencies
  echo "Production:"
  cat "$pkg_json" | jq -r '.dependencies // {} | keys[]' | sort

  # Dev dependencies
  echo -e "\nDevelopment:"
  cat "$pkg_json" | jq -r '.devDependencies // {} | keys[]' | sort

  # Peer dependencies
  echo -e "\nPeer:"
  cat "$pkg_json" | jq -r '.peerDependencies // {} | keys[]' | sort
}
```

### Detect Internal Dependencies

```bash
# Find packages that depend on each other (workspace dependencies)
find packages -name "package.json" -not -path "*/node_modules/*" | while read pkg; do
  PKG_NAME=$(cat "$pkg" | jq -r '.name')

  # Find internal dependencies (starting with @)
  INTERNAL_DEPS=$(cat "$pkg" | jq -r '
    (.dependencies // {}) + (.devDependencies // {})
    | to_entries[]
    | select(.key | startswith("@canard") or startswith("@winglet") or startswith("@aileron") or startswith("@lerx"))
    | .key
  ')

  if [ -n "$INTERNAL_DEPS" ]; then
    echo "$PKG_NAME depends on:"
    echo "$INTERNAL_DEPS" | sed 's/^/  - /'
  fi
done
```

## Package Categorization

### By Scope

```bash
# Group packages by scope
find packages -name "package.json" -not -path "*/node_modules/*" -exec cat {} \; | \
  jq -r '.name' | \
  sed 's/@\([^/]*\)\/.*/\1/' | \
  sort | uniq -c
```

### By Type (Plugin, Core, Utility)

```bash
# Categorize by naming pattern
find packages -name "package.json" -not -path "*/node_modules/*" | while read pkg; do
  NAME=$(cat "$pkg" | jq -r '.name')

  case "$NAME" in
    *-plugin)
      echo "Plugin: $NAME"
      ;;
    *-util*|*-utils)
      echo "Utility: $NAME"
      ;;
    */core|*/schema-form)
      echo "Core: $NAME"
      ;;
    *)
      echo "Other: $NAME"
      ;;
  esac
done | sort
```

## Common Package Patterns

### Albatrion Monorepo Structure

Based on the project:

```yaml
scopes:
  - "@aileron/*": Performance utilities
  - "@canard/schema-form*": Form library and plugins
  - "@lerx/*": Promise-based utilities
  - "@winglet/*": Common utilities

plugin_pattern: "@canard/schema-form-*-plugin"
core_packages:
  - "@canard/schema-form"
  - "@lerx/promise-modal"
```

### Package Naming Conventions

```
Format: @{scope}/{package-name}[-{type}]

Examples:
  @canard/schema-form              # Core package
  @canard/schema-form-antd-plugin  # Plugin
  @winglet/common-utils            # Utility
  @aileron/benchmark-form          # Tool
```

## Best Practices

1. **Always Read package.json**: Never infer package names from paths
2. **Handle Missing Files**: Package might not exist at tag (new package)
3. **Validate JSON**: Use `jq` to safely parse package.json
4. **Check node_modules**: Exclude node_modules in all searches
5. **Sort Results**: Always sort for consistent output
6. **Cross-Reference**: Verify package changes with git diff

## Troubleshooting

### Package.json Not Found at Tag

```bash
# Check if package is new
if ! git show <tag>:packages/new-pkg/package.json >/dev/null 2>&1; then
  echo "New package (didn't exist at tag)"
else
  # Package existed, compare versions
  git diff <tag>..HEAD -- packages/new-pkg/package.json
fi
```

### Multiple Package.json Files

```bash
# Exclude nested node_modules
find packages -name "package.json" -not -path "*/node_modules/*" -type f

# Only direct package.json (not nested)
find packages -maxdepth 3 -name "package.json"
```

### Invalid JSON

```bash
# Validate before parsing
if jq empty "$pkg" 2>/dev/null; then
  echo "Valid JSON"
else
  echo "Invalid JSON in $pkg"
fi
```

## Reference

- Yarn Workspaces: https://yarnpkg.com/features/workspaces
- NPM Workspaces: https://docs.npmjs.com/cli/using-npm/workspaces
- Lerna: https://lerna.js.org/
