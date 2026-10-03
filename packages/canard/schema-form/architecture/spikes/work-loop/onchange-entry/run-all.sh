#!/bin/bash
# Runs X5 on v4 and v4c, then every timing case in its OWN process for both
# loops. Appends machine-readable rows to onchange-entry/results.jsonl and the
# readable X5 output to onchange-entry/output-x5.txt. Run from spikes/work-loop.
set -u
cd "$(dirname "$0")/.."
OUT=onchange-entry/results.jsonl
X5=onchange-entry/output-x5.txt
: > "$OUT"
: > "$X5"

node proto/selfcheck-v4c.mjs >/dev/null || { echo "v4c SELF-CHECKS FAILED — not measuring"; exit 1; }
echo "v4c self-checks passed"

for loop in v4 v4c; do
  node onchange-entry/x5.mjs "$loop" | tee -a "$X5" | grep -v '^##X5##'
done

for c in keystroke feedback seq3 batch3; do
  for loop in v4 v4c; do
    echo "--- $c $loop"
    node onchange-entry/measure.mjs "$c" "$loop" >>"$OUT"
  done
done

echo
echo "rows: $(grep -c '##RESULT##' "$OUT")  -> $OUT"
