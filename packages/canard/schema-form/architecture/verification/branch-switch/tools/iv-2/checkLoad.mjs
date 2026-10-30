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
    for (const row of ['single-nested-d6-f4']) {
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
for (const lane of ['A', 'B']) {
  const record = JSON.parse(
    execFileSync(
      process.execPath,
      [
        path.join(here, 'detailWorker.mjs'),
        root,
        lane,
        'switch-oneOf-80',
        'switch',
        'smoke',
      ],
      { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
    ),
  );
  assert.equal(record.timed, false);
}
const cold = JSON.parse(
  execFileSync(
    process.execPath,
    [path.join(here, 'coldFirstWrite.mjs'), root, '--smoke'],
    { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
  ),
);
assert.equal(cold.timed, false);
const wide = [];
for (const runtime of ['node', 'bun'])
  for (const history of [2, 80])
    for (const lane of ['A', 'B']) {
      const record = JSON.parse(
        execFileSync(
          runtime === 'node' ? process.execPath : 'bun',
          [
            path.join(here, 'wideBucketHeap.mjs'),
            root,
            lane,
            String(history),
            '--smoke',
          ],
          { encoding: 'utf8', env: { ...process.env, NODE_ENV: 'production' } },
        ),
      );
      assert.equal(record.timed, false);
      assert.equal(record.smoke, true);
      assert.equal(record.sampleCount, 0);
      assert.equal(record.samples.length, 0);
      assert.equal(record.formsCreated, 1);
      wide.push(record);
    }
json(path.join(root, 'wide-bucket-load-check.json'), {
  timed: false,
  inputsSha256: digest(path.join(root, 'inputs.json')).sha256,
  results: wide,
});
console.log('IV_2_UNTIMED_LOAD_OK nested-bundles=' + results.length);
