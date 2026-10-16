#!/bin/zsh
# Invoked by zsh quiet-b2-plus.sh; resolves measurement inputs through MEASURE_WORKTREE.
# Window wrapper: the (B) second slice (quiet-b2.sh, Node, 2 rounds), then the dist footnote row requested by fairy08:
# object-all-keys width 1000 through probe-write-paths.ts on the built dist (Node and Bun, 2 rounds) plus winglet hashes.
B2=${0:A:h}
S=${B2:h:h}
P=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../../.." && pwd)}/packages/canard/schema-form
N=${NODE_BIN:-node}
zsh $B2/quiet-b2.sh; echo "quiet-b2 exit $?"
export NODE_ENV=production
zsh $S/vm/winglet-hash.sh > $B2/out/winglet-hashes.txt
cd $P
for i in 1 2; do
  $N --import tsx architecture/verification/perf-optimization/probe-write-paths.ts --operations=object-all-keys --sizes=1000 > $B2/out/dist-allkeys-node-$i.json 2>/dev/null
  bun architecture/verification/perf-optimization/probe-write-paths.ts --operations=object-all-keys --sizes=1000 > $B2/out/dist-allkeys-bun-$i.json 2>/dev/null
done
date -u +%FT%TZ >> $B2/out/window.log
echo quiet-b2-plus-done
