#!/bin/bash

# Validate Tag Existence Script
# Validates that a tag exists and is reachable with multiple verification methods

set -euo pipefail

TAG="${1:-}"

if [ -z "$TAG" ]; then
  echo "Usage: $0 <tag>" >&2
  exit 1
fi

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1" >&2
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1" >&2
}

log_success() {
  echo -e "${GREEN}[✓]${NC} $1" >&2
}

log_fail() {
  echo -e "${RED}[✗]${NC} $1" >&2
}

# Validation checks
VALIDATION_PASSED=true

# Check 1: Tag exists
log_info "Checking if tag exists: $TAG"
if git rev-parse "$TAG" >/dev/null 2>&1; then
  log_success "Tag exists"
else
  log_fail "Tag does not exist"
  VALIDATION_PASSED=false
fi

# Check 2: Tag is reachable from HEAD
if [ "$VALIDATION_PASSED" = true ]; then
  log_info "Checking if tag is reachable from HEAD"

  if git merge-base --is-ancestor "$TAG" HEAD 2>/dev/null; then
    log_success "Tag is ancestor of HEAD"
  else
    log_fail "Tag is not ancestor of HEAD (might be on different branch)"
    # This is a warning, not a failure
  fi
fi

# Check 3: Get commit hash
if [ "$VALIDATION_PASSED" = true ]; then
  log_info "Getting tag commit hash"

  COMMIT_HASH=$(git rev-list -n 1 "$TAG" 2>/dev/null || echo "")
  if [ -n "$COMMIT_HASH" ]; then
    log_success "Tag points to commit: $COMMIT_HASH"
  else
    log_fail "Could not get commit hash"
    VALIDATION_PASSED=false
  fi
fi

# Check 4: Get tag message/details
if [ "$VALIDATION_PASSED" = true ]; then
  log_info "Getting tag details"

  TAG_MESSAGE=$(git log -1 "$TAG" --format="%s" 2>/dev/null || echo "")
  if [ -n "$TAG_MESSAGE" ]; then
    log_success "Tag message: $TAG_MESSAGE"
  else
    log_fail "Could not get tag message"
    VALIDATION_PASSED=false
  fi
fi

# Output JSON result
if [ "$VALIDATION_PASSED" = true ]; then
  cat <<EOF
{
  "valid": true,
  "tag": "$TAG",
  "commitHash": "$COMMIT_HASH",
  "commitMessage": "$TAG_MESSAGE"
}
EOF
  exit 0
else
  cat <<EOF
{
  "valid": false,
  "tag": "$TAG",
  "error": "Tag validation failed"
}
EOF
  exit 1
fi
