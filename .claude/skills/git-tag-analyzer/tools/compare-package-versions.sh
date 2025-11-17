#!/bin/bash

# Compare Package Versions Script
# Compares package.json versions between a tag and HEAD for monorepo packages

set -euo pipefail

TAG="${1:-}"
shift

if [ -z "$TAG" ]; then
  echo "Usage: $0 <tag> [package-paths...]" >&2
  echo "Example: $0 albatrion-251108 packages/canard/schema-form" >&2
  exit 1
fi

# Verify tag exists
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: Tag '$TAG' not found" >&2
  exit 1
fi

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1" >&2
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1" >&2
}

# Function to compare semantic versions
compare_semver() {
  local old_version=$1
  local new_version=$2

  # Extract major.minor.patch (remove -beta, -alpha suffixes)
  local old_clean=$(echo "$old_version" | sed 's/-.*$//')
  local new_clean=$(echo "$new_version" | sed 's/-.*$//')

  IFS='.' read -r old_major old_minor old_patch <<< "$old_clean"
  IFS='.' read -r new_major new_minor new_patch <<< "$new_clean"

  # Default to 0 if empty
  old_major=${old_major:-0}
  old_minor=${old_minor:-0}
  old_patch=${old_patch:-0}
  new_major=${new_major:-0}
  new_minor=${new_minor:-0}
  new_patch=${new_patch:-0}

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

# Function to process a single package
process_package() {
  local pkg_path=$1
  local pkg_json="$pkg_path/package.json"

  # Check if package.json exists at HEAD
  if [ ! -f "$pkg_json" ]; then
    log_warn "Package.json not found: $pkg_json"
    return
  fi

  # Get current package info
  local name=$(cat "$pkg_json" | jq -r '.name')
  local new_version=$(cat "$pkg_json" | jq -r '.version')

  # Check if package existed at tag
  local old_version=""
  if git show "$TAG:$pkg_json" >/dev/null 2>&1; then
    old_version=$(git show "$TAG:$pkg_json" | jq -r '.version')
  else
    # New package (didn't exist at tag)
    echo "{\"name\":\"$name\",\"path\":\"$pkg_path\",\"oldVersion\":null,\"newVersion\":\"$new_version\",\"bumpType\":\"new\",\"isNew\":true}"
    return
  fi

  # Compare versions
  if [ "$old_version" != "$new_version" ]; then
    local bump_type=$(compare_semver "$old_version" "$new_version")
    echo "{\"name\":\"$name\",\"path\":\"$pkg_path\",\"oldVersion\":\"$old_version\",\"newVersion\":\"$new_version\",\"bumpType\":\"$bump_type\",\"isNew\":false}"
  fi
}

# Main logic
log_info "Comparing package versions between $TAG and HEAD"

# If no paths provided, find all packages
if [ $# -eq 0 ]; then
  log_info "No paths provided, searching for all packages..."

  PACKAGES=$(find packages -name "package.json" -not -path "*/node_modules/*" 2>/dev/null | while read pkg; do
    dirname "$pkg"
  done)
else
  PACKAGES="$@"
fi

# Process each package
RESULTS="["
FIRST=true

for pkg_path in $PACKAGES; do
  RESULT=$(process_package "$pkg_path")

  if [ -n "$RESULT" ]; then
    if [ "$FIRST" = true ]; then
      FIRST=false
    else
      RESULTS+=","
    fi
    RESULTS+="$RESULT"
  fi
done

RESULTS+="]"

# Output JSON
echo "$RESULTS" | jq '.'
