// CLI recomputes every figure from complete process samples, then exports portable evidence.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

import {
  stageNames as baseStageNames,
  ledgerNames,
} from '../b6/buildStages.mjs';
import { digest, json, read, verifyInputs } from './files.mjs';
import { rows } from './rows.mjs';

const [rootText, outputText] = process.argv.slice(2);
const root = path.resolve(rootText),
  output = path.resolve(outputText);
const inputs = verifyInputs(root);
const raw = read(path.join(root, 'results.json'));
assert.equal(raw.completed, true);
assert.equal(raw.results.length, 180);
const pids = raw.results.map((record) => record.pid);
assert.equal(
  pids.filter((pid, index) => pids.indexOf(pid) === index).length,
  180,
);
const median = (values) => {
  const sorted = values.toSorted((a, b) => a - b),
    middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};
const stats = (values) => ({
  medianUs: median(values),
  minUs: Math.min(...values),
  maxUs: Math.max(...values),
  widthUs: Math.max(...values) - Math.min(...values),
  processMedians: values,
});
const summarizeMetrics = (records, key) => {
  const names = [
    ...new Set(
      records.flatMap((record) =>
        record[key].flatMap((sample) => Object.keys(sample)),
      ),
    ),
  ].sort();
  return Object.fromEntries(
    names.map((name) => [
      name,
      {
        self: stats(
          records.map((record) =>
            median(record[key].map((sample) => sample[name]?.selfUs ?? 0)),
          ),
        ),
        inclusive: stats(
          records.map((record) =>
            median(record[key].map((sample) => sample[name]?.inclusiveUs ?? 0)),
          ),
        ),
        calls: stats(
          records.map((record) =>
            median(record[key].map((sample) => sample[name]?.calls ?? 0)),
          ),
        ),
      },
    ]),
  );
};
const summary = {
  units: 'microseconds per single write',
  base: inputs.base,
  config: inputs.config,
  rows: {},
  quality: { mode: 'legacy' },
  slopes: {},
};
const qualityRatios = [];
for (const row of rows) {
  const byPass = {};
  for (const pass of ['ledger', 'supplemental', 'gap']) {
    const records = raw.results
      .filter((record) => record.row === row.id && record.pass === pass)
      .toSorted((a, b) => a.repeat - b.repeat);
    assert.equal(records.length, 10);
    assert.deepEqual(
      records.map((record) => record.repeat),
      Array.from({ length: 10 }, (_, i) => i),
    );
    const totals = {};
    for (const record of records) {
      assert.equal(record.node, inputs.node);
      assert.equal(record.warmups, 20);
      assert.equal(record.sampleCount, 100);
      for (const values of Object.values(record.samples)) {
        assert.equal(values.length, 100);
        assert.ok(values.every((value) => Number.isFinite(value) && value > 0));
      }
      assert.equal(record.stages.length, 100);
      for (let i = 0; i < 100; i++) {
        const mode = pass === 'ledger' ? 'wrapped' : pass;
        const sum = Object.values(record.stages[i]).reduce(
          (sum, metric) => sum + metric.selfUs,
          0,
        );
        assert.ok(
          Math.abs(sum - record.samples[mode][i]) < 0.01,
          'Exclusive ledger conserves row time',
        );
      }
    }
    for (const mode of Object.keys(records[0].samples)) {
      const values = records.map((record) => median(record.samples[mode]));
      totals[mode] = {
        ...stats(values),
        minimumUs: median(
          records.map((record) => Math.min(...record.samples[mode])),
        ),
      };
    }
    byPass[pass] = {
      totals,
      stages: summarizeMetrics(records, 'stages'),
      scoped: summarizeMetrics(records, 'scoped'),
    };
    const timed = pass === 'ledger' ? 'wrapped' : pass;
    const overheadUs = records.map(
      (record) =>
        median(record.samples[timed]) - median(record.samples.unwrapped),
    );
    const pairsPerWrite = records.map((record) =>
      median(
        record.stages.map((sample) =>
          Object.entries(sample)
            .filter(([name]) => name !== 'everythingElse')
            .reduce((sum, [, metric]) => sum + metric.calls, 0),
        ),
      ),
    );
    const perPairUs = overheadUs.map(
      (value, index) => value / pairsPerWrite[index],
    );
    byPass[pass].timerCost = {
      overheadUs: stats(overheadUs),
      pairsPerWrite: stats(pairsPerWrite),
      perPairUs: stats(perPairUs),
      note: 'average enter/exit cost from the paired same-process unwrapped lane; deeper stacks cost more under the scoped recorder',
    };
    for (const entries of [byPass[pass].stages, byPass[pass].scoped])
      for (const [name, entry] of Object.entries(entries)) {
        if (name === 'everythingElse') continue;
        entry.overheadEstimateUs =
          entry.calls.medianUs * byPass[pass].timerCost.perPairUs.medianUs;
        entry.selfNetUs = entry.self.medianUs - entry.overheadEstimateUs;
      }
    if (pass === 'supplemental')
      byPass[pass].ledgerEquivalent = Object.fromEntries(
        ['computeNode', 'finalizeExits'].map((owner) => [
          owner,
          stats(
            records.map((record) =>
              median(
                record.stages.map(
                  (sample, index) =>
                    (sample[owner]?.selfUs ?? 0) +
                    Object.entries(record.scoped[index])
                      .filter(
                        ([key]) =>
                          key.startsWith(owner + '/') &&
                          !ledgerNames.includes(key.slice(owner.length + 1)),
                      )
                      .reduce(
                        (sum, [key, metric]) =>
                          sum +
                          (baseStageNames.includes(key.slice(owner.length + 1))
                            ? metric.inclusiveUs
                            : metric.selfUs),
                        0,
                      ),
                ),
              ),
            ),
          ),
        ]),
      );
    if (pass === 'gap')
      byPass[pass].gap = Object.fromEntries(
        ['beforeSettlementUs', 'deliveryUs', 'subscriberWaveUs'].map((key) => [
          key,
          stats(
            records.map((record) => median(record.gaps.map((gap) => gap[key]))),
          ),
        ]),
      );
    if (pass === 'ledger') {
      const legacyMinima = records.map((record) =>
        Math.min(...record.samples.legacy),
      );
      const ratio =
        median(legacyMinima.slice(5)) / median(legacyMinima.slice(0, 5));
      qualityRatios.push(ratio);
      byPass[pass].legacyQuality = {
        first5: median(legacyMinima.slice(0, 5)),
        last5: median(legacyMinima.slice(5)),
        ratio,
      };
      // Paired process medians keep timer overhead separate from the dist/scratch difference.
      byPass[pass].overhead = {
        wrappedMinusUnwrapped: stats(
          records.map(
            (record) =>
              median(record.samples.wrapped) - median(record.samples.unwrapped),
          ),
        ),
        distMinusUnwrapped: stats(
          records.map(
            (record) =>
              median(record.samples.dist) - median(record.samples.unwrapped),
          ),
        ),
      };
    }
  }
  summary.rows[row.id] = byPass;
}
summary.quality.medianRatio = median(qualityRatios);
summary.quality.valid =
  summary.quality.medianRatio >= 0.95 && summary.quality.medianRatio <= 1.05;
