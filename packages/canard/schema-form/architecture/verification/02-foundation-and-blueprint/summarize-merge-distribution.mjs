// Run after the fixed eight-process native ESM/CJS series; stdout is the summary JSON.
import { readFileSync } from 'node:fs';

const directory = new URL('./', import.meta.url);
const REPETITIONS = 8;
const T_CRITICAL = 2.364624251;
const fixtures = {};
const provenance = [];
for (let repetition = 0; repetition < REPETITIONS; repetition++) {
  const report = JSON.parse(readFileSync(new URL(`merge-distribution-${repetition}.json`, directory), 'utf8'));
  if (!report.complete || report.repetition !== repetition || report.rows.length !== 8 || report.batchSize !== 128 || !(report.sink > 0))
    throw new Error(`Incomplete native artifact process: ${repetition}`);
  provenance.push({ repetition, seed: report.seed, order: report.order, formats: report.formats, fixtures: report.fixtures, environment: report.environment, baseline: report.baseline, candidate: report.candidate });
  for (const row of report.rows) {
    const before = row.measurements.find(({ name }) => name === 'before');
    const after = row.measurements.find(({ name }) => name === 'after');
    if (!(before.hz > 0 && after.hz > 0)) throw new Error(`Invalid native throughput: ${repetition}`);
    const key = `${row.format}/${row.fixture}`;
    (fixtures[key] ??= []).push({ repetition, beforeCallsPerSecond: before.callsPerSecond, afterCallsPerSecond: after.callsPerSecond, ratio: after.hz / before.hz });
  }
}
const summaries = {};
for (const [fixture, rows] of Object.entries(fixtures)) {
  if (rows.length !== REPETITIONS) throw new Error(`Incomplete native fixture: ${fixture}`);
  const logarithms = rows.map((row) => Math.log(row.ratio));
  const mean = logarithms.reduce((sum, value) => sum + value, 0) / REPETITIONS;
  const variance = logarithms.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (REPETITIONS - 1);
  const half = T_CRITICAL * Math.sqrt(variance / REPETITIONS);
  const interval = [Math.exp(mean - half), Math.exp(mean + half)];
  summaries[fixture] = { rows, geometricMeanRatio: Math.exp(mean), logRatioMean: mean, logRatioSampleVariance: variance, confidenceInterval95: interval, nonRegressionSupported: interval[0] >= 1 };
}
for (const side of ['baseline', 'candidate']) {
  const expected = JSON.stringify(provenance[0][side].hashes);
  if (!provenance.every((record) => JSON.stringify(record[side].hashes) === expected))
    throw new Error(`Distribution changed between processes: ${side}`);
}
console.log(JSON.stringify({
  method: { measuredSurface: 'native Node ESM/CJS public ./object exports from actual Rolldown builds', independentProcessPairsPerFormat: REPETITIONS, order: 'AB,BA,BA,AB repeated twice', batchSize: 128, tCriticalDegreesOfFreedom7: T_CRITICAL, confidence: 'two-sided 95% t interval on process-paired log throughput ratios' },
  provenance,
  summaries,
}, null, 2));
