// CLI reduction of the two fresh-process React passes; output is transported to a native artifact write.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { directory, rawDirectory, HEAD, median, percentile } from './runtime.mjs';

const fixtures = ['sample-0', 'sample-1', 'sample-2', 'sample-3', 'flat-50', 'flat-100', 'flat-500',
  'nested-d3-f4', 'nested-d5-f4', 'array-100', 'array-500', 'array-1000', 'oneOf-5', 'oneOf-10', 'oneOf-20',
  'array-push-100', 'array-replace-200', 'array-push-remove-100', 'computed-visible-derived'];
const rows = [], assertionRows = [];
let digestPairs = 0, checkedWrites = 0, failedWrites = 0;
for (const fixture of fixtures) {
  const loaded = {};
  for (const lane of ['immediate', 'record']) {
    loaded[lane] = { HEAD: [], '0.16.0': [] };
    for (let run = 1; run <= 3; run++) {
      const pair = JSON.parse(fs.readFileSync(path.join(rawDirectory, `pair-${lane}-${fixture}-r${run}.json`), 'utf8'));
      assert(pair.equivalent); assert(pair.workers.every(w => [0, 2].includes(w.exit) && w.signal === null));
      assert.equal(pair.order.join('/'), run === 2 ? 'HEAD/0.16.0' : '0.16.0/HEAD');
      const versions = [];
      for (const version of ['0.16.0', 'HEAD']) {
        const data = JSON.parse(fs.readFileSync(path.join(rawDirectory, `react-${lane}-${fixture}-r${run}-${version}.json`), 'utf8'));
        assert.equal(data.head, HEAD); assert.equal(data.environment.warmup, 20); assert.equal(data.environment.samples, 101);
        assert(data.environment.profiling && data.environment.gcOutsideClock);
        for (const field of ['render-mount-wall', 'render-update-wall', 'render-mount-active', 'render-update-active']) {
          assert.equal(data.timing[field].length, 101); assert(data.timing[field].every(v => Number.isFinite(v) && v >= 0));
        }
        assert.equal(data.writes.length, 101);
        data.writes.forEach((writes, index) => {
          assert(writes.length && writes.every(w => Number.isFinite(w.wallMs) && Number.isFinite(w.activeMs)));
          assert(Math.abs(writes.reduce((sum, w) => sum + w.wallMs, 0) - data.timing['render-update-wall'][index]) < 1e-8);
          assert(Math.abs(writes.reduce((sum, w) => sum + w.activeMs, 0) - data.timing['render-update-active'][index]) < 1e-8);
        });
        checkedWrites += data.assertions.checkedWrites; failedWrites += data.assertions.failedWrites;
        loaded[lane][version].push(data); versions.push(data);
      }
      assert.deepEqual(versions[0].observations, versions[1].observations); digestPairs++;
    }
  }
  const assertions = ['0.16.0', 'HEAD'].map(version => {
    const data = loaded.immediate[version];
    return { version, expected: data[0].assertions.expectedCommitsPerWrite,
      failures: data.reduce((sum, row) => sum + row.assertions.failedWrites, 0),
      observedPerWrite: Array.from({ length: data[0].writes[0].length }, (_, write) => ({ write,
        counts: data.flatMap(row => row.writes.map(sample => sample[write].commits))
          .filter((value, index, values) => values.indexOf(value) === index).sort((a, b) => a - b) })),
      recordFailures: loaded.record[version].reduce((sum, row) => sum + row.assertions.failedWrites, 0) };
  });
  assertionRows.push({ fixture, assertions });
  for (const phase of ['mount', 'update']) {
    const metrics = {};
    for (const column of ['wall', 'active']) {
      const field = 'render-' + phase + '-' + column;
      const base = loaded.immediate['0.16.0'].map(data => data.timing[field]);
      const candidate = loaded.immediate.HEAD.map(data => data.timing[field]);
      const ratioRuns = base.map((values, index) => median(candidate[index]) / median(values));
      const baseValues = base.flat(), candidateValues = candidate.flat(), target = phase === 'mount' ? 1.2 : 1;
      metrics[column] = { baseMedianMs: median(baseValues), headMedianMs: median(candidateValues),
        baseP99Ms: percentile(baseValues, .99), headP99Ms: percentile(candidateValues, .99),
        pooledRatio: median(candidateValues) / median(baseValues), ratioRuns, target,
        timeMiss: ratioRuns.every(value => value > target),
        tied: ratioRuns.some(value => value > target) && ratioRuns.some(value => value <= target) };
    }
    const recordBase = loaded.record['0.16.0'].map(data => data.timing['render-' + phase + '-wall']);
    const recordHead = loaded.record.HEAD.map(data => data.timing['render-' + phase + '-wall']);
    rows.push({ fixture, phase, samples: 303, usable: phase === 'mount' || assertions.every(row => row.failures === 0), metrics,
      record: { baseMedianMs: median(recordBase.flat()), headMedianMs: median(recordHead.flat()),
        pooledRatio: median(recordHead.flat()) / median(recordBase.flat()),
        ratioRuns: recordBase.map((values, index) => median(recordHead[index]) / median(values)) } });
  }
}
const result = { HEAD, measuredAt: new Date().toISOString(), columns: ['four-immediate wall', 'eventLoopUtilization active'],
  runs: 3, warmup: 20, samplesPerRun: 101, digestPairs, checkedWrites, failedWrites, assertions: assertionRows, rows,
  failedFixtures: assertionRows.filter(row => row.assertions.some(v => v.failures)).map(row => row.fixture),
  missedWall: rows.filter(row => row.usable && row.metrics.wall.timeMiss).map(row => row.fixture + '/' + row.phase),
  missedActive: rows.filter(row => row.usable && row.metrics.active.timeMiss).map(row => row.fixture + '/' + row.phase),
  invalidUpdates: rows.filter(row => !row.usable).map(row => row.fixture + '/' + row.phase) };
console.log('RESULT ' + JSON.stringify({ digestPairs, checkedWrites, failedWrites, failed: assertionRows.filter(row => row.assertions.some(v => v.failures)), missedWall: result.missedWall, missedActive: result.missedActive }));
console.log('ARTIFACT ' + JSON.stringify({ name: 'react-summary.json', value: result }));
