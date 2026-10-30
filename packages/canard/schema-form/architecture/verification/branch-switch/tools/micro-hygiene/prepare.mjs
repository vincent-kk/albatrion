// Reuse immutable B9-1 public/stage inputs; IV-2 allocation hypotheses are excluded.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '../../../../..');
const root = process.argv.find((arg) => arg.startsWith('--root='))?.slice(7);
assert.ok(root?.endsWith('.noindex'));
execFileSync(
  process.execPath,
  [path.join(here, '../b9-1/prepare.mjs'), ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
inputs.microHygiene = {
  regressionsAllowed: 0,
  exchangeMaximumUs: 0,
  improvementRequired: false,
  shortWindow: {
    processesPerLane: 4,
    baselineHalfProcesses: 2,
    warmups: 20,
    samples: 100,
    pilot: false,
    stages: false,
    retention: false,
  },
  stageReductions:
    'reported with unchanged IV-1 judgeStage; not a hygiene adoption condition',
  excluded: [
    'IV-2 allocation diagnostics',
    'exit-only self attribution',
    'cold lazy-scope cost',
    'wide-bucket allocation history',
  ],
};
for (const file of fs.readdirSync(here).filter((name) => name.endsWith('.mjs')))
  inputs.tools[
    'architecture/verification/branch-switch/tools/micro-hygiene/' + file
  ] = digest(path.join(here, file));
for (const file of fs
  .readdirSync(path.join(here, 'helpers'))
  .filter((name) => name.endsWith('.mjs')))
  inputs.tools[
    'architecture/verification/branch-switch/tools/micro-hygiene/helpers/' +
      file
  ] = digest(path.join(here, 'helpers', file));
for (const name of ['summarize.mjs', 'weightedExchange.mjs', 'judgeStage.mjs'])
  inputs.tools['architecture/verification/branch-switch/tools/iv-1/' + name] =
    digest(path.join(here, '../iv-1', name));
for (const name of ['worker.mjs', 'rows.mjs'])
  inputs.tools['architecture/verification/branch-switch/tools/iv-2/' + name] =
    digest(path.join(here, '../iv-2', name));
inputs.tools[
  'architecture/verification/branch-switch/tools/window/eventWeights.json'
] = digest(path.join(here, '../window/eventWeights.json'));
assert.equal(inputs.environment.node, process.version);
assert.equal(inputs.microHygiene.regressionsAllowed, 0);
json(path.join(root, 'inputs.json'), inputs);
assert.ok(fs.existsSync(path.join(packageDir, 'dist/index.node.mjs')));
console.log('MICRO_HYGIENE_PREPARED');
