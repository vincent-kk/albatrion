#!/bin/bash

# Generate Release Note Script
# Generates formatted release note document from categorized data

set -euo pipefail

INPUT_JSON="${1:-}"
OUTPUT_FILE="${2:-}"

if [ -z "$INPUT_JSON" ]; then
  echo "Usage: $0 <categorized-json> [output-file]" >&2
  echo "  If output-file not specified, prints to stdout" >&2
  exit 1
fi

# Read input
if [ "$INPUT_JSON" = "-" ]; then
  DATA=$(cat)
else
  DATA=$(cat "$INPUT_JSON")
fi

# Extract data
TAG=$(echo "$DATA" | jq -r '.tag')
PACKAGES=$(echo "$DATA" | jq -r '.packages')
BREAKING=$(echo "$DATA" | jq -r '.categorized.breaking')
FEATURES=$(echo "$DATA" | jq -r '.categorized.features')
IMPROVEMENTS=$(echo "$DATA" | jq -r '.categorized.improvements')
BUGFIXES=$(echo "$DATA" | jq -r '.categorized.bugfixes')

# Extract date from tag (assuming albatrion-YYMMDD format)
DATE_SUFFIX=$(echo "$TAG" | sed 's/.*-//')

# Determine output file
if [ -z "$OUTPUT_FILE" ]; then
  OUTPUT_FILE="release-notes-${DATE_SUFFIX}.md"
fi

# Generate title summary
generate_title_summary() {
  local breaking_count=$(echo "$DATA" | jq -r '.stats.breaking')
  local feature_count=$(echo "$DATA" | jq -r '.stats.features')
  local improvement_count=$(echo "$DATA" | jq -r '.stats.improvements')

  # Priority: Breaking > Features > Improvements
  if [ "$breaking_count" -gt 0 ]; then
    echo "Breaking Changes and Updates"
  elif [ "$feature_count" -gt 2 ]; then
    echo "New Features and Enhancements"
  elif [ "$improvement_count" -gt 0 ]; then
    echo "Performance and Type Improvements"
  else
    echo "Bug Fixes and Stability"
  fi
}

TITLE_SUMMARY=$(generate_title_summary)

# Start generating release note
{
  echo "# [$TAG] $TITLE_SUMMARY"
  echo ""

  # Package Releases Section
  echo "## 📦 Package Releases"
  echo ""

  if echo "$PACKAGES" | jq -e '. | length > 0' >/dev/null 2>&1; then
    echo "$PACKAGES" | jq -r '.[] |
      "- `\(.name)@\(.newVersion)` " +
      (if .isNew then "🆕 - New package" else "- Updates (from v\(.oldVersion))" end)'
  else
    echo "No package version changes"
  fi

  echo ""
  echo "---"
  echo ""

  # Breaking Changes Section
  if echo "$BREAKING" | jq -e '. | length > 0' >/dev/null 2>&1; then
    echo "## 💥 Breaking Changes"
    echo ""

    echo "$BREAKING" | jq -r '.[] | "### \(.message)\n\nRefer to commit \(.hash[:7]) for details.\n"'

    echo "#### Migration"
    echo ""
    echo "Please review the changes above and update your code accordingly."
    echo ""
    echo "---"
    echo ""
  fi

  # New Features Section
  echo "## ✨ New Features"
  echo ""

  if echo "$FEATURES" | jq -e '. | length > 0' >/dev/null 2>&1; then
    echo "$FEATURES" | jq -r '.[] | "- **\(.message | split(":")[1] // .message | ltrimstr(" "))**"'
  else
    echo "No new features in this release"
  fi

  echo ""
  echo "---"
  echo ""

  # Improvements Section
  echo "## 🚀 Improvements"
  echo ""

  if echo "$IMPROVEMENTS" | jq -e '. | length > 0' >/dev/null 2>&1; then
    echo "$IMPROVEMENTS" | jq -r '.[] | "- **\(.message | split(":")[0] | ltrimstr(" ") | gsub("^[a-z]+"; ""))**: \(.message | split(":")[1] // .message | ltrimstr(" "))"'
  else
    echo "No improvements in this release"
  fi

  echo ""
  echo "---"
  echo ""

  # Bug Fixes Section
  echo "## 🐛 Bug Fixes"
  echo ""

  if echo "$BUGFIXES" | jq -e '. | length > 0' >/dev/null 2>&1; then
    echo "$BUGFIXES" | jq -r '.[] | "- \(.message | split(":")[1] // .message | ltrimstr(" "))"'
  else
    echo "No bug fixes in this release"
  fi

  echo ""
  echo "---"
  echo ""

  # Installation Section
  echo "## 📋 Installation"
  echo ""
  echo '```bash'

  if echo "$PACKAGES" | jq -e '. | length > 0' >/dev/null 2>&1; then
    echo "# Install updated packages"
    echo "$PACKAGES" | jq -r '.[] | "npm install \(.name)@\(.newVersion)"' | head -3

    local package_count=$(echo "$PACKAGES" | jq '. | length')
    if [ "$package_count" -gt 3 ]; then
      echo ""
      echo "# See full package list above for all available packages"
    fi
  else
    echo "# No package updates in this release"
  fi

  echo '```'

} > "$OUTPUT_FILE"

echo "✅ Release note generated: $OUTPUT_FILE" >&2
cat "$OUTPUT_FILE"
