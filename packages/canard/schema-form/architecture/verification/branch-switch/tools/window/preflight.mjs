// Nonformal CLI rehearsal: one worker, one warmup and one sample, outside the formal device.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareEngines } from '../../../design-optimization/tools/helpers/prepareEngines.mjs';
import { readAlternatingConfig } from '../../../design-optimization/tools/helpers/readAlternatingConfig.mjs';
import { readConfig } from '../../../design-optimization/tools/helpers/readConfig.mjs';
import { verifyInputs } from '../b4-2/verifyInputs.mjs';
import { getStageRoot } from './getStageRoot.mjs';

const root = path.resolve(process.argv[2]);
assert.ok(root.endsWith('.noindex'));
assert.ok(!fs.existsSync(path.join(root, 'formal-start.json')));
verifyInputs(root);
const tools = fileURLToPath(
  new URL('../../../design-optimization/tools/', import.meta.url),
);
const rehearsal = root.slice(0, -8) + '-preflight.noindex';
assert.ok(!fs.existsSync(rehearsal), 'Preserve earlier rehearsal evidence');
const runDir = path.join(rehearsal, 'pair');
const common = [
  '--worker=single-flat-1000',
  '--lane=B',
  '--samples=1',
  '--warmups=1',
  '--runs=2',
  '--quality=legacy',
];
// The even runs flag belongs to the parent parser; --worker launches exactly one process.
const config = readAlternatingConfig([...common, '--run-dir=' + runDir]);
readAlternatingConfig([...common, '--run-dir=' + root.slice(0, -8) + '/pair']);
assert.throws(() =>
  readAlternatingConfig([...common, '--run-dir=' + root + '.noindex/pair']),
);
for (const lane of ['A', 'B'])
  readConfig(
    [
      '--worker=switch-oneOf-80',
      '--samples=1',
      '--warmups=1',
      '--run-dir=' + getStageRoot(root, lane) + '/stages',
    ],
    new URL('../../../design-optimization/tools/', import.meta.url),
  );
process.env.NODE_ENV = 'production';
process.env.D0_RUN_DIR = root;
const profileContext = (
  await import('../../../design-optimization/tools/profile/context.mjs')
).default;
assert.equal(profileContext.runDir, root);
fs.mkdirSync(runDir, { recursive: true });
prepareEngines(
  config.packageDir,
  path.join(runDir, 'B'),
  '0.16.1',
  path.join(root, 'bundles/B/index.node.mjs'),
);
const args = [
  '--import',
  path.join(tools, 'profile/register.mjs'),
  path.join(tools, 'alternate.mjs'),
  ...common,
  '--repeat=0',
  '--run-dir=' + runDir,
];
const result = spawnSync(process.execPath, args, {
  cwd: config.repoDir,
  env: { ...process.env, NODE_ENV: 'production' },
  encoding: 'utf8',
  maxBuffer: 16 * 1024 * 1024,
});
fs.writeFileSync(path.join(rehearsal, 'worker.stdout'), result.stdout ?? '');
fs.writeFileSync(path.join(rehearsal, 'worker.stderr'), result.stderr ?? '');
fs.writeFileSync(
  path.join(rehearsal, 'command.json'),
  JSON.stringify(
    {
      executable: process.execPath,
      args,
      pid: result.pid,
      status: result.status,
    },
    null,
    2,
  ) + '\n',
);
assert.equal(result.status, 0, result.stderr);
const observation = JSON.parse(result.stdout);
assert.equal(observation.row, 'single-flat-1000');
assert.equal(observation.repeat, 0);
assert.equal(observation.samples.current.length, 1);
assert.equal(observation.samples.legacy.length, 1);
assert.ok(!fs.existsSync(path.join(root, 'formal-start.json')));
assert.ok(!fs.existsSync(path.join(rehearsal, 'formal-start.json')));
const summary = {
  formal: false,
  row: observation.row,
  workers: 1,
  warmups: 1,
  samples: 1,
  pid: result.pid,
  status: result.status,
  formalMarkerCreated: false,
};
fs.writeFileSync(
  path.join(rehearsal, 'summary.json'),
  JSON.stringify(summary, null, 2) + '\n',
);
console.log('WINDOW_PREFLIGHT_OK ' + JSON.stringify(summary));
