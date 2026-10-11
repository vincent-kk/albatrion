// CLI aggregation uses the committed seeded bootstrap and audits every paired sample.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const started = Date.now();
const stage = process.argv[2];
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const canonical = fs.readFileSync(path.resolve(directory, '../profile-104-owned/summarize.mjs'), 'utf8');
const begin = canonical.indexOf('function bootstrap(values)');
const end = canonical.indexOf('\nconst builds =', begin);
assert(begin >= 0 && end > begin);
const bootstrapSource = canonical.slice(begin, end).replace('ci95: [medians[49], medians[1949]],',
  'ci95: [medians[49], medians[1949]], ci99: [medians[9], medians[1989]],');
const bootstrap = new Function('assert', 'started', 'median', bootstrapSource + '\nreturn bootstrap;')(assert, started, median);
const operations = [
  ['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ['sample-0', 'first'], ['sample-0', 'later'], ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later'],
];
const rows = [], workers = [];
const control = stage === 'AA' ? undefined : read('summary-AA');
for (const [name, mode] of operations) {
  const deltas = [], base = [], candidate = [];
  for (let run = 1; run <= 9; run++) {
    const row = read(`${stage}-forced-${name}-${mode}-r${run}`);
    assert.equal(row.HEAD, '552a975abd8afa6ef914e218832bd8bfddf03d5b');
    assert.equal(row.freshProcess, true);
    assert.equal(row.forcedGCOutsideClock, true);
    assert.equal(row.warmup, 20);
    assert.equal(row.samples, 101);
    assert.equal(row.pairedDeltasMs.length, 101);
    assert.equal(row.windows.length, 202);
    assert.equal(row.observations.head, row.observations.working);
    assert.equal(row.emptyTimingsMs.before.length, 101);
    assert.equal(row.emptyTimingsMs.after.length, 101);
    for (let index = 0; index < 101; index++) {
      assert.equal(row.pairedDeltasMs[index], row.timingsMs.head[index] - row.timingsMs.working[index]);
      assert.equal(row.windows[index * 2].version, (index + run - 1) % 2 ? 'working' : 'head');
      deltas.push(row.pairedDeltasMs[index]);
      base.push(row.timingsMs.head[index] - row.empty);
      candidate.push(row.timingsMs.working[index] - row.empty);
    }
    const worker = read(`${stage}-process-pair-forced-${name}-${mode}-${run}-${row.comparator}`);
    assert.equal(worker.status, 0);
    assert.equal(worker.signal, null);
    assert(worker.elapsedMs < 480000);
    workers.push(worker);
  }
  const pooled = bootstrap(deltas);
  const aa = stage === 'AA' ? pooled.center : control.rows.find(x => x.name === name && x.mode === mode).pooledMedianMs;
  const baseMedianMs = median(base), floorMs = baseMedianMs * 0.005;
  const improved = stage !== 'AA' && pooled.ci99[0] > 0 && pooled.center > aa;
  const regression = stage !== 'AA' && pooled.ci99[1] < 0 && Math.abs(pooled.center) > Math.max(Math.abs(aa), floorMs);
  rows.push({ name, mode, pairs: 909, pooledMedianMs: pooled.center, ci99Ms: pooled.ci99,
    baseMedianMs, candidateMedianMs: median(candidate), aaMedianMs: aa, floorMs,
    regressionThresholdMs: Math.max(Math.abs(aa), floorMs), improved, regression,
    verdict: stage === 'AA' ? 'A/A 대조' : regression ? '회귀' : improved ? '개선' : '조건 미충족' });
}
workers.sort((a, b) => a.started - b.started);
for (let index = 1; index < workers.length; index++) assert(workers[index].started >= workers[index - 1].ended);
const improved = rows.filter(x => x.improved).map(x => `${x.name}/${x.mode}`);
const regressions = rows.filter(x => x.regression).map(x => `${x.name}/${x.mode}`);
const summary = { stage, adopted: stage === 'AA' ? null : improved.length > 0 && regressions.length === 0,
  improved, regressions, rows, protocol: { runs: 9, warmup: 20, samples: 101, pairs: 909,
    bootstrapTrials: 1999, seed: 101, ci99Indices: [9, 1989] },
  audit: { workers: workers.length, sequential: true, naturalExit: true,
    maximumWorkerMs: Math.max(...workers.map(x => x.elapsedMs)), started: workers[0].started, ended: workers.at(-1).ended } };
const output = JSON.stringify(summary, null, 2) + '\n';
assert(Buffer.byteLength(output) < 5_000_000);
fs.writeFileSync(path.join(directory, `summary-${stage}.json`), output);
console.log(JSON.stringify({ stage, adopted: summary.adopted, improved, regressions }));
console.log('| 행 | pooled ms | 99% 구간 ms | A/A ms | 기준 0.5% ms | 판정 |');
console.log('| --- | ---: | --- | ---: | ---: | --- |');
for (const row of rows) console.log(`| ${row.name}/${row.mode} | ${row.pooledMedianMs.toFixed(6)} | [${row.ci99Ms.map(x => x.toFixed(6)).join(', ')}] | ${row.aaMedianMs.toFixed(6)} | ${row.floorMs.toFixed(6)} | ${row.verdict} |`);
