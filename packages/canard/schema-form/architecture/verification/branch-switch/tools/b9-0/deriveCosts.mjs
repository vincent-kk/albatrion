// CLI postprocessing checks scoped conservation and exports the report's cost models.
import assert from 'node:assert/strict';
import path from 'node:path';

import { stageNames as baseStageNames } from '../b6/buildStages.mjs';
import { json, read, verifyInputs } from './files.mjs';

const [rootText, outputText] = process.argv.slice(2);
const root = path.resolve(rootText),
  output = path.resolve(outputText);
verifyInputs(root);
const raw = read(path.join(root, 'results.json'));
assert.equal(raw.completed, true);
const manifest = read(path.join(root, 'stages/scratch/instrumentation.json'));
const comparativeNames = manifest.expectedStages.wrapped;
const median = (values) => {
  const sorted = values.toSorted((a, b) => a - b),
    middle = Math.floor(sorted.length / 2);
  return sorted.length % 2
    ? sorted[middle]
    : (sorted[middle - 1] + sorted[middle]) / 2;
};
const stats = (values) => ({
  medianUs: median(values),
  processMedians: values,
  minUs: Math.min(...values),
  maxUs: Math.max(...values),
});
const rows = {};
for (const row of new Set(raw.results.map((record) => record.row))) {
  const records = raw.results.filter(
    (record) => record.row === row && record.pass === 'supplemental',
  );
  assert.equal(records.length, 10);
  const parents = {};
  for (const parent of ['computeNode', 'finalizeExits']) {
    const processValues = records.map((record) => {
      const samples = record.stages.map((stages, index) => {
        const children = Object.entries(record.scoped[index]).filter(([name]) =>
          name.startsWith(parent + '/'),
        );
        const own = stages[parent]?.selfUs ?? 0;
        const components = { residualSelf: own };
        let inclusive = own;
        for (const [key, metric] of children) {
          const name = key.slice(parent.length + 1),
            base = baseStageNames.includes(name);
          inclusive += base ? metric.inclusiveUs : metric.selfUs;
          if (comparativeNames.includes(name)) continue;
          components[name] =
            (components[name] ?? 0) +
            (base ? metric.inclusiveUs : metric.selfUs);
        }
        assert.ok(
          Math.abs(inclusive - (stages[parent]?.inclusiveUs ?? 0)) < 0.02,
          parent + ' scoped conservation',
        );
        return {
          ...components,
          reconstructedComparativeSelf: Object.values(components).reduce(
            (a, b) => a + b,
            0,
          ),
        };
      });
      const names = [
        ...new Set(samples.flatMap((sample) => Object.keys(sample))),
      ];
      return Object.fromEntries(
        names.map((name) => [
          name,
          median(samples.map((sample) => sample[name] ?? 0)),
        ]),
      );
    });
    const names = [
      ...new Set(processValues.flatMap((value) => Object.keys(value))),
    ];
    parents[parent] = Object.fromEntries(
      names.map((name) => [
        name,
        stats(processValues.map((value) => value[name] ?? 0)),
      ]),
    );
  }
  rows[row] = parents;
}
const derived = {
  units: 'microseconds per single write',
  rule: 'Noncomparative B6 child boundaries contribute inclusive time; new detail boundaries contribute self time. Comparative child boundaries are excluded. This reconstructs the comparative self budget at supplemental instrumentation cost, not the original uninstrumented duration.',
  rows,
  slopes: {},
};
for (const [kind, from, to, divisor] of [
  ['perLeaf', 'switch-oneOf-80', 'switch-payload-12', 18],
  ['perSibling', 'switch-siblings-0', 'switch-siblings-1000', 1000],
])
  derived.slopes[kind] = Object.fromEntries(
    ['computeNode', 'finalizeExits'].map((parent) => [
      parent,
      Object.fromEntries(
        [
          ...new Set([
            ...Object.keys(rows[from][parent]),
            ...Object.keys(rows[to][parent]),
          ]),
        ].map((name) => [
          name,
          ((rows[to][parent][name]?.medianUs ?? 0) -
            (rows[from][parent][name]?.medianUs ?? 0)) /
            Number(divisor),
        ]),
      ),
    ]),
  );
