// Actual profiler CLI rehearsal: one process, one warmup, one operation, no formal marker.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';
import { hashInputs } from './helpers/hashInputs.mjs';
import { sanitizeProfile } from './helpers/sanitizeProfile.mjs';

const [rootArgument, authorization, pidArgument] = process.argv.slice(2);
assert.equal(authorization, '--authorized');
const root = path.resolve(rootArgument);
const here = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(here, '../../../../../../../..');
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
assert.deepEqual(hashInputs(repoDir), inputs.hashes);
assert.ok(fs.existsSync(path.join(root, 'smoke.json')));
assert.ok(!fs.existsSync(path.join(root, 'started.json')));
const rehearsal = path.join(root, 'rehearsal.noindex');
const directory = path.join(rehearsal, 'raw.noindex/switch-oneOf-80-50');
assert.ok(!fs.existsSync(rehearsal));
fs.mkdirSync(directory, { recursive: true });
fs.copyFileSync(
  path.join(root, 'engine.mjs'),
  path.join(rehearsal, 'engine.mjs'),
);
fs.symlinkSync(
  path.join(repoDir, 'node_modules'),
  path.join(rehearsal, 'node_modules'),
);
const quiet = await waitForQuietProcess({ agentPid: Number(pidArgument) });
fs.writeFileSync(
  path.join(rehearsal, 'quiet.json'),
  JSON.stringify(quiet, null, 2) + '\n',
);
if (!quiet.approved) {
  fs.writeFileSync(
    path.join(root, 'rehearsal.json'),
    JSON.stringify({ passed: false, reason: 'environment-refusal' }) + '\n',
  );
  console.log('IV_3_0_REHEARSAL_REFUSED');
} else {
  const result = spawnSync(
    process.execPath,
    [
      '--cpu-prof',
      '--cpu-prof-interval=50',
      '--cpu-prof-dir=' + directory,
      '--cpu-prof-name=cpu.cpuprofile',
      path.join(here, 'worker.mjs'),
      rehearsal,
      'switch-oneOf-80',
      '50',
      'rehearse',
    ],
    { env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8' },
  );
  fs.writeFileSync(path.join(rehearsal, 'worker.stderr'), result.stderr ?? '');
  assert.equal(result.status, 0, result.stderr);
  const file = path.join(directory, 'cpu.cpuprofile');
  fs.writeFileSync(
    file,
    JSON.stringify(
      sanitizeProfile(
        JSON.parse(fs.readFileSync(file, 'utf8')),
        repoDir,
        rehearsal,
      ),
    ) + '\n',
  );
  const wall = JSON.parse(
    fs.readFileSync(path.join(directory, 'wall.json'), 'utf8'),
  );
  assert.equal(wall.switches, 1);
  assert.equal(wall.warmups, 1);
  fs.writeFileSync(
    path.join(root, 'rehearsal.json'),
    JSON.stringify({
      passed: true,
      formal: false,
      processes: 1,
      warmups: 1,
      switches: 1,
      cpuProfile: true,
    }) + '\n',
  );
  console.log('IV_3_0_REHEARSAL_OK');
}
