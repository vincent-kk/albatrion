// Serial probe runner; refuses rather than retries any sampled process or environmental failure.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';
import { summarizeProbe } from './helpers/summarizeProbe.mjs';

const [root, mode, targetsText, agentText] = process.argv.slice(2);
const agentPid = Number(agentText);
assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
assert.ok(['probe', 'allocation', 'smoke'].indexOf(mode) !== -1);
const targets = targetsText.split(',');
const protectedRows = [
  'switch-oneOf-80',
  'switch-siblings-0',
  'switch-payload-12',
  'single-flat-1000',
];
const rows =
  mode === 'probe'
    ? [...targets, ...protectedRows].filter(
        (row, index, all) => all.indexOf(row) === index,
      )
    : targets;
const marker = path.join(root, mode + '-started.json');
assert.ok(!fs.existsSync(marker), 'Never repeat a diagnostic or probe root');
json(marker, { mode, targets, node: process.version });
const here = path.dirname(fileURLToPath(import.meta.url));
const records = [];
for (const row of rows)
  for (let repeat = 0; repeat < (mode === 'probe' ? 3 : 1); repeat++)
    for (const lane of mode === 'probe' ? ['A', 'B'] : ['A']) {
      const label = [row, lane, repeat, mode === 'probe' ? 'plain' : mode].join(
        '-',
      );
      if (mode !== 'smoke') {
        const quiet = await waitForQuietProcess({ agentPid });
        json(path.join(root, 'raw.noindex', label + '-quiet.json'), {
          approved: quiet.approved,
          waitedMs: quiet.waitedMs,
          delays: quiet.delays,
          policy: quiet.policy,
          attempts: quiet.attempts.map((attempt) => ({
            requestedDurationMs: attempt.requestedDurationMs,
            durationSeconds: attempt.durationSeconds,
            rows: attempt.rows
              .slice(0, 10)
              .map(({ name, cpuPercent }) => ({ name, cpuPercent })),
          })),
        });
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
      const run = spawnSync(
        process.execPath,
        [
          path.join(here, 'worker.mjs'),
          root,
          lane,
          row,
          mode === 'probe' ? 'plain' : mode,
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
if (mode === 'probe') {
  const summary = summarizeProbe(records, targets);
  json(path.join(root, 'probe.json'), {
    ...summary,
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
