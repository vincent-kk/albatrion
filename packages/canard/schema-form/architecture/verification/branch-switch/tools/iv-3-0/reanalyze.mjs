// Post-hoc regeneration only: immutable observation hashes and current interpretation-tool hashes have separate ledgers.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { attributeSamples } from './helpers/attributeSamples.mjs';
import { collectStackTimes } from './helpers/collectStackTimes.mjs';
import { deriveInterpretation } from './helpers/deriveInterpretation.mjs';
import { hashInputs } from './helpers/hashInputs.mjs';
import { readSnapshotBytes } from './helpers/readSnapshotBytes.mjs';
import { readSnapshotSet } from './helpers/readSnapshotSet.mjs';
import { renderReport } from './helpers/renderReport.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(here, '../../../../../../../..');
const root = path.resolve(here, '../../raw/iv-3-0');
const inputs = JSON.parse(
  fs.readFileSync(path.join(root, 'inputs.json'), 'utf8'),
);
const outcome = JSON.parse(
  fs.readFileSync(path.join(root, 'outcome.json'), 'utf8'),
);
const mapping = JSON.parse(
  fs.readFileSync(path.join(here, 'branches.json'), 'utf8'),
);
const bundle =
  fs.readFileSync(
    path.resolve(here, '../../../../../dist/index.node.mjs'),
    'utf8',
  ) + '\nexport { buildFieldNodeTree, mountFieldNode };\n';
const prefix =
  'packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/';
const current = hashInputs(repoDir);
const measurementSnapshot = readSnapshotSet(root, 'measurement-tools.json');
const observationSnapshot = readSnapshotSet(root, 'original-observations.json');
assert.equal(measurementSnapshot.sourceCommit, inputs.head);
for (const [relative, digest] of Object.entries(inputs.hashes)) {
  const observedBytes = relative.startsWith(prefix)
    ? readSnapshotBytes(measurementSnapshot, relative)
    : fs.readFileSync(path.join(repoDir, relative));
  assert.equal(
    createHash('sha256').update(observedBytes).digest('hex'),
    digest,
    'Preserved measurement input: ' + relative,
  );
}
assert.equal(
  createHash('sha256').update(bundle).digest('hex'),
  inputs.engineSha256,
);
const tables = [],
  stackTimes = {},
  artifacts = {};
for (const record of outcome.results) {
  const directory = path.join(root, record.row + '-' + record.interval);
  const profile = JSON.parse(
    gunzipSync(
      fs.readFileSync(path.join(directory, 'cpu.cpuprofile.gz')),
    ).toString(),
  );
  const wall = JSON.parse(
    fs.readFileSync(path.join(directory, 'wall.json'), 'utf8'),
  );
  const plainWall = JSON.parse(
    fs.readFileSync(path.join(root, record.row + '-plain/wall.json'), 'utf8'),
  );
  const table = attributeSamples(profile, wall, mapping, bundle, plainWall);
  tables.push(table);
  stackTimes[record.row] = collectStackTimes(profile, wall, mapping, bundle);
  fs.writeFileSync(
    path.join(directory, 'tables.json'),
    JSON.stringify(table, null, 2) + '\n',
  );
}
for (const directory of fs.readdirSync(root)) {
  const absolute = path.join(root, directory);
  if (
    !fs.statSync(absolute).isDirectory() ||
    ['fca', 'snapshots'].includes(directory)
  )
    continue;
  for (const file of fs
    .readdirSync(absolute)
    .filter((name) => name !== 'tables.json'))
    artifacts[directory + '/' + file] = createHash('sha256')
      .update(fs.readFileSync(path.join(absolute, file)))
      .digest('hex');
}
for (const file of [
  'inputs.json',
  'outcome.json',
  'started.json',
  'smoke.json',
  'rehearsal.json',
])
  artifacts[file] = createHash('sha256')
    .update(fs.readFileSync(path.join(root, file)))
    .digest('hex');
for (const [relative, digest] of Object.entries(artifacts)) {
  const original = readSnapshotBytes(observationSnapshot, relative);
  assert.equal(
    createHash('sha256').update(original).digest('hex'),
    digest,
    'Original observation bytes: ' + relative,
  );
}
const baselines = {
  window:
    'packages/canard/schema-form/architecture/verification/branch-switch/raw/micro-hygiene/candidate-2-window/pair-samples.json.gz',
  iv2: 'packages/canard/schema-form/architecture/verification/branch-switch/raw/iv-2/candidate-1/pair-samples.json.gz',
};
const windowRaw = JSON.parse(
  gunzipSync(fs.readFileSync(path.join(repoDir, baselines.window))).toString(),
);
const iv2Raw = JSON.parse(
  gunzipSync(fs.readFileSync(path.join(repoDir, baselines.iv2))).toString(),
);
const interpretation = deriveInterpretation(
  tables,
  stackTimes,
  windowRaw,
  iv2Raw,
);
const fcaFile = path.join(root, 'fca/summary.json');
interpretation.filid = fs.existsSync(fcaFile)
  ? JSON.parse(fs.readFileSync(fcaFile, 'utf8'))
  : null;
fs.writeFileSync(
  path.join(root, 'interpretation.json'),
  JSON.stringify(interpretation, null, 2) + '\n',
);
const ledger = {
  method:
    'Post-hoc remapping; original measurement inputs and profile/wall bytes unchanged; no rerun',
  measurementHead: inputs.head,
  originalResultHead: observationSnapshot.sourceCommit,
  coordinatorDecision:
    'Results candidate-1 review decisions (2026-10-30); post-hoc ledger approved',
  snapshotInputs: Object.fromEntries(
    [
      'measurement-tools.json',
      'original-observations.json',
      'manifest.json',
    ].map((name) => [
      'snapshots/' + name,
      createHash('sha256')
        .update(fs.readFileSync(path.join(root, 'snapshots', name)))
        .digest('hex'),
    ]),
  ),
  measurementArtifacts: artifacts,
  interpretationTools: Object.fromEntries(
    Object.entries(current).filter(([relative]) => relative.startsWith(prefix)),
  ),
  baselineInputs: Object.fromEntries(
    Object.values(baselines).map((relative) => [
      relative,
      createHash('sha256')
        .update(fs.readFileSync(path.join(repoDir, relative)))
        .digest('hex'),
    ]),
  ),
};
fs.writeFileSync(
  path.join(root, 'reanalysis.json'),
  JSON.stringify(ledger, null, 2) + '\n',
);
fs.writeFileSync(
  path.resolve(here, '../../iv-3-0-results.md'),
  renderReport(inputs, outcome, tables, interpretation),
);
console.log(
  'IV_3_0_REANALYZED ' +
    JSON.stringify({
      b: tables.find((table) => table.row === 'switch-siblings-0').decisions.B,
      interpretation,
    }),
);
