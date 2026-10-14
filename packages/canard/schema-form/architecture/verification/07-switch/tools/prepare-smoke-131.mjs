// CLI: write A/A-only zero reach counts into a new scratch directory; identical source has no changed-code executions.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { sessionRows131 } from './session-rows-131.mjs';

const out = process.argv[2];
assert(out && !fs.existsSync(out), 'Choose a new scratch directory');
fs.mkdirSync(out, { recursive: true });
for (const lane of ['core', 'react']) {
  const rows = sessionRows131(`${lane}-129`, lane);
  fs.writeFileSync(path.join(out, `${lane}-counts.json`), JSON.stringify({
    basis: 'A/A smoke only: candidate is source-identical plus a trailing comment; no changed code can execute. Never reuse for a change verdict.',
    rows: Object.fromEntries(rows.map(row => [row.key, { calls: 0, probe: 'source-identical A/A' }])),
  }, null, 2) + '\n', { flag: 'wx' });
}
console.log(`SMOKE_CONFIG_131_OK: ${out}`);
