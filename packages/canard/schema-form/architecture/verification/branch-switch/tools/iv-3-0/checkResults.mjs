// Recomputes every archived table from the portable raw profile and the exact hashed product build.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';

import { attributeSamples } from './helpers/attributeSamples.mjs';
import { renderReport } from './helpers/renderReport.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
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
assert.equal(
  createHash('sha256').update(bundle).digest('hex'),
  inputs.engineSha256,
);
const tables = [];
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
  assert.deepEqual(attributeSamples(profile, wall, mapping, bundle), table);
  tables.push(table);
}
for (const [relative, hash] of Object.entries(inputs.hashes)) {
  const file = path.resolve(here, '../../../../../../../..', relative);
  assert.equal(
    createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    hash,
    relative,
  );
}
assert.equal(
  fs.readFileSync(path.resolve(here, '../../iv-3-0-results.md'), 'utf8'),
  renderReport(inputs, outcome, tables),
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
