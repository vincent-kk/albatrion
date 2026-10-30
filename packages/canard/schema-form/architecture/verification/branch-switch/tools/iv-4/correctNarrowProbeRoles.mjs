// Restore the pre-recorded S6b wide protection role; original evidence is never changed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { gunzipSync, gzipSync } from 'node:zlib';

import { digest, json } from '../b9-0/files.mjs';
import { summarizeProbe } from './helpers/summarizeProbe.mjs';

const raw = new URL('../../raw/iv-4/', import.meta.url);
const source = new URL('S6b-narrow/', raw);
const output = new URL('S6b-narrow-role-corrected/', raw);
assert.ok(!fs.existsSync(output));
const originalBytes = fs.readFileSync(new URL('probe.json.gz', source));
const original = JSON.parse(gunzipSync(originalBytes).toString());
assert.deepEqual(original.targets, [
  'switch-oneOf-80',
  'switch-payload-12',
  'switch-siblings-4000',
]);
const targets = ['switch-oneOf-80', 'switch-payload-12'];
const corrected = {
  ...summarizeProbe(original.records, targets),
  execution: original.execution,
  inputs: original.inputs,
  records: original.records,
};
assert.deepEqual(
  corrected.rows.map((row) => row.id),
  original.rows.map((row) => row.id),
);
for (const [index, row] of corrected.rows.entries())
  for (const field of ['id', 'values', 'A', 'B', 'noise', 'delta'])
    assert.deepEqual(row[field], original.rows[index][field]);
fs.mkdirSync(output);
for (const name of fs.readdirSync(source)) {
  const target =
    name === 'probe.json.gz'
      ? 'device-original-probe.json.gz'
      : name === 'probe-started.json.gz'
        ? 'device-original-started.json.gz'
        : name;
  fs.copyFileSync(new URL(name, source), new URL(target, output));
}
fs.writeFileSync(
  new URL('probe.json.gz', output),
  gzipSync(JSON.stringify(corrected, null, 2) + '\n'),
);
json(fileURLToPath(new URL('role-correction.json', output)), {
  authorityCommit: '30b2d853f',
  authorityDocument: 'architecture/verification/branch-switch/iv-4-results.md',
  originalProbe: 'S6b-narrow/probe.json.gz',
  originalDigest: digest(fileURLToPath(new URL('probe.json.gz', source))),
  correctedDigest: digest(fileURLToPath(new URL('probe.json.gz', output))),
  role: { id: 'switch-siblings-4000', from: 'target', to: 'protected' },
  samplesChanged: false,
  timingProtocolChanged: false,
  rowOrderChanged: false,
  execution: digest(fileURLToPath(import.meta.url)),
});
console.log('IV_4_NARROW_ROLES_CORRECTED ' + corrected.kept);
