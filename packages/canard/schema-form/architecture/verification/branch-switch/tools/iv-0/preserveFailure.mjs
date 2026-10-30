// Preserve a failed window as environment evidence; this CLI never resumes a measurement.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { json, read } from '../b9-0/files.mjs';
import { compactQuietCheck } from '../b9-1/helpers/compactQuietCheck.mjs';
import { portableEvidence } from '../b9-1/helpers/portableEvidence.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]),
  output = path.resolve(process.argv[3]);
const inputs = verifyInputs(root, false);
const end = read(path.join(root, 'window-end.json'));
assert.equal(end.completed, false);
const processFiles = fs
  .readdirSync(path.join(root, 'pair'))
  .filter((name) => name.endsWith('.stdout'));
const successful = processFiles.flatMap((name) => {
  const text = fs.readFileSync(path.join(root, 'pair', name), 'utf8').trim();
  return text ? [JSON.parse(text)] : [];
});
const cpu = fs
  .readdirSync(path.join(root, 'cpu-prechecks'))
  .filter((name) => name.endsWith('.json'))
  .map((name) =>
    compactQuietCheck({
      name,
      ...read(path.join(root, 'cpu-prechecks', name)),
    }),
  );
for (const name of fs
  .readdirSync(root)
  .filter((name) => /^quiet(?:-.*)?\.json$/.test(name)))
  cpu.push(compactQuietCheck({ name, ...read(path.join(root, name)) }));
const failure = portableEvidence({
  classification: '458C-03 environment failure',
  partialProcesses: successful.length,
  partialCurrentSamples: successful.reduce(
    (sum, record) => sum + record.samples.current.length,
    0,
  ),
  partialLegacySamples: successful.reduce(
    (sum, record) => sum + record.samples.legacy.length,
    0,
  ),
  started: read(path.join(root, 'formal-start.json')),
  ended: end,
  productInputsUnchanged: true,
  node: inputs.node,
  toolVerification:
    'Historical tool hashes retained; current review edits are not the original timing inputs.',
  command: read(path.join(root, 'alternate.command.json')),
  error: fs.readFileSync(path.join(root, 'alternate.stderr.log'), 'utf8'),
});
fs.mkdirSync(output, { recursive: true });
json(path.join(output, 'failure.json'), failure);
fs.writeFileSync(
  path.join(output, 'cpu.json.gz'),
  gzipSync(JSON.stringify(portableEvidence(cpu)) + '\n'),
);
fs.writeFileSync(
  path.join(output, 'partial-samples.json.gz'),
  gzipSync(JSON.stringify(portableEvidence(successful)) + '\n'),
);
console.log(
  'IV_0_ENVIRONMENT_FAILURE_PRESERVED processes=' + successful.length,
);
