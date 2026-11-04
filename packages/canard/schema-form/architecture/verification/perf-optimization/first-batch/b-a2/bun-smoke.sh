#!/bin/zsh
# Invoked by zsh bun-smoke.sh; resolves measurement inputs through MEASURE_WORKTREE.
# Bun smoke of the timing runners (B-1, A2-2, A2-3) from the package directory, same cwd as the window script.
SB=${0:A:h}
mkdir -p "$SB/out"
export NODE_ENV=production
cd "${MEASURE_WORKTREE:-$(cd "$SB/../../../../../../../.." && pwd)}/packages/canard/schema-form"
for r in run-b.mjs run-a2.mjs run-terminal.mjs; do
  bun $SB/$r --smoke > $SB/out/bunsmoke-${r%.mjs}.json 2> $SB/out/bunsmoke-${r%.mjs}.err
  echo "$r exit $? bytes $(wc -c < $SB/out/bunsmoke-${r%.mjs}.json) err $(wc -c < $SB/out/bunsmoke-${r%.mjs}.err)"
done
