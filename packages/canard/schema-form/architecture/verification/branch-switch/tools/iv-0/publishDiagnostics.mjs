// Clock-free publication can complete independently of a timing window.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { read } from '../b9-0/files.mjs';
import { portableEvidence } from '../b9-1/helpers/portableEvidence.mjs';
import { summarizeDiagnostics } from './report/summarizeDiagnostics.mjs';

const root = path.resolve(process.argv[2]),
  output = path.resolve(process.argv[3]);
const rows = read(path.join(root, 'row-diagnostics.json'));
const corpus = read(path.join(root, 'delivery-diagnostics.json'));
const delivery = read(path.join(root, 'delivery/summary.json'));
const summaries = {
  rows: summarizeDiagnostics(
    rows,
    buildAlternatingRows(true).map((row) => row.id),
  ),
  corpus: summarizeDiagnostics(
    corpus,
    delivery.rows.map((row) => row.id),
  ),
};
assert.equal(delivery.differences, 0);
assert.equal(summaries.corpus.length, 79);
const fields = {
  closures: [
    'label',
    'writes',
    'usefulWrites',
    'usefulFraction',
    'closedWrites',
    'closedFraction',
    'rootScopes',
    'scopes',
    'refusalReasons',
  ],
  rounds: [
    'label',
    'writes',
    'computeCalls',
    'rounds',
    'roundsPerWrite',
    'emptyRounds',
    'emptyOpeningRounds',
    'emptyTerminalRounds',
    'roundChanges',
  ],
  allocations: [
    'label',
    'writes',
    'contexts',
    'scratchNew',
    'scratchReused',
    'allocations',
  ],
};
fs.mkdirSync(output, { recursive: true });
for (const [kind, keys] of Object.entries(fields)) {
  const evidence = Object.fromEntries(
    Object.entries(summaries).map(([group, records]) => [
      group,
      records.map((record) =>
        Object.fromEntries(keys.map((key) => [key, record[key]])),
      ),
    ]),
  );
  const text =
    JSON.stringify(portableEvidence({ timed: false, ...evidence }), null, 2) +
    '\n';
  assert.ok(!/\/(?:Users|private\/tmp|var\/folders)\//.test(text));
  const target = path.join(output, kind + '.json');
  if (process.argv[4] === '--check')
    assert.equal(fs.readFileSync(target, 'utf8'), text);
  else fs.writeFileSync(target, text);
}
if (process.argv[4] !== '--check')
  fs.writeFileSync(
    path.join(output, 'diagnostics.json.gz'),
    gzipSync(
      JSON.stringify(portableEvidence({ rows, corpus, delivery })) + '\n',
    ),
  );
console.log('IV_0_DIAGNOSTICS_PUBLICATION_OK rows=22 scenes=79');
