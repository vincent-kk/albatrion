// Verify stored evidence only; this command never builds, samples or retries anything.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

import { summarizeAllocations } from './helpers/summarizeAllocations.mjs';
import { summarizeProbe } from './helpers/summarizeProbe.mjs';

const raw = new URL('../../raw/iv-4/', import.meta.url);
const read = (name) => JSON.parse(fs.readFileSync(new URL(name, raw), 'utf8'));
const compressed = (name) =>
  JSON.parse(gunzipSync(fs.readFileSync(new URL(name, raw))).toString());
const mode = process.argv[2];
if (mode === '--allocation') {
  const { record, inputs } = compressed('S9/allocation.json.gz');
  const bytes = gunzipSync(
    fs.readFileSync(new URL('S9/inputs-A.json.gz', raw)),
  );
  assert.equal(createHash('sha256').update(bytes).digest('hex'), inputs.sha256);
  assert.equal(record.sampling.includeObjectsCollectedByMajorGC, true);
  assert.equal(record.sampling.includeObjectsCollectedByMinorGC, true);
  assert.equal(record.switches, 20000);
  assert.equal(record.warmups, 2000);
  assert.equal(record.writesPerOperation, 2);
  assert.deepEqual(
    record.allocations,
    summarizeAllocations(record.profile, 20000),
  );
  assert.ok(record.allocations.totalBytes > 0);
  assert.equal(record.collector, true);
  console.log('IV_4_ALLOCATION_OK');
} else if (mode === '--candidates') {
  const ledger = read('candidates.json');
  assert.ok(ledger.length > 0);
  assert.equal(new Set(ledger.map((row) => row.id)).size, ledger.length);
  for (const candidate of ledger) {
    assert.ok(
      candidate.reason &&
        ['kept', 'dropped', 'excluded'].indexOf(candidate.verdict) !== -1,
    );
    if (candidate.probe) {
      const { records, inputs, ...summary } = compressed(candidate.probe);
      assert.deepEqual(summary, summarizeProbe(records, summary.targets));
      assert.equal(candidate.verdict === 'kept', summary.kept);
      for (const lane of ['A', 'B']) {
        const file = candidate.probe.replace(
          'probe.json.gz',
          'inputs-' + lane + '.json.gz',
        );
        const bytes = gunzipSync(fs.readFileSync(new URL(file, raw)));
        assert.equal(
          createHash('sha256').update(bytes).digest('hex'),
          inputs[lane].sha256,
        );
      }
    } else assert.equal(candidate.verdict, 'excluded');
  }
  console.log('IV_4_CANDIDATES_OK');
} else if (mode === '--final') {
  const final = read('final.json');
  assert.equal(final.productHead, final.window.productHead);
  assert.ok(
    final.staticChecks.length >= 10 &&
      final.staticChecks.every((entry) => entry.code === 0),
  );
  assert.deepEqual(final.deliveryDifferences, [0, 0]);
  assert.equal(final.publicDeclarationChanged, false);
  assert.ok(final.fcaFindings <= 202);
  assert.ok(
    final.window.exchange < 0 &&
      final.window.regressions === 0 &&
      final.window.test073 === 0,
  );
  assert.ok(final.window.heaps.every((heap) => heap.Bmedian <= heap.Amax));
  console.log('IV_4_FINAL_OK');
} else throw new Error('Choose --allocation, --candidates or --final');
