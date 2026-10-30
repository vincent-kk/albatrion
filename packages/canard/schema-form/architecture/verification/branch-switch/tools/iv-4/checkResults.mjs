// Verify stored evidence only; this command never builds, samples or retries anything.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import { gunzipSync } from 'node:zlib';

import { attributeNativeAllocations } from './helpers/attributeNativeAllocations.mjs';
import { summarizeAllocations } from './helpers/summarizeAllocations.mjs';
import { summarizeProbe } from './helpers/summarizeProbe.mjs';
import { verifyStoredWindow } from './helpers/verifyStoredWindow.mjs';

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
  const assigned = read('S9/native-attribution.json');
  assert.deepEqual(
    assigned.rows,
    attributeNativeAllocations(record.profile, 20000, 'prepared/A/engine.mjs')
      .rows,
  );
  const original = gunzipSync(
    fs.readFileSync(new URL('S9/allocation.json.gz', raw)),
  );
  assert.equal(
    createHash('sha256').update(original).digest('hex'),
    assigned.inputSha256,
  );
  const supplemental = compressed('S9-gc/diagnostic-A-gc.json.gz');
  assert.equal(supplemental.record.mode, 'gc');
  assert.equal(supplemental.record.operations, 20000);
  assert.equal(supplemental.record.warmups, 2000);
  assert.equal(
    Object.values(supplemental.record.gc.counts).reduce(
      (sum, count) => sum + count,
      0,
    ),
    supplemental.record.gc.events.length,
  );
  assert.ok(
    supplemental.record.gc.events.every(
      (event) =>
        event.startMs >= supplemental.record.startMs &&
        event.startMs < supplemental.record.endMs,
    ),
  );
  console.log('IV_4_ALLOCATION_OK');
} else if (mode === '--candidates') {
  const ledger = read('candidates.json');
  for (const id of [
    'S1a',
    'S1b',
    'S2a',
    'S2b',
    'S3a',
    'S3b',
    'S4',
    'S5-1',
    'S5-2',
    'S6a',
    'S6b',
    'S7',
    'S8a',
    'S8b',
    'S9',
    'S10',
    'S11a',
    'S11b',
  ])
    assert.ok(
      ledger.some((row) => row.id === id),
      'Missing candidate: ' + id,
    );
  assert.ok(
    ledger.every((row) => row.verdict !== 'held' && row.held !== true),
    'Unresolved held candidate',
  );
  assert.equal(new Set(ledger.map((row) => row.id)).size, ledger.length);
  for (const candidate of ledger) {
    assert.ok(
      candidate.reason &&
        ['kept', 'dropped', 'excluded', 'held'].indexOf(candidate.verdict) !==
          -1,
    );
    if (!candidate.probe) assert.equal(candidate.verdict, 'excluded');
    else {
      const probes = [
        {
          file: candidate.probe,
          verdict: candidate.verdict,
          heap: candidate.heap,
        },
      ];
      if (candidate.phase2Probe)
        probes.push({
          file: candidate.phase2Probe,
          verdict: candidate.phase2Verdict,
          heap: undefined,
        });
      if (candidate.narrowing)
        probes.push({
          file: candidate.narrowing.probe,
          verdict: candidate.narrowing.verdict,
          heap: candidate.narrowing.heap,
        });
      for (const probe of probes) {
        const { records, inputs, execution, ...summary } = compressed(
          probe.file,
        );
        assert.deepEqual(
          summary,
          summarizeProbe(records, summary.targets, summary.repetitions ?? 3),
        );
        let passed = summary.kept;
        if (probe.heap) {
          const heap = read(probe.heap);
          const directory = probe.heap.slice(
            0,
            probe.heap.lastIndexOf('/') + 1,
          );
          const A = read(directory + 'stage-A.json').new;
          const B = read(directory + 'narrow.json').new;
          assert.equal(A.samples.length, 7);
          assert.equal(B.samples.length, 7);
          const Amax = Math.max(...A.samples);
          const Bmedian = [...B.samples].sort((left, right) => left - right)[3];
          assert.deepEqual(heap, { Amax, Bmedian, passed: Bmedian <= Amax });
          passed = passed && heap.passed;
        }
        assert.equal(probe.verdict === 'kept', passed);
        for (const lane of ['A', 'B']) {
          const file = probe.file.replace(
            'probe.json.gz',
            'inputs-' + lane + '.json.gz',
          );
          const bytes = gunzipSync(fs.readFileSync(new URL(file, raw)));
          assert.equal(
            createHash('sha256').update(bytes).digest('hex'),
            inputs[lane].sha256,
          );
        }
      }
    }
  }
  console.log('IV_4_CANDIDATES_OK');
} else if (mode === '--final') {
  const final = read('final.json');
  assert.match(final.windowDirectory, /^window-\d+$/);
  const storedWindow = verifyStoredWindow(
    new URL(final.windowDirectory + '/', raw),
  );
  assert.equal(final.productHead, storedWindow.productHead);
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
