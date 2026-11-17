// Invoked directly by Node; CLI arguments select the frozen snapshot and allowed differences.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

import { assertFreshBuild } from './_lib.mjs';
import { diffSnapshots } from './equivalenceDiff/diffSnapshots.mjs';

try {
  const { values } = parseArgs({
    options: {
      baseline: { type: 'string' },
      allow: { type: 'string', default: '' },
      'require-changed': { type: 'string', default: '' },
    },
  });
  if (!values.baseline) throw new Error('--baseline <json> is required');
  assertFreshBuild();
  const baseline = JSON.parse(readFileSync(values.baseline, 'utf8'));
  const child = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('./equivalence.mjs', import.meta.url))],
    {
      encoding: 'utf8',
      maxBuffer: 16 * 1024 * 1024,
    },
  );
  if (child.error) throw child.error;
  if (child.status !== 0)
    throw new Error(`equivalence.mjs failed: ${child.stderr}`);
  const current = JSON.parse(child.stdout);
  const changed = diffSnapshots(baseline, current, {
    allow: values.allow.split(',').filter(Boolean),
    requireChanged: values['require-changed'].split(',').filter(Boolean),
  });
  console.log(
    JSON.stringify({ cases: Object.keys(current).length, changed }, null, 2),
  );
  console.log('EQUIVALENCE_DIFF_OK');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
