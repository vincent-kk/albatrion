import assert from 'node:assert/strict';

import { stageNames } from './buildBundle.mjs';

/** Return the middle value (or mean middle pair) without changing sample order. */
const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
};

/** Validate complete raw data and derive per-write statistics, linear residuals and disjoint stage ledgers. */
export function summarizeLedger(pair, ledger) {
  for (const data of [pair, ledger]) {
    assert.equal(data.config.samples, 100);
    assert.equal(data.config.warmups, 20);
    assert.equal(data.config.runs, 3);
    assert.ok(Number.isFinite(Date.parse(data.config.quietSince)));
    assert.equal(data.NODE_ENV, 'production');
  }
  assert.equal(pair.results.length, 30);
  assert.equal(ledger.results.length, 18);
  assert.equal(new Set(pair.results.map((r) => r.pid)).size, 30);
  assert.equal(new Set(ledger.results.map((r) => r.pid)).size, 18);
  for (const result of pair.results) {
    const engines = result.samples.legacy.length
      ? ['legacy', 'current']
      : ['current'];
    assert.equal(result.orders.length, 100);
    for (const engine of engines) {
      assert.equal(result.samples[engine].length, 100);
      assert.ok(
        result.samples[engine].every((v) => Number.isFinite(v) && v > 0),
      );
      assert.equal(result.minima[engine], Math.min(...result.samples[engine]));
    }
    if (engines.length === 2)
      for (let i = 1; i < result.orders.length; i++)
        assert.notEqual(result.orders[i], result.orders[i - 1]);
  }
  const pairRows = pair.rows.map((row) => {
    const writes = row.id === 'switch-siblings-0' ? 1 : 2;
    for (const engine of row.currentOnly
      ? ['current']
      : ['legacy', 'current']) {
      const minima = pair.results
        .filter((r) => r.row === row.id)
        .map((r) => r.minima[engine]);
      assert.equal(minima.length, 3);
      assert.equal(row[engine].ms, median(minima));
    }
    return {
      id: row.id,
      n: row.n,
      writes,
      legacyUs: row.currentOnly ? null : (row.legacy.ms * 1000) / writes,
      currentUs: (row.current.ms * 1000) / writes,
      legacyWidthUs: row.currentOnly
        ? null
        : (row.legacy.widthMs * 1000) / writes,
      currentWidthUs: (row.current.widthMs * 1000) / writes,
      ratio: row.currentOnly ? null : row.current.ms / row.legacy.ms,
      relativeToActive:
        row.current.ms /
        writes /
        (pair.rows.find((r) => r.id === 'switch-oneOf-80').current.ms / 2),
    };
  });
  const terms = {};
  for (const engine of ['legacy', 'current']) {
    const key = `${engine}Us`;
    const points = pairRows
      .filter((r) => /^switch-oneOf-(2|10|40|80|160)$/.test(r.id))
      .sort((a, b) => a.n - b.n);
    assert.equal(points.length, 5);
    const meanN = points.reduce((s, p) => s + p.n, 0) / points.length;
    const meanT = points.reduce((s, p) => s + p[key], 0) / points.length;
    const slope =
      points.reduce((s, p) => s + (p.n - meanN) * (p[key] - meanT), 0) /
      points.reduce((s, p) => s + (p.n - meanN) ** 2, 0);
    const floor = meanT - slope * meanN;
    terms[engine] = {
      floorUs: floor,
      slopeUs: slope,
      residuals: points.map((p) => ({
        n: p.n,
        actualUs: p[key],
        fittedUs: floor + slope * p.n,
        residualUs: p[key] - floor - slope * p.n,
      })),
      deltaUs:
        pairRows.find((r) => r.id === 'switch-payload-12')[key] -
        pairRows.find((r) => r.id === 'switch-oneOf-80')[key],
      smallestUs: pairRows.find((r) => r.id === 'switch-siblings-0')[key],
    };
  }
  const stages = [];
  for (const row of [...new Set(ledger.results.map((r) => r.row))]) {
    const processes = ledger.results.filter((r) => r.row === row);
    assert.equal(processes.length, 3);
    for (const process of processes) {
      assert.equal(process.stages.length, 100);
      assert.equal(process.phaseStages.length, 100);
      for (const mode of ['wrapped', 'unwrapped']) {
        assert.equal(process.samples[mode].length, 100);
        assert.ok(
          process.samples[mode].every((v) => Number.isFinite(v) && v > 0),
        );
      }
      for (let i = 0; i < 100; i++) {
        const sum = Object.values(process.stages[i]).reduce(
          (s, m) => s + m.selfUs,
          0,
        );
        assert.ok(Math.abs(sum - process.samples.wrapped[i]) < 1e-6);
        const phaseSum = Object.values(process.phaseStages[i]).reduce(
          (s, m) => s + m.selfUs,
          0,
        );
        assert.ok(Math.abs(phaseSum - process.samples.wrapped[i]) < 1e-6);
      }
      assert.ok(process.calls.computeNode > 0);
      assert.ok(process.allocationSampleCount > 0);
      for (const name of stageNames) {
        assert.equal(
          median(process.stages.map((s) => s[name]?.calls ?? 0)),
          process.calls[name] ?? 0,
          `${row} ${name}: timer/coverage count mismatch`,
        );
      }
    }
    const wrappedUs = median(
      processes.map((r) => Math.min(...r.samples.wrapped)),
    );
    const unwrappedUs = median(
      processes.map((r) => Math.min(...r.samples.unwrapped)),
    );
    stages.push({
      row,
      wrappedUs,
      unwrappedUs,
      overheadUs: wrappedUs - unwrappedUs,
      overheadRatio: wrappedUs / unwrappedUs,
      wrappedMedianUs: median(processes.map((r) => median(r.samples.wrapped))),
      stageRows: [...stageNames, 'everythingElse'].map((name) => ({
        name,
        selfUs: median(
          processes.map((r) =>
            median(r.stages.map((s) => s[name]?.selfUs ?? 0)),
          ),
        ),
        inclusiveUs: median(
          processes.map((r) =>
            median(r.stages.map((s) => s[name]?.inclusiveUs ?? 0)),
          ),
        ),
        calls: median(
          processes.map(
            (r) => r.calls[name] ?? (name === 'everythingElse' ? 1 : 0),
          ),
        ),
        bytes: median(processes.map((r) => r.allocationBytes[name] ?? 0)),
        sampleCounts: processes.map((r) => r.allocationSampleCounts[name] ?? 0),
      })),
      gateMismatches: processes.map((r) => r.gateMismatches),
      phaseRows: [
        'markWrite',
        'registerRecalculation',
        'computeNode',
        'runDeriveRounds',
        'transitionSettlement',
        'finalizeExits',
        'commitSettlement',
        'everythingElse',
      ].map((phase) => ({
        phase,
        totalUs: median(
          processes.map((r) =>
            median(
              r.phaseStages.map((sample) =>
                Object.entries(sample)
                  .filter(([key]) => key.startsWith(`${phase}/`))
                  .reduce((sum, [, metric]) => sum + metric.selfUs, 0),
              ),
            ),
          ),
        ),
        parts: [
          ...new Set(
            processes.flatMap((r) =>
              r.phaseStages.flatMap((sample) =>
                Object.keys(sample).filter((key) =>
                  key.startsWith(`${phase}/`),
                ),
              ),
            ),
          ),
        ].map((key) => ({
          name: key.slice(phase.length + 1),
          selfUs: median(
            processes.map((r) =>
              median(r.phaseStages.map((sample) => sample[key]?.selfUs ?? 0)),
            ),
          ),
        })),
      })),
    });
  }
  return { pairRows, terms, stages };
}
