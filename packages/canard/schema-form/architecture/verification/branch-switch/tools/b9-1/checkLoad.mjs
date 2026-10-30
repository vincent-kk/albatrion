// Both public A/B rows and every stage bundle are checked before formal-start can exist.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { checkRetentionLoad } from './helpers/checkRetentionLoad.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]);
verifyInputs(root);
execFileSync(
  process.execPath,
  [fileURLToPath(new URL('../b6/checkLoad.mjs', import.meta.url)), root],
  {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  },
);
const results = [];
for (const lane of ['A', 'B'])
  for (const mode of [
    'dist',
    'unwrapped',
    'wrapped',
    'supplemental',
    ...(lane === 'A' ? ['legacy'] : []),
  ]) {
    const stageRoot = getStageRoot(root, lane);
    const file = ['dist', 'legacy'].includes(mode)
      ? 'engines/' + mode + '.mjs'
      : 'stages/scratch/' + mode + '.mjs';
    const result = JSON.parse(
      execFileSync(
        process.execPath,
        [
          fileURLToPath(new URL('../b9-0/smoke.mjs', import.meta.url)),
          stageRoot,
          file,
          mode,
        ],
        { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
      ),
    );
    assert.equal(result.timed, false);
    assert.equal(result.rows.length, 6);
    results.push({ lane, ...result });
  }
json(path.join(root, 'stage-load-check.json'), {
  timed: false,
  inputsSha256: digest(path.join(root, 'inputs.json')).sha256,
  results,
});
console.log(
  'B9_1_UNTIMED_LOAD_OK public=A44+B44 stage-bundles=9 legacy-oneOf=120',
);
checkRetentionLoad(root);
