#!/usr/bin/env bash
set -euo pipefail

# Git Analysis Mode Detection Script
# Returns: commit | branch | staged

COMMIT_HASH="${1:-}"
BASE_BRANCH="${2:-master}"

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)

# Detect mode
if [ -n "$COMMIT_HASH" ]; then
  # Validate commit hash
  if ! git cat-file -t "$COMMIT_HASH" &>/dev/null; then
    echo "Error: Invalid commit hash '$COMMIT_HASH'" >&2
    exit 1
  fi
  echo "commit"
elif [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "main" ]; then
  # Validate base branch exists
  if ! git rev-parse --verify "$BASE_BRANCH" &>/dev/null; then
    echo "Error: Base branch '$BASE_BRANCH' not found" >&2
    exit 1
  fi
  echo "branch"
else
  # Check if there are staged changes
  if git diff --cached --quiet; then
    echo "Error: No staged changes found" >&2
    exit 1
  fi
  echo "staged"
fi
