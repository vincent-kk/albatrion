#!/bin/bash

# Categorize Changes Script
# Categorizes commits into Breaking/Feature/Improvement/BugFix based on commit messages

set -euo pipefail

INPUT_JSON="${1:-}"

if [ -z "$INPUT_JSON" ]; then
  echo "Usage: $0 <input-json-file>" >&2
  echo "  or: cat data.json | $0 -" >&2
  exit 1
fi

# Read input
if [ "$INPUT_JSON" = "-" ]; then
  DATA=$(cat)
else
  DATA=$(cat "$INPUT_JSON")
fi

# Color codes
GREEN='\033[0;32m'
NC='\033[0m'

log_info() {
  echo -e "${GREEN}[INFO]${NC} $1" >&2
}

# Function to categorize a single commit
categorize_commit() {
  local message="$1"
  local hash="$2"

  # Normalize message (lowercase for comparison)
  local msg_lower=$(echo "$message" | tr '[:upper:]' '[:lower:]')

  # Check for breaking changes (highest priority)
  if echo "$msg_lower" | grep -qE '(breaking change|breaking:|!:|^[a-z]+!:)'; then
    echo "breaking"
    return
  fi

  # Check for bug fixes
  if echo "$msg_lower" | grep -qE '^(fix|bugfix|fixed|hotfix|patch):'; then
    echo "bugfix"
    return
  fi

  # Check for features
  if echo "$msg_lower" | grep -qE '^(feat|feature|add|added):'; then
    echo "feature"
    return
  fi

  # Check for improvements/refactoring
  if echo "$msg_lower" | grep -qE '^(perf|improve|enhance|refactor|optimize|upgrade):'; then
    echo "improvement"
    return
  fi

  # Check for internal/skip
  if echo "$msg_lower" | grep -qE '^(docs|test|chore|ci|build|style):'; then
    echo "skip"
    return
  fi

  # Default to improvement if not clearly categorized
  echo "improvement"
}

log_info "Categorizing commits"

# Extract commits and categorize
CATEGORIZED=$(echo "$DATA" | jq -r '.changes.commits[]? // empty | @json' | while read -r commit_json; do
  MESSAGE=$(echo "$commit_json" | jq -r '.message')
  HASH=$(echo "$commit_json" | jq -r '.hash')
  AUTHOR=$(echo "$commit_json" | jq -r '.author')

  CATEGORY=$(categorize_commit "$MESSAGE" "$HASH")

  # Skip internal commits
  if [ "$CATEGORY" = "skip" ]; then
    continue
  fi

  # Output categorized commit
  cat <<EOF
{
  "hash": "$HASH",
  "message": "$MESSAGE",
  "author": "$AUTHOR",
  "category": "$CATEGORY"
}
EOF
done | jq -s '.')

# Count by category
BREAKING_COUNT=$(echo "$CATEGORIZED" | jq '[.[] | select(.category == "breaking")] | length')
FEATURE_COUNT=$(echo "$CATEGORIZED" | jq '[.[] | select(.category == "feature")] | length')
IMPROVEMENT_COUNT=$(echo "$CATEGORIZED" | jq '[.[] | select(.category == "improvement")] | length')
BUGFIX_COUNT=$(echo "$CATEGORIZED" | jq '[.[] | select(.category == "bugfix")] | length')

log_info "Categorization complete:"
log_info "  Breaking: $BREAKING_COUNT"
log_info "  Features: $FEATURE_COUNT"
log_info "  Improvements: $IMPROVEMENT_COUNT"
log_info "  Bug Fixes: $BUGFIX_COUNT"

# Output categorized data
cat <<EOF | jq '.'
{
  "tag": $(echo "$DATA" | jq '.latestTag // .tag'),
  "packages": $(echo "$DATA" | jq '.packages // []'),
  "categorized": {
    "breaking": $(echo "$CATEGORIZED" | jq '[.[] | select(.category == "breaking")]'),
    "features": $(echo "$CATEGORIZED" | jq '[.[] | select(.category == "feature")]'),
    "improvements": $(echo "$CATEGORIZED" | jq '[.[] | select(.category == "improvement")]'),
    "bugfixes": $(echo "$CATEGORIZED" | jq '[.[] | select(.category == "bugfix")]')
  },
  "stats": {
    "breaking": $BREAKING_COUNT,
    "features": $FEATURE_COUNT,
    "improvements": $IMPROVEMENT_COUNT,
    "bugfixes": $BUGFIX_COUNT,
    "total": $((BREAKING_COUNT + FEATURE_COUNT + IMPROVEMENT_COUNT + BUGFIX_COUNT))
  }
}
EOF
