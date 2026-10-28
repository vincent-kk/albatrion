// Run once after coordinator authorization; completed formal samples are never retried.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { sampleProcessCpu } from '../b8/helpers/sampleProcessCpu.mjs';
import { digest } from '../b9-0/files.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';
import { runWindowProcess } from './helpers/runWindowProcess.mjs';
import { verifyInputs } from './verifyInputs.mjs';

assert.equal(Number(process.versions.node.split('.')[0]), 26);
assert.equal(
  process.argv[3],
  '--authorized',
  'Only root may authorize the single formal window',
);
const root = path.resolve(process.argv[2]);
const agentPid = Number(
  process.argv.find((arg) => arg.startsWith('--agent-pid='))?.slice(12),
);
assert.ok(
  Number.isInteger(agentPid) && agentPid > 0,
  'Explicit runner agent PID',
);
assert.ok(
  fs.existsSync(path.join(root, 'inputs.json')),
  'Prepare immutable bundles first',
);
verifyInputs(root);
const smoke = JSON.parse(
  fs.readFileSync(path.join(root, 'stage-load-check.json'), 'utf8'),
);
assert.equal(smoke.timed, false);
assert.equal(smoke.results.length, 9);
assert.equal(smoke.inputsSha256, digest(path.join(root, 'inputs.json')).sha256);
const retentionSmoke = JSON.parse(
  fs.readFileSync(path.join(root, 'retention-load-check.json'), 'utf8'),
);
assert.equal(retentionSmoke.code, 0);
assert.equal(retentionSmoke.formal, false);
assert.equal(retentionSmoke.row, 'switch-siblings-1000');
assert.equal(retentionSmoke.inputsSha256, smoke.inputsSha256);
assert.ok(
  !fs.existsSync(path.join(root, 'formal-start.json')),
  'Never repeat a formal device',
);
const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '../../../../..');
const repository = path.resolve(packageDir, '../../..');
const tools = path.resolve(here, '../../../design-optimization/tools');
const runContext = { root, agentPid, repository, here };
const run = (...args) => runWindowProcess(runContext, ...args);
const quiet = await waitForQuietProcess({ agentPid });
quiet.externalCpuPercent = quiet.rows
  .filter((row) => row.pid !== agentPid)
  .reduce((sum, row) => sum + row.cpuPercent, 0);
fs.writeFileSync(
  path.join(root, 'quiet-window.json'),
  JSON.stringify(quiet, null, 2) + '\n',
);
if (!quiet.approved) {
  console.log(
    'B9_1_PREFLIGHT_HEAVY_ZERO_FORMAL_SAMPLES ' + JSON.stringify(quiet.heavy),
  );
  process.exitCode = 3;
} else {
  const startedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(root, 'formal-start.json'),
    JSON.stringify({ startedAt, quietSince: quiet.quietSince }) + '\n',
    { flag: 'wx' },
  );
  console.log('B9_1_WINDOW_START ' + startedAt);
  const dist = path.join(packageDir, 'dist/index.mjs');
  const backup = fs.readFileSync(dist);
  let invalid = false;
  try {
    const code = await run(
      'alternate',
      process.execPath,
      [
        path.join(tools, 'alternate.mjs'),
        '--baseline-bundle=' + path.join(root, 'bundles/A/index.node.mjs'),
        '--candidate-bundle=' + path.join(root, 'bundles/B/index.node.mjs'),
        '--quality=legacy',
        '--runs=10',
        '--warmups=20',
        '--samples=100',
        '--quiet-since=' + quiet.quietSince,
        '--only=' +
          buildAlternatingRows(true)
            .map((row) => row.id)
            .join(','),
        '--run-dir=' + path.join(root, 'pair'),
      ],
      repository,
      true,
    );
    invalid = code === 2;
    const results = { A: [], B: [] };
    for (const row of [
      'switch-oneOf-80',
      'switch-payload-12',
      'switch-siblings-0',
      'switch-siblings-1000',
    ])
      for (let repeat = 0; repeat < 3; repeat++)
        for (const lane of ['A', 'B']) {
          const label = 'stage-' + row + '-' + lane + '-' + repeat;
          await run(label, process.execPath, [
            path.join(here, '../b9-0/worker.mjs'),
            getStageRoot(root, lane),
            row,
            'ledger',
            String(repeat),
          ]);
          results[lane].push(
            JSON.parse(
              fs.readFileSync(path.join(root, label + '.log'), 'utf8'),
            ),
          );
        }
    for (const lane of ['A', 'B']) {
      fs.writeFileSync(
        getStageRoot(root, lane) + '/stages/results.json',
        JSON.stringify({ results: results[lane] }) + '\n',
      );
    }
    for (const lane of ['A', 'B']) {
      const supplemental = [];
      for (const row of [
        'switch-oneOf-80',
        'switch-payload-12',
        'switch-siblings-0',
        'switch-siblings-1000',
      ])
        for (let repeat = 0; repeat < 3; repeat++) {
          const label = 'supplemental-' + row + '-' + lane + '-' + repeat;
          await run(label, process.execPath, [
            path.join(here, '../b9-0/worker.mjs'),
            getStageRoot(root, lane),
            row,
            'supplemental',
            String(repeat),
          ]);
          supplemental.push(
            JSON.parse(
              fs.readFileSync(path.join(root, label + '.log'), 'utf8'),
            ),
          );
        }
      fs.writeFileSync(
        getStageRoot(root, lane) + '/stages/supplemental-results.json',
        JSON.stringify({ results: supplemental }) + '\n',
      );
    }
    for (const lane of ['A', 'B']) {
      fs.writeFileSync(
        dist,
        fs.readFileSync(path.join(root, 'bundles', lane, 'index.mjs')),
      );
      await run(
        'heap-node-' + lane,
        process.execPath,
        [
          '--expose-gc',
          '--import',
          'tsx',
          'bench/legacy-compare/node-and-settle.bench.ts',
          '--heap-child',
        ],
        packageDir,
      );
      await run(
        'heap-bun-' + lane,
        'bun',
        ['bench/legacy-compare/node-and-settle.bench.ts', '--heap-child'],
        packageDir,
      );
    }
    for (const row of [
      'switch-oneOf-80',
      'switch-payload-12',
      'switch-siblings-0',
      'switch-siblings-1000',
    ])
      await run('retention-' + row, process.execPath, [
        '--expose-gc',
        path.join(here, '../b4-2/retention.mjs'),
        '--bundle=' + path.join(root, 'pair/B/engines/current.mjs'),
        '--row=' + row,
        '--output=' + path.join(root, 'retention', row),
      ]);
  } finally {
    fs.writeFileSync(dist, backup);
    fs.writeFileSync(
      path.join(root, 'window-end.json'),
      JSON.stringify(
        {
          endedAt: new Date().toISOString(),
          invalid,
          processes: await sampleProcessCpu(3000),
        },
        null,
        2,
      ) + '\n',
    );
    verifyInputs(root);
  }
  console.log('B9_1_WINDOW_END ' + root);
  if (invalid) process.exitCode = 2;
}