const slope = (from, to, divisor) => {
  const result = { from, to, divisor, passes: {} };
  for (const pass of ['ledger', 'supplemental']) {
    const a = summary.rows[from][pass],
      b = summary.rows[to][pass];
    result.passes[pass] = {
      totals: Object.fromEntries(
        Object.keys(a.totals).map((mode) => [
          mode,
          (b.totals[mode].medianUs - a.totals[mode].medianUs) / divisor,
        ]),
      ),
      stages: Object.fromEntries(
        [...new Set([...Object.keys(a.stages), ...Object.keys(b.stages)])]
          .sort()
          .map((name) => [
            name,
            {
              selfNetUs:
                ((b.stages[name]?.selfNetUs ?? 0) -
                  (a.stages[name]?.selfNetUs ?? 0)) /
                divisor,
              selfUs:
                ((b.stages[name]?.self.medianUs ?? 0) -
                  (a.stages[name]?.self.medianUs ?? 0)) /
                divisor,
              inclusiveUs:
                ((b.stages[name]?.inclusive.medianUs ?? 0) -
                  (a.stages[name]?.inclusive.medianUs ?? 0)) /
                divisor,
            },
          ]),
      ),
    };
  }
  return result;
};
summary.slopes.general = slope(
  'switch-siblings-0',
  'switch-siblings-1000',
  1000,
);
summary.slopes.prepared250 = slope(
  'switch-oneOf-80',
  'switch-oneOf-80-siblings-250',
  250,
);
summary.slopes.prepared1000 = slope(
  'switch-oneOf-80',
  'switch-oneOf-80-siblings-1000',
  1000,
);
summary.slopes.prepared250to1000 = slope(
  'switch-oneOf-80-siblings-250',
  'switch-oneOf-80-siblings-1000',
  750,
);
summary.slopes.perLeaf = slope('switch-oneOf-80', 'switch-payload-12', 18);
summary.rowStageGap = {};
for (const row of rows) {
  const L = summary.rows[row.id].ledger,
    G = summary.rows[row.id].gap;
  const R = raw.results.filter(
    (record) => record.row === row.id && record.pass === 'ledger',
  );
  const pairedGapUs = stats(
    R.map(
      (record) => median(record.samples.dist) - median(record.samples.wrapped),
    ),
  );
  const buildDifferenceUs = L.overhead.distMinusUnwrapped.medianUs;
  const timerOverheadUs = L.overhead.wrappedMinusUnwrapped.medianUs;
  summary.rowStageGap[row.id] = {
    rowUs: L.totals.dist.medianUs,
    stageWrappedUs: L.totals.wrapped.medianUs,
    pairedGapUs,
    buildDifferenceUs,
    timerOverheadUs,
    inWindowResidualUs:
      pairedGapUs.medianUs - (buildDifferenceUs - timerOverheadUs),
    outsideNamedStages: {
      everythingElseUs: G.stages.everythingElse.self.medianUs,
      beforeSettlementUs: G.gap.beforeSettlementUs.medianUs,
      writeFieldNodeSelfUs: G.stages.writeFieldNode?.self.medianUs ?? 0,
      deliveryInclusiveUs: G.gap.deliveryUs.medianUs,
      chainExitUntimedUs:
        G.stages.everythingElse.self.medianUs -
        G.gap.beforeSettlementUs.medianUs,
    },
  };
}
const portable = (value) => {
  if (typeof value === 'string')
    return value
      .replaceAll(root, '<run>')
      .replace(/{home}\/[^\n]+/g, '<local-process-path>')
      .replace(/{scratch}\/[^\n]+/g, '<local-process-path>')
      .replace(/\/(?:private\/)?var\/folders\/[^\n]+/g, '<local-process-path>');
  if (Array.isArray(value)) return value.map(portable);
  if (value && typeof value === 'object')
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => [key, portable(value)]),
    );
  return value;
};
fs.mkdirSync(output, { recursive: true });
json(path.join(output, 'stages.json'), summary);
fs.writeFileSync(
  path.join(output, 'process-samples.json.gz'),
  gzipSync(JSON.stringify(raw), { level: 9 }),
);
const checks = fs.readdirSync(path.join(root, 'cpu-prechecks')).map((file) => ({
  process: file,
  ...read(path.join(root, 'cpu-prechecks', file)),
}));
assert.equal(checks.length, 180);
assert.ok(checks.every((check) => check.approved));
fs.writeFileSync(
  path.join(output, 'cpu-prechecks.json.gz'),
  gzipSync(JSON.stringify(portable(checks)), { level: 9 }),
);
for (const file of [
  'inputs.json',
  'base-dist-hashes.json',
  'build-verification.json',
  'untimed-load-check.json',
  'static-preparation.json',
  'formal-start.json',
  'quiet-window.json',
  'window-end.json',
])
  json(path.join(output, file), portable(read(path.join(root, file))));
const manifest = read(path.join(root, 'stages/scratch/instrumentation.json'));
json(path.join(output, 'stage-manifest-base.json'), manifest);
json(
  path.join(output, 'evidence-hashes.json'),
  Object.fromEntries(
    fs
      .readdirSync(output, { recursive: true, encoding: 'utf8' })
      .filter(
        (file) =>
          file !== 'evidence-hashes.json' &&
          fs.statSync(path.join(output, file)).isFile(),
      )
      .map((file) => [file, digest(path.join(output, file))]),
  ),
);
console.log(
  'B9_0_SUMMARY_OK processes=180 quality=' +
    summary.quality.medianRatio +
    ' valid=' +
    summary.quality.valid,
);
