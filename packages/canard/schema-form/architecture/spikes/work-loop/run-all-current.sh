#!/bin/bash
# Drives every current-library case in its OWN vite-node process, from the
# package directory (the `@/schema-form` alias resolves against src/).
set -u
SPIKE="$(cd "$(dirname "$0")" && pwd)"
PKG=/Users/Vincent/Workspace/albatrion/packages/canard/schema-form
VITE_NODE=/Users/Vincent/Workspace/albatrion/node_modules/.bin/vite-node
OUT="$SPIKE/results-current.jsonl"
: > "$OUT"

CASES="s1-same s1-drain s1-random s2 s2-drain s3a s3b s4-flat s4-items s5
s6-flat s6-items s6-cond s7"

cd "$PKG" || exit 1
for c in $CASES; do
  echo "--- $c"
  timeout 600 node "$VITE_NODE" --config "$SPIKE/vite.spike.config.mjs" \
    "$SPIKE/run-current.ts" "$c" 2>&1 >>"$OUT" || echo "  (case $c failed)"
done

echo
echo "rows: $(grep -c '##RESULT##' "$OUT")  -> $OUT"
