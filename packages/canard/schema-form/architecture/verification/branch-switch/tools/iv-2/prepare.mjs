// Reuse B9-1's immutable A/B preparation and extend its manifest before any smoke.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { digest, json } from '../b9-0/files.mjs';
import { buildDiagnostics } from '../iv-0/buildDiagnostics.mjs';
import { rows } from './rows.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const packageDir = path.resolve(here, '../../../../..');
const root = process.argv
  .slice(2)
  .find((arg) => arg.startsWith('--root='))
  ?.slice(7);
assert.ok(root);
execFileSync(
  process.execPath,
  [path.join(here, '../b9-1/prepare.mjs'), ...process.argv.slice(2)],
  { stdio: 'inherit' },
);
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
inputs.stages = rows.map((row) => row.id);
inputs.wideBucketHeap = {
  coordinator: 'msg_62de4b2d1f33',
  staticFields: 1000,
  literalBranches: 80,
  histories: [2, 80],
  samplesPerLaneAndRuntime: 7,
  runtimes: ['node', 'bun'],
  criterion: 'B median <= A maximum; heap-only, zero exchange contribution',
};
inputs.tools[
  'architecture/verification/branch-switch/tools/window/eventWeights.json'
] = digest(path.join(here, '../window/eventWeights.json'));
for (const file of fs
  .readdirSync(here)
  .filter((file) => file.endsWith('.mjs'))) {
  const name = 'architecture/verification/branch-switch/tools/iv-2/' + file;
  inputs.tools[name] = digest(path.join(here, file));
}
for (const file of [
  'judgeStage.mjs',
  'weightedExchange.mjs',
  'firstWriteExchange.mjs',
  'operation.mjs',
]) {
  const relative = 'architecture/verification/branch-switch/tools/iv-1/' + file;
  inputs.tools[relative] = digest(path.join(here, '../iv-1', file));
}
for (const file of fs
  .readdirSync(path.join(here, 'helpers'))
  .filter((name) => name.endsWith('.mjs')))
  inputs.tools[
    'architecture/verification/branch-switch/tools/iv-2/helpers/' + file
  ] = digest(path.join(here, 'helpers', file));
inputs.tools[
  'architecture/verification/design-optimization/tools/helpers/setupBranchOperation.mjs'
] = digest(
  path.join(
    here,
    '../../../design-optimization/tools/helpers/setupBranchOperation.mjs',
  ),
);
inputs.diagnostics = {};
for (const [lane, source] of [
  ['A', process.argv.find((arg) => arg.startsWith('--baseline=')).slice(11)],
  ['B', packageDir],
]) {
  fs.mkdirSync(path.join(root, 'diagnostics'), { recursive: true });
  inputs.diagnostics[lane] = await buildDiagnostics(
    source,
    path.join(root, 'diagnostics', lane),
  );
}
json(path.join(root, 'inputs.json'), inputs);
console.log('IV_2_PREPARED');
