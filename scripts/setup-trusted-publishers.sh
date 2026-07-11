#!/usr/bin/env bash

# =============================================================================
# Bulk-configure npm OIDC Trusted Publishers for every public workspace.
#
# Replaces clicking through the npmjs.com "Trusted Publisher" screen once per
# package. Points each package at this repo's release workflow so that
# .github/workflows/release.yml can publish it tokenlessly via OIDC.
#
# Prerequisites:
#   - npm >= 11.15.0        (bulk `npm trust` support)
#   - `npm login` with 2FA  (the bypass-2FA NPM_TOKEN is NOT accepted by
#                            `npm trust`)
#   - write access to each package
#
# The first `npm trust` call prompts for 2FA; choose "skip 2FA for 5 minutes"
# so the rest of the batch runs unattended.
#
# Options (environment variables):
#   ALLOW_STAGE=true        also grant staged-publish (--allow-stage-publish)
#   DRY_RUN=true            print the planned commands without running them
#   NPM_OTP=123456          2FA one-time password (else npm prompts interactively)
#   REPO=owner/repo         override the repo derived from `git remote`
#   WORKFLOW_FILE=name.yml  override the workflow filename (default release.yml)
#
# Usage:
#   ./scripts/setup-trusted-publishers.sh
#   DRY_RUN=true ./scripts/setup-trusted-publishers.sh
# =============================================================================

set -eo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WORKFLOW_FILE="${WORKFLOW_FILE:-release.yml}"
DRY_RUN="${DRY_RUN:-false}"
ALLOW_STAGE="${ALLOW_STAGE:-false}"

# Derive owner/repo from the git origin unless REPO is provided.
# Handles both https (github.com/owner/repo.git) and ssh (git@github.com:owner/repo.git).
if [ -z "${REPO:-}" ]; then
  origin="$(git remote get-url origin 2>/dev/null || true)"
  REPO="$(printf '%s' "$origin" | sed -E 's#^.*github\.com[:/]##; s#\.git$##')"
fi
if [ -z "$REPO" ]; then
  echo "✗ could not determine owner/repo; pass REPO=owner/repo" >&2
  exit 1
fi

allow_desc="--allow-publish"
[ "$ALLOW_STAGE" = "true" ] && allow_desc="$allow_desc --allow-stage-publish"

echo "▶ trusted-publisher setup"
echo "  repo:     $REPO"
echo "  workflow: $WORKFLOW_FILE"
echo "  actions:  $allow_desc"
echo "  dry_run:  $DRY_RUN"
echo ""

# Preflight: npm version must support bulk `npm trust`.
npm_ver="$(npm --version)"
if [ "$(printf '%s\n11.15.0\n' "$npm_ver" | sort -V | head -1)" != "11.15.0" ]; then
  echo "✗ npm >= 11.15.0 required (found $npm_ver). Run: npm install -g npm@latest" >&2
  exit 1
fi

# Preflight: a real login is required (skipped in dry-run so the plan can be
# previewed without authenticating).
if [ "$DRY_RUN" != "true" ]; then
  if ! whoami_out="$(npm whoami 2>/dev/null)"; then
    echo "✗ npm CLI is not logged in. Run: npm login" >&2
    echo "  (2FA required; the bypass-2FA NPM_TOKEN is not accepted by npm trust)" >&2
    exit 1
  fi
  echo "  npm user: $whoami_out"
  echo ""
fi

allow_flags=(--allow-publish)
[ "$ALLOW_STAGE" = "true" ] && allow_flags+=(--allow-stage-publish)

configured=()
failed=()

# Collect names FIRST. Reading the list with `while ... done < <(...)` ties the
# loop body's stdin to that pipe, so npm's interactive 2FA/OTP prompt cannot
# reach the terminal (→ EOTP). Gather names now, then iterate with the tty as
# stdin. `--no-private` still emits the monorepo root (no `private: true`), so
# the location "." guard drops it.
names=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  location=$(printf '%s' "$line" | python3 -c "import json,sys; print(json.load(sys.stdin)['location'])")
  name=$(printf '%s' "$line" | python3 -c "import json,sys; print(json.load(sys.stdin)['name'])")
  [ "$location" = "." ] && continue
  names+=("$name")
done < <(yarn workspaces list --json --no-private)

otp_flag=()
[ -n "${NPM_OTP:-}" ] && otp_flag=(--otp "$NPM_OTP")

for name in "${names[@]}"; do
  echo "▸ $name"
  if [ "$DRY_RUN" = "true" ]; then
    echo "  dry-run → npm trust github $name --repo $REPO --file $WORKFLOW_FILE ${allow_flags[*]} --yes"
    configured+=("$name")
  else
    if npm trust github "$name" --repo "$REPO" --file "$WORKFLOW_FILE" "${allow_flags[@]}" "${otp_flag[@]}" --yes; then
      configured+=("$name")
    else
      echo "  ✗ failed: $name"
      failed+=("$name")
    fi
    # Gentle pacing so the 5-minute 2FA-skip window covers the whole batch.
    sleep 2
  fi
done

echo ""
echo "=== summary ==="
echo "configured (${#configured[@]}): ${configured[*]}"
echo "failed     (${#failed[@]}): ${failed[*]}"
echo ""
echo "Verify with: npm trust list <package>"

if [ "${#failed[@]}" -ne 0 ]; then
  exit 1
fi
