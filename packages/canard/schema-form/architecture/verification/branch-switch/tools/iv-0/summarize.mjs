// Postprocessing only: no benchmark worker is ever started from this CLI.
import assert from 'node:assert/strict';
import path from 'node:path';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { ledgerNames } from '../b9-0/buildStages.mjs';
import { json, read } from '../b9-0/files.mjs';
import { portableEvidence } from '../b9-1/helpers/portableEvidence.mjs';
import { summarizeStageRows } from '../b9-1/helpers/summarizeStageRows.mjs';
import { saveRawEvidence } from './report/saveRawEvidence.mjs';
import { summarizeDiagnostics } from './report/summarizeDiagnostics.mjs';
import { summarizeMilestone } from './report/summarizeMilestone.mjs';
import { summarizeTimings } from './report/summarizeTimings.mjs';
import { verifyInputs } from './verifyInputs.mjs';

const root = path.resolve(process.argv[2]),
  output = path.resolve(process.argv[3]);
const inputs = verifyInputs(root);
assert.equal(read(path.join(root, 'window-end.json')).completed, true);
const alternate = read(path.join(root, 'pair/results.json'));
const fixtures = buildAlternatingRows(true);
const recomputed = summarizeAlternating(fixtures, alternate.results, 'legacy');
assert.deepEqual(recomputed.rows, alternate.rows);
assert.deepEqual(recomputed.quality, alternate.quality);
const stages = [],
  details = [],
  heaps = {};
for (const row of [
  'switch-oneOf-80',
  'switch-payload-12',
  'switch-siblings-0',
  'switch-siblings-1000',
])
  for (let repeat = 0; repeat < 3; repeat++)
    for (const lane of ['A', 'B'])
      stages.push({
        lane,
        ...read(
          path.join(root, 'stage-' + row + '-' + lane + '-' + repeat + '.log'),
        ),
      });
for (const row of ['switch-siblings-0', 'switch-oneOf-80'])
  for (const variant of ['noop', 'leaf', 'switch'])
    for (let repeat = 0; repeat < 3; repeat++)
      details.push(
        read(
          path.join(
            root,
            'details-' + row + '-' + variant + '-' + repeat + '.log',
          ),
        ),
      );
for (const runtime of ['node', 'bun']) {
  heaps[runtime] = {};
  for (const lane of ['A', 'B'])
    heaps[runtime][lane] = read(
      path.join(root, 'heap-' + runtime + '-' + lane + '.log'),
    );
}
const rowDiagnostics = read(path.join(root, 'row-diagnostics.json'));
const deliveryDiagnostics = read(path.join(root, 'delivery-diagnostics.json'));
const delivery = read(path.join(root, 'delivery/summary.json'));
const summary = {
  inputs,
  window: {
    start: read(path.join(root, 'formal-start.json')),
    end: read(path.join(root, 'window-end.json')),
  },
  quality: recomputed.quality,
  milestone: summarizeMilestone(alternate, fixtures),
  stages: summarizeStageRows(
    {
      A: stages.filter((record) => record.lane === 'A'),
      B: stages.filter((record) => record.lane === 'B'),
    },
    [
      'switch-oneOf-80',
      'switch-payload-12',
      'switch-siblings-0',
      'switch-siblings-1000',
    ],
    [...ledgerNames, 'everythingElse'],
    'ledger',
  ),
  rows: summarizeDiagnostics(
    rowDiagnostics,
    fixtures.map((row) => row.id),
  ),
  corpus: summarizeDiagnostics(
    deliveryDiagnostics,
    delivery.rows.map((row) => row.id),
  ),
  delivery: {
    scenes: delivery.rows.length,
    phases: delivery.phases,
    differences: delivery.differences,
    extensionScenes: delivery.extensionScenes.length,
    extensionPhases: delivery.extensionPhases,
  },
  timings: summarizeTimings(details),
  heaps,
};
assert.equal(summary.corpus.length, 79);
assert.ok(summary.corpus.every((scene) => scene.writes > 0));
saveRawEvidence(root, output, {
  inputs,
  alternate,
  stages,
  details,
  rowDiagnostics,
  deliveryDiagnostics,
  delivery,
  heaps,
  pilot: read(path.join(root, 'pilot.noindex/pilot.json')),
  loadCheck: read(path.join(root, 'load-check.json')),
  rehearsal: read(path.join(root, 'rehearsal.json')),
  detailRehearsal: read(path.join(root, 'details-rehearsal.json')),
  diagnosticManifest: read(path.join(root, 'diagnostics/manifest.json')),
});
json(path.join(output, 'summary.json'), portableEvidence(summary));
console.log('IV_0_SUMMARY_OK rows=22 scenes=79 details=18');
