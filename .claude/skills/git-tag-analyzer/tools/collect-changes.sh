#!/bin/bash

# Collect Changes Script
# Collects all commits and file changes between a tag and HEAD

set -euo pipefail

TAG="${1:-}"

if [ -z "$TAG" ]; then
  echo "Usage: $0 <tag>" >&2
  exit 1
fi

# Verify tag exists
if ! git rev-parse "$TAG" >/dev/null 2>&1; then
  echo "Error: Tag '$TAG' not found" >&2
  exit 1
fi

# Color codes
GREEN='\033[0;32m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1" >&2
}

# Count commits
log_info "Counting commits since $TAG"
COMMIT_COUNT=$(git rev-list "$TAG..HEAD" --count)

log_info "Found $COMMIT_COUNT commits"

if [ "$COMMIT_COUNT" -eq 0 ]; then
  cat <<EOF
{
  "commitCount": 0,
  "commits": [],
  "filesChanged": [],
  "message": "No changes since tag $TAG"
}
EOF
  exit 0
fi

# Collect commit information
log_info "Collecting commit details"

COMMITS_JSON=$(git log "$TAG..HEAD" --format='{"hash":"%H","shortHash":"%h","author":"%an","email":"%ae","date":"%ci","message":"%s"}' | jq -s '.')

# Collect changed files with status
log_info "Collecting changed files"

FILES_JSON=$(git diff "$TAG..HEAD" --name-status | awk '{
  status = $1
  file = $2
  printf "{\"file\":\"%s\",\"status\":\"%s\"},\n", file, status
}' | sed '$ s/,$//' | jq -s '.')

# Get diff stats
STATS=$(git diff "$TAG..HEAD" --numstat | awk '
  BEGIN { added=0; deleted=0; files=0 }
  {
    added += $1
    deleted += $2
    files++
  }
  END { printf "{\"filesChanged\":%d,\"linesAdded\":%d,\"linesDeleted\":%d}", files, added, deleted }
')

# Combine all data
cat <<EOF | jq '.'
{
  "tag": "$TAG",
  "commitCount": $COMMIT_COUNT,
  "commits": $COMMITS_JSON,
  "files": $FILES_JSON,
  "stats": $STATS
}
EOF
