#!/bin/zsh
# Invoked by zsh quiet-c-d.sh; resolves measurement inputs through MEASURE_WORKTREE.
# User-operated measurement window; intentionally not run during tooling setup.
set -euo pipefail
export NODE_ENV=production
SC=${0:A:h}
OUT="$SC/out"
NODE=${NODE_BIN:-node}
command -v "$NODE" >/dev/null
command -v bun >/dev/null
mkdir -p "$OUT"
cd "$SC"
stamp() { date -u '+%Y-%m-%dT%H:%M:%SZ'; }
hashes() { shasum -a 256 "$SC"/current-*.mjs "$SC"/legacy-*.mjs; }
run_job() {
  local filename=$1
  shift
  "$@" > "$OUT/$filename.json" 2> "$OUT/$filename.stderr"
}
print -u2 -- "SKIP bundle builder: make-bundles.mjs creates counterfactual patches and is intentionally excluded; supply local baseline/instrumented copies."
hashes > "$OUT/window-sha-start.txt"
{
  stamp
  "$NODE" --version
  bun -e 'console.log(Bun.version)'
} > "$OUT/window-runtime.txt"
run_job window-before "$NODE" worktree-guard.mjs --mode=before
# Two interleaved rounds reverse runtime/scene/variant order in round two.
for round in 1 2; do
  flags=()
  [[ $round == 2 ]] && flags+=(--reverse)
  if [[ $round == 1 ]]; then
    run_job round-$round-node-C "$NODE" run-c.mjs $flags
    run_job round-$round-bun-C bun run-c.mjs $flags
  else
    run_job round-$round-bun-C bun run-c.mjs $flags
    run_job round-$round-node-C "$NODE" run-c.mjs $flags
  fi
  run_job round-$round-node-I "$NODE" run-c-instrumented.mjs $flags
  run_job round-$round-node-diff "$NODE" run-c-differential.mjs $flags
  if [[ $round == 1 ]]; then
    run_job round-$round-node-D "$NODE" run-d.mjs --prefix=out/round-$round $flags
    run_job round-$round-bun-D bun run-d.mjs --prefix=out/round-$round $flags
  else
    run_job round-$round-bun-D bun run-d.mjs --prefix=out/round-$round $flags
    run_job round-$round-node-D "$NODE" run-d.mjs --prefix=out/round-$round $flags
  fi
done
hashes > "$OUT/window-sha-end.txt"
cmp "$OUT/window-sha-start.txt" "$OUT/window-sha-end.txt"
run_job window-after "$NODE" worktree-guard.mjs
"$NODE" table.cjs > "$OUT/window-summary.json"
stamp >> "$OUT/window-runtime.txt"
