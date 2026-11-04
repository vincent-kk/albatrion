#!/bin/zsh
# Invoked by zsh quiet-b-a2.sh; resolves measurement inputs through MEASURE_WORKTREE.
# User-operated quiet window. This file is intentionally not run during setup.
# run-a2 includes the separate B0 Merge and caller-mutation scenes for every
# variant on both runtimes. run-a2-breakdown includes the nextExtras call-site split.
set -euo pipefail
export NODE_ENV=production
SB=${0:A:h}
OUT="$SB/out"
NODE=${NODE_BIN:-node}
P=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../.." && pwd)}/packages/canard/schema-form
command -v bun >/dev/null
command -v "$NODE" >/dev/null
mkdir -p "$OUT"
cd "$P"

stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
hashes() {
  shasum -a 256 "$SB"/current-{source,baseline,instrumented,v1,v2}.mjs(N) "$SB"/legacy-{source,baseline,instrumented}.mjs(N)
}
print -r -- "$(stamp) window-start" > "$OUT/window.log"
"$NODE" "$SB/make-current.mjs" > "$OUT/build-current-window.json"
"$NODE" "$SB/make-legacy.mjs" > "$OUT/build-legacy-window.json"
print -u2 -- "SKIP counterfactual builder: make-variants.mjs is intentionally excluded; supply local v1/v2 copies to measure those lanes."
hashes > "$OUT/bundle-sha256-start.txt"

run_job() {
  local name=$1 runtime=$2 round=$3 file=$4
  shift 4
  if [[ "$file" == run-breakdown.mjs || "$file" == run-a2-breakdown.mjs ]]; then
    if [[ ! -f "$SB/current-instrumented.mjs" || ! -f "$SB/legacy-instrumented.mjs" ]]; then
      print -u2 -- "SKIP $name: excluded instrumentation helper/copy is absent."
      return
    fi
  fi
  local executable="$NODE"
  [[ "$runtime" == bun ]] && executable=bun
  print -r -- "$(stamp) start $name $runtime $round" >> "$OUT/window.log"
  "$executable" "$SB/$file" "$@" > "$OUT/$name-$runtime-$round.json"
  print -r -- "$(stamp) end $name $runtime $round" >> "$OUT/window.log"
}

for round in 1 2; do
  typeset -a runtimes jobs reverse
  if [[ "$round" == 1 ]]; then
    runtimes=(node bun)
    jobs=(b a2 terminal)
    reverse=()
  else
    runtimes=(bun node)
    jobs=(terminal a2 b)
    reverse=(--reverse)
  fi
  print -r -- "$(stamp) round-start $round" >> "$OUT/window.log"
  hashes > "$OUT/bundle-sha256-$round.txt"
  for job in $jobs; do
    for runtime in $runtimes; do
      run_job "$job" "$runtime" "$round" "run-$job.mjs" "${reverse[@]}"
    done
  done
  if [[ "$round" == 1 ]]; then
    run_job breakdown-b-current node "$round" run-breakdown.mjs --engine=current
    run_job breakdown-b-legacy node "$round" run-breakdown.mjs --engine=legacy
    run_job breakdown-a2 node "$round" run-a2-breakdown.mjs
  else
    run_job breakdown-a2 node "$round" run-a2-breakdown.mjs --reverse
    run_job breakdown-b-legacy node "$round" run-breakdown.mjs --engine=legacy
    run_job breakdown-b-current node "$round" run-breakdown.mjs --engine=current
  fi
  print -r -- "$(stamp) round-end $round" >> "$OUT/window.log"
done
hashes > "$OUT/bundle-sha256-end.txt"
if [[ -f "$SB/current-v1.mjs" && -f "$SB/current-v2.mjs" && -f "$SB/current-instrumented.mjs" ]]; then
  "$NODE" "$SB/table.cjs" > "$OUT/summary.json"
else
  print -u2 -- "SKIP full B/A2 summary: excluded lanes are absent; baseline JSON records remain available."
fi
print -r -- "$(stamp) window-end" >> "$OUT/window.log"
