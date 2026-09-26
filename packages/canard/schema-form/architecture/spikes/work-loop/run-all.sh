#!/bin/bash
# Drives every prototype case in its OWN process and appends the machine
# readable rows to results-proto.jsonl. Sharing a process between cases read
# a 1.1 us write as 119.6 us in round-1 §2, and as 125 us here.
set -u
cd "$(dirname "$0")"
OUT=results-proto.jsonl
: > "$OUT"

node proto/selfcheck.mjs || { echo "SELF-CHECKS FAILED — not measuring"; exit 1; }

CASES="s1-same s1-random s1-cliff s1-rebuild s2 s2-scan
s3a s3a-index s3a-small s3a-small-index s3b s3b-index s3b-small s3b-small-index
s4-flat s4-items s5-batch s5-unbatched
s6-flat s6-items s6-compile s6-cond s6-cond-lazy s7"

for c in $CASES; do
  echo "--- $c"
  node run-proto.mjs "$c" 2>&1 >>"$OUT" | grep -v '^self-checks' || true
done

for n in 1000 1020 1021 1200; do
  echo "--- cliff $n"
  node run-proto.mjs cliff "$n" 2>&1 >>"$OUT" | grep -v '^self-checks' || true
done

echo
echo "rows: $(grep -c '##RESULT##' "$OUT")  -> $OUT"
