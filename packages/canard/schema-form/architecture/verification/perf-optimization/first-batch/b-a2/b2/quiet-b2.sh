#!/bin/zsh
# Invoked by zsh quiet-b2.sh; resolves measurement inputs through MEASURE_WORKTREE.
# User-operated Node-only window. Setup and smoke do not execute this script.
set -euo pipefail
export NODE_ENV=production
B2=${0:A:h}
SB=${B2:h}
OUT="$B2/out"
P=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../../.." && pwd)}/packages/canard/schema-form
W=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../../.." && pwd)}
NODE=${NODE_BIN:-node}
mkdir -p "$OUT"
cd "$P"
stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
hashes() {
  shasum -a 256 "$B2"/current-{source,baseline,profiling,focused}.mjs "$P/dist/index.mjs" "$W/node_modules/@canard/schema-form_0.16.1/dist/index.mjs" "$SB/out/b-node-1.json" "$SB/out/b-node-2.json"
}
print -r -- "$(stamp) window-start" > "$OUT/window.log"
"$NODE" "$B2/make.mjs" > "$OUT/build-node-window.json"
hashes > "$OUT/bundle-sha256-start.txt"
for round in 1 2; do
  print -r -- "$(stamp) start node $round" >> "$OUT/window.log"
  hashes > "$OUT/bundle-sha256-$round.txt"
  if [[ "$round" == 1 ]]; then
    "$NODE" "$B2/run.mjs" --samples=40 --warmups=20 > "$OUT/b2-node-$round.json"
  else
    "$NODE" "$B2/run.mjs" --samples=40 --warmups=20 --reverse > "$OUT/b2-node-$round.json"
  fi
  print -r -- "$(stamp) end node $round" >> "$OUT/window.log"
done
hashes > "$OUT/bundle-sha256-end.txt"
cmp "$OUT/bundle-sha256-start.txt" "$OUT/bundle-sha256-end.txt"
"$NODE" "$B2/table.mjs" > "$OUT/summary.json"
print -r -- "$(stamp) window-end" >> "$OUT/window.log"
