#!/usr/bin/env bash

# =============================================================================
# Publish public workspaces whose version is not yet on the npm registry.
#
# Packs each package with `yarn pack` (which rewrites `workspace:^` ranges into
# the resolved semver, e.g. `^0.13.0`), then publishes the tarball with the npm
# CLI. The npm CLI is used for the publish step because it is the reference
# implementation for OIDC Trusted Publishing and provenance.
#
#   - In GitHub Actions (GITHUB_ACTIONS=true): OIDC Trusted Publishing — no
#     token, provenance attestation enabled. Requires npm >= 11.5.1 and the job
#     to declare `permissions: id-token: write`.
#   - Locally: npm uses your existing `npm login` session. If 2FA "auth-and-
#     writes" is on, npm prompts for a one-time password. Pass NPM_OTP=123456 to
#     provide it non-interactively.
#
# Version-diff guard: a package already present on the registry at its current
# version is skipped. This is what lets you bump only some packages and publish
# just those — the already-published ones never hit the npm "cannot publish over
# previously published version" (403) error.
#
# Options (environment variables):
#   DRY_RUN=true    Pack + guard + `npm publish --dry-run`; nothing is uploaded.
#   NPM_OTP=123456  2FA one-time password for local publishing.
#
# Usage:
#   ./scripts/publish-packages.sh            # publish bumped packages
#   DRY_RUN=true ./scripts/publish-packages.sh
# =============================================================================

set -eo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DRY_RUN="${DRY_RUN:-false}"

TARBALL_DIR="$(mktemp -d)"
trap 'rm -rf "$TARBALL_DIR"' EXIT

IS_CI=false
if [ "${GITHUB_ACTIONS:-}" = "true" ]; then
  IS_CI=true
fi

published=()
skipped=()
failed=()

# Read a top-level string field from a package.json without needing jq.
read_pkg_field() {
  python3 -c "import json,sys; print(json.load(open(sys.argv[1])).get(sys.argv[2],'') or '')" "$1" "$2"
}

echo "▶ publish-packages.sh (dry_run=$DRY_RUN, ci=$IS_CI)"
echo ""

# Collect (name, location) FIRST. Reading the list with `while ... done < <(...)`
# ties the loop body's stdin to that pipe, so npm's interactive 2FA/OTP prompt
# (local publishing) cannot reach the terminal. Gather entries now, then iterate
# with the tty as stdin. `--no-private` still emits the monorepo root (no
# `private: true`), so the location "." guard drops it.
entries=()
while IFS= read -r line; do
  [ -z "$line" ] && continue
  location=$(printf '%s' "$line" | python3 -c "import json,sys; print(json.load(sys.stdin)['location'])")
  name=$(printf '%s' "$line" | python3 -c "import json,sys; print(json.load(sys.stdin)['name'])")
  [ "$location" = "." ] && continue
  entries+=("$name|$location")
done < <(yarn workspaces list --json --no-private)

for entry in "${entries[@]}"; do
  name="${entry%%|*}"
  location="${entry#*|}"

  pkg="$location/package.json"
  version=$(read_pkg_field "$pkg" version)
  if [ -z "$version" ]; then
    echo "· skip $name (no version field)"
    continue
  fi

  # Version-diff guard: compare the exact name@version against the registry.
  # `npm view name@version version` echoes the version only when that exact
  # version already exists; it is empty for an unpublished version and errors
  # (swallowed by `|| true`) for a never-published package name.
  onregistry=$(npm view "$name@$version" version 2>/dev/null || true)
  if [ "$onregistry" = "$version" ]; then
    echo "· skip $name@$version (already on registry)"
    skipped+=("$name@$version")
    continue
  fi

  echo "▸ pack $name@$version"
  tarball="$TARBALL_DIR/$(printf '%s' "$name" | tr '/@' '__').tgz"
  yarn workspace "$name" pack --out "$tarball" >/dev/null

  publish_args=(--access public)
  if [ "$IS_CI" = "true" ]; then
    # Trusted Publishing: npm exchanges the GitHub OIDC token for a short-lived
    # publish token and attaches provenance. No NODE_AUTH_TOKEN is needed.
    publish_args+=(--provenance)
  elif [ -n "${NPM_OTP:-}" ]; then
    publish_args+=(--otp "$NPM_OTP")
  fi

  if [ "$DRY_RUN" = "true" ]; then
    echo "  dry-run → npm publish ${publish_args[*]} --dry-run"
    npm publish "$tarball" "${publish_args[@]}" --dry-run
    published+=("$name@$version (dry-run)")
  else
    echo "  publish $name@$version"
    if npm publish "$tarball" "${publish_args[@]}"; then
      published+=("$name@$version")
    else
      echo "  ✗ failed: $name@$version"
      failed+=("$name@$version")
    fi
  fi
done

echo ""
echo "=== summary ==="
echo "published (${#published[@]}): ${published[*]}"
echo "skipped   (${#skipped[@]}): ${skipped[*]}"
echo "failed    (${#failed[@]}): ${failed[*]}"

# Fail the run if any publish attempt errored.
if [ "${#failed[@]}" -ne 0 ]; then
  exit 1
fi
