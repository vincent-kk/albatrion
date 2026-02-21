#!/usr/bin/env bash
set -euo pipefail

# GitHub Pages deployment script for Albatrion documentation
# Wraps `docusaurus deploy` with automatic SSH/HTTPS detection

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

# Verify we're in the documents directory
if [[ ! -f "docusaurus.config.ts" ]]; then
  echo "Error: docusaurus.config.ts not found. Run this script from the documents directory."
  exit 1
fi

# Detect remote URL protocol
REMOTE_URL=$(git -C "$(git rev-parse --show-toplevel)" remote get-url origin 2>/dev/null || echo "")

if [[ -z "$REMOTE_URL" ]]; then
  echo "Error: No git remote 'origin' found."
  exit 1
fi

echo "Remote URL: $REMOTE_URL"
echo "Deploying to GitHub Pages..."
echo ""

if [[ "$REMOTE_URL" == git@* ]] || [[ "$REMOTE_URL" == ssh://* ]]; then
  # SSH remote
  echo "Detected SSH remote. Using USE_SSH=true."
  export USE_SSH=true
else
  # HTTPS remote
  if [[ -z "${GIT_USER:-}" ]]; then
    # Try to get GitHub username from git config
    GIT_USER_CANDIDATE=$(git config user.name 2>/dev/null || echo "")
    if [[ -n "$GIT_USER_CANDIDATE" ]]; then
      export GIT_USER="$GIT_USER_CANDIDATE"
      echo "Using GIT_USER from git config: $GIT_USER"
    else
      echo "Error: HTTPS remote detected but GIT_USER is not set."
      echo "Set it with: GIT_USER=<github-username> yarn deploy:gh-pages"
      echo "Or use SSH remote: git remote set-url origin git@github.com:vincent-kk/albatrion.git"
      exit 1
    fi
  else
    echo "Using GIT_USER: $GIT_USER"
  fi
fi

echo ""
yarn docusaurus deploy
