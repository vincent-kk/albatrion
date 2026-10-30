// Postprocessing only: no benchmark worker is ever started from this CLI.
import assert from 'node:assert/strict';
import path from 'node:path';

import { buildAlternatingRows } from '../../../design-optimization/tools/helpers/buildAlternatingRows.mjs';
import { summarizeAlternating } from '../../../design-optimization/tools/helpers/summarizeAlternating.mjs';
import { json, read } from '../b9-0/files.mjs';
import { portableEvidence } from '../b9-1/helpers/portableEvidence.mjs';
import { summarizeMilestone } from '../iv-0/report/summarizeMilestone.mjs';
import { verifyInputs } from '../iv-0/verifyInputs.mjs';
import { saveRawEvidence } from './saveRawEvidence.mjs';

const root = path.resolve(process.argv[2]),
  output = path.resolve(process.argv[3]);
const inputs = verifyInputs(root);
assert.equal(read(path.join(root, 'window-end.json')).completed, true);
const alternate = read(path.join(root, 'pair/results.json'));
const fixtures = buildAlternatingRows(true);
const recomputed = summarizeAlternating(fixtures, alternate.results, 'legacy');
assert.deepEqual(recomputed.rows, alternate.rows);
assert.deepEqual(recomputed.quality, alternate.quality);
const heaps = {};
for (const runtime of ['node', 'bun']) {
  heaps[runtime] = {};
  for (const lane of ['A', 'B'])
    heaps[runtime][lane] = read(
      path.join(root, 'heap-' + runtime + '-' + lane + '.log'),
    );
}
const summary = {
  inputs,
  window: {
    start: read(path.join(root, 'formal-start.json')),
    end: read(path.join(root, 'window-end.json')),
  },
  quality: recomputed.quality,
  milestone: summarizeMilestone(alternate, fixtures),
  heaps,
};
saveRawEvidence(root, output, {
  inputs,
  alternate,
  heaps,
  pilot: Object.fromEntries(
    ['A', 'B'].map((role) => [
      role,
      read(path.join(root, 'pilot-' + role + '.noindex/pilot.json')),
    ]),
  ),
  pilotSummary: read(path.join(root, 'pilot-summary.json')),
  loadCheck: read(path.join(root, 'load-check.json')),
  rehearsal: read(path.join(root, 'rehearsal.json')),
});
json(path.join(output, 'summary.json'), portableEvidence(summary));
console.log('IV_5_SUMMARY_OK rows=22 processes=440 heaps=4');
