// CLI is the diagnostic entry point; run requires coordinator authorization and the shared quiet gate.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';
import { hashInputs } from './helpers/hashInputs.mjs';
import { runPlain } from './helpers/runPlain.mjs';
import { sanitizeProfile } from './helpers/sanitizeProfile.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(here, '../../../../../../../..');
const [mode, rootArgument, authorization, pidArgument] = process.argv.slice(2);
const root = fs.realpathSync(path.resolve(rootArgument));
assert.ok(root.endsWith('.noindex') && !root.startsWith(repoDir + '/'));
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
assert.deepEqual(hashInputs(repoDir), inputs.hashes, 'Immutable inputs');
assert.equal(
  createHash('sha256')
    .update(fs.readFileSync(path.join(root, 'engine.mjs')))
    .digest('hex'),
  inputs.engineSha256,
);
assert.equal(process.version, inputs.node);
assert.ok(['smoke', 'run'].includes(mode));
const rows = ['switch-oneOf-80', 'switch-siblings-0', 'single-flat-1000'];
if (mode === 'smoke') {
  for (const row of rows) {
    const result = spawnSync(
      process.execPath,
      [path.join(here, 'worker.mjs'), root, row, '0', 'smoke'],
      { env: { ...process.env, NODE_ENV: 'production' }, encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    console.log(result.stdout.trim());
  }
  fs.writeFileSync(
    path.join(root, 'smoke.json'),
    JSON.stringify({ rows, timed: false, passed: true }) + '\n',
  );
} else {
  assert.equal(authorization, '--authorized');
  const agentPid = Number(pidArgument);
  assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
  assert.ok(fs.existsSync(path.join(root, 'smoke.json')));
  assert.equal(
    JSON.parse(fs.readFileSync(path.join(root, 'rehearsal.json'), 'utf8'))
      .passed,
    true,
  );
  console.log(
    'IV_3_0_REHEARSAL_PERIOD ' +
      JSON.stringify(
        JSON.parse(fs.readFileSync(path.join(root, 'rehearsal.json'), 'utf8')),
      ),
  );
  assert.ok(
    !fs.existsSync(path.join(root, 'started.json')),
    'Never auto-retry a diagnostic root',
  );
  fs.writeFileSync(
    path.join(root, 'started.json'),
    JSON.stringify({
      startedAt: new Date().toISOString(),
      node: process.version,
    }) + '\n',
  );
  let failure = null;
  const results = [];
  for (const row of rows) {
    failure = await runPlain(
      root,
      row,
      agentPid,
      path.join(here, 'worker.mjs'),
    );
    if (failure) break;
    for (const interval of [50, 25]) {
      const directory = path.join(root, 'raw.noindex', row + '-' + interval);
      fs.mkdirSync(directory);
      const quiet = await waitForQuietProcess({ agentPid });
      fs.writeFileSync(
        path.join(directory, 'quiet.json'),
        JSON.stringify(quiet, null, 2) + '\n',
      );
      if (!quiet.approved) {
        failure = { kind: 'environment-refusal', row, interval };
        break;
      }
      const result = spawnSync(
        process.execPath,
        [
          '--cpu-prof',
          '--cpu-prof-interval=' + interval,
          '--cpu-prof-dir=' + directory,
          '--cpu-prof-name=cpu.cpuprofile',
          path.join(here, 'worker.mjs'),
          root,
          row,
          String(interval),
          'run',
        ],
        {
          env: { ...process.env, NODE_ENV: 'production' },
          encoding: 'utf8',
          maxBuffer: 16 * 1024 * 1024,
        },
      );
      fs.writeFileSync(
        path.join(directory, 'worker.stderr'),
        result.stderr ?? '',
      );
      if (result.status !== 0) {
        failure = {
          kind: 'worker-failure',
          row,
          interval,
          status: result.status,
        };
        break;
      }
      const profileFile = path.join(directory, 'cpu.cpuprofile');
      const profile = sanitizeProfile(
        JSON.parse(fs.readFileSync(profileFile, 'utf8')),
        repoDir,
        root,
      );
      fs.writeFileSync(profileFile, JSON.stringify(profile) + '\n');
      const attributed = spawnSync(
        process.execPath,
        [path.join(here, 'attribute.mjs'), directory],
        { encoding: 'utf8' },
      );
      if (attributed.status !== 0) {
        fs.writeFileSync(
          path.join(directory, 'attribute.stderr'),
          attributed.stderr ?? '',
        );
        failure = {
          kind: 'attribution-failure',
          row,
          interval,
          status: attributed.status,
        };
        break;
      }
      console.log(attributed.stdout.trim());
      const tables = JSON.parse(
        fs.readFileSync(path.join(directory, 'tables.json'), 'utf8'),
      );
      results.push({
        row,
        interval,
        ratio: tables.reconciliationRatio,
        reconciled: tables.reconciled,
      });
      if (tables.reconciled) break;
      if (interval === 25)
        failure = {
          kind: 'reconciliation-failed-twice',
          row,
          interval,
          ratio: tables.reconciliationRatio,
        };
    }
    if (failure) break;
  }
  assert.deepEqual(
    hashInputs(repoDir),
    inputs.hashes,
    'Inputs remain immutable after sampling',
  );
  fs.writeFileSync(
    path.join(root, 'outcome.json'),
    JSON.stringify(
      {
        completed: !failure,
        failure,
        results,
        rootNormalizationChanged: root !== path.resolve(rootArgument),
        endedAt: new Date().toISOString(),
      },
      null,
      2,
    ) + '\n',
  );
  console.log(
    failure ? 'IV_3_0_STOP ' + JSON.stringify(failure) : 'IV_3_0_PROFILE_OK',
  );
}
