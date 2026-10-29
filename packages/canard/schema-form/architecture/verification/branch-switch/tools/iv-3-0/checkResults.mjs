// Recomputes every archived table from the portable raw profile and the exact hashed product build.
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
const root = path.resolve(here, '../../raw/iv-3-0');
const repoDir = path.resolve(here, '../../../../../../../..');
const ledgerFile = path.join(root, 'reanalysis.json');
const ledger = fs.existsSync(ledgerFile)
  ? JSON.parse(fs.readFileSync(ledgerFile, 'utf8'))
  : null;
const measurementSnapshot = ledger
  ? readSnapshotSet(root, 'measurement-tools.json')
  : null;
const observationSnapshot = ledger
  ? readSnapshotSet(root, 'original-observations.json')
  : null;
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
assert.equal(
  createHash('sha256').update(bundle).digest('hex'),
  inputs.engineSha256,
);
const tables = [];
const stackTimes = {};
for (const name of fs.readdirSync(root).sort()) {
  const directory = path.join(root, name);
  if (!fs.statSync(directory).isDirectory()) continue;
  for (const file of fs.readdirSync(directory)) {
    const bytes = fs.readFileSync(path.join(directory, file));
    const content = file.endsWith('.gz')
      ? gunzipSync(bytes).toString()
      : bytes.toString();
    assert.doesNotMatch(
      content,
      /\/Users\/|\/private\/tmp\/|file:\/\/\//,
      name + '/' + file,
    );
  }
  if (!fs.existsSync(path.join(directory, 'tables.json'))) continue;
  const table = JSON.parse(
    fs.readFileSync(path.join(directory, 'tables.json'), 'utf8'),
  );
  const profile = JSON.parse(
    gunzipSync(
      fs.readFileSync(path.join(directory, 'cpu.cpuprofile.gz')),
    ).toString(),
  );
  const wall = JSON.parse(
    fs.readFileSync(path.join(directory, 'wall.json'), 'utf8'),
  );
  const plainWall = JSON.parse(
    fs.readFileSync(path.join(root, wall.row + '-plain/wall.json'), 'utf8'),
  );
  assert.deepEqual(
    attributeSamples(profile, wall, mapping, bundle, plainWall),
    table,
  );
  tables.push(table);
  stackTimes[wall.row] = collectStackTimes(profile, wall, mapping, bundle);
}
tables.sort(
  (a, b) =>
    outcome.results.findIndex(
      (entry) => entry.row === a.row && entry.interval === a.intervalUs,
    ) -
    outcome.results.findIndex(
      (entry) => entry.row === b.row && entry.interval === b.intervalUs,
    ),
);
for (const [relative, hash] of Object.entries(inputs.hashes)) {
  const file = path.resolve(here, '../../../../../../../..', relative);
  const reinterpretedTool =
    ledger &&
    relative.startsWith(
      'packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/',
    );
  const bytes = reinterpretedTool
    ? readSnapshotBytes(measurementSnapshot, relative)
    : fs.readFileSync(file);
  assert.equal(
    createHash('sha256').update(bytes).digest('hex'),
    hash,
    relative,
  );
}
let interpretation;
if (ledger) {
  assert.deepEqual(
    Object.fromEntries(
      Object.entries(hashInputs(repoDir)).filter(([relative]) =>
        relative.startsWith(
          'packages/canard/schema-form/architecture/verification/branch-switch/tools/iv-3-0/',
        ),
      ),
    ),
    ledger.interpretationTools,
  );
  for (const [relative, digest] of Object.entries(
    ledger.measurementArtifacts,
  )) {
    assert.equal(
      createHash('sha256')
        .update(fs.readFileSync(path.join(root, relative)))
        .digest('hex'),
      digest,
    );
    const original = readSnapshotBytes(observationSnapshot, relative);
    assert.equal(createHash('sha256').update(original).digest('hex'), digest);
  }
  assert.equal(measurementSnapshot.sourceCommit, inputs.head);
  assert.equal(observationSnapshot.sourceCommit, ledger.originalResultHead);
  for (const [relative, digest] of Object.entries(ledger.snapshotInputs))
    assert.equal(
      createHash('sha256')
        .update(fs.readFileSync(path.join(root, relative)))
        .digest('hex'),
      digest,
    );
  for (const [relative, digest] of Object.entries(ledger.baselineInputs))
    assert.equal(
      createHash('sha256')
        .update(fs.readFileSync(path.join(repoDir, relative)))
        .digest('hex'),
      digest,
    );
  const windowRaw = JSON.parse(
    gunzipSync(
      fs.readFileSync(
        path.resolve(
          here,
          '../../raw/micro-hygiene/candidate-2-window/pair-samples.json.gz',
        ),
      ),
    ).toString(),
  );
  const iv2Raw = JSON.parse(
    gunzipSync(
      fs.readFileSync(
        path.resolve(here, '../../raw/iv-2/candidate-1/pair-samples.json.gz'),
      ),
    ).toString(),
  );
  interpretation = deriveInterpretation(tables, stackTimes, windowRaw, iv2Raw);
  const fcaFile = path.join(root, 'fca/summary.json');
  interpretation.filid = fs.existsSync(fcaFile)
    ? JSON.parse(fs.readFileSync(fcaFile, 'utf8'))
    : null;
  assert.deepEqual(
    interpretation,
    JSON.parse(fs.readFileSync(path.join(root, 'interpretation.json'), 'utf8')),
  );
  assert.ok(
    Math.abs(
      tables.find((table) => table.row === 'switch-siblings-0').decisions.B -
        4.12505,
    ) < 1e-8,
  );
}
assert.equal(
  fs.readFileSync(path.resolve(here, '../../iv-3-0-results.md'), 'utf8'),
  renderReport(inputs, outcome, tables, interpretation),
);
assert.ok(
  outcome.completed
    ? ['switch-oneOf-80', 'switch-siblings-0', 'single-flat-1000'].every(
        (row) =>
          outcome.results.filter((result) => result.row === row).at(-1)
            ?.reconciled,
      )
    : Boolean(outcome.failure),
);
console.log(
  'IV_3_0_RESULTS_OK ' +
    JSON.stringify(
      tables.map((table) => ({
        row: table.row,
        ratio: table.reconciliationRatio,
        decisions: table.decisions,
        top5: table.top40.slice(0, 5),
      })),
    ),
);
