import assert from 'node:assert/strict';

import { median } from './median.mjs';

/** Validate complete independent process evidence, then summarize exclusive phase medians. */
export function summarizeMountResults(inputs, raw, smoke) {
  assert.equal(raw.completed, true);
  const lanes = Object.keys(inputs.lanes),
    summary = {};
  const allPids = [];
  const phases = [
    ...new Set(
      raw.records.flatMap((record) =>
        Object.values(record.ledgers).flatMap((ledgers) =>
          ledgers.flatMap((ledger) => Object.keys(ledger.phases)),
        ),
      ),
    ),
  ].sort();
  const names = [
    ...new Set(
      raw.records.flatMap((record) =>
        Object.values(record.ledgers).flatMap((ledgers) =>
          ledgers.flatMap((ledger) => Object.keys(ledger.metrics)),
        ),
      ),
    ),
  ].sort();
  assert.equal(raw.records.length, lanes.length * inputs.config.runs);
  for (const lane of lanes) {
    const records = raw.records.filter((record) => record.lane === lane);
    assert.equal(records.length, inputs.config.runs);
    assert.deepEqual(
      records.map((record) => record.repeat).sort((a, b) => a - b),
      Array.from({ length: inputs.config.runs }, (_, index) => index),
    );
    const output = {
      revision: inputs.lanes[lane].revision,
      totals: {},
      phases: {},
      stages: {},
      scopedStages: {},
    };
    for (const record of records) {
      assert.deepEqual(record.config, inputs.config);
      assert.ok(Number.isSafeInteger(record.pid) && record.pid > 0);
      assert.ok(!allPids.includes(record.pid), 'Each process is independent');
      allPids.push(record.pid);
      for (const mode of ['unwrapped', 'wrapped', 'detailed']) {
        assert.equal(record.samples[mode].length, inputs.config.samples);
        assert.ok(
          record.samples[mode].every(
            (value) => Number.isFinite(value) && value >= 0,
          ),
        );
        if (mode === 'unwrapped') continue;
        assert.equal(record.ledgers[mode].length, inputs.config.samples);
        for (const ledger of record.ledgers[mode]) {
          assert.equal(ledger.timed, true);
          const sum = Object.values(ledger.phases).reduce(
            (total, metric) => total + metric.selfUs,
            0,
          );
          assert.ok(
            Number.isFinite(ledger.totalUs) &&
              Math.abs(sum - ledger.totalUs) < 0.001,
          );
          for (const metric of Object.values(ledger.metrics))
            assert.ok(
              Number.isFinite(metric.selfUs) &&
                metric.selfUs >= -0.001 &&
                Number.isSafeInteger(metric.calls) &&
                metric.calls >= 0,
            );
        }
      }
    }
    for (const mode of ['unwrapped', 'wrapped', 'detailed']) {
      const processMedians = records.map((record) =>
        median(record.samples[mode]),
      );
      const processMinima = records.map((record) =>
        Math.min(...record.samples[mode]),
      );
      output.totals[mode] = {
        minimumUs: median(processMinima),
        processMinima,
        medianUs: median(processMedians),
        minUs: Math.min(...processMedians),
        maxUs: Math.max(...processMedians),
        widthUs: Math.max(...processMedians) - Math.min(...processMedians),
        processMedians,
      };
      if (mode === 'unwrapped') continue;
      output.phases[mode] = {};
      output.stages[mode] = {};
      output.scopedStages[mode] = {};
      const scopedNames = [
        ...new Set(
          records.flatMap((record) =>
            record.ledgers[mode].flatMap((ledger) =>
              Object.keys(ledger.scopedMetrics ?? {}),
            ),
          ),
        ),
      ].sort();
      for (const [kind, keys] of [
        ['phases', phases],
        ['metrics', names],
        ['scopedMetrics', scopedNames],
      ])
        for (const key of keys) {
          const values = records.map((record) =>
            median(
              record.ledgers[mode].map(
                (ledger) => ledger[kind]?.[key]?.selfUs ?? 0,
              ),
            ),
          );
          const calls = records.flatMap((record) =>
            record.ledgers[mode].map(
              (ledger) => ledger[kind]?.[key]?.calls ?? 0,
            ),
          );
          const target =
            kind === 'phases'
              ? output.phases[mode]
              : kind === 'scopedMetrics'
                ? output.scopedStages[mode]
                : output.stages[mode];
          target[key] = {
            medianUs: median(values),
            minUs: Math.min(...values),
            maxUs: Math.max(...values),
            processMedians: values,
            minCalls: Math.min(...calls),
            maxCalls: Math.max(...calls),
          };
        }
    }
    const countRecord = smoke.results.find((result) => result.lane === lane);
    assert.ok(countRecord && countRecord.timed === false);
    output.untimedCounts = countRecord.counts;
    summary[lane] = output;
  }
  const increments = [];
  for (let index = 1; index < lanes.length; index++) {
    const from = lanes[index - 1],
      to = lanes[index];
    increments.push({
      from,
      to,
      unwrappedDeltaUs:
        summary[to].totals.unwrapped.medianUs -
        summary[from].totals.unwrapped.medianUs,
      unwrappedMinimumDeltaUs:
        summary[to].totals.unwrapped.minimumUs -
        summary[from].totals.unwrapped.minimumUs,
      coarsePhaseDeltaUs: Object.fromEntries(
        phases.map((phase) => [
          phase,
          summary[to].phases.wrapped[phase].medianUs -
            summary[from].phases.wrapped[phase].medianUs,
        ]),
      ),
      detailedPhaseDeltaUs: Object.fromEntries(
        phases.map((phase) => [
          phase,
          summary[to].phases.detailed[phase].medianUs -
            summary[from].phases.detailed[phase].medianUs,
        ]),
      ),
    });
  }
  return {
    fixture: inputs.fixture,
    config: inputs.config,
    units: 'microseconds',
    rule: 'minimumUs is the median of process minima, matching historical canonical reports; medianUs is the median of process medians. Phase self time is exclusive. Instrumentation overhead is retained. Individual phase medians do not sum to total medians.',
    lanes: summary,
    increments,
  };
}
