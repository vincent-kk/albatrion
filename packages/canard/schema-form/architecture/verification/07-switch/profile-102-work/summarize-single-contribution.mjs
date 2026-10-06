// Invoked after all sequential round-102 workers; steady results never participate in adoption.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'],
  ['sample-0', 'mount'], ['sample-0', 'first'], ['sample-0', 'later'],
  ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later']];
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];

/** Reuse the canonical round-102 deterministic 99% bootstrap median uncertainty. */
function medianError(values) {
  let state = 101;
  const medians = [];
  for (let trial = 0; trial < 1999; trial++) {
    const sample = [];
    for (let index = 0; index < values.length; index++) {
      state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
      sample.push(values[(state >>> 0) % values.length]);
    }
    medians.push(median(sample));
  }
  medians.sort((a, b) => a - b);
  const center = median(values);
  return Math.max(Math.abs(medians[9] - center), Math.abs(medians[1989] - center));
}

const windows = [], rows = [];
for (const [name, mode] of operations) {
  const read = (variant, regime, run) => {
    const row = JSON.parse(fs.readFileSync(path.join(directory,
      `merge102-${variant}-${name}-${mode}-${regime}-r${run}.json`), 'utf8'));
    assert.equal(row.head, '237678927');
    assert.equal(row.samples, 101); assert.equal(row.warmup, 20); assert(row.freshProcess);
    assert.equal(row.calls.head, 121); assert.equal(row.calls.variant, 121);
    assert.deepEqual(row.observation.head, row.observation.variant);
    windows.push([row.started, row.ended]);
    return row;
  };
  const controls = [1, 2, 3].map(run => read('control', 'forced', run));
  const forced = [1, 2, 3].map(run => read('working', 'forced', run));
  const steady = [1, 2, 3, 4, 5, 6].map(run => read('working', 'steady', run));
  assert.equal(steady.filter(row => row.blockOrder === 'H-first').length, 3);
  assert.equal(steady.filter(row => row.blockOrder === 'W-first').length, 3);
  const noOpNoiseMs = Math.max(...controls.flatMap(row => [Math.abs(row.gainMs), Math.abs(row.pairedMedianMs)]));
  const measurements = forced.map(row => {
    const residuals = [...row.emptyTimingsMs.before, ...row.emptyTimingsMs.after]
      .map(value => Math.abs(value - row.empty)).toSorted((a, b) => a - b);
    const error = medianError(row.timingsMs.head) + medianError(row.timingsMs.variant);
    const noiseMs = Math.max(.001, noOpNoiseMs, residuals[Math.ceil(residuals.length * .95) - 1] + error);
    const deltas = row.pairedDeltasMs.toSorted((a, b) => a - b);
    const inside = row.gc.filter(event => row.windows.some(window => event.start >= window.begin && event.start < window.end));
    assert.equal(inside.filter(event => event.kind === 4).length, 0);
    return { run: row.run, headMs: row.headMs, workingMs: row.workingMs, gainMs: row.gainMs,
      pairedMedianMs: row.pairedMedianMs, noiseMs, pairedMedianInterval: [deltas[40], deltas[60]], gcInside: inside.length };
  });
  const pool = (runs, version) => median(runs.flatMap(row => row.timingsMs[version].map(value => value - row.empty)));
  rows.push({ name, mode, headMs: median(forced.map(row => row.headMs)),
    workingMs: median(forced.map(row => row.workingMs)), gainMs: median(forced.map(row => row.gainMs)),
    pairedMedianMs: median(forced.map(row => row.pairedMedianMs)), noOpNoiseMs,
    maxNoiseMs: Math.max(...measurements.map(row => row.noiseMs)),
    aboveNoise: measurements.every(row => row.gainMs > row.noiseMs && row.pairedMedianInterval[0] > 0),
    regressionAboveNoise: measurements.some(row => row.gainMs < -row.noiseMs && row.pairedMedianInterval[1] < 0),
    measurements, steady: { runs: 6, samplesPerVersion: 606, baselineFirst: 3, candidateFirst: 3,
      pooledHeadMs: pool(steady, 'head'), pooledWorkingMs: pool(steady, 'variant'),
      pooledGainMs: pool(steady, 'head') - pool(steady, 'variant'),
      runsDetail: steady.map(row => ({ run: row.run, blockOrder: row.blockOrder,
        headMs: row.headMs, workingMs: row.workingMs, gainMs: row.gainMs })) } });
}
windows.sort((a, b) => a[0] - b[0]);
for (let index = 1; index < windows.length; index++) assert(windows[index - 1][1] <= windows[index][0]);
const processFiles = fs.readdirSync(directory).filter(name => name.startsWith('merge102-process-'));
const processes = processFiles.map(name => JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')));
for (const process of processes) {
  assert(process.naturalExit && process.status === 0 && process.signal === null);
  assert(process.elapsedMs < 480_000);
}
const verification = ['vitest', 'tsc', 'eslint', 'legacy'].map(name =>
  JSON.parse(fs.readFileSync(path.join(directory, `merge102-verify-${name}.json`), 'utf8')));
for (const record of verification) {
  assert(record.naturalExit && record.signal === null && record.elapsedMs < 480_000);
  assert.equal(record.status, record.name === 'vitest' ? 1 : 0);
}
const failures = fs.readFileSync(path.join(directory, 'merge102-verify-vitest.log'), 'utf8')
  .split('\n').filter(line => /^ FAIL /.test(line));
assert.equal(failures.length, 4);
for (const project of ['render', 'react18']) for (const effect of ['useEffect', 'useLayoutEffect'])
  assert.equal(failures.filter(line => line.includes(`|${project}|`) && line.includes('EVENT-070') && line.endsWith(effect)).length, 1);
const equivalence = JSON.parse(fs.readFileSync(path.join(directory, 'merge102-equivalence.json'), 'utf8'));
assert.equal(equivalence.schemas, 59); assert.equal(equivalence.errors, 24); assert.equal(equivalence.warningCases, 6);
const counts = JSON.parse(fs.readFileSync(path.join(directory, 'merge102-counts.json'), 'utf8')).rows;
const result = { head: '237678927', adopted: rows.some(row => row.aboveNoise) && rows.every(row => !row.regressionAboveNoise),
  noiseRule: 'max(1us, forced no-op absolute median gain/paired median, empty residual p95 + 1999 bootstrap 99% median-error sum); improvement in all three forced runs; any forced run can veto; steady is record-only',
  rows, timerWorkers: windows.length, recordedProcesses: processes.length,
  maxWorkerMs: Math.max(...windows.map(([begin, end]) => end - begin)),
  maxProcessMs: Math.max(...processes.map(row => row.elapsedMs), ...verification.map(row => row.elapsedMs)),
  processesSequential: true, counts: counts.map(({ observation, ...row }) => row), verification,
  equivalence: { schemas: equivalence.schemas, captures: equivalence.captures,
    nodes: equivalence.nodes, errors: equivalence.errors, warningCases: equivalence.warningCases } };
const output = JSON.stringify(result, null, 2) + '\n';
assert(Buffer.byteLength(output) <= 5_000_000);
fs.writeFileSync(path.join(directory, 'merge102-verdict.json'), output);
console.log(JSON.stringify({ ...result, rows: rows.map(({ measurements, steady, ...row }) =>
  ({ ...row, steady: { ...steady, runsDetail: undefined }, perRunNoise: measurements.map(value => value.noiseMs) })) }, null, 2));
