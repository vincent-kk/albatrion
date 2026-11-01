// Invoked by node run-a2.mjs; this file is verification tooling.
// A2-2 timing and recorded correctness: node run-a2.mjs [--smoke].
import { settings, metadata, loadEngine, a2Scenes, a2LedgerScenes, measure, correctness, removableAccounting, ordered } from './bench-common.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { SB } from './config.mjs';
const config = settings(), rows = [], skipped = [];
for (const variant of ordered(['baseline', 'v1', 'v2'])) {
  if (variant !== 'baseline' && !fs.existsSync(path.join(SB, `current-${variant}.mjs`))) {
    const reason = `SKIP ${variant}: counterfactual copy current-${variant}.mjs is intentionally excluded.`;
    console.error(reason); skipped.push(reason); continue;
  }
  const engine = await loadEngine('current', variant);
  for (const spec of ordered([...a2Scenes(), ...a2LedgerScenes()])) {
    const timing = await measure(engine, spec, config), checks = await correctness(engine, spec);
    rows.push({ ...timing, correctness: checks, accounting: removableAccounting(spec, checks), separateLedgerScene: ['merge-one-key', 'caller-mutates-after-write'].includes(spec.op) });
  }
}
console.log(JSON.stringify({ ...metadata('A2-2', config), addendum: true, v2: 'assign through writeObjectKey', skipped, rows }));
