// The actual worker CLI takes exactly one nonformal sample before any formal marker.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { prepareEngines } from '../../../design-optimization/tools/helpers/prepareEngines.mjs';
import { json } from '../b9-0/files.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]);
verifyInputs(root);
assert.ok(!fs.existsSync(path.join(root, 'formal-start.json')));
const runDir = root.slice(0, -8) + '-rehearsal.noindex/pair';
fs.mkdirSync(runDir, { recursive: true });
const packageDir = fileURLToPath(new URL('../../../../../', import.meta.url));
const repository = path.resolve(packageDir, '../../..');
fs.symlinkSync(
  path.join(repository, 'node_modules'),
  path.join(path.dirname(runDir), 'node_modules'),
);
prepareEngines(
  packageDir,
  path.join(runDir, 'B'),
  '0.16.1',
  path.join(root, 'bundles/B/index.node.mjs'),
);
const tools = fileURLToPath(
  new URL('../../../design-optimization/tools/', import.meta.url),
);
const args = [
  '--import',
  path.join(tools, 'profile/register.mjs'),
  path.join(tools, 'alternate.mjs'),
  '--worker=single-flat-1000',
  '--lane=B',
  '--samples=1',
  '--warmups=1',
  '--runs=2',
  '--quality=legacy',
  '--repeat=0',
  '--run-dir=' + runDir,
];
const result = spawnSync(process.execPath, args, {
  cwd: repository,
  encoding: 'utf8',
  env: { ...process.env, NODE_ENV: 'production' },
});
fs.writeFileSync(
  path.join(path.dirname(runDir), 'stdout.log'),
  result.stdout ?? '',
);
fs.writeFileSync(
  path.join(path.dirname(runDir), 'stderr.log'),
  result.stderr ?? '',
);
json(path.join(path.dirname(runDir), 'command.json'), {
  args,
  pid: result.pid,
  code: result.status,
});
assert.equal(result.status, 0, result.stderr);
const sample = JSON.parse(result.stdout);
assert.equal(sample.samples.current.length, 1);
assert.equal(sample.samples.legacy.length, 1);
assert.ok(!fs.existsSync(path.join(root, 'formal-start.json')));
json(path.join(root, 'rehearsal.json'), {
  formal: false,
  workers: 1,
  warmups: 1,
  samples: 1,
  code: result.status,
});
console.log('IV_0_REHEARSAL_OK workers=1 warmups=1 samples=1 marker=false');
