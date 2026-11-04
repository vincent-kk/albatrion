#!/bin/zsh
# Invoked by zsh quiet-verbs.sh; resolves measurement inputs through MEASURE_WORKTREE.
# Quiet window, array verbs re-measure (keeper condition 1 of PR #411): 0.16.1, before F2 (9b8787367) and after F2+F3+D5 (65efdccec),
# steady lane, 1k and 8k, Node and Bun, two interleaved rounds; round 369 observed-completion probes, same probe file for both trees.
S=${0:A:h}
S=${S:h}
W=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../.." && pwd)}
N=${NODE_BIN:-node}
O=$S/vm/out; mkdir -p $O
LP=$W/packages/canard/schema-form/architecture/verification/perf-optimization/probe-legacy-array-verbs.ts
NP=architecture/verification/perf-optimization/probe-array-verbs.ts
OPS=push,pop,update-mid,remove-front,remove,remove-mid,remove-end,insert-front,insert-mid,insert-end,clear,set-same-length,set-grow
export NODE_ENV=production
date -u +%FT%TZ > $O/start.txt
shasum -a 256 $W/packages/canard/schema-form/dist/index.mjs $S/vm/before/packages/canard/schema-form/dist/index.mjs $W/node_modules/@canard/schema-form_0.16.1/dist/index.mjs > $O/dists.txt
zsh "$S/vm/winglet-hash.sh" >> "$O/dists.txt"
git -C $W log -1 --format=%H > $O/head.txt
for i in 1 2; do
  cd $W
  $N --import tsx $LP --bundle=$W/node_modules/@canard/schema-form_0.16.1/dist/index.mjs > $O/legacy-node-$i.json 2>/dev/null
  bun $LP --bundle=$W/node_modules/@canard/schema-form_0.16.1/dist/index.mjs > $O/legacy-bun-$i.json 2>/dev/null
  cd $S/vm/before/packages/canard/schema-form
  $N --import tsx $NP --lanes=steady --sizes=1000,8000 --operations=$OPS > $O/verbs-before-node-$i.json 2>/dev/null
  bun $NP --lanes=steady --sizes=1000,8000 --operations=$OPS > $O/verbs-before-bun-$i.json 2>/dev/null
  cd $W/packages/canard/schema-form
  $N --import tsx $NP --lanes=steady --sizes=1000,8000 --operations=$OPS > $O/verbs-after-node-$i.json 2>/dev/null
  bun $NP --lanes=steady --sizes=1000,8000 --operations=$OPS > $O/verbs-after-bun-$i.json 2>/dev/null
done
date -u +%FT%TZ > $O/end.txt
echo quiet-verbs-done
