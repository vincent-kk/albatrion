// Serial probe runner; starts after one quiet observation and logs later external CPU.
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
import { summarizeProbe } from './helpers/summarizeProbe.mjs';

const [root, mode, targetsText, agentText] = process.argv.slice(2);
const agentPid = Number(agentText);
assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
assert.ok(['probe', 'reprobe', 'allocation', 'smoke'].indexOf(mode) !== -1);
const targets = targetsText.split(',');
const plain = mode === 'probe' || mode === 'reprobe';
const repetitions = mode === 'reprobe' ? 5 : 3;
const protectedRows = [
  'switch-oneOf-80',
  'switch-siblings-0',
  'switch-payload-12',
  'single-flat-1000',
];
const rows = plain
  ? [...targets, ...protectedRows].filter(
      (row, index, all) => all.indexOf(row) === index,
    )
  : targets;
const marker = path.join(root, mode + '-started.json');
assert.ok(!fs.existsSync(marker), 'Never repeat a diagnostic or probe root');
const here = path.dirname(fileURLToPath(import.meta.url));
const execution = Object.fromEntries(
  [
    'run.mjs',
    'worker.mjs',
    'helpers/setupProbeOperation.mjs',
    '../iv-3-0/helpers/setupOperation.mjs',
    '../iv-3-0/helpers/runBlocks.mjs',
    '../b9-0/operation.mjs',
    '../../../design-optimization/tools/fixtures.mjs',
    'helpers/observeMeasurement.mjs',
    'helpers/summarizeProbe.mjs',
    '../window/waitForQuietProcess.mjs',
    '../window/helpers/sampleProcessCpu.mjs',
  ].map((name) => [name, digest(path.resolve(here, name))]),
);
json(marker, { mode, targets, node: process.version, execution });
const records = [];
for (const row of rows)
  for (let repeat = 0; repeat < (plain ? repetitions : 1); repeat++)
    for (const lane of plain ? ['A', 'B'] : ['A']) {
      const label = [row, lane, repeat, plain ? 'plain' : mode].join('-');
      if (mode !== 'smoke' && !records.length) {
        const quiet = await observeMeasurementStart(agentPid);
        json(path.join(root, 'raw.noindex', label + '-quiet.json'), quiet);
        if (!quiet.approved) {
          json(path.join(root, 'failure.json'), {
            kind: 'environment-refusal',
            row,
            lane,
            repeat,
          });
          console.log('IV_4_ENVIRONMENT_REFUSAL ' + label);
          process.exit(3);
        }
      }
      json(
        path.join(root, 'raw.noindex', label + '-cpu.json'),
        observeMeasurementCpu(agentPid),
      );
      const run = spawnSync(
        process.execPath,
        [
          path.join(here, 'worker.mjs'),
          root,
          lane,
          row,
          plain ? 'plain' : mode,
          String(repeat),
        ],
        {
          env: { ...process.env, NODE_ENV: 'production' },
          encoding: 'utf8',
          timeout: 59000,
        },
      );
      fs.writeFileSync(
        path.join(root, 'raw.noindex', label + '.stdout'),
        run.stdout ?? '',
      );
      fs.writeFileSync(
        path.join(root, 'raw.noindex', label + '.stderr'),
        run.stderr ?? '',
      );
      if (run.status !== 0) {
        json(path.join(root, 'failure.json'), {
          kind: 'worker-failure',
          row,
          lane,
          repeat,
          status: run.status,
          signal: run.signal,
          timeout: Boolean(
            run.error && 'code' in run.error && run.error.code === 'ETIMEDOUT',
          ),
        });
        console.log('IV_4_WORKER_FAILURE ' + label);
        process.exit(4);
      }
      if (mode !== 'smoke')
        records.push(
          JSON.parse(
            fs.readFileSync(
              path.join(root, 'raw.noindex', label + '.json'),
              'utf8',
            ),
          ),
        );
      console.log('IV_4_PROCESS_OK ' + label);
    }
if (plain) {
  const summary = summarizeProbe(records, targets, repetitions);
  json(path.join(root, 'probe.json'), {
    ...summary,
    execution,
    inputs: Object.fromEntries(
      ['A', 'B'].map((lane) => [
        lane,
        digest(path.join(root, lane, 'inputs.json')),
      ]),
    ),
    records,
  });
  for (const row of summary.rows) console.log(JSON.stringify(row));
  console.log(summary.kept ? 'IV_4_PROBE_KEEP' : 'IV_4_PROBE_DROP');
} else if (mode === 'allocation') {
  json(path.join(root, 'allocation.json'), {
    inputs: digest(path.join(root, 'A/inputs.json')),
    record: records[0],
  });
  console.log(JSON.stringify(records[0].allocations.frames.slice(0, 20)));
  console.log('IV_4_ALLOCATION_CAPTURED');
}
