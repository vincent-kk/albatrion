#!/bin/bash

# Find Latest Tag Script
# Finds the latest Git tag matching a pattern with multiple validation methods

set -euo pipefail

PATTERN="${1:-albatrion-*}"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1" >&2
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1" >&2
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Method 1: Primary method with version sort
find_method_1() {
  git tag --list "$PATTERN" --sort=-version:refname 2>/dev/null | head -1
}

# Method 2: Alternative with natural sort
find_method_2() {
  git tag --list 2>/dev/null | grep "^${PATTERN%%\*}" | sort -V | tail -1
}

# Method 3: Show all matching tags
find_method_3() {
  git tag --list "$PATTERN" --sort=-version:refname 2>/dev/null | head -10
}

# Method 4: Simple grep
find_method_4() {
  git tag 2>/dev/null | grep "^${PATTERN%%\*}" | sort -V | tail -1
}

main() {
  log_info "Searching for latest tag matching pattern: $PATTERN"

  # Run all methods
  TAG_METHOD_1=$(find_method_1 || echo "")
  TAG_METHOD_2=$(find_method_2 || echo "")

  # Cross-validate
  if [ -z "$TAG_METHOD_1" ] && [ -z "$TAG_METHOD_2" ]; then
    log_error "No tags found matching pattern: $PATTERN"

    # Additional troubleshooting
    TAG_COUNT=$(git tag 2>/dev/null | wc -l | tr -d ' ')
    log_info "Total tags in repository: $TAG_COUNT"

    if [ "$TAG_COUNT" -eq 0 ]; then
      log_warn "Repository has no tags"
    else
      log_info "Available tags:"
      git tag 2>/dev/null | head -5 | while read tag; do
        echo "  - $tag" >&2
      done
    fi

    exit 1
  fi

  # Verify both methods agree
  if [ "$TAG_METHOD_1" != "$TAG_METHOD_2" ]; then
    log_warn "Methods returned different results:"
    log_warn "  Method 1 (version sort): $TAG_METHOD_1"
    log_warn "  Method 2 (natural sort): $TAG_METHOD_2"
    log_warn "Using Method 1 result"
  fi

  LATEST_TAG="$TAG_METHOD_1"

  # Final validation
  if ! git rev-parse "$LATEST_TAG" >/dev/null 2>&1; then
    log_error "Tag '$LATEST_TAG' found but not reachable"
    exit 1
  fi

  log_info "Latest tag found: $LATEST_TAG"

  # Output to stdout (for script consumption)
  echo "$LATEST_TAG"
}

# Run main function
main "$@"
