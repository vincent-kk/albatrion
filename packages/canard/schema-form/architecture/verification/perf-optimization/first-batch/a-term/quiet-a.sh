#!/bin/zsh
# Invoked by zsh quiet-a.sh; resolves measurement inputs through MEASURE_WORKTREE.
# Quiet window (A): terminal-mode scenes, 0.16.1 (workspace winglet) vs current 65efdccec, Node and Bun, two interleaved rounds;
# plus the one-off winglet reference: 0.16.1 with workspace winglet vs 0.16.1 with npm-published winglet on four rows.
S=${0:A:h}
S=${S:h}
W=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../.." && pwd)}
N=${NODE_BIN:-node}
O=$S/a-term/out
mkdir -p "$O"
D=architecture/verification/perf-optimization
LWS=$W/node_modules/@canard/schema-form_0.16.1/dist/index.mjs
LNPM=${NPM0161_BUNDLE:-$S/npm0161/node_modules/@canard/schema-form/dist/index.mjs}
export NODE_ENV=production
date -u +%FT%TZ > $O/start.txt
{ shasum -a 256 $W/packages/canard/schema-form/dist/index.mjs $LWS $LNPM; git -C $W log -1 --format=%H; zsh $S/vm/winglet-hash.sh;
  for p in common-utils json json-schema react-utils; do echo "npm winglet/$p $(grep -m1 '"version"' ${LNPM:h:h:h:h}/@winglet/$p/package.json)"; done } > $O/dists.txt
cd $W/packages/canard/schema-form
for i in 1 2; do
  $N --import tsx $D/probe-legacy-terminal-mode.ts --bundle=$LWS > $O/term-legacy-node-$i.json 2>/dev/null
  bun $D/probe-legacy-terminal-mode.ts --bundle=$LWS > $O/term-legacy-bun-$i.json 2>/dev/null
  $N --import tsx $D/probe-terminal-mode.ts > $O/term-new-node-$i.json 2>/dev/null
  bun $D/probe-terminal-mode.ts > $O/term-new-bun-$i.json 2>/dev/null
  for v in ws npm; do
    B=$LWS; [[ $v == npm ]] && B=$LNPM
    $N --import tsx $D/probe-legacy-array-verbs.ts --bundle=$B --sizes=8000 --operations=push,remove-front,clear > $O/ref-verbs-$v-node-$i.json 2>/dev/null
    bun $D/probe-legacy-array-verbs.ts --bundle=$B --sizes=8000 --operations=push,remove-front,clear > $O/ref-verbs-$v-bun-$i.json 2>/dev/null
    $N --import tsx $D/probe-legacy-write-paths.ts --bundle=$B --sizes=1000 --operations=object-all-keys > $O/ref-write-$v-node-$i.json 2>/dev/null
    bun $D/probe-legacy-write-paths.ts --bundle=$B --sizes=1000 --operations=object-all-keys > $O/ref-write-$v-bun-$i.json 2>/dev/null
  done
done
date -u +%FT%TZ > $O/end.txt
echo quiet-a-done
