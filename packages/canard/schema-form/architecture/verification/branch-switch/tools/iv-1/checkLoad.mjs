// Untimed checks reuse all public/root stages, then exercise the two new nested stages.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2]);
verifyInputs(root);
execFileSync(
  process.execPath,
  [path.join(here, '../b9-1/checkLoad.mjs'), root],
  { stdio: 'inherit' },
);
const results = [];
for (const lane of ['A', 'B'])
  for (const mode of [
    'dist',
    'unwrapped',
    'wrapped',
    'supplemental',
    ...(lane === 'A' ? ['legacy'] : []),
  ])
    for (const row of ['single-nested-d6-f4', 'switch-nested-oneOf-20']) {
      const result = JSON.parse(
        execFileSync(
          process.execPath,
          [
            path.join(here, 'worker.mjs'),
            getStageRoot(root, lane),
            row,
            'smoke',
            mode,
          ],
          { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
        ),
      );
      assert.equal(result.timed, false);
      results.push({ lane, ...result });
    }
json(path.join(root, 'local-load-check.json'), {
  timed: false,
  inputsSha256: digest(path.join(root, 'inputs.json')).sha256,
  results,
});
console.log('IV_1_UNTIMED_LOAD_OK nested-bundles=' + results.length);
