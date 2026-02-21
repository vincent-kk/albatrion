#!/usr/bin/env bash
set -euo pipefail

# GitHub Pages deployment script for Albatrion documentation
# Builds with Docusaurus and publishes build/ via gh-pages (avoids empty-branch git rm issue)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Verify we're in the documents directory
if [[ ! -f "docusaurus.config.ts" ]]; then
  echo "Error: docusaurus.config.ts not found. Run this script from the documents directory."
  exit 1
fi

REMOTE_URL=$(git -C "$(git rev-parse --show-toplevel)" remote get-url origin 2>/dev/null || echo "")

if [[ -z "$REMOTE_URL" ]]; then
  echo "Error: No git remote 'origin' found."
  exit 1
fi

echo "Remote URL: $REMOTE_URL"
echo "Building and deploying to GitHub Pages (gh-pages branch)..."
echo ""

# Build first (creates documents/build)
yarn docusaurus build

if [[ ! -d "build" ]]; then
  echo "Error: Build failed or build/ directory not found."
  exit 1
fi

# Publish build contents to gh-pages branch (handles empty branch; no git rm -rf .)
npx gh-pages -d build -b gh-pages -r "$REMOTE_URL"
