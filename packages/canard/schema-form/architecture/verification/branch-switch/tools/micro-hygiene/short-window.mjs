// One coordinator-authorized window; every child receipt is preserved before failure.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { sampleProcessCpu } from '../b8/helpers/sampleProcessCpu.mjs';
import { digest } from '../b9-0/files.mjs';
import { compactProcessRows } from '../b9-1/helpers/compactProcessRows.mjs';
import { runWindowProcess } from '../b9-1/helpers/runWindowProcess.mjs';
import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';
import { verifyInputs } from './verifyInputs.mjs';

assert.equal(process.versions.node.split('.')[0], '26');
assert.equal(process.argv[3], '--authorized');
const root = path.resolve(process.argv[2]);
const agentPid = Number(
  process.argv.find((arg) => arg.startsWith('--agent-pid='))?.slice(12),
);
assert.ok(Number.isSafeInteger(agentPid) && agentPid > 0);
assert.ok(root.endsWith('.noindex'));
verifyInputs(root);
const smoke = JSON.parse(
  fs.readFileSync(path.join(root, 'stage-load-check.json'), 'utf8'),
);
assert.equal(smoke.timed, false);
assert.equal(smoke.results.length, 9);
assert.equal(smoke.inputsSha256, digest(path.join(root, 'inputs.json')).sha256);
assert.equal(
  JSON.parse(
    fs.readFileSync(path.join(root, 'untimed-load-check.json'), 'utf8'),
  ).timed,
  false,
);
assert.equal(
  JSON.parse(fs.readFileSync(path.join(root, 'rehearsal.json'), 'utf8')).formal,
  false,
);
assert.ok(
  !fs.existsSync(path.join(root, 'formal-start.json')),
  'Never repeat a formal device',
);
const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '../../../../..');
const repository = path.resolve(packageDir, '../../..');
const tools = path.resolve(here, '../../../design-optimization/tools');
const context = { root, agentPid, repository, here };
const run = (...args) => runWindowProcess(context, ...args);
const quiet = await waitForQuietProcess({ agentPid });
fs.writeFileSync(
  path.join(root, 'quiet-window.json'),
  JSON.stringify(quiet, null, 2) + '\n',
);
if (!quiet.approved) {
  console.log(
    'MICRO_HYGIENE_SHORT_ENVIRONMENT_REFUSAL_ZERO_SAMPLES ' +
      JSON.stringify(quiet.heavy),
  );
  process.exitCode = 3;
} else {
  const startedAt = new Date().toISOString();
  fs.writeFileSync(
    path.join(root, 'formal-start.json'),
    JSON.stringify({
      startedAt,
      quietSince: quiet.quietSince,
      shortWindow: true,
      processesPerLane: 4,
      baselineHalfProcesses: 2,
      pilot: false,
      stages: false,
      retention: false,
    }) + '\n',
    { flag: 'wx' },
  );
  console.log('MICRO_HYGIENE_SHORT_WINDOW_START ' + startedAt);
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
        '--runs=4',
        '--short-window=true',
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
  } finally {
    fs.writeFileSync(dist, backup);
    fs.writeFileSync(
      path.join(root, 'window-end.json'),
      JSON.stringify(
        {
          endedAt: new Date().toISOString(),
          invalid,
          processes: compactProcessRows(await sampleProcessCpu(3000)),
        },
        null,
        2,
      ) + '\n',
    );
    verifyInputs(root);
  }
  console.log('MICRO_HYGIENE_SHORT_WINDOW_END');
  if (invalid) process.exitCode = 2;
}
