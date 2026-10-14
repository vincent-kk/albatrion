// Deterministic pooled paired-median bootstrap; no discarded samples or clipping.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const phase = process.argv[2];
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const q = (values, p) => values.toSorted((a, b) => a - b)[Math.ceil(values.length * p) - 1];

/** Resample all nine runs' paired differences with the recorded seeded generator. */
function bootstrap(values, seed) {
  let state = seed >>> 0;
  const estimates = [];
  for (let trial = 0; trial < 10000; trial++) {
    const sample = new Array(values.length);
    for (let i = 0; i < sample.length; i++) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      sample[i] = values[Math.floor(state / 4294967296 * values.length)];
    }
    estimates.push(median(sample));
  }
  return [q(estimates, .005), q(estimates, .995)];
}

const rows = [
  ['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ...['sample-0', 'flat-100', 'flat-500', 'nested-d5-f4', 'oneOf-40'].flatMap(name => [[name, 'first'], [name, 'later']]),
];
const records = (folder, name, mode) => Array.from({ length: 9 }, (_, i) => {
  const row = JSON.parse(fs.readFileSync(path.join(directory, folder, `forced-${name}-${mode}-r${i + 1}.json`), 'utf8'));
  assert.equal(row.samples, 101); assert.equal(row.warmup, 20); assert(row.freshProcess && row.forcedGCOutsideClock);
  assert.equal(row.pairedDeltasMs.length, 101);
  return row;
});
const summaryRows = rows.map(([name, mode], index) => {
  const aa = records('aa', name, mode), actual = phase === 'aa' ? aa : records(phase, name, mode);
  const delta = actual.flatMap(r => r.pairedDeltasMs);
  const pooledMedianMs = median(delta), ci99Ms = bootstrap(delta, 11000 + index);
  const aaStatisticMs = median(aa.flatMap(r => r.pairedDeltasMs));
  const baseMedianMs = median(actual.flatMap(r => r.timingsMs.head.map(v => v - r.empty)));
  const floorMs = Math.max(Math.abs(aaStatisticMs), baseMedianMs * .005);
  const improvement = ci99Ms[0] > 0 && pooledMedianMs > aaStatisticMs;
  const regression = ci99Ms[1] < 0 && Math.abs(pooledMedianMs) > floorMs;
  return { name, mode, pooledMedianMs, ci99Ms, aaStatisticMs, baseMedianMs, floorMs,
    verdict: phase === 'aa' ? 'A/A' : regression ? '회귀' : improvement ? '이득' : ci99Ms[1] < 0 ? '바닥 이하 감소' : '잡음 범위',
    improvement, regression, pairedSamples: delta.length };
});
const summary = { name: phase, HEAD: 'ba2571b86', protocol: '105C-01 + 최소 크기 부록', runs: 9, samplesPerRun: 101,
  bootstrapResamples: 10000, seed: '11000 + row index', rows: summaryRows,
  verdict: phase === 'aa' ? 'A/A' : summaryRows.some(r => r.regression) || !summaryRows.some(r => r.improvement) ? '기각' : '채택' };
fs.writeFileSync(path.join(directory, `${phase}-summary.json`), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary));
