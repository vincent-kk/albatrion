// 909 pooled paired differences with the canonical bootstrap and 105C-01 size floor.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const directory = path.dirname(fileURLToPath(import.meta.url));
const started = Date.now();
const median = values => values.toSorted((a, b) => a - b)[Math.ceil(values.length / 2) - 1];
const read = name => JSON.parse(fs.readFileSync(path.join(directory, name + '.json'), 'utf8'));
const sha = value => createHash('sha256').update(value).digest('hex');
const operations = [['nested-d5-f4', 'mount'], ['flat-500', 'mount'], ['oneOf-20', 'mount'], ['sample-0', 'mount'],
  ['sample-0', 'first'], ['sample-0', 'later'], ['nested-d5-f4', 'first'], ['nested-d5-f4', 'later'],
  ['oneOf-40', 'first'], ['oneOf-40', 'later']];
const canonical = fs.readFileSync(path.resolve(directory, '../profile-104-owned/summarize.mjs'), 'utf8');
const begin = canonical.indexOf('function bootstrap(values)'), end = canonical.indexOf('\nconst builds =', begin);
assert(begin >= 0 && end > begin);
const bootstrapSource = canonical.slice(begin, end).replace('ci95: [medians[49], medians[1949]],',
  'ci95: [medians[49], medians[1949]], ci99: [medians[9], medians[1989]],');
const bootstrap = new Function('assert', 'started', 'median', bootstrapSource + '\nreturn bootstrap;')(assert, started, median);
const phase = process.argv[2];
const comparator = phase === 'AA' ? 'control' : 'working';
const builds = { head: read(`${phase}-build-head`), working: read(`${phase}-build-${comparator}`) };
if (phase === 'AA') assert.equal(builds.head.bundleSha256, builds.working.bundleSha256);
const rows = [], processes = [];
for (const [name, mode] of operations) {
  const deltas = [], base = [], working = [];
  for (let run = 1; run <= 9; run++) {
    const row = read(`${phase}-forced-${name}-${mode}-r${run}`);
    assert.equal(row.HEAD, 'e27f4b3b7e4c975adca702539889335f0b478fae');
    assert.equal(row.warmup, 20); assert.equal(row.samples, 101); assert.equal(row.freshProcess, true);
    assert.equal(row.forcedGCOutsideClock, true); assert.equal(row.comparator, comparator);
    assert.equal(row.windows.length, 202); assert.equal(row.pairedDeltasMs.length, 101);
    assert.equal(row.observations.head, row.observations.working);
    assert.equal(row.bundleSha256.head, builds.head.bundleSha256);
    assert.equal(row.bundleSha256.working, builds.working.bundleSha256);
    for (let index = 0; index < 101; index++) {
      assert.equal(row.pairedDeltasMs[index], row.timingsMs.head[index] - row.timingsMs.working[index]);
      const first = (index + run - 1) % 2 ? 'working' : 'head';
      assert.equal(row.windows[2 * index].version, first);
      assert.equal(row.windows[2 * index + 1].version, first === 'head' ? 'working' : 'head');
    }
    deltas.push(...row.pairedDeltasMs);
    base.push(...row.timingsMs.head.map(value => value - row.empty));
    working.push(...row.timingsMs.working.map(value => value - row.empty));
    const process = read(`${phase}-process-pair-forced-${name}-${mode}-${run}-${comparator}`);
    assert.equal(process.status, 0); assert.equal(process.signal, null); assert(process.elapsedMs < 480000);
    processes.push(process);
  }
  assert.equal(deltas.length, 909);
  const pooled = bootstrap(deltas), baseMedianMs = median(base);
  const aaStatisticMs = phase === 'AA' ? pooled.center : read('AA-summary').rows.find(row => row.name === name && row.mode === mode).pooledMedianMs;
  const floorMs = baseMedianMs * 0.005;
  const improved = phase !== 'AA' && pooled.ci99[0] > 0 && pooled.center > aaStatisticMs;
  const regression = phase !== 'AA' && pooled.ci99[1] < 0 && Math.abs(pooled.center) > Math.max(Math.abs(aaStatisticMs), floorMs);
  rows.push({ name, mode, pairs: 909, pooledMedianMs: pooled.center, ci99Ms: pooled.ci99, baseMedianMs,
    workingMedianMs: median(working), aaStatisticMs, floorMs, improved, regression,
    verdict: phase === 'AA' ? 'A/A 대조' : regression ? '회귀' : improved ? '개선' : '채택 조건 미충족' });
}
const result = { HEAD: builds.head.HEAD, phase, design: { runs: 9, warmup: 20, samples: 101,
  bootstrapTrials: 1999, bootstrapSeed: 101, canonicalSha256: sha(canonical), mode: 'production', difference: 'H−W' },
  builds, rows, adopted: phase !== 'AA' && rows.some(row => row.improved) && !rows.some(row => row.regression), processes };
const output = JSON.stringify(result, null, 2) + '\n'; assert(Buffer.byteLength(output) <= 5_000_000);
fs.writeFileSync(path.join(directory, phase + '-summary.json'), output);
console.log(`판정 ${phase}: ${phase === 'AA' ? '대조 완료' : result.adopted ? '채택' : '기각'}`);
for (const row of rows) console.log(`${row.name} ${row.mode}: ${row.pooledMedianMs.toFixed(6)} [${row.ci99Ms.map(x=>x.toFixed(6)).join(', ')}], A/A ${row.aaStatisticMs.toFixed(6)}, 0.5% ${row.floorMs.toFixed(6)}: ${row.verdict}`);
