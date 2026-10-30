// One authorized formal window freezes all three lanes; completed samples are never retried.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { digest, json, read } from '../b9-0/files.mjs';
import { compactProcessRows } from '../b9-1/helpers/compactProcessRows.mjs';
import { runWindowProcess } from '../b9-1/helpers/runWindowProcess.mjs';
import { verifyInputs } from '../iv-0/verifyInputs.mjs';
import { observeMeasurementCpu } from '../iv-4/helpers/observeMeasurement.mjs';
import { sampleProcessCpu } from '../window/helpers/sampleProcessCpu.mjs';
import { waitForQuietProcess } from '../window/waitForQuietProcess.mjs';

assert.equal(process.versions.node.split('.')[0], '26');
const root = path.resolve(process.argv[2]);
assert.equal(process.argv[3], '--authorized');
const agentPid = Number(process.argv[4]);
assert.ok(Number.isInteger(agentPid) && agentPid > 0);
verifyInputs(root);
const smoke = read(path.join(root, 'load-check.json'));
assert.equal(smoke.timed, false);
assert.equal(smoke.inputsSha256, digest(path.join(root, 'inputs.json')).sha256);
assert.equal(read(path.join(root, 'rehearsal.json')).code, 0);
for (const role of ['A', 'B'])
  assert.equal(read(path.join(root, 'pilot-summary.json'))[role].processes, 22);
assert.ok(!fs.existsSync(path.join(root, 'formal-start.json')));
const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '../../../../..');
const repository = path.resolve(packageDir, '../../..');
const tools = path.resolve(here, '../../../design-optimization/tools');
const context = {
  root,
  agentPid,
  here,
  repository,
  continuousCpu: true,
  observeCpu: observeMeasurementCpu,
  quietPreload: path.join(here, '../iv-4/quietWorkerPreload.mjs'),
};
const run = (...args) => runWindowProcess(context, ...args);
let quiet;
for (let attempt = 1; ; attempt++) {
  quiet = await waitForQuietProcess({
    agentPid,
    averageMs: 30000,
    spotlightMaxWaitMs: 30000,
  });
  const directory = path.join(root, 'window-start-attempts');
  fs.mkdirSync(directory, { recursive: true });
  json(path.join(directory, attempt + '.json'), { ...quiet, formalSamples: 0 });
  if (quiet.approved) break;
}
json(path.join(root, 'quiet-window.json'), quiet);
fs.writeFileSync(
  path.join(root, 'formal-start.json'),
  JSON.stringify({
    startedAt: new Date().toISOString(),
    quietSince: quiet.quietSince,
  }) + '\n',
  { flag: 'wx' },
);
console.log('IV_5_WINDOW_START');
const dist = path.join(packageDir, 'dist/index.mjs');
const backup = fs.readFileSync(dist);
let completed = false,
  invalid = false;
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
  completed = true;
} finally {
  fs.writeFileSync(dist, backup);
  assert.deepEqual(fs.readFileSync(dist), backup);
  json(path.join(root, 'window-end.json'), {
    endedAt: new Date().toISOString(),
    completed,
    invalid,
    processes: compactProcessRows(await sampleProcessCpu(3000)),
  });
  verifyInputs(root);
}
console.log('IV_5_WINDOW_END completed=' + completed + ' invalid=' + invalid);
if (invalid) process.exitCode = 2;
