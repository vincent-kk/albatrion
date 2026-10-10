#!/bin/bash
# Round 7 cost run: gate on the self-checks, then every case x variant x run in its OWN process.
# Appends ##RESULT## rows to cost-results.jsonl. Run from spikes/round7: bash run-cost.sh [runs]
set -u
cd "$(dirname "$0")"
RUNS=${1:-5}
OUT=cost-results.jsonl
node ../work-loop/proto/selfcheck-v4c.mjs >/dev/null || { echo "v4c self-checks FAILED — not measuring"; exit 1; }
node proto/selfcheck-v4d.mjs old >/dev/null || { echo "v4d OLD self-checks FAILED — not measuring"; exit 1; }
NEWFAILS=$(node proto/selfcheck-v4d.mjs | grep '^  FAIL' | sed -E 's/^  FAIL ([^:]+):.*/\1/' | tr '\n' ' ')
[ "$NEWFAILS" = "A4b A4c A4-cap " ] || { echo "v4d NEW self-check failures differ from the 3 expected: $NEWFAILS"; exit 1; }
echo "gates passed (v4c all, v4d-old all, v4d-new only A4b/A4c/A4-cap)"
: > "$OUT"
for run in $(seq 1 "$RUNS"); do
  for c in s1-same s3a-small s3b-small s3c-inject s4-items s5-batch n1 n2 feedback inj-key inj-src; do
    for v in v4c v4d-old v4d-new; do
      node measure.mjs "$c" "$v" 2>/dev/null | grep '##RESULT##' | sed "s/^##RESULT## {/##RESULT## {\"run\":$run,/" >>"$OUT"
    done
  done
  echo "run $run done"
done
echo "rows: $(grep -c '##RESULT##' "$OUT")"
