// Run once after coordinator authorization; completed formal samples are never retried.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { sampleWindow } from '../../../design-optimization/tools/profile/branch-switch/sampleWindow.mjs';
import { getStageRoot } from '../window/getStageRoot.mjs';
import { verifyInputs } from './verifyInputs.mjs';

assert.equal(Number(process.versions.node.split('.')[0]), 26);
const root = path.resolve(process.argv[2]);
assert.ok(
  fs.existsSync(path.join(root, 'inputs.json')),
  'Prepare immutable bundles first',
);
verifyInputs(root);
assert.ok(
  !fs.existsSync(path.join(root, 'formal-start.json')),
  'Never repeat a formal device',
);
const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '../../../../..');
const repository = path.resolve(packageDir, '../../..');
const tools = path.resolve(here, '../../../design-optimization/tools');
const run = async (
  label,
  executable,
  args,
  cwd = repository,
  invalidAllowed = false,
) => {
  const startedAt = new Date().toISOString();
  const logfile = fs.openSync(path.join(root, label + '.log'), 'w');
  const errors = fs.openSync(path.join(root, label + '.stderr.log'), 'w');
  const child = spawn(executable, args, {
    cwd,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', logfile, errors],
  });
  const code = await new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('exit', resolve);
  });
  fs.closeSync(logfile);
  fs.closeSync(errors);
  fs.writeFileSync(
    path.join(root, label + '.command.json'),
    JSON.stringify(
      {
        executable,
        args,
        cwd,
        startedAt,
        endedAt: new Date().toISOString(),
        code,
      },
      null,
      2,
    ) + '\n',
  );
  console.log(label + ' EXIT ' + code);
  assert.ok(
    code === 0 || (invalidAllowed && code === 2),
    label + ' failed; preserve raw data without retry',
  );
  return code;
};
const quiet = await sampleWindow();
fs.writeFileSync(
  path.join(root, 'quiet-window.json'),
  JSON.stringify(quiet, null, 2) + '\n',
);
if (quiet.heavy.length) {
  console.log(
    'B4_PREFLIGHT_HEAVY_ZERO_FORMAL_SAMPLES ' + JSON.stringify(quiet.heavy),
  );
  process.exitCode = 3;
} else {
  const startedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(root, 'formal-start.json'),
    JSON.stringify({ startedAt, quietSince: quiet.quietSince }) + '\n',
    { flag: 'wx' },
  );
  console.log('B4_WINDOW_START ' + startedAt);
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
    ])
      for (let repeat = 0; repeat < 3; repeat++)
        for (const lane of ['A', 'B']) {
          const runDir = getStageRoot(root, lane) + '/stages';
          const label = 'stage-' + row + '-' + lane + '-' + repeat;
          await run(label, process.execPath, [
            path.join(here, 'stages.mjs'),
            '--worker=' + row,
            '--repeat=' + repeat,
            '--samples=100',
            '--warmups=20',
            '--prepared=true',
            '--quiet-since=' + quiet.quietSince,
            '--run-dir=' + runDir,
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
    const supplemental = [];
    for (const row of [
      'switch-oneOf-80',
      'switch-payload-12',
      'switch-siblings-0',
    ])
      for (let repeat = 0; repeat < 3; repeat++) {
        const label = 'supplemental-' + row + '-B-' + repeat;
        await run(label, process.execPath, [
          path.join(here, 'stages.mjs'),
          '--pass=supplemental',
          '--worker=' + row,
          '--repeat=' + repeat,
          '--samples=100',
          '--warmups=20',
          '--prepared=true',
          '--quiet-since=' + quiet.quietSince,
          '--run-dir=' + getStageRoot(root, 'B') + '/stages',
        ]);
        supplemental.push(
          JSON.parse(fs.readFileSync(path.join(root, label + '.log'), 'utf8')),
        );
      }
    fs.writeFileSync(
      getStageRoot(root, 'B') + '/stages/supplemental-results.json',
      JSON.stringify({ results: supplemental }) + '\n',
    );
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
        '{node-home}/bin/bun',
        ['bench/legacy-compare/node-and-settle.bench.ts', '--heap-child'],
        packageDir,
      );
    }
    for (const row of [
      'switch-oneOf-80',
      'switch-payload-12',
      'switch-siblings-0',
    ])
      await run('retention-' + row, process.execPath, [
        '--expose-gc',
        path.join(here, 'retention.mjs'),
        '--bundle=' + path.join(root, 'pair/B/engines/current.mjs'),
        '--row=' + row,
        '--output=' + path.join(root, 'retention', row),
      ]);
    await run('wildcard-cost', process.execPath, [
      '--expose-gc',
      path.join(here, 'wildcardCost.mjs'),
      getStageRoot(root, 'B') + '/stages/scratch/wrapped.mjs',
      path.join(root, 'wildcard-cost'),
    ]);
  } finally {
    fs.writeFileSync(dist, backup);
    fs.writeFileSync(
      path.join(root, 'window-end.json'),
      JSON.stringify(
        {
          endedAt: new Date().toISOString(),
          invalid,
          processes: await sampleWindow(),
        },
        null,
        2,
      ) + '\n',
    );
    verifyInputs(root);
  }
  console.log('B4_WINDOW_END ' + root);
  if (invalid) process.exitCode = 2;
}
