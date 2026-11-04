#!/bin/zsh
# Invoked by zsh bun-smoke.sh; resolves measurement inputs through MEASURE_WORKTREE.
# Bun smoke of the C timing and D heap runners (same cwd as the window script).
SC=${0:A:h}
export NODE_ENV=production
cd $SC
mkdir -p out
bun run-c.mjs --smoke > out/bunsmoke-c.json 2> out/bunsmoke-c.err; echo "C exit $? bytes $(wc -c < out/bunsmoke-c.json) err $(wc -c < out/bunsmoke-c.err)"
bun run-d.mjs --smoke --prefix=out/bunsmoke > out/bunsmoke-d.json 2> out/bunsmoke-d.err; echo "D exit $? bytes $(wc -c < out/bunsmoke-d.json) err $(wc -c < out/bunsmoke-d.err)"
