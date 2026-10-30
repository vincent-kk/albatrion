// One serial GC/allocation diagnostic per root/lane/mode; never retries or changes a plain worker.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import {
  observeMeasurementCpu,
  observeMeasurementStart,
} from './helpers/observeMeasurement.mjs';

const [root, lane, mode, pidText] = process.argv.slice(2);
assert.ok(['A', 'B'].includes(lane) && ['allocation', 'gc'].includes(mode));
const agentPid = Number(pidText);
assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
const marker = path.join(
  root,
  'diagnostic-' + lane + '-' + mode + '-started.json',
);
assert.ok(!fs.existsSync(marker));
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../../../../../../../..');
const files = [
  'diagnose.mjs',
  'helpers/observeMeasurement.mjs',
  '../window/waitForQuietProcess.mjs',
  '../window/helpers/sampleProcessCpu.mjs',
  'gc-worker.mjs',
  'helpers/attributeNativeAllocations.mjs',
  'helpers/summarizeAllocations.mjs',
  '../iv-3-0/helpers/runBlocks.mjs',
  '../iv-3-0/helpers/setupOperation.mjs',
];
const execution = Object.fromEntries(
  files.map((name) => [
    path.relative(repo, path.resolve(here, name)),
    digest(path.resolve(here, name)),
  ]),
);
json(marker, { execution, mode, lane, node: process.version });
const session = path.join(root, 'diagnostic-' + mode + '-session.json');
if (!fs.existsSync(session)) {
  const quiet = await observeMeasurementStart(agentPid);
  json(
    path.join(root, 'diagnostic-' + lane + '-' + mode + '-quiet.json'),
    quiet,
  );
  if (!quiet.approved) {
    json(path.join(root, 'diagnostic-' + lane + '-' + mode + '-failure.json'), {
      kind: 'environment-refusal',
      lane,
      mode,
    });
    console.log('IV_4_DIAGNOSTIC_ENVIRONMENT_REFUSAL');
    process.exit(3);
  }
  json(session, {
    startedAt: new Date().toISOString(),
    mode,
    node: process.version,
    execution,
  });
} else {
  const started = JSON.parse(fs.readFileSync(session, 'utf8'));
  assert.deepEqual(started.execution, execution);
  assert.equal(started.node, process.version);
}
json(
  path.join(root, 'diagnostic-' + lane + '-' + mode + '-cpu.json'),
  observeMeasurementCpu(agentPid),
);
const run = spawnSync(
  process.execPath,
  [path.join(here, 'gc-worker.mjs'), root, lane, mode],
  {
    env: { ...process.env, NODE_ENV: 'production' },
    encoding: 'utf8',
    timeout: 59000,
  },
);
fs.writeFileSync(
  path.join(root, 'diagnostic-' + lane + '-' + mode + '.stdout'),
  run.stdout ?? '',
);
fs.writeFileSync(
  path.join(root, 'diagnostic-' + lane + '-' + mode + '.stderr'),
  run.stderr ?? '',
);
if (run.status !== 0) {
  json(path.join(root, 'diagnostic-' + lane + '-' + mode + '-failure.json'), {
    kind: 'worker-failure',
    lane,
    mode,
    code: run.status,
    signal: run.signal,
  });
  console.log('IV_4_DIAGNOSTIC_WORKER_FAILURE');
  process.exit(4);
}
for (const [name, hash] of Object.entries(execution))
  assert.deepEqual(digest(path.join(repo, name)), hash);
const record = JSON.parse(
  fs.readFileSync(
    path.join(root, 'diagnostic-' + lane + '-' + mode + '.json'),
    'utf8',
  ),
);
json(path.join(root, 'diagnostic-' + lane + '-' + mode + '.json'), {
  record,
  execution,
  inputs: digest(path.join(root, lane, 'inputs.json')),
});
console.log(
  JSON.stringify({
    lane,
    mode,
    gc: record.gc.counts,
    bytesPerRoundTrip: record.allocations?.bytesPerOperation,
    register: record.attribution?.rows.filter(
      (row) => row.function === 'register',
    ),
  }),
);
console.log('IV_4_DIAGNOSTIC_OK');
