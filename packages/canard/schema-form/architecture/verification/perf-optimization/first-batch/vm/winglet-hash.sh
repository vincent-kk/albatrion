#!/bin/zsh
# Invoked by zsh winglet-hash.sh; resolves measurement inputs through MEASURE_WORKTREE.
# Print the resolved path and one aggregate sha256 per winglet package dist used by both engines (sorted file list, contents hashed together).
W=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../.." && pwd)}
for p in common-utils json json-schema react-utils; do
  d=$(readlink -f $W/node_modules/@winglet/$p)
  h=$(cd $d/dist && find . -type f \( -name '*.mjs' -o -name '*.js' \) | LC_ALL=C sort | xargs shasum -a 256 | shasum -a 256 | cut -c1-64)
  echo "winglet/$p $d $h"
done
