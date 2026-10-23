#!/bin/zsh
# Invoked by zsh bun-smoke.sh; resolves measurement inputs through MEASURE_WORKTREE.
# Bun smoke of both terminal-mode probes (new engine and workspace 0.16.1).
W=${MEASURE_WORKTREE:-$(cd "${0:A:h}/../../../../../../../.." && pwd)}
O=${0:A:h}
export NODE_ENV=production
cd $W/packages/canard/schema-form
bun architecture/verification/perf-optimization/probe-terminal-mode.ts --smoke > $O/bun-smoke-new.json 2> $O/bun-smoke-new.err; echo "new exit $?"
bun architecture/verification/perf-optimization/probe-legacy-terminal-mode.ts --bundle=$W/node_modules/@canard/schema-form_0.16.1/dist/index.mjs --smoke > $O/bun-smoke-legacy.json 2> $O/bun-smoke-legacy.err; echo "legacy exit $?"
