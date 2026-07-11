#!/usr/bin/env bash

# =============================================================================
# Bulk-configure (and re-point) npm OIDC Trusted Publishers for every public
# workspace so .github/workflows/publish-npm-packages.yml can publish them
# tokenlessly via OIDC. Replaces clicking the npmjs.com "Trusted Publisher"
# screen once per package.
#
# Idempotent: a package already trusting the target workflow file is skipped;
# one trusting a different file is revoked and re-created (npm trust has no
# in-place update), preserving its existing permissions. Safe to re-run after
# renaming the workflow file or adding a package.
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
#   REPO=owner/repo         override the repo derived from `git remote`
#   WORKFLOW_FILE=name.yml  override the workflow filename (default publish-npm-packages.yml)
#
# Usage:
#   ./scripts/setup-trusted-publishers.sh
#   DRY_RUN=true ./scripts/setup-trusted-publishers.sh
# =============================================================================

set -eo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

WORKFLOW_FILE="${WORKFLOW_FILE:-publish-npm-packages.yml}"
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

configured=()
failed=()

# Parse one field from `npm trust list --json` (a single JSON object, or empty
# when the package has no trusted publisher). Array fields are space-joined.
trust_field() {
  printf '%s' "$1" | python3 -c "import json,sys
try:
    d = json.load(sys.stdin)
    v = d.get(sys.argv[1], '') if isinstance(d, dict) else ''
    print(' '.join(v) if isinstance(v, list) else v)
except Exception:
    print('')" "$2"
}

# Collect names FIRST. Reading the list with `while ... done < <(...)` ties the
# loop body's stdin to that pipe, so npm's interactive 2FA prompt cannot reach
# the terminal (→ EOTP). Gather names now, then iterate with the tty as stdin.
# `--no-private` still emits the monorepo root (no `private: true`), so the
# location "." guard drops it.
names=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  location=$(printf '%s' "$line" | python3 -c "import json,sys; print(json.load(sys.stdin)['location'])")
  name=$(printf '%s' "$line" | python3 -c "import json,sys; print(json.load(sys.stdin)['name'])")
  [ "$location" = "." ] && continue
  names+=("$name")
done < <(yarn workspaces list --json --no-private)

# Prime npm's 2FA session before the loop. The per-package `npm trust list`
# below runs in command substitution (captured stdout, stderr hidden), where npm
# cannot surface an interactive 2FA prompt — so authenticate once here,
# interactively, to open the 5-minute skip window the whole batch then rides on.
# Without this the FIRST list returns empty, its stale config is never revoked,
# and create hits 409 Conflict.
if [ "$DRY_RUN" != "true" ] && [ "${#names[@]}" -gt 0 ]; then
  echo "▶ authenticating once — approve the 2FA prompt to open the batch window…"
  # No stdout redirect: npm only enters the interactive web-auth flow when its
  # stdout is a TTY. Redirecting it (even to /dev/null) makes npm treat the call
  # as non-interactive and fail EOTP instead of prompting.
  npm trust list "${names[0]}" || true
  echo ""
fi

# npm trust allows exactly one config per package and has no in-place update.
# Per package: inspect the current config, skip if it already trusts the target
# workflow file, otherwise revoke the stale one and create the new one —
# preserving whatever permissions it had (createStagedPackage → stage).
for name in "${names[@]}"; do
  echo "▸ $name"

  if [ "$DRY_RUN" = "true" ]; then
    # Inspecting existing configs needs 2FA, so dry-run makes no npm calls; it
    # just states the per-package plan.
    echo "  dry-run → inspect TP; skip if already trusts $WORKFLOW_FILE, else revoke + create"
    configured+=("$name")
    continue
  fi

  existing="$(npm trust list "$name" --json 2>/dev/null || true)"
  existing_id="$(trust_field "$existing" id)"
  existing_file="$(trust_field "$existing" file)"
  existing_perms="$(trust_field "$existing" permissions)"

  flags=(--allow-publish)
  if [ "$ALLOW_STAGE" = "true" ] || printf '%s' "$existing_perms" | grep -q "createStagedPackage"; then
    flags+=(--allow-stage-publish)
  fi

  # Idempotent: already trusts the target workflow file → nothing to do.
  if [ -n "$existing_id" ] && [ "$existing_file" = "$WORKFLOW_FILE" ]; then
    echo "  · already trusts $WORKFLOW_FILE — skip"
    configured+=("$name")
    continue
  fi

  # Revoke the stale config (points at a different file) before re-creating.
  if [ -n "$existing_id" ]; then
    echo "  revoke stale config (file=$existing_file)"
    if ! npm trust revoke "$name" --id "$existing_id"; then
      echo "  ✗ revoke failed: $name"
      failed+=("$name")
      continue
    fi
  fi

  echo "  create → $WORKFLOW_FILE ${flags[*]}"
  if npm trust github "$name" --repo "$REPO" --file "$WORKFLOW_FILE" "${flags[@]}" --yes; then
    configured+=("$name")
  else
    echo "  ✗ create failed: $name"
    failed+=("$name")
  fi
  # Gentle pacing so the 5-minute 2FA-skip window covers the whole batch.
  sleep 2
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