derived.finalizeExitsFixedEstimateUs =
  rows['switch-oneOf-80'].finalizeExits.reconstructedComparativeSelf.medianUs -
  derived.slopes.perLeaf.finalizeExits.reconstructedComparativeSelf * 6;
const adjusted = read(path.join(output, 'stages.json'));
derived.netScopedSlopes = {};
for (const [kind, from, to, divisor] of [
  ['perLeaf', 'switch-oneOf-80', 'switch-payload-12', 18],
  ['perSibling', 'switch-siblings-0', 'switch-siblings-1000', 1000],
]) {
  const a = adjusted.rows[from].supplemental.scoped,
    b = adjusted.rows[to].supplemental.scoped;
  derived.netScopedSlopes[kind] = Object.fromEntries(
    [...new Set([...Object.keys(a), ...Object.keys(b)])].map((name) => [
      name,
      ((b[name]?.selfNetUs ?? 0) - (a[name]?.selfNetUs ?? 0)) / Number(divisor),
    ]),
  );
}
json(path.join(output, 'cost-splits.json'), derived);
const ledger = raw.results.filter(
  (record) => record.row === 'switch-siblings-0' && record.pass === 'ledger',
);
const paired = ledger.map((record) => {
  const d = record.samples.dist,
    u = record.samples.unwrapped,
    w = record.samples.wrapped;
  return {
    distMinusWrapped: median(d.map((v, i) => v - w[i])),
    distMinusUnwrapped: median(d.map((v, i) => v - u[i])),
    wrappedMinusUnwrapped: median(w.map((v, i) => v - u[i])),
  };
});
const gaps = raw.results
  .filter(
    (record) => record.row === 'switch-siblings-0' && record.pass === 'gap',
  )
  .map((record) => {
    const samples = record.gaps.map((gap, i) => {
      const total = record.samples.gap[i],
        write = record.stages[i].writeFieldNode.inclusiveUs;
      const coarse = Object.entries(record.stages[i])
        .filter(([name]) => comparativeNames.includes(name))
        .reduce((sum, [, value]) => sum + value.selfUs, 0);
      const residual = total - gap.beforeSettlementUs - write - gap.deliveryUs;
      const value = {
        total,
        entryBeforeSettlement: gap.beforeSettlementUs,
        writeIncludingSettlement: write,
        comparativeStageSelf: coarse,
        contextAndUnattributedInsideWrite: write - coarse,
        delivery: gap.deliveryUs,
        subscriberWave: gap.subscriberWaveUs,
        residualAfterBoundaries: residual,
      };
      assert.ok(
        Math.abs(
          total -
            (value.entryBeforeSettlement +
              value.comparativeStageSelf +
              value.contextAndUnattributedInsideWrite +
              value.delivery +
              residual),
        ) < 0.01,
      );
      return value;
    });
    return Object.fromEntries(
      Object.keys(samples[0]).map((name) => [
        name,
        median(samples.map((sample) => sample[name])),
      ]),
    );
  });
json(path.join(output, 'row-gap.json'), {
  units: 'microseconds per single write',
  historicalB5: {
    reportedRowMinusWrappedUs: 24.02,
    attributedExactly: false,
    reason:
      'The historical row and wrapped timings came from different devices and a pre-B11 product. Entry and delivery occur in both totals and cannot be added to their difference.',
  },
  primaryIdentity: read(path.join(output, 'stages.json')).rowStageGap[
    'switch-siblings-0'
  ],
  historicalCrossHarnessResidualUs:
    24.02 -
    read(path.join(output, 'stages.json')).rowStageGap['switch-siblings-0']
      .pairedGapUs.medianUs,
  pairedLedger: Object.fromEntries(
    Object.keys(paired[0]).map((name) => [
      name,
      stats(paired.map((value) => value[name])),
    ]),
  ),
  boundarySplit: Object.fromEntries(
    Object.keys(gaps[0]).map((name) => [
      name,
      stats(gaps.map((value) => value[name])),
    ]),
  ),
  subscribers: 0,
});
console.log('B9_0_COST_SPLITS_OK scoped conservation and gap identities');
